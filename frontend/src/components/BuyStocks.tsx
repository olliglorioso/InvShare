import React, { useEffect, useState } from "react"
import { Formik } from "formik"
import { withStyles } from "@material-ui/styles"
import { TextField, Button, Typography } from "@material-ui/core"
import { InputAdornment } from "@material-ui/core"
import { Business, MonetizationOn, Add, ArrowRightAlt } from "@material-ui/icons"
import { changeStock } from "../reducers/buyingStockReducer"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from ".."
import { useDebounce } from "use-debounce"
import { useMutation } from "@apollo/client"
import { BUY_STOCK } from "../graphql/queries"
import { MyFormValues } from "../types"
import { store } from "react-notifications-component"
import "react-notifications-component/dist/theme.css"
import { confirmAlert } from "react-confirm-alert"
import "react-confirm-alert/src/react-confirm-alert.css"
import * as Yup from "yup"
import { buyFirstStock } from "../reducers/firstBuyReducer"

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

const Company = ({companyName, handleChange, setIsDisabled, cName}: {handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void, companyName: string, setIsDisabled: (boo: boolean) => void, cName: string}) => {
    const [name, setName] = useState(companyName)
    const dispatch = useDispatch()
    const [debounceName] = useDebounce(name, 1500)

    useEffect(() => {
        if (cName === "") {
            setName("")
        }

    }, [cName])

    useEffect(() => {
        dispatch(changeStock(debounceName))
        setIsDisabled(false)
    }, [debounceName])

    const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsDisabled(true)
        setName(event.target.value)
        handleChange(event)
    }

    return (
        <div>
            <CssTextField
                id="company"
                autoComplete="off"
                type="company"
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
                    )
                }}
            />
        </div>
    )
}

const ValidationSchema = Yup.object().shape({
    company: Yup.string()
        .required("Required field."),
    amount: Yup.number()
        .required("Required field.")
        .transform((value: string) => parseInt(value))
        .min(1, "Amount must be at least one.")
})

const BuyStocks = (): JSX.Element => {
    const price = useSelector<RootState, number>((state) => state.stock.stockPrice)
    const cName = useSelector<RootState, string>((state) => state.stock.stockName)
    const initialValues: MyFormValues = { company: "", amount: "1", price_per_stock: "" };
    const [buyStock, {data, loading, error}] = useMutation(BUY_STOCK)
    const [isDisabled, setIsDisabled] = useState(false)
    const dispatch = useDispatch()

    
    return (
        <div>
            <Formik
                initialValues={initialValues}
                validationSchema={ValidationSchema}
                onSubmit={(values) => {
                    confirmAlert({
                        title: "Confirmation",
                        message: `Are you sure you want to purchase ${values.amount} x ${cName.toUpperCase()} (${price * parseInt(values.amount)}$)?`,
                        buttons: [
                            {
                                label: "Yes",
                                onClick: () => {
                                    store.addNotification({
                                        title: "Success",
                                        message: `You purchased: ${values.amount} x ${cName.toUpperCase()}`,
                                        type: "success",
                                        insert: "top",
                                        container: "top-right",
                                        animationIn: ["animate__animated", "animate__fadeIn"],
                                        animationOut: ["animate__animated", "animate__fadeOut"],
                                        dismiss: {
                                            duration: 5000,
                                            onScreen: true
                                        }
                                    })
                                    buyStock({variables: {stockName: cName.toUpperCase(), amount: parseInt(values.amount)}})
                                    dispatch(changeStock(""))
                                    dispatch(buyFirstStock())
                                }
                            },
                            {
                                label: "No",
                                onClick: () => {
                                    store.addNotification({
                                        title: "Canceled",
                                        message: "The purchase was canceled.",
                                        type: "danger",
                                        insert: "top",
                                        container: "top-right",
                                        animationIn: ["animate__animated", "animate__fadeIn"],
                                        animationOut: ["animate__animated", "animate__fadeOut"],
                                        dismiss: {
                                            duration: 5000,
                                            onScreen: true
                                        }
                                    })
                                }
                            }
                        ]
                    });
                    
                }}
            >
                {({
                    handleSubmit, values, handleChange, errors, touched
                }) => (
                    <form onSubmit={handleSubmit}>
                        
                        <Company handleChange={handleChange} setIsDisabled={(val: boolean) => setIsDisabled(val)} companyName={values.company} cName={cName}/>
                        {
                            errors.company
                                ? <div style={{color: "red"}}>{errors.company}</div>
                                : null
                        }
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
                                ),
                                inputProps: {min: 0}
                            }}
                        />
                        {
                            errors.amount
                                ? <div style={{color: "red"}}>{errors.amount}</div>
                                : null
                        }
                        <p></p>
                        <PricePerStock price={price} handleChange={handleChange} />
                        <FinalInformation price={price} amount={values.amount} />
                        <Button disabled={isDisabled} variant="contained" type="submit" style={{background: "black", color: "white", width: 150}}>Buy</Button>
                        <p style={{fontSize: 20, alignContent: "center"}}></p>
                    </form>
                )}
            </Formik>
        </div>
    )

}

export default BuyStocks