import React from "react";
import { Typography, Button, TextField } from "@material-ui/core";
import Chart from "react-apexcharts"
import { OldDataType } from "../types";
import { Formik } from "formik"
import { withStyles } from "@material-ui/styles"
import { AnalysisData, Positions } from "../types";
import { useMutation } from "@apollo/client"
import {SELL_STOCK} from "../graphql/queries"
import * as Yup from "yup"
import { confirmAlert } from "react-confirm-alert"
import "react-confirm-alert/src/react-confirm-alert.css"
import { store } from "react-notifications-component"


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

const OldData = ({datas, loading, analysisData, positions}: {datas: OldDataType, loading: boolean, analysisData: AnalysisData[], positions: Positions[]}) => {
    const [sell, {...result}] = useMutation(SELL_STOCK)
    if (!datas) {
        return <div></div>
    }
    const dates = datas.time_series.map((o: {date: string, value: number}) => o.date)

    const myString = "zoom"
    const myOption: "zoom" | "selection" | "pan" | undefined = myString as "zoom" | "selection" | "pan" | undefined 

    const myDateOption = "datetime"
    const myOption2: "datetime" | "category" | "numeric" | undefined = myDateOption as "datetime" | "category" | "numeric" | undefined

    const options = {
        chart: {
            id: "moi",
            fontFamily: "Roboto",
            background: "FFFFFF",
            toolbar: {
                show: true,
                offsetX: 0,
                offsetY: 0,
                tools: {
                    download: false,
                    selection: false,
                    zoom: "<img src=\"https://image.flaticon.com/icons/png/512/1086/1086933.png\" style=\"padding-top: 3px;\" width=\"22\">",
                    zoomin: false,
                    zoomout: false,
                    pan: "<img src=\"https://image.flaticon.com/icons/png/512/1/1427.png\" width=\"30\">",
                    reset: "<img src=\"https://image.flaticon.com/icons/png/512/32/32303.png\" width=\"22\" style=\"padding-top: 3px;\">"
                },
                autoSelected: myOption,
            },
        },
        colors: ["#000000", "#000000"],
        stroke: {
            width: 1
        },
        xaxis: {
            categories: dates,
            type: myOption2,
            labels: {
                rotate: 0
            }
        },
    }
    const series = [{
        name: "Value",
        data: datas.time_series.map((o: {date: string, value: number}) => o.value.toFixed(2))
    }]

    const ValidationSchema = Yup.object().shape({
        amount: Yup.number()
            .required("Required field.")
            .transform((value: string) => parseInt(value))
            .min(1, "Amount must be at least one.")
    })

    const theStock = analysisData.filter((o: AnalysisData): boolean => o.name === datas.metadata.symbol)[0]
    const lastPrice = theStock.sticks[theStock.sticks.length - 1].close
    return (
        <div style={{display: "flex", paddingTop: "5vh", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
            <Typography style={{fontSize: 20, fontWeight: "bold"}}>
                Old data: {datas.metadata.symbol} (last refresh: {datas.metadata.lastRefresh})
            </Typography>
            <div style={{width: "100%"}}>
                <Chart 
                    options={options}
                    series={series}
                    type="line"
                    height={300}
                />
            </div>
            <Formik
                initialValues={{
                    amount: ""
                }}
                onSubmit={(input: {amount: string}) => {
                    confirmAlert({
                        title: "Confirmation",
                        message: `Are you sure you want to sell ${input.amount} x ${datas.metadata.symbol.toUpperCase()} (${lastPrice * parseInt(input.amount)}$)?`,
                        buttons: [
                            {
                                label: "Yes",
                                onClick: () => {
                                    if (!result.error) {
                                        store.addNotification({
                                            title: "Success",
                                            message: `You sold: ${input.amount} x ${datas.metadata.symbol.toUpperCase()}`,
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
                                        sell({variables: {stockName: theStock.name, amount: parseInt(input.amount), price: lastPrice}})
                                    } else {
                                        store.addNotification({
                                            title: "An error occured.",
                                            message: result.error.message,
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
                            },
                            {
                                label: "No",
                                onClick: () => {
                                    store.addNotification({
                                        title: "Canceled",
                                        message: "The sale was canceled.",
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
                validationSchema={ValidationSchema}
            >
                {({
                    handleSubmit, handleBlur, values, handleChange, errors, touched
                }) => (
                    <form onSubmit={handleSubmit}>
                        <p></p>
                        <CssTextField
                            id="amount"
                            type="number"
                            variant="outlined"
                            label="Amount"
                            onChange={handleChange}
                            value={values.amount}
                            style={{width: 150}}
                            onBlur={handleBlur}
                            InputProps={{
                                inputProps: {min: 0}
                            }}
                        />
                        {
                            errors.amount && touched.amount && <div style={{color: "red"}}>{errors.amount}</div>
                        }
                        <p></p>
                        <Typography style={{display: "flex", justifyContent: "center"}}>Sell {datas.metadata.symbol} for {lastPrice}$?</Typography>
                        <p></p>
                        <Button variant="contained" type="submit" style={{background: "black", color: "white", width: 150}}>Sell</Button>
                        <p style={{fontSize: 20, alignContent: "center"}}></p>
                    </form>
                )}

            </Formik>
        </div>
    )
}

export default OldData