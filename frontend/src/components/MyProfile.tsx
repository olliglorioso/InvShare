import React, {useState, useEffect} from "react"
import { useLazyQuery, useQuery } from "@apollo/client"
import { CURRENT_PORTFOLIO_VALUE, ME } from "../graphql/queries"
import {Card, CardContent, CardHeader, Typography, Button} from "@material-ui/core"
import Avatar from "boring-avatars"
import TransactionList from "./TransactionList"
import Positions from "./Positions"
import Analysis from "./Analysis"
import {TransactionType} from "../types"
import { useSelector } from "react-redux"
import { RootState } from ".."

const MyProfile = () => {
    const result = useQuery(ME)
    const [loadCPV, {data}] = useLazyQuery(CURRENT_PORTFOLIO_VALUE)
    const [loadCPV2, {...res}] = useLazyQuery(CURRENT_PORTFOLIO_VALUE)
    const [mode, setMode] = useState("Analysis")
    const switchMode = useSelector<RootState, {mode: boolean}>((state) => state.mode)

    useEffect(() => {
        loadCPV({variables: {mode: "days"}})
        loadCPV2({variables: {mode: "hours"}})
    }, [])

    useEffect(() => {
        if (!data || !res.data) {
            return 
        }
        if (!res.data) {
            return
        }
        if (switchMode.mode) {
            analysisData = data.currentPortfolioValue[0]
        } else {
            analysisData = res.data.currentPortfolioValue[0]
        }
    }, [switchMode.mode])


    if (!data) {
        return <div style={{padding: 100}}><h1>LOADING</h1></div>
    }
    if (!res.data) {
        return <div style={{padding: 100}}><h1>LOADING</h1></div>
    }

    let analysisData: any
    if (switchMode.mode) {
        analysisData = data.currentPortfolioValue[0]
    } else {
        analysisData = res.data.currentPortfolioValue[0]
    }
    
    


    let totalOriginalValue

    if (result.data && result.data.me) {
        totalOriginalValue = result.data.me.usersTransactions.reduce((a: number, b: TransactionType): number => a + (b.transactionStockPrice * b.transactionStockAmount), 0)
    } else {
        return <div></div>
    }

    const positions = result.data.me.usersHoldings
    const transactions = result.data.me.usersTransactions
    const allTimeProfit = (100 * (-1 + analysisData.wholeValue/totalOriginalValue)).toFixed(2)
    
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
                                {/* <div style={{paddingRight: "3vh"}}>
                                    <Typography style={{fontWeight: "bold", textAlign: "center"}}>{Math.round(totalOriginalValue)}</Typography>
                                    <Typography>Rating</Typography>
                                </div>
                                <div style={{paddingRight: "3vh"}}>
                                    <Typography style={{fontWeight: "bold", textAlign: "center"}}>{Math.round(totalOriginalValue)}</Typography>
                                    <Typography>Account created</Typography>
                                </div>
                                <div>
                                    <Typography style={{fontWeight: "bold", textAlign: "center"}}>{Math.round(totalOriginalValue)}</Typography>
                                    <Typography>Followers</Typography>
                                </div> */}
                            </div>
                            
                        }
                    >
                    </CardHeader>
                    <CardContent>
                        <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                            <div style={{justifyContent: "center"}}>
                                <Typography style={{fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{Math.round(analysisData.wholeValue)}</Typography>
                                <Typography>Current value</Typography>
                            </div>
                            <div>
                                {
                                    parseFloat(allTimeProfit) >= 0
                                        ? <Typography style={{color: "green", fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{allTimeProfit}%</Typography>
                                        : <Typography style={{color: "red", fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{allTimeProfit}%</Typography>
                                }
                                
                                <Typography>Profit all time</Typography>
                            </div>
                            <div>
                                <Typography style={{fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{Math.round(totalOriginalValue)}</Typography>
                                <Typography>Original value</Typography>
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
                        <Positions />
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