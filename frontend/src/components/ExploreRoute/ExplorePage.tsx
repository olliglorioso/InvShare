import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import { useQuery } from "@apollo/client";
import { SEARCH_USER_FINAL } from "../../graphql/queries";
import { useHistory } from "react-router-dom";
import notification from "../../utils/notification";
import useStyles from "./exploreRouteStyles.module";
import UserSearch from "./UserSearch";
import { Typography } from "@material-ui/core";
// This component takes generally care of the Explore-page. 
const ExplorePage = () => {
    // Importing the styles.
    const styles = useStyles();
    // State that will have the final user's username in the end.
    const [finalUser, setFinalUser] = useState("");
    // We take only refetch-function from the searchUser-query's response.
    const {refetch: refetchSearch} = useQuery(SEARCH_USER_FINAL, {variables: {username: finalUser}});
    // History is used to redirect the user to the final user's profile.
    const history = useHistory();
    // When the user presses enter or chooses a user from the autocomplete-list, this function is called.
    const handleFinalSearch = async () => {
        const response = await refetchSearch();
        return response;
    };
    // Every time the finalUser-state changes, we call the handleFinalSearch-function (with the help of useEffect)
    // Finaluser-state change only when enter is pressed or a user is chosen from the autocomplete-list.
    useEffect(() => {
        if (finalUser !== "") {
            handleFinalSearch()
                .then((response) => {
                    // We use exceptionally then-catch-structure to handle final search.
                    // If the search is successfull and we find one user with the given username, we redirect the user to the 
                    // SpecificExplore-component's page.
                    if (response.data.searchUser.length === 1) {
                        history.push(`/explore/${response.data.searchUser[0].usersUsername}`);
                    } else {
                        notification("Something went wrong.", "Your search was not precise enough or no user was found.", "info");
                    }
                });
        }
    }, [finalUser]);
    // Rendering the page. Formik is used and the self-made UserSearch-component.
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
