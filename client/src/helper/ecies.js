import bs58 from "bs58"
import crypto from "crypto"

// import eccrypto from "eccrypto"
var EC = require('elliptic').ec;
const { base58_to_binary } = require('base58-js')
// const {
//     generateKeyPairSync,
//     createSign,
//     createVerify
//   } = await import('node:crypto');
var ec = new EC('secp256k1');


const publicKey = "epmdyrHEwwzceZJhtwnpgbP3chWjQhME1yccA8ePbgVr1Gv9GxRpgB4mzmq5P5Y41QEfYhm9vaKUE4YchkrzUFq"
const encrypted_str = "04d0be5e8b5d09cbf3f91474f5bb4d2c391727b93f56b738229c220e2334d549132615a1b44901ed5b43ac91fbadebeea1596d6075a336a9c3b8eda92fc83ef76419c30a268fae799daa9a6bef04d736d3d699c704fc404ef130a65d40a5dd22c21283e015cb72cd10c359ede88105dce1a8408bf2eb1d77712282f006f0bf3c4f37ebf43cf1dc2216e00c413e88768f4280d95823b4be0f4d351ca1845891"
const data = "QmPCZV7t6FtUnsf2JxtWv1rjKNk1vjfExA7cVbg69TCGyj"
const priv_key = "7jczDSiSxs6ZNzQdTT6TydNHgNLKBNLjPWzJ2JHkiX"

// export function base58decode(priv)


export function sign() {

    // var prv = eccrypto.generatePrivate()

    // }
    var key = ec.genKeyPair()
    console.log( "key random",key)
    var raw_priv_key = Buffer.from( new Uint8Array([0x00,...base58_to_binary(priv_key)]) )
    console.log("My private key:", raw_priv_key)
    // var pub_key = eccrypto.getPublic(raw_priv_key)
    // console.log("Generate Public Key: ", pub_key )
    // var msg = crypto.createHash("sha256").update(data).digest();
    // eccrypto.sign(raw_priv_key, msg)
        // .then( (sign) => {
        //     console.log("sing ne", sign)
        // })
        // .catch( err => {
        //     console.log("loi  r ne", err)
        // })
}
