import { withFilter } from "graphql-subscriptions"
import { pubsub } from "./resolvers"
import { StockEventType, FollowEventType, PopulatedUserType } from "../tsUtils/types"

// This file includes all the GraphQL-subscriptions that are available to the client.

const subscriptions = {
    // StockEvent is published when a user purchases/sells a stock.
    // It is used to update the user's analysis information, moneyMade, transactions, and actions.
    
    stockEvent: {
        subscribe: withFilter(
            () => pubsub.asyncIterator(["STOCKEVENT"]),
            async (payload: StockEventType, {username}: {username: string}): Promise<boolean> => {
                // Store payload's result in a variable.
                // Only the current user and their followers can see the stockEvent-subscription.
                if (payload.stockEvent.myFollowers
                    .map((o: {id: string, user: PopulatedUserType}) => o.user.usersUsername)
                    .includes(username) 
                    || username === payload.stockEvent.me) {
                    return true
                } 
                return false
            }
        )
    },
    // FollowEvent is published when a user follows/unfollows another user.
    followEvent: {
        subscribe: withFilter(
            () => pubsub.asyncIterator(["FOLLOWEVENT"]),
            async (payload: FollowEventType, {username}: {username: string}): Promise<boolean> => {
                // Only the current user and their followers can see the followEvent.
                if (payload.myFollowers
                    .map((o: {_id: string, user: PopulatedUserType, date: string}) => o.user.usersUsername)
                    .includes(username) 
                    || username === payload.followEvent.auteur) {
                    return true
                }
                // Otherwise, the followEvent isn't published to the specific client.
                return false
            }
        )
    }
}

export default subscriptions