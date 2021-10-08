import mongoose from "mongoose"

export interface UserInformation {
    username: string,
    password: string
}

export interface Holding {
    usersStockName: mongoose.Types.ObjectId,
    usersTotalAmount: number,
    usersTotalOriginalPriceValue: number,
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
    usersHoldings: Holding[],
    _id?: mongoose.Types.ObjectId,
}

export interface StockType {
    stockSymbol: string,
    _id: mongoose.Types.ObjectId,
    stockTotalAmount: number
}

export interface HoldingWithStockType {
    _id?: StockType
    usersStockName: mongoose.Types.ObjectId,
    usersTotalAmount: number,
    usersTotalOriginalPriceValue: number,
}