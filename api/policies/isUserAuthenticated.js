'use strict';

var _ = require('lodash');

// policies/canWrite.js
module.exports = function (req, res, next) {
  var authToken = req.headers['authorization'];
  if (_.isUndefined(authToken)) {
    var err = {
      code: 401,
      message: 'USER_AUTHENTICATION_ERROR'
    };

    return res.handleError(err);
  }

  AuthenticationService
    .validateToken(authToken)
    .then(function (user) {
      // set user in the request
      req.user = user;

      return next();
    }, function (err) {
      sails.log.error('#IsUserAuthenticated :: Error while validating the ' +
        'token :: ', err);

      return res.handleError(err);
    });
};
