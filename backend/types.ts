import mongoose from 'mongoose'

export interface Holding {
    usersStockName: mongoose.Types.ObjectId,
    usersTotalAmount: number,
    usersTotalOriginalPriceValue: number
}

export interface UserType {
    usersUsername: string,
    usersPasswordHash: string, 
    usersTransactions: string[],
    usersHoldings: Holding[],
    _id?: mongoose.Types.ObjectId,
}

export interface CandlesType {
    close: number,
    date: string,
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
    transactionStock: mongoose.Types.ObjectId,
    transactionStockAmount: number,
    transactionStockPrice: number,
    _id?: mongoose.Types.ObjectId
}

export interface StockType {
    stockSymbol: string,
    _id?: mongoose.Types.ObjectId,
    stockTotalAmount: number
}