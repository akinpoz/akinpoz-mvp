import {combineReducers} from 'redux'

import errorReducer from './errorReducer'
import authReducer from './authReducer'
import locationsReducer from './locationReducer'
import spotifyReducer from "./spotifyReducer";


export default combineReducers({
    error: errorReducer,
    auth: authReducer,
    location: locationsReducer,
    spotify: spotifyReducer
})
