import { GET_CAMPAIGNS_BY_USER_ID, CAMPAIGNS_LOADING, ADD_CAMPAIGN, UPDATE_CAMPAIGN, DELETE_CAMPAIGN, GET_CAMPAIGNS, GET_CAMPAIGN, SET_CAMPAIGN, GET_ERRORS } from './types'
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
export const addCampaign = (campaign) => (dispatch, getState) => {
    dispatch(setCampaignsLoading())
    axios.post('/api/campaigns/add', campaign, tokenConfig(getState)).then(res => {
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


export const setCampaignsLoading = () => {
    return {
        type: CAMPAIGNS_LOADING
    }
}
