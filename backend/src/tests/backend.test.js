import mongoose from 'mongoose';
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config()
import { typeDefs } from "../utils/typeDefs";
import resolvers from "../resolvers/resolvers";
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer} from "apollo-server-express";

jest.setTimeout(35000);

import User from "../models/user";

beforeAll(() => {
    // Choosing the endpoint for the database with enviroment variables.
    const MONGODB_URI = process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development"
    ? process.env.MONGODB_TEST_URI || ""
    : process.env.MONGODB_URI || ""

    mongoose.connect(MONGODB_URI, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
        useFindAndModify: false, 
        useCreateIndex: true 
    })
    .then(() => console.log("Connected to the database"))
    .catch(err => console.log(err));

    User.deleteMany({})
    .then(() => console.log("Deleted all users"))
    .catch(err => console.log(err));

});

const schema = makeExecutableSchema({ 
    typeDefs, 
    resolvers,
});

const server = new ApolloServer({
    schema
});

it("AddUser works", async () => {
    const query = `mutation AddUser($username: String!, $password: String!) {addUser(username: $username, password: $password) {usersUsername}}`
    const res = await server.executeOperation({query, variables: {username: "koirakoira", password: "koirakoira"}})
    expect(res.data.addUser.usersUsername).toBe("koirakoira");
})

it("IndividualStock works", async () => {
    const query = `query IndividualStock($company: String!) {individualStock(company: $company) {close}}`
    const res = await server.executeOperation({query, variables: {company: "AAPL"}})
    expect(res.data.individualStock[0].close).toEqual(expect.any(Number));
})

afterAll(() => {
    mongoose.disconnect()
    mongoose.connection.close()  
    server.stop()
}, 100000)