import React, { useState } from "react";
import {
  Collapse,
  Button,
  List,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { KeyboardArrowRight, ShoppingCart, Delete } from "@material-ui/icons";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import { TransactionType } from "../../types";
import leadingZeros from "../Other/helpers";

const TransactionList = (props: {
  transactions: TransactionType[];
  transactionsWithOwner?: {transactions: TransactionType[], transactionOwner: string}[];
}): JSX.Element => {
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <h1
          style={{
            fontWeight: "bold",
            fontSize: 25,
            fontFamily: "Arial",
            color: "black",
            textAlign: "center",
          }}
        >
          {props.transactionsWithOwner ? "Actions" : "Transactions"}
        </h1>
      </div>

      <List
        style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
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
              style={{ width: "50%", textAlign: "center" }}
            >
              <Button onClick={() => handleClick(transaction._id.toString())}>
                <ListItemIcon>
                  {transaction.transactionType === "Buy" ? (
                    <ShoppingCart />
                  ) : (
                    <Delete />
                  )}
                </ListItemIcon>
                <ListItemText
                  
                  primary={`${transaction.transactionStock.stockSymbol} ${props.transactionsWithOwner ? "(" + props.transactionsWithOwner[index].transactionOwner + ")" : ""}`}
                />
                {(open as Record<string, boolean>)[
                  transaction._id.toString()
                ] ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
              </Button>
              <Collapse
                in={
                  (open as Record<string, boolean>)[transaction._id.toString()]
                }
                timeout="auto"
              >
                <List
                  component="div"
                  disablePadding
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <Button disabled={true} style={{ color: "black" }}>
                    <ListItemIcon>
                      <KeyboardArrowRight />
                    </ListItemIcon>
                    <ListItemText primary={`Date: ${dateFormat}`} />
                  </Button>
                  <Button disabled={true} style={{ color: "black" }}>
                    <ListItemIcon>
                      <KeyboardArrowRight />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Price per share: ${transaction.transactionStockPrice.toFixed(
                        2
                      )}`}
                    />
                  </Button>
                  <Button disabled={true} style={{ color: "black" }}>
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
