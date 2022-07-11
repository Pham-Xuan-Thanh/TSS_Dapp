import crypto from "crypto"
import { sign, getPubicKey ,  eciesEncrypt , getPublicKeyHash, base58toHex  , getPublicKeyHashFromAddress} from "../helper/ecies"







export class TransactionInput {
    constructor(tx_id, vout, value) {
        if (tx_id instanceof Object) {
            this.tx_id = tx_id.tx_id || ""
            this.vout = tx_id.vout || -1
            this.value = tx_id.value
        }
        else {
            this.tx_id = tx_id || ""
            this.vout = vout
            this.value = value
        }


    }
    ExportToSign() {

        return (
            `       TXID:      ${this.tx_id}\n       Out:       ${this.vout}\n       Signature: \n       PubKey:    `
        )

    }

    SetPublicKey(pub_key) {
        this.pub_key = pub_key
    }
    SetSignature(sig) {
        this.signature = sig
    }

    ExportJSON() {

        return {
            tx_id: this.tx_id,
            vout: this.vout,
            signature: this.signature,
            pub_key: this.pub_key
        }
    }
}


export class ListTransactionInput {
    constructor(inps) {

        this.tx_ins = inps.map(inp => {
            if (inp.tx_id && inp.vout >= 0)
                return new TransactionInput(inp.tx_id, inp.vout, inp.value)
        }) || []


    }
    Validate() {
        var filterValidate = this.tx_ins.filter((txInp) => {
            if (txInp instanceof TransactionInput)
                return false

            else
                return true
        })

        return filterValidate.length === 0
    }
    ExportToSign() {
        if (!this.Validate())
            return { err: "Unmatch type of Transaction Input" }
        var data = this.tx_ins.map((inp, index) => {
            return (
                `     Input ${index}:\n${inp.ExportToSign()}`
            )
        })

        return { data: data.join("\n") }
    }
    ExportJSON() {

        var data = this.tx_ins.map((tx_inp) => {
            return tx_inp.ExportJSON()
        })

        return data

    }
    Sign(dataToSign, priv_key) {
        this.tx_ins.map((inp) => {
            var signature = sign(dataToSign, priv_key)
            // inp.SetPublicKey(pub_key)
            inp.SetSignature(signature)
        })
    }
    TotalValue() {
        var total = 0
        this.tx_ins.map(inp => {
            console.log(inp.value)
            total += inp.value
        })
        return total
    }
    SetPublicKey(pub_key) {
        this.tx_ins.map(inp => inp.SetPublicKey(pub_key))
    }

}



export class TransactionOutput {
    constructor(value, address) {
        if (value instanceof Object) {
            this.value = value.value
            this.address = value.address || ""
        } else {
            this.value = value
            this.address = address || ""
        }

    }
    ExportToSign() {
        return (
            `       Value:  ${this.value}\n       Script: ${this.address}`
        )
    }
    ExportJSON() {
        return {
            value: this.value,
            pub_key_hash: this.address
        }
    }
}


export class ListTransactionOutput {
    constructor(outs) {
        this.tx_outs = outs.map((out) => {
            if (out.value >= 0 && out.address) {
                return new TransactionOutput(out.value, out.address)
            }
        })
    }
    Validate() {
        var filterValidate = this.tx_outs.filter((out) => {
            if (out instanceof TransactionOutput)
                return false

            else
                return true
        })
        return filterValidate.length === 0
    }
    ExportToSign() {
        if (!this.Validate())
            return { err: "Unmatch type of Transaction Output" }

        var data = this.tx_outs.map((out, index) => {
            return (
                `     Output ${index}:\n${out.ExportToSign()}`
            )
        })
        return { data: data.join("\n") }
    }
    ExportJSON() {
        var data = this.tx_outs.map(tx_out => {
            return tx_out.ExportJSON()
        })
        return data


    }

}


export class IPFSTransaction {
    constructor(pub_key_owner, signature, ipfs_hash, pub_key_user, exp) {
        this.pub_key_owner = pub_key_owner || ""
        this.signature = signature || ""
        this.ipfs_hash = ipfs_hash || ""
        this.pub_key_user = pub_key_user || this.pub_key_owner
        this.exp = exp || (Date.now() + 31556926*1000)
    }
    ExportToSign() {
        this.Standardize()
        console.log("trac khi expor tot sign" , Buffer.from(this.ipfs_enc.concat(this.pub_key_user), "hex"))

        // return this.ipfs_enc.concat(this.pub_key_user)
        
        return Buffer.from(this.ipfs_enc.concat(this.pub_key_user), "hex")
    }
    ExportJSON() {
        
        if (!(this.pub_key_owner?.length === 128)) 
            this.pub_key_owner = base58toHex(this.pub_key_owner)
        return [{
            pub_key_owner : this.pub_key_owner,
            signature : this.signature,
            ipfs_enc :this.ipfs_enc ,
            pub_key_user : this.pub_key_user,
            exp : this.exp
        }]
    }
    Encrypt() {
        if (!(this.ipfs_enc?.length === 318))  {
            // console.log("tron encrypt  trc:" , this.pub_key_user, this.ipfs_hash)

            this.ipfs_enc =  eciesEncrypt(this.pub_key_user,this.ipfs_hash)
            // console.log("tron encrypt sau :" , this.pub_key_user, this.ipfs_enc)

        }
    }

    Standardize() {
        console.log(this.ipfs_hash.length , ! (this.ipfs_enc?.length === 318))

        if (!(this.ipfs_enc?.length === 318) )
            {
                this.Encrypt()
            }
        if (!(this.pub_key_user?.length === 40)) 
            this.pub_key_user = getPublicKeyHash(this.pub_key_user,"base58").hex
        
    }
    Sign(priv_key) {
        if (this.signature)
            return 
        var dataToSign  = this.ExportToSign()
        console.log("Data to sign cua ipfs ne: ", dataToSign, "pubkey owner: " , typeof  this.pub_key_owner , this.pub_key_owner)
        this.signature =  sign(dataToSign, priv_key)
    
    }
}




// IPFSTransaction.prototype.ExportToSign = function () {
//     return (
//         ``
//     )
// }
// Constructor for transtion
// Params @tx_id hash of tx
// Params @tx_ins set of tx inputs 
// Params @tx_outs address and amount send to reciever
// Params @tx_ipfs not NUll if send file
// Return an instance of Transaction 
// IPFSTransaction.prototype.ExportToSign = function () {
//     return (
//         ``
//     )
// }
// Constructor for transtion
// Params @tx_id hash of tx
// Params @tx_ins set of tx inputs 
// Params @tx_outs address and amount send to reciever
// Params @tx_ipfs not NUll if send file
// Return an instance of Transaction 
export class Transaction {
    constructor(tx_ins, tx_outs, tx_ipfs, tx_id = "") {
        // if (tx_ins instanceof Object) {
        //     this.tx_id = tx_ins.tx_id
        //     this.tx_ins = tx_ins.tx_ins || []
        //     this.tx_outs = tx_ins.tx_outs || []
        //     this.tx_ipfs = tx_ins.tx_ipfs || []
        // } else {
        this.tx_id = tx_id
        this.tx_ins = tx_ins || new ListTransactionInput()
        this.tx_outs = tx_outs || new ListTransactionOutput()
        this.tx_ipfs = tx_ipfs
        // }
    }
    // Validate states of this 
    // Return true if success (false, error) if false
    Validate() {
        if (!this.tx_id || this.tx_id.length !== 64)
            return { validated: false, err: "Invalid type of Transaction ID" }
        if (!this.tx_ins instanceof ListTransactionInput)
            return { validated: false, err: "Invalid type of Inputs Transaction" }
        return true
    }
    // Convert this instance to JSON with all field 
    // Return an object type JSON with all filed
    ExportJSON() {
        return {
            tx_id: this.tx_id,
            tx_ins: this.tx_ins.ExportJSON(),
            tx_outs: this.tx_outs.ExportJSON(),
            tx_ipfs: this.tx_ipfs ? this.tx_ipfs.ExportJSON() : null
        }
    }
    // Usage: Export all field to String by method JSON.stringify
    // Return: string of this instance that converted to string
    ExportString() {
        return JSON.stringify(this.ExportJSON())
    }
    // Usage: Calculate transaction id from ()
    CalcTXID() {
        const sha256 = crypto.createHash("sha256")

        if (this.tx_id) {
            var { err } = this.Validate()
            if (!err) { return this.tx_id }
        }
        var dataToHash = this.ExportString()
        this.tx_id = sha256.update(dataToHash).digest("hex")
        return this.tx_id
    }
    ExportToSign() {

        var { err } = this.Validate(), data
        if (err) {
            return { err }
        }

        var dataToSign = [`--- Transaction ${this.tx_id}:`]

        var { data, err } = this.tx_ins.ExportToSign()
        if (err)
            return { err }
        dataToSign = dataToSign.concat(data)
        var { data, err } = this.tx_outs.ExportToSign()
        if (err)
            return { err }
        dataToSign = dataToSign.concat(data)

        // if (this.tx_ipfs) {
        //     var { data, err } = this.tx_ipfs.ExportToSign()
        //     if (err)
        //         return { err }
        //     dataToSign = dataToSign.concat(data)
        //     // data = data.concat(this.IPFSTransaction.ExportToSign())
        // }

        // var dataToSign = data.join("\n")

        return { dataToSign: dataToSign.join("\n") }
    }
    Sign(priv_key) {
        var pub_key = getPubicKey(priv_key)
        this.tx_ins.SetPublicKey(pub_key.hex)
        this.CalcTXID()

        var { dataToSign, err } = this.ExportToSign()
        if (err) {
            console.log("err khi export", err)
            return
        }
        dataToSign = Buffer.from(dataToSign).toString("hex").concat("\n")
        this.tx_ipfs.Sign(priv_key)

        this.tx_ins.Sign(dataToSign, priv_key)
        // console.log("day ne", dataToSign)
        // var hashToSign = sha256.update(dataToSign).digest("hex")
        console.log("Data to sign: ", dataToSign, "to HEX", Buffer.from(dataToSign, "hex").toString(),"hash to sign ne", crypto.createHash("sha256").update(dataToSign).digest(),  "dung ma", JSON.stringify(this.ExportJSON()))
        // var signature = sign(dataToSign, priv_key)

        // console.log("Signature:  ", signature)
    }


}

export function createPublishTransaction(dataToSubmit) {
    var txinps = new  ListTransactionInput(dataToSubmit.listTxInps)
    var remainerFee = dataToSubmit.totalfee - dataToSubmit.amount  
    var reciverPublicKey = dataToSubmit.listAllowedPublicKey.length ? dataToSubmit.listAllowedPublicKey[0] : dataToSubmit.ownerPublicKey
    var outputs = [{value : dataToSubmit.amount , address : "3a2db5daf6aa0bee02e58c4fa1a5e0814c442871"}]
    outputs = remainerFee > 0 ? [ ...outputs, {value : remainerFee , address :  getPublicKeyHashFromAddress( dataToSubmit.ownerAddress) }] : outputs
    var txouts = new  ListTransactionOutput(outputs)
    var ipfstx = new IPFSTransaction(dataToSubmit.ownerPublicKey,"",dataToSubmit.ipfs_hash,reciverPublicKey)

    var tx = new Transaction(txinps,txouts,ipfstx)
    tx.CalcTXID()
    tx.Sign(dataToSubmit.password)
    return {
        tx: tx.ExportJSON(),
        address : "16Jcx92y5gv1vfVfzqFkghqXYSCdTkmgV7",
        ipfs : dataToSubmit.ipfs_hash,
        fee : dataToSubmit.amount
    }
}






