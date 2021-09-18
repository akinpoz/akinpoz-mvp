import axios from 'axios'
import React, { useEffect, useState } from 'react'
import history from '../../history'
import { connect } from 'react-redux'
import { getCampaign } from '../../actions/campaignActions'
import { Button, Card, Input } from 'semantic-ui-react'

function CustomerCampaign(props) {
    const campaign_id = history.location.search.split('=')[1]
    const [campaign, setCampaign] = useState(props.campaign)
    const [info, setInfo] = useState()
    useEffect(() => {
        if (props.campaign === "") {
            props.getCampaign(campaign_id)
        }
        setCampaign(props.campaign)
    }, [props.campaign])
    function handleChange(e, data) {
        setInfo(data.value)
    }
    function handleClick(e) {
        setInfo(e.target.value)
    }
    function handleSubmit() {
        // Check for auth state here. Set redux store with info. If not logged in, redirect to login page. If logged in redirect to payment page.
        // At payment page access the info from the redux store
    }
    return (
        <div id="customer-campaign_container" style={{ display: "grid", placeItems: "center", height: '100%' }}>
            {campaign && <Card>
                <Card.Content>
                    <Card.Header>{campaign.title}</Card.Header>
                    <Card.Meta>{campaign.details.type}</Card.Meta>
                    <p>
                        {campaign.details.type === "Survey" ? campaign.question : `Cost: $ ${campaign.question}`}
                        <View type={campaign.details.type} campaign={campaign} handleChange={handleChange} handleClick={handleClick} info={info}/>
                    </p>
                </Card.Content>
                <Card.Content extra>
                    <Button fluid onClick={handleSubmit}>Continue to Payment</Button>
                </Card.Content>
            </Card>}
        </div>
    )
}

function View(props) {
    switch (props.type) {
        case "Survey":
            return (
                <div>

                    {props.campaign && props.campaign.details.options.map((option, index) => {
                        return (
                            <div key={index}>
                                <input type="radio" name="option" value={option} onClick={props.handleClick}/>
                                <label>{option}</label>
                            </div>
                        )
                    })}
                </div>
            )
        case "Fastpass":
        case "Raffle":
            return (
                <div>
                    <Input type="text" placeholder="What's Your Name?" onChange={props.handleChange} value={props.info}/>
                </div>
            )
    }
}


const mapStateToProps = state => ({
    campaign: state.campaign.select_campaign
})

export default connect(mapStateToProps, { getCampaign })(CustomerCampaign)