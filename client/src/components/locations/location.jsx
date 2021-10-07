import React, { useState } from 'react';
import { Button, Card, Icon, Radio } from "semantic-ui-react";
import { updateLocation, deleteLocation, toggleMusic, setLocation } from '../../actions/locationActions';
import { deleteCampaign, updateCampaign } from '../../actions/campaignActions'
import Modal from './Modal'
import { connect } from 'react-redux'
import ShowQRCode from './show-qrcode';
import Campaigns from '../campaigns';
import { openAuth } from "../../actions/spotifyActions";

function Location(props) {
    const { name, description, music, _id, user } = props.location
    const [isEnabled, setIsEnabled] = useState(music)
    const UpdateTrigger = <div><i className="pencil alternate icon" style={{ marginRight: 10 }} /></div>
    function handleDelete() {
        const location = {
            _id,
            user,
        }
        if (window.confirm('Are you sure you want to delete this location? \nThis action will also delete all campaigns associated with this location. This action is not reversible.')) props.deleteLocation(location)
    }
    function handleToggle() {
        setIsEnabled(!isEnabled)
        props.toggleMusic({ music: !isEnabled, _id })
        if (!isEnabled) {
            props.openAuth(_id)
        }
    }
    function handleClick() {
        props.setLocation(_id)
    }
    //TODO: make responsive with actual link to real campaign ?? QR codes are for locations, not campaigns. The URL should be the landing page for the user-location with parameter specific to the location.
    let url
    if (process.env.NODE_ENV === 'development') {
        url = `http://localhost:3000/#/customer-home/?location_id=${_id}`
    }
    else {
        url = `https://apokoz.com/#/customer-home/?location_id=${_id}`
    }
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: '100%' }}>
            <Card style={{ marginBottom: 20, width: '90%', padding: 20 }}>
                <div style={{ display: "flex", flexDirection: 'row', alignItems: "center", marginBottom: 10 }}>
                    <h2 style={{ marginRight: 20, marginBottom: 0, marginTop: 0 }}>{name}</h2>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <ShowQRCode url={url} />
                        <Modal action={"update"} trigger={UpdateTrigger} {...props} {...props.location} />
                        <i className='red trash icon' onClick={handleDelete} />
                    </div>

                </div>
                <p>{description}</p>
                <div style={{ marginLeft: 20 }}>
                    <div style={{ display: "flex", flexDirection: 'row', marginBottom: 5, alignItems: "center", gap: "10%" }}>
                        <Button icon basic color={!isEnabled ? "grey" : "blue"} disabled={!isEnabled} href='/#/jukebox' style={{ marginBottom: 5, border: "none !important" }} onClick={handleClick}><Icon name="music" /> Jukebox</Button>
                        <div style={{ height: 30 }}>
                            <Radio toggle checked={isEnabled} onChange={handleToggle} />
                        </div>
                    </div>
                    <Campaigns location_id={_id} {...props} />
                </div>
            </Card>
        </div>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    campaign: state.campaign,
    spotify: state.spotify
})

export default connect(mapStateToProps, { updateLocation, deleteLocation, toggleMusic, deleteCampaign, updateCampaign, openAuth, setLocation })(Location)

