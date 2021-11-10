import React, {useState, useEffect} from "react"
import { useLazyQuery, useQuery } from "@apollo/client"
import { CURRENT_PORTFOLIO_VALUE, ME } from "../../graphql/queries"
import {Card, CardContent, CardHeader, Typography, Button} from "@material-ui/core"
import Avatar from "boring-avatars"
import TransactionList from "./TransactionList"
import Analysis from "./Analysis"
import {TransactionType, Positions} from "../../types"
import { useSelector } from "react-redux"
import { RootState } from "../.."
import LoadingAnimation from "../Other/LoadingAnimation"
import {AnimateKeyframes} from "react-simple-animate"
import { noPurchases } from "../../reducers/firstBuyReducer"
import { useDispatch } from "react-redux"
import PositionsSite from "./Positions"
import {Arrow90degUp} from "react-bootstrap-icons"

const MyProfile = (): JSX.Element => {
    const result = useQuery(ME)
    const dispatch = useDispatch()
    const [loadCPV, {data}] = useLazyQuery(CURRENT_PORTFOLIO_VALUE)
    const [loadCPV2, {...res}] = useLazyQuery(CURRENT_PORTFOLIO_VALUE)
    const [mode, setMode] = useState("Analysis")
    const switchMode = useSelector<RootState, {mode: boolean}>((state) => state.mode)

    

    useEffect(() => {
        loadCPV({variables: {mode: "days"}})
        loadCPV2({variables: {mode: "hours"}})
    }, [])

    if (!data || !res.data || !result.data || !result.data.me) {
        return <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh"}}><LoadingAnimation type={"spin"} color={"black"}/></div>
    }

    const analysisData = switchMode.mode ? data.currentPortfolioValue[0]: res.data.currentPortfolioValue[0]

    if (result.data.me.usersHoldings.length === 0 && result.data.me.usersTransactions.length >= 0) {
        dispatch(noPurchases())
        return (
            <div style={{background: "white"}}>
                <div style={{width: "0px", height: "0px"}}>
                    <AnimateKeyframes
                        play
                        iterationCount="infinite"
                        keyframes={["opacity: 0", "opacity: 1"]}
                        duration={3}
                    >
                        <Arrow90degUp size={50} style={{paddingTop: 60, paddingLeft: 7}}/>
                        <Typography style={{width: 200, paddingLeft: 7}}>Open the sidebar!</Typography>
                    </AnimateKeyframes>
                </div>
                <div style={{display: "flex", opacity: "100%", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", paddingLeft: "2vh", paddingRight: "2vh"}}>
                    <Typography>You have bought no stocks. Follow the instructions and glinting objects in order to buy one.</Typography>
                </div>
            </div>
        )
    }

    const positions = result.data.me.usersHoldings
    const transactions = result.data.me.usersTransactions
    const totalOriginalValue = result.data.me.usersTransactions.reduce(
        (a: number, b: TransactionType): number =>
        {
            if (positions.find((position: Positions) => position.usersStockName.stockSymbol === b.transactionStock.stockSymbol)) {
                if (b.transactionType === "Buy") {
                    
                    return a + (b.transactionStockPrice * b.transactionStockAmount)
                } else if (b.transactionType === "Sell") {
                    return a - (b.transactionStockPrice * b.transactionStockAmount)
                } else {
                    throw new Error("Invalid transaction type.")
                }
            } else {return a}
        }
        , 0)
    const allTimeProfit = (100 * (-1 + res.data.currentPortfolioValue[0].wholeValue/totalOriginalValue)).toFixed(2)
    return (
        <div style={{
            background: "white",
            paddingBottom: "60vh",
            paddingTop: "10vh",
            margin: 10,
            display: "flex",
            flexDirection: "column",
        }}>
            <div style={{padding: 15}}>
                <Card>
                    <CardHeader
                        avatar={<Avatar size={100} name={result.data.me.usersUsername} variant="marble" colors={["#808080", "#FFFFFF", "#000000"]} /> }
                        title={
                            <div style={{display: "flex", flexWrap: "wrap", flexDirection: "row", justifyContent: "space-between"}}>
                                <div style={{flex: 1}}>
                                    <Typography style={{fontSize: 30, flex: 1}}>{result.data.me.usersUsername}</Typography>
                                </div>
                            </div>
                            
                        }
                    >
                    </CardHeader>
                    <CardContent>
                        <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                            <div style={{justifyContent: "center"}}>
                                <Typography style={{fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{Math.round(analysisData.wholeValue)}</Typography>
                                <Typography style={{textAlign: "center"}}>Current value</Typography>
                            </div>
                            <div>
                                {
                                    parseFloat(allTimeProfit) >= 0
                                        ? <Typography style={{color: "green", fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{allTimeProfit}%</Typography>
                                        : <Typography style={{color: "red", fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{allTimeProfit}%</Typography>
                                }
                                
                                <Typography style={{textAlign: "center"}}>Profit all time</Typography>
                            </div>
                            <div>
                                <Typography style={{fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{Math.round(totalOriginalValue)}</Typography>
                                <Typography style={{textAlign: "center"}}>Original value</Typography>
                            </div>
                            <div>
                                <Typography style={{fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{Math.round(result.data.me.moneyMade)}</Typography>
                                <Typography style={{textAlign: "center"}}>Profit</Typography>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div style={{display: "flex", justifyContent: "space-around"}}>
                <div style={{paddingBottom: "1vh", textAlign: "center"}} >
                    <Button variant="contained" type="submit" style={{background: "black", color: "white"}} onClick={() => setMode("Positions")}>Positions</Button>
                </div>
                <div style={{paddingBottom: "1vh", textAlign: "center"}}>
                    <Button variant="contained" type="submit" style={{background: "black", color: "white"}} onClick={() => setMode("Analysis")}>Analysis</Button>
                </div>
                <div style={{paddingBottom: "1vh", textAlign: "center"}}>
                    <Button variant="contained" type="submit" style={{background: "black", color: "white"}} onClick={() => setMode("Transactions")}>Transactions</Button>
                </div>
            </div>
            {
                mode === "Positions"
                    ?
                    <div>
                        <PositionsSite />
                    </div>
                    : mode === "Analysis"
                        ? 
                        <div>
                            <div style={{display: "flex", justifyContent: "center"}}>
                                <Analysis totalOriginalValue={totalOriginalValue} positions={positions} portValue={analysisData.analysisValues} />
                            </div>
                        </div>
                        : 
                        <div style={{display: "flex", flexDirection: "column", paddingLeft: "20vh", alignItems: "center"}}>
                            <TransactionList transactions={transactions}/>
                        </div>
            }
            
        </div>
        
    )
}

export default MyProfile