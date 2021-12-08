import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import { Button, Typography } from "@material-ui/core";
import { BuyStocksTextField } from "../../utils/helpers";
import { InputAdornment } from "@material-ui/core";
import { Business, MonetizationOn, Add } from "@material-ui/icons";
import { changeStock } from "../../reducers/buyingStockReducer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../..";
import { useDebounce } from "use-debounce";
import { useMutation } from "@apollo/client";
import { BUY_STOCK } from "../../graphql/queries";
import { HandleBlurType, HandleChangeType, BuyStockValuesType } from "../../tsUtils/types";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import * as Yup from "yup";
import { buyFirstStock } from "../../reducers/firstBuyReducer";
import { AnimateKeyframes } from "react-simple-animate";
import notification from "../../utils/notification";
import useStyles from "./buyStocksRouteStyles.module";
import { parsePrice, parseAmount, parseCompany } from "../../tsUtils/typeGuards";

// This is a component that is used to organize the purchase of stocks
// and the Buy Stocks -page.



// This component is to format the string that shows the total price of the purchase.
const FinalInformation = ({price, amount}: {price: number; amount: string;}): JSX.Element => {
    // Parsing price and amount to numbers.
    const parsedPrice = parsePrice(price);
    const parsedAmount = parseAmount(amount);
    // Initializing the string that will be returned.
    let totalSum = "Total: 0.00";
    // If the price and amount are not empty, the total sum is calculated
    // and returned to the string. Otherwise, the string is returned with its
    // default value.
    if (parsedPrice !== 0 && parsedAmount !== "0" && parsedAmount !== "") {
        totalSum = `Total: ${(parsedPrice * parseFloat(parsedAmount)).toFixed(2)}$`;
    }
    return (
        <Typography className={"finalInformationTypography"}>
            {totalSum}
        </Typography>
    );
};
// This component returns text field for the price per stock (automatically generated).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PricePerStock = ({ price, handleChange }: {
    price: number;
    handleChange: HandleChangeType;
}): JSX.Element => {
    // Returning the custom-made text field.
    return (
        <BuyStocksTextField
            id="price_per_stock"
            type="price_per_stock"
            variant="outlined"
            label="Price per stock"
            onChange={handleChange}
            value={price}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <MonetizationOn />
                    </InputAdornment>
                ),
            }}
        />
    );
};

// This component returns text field for the company name.
const Company = ({
    companyName,
    handleChange,
    setIsDisabled,
    currentName,
    handleBlur,
}: {
  handleChange: HandleChangeType
  companyName: string;
  setIsDisabled: (boo: boolean) => void;
  currentName: string;
  handleBlur: HandleBlurType;
}): JSX.Element => {
    // Initializing a state for the company name and parsing company.
    const parsedCompany = parseCompany(companyName);
    const [name, setName] = useState(parsedCompany);
    // Creating a new Dispatch-object.
    const dispatch = useDispatch();
    // We use the debounce-function to make sure that the company name is not
    // sent to the server every time the user types a letter. We only send it
    // when the user has stopped typing for a 1,5 seconds.
    const [debounceName] = useDebounce(name, 1500);
    // In this useEffect, we check if the company name is not empty and if it
    // is not empty, we update the previously created name-state. And after that
    // if the currentName doesn't update for 1,5 seconds, debounceName changes its value
    // to the name, whose value is originally currentName's value.
    useEffect(() => {
        if (currentName === "") {
            setName("");
        }
    }, [currentName]);
    // When the debounceName changes, we send its value to the server and enable the BUY-button.
    useEffect(() => {
        dispatch(changeStock(debounceName));
        setIsDisabled(false);
    }, [debounceName]);
    // When the value of the company name changes, we update the name-state and use the 
    // handleChange in the top-component BuyStocks.
    const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsDisabled(true);
        
        setName(event.target.value);
        handleChange(event);
    };
    // Returning the custom-made text field.
    return (
        <div>
            <BuyStocksTextField
                id="company"
                autoComplete="off"
                type="company"
                onBlur={handleBlur}
                variant="outlined"
                name="company"
                label="Company"
                onChange={onChange}
                value={name}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Business />
                        </InputAdornment>
                    ),
                }}
            />
        </div>
    );
};
// This is the validation schema (made with yup) for our form.
const ValidationSchema = Yup.object().shape({
    // Company's name is required.
    company: Yup.string()
        .required("Required field."),
    // Amount is required and must be a positive integer.
    amount: Yup.number()
        .required("Required field.")
        .transform((value: string) => parseInt(value))
        .integer("Must be a positive integer.")
        .min(1, "Amount must be at least one."),
});
// This component returns the whole form. We use Redux here a lot because our form must
// cooperates with MainChart-component and we need a more global state. We use Formik as well.
const BuyStocks = (): JSX.Element => {
    const styles = useStyles();
    // Redux-state for the price.
    const price = useSelector<RootState, number>(
        (state) => state.stock.stockPrice
    );
    // Redux-state for the company name.
    const currentName = useSelector<RootState, string>(
        (state) => state.stock.stockName
    );
    // Initial values for the Formik-form.
    const initialValues: BuyStockValuesType = {
        company: "",
        amount: "1",
        price_per_stock: "",
    };
    // Used useMutation-hook for the buyStock-mutation and its results.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [buyStock, { data, loading, error }] = useMutation(BUY_STOCK);
    // Disabled/enabled-state for the BUY-button.
    const [isDisabled, setIsDisabled] = useState(false);
    // Dispatch-object for Redux.
    const dispatch = useDispatch();
    // Redux-state to check whether this is the first purchase of this user (do we show animations?).
    const purchase = useSelector<RootState, boolean>(
        (state): boolean => state.purchase
    );
    // Returning the whole form.
    return (
        <div>
            <Formik
                // Giving initialValues and ValidationSchema to Formik-component.
                initialValues={initialValues}
                validationSchema={ValidationSchema}
                onSubmit={(values) => {
                    // After submit, we show a confirmation popup.
                    confirmAlert({
                        title: "Confirmation",
                        message: `Are you sure you want to purchase ${
                            values.amount
                        } x ${currentName.toUpperCase()} (${(
                            price * parseInt(values.amount)
                        ).toFixed(2)}$)?`,
                        buttons: [
                            {
                                label: "Yes",
                                onClick: async () => {
                                    // When the user clicks on "Yes", we send the data to the server.
                                    // If this doesn't work, we show an error-popup.
                                    try {
                                        await buyStock({
                                            variables: {
                                                stockName: currentName.toUpperCase(),
                                                amount: parseInt(values.amount),
                                            },
                                        });
                                        dispatch(changeStock(""));
                                        dispatch(buyFirstStock());
                                        notification(
                                            "Success",
                                            `You purchased: ${
                                                values.amount
                                            } x ${currentName.toUpperCase()}.`,
                                            "success"
                                        );
                                    } catch (e: unknown) {
                                        notification(
                                            "Error",
                                            (e as Error).message || "Something went wrong.",
                                            "danger"
                                        );
                                    }
                                },
                            },
                            {
                                label: "No",
                                onClick: () => {
                                    // When the user clicks on "No", we show a notification.
                                    notification(
                                        "Canceled",
                                        "The purchase was canceled.",
                                        "info"
                                    );
                                },
                            },
                        ],
                    });
                }}
            >
                {({ handleSubmit, values, handleChange, errors, touched, handleBlur,}) => (
                    // Form and its error texts. If this is the first purchase, we show custom-made
                    // animations. Error text are only shown, if yup detects and the field
                    // is touched. MUI-Buttons' styles were difficult to overide so I used
                    // inline-styles.
                    <form onSubmit={handleSubmit}>
                        <Company
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            setIsDisabled={(val: boolean) => setIsDisabled(val)}
                            companyName={values.company}
                            currentName={currentName}
                        />
                        {errors.company && touched.company ? (
                            <div className={styles.errorColor}>{errors.company}</div>
                        ) : null}
                        <p></p>
                        <BuyStocksTextField
                            id="amount"
                            type="number"
                            variant="outlined"
                            label="Amount"
                            onChange={handleChange}
                            value={values.amount}
                            onBlur={handleBlur}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Add />
                                    </InputAdornment>
                                ),
                                inputProps: { min: 0 },
                            }}
                        />
                        {errors.amount && touched.amount ? (
                            <div className={"errorColor"}>{errors.amount}</div>
                        ) : null}
                        <p></p>
                        <PricePerStock price={price} handleChange={handleChange} />
                        <FinalInformation price={price} amount={values.amount} />
                        {!purchase && currentName ? (
                            <div>
                                <AnimateKeyframes
                                    play
                                    iterationCount="infinite"
                                    keyframes={["opacity: 0", "opacity: 1"]}
                                    duration={3}
                                >
                                    <Button
                                        disabled={isDisabled}
                                        variant="contained"
                                        type="submit"
                                        className={styles.buyStockFormButton}
                                    >
                                        Buy
                                    </Button>
                                    <Typography className={"animationLastTypography"}>
                                        {"Press buy and confirm."}
                                    </Typography>
                                </AnimateKeyframes>
                            </div>
                        ) : (
                            <Button
                                disabled={isDisabled}
                                variant="contained"
                                type="submit"
                                className={styles.buyStockFormButton}
                            >
                                Buy
                            </Button>
                        )}
                        <p></p>
                    </form>
                )}
            </Formik>
        </div>
    );
};

export default BuyStocks;
