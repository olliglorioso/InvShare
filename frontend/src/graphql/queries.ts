import { gql } from "@apollo/client";

// This is the file that handles all of the queries' schemas for the frontend.

// First of all, a couple fragments to avoid repetition.
const STOCKDETAILS = gql`
  fragment StockDetails on IndividualStock {
    close
    date
    high
    low
    open
    volume
  }
`;

const TRANSACTIONDETAILS = gql`
  fragment TransactionDetails on Transaction {
    transactionDate
    transactionStock {
      stockSymbol
      stockTotalAmount
    }
    transactionStockAmount
    transactionStockPrice
    transactionType
    _id
  }
`;

export const SEARCH_USER_FINAL = gql`
  query searchUser($username: String!) {
    searchUser(username: $username) {
      usersUsername
      usersFollowers {
        user {
          usersUsername
        }
      }
      usersHoldings {
        usersStock {
          stockTotalAmount
          stockSymbol
        }
        usersTotalAmount
        usersTotalOriginalPriceValue
      }
      usersTransactions {
        ...TransactionDetails
      }
      moneyMade
      followerCount
      followingCount
    }
  }
  ${TRANSACTIONDETAILS}
`;

// Mutations: 
export const FOLLOW = gql`
  mutation follow($username: String!) {
    followUser(username: $username) {
      result
    }
  }
`;

const ADD_USER = gql`
  mutation addUser($username: String!, $password: String!) {
    addUser(username: $username, password: $password) {
      usersUsername
    }
  }
`;

export const SELL_STOCK = gql`
  mutation sellStock($stockName: String!, $amount: Int!, $price: Float!) {
    sellStock(stockName: $stockName, amount: $amount, price: $price) {
      ...TransactionDetails
    }
  }
  ${TRANSACTIONDETAILS}
`;

export const UNFOLLOW = gql`
  mutation unfollowUser($username: String!) {
    unfollowUser(username: $username) {
      result
    }
  }
`;

export const BUY_STOCK = gql`
  mutation buyStock($stockName: String!, $amount: Int!) {
    buyStock(stockName: $stockName, amount: $amount) {
      ...TransactionDetails
    }
  }
  ${TRANSACTIONDETAILS}
`;
export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
      username
    }
  }
`;

// Queries: 
export const SEARCH_USER = gql`
  query searchUser($username: String!) {
    searchUser(username: $username) {
      usersUsername
    }
  }
`;

export const GET_OLD_DATA = gql`
  query stockHistory($symbol: String!) {
    stockHistory(symbol: $symbol) {
      time_series {
        date
        value
      }
      metadata {
        information
        symbol
        lastRefresh
      }
    }
  }
`;

export const GET_ACTIONS = gql`
  query GetActions {
    getActions {
      transaction {
        ...TransactionDetails
      }
      transactionOwner
    }
  }
  ${TRANSACTIONDETAILS}
`;

export const CURRENT_PORTFOLIO_VALUE = gql`
  query cpv($mode: String!) {
    currentPortfolioValue(mode: $mode) {
      wholeValue
      analysisValues {
        name
        sticks {
          ...StockDetails
        }
      }
    }
  }
  ${STOCKDETAILS}
`;

export const ME = gql`
  query {
    me {
      usersUsername
      usersHoldings {
        usersStock {
          stockTotalAmount
          stockSymbol
        }
        usersTotalAmount
        usersTotalOriginalPriceValue
      }
      usersTransactions {
        ...TransactionDetails
      }
      moneyMade
      followerCount
      followingCount
    }
  }
  ${TRANSACTIONDETAILS}
`;

export const INDIVIDUAL_STOCK = gql`
  query individualStock($company: String!) {
    individualStock(company: $company) {
      ...StockDetails
    }
  }
  ${STOCKDETAILS}
`;

// Reset test database:
export const RESET_DATABASE = gql`
  mutation resetDatabase {
    resetDatabase {
      result
    }
  }
`;

// Subscriptions: 
export const STOCKEVENT = gql`
  subscription StockEvent ($username: String) {
    stockEvent (username: $username){
      transaction {
        ...TransactionDetails
      }
      me
    }
  }
  ${TRANSACTIONDETAILS}
`;

export const FOLLOWEVENT = gql`
  subscription followEvent ($username: String){
    followEvent (username: $username) {
      auteur
      object
      followType
      date
    }
  }
`;


export default ADD_USER;
