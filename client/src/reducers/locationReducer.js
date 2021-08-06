import { GET_LOCATIONS, ADD_LOCATION, LOCATIONS_LOADING, UPDATE_LOCATION, DELETE_LOCATION } from '../actions/types'

const initialState = {
    locations: [],
    loading: false
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
                location: [action.payload, ...state.locations]
            }
        case UPDATE_LOCATION:
            return {
                ...state,
                location: [action.payload, ...state.locations]
            }
        case DELETE_LOCATION:
            return {
                ...state,
                locations: state.locations.filter(location => location._id !== action.payload)
            }
        case LOCATIONS_LOADING:
            return {
                ...state,
                loading: true
            }
        default:
            return state
    }
}