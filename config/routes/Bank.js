"use strict";

module.exports.routes = {
	"get /banktransaction": {
		controller: "BankController",
		action: "getbanktransaction"
	},
	"get /addbank/banktransaction": {
		controller: "BankController",
		action: "addBankTransaction",
		addbankWorkflowStep: 3
	},
	"get /addbank/savebankdata": {
		controller: "BankController",
		action: "addBankTransaction",
		addbankWorkflowStep: 4
	},
	"post /saveplaiddetails": {
		controller: "BankController",
		action: "saveplaiddetails"
	},
	"post /updateUserdataPlaid": {
		controller: "BankController",
		action: "updateUserdataPlaid"
	},
	"post /saveplaidresponse": {
		controller: "BankController",
		action: "saveplaidresponse"
	},
	"post /saveplaidresponseerror": {
		controller: "BankController",
		action: "savePlaidResponseError"
	},
	"post /savebankinfo": {
		controller: "BankController",
		action: "savebankinfo"
	},
	"GET /addbank/login/:id": {
		controller: "BankController",
		action: "addbanklogin",
		addbankWorkflowStep: 1
	},
	"POST /addbank/authenticate": {
		controller: "BankController",
		action: "addbankloginpost",
		addbankWorkflowStep: 2
	},
	"GET /addbank/consents": {
		controller: "BankController",
		action: "addbankGetConsent",
		addbankWorkflowStep: 5
	},
	"GET /addbank/saveconsent/:accountid": {
		controller: "BankController",
		action: "addbankSaveConsent",
		addbankWorkflowStep: 6
	},
	"GET /addbank/thankyou": {
		controller: "BankController",
		action: "addbankThankyou",
		addbankWorkflowStep: 7
	},
	"post /admin/changeBank/:id": {
		controller: "BankController",
		action: "changeBank"
	},
	"post /admin/repullPlaidInfo": {
		controller: "BankController",
		action: "repullPlaidInfo"
	},
	"post /admin/getrepullPlaidDetails": {
		controller: "BankController",
		action: "getrepullPlaidDetails"
	}
};
