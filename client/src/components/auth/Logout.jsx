import React, { useState, Fragment } from 'react'
import { connect } from 'react-redux'
import { logout } from '../../actions/authActions'
import PropTypes from 'prop-types'
import { Button } from 'semantic-ui-react'

function Logout(props) {
    const propTypes = {
        logout: PropTypes.func.isRequired
    }
    return (
        <Fragment>
            <Button size="mini" onClick={props.logout}>Logout</Button>
        </Fragment>
    )
}

export default connect(null, { logout })(Logout)