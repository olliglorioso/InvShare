import { Typography } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../..";

const DefaultPage = () => {
  const userState = useSelector<RootState, boolean>((state) => state.user);
  return (
    <div
      style={{
        background: "white",
        paddingBottom: "60vh",
        paddingTop: "15vh",
        margin: 5,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1
        style={{display: "flex", justifyContent: "center"}}
      >
        {userState ? "You are logged in." : "You are not logged in."} 
      </h1>
      <Typography style={{display: "flex", justifyContent: "center", paddingLeft: "20vw", paddingRight: "20vw"}}>
        Welcome to InvShare.
      </Typography>
    </div>
  );
};

export default DefaultPage;
