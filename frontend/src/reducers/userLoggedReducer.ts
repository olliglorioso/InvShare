const userLoggedReducer = (state = (typeof localStorage.getItem("usersToken") === "string"), action: {type: string, token: string}): boolean => {
    switch (action.type) {
    case "LOGIN":
        localStorage.setItem("usersToken", action.token)
        return true
    case "LOGOUT":
        localStorage.removeItem("usersToken")
        return false
    default:
        return state
    }
}

export const logUserIn = (token: string): {type: string, token: string} => {
    return {
        type: "LOGIN",
        token
    }
}

export const logOut = (): {type: string} => {
    return {
        type: "LOGOUT"
    }
}

export default userLoggedReducer