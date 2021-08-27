const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');
const User = require('./models/user');
const Stock = require('./models/stock')
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
import FinnhubAPI from '@stoqey/finnhub'

const MONGODB_URI = process.env.MONGODB_URI;

console.log('connecting to', MONGODB_URI);

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.log('connected to mongodb');
    })
    .catch((error: any) => {
        console.log('error connection to mongodb ', error.message);
    });     
  
const typeDefs = gql`
    type BoughtStock {
        companyName: String!
        oneStockPrice: Float!
        amount: Int!
        user: ID!
    }

    type Stock {
        close: Float!
        date: String!
        high: Float!
        low: Float!
        open: Float!
        volume: Int!
    }

    type Token {
        value: String!
    }

    type User {
        username: String!
        passwordHash: String!
        id: ID!
        stocks: [BoughtStock]
    }
    
    type Query {
        allUsers: [User!]!
        me: User
        individualStock (company: String!): [Stock]!
    }

    type Mutation {
        addUser(
            username: String!
            password: String!
        ): User
        login(
            username: String!
            password: String!
        ): Token
        buyStock(
            stockName: String!
            oneStockPrice: Float!
            amount: Int!
        ): BoughtStock
    }


`;

const resolvers = {
    Query: {
        allUsers: () => User.find({}),
        me: (_root: any, _args: any, context: any) => {
            console.log(context.currentUser)
            return context.currentUser
        },
        individualStock: async (_root: any, args: any) => {
            const company = args.company
            
            const finnhubAPI = new FinnhubAPI('c4hm412ad3ifj3t4h07g');
            const getCandles = async () => {
                const candles = await finnhubAPI.getCandles(company, new Date(2020, 12, 1), new Date(), 'D');
                return candles
            }
            const candles = await getCandles()
            return candles.map((a: {close: number, date: Date, high: number, low: number, open: number, volume: number}) => {return {...a, date: a.date.toString()}})
        }
    },
    Mutation: {
        addUser: async (_root: any, args: any) => {
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(args.password, saltRounds);
            const user = new User({
                username: args.username,
                passwordHash,
                stocks: []
            });
            const savedUser = await user.save();

            return savedUser;
        },
        login: async (_root: any, args: any) => {
            const user = await User.findOne({username: args.username});
            const passwordCorrect = user === null
                ? false
                : await bcrypt.compare(args.password, user.passwordHash);
            if (!(user && passwordCorrect)) {
                return;
            }
            const userForToken = {
                username: user.username,
                id: user._id,
            };

            const token = jwt.sign(userForToken, process.env.SECRETFORTOKEN);
            return {value: token};
        },
        buyStock: async (_root: any, args: any, context: any) => {
            console.log(context)
            console.log(args)
            const stock = new Stock({
                companyName: args.stockName,
                oneStockPrice: args.oneStockPrice,
                amount: args.amount,
                user: context.currentUser.id
            })


            const savedStock = await stock.save()
            
            context.currentUser.stocks = context.currentUser.stocks.concat(savedStock._id)
            await context.currentUser.save()
            return savedStock
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }: {req: any}) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
            const decodedToken = jwt.verify(
            auth.substring(7), process.env.SECRETFORTOKEN
          );
          const currentUser = await User
            .findById(decodedToken.id).populate('stocks');
          return { currentUser };
        }
        return null;
      }
});

server.listen().then(({url}: {url: string}) => {
    console.log(`Server ready at ${url}`);
});