var express = require('express')
var router = express.Router()
const dotenv = require('dotenv');
const bodyParser = require('body-parser')
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
var User = require('../../models/User');
const {decrypt, encrypt} = require("./encryption");


router.get('/config', (req, res) => {
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});

router.post('/create-payment-intent', async function (req, res) {
    const {paymentMethodType, currency, amount, transactionID} = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            payment_method_types: [paymentMethodType],
            amount: Math.floor(amount * 100),
            currency: currency,
            statement_descriptor: 'Apokoz',
        })
        res.send({clientSecret: paymentIntent.client_secret, transactionID: transactionID})
    } catch (e) {
        console.error(e.message)
        return res.status(400).send({
            error: {
                message: e.message
            }
        })
    }
})

router.post('/create-setup-intent', async function (req, res) {
    try {
        const setupIntent = await stripe.setupIntents.create()
        res.send(setupIntent.client_secret)
    } catch (e) {
        console.error(e.message)
        return res.status(400).send({
            error: {
                message: e.message
            }
        })
    }
})

router.post('/create-customer', async function (req, res) {
    let params = req.body;
    try {
        let customer;
        if (params.paymentMethod) {
            customer = await stripe.customers.create({
                payment_method: params.paymentMethod,
                name: params.name,
                email: params.email
            })
        } else {
            customer = await stripe.customers.create({name: params.name, email: params.email})
        }
        res.status(200).send(customer.id)
    } catch (e) {
        console.error(e.message)
        return res.status(400).send({
            error: {
                message: e.message
            }
        })
    }
})

router.post('/get-payment-details/', async function (req, res) {
    let params = req.body;
    User.findOne({ _id: params.userID }).then(user => {

        if (!user.paymentMethod || user.paymentMethod === []) {
            res.status(200).send("null")
        }

        let paymentMethod = decrypt(user.paymentMethod)

        stripe.paymentMethods.retrieve(paymentMethod).then((payment, err) => {
            if (err) {
                console.error(err.message)
                res.status(400).send({
                    error: {
                        message: err.message
                    }
                })
            }
            let pm = {
                name: payment.billing_details.name,
                last4: payment.card.last4,
                expMonth: payment.card.exp_month,
                expYear: payment.card.exp_year,
                brand: payment.card.brand
            }
            res.status(200).send(pm)
        })
    })
})

router.post('/update-payment', async function (req, res) {
    let {userID, paymentMethod} = req.body;
    let user = await User.findOne({_id: userID})

    if (!user) {
        console.error('User not found')
        res.status(400).send('User not found')
        return;
    }
    let customerID = decrypt(user.customerID)
    let oldPm = decrypt(user.paymentMethod)

    if (oldPm && oldPm !== '') {
        try {
            let {pm, error} = await stripe.paymentMethods.detach(oldPm)
        } catch (e) {
            console.error(e.message)
        }
    }
    stripe.paymentMethods.attach(paymentMethod, {customer: customerID}).then((newPm, e) => {
        if (e) {
            res.status(400).send({
                error: e.message
            })
        }
        let pm = {
            name: newPm.billing_details.name,
            last4: newPm.card.last4,
            expMonth: newPm.card.exp_month,
            expYear: newPm.card.exp_year,
            brand: newPm.card.brand
        }
        User.findOneAndUpdate({_id: userID}, {paymentMethod: encrypt(newPm.id)}).then((user, err) => {
            if (err) {
                res.status(400).send({error: err.message})
            }
            res.status(200).send(pm)
        })
    })
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
    } else {
        console.log('Unhandled event type: ' + eventType)
    }
    res.sendStatus(200);
});

module.exports = router;
