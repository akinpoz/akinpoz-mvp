import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import Location from './location'
import Modal from './Modal'
import { Button, Icon } from 'semantic-ui-react'
import styles from './locations.module.css'
import { addLocation } from '../../actions/locationActions';


function Locations(props) {
    return (
        <div id="locations-container">
            <Modal action={"add"} trigger={AddTrigger} {...props} />
            {props.locations && props.locations.length > 0 ? <LocationsList {...props} /> : <NoLocations />}
        </div >
    )
}

const LocationsList = (props) => {
    return (
        <div id="locations-list-container">
            {
                props.locations.map(location => {
                    return (
                        <Location location={location} />
                    )
                })
            }
        </div>
    )
}

const NoLocations = () => {
    return (
        <div style={{ display: 'grid', placeItems: 'center' }} id="no-locations-container">
            <h4>No Locations added yet, click "Add Location" to get started!</h4>
        </div>
    )
}

const mapStateToProps = state => ({
    user_type: state.auth.user.type,
    locations: state.location.locations
})



const AddTrigger = <Button className={styles.button}><Icon name="plus"/>Add Location</Button>


export default connect(mapStateToProps, {addLocation})(Locations, LocationsList)

