import * as React from "react"
import {Table} from "@material-ui/core";
import { styled } from "@material-ui/core";
import {TableBody} from "@material-ui/core";
import TableCell from "@material-ui/core/TableCell";
import {TableContainer} from "@material-ui/core";
import {TableHead} from "@material-ui/core";
import {TableRow} from "@material-ui/core";
import {Paper} from "@material-ui/core";



const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td, &:last-child th": {
        border: 0,
    },
}));


const AnalysisTable = ({analysisData, positions}: any) => {
    const tableCellStyles = {color: "white"}
    return (
        <TableContainer component={Paper}>
            <Table aria-label="customized table">
                <TableHead>
                    <TableRow style={{backgroundColor: "black"}}>
                        <TableCell style={tableCellStyles}>Company</TableCell>
                        <TableCell style={tableCellStyles} align="right">Profit</TableCell>
                        <TableCell style={tableCellStyles} align="right">Purchase value</TableCell>
                        <TableCell style={tableCellStyles} align="right">Current value</TableCell>
                        <TableCell style={tableCellStyles} align="right">Last news</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {analysisData.map((company: any) => {
                        const correspondingPosition = positions.filter((x: {__typename: "Holding", usersStockName: {stockSymbol: string, stockTotalAmount: number, __typename: "Stock"}, usersTotalAmount: number, usersTotalOriginalPriceValue: number}) => {
                            return x.usersStockName.stockSymbol === company.name
                        })[0]
                        const profitPercent = ((-1 + (company.sticks[company.sticks.length - 1].close/(correspondingPosition.usersTotalOriginalPriceValue / correspondingPosition.usersTotalAmount))) * 100).toFixed(2)
                        if (company) {
                            return (
                                <StyledTableRow key={company.name}>
                                    <TableCell component="th" scope="row">
                                        {company.name}
                                    </TableCell>
                                    {
                                        parseFloat(profitPercent) >= 0
                                            ? <TableCell style={{color: "green"}} align="right">{`${profitPercent}%`}</TableCell>
                                            : <TableCell align="right" style={{color: "red"}}>{`${profitPercent}%`}</TableCell>
                                    }
                                    <TableCell align="right">moi</TableCell>
                                    <TableCell align="right">{(company.sticks[company.sticks.length - 1].close).toFixed(2)}</TableCell>
                                    <TableCell align="right">news shit</TableCell>
                                </StyledTableRow>)
                        } else {
                            return <div></div>
                        }
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default AnalysisTable