import React from "react";
import axios from "axios";

// This is for resetting test database.
const Reset = (): JSX.Element => {
    const [success, setSuccess] = React.useState<string>("loading");
    axios.post("http://localhost:3001/graphql", {
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
            setSuccess("not allowed");
        }
        return success;
    });
    if (success === "success") {
        return <div>Success!</div>;
    } else if (success === "not allowed") {
        return <div>Not allowed!</div>;
    } else {
        return <div>Loading...</div>;
    }
};

export default Reset;