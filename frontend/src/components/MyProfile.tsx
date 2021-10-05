import React from "react"
import { useQuery } from "@apollo/client"
import { CURRENT_PORTFOLIO_VALUE, ME } from "../graphql/queries"
import {Card, CardContent, CardHeader, Typography, Button} from "@material-ui/core"
import Avatar from "boring-avatars"
import TransactionList from "./TransactionList"

const MyProfile = () => {
    const {data, loading} = useQuery(ME)
    const res = useQuery(CURRENT_PORTFOLIO_VALUE)
    if (!res.data) {
        return <div></div>
    }

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

    if (loading) {
        return <div></div>
    }

    let totalOriginalValue

    if (data && data.me) {
        totalOriginalValue = data.me.usersTransactions.reduce((a: number, b: TransactionType) => a + (b.transactionStockPrice * b.transactionStockAmount), 0)
    }

    if (!data || !data.me) {
        return <div></div>
    }
    
    const transactions = data.me.usersTransactions
    console.log(transactions[0])
    const allTimeProfit = (100 * (-1 + Math.round(res.data.currentPortfolioValue)/Math.round(totalOriginalValue))).toFixed(2)


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
                        avatar={<Avatar size={100} name={data.me.usersUsername} variant="marble" colors={["#808080", "#FFFFFF", "#000000"]} /> }
                        title={
                            <div style={{display: "flex", flexWrap: "wrap", flexDirection: "row", justifyContent: "space-between"}}>
                                <div style={{flex: 1}}>
                                    <Typography style={{fontSize: 30, flex: 1}}>{data.me.usersUsername}</Typography>
                                </div>
                                <div style={{paddingRight: "3vh"}}>
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
                                </div>
                            </div>
                            
                        }
                    >
                    </CardHeader>
                    <CardContent>
                        <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                            <div style={{justifyContent: "center"}}>
                                <Typography style={{fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{Math.round(res.data.currentPortfolioValue)}</Typography>
                                <Typography>Portfolio value</Typography>
                            </div>
                            <div>
                                {
                                    parseFloat(allTimeProfit) > 0
                                        ? <Typography style={{color: "green", fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{allTimeProfit}%</Typography>
                                        : <Typography style={{color: "red", fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{allTimeProfit}%</Typography>
                                }
                                
                                <Typography>Profit all time</Typography>
                            </div>
                            <div>
                                <Typography style={{fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{Math.round(totalOriginalValue)}</Typography>
                                <Typography>Profit last 3 months</Typography>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div style={{justifyContent: "space-between", display: "flex", flexDirection: "row", alignItems: "center"}}>
                <div style={{flex: 1, paddingBottom: "1vh", textAlign: "center"}}>
                    <Button variant="contained" type="submit" style={{background: "black", color: "white"}}>Positions</Button>
                </div>
                <div style={{flex: 1, paddingBottom: "1vh", textAlign: "center"}}>
                    <Button variant="contained" type="submit" style={{background: "black", color: "white"}}>Analysis</Button>
                </div>
                <div style={{flex: 1, paddingBottom: "1vh", textAlign: "center"}}>
                    <Button variant="contained" type="submit" style={{background: "black", color: "white"}}>Transactions</Button>
                </div>
            </div>
            <div style={{justifyContent: "space-around", display: "flex", flexDirection: "column", alignItems: "center"}}>
                <TransactionList transactions={transactions}/>
            </div>
        </div>
        
    )
}

export default MyProfile