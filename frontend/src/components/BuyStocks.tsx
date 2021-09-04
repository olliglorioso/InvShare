import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import { withStyles } from "@material-ui/styles";
import { TextField, Button, Typography } from "@material-ui/core";
import { InputAdornment } from "@material-ui/core";
import { Business, MonetizationOn, Add } from "@material-ui/icons";
import { changeStock } from "../reducers/buyingStockReducer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "..";
import { useDebounce } from "use-debounce"
import { useMutation } from "@apollo/client";
import { BUY_STOCK } from "../graphql/queries"

interface MyFormValues {
    company: string,
    amount: string,
    price_per_stock: string
}

const CssTextField = withStyles({
    root: {
        "& label.Mui-focused": {
            color: "grey",
        },
        "& .MuiInput-underline:after": {
            borderBottomColor: "black",
        },
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                borderColor: "grey",
            },
            "&:hover fieldset": {
                borderColor: "grey",
            },
            "&.Mui-focused fieldset": {
                borderColor: "black",
            },
        },
    },
})(TextField);

const FinalInformation = ({price, amount}: {price: number, amount: string}) => {
    let totalSum = "Total: 0.00"
    if (price !== 0 && amount !== "0" && amount !== "") {
        totalSum = `Total: ${(price * parseFloat(amount)).toFixed(2)}$`
    }
    return (
        <Typography style={{paddingTop: 5, paddingBottom: 5}}>{totalSum}</Typography>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PricePerStock = ({price, handleChange}: {price: number, handleChange: any}) => {
    let cPrice = price
    useEffect(() => {
        cPrice = price
    }, [price])

    return (
        <CssTextField
            id="price_per_stock"
            type="price_per_stock"
            variant="outlined"
            label="Price per stock"
            onChange={handleChange}
            value={cPrice}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <MonetizationOn />
                    </InputAdornment>
                )
            }}
        />
    )
}

const Company = ({companyName}: {companyName: string}) => {
    const [name, setName] = useState(companyName)
    const dispatch = useDispatch()
    const [debounceName] = useDebounce(name, 2000)

    useEffect(() => {
        dispatch(changeStock(debounceName))
    }, [debounceName])

    const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value)
    }

    return (
        <div>
            <CssTextField
                id="company"
                autoComplete="off"
                type="company"
                variant="outlined"
                label="Company"
                onChange={onChange}
                value={name}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Business />
                        </InputAdornment>
                    )
                }}
            />
        </div>
    )
}

const BuyStocks = (): JSX.Element => {
    const price = useSelector<RootState, number>((state) => state.stock.stockPrice)
    const cName = useSelector<RootState, string>((state) => state.stock.stockName)
    const initialValues: MyFormValues = { company: "", amount: "1", price_per_stock: "" };
    const [buyStock] = useMutation(BUY_STOCK)
    return (
        <div>
            <Formik
                initialValues={initialValues}
                onSubmit={(values) => {
                    buyStock({variables: {stockName: cName.toUpperCase(), amount: parseInt(values.amount)}})
                }}
            >
                {({
                    handleSubmit, values, handleChange
                }) => (
                    <form onSubmit={handleSubmit}>
                        <Company companyName={values.company}/>
                        <p></p>
                        <CssTextField
                            id="amount"
                            type="number"
                            variant="outlined"
                            label="Amount"
                            onChange={handleChange}
                            value={values.amount}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Add />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <p></p>
                        <PricePerStock price={price} handleChange={handleChange} />
                        <FinalInformation price={price} amount={values.amount} />
                        <Button variant="contained" type="submit" style={{background: "black", color: "white", width: 255}}>Buy</Button>
                        <p style={{fontSize: 20, alignContent: "center"}}></p>
                    </form>
                )}
            </Formik>
        </div>
    )

}

export default BuyStocks