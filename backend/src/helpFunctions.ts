import FinnhubAPI, { MarketDataItem } from "@stoqey/finnhub"
import { Resolution } from "@stoqey/finnhub"
import { CandlesTypeWithDate, AlphaVantageStick, CandlesType, AlphaVantageValues, ReadyAlphaVantageValues } from "./types"
import alpha from "alphavantage"
import { ForbiddenError } from "apollo-server-express"
import mongoose from "mongoose"
import { TransactionType } from "./types"
import Transaction from "./models/transaction"

export const turnToDate = (date: string): string => {
    const res = new Date(parseInt(date.substring(0,4)), parseInt(date.substring(5,7)) - 1, parseInt(date.substring(8, 10))).toString()
    return res
}

export const createDate = () => new Date((new Date()).setHours(new Date().getHours()))

export const getIndividualStockInformation = async (symbol: string, startDate?: Date, resolution?: Resolution): Promise<CandlesType[]> => {
    const finnhubAPI = new FinnhubAPI(process.env.FINNHUB_API_KEY)
    
    const getCandles = async (): Promise<MarketDataItem[] | ForbiddenError> => {
        const candles = await finnhubAPI.getCandles(symbol, startDate || new Date(2020,12,1), new Date(), resolution || "D")
        return candles
    }
    const candles = await getCandles()
    // eslint-disable-next-line 
    const returnCandles: CandlesType[] = candles.map((a: CandlesTypeWithDate): CandlesType => {return {...a, date: a.date.toString()}})
    return returnCandles
}

export const getAlphaVantage = async (symbol: string): Promise<ReadyAlphaVantageValues> => {
    const alphavantage = alpha({key: process.env.ALPHAVANTAGE_API_KEY as string})
    const data2: AlphaVantageValues = await alphavantage.data.weekly(symbol, "full", "json")
    const values2 = {
        metadata: {
            information: data2["Meta Data"]["1. Information"],
            symbol: data2["Meta Data"]["2. Symbol"],
            lastRefresh: data2["Meta Data"]["3. Last Refreshed"]
        },
        time_series: data2["Weekly Time Series"]
    }

    const values3 = {
        metadata: values2.metadata,
        time_series: Object.keys(values2["time_series"])
            .reverse()
            .map((one: string): [string, number] => {
                return (
                    [turnToDate(one), parseFloat((values2.time_series[one] as unknown as AlphaVantageStick)["4. close"])]
                )
            })
    }


    const returnVals = {metadata: values2["metadata"], time_series: values3["time_series"]
        .map((a: [string, number]) => {return {date: a[0], value: a[1]}})}
    return returnVals
}

export const getTransactionToReturn = async (id: mongoose.Types.ObjectId): Promise<TransactionType | null> => await Transaction.findOne({_id: id}).populate("transactionStock")
