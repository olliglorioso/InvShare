import React from "react";
import { Typography, Button, TextField } from "@material-ui/core";
import Chart from "react-apexcharts"
import { OldDataType } from "../types";
import { Formik } from "formik"
import { withStyles } from "@material-ui/styles"

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

const OldData = ({datas, loading}: {datas: OldDataType, loading: boolean}) => {
    if (!datas) {
        return <div></div>
    }
    console.log(loading)
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


    if (!datas) {
        return <div>loading.....</div>
    }
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
                    console.log(input)
                }}
            >
                {({
                    handleSubmit, values, handleChange
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
                        />
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