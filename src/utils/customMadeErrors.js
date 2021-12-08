"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidApiResponseError = void 0;
const apollo_server_errors_1 = require("apollo-server-errors");
class InvalidApiResponseError extends apollo_server_errors_1.ApolloError {
    constructor(message) {
        super(message, "INVALID_API_RESPONSE");
        Object.defineProperty(this, "name", { value: "InvalidApiResponseError" });
    }
}
exports.InvalidApiResponseError = InvalidApiResponseError;
