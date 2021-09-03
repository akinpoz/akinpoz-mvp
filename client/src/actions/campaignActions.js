import { GET_CAMPAIGNS, CAMPAIGNS_LOADING, ADD_CAMPAIGN, UPDATE_CAMPAIGN, DELETE_CAMPAIGN } from './types'
import axios from 'axios'
import { tokenConfig } from './authActions'



export const getCampaigns = (user) => (dispatch, getState) => {
    dispatch(setCampaignsLoading())
    const config = {
        headers: tokenConfig(getState).headers,
        params: {user}
    }
    axios.get('/api/campaigns/', config).then(res => {
        dispatch({
            type: GET_CAMPAIGNS,
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
