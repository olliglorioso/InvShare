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
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_subscriptions_1 = require("graphql-subscriptions");
const resolvers_1 = require("./resolvers");
// This file includes all the GraphQL-subscriptions that are available to the client.
const subscriptions = {
    // StockEvent is published when a user purchases/sells a stock.
    // It is used to update the user's analysis information, moneyMade, transactions, and actions.
    stockEvent: {
        subscribe: graphql_subscriptions_1.withFilter(() => resolvers_1.pubsub.asyncIterator(["STOCKEVENT"]), (payload, { username }) => __awaiter(void 0, void 0, void 0, function* () {
            // Store payload's result in a variable.
            // Only the current user and their followers can see the stockEvent-subscription.
            if (payload.stockEvent.myFollowers
                .map((o) => o.user.usersUsername)
                .includes(username)
                || username === payload.stockEvent.me) {
                return true;
            }
            return false;
        }))
    },
    // FollowEvent is published when a user follows/unfollows another user.
    followEvent: {
        subscribe: graphql_subscriptions_1.withFilter(() => resolvers_1.pubsub.asyncIterator(["FOLLOWEVENT"]), (payload, { username }) => __awaiter(void 0, void 0, void 0, function* () {
            // Only the current user and their followers can see the followEvent.
            if (payload.myFollowers
                .map((o) => o.user.usersUsername)
                .includes(username)
                || username === payload.followEvent.auteur) {
                return true;
            }
            // Otherwise, the followEvent isn't published to the specific client.
            return false;
        }))
    }
};
exports.default = subscriptions;
