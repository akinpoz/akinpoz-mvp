import React, {useCallback, useEffect, useRef, useState} from 'react'
import history from '../../history'
import {connect} from 'react-redux'
import {clearCampaignMsg, getCampaign, submitCampaignData} from '../../actions/campaignActions'
import {Button, Card, Icon, Message, Radio} from 'semantic-ui-react'
import {clearStripeMsg, setupNewTab} from "../../actions/stripeActions";
import {getLocation} from "../../actions/locationActions";


function CustomerCampaign(props) {
    const campaign_id = history.location.search.split('=')[1]
    const [info, setInfo] = useState('')
    const [buttonLabel, setButtonLabel] = useState('Open New Tab')
    const msgRef = useRef()
    const [msg, setMsg] = useState()
    const [locked, setLocked] = useState(true)

    const {
        auth,
        stripe,
        location,
        selectCampaign,
        campaign,
        getLocation,
        clearStripeMsg,
        clearCampaignMsg,
        getCampaign,
        setupNewTab,
        submitCampaignData
    } = props

    const setMsgWithPriority = useCallback((newMsg) => {
        // checks if new message is prioritized over old message (if no message priority is 5 -- the highest priority is 3)
        if (newMsg && newMsg.priority <= (msgRef.current?.priority ?? 5) && newMsg.msg !== (msgRef.current?.msg ?? '')) {
            msgRef.current = newMsg
            setMsg(newMsg)
        }
    }, [])

    const safeSetLocked = useCallback(() => {
        if (stripe.unpaidTabs && stripe.unpaidTabs.length > 0 && selectCampaign.details.type !== 'Product Pluck') {
            setLocked(true)
        } else if (selectCampaign.details.type === 'Product Pluck' && auth.user?.campaigns?.includes(selectCampaign._id)) {
            setLocked(true)
        }
        else {
            setLocked(false)
        }
    }, [stripe, selectCampaign, auth.user?.campaigns])

    useEffect(() => {
        if (selectCampaign === '') {
            return
        }
        if (!auth.isAuthenticated) {
            setMsgWithPriority({
                msg: `Please login to participate in a campaign`,
                priority: 1,
                negative: true,
                positive: false
            })
        } else {
            if (msgRef.current?.msg?.includes('login')) {
                setMsg(null)
                msgRef.current = null
            }
            if (auth.user.paymentMethod && auth.user.paymentMethod.length === 0 && selectCampaign.details.type !== 'Product Pluck') {
                setMsgWithPriority({
                    msg: "Please add a payment method in the profile page before interacting with a campaign.",
                    priority: 2, negative: true, positive: false
                })
            } else if (auth.user?.campaigns?.includes(selectCampaign._id)) {
                if (selectCampaign.details.type === "Product Pluck") {
                    setMsgWithPriority({
                        msg: "You have already submitted your vote!",
                        priority: 3,
                        negative: false,
                        positive: false
                    })
                } else if (selectCampaign.details.type === "Raffle") {
                    setMsgWithPriority({
                        msg: "You have already entered the raffle! Buy more tickets for a greater chance to win!",
                        priority: 3, negative: false, positive: false
                    })
                } else if (selectCampaign.details.type === "Fastpass") {
                    setMsgWithPriority({
                        msg: "You have already purchased a fastpass! If you would like to purchase for a friend, please have them sign up for an account.",
                        priority: 3, negative: false, positive: false
                    })
                }
            }
        }
    }, [auth, selectCampaign, setMsgWithPriority])

    useEffect(() => {
        if (location.select_location === '' && selectCampaign.location) {
            getLocation(selectCampaign.location)
        }
    }, [location, getLocation, selectCampaign])

    useEffect(() => {
        if (selectCampaign === "") {
            getCampaign(campaign_id)
        }
        if (selectCampaign.details && selectCampaign.details.type === 'Raffle') {
            setInfo(0)
        }
        safeSetLocked()
    }, [selectCampaign, getCampaign, clearCampaignMsg, campaign_id, setMsgWithPriority, safeSetLocked])

    useEffect(() => {
        if (campaign.msg !== null) {
            let priority = 3
            if (campaign.msg.msg.includes('Thanks')) {
                priority = 0
            }
            setMsgWithPriority({...campaign.msg, priority: priority})
            clearCampaignMsg()
        }
    }, [campaign.msg, clearCampaignMsg, setMsgWithPriority])

    useEffect(() => {
        if (!stripe) {
            return
        }
        if (stripe.hasOpenTab) {
            setButtonLabel('Add To Tab')
        } else {
            setButtonLabel('Open New Tab')
        }
        if (stripe.unpaidTabs) {
            const hasUnpaidTabs = stripe.unpaidTabs.length !== 0
            if (hasUnpaidTabs) {
                setMsgWithPriority({
                    msg: 'You currently have an unpaid tab.  Please check your email and settle this before opening a new tab.',
                    priority: 2, negative: true, positive: false
                })
            }
            safeSetLocked()
        }
        if (stripe.msg) {
            setMsgWithPriority({...stripe.msg, priority: 2, negative: true, positive: false})
            clearStripeMsg()
        }

    }, [stripe, clearStripeMsg, setMsgWithPriority, safeSetLocked])

    function handleClick(e, {value}) {
        setInfo(value)
    }

    function handleSubmit() {
        const type = selectCampaign.details.type
        let amount = type === "Product Pluck" ? 0 : type === "Raffle" ? parseInt(selectCampaign.question) * parseInt(info) : parseInt(selectCampaign.question)
        const item = {
            amount,
            user: auth.user,
            description: type,
            data: {
                timestamp: new Date().toLocaleDateString("en-US"),
                type,
                campaign_id: selectCampaign._id,
                location_id: selectCampaign.location,
                transactionID: auth.user._id + Date.now(),
                name: selectCampaign.title,
                info
            }
        }
        if (type !== "Product Pluck") {
            setupNewTab(item)
            if (stripe.hasOpenTab && parseInt(stripe?.tab?.timeWillBeSubmitted ?? 0) > Date.now()) {
                if (window.confirm('Are you sure you would you like to add this to your tab?')) {
                    if (parseInt(stripe?.tab?.timeWillBeSubmitted ?? 0) > Date.now() + 5000) {
                        submitCampaignData(item)
                    } else {
                        history.push('/checkout')
                    }
                }
            } else {
                history.push('/checkout')
            }
        } else {
            submitCampaignData(item)
        }
    }

    const hasPaymentMethod = () => {
        return auth.user.paymentMethod && auth.user.paymentMethod.length > 0
    }

    function handleRedirect() {
        history.location.state = history.location
    }

    function campaignLabel() {
        switch (selectCampaign.details.type) {
            case 'Product Pluck':
                return selectCampaign.question
            case 'Raffle':
                return `Cost per ticket: $ ${selectCampaign.question}`
            case 'Fastpass':
                return `Cost for Fastpass: $ ${selectCampaign.question}`
            default:
                return '';
        }
    }

    return (
        <div id="customer-campaign_container" style={{display: "grid", placeItems: "center", height: '100%'}}>
            <div id="customer-campaign-card-message_container"
                 style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <Button style={{position: 'absolute', top: 75, left: 15, zIndex: 0}}
                        onClick={() => window.location.href = `/#/location/?location_id=${location.select_location._id}`}><Icon name={'angle left'}/>Back</Button>
                {msg && msg.msg &&
                <Message
                    positive={msg.positive} negative={msg.negative}>
                    <Message.Header>
                        {msg.msg}
                        {msg.msg.includes("login") &&
                        <p><a href="/#/login">Login</a> or <a href="/#/register" onClick={handleRedirect}>Sign Up</a>
                        </p>}
                        {(msg.msg.includes("Participate") || msg.msg.includes("already")) &&
                        <p><a href={`/#/location/?location_id=${location.select_location._id}`}
                              onClick={handleRedirect}>Participate in Another Campaign!</a></p>}
                    </Message.Header>
                </Message>}
                {selectCampaign &&
                <Card>
                    <Card.Content>
                        <Card.Header>{selectCampaign.title}</Card.Header>
                        {selectCampaign.details && selectCampaign.details.type === 'Raffle' &&
                        <Card.Meta>{selectCampaign.details.type}</Card.Meta>
                        }
                        <br/>
                        <b>
                            {campaignLabel()}
                        </b>
                        <br/>
                        <br/>
                        <View type={selectCampaign.details.type} campaign={selectCampaign} setInfo={setInfo}
                              handleClick={handleClick} info={info}/>
                        <br/>
                    </Card.Content>
                    {auth.isAuthenticated &&
                    <Card.Content extra>
                        <div style={{flexDirection: "row-reverse", display: "flex"}}>
                            {selectCampaign.details.type !== 'Product Pluck' &&
                            <div id="submit-button-div">
                                {hasPaymentMethod() && <Button primary onClick={handleSubmit}
                                                               disabled={(selectCampaign.details.type !== 'Fastpass' && info === '') || locked || (selectCampaign.details.type === 'Raffle' && info === 0)}>{buttonLabel}</Button>}
                                {!hasPaymentMethod() && <Button primary onClick={() => {
                                    history.push({pathname: '/profile'})
                                }}>Add a Payment Method</Button>}
                            </div>}
                            {selectCampaign.details.type === 'Product Pluck' &&
                            <Button primary disabled={locked || !info || info === '' || (msg?.msg.includes('Thanks') ?? false)} onClick={handleSubmit}>Submit Vote</Button>}
                        </div>
                    </Card.Content>
                    }
                </Card>}
            </div>
        </div>
    )
}

function View(props) {
    const {type, campaign, handleClick, info, setInfo} = props

    function safeSetInfo(value) {
        const newInfo = info + value
        if (newInfo >= 0) {
            setInfo(newInfo)
        }
    }

    switch (type) {
        case "Product Pluck":
            return (
                <div>
                    {campaign && campaign.details.options.map((option, index) => {
                        return (
                            <div key={index}>
                                <Radio label={option} name='radioGroup' value={option} onChange={handleClick}
                                       checked={info === option}/>
                            </div>
                        )
                    })}
                </div>
            )
        case "Fastpass":
            return (<div/>)
        case "Raffle":
            return (
                <div style={{display: "flex", flexDirection: 'row', justifyContent: 'center'}}>
                    <Button icon={'minus'} style={{margin: 0}} onClick={() => safeSetInfo(-1)} disabled={info === 0}/>
                    <h3 style={{marginLeft: 10, marginRight: 10}}>{info}</h3>
                    <Button icon={'plus'} style={{margin: 0}} onClick={() => safeSetInfo(1)}/>
                </div>
            )
        default:
            return (
                <p>Error</p>
            )
    }
}


const mapStateToProps = state => ({
    selectCampaign: state.campaign.select_campaign,
    campaign: state.campaign,
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
