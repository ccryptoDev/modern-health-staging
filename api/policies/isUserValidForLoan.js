/**
 * Created by raviteja on 26/11/16.
 */
'use strict';

module.exports = function (req, res, next) {
  // get the user
  var user = req.user;

  // check if user profile is updated and email verified
  if (!user.isUserProfileUpdated) {
    // send back an error response
    return res.handleError({
      code: 400,
      message: 'USER_PROFILE_UPDATE_REQUIRED'
    });
  }

  // check if user email is verified
  if (!user.isEmailVerified) {
    return res.handleError({
      code: 400,
      message: 'USER_EMAIL_NOT_VERIFIED'
    });
  }

  // check if user has a existing loan
  if (user.isExistingLoan) {
    return res.handleError({
      code: 400,
      message: 'STORY_LOAN_EXISTS'
    });
  }

  // check if user has added atleast one account
  Account
    .getAllForUser(user)
    .then(function (accounts) {
      if (accounts.length == 0) {
        // throw an error
        return res.handleError({
          code: 400,
          message: 'USER_ACCOUNT_EMPTY'
        });
      }

      return next();
    })
    .catch(function (err) {

    })
};
