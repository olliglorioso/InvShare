import React from "react"
import { Divider, Typography} from "@material-ui/core"
import LoginForm from "../LoginForm"
import SignUpForm from "../SignUpForm/"
import styles from "./loginpage.module.css"

const LoginPage = (): JSX.Element => {
    const {loginPage1Div, loginPage2Divs} = styles
    return (
        <div className={loginPage1Div}>
            <div>
                <div className={loginPage2Divs}>
                    <Typography variant="h5">Log in</Typography>
                </div>
                <p></p>
                <div className={loginPage2Divs}>
                    <LoginForm />
                </div>
                <p></p>
                <div className={loginPage2Divs}>
                    <p></p>
                    <Divider/>
                </div>
                <div className={loginPage2Divs}>
                    <Typography variant="h5">Sign up</Typography>
                </div>
                <p></p>
                <div className={loginPage2Divs}>
                    <SignUpForm />
                </div>
            </div>
        </div>
    )
}

export default LoginPage