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
const apollo_server_express_1 = require("apollo-server-express");
const user_1 = __importDefault(require("../models/user"));
const resolvers_1 = require("./resolvers");
const typeGuards_1 = require("../tsUtils/typeGuards");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const stockApiOperators_1 = require("../utils/stockApiOperators");
const dateOperators_1 = require("../utils/dateOperators");
const randomFunctions_1 = require("../utils/randomFunctions");
const transaction_1 = __importDefault(require("../models/transaction"));
const stock_1 = __importDefault(require("../models/stock"));
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config();
// This field includes the mutations that are available for the client.
const mutations = {
    // This is for resetting the database after cypress tests.
    resetDatabase: () => __awaiter(void 0, void 0, void 0, function* () {
        const ifUserExists = yield user_1.default.find({ usersUsername: "testi800" }).populate("usersHoldings").populate("usersTransactions");
        if (ifUserExists.length > 0) {
            yield user_1.default.deleteMany({ usersUsername: "testi800" });
            yield user_1.default.deleteMany({ usersUsername: "testi900" });
            const stock = yield stock_1.default.findOne({ stockSymbol: "AAPL" });
            yield stock_1.default.findOneAndUpdate({ symbol: "AAPL" }, { $set: { stockTotalAmount: stock.stockTotalAmount - 110 } });
            yield transaction_1.default.deleteMany({ _id: ifUserExists[0].usersTransactions[0]._id });
            return { result: true };
        }
        else {
            return { result: false };
        }
    }),
    // This mutation "followUser" is used to follow a user.
    followUser: (_root, { username }, { currentUser }) => __awaiter(void 0, void 0, void 0, function* () {
        // Parsing the username to check if it is valid.
        const parsedUsername = typeGuards_1.parseCompany(username);
        // Finding the user from the database.
        const user = yield user_1.default.findOne({ usersUsername: parsedUsername });
        // Checking if the user exists.
        if (!user) {
            throw new apollo_server_express_1.AuthenticationError("User doesn't exist.", { errorCode: 401 });
        }
        // Checking if the user is already being followed.
        else if (currentUser.usersFollowing.find((item) => item.user.usersUsername === parsedUsername)) {
            throw new apollo_server_express_1.AuthenticationError("You are already following this user.", { errorCode: 401 });
        }
        // An error is thrown, if the user argument is the same as current user.
        else if (currentUser.usersUsername === username) {
            throw new apollo_server_express_1.UserInputError("You can't follow yourself.", { errorCode: 400 });
        }
        // Now that user exists, let's define it as UserType.
        const parsedUser = user;
        // Checking if the user is logged in.
        if (!currentUser) {
            throw new apollo_server_express_1.UserInputError("You are not logged in.", { errorCode: 400 });
        }
        // If there are no errors, the user is followed by updating both
        // the current user and the user that is being followed.
        yield user_1.default.updateOne({ _id: currentUser._id }, {
            $push: { usersFollowing: { user: parsedUser._id, date: new Date().toString() } },
            $set: { followingCount: (currentUser.followingCount || 0) + 1 }
        });
        yield user_1.default.updateOne({ _id: parsedUser._id }, {
            $push: { usersFollowers: { user: currentUser._id, date: new Date().toString() } },
            $set: { followerCount: (parsedUser.followerCount || 0) + 1 }
        });
        // Information about the event is published with PubSub-object in order to 
        // update all the relevant clients.
        resolvers_1.pubsub.publish("FOLLOWEVENT", { followEvent: {
                followType: "follow",
                auteur: currentUser.usersUsername,
                object: parsedUser.usersUsername,
                date: new Date()
            },
            myFollowers: currentUser.usersFollowers
        });
        return { result: true };
    }),
    // This mutation "unfollowUser" is used to unfollow a user.
    unfollowUser: (_root, { username }, { currentUser }) => __awaiter(void 0, void 0, void 0, function* () {
        // Parsing the username to check if it is valid.
        const parsedUsername = typeGuards_1.parseCompany(username);
        // Finding the user from the database.
        const user = yield user_1.default.findOne({ usersUsername: parsedUsername });
        // Checking if the user exists.
        if (!user) {
            throw new apollo_server_express_1.AuthenticationError("User doesn't exist.", { errorCode: 401 });
        }
        // Checking if the user is being followed before the unfollow.
        else if (!currentUser.usersFollowing.find((item) => item.user.usersUsername === parsedUsername)) {
            throw new apollo_server_express_1.AuthenticationError("You are not following this user.", { errorCode: 401 });
        }
        // Now that user exists, let's define it as UserType.
        const parsedUser = user;
        // If there are no errors, the user is unfollowed by updating both
        // the current user and the user that is being unfollowed.
        yield user_1.default.updateOne({ _id: currentUser._id }, {
            $pull: { usersFollowing: { user: parsedUser._id } },
            $set: { followingCount: (currentUser.followingCount || 0) - 1 }
        });
        yield user_1.default.updateOne({ _id: parsedUser._id }, {
            $pull: { usersFollowers: { user: currentUser._id } },
            $set: { followerCount: (parsedUser.followerCount || 0) - 1 }
        });
        // Information about the event is published with PubSub-object in order to 
        // update all the relevant clients.
        resolvers_1.pubsub.publish("FOLLOWEVENT", { followEvent: {
                followType: "unfollow",
                auteur: currentUser.usersUsername,
                object: parsedUser.usersUsername,
                date: new Date()
            },
            myFollowers: currentUser.usersFollowers
        });
        return { result: true };
    }),
    // This mutation "addUser" is used to add a new user to the database.
    addUser: (_root, args) => __awaiter(void 0, void 0, void 0, function* () {
        // Parsing the user information to check if it is valid.
        const parsedUserInformation = typeGuards_1.parseUserInformation(args);
        // Checking if the username is free.
        const isUsernameFree = yield user_1.default.find({ usersUsername: parsedUserInformation.username });
        // If the username is reserved, an error is thrown.
        if (isUsernameFree.length > 0) {
            throw new apollo_server_express_1.UserInputError("The username is already in use.", { errorCode: 400 });
        }
        // If the username is free, the password inputted by the user is hashed
        // and the encrypted password is stored into a variable. Ten salt rounds are used.
        const passwordHash = yield bcrypt_1.hash(parsedUserInformation.password, 10);
        // The user-object is created. We store the hashed password
        // to the database instead of the plain password.
        // FirstPurchaseDate is set to x, because no stocks have been bought yet.
        const user = new user_1.default({
            usersUsername: parsedUserInformation.username,
            usersPasswordHash: passwordHash,
            usersTransactions: [],
            usersHoldings: [],
            moneyMade: 0,
            usersFollowers: [],
            usersFollowing: [],
            followerCount: 0,
            followingCount: 0,
            usersFirstPurchaseDate: "x"
        });
        // The new object is saved to the database.
        return yield user.save();
    }),
    // This mutation "login" is used to log in.
    login: (_root, args) => __awaiter(void 0, void 0, void 0, function* () {
        // Parsing the user information to check if it is valid.
        const parsedUserInformation = typeGuards_1.parseUserInformation(args);
        // Finding the user from the database.
        const user = yield user_1.default.findOne({ usersUsername: parsedUserInformation.username });
        // Comparing the hashed password from the database with the inputted password.
        const passwordCorrect = user === null
            ? false
            : yield bcrypt_1.compare(parsedUserInformation.password, user.usersPasswordHash);
        // If the password is incorrect, an error is thrown.
        if (!(user && passwordCorrect)) {
            throw new apollo_server_express_1.AuthenticationError("Incorrect password or username.", { errorCode: 401 });
        }
        // If the password is correct, a token is created.
        const userForToken = {
            username: user.usersUsername,
            id: user._id
        };
        const token = jsonwebtoken_1.default.sign(userForToken, process.env.SECRETFORTOKEN);
        // The token is returned and the username as well.
        return { value: token, username: args.username };
    }),
    // This mutation "buyStock" is used to buy a stock with its last price.
    buyStock: (_root, { stockName, amount }, { currentUser }) => __awaiter(void 0, void 0, void 0, function* () {
        // Parsing the company name to check if it is valid.
        const parsedCompany = typeGuards_1.parseCompany(stockName);
        // Parsing the amount to check if it is valid.
        const parsedAmount = typeGuards_1.parseAmount(amount);
        // Using self-made function to get the sticks from last 96 hours with the price of every 5 minutes.
        const sticks = yield stockApiOperators_1.getIndividualStockInformation(parsedCompany, dateOperators_1.setDate(-96), "5");
        // Second check that the stock exist.
        if (sticks.length === 0) {
            throw new apollo_server_express_1.UserInputError("Stock doesn't exist.", { errorCode: 401 });
        }
        // Checking if the company has been bought by this or any other user.
        const firstBuyEver = yield stock_1.default.findOne({ stockSymbol: parsedCompany.toUpperCase() });
        // Next if-statement happens only if the user has an empty portfolio
        // --> either the user is brand new or has sold all their stocks.
        if (currentUser.usersHoldings.length === 0) {
            // We set the first purchase date to the current date so that
            // currentPortfolioValue-query knows that the portfolio
            // was empty just before this purchase.
            yield user_1.default.updateOne({ _id: currentUser._id }, {
                $set: { usersFirstPurchaseDate: new Date().toString() }
            });
        }
        if (!firstBuyEver) {
            // Code below is executed if the company has not been bought by any user.
            // A new Stock-object is created and its total amount is the amount of this particular purchase.
            // The symbol is always uppercase.
            const newStock = new stock_1.default({
                stockTotalAmount: parsedAmount,
                stockSymbol: parsedCompany.toUpperCase()
            });
            // A new Transaction-object is created and its type is "Buy", of course.
            // The date is the current date.
            // The price is the last price of the stock. The prices have have been fetched
            // with the self-made function getIndividualStockInformation.
            const newTransaction = new transaction_1.default({
                transactionType: "Buy",
                transactionDate: dateOperators_1.createDate(),
                transactionStockPrice: sticks[sticks.length - 1].close,
                transactionStockAmount: parsedAmount,
                transactionStock: newStock._id
            }).populate("transactionStock");
            // The Stock-object is saved to the database.
            yield newStock.save();
            // Searching for the current user from the database. We redefine it as 
            // UserType instead of UserType | undefined, because the user exists
            // no matter what.
            const user = yield user_1.default.findOne({ usersUsername: currentUser.usersUsername });
            // A newInformation-objet is created to simplify the code. This object includes
            // the new lists of usersTransactions and usersHoldings.
            const newInformation = {
                usersTransactions: user.usersTransactions.concat(newTransaction._id),
                usersHoldings: user.usersHoldings.concat({
                    usersStock: newStock._id,
                    usersTotalAmount: parsedAmount,
                    usersTotalOriginalPriceValue: parsedAmount * newTransaction.transactionStockPrice,
                })
            };
            // The current user is updated in the database with the help of
            // previously created newInformation-object.
            yield user_1.default.updateOne({ usersUsername: currentUser.usersUsername }, { $set: newInformation });
            // The Transaction-object is saved to the database.
            yield newTransaction.save();
            // Information about the event is published with PubSub-object in order to 
            // update all the relevant clients.
            resolvers_1.pubsub.publish("STOCKEVENT", { stockEvent: {
                    transaction: randomFunctions_1.getTransactionToReturn(newTransaction._id),
                    me: currentUser.usersUsername, myFollowers: currentUser.usersFollowers
                }
            });
            // The Transaction-object is returned to follow type definitions' requirements.
            return yield randomFunctions_1.getTransactionToReturn(newTransaction._id);
        }
        else {
            // The code below is executed if the company has previously been purchased by any user.
            // Creating a new Transaction-object.
            // The date is the current date.
            // The price is the last price of the stock. The prices have have been fetched
            // with the self-made function getIndividualStockInformation.
            const newTransaction = new transaction_1.default({
                transactionType: "Buy",
                transactionDate: dateOperators_1.createDate(),
                transactionStockPrice: sticks[sticks.length - 1].close,
                transactionStockAmount: parsedAmount,
                transactionStock: firstBuyEver._id
            });
            // Searching for the current user from the database. We redefine it as 
            // UserType instead of UserType | undefined, because the user exists
            // no matter what. 
            const user = yield user_1.default.findOne({ usersUsername: currentUser.usersUsername });
            // We search for the holding that has to be changed in the User-object.
            // There are two options: either the user has already purchased the stock,
            // or the stock has been previously purchased by another user/users.
            const holdingToBeChanged = user.usersHoldings.filter((obj) => {
                return (obj.usersStock.toString() === firstBuyEver._id.toString());
            })[0];
            if (holdingToBeChanged) {
                // The code below is executed if the stock has been previously purchased by this particular user.
                // One holding is updated with the helper of holdingsArray-array. First of all,
                // holdingToBeChanged is searched from the user's holdings and then updated.
                // UsersTotalAmount is increased with this purchase's amount, and the total-
                // OriginalPriceValue is increased with the price of this purchase * amount.
                const holdingsArray = user.usersHoldings;
                holdingsArray[holdingsArray.indexOf(holdingToBeChanged)] = Object.assign(Object.assign({}, holdingToBeChanged), { usersTotalAmount: (holdingToBeChanged.usersTotalAmount + parsedAmount), usersTotalOriginalPriceValue: (holdingToBeChanged.usersTotalOriginalPriceValue + (amount * sticks[sticks.length - 1].close)) });
                // The relevant Stock-object is updated with the new total amount.
                yield stock_1.default.updateOne({ _id: firstBuyEver._id }, {
                    $set: { stockTotalAmount: firstBuyEver.stockTotalAmount + amount }
                });
                // The current user is updated (its transactions and holdings).
                yield user_1.default.updateOne({ usersUsername: currentUser.usersUsername }, { $set: {
                        usersTransactions: user.usersTransactions.concat(newTransaction._id),
                        usersHoldings: holdingsArray
                    }
                });
                // The newTransaction-object is saved to the database.
                yield newTransaction.save();
                // Information about the event is published with PubSub-object in order to
                // update all the relevant clients.
                resolvers_1.pubsub.publish("STOCKEVENT", { stockEvent: {
                        transaction: randomFunctions_1.getTransactionToReturn(newTransaction._id),
                        me: currentUser.usersUsername, myFollowers: currentUser.usersFollowers
                    }
                });
                // The Transaction-object is returned to follow gql's type definitions' requirements.
                return yield randomFunctions_1.getTransactionToReturn(newTransaction._id);
            }
            else {
                // The code below is executed if the stock has not been previously purchased by this particular user.
                // The relevant Stock-object is updated with the new total amount.
                yield stock_1.default.updateOne({ _id: firstBuyEver._id }, { $set: {
                        stockTotalAmount: firstBuyEver.stockTotalAmount + parsedAmount
                    }
                });
                // The current user is updated (its transactions and holdings).
                yield user_1.default.updateOne({ usersUsername: currentUser.usersUsername }, { $set: {
                        usersTransactions: user.usersTransactions.concat(newTransaction._id),
                        usersHoldings: user.usersHoldings.concat({
                            usersStock: firstBuyEver._id,
                            usersTotalAmount: parsedAmount,
                            usersTotalOriginalPriceValue: parsedAmount * newTransaction.transactionStockPrice
                        })
                    } });
                // The newTransaction-object is saved to the database.
                yield newTransaction.save();
                // Information about the event is published with PubSub-object in order to
                // update all the relevant clients.
                resolvers_1.pubsub.publish("STOCKEVENT", { stockEvent: {
                        transaction: randomFunctions_1.getTransactionToReturn(newTransaction._id),
                        me: currentUser.usersUsername, myFollowers: currentUser.usersFollowers
                    }
                });
                // The Transaction-object is returned to follow gql's type definitions' requirements.
                return yield randomFunctions_1.getTransactionToReturn(newTransaction._id);
            }
        }
    }),
    // This mutation "sellStock" is used to sell a stock.
    sellStock: (_root, { stockName, amount, price }, { currentUser }) => __awaiter(void 0, void 0, void 0, function* () {
        // The company's name is parsed to check if it is valid.
        const parsedCompany = typeGuards_1.parseCompany(stockName);
        // The amount-parameter is parsed to check if it is valid.
        const parsedAmount = typeGuards_1.parseAmount(amount);
        // The price-parameter is parsed to check if it is valid.
        const parsedPrice = typeGuards_1.parseAmount(price);
        // The corresponding holding is searched from the current user's holdings.
        const holding = currentUser.usersHoldings.filter((obj) => {
            return obj.usersStock.stockSymbol === parsedCompany;
        })[0];
        if (holding) {
            // If there is a corresponding holding, the code below is executed. In other words,
            // the user has this stock and can sell it.
            // Checking if user has more or as many stocks as he wants to sell. Otherwise, error.
            if (holding.usersTotalAmount < parsedAmount) {
                throw new apollo_server_express_1.UserInputError("You don't have enough stocks to sell.");
            }
            else {
                // The code below is executed if the user has enough stocks to sell.
                // A new Transaction-object is created.
                const newTransaction = new transaction_1.default({
                    transactionType: "Sell",
                    transactionDate: dateOperators_1.createDate(),
                    transactionStockPrice: parsedPrice,
                    transactionStockAmount: parsedAmount,
                    transactionStock: holding.usersStock._id
                });
                // The current user is updated in the database (so far only user's transactions).
                yield user_1.default.updateOne({ _id: currentUser._id }, { $set: {
                        usersTransactions: currentUser.usersTransactions.concat(newTransaction._id),
                    } });
                if (holding.usersTotalAmount > parsedAmount) {
                    // The code below is executed, if the user has MORE stocks than he wants to sell.
                    // The relevant Stock-object is updated with the new total amount.
                    yield stock_1.default.updateOne({ _id: holding.usersStock._id }, {
                        $set: { stockTotalAmount: holding.usersTotalAmount - parsedAmount }
                    });
                    // The current user is updated in the database.
                    yield user_1.default.updateOne({ _id: currentUser._id }, { $set: {
                            // Firstly, usersHoldings of the current user is updated. We map through the
                            // usersHoldings-array and if the stock is the one we want to sell, we update
                            // its holding's usersTotalAmount and usersTotalOriginalPriceValue to correct values.
                            // Otherwise, we keep the old values.
                            usersHoldings: currentUser.usersHoldings.map((obj) => {
                                var _a, _b;
                                if (((_a = obj.usersStock._id) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = holding.usersStock._id) === null || _b === void 0 ? void 0 : _b.toString())) {
                                    return {
                                        _id: obj._id,
                                        usersStock: obj.usersStock._id,
                                        usersTotalAmount: obj.usersTotalAmount - parsedAmount,
                                        usersTotalOriginalPriceValue: obj.usersTotalOriginalPriceValue - (obj.usersTotalOriginalPriceValue / obj.usersTotalAmount) * parsedAmount
                                    };
                                }
                                else {
                                    return Object.assign(Object.assign({}, obj), { _id: obj._id, usersStock: obj.usersStock._id });
                                }
                            }),
                            // Also moneymade is updated. The moneymade is calculated by multiplying the
                            // sales price with the sales amount, and substracting the average purchase value of the stock
                            // times the sales amount. In other words, moneymade is the difference between the
                            // average purchase value of the stock and the sales price. It can be both negative
                            // and positive.
                            moneyMade: currentUser.moneyMade + ((-1) * (holding.usersTotalOriginalPriceValue / holding.usersTotalAmount) * parsedAmount + parsedAmount * parsedPrice)
                        } });
                }
                else {
                    // The code below is executed, if the user has as many stocks as he wants to sell.
                    // Finding the current user from the database and defining as UserType, since it cannot be undefined.
                    const user = yield user_1.default.findOne({ _id: currentUser._id });
                    // Updating the corresponding User in the database (its holdings and moneymade)
                    yield user_1.default.updateOne({ _id: currentUser._id }, { $set: {
                            // We include only the holdings that are not involved in the sale.
                            usersHoldings: user.usersHoldings.filter((obj) => {
                                var _a;
                                return obj.usersStock.toString() !== ((_a = holding.usersStock._id) === null || _a === void 0 ? void 0 : _a.toString());
                            }),
                            // Moneymade is updated in the same way as before.
                            moneyMade: currentUser.moneyMade + ((-1) * (holding.usersTotalOriginalPriceValue / holding.usersTotalAmount) * parsedAmount + parsedAmount * parsedPrice)
                        } });
                    // This next step happens only if there is a possibility 
                    // that user might remain with no positions at all.
                    const updatedUser = yield user_1.default.findOne({ _id: currentUser._id });
                    if (updatedUser.usersHoldings.length === 0) {
                        // If the user has no more holdings, the code below is executed.
                        // We set the usersFirstPurchaseDate to x, because the user has no more holdings.
                        // And so we have to update the date in the next purchase.
                        yield user_1.default.updateOne({ _id: currentUser._id }, { $set: {
                                usersFirstPurchaseDate: "x"
                            } });
                    }
                }
                // The newTransaction-object is saved to the database.
                yield newTransaction.save();
                // Information about the event is published with PubSub-object in order to
                // update all the relevant clients. The type of the event can be found
                // from the returned transaction.
                resolvers_1.pubsub.publish("STOCKEVENT", { stockEvent: {
                        transaction: randomFunctions_1.getTransactionToReturn(newTransaction._id),
                        me: currentUser.usersUsername, myFollowers: currentUser.usersFollowers
                    }
                });
                // The Transaction-object is returned to follow gql's type definitions' requirements.
                return yield randomFunctions_1.getTransactionToReturn(newTransaction._id);
            }
        }
        else {
            // This error is thrown if the user doesn't have the stock he wants to sell.
            throw new apollo_server_express_1.UserInputError("You don't own this stock.");
        }
    })
};
exports.default = mutations;
