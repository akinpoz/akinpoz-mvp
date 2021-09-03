import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom'
import { Loader } from 'semantic-ui-react'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Profile from './components/profile'
import Home from "./components/homes";
import Analytics from "./components/analytics/analytics";
import Jukebox from "./components/jukebox";
import Results from "./components/results";
import Checkout from "./components/checkout";

const components = {
  Home: Home,
  Profile: Profile,
  Jukebox: Jukebox,
  Checkout: Checkout
}


function Router(props) {
  return (
    <HashRouter>
      <Switch>
        <Route exact path="/">
          <PrivateRoute {...props} component={`Home`} />
        </Route>
        <Route exact path="/register">
          <Register />
        </Route>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path='/profile'>
          <PrivateRoute {...props} component={`Profile`} />
        </Route>
        <Route path='/results'>
          <Results />
        </Route>
        <Route path='/analytics'>
          <Analytics />
        </Route>
        <Route path='/jukebox'>
          <PrivateRoute {...props} component={'Jukebox'} />
        </Route>
        <Route path='/checkout'>
          <PrivateRoute {...props} component={'Checkout'} />
        </Route>
        <Route path="*" component={PageNotFound} />
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
      <Redirect to="/login" />
    )
  }
  else if (props.auth.isAuthenticated && props.auth.isLoading === false) {
    var Component = components[props.component]
    return (
      <Component />
    )
  }
  else if (props.auth.isLoading === true || props.auth.isAuthenticated === null) {
    return (
      <div style={{display: 'grid', placeItems: 'center'}}>
        <Loader active />
      </div>
    )
  }

}

Router.propTypes = {
  auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  auth: state.auth
})

export default connect(mapStateToProps, null)(Router)
