import React from "react";
import MenuBar from "./components/Other/AppBar";
import {BrowserRouter as Router, Switch, Route, Redirect} from "react-router-dom"
import LoginPage from "./components/LoginRoute/LoginPage";
import StockPage from "./components/MyStocksRoute/StockPage";
import SideBar from "./components/Other/SideBar";
import MyProfile from "./components/MyProfileRoute/MyProfile"
import ReactNotification from "react-notifications-component"
import DefaultPage from "./components/Other/DefaultPage";
import { useSubscription } from "@apollo/client";
import { FOLLOWEVENT, STOCK_PURCHASED } from "./graphql/queries";
import ExplorePage from "./components/ExplorePage/ExplorePage";
import SpecificExplore from "./components/ExplorePage/SpecificExplore"
import { useSelector } from "react-redux";
import { RootState } from ".";
import ActionsPage from "./components/ActionsPage/ActionsPage";

function App(): JSX.Element {
  const loggedUser = localStorage.getItem("loggedUser")
  const resultti = useSubscription(STOCK_PURCHASED, {variables: {username: loggedUser}})
  const followEvent = useSubscription(FOLLOWEVENT)
  const userLogged = useSelector<RootState, boolean>((state) => state.user);
  
  return (
    <div>
      <ReactNotification />
      <Router>
        <Switch>
          <Route path="/actions" exact>
            <div>
              <SideBar />
              <MenuBar />
              <ActionsPage />
            </div>
          </Route>
          <Route path="/login" exact>
            <div>
              <SideBar />
              <MenuBar />
              <LoginPage />
            </div>
          </Route>
          <Route path="/myprofile" exact>
            {
              userLogged ?
                <div>
                  <SideBar />
                  <MenuBar />
                  <MyProfile subscriptionData={resultti.data?.stockPurchased?.transaction.transactionDate} followSubscriptions={followEvent.data?.followEvent?.date}/>
                </div>
                : <Redirect to="/login" />
            }
          </Route>
          <Route path="/mystocks" exact>
            {
              userLogged ?
                <div>
                  <SideBar />
                  <MenuBar />
                  <StockPage />
                </div>
                : <Redirect to="/login" />
            }
          </Route>
          <Route path="/login" exact>
            <div>
              <SideBar />
              <MenuBar />
            </div>
            <LoginPage />
          </Route>
          <Route path="/explore" exact>
            <div>
              <SideBar />
              <MenuBar />
            </div>
            <ExplorePage />
          </Route>
          <Route path="/explore/:id" exact>
            <div>
              <SideBar />
              <MenuBar />
              <SpecificExplore followSubscriptions={followEvent.data?.followEvent?.date} />
            </div>
          </Route>
          <Route path="/" exact>
            <div>
              <SideBar />
              <MenuBar />
              <DefaultPage />
            </div>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
