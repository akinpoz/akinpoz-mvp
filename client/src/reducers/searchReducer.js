import {CLEAN_QUERY, FINISH_SEARCH, START_SEARCH, UPDATE_SELECTION} from "../actions/types";


const initialState = {
    value: '',
    loading: false,
    results: null,
    selection: null
}

export default function (state = initialState, action) {
    switch (action.type) {
        case CLEAN_QUERY:
            return initialState
        case START_SEARCH:
            return { ...state, loading: true, value: action.query }
        case FINISH_SEARCH:
            return { ...state, loading: false, results: action.payload }
        case UPDATE_SELECTION:
            return { ...state, value: action.value, selection: action.selection }

        default:
            return state
    }
}
