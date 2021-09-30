import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Form, Icon, Input, Message } from "semantic-ui-react";
import styles from './checkout.module.css'
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, PaymentRequestButtonElement, useElements, useStripe } from "@stripe/react-stripe-js";
import {
    addInvoiceItem,
    closeTab,
    createPaymentIntent, // NOT BEING USED
    getDraftInvoice,
    markComplete, // NOT BEING USED
    markProcessing // NOT BEING USED
} from "../../actions/stripeActions";
import {submitCampaignData} from "../../actions/campaignActions"
import { connect } from "react-redux";
import history from '../../history'
import {queueSong} from "../../actions/spotifyActions";

/**
 * Checkout form for rendering tabs (3 conditions -- Has open tab, wants to open tab, has no tab and doesnt want to start a tab)
 * @param props
 * @return {JSX.Element}
 * @constructor
 */
function Checkout(props) {
    const stripePromise = loadStripe('pk_test_51JWi5VF1ZFxObEV7LvPvFO1JN2lbNwc3HjjGRHeUnWsl8POZ2jR151PHL2tnjcpVdqeOn1rGZ7SQJSzUMxXPoSRa00opX0TiTk');
    const [msg, setMsg] = useState()
    // Needs to get open invoice if exists
    useEffect(() => {
        if (props.auth.user) {
            props.getDraftInvoice(props.auth.user._id)
        }
    }, [props.auth])
    useEffect(() => {
        setMsg(props.stripe.msg?.msg ?? '')
    }, [props.stripe.msg])

    useEffect(() => {
        setMsg(props.spotify.error)
    }, [props.spotify.error])

    useEffect(() => {
        if (props.campaign.msg !== '') {
            setMsg(props.campaign.msg)
        }
    }, [props.campaign.msg])

    useEffect(() => {
        if ((props.stripe?.localTab?.item ?? false) && props.campaign?.last_submitted === props.stripe?.localTab?.data?.transactionID && !props.campaign.loading && !props.stripe.loading && props.stripe.lastAdded !== props.campaign.last_submitted) {
            props.addInvoiceItem(props.auth.user._id, props.stripe.localTab.item, props.location.select_location.name)
        }
    }, [props.campaign.last_submitted])

    return (
        <Elements stripe={stripePromise}>
            <div className={styles.checkoutContainer}>
                {msg && <Message><Message.Header>{msg}<br/><a href={`/#/location/?location_id=${props.location.select_location._id}`}>Participate in Another Campaign!</a></Message.Header></Message>}
                {props.stripe.tab &&
                    <ExistingTab {...props} />
                }
                {!props.stripe.tab && props.stripe.localTab &&
                    <NewTab {...props} />
                }
                {!props.stripe.tab && !props.stripe.localTab &&
                    <NoTab />
                }

                {/*NEED TO INCLUDE THE FOLLOWING IF WANT ALTERNATE PAYMENT*/}

                {/*{(props.stripe.tab || props.stripe.localTab) &&*/}
                {/*<CheckoutForm {...props} />*/}
                {/*}*/}

            </div>
        </Elements>
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

    const handleSubmit = async (event) => {
        // Block native form submission.
        event.preventDefault();

        if (tac && payAgreement) {
            if (props.stripe.localTab.item.data.type !== 'song') {
                props.submitCampaignData(props.stripe.localTab.item)
            }
            else {
                props.queueSong(props.stripe.localTab.item)
            }
        }
    }

    return (
        <div>
            <Card style={{ padding: 15 }}>
                <h2>Open a New Tab</h2>
                <div className={styles.divider} />
                <div>
                    {props.stripe.localTab.item &&
                        <div className={styles.itemContainer}>
                            <p style={{ margin: 0 }}>{props.stripe.localTab.item.data.name}</p>
                            <p>${props.stripe.localTab.item.amount}</p>
                        </div>
                    }
                    <div className={styles.itemContainer}>
                        <p style={{ margin: 0 }}>Fee to open new tab</p>
                        <p>${feePrice.toFixed(2)}</p>
                    </div>
                    <div className={styles.totalContainer}>
                        <b>Subtotal</b>
                        <b>${(props.stripe.localTab.item.amount + feePrice).toFixed(2)}</b>
                    </div>
                </div>
                <br />
                <b style={{ textAlign: "center" }}>*Payment will be captured in 24 hours from the card stored in
                    profile*</b>
                <br />

                <Form onSubmit={handleSubmit}>
                    <div className={styles.termsAndConditions}>
                        <Form.Checkbox style={{ marginRight: 10 }} checked={tac} onChange={() => setTac(!tac)} />
                        <p>I have read the <a href='https://www.google.com'>Terms and Conditions</a>.</p>
                    </div>
                    <br />
                    <div className={styles.termsAndConditions}>
                        <Form.Checkbox style={{ marginRight: 10 }} checked={payAgreement}
                            onChange={() => setPayAgreement(!payAgreement)} />
                        <p>I understand my saved card will be charged in 24 hours to settle my tab.</p>
                    </div>
                    <br />
                    <div className={styles.cardFormButtonsContainer}>
                        {/* <Form.Button type={'button'} style={{ marginRight: 5 }}
                            onClick={() => history.push('/')}>Home</Form.Button> */}
                        <Form.Button primary
                            disabled={props.stripe.loading || props.stripe.status !== 'unfulfilled' || !tac || !payAgreement}>Open
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
    const feePrice = 0.40;

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
            if (props.stripe.localTab) {
                tempSum += props.stripe.localTab.item.amount
            }
            setSum(tempSum)
            setTimeLeft(calculateTimeLeft())
        }
    }, [props.stripe.tab])


    return (
        <div>
            <Card style={{ padding: 15 }}>
                <h2>Current Tab</h2>
                <div className={styles.divider} />
                <div>
                    {props.stripe?.tab?.items && props.stripe.tab.items.map(item => {
                        return (
                            <div className={styles.itemContainer}>
                                <p style={{ margin: 0 }}>{item.data.name}</p>
                                <p>${item.amount.toFixed(2)}</p>
                            </div>
                        )
                    })}
                    {props.stripe?.localTab?.items &&
                        <div className={styles.itemContainer}>
                            <p style={{ margin: 0 }}>{props.stripe.localTab.item.data.name}</p>
                            <p>${props.stripe.localTab.item.amount}</p>
                        </div>
                    }
                    <div className={styles.totalContainer}>
                        <b>Subtotal</b>
                        <b>${sum.toFixed(2)}</b>
                    </div>
                    <br />
                    <div className={styles.timerBox}>
                        <b>{timeLeft}</b>
                    </div>
                    <br />
                    <div className={styles.cardFormButtonsContainer}>
                        <Button type={'button'} style={{ marginRight: 5 }}
                            onClick={() => history.push('/')}>Cancel</Button>
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
    createPaymentIntent, // NOT BEING USED
    markProcessing, // NOT BEING USED
    markComplete, // NOT BEING USED
    getDraftInvoice,
    closeTab,
    submitCampaignData,
    queueSong,
    addInvoiceItem
})(Checkout);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// THESE ARE METHODS THAT MIGHT BE USED LATER.  THEY INVOLVE MAKING CURRENT TRANSACTIONS NOT MAKING A TAB //////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function CheckoutForm(props) {
    const stripe = useStripe();
    const elements = useElements();
    let item = props.item ?? {
        type: 'Queue Song',
        name: 'Have you ever seen the rain?',
        amount: 99,
        transactionID: '517',
        campaign_id: 'campaign_id',
        location_id: 'location_id'
    }; // TODO: make this a redux field
    const [paymentRequest, setPaymentRequest] = React.useState(null);
    const [tac, setTac] = useState(false);
    const [payAgreement, setPayAgreement] = useState(false)

    // Create payment intent for transaction processing and payment request for google/apple pay support
    useEffect(() => {

        if (stripe && elements) {
            // Creates payment intent that can be fulfilled by either a card payment or using the browser supported apple/google pay button
            props.createPaymentIntent('card', 'usd', item.price, item.transactionID)

            // Creates payment request that checks if order can be fulfilled by and facilitates the use of apple/google pay
            const pr = stripe.paymentRequest({
                country: 'US',
                currency: 'usd',
                total: {
                    label: 'Apokoz Total',
                    amount: Math.floor(item.price * 100),
                },
                requestPayerName: true,
                requestPayerEmail: true,
            });

            // Check the availability of the Payment Request API.
            pr.canMakePayment().then(result => {
                if (result) {
                    setPaymentRequest(pr);
                }
            });
        }
    }, [stripe, elements])

    useEffect(() => {
        if (paymentRequest) {
            paymentRequest.on('paymentmethod', async (event) => {
                props.markProcessing()
                if (props.stripe.loading || props.stripe.status !== 'unfulfilled' || props.stripe.transactionID === '-1') {
                    event.complete('fail')
                    return;
                }

                const { error, paymentIntent } = await stripe.confirmCardPayment(
                    props.stripe.clientSecret,
                    { payment_method: event.paymentMethod.id },
                    { handleActions: false }
                );
                if (error) {
                    event.complete('fail')
                    props.markComplete('fail')
                } else {
                    // even if the request comes back as successful double check payment intent
                    event.complete('success')
                    if (paymentIntent.status === 'requires_action') {
                        // can redirect to bank for further action / confirmation, etc.
                        const { error } = await stripe.confirmCardPayment(props.stripe.clientSecret);
                        if (error) {
                            console.error(error.message)
                            props.markComplete('fail')
                            // TODO: Error handling
                        } else {
                            props.markComplete('success')
                            // TODO: Success Logic
                        }
                    } else {
                        props.markComplete('success')
                        // TODO: Success Logic
                    }
                }
            })
        }
    }, [paymentRequest, props.stripe])

    // Handles submit logic for manually entering credit cards
    const handleSubmit = async (event) => {
        // Block native form submission.
        event.preventDefault();
        // TODO: Make sure item object here has the redux state user object (needed for stripe: see submitCampaignData for usage)
        if (tac && payAgreement) {
            if (props.stripe.localTab.item.data.type !== 'song') {
                props.submitCampaignData(props.stripe.localTab.item)
            }
            else {
                props.queueSong(props.stripe.localTab.item)
            }
        }

        if (!stripe || !elements || props.stripe.loading || props.stripe.status === 'succeeded') {
            // Stripe.js has not loaded yet. Make sure to disable
            // form submission until Stripe.js has loaded.
            return;
        }

        if (item.transactionID !== props.stripe.transactionID) {
            props.createPaymentIntent('card', 'usd', item.price, item.transactionID)
            return
        }

        props.markProcessing()
        const { paymentIntent } = await stripe.confirmCardPayment(
            props.stripe.clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement)
            }
        }
        )
        props.markComplete(paymentIntent?.status ?? 'error');
        console.log('payment intent status: ' + paymentIntent?.status ?? 'error');
        if (paymentIntent?.status === 'succeeded') {
            // TODO: payment worked logic
        }
    };


    return (
        <div>
            {paymentRequest &&
                <div id='browser-card-support'>
                    <PaymentRequestButtonElement options={{ paymentRequest }} />
                    <br />
                    <div className={styles.divider} />
                    <br />
                </div>
            }

            <Form onSubmit={handleSubmit}>
                <div id='nameInput' style={{ marginBottom: 10 }}>
                    <Form.Input required placeholder={'Name On Card'} />
                </div>
                <div className={styles.cardContainer}> {/* TODO: Match style to semantic ui (or vice versa)*/}
                    <CardElement />
                </div>
                <br />
                <div className={styles.termsAndConditions}>
                    <Form.Checkbox style={{ marginRight: 10 }} checked={tac} onChange={() => setTac(!tac)} />
                    <p>I have read the <a href='https://www.google.com'>Terms and Conditions</a>.</p>
                </div>
                <br />
                <div className={styles.termsAndConditions}>
                    <Form.Checkbox style={{ marginRight: 10 }} checked={payAgreement}
                        onChange={() => setPayAgreement(!payAgreement)} />
                    <p>I understand my saved card will be charged in 24 hours to settle my tab.</p>
                </div>
                <br />
                <div className={styles.cardFormButtonsContainer}>
                    <Form.Button type={'button'} style={{ marginRight: 5 }}>Cancel</Form.Button>
                    <Form.Button primary
                        disabled={props.stripe.loading || props.stripe.status !== 'unfulfilled' || !tac || !payAgreement}>Open
                        Tab</Form.Button>
                </div>
            </Form>
        </div>
    )
}
