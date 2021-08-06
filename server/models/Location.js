var mongoose = require('mongoose')

var Schema = mongoose.Schema

/**
 * @Schema Location
 * @desc A schmea for the Location used for CRUD operations on the locations of each business.
 * @property {String} name* - The name of the location.
 * @property {String} description - The description of the location.
 * @property {Array[String]} campaings - The campaings that belong to the location.
 * @property {String} user* - The user that created the location.
 */
var LocationSchema = new Schema({
    name: {
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
    campaigns: {
        type: [String],
        date: {
            type: Date,
            default: Date.now()
        }
    },
    user: {
        type: String, 
        required: true, 
        date: {
            type: Date,
            default: Date.now()
        }
    },
    music: {
        type: Boolean,
        required: false,
        default: false
    }
})

module.exports = User = mongoose.model('locations', LocationSchema)