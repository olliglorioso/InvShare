import {gql} from '@apollo/client'

const ADD_USER = gql`
mutation addUser($addUserUsername: String!, $addUserPassword: String!) {
    addUser(username: $addUserUsername, password: $addUserPassword) {
        username
        passwordHash
    }
  }
`

export default ADD_USER