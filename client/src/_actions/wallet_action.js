import {
    GET_ADDRESS,
    CREATE_WALLET,
    GET_BALANCE
} from "./types"

import { SERVER_API } from "../components/Config"

import axios from "axios"


export  function getAddress(dataToSubmit) {
    const request = axios.post(`/api/wallet/add`, dataToSubmit)
        .then(response => response.data)

    return {
        type : GET_ADDRESS,
        payload : request
    }
}

export  function createWallet(dataToSubmit) {
    const request = axios.post(`/api/wallet/create`,dataToSubmit)
        .then(response => response.data)

    return {
        type : CREATE_WALLET,
        payload : request
    }
}

export function getBalance(dataToSubmit) {
    const request = axios.post(`/api/wallet/getbalance`,{address: dataToSubmit})
        .then(response => response.data)
    console.log("acction" , request)
    return {
        type : GET_BALANCE,
        payload : request
    }
}
