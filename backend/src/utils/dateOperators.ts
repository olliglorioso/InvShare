// This file includes usable functions when it comes to dates and date handling.

export const turnToDate = (date: string): string => {
    const res = new Date(parseInt(date.substring(0,4)), parseInt(date.substring(5,7)) - 1, parseInt(date.substring(8, 10))).toString()
    return res
}

export const setDate = (hours: number): Date => {
    const date = new Date()
    date.setHours(date.getHours() + hours + 3)
    return date
}

export const createDate = (): Date => new Date((new Date()).setHours(new Date().getHours()))