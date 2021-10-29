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
    NEW_ITEM_PROCESSING,
    REQUEST_CLOSE_TAB,
    SUCCESSFULLY_CLOSED_TAB,
    ERROR_CLOSING_TAB,
    CLEAR_MSG,
    REQUESTED_PAST_TABS,
    RETRIEVED_PAST_TABS, ERROR_PAST_TABS,
    REQUESTED_UNPAID_TABS, RETRIEVED_UNPAID_TABS, ERROR_UNPAID_TABS, CLEAR_STRIPE_MSG, UPDATE_USER, RESET_CUSTOMER
} from "./types";

/**
 * Creates stripe customer object to save and process payment
 * @param name
 * @param email
 * @param paymentMethod payment id for saved payment info in stripe api
 * @return {(function(*): void)|*}
 */
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

/**
 * Returns a wrapped intent for users to save payment for future use without making an
 * imminent payment
 * @return {(function(*): void)|*}
 */
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

/**
 * Gets (non-sensitive) saved payment info from the customer object referenced in user
 * @param userID
 * @return {(function(*, *=): void)|*}
 */
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

/**
 * Changes the current payment method (or adds one if one isnt already saved)
 * @param userID
 * @param paymentMethod
 * @return {(function(*, *=): void)|*}
 */
export const updatePaymentMethod = (userID, paymentMethod) => (dispatch, getState) => {
    dispatch({type: REQUEST_PAYMENT_UPDATE})
    let params = {userID, paymentMethod}
    axios.post('/api/stripe/update-payment', params, tokenConfig(getState)).then(res => {
        if (res.status === 200) {
            dispatch({type: RETRIEVED_PAYMENT_DETAILS, paymentDetails: res.data.pm})
            dispatch({type: UPDATE_USER, payload: res.data.user})
        }
        else {
            dispatch({type: ERROR_RETRIEVING_PAYMENT_DETAILS})
        }
    })
}

/**
 * Gets the current invoice that is a 'draft' ie editable
 * @param userID
 * @return {(function(*, *=): void)|*}
 */
export const getDraftInvoice = (userID) => (dispatch, getState) => {
    let params = {userID}
    dispatch({type: REQUESTED_DRAFT_INVOICE})
    axios.post('/api/stripe/get-draft-invoice', params, tokenConfig(getState)).then(res => {
        if (res.status === 200) {
            let hasOpenTab
            let tab
            if (res.data === ''){
                tab = null
                hasOpenTab = false
            } else {
                tab = res.data
                hasOpenTab = true
            }
            dispatch({type: RETRIEVED_DRAFT_INVOICE, hasOpenTab: hasOpenTab, tab: tab})
        }
        else {
            dispatch({type: ERROR_RETRIEVING_DRAFT_INVOICE})
        }
    })
}

/**
 * Adds an item to be invoiced via either adding to a current invoice or creating a new one
 * @param userID
 * @param item
 * @param locationName
 * @return {(function(*, *=): void)|*}
 */
export const addInvoiceItem = (userID, item, locationName) => (dispatch, getState) => {
    dispatch({type: REQUESTED_ADD_INVOICE_ITEM})
    let params = {userID, item, locationName}
    axios.post('/api/stripe/add-invoice-item', params, tokenConfig(getState)).then(res => {
        if (res.status !== 200) {
            dispatch({type: ERROR_ADDING_INVOICE_ITEM})
            console.error(res.data)
        }
        else {
            let newItem = {
                item: item,
                status: 'paid'
            }
            dispatch({type: ADD_INVOICE_ITEM_SUCCESSFUL, newItem: newItem})
        }
    })
}

/**
 * Adds prospective item to a 'local tab' before adding it as an invoice item.
 * Structured in a way that will resemble more (batched) items if we end up making
 * a 'cart' to do multiple things at the same time.
 * @param item
 * @return {(function(*): void)|*}
 */
export const setupNewTab = (item) => (dispatch) => {
    const newItem = {
        item: item,
        status: 'unprocessed'
    }
    dispatch({type: NEW_ITEM_PROCESSING, newItem: newItem})
    dispatch({type: CLEAR_MSG})
}

/**
 * Closes the tab that would be a 'draft' under the customer object
 * @param userID
 * @return {(function(*, *=): void)|*}
 */
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

export const tabExpired = () => (dispatch) => {
    dispatch({type: SUCCESSFULLY_CLOSED_TAB})
}

export const getPastTabs = (userID) => (dispatch, getState) => {
    dispatch({type: REQUESTED_PAST_TABS})
    const params = {userID}
    axios.post('/api/stripe/get-past-tabs', params, tokenConfig(getState)).then(res => {
        if (res.status === 200) {
            let error
            for (const tab of res.data) {
                if (tab.open) {
                    error = {msg: 'You currently have an open tab.  Your account will be locked until it is paid', negative: true, positive: false}
                }
            }
            dispatch({type: RETRIEVED_PAST_TABS, pastTabs: res.data, error: error})
        }
        else {
            dispatch({type: ERROR_PAST_TABS, error: {msg: 'Could not load past tabs due to a server error.', negative: true, positive: false}})
        }
    })
}

export const getUnpaidTabs = (userID) => (dispatch, getState) => {
    dispatch({type: REQUESTED_UNPAID_TABS})
    const params = {userID}
    axios.post('/api/stripe/get-unpaid-tabs', params, tokenConfig(getState)).then(res => {
        if (res.status === 200) {
            dispatch({type: RETRIEVED_UNPAID_TABS, unpaidTabs: res.data})
        }
        else {
            dispatch({type: ERROR_UNPAID_TABS})
        }
    })
}

export const clearStripeMsg = () => (dispatch) => {
    dispatch({type: CLEAR_STRIPE_MSG})
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// THESE ARE METHODS THAT MIGHT BE USED LATER.  THEY INVOLVE MAKING CURRENT TRANSACTIONS NOT MAKING A TAB //////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Only will be used if a customer wants to close a tab using a different form of payment
 * (Not Being Used Right Now)
 *
 * @param paymentMethodType (card)
 * @param currency (usd)
 * @param amount
 * @param transactionID
 * @return {(function(*, *=): void)|*}
 */
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

/**
 * Marks processing payment -- used for payment intents.
 * (not being used right now)
 * @return {(function(*): void)|*}
 */
export const markProcessing = () => (dispatch) => {
    dispatch({type: PROCESSING_PAYMENT})
}

/**
 * Marks completed payment -- used for processing payments.
 * (not being used right now)
 * @param status
 * @return {(function(*): void)|*}
 */
export const markComplete = (status) => (dispatch) => {
    let msg
    if (status === 'fail') {
        msg = {msg: 'Stripe could not process card.  Please try another card.', positive: false, negative: true}
    }
    dispatch({type: PAYMENT_COMPLETE, status: status, msg: msg})
}

export const resetCustomer = () => (dispatch) => {
    dispatch({type: RESET_CUSTOMER})
}
