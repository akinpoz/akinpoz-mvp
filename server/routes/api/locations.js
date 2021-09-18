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
 * @desc get all location (customer side use, initial load)
 * @access Public
 */
router.get('/', async function (req, res) {
    try {
        let locations = await Location.find()
        res.status(200).send(locations)

    } catch (e) {
        console.error(e)
    }
})

/**
 * @route GET api/locations/user_id
 * @desc get all locations by userID (business side use) optimized version of / for business side
 * @access Private
 */
router.get('/user_id', auth, async function (req, res) {
    try {
        let locations = await Location.find({ user: req.query.user })
        res.status(200).send(locations)

    } catch (e) {
        console.error(e)
    }
})

/**
 * @route GET api/locations/location_id
 * @desc get location by location_id (customer side use)
 * @access Public
 * @note O(n + m) runtime where n is the number of locations and m is the number of campaigns for each location. Possible improvement: O(n + m) -> O(n). Tried: Redux, but there were too many use cases where it would fail. Tried separate axios calls but React would not update the state/loop update forever. 
 */
router.get('/location_id', async function (req, res) {
    try {
        let location = await Location.findOne({ _id: req.query.location_id })
        let campaigns = []
        if (location.campaigns) {
            for (var campaign of location.campaigns) {
                campaigns.push(await Campaign.findOne({ _id: campaign }))
            }
        }
        let relevantLocation = {}
        relevantLocation.campaigns = JSON.parse(JSON.stringify(campaigns))
        relevantLocation._id = location._id
        relevantLocation.name = location.name
        relevantLocation.music = location.music
        relevantLocation.menu_url = location.menu_url
        res.status(200).send(relevantLocation)

    } catch (e) {
        console.error(e)
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
        const location = await Location.findOneAndUpdate({ _id: req.body.location_id }, { name: req.body.name, description: req.body.description, menu_url: req.body.menu_url, address: req.body.address }, { useFindAndModify: false, new: true })
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
