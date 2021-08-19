import {combineReducers} from 'redux'

import errorReducer from './errorReducer'
import authReducer from './authReducer'
import locationsReducer from './locationReducer'
import spotifyReducer from "./spotifyReducer";
import searchReducer from "./searchReducer";

import campaignReducer from './campaignReducer'

export default combineReducers({
    error: errorReducer,
    auth: authReducer,
    location: locationsReducer,
    spotify: spotifyReducer,
    search: searchReducer,
    campaign: campaignReducer
})
