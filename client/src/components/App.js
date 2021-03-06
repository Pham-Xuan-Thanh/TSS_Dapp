import React, { Suspense } from 'react';
import { Route, Switch, Redirect } from "react-router-dom";
import Auth from "../hoc/auth";
// pages for this product
import LandingPage from "./views/LandingPage/LandingPage.js";
import LoginPage from "./views/LoginPage/LoginPage.js";
import RegisterPage from "./views/RegisterPage/RegisterPage.js";
import NavBar from "./views/NavBar/NavBar";
import Footer from "./views/Footer/Footer"
import Dashboard from "./views/Dashboard/dashboard"
import AddWallet from "./views/AddWallet/addwallet"
import Thesis from './views/ThesisPage/ThesisList';
import SearchPage from './views/SearchPage/SearchPage';
import {sign} from  "../helper/ecies"
//null   Anyone Can go inside
//true   only logged in user can go inside
//false  logged in user can't go inside
function App() {
  sign()
  return (
    <Suspense fallback={(<div>Loading...</div>)}>
      <NavBar />
      <div style={{ paddingTop: '69px', minHeight: 'calc(100vh - 80px)' }}>
        <Switch>
          <Route exact path="/" component={Auth(LandingPage, null)} />
          <Route exact path="/login" component={Auth(LoginPage, false)}  />
          <Route exact path="/register" component={Auth(RegisterPage, false)} />
          <Route exact path="/dashboard" component={Auth(Dashboard, true)} />
          <Route exact path="/addwallet" component={Auth(AddWallet, true)} />
          <Route exact path="/user/thesis" component={Auth(Thesis, true)} >
          </Route>
          <Route exact path="/thesis/chapter/search" component={SearchPage}/>

        </Switch>
      </div>
      <Footer />
    </Suspense>
  );
}

export default App;
