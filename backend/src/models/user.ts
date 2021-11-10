import mongoose from "mongoose";
import { UserType } from "../types";

const schema = new mongoose.Schema<UserType>({
  usersUsername: {
    type: String,
    required: true,
    unique: true, 
    minglength: 4,
    maxlength: 15
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
      usersStockName: {
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