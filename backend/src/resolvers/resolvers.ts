import { PubSub } from "graphql-subscriptions"
import queries from "./queries"
import mutations from "./mutations"
import subscriptions from "./subscriptions"
export const pubsub = new PubSub()

const resolvers = {
    Query: queries,
    Mutation: mutations,
    Subscription: subscriptions
}

export default resolvers