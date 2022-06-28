const {ipfsAddFile , ipfsWriteFile}  = require("../helper/ipfs_tofile")

let ipfsget = (req,res , next) => {
    const ipfshash = req.fileDownload.filehash
    if (ipfshash) {
        var [err, dataGot] = await ipfsWriteFile(ipfshash)
        if (err) return res.json({success: false , err })

        const pathfile = path.join(`${__dirname}`,`../dump/chapter_${req.userid}_${req.params.chapter}.${req.fileDownload.fileextension}`)
        await fsPromises.writeFile(pathfile, dataGot, (er) => err = er)
        if ( err) return res.json({success : false ,err})
        return res.fileDownload(pathfile)
    }
    return res.json({success : false , err: "NOT EXISTS :<"})
}
module.exports = { ipfsget}