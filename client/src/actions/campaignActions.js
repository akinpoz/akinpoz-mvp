import {
    GET_CAMPAIGNS_BY_USER_ID,
    CAMPAIGNS_LOADING,
    ADD_CAMPAIGN,
    UPDATE_CAMPAIGN,
    DELETE_CAMPAIGN,
    GET_CAMPAIGNS,
    GET_CAMPAIGN,
    SET_CAMPAIGN,
    GET_ERRORS,
    SUBMITTING_CAMPAIGN,
    SUBMITTED_CAMPAIGN,
    SUBMIT_CAMPAIGN_ERROR,
    NEW_ITEM_PROCESSING,
    CLEAR_CAMPAIGN_MSG,
    UPDATE_USER_CAMPAIGNS
} from './types'
import axios from 'axios'
import { tokenConfig } from './authActions'

export const getCampaigns = () => (dispatch, getState) => {
    dispatch(setCampaignsLoading())
    axios.get('/api/campaigns/').then(res => {
        dispatch({
            type: GET_CAMPAIGNS,
            payload: res.data
        })
    }).catch(err => {
        console.log(err)
        dispatch({ type: GET_ERRORS, payload: err })
    })
}
export const getCampaign = (campaign_id) => (dispatch) => {
    axios.get(`/api/campaigns/campaign_id`, { params: { campaign_id } }).then(res => {
        dispatch({ type: GET_CAMPAIGN, payload: res.data })
    })
}
export const setCampaign = (campaign) => (dispatch) => {
    dispatch({ type: SET_CAMPAIGN, payload: campaign })
}
export const getCampaignsByUserID = (user) => (dispatch, getState) => {
    dispatch(setCampaignsLoading())
    const config = {
        headers: tokenConfig(getState).headers,
        params: { user }
    }
    axios.get('/api/campaigns/user_id', config).then(res => {
        dispatch({
            type: GET_CAMPAIGNS_BY_USER_ID,
            payload: res.data
        })
    })
}
export const addCampaign = (formData) => (dispatch, getState) => {
    dispatch(setCampaignsLoading())
    axios.post('/api/campaigns/add', formData, tokenConfig(getState)).then(res => {
        dispatch({
            type: ADD_CAMPAIGN,
            payload: res.data
        })
    })
}
export const updateCampaign = (campaign) => (dispatch, getState) => {
    dispatch(setCampaignsLoading())
    axios.post('/api/campaigns/update', campaign, tokenConfig(getState)).then(res => {
        dispatch({
            type: UPDATE_CAMPAIGN,
            payload: res.data
        })
    })
}
export const deleteCampaign = (campaign) => (dispatch, getState) => {
    dispatch(setCampaignsLoading())
    axios.post(`/api/campaigns/delete`, campaign, tokenConfig(getState)).then(res => {
        dispatch({
            type: DELETE_CAMPAIGN,
            payload: res.data
        })
    })
}

export const submitCampaignData = (item) => (dispatch, getState) => {
    dispatch({type: SUBMITTING_CAMPAIGN})
    axios.post('/api/campaigns/submitData', item, tokenConfig(getState)).then(res => {
        if (res.status === 200) {
            const newItem = {
                item: item,
                status: 'processing'
            }
            dispatch({type: SUBMITTED_CAMPAIGN, message: res.data.msg})
            dispatch({type: UPDATE_USER_CAMPAIGNS, campaign_id: res.data.campaign_id})

            if (item.data.type !== 'Product Pluck') {
                // dispatches to stripe reducer to change status from unprocessed to processing
                dispatch({type: NEW_ITEM_PROCESSING, newItem: newItem})
            } else {
                // if Product Pluck then doesnt need to do anything else -- will trigger adding to stripe otherwise
                dispatch({type: NEW_ITEM_PROCESSING, newItem: null})
            }
        }
        else {
            dispatch({type: SUBMIT_CAMPAIGN_ERROR})
            console.error('failed: ' + res.data.msg)
        }
    })
}

export const clearCampaignMsg = () => (dispatch) => {
    dispatch({type: CLEAR_CAMPAIGN_MSG})
}

export const setCampaignsLoading = () => {
    return {
        type: CAMPAIGNS_LOADING
    }
}
