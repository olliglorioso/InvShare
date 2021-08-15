import React from "react"
import { useDispatch, useSelector } from "react-redux";
import { ListItem, List, Divider, ListItemText, Box, Drawer } from '@material-ui/core';
import { actionEnableSidebar } from "../reducers/sidebarReducer";
import { RootState } from "..";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
    paper: {
        background: 'black',
        color: 'white'
    }
})

const SideBar = (): JSX.Element => {
    const dispatch = useDispatch()
    const sidebarState = useSelector<RootState, boolean>((state) => state)
    const styles = useStyles()

    return (
        <div>
            <Drawer 
                anchor='left'
                open={sidebarState}
                onClose={() => {dispatch(actionEnableSidebar('DISABLE'))}}
                classes={{paper: styles.paper}}
            >
                <div>
                    <Box textAlign='center' p={2}>
                        Components
                    </Box>
                    <Divider />
                    <List>
                        <ListItem button onClick={() => {return}}>
                            <ListItemText primary={'Container'} />
                        </ListItem>
                        <ListItem button onClick={() => {return}}>
                            <ListItemText primary={'Koira'} />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
        </div>
    )
}

export default SideBar