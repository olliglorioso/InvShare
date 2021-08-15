import React from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import useStyles from '../styles/styles';
import { actionEnableSidebar } from '../reducers/sidebarReducer';
import {IconButton, AppBar, Toolbar, Typography, Button} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';


const MenuBar = ({disableLoginButton}: {disableLoginButton: string}): JSX.Element => {
    const styles = useStyles()
    const dispatch = useDispatch()

    return (
        <div>
            <AppBar style={{background: 'black'}}>
                <Toolbar>
                <IconButton onClick={() => dispatch(actionEnableSidebar('ENABLE'))} edge="start" className={styles.menuButton} color="inherit" aria-label="menu">
                    <MenuIcon />
                </IconButton>
                <Typography className={styles.appBarTitle} variant="h6" >
                    InvShare
                </Typography>
                {disableLoginButton === 'no'
                    ? <Button color='inherit'><Link to="/login" style={{color: 'white', textDecoration: 'none'}}>Login</Link></Button>
                    : <div></div>
                }
                    
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default MenuBar;