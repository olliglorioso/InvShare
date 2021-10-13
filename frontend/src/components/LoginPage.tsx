import React from "react"
import SideBar from "./SideBar"
import MenuBar from "./AppBar"
import { Divider, Typography} from "@material-ui/core"
import LoginForm from "./LoginForm"
import SignUpForm from "./SignUpForm"
// import SignUpForm from './SignUpForm'

const LoginPage = (): JSX.Element => {
    return (
        <div style={{
            background: "white",
            paddingBottom: "60vh",
            paddingTop: "10vh",
            margin: 10,
            display: "flex",
            flexDirection: "column",
        }}>
            <div>
                <SideBar />
                <MenuBar />
            </div>
            <div >
                <div style={{display: "flex", justifyContent: "center"}}>
                    <Typography variant="h5">Log in</Typography>
                </div>
                <p></p>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <LoginForm />
                </div>
                <p></p>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <p></p>
                    <Divider style={{width: "90%", color: "grey", height: 2}}/>
                </div>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <Typography variant="h5">Sign up</Typography>
                </div>
                <p></p>
                <div style={{display: "flex", justifyContent: "center"}}>
                    <SignUpForm />
                </div>
            </div>
        </div>
    )
}

export default LoginPage