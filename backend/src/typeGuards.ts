import { UserInputError } from "apollo-server-express"
import { UserInformation } from "./types"

const isString = (text: unknown): text is string => {
    return typeof text === "string" || text instanceof String
}

const isNumber = (numb: unknown): numb is number => {
    return numb instanceof Number || typeof numb === "number"
}

export const parseCompany = (company: unknown): string => {
    if (!company || !isString(company)) {
        throw new UserInputError("Incorrect or missing symbol.", {errorCode: 400})
    }
    return company
}

export const parseUserInformation = (userInformation: any): UserInformation => {
    if (!userInformation || !userInformation.username || !userInformation.password || 
        !isString(userInformation.username) || !isString(userInformation.password)) {
        throw new UserInputError("Incorrect type of username or password.", {errorCode: 400})
    }
    return userInformation
}

export const parseAmount = (amount: unknown): number => {
    if (!amount || !isNumber(amount)) {
        throw new UserInputError("Incorrect type of amount.", {errorCode: 400})
    }
    return amount
}
