import React from 'react'
import SideBar from './SideBar'
import MenuBar from './AppBar'
import { Grid } from '@material-ui/core'
import LoginForm from './LoginForm'

const LoginPage = (): JSX.Element => {
    return (
        <div>
            <div>
                <SideBar />
                <MenuBar disableLoginButton={'yes'}/>
            </div>
            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justifyContent="center"
                style={{minHeight: '100vh'}}
            >
                <Grid item xs={5}>
                    <LoginForm />
                </Grid>
            </Grid>
        </div>
        
        
    )
}

export default LoginPage