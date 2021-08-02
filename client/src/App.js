import React, { Component } from 'react'
import { Provider } from 'react-redux'
import store from './store'
import { loadUser } from './actions/authActions'
import './global.css'

import NavBar from './components/navbar/Navbar'
import Router from './Router'


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: localStorage.getItem("theme")
    }

  }

  componentDidMount() {
    store.dispatch(loadUser())
  }
  changeTheme = () => {
    this.setState({
      theme: this.state.theme === "App-dark" ? "App-light" : "App-dark"
    })
    localStorage.setItem("theme", this.state.theme === "App-dark" ? "App-light" : "App-dark")
  }
  render() {
    return (
      <Provider store={store}>
        <div style={{display: "flex", flex: 1, flexDirection: "column"}}>
          <NavBar changeTheme={this.changeTheme} theme={this.state.theme} />
          <div className={this.state.theme}>
            {/* Create Routing Component and connect it to redux state... then use props.isLoading/isAuthenticating to build private routes */}
            <Router />
          </div>
        </div>
      </Provider>
    )
  }
}

export default App
