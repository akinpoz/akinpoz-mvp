import { GET_ERRORS, CLEAR_ERRORS } from '../actions/types'

const initialState = {
    msg: null,
    status: null,
    id: null
}

export default function ErrorReducer(state = initialState, action) {
    switch (action.type) {
        case GET_ERRORS:
            return {
                msg: {msg: action.payload.msg, negative: true, positive: false},
                status: action.payload.status,
                id: action.payload.id
            }
        case CLEAR_ERRORS:
            return {
                msg: null,
                status: null,
                id: null
            }
        default:
            return state
    }
}
