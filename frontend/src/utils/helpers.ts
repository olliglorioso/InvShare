import { withStyles } from "@material-ui/styles";
import { TextField } from "@material-ui/core";
import { styled } from "@material-ui/core";
import { TableRow } from "@material-ui/core";

// These are some variables that are used to succesfully display the charts. There were problems with TypeScript and ApexChart and this solved them.
const zoomOption = "zoom";
const finalZoomOption: "zoom" | "selection" | "pan" | undefined = zoomOption as
  | "zoom"
  | "selection"
  | "pan"
  | undefined;

const myDateOption = "category";
export const finalMyDateOption: "datetime" | "category" | "numeric" | undefined =
  myDateOption as "datetime" | "category" | "numeric" | undefined;

// This adds leading zeros to given numbers (8 => 08 etc.).
const leadingZeros = (num: number): string => {
    if (num < 10) {
        return "0" + num.toString();
    } else {
        return num.toString();
    }
};

// Default options for ApexCharts.
export const options = {
    chart: {
        id: "börse",
        fontFamily: "Roboto",
        background: "FFFFFF",
        toolbar: {
            show: true,
            offsetX: 0,
            offsetY: 0,
            tools: {
                download: false,
                selection: false,
                zoom: "<img src=\"https://image.flaticon.com/icons/png/512/1086/1086933.png\" style=\"padding-top: 3px;\" width=\"22\">",
                zoomin: false,
                zoomout: false,
                pan: "<img src=\"https://image.flaticon.com/icons/png/512/1/1427.png\" width=\"30\">",
                reset:
        "<img src=\"https://image.flaticon.com/icons/png/512/32/32303.png\" width=\"22\" style=\"padding-top: 3px;\">",
            },
            autoSelected: finalZoomOption,
        },
    },
    colors: ["#000000", "#000000"],
    stroke: {
        width: 1,
    },
};

// Styled table row (wanted to edit the default MUI Table row).
export const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td, &:last-child th": {
        border: 0,
    },
}));

// Styled text field (wanted to edit the default MUI TextField).
export const CssTextField = withStyles({
    root: {
        "& label.Mui-focused": {
            color: "grey",
        },
        "& .MuiInput-underline:after": {
            borderBottomColor: "black",
        },
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                borderColor: "grey",
            },
            "&:hover fieldset": {
                borderColor: "grey",
            },
            "&.Mui-focused fieldset": {
                borderColor: "black",
            },
        },
    },
})(TextField);

// Styled text field (wanted to edit the default MUI TextField).
export const BuyStocksTextField = withStyles({
    root: {
        "& label.Mui-focused": {
            color: "grey",
        },
        "& .MuiInput-underline:after": {
            borderBottomColor: "black",
        },
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                borderColor: "grey",
            },
            "&:hover fieldset": {
                borderColor: "grey",
            },
            "&.Mui-focused fieldset": {
                borderColor: "black",
            },
        },
        "width": "20vw"
    },
})(TextField);

export default leadingZeros;
