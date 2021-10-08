import React, {useState} from "react";
import { ListSubheader, Collapse, Button, List, ListItemIcon, ListItemText } from "@material-ui/core";
import { KeyboardArrowRight, ShoppingCart, Delete } from "@material-ui/icons";
import { ExpandLess, ExpandMore} from "@material-ui/icons";
import {TransactionType} from "../types"

const TransactionList = (props: {transactions: TransactionType[]}): JSX.Element => {
    const transactionStates = props.transactions.map((trans: TransactionType): string => trans._id.toString()).reduce((a, v) => ({ ...a, [v]: false}), {}) 
    const [open, setOpen] = useState(transactionStates);

    const handleClick = (id: string) => {
        setOpen((prevState: Record<string, boolean>) => ({...prevState, [id]: !prevState[id]}))
    };

    const leadingZeros = (num: number): string => {
        if (num < 10) {
            return "0" + num.toString()
        } else {
            return num.toString()
        }
    }

    return (
        <List
            // sx={{ width: "100%", maxWidth: 360 }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                    <h1 style={{fontWeight: "bold", fontSize: 25, color: "black"}}>
                        Transactions
                    </h1>
                </ListSubheader>
            }
        >   
            {props.transactions.map((transaction: TransactionType) => {
                const date = new Date(transaction.transactionDate)
                const dateFormat = date.getDate() + "." + (date.getMonth() + 1).toString() + "." + date.getFullYear() + ", " + leadingZeros(date.getHours()) + ":" + leadingZeros(date.getMinutes())
                return (
                    <div key={transaction.transactionDate}>
                        <Button onClick={() => handleClick(transaction._id.toString())}>
                            <ListItemIcon>
                                {
                                    transaction.transactionType === "Buy"
                                        ? <ShoppingCart />
                                        : <Delete />
                                }
                            </ListItemIcon>
                            <ListItemText primary={transaction.transactionStock.stockSymbol} />
                            {open ? <ExpandLess /> : <ExpandMore />}
                        </Button>
                        <Collapse
                            in={(open as Record<string, boolean>)[transaction._id.toString()]} 
                            timeout="auto" 
                        >
                            <List component="div" disablePadding style={{display: "flex", alignItems: "flex-start", flexDirection: "column"}}>
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
                                    <ListItemText primary={`Price per share: ${transaction.transactionStockPrice.toFixed(2)}`} />
                                </Button>
                                <Button disabled={true} style={{color: "black"}}>
                                    <ListItemIcon>
                                        <KeyboardArrowRight />
                                    </ListItemIcon>
                                    <ListItemText primary={`Amount: ${transaction.transactionStockAmount}`} />
                                </Button>
                            </List>
                        </Collapse>
                    </div>
                )
            })}
        </List>
    );
}

export default TransactionList

