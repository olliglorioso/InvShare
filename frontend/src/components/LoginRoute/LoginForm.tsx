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

// This component is used to render the login form.
// Validation schema for the form.
const ValidationSchema = Yup.object().shape({
    // Username is required and its min length is 4.
    username: Yup.string()
        .required("Required field.")
        .min(4, "Must be at least 4 characters."),
    // Password is required and its min length is 8.
    password: Yup.string()
        .required("Required field.")
        .min(8, "Must be at least 8 characters."),
});

const LoginForm = (): JSX.Element => {
    // Importing styles.
    const styles = useStyles();
    // Login-mutation initialized with useMutation-hook.
    const [login, loginResult] = useMutation(LOGIN);
    // Dispatch-function initialized with useDispatch-hook.
    const dispatch = useDispatch();
    // History-object initialized with useHistory-hook.
    const history = useHistory();
    // Every time loginResult.data changes, we try to dispatch the result to the Redux-store and go to the default page.
    useEffect(() => {
        try {
            dispatch(logUserIn(loginResult.data.login.value, loginResult.data.login.username));
            history.push("/");
        } catch (e) {
            return;
        }
    }, [loginResult.data]);
    // Initial values (they are empty).
    const initialValues = {
        username: "",
        password: "",
    };
    return (
        <Formik
            initialValues={initialValues}
            // When submit, we try to user login-mutation. If it fails, a notification is shown
            // (the login was unsuccessfull.). If it succeeds, we dispatch the result to the Redux-store
            // in the previous useEffect-hook and go to the default page.
            onSubmit={async ({username, password}: { username: string, password: string }) => {
                // Parsing inputted user information.
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
                    // If there is an error and field is touched, ann error text is shown.
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
