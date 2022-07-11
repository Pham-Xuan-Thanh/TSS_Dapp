import {
    GET_ADDRESS,
    CREATE_WALLET,
    GET_BALANCE,
    LOGOUT_BALANCE,
    ERROR_WALLET,
    GET_TX_INPS
} from "./types"

import { SERVER_API } from "../components/Config"

import axios from "axios"


export function getAddress(dataToSubmit) {
    const request = axios.post(`/api/wallet/add`, dataToSubmit)
        .then(response => response.data)

    return {
        type: GET_ADDRESS,
        payload: request
    }

}

export function createWallet() {
    const request = axios.get(`/api/wallet/create` )
        .then(response => { return response.data})
        .catch(err => console.log("axios ", err))
        
    return {
        type: CREATE_WALLET,
        payload: request
    }

}

export async function getBalance(dataToSubmit) {
    const request = await axios.post(`/api/wallet/getbalance`, { address: dataToSubmit })
        .then(response => {return response.data})


    return {

        type: GET_BALANCE,
        payload: request
    }


}

export function getListTxInp() {
    console.log("zo chua tml ")
    const request = 
        axios.post(`/api/wallet/transaction/gettxin`)
            .then(resp => { console.log("abcez:" , resp.data) ; return resp.data})
            .catch(err => console.log("loi j day cc" , err))

    return  {
        type: GET_TX_INPS,
        payload : request
    }
}

export function cleanBalance() {
    return {
        type : LOGOUT_BALANCE,
        payload : {}
    }
}
