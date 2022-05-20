import { UserInputError } from "apollo-server-express"
import { AlphaVantageValues, Mode, UserInformation, CandlesType } from "./types"
import { InvalidApiResponseError } from "../utils/customMadeErrors"
import { MarketDataItem } from "@stoqey/finnhub"
import { Resolution } from "@stoqey/finnhub"


const isString = (text: unknown): text is string => {
    return typeof text === "string" || text instanceof String
}

const isNumber = (numb: unknown): numb is number => {
    return numb instanceof Number || typeof numb === "number"
}

const isDate = (date: unknown): date is Date => {
    return date instanceof Date
}

export const parseDate = (date: unknown): Date => {
    if (isDate(date)) {
        return date
    } else if (isString(date)) {
        return new Date(date)
    } else {
        throw new Error("Invalid date given in the backend.")
    }
}

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

const isAlphaVantageValues = (alphaVantageValues: unknown): alphaVantageValues is AlphaVantageValues => {
    return alphaVantageValues instanceof Object && Object.prototype.hasOwnProperty.call(alphaVantageValues,"Meta Data") &&
        Object.prototype.hasOwnProperty.call(alphaVantageValues, "Weekly Time Series")
}

const isCandlesType = (candles: unknown): candles is CandlesType => {
    return candles instanceof Object && Object.prototype.hasOwnProperty.call(candles, "close") &&
        Object.prototype.hasOwnProperty.call(candles, "date") && Object.prototype.hasOwnProperty.call(candles, "high") &&
        Object.prototype.hasOwnProperty.call(candles, "low") && Object.prototype.hasOwnProperty.call(candles, "open") &&
        Object.prototype.hasOwnProperty.call(candles, "volume")
}

const isMarketDataItem = (marketDataItems: unknown): marketDataItems is MarketDataItem[] => {
    return marketDataItems instanceof Array && marketDataItems.every(item => isCandlesType(item))
}

export const parseFinnhubResponse = (finnhubResponse: unknown): MarketDataItem[] => {
    if (!finnhubResponse || !Array.isArray(finnhubResponse)) {
        throw new InvalidApiResponseError("Finnhub's API-response is not a list / is undefined.")
    }
    if (isMarketDataItem(finnhubResponse)) {
        return finnhubResponse
    }
    throw new InvalidApiResponseError("Finnhub's API-response is not a list of Candles.")
}

export const parseMode = (mode: unknown): Mode => {
    if (mode === "hours" || mode === "days") {
        return mode
    } else {
        throw new UserInputError("Invalid mode.", {errorCode: 400})
    }
}

export const parseCompany = (company: unknown): string => {
    if (!company || !isString(company)) {
        throw new UserInputError("Incorrect or missing symbol.", {errorCode: 400})
    }
    return company
}

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

export const parseAmount = (amount: unknown): number => {
    if (!amount || !isNumber(amount)) {
        throw new UserInputError("Incorrect type of amount.", {errorCode: 400})
    }
    return amount
}

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