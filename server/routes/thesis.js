const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const { Thesis } = require("../models/Thesis")
const { User } = require("../models/User")
const fs = require("fs")
const fsPromises = fs.promises
const path = require('path')

const { auth } = require("../middleware/auth");
const { ipfsWriteFile, ipfsAddFile } = require("../helper/ipfs_tofile")
const upload = require("../middleware/multer")
const API = require("../middleware/api");
const { decryptPrivKey } = require("../helper/cryptor")

router.post("/create", auth, (req, res) => {
    var thesisInit = req.body
    // console.log("Create ne`" , req.body )
    thesisInit = { ...thesisInit, userid: req.user._id }
    const thesis = Thesis(thesisInit);
    User.findOne({ _id: req.body.userid }, (err, user) => {
        if (err) return res.json({ success: false, err })
        else {
            thesis.save((err, thesis) => {
                if (err) return res.json({ success: false, err })
                thesis.userid = user._id
                return res.status(200).json({ success: true, thesis })
            })
        }
    })

})

router.get("/chapter/search", auth, (req, res, next) => {

    const searchParams = req.query.query
    const queryThesis = {
        "$or": [
            { "keywords": { "$contain": searchParams } },
            { "article": searchParams },
            { "userid.name": searchParams },
            { "userid.email": searchParams }
        ]
    }
    if (!searchParams) return res.json({ success: false, err: "Empty query search" })
    Thesis.find().populate("userid").exec((err, combined) => {
        if (err) console.log("NHU CCC")
        const result = combined.filter(thesis => {
            thesis.userid.token = null
            thesis.userid.tokenExp = null
            thesis.userid.wallet = null
            return (
                thesis.keywords.includes(searchParams) ||
                thesis.article === searchParams ||
                thesis.userid.name === searchParams ||
                thesis.userid.email === searchParams
            )
        })

        return res.status(200).json({ success: true, thesises: result })

    })
})

router.post("/edit/:id", auth, (req, res, next) => {
    var thesisEdited = req.body
    console.log("RESQUEST ne ", req.body, "params ::::::::", req.params)
    Thesis.findOneAndUpdate({ userid: req.user._id, _id: req.params.id }, thesisEdited, (err, thesis) => {
        console.log("Edit", thesisEdited)
        if (err) {
            console.log("loi r ne ", err)
            return res.json({ success: false, err })
        } else {
            next()
        }
    })

}, (req, res) => {
    Thesis.findOne({ userid: req.user._id, _id: req.params.id }, (err, thesis) => {
        console.log("edit", thesis)
        if (err) return res.json({ success: false, err })
        return res.status(200).json({ success: true, thesis })
    })
})
router.delete("/delete/:id", auth, (req, res) => {
    // var studentID = req.cookies.studentID
    var _id = req.params.id
    Thesis.findOneAndDelete({ _id, userid: req.user._id }, (err, doc) => {
        console.log("delete", doc)
        if (err) return res.json({ success: false, err })
        return res.status(200).json({ success: true, thesisID: doc._id })
    })
})

router.get("/list", auth, (req, res) => {
    // const id = req.cookies.studentID
    Thesis.find({ userid: req.user._id }, (err, thesises) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).json({ success: true, thesises: thesises })
    })
})


// router.get("/:id", auth, (req,res) => {
//     const sid = req.cookies.studentID 
//     const id = req.params.id
//     console.log("params: " , sid  ,id )
//     Thesis.findOne({studentID : sid, _id :id, userid : req.user._id }, (err, thesis) => {
//         if (err) return res.json({success : false, err})
//         return res.status(200).json({success : true, thesis})
//     })
// })


// router.get("/:thesis/thanh/:chapter" ,auth, (req,res ) => {
//     res.send({a: req.params.thesis , b: req.params.chapter})

// })

router.get("/:thesis/chapter/:chapter", auth, (req, res, next) => {

    Thesis.findOne({ userid: req.user.id, _id: req.params.thesis }, (err, thesis) => {
        if (err) return res.json({ success: false, err })
        var chapter = thesis.chapters.id(req.params.chapter)

        req.fileDownload = chapter || {}
        next()
    })
}, (req, res, next) => {
    const filepath = path.join(`${__dirname}`, `../../${req.fileDownload.filepath}`)
    console.log("file path", filepath, req.fileDownload)
    try {
        if (fs.existsSync(filepath)) {
            return res.download(filepath)
        }
        // return res.json({success : false , err : "Not exist"})
        // next()
    } catch (err) {
        res.json({ success: false, err })
        console.log("catach ", err)
    }
}
    // , async (req, res) => {
    //     if (req.fileDownload.filehash) {
    //         var [err, dataGot] = await ipfsWriteFile(req.fileDownload.filehash)
    //         if (err) return res.json({ success: false, err })

    //         const pathfile = path.join(`${__dirname}`, `../dump/chapter_${req.userid}_${req.params.chapter}.${req.fileDownload.fileextension}`)
    //         await fsPromises.writeFile(pathfile, dataGot, (er) => err = er)
    //         if (err) return res.json({ success: false, err })
    //         return res.fileDownload(pathfile)
    //     }
    //     return res.json({ success: false, err: "NOT EXISTS :<" })
    // }
)

router.post("/:thesisid/getchapter/:chapterid", auth,
    (req, res, next) => { // Check Password
        User.findOne({ _id: req.user.id }, (error, user) => {
            user.comparePassword(req.body.password, (err, isMatch) => {
                if (!isMatch) res.json({ success: false, wrongpass: true, err: "Password not correct!!" })
                else {
                    req.priv_key = decryptPrivKey(user.wallet.priv_key, req.body.password)
                    next()
                }
            })
        })
    }
    , (req, res, next) => {
        Thesis.findOne({ userid: req.user.id, _id: req.params.thesisid }, (err, thesis) => {
            if (err) return res.json({ success: false, err })
            var chapter = thesis.chapters.id(req.params.chapterid)

            req.fileDownload = chapter || {}
            next()
        })
    }, (req, res, next) => {
        var { filehash_enc } = req.fileDownload
        API.post("/api/user/balance/filehash", { ipfshash_enc: filehash_enc, priv_key: req.priv_key })
            .then(resp => resp.data)
            .then(resp => {
                resp = resp || {}
                if (resp.success) {
                    req.filehash = resp.data
                    next()
                } else {
                    res.json({ success: false, permissiondenied: true, err: "Permission Denied" })
                }
            })
            .catch(err => res.json({ success: false, notgetfilehash: true, err }))
    }, async (req, res) => {
        if (req.filehash) {
            var [err, dataGot] = await ipfsWriteFile(req.filehash)
            if (err) return res.json({ success: false, cantgetipfs: true, err })

            const pathfile = path.join(`${__dirname}`, `../../dump/chapter_${req.user._id}_${req.params.chapterid}.${req.fileDownload.fileextension}`)
             fsPromises.writeFile(pathfile, dataGot)
                .then(() => {
                    return res.download(pathfile)
                })
                .catch( err => res.json({ success: false, notExist : true, err }) )
            
        } else { return res.json({ success: false, notgetipfs: true, err: "NOT EXISTS :<" }) }
    })

router.post("/:thesisid/publishchapter/:chapterid", auth,
    (req, res, next) => { // Check Password
        User.findOne({ _id: req.user.id }, (error, user) => {
            user.comparePassword(req.body.password, (err, isMatch) => {
                if (!isMatch) res.json({ success: false, wrongpass: true, err: "Password not correct!!" })
                else {
                    req.priv_key = decryptPrivKey(user.wallet.priv_key, req.body.password)
                    next()
                }
            })
        })
    },
    (req, res, next) => { // Get Chapter data

        Thesis.findOne({ userid: req.user.id, _id: req.params.thesisid }, (error, thesis) => {

            if (error) return res.json({ success: false, err })
            else {

                var chapter = thesis.chapters.id(req.params.chapterid) || {}
                req.thesis = thesis
                req.chapter = chapter
                next()
            }
            // console.log("dam ba cai thg nhoc" , req)
        })
    },
    (req, res, next) => {
        const chapter = req.chapter
        if (chapter.isPublish) {
            return res.json({ success: true, thesis: req.thesis })
        } else {
            const filepath = path.join(`${__dirname}`, `../../${chapter.filepath}`)

            fs.promises.stat(filepath)
                .then(() => next())
                .catch((error) => { console.log("cc ne heee", error); res.json({ success: false, notExist: true, error }); })

        }


    },
    // (req, res, next) => {
    //     var listAddress = []
    //     User.find({ email: { $in: req.body.listAllowedEmail } }, (err, users) => {
    //         users.map(user => listAddress.push(user.wallet.address))
    //         req.listAddress = listAddress || {}
    //         console.log("jshdoigbjerjk", req.listAddress)
    //         if (err) {
    //             return res.json({ success: false, err })
    //         } else {
    //             next()
    //         }
    //     })
    // },
    async (req, res, next) => {

        var chapter = req.chapter || {}
        var filepath = path.join(`${__dirname}`, `../../${chapter.filepath}`)
        const [err, fileInfo] = await ipfsAddFile(filepath)
        if (err) {
            res.json({ success: false, notsend2IPFS: true, err })
            // return res.json({ success: false, err })
        } else {
            const postData = {
                "priv_key": req.priv_key,
                "reciever": "16Jcx92y5gv1vfVfzqFkghqXYSCdTkmgV7",
                "amount": req.body.amount,
                "file_path": filepath
            }

            API.post(`${process.env.WALLETAPP_URI}/api/user/transaction/create/upload`, postData)
                .then(resp => resp.data)
                .then((resp) => {
                    console.log("Hwehgjh")
                    fileInfo.cid = fileInfo.cid.toString()
                    if (resp.success) {
                        fileInfo.filehash_enc = resp.data
                        req.ipfsInfo = fileInfo
                        req.chapter.isPublish = true
                        next()
                    }
                })
                .catch(err => { res.json({ success: false, notCreateTX: true, err }) })

        }
        // Thesis.findOne({ userid: req.user.id, _id: req.query.thesisid }, (error, thesis) => {

        //     var chaptermge = thesis.chapters.id(req.query.chapterid)
        //     // chapter.isPublish = true && !err
        //     chaptermge.set(chapter)

        //     return thesis.save()
        // })

        // .catch((error) => res.json({ success: false, error }))
    },
    (req, res) => {
        var chapter = req.chapter || {}
        Thesis.findOne({ userid: req.user.id, _id: req.params.thesisid }, (error, thesis) => {
            var chaptermge = thesis.chapters.id(req.params.chapterid)
            chapter.filehash = req.ipfsInfo.cid
            chapter.filehash_enc = req.ipfsInfo.filehash_enc
            chaptermge.set(chapter)

            return thesis.save()
        })
            .then((thesis) => {
                return res.status(200).json({ success: true, permission: true, ipfsfile: req.ipfsInfo, thesis })
            })
            .catch(err => { res.json({ success: false, notsend2IPFS: false, notUpdate: true, err }) })
    })

router.post("/:thesisid/pushchapter/:chapterid", auth,
    (req, res, next) => {
        console.log("CC NE AHAHAH")
        Thesis.findOne({ userid: req.user.id, _id: req.params.thesisid }, (error, thesis) => {

            if (error) return res.json({ success: false, notListDB: true, err })
            else {

                var chapter = thesis.chapters.id(req.params.chapterid) || {}
                req.thesis = thesis
                req.chapter = chapter
                next()
            }
            // console.log("dam ba cai thg nhoc" , req)
        })
    },
    (req, res, next) => {
        const chapter = req.chapter
        if (chapter.filehash) {
            return res.json({ success: true, thesis: req.thesis })
        } else {
            const filepath = path.join(`${__dirname}`, `../../${chapter.filepath}`)

            fs.promises.stat(filepath)
                .then(() => next())
                .catch((error) => { console.log("ne heee", error); res.json({ success: false, notExist: true, error }); })

        }

    }, async (req, res, next) => {

        var chapter = req.chapter || {}
        var filepath = path.join(`${__dirname}`, `../../${chapter.filepath}`)
        const [err, fileInfo] = await ipfsAddFile(filepath)
        if (err) {
            return res.json({ success: false, notsend2IPFS: true, err })
            // return res.json({ success: false, err })
        } else {

            fileInfo.cid = fileInfo.cid.toString()
            req.ipfsInfo = fileInfo
            next()
        }
        // Thesis.findOne({ userid: req.user.id, _id: req.query.thesisid }, (error, thesis) => {

        //     var chaptermge = thesis.chapters.id(req.query.chapterid)
        //     // chapter.isPublish = true && !err
        //     chaptermge.set(chapter)

        //     return thesis.save()
        // })

        // .catch((error) => res.json({ success: false, error }))
    }, (req, res) => {
        var chapter = req.chapter || {}
        Thesis.findOne({ userid: req.user.id, _id: req.params.thesisid }, (error, thesis) => {
            var chaptermge = thesis.chapters.id(req.params.chapterid)
            chapter.filehash = req.ipfsInfo.cid
            chaptermge.set(chapter)

            return thesis.save()
        })
            .then((thesis) => {
                return res.status(200).json({ success: true, permission: true, ipfsfile: req.ipfsInfo }, thesis)
            })
            .catch(err => { res.json({ success: false, notUpdate: false, notUpdate: true, err }) })
    })

router.post("/chapter/upload", auth, upload.single('chapter'), (req, res) => {
    const file = req.file
    if (!file) {
        res.json({ success: false })
    }
    console.log("NE ha", req.file, req.body)
    res.send(file)
})
module.exports = router;