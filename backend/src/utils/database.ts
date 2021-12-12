import mongoose from "mongoose";
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config()

// Choosing the endpoint for the database with enviroment variables.
const MONGODB_URI: string = process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development"
? process.env.MONGODB_TEST_URI || ""
: process.env.MONGODB_URI || ""

// Connect to the database (function).
const startDatabase = () => {
    mongoose.connect(MONGODB_URI, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
        useFindAndModify: false, 
        useCreateIndex: true 
    })
    .then(() => {
        console.log("Database connection successful!")
    })
    .catch((err) => {
        console.log(err)
    })
}

export default startDatabase;