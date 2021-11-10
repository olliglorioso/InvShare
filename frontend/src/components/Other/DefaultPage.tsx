import React from "react"
import { useSelector } from "react-redux"
import { RootState } from "../.."

const DefaultPage = () => {
    const userState = useSelector<RootState, boolean>((state) => state.user)
    console.log(userState)
    return (
        <div style={{
            background: "white",
            paddingBottom: "60vh",
            paddingTop: "15vh",
            margin: 10,
            display: "flex",
            flexDirection: "column",
        }}>
            <h1 style={{}}>Default Page</h1>
        </div>
    )
}

export default DefaultPage