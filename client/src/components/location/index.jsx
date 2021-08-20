import React, { useState, useEffect } from 'react';
import ModalAddCampaign from '../campaign-link/Modal';
import { Button, Card, Icon, Radio } from "semantic-ui-react";
import { updateLocation, deleteLocation, toggleMusic } from '../../actions/locationActions';
import { getCampaignsByLocation, deleteCampaign, updateCampaign } from '../../actions/campaignActions'
import Modal from './Modal'
import { connect } from 'react-redux'
import Campaign from '../campaign-link'

function Location(props) {
    const { name, description, music, _id, user } = props
    const [isEnabled, setIsEnabled] = useState(music)
    const UpdateTrigger = <div><i className="pencil alternate icon" style={{ marginRight: 10 }} /></div>
    const AddTrigger = <a style={{
        display: 'flex',
        flexDirection: 'row',
        cursor: 'pointer',
        color: '#4183c4',
        fontWeight: 'bold'
    }}
        icon
        labelPosition='right'
        color='white'>
        <i className='add icon' />
        Add Campaign
    </a>
    useEffect(() => {
        props.getCampaignsByLocation(_id)
    }, [])
    function handleDelete() {
        const location = {
            _id,
            user,
        }
        if (window.confirm('Are you sure you want to delete this location?')) props.deleteLocation(location)
    }
    function handleToggle() {
        setIsEnabled(!isEnabled)
        props.toggleMusic({ music: !isEnabled, _id })

    }
    const campaigns = props.campaign.campaigns
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
                        <i className='red trash icon' onClick={handleDelete} />
                    </div>

                </div>
                <p>{description}</p>
                <div style={{ marginLeft: 20 }}>
                    <div style={{ display: "flex", flexDirection: 'row', marginBottom: 5, alignItems: "center", gap: "10%" }}>
                        <Button icon basic color={!isEnabled ? "grey" : "blue"} disabled={!isEnabled} href='/#/jukebox' style={{ marginBottom: 5, border: "none !important" }}><Icon name="music" /> Jukebox</Button>
                        {/* <div style={{ flex: 1, display: "flex" }} /> */}
                        <div style={{ height: 30 }}>

                            <Radio toggle checked={isEnabled} onChange={handleToggle} />
                            {/* <Button size='mini' color='green'>Enable</Button> */}
                        </div>
                    </div>
                    {campaigns.map(campaign => {
                        return (
                            <Campaign key={campaign._id} {...campaign} />
                        )
                    })}
                    {campaigns.length == 0 &&
                        <div style={{ display: 'grid', placeItems: 'center' }}>
                            <h4>No Campaigns added yet, click "Add Campaign" to create your first Campaign!</h4>
                        </div>
                    }
                    <ModalAddCampaign action={"add"} location={_id} trigger={AddTrigger} />
                </div>
            </Card>
        </div>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    campaign: state.campaign,
})

export default connect(mapStateToProps, { updateLocation, deleteLocation, toggleMusic, getCampaignsByLocation, deleteCampaign, updateCampaign })(Location)

