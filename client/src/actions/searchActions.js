import { CLEAN_QUERY, FINISH_SEARCH, START_SEARCH, UPDATE_SELECTION } from "./types";
import axios from "axios";
import { setSpotifyLoading } from "./spotifyActions";


export const startSearch = (query) => (dispatch) => {
    if (query === '') {
        dispatch({ type: CLEAN_QUERY })
        return;
    }
    dispatch({ type: START_SEARCH, query: query })
    dispatch(setSpotifyLoading())

    axios.get('/api/spotify/search', { params: { query } }).then(res => {
        dispatch({
            type: FINISH_SEARCH,
            payload: res.data
        })
    })
}

export const updateSelection = (song) => (dispatch) => {
    dispatch({ type: UPDATE_SELECTION, selection: song, value: song?.name })
}

export const cleanQuery = () => (dispatch) => {
    dispatch({ type: CLEAN_QUERY })
}
