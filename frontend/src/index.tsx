import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import sidebarReducer from "./reducers/sidebarReducer"
import userLoggedReducer from "./reducers/userLoggedReducer"
import modeSwitchReducer from "./reducers/modeSwitchReducer"
import buyingStockReducer from "./reducers/buyingStockReducer"
import { createStore, combineReducers } from "redux"
import { Provider } from "react-redux"
import {ApolloClient, ApolloProvider, HttpLink, InMemoryCache, split} from "@apollo/client"
import { getMainDefinition } from "@apollo/client/utilities"
import { setContext } from "@apollo/client/link/context"
import firstBuyReducer from "./reducers/firstBuyReducer"
import {WebSocketLink} from "@apollo/client/link/ws"


const reducer = combineReducers({
    user: userLoggedReducer,
    sidebar: sidebarReducer,
    stock: buyingStockReducer,
    mode: modeSwitchReducer,
    purchase: firstBuyReducer,
})

const httpLink = new HttpLink({ uri: "https://fso2021practicework.herokuapp.com/graphql" })

const wsLink = new WebSocketLink({
    uri: "ws://fso2021practicework.herokuapp.com/subscriptions",
    options: {
        reconnect: true
    },
})

const store = createStore(reducer)
export type RootState = ReturnType<typeof store.getState>

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem("usersToken")
    return {
        headers: {
            ...headers,
            authorization: token ? `bearer ${token}` : null,
        }
    }
})

const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
        )
    },
    wsLink,
    authLink.concat(httpLink),
)

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: splitLink
})

ReactDOM.render(
    <Provider store={store}>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </Provider>,
    document.getElementById("root")
);
