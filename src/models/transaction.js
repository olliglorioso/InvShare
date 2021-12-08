"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// This file includes the Transaction-model.
const schema = new mongoose_1.default.Schema({
    // The type of the transaction, either buy or sell.
    transactionType: {
        type: String,
        enum: ["Buy", "Sell"],
        required: true
    },
    // The date of the transaction.
    transactionDate: {
        type: String,
        required: true
    },
    // The stock that is involved in the transaction.
    transactionStock: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Stock",
        required: true
    },
    // How many stocks are involved in the transaction.
    transactionStockAmount: {
        type: String,
        required: true
    },
    // The price of the stock at the time of the transaction.
    transactionStockPrice: {
        type: Number,
        required: true
    }
});
exports.default = mongoose_1.default.model("Transaction", schema);
