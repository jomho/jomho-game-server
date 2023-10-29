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

LeaderboardSchema.statics.getAll = async function () {
    const leaderboards = this.find({})
        .populate("user", {username: 1})
        .exec();

    return leaderboards.sort((a, b) => a.points < b.points ? 1 : -1);
};

LeaderboardSchema.statics.getByName = async function (name) {
    const leaderboards = await this.find({leaderboard: name})
        .populate("user", {username: 1})
        .exec();

    return leaderboards.sort((a, b) => a.points < b.points ? 1 : -1);
};

LeaderboardSchema.statics.getEntry = async function (userId, leaderboard) {
    return await this.findOne({
        user: userId,
        leaderboard
    }).exec();
};

LeaderboardSchema.statics.new = async function (user, points, leaderboard) {
    const lb = new this({user, points, leaderboard});
    await lb.save();
};

LeaderboardSchema.index({'user': 1, 'points': 1}, {unique: true});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);