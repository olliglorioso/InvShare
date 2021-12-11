"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appi = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("./src/models/user"));
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const resolvers_1 = __importDefault(require("./src/resolvers/resolvers"));
const typeDefs_1 = require("./src/utils/typeDefs");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const subscriptions_transport_ws_1 = require("subscriptions-transport-ws");
const graphql_1 = require("graphql");
const schema_1 = require("@graphql-tools/schema");
const connect_history_api_fallback_1 = __importDefault(require("connect-history-api-fallback"));
// In this index.ts-file are all the configurations and the server will be started here.
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    // Choosing the endpoint for the database with enviroment variables.
    const MONGODB_URI = process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development"
        ? process.env.MONGODB_TEST_URI || ""
        : process.env.MONGODB_URI || "";
    // Connecting to the database.
    void mongoose_1.default.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });
    // Creating the express-server.
    const app = express_1.default();
    // Adding cors-middleware.
    app.use(cors_1.default());
    // Health check route.
    app.get("/healthcheck", (_request, response) => {
        response.send("Up.");
    });
    // Adding the history-api-fallback-middleware.
    app.use(connect_history_api_fallback_1.default());
    // Adding the express.static-middleware.
    app.use(express_1.default.static("build"));
    const httpServer = http_1.createServer(app);
    const schema = schema_1.makeExecutableSchema({
        typeDefs: typeDefs_1.typeDefs,
        resolvers: resolvers_1.default,
    });
    // Creating the apollo-server.
    const server = new apollo_server_express_1.ApolloServer({
        schema,
        context: ({ req }) => __awaiter(void 0, void 0, void 0, function* () {
            const auth = req ? req.headers.authorization : null;
            if (auth && auth.toLowerCase().startsWith("bearer ")) {
                const decodedToken = jsonwebtoken_1.default.verify(auth.substring(7), process.env.SECRETFORTOKEN);
                const currentUser = yield user_1.default.findById(decodedToken.id)
                    .populate({ path: "usersHoldings", populate: { path: "usersStock" } })
                    .populate({ path: "usersTransactions", populate: { path: "transactionStock" } })
                    .populate({ path: "usersFollowing", populate: { path: "user", populate: { path: "usersTransactions", populate: { path: "transactionStock" } } } })
                    .populate({ path: "usersFollowers", populate: { path: "user" } });
                return { currentUser };
            }
            return null;
        }),
        introspection: true,
        plugins: [
            {
                serverWillStart() {
                    return __awaiter(this, void 0, void 0, function* () {
                        return {
                            drainServer() {
                                return __awaiter(this, void 0, void 0, function* () {
                                    subscriptionServer.close();
                                });
                            }
                        };
                    });
                }
            }
        ],
    });
    const subscriptionServer = subscriptions_transport_ws_1.SubscriptionServer.create({ schema, execute: graphql_1.execute, subscribe: graphql_1.subscribe,
        onConnect: () => console.log("connected"),
        onDisconnect: () => console.log("disconnected")
    }, { server: httpServer, path: "/subscriptions" });
    // Starting the server.
    void (yield server.start());
    server.applyMiddleware({ app });
    void httpServer.listen(({ port: process.env.PORT }), () => {
        console.log(`Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`);
    });
    return app;
});
exports.appi = void startServer();
