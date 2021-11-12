"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    usersUsername: {
        type: String,
        required: true,
        unique: true,
        minglength: 5,
        maxlength: 15,
    },
    usersPasswordHash: {
        type: String,
        required: true
    },
    usersTransactions: [
        {
            type: mongoose_1.default.Types.ObjectId,
            ref: "Transaction"
        }
    ],
    usersHoldings: [
        {
            usersStockName: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Stock"
            },
            usersTotalAmount: { type: Number },
            usersTotalOriginalPriceValue: { type: Number }
        }
    ],
});
schema.set('toJSON', {
    transform: (returnedObject) => {
        if (returnedObject._id) {
            returnedObject.id = returnedObject._id.toString();
        }
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.usersPasswordHash;
    }
});
exports.default = mongoose_1.default.model('User', schema);
