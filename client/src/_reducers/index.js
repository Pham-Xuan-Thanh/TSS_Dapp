import { combineReducers } from 'redux';
import user  from './user_reducer';
import wallet from './wallet_reducer'
import thesises from  "./thesis_reducer"

const rootReducer = combineReducers({
    user,wallet , thesises
});

export default rootReducer;