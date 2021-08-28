import { ApolloServer, gql } from 'apollo-server';
import mongoose from 'mongoose'
import User from './models/user'
import Stock from './models/stock'
import {hash, compare} from 'bcrypt'
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require('dotenv').config()
import jwt from 'jsonwebtoken';
import Transaction from './models/transaction';
import { CandlesType, Holding, TransactionType, UserType } from './types';
import FinnhubAPI, { MarketDataItem } from '@stoqey/finnhub'


const MONGODB_URI: string = process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI || ''
    : process.env.MONGODB_URI || ''

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(()=> {
        console.log('connected to mongodb');
    })
    .catch((error) => {
        console.log('error connection to mongodb ', error);
    });     
  
const typeDefs = gql`
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



const getIndividualStockInformation = async (symbol: string): Promise<CandlesType[]> => {
    const finnhubAPI = new FinnhubAPI('c4hm412ad3ifj3t4h07g');
    const getCandles = async (): Promise<MarketDataItem[]> => {
        const candles = await finnhubAPI.getCandles(symbol, new Date(2020, 12, 1), new Date(), 'D')
        return candles
    }
    const candles = await getCandles()
    return candles.map((a: {close: number, date: Date, high: number, low: number, open: number, volume: number}) => {return {...a, date: a.date.toString()}})
}

const resolvers = {
    Query: {
        me: (_root: undefined, _args: void, context: {currentUser: UserType}): UserType => {
            return context.currentUser
        },
        individualStock: (_root: undefined, args: {company: string}): Promise<CandlesType[]> => {
            const candles = getIndividualStockInformation(args.company)
            return candles
        },
        
    },

    Mutation: {
        addUser: async (_root: undefined, args: {password: string, username: string}): Promise<UserType | void> => {
            const isUsernameFree = await User.find({usersUsername: args.username})
            if (isUsernameFree.length > 0) {
                console.log('the username is reserved')
                return
            }
            const saltRounds = 10
            const passwordHash = await hash(args.password, saltRounds)
            const user = new User({
                usersUsername: args.username,
                usersPasswordHash: passwordHash,
                usersTransactions: [],
                usersHoldings: []
            });
            const savedUser = await user.save();
            return savedUser;
            
        },
        login: async (_root: undefined, args: {username: string, password: string}): Promise<void | {value: string}> => {
            const user = await User.findOne({usersUsername: args.username})

            const passwordCorrect = user === null
                ? false
                : await compare(args.password, user.usersPasswordHash)
            
            if (!(user && passwordCorrect)) {
                return
            }
            
            
            const userForToken = {
                username: user.usersUsername,
                id: (user._id as string)
            }

            const token = jwt.sign(userForToken, process.env.SECRETFORTOKEN as string);
            return {value: token};
        },
        buyStock: async (_root: undefined, args: {stockName: string, amount: number}, context: {currentUser: UserType}): Promise<TransactionType> => {
            const candles = await getIndividualStockInformation(args.stockName)
            // since this handles the unique validation, we don't need mongoose to do that (and I don't know how with ts)
            const firstBuyEver = await Stock.findOne({stockSymbol: args.stockName.toUpperCase()})
            const loggedUser = context.currentUser
            
            if(!firstBuyEver) {
                const newStock = new Stock({
                    stockTotalAmount: args.amount,
                    stockSymbol: args.stockName.toUpperCase()
                })
        
                const newTransaction = new Transaction({
                    transactionType: "Buy",
                    transactionDate: (new Date()).toString(),
                    transactionStockPrice: candles[candles.length - 1].close,
                    transactionStockAmount: args.amount,
                    transactionStock: newStock._id as string
                })
                
                await newStock.save()
                await User.updateOne({usersUsername: loggedUser.usersUsername},
                {$set: {usersTransactions: loggedUser.usersTransactions.concat(newTransaction._id), usersHoldings: loggedUser.usersHoldings
                .concat({usersStockName: newStock._id as mongoose.Types.ObjectId, usersTotalAmount: args.amount, usersTotalOriginalPriceValue: args.amount * newTransaction.transactionStockPrice})}})
                const savedTransaction = await newTransaction.save()
                return savedTransaction
            } else {
                
                const newTransaction = new Transaction({
                    transactionType: "Buy",
                    transactionDate: (new Date()).toString(),
                    transactionStockPrice: candles[candles.length - 1].close,
                    transactionStockAmount: args.amount,
                    transactionStock: firstBuyEver._id as mongoose.Types.ObjectId
                })
                const holdingToBeChanged = loggedUser.usersHoldings.filter((obj: Holding) => obj.usersStockName.toString() === (firstBuyEver._id as mongoose.Types.ObjectId).toString())[0]
                const helperArrayOfHoldings = loggedUser.usersHoldings
                helperArrayOfHoldings[loggedUser.usersHoldings.indexOf(holdingToBeChanged)] = {usersTotalAmount: (holdingToBeChanged.usersTotalAmount + args.amount),
                usersTotalOriginalPriceValue: (holdingToBeChanged.usersTotalOriginalPriceValue + (args.amount * candles[candles.length - 1].close)), usersStockName: holdingToBeChanged.usersStockName}
                await Stock.updateOne({_id: (firstBuyEver._id as mongoose.Types.ObjectId)}, {$set: {stockTotalAmount: firstBuyEver.stockTotalAmount + args.amount}})
                await User.updateOne({usersUsername: loggedUser.usersUsername},
                {$set: {usersTransactions: loggedUser.usersTransactions.concat(newTransaction._id),
                usersHoldings: helperArrayOfHoldings}})
                const savedTransaction = await newTransaction.save()
                return savedTransaction

            }

        },
    }
}
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }): Promise<{currentUser: (UserType | null)} | null> => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
            const decodedToken = <{id: string, iat: number}>jwt.verify(auth.substring(7), (process.env.SECRETFORTOKEN as string));
            const currentUser = await User
                .findById(decodedToken.id).populate('usersHoldings').populate('usersTransactions');
            return {currentUser};
        }
        return null;
      }
});

void server.listen().then(({url}: {url: string}) => {
    console.log(`Server ready at ${url}`);
});