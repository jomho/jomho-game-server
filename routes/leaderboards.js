const Bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Leaderboard = mongoose.model('Leaderboard');
const User = mongoose.model('User');

module.exports = async (app) => {
    app.get("/leaderboards", async (req, res) => {
        const leaderboards = await Leaderboard.find({})
            .populate("user", {username: 1})
            .exec();

        const sorted = leaderboards.sort((a, b) => a.points < b.points ? 1 : -1);

        return res.json(sorted);
    });

    app.get("/leaderboards/:leaderboard", async (req, res) => {
        const leaderboard = req.params.leaderboard;

        const leaderboards = await Leaderboard.find({leaderboard})
            .populate("user", {username: 1})
            .exec();

        const sorted = leaderboards.sort((a, b) => a.points < b.points ? 1 : -1);

        return res.json({leaderboard: sorted});
    });

    app.post("/leaderboards/:leaderboard", async (req, res) => {
        const leaderboardName = req.params.leaderboard;
        const user = req.body.user;
        const points = req.body.points;
        const password = req.body.password;
        const userId = createObjectId(user);

        if (!points) return res.status(400).json({error: 'Bad request. Missing points.'});
        if (!userId) return res.status(400).json({error: 'Bad request. Missing user.'});
        if (!password) return res.status(400).json({error: 'Bad request. Missing password.'});

        const userObject = await getUser(userId);

        if (!userObject) return res.status(404).json({error: 'User not found.'});

        await checkPassword(password, userObject.password, res);

        const leaderboardEntry = await getLeaderboardEntry(userId, leaderboardName);

        if (leaderboardEntry) {
            leaderboardEntry.points = points;

            try {
                await leaderboardEntry.save();
            } catch (error) {
                return res.status(500).json({error: 'Database error.'});
            }

            return res.json({message: 'Leaderboard entry updated.'});
        }

        const leaderboard = await new Leaderboard({user: userId, points: points, leaderboard: leaderboardName});

        try {
            await leaderboard.save();
        } catch (error) {
            return res.status(500).json({error});
        }

        return res.json({message: 'New leaderboard entry created.'});
    });

    const checkPassword = async (password, actualPassword, res) => {
        if (!Bcrypt.compareSync(password, actualPassword)) {
            return res.status(401).send({message: "The password is invalid."});
        }
    }

    const getUser = async (userId) => await User.findById(userId).exec();

    const getLeaderboardEntry = async (userId, leaderboard) => await Leaderboard.findOne({
        user: userId,
        leaderboard
    }).exec();

    const createObjectId = (userIdString) => {
        try {
            return mongoose.Types.ObjectId(userIdString);
        } catch (err) {
            return null;
        }
    }
}