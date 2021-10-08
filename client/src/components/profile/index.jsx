import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import styles from './profile.module.css'
import {Button, Card, Form, Message} from "semantic-ui-react";
import {
    createSetupIntent,
    getPastTabs,
    getPaymentDetails,
    markComplete,
    markProcessing,
    updatePaymentMethod
} from "../../actions/stripeActions";
import {CardElement, Elements, PaymentRequestButtonElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import {deleteUser, updateUser} from "../../actions/authActions";

function Profile(props) {
    const [stripePromise] = useState(() => loadStripe('pk_test_51JWi5VF1ZFxObEV7LvPvFO1JN2lbNwc3HjjGRHeUnWsl8POZ2jR151PHL2tnjcpVdqeOn1rGZ7SQJSzUMxXPoSRa00opX0TiTk'))
    return (
        <div className={styles.profileContainer}>
            <Elements stripe={stripePromise}>
                <EndUserDashboard {...props} />
            </Elements>
        </div>
    )
}

function EndUserDashboard(props) {
    const {stripe, auth} = props
    const [msg, setMsg] = useState()
    useEffect(() => {
        if (stripe) {
            setMsg(stripe.msg)
        }
    }, [stripe])

    return (
        <div>
            <br/>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <h1 style={{textAlign: "center"}}>Welcome, {auth.user.name}!</h1>
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
                {auth.user.type === 'customer' &&
                <PaymentOptions {...props} setMsg={setMsg}/>}
                {auth.user.type === 'customer' &&
                <History {...props}/>
                }
            </Card.Group>
        </div>
    )
}

function AccountSettings(props) {
    const {auth, updateUser, deleteUser} = props
    const [name, setName] = useState(auth.user.name)
    const [email, setEmail] = useState(auth.user.email)

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
            _id: auth.user._id
        }
        updateUser(modifiedUser)
    }

    function handleDelete() {
        if (window.confirm("Are you sure you want to delete your account? \nThis action is irreversible and will result in a lose of data.")) deleteUser(auth.user._id)
    }

    return (
        <Card>
            <div className={styles.userAccountSettings}>
                <h2>Account</h2>

                <br/>
                <Form style={{width: '90%'}}>
                    <Form.Input placeholder="Email" name="email" required value={email} onChange={handleChange}/>
                    <Form.Input placeholder='Name' name="name" required value={name} onChange={handleChange}/>
                </Form>
                <br/>
                <div className={styles.buttonContainer}>
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

    const {auth, stripe, getPastTabs} = props

    useEffect(() => {
        if (auth.user) {
            getPastTabs(auth.user._id)
        }
    }, [auth.user, getPastTabs])

    return (
        <Card>
            <div className={styles.userAccountSettings}>
                <h2>History</h2>
                <div className={styles.divider}/>
                <br/>
                {(stripe?.pastTabs?.length ?? 0) > 0 &&
                stripe.pastTabs.map(tab => {
                    const date = new Date(tab.timeWillBeSubmitted * 1);
                    // Returns 0-11 so must add 1 to month
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    const year = date.getFullYear();
                    return (
                        <ul style={{margin: 0, padding: 0}} key={`${tab.timeWillBeSubmitted}`}>
                            <h4>{month}/{day}/{year} - {tab.locationName}</h4>
                            {tab.items.map(item => {
                                return (
                                    <li style={{marginLeft: 20}}
                                        key={`${tab.timeWillBeSubmitted}_${item.data.transactionID}`}>
                                        <p>{item.description}</p>
                                    </li>
                                )
                            })}
                            <br/>
                        </ul>
                    )
                })
                }
                {(stripe?.pastTabs?.length ?? 0) === 0 &&
                <b>No campaign history. Participate in campaigns and view that history here!</b>
                }
            </div>
        </Card>
    )
}

function PaymentOptions(props) {

    const useStripeInst = useStripe();
    const elements = useElements();
    const [nameOnCard, setNameOnCard] = useState('')
    const [cardApproved, setCardApproved] = useState(false)
    const [paymentRequest, setPaymentRequest] = useState(null);
    const [disabled, setDisabled] = useState(false);

    const {
        createSetupIntent,
        markProcessing,
        markComplete,
        stripe,
        auth,
        setMsg,
        updatePaymentMethod,
        getPaymentDetails
    } = props

    useEffect(() => createSetupIntent(), [createSetupIntent])


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
            paymentRequest.removeAllListeners()
            paymentRequest.on('paymentmethod', async (event) => {
                setDisabled(true)
                markProcessing()
                if (stripe.loading || stripe.status !== 'unfulfilled') {
                    event.complete('fail')
                    setMsg({msg: 'Something\'s not right...  Lets try that again'})
                    setDisabled(false)
                    return;
                }

                const result = await useStripeInst.confirmCardSetup(
                    stripe.clientSecret,
                    {payment_method: event.paymentMethod.id}
                );
                if (result.error) {
                    event.complete('fail')
                    markComplete('fail')
                    setMsg({msg: 'Could not update payment.  Please try a different card'})
                } else {
                    // even if the request comes back as successful double check payment intent
                    event.complete('success')
                    if (result.setupIntent.status === 'requires_action') {
                        // can redirect to bank for further action / confirmation, etc.
                        const {error} = await useStripeInst.confirmCardSetup(stripe.clientSecret);
                        if (error) {
                            console.error(error.message)
                            markComplete('fail')
                            setMsg({msg: 'Could not update payment.  Please try a different card'})
                        } else {
                            markComplete('success')
                        }
                    } else {
                        updatePaymentMethod(auth.user._id, result.setupIntent.payment_method)
                        markComplete('success')
                    }
                }
                setDisabled(false)
            })

        }
    }, [paymentRequest, stripe, auth, markProcessing, markComplete, updatePaymentMethod, setMsg, useStripeInst])

    useEffect(() => {
        if (elements) {
            createSetupIntent()
            setNameOnCard('')
            elements.getElement(CardElement).clear()
        }
    }, [auth.user.paymentMethod, createSetupIntent, elements])

    useEffect(() => {
        if (useStripeInst && elements) {
            // Creates payment request that checks if order can be fulfilled by and facilitates the use of apple/google pay
            const pr = useStripeInst.paymentRequest({
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
                    paymentRequest?.removeAllListeners()
                    setPaymentRequest(pr);
                }
            });
        }
    }, [useStripeInst, elements])

    useEffect(() => {
        if (auth.user) {
            getPaymentDetails(auth.user._id)
        }
    }, [auth.user, getPaymentDetails])

    const onSubmit = async e => {
        e.preventDefault()
        const result = await useStripeInst.confirmCardSetup(stripe.clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement), billing_details: {name: nameOnCard}
            }
        })
        if (result.error) {
            setMsg({msg: 'Could not update payment.  Please try a different card'})
        } else {
            updatePaymentMethod(auth.user._id, result.setupIntent.payment_method)
        }
    }

    return (
        <Card>
            <div className={styles.userAccountSettings}>
                <h2>Payment</h2>
                <br/>
                {stripe.paymentDetails &&
                <div id={'payment-details'} style={{width: '100%'}}>
                    <Card>
                        <div className={styles.cardDetails}>
                            <p>{stripe.paymentDetails.name}</p>
                            <p>{stripe.paymentDetails.brand.toUpperCase()} {stripe.paymentDetails.last4}</p>
                            <p>EXP: {stripe.paymentDetails.expMonth}/{stripe.paymentDetails.expYear}</p>
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
                            <Form.Button primary content='Submit'
                                         disabled={nameOnCard === '' || !cardApproved || disabled}/>
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
