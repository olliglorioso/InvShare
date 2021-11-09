import React from "react"
import {useFormik} from "formik"
import { Button, TextField, InputAdornment } from "@material-ui/core";
import { AccountCircle, LockRounded} from "@material-ui/icons";
import { withStyles } from "@material-ui/styles";
import { useHistory } from "react-router-dom";
import ADD_USER from "../graphql/queries";
import { useMutation} from "@apollo/client";

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

const SignUpForm = (): JSX.Element => {
    const history = useHistory()
    const [addUser, ...res] = useMutation(ADD_USER)

    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
            password_again: ""
        },
        onSubmit: values => {
            addUser({variables: {username: values.username, password: values.password}})
            console.log(res)
        },
    });
    return (
        <form onSubmit={formik.handleSubmit}>
            <CssTextField
                id="username"
                type="username"
                variant="outlined"
                label="Username"
                onChange={formik.handleChange}
                value={formik.values.username}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <AccountCircle />
                        </InputAdornment>
                    )
                }}
            />
            <p></p>
            <CssTextField
                id="password"
                type="password"
                variant="outlined"
                label="Password"
                onChange={formik.handleChange}
                value={formik.values.password}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <LockRounded />
                        </InputAdornment>
                    )
                }}
            />
            <p></p>
            <CssTextField
                id="password_again"
                type="password"
                variant="outlined"
                label="Password again"
                onChange={formik.handleChange}
                value={formik.values.password_again}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <LockRounded />
                        </InputAdornment>
                    )
                }}
            />
            <p></p>
            <Button variant="contained" type="submit" style={{background: "black", color: "white", width: 255}}>Sign up</Button>
            <p style={{fontSize: 20, alignContent: "center"}}></p>
        </form>
      
    );
}

export default SignUpForm