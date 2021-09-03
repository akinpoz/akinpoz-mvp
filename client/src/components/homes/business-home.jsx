import React, { useEffect, useState } from "react";
import styles from "./home.module.css"
import Locations from "../locations";
import { connect } from 'react-redux'
import history from '../../history'
import PropTypes from 'prop-types'
import { getLocations, addLocation } from "../../actions/locationActions"
import {getCampaigns} from "../../actions/campaignActions"
import { Button, Icon } from "semantic-ui-react";
import Modal from "../locations/Modal"
function Home(props) {
    useEffect(() => {
        if (props.auth.user) {
            props.getLocations(props.auth.user._id)
            props.getCampaigns(props.auth.user._id)
        }
        else {
            history.push('/login')
        }
    }, [])
    return (
        <div id="home-container">
            <h1 style={{ textAlign: "center", marginTop: "2%"}}>Location Manager</h1>
            <Locations />      
        </div>
    )
}
Home.propTypes = {
    auth: PropTypes.object.isRequired,
    getLocations: PropTypes.func.isRequired,
    getCampaigns: PropTypes.func.isRequired,
    addLocation: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth
})
export default connect(mapStateToProps, { getLocations, addLocation, getCampaigns })(Home)
