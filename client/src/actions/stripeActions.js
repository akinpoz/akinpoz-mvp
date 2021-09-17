import axios from "axios";
import {tokenConfig} from "./authActions";
import {
    CREATED_CUSTOMER,
    CREATED_PAYMENT_INTENT, CREATED_SETUP_INTENT, ERROR_CREATING_CUSTOMER,
    ERROR_CREATING_PAYMENT_INTENT, ERROR_CREATING_SETUP_INTENT, PAYMENT_COMPLETE,
    PROCESSING_PAYMENT, REQUESTED_CUSTOMER,
    REQUESTED_PAYMENT_INTENT, REQUESTED_SETUP_INTENT
} from "./types";

export const createPaymentIntent = (paymentMethodType, currency, amount, transactionID) => (dispatch, getState) => {
    const params = {paymentMethodType: paymentMethodType, currency: currency, amount: amount, transactionID: transactionID};
    dispatch({type: REQUESTED_PAYMENT_INTENT, transactionID: transactionID})
    axios.post('/api/stripe/create-payment-intent', params, tokenConfig(getState)).then(res => {
        if (res.status === 200) {
            dispatch({type: CREATED_PAYMENT_INTENT, paymentIntent: res.data})
        }
        else {
            dispatch({type: ERROR_CREATING_PAYMENT_INTENT})
        }
    })
}

export const createCustomer = (name, email, paymentMethod) => (dispatch, getState) => {
    dispatch({type: REQUESTED_CUSTOMER})
    const params = {
        name, email, paymentMethod
    }
    axios.post('/api/stripe/create-customer', params).then(res => {
        if (res.status === 200) {
            dispatch({type: CREATED_CUSTOMER, customer: res.data})
        } else {
            dispatch({type: ERROR_CREATING_CUSTOMER})
            createSetupIntent();
        }
    })
}

export const createSetupIntent = () => (dispatch, getState) => {
    dispatch({type: REQUESTED_SETUP_INTENT})
    axios.post('/api/stripe/create-setup-intent').then(res => {
        if (res.status === 200) {
            dispatch({type: CREATED_SETUP_INTENT, clientSecret: res.data})
        }
        else {
            dispatch({type: ERROR_CREATING_SETUP_INTENT})
        }
    })
}

export const markProcessing = () => (dispatch, getState) => {
    dispatch({type: PROCESSING_PAYMENT})
}

export const markComplete = (status) => (dispatch, getState) => {
    dispatch({type: PAYMENT_COMPLETE, status: status})
}
