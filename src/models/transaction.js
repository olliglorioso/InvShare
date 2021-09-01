"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    transactionType: {
        type: String,
        enum: ["Buy", "Sell"],
        required: true
    },
    transactionDate: {
        type: Date,
        required: true
    },
    transactionStock: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Stock",
        required: true
    },
    transactionStockAmount: {
        type: String,
        required: true
    },
    transactionStockPrice: {
        type: Number,
        required: true
    }
});
exports.default = mongoose_1.default.model('Transaction', schema);
