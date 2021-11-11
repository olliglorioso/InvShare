import { ReactNotificationOptions, store } from "react-notifications-component"

const notification = (title: string, message: string, type: ReactNotificationOptions["type"]) => {
    store.addNotification({
        title,
        message,
        type,
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
            duration: 5000,
            onScreen: true
        }
    })
}

export default notification
