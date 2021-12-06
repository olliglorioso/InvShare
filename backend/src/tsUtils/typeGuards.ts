import { UserInputError } from "apollo-server-express"
import { Mode, UserInformation } from "./types"

// This function includes essential functions, so called "type guards",
// to check if the type of the user input is correct and valid. 

// This function check if a supposed-text is string and turns it into a string.
const isString = (text: unknown): text is string => {
    return typeof text === "string" || text instanceof String
}

// This function check if a supposed-number is number and turns it into a number.
const isNumber = (numb: unknown): numb is number => {
    return numb instanceof Number || typeof numb === "number"
}

// This parses a supposed-Mode to a Mode. If it isn't a Mode, it throws an error.
export const parseMode = (mode: unknown): Mode => {
    if (mode === "hours" || mode === "days") {
        return mode
    } else {
        throw new UserInputError("Invalid mode.", {errorCode: 400})
    }
}

// This parses a supposed-Company to a Company. If it isn't a Company, it throws an error.
export const parseCompany = (company: unknown): string => {
    if (!company || !isString(company)) {
        throw new UserInputError("Incorrect or missing symbol.", {errorCode: 400})
    }
    return company
}

// This parses a supposed-UserInformation to a UserInformation. If it isn't a UserInformation, it throws an error.
export const parseUserInformation = (userInformation: UserInformation): UserInformation => {
    if (!userInformation || !userInformation.username || !userInformation.password || 
        !isString(userInformation.username) || !isString(userInformation.password)) {
        throw new UserInputError("Incorrect type of username or password.", {errorCode: 400})
    }
    if (userInformation.username.length < 4) {
        throw new UserInputError("Username too short.", {errorCode: 400})
    }
    if (userInformation.password.length < 8) {
        throw new UserInputError("Password too short.", {errorCode: 400})
    }
    return userInformation
}

// This parses a supposed-number to a number. If it isn't a number, it throws an error.
export const parseAmount = (amount: unknown): number => {
    if (!amount || !isNumber(amount)) {
        throw new UserInputError("Incorrect type of amount.", {errorCode: 400})
    }
    return amount
}
