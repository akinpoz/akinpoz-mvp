var express = require('express')
var router = express.Router()
const dotenv = require('dotenv');
dotenv.config();
const Location = require('../../models/Location');
const User = require('../../models/User');
var auth = require('../../middleware/auth')




/**
 * @route GET api/locations
 * @desc get all locations by userID
 * @access Private
 */
router.get('/', auth, async function (req, res) {
    try {
        let locations = await Location.find({user: req.user.id})
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
        await Location.findOneAndUpdate({ _id: req.body._id }, { name: req.body.name, description: req.body.description }, { useFindAndModify: false, new: true})
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
 router.delete('/:id', auth, async (req, res) => {
     console.log(req.params.id);
    try {
        await Location.findOneAndRemove({ _id: req.params.id }, {useFindAndModify: false})
    } catch (e) {
        console.error(e)
        res.status(500).send(e)
    }
})


module.exports = router