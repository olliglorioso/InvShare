import mongoose from "mongoose"

export interface AnalysisData {
    name: string,
    __typename: "AnalysisData",
    sticks: CandleStock[]
}

export interface Positions {
    usersTotalAmount: number,
    usersTotalOriginalPriceValue: number,
    __typename: string,
    usersStockName: StockType
}

export type CandleStock = {
    date: string,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number,
    __typename: string
}

export interface MyFormValues {
    company: string,
    amount: string,
    price_per_stock: string
}

export type StockType = {
    stockSymbol: string,
    stockTotalAmount: number,
    __typename: string
}
export type TransactionType = {
    transactionDate: string,
    transactionStock: StockType,
    transactionStockAmount: number,
    transactionStockPrice: number,
    transactionType: string,
    __typename: string,
    _id: mongoose.Types.ObjectId,
}