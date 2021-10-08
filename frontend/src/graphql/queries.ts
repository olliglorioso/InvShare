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

const ADD_USER = gql`
mutation addUser($addUserUsername: String!, $addUserPassword: String!) {
    addUser(username: $addUserUsername, password: $addUserPassword) {
        username
        passwordHash
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