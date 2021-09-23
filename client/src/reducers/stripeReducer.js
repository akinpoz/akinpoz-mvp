import {
    ADD_INVOICE_ITEM_SUCCESSFUL,
    CREATED_CUSTOMER,
    CREATED_PAYMENT_INTENT,
    CREATED_SETUP_INTENT, ERROR_ADDING_INVOICE_ITEM, ERROR_CLOSING_TAB,
    ERROR_CREATING_CUSTOMER,
    ERROR_CREATING_PAYMENT_INTENT,
    ERROR_CREATING_SETUP_INTENT,
    ERROR_RETRIEVING_DRAFT_INVOICE,
    ERROR_RETRIEVING_PAYMENT_DETAILS,
    PAYMENT_COMPLETE,
    PROCESSING_PAYMENT, REQUEST_CLOSE_TAB,
    REQUEST_PAYMENT_UPDATE, REQUESTED_ADD_INVOICE_ITEM,
    REQUESTED_CUSTOMER,
    REQUESTED_DRAFT_INVOICE,
    REQUESTED_PAYMENT_DETAILS,
    REQUESTED_PAYMENT_INTENT,
    REQUESTED_SETUP_INTENT,
    RETRIEVED_DRAFT_INVOICE,
    RETRIEVED_PAYMENT_DETAILS, SET_LOCAL_TAB, SUCCESSFULLY_CLOSED_TAB
} from '../actions/types';

const initialState = {
    clientSecret: '',
    loading: false,
    transactionID: '-1',
    status: 'unfulfilled',
    customer: '',
    paymentDetails: null,
    hasOpenTab: false,
    tab: null,
    localTab: null
}

export default function ( state = initialState, action) {
    switch (action.type) {
        case CREATED_PAYMENT_INTENT:
            return {
                ...state,
                clientSecret: action.paymentIntent.clientSecret,
                loading: false,
                transactionID: action.paymentIntent.transactionID
            }
        case ERROR_CREATING_PAYMENT_INTENT:
            return initialState;

        case REQUESTED_PAYMENT_INTENT:
            return {
                ...state,
                clientSecret: '',
                loading: true,
                transactionID: action.transactionID
            }
        case PROCESSING_PAYMENT:
            return {
                ...state,
                loading: true
            }
        case PAYMENT_COMPLETE:
            return {
                ...state,
                loading: false,
                status: action.status
            }
        case CREATED_SETUP_INTENT:
            return {
                ...state,
                loading: false,
                clientSecret: action.clientSecret
            }
        case REQUESTED_SETUP_INTENT:
            return {
                ...state,
                loading: true,
                clientSecret: ''
            }
        case ERROR_CREATING_SETUP_INTENT:
            return initialState;
        case REQUESTED_CUSTOMER:
            return {
                ...state,
                loading: true,
                customer: ''
            }
        case CREATED_CUSTOMER:
            return {
                ...state,
                loading: false,
                customer: action.customer
            }
        case ERROR_CREATING_CUSTOMER:
            return initialState;

        case REQUESTED_PAYMENT_DETAILS:
            return {
                ...initialState,
                loading: true
            }

        case RETRIEVED_PAYMENT_DETAILS:
            return {
                ...state,
                paymentDetails: action.paymentDetails,
                loading: false
            }

        case ERROR_RETRIEVING_PAYMENT_DETAILS:
            return initialState

        case REQUEST_PAYMENT_UPDATE:
            return {
                ...state,
                loading: true
            }

        case REQUESTED_DRAFT_INVOICE:
            return {
                ...state,
                loading: true,
                hasOpenTab: false
            }

        case RETRIEVED_DRAFT_INVOICE:
            return {
                ...state,
                loading: false,
                hasOpenTab: action.hasOpenTab,
                tab: action.tab
            }

        case ERROR_RETRIEVING_DRAFT_INVOICE:
            return initialState;

        case REQUESTED_ADD_INVOICE_ITEM:
            return {
                ...state,
                loading: true
            }
        case ADD_INVOICE_ITEM_SUCCESSFUL:
            return {
                ...state,
                loading: false,
                tab: action.tab,
                hasOpenTab: true,
                localTab: null
            }
        case ERROR_ADDING_INVOICE_ITEM:
            return initialState

        case SET_LOCAL_TAB:
            return {
                ...state,
                localTab: action.tab
            }
        case SUCCESSFULLY_CLOSED_TAB:
            return initialState
        case REQUEST_CLOSE_TAB:
            return {
                ...state,
                loading: true
            }
        case ERROR_CLOSING_TAB:
            return {
                ...state
            }

        default:
            return state
    }
}
