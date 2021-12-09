import React from "react";
import { Formik } from "formik";
import { Button, InputAdornment } from "@material-ui/core";
import { AccountCircle, LockRounded } from "@material-ui/icons";
import ADD_USER from "../../graphql/queries";
import { useMutation } from "@apollo/client";
import { CssTextField } from "../../utils/helpers";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import * as Yup from "yup";
import notification from "../../utils/notification";
import useStyles from "./loginRouteStyles.module";

// This component takes care of the sign up form.

// Validation schema for it.
const ValidationSchema = Yup.object().shape({
    // Username required and length between 4 and 15 chars.
    username: Yup.string()
        .min(4, "Username must be at least 4 characters.")
        .max(15, "Username must be 15 characters or less.")
        .required("Username is required."),
    // Password required and length between 8 and 15 chars.
    password: Yup.string()
        .min(8, "Password must be at least 8 characters.")
        .max(15, "Password must be 15 characters or less.")
        .required("Password is required."),
    // Password and password_again must match.
    password_again: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match.")
        .required("Password confirmation is required."),
});

const SignUpForm = (): JSX.Element => {
    // Importing styles.
    const styles = useStyles();
    // Mutation for adding a user.
    const [addUser] = useMutation(ADD_USER);
    // Rendering the form.
    return (
        <Formik
            initialValues={{
                username: "",
                password: "",
                password_again: "",
            }}
            validationSchema={ValidationSchema}
            onSubmit={(values) => {
                // After submit there is a confirmation popup.
                confirmAlert({
                    title: "Confirmation",
                    message: `Create an account with the name ${values.username}?`,
                    buttons: [
                        {
                            label: "Yes",
                            onClick: async () => {
                                // On "Yes" the user is added to the database or 
                                // an error message is shown if error.
                                try {
                                    await addUser({
                                        variables: {
                                            username: values.username,
                                            password: values.password,
                                        },
                                    });
                                    notification(
                                        "Success.",
                                        `You created an account with the name ${values.username}.`,
                                        "success"
                                    );
                                } catch (e: unknown) {
                                    notification(
                                        "Error.",
                                        (e as Error).message || "Something went wrong.",
                                        "danger"
                                    );
                                    // If words password or username are in the error message,
                                    // they will be set as empty strings again to speed up the sign up process.
                                    if ((e as Error).message.includes("password")) {
                                        values.password = "";
                                    } else if ((e as Error).message.includes("username")) {
                                        values.username = "";
                                    }
                                }
                            },
                        },
                        {
                            label: "No",
                            onClick: () => {
                                // On "No" => notification.
                                notification(
                                    "Canceled",
                                    "You didn't create a new account.",
                                    "info"
                                );
                            },
                        },
                    ],
                });
            }}
        >
            {({
                values,
                handleChange,
                handleSubmit,
                errors,
                touched,
                handleBlur,
            }): JSX.Element => (
                <form onSubmit={handleSubmit}>
                    <CssTextField
                        id="usernameSignUp"
                        label="Username"
                        name="username"
                        type="text"
                        variant="outlined"
                        onChange={handleChange}
                        value={values.username}
                        onBlur={handleBlur}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AccountCircle />
                                </InputAdornment>
                            ),
                        }}
                    />
                    {errors.username && touched.username 
                    // An error text will be shown if the username is invalid and touched.
                        ? 
                        (
                            <div className={styles.errorColor}>{errors.username}</div>
                        ) 
                        : null}
                    <p></p>
                    <CssTextField
                        id="passwordSignUp"
                        label="Password"
                        name="password"
                        type="password"
                        variant="outlined"
                        onChange={handleChange}
                        value={values.password}
                        onBlur={handleBlur}
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
                    <CssTextField
                        id="password_again"
                        label="Password again"
                        name="password_again"
                        type="password"
                        variant="outlined"
                        onChange={handleChange}
                        value={values.password_again}
                        onBlur={handleBlur}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockRounded />
                                </InputAdornment>
                            ),
                        }}
                    />
                    {errors.password_again && touched.password_again
                        ? <div className={styles.errorColor}>{errors.password_again}</div>
                        : null
                    }
                    <p></p>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={styles.loginButton}
                        id="signUpButton"
                    >
                        Sign up
                    </Button>
                </form>
            )}
        </Formik>
    );
};

export default SignUpForm;
