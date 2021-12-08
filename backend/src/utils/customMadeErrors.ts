import { ApolloError } from "apollo-server-errors";

export class InvalidApiResponseError extends ApolloError {
  constructor(message: string) {
    super(message, "INVALID_API_RESPONSE");

    Object.defineProperty(this, "name", { value: "InvalidApiResponseError" });
  }
}