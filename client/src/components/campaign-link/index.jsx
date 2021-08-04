import React from 'react';
import ModalUpdateCampaign from './/UpdateCampaign';

function CampaignLink(props) {
    console.log(props)
    return (
        <div style={{ display: "flex", flexDirection: 'row', marginBottom: 5, height: 30 }}>
            <a href='/#/campaign'><h4>{props.j}</h4></a>
            <div style={{ flex: 1 }} />
            <ModalUpdateCampaign />
            <i className='red trash icon' style={{ marginRight: 30 }} />
            <a href='/#/results'>View Results</a>
        </div>
    )
}

export default CampaignLink;
