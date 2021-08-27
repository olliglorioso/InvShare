import {gql} from "@apollo/client"

const ADD_USER = gql`
mutation addUser($addUserUsername: String!, $addUserPassword: String!) {
    addUser(username: $addUserUsername, password: $addUserPassword) {
        username
        passwordHash
    }
  }
`

export const BUY_STOCK = gql`
mutation buyStock($stockName: String!, $oneStockPrice: Float!, $amount: Int!) {
  buyStock(stockName: $stockName, oneStockPrice: $oneStockPrice, amount: $amount) {
    companyName
    oneStockPrice
    amount
    user
  }
}
`

export const INDIVIDUAL_STOCK = gql`
  query individualStock($company: String!) {
    individualStock (company: $company) {
      close
      date
      high
      low
      open
      volume
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export default ADD_USER