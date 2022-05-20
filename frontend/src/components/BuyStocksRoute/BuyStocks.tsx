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


export const FinalInformation = ({price, amount}: {price: number; amount: string;}): JSX.Element => {
    const parsedPrice = parsePrice(price);
    const parsedAmount = parseAmount(amount);
    let totalSum = "Total: 0.00";
    if (parsedPrice !== 0 && parsedAmount !== "0" && parsedAmount !== "") {
        totalSum = `Total: ${(parsedPrice * parseFloat(parsedAmount)).toFixed(2)}$`;
    }
    return (
        <Typography className={"finalInformationTypography"}>
            {totalSum}
        </Typography>
    );
};
const PricePerStock = ({ price, handleChange }: {
    price: number;
    handleChange: HandleChangeType;
}): JSX.Element => {
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
    const parsedCompany = parseCompany(companyName);
    const [name, setName] = useState(parsedCompany);
    const dispatch = useDispatch();
    const [debounceName] = useDebounce(name, 1500);
    useEffect(() => {
        if (currentName === "") {
            setName("");
        }
    }, [currentName]);
    useEffect(() => {
        dispatch(changeStock(debounceName));
        setIsDisabled(false);
    }, [debounceName]);
    const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsDisabled(true);
        
        setName(event.target.value);
        handleChange(event);
    };
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
const ValidationSchema = Yup.object().shape({
    company: Yup.string()
        .required("Required field."),
    amount: Yup.number()
        .required("Required field.")
        .transform((value: string) => parseInt(value))
        .integer("Must be a positive integer.")
        .min(1, "Amount must be at least one."),
});
const BuyStocks = (): JSX.Element => {
    const styles = useStyles();
    const price = useSelector<RootState, number>(
        (state) => state.stock.stockPrice
    );
    const currentName = useSelector<RootState, string>(
        (state) => state.stock.stockName
    );
    const initialValues: BuyStockValuesType = {
        company: "",
        amount: "1",
        price_per_stock: "",
    };
    const [buyStock, { data, loading, error }] = useMutation(BUY_STOCK);
    const [isDisabled, setIsDisabled] = useState(false);
    const dispatch = useDispatch();
    const purchase = useSelector<RootState, boolean>(
        (state): boolean => state.purchase
    );
    return (
        <div>
            <Formik
                initialValues={initialValues}
                validationSchema={ValidationSchema}
                onSubmit={(values) => {
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
                                id="buyStockButton"
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
