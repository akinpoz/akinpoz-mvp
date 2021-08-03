import React from 'react';
import ModalUpdateCampaign from '../campaign/UpdateCampaign';

function Campaign(props) {
    console.log(props)
    return (
        <div style={{ display: "flex", flexDirection: 'row', marginBottom: 5, height: 30 }}>
            <a href='/#/interactive-campaign'><h4>{props.j}</h4></a>
            <div style={{ flex: 1 }} />
            <ModalUpdateCampaign />
            <i className='red trash icon' style={{ marginRight: 30 }} />
            <a href='/#/analytics'>View Results</a>
        </div>
    )
}

export default Campaign;
