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

// This component is the AppBar of the application, on top of the page all the time.

const AppBar = ({stockSubscription}: {stockSubscription: {trans: TransactionType, me: string}}): JSX.Element => {
    // Importing styles.
    const styles = useStyles();
    // Initializing dispatch-function with useDispatch-hook.
    const dispatch = useDispatch();
    // Getting the current location (url).
    const location = useLocation();
    // Getting the state of the user (logged in or not).
    const userState = useSelector<RootState, string>((state) => state.user.username);
    // State of notification. This helps us to recognize if notification (especially information-type notification) is already shown.
    const notificationState = useSelector<RootState, {notification: string}>((state) => state.notification);
    // Apollo client.
    const client = useApolloClient();
    // History to push the user to the correct page.
    const history = useHistory();

    // Every time the current user or a user he/she follows buys/sells a stock, the 
    // following useEffect will be executed.
    useEffect(() => {
        // A few conditions: stockSubscription can't be undefined, stockSubscription.me (A.K.A the user that bought/sold a stock) can't be same user
        // as the current user (we don't want to show two notifications), and the stockSubscription's notification can't be already shown.
        if (stockSubscription.trans && stockSubscription.me !== userState && notificationState.notification !== stockSubscription.trans.transactionDate) {
            // Dispatching the notification's "id", also it's date because it is always different than before, to the Redux store.
            dispatch(newNotification(stockSubscription.trans.transactionDate));
            // Storing the string, which will be displayer, to a variabel.
            const str = `${stockSubscription.me} purchased ${stockSubscription.trans.transactionStockAmount} x ${stockSubscription.trans.transactionStock.stockSymbol} for ${stockSubscription.trans.transactionStockPrice}`;
            // Different messages based on the transaction type.
            const message = stockSubscription.trans.transactionType === "Buy"
                ? str
                : str.replace("purchased", "sold");
            notification("Notification", message, "info");
      
        }
    }, [stockSubscription]);

    // When the user presses the Log out -button, this function will be executed.
    const logOut = () => {
        try {
            // Clearing localStorage.
            localStorage.clear();
            // Clearing Apollo client.
            client.clearStore();
            // Dispatching the logUserOut action, so that the Redux store will know that the user is logged out.
            // We dispatch buyFirstStock-action, so that we avoid bugs.
            dispatch(logUserOut());
            dispatch(buyFirstStock());
            // Pushing to the default page.
            history.push("/");
        } catch (e) {
            notification("An error occured.", "Error while logging out.", "danger");
        }
    };
    // Rendering App bar.
    return (
        <div>
            <MuiAppBar style={{ background: "black" }}>
                <Toolbar>
                    <div>
                        {userState  // Sidebar-button won't be shown if the user has logged out.
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
