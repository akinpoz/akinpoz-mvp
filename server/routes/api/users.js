var express = require('express')
var bcrypt = require('bcryptjs')
var router = express.Router()
var jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
dotenv.config();
// Item Model
var User = require('../../models/User');

/**
 * @route POST api/users
 * @desc Register new user
 * @access Public
 */
router.post('/', function (req, res) {
    var { name, email, password, type } = req.body;
    // Simple validation
    if (!name || !email || !password || !type) {
        return res.status(400).json({ msg: 'Please Enter all fields' })
    }
    // Check for existing user
    User.findOne({ email }).then(user => {
        if (user) return res.status(400).json({ msg: 'User already exists' })
        var newUser = new User({ name, email, password, type, locations: [] })
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

module.exports = router