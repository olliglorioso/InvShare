import mongoose from "mongoose"
import { TransactionType } from "../tsUtils/types"
import Transaction from "../models/transaction"

// This file includes miscellaneous but useful functions that are used in the backend.

// This function gives a Transaction-object in a useful format with the given id.
export const getTransactionToReturn = async (id: mongoose.Types.ObjectId): Promise<TransactionType | null> => {
        return await Transaction.findOne({_id: id}).populate("transactionStock")
}
