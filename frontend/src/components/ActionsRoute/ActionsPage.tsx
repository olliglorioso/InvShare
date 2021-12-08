import { useQuery } from "@apollo/client";
import React from "react";
import { GET_ACTIONS } from "../../graphql/queries"
;
import { TransactionType } from "../../tsUtils/types";
import TransactionList from "../MyProfileRoute/TransactionList";
import { Typography } from "@material-ui/core";
import LoadingAnimation from "../Other/LoadingAnimation";
import useStyles from "./actionsRouteStyles.module";

// This is a component that is used to display the actions of the users
// that the current user follows. ActionsPage include at the moment only
// transactions (purchases and sales), but it could include follows and unfollows
// as well. 

const ActionsPage = (): JSX.Element => {
    // Importing styles.
    const styles = useStyles();
    // Query to backend that gets the transactions of the users that the current user follows.
    const actionsResult = useQuery(GET_ACTIONS);
    // If the query is loading, the user will see a loading screen in the middle of the screen.
    if (actionsResult.loading) {
        return (
            <div className={styles.loadingAnimation}>
                <LoadingAnimation type={"spin"} color={"black"} />
            </div>
        );
    }
    // We store the transactions from every actions-item that was returned from the backend.
    const actions = actionsResult.data.getActions.map((item: {transaction: TransactionType, transactionOwner: string}) => item.transaction);
    // If there are no transactions, a screen telling there are no
    // transactions to show pops up.
    if (actions.length === 0) {
        return(
            <div className={styles.noActionsDiv}>
                <Typography className={styles.noActionsTypography}>
                    No actions yet. Follow someone or tell the users you follow to buy and sell stocks.
                </Typography>
            </div>
        );
    }

    // If everything is all right (there are transactions + they have been loaded):
    return (
        <div className={styles.transactionListDiv}>
            <TransactionList transactions={actions} transactionsWithOwner={actionsResult.data.getActions} />
        </div>
    );
};

export default ActionsPage;