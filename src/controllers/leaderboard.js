const mongoose = require('mongoose');
const {wrap} = require("../utils/util");
const log = require("../config/logger");
const database = require("../utils/database");
const Leaderboard = mongoose.model('Leaderboard');
const User = mongoose.model('User');

const getAll = async (req, res) => {
    const [err, leaderboards] = await wrap(Leaderboard.getAll());

    log.error('Could not getAll leaderboards', err);
    if (err) return res.status(500).json({error: 'Database error.'});

    return res.json(leaderboards);
}

const get = async (req, res) => {
    const leaderboardName = req.params.leaderboard;

    const [err, leaderboard] = await wrap(Leaderboard.getByName(leaderboardName));

    log.error(`Could not get leaderboard "${leaderboardName}"`, err);
    if (err) return res.status(500).json({error: 'Database error.'});

    return res.json({leaderboard});
}

const post = async (req, res) => {
    const leaderboardName = req.params.leaderboard;
    const user = req.body.user;
    const points = req.body.points;
    const password = req.body.password;
    const userId = database.createObjectId(user);

    if (!points) return res.status(400).json({error: 'Bad request. Missing points.'});
    if (!userId) return res.status(400).json({error: 'Bad request. Missing user.'});
    if (!password) return res.status(400).json({error: 'Bad request. Missing password.'});

    const userObject = await User.getById(userId);

    if (!userObject) return res.status(404).json({error: 'User not found.'});

    if (!User.validatePassword(userObject.password, req.body.password)) return res.status(401).json({message: "The password is invalid."});

    const leaderboardEntry = await Leaderboard.getEntry(userId, leaderboardName);

    if (leaderboardEntry) {
        leaderboardEntry.points = points;

        try {
            await leaderboardEntry.save();
        } catch (error) {
            return res.status(500).json({error: 'Database error.'});
        }

        return res.status(201).json({message: 'Leaderboard entry updated.'});
    }

    const [error, result] = await wrap(Leaderboard.new(userId, points, leaderboardName));

    if (error) return res.status(500).json({error});

    return res.status(200).json({message: 'New leaderboard entry created.'});
}

module.exports = {
    getAll,
    get,
    post,
}