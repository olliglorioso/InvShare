import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
    noActionsTypography: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: "50vh"
    },
    noActionsDiv: {
        background: "white",
        paddingBottom: "60vh",
        paddingTop: "15vh",
        margin: 5
    },
    loadingAnimation: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
    },
    transactionListDiv: {
        background: "white",
        paddingBottom: "60vh",
        paddingTop: "15vh",
        margin: 5
    }
});

export default useStyles;