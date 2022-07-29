"use strict";
const sails = require('sails');

const prodConfig = require(`./env/production`);
const prodApiKey = (prodConfig && prodConfig.sandGridApiKey);
const currentEnv = sails.config["environment"];
const currentEnvConfig = require(`./env/${currentEnv}`);
const ApiKey = (currentEnvConfig && currentEnvConfig.sandGridApiKey) || prodApiKey;

if(!ApiKey || typeof ApiKey !== "string")
    throw new Error(`Sendgrid API key is required!`);

const SendGridMailer = require('@sendgrid/mail')
	.setApiKey(ApiKey);
const nodemailer = require( "nodemailer" );

const SENDGRID_USER = "NickCurry1";
const SENDGRID_PASSWORD = "P4Q24H123";

const SENDGRID_EMAIL = "no-reply@modernhealthfinance.com";
const SENDGRID_DISPLAY_NAME = "Modern Health Finance";

module.exports.mailer = {
	hostName: getHostName(),
	sender: `${SENDGRID_DISPLAY_NAME} <${SENDGRID_EMAIL}>`,
	email_id: "no-reply@modernhealthfinance.com",

	/*
	 * Contact account ()
	 */
	contactAccount: {
		sendMail(mailOptions, cb) {
			SendGridMailer
				.send(mailOptions)
				.then((result) => cb(null, result))
				.catch((error) => cb(error, null));
		}
	},
	// unused
	transporter: nodemailer.createTransport( {
		service: "SendGrid",
		auth: {
			user: SENDGRID_USER,
			pass: SENDGRID_PASSWORD
		}
	} )
};

function getHostName() {
	if( process.env.NODE_ENV === "development" ) {
		return "https://modern-health.alchemylms.com";
	} else if( process.env.NODE_ENV === "staging" ) {
		return "https://modern-health.alchemylms.com";
	} else if( process.env.NODE_ENV === "uat" ) {
		return "https://apply.modernhealthfinance.com";
	} else {
		return "https://apply.modernhealthfinance.com";
	}
}
