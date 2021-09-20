import React, {useState, useEffect} from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styles from './profile.module.css'
import {Button, Card, Form} from "semantic-ui-react";
import {
    createSetupIntent,
    getPaymentDetails,
    markComplete,
    markProcessing,
    updatePaymentMethod
} from "../../actions/stripeActions";
import {CardElement, Elements, PaymentRequestButtonElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";

function Profile(props) {
    const stripePromise = loadStripe('pk_test_51JWi5VF1ZFxObEV7LvPvFO1JN2lbNwc3HjjGRHeUnWsl8POZ2jR151PHL2tnjcpVdqeOn1rGZ7SQJSzUMxXPoSRa00opX0TiTk');
    return (
        <div className={styles.profileContainer}>
            <Elements stripe={stripePromise}>
                <EndUserDashboard {...props} />
            </Elements>
        </div>
    )
}

function EndUserDashboard(props) {
    return (
        <div>
            <br/>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <h1 style={{textAlign: "center"}}>Welcome, {props.auth.user.name}!</h1>
                <div className={styles.divider}/>
            </div>
            <br/>
            <Card.Group className={styles.endUserDashboardContainer}>
                <AccountSettings/>
                <PaymentOptions {...props}/>
                <History/>
            </Card.Group>
        </div>
    )
}

function AccountSettings() {
    // TODO: Make these inputs update user in backend
    return (
        <Card>
            <div className={styles.userAccountSettings}>
                <div style={{backgroundColor: 'gray', width: 200, height: 150, borderRadius: 10}}>
                    Profile Pic
                </div>
                <br/>
                <Form style={{width: '90%'}}>
                    <Form.Input placeholder="Email" required />
                    <Form.Input placeholder='Username' required />
                    <Form.Input placeholder='Password' required />
                </Form>
                <br/>
                <div className={styles.buttonContainer}>
                    {/* TODO: Make Buttons work, reset fields */}
                    <Button primary>Save</Button>
                    <Button style={{marginRight: 10}}>Cancel</Button>
                </div>
            </div>
        </Card>
    )
}

function History() {

    // TODO: Figure out what exactly we want to report here.  What information do we need to display?
    return (
        <Card>
            <div className={styles.userAccountSettings}>
                <h2>History</h2>
                <br/>
                <div className={styles.divider}/>
                <br/>
                <LocationHistory name='Restaurant 1' />
                <br/>
                <div className={styles.divider}/>
                <br/>
                <LocationHistory name='Restaurant 2' />
            </div>
        </Card>
    )
}

function PaymentOptions(props) {

    const stripe = useStripe();
    const elements = useElements();
    const [nameOnCard, setNameOnCard] = useState('')
    const [cardApproved, setCardApproved] = useState(false)
    const [paymentRequest, setPaymentRequest] = useState(null);

    useEffect(() => {
        props.createSetupIntent()
    }, [])

    useEffect(() => {
        if (elements) {
            elements.getElement(CardElement).on("change", (event) => {
                if (event.complete && !event.error) {
                    if (!cardApproved) {
                        setCardApproved(true)
                    }
                } else {
                    setCardApproved(false)
                }
            })
        }
    }, [elements, cardApproved])

    useEffect(() => {
        if (paymentRequest) {
            paymentRequest.on('paymentmethod', async (event) => {
                props.markProcessing()
                if (props.stripe.loading || props.stripe.status !== 'unfulfilled') {
                    event.complete('fail')
                    return;
                }

                const result = await stripe.confirmCardSetup(
                    props.stripe.clientSecret,
                    {payment_method: event.paymentMethod.id}
                );
                if (result.error) {
                    event.complete('fail')
                    props.markComplete('fail')
                } else {
                    // even if the request comes back as successful double check payment intent
                    event.complete('success')
                    if (result.setupIntent.status === 'requires_action') {
                        // can redirect to bank for further action / confirmation, etc.
                        const {error} = await stripe.confirmCardSetup(props.stripe.clientSecret);
                        if (error) {
                            console.error(error.message)
                            props.markComplete('fail')
                            // TODO: Error handling
                        } else {
                            console.log('Needed action but successful')
                            props.markComplete('success')
                            // TODO: Success Logic
                        }
                    } else {
                        console.log('successful')
                        props.updatePaymentMethod(props.auth.user._id, result.setupIntent.payment_method)
                        props.markComplete('success')
                        // TODO: Success Logic
                    }
                }
            })
        }
    }, [paymentRequest, props.stripe])

    useEffect(() => {
        if (elements) {
            setNameOnCard('')
            props.createSetupIntent()
            elements.getElement(CardElement).clear()
        }
    }, [elements, props.stripe.paymentDetails])

    useEffect(() => {
        if (stripe && elements) {
            // Creates payment request that checks if order can be fulfilled by and facilitates the use of apple/google pay
            const pr = stripe.paymentRequest({
                country: 'US',
                currency: 'usd',
                total: {
                    label: 'Authorize Card For Apokoz',
                    amount: 0,
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
        if (props.auth.user) {
            props.getPaymentDetails(props.auth.user._id)
        }
    }, [props.auth])

    const onSubmit = async e => {
        e.preventDefault()
        const result = await stripe.confirmCardSetup(props.stripe.clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement), billing_details: {name: nameOnCard}
            }
        })
        if (result.error) {
            // TODO: Handle this
        }
        else {
            props.updatePaymentMethod(props.auth.user._id, result.setupIntent.payment_method)
        }
    }

    return (
        <Card>
            <div className={styles.userAccountSettings}>
                <h2>Payment Options</h2>
                {props.stripe.paymentDetails && <Card>
                    <div className={styles.cardDetails}>
                        <p>{props.stripe.paymentDetails.name}</p>
                        <p>{props.stripe.paymentDetails.brand.toUpperCase()} {props.stripe.paymentDetails.last4}</p>
                        <p>EXP: {props.stripe.paymentDetails.expMonth}/{props.stripe.paymentDetails.expYear}</p>
                    </div>
                </Card>}

                <h4>Change Payment</h4>
                <br/>
                <div className={styles.paymentInput}>
                    {paymentRequest &&
                    <div id='browser-card-support'>
                        <PaymentRequestButtonElement options={{paymentRequest}} type='button'/>
                        <br/>
                        <div className={styles.divider}/>
                        <br/>
                    </div>
                    }
                    <Form onSubmit={onSubmit}>
                        <Form.Field>
                            <Form.Input name='nameOnCard' value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)} required placeholder='Name On Card' />
                        </Form.Field>
                        <Card style={{padding: 10}} >
                            <CardElement />
                        </Card>
                        <div className={styles.buttonContainer}>
                            <Form.Button primary content='Submit' disabled={nameOnCard === '' || !cardApproved}/>
                        </div>
                    </Form>
                </div>

            </div>
        </Card>
    )
}

/**
 * Made Location History different because it will be used multiple times.  Takes in name as prop
 */
function LocationHistory(props) {
    // TODO: Figure out how history will be stored in the backend, and how the
    //  data will be passed through to this component

    return (
        <div>
            <h4>{props.name}</h4>
            <p>Entered raffle 10/10/21</p>
        </div>
    )
}


Profile.propTypes = {
    auth: PropTypes.object.isRequired,
    stripe: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    stripe: state.stripe
})
export default connect(mapStateToProps, {getPaymentDetails, updatePaymentMethod, markProcessing, markComplete, createSetupIntent})(Profile)
