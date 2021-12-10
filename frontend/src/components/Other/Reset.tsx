import React from "react";
import { useMutation } from "@apollo/client";
import { RESET_DATABASE } from "../../graphql/queries";

// This is for resetting test database.
const Reset = () => {
    const [reset, {...result}] = useMutation(RESET_DATABASE);
    const resetDb = async () => {
        await reset();
    };
    resetDb();
    if (!result.data) {
        return <div>Resetting...</div>;
    } else if (result.data.resetDatabase.result) {
        return <div>Reseted succesfully.</div>;
    } else {
        return <div>Reset failed.</div>;
    }
};

export default Reset;