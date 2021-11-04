import { CLEAN_QUERY, FINISH_SEARCH, START_SEARCH, UPDATE_SELECTION } from "./types";
import axios from "axios";


export const startSearch = (query) => (dispatch) => {
    if (query === '') {
        dispatch({ type: CLEAN_QUERY })
        return;
    }
    dispatch({ type: START_SEARCH, query: query })

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
