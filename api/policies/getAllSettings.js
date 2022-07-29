/**
 * Created by nineleaps on 28/10/16.
 */
'use strict';

module.exports = function (req, res, next) {
  Setting
    .find()
    .then(function (setting) {
      req.setting = setting[0];
      return next();
    })
    .catch(function (err) {
      sails.log.error('@isUserOwnStory :: Error :: ', err);
      return res.serverError();
    });
  }
