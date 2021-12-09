import React from "react";
import AppBar from "./components/Other/AppBar";
import {BrowserRouter as Router, Switch, Route, Redirect} from "react-router-dom";
import LoginPage from "./components/LoginRoute/LoginPage";
import StockPage from "./components/BuyStocksRoute/StockPage";
import SideBar from "./components/Other/SideBar";
import MyProfile from "./components/MyProfileRoute/MyProfile";
import ReactNotification from "react-notifications-component";
import DefaultPage from "./components/Other/DefaultPage";
import { FOLLOWEVENT, STOCKEVENT } from "./graphql/queries";
import ExplorePage from "./components/ExploreRoute/ExplorePage";
import SpecificExplore from "./components/ExploreRoute/SpecificExplore";
import { useSelector } from "react-redux";
import { useSubscription } from "@apollo/client";
import { RootState } from ".";
import ActionsPage from "./components/ActionsRoute/ActionsPage";
import Reset from "./components/Other/Reset";
import HealthCheck from "./components/Other/HealthCheck";

// This is the highest component in hierarchy. Displays the whole app.
function App(): JSX.Element {
    // Getting the logged user from the Redux-store.
    const userLogged = useSelector<RootState, string>((state) => state.user.username);
    // StockEvent-subscription.
    const stockEvent = useSubscription(STOCKEVENT, {variables: {username: userLogged}});
    // FollowEvent-subscription.
    const followEvent = useSubscription(FOLLOWEVENT, {variables: {username: userLogged}});
    // Rendering the other components.
    // We user React router to display the different pages and change urls.
    // ReactNotification-component is used to display notifications.
    const stockSubscription = {trans: stockEvent.data?.stockEvent?.transaction, me: stockEvent.data?.stockEvent.me};
    return (
        <div>
            <ReactNotification />
            <Router>
                <Switch>
                    <Route path="/actions" exact>
                        <div>
                            <SideBar />
                            <AppBar stockSubscription={stockSubscription} />
                            <ActionsPage />
                        </div>
                    </Route>
                    <Route path="/login" exact>
                        <div>
                            <SideBar />
                            <AppBar stockSubscription={stockSubscription} />
                            <LoginPage />
                        </div>
                    </Route>
                    <Route path="/myprofile" exact>
                        {
                            userLogged ?
                                <div>
                                    <SideBar />
                                    <AppBar stockSubscription={stockSubscription}/>
                                    <MyProfile 
                                        stockSubscription={stockEvent.data?.stockEvent?.transaction.transactionDate} 
                                        followSubscriptions={followEvent.data?.followEvent?.date}
                                    />
                                </div>
                                : <Redirect to="/login" />
                        }
                    </Route>
                    <Route path="/buystocks" exact>
                        {
                            userLogged ?
                                <div>
                                    <SideBar />
                                    <AppBar stockSubscription={stockSubscription} />
                                    <StockPage />
                                </div>
                                : <Redirect to="/login" />
                        }
                    </Route>
                    <Route path="/login" exact>
                        <div>
                            <SideBar />
                            <AppBar stockSubscription={stockSubscription} />
                        </div>
                        <LoginPage />
                    </Route>
                    <Route path="/explore" exact>
                        <div>
                            <SideBar />
                            <AppBar stockSubscription={stockSubscription} />
                        </div>
                        <ExplorePage />
                    </Route>
                    <Route path="/explore/:id" exact>
                        <div>
                            <SideBar />
                            <AppBar stockSubscription={stockSubscription} />
                            <SpecificExplore 
                                followSubscriptions={followEvent.data?.followEvent?.date} 
                            />
                        </div>
                    </Route>
                    <Route path="/" exact>
                        <div>
                            <SideBar />
                            <AppBar stockSubscription={stockSubscription} />
                            <DefaultPage />
                        </div>
                    </Route>
                    <Route path="/testreset" exact>
                        <Reset />
                    </Route>
                    <Route path="/healthcheck" exact> 
                        <HealthCheck />
                    </Route>
                    <Route path="/">
                        <Redirect to="/" />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
