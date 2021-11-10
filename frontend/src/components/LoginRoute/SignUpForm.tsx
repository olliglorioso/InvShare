import React from "react"
import {Formik} from "formik"
import { Button, InputAdornment } from "@material-ui/core";
import { AccountCircle, LockRounded} from "@material-ui/icons";
import ADD_USER from "../../graphql/queries";
import { useMutation} from "@apollo/client";
import { CssTextField } from "../Other/helpers";
import { store } from "react-notifications-component"
import "react-notifications-component/dist/theme.css"
import { confirmAlert } from "react-confirm-alert"
import "react-confirm-alert/src/react-confirm-alert.css"
import * as Yup from "yup"

const ValidationSchema = Yup.object().shape({
    username: Yup.string()
        .min(4, "Username must be at least 4 characters.")
        .max(15, "Username must be 15 characters or less.")
        .required("Username is required."),
    password: Yup.string()
        .min(8, "Password must be at least 8 characters.")
        .max(15, "Password must be 15 characters or less.")
        .required("Password is required."),
    password_again: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match.")
        .required("Password confirmation is required.")
})

const SignUpForm = (): JSX.Element => {
    const [addUser] = useMutation(ADD_USER)
    return (
        <Formik
            initialValues={{
                username: "",
                password: "",
                password_again: ""
            }}
            validationSchema={ValidationSchema}
            onSubmit={values => {
                confirmAlert({
                    title: "Confirmation",
                    message: `Create an account with the name ${values.username}?`,
                    buttons: [
                        {
                            label: "Yes",
                            onClick: async () => {
                                try {
                                    await addUser({variables: {username: values.username, password: values.password}})
                                    store.addNotification({
                                        title: "Success",
                                        message: `You created an account with the name ${values.username}.`,
                                        type: "success",
                                        insert: "top",
                                        container: "top-right",
                                        animationIn: ["animate__animated", "animate__fadeIn"],
                                        animationOut: ["animate__animated", "animate__fadeOut"],
                                        dismiss: {
                                            duration: 5000,
                                            onScreen: true
                                        }
                                    })
                                } catch (e: unknown) {
                                    store.addNotification({
                                        title: "Error",
                                        message: (e as Error).message || "Something went wrong.",
                                        type: "danger",
                                        insert: "top",
                                        container: "top-right",
                                        animationIn: ["animated", "fadeIn"],
                                        animationOut: ["animated", "fadeOut"],
                                        dismiss: {
                                            duration: 5000,
                                            onScreen: true
                                        }
                                    })
                                    if ((e as Error).message.includes("password")) {
                                        values.password = ""
                                    } else if ((e as Error).message.includes("username")) {
                                        values.username = ""
                                    }
                                }
                            }
                        },
                        {
                            label: "No",
                            onClick: () => {
                                store.addNotification({
                                    title: "Canceled",
                                    message: "You didn't create a new account.",
                                    type: "danger",
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
                        }
                    ]
                });
            }}
        >
            {({ values, handleChange, handleSubmit, errors, touched, handleBlur }) => (
                <form onSubmit={handleSubmit}>
                    <CssTextField
                        id="username2"
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
                        ? <div style={{color: "red"}}>{errors.username}</div>
                        : null
                    }
                    <p></p>
                    <CssTextField
                        id="password2"
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
                        ? <div style={{color: "red"}}>{errors.password}</div>
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
                        ? <div style={{color: "red"}}>{errors.password_again}</div>
                        : null
                    }
                    <p></p>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        style={{background: "black", color: "white", width: 255}}
                    >
                        Sign up
                    </Button>
                </form>
            )}
        </Formik>
    )
}

export default SignUpForm