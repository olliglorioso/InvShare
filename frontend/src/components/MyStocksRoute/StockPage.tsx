import React from "react";
import MainChart from "./MainChart";
import BuyStocks from "./BuyStocks";
import { useSelector } from "react-redux";
import { RootState } from "../..";
import { Typography } from "@material-ui/core";
import { AnimateKeyframes } from "react-simple-animate";
import { ArrowDownRight } from "react-bootstrap-icons";

const StockPage = (): JSX.Element => {
  const buyingStockState = useSelector<RootState, string>(
    (state) => state.stock.stockName
  );
  const purchase = useSelector<RootState, boolean>(
    (state): boolean => state.purchase
  );

  return (
    <div
      style={{
        backgroundColor: "white",
        textAlign: "center",
        paddingTop: "20vh",
        paddingBottom: "20vh",
        margin: 5,
      }}
    >
      <div
        style={{ display: "flex", flexDirection: "row", justifyContent: "end" }}
      >
        {!purchase && !buyingStockState ? (
          <div
            style={{ height: "0px", paddingBottom: 55, paddingRight: "10vw" }}
          >
            <AnimateKeyframes
              play
              iterationCount="infinite"
              keyframes={["opacity: 0", "opacity: 1"]}
              duration={3}
            >
              <Typography style={{ width: 160, fontSize: 15 }}>
                {"Write here the symbol & select an amount."}
              </Typography>
              <ArrowDownRight size={40} />
            </AnimateKeyframes>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ width: "100%" }}>
          <MainChart stock={buyingStockState} />
        </div>
        <div style={{ paddingTop: 40, width: "20vw", paddingRight: 5 }}>
          <BuyStocks />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "end",
          paddingRight: "1%",
        }}
      ></div>
    </div>
  );
};

export default StockPage;
