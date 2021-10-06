import { List, ListItem, Typography } from "@material-ui/core"
import React from "react"
import Chart from "react-apexcharts"

const AnalysisChart = ({analysisData, positions, totalOriginalValue}: any) => {
    type CandleStock = {
        date: string,
        open: number,
        high: number,
        low: number,
        close: number,
        volume: number,
        __typename: string
    }

    const dates = analysisData[0].sticks.map((x: CandleStock) => x.date)
    let valueSeries: number[] = []

    dates.forEach((element: string, index: number) => {
        let sum = 0
        analysisData.forEach((element2: {name: string, __typename: "AnalysisData", sticks: CandleStock[]}, index2: number) => {
            sum = sum + (analysisData[index2].sticks[index].close * positions[index2].usersTotalAmount)
        })
        valueSeries = valueSeries.concat(parseFloat((100 * (-1 + Math.round(sum)/Math.round(totalOriginalValue))).toFixed(2)))
    })


    const myString = "zoom"
    const myOption: "zoom" | "selection" | "pan" | undefined = myString as "zoom" | "selection" | "pan" | undefined 

    const myDateOption = "datetime"
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
            categories: analysisData[0].sticks.map((x: {close: number, date: string, high: number, low: number, open: number, volume: number, __typename: string}) => x.date),
            type: myOption2,
            labels: {
                rotate: 0
            }
        },
    }
    const series = [{
        name: "Portfolio value (%)",
        data: valueSeries.map((x: number): number => x)
    }]

    return (
        <div >
            <Chart 
                options={options}
                series={series}
                type="line"
                height={300}
            />
            <List dense style={{display: "flex", flexDirection: "column"}}>
                {positions.map((x: {__typename: "Holding", usersStockName: {stockSymbol: string, stockTotalAmount: number, __typename: "Stock"}, usersTotalAmount: number, usersTotalOriginalPriceValue: number}) => {
                    const individStockProfit = Math.round(x.usersTotalOriginalPriceValue / x.usersTotalAmount)/analysisData.filter((y: {__typename: "AnalysisData", name: string, sticks: {close: number, date: string, high: number, low: number, open: number, volume: number, __typename: string}[]}) => y.name === x.usersStockName.stockSymbol)[0].sticks[analysisData[0].sticks.length - 1].close
                    return (
                        <ListItem divider key={x.usersTotalOriginalPriceValue}>
                            {1 - individStockProfit >= 0
                                ?
                                <Typography style={{color: "green", fontWeight: "bold", fontSize: 15, textAlign: "center"}}>
                                    {`${x.usersStockName.stockSymbol}: ${(1 - individStockProfit).toFixed(2)}`}
                                </Typography>
                                :
                                <Typography style={{color: "red", fontWeight: "bold", fontSize: 15, textAlign: "center"}}>
                                    {`${x.usersStockName.stockSymbol}: ${(1 - individStockProfit).toFixed(2)}`}
                                </Typography>
                            }
                            
                        </ListItem>)
                })}
            </List>
        </div>
    )
}

export default AnalysisChart