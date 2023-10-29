const leaderboard = require('../controllers/leaderboard');
const root = 'leaderboards';

module.exports = async (app, version) => {
    app.get(`/${version}/${root}`, leaderboard.getAll);
    app.get(`/${version}/${root}/:leaderboard`, leaderboard.get);

    app.post(`/${version}/${root}/:leaderboard`, leaderboard.post);
}