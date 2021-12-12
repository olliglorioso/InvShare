// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config()
import cors from "cors"
import history from "connect-history-api-fallback"
import express from "express"
import startDatabase from "./database"

// This file is used to configure the express server and export it to index.ts and tests.

// Start database.
startDatabase();

// Creating the express-server.
const app = express()
// Adding cors-middleware.
app.use(cors())
// Health check route.
app.get("/healthcheck", (_request, response) => {
    response.send("Up.");
});
// Adding the history-api-fallback-middleware.
app.use(history())
// Adding the express.static-middleware.
app.use(express.static("build"))

module.exports = app;

export default app;