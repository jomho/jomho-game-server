const Bcrypt = require('bcryptjs');
const Crypto = require('crypto');
const geoip = require('geoip-lite');
const rug = require('random-username-generator');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Session = mongoose.model('Session');

module.exports = async (app) => {
    app.post("/users", async (req, res) => {
        const username = rug.generate();
        const user = await new User({username});
        const password = randomPassword();
        const ip = req.ip;
        const geo = geoip.lookup(ip);
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

    app.get("/users/:id", async (req, res) => {
        const id = req.params.id;

        const userId = createObjectId(id);
        const user = await getUser(userId);

        return res.json({username: user.username});
    });

    app.put("/users/:id", async (req, res) => {
        const id = req.params.id;
        const username = req.body.username;
        const password = req.body.password;

        const userId = createObjectId(id);
        const user = await getUser(userId);

        if (!user) return res.status(404).json({error: 'User not found.'});
        if (checkPassword(password, user.password)) return res.status(401).send({message: "The password is invalid."});
        if (user.changedName) return res.status(404).json({error: 'Username already changed.'});
        if (await isUsernameUnique(username)) return res.status(409).json({error: 'Username already exists.'});

        user.changedName = true;
        user.username = username;
        await user.save();

        return res.json({message: 'Username changed.'});
    });

    app.post("/users/:id/login", async (req, res) => {
        const id = req.params.id;
        const password = req.body.password;
        const ip = req.ip;
        const geo = geoip.lookup(ip);
        const useragent = req.useragent;

        const userId = createObjectId(id);
        const user = await getUser(userId);

        if (!user) return res.status(404).json({error: 'User not found.'});
        if (!checkPassword(password, user.password)) return res.status(401).send({message: "The password is invalid."});

        const session = await new Session({user: userId, ip: ip, location: geo, useragent});

        try {
            await session.save();
        } catch (error) {
            return res.status(500).send(error);
        }
        return res.json({message: 'Session made.'});
    });

    //@todo: need to test
    app.put("/users/:id/register", async (req, res) => {
        const id = req.params.id;
        const email = req.body.email;
        const password = req.body.password;
        const newPassword = req.body.newPassword;

        const userId = createObjectId(id);
        const user = await getUser(userId);

        if (!user) return res.status(404).json({error: 'User not found.'});
        if (checkPassword(password, user.password)) return res.status(401).send({message: "The password is invalid."});

        let hashedPassword;

        try {
            hashedPassword = Bcrypt.hashSync(newPassword, 10);
        } catch (error) {
            return res.status(500).send(error);
        }

        user.registered = true;
        user.email = email;
        user.password = hashedPassword;

        await user.save();

        return res.json({message: 'User registered.'});
    });

    app.get("/username/:username", async (req, res) => {
        const username = req.params.username;
        const foundUser = await User.findOne({username}).exec();

        if(!foundUser) return res.status(404).json({found: false});

        return res.status(200).json({found: true});
    });

    const getUser = async (userId) => await User.findById(userId).exec();

    const isUsernameUnique = async (username) => !!await User.find(username).exec();

    //@todo: duplicate code
    const createObjectId = (userIdString) => {
        try {
            return mongoose.Types.ObjectId(userIdString);
        } catch (err) {
            return null;
        }
    }

    const checkPassword = (password, actualPassword) => {
        return Bcrypt.compareSync(password, actualPassword);
    }

    const randomPassword = (size = 21) => {
        return Crypto
            .randomBytes(size)
            .toString('hex')
            .slice(0, size)
    }
}