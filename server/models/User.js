var mongoose = require('mongoose')

var Schema = mongoose.Schema

// Create Schema

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
    }
})

module.exports = User = mongoose.model('user', UserSchema)