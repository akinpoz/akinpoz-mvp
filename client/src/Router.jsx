import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom'
import Home from './dev-components/alt-home'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Profile from './components/profile'
import InteractiveCampaign from "./components/interactive-campaign/interactive-campaign";
import OwnerProfile from "./owner-profile/owner-profile";
import CampaignsCrud from "./components/campaigns-crud/campaigns-crud";
import Analytics from "./components/analytics/analytics";

const components = {
    Home: Home,
    Profile: Profile
}


function Router(props) {
    return (
      <HashRouter>
        <Switch>
          <Route exact path="/">
            <CampaignsCrud />
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

          {/* DEV PATHS */}
          <Route path='/interactive-campaign'>
            <InteractiveCampaign />
          </Route>
          <Route path='/owner-profile'>
            <OwnerProfile />
          </Route>

          <Route path='/campaigns-crud'>
            <CampaignsCrud />
          </Route>
          <Route path='/analytics'>
            <Analytics />
          </Route>
          {/* DEV PATHS */}

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
    if (props.auth.isAuthenticated) {
      var Component = components[props.component]
      return (
        <Component />
      )
    }
    else {
      return (
        <Redirect to="/login" />
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
