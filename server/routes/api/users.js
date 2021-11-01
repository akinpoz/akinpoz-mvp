const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
dotenv.config();
const User = require('../../models/User');
const { encrypt, decrypt} = require("./encryption");
const auth = require('../../middleware/auth');
const Campaign = require('../../models/Campaign');
const Location = require('../../models/Location');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


/**
 * @route POST api/users
 * @desc Register new user
 * @access Public
 */
router.post('/', function (req, res) {
    const { name, email, password, type, customerID, paymentMethod, age, phone } = req.body;
    // Simple validation
    if (!name || !email || !password || !type || !customerID || !age || !phone) {
        return res.status(400).json({ msg: 'Please Enter all fields', positive: false, negative: true})
    }

    const encryptedCustomerID = encrypt(customerID)
    const encryptedPaymentMethod = paymentMethod ? encrypt(paymentMethod) : [];

    // Check for existing user
    User.findOne({ email }).then(user => {
        if (user) return res.status(400).json({ msg: 'User already exists', positive: false, negative: true})
        const newUser = new User({ name, email, password, type, age, phone, locations: [], customerID: encryptedCustomerID, paymentMethod: encryptedPaymentMethod })
        // Create salt & hash
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) console.error(err)
                newUser.password = hash
                newUser.save().then(user => {
                    jwt.sign(
                        { id: user.id },
                        process.env.JWTSECRET,
                        { expiresIn: 3600 },
                        (err, token) => {
                            if (err) throw err;
                            res.json({
                                token,
                                user: {
                                    _id: user.id,
                                    name: user.name,
                                    email: user.email,
                                    type: user.type,
                                    age: user.age,
                                    phone: user.phone,
                                    customerID: user.customerID,
                                    paymentMethod: user.paymentMethod
                                }
                            })
                        }
                    )
                })
            })
            if (err) throw err
        })
    }).catch(e => {
        console.error(e);
    })
})

/**
 * @route POST api/users/update
 * @desc Update user name or email
 * @access Private
 */
router.post('/update', auth, function (req, res) {
    const { _id, name, email, age, phone } = req.body
    User.findOneAndUpdate({ _id: _id }, { name, email, age, phone }, { new: true })
        .then(user => {
            const customerID = decrypt(user.customerID)
            stripe.customers.update(customerID, {email: email, phone: phone, metadata: {'age': `${age}`}}).then((r, error) => {
                if (error) {
                    console.error(error.msg)
                } else {
                    console.log('Stripe Object Updated')
                }
                let resUser =  {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    type: user.type,
                    age: user.age,
                    phone: user.phone,
                    customerID: user.customerID,
                    paymentMethod: user.paymentMethod
                }
                res.json(resUser)
            })
        })
        .catch(e => {
            console.error(e);
            res.status(500).send({msg: 'Server Error', positive: false, negative: true})
        })
})

/**
 * @route POST api/users/delete
 * @desc Delete user
 * @access Private
 * @param {string} _id
 */
router.post('/delete', auth, async function (req, res) {
    await Location.deleteMany({ user: req.body._id })
    await Campaign.deleteMany({ user: req.body._id })
    await User.remove({ _id: req.body._id }, { useFindAndModify: false })
    res.status(200).send(`User ${req.body._id} deleted`)
})

module.exports = router
