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

const SpecificExplore = ({followSubscriptions}: {followSubscriptions: string}): JSX.Element => {
    const styles = useStyles();
    const username: {id: string} = useParams();
    const searchResponse = useQuery(SEARCH_USER_FINAL, {variables: {username: username.id}});
    const [follow, ...followResult] = useMutation(FOLLOW, {variables: {username: username.id}});
    const loggedUser = useSelector<RootState, string>((state) => state.user.username);
    const [unfollow, ...unfollowResult] = useMutation(UNFOLLOW, {variables: {username: username.id}});

    useEffect(() => {
        if (followSubscriptions) {
            try {
                searchResponse.refetch();
            } catch {
                notification("Error.", "Something went wrong while trying to update the page.", "danger");
            }    
        }
    }, [followSubscriptions]);

    if (searchResponse.loading) {
        return (
            <div className={styles.loadingAnimationDiv}>
                <LoadingAnimation type={"spin"} color={"black"} />
            </div>
        );
    }
    const handleClick = async () => {
        try {
            await follow();
            notification("Success", `You followed ${username.id}.`, "success");
        } catch {
            notification("Error.", followResult[0].error?.graphQLErrors[0].message as string || "An error occured.", "danger");
        }
    };
    const handleClickUnfollow = async () => {
        try {
            await unfollow();
            notification("Success", `You unfollowed ${username.id}.`, "success");
        } catch {
            notification("Error.", unfollowResult[0].error?.graphQLErrors[0].message as string || "An error occured.", "danger");
        }
    };
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