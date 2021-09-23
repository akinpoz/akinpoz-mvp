import axios from "axios";
import {tokenConfig} from "./authActions";
import {
    CREATED_CUSTOMER,
    CREATED_PAYMENT_INTENT,
    CREATED_SETUP_INTENT,
    ERROR_CREATING_CUSTOMER,
    ERROR_CREATING_PAYMENT_INTENT,
    ERROR_CREATING_SETUP_INTENT,
    ERROR_RETRIEVING_PAYMENT_DETAILS,
    PAYMENT_COMPLETE,
    PROCESSING_PAYMENT,
    REQUESTED_CUSTOMER,
    REQUESTED_PAYMENT_INTENT,
    REQUESTED_PAYMENT_DETAILS,
    REQUESTED_SETUP_INTENT,
    RETRIEVED_PAYMENT_DETAILS,
    REQUEST_PAYMENT_UPDATE,
    REQUESTED_DRAFT_INVOICE,
    RETRIEVED_DRAFT_INVOICE,
    ERROR_RETRIEVING_DRAFT_INVOICE,
    REQUESTED_ADD_INVOICE_ITEM,
    ERROR_ADDING_INVOICE_ITEM,
    ADD_INVOICE_ITEM_SUCCESSFUL,
    SET_LOCAL_TAB,
    REQUEST_CLOSE_TAB,
    SUCCESSFULLY_CLOSED_TAB, ERROR_CLOSING_TAB
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

export const createCustomer = (name, email, paymentMethod) => (dispatch) => {
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

export const createSetupIntent = () => (dispatch) => {
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

export const getPaymentDetails = (userID) => (dispatch, getState) => {
    dispatch({type: REQUESTED_PAYMENT_DETAILS})
    let params = {userID}
    axios.post('/api/stripe/get-payment-details/', params, tokenConfig(getState)).then(res => {
        if (res.status === 200) {
            dispatch({type: RETRIEVED_PAYMENT_DETAILS, paymentDetails: res.data})
        }
        else {
            dispatch({type: ERROR_RETRIEVING_PAYMENT_DETAILS})
        }
    })
}

export const updatePaymentMethod = (userID, paymentMethod) => (dispatch, getState) => {
    dispatch({type: REQUEST_PAYMENT_UPDATE})
    let params = {userID, paymentMethod}
    axios.post('/api/stripe/update-payment', params, tokenConfig(getState)).then(res => {
        if (res.status === 200) {
            dispatch({type: RETRIEVED_PAYMENT_DETAILS, paymentDetails: res.data})
        }
        else {
            dispatch({type: ERROR_RETRIEVING_PAYMENT_DETAILS})
        }
    })
}

export const getDraftInvoice = (userID) => (dispatch, getState) => {
    let params = {userID}
    dispatch({type: REQUESTED_DRAFT_INVOICE})
    axios.post('/api/stripe/get-draft-invoice', params, tokenConfig(getState)).then(res => {
        if (res.status === 200) {
            dispatch({type: RETRIEVED_DRAFT_INVOICE, hasOpenTab: res.data !== '', tab: res.data})
        }
        else {
            dispatch({type: ERROR_RETRIEVING_DRAFT_INVOICE})
        }
    })
}

export const addInvoiceItem = (userID, item) => (dispatch, getState) => {
    dispatch({type: REQUESTED_ADD_INVOICE_ITEM})
    let params = {userID, item}
    axios.post('/api/stripe/add-invoice-item', params, tokenConfig(getState)).then(res => {
        if (res.status !== 200) {
            dispatch({type: ERROR_ADDING_INVOICE_ITEM})
            console.error(res.data)
        }
        else {
            dispatch({type: ADD_INVOICE_ITEM_SUCCESSFUL, tab: res.data})
        }
    })
}

export const setupNewTab = (item) => (dispatch) => {
    const feeAmt = 40
    const tab = {
        amount: item.amount + feeAmt,
        item: item,
        fromOnline: false
    }
    dispatch({type: SET_LOCAL_TAB, tab: tab})
}

export const closeTab = (userID) => (dispatch, getState) => {
    dispatch({type: REQUEST_CLOSE_TAB})
    const params = {userID}
    axios.post('/api/stripe/close-tab', params, tokenConfig(getState)).then(res => {
        if (res.status === 200) {
            dispatch({type: SUCCESSFULLY_CLOSED_TAB})
        }
        else {
            console.error('Tabs Outstanding: ' + res.data)
            dispatch({type: ERROR_CLOSING_TAB})
        }
    })
}

export const markProcessing = () => (dispatch) => {
    dispatch({type: PROCESSING_PAYMENT})
}

export const markComplete = (status) => (dispatch) => {
    dispatch({type: PAYMENT_COMPLETE, status: status})
}
