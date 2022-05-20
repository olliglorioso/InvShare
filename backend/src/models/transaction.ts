import mongoose from "mongoose"
import { TransactionType } from "../tsUtils/types";


const schema = new mongoose.Schema<TransactionType>({
  transactionType: {
      type: String,
      enum: ["Buy", "Sell"],
      required: true
  },
  transactionDate: {
      type: String,
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

export default mongoose.model<TransactionType>("Transaction", schema);

