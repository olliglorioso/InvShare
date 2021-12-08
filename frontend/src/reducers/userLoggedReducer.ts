// UserLoggedReducer and its action creators. 
const userLoggedReducer = (
    state = {username: (localStorage.getItem("loggedUser") ? localStorage.getItem("loggedUser") as string : "")},
    action: { type: string; token: string, username?: string }
): {username: string} => {
    switch (action.type) {
    case "LOGIN":
        localStorage.setItem("usersToken", action.token);
        localStorage.setItem("loggedUser", action.username as string);
        return {username: action.username as string};
    case "LOGOUT":
        localStorage.removeItem("usersToken");
        localStorage.removeItem("loggedUser");
        return {username: ""};
    default:
        return state;
    }
};

export const logUserIn = (token: string, username: string): { type: string; token: string, username: string } => {
    return {
        type: "LOGIN",
        token,
        username
    };
};

export const logUserOut = (): { type: string } => {
    return {
        type: "LOGOUT",
    };
};

export default userLoggedReducer;
