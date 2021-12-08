import notification from "../utils/notification";
import { UserInformation } from "./types";
// This function includes essential functions, so called "type guards",
// to check if the type of the user input is correct and valid. 

// This function check if a supposed-text is string and turns it into a string.
export const isString = (text: unknown): text is string => {
    return typeof text === "string" || text instanceof String;
};

// This function check if a supposed-number is number and turns it into a number.
export const isNumber = (numb: unknown): numb is number => {
    return numb instanceof Number || typeof numb === "number";
};

// Parses UserInformation (username and password).
export const parseUserInformation = (userInformation: UserInformation): UserInformation => {
    if (!userInformation || !userInformation.username || !userInformation.password || 
        !isString(userInformation.username) || !isString(userInformation.password)) {
        notification("Error.", "Incorrect type of username or password", "danger");
        throw new Error("Incorrect type of username or password.");
    }
    if (userInformation.username.length < 4) {
        notification("Error.", "Username must be at least 4 characters long.", "danger");
        throw new Error("Username too short.");
    }
    if (userInformation.password.length < 8) {
        notification("Error.", "Password must be at most 8 characters long.", "danger");
        throw new Error("Password too short.");
    }
    return userInformation;
};

// Parse username.
export const parseUsername = (username: unknown): string => {
    if (!isString(username)) {
        notification("Error.", "Username must be a string.", "danger");
        throw new Error("Username must be a string.");
    }
    return username;
};

// Parse amount.
export const parseAmount = (amount: unknown): string => {
    if (isNumber(amount)) {
        return amount.toString();
    } else if (isString(amount)) {
        return amount;
    }
    notification("Error.", "Amount is neither a number nor a string.", "danger");
    throw new Error("Amount is neither a number nor a string.");
};

// Parse company/symbol/stock.
export const parseCompany = (company: unknown): string => {
    if (isString(company)) {
        return company;
    }
    notification("Error.", "Company is not a string.", "danger");
    throw new Error("Company is not a string.");
};

// Parse price.
export const parsePrice = (price: unknown): number => {
    if (isNumber(price)) {
        return price;
    }
    if (isString(price)) {
        return parseFloat(price);
    }
    notification("Error.", "Price is neither a number nor a string.", "danger");
    throw new Error("Could not parse price");
};