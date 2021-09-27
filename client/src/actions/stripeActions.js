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
    SUCCESSFULLY_CLOSED_TAB,
    ERROR_CLOSING_TAB,
    SPOTIFY_QUEUE_SONG,
    SPOTIFY_LOADING,
    SPOTIFY_ERROR,
    SUBMIT_CAMPAIGN_ERROR, SUBMITTED_CAMPAIGN, SUBMITTING_CAMPAIGN, CLEAR_MSG
} from "./types";
import {queueSong} from "./spotifyActions";

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
            dispatch({type: RETRIEVED_PAYMENT_DETAILS, paymentDetails: res.data})
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
            dispatch({type: RETRIEVED_DRAFT_INVOICE, hasOpenTab: res.data !== '', tab: res.data})
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
 * @return {(function(*, *=): void)|*}
 */
export const addInvoiceItem = (userID, item) => (dispatch, getState) => {
    _addInvoiceItem(userID, item, dispatch, getState)
}

function _addInvoiceItem (userID, item, dispatch, getState) {
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

export const submitCampaignData = (item) => (dispatch, getState) => {
    if (item.data.type !== 'song') {
        dispatch({type: SUBMITTING_CAMPAIGN})
        axios.post('/api/campaigns/submitData', item, tokenConfig(getState)).then(res => {
            if (res.status === 200) {
                dispatch({type: SUBMITTED_CAMPAIGN, payload: res.data})
                _addInvoiceItem(item.user._id, item, dispatch, getState)
            }
            else {
                dispatch({type: SUBMIT_CAMPAIGN_ERROR})
                console.error('failed: ' + res.data.msg)
            }
        })
    }
    else {
        dispatch({type: SPOTIFY_LOADING})
      //  const params = {location: item.data.locationID, songUri: item.data.songUri}
        axios.post('/api/spotify/queueSong', item, tokenConfig(getState)).then(res => {
            if (res.status === 200) {
                dispatch({type: SPOTIFY_QUEUE_SONG})
                addInvoiceItem(item.user._id, item)
            }
            else {
                dispatch({type: SPOTIFY_ERROR})
                console.error('failed: ' + res.status)
            }
        })
    }
}

/**
 * Adds prospective item to a 'local tab' before adding it as an invoice item.
 * Structured in a way that will resemble more (batched) items if we end up making
 * a 'cart' to do multiple things at the same time.
 * @param item
 * @return {(function(*): void)|*}
 */
export const setupNewTab = (item) => (dispatch) => {
    const feeAmt = 40
    const tab = {
        amount: item.amount + feeAmt,
        item: item,
        fromOnline: false
    }
    dispatch({type: SET_LOCAL_TAB, tab: tab})
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
    dispatch({type: PAYMENT_COMPLETE, status: status})
}