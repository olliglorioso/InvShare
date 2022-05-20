import React, { useState, useEffect } from "react";
import AnalysisChart from "./AnalysisChart";
import { useQuery } from "@apollo/client";
import { CURRENT_PORTFOLIO_VALUE, ME } from "../../graphql/queries";
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Button,
} from "@material-ui/core";
import Avatar from "boring-avatars";
import TransactionList from "./TransactionList";
import { Holdings } from "../../tsUtils/types";
import { useSelector } from "react-redux";
import { RootState } from "../..";
import LoadingAnimation from "../Other/LoadingAnimation";
import { buyFirstStock, noPurchases } from "../../reducers/firstBuyReducer";
import { useDispatch } from "react-redux";
import notification from "../../utils/notification";
import TutorialAnimation from "./TutorialAnimation";
import useStyles from "./myProfileRouteStyles.module";

const MyProfile = ({stockSubscription, followSubscriptions}: {
  stockSubscription: string | undefined,
  followSubscriptions: string | undefined
}): JSX.Element => {
    const styles = useStyles();
    const meResult = useQuery(ME);
    const dispatch = useDispatch();
    const daysData = useQuery(CURRENT_PORTFOLIO_VALUE, { 
        variables: { mode: "days" }
    });
    const hoursData = useQuery(CURRENT_PORTFOLIO_VALUE, {
        variables: { mode: "hours" }
    });
    const [mode, setMode] = useState("Analysis");
    const switchMode = useSelector<RootState, { mode: boolean }>(
        (state) => state.mode
    );
    useEffect(() => {
        if (stockSubscription || followSubscriptions) {
            try {
                meResult.refetch();
                hoursData.refetch();
                daysData.refetch();
            } catch (e: unknown) {
                notification("An error occured.", "Error while downloading updates and new information.", "danger");
            }
        }
    }, [stockSubscription, followSubscriptions]);
    if (
        daysData.error?.message === "This user has no transactions." || hoursData.error?.message === "This user has no transactions."
    ) {
        dispatch(noPurchases());
        return <TutorialAnimation />;
    }
    if (!meResult.data || !hoursData.data ||!meResult.data.me || !hoursData.data.currentPortfolioValue) {
        return <div className={styles.myProfileLoadingAnimation}><LoadingAnimation type={"spin"} color={"black"} /></div>;
    }
    if (meResult.error || daysData.error || hoursData.error) {
        const errorMessage = meResult.error?.message || daysData.error?.message || hoursData.error?.message;
        notification("An error occured.", errorMessage as string, "danger");
        return <div className={styles.myProfileLoadingAnimation}><LoadingAnimation type={"spin"} color={"black"} /></div>;
    }
    if (meResult.loading || hoursData.loading || !meResult.data || !hoursData.data) {
        return (
            <div className={styles.myProfileLoadingAnimation}>
                <LoadingAnimation type={"spin"} color={"black"} />
            </div>
        );
    } else if (
        meResult.data.me.usersHoldings.length === 0 || meResult.data.me.usersTransactions.length === 0
    ) {
        dispatch(noPurchases());
        return <TutorialAnimation />;
    } else if (meResult.data.me.usersHoldings.length !== 0) {dispatch(buyFirstStock());}
    const analysisData = switchMode.mode
        ? daysData.data.currentPortfolioValue[0]
        : hoursData.data.currentPortfolioValue[0];
    const transactions = meResult.data.me.usersTransactions;
    const totalOriginalValue = meResult.data.me.usersHoldings.reduce(
        (acc: number, curr: Holdings
        ) => {
            return acc + curr.usersTotalOriginalPriceValue;
        },
        0
    );
    const currentProfitPercentage = (parseFloat((100 * (-1 + hoursData.data.currentPortfolioValue[0].wholeValue / totalOriginalValue)).toString())).toFixed(2);
    return (
        <div className={styles.myProfileMainDiv}>
            <div style={{ padding: 15 }}>
                <Card>
                    <CardHeader
                        avatar={
                            <Avatar
                                size={100}
                                name={meResult.data.me.usersUsername}
                                variant="marble"
                                colors={["#808080", "#FFFFFF", "#000000"]}
                            />
                        }
                        title={
                            <div className={styles.myProfileCardTitle}>
                                <Typography style={{ fontSize: 30, flex: 1 }}>
                                    {meResult.data.me.usersUsername}
                                </Typography>
                                <div style={{ flex: 1}}>
                                    <Typography className={styles.myProfileCardInfos}>
                                        {meResult.data.me.followerCount || 0}
                                    </Typography>
                                    <Typography className={styles.myProfileCardInfos}>
                                        Followers
                                    </Typography>
                                </div>
                                <div style={{ flex: 1}}>
                                    <Typography className={styles.myProfileCardInfos}>
                                        {meResult.data.me.followingCount || 0}
                                    </Typography>
                                    <Typography className={styles.myProfileCardInfos}>
                                        Following
                                    </Typography>
                                </div>
                            </div>
                        }
                    ></CardHeader>
                    <CardContent>
                        <div className={styles.myProfileCardContentDiv}>
                            <div style={{ justifyContent: "center" }}>
                                <Typography className={styles.myProfileCardContentTypography}>
                                    {Math.round(hoursData.data.currentPortfolioValue[0].wholeValue)}
                                </Typography>
                                <Typography style={{ textAlign: "center" }}>
                                    Current value
                                </Typography>
                            </div>
                            <div>
                                {parseFloat(currentProfitPercentage) >= 0  
                                    ?   <Typography className={styles.myProfileCardContentNumberGreen}>{currentProfitPercentage}%</Typography> 
                                    :   <Typography className={styles.myProfileCardContentNumberRed}>{currentProfitPercentage}%</Typography>}

                                <Typography style={{ textAlign: "center" }}>
                                    Profit percentage
                                </Typography>
                            </div>
                            <div>
                                <Typography className={styles.myProfileCardContentTypography}>
                                    {Math.round(totalOriginalValue)}
                                </Typography>
                                <Typography style={{ textAlign: "center" }}>
                                     Original value
                                </Typography>
                            </div>
                            <div>
                                {Math.round(meResult.data.me.moneyMade) >= 0 
                                    ?   <Typography className={styles.myProfileCardContentNumberGreen}>{Math.round(meResult.data.me.moneyMade)}</Typography>
                                    :   <Typography className={styles.myProfileCardContentNumberRed}>{Math.round(meResult.data.me.moneyMade)}</Typography>}
                                <Typography style={{ textAlign: "center" }}>Profit</Typography>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
                <div style={{ paddingBottom: "1vh", textAlign: "center" }}>
                    <Button
                        variant="contained"
                        type="submit"
                        onClick={() => setMode("Analysis")}
                        className={styles.myProfileButton}
                    >
                        Analysis
                    </Button>
                </div>
                <div style={{ paddingBottom: "1vh", textAlign: "center" }}>
                    <Button
                        variant="contained"
                        id="toTransactions"
                        type="submit"
                        onClick={() => setMode("Transactions")}
                        className={styles.myProfileButton}
                    >
                        Transactions
                    </Button>
                </div>
            </div>
            {mode === "Analysis" ? (
                <div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <div className={styles.myProfileAnalysisSecondDIv}>
                            <Typography className={styles.modeTitles}>
                                Analysis
                            </Typography>
                            <div>
                                <div className={styles.myProfileAnalysisChartDiv}>
                                    <AnalysisChart
                                        totalOriginalValue={totalOriginalValue}
                                        analysisData={analysisData.analysisValues}
                                        holdings={meResult.data.me.usersHoldings}
                                        isTogglable={!daysData.data}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.myProfileTransationList}>
                    <TransactionList transactions={transactions} />
                </div>
            )}
        </div>
    );
};

export default MyProfile;
