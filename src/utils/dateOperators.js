"use strict";
// This file includes usable functions when it comes to dates and date handling.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDate = exports.setDate = exports.turnToDate = void 0;
// This function simply turns a date-string into a date-object.
const turnToDate = (date) => {
    const res = new Date(parseInt(date.substring(0, 4)), parseInt(date.substring(5, 7)) - 1, parseInt(date.substring(8, 10))).toString();
    return res;
};
exports.turnToDate = turnToDate;
// This function gets an amount of hours (+ or -) as a parameter and add
// them from current date creating a new date(-object).
const setDate = (hours) => {
    const date = new Date();
    date.setHours(date.getHours() + hours + 3);
    return date;
};
exports.setDate = setDate;
// This functions creates a modified date-object.
const createDate = () => new Date((new Date()).setHours(new Date().getHours()));
exports.createDate = createDate;
