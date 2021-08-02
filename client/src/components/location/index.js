import React from 'react';
import ModalUpdateLocation from './UpdateLocation'
import ModalAddCampaign from '../campaign/AddCampaign';
import { Button, Card, Form, Icon, Modal } from "semantic-ui-react";
import Campaign from '../campaign';


function Location(props) {
    const { i, index } = props
    // get campaigns based on props.name (location name)
    const campaigns = ['Campaign 1', 'Campaign 2', 'Campaign 3'];
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
                    <h2 style={{ marginRight: 20, marginBottom: 0, marginTop: 0 }}>{i}</h2>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <ModalUpdateLocation />
                        <i className='red trash icon' />
                    </div>

                </div>
                <div style={{ marginLeft: 20 }}>
                    {campaigns.map(j => {
                        return (
                            <Campaign {...props} j={j} />
                        )
                    })}
                    <ModalAddCampaign />
                </div>
            </Card>
        </div>
    )
}

export default Location;