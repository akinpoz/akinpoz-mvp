var express = require('express')
var router = express.Router()
const dotenv = require('dotenv');
const bodyParser = require('body-parser')
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
var User = require('../../models/User');
const {decrypt, encrypt} = require("./encryption");
const open = require("open");


router.get('/config', (req, res) => {
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
});

/**
 * Creates an intent for the user to save payment in stripe api without making a purchase.  returns client secret to process that
 */
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

/**
 * creates a stripe customer object to attach to a user object
 */
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

/**
 * gets card details saved to a given account (these are nonsensitive ie: last 4 digits, card type, name on card)
 */
router.post('/get-payment-details/', async function (req, res) {
    let params = req.body;
    User.findOne({_id: params.userID}).then(user => {

        if (!user.paymentMethod || user.paymentMethod.length === 0) {
            res.status(200).send("null")
            return;
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

/**
 * swaps payment info for a given account
 */
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

/**
 * Gets the editable (not paid) invoice to potentially add more items to
 */
router.post('/get-draft-invoice', async function (req, res) {
    let params = req.body;

    let customerID = await getCustomerID(params.userID, res)

    if (!customerID || customerID === '') {
        console.error('Could not get customer ID')
        res.status(400).send('Could not get customer ID')
        return;
    }

    let invoices = await stripe.invoices.list({customer: customerID, status: 'draft'})

    let invoice = invoices.data.pop();

    if (invoices.data.length > 0) {
        invoices.data.forEach(i => {
            stripe.invoices.finalizeInvoice(i.id)
        })
    }
    if (invoice !== undefined) {
        let items = []
        for (let line of invoice.lines.data) {
            var amount = line.description.includes("fee") ? parseFloat(line.amount / 100) : line.amount
            items.push({
                amount: amount,
                description: line.description,
                createdAt: line.metadata['createdAt'],
                data: {
                    timestamp: line.metadata['timestamp'],
                    type: line.metadata['type'],
                    campaign_id: line.metadata['campaign_id'],
                    location_id: line.metadata['location_id'],
                    transactionID: line.metadata['transactionID'],
                    name: line.metadata['name']
                }
            })
        }
        const tab = {
            amount: invoice.total,
            timeWillBeSubmitted: invoice.metadata['timeWillBeSubmitted'],
            items: items,
            fromOnline: true,
            locationName: invoice.metadata['locationName']
        }
        res.status(200).send(tab)
    } else {
        res.status(200).send(null)
    }
})

/**
 * adds an invoice item with relevant reporting data.  Adds fee if applicable.  (adds timestamp, type, campaign id, location id, transaction id and name)
 */
router.post('/add-invoice-item', async function (req, res) {
    let params = req.body;
    console.log(JSON.stringify(params))
    // Fee in cents (usd)
    const feeAmount = 40;
    const feeDescription = 'Tab fee'
    const timeout = 200000

    let {customerID, paymentID} = await getCustomerAndPaymentID(params.userID, res)
    if (!customerID || customerID === '') {
        console.error('User has no customer ID')
        res.status(400).send('User has no customer ID')
        return
    }

    let openInvoices = await stripe.invoices.list({customer: customerID, status: 'open'})
    if (openInvoices && openInvoices.data && openInvoices.data.length > 0) {
        res.status(400).send('You currently have an open tab.  Please pay that before opening a new tab.')
        return
    }

    let invoices = await stripe.invoices.list({customer: customerID, status: 'draft'})
    let invoice

    if (invoices.data && invoices.data.length !== 0) {
        invoice = invoices.data.pop()
        let item = await stripe.invoiceItems.create({
            customer: customerID,
            invoice: invoice.id,
            amount: params.item.amount,
            description: params.item.description,
            currency: 'usd',
            metadata: {
                'timestamp': params.item.data.timestamp.toString(),
                'type': params.item.data.type.toString(),
                'campaign_id': params.item.data.campaign_id.toString(),
                'location_id': params.item.data.location_id.toString(),
                'transactionID': params.item.data.transactionID.toString(),
                'fee': 'false',
                'name': params.item.data.name.toString()
            }
        })
        if (item.invoice === invoice.id) {
            res.status(200).send('Success')
        } else {
            // should this be different? (still invoice item, just on next invoice)
            res.status(400).send({error: 'Could not add invoice item to current invoice'})
        }
    } else {
        let item = await stripe.invoiceItems.create({
            customer: customerID,
            amount: params.item.amount,
            description: params.item.description,
            currency: 'usd',
            metadata: {
                'timestamp': '' + params.item.data.timestamp.toString(),
                'type': params.item.data.type.toString(),
                'campaign_id': params.item.data.campaign_id.toString(),
                'location_id': params.item.data.location_id.toString(),
                'transactionID': params.item.data.transactionID.toString(),
                'name': params.item.data.name.toString()
            }
        })
        let fee = await stripe.invoiceItems.create({
            customer: customerID,
            amount: feeAmount,
            description: feeDescription,
            currency: 'usd',
            metadata: {
                'name': 'Tab Fee'
            }

        })
        invoice = await stripe.invoices.create({
            customer: customerID,
            collection_method: 'charge_automatically',
            auto_advance: false,
            default_payment_method: paymentID,
            metadata: {
                'timeWillBeSubmitted': (Date.now() + timeout).toString(),
                locationName: params.locationName
            }
        })

        if (invoice && item && fee) {
            setTimeout(closeTab, timeout, invoice.id)
            let items = []
            for (let line of invoice.lines.data) {
                var amount = line.description.includes("fee") ? parseFloat(line.amount / 100) : line.amount
                items.push({
                    amount: amount,
                    description: line.description,
                    data: line.metadata
                })
            }
            const tab = {
                amount: invoice.total,
                timeWillBeSubmitted: invoice.metadata['timeWillBeSubmitted'],
                items: items,
                fromOnline: true,
                locationName: invoice.metadata['locationName']
            }
            res.status(200).send(tab)
        } else if (item && fee) {
            res.status(200).send('Added Items to customer, could not create invoice')
        } else {
            res.status(400).send('Could not add items to account')
        }
    }
})

// close a tab if it is a draft
router.post('/close-tab', async function(req, res) {
    let params = req.body;
    let customerID = await getCustomerID(params.userID);
    stripe.invoices.list({customer: customerID, status: 'draft'}).then(async invoices => {
        let paid = true;
        let errors = [];
        if (!invoices.data ||invoices.data.length === 0) {
            res.status(400).send('No Tab to Close')
        }
        for (const invoice of invoices.data) {
            const invoiceRes = await stripe.invoices.pay(invoice.id)
            paid = paid && invoiceRes.status === 'paid'
            if (invoiceRes.status !== 'paid') {
                errors.push(invoiceRes.status)
            }
        }
        if (paid) {
            res.status(200).send('Invoices paid')
        }
        else {
            res.status(400).send(errors)
        }
    })
})

router.post('/get-past-tabs', async function(req, res) {
    let params = req.body;
    let customerID = await getCustomerID(params.userID);
    let errorOpen, openInvoices = await stripe.invoices.list({customer: customerID, status: 'open'})
    let errorPaid, paidInvoices = await stripe.invoices.list({customer: customerID, status: 'paid'})

    if (errorOpen || errorPaid) {
        console.error('Could Not get Invoices')
        res.status(400).send('Could Not Get Invoices')
        return
    }

    let tabs = []

    // Includes open invoices and marks the tab as 'open' so a message can be displayed that the account is locked until they pay their invoice.
    if (openInvoices && openInvoices.data && openInvoices.data.length > 0) {
        for (let invoice of openInvoices.data) {
            let items = []
            for (let line of invoice.lines.data) {
                items.push({
                    amount: line.amount,
                    description: line.description,
                    data: line.metadata
                })
            }
            const tab = {
                amount: invoice.total,
                timeWillBeSubmitted: invoice.metadata['timeWillBeSubmitted'],
                items: items,
                fromOnline: true,
                open: true,
                locationName: invoice.metadata['locationName']
            }
            tabs.push(tab)
        }
    }

    if (paidInvoices && paidInvoices.data && paidInvoices.data.length > 0) {
        for (let invoice of paidInvoices.data) {
            let items = []
            for (let line of invoice.lines.data) {
                items.push({
                    amount: line.amount,
                    description: line.description,
                    data: line.metadata
                })
            }
            const tab = {
                amount: invoice.total,
                timeWillBeSubmitted: invoice.metadata['timeWillBeSubmitted'],
                items: items,
                fromOnline: true,
                open: false,
                locationName: invoice.metadata['locationName']
            }
            tabs.push(tab)
        }
    }
    res.status(200).send(tabs)
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// THESE ARE HELPER FUNCTIONS. /////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//gets customer and payment id (dont want to tax the backend a second time)
async function getCustomerAndPaymentID(userID, res) {
    let user = await User.findOne({_id: userID})
    if (!user) {
        console.error('Can\'t find user')
        res.status(400).send({error: 'Can\'t find user'});
        return ''
    }
    let customerID = decrypt(user.customerID)
    if (!customerID || customerID.length === 0) {
        console.error('Can\'t find customerID')
        res.status(400).send({error: 'Can\'t find customerID'});
        return ''
    }
    let paymentID = decrypt(user.paymentMethod)
    if (!paymentID || paymentID === '') {
        console.error('No payment method')
        res.status(400).send({error: 'No Payment Method'})
    }
    return {customerID, paymentID};
}

// Just gets customerID
async function getCustomerID(userID, res) {
    let user = await User.findOne({_id: userID})
    if (!user) {
        console.error('Can\'t find user')
        res.status(400).send({error: 'Can\'t find user'});
        return ''
    }
    let customerID = decrypt(user.customerID)
    if (!customerID || customerID.length === 0) {
        console.error('Can\'t find customerID')
        res.status(400).send({error: 'Can\'t find customerID'});
        return ''
    }
    return customerID;
}

// abstracts close tab logic -- part of automated close tab logic
function closeTab(invoiceID) {
    stripe.invoices.pay(invoiceID).then(r => {
        if (r.last_finalization_error) {
            console.error(r.last_finalization_error.message);
        } else {
            // This is automated so I want to leave this in
            console.log('Closed tab: ' + r.id);
        }
    })
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// THESE ARE METHODS THAT MIGHT BE USED LATER.  THEY INVOLVE MAKING CURRENT TRANSACTIONS NOT MAKING A TAB //////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a payment intent for current payment
 * (not used right now)
 * @inputs: payment method type, currency, price and a transaction id
 * @return client secret to process payment and transaction id
 */
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

/**
 * webhook to report stripe webhook events
 *
 * (not used, but could be used to automatically know when tabs get automatically closed
 */
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
