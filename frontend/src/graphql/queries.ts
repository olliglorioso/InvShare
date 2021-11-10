import {gql} from "@apollo/client"

const STOCKDETAILS = gql`
  fragment StockDetails on IndividualStock {
    close
    date
    high
    low
    open
    volume
  }
`

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
`

export const STOCK_PURCHASED = gql`
  subscription {
    stockPurchased {
      transactionDate
      transactionStock {
        transactionSymbol
      }
      transactionType
      transactionStockPrice
    }
  }
`

const ADD_USER = gql`
mutation addUser($username: String!, $password: String!) {
    addUser(username: $username, password: $password) {
        usersUsername
    }
  }
`

export const SELL_STOCK = gql`
mutation sellStock($stockName: String!, $amount: Int!, $price: Float!) {
  sellStock(stockName: $stockName, amount: $amount, price: $price) {
    res
  }
}
`


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
`

export const BUY_STOCK = gql`
mutation buyStock($stockName: String!, $amount: Int!) {
  buyStock(stockName: $stockName, amount: $amount) {
    transactionDate
    transactionStock {
      stockSymbol
    }
    transactionStockAmount
    transactionStockPrice
  }
}
`

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
    }
  }
`

export const INDIVIDUAL_STOCK = gql`
  query individualStock($company: String!) {
    individualStock (company: $company) {
      ...StockDetails
    }
  }
  ${STOCKDETAILS}
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export default ADD_USER