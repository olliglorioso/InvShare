import FinnhubAPI, { MarketDataItem } from "@stoqey/finnhub"
import { Resolution } from "@stoqey/finnhub"
import { CandlesWithDateType, AlphaVantageStickType, CandlesType, AlphaVantageValues, ReadyAlphaVantageValuesType } from "../tsUtils/types"
import alpha from "alphavantage"
import { ForbiddenError } from "apollo-server-express"
import { turnToDate } from "./dateOperators"
import { parseAlphaVantange, parseCompany, parseDate, parseFinnhubResponse, parseResolution } from "../tsUtils/typeGuards"


export const getIndividualStockInformation = async (
    symbol: string, 
    startDate?: Date, 
    resolution?: Resolution
): Promise<CandlesType[]> => {
    const parsedSymbol = parseCompany(symbol)
    const parsedStartDate = parseDate(startDate)
    const parsedResolution = parseResolution(resolution)
    const finnhubAPI = new FinnhubAPI(process.env.FINNHUB_API_KEY)
    const getCandles = async (): Promise<MarketDataItem[] | ForbiddenError> => {
        const candles = await finnhubAPI.getCandles(parsedSymbol, parsedStartDate || new Date(2020,12,1), new Date(), parsedResolution || "D")
        const parsedCandles = parseFinnhubResponse(candles)
        return parsedCandles
    }
    const candles = await getCandles()
    const returnCandles: CandlesType[] = candles.map((a: CandlesWithDateType): CandlesType => {return {...a, date: a.date.toString()}})
    return returnCandles
}

export const getAlphaVantage = async (symbol: string): Promise<ReadyAlphaVantageValuesType> => {
    const parsedSymbol = parseCompany(symbol)
    const alphavantage = alpha({key: process.env.ALPHAVANTAGE_API_KEY as string})
    const originalSticks: AlphaVantageValues = await alphavantage.data.weekly(parsedSymbol, "full", "json")
    const parsedOriginalSticks = parseAlphaVantange(originalSticks)
    const usableSticks = {
        metadata: {
            information: parsedOriginalSticks["Meta Data"]["1. Information"],
            symbol: parsedOriginalSticks["Meta Data"]["2. Symbol"],
            lastRefresh: parsedOriginalSticks["Meta Data"]["3. Last Refreshed"]
        },
        time_series: parsedOriginalSticks["Weekly Time Series"]
    }
    const finalSticks = {
        metadata: usableSticks.metadata,
        time_series: Object.keys(usableSticks["time_series"])
            .reverse()
            .map((one: string): [string, number] => {
                return (
                    [turnToDate(one), parseFloat((usableSticks.time_series[one] as unknown as AlphaVantageStickType)["4. close"])]
                )
            })
    }
    const returnVals = {metadata: usableSticks["metadata"], time_series: finalSticks["time_series"]
        .map((a: [string, number]) => {return {date: a[0], value: a[1]}})}
    return returnVals
}