import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import sidebarReducer from './reducers/sidebarReducer';
import userLoggedReducer from './reducers/userLoggedReducer';
import buyingStockReducer from './reducers/buyingStockReducer'
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux'
import {ApolloClient, ApolloProvider, HttpLink, InMemoryCache} from '@apollo/client'

const reducer = combineReducers({
  user: userLoggedReducer,
  sidebar: sidebarReducer,
  stock: buyingStockReducer
})

const store = createStore(reducer)
export type RootState = ReturnType<typeof store.getState>

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'http://localhost:4000',
  })
})

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
