import React from "react";
import Chart from 'react-apexcharts'
import { useQuery } from "@apollo/client";
import { INDIVIDUAL_STOCK } from "../graphql/queries";

const MainChart = (props: {stock: {stockName: string, stockPrice: number}}): JSX.Element => {
    const {data, loading} = useQuery(INDIVIDUAL_STOCK, {variables: {company: props.stock}})
    console.log(props)
    if (loading) {<div></div>}
    if (!data) {<div></div>}

    let stockList = []
    if (data) {
        stockList = data.individualStock.map((b: {__typename: string, close: number, date: string}): {close: number, date: string} => {return {close: b.close, date: b.date}})
    }

    
    const myString = 'zoom'
    const myOption: "zoom" | "selection" | "pan" | undefined = myString as "zoom" | "selection" | "pan" | undefined 

    const myDateOption = 'datetime'
    const myOption2: "datetime" | "category" | "numeric" | undefined = myDateOption as "datetime" | "category" | "numeric" | undefined

    const options = {
        chart: {
          id: 'tesla_börse',
          fontFamily: 'Roboto',
          background: 'FFFFFF',
          toolbar: {
            show: true,
            offsetX: 0,
            offsetY: 0,
            tools: {
              download: false,
              selection: false,
              zoom: '<img src="https://image.flaticon.com/icons/png/512/1086/1086933.png" style="padding-top: 3px;" width="22">',
              zoomin: false,
              zoomout: false,
              pan: '<img src="https://image.flaticon.com/icons/png/512/1/1427.png" width="30">',
              reset: '<img src="https://image.flaticon.com/icons/png/512/32/32303.png" width="22" style="padding-top: 3px;">'
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
                rotate: 0
            }
        }
    }
    const series = [{
        name: props.stock.stockName.toUpperCase(),
        data: stockList.map((y: {close: number, date: string}) => y.close) || [0],
    }]

    return (
        <div>
            <Chart 
                options={options}
                series={series}
                type='line'
                height={350}
            />
        </div>
    )
}

export default MainChart