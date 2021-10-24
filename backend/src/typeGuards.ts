import { UserInputError } from "apollo-server-express"

const isString = (text: unknown): text is string => {
    return typeof text === "string" || text instanceof String
}

export const parseCompany = (company: unknown): string => {
    if (!company || !isString(company)) {
        throw new UserInputError("Incorrect or missing symbol.", {errorCode: 400})
    }
    return company
}