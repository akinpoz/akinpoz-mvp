import React, {useState} from 'react';
import {Button, Card, Confirm, Icon, Radio} from "semantic-ui-react";
import {deleteLocation, setLocation, toggleMusic, updateLocation} from '../../actions/locationActions';
import {deleteCampaign, updateCampaign} from '../../actions/campaignActions'
import Modal from './Modal'
import {connect} from 'react-redux'
import ShowQRCode from './show-qrcode';
import Campaigns from '../campaigns';
import {openAuth} from "../../actions/spotifyActions";

function Location(props) {
    const {location, toggleMusic, setLocation, openAuth, deleteLocation} = props
    const {name, description, music, _id, user} = location
    const [isEnabled, setIsEnabled] = useState(music)
    const UpdateTrigger = <div><i className="pencil alternate icon" style={{marginRight: 10}}/></div>
    const [confirmOpen, setConfirmOpen] = useState(false)

    function handleDelete() {
        const location = {
            _id,
            user,
        }
        deleteLocation(location)
        setConfirmOpen(false)
    }

    function handleToggle() {
        setIsEnabled(!isEnabled)
        toggleMusic({music: !isEnabled, _id})
        if (!isEnabled) {
            const authWindow = window.open('', 'Login to Spotify', 'width=800,height=600')
            openAuth(_id, authWindow)
        }
    }

    function handleClick() {
        setLocation(_id)
    }

    // TODO: Change back
    let url = window.location.host
    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", width: '100%'}}>
            <Confirm open={confirmOpen} confirmButton={'Yes'} cancelButton={'No'}
                     content={'Are you sure you want to delete this location?'} onConfirm={() => handleDelete()}
                     onCancel={() => setConfirmOpen(false)}/>
            <Card style={{marginBottom: 20, width: '90%', padding: 20, maxWidth: 800}}>
                <div style={{display: "flex", flexDirection: 'row', alignItems: "center", marginBottom: 10}}>
                    <h2 style={{marginRight: 20, marginBottom: 0, marginTop: 0}}>{name}</h2>
                    <div style={{display: 'flex', alignItems: 'flex-start'}}>
                        <ShowQRCode url={url}/>
                        <Modal action={"update"} trigger={UpdateTrigger} {...props} {...location} />
                        <i className='red trash icon' onClick={() => setConfirmOpen(true)}/>
                    </div>

                </div>
                <p>{description}</p>
                <br/>
                <div style={{marginLeft: 20, marginRight: 20}}>
                    <div style={{
                        display: "flex",
                        flexDirection: 'row',
                        marginBottom: 5,
                        alignItems: "center",
                        gap: "10%"
                    }}>
                        <Button icon basic color={!isEnabled ? "grey" : "blue"} disabled={!isEnabled} href='/#/jukebox'
                                style={{marginBottom: 5, border: "none !important"}} onClick={handleClick}><Icon
                            name="music"/> Jukebox</Button>
                        <div style={{height: 30}}>
                            <Radio toggle checked={isEnabled} onChange={handleToggle}/>
                        </div>
                    </div>
                    <br/>
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

export default connect(mapStateToProps, {
    updateLocation,
    deleteLocation,
    toggleMusic,
    deleteCampaign,
    updateCampaign,
    openAuth,
    setLocation
})(Location)

