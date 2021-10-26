import {
    ADD_INVOICE_ITEM_SUCCESSFUL,
    CREATED_CUSTOMER,
    CREATED_PAYMENT_INTENT,
    CREATED_SETUP_INTENT,
    ERROR_ADDING_INVOICE_ITEM,
    ERROR_CLOSING_TAB,
    ERROR_CREATING_CUSTOMER,
    ERROR_CREATING_PAYMENT_INTENT,
    ERROR_CREATING_SETUP_INTENT,
    ERROR_RETRIEVING_DRAFT_INVOICE,
    ERROR_RETRIEVING_PAYMENT_DETAILS,
    PAYMENT_COMPLETE,
    PROCESSING_PAYMENT,
    REQUEST_CLOSE_TAB,
    REQUEST_PAYMENT_UPDATE,
    REQUESTED_ADD_INVOICE_ITEM,
    REQUESTED_CUSTOMER,
    REQUESTED_DRAFT_INVOICE,
    REQUESTED_PAYMENT_DETAILS,
    REQUESTED_PAYMENT_INTENT,
    REQUESTED_SETUP_INTENT,
    RETRIEVED_DRAFT_INVOICE,
    RETRIEVED_PAYMENT_DETAILS,
    NEW_ITEM_PROCESSING,
    SUCCESSFULLY_CLOSED_TAB,
    CLEAR_MSG,
    REQUESTED_PAST_TABS,
    RETRIEVED_PAST_TABS,
    ERROR_PAST_TABS,
    RESET_STRIPE,
    ERROR_UNPAID_TABS,
    REQUESTED_UNPAID_TABS,
    RETRIEVED_UNPAID_TABS,
    NEW_ITEM_SUBMITTED,
    CLEAR_STRIPE_MSG,
    RESET_CUSTOMER
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
    newItem: null,
    msg: null,
    pastTabs: [],
    unpaidTabs: []
}

export default function StripeReducer(state = initialState, action) {
    switch (action.type) {
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
                loading: true
            }

        case RETRIEVED_DRAFT_INVOICE:
            return {
                ...state,
                loading: false,
                hasOpenTab: action.hasOpenTab,
                tab: action.tab,
                newItem: null
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
                newItem: action.newItem,
            }
        case ERROR_ADDING_INVOICE_ITEM:
            return initialState

        case NEW_ITEM_PROCESSING:
            return {
                ...state,
                newItem: action.newItem
            }
        case NEW_ITEM_SUBMITTED:
            return {
                ...state,
                newItem: action.newItem
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

        case CLEAR_MSG:
            return {
                ...state,
                msg: null
            }
        case REQUESTED_PAST_TABS:
            return {
                ...state,
                loading: true,
            }
        case RETRIEVED_PAST_TABS:
            return {
                ...state,
                loading: false,
                pastTabs: action.pastTabs,
                msg: action.error
            }
        case ERROR_PAST_TABS:
            return {
                ...state,
                loading: false,
                msg: action.error
            }
        case RESET_STRIPE:
            return initialState;
        case ERROR_UNPAID_TABS:
            return {
                ...state,
                loading: false,
                error: 'Cannot load tabs from stripe.'
            }
        case REQUESTED_UNPAID_TABS:
            return {
                ...state,
                loading: true,
            }
        case RETRIEVED_UNPAID_TABS:
            let newMessage = null
            if (action.unpaidTabs.length !== 0) {
                newMessage = {
                    msg: 'Account is locked.  Check your email for an unpaid tab invoice.',
                    negative: true,
                    positive: false
                }
            }
            return {
                ...state,
                loading: false,
                unpaidTabs: action.unpaidTabs,
                msg: newMessage
            }

        case CLEAR_STRIPE_MSG:
            return {
                ...state,
                msg: null
            }

        case RESET_CUSTOMER:
            return {
                ...state,
                customer: ''
            }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // THESE ARE METHODS THAT MIGHT BE USED LATER.  THEY INVOLVE MAKING CURRENT TRANSACTIONS NOT MAKING A TAB //////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
                status: action.status,
                msg: action.msg
            }

        default:
            return state
    }
}
