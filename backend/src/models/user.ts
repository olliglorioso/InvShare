import mongoose from "mongoose";
import { UserType } from "../tsUtils/types";

const schema = new mongoose.Schema<UserType>({
  usersUsername: {
    type: String,
    required: true,
    unique: true, 
    minglength: 4,
    maxlength: 15
  },
  usersFirstPurchaseDate: {
    type: String
  },
  usersPasswordHash: {
    type: String,
    required: true
  },
  usersTransactions: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Transaction"
    }
  ],
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
  moneyMade: {
    type: Number,
    required: true
  },
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
  followerCount: {
    type: Number,
    required: true
  },
  followingCount: {
    type: Number,
    required: true
  }
});
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