const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const {encryptPrivKey} = require("../helper/cryptor")

const { auth } = require("../middleware/auth");
const API = require("../middleware/api");

//=================================
//             Wallet
//=================================

router.get("/create",auth, async (req,res) => {
    let wallet = {}
    await API.get("/api/user/wallet")
            .then( response => wallet = response.data.data)
            .catch( err => { console.log("AXIOS:",err)})
    var priv_key = wallet.priv_key
    console.log("BE: create wallet", wallet)

    wallet= { pub_key : wallet.pub_key , address : wallet.address}
    console.log("wallet" , wallet, priv_key)

    User.findOneAndUpdate({_id : req.user._id}, {wallet}, (err , data ) => {
        
        if (err) return res.json({success: false , err})
        return res.status(200).json({success : true, address: wallet.address, priv_key})
    } )
})

router.post("/add", auth, async (req, res ) => {
    
   
    

    User.findOneAndUpdate({_id : req.user._id}, {wallet : {address : req.body.address}}, (err , data ) => {

       
        if (err) return res.json({success: false , err})
        return res.status(200).json({success : true, address: req.body.address})
    } )
})


router.post("/getbalance",auth , async (req , res) => {
    let balance
    await API.post("/api/user/balance",{address : req.body.address})
        .then ( resp => {balance = resp.data.data })
        .catch ( err => {
            balance = {success : false, err}
        })
        
        if (balance?.success !== null ) {
        return res.json(balance)
        } else {
            return res.status(200).json({success : true ,  balance: balance})
        }
})

module.exports = router