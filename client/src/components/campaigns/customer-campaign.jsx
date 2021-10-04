import React, {useEffect, useState} from 'react'
import history from '../../history'
import {connect} from 'react-redux'
import {getCampaign, submitCampaignData} from '../../actions/campaignActions'
import {Button, Card, Input, Message} from 'semantic-ui-react'
import {setupNewTab} from "../../actions/stripeActions";
import {getLocation} from "../../actions/locationActions";


function CustomerCampaign(props) {
    const campaign_id = history.location.search.split('=')[1]
    const [campaign, setCampaign] = useState(props.campaign)
    const [info, setInfo] = useState('')
    const [buttonLabel, setButtonLabel] = useState('Open New Tab')
    const [msg, setMsg] = useState(props.stripe.msg || '')
    const [locked, setLocked] = useState(true)

    // useEffect(() => setMsg(null), [])
    useEffect(() => {
        if (props.auth.user?.campaigns?.includes(campaign._id)) {
            if (campaign.details.type === "Survey") {
                setLocked(false)
                setMsg({msg: "You have already submitted your vote!"})
            } else if (campaign.details.type === "Raffle") {
                setMsg({msg: "You have already entered the raffle! Buy more tickets for a greater chance to win!"})
            } else if (campaign.details.type === "Fastpass") {
                setLocked(false)
                setMsg({msg: "You have already purchased a fastpass! If you would like to purchase for a friend, please have them sign up for an account."})
            }
        }
        if (props.location.select_location === '' && campaign.location) {
            props.getLocation(campaign.location)
        }
    }, [props.auth])
    useEffect(() => {
        if (props.campaign === "") {
            props.getCampaign(campaign_id)
        }
        setCampaign(props.campaign)
    }, [props.campaign])
    useEffect(() => {
        if (props.stripe.msg) {
            setMsg(props.stripe.msg)
        }
        if (!props.auth.isAuthenticated) {
            setMsg({msg: `Please login/register to participate in a campaign`})
        }
        if (!props.stripe.msg && props.auth.isAuthenticated) {
            setMsg(null)
        }
    }, [props.stripe.msg, props.auth.isAuthenticated])
    useEffect(() => {
        if (props.stripe.hasOpenTab) {
            setButtonLabel('Add To Tab')
        } else {
            setButtonLabel('Open New Tab')
        }
    }, [props.stripe.hasOpenTab])

    useEffect(() => {
        if (!props.stripe) {
            return
        }
        if (props.stripe.hasOpenTab) {
            setButtonLabel('Add To Tab')
        }
        if (props.stripe.unpaidTabs) {
            setLocked(props.stripe.unpaidTabs.length !== 0)
        }
    }, [props.stripe])


    function handleChange(e, data) {
        setInfo(data.value)
    }

    function handleClick(e) {
        setInfo(e.target.value)
    }

    function handleSubmit() {
        const type = campaign.details.type
        let amount = type === "Survey" ? 0 : type === "Raffle" ? parseInt(campaign.question) * parseInt(info) : parseInt(campaign.question)
        const item = {
            amount,
            user: props.auth.user,
            description: type,
            data: {
                timestamp: new Date().toLocaleDateString("en-US"),
                type,
                campaign_id: campaign._id,
                location_id: campaign.location,
                transactionID: props.auth.user._id + Date.now(),
                name: campaign.title,
                info
            }
        }
        if (type !== "Survey") {
            props.setupNewTab(item)
            if (props.stripe.hasOpenTab && parseInt(props.stripe?.tab?.timeWillBeSubmitted ?? 0) > Date.now()) {
                if (window.confirm('Are you sure you would you like to add this to your tab?')) {
                    if (parseInt(props.stripe?.tab?.timeWillBeSubmitted ?? 0) > Date.now() + 5000) {
                        props.submitCampaignData(item)
                    }
                    else {
                        history.push('/checkout')
                    }
                }
            } else {
                history.push('/checkout')
            }
        } else {
            props.submitCampaignData(item)
        }
    }

    const hasPaymentMethod = () => {
        return props.auth.user.paymentMethod && props.auth.user.paymentMethod.length > 0
    }

    function handleRedirect() {
        history.location.state = history.location
    }

    return (
        <div id="customer-campaign_container" style={{display: "grid", placeItems: "center", height: '100%'}}>
            <div id="customer-campaign-card-message_container">
                {msg && msg.msg &&
                <Message color={msg.msg.includes("login") ? "red" : "green"}>
                    <Message.Header>
                        {msg.msg}
                        {msg.msg.includes("login") &&
                        <p><a href="/#/login">Login</a> or <a href="/#/register" onClick={handleRedirect}>Register</a>
                        </p>}
                        {msg.msg.includes("Participate") || msg.msg.includes("already") &&
                        <p><a href={`/#/location/?location_id=${props.location.select_location._id}`}
                              onClick={handleRedirect}>Participate in Another Campaign!</a></p>}
                    </Message.Header>
                </Message>}
                {campaign &&
                <Card fluid>
                    <Card.Content>
                        <Card.Header>{campaign.title}</Card.Header>
                        <Card.Meta>{campaign.details.type}</Card.Meta>
                        <p>
                            {campaign.details.type === "Survey" ? campaign.question : `Cost: $ ${campaign.question}`}
                            <View type={campaign.details.type} campaign={campaign} handleChange={handleChange}
                                  handleClick={handleClick} info={info}/>
                        </p>
                    </Card.Content>
                    <Card.Content extra>
                        <div style={{flexDirection: "row-reverse", display: "flex"}}>
                            {props.auth.isAuthenticated && campaign.details.type !== 'Survey' &&
                            <div id="submit-button-div">
                                {hasPaymentMethod() && <Button primary onClick={handleSubmit}
                                                               disabled={(campaign.details.type !== 'Fastpass' && info === '') || locked}>{buttonLabel}</Button>}
                                {!hasPaymentMethod() && <Button primary onClick={() => {
                                    history.push({pathname: '/profile'})
                                }}>Add a Payment Method</Button>}
                            </div>}
                            {props.auth.isAuthenticated && campaign.details.type === 'Survey' &&
                            <Button primary disabled={locked} onClick={handleSubmit}>Submit Vote</Button>}
                        </div>
                    </Card.Content>
                </Card>}
            </div>
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
            return (<div></div>)
        case "Raffle":
            return (
                <div>
                    <Input fluid type="number" placeholder="How many Tickets do you want to purchase?"
                           onChange={props.handleChange} value={props.info}/>
                </div>
            )
    }
}


const mapStateToProps = state => ({
    campaign: state.campaign.select_campaign,
    auth: state.auth,
    stripe: state.stripe,
    location: state.location
})

export default connect(mapStateToProps, {
    getCampaign,
    setupNewTab,
    submitCampaignData,
    getLocation,
})(CustomerCampaign)
