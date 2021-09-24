var express = require('express')
var bcrypt = require('bcryptjs')
var router = express.Router()
var jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
dotenv.config();
// Item Model
var User = require('../../models/User');

var auth = require('../../middleware/auth')

/**
 * @route POST api/auth
 * @desc Auth the user
 * @access Public
 */
router.post('/', function (req, res) {
    var { email, password } = req.body;
    // Simple validation
    if (!email || !password) {
        return res.status(400).json({ msg: 'Please Enter all fields' })
    }
    // Check for existing user
    User.findOne({ email }).then(user => {
        if (!user) return res.status(400).json({ msg: 'User does not exists' })
        // Validate password
        bcrypt.compare(password.toString(), user.password).then(isMatch => {
            if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' })

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
        }).catch(e => {
            console.error(e);
        })
    }).catch(e => {
        console.error(e);
    })
})

/**
 * @route GET api/auth/user
 * @desc Get user data
 * @access Private
 */

 router.get('/user', auth, (req, res) => {
     User.findById(req.user.id).select('-password').then(user => { res.json(user)})
 })


module.exports = router
