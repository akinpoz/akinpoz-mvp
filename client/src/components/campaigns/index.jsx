import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import BusinessCampaign from './business-campaign'
import CustomerCampaign from './customer-campaign'
import ModalAddCampaign from './Modal';

function Campaigns(props) {
    const campaigns = props.campaigns.filter(campaign => campaign.location === props.location_id)
    return (
        <div id="campaigns-container">
            {props.user_type === 'business' && campaigns && campaigns.length > 0 ? <CampaignList campaigns={campaigns} /> : <NoCampaigns />}
            {props.user_type === 'business' && <ModalAddCampaign action={"add"} location={props.location_id} trigger={AddTrigger} />}
            {props.user_type === 'customer' &&
                <CustomerCampaign />
            }
            
        </div>
    )
}

const CampaignList = (props) => {
    return (
        <div id="campaigns-list-container">
            {
                props.campaigns.map(campaign => {
                    return (
                        <BusinessCampaign campaign={campaign} />
                    )
                })
            }
        </div>
    )
}

const NoCampaigns = () => {
    return (
        <div style={{ display: 'grid', placeItems: 'center' }} id="no-campaigns-container">
            <h4>No Campaigns added yet, click "Add Campaign" to get started!</h4>
        </div>
    )
}

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

const mapStateToProps = state => ({
    user_type: state.auth.user.type,
    campaigns: state.campaign.campaigns
})

export default connect(mapStateToProps, {})(Campaigns)

