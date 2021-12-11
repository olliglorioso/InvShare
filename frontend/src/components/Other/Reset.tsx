import React from "react";
import axios from "axios";

// This is for resetting database. Only for
const Reset = (): JSX.Element => {
    const gqlUri = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
        ? "http://localhost:3001/graphql" 
        : "https://fso2021practicework.herokuapp.com/graphql";
    
    const [success, setSuccess] = React.useState<string>("loading");

    axios.post(gqlUri, {
        query: `
            mutation resetDatabase {
            resetDatabase {
                result
            }
        }
    `
    }, {
        headers: {"Content-Type": "application/json"}
    }). then(res => {
        if (res.data.data.resetDatabase.result) {
            setSuccess("success");
        } else if (!res.data.data.resetDatabase.result) {
            setSuccess("success");
        }
        return success;
    });
    if (success === "success") {
        return <div>Success!</div>;
    } else if (success === "not allowed") {
        return <div>Success!</div>;
    } else {
        return <div>Loading...</div>;
    }
};

export default Reset;