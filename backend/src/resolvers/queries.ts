import {parseCompany, parseMode} from "../tsUtils/typeGuards"
import { getAlphaVantage, getIndividualStockInformation } from "../utils/stockApiOperators"
import { setDate } from "../utils/dateOperators"
import User from "../models/user"
import {PopulatedUserType, ReadyAlphaVantageValuesType, CandlesType, TransactionType, CurrentPortfolioType, AnalysisValueType, } from "../tsUtils/types"
import {UserInputError} from "apollo-server-express"
import Stock from "../models/stock"


const queries = {
    stockHistory: async (_root: undefined, args: {symbol: unknown}): Promise<ReadyAlphaVantageValuesType> => {
        const parsedSymbol = parseCompany(args.symbol)
        const sticks = await getAlphaVantage(parsedSymbol)
        return sticks
    },
    me: (_root: undefined, _args: void, {currentUser}: {currentUser: PopulatedUserType}): PopulatedUserType => {
        return currentUser 
    },
    searchUser: async (
        _root: undefined, 
        {username}: {username: unknown}, 
        {currentUser}: {currentUser: PopulatedUserType}
    ): Promise<PopulatedUserType[]> => {
        const parsedUsername = parseCompany(username)
        if (!currentUser) {
            throw new UserInputError("You must be logged in to search for a user.", {errorCode: 400})
        }
        const users = await User.find({usersUsername: {$regex: `^(?i)${parsedUsername}`}})
            .populate({path: "usersFollowers", populate: {path: "user"}})
            .populate({path: "usersFollowing", populate: {path: "user"}})
            .populate({path: "usersHoldings", populate: {path: "usersStock"}})
            .populate({path: "usersTransactions", populate: {path: "transactionStock"}}) as unknown as PopulatedUserType[]
        return users?.filter((user: PopulatedUserType) => user.usersUsername !== currentUser.usersUsername)
    },
    individualStock: async (_root: undefined, {company}: {company: unknown}): Promise<CandlesType[]> => {
        const parsedCompany = parseCompany(company)
        const sticks = await getIndividualStockInformation(parsedCompany, setDate(-96), "5")
        if (sticks.length === 0) {
            throw new UserInputError("The symbol doesn't exist.", {errorCode: 400})
        }
        return sticks
    },
    currentPortfolioValue: async (
        _root: undefined,
        {mode}: {mode: unknown}, 
        {currentUser}: {currentUser: PopulatedUserType}
    ): Promise<CurrentPortfolioType[]> => {
        const parsedMode = parseMode(mode)
        let sum = 0
        let values: AnalysisValueType[] = []
        if (currentUser && currentUser.usersTransactions.length > 0) {
            const firstBuyDate = currentUser.usersFirstPurchaseDate
            for (const item of currentUser.usersHoldings) {
                const a = await Stock.find({stockSymbol: item.usersStock.stockSymbol})
                let sticks: CandlesType[]
                const denseSticks = await getIndividualStockInformation(a[0].stockSymbol, setDate(-96), "5")
                if (parsedMode === "hours") {
                    new Date(firstBuyDate) > setDate(-96)
                    ? sticks = denseSticks.filter((item: CandlesType) => {return new Date(item.date) > new Date(firstBuyDate)})
                    : sticks = denseSticks
                    if (sticks.length === 0) {
                        sticks = sticks.concat(denseSticks[denseSticks.length - 1])
                    }
                    
                } else {
                    sticks = await getIndividualStockInformation(a[0].stockSymbol, new Date(firstBuyDate), "D")
                    if (sticks.length === 0) {
                        sticks = sticks.concat(denseSticks[denseSticks.length - 1])
                    }
                }
                values = values.concat({name: a[0].stockSymbol, sticks})
                sum += sticks[sticks.length - 1].close * item.usersTotalAmount
            }
        } else if (currentUser.usersTransactions.length === 0) {
            throw new Error("This user has no transactions.")
        }
        return [{wholeValue: sum, analysisValues: values}]
    },
    getActions: async (
        _root: undefined,
        _args: void,
        {currentUser}: {currentUser: PopulatedUserType}
    ): Promise<{transaction: TransactionType, transactionOwner: string}[]> => {
        const followersTransactions = 
            (currentUser.usersFollowing.map((item: {user: PopulatedUserType, date: string}) => item.user))
            .map((item: PopulatedUserType) => {return {
                transactions: item.usersTransactions, 
                transactionOwner: item.usersUsername}
            })
        const transactionList: {transaction: TransactionType, transactionOwner: string}[] = []
        for (const item of followersTransactions) {
            for (const o of item.transactions) {
                transactionList.push({transaction: o, transactionOwner: item.transactionOwner})
            }
        }
        const orderedTransactions = transactionList.sort((
            a: {transaction: TransactionType, transactionOwner: string}, 
            b: {transaction: TransactionType, transactionOwner: string}) => {
            return new Date(a.transaction.transactionDate).getTime() - new Date(b.transaction.transactionDate).getTime()
        }).reverse()
        return orderedTransactions
    }
}

export default queries