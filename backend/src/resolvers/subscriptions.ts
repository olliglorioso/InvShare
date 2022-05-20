import { withFilter } from "graphql-subscriptions"
import { pubsub } from "./resolvers"
import { StockEventType, FollowEventType, PopulatedUserType } from "../tsUtils/types"


const subscriptions = {
    
    stockEvent: {
        subscribe: withFilter(
            () => pubsub.asyncIterator(["STOCKEVENT"]),
            async (payload: StockEventType, {username}: {username: string}): Promise<boolean> => {
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
    followEvent: {
        subscribe: withFilter(
            () => pubsub.asyncIterator(["FOLLOWEVENT"]),
            async (payload: FollowEventType, {username}: {username: string}): Promise<boolean> => {
                if (payload.myFollowers
                    .map((o: {_id: string, user: PopulatedUserType, date: string}) => o.user.usersUsername)
                    .includes(username) 
                    || username === payload.followEvent.auteur) {
                    return true
                }
                return false
            }
        )
    }
}

export default subscriptions