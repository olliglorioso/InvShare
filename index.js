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
const graphql_1 = require("graphql");
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("./src/models/user"));
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require('dotenv').config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const resolvers_1 = __importDefault(require("./src/resolvers"));
const typeDefs_1 = require("./src/typeDefs");
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const cors_1 = __importDefault(require("cors"));
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    const MONGODB_URI = process.env.NODE_ENV === 'test'
        ? process.env.MONGODB_TEST_URI || ''
        : process.env.MONGODB_URI || '';
    mongoose_1.default.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
        .then(() => {
        console.log('connected to mongodb');
    })
        .catch((error) => {
        console.log('error connection to mongodb ', error);
    });
    const server = new apollo_server_express_1.ApolloServer({
        typeDefs: typeDefs_1.typeDefs,
        resolvers: resolvers_1.default,
        context: ({ req }) => __awaiter(void 0, void 0, void 0, function* () {
            const auth = req ? req.headers.authorization : null;
            if (auth && auth.toLowerCase().startsWith('bearer ')) {
                const decodedToken = jsonwebtoken_1.default.verify(auth.substring(7), process.env.SECRETFORTOKEN);
                const currentUser = yield user_1.default
                    .findById(decodedToken.id).populate('usersHoldings').populate('usersTransactions');
                return { currentUser };
            }
            return null;
        }),
        introspection: true,
        formatError: (error) => {
            const errId = uuid_1.v4();
            console.log(errId);
            console.log(error);
            return new graphql_1.GraphQLError(`Error occured: ${errId}`);
        }
    });
    const app = express_1.default();
    app.use(cors_1.default());
    app.use(express_1.default.static('build'));
    void (yield server.start());
    server.applyMiddleware({ app });
    void app.listen(({ port: process.env.PORT }), () => {
        console.log(`Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`);
    });
    return app;
});
exports.appi = void startServer();
