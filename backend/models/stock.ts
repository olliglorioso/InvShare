import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const schema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    // unique: true,
  },
  oneStockPrice: {
      type: Number,
      required: true,
  },
  amount: {
      type: Number,
      required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

schema.plugin(uniqueValidator);

module.exports = mongoose.model('Stock', schema);