import { ApolloServer} from "apollo-server-express";
import mongoose from "mongoose"
import User from "./src/models/user"
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config()
import jwt from "jsonwebtoken";
import resolvers from "./src/resolvers";
import { PopulatedUserType } from "./src/types";
import {typeDefs} from "./src/typeDefs";
import express from "express"
import cors from "cors"
import {createServer} from "http"
import {SubscriptionServer} from "subscriptions-transport-ws"
import { execute, subscribe } from "graphql"
import { makeExecutableSchema } from "@graphql-tools/schema";
import history from "connect-history-api-fallback"

const startServer = async () => {
    const MONGODB_URI: string = process.env.NODE_ENV === "test"
    ? process.env.MONGODB_TEST_URI || ""
    : process.env.MONGODB_URI || ""

    void mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

    const app = express()
    app.use(cors())
    
    app.use(history())
    app.use(express.static("build"))
    app.get("/healthcheck", (_req, res) => {
        res.send("toimii")
    })

    const httpServer = createServer(app)

    const schema = makeExecutableSchema({ 
        typeDefs, 
        resolvers
    })

    const server = new ApolloServer({
        schema,
        context: async ({ req }): Promise<{currentUser: (PopulatedUserType | null)} | null> => {
            const auth = req ? req.headers.authorization : null;
            if (auth && auth.toLowerCase().startsWith("bearer ")) {
                const decodedToken = <{id: string, iat: number}>jwt.verify(auth.substring(7), (process.env.SECRETFORTOKEN as string));
                const currentUser = await User.findById(decodedToken.id).populate({path: "usersHoldings", populate: {path: "usersStockName"}}).populate({path: "usersTransactions", populate: {path: "transactionStock"}}) as unknown as PopulatedUserType
                return {currentUser};
            }
            return null;
        },
        introspection: true,
        plugins: [
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            subscriptionServer.close()
                        }
                    }
                }
            }
        ],
    });

    const subscriptionServer = SubscriptionServer.create(
        {schema, execute, subscribe,
            onConnect: () => console.log("connected"),
            onDisconnect: () => console.log("disconnected")
        }, 
        {server: httpServer, path: "/subscriptions"},
    )

    
    void await server.start()

    server.applyMiddleware({app})
    void httpServer.listen(({port: process.env.PORT}), () => {
        console.log(`Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`);
    })
    return app
}

export const appi = void startServer()