"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const apollo_server_core_1 = require("apollo-server-core");
exports.typeDefs = apollo_server_core_1.gql `
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

    type Holding {
        usersStockName: ID!
        usersTotalAmount: Int!
        usersTotalOriginalPriceValue: Float!
    }

    type Transaction {
        transactionType: String!
        transactionDate: String!
        transactionStock: ID!
        transactionStockAmount: Int!
        transactionStockPrice: Float!
    }

    type User {
        usersUsername: String!
        usersPasswordHash: String!
        usersTransactions: [ID]!
        usersHoldings: [Holding]!
        id: ID!
    }

    type Query {
        me: User
        individualStock (company: String!): [IndividualStock]!
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
