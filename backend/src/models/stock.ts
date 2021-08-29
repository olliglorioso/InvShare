import mongoose from 'mongoose';
import { StockType } from '../types';

const schema = new mongoose.Schema<StockType>({
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


export default mongoose.model<StockType>('Stock', schema);