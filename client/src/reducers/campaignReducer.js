import {
    GET_CAMPAIGNS_BY_USER_ID,
    ADD_CAMPAIGN,
    CAMPAIGNS_LOADING,
    UPDATE_CAMPAIGN,
    DELETE_CAMPAIGN,
    GET_CAMPAIGNS,
    SET_CAMPAIGN,
    SUBMITTED_CAMPAIGN, SUBMITTING_CAMPAIGN, SUBMIT_CAMPAIGN_ERROR, CLEAR_CAMPAIGN_MSG
} from '../actions/types'

const initialState = {
    campaigns: [],
    loading: false,
    select_campaign: '',
    msg: null
}

export default function CampaignReducer(state = initialState, action) {
    switch (action.type) {
        case GET_CAMPAIGNS:
        case GET_CAMPAIGNS_BY_USER_ID:
            return {
                ...state,
                campaigns: action.payload,
                loading: false
            }
        case SET_CAMPAIGN:
            return {
                ...state,
                select_campaign: action.payload,
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
                campaigns: action.payload
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
        case SUBMITTING_CAMPAIGN:
            return {
                ...state,
                loading: true,
                msg: null
            }
        case SUBMITTED_CAMPAIGN:
            return {
                ...state,
                loading: false,
                msg: action.message
            }
        case SUBMIT_CAMPAIGN_ERROR:
            return {
                ...state,
                msg: {msg: 'Error Submitting Campaign', negative: true, positive: false}
            }

        case CLEAR_CAMPAIGN_MSG:
            return {
                ...state,
                msg: null
            }

        default:
            return state
    }
}
