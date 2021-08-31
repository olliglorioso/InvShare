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
const user_1 = __importDefault(require("./models/user"));
const stock_1 = __importDefault(require("./models/stock"));
const bcrypt_1 = require("bcrypt");
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require('dotenv').config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const transaction_1 = __importDefault(require("./models/transaction"));
const finnhub_1 = __importDefault(require("@stoqey/finnhub"));
const getIndividualStockInformation = (symbol) => __awaiter(void 0, void 0, void 0, function* () {
    const finnhubAPI = new finnhub_1.default('c4hm412ad3ifj3t4h07g');
    const getCandles = () => __awaiter(void 0, void 0, void 0, function* () {
        const candles = yield finnhubAPI.getCandles(symbol, new Date(2020, 12, 1), new Date(), 'D');
        return candles;
    });
    const candles = yield getCandles();
    return candles.map((a) => { return Object.assign(Object.assign({}, a), { date: a.date.toString() }); });
});
const resolvers = {
    Query: {
        me: (_root, _args, context) => {
            return context.currentUser;
        },
        individualStock: (_root, args) => {
            const candles = getIndividualStockInformation(args.company);
            return candles;
        },
    },
    Mutation: {
        addUser: (_root, args) => __awaiter(void 0, void 0, void 0, function* () {
            const isUsernameFree = yield user_1.default.find({ usersUsername: args.username });
            if (isUsernameFree.length > 0) {
                console.log('the username is reserved');
                return;
            }
            const saltRounds = 10;
            const passwordHash = yield bcrypt_1.hash(args.password, saltRounds);
            const user = new user_1.default({
                usersUsername: args.username,
                usersPasswordHash: passwordHash,
                usersTransactions: [],
                usersHoldings: []
            });
            const savedUser = yield user.save();
            return savedUser;
        }),
        login: (_root, args) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_1.default.findOne({ usersUsername: args.username });
            const passwordCorrect = user === null
                ? false
                : yield bcrypt_1.compare(args.password, user.usersPasswordHash);
            if (!(user && passwordCorrect)) {
                return;
            }
            const userForToken = {
                username: user.usersUsername,
                id: user._id
            };
            const token = jsonwebtoken_1.default.sign(userForToken, process.env.SECRETFORTOKEN);
            return { value: token };
        }),
        buyStock: (_root, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            const candles = yield getIndividualStockInformation(args.stockName);
            // since this handles the unique validation, we don't need mongoose to do that (and I don't know how with ts)
            const firstBuyEver = yield stock_1.default.findOne({ stockSymbol: args.stockName.toUpperCase() });
            const loggedUser = context.currentUser;
            if (!firstBuyEver) {
                const newStock = new stock_1.default({
                    stockTotalAmount: args.amount,
                    stockSymbol: args.stockName.toUpperCase()
                });
                const newTransaction = new transaction_1.default({
                    transactionType: "Buy",
                    transactionDate: (new Date()).toString(),
                    transactionStockPrice: candles[candles.length - 1].close,
                    transactionStockAmount: args.amount,
                    transactionStock: newStock._id
                });
                yield newStock.save();
                yield user_1.default.updateOne({ usersUsername: loggedUser.usersUsername }, { $set: { usersTransactions: loggedUser.usersTransactions.concat(newTransaction._id), usersHoldings: loggedUser.usersHoldings
                            .concat({ usersStockName: newStock._id, usersTotalAmount: args.amount, usersTotalOriginalPriceValue: args.amount * newTransaction.transactionStockPrice }) } });
                const savedTransaction = yield newTransaction.save();
                return savedTransaction;
            }
            else {
                const newTransaction = new transaction_1.default({
                    transactionType: "Buy",
                    transactionDate: (new Date()).toString(),
                    transactionStockPrice: candles[candles.length - 1].close,
                    transactionStockAmount: args.amount,
                    transactionStock: firstBuyEver._id
                });
                const holdingToBeChanged = loggedUser.usersHoldings.filter((obj) => obj.usersStockName.toString() === firstBuyEver._id.toString())[0];
                const helperArrayOfHoldings = loggedUser.usersHoldings;
                helperArrayOfHoldings[loggedUser.usersHoldings.indexOf(holdingToBeChanged)] = { usersTotalAmount: (holdingToBeChanged.usersTotalAmount + args.amount),
                    usersTotalOriginalPriceValue: (holdingToBeChanged.usersTotalOriginalPriceValue + (args.amount * candles[candles.length - 1].close)), usersStockName: holdingToBeChanged.usersStockName };
                yield stock_1.default.updateOne({ _id: firstBuyEver._id }, { $set: { stockTotalAmount: firstBuyEver.stockTotalAmount + args.amount } });
                yield user_1.default.updateOne({ usersUsername: loggedUser.usersUsername }, { $set: { usersTransactions: loggedUser.usersTransactions.concat(newTransaction._id),
                        usersHoldings: helperArrayOfHoldings } });
                const savedTransaction = yield newTransaction.save();
                return savedTransaction;
            }
        }),
    }
};
exports.default = resolvers;
