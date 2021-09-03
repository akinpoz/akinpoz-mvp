import {SPOTIFY_LOADING, SPOTIFY_QUEUE_SONG,} from "./types";
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

export const queueSong = (location, songUri) => (dispatch, getState) => {
    setSpotifyLoading()
    const params = {location: location, songUri: songUri}
    axios.post('/api/spotify/queueSong', params, tokenConfig(getState)).then(res => {
        if (res.status === 200) {
            dispatch({type: SPOTIFY_QUEUE_SONG})
        }
        else {
            console.error('failed: ' + res.status)
        }
    })
}

export const setSpotifyLoading = () => {
    return {
        type: SPOTIFY_LOADING
    }
}
