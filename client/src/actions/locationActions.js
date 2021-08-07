import { GET_LOCATIONS, LOCATIONS_LOADING, ADD_LOCATION, UPDATE_LOCATION, DELETE_LOCATION, TOGGLE_MUSIC } from './types'
import axios from 'axios'
import { tokenConfig } from './authActions'


export const getLocations = (user) => (dispatch, getState) => {
    dispatch(setLocationsLoading())
    const config = {
        headers: tokenConfig(getState).headers,
        params: {user}
    }
    axios.get('/api/locations/', config).then(res => {
        dispatch({
            type: GET_LOCATIONS,
            payload: res.data
        })
    })
}
export const addLocation = (location) => (dispatch, getState) => {
    dispatch(setLocationsLoading())
    axios.post('/api/locations/add', location, tokenConfig(getState)).then(res => {
        dispatch({
            type: ADD_LOCATION,
            payload: res.data
        })
    })
}
export const updateLocation = (location) => (dispatch, getState) => {
    dispatch(setLocationsLoading())
    axios.post('/api/locations/update', location, tokenConfig(getState)).then(res => {
        dispatch({
            type: UPDATE_LOCATION,
            payload: res.data
        })
    })
}
export const deleteLocation = (location) => (dispatch, getState) => {
    dispatch(setLocationsLoading())
    console.log(location)
    axios.post(`/api/locations/delete`, location, tokenConfig(getState)).then(res => {
        dispatch({
            type: DELETE_LOCATION,
            payload: res.data
        })
    })
}
export const toggleMusic = (payload) => (dispatch, getState) => {
    dispatch(setLocationsLoading())
    console.log(payload)
    const {music, _id} = payload
    axios.post(`/api/locations/toggleMusic`, {music, _id}, tokenConfig(getState)).then(res => {
        dispatch({
            type: TOGGLE_MUSIC,
            payload: res.data
        })
    })
}

export const setLocationsLoading = () => {
    return {
        type: LOCATIONS_LOADING
    }
}
