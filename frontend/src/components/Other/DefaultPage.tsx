import React from "react"
import { useSelector } from "react-redux"
import { RootState } from "../.."

const DefaultPage = () => {
    const userState = useSelector<RootState, boolean>((state) => state.user)
    return (
        <div style={{
            background: "white",
            paddingBottom: "60vh",
            paddingTop: "15vh",
            margin: 5,
            display: "flex",
            flexDirection: "column",
        }}>
            <h1 >{userState ? "You are logged in " : "You are not logged in :/"} </h1>
        </div>
    )
}

export default DefaultPage