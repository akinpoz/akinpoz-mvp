import React, { Component } from 'react'
import { Provider } from 'react-redux'
import store from './store'
import { loadUser } from './actions/authActions'
import './global.css'
import 'semantic-ui-css/semantic.min.css'


import NavBar from './components/navbar/Navbar'
import Router from './Router'


class App extends Component {
  componentDidMount() {
    store.dispatch(loadUser())
  }
  render() {
    return (
      <Provider store={store}>
        <div style={{ display: "flex", flex: 1, flexDirection: "column", height: '100%' }} id="app-container">
          <NavBar />

          <Router />
        </div>
      </Provider>
    )
  }
}

export default App
