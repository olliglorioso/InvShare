import { useMutation, useQuery } from "@apollo/client";
import React, {useEffect} from "react";
import { useParams } from "react-router-dom";
import { FOLLOW, SEARCH_USER_FINAL, UNFOLLOW } from "../../graphql/queries";
import { Card, CardHeader, Typography, CardContent, Button } from "@material-ui/core";
import Avatar from "boring-avatars";
import LoadingAnimation from "../Other/LoadingAnimation";
import notification from "../../utils/notification";
import TransactionList from "../MyProfileRoute/TransactionList";
import useStyles from "./exploreRouteStyles.module";
import { useSelector } from "react-redux";
import { RootState } from "../..";

// This component is used to display the user profile of the user that was searched for.
// It is quite similar to MyProfile-page, but less information.
const SpecificExplore = ({followSubscriptions}: {followSubscriptions: string}): JSX.Element => {
    // Importing styles.
    const styles = useStyles();
    // Getting the username from url.
    const username: {id: string} = useParams();
    // Searching for the user (this time the search returns much more information).
    // We use searchUser-query to search for the user from the database.
    const searchResponse = useQuery(SEARCH_USER_FINAL, {variables: {username: username.id}});
    // This mutation is used to follow the user.
    const [follow, ...followResult] = useMutation(FOLLOW, {variables: {username: username.id}});
    // We get the current user from the local storage.
    const loggedUser = useSelector<RootState, string>((state) => state.user.username);
    // This mutation is used to unfollow the user.
    const [unfollow, ...unfollowResult] = useMutation(UNFOLLOW, {variables: {username: username.id}});

    // Everytime an unfollow or a follow is done, the client either is notified or not
    // depending on the user that is logged in the client.
    // If there is a notification, the page updates the amount of followers and followings.
    // If refetch is not succesfull, an error message will be displayed.
    useEffect(() => {
        if (followSubscriptions) {
            try {
                searchResponse.refetch();
            } catch {
                notification("Error.", "Something went wrong while trying to update the page.", "danger");
            }    
        }
    }, [followSubscriptions]);

    // If response is loading, a loading animation will be displayed.
    if (searchResponse.loading) {
        return (
            <div className={styles.loadingAnimationDiv}>
                <LoadingAnimation type={"spin"} color={"black"} />
            </div>
        );
    }
    // When follow button is clicked, the follow-mutation is called. A notification will be
    // be displayed both when the mutation is successfull and when it fails.
    const handleClick = async () => {
        try {
            await follow();
            notification("Success", `You followed ${username.id}.`, "success");
        } catch {
            notification("Error.", followResult[0].error?.graphQLErrors[0].message as string || "An error occured.", "danger");
        }
    };
    // When unfollow button is clicked, the unfollow-mutation is called. A notification will be
    // be displayed both when the mutation is successfull and when it fails.
    const handleClickUnfollow = async () => {
        try {
            await unfollow();
            notification("Success", `You unfollowed ${username.id}.`, "success");
        } catch {
            notification("Error.", unfollowResult[0].error?.graphQLErrors[0].message as string || "An error occured.", "danger");
        }
    };
    // This returns the user profile.
    return (
        <div className={styles.specificExploreFirstDiv}>
            <div style={{ padding: 15 }}>
                <Card>
                    <CardHeader
                        avatar={
                            <Avatar
                                size={100}
                                name={searchResponse.data.searchUser[0].usersUsername}
                                variant="marble"
                                colors={["#808080", "#FFFFFF", "#000000"]}
                            />
                        }
                        title={
                            <div className={styles.cardTitleDiv}>
                                <div style={{ flex: 2 }}>
                                    <Typography className={styles.cardTypography}>
                                        {searchResponse.data.searchUser[0].usersUsername}
                                    </Typography>
                                    <Typography className={styles.cardTypography}>
                                        {searchResponse.data.searchUser[0].usersFollowers.filter((followType: {
                                            user: {usersUsername: string, __typename: string},
                                             __typename: string}) => followType.user.usersUsername === loggedUser)
                                            .length > 0 
                                            // Either follow- or unfollow-button is displayed depending on if the user has been followed or not.
                                            // The previous filter check the situation.
                                            ? <Button className={styles.followButton} onClick={handleClickUnfollow}>Unfollow</Button>
                                            : <Button className={styles.followButton} onClick={handleClick}>Follow</Button>
                                        }
                                    </Typography>
                                </div>
                                <div className={styles.followAmountsDiv}>
                                    <Typography className={styles.specificExploreTypography}>
                                        {searchResponse.data.searchUser[0].followerCount || 0}
                                    </Typography>
                                    <Typography className={styles.specificExploreTypography}>
                                        Followers
                                    </Typography>
                                </div>
                                <div className={styles.followAmountsDiv}>
                                    <Typography className={styles.specificExploreTypography}>
                                        {searchResponse.data.searchUser[0].followingCount || 0}
                                    </Typography>
                                    <Typography className={styles.specificExploreTypography}>
                                        Following
                                    </Typography>
                                </div>
                            </div>
                        }
                    ></CardHeader>
                    <CardContent>
                        <div className={styles.cardContentDiv}>
                            <div style={{ justifyContent: "center" }}>
                                <Typography className={styles.cardContentTypography}>
                                    {(searchResponse.data.searchUser[0].moneyMade || 0).toFixed(2)}
                                </Typography>
                                <Typography style={{ textAlign: "center" }}>
                                    Money made
                                </Typography>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className={styles.transactionListDiv}>
                <TransactionList transactions={searchResponse.data.searchUser[0].usersTransactions || 0} />
            </div>
        </div>
    );
};

export default SpecificExplore;