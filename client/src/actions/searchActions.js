import {CLEAN_QUERY, FINISH_SEARCH, START_SEARCH, UPDATE_SELECTION} from "./types";
import {tokenConfig} from "./authActions";
import axios from "axios";
import {setSpotifyLoading} from "./spotifyActions";


export const startSearch = (query) => (dispatch, getState) => {
    if (query === '') {
        dispatch({type: CLEAN_QUERY})
        return;
    }
    dispatch({type: START_SEARCH, query: query})
    dispatch(setSpotifyLoading())
    const config = {
        headers: tokenConfig(getState).headers,
        params: {query}
    }
    axios.get('/api/spotify/search', config).then(res => {
        dispatch({
            type: FINISH_SEARCH,
            payload: res.data
        })
    })
}

export const updateSelection = (song) => (dispatch) => {
    dispatch({type: UPDATE_SELECTION, selection: song, value: song?.name})
}

export const cleanQuery = () => (dispatch) => {
    dispatch({type: CLEAN_QUERY})
}
