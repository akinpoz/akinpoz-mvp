import React from 'react';
import ModalAddCampaign from '../campaign-link/AddCampaign';
import { Button, Card, Form, Icon } from "semantic-ui-react";
import { updateLocation, getLocations, deleteLocation } from '../../actions/locationActions';
import Modal from './Modal'
import { connect } from 'react-redux'

function Location(props) {
    
    const { name, campaigns, description, music, _id, user } = props
    const UpdateTrigger = <div><i className="pencil alternate icon" style={{ marginRight: 10 }} /></div>
    // get campaigns based on props.name (location name)
    function handleDelete() {
        props.deleteLocation(props._id)
        props.getLocations()
    }
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: '100%' }}>
            <Card style={{ marginBottom: 20, width: '90%', padding: 20 }}>
                <div style={{ display: "flex", flexDirection: 'row', alignItems: "center", marginBottom: 10 }}>
                    {/* <div style={{
                        height: 40,
                        width: 40,
                        backgroundColor: "gray",
                        borderRadius: 10,
                        marginRight: 10
                    }}>
                        Logo
                    </div> */}
                    <h2 style={{ marginRight: 20, marginBottom: 0, marginTop: 0 }}>{name}</h2>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Modal action={"update"} trigger={UpdateTrigger} {...props} />
                        <i className='red trash icon' onClick={handleDelete}/>
                    </div>

                </div>
                <p>{description}</p>
                <div style={{ marginLeft: 20 }}>
                    <div style={{ display: "flex", flexDirection: 'row', marginBottom: 5, alignItems: "center", gap: "10%" }}>
                        <a href='/#/jukebox' style={{ marginBottom: 5 }}><h4>Music</h4></a>
                        <div style={{ flex: 1, display: "flex" }} />
                        <div style={{ marginRight: 100, height: 30 }}>
                            <Button size='mini' color='green'>Enable</Button>
                        </div>
                    </div>
                    {campaigns.map(campaign => {
                        console.log(campaign);
                        return (
                            <div />
                            //  <Campaign {...campaign} />
                        )
                    })}
                    <ModalAddCampaign />
                </div>
            </Card>
        </div>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    location: state.location
})

export default connect(mapStateToProps, { getLocations, updateLocation, deleteLocation })(Location)

