import {
    SPOTIFY_LOADING,
    SPOTIFY_QUEUE_SONG,
    SPOTIFY_USER_AUTH
} from "../actions/types";

const initialState = {
    userToken: '',
    loading: false,
    searchResult: null
}

export default function (state = initialState, action) {
    switch (action.type) {
        case SPOTIFY_USER_AUTH:
            return {
                ...state,
                userToken: action.payload,
                loading: false
            }
        case SPOTIFY_LOADING:
            return {
                ...state,
                loading: true
            }
        case SPOTIFY_QUEUE_SONG:
            return {
                ...state,
                loading: false
            }
        default:
            return state
    }
}
