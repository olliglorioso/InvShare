import * as React from "react"
import {Table} from "@material-ui/core";
import {TableBody, Button} from "@material-ui/core";
import TableCell from "@material-ui/core/TableCell";
import {TableContainer} from "@material-ui/core";
import {TableHead} from "@material-ui/core";
import {TableRow} from "@material-ui/core";
import {Paper} from "@material-ui/core";
import { AnalysisData, Positions } from "../../../types";
import { StyledTableRow } from "../../Other/helpers";

const AnalysisTable = ({analysisData, positions, getPrediction}: {getPrediction: (comp: string) => void, analysisData: AnalysisData[], positions: Positions[]}) => {

    return (
        <TableContainer component={Paper}>
            <Table aria-label="customized table">
                <TableHead>
                    <TableRow style={{background: "black"}}>
                        <TableCell style={{color: "white"}} align="right">Company</TableCell>
                        <TableCell style={{color: "white"}} align="right">Profit</TableCell>
                        <TableCell style={{color: "white"}} align="right">Average purchase value</TableCell>
                        <TableCell style={{color: "white"}} align="right">Current value</TableCell>
                        <TableCell style={{color: "white"}} align="right">Total amount</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {analysisData.map((company: AnalysisData) => {
                        const correspondingPosition = positions.filter((x: Positions) => {
                            return x.usersStockName.stockSymbol === company.name
                        })[0]
                        let profitPercent = "696969"
                        if (correspondingPosition) {
                            profitPercent = ((-1 + (company.sticks[company.sticks.length - 1].close/(correspondingPosition.usersTotalOriginalPriceValue / correspondingPosition.usersTotalAmount))) * 100).toFixed(2)
                        }
                        if (company.name && correspondingPosition && profitPercent !== "696969") {
                            return (
                                <StyledTableRow key={`${company.name}`}>
                                    <TableCell component="th" scope="row">
                                        <Button style={{background: "black", color: "white"}} onClick={() => getPrediction(company.name)}>{company.name}</Button>
                                    </TableCell>
                                    {
                                        parseFloat(profitPercent) >= 0
                                            ? <TableCell style={{color: "green"}} align="right">{`${parseFloat(profitPercent).toFixed(2)}%`}</TableCell>
                                            : <TableCell align="right" style={{color: "red"}}>{`${parseFloat(profitPercent).toFixed(2)}%`}</TableCell>
                                    }
                                    <TableCell align="right">{(correspondingPosition.usersTotalOriginalPriceValue / correspondingPosition.usersTotalAmount).toFixed(2)}</TableCell>
                                    <TableCell align="right">{(company.sticks[company.sticks.length - 1].close).toFixed(2)}</TableCell>
                                    <TableCell align="right">{correspondingPosition.usersTotalAmount}</TableCell>
                                </StyledTableRow>)
                        } else {
                            return <StyledTableRow key={company.name}></StyledTableRow>
                        }
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default AnalysisTable