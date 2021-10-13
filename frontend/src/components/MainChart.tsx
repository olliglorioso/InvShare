import React from "react";
import Chart from "react-apexcharts"
import { useQuery } from "@apollo/client";
import { INDIVIDUAL_STOCK } from "../graphql/queries";
import { useDispatch } from "react-redux";
import { changePrice } from "../reducers/buyingStockReducer";
import { useEffect } from "react";
import { Typography } from "@material-ui/core";


const MainChart = (props: {stock: string}): JSX.Element => {
    const {data, loading} = useQuery(INDIVIDUAL_STOCK, {variables: {company: props.stock}})
    const dispatch = useDispatch()
    if (loading) {<div></div>}
    if (!data) {<div></div>}

    let stockList: {close: number, date: string}[]= []
    if (data) {
        stockList = data.individualStock.map((b: {__typename: string, close: number, date: string}): {close: number, date: string} => {return {close: b.close, date: b.date}})
    }

    const leadingZeros = (num: number): string => {
        if (num < 10) {
            return "0" + num.toString()
        } else {
            return num.toString()
        }
    }

    useEffect(() => {
        if (stockList && stockList[stockList.length - 1] !== undefined) {
            dispatch(changePrice(stockList[stockList.length - 1].close))
        }
        if (stockList && stockList.length === 0) {
            dispatch(changePrice(0))
        }
    },[data])
  

    const myString = "zoom"
    const myOption: "zoom" | "selection" | "pan" | undefined = myString as "zoom" | "selection" | "pan" | undefined 

    const myDateOption = "category"
    const myOption2: "datetime" | "category" | "numeric" | undefined = myDateOption as "datetime" | "category" | "numeric" | undefined

    const options = {
        chart: {
            id: "börse",
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
            categories: stockList.map((x: {close: number, date: string}) => x.date),
            type: myOption2,
            labels: {
                formatter: function (value: string) {
                    const a = new Date(value)
                    const xLabel = `${a.getDate()}.${a.getMonth()}, ${leadingZeros(a.getHours())}:${leadingZeros(a.getMinutes())}`
                    return xLabel
                }, 
            }
        },
    }
    const series = [{
        name: props.stock.toUpperCase(),
        data: stockList.map((y: {close: number, date: string}) => y.close.toFixed(2)) || [0],
    }]
    return (
        <div>
            <Typography>Last 96 hours</Typography>
            <Chart 
                options={options}
                series={series}
                type="line"
                height={300}
            />
        </div>
    )
}

export default MainChart