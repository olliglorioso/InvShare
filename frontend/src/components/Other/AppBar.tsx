import React, { useEffect } from "react";
import MenuIcon from "@material-ui/icons/Menu";
import { actionEnableSidebar } from "../../reducers/sidebarReducer";
import {
    IconButton,
    AppBar as MuiAppBar,
    Toolbar,
    Typography,
    Button,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { RootState } from "../..";
import { useApolloClient } from "@apollo/client";
import { logUserOut } from "../../reducers/userLoggedReducer";
import { buyFirstStock } from "../../reducers/firstBuyReducer";
import notification from "../../utils/notification";
import { TransactionType } from "../../tsUtils/types";
import { newNotification } from "../../reducers/actionNotificationReducer";
import useStyles from "./otherComponentsStyles.module";


const AppBar = ({stockSubscription}: {stockSubscription: {trans: TransactionType, me: string}}): JSX.Element => {
    const styles = useStyles();
    const dispatch = useDispatch();
    const location = useLocation();
    const userState = useSelector<RootState, string>((state) => state.user.username);
    const notificationState = useSelector<RootState, {notification: string}>((state) => state.notification);
    const client = useApolloClient();
    const history = useHistory();

    useEffect(() => {
        if (stockSubscription.trans && stockSubscription.me !== userState && notificationState.notification !== stockSubscription.trans.transactionDate) {
            dispatch(newNotification(stockSubscription.trans.transactionDate));
            const str = `${stockSubscription.me} purchased ${stockSubscription.trans.transactionStockAmount} x ${stockSubscription.trans.transactionStock.stockSymbol} for ${stockSubscription.trans.transactionStockPrice}`;
            const message = stockSubscription.trans.transactionType === "Buy"
                ? str
                : str.replace("purchased", "sold");
            notification("Notification", message, "info");
      
        }
    }, [stockSubscription]);

    const logOut = () => {
        try {
            localStorage.clear();
            client.clearStore();
            dispatch(logUserOut());
            dispatch(buyFirstStock());
            history.push("/");
        } catch (e) {
            notification("An error occured.", "Error while logging out.", "danger");
        }
    };
    return (
        <div>
            <MuiAppBar style={{ background: "black" }}>
                <Toolbar>
                    <div>
                        {userState  
                            ? <IconButton
                                id="sideBarButton"
                                onClick={() => dispatch(actionEnableSidebar("ENABLE"))}
                                edge="start"
                                className={styles.menuButton}
                                color="inherit"
                                aria-label="menu"
                            >
                                <MenuIcon />
                            </IconButton>
                            : <div></div>}
                    </div>
                    <Typography className={styles.appBarTitle} variant="h6">
                        <Button>
                            <Link
                                to="/"
                                className={styles.invShareLink}
                            >
                                InvShare
                            </Link>
                        </Button>
                    </Typography>
                    {location.pathname === "/login" 
                        ? <div></div>
                        : userState 
                            ? <div></div>
                            : (
                                <Button id="loginButton" color="inherit">
                                    <Link
                                        to="/login"
                                        className={styles.loginLink}
                                    >
                                        Log in
                                    </Link>
                                </Button>)}
                    {userState 
                        ? <Button onClick={() => logOut()} style={{ color: "white" }}>Log out</Button>
                        : <div></div>}
                </Toolbar>
            </MuiAppBar>
        </div>
    );
};

export default AppBar;
