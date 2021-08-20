import React, { useEffect, useState } from "react";
import styles from "./home.module.css"
import Location from "../location";
import { connect } from 'react-redux'

import PropTypes from 'prop-types'
import { getLocations, addLocation } from "../../actions/locationActions"
import { Button, Icon } from "semantic-ui-react";
import Modal from "../location/Modal"
function Home(props) {
    useEffect(() => {
        if (props.auth.user) {
            props.getLocations(props.auth.user._id)
        }
        else {
            window.location = "/login"
        }
    }, [])
    const locations = props.location.locations
    const AddTrigger = <Button className={styles.button} size="tiny" icon labelPosition='left'
        color='green'>
        <Icon className='plus' />
        <span>Add Location</span>
    </Button>
    return (
        <div className={styles.container}>
            <h1 style={{ textAlign: "center" }}>Campaign Manager</h1>
            <Modal action={"add"} trigger={AddTrigger} {...props} />
            {/* <AddLocation action={"add"} trigger={addTrigger} {...props} /> */}
            <br />
            {locations.length > 0 && locations.map(location => {
                return (
                    <Location {...location} />
                )
            })}
            {locations.length == 0 &&
                <div style={{display: 'grid', placeItems: 'center'}}>
                    <h4>No Locations added yet, click "Add Location" to get started!</h4>
                </div>
            }
        </div>
    )
}
Home.propTypes = {
    auth: PropTypes.object.isRequired,
    getLocations: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    location: state.location
})
export default connect(mapStateToProps, { getLocations, addLocation })(Home)
