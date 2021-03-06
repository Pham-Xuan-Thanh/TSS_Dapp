import {
    GET_ADDRESS,
    CREATE_WALLET,
    GET_BALANCE,
    LOGOUT_BALANCE
} from "../_actions/types"

export default function(state= {} , action) {
    switch (action.type) {
        case GET_ADDRESS:
            return {...state, address : action.payload}    
        case CREATE_WALLET:
            return {...state, wallet : action.payload}    
        case GET_BALANCE :
            return {...state , balance : action.payload}
        case LOGOUT_BALANCE :
            return { ...state , balance : null}
        default:
            return state 
    }
}