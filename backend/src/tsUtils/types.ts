import mongoose from "mongoose"

// This file includes all the types that are used in the backend.

// Type that is used in stockEvent-subscription's publishing stage
export interface StockEventType {
    stockEvent: {
        me: string,
        myFollowers: {id: string, user: PopulatedUserType}[],
        transaction: Promise<TransactionType>
    }
}

// Type that is used in followEvent-subscription's publishing stage.
export interface FollowEventType {
    followEvent: {
        followType: "follow" | "unfollow",
        auteur: string,
        object: string,
        date: Date
    },
    myFollowers: {_id: string, user: PopulatedUserType, date: string}[],
}

// Type that is used when fetching data from especially Finnhub's API:
export interface CandlesType {
    close: number,
    date: string,
    high: number,
    low: number,
    open: number,
    volume: number
}

// Same type as CandlesType, but with a date added.
export interface CandlesWithDateType extends Omit<CandlesType, "date"> {
    date: Date
}

// Type that is used when fetching data from Alpha Vantage's API.
export interface AlphaVantageStickType {
    "1. open": string,
    "2. high": string,
    "3. low": string,
    "4. close": string,
    "5. volume": string
}

// Type that is used to verify currentPortfolioValue's client-given mode.
export type Mode = "hours" | "days"

// Type that is used in the progress of reformatting Alpha Vantage's data.
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

// Type that is used when returning reformatted Alpha Vantage's data to client.
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

// Type that is used when returning reformatted Finnhub's data to client.
export interface AnalysisValueType {
    name: string, 
    sticks: CandlesType[]
}

// When returning CPV-data to client.
export interface CurrentPortfolioType {
    wholeValue: number, 
    analysisValues: AnalysisValueType[],
}

// Check if user's log in/sign up information is valid.
export interface UserInformation {
    username: string,
    password: string
}

// Populated holding.
export interface PopulatedHoldingType {
    usersStock: StockType,
    usersTotalAmount: number,
    usersTotalOriginalPriceValue: number,
    _id?: mongoose.Types.ObjectId
}

// Unpopulated holding.
export interface HoldingType {
    usersStock: mongoose.Types.ObjectId,
    usersTotalAmount: number,
    usersTotalOriginalPriceValue: number,
    _id?: mongoose.Types.ObjectId
}

// Check if transaction's type is valid.
enum BuyOrSell {
    Buy = "Buy",
    Sell = "Sell"
}

// Populated transaction.
export interface TransactionType {
    transactionType: BuyOrSell,
    transactionDate: Date,
    transactionStock: StockType,
    transactionStockAmount: number,
    transactionStockPrice: number,
    _id?: mongoose.Types.ObjectId
}

// Type for search result.
export interface FinalSearchResult extends PopulatedUserType {
    currentUser: string
}

// User-model's unpopulated type.
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

// Stock-model's type.
export interface StockType {
    stockSymbol: string,
    _id?: mongoose.Types.ObjectId,
    stockTotalAmount: number
}

// Type for populated User-model.
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