/* global sails, PracticeManagement, Agreement, EmailService, LoanSettings, LoanCreditTier, Loaninterestrate */
'use strict';

var request = require('request'),
Q = require('q'),
_ = require('lodash'),
moment = require('moment');
var request = require('request'), moment = require('moment');
var fs = require('fs');
const path = require('path');
// const ProductRules = require('../models/ProductRules');
// const ProductRules = require('../models/ProductRules');
// const ProductRules = require('../models/ProductRules');
// const ProductRules = require('../models/ProductRules');
// const LoanCreditTier = require('../models/LoanCreditTier');
// const LoanCreditTierList = require('../models/LoanCreditTierList');
//var stripe = require("stripe")("sk_test_rwcNedmgXTuf1hqd1Nr07JE6");
//var stripe = require("stripe")("sk_test_JE2NI92frzEP07QHlHjycVN2");
var stripe = require("stripe")(sails.config.stripeSecretKey);

module.exports = {
  addRule: addRule,
  editCreditTierSettings: editCreditTierSettingsAction,
  addBtrSetting: addBtrSetting,
  deletesetting: deletesetting,
  editCreditRangePracticeSettings: editCreditRangePracticeSettingsAction,
  practiceList: practiceListAction,
  practiceSettings: practiceSettingsAction,
  practiceAdminList: practiceAdminListAction,
  createpractice:createpracticeAction,
  createsettings:createsettingsAction,
  addnewpractice: addnewpractice,
  editpracticesetting: editpracticesetting,
  addnewsetting: addnewsetting,
  ajaxpracticeList:ajaxpracticeListAction,
  ajaxpracticeSettingsList:ajaxpracticeSettingsListAction,
  editpractice:editpracticeAction,
  editsetting: editsettingAction,
  updatepractice: updatepracticeAction,
  ajaxpracticeAdminUserList:ajaxpracticeAdminUserListAction,
  addPracticeAdmin:addPracticeAdminAction,
  addnewpracticeAdminUser:addnewpracticeAdminUserAction,
  editpracticeadminuser:editpracticeadminuserAction,
  updatepracticeAdminUser:updatepracticeAdminUserAction,
  autoFillingUniversity: autoFillingUniversityAction,
  getschoolBranch:getschoolBranchAction,
  startPractice:startPracticeAction,
  practiceinformation: practiceinformationAction,
  addprocedcures: addprocedcuresAction,
  resendinvite: resendinvite,
  updatepracticeinfo: updatepracticeinfoAction,
  addlendermerchantfees: addlendermerchantfeesAction,
	createprocedure: createprocedureAction,
	deleteprocedure: deleteprocedureAction,
	updateprocedure: updateprocedureAction,
  getmerchantfeetemplate:getmerchantfeetemplateAction,
  getvendorinterestrate:getvendorinterestrateAction,
  addstaffmembers:addstaffmembersActtion,
  getstaffmembers:getstaffmembersAction,
  addfinancialinformation:addfinancialinformationAction,
  checkpracticeurl:checkpracticeurlAction,
  viewpracticedetails:viewpracticedetailsAction,
	practicesettingEdit: practicesettingEditAction,
	pfiArchiveReport: pfiArchiveReport,
	ajaxGetCurrentLoggedInPractice:ajaxGetCurrentLoggedInPractice,
	editCreditTier: editCreditTierAction,
	editCreditRange: editCreditRangeAction, 
	editProductRule: editProductRuleAction, 
	addProductRule: addProductRuleAction,
	addBankTransactionRule: addBankTransactionRule
};

const defaultRules = [
	{
		ruleid: "r1",
		description: "Months of Credit History (Month)",
		declinedif: "lt",
		value: 12,
		disabled: false
	},
	{
		ruleid: "r2",
		description: "Number of active trade lines",
		declinedif: "lt",
		value: 1,
		disabled: false
	},
	{
		ruleid: "r3",
		description: "Number of revolving trade lines",
		declinedif: "lt",
		value: 0,
		disabled: false
	},
	{
		ruleid: "r4",
		description: "# Inquiries in last 6 mos",
		declinedif: "gt",
		value: 8,
		disabled: false
	},
	{
		ruleid: "r5",
		description: "BK in last 24 mos?",
		declinedif: "gt",
		value: 0,
		disabled: false
	},
	{
		ruleid: "r6",
		description: "Foreclosure in last 24 mos?",
		declinedif: "gt",
		value: 0,
		disabled: false
	},
	{
		ruleid: "r7",
		description: "# public records in last 24 months",
		declinedif: "gt",
		value: 5,
		disabled: false
	},
	{
		ruleid: "r8",
		description: "#Of trades with #60+DPD in past 24 months",
		declinedif: "gt",
		value: 4,
		disabled: true
	},
	{
		ruleid: "r9",
		description: "#Of trades with #60+DPD in past 6 months",
		declinedif: "gt",
		value: 2,
		disabled: true
	},
	{
		ruleid: "r10",
		description: "Utilization of Revolving trades",
		declinedif: "gt",
		value: 0.9,
		disabled: true
	},
	{
		ruleid: "r11",
		description: "Minimum Credit Score",
		declinedif: "lt",
		value: 450,
		disabled: true
	},
	{
		ruleid: "r12",
		description: "Pre-DTI",
		declinedif: "gt",
		value: 20,
		disabled: true
	},
	{
		ruleid: "r13",
		description: "Minimum Specified Monthly Income",
		declinedif: "lte",
		value: 1500,
		disabled: false
	},
	{
		ruleid: "r14",
		description: "Number of Derogatory Active Trades",
		declinedif: "gt",
		value: 3,
		disabled: false
	},
	{
		ruleid: "r15",
		description: "Combination Rule R7+R14",
		declinedif: "gt",
		value: 5,
		disabled: false
	},
	{
		ruleid: "r16",
		description: "FXI Score",
		declinedif: "gt",
		value: 20,
		disabled: false
	}
];

function createBTRTemplate ( practiceID ) {
	const BTRTemplate = {
		practicemanagement: practiceID,
		isDeleted: false,
		version: 1,
		rules: [
			{ // BTR 1
				code: 'BTR1',
				text: "Average income in 6 months",
				condition: "lt",
				value: 600,
				disabled: false
			},
			{ // BTR 2
				code: 'BTR2',
				text: "NSF transactions in a month",
				condition: "gt",
				value: 0,
				disabled: false
			},
			{ // BTR 3
				code: 'BTR3',
				text: "NSF transactions in 3 months",
				condition: "gt",
				value: 600,
				disabled: false
			},
			{ // BTR 4
				code: 'BTR4',
				text: "Average balance in 6 months",
				condition: "lt",
				value: 400,
				disabled: false
			},
			{ // BTR 5
				code: 'BTR5',
				text: "Current balance",
				condition: "lt",
				value: 200,
				disabled: false
			},
			{ // BTR 6
				code: 'BTR6',
				text: "Balance from all depository bank accounts",
				condition: "lt",
				value: 50,
				disabled: false
			},
			{ // BTR 7
				code: 'BTR7',
				text: "Average balance from depository accounts in 3 months",
				condition: "lt",
				value: 200,
				disabled: false
			},
			{ // BTR 8
				code: 'BTR8',
				text: "Total income in 6 months",
				condition: "lt",
				value: 1000,
				disabled: false
			},
			{ // BTR 9
				code: 'BTR9',
				text: "Days since oldest transaction",
				condition: "lt",
				value: 100,
				disabled: false
			},
			{ // BTR 10
				code: 'BTR10',
				text: "Average most recent available balance",
				condition: "lt",
				value: -1000,
				disabled: false
			},
			{ // BTR 11
				code: 'BTR11',
				text: "Ratio of time in days from primary checking account having no activity",
				condition: "gt",
				value: 10,
				disabled: false
			},
			{ // BTR 12
				code: 'BTR12',
				text: "Total spending related transactions in the past 30 days",
				condition: "lt",
				value: 500,
				disabled: false
			},
			{ // BTR 13
				code: 'BTR13',
				text: "Total payment related transaction in past 3 months",
				condition: "lt",
				value: 50,
				disabled: false
			},
			{ // BTR 14
				code: 'BTR14',
				text: "Total ATM fee related transactions in the past 3 months",
				condition: "gt",
				value: 1000,
				disabled: false
			}
		]
	};
	return BTRTemplate;
}

function deletesetting (req, res) {
	const id = req.param('id');
	PracticeSetting.destroy({ id: id }).exec(() => {
		req.session.Practicesuccessmsg = "Rule deleted successfully!";
		return res.redirect( "/admin/practicesettings");
	})
}

function addRule (req, res) {
	const settingId = req.param("id");
	const ruleIdx = parseInt(req.param('ruleSelector'))
	PracticeSetting.findOne({ id: settingId }).then((setting) => {
		setting.productRules[ruleIdx - 1].declinedif = req.param("ruleCondition") || setting.productRules[ruleIdx].declinedif;
		setting.productRules[ruleIdx - 1].value = req.param("ruleValue") || setting.productRules[ruleIdx].value;
		setting.productRules[ruleIdx - 1].disabled = req.param("ruleDisabled") || setting.productRules[ruleIdx].disabled;

		PracticeSetting.update({ id: settingId }, { productRules: setting.productRules }).exec(() => {
			req.session.Practicesuccessmsg = "Rule added successfully!";
			return res.redirect( "/admin/editsettings/" + settingId );
		});
	});
}

function addBtrSetting (req, res) {
	const settingId = req.param("id");
	const ruleIdx = parseInt(req.param('btrSelector'))
	PracticeSetting.findOne({ id: settingId }).then((setting) => {
		setting.btrs.rules[ruleIdx - 1].condition = req.param("btrCondition") || setting.btrs.rules[ruleIdx].declinedif;
		setting.btrs.rules[ruleIdx - 1].value = req.param("btrValue") || setting.btrs.rules[ruleIdx].value;
		setting.btrs.rules[ruleIdx - 1].disabled = req.param("btrDisabled") || setting.btrs.rules[ruleIdx].disabled;

		PracticeSetting.update({ id: settingId }, { btrs: setting.btrs }).exec(() => {
			req.session.Practicesuccessmsg = "Rule added successfully!";
			return res.redirect( "/admin/editsettings/" + settingId );
		});
	});
}

function practiceSettingsAction(req, res){
	var errorval = '';
	var successval = '';

	if(req.session.Practiceerrormsg!=''){
		errorval =req.session.Practiceerrormsg;
		req.session.Practiceerrormsg = '';
	}

	if(req.session.Practicesuccessmsg!=''){
		successval =req.session.Practicesuccessmsg;
		req.session.Practicesuccessmsg = '';
	}

	var responsedata = {
	  approveerror:errorval,
	  approvesuccess:successval
	};

	// PFI-35; prevent practice admins from seeing the other practices and/or other (super)admin-related functions for all practices
	if( req.session.rolename === "PracticeAdmin" ) {
		return res.redirect( "/admin/dashboard" );
	}

	return res.view("admin/practice/practiceSettings", responsedata);
}

function practiceListAction(req, res){
		var errorval = '';
		var successval = '';

		if(req.session.Practiceerrormsg!=''){
			errorval =req.session.Practiceerrormsg;
			req.session.Practiceerrormsg = '';
		}

		if(req.session.Practicesuccessmsg!=''){
			successval =req.session.Practicesuccessmsg;
			req.session.Practicesuccessmsg = '';
		}

		var responsedata = {
		  approveerror:errorval,
		  approvesuccess:successval
		};

		// PFI-35; prevent practice admins from seeing the other practices and/or other (super)admin-related functions for all practices
		if( req.session.rolename === "PracticeAdmin" ) {
			return res.redirect( "/admin/dashboard" );
		}

		return res.view("admin/practice/practiceList", responsedata);
}

function createsettingsAction(req, res){
	const rules = defaultRules;
	rules.forEach(rule => {
		rule.ruleid = rule.ruleid.toUpperCase();
		switch (rule.declinedif) {
			case "lt":
				rule.declinedmessage = "Less than " + rule.value;
				break;
			case "gt":
				rule.declinedmessage = "Greather than " + rule.value;
				break;
			case "gte":
				rule.declinedmessage = "Greather than or equal to " + rule.value;
				break;
			case "lte":
				rule.declinedmessage = "Less than or equal to " + rule.value;
				break;
			default:
				break;
		}
	});
	const btrs = createBTRTemplate('');
	PracticeSetting.findOne({ isDefault: true }).then((practiceSetting) => {
		return res.view("admin/practice/createsettings", { rules: rules, defaultExists: !!practiceSetting, btrs });
	});
}

function createpracticeAction(req, res){
   	State
	.getExistingPracticeState()
	.then(function (states) {

		 if ("undefined" !== typeof req.param('providerid') && req.param('providerid') != '' && req.param('providerid') != null)
		 {
			 var providerId = req.param('providerid');
			 Provider
			 .findOne({id:providerId})
			 .then(function(providerData){
				PracticeSetting.find().then((practiceSettings) => {
					return res.view("admin/practice/createpractice",{stateData:states, practiceSettings, stripe:stripe,siteUrl:sails.config.getBaseUrl,interestTermsArr:sails.config.plaid.interestTermsArr,StateCode:providerData.state,City:providerData.city,contactemail:providerData.email,contactphoneNo:providerData.phonenumber,providername:providerData.providername});
				});
		    })
		 }
		 else
		 {
			PracticeSetting.find().then((practiceSettings) => {
				return res.view("admin/practice/createpractice",{stateData:states, practiceSettings, stripe:stripe,siteUrl:sails.config.getBaseUrl,interestTermsArr:sails.config.plaid.interestTermsArr});
			});
		 }
	})
	.catch(function (err) {
	      sails.log.error("PracticeController#createpracticeAction :: err", err);
		  return res.handleError({
			code: 500,
			message: 'INTERNAL_SERVER_ERROR'
		  });
	});
}

function addnewsetting( req, res ) {
	sails.log.warn('name',req.param("name"))
	sails.log.warn('isDefault',req.param("isDefault"))
	sails.log.warn('denySpecificTiers',req.param("denyTiers"))
	const rules = defaultRules;
	const settingData = {
		SettingName: req.param( "name" ),
		isDefault: req.param( "isDefault" ),
		denySpecificTiers: req.param( "denyTiers" ),
		transunion: req.param( "enableTransunion" ),
		productRules: rules,
		btrs: createBTRTemplate('')
	};
	const criteria = {
		SettingName: settingData.name
	}
	PracticeSetting.findOne( criteria )
	.then( function( practicedata ) {
		if( practicedata ) {
			req.session.Practiceerrormsg = "Setting name already exist!";
			return res.redirect( "/admin/practicesettings" );
		}
		PracticeSetting.create( settingData )
			.then(( settingData ) => {
				return createLoanSettingsCreditTierPracticeSettings( settingData.id, (req.param( "enableTransunion" ) == true) );
			}).then(() => {
				req.session.Practicesuccessmsg = "Setting has been created Successfully!";
				return res.redirect( "/admin/practicesettings" );
			});
	} );
}

function editpracticesetting( req, res ) {
	sails.log.warn('name',req.param("name"))
	sails.log.warn('isDefault',req.param("isDefault"))
	sails.log.warn('denySpecificTiers',req.param("denyTiers"))
	const settingData = {
		SettingName: req.param( "name" ),
		isDefault: req.param( "isDefault" ),
		denySpecificTiers: req.param( "denyTiers" ),
		transunion: req.param( "enableTransunion" ),
	};
	sails.log.warn("id", req.param("id"))
	PracticeSetting.update({ id: req.param("id") }, { ...settingData })
	.exec( function( practicedata ) {
		req.session.Practicesuccessmsg = "Setting updated successfully!";
		return res.redirect( "/admin/practicesettings" );
	} );
}


function addnewpractice( req, res ) {
	let practiceId = "";
	const practiceData = {
		ContactName: req.param( "ContactName" ),
		PracticeEmail: req.param( "PracticeEmail" ),
		PracticeName: req.param( "PracticeName" ),
		LocationName: req.param( "LocationName" ),
		StreetAddress: req.param( "StreetAddress" ),
		City: req.param( "City" ),
		StateCode: req.param( "StateCode" ),
		ZipCode: req.param( "ZipCode" ),
		PhoneNo: req.param( "PhoneNo" ),
		InvitedDate: new Date().toISOString().slice( 0, 10 ),
		PracticeUrl: "",
		UrlSlug: "",
		PracticeHome: req.param( "PracticeHome" ),
		LinkForm: req.param( "LinkForm" ),
		practiceSetting: req.param('PracticeSettings')
	};
	var criteria = {
		PracticeEmail: req.param( "PracticeEmail" ),
		PracticeName: req.param( "PracticeName" ),
		isDeleted: false
	};
	PracticeManagement.findOne( criteria )
	.then( function( practicedata ) {
		if( practicedata ) {
			req.session.Practiceerrormsg = "Practice name and email already exist!";
			return res.redirect( "/admin/managepractice" );
		}
		var PracticeUrl = req.param( 'PracticeUrl' );
		var purlString = PracticeUrl.replace(/[^A-Z0-9]/ig, "-");
		purlString = purlString.toLowerCase();
		practiceData.UrlSlug = purlString;
		var slugcriteria = {
			UrlSlug: purlString
		};
		return PracticeManagement.findOne( slugcriteria );
	} )
	.then( function( slugpracticedata ) {
		if( slugpracticedata ) {
			req.session.Practiceerrormsg = "Practice url already exist!";
			return res.redirect( "/admin/managepractice" );
		}
		practiceData.PracticeUrl = req.param( "siteUrl" ) + practiceData.UrlSlug;
		return PracticeManagement.create( practiceData )
		.then( ( practicemanagementData ) => {
			if( ! practicemanagementData ) {
				req.session.Practiceerrormsg = "Could not create practice please try again later.";
				return res.redirect( "/admin/managepractice" );
			}
			practiceId = practicemanagementData.id;
			EmailService.sendNewPracticeEmail( practicemanagementData );
			return createLoanSettingsCreditTier( practicemanagementData.id );
		} )
		.then( () => {
			return createinterestrate( practiceId );
		} )
		.then( () => {
			return createPracticeAgreements( practiceId );
		} )
		.then( () => {
			return PracticeManagement.createPartnerRules( practiceId );
		} )
		.then( () => {
			req.session.Practicesuccessmsg = "Practice has been created Successfully!";
			return res.redirect( "/admin/managepractice" );
		} )
		.catch( ( err ) => {
			sails.log.error( "PracticeController#addnewpractice :: err :", err );
			return res.handleError( err );
		} );
	} );
}
function createLoanSettingsCreditTier( practiceId ) {
	const loansettings = sails.config.pricingMatrix.loansettings;
	const loancredittiers = sails.config.pricingMatrix.loancredittier;
	const promiseAll = [];
	loansettings.forEach( function( loansetting ) {
		loansetting.practicemanagement = practiceId;
		promiseAll.push( LoanSettings.create( loansetting ).then( () => {} ) );
	} );
	loancredittiers.forEach( function( loancredittier ) {
		loancredittier.practicemanagement = practiceId;
		promiseAll.push( LoanCreditTier.create( loancredittier ).then( () => {} ) );
	} );
	return Promise.all( promiseAll );
}

function createLoanSettingsCreditTierPracticeSettings ( settingId , enableTransunion = false ) {
	const loansettings = sails.config.pricingMatrix.loansettings;
	const loancredittiers = sails.config.pricingMatrix.loancredittier;
	const promiseAll = [];
	loansettings.forEach( function( loansetting ) {
		loansetting.practicesetting = settingId;
		promiseAll.push( LoanSettings.create( loansetting ).then( () => {} ) );
	} );
	loancredittiers.forEach( function( loancredittier ) {
		loancredittier.practicesetting = settingId;
		if (!enableTransunion) {
			loancredittier.minCreditScore = 0;
			loancredittier.maxCreditScore = 0;
		}
		promiseAll.push( LoanCreditTier.create( loancredittier ).then( () => {} ) );
	} );
	return Promise.all( promiseAll );
}

function createinterestrate( practiceId ) {
	const loaninterestrates = sails.config.pricingMatrix.loaninterestrate;
	const promiseAll = [];
	loaninterestrates.forEach( function( loaninterestrate ) {
		loaninterestrate.practicemanagement = practiceId;
		promiseAll.push( Loaninterestrate.create( loaninterestrate ).then( () => {} ) );
	} );
	return Promise.all( promiseAll );
}
function createPracticeAgreements( practiceId ) {
	const practiceAgreements = sails.config.practiceAgreements.newPracticeAgreements;
	const promiseAll = [];
	practiceAgreements.forEach( function ( practiceAgreement ) {
		practiceAgreement.practicemanagement = practiceId;
		promiseAll.push( Agreement.create( practiceAgreement ).then( () => {} ) );
	} );
	return Promise.all( promiseAll );
}

// function addnewpracticeAction( req, res ) {
// 	var criteria = {
// 		PracticeEmail: req.param('PracticeEmail'),
// 		PracticeName: req.param('PracticeName'),
// 		isDeleted: false
// 	};
// 	PracticeManagement.findOne( criteria )
// 	.then( function( practicedata ) {
// 		if( practicedata ) {
// 			req.session.Practiceerrormsg = "";
// 			req.session.Practiceerrormsg = "Practice name and email already exist!"
// 			return res.redirect("/admin/managepractice");
// 		}
// 		var PracticeUrl = req.param( 'PracticeUrl' );
// 		var purlString = PracticeUrl.replace(/[^A-Z0-9]/ig, "-");
// 		purlString = purlString.toLowerCase();

// 		var slugcriteria = {
// 			UrlSlug: purlString
// 		};

// 		PracticeManagement.findOne(slugcriteria)
// 		.then(function(slugpracticedata) {
// 			if( slugpracticedata ) {
// 				req.session.Practiceerrormsg = "";
// 				req.session.Practiceerrormsg = "Practice url already exist!";
// 				return res.redirect("/admin/managepractice");
// 			}
// 			var	stripe_token	=	req.param('stripe_token');
// 			var stripecustomerRequest={
// 				email: req.param('PracticeEmail'),
// 				description: 'Customer for '+req.param('PracticeEmail'),
// 				source: stripe_token
// 			};
// 			stripe.customers.create( stripecustomerRequest, function(err, customer) {
// 				// asynchronously called
// 				if(err)
// 				{
// 					req.session.Practiceerrormsg = "";
// 					req.session.Practiceerrormsg = "Unable to charge stripe for creating practice."
// 					return res.redirect("/admin/managepractice");
// 				}
// 				if(customer.id)
// 				{
// 					var stripechargeRequest	=	{
// 						amount: sails.config.stripeSetupFee,
// 						currency: "usd",
// 						customer: customer.id,
// 						description: sails.config.lender.shortName + " - Setup Fee"
// 					}

// 					var practiceFormData	=	req.allParams();
// 					PracticeManagement.stripePaymentChargeProcess(customer, practiceFormData, stripecustomerRequest, stripechargeRequest)
// 					.then(function(responsedetails){
// 						if(responsedetails.code==200)
// 						{
// 							var practiceFormData	=	responsedetails.stripeDetails;
// 							var stripesasschargeRequest	=	{
// 								amount: sails.config.stripeSaasFee,
// 								currency: "usd",
// 								customer: customer.id,
// 								description: sails.config.lender.shortName + " - Monthly Service Fee"
// 							}
// 							var stripeHistroyid1	=	responsedetails.stripehistoryId;

// 							PracticeManagement.stripePaymentChargeProcess(customer, practiceFormData, stripecustomerRequest, stripesasschargeRequest)
// 							.then(function(responsedetails1) {

// 								var stripeInput			=	responsedetails1.stripeDetails;
// 								var stripeHistroyid2	=	responsedetails1.stripehistoryId;

// 								PracticeManagement.registerNewPractice(stripeInput)
// 								.then(function (schoolDetails) {
// 									if(schoolDetails.code==400)
// 									{
// 										req.session.Practiceerrormsg	=	'';
// 										req.session.Practiceerrormsg	=	"Practice name and email already exist!"
// 										return res.redirect("/admin/managepractice");
// 									}
// 									else
// 									{
// 										if(responsedetails1.code==200)
// 										{

// 											var practiceTermData 	= 	req.allParams();
// 											var loanterms			=	practiceTermData.loanTerm;
// 											var loanTermAmt = practiceTermData.loanTermAmt;

// 											var	loantermsArray		=	[];
// 											if(Array.isArray(loanterms))
// 											{
// 												loantermsArray	=	loanterms;
// 											}
// 											else
// 											{
// 												loantermsArray.push(loanterms);
// 											}
// 											var inputData	=	{practiceid:schoolDetails.id,enabledTerms:loantermsArray,loanTermAmt:loanTermAmt};
// 											LoanSettings.createPracticeLoansettings(inputData, function(loansetresponse){
// 												PracticeManagement.update({id: schoolDetails.id}, {loansettingsupdated: 1})
// 												.exec(function afterwards(err, updated){

// 												});

// 												Stripehistory.update({id: stripeHistroyid1}, {practicemanagement: schoolDetails.id})
// 												.exec(function afterwards(err, updated){

// 												});

// 												Stripehistory.update({id: stripeHistroyid2}, {practicemanagement: schoolDetails.id})
// 												.exec(function afterwards(err, updated){

// 												});

// 												if(loansetresponse.statusCode==200)
// 												{
// 													req.session.Practicesuccessmsg = '';
// 													req.session.Practicesuccessmsg = "Practice has been created Successfully!"
// 													return res.redirect("/admin/managepractice");
// 												}
// 											});
// 										}
// 										else
// 										{
// 											req.session.Practiceerrormsg	=	'';
// 											req.session.Practiceerrormsg	=	"Unable to register new practice.";
// 											return res.redirect("/admin/managepractice");
// 										}
// 									}
// 								})
// 								.catch(function (err) {
// 									sails.log.error('PracticeController#addnewpracticeAction :: err :', err);
// 									req.session.Practiceerrormsg = "";
// 									req.session.Practiceerrormsg = "Unable to register new practice."
// 									return res.redirect("/admin/managepractice");
// 								});
// 							});
// 						}
// 						else
// 						{
// 							req.session.Practiceerrormsg = "";
// 							req.session.Practiceerrormsg = "Unable to create customer in stripe and creating practice failed."
// 							return res.redirect("/admin/managepractice");
// 						}
// 					})
// 					.catch(function (err) {
// 						sails.log.error('PracticeController#addnewpracticeAction :: err :', err);
// 						req.session.Practiceerrormsg = "";
// 						req.session.Practiceerrormsg = "Unable to register new practice."
// 						return res.redirect("/admin/managepractice");
// 					});
// 				}
// 				else
// 				{
// 					req.session.Practiceerrormsg = "";
// 					req.session.Practiceerrormsg = "Unable to create customer in stripe and creating practice failed."
// 					return res.redirect("/admin/managepractice");
// 				}
// 			});
// 			});

// 	} );
// }

function practiceAdminListAction(req, res) {

		var errorval = '';
		var successval = '';
		if(req.session.approveerror!=''){
			errorval =req.session.approveerror;
			req.session.approveerror = '';
		}

		if(req.session.successmsg!=''){
			successval =req.session.successmsg;
			req.session.successmsg = '';
		}

		var responsedata = {
		  approveerror:errorval,
		  approvesuccess:successval
		};

		return res.view("admin/practice/practiceAdminList",responsedata);
}

function editpracticeAction(req, res) {
    var errorval = '';
    var successval = '';

    if (req.session.practiceerror != '') {
        errorval = req.session.practiceerror;
        req.session.practiceerror = '';
    }

    if (req.session.practicesuccessmsg != '') {
        successval = req.session.practicesuccessmsg;
        req.session.practicesuccessmsg = '';
    }


    var school_id = req.param('id');

    PracticeManagement.findOne({ id: school_id }).then(function (schoolData) {
        sails.log.info('schoolData:::::::', schoolData);
        if ("undefined" !== typeof schoolData.Accountnumber && schoolData.Accountnumber != '' && schoolData.Accountnumber != null) {
            schoolData.Accountnumber = schoolData.Accountnumber.replace(/\d(?=\d{4})/g, "X");
        }
        if ("undefined" !== typeof schoolData.Accountnumber && schoolData.Verifyaccountnumber != '' && schoolData.Verifyaccountnumber != null) {
            schoolData.Verifyaccountnumber = schoolData.Verifyaccountnumber.replace(/\d(?=\d{4})/g, "X");
        }
        if ("undefined" !== typeof schoolData.Routingnumber && schoolData.Routingnumber != '' && schoolData.Routingnumber != null) {
            schoolData.Routingnumber = schoolData.Routingnumber.replace(/\d(?=\d{4})/g, "X");
        }
        if ("undefined" !== typeof schoolData.CreditCardNumber && schoolData.CreditCardNumber != '' && schoolData.CreditCardNumber != null) {
            schoolData.CreditCardNumber = schoolData.CreditCardNumber.replace(/\d(?=\d{4})/g, "X");
        }

        LoanSettings
            .find({ practicemanagement: school_id })
            .then(function (termData) {

                State
                    //.getExistingState()
                    .getExistingPracticeState()
                    .then(function (states) {
						PracticeSetting.find().then((practiceSettings) => {
							return res.view("admin/practice/editpractice", { schoolData: schoolData, practiceSettings, termData:termData, errorval: errorval, successval: successval, stateData: states, siteUrl: sails.config.getBaseUrl, disableValue: 1,interestTermsArr:sails.config.plaid.interestTermsArr });
						});
                    })
                    .catch(function (err) {
                        sails.log.error('PracticeManagement#editpracticeAction :: err', err);
                        return res.handleError(err);
                    });
            })
            .catch(function (err) {
                sails.log.error('LoanSetting#editpracticeAction :: err', err);
                return res.handleError(err);
            });
    })
	.catch(function (err) {
		sails.log.error('PracticeManagement#editpracticeAction :: err', err);
		return res.handleError(err);
	});
}

function editsettingAction(req, res) {
    var errorval = '';
    var successval = '';

    if (req.session.practiceerror != '') {
        errorval = req.session.practiceerror;
        req.session.practiceerror = '';
    }

    if (req.session.practicesuccessmsg != '') {
        successval = req.session.practicesuccessmsg;
        req.session.practicesuccessmsg = '';
    }


    var settingId = req.param('id');

    PracticeSetting.findOne({ id: settingId }).then(function (settingData) {
		settingData.productRules.forEach((rule) => {
			switch (rule.declinedif) {
				case "lt":
					rule.declinedmessage = "Less than " + rule.value;
					break;
				case "gt":
					rule.declinedmessage = "Greather than " + rule.value;
					break;
				case "gte":
					rule.declinedmessage = "Greather than or equal to " + rule.value;
					break;
				case "lte":
					rule.declinedmessage = "Less than or equal to " + rule.value;
					break;
				default:
					break;
			}
		});
		settingData.btrs.rules.forEach((rule) => {
			switch (rule.condition) {
				case "lt":
					rule.declinedmessage = "Less than " + rule.value;
					break;
				case "gt":
					rule.declinedmessage = "Greather than " + rule.value;
					break;
				case "gte":
					rule.declinedmessage = "Greather than or equal to " + rule.value;
					break;
				case "lte":
					rule.declinedmessage = "Less than or equal to " + rule.value;
					break;
				default:
					break;
			}
		});
        sails.log.info('settingData:::::::', settingData);
		PracticeSetting.findOne({ isDefault: true }).then((practiceSetting) => {
			const defaultExists = practiceSetting && practiceSetting.id != settingData.id;
			LoanCreditTier.find({practicesetting: settingId}).then(function( tiers ) {
				var creditTiers = [];
				creditTiers = tiers;
				function compare(a, b) {
					if ( a.creditTier< b.creditTier ){
						return -1;
					}
					if ( a.creditTier > b.creditTier ){
						return 1;
					}
					return 0;
				}
				creditTiers.sort( compare );
				PracticeManagement.find({ practiceSetting: settingId }).then(practices => {
					return res.view("admin/practice/editsettings", { settingData, defaultExists, settingId, loanCreditTiers: creditTiers, practices });
				})
			});
		});
	});
}


function updatepracticeAction( req, res ) {
	const practiceData = req.allParams();
    PracticeManagement.findOne( { PracticeEmail: practiceData.PracticeEmail, id: { $ne: practiceData.id }, isDeleted: false } )
	.then( function( emailExists ) {
        if( emailExists ) {
			req.session.practiceerror = "Email Already Exist!";
			return res.redirect( `/admin/editpractice/${practiceData.id}` );
        }
		sails.log.warn('practiceData: ', practiceData);
		PracticeManagement.findOne( { id: practiceData.id } )
		.then( ( practicemanagement ) => {
			let practiceLogoName = ''
			let poweredLogoName = '';
			const practiceLogoFile = req.file("practiceLogo");
			practiceLogoFile.upload({ dirname: "../../assets/images/logos" }, function (err, file) {
				sails.log.warn("File uploaded: ", file);
				if (file.length) {
					practiceLogoName = file[0].fd.split('/').reverse()[0];
					PracticeManagement.update( { id: practiceData.id }, { practiceLogo: practiceLogoName }).exec(function ( err, updated ) {});
					sails.log.warn("practice logo name: ", file[0].fd.split('/').reverse()[0])
				}
			});

			const poweredLogoFile = req.file("poweredLogo");
			poweredLogoFile.upload({ dirname: "../../assets/images/logos" }, function (err, file) {
				sails.log.warn("File uploaded powered: ", file);
				if (file.length) {
					poweredLogoName = file[0].fd.split('/').reverse()[0];
					PracticeManagement.update( { id: practiceData.id }, { poweredLogo: poweredLogoName }).exec(function ( err, updated ) {});
					sails.log.warn("practice powered logo name: ", typeof file[0].fd.split('/').reverse()[0])
				}
			});
			var updateData = {
				ContactName: practiceData.ContactName,
				PracticeEmail: practiceData.PracticeEmail,
				PracticeName: practiceData.PracticeName,
				PracticeHome: practiceData.PracticeHome,
				LocationName: practiceData.LocationName,
				StreetAddress: practiceData.StreetAddress,
				City: practiceData.City,
				StateCode: practiceData.StateCode,
				ZipCode: practiceData.ZipCode,
				PhoneNo: practiceData.PhoneNo,
				LinkForm: practiceData.LinkForm,
				isHidden: practiceData.isHidden,
				practiceColor: practiceData.practiceColor,
				practiceSecondaryColor: practiceData.practiceSecondaryColor,
				practiceSetting: practiceData.PracticeSettings
			};

			// --Added for ticket no 2872
			// var loanTermAmt = practiceData.loanTermAmt;
			// var termloop = 0;
			// var loanTermAmtArray =[];
			// _.forEach( sails.config.plaid.interestTermsArr, function ( termvalue ) {
			// 	var loanTermAmtValue = loanTermAmt[ termloop ];
			// 	loanTermAmtValue = loanTermAmtValue.replace(/[^0-9.]/g, "");
			// 	loanTermAmtArray[ termvalue ] = loanTermAmtValue;
			// 	termloop++;
			// });
			//var loanterms	=	practiceData.loanTerm;

			PracticeManagement.update( { id: practiceData.id }, updateData ).exec( function afterwards( err, updated ) {
				LoanSettings.update( { practicemanagement: practiceData.id }, { loanactivestatus: 1 } ).exec(function afterwards( err, updated ) {
					// if( "undefined" !== typeof loanterms && loanterms != '' && loanterms != null ) {
					// 	if( !Array.isArray( loanterms ) ) {
					// 		sails.log.info( "loanterms: ", loanterms );
					// 		LoanSettings.update( { id: loanterms }, { loanactivestatus: 1 } ).exec( function afterwards( err, updated ) {} );
					// 	} else {
					// 		_.forEach(loanterms, function(loantermid) {
					// 			LoanSettings.update( { id: loantermid }, { loanactivestatus: 1 } ).exec( function afterwards( err, updated ) {} );
					// 		});
					// 	}
					// }
					// --Added for ticket no 2872
					// var loanTermAmtValue;
					// _.forEach( sails.config.plaid.interestTermsArr, function ( term ) {
					// 	if( loanTermAmtArray[ term ] ) {
					// 		loanTermAmtValue = parseFloat( loanTermAmtArray[ term ] );
					// 		var updatequery= { practicemanagement: practiceData.id, loanterm: term };
					// 		var updateValues= { termsloanamount: loanTermAmtValue };
					// 		LoanSettings.update( updatequery, updateValues ).exec( function afterwards( err, updated ) {} );
					// 	}
					// } );

					req.session.practicesuccessmsg = '';
					req.session.practicesuccessmsg = "Practice  has been updated Successfully!";
					var modulename = 'Update the practice details';
					var modulemessage = 'Updated the practice details';
					req.logdata=req.allParams();
					Logactivity.practiceLogActivity( req, modulename, modulemessage );
					return res.redirect( "/admin/editpractice/" + practiceData.id);
				} );
			} );
		} );
	} )
	.catch(function (err) {
		sails.log.error('PracticeManagement#updatepracticeAction :: err', err);
		return res.handleError(err);
	});
}

// function updatepracticeAction( req, res ) {
// 	const practiceData = req.allParams();
//     PracticeManagement.findOne( { PracticeEmail: practiceData.PracticeEmail, id: { $ne: practiceData.id }, isDeleted: false } )
// 	.then( function( emailExists ) {
//         if( emailExists ) {
// 			req.session.practiceerror = "Email Already Exist!";
// 			return res.redirect( `/admin/editpractice/${practiceData.id}` );
//         }

// 		PracticeManagement.findOne( { id: practiceData.id } )
// 		.then( ( practicemanagement ) => {
// 			var updateData = {
// 				ContactName: practiceData.ContactName,
// 				PracticeEmail: practiceData.PracticeEmail,
// 				PracticeName: practiceData.PracticeName,
// 				LocationName: practiceData.LocationName,
// 				StreetAddress: practiceData.StreetAddress,
// 				City: practiceData.City,
// 				StateCode: practiceData.StateCode,
// 				ZipCode: practiceData.ZipCode,
// 				PhoneNo: practiceData.PhoneNo
// 			};

// 			var	updateccard	= req.param('updateccard');

// 			// --Added for ticket no 2872
// 			var loanTermAmt = practiceData.loanTermAmt;
// 			var termloop = 0;
// 			var loanTermAmtArray =[];
// 			_.forEach( sails.config.plaid.interestTermsArr, function ( termvalue ) {
// 				var loanTermAmtValue = loanTermAmt[ termloop ];
// 				loanTermAmtValue = loanTermAmtValue.replace(/[^0-9.]/g, "");
// 				loanTermAmtArray[ termvalue ] = loanTermAmtValue;
// 				termloop++;
// 			});

// 			if( updateccard == '1' ) {
// 				var cardExp = 	practiceData.CardExpiryDate.split("/");
// 				var	stripe_token	=	req.param('stripe_token');
// 				var stripecustomerRequest={
// 					email: req.param('PracticeEmail'),
// 					source: stripe_token
// 				}
// 				stripe.customers.create( stripecustomerRequest, function(err, customer) {

// 					if(err)
// 					{
// 						req.session.practiceerror = '';
// 						req.session.practiceerror = "Unable to update the stripe details (create stripe cusomter fails!)";
// 						return res.redirect("/admin/editpractice/"+practiceData.id);
// 					}

// 					//Update new card Details
// 					updateData.customerID			=	customer.id;
// 					updateData.stripecardID		=	customer.default_source;
// 					updateData.stripe_token		=	practiceData.stripe_token;
// 					updateData.Cardholdername		=	practiceData.Cardholdername1;
// 					updateData.CreditCardNumber	=	practiceData.CreditCardNumber1.replace(/\d(?=\d{4})/g, "X");
// 					updateData.CardExpiryDate		=	practiceData.CardExpiryDate1.replace(/[0-9 \/]/g, "X");
// 					updateData.CvvCode			=	practiceData.CvvCode1.replace(/[0-9]/g, "X");


// 					//Update old card Details
// 					if (!practicemanagement.oldstripeDetails)
// 					{
// 						updateData.oldstripeDetails = [];
// 					}
// 					else
// 					{
// 						updateData.oldstripeDetails =practicemanagement.oldstripeDetails
// 					}

// 					updateData.oldstripeDetails.push({
// 							stripe_token: practicemanagement.stripe_token,
// 							customerID: practicemanagement.customerID,
// 							chargeID:practicemanagement.chargeID,
// 							stripecardID: practicemanagement.stripecardID,
// 							date: new Date()
// 					});

// 					//--Ticket no 2696 (to process recurring by next day for practice)
// 					//--Ticket no 2891 starts here
// 					if (practicemanagement.failedattemptcount>0)
// 					{
// 						var todaysDate = moment().startOf('day').toDate().getTime();
// 						var currentvalidityDate = moment(practicemanagement.validityDate).startOf('day').toDate().getTime();

// 						if (currentvalidityDate <= todaysDate)
// 						{
// 							//var validityDate = moment().startOf('day').add(1, 'days').toDate();
// 							var nextmonthStartDate = moment().add(1,'months').startOf('month').format('MM-DD-YYYY');
// 							var nextmonthnoofdays	=	moment(nextmonthStartDate).daysInMonth();
// 							var practicedate	=	moment(practicemanagement.createdAt).date();
// 							if(practicedate=='1')
// 							{
// 								var paymentDays = 0;
// 							}
// 							else
// 							{
// 								var paymentDays = moment(practicemanagement.createdAt).subtract(1, 'days').date();
// 								if(paymentDays > nextmonthnoofdays)
// 								{
// 									paymentDays	=	nextmonthnoofdays;
// 								}

// 							}
// 							if(paymentDays==0)
// 							{
// 								var validityDate = moment(nextmonthStartDate).startOf('day').toDate();
// 								//var validityDate = moment(nextmonthStartDate).startOf('day').add(5, 'days').toDate();
// 							}
// 							else
// 							{
// 								var validityDate = moment(nextmonthStartDate).startOf('day').add(paymentDays, 'days').toDate();
// 							}
// 							updateData.validityDate = validityDate;
// 							updateData.failedattemptcount = 0;
// 						}
// 					}
// 					//--Ticket no 2891 starts here
// 					var loanterms	=	practiceData['loanTerm[]'];
// 					PracticeManagement.update({id:practiceData.id},updateData).exec(function afterwards(err, updated){
// 						LoanSettings.update({practicemanagement:practiceData.id},{loanactivestatus:0}).exec(function afterwards(err, updated){
// 							if ("undefined" !== typeof loanterms && loanterms!='' && loanterms!=null)
// 							{
// 								if(!Array.isArray(loanterms))
// 								{
// 									LoanSettings.update({id:loanterms},{loanactivestatus:1}).exec(function afterwards(err, updated){

// 									});
// 								}
// 								else
// 								{
// 									_.forEach(loanterms, function(loantermid) {
// 										LoanSettings.update({id:loantermid},{loanactivestatus:1}).exec(function afterwards(err, updated){

// 										});
// 									});
// 								}
// 							}

// 							//--Added for ticket no 2872
// 							var loanTermAmtValue;
// 							_.forEach(sails.config.plaid.interestTermsArr, function (term) {

// 								if(loanTermAmtArray[term])
// 								{
// 									loanTermAmtValue = parseFloat(loanTermAmtArray[term]);
// 									var updatequery= {practicemanagement:practiceData.id,loanterm:term}
// 									var updateValues= {termsloanamount:loanTermAmtValue}
// 									LoanSettings.update(updatequery,updateValues).exec(function afterwards(err, updated){

// 									});
// 								}
// 							});

// 							req.session.practicesuccessmsg = '';
// 							req.session.practicesuccessmsg = "Practice  has been updated Successfully!";
// 							var modulename = 'Update the practice details';
// 							var modulemessage = 'Updated the practice details';
// 							req.logdata=req.allParams();
// 							Logactivity.practiceLogActivity(req,modulename,modulemessage);
// 							return res.redirect("/admin/editpractice/"+practiceData.id);
// 						});
// 					});

// 				});
// 			} else {
// 				var loanterms	=	practiceData.loanTerm;
// 				PracticeManagement.update({id:practiceData.id},updateData).exec(function afterwards(err, updated){
// 					LoanSettings.update({practicemanagement:practiceData.id},{loanactivestatus:0}).exec(function afterwards(err, updated){
// 						if ("undefined" !== typeof loanterms && loanterms!='' && loanterms!=null)
// 						{
// 							if(!Array.isArray(loanterms))
// 							{
// 								sails.log.info("loanterms: ",loanterms);
// 								LoanSettings.update({id:loanterms},{loanactivestatus:1}).exec(function afterwards(err, updated){

// 								});
// 							}
// 							else
// 							{
// 								_.forEach(loanterms, function(loantermid) {
// 									LoanSettings.update({id:loantermid},{loanactivestatus:1}).exec(function afterwards(err, updated){

// 									});
// 								});
// 							}
// 						}

// 						//--Added for ticket no 2872
// 						var loanTermAmtValue;
// 						_.forEach(sails.config.plaid.interestTermsArr, function (term) {

// 							if(loanTermAmtArray[term])
// 							{
// 								loanTermAmtValue = parseFloat(loanTermAmtArray[term]);
// 								var updatequery= {practicemanagement:practiceData.id,loanterm:term}
// 								var updateValues= {termsloanamount:loanTermAmtValue}
// 								LoanSettings.update(updatequery,updateValues).exec(function afterwards(err, updated){

// 								});
// 							}
// 						});

// 						req.session.practicesuccessmsg = '';
// 						req.session.practicesuccessmsg = "Practice  has been updated Successfully!";
// 						var modulename = 'Update the practice details';
// 						var modulemessage = 'Updated the practice details';
// 						req.logdata=req.allParams();
// 						Logactivity.practiceLogActivity(req,modulename,modulemessage);
// 						return res.redirect("/admin/editpractice/"+practiceData.id);
// 					});
// 				});
// 			}
// 		} );
// 		})
// 	    .catch(function (err) {
// 			 sails.log.error('PracticeManagement#updatepracticeAction :: err', err);
// 			 return res.handleError(err);
// 		});
// }

function ajaxpracticeSettingsListAction(req, res){
	sails.log.warn("A")
	//Sorting
	var colS = "";
	var sorttype=1;
	if(req.query.sSortDir_0=='desc') {
		var sorttype=-1;
	}


	switch( req.query.iSortCol_0 ) {
		case '0':  var sorttypevalue = { '_id': sorttype }; break;
		case '1':  var sorttypevalue = { 'name': sorttype }; break;
		case '2':  var sorttypevalue = { 'isDefault': sorttype }; break;
		default: break;
	};

	//Search
	if( req.query.sSearch ) {
		sails.log.info("search value: ",req.query.sSearch);
		var criteria = {
			or: [
				{ name:  { 'contains': req.query.sSearch } },
				{ isDefault:  { 'contains': req.query.sSearch } }
			]
		};
	} else {
		var criteria = {};
	}

	var skiprecord = parseInt(req.query.iDisplayStart);
	var iDisplayLength = parseInt(req.query.iDisplayLength);
	var schoolData = [];
	var totalrecords =0;
	var loopid;
	PracticeSetting.count(criteria).exec(function countCB(error, totalrecords) {

		if(totalrecords>0)
		{
			PracticeSetting
			.find(criteria)
			.sort(sorttypevalue)
			.skip(skiprecord)
			.limit(iDisplayLength)
			.then(function(SettingsDetails) {

				SettingsDetails.forEach(function(schoolinfo,loopvalue){
					loopid = loopvalue+skiprecord+1;

					if ("undefined" === typeof schoolinfo.SettingName)
					{
						schoolinfo.SettingName= '--';
					}

					if ("undefined" === typeof schoolinfo.isDefault)
					{
						schoolinfo.isDefault= '--';
					}

					schoolinfo.isDefault = schoolinfo.isDefault ? "<span style='color: green;'>true</span>" : "<span style='color: red;'>false</span>";

					var actiondata ='<a title="Edit setting" href="/admin/editsettings/'+schoolinfo.id+'"><i class="fa fa-edit" aria-hidden="true" style="cursor:pointer; color:#337ab7;"></i></a> &nbsp;<a style="cursor: pointer;" onclick="deletesetting(`' + schoolinfo.id + '`)"><i class="fa fa-trash" aria-hidden="true"></i></a>';

					/*var actiondata ='<a title="Add Admin" href="/admin/editpractice/'+schoolinfo.id+'"><i class="fa fa-edit" aria-hidden="true" style="cursor:pointer; color:#337ab7;"></i></a>';*/

					schoolData.push({ loopid:loopid,name: schoolinfo.SettingName, isDefault: schoolinfo.isDefault, actiondata:actiondata });
				});

				var json = {
						sEcho:req.query.sEcho,
						iTotalRecords: totalrecords,
						iTotalDisplayRecords: totalrecords,
						aaData: schoolData
					};
				res.contentType('application/json');
				res.json(json);
			});
		}
		else
		{
			var json = {
						sEcho:req.query.sEcho,
						iTotalRecords: totalrecords,
						iTotalDisplayRecords: totalrecords,
						aaData: schoolData
					};
				res.contentType('application/json');
				res.json(json);
		}
	});
}

function ajaxpracticeListAction(req, res){

	//Sorting
	var colS = "";
	var sorttype=1;
	if(req.query.sSortDir_0=='desc') {
		var sorttype=-1;
	}


	switch( req.query.iSortCol_0 ) {
		case '0':  var sorttypevalue = { '_id': sorttype }; break;
		case '1':  var sorttypevalue = { 'PracticeName': sorttype }; break;
		case '2':  var sorttypevalue = { 'ContactName': sorttype }; break;
		case '3':  var sorttypevalue = { 'PracticeEmail': sorttype }; break;
		case '4':  var sorttypevalue = { 'LocationName': sorttype }; break;
		case '5':  var sorttypevalue = { 'City': sorttype }; break;
		case '6':  var sorttypevalue = { 'StateCode': sorttype }; break;
		case '7':  var sorttypevalue = { 'createdAt': sorttype }; break;
		default: break;
	};

	//Search
	if( req.query.sSearch ) {
		sails.log.info("search value: ",req.query.sSearch);
		var criteria = {
			or: [
				{ PracticeName:  { 'contains': req.query.sSearch } },
				{ ContactName:  { 'contains': req.query.sSearch } },
				{ PracticeEmail:  { 'contains': req.query.sSearch } },
				{ LocationName:  { 'contains': req.query.sSearch } },
				{ City:  { 'contains': req.query.sSearch } },
				{ StateCode:  { 'contains': req.query.sSearch } },
				{ createdAt:  { 'contains': req.query.sSearch } }
			]
		};
	} else {
		var criteria = {};
	}

	var skiprecord =parseInt(req.query.iDisplayStart);
	var iDisplayLength = parseInt(req.query.iDisplayLength);
	var schoolData = [];
	var totalrecords =0;
	var loopid;
	PracticeManagement.count(criteria).exec(function countCB(error, totalrecords) {

		if(totalrecords>0)
		{
			PracticeManagement
			.find(criteria)
			.sort(sorttypevalue)
			.skip(skiprecord)
			.limit(iDisplayLength)
			.populate('practiceSetting')
			.then(function(SchoolDetails) {

				SchoolDetails.forEach(function(schoolinfo,loopvalue){
					loopid = loopvalue+skiprecord+1;

					if ("undefined" === typeof schoolinfo.ContactName || schoolinfo.ContactName=='' || schoolinfo.ContactName==null)
					{
						schoolinfo.ContactName= '--';
					}

					if ("undefined" === typeof schoolinfo.PracticeName || schoolinfo.PracticeName=='' || schoolinfo.PracticeName==null)
					{
						schoolinfo.PracticeName= '--';
					}
					if ("undefined" === typeof schoolinfo.PracticeEmail || schoolinfo.PracticeEmail=='' || schoolinfo.PracticeEmail==null)
					{
						schoolinfo.PracticeEmail= '--';
					}
					if ("undefined" === typeof schoolinfo.LocationName || schoolinfo.LocationName=='' || schoolinfo.LocationName==null)
					{
						schoolinfo.LocationName= '--';
					}
					if ("undefined" === typeof schoolinfo.City || schoolinfo.City=='' || schoolinfo.City==null)
					{
						schoolinfo.City= '--';
					}
					if ("undefined" === typeof schoolinfo.StateCode || schoolinfo.StateCode=='' || schoolinfo.StateCode==null)
					{
						schoolinfo.StateCode= '--';
					}
					if ("undefined" === typeof schoolinfo.InvitedDate || schoolinfo.InvitedDate=='' || schoolinfo.InvitedDate==null)
					{
						schoolinfo.InvitedDate= '--';
					}
					if ("undefined" === typeof schoolinfo.Status || schoolinfo.Status=='' || schoolinfo.Status==null)
					{
						schoolinfo.Status= '--';
					}

					if ("undefined" !== typeof schoolinfo.UrlSlug && schoolinfo.UrlSlug!='' && schoolinfo.UrlSlug!=null)
					{
						var PracticeUrl= sails.config.getBaseUrl+schoolinfo.UrlSlug;
					}
					else
					{
						var PracticeUrl= '--';
					}

					if ("undefined" !== typeof schoolinfo.practiceSetting && schoolinfo.practiceSetting.SettingName)
					{
						schoolinfo.SettingName = schoolinfo.practiceSetting.SettingName;
					}
					else
					{
						schoolinfo.SettingName = '--';
					}

					var actiondata ='<a title="Add Admin" href="/admin/editpractice/'+schoolinfo.id+'"><i class="fa fa-edit" aria-hidden="true" style="cursor:pointer; color:#337ab7;"></i></a> &nbsp;<a href="/admin/resendinvite/'+schoolinfo.id+'"><i class="fa fa-envelope" aria-hidden="true"></i></a>&nbsp;<a href="/admin/viewpracticedetails/'+schoolinfo.id+'"><i class="fa fa-eye" aria-hidden="true"></i></a>';

					/*var actiondata ='<a title="Add Admin" href="/admin/editpractice/'+schoolinfo.id+'"><i class="fa fa-edit" aria-hidden="true" style="cursor:pointer; color:#337ab7;"></i></a>';*/

					schoolData.push({ loopid:loopid,PracticeName: schoolinfo.PracticeName, ContactName: schoolinfo.ContactName, PracticeEmail: schoolinfo.PracticeEmail, LocationName: schoolinfo.LocationName, City: schoolinfo.City, StateCode: schoolinfo.StateCode, InvitedDate: schoolinfo.InvitedDate, PracticeUrl: PracticeUrl, PracticeRule: schoolinfo.SettingName, Status: schoolinfo.Status, actiondata:actiondata });
				});

				var json = {
						sEcho:req.query.sEcho,
						iTotalRecords: totalrecords,
						iTotalDisplayRecords: totalrecords,
						aaData: schoolData
					};
				res.contentType('application/json');
				res.json(json);
			});
		}
		else
		{
			var json = {
						sEcho:req.query.sEcho,
						iTotalRecords: totalrecords,
						iTotalDisplayRecords: totalrecords,
						aaData: schoolData
					};
				res.contentType('application/json');
				res.json(json);
		}
	});
}

function addPracticeAdminAction(req, res){
	//var id = req.param('id');

	var error = '';
	var success = '';
	if(req.session.error!=''){
		error =req.session.error;
		req.session.error = '';
	}

	if(req.session.successmsg!=''){
		success =req.session.successmsg;
		req.session.successmsg = '';
	}

	Roles.findOne({rolename:'PracticeAdmin'})
	.then(function(roledetails){

		   var id;
		   if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID!='' && req.session.adminpracticeID!=null)
		   {
			 id= req.session.adminpracticeID ;
		   }

		   if(id)
		   {
				PracticeManagement.findOne(id)
				.then(function (schoolData){
					return res.view("admin/practice/createpracticeadminuser",{schoolData:schoolData,roledetails:roledetails,error:error,success:success});
				});
			}
			else
			{
				PracticeManagement.find()
				.then(function (schoolData){
					return res.view("admin/practice/createpracticeadminuser",{schoolData:schoolData,roledetails:roledetails,error:error,success:success});
				});
			}
	})
	.catch(function (err) {
		  sails.log.error('AdminuserController#createnewuserAction :: err :', err);
		  var errors = {
						  "code": 404,
						  "message": "Roles not found"
						};
		  res.view("admin/error/404", {
				data: errors.message,
				layout: 'layout'
		  });
	});
}

function addnewpracticeAdminUserAction(req, res){

	var schoolAdminData = {
			username:req.param('Username'),
			email:req.param('email'),
			firstname:req.param('firstname'),
			registeredtype:'PracticeAdmin',
			lastname:req.param('lastname'),
			role:req.param('roleId'),
			practicemanagement:req.param('schoolId'),
			practiceManagementName:req.param('schoolName'),
			phoneNumber:req.param('phoneNumber'),
			BranchName:req.param('BranchName')
	};
    // sails.log.info("schoolAdminData---: ",schoolAdminData);

    var practiecriteria ={
	   PracticeName:req.param('schoolName')
    }
	PracticeManagement.
	findOne(practiecriteria)
	.then(function(PracticeAdminData){

		if(PracticeAdminData)
		{
			PracticeUser
			.registerNewSchoolAdmin(schoolAdminData,req.param('roleId'))
			.then(function (user) {
				if(user.code==200)
				{
					req.session.successmsg = '';
					req.session.successmsg = "Practice Admin has been created Successfully!"
					return res.redirect("/admin/managepracticeadmin");
				}
				else
				{
					req.session.error = '';
					req.session.error='Email already exist';
					return res.redirect("/admin/addPracticeAdmin");
				}
			})
			.catch(function (err) {
			  sails.log.error('AdminuserController#addnewuserAction :: err :', err);
			  return res.handleError(err);
			});
		}
		else
		{
			req.session.error = '';
			req.session.error='Invalid Practice Name';
			return res.redirect("/admin/addPracticeAdmin");
		}
	})
	.catch(function (err) {
	  sails.log.error('AdminuserController#addnewuserAction :: err :', err);
	  return res.handleError(err);
	});
}

function ajaxpracticeAdminUserListAction(req, res){
	 //Sorting
	var colS = "";
	var sorttype=1;
	var whereConditionAnd =new Array();
	var whereConditionOr = new Array();
	var criteria = new Array();
	if(req.query.sSortDir_0=='desc')
	{
		var sorttype=-1;
	}

	sails.log.info("req.session.adminpracticeID::::",req.session.adminpracticeID);


	switch(req.query.iSortCol_0){
		case '1':  var sorttypevalue = { 'username': sorttype }; break;
		case '2':  var sorttypevalue = { 'firstname': sorttype }; break;
		case '3':  var sorttypevalue = { 'lastname': sorttype }; break;
		case '4':  var sorttypevalue = { 'email': sorttype }; break;
		case '5':  var sorttypevalue = { 'phoneNumber': sorttype }; break;
		case '6':  var sorttypevalue = { 'practiceManagementName': sorttype }; break;
		case '8':  var sorttypevalue = { 'createdAt': sorttype }; break;
		default: break;
	};

	    //Search
		sails.log.info("search value: ",req.query.sSearch);
		//whereConditionAnd.push({registeredtype:'PracticeAdmin'});
		if(req.query.sSearch)
		{
			whereConditionOr.push({username:  { 'contains': req.query.sSearch }});
			whereConditionOr.push({firstname:  { 'contains': req.query.sSearch }});
			whereConditionOr.push({lastname:  { 'contains': req.query.sSearch }});
			whereConditionOr.push({email:  { 'contains': req.query.sSearch }});
			whereConditionOr.push({schoolManagementName:  { 'contains': req.query.sSearch }});
			whereConditionOr.push({phoneNumber:  { 'contains': req.query.sSearch }});
			whereConditionOr.push({createdAt:  { 'contains': req.query.sSearch }});
		}

		if(whereConditionOr.length > 0){
			//criteria.push({$and:whereConditionAnd,$or:whereConditionOr});

			if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID!='' && req.session.adminpracticeID!=null)
			{
				criteria.push({$or:whereConditionOr,isDeleted : false,practicemanagement:req.session.adminpracticeID});
			}
			else
			{
				criteria.push({$or:whereConditionOr,isDeleted : false});
			}

			var practiccriteria = criteria[0];
		}
		else
		{
			//criteria.push({$and:whereConditionAnd});

			if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID!='' && req.session.adminpracticeID!=null)
			{
				var practiccriteria = { isDeleted : false,practicemanagement:req.session.adminpracticeID};
			}
			else
			{
				var practiccriteria = { isDeleted : false};
			}
		}


	sails.log.info("practiccriteria:::",practiccriteria);

	PracticeUser
    .find(practiccriteria)
	.sort( sorttypevalue)
		.populate("roles")
	.populate('practicemanagement')
	.then(function(userDetails) {
				//Filter user details not available
		userDetails=_.filter(userDetails,function(item){
			if(item.email!='' && item.email!=null)
			{
				return true;
			}
		});
		var totalrecords= userDetails.length;

		//Filter by limit records
		var skiprecord =parseInt(req.query.iDisplayStart);
		var checklimitrecords = skiprecord+parseInt(req.query.iDisplayLength);

		if(checklimitrecords>totalrecords)
		{
			var iDisplayLengthvalue=parseInt(totalrecords);
		}
		else
		{
			var iDisplayLengthvalue=parseInt(req.query.iDisplayLength)+parseInt(skiprecord);
		}

		userDetails= userDetails.slice(skiprecord, iDisplayLengthvalue);

		//sails.log.info("userDetails", userDetails);

		var userData = [];
		var userName='';
		var userEmail='';
		var userphoneNumber='';
		var loopid;
		userDetails.forEach(function(userinfo,loopvalue){
			loopid = loopvalue+skiprecord+1;
			userinfo.createdAt = moment(userinfo.createdAt).format('MM-DD-YYYY hh:mm:ss');


			if ("undefined" === typeof userinfo.name || userinfo.name=='' || userinfo.name==null)
			{
				userinfo.name= '--';
			}

			if ("undefined" === typeof userinfo.email || userinfo.email=='' || userinfo.email==null)
			{
				userinfo.email= '--';
			}

			if ("undefined" === typeof userinfo.phoneNumber || userinfo.phoneNumber=='' || userinfo.phoneNumber==null)
			{
				userinfo.phoneNumber= '--';
			}
			if ("undefined" === typeof userinfo.website || userinfo.website=='' || userinfo.website==null)
			{
				userinfo.website= '--';
			}

			if(userinfo.isDeleted)
			{
				var actiondata ='<i class="fa fa-square-o icon-red" aria-hidden="true" style="cursor:pointer; color:red;" onclick="setAdminUserStatus(\''+userinfo.id+'\',\'inactive\');"></i>&nbsp;&nbsp; <a href="/admin/edituser/'+userinfo.id+'"><i class="fa fa-pencil-square-o" aria-hidden="true" style="cursor:pointer; color:#337ab7;"></i></a>';
			}
			else
			{
				//var actiondata ='<i class="fa fa-check-square-o icon-green" aria-hidden="true" style="cursor:pointer; color:green;" onclick="setAdminUserStatus(\''+userinfo.id+'\',\'active\');"></i>&nbsp;&nbsp; <a href="/admin/edituser/'+userinfo.id+'"><i class="fa fa-pencil-square-o" aria-hidden="true" style="cursor:pointer; color:#337ab7;"></i></a>';

				var actiondata ='<a href="/admin/editpracticeadminuser/'+userinfo.id+'"><i class="fa fa-pencil-square-o" aria-hidden="true" style="cursor:pointer; color:#337ab7;"></i></a>';
				//var actiondata = '--';

			}

			if(userinfo.email){
				var emillnk = '<a href="mailto:'+userinfo.email+'">'+userinfo.email+'</a>';
			}

			if ("undefined" === typeof userinfo.roles.rolename || userinfo.roles.rolename=='' || userinfo.roles.rolename==null)
			{
				userinfo.roles.rolename= '--';
			}
			//sails.log.info("userinfo", userinfo);

			userData.push({ loopid:loopid,username: userinfo.username, email: userinfo.email, phoneNumber: userinfo.phoneNumber, firstname: userinfo.firstname,schoolname:userinfo.practiceManagementName,lastname:userinfo.lastname, createdAt:userinfo.createdAt, rolename:userinfo.roles.rolename, actiondata:actiondata });
		});
		 var json = {
				sEcho:req.query.sEcho,
				iTotalRecords: totalrecords,
				iTotalDisplayRecords: totalrecords,
				aaData: userData
			};
		//sails.log.info("json data", json);
		res.contentType('application/json');
		res.json(json);

	});
}

function editpracticeadminuserAction(req, res){

		var errorval = '';
		var successval = '';

		sails.log.info("req.session.approveerror---:",req.session.approveerror);
		sails.log.info("req.session.successmsg---:",req.session.successmsg);

		if(req.session.approveerror!=''){
			errorval =req.session.approveerror;
			req.session.approveerror = '';
		}

		if(req.session.successmsg!=''){
			successval =req.session.successmsg;
			req.session.successmsg = '';
		}



		var user_id = req.param('id');
		sails.log.info("user_id---:",user_id);

		PracticeUser
		 .findOne({id:user_id})
		 .populate('practicemanagement')
		 .then(function(userData){
			sails.log.info("userData---:",userData);
			return res.view("admin/practice/editpracticeadminuser",{userData:userData,approveerror:errorval,approvesuccess:successval});
		})
		 .catch(function (err) {
				 sails.log.error('PracticeController#loandocumentsAction :: err', err);
				 return res.handleError(err);
	});
 }

function updatepracticeAdminUserAction(req,res){

		var userId = req.param('id');
		var username = req.param('Username');
		var firstname = req.param('firstname');
		var lastname = req.param('lastname');
		var email = req.param('email');
		var phoneNumber = req.param('phoneNumber');
		var status = req.param('status');
		var isDeleted = true;
		if (status == "2")
		{isDeleted = true;}
		else{
			isDeleted = false;
		}
		 if(userId)
	     {
		    var uniid = {
					id: userId
			};

			PracticeUser
			.findOne(uniid)
			.populate('roles')
			.then(function(userdata){

				 //-- check in admin user table before proceeding
				 var previousAdminemail = userdata.email;
				 Adminuser.findOne({email: email})
		 		 .then(function(adminuserdata){

				   if (adminuserdata && email != userdata.email)
				   {
					    req.session.approveerror = '';
						req.session.approveerror = "Email Already Exist!";
						return res.redirect("/admin/editpracticeadminuser/"+userId);
				   }
				   else
				   {
					   var checkcriteria = {
							email: email,
							isDeleted: false
					   };

				  	   PracticeUser.findOne(checkcriteria)
					  .then(function(userdetails) {

						if (userdetails && email != userdata.email)
						{
							req.session.approveerror = '';
							req.session.approveerror = "Email Already Exist!";
							return res.redirect("/admin/editpracticeadminuser/"+userId);
						}
						/*else if(userdetails && username != userdata.username)
						{
							req.session.approveerror = '';
							req.session.approveerror = "Username Already Exist!";
							return res.redirect("/admin/editpracticeadminuser/"+userId);
						}*/
						else
						{
							if(username != userdata.username)
							{
								var admincriteria	=	{
									name: username,
									isDeleted: false
								};
								Adminuser.findOne(admincriteria)
							  	.then(function(adminuserdetails) {
									if ("undefined" === typeof adminuserdetails || adminuserdetails=='' || adminuserdetails==null)
									{
										var practicecriteria	=	{
											username: username,
											isDeleted: false
										};
										PracticeUser.findOne(practicecriteria)
										.then(function(practiceuserdetails) {
											if ("undefined" === typeof practiceuserdetails || practiceuserdetails=='' || practiceuserdetails==null)
											{
												Adminuser.update({email: previousAdminemail}, {name: username, email:email, phoneNumber:phoneNumber, isDeleted:isDeleted}).exec(function afterwards(err, adminuserupdated){
												PracticeUser.update({id: userId}, {username: username,firstname: firstname,lastname: lastname, email:email,phoneNumber:phoneNumber, isDeleted:isDeleted}).exec(function afterwards(err, userupdated){
														req.session.successmsg = '';
														req.session.successmsg = "Practice Admin has been updated Successfully!";
														var modulename = 'Update Practice Admin user';
														var modulemessage = 'Updated Practice admin user successfully';
														req.logdata=req.allParams();
														req.role=userdata.role.rolename;
 														Logactivity.practiceLogActivity(req,modulename,modulemessage);
 														return res.redirect("/admin/managepracticeadmin");
													});
												});
											}
											else
											{
												req.session.approveerror = '';
												req.session.approveerror = "Username Already Exist!";
												return res.redirect("/admin/editpracticeadminuser/"+userId)
											}
									   	}).catch(function (err) {
											req.session.errormsg='';
											req.session.errormsg = 'Unable to update user';
											return res.redirect("/admin/editpracticeadminuser/"+userId);
									   });
 									}
									else
									{
										req.session.approveerror = '';
										req.session.approveerror = "Username Already Exist!";
										return res.redirect("/admin/editpracticeadminuser/"+userId)
									}
								}).catch(function (err) {
									req.session.errormsg='';
									req.session.errormsg = 'Unable to update user';
									return res.redirect("/admin/editpracticeadminuser/"+userId);
							   });
							}
							else
							{
								Adminuser.update({email: previousAdminemail}, {name: username, email:email, phoneNumber:phoneNumber, isDeleted:isDeleted}).exec(function afterwards(err, adminuserupdated){
									PracticeUser.update({id: userId}, {username: username,firstname: firstname,lastname: lastname, email:email,phoneNumber:phoneNumber, isDeleted:isDeleted}).exec(function afterwards(err, userupdated){
											req.session.successmsg = '';
											req.session.successmsg = "Practice Admin has been updated Successfully!";
											var modulename = 'Update Practice Admin user';
											var modulemessage = 'Updated Practice admin user successfully';
											req.logdata=req.allParams();
											req.role=userdata.role.rolename;
											Logactivity.practiceLogActivity(req,modulename,modulemessage);
											return res.redirect("/admin/managepracticeadmin");
									});
								});
							}
						}
					})
					.catch(function (err) {
						req.session.errormsg='';
						req.session.errormsg = 'Unable to update user';
						return res.redirect("/admin/editpracticeadminuser/"+userId);
					 });
				  }
			   })
			   .catch(function (err) {
					req.session.errormsg='';
					req.session.errormsg = 'Unable to update user';
					return res.redirect("/admin/editpracticeadminuser/"+userId);
			   });
		 })
		 .catch(function (err) {
				req.session.errormsg='';
				req.session.errormsg = 'Unable to update user';
				return res.redirect("/admin/editpracticeadminuser/"+userId);
		 });
	 }
}

function autoFillingUniversityAction(req, res){

	var universitySearch = req.param('universitySearch');


	if (!universitySearch) {
		sails.log.error("PracticeAdmin#autocompleteAction :: Insufficient Data");
		return res.handleError({
			code: 500,
        	message: 'INTERNAL_SERVER_ERROR'
	   });
	}
	else
	{

		PracticeManagement.native(function(err,coll){
			coll.aggregate([
			   { $group : {"_id" : "$PracticeName","PracticeID": { "$first": "$_id"}, "isDeleted": { "$first": "$isDeleted"}} },
			   {
				$match: {
				  isDeleted: false,
				  "_id":  {'$regex': universitySearch ,$options:'i'}
				}
			  }
		   ],function(err,universities) {

					var data = [];
					var universityName = '';
					_.forEach(universities, function(university) {
						  data.push({
							universityId: university.PracticeID,
							universityName: university._id,
							schoolDOE:university.SchoolDOE,
						  });
					});
					sails.log.info('University# --------> ', data);
					return res.success(data);
			  });
		});
	}
}

function getschoolBranchAction(req,res)
{
	var schoolBranch = req.param('schoolBranch');
	sails.log.info("schoolbranchschoolbranch : ",schoolBranch);

	if(!schoolBranch)
	{
		sails.log.error("PracticeAdmin#autocompleteAction :: Insufficient Data");
		return res.handleError({
			code: 500,
        	message: 'INTERNAL_SERVER_ERROR'
	   });
	}
	else
	{
	  var criteria = {
		  isDeleted: false,
		  BranchName: schoolBranch
		};
		sails.log.info("criteria::criteria::::",criteria);
		PracticeManagement
		  .find(criteria)
		  .then(function(schoolbranch) {
		  	sails.log.info("schoolbranch::schoolbranch::::",schoolbranch);
			var data = [];
			var schoolBranchName = '';
			_.forEach(schoolbranch, function(schbranch) {

				sails.log.info("schbranchschbranchschb::::",schbranch);

				if(schbranch.BranchName != '')
				{
					schoolBranchName = schbranch.BranchName;
				}
				else
				{
					schoolBranchName = schbranch.BranchName;
				}

				data.push({
				universityId: schbranch.id,
				schoolBranchName: schoolBranchName
			  });

			});
			sails.log.info('University#autocompleteUniversityAction :: data :', data);
			return res.success(data);
		  })
		  .catch(function(err) {
			sails.log.error('University#autocompleteUniversityAction :: err :', err);
			return res.handleError(err);
		  });
	}
}

function resendinvite( req, res ) {
	var practiceid = req.param('id');
	sails.log.info( "PracticeController.resendinvite practiceid:", practiceid );

    PracticeManagement.findOne( { id: practiceid } )
    .then( ( practicedata ) => {
        if( practicedata ) {
		    EmailService.resendInviteUrl( practicedata );
			req.session.Practicesuccessmsg = "Resend Invite url has been send successfully!";
			return res.redirect( "/admin/managepractice/" );
        } else {
			req.session.Practiceerrormsg = "Invite url not send!";
			return res.redirect( "/admin/managepractice/" );
		}
	} ).catch( ( err ) => {
		sails.log.error( "Resend Invite#sendInviteUrl::", err );
		return reject( err );
	} );
}

/* Onboarding starts here */
function startPracticeAction(req,res){

   var urlpath = req.param('urlpath');

   //sails.log.info("urlpath::",urlpath);

   if(urlpath)
   {
	   var criteria={
		  UrlSlug: urlpath
	   }

	   //sails.log.info("PracticeUrl::",urlpath)

	   PracticeManagement
	   .findOne(criteria)
	   .then(function(reponseData) {

		  if(reponseData)
		  {
			 if(reponseData.Status== "Pending")
			 {
				req.session.practiceId = reponseData.id;
				req.session.activeTab =1;

				PracticeManagement
				.update({id: req.session.practiceId},{levelcompleted: req.session.activeTab})
				.exec(function afterwards(err, updated){

   	  	 			return res.view("practice/startpractice",{activeTab:req.session.activeTab});
				});
			 }
			 else
			 {
				 req.session.practiceId ='';
				 res.view("practice/error/errorpage", {
					code: 401,
					data: 'Already completed the practice setup',
					layout: 'layout'
				});
			 }
		  }
		  else
		  {
			req.session.practiceId ='';
			res.view("practice/error/errorpage", {
				code: 401,
				data: 'Invalid Practice Invite url',
				layout: 'layout'
			});
		  }
	   })
	   .catch(function(err) {
			req.session.practiceId ='';
			res.view("practice/error/errorpage", {
				code: 403,
				data: 'Invalid Practice Invite url',
				layout: 'layout'
			});
	   });
   }
   else
   {
	    req.session.practiceId ='';
		res.view("practice/error/errorpage", {
			code: 404,
			data: 'Page not found',
			layout: 'layout'
		});
   }
}

function practiceinformationAction(req, res){

	if((req.session.practiceId != '') && (typeof(req.session.practiceId) != 'undefined') && (req.session.practiceId !=null) )
	{
		 var currentactiveTab=1;
		 if((req.session.activeTab != '') && (typeof(req.session.activeTab) != 'undefined') && (req.session.activeTab !=null) )
		 {
			currentactiveTab = req.session.activeTab;
		 }


		 PracticeManagement
		 .findOne({ id: req.session.practiceId})
		 .then(function(practiceData) {

			 if(currentactiveTab<=2)
			 {
				State
				//.getExistingState()
				.getExistingPracticeState()
				.then(function (stateData) {
					//sails.log.info("stateData::",stateData);
					req.session.activeTab =2;

					PracticeManagement
				    .update({id: req.session.practiceId},{levelcompleted: req.session.activeTab})
				    .exec(function afterwards(err, updated){

						res.view('practice/practiceinformation',{practiceData:practiceData,stateData:stateData,activeTab:req.session.activeTab});
					});
				})
				.catch(function(err) {
					req.session.practiceId ='';
					res.view("practice/error/errorpage", {
						code: 404,
						data: 'Requested page not found',
						layout: 'layout'
					});
				});
			 }
		 })
		 .catch(function(err) {

				req.session.practiceId ='';
				res.view("practice/error/errorpage", {
					code: 404,
					data: 'Requested page not found',
					layout: 'layout'
				});
		 });
	}
	else
	{
		req.session.practiceId ='';
		res.view("practice/error/errorpage", {
			code: 404,
			data: 'Requested page not found',
			layout: 'layout'
		});
	}
}

function updatepracticeinfoAction(req, res){

	if((req.session.practiceId != '') && (typeof(req.session.practiceId) != 'undefined') && (req.session.practiceId !=null) )
	{
		var reqData  = req.allParams();

		var criteria = {
		  id: req.session.practiceId,
		  isDeleted: false
		};

		//sails.log.info("practice criteria:", criteria);

		req.session.practiceupdateerror = '';
		req.session.practiceupdatesuccess = '';

		PracticeManagement.findOne(criteria)
      	.then(function(practicedata) {

			//sails.log.info("practicedata:", practicedata);

			if (practicedata)
			{
				Roles.findOne({rolename:'PracticeAdmin'})
				.then(function(roledetails){

				   		var roleId = roledetails.id;

						//sails.log.info("roleId:", roleId);

						var practiceusercriteria = {
							email: req.param('contactemail'),
							practicemanagement:practicedata.id
						};

						var practiceusernamecriteria = {
							username: req.param('username'),
						};

						PracticeUser.findOne(practiceusernamecriteria)
					    .then(function(usernameExist) {

							if (!usernameExist)
							{
								PracticeUser.findOne(practiceusercriteria)
								.then(function(userdata) {

									if (!userdata)
									{
											 var userDetails = {
														//userReference:userReference,
														username:req.param('username'),
														email:req.param('contactemail'),
														firstname:req.param('firstname'),
														lastname:req.param('lastname'),
														roles: roleId,
														registeredtype:'PracticeAdmin',
														role:'PracticeAdmin',
														practicemanagement:practicedata.id,
														practiceManagementName:practicedata.PracticeName,
														phoneNumber:req.param('PhoneNumber'),
														BranchName:practicedata.LocationName,
														passwordstatus:1
												};


												var password = req.param("password");
												var confirmpassword = req.param("confirmpassword");

												var salt = PracticeUser.generateSalt();

												sails.log.info("salt::",salt);
												sails.log.info("userDetails::",userDetails);

												userDetails.password = password;

												return User.generateEncryptedPassword(userDetails, salt)
												.then(function(encryptedPassword) {

													userDetails.password = encryptedPassword;
													userDetails.salt = salt;

													return User.getNextSequenceValue('practiceuser')
													.then(function(userRefernceData) {

															userDetails.userReference ='PFUSR_'+userRefernceData.sequence_value;

															PracticeUser.create(userDetails)
															.then(function(user) {

																PracticeManagement
																.update({id: req.session.practiceId},{levelcompleted: req.session.activeTab})
																.exec(function afterwards(err, updated){

																	 sails.log.info("Admin privilege created for this practice");

																	 req.session.activeTab =3;
																	 //req.session.practiceupdatesuccess = "Admin privilege created for this practice";
																	 return res.redirect("/practice/addprocedcures");
																});
															 })
															 .catch(function(err) {
																	sails.log.error("create err::",err);
																	req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
																	req.session.reqData = reqData;
																	return res.redirect("/practice/practiceinformation");
															 });

													})
													.catch(function(err) {
															sails.log.error("sequence err::",err);
															req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
															req.session.reqData = reqData;
															return res.redirect("/practice/practiceinformation");
													});
											})
											 .catch(function(err) {
													sails.log.error("password err::",err);
													req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
													req.session.reqData = reqData;
													return res.redirect("/practice/practiceinformation");
											 });
									}
									else
									{
										 sails.log.error("Email already exist");
										 if(practicedata.levelcompleted==2)
										 {
											sails.log.error("Enter if loop");
											req.session.activeTab =3;
											return res.redirect("/practice/addprocedcures");
										 }
										 else
										 {
											sails.log.error("Enter else loop");
											req.session.practiceupdateerror = "Email already exist to create admin privilege for this practice";
											req.session.reqData = reqData;
											return res.redirect("/practice/practiceinformation");
										 }
									}
								})
								.catch(function (err) {
										sails.log.error("practice fetch err::",err);
										req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
										req.session.reqData = reqData;
										return res.redirect("/practice/practiceinformation");
								});
							}
							else
							{
								sails.log.error("username already exist");
								req.session.practiceupdateerror = "Username already exist";
								req.session.reqData = reqData;
								return res.redirect("/practice/practiceinformation");
							}
						})
						.catch(function (err) {
								sails.log.error("username fetch fails",err);
								req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
								req.session.reqData = reqData;
								return res.redirect("/practice/practiceinformation");
						});
					})
					.catch(function (err) {
							sails.log.error("role fetch fails", err);
							req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
							req.session.reqData = reqData;
							return res.redirect("/practice/practiceinformation");
					});
			}
			else
			{
				sails.log.error("Invalid pracitce data");
				req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
				req.session.reqData = reqData;
				return res.redirect("/practice/practiceinformation");
			}
		})
	    .catch(function (err) {
				sails.log.error("practice management fetch fails",err);
				req.session.practiceupdateerror = "Failed to create admin privilege for this practice";
				req.session.reqData = reqData;
				return res.redirect("/practice/practiceinformation");
		});
	}
	else
	{
		sails.log.error("Invalid practice url");
		req.session.practiceId ='';
		res.view("practice/error/errorpage", {
			code: 404,
			data: 'Requested page not found',
			layout: 'layout'
		});
	}
}

function addprocedcuresAction(req, res){

	if((req.session.practiceId != '') && (typeof(req.session.practiceId) != 'undefined') && (req.session.practiceId !=null) )
	{
		res.view('practice/addprocedcures',{activeTab:req.session.activeTab});
	}
	else
	{
		req.session.practiceId ='';
		res.view("practice/error/errorpage", {
			code: 404,
			data: 'Requested page not found',
			layout: 'layout'
		});
	}
}

function stringHasValue( str ) {
	if( ( str != '' ) &&
		( typeof( str ) != 'undefined' ) &&
		( str != null ) ) {
		return true;
	}
}

function getPraciceId( req ) {
	let practiceId = "";
	if( stringHasValue( req.session.practiceId ) ) {
		practiceId = req.session.practiceId;
	} else if( stringHasValue( req.session.practiceID ) ) {
		practiceId = req.session.practiceID;
	} else if( stringHasValue( req.session.adminpracticeID ) ) {
		practiceId = req.session.adminpracticeID;
	}
	return practiceId;
}

function createprocedureAction(req, res){
	let practiceId = getPraciceId( req );

	if( practiceId ) {
		let allParams = req.allParams();
		sails.log.info( "practice post value:", allParams );

		return Procedures.createProcedure( allParams,practiceId )
		.then( ( procedure ) => {
			if( procedure.hasOwnProperty( "custom" ) ) {
				for( const p in procedure.custom ) {
					procedure.custom[ p ].id = p;
				}
			}
			return res.redirect( `/admin/proceduresettings/${practiceId}` );
		} )
		.catch( ( err ) => {
			sails.log.error( "PracticeController#createprocedureAction::", err );
			res.status( 500 ).json( { "error": err } );
			return;
		} );
	} else {
		let err = new Error( "Unknown Practice" )
		sails.log.error( "PracticeController#createprocedureAction::", err );
		res.status( 404 ).json( { "error": err } );
		return;
	}
}

function deleteprocedureAction( req, res ) {
	let allParams = req.allParams();
	if( allParams.id ) {
		return Procedures.deleteProcedure( allParams.id)
		.then( () => {
			res.status( 200 ).send( "deleted" );
			return;
		} )
		.catch( ( err ) => {
			sails.log.error( "PracticeController#deleteprocedureAction::", err );
			res.status( 500 ).json( { "error": err } );
			return;
		} );
	} else {
		let err = new Error( "Procedure Id required" )
		sails.log.error( "PracticeController#deleteprocedureAction::", err );
		res.status( 404 ).json( { "error": err } );
		return;
	}
}

function updateprocedureAction(req, res){
	let allParams = req.allParams();
	let practiceId = getPraciceId( req );
	sails.log.info( "procedure put value:", allParams );

	if( allParams && allParams.id ) {
		return Procedures.updateProcedure( allParams, practiceId, allParams.id )
		.then( ( procedure ) => {
			// res.status( 200 ).json( procedure[ 0 ] );
			return res.redirect( `/admin/proceduresettings/${practiceId}` );
		} )
		.catch( ( err ) => {
			sails.log.error( "PracticeController#updateprocedureAction::", err );
			res.status( 500 ).json( { "error": err } );
			return;
		} );
	} else {
		let err = new Error( "Unknown Procedure" )
		sails.log.error( "PracticeController#updateprocedureAction::", err );
		res.status( 404 ).json( { "error": err } );
		return;
	}
}

function addlendermerchantfeesAction(req,res){

	if((req.session.practiceId != '') && (typeof(req.session.practiceId) != 'undefined') && (req.session.practiceId !=null) )
	{
		res.view('practice/addlendermerchantfees',{activeTab:req.session.activeTab});
	}
	else
	{
		req.session.practiceId ='';
		res.view("practice/error/errorpage", {
			code: 404,
			data: 'Requested page not found',
			layout: 'layout'
		});
	}
}

function getmerchantfeetemplateAction (req, res){

	var rowCount = req.param('rowCount');

	var vendorcriteria = {
		isDeleted: false
	};

	Vendor.find(vendorcriteria)
	.then(function(vendorData) {

		sails.log.info("vendorData::",vendorData);
		sails.log.info("rowCount::",rowCount);

		res.render("practice/merchantfeetemplate", {rowCount:rowCount,vendorData:vendorData}, function(err, listdata){
			var json = {
				status: 200,
				listdata: listdata
			};
			res.contentType('application/json');
			res.json(json);
		});
	})
	.catch(function (err) {
			var json = {
				status: 400,
				listdata: {}
			};
			res.contentType('application/json');
			res.json(json);
	});
}

function getvendorinterestrateAction(req, res){

	var rowCount = req.param('rowCount');
	var vendorID = req.param('vendorID');

	var vendorcriteria = {
		id:vendorID,
		isDeleted: false
	};

	var listdata='<option value="">Select Finance Product</option>';

	Vendor.findOne(vendorcriteria)
	.then(function(vendorData) {

			_.forEach(vendorData.APRMonthly, function(interest , key) {

				 listdata+='<option value="">'+interest+'% APR - '+key+' months</option>';
			});

		    var json = {
				status: 200,
				listdata: listdata
			};
			res.contentType('application/json');
			res.json(json);
	})
	.catch(function (err) {
			var json = {
				status: 400,
				listdata: listdata
			};
			res.contentType('application/json');
			res.json(json);
	});
}

function addstaffmembersActtion(req, res){
	res.view('practice/addstaffmembers');

	/*if((req.session.practiceId != '') && (typeof(req.session.practiceId) != 'undefined') && (req.session.practiceId !=null) )
	{
		res.view('practice/addstaffmembers',{activeTab:req.session.activeTab});
	}
	else
	{
		req.session.practiceId ='';
		res.view("practice/error/errorpage", {
			code: 404,
			data: 'Requested page not found',
			layout: 'layout'
		});
	}*/
}

function getstaffmembersAction(req, res){

	var rowCount = req.param('rowCount');

	res.render("practice/addstaffmemberstemplate", {rowCount:rowCount}, function(err, listdata){
		var json = {
			status: 200,
			listdata: listdata
		};
		res.contentType('application/json');
		res.json(json);
	});
}

function addfinancialinformationAction(req, res){
	res.view('practice/addfinancialinformation');

	/*if((req.session.practiceId != '') && (typeof(req.session.practiceId) != 'undefined') && (req.session.practiceId !=null) )
	{
		res.view('practice/addfinancialinformation',{activeTab:req.session.activeTab});
	}
	else
	{
		req.session.practiceId ='';
		res.view("practice/error/errorpage", {
			code: 404,
			data: 'Requested page not found',
			layout: 'layout'
		});
	}*/
}
function checkpracticeurlAction(req, res){
	var slug = req.param('urlSlug');
	sails.log.info('slug', slug);
	PracticeManagement.findOne({UrlSlug:slug})
	.then(function(practiceRes){
		if(practiceRes)
		{
			var status	=	'400';
		}
		else
		{
			var status	=	'200';
		}
		var json = { status : status };
		res.contentType('application/json');
		res.json(json);
  	}).catch(function (err) {
		sails.log.error('PracticeManagement#checkpracticeurlAction :: err', err);
		return res.handleError(err);
	});
}

function editCreditTierSettingsAction (req, res) {
	var settingId = req.param('settingId');
	// if credit score range wants to be changed 
	if (req.param('financedAmount') !== "" || req.param('downPayment') !== "" || req.param('maxLoanAmount') !== "" || req.param('fundingRate') !== "" || req.param('loanAmount') !== ""){
		var tier = req.param('creditTier');
		var financedAmount = req.param('financedAmount');
		var downPayment = req.param('downPayment');
		var maxLoanAmount = req.param('maxLoanAmount');
		var loanAmount = req.param('loanAmount');
		var fundingRate = req.param('fundingRate');
		var term = req.param('term');
		var interestRate = req.param('interestRate');
		var salesPrice = req.param('salesPrice') || 6000;
		LoanCreditTier.findOne({practicesetting: settingId, creditTier: tier})
		.then(function(obj){
			if (obj) {
				sails.log.debug("Found tier objects"); 
				if (financedAmount !== "") {
					obj.financedAmount = Number(financedAmount);
				}
				if (downPayment !== "") {
					obj.downPayment = Number(downPayment);
				}
				if (maxLoanAmount !== "") {
					obj.maxLoanAmount = Number(maxLoanAmount);
				}
				if (loanAmount !== "") {
					obj.loanAmount = Number(loanAmount);
				}
				if (fundingRate !== "") {
					obj.fundingRate = Number(fundingRate);
				}
				if (interestRate !== "") {
					obj[`interestRate${term}`] = Number(interestRate);
				}
				obj.salesPrice = Number(salesPrice);
				sails.log.warn("interest rate provided:", req.param("interestRate"));
				obj.save(function(err) {
					if(err) {
						var errors = err.message;
						sails.log.error('PracticeManagement#editCreditTiersAction:: err1', errors);
						res.view("admin/error/404", {
							data: err.message,
							layout: 'layout'
						});
					}
					res.redirect('back');
				});
			}
			else {
				var errors = err.message;
				sails.log.error('PracticeManagement#editCreditTiersAction:: err2', errors);
				res.view("admin/error/404", {
				data: err.message,
				layout: 'layout'
			});
			}
			
		})
		.catch(function(err) {
			var errors = err.message;
			sails.log.error('PracticeManagement#editCreditTiersAction:: err3', errors);
			res.view("admin/error/404", {
				data: err.message,
				layout: 'layout'
			});
		});
	}
}

function editCreditTierAction (req, res) {
	var practiceID = req.param('practiceID');
	// if credit score range wants to be changed 
	if (req.param('financedAmount') !== "" || req.param('downPayment') !== "" || req.param('maxLoanAmount') !== "" || req.param('fundingRate') !== "" || req.param('loanAmount') !== ""){
		var tier = req.param('creditTier');
		var financedAmount = req.param('financedAmount');
		var downPayment = req.param('downPayment');
		var maxLoanAmount = req.param('maxLoanAmount');
		var loanAmount = req.param('loanAmount');
		var fundingRate = req.param('fundingRate');
		var term = req.param('term');
		var interestRate = req.param('interestRate');
		LoanCreditTier.findOne({practicemanagement: practiceID, creditTier: tier})
		.then(function(obj){
			if (obj) {
				sails.log.debug("Found tier objects"); 
				if (financedAmount !== "") {
					obj.financedAmount = Number(financedAmount);
				}
				if (downPayment !== "") {
					obj.downPayment = Number(downPayment);
				}
				if (maxLoanAmount !== "") {
					obj.maxLoanAmount = Number(maxLoanAmount);
				}
				if (loanAmount !== "") {
					obj.loanAmount = Number(loanAmount);
				}
				if (fundingRate !== "") {
					obj.fundingRate = Number(fundingRate);
				}
				if (interestRate !== "") {
					obj[`interestRate${term}`] = Number(interestRate);
				}
				sails.log.warn("credittier practiceID: ", practiceID);
				sails.log.warn("interest rate provided:", req.param("interestRate"));
				obj.save(function(err) {
					if(err) {
						var errors = err.message;
						sails.log.error('PracticeManagement#editCreditTiersAction:: err1', errors);
						res.view("admin/error/404", {
							data: err.message,
							layout: 'layout'
						});
					}
					res.redirect('back');
				});
			}
			else {
				var errors = err.message;
				sails.log.error('PracticeManagement#editCreditTiersAction:: err2', errors);
				res.view("admin/error/404", {
				data: err.message,
				layout: 'layout'
			});
			}
			
		})
		.catch(function(err) {
			var errors = err.message;
			sails.log.error('PracticeManagement#editCreditTiersAction:: err3', errors);
			res.view("admin/error/404", {
				data: err.message,
				layout: 'layout'
			});
		});
	}
}
function editCreditRangeAction(req, res) {
	var practiceID = req.param('practiceID');
	// if credit score range wants to be changed 
	LoanCreditTier.find({practicemanagement: practiceID})
	.then(function(objs){
		if (objs && objs.length) {
			function compare(a, b) {
				if ( a.creditTier < b.creditTier ){
					return -1;
				}
				if ( a.creditTier > b.creditTier ){
					return 1;
				}
				return 0;
			}
			objs.sort( compare );
			var ax = Number(req.param("minA"));
			objs[0].maxCreditScore = Number(req.param("maxA")); // change this so it only replaces if there is a value in it.
			objs[0].minCreditScore = Number(req.param("minA"));
			objs[1].maxCreditScore = Number(req.param("maxB"));
			objs[1].minCreditScore = Number(req.param("minB"));
			objs[2].maxCreditScore = Number(req.param("maxC"));
			objs[2].minCreditScore = Number(req.param("minC"));
			objs[3].maxCreditScore = Number(req.param("maxD"));
			objs[3].minCreditScore = Number(req.param("minD"));
			objs[4].maxCreditScore = Number(req.param("maxE"));
			objs[4].minCreditScore = Number(req.param("minE"));
			objs[5].maxCreditScore = Number(req.param("maxF"));
			objs[5].minCreditScore = Number(req.param("minF"));
			objs[6].maxCreditScore = Number(req.param("maxG"));
			objs[6].minCreditScore = Number(req.param("minG"));
			objs.forEach(function(e) {
				e.save(function(err) {
					if(err) {
						var errors = err.message;
						sails.log.error('PracticeManagement#editCreditRangeAction:: err', errors);
						res.view("admin/error/404", {
							data: err.message,
							layout: 'layout'
						});
					}
				});
			});
			res.redirect('back');
		} else {
			const loancredittiers = sails.config.pricingMatrix.loancredittier;
			const promiseAll = [];
			loancredittiers.forEach( function( loancredittier ) {
				loancredittier.practicemanagement = practiceID;
				loancredittier.minCreditScore = Number(req.param("min" + loancredittier.creditTier ));
				loancredittier.maxCreditScore = Number(req.param("max" + loancredittier.creditTier ));
				promiseAll.push( LoanCreditTier.create( loancredittier ).then( () => {} ) );
			} );
			Promise.all( promiseAll ).then(() => {
				res.redirect('back');
			});
		}
	})
	.catch(function(err) {
		var errors = err.message;
		sails.log.error('PracticeManagement#editCreditRangeAction:: err', errors);
		res.view("admin/error/404", {
			data: err.message,
			layout: 'layout'
		});
	});
}

function editCreditRangePracticeSettingsAction(req, res) {
	var settingId = req.param('settingId');
	// if credit score range wants to be changed 
	LoanCreditTier.find({practicesetting: settingId})
	.then(function(objs){
		if (objs && objs.length) {
			function compare(a, b) {
				if ( a.creditTier < b.creditTier ){
					return -1;
				}
				if ( a.creditTier > b.creditTier ){
					return 1;
				}
				return 0;
			}
			objs.sort( compare );
			var ax = Number(req.param("minA"));
			objs[0].maxCreditScore = Number(req.param("maxA")); // change this so it only replaces if there is a value in it.
			objs[0].minCreditScore = Number(req.param("minA"));
			objs[1].maxCreditScore = Number(req.param("maxB"));
			objs[1].minCreditScore = Number(req.param("minB"));
			objs[2].maxCreditScore = Number(req.param("maxC"));
			objs[2].minCreditScore = Number(req.param("minC"));
			objs[3].maxCreditScore = Number(req.param("maxD"));
			objs[3].minCreditScore = Number(req.param("minD"));
			objs[4].maxCreditScore = Number(req.param("maxE"));
			objs[4].minCreditScore = Number(req.param("minE"));
			objs[5].maxCreditScore = Number(req.param("maxF"));
			objs[5].minCreditScore = Number(req.param("minF"));
			objs[6].maxCreditScore = Number(req.param("maxG"));
			objs[6].minCreditScore = Number(req.param("minG"));
			objs.forEach(function(e) {
				e.save(function(err) {
					if(err) {
						var errors = err.message;
						sails.log.error('PracticeManagement#editCreditRangeAction:: err', errors);
						res.view("admin/error/404", {
							data: err.message,
							layout: 'layout'
						});
					}
				});
			});
			res.redirect('back');
		} else {
			const loancredittiers = sails.config.pricingMatrix.loancredittier;
			const promiseAll = [];
			loancredittiers.forEach( function( loancredittier ) {
				loancredittier.practicesetting = settingId;
				loancredittier.minCreditScore = Number(req.param("min" + loancredittier.creditTier ));
				loancredittier.maxCreditScore = Number(req.param("max" + loancredittier.creditTier ));
				promiseAll.push( LoanCreditTier.create( loancredittier ).then( () => {} ) );
			} );
			Promise.all( promiseAll ).then(() => {
				res.redirect('back');
			});
		}
	})
	.catch(function(err) {
		var errors = err.message;
		sails.log.error('PracticeManagement#editCreditRangeAction:: err', errors);
		res.view("admin/error/404", {
			data: err.message,
			layout: 'layout'
		});
	});
}

function editProductRuleAction(req, res) {
	var practiceID = req.param('practiceID');
	var ruleVersion = req.param('ruleVersion');
	ProductRules.findOne({practicemanagement: practiceID, version: ruleVersion})
	.then(function(obj){
		if (obj) {
			// Old set of rules is now obsolete
			obj.isDeleted = true; 
			obj.save(function(err) {
				if(err) {
					var errors = err.message;
					sails.log.error('PracticeManagement#editProductRulessAction:: err1', errors);
					res.view("admin/error/404", {
						data: err.message,
						layout: 'layout'
					});
					res.redirect('back');
					return
				}
				else {
					// copy the object
					var newRules = {
						rules: obj.rules, 
						product: obj.product,
						practicemanagement: obj.practicemanagement,
						version: obj.version + 1, // with some differences
						isDeleted: false, // another slight change
					};
					newRules.rules[req.param("ruleNumber")].declinedif = req.param("ruleCondition");
					newRules.rules[req.param("ruleNumber")].value = Number(req.param("ruleValue"));
					newRules.rules[req.param("ruleNumber")].disabled = req.param("ruleDisabled").toLowerCase() == "true" ? true : false;

					ProductRules.create(newRules)
					.catch(function(err) {
						var errors = err.message;
						sails.log.error('PracticeManagement#editProductRuleAction:: err', errors);
						res.view("admin/error/404", {
							data: err.message,
							layout: 'layout'
						});
					});
					res.redirect('back');
					return;
				}
			});
		
			//res.redirect("back");
		}
	})
	.catch(function(err) {
		var errors = err.message;
		sails.log.error('PracticeManagement#editProductRuleAction:: err', errors);
		res.view("admin/error/404", {
			data: err.message,
			layout: 'layout'
		});
	});
}
function addProductRuleAction(req, res) {
	var practiceID = req.param('practiceID'); // pass in practiceID seperately
	var version = req.param('ruleVersion');

	ProductRules.findOne({practicemanagement: practiceID, version: version})
	.then(function(obj){
		// Old set of rules is now obsolete
		if (obj) {
			obj.isDeleted = true; 
			obj.save(function(err) {
				if(err) {
					var errors = err.message;
					sails.log.error('PracticeManagement#editProductRulessAction:: err1', errors);
					res.view("admin/error/404", {
						data: err.message,
						layout: 'layout'
					});
					res.redirect('back');
				}
				else {
					// add rule based on rule submitted.
					var newRuleSet = obj.rules;
					if (req.param('newRuleNumber') === "rule14") {
						newRuleSet[req.param('newRuleNumber')] = {
							ruleid: "r14",
							description: "Number of Deragotary Active Trades",
							declinedif: req.param('ruleCondition'),
							value: req.param('ruleValue'),
							disabled: req.param('ruleDisabled') === "true"
						};
					
					}
					
					// Create Product Rule object, insert into the collection
					var newRules = {
						rules: newRuleSet, // new rule set
						product: obj.product,
						practicemanagement: obj.practicemanagement,
						version: obj.version + 1, // with some differences
						isDeleted: false, // another slight change
					};
					ProductRules.create(newRules)
					.catch(function(err) {
						var errors = err.message;
						sails.log.error('PracticeManagement#editProductRuleAction:: err', errors);
						res.view("admin/error/404", {
							data: err.message,
							layout: 'layout'
						});
					});
					res.redirect('back');
					return;
				}
			});
		}
		else {
			sails.log.error('PracticeManagement#addProductRuleAction:: err', "could not find product rule object");
			res.view("admin/error/404", {
				data: "Could not find product rule object",
				layout: 'layout'
			});
		}
	})
	.catch(function(err){
		var errors = err.message;
		sails.log.error('PracticeManagement#addProductRuleAction:: err', errors);
		res.view("admin/error/404", {
			data: err.message,
			layout: 'layout'
		});
	});
}

function addBankTransactionRule(req, res) {
	var practiceID = req.param('practiceID'); // pass in practiceID seperately
	var btrSelector = req.param("btrSelector");

	BankTransactionRules.findOne({practicemanagement: practiceID })
	.then(function(obj) {
		// Old set of rules is now obsolete
		
			obj.rules[btrSelector - 1] = {
				text: obj.rules[btrSelector - 1].text,
				condition: req.param("btrCondition"),
				value: req.param("btrValue"),
				disabled: req.param("btrDisabled")
			}

			obj.save(function(err) {
				if(err) {
					var errors = err.message;
					sails.log.error('PracticeManagement#editProductRulessAction:: err1', errors);
					res.view("admin/error/404", {
						data: err.message,
						layout: 'layout'
					});
					res.redirect('back');
				} else {
					res.redirect('back');
					return;
				}
			});
	})
	.catch(function(err){
		var errors = err.message;
		sails.log.error('PracticeManagement#addProductRuleAction:: err', errors);
		res.view("admin/error/404", {
			data: err.message,
			layout: 'layout'
		});
	});
}

function viewpracticedetailsAction(req, res){

	var practiceID = req.param('id');
	PracticeManagement.findOne({id:practiceID})
	.then(function(practiceData){

		if(practiceData)
		{
			if("undefined" !== typeof practiceData.CreditCardNumber && practiceData.CreditCardNumber != '' && practiceData.CreditCardNumber!=null)
			{
				practiceData.CreditCardNumber	=	practiceData.CreditCardNumber.replace(/\d(?=\d{4})/g, "X");
			}
			else
			{
				practiceData.CreditCardNumber	='--';
			}

			if("undefined" !== typeof practiceData.CardExpiryDate && practiceData.CardExpiryDate != '' && practiceData.CardExpiryDate!=null)
			{
				practiceData.CardExpiryDate		=	practiceData.CardExpiryDate.replace(/[0-9 \/]/g, "X");
			}
			else
			{
				practiceData.CardExpiryDate	='--';
			}

			if("undefined" !== typeof practiceData.CvvCode && practiceData.CvvCode != '' && practiceData.CvvCode!=null)
			{
				practiceData.CvvCode			=	practiceData.CvvCode.replace(/[0-9]/g, "X");
			}
			else
			{
				practiceData.CvvCode	='--';
			}

			if("undefined" !== typeof practiceData.Accountnumber && practiceData.Accountnumber != '' && practiceData.Accountnumber!=null)
			{
				practiceData.Accountnumber		=	practiceData.Accountnumber.replace(/\d(?=\d{4})/g, "X");
			}
			else
			{
				practiceData.Accountnumber	='--';
			}

			if("undefined" !== typeof practiceData.Verifyaccountnumber && practiceData.Verifyaccountnumber != '' && practiceData.Verifyaccountnumber!=null)
			{
				practiceData.Verifyaccountnumber=	practiceData.Verifyaccountnumber.replace(/\d(?=\d{4})/g, "X");
			}
			else
			{
				practiceData.Verifyaccountnumber	='--';
			}

			if("undefined" !== typeof practiceData.Routingnumber && practiceData.Routingnumber != '' && practiceData.Routingnumber!=null)
			{
				//practiceData.Routingnumber		=	practiceData.Routingnumber.replace(/\d(?=\d{4})/g, "X");
			}
			else
			{
				practiceData.Routingnumber	='--';
			}

			practiceData.UrlSlug		=	sails.config.getBaseUrl+practiceData.UrlSlug;


			if("undefined" === typeof practiceData.industryCode || practiceData.industryCode == '' || practiceData.industryCode==null)
			{
				practiceData.industryCode	=	'--';
			}

			if("undefined" === typeof practiceData.memberCode || practiceData.memberCode == '' || practiceData.memberCode==null)
			{
				practiceData.memberCode	=	'--';
			}

			if("undefined" === typeof practiceData.prefixCode || practiceData.prefixCode == '' || practiceData.prefixCode==null)
			{
				practiceData.prefixCode	=	'--';
			}

			if("undefined" === typeof practiceData.apiPassword || practiceData.apiPassword == '' || practiceData.apiPassword==null)
			{
				practiceData.apiPassword	=	'--';
			}

			if("undefined" === typeof practiceData.Bankname || practiceData.Bankname == '' || practiceData.Bankname==null)
			{
				practiceData.Bankname	=	'--';
			}

			if("undefined" === typeof practiceData.Accountholder || practiceData.Accountholder == '' || practiceData.Accountholder==null)
			{
				practiceData.Accountholder	=	'--';
			}

			if("undefined" === typeof practiceData.Cardholdername || practiceData.Cardholdername == '' || practiceData.Cardholdername==null)
			{
				practiceData.Cardholdername	=	'--';
			}

			if(practiceData.payments)
			{
				var loopid	=	1;
				_.forEach(practiceData.payments, function(userPayments) {
					sails.log.info('userPayments', userPayments);
					userPayments.newvalidityDate	=	moment(userPayments.newvalidityDate).format('LL');
					userPayments.date 				=	moment(userPayments.date).format('LL');
					userPayments.amount				=	parseFloat(userPayments.amount/100);

					if(userPayments.paymentstatus==1)
					{
						userPayments.paymentstatus	=	'settled';
					}
					else if(userPayments.paymentstatus==2)
					{
						userPayments.paymentstatus	=	'pending';
					}
					else
					{
						userPayments.paymentstatus	=	'failed';
					}
					if("undefined" !== typeof userPayments.failure_code && userPayments.failure_code != '' && userPayments.failure_code!=null)
					{
						userPayments.failuremsg =  userPayments.failure_code+" "+userPayments.failure_message
					}
					else
					{
						userPayments.failuremsg =  "-";
					}

					userPayments.loopid	=	loopid;
					loopid++;
				});
				var payments=practiceData.payments;
			}
			else
			{
				var payments=[];
			}

			var creditTiers = [];
			LoanCreditTier.find({practicemanagement: practiceID})
			.then(function(tiers){
				if (tiers) {
					sails.log.debug("Found tier objects"); 
					creditTiers = tiers;
					function compare(a, b) {
						if ( a.creditTier< b.creditTier ){
							return -1;
						}
						if ( a.creditTier > b.creditTier ){
							return 1;
						}
						return 0;
					}
					creditTiers.sort( compare );

					ProductRules.find({practicemanagement: practiceID})
					.then(function(pr) {
						var responsedata;
						if (pr && pr.length !== 0) {
							function comparebyversion(a, b) {
								if ( a.version > b.version ){
									return -1;
								}
								if ( a.version < b.version ){
									return 1;
								}
								return 0;
							}
							pr.sort(comparebyversion);
							var date = String(pr[0].updatedAt.getMonth()+1) + "/" + String(pr[0].updatedAt.getDate()) + "/" + String(pr[0].updatedAt.getFullYear());
							responsedata = {
								practiceData:practiceData,
								payments:payments, 
								loanCreditTiers: creditTiers,
								productRules: pr[0].rules,
								ruleVersion: pr[0].version,
								lastUpdated: date,
								practiceID: practiceID
								};
						}
						else {
							responsedata = {
								practiceData:practiceData,
								payments:payments, 
								loanCreditTiers: creditTiers,
								practiceID: practiceID
							  };
						}
						BankTransactionRules.findOne({ practicemanagement: practiceID})
							.then((btrs) => {
								const indexedRules = {};
								if (btrs) {
									_.forEach(btrs.rules, (rule, index) => {
										switch (rule.condition) {
											case "lt":
												rule.declinedif = "Less than " + rule.value;
												break;
											case "gt":
												rule.declinedif = "Greather than " + rule.value;
												break;
											case "gte":
												rule.declinedif = "Greather than or equal to " + rule.value;
												break;
											case "lte":
												rule.declinedif = "Less than or equal to " + rule.value;
												break;
											default:
												break;
										}
										indexedRules["btr" + (index + 1)] = rule;
									});
									responsedata.btrs = btrs.rules;
									responsedata.indexedRules = indexedRules;
									return res.view("admin/practice/practiceDetails", responsedata);
								} else {
									const defaultBTRs = createBTRTemplate(practiceID);
									BankTransactionRules.create(defaultBTRs)
										.then(() => {
											_.forEach(defaultBTRs.rules, (rule, index) => {
												switch (rule.condition) {
													case "lt":
														rule.declinedif = "Less than " + rule.value;
														break;
													case "gt":
														rule.declinedif = "Greather than " + rule.value;
														break;
													case "gte":
														rule.declinedif = "Greather than or equal to " + rule.value;
														break;
													case "lte":
														rule.declinedif = "Less than or equal to " + rule.value;
														break;
													default:
														break;
												}
												indexedRules["btr" + (index + 1)] = rule;
											});
											responsedata.btrs = defaultBTRs.rules;
											responsedata.indexedRules = indexedRules;
											return res.view("admin/practice/practiceDetails", responsedata);
										});
								}
							})
					})
					.catch(function(err) {
						var errors = err.message;
						sails.log.error('PracticeManagement#viewpracticedetailsAction:: err1', errors);
						res.view("admin/error/404", {
							data: err.message,
							layout: 'layout'
						});
					});
				}
			})
			.catch(function(err) {
				var errors = err.message;
				sails.log.error('PracticeManagement#viewpracticedetailsAction:: err', errors);
				res.view("admin/error/404", {
					data: err.message,
					layout: 'layout'
				});
			})
			
		}
		else
		{
			res.view("admin/error/404", {
				data: 'Invalid practice',
				layout: 'layout'
			});
		}
	}).catch(function (err) {
		var errors = err.message;
		sails.log.error('PracticeManagement#viewpracticedetailsAction:: err', errors);
		res.view("admin/error/404", {
			data: err.message,
			layout: 'layout'
		});
	});
}

function practicesettingEditAction(req, res) {

    var errorval = '';
    var successval = '';

    if (req.session.practiceerror != '') {
        errorval = req.session.practiceerror;
        req.session.practiceerror = '';
    }

    if (req.session.practicesuccessmsg != '') {
        successval = req.session.practicesuccessmsg;
        req.session.practicesuccessmsg = '';
    }


    var school_id = req.param('id');

    PracticeManagement.findOne({ id: school_id }).then(function (schoolData) {

        if ("undefined" !== typeof schoolData.Accountnumber && schoolData.Accountnumber != '' && schoolData.Accountnumber != null) {
            schoolData.Accountnumber = schoolData.Accountnumber.replace(/\d(?=\d{4})/g, "X");
        }
        if ("undefined" !== typeof schoolData.Accountnumber && schoolData.Verifyaccountnumber != '' && schoolData.Verifyaccountnumber != null) {
            schoolData.Verifyaccountnumber = schoolData.Verifyaccountnumber.replace(/\d(?=\d{4})/g, "X");
        }
        if ("undefined" !== typeof schoolData.Routingnumber && schoolData.Routingnumber != '' && schoolData.Routingnumber != null) {
            schoolData.Routingnumber = schoolData.Routingnumber.replace(/\d(?=\d{4})/g, "X");
        }
        if ("undefined" !== typeof schoolData.CreditCardNumber && schoolData.CreditCardNumber != '' && schoolData.CreditCardNumber != null) {
            schoolData.CreditCardNumber = schoolData.CreditCardNumber.replace(/\d(?=\d{4})/g, "X");
        }

        LoanSettings
            .find({ practicemanagement: school_id })
            .then(function (termData) {

                State
                    //.getExistingState()
                    .getExistingPracticeState()
                    .then(function (states) {
						PracticeSetting.find().then((practiceSettings) => {
							sails.log.warn("practice settings", practiceSettings)
							return res.view("admin/user/editpracticesetting", { schoolData: schoolData, practiceSettings, termData:termData, errorval: errorval, successval: successval, stateData: states, siteUrl: sails.config.getBaseUrl });
						});
                    })
                    .catch(function (err) {
                        sails.log.error('PracticeManagement#editpracticeAction :: err', err);
                        return res.handleError(err);
                    });
            })
            .catch(function (err) {
                sails.log.error('LoanSetting#editpracticeAction :: err', err);
                return res.handleError(err);
            });
        })
        .catch(function (err) {
            sails.log.error('PracticeManagement#editpracticeAction :: err', err);
            return res.handleError(err);
        });

}

function pfiArchiveReport () {

}
async function ajaxGetCurrentLoggedInPractice(req,res) {
	const deferUser = req.session.deferUser || {};
	const loggedInUser = req.user || {};
	const practiceId = deferUser.practicemanagement || req.session.practiceId;
	if(!practiceId) {
		const message = "Missing required practice management id to get practice information.";
		sails.log.error('LoanSetting#ajaxGetCurrentLoggedInPractice :: err ' + message);
		return res.json({message: message}, 400);
	}else {
		try {
			const practiceManagement = await PracticeManagement.findOne({id:practiceId});
			if(practiceManagement){
				return res.json({practiceManagement:practiceManagement});
			}else {
				const message = "Practice management was not found.";
				sails.log.error('LoanSetting#ajaxGetCurrentLoggedInPractice :: err ' + message);
				return res.json({message: message}, 404);
			}
		}catch(errorObj) {
			sails.log.error('PracticeManagement#ajaxGetCurrentLoggedInPractice :: err', errorObj);
			return res.json(errorObj,500);
		}
	}

}
