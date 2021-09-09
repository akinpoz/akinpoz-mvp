var express = require('express')
var router = express.Router()
const dotenv = require('dotenv');
const bodyParser = require('body-parser')
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.get('/config', (req, res) => {
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});

router.post('/create-payment-intent', async function (req, res) {
    const {paymentMethodType, currency, amount, transactionID} = req.body;
    try {
        const paymentIntent =  await stripe.paymentIntents.create({
            payment_method_types: [paymentMethodType],
            amount: Math.floor(amount * 100),
            currency: currency,
            statement_descriptor: 'Apokoz',
        })
        res.send({clientSecret: paymentIntent.client_secret, transactionID: transactionID})
    } catch (e) {
        console.log(e.message)
        return res.status(400).send({
            error: {
                message: e.message
            }
        })
    }
})

router.post('/webhook', bodyParser.raw({type: 'application/json'}), async (req, res) => {
    let data, eventType;

    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;
        let signature = req.headers['stripe-signature'];
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed. ` + err.message);
            return res.sendStatus(400);
        }
        data = event.data;
        eventType = event.type;
    } else {
        // Webhook signing is recommended, but if the secret is not configured in `config.js`,
        // we can retrieve the event data directly from the request body.
        data = req.body.data;
        eventType = req.body.type;
    }

    if (eventType === 'payment_intent.succeeded') {
        // Funds have been captured
        // Fulfill any orders, e-mail receipts, etc
        // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
        console.log('💰 Payment captured!');
    } else if (eventType === 'payment_intent.payment_failed') {
        console.log('❌ Payment failed.');
    } else if (eventType === 'payment_method.attached') {
        console.log('Payment Method Attached')
    }
    else {
        console.log('Unhandled event type: ' + eventType)
    }
    res.sendStatus(200);
});

module.exports = router;
