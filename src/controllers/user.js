const mongoose = require('mongoose');
const rug = require("random-username-generator");
const geoIp = require("geoip-lite");
const database = require("../utils/database");
const validate = require("../utils/validate");
const encrypt = require("../utils/encrypt");
const {wrap} = require("../utils/util");
const User = mongoose.model('User');
const Session = mongoose.model('Session');

const get = async (req, res) => {
    const users = await User.getAll();
    return res.json(users);
}

const getById = async (req, res) => {
    const id = req.params.id;

    const userId = database.createObjectId(id);
    const user = await User.getById(userId);
    if (!user) return res.status(404).json({message: "User not found."});

    return res.json({username: user.username});
}

const getByUsername = async (req, res) => {
    const username = req.params.username;
    const foundUser = await User.getByUsername(username);

    if (!foundUser) return res.status(404).json({found: false});

    return res.status(200).json({found: true});
}

const post = async (req, res) => {
    const username = rug.generate().toLowerCase();
    const user = await new User({username});
    const password = randomPassword();
    const ip = req.ip;
    const geo = geoIp.lookup(ip);
    const useragent = req.useragent;

    user.password = await hashPassword(password, res);
    user.useragent = useragent;
    user.location = geo;

    await user.save();

    const session = await new Session({user: user._id, ip: ip, location: geo, useragent});

    try {
        await session.save();
    } catch (error) {
        return res.status(500).send(error);
    }

    res.json({id: user._id, username: user.username, password});

}

const updateUsername = async (req, res) => {
    const id = req.params.id;
    const username = req.body.username;
    const password = req.body.password;

    const userId = database.createObjectId(id);
    const user = await User.getById(userId);

    const usernameValidationErrors = validate.username(username);
    if (usernameValidationErrors.length) return res.status(400).send({message: usernameValidationErrors.toString()});

    if (!user) return res.status(404).json({message: 'User not found.'});
    if (!User.validatePassword(user.password, password)) return res.status(401).send({message: "The password is invalid."});
    if (user.changedName) return res.status(422).json({message: 'Username already changed.'});
    if (await User.isUsernameUnique(username)) return res.status(409).json({message: 'Username already exists.'});

    user.changedName = true;
    user.username = username;
    await user.save();

    return res.json({message: 'Username changed.'});
}

const updatePassword = async (req, res) => {
    const id = req.params.id;
    const password = req.body.password;
    const newPassword = req.body.newPassword;

    const passwordValidationErrors = validate.password(newPassword);
    if (passwordValidationErrors.length) return res.status(400).send({message: passwordValidationErrors.toString()});

    const userId = database.createObjectId(id);
    const user = await User.getById(userId);

    if (!user) return res.status(404).json({message: 'User not found.'});
    if (!User.validatePassword(user.password, password)) return res.status(401).send({message: "The password is invalid."});

    user.password = await hashPassword(newPassword, res);
    await user.save();

    return res.json({message: 'Password changed.'});
}

const login = async (req, res) => {
    const id = req.params.id;
    const password = req.body.password;
    const ip = req.ip;
    const geo = geoIp.lookup(ip);
    const useragent = req.useragent;

    const userId = database.createObjectId(id);
    const user = await User.getById(userId);

    if (!user) return res.status(404).json({message: 'User not found.'});
    if (!User.validatePassword(user.password, password)) return res.status(401).send({message: "The password is invalid."});

    const session = await new Session({user: userId, ip: ip, location: geo, useragent});

    try {
        await session.save();
    } catch (error) {
        return res.status(500).send(error);
    }
    return res.json({message: 'Session made.'});
}

const register = async (req, res) => {
    const id = req.params.id;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const newPassword = req.body.newPassword;

    if (!validate.email(email)) return res.status(404).json({message: 'Invalid email.'});

    const usernameValidationErrors = validate.username(username);
    const passwordValidationErrors = validate.password(newPassword);

    if (usernameValidationErrors.length) return res.status(400).send({message: usernameValidationErrors.toString()});
    if (passwordValidationErrors.length) return res.status(400).send({message: passwordValidationErrors.toString()});

    const userId = database.createObjectId(id);
    const user = await User.getById(userId);

    if (!user) return res.status(404).json({message: 'User not found.'});
    if (user.registered) return res.status(409).json({message: 'User already registered.'});
    if (!User.validatePassword(user.password, password)) return res.status(401).send({message: "The password is invalid."});
    if (user.changedName) return res.status(422).json({message: 'Username already changed.'});
    if (await User.isUsernameUnique(username)) return res.status(409).json({message: 'Username already exists.'});
    if (await User.isEmailUnique(email)) return res.status(409).json({message: 'Email already exists.'});

    user.registered = true;
    user.email = email;
    user.password = await hashPassword(newPassword, res);
    user.username = username;
    user.changedName = true;

    await user.save();

    return res.json({message: 'User registered.'});
}

const hashPassword = async (password, res) => {
    const [errHashedPassword, hashedPassword] = await wrap(encrypt.hashPassword(password));
    if (errHashedPassword) return res.status(500).send({message: "Could not update new password."});

    return hashedPassword
}

module.exports = {
    get,
    getById,
    getByUsername,
    post,
    updateUsername,
    updatePassword,
    login,
    register,
}