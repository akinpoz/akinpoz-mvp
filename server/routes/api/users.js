var express = require('express')
var bcrypt = require('bcryptjs')
var router = express.Router()
var jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
dotenv.config();
// Item Model
var User = require('../../models/User');
const { encrypt } = require("./encryption");
var auth = require('../../middleware/auth')


/**
 * @route POST api/users
 * @desc Register new user
 * @access Public
 */
router.post('/', function (req, res) {
    var { name, email, password, type, customerID, paymentMethod } = req.body;
    // Simple validation
    if (!name || !email || !password || !type || !customerID) {
        return res.status(400).json({ msg: 'Please Enter all fields' })
    }

    const encryptedCustomerID = encrypt(customerID)
    const encryptedPaymentMethod = paymentMethod ? encrypt(paymentMethod) : [];

    // Check for existing user
    User.findOne({ email }).then(user => {
        if (user) return res.status(400).json({ msg: 'User already exists' })
        var newUser = new User({ name, email, password, type, locations: [], customerID: encryptedCustomerID, paymentMethod: encryptedPaymentMethod })
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
    var { name, email } = req.body
    User.findOneAndUpdate({ _id: req.body._id }, { name, email }, { new: true })
        .then(user => res.json(user))
        .catch(e => {
            console.error(e);
            res.status(500).send('Server Error')
        })
})

/**
 * @route POST api/users/delete
 * @desc Delete user
 * @access Private
 */
router.post('/delete', auth, function (req, res) {
    User.findOneAndDelete({ _id: req.body._id })
        .then(user => res.status(200).json({ msg: `${user._id} deleted` }))
        .catch(e => {
            console.error(e);
            res.status(500).send('Server Error')
        })
})

module.exports = router
