'use strict';

module.exports = function (req, res, next) {
  // check if user exists
    var account = req.account;
  if (!account) {
    sails.log.error("@isRiskEngineVerified :: Account is null");

    return res.handleError({
      code: 404,
      message: 'ACCOUNT_NOT_FOUND'
    });
  }

  // query for the account for user
  RiskEngineService
    .approveUserAccountForStory(account,account.userBankAccount)
    .then(function (approvedUserBankAccount) {
      if (approvedUserBankAccount) {
        req.approvedUserBankAccount = approvedUserBankAccount;
        return next();
      } else {
        req.approvedUserBankAccount = null;
        return next();
      }
    })
    .catch(function (err) {
      return res.handleError(err);
    })
};

//58875a48c003433d5ecf8593
