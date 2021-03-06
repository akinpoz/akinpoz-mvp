import { GET_LOCATIONS_BY_USER_ID, ADD_LOCATION, LOCATIONS_LOADING, UPDATE_LOCATION, DELETE_LOCATION, TOGGLE_MUSIC, SET_LOCATION, GET_LOCATIONS, GET_LOCATION } from '../actions/types'

const initialState = {
    locations: [],
    loading: false,
    select_location: "",
    no_locations: false

}

export default function LocationReducer(state = initialState, action) {
    switch (action.type) {
        case GET_LOCATIONS:
        case GET_LOCATIONS_BY_USER_ID:
            const noLocations =  (action.payload?.length ?? 0) === 0
            return {
                ...state,
                locations: action.payload,
                loading: false,
                no_locations: noLocations
            }
        case GET_LOCATION:
            return {
                ...state,
                select_location: action.payload,
            }
        case ADD_LOCATION:
            return {
                ...state,
                locations: [...state.locations, action.payload],
                loading: false,
                no_locations: false
            }
        case UPDATE_LOCATION:
            return {
                ...state,
                locations: [action.payload, ...state.locations.filter(location => location._id !== action.payload._id)],
                loading: false,
                no_locations: false
            }
        case DELETE_LOCATION:
            const noLocs =  (state.locations.filter(location => location._id !== action.payload).length ?? 0) === 0
            return {
                ...state,
                locations: state.locations.filter(location => location._id !== action.payload),
                loading: false,
                no_locations: noLocs
            }
        case TOGGLE_MUSIC:
            return {
                ...state,
                locations: [action.payload, ...state.locations.filter(location => location._id !== action.payload._id)],
                loading: false
            }
        case LOCATIONS_LOADING:
            return {
                ...state,
                loading: action.loading ?? true
            }
        case SET_LOCATION:
            return {
                ...state,
                select_location: action.payload
            }
        default:
            return state
    }
}
