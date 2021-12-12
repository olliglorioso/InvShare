"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config();
// Choosing the endpoint for the database with enviroment variables.
const MONGODB_URI = process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development"
    ? process.env.MONGODB_TEST_URI || ""
    : process.env.MONGODB_URI || "";
// Connect to the database (function).
const startDatabase = () => {
    mongoose_1.default.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
        .then(() => {
        console.log("Database connection successful!");
    })
        .catch((err) => {
        console.log(err);
    });
};
exports.default = startDatabase;
