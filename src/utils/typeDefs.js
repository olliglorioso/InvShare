"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const apollo_server_core_1 = require("apollo-server-core");
// This is a file that includes the GraphQL-schema for the application.
exports.typeDefs = apollo_server_core_1.gql `
    type Token {
        value: String!
        username: String!
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
        usersStock: Stock!
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

    type FollowType {
        date: String
        user: User
    }

    type User {
        usersUsername: String!
        usersPasswordHash: String!
        usersTransactions: [Transaction]!
        usersHoldings: [Holding]!
        moneyMade: Float!
        followerCount: Int
        followingCount: Int
        usersFollowers: [FollowType]
        usersFollowing: [FollowType]
        _id: ID
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

    type Result {
        result: Boolean
    }

    type ActionsType {
        transaction: Transaction!
        transactionOwner: String!
    }

    type FollowEvent {
        followType: String!
        auteur: String!
        object: String!
        date: String!
        myFollowers: [FollowType]!
    }

    type FollowType {
        date: String!
        user: User
    }

    type StockTransactionType {
        transaction: Transaction!
        me: String!
        myFollowers: [FollowType]
    }

    type Query {
        stockHistory (symbol: String!): Prediction
        me: User
        searchUser (username: String!): [User]!
        individualStock (company: String!): [IndividualStock]!
        currentPortfolioValue (mode: String!): [AnalysisType]
        getActions: [ActionsType]
    }

    type Mutation {
        addUser (
            username: String!
            password: String!
        ): User
        followUser (
            username: String!
        ): Result
        unfollowUser (
            username: String!
        ): Result
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
        ): Transaction!
    }

    type Subscription {
        stockEvent(username: String): StockTransactionType
        followEvent(username: String): FollowEvent!
    }
`;
