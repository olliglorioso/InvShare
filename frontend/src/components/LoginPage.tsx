import React from 'react'
import SideBar from './SideBar'
import MenuBar from './AppBar'
import { Grid } from '@material-ui/core'
import LoginForm from './LoginForm'
// import SignUpForm from './SignUpForm'

const LoginPage = (): JSX.Element => {
    return (
        <div>
            <div>
                <SideBar />
                <MenuBar />
            </div>
            <div>
                <Grid
                    container
                    spacing={0}
                    direction="row"
                    justifyContent="center"
                    style={{minHeight: '100vh'}}
                >
                    <Grid container item xs={5} alignItems="center" justifyContent="center">
                        <LoginForm />
                    </Grid>
                    {/* <Grid container item xs={5} justifyContent="center" alignItems="center">
                        <SignUpForm />
                    </Grid> */}
                </Grid>
                
                <Grid
                    container
                    spacing={0}
                    direction="column"
                    style={{minHeight: '100vh'}}
                >
                    
                </Grid>
            </div>
            
        </div>
        
        
    )
}

export default LoginPage