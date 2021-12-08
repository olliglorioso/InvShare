import { UserInputError } from "apollo-server-express"
import { AlphaVantageValues, Mode, UserInformation, CandlesType } from "./types"
import { InvalidApiResponseError } from "../utils/customMadeErrors"
import { MarketDataItem } from "@stoqey/finnhub"
import { Resolution } from "@stoqey/finnhub"

// This function includes essential functions, so called "type guards",
// to check if the type of the user input is correct and valid. 

// This function check if a supposed-text is string and turns it into a string.
const isString = (text: unknown): text is string => {
    return typeof text === "string" || text instanceof String
}

// This function check if a supposed-number is number and turns it into a number.
const isNumber = (numb: unknown): numb is number => {
    return numb instanceof Number || typeof numb === "number"
}

// Check if given parameter is a date.
const isDate = (date: unknown): date is Date => {
    return date instanceof Date
}

// Parse to date.
export const parseDate = (date: unknown): Date => {
    if (isDate(date)) {
        return date
    } else if (isString(date)) {
        return new Date(date)
    } else {
        throw new Error("Invalid date given in the backend.")
    }
}

// Parse to Resolution.
export const parseResolution = (resolution: unknown): Resolution => {
    if (isString(resolution)) {
        switch (resolution) {
            case "1":
                return "1"
            case "5":
                return "5"
            case "15":
                return "15"
            case "30":
                return "30"
            case "60":
                return "60"
            case "D":
                return "D"
            case "W":
                return "W"
            case "M":
                return "M"
            default:
                throw new Error("Invalid resolution given in the backend.")
        }
    } else {
        throw new Error("Invalid resolution given in the backend.")
    }
}

// Checks if the parameter has valid Alpha Vantage data.
const isAlphaVantageValues = (alphaVantageValues: unknown): alphaVantageValues is AlphaVantageValues => {
    return alphaVantageValues instanceof Object && alphaVantageValues.hasOwnProperty("Meta Data") &&
        alphaVantageValues.hasOwnProperty("Weekly Time Series")
}

// Check if a single candle is valid.
const isCandlesType = (candles: unknown): candles is CandlesType => {
    return candles instanceof Object && candles.hasOwnProperty("close") &&
        candles.hasOwnProperty("date") && candles.hasOwnProperty("high") &&
        candles.hasOwnProperty("low") && candles.hasOwnProperty("open") &&
        candles.hasOwnProperty("volume")
}

// Check if a market data item is valid.
const isMarketDataItem = (marketDataItems: unknown): marketDataItems is MarketDataItem[] => {
    return marketDataItems instanceof Array && marketDataItems.every(item => isCandlesType(item))
}

// Check if the whole finnhub's data is valid.
export const parseFinnhubResponse = (finnhubResponse: unknown): MarketDataItem[] => {
    if (!finnhubResponse || !Array.isArray(finnhubResponse)) {
        throw new InvalidApiResponseError("Finnhub's API-response is not a list / is undefined.")
    }
    if (finnhubResponse.length === 0) {
        throw new UserInputError("The stock does not exist.")
    }
    if (isMarketDataItem(finnhubResponse)) {
        return finnhubResponse
    }
    throw new InvalidApiResponseError("Finnhub's API-response is not a list of Candles.")
}

// This parses a supposed-Mode to a Mode. If it isn't a Mode, it throws an error.
export const parseMode = (mode: unknown): Mode => {
    if (mode === "hours" || mode === "days") {
        return mode
    } else {
        throw new UserInputError("Invalid mode.", {errorCode: 400})
    }
}

// This parses a supposed-Company to a Company. If it isn't a Company, it throws an error.
export const parseCompany = (company: unknown): string => {
    if (!company || !isString(company)) {
        throw new UserInputError("Incorrect or missing symbol.", {errorCode: 400})
    }
    return company
}

// This parses a supposed-UserInformation to a UserInformation. If it isn't a UserInformation, it throws an error.
export const parseUserInformation = (userInformation: UserInformation): UserInformation => {
    if (!userInformation || !userInformation.username || !userInformation.password || 
        !isString(userInformation.username) || !isString(userInformation.password)) {
        throw new UserInputError("Incorrect type of username or password.", {errorCode: 400})
    }
    if (userInformation.username.length < 4) {
        throw new UserInputError("Username too short.", {errorCode: 400})
    }
    if (userInformation.password.length < 8) {
        throw new UserInputError("Password too short.", {errorCode: 400})
    }
    return userInformation
}

// This parses a supposed-number to a number. If it isn't a number, it throws an error.
export const parseAmount = (amount: unknown): number => {
    if (!amount || !isNumber(amount)) {
        throw new UserInputError("Incorrect type of amount.", {errorCode: 400})
    }
    return amount
}

// This parses supposed-AlphaVantageValues to AlphaVantageValues. If it isn't AlphaVantageValues, it throws an error.
export const parseAlphaVantange = (sticks: unknown): AlphaVantageValues => {
    if (!sticks) {
        throw new InvalidApiResponseError("Alpha Vantage -API's response is empty.");
    }
    if (typeof sticks !== "object" || sticks === null || sticks === undefined) {
        throw new InvalidApiResponseError("Alpha Vantage -API's response is not an object.");
    } 
    if (isAlphaVantageValues(sticks)) {
        return sticks
    } else {
        throw new InvalidApiResponseError("Alpha Vantage -API's response is not a valid.");
    }
}