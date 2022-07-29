/**
 * UserController
 *
 * @description :: Server-side logic for managing Devices
 * @help        :: See http://sailsjs.org/!/documentation/concepts/Controllers
 */
var passport = require('passport'),
  moment = require('moment'),
  _ = require('lodash');

var async = require('async');
var fs = require("fs");

var in_array = require('in_array');

//var ip = require('ip');

module.exports = {
  registerDevice: registerDeviceAction,
  apiLogin: apiLoginAction,
  apiLogout: apiLogoutAction,
  preLogin: preLogin,
  login: loginAction,
  logout: logoutAction,
  finalizeUser: finalizeUserAction,
  smsCodeNotification: smsCodeNotificationAction,
  smsCodeVerification: smsCodeVerificationAction,
  uploadProfilePicture: uploadProfilePicture,
  getUserProfile: getUserProfile,
  addScreenName: addScreenNameAction,
  getAllUserAgreements: getAllUserAgreementsAction,
  changeNotificationStatus: changeNotificationStatusAction,
  creditLimitRequest: creditLimitRequestAction,
  updateProfile: updateProfileAction,
  adminLoginView: adminLoginViewAction,
  registerAdminView: registerAdminViewAction,
  forgetPassword: forgetPasswordAction,
  activateAccount: activateAccountAction,
  getSettingDetail: getSettingDetailAction,
  updateSettingOfUser: updateSettingOfUserAction,
  verifyEmail: verifyEmailAction,
  loanConfirmed: loanConfirmedAction,
  getUserLoanStatus: getUserLoanStatusAction,
  removeCompleteUser: removeCompleteUserAction,
  getAllPaymentManagement: getAllPaymentManagementAction,
  getAllLatePaymentManagement: getAllLatePaymentManagementAction,
  forgetApiPassword: forgetApiPasswordAction,
  changeApiPassword: changeApiPasswordAction,
  forgetPasscode: forgetPasscodeAction,
  getallUserDetails: getallUserDetailsAction,
  ajaxManageUserlist: ajaxManageUserlist,
  updateUserStatus: updateUserStatusAction,
  viewUserDetails: viewUserDetailsAction,
  deleteUserDetails: deleteUserDetailsAction,
  resendVerficationlink: resendVerficationlinkAction,
  sendverficationlink: sendverficationlinkAction,
  sendverficationcode: sendverficationcodeAction,
  changeverifystatus: changeverifystatusAction,
  changephoneverifystatus: changephoneverifystatusAction,
  updatepushnotification: updatepushnotificationAction,
  removephone: removephoneAction,
  changeemail: changeemailAction,
  changeAPIEmailaddress: changeAPIEmailaddressAction,
  changeNewbank: changeNewbankAction,
  changephone: changephoneAction,
  socialRegisterDevice: socialRegisterDeviceAction,
  finalizeSocialUser: finalizeSocialUserAction,
  userTrackingData: userTrackingDataAction,
  ajaxUserTrackingList: ajaxUserTrackingListAction,
  showUserTrackingMap: showUserTrackingMap,
  userContactsData: userContactsDataAction,
  ajaxUserContactsList: ajaxUserContactsListAction,
  userInvitesData: userInvitesDataAction,
  saveInviteUser: saveInviteUserAction,
  manageproducts: manageproductsAction,
  viewproductdetails: viewproductdetailsAction,
  getloanamountcapfields: getloanamountcapfieldsAction,
  createupdateamountcap: createupdateamountcapAction,
  getloanstateregualtionfields: getloanstateregualtionfieldsAction,
  ajaxgetloanamountcap: ajaxgetloanamountcapAction,
  ajaxgetinterestrates: ajaxgetinterestratesACtion,
  //getproductRules:getproductRulesAction
  resentinviteemail: resentinviteemailAction,
  registeruser: registeruserAction,
  ajaxregisteruserlist: ajaxregisteruserlistAction,
  newresentinviteemail: newresentinviteemailAction,
  maintenanceView: maintenanceView,
  updateUserNameDetails: updateUserNameDetails,
  updateAddressDetails: updateAddressDetails,
  resetUserDetails: resetUserDetailsAction,
  getallResetUsers: getallResetUsers,
  ajaxManageResetUserlist: ajaxManageResetUserlistAction,
  viewResetUserDetails: viewResetUserDetailsAction,
  changeMobile: changeMobile,
  joinRoom: joinRoom
};



function socialRegisterDeviceAction(req, res) {

  //Form validation
  if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }

  //checking App version
  if (!req.form.appversion) {
    var errordata = {
      "code": 403,
      "message": "Please update fluid app with latest version from app store to continue"
    };
    var responsedata = {
      "status": "error",
      "data": errordata
    };
    return res.send(responsedata);
  }
  else {
    if (sails.config.appManagement.appVersion > req.form.appversion) {
      var errordata = {
        "code": 404,
        "message": "Please update fluid app with latest version from app store to continue"
      };
      var responsedata = {
        "status": "error",
        "data": errordata
      };
      return res.send(responsedata);
    }
  }

  User
    .socialregisterOrLoadUser(req.form)
    .then(function (uservalues) {
      sails.log.info('UserController#socialRegisterDeviceAction :: information :', uservalues);

      //-- save user geolocation
      var usergeodata = {};
      usergeodata.latitude = req.param("latitude");
      usergeodata.longitude = req.param("longitude");
      usergeodata.street = req.param("street");
      usergeodata.locality = req.param("locality");
      usergeodata.city = req.param("city");
      usergeodata.state = req.param("state");
      usergeodata.country = req.param("country");
      usergeodata.postalcode = req.param("postalcode");

      if (uservalues.code == 200) {
        Usergeotracking.saveUserTrackingDetails(uservalues.userdata.id, usergeodata)
          .then(function (usertrackingData) {
            sails.log.info("Usergeotracking save info::", usertrackingData);
          })
          .catch(function (err) {
            sails.log.error("Usergeotracking save error::", err);
          });

        var token = AuthenticationService.createAndSaveToken(uservalues.userdata);
        return res.success(uservalues.userdata, token);
      }
      else if (uservalues.code == 401) {
        Usergeotracking.saveUserTrackingDetails(uservalues.userdata.id, usergeodata)
          .then(function (usertrackingData) {
            sails.log.info("Usergeotracking save info::", usertrackingData);
          })
          .catch(function (err) {
            sails.log.error("Usergeotracking save error::", err);
          });

        return res.success(uservalues.userdata, uservalues.userdata.token);
      }
      else {
        var errordata = {
          "code": 400,
          "message": "Already you have registered using this social account"
        };
        var responsedata = {
          "status": "error",
          "data": errordata
        };
        sails.log.error('UserController#socialRegisterDeviceAction :: err :', responsedata);
        return res.send(responsedata);
      }
    })
    .catch(function (err) {
      sails.log.error('UserController#socialRegisterDeviceAction :: err :', err);
      return res.handleError(err);
    });
}

function registerDeviceAction(req, res) {
  //console.log("register device",req);
  if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }

  console.log("form is valid");
  console.log("form data:", req.form);


  //checking App version
  if (!req.form.appversion) {
    var errordata = {
      "code": 403,
      "message": "Please update fluid app with latest version from app store to continue"
    };
    var responsedata = {
      "status": "error",
      "data": errordata
    };
    console.log("login error : ", responsedata);
    return res.send(responsedata);
  }
  else {
    console.log("appVersion : ", sails.config.appManagement.appVersion);
    if (sails.config.appManagement.appVersion > req.form.appversion) {
      var errordata = {
        "code": 404,
        "message": "Please update fluid app with latest version from app store to continue"
      };
      var responsedata = {
        "status": "error",
        "data": errordata
      };
      console.log("login error : ", responsedata);
      return res.send(responsedata);
    }
  }

  User
    .registerOrLoadUser(req.form)
    .then(function (user) {


      console.log("Registered or loaded", user.code);

      if (user.code == 200) {
        //-- save user geolocation
        var usergeodata = {};
        usergeodata.latitude = req.param("latitude");
        usergeodata.longitude = req.param("longitude");
        usergeodata.street = req.param("street");
        usergeodata.locality = req.param("locality");
        usergeodata.city = req.param("city");
        usergeodata.state = req.param("state");
        usergeodata.country = req.param("country");
        usergeodata.postalcode = req.param("postalcode");

        //sails.log.info("Usergeotracking userId::", user.userdata.id);
        //sails.log.info("usergeodata::", usergeodata);

        Usergeotracking.saveUserTrackingDetails(user.userdata.id, usergeodata)
          .then(function (usertrackingData) {
            sails.log.info("Usergeotracking save info::", usertrackingData);
          })
          .catch(function (err) {
            sails.log.error("Usergeotracking save error::", err);
          });

        //var token = AuthenticationService.authenticateDevice(user);
        var token = AuthenticationService.createAndSaveToken(user.userdata);
        //console.log("retun value: ",res.success(token));
        //return res.success(token);
        //console.log("userdata",user);
        //console.log("token:",token);
        sails.log.info("university.name: ", user.userdata.university);
        if ("undefined" === typeof user.userdata.university || user.userdata.university == '' || user.userdata.university == null) {
          return res.success(user.userdata, token);
        }
        else {
          University
            .findOne({
              id: user.userdata.university
            })
            .then(function (university) {
              if (university) {
                sails.log.info("university.name: ", university.name);
                user.userdata.universityname = university.name;
                user.userdata.userImage = "";
              }
              return res.success(user.userdata, token);
            });
        }
        //return res.success(user.userdata,token);
      }
      else {
        var errordata = {
          "code": 400,
          "message": "Email already exist"
        };
        var responsedata = {
          "status": "error",
          "data": errordata
        };
        //console.log("userdata exist",responsedata);
        //return res.handleError(error);
        return res.send(responsedata);
      }

    })
    .catch(function (err) {
      sails.log.error('UserController#registerDeviceAction :: err :', err);

      return res.handleError(err);
    });
}

function finalizeUserAction(req, res) {
  var keys = req.param('keys');

  if (!req.form.isValid) {
    // send custom error message
    var error = {
      "code": 400,
      "message": "FINALIZE_FORM_INVALID"
    };

    return res.handleError(error);
  }

  var permission = false;
  var user = req.user;
  var screenName = req.form.screenName;

  User
    .retrieveUserByPhoneNumber(req.form.phoneNumber)
    .then(function (user) {
      if (user) {
        throw {
          code: 403,
          message: "already registered"
        };
      }
      return User.find({ screenName: req.form.screenName });
    }).then(function (users) {
      if (users.length) {
        console.error("user with this name already exists");
      }
      console.log("setting phonenumber");
      return UserRegistrationService
        .initTwoFactorAuth(user, req.form).then(function () {
          user.phoneNumber = req.form.phoneNumber;
          return user.save();
        });
      // }).then(function(){
      // async call
      //    console.log("Create Agreement")
      //    return UserConsent.createConsentForAgreements(keys, req.ip, req.user);
    }).then(function () {
      console.log("save pass")
      user.password = req.form.pass;
      return User.generateEncryptedPassword(user, User.generateSalt()).then(function () {
        return user.save();
      })
    }).then(function () {
      console.log("set screen name");
      return User
        .createScreenName(user.id, screenName)
    }).then(function () {
      console.log("success");
      return res.success(user);
    }).catch(function (err) {
      if (err.code) {
        return res.handleError(err);
      }
      sails.log.error('UserController#finalizeUserAction#catch :: error quering Db :', err);
      return res.handleError({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    });
}
//TODO: Need to change  validation NUmber
function smsCodeNotificationAction(req, res) {
  var keys = req.param('keys');

  if (!req.form.isValid) {
    // send custom error message
    var error = {
      "code": 400,
      "message": "PHONENUMBER_LENGTH_INVALID"
    };

    return res.handleError(error);
  }

  User
    .retrieveUserByPhoneNumber(req.form.phoneNumber)
    .then(function (user) {
      if (user) {
        var error = {
          "code": 400,
          "message": "Phone number already used"
        };
        return res.handleError(error);
      }

      UserRegistrationService
        .initTwoFactorAuth(req.user, req.form)
        .then(function () {
          // async call
          //UserConsent.createConsentForAgreements(keys, req.ip, req.user);
          UserConsent.createConsentForAgreements(keys, req.headers['x-forwarded-for'] || req.connection.remoteAddress, req.user);
          return res.success();
        })
        .catch(function (err) {
          sails.log.error('UserController#smsCodeNotificationAction :: err :', err);

          return res.handleError(err);
        });


    })

  /*UserRegistrationService
  .initTwoFactorAuth(req.user, req.form)
  .then(function () {
    // async call
    UserConsent.createConsentForAgreements(keys, req.ip, req.user);

    return res.success();
  })
  .catch(function (err) {
    sails.log.error('UserController#smsCodeNotificationAction :: err :', err);

    return res.handleError(err);
  });*/
}

function smsCodeVerificationAction(req, res) {

  if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());

    return res.failed(validationErrors);
  }
  var user = req.user;
  var data = req.form;

  var type = req.param('type');
  //sails.log.info('UserController#smsCodeVerificationAction :: info :', type);

  if ("undefined" !== typeof req.param('type') && req.param('type') != '' && req.param('type') != null && req.param('type') == 'edit') {
    var updatetype = 'edit';
  }
  else {
    var updatetype = 'add';
  }
  sails.log.info('UserController#smsCodeVerificationAction :: updatetype :', updatetype);

  UserRegistrationService
    .verificationUser(req.user, req.form)
    .then(function () {
      // user is valid;
      // check if user already exists in our db

      return User
        .updatePhoneNumber(req.user, req.form, updatetype)
        .then(function (user) {
          return User.updateisPhoneVerified(user, data)
            .then(function (userWithToken) {
              return res.success(userWithToken);
            })
          // TODO: send authenticated response

        })

    })
    .catch(function (err) {
      return res.handleError(err);
    });

}

function uploadProfilePicture(req, res) {
  var localPath = req.localPath,
    user = req.user;

  if (!localPath || !user) {
    sails.log.error("UserController#uploadProfilePicture :: Insufficient Data");
    return res.serverError();
  }

  Asset
    .createAssetForLocalPath(user, localPath, Asset.ASSET_TYPE_PROFILE_PICTURE)
    .then(function (asset) {
      User.uploadUserProfilePicture(user, asset)
        .then(function () {
          return res.success();
        })
    })
    .catch(function (err) {
      sails.log.error('UserController#uploadProfilePicture :: err :', err);

      return res.handleError(err);
    });
}


function getUserProfile(req, res) {
  var id = req.user;
  User
    .getProfile(id.id)
    .then(function (user) {
      return res.success(user);
    })
    .catch(function (err) {
      sails.log.error('UserController#getUserProfile :: err :', err);

      return res.handleError(err);
    });
}


function addScreenNameAction(req, res) {
  if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }

  var permission = false;
  var user = req.user;
  var screenName = req.form.screenName;
  User
    .find()
    .then(function (users) {

      _.forEach(users, function (user) {
        if (user.screenName && screenName.toUpperCase() === user.screenName.toUpperCase()) {
          console.log("it should come hre as screen name is false", screenName.toUpperCase(), user.screenName.toUpperCase());
          permission = false;
          return res.handleError({
            code: 400,
            message: 'SCREEN_NAME_TAKEN'
          });
        } else {
          permission = true;
        }
      });
      if (permission == true) {

        User
          .createScreenName(user.id, screenName)
          .then(function (user) {
            return res.success(user);
          })
          .catch(function (err) {
            sails.log.error('UserController#addScreenNameAction#catch :: err :', err);
            return res.handleError(err);
          });
      } else {
        sails.log.error("UserController#addScreenNameAction#catch :: ScreenName is taken ::");
        return res.handleError({
          code: 400,
          message: 'SCREEN_NAME_TAKEN'
        });
      }
    })
    .catch(function (err) {
      sails.log.error('UserController#addScreenNameAction#catch :: error quering Db :', err);
      return res.handleError({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    });
}

function getAllUserAgreementsAction(req, res) {
  var user = req.user.id;
  UserConsent
    .getAgreementsOfUser(user)
    .then(function (userConsents) {
      return res.success(userConsents);
    })
    .catch(function (err) {
      sails.log.error('UserController#getAllUserAgreementsAction#catch :: err :', err);
      return res.handleError(err);
    });
}


function changeNotificationStatusAction(req, res) {
  var userId = req.user.id;
  var status = req.form.status;
  User
    .updateNotificationStatus(userId, status)
    .then(function (smsNotificationStatus) {
      return res.success(smsNotificationStatus);
    })
    .catch(function (err) {
      sails.log.error('UserController#changeNotificationStatusAction#catch :: err :', err);
      return res.handleError(err);
    });
}

function creditLimitRequestAction(req, res) {
  var userId = req.user.id;
  var limitRequest = req.form.limitRequest;
  User
    .requestCreditLimit(userId, limitRequest)
    .then(function (creditLimit) {
      return res.success(creditLimit);
    })
    .catch(function (err) {
      sails.log.error('UserController#creditLimitRequestAction#catch :: err :', err);
      return res.handleError(err);
    });
}

function updateProfileAction(req, res) {
  var user = req.user;
  if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }
  var data = req.form;

  //Added to check email validation during profile update.
  var usercriteria = {
    email: data.email,
    isDeleted: false
  };
  sails.log.info("previous email: ", user.email);
  sails.log.info("new email: ", data.email);

  //-- Added to insert user input data into plaid data (when plaid returns empty details)
  PlaidUser
    .checkUserPlaidDetails(user, data)
    .then(function (plaidDetails) {

      var plaidEmailAddress = PlaidUser.getPrimaryEmail(plaidDetails);
      sails.log.info("plaidEmailAddress: ", plaidEmailAddress);

      User.findOne(usercriteria)
        .then(function (userdata) {
          if (userdata && data.email != user.email) {
            return res.handleError({
              code: 400,
              message: 'REGISTER_EMAIL_ALREADY'
            });
          }
          else {
            User
              .updateProfileOfUser(user, data)
              .then(function (user) {
                res.success(user);
              })
              .catch(function (err) {
                sails.log.error('UserController#updateProfileAction#catch :: err :', err);
                return res.handleError(err);
              });
          }
        })
        .catch(function (err) {
          sails.log.error("User#updateProfileAction:: err : ", err);
          return res.handleError(err);
        });

    })
    .catch(function (err) {
      sails.log.error("User#updateProfileAction:: err : ", err);
      return res.handleError(err);
    });
}

function adminLoginViewAction(req, res) {
  var errorval = '';
  if (req.session.errormsg != '') {
    errorval = req.session.errormsg;
    req.session.errormsg = '';
  }
  //sails.log.info("Session : ", req.session.errormsg);
  return res.view('admin/login', {
    error: errorval
  });
}

function registerAdminViewAction(req, res) {
  return res.view("admin/register");
}

function forgetPasswordAction(req, res) {

  var errorval = '';
  var successval = '';

  if (req.session.forgeterror != '') {
    errorval = req.session.forgeterror;
    req.session.forgeterror = '';
  }

  if (req.session.forgetsuccess != '') {
    successval = req.session.forgetsuccess;
    req.session.forgetsuccess = '';
  }

  return res.view("admin/forgotPasswordView", {
    error: errorval, successval: successval
  });



}

function preLogin(req, res) {
  var user = req.user;
  user.token = req.headers['authorization'];
  return user.save().then(function () {
    console.log("saved user:", user)
    return res.success(user);
  }, function (err) {
    console.error(err);
    res.handleError(err);
  });
}

var bcrypt = require("bcrypt");
// const Transunionhistory = require('../models/Transunionhistory');
function apiLoginAction(req, res) {

  if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }

  //checking App version
  if (!req.form.appversion) {
    var errordata = {
      "code": 403,
      "message": "Please update fluid app with latest version from app store to continue"
    };
    var responsedata = {
      "status": "error",
      "data": errordata
    };
    //console.log("login error : ",responsedata);
    return res.send(responsedata);
  }
  else {
    //console.log("appVersion : ",sails.config.appManagement.appVersion);
    if (sails.config.appManagement.appVersion > req.form.appversion) {
      var errordata = {
        "code": 404,
        "message": "Please update fluid app with latest version from app store to continue"
      };
      var responsedata = {
        "status": "error",
        "data": errordata
      };
      //console.log("login error : ",responsedata);
      return res.send(responsedata);
    }
  }

  //-- save user geolocation
  var usergeodata = {};
  usergeodata.latitude = req.param("latitude");
  usergeodata.longitude = req.param("longitude");
  usergeodata.street = req.param("street");
  usergeodata.locality = req.param("locality");
  usergeodata.city = req.param("city");
  usergeodata.state = req.param("state");
  usergeodata.country = req.param("country");
  usergeodata.postalcode = req.param("postalcode");

  if ("undefined" !== typeof req.form.logintype && req.form.logintype != '' && req.form.logintype != null && req.form.logintype == 'social') {
    //Login using social
    sails.log.info("Enter if loop: ", req.form.logintype);

    User
      .getUserBySocialNetworkID(req.form.password)
      .then(function (user) {
        if (!user) {
          throw { code: 400, message: "user not found" };
        }

        var data = req.form;
        var deviceToken = data.devicetoken;

        updatedevicetoken = 0;
        if (user.devicetoken) {
          if (deviceToken != user.devicetoken) {
            updatedevicetoken = 1;
          }
        }
        else {
          updatedevicetoken = 1;
        }

        if (updatedevicetoken == 1) {
          user.notify = 1;
          user.devicetoken = deviceToken;
        }
        user.loggedin = 1;
        user.save(function (err) {

        });
        AuthenticationService.createAndSaveToken(user);
        return user;
      }).then(function (updatedUser) {

        //-- save user geolocation
        Usergeotracking.saveUserTrackingDetails(updatedUser.id, usergeodata)
          .then(function (usertrackingData) {
            sails.log.info("Usergeotracking save info::", usertrackingData);
          })
          .catch(function (err) {
            sails.log.error("Usergeotracking save error::", err);
          });

        var userIds = [];
        userIds.push(updatedUser.id);
        Story
          .getProfileImagesForUsers(userIds)
          .then(function (userImagesMap) {

            updatedUser.userImage = userImagesMap[updatedUser.id] || "";

            if ("undefined" === typeof updatedUser.university || updatedUser.university == '' || updatedUser.university == null) {
              res.success(updatedUser);
            }
            else {
              University
                .findOne({
                  id: updatedUser.university
                })
                .then(function (university) {
                  if (university) {
                    updatedUser.universityname = university.name;
                  }
                  res.success(updatedUser);
                });
            }
          })
          .catch(function (err) {

            if ("undefined" === typeof updatedUser.university || updatedUser.university == '' || updatedUser.university == null) {
              res.success(updatedUser);
            }
            else {
              University
                .findOne({
                  id: updatedUser.university
                })
                .then(function (university) {
                  if (university) {
                    updatedUser.universityname = university.name;
                  }
                  res.success(updatedUser);
                });
            }
          });
      })
      .catch(function (err) {
        sails.log.error('UserController#loginAction :: err :', err);
        var errordata = {
          "code": 404,
          "message": "Invalid social login"
        };
        var responsedata = {
          "status": "error",
          "data": errordata
        };
        return res.send(responsedata);
      });
  }
  else {
    //Login using signup
    sails.log.info("Enter else loop:");

    //Validate email address
		/*try{
			sails.log.info("Enter try loop:");

			req.validate('email')
				.isEmail("", "INVALID_EMAIl")
				.required("", "LOGIN_EMAIL_REQUIRED"),
			  	validate('password')
				.required("", "LOGIN_PASSWORD_REQUIRED")

			 req.validate({
				   email: { required: true, email: true },
				   password: { required: true }
			 });

		}catch(err){

			sails.log.info("Enter catch loop:",err);

			 var errordata = {
							  "code": 404,
							  "message": "Invalid email address"
						  };
			var responsedata = {
				"status": "error",
				"data": errordata
			};
			return res.send(responsedata);
		}*/

		/*var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        if (reg.test(req.form.email) == false)
        {
            var errordata = {
							  "code": 404,
							  "message": "Invalid email address"
						  };
			var responsedata = {
				"status": "error",
				"data": errordata
			};
			return res.send(responsedata);
        }*/

    User
      //.retrieveUserByPhoneNumber(req.form.phoneNumber)
      .getUserByEmailId(req.form.email)
      .then(function (user) {
        if (!user) {
          throw { code: 400, message: "not found" };
        }
        return new Promise(function (res, rej) {
          bcrypt.compare(req.form.password, user.password, function (err, result) {
            if (err) return rej(err);
            if (!result) return rej({ code: 403, message: "invalid pass" });
            res();
          });
        }).then(function () {
          console.log("Authincate");

          //--Added to update device token if differ starts here
          var data = req.form;
          var deviceToken = data.devicetoken;

          sails.log.info("data.devicetoken: ", data.devicetoken);
          sails.log.info("user.devicetoken: ", user.devicetoken);

          updatedevicetoken = 0;
          if (user.devicetoken) {
            if (deviceToken != user.devicetoken) {
              updatedevicetoken = 1;
            }
          }
          else {
            updatedevicetoken = 1;
          }

          sails.log.info("updatedevicetoken: ", updatedevicetoken);

          if (updatedevicetoken == 1) {
            user.notify = 1;
            user.devicetoken = deviceToken;
          }
          user.loggedin = 1;
          user.save(function (err) {
          });
          //--Added to update device token if differ ends here

          return AuthenticationService.createAndSaveToken(user);
        }).then(function () {
          //console.log("userdata",user);
          return user;
        });
      }).then(function (updatedUser) {
        //sails.log.info("university details: ",updatedUser.university);

        sails.log.info("userID: ", updatedUser.id);

        //-- save user geolocation
        Usergeotracking.saveUserTrackingDetails(updatedUser.id, usergeodata)
          .then(function (usertrackingData) {
            sails.log.info("Usergeotracking save info::", usertrackingData);
          })
          .catch(function (err) {
            sails.log.error("Usergeotracking save error::", err);
          });

        var userIds = [];
        userIds.push(updatedUser.id);
        Story
          .getProfileImagesForUsers(userIds)
          .then(function (userImagesMap) {
            updatedUser.userImage = userImagesMap[updatedUser.id] || "";

            if ("undefined" === typeof updatedUser.university || updatedUser.university == '' || updatedUser.university == null) {
              //sails.log.info("enter if loop");
              res.success(updatedUser);
            }
            else {
              //sails.log.info("enter else loop");
              //res.success(updatedUser);

              University
                .findOne({
                  id: updatedUser.university
                })
                .then(function (university) {
                  if (university) {
                    //sails.log.info("university.name: ", university.name);
                    updatedUser.universityname = university.name;
                  }
                  //sails.log.info("final userdata",updatedUser);
                  res.success(updatedUser);
                });
            }

          })
          .catch(function (err) {
            sails.log.error("User#getProfilePicture :: err : ", err);

            if ("undefined" === typeof updatedUser.university || updatedUser.university == '' || updatedUser.university == null) {
              res.success(updatedUser);
            }
            else {
              University
                .findOne({
                  id: updatedUser.university
                })
                .then(function (university) {
                  if (university) {
                    updatedUser.universityname = university.name;
                  }
                  res.success(updatedUser);
                });
            }
          });
      })
      .catch(function (err) {
        sails.log.error('UserController#loginAction :: err :', err);
        var errordata = {
          "code": 404,
          "message": "Incorrect Email or Password"
        };
        var responsedata = {
          "status": "error",
          "data": errordata
        };
        console.log("login error : ", responsedata);
        return res.send(responsedata);
        //return res.handleError(err);
      });
  }
}

function apiLogoutAction(req, res) {

  /*req.user.token = "";
  return req.user.save(function(err, user){
    if(err) return res.handleError(err);
    res.success({ success: true });
  });*/

  var emailID = req.query.email;
  console.log('email', emailID);

  if (emailID != '' && typeof emailID !== 'undefined') {
    User
      .getUserByEmailId(emailID)
      .then(function (user) {
        if (!user) {
          throw { code: 400, message: "not found" };
        }
        else {
          user.token = "";
          user.loggedin = 0;
          return user.save(function (err, user) {
            if (err) return res.handleError(err);
            res.success({ success: true });
          });
        }
      })
      .catch(function (err) {
        sails.log.error('UserController#apiLogoutAction#catch :: err :', err);
        return res.handleError(err);
      });
  }
  else {
    return res.handleError({
      code: 400,
      message: 'LOGIN_EMAIL_REQUIRED'
    });
  }
}


function loginAction(req, res) {

  if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }
  Adminuser.findOne({ email: req.form.email })
    .populate('practicemanagement')
    .then(function (adminuser) {

      console.log("here is the user", req.form.email);
      console.log("user", adminuser);

      if ( !adminuser || adminuser.isDeleted ) {
        req.session.errormsg = '';
        req.session.errormsg = 'Invalid Username and Password';
        return res.redirect("/adminLogin");
      }
      passport.authenticate('local', function (err, adminuser, info) {

        console.log("Admin User: ", adminuser);
        console.log("Admin err: ", err);

        if ((err) || (!adminuser)) {
          var json = {
            status: 400,
            message: "INSUFFICIENT_DATA"
          };
          req.session.errormsg = '';
          req.session.errormsg = 'Invalid Username and Password';
          return res.redirect("/adminLogin");
        }


        req.logIn(adminuser, function (err) {
          if (err) {
            res.handleError(err);
          }
          //console.log("here is the user",adminuser);
          var roleCriteria = {
            id: adminuser.role
          };

          Roles.findOne(roleCriteria)
            .then(function (roledata) {
              var loginusrrole = roledata.rolename;
              //sails.log.info('loginusrrole : ', loginusrrole);

              var modulename = 'Admin login';
              var modulemessage = 'loggedin successfully';
              req.logdata = req.user;
              req.user.rolename = loginusrrole;
              req.session.rolename = loginusrrole;

              //sails.log.info('req.user.rolename : ', req.user.rolename);

              Logactivity.registerLogActivity(req, modulename, modulemessage)
                .then(function (logdata) {


                  sails.log.info("logdata:", logdata);
                  req.session.logReferenceID = logdata.logreference;

                  sails.log.info("allowedAdminRoles:", sails.config.allowedAdminRoles);

                  if (in_array(loginusrrole, sails.config.allowedAdminRoles)) {
                    return res.redirect("/admin/dashboard");
                  }
                  else {
                    req.session.errormsg = '';
                    req.session.errormsg = 'Invalid Username and Password';
                    return res.redirect("/adminLogin");
                  }

                  /* if(loginusrrole=='Admin'){
                     console.log("req.user: ",req.user)
                     return res.redirect("/admin/dashboard");
                   }
                   else if(loginusrrole=='Underwriter' || loginusrrole=='Customer service' )
                   {
                     return res.redirect("/admin/dashboard");
                   }
                   else
                   {
                     req.session.errormsg='';
                     req.session.errormsg = 'Invalid Username and Password';
                     return res.redirect("/adminLogin");
                   }*/
                });

            });

        });

      })(req, res);

    })
    .catch(function (err) {
      req.session.errormsg = '';
      req.session.errormsg = 'Invalid Username and Password';
      return res.redirect("/adminLogin");
    });

}

function logoutAction(req, res) {

  var modulename = 'Admin logout';
  var modulemessage = 'loggedout successfully';
  req.logdata = {
    name: req.user.name,
    email: req.user.email,
    createdAt: moment(req.user.createdAt).format('MM-DD-YYYY'),
    role: req.user.role,
    id: req.user.id
  }

  Logactivity.registerLogActivity(req, modulename, modulemessage)
    .then(function (logdata) {
      req.logout();
      req.flash('error', '');
      req.session.logReferenceID = '';
      req.session.adminroleName = '';

      if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID != '' && req.session.adminpracticeID != null) {
        req.session.adminpracticeID = '';
        req.session.adminpracticeName = '';
      }

      req.session.destroy(function (err) {
        res.redirect('/adminLogin');
      });
      //res.redirect('/adminLogin');
    });
}


function activateAccountAction(req, res) {
  var email = req.param('email'),
    systemUniqueKey = req.param('systemUniqueKey');
  // validate user and activate account
  User
    .activateUserWithKey(email, systemUniqueKey)
    .then(function (user) {
      return res.render('mailActivation/success', {
        user: user
      });
    })
    .catch(function (err) {
      // error
      sails.log.error("UserController#activateUserAccountAction :: cannot activate user ::", err);
      return res.render('mailActivation/failed');
    });

}

function getSettingDetailAction(req, res) {
  var user = req.user;

  User.getUserSettingDetail(user)
    .then(function (userDetail) {
      return res.success(userDetail);
    })
    .catch(function (err) {
      sails.log.error("User#getUserSettingDetail::cannt get user detail::", err);
      return res.handleError(err);
    })

}
//todo: need tp put logic for sms notified
function updateSettingOfUserAction(req, res) {
  var user = req.user;
  var smsNotified = req.param("smsNotified");

  return res.success();
}

function getUserProfileAction(req, res) {
  var userId = req.user.id;
  User.getUserForId(userId)
    .then(function (user) {
      return res.success(user);
    })
    .catch(function (err) {
      sails.log.error('User#getUserProfileAction::', err)
      return res.handleError(err);
    })
}


function verifyEmailAction(req, res) {

  // take the system unique key and email
  var systemUniqueKey = req.param('systemUniqueKey');
  var email = req.param('email');
  User
    .updateVerifyEmailForKey(email, systemUniqueKey)
    .then(function (isSuccess) {
      if (isSuccess) {
        return res.view('mailActivation/success');
      } else {
        return res.view('mailActivation/failed');
      }
    })
    .catch(function (err) {
      sails.log.error("UserController#verifyEmailAction :: ", err);

      return res.handleError(err);
    })
}


function loanConfirmedAction(req, res) {
  var email = req.param('emailId');
  User
    .getLoanConfirmedMessage(email)
    .then(function (isSuccess) {
      if (isSuccess) {
        return res.view('mailActivation/loanConfirmed')
      }
      else {
        return res.view('mailActivation/failed')
      }
    })
    .catch(function (err) {
      sails.log.error("UserController#loanConfirmedAction :: ", err);

      return res.handleError(err);
    })
}


function getUserLoanStatusAction(req, res) {
  var user = req.user;
  User.getLoanStatus(user)
    .then(function (userDetail) {
      return res.success(userDetail)
    })
    .catch(function (err) {
      sails.log.error("UserController#verifyEmailAction :: ", err);

      return res.handleError(err);
    })
}

function removeCompleteUserAction(req, res) {
  var phone = req.param('phone');
  var token = req.param('token');

  if (token !== 'BmQqFmOUyqlPQrY6coDa') {
    return res.handleError({
      code: 400,
      message: 'INVALID_TOKEN'
    });
  }

  // delete user related stuff
  User
    .deleteAllUserRelatedStuff(phone)
    .then(function () {
      return res.success({
        message: 'Successfully Deleted User'
      });
    })
    .catch(function (err) {
      sails.log.error("Error Controller :: ", err);
      return res.handleError(err);
    })
}

//Cron jobs invoke in browsers
function getAllPaymentManagementAction(req, res) {
  console.log("getAllPaymentManagementAction trigerred");
  PaymentManagementService.getAllFeeManagementDetail()
  return res.handleError({
    code: 400,
    message: 'INVALID_TOKEN'
  });
}

function getAllLatePaymentManagementAction(req, res) {
  console.log("getAllLatePaymentManagementAction trigerred");
  PaymentManagementService.getAllLateFeeManagement()
  return res.handleError({
    code: 400,
    message: 'INVALID_TOKEN'
  });
}

//for forgot password  from APP
function forgetApiPasswordAction(req, res) {
  if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }

  User
    .getUserByEmailId(req.form.email)
    .then(function (user) {

      if (!user) {
        throw { code: 400, message: "not found" };
      }

      //console.log("userdata",user);
      return user;

    }).then(function (userDetails) {

      var emailId = userDetails.email;

      if (userDetails.name && userDetails.name !== '') {
        var registername = userDetails.name;
      }
      else {
        var nameDetails = emailId.split("@");
        var registername = nameDetails[0];
      }

      var randompwdstring = Math.random().toString(36).slice(-12);
      userDetails.password = randompwdstring;

      //console.log("userDetails",userDetails);

      salt = User.generateSalt();

      return User.generateEncryptedPassword(userDetails, salt)
        .then(function (encryptedPassword) {


          userDetails.password = encryptedPassword;
          userDetails.salt = salt;

          userDetails.save(function (err) {
            if (err) {
              return reject({
                code: 500,
                message: 'INTERNAL_SERVER_ERROR'
              });
            }

            var userObjectData = {
              email: emailId,
              name: registername,
              newtemppassword: randompwdstring
            };

            //send forget password mail
            EmailService.sendForgetPasswordEmail(userObjectData);

            var successdata = {
              "code": 200,
              "message": "Forget password mail sent",
              "userdata": userObjectData
            };
            var responsedata = {
              "status": "success",
              "data": successdata
            };
            console.log("Forget password success : ", responsedata);
            return res.send(responsedata);
          });
        })
        .catch(function (err) {
          var errordata = {
            "code": 403,
            "message": "Please try again later"
          };
          var responsedata = {
            "status": "error",
            "data": errordata
          };
          console.log("Forget password error : ", responsedata);
          return res.send(responsedata);
        });
    })
    .catch(function (err) {

      var errordata = {
        "code": 404,
        "message": "Invalid Email"
      };
      var responsedata = {
        "status": "error",
        "data": errordata
      };
      console.log("Forget password error : ", responsedata);
      return res.send(responsedata);
    });
}

//for change password  from APP
function changeApiPasswordAction(req, res) {

  if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }

  console.log("email: ", req.form.email);
  console.log("old password: ", req.form.oldpassword);
  console.log("new password: ", req.form.newpassword);
  console.log("confirm password: ", req.form.confirmpassword);

  User
    .getUserByEmailId(req.form.email)
    .then(function (user) {

      if (!user) {
        throw { code: 400, message: "User not found" };
      }

      return new Promise(function (res, rej) {
        bcrypt.compare(req.form.oldpassword, user.password, function (err, result) {
          if (err) {
            return rej(err);
          }
          if (!result) {
            return rej({ code: 403, message: "Invalid pass" });
          }
          res();
        });
      }).then(function () {
        console.log("userdata", user);
        return user;
      });
    }).then(function (updatedUser) {

      updatedUser.password = req.form.newpassword;
      salt = User.generateSalt();

      return User.generateEncryptedPassword(updatedUser, salt)
        .then(function (encryptedPassword) {

          updatedUser.password = encryptedPassword;
          updatedUser.salt = salt;


          updatedUser.save(function (err) {
            if (err) {
              return reject({
                code: 500,
                message: 'INTERNAL_SERVER_ERROR'
              });
            }

            var successdata = {
              "code": 200,
              "message": "Password changed successfully",
              "userdata": updatedUser
            };
            var responsedata = {
              "status": "success",
              "data": successdata
            };
            console.log("Change password success : ", responsedata);
            return res.send(responsedata);
          });
        })
        .catch(function (err) {
          var errordata = {
            "code": 403,
            "message": "Please try again later"
          };
          var responsedata = {
            "status": "error",
            "data": errordata
          };
          console.log("Change password error : ", responsedata);
          return res.send(responsedata);
        });
    })
    .catch(function (err) {

      var errordata = {
        "code": 404,
        "message": "Invalid Email or Current password"
      };
      var responsedata = {
        "status": "error",
        "data": errordata
      };
      console.log("Change password error : ", responsedata);
      return res.send(responsedata);
    });

}


//for forgot passcode  from APP
function forgetPasscodeAction(req, res) {
	/*if (!req.form.isValid) {
		var validationErrors = ValidationService
		  .getValidationErrors(req.form.getErrors());
		return res.failed(validationErrors);
	}*/

  var email = req.param("email");

  console.log("email value: ", email);
  console.log("req value: ", req);
  User
    .getUserByEmailId(email)
    .then(function (user) {
      if (!user) {
        throw { code: 400, message: "not found" };
      }
      return user;
    }).then(function (userDetails) {

      var newPasscode = Math.floor(100000 + Math.random() * 900000);
      newPasscode = String(newPasscode);
      newPasscode = newPasscode.substring(0, 4);

      var emailId = userDetails.email;

      if (userDetails.name && userDetails.name !== '') {
        var registername = userDetails.name;
      }
      else {
        var nameDetails = emailId.split("@");
        var registername = nameDetails[0];
      }

      var userObjectData = {
        email: emailId,
        name: registername,
        newtemppasscode: newPasscode
      };

      //send forget passcode mail
      EmailService.sendForgetPasscode(userObjectData);

      var successdata = {
        "code": 200,
        "message": "Forget passcode mail sent",
        "userdata": userObjectData
      };
      var responsedata = {
        "status": "success",
        "data": successdata
      };
      console.log("Forget passcode success : ", responsedata);
      return res.send(responsedata);

    })
    .catch(function (err) {

      var errordata = {
        "code": 404,
        "message": "Invalid request"
      };
      var responsedata = {
        "status": "error",
        "data": errordata
      };
      console.log("Forget passcode error : ", responsedata);
      return res.send(responsedata);
    });

}

function getallUserDetailsAction(req, res) {

  var errorval = '';
  var successmsg = '';
  if (req.session.errormsg != '') {
    errorval = req.session.errormsg;
    req.session.errormsg = '';
  }
  if (req.session.successmsg != '') {
    successmsg = req.session.successmsg;
    req.session.successmsg = '';
  }
  res.view("admin/user/manageUserList", { errorval: errorval, successmsg: successmsg });
}

function ajaxManageUserlist(req, res) {
  let totalrecords = 0;
  let skiprecord = 0;
  let checklimitrecords = 0;
  let iDisplayLengthvalue = 0;
  let sorttypevalue;
  let criteria = {};
  let sorttype = 1;
  if (req.query.sSortDir_0 == 'desc') {
    sorttype = -1;
  }
  switch( req.query.iSortCol_0 ) {
    case '1': sorttypevalue = { 'userReference': sorttype }; break;
    case '2': sorttypevalue = { 'firstname': sorttype }; break;
    case '3': sorttypevalue = { 'email': sorttype }; break;
    case '4': sorttypevalue = { 'phoneNumber': sorttype }; break;
    case '5': sorttypevalue = { 'allowsocialnetwork': sorttype }; break;
    case '7': sorttypevalue = { 'createdAt': sorttype }; break;
    default: break;
  }
  if( req.query.sSearch ) {
    let hasFullName = req.query.sSearch.indexOf(" ") > -1;
    let splittedName = "";
    if( "undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID != '' && req.session.adminpracticeID != null ) {
      criteria = {
        or: [{ firstname: { 'contains': req.query.sSearch } }, { email: { 'contains': req.query.sSearch } }, { phoneNumber: { 'contains': req.query.sSearch } }, { addresses: { 'contains': req.query.sSearch } }, { createdAt: { 'contains': req.query.sSearch } }, { userReference: { 'contains': req.query.sSearch } }, { lastname: { 'contains': req.query.sSearch } }, { underwriter: { 'contains': req.query.sSearch } }],
        practicemanagement: req.session.adminpracticeID
      };

      if (hasFullName) {
        splittedName = req.query.sSearch.split(" ");
        criteria.or.push({ firstname: {'contains': splittedName[0] }, lastname: { 'contains': splittedName[1] } } );
      }
    } else {
      criteria = { or: [{ firstname: { 'contains': req.query.sSearch } }, { email: { 'contains': req.query.sSearch } }, { phoneNumber: { 'contains': req.query.sSearch } }, { addresses: { 'contains': req.query.sSearch } }, { createdAt: { 'contains': req.query.sSearch } }, { userReference: { 'contains': req.query.sSearch } }, { lastname: { 'contains': req.query.sSearch } }, { underwriter: { 'contains': req.query.sSearch } }] };
      if (hasFullName) {
        splittedName = req.query.sSearch.split(" ");
        criteria.or.push({ firstname: {'contains': splittedName[0] }, lastname: { 'contains': splittedName[1] } } );
      }
    }
  } else {
    if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID != '' && req.session.adminpracticeID != null) {
      criteria = { practicemanagement: req.session.adminpracticeID };
    }
  }
  const page = parseInt(req.query.currentPage) || 1;
  const skipQty = req.query.sSearch ? 0 : 50;
  const limitQty = req.query.sSearch ? 0 : 50;
  sails.log.warn(req.query.sSearch);
  const userPromise = req.query.sSearch ? User.find(criteria).populate( 'practicemanagement' ).sort( sorttypevalue ) : User.find(criteria).populate( 'practicemanagement' ).sort( sorttypevalue ).skip(skipQty * (page - 1)).limit(limitQty);
  userPromise
  .then( function( userDetails ) {
    sails.log.warn(userDetails.length)
    userDetails = _.filter( userDetails, function( item ) {
      if( item.email != '' && item.email != null ) {
        return true;
      }
    } );
    if( req.query.iSortCol_0 == "6" && req.query.sSortDir_0 == 'desc' ) {
      userDetails = _.sortBy( userDetails, 'practicemanagement.PracticeName' );
    } else if( req.query.iSortCol_0 == "6" && req.query.sSortDir_0 == 'asc') {
      userDetails = _.sortBy( userDetails, 'practicemanagement.PracticeName' ).reverse();
    }

    totalrecords = userDetails.length;
    // Filter by limit records
    skiprecord = parseInt( req.query.iDisplayStart );
    checklimitrecords = skiprecord + parseInt( req.query.iDisplayLength );
    if (checklimitrecords > totalrecords) {
      iDisplayLengthvalue = parseInt( totalrecords );
    } else {
      iDisplayLengthvalue = parseInt( req.query.iDisplayLength ) + parseInt( skiprecord );
    }
    // userDetails = userDetails.slice(skiprecord, iDisplayLengthvalue);
    const userData = [];

    userDetails.forEach( function ( userinfo, loopvalue ) {
      let userReference = "--";
      let userfullname = "--";
      let userEmail = "--";
      let userphoneNumber = "--";
      let registeredstatus = "--";
      let practicename = '--';
      const loopid = loopvalue + skiprecord + 1;
      if( "undefined" !== typeof userinfo.userReference && userinfo.userReference != '' && userinfo.userReference != null ) {
        userReference = userinfo.userReference;
        userReference = '<a href=\'' + '/admin/viewUserDetails/' + userinfo.id + '\'>' + userReference + '</a>';
      }
      if( "undefined" !== typeof userinfo.firstname && userinfo.firstname != '' && userinfo.firstname != null ) {
        userfullname = userinfo.firstname + ' ' + userinfo.lastname;
      }
      if( "undefined" !== typeof userinfo.email && userinfo.email != '' && userinfo.email != null ) {
        userEmail = userinfo.email;
      }
      if( "undefined" !== typeof userinfo.phoneNumber && userinfo.phoneNumber != '' && userinfo.phoneNumber != null ) {
        userphoneNumber = userinfo.phoneNumber.replace(/[^\d]/g, "");
				userphoneNumber = userphoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
      }
      if( userinfo.registeredtype == "social" ) {
        if( userinfo.allowsocialnetwork == 1 ) {
          registeredstatus = 'Completed';
        } else {
          registeredstatus = 'Incomplete';
        }
      } else {
        registeredstatus = 'Completed';
      }
      if( userinfo.practicemanagement ) {
        if( "undefined" !== typeof userinfo.practicemanagement.PracticeName && userinfo.practicemanagement.PracticeName != '' && userinfo.practicemanagement.PracticeName != null ) {
          practicename = userinfo.practicemanagement.PracticeName;
        }
      }
      userinfo.createdAt = moment(userinfo.createdAt).format('MM-DD-YYYY');

      userData.push({
        loopid: loopid,
        userReference: userReference,
        name: userfullname,
        email: userEmail,
        phoneNumber: userphoneNumber,
        allowsocialnetwork: registeredstatus,
        practicename: practicename,
        createdAt: userinfo.createdAt
      });
    });
    sails.log.warn(userData.length);
    var json = {
      sEcho: req.query.sEcho,
      iTotalRecords: totalrecords,
      iTotalDisplayRecords: totalrecords,
      aaData: userData
    };
    res.contentType('application/json');
    res.json(json);
  } );
}

function updateUserStatusAction(req, res) {

  var userid = req.param('userid');
  var status = req.param('status');

  if (userid) {
    var userCriteria = {
      id: userid
    };

    User.findOne(userCriteria)
      .then(function (userdata) {
        if (status == 'inactive') {
          userdata.isDeleted = false;
        } else {
          userdata.isDeleted = true;
        }

        userdata.save(function (err) {
          if (err) {

            var json = {
              status: 400,
              message: "Unable to update user status!"
            };
            sails.log.info("json data", json);
            res.contentType('application/json');
            res.json(json);
          }
          else {

            var useralldetails = userdata;
            useralldetails.status = status
            var modulename = 'Update APP user status';
            var modulemessage = 'APP User status updated successfully';
            req.logdata = useralldetails;
            Logactivity.registerLogActivity(req, modulename, modulemessage);

            var json = {
              status: 200,
              message: "User status updated successfully"
            };
            sails.log.info("json data", json);
            res.contentType('application/json');
            res.json(json);
          }
        });
      })
      .catch(function (err) {
        var json = {
          status: 400,
          message: err.message
        };
        sails.log.error("json data", json);
        res.contentType('application/json');
        res.json(json);
      });
  }
  else {
    var json = {
      status: 400
    };
    sails.log.error("json data", json);
    res.contentType('application/json');
    res.json(json);
  }
}


function viewUserDetailsAction(req, res) {
  var errorval = ''
  var successmsg = ''
  if (req.session.errormsg != '') {
    errorval = req.session.errormsg
    req.session.errormsg = ''
  }
  if (req.session.successmsg != '') {
    successmsg = req.session.successmsg
    req.session.successmsg = ''
  }
  var userId = req.param('id')
  var criteria = {id: userId}

  User
    .findOne(criteria)
    .then(function (userdata) {

      var screen_id
      var screentrackingdata = ''
      Screentracking
        .findOne({user: userId, iscompleted: [0, 2]})
        .then(function (screentrackingdata) {
          if (screentrackingdata) {
            var screentrackingdata = screentrackingdata
            var screen_id = screentrackingdata.id
          } else {
            var screen_id = ''
          }

          Screentracking
            .find({user: userId})
            .populate('practicemanagement')
            .then(function (screentrackingInfo) {
              sails.log.warn("SCREENTRACKING INGO", screentrackingInfo)
              PaymentManagement.find({user: userId})
                .then(function (paymentmanagementdata) {

                  var paymentmanagement = paymentmanagementdata[0]
                  var loandata = []
                  var incompleteLoandata = []

                  if (paymentmanagement != '' && paymentmanagement != null && 'undefined' !== typeof paymentmanagement) {
                    var payment_id = paymentmanagementdata[0].id
                    var doccriteria = {
                      paymentManagement: payment_id
                    }
                  } else {
                    var payment_id = 'Empty'
                    var doccriteria = {
                      paymentManagement: screen_id
                    }
                  }

                  if (paymentmanagementdata != '' && paymentmanagementdata != null && 'undefined' !== typeof paymentmanagementdata) {

                    _.forEach(paymentmanagementdata, function (data) {
                      if (data.achstatus != 4) {
                        var obj = {}
                        obj.id = data.id
                        obj.loanReference = data.loanReference
                        obj.payOffAmount = data.payOffAmount
                        obj.maturityDate = moment(data.maturityDate).format('LL')
                        obj.createdAt = moment(data.createdAt).tz('America/los_angeles').format('MM-DD-YYYY hh:mm:ss')
                        obj.achstatus = data.achstatus
                        loandata.push(obj)
                      }
                    })
                    if (paymentmanagementdata[paymentmanagementdata.length - 1].achstatus === 2 || paymentmanagementdata[paymentmanagementdata.length - 1].achstatus === 4) {

                      if (screentrackingdata != '' && screentrackingdata != null && 'undefined' !== typeof screentrackingdata) {
                        //screentrackingdata.createdAt = moment(screentrackingdata.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');
                        //incompleteLoandata.push(screentrackingdata);
                      }
                    }

                  } else {

                    if (screentrackingdata != '' && screentrackingdata != null && 'undefined' !== typeof screentrackingdata) {
                      //screentrackingdata.createdAt = moment(screentrackingdata.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');
                      //incompleteLoandata.push(screentrackingdata);
                    }
                  }

                  loanExist = 0
                  _.forEach(paymentmanagementdata, function (payDetails) {
                    if (payDetails.status != 'PAID OFF' && payDetails.achstatus != 2) {
                      loanExist = 1
                    }
                    payDetails.maturityDate = moment(payDetails.maturityDate).format('LL')
                    payDetails.nextPaymentSchedule = moment(payDetails.nextPaymentSchedule).format('LL')
                    payDetails.createdAt = moment(payDetails.createdAt).format('LL')

                    /*if (screentrackingdata) {
                      screentrackingdata.maturityDate = payDetails.maturityDate;
                      screentrackingdata.financedAmount = payDetails.payOffAmount;
                    }*/

                  })

                  if (screentrackingInfo.length > 0) {
                    _.forEach(screentrackingInfo, function (screenInfo) {
                      screenInfo.createdAt = moment(screenInfo.createdAt).tz('America/los_angeles').format('MM-DD-YYYY hh:mm:ss')
                      incompleteLoandata.push(screenInfo)
                    })
                  }

                  var doccriteria = {
                    user: userId
                  }
                  Achdocuments
                    .find(doccriteria)
                    .populate('proofdocument')
                    .then(function (documentdata) {
                      _.forEach(documentdata, function (documentvalue) {
                        if (documentvalue.proofdocument.isImageProcessed) {
                          if (documentvalue.proofdocument.standardResolution) {
                            documentvalue.proofdocument.standardResolution = Utils.getS3Url(documentvalue.proofdocument.standardResolution)
                          }
                        }
                      })

                      Account
                        .find({user: userId})
                        .populate('userBankAccount')
                        .then(function (accountDetail) {

                          userdata.createdAt = moment(userdata.createdAt).format('LL')
                          userdata.updatedAt = moment(userdata.updatedAt).format('LL')
                          var usercriteria = {user_id: userId}

                          Useractivity
                            .find(usercriteria)
                            .then(function (activitydata) {

                              if (userdata.dateOfBirth) {
                                userdata.dateOfBirth = moment(userdata.dateOfBirth).format('MM/DD/YYYY')
                              }

                              var user_firstname = ''
                              var user_lastname = ''
                              if (userdata.name) {
                                var user_fullname = userdata.name
                                if ('undefined' !== typeof user_fullname && user_fullname != '' && user_fullname != null) {
                                  var nameDetails = user_fullname.split(' ')
                                  var user_lastname = nameDetails[nameDetails.length - 1]

                                  if (nameDetails.length > 2) {
                                    var user_firstname = nameDetails[0]
                                  } else {
                                    var user_firstname = nameDetails[0]
                                  }
                                }
                              }

                              if (userdata.zipCode) {
                                userdata.zipCode = userdata.zipCode.slice(0, 5)
                              }

                              var transcriteria = {user: userId}
                              Transunions
                                .findOne(transcriteria)
                                .sort('createdAt DESC')
                                .then(function (transData) {

                                  if ('undefined' === typeof transData || transData == '' || transData == null) {
                                    var showtransData = 0
                                  } else {
                                    var showtransData = 1

                                    if (transData.credit_collection.subscriber) {
                                      var transcreditArray = transData.credit_collection
                                      transData.credit_collection = []
                                      transData.credit_collection.push(transcreditArray)
                                    }

                                    if (transData.inquiry.subscriber) {
                                      var transinquiryArray = transData.inquiry
                                      transData.inquiry = []
                                      transData.inquiry.push(transinquiryArray)
                                    }

                                    if (transData.addOnProduct.status) {
                                      var transproductArray = transData.addOnProduct
                                      transData.addOnProduct = []
                                      transData.addOnProduct.push(transproductArray)
                                    }

                                    if (transData.house_number.status) {
                                      var transhouseArray = transData.house_number
                                      transData.house_number = []
                                      transData.house_number.push(transhouseArray)
                                    }

                                    if (transData.trade.subscriber) {
                                      var transtradeArray = transData.trade
                                      transData.trade = []
                                      transData.trade.push(transtradeArray)
                                    }

                                    if (transData.response.product.subject.subjectRecord && transData.response.product.subject.subjectRecord.custom && transData.response.product.subject.subjectRecord.custom.credit) {
                                      if (!Array.isArray(transData.response.product.subject.subjectRecord.custom.credit.publicRecord)) {
                                        var transpublicrecordArray = transData.response.product.subject.subjectRecord.custom.credit.publicRecord
                                        transData.publicrecord = []
                                        transData.publicrecord.push(transpublicrecordArray)
                                      } else {
                                        transData.publicrecord = transData.response.product.subject.subjectRecord.custom.credit.publicRecord
                                      }
                                    }

                                    var tradearr = []

                                  }
                                  State.getExistingState()
                                    .then(function (stateData) {

                                      Tradeclassifications
                                        .find()
                                        .then(function (tradeclasicDetail) {

                                          var IPFromRequest = req.headers['x-forwarded-for'] || req.connection.remoteAddress //::ffff:192.168.1.107
                                          var indexOfColon = IPFromRequest.lastIndexOf(':')
                                          var ip = IPFromRequest.substring(indexOfColon + 1, IPFromRequest.length)
                                          var documenttype1 = sails.config.loanDetails.doctype1
                                          var documenttype2 = sails.config.loanDetails.doctype2
                                          var documenttype3 = sails.config.loanDetails.doctype3

                                          var documenttype = {
                                            documenttype1: documenttype1,
                                            documenttype2: documenttype2,
                                            documenttype3: documenttype3,
                                          }

                                          incompleteLoandata = _.orderBy(incompleteLoandata, ['applicationReference'], ['asc'])
                                          loandata = _.orderBy(loandata, ['loanReference'], ['asc'])
                                          // Try to fetch json object
                                          Transunions.findOne({user: userdata.id})
                                            .then(function (tudata) {

                                              var tustring
                                              if (tudata) {
                                                // tudata = tudata[]
                                                tustring = JSON.stringify(tudata['response'], null, '\t')
                                              } else {
                                                tustring = 'JSON not available'
                                              }

                                              var rs = {
                                                user: userdata,
                                                transunionjson: tustring,
                                                errorval: errorval,
                                                successmsg: successmsg,
                                                achdocumentDetails: documentdata,
                                                ip: ip,
                                                userloandata: loandata,
                                                incompleteLoandata: incompleteLoandata,
                                                loancount: loandata.length,
                                                accountDetail: accountDetail,
                                                loanExist: loanExist,
                                                useractivitydata: activitydata,
                                                stateData: stateData,
                                                user_firstname: user_firstname,
                                                user_lastname: user_lastname,
                                                transData: transData,
                                                shwotransData: showtransData,
                                                tradearr: tradearr,
                                                documenttype: documenttype,
                                                screentrackingdata: screentrackingdata,
                                                screentrackinginfo: screentrackingInfo[0],
                                                payment_id: payment_id,
                                                isTwilioEnabled: sails.config.twilioConfig.getTwilioConfig().isEnabled || false
                                              }
                                              res.view('admin/user/viewuserinfo', rs)
                                            })
                                        })

                                    })

                                })

                            })

                        })
                    })
                })
            })
        })
    })
    .catch(function (err) {
      sails.log.error('UserController#viewUserinfoDetails :: err :', err)
      return res.handleError(err)
    })

}

function deleteUserDetailsAction(req, res) {

  var userid = req.param('id');

  // delete user related stuff
  User
    .deleteAllUserRelatedDetails(userid)
    .then(function () {
      var json = {
        status: 200,
        message: "Successfully Deleted User"
      };
      sails.log.info("json data", json);
      var redirectpath = "/admin/manageusers";
      return res.status(200).redirect(redirectpath);
    })
    .catch(function (err) {
      sails.log.error("Error Controller :: ", err);
      return res.handleError(err);
    })

}

//for Resend Verficationlink  from APP
function resendVerficationlinkAction(req, res) {
  var emailId = req.param("email");
  console.log("email value: ", emailId);

  User
    .getUserByEmailId(emailId)
    .then(function (user) {
      if (!user) {
        throw { code: 400, message: "not found" };
      }
      return user;
    }).then(function (userDetails) {

      if (userDetails.name && userDetails.name !== '') {
        var registername = userDetails.name;
      }
      else {
        var nameDetails = emailId.split("@");
        var registername = nameDetails[0];
      }

      var userObjectData = {
        email: emailId,
        name: registername,
        systemUniqueKey: Utils.generateReferenceId()
      };

      //userDetails.email = userObject.email;
      userDetails.systemUniqueKey = userObjectData.systemUniqueKey;
      userDetails.save(function (err) {
        if (err) {
          return reject({
            code: 500,
            message: 'INTERNAL_SERVER_ERROR'
          });
        }

        //send verification mail
        EmailService.sendVerificationEmail(userObjectData);

        var successdata = {
          "code": 200,
          "message": "Resend verification mail sent",
          "userdata": userObjectData
        };
        var responsedata = {
          "status": "success",
          "data": successdata
        };
        console.log("Resend verificationlink success : ", responsedata);
        return res.send(responsedata);
      });
    })
    .catch(function (err) {

      sails.log.error("Error Controller :: ", err);
      var errordata = {
        "code": 404,
        "message": "Invalid request"
      };
      var responsedata = {
        "status": "error",
        "data": errordata
      };
      console.log("Resend verificationlink error : ", responsedata);
      return res.send(responsedata);
    });

}

//for Resend Verficationlink  from Admin
function sendverficationlinkAction(req, res) {

  var emailId = req.param("email");
  var userid = req.param("userid");
  console.log("emailId : ", emailId);

  User
    .getUserByEmailId(emailId)
    .then(function (user) {
      if (!user) {
        throw { code: 400, message: "not found" };
      }
      return user;
    }).then(function (userDetails) {

      if (userDetails.name && userDetails.name !== '') {
        var registername = userDetails.name;
      }
      else {
        var nameDetails = emailId.split("@");
        var registername = nameDetails[0];
      }

      var verificationCode = Math.floor(1000 + Math.random() * 9000);
      var userObjectData = {
        email: emailId,
        name: registername,
        systemUniqueKey: Utils.generateReferenceId(),
        verificationcode: verificationCode
      };

      userDetails.emailverificationcode = verificationCode;
      userDetails.systemUniqueKey = userObjectData.systemUniqueKey;
      userDetails.save(function (err) {
        if (err) {
          req.session.errormsg = '';
          req.session.errormsg = 'INTERNAL_SERVER_ERROR';
          return res.redirect("/admin/viewUserDetails/" + userid);
        }
        //send verification mail
        EmailService.userAdminVerification(userObjectData);

        var modulename = 'User verification code by email';
        var modulemessage = 'User verification code send through email';
        req.logdata = userDetails;
        Logactivity.registerLogActivity(req, modulename, modulemessage);

        var userreq = {};
        var usersubject = 'Verification code';
        var userdescription = 'User verification code by email';
        userreq.userid = userid;
        userreq.logdata = 'User verification code send through ' + emailId;
        Useractivity.createUserActivity(userreq, usersubject, userdescription);

        req.session.successmsg = '';
        req.session.successmsg = 'Verification code sent successfully';
        return res.redirect("/admin/viewUserDetails/" + userid);
        console.log("Verification code sent successfully : ", responsedata);
      });
    })
    .catch(function (err) {
      req.session.errormsg = '';
      req.session.errormsg = 'Invalid request';
      return res.redirect("/admin/viewUserDetails/" + userid);
    });


}

function sendverficationcodeAction(req, res) {

  var userid = req.param("userid");
  sails.log.info("userid : ", userid);

  if (userid) {
    var criteria = {
      id: userid
    };

    sails.log.info("criteria : ", criteria);

    User
      .findOne(criteria)
      .then(function (user) {
        if (!user) {
          throw { code: 400, message: "not found" };
        }
        return user;
      }).then(function (userDetails) {

        sails.log.info("userDetails : ", userDetails);

        var smsdata = { phoneNumber: userDetails.phoneNumber }

        UserRegistrationService
          .initTwoFactorAuth(userDetails, smsdata)
          .then(function () {

            userDetails.phoneverificationcode = 1;
            userDetails.save(function (err) {
              if (err) {
                req.session.errormsg = '';
                req.session.errormsg = 'INTERNAL_SERVER_ERROR';
                return res.redirect("/admin/viewUserDetails/" + userid);
              }

              var modulename = 'User verification code by phone';
              var modulemessage = 'User verification code send through phone';
              req.logdata = userDetails;
              Logactivity.registerLogActivity(req, modulename, modulemessage);


              var userreq = {};
              var usersubject = 'Verification code';
              var userdescription = 'User verification code by phone';
              userreq.userid = userid;
              userreq.logdata = 'User verification code send through ' + userDetails.phoneNumber;
              Useractivity.createUserActivity(userreq, usersubject, userdescription);


              req.session.successmsg = '';
              req.session.successmsg = 'Verification code sent successfully';
              return res.redirect("/admin/viewUserDetails/" + userid);

            });

          })
          .catch(function (err) {
            req.session.errormsg = '';
            req.session.errormsg = 'Unable to send verification code';
            return res.redirect("/admin/viewUserDetails/" + userid);
          });
      })
      .catch(function (err) {
        req.session.errormsg = '';
        req.session.errormsg = 'Invalid user';
        return res.redirect("/admin/viewUserDetails/" + userid);
      });
  }
  else {
    req.session.errormsg = '';
    req.session.errormsg = 'Invalid data';
    return res.redirect("/admin/viewUserDetails/" + userid);
  }
}

function changeverifystatusAction(req, res) {
  var userid = req.param("id");

  if (userid) {
    var userCriteria = {
      id: userid
    };

    User.findOne(userCriteria)
      .then(function (userdata) {

        userdata.emailverificationcode = '';
        userdata.isEmailVerified = true;
        userdata.save(function (err) {
          if (err) {

            req.session.errormsg = '';
            req.session.errormsg = 'Unable to update email verified status!';
            return res.redirect("/admin/viewUserDetails/" + userid);
          }
          else {

            var useralldetails = userdata;
            var modulename = 'User verified by email';
            var modulemessage = 'User verified through email';
            req.logdata = useralldetails;
            Logactivity.registerLogActivity(req, modulename, modulemessage);


            var userreq = {};
            var usersubject = 'Verification by email';
            var userdescription = 'User verified by email';
            userreq.userid = userid;
            userreq.logdata = 'User email verified status updated successfully';
            Useractivity.createUserActivity(userreq, usersubject, userdescription);

            Screentracking
              .checktodolistcount(userid)
              .then(function (achstatus) {
                req.session.successmsg = '';
                req.session.successmsg = 'User email verified status updated successfully';
                return res.redirect("/admin/viewUserDetails/" + userid);
              })
              .catch(function (err) {
                req.session.errormsg = '';
                req.session.errormsg = 'Unable to update email verified status!';
                return res.redirect("/admin/viewUserDetails/" + userid);
              });

          }
        });
      })
      .catch(function (err) {
        req.session.errormsg = '';
        req.session.errormsg = 'Unable to update email verified status!';
        return res.redirect("/admin/viewUserDetails/" + userid);
      });
  }
  else {
    req.session.errormsg = '';
    req.session.errormsg = 'Unable to update email verified status!';
    return res.redirect("/admin/viewUserDetails/" + userid);
  }

}

function changephoneverifystatusAction(req, res) {

  var verificationCode = req.param("verificationCode");
  var phoneNumber = req.param("phoneNumber");
  var userid = req.param("userid");

  var checkData = {
    "phoneNumber": phoneNumber,
    "verificationCode": verificationCode
  }

  sails.log.info("checkData : ", checkData);

  UserRegistrationService
    .verificationUser(userid, checkData)
    .then(function () {

      if (userid) {
        var userCriteria = {
          id: userid
        };
        User.findOne(userCriteria)
          .then(function (userdata) {

            userdata.phoneverificationcode = '';
            userdata.isPhoneVerified = true;
            userdata.save(function (err) {
              if (err) {

                req.session.errormsg = '';
                req.session.errormsg = 'Unable to update phone verified status!';
                return res.redirect("/admin/viewUserDetails/" + userid);
              }
              else {

                var useralldetails = userdata;
                var modulename = 'User verified by phone';
                var modulemessage = 'User verified through phone';
                req.logdata = useralldetails;
                Logactivity.registerLogActivity(req, modulename, modulemessage);

                var userreq = {};
                var usersubject = 'Verification by phone';
                var userdescription = 'User verified through phone';
                userreq.userid = userid;
                userreq.logdata = 'User phone verified status updated successfully';
                Useractivity.createUserActivity(userreq, usersubject, userdescription);

                req.session.successmsg = '';
                req.session.successmsg = 'User phone verified status updated successfully';
                return res.redirect("/admin/viewUserDetails/" + userid);

              }
            });
          })
          .catch(function (err) {
            req.session.errormsg = '';
            req.session.errormsg = 'Unable to update phone verified status!';
            return res.redirect("/admin/viewUserDetails/" + userid);
          });
      }
      else {
        req.session.errormsg = '';
        req.session.errormsg = 'Unable to update phone verified status!';
        return res.redirect("/admin/viewUserDetails/" + userid);
      }


    })
    .catch(function (err) {
      req.session.errormsg = '';
      req.session.errormsg = 'Unable to update phone verified status!';
      return res.redirect("/admin/viewUserDetails/" + userid);
    });

}


function updatepushnotificationAction(req, res) {

  var user = req.user;
  var status = req.param("notify");
  var userId = req.user.id;

  User
    .updatepushNotificationStatus(userId, status)
    .then(function (pushNotificationStatus) {
      return res.success(pushNotificationStatus);
    })
    .catch(function (err) {
      sails.log.error('UserController#updatepushnotificationAction#catch :: err :', err);
      return res.handleError(err);
    });
}

function removephoneAction(req, res) {
  var userID = req.param('userID');
  User
    .checkPaymentmanagementStatus(userID, req)
    .then(function (phoneresponse) {
      if (phoneresponse) {
        req.session.successmsg = '';
        req.session.successmsg = 'Phone number deleted successfully!';
        return res.redirect("/admin/viewUserDetails/" + userID);
      } else {
        req.session.errormsg = '';
        req.session.errormsg = 'Unable to delete phone number!';
        return res.redirect("/admin/viewUserDetails/" + userID);
      }
    })
    .catch(function (err) {
      req.session.errormsg = '';
      req.session.errormsg = 'Unable to delete phone number!';
      return res.redirect("/admin/viewUserDetails/" + userID);
    });
}

function newresentinviteemailAction(req, res) {
  var userId = req.param("userid");
  User.findOne({ id: userId })
    .then(function (userDetails) {

      var usertype = userDetails.registeredtype;

      if (usertype == 'signup') {
        var userObjectData = {
          id: userId,
          email: userDetails.email,
          name: userDetails.firstname + " " + userDetails.lastname,
          newtemppassword: '',
          rolename: '',
        };
        EmailService.profileEmailSend(userDetails);
        var userreq = {};
        var usersubject = 'Resent Invite';
        var userdescription = 'Resent Invite email';
        userreq.userid = userId;
        userreq.logdata = 'Resent Invite to' + userDetails.email;
        Useractivity.createUserActivity(userreq, usersubject, userdescription);
      }
      else {
        var userObjectData = {
          user_id: userId,
          email: userDetails.email,
          name: userDetails.firstname + " " + userDetails.lastname,
          newtemppassword: '',
          rolename: '',
        };
        EmailService.sendUserResentInviteEmail(userObjectData);
        var userreq = {};
        var usersubject = 'Resent Invite';
        var userdescription = 'Resent Invite email';
        userreq.userid = userId;
        userreq.logdata = 'Resent Invite' + userDetails.email;
        Useractivity.createUserActivity(userreq, usersubject, userdescription);
      }
      req.session.successmsg = '';
      req.session.successmsg = 'Reinvite email sent successfully!';
      var redirectpath = "/admin/viewUserDetails/" + userId;
      return res.status(200).redirect(redirectpath);

    })
    .catch(function (err) {
      sails.log.error("User#updateProfileAction:: err : ", err);
      return res.handleError(err);
    });
}

function resentinviteemailAction(req, res) {
  var userId = req.param("id");
  User.findOne({ id: userId })
    .then(function (userDetails) {

      var userObjectData = {
        user_id: userId,
        email: userDetails.email,
        name: userDetails.firstname + " " + userDetails.lastname,
        newtemppassword: '',
        rolename: '',
      };

      EmailService.sendUserResentInviteEmail(userObjectData);
      req.session.successmsg = '';
      req.session.successmsg = 'Reinvite email sent successfully!';
      var redirectpath = "/admin/viewUserDetails/" + userId;
      return res.status(200).redirect(redirectpath);

    })
    .catch(function (err) {
      sails.log.error("User#updateProfileAction:: err : ", err);
      return res.handleError(err);
    });

  console.log("userId value: ", userId);

}


function changeemailAction(req, res) {


  var userid = req.param("userid");
  var emailID = req.param("emailaddress");
  var changeemailoption = req.param("changeemailoption");

  if (userid) {

    User
      .changeemailAddress(userid, req, emailID, 'backend', changeemailoption)
      .then(function (userdata) {
        sails.log.info("userdata : ", userdata);
        if (userdata) {
          req.session.successmsg = '';
          if (changeemailoption == 'resentinvite') {
            req.session.successmsg = 'Email address updated successfully and Reinvite email sent successfully!';
          } else {
            req.session.successmsg = 'Email address updated successfully!';
          }
          return res.redirect("/admin/viewUserDetails/" + userid);
        }
        else {
          req.session.errormsg = '';
          req.session.errormsg = 'Unable to update user email address!';
          return res.redirect("/admin/viewUserDetails/" + userid);
        }
      })
      .catch(function (err) {
        sails.log.error("UserController #changeemailAction::Error", err);

        if (err.code == 400) {
          req.session.errormsg = '';
          req.session.errormsg = err.message;
          return res.redirect("/admin/viewUserDetails/" + userid);

        }
        else {
          req.session.errormsg = '';
          req.session.errormsg = 'Unable to update user email address';
          return res.redirect("/admin/viewUserDetails/" + userid);
        }
      });
  }
  else {
    req.session.errormsg = '';
    req.session.errormsg = 'Unable to update user email address';
    return res.redirect("/admin/viewUserDetails/" + userid);
  }
}


function changeAPIEmailaddressAction(req, res) {

  var userid = req.user.id;
  var emailID = req.param("emailaddress");

  sails.log.info("userid : ", userid);
  sails.log.info("req.param : ", req.param);
  sails.log.info("req.user : ", req.user);


  if (userid) {
    User
      .changeemailAddress(userid, req, emailID, 'api')
      .then(function (userdata) {
        sails.log.info("userdata : ", userdata);
        if (userdata) {

          var successdata = {
            "code": 200,
            "message": "Email address updated successfully!",
          };
          var responsedata = {
            "status": "success",
            "data": successdata
          };
          console.log("Resend verificationlink success : ", responsedata);
          return res.send(responsedata);


        }
        else {
          var errordata = {
            "code": 404,
            "message": "Unable to update user email address"
          };
          var responsedata = {
            "status": "error",
            "data": errordata
          };
          return res.send(responsedata);

        }
      })
      .catch(function (err) {
        sails.log.error("UserController #changeemailAction::Error", err);

        if (err.code == 400) {

          var errordata = {
            "code": 404,
            "message": err.message
          };
          var responsedata = {
            "status": "error",
            "data": errordata
          };
          return res.send(responsedata);


        }
        else {
          var errordata = {
            "code": 404,
            "message": "Unable to update user email address"
          };
          var responsedata = {
            "status": "error",
            "data": errordata
          };
          return res.send(responsedata);
        }
      });
  }
  else {
    var errordata = {
      "code": 404,
      "message": "Unable to update user email address"
    };
    var responsedata = {
      "status": "error",
      "data": errordata
    };
    return res.send(responsedata);
  }

}

function changeNewbankAction(req, res) {

  var payID = req.param("id");
  var bankToken = req.param("banktoken");

  var bankerrorval = '';
  if (req.session.bankerror != '') {
    bankerrorval = req.session.bankerror;
    req.session.bankerror = '';
  }

  var options = {
    id: payID,
    changebankToken: bankToken
  };

  PaymentManagement
    .findOne(options)
    .then(function (paymentmanagementdata) {

      var criteria = { id: paymentmanagementdata.user };
      User
        .findOne(criteria)
        .populate('state')
        .then(function (userDetails) {

          var accountcriteria = {
            user: userDetails.id,
            id: paymentmanagementdata.account,
          };

          Account
            .findOne(accountcriteria)
            .populate('userBankAccount')
            .then(function (accountDetail) {

              var str1 = accountDetail.accountNumber;

              if ("undefined" !== typeof str1 && str1 != '' && str1 != null) {
                accountDetail.accountNumber = str1.replace(/\d(?=\d{4})/g, "X");
              }
              var bankname = '--';
              if ("undefined" !== typeof accountDetail.userBankAccount) {
                bankname = accountDetail.userBankAccount.institutionName;
              }

              sails.log.info("bankname", bankname);

              var responsedata = {
                status: 200,
                message: 'success',
                paymentmanagementdata: paymentmanagementdata,
                user: userDetails,
                accountDetail: accountDetail,
                bankname: bankname,
                payID: payID,
                bankToken: bankToken

              };
              //sails.log.info("responsedata",responsedata);
              return res.view('admin/changeNewBank', responsedata);


            })
            .catch(function (err) {
              var responsedata = {
                status: 400,
                message: 'Your are not allowed to change new bank account.'
              };
              return res.view('admin/changeNewBank', responsedata);
            });

        })
        .catch(function (err) {
          var responsedata = {
            status: 400,
            message: 'Your are not allowed to change new bank account.'
          };
          return res.view('admin/changeNewBank', responsedata);
        });

    }).catch(function (err) {
      var responsedata = {
        status: 400,
        message: 'Your are not allowed to change new bank account.'
      };
      return res.view('admin/changeNewBank', responsedata);
    });
}

function changephoneAction(req, res) {

  var userid = req.param("userid");
  var userphone = req.param("userphone");
  var isPhoneVerified = req.param("isPhoneVerified") === "true";

  if (userid) {

    User
      .changePhoneNumber(userid, req, userphone, isPhoneVerified)
      .then(function (userdata) {

        sails.log.info("userdata : ", userdata);
        if (userdata) {
          req.session.successmsg = '';
          req.session.successmsg = 'Phone number updated successfully!';
          return res.redirect("/admin/viewUserDetails/" + userid);
        }
        else {
          req.session.errormsg = '';
          req.session.errormsg = 'Unable to update user phone number!';
          return res.redirect("/admin/viewUserDetails/" + userid);
        }
      })
      .catch(function (err) {
        sails.log.error("UserController #changeemailAction::Error", err);

        if (err.code == 400) {
          req.session.errormsg = '';
          req.session.errormsg = err.message;
          return res.redirect("/admin/viewUserDetails/" + userid);

        }
        else {
          req.session.errormsg = '';
          req.session.errormsg = 'Unable to update user phone number';
          return res.redirect("/admin/viewUserDetails/" + userid);
        }
      });
  }
  else {
    req.session.errormsg = '';
    req.session.errormsg = 'Unable to update user phone number';
    return res.redirect("/admin/viewUserDetails/" + userid);
  }

}

function finalizeSocialUserAction(req, res) {

  if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }

  //checking App version
  if (!req.form.appversion) {
    var errordata = {
      "code": 403,
      "message": "Please update fluid app with latest version from app store to continue"
    };
    var responsedata = {
      "status": "error",
      "data": errordata
    };
    return res.send(responsedata);
  }
  else {
    if (sails.config.appManagement.appVersion > req.form.appversion) {
      var errordata = {
        "code": 404,
        "message": "Please update fluid app with latest version from app store to continue"
      };
      var responsedata = {
        "status": "error",
        "data": errordata
      };
      return res.send(responsedata);
    }
  }

  User
    .updateSocialUser(req.form)
    .then(function (user) {

      if (user.code == 200) {
        //-- save user geolocation
        var usergeodata = {};
        usergeodata.latitude = req.param("latitude");
        usergeodata.longitude = req.param("longitude");
        usergeodata.street = req.param("street");
        usergeodata.locality = req.param("locality");
        usergeodata.city = req.param("city");
        usergeodata.state = req.param("state");
        usergeodata.country = req.param("country");
        usergeodata.postalcode = req.param("postalcode");

        Usergeotracking.saveUserTrackingDetails(user.userdata.id, usergeodata)
          .then(function (usertrackingData) {
            sails.log.info("Usergeotracking save info::", usertrackingData);
          })
          .catch(function (err) {
            sails.log.error("Usergeotracking save error::", err);
          });

        return res.success(user.userdata, user.userdata.token);
      }
      else {
        var errordata = {
          "code": 400,
          "message": "Email already exist!"
        };
        var responsedata = {
          "status": "error",
          "data": errordata
        };
        return res.send(responsedata);
      }
    })
    .catch(function (err) {
      sails.log.error('UserController#v :: err :', err);
      return res.handleError(err);
    });
}

function userTrackingDataAction(req, res) {

  var userID = req.user.id;
  var latitudedata = req.param("latitudedata");
  var longitudedata = req.param("longitudedata");
  var street = req.param("street");
  var locality = req.param("locality");
  var city = req.param("city");
  var state = req.param("state");
  var country = req.param("country");
  var postalcode = req.param("postalcode");

  if (userID) {
    if ("undefined" !== typeof latitudedata && latitudedata != '' && latitudedata != null && "undefined" !== typeof longitudedata && longitudedata != '' && longitudedata != null) {
      var geotrackdata = {
        user: userID,
        latitudedata: latitudedata,
        longitudedata: longitudedata,
        street: street,
        locality: locality,
        city: city,
        state: state,
        country: country,
        postalcode: postalcode
      }

      Usergeotracking.create(geotrackdata)
        .then(function (usertrackdata) {
          sails.log.info('UserController#userTrackingData :: info :', usertrackdata);
          return res.success(usertrackdata);
        })
        .catch(function (err) {
          sails.log.error('UserController#userTrackingData :: err :', err);
          return res.handleError(err);
        });
    }
    else {
      var errordata = {
        "code": 400,
        "message": "Unable to register user geo track data"
      };
      var responsedata = {
        "status": "error",
        "data": errordata
      };
      return res.send(responsedata);
    }
  }
  else {
    var errordata = {
      "code": 400,
      "message": "Unable to register user geo track data"
    };
    var responsedata = {
      "status": "error",
      "data": errordata
    };
    return res.send(responsedata);
  }
}

function ajaxUserTrackingListAction(req, res) {

  var userID = req.param('id');

  //Sorting
  var colS = "";

  if (req.query.sSortDir_0 == 'desc') {
    sorttype = -1;
  }
  else {
    sorttype = 1;
  }
  switch (req.query.iSortCol_0) {
    case '0': var sorttypevalue = { '_id': sorttype }; break;
    case '1': var sorttypevalue = { 'latitudedata': sorttype }; break;
    case '2': var sorttypevalue = { 'longitudedata': sorttype }; break;
    case '3': var sorttypevalue = { 'locality': sorttype }; break;
    case '4': var sorttypevalue = { 'city': sorttype }; break;
    case '5': var sorttypevalue = { 'state': sorttype }; break;
    case '6': var sorttypevalue = { 'country': sorttype }; break;
    case '7': var sorttypevalue = { 'postalcode': sorttype }; break;
    case '8': var sorttypevalue = { 'createdAt': sorttype }; break;
    default: break;
  };


  //Search
  if (req.query.sSearch) {
    var criteria = {
      user: userID,
      or: [{ latitudedata: { 'contains': req.query.sSearch } }, { longitudedata: { 'contains': req.query.sSearch } }, { locality: { 'contains': req.query.sSearch } }, { city: { 'contains': req.query.sSearch } }, { state: { 'contains': req.query.sSearch } }, { country: { 'contains': req.query.sSearch } }, { postalcode: { 'contains': req.query.sSearch } }, { createdAt: { 'contains': req.query.sSearch } }]
    };

  }
  else {
    var criteria = {
      user: userID
    };
  }

  Usergeotracking
    .find(criteria)
    .sort(sorttypevalue)
    .then(function (trackingDetails) {

      totalrecords = trackingDetails.length;

      skiprecord = parseInt(req.query.iDisplayStart);
      checklimitrecords = skiprecord + parseInt(req.query.iDisplayLength);
      if (checklimitrecords > totalrecords) {
        iDisplayLengthvalue = parseInt(totalrecords);
      }
      else {
        iDisplayLengthvalue = parseInt(req.query.iDisplayLength) + parseInt(skiprecord);
      }

      trackingDetails = trackingDetails.slice(skiprecord, iDisplayLengthvalue);

      var trackingData = [];

      trackingDetails.forEach(function (trackinginfo, loopvalue) {

        loopid = loopvalue + skiprecord + 1;
        //trackinginfo.createdAt = moment(trackinginfo.createdAt).format('MM-DD-YYYY');
        trackinginfo.createdAt = moment(trackinginfo.createdAt).format('LLL');

        trackingData.push({ loopid: loopid, latitudedata: trackinginfo.latitudedata, longitudedata: trackinginfo.longitudedata, locality: trackinginfo.locality, city: trackinginfo.city, state: trackinginfo.state, country: trackinginfo.country, postalcode: trackinginfo.postalcode, createdAt: trackinginfo.createdAt });

      });
      var json = {
        sEcho: req.query.sEcho,
        iTotalRecords: totalrecords,
        iTotalDisplayRecords: totalrecords,
        aaData: trackingData
      };
      res.contentType('application/json');
      res.json(json);
    });
}

function showUserTrackingMap(req, res) {

  var userID = req.param('userID');
  if (userID) {
    var criteria = {
      user: userID
    };

    Usergeotracking
      .find(criteria)
      .sort("createdAt DESC")
      .then(function (trackingDetails) {

        if (trackingDetails.length > 0) {
          var centerData = trackingDetails[0];
          var json = {
            status: 200,
            data: trackingDetails,
            latitude: centerData.latitudedata,
            longitude: centerData.longitudedata
          };
        }
        else {
          var json = {
            status: 400
          };
        }
        sails.log.info("json data :", json);
        res.contentType('application/json');
        res.json(json);
      })
  }
  else {
    var json = {
      status: 400
    };
    res.contentType('application/json');
    res.json(json);
  }
}

function userContactsDataAction(req, res) {

  var userID = req.user.id;
  var usercontactsString = req.param("contacts");

  var usercontactsData = JSON.parse(usercontactsString);
  //var usercontactsData = usercontactsString.toJSON();
  //sails.log.info("userID:", userID);

  if (userID) {
    //var uniquecontacts = _.uniq(usercontactsData, 'combineData');
    var uniquecontacts = usercontactsData;
    //sails.log.info("uniquecontacts:", uniquecontacts);

    var criteria = {
      user: userID
    };

    //sails.log.info("criteria:", criteria);

    Usercontacts
      .findOne(criteria)
      .then(function (contactData) {

        //sails.log.info("contactData:", contactData);
        var domainName = sails.config.getBaseUrl;
        var inviteToken = Math.random().toString(36).slice(-12);
        var invitationLink = domainName + '/saveinviteuser/' + userID + '/' + inviteToken;

        if (contactData) {
          if (!contactData.inviteToken) {
            contactData.inviteToken = inviteToken;
          }
          if (!contactData.inviteUrl) {
            contactData.inviteUrl = invitationLink;
          }

          if (!contactData.usercontacts) {
            contactData.usercontacts = [];
            contactData.usercontacts.push(uniquecontacts);
          }
          else {
            //sails.log.info("uniquecontacts initial:", uniquecontacts);

            var usercontactsData = contactData.usercontacts;

            uniquecontacts = _.filter(uniquecontacts, function (item) {

              var blockcontacts = 0;
              _.forEach(usercontactsData, function (contactinfo) {

                //sails.log.info("contactinfo:", contactinfo);
                //sails.log.info("contactinfo mail:", contactinfo.email);

                if ("undefined" !== typeof item.email && item.email != '' && item.email != null) {
                  var emailcheck = contactinfo.email.toLowerCase();
                  if ("undefined" !== typeof emailcheck && emailcheck != '' && emailcheck != null) {
                    if (item.email.toLowerCase().indexOf(emailcheck) > -1) {
                      blockcontacts = 1;
                    }
                  }
                }

                if ("undefined" !== typeof item.phoneno && item.phoneno != '' && item.phoneno != null) {
                  var phonenocheck = contactinfo.phoneno.toLowerCase();
                  if ("undefined" !== typeof phonenocheck && phonenocheck != '' && phonenocheck != null) {
                    if (item.phoneno.toLowerCase().indexOf(phonenocheck) > -1) {
                      blockcontacts = 1;

                      //update email address
                      var updatemail = contactinfo.email.toLowerCase();
                      if ("undefined" === typeof updatemail || updatemail == '' || updatemail == null) {
                        if ("undefined" !== typeof item.email && item.email != '' && item.email != null) {
                          contactinfo.email = item.email;
                        }
                      }
                    }
                  }
                }
              });

              //sails.log.info("blockcontacts:", blockcontacts);

              if (blockcontacts == 0) {
                return true;
              }

            });

            //sails.log.info("uniquecontacts final:", uniquecontacts);

            _.forEach(uniquecontacts, function (uniquecontactsvalue) {
              contactData.usercontacts.push(uniquecontactsvalue);
            });

          }
          //contactData.usercontacts= [];
          //contactData.usercontacts.push(uniquecontacts);

          contactData.save(function (err) {
            if (err) {
              sails.log.error("UserController#userContactsData :: Error :: ", err);

              return reject({
                code: 500,
                message: 'INTERNAL_SERVER_ERROR'
              });
            }

            var successdata = {
              "code": 200,
              "contactData": contactData
            };
            var responsedata = {
              "status": "success",
              "data": successdata
            };
            return res.send(responsedata);
          });
        }
        else {
          var contactsObject = {
            user: userID,
            usercontacts: uniquecontacts,
            inviteToken: inviteToken,
            inviteUrl: invitationLink
          };

          Usercontacts.create(contactsObject)
            .then(function (contacts) {
              //sails.log.info("UserController#userContactsData :: usercontacts :: ", contacts);
              //res.success(contacts);
              var successdata = {
                "code": 200,
                "contactData": contacts
              };
              var responsedata = {
                "status": "success",
                "data": successdata
              };
              return res.send(responsedata);
            })
            .catch(function (err) {
              sails.log.error("UserController :: userContactsData :: Error :: ", err);
              return res.handleError({
                code: 500,
                message: 'INTERNAL_SERVER_ERROR'
              });
            });
        }
      })
      .catch(function (err) {
        sails.log.error("UserController#userContactsData :: Error :: ", err);
        return res.handleError({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  }
  else {
    return res.handleError({
      code: 500,
      message: 'INTERNAL_SERVER_ERROR'
    });
  }
}

function ajaxUserContactsListAction(req, res) {

  var userID = req.param('id');

  //Sorting
  var colS = "";

  if (req.query.sSortDir_0 == 'desc') {
    sorttype = -1;
  }
  else {
    sorttype = 1;
  }
	/*switch(req.query.iSortCol_0){
		case '0':  var sorttypevalue = { '_id': sorttype }; break;
		case '1':  var sorttypevalue = { 'email': sorttype }; break;
		case '2':  var sorttypevalue = { 'phoneno': sorttype }; break;
		default: break;
	};*/


  //Search
  if (req.query.sSearch) {
    var criteria = {
      user: userID
    };
  }
  else {
    var criteria = {
      user: userID
    };
  }

  Usercontacts
    .findOne(criteria)
    .then(function (usercontactDetails) {

      sails.log.info("usercontactDetails: ", usercontactDetails);

      var contactData = [];
      if (usercontactDetails) {
        var contactDetails = usercontactDetails.usercontacts;

        //sails.log.info("usercontact", contactDetails);
        //contactDetails = _.orderBy(contactDetails, ['email'], ['asc']);
        if (req.query.sSortDir_0 == 'desc') {
          switch (req.query.iSortCol_0) {
            case '1': contactDetails = _.sortBy(contactDetails, 'email').reverse(); break;
            case '2': contactDetails = _.sortBy(contactDetails, 'phoneno').reverse(); break;
            case '3': contactDetails = _.sortBy(contactDetails, 'status').reverse(); break;
            case '4': contactDetails = _.sortBy(contactDetails, 'referred').reverse(); break;
            default: break;
          };
        }
        else {
          switch (req.query.iSortCol_0) {
            case '1': contactDetails = _.sortBy(contactDetails, 'email'); break;
            case '2': contactDetails = _.sortBy(contactDetails, 'phoneno'); break;
            case '3': contactDetails = _.sortBy(contactDetails, 'status').reverse(); break;
            case '4': contactDetails = _.sortBy(contactDetails, 'referred').reverse(); break;
            default: break;
          };
        }

        //Filter using search data
        if (req.query.sSearch) {
          var search = req.query.sSearch.toLowerCase();

          contactDetails = _.filter(contactDetails, function (item) {
            if ("undefined" !== typeof item.email && item.email != '' && item.email != null) {
              if (item.email.toLowerCase().indexOf(search) > -1) {
                return true;
              }
            }

            if ("undefined" !== typeof item.phoneno && item.phoneno != '' && item.phoneno != null) {
              if (item.phoneno.toLowerCase().indexOf(search) > -1) {
                return true;
              }
            }

            if (item.status) {
              if ("undefined" !== typeof item.status && item.status != '' && item.status != null) {
                if (search == 'yes') {
                  var checkinvitevalue = 1;
                }
                else {
                  var checkinvitevalue = 0;
                }
                if (parseInt(item.status) == parseInt(checkinvitevalue)) {
                  return true;
                }
              }
            }

            if (item.referred) {
              if ("undefined" !== typeof item.referred && item.referred != '' && item.referred != null) {
                if (search == 'yes') {
                  var checkrefferedvalue = 1;
                }
                else {
                  var checkrefferedvalue = 0;
                }

                if (parseInt(item.referred) == parseInt(checkrefferedvalue)) {
                  return true;
                }
              }
            }
            return false;
          });
        }

        totalrecords = contactDetails.length;
        //sails.log.info("usercontact length:", totalrecords);

        skiprecord = parseInt(req.query.iDisplayStart);
        checklimitrecords = skiprecord + parseInt(req.query.iDisplayLength);
        if (checklimitrecords > totalrecords) {
          iDisplayLengthvalue = parseInt(totalrecords);
        }
        else {
          iDisplayLengthvalue = parseInt(req.query.iDisplayLength) + parseInt(skiprecord);
        }

        contactDetails = contactDetails.slice(skiprecord, iDisplayLengthvalue);

        contactDetails.forEach(function (contactinfo, loopvalue) {
          loopid = loopvalue + skiprecord + 1;

          var referred = 'No';
          var invitestatus = 'No';

          if (contactinfo.status) {
            if ("undefined" !== typeof contactinfo.status && contactinfo.status != '' && contactinfo.status != null) {
              if (contactinfo.status == "1") {
                invitestatus = 'Yes';
              }
            }
          }

          if (contactinfo.referred) {
            if ("undefined" !== typeof contactinfo.referred && contactinfo.referred != '' && contactinfo.referred != null) {
              if (contactinfo.referred == "1") {
                referred = 'Yes';
              }
            }
          }

          contactData.push({ loopid: loopid, email: contactinfo.email, phoneno: contactinfo.phoneno, status: invitestatus, referred: referred });
        });
      }
      else {
        totalrecords = 0;
      }

      var json = {
        sEcho: req.query.sEcho,
        iTotalRecords: totalrecords,
        iTotalDisplayRecords: totalrecords,
        aaData: contactData
      };
      sails.log.info("json data", json);
      res.contentType('application/json');
      res.json(json);
    });
}

function userInvitesDataAction(req, res) {

  var userID = req.user.id;
  var usercontactsString = req.param("contacts");
  var usercontactsData = JSON.parse(usercontactsString);
  var domainName = sails.config.getBaseUrl;

  sails.log.info("usercontactsData: ", usercontactsData);

  if (userID) {
    var criteria = {
      user: userID
    };

    Usercontacts
      .findOne(criteria)
      .then(function (contactData) {

        var inviteToken = Math.random().toString(36).slice(-12);
        var invitationLink = domainName + '/saveinviteuser/' + userID + '/' + inviteToken;

        //replacing space in phone no
        _.forEach(usercontactsData, function (trimcontacts) {
          var trimcontactsPhoneno = trimcontacts.phoneno;
          if ("undefined" !== typeof trimcontactsPhoneno && trimcontactsPhoneno != '' && trimcontactsPhoneno != null) {
            //trimcontacts.phoneno =  trimcontactsPhoneno.replace(/\s+/g, '');
            //trimcontacts.phoneno =  trimcontactsPhoneno.replace(/-|\s/g, '');
            trimcontacts.phoneno = trimcontacts.phoneno.replace(/[- )(]/g, '');
          }
        });
        sails.log.info("New usercontactsData: ", usercontactsData);

        if (contactData) {
          if (!contactData.inviteToken) {
            contactData.inviteToken = inviteToken;
          }
          if (!contactData.inviteUrl) {
            contactData.inviteUrl = invitationLink;
          }

          if (!contactData.usercontacts) {
            _.forEach(usercontactsData, function (contactinfo) {
              contactinfo.status = 1;
            });
            contactData.usercontacts = [];
            contactData.usercontacts.push(usercontactsData);
          }
          else {
            var dbusercontacts = contactData.usercontacts;

            var finalData = [];
            _.forEach(dbusercontacts, function (dbcontacts) {

              var blockcontacts = 0;
              var dbemailcheck = dbcontacts.email.toLowerCase();
              var dbphonenocheck = dbcontacts.phoneno.toLowerCase();

              //sails.log.info("dbemailcheck: ",dbemailcheck);
              //sails.log.info("dbphonenocheck: ",dbphonenocheck);

              _.forEach(usercontactsData, function (contactinfo) {
                var emailcheck = contactinfo.email.toLowerCase();
                var phonenocheck = contactinfo.phoneno.toLowerCase();

                /*sails.log.info("emailcheck: ",emailcheck);
                sails.log.info("phonenocheck: ",phonenocheck);
                sails.log.info("-------------------------------------");*/

                if ("undefined" !== typeof emailcheck && emailcheck != '' && emailcheck != null) {
                  if (dbemailcheck.indexOf(emailcheck) > -1) {
                    blockcontacts = 1;
                  }
                }

                if ("undefined" !== typeof phonenocheck && phonenocheck != '' && phonenocheck != null) {
                  if (dbphonenocheck.indexOf(phonenocheck) > -1) {
                    blockcontacts = 1;
                  }
                }
              });

              //sails.log.info("blockcontacts: ",blockcontacts);
              //sails.log.info("=======================================");
              if (blockcontacts == 1) {
                dbcontacts.status = 1;
                finalData.push(dbcontacts);
              }
              else {
                finalData.push(dbcontacts);
              }
            });
            contactData.usercontacts = finalData;
          }

          contactData.save(function (err) {
            if (err) {
              sails.log.error("UserController#userInvitesData :: Error :: ", err);

              return reject({
                code: 500,
                message: 'INTERNAL_SERVER_ERROR'
              });
            }

            var successdata = {
              "code": 200,
              "invitationLink": invitationLink
            };
            var responsedata = {
              "status": "success",
              "data": successdata
            };
            return res.send(responsedata);
          });
        }
        else {
          _.forEach(usercontactsData, function (contactinfo) {
            contactinfo.status = 1;
          });

          var contactsObject = {
            user: userID,
            usercontacts: usercontactsData,
            inviteToken: inviteToken,
            inviteUrl: invitationLink
          };

          Usercontacts.create(contactsObject)
            .then(function (contacts) {

              var successdata = {
                "code": 200,
                "invitationLink": invitationLink
              };
              var responsedata = {
                "status": "success",
                "data": successdata
              };
              sails.log.info("UserController :: userInvitesData :: response :: ", responsedata);

              return res.send(responsedata);
            })
            .catch(function (err) {
              sails.log.error("UserController :: userInvitesData :: Error :: ", err);
              return res.handleError({
                code: 500,
                message: 'INTERNAL_SERVER_ERROR'
              });
            });
        }
      });
  }
}

function saveInviteUserAction(req, res) {

  var userID = req.param("id");
  var invitetoken = req.param("invitetoken");

  if (userID && invitetoken) {
    var criteria = {
      user: userID,
      inviteToken: invitetoken
    };

    Usercontacts
      .findOne(criteria)
      .then(function (contactData) {

        if (contactData) {
          //var ipaddress = ip.address();
          //sails.log.info("ipaddress :: ",ipaddress);

          var remoteAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          sails.log.info("remoteAddress :: ", remoteAddress);


          var refferedData = {
            deviceUDID: req.ip,
            remoteipaddress: remoteAddress
          }

          //sails.log.info("contactData :: ", contactData);
          //sails.log.info("refferedData :: ",refferedData);

          if (!contactData.refferedContacts) {
            contactData.refferedContacts = [];
            contactData.refferedContacts.push(refferedData);
          }
          else {
            contactData.refferedContacts.push(refferedData);
          }

          contactData.save(function (err) {
            if (err) {
              sails.log.error("UserController#saveInviteUserAction :: Error :: ", err);
              res.redirect('http://fluidfiapp.com');
            }
            res.redirect('https://itunes.apple.com/us/app/fluid-credit-0-interest-personal-loan/id1157853544?mt=8');
          });
        }
        else {
          res.redirect('http://fluidfiapp.com');
        }
      })
      .catch(function (err) {
        sails.log.error("UserController :: saveInviteUserAction :: Error :: ", err);
        res.redirect('http://fluidfiapp.com');
      });
  }
  else {
    sails.log.error("UserController :: saveInviteUserAction :: Error :: Invalid data ");
    res.redirect('http://fluidfiapp.com');
  }
}

function manageproductsAction(req, res) {

  Productlist
    .find({
      limit: 2
    })
    .then(function (products) {
      sails.log.info("Products : ", products);
      res.view("admin/user/manageproducts", {
        products: products
      });
    })
    .catch(function (err) {
      sails.log.error("UserController#manageproductsAction ::  err ", err);
      return res.handleError(err);
    });

}

function viewproductdetailsAction(req, res, id) {

  var productid = req.param("id");
  var criteria = { product: productid };

  Loanamountcap
    .find(criteria)
    .then(function (amountcaps) {

      Productlist
        .findOne({
          id: productid
        })
        .then(function (productdetails) {

          sails.log.info("productdetails", productdetails);

          ProductRules.find(criteria).then(function (productRules) {


            stateratepaymentcycle.find()
              .then(function (stateregulation) {
								/*sails.log.info("stateregulation:",stateregulation);
								return 1;*/

                Loaninterestrate
                  .find(criteria)
                  .then(function (loaninterestrate) {

                    Loanapplicationfee.find(criteria).then(function (applicationfee) {

                      var criteriamonth = { productid: productid };

                      Loanproductsettings
                        .find(criteriamonth)
                        .then(function (loanproductsettings) {

                          sails.log.info("criteriamonth", criteriamonth);

                          Loanproductincome
                            .find(criteriamonth)
                            .then(function (loanproductincome) {

                              var responsedata = {
                                productid: productid,
                                loanamountcaps: amountcaps,
                                productname: productdetails.productname,
                                producttype: productdetails.producttype,
                                loanstateregualtion: stateregulation,
                                productRules: productRules,
                                loaninterestrate: loaninterestrate,
                                productdetails: productdetails,
                                applicationfee: applicationfee,
                                loanproductsettings: loanproductsettings,
                                loanproductincome: loanproductincome
                              };

                              res.view("admin/user/viewproduct", responsedata);
                            })
                            .catch(function (err) {
                              sails.log.error("UserController#viewproductdetailsAction ::  err ", err);
                              return res.handleError(err);
                            });
                        })
                        .catch(function (err) {
                          sails.log.error("UserController#viewproductdetailsAction ::  err ", err);
                          return res.handleError(err);
                        });
                    })
                      .catch(function (err) {
                        sails.log.error("UserController#viewproductdetailsAction ::  err ", err);
                        return res.handleError(err);
                      });
                  })
                  .catch(function (err) {
                    sails.log.error("UserController#viewproductdetailsAction ::  err ", err);
                    return res.handleError(err);
                  });
              })
              .catch(function (err) {
                sails.log.error("UserController#viewproductdetailsAction ::  err ", err);
                return res.handleError(err);
              });
          })
        })
        .catch(function (err) {
          sails.log.error("UserController#viewproductdetailsAction ::  err ", err);
          return res.handleError(err);
        });
    })
    .catch(function (err) {
      sails.log.error("UserController#viewproductdetailsAction ::  err ", err);
      return res.handleError(err);
    });

}

function getloanamountcapfieldsAction(req, res) {

  var loanamountcap_id = req.param("loanamountcap_id");

  sails.log.info("loanamountcap_id", loanamountcap_id);

  var criteria = { id: loanamountcap_id };

  Loanamountcap
    .findOne(criteria)
    .then(function (capdetails) {

      sails.log.info("amountcaps", capdetails);


      var responsedata = {
        status: "Success",
        capdetails: capdetails
      };

      var json = {
        responsedata: responsedata,
      };
      sails.log.info("json data", json);
      res.contentType('application/json');
      res.json(json);

    })
    .catch(function (err) {
      sails.log.error('UserController#getloanamountcapfieldsAction#catch :: err :', err);
      return res.handleError(err);
    });

}

function createupdateamountcapAction(req, res) {
  //var data = req.form;
  var minimumcreditscore = req.param("minimumcreditscore");
  var maximumcreditscore = req.param("maximumcreditscore");
  var cap = req.param("cap");
  var product_id = req.param("product_id");
  var loanamountcap_id = req.param("loanamountcap_id");
  var action = req.param("action");

  sails.log.info("productid", product_id);
  sails.log.info("action", action);

  if (action == "update") {

    /*check range start*/
    Loanamountcap
      .find({
        product: product_id,
        id: { '!': loanamountcap_id }
      })
      .then(function (filtercapdetails) {

        sails.log.info("filtercapdetails", filtercapdetails);

        var minimumcriteriaExist = 0;
        var maximumcriteriaExist = 0;
        _.forEach(filtercapdetails, function (filtercapdetails) {
          sails.log.info("filtercapdetailsin", filtercapdetails);
          var mincreditscore = filtercapdetails.mincreditscore;
          var maxcreditscore = filtercapdetails.maxcreditscore;
          sails.log.info("mincreditscore", mincreditscore);
          sails.log.info("maxcreditscore", maxcreditscore);
          sails.log.info("minimumcreditscore", minimumcreditscore);
          sails.log.info("maximumcreditscore", maximumcreditscore);
          if ((minimumcreditscore >= mincreditscore) && (minimumcreditscore <= maxcreditscore)) {
            minimumcriteriaExist = 1;
            sails.log.info("minimumcriteriaExist", minimumcriteriaExist);
          }
          if ((maximumcreditscore >= mincreditscore) && (maximumcreditscore <= maxcreditscore)) {
            maximumcriteriaExist = 1;
            sails.log.info("maximumcriteriaExist", maximumcriteriaExist);
          }

        });


        /*check range end*/
        if ((maximumcriteriaExist == 1) && (minimumcriteriaExist == 1)) {
          var responsedata = {
            status: "fail",
            message: "Your Minimum And Maximum Creditscore Already In Existing Range. Tryout With Another Range."
          };

          var json = {
            responsedata: responsedata,
          };

          sails.log.info("json data", json);
          res.contentType('application/json');
          res.json(json);
        }
        if (minimumcriteriaExist == 1) {
          var responsedata = {
            status: "fail",
            message: "Your Minimum Creditscore Already In Existing Range. Tryout With Another Range."
          };

          var json = {
            responsedata: responsedata,
          };

          sails.log.info("json data", json);
          res.contentType('application/json');
          res.json(json);
        }
        if (maximumcriteriaExist == 1) {
          var responsedata = {
            status: "fail",
            message: "Your Maximum Creditscore Already In Existing Range. Tryout With Another Range."
          };

          var json = {
            responsedata: responsedata,
          };

          sails.log.info("json data", json);
          res.contentType('application/json');
          res.json(json);
        }
        if ((minimumcriteriaExist != 1) && (maximumcriteriaExist != 1)) {
          var criteria = { id: loanamountcap_id };
          Loanamountcap
            .findOne(criteria)
            .then(function (capdetails) {

              sails.log.info("enter cap : ", capdetails);

              capdetails.mincreditscore = minimumcreditscore;
              capdetails.maxcreditscore = maximumcreditscore;
              capdetails.cap = cap;

              sails.log.info("enter cap : ", capdetails);


              Loanamountcap.update(criteria, { cap: capdetails.cap, mincreditscore: capdetails.mincreditscore, maxcreditscore: capdetails.maxcreditscore })
                .exec(function afterwards(err, updated) {

                  sails.log.info("updated datas : ", updated);

                  if (err) {
                    sails.log.info("error occured : ", err);
                  }

                  var responsedata = {
                    status: "Success",
                    message: "Your Data Successfully Updated."
                  };

                  var json = {
                    responsedata: responsedata,
                  };

                  sails.log.info("json data", json);
                  res.contentType('application/json');
                  res.json(json);

                });

            });
        }
      });
  }
  if (action == "create") {
    /*To check ranges start*/
    var product_criteria = { product: product_id };
    Loanamountcap
      .find(product_criteria)
      .then(function (amountcapdetails) {
        sails.log.info("amountcapdetails", amountcapdetails);
        var minimumcriteriaExist = 0;
        var maximumcriteriaExist = 0;
        _.forEach(amountcapdetails, function (amountcapdetails) {
          sails.log.info("amountcapdetails", amountcapdetails);
          var mincreditscore = amountcapdetails.mincreditscore;
          var maxcreditscore = amountcapdetails.maxcreditscore;
          sails.log.info("mincreditscore", mincreditscore);
          sails.log.info("maxcreditscore", maxcreditscore);
          sails.log.info("minimumcreditscore", minimumcreditscore);
          sails.log.info("maximumcreditscore", maximumcreditscore);
          if ((minimumcreditscore >= mincreditscore) && (minimumcreditscore <= maxcreditscore)) {
            minimumcriteriaExist = 1;
            sails.log.info("minimumcriteriaExist", minimumcriteriaExist);
          }
          if ((maximumcreditscore >= mincreditscore) && (maximumcreditscore <= maxcreditscore)) {
            maximumcriteriaExist = 1;
            sails.log.info("maximumcriteriaExist", maximumcriteriaExist);
          }

        });
        /*To check ranges end*/
        if ((maximumcriteriaExist == 1) && (minimumcriteriaExist == 1)) {
          var responsedata = {
            status: "fail",
            message: "Your Minimum And Maximum Creditscore Already In Existing Range. Tryout With Another Range."
          };

          var json = {
            responsedata: responsedata,
          };

          sails.log.info("json data", json);
          res.contentType('application/json');
          res.json(json);
        }
        if (minimumcriteriaExist == 1) {
          var responsedata = {
            status: "fail",
            message: "Your Minimum Creditscore Already In Existing Range. Tryout With Another Range."
          };

          var json = {
            responsedata: responsedata,
          };

          sails.log.info("json data", json);
          res.contentType('application/json');
          res.json(json);
        }
        if (maximumcriteriaExist == 1) {
          var responsedata = {
            status: "fail",
            message: "Your Maximum Creditscore Already In Existing Range. Tryout With Another Range."
          };

          var json = {
            responsedata: responsedata,
          };

          sails.log.info("json data", json);
          res.contentType('application/json');
          res.json(json);
        }
        if ((minimumcriteriaExist != 1) && (maximumcriteriaExist != 1)) {
          Loanamountcap.create({ product: product_id, mincreditscore: minimumcreditscore, maxcreditscore: maximumcreditscore, cap: cap }).exec(function (err, finn) {

            sails.log.info("created datas : ", finn);

            if (err) {
              sails.log.info("error occured : ", err);
            }
            var responsedata = {
              status: "Success",
              message: "Your Data Successfully Created."
            };

            var json = {
              responsedata: responsedata,
            };

            sails.log.info("json data", json);
            res.contentType('application/json');
            res.json(json);

          });
        }
      });
  }

}

function ajaxgetloanamountcapAction(req, res) {

  var product_id = req.param("product_id");

  Loanamountcap
    .find({
      product: product_id
    })
    .then(function (capdetails) {

      Productlist
        .findOne({
          id: product_id
        })
        .then(function (productdetails) {

          sails.log.info("capdetails : ", capdetails);

          var responsedata = {
            status: "get success",
            capdetails: capdetails,
            productname: productdetails.productname
          };

          var json = {
            responsedata: responsedata,
          };

          sails.log.info("json data", json);
          res.contentType('application/json');
          res.json(json);
        });
    });

}

function ajaxgetinterestratesACtion(req, res) {

  var product_id = req.param("product_id");

  Loaninterestrate
    .find({ product: product_id })
    .then(function (interestdetails) {

      Productlist
        .findOne({ id: product_id })
        .then(function (productdetails) {

          Loanproductsettings
            .find({ productid: product_id })
            .then(function (loanproductsettings) {

              Loanproductincome
                .find({ productid: product_id })
                .then(function (loanproductincome) {

                  var responsedata = {
                    status: "get success",
                    interestdetails: interestdetails,
                    productdetails: productdetails,
                    loanproductsettings: loanproductsettings,
                    loanproductincome: loanproductincome
                  };

                  var json = {
                    responsedata: responsedata,
                  };

                  sails.log.info("json data", json);
                  res.contentType('application/json');
                  res.json(json);
                })
                .catch(function (err) {
                  sails.log.error('UserController#ajaxgetinterestratesACtion#catch :: err :', err);
                  return res.handleError(err);
                });
            })
            .catch(function (err) {
              sails.log.error('UserController#ajaxgetinterestratesACtion#catch :: err :', err);
              return res.handleError(err);
            });
        })
        .catch(function (err) {
          sails.log.error('UserController#ajaxgetinterestratesACtion#catch :: err :', err);
          return res.handleError(err);
        });
    })
    .catch(function (err) {
      sails.log.error('UserController#ajaxgetinterestratesACtion#catch :: err :', err);
      return res.handleError(err);
    });

}


function getloanstateregualtionfieldsAction(req, res) {

  var loanstateregualtion_id = req.param("loanstateregualtion_id");
  sails.log.info("json loanstateregualtion_id", loanstateregualtion_id);

  var criteria = { id: loanstateregualtion_id };
  sails.log.info("criteria", criteria);

  Loanstateregulation
    .findOne(criteria)
    .then(function (statedetails) {

      sails.log.info("statedetails", statedetails);


      var responsedata = {
        status: "Success",
        statedetails: statedetails
      };

      var json = {
        responsedata: responsedata,
      };
      sails.log.info("json data", json);
      res.contentType('application/json');
      res.json(json);

    })
    .catch(function (err) {
      sails.log.error('UserController#getloanstateregualtionfields#catch :: err :', err);
      return res.handleError(err);
    });

}



function registeruserAction(req, res) {
  res.view("admin/user/registerUserList");
}

function ajaxregisteruserlistAction(req, res) {
  //Sorting
  var colS = "";

  if (req.query.sSortDir_0 == 'desc') {
    sorttype = -1;
  }
  else {
    sorttype = 1;
  }
  switch (req.query.iSortCol_0) {
    case '0': var sorttypevalue = { '_id': sorttype }; break;
    case '1': var sorttypevalue = { 'userReference': sorttype }; break;
    case '2': var sorttypevalue = { 'firstname': sorttype }; break;
    case '3': var sorttypevalue = { 'email': sorttype }; break;
    case '4': var sorttypevalue = { 'phoneNumber': sorttype }; break;
    case '5': var sorttypevalue = { 'registeredtype': sorttype }; break;
    case '6': var sorttypevalue = { 'allowsocialnetwork': sorttype }; break;
    case '7': var sorttypevalue = { 'createdAt': sorttype }; break;
    case '8': var sorttypevalue = { 'lastname': sorttype }; break;
    default: break;
  };

  var sSearch = '';
  if (req.query.sSearch) {
		/*var matchcriteria = {
			"transunionuserdata": { $eq: [] },
			 $or: [ {userReference:  { 'contains': req.query.sSearch }}, {firstname:  { 'contains': req.query.sSearch }}, {email:  { 'contains': req.query.sSearch }}, {phoneNumber:  { 'contains': req.query.sSearch }}, {registeredtype:  { 'contains': req.query.sSearch }}, {allowsocialnetwork:  { 'contains': req.query.sSearch }}, {registeredtype:  { 'createdAt': req.query.sSearch }} ]
		}*/

    var sSearch = req.query.sSearch;

    var matchcriteria = {
      "transunionuserdata": { $eq: [] },
      $or: [{ userReference: sSearch }, { firstname: sSearch }, { email: sSearch }, { phoneNumber: sSearch }, { registeredtype: sSearch }, { allowsocialnetwork: sSearch }, { createdAt: sSearch }]
    }

  }
  else {
    var matchcriteria = {
      "transunionuserdata": { $eq: [] }
    }
  }

  User.native(function (err, collection) {
    collection.aggregate(
      [
        {
          $lookup: {
            from: "transunions",
            localField: "_id",
            foreignField: "user",
            as: "transunionuserdata"
          }
        },
        {
          $match: matchcriteria
        },
        {
          $sort: sorttypevalue
        },
        {
          $count: "usercount"
        }

      ],
      function (err, result) {

        if (err) {
          return res.serverError(err);
        }

        sails.log.info("result", result);
        if (typeof result !== 'undefined' && result.length > 0) {
          totalrecords = result[0].usercount;
        } else {
          totalrecords = 0;
        }

        sails.log.info("totalrecords", totalrecords);

        iDisplayLengthvalue = parseInt(req.query.iDisplayLength);
        skiprecord = parseInt(req.query.iDisplayStart);

        //sails.log.info("iDisplayLengthvalue: ",iDisplayLengthvalue);
        //sails.log.info("skiprecord: ",skiprecord);

        User.native(function (err, collection) {
          collection.aggregate(
            [
              {
                $lookup: {
                  from: "transunions",
                  localField: "_id",
                  foreignField: "user",
                  as: "transunionuserdata"
                }
              },
              {
                $match: matchcriteria
              },
              {
                $sort: sorttypevalue
              },
              {
                $skip: skiprecord
              },
              {
                $limit: iDisplayLengthvalue
              },
            ],
            function (err, userDetails) {

              if (err) {
                return res.serverError(err);
              }

              //Filter user details not available
              userDetails = _.filter(userDetails, function (item) {
                if (item.email != '' && item.email != null) {
                  return true;
                }
              });

              //sails.log.info("userDetails", userDetails);

              var userData = [];
              var userName = '';
              var userscreenName = '';
              var userfullname = '';
              var userEmail = '';
              var userphoneNumber = '';
              var userAddress = '';

              userDetails.forEach(function (userinfo, loopvalue) {

                loopid = loopvalue + skiprecord + 1;

                userinfo.createdAt = moment(userinfo.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');

                sails.log.info("userinfo.createdAt", userinfo.createdAt);

                if ("undefined" === typeof userinfo.userReference || userinfo.userReference == '' || userinfo.userReference == null) {
                  userinfo.userReference = '--';
                }
                /*if ("undefined" === typeof userinfo.name || userinfo.name=='' || userinfo.name==null)
                {
                  userinfo.name= '--';
                }*/
                if ("undefined" === typeof userinfo.firstname || userinfo.firstname == '' || userinfo.firstname == null) {
                  userfullname = '--';
                }
                else {

                  var usersfullname = userinfo.firstname + ' ' + userinfo.lastname;
                }


                if ("undefined" === typeof userinfo.email || userinfo.email == '' || userinfo.email == null) {
                  userinfo.email = '--';
                }

                if ("undefined" === typeof userinfo.phoneNumber || userinfo.phoneNumber == '' || userinfo.phoneNumber == null) {
                  userinfo.phoneNumber = '--';
                }

                if ("undefined" === typeof userinfo.address || userinfo.address == '' || userinfo.address == null) {
                  userinfo.address = '--';
                }

                /*&nbsp;&nbsp; <a href="/admin/deleteUserDetails/'+userinfo.id+'" onclick="return confirm(\'Are you sure?\')"><i class="fa fa-trash" aria-hidden="true" style="cursor:pointer;color:#FF0000;"></i></a>*/
                if (userinfo.isDeleted) {
                  var actiondata = '<i class="fa fa-square-o icon-red" aria-hidden="true" style="cursor:pointer; color:red;" onclick="setUserStatus(\'' + userinfo.id + '\',\'inactive\');"></i>&nbsp;&nbsp; <a href="/admin/viewUserDetails/' + userinfo.id + '"><i class="fa fa-eye" aria-hidden="true" style="cursor:pointer;color:#337ab7;"></i></a>&nbsp;&nbsp; <a href="/admin/deleteUserDetails/' + userinfo.id + '" onclick="return confirm(\'Are you sure want to delete user?\')"  class="blockdeleteuser"><i class="fa fa-trash" aria-hidden="true" style="cursor:pointer;color:#FF0000;"></i></a>';
                }
                else {
                  var actiondata = '<i class="fa fa-check-square-o icon-green" aria-hidden="true" style="cursor:pointer; color:green;" onclick="setUserStatus(\'' + userinfo.id + '\',\'active\');"></i>&nbsp;&nbsp; <a href="/admin/viewUserDetails/' + userinfo.id + '"><i class="fa fa-eye" aria-hidden="true" style="cursor:pointer;color:#337ab7;"></i></a>&nbsp;&nbsp; <a href="/admin/deleteUserDetails/' + userinfo.id + '" onclick="return confirm(\'Are you sure want to delete user?\')" class="blockdeleteuser"><i class="fa fa-trash" aria-hidden="true" style="cursor:pointer;color:#FF0000;"></i></a>';
                }

                /*if ("undefined" !== typeof userName)
                {
                  console.log('the property is  available...',userName);
                }*/

                /*userData.push({ loopid:loopid,name: userName, screenName: userscreenName,email: userEmail,phoneNumber: userphoneNumber,createdAt:userinfo.createdAt,actiondata:actiondata });*/
                if (userinfo.email) {
                  var emillnk = '<a href="mailto:' + userinfo.email + '">' + userinfo.email + '</a>';
                }

                if (userinfo.registeredtype == "social") {
                  var registeredtype = userinfo.socialnetworktype;
                }
                else {
                  var registeredtype = userinfo.registeredtype;
                }

                if (userinfo.registeredtype == "social") {
                  if (userinfo.allowsocialnetwork == 1) {
                    var registeredstatus = 'Completed';
                  }
                  else {
                    var registeredstatus = 'Incomplete';
                  }
                }
                else {
                  var registeredstatus = 'Completed';
                }

                /*userData.push({ loopid:loopid,userReference:userinfo.userReference, name: userinfo.name, screenName: userinfo.screenName,email: userinfo.email,phoneNumber: userinfo.phoneNumber,registeredtype: registeredtype,allowsocialnetwork: registeredstatus,createdAt:userinfo.createdAt,actiondata:actiondata });*/

                systemUniqueKeyURL = '/admin/viewUserDetails/' + userinfo._id;
                var userDetailLink = '<a href=\'' + systemUniqueKeyURL + '\'>' + userinfo.userReference + '</a>';
                userfullname = userinfo.firstname + ' ' + userinfo.lastname;

                userData.push({ loopid: loopid, userReference: userDetailLink, name: userfullname, email: userinfo.email, phoneNumber: userinfo.phoneNumber, registeredtype: registeredtype, allowsocialnetwork: registeredstatus, createdAt: userinfo.createdAt });
                //userData.push({ loopid:loopid,userReference:userDetailLink, name: userinfo.name,email: userinfo.email,phoneNumber: userinfo.phoneNumber,createdAt:userinfo.createdAt });
              });
              var json = {
                sEcho: req.query.sEcho,
                iTotalRecords: totalrecords,
                iTotalDisplayRecords: totalrecords,
                aaData: userData
              };
              //sails.log.info("json data", json);
              res.contentType('application/json');
              res.json(json);


            }
          )
        });


      }
    )
  });




}

function maintenanceView(req, res) {
  return res.view("maintenance");
}


function updateUserNameDetails(req, res) {

  var paydetailID = req.param('paydetailID');
  var userID = req.param('payUserID');
  var name = req.param('name').trim();

  if (userID && paydetailID && name) {
    if ("undefined" === typeof name || name == '' || name == null) {
      var json = {
        status: 400,
        message: 'Invalid name input!'
      };
      res.contentType('application/json');
      res.json(json);
    }
    else {
      var usercriteria = {
        id: userID,
        isDeleted: false
      };

      User.findOne(usercriteria)
        .then(function (userdata) {

          var fullname = userdata.firstname + ' ' + userdata.lastname
          if (fullname.toLowerCase() != name.toLowerCase()) {

            var nameDetails = name.split(" ");
            userdata.firstname = nameDetails[0];
            userdata.lastname = nameDetails[1];
            userdata.save(function (err) {
              if (err) {
                var json = {
                  status: 400,
                  message: 'Failed to update user details!'
                };
                res.contentType('application/json');
                res.json(json);
              }

              UserConsent.update({ user: userID, paymentManagement: paydetailID }, { regneratestatus: 2 })
                .then(function (userconsentData) {

                  if (err) {
                    var json = {
                      status: 400,
                      message: 'Failed to update user details!'
                    };
                    res.contentType('application/json');
                    res.json(json);
                  }

                  var modulename = 'User name updated';
                  var modulemessage = 'User name updated successfully for user reference: ' + userdata.userReference;
                  req.logdata = {
                    userdata: userdata,
                    userID: userID,
                    paydetailID: paydetailID
                  };

                  sails.log.info("logdata::", req.logdata);
                  req.payID = paydetailID;
                  Logactivity.registerLogActivity(req, modulename, modulemessage);

                  ApplicationService
                    .reGeneratepromissorypdf(paydetailID, userID, req, res)
                    .then(function (loandocresponse) {

                      var json = {
                        status: 200,
                        name: name,
                        message: 'Updated user details successfully!'
                      };
                      res.contentType('application/json');
                      res.json(json);

                    })
                    .catch(function (err) {
                      var json = {
                        status: 400,
                        message: 'Invalid user!'
                      };
                      res.contentType('application/json');
                      res.json(json);
                    })


                });
            });
          }
          else {
            var json = {
              status: 400,
              message: 'Provided same name as input!'
            };
            res.contentType('application/json');
            res.json(json);
          }
        })
        .catch(function (err) {
          var json = {
            status: 400,
            message: 'Invalid user!'
          };
          res.contentType('application/json');
          res.json(json);
        })
    }
  }
  else {
    var json = {
      status: 400,
      message: 'Invalid user data!'
    };
    res.contentType('application/json');
    res.json(json);
  }
}

function updateAddressDetails(req, res) {

  var paydetailID = req.param('addressPayID');
  var userID = req.param('addressUserID');
  var changetype = req.param('changetype').trim();
  var addressdata = req.param('addressdata').trim();

  if (userID && paydetailID && changetype && addressdata) {
    if ("undefined" === typeof addressdata || addressdata == '' || addressdata == null) {
      var json = {
        status: 400,
        message: 'Invalid input!'
      };
      res.contentType('application/json');
      res.json(json);
    }
    else {
      var usercriteria = {
        id: userID,
        isDeleted: false
      };

      User.findOne(usercriteria)
        .then(function (userdata) {

          var allowupdate = 0;
          if (changetype == 'street' && userdata.street.toLowerCase() != addressdata.toLowerCase()) {
            allowupdate = 1;
          }

          if (changetype == 'city' && userdata.city.toLowerCase() != addressdata.toLowerCase()) {
            allowupdate = 1;
          }

          if (changetype == 'zipcode' && userdata.zipCode.toLowerCase() != addressdata.toLowerCase()) {
            allowupdate = 1;
          }

          if (allowupdate == 1) {
            if (changetype == 'street') {
              userdata.street = addressdata;
            }
            if (changetype == 'city') {
              userdata.city = addressdata;
            }
            if (changetype == 'zipcode') {
              userdata.zipCode = addressdata;
            }

            userdata.save(function (err) {
              if (err) {
                var json = {
                  status: 400,
                  message: 'Failed to update user details!'
                };
                res.contentType('application/json');
                res.json(json);
              }

              UserConsent.update({ user: userID, paymentManagement: paydetailID }, { regneratestatus: 2 })
                .then(function (userconsentData) {

                  if (err) {
                    var json = {
                      status: 400,
                      message: 'Failed to update user details!'
                    };
                    res.contentType('application/json');
                    res.json(json);
                  }

                  var modulename = 'User ' + changetype + ' updated';
                  var modulemessage = 'User ' + changetype + ' updated successfully for user reference: ' + userdata.userReference;
                  req.logdata = {
                    userdata: userdata,
                    changetype: changetype,
                    userID: userID,
                    paydetailID: paydetailID
                  };
                  req.payID = paydetailID;
                  Logactivity.registerLogActivity(req, modulename, modulemessage);

                  ApplicationService
                    .reGeneratepromissorypdf(paydetailID, userID, req, res)
                    .then(function (loandocresponse) {

                      var json = {
                        status: 200,
                        data: addressdata,
                        message: 'Updated user details successfully!'
                      };
                      res.contentType('application/json');
                      res.json(json);

                    })
                    .catch(function (err) {
                      var json = {
                        status: 400,
                        message: 'Invalid user!'
                      };
                      res.contentType('application/json');
                      res.json(json);
                    })


                });
            });
          }
          else {
            var json = {
              status: 400,
              message: 'Provided same input information!'
            };
            res.contentType('application/json');
            res.json(json);
          }
        })
        .catch(function (err) {
          var json = {
            status: 400,
            message: 'Invalid user!'
          };
          res.contentType('application/json');
          res.json(json);
        })
    }
  }
  else {
    var json = {
      status: 400,
      message: 'Invalid user data!'
    };
    res.contentType('application/json');
    res.json(json);
  }
}

function resetUserDetailsAction(req, res) {

  var userid = req.param('id');

  User
    .resetUserRelatedDetails(userid)
    .then(function (resetuserData) {

	  if(resetuserData.code == 403){
			  req.session.errormsg = '';
			  req.session.errormsg = resetuserData.message;
			  var redirectpath = "/admin/manageusers";
			  return res.status(200).redirect(redirectpath);
		  }

      var modulename = 'User account reset';
      var modulemessage = 'User account reset successfully';
      req.logdata = resetuserData;
      Logactivity.registerLogActivity(req, modulename, modulemessage);

      req.session.successmsg = '';
      req.session.successmsg = 'Successfully reset User';
      var redirectpath = "/admin/manageusers";
      return res.status(200).redirect(redirectpath);
    })
    .catch(function (err) {
      sails.log.error("Error Controller :: ", err);
      return res.handleError(err);
    })

}

function getallResetUsers(req, res) {

  var errorval = '';
  var successmsg = '';

  if (req.session.errormsg != '') {
    errorval = req.session.errormsg;
    req.session.errormsg = '';
  }
  if (req.session.successmsg != '') {
    successmsg = req.session.successmsg;
    req.session.successmsg = '';
  }
  res.view("admin/user/resetUserList", { errorval: errorval, successmsg: successmsg });

}

function ajaxManageResetUserlistAction(req, res) {

  var colS = "";

  if (req.query.sSortDir_0 == 'desc') {
    sorttype = -1;
  }
  else {
    sorttype = 1;
  }
  switch (req.query.iSortCol_0) {
    case '0': var sorttypevalue = { '_id': sorttype }; break;
    case '1': var sorttypevalue = { 'userReference': sorttype }; break;
    case '2': var sorttypevalue = { 'firstname': sorttype }; break;
    case '3': var sorttypevalue = { 'email': sorttype }; break;
    case '4': var sorttypevalue = { 'phoneNumber': sorttype }; break;
    case '5': var sorttypevalue = { 'registeredtype': sorttype }; break;
    case '6': var sorttypevalue = { 'allowsocialnetwork': sorttype }; break;
    case '7': var sorttypevalue = { 'practicemanagement.PracticeName': sorttype }; break;
    case '8': var sorttypevalue = { 'createdAt': sorttype }; break;
    case '10': var sorttypevalue = { 'lastname': sorttype }; break;
    case '11': var sorttypevalue = { 'underwriter': sorttype }; break;
    default: break;
  };


  if (req.query.sSearch) {

    if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID != '' && req.session.adminpracticeID != null) {
      var criteria = {
        or: [{ firstname: { 'contains': req.query.sSearch } }, { email: { 'contains': req.query.sSearch } }, { phoneNumber: { 'contains': req.query.sSearch } }, { addresses: { 'contains': req.query.sSearch } }, { createdAt: { 'contains': req.query.sSearch } }, { userReference: { 'contains': req.query.sSearch } }, { lastname: { 'contains': req.query.sSearch } }, { underwriter: { 'contains': req.query.sSearch } }],
        practicemanagement: req.session.adminpracticeID
      };
    }
    else {
      var criteria = {
        or: [{ firstname: { 'contains': req.query.sSearch } }, { email: { 'contains': req.query.sSearch } }, { phoneNumber: { 'contains': req.query.sSearch } }, { addresses: { 'contains': req.query.sSearch } }, { createdAt: { 'contains': req.query.sSearch } }, { userReference: { 'contains': req.query.sSearch } }, { lastname: { 'contains': req.query.sSearch } }, { underwriter: { 'contains': req.query.sSearch } }]
      };
    }

  }
  else {
    if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID != '' && req.session.adminpracticeID != null) {
      var criteria = {
        practicemanagement: req.session.adminpracticeID
      };
    }
    else {
      var criteria = {

      };
    }
  }


  Resetusers
    .find(criteria)
    .populate('practicemanagement')
    .sort(sorttypevalue)
    .then(function (userDetails) {

      sails.log.info('userDetails', userDetails);
      userDetails = _.filter(userDetails, function (item) {
        if (item.email != '' && item.email != null) {
          return true;
        }
      });

      totalrecords = userDetails.length;

      skiprecord = parseInt(req.query.iDisplayStart);
      checklimitrecords = skiprecord + parseInt(req.query.iDisplayLength);
      if (checklimitrecords > totalrecords) {
        iDisplayLengthvalue = parseInt(totalrecords);
      }
      else {
        iDisplayLengthvalue = parseInt(req.query.iDisplayLength) + parseInt(skiprecord);
      }

      userDetails = userDetails.slice(skiprecord, iDisplayLengthvalue);


      var userData = [];
      var userName = '';
      var userscreenName = '';
      var userfullname = '';
      var userEmail = '';
      var userphoneNumber = '';
      var userAddress = '';
      userDetails.forEach(function (userinfo, loopvalue) {
        loopid = loopvalue + skiprecord + 1;

        userinfo.createdAt = moment(userinfo.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');

        if ("undefined" === typeof userinfo.userReference || userinfo.userReference == '' || userinfo.userReference == null) {
          userinfo.userReference = '--';
        }

        if ("undefined" === typeof userinfo.firstname || userinfo.firstname == '' || userinfo.firstname == null) {
          userfullname = '--';
        }
        else {

          var usersfullname = userinfo.firstname + ' ' + userinfo.lastname;
        }


        if ("undefined" === typeof userinfo.email || userinfo.email == '' || userinfo.email == null) {
          userinfo.email = '--';
        }

        if ("undefined" === typeof userinfo.phoneNumber || userinfo.phoneNumber == '' || userinfo.phoneNumber == null) {
          userinfo.phoneNumber = '--';
        }

        if ("undefined" === typeof userinfo.address || userinfo.address == '' || userinfo.address == null) {
          userinfo.address = '--';
        }

        if ("undefined" === typeof userinfo.underwriter || userinfo.underwriter == '' || userinfo.underwriter == null) {
          userinfo.underwriter = '--';
        }

        /*&nbsp;&nbsp; <a href="/admin/deleteUserDetails/'+userinfo.id+'" onclick="return confirm(\'Are you sure?\')"><i class="fa fa-trash" aria-hidden="true" style="cursor:pointer;color:#FF0000;"></i></a>*/
        if (userinfo.isDeleted) {
          var actiondata = '<i class="fa fa-square-o icon-red" aria-hidden="true" style="cursor:pointer; color:red;" onclick="setUserStatus(\'' + userinfo.id + '\',\'inactive\');"></i>&nbsp;&nbsp; <a href="/admin/viewResetUserDetails/' + userinfo.id + '"><i class="fa fa-eye" aria-hidden="true" style="cursor:pointer;color:#337ab7;"></i></a>&nbsp;&nbsp; <a href="/admin/viewResetUserDetails/' + userinfo.id + '" onclick="return confirm(\'Are you sure want to reset user?\')"  class="blockdeleteuser"><i class="fa fa-trash" aria-hidden="true" style="cursor:pointer;color:#FF0000;"></i></a>';
        }
        else {
          var actiondata = '<i class="fa fa-check-square-o icon-green" aria-hidden="true" style="cursor:pointer; color:green;" onclick="setUserStatus(\'' + userinfo.id + '\',\'active\');"></i>&nbsp;&nbsp; <a href="/admin/viewResetUserDetails/' + userinfo.id + '"><i class="fa fa-eye" aria-hidden="true" style="cursor:pointer;color:#337ab7;"></i></a>&nbsp;&nbsp; <a href="/admin/viewResetUserDetails/' + userinfo.id + '" onclick="return confirm(\'Are you sure want to reset user?\')" class="blockdeleteuser"><i class="fa fa-trash" aria-hidden="true" style="cursor:pointer;color:#FF0000;"></i></a>';
        }

        if (userinfo.email) {
          var emillnk = '<a href="mailto:' + userinfo.email + '">' + userinfo.email + '</a>';
        }

        if (userinfo.registeredtype == "social") {
          var registeredtype = userinfo.socialnetworktype;
        }
        else {
          var registeredtype = userinfo.registeredtype;
        }

        if (userinfo.registeredtype == "social") {
          if (userinfo.allowsocialnetwork == 1) {
            var registeredstatus = 'Completed';
          }
          else {
            var registeredstatus = 'Incomplete';
          }
        }
        else {
          var registeredstatus = 'Completed';
        }


        if (userinfo.directMail == 1) {
          var directMailUser = 'Yes';
        }
        else if (userinfo.directMail == 2) {
          var directMailUser = 'No';
        }
        else {
          var directMailUser = '--';
        }

        if (userinfo.badList == 1) {
          var badListUser = 'Yes';
        }
        else if (userinfo.badList == 2) {
          var badListUser = 'No';
        }
        else {
          var badListUser = '--';
        }

        var practicename = '--';

        if (userinfo.practicemanagement) {
          if ("undefined" !== typeof userinfo.practicemanagement.PracticeName && userinfo.practicemanagement.PracticeName != '' && userinfo.practicemanagement.PracticeName != null) {
            var practicename = userinfo.practicemanagement.PracticeName;
          };
        }



        systemUniqueKeyURL = '/admin/viewResetUserDetails/' + userinfo.id;
        var userDetailLink = '<a href=\'' + systemUniqueKeyURL + '\'>' + userinfo.userReference + '</a>';
        userfullname = userinfo.firstname + ' ' + userinfo.lastname;

        userData.push({

	          loopid: loopid,
	          userReference: userDetailLink,
	          name: userfullname,
	          email: userinfo.email,
	          phoneNumber: userinfo.phoneNumber,
	          registeredtype: registeredtype,
	          allowsocialnetwork: registeredstatus,
	          practicename: practicename,
	          createdAt: userinfo.createdAt,
	          underwriter: userinfo.underwriter
        });

      });

      var json = {
	        sEcho: req.query.sEcho,
	        iTotalRecords: totalrecords,
	        iTotalDisplayRecords: totalrecords,
	        aaData: userData
      };
      res.contentType('application/json');
      res.json(json);

    });
}


function viewResetUserDetailsAction(req, res) {
  var errorval = '';
  var successmsg = '';
  if (req.session.errormsg != '') {
    errorval = req.session.errormsg;
    req.session.errormsg = '';
  }
  if (req.session.successmsg != '') {
    successmsg = req.
      session.successmsg;
    req.session.successmsg = '';
  }
  var userId = req.param('id');
  var criteria = { id: userId };

  Resetusers
    .findOne(criteria)
    .then(function (userdata) {

      var screen_id;
      var screentrackingdata = '';
      Screentracking
        .findOne({ user: userId, iscompleted: [0, 2] })
        .then(function (screentrackingdata) {
          if (screentrackingdata) {
            var screentrackingdata = screentrackingdata;
            var screen_id = screentrackingdata.id;
          } else {
            var screen_id = '';
          }

          PaymentManagement.find({ user: userId })
            .then(function (paymentmanagementdata) {

              var paymentmanagement = paymentmanagementdata[0];
              var loandata = [];
              var incompleteLoandata = [];

              if (paymentmanagement != '' && paymentmanagement != null && "undefined" !== typeof paymentmanagement) {
                var payment_id = paymentmanagementdata[0].id;
                var doccriteria = {
                  paymentManagement: payment_id
                };
              } else {
                var payment_id = 'Empty';
                var doccriteria = {
                  paymentManagement: screen_id
                };
              }

              if (paymentmanagementdata != '' && paymentmanagementdata != null && "undefined" !== typeof paymentmanagementdata) {

                _.forEach(paymentmanagementdata, function (data) {
                  if (data.achstatus != 4) {
                    var obj = {};
                    obj.id = data.id;
                    obj.loanReference = data.loanReference;
                    obj.payOffAmount = data.payOffAmount;
                    obj.maturityDate = moment(data.maturityDate).format("LL");
                    obj.createdAt = moment(data.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');
                    obj.achstatus = data.achstatus;
                    loandata.push(obj);
                  }
                })
                if (paymentmanagementdata[paymentmanagementdata.length - 1].achstatus === 2 || paymentmanagementdata[paymentmanagementdata.length - 1].achstatus === 4) {

                  if (screentrackingdata != '' && screentrackingdata != null && "undefined" !== typeof screentrackingdata) {
                    screentrackingdata.createdAt = moment(screentrackingdata.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');
                    incompleteLoandata.push(screentrackingdata);
                  }
                }

              } else {

                if (screentrackingdata != '' && screentrackingdata != null && "undefined" !== typeof screentrackingdata) {
                  screentrackingdata.createdAt = moment(screentrackingdata.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');
                  incompleteLoandata.push(screentrackingdata);
                }
              }


              loanExist = 0;
              _.forEach(paymentmanagementdata, function (payDetails) {
                if (payDetails.status != 'PAID OFF' && payDetails.achstatus != 2) {
                  loanExist = 1;
                }
                payDetails.maturityDate = moment(payDetails.maturityDate).format("LL");
                payDetails.nextPaymentSchedule = moment(payDetails.nextPaymentSchedule).format("LL");
                payDetails.createdAt = moment(payDetails.createdAt).format("LL");

                if (screentrackingdata) {
                  screentrackingdata.maturityDate = payDetails.maturityDate;
                  screentrackingdata.financedAmount = payDetails.payOffAmount;
                }

              });

              var doccriteria = {
                user: userId
              };
              Achdocuments
                .find(doccriteria)
                .populate('proofdocument')
                .then(function (documentdata) {
                  _.forEach(documentdata, function (documentvalue) {
                    if (documentvalue.proofdocument.isImageProcessed) {
                      if (documentvalue.proofdocument.standardResolution) {
                        documentvalue.proofdocument.standardResolution = Utils.getS3Url(documentvalue.proofdocument.standardResolution);
                      }
                    }
                  })

                  Account
                    .find({ user: userId })
                    .populate('userBankAccount')
                    .then(function (accountDetail) {

                      /*userdata.createdAt = moment(userdata.createdAt).format('LL');
                      userdata.updatedAt = moment(userdata.updatedAt).format('LL');*/

					  userdata.createdAt = moment(userdata.createdAt).tz("America/los_angeles").format('LL');
                      userdata.updatedAt = moment(userdata.updatedAt).tz("America/los_angeles").format('LL');

                      var usercriteria = { user_id: userId };

                      Useractivity
                        .find(usercriteria)
                        .then(function (activitydata) {

                          if (userdata.dateOfBirth) {
                            userdata.dateOfBirth = moment(userdata.dateOfBirth).format("MM/DD/YYYY");
                          }

                          var user_firstname = '';
                          var user_lastname = '';
                          if (userdata.name) {
                            var user_fullname = userdata.name;
                            if ("undefined" !== typeof user_fullname && user_fullname != '' && user_fullname != null) {
                              var nameDetails = user_fullname.split(" ");
                              var user_lastname = nameDetails[nameDetails.length - 1];

                              if (nameDetails.length > 2) {
                                var user_firstname = nameDetails[0];
                              }
                              else {
                                var user_firstname = nameDetails[0];
                              }
                            }
                          }

                          if (userdata.zipCode) {
                            userdata.zipCode = userdata.zipCode.slice(0, 5);
                          }

                          var transcriteria = { user: userId };
                          Transunions
                            .findOne(transcriteria)
                            .sort("createdAt DESC")
                            .then(function (transData) {


                              if ("undefined" === typeof transData || transData == '' || transData == null) {
                                var showtransData = 0;
                              }
                              else {
                                var showtransData = 1;

                                if (transData.credit_collection.subscriber) {
                                  var transcreditArray = transData.credit_collection;
                                  transData.credit_collection = [];
                                  transData.credit_collection.push(transcreditArray);
                                }

                                if (transData.inquiry.subscriber) {
                                  var transinquiryArray = transData.inquiry;
                                  transData.inquiry = [];
                                  transData.inquiry.push(transinquiryArray);
                                }

                                if (transData.addOnProduct.status) {
                                  var transproductArray = transData.addOnProduct;
                                  transData.addOnProduct = [];
                                  transData.addOnProduct.push(transproductArray);
                                }

                                if (transData.house_number.status) {
                                  var transhouseArray = transData.house_number;
                                  transData.house_number = [];
                                  transData.house_number.push(transhouseArray);
                                }

                                if (transData.trade.subscriber) {
                                  var transtradeArray = transData.trade;
                                  transData.trade = [];
                                  transData.trade.push(transtradeArray);
                                }
                                if(transData.response.product.subject.subjectRecord && transData.response.product.subject.subjectRecord.custom && transData.response.product.subject.subjectRecord.custom.credit) {
                                  if (!Array.isArray(transData.response.product.subject.subjectRecord.custom.credit.publicRecord)) {
                                    var transpublicrecordArray = transData.response.product.subject.subjectRecord.custom.credit.publicRecord;
                                    transData.publicrecord = [];
                                    transData.publicrecord.push(transpublicrecordArray);
                                  } else {
                                    transData.publicrecord = transData.response.product.subject.subjectRecord.custom.credit.publicRecord;
                                  }
                                }
                                var tradearr = [];

                              }
                              State.getExistingState()
                                .then(function (stateData) {

                                  Tradeclassifications
                                    .find()
                                    .then(function (tradeclasicDetail) {

                                      var IPFromRequest = req.headers['x-forwarded-for'] || req.connection.remoteAddress; //::ffff:192.168.1.107
                                      var indexOfColon = IPFromRequest.lastIndexOf(':');
                                      var ip = IPFromRequest.substring(indexOfColon + 1, IPFromRequest.length);
                                      var documenttype1 = sails.config.loanDetails.doctype1;
                                      var documenttype2 = sails.config.loanDetails.doctype2;
                                      var documenttype3 = sails.config.loanDetails.doctype3;

                                      var documenttype = {
                                        documenttype1: documenttype1,
                                        documenttype2: documenttype2,
                                        documenttype3: documenttype3,
                                      };

                                      incompleteLoandata = _.orderBy(incompleteLoandata, ['applicationReference'], ['asc']);
                                      loandata = _.orderBy(loandata, ['loanReference'], ['asc']);
                                      var name = userdata.firstname + ' ' + userdata.lastname;


                                      var rs = {
                                        user: userdata,
                                        name: name,
                                        errorval: errorval,
                                        successmsg: successmsg,
                                        achdocumentDetails: documentdata,
                                        ip: ip,
                                        userloandata: loandata,
                                        incompleteLoandata: incompleteLoandata,
                                        loancount: loandata.length,
                                        accountDetail: accountDetail,
                                        loanExist: loanExist,
                                        useractivitydata: activitydata,
                                        stateData: stateData,
                                        user_firstname: user_firstname,
                                        user_lastname: user_lastname,
                                        transData: transData,
                                        shwotransData: showtransData,
                                        tradearr: tradearr,
                                        documenttype: documenttype,
                                        screentrackingdata: screentrackingdata,
                                        payment_id: payment_id
                                      };

                                      res.view("admin/user/viewresetuserinfo", rs);

                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    })
    .catch(function (err) {
      sails.log.error('UserController#viewUserinfoDetails :: err :', err);
      return res.handleError(err);
    });

}

function changeMobile( req, res ) {

	var userid = req.param("userid");
	var userphone = req.param("userphone");

	if( !userid || !userphone ) {
		res.status( 400 ).json( { error: "userid and userphone arguments are required" } );
		return;
	}

	return User.changeMobileNumber( userid, userphone )
	.then( ( userdata ) => {
		sails.log.info("userdata : ", userdata);
		if(userdata) {
			res.status( 200 ).json( userdata );
			return;
		}
		throw new Error( "Unable to update user phone number!" );
	} )
	.catch( ( err ) => {
		sails.log.error("UserController #changeMobile::Error", err );
		res.status( err.code ).json( { error: err.message } );
		return;
	} );
}


function joinRoom( req, res ) {
	if( ! req.isSocket || ! req.session.userId ) {
		return res.badRequest();
	}

	var socketId = sails.sockets.getId( req );
	sails.log.verbose( "socketId:", socketId );
	sails.sockets.join( socketId, req.session.userId );
	// sails.sockets.broadcast( req.session.userId, "welcome", { socket: socketId, msg: "joined" } );
	return res.json( { success: true } );
}
