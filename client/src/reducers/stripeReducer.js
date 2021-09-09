import {
    CREATED_PAYMENT_INTENT,
    ERROR_CREATING_PAYMENT_INTENT, PAYMENT_COMPLETE,
    PROCESSING_PAYMENT,
    REQUESTED_PAYMENT_INTENT
} from '../actions/types';

const initialState = {
    clientSecret: '',
    loading: false,
    transactionID: '-1',
    status: 'unfulfilled'
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
        default:
            return state
    }
}
