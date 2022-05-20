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
    const styles = useStyles();
    const dispatch = useDispatch();
    const [getData, { ...res }] = useLazyQuery(GET_OLD_DATA);
    const chartMode = useSelector<RootState, { mode: boolean }>(
        (state) => state.mode
    );
    if (analysisData.length < 1) {
        return (
            <div className={styles.chartLoadingAnimation}>
                <LoadingAnimation type={"spin"} color={"black"} />
            </div>
        );
    }
    let leastSticks = 0;
    let leastSticksStock = analysisData[0];
    analysisData.forEach((oneStock: AnalysisData) => {
        if (oneStock.sticks.length < leastSticks) {
            leastSticksStock = oneStock;
            leastSticks = leastSticksStock.sticks.length;
        }
    });
    const dates = leastSticksStock.sticks.map((x: CandleStock) => x.date);
    let prices: number[] = [];
    dates.forEach((oneDate: string) => {
        let sum = 0;
        analysisData.forEach((oneStock: AnalysisData) => {
            const valueToAdd = oneStock.sticks.filter((oneStick: CandleStock) => {
                return oneStick.date === oneDate;
            });
            if (valueToAdd.length > 0) {
                sum = sum + valueToAdd[0].close * holdings.filter((pos: Holdings) => pos.usersStock.stockSymbol === oneStock.name)[0]?.usersTotalAmount;
            } else {
                let biggestDiff = 99999;
                let stickToSum = oneStock.sticks[0];
                oneStock.sticks.forEach((oneStick: CandleStock) => {
                    const time = Math.abs(new Date(oneStick.date).getTime() - new Date(oneDate).getTime());
                    if (time < biggestDiff) {
                        biggestDiff = time;
                        stickToSum = oneStick;
                    }
                });
                sum = sum + stickToSum.close * holdings.filter((holding: Holdings) => holding.usersStock.stockSymbol === oneStock.name)[0]?.usersTotalAmount;
            }
        });
        prices = prices.concat(
            parseFloat((100 * (-1 + sum / totalOriginalValue)).toFixed(2))
        );
    });

    const chartOptions = {
        ...options,
        xaxis: {
            categories: dates,
            type: finalMyDateOption,
            labels: {
                formatter: function (value: string) {
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
                formatter: function (value: number) {
                    return `${value.toFixed(2)}%`;
                },
            },
        },
    };
    const series = [
        {
            name: "Portfolio value (%)",
        },
    ];

    const getOldData = (symbol: string) => {
        try {
            getData({ variables: { symbol } });
            return;
        } catch (e: unknown) {
            notification("Error.", (e as Error).message, "danger");
            return;
        }
    };
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
