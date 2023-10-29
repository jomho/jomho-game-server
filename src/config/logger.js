const {createLogger, format, transports} = require('winston');

const logger = createLogger({
    transports: [
        new transports.Console({format: format.simple()}),
        new transports.File({
            filename: './logs/logs.log',
            format: format.combine(
                format.timestamp(),
                format.json(),
            ),
            handleExceptions: true,
        })
    ],
});

module.exports = logger;