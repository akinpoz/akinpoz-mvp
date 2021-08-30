import { GET_LOCATIONS, ADD_LOCATION, LOCATIONS_LOADING, UPDATE_LOCATION, DELETE_LOCATION, TOGGLE_MUSIC,  SET_LOCATION } from '../actions/types'

const initialState = {
    locations: [],
    loading: false,
    select_location: ""
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_LOCATIONS:
            return {
                ...state,
                locations: action.payload,
                loading: false
            }
        case ADD_LOCATION:
            return {
                ...state, 
                locations: [action.payload, ...state.locations]
            }
        case UPDATE_LOCATION:
            return {
                ...state,
                locations: [action.payload, ...state.locations.filter(location => location._id !== action.payload._id)]
            }
        case DELETE_LOCATION:
            return {
                ...state,
                locations: state.locations.filter(location => location._id !== action.payload)
            }
        case TOGGLE_MUSIC:
            return {
                ...state,
                locations: [action.payload, ...state.locations.filter(location => location._id !== action.payload._id)]
            }
        case LOCATIONS_LOADING:
            return {
                ...state,
                loading: true
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