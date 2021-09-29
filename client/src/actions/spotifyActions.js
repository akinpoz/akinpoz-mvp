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

export const setSpotifyLoading = () => {
    return {
        type: SPOTIFY_LOADING
    }
}
