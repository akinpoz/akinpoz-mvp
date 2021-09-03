import React from "react";
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import BusinessHome from './business-home'
import CustomerHome from './customer-home'
function Home(props) {
    return (
        <div id="home-container">
            {props.auth.user.type === 'business' ? <BusinessHome /> : <CustomerHome />}    
        </div>
    )
}
Home.propTypes = {
    auth: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
    auth: state.auth
})
export default connect(mapStateToProps, { })(Home)
