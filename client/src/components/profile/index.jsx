import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import styles from './profile.module.css'
import {Button, Card, Form, Message} from "semantic-ui-react";
import {
    createSetupIntent,
    getPaymentDetails,
    markComplete,
    markProcessing,
    updatePaymentMethod,
    getPastTabs
} from "../../actions/stripeActions";
import {CardElement, Elements, PaymentRequestButtonElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import {updateUser, deleteUser} from "../../actions/authActions";

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
    const [msg, setMsg] = useState()
    useEffect(() => {
        if (props.stripe) {
            setMsg(props.stripe.msg)
        }
    }, [props.stripe])
    return (
        <div>
            <br/>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <h1 style={{textAlign: "center"}}>Welcome, {props.auth.user.name}!</h1>
                <div className={styles.divider}/>
            </div>
            <br/>
            {msg && msg.msg &&
            <Message negative className={styles.message}>
                <Message.Header>{msg.msg}</Message.Header>
            </Message>
            }
            <Card.Group className={styles.endUserDashboardContainer}>
                <AccountSettings {...props} />
                {props.auth.user.type === 'customer' && <PaymentOptions {...props} />}
                <History {...props}/>
            </Card.Group>
        </div>
    )
}

function AccountSettings(props) {
    const [name, setName] = useState(props.auth.user.name)
    const [email, setEmail] = useState(props.auth.user.email)

    function handleChange(e, data) {
        if (data.name === 'name') {
            setName(data.value)
        } else if (data.name === 'email') {
            setEmail(data.value)
        }
    }

    function handleSave() {
        const modifiedUser = {
            name: name,
            email: email,
            _id: props.auth.user._id
        }
        props.updateUser(modifiedUser)
    }

    function handleDelete() {
        if (window.confirm("Are you sure you want to delete your account? \nThis action is irreversible and will result in a lose of data.")) props.deleteUser(props.auth.user._id)
    }

    return (
        <Card>
            <div className={styles.userAccountSettings}>
                <h2>Account</h2>
                {/* <div style={{backgroundColor: 'gray', width: 200, height: 150, borderRadius: 10}}>
                    Profile Pic
                </div> */}
                <br/>
                <Form style={{width: '90%'}}>
                    <Form.Input placeholder="Email" name="email" required value={email} onChange={handleChange}/>
                    <Form.Input placeholder='Name' name="name" required value={name} onChange={handleChange}/>
                </Form>
                <br/>
                <div className={styles.buttonContainer}>
                    {/* TODO: Make Buttons work, reset fields */}
                    <Button primary onClick={handleSave}>Save</Button>
                    <Button style={{marginRight: 10}}>Cancel</Button>
                </div>
            </div>
            <Button style={{width: '90%', marginRight: 'auto', marginLeft: 'auto', marginBottom: '10px'}} basic
                    color="red" onClick={handleDelete}>Delete Account</Button>

        </Card>
    )
}

function History(props) {

    useEffect(() => {
        if (props.auth?.user) {
            props.getPastTabs(props.auth.user._id)
        }
    }, [props.auth])

    return (
        <Card>
            <div className={styles.userAccountSettings}>
                <h2>History</h2>
                <div className={styles.divider}/>
                <br/>
                {(props.stripe?.pastTabs?.length ?? 0) > 0 &&
                props.stripe.pastTabs.map(tab => {
                    const date = new Date(tab.timeWillBeSubmitted * 1);
                    // Returns 0-11 so must add 1 to month
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    const year = date.getFullYear();
                    return (
                        <ul style={{margin: 0, padding: 0}}>
                            <h4>{month}/{day}/{year} - {tab.locationName}</h4>
                            {tab.items.map(item => {
                                return (
                                    <li style={{marginLeft: 20}}>
                                        <p>{item.description}</p>
                                    </li>
                                )
                            })}
                            <br/>
                        </ul>
                    )
                })
                }
                {(props.stripe?.pastTabs?.length ?? 0) === 0 &&
                <b>No campaign history. Participate in campaigns and view that history here!</b>
                }
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

    useEffect(() => props.createSetupIntent(), [])


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
            props.createSetupIntent()
            setNameOnCard('')
            elements.getElement(CardElement).clear()
        }
    }, [props.stripe.paymentDetails])

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
        if (props.auth?.user) {
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
        } else {
            props.updatePaymentMethod(props.auth.user._id, result.setupIntent.payment_method)
        }
    }

    return (
        <Card>
            <div className={styles.userAccountSettings}>
                <h2>Payment</h2>
                <br/>
                {props.stripe.paymentDetails &&
                <div id={'payment-details'} style={{width: '100%'}}>
                    <Card>
                        <div className={styles.cardDetails}>
                            <p>{props.stripe.paymentDetails.name}</p>
                            <p>{props.stripe.paymentDetails.brand.toUpperCase()} {props.stripe.paymentDetails.last4}</p>
                            <p>EXP: {props.stripe.paymentDetails.expMonth}/{props.stripe.paymentDetails.expYear}</p>
                        </div>
                    </Card>
                    <h4 style={{textAlign: 'center'}}>Change Payment</h4>
                </div>

                }

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
                            <Form.Input name='nameOnCard' value={nameOnCard}
                                        onChange={(e) => setNameOnCard(e.target.value)} required
                                        placeholder='Name On Card'/>
                        </Form.Field>
                        <Card style={{padding: 10}}>
                            <CardElement/>
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


Profile.propTypes = {
    auth: PropTypes.object.isRequired,
    stripe: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    stripe: state.stripe
})
export default connect(mapStateToProps, {
    getPaymentDetails,
    updatePaymentMethod,
    markProcessing,
    markComplete,
    createSetupIntent,
    updateUser,
    deleteUser,
    getPastTabs
})(Profile)
