import { useMutation, useQuery } from "@apollo/client"
import React, {useEffect} from "react"
import { useParams } from "react-router-dom"
import { FOLLOW, SEARCH_USER_FINAL, UNFOLLOW } from "../../graphql/queries"
import { Card, CardHeader, Typography, CardContent, Button } from "@material-ui/core"
import Avatar from "boring-avatars"
import LoadingAnimation from "../Other/LoadingAnimation"
import notification from "../Other/Notification"
import TransactionList from "../MyProfileRoute/TransactionList"

const SpecificExplore = ({followSubscriptions}: {followSubscriptions: string}) => {
  const id: {id: string} = useParams()
  const response = useQuery(SEARCH_USER_FINAL, {variables: {username: id.id}})
  const [follow, ...result] = useMutation(FOLLOW, {variables: {username: id.id}})
  const loggedUser = localStorage.getItem("loggedUser");
  const [unfollow, ...result2] = useMutation(UNFOLLOW, {variables: {username: id.id}})

  useEffect(() => {
    if (followSubscriptions) {
      try {
        response.refetch()
      } catch {
        console.log("an error")
      }    
    }
  }, [followSubscriptions])

  if (response.loading || !response.data || !response.data.searchUser[0]) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <LoadingAnimation type={"spin"} color={"black"} />
      </div>
    )
  }
  const handleClick = async () => {
    try {
      await follow()
      notification("Success", `You followed ${id.id}.`, "success")
    } catch {
      notification("Error.", result[0].error?.graphQLErrors[0].message as string || "An error occured.", "danger")
    }
  }

  const handleClickUnfollow = async () => {
    try {
      await unfollow()
      notification("Success", `You unfollowed ${id.id}.`, "success")
    } catch {
      notification("Error.", result2[0].error?.graphQLErrors[0].message as string || "An error occured.", "danger")
    }
  }

  return (
    <div
      style={{
        background: "white",
        paddingBottom: "60vh",
        paddingTop: "10vh",
        margin: "5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: 15 }}>
        <Card>
          <CardHeader
            avatar={
              <Avatar
                size={100}
                name={response.data.searchUser[0]?.usersUsername}
                variant="marble"
                colors={["#808080", "#FFFFFF", "#000000"]}
              />
            }
            title={
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 2 }}>
                  <Typography style={{ fontSize: 30, flex: 1 }}>
                    {response.data?.searchUser[0]?.usersUsername}
                  </Typography>
                  <Typography style={{ fontSize: 20, flex: 1 }}>
                    {response.data?.searchUser[0].usersFollowers.filter((followType: {user: {usersUsername: string, __typename: string}, __typename: string}) => followType.user.usersUsername === loggedUser).length > 0 
                      ? <Button style={{background: "black", color: "white"}} onClick={handleClickUnfollow}>Unfollow</Button>
                      : <Button style={{background: "black", color: "white"}} onClick={handleClick}>Follow</Button>
                    }
                  </Typography>
                </div>
                <div style={{ flex: 1, paddingTop: 15 }}>
                  <Typography style={{ fontSize: 15, flex: 1, textAlign: "center" }}>
                    {response.data.searchUser[0].followerCount || 0}
                  </Typography>
                  <Typography style={{ fontSize: 15, flex: 1, textAlign: "center" }}>
                    Followers
                  </Typography>
                </div>
                <div style={{ flex: 1, paddingTop: 15}}>
                  <Typography style={{ fontSize: 15, flex: 1, textAlign: "center" }}>
                    {response.data.searchUser[0].followingCount || 0}
                  </Typography>
                  <Typography style={{ fontSize: 15, flex: 1, textAlign: "center" }}>
                    Following
                  </Typography>
                </div>
              </div>
            }
          ></CardHeader>
          <CardContent>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <div style={{ justifyContent: "center" }}>
                <Typography
                  style={{
                    fontWeight: "bold",
                    fontSize: 30,
                    textAlign: "center",
                  }}
                >
                  {(response.data?.searchUser[0].moneyMade || 0).toFixed(2)}
                </Typography>
                <Typography style={{ textAlign: "center" }}>
                  Money made
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <TransactionList transactions={response.data?.searchUser[0].usersTransactions || 0} />
      </div>
    </div>
  )
}

export default SpecificExplore