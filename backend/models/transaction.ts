import mongoose from "mongoose"
import { TransactionType } from "../types";

const schema = new mongoose.Schema<TransactionType>({
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
      type: mongoose.Types.ObjectId,
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

export default mongoose.model<TransactionType>('Transaction', schema);

