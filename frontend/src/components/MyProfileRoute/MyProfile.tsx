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
  stockSubscription: string,
  followSubscriptions: string
}): JSX.Element => {
    // Importing styles.
    const styles = useStyles();
    // Executing me-query.
    const meResult = useQuery(ME);
    // Initializing dispatch with useDispatch-hook.
    const dispatch = useDispatch();
    // Executing currentPortfolioValue-query with the mode "days".
    const daysData = useQuery(CURRENT_PORTFOLIO_VALUE, { 
        variables: { mode: "days" }
    });
    // Executing currentPortfolioValue-query with the mode "hours".
    const hoursData = useQuery(CURRENT_PORTFOLIO_VALUE, {
        variables: { mode: "hours" }
    });
    // Initializing mode-state with useState-hook.
    const [mode, setMode] = useState("Analysis");
    // Getting the current mode from Redux-store.
    const switchMode = useSelector<RootState, { mode: boolean }>(
        (state) => state.mode
    );
    // This useEffect is executed every time we get a notification of relevant follow/unfollow or
    // a new stock-purchase/sale from the server. It updates all the data in the page, so that the client doesn't have to reload the page
    // to see the changes.
    useEffect(() => {
        if (stockSubscription || followSubscriptions) {
            try {
                meResult.refetch();
                daysData.refetch();
                hoursData.refetch();
            } catch (e: unknown) {
                notification("An error occured.", "Error while downloading updates and new information.", "danger");
            }
        }
    }, [stockSubscription, followSubscriptions]);
    // Checking if the user has no stocks ==> show the tutorial if true.
    if (
        daysData.error?.message === "This user has no transactions." || hoursData.error?.message === "This user has no transactions."
    ) {
        dispatch(noPurchases());
        return <TutorialAnimation />;
    }
    // Checking errors.
    if (meResult.error || daysData.error || hoursData.error) {
        const errorMessage = meResult.error?.message || daysData.error?.message || hoursData.error?.message;
        notification("An error occured.", errorMessage as string, "danger");
        return <div className={styles.myProfileLoadingAnimation}><LoadingAnimation type={"spin"} color={"black"} /></div>;
        
    }
    // If relevant data is not yet fetched, show the loading animation. We don't include daysData here
    // because we want to show the loading animation onlye while the hoursData is still loading. If we have to 
    // wait daysData as well, the waiting time would be too long. The user cannot access the daily data
    // before it's fetched, because in another component we disable the switch for the time.
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
    // Setting the data to analysisData-variable based on the mode.
    const analysisData = switchMode.mode
        ? daysData.data.currentPortfolioValue[0]
        : hoursData.data.currentPortfolioValue[0];
    // Setting the transactions to a variable.
    const transactions = meResult.data.me.usersTransactions;
    // Calculating the value of the whole portfolio when individual stocks were bought with usersHoldings.
    const totalOriginalValue = meResult.data.me.usersHoldings.reduce(
        (acc: number, curr: Holdings
        ) => {
            return acc + curr.usersTotalOriginalPriceValue;
        },
        0
    );
    // Current profit percentage.
    const currentProfitPercentage = parseFloat((100 * (-1 + hoursData.data.currentPortfolioValue[0].wholeValue / totalOriginalValue)).toFixed(2));
    // Rendering MyProfile.
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
                                {currentProfitPercentage >= 0  // The color of the text is based on the sign of the profit.
                                    ?   <Typography className={styles.myProfileCardContentNumberGreen}>{currentProfitPercentage}%</Typography> 
                                    :   <Typography className={styles.myProfileCardContentNumberRed}>{currentProfitPercentage}%</Typography>}

                                <Typography style={{ textAlign: "center" }}>
                                    Profit all time
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
                                {Math.round(meResult.data.me.moneyMade) >= 0 // The color of the text is based on the sign of the money made.
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
