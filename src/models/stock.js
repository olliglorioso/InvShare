"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    stockSymbol: {
        type: String,
        required: true,
        unique: true
    },
    stockTotalAmount: {
        type: Number,
        required: true,
        min: [1, "There can't be less than one stock bought"]
    }
});
exports.default = mongoose_1.default.model('Stock', schema);
