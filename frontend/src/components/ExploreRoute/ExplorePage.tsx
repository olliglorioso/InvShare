import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import { useQuery } from "@apollo/client";
import { SEARCH_USER_FINAL } from "../../graphql/queries";
import { useHistory } from "react-router-dom";
import notification from "../../utils/notification";
import useStyles from "./exploreRouteStyles.module";
import UserSearch from "./UserSearch";
import { Typography } from "@material-ui/core";
const ExplorePage = () => {
    const styles = useStyles();
    const [finalUser, setFinalUser] = useState("");
    const {refetch: refetchSearch} = useQuery(SEARCH_USER_FINAL, {variables: {username: finalUser}});
    const history = useHistory();
    const handleFinalSearch = async () => {
        const response = await refetchSearch();
        return response;
    };
    useEffect(() => {
        if (finalUser !== "") {
            handleFinalSearch()
                .then((response) => {
                    if (response.data.searchUser.length === 1) {
                        history.push(`/explore/${response.data.searchUser[0].usersUsername}`);
                    } else {
                        notification("Something went wrong.", "Your search was not precise enough or no user was found.", "info");
                    }
                });
        }
    }, [finalUser]);
    return (
        <div className={styles.explorePageFirstDiv}>
            <div className={styles.explorePageSecondDiv}>
                <Typography className={styles.exploreTitle}>Explore</Typography>
                <Formik
                    initialValues={{ username: "" }}
                    onSubmit={(value: { username: string }) => {
                        setFinalUser(value.username);
                    }}
                >
                    {({ values, handleChange, handleBlur, handleSubmit }) => (
                        <form onSubmit={handleSubmit}>
                            <UserSearch
                                handleChange={handleChange}
                                handleBlur={handleBlur}
                                username={values.username}
                                handleSubmit={handleSubmit}
                                setFinalUser={setFinalUser}
                            />
                        </form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default ExplorePage;
