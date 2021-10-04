import React, {useEffect, useState} from 'react';
import {Button, Card, Form, Message} from "semantic-ui-react";
import styles from './checkout.module.css'
import {closeTab} from "../../actions/stripeActions";
import {submitCampaignData} from "../../actions/campaignActions"
import {connect} from "react-redux";
import history from '../../history'
import {queueSong} from "../../actions/spotifyActions";

/**
 * Checkout form for rendering tabs (3 conditions -- Has open tab, wants to open tab, has no tab and doesnt want to start a tab)
 * @param props
 * @return {JSX.Element}
 * @constructor
 */
function Checkout(props) {
    const [msg, setMsg] = useState()
    // Needs to get open invoice if exists

    useEffect(() => {
        if (props.stripe.msg) {
            setMsg(props.stripe.msg?.msg ?? '')
        }
    }, [props.stripe.msg])

    useEffect(() => {
        setMsg(props.spotify.error)
    }, [props.spotify.error])

    useEffect(() => {
        if (props.campaign.msg !== '') {
            setMsg(props.campaign.msg)
        }
    }, [props.campaign.msg])


    return (
        <div className={styles.checkoutContainer}>
            {msg && msg.msg && <Message><Message.Header>{msg.msg}<br/><a
                href={`/#/location/?location_id=${props.location.select_location._id}`}>Participate in Another
                Campaign!</a></Message.Header></Message>}
            {props.stripe.tab &&
            <ExistingTab {...props} />
            }
            {!props.stripe.tab && props.stripe.newItem &&
            <NewTab {...props} />
            }
            {!props.stripe.tab && !props.stripe.newItem &&
            <NoTab/>
            }
        </div>
    )
}

/**
 * If user has interacted with a campaign and would like to open a tab
 * @param props
 * @return {JSX.Element}
 * @constructor
 */
function NewTab(props) {
    const feePrice = 0.40;

    const [tac, setTac] = useState(false);
    const [payAgreement, setPayAgreement] = useState(false)
    const [locked, setLocked] = useState(true)

    useEffect(() => {
        if (props.stripe.unpaidTabs) {
            setLocked(props.stripe.unpaidTabs.length !== 0)
        }
    }, [props.stripe.unpaidTabs])

    const handleSubmit = async (event) => {
        // Block native form submission.
        event.preventDefault();

        if (tac && payAgreement) {
            if (props.stripe.newItem.item.data.type !== 'song') {
                props.submitCampaignData(props.stripe.newItem.item)
            } else {
                props.queueSong(props.stripe.newItem.item)
            }
        }
    }

    return (
        <div>
            <Card style={{padding: 15}}>
                <h2>Open a New Tab</h2>
                <div className={styles.divider}/>
                <div>
                    {props.stripe.newItem.item &&
                    <div className={styles.itemContainer}>
                        <p style={{margin: 0}}>{props.stripe.newItem.item.data.name}</p>
                        <p>${props.stripe.newItem.item.amount}</p>
                    </div>
                    }
                    <div className={styles.itemContainer}>
                        <p style={{margin: 0}}>Fee to open new tab</p>
                        <p>${feePrice.toFixed(2)}</p>
                    </div>
                    <div className={styles.totalContainer}>
                        <b>Subtotal</b>
                        <b>${(props.stripe.newItem.item.amount + feePrice).toFixed(2)}</b>
                    </div>
                </div>
                <br/>
                <b style={{textAlign: "center"}}>*Payment will be captured in 24 hours from the card stored in
                    profile*</b>
                <br/>

                <Form onSubmit={handleSubmit}>
                    <div className={styles.termsAndConditions}>
                        <Form.Checkbox style={{marginRight: 10}} checked={tac} onChange={() => setTac(!tac)}/>
                        <p>I have read the <a href='https://www.google.com'>Terms and Conditions</a>.</p>
                    </div>
                    <br/>
                    <div className={styles.termsAndConditions}>
                        <Form.Checkbox style={{marginRight: 10}} checked={payAgreement}
                                       onChange={() => setPayAgreement(!payAgreement)}/>
                        <p>I understand my saved card will be charged in 24 hours to settle my tab.</p>
                    </div>
                    <br/>
                    <div className={styles.cardFormButtonsContainer}>
                        {/* <Form.Button type={'button'} style={{ marginRight: 5 }}
                            onClick={() => history.push('/')}>Home</Form.Button> */}
                        <Form.Button primary
                                     disabled={props.stripe.loading || props.stripe.status !== 'unfulfilled' || !tac || !payAgreement || locked}>Open
                            Tab</Form.Button>
                    </div>
                </Form>
            </Card>
        </div>
    )
}

/**
 * if user has already created a tab and wants to view it
 * @param props
 * @return {JSX.Element}
 * @constructor
 */
function ExistingTab(props) {
    // Calculates time remaining on an open tab and formats it into a string.  If expired, will refresh the page in 5 seconds
    const calculateTimeLeft = () => {
        let expTime = props?.stripe?.tab?.timeWillBeSubmitted ?? Date.now()
        let difference = expTime - Date.now()
        let timeLeftComponents = {};
        let timeLeft = ''

        if (difference > 0) {
            timeLeftComponents = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }

        if (timeLeftComponents.hours > 0) {
            timeLeft += timeLeftComponents.hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})
            timeLeft += ':'
        }
        if (timeLeftComponents.minutes > 0 || timeLeft !== '') {
            timeLeft += ((timeLeftComponents.minutes > 0) ? timeLeftComponents.minutes : 0).toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
            })
            timeLeft += ':'
        }
        if (timeLeftComponents.seconds > 0 || timeLeft !== '') {
            timeLeft += ((timeLeftComponents.seconds > 0) ? timeLeftComponents.seconds : 0).toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
            })
        }
        timeLeft += ((timeLeft !== '') ? ' Until Tab Expires' : 'Tab Expired')

        if (timeLeft === 'Tab Expired') {
            setTimeout(() => {
                history.go(0)
            }, 5000)
        }

        return timeLeft;
    }

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
    const [sum, setSum] = useState(0)

    // Sets time left every second
    useEffect(() => {
        if (props.stripe?.tab ?? false) {
            const timer = setTimeout(() => {
                setTimeLeft(calculateTimeLeft());
            }, 1000);
            return () => clearTimeout(timer);
        }
    });

    // Calculates the sum owed on a current tab when loaded from stripe, then calculates time left
    useEffect(() => {
        if (props.stripe) {
            let tempSum = 0
            if (props.stripe.tab && (props.stripe.tab?.items?.length ?? 0) > 0) {
                for (let item of props.stripe.tab.items) {
                    tempSum += item.amount
                }
            }
            if (props.stripe.newItem) {
                tempSum += props.stripe.newItem.item.amount
            }
            setSum(tempSum)
            setTimeLeft(calculateTimeLeft())
        }
    }, [props.stripe.tab])


    return (
        <div>
            <Card style={{padding: 15}}>
                <h2>Current Tab</h2>
                <div className={styles.divider}/>
                <div>
                    {props.stripe?.tab?.items && props.stripe.tab.items.map(item => {
                        return (
                            <div className={styles.itemContainer}>
                                <p style={{margin: 0}}>{item.data.name}</p>
                                <p>${item.amount.toFixed(2)}</p>
                            </div>
                        )
                    })}
                    {props.stripe?.newItem?.item &&
                    <div className={styles.itemContainer}>
                        <p style={{margin: 0}}>{props.stripe.newItem.item.data.name}</p>
                        <p>${props.stripe.newItem.item.amount}</p>
                    </div>
                    }
                    <div className={styles.totalContainer}>
                        <b>Subtotal</b>
                        <b>${sum.toFixed(2)}</b>
                    </div>
                    <br/>
                    <div className={styles.timerBox}>
                        <b>{timeLeft}</b>
                    </div>
                    <br/>
                    <div className={styles.cardFormButtonsContainer}>
                        <Button type={'button'} style={{marginRight: 5}}
                                onClick={() => history.push(history.location.state)}>Go Back</Button>
                        <Button primary disabled={props.stripe.loading || props.stripe.status !== 'unfulfilled'}
                                onClick={() => props.closeTab(props.auth.user._id)}>Close
                            Tab</Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}

/**
 * User navigated to this page without a tab being opened or interacting with campaign
 * @return {JSX.Element}
 * @constructor
 */
function NoTab() {
    return (
        <div>
            <h4>Participate in a campaign to open a tab!</h4>
        </div>
    )
}

const mapStateToProps = (state) => ({
    stripe: state.stripe,
    auth: state.auth,
    location: state.location,
    spotify: state.spotify,
    campaign: state.campaign
})

//TODO: Determine if those methods are being used or not. If not remove them....
export default connect(mapStateToProps, {
    closeTab,
    submitCampaignData,
    queueSong
})(Checkout);
