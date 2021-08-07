var mongoose = require('mongoose')

var Schema = mongoose.Schema

/**
 * @Schema Campaign
 * @desc A schmea for the Campaign used for CRUD operations on the campaign of each business/user.
 * @property {String} name* - The name of the location.
 * @property {String} description - The description of the location.
 * @property {Array[String]} campaings - The campaings that belong to the location.
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
        typeOf: {
            type: String,
            required: true,
        },
        question: {
            type: String,
        },
        options: {
            type: [String],
        },
        costPerTicket: {
            type: Number,
        }
    }
})

module.exports = User = mongoose.model('campaigns', CampaignSchema)