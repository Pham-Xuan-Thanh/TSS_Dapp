const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const {encryptPrivKey} = require("../helper/cryptor")

const { auth } = require("../middleware/auth");
const API = require("../middleware/api");
const req = require('express/lib/request');

//=================================
//             Wallet
//=================================

router.post("/create",auth, async (req,res) => {
    
    let wallet
    await API.get("/api/user/wallet")
            .then( response => wallet = response.data)
            .catch( err => { console.log("AXIOS:",err)})
    wallet.priv_key = encryptPrivKey(wallet.priv_key , req.body.password)
    User.findOneAndUpdate({_id : req.body.user_id}, {wallet}, (err , data ) => {
        data.comparePassword(req.body.password , (err, isMatch) => {
            return res.json({success: false , message : "Wrong PASSWORD"})
        })
        if (err) return res.json({success: false , err})
        return res.status(200).json({success : true, address: wallet.address})
    } )
})

router.post("/add", auth, async (req, res ) => {
    let wallet 
    
    await API.post("/api/user/wallet",{priv_key : req.body.priv_key}) 
        .then( resp => wallet = { priv_key : req.body.priv_key , address : resp.data.data.address })
        .catch( err => console.log("err", err))
    
    wallet.priv_key = encryptPrivKey(wallet.priv_key , req.body.password)

    User.findOneAndUpdate({_id : req.body.user_id}, {wallet}, (err , data ) => {

        data.comparePassword(req.body.password , (err, isMatch) => {
            if (!isMatch)
            return res.json({success: false , message : "Wrong PASSWORD"})
        })
        if (err) return res.json({success: false , err})
        return res.status(200).json({success : true, address: wallet.address})
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