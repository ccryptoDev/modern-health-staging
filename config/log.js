/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * http://sailsjs.org/#!/documentation/concepts/Logging
 */

/*var winston = require('winston');

var customLogger = new winston.Logger({
    transports: [
        new(winston.transports.File)({
            level: 'debug',
            filename: 'my_log_file.log'
        }),
    ],
});*/


/*var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)( {
            level: 'verbose',
            colorize: false,
            json: false
        } ),
        new (winston.transports.File)({
            filename: 'my_log_file.log',
            level: 'verbose',
            colorize: false,
            json: false
        })
    ]
});*/

module.exports.log = {

  /***************************************************************************
  *                                                                          *
  * Valid `level` configs: i.e. the minimum log level to capture with        *
  * sails.log.*()                                                            *
  *                                                                          *
  * The order of precedence for log levels from lowest to highest is:        *
  * silly, verbose, info, debug, warn, error                                 *
  *                                                                          *
  * You may also set the level to "silent" to suppress all logs.             *
  *                                                                          *
  ***************************************************************************/

	level: "verbose"
  /*level:'debug',
  colors: true,
  custom: customLogger*/

 	/*level: 'debug',
    colorize: false,
    json: false,
    custom: logger*/

};
