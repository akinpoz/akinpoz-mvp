import React, {useState, useEffect} from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
function Profile(props) {
    return (
        <div>
            <h1>Profile</h1>
            <p>{props.auth.user.name}</p>
        </div>
    )
}

Profile.propTypes = {
    auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth
})
export default connect(mapStateToProps, null)(Profile)