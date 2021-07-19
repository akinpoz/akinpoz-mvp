import React, {useState, useEffect} from 'react'
import styles from './Navbar.module.css'
import { Nav, Navbar, NavDropdown } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../../images/akinpoz-logo.png'
import Logout from '../auth/Logout'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {Button, Icon, Radio} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

function MyNavbar(props) {
    const [isLoggedIn, setIsLoggedIn] = useState(props.auth.isAuthenticated)
    useEffect(() => {
        setIsLoggedIn(props.auth.isAuthenticated)
    }, [props])
    return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Navbar.Brand href="#">
                <img
                    alt=""
                    src={logo}
                    width="30"
                    height="30"
                    className="d-inline-block align-top"
                />{' '}
                Akinpoz
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="mr-auto">
                   <Nav.Link href="/#/">Home</Nav.Link>

                </Nav>
                <Nav>
                   {isLoggedIn && <Nav.Link href="/#/"><Logout onClick={() => {setIsLoggedIn(false)}}/></Nav.Link> }
                   {!isLoggedIn && <Nav.Link href="/#/login"><Button>Login</Button></Nav.Link> }
                   {isLoggedIn  && <Nav.Link href="/#/profile"><Icon name='user' size="big" /></Nav.Link> }

                   <div className={styles.navLink}><span style={{color: "white"}}>Light 🌞</span> <Radio slider checked={props.theme === "App-light" ? false : true} onChange={props.changeTheme}/> <span>Dark 🌚 </span></div>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    )
}

MyNavbar.propTypes = {
    auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth
})
export default connect(mapStateToProps, null)(MyNavbar)