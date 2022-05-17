const Cryptr = require('cryptr');


function  encryptPrivKey(privKey,  pass) {
    const crytPrvKey = new Cryptr(pass )
    return crytPrvKey.encrypt(privKey)

}

function  decryptPrivKey(cypher,  pass) {
    const crytPrvKey = new Cryptr(pass )
    return crytPrvKey.decrypt(cypher)

}
module.exports = {
    encryptPrivKey,
    decryptPrivKey
}
