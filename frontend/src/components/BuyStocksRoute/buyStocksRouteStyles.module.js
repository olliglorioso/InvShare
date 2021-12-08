import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
    finalInformationTypography: {
        paddingTop: 5,
        paddingBottom: 5,
    },
    animationLastTypography: {
        fontSize: 15,
        paddingTop: 4
    },
    errorColor: {
        color: "red"
    },
    loadingAnimationDiv: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh"
    },
    chartError: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh",
        color: "red"
    },
    stockPageFirstDiv: {
        backgroundColor: "white",
        textAlign: "center",
        paddingTop: "20vh",
        paddingBottom: "20vh",
        margin: 5
    },
    stockPageSecondDiv: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    stockPageAnimationDiv: {
        height: 0,
        paddingBottom: 55,
        paddingRight: "10vw"
    },
    stockPageAnimationTypography: {
        width: 160,
        fontSize: 15
    },
    buyStockFormButton: {
        width: "20vw",
        background: "black",
        color: "white"
    },
    stockPageLastDiv: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "end",
        paddingRIght: "2"
    },
    mainChartWidth: {width: "100%"},
    mainChartDiv: {display: "flex", flexDirection: "row"},
    buyStocksHigherDiv: {
        paddingTop: 40,
        width: "20vw",
        paddingRight: 5
    }
});

export default useStyles;