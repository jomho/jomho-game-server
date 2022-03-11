const mongoose = require('mongoose');

const {Schema} = mongoose;

const SessionSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        ip: {
            type: String,
            required: false,
            default: false,
        },
        location: {
            type: JSON,
            required: false,
            default: false,
        },
        useragent: {
            type: JSON,
            required: false,
        }
    },
    {timestamps: true},
);

module.exports = mongoose.model('Session', SessionSchema);