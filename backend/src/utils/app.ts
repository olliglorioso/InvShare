// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config()
import cors from "cors"
import history from "connect-history-api-fallback"
import express from "express"
import startDatabase from "./database"


startDatabase();

const app = express()
app.use(cors())
app.get("/healthcheck", (_request, response) => {
    response.send("Up.");
});
app.use(history())
app.use(express.static("build"))

module.exports = app;

export default app;