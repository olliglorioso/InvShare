import React from "react";
import { Typography, Button } from "@material-ui/core";
import Chart from "react-apexcharts";
import { OldDataType } from "../../tsUtils/types";
import { Formik } from "formik";
import { AnalysisData } from "../../tsUtils/types";
import { useMutation } from "@apollo/client";
import { SELL_STOCK } from "../../graphql/queries";
import * as Yup from "yup";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { CssTextField, options } from "../../utils/helpers";
import notification from "../../utils/notification";
import { ApolloError } from "@apollo/client";
import useStyles from "./myProfileRouteStyles.module";

// This component is responsible for rendering the historical of a specific data when the user wants.

const OldData = ({
    datas,
    analysisData,
    oldDataError
}: {
  datas: OldDataType;
  analysisData: AnalysisData[];
  oldDataError: (ApolloError | undefined)
}) => {
    // Importing styles.
    const styles = useStyles();
    // Initializing sell-mutation with useMutation-hook.
    const [sell] = useMutation(SELL_STOCK);
    // This is a variable that helps to detect a specific oldDataError and displaying a custom error notification.
    const defaultAlphaError = "https://www.alphavantage.co/premium/";
    
    if (oldDataError) {
        // If the error is Alpha Vantage's default error, we change it to a custom error for readability.
        notification("API error.", oldDataError.message.includes(defaultAlphaError) 
            ? "An error with Alpha Vantage's API: too frequent requests or bad API key." 
            : oldDataError.message, "danger");
        return <></>;
    } 
    // If there is no data, we return an empty div.
    if (!datas) return <div></div>;
    // This formats data for x-axis. 
    const dates = datas.time_series.map((o: { date: string; value: number }) => o.date);
    // We use different options than usual.
    const oldDataDateOption = "datetime";
    const readyDateOption: "datetime" | "category" | "numeric" | undefined =
    oldDataDateOption as "datetime" | "category" | "numeric" | undefined;

    const options2 = {
        // We use default and self-made options that is imported.
        ...options,
        xaxis: {
            categories: dates,
            type: readyDateOption,
            labels: {
                rotate: 0,
            },
        },
    };
    // Y-values are collected from datas-prop.
    const series = [
        {
            name: "Value",
            data: datas.time_series.map((o: { date: string; value: number }) =>
                o.value.toFixed(2)
            ),
        },
    ];
    // Validation schema for amount of stocks to sell.
    const ValidationSchema = Yup.object().shape({
        // Is required and must be at least one.
        amount: Yup.number()
            .required("Required field.")
            .transform((value: string) => parseInt(value))
            .min(1, "Amount must be at least one."),
    });
    // We search for the selected stock.
    const selectedStock = analysisData.filter((o: AnalysisData): boolean => o.name === datas.metadata.symbol)[0];
    // Does it exist?
    if (!selectedStock) return <div></div>;
    // Searching for the last price of the selected stock. This information is from analysisData so it is fresh information.
    // We could make a new query to get the last price but it would be a waste of resources, although it would be more accurate.
    const lastPrice = selectedStock.sticks[selectedStock.sticks.length - 1].close;
    return (
        <div className={styles.oldDataDiv}>
            <Typography style={{ fontSize: 20, fontWeight: "bold" }}>
                 Old data: {datas.metadata.symbol} (last refresh:{" " + datas.metadata.lastRefresh})
            </Typography>
            <div style={{ width: "100%" }}>
                <Chart options={options2} series={series} type="line" height={300} />
            </div>
            <Formik
            // Formik that handles the sell-form.
                initialValues={{
                    amount: "",
                }}
                onSubmit={(input: { amount: string }) => {
                    confirmAlert({
                        // On submit we display a confirmation
                        title: "Confirmation",
                        message: `Are you sure you want to sell ${input.amount} x ${datas.metadata.symbol.toUpperCase()} 
                        (${(lastPrice * parseInt(input.amount)).toFixed(2)}$)?`,
                        buttons: [
                            {
                                label: "Yes",
                                onClick: async () => {
                                    // On "Yes", we try to sell the stock by using mutation.
                                    try {
                                        await sell({
                                            variables: {
                                                stockName: selectedStock.name,
                                                amount: parseInt(input.amount),
                                                price: lastPrice,
                                            },
                                        });
                                        notification(
                                            "Success.",
                                            `You sold: ${
                                                input.amount
                                            } x ${datas.metadata.symbol.toUpperCase()}.`,
                                            "success"
                                        );
                                    } catch (e: unknown) {
                                        notification(
                                            "An error occured",
                                            (e as Error).message || "Something went wrong.",
                                            "danger"
                                        );
                                    }
                                },
                            },
                            {
                                label: "No",
                                onClick: () => {
                                    notification("Canceled", "The sale was canceled.", "info");
                                },
                            },
                        ],
                    });
                }}
                validationSchema={ValidationSchema}
            >
                {({
                    handleSubmit,
                    handleBlur,
                    values,
                    handleChange,
                    errors,
                    touched,
                }) => (
                    <form onSubmit={handleSubmit}>
                        <p></p>
                        <CssTextField
                            id="amount"
                            type="number"
                            variant="outlined"
                            label="Amount"
                            onChange={handleChange}
                            value={values.amount}
                            style={{ width: 150 }}
                            onBlur={handleBlur}
                            InputProps={{
                                inputProps: { min: 0 },
                            }}
                        />
                        {errors.amount && touched.amount
                            ? <div className={styles.errorColor}>{errors.amount}</div>
                            : <></>}
                        <p></p>
                        <Typography style={{ display: "flex", justifyContent: "center" }}>
                            Sell {datas.metadata.symbol} for {lastPrice}$?
                        </Typography>
                        <p></p>
                        <Button
                            variant="contained"
                            type="submit"
                            className={styles.oldDataButton}
                        >
                            Sell
                        </Button>
                        <p style={{ fontSize: 20 }}></p>
                    </form>
                )}
            </Formik>
        </div>
    );
};

export default OldData;
