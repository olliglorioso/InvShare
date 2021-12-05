import { gql } from "@apollo/client";

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
    }
    transactionStockAmount
    transactionStockPrice
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
        usersStockName {
          stockTotalAmount
          stockSymbol
        }
        usersTotalAmount
        usersTotalOriginalPriceValue
      }
      usersTransactions {
        transactionDate
        transactionStockAmount
        transactionStockPrice
        transactionType
        transactionStock {
          stockSymbol
          stockTotalAmount
        }
        _id
      }
      moneyMade
      followerCount
      followingCount
    }
  }
`;

export const FOLLOW = gql`
  mutation follow($username: String!) {
    followUser(username: $username) {
      result
    }
  }
`

export const UNFOLLOW = gql`
  mutation unfollowUser($username: String!) {
    unfollowUser(username: $username) {
      result
    }
  }
`

export const SEARCH_USER = gql`
  query searchUser($username: String!) {
    searchUser(username: $username) {
      usersUsername
    }
  }
`;

export const GET_PREDICTION = gql`
  query stockPrediction($symbol: String!) {
    stockPrediction(symbol: $symbol) {
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

export const STOCK_PURCHASED = gql`
  subscription StockPurchased ($username: String) {
    stockPurchased (username: $username){
      transaction {
        ...TransactionDetails
      }
      me
    }
  }
  ${TRANSACTIONDETAILS}
`;

export const FOLLOWEVENT = gql`
  subscription followEvent {
    followEvent {
      auteur
      object
      followType
      date
    }
  }
`

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

export const BUY_STOCK = gql`
  mutation buyStock($stockName: String!, $amount: Int!) {
    buyStock(stockName: $stockName, amount: $amount) {
      ...TransactionDetails
    }
  }
  ${TRANSACTIONDETAILS}
`;

export const ME = gql`
  query {
    me {
      usersUsername
      usersHoldings {
        usersStockName {
          stockTotalAmount
          stockSymbol
        }
        usersTotalAmount
        usersTotalOriginalPriceValue
      }
      usersTransactions {
        transactionDate
        transactionStockAmount
        transactionStockPrice
        transactionType
        transactionStock {
          stockSymbol
          stockTotalAmount
        }
        _id
      }
      moneyMade
      followerCount
      followingCount
    }
  }
`;

export const INDIVIDUAL_STOCK = gql`
  query individualStock($company: String!) {
    individualStock(company: $company) {
      ...StockDetails
    }
  }
  ${STOCKDETAILS}
`;

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
      username
    }
  }
`;

export default ADD_USER;
