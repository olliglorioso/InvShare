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
  NotificationsActive,
  NotificationsNone,
  ShowChart,
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { AnimateKeyframes } from "react-simple-animate";
import { useStylesSidebar } from "../Other/helpers";

const SideBar = (): JSX.Element => {
  const dispatch = useDispatch();
  const sidebarState = useSelector<RootState, boolean>(
    (state): boolean => state.sidebar
  );
  const styles = useStylesSidebar();
  const history = useHistory();
  const purchaseState = useSelector<RootState, boolean>(
    (state): boolean => state.purchase
  );

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
            <ListItem button onClick={() => history.push("/myprofile")}>
              <AccountCircle />
              <ListItemText inset={true} primary={"My profile"} />
            </ListItem>
            <Divider classes={{ root: styles.divider }} />
            <ListItem
              button
              onClick={() => {history.push("/actions")}}
            >
              <NotificationsNone />
              <ListItemText inset={true} primary={"Actions"} />
            </ListItem>
            <Divider classes={{ root: styles.divider }} />
            <ListItem button onClick={() => history.push("/mystocks")}>
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
            <ListItem button onClick={() => history.push("/explore")}>
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
