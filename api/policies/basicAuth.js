'use strict';

var basicAuthConfig = sails.config.basicAuthConfig,
  basicAuth = require('basic-auth');

module.exports = function (req, res, next) {
  var credentials = basicAuth(req);

  if (!credentials || credentials.name !== basicAuthConfig.username || credentials.pass !== basicAuthConfig.password) {
    res.unauthorized();
  } else {
    next();
  }
};
