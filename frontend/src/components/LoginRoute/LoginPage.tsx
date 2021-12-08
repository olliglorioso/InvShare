import React from "react";
import { Divider, Typography } from "@material-ui/core";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import useStyles from "./loginRouteStyles.module";

// This component takes generally care of the login page.

const LoginPage = (): JSX.Element => {
    const styles = useStyles();
    return (
        <div className={styles.loginPageFirstDiv}>
            <div>
                <div className={styles.loginPageDivs}>
                    <Typography variant="h5">Log in</Typography>
                </div>
                <p></p>
                <div className={styles.loginPageDivs}>
                    <LoginForm />
                </div>
                <p></p>
                <div className={styles.loginPageDivs}>
                    <p></p>
                    <Divider className={styles.loginDivider} />
                </div>
                <div className={styles.loginPageDivs}>
                    <Typography variant="h5">Sign up</Typography>
                </div>
                <p></p>
                <div className={styles.loginPageDivs}>
                    <SignUpForm />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
