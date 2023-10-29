const config = require('./src/config/config');
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

require('./src/models/users');
require('./src/models/leaderboard');
require('./src/models/sessions');
require('./src/routes/user')(server, apiVersion);
require('./src/routes/leaderboard')(server, apiVersion);

server.get('/', (req, res) => {
    res.send('Running Jomho Game Server')
})

mongoose.connect(config.mongo.uri, () =>
    server.listen(config.port, () =>
        console.log(`Jomho Game Server listening at http://localhost:${config.port}\nAccess api documentation at http://localhost:${config.port}/docs`)
    ));
