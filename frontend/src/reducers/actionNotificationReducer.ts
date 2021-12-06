const actionNotificationReducer = (state = {notification: undefined}, action: {type: string, notification: string}) => {
  switch (action.type) {
  case "SET_NOTIFICATION":
    return {
      notification: action.notification
    };
  default:
    return state;
  }
};

export const newNotification = (notification: string) => {
  return {
    type: "SET_NOTIFICATION",
    notification
  }
}

export default actionNotificationReducer;