import mongoose from "mongoose"
import User from "./models/user"
import Stock from "./models/stock"
import {hash, compare} from "bcrypt"
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config()
import jwt from "jsonwebtoken";
import Transaction from "./models/transaction";
import { 
    CandlesType, 
    TransactionType, 
    UserType, 
    PopulatedUserType,
    UserInformation, 
    HoldingType, 
    PopulatedHoldingType, 
    ReadyAlphaVantageValues, 
    CurrentPortfolioType, 
    AnalysisValue, 
    Mode
} from "./types"
import { AuthenticationError, UserInputError} from "apollo-server-express"
import {
    getIndividualStockInformation, 
    getAlphaVantage, 
    createDate, 
    getTransactionToReturn 
} from "./helpFunctions"
import { parseCompany, parseUserInformation, parseAmount } from "./typeGuards"
import { PubSub, withFilter } from "graphql-subscriptions"

const pubsub = new PubSub()

const setDate = (hours: number): Date => {
    const date = new Date()
    date.setHours(date.getHours() + hours + 3)
    return date
}

const resolvers = {
    Query: {
        stockPrediction: async (_root: undefined, args: {symbol: string}): Promise<ReadyAlphaVantageValues> => {
            const parsedSymbol = parseCompany(args.symbol)
            const result = await getAlphaVantage(parsedSymbol)
            return result
        },
        me: (_root: undefined, _args: void, context: {currentUser: PopulatedUserType}): PopulatedUserType => {
            return context.currentUser 
        },
        searchUser: async (_root: undefined, args: {username: string}, context: {currentUser: PopulatedUserType}): Promise<PopulatedUserType[] | [{}]> => {
            if (!context.currentUser) {
                return [{}]
            }
            // We search for users whose username starts with args.username from the server and populate them.
            const users = await User.find({usersUsername: {$regex: `^(?i)${args.username}`}})
                .populate({path: "usersFollowers", populate: {path: "user"}})
                .populate({path: "usersFollowing", populate: {path: "user"}})
                .populate({path: "usersHoldings", populate: {path: "usersStockName"}})
                .populate({path: "usersTransactions", populate: {path: "transactionStock"}}) as unknown as PopulatedUserType[]
            // We return the users that were found and remove the current user from the list.
            return users?.filter((user: PopulatedUserType) => user.usersUsername !== context.currentUser.usersUsername)
        },
        individualStock: async (_root: undefined, args: {company: string}): Promise<CandlesType[]> => {
            const parsedCompany = parseCompany(args.company)
            const candles = await getIndividualStockInformation(parsedCompany, setDate(-96), "5")
            if (candles.length === 0) {
                throw new UserInputError("The symbol doesn't exist.", {errorCode: 400})
            }
            return candles
            
        },
        currentPortfolioValue: async (_root: undefined,
                args: {mode: Mode}, 
                context: {currentUser: PopulatedUserType}
            ): Promise<CurrentPortfolioType[]> => {
            let summa = 0
            let values: AnalysisValue[] = []
            if (context.currentUser && context.currentUser?.usersTransactions?.length > 0) {
                const firstBuyDate = context.currentUser.usersTransactions[0].transactionDate
                for (const item of context.currentUser.usersHoldings) {
                    const a = await Stock.find({stockSymbol: item.usersStockName.stockSymbol})
                    let value: CandlesType[]
                    const value1 = await getIndividualStockInformation(a[0].stockSymbol, setDate(-96), "5")

                    if (args.mode === "hours") {
                        new Date(firstBuyDate) > setDate(-96)
                        ? value = value1.filter((item: CandlesType) => {return new Date(item.date) > new Date(firstBuyDate)})
                        : value = value1

                        if (value.length === 0) {
                            value = value.concat(value1[value1.length - 1])
                        }
                        
                    } else  {
                        value = await getIndividualStockInformation(a[0].stockSymbol, new Date(firstBuyDate), "D")
                        if (value.length === 0) {
                            value = value.concat(value1[value1.length - 1])
                        }
                    }
                    values = values.concat({name: a[0].stockSymbol, sticks: value})
                    summa += value[value.length - 1].close * item.usersTotalAmount
                }
            } else if (context.currentUser?.usersTransactions?.length === 0) {
                throw new Error("This user has no transactions.")
            }
            return [{wholeValue: summa, analysisValues: values}]
        }
    },

    Mutation: {
        followUser: async (_root: undefined, args: {username: string}, context: {currentUser: PopulatedUserType}): Promise<{result: boolean}> => {
            const user = await User.findOne({usersUsername: args.username})
            if (!user) {
                throw new AuthenticationError("User doesn't exist.")
            }
            else if (context.currentUser.usersFollowing.find((item: {user: PopulatedUserType, date: string}) => item.user.usersUsername === args.username)) {
                throw new AuthenticationError("You are already following this user.")
            }
            else if (context.currentUser.usersUsername === args.username) {
                throw new UserInputError("You can't follow yourself.")
            }
            await User.updateOne({_id: context.currentUser._id}, {$push: {usersFollowing: {user: user._id, date: new Date().toString()}}, $set: {followingCount: (context.currentUser.followingCount || 0) + 1}})
            await User.updateOne({_id: user._id}, {$push: {usersFollowers: {user: context.currentUser._id, date: new Date().toString()}}, $set: {followerCount: (user.followerCount || 0) + 1}})
            pubsub.publish("FOLLOWEVENT", {followEvent: {followType: "follow", auteur: context.currentUser.usersUsername, object: user.usersUsername, date: new Date()}})
            return {result: true}
        },
        unfollowUser: async (_root: undefined, args: {username: string}, context: {currentUser: PopulatedUserType}): Promise<{result: boolean}> => {
            const user = await User.findOne({usersUsername: args.username})
            if (!user) {
                throw new AuthenticationError("User doesn't exist.")
            }
            else if (!context.currentUser.usersFollowing.find((item: {user: PopulatedUserType, date: string}) => item.user.usersUsername === args.username)) {
                throw new AuthenticationError("You are not following this user.")
            }
            await User.updateOne({_id: context.currentUser._id}, {$pull: {usersFollowing: {user: user._id}}, $set: {followingCount: (context.currentUser.followingCount || 0) - 1}})
            await User.updateOne({_id: user._id}, {$pull: {usersFollowers: {user: context.currentUser._id}}, $set: {followerCount: (user.followerCount || 0) - 1}})
            pubsub.publish("FOLLOWEVENT", {followEvent: {followType: "unfollow", auteur: context.currentUser.usersUsername, object: user.usersUsername, date: new Date()}})
            return {result: true}
        },
        addUser: async (_root: undefined, args: UserInformation): Promise<UserType | string> => {
            const parsedUserInformation = parseUserInformation(args)
            const isUsernameFree = await User.find({usersUsername: parsedUserInformation.username})
            if (isUsernameFree.length > 0) {
                throw new UserInputError("The username is already in use.", {errorCode: 400})
            }
            
            const passwordHash = await hash(parsedUserInformation.password, 10)
            const user = new User({
                usersUsername: parsedUserInformation.username,
                usersPasswordHash: passwordHash,
                usersTransactions: [],
                usersHoldings: [],
                moneyMade: 0,
                usersFollowers: [],
                usersFollowing: [],
                followerCount: 0,
                followingCount: 0
            });
            return await user.save();
        },
        login: async (_root: undefined, args: UserInformation): Promise<void | {value: string, username: string}> => {
            const parsedUserInformation = parseUserInformation(args)
            const user = await User.findOne({usersUsername: parsedUserInformation.username})
            const passwordCorrect = user === null
                ? false
                : await compare(parsedUserInformation.password, user.usersPasswordHash)
            
            if (!(user && passwordCorrect)) {
                throw new AuthenticationError("Incorrect password or username.")
            }
            
            const userForToken = {
                username: user.usersUsername,
                id: (user._id as string)
            }

            const token = jwt.sign(userForToken, process.env.SECRETFORTOKEN as string);
            return {value: token, username: args.username};
        },
        buyStock: async (_root: undefined, args: {stockName: string, amount: number}, context: {currentUser: PopulatedUserType}): Promise<TransactionType | null> => {
            const parsedCompany = parseCompany(args.stockName)
            const parsedAmount = parseAmount(args.amount)
            const candles = await getIndividualStockInformation(parsedCompany, setDate(-96), "5")
            const firstBuyEver = await Stock.findOne({stockSymbol: parsedCompany.toUpperCase()})
            const loggedUser = context.currentUser
            if(!firstBuyEver) {
                const newStock = new Stock({
                    stockTotalAmount: parsedAmount,
                    stockSymbol: parsedCompany.toUpperCase()
                })
                const newTransaction = new Transaction({
                    transactionType: "Buy",
                    transactionDate: createDate(),
                    transactionStockPrice: candles[candles.length - 1].close,
                    transactionStockAmount: parsedAmount,
                    transactionStock: newStock._id as string
                }).populate("transactionStock")
                await newStock.save()
                const user = await User.findOne({usersUsername: loggedUser.usersUsername})
                const newHolding = {
                    usersTransactions: user?.usersTransactions.concat(newTransaction._id), 
                    usersHoldings: user?.usersHoldings.concat({
                        usersStockName: newStock._id as mongoose.Types.ObjectId, 
                        usersTotalAmount: parsedAmount, 
                        usersTotalOriginalPriceValue: parsedAmount * newTransaction.transactionStockPrice,
                    })
                }
                await User.updateOne({usersUsername: loggedUser.usersUsername}, {$set: newHolding})
                await newTransaction.save()
                pubsub.publish("STOCK_PURCHASED", {stockPurchased: {transaction: getTransactionToReturn(newTransaction._id), me: context.currentUser.usersUsername, myFollowers: context.currentUser.usersFollowers}})
                return await getTransactionToReturn(newTransaction._id)
            } else {
                const newTransaction = new Transaction({
                    transactionType: "Buy",
                    transactionDate: createDate(),
                    transactionStockPrice: candles[candles.length - 1].close,
                    transactionStockAmount: parsedAmount,
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
                        usersTotalAmount: (holdingToBeChanged.usersTotalAmount + parsedAmount), 
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
                    pubsub.publish("STOCK_PURCHASED", {stockPurchased: {transaction: getTransactionToReturn(newTransaction._id), me: context.currentUser.usersUsername, myFollowers: context.currentUser.usersFollowers}})
                    return await getTransactionToReturn(newTransaction._id)
                } else {
                    await Stock.updateOne({_id: (firstBuyEver._id as mongoose.Types.ObjectId)},
                        {$set: {
                            stockTotalAmount: firstBuyEver.stockTotalAmount + parsedAmount
                        }
                    })
                    await User.updateOne({usersUsername: loggedUser.usersUsername}, 
                        {$set: {
                            usersTransactions: user?.usersTransactions.concat(newTransaction._id),
                            usersHoldings: user?.usersHoldings.concat({
                                usersStockName: firstBuyEver._id as mongoose.Types.ObjectId,
                                usersTotalAmount: parsedAmount,
                                usersTotalOriginalPriceValue: parsedAmount * newTransaction.transactionStockPrice
                            })
                        }}
                    )
                    await newTransaction.save()
                    pubsub.publish("STOCK_PURCHASED", {stockPurchased: {transaction: getTransactionToReturn(newTransaction._id), me: context.currentUser.usersUsername, myFollowers: context.currentUser.usersFollowers}})
                    return await getTransactionToReturn(newTransaction._id)
                }
                
            }
        },
        sellStock: async (
                _root: undefined, 
                args: {stockName: string, amount: number, price: number}, 
                context: {currentUser: PopulatedUserType}
            ): Promise<TransactionType | null> => {
            const parsedCompany = parseCompany(args.stockName)
            const parsedAmount = parseAmount(args.amount)
            const parsedPrice = parseAmount(args.price)
            const holding = context.currentUser.usersHoldings.filter((obj: PopulatedHoldingType): boolean => {
                return obj.usersStockName.stockSymbol === parsedCompany
            })[0]
            if (holding) {
                if (holding.usersTotalAmount < parsedAmount) {
                    throw new UserInputError("You don't have enough stocks to sell.")
                } else {
                    const newTransaction = new Transaction({
                        transactionType: "Sell",
                        transactionDate: createDate(),
                        transactionStockPrice: parsedPrice,
                        transactionStockAmount: parsedAmount,
                        transactionStock: holding.usersStockName._id as mongoose.Types.ObjectId
                    })
                    await User.updateOne({_id: context.currentUser._id}, {$set: {
                        usersTransactions: context.currentUser.usersTransactions.concat(newTransaction._id),
                    }})
                    if (holding.usersTotalAmount > parsedAmount) {
                        await Stock.updateOne({_id: holding.usersStockName._id}, {$set: 
                            {stockTotalAmount: holding.usersTotalAmount - parsedAmount}
                        })
                        await User.updateOne({_id: context.currentUser._id}, {$set: {
                            usersHoldings: context.currentUser.usersHoldings.map((obj: PopulatedHoldingType): HoldingType => {
                                if (obj.usersStockName._id?.toString() === holding.usersStockName._id?.toString()) {
                                    return {
                                        _id: obj._id as mongoose.Types.ObjectId,
                                        usersStockName: obj.usersStockName._id as mongoose.Types.ObjectId,
                                        usersTotalAmount: obj.usersTotalAmount - parsedAmount,
                                        usersTotalOriginalPriceValue: obj.usersTotalOriginalPriceValue - (obj.usersTotalOriginalPriceValue / obj.usersTotalAmount) * parsedAmount
                                    }
                                } else {
                                    return {
                                        _id: obj._id as mongoose.Types.ObjectId,
                                        usersStockName: obj.usersStockName._id as mongoose.Types.ObjectId,
                                        usersTotalAmount: obj.usersTotalAmount,
                                        usersTotalOriginalPriceValue: obj.usersTotalOriginalPriceValue
                                    }
                                }
                            }),
                            moneyMade: context.currentUser.moneyMade + ((-1) * (holding.usersTotalOriginalPriceValue / holding.usersTotalAmount) * parsedAmount + parsedAmount * parsedPrice)
                        }})
                    } else {
                        const user = await User.findOne({_id: context.currentUser._id})
                        await User.updateOne({_id: context.currentUser._id}, {$set: {
                            usersHoldings: user?.usersHoldings.filter((obj: HoldingType): boolean => {
                                return obj.usersStockName.toString() !== holding.usersStockName._id?.toString()
                            }),
                            moneyMade: context.currentUser.moneyMade + ((-1) * (holding.usersTotalOriginalPriceValue / holding.usersTotalAmount) * parsedAmount + parsedAmount * parsedPrice)
                        }})
                    }
                    await newTransaction.save()
                    pubsub.publish("STOCK_PURCHASED", {stockPurchased: {transaction: getTransactionToReturn(newTransaction._id), me: context.currentUser.usersUsername, myFollowers: context.currentUser.usersFollowers}})
                    return await getTransactionToReturn(newTransaction._id)
                }
                
            } else {
                throw new UserInputError("You don't own this stock.")
            }
            
        }
    },
    Subscription: {
        stockPurchased: {
            subscribe: withFilter(
                () => pubsub.asyncIterator(["STOCK_PURCHASED"]),
                async (payload, variables) => {
                    const payloadReady = await payload.stockPurchased
                    if (payloadReady.myFollowers.map((o: {id: string, user: PopulatedUserType}) => o.user.usersUsername).includes(variables.username) || variables.username === payloadReady.me) {
                        return true
                    } else {
                        return false
                    }
                }
            )
        },
        followEvent: {
            subscribe: () => pubsub.asyncIterator(["FOLLOWEVENT"])
        },
    }
}

export default resolvers