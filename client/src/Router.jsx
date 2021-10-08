import React, {useEffect} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {HashRouter, Route, Redirect, Switch} from 'react-router-dom'
import {Loader} from 'semantic-ui-react'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Profile from './components/profile'
import Home from "./components/homes";
import Analytics from "./components/analytics/analytics";
import Jukebox from "./components/jukebox";
import Checkout from "./components/checkout";
import CustomerHome from './components/homes/customer-home'
import Slider from './components/locations/Slider'
import Search from './components/locations/Search'
import Campaign from './components/campaigns/customer-campaign'
import {addInvoiceItem, getDraftInvoice, getUnpaidTabs} from "./actions/stripeActions";

const components = {
    Home: Home,
    Profile: Profile,
    Jukebox: Jukebox,
    Checkout: Checkout,
    CustomerHome: CustomerHome
}


function Router(props) {
    const {
        auth,
        stripe,
        location,
        addInvoiceItem,
        getDraftInvoice,
        getUnpaidTabs
    } = props
    useEffect(() => {
        if (stripe && !stripe.loading && stripe.newItem) {
            if (stripe.newItem.item.data.type !== 'Survey') {
                if (stripe.newItem.status === 'processing') {
                    addInvoiceItem(auth.user._id, stripe.newItem.item, location.select_location.name)
                } else if (stripe.newItem.status === 'paid' && auth && auth.user) {
                    getDraftInvoice(auth.user._id)
                }
            }
        }
    }, [addInvoiceItem, getDraftInvoice, location.select_location.name, auth, stripe])

    useEffect(() => {
        if (auth.user) {
            getDraftInvoice(auth.user._id)
            getUnpaidTabs(auth.user._id)
        }
    }, [auth.user, getUnpaidTabs, getDraftInvoice])

    return (
        <HashRouter>
            <Switch>
                <Route exact path="/">
                    {/* <PrivateRoute {...props} component={`Home`} /> */}
                    <Home/>
                </Route>
                <Route exact path="/register">
                    <Register/>
                </Route>
                <Route exact path="/login">
                    <Login/>
                </Route>
                <Route exact path='/profile'>
                    <PrivateRoute {...props} component={`Profile`}/>
                </Route>
                <Route path='/analytics'>
                    <Analytics/>
                </Route>
                <Route path='/jukebox'>
                    <PrivateRoute {...props} component={'Jukebox'}/>
                </Route>
                <Route path='/customer-jukebox'>
                    <Route component={Jukebox}/>
                </Route>
                <Route path='/checkout'>
                    <PrivateRoute {...props} component={'Checkout'}/>
                </Route>
                <Route path='/customer-home'>
                    <CustomerHome/>
                </Route>
                <Route path="/location">
                    <Slider/>
                </Route>
                <Route path="/search">
                    <Search/>
                </Route>
                <Route path="/campaign">
                    <Campaign/>
                </Route>
                <Route path="*" component={PageNotFound}/>
            </Switch>
        </HashRouter>
    )
}

const PageNotFound = () => {
    return (
        <div>
            <h2>Oh No! The page you are looking for cannot be found.</h2>
        </div>
    )
}

const PrivateRoute = (props) => {
    if (props.auth.isAuthenticated === false && props.auth.isLoading === false) {
        return (
            <Redirect to="/login"/>
        )
    } else if (props.auth.isAuthenticated && props.auth.isLoading === false) {
        let Component = components[props.component]
        return (
            <Component/>
        )
    } else if (props.auth.isLoading === true || props.auth.isAuthenticated === null) {
        return (
            <div style={{display: 'grid', placeItems: 'center'}}>
                <Loader active/>
            </div>
        )
    }


}

Router.propTypes = {
    auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    stripe: state.stripe,
    location: state.location,
})

export default connect(mapStateToProps, {addInvoiceItem, getDraftInvoice, getUnpaidTabs})(Router)
