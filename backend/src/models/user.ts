import mongoose from "mongoose";
import { UserType } from "../tsUtils/types";

// This file includes the User-model.

const schema = new mongoose.Schema<UserType>({
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
      type: mongoose.Types.ObjectId,
      ref: "Transaction"
    }
  ],
  // The list of holdings of the user.
  usersHoldings: [
    {
      usersStock: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock"
      },
      usersTotalAmount: {type: Number},
      usersTotalOriginalPriceValue: {type: Number}
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
        type: mongoose.Schema.Types.ObjectId,
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
        type: mongoose.Schema.Types.ObjectId,
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
  transform: (returnedObject: {id?: string, _id?: string, __v?: number, usersPasswordHash?: string}): void => {
    if (returnedObject._id) {
      returnedObject.id = returnedObject._id.toString();
    }
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.usersPasswordHash;
  }
});

export default mongoose.model<UserType>("User", schema);