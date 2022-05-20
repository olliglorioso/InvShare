import { AuthenticationError, UserInputError } from "apollo-server-express"
import User from "../models/user"
import { PopulatedUserType, UserInformation, UserType, HoldingType, TransactionType, PopulatedHoldingType, StockType } from "../tsUtils/types"
import mongoose from "mongoose"
import { pubsub } from "./resolvers"
import { parseUserInformation, parseCompany, parseAmount } from "../tsUtils/typeGuards"
import { hash, compare } from "bcrypt"
import jwt from "jsonwebtoken"
import { getIndividualStockInformation } from "../utils/stockApiOperators"
import { createDate, setDate } from "../utils/dateOperators"
import { getTransactionToReturn } from "../utils/randomFunctions"
import Transaction from "../models/transaction"
import Stock from "../models/stock"
require("dotenv").config()


const mutations = { 
    followUser: async (
        _root: undefined,
        {username}: {username: string},
        {currentUser}: {currentUser: PopulatedUserType}
    ): Promise<{result: boolean}> => {
        const parsedUsername = parseCompany(username)
        const user = await User.findOne({usersUsername: parsedUsername})
        if (!user) {
            throw new AuthenticationError("User doesn't exist.", {errorCode: 401})
        }
        else if (currentUser.usersFollowing.find((item: {user: PopulatedUserType, date: string}) => item.user.usersUsername === parsedUsername)) {
            throw new AuthenticationError("You are already following this user.", {errorCode: 401})
        }
        else if (currentUser.usersUsername === username) {
            throw new UserInputError("You can't follow yourself.", {errorCode: 400})
        }
        const parsedUser: UserType = user as UserType
        if (!currentUser) {
            throw new UserInputError("You are not logged in.", {errorCode: 400})
        }
        await User.updateOne({_id: currentUser._id}, {
            $push: {usersFollowing: {user: parsedUser._id, date: new Date().toString()}}, 
            $set: {followingCount: (currentUser.followingCount || 0) + 1}
        })
        await User.updateOne({_id: parsedUser._id}, {
            $push: {usersFollowers: {user: currentUser._id, date: new Date().toString()}}, 
            $set: {followerCount: (parsedUser.followerCount || 0) + 1}
        })
        pubsub.publish("FOLLOWEVENT", {followEvent: {
            followType: "follow", 
            auteur: currentUser.usersUsername, 
            object: parsedUser.usersUsername, 
            date: new Date()},
            myFollowers: currentUser.usersFollowers
        })
        return {result: true}
    },
    unfollowUser: async (
        _root: undefined, 
        {username}: {username: string}, 
        {currentUser}: {currentUser: PopulatedUserType}
    ): Promise<{result: boolean}> => {
        const parsedUsername = parseCompany(username)
        const user = await User.findOne({usersUsername: parsedUsername})
        if (!user) {
            throw new AuthenticationError("User doesn't exist.", {errorCode: 401})
        }
        else if (!currentUser.usersFollowing.find((item: {user: PopulatedUserType, date: string}) => item.user.usersUsername === parsedUsername)) {
            throw new AuthenticationError("You are not following this user.", {errorCode: 401})
        }
        const parsedUser: UserType = user as UserType
        await User.updateOne({_id: currentUser._id}, {
            $pull: {usersFollowing: {user: parsedUser._id}}, 
            $set: {followingCount: (currentUser.followingCount || 0) - 1}
        })
        await User.updateOne({_id: parsedUser._id}, {
            $pull: {usersFollowers: {user: currentUser._id}}, 
            $set: {followerCount: (parsedUser.followerCount || 0) - 1}
        })
        pubsub.publish("FOLLOWEVENT", {followEvent: {
            followType: "unfollow", 
            auteur: currentUser.usersUsername, 
            object: parsedUser.usersUsername, 
            date: new Date()},
            myFollowers: currentUser.usersFollowers
        })
        return {result: true}
    },
    addUser: async (_root: undefined, args: UserInformation): Promise<UserType> => {
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
            followingCount: 0,
            usersFirstPurchaseDate: "x"
        })
        return await user.save();
    },
    login: async (_root: undefined, args: UserInformation): Promise<void | {value: string, username: string}> => {
        const parsedUserInformation = parseUserInformation(args)
        const user = await User.findOne({usersUsername: parsedUserInformation.username})
        const passwordCorrect = user === null
            ? false
            : await compare(parsedUserInformation.password, user.usersPasswordHash)
        if (!(user && passwordCorrect)) {
            throw new AuthenticationError("Incorrect password or username.", {errorCode: 401})
        }
        const userForToken = {
            username: user.usersUsername,
            id: (user._id as string)
        }
        const token = jwt.sign(userForToken, process.env.SECRETFORTOKEN as string);
        return {value: token, username: args.username};
    },
    buyStock: async (
        _root: undefined, 
        {stockName, amount}: {stockName: string, amount: number}, 
        {currentUser}: {currentUser: PopulatedUserType}
    ): Promise<TransactionType | null> => {
        const parsedCompany = parseCompany(stockName)
        const parsedAmount = parseAmount(amount)
        const sticks = await getIndividualStockInformation(parsedCompany, setDate(-96), "5")
        if (sticks.length === 0) {
            throw new UserInputError("Stock doesn't exist.", {errorCode: 401})
        }
        const firstBuyEver = await Stock.findOne({stockSymbol: parsedCompany.toUpperCase()})
        if (currentUser.usersHoldings.length === 0) {
            await User.updateOne({_id: currentUser._id}, {
                $set: {usersFirstPurchaseDate: new Date().toString()}
            })
        }
        if(!firstBuyEver) {
            const newStock = new Stock({
                stockTotalAmount: parsedAmount,
                stockSymbol: parsedCompany.toUpperCase()
            })
            const newTransaction = new Transaction({
                transactionType: "Buy",
                transactionDate: createDate(),
                transactionStockPrice: sticks[sticks.length - 1].close,
                transactionStockAmount: parsedAmount,
                transactionStock: newStock._id as string
            }).populate("transactionStock")
            await newStock.save()
            const user = await User.findOne({usersUsername: currentUser.usersUsername}) as UserType
            const newInformation = {
                usersTransactions: user.usersTransactions.concat(newTransaction._id), 
                usersHoldings: user.usersHoldings.concat({
                    usersStock: newStock._id as mongoose.Types.ObjectId, 
                    usersTotalAmount: parsedAmount, 
                    usersTotalOriginalPriceValue: parsedAmount * newTransaction.transactionStockPrice,
                })
            }
            await User.updateOne({usersUsername: currentUser.usersUsername}, {$set: newInformation})
            await newTransaction.save()
            pubsub.publish("STOCKEVENT", {stockEvent: {
                transaction: getTransactionToReturn(newTransaction._id), 
                me: currentUser.usersUsername, myFollowers: currentUser.usersFollowers}
            })
            return await getTransactionToReturn(newTransaction._id)
        } else {
            const newTransaction = new Transaction({
                transactionType: "Buy",
                transactionDate: createDate(),
                transactionStockPrice: sticks[sticks.length - 1].close,
                transactionStockAmount: parsedAmount,
                transactionStock: firstBuyEver._id as mongoose.Types.ObjectId
            })
            const user = await User.findOne({usersUsername: currentUser.usersUsername}) as UserType
            const holdingToBeChanged = user.usersHoldings.filter((obj: HoldingType): boolean => {
                return (obj.usersStock.toString() === (firstBuyEver._id as mongoose.Types.ObjectId).toString())
            })[0]
            if (holdingToBeChanged) {
                const holdingsArray = user.usersHoldings
                holdingsArray[holdingsArray.indexOf(holdingToBeChanged)] = {
                    ...holdingToBeChanged,
                    usersTotalAmount: (holdingToBeChanged.usersTotalAmount + parsedAmount), 
                    usersTotalOriginalPriceValue: 
                        (holdingToBeChanged.usersTotalOriginalPriceValue + (amount * sticks[sticks.length - 1].close))
                }
                await Stock.updateOne({_id: (firstBuyEver._id as mongoose.Types.ObjectId)}, {
                    $set: {stockTotalAmount: firstBuyEver.stockTotalAmount + amount}
                })
                await User.updateOne(
                    {usersUsername: currentUser.usersUsername},
                    {$set: {
                            usersTransactions: user.usersTransactions.concat(newTransaction._id),
                            usersHoldings: holdingsArray
                        }
                    }
                )
                await newTransaction.save()
                pubsub.publish("STOCKEVENT", {stockEvent: {
                    transaction: getTransactionToReturn(newTransaction._id), 
                    me: currentUser.usersUsername, myFollowers: currentUser.usersFollowers}
                })
                return await getTransactionToReturn(newTransaction._id)
            } else {
                await Stock.updateOne({_id: (firstBuyEver._id as mongoose.Types.ObjectId)},
                    {$set: {
                        stockTotalAmount: firstBuyEver.stockTotalAmount + parsedAmount
                    }
                })
                await User.updateOne({usersUsername: currentUser.usersUsername}, 
                    {$set: {
                        usersTransactions: user.usersTransactions.concat(newTransaction._id),
                        usersHoldings: user.usersHoldings.concat({
                            usersStock: firstBuyEver._id as mongoose.Types.ObjectId,
                            usersTotalAmount: parsedAmount,
                            usersTotalOriginalPriceValue: parsedAmount * newTransaction.transactionStockPrice
                        })
                    }}
                )
                await newTransaction.save()
                pubsub.publish("STOCKEVENT", {stockEvent: {
                    transaction: getTransactionToReturn(newTransaction._id), 
                    me: currentUser.usersUsername, myFollowers: currentUser.usersFollowers}
                })
                return await getTransactionToReturn(newTransaction._id)
            }
            
        }
    },
    sellStock: async (
            _root: undefined, 
            {stockName, amount, price}: {stockName: string, amount: number, price: number}, 
            {currentUser}: {currentUser: PopulatedUserType}
        ): Promise<TransactionType | null> => {
        const parsedCompany = parseCompany(stockName)
        const parsedAmount = parseAmount(amount)
        const parsedPrice = parseAmount(price)
        const holding = currentUser.usersHoldings.filter((obj: PopulatedHoldingType): boolean => {
            return obj.usersStock.stockSymbol === parsedCompany
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
                    transactionStock: holding.usersStock._id as mongoose.Types.ObjectId
                })
                await User.updateOne({_id: currentUser._id}, {$set: {
                    usersTransactions: currentUser.usersTransactions.concat(newTransaction._id),
                }})
                if (holding.usersTotalAmount > parsedAmount) {
                    await Stock.updateOne({_id: holding.usersStock._id}, {
                        $set: {stockTotalAmount: holding.usersTotalAmount - parsedAmount}
                    })
                    await User.updateOne({_id: currentUser._id}, {$set: {
                        usersHoldings: currentUser.usersHoldings.map((obj: PopulatedHoldingType): HoldingType => {
                            if (obj.usersStock._id?.toString() === holding.usersStock._id?.toString()) {
                                return {
                                    _id: obj._id as mongoose.Types.ObjectId,
                                    usersStock: obj.usersStock._id as mongoose.Types.ObjectId,
                                    usersTotalAmount: obj.usersTotalAmount - parsedAmount,
                                    usersTotalOriginalPriceValue: obj.usersTotalOriginalPriceValue - (obj.usersTotalOriginalPriceValue / obj.usersTotalAmount) * parsedAmount
                                }
                            } else {
                                return {
                                    ...obj,
                                    _id: obj._id as mongoose.Types.ObjectId,
                                    usersStock: obj.usersStock._id as mongoose.Types.ObjectId,
                                }
                            }
                        }),
                        moneyMade: currentUser.moneyMade + ((-1) * (holding.usersTotalOriginalPriceValue / holding.usersTotalAmount) * parsedAmount + parsedAmount * parsedPrice)
                    }})
                } else {
                    const user = await User.findOne({_id: currentUser._id}) as UserType
                    await User.updateOne({_id: currentUser._id}, {$set: {
                        usersHoldings: user.usersHoldings.filter((obj: HoldingType): boolean => {
                            return obj.usersStock.toString() !== holding.usersStock._id?.toString()
                        }),
                        moneyMade: currentUser.moneyMade + ((-1) * (holding.usersTotalOriginalPriceValue / holding.usersTotalAmount) * parsedAmount + parsedAmount * parsedPrice)
                    }})
                    const updatedUser = await User.findOne({_id: currentUser._id}) as UserType
                    if (updatedUser.usersHoldings.length === 0) {
                        await User.updateOne({_id: currentUser._id}, {$set: {
                            usersFirstPurchaseDate: "x"
                        }})
                    }
                }
                await newTransaction.save()
                pubsub.publish("STOCKEVENT", {stockEvent: {
                    transaction: getTransactionToReturn(newTransaction._id), 
                    me: currentUser.usersUsername, myFollowers: currentUser.usersFollowers}
                })
                return await getTransactionToReturn(newTransaction._id)
            }
        } else {
            throw new UserInputError("You don't own this stock.")
        }
    },
    resetDatabase: async (): Promise<{result: boolean}> => {
        const ifUserExists = await User.find({usersUsername: "testi800"}).populate("usersHoldings").populate("usersTransactions") as unknown as PopulatedUserType[]
        if (ifUserExists.length > 0) {
            await User.deleteMany({usersUsername: "testi800"})
            await User.deleteMany({usersUsername: "testi900"})
            const stock = await Stock.findOne({stockSymbol: "AAPL"}) as StockType;
            await Stock.findOneAndUpdate({symbol: "AAPL"}, {$set: {stockTotalAmount: stock.stockTotalAmount - 110}})
            await Transaction.deleteMany({_id: ifUserExists[0].usersTransactions[0]._id})
            return {result: true}
        } else {
            return {result: true}
        }
    },
}

export default mutations