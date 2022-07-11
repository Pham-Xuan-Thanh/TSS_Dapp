import {
    GET_ADDRESS,
    CREATE_WALLET,
    GET_BALANCE,
    LOGOUT_BALANCE,
    GET_TX_INPS
} from "../_actions/types"

export default function(state= {} , action) {
    switch (action.type) {
        case GET_ADDRESS:
            return {...state, address : action.payload}    
        case CREATE_WALLET:
            return {...state, wallet : action.payload}    
        case GET_BALANCE :
            return {...state , balance : action.payload.balance}
        case LOGOUT_BALANCE :
            return { ...state , balance : null}
        case GET_TX_INPS :
            {
                if  (action.payload.success) {
                    return {...state , tx_inps : action.payload.listTxinps}
                } else {
                    return {...state, tx_inps : []}
                }
            }
        default:
            return state 
    }
}