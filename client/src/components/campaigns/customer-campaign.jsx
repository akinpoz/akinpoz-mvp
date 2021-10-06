import React, {useEffect, useState} from 'react'
import history from '../../history'
import {connect} from 'react-redux'
import {clearCampaignMsg, getCampaign, submitCampaignData} from '../../actions/campaignActions'
import {Button, Card, Input, Message, Radio} from 'semantic-ui-react'
import {clearStripeMsg, setupNewTab} from "../../actions/stripeActions";
import {getLocation} from "../../actions/locationActions";


function CustomerCampaign(props) {
    const campaign_id = history.location.search.split('=')[1]
    const [campaign, setCampaign] = useState(props.campaign)
    const [info, setInfo] = useState('')
    const [buttonLabel, setButtonLabel] = useState('Open New Tab')
    const [msg, setMsg] = useState()
    const [locked, setLocked] = useState(true)

    useEffect(() => {
        if (props.location.select_location === '' && campaign.location) {
            props.getLocation(campaign.location)
        }

        if (!props.auth.isAuthenticated) {
            setMsgWithPriority({msg: `Please login/register to participate in a campaign`, priority: 1})
        } else {
            // set to normal unless higher priority exists
            if (msg && msg.priority === 1) {
                setMsg(null)
            }

            if (props.auth.user.paymentMethod && props.auth.user.paymentMethod.length === 0) {
                setMsgWithPriority({
                    msg: "Please add a payment method in the profile page before interacting with a campaign.",
                    priority: 2
                })
            }

            else if (props.auth.user?.campaigns?.includes(campaign._id)) {
                if (campaign.details.type === "Survey") {
                    setMsgWithPriority({msg: "You have already submitted your vote!", priority: 3})
                } else if (campaign.details.type === "Raffle") {
                    setMsgWithPriority({msg: "You have already entered the raffle! Buy more tickets for a greater chance to win!", priority: 3})
                } else if (campaign.details.type === "Fastpass") {
                    setMsgWithPriority({msg: "You have already purchased a fastpass! If you would like to purchase for a friend, please have them sign up for an account.", priority: 3})
                }
            }
        }
    }, [props.auth])

    useEffect(() => {
        if (props.campaign === "") {
            props.getCampaign(campaign_id)
        }
        if (props.campaign.msg) {
            setMsgWithPriority({...props.campaign.msg, priority: 3})
            props.clearCampaignMsg()
        }
        if (props.campaign && props.campaign.details.type === 'Survey') {
            setLocked(false)
        }
        setCampaign(props.campaign)
    }, [props.campaign])

    useEffect(() => {
        if (!props.stripe) {
            return
        }
        if (props.stripe.hasOpenTab) {
            setButtonLabel('Add To Tab')
        }
        else {
            setButtonLabel('Open New Tab')
        }
        if (props.stripe.unpaidTabs) {
            const hasUnpaidTabs = props.stripe.unpaidTabs.length !== 0
            if (hasUnpaidTabs) {
                setMsgWithPriority({
                    msg: 'You currently have an unpaid tab.  Please check your email and settle this before opening a new tab.',
                    priority: 2
                })
            }
            if (props.campaign && props.campaign.details.type !== 'Survey') {
                setLocked(hasUnpaidTabs)
            }
        }
        else {
            setLocked(false)
        }
        if (props.stripe.msg) {
            setMsgWithPriority({...props.stripe.msg, priority: 2})
            props.clearStripeMsg()
        }

    }, [props.stripe])

    function setMsgWithPriority(newMsg) {
        // checks if new message is prioritized over old message (if no message priority is 5 -- the highest priority is 3)
        console.log(newMsg)
        if (newMsg && newMsg.priority < (msg?.priority ?? 5)) {
            setMsg(newMsg)
        }
    }

    function handleChange(e, data) {
        setInfo(data.value)
    }

    function handleClick(e, {value}) {
        setInfo(value)
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
                    } else {
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

    function campaignLabel() {
        switch (campaign.details.type) {
            case 'Survey':
                return campaign.question
            case 'Raffle':
                return `Cost per ticket: $ ${campaign.question}`
            case 'Fastpass':
                return `Cost for Fastpass: $ ${campaign.question}`
            default:
                return '';
        }
    }

    return (
        <div id="customer-campaign_container" style={{display: "grid", placeItems: "center", height: '100%'}}>
            <div id="customer-campaign-card-message_container">
                {msg && msg.msg &&
                <Message color={(msg.msg.includes("login") || msg.msg.includes("payment") || msg.msg.includes('unpaid')) ? "red" : "green"}>
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
                <Card>
                    <Card.Content>
                        <Card.Header>{campaign.title}</Card.Header>
                        <Card.Meta>{campaign.details.type}</Card.Meta>
                        <br/>
                        <b>
                            {campaignLabel()}
                        </b>
                        <br/>
                        <br/>
                        <View type={campaign.details.type} campaign={campaign} handleChange={handleChange}
                              handleClick={handleClick} info={info}/>
                        <br/>
                    </Card.Content>
                    {props.auth.isAuthenticated &&
                    <Card.Content extra>
                        <div style={{flexDirection: "row-reverse", display: "flex"}}>
                            {campaign.details.type !== 'Survey' &&
                            <div id="submit-button-div">
                                {hasPaymentMethod() && <Button primary onClick={handleSubmit}
                                                               disabled={(campaign.details.type !== 'Fastpass' && info === '') || locked}>{buttonLabel}</Button>}
                                {!hasPaymentMethod() && <Button primary onClick={() => {
                                    history.push({pathname: '/profile'})
                                }}>Add a Payment Method</Button>}
                            </div>}
                            {campaign.details.type === 'Survey' &&
                            <Button primary disabled={locked} onClick={handleSubmit}>Submit Vote</Button>}
                        </div>
                    </Card.Content>
                    }
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
                                <Radio label={option} name='radioGroup' value={option} onChange={props.handleClick}
                                       checked={props.info === option}/>
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
                    <Input fluid type="number" placeholder="Number of tickets"
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
    clearStripeMsg,
    clearCampaignMsg
})(CustomerCampaign)
