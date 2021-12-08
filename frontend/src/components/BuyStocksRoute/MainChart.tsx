import React from "react";
import Chart from "react-apexcharts";
import { useQuery } from "@apollo/client";
import { INDIVIDUAL_STOCK } from "../../graphql/queries";
import { useDispatch } from "react-redux";
import { changePrice } from "../../reducers/buyingStockReducer";
import { useEffect } from "react";
import { Typography } from "@material-ui/core";
import LoadingAnimation from "../Other/LoadingAnimation";
import leadingZeros, { finalMyDateOption, options } from "../../utils/helpers";
import useStyles from "./buyStocksRouteStyles.module";
import { parseCompany } from "../../tsUtils/typeGuards";

// This component returns chart that is shown to the user before purchasing a stock.
const MainChart = (props: { stock: string }): JSX.Element => {
    // Importing styles.
    const styles = useStyles();
    // Parsing the stock name.
    const parsedStock = parseCompany(props.stock);
    // With useQuery we run individualStock-query from the backend. We give
    // company name as a variable (it comes from BuyStocks-component's form).
    const { data, loading, ...rest } = useQuery(INDIVIDUAL_STOCK, {
        variables: { company: parsedStock },
    });
    // We use useDispatch's dispatch to dispatch actions to the Redux store.
    const dispatch = useDispatch();
    // Initializing stockList for the ApexChart-library's options.
    let stockList: { close: number; date: string }[] = [];
    // If the data has loaded, we reformat it.
    if (data) {
        stockList = data.individualStock.map((b: {__typename: string, close: number, date: string
        }): { close: number; date: string } => {
            return { close: b.close, date: b.date };
        }
        );
    }
    // Every time the data from individualStock-query changes, we change the price per stock with Redux.
    useEffect(() => {
        if (stockList && stockList[stockList.length - 1] !== undefined) {
            dispatch(changePrice(stockList[stockList.length - 1].close));
        }
        if (stockList && stockList.length === 0) {
            dispatch(changePrice(0));
        }
    }, [data]);

    // Here we determine some options to be used in the chart, on top of the previously made options
    // we have imported.
    const finalOptions = {
        ...options,
        xaxis: {
            // INsert values for x-axis.
            categories: stockList.map((x: { close: number; date: string }) => x.date),
            type: finalMyDateOption,
            labels: {
                formatter: function (value: string) {
                    // Formatting the label for x-axis.
                    const a = new Date(value);
                    const xLabel = `${a.getDate()}.${a.getMonth()}, ${leadingZeros(
                        a.getHours()
                    )}:${leadingZeros(a.getMinutes())}`;
                    return xLabel;
                },
            },
        },
    };
    // These are the value for y-axis.
    const series = [
        {
            name: props.stock.toUpperCase(),
            data: stockList.map((y: { close: number; date: string }) =>
                y.close.toFixed(2)
            ) || [0],
        },
    ];
    // Returning the chart and checking if there are errors.
    return (
        <div>
            <Typography>Last 96 hours</Typography>
            {loading 
                ? 
                (
                    <div className={styles.loadingAnimationDiv}>
                        <LoadingAnimation type={"spin"} color={"black"} />
                    </div>
                ) 
                : rest.error && rest.error.graphQLErrors[0].message !== "Incorrect or missing symbol." 
                    ? 
                    (
                        <div className={styles.chartError}>
                            {rest.error.graphQLErrors[0].message}
                        </div>
                    ) 
                    : 
                    (
                        <Chart options={finalOptions} series={series} type="line" height={300} />
                    )
            }
        </div>
    );
};

export default MainChart;
