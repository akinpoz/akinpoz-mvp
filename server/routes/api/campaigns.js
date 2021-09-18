var express = require('express')
var router = express.Router()
const dotenv = require('dotenv');
dotenv.config();
const Location = require('../../models/Location');
const User = require('../../models/User');
const Campaign = require('../../models/Campaign');
var auth = require('../../middleware/auth')



/**
 * @route  GET api/campaigns/
 * @desc   Get all campaigns
 * @access Public
 */
router.get('/', async function (req, res) {
    try {
        let campaigns = await Campaign.find()
        res.status(200).send(campaigns)
    }
    catch (e) {
        console.error(e)
    }
})

/**
 * @route GET api/campaigns/user_id
 * @desc get all campaigns by user ID
 * @access Private
 */
router.get('/user_id', auth, async function (req, res) {
    try {
        let campaigns = await Campaign.find({ user: req.query.user })
        res.status(200).send(campaigns)
    } catch (e) {
        console.error(e)
    }
})
/**
 * @route GET api/campaigns/location_id
 * @desc get campaign by ID (customer-side)
 * @access Public
 */
 router.get('/location_id', async (req, res) => {
    try {
        res.status(200).send(await Campaign.findOne({ location: req.query.location_id }))
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
})

/**
 * @route GET api/campaigns/campaign_id
 * @desc get campaign by ID (customer-side)
 * @access Public
 */
router.get('/campaign_id', async (req, res) => {
    try {
        res.status(200).send(await Campaign.findOne({ _id: req.query.campaign_id }))
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
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

/**
 * @route POST api/campaigns/removeName
 * @desc remove the name put on the fast pass list
 * @access Public 
 * @note Want to move away from over engineering hot garbage code in redux. Not everything should be a redux action. This endpoint is called directly from the business-campaign file. 
 */
router.post('/removeName', auth, async (req, res) => {
    try {
        const { name, _id } = req.body
        const campaign = await Campaign.findOne({ _id })
        campaign.details.options.splice(campaign.details.options.indexOf(name), 1)
        const newNames = campaign.details.options
        await Campaign.findOneAndUpdate({ _id }, { details: { options: newNames, type: campaign.details.type } }, { useFindAndModify: false, new: true })
        res.status(200).send({ msg: "Successfully removed name", name })
    } catch (e) {
        console.error(e)
        res.status(500).send({ msg: `Failed: ${e.message}` })
    }
})

module.exports = router