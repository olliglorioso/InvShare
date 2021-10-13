import React from "react";
import MenuBar from "./components/AppBar";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom"
import LoginPage from "./components/LoginPage";
import StockPage from "./components/StockPage";
import SideBar from "./components/SideBar";
import MyProfile from "./components/MyProfile"
import ReactNotification from "react-notifications-component"


function App(): JSX.Element {
    return (
        <div>
            <ReactNotification />
            <Router>
                <Switch>
                    <Route path="/" exact>
                        <div>
                            <SideBar />
                            <MenuBar  />
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
