import React from "react";
import MainChart from "./MainChart";
import BuyStocks from "./BuyStocks";
import { useSelector } from "react-redux";
import { RootState } from "../..";
import { Typography } from "@material-ui/core";
import { AnimateKeyframes } from "react-simple-animate";
import { ArrowDownRight } from "react-bootstrap-icons";
import useStyles from "./buyStocksRouteStyles.module";

const StockPage = (): JSX.Element => {
    const styles = useStyles();
    const currentName = useSelector<RootState, string>(
        (state) => state.stock.stockName
    );
    const purchase = useSelector<RootState, boolean>(
        (state): boolean => state.purchase
    );
    return (
        <div className={styles.stockPageFirstDiv}>
            <div className={styles.stockPageSecondDiv}>
                {!purchase && !currentName ? (
                    <div className={styles.stockPageAnimationDiv}>
                        <AnimateKeyframes
                            play
                            iterationCount="infinite"
                            keyframes={["opacity: 0", "opacity: 1"]}
                            duration={3}
                        >
                            <Typography className={styles.stockPageAnimationTypography}>
                                {"Write here the symbol & select an amount."}
                            </Typography>
                            <ArrowDownRight size={40} />
                        </AnimateKeyframes>
                    </div>
                ) : (
                    <></>
                )}
            </div>
            <div className={styles.mainChartDiv}>
                <div className={styles.mainChartWidth}>
                    <MainChart stock={currentName} />
                </div>
                <div className={styles.buyStocksHigherDiv}>
                    <BuyStocks />
                </div>
            </div>
            <div className={styles.stockPageLastDiv}></div>
        </div>
    );
};

export default StockPage;
