import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
    errorColor: {
        color: "red",
    },
    loginButton: {
        background: "black", color: "white", width: 255
    },
    loginPageFirstDiv: {
        background: "white",
        paddingBottom: "60vh",
        paddingTop: "15vh",
        margin: "5",
        display: "flex",
        flexDirection: "column",
    },
    loginPageDivs: { display: "flex", justifyContent: "center" },
    loginDivider: { width: "90%", color: "grey", height: 2 }
});

export default useStyles;