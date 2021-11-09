import React from "react";
import SideBar from "./SideBar"
import MenuBar from "./AppBar"
import MainChart from "./MainChart";
import BuyStocks from "./BuyStocks";
import { useSelector } from "react-redux";
import { RootState } from "..";
import {Typography} from "@material-ui/core";
import {AnimateKeyframes} from "react-simple-animate"
import { ArrowRightAlt } from "@material-ui/icons";

const StockPage = (): JSX.Element => {
    const buyingStockState = useSelector<RootState, string>((state) => state.stock.stockName)
    const purchase = useSelector<RootState, boolean>((state): boolean => state.purchase)

    return (
        <div style={{
            backgroundColor: "white",
            textAlign: "center",
            paddingTop: "20vh",
            paddingBottom: "20vh",
            margin: 10
        }}>
            <div>
                <SideBar />
                <MenuBar />
            </div>
            <div style={{display: "flex", flexDirection: "row", justifyContent: "end", paddingRight: "3%"}}>
                {
                    !purchase && !buyingStockState
                        ? <div style={{height: "0px", paddingBottom: "20vh"}}>
                            <Typography style={{width: 160}}>{"Write here the symbol & select an amount."}</Typography>
                            <AnimateKeyframes
                                play
                                iterationCount="infinite"
                                keyframes={["opacity: 0", "opacity: 1"]}
                                duration={3}
                            >  
                                <ArrowRightAlt style={{transform: "rotate(120deg)", fontSize: "100px"}} />
                            </AnimateKeyframes>
                        </div>
                        : <></>
                }
            </div>
            <div style={{display: "flex", flexDirection: "row", justifyContent: "space-around"}}>
                <div style={{width: "100%"}}>
                    <MainChart stock={buyingStockState} />
                </div>
                <div style={{paddingTop: 40, width: "40%", paddingRight: 5}}>
                    <BuyStocks />
                </div>
            </div>
            <div style={{display: "flex", flexDirection: "row", justifyContent: "end", paddingRight: "1%"}}>
                {
                    !purchase && buyingStockState
                        ? <div style={{height: "40px"}}>
                            
                            <AnimateKeyframes
                                play
                                iterationCount="infinite"
                                keyframes={["opacity: 0", "opacity: 1"]}
                                duration={3}
                            >  
                                <ArrowRightAlt style={{transform: "rotate(230deg)", fontSize: "100px"}} />
                            </AnimateKeyframes>
                            <Typography>{"Press buy and confirm."}</Typography>
                        </div>
                        : <></>
                }
            </div>
        </div>
    )
}

export default StockPage