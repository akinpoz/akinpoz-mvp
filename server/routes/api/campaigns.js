const express = require('express')
const router = express.Router()
const dotenv = require('dotenv');
dotenv.config();
const Location = require('../../models/Location');
const User = require('../../models/User');
const Campaign = require('../../models/Campaign');
const auth = require('../../middleware/auth')


/**
 * @route GET api/campaigns/location
 * @desc get all campaigns by location ID
 * @access Private
 */
router.get('/location', auth, async function (req, res) {
    try {
        let campaigns = await Campaign.find({ location: req.query.location_id })
        res.status(200).send(campaigns)
    } catch (e) {
        console.error(e)
    }
})

/**
 * @route GET api/campaigns/campaigns
 * @desc get all campaigns by userID
 * @access Private
 */
router.get('/user_id', auth, async function (req, res) {
    try {
        let campaigns = await Campaign.find({ user: req.query.user }, null, { sort: { 'date': -1 } })
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
        const { campaignDetails } = req.body
        const { imageOne, imageTwo } = req.files || {}
        const campaign = JSON.parse(campaignDetails)
        console.log(campaign.details)
        if (campaign.details.type === 'Fastpass') {
            campaign.title = 'Fastpass'
        }
        campaign.date = new Date()
        campaign.imageOne = imageOne
        campaign.imageTwo = imageTwo
        const newCampaign = new Campaign(campaign);
        newCampaign.save(async function (err, campaign) {
            if (err) res.status(500).send(err);
            if (campaign) {
                await User.findOneAndUpdate({ _id: campaign.user }, { $push: { campaigns: campaign._id } }, {
                    new: true,
                    useFindAndModify: false
                })
                await Location.findOneAndUpdate({ _id: campaign.location }, { $push: { campaigns: campaign._id } }, {
                    new: true,
                    useFindAndModify: false
                })
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
        await Campaign.findOneAndUpdate({ _id: req.body.campaign_id }, req.body, { useFindAndModify: false, new: true })
        res.status(200).send(await Campaign.find({ user: req.body.user }, null, { sort: { 'date': -1 } }))
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
        await Campaign.findOneAndUpdate({ _id }, {
            details: {
                options: newNames,
                type: campaign.details.type
            }
        }, { useFindAndModify: false, new: true })
        res.status(200).send({ msg: "Successfully removed name", name, positive: true, negative: false })
    } catch (e) {
        console.error(e)
        res.status(500).send({ msg: `Failed: ${e.message}`, positive: false, negative: true })
    }
})

/**
 * @route POST api/campaigns/submitData
 * @desc submit data to a campaign
 * @access Private
 */
router.post('/submitData', auth, async (req, res) => {
    const { user, data, description } = req.body
    const { campaign_id, info } = data
    switch (description) {
        case "Product Pluck":
            try {
                let campaign = await Campaign.findOne({ _id: campaign_id })
                let results = campaign.details.results
                // Info {String} - The name of one of the options of the Product Pluck.
                if (results[info]) {
                    results[info]++
                } else {
                    results[info] = 1
                }
                const newResults = results
                await Campaign.findOneAndUpdate({ _id: campaign_id }, {
                    details: {
                        options: campaign.details.options,
                        type: campaign.details.type,
                        results: newResults
                    }
                }, { useFindAndModify: false, new: true })
                const returnableData = { msg: { msg: "Thanks for your vote!", positive: true, negative: false }, campaign_id: campaign._id }
                res.status(200).send(returnableData)
            } catch (error) {
                console.error(error)
                res.status(400).send({ msg: error.message, positive: false, negative: true })
            }
            break
        case "Fastpass":
            try {
                let campaign = await Campaign.findOne({ _id: campaign_id })
                let options = campaign.details.options
                options.push(user.name)
                const newOptions = options
                await Campaign.findOneAndUpdate({ _id: campaign_id }, {
                    details: {
                        options: newOptions,
                        type: campaign.details.type,
                        results: campaign.details.results
                    }
                }, { useFindAndModify: false, new: true })
                const returnableData = { msg: { msg: "Thanks purchasing a fast pass! Please verify your name is on the list when you arrive at the establishment.", positive: true, negative: false }, campaign_id: campaign._id }
                res.status(200).send(returnableData)
            } catch (error) {
                console.error(error)
                res.status(400).send({ msg: error.message, positive: false, negative: true })
            }
            break
        case "Raffle":
            try {
                let campaign = await Campaign.findOne({ _id: campaign_id })
                let results = campaign.details.results
                if (results[user.name]) {
                    results[user.name] = results[user.name] + parseInt(info)
                } else {
                    results[user.name] = parseInt(info)
                }
                const newResults = results
                await Campaign.findOneAndUpdate({ _id: campaign_id }, {
                    details: {
                        options: campaign.details.options,
                        type: campaign.details.type,
                        results: newResults
                    }
                }, { useFindAndModify: false, new: true })
                const returnableData = { msg: { msg: "Thanks for participating in our raffle! We will let you know if you won.", positive: true, negative: false }, campaign_id: campaign._id }

                res.status(200).send(returnableData)
            } catch (error) {
                console.error(error)
                res.status(400).send({ msg: error.message, positive: false, negative: true })
            }
            break
    }
    await User.findOneAndUpdate({ _id: user }, { $push: { campaigns: campaign_id } }, { new: true, useFindAndModify: false })
})

module.exports = router
