const user = require('../controllers/user');
const root = 'users';

module.exports = async (app, version) => {
    app.get(`/${version}/${root}`, user.get);
    app.get(`/${version}/${root}/:id`, user.getById);

    app.post(`/${version}/${root}`, user.post);
    app.post(`/${version}/${root}/:id/login`, user.login);

    app.put(`/${version}/${root}/:id/username`, user.updateUsername);
    app.put(`/${version}/${root}/:id/password`, user.updatePassword);
    app.put(`/${version}/${root}/:id/register`, user.register);

    app.get("/username/:username", user.getByUsername);
}