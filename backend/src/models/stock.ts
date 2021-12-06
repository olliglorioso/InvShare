import mongoose from "mongoose";
import { StockType } from "../tsUtils/types";

// This file includes the Stock-model.

const schema = new mongoose.Schema<StockType>({
  // The stock symbol.
  stockSymbol: {
    type: String,
    required: true,
    unique: true
  },
  // The total purchased amount of this stock. Could be used for statistics.
  stockTotalAmount: {
      type: Number,
      required: true,
      min: [1, "There can't be less than one stock bought."]
  }
});


export default mongoose.model<StockType>("Stock", schema);