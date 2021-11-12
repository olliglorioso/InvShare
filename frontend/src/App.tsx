import React from "react";
import MenuBar from "./components/Other/AppBar";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom"
import LoginPage from "./components/LoginRoute/LoginPage/";
import StockPage from "./components/MyStocksRoute/StockPage";
import SideBar from "./components/Other/SideBar";
import MyProfile from "./components/MyProfileRoute/MyProfile/"
import ReactNotification from "react-notifications-component"
import DefaultPage from "./components/Other/DefaultPage";
import { useSubscription } from "@apollo/client";
import { STOCK_PURCHASED } from "./graphql/queries";

function App(): JSX.Element {
    const resultti = useSubscription(STOCK_PURCHASED)

    return (
        <div>
            <ReactNotification />
            <Router>
                <Switch>
                    <Route path="/" exact>
                        <div>
                            <SideBar />
                            <MenuBar />
                            <DefaultPage />
                        </div>
                    </Route>
                    <Route path="/myprofile" exact>
                        <div>
                            <SideBar />
                            <MenuBar />
                        </div>
                        <MyProfile subscriptionData={resultti.data?.stockPurchased?.transactionDate} />
                    </Route>
                    <Route path="/mystocks" exact>
                        <div>
                            <SideBar />
                            <MenuBar />
                        </div>
                        <StockPage />
                    </Route>
                    <Route path="/login" exact>
                        <div>
                            <SideBar />
                            <MenuBar />
                        </div>
                        <LoginPage />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
