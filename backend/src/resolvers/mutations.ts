import { AuthenticationError, UserInputError } from "apollo-server-express"
import User from "../models/user"
import { PopulatedUserType, UserInformation, UserType, HoldingType, TransactionType, PopulatedHoldingType } from "../tsUtils/types"
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
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config()

// This field includes the mutations that are available for the client.

const mutations = { 
    // This is for clearing the test database.
    resetDatabase: async (): Promise<{result: boolean}> => {
        console.log("moi")
        if (process.env.NODE_ENV === "test") {
            await User.deleteMany({})
            await Stock.deleteMany({})
            await Transaction.deleteMany({})
            return {result: true}
        } else {
            return {result: false}
        }
    },
    // This mutation "followUser" is used to follow a user.
    followUser: async (
        _root: undefined,
        {username}: {username: string},
        {currentUser}: {currentUser: PopulatedUserType}
    ): Promise<{result: boolean}> => {
        // Parsing the username to check if it is valid.
        const parsedUsername = parseCompany(username)
        // Finding the user from the database.
        const user = await User.findOne({usersUsername: parsedUsername})
        // Checking if the user exists.
        if (!user) {
            throw new AuthenticationError("User doesn't exist.", {errorCode: 401})
        }
        // Checking if the user is already being followed.
        else if (currentUser.usersFollowing.find((item: {user: PopulatedUserType, date: string}) => item.user.usersUsername === parsedUsername)) {
            throw new AuthenticationError("You are already following this user.", {errorCode: 401})
        }
        // An error is thrown, if the user argument is the same as current user.
        else if (currentUser.usersUsername === username) {
            throw new UserInputError("You can't follow yourself.", {errorCode: 400})
        }
        // Now that user exists, let's define it as UserType.
        const parsedUser: UserType = user as UserType
        // Checking if the user is logged in.
        if (!currentUser) {
            throw new UserInputError("You are not logged in.", {errorCode: 400})
        }
        // If there are no errors, the user is followed by updating both
        // the current user and the user that is being followed.
        await User.updateOne({_id: currentUser._id}, {
            $push: {usersFollowing: {user: parsedUser._id, date: new Date().toString()}}, 
            $set: {followingCount: (currentUser.followingCount || 0) + 1}
        })
        await User.updateOne({_id: parsedUser._id}, {
            $push: {usersFollowers: {user: currentUser._id, date: new Date().toString()}}, 
            $set: {followerCount: (parsedUser.followerCount || 0) + 1}
        })
        // Information about the event is published with PubSub-object in order to 
        // update all the relevant clients.
        pubsub.publish("FOLLOWEVENT", {followEvent: {
            followType: "follow", 
            auteur: currentUser.usersUsername, 
            object: parsedUser.usersUsername, 
            date: new Date()},
            myFollowers: currentUser.usersFollowers
        })
        return {result: true}
    },
    // This mutation "unfollowUser" is used to unfollow a user.
    unfollowUser: async (
        _root: undefined, 
        {username}: {username: string}, 
        {currentUser}: {currentUser: PopulatedUserType}
    ): Promise<{result: boolean}> => {
        // Parsing the username to check if it is valid.
        const parsedUsername = parseCompany(username)
        // Finding the user from the database.
        const user = await User.findOne({usersUsername: parsedUsername})
        // Checking if the user exists.
        if (!user) {
            throw new AuthenticationError("User doesn't exist.", {errorCode: 401})
        }
        // Checking if the user is being followed before the unfollow.
        else if (!currentUser.usersFollowing.find((item: {user: PopulatedUserType, date: string}) => item.user.usersUsername === parsedUsername)) {
            throw new AuthenticationError("You are not following this user.", {errorCode: 401})
        }
        // Now that user exists, let's define it as UserType.
        const parsedUser: UserType = user as UserType
        // If there are no errors, the user is unfollowed by updating both
        // the current user and the user that is being unfollowed.
        await User.updateOne({_id: currentUser._id}, {
            $pull: {usersFollowing: {user: parsedUser._id}}, 
            $set: {followingCount: (currentUser.followingCount || 0) - 1}
        })
        await User.updateOne({_id: parsedUser._id}, {
            $pull: {usersFollowers: {user: currentUser._id}}, 
            $set: {followerCount: (parsedUser.followerCount || 0) - 1}
        })
        // Information about the event is published with PubSub-object in order to 
        // update all the relevant clients.
        pubsub.publish("FOLLOWEVENT", {followEvent: {
            followType: "unfollow", 
            auteur: currentUser.usersUsername, 
            object: parsedUser.usersUsername, 
            date: new Date()},
            myFollowers: currentUser.usersFollowers
        })
        return {result: true}
    },
    // This mutation "addUser" is used to add a new user to the database.
    addUser: async (_root: undefined, args: UserInformation): Promise<UserType> => {
        // Parsing the user information to check if it is valid.
        const parsedUserInformation = parseUserInformation(args)
        // Checking if the username is free.
        const isUsernameFree = await User.find({usersUsername: parsedUserInformation.username})
        // If the username is reserved, an error is thrown.
        if (isUsernameFree.length > 0) {
            throw new UserInputError("The username is already in use.", {errorCode: 400})
        }
        // If the username is free, the password inputted by the user is hashed
        // and the encrypted password is stored into a variable. Ten salt rounds are used.
        const passwordHash = await hash(parsedUserInformation.password, 10)
        // The user-object is created. We store the hashed password
        // to the database instead of the plain password.
        // FirstPurchaseDate is set to x, because no stocks have been bought yet.
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
        // The new object is saved to the database.
        return await user.save();
    },
    // This mutation "login" is used to log in.
    login: async (_root: undefined, args: UserInformation): Promise<void | {value: string, username: string}> => {
        // Parsing the user information to check if it is valid.
        const parsedUserInformation = parseUserInformation(args)
        // Finding the user from the database.
        const user = await User.findOne({usersUsername: parsedUserInformation.username})
        // Comparing the hashed password from the database with the inputted password.
        const passwordCorrect = user === null
            ? false
            : await compare(parsedUserInformation.password, user.usersPasswordHash)
        // If the password is incorrect, an error is thrown.
        if (!(user && passwordCorrect)) {
            throw new AuthenticationError("Incorrect password or username.", {errorCode: 401})
        }
        // If the password is correct, a token is created.
        const userForToken = {
            username: user.usersUsername,
            id: (user._id as string)
        }
        const token = jwt.sign(userForToken, process.env.SECRETFORTOKEN as string);
        // The token is returned and the username as well.
        return {value: token, username: args.username};
    },
    // This mutation "buyStock" is used to buy a stock with its last price.
    buyStock: async (
        _root: undefined, 
        {stockName, amount}: {stockName: string, amount: number}, 
        {currentUser}: {currentUser: PopulatedUserType}
    ): Promise<TransactionType | null> => {
        // Parsing the company name to check if it is valid.
        const parsedCompany = parseCompany(stockName)
        // Parsing the amount to check if it is valid.
        const parsedAmount = parseAmount(amount)
        // Using self-made function to get the sticks from last 96 hours with the price of every 5 minutes.
        const sticks = await getIndividualStockInformation(parsedCompany, setDate(-96), "5")
        // Second check that the stock exist.
        if (sticks.length === 0) {
            throw new UserInputError("Stock doesn't exist.", {errorCode: 401})
        }
        // Checking if the company has been bought by this or any other user.
        const firstBuyEver = await Stock.findOne({stockSymbol: parsedCompany.toUpperCase()})
        // Next if-statement happens only if the user has an empty portfolio
        // --> either the user is brand new or has sold all their stocks.
        if (currentUser.usersHoldings.length === 0) {
            // We set the first purchase date to the current date so that
            // currentPortfolioValue-query knows that the portfolio
            // was empty just before this purchase.
            await User.updateOne({_id: currentUser._id}, {
                $set: {usersFirstPurchaseDate: new Date().toString()}
            })
        }
        if(!firstBuyEver) {
            // Code below is executed if the company has not been bought by any user.
            // A new Stock-object is created and its total amount is the amount of this particular purchase.
            // The symbol is always uppercase.
            const newStock = new Stock({
                stockTotalAmount: parsedAmount,
                stockSymbol: parsedCompany.toUpperCase()
            })
            // A new Transaction-object is created and its type is "Buy", of course.
            // The date is the current date.
            // The price is the last price of the stock. The prices have have been fetched
            // with the self-made function getIndividualStockInformation.
            const newTransaction = new Transaction({
                transactionType: "Buy",
                transactionDate: createDate(),
                transactionStockPrice: sticks[sticks.length - 1].close,
                transactionStockAmount: parsedAmount,
                transactionStock: newStock._id as string
            }).populate("transactionStock")
            // The Stock-object is saved to the database.
            await newStock.save()
            // Searching for the current user from the database. We redefine it as 
            // UserType instead of UserType | undefined, because the user exists
            // no matter what.
            const user = await User.findOne({usersUsername: currentUser.usersUsername}) as UserType
            // A newInformation-objet is created to simplify the code. This object includes
            // the new lists of usersTransactions and usersHoldings.
            const newInformation = {
                usersTransactions: user.usersTransactions.concat(newTransaction._id), 
                usersHoldings: user.usersHoldings.concat({
                    usersStock: newStock._id as mongoose.Types.ObjectId, 
                    usersTotalAmount: parsedAmount, 
                    usersTotalOriginalPriceValue: parsedAmount * newTransaction.transactionStockPrice,
                })
            }
            // The current user is updated in the database with the help of
            // previously created newInformation-object.
            await User.updateOne({usersUsername: currentUser.usersUsername}, {$set: newInformation})
            // The Transaction-object is saved to the database.
            await newTransaction.save()
            // Information about the event is published with PubSub-object in order to 
            // update all the relevant clients.
            pubsub.publish("STOCKEVENT", {stockEvent: {
                transaction: getTransactionToReturn(newTransaction._id), 
                me: currentUser.usersUsername, myFollowers: currentUser.usersFollowers}
            })
            // The Transaction-object is returned to follow type definitions' requirements.
            return await getTransactionToReturn(newTransaction._id)
        } else {
            // The code below is executed if the company has previously been purchased by any user.
            // Creating a new Transaction-object.
            // The date is the current date.
            // The price is the last price of the stock. The prices have have been fetched
            // with the self-made function getIndividualStockInformation.
            const newTransaction = new Transaction({
                transactionType: "Buy",
                transactionDate: createDate(),
                transactionStockPrice: sticks[sticks.length - 1].close,
                transactionStockAmount: parsedAmount,
                transactionStock: firstBuyEver._id as mongoose.Types.ObjectId
            })
            // Searching for the current user from the database. We redefine it as 
            // UserType instead of UserType | undefined, because the user exists
            // no matter what. 
            const user = await User.findOne({usersUsername: currentUser.usersUsername}) as UserType
            // We search for the holding that has to be changed in the User-object.
            // There are two options: either the user has already purchased the stock,
            // or the stock has been previously purchased by another user/users.
            const holdingToBeChanged = user.usersHoldings.filter((obj: HoldingType): boolean => {
                return (obj.usersStock.toString() === (firstBuyEver._id as mongoose.Types.ObjectId).toString())
            })[0]
            if (holdingToBeChanged) {
                // The code below is executed if the stock has been previously purchased by this particular user.
                // One holding is updated with the helper of holdingsArray-array. First of all,
                // holdingToBeChanged is searched from the user's holdings and then updated.
                // UsersTotalAmount is increased with this purchase's amount, and the total-
                // OriginalPriceValue is increased with the price of this purchase * amount.
                const holdingsArray = user.usersHoldings
                holdingsArray[holdingsArray.indexOf(holdingToBeChanged)] = {
                    ...holdingToBeChanged,
                    usersTotalAmount: (holdingToBeChanged.usersTotalAmount + parsedAmount), 
                    usersTotalOriginalPriceValue: 
                        (holdingToBeChanged.usersTotalOriginalPriceValue + (amount * sticks[sticks.length - 1].close))
                }
                // The relevant Stock-object is updated with the new total amount.
                await Stock.updateOne({_id: (firstBuyEver._id as mongoose.Types.ObjectId)}, {
                    $set: {stockTotalAmount: firstBuyEver.stockTotalAmount + amount}
                })
                // The current user is updated (its transactions and holdings).
                await User.updateOne(
                    {usersUsername: currentUser.usersUsername},
                    {$set: {
                            usersTransactions: user.usersTransactions.concat(newTransaction._id),
                            usersHoldings: holdingsArray
                        }
                    }
                )
                // The newTransaction-object is saved to the database.
                await newTransaction.save()
                // Information about the event is published with PubSub-object in order to
                // update all the relevant clients.
                pubsub.publish("STOCKEVENT", {stockEvent: {
                    transaction: getTransactionToReturn(newTransaction._id), 
                    me: currentUser.usersUsername, myFollowers: currentUser.usersFollowers}
                })
                // The Transaction-object is returned to follow gql's type definitions' requirements.
                return await getTransactionToReturn(newTransaction._id)
            } else {
                // The code below is executed if the stock has not been previously purchased by this particular user.
                // The relevant Stock-object is updated with the new total amount.
                await Stock.updateOne({_id: (firstBuyEver._id as mongoose.Types.ObjectId)},
                    {$set: {
                        stockTotalAmount: firstBuyEver.stockTotalAmount + parsedAmount
                    }
                })
                // The current user is updated (its transactions and holdings).
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
                // The newTransaction-object is saved to the database.
                await newTransaction.save()
                // Information about the event is published with PubSub-object in order to
                // update all the relevant clients.
                pubsub.publish("STOCKEVENT", {stockEvent: {
                    transaction: getTransactionToReturn(newTransaction._id), 
                    me: currentUser.usersUsername, myFollowers: currentUser.usersFollowers}
                })
                // The Transaction-object is returned to follow gql's type definitions' requirements.
                return await getTransactionToReturn(newTransaction._id)
            }
            
        }
    },
    // This mutation "sellStock" is used to sell a stock.
    sellStock: async (
            _root: undefined, 
            {stockName, amount, price}: {stockName: string, amount: number, price: number}, 
            {currentUser}: {currentUser: PopulatedUserType}
        ): Promise<TransactionType | null> => {
        // The company's name is parsed to check if it is valid.
        const parsedCompany = parseCompany(stockName)
        // The amount-parameter is parsed to check if it is valid.
        const parsedAmount = parseAmount(amount)
        // The price-parameter is parsed to check if it is valid.
        const parsedPrice = parseAmount(price)
        // The corresponding holding is searched from the current user's holdings.
        const holding = currentUser.usersHoldings.filter((obj: PopulatedHoldingType): boolean => {
            return obj.usersStock.stockSymbol === parsedCompany
        })[0]
        if (holding) {
            // If there is a corresponding holding, the code below is executed. In other words,
            // the user has this stock and can sell it.
            // Checking if user has more or as many stocks as he wants to sell. Otherwise, error.
            if (holding.usersTotalAmount < parsedAmount) {
                throw new UserInputError("You don't have enough stocks to sell.")
            } else {
                // The code below is executed if the user has enough stocks to sell.
                // A new Transaction-object is created.
                const newTransaction = new Transaction({
                    transactionType: "Sell",
                    transactionDate: createDate(),
                    transactionStockPrice: parsedPrice,
                    transactionStockAmount: parsedAmount,
                    transactionStock: holding.usersStock._id as mongoose.Types.ObjectId
                })
                // The current user is updated in the database (so far only user's transactions).
                await User.updateOne({_id: currentUser._id}, {$set: {
                    usersTransactions: currentUser.usersTransactions.concat(newTransaction._id),
                }})
                if (holding.usersTotalAmount > parsedAmount) {
                    // The code below is executed, if the user has MORE stocks than he wants to sell.
                    // The relevant Stock-object is updated with the new total amount.
                    await Stock.updateOne({_id: holding.usersStock._id}, {
                        $set: {stockTotalAmount: holding.usersTotalAmount - parsedAmount}
                    })
                    // The current user is updated in the database.
                    await User.updateOne({_id: currentUser._id}, {$set: {
                        // Firstly, usersHoldings of the current user is updated. We map through the
                        // usersHoldings-array and if the stock is the one we want to sell, we update
                        // its holding's usersTotalAmount and usersTotalOriginalPriceValue to correct values.
                        // Otherwise, we keep the old values.
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
                        // Also moneymade is updated. The moneymade is calculated by multiplying the
                        // sales price with the sales amount, and substracting the average purchase value of the stock
                        // times the sales amount. In other words, moneymade is the difference between the
                        // average purchase value of the stock and the sales price. It can be both negative
                        // and positive.
                        moneyMade: currentUser.moneyMade + ((-1) * (holding.usersTotalOriginalPriceValue / holding.usersTotalAmount) * parsedAmount + parsedAmount * parsedPrice)
                    }})
                } else {
                    // The code below is executed, if the user has as many stocks as he wants to sell.
                    // Finding the current user from the database and defining as UserType, since it cannot be undefined.
                    const user = await User.findOne({_id: currentUser._id}) as UserType
                    // Updating the corresponding User in the database (its holdings and moneymade)
                    await User.updateOne({_id: currentUser._id}, {$set: {
                        // We include only the holdings that are not involved in the sale.
                        usersHoldings: user.usersHoldings.filter((obj: HoldingType): boolean => {
                            return obj.usersStock.toString() !== holding.usersStock._id?.toString()
                        }),
                        // Moneymade is updated in the same way as before.
                        moneyMade: currentUser.moneyMade + ((-1) * (holding.usersTotalOriginalPriceValue / holding.usersTotalAmount) * parsedAmount + parsedAmount * parsedPrice)
                    }})
                    // This next step happens only if there is a possibility 
                    // that user might remain with no positions at all.
                    const updatedUser = await User.findOne({_id: currentUser._id}) as UserType
                    if (updatedUser.usersHoldings.length === 0) {
                        // If the user has no more holdings, the code below is executed.
                        // We set the usersFirstPurchaseDate to x, because the user has no more holdings.
                        // And so we have to update the date in the next purchase.
                        await User.updateOne({_id: currentUser._id}, {$set: {
                            usersFirstPurchaseDate: "x"
                        }})
                    }
                }
                // The newTransaction-object is saved to the database.
                await newTransaction.save()
                // Information about the event is published with PubSub-object in order to
                // update all the relevant clients. The type of the event can be found
                // from the returned transaction.
                pubsub.publish("STOCKEVENT", {stockEvent: {
                    transaction: getTransactionToReturn(newTransaction._id), 
                    me: currentUser.usersUsername, myFollowers: currentUser.usersFollowers}
                })
                // The Transaction-object is returned to follow gql's type definitions' requirements.
                return await getTransactionToReturn(newTransaction._id)
            }
        } else {
            // This error is thrown if the user doesn't have the stock he wants to sell.
            throw new UserInputError("You don't own this stock.")
        }
    }
}

export default mutations