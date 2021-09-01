import { ApolloServer} from 'apollo-server-express';
import { GraphQLError } from 'graphql';
import mongoose from 'mongoose'
import User from './src/models/user'
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require('dotenv').config()
import jwt from 'jsonwebtoken';
import resolvers from './src/resolvers';
import { UserType } from './src/types';
import {typeDefs} from './src/typeDefs';
import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import cors from 'cors'

const startServer = async () => {
    const MONGODB_URI: string = process.env.NODE_ENV === 'test'
    ? process.env.MONGODB_TEST_URI || ''
    : process.env.MONGODB_URI || ''

    mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
        .then(()=> {
            console.log('connected to mongodb');
        })
        .catch((error) => {
            console.log('error connection to mongodb ', error);
        });     

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
        },
        introspection: true,
        formatError: (error: GraphQLError): GraphQLError => {
            const errId = uuidv4()
            console.log(errId)
            console.log(error)
            return new GraphQLError(`Error occured: ${errId}`)
        }
    });

    const app = express()
    app.use(cors())
    app.use(express.static('../build'))
    void await server.start()

    server.applyMiddleware({app})
    void app.listen(({port: process.env.PORT}), () => {
        console.log(`Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`);
    });
    return app
}

export const appi = void startServer()