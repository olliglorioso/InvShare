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


const TransactionList = (props: {
  transactions: TransactionType[],
  transactionsWithOwner?: {transactions: TransactionType[], transactionOwner: string}[];
}): JSX.Element => {
    const styles = useStyles();
    const transactionStates = props.transactions
        .map((trans: TransactionType): string => trans._id.toString())
        .reduce((a, v) => ({ ...a, [v]: false }), {});
    const [open, setOpen] = useState(transactionStates);
    const handleClick = (id: string) => {
        setOpen((prevState: Record<string, boolean>) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };
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
                            <Button id="openTransaction" onClick={() => handleClick(transaction._id.toString())}>
                                <ListItemIcon>
                                    {transaction.transactionType === "Buy" // Which icon to display.
                                        ? <ShoppingCart />
                                        : <Delete />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={ 
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
                                    <Button disabled={true} style={{color: "black"}}>
                                        <ListItemIcon>
                                            <KeyboardArrowRight />
                                        </ListItemIcon>
                                        <ListItemText primary={`Date: ${dateFormat}`} />
                                    </Button>
                                    <Button disabled={true} style={{color: "black"}}>
                                        <ListItemIcon>
                                            <KeyboardArrowRight />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`Price per share: ${transaction.transactionStockPrice.toFixed(2)}`}
                                        />
                                    </Button>
                                    <Button disabled={true} style={{color: "black"}}>
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
