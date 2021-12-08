import FinnhubAPI, { MarketDataItem } from "@stoqey/finnhub"
import { Resolution } from "@stoqey/finnhub"
import { CandlesWithDateType, AlphaVantageStickType, CandlesType, AlphaVantageValues, ReadyAlphaVantageValuesType } from "../tsUtils/types"
import alpha from "alphavantage"
import { ForbiddenError } from "apollo-server-express"
import { turnToDate } from "./dateOperators"
import { parseAlphaVantange, parseCompany, parseDate, parseFinnhubResponse, parseResolution } from "../tsUtils/typeGuards"

// This file contains functions, that help to get information (sticks) from stock APIs.

// GetIndividualStockInformation-function mainly gets up-to-date data and sticks from
// a specific stock (uses Finnhub Stock API). This information is used mainly in the Analysis page and Buy stocks -page.
// It has three parameters, of which the first is the stock symbol, the second is the start date,
// and the third is the resolution. Final two are optional.
export const getIndividualStockInformation = async (
    symbol: string, 
    startDate?: Date, 
    resolution?: Resolution
): Promise<CandlesType[]> => {
    // Parsing parameters.
    const parsedSymbol = parseCompany(symbol)
    const parsedStartDate = parseDate(startDate)
    const parsedResolution = parseResolution(resolution)
    // Creating a new FinnhubAPI-object. This object gets the data 
    // and uses @stoqey/finnhub-library to do this. 
    // Our private FINNHUB_API_KEY is inserted into the object.
    const finnhubAPI = new FinnhubAPI(process.env.FINNHUB_API_KEY)
    // This function inside the whole function is used to get the data from Finnhub's api.
    // Start date is either the startDate-parameter or 1st December 2020. End date
    // is current date and resolution is either the resolution-parameter or daily.
    const getCandles = async (): Promise<MarketDataItem[] | ForbiddenError> => {
        const candles = await finnhubAPI.getCandles(parsedSymbol, parsedStartDate || new Date(2020,12,1), new Date(), parsedResolution || "D")
        // Parsing candles to CandlesType-type.
        const parsedCandles = parseFinnhubResponse(candles)
        return parsedCandles
    }
    // Executing the above function.
    const candles = await getCandles()
    // Mapping through the candles-array and creating a new array of objects,
    // where each object has original values except date-objects are turned into strings. 
    // eslint-disable-next-line 
    const returnCandles: CandlesType[] = candles.map((a: CandlesWithDateType): CandlesType => {return {...a, date: a.date.toString()}})
    return returnCandles
}

// GetAlphaVantage-function max. 20 years old data (as old as possible) and is used
// when client wants some more information about a specific stock. API for this is Alpha Vantage.
export const getAlphaVantage = async (symbol: string): Promise<ReadyAlphaVantageValuesType> => {
    // Parsing symbol.
    const parsedSymbol = parseCompany(symbol)
    // This time we use alphavantage-library to fetch the dat. We, again, insert
    // our private API-key to the object we create. The sticks are weekly.
    const alphavantage = alpha({key: process.env.ALPHAVANTAGE_API_KEY as string})
    // We fetch sticks from the API with the object that was created above.
    const originalSticks: AlphaVantageValues = await alphavantage.data.weekly(parsedSymbol, "full", "json")
    // Parsing the data we got from the API.
    const parsedOriginalSticks = parseAlphaVantange(originalSticks)
    // We create a new object, where we turn the data into a more usable format.
    const usableSticks = {
        metadata: {
            information: parsedOriginalSticks["Meta Data"]["1. Information"],
            symbol: parsedOriginalSticks["Meta Data"]["2. Symbol"],
            lastRefresh: parsedOriginalSticks["Meta Data"]["3. Last Refreshed"]
        },
        time_series: parsedOriginalSticks["Weekly Time Series"]
    }
    // We turn the usableSticks-object into a usable format, again.
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
    // We turn the data into a format we want to continue with, every object in this list
    // has a date and the stick's value as a number. In other words,
    // whe have a list of object that are formatted {date: string, value: number}
    const returnVals = {metadata: usableSticks["metadata"], time_series: finalSticks["time_series"]
        .map((a: [string, number]) => {return {date: a[0], value: a[1]}})}
    return returnVals
}