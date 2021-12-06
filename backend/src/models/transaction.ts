import mongoose from "mongoose"
import { TransactionType } from "../tsUtils/types";

// This file includes the Transaction-model.

const schema = new mongoose.Schema<TransactionType>({
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
      type: mongoose.Types.ObjectId,
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

export default mongoose.model<TransactionType>("Transaction", schema);

