import { ApolloServer, gql } from 'apollo-server';
const mongoose = require('mongoose')
const User = require('./models/user')
const bcrypt = require('bcrypt')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.log('connected to mongodb')
    })
    .catch((error: any) => {
        console.log('error connection to mongodb ', error.message)
    })     
  
const typeDefs = gql`
    type User {
        username: String!
        passwordHash: String!
        id: ID!
    }
    
    type Query {
        allUsers: [User!]!
    }

    type Mutation {
        addUser(
            username: String!
            password: String!
        ): User
    }
`;

const resolvers = {
    Query: {
        allUsers: () => User.find({})
    },
    Mutation: {
        addUser: async (_root: any, args: any) => {
            const saltRounds = 10
            const passwordHash = await bcrypt.hash(args.password, saltRounds)
            const user = new User({
                username: args.username,
                passwordHash
            })

            const savedUser = await user.save()

            console.log(user)
            return savedUser;
        }
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

server.listen().then(({url}) => {
    console.log(`Server ready at ${url}`)
})