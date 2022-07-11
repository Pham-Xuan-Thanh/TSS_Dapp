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
import {getPubicKey, getPublicKeyHash , getPublicKeyHashFromAddress , eciesDecrypt} from  "../helper/ecies"
import { ListTransactionInput, ListTransactionOutput, Transaction  , IPFSTransaction} from "../_actions/transaction_actions"

//null   Anyone Can go inside
//true   only logged in user can go inside
//false  logged in user can't go inside
const testdata = [
  {
      "tx_id": "ddd0951b7e30efcd613f857b546e6ff1339c9772f028ada067f2d3ce86382d3f",
      "vout": 0,
      "value": 2
  },
  
  {
      "tx_id": "8c35acfe213c87e24d745b6c014df082e5fdeb20c59f21bfc36f231af492504c",
      "vout": 0,
      "value": 2
  }
]
// async function   cc() {
//   var txinps = new  ListTransactionInput(testdata)
//   var txouts = new  ListTransactionOutput([{value : 4 , address: "c1dbad53c81e5e895c76f238f12a953d49e7a93c"}])
//   var ipfstx = new IPFSTransaction("4LUX7zeyQbkfmyY8sk7C1ojJbGTzmHWbhwAK1VTcAoDhBeUuM6qsS4mcPiJhrFqLPAQo2XMQ8AhotbdQ6vRjNrkr","","QmP4VaPnjcKjiX1eanHgNkeRVh9u",)
//   console.log("Nguoi j dau ku cu c" ,  ipfstx)

//   var tx = new Transaction(txinps,txouts,ipfstx)
//   tx.CalcTXID()
//   tx.Sign("ALMEvFzwz7EWVt3FvCHkzwRhhsrgoyZ685Lk7VrdXqAV")
//   console.log("cc: ",tx.ExportJSON() )
  
//   eciesDecrypt("ALMEvFzwz7EWVt3FvCHkzwRhhsrgoyZ685Lk7VrdXqAV", ipfstx.ipfs_enc)
//     .then( cc => console.log("decrypto ne" , cc))
// }
// cc()
console.log("Dat neneenenne" , getPubicKey("2brnL7iBJjQ8S1rZiNPrgz18J3dR9aZDssi7NkDGQfXg").base58)
function App() {
  
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
