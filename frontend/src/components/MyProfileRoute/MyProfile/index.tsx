import React, {useState, useEffect} from "react"
import AnalysisChart from "../AnalysisChart/"
import { useQuery } from "@apollo/client"
import { CURRENT_PORTFOLIO_VALUE, ME} from "../../../graphql/queries"
import {Card, CardContent, CardHeader, Typography, Button} from "@material-ui/core"
import Avatar from "boring-avatars"
import TransactionList from "../TransactionList"
import {TransactionType, Positions} from "../../../types"
import { useSelector } from "react-redux"
import { RootState } from "../../.."
import LoadingAnimation from "../../Other/LoadingAnimation"
import {AnimateKeyframes} from "react-simple-animate"
import { noPurchases } from "../../../reducers/firstBuyReducer"
import { useDispatch } from "react-redux"
import PositionsSite from "../Positions"
import {Arrow90degUp} from "react-bootstrap-icons"
import styles from "./myprofile.module.css"


const MyProfile = ({subscriptionData}: {subscriptionData: string}): JSX.Element => {
    const {myProfileLoadingAnimation, tutorialFirstPart, transactionList, myProfile1Div, cardHeaderTitle} = styles
    const result = useQuery(ME)
    const dispatch = useDispatch()
    const data = useQuery(CURRENT_PORTFOLIO_VALUE, {variables: {mode: "days"}})
    const res = useQuery(CURRENT_PORTFOLIO_VALUE, {variables: {mode: "hours"}})
    const [mode, setMode] = useState("Analysis")
    const switchMode = useSelector<RootState, {mode: boolean}>((state) => state.mode)
    
    useEffect(() => {
        if (subscriptionData) {
            result.refetch()
        }
    }, [subscriptionData])

    if (!data || !res.data || !result.data || !result.data.me) {
        return (
            <div className={myProfileLoadingAnimation}>
                <LoadingAnimation type={"spin"} color={"black"}/>
            </div>
        )
    }

    const analysisData = switchMode.mode ? data.data.currentPortfolioValue[0]: res.data.currentPortfolioValue[0]

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
                <div className={tutorialFirstPart}>
                    <Typography>You have bought no stocks. Follow the instructions and glinting objects in order to buy one.</Typography>
                </div>
            </div>
        )
    }

    const transactions = result.data.me.usersTransactions

    const totalOriginalValue = result.data.me.usersHoldings.reduce((acc: number, curr: Positions) => {
        return acc + curr.usersTotalOriginalPriceValue
    }, 0)

    return (
        <div className={myProfile1Div}>
            <div style={{padding: 15}}>
                <Card>
                    <CardHeader
                        avatar={<Avatar size={100} name={result.data.me.usersUsername} variant="marble" colors={["#808080", "#FFFFFF", "#000000"]} /> }
                        title={
                            <div className={cardHeaderTitle}>
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
                                <Typography style={{fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{Math.round(res.data.currentPortfolioValue[0].wholeValue)}</Typography>
                                <Typography style={{textAlign: "center"}}>Current value</Typography>
                            </div>
                            <div>
                                {
                                    parseFloat((100 * (-1 + res.data.currentPortfolioValue[0].wholeValue/totalOriginalValue)).toFixed(2)) >= 0
                                        ? <Typography style={{color: "green", fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{(100 * (-1 + res.data.currentPortfolioValue[0].wholeValue/totalOriginalValue)).toFixed(2)}%</Typography>
                                        : <Typography style={{color: "red", fontWeight: "bold", fontSize: 30, textAlign: "center"}}>{(100 * (-1 + res.data.currentPortfolioValue[0].wholeValue/totalOriginalValue)).toFixed(2)}%</Typography>
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
                    <Button 
                        variant="contained" 
                        type="submit" 
                        onClick={() => setMode("Positions")}
                        style={{background: "black", color: "white"}}
                    >
                        Positions
                    </Button>
                </div>
                <div style={{paddingBottom: "1vh", textAlign: "center"}}>
                    <Button 
                        variant="contained" 
                        type="submit" 
                        onClick={() => setMode("Analysis")}
                        style={{background: "black", color: "white"}}
                    >
                        Analysis
                    </Button>
                </div>
                <div style={{paddingBottom: "1vh", textAlign: "center"}}>
                    <Button 
                        variant="contained" 
                        type="submit" 
                        onClick={() => setMode("Transactions")}
                        style={{background: "black", color: "white"}}
                    >
                        Transactions
                    </Button>
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
                                <div style={{width: "100%", paddingLeft: "5vh", paddingRight: "5vh"}}>
                                    <h1 style={{fontWeight: "bold", fontSize: 25, color: "black", textAlign: "center", fontFamily: "Arial"}}>Analysis</h1>
                                    <div>
                                        <div style={{width: "100%", justifyContent: "center"}}>
                                            <AnalysisChart totalOriginalValue={totalOriginalValue} analysisData={analysisData.analysisValues} positions={result.data.me.usersHoldings} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        : 
                        <div className={transactionList}>
                            <TransactionList transactions={transactions}/>
                        </div>
            }
            
        </div>
        
    )
}

export default MyProfile