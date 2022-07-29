/**
 * Created by nineleaps on 28/10/16.
 */
'use strict';

module.exports = function (req, res, next) {
  // check if user exists
  var user = req.user;

  if (!user) {
    sails.log.error("@isUserOwnStory :: User is null");

    return res.handleError({
      code: 500,
      message: 'INTERNAL_SERVER_ERROR'
    });
  }

  var accountId = req.param('accountId');
  var type = req.param('type');

  if (!accountId) {
    sails.log.error("@isUserOwnStory :: AccountId not found");

    return res.handleError({
      code: 400,
      message: 'ACCOUNTID_REQUIRED'
    });
  }

  if(type =='ACH') {
    Account
      .getAccountForUser(accountId, user.id)
      .then(function (account) {
        req.account = account;
        return next();
      })
      .catch(function (err) {
        return res.handleError(err);
      })


  } else if(type == 'Fluid-Card') {
    FluidCard
    .getFluidcardForUser(accountId, user.id)
    .then(function (fluidCard) {

        req.account = fluidCard;

        return next();
    })
    .catch(function (err) {
      return res.handleError(err);
    })
  }


};
