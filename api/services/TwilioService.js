"use strict";

    var _ = require("lodash"),
    Twilio = require("twilio");

module.exports = {
    startPhoneVerification:startPhoneVerification,
    verifyCode: verifyCode
};

function startPhoneVerification(phone) {
    return new Promise((resolve, reject) => {

        const numberToUse = cleanPhoneNumber(phone);
        if (!numberToUse) {
            reject({message: `'${phone}' is not a recognized phone format`})
        }
        const twilioConfig = sails.config.twilioConfig.getTwilioConfig();
        if (!twilioConfig.isEnabled) {
            resolve({sid: ""})
        } else {
            const client = new Twilio(twilioConfig.accountId, twilioConfig.token);

            client.verify.services(twilioConfig.verifySID)
                .verifications
                .create({to: numberToUse, channel: 'sms'})
                .then((verification) => {
                    resolve({sid: verification.sid, checkStatusUrl: verification.url})
                }).catch((errorObj) => {
                sails.log.error("TwilioService#startPhoneVerification :: err", errorObj);
                const errors = errorObj.message;
                sails.log.error("TwilioService#startPhoneVerification :: err", errors);
                if(errorObj.status ===400) {
                    errorObj.message = "The phone number you have entered is either invalid or not a mobile number."
                }
                reject(errorObj);
            });
            // for testing
             //resolve({sid: "test", checkStatusUrl: "testurl"});
        }
    });
}

function verifyCode(verificationCode, phoneNumber) {

    return new Promise((resolve, reject) => {
        const twilioConfig = sails.config.twilioConfig.getTwilioConfig();
        if (!verificationCode) {
            reject({message: "No verification was entered"});
        }
        const numberToUse = cleanPhoneNumber(phoneNumber);
        if (!numberToUse) {
            reject({message:`'${phoneNumber}' is not a recognized format`})
        }
        if (!twilioConfig || !twilioConfig.verifySID) {
            reject({message: "This configuration to verify code is missing."});
        }

        const client = new Twilio(twilioConfig.accountId, twilioConfig.token);
        client.verify.services(twilioConfig.verifySID)
            .verificationChecks
            .create({to: numberToUse, code: verificationCode})
            .then((verification) => {
                if (verification && !!verification.status && verification.status === "approved") {
                    resolve(verification);
                } else {
                    reject({message: "Invalid Verification Code"});
                }
            }).catch((errorObj) => {
            sails.log.error("TwilioService#verifyCode :: err", errorObj);
            const errors = errorObj.message;
            sails.log.error("TwilioService#verifyCode :: err", errors);
            reject(errorObj);
        });
        // for testing
        // resolve({status: "approved"});

    });
}

function cleanPhoneNumber(phoneString) {
    if(!phoneString) {
       //throw Exception('Phone number does not exist.');
        return null;
    }
    const cleanPhoneString = phoneString.toString().replace( /[^\d]/g, "" );
    const allDigits = /^\d{10}$/.test( cleanPhoneString );
    if( !allDigits ) {
       // throw Exception(`'${phoneString}' is not a recognized format`);
        return null;
    }
    return `+1${cleanPhoneString}`
}
