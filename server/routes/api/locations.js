var express = require('express')
var router = express.Router()
const dotenv = require('dotenv');
dotenv.config();
const Location = require('../../models/Location');
const User = require('../../models/User');
var auth = require('../../middleware/auth');
const Campaign = require('../../models/Campaign');

/**
 * @route GET api/locations
 * @desc get all locations by userID
 * @access Private
 */
router.get('/', auth, async function (req, res) {
    try {
        let locations = await Location.find({ user: req.user.id })
        res.status(200).send(locations)

    } catch (e) {
        console.error(err)
    }
})
/**
 * @route POST api/locations/add
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
                await User.findOneAndUpdate({ _id: req.body.user }, { $push: { locations: location._id } }, { new: true })
                res.status(200).send(location);
            }
        })
    } catch (e) {
        console.error(e)
        res.status(500).send(e)
    }
})
/**
 * @route POST api/locations/update
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
 * @route POST api/locations/delete
 * @desc delete a location
 * @access Private
 */
router.post('/delete', auth, async (req, res) => {
    try {
        const location = await Location.findOne({ _id: req.body._id })
        const user = await User.findOne({ _id: req.body.user })
        user.locations.splice(user.locations.indexOf(req.body._id), 1)
        for (var campaign of location.campaigns) {
            user.campaigns.splice(user.campaigns.indexOf(campaign), 1)
        }
        await user.save()
        await Campaign.deleteMany({ location: req.body._id })
        await Location.remove({ _id: req.body._id }, { useFindAndModify: false })
        res.status(200).send(location._id)
    } catch (e) {
        console.error(e)
        res.status(500).send(e)
    }
})

/**
 * @route POST api/locations/toggleMusic
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
