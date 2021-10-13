import mongoose from "mongoose"
import User from "./models/user"
import Stock from "./models/stock"
import {hash, compare} from "bcrypt"
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config()
import jwt from "jsonwebtoken";
import Transaction from "./models/transaction";
import { CandlesType, CandlesTypeWithDate, TransactionType, UserType, UserInformation } from "./types";
import FinnhubAPI, { MarketDataItem } from "@stoqey/finnhub"
import { Resolution } from "@stoqey/finnhub"

const getIndividualStockInformation = async (symbol: string, startDate?: Date, resolution?: Resolution): Promise<CandlesType[]> => {
    const finnhubAPI = new FinnhubAPI("c4hm412ad3ifj3t4h07g")
    const getCandles = async (): Promise<MarketDataItem[]> => {
        const candles = await finnhubAPI.getCandles(symbol, startDate || new Date(2020,12,1), new Date(), resolution || "D")
        return candles
    }
    const candles = await getCandles()
    return candles.map((a: CandlesTypeWithDate): CandlesType => {return {...a, date: a.date.toString()}})
}

const turnToDate = (date: string) => {
    const res = new Date(parseInt(date.substring(0,4)), parseInt(date.substring(5,7)) - 1, parseInt(date.substring(8, 10))).toString()
    return res
}

const getAlphaVantage = async (symbol: string) => {
    const alpha = require("alphavantage")({key: "05ZXUNQURKT7T3TV"})

    const data2 = await alpha.data.weekly(symbol, "full", "json")
    let values2: any = {}
    
    for (const [_key, _value] of Object.entries(data2)) {
        values2["metadata"] = data2["Meta Data"]
        values2["time_series"] = data2["Weekly Time Series"]
    }

    values2["metadata"] = 
        {
            information: values2["metadata"]["1. Information"],
            symbol: values2["metadata"]["2. Symbol"],
            lastRefresh: values2["metadata"]["3. Last Refreshed"]  
        }

    values2["time_series"] = Object.keys(values2["time_series"]).reverse().map((one: any) => {
        return (
            [turnToDate(one), parseFloat(values2["time_series"][one]["4. close"])]
        )
    }) 

    const returnVals = {metadata: values2["metadata"], time_series: values2["time_series"].map((a: any) => {return {date: a[0], value: a[1]}})}
    return returnVals
}

const setDate = (hours: number): Date => {
    const date = new Date()
    date.setHours(date.getHours() + hours + 3)
    return date
}


const resolvers = {
    Query: {
        stockPrediction: async (_root: undefined, args: {symbol: string}) => {
            const result = await getAlphaVantage(args.symbol)
            return result
        },
        me: (_root: undefined, _args: void, context: {currentUser: UserType}): UserType => {
            return context.currentUser
        },
        individualStock: (_root: undefined, args: {company: string}): Promise<CandlesType[]> => {
            const candles = getIndividualStockInformation(args.company, setDate(-96), "5")
            return candles
        },
        currentPortfolioValue: async (_root: undefined, args: {mode: string}, context: {currentUser: UserType}): Promise<[{wholeValue: number, analysisValues: {name: string, sticks: CandlesType[]}[]}]> => {
            let summa = 0
            let values: {name: string, sticks: CandlesType[]}[] = []
            if (context.currentUser && context.currentUser.usersTransactions.length > 0) {

                const firstBuyDate = context.currentUser.usersTransactions[0].transactionDate
                let lastDate: Date
                new Date(firstBuyDate) > setDate(-96)
                ? lastDate = new Date(firstBuyDate)
                : lastDate = setDate(-96)
                for (const item of context.currentUser.usersHoldings) {
                    const a = await Stock.find({_id: item.usersStockName})
                    let value: any
                    if (args.mode === "hours") {
                        value = await getIndividualStockInformation(a[0].stockSymbol, lastDate, "5")
                        if (value.length < 1) {
                            value = await getIndividualStockInformation(a[0].stockSymbol, setDate(-96), "5")
                            value = [value[value.length - 1]]
                        }
                    } else {
                        value = await getIndividualStockInformation(a[0].stockSymbol, lastDate, "D")
                        if (value.length < 1) {
                            value = await getIndividualStockInformation(a[0].stockSymbol, setDate(-96), "5")
                            value = [value[value.length - 1]]
                        }
                    }
                    values = values.concat({name: a[0].stockSymbol, sticks: value})
                    summa += value[value.length - 1].close * item.usersTotalAmount
                }
            }
            return [{wholeValue: summa, analysisValues: values}]
        }
    },

    Mutation: {
        addUser: async (_root: undefined, args: UserInformation): Promise<UserType | void> => {
            const isUsernameFree = await User.find({usersUsername: args.username})
            if (isUsernameFree.length > 0) {
                console.log("the username is reserved")
                return
            }
            const passwordHash = await hash(args.password, 10)
            const user = new User({
                usersUsername: args.username,
                usersPasswordHash: passwordHash,
                usersTransactions: [],
                usersHoldings: []
            });
            return await user.save();
        },
        login: async (_root: undefined, args: UserInformation): Promise<void | {value: string}> => {
            const user = await User.findOne({usersUsername: args.username})

            const passwordCorrect = user === null
                ? false
                : await compare(args.password, user.usersPasswordHash)
            
            if (!(user && passwordCorrect)) {
                return
            }
            
            const userForToken = {
                username: user.usersUsername,
                id: (user._id as string)
            }

            const token = jwt.sign(userForToken, process.env.SECRETFORTOKEN as string);
            return {value: token};
        },
        buyStock: async (_root: undefined, args: {stockName: string, amount: number}, context: {currentUser: UserType}): Promise<TransactionType | null> => {
            const candles = await getIndividualStockInformation(args.stockName, setDate(-96), "5")
            const firstBuyEver = await Stock.findOne({stockSymbol: args.stockName.toUpperCase()})
            const loggedUser = context.currentUser
            if(!firstBuyEver) {
                const newStock = new Stock({
                    stockTotalAmount: args.amount,
                    stockSymbol: args.stockName.toUpperCase()
                })
                const newTransaction = new Transaction({
                    transactionType: "Buy",
                    transactionDate: new Date((new Date()).setHours(new Date().getHours())),
                    transactionStockPrice: candles[candles.length - 1].close,
                    transactionStockAmount: args.amount,
                    transactionStock: newStock._id as string
                }).populate("transactionStock")
                await newStock.save()   
                await User.updateOne({usersUsername: loggedUser.usersUsername}, {$set: {usersTransactions: loggedUser.usersTransactions.concat(newTransaction._id), usersHoldings: loggedUser.usersHoldings.concat({usersStockName: newStock._id as mongoose.Types.ObjectId, usersTotalAmount: args.amount, usersTotalOriginalPriceValue: args.amount * newTransaction.transactionStockPrice})}})
                await newTransaction.save()
                const transactionToReturn = await Transaction.findOne({_id: newTransaction._id}).populate("transactionStock")
                return transactionToReturn
            } else {
                const newTransaction = new Transaction({
                    transactionType: "Buy",
                    transactionDate: new Date((new Date()).setHours(new Date().getHours())),
                    transactionStockPrice: candles[candles.length - 1].close,
                    transactionStockAmount: args.amount,
                    transactionStock: firstBuyEver._id as mongoose.Types.ObjectId
                })
                const holdingToBeChanged = loggedUser.usersHoldings.filter((obj: any) => {
                    return (obj.usersStockName._id.toString() === (firstBuyEver._id as mongoose.Types.ObjectId).toString())
                })[0]

                if (holdingToBeChanged) {
                    const helperArrayOfHoldings = loggedUser.usersHoldings
                    helperArrayOfHoldings[loggedUser.usersHoldings.indexOf(holdingToBeChanged)] = {usersTotalAmount: (holdingToBeChanged.usersTotalAmount + args.amount), usersTotalOriginalPriceValue: (holdingToBeChanged.usersTotalOriginalPriceValue + (args.amount * candles[candles.length - 1].close)), usersStockName: holdingToBeChanged.usersStockName}
                    await Stock.updateOne({_id: (firstBuyEver._id as mongoose.Types.ObjectId)}, {$set: {stockTotalAmount: firstBuyEver.stockTotalAmount + args.amount}})
                    await User.updateOne({usersUsername: loggedUser.usersUsername}, {$set: {usersTransactions: loggedUser.usersTransactions.concat(newTransaction._id), usersHoldings: helperArrayOfHoldings}})
                    await newTransaction.save()
                    const transactionToReturn = await Transaction.findOne({_id: newTransaction._id}).populate("transactionStock")
                    return transactionToReturn
                } else {
                    await Stock.updateOne({_id: (firstBuyEver._id as mongoose.Types.ObjectId)}, {$set: {stockTotalAmount: firstBuyEver.stockTotalAmount + args.amount}})
                    await User.updateOne({usersUsername: loggedUser.usersUsername}, {$set: {usersTransactions: loggedUser.usersTransactions.concat(newTransaction._id), usersHoldings: loggedUser.usersHoldings.concat({usersStockName: firstBuyEver._id as mongoose.Types.ObjectId, usersTotalAmount: args.amount, usersTotalOriginalPriceValue: args.amount * newTransaction.transactionStockPrice})}})
                    await newTransaction.save()
                    const transactionToReturn = await Transaction.findOne({_id: newTransaction._id}).populate("transactionStock")
                    return transactionToReturn
                }
                
            }
        },
    }
}

export default resolvers