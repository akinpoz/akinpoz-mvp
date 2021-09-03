import { GET_CAMPAIGNS, ADD_CAMPAIGN, CAMPAIGNS_LOADING, UPDATE_CAMPAIGN, DELETE_CAMPAIGN } from '../actions/types'

const initialState = {
    campaigns: [],
    loading: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_CAMPAIGNS:
            return {
                ...state,
                campaigns: action.payload,
                loading: false
            }
        case ADD_CAMPAIGN:
            return {
                ...state, 
                campaigns: [action.payload, ...state.campaigns]
            }
        case UPDATE_CAMPAIGN:
            return {
                ...state,
                campaigns: [action.payload, ...state.campaigns.filter(campaign => campaign._id !== action.payload._id)]
            }
        case DELETE_CAMPAIGN:
            return {
                ...state,
                campaigns: state.campaigns.filter(campaign => campaign._id !== action.payload)
            }
        case CAMPAIGNS_LOADING:
            return {
                ...state,
                loading: true
            }
        default:
            return state
    }
}