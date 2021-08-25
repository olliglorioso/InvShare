import React from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import useStyles from '../styles/styles';
import { actionEnableSidebar } from '../reducers/sidebarReducer';
import {IconButton, AppBar, Toolbar, Typography, Button} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { RootState } from '..';

const MenuBar = (): JSX.Element => {
    const styles = useStyles()
    const dispatch = useDispatch()
    const location = useLocation()
    const userState = useSelector<RootState, boolean>((state) => state.user)

    return (
        <div>
            <AppBar style={{background: 'black'}}>
                <Toolbar>
                <IconButton onClick={() => dispatch(actionEnableSidebar('ENABLE'))} edge="start" className={styles.menuButton} color="inherit" aria-label="menu">
                    <MenuIcon />
                </IconButton>
                <Typography className={styles.appBarTitle} variant="h6" >
                    <Button><Link to="/" style={{color: 'white', textDecoration: 'none', fontSize: 20}}>InvShare</Link></Button>
                </Typography>
                {location.pathname === '/login'
                    ? <div></div>
                    : userState
                        ? <div></div>
                        : <Button color='inherit'><Link to="/login" style={{color: 'white', textDecoration: 'none'}}>Log in</Link></Button>
                }    
                </Toolbar>
            </AppBar>
        </div>
    )
}

export default MenuBar;