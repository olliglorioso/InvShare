import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import sidebarReducer from "./reducers/sidebarReducer";
import userLoggedReducer from "./reducers/userLoggedReducer";
import buyingStockReducer from "./reducers/buyingStockReducer"
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux"
import {ApolloClient, ApolloProvider, HttpLink, InMemoryCache} from "@apollo/client"
import { setContext } from "@apollo/client/link/context"

const reducer = combineReducers({
    user: userLoggedReducer,
    sidebar: sidebarReducer,
    stock: buyingStockReducer
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
  
const httpLink = new HttpLink({ uri: "https://fso2021practicework.herokuapp.com" })

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink)
})

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <ApolloProvider client={client}>
                <App />
            </ApolloProvider>
        </Provider>
    </React.StrictMode>,
    document.getElementById("root")
);
