import React, {useEffect, useState} from 'react';
import {Button, ButtonGroup, Card, Form, Icon, Input} from "semantic-ui-react";
import styles from './checkout.module.css'
import {loadStripe} from "@stripe/stripe-js";
import {CardElement, Elements, PaymentRequestButtonElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {
    addInvoiceItem,
    createPaymentIntent,
    getOpenInvoice,
    markComplete,
    markProcessing
} from "../../actions/stripeActions";
import {connect} from "react-redux";


function Checkout(props) {
    let item = props.item ?? {type: 'Queue Song', name: 'Have you ever seen the rain?', price: 0.99, transactionID: '517'}; // TODO: make this a redux field
    const stripePromise = loadStripe('pk_test_51JWi5VF1ZFxObEV7LvPvFO1JN2lbNwc3HjjGRHeUnWsl8POZ2jR151PHL2tnjcpVdqeOn1rGZ7SQJSzUMxXPoSRa00opX0TiTk');
    const tabFee = 0.40;
    return (
        <Elements stripe={stripePromise}>
            <div className={styles.checkoutContainer}>
                <Card style={{padding: 15}}>
                    <h2>Open a New Tab</h2>
                    <div className={styles.divider}/>
                    <div>
                        <h4 style={{margin: 0}}>{item.type}:</h4>
                        <br/>
                        <div className={styles.itemContainer}>
                            <p style={{margin: 0}}>{item.name}</p>
                            <p>${item.price}</p>
                        </div>
                        <div className={styles.itemContainer}>
                            <p style={{margin: 0}}>Fee to open new tab</p>
                            <p>${tabFee.toFixed(2)}</p>
                        </div>
                        <div className={styles.totalContainer}>
                            <b>Subtotal</b>
                            <b>${(item.price + tabFee).toFixed(2)}</b>
                        </div>
                    </div>
                    <br/>
                    <h4 style={{margin: 0}}>Payment:</h4>
                    <br/>
                    <CheckoutForm {...props} />
                </Card>
            </div>
        </Elements>
    )
}

function CheckoutForm(props) {
    const stripe = useStripe();
    const elements = useElements();
    let item = props.item ?? {type: 'Queue Song', name: 'Have you ever seen the rain?', price: 0.99, transactionID: '517'}; // TODO: make this a redux field
    const [paymentRequest, setPaymentRequest] = React.useState(null);

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

                const {error, paymentIntent} = await stripe.confirmCardPayment(
                    props.stripe.clientSecret,
                    {payment_method: event.paymentMethod.id},
                    {handleActions: false}
                );
                if (error) {
                    event.complete('fail')
                    props.markComplete('fail')
                } else {
                    // even if the request comes back as successful double check payment intent
                    event.complete('success')
                    if (paymentIntent.status === 'requires_action') {
                        // can redirect to bank for further action / confirmation, etc.
                        const {error} = await stripe.confirmCardPayment(props.stripe.clientSecret);
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

    useEffect(() => {
        if (props.auth.user) {
            props.addInvoiceItem(props.auth.user._id, {amount: 100, description: 'item'})
        }
    }, [props.auth.user])

    // Handles submit logic for manually entering credit cards
    const handleSubmit = async (event) => {
        // Block native form submission.
        event.preventDefault();

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
        const {paymentIntent} = await stripe.confirmCardPayment(
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
                <PaymentRequestButtonElement options={{paymentRequest}}/>
                <br/>
                <div className={styles.divider}/>
                <br/>
            </div>
            }

            <Form onSubmit={handleSubmit}>
                <div id='nameInput' style={{marginBottom: 10}}>
                    <Form.Input required placeholder={'Name On Card'} />
                </div>
                <div className={styles.cardContainer}> {/* TODO: Match style to semantic ui (or vice versa)*/}
                    <CardElement />
                </div>
                <br/>
                <div className={styles.termsAndConditions}>
                    <Form.Checkbox style={{marginRight: 10}}/>
                    <p>I have read the <a href='https://www.google.com'>Terms and Conditions</a>.</p>
                </div>
                <br/>
                <div className={styles.termsAndConditions}>
                    <Form.Checkbox style={{marginRight: 10}}/>
                    <p>I understand this card will be charged in 24 hours to settle my tab.</p>
                </div>
                <br/>
                <div className={styles.cardFormButtonsContainer}>
                    <Form.Button type={'button'} style={{marginRight: 5}}>Cancel</Form.Button>
                    <Form.Button primary disabled={props.stripe.loading || props.stripe.status !== 'unfulfilled'}>Open Tab</Form.Button>
                </div>
            </Form>
        </div>
    )
}

const mapStateToProps = (state) => ({
    stripe: state.stripe,
    auth: state.auth
})

export default connect(mapStateToProps, {createPaymentIntent, markProcessing, markComplete, getOpenInvoice, addInvoiceItem})(Checkout);
