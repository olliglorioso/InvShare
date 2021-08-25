import React from "react";
import { useFormik } from "formik";
import { withStyles } from "@material-ui/styles";
import { TextField, Button } from "@material-ui/core";
import { Autocomplete } from '@material-ui/lab'
import { InputAdornment } from "@material-ui/core";
import { Business, MonetizationOn, Add } from "@material-ui/icons";
import { changeStock } from "../reducers/buyingStockReducer";
import { useDispatch } from "react-redux";
import { useState } from "react";

const CssTextField = withStyles({
    root: {
      '& label.Mui-focused': {
        color: 'grey',
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: 'black',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'grey',
        },
        '&:hover fieldset': {
          borderColor: 'grey',
        },
        '&.Mui-focused fieldset': {
          borderColor: 'black',
        },
      },
    },
})(TextField);

const BuyStocks = (props: {price: number}): JSX.Element => {
    const dispatch = useDispatch()

    const formik = useFormik({
        initialValues: {
          company: '',
          amount: '',
          price_per_stock: ''
        },
        onSubmit: async (values: {company: string, amount: string, price_per_stock: string}) => {
          console.log(values)
          dispatch(changeStock(values.company))
        },
      });
    return (
        <form onSubmit={formik.handleSubmit}>
            <CssTextField
                id="company"
                type="company"
                variant="outlined"
                label="Company"
                onChange={formik.handleChange}
                value={formik.values.company}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Business />
                        </InputAdornment>
                    )
                }}
            />
            <p></p>
            <Button variant="contained" type="submit" style={{background: 'black', color: 'white', width: 255}}>Search</Button>
            <p></p>
            <CssTextField
                id="amount"
                type="amount"
                variant="outlined"
                label="Amount"
                onChange={formik.handleChange}
                value={formik.values.amount}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Add />
                        </InputAdornment>
                    )
                }}
            />
            <p></p>
            <CssTextField
                id="price_per_stock"
                type="price_per_stock"
                variant="outlined"
                label="Price per stock"
                onChange={formik.handleChange}
                value={formik.values.price_per_stock}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <MonetizationOn />
                        </InputAdornment>
                    )
                }}
            />
            <p></p>
            <Button disabled={true} variant="contained" type="submit" style={{background: 'black', color: 'white', width: 255}}>Buy</Button>
            <p style={{fontSize: 20, alignContent: 'center'}}></p>
        </form>
        
      );
}

export default BuyStocks