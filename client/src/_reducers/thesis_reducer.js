import {
    CREATE_THESIS,
    ERROR_THESIS,
    LIST_THESISES,
    UPDATE_THESIS,
    DELETE_THESIS,
    UPLOAD_CHAPTER
} from "../_actions/types"

export default function (state = {}, action) {
    switch (action.type) {
        case CREATE_THESIS:
            return { ...state , thesises : { success : action.payload.success ,  thesises : [...state.thesises.thesises,action.payload.thesis || {} ]}}
        case LIST_THESISES :
            return {...state,  thesises : action.payload}
        case UPDATE_THESIS : 
              {
                  if (action.payload.success) {
                  const index = state.thesises.thesises.findIndex( thesis => thesis._id === action.payload.thesis._id)

                  var newThesises = [ ...state.thesises.thesises]
                  newThesises[index] = action.payload.thesis

                  return { ...state , thesises : {success : true, thesises : newThesises}}
                  } else {
                      return state
                  }
              }
        case DELETE_THESIS : 
            return {...state, thesises : {success : action.payload.success , thesises : state.thesises.thesises.filter( thesis => thesis._id !== action.payload.thesisID)}}
        case UPLOAD_CHAPTER : 
            return {...state , thesises : action.payload}   
        default:
            return state
    }
}