// import bs58 from "bs58"
import crypto from "crypto"
import BN from "bn.js"

// import eccrypto from "eccrypto"
// import elliptic from "elliptic"
import ecies from "ecies-lite"
import { createThesis } from "../_actions/thesis_actions"
ecies.config("p256")
const ecdh = crypto.createECDH("p256")
ecdh.generateKeys()
var EC = require('elliptic').ec;
const { base58_to_binary, binary_to_base58 } = require('base58-js')
// const {
//     generateKeyPairSync,
//     createSign,
//     createVerify
//   } = await import('node:crypto');
var ec = new EC('p256');

const publicKey = "4LUX7zeyQbkfmyY8sk7C1ojJbGTzmHWbhwAK1VTcAoDhBeUuM6qsS4mcPiJhrFqLPAQo2XMQ8AhotbdQ6vRjNrkr"
const stdPublicKey = "QoupsKUb8tbiQUoD7qQfyQBqippbWVBxuDq25rpFoVokNzPcqFGJLBhQPkyJtSJYKmXU3Gx6kzhDkeXJLJeRvHxW"
const encrypted_str = "04d0be5e8b5d09cbf3f91474f5bb4d2c391727b93f56b738229c220e2334d549132615a1b44901ed5b43ac91fbadebeea1596d6075a336a9c3b8eda92fc83ef76419c30a268fae799daa9a6bef04d736d3d699c704fc404ef130a65d40a5dd22c21283e015cb72cd10c359ede88105dce1a8408bf2eb1d77712282f006f0bf3c4f37ebf43cf1dc2216e00c413e88768f4280d95823b4be0f4d351ca1845891"
var data = "QmPCZV7t6FtUnsf2JxtWv1rjKNk1vjfExA7cVbg69TCGyj"
const priv_key = "ALMEvFzwz7EWVt3FvCHkzwRhhsrgoyZ685Lk7VrdXqAV"
var g = new EC("secp256k1").curve.point('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8')

// export function base58decode(priv)

const testdata = [
    {
        "tx_id": "ddd0951b7e30efcd613f857b546e6ff1339c9772f028ada067f2d3ce86382d3f",
        "vout": 0,
        "value": 2
    },
    {
        "tx_id": "1aa30516947c304c8ca257659a07b8e0db1f4ba1e877ff4e50d112a120654ad1",
        "vout": 0,
        "value": 8
    },
    {
        "tx_id": "68c59915c0e88342505d99617a5296675dfb92e6bbf507230a9bc541265ffc77",
        "vout": 0,
        "value": 2
    },
    {
        "tx_id": "86f5760de5682011f2478105db8b203db87058d568012ec844c80fe2ca9f125b",
        "vout": 0,
        "value": 10
    },
    {
        "tx_id": "88b115d9a4fb5b9a4d7bd3891a4d5528548bb799b6ab92e9eae7f53dd48e9105",
        "vout": 0,
        "value": 10
    },
    {
        "tx_id": "8c35acfe213c87e24d745b6c014df082e5fdeb20c59f21bfc36f231af492504c",
        "vout": 0,
        "value": 2
    }
]


// Encrypt @msg with @pub_key by Hybrid encryption 
// params @pub_key type encoded with Base58
// params @msg Buffer what want to share  
// Return Promise() hexencode ciphertext
export function eciesEncrypt(pub_key, msg) {

    var raw_pub_key = new Uint8Array([0x04,...base58_to_binary(pub_key)])
    var Bpub_key = Buffer.from(raw_pub_key)
    var Bmsg = Buffer.from(msg)
    console.log("Ecncrypt :", Bpub_key, Bmsg)
    var rawCiph = ecies.encrypt(Bpub_key, Bmsg)
    var cipher = [ ...rawCiph.epk , ...rawCiph.iv , ...rawCiph.mac , ...rawCiph.ct ]
    console.log("Enc result: ", cipher, rawCiph)
    return Buffer.from(cipher).toString("hex")

}
// Usage: Decrypt the cipher along cipher
// Params: @priv_key encode: base58 
// Params: @cipher encode: hex standard: CBC
export function eciesDecrypt(priv_key, cipher) {
    var ciphertext =  [...Buffer.from(cipher, "hex")]
    var cipherObject = {}
    cipherObject.epk = Buffer.from(ciphertext.splice(0,65))
    cipherObject.iv = Buffer.from(ciphertext.splice(0,16))
    cipherObject.mac = Buffer.from(ciphertext.splice(0,32))
    cipherObject.ct = Buffer.from(ciphertext)
    var Bpriv_key = Buffer.from(new Uint8Array(base58_to_binary(priv_key)))
    console.log("decrypt: ", cipherObject, typeof ciphertext)
    return new Promise((res) => {
        var plain = ecies.decrypt(Bpriv_key, cipherObject)
        res(plain.toString())

    })

}

export function getPublicKeyHashFromAddress( address ) {
    var pub_key_hash = Buffer.from(base58_to_binary(address))
    return pub_key_hash.slice(1,-4).toString("hex")
}

export function base58toHex(pubKey) {
    return Buffer.from(base58_to_binary(pubKey)).toString("hex")
    
}


export function getPubicKey(priv_key) {
    var raw_priv_key = Buffer.from(new Uint8Array([...base58_to_binary(priv_key)]))
    var keypair = ec.keyFromPrivate(raw_priv_key)
    var pub_key_binary = Buffer.from(keypair.getPublic().encode("array").slice(1))
    return { hex : pub_key_binary.toString("hex"), base58 : binary_to_base58(pub_key_binary)}
}

export function getPublicKeyHash(pub_key,enc="hex") {
    const sha256 = crypto.createHash("sha256")
    const rmd160 = crypto.createHash("rmd160")

    var raw_pub_key 
    if ( enc === "base58")
        raw_pub_key = Buffer.from(new Uint8Array([...base58_to_binary(pub_key)]))
    else 
        raw_pub_key = Buffer.from(pub_key, "hex")
    var pub_key_hash = sha256.update(raw_pub_key).digest()
    pub_key_hash = rmd160.update(pub_key_hash).digest()

    return {hex : Buffer.from(pub_key_hash).toString("hex"),
     base58: binary_to_base58(Buffer.from(pub_key_hash))  }
}

// Usage: Sign data with private key 
// Params: @dataToSign data need to sign Buffer, string, 
// Params: @priv_key private key encode Base58
// Return: signature corresponding with input, {r,s} need to be verify by ecdsa algorithm 
export function sign(dataToSign, priv_key) {
    
    var hashToSign = crypto.createHash("sha256").update(dataToSign).digest()

    // Randomness for signing
    
    // var prv = eccrypto.generatePrivate()

    // }
    // var randKey = "2brnL7iBJjQ8S1rZiNPrgz18J3dR9aZDssi7NkDGQfXg"
    // var raw_priv_key = Buffer.from(new Uint8Array([...base58_to_binary(priv_key)]))
    // var Akey = ec.keyFromPrivate(raw_priv_key)
    // var t2 = binary_to_base58(Buffer.from(Akey.getPublic().encode("array")))
    // var rawpubkey = Buffer.from(base58_to_binary(publicKey))
    // console.log("test: ", rawpubkey, Buffer.from( base58_to_binary(t2)).toString("hex"), binary_to_base58( Buffer.from(new Uint8Array([0x04,...rawpubkey]),"hex")))
    // var p = ecdh.computeSecret( Buffer.from(["04",...rawpubkey],"hex").toString("hex"),"hex")
    // console.log("priv ky:",Buffer.from( base58_to_binary(t2)).toString("hex"),p.toString("hex"))
    // var enced = eciesEncrypt(stdPublicKey, data)
    // t2 = base58_to_binary(t2)
    // // console.log("result: " , enced)
    // eciesDecrypt(priv_key, enced)
    //     .then((res) => console.log("de nay", res.toString()))
    //     .catch(err => console.log("loi vcl", err))



    // var Apub_key = Akey.getPublic()
    // var Bbase = Buffer.from( new Uint8Array(base58_to_binary("2brnL7iBJjQ8S1rZiNPrgz18J3dR9aZDssi7NkDGQfXg")) )
    // var Bkey = ec.keyFromPrivate(Bbase)
    // var Bpub_key = Bkey.getPublic()
    // console.log("Pub",Apub_key.encode("hex"), ";;;;;;;;;;",Bpub_key.encode("hex"))
    // var sk1 = Akey.derive(Bpub_key)
    // var sk2 = Bkey.derive(Apub_key)
    // console.log("Share key 1:", sk1.toString(16))
    // console.log("Share key 2:", sk2.toString(16))



    // var data =  crypto.createHash('sha256').update(data).digest("hex")
    var privKeyBinary = Buffer.from(base58_to_binary(priv_key))
    // var ranKey = crypto.createHash('sha256').update("asaldjajfw").digest('hex')
    console.log("nhu cc data",hashToSign) 
    // , {k : () =>{ var c =  new BN(ranKey,16); console.log("vcl", c.toString(16));return c;}}
    var signature = ec.sign(hashToSign, privKeyBinary, {k : () =>{ var c =  ec.genKeyPair().getPrivate();return c;}})
    // var b = ec._truncateToN(new BN(data,16))
    var res = signature.r.toString(16,64).concat(signature.s.toString(16,64))
    console.log("final Sign: " , signature.r.toArray() , signature.s.toArray() )
    return res 

    // console.log("mysign", signature.r.toArray(),signature.s.toArray(), "abasdwd", a)
    // const aa = "48f51975f5daf0e172402d36526d147bbd26a05aca8be8dce1367cd88d2c1d10"
    // var k = new BN(aa,16)
    // console.log("Key gen :" ,k.toArray())
    // var kinv = k.invm(ec.n)
    // console.log("key inverse" , kinv.toArray())



}
