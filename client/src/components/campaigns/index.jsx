import React from 'react'
import {connect} from 'react-redux'
import BusinessCampaign from './business-campaign'
import CustomerCampaign from './customer-campaign'
import ModalAddCampaign from './Modal';
import {Loader} from "semantic-ui-react";

function Campaigns(props) {
    const {campaigns, location_id, user_type} = props
    const filteredCampaigns = campaigns.filter(campaign => campaign.location === location_id)
    return (
        <div id="campaigns-container">
            <Loader active={campaigns.loading} />
                {user_type === 'business' && filteredCampaigns && filteredCampaigns.length > 0 ?
                <CampaignList campaigns={filteredCampaigns}/> : <NoCampaigns/>}
            <br/>
            {user_type === 'business' &&
            <ModalAddCampaign action={"add"} location={location_id} trigger={AddTrigger}/>}
            {user_type === 'customer' &&
            <CustomerCampaign/>
            }
        </div>
    )
}

const CampaignList = (props) => {
    const {campaigns} = props
    return (
        <div id="campaigns-list-container">
            {
                campaigns.map(campaign => {
                    return (
                        <BusinessCampaign key={campaign._id} campaign={campaign}/>
                    )
                })
            }
        </div>
    )
}

const NoCampaigns = () => {
    return (
        <div style={{display: 'grid', placeItems: 'center'}} id="no-campaigns-container">
            <h4>No Campaigns added yet, click "Add Campaign" to get started!</h4>
        </div>
    )
}

const AddTrigger = <div style={{
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
    color: '#4183c4',
    fontWeight: 'bold'
}}
                        color='white'>
    <i className='add icon'/>
    Add Campaign
</div>

const mapStateToProps = state => ({
    user_type: state.auth.user.type,
    campaigns: state.campaign.campaigns
})

export default connect(mapStateToProps, {})(Campaigns)

