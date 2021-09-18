import { GET_LOCATIONS_BY_USER_ID, LOCATIONS_LOADING, ADD_LOCATION, UPDATE_LOCATION, DELETE_LOCATION, TOGGLE_MUSIC, SET_LOCATION, GET_ERRORS, GET_LOCATIONS, GET_LOCATION } from './types'
import axios from 'axios'
import { tokenConfig } from './authActions'



export const getLocations = () => (dispatch, getState) => {
    dispatch(setLocationsLoading())
    axios.get('/api/locations/').then(res => {
        dispatch({
            type: GET_LOCATIONS,
            payload: res.data
        })
    }).catch(err => {
        console.error(err)
        dispatch({GET_ERRORS, payload: err})
    })
}
export const getLocationsByUserID = (user) => (dispatch, getState) => {
    dispatch(setLocationsLoading())
    dispatch({ type: SET_LOCATION, payload: "" })
    const config = {
        headers: tokenConfig(getState).headers,
        params: { user }
    }
    axios.get('/api/locations/user_id', config).then(res => {
        dispatch({
            type: GET_LOCATIONS_BY_USER_ID,
            payload: res.data
        })
    })
}
export const getLocation = (location_id) => (dispatch, getState) => {
    axios.get(`/api/locations/location_id`, { params: { location_id } }).then(res => {
        dispatch({
            type: GET_LOCATION,
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
    axios.post(`/api/locations/delete`, location, tokenConfig(getState)).then(res => {
        dispatch({
            type: DELETE_LOCATION,
            payload: res.data
        })
    })
}
export const toggleMusic = (payload) => (dispatch, getState) => {
    dispatch(setLocationsLoading())
    const { music, _id } = payload
    axios.post(`/api/locations/toggleMusic`, { music, _id }, tokenConfig(getState)).then(res => {
        dispatch({
            type: TOGGLE_MUSIC,
            payload: res.data
        })
    })
}

/**
 * @func setLocation
 * @desc set the selecected location in the state
 * @param {string} _id - the id of the location
 */
export const setLocation = _id => (dispatch) => {
    dispatch({ type: SET_LOCATION, payload: _id })
}

export const setLocationsLoading = () => {
    return {
        type: LOCATIONS_LOADING
    }
}

