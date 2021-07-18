import React, { Component } from 'react'
import { Provider } from 'react-redux'
import store from './store'
import { loadUser } from './actions/authActions'

import NavBar from './components/navbar/Navbar'
import Router from './Router'


class App extends Component {
  componentDidMount() {
    store.dispatch(loadUser())
  }
  render() {
    return (
      <Provider store={store}>
        <NavBar />
        <div className="App">
          {/* Create Routing Component and connect it to redux state... then use props.isLoading/isAuthenticating to build private routes */}
          <Router />
        </div>
      </Provider>
    )
  }
}

export default App