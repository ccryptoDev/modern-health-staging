"use strict";

var config = sails.config,
  authyConfig = config.authy,
  authy = require('authy')(authyConfig.apiKey, authyConfig.getAuthyUrl()),
  Q = require('q');

var twilio = require('twilio');
var twilioclient = new twilio(authyConfig.accountSid, authyConfig.accountAuthtoken);

module.exports = {
  initTwoFactorAuth: initTwoFactorAuth,
  verificationUser: verificationUser,
  sendSMSMessage: sendSMSMessage,
};

function initTwoFactorAuth(user, data) {
  return Q.promise(function (resolve, reject) {
							 
		
		sails.log.info("data.phoneNumber: ", data.phoneNumber);
		sails.log.info("authyConfig.countryCode: ", authyConfig.countryCode);

     authy.phones().verification_start(data.phoneNumber, authyConfig.countryCode, {
        via: authyConfig.via,
        locale: authyConfig.locale
      },
      function (err, res) {
        if (err) {

          sails.log.error("UserRegistrationService#initTwoFactorAuth :: Error :: ", err);
          return reject(authyErrorHandler(err))

        }
        sails.log.info("UserRegistrationService#initTwoFactorAuth :: Authy Response :: ", res);

        return resolve();
      });
  });
}

function verificationUser(user, data) {
  return Q.promise(function (resolve, reject) {
    authy.phones().verification_check(data.phoneNumber, authyConfig.countryCode, data.verificationCode,
      function (err, res) {
        if (err) {
          sails.log.error("Authy Error :", err);
          return reject(authyErrorHandler(err));
        }

        sails.log.error("Authy Response :", res);
        return resolve(res);

      });
  });
}

function authyErrorHandler(err) {
  switch (err.error_code) {

    case '60023':
      return {
        code: 404,
        message: 'PHONE_VERIFICATION_ERROR'
      };

    case  '60022':

      return {
        code: 401,
        message: 'VERIFICATION_CODE_ERROR'
      };
    case  '60021':

      return {
        code: 403,
        message: 'VERIFICATION_CODE_CREATE_ERROR'
      };
    case  '60002' :

      return {
        code: 402,
        message: 'INVALID_REQUEST_ERROR'
      };
    default:

      return {
        code: 400,
        message: 'INVALID_REQUEST_ERROR'
      };
  }

}

function sendSMSMessage(data) {
  return Q.promise(function (resolve, reject) {
		
	 if ("undefined" !== typeof data.userId && data.userId!='' && data.userId!=null)
	 {
	     var usercriteria ={id: data.userId};
	 	 User.findOne(usercriteria)
		  .then(function(userdata) {
				
				if (!userdata) 
				{
					sails.log.error("Invalid usedatar :", err);
					return resolve({'code':400});
				}
				else
				{
					if ("undefined" !== typeof userdata.phoneNumber && userdata.phoneNumber!='' && userdata.phoneNumber!=null)
					{
						if(userdata.isPhoneVerified)
						{
							var tophoneNumber='+1'+userdata.phoneNumber;
							
							sails.log.info("phoneNumber: ", tophoneNumber);
							sails.log.info("clientPhoneNumber: ", authyConfig.clientPhoneNumber);
							
							twilioclient.messages.create({
								body: data.message,
								to: tophoneNumber,  
								from: authyConfig.clientPhoneNumber
							})
							.then(function ( message) {
								 /*if (err) {
								  sails.log.error("Twilio Error :", err);
								  return resolve({'code':400});
								 }*/
								 sails.log.info("message Details: ",message);
								 sails.log.info("message sid: ",message.sid);
								 								 
								 if(message.sid)
								 {
									 return resolve({'code':200});
								 }
								 else
								 {
									 return resolve({'code':400});
								 }
							}); 
						}
						else
						{
							sails.log.error("Twilio Error : Phone number not verified yet");
							return resolve({'code':400});
						}
					}
					else
					{
						sails.log.error("Twilio Error : Phone number not added yet");
						return resolve({'code':400});
					}
				 }
		   })
		   .catch(function(err) {
				sails.log.error("Invalid user :", err);
				return resolve({'code':400});		   
		   });
	   }
	   else
	   {
			sails.log.error("Twilio Error : Invalid user data");
			return resolve({'code':400});	  
	   }
  });
}
