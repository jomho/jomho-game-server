const config = require('./config/config');
const mongoose = require('mongoose');
const express = require('express');
const useragent = require('express-useragent');
const helmet = require('helmet');
const server = express();

server.set('trust proxy', true);
server.use(useragent.express());
server.use(helmet())
server.use(express.json());
server.use(express.urlencoded({extended: true}));

require('./models/users');
require('./models/leaderboard');
require('./models/sessions');
require('./routes/users')(server);
require('./routes/leaderboards')(server);

server.get('/', (req, res) => {
    res.send('Running Jomho Game Server')
})

mongoose.connect(config.mongo.uri, () =>
    server.listen(config.port, () =>
        console.log(`Example app listening at http://localhost:${config.port}`)
    ));
