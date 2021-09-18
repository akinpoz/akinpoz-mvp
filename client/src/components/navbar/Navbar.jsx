import React, { useState, useEffect } from 'react'
import globalStyles from '../../assets/global-styles/bootstrap.min.module.css'
import styles from './Navbar.module.css'
import cx from 'classnames'
import logo from '../../assets/images/logo.png'
import Logout from '../auth/Logout'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Icon, Radio } from 'semantic-ui-react'
import { Fragment } from 'react'
import history from '../../history'


function MyNavbar(props) {
    const [isLoggedIn, setIsLoggedIn] = useState(props.auth.isAuthenticated)
    const [toggle, setToggle] = useState(true)
    const [needHamburger, setNeedHamburger] = useState(history.location.pathname !== '/customer-home/')
    function toggleHamburger() {
        setToggle(!toggle)
    }
    useEffect(() => {
        setIsLoggedIn(props.auth.isAuthenticated)
    }, [props])
    function handleRedirect() {
        history.push('/')
        setNeedHamburger(true)
    }
    return (
        <nav className={cx(globalStyles.navbar, globalStyles["navbar-expand-lg"], globalStyles["navbar-dark"], history.location.pathname !== '/customer-home/' ? styles.business_background : styles.customer_background)} expand="lg" bg="dark" variant="dark">
            <a href="/#/" onClick={handleRedirect} className={cx(globalStyles["navbar-brand"])}>
                <img
                    alt=""
                    src={logo}
                    width="120"
                    height="30"
                    className={cx(globalStyles["d-inline-block"], globalStyles["align-top"])}
                />{' '}
                {/* <span style={{ lineHeight: "28px", color: history.location.pathname !== '/customer-home/' ? 'white' : 'black' }}>Akopoz</span> */}
            </a>
            {history.location.pathname !== '/customer-home/' && <button onClick={toggleHamburger} aria-controls="responsive-navbar-nav" type="button" aria-label="Toggle navigation" className={cx(globalStyles["navbar-toggler"], globalStyles.collapsed)}><span className={cx(globalStyles["navbar-toggler-icon"])}></span></button>}
            {history.location.pathname !== '/customer-home/' && <div className={toggle ? cx(globalStyles["navbar-collapse"], globalStyles.collapse) : cx(globalStyles["navbar-collapse"], globalStyles.collapse, globalStyles.show)} id="responsive-navbar-nav">
                <div className={cx(globalStyles["mr-auto"], globalStyles["navbar-nav"])}>
                    {/* {isLoggedIn && <a href="/#/" data-rb-event-key="/#/" className={cx(globalStyles["nav-link"])}>Home</a>} */}
                </div>
                <div className={cx(globalStyles["navbar-nav"])}>
                    {isLoggedIn && <a href="/#/profile" data-rb-event-key="/#/profile" className={cx(globalStyles["nav-link"])} style={{ lineHeight: "25px" }}>{toggle ? <Icon name='user' size="large" className={styles.profile_icon} /> : <span>Profile</span>}
                    </a>}
                    {isLoggedIn && <a href="/#/" data-rb-event-key="/#/" className={cx(globalStyles["nav-link"])}>
                        <Logout onClick={() => { setIsLoggedIn(false) }} />
                    </a>}
                    {!isLoggedIn && <a href="/#/login" data-rb-event-key="/#/" className={cx(globalStyles["nav-link"])}>
                        <Fragment><Button className={styles.login_logout_button} size="tiny">Login</Button></Fragment>
                    </a>}
                </div>
            </div>}
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
