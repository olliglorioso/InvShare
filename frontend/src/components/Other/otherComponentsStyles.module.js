import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    invShareLink: {
        color: "white", 
        textDecoration: "none", 
        fontSize: 20
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    appBarTitle: {
        flexGrow: 1,
        textAlign: "center",
    },
    loginLink: {
        color: "white", 
        textDecoration: "none"
    },
    defaultPageTitle: {
        display: "flex", 
        justifyContent: "center", 
        fontSize: 30, 
        fontWeight: "bold", 
        paddingBottom: 10
    },
    defaultPageDiv: {
        background: "white",
        paddingBottom: "60vh",
        paddingTop: "15vh",
        margin: 5,
        display: "flex",
        flexDirection: "column",
    },
    paper: {
        background: "black",
        color: "white",
    },
    divider: {
        background: "white",
        height: 3,
    },
}));

export default useStyles;