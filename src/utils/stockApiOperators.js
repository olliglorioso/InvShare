"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlphaVantage = exports.getIndividualStockInformation = void 0;
const finnhub_1 = __importDefault(require("@stoqey/finnhub"));
const alphavantage_1 = __importDefault(require("alphavantage"));
const dateOperators_1 = require("./dateOperators");
const typeGuards_1 = require("../tsUtils/typeGuards");
// This file contains functions, that help to get information (sticks) from stock APIs.
// GetIndividualStockInformation-function mainly gets up-to-date data and sticks from
// a specific stock (uses Finnhub Stock API). This information is used mainly in the Analysis page and Buy stocks -page.
// It has three parameters, of which the first is the stock symbol, the second is the start date,
// and the third is the resolution. Final two are optional.
const getIndividualStockInformation = (symbol, startDate, resolution) => __awaiter(void 0, void 0, void 0, function* () {
    // Parsing parameters.
    const parsedSymbol = typeGuards_1.parseCompany(symbol);
    const parsedStartDate = typeGuards_1.parseDate(startDate);
    const parsedResolution = typeGuards_1.parseResolution(resolution);
    // Creating a new FinnhubAPI-object. This object gets the data 
    // and uses @stoqey/finnhub-library to do this. 
    // Our private FINNHUB_API_KEY is inserted into the object.
    const finnhubAPI = new finnhub_1.default(process.env.FINNHUB_API_KEY);
    // This function inside the whole function is used to get the data from Finnhub's api.
    // Start date is either the startDate-parameter or 1st December 2020. End date
    // is current date and resolution is either the resolution-parameter or daily.
    const getCandles = () => __awaiter(void 0, void 0, void 0, function* () {
        const candles = yield finnhubAPI.getCandles(parsedSymbol, parsedStartDate || new Date(2020, 12, 1), new Date(), parsedResolution || "D");
        // Parsing candles to CandlesType-type.
        const parsedCandles = typeGuards_1.parseFinnhubResponse(candles);
        return parsedCandles;
    });
    // Executing the above function.
    const candles = yield getCandles();
    // Mapping through the candles-array and creating a new array of objects,
    // where each object has original values except date-objects are turned into strings. 
    // eslint-disable-next-line 
    const returnCandles = candles.map((a) => { return Object.assign(Object.assign({}, a), { date: a.date.toString() }); });
    return returnCandles;
});
exports.getIndividualStockInformation = getIndividualStockInformation;
// GetAlphaVantage-function max. 20 years old data (as old as possible) and is used
// when client wants some more information about a specific stock. API for this is Alpha Vantage.
const getAlphaVantage = (symbol) => __awaiter(void 0, void 0, void 0, function* () {
    // Parsing symbol.
    const parsedSymbol = typeGuards_1.parseCompany(symbol);
    // This time we use alphavantage-library to fetch the dat. We, again, insert
    // our private API-key to the object we create. The sticks are weekly.
    const alphavantage = alphavantage_1.default({ key: process.env.ALPHAVANTAGE_API_KEY });
    // We fetch sticks from the API with the object that was created above.
    const originalSticks = yield alphavantage.data.weekly(parsedSymbol, "full", "json");
    // Parsing the data we got from the API.
    const parsedOriginalSticks = typeGuards_1.parseAlphaVantange(originalSticks);
    // We create a new object, where we turn the data into a more usable format.
    const usableSticks = {
        metadata: {
            information: parsedOriginalSticks["Meta Data"]["1. Information"],
            symbol: parsedOriginalSticks["Meta Data"]["2. Symbol"],
            lastRefresh: parsedOriginalSticks["Meta Data"]["3. Last Refreshed"]
        },
        time_series: parsedOriginalSticks["Weekly Time Series"]
    };
    // We turn the usableSticks-object into a usable format, again.
    const finalSticks = {
        metadata: usableSticks.metadata,
        time_series: Object.keys(usableSticks["time_series"])
            .reverse()
            .map((one) => {
            return ([dateOperators_1.turnToDate(one), parseFloat(usableSticks.time_series[one]["4. close"])]);
        })
    };
    // We turn the data into a format we want to continue with, every object in this list
    // has a date and the stick's value as a number. In other words,
    // whe have a list of object that are formatted {date: string, value: number}
    const returnVals = { metadata: usableSticks["metadata"], time_series: finalSticks["time_series"]
            .map((a) => { return { date: a[0], value: a[1] }; }) };
    return returnVals;
});
exports.getAlphaVantage = getAlphaVantage;
