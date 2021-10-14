import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'
import { composeWithDevTools } from "redux-devtools-extension";

const initialState = {}

const middleware = [thunk]

const store = createStore(rootReducer, initialState, composeWithDevTools(
    //TODO: is this the intended functionality -->> added () around the && statement
    applyMiddleware(...middleware)
))

export default store
