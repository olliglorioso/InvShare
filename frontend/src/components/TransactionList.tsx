import React from "react";
import { ListSubheader, Collapse, Button, List, ListItemIcon, ListItemText } from "@material-ui/core";
import { KeyboardArrowRight, ShoppingCart, Delete } from "@material-ui/icons";
import { ExpandLess, ExpandMore} from "@material-ui/icons";
type StockType = {
    stockSymbol: string,
    stockTotalAmount: number,
    __typename: string
}
type TransactionType = {
    transactionDate: string,
    transactionStock: StockType,
    transactionStockAmount: number,
    transactionStockPrice: number,
    transactionType: string,
    __typename: string
}

const TransactionList = (props: {transactions: TransactionType[]}) => {

    const [open, setOpen] = React.useState(true);
    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <List
            // sx={{ width: "100%", maxWidth: 360 }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
                <ListSubheader style={{fontWeight: "bold", fontSize: 20, color: "black"}} component="div" id="nested-list-subheader">
                Transactions
                </ListSubheader>
            }
        >   
            {props.transactions.map((transaction: TransactionType) => {
                return (
                    <div key={transaction.transactionDate}>
                        <Button onClick={handleClick}>
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
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding style={{display: "flex", alignItems: "flex-start", flexDirection: "column"}}>
                                <Button disabled={true} style={{color: "black"}}>
                                    <ListItemIcon>
                                        <KeyboardArrowRight />
                                    </ListItemIcon>
                                    <ListItemText primary={`Date: ${transaction.transactionDate.substring(0,21)}`} />
                                </Button>
                                <Button disabled={true} style={{color: "black"}}>
                                    <ListItemIcon>
                                        <KeyboardArrowRight />
                                    </ListItemIcon>
                                    <ListItemText primary={`Price per share: ${transaction.transactionStockPrice}`} />
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

