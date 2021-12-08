import mongoose from "mongoose";

// This file contains all the Typescript-types used in the project.

export interface HandleChangeType {
  (event: React.ChangeEvent<HTMLInputElement>): void;
}

export interface HandleBlurType {
  (e: React.FocusEvent<unknown>): void;
}

export interface HandleSubmitType {
  (e: React.FormEvent<HTMLFormElement>): void;
}

export interface UserInformation {
  username: string,
  password: string
}

export interface AnalysisData {
  name: string;
  __typename: "AnalysisData";
  sticks: CandleStock[];
}

export interface Holdings {
  usersTotalAmount: number;
  usersTotalOriginalPriceValue: number;
  __typename: string;
  usersStock: StockType;
}

export interface OldDataType {
  metadata: {
    information: string;
    symbol: string;
    lastRefresh: string;
  };
  time_series: {date: string, value: number}[];
}

export type CandleStock = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  __typename: string;
};

export interface BuyStockValuesType {
  company: string;
  amount: string;
  price_per_stock: string;
}

export type StockType = {
  stockSymbol: string;
  stockTotalAmount: number;
  __typename: string;
};
export type TransactionType = {
  transactionDate: string;
  transactionStock: StockType;
  transactionStockAmount: number;
  transactionStockPrice: number;
  transactionType: string;
  __typename: string;
  _id: mongoose.Types.ObjectId;
};
