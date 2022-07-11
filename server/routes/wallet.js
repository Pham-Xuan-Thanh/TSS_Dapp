const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const { encryptPrivKey } = require("../helper/cryptor")

const { auth } = require("../middleware/auth");
const API = require("../middleware/api");
const { Thesis } = require('../models/Thesis');

//=================================
//             Wallet
//=================================

router.get("/create", auth, async (req, res) => {
    let wallet = {}
    await API.get("/api/user/wallet")
        .then(response => wallet = response.data.data)
        .catch(err => { console.log("AXIOS:", err) })
    var priv_key = wallet.priv_key

    wallet = { pub_key: wallet.pub_key, address: wallet.address }
    console.log("wallet", wallet, priv_key)

    User.findOneAndUpdate({ _id: req.user._id }, { wallet }, (err, data) => {

        if (err) return res.json({ success: false, err })
        return res.status(200).json({ success: true, address: wallet.address, priv_key })
    })
})

router.post("/add", auth, async (req, res) => {




    User.findOneAndUpdate({ _id: req.user._id }, { wallet: { address: req.body.address, pub_key: req.body.pub_key } }, (err, data) => {


        if (err) return res.json({ success: false, err })
        return res.status(200).json({ success: true, address: req.body.address, pub_key: req.body.pub_key })
    })
})


router.post("/getbalance", auth, async (req, res, next) => {
    await API.post("/api/user/balance", { address: req.body.address })
        .then(resp => {
            if (resp.data.success) {
                req.fileOwned = resp.data.data.filehashes?.map(filehash => filehash.ipfs_enc)
                res.status(200).json({ success: true, balance: resp.data.data })
                // req.filehashes = resp.data.data.filehashes
            } else {
                res.json({ success: false, err: resp.data.error })
            }
            next()
        })
        .catch(err => {
            // console.log("loi cc get balance", err)
            res.json({ success: false, err })
            return 
        })

},
    (req) => {
        Thesis.find({ userid: req.user.id }, (err, theses) => {
            if (err)
                return
            else {
                theses.map(thesis => {
                    if (thesis.chapters) {
                        thesis.chapters.map(chapter => {
                            if (req.fileOwned)
                            {if (req.fileOwned.includes(chapter.filehash_enc)) {
                                chapter.isPublish = true 
                            } else {
                                    chapter.expiredAt = 0
                                if (new Date() - new Date(chapter.publishat) > 60000) {
                                    chapter.publishat = 0
                                }
                            }}

                        })
                        // console.log("CC " , thesis)
                    }
               
                thesis.save()
                })
            }
        
        })
    })
router.post("/transaction/gettxin", auth, async (req, res) => {

    API.post("/api/user/transaction/create/gettxin", { address: req.user.wallet.address })
        .then(resp => { return resp.data })
        .then(resp => { return res.status(200).json({ success: true, listTxinps: resp.data.tx_ins }) })
        .catch(err => {  return res.json({ success: false, err }) })
})

module.exports = router