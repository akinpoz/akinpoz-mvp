import {
    SPOTIFY_CLIENT_AUTH,
    SPOTIFY_USER_AUTH,
    SPOTIFY_QUEUE_SONG,
    LOCATIONS_LOADING,
    SPOTIFY_LOADING,
    GET_LOCATIONS
} from "./types";
import axios from "axios";
import {tokenConfig} from "./authActions";

export const getClientAuth = () => (dispatch, getState) => {
    dispatch(setSpotifyLoading())
    axios.get('/api/spotify/client', tokenConfig(getState)).then(res => {
        dispatch({
            type: SPOTIFY_CLIENT_AUTH,
            payload: res.data
        })
    })
}

export const setSpotifyLoading = () => {
    return {
        type: SPOTIFY_LOADING
    }
}
