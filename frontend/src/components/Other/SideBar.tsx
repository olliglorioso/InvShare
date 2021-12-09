import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    ListItem,
    List,
    Divider,
    ListItemText,
    Drawer,
} from "@material-ui/core";
import { actionEnableSidebar } from "../../reducers/sidebarReducer";
import { RootState } from "../..";
import {
    AccountCircle,
    Explore,
    NotificationsNone,
    ShowChart,
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { AnimateKeyframes } from "react-simple-animate";
import useStyles from "./otherComponentsStyles.module";

// This component is responsible for rendering the sidebar.

const SideBar = (): JSX.Element => {
    // Initiating dispath with useDispatch-hook.
    const dispatch = useDispatch();
    // Getting the sidebar's state from the Redux-store.
    const sidebarState = useSelector<RootState, boolean>(
        (state): boolean => state.sidebar
    );
    // Importing styles 
    const styles = useStyles();
    // History is for pushing the user to another page.
    const history = useHistory();
    // Getting the purchase state (if the user has no stocks in their portfolio, an animation is displayed in the sidebar as well).
    const purchaseState = useSelector<RootState, boolean>(
        (state): boolean => state.purchase
    );
    // Rendering the side bar.
    return (
        <div>
            <Drawer
                anchor="left"
                open={sidebarState}
                onClose={() => {
                    dispatch(actionEnableSidebar("DISABLE"));
                }}
                classes={{ paper: styles.paper }}
            >
                <div>
                    <List>
                        <ListItem id="toMyProfile" button onClick={() => history.push("/myprofile")}>
                            <AccountCircle />
                            <ListItemText inset={true} primary={"My profile"} />
                        </ListItem>
                        <Divider classes={{ root: styles.divider }} />
                        <ListItem
                            button
                            onClick={() => {history.push("/actions");}}
                        >
                            <NotificationsNone />
                            <ListItemText inset={true} primary={"Actions"} />
                        </ListItem>
                        <Divider classes={{ root: styles.divider }} />
                        <ListItem id="toBuyStocks" button onClick={() => history.push("/buystocks")}>
                            {!purchaseState ? (
                                <>
                                    <AnimateKeyframes
                                        play
                                        iterationCount="infinite"
                                        keyframes={["opacity: 0", "opacity: 1"]}
                                        duration={3}
                                    >
                                        <ShowChart style={{ paddingTop: 3 }} />
                                    </AnimateKeyframes>
                                    <AnimateKeyframes
                                        play
                                        iterationCount="infinite"
                                        keyframes={["opacity: 0", "opacity: 1"]}
                                        duration={3}
                                    >
                                        <ListItemText inset primary={"Buy stocks"} />
                                    </AnimateKeyframes>
                                </>
                            ) : (
                                <>
                                    <ShowChart style={{ paddingTop: 3 }} />
                                    <ListItemText inset primary={"Buy stocks"} />
                                </>
                            )}
                        </ListItem>
                        <Divider classes={{ root: styles.divider }} />
                        <ListItem id="toExplore" button onClick={() => history.push("/explore")}>
                            <Explore />
                            <ListItemText inset={true} primary={"Explore"} />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
        </div>
    );
};

export default SideBar;
