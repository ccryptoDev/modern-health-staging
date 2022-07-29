"use strict";

module.exports.routes = {
	"get /": {
		controller: "HomeController",
		action: "apply"
	},
	"GET /login": { controller: "HomeController", action: "willLogin" },
	"POST /login": { controller: "HomeController", action: "login" },
	"get /signupstart": {
		controller: "HomeController",
		action: "signupStart"
	},
	"get /userinformationfull": {
		controller: "HomeController",
		action: "userinformationfull"
	},
	"post /userinformationfull": {
		controller: "HomeController",
		action: "userinformationfull"
	},
	"post /userinformationfulldata": {
		controller: "HomeController",
		action: "userinformationfullform"
	},
	"post /userinfofullmanualdata": {
		controller: "HomeController",
		action: "userinformationfullmanual"
	},
	"post /userinformation": {
		controller: "HomeController",
		action: "userinformation"
	},
	"get /register": {
		controller: "HomeController",
		action: "register"
	},
	"get /financeinformation": {
		controller: "HomeController",
		action: "financeinformation"
	},
	"post /financeinformationdata": {
		controller: "HomeController",
		action: "financeinformationdata"
	},
	"GET /myoffers": {
		controller: "HomeController",
		action: "applicationoffer"
	},
	"get /applicationoffer": {
		controller: "HomeController",
		action: "applicationoffer"
	},
	"post /saveapplicationoffer": {
		controller: "HomeController",
		action: "saveapplicationoffer"
	},
	"post /loanofferdetails": {
		controller: "HomeController",
		action: "loanofferdetails"
	},
	"get /loanpromissorynote": {
		controller: "HomeController",
		action: "loanpromissorynote"
	},
	"post /createloanpromissorypdf": {
		controller: "HomeController",
		action: "createloanpromissorypdf"
	},
	"get /createloanapplication": {
		controller: "HomeController",
		action: "createloanapplication"
	},
	"get /loansuccess": {
		controller: "HomeController",
		action: "loansuccess"
	},
	"get /loanfailure": {
		controller: "HomeController",
		action: "loanfailure"
	},
	"get /sessiontimeout": {
		controller: "HomeController",
		action: "sessionTimeout"
	},
	"get /controlcenter": {
		controller: "HomeController",
		action: "controlcenter"
	},
	"get /setpassword/:id": {
		controller: "HomeController",
		action: "setpassword"
	},
	"post /searchbank": {
		controller: "HomeController",
		action: "autocompleteBankname"
	},
	"post /updatepassword": {
		controller: "HomeController",
		action: "updatepassword"
	},
	"get /dashboard": {
		controller: "HomeController",
		action: "dashboard"
	},
	/* Coborrower */
	"get /cosignupstart": {
		controller: "HomeController",
		action: "cosignupstart"
	},
	"post /couserinformation": {
		controller: "ApplicationController",
		action: "couserinformation"
	},
	"post /couserinformationfull": {
		controller: "ApplicationController",
		action: "couserinformationfull"
	},
	"post /cofinancialinfomation": {
		controller: "ApplicationController",
		action: "cofinancialinfomation"
	},
	"get /forgotpassword": {
		controller: "HomeController",
		action: "forgotpassword"
	},
	"post /sendforgotpassword": {
		controller: "ApplicationController",
		action: "sendforgotpassword"
	},
	"get /usersetpassword/:id": {
		controller: "ApplicationController",
		action: "usersetpassword"
	},
	"GET /user/confirm/set-password/:id": { controller: "ApplicationController", action: "confirmUserSetPassword" },
	"POST /user/confirm/set-password/:id": { controller: "ApplicationController", action: "confirmUserSetPasswordPost" },
	"post /updateuserpassword": {
		controller: "ApplicationController",
		action: "updateuserpassword"
	},
	"post /savechangepassword": {
		controller: "ApplicationController",
		action: "savechangepassword"
	},
	"post /receivenotifi": {
		controller: "ApplicationController",
		action: "receivenotifi"
	},
	"post /uploadAvatar": {
		controller: "ApplicationController",
		action: "uploadAvatar"
	},
	"get /profileEmailverification": {
		controller: "HomeController",
		action: "profileEmailVerification"
	},
	"get /profileEmailverify/:id": {
		controller: "HomeController",
		action: "profileEmailverify"
	},
	"post /uploaddropfiles": {
		controller: "ApplicationController",
		action: "uploaddropfiles"
	},
	"get /downloadconsentpdf": {
		controller: "HomeController",
		action: "downloadconsentpdf"
	},
	/* ************ Profile ************ */
	"get /editprofile": {
		controller: "HomeController",
		action: "editprofile"
	},
	"get /chatsupport": {
		controller: "HomeController",
		action: "chatsupport"
	},
	"get /contactus": {
		controller: "HomeController",
		action: "contactus"
	},
	"get /privacypolicy": {
		controller: "HomeController",
		action: "privacypolicy"
	},
	"get /termsconditions": {
		controller: "HomeController",
		action: "termsconditions"
	},
	"get /californiaconsumer": {
		controller: 'HomeController',
		action: "californiaConsumerPrivacyActNotice"
	},
	"get /userlogout": {
		controller: "HomeController",
		action: "userlogout"
	},
	"GET /logout": {
		controller: "HomeController",
		action: "logout"
	},
	"GET /practicehome": {
		controller: "HomeController",
		action: "practicehome"
	},
	"post /loanamountconfirm": {
		controller: "HomeController",
		action: "loanamountconfirm"
	},
	"post /clicktosave": {
		controller: "HomeController",
		action: "clicktosave"
	},
	"post /onclicktosave": {
		controller: "HomeController",
		action: "onclicktosave"
	},
	"GET /apply": {
		controller: "HomeController",
		action: "apply"
	},
	"POST /apply": {
		controller: "HomeController",
		action: "applyPost"
	},
	"GET /skipBankLogin": {
		controller: "HomeController",
		action: "skipBankLogin"
	},
	"POST /createuser": {
		controller: "HomeController",
		action: "addUser"
	},
	"GET /userAlreadyExists": {
		controller: "HomeController",
		action: "alreadyExists"
	},
	"get /searchpractice": {
		controller: "HomeController",
		action: "searchpractice"
	},
	"post /searchpractice": {
		controller: "HomeController",
		action: "searchpractice"
	},
	"get /applysearch": {
		controller: "HomeController",
		action: "applysearch"
	},
	"post /applysearch": {
		controller: "HomeController",
		action: "applysearch"
	},
	"get /addprovider": {
		controller: "HomeController",
		action: "addprovider"
	},
	"post /addnewprovider": {
		controller: "HomeController",
		action: "addnewprovider"
	},
	"get /providersuccess": {
		controller: "HomeController",
		action: "providersuccess"
	},
	"post /setSelectedPractice": {
		controller: "HomeController",
		action: "setSelectedPractice"
	},
	"get /paymentcalculator": {
		controller: "HomeController",
		action: "paymentcalculator"
	},
	"post /estimatemonthlypay": {
		controller: "HomeController",
		action: "estimatemonthlypay"
	},
	"post /continueApplication": {
		controller: "HomeController",
		action: "continueApplication"
	},
	"post /saveSignature": {
		controller: "EsignatureController",
		action: "saveSignature"
	},
	"post /updateuserAnticipatedAmount": {
		controller: "HomeController",
		action: "updateuserAnticipatedAmount"
	},
	"post /updateuseremail": {
		controller: "HomeController",
		action: "updateUserEmail"
	},
	"post /employmentHistory/:id": {
		controller: "AchController",
		action: "updateEmployee"
	},
	"get /sendverificationemail/:id": {
		controller: "HomeController",
		action: "sendverificationemail"
	}
};
