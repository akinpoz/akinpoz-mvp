var mongoose = require('mongoose')

var Schema = mongoose.Schema

var UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        date: {
            type: Date,
            default: Date.now()
        }
    },
    email: {
        type: String,
        required: true,
        date: {
            type: Date,
            default: Date.now()
        },
        unqiue: true
    },
    password: {
        type: String,
        required: true,
    },
    register_date: {
        type: Date,
        default: Date.now()
    },
    locations: {
        type: [String],
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
    type: {
        type: String,
        required: true,
        date: {
            type: Date,
            default: Date.now()
        }
    },
    customerID: {
        type: [String],
        required: true,
        default: []
    },
    paymentMethod: {
        type: [String],
        required: false,
        default: []
    }
})

module.exports = User = mongoose.model('user', UserSchema)
