var winston = require('winston'),
    ENV = process.env.NODE_ENV || 'development';

function getLogger(module){
    "use strict";
    var path = module.filename.split('/').slice(-2).join('/');

    return new winston.Logger({
        transports:[
            new winston.transports.Console({
                colorize: true,
                level: ENV == 'development' ? 'debug' : 'error',
                label: path
            }),
/*            new winston.transports.File({
                filename: 'log/logs.log',
                level: "info",
                label: path
            })*/
        ]
    })
}

module.exports = getLogger;