module.exports.twilioConfig = {
	getTwilioConfig: getTwilioConfig
};

function getTwilioConfig() {
	const twilioConfig = {
		token: "24d15c080008bf64523fb41e35e8ca56",
		accountId: "ACdd7b6b8eaa62311a7e0401de9bda3df0",
		verifySID: "VA19e7977dc0d1575b3e1eb5f5d02ba7fb",
		createVerificationUrl: "",
		twilioBaseUrl: "https://verify.twilio.com/v2/Services",
		isEnabled: false
	};
	twilioConfig.createVerificationUrl = `${twilioConfig.twilioBaseUrl}/${twilioConfig.verifySID}/Verifications`;

	if( process.env.NODE_ENV === "staging" ) {
		twilioConfig.isEnabled = false;
	} else if( process.env.NODE_ENV === "production" ) {
		twilioConfig.isEnabled = true;
	} else {
		twilioConfig.isEnabled = false;
	}

	return twilioConfig;
}
