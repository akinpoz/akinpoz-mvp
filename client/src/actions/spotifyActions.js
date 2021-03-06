import {CLEAR_SPOTIFY_ERRORS, NEW_ITEM_PROCESSING, SPOTIFY_ERROR, SPOTIFY_LOADING, SPOTIFY_QUEUE_SONG,} from "./types";
import axios from 'axios';
import {tokenConfig} from "./authActions";

export const openAuth = (location, authWindow) => (dispatch, getState) => {
    const config = {
        headers: tokenConfig(getState).headers,
        params: {location}
    }
    axios.get('/api/spotify/getAuthURL', config).then(res => {
        authWindow.location.href = res.data
    })
}

export const queueSong = (item) => (dispatch, getState) => {
    dispatch({type: SPOTIFY_LOADING})
    let params = {location_id: item.data.location_id, song_uri: item.data.songUri}
    axios.post('/api/spotify/queueSong', params, tokenConfig(getState)).then(res => {
        if (res.status === 200) {
            const newItem = {
                item: item,
                status: 'processing'
            }
            dispatch({type: SPOTIFY_QUEUE_SONG, last_queued: item.transactionID})

            // dispatches to stripe reducer to change status from unprocessed to processing
            dispatch({type: NEW_ITEM_PROCESSING, newItem: newItem})
        }
        else {
            dispatch({
                type: SPOTIFY_ERROR,
                error: {msg:'Looks like the jukebox feature is experiencing some issues.' +
                    '  If you would like to use this feature, please report the error to this location.', positive: false, negative: true}
            })
            console.error('failed: ' + res.status)
        }
    }).catch(() => {
        dispatch({
            type: SPOTIFY_ERROR,
            error: {msg: 'Looks like the jukebox feature is experiencing some issues.' +
                '  If you would like to use this feature, please report the error to this location.', positive: false, negative: true}
        })
    })
}

export const clearSpotifyErrors = () => (dispatch) => {
    dispatch({type: CLEAR_SPOTIFY_ERRORS})
}


