const express = require("express");
const app = express();
const path = require("path");
const cors = require('cors')
const multer = require('multer')
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv")
dotenv.config()

// const {create} = require('ipfs-http-client')
// const ipfsClient = create()
const { toString: uint8ArrayToString } = require('uint8arrays/to-string')

const {ipfsAddFile, ipfsWriteFile} = require("./helper/ipfs_tofile")
const fs = require('fs')
const fsPromises = fs.promises
const {User} = require("./models/User")
const {Thesis} = require("./models/Thesis")
app.get("/cc",async (req,res) => {  
  //========================================================================================================================================
  // var file = fs.createWriteStream('./abcd')
  // var [err, a] =  await ipfsWriteFile("QmX25bgRi5Niby6PFzNPwW67Ch8XfJHMdcZqjDMhDwWdNZ")
  // if (err) {console.log(err); return [err,null] }
  // for await  ( const chunk of  ipfsClient.cat("QmX25bgRi5Niby6PFzNPwW67Ch8XfJHMdcZqjDMhDwWdNZ")){
  //   file.write(chunk)
  //   console.log( chunk instanceof Uint8Array)
  //   for (const bytess of chunk) 
  //   {
  //   // file.write(bytess) 
  //   a.push(bytess)
  //   }
  // }

  // console.log("----------------------", typeof a)
  // res.json({a })
  // const path = require('path')
  // await fsPromises.writeFile(path.join(`${__dirname}`,"../dump/abcdef.pdf"), a , (err) => {if (err) console.log(err)})
  const fileinfo = await ipfsAddFile(path.join(`${__dirname}`,"../dump/abcdef.pdf"))
  
  console.log("IFPS added", fileinfo)
  res.json({a: fileinfo})
  // return fileinfo
  //=============================================================================================================================================
  // res.download("../dump/abc.pdf") 
  // const params = req.query.query
  
  // Thesis.find().populate("userid" ).exec( (err, combined ) => {
  //   if (err) console.log("NHU CCC")
  //   res.json({params,a : combined})
  // })
  // const query = {
  //   $or : [
  //     { keywords : { $contain : params }},
  //     { email : params},
  //   ]
  // }




})
const config = require("./config/key");
// const mongoose = require("mongoose");
// mongoose
//   .connect(config.mongoURI, { useNewUrlParser: true })
//   .then(() => console.log("DB connected"))
//   .catch(err => console.error(err));

const mongoose = require("mongoose");

const connect = mongoose.connect(config.mongoURI,
  {
    useNewUrlParser: true, useUnifiedTopology: true,
    useCreateIndex: true, useFindAndModify: false
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

app.use(cors())

//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));
//to get json data
// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api/wallet',require('./routes/wallet'))
app.use('/api/thesis',require('./routes/thesis'))
app.use('/api/users', require('./routes/users'));

// app.use(function (err, req, res, next) {
//   // Check if the error is thrown from multer
//   if (err instanceof multer.MulterError) {
//     res.statusCode = 400
//     res.send({ code: err.code })
//   } else if (err) {
//     // If it is not multer error then check if it is our custom error for FILE_MISSING
//     if (err.message === "FILE_MISSING") {
//       res.statusCode = 400
//       res.send({ code: "FILE_MISSING" })
//     } else {
//       //For any other errors set code as GENERIC_ERROR
//       res.statusCode = 500
//       res.send({ code: "GENERIC_ERROR" })
//     }
//   }
// })

//use this to show the image you have in node js server to client (react js)
//https://stackoverflow.com/questions/48914987/send-image-path-from-node-js-express-server-to-react-client
app.use('/uploads', express.static('uploads'));

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {

  // Set static folder   
  // All the javascript and css files will be read and served from this folder
  app.use(express.static("client/build"));

  // index.html for all page routes    html or routing and naviagtion
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Server Listening on ${port}`)
});