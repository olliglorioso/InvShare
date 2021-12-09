"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAlphaVantange = exports.parseAmount = exports.parseUserInformation = exports.parseCompany = exports.parseMode = exports.parseFinnhubResponse = exports.parseResolution = exports.parseDate = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const customMadeErrors_1 = require("../utils/customMadeErrors");
// This function includes essential functions, so called "type guards",
// to check if the type of the user input is correct and valid. 
// This function check if a supposed-text is string and turns it into a string.
const isString = (text) => {
    return typeof text === "string" || text instanceof String;
};
// This function check if a supposed-number is number and turns it into a number.
const isNumber = (numb) => {
    return numb instanceof Number || typeof numb === "number";
};
// Check if given parameter is a date.
const isDate = (date) => {
    return date instanceof Date;
};
// Parse to date.
const parseDate = (date) => {
    if (isDate(date)) {
        return date;
    }
    else if (isString(date)) {
        return new Date(date);
    }
    else {
        throw new Error("Invalid date given in the backend.");
    }
};
exports.parseDate = parseDate;
// Parse to Resolution.
const parseResolution = (resolution) => {
    if (isString(resolution)) {
        switch (resolution) {
            case "1":
                return "1";
            case "5":
                return "5";
            case "15":
                return "15";
            case "30":
                return "30";
            case "60":
                return "60";
            case "D":
                return "D";
            case "W":
                return "W";
            case "M":
                return "M";
            default:
                throw new Error("Invalid resolution given in the backend.");
        }
    }
    else {
        throw new Error("Invalid resolution given in the backend.");
    }
};
exports.parseResolution = parseResolution;
// Checks if the parameter has valid Alpha Vantage data.
const isAlphaVantageValues = (alphaVantageValues) => {
    return alphaVantageValues instanceof Object && Object.prototype.hasOwnProperty.call(alphaVantageValues, "Meta Data") &&
        Object.prototype.hasOwnProperty.call(alphaVantageValues, "Weekly Time Series");
};
// Check if a single candle is valid.
const isCandlesType = (candles) => {
    return candles instanceof Object && Object.prototype.hasOwnProperty.call(candles, "close") &&
        Object.prototype.hasOwnProperty.call(candles, "date") && Object.prototype.hasOwnProperty.call(candles, "high") &&
        Object.prototype.hasOwnProperty.call(candles, "low") && Object.prototype.hasOwnProperty.call(candles, "open") &&
        Object.prototype.hasOwnProperty.call(candles, "volume");
};
// Check if a market data item is valid.
const isMarketDataItem = (marketDataItems) => {
    return marketDataItems instanceof Array && marketDataItems.every(item => isCandlesType(item));
};
// Check if the whole finnhub's data is valid.
const parseFinnhubResponse = (finnhubResponse) => {
    if (!finnhubResponse || !Array.isArray(finnhubResponse)) {
        throw new customMadeErrors_1.InvalidApiResponseError("Finnhub's API-response is not a list / is undefined.");
    }
    if (isMarketDataItem(finnhubResponse)) {
        return finnhubResponse;
    }
    throw new customMadeErrors_1.InvalidApiResponseError("Finnhub's API-response is not a list of Candles.");
};
exports.parseFinnhubResponse = parseFinnhubResponse;
// This parses a supposed-Mode to a Mode. If it isn't a Mode, it throws an error.
const parseMode = (mode) => {
    if (mode === "hours" || mode === "days") {
        return mode;
    }
    else {
        throw new apollo_server_express_1.UserInputError("Invalid mode.", { errorCode: 400 });
    }
};
exports.parseMode = parseMode;
// This parses a supposed-Company to a Company. If it isn't a Company, it throws an error.
const parseCompany = (company) => {
    if (!company || !isString(company)) {
        throw new apollo_server_express_1.UserInputError("Incorrect or missing symbol.", { errorCode: 400 });
    }
    return company;
};
exports.parseCompany = parseCompany;
// This parses a supposed-UserInformation to a UserInformation. If it isn't a UserInformation, it throws an error.
const parseUserInformation = (userInformation) => {
    if (!userInformation || !userInformation.username || !userInformation.password ||
        !isString(userInformation.username) || !isString(userInformation.password)) {
        throw new apollo_server_express_1.UserInputError("Incorrect type of username or password.", { errorCode: 400 });
    }
    if (userInformation.username.length < 4) {
        throw new apollo_server_express_1.UserInputError("Username too short.", { errorCode: 400 });
    }
    if (userInformation.password.length < 8) {
        throw new apollo_server_express_1.UserInputError("Password too short.", { errorCode: 400 });
    }
    return userInformation;
};
exports.parseUserInformation = parseUserInformation;
// This parses a supposed-number to a number. If it isn't a number, it throws an error.
const parseAmount = (amount) => {
    if (!amount || !isNumber(amount)) {
        throw new apollo_server_express_1.UserInputError("Incorrect type of amount.", { errorCode: 400 });
    }
    return amount;
};
exports.parseAmount = parseAmount;
// This parses supposed-AlphaVantageValues to AlphaVantageValues. If it isn't AlphaVantageValues, it throws an error.
const parseAlphaVantange = (sticks) => {
    if (!sticks) {
        throw new customMadeErrors_1.InvalidApiResponseError("Alpha Vantage -API's response is empty.");
    }
    if (typeof sticks !== "object" || sticks === null || sticks === undefined) {
        throw new customMadeErrors_1.InvalidApiResponseError("Alpha Vantage -API's response is not an object.");
    }
    if (isAlphaVantageValues(sticks)) {
        return sticks;
    }
    else {
        throw new customMadeErrors_1.InvalidApiResponseError("Alpha Vantage -API's response is not a valid.");
    }
};
exports.parseAlphaVantange = parseAlphaVantange;
