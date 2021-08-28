import React from "react";
import SideBar from "./SideBar"
import MenuBar from "./AppBar"
import MainChart from "./MainChart";
import BuyStocks from "./BuyStocks";
import { useSelector } from "react-redux";
import { RootState } from "..";

const StockPage = (): JSX.Element => {
    const buyingStockState = useSelector<RootState, string>((state) => state.stock.stockName)

    return (
        <div style={{
            backgroundColor: "white",
            textAlign: "center",
            paddingTop: 100
        }}>
            <div>
                <SideBar />
                <MenuBar />
            </div>
            <div style={{display: "flex", flexDirection: "row", justifyContent: "space-around"}}>
                <div style={{width: "100%"}}>
                    <MainChart stock={buyingStockState} />
                </div>
                <div style={{paddingTop: 15, width: 500}}>
                    <BuyStocks />
                </div>
            </div>
        </div>
    )
}

export default StockPage