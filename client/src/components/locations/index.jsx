import React from 'react'
import {connect} from 'react-redux'
import Location from './location'
import Modal from './Modal'
import {Button, Icon} from 'semantic-ui-react'
import styles from './locations.module.css'
import {addLocation} from '../../actions/locationActions';


function Locations(props) {
    const {locations} = props
    return (
        <div id="locations-container" style={{display: "flex", flexDirection: "column", flex: 1, alignItems: "center", width: '100%'}}>
            <Modal action={"add"} trigger={AddTrigger} {...props}/>
            {locations && locations.length > 0 ? <LocationsList {...props} /> : <NoLocations/>}
        </div>
    )
}

const LocationsList = (props) => {
    const {locations} = props
    return (
        <div id="locations-list-container" style={{width: '100%'}}>
            {
                locations.map(location => {
                    return (
                        <Location key={location._id} location={location}/>
                    )
                })
            }
        </div>
    )
}

const NoLocations = () => {
    return (
        <div style={{display: 'flex', justifyContent: 'center', flexDirection: "row", flex: 1, marginTop: 50, paddingLeft: 15, paddingRight: 15}} id="no-locations-container">

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

