import { combineReducers } from 'redux';
import user  from './user_reducer';
import wallet from './wallet_reducer'

const rootReducer = combineReducers({
    user,wallet
});

export default rootReducer;