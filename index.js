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
const apollo_server_express_1 = require("apollo-server-express");
const user_1 = __importDefault(require("./src/models/user"));
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const resolvers_1 = __importDefault(require("./src/resolvers/resolvers"));
const typeDefs_1 = require("./src/utils/typeDefs");
const http_1 = require("http");
const subscriptions_transport_ws_1 = require("subscriptions-transport-ws");
const graphql_1 = require("graphql");
const schema_1 = require("@graphql-tools/schema");
const app_1 = __importDefault(require("./src/utils/app"));
// In this index.ts-file are all the configurations and the server will be started here.
const startServer = (port) => __awaiter(void 0, void 0, void 0, function* () {
    const httpServer = http_1.createServer(app_1.default);
    const schema = schema_1.makeExecutableSchema({
        typeDefs: typeDefs_1.typeDefs,
        resolvers: resolvers_1.default,
    });
    // Configuring the ApolloServer.
    const server = new apollo_server_express_1.ApolloServer({
        schema,
        context: ({ req }) => __awaiter(void 0, void 0, void 0, function* () {
            const auth = req ? req.headers.authorization : null;
            if (process.env.NODE_ENV === "test") {
                const currentUser = yield user_1.default.find({ usersUsername: "koirakoira" })
                    .populate({ path: "usersHoldings", populate: { path: "usersStock" } })
                    .populate({ path: "usersTransactions", populate: { path: "transactionStock" } })
                    .populate({ path: "usersFollowing", populate: { path: "user", populate: { path: "usersTransactions", populate: { path: "transactionStock" } } } })
                    .populate({ path: "usersFollowers", populate: { path: "user" } });
                if (currentUser.length === 0) {
                    return null;
                }
                else {
                    return { currentUser: currentUser[0] };
                }
            }
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
    const subscriptionServer = subscriptions_transport_ws_1.SubscriptionServer.create({ schema, execute: graphql_1.execute, subscribe: graphql_1.subscribe }, { server: httpServer, path: "/subscriptions" });
    // Starting the server.
    void (yield server.start());
    server.applyMiddleware({ app: app_1.default });
    void httpServer.listen(({ port: port || process.env.PORT }));
    return app_1.default;
});
void startServer();
