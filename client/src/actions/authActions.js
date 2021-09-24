import axios from 'axios'
import { returnErrors } from './errorActions'
import { USER_LOADED, USER_LOADING, AUTH_ERROR, LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT_SUCCESS, REGISTER_SUCCESS, REGISTER_FAIL } from '../actions/types'

//Check token & load user
export const loadUser = () => (dispatch, getState) => {
    // User loading
    dispatch({ type: USER_LOADING })
    // Fetch user
    axios.get('/api/auth/user/', tokenConfig(getState)).then(res => {
        dispatch({ type: USER_LOADED, payload: res.data })
    }).catch(e => {
        console.log(JSON.stringify(e));
        dispatch(returnErrors(e.message, e.status))
        dispatch({ type: AUTH_ERROR })
    })
}

// Register User

export const register = ({ name, email, password, type, customerID, paymentMethod }) => dispatch => {
    // Headers
    const config = {
        headers: {
            "Content-Type": 'application/json'
        }
    }
    // Request body
    const body = JSON.stringify({ name, email, password, type, customerID, paymentMethod })
    axios.post('/api/users/', body, config).then(res => {
        dispatch({
            type: REGISTER_SUCCESS,
            payload: res.data
        })
    }).catch(e => {
        dispatch(returnErrors(e.response.data, e.response.status, 'REGISTER_FAIL'))
        dispatch({
            type: REGISTER_FAIL
        })
    })
}

// Setup config/headers and token
export const tokenConfig = (getState) => {
    const token = getState().auth.token
    // Headers
    const config = {
        headers: {
            "Content-Type": "application/json"
        }
    }

    // If token, add to headers
    if (token) {
        config.headers['x-auth-token'] = token
    }
    return config
}

// Login User
export const login =({ email, password }) => async dispatch => {
    // Headers
    const config = {
        headers: {
            "Content-Type": 'application/json'
        }
    }
    // Request body
    const body = JSON.stringify({ email, password })
    axios.post('/api/auth/', body, config).then(res => {
        console.log(res.json)
        dispatch({
            type: LOGIN_SUCCESS,
            payload: res.data
        })
    }).catch(e => {
        console.log('error: ' + e)
        dispatch(returnErrors(e.message, e.status, 'LOGIN_FAIL'))
        dispatch({
            type: LOGIN_FAIL
        })
    })
}

export const updateUser = (modifiedUser) => (dispatch, getState) => {
    dispatch({ type: USER_LOADING })
    const body = JSON.stringify(modifiedUser)
    axios.post('/api/users/update', body, tokenConfig(getState)).then(res => {
        dispatch({
            type: USER_LOADED,
            payload: res.data
        })
    }).catch(e => {
        dispatch(returnErrors(e.message, e.status))
    })
}
export const deleteUser = (_id) => (dispatch, getState) => {
    const body = JSON.stringify({ _id })
    axios.post('/api/users/delete', body, tokenConfig(getState)).then(res => {
        if(res.status === 200) {
            dispatch({ type: LOGOUT_SUCCESS })
        }
    }).catch(e => {
        console.error(e)
        dispatch(returnErrors(e.message, e.status))
    })
}

// Logout User
export const logout = () => {
    return {
        type: LOGOUT_SUCCESS
    }
}

