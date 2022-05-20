import mongoose from "mongoose"


export interface StockEventType {
    stockEvent: {
        me: string,
        myFollowers: {id: string, user: PopulatedUserType}[],
        transaction: Promise<TransactionType>
    }
}

export interface FollowEventType {
    followEvent: {
        followType: "follow" | "unfollow",
        auteur: string,
        object: string,
        date: Date
    },
    myFollowers: {_id: string, user: PopulatedUserType, date: string}[],
}

export interface CandlesType {
    close: number,
    date: string,
    high: number,
    low: number,
    open: number,
    volume: number
}

export interface CandlesWithDateType extends Omit<CandlesType, "date"> {
    date: Date
}

export interface AlphaVantageStickType {
    "1. open": string,
    "2. high": string,
    "3. low": string,
    "4. close": string,
    "5. volume": string
}

export type Mode = "hours" | "days"

export interface AlphaVantageValues {
    "Meta Data": {
        "1. Information": string,
        "2. Symbol": string,
        "3. Last Refreshed": string,
        "4. Time Zone": string
    },
    "Weekly Time Series": {
        [key: string]: AlphaVantageStickType[]
    }
}

export interface ReadyAlphaVantageValuesType {
    metadata: {
        information: string,
        symbol: string,
        lastRefresh: string
    },
    time_series: {
        date: string,
        value: number
    }[]
}

export interface AnalysisValueType {
    name: string, 
    sticks: CandlesType[]
}

export interface CurrentPortfolioType {
    wholeValue: number, 
    analysisValues: AnalysisValueType[],
}

export interface UserInformation {
    username: string,
    password: string
}

export interface PopulatedHoldingType {
    usersStock: StockType,
    usersTotalAmount: number,
    usersTotalOriginalPriceValue: number,
    _id?: mongoose.Types.ObjectId
}

export interface HoldingType {
    usersStock: mongoose.Types.ObjectId,
    usersTotalAmount: number,
    usersTotalOriginalPriceValue: number,
    _id?: mongoose.Types.ObjectId
}

enum BuyOrSell {
    Buy = "Buy",
    Sell = "Sell"
}

export interface TransactionType {
    transactionType: BuyOrSell,
    transactionDate: Date,
    transactionStock: StockType,
    transactionStockAmount: number,
    transactionStockPrice: number,
    _id?: mongoose.Types.ObjectId
}

export interface FinalSearchResult extends PopulatedUserType {
    currentUser: string
}

export interface UserType {
    usersUsername: string,
    usersPasswordHash: string, 
    usersTransactions: TransactionType[],
    usersHoldings: HoldingType[],
    _id?: mongoose.Types.ObjectId,
    moneyMade: number,
    usersFirstPurchaseDate: string
    usersFollowers: UserType[],
    usersFollowing: UserType[],
    followerCount: number,
    followingCount: number
}

export interface StockType {
    stockSymbol: string,
    _id?: mongoose.Types.ObjectId,
    stockTotalAmount: number
}

export interface PopulatedUserType {
    usersUsername: string,
    usersPasswordHash: string, 
    usersFirstPurchaseDate: string,
    usersTransactions: TransactionType[],
    usersHoldings: PopulatedHoldingType[],
    _id?: mongoose.Types.ObjectId,
    moneyMade: number,
    followerCount: number,
    followingCount: number,
    usersFollowers: {user: PopulatedUserType, date: string}[],
    usersFollowing: {user: PopulatedUserType, date: string}[]
}