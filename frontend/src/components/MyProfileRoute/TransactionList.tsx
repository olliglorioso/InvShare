import React, { useState } from "react";
import {
    Collapse,
    Button,
    List,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@material-ui/core";
import { KeyboardArrowRight, ShoppingCart, Delete } from "@material-ui/icons";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import { TransactionType } from "../../tsUtils/types";
import leadingZeros from "../../utils/helpers";
import useStyles from "./myProfileRouteStyles.module";

// This component is responsible for displaying the list of transactions, either in MyProfile or Actions.

const TransactionList = (props: {
  transactions: TransactionType[],
  // The transactionsWithOwner-prop is used in Actions.
  transactionsWithOwner?: {transactions: TransactionType[], transactionOwner: string}[];
}): JSX.Element => {
    // Importing styles.
    const styles = useStyles();
    // Setting up transactions' states (are they expanded or not).
    const transactionStates = props.transactions
        .map((trans: TransactionType): string => trans._id.toString())
        .reduce((a, v) => ({ ...a, [v]: false }), {});
    // State for transactions' mode (expanded or not).
    const [open, setOpen] = useState(transactionStates);
    // When the user wants to expand a transaction, this function is called.
    const handleClick = (id: string) => {
        setOpen((prevState: Record<string, boolean>) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };
    // Returing the list.
    return (
        <div className={styles.transactionListDiv}>
            <div>
                <Typography className={styles.modeTitles}>
                    {props.transactionsWithOwner ? "Actions" : "Transactions"}
                </Typography>
            </div>

            <List
                className={styles.transactionList}
                component="nav"
                aria-labelledby="nested-list-subheader"
            >
                {props.transactions.map((transaction: TransactionType, index: number) => {
                    const date = new Date(transaction.transactionDate);
                    // Formatting date for every displayed transaction to a more readable format.
                    const dateFormat =
                        date.getDate() +
                        "." +
                        (date.getMonth() + 1).toString() +
                        "." +
                        date.getFullYear() +
                        ", " +
                        leadingZeros(date.getHours()) +
                        ":" +
                        leadingZeros(date.getMinutes());
                    return (
                        <div
                            key={transaction.transactionDate}
                            className={styles.transactionListItem}
                        >
                            <Button onClick={() => handleClick(transaction._id.toString())}>
                                <ListItemIcon>
                                    {transaction.transactionType === "Buy" // Which icon to display.
                                        ? <ShoppingCart />
                                        : <Delete />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={ // Different text if we are on MyProfile or Actions.
                                        `${transaction.transactionStock.stockSymbol} 
                                        ${props.transactionsWithOwner ? "(" + props.transactionsWithOwner[index].transactionOwner + ")" : ""}`
                                    }
                                />
                                {(open as Record<string, boolean>)[transaction._id.toString()] 
                                    ? <ExpandLess />
                                    : <ExpandMore />}
                            </Button>
                            <Collapse
                                in={(open as Record<string, boolean>)[transaction._id.toString()]}
                                timeout="auto"
                            >
                                <List
                                    component="div"
                                    disablePadding
                                    className={styles.transactionListCollapsedItem}                                    
                                >
                                    <Button disabled={true} className={styles.black}>
                                        <ListItemIcon>
                                            <KeyboardArrowRight />
                                        </ListItemIcon>
                                        <ListItemText primary={`Date: ${dateFormat}`} />
                                    </Button>
                                    <Button disabled={true} className={styles.black}>
                                        <ListItemIcon>
                                            <KeyboardArrowRight />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`Price per share: ${transaction.transactionStockPrice.toFixed(2)}`}
                                        />
                                    </Button>
                                    <Button disabled={true} className={styles.black}>
                                        <ListItemIcon>
                                            <KeyboardArrowRight />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`Amount: ${transaction.transactionStockAmount}`}
                                        />
                                    </Button>
                                </List>
                            </Collapse>
                        </div>
                    );
                })}
            </List>
        </div>
    );
};

export default TransactionList;
