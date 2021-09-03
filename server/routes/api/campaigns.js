var express = require('express')
var router = express.Router()
const dotenv = require('dotenv');
dotenv.config();
const Location = require('../../models/Location');
const User = require('../../models/User');
const Campaign = require('../../models/Campaign');
var auth = require('../../middleware/auth')


/**
 * @route GET api/campaigns/
 * @desc get all campaigns by user ID
 * @access Private
 */
router.get('/', auth, async function (req, res) {
    try {
        let campaigns = await Campaign.find({ user: req.query.user }) // O(1)

        res.status(200).send(campaigns)
    } catch (e) {
        console.error(e)
    }
})


/**
 * @route POST api/campaigns/add 
 * @desc post a new campaign
 * @access Private
 */
router.post('/add', auth, (req, res) => {
    try {
        var newCampaign = new Campaign(req.body);
        newCampaign.save(async function (err, campaign) {
            if (err) res.status(500).send(err);
            if (campaign) {
                await User.findOneAndUpdate({ _id: req.body.user }, { $push: { campaigns: campaign._id } }, { new: true })
                await Location.findOneAndUpdate({ _id: req.body.location }, { $push: { campaigns: campaign._id } }, { new: true })
                res.status(200).send(campaign);
            }
        })
    } catch (e) {
        console.error(e)
        res.status(500).send(e)
    }
})
/**
 * @route POST api/campaigns/update
 * @desc post an update to a campaign
 * @access Private
 */
router.post('/update', auth, async (req, res) => {
    try {

        const campaign = await Campaign.findOneAndUpdate(
            { _id: req.body.campaign_id },
            {
                title: req.body.title,
                description: req.body.description,
                question: req.body.question,
                details: req.body.details,
            },
            { useFindAndModify: false, new: true })
        res.status(200).send(campaign);
    } catch (e) {
        console.error(e)
        res.status(500).send(e)
    }
})
/**
 * @route POST api/campaigns/delete
 * @desc delete a campaign
 * @access Private
 */
router.post('/delete', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findOneAndRemove({ _id: req.body._id }, { useFindAndModify: false })
        const user = await User.findOne({ _id: req.body.user })
        user.campaigns.splice(user.campaigns.indexOf(req.body._id), 1)
        await user.save();
        const location = await Location.findOne({ _id: req.body.location })
        location.campaigns.splice(location.campaigns.indexOf(req.body._id), 1)
        await location.save();
        res.status(200).send(campaign._id)
    } catch (e) {
        console.error(e)
        res.status(500).send(e)
    }
})

/**
 * @route POST api/campaigns/toggleMusic
 * @desc enable/disable music for a campaign
 * @access Private
 */
router.post('/toggleMusic', auth, async (req, res) => {
    try {
        const { music, _id } = req.body;
        const campaign = await Campaign.findOneAndUpdate({ _id }, { music }, { useFindAndModify: false, new: true })
        res.status(200).send(campaign)
    } catch (e) {
        console.error(e)
        res.status(500).send(e)
    }
})

module.exports = router