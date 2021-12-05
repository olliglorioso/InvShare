const userLoggedReducer = (
  state = typeof localStorage.getItem("usersToken") === "string",
  action: { type: string; token: string, username?: string }
): boolean => {
  switch (action.type) {
  case "LOGIN":
    localStorage.setItem("usersToken", action.token);
    localStorage.setItem("loggedUser", action.username as string)
    return true;
  case "LOGOUT":
    localStorage.removeItem("usersToken");
    localStorage.removeItem("loggedUser");
    return false;
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
