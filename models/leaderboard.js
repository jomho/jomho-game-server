const mongoose = require('mongoose');

const {Schema} = mongoose;

const LeaderboardSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        points: {
            type: Number,
            required: true,
        },
        leaderboard: {
            type: String,
            required: true,
        }
    },
    {timestamps: true},
);

LeaderboardSchema.index({ 'user': 1, 'points': 1 }, { unique: true });

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);