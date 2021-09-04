import React from "react"
import { useQuery } from "@apollo/client"
import { ME } from "../graphql/queries"
import {Card, CardContent, CardHeader, Typography} from "@material-ui/core"
import Avatar from "boring-avatars"

const MyProfile = () => {
    const {data, loading} = useQuery(ME)
    type HoldingType = {
        usersStockName: string,
        usersTotalAmount: number,
        usersTotalOriginalPriceValue: number,
        __typename: string
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
    const totalPositionsOriginalValue = data.me.usersHoldings.reduce((a: number, b: HoldingType) => a + b.usersTotalOriginalPriceValue, 0)
    const totalCurrentValue = data.me.usersTransactions.reduce((a: number, b: TransactionType) => a + (b.transactionStockPrice * b.transactionStockAmount), 0)

    return (
        <div style={{
            background: "white",
            paddingBottom: "31vh",
            paddingTop: "10vh",
            margin: 10,
            display: "flex",
            flexDirection: "column",
        }}>
            <div style={{padding: 15}}>
                <Card>
                    <CardHeader
                        avatar={<Avatar size={100} name={data.me.usersUsername} variant="marble" colors={["#808080", "#FFFFFF", "#000000"]} /> }
                        title={data.me.usersUsername}
                    >
                    </CardHeader>
                    
                    <CardContent>
                        <div style={{display: "flex", justifyContent: ""}}>
                            <div>
                                <Typography>Portfolio value</Typography>
                                <Typography style={{fontWeight: "bold"}}>{Math.round(totalCurrentValue)}</Typography>
                            </div>
                            <div>
                                <Typography>Profit today</Typography>
                                <Typography style={{fontWeight: "bold"}}>{Math.round(totalCurrentValue)}</Typography>
                            </div>
                            <div>
                                <Typography>Profit last 3 months</Typography>
                                <Typography style={{fontWeight: "bold"}}>{Math.round(totalCurrentValue)}</Typography>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div style={{justifyContent: "space-around", display: "flex", flexDirection: "row", alignItems: "center"}}>
                <div style={{flex: 1, paddingBottom: "40vh", textAlign: "center"}}>
                    <p>Holdings</p>
                </div>
                <div style={{flex: 1, paddingBottom: "40vh", textAlign: "center"}}>
                    <p>Analysis</p>
                </div>
                <div style={{flex: 1, paddingBottom: "40vh", textAlign: "center"}}>
                    <p>Transactions</p>
                </div>
            </div>
        </div>
        
    )
}

export default MyProfile