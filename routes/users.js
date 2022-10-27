const Bcrypt = require('bcryptjs');
const Crypto = require('crypto');
const geoIp = require('geoip-lite');
const rug = require('random-username-generator');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Session = mongoose.model('Session');
const root = 'users';

module.exports = async (app, version) => {
    app.get(`/${version}/${root}`, async (req, res) => {
        const users = await getAllUser();
        return res.json(users);
    });

    app.post(`/${version}/${root}`, async (req, res) => {
        const username = rug.generate().toLowerCase();
        const user = await new User({username});
        const password = randomPassword();
        const ip = req.ip;
        const geo = geoIp.lookup(ip);
        const useragent = req.useragent;

        user.password = Bcrypt.hash(password, 10, async (error, hash) => {
            if (error) res.status(500).json({error});
            user.password = hash;
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
        });
    });

    app.get(`/${version}/${root}/:id`, async (req, res) => {
        const id = req.params.id;

        const userId = createObjectId(id);
        const user = await getUser(userId);
        if(!user) return res.status(404).json({message: "User not found."});

        return res.json({username: user.username});
    });

    app.put(`/${version}/${root}/:id/username`, async (req, res) => {
        const id = req.params.id;
        const username = req.body.username;
        const password = req.body.password;

        const userId = createObjectId(id);
        const user = await getUser(userId);

        const usernameValidationErrors = validateUsername(username).length;
        if(usernameValidationErrors.length) return res.status(400).send({message: usernameValidationErrors.toString()});

        if (!user) return res.status(404).json({message: 'User not found.'});
        if (checkPassword(user.password, password)) return res.status(401).send({message: "The password is invalid."});
        if (user.changedName) return res.status(422).json({message: 'Username already changed.'});
        if (await isUsernameUnique(username)) return res.status(409).json({message: 'Username already exists.'});

        user.changedName = true;
        user.username = username;
        await user.save();

        return res.json({message: 'Username changed.'});
    });

    app.put(`/${version}/${root}/:id/password`, async (req, res) => {
        const id = req.params.id;
        const password = req.body.password;
        const newPassword = req.body.newPassword;

        const passwordValidationErrors = validatePassword(newPassword).length;
        if(passwordValidationErrors.length) return res.status(400).send({message: passwordValidationErrors.toString()});

        const userId = createObjectId(id);
        const user = await getUser(userId);

        if (!user) return res.status(404).json({message: 'User not found.'});
        if (checkPassword(user.password, password)) return res.status(401).send({message: "The password is invalid."});

        Bcrypt.hash(password, 10, async (error, hash) => {
            if(error) return res.status(500).send({message: "Could not update new password."});
            user.password = hash;
            await user.save();

            return res.json({message: 'Password changed.'});
        })
    });

    app.post(`/${version}/${root}/:id/login`, async (req, res) => {
        const id = req.params.id;
        const password = req.body.password;
        const ip = req.ip;
        const geo = geoIp.lookup(ip);
        const useragent = req.useragent;

        const userId = createObjectId(id);
        const user = await getUser(userId);

        if (!user) return res.status(404).json({message: 'User not found.'});
        if (!checkPassword(password, user.password)) return res.status(401).send({message: "The password is invalid."});

        const session = await new Session({user: userId, ip: ip, location: geo, useragent});

        try {
            await session.save();
        } catch (error) {
            return res.status(500).send(error);
        }
        return res.json({message: 'Session made.'});
    });

    app.put(`/${version}/${root}/:id/register`, async (req, res) => {
        const id = req.params.id;
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const newPassword = req.body.newPassword;

        if(!validateEmail(email)) return res.status(404).json({message: 'Invalid email.'});

        const usernameValidationErrors = validateUsername(username).length;
        if(usernameValidationErrors.length) return res.status(400).send({message: usernameValidationErrors.toString()});

        const passwordValidationErrors = validatePassword(newPassword).length;
        if(passwordValidationErrors.length) return res.status(400).send({message: passwordValidationErrors.toString()});

        const userId = createObjectId(id);
        const user = await getUser(userId);

        if (!user) return res.status(404).json({message: 'User not found.'});
        if (user.registered) return res.status(409).json({message: 'User already registered.'});
        if (checkPassword(password, user.password)) return res.status(401).send({message: "The password is invalid."});
        if (user.changedName) return res.status(422).json({message: 'Username already changed.'});
        if (await isUsernameUnique(username)) return res.status(409).json({message: 'Username already exists.'});

        Bcrypt.hash(password, 10, async (error, hash) => {
            if(error) return res.status(500).send({message: "Could not update new password."});
            user.registered = true;
            user.email = email;
            user.password = hash;
            user.username = username;
            user.changedName = true;

            await user.save();

            return res.json({message: 'User registered.'});
        })
    });

    app.get("/username/:username", async (req, res) => {
        const username = req.params.username;
        const foundUser = await User.findOne({username}).exec();

        if (!foundUser) return res.status(404).json({found: false});

        return res.status(200).json({found: true});
    });

    const getUser = async (userId) => await User.findById(userId).exec();

    const getAllUser = async () => await User.find({}).exec();

    const isUsernameUnique = async (username) => !!await User.findOne({username}).exec();

    //@todo: duplicate code
    const createObjectId = (userIdString) => {
        try {
            return mongoose.Types.ObjectId(userIdString);
        } catch (err) {
            return null;
        }
    }

    const checkPassword = (hashedPassword, password) => {
        return Bcrypt.compareSync(hashedPassword, password);
    }

    const randomPassword = (size = 21) => {
        return Crypto
            .randomBytes(size)
            .toString('hex')
            .slice(0, size)
    }

    const validatePassword = (password) => {
        const error = [];
        if (!password?.length) error.push('Password no length.');
        if (password?.length < 5) error.push('Password must be at least 5 characters.');
        if (password?.length > 20) error.push('Password must be 20 characters or less.');
        return error;
    }

    const validateUsername = (username) => {
        const error = [];
        if (!username?.length) error.push('Username no length.');
        if (username?.length < 5) error.push('Username must be at least 5 characters.');
        if (username?.length > 20) error.push('Username must be 20 characters or less.');
        if (!/^[A-Za-z0-9\-]*$/.test(username)) error.push('Username can only contain alphanumeric characters and hyphens');

        return error;
    }

    const validateEmail = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
}