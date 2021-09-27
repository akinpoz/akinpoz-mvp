import React, { useEffect, useState } from 'react'
import history from '../../history'
import { connect } from 'react-redux'
import { getCampaign } from '../../actions/campaignActions'
import { Button, Card, Input, Message } from 'semantic-ui-react'
import { getDraftInvoice, setupNewTab, submitCampaignData } from "../../actions/stripeActions";

function CustomerCampaign(props) {
    const campaign_id = history.location.search.split('=')[1]
    const [campaign, setCampaign] = useState(props.campaign)
    const [info, setInfo] = useState('')
    const [buttonLabel, setButtonLabel] = useState('Open New Tab')

    useEffect(() => {
        // On render
        if (props.stripe && props.stripe.hasOpenTab) {
            setButtonLabel('Add To Tab')
        }
    }, [])

    useEffect(() => {
        if (props.campaign === "") {
            props.getCampaign(campaign_id)
        }
        setCampaign(props.campaign)
    }, [props.campaign])
    useEffect(() => {
        if (props.auth && props.auth.user) {
            props.getDraftInvoice(props.auth.user._id)
        }
    }, [props.auth])
    useEffect(() => {
        if (props.stripe.hasOpenTab) {
            setButtonLabel('Add To Tab')
        } else {
            setButtonLabel('Open New Tab')
        }
    }, [props.stripe.hasOpenTab])
    function handleChange(e, data) {
        setInfo(data.value)
    }

    function handleClick(e) {
        setInfo(e.target.value)
    }

    function handleSubmit() {
        // Check for auth state here. Set redux store with info. If not logged in, redirect to login page. If logged in redirect to payment page.
        // At payment page access the info from the redux store
        // Add the name/number of tickets to the select campaign redux object
        // - TODO: Determine if we will send the user back to this page after payment set up/login.
        const item = {
            amount: 100,
            user: props.auth.user,
            description: campaign.details.type,
            data: {
                timestamp: new Date().toLocaleDateString("en-US"),
                type: campaign.details.type,
                campaignID: campaign._id,
                locationID: campaign.location,
                transactionID: props.auth.user._id + Date.now(),
                name: campaign.title,
                info
            }
        }
        if (props.stripe.hasOpenTab) {
            if (window.confirm('Your tab is at $' + props.stripe.tab.subtotal + '.  Would you like to add this to your tab?')) {
                props.submitCampaignData(item)
            }
        } else {
            props.setupNewTab(item)
            history.push('/checkout')
        }

    }

    const hasPaymentMethod = () => {
        return props.auth.user.paymentMethod && props.auth.user.paymentMethod.length > 0
    }
    return (
        <div id="customer-campaign_container" style={{ display: "grid", placeItems: "center", height: '100%' }}>
            {campaign && <Card>
                <Card.Content>
                    <Card.Header>{campaign.title}</Card.Header>
                    <Card.Meta>{campaign.details.type}</Card.Meta>
                    <p>
                        {campaign.details.type === "Survey" ? campaign.question : `Cost: $ ${campaign.question}`}
                        <View type={campaign.details.type} campaign={campaign} handleChange={handleChange}
                            handleClick={handleClick} info={info} />
                    </p>
                </Card.Content>
                <Card.Content extra>
                    <div style={{ flexDirection: "row-reverse", display: "flex" }}>
                        {props.auth.isAuthenticated && <div>
                            {hasPaymentMethod() && <Button primary onClick={handleSubmit}
                                disabled={props.campaign.details.type !== 'Fastpass' && info === ''}>{buttonLabel}</Button>}
                            {!hasPaymentMethod() && <Button primary onClick={() => {
                                history.push({ pathname: '/profile' })
                            }}>Add a Payment Method</Button>}
                        </div>}
                        {!props.auth.isAuthenticated && <Button primary onClick={() => {
                            history.push({ pathname: '/login' })
                        }}>Login</Button>}
                    </div>
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
                                <input type="radio" name="option" value={option} onClick={props.handleClick} />
                                <label>{option}</label>
                            </div>
                        )
                    })}
                </div>
            )
        case "Fastpass":
            return (<div></div>)
        case "Raffle":
            return (
                <div>
                    <Input type="number" placeholder="How many Tickets do you want to purchase?"
                        onChange={props.handleChange} value={props.info} />
                </div>
            )
    }
}


const mapStateToProps = state => ({
    campaign: state.campaign.select_campaign,
    auth: state.auth,
    stripe: state.stripe
})

export default connect(mapStateToProps, { getCampaign, getDraftInvoice, setupNewTab, submitCampaignData })(CustomerCampaign)
