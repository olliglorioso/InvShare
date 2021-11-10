import React from "react";
import MenuBar from "./components/Other/AppBar";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom"
import LoginPage from "./components/LoginRoute/LoginPage";
import StockPage from "./components/MyStocksRoute/StockPage";
import SideBar from "./components/Other/SideBar";
import MyProfile from "./components/MyProfileRoute/MyProfile"
import ReactNotification from "react-notifications-component"
import DefaultPage from "./components/Other/DefaultPage";
import STOCK_PURCHASED from "./graphql/queries";
import {useSubscription} from "@apollo/client"

function App(): JSX.Element {

    useSubscription(STOCK_PURCHASED, {
        onSubscriptionData: ({subscriptionData}) => {
            console.log(subscriptionData)
            // if (subscriptionData.data.stockPurchased) {
            //     loadCPV()
            // }
        }
    })

    return (
        <div>
            <ReactNotification />
            <Router>
                <Switch>
                    <Route path="/" exact>
                        <div>
                            <SideBar />
                            <MenuBar  />
                            <DefaultPage />
                        </div>
                    </Route>
                    <Route path="/myprofile" exact>
                        <div>
                            <SideBar />
                            <MenuBar />
                        </div>
                        <MyProfile />
                    </Route>
                    <Route path="/mystocks" exact>
                        <StockPage />
                    </Route>
                    <Route path="/login" exact>
                        <LoginPage />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
