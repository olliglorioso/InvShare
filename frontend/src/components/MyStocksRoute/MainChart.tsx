import React from "react";
import Chart from "react-apexcharts"
import { useQuery } from "@apollo/client";
import { INDIVIDUAL_STOCK } from "../../graphql/queries";
import { useDispatch } from "react-redux";
import { changePrice } from "../../reducers/buyingStockReducer";
import { useEffect } from "react";
import { Typography } from "@material-ui/core";
import LoadingAnimation from "../Other/LoadingAnimation"
import leadingZeros, {myOption2, options} from "../Other/helpers";

const MainChart = (props: {stock: string}): JSX.Element => {
    const {data, loading, ...rest} = useQuery(INDIVIDUAL_STOCK, {variables: {company: props.stock}} )
    const dispatch = useDispatch()
    let stockList: {close: number, date: string}[]= []
    if (data) {
        stockList = data.individualStock.map((b: {__typename: string, close: number, date: string}): {close: number, date: string} => {return {close: b.close, date: b.date}})
    }

    useEffect(() => {
        if (stockList && stockList[stockList.length - 1] !== undefined) {
            dispatch(changePrice(stockList[stockList.length - 1].close))
        }
        if (stockList && stockList.length === 0) {
            dispatch(changePrice(0))
        }
    },[data])
  
    const options2 = {...options,
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
            
            {
                loading
                    ? <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "50vh"}}><LoadingAnimation type={"spin"} color={"black"}/></div>
                    : rest.error && rest?.error.graphQLErrors[0].message !== "Incorrect or missing symbol."
                        ? <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", color: "red"}}>{rest.error.graphQLErrors[0].message}</div>
                        :   <Chart 
                            options={options2}
                            series={series}
                            type="line"
                            height={300}
                        />
            }
        </div>
    )
}

export default MainChart