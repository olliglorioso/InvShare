import mongoose from "mongoose"
import User from "./models/user"
import Stock from "./models/stock"
import {hash, compare} from "bcrypt"
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config()
import jwt from "jsonwebtoken";
import Transaction from "./models/transaction";
import { CandlesType, TransactionType, UserType, PopulatedUserType, UserInformation, HoldingType, ReadyAlphaVantageValues, CurrentPortfolioType, AnalysisValue} from "./types"
import { AuthenticationError, UserInputError} from "apollo-server-express"
import {getIndividualStockInformation, getAlphaVantage} from "./helpFunctions"
import { parseCompany } from "./typeGuards"


const setDate = (hours: number): Date => {
    const date = new Date()
    date.setHours(date.getHours() + hours + 3)
    return date
}

const getTransactionToReturn = async (id: mongoose.Types.ObjectId): Promise<TransactionType | null> => await Transaction.findOne({_id: id}).populate("transactionStock")

const resolvers = {
    Query: {
        stockPrediction: async (_root: undefined, args: {symbol: string}): Promise<ReadyAlphaVantageValues> => {
            const parsedSymbol = parseCompany(args.symbol)
            const result = await getAlphaVantage(parsedSymbol)
            return result
        },
        me: (_root: undefined, _args: void, context: {currentUser: PopulatedUserType}): PopulatedUserType => {
            console.log(context.currentUser)
            return context.currentUser 
        },
        individualStock: async (_root: undefined, args: {company: string}): Promise<CandlesType[]> => {
            const parsedCompany = parseCompany(args.company)
            const candles = await getIndividualStockInformation(parsedCompany, setDate(-96), "5")
            if (candles.length === 0) {
                throw new UserInputError("The symbol doesn't exist.", {errorCode: 400})
            }
            return candles
            
        },
        currentPortfolioValue: async (_root: undefined, args: {mode: string}, context: {currentUser: PopulatedUserType}): Promise<CurrentPortfolioType[]> => {
            let summa = 0
    
            let values: AnalysisValue[] = []
            if (context.currentUser && context.currentUser.usersTransactions?.length > 0) {
                const firstBuyDate = context.currentUser.usersTransactions[0].transactionDate
                let lastDate: Date
                new Date(firstBuyDate) > setDate(-96)
                ? lastDate = new Date(firstBuyDate)
                : lastDate = setDate(-96)
                for (const item of context.currentUser.usersHoldings) {
                    const a = await Stock.find({stockSymbol: item.usersStockName.stockSymbol})
                    let value: CandlesType[]
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
        addUser: async (_root: undefined, args: UserInformation): Promise<UserType | string> => {
            const isUsernameFree = await User.find({usersUsername: args.username})
            if (isUsernameFree.length > 0) {
                return "moi"
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
                throw new AuthenticationError("Something")
            }
            
            const userForToken = {
                username: user.usersUsername,
                id: (user._id as string)
            }

            const token = jwt.sign(userForToken, process.env.SECRETFORTOKEN as string);
            return {value: token};
        },
        buyStock: async (_root: undefined, args: {stockName: string, amount: number}, context: {currentUser: PopulatedUserType}): Promise<TransactionType | null> => {
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
                const user = await User.findOne({usersUsername: loggedUser.usersUsername})
                const newHolding = {
                    usersTransactions: user?.usersTransactions.concat(newTransaction._id), 
                    usersHoldings: user?.usersHoldings.concat({
                        usersStockName: newStock._id as mongoose.Types.ObjectId, 
                        usersTotalAmount: args.amount, 
                        usersTotalOriginalPriceValue: args.amount * newTransaction.transactionStockPrice,
                    })
                }
                await User.updateOne({usersUsername: loggedUser.usersUsername}, {$set: newHolding})
                await newTransaction.save()
                return await getTransactionToReturn(newTransaction._id)
            } else {
                const newTransaction = new Transaction({
                    transactionType: "Buy",
                    transactionDate: new Date((new Date()).setHours(new Date().getHours())),
                    transactionStockPrice: candles[candles.length - 1].close,
                    transactionStockAmount: args.amount,
                    transactionStock: firstBuyEver._id as mongoose.Types.ObjectId
                })
                const user = await User.findOne({usersUsername: loggedUser.usersUsername})

                const holdingToBeChanged = user?.usersHoldings.filter((obj: HoldingType): boolean => {
                    return (obj.usersStockName.toString() === (firstBuyEver._id as mongoose.Types.ObjectId).toString())
                })[0]

                if (holdingToBeChanged) {
                    const helperArrayOfHoldings = (user as UserType).usersHoldings
                    helperArrayOfHoldings[helperArrayOfHoldings.indexOf(holdingToBeChanged)] = {
                        _id: holdingToBeChanged._id,
                        usersTotalAmount: (holdingToBeChanged.usersTotalAmount + args.amount), 
                        usersTotalOriginalPriceValue: (holdingToBeChanged.usersTotalOriginalPriceValue + (args.amount * candles[candles.length - 1].close)), 
                        usersStockName: holdingToBeChanged.usersStockName
                    }
                    await Stock.updateOne({_id: (firstBuyEver._id as mongoose.Types.ObjectId)}, {$set: {stockTotalAmount: firstBuyEver.stockTotalAmount + args.amount}})
                    await User.updateOne(
                        {usersUsername: loggedUser.usersUsername},
                        {$set: {
                                usersTransactions: user?.usersTransactions.concat(newTransaction._id),
                                usersHoldings: helperArrayOfHoldings
                            }
                        }
                    )
                    await newTransaction.save()
                    return await getTransactionToReturn(newTransaction._id)
                } else {
                    await Stock.updateOne({_id: (firstBuyEver._id as mongoose.Types.ObjectId)},
                        {$set: {
                            stockTotalAmount: firstBuyEver.stockTotalAmount + args.amount
                        }
                    })
                    await User.updateOne({usersUsername: loggedUser.usersUsername}, 
                        {$set: {
                            usersTransactions: user?.usersTransactions.concat(newTransaction._id),
                            usersHoldings: user?.usersHoldings.concat({
                                usersStockName: firstBuyEver._id as mongoose.Types.ObjectId,
                                usersTotalAmount: args.amount,
                                usersTotalOriginalPriceValue: args.amount * newTransaction.transactionStockPrice
                            })
                        }}
                    )
                    await newTransaction.save()
                    return await getTransactionToReturn(newTransaction._id)
                }
                
            }
        },
    }
}

export default resolvers