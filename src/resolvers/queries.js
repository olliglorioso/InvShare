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
const typeGuards_1 = require("../tsUtils/typeGuards");
const stockApiOperators_1 = require("../utils/stockApiOperators");
const dateOperators_1 = require("../utils/dateOperators");
const user_1 = __importDefault(require("../models/user"));
const apollo_server_express_1 = require("apollo-server-express");
const stock_1 = __importDefault(require("../models/stock"));
// This file includes all of the GraphQL-queries that can be accessed by the client.
const queries = {
    // This query "stockHistory" uses Alpha Vantage's Stock API to get up to 20 year historical data for a given stock.
    // The prices are of the last prices of each week.
    stockHistory: (_root, args) => __awaiter(void 0, void 0, void 0, function* () {
        // Parsing the symbol to make sure it is valid.
        const parsedSymbol = typeGuards_1.parseCompany(args.symbol);
        // Using self-made function to get the sticks.
        const sticks = yield stockApiOperators_1.getAlphaVantage(parsedSymbol);
        return sticks;
    }),
    // This query "me" returns all the information of the user that has logged in.  
    // It uses ApolloServer's context to get the user's information.
    me: (_root, _args, { currentUser }) => {
        return currentUser;
    },
    // This query "searchUser" searches for a user by their username and returns the users that match.
    searchUser: (_root, { username }, { currentUser }) => __awaiter(void 0, void 0, void 0, function* () {
        // Parsing the username to make sure it is valid.
        const parsedUsername = typeGuards_1.parseCompany(username);
        // Checking if the user is logged in.
        if (!currentUser) {
            throw new apollo_server_express_1.UserInputError("You must be logged in to search for a user.", { errorCode: 400 });
        }
        // We search for users whose username starts with args.username (ignoring case)
        // from the server and populate them.
        const users = yield user_1.default.find({ usersUsername: { $regex: `^(?i)${parsedUsername}` } })
            .populate({ path: "usersFollowers", populate: { path: "user" } })
            .populate({ path: "usersFollowing", populate: { path: "user" } })
            .populate({ path: "usersHoldings", populate: { path: "usersStock" } })
            .populate({ path: "usersTransactions", populate: { path: "transactionStock" } });
        // We return the users that were found and remove the current user from the list.
        // The current user is also removed form the list because we don't want to show the current user in the search.
        return users === null || users === void 0 ? void 0 : users.filter((user) => user.usersUsername !== currentUser.usersUsername);
    }),
    // This query "individualStock" returns the prices of the last 96 hours (price every 5 minutes)
    individualStock: (_root, { company }) => __awaiter(void 0, void 0, void 0, function* () {
        // Parsing the company to make sure it is valid.
        const parsedCompany = typeGuards_1.parseCompany(company);
        // Using self-made function to get the sticks.
        const sticks = yield stockApiOperators_1.getIndividualStockInformation(parsedCompany, dateOperators_1.setDate(-96), "5");
        // Parsing sticks.
        // If there are no sticks, an error is thrown.
        if (sticks.length === 0) {
            throw new apollo_server_express_1.UserInputError("The symbol doesn't exist.", { errorCode: 400 });
        }
        return sticks;
    }),
    // This is a critical query for the client and the Analysis-page. CurrentPortfolioValue-
    // query returns both sticks for the Analysis-page's graph and the whole
    // value of the portfolio.
    currentPortfolioValue: (_root, { mode }, { currentUser }) => __awaiter(void 0, void 0, void 0, function* () {
        // Parsing the mode to make sure it is valid.
        const parsedMode = typeGuards_1.parseMode(mode);
        // Initializing the sum of the portfolio's whole value.
        let sum = 0;
        // Initializing the array of analysis values.
        let values = [];
        if (currentUser && currentUser.usersTransactions.length > 0) {
            // The code below is executed if the user is logged in and has at least 
            // one transaction.
            // Store the first purchase's date to a variable.
            const firstBuyDate = currentUser.usersFirstPurchaseDate;
            // Looping through the holdings of the current user.
            for (const item of currentUser.usersHoldings) {
                // Getting the stock's name since it isn't directly stored in the Holding-object.
                const a = yield stock_1.default.find({ stockSymbol: item.usersStock.stockSymbol });
                // Initializing the array of sticks.
                let sticks;
                // Getting the sticks with the self-made function (Finnhub's API). Sticks
                // are taken every five minutes for the last 96 hours. These sticks are
                // primarily used in case the mode is "hours" but also
                // if the length of the "days"-mode's sticks is zero. 
                const denseSticks = yield stockApiOperators_1.getIndividualStockInformation(a[0].stockSymbol, dateOperators_1.setDate(-96), "5");
                // Checking the enabled mode and executing code accordingly.
                if (parsedMode === "hours") {
                    // Checking if the date of the first transaction is newer
                    // than the date of the first stick. If it is, we take only
                    // the sticks that are newer than the first transaction.
                    new Date(firstBuyDate) > dateOperators_1.setDate(-96)
                        ? sticks = denseSticks.filter((item) => { return new Date(item.date) > new Date(firstBuyDate); })
                        : sticks = denseSticks;
                    // If the length of the sticks is zero, we just get the latest stick of denseSticks.
                    if (sticks.length === 0) {
                        sticks = sticks.concat(denseSticks[denseSticks.length - 1]);
                    }
                }
                else {
                    // Get the Finnhub API's sticks for every day since first transaction.
                    sticks = yield stockApiOperators_1.getIndividualStockInformation(a[0].stockSymbol, new Date(firstBuyDate), "D");
                    // If the length of the sticks is zero, we just get the latest stick of denseSticks.
                    if (sticks.length === 0) {
                        sticks = sticks.concat(denseSticks[denseSticks.length - 1]);
                    }
                }
                // Adding the sticks of the current holding to the values-array.
                values = values.concat({ name: a[0].stockSymbol, sticks });
                // Adding the last price multiplied by holding's amount to the sum-variable.
                sum += sticks[sticks.length - 1].close * item.usersTotalAmount;
            }
        }
        else if (currentUser.usersTransactions.length === 0) {
            // The error below is thrown if the user has no transactions at all (no stocks).
            throw new Error("This user has no transactions.");
        }
        // Returning the whole value of the portfolio and values for graphs.
        return [{ wholeValue: sum, analysisValues: values }];
    }),
    // GetActions-query returns the actions (at the moment only "stockevents") of the users
    // current user follows. The actions are sorted by date.
    getActions: (_root, _args, { currentUser }) => __awaiter(void 0, void 0, void 0, function* () {
        // Creating an array of arrays by mapping through every user that the current user follows and 
        // getting their transactions. We also put transactionOwner in the array to make sure we can
        // get the user that created the transaction.
        const followersTransactions = (currentUser.usersFollowing.map((item) => item.user))
            .map((item) => {
            return {
                transactions: item.usersTransactions,
                transactionOwner: item.usersUsername
            };
        });
        // Initializing the final list of transactions and their owners.
        const transactionList = [];
        // This double-for-loop goes through the above array and puts every transaction
        // in a single list with the owner in the same object.
        for (const item of followersTransactions) {
            for (const o of item.transactions) {
                transactionList.push({ transaction: o, transactionOwner: item.transactionOwner });
            }
        }
        // Sorting the list by date.
        const orderedTransactions = transactionList.sort((a, b) => {
            return new Date(a.transaction.transactionDate).getTime() - new Date(b.transaction.transactionDate).getTime();
        }).reverse();
        // Returning the sorted list.
        return orderedTransactions;
    })
};
exports.default = queries;
