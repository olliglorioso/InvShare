import { gql } from "apollo-server-core";
import { DocumentNode } from "graphql";

export const typeDefs: DocumentNode = gql`
    type Token {
        value: String!
    }

    type IndividualStock {
        close: Float!
        date: String!
        high: Float!
        low: Float!
        open: Float!
        volume: Int!
    }

    type Stock {
        _id: ID!
        stockTotalAmount: Int!
        stockSymbol: String!
    }

    type Holding {
        usersStockName: Stock!
        usersTotalAmount: Int!
        usersTotalOriginalPriceValue: Float!
    }

    type Transaction {
        transactionType: String!
        transactionDate: String!
        transactionStock: Stock!
        transactionStockAmount: Int!
        transactionStockPrice: Float!
        _id: ID!
    }

    type User {
        usersUsername: String!
        usersPasswordHash: String!
        usersTransactions: [Transaction]!
        usersHoldings: [Holding]!
        id: ID!
    }

    type AnalysisData {
        name: String
        sticks: [IndividualStock]
    }

    type AnalysisType {
        wholeValue: Float
        analysisValues: [AnalysisData]
    }

    type Tsvalue {
        date: String!,
        value: Float!
    }

    type Metadata {
        information: String!,
        symbol: String!,
        lastRefresh: String!
    }

    type Prediction {
        metadata: Metadata,
        time_series: [Tsvalue]
    }

    type Query {
        stockPrediction (symbol: String!): Prediction
        me: User
        individualStock (company: String!): [IndividualStock]!
        currentPortfolioValue (mode: String!): [AnalysisType]
    }

    type Resp {
        res: Int!
    }

    type Mutation {
        addUser (
            username: String!
            password: String!
        ): User
        login (
            username: String!
            password: String!
        ): Token
        buyStock(
            stockName: String!
            amount: Int!
        ): Transaction
        sellStock(
            stockName: String!
            amount: Int!
            price: Float!
        ): Resp
    }
`;

