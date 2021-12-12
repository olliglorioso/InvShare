"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config();
const cors_1 = __importDefault(require("cors"));
const connect_history_api_fallback_1 = __importDefault(require("connect-history-api-fallback"));
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./database"));
// This file is used to configure the express server and export it to index.ts and tests.
// Start database.
database_1.default();
// Creating the express-server.
const app = express_1.default();
// Adding cors-middleware.
app.use(cors_1.default());
// Health check route.
app.get("/healthcheck", (_request, response) => {
    response.send("Up.");
});
// Adding the history-api-fallback-middleware.
app.use(connect_history_api_fallback_1.default());
// Adding the express.static-middleware.
app.use(express_1.default.static("build"));
module.exports = app;
exports.default = app;
