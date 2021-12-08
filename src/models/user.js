"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// This file includes the User-model.
const schema = new mongoose_1.default.Schema({
    // The username of the user.
    usersUsername: {
        type: String,
        required: true,
        unique: true,
        minglength: 4,
        maxlength: 15
    },
    // This helps currentPortfolioValue-query in the case
    // that user has sold all their stocks and buys a new first one.
    usersFirstPurchaseDate: {
        type: String
    },
    // The encrypted password of the user.
    usersPasswordHash: {
        type: String,
        required: true
    },
    // The list of transactions of the user.
    usersTransactions: [
        {
            type: mongoose_1.default.Types.ObjectId,
            ref: "Transaction"
        }
    ],
    // The list of holdings of the user.
    usersHoldings: [
        {
            usersStock: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Stock"
            },
            usersTotalAmount: { type: Number },
            usersTotalOriginalPriceValue: { type: Number }
        }
    ],
    // The money made by the user. Money is made by buying stocks and selling them with 
    // a higher price, of course.
    moneyMade: {
        type: Number,
        required: true
    },
    // The list of followers of the user.
    usersFollowers: [
        {
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User"
            },
            date: {
                type: String
            }
        }
    ],
    // The list of users that the user is following.
    usersFollowing: [
        {
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User"
            },
            date: {
                type: String
            }
        }
    ],
    // The number of followers of the user.
    followerCount: {
        type: Number,
        required: true
    },
    // The number of users that the user is following.
    followingCount: {
        type: Number,
        required: true
    }
});
// Modifying the schema in order to make the _id-item a string instead 
// of a mongoose-object.
schema.set("toJSON", {
    transform: (returnedObject) => {
        if (returnedObject._id) {
            returnedObject.id = returnedObject._id.toString();
        }
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.usersPasswordHash;
    }
});
exports.default = mongoose_1.default.model("User", schema);
