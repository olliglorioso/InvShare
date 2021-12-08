"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pubsub = void 0;
const graphql_subscriptions_1 = require("graphql-subscriptions");
const queries_1 = __importDefault(require("./queries"));
const mutations_1 = __importDefault(require("./mutations"));
const subscriptions_1 = __importDefault(require("./subscriptions"));
exports.pubsub = new graphql_subscriptions_1.PubSub();
const resolvers = {
    Query: queries_1.default,
    Mutation: mutations_1.default,
    Subscription: subscriptions_1.default
};
exports.default = resolvers;
