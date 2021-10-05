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
        usersStockName: ID!
        usersTotalAmount: Int!
        usersTotalOriginalPriceValue: Float!
    }

    type Transaction {
        transactionType: String!
        transactionDate: String!
        transactionStock: Stock!
        transactionStockAmount: Int!
        transactionStockPrice: Float!
    }

    type User {
        usersUsername: String!
        usersPasswordHash: String!
        usersTransactions: [Transaction]!
        usersHoldings: [Holding]!
        id: ID!
    }

    type Query {
        me: User
        individualStock (company: String!): [IndividualStock]!
        currentPortfolioValue: Float!
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
    }
`;

