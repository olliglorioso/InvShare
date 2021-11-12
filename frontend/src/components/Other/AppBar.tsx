import React from "react";
import MenuIcon from "@material-ui/icons/Menu";
import useStyles from "../../styles/styles";
import { actionEnableSidebar } from "../../reducers/sidebarReducer";
import {IconButton, AppBar, Toolbar, Typography, Button} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { RootState } from "../..";
import { useApolloClient } from "@apollo/client";
import { logUserOut } from "../../reducers/userLoggedReducer";

const MenuBar = (): JSX.Element => {
    const styles = useStyles()
    const dispatch = useDispatch()
    const location = useLocation()
    const userState = useSelector<RootState, boolean>((state) => state.user)
    const client = useApolloClient()
    const history = useHistory()
    const logOut = () => {
        try {
            history.push("/")
            dispatch(logUserOut())
            localStorage.clear()
            client.resetStore()
        } catch (e) {
            console.log(e)
        }
        
    }

    return (
        <div>
            <AppBar style={{background: "black"}}>
                <Toolbar>
                    <div>
                        {userState 
                            ? <IconButton id="sideBarButton" onClick={() => dispatch(actionEnableSidebar("ENABLE"))} edge="start" className={styles.menuButton} color="inherit" aria-label="menu">
                                <MenuIcon />
                            </IconButton>
                            : <div></div>
                        }
                    </div>
                    <Typography className={styles.appBarTitle} variant="h6" >
                        <Button><Link to="/" style={{color: "white", textDecoration: "none", fontSize: 20}}>InvShare</Link></Button>
                    </Typography>
                    {location.pathname === "/login"
                        ? <div></div>
                        : userState
                            ? <div></div>
                            : <Button id="loginButton" color='inherit'><Link to="/login" style={{color: "white", textDecoration: "none"}}>Log in</Link></Button>
                    }  
                    {userState
                        ? <Button onClick={() => logOut()} style={{color: "white"}}>Log out</Button>
                        : <div></div>
                    }  
                    
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default MenuBar;