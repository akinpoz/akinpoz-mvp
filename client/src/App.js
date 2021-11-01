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
          <p style={{margin: 0, textAlign: "center"}}>Property of Bio97 LLC</p>
          <p style={{margin: 0, textAlign: "center"}}>Reach us at <a href='mailto:contact@apokoz.com'> contact@apokoz.com</a></p>
        </div>
      </Provider>
    )
  }
}

export default App
