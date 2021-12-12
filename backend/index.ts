import { ApolloServer} from "apollo-server-express";
import User from "./src/models/user"
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config()
import jwt from "jsonwebtoken";
import resolvers from "./src/resolvers/resolvers";
import { PopulatedUserType } from "./src/tsUtils/types";
import { typeDefs } from "./src/utils/typeDefs";
import { createServer } from "http"
import { SubscriptionServer } from "subscriptions-transport-ws"
import { execute, subscribe } from "graphql"
import { makeExecutableSchema } from "@graphql-tools/schema";
import app from "./src/utils/app";

// In this index.ts-file are all the configurations and the server will be started here.

const startServer = async (port?: number) => {
    const httpServer = createServer(app)

    const schema = makeExecutableSchema({ 
        typeDefs, 
        resolvers,
    })

    // Configuring the ApolloServer.
    const server = new ApolloServer({
        schema,
        context: async ({ req }): Promise<{currentUser: (PopulatedUserType | null)} | null> => {
            const auth = req ? req.headers.authorization : null;
            if (process.env.NODE_ENV === "test") {
                const currentUser = await User.find({ usersUsername: "koirakoira" })
                    .populate({path: "usersHoldings", populate: {path: "usersStock"}})
                    .populate({path: "usersTransactions", populate: {path: "transactionStock"}})
                    .populate({path: "usersFollowing", populate: {path: "user", populate: {path: "usersTransactions", populate: {path: "transactionStock"}}}})
                    .populate({path: "usersFollowers", populate: {path: "user"}}) as unknown as PopulatedUserType[]
                if (currentUser.length === 0) {
                    return null
                } else {
                    return {currentUser: currentUser[0]}
                }
            }
            if (auth && auth.toLowerCase().startsWith("bearer ")) {
                const decodedToken = <{id: string, iat: number}>jwt.verify(auth.substring(7), (process.env.SECRETFORTOKEN as string));
                const currentUser = await User.findById(decodedToken.id)
                    .populate({path: "usersHoldings", populate: {path: "usersStock"}})
                    .populate({path: "usersTransactions", populate: {path: "transactionStock"}})
                    .populate({path: "usersFollowing", populate: {path: "user", populate: {path: "usersTransactions", populate: {path: "transactionStock"}}}})
                    .populate({path: "usersFollowers", populate: {path: "user"}}) as unknown as PopulatedUserType
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
        {schema, execute, subscribe}, 
        {server: httpServer, path: "/subscriptions"},
    )

    // Starting the server.
    void await server.start()
    server.applyMiddleware({app})
    void httpServer.listen(({port: port || process.env.PORT}))
    return app
}

void startServer()