"use strict";

const transunion = {
	baseUrl: "https://netaccess-test.transunion.com/",
	mode: "sandbox",
	industryCode: "F",
	memberCode: "04851442",
	prefixCode: "0622",
	password: "D555",
	keyPassword: "alchemy123",
	env: "standardTest",
	version: "2.21",
	productCode: "07000",
	// addOnProduct: { code: "00W18", scoreModelProduct: "true" },
	certificate: { crtPath: "MODERNA3.pem", keyPath: "MODERNA3Key.pem", password: "admin213" }
};

if( process.env.NODE_ENV == "production" ) {
	transunion.baseUrl = "https://netaccess.transunion.com/";
	transunion.memberCode = "06074650";
	transunion.prefixCode = "1201";
	transunion.password = "A1T5";
	transunion.env = "production";
	transunion.mode = "production";
}

module.exports.transunion = transunion;
