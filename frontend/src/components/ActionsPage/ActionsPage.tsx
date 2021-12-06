import { useQuery } from "@apollo/client"
import React from "react"
import { GET_ACTIONS } from "../../graphql/queries"
import { TransactionType } from "../../types"
import TransactionList from "../MyProfileRoute/TransactionList"
import { Typography } from "@material-ui/core"

const ActionsPage = ({stockSubscription}: {stockSubscription: string}) => {
  const actionsResult = useQuery(GET_ACTIONS)

  if (actionsResult.loading) {
    return <div>Loading...</div>
  }
  const actions = actionsResult.data.getActions.map((item: {transaction: TransactionType, transactionOwner: string}) => item.transaction)
  if (actions.length === 0) {
    return(
      <div
        style={{
          background: "white",
          paddingBottom: "60vh",
          paddingTop: "15vh",
          margin: 5,
        }}
      >
        <Typography style={{display: "flex", justifyContent: "center", textAlign: "center", paddingTop: "50vh"}}>
          No actions yet. Follow someone or tell the users you follow to buy and sell stocks.
        </Typography>
      </div>
    )
  }
  return (
    <div
      style={{
        background: "white",
        paddingBottom: "60vh",
        paddingTop: "15vh",
        margin: 5,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <TransactionList transactions={actions} transactionsWithOwner={actionsResult.data.getActions} />
    </div>
  )
}

export default ActionsPage