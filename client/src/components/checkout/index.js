import React, { useCallback, useEffect, useState } from 'react';
import {Button, Card, Form, Loader, Message} from "semantic-ui-react";
import styles from './checkout.module.css'
import {clearStripeMsg, closeTab, getDraftInvoice, tabExpired} from "../../actions/stripeActions";
import { clearCampaignMsg, submitCampaignData } from "../../actions/campaignActions"
import { connect } from "react-redux";
import { clearSpotifyErrors, queueSong } from "../../actions/spotifyActions";

/**
 * Checkout form for rendering tabs (3 conditions -- Has open tab, wants to open tab, has no tab and doesnt want to start a tab)
 * @param props
 * @return {JSX.Element}
 * @constructor
 */
function Checkout(props) {
    const [msg, setMsg] = useState()
    const { stripe, spotify, campaign, location, clearStripeMsg, clearSpotifyErrors, clearCampaignMsg } = props
    // Needs to get open invoice if exists

    useEffect(() => {
        if (stripe.msg) {
            setMsg(stripe.msg)
            clearStripeMsg()
        }
    }, [stripe.msg, clearStripeMsg])

    useEffect(() => {
        if (spotify.error) {
            setMsg(spotify.error)
            clearSpotifyErrors()
        }
    }, [spotify.error, clearSpotifyErrors])

    useEffect(() => {
        if (campaign.msg !== '') {
            setMsg(campaign.msg)
            clearCampaignMsg()
        }
    }, [campaign.msg, clearCampaignMsg])

    useEffect(() => {
        if (!stripe.hasOpenTab && stripe.newItem === null) {
            if (location.select_location !== '') {
                window.location.href = `/#/location/?location_id=${location.select_location._id}`
            }
            else {
                window.location.href = '/#/search'
            }
        }
    }, [stripe.hasOpenTab, stripe.newItem, location.select_location])


    return (
        <div className={styles.checkoutContainer}>
            <Loader active={stripe.loading || spotify.loading || campaign.loading} />
            {msg && msg.msg && <Message positive={msg.positive} negative={msg.negative}><Message.Header>{msg.msg}<br /><a
                href={`/#/location/?location_id=${location.select_location._id}`}>Participate in Another
                Campaign!</a></Message.Header></Message>}
            {stripe.tab &&
                <ExistingTab {...props} />
            }
            {!stripe.tab && stripe.newItem &&
                <NewTab {...props} />
            }
            {!stripe.tab && !stripe.newItem &&
                <NoTab />
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
    const [locked, setLocked] = useState(true)

    const { stripe, submitCampaignData, queueSong } = props

    useEffect(() => {
        if (stripe.unpaidTabs) {
            setLocked(stripe.unpaidTabs.length !== 0)
        }
    }, [stripe.unpaidTabs])

    const handleSubmit = async (event) => {
        // Block native form submission.
        event.preventDefault();

        if (tac) {
            if (stripe.newItem.item.data.type !== 'song') {
                submitCampaignData(stripe.newItem.item)
            } else {
                queueSong(stripe.newItem.item)
            }
        }
    }

    return (
        <div>
            <Card style={{ padding: 15 }}>
                <h2>Open a New Tab</h2>
                <div className={styles.divider} />
                <div>
                    {/* {stripe.newItem.item &&
                    <div className={styles.itemContainer}>
                        <p style={{margin: 0}}>{stripe.newItem.item.data.name}</p>
                        <p>${stripe.newItem.item.amount.toFixed(2)}</p>
                    </div>
                    } */}
                    {/* <div className={styles.itemContainer}>
                        <p style={{margin: 0}}>Fee to open new tab</p>
                        <p>${feePrice.toFixed(2)}</p>
                    </div> */}
                    <div className={styles.totalContainer}>
                        <b>Subtotal</b>
                        <b>${(stripe.newItem.item.amount + feePrice).toFixed(2)}</b>
                    </div>
                </div>
                <br/>

                <Form onSubmit={handleSubmit}>
                    <div className={styles.termsAndConditions}>
                        <Form.Checkbox style={{ marginRight: 10 }} checked={tac} onChange={() => setTac(!tac)} />
                        <p>I have read the <a href='https://www.google.com'>Terms and Conditions</a>.</p>
                    </div>
                    <br />
                    <div className={styles.cardFormButtonsContainer}>
                        <Form.Button primary
                            disabled={stripe.loading || stripe.status !== 'unfulfilled' || !tac || locked}>Open
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
    const { stripe, location, tabExpired } = props
    // Calculates time remaining on an open tab and formats it into a string.  If expired, will refresh the page in 5 seconds
    const calculateTimeLeft = useCallback(() => {
        let expTime = stripe?.tab?.timeWillBeSubmitted ?? Date.now()
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
            timeLeft += timeLeftComponents.hours.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
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
            tabExpired()
            setTimeout(() => {
                if (location.select_location !== '') {
                    window.location.href = `/#/location/?location_id=${location.select_location._id}`
                }
                else {
                    window.location.href = '/#/search'
                }
            }, 5000)
        }

        return timeLeft;
    }, [stripe, location.select_location, tabExpired])

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
    const [sum, setSum] = useState(0)


    // Sets time left every second
    useEffect(() => {
        if (stripe?.tab ?? false) {
            const timer = setTimeout(() => {
                setTimeLeft(calculateTimeLeft());
            }, 1000);
            return () => clearTimeout(timer);
        }
    });

    // Calculates the sum owed on a current tab when loaded from stripe, then calculates time left
    useEffect(() => {
        if (stripe) {
            let tempSum = 0
            if (stripe.tab && (stripe.tab?.items?.length ?? 0) > 0) {
                for (let item of stripe.tab.items) {
                    tempSum += item.amount
                }
            }
            if (stripe.newItem) {
                tempSum += stripe.newItem.item.amount
            }
            setSum(tempSum)
            setTimeLeft(calculateTimeLeft())
        }
    }, [stripe, calculateTimeLeft])


    return (
        <div>
            <Card style={{ padding: 15 }}>
                <h2>Current Tab</h2>
                <div className={styles.divider} />
                <br/>
                <div className={styles.totalContainer}>
                    <b>Subtotal</b>
                    <b>${sum.toFixed(2)}</b>
                </div>
                <div>
                    {/*{stripe?.tab?.items && stripe.tab.items.map(item => {*/}
                    {/*    return (*/}
                    {/*        <div className={styles.itemContainer} key={item.data.name}>*/}
                    {/*            <p style={{ margin: 0 }}>{item.data.name}</p>*/}
                    {/*            <p>${item.amount.toFixed(2)}</p>*/}
                    {/*        </div>*/}
                    {/*    )*/}
                    {/*})}*/}
                    {/*{stripe?.newItem?.item &&*/}
                    {/*    <div className={styles.itemContainer}>*/}
                    {/*        <p style={{ margin: 0 }}>{stripe.newItem.item.data.name}</p>*/}
                    {/*        <p>${stripe.newItem.item.amount.toFixed(2)}</p>*/}
                    {/*    </div>*/}
                    {/*}*/}
                    <br />
                    <div className={styles.timerBox}>
                        <b>{timeLeft}</b>
                    </div>
                    <br />
                    <div className={styles.cardFormButtonsContainer}>
                        <Button type={'button'} style={{ marginRight: 5 }}
                            href={`/#/location/?location_id=${location.select_location._id}`}>Go Back</Button>
                        {/*<Button primary disabled={stripe.loading || stripe.status !== 'unfulfilled'}*/}
                        {/*    onClick={() => closeTab(auth.user._id)}>Close*/}
                        {/*    Tab</Button>*/}
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

export default connect(mapStateToProps, {
    closeTab,
    submitCampaignData,
    queueSong,
    clearStripeMsg,
    clearCampaignMsg,
    clearSpotifyErrors,
    getDraftInvoice,
    tabExpired
})(Checkout);
