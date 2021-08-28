import React from "react"
import { useDispatch, useSelector } from "react-redux";
import { ListItem, List, Divider, ListItemText, Drawer } from "@material-ui/core";
import { actionEnableSidebar } from "../reducers/sidebarReducer";
import { RootState } from "..";
import { makeStyles } from "@material-ui/core";
import { AccountCircle, Settings, ShowChart } from "@material-ui/icons";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles({
    paper: {
        background: "black",
        color: "white"
    },
    divider: {
        background: "white"
    }
})

const SideBar = (): JSX.Element => {
    const dispatch = useDispatch()
    const sidebarState = useSelector<RootState, boolean>((state) => state.sidebar)
    const styles = useStyles()
    const history = useHistory()

    return (
        <div>
            <Drawer 
                anchor='left'
                open={sidebarState}
                onClose={() => {dispatch(actionEnableSidebar("DISABLE"))}}
                classes={{paper: styles.paper}}
            >
                <div>
                    
                    <List>
                        <ListItem button onClick={() => {return}}>
                            <AccountCircle /><ListItemText inset={true} primary={"My profile"} />
                        </ListItem>
                        <Divider classes={{root: styles.divider}} />
                        <ListItem button onClick={() => {return}}>
                            <Settings/><ListItemText inset={true} primary={"Settings"} />
                        </ListItem>
                        <Divider classes={{root: styles.divider}} />
                        <ListItem button onClick={() => history.push("/mystocks")}>
                            <ShowChart /><ListItemText inset={true} primary={"Buy stocks"} />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
        </div>
    )
}

export default SideBar