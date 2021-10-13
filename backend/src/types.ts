import mongoose from "mongoose"

export interface UserInformation {
    username: string,
    password: string
}

export interface PopulatedHoldingType {
    usersStockName: StockType,
    usersTotalAmount: number,
    usersTotalOriginalPriceValue: number,
    _id?: mongoose.Types.ObjectId
}

export interface HoldingType {
    usersStockName: mongoose.Types.ObjectId,
    usersTotalAmount: number,
    usersTotalOriginalPriceValue: number,
    _id?: mongoose.Types.ObjectId
}

export interface OldDataValues {
    metadata: {
        information: string,
        symbol: string,
        lastRefresh: string
    },
    time_series: [string, number][]
}

export interface AlphaVantageStick {
    "1. open": string,
    "2. high": string,
    "3. low": string,
    "4. close": string,
    "5. volume": string
}

export interface AlphaVantageValues {
    "Meta Data": {
        "1. Information": string,
        "2. Symbol": string,
        "3. Last Refreshed": string,
        "4. Time Zone": string
    },
    "Weekly Time Series": {
        [key: string]: {
            "1. open": string,
            "2. high": string,
            "3. low": string,
            "4. close": string,
            "5. volume": string
        }[]
    }
}

export interface CandlesType {
    close: number,
    date: string,
    high: number,
    low: number,
    open: number,
    volume: number
}

export interface CandlesTypeWithDate {
    close: number,
    date: Date,
    high: number,
    low: number,
    open: number,
    volume: number
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

export interface UserType {
    usersUsername: string,
    usersPasswordHash: string, 
    usersTransactions: TransactionType[],
    usersHoldings: HoldingType[],
    _id?: mongoose.Types.ObjectId,
}


export interface StockType {
    stockSymbol: string,
    _id?: mongoose.Types.ObjectId,
    stockTotalAmount: number
}

export interface HoldingWithStockType {
    _id?: StockType
    usersStockName: mongoose.Types.ObjectId,
    usersTotalAmount: number,
    usersTotalOriginalPriceValue: number,
}

export interface PopulatedUserType {
    usersUsername: string,
    usersPasswordHash: string, 
    usersTransactions: TransactionType[],
    usersHoldings: PopulatedHoldingType[],
    _id?: mongoose.Types.ObjectId
}