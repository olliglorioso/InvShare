import React from "react"
import {useFormik} from 'formik'
import { Button, TextField, InputAdornment } from "@material-ui/core";
import { AccountCircle, LockRounded } from "@material-ui/icons";
import { withStyles } from "@material-ui/styles";
import ADD_USER from "../queries";
import {useMutation} from '@apollo/client'
import { useHistory } from "react-router-dom";

const CssTextField = withStyles({
    root: {
      '& label.Mui-focused': {
        color: 'grey',
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: 'black',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'grey',
        },
        '&:hover fieldset': {
          borderColor: 'grey',
        },
        '&.Mui-focused fieldset': {
          borderColor: 'black',
        },
      },
    },
  })(TextField);

const LoginForm = (): JSX.Element => {
  const [addUser, {loading, data}] = useMutation(ADD_USER)
  const history = useHistory()

  const formik = useFormik({
      initialValues: {
        username: '',
        password: '',
      },
      onSubmit: values => {
        alert(JSON.stringify(values, null, 2));
        console.log(values.username, values.password)
        addUser({variables: {addUserUsername: values.username, addUserPassword: values.password}})
        history.push('/')
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
          <Button variant="contained" type="submit" style={{background: 'black', color: 'white', width: 255}}>Log in</Button>
          <p style={{fontSize: 20, alignContent: 'center'}}></p>
      </form>
      
    );
}

export default LoginForm