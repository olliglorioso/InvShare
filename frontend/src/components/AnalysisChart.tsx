import { Typography, Switch} from "@material-ui/core"
import React from "react"
import Chart from "react-apexcharts"
import { AnalysisData, CandleStock, Positions } from "../types"
import { changeMode } from "../reducers/modeSwitchReducer"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from ".."
import AnalysisTable from "./AnalysisTable"
import OldData from "./OldData"
import { useLazyQuery } from "@apollo/client"
import { GET_PREDICTION } from "../graphql/queries"

const AnalysisChart = ({analysisData, positions, totalOriginalValue}: {analysisData: AnalysisData[], positions: Positions[], totalOriginalValue: number}) => {
    let stickcount = 0
    let least_sticks = analysisData[0]
    analysisData.forEach((element2: AnalysisData) => {
        if (element2.sticks.length < stickcount) {
            least_sticks = element2
            stickcount = least_sticks.sticks.length
        }
    })
    const dates = least_sticks.sticks.map((x: CandleStock) => x.date)
    let valueSeries: number[] = []
    const dispatch = useDispatch()
    const switchMode = useSelector<RootState, {mode: boolean}>((state) => state.mode)
    const [getData, {...res}] = useLazyQuery(GET_PREDICTION)

    console.log(res)

    dates.forEach((element: string) => {
        let sum = 0
        analysisData.forEach((element2: AnalysisData) => {
            const valueToAdd = element2.sticks.filter((element3: CandleStock) => {
                return element3.date === element
            })
            if (valueToAdd.length > 0) {
                sum = sum + valueToAdd[0].close * positions.filter((pos: Positions) => pos.usersStockName.stockSymbol === element2.name)[0].usersTotalAmount
            } else {
                let biggestDiff = 99999
                let stickToSum = element2.sticks[0]
                element2.sticks.forEach((e: CandleStock) => {
                    const time = Math.abs((new Date(e.date).getTime()-new Date(element).getTime()))
                    if (time < biggestDiff) {
                        biggestDiff = time
                        stickToSum = e
                    }
                })
                sum = sum + stickToSum.close * positions.filter((pos: Positions) => pos.usersStockName.stockSymbol === element2.name)[0].usersTotalAmount
            }
        })
        valueSeries = valueSeries.concat(parseFloat((100*(-1 + sum/totalOriginalValue)).toFixed(2)))
    })


    const myString = "zoom"
    const myOption: "zoom" | "selection" | "pan" | undefined = myString as "zoom" | "selection" | "pan" | undefined 

    const myDateOption = "category"
    const myOption2: "datetime" | "category" | "numeric" | undefined = myDateOption as "datetime" | "category" | "numeric" | undefined

    const leadingZeros = (num: number): string => {
        if (num < 10) {
            return "0" + num.toString()
        } else {
            return num.toString()
        }
    }

    const changeModeComp = () => {
        dispatch(changeMode())
    }

    const checkedOrNot = () => {
        if (switchMode.mode) {
            return true
        } else {
            return false
        }
    }

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
            categories: dates,
            type: myOption2,
            labels: {
                formatter: function (value: string) {
                    const a = new Date(value)
                    let xLabel: string
                    switchMode.mode === false
                        ?   xLabel = `${a.getDate()}.${a.getMonth()}, ${leadingZeros(a.getHours())}:${leadingZeros(a.getMinutes())}`
                        :   xLabel = `${a.getDate()}.${a.getMonth()}`
                    return xLabel
                }, 
            },
        },
        yaxis: {
            labels: {
                formatter: function (value: number) {
                    return `${value.toFixed(2)}%`
                },
            }
        }
    }
    const series = [{
        name: "Portfolio value (%)",
        data: valueSeries.map((x: number): number => x)
    }]

    const getPrediction = (symbol: string) => {
        getData({variables: {symbol}})
        return
    }

    return (
        <div >
            <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                <Typography>
                    Last 96 hours
                </Typography>
                <Switch 
                    color={"default"} 
                    checked={checkedOrNot()} 
                    onChange={() => changeModeComp()}
                ></Switch>
                <Typography>
                    Daily since first transaction
                </Typography>
            </div>
            <Chart 
                options={options}
                series={series}
                type="line"
                height={300}
            />
            <AnalysisTable getPrediction={getPrediction} analysisData={analysisData} positions={positions} />
            <div style={{width: "100%"}}>
                <OldData datas={res.data?.stockPrediction} loading={res.loading} />
            </div>
            
        </div>
    )
}

export default AnalysisChart