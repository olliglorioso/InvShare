import { List, ListItem, Typography, Switch, ListSubheader } from "@material-ui/core"
import React from "react"
import Chart from "react-apexcharts"
import { CandleStock } from "../types"
import { changeMode } from "../reducers/modeSwitchReducer"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from ".."
import AnalysisTable from "./AnalysisTable"


const AnalysisChart = ({analysisData, positions, totalOriginalValue}: any) => {

    const dates = analysisData[0].sticks.map((x: CandleStock) => x.date)
    let valueSeries: number[] = []
    const dispatch = useDispatch()
    const switchMode = useSelector<RootState, {mode: boolean}>((state) => state.mode)

    dates.forEach((element: string, index: number) => {
        let sum = 0
        analysisData.forEach((element2: {name: string, __typename: "AnalysisData", sticks: CandleStock[]}, index2: number) => {
            const valueToAdd = element2.sticks.filter((element3: any) => {
                return element3.date === element
            })
            if (valueToAdd.length > 0) {
                sum = sum + valueToAdd[0].close
            } else {
                sum = sum + element2.sticks[0].close
            }
        })
        valueSeries = valueSeries.concat(parseFloat((100*(-1 + sum/totalOriginalValue)).toFixed(2)))
    })

    const myString = "zoom"
    const myOption: "zoom" | "selection" | "pan" | undefined = myString as "zoom" | "selection" | "pan" | undefined 

    const myDateOption = "datetime"
    const myOption2: "datetime" | "category" | "numeric" | undefined = myDateOption as "datetime" | "category" | "numeric" | undefined

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
            <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                <Typography>
                    Last 48 hours
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
            <AnalysisTable analysisData={analysisData} positions={positions} />
        </div>
    )
}

export default AnalysisChart