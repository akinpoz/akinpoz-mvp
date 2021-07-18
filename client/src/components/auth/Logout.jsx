import React, { useState, Fragment } from 'react'
import { connect } from 'react-redux'
import { logout } from '../../actions/authActions'
import PropTypes from 'prop-types'

function Logout(props) {
    const propTypes = {
        logout: PropTypes.func.isRequired
    }
    return (
        <Fragment>
            <button onClick={props.logout}>Logout</button>
        </Fragment>
    )
}

export default connect(null, { logout })(Logout)