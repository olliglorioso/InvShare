import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import sidebarReducer from "./reducers/sidebarReducer";
import userLoggedReducer from "./reducers/userLoggedReducer";
import modeSwitchReducer from "./reducers/modeSwitchReducer";
import buyingStockReducer from "./reducers/buyingStockReducer";
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import {
    ApolloClient,
    ApolloProvider,
    HttpLink,
    InMemoryCache,
    split,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";
import firstBuyReducer from "./reducers/firstBuyReducer";
import { WebSocketLink } from "@apollo/client/link/ws";
import actionNotificationReducer from "./reducers/actionNotificationReducer";
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config();


// Here we combine all our reducers into one store. This way we can easily access them in our components.
// Generally combineReducer-allows us to create multiple reducers.
const reducer = combineReducers({
    user: userLoggedReducer,
    sidebar: sidebarReducer,
    stock: buyingStockReducer,
    mode: modeSwitchReducer,
    purchase: firstBuyReducer,
    notification: actionNotificationReducer
});

// Deciding which backend endpoint we want to use with the help of environment variables.
const gqlUri = process.env.NODE_ENV === "development" ? process.env.REACT_APP_DEVELOPMENT_BACKEND : process.env.REACT_APP_PRODUCTION_BACKEND;
const httpLink = new HttpLink({ uri: gqlUri });

// Deciding which websocket endpoint we want to use with the help of environment variables.
const wsUri = process.env.NODE_ENV === "development" ? process.env.REACT_APP_DEVELOPMENT_WEBSOCKET : process.env.REACT_APP_PRODUCTION_WEBSOCKET;
console.log(process.env);
console.log(gqlUri);
console.log(wsUri);

// Creating a WebSocketLink-object, which will be used to connect to the websocket endpoint and it is a terminating lik.
const wsLink = new WebSocketLink({
    uri: wsUri as string,
    options: {
        reconnect: true,
    },
});

// Creating a Redux-store.
const store = createStore(reducer);

// This is to use Typescript with Redux.
export type RootState = ReturnType<typeof store.getState>;

// This is to use headers with our backend-requests, especially for authorization.
const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem("usersToken");
    return {
        headers: {
            ...headers,
            authorization: token ? `bearer ${token}` : null,
        },
    };
});

// Creating a splitLink that will split the incoming requests into two categories:
// 1. GraphQL requests
// 2. Subscription requests
// The split-method takes theww parameters. First of all, it tests whether the request is a GraphQL request or not.
// If it is a GraphQL request, it will use the authLink.concat(httpLink). If it is a Subscription request, it will use the wsLink.
const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
        );
    },
    wsLink,
    authLink.concat(httpLink)
);

// Creating an Apollo-client.
const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: splitLink,
});

// Rendering the website with ReactDOM-object. We also provide the Redux-store and Apollo-client to the app.
ReactDOM.render(
    <Provider store={store}>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </Provider>,
    document.getElementById("root")
);
