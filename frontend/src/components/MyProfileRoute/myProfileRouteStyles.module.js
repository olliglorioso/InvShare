import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
    chartLoadingAnimation: {
        display: "flex",
        justifyContent: "center",
        paddingTop: "15px",
    },
    tableCellTitles: {
        color: "white"
    },
    oldDataButton: {
        background: "black", 
        color: "white", 
        width: 150 
    },
    analysisTableButton: {
        background: "black", color: "white"
    },
    myProfileLoadingAnimation: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
    },
    myProfileMainDiv: {
        background: "white",
        paddingBottom: "60vh",
        paddingTop: "10vh",
        margin: "5",
        display: "flex",
        flexDirection: "column",
    },
    myProfileCardTitle: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
    },
    myProfileCardInfos: {
        fontSize: 15, 
        flex: 1, 
        textAlign: "center" 
    },
    myProfileCardContentDiv: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    myProfileCardContentTypography: {
        fontWeight: "bold",
        fontSize: 30,
        textAlign: "center",
    }, 
    myProfileCardContentNumberGreen: {
        color: "green",
        fontWeight: "bold",
        fontSize: 30,
        textAlign: "center",
    },
    myProfileCardContentNumberRed: {
        color: "red",
        fontWeight: "bold",
        fontSize: 30,
        textAlign: "center",
    },
    myProfileButton: {
        background: "black", color: "white"
    },
    modeTitles: {
        fontWeight: "bold",
        fontSize: 25,
        color: "black",
        textAlign: "center",
        paddingTop: 10,
        paddingBottom: 10
    },
    myProfileTransationList: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    myProfileAnalysisChartDiv: {
        width: "100%", justifyContent: "center"
    },
    myProfileAnalysisSecondDIv: {
        width: "100%", paddingLeft: "5vh", paddingRight: "5vh"
    },
    oldDataDiv: {
        display: "flex",
        paddingTop: "5vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
    },
    errorColor: {color: "red"},
    transactionListDiv: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    transactionList: {
        display: "flex", 
        flexDirection: "row", 
        flexWrap: "wrap"
    },
    transactionListItem: {
        width: "50%", 
        textAlign: "center"
    },
    black: {color: "black"},
    transactionListCollapsedItem: {
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
    },
    animationSizes: {
        height: "0px",
        width: "0px"
    },
    tutorialMainText: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        paddingLeft: "2vh",
        paddingRight: "2vh",
    },
    tutorialArrow: {
        paddingTop: 60, paddingLeft: 7
    },
    tutorialTypography: {
        width: 200,
        paddingLeft: 7
    }
});

export default useStyles;