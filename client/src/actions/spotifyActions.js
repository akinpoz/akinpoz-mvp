import {SPOTIFY_ERROR, SPOTIFY_LOADING, SPOTIFY_QUEUE_SONG,} from "./types";
import axios from 'axios';
import {tokenConfig} from "./authActions";

export const openAuth = (location) => (dispatch, getState) => {
    const config = {
        headers: tokenConfig(getState).headers,
        params: {location}
    }
    axios.get('/api/spotify/getAuthURL', config).then(res => {
        window.open(res.data, 'Login to Spotify',
            'width=800,height=600')
    })
}

export const queueSong = (item) => (dispatch, getState) => {
    dispatch({type: SPOTIFY_LOADING})
    let params = {location_id: item.data.location_id, song_uri: item.data.songUri}
    axios.post('/api/spotify/queueSong', params, tokenConfig(getState)).then(res => {
        if (res.status === 200) {
            dispatch({type: SPOTIFY_QUEUE_SONG})
        }
        else {
            dispatch({
                type: SPOTIFY_ERROR,
                error: 'Looks like the jukebox feature is experiencing some issues.' +
                    '  If you would like to use this feature, please report the error to this location.'})
            console.error('failed: ' + res.status)
        }
    }).catch(err => {
        dispatch({
            type: SPOTIFY_ERROR,
            error: 'Looks like the jukebox feature is experiencing some issues.' +
                '  If you would like to use this feature, please report the error to this location.'})
    })
}

export const setSpotifyLoading = () => {
    return {
        type: SPOTIFY_LOADING
    }
}
