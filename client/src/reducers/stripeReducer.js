import {
    CREATED_CUSTOMER,
    CREATED_PAYMENT_INTENT, CREATED_SETUP_INTENT, ERROR_CREATING_CUSTOMER,
    ERROR_CREATING_PAYMENT_INTENT, ERROR_CREATING_SETUP_INTENT, PAYMENT_COMPLETE,
    PROCESSING_PAYMENT, REQUESTED_CUSTOMER,
    REQUESTED_PAYMENT_INTENT, REQUESTED_SETUP_INTENT
} from '../actions/types';

const initialState = {
    clientSecret: '',
    loading: false,
    transactionID: '-1',
    status: 'unfulfilled',
    customer: ''
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

        default:
            return state
    }
}
