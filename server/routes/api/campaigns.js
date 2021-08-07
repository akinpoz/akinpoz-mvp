var express = require('express')
var router = express.Router()
const dotenv = require('dotenv');
dotenv.config();
const Location = require('../../models/Location');
const User = require('../../models/User');
const Campaign = require('../../models/Campaign');
var auth = require('../../middleware/auth')

/**
 * @route GET api/campaigns/location
 * @desc get all campaigns by userID
 * @access Private
 */
router.get('/location', auth, async function (req, res) {
    console.log('hit')
    try {
        let campaigns = await Campaign.find({ location: req.location._id })
        res.status(200).send(campaigns)
    } catch (e) {
        console.error(err)
    }
})
/**
 * @route GET api/campaigns/locations
 * @desc get all campaigns by userID
 * @access Private
 */
 router.get('/user', auth, async function (req, res) {
    try {
        let campaigns = await Campaign.find({ user: req.user.id })
        res.status(200).send(campaigns)
    } catch (e) {
        console.error(err)
    }
})
/**
 * @route POST api/campaigns/add 
 * @desc post a new location
 * @access Private
 */
router.post('/add', auth, (req, res) => {
    try {
        console.log(req.body)
        var newLocation = new Location(req.body);
        newLocation.save(async function (err, location) {
            if (err) res.status(500).send(err);
            if (location) {
                await User.findOneAndUpdate({ _id: req.body.user }, { $push: { campaigns: location._id } }, { new: true })
                res.status(200).send(location);
            }
        })
    } catch (e) {
        console.error(e)
        res.status(500).send(e)
    }
})
/**
 * @route POST api/campaigns/update
 * @desc post an update to a location
 * @access Private
 */
router.post('/update', auth, async (req, res) => {
    try {
        const location = await Location.findOneAndUpdate({ _id: req.body.location_id }, { name: req.body.name, description: req.body.description }, { useFindAndModify: false, new: true })
        res.status(200).send(location)
    } catch (e) {
        console.error(e)
        res.status(500).send(e)
    }
})
/**
 * @route POST api/campaigns/delete
 * @desc delete a location
 * @access Private
 */
router.post('/delete', auth, async (req, res) => {
    try {
        const location = await Location.findOneAndRemove({ _id: req.body._id }, { useFindAndModify: false })
        const user = await User.findOne({ _id: req.body.user })
        user.campaigns.splice(user.campaigns.indexOf(req.body._id), 1)
        await user.save();
        res.status(200).send(location._id)
    } catch (e) {
        console.error(e)
        res.status(500).send(e)
    }
})

/**
 * @route POST api/campaigns/toggleMusic
 * @desc enable/disable music for a location
 * @access Private
 */
router.post('/toggleMusic', auth, async (req, res) => {
    try {
        const { music, _id } = req.body;
        const location = await Location.findOneAndUpdate({ _id }, { music }, { useFindAndModify: false, new: true })
        res.status(200).send(location)
    } catch (e) {
        console.error(e)
        res.status(500).send(e)
    }
})

module.exports = router