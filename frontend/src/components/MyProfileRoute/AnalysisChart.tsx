import { Typography, Switch } from "@material-ui/core";
import React from "react";
import Chart from "react-apexcharts";
import { AnalysisData, CandleStock, Holdings } from "../../tsUtils/types";
import { changeMode } from "../../reducers/modeSwitchReducer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../..";
import AnalysisTable from "./AnalysisTable";
import OldData from "./OldData";
import { useLazyQuery } from "@apollo/client";
import { GET_OLD_DATA } from "../../graphql/queries";
import LoadingAnimation from "../Other/LoadingAnimation";
import leadingZeros, { finalMyDateOption, options } from "../../utils/helpers";
import useStyles from "./myProfileRouteStyles.module";
import notification from "../../utils/notification";

const AnalysisChart = ({
    analysisData,
    holdings,
    totalOriginalValue,
    isTogglable
}: {
  analysisData: AnalysisData[];
  holdings: Holdings[];
  totalOriginalValue: number;
  isTogglable: boolean
}) => {
    // Importing styles.
    const styles = useStyles();
    // Dispatch with useDispatch-hook.
    const dispatch = useDispatch();
    // To get historical data.
    const [getData, { ...res }] = useLazyQuery(GET_OLD_DATA);
    // Mode for chart is either hours or days.
    const chartMode = useSelector<RootState, { mode: boolean }>(
        (state) => state.mode
    );
    // If analysisData, which we get from MyProfile-component, is empty, render loading animation.
    if (analysisData.length < 1) {
        return (
            <div className={styles.chartLoadingAnimation}>
                <LoadingAnimation type={"spin"} color={"black"} />
            </div>
        );
    }
    // Next, we have to count, which analysisData-stick, also one company and its data, has least
    // sticks (Finnhub doesn't return same kind of data for every stock ==> AAPL may have)
    // (100 sticks per day and NOK only 10). In the chart we show as much sticks as the 
    // company that has least sticks. 
    let leastSticks = 0;
    let leastSticksStock = analysisData[0];
    analysisData.forEach((oneStock: AnalysisData) => {
        if (oneStock.sticks.length < leastSticks) {
            leastSticksStock = oneStock;
            leastSticks = leastSticksStock.sticks.length;
        }
    });
    // Dates for x-axis.
    const dates = leastSticksStock.sticks.map((x: CandleStock) => x.date);
    // Initializing a list for y-axis' values.
    let prices: number[] = [];
    // We go through every date in dates list and get the price for that date.
    dates.forEach((oneDate: string) => {
        // Initializing sum-variable. We have to take every stock's one price for every date and sum them together. 
        let sum = 0;
        // Loop inside a loop --> we go through analysisData for every date. This might not be the most efficient way.
        analysisData.forEach((oneStock: AnalysisData) => {
            // We go through every stick in the list of sticks for every stock.
            // We get the price for that date, if it exists.
            const valueToAdd = oneStock.sticks.filter((oneStick: CandleStock) => {
                return oneStick.date === oneDate;
            });
            // If the stick exists, we add it to sum. Before that, we multiply it with the stock's weight in portfolio.
            if (valueToAdd.length > 0) {
                sum = sum + valueToAdd[0].close * holdings.filter((pos: Holdings) => pos.usersStock.stockSymbol === oneStock.name)[0]?.usersTotalAmount;
            } else {
                // If the stick doesn't exist, we add the stick with the closest date to the date we are looking for.
                // This variable will be used to find the closest date.
                let biggestDiff = 99999;
                // We start our search from the first stick of this particular stock.
                let stickToSum = oneStock.sticks[0];
                oneStock.sticks.forEach((oneStick: CandleStock) => {
                    // Difference between the date we are looking for and the current stick's date (in the lopp).
                    const time = Math.abs(new Date(oneStick.date).getTime() - new Date(oneDate).getTime());
                    // If the difference is smaller than the biggestDiff, we update the biggestDiff and stickToSum.
                    if (time < biggestDiff) {
                        biggestDiff = time;
                        stickToSum = oneStick;
                    }
                });
                // Now that we have the stick with the closest date, we add its close-value to the sum as previously should have been done.
                sum = sum + stickToSum.close * holdings.filter((holding: Holdings) => holding.usersStock.stockSymbol === oneStock.name)[0]?.usersTotalAmount;
            }
        });
        // At the end of every loop, we add the sum to the list of y-axis' values.
        prices = prices.concat(
            parseFloat((100 * (-1 + sum / totalOriginalValue)).toFixed(2))
        );
    });

    const chartOptions = {
        // Default and self-made options.
        ...options,
        xaxis: {
            // X-values (dates).
            categories: dates,
            type: finalMyDateOption,
            labels: {
                formatter: function (value: string) {
                    // Formatting the x-axis labels.
                    const a = new Date(value);
                    let xLabel: string;
                    chartMode.mode === false
                        ? (xLabel = `${a.getDate()}.${a.getMonth() + 1}, ${leadingZeros(a.getHours())}:${leadingZeros(a.getMinutes())}`)
                        : (xLabel = `${a.getDate()}.${a.getMonth() + 1}`);
                    return xLabel;
                },
            },
        },
        yaxis: {
            labels: {
                // Formatting the y-axis labels.
                formatter: function (value: number) {
                    return `${value.toFixed(2)}%`;
                },
            },
        },
    };
    const series = [
        // Y-axis values.
        {
            name: "Portfolio value (%)",
            data: prices.map((x: number) => isNaN(x) ? 0 : x), // If the prices haven't been correctly loaded and calculated, we set them to 0 for a moment.
        },
    ];

    // When the user clicks the button of a specific stock, we try to get the historical data of that stock. If not succesfull, error-message is shown.
    const getOldData = (symbol: string) => {
        try {
            getData({ variables: { symbol } });
            return;
        } catch (e: unknown) {
            notification("Error.", (e as Error).message, "danger");
            return;
        }
    };
    // Rendering the chart.
    return (
        <div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography>Last 96 hours</Typography>
                <Switch
                    color={"default"}
                    checked={chartMode.mode}
                    onChange={() => dispatch(changeMode())}
                    disabled={isTogglable}
                ></Switch> 
                <Typography>Daily since first transaction</Typography>
            </div>
            <Chart options={chartOptions} series={series} type="line" height={300} />
            <AnalysisTable
                getOldData={getOldData}
                analysisData={analysisData}
                holdings={holdings}
            />
            <div style={{ width: "100%" }}>
                {res.loading ? (
                    <div className={styles.chartLoadingAnimation}>
                        <LoadingAnimation type={"spin"} color={"black"} />
                    </div>
                ) : (
                    <OldData
                        datas={res.data?.stockHistory}
                        analysisData={analysisData}
                        oldDataError={res.error}
                    />
                )}
            </div>
        </div>
    );
};

export default AnalysisChart;
