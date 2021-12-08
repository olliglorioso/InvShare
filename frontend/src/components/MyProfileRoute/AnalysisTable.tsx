import * as React from "react";
import { Table } from "@material-ui/core";
import { TableBody, Button } from "@material-ui/core";
import TableCell from "@material-ui/core/TableCell";
import { TableContainer } from "@material-ui/core";
import { TableHead } from "@material-ui/core";
import { TableRow } from "@material-ui/core";
import { Paper } from "@material-ui/core";
import { AnalysisData, Holdings } from "../../tsUtils/types";
import { StyledTableRow } from "../../utils/helpers";
import useStyles from "./myProfileRouteStyles.module";
import notification from "../../utils/notification";

// This component is responsible for rendering the analysis table under the chart.

const AnalysisTable = ({analysisData, holdings, getOldData}: 
    {getOldData: (comp: string) => void, analysisData: AnalysisData[], holdings: Holdings[]}) => {
    const styles = useStyles();
    // Immediatelly rendering.
    return (
        <TableContainer component={Paper}>
            <Table aria-label="customized table">
                <TableHead>
                    <TableRow style={{ background: "black" }}>
                        <TableCell className={styles.tableCellTitles} align="right">
                            Company
                        </TableCell>
                        <TableCell className={styles.tableCellTitles} align="right">
                            Profit
                        </TableCell>
                        <TableCell className={styles.tableCellTitles} align="right">
                            Average purchase value
                        </TableCell>
                        <TableCell className={styles.tableCellTitles} align="right">
                            Current value
                        </TableCell>
                        <TableCell className={styles.tableCellTitles} align="right">
                            Total amount
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {analysisData.map((company: AnalysisData) => {
                        // Here we map through analysisData, also sticks for every company.
                        // First of all, we search for the company in holdings. It is to be found.
                        const correspondingPosition = holdings.filter((x: Holdings) => {
                            return x.usersStock.stockSymbol === company.name;
                        })[0];
                        // Here we calculate the profit percent of this particular company by taking its last value and dividing it by the original average value.
                        const profitPercent = ((-1 + company.sticks[company.sticks.length - 1].close / (correspondingPosition.usersTotalOriginalPriceValue / correspondingPosition.usersTotalAmount)) * 100)
                            .toFixed(2);
                        return (
                            <StyledTableRow key={`${company.name}`}>
                                <TableCell component="th" scope="row">
                                    <Button
                                        className={styles.analysisTableButton}
                                        onClick={() => {
                                            try {
                                                getOldData(company.name);
                                                return;
                                            } catch (e: unknown) {
                                                notification("Error.", (e as Error).message, "danger");
                                            }
                                        }}
                                    >
                                        {company.name}
                                    </Button>
                                </TableCell>
                                {parseFloat(profitPercent) >= 0 ? (
                                    <TableCell
                                        style={{ color: "green" }}
                                        align="right"
                                    >{`${parseFloat(profitPercent).toFixed(2)}%`}</TableCell>
                                ) : (
                                    <TableCell
                                        align="right"
                                        style={{ color: "red" }}
                                    >{`${parseFloat(profitPercent).toFixed(2)}%`}</TableCell>
                                )}
                                <TableCell align="right">
                                    {(
                                        correspondingPosition.usersTotalOriginalPriceValue / correspondingPosition.usersTotalAmount
                                    ).toFixed(2)}
                                </TableCell>
                                <TableCell align="right">
                                    {company.sticks[company.sticks.length - 1].close.toFixed(2)}
                                </TableCell>
                                <TableCell align="right">
                                    {correspondingPosition.usersTotalAmount}
                                </TableCell>
                            </StyledTableRow>
                        );
                    } 
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default AnalysisTable;
