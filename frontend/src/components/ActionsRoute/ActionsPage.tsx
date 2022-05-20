import { useQuery } from "@apollo/client";
import React from "react";
import { GET_ACTIONS } from "../../graphql/queries"
;
import { TransactionType } from "../../tsUtils/types";
import TransactionList from "../MyProfileRoute/TransactionList";
import { Typography } from "@material-ui/core";
import LoadingAnimation from "../Other/LoadingAnimation";
import useStyles from "./actionsRouteStyles.module";


const ActionsPage = (): JSX.Element => {
    const styles = useStyles();
    const actionsResult = useQuery(GET_ACTIONS);
    if (actionsResult.loading) {
        return (
            <div className={styles.loadingAnimation}>
                <LoadingAnimation type={"spin"} color={"black"} />
            </div>
        );
    }
    const actions = actionsResult.data.getActions.map((item: {transaction: TransactionType, transactionOwner: string}) => item.transaction);
    if (actions.length === 0) {
        return(
            <div className={styles.noActionsDiv}>
                <Typography className={styles.noActionsTypography}>
                    No actions yet. Follow someone or tell the users you follow to buy and sell stocks.
                </Typography>
            </div>
        );
    }

    return (
        <div className={styles.transactionListDiv}>
            <TransactionList transactions={actions} transactionsWithOwner={actionsResult.data.getActions} />
        </div>
    );
};

export default ActionsPage;