import React from "react";
import { Typography, Button} from "@material-ui/core";
import Chart from "react-apexcharts"
import { OldDataType } from "../../types";
import { Formik } from "formik"
import { AnalysisData} from "../../types";
import { useMutation } from "@apollo/client"
import {SELL_STOCK} from "../../graphql/queries"
import * as Yup from "yup"
import { confirmAlert } from "react-confirm-alert"
import "react-confirm-alert/src/react-confirm-alert.css"
import { CssTextField, options } from "../Other/helpers";
import notification from "../Other/Notification";

const OldData = ({datas, analysisData}: {datas: OldDataType, analysisData: AnalysisData[]}) => {
    const [sell, {...result}] = useMutation(SELL_STOCK)
    if (!datas) {
        return <div></div>
    }

    const dates = datas.time_series.map((o: {date: string, value: number}) => o.date)

    const myDateOption = "datetime"
    const myOption2: "datetime" | "category" | "numeric" | undefined = myDateOption as "datetime" | "category" | "numeric" | undefined

    const options2 = {
        ...options,
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
                    options={options2}
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
                                onClick: async () => {
                                    try {
                                        await sell({variables: {stockName: theStock.name, amount: parseInt(input.amount), price: lastPrice}})
                                        notification("Success.", `You sold: ${input.amount} x ${datas.metadata.symbol.toUpperCase()}.`, "success")
                                    } catch (e: unknown) {
                                        notification("An error occured", (e as Error).message, "danger")
                                    }
                                }
                            },
                            {
                                label: "No",
                                onClick: () => {
                                    notification("Canceled", "The sale was canceled.", "info")
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