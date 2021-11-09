import React from "react"
import {Formik} from "formik"
import { Button, TextField, InputAdornment } from "@material-ui/core";
import { AccountCircle, LockRounded } from "@material-ui/icons";
import { withStyles } from "@material-ui/styles";
import { LOGIN } from "../graphql/queries"
import {useMutation} from "@apollo/client"
import { useHistory } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {logUserIn} from "../reducers/userLoggedReducer"
import * as Yup from "yup"

const CssTextField = withStyles({
    root: {
        "& label.Mui-focused": {
            color: "grey",
        },
        "& .MuiInput-underline:after": {
            borderBottomColor: "black",
        },
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                borderColor: "grey",
            },
            "&:hover fieldset": {
                borderColor: "grey",
            },
            "&.Mui-focused fieldset": {
                borderColor: "black",
            },
        },
    },
})(TextField);

const ValidationSchema = Yup.object().shape({
    username: Yup.string()
        .required("Required field.")
        .min(4, "Must be at least 4 characters."),
    password: Yup.string()
        .required("Required field.")
        .min(8, "Must be at least 8 characters."),
})

const LoginForm = (): JSX.Element => {
    const [login, result] = useMutation(LOGIN)
    const dispatch = useDispatch()

    useEffect(() => {
        try {
            dispatch(logUserIn(result.data.login.value))
            history.push("/")
        } catch (e) {
            console.log("ei ole olemassa käyttäjää")
        }
    }, [result.data])

    console.log(result.error?.graphQLErrors[0])

    const history = useHistory()

    const initialValues = {
        username: "",
        password: "",
    }
    return (
        <Formik
            initialValues={initialValues}
            onSubmit ={async (values: {username: string, password: string}) => {
                await login({variables: {username: values.username, password: values.password}})
            }}
            validationSchema={ValidationSchema}
        >
            {({handleSubmit, values, errors, handleChange, handleBlur, touched}) => (
                <form onSubmit={handleSubmit}>
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
                            )
                        }}
                    />
                    {
                        errors.username && touched.username
                            ? <div style={{color: "red"}}>{errors.password}</div>
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
                            )
                        }}
                    />
                    {
                        errors.password && touched.password
                            ? <div style={{color: "red"}}>{errors.password}</div>
                            : null
                    }
                    <p></p>
                    <Button id="tryToLoginButton" variant="contained" type="submit" style={{background: "black", color: "white", width: 255}}>Log in</Button>
                    <p style={{fontSize: 20, alignContent: "center"}}></p>
                </form>
            )}
            
        </Formik>
        
      
    );
}

export default LoginForm