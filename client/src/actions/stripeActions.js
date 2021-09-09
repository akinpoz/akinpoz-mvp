import axios from "axios";
import {tokenConfig} from "./authActions";
import {
    CREATED_PAYMENT_INTENT,
    ERROR_CREATING_PAYMENT_INTENT, PAYMENT_COMPLETE,
    PROCESSING_PAYMENT,
    REQUESTED_PAYMENT_INTENT
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

export const markProcessing = () => (dispatch, getState) => {
    dispatch({type: PROCESSING_PAYMENT})
}

export const markComplete = (status) => (dispatch, getState) => {
    dispatch({type: PAYMENT_COMPLETE, status: status})
}
