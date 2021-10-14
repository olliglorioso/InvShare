import { ListSubheader } from "@material-ui/core"
import React from "react"
import AnalysisChart from "./AnalysisChart"
import { AnalysisData, Positions } from "../types"

const Analysis = ({positions, portValue, totalOriginalValue}: {portValue: AnalysisData[], positions: Positions[], totalOriginalValue: number}): JSX.Element => {
    return (
        <div style={{width: "100%", paddingLeft: "5vh", paddingRight: "5vh"}}>
            <ListSubheader>
                <h1 style={{fontWeight: "bold", fontSize: 25, color: "black", textAlign: "center"}}>Analysis</h1>
            </ListSubheader>
            <div>
                <div style={{width: "100%", justifyContent: "center"}}>
                    <AnalysisChart totalOriginalValue={totalOriginalValue} analysisData={portValue} positions={positions} />
                </div>
            </div>
            
        </div>
        

    )
}

export default Analysis