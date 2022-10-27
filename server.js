const config = require('./config/config');
const mongoose = require('mongoose');
const express = require('express');
const useragent = require('express-useragent');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const helmet = require('helmet');
const server = express();
const apiVersion = 'v1.0'

server.set('trust proxy', true);
server.use(useragent.express());
server.use(helmet())
server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

require('./models/users');
require('./models/leaderboard');
require('./models/sessions');
require('./routes/users')(server, apiVersion);
require('./routes/leaderboards')(server, apiVersion);

server.get('/', (req, res) => {
    res.send('Running Jomho Game Server')
})

mongoose.connect(config.mongo.uri, () =>
    server.listen(config.port, () =>
        console.log(`Jomho Game Server listening at http://localhost:${config.port}\nAccess api documentation at http://localhost:${config.port}/docs`)
    ));
