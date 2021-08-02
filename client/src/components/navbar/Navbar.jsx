import React, { useState, useEffect } from 'react'
import styles from './Navbar.module.css'
import globalStyles from '../../assets/global-styles/bootstrap.min.module.css'
import cx from 'classnames'
import logo from '../../images/akinpoz-logo.png'
import Logout from '../auth/Logout'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Icon, Radio } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import { Fragment } from 'react'

function MyNavbar(props) {
    const [isLoggedIn, setIsLoggedIn] = useState(props.auth.isAuthenticated)
    useEffect(() => {
        setIsLoggedIn(props.auth.isAuthenticated)
    }, [props])
    return (
        <nav className={cx(globalStyles.navbar, globalStyles["navbar-expand-lg"], globalStyles["navbar-dark"], globalStyles["bg-dark"])} collapseOnSelect expand="lg" bg="dark" variant="dark">
            <a href="#" className={cx(globalStyles["navbar-brand"])}>
                <img
                    alt=""
                    src={logo}
                    width="30"
                    height="30"
                    className={cx(globalStyles["d-inline-block"], globalStyles["align-top"])}
                />{' '}
                <span style={{lineHeight: "28px"}}>Akopoz</span>
            </a>
            <button aria-controls="responsive-navbar-nav" type="button" aria-label="Toggle navigation" className={cx(globalStyles["navbar-toggler"], globalStyles.collapsed)}><span className={cx(globalStyles["navbar-toggler-icon"])}></span></button>
            <div className={cx(globalStyles["navbar-collapse"], globalStyles.collapse)} id="responsive-navbar-nav">
                <div className={cx(globalStyles["mr-auto"], globalStyles["navbar-nav"])}>
                    {isLoggedIn && <a href="/#/" data-rb-event-key="/#/" className={cx(globalStyles["nav-link"])}>Home</a>}
                </div>
                <div className={cx(globalStyles["navbar-nav"])}>
                    {isLoggedIn && <a href="/#/" data-rb-event-key="/#/" className={cx(globalStyles["nav-link"])}>
                        <Logout onClick={() => { setIsLoggedIn(false) }} />
                    </a>}
                    {!isLoggedIn && <a href="/#/login" data-rb-event-key="/#/" className={cx(globalStyles["nav-link"])}>
                        <Fragment><Button size="tiny">Login</Button></Fragment>
                    </a>}
                    {isLoggedIn && <a href="/#/profile" data-rb-event-key="/#/profile" className={cx(globalStyles["nav-link"])} style={{lineHeight: "25px"}}><Icon name='user' size="large" />
                    </a>}
                    {/* <div className={styles.navLink}><span style={{ color: "white" }}>Light 🌞</span> <Radio slider checked={props.theme === "App-light" ? false : true} onChange={props.changeTheme} /> <span>Dark 🌚 </span></div> */}
                </div>
            </div>
        </nav>
    )
}

MyNavbar.propTypes = {
    auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth
})
export default connect(mapStateToProps, null)(MyNavbar)
