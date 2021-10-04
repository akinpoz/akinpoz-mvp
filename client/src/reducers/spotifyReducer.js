import {
    SPOTIFY_ERROR,
    SPOTIFY_LOADING,
    SPOTIFY_QUEUE_SONG,
    SPOTIFY_USER_AUTH
} from "../actions/types";

const initialState = {
    loading: false,
    error: '',
}

export default function (state = initialState, action) {
    switch (action.type) {
        case SPOTIFY_USER_AUTH:
            return {
                ...state,
                loading: false,
                error: ''
            }
        case SPOTIFY_LOADING:
            return {
                ...state,
                loading: true,
                error: ''
            }
        case SPOTIFY_QUEUE_SONG:
            return {
                ...state,
                loading: false,
                error: {msg: 'Successfully added song!'},

            }
        case SPOTIFY_ERROR:
            return {
                ...state,
                error: action.error
            }

        default:
            return state
    }
}
