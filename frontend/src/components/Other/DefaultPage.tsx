import { Typography } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../..";
import useStyles from "./otherComponentsStyles.module";

// This component renders the default page ("/").

const DefaultPage = () => {
    // Getting the userState.
    const styles = useStyles();
    const userState = useSelector<RootState, string>((state) => state.user.username);
    return (
        <div className={styles.defaultPageDiv}>
            <Typography className={styles.defaultPageTitle}>
                {userState ? "You are logged in." : "You are not logged in."} 
            </Typography>
            <Typography style={{display: "flex", justifyContent: "center", paddingLeft: "20vw", paddingRight: "20vw"}}>
                Welcome to InvShare.
            </Typography>
        </div>
    );
};

export default DefaultPage;
