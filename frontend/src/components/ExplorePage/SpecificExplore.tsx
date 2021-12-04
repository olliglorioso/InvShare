import { useMutation, useQuery } from "@apollo/client"
import React from "react"
import { useParams } from "react-router-dom"
import { FOLLOW, SEARCH_USER_FINAL } from "../../graphql/queries"
import { Card, CardHeader, Typography, CardContent, Button } from "@material-ui/core"
import Avatar from "boring-avatars"
import LoadingAnimation from "../Other/LoadingAnimation"
import notification from "../Other/Notification"

const SpecificExplore = () => {
  const id: {id: string} = useParams()
  const response = useQuery(SEARCH_USER_FINAL, {variables: {username: id.id}})
  const [follow, ...result] = useMutation(FOLLOW, {variables: {username: id.id}})
  if (response.loading) {
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
                name={response?.data.searchUser[0]?.usersUsername}
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
                    {response?.data.searchUser[0]?.usersUsername}
                  </Typography>
                  <Typography style={{ fontSize: 20, flex: 1 }}>
                    <Button style={{background: "black", color: "white"}} onClick={handleClick}>Follow</Button>
                  </Typography>
                </div>
                <div style={{ flex: 1, paddingTop: 15 }}>
                  <Typography style={{ fontSize: 15, flex: 1, textAlign: "center" }}>
                    {response.data?.searchUser[0].followerCount || 0}
                  </Typography>
                  <Typography style={{ fontSize: 15, flex: 1, textAlign: "center" }}>
                    Followers
                  </Typography>
                </div>
                <div style={{ flex: 1, paddingTop: 15}}>
                  <Typography style={{ fontSize: 15, flex: 1, textAlign: "center" }}>
                    {response.data?.searchUser[0].followingCount || 0}
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
                justifyContent: "space-between",
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
                  fksdajfkjdsaf
                </Typography>
                <Typography style={{ textAlign: "center" }}>
                  Followingfdfadf
                </Typography>
              </div>
              <div style={{ justifyContent: "center" }}>
                <Typography
                  style={{
                    fontWeight: "bold",
                    fontSize: 30,
                    textAlign: "center",
                  }}
                >
                  fasjdfk
                </Typography>
                <Typography style={{ textAlign: "center" }}>
                  Fols9da8
                </Typography>
              </div>
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
                  Profit
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* <div>
                {parseFloat(
                  (
                    100 *
                    (-1 +
                      0.
                  ).toFixed(2)
                ) >= 0 ? (
                    <Typography
                      style={{
                        color: "green",
                        fontWeight: "bold",
                        fontSize: 30,
                        textAlign: "center",
                      }}
                    >
                      {(
                        100 *
                      (-1 +
                        res.data.currentPortfolioValue[0].wholeValue /
                          totalOriginalValue)
                      ).toFixed(2)}
                    %
                    </Typography>
                  ) : (
                    <Typography
                      style={{
                        color: "red",
                        fontWeight: "bold",
                        fontSize: 30,
                        textAlign: "center",
                      }}
                    >
                      {(
                        100 *
                      (-1 +
                        res.data.currentPortfolioValue[0].wholeValue /
                          totalOriginalValue)
                      ).toFixed(2)}
                    %
                    </Typography>
                  )}

                <Typography style={{ textAlign: "center" }}>
                  Profit all time
                </Typography>
              </div>
              <div>
                <Typography
                  style={{
                    fontWeight: "bold",
                    fontSize: 30,
                    textAlign: "center",
                  }}
                >
                  {Math.round(totalOriginalValue)}
                </Typography>
                <Typography style={{ textAlign: "center" }}>
                  Original value
                </Typography>
              </div>
              <div>
                <Typography
                  style={{
                    fontWeight: "bold",
                    fontSize: 30,
                    textAlign: "center",
                  }}
                >
                  {Math.round(result.data.me.moneyMade)}
                </Typography>
                <Typography style={{ textAlign: "center" }}>Profit</Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <div style={{ paddingBottom: "1vh", textAlign: "center" }}>
          <Button
            variant="contained"
            type="submit"
            onClick={() => setMode("Analysis")}
            style={{ background: "black", color: "white" }}
          >
            Analysis
          </Button>
        </div>
        <div style={{ paddingBottom: "1vh", textAlign: "center" }}>
          <Button
            variant="contained"
            type="submit"
            onClick={() => setMode("Transactions")}
            style={{ background: "black", color: "white" }}
          >
            Transactions
          </Button>
        </div>
      </div>
      {mode === "Analysis" ? (
        <div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{ width: "100%", paddingLeft: "5vh", paddingRight: "5vh" }}
            >
              <h1
                style={{
                  fontWeight: "bold",
                  fontSize: 25,
                  color: "black",
                  textAlign: "center",
                  fontFamily: "Arial",
                }}
              >
                Analysis
              </h1>
              <div>
                <div style={{ width: "100%", justifyContent: "center" }}>
                  <AnalysisChart
                    totalOriginalValue={totalOriginalValue}
                    analysisData={analysisData.analysisValues}
                    positions={result.data.me.usersHoldings}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <TransactionList transactions={transactions} />
        </div> */}
      {/* )}
    </div> */}
    </div>
  )
}

export default SpecificExplore