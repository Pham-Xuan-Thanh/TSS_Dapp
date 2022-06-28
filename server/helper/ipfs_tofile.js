const all = require('it-all')
// const  toBuffer =  require('it-to-buffer')
// const { pipe } =  require('it-pipe')

const { concat: uint8ArrayConcat } = require('uint8arrays/concat')
// const { toString: uint8ArrayToString } = require('uint8arrays/to-string')

// const { extract } =  require('it-tar')

const {create} = require('ipfs-http-client')

const ipfsClient = create({ url : "http://35.220.139.101:5001"})
const fs= require('fs')
const fsPromises = fs.promises

async function ipfsAddFile(path= "")
{
    if (!path) {
        return  [`[Error: ENOENT: no such file or directory, open ${path}] {
            [0]   errno: -4058,
            [0]   code: 'ENOENT',
            [0]   syscall: 'open',
            [0]   path: '${path}'
            [0] }
        `, null]
    } 
    var error = null
    var filecontent =  await fsPromises.readFile(path).catch( err => error  = err)
    if (error ) return [error,null]
    try {
        const fileAdded = await ipfsClient.add({path,content : filecontent})
    return [null,fileAdded]

    } catch(err) {
        return [err, null]
    }
}

async function ipfsWriteFile( cid = "QmX25bgRi5Niby6PFzNPwW67Ch8XfJHMdcZqjDMhDwWdNZ") {
    // return await pipe(ipfsClient.get(cid), tarballed , (source) => all(source))
     var error = null
     const data = await all( ipfsClient.cat(cid)).catch( err =>  error = err)
     if(error) return [error , null]

    //  data = uint8ArrayConcat(data)
    //  console.log("wssethsrtjedytkjdtyjft7yj",data,typeof data, data instanceof Uint8Array)
    return [null , uint8ArrayConcat( data)]
}

module.exports = { ipfsWriteFile, ipfsAddFile}
