import {parseCompany, parseMode} from "../tsUtils/typeGuards"
import { getAlphaVantage, getIndividualStockInformation } from "../utils/stockApiOperators"
import { setDate } from "../utils/dateOperators"
import User from "../models/user"
import {PopulatedUserType, ReadyAlphaVantageValuesType, CandlesType, TransactionType, CurrentPortfolioType, AnalysisValueType, } from "../tsUtils/types"
import {UserInputError} from "apollo-server-express"
import Stock from "../models/stock"

// This file includes all of the GraphQL-queries that can be accessed by the client.

const queries = {
    // This query "stockHistory" uses Alpha Vantage's Stock API to get up to 20 year historical data for a given stock.
    // The prices are of the last prices of each week.
    stockHistory: async (_root: undefined, args: {symbol: unknown}): Promise<ReadyAlphaVantageValuesType> => {
        // Parsing the symbol to make sure it is valid.
        const parsedSymbol = parseCompany(args.symbol)
        // Using self-made function to get the sticks.
        const sticks = await getAlphaVantage(parsedSymbol)
        return sticks
    },
    // This query "me" returns all the information of the user that has logged in.  
    // It uses ApolloServer's context to get the user's information.
    me: (_root: undefined, _args: void, {currentUser}: {currentUser: PopulatedUserType}): PopulatedUserType => {
        return currentUser 
    },
    // This query "searchUser" searches for a user by their username and returns the users that match.
    searchUser: async (
        _root: undefined, 
        {username}: {username: unknown}, 
        {currentUser}: {currentUser: PopulatedUserType}
    ): Promise<PopulatedUserType[]> => {
        // Parsing the username to make sure it is valid.
        const parsedUsername = parseCompany(username)
        // Checking if the user is logged in.
        if (!currentUser) {
            throw new UserInputError("You must be logged in to search for a user.", {errorCode: 400})
        }
        // We search for users whose username starts with args.username (ignoring case)
        // from the server and populate them.
        const users = await User.find({usersUsername: {$regex: `^(?i)${parsedUsername}`}})
            .populate({path: "usersFollowers", populate: {path: "user"}})
            .populate({path: "usersFollowing", populate: {path: "user"}})
            .populate({path: "usersHoldings", populate: {path: "usersStock"}})
            .populate({path: "usersTransactions", populate: {path: "transactionStock"}}) as unknown as PopulatedUserType[]
        // We return the users that were found and remove the current user from the list.
        // The current user is also removed form the list because we don't want to show the current user in the search.
        return users?.filter((user: PopulatedUserType) => user.usersUsername !== currentUser.usersUsername)
    },
    // This query "individualStock" returns the prices of the last 96 hours (price every 5 minutes)
    individualStock: async (_root: undefined, {company}: {company: unknown}): Promise<CandlesType[]> => {
        // Parsing the company to make sure it is valid.
        const parsedCompany = parseCompany(company)
        // Using self-made function to get the sticks.
        const sticks = await getIndividualStockInformation(parsedCompany, setDate(-96), "5")
        // Parsing sticks.
        // If there are no sticks, an error is thrown.
        if (sticks.length === 0) {
            throw new UserInputError("The symbol doesn't exist.", {errorCode: 400})
        }
        return sticks
    },
    // This is a critical query for the client and the Analysis-page. CurrentPortfolioValue-
    // query returns both sticks for the Analysis-page's graph and the whole
    // value of the portfolio.
    currentPortfolioValue: async (
        _root: undefined,
        {mode}: {mode: unknown}, 
        {currentUser}: {currentUser: PopulatedUserType}
    ): Promise<CurrentPortfolioType[]> => {
        // Parsing the mode to make sure it is valid.
        const parsedMode = parseMode(mode)
        // Initializing the sum of the portfolio's whole value.
        let sum = 0
        // Initializing the array of analysis values.
        let values: AnalysisValueType[] = []
        if (currentUser && currentUser.usersTransactions.length > 0) {
            // The code below is executed if the user is logged in and has at least 
            // one transaction.
            // Store the first purchase's date to a variable.
            const firstBuyDate = currentUser.usersFirstPurchaseDate
            // Looping through the holdings of the current user.
            for (const item of currentUser.usersHoldings) {
                // Getting the stock's name since it isn't directly stored in the Holding-object.
                const a = await Stock.find({stockSymbol: item.usersStock.stockSymbol})
                // Initializing the array of sticks.
                let sticks: CandlesType[]
                // Getting the sticks with the self-made function (Finnhub's API). Sticks
                // are taken every five minutes for the last 96 hours. These sticks are
                // primarily used in case the mode is "hours" but also
                // if the length of the "days"-mode's sticks is zero. 
                const denseSticks = await getIndividualStockInformation(a[0].stockSymbol, setDate(-96), "5")
                // Checking the enabled mode and executing code accordingly.
                if (parsedMode === "hours") {
                    // Checking if the date of the first transaction is newer
                    // than the date of the first stick. If it is, we take only
                    // the sticks that are newer than the first transaction.
                    new Date(firstBuyDate) > setDate(-96)
                    ? sticks = denseSticks.filter((item: CandlesType) => {return new Date(item.date) > new Date(firstBuyDate)})
                    : sticks = denseSticks
                    // If the length of the sticks is zero, we just get the latest stick of denseSticks.
                    if (sticks.length === 0) {
                        sticks = sticks.concat(denseSticks[denseSticks.length - 1])
                    }
                    
                } else {
                    // Get the Finnhub API's sticks for every day since first transaction.
                    sticks = await getIndividualStockInformation(a[0].stockSymbol, new Date(firstBuyDate), "D")
                    // If the length of the sticks is zero, we just get the latest stick of denseSticks.
                    if (sticks.length === 0) {
                        sticks = sticks.concat(denseSticks[denseSticks.length - 1])
                    }
                }
                // Adding the sticks of the current holding to the values-array.
                values = values.concat({name: a[0].stockSymbol, sticks})
                // Adding the last price multiplied by holding's amount to the sum-variable.
                sum += sticks[sticks.length - 1].close * item.usersTotalAmount
            }
        } else if (currentUser.usersTransactions.length === 0) {
            // The error below is thrown if the user has no transactions at all (no stocks).
            throw new Error("This user has no transactions.")
        }
        // Returning the whole value of the portfolio and values for graphs.
        return [{wholeValue: sum, analysisValues: values}]
    },
    // GetActions-query returns the actions (at the moment only "stockevents") of the users
    // current user follows. The actions are sorted by date.
    getActions: async (
        _root: undefined,
        _args: void,
        {currentUser}: {currentUser: PopulatedUserType}
    ): Promise<{transaction: TransactionType, transactionOwner: string}[]> => {
        // Creating an array of arrays by mapping through every user that the current user follows and 
        // getting their transactions. We also put transactionOwner in the array to make sure we can
        // get the user that created the transaction.
        const followersTransactions = 
            (currentUser.usersFollowing.map((item: {user: PopulatedUserType, date: string}) => item.user))
            .map((item: PopulatedUserType) => {return {
                transactions: item.usersTransactions, 
                transactionOwner: item.usersUsername}
            })
        // Initializing the final list of transactions and their owners.
        const transactionList: {transaction: TransactionType, transactionOwner: string}[] = []
        // This double-for-loop goes through the above array and puts every transaction
        // in a single list with the owner in the same object.
        for (const item of followersTransactions) {
            for (const o of item.transactions) {
                transactionList.push({transaction: o, transactionOwner: item.transactionOwner})
            }
        }
        // Sorting the list by date.
        const orderedTransactions = transactionList.sort((
            a: {transaction: TransactionType, transactionOwner: string}, 
            b: {transaction: TransactionType, transactionOwner: string}) => {
            return new Date(a.transaction.transactionDate).getTime() - new Date(b.transaction.transactionDate).getTime()
        }).reverse()
        // Returning the sorted list.
        return orderedTransactions
    }
}

export default queries