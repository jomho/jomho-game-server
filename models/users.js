const mongoose = require('mongoose');

const {Schema} = mongoose;

const UserSchema = new Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
        },
        changedName: {
            type: Boolean,
            required: true,
            default: false,
        },
        registered: {
            type: Boolean,
            required: true,
            default: false,
        },
        email: {
            type: String,
            required: false,
        },
        password: {
            type: String,
            required: true,
        },
        useragent: {
            type: JSON,
            required: false,
        },
        location: {
            type: JSON,
            required: false,
        },
    },
    {timestamps: true},
);

module.exports = mongoose.model('User', UserSchema);