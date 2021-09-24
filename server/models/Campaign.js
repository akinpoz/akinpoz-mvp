var mongoose = require('mongoose')

var Schema = mongoose.Schema

/**
 * @Schema Campaign
 * @desc A schema for the Campaign used for CRUD operations on the campaign of each business/user.
 * @property {String} name* - The name of the location.
 * @property {String} description - The description of the location.
 * @property {Array[String]} campaigns - The campaigns that belong to the location.
 * @property {String} user* - The user that created the location.
 */
var CampaignSchema = new Schema({
    title: {
        type: String,
        required: true,
        date: {
            type: Date,
            default: Date.now()
        }
    },
    description: {
        type: String,
        required: false,
        date: {
            type: Date,
            default: Date.now()
        }
    },
    user: {
        type: String, 
        required: true, 
    },
    location: {
        type: String,
        required: true,
    },
    details: {
        type: Object,
        required: true,
        options: {
            type: [String],
        },
        result: {
            type: String,
        }
    },
    question: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
    }
})

module.exports = User = mongoose.model('campaigns', CampaignSchema)