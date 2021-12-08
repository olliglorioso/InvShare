import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
    loadingAnimationDiv: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
    },
    specificExploreFirstDiv: {
        background: "white",
        paddingBottom: "60vh",
        paddingTop: "10vh",
        margin: 5,
        display: "flex",
        flexDirection: "column",
    },
    specificExploreTypography: {
        fontSize: 15, 
        flex: 1, 
        textAlign: "center" 
    },
    cardTitleDiv: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
    },
    cardTypography: {flex: 1, fontSize: 20},
    followAmountsDiv: {flex: 1, paddingTop: 15},
    cardContentDiv: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
    },
    cardContentTypography: {
        fontWeigt: "bold",
        fontSize: 30,
        textAlign: "center",
    },
    transactionListDiv: {
        fontWeight: "bold",
        fontSize: 30,
        textAlign: "center",
    },
    followButton: {
        background: "black",
        color: "white"
    },
    autoComplete: {
        width: "60vw", 
        paddingRight: "1vw", 
        justifyContent: "center", 
        alignItems: "center", 
        display: "flex"
    },
    searchField: {
        border: "2px solid black", 
        borderRadius: 7, 
        padding: 20
    },
    exploreTitle: {
        fontSize: 30,
        paddingBottom: 10
    },
    explorePageFirstDiv: {
        backgroundColor: "white",
        textAlign: "center",
        margin: 5,
    },
    explorePageSecondDiv: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
    }
});

export default useStyles;
