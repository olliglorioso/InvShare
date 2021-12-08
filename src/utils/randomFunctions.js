"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionToReturn = void 0;
const transaction_1 = __importDefault(require("../models/transaction"));
// This file includes miscellaneous but useful functions that are used in the backend.
// This function gives a Transaction-object in a useful format with the given id.
const getTransactionToReturn = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield transaction_1.default.findOne({ _id: id }).populate("transactionStock");
});
exports.getTransactionToReturn = getTransactionToReturn;
