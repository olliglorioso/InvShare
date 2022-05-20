import React from "react";
import { Formik } from "formik";
import { Button, InputAdornment } from "@material-ui/core";
import { AccountCircle, LockRounded } from "@material-ui/icons";
import { LOGIN } from "../../graphql/queries";
import { useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logUserIn } from "../../reducers/userLoggedReducer";
import * as Yup from "yup";
import { CssTextField } from "../../utils/helpers";
import notification from "../../utils/notification";
import useStyles from "./loginRouteStyles.module";
import { parseUserInformation } from "../../tsUtils/typeGuards";

const ValidationSchema = Yup.object().shape({
    username: Yup.string()
        .required("Required field.")
        .min(4, "Must be at least 4 characters."),
    password: Yup.string()
        .required("Required field.")
        .min(8, "Must be at least 8 characters."),
});

const LoginForm = (): JSX.Element => {
    const styles = useStyles();
    const [login, loginResult] = useMutation(LOGIN);
    const dispatch = useDispatch();
    const history = useHistory();
    useEffect(() => {
        try {
            dispatch(logUserIn(loginResult.data.login.value, loginResult.data.login.username));
            history.push("/");
        } catch (e) {
            return;
        }
    }, [loginResult.data]);
    const initialValues = {
        username: "",
        password: "",
    };
    return (
        <Formik
            initialValues={initialValues}
            onSubmit={async ({username, password}: { username: string, password: string }) => {
                const parsedUserInfo = parseUserInformation({username, password});
                try {
                    await login({
                        variables: { username: parsedUserInfo.username, password: parsedUserInfo.password },
                    });
                } catch (e: unknown) {
                    notification("Failed.", (e as Error).message, "danger");
                }
            }}
            validationSchema={ValidationSchema}
        >
            {({
                handleSubmit,
                values,
                errors,
                handleChange,
                handleBlur,
                touched,
            }) => (
                <form onSubmit={handleSubmit}>
                    <p></p>
                    <CssTextField
                        id="username"
                        type="username"
                        variant="outlined"
                        label="Username"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.username}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AccountCircle />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {errors.username && touched.username 
                        ? 
                        (
                            <div className={styles.errorColor}>{errors.username}</div>
                        ) 
                        : null
                    }
                    <p></p>
                    <CssTextField
                        id="password"
                        type="password"
                        variant="outlined"
                        label="Password"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.password}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockRounded />
                                </InputAdornment>
                            ),
                        }}
                    />
                    {errors.password && touched.password 
                        ? 
                        (
                            <div className={styles.errorColor}>{errors.password}</div>
                        ) 
                        : null
                    }
                    <p></p>
                    <Button
                        id="tryToLoginButton"
                        variant="contained"
                        type="submit"
                        className={styles.loginButton}
                    >
                        Log in
                    </Button>
                    <p style={{ fontSize: 20 }}></p>
                </form>
            )}
        </Formik>
    );
};

export default LoginForm;
