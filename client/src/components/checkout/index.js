import React from 'react';
import {Button, ButtonGroup, Card, Form, Icon, Input} from "semantic-ui-react";
import styles from './checkout.module.css'
import {loadStripe} from "@stripe/stripe-js";
import {CardElement, Elements, PaymentRequestButtonElement, useElements, useStripe} from "@stripe/react-stripe-js";


function Checkout(props) {
    let item = props.item ?? {type: 'Queue Song', name: 'Have you ever seen the rain?', price: 0.99}; // TODO: make this a redux field

    const stripePromise = loadStripe('pk_test_51JWi5VF1ZFxObEV7LvPvFO1JN2lbNwc3HjjGRHeUnWsl8POZ2jR151PHL2tnjcpVdqeOn1rGZ7SQJSzUMxXPoSRa00opX0TiTk');

    return (
        <Elements stripe={stripePromise}>
            <div className={styles.checkoutContainer}>
                <Card style={{padding: 15}}>

                    <h2>Checkout</h2>
                    <div className={styles.divider}/>

                    <br/>

                    <div>
                        <h4 style={{margin: 0}}>{item.type}:</h4>
                        <br/>
                        <div className={styles.itemContainer}>
                            <p style={{margin: 0}}>{item.name}</p>
                            <p>${item.price}</p>
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
    let item = props.item ?? {type: 'Queue Song', name: 'Have you ever seen the rain?', price: 0.99}; // TODO: make this a redux field

    const handleSubmit = async (event) => {
        // Block native form submission.
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not loaded yet. Make sure to disable
            // form submission until Stripe.js has loaded.
            return;
        }

        // Get a reference to a mounted CardElement. Elements knows how
        // to find your CardElement because there can only ever be one of
        // each type of element.
        const cardElement = elements.getElement(CardElement);

        // Use your card Element with other Stripe.js APIs
        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            console.log('[error]', error);
        } else {
            console.log('[PaymentMethod]', paymentMethod);
        }
    };

    const [paymentRequest, setPaymentRequest] = React.useState(null);

    React.useEffect(() => {
        if (stripe) {
            const pr = stripe.paymentRequest({
                country: 'US',
                currency: 'usd',
                total: {
                    label: 'Demo total',
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
    }, [stripe]);

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
                <div>
                    <Form.Input required placeholder={'Name On Card'} />
                    {/*<Form.Input required placeholder={'Card Number'}/>*/}
                    {/*<div className={styles.smallInputContainer}>*/}
                    {/*    <Form.Input required placeholder={'CVV'} width={7}/>*/}
                    {/*    <Form.Input placeholder={'EXP'} width={7}/>*/}
                    {/*</div>*/}
                </div>
                <br/>

                <div className={styles.cardContainer}> {/* TODO: Match style to semantic ui (or vice versa)*/}
                    <CardElement />
                </div>

                <br/>

                <div className={styles.cardFormButtonsContainer}>
                    <Form.Button type={'button'} style={{marginRight: 5}}>Cancel</Form.Button>
                    <Form.Button primary>Submit</Form.Button>
                </div>
            </Form>
        </div>
    )
}

export default Checkout;
