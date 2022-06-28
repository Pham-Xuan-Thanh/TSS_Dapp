const multer = require('multer');
const path = require('path')

var storage = multer.diskStorage({
    destination: (req ,file , cb ) => {
        cb(null, "./dump")
    },
    filename : ( (req , file , cb)  => {
        console.log("Multer",req.user)
        cb(null,file.fieldname +  "_" + req.user._id + "_" + file.originalname  )
    })
})

const upload = multer({storage : storage})

module.exports = upload;