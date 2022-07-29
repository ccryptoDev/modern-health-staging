/* global sails, Achdocuments, ApplicationService, LoanPro, PaymentManagement, Utils, UserConsent, PracticeManagement, Agreement, State, ValidationService, Roles, User, Screentracking, HomeService */

/**
 * HomeController
 *
 * @description :: Server-side logic for managing States
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
"use strict";

const passport = require( "passport" );
// const bcrypt = require("bcrypt");
// const in_array = require('in_array');
const moment = require( "moment" );
const _ = require( "lodash" );
const fs = require( "fs" );
const URL = require( "url" );

module.exports = {
	createUser: createUserAction,
	verifyUser: verifyUserAction,
	addUser: addUser,
	willLogin: willLogin,
	login: login,
	logout: logout,
	practicehome: practicehome,
	forgotpassword: forgotpasswordAction,
	changepassword: changepasswordAction,
	setpassword: setpasswordAction,
	updatepassword: updatepasswordAction,
	emailverify: emailverifyAction,
	myprofile: myprofileAction,
	mydocuments: mydocumentsAction,
	updateemail: updateemailAction,
	Updateuserphonenumber: UpdateuserphonenumberAction,
	esignature: esignatureAction,
	editprofile: editprofileAction,
	edituserdetails: edituserdetailsAction,
	profileEmailVerification: profileEmailVerificationAction,
	profileEmailverify: profileEmailverify,
	getproductRules: getproductRulesAction,
	createupdateproductrules: createupdateproductrulesAction,
	ajaxgetloanproductrules: ajaxgetloanproductrulesAction,
	getapplicationfee: getapplicationfeeAction,
	createupdateapplicationfee: createupdateapplicationfeeAction,
	ajaxgetapplicationfee: ajaxgetapplicationfeeACtion,
	dashboard: dashboard,
	viewloandetails: viewloandetailsAction,
	applylogin: applyloginAction,
	getthecashhome: getthecashhomeAction,
	logintfc: logintfcAction,
	aboutus: aboutusAction,
	clientlogin: clientloginAction,
	faq: faqAction,
	rates: ratesAction,
	contactus: contactusAction,
	privacypolicy: privacypolicyAction,
	targetcash: targetcashAction,
	resetpassword: resetpassword,
	updateResetpassword: updateResetpassword,

	// -- admin starts here
	showHome: showHomeAction,
	signupStart: signupStartAction,
	register: registerAction,
	userinformationfull: userinformationfullAction,
	userinformationfullform: userinformationfullform,
	userinformationfullmanual: userinformationfullmanualformAction,
	financeinformation: financeinformationAction,
	financeinformationdata: financeinformationDataAction,
	applicationoffer: applicationoffer,
	saveapplicationoffer: saveapplicationofferAction,
	loanofferdetails: loanofferdetailsAction,
	loanpromissorynote: loanpromissorynoteAction,
	createloanpromissorypdf: createloanpromissorypdfAction,
	createloanapplication: createloanapplicationAction,
	success: successAction,
	controlcenter: controlcenterAction,
	autocompleteBankname: autocompleteBanknameAction,
	chatsupport: chatsupportAction,
	downloadconsentpdf: downloadconsentpdfAction,

	// co-Borrower starts here
	cosignupstart: cosignupstartAction,
	loansuccess: loansuccessAction,
	loanfailure: loanfailureAction,
	sessionTimeout: sessionTimeout,
	termsconditions: termsconditionsAction,
	californiaConsumerPrivacyActNotice: californiaConsumerPrivacyActNoticeAction,
	userlogout: userlogoutAction,
	loanamountconfirm: loanamountconfirmAction,

	// New design
	apply: apply,
	alreadyExists: alreadyExists,
	applyPost: applyPost,
	practiceApplication: practiceApplication,
	searchpractice: searchpracticeAction,
	applysearch: applysearchAction,
	addprovider: addproviderAction,
	// getStarted: getStartedAction,
	addnewprovider: addnewproviderAction,
	providersuccess: providersuccessAction,
	setSelectedPractice: setSelectedPracticeAction,
	paymentcalculator: paymentcalculatorAction,
	estimatemonthlypay: estimatemonthlypayAction,
	continueApplication: continueApplicationAction,
	updateuserAnticipatedAmount: updateuserAnticipatedAmountAction,
	clicktosave: clicktosaveAction,
	onclicktosave: onclicktosaveAction,

	updateUserEmail: updateUserEmail,
	sendverificationemail: sendverificationemail,
	skipBankLogin: skipBankLogin

	// applicationmanagementlogin: applicationmanagementloginAction
	// dashboard
	// updateprofile: updateprofileAction,
};
function privacypolicyAction( req, res ) {
	res.view( "frontend/home/privacypolicy" );
}
function aboutusAction( req, res ) {
	res.view( "frontend/home/aboutus" );
}

function ratesAction( req, res ) {
	res.view( "frontend/home/rates" );
}

function faqAction( req, res ) {
	res.view( "frontend/home/faq" );
}

function contactusAction( req, res ) {
	let successval = "";
	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}
	res.view( "frontend/home/contactus", { successval: successval } );
}
function logintfcAction( req, res ) {
	let errorval = "";
	let successval = "";
	if( req.session.errormsg != "" ) {
		errorval = req.session.errormsg;
		req.session.errormsg = "";
	}
	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}
	const userid = req.session.userId;
	if( !userid ) {
		res.view( "frontend/home/logintfc", { error: errorval, successval: successval } );
	} else {
		const redirectpath = "/dashboard";
		return res.redirect( redirectpath );
	}
}

function userinformationfullAction( req, res ) {
	// var userId = req.session.userId;
	const userId = req.session.userId ? req.session.userId : req.session.applicationuserId;
	const userCriteria = { id: userId };
	let errorval;
	let successval;

	// sails.log.info("userEmailExistingssssss:",req.session.userEmail);

	req.session.isPlaiduser = 0;

	if( req.session.errormsg != "" ) {
		errorval = req.session.errormsg;
		req.session.errormsg = "";
	}
	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}
	sails.log.info( "userCriteria", userCriteria );
	User.findOne( userCriteria )
	.then( function( userData ) {
		sails.log.info( "userData", userData );
		let userDetails = {};

		if( "undefined" === typeof userData || userData == "" || userData == null ) {
			let firstName;
			let lastName;
			let ssNumber;
			let emailAddress = "";
			if( "undefined" !== typeof req.session.isplaidEmpty && req.session.isplaidEmpty != "" && req.session.isplaidEmpty != null ) {
				if( "undefined" !== typeof req.session.first_name && req.session.first_name != "" && req.session.first_name != null ) {
					firstName = req.session.first_name;
				}
				if( "undefined" !== typeof req.session.last_name && req.session.last_name != "" && req.session.last_name != null ) {
					lastName = req.session.last_name;
				}
				if( "undefined" !== typeof req.session.security_number && req.session.security_number != "" && req.session.security_number != null ) {
					ssnNumber = req.session.security_number;
				}
			} else {
				if( "undefined" !== typeof req.session.userfilloutmanually && req.session.userfilloutmanually != "" && req.session.userfilloutmanually != null && req.session.userfilloutmanually == 1 ) {
					if( "undefined" !== typeof req.session.first_name && req.session.first_name != "" && req.session.first_name != null ) {
						firstName = req.session.first_name;
					}
					if( "undefined" !== typeof req.session.last_name && req.session.last_name != "" && req.session.last_name != null ) {
						lastName = req.session.last_name;
					}
					if( "undefined" !== typeof req.session.security_number && req.session.security_number != "" && req.session.security_number != null ) {
						ssnNumber = req.session.security_number;
					}
				} else {
					req.session.userfilloutmanually = 1;
					if( !req.param( "first_name" ) ) {
						req.session.first_name = "";
					} else {
						firstName = req.param( "first_name" );
						req.session.first_name = req.param( "first_name" );
					}
					if( !req.param( "last_name" ) ) {
						req.session.last_name = "";
					} else {
						lastName = req.param( "last_name" );
						req.session.last_name = req.param( "last_name" );
					}
					if( !req.param( "security_number" ) ) {
						req.session.security_number = "";
					} else {
						ssnNumber = req.param( "security_number" );
						req.session.security_number = req.param( "security_number" );
					}
				}

				if( "undefined" !== typeof req.session.continueUserEmail && req.session.continueUserEmail != "" && req.session.continueUserEmail != null ) {
					emailAddress = req.session.continueUserEmail;
				}
			}

			userDetails = {
				firstName: firstName,
				lastName: lastName,
				ssnNumber: ssnNumber,
				emailAddress: emailAddress
			};

			// sails.log.info("userDetails:::::::::::",userDetails);
		} else {
			if( "undefined" === typeof userData.firstname || userData.firstname == "" || userData.firstname == null ) {
				if( "undefined" === typeof req.session.first_name && req.session.first_name == "" && req.session.first_name == null ) {
					userData.firstname = req.session.first_name;
				}
			}

			if( "undefined" === typeof userData.lastname || userData.lastname == "" || userData.lastname == null ) {
				if( "undefined" === typeof req.session.last_name && req.session.last_name == "" && req.session.last_name == null ) {
					userData.lastname = req.session.last_name;
				}
			}

			if( "undefined" === typeof userData.ssnNumber || userData.ssnNumber == "" || userData.ssnNumber == null ) {
				if( "undefined" === typeof req.session.security_number && req.session.security_number == "" && req.session.security_number == null ) {
					userData.ssnNumber = req.session.security_number;
				}
			}

			if( "undefined" === typeof userData.email || userData.email == "" || userData.email == null ) {
				if( "undefined" === typeof req.session.continueUserEmail && req.session.continueUserEmail == "" && req.session.continueUserEmail == null ) {
					userData.email = req.session.continueUserEmail;
				}
			}

			if( "undefined" === typeof req.session.isplaidConnected || req.session.isplaidConnected == "" || req.session.isplaidConnected == null ) {
				if( "undefined" !== typeof req.session.clicktosave && req.session.clicktosave != "" && req.session.clicktosave != null && req.session.clicktosave == "1" ) {
					req.session.userfilloutmanually = 1;
					if( !req.param( "first_name" ) ) {
						req.session.first_name = "";
					} else {
						var firstName = req.param( "first_name" );
						req.session.first_name = req.param( "first_name" );
					}
					if( !req.param( "last_name" ) ) {
						req.session.last_name = "";
					} else {
						var lastName = req.param( "last_name" );
						req.session.last_name = req.param( "last_name" );
					}
					if( !req.param( "security_number" ) ) {
						req.session.security_number = "";
					} else {
						var ssnNumber = req.param( "security_number" );
						req.session.security_number = req.param( "security_number" );
					}
					userData.firstname = firstName;
					userData.lastname = lastName;
					userData.ssnNumber = ssnNumber;
				}
			}

			userDetails = {
				firstName: userData.firstname,
				lastName: userData.lastname,
				ssnNumber: userData.ssnNumber,
				emailAddress: userData.email,
				phoneNumber: userData.phoneNumber,
				streetAddress: userData.street,
				state: userData.state,
				city: userData.city,
				zipCode: userData.zipCode
			};

			if( userDetails.ssnNumber == "666-60-3693" ) {
				userDetails.firstName = "Temeka";
				userDetails.lastName = "Adams";
				userDetails.emailAddress = "";
				userDetails.streetAddress = "8180 Briarwood St #10B";
				userDetails.city = "Stanton";
				userDetails.state = "CA";
				userDetails.zipCode = "90680";
			}
		}

		// sails.log.info("userDetails:::::::::",userDetails);

		State.getExistingState().then( function( states ) {
			/* PracticeManagement
				.find({isDeleted : false})
				.then(function (hospRes){
					res.view('frontend/home/userinformationfull',{states:states,navtab:2,userData:userDetails,hospRes:hospRes,errorval:errorval,saveforlater:'yes'});
				});
			*/

			let financeAmount = 0;
			if( "undefined" !== typeof req.session.continueFinanceAmount && req.session.continueFinanceAmount != "" && req.session.continueFinanceAmount != null ) {
				financeAmount = req.session.continueFinanceAmount;
			}

			const appPracticeId = req.session.appPracticeId;
			PracticeManagement.findOne( { id: appPracticeId, isDeleted: false } ).then( function( hospRes ) {
				res.view( "frontend/home/userinformationfull", {
					states: states,
					navtab: 2,
					userData: userDetails,
					hospRes: hospRes,
					errorval: errorval,
					saveforlater: "yes",
					minloanamount: sails.config.plaid.minrequestedamount,
					maxloanamount: sails.config.plaid.maxrequestedamount,
					minincomeamount: sails.config.plaid.minincomeamount,
					financeAmount: financeAmount
				} );
			} );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "PlaidUser#createForUserBankAccount:: err : ", err );
		return res.handleError( err );
	} );
}


function userinformationfullform( req, res ) {
	let errorval;
	let successval;
	const userEmailExisting = req.session.userEmail;

	if( req.session.errormsg != "" ) {
		errorval = req.session.errormsg;
		req.session.errormsg = "";
	}
	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}
	// req.session.userId	=	"5b61a4a9e0b1c448d5baf5af";
	// var userId = req.session.userId;
	const userId = req.session.userId ? req.session.userId : req.session.applicationuserId;
	const userinformation = req.allParams();

	sails.log.info( "isplaidEmpty::", req.session.isplaidEmpty );
	// if(req.session.isplaidEmpty)
	if( "undefined" !== typeof req.session.isplaidEmpty && req.session.isplaidEmpty != "" && req.session.isplaidEmpty != null ) {
		sails.log.info( "enter plaid empty loop::::::" );

		User.createNewUserProcess( req, res, userinformation )
		.then( function( userDetailsinfo ) {
			if( userDetailsinfo.code == 200 ) {
				// --Fixed live issue bug on Aug 20
				const userDetails = userDetailsinfo.userdetails;

				UserBankAccount.update( { id: req.session.tempuserBankAccountID }, { user: userDetails.id } ).exec( function afterwards( err, updated ) {
					const plaidNames = [];
					const plaidEmails = [];
					const plaidphoneNumbers = [];
					const plaidAddress = [];

					if( "undefined" !== typeof userDetails.firstname && userDetails.firstname != "" && userDetails.firstname != null ) {
						if( "undefined" !== typeof userDetails.middlename && userDetails.middlename != "" && userDetails.middlename != null ) {
							var fullname = userDetails.firstname + " " + userDetails.middlename + " " + userDetails.lastname;
						} else {
							var fullname = userDetails.firstname + " " + userDetails.lastname;
						}
						plaidNames.push( fullname );
					}

					if( "undefined" !== typeof userDetails.email && userDetails.email != "" && userDetails.email != null ) {
						const emailData = {
							primary: true,
							type: "e-mail",
							data: userDetails.email
						};

						plaidEmails.push( emailData );
					}

					if( "undefined" !== typeof userDetails.phoneNumber && userDetails.phoneNumber != "" && userDetails.phoneNumber != null ) {
						const phoneData = {
							primary: true,
							type: "mobile",
							data: userDetails.phoneNumber
						};
						plaidphoneNumbers.push( phoneData );
					}
					let userAddress = "";
					let userCity = "";
					let userzipCode = "";
					let userState = "other";

					if( "undefined" !== typeof userDetails.street && userDetails.street != "" && userDetails.street != null ) {
						userAddress = userDetails.street;
					}

					if( "undefined" !== typeof userDetails.city && userDetails.city != "" && userDetails.city != null ) {
						userCity = userDetails.city;
					}

					if( "undefined" !== typeof userDetails.zipCode && userDetails.zipCode != "" && userDetails.zipCode != null ) {
						userzipCode = userDetails.zipCode;
					}

					if( "undefined" !== typeof userDetails.state && userDetails.state != "" && userDetails.state != null ) {
						userState = userDetails.state;
					}

					const plaidAddressData = {
						primary: true,
						data: {
							street: userAddress,
							city: userCity,
							state: userState,
							zip: userzipCode
						}
					};
					plaidAddress.push( plaidAddressData );

					const plaidcriteria = {
						id: req.session.tempplaidID
					};
					const plaidupdate = {
						names: plaidNames,
						emails: plaidEmails,
						phoneNumbers: plaidphoneNumbers,
						addresses: plaidAddress,
						user: userDetails.id,
						isuserInput: 2
					};

					sails.log.info( "plaidcriteria:", plaidcriteria );
					sails.log.info( "plaidupdate:", plaidupdate );

					PlaidUser.update( plaidcriteria, plaidupdate ).exec( function afterwards( err, plaidUpdated ) {
						sails.log.info( "userDetails::::::", userDetails );
						// return res.redirect("/financeinformation");
						// var userInfo = userDetails.userdetails;

						// --Fixed live issue bug on Aug 20
						const userInfo = userDetailsinfo.userdetails;

						Screentracking.createLastScreenName( "Plaid", 2, userInfo, "", "", "" ).then( function( transResponse ) {
							// req.session.userId = userInfo.id;

							sails.log.info( "userInfo::::::", userInfo );

							req.session.applicationuserId = userInfo.id;
							req.session.userEmail = userInfo.email;

							User.sendRegistrationEmail( userDetails ).then( function( mailResponse ) {
								User.doTransunionProcess( res, req, userInfo ).then( function( transResponse ) {
									if( transResponse.code == 200 ) {
										return res.redirect( "/financeinformation" );
									} else {
										return res.redirect( "/loanfailure" );
									}
								} );
							} );
						} );
					} );
				} );
			} else {
				const errormsg = "Email already exist.";
				State.getExistingState().then( function( states ) {
					PracticeManagement.find( { isDeleted: false } ).then( function( hospRes ) {
						res.view( "frontend/home/userinformationfull", {
							states: states,
							navtab: 2,
							userData: userinformation,
							hospRes: hospRes,
							errormsg: errormsg,
							saveforlater: "yes"
						} );
					} );
				} );
			}
		} );
	} else {
		sails.log.info( "enter plaid else empty loop::::::" );

		User.registerNewUserApplication( userinformation, userId, userEmailExisting, req, res )
		.then( function( userDetails ) {
			if( userDetails.rescode == 200 ) {
				const userInfo = userDetails.result;

				User.sendRegistrationEmail( userInfo ).then( function( mailResponse ) {
					User.doTransunionProcess( res, req, userInfo ).then( function( transResponse ) {
						if( transResponse.code == 200 ) {
							return res.redirect( "/financeinformation" );
						} else {
							return res.redirect( "/loanfailure" );
						}
					} );
				} );
			} else {
				const userInputs = {
					firstName: userinformation.firstname,
					lastName: userinformation.lastname,
					ssnNumber: userinformation.ssnNumber,
					emailAddress: userinformation.email,
					phoneNumber: userinformation.phoneNumber,
					streetAddress: userinformation.street,
					state: userinformation.state,
					city: userinformation.city,
					zipCode: userinformation.zipCode
				};
				const errormsg = "Email already exist.";
				State.getExistingState().then( function( states ) {
					// PracticeManagement
					// .find({isDeleted : false})

					const appPracticeId = req.session.appPracticeId;
					PracticeManagement.findOne( { id: appPracticeId, isDeleted: false } ).then( function( hospRes ) {
						res.view( "frontend/home/userinformationfull", {
							states: states,
							navtab: 2,
							userData: userInputs,
							hospRes: hospRes,
							errormsg: errormsg,
							saveforlater: "yes"
						} );
					} );
				} );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "UserAddAction :: err :", err );
			return res.handleError( err );
		} );
	}
}

function userinformationfullmanualformAction( req, res ) {
	let errorval;
	let successval;
	const userEmailExisting = req.session.userEmail;

	if( req.session.errormsg != "" ) {
		errorval = req.session.errormsg;
		req.session.errormsg = "";
	}
	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}

	const userId = req.session.userId ? req.session.userId : req.session.applicationuserId;
	const userinformation = req.allParams();

	let annualincome = req.param( "annualincome" );
	annualincome = annualincome.replace( "$ ", "" );
	annualincome = annualincome.replace( /,/g, "" );
	annualincome = annualincome.replace( " ", "" );
	let financedAmount = req.param( "financedAmount" );
	financedAmount = financedAmount.replace( "$ ", "" );
	financedAmount = financedAmount.replace( /,/g, "" );
	financedAmount = financedAmount.replace( " ", "" );

	User.registerNewUserApplication( userinformation, userId, userEmailExisting, req, res )
	.then( function( userDetails ) {
		if( userDetails.rescode == 200 ) {
			const userInfo = userDetails.result;

			// -- To avoid hitting transunion and sending mail again
			if( "undefined" !== typeof req.session.manualUserID && req.session.manualUserID != "" && req.session.manualUserID != null ) {
				const screenCriteria = { user: userId, iscompleted: 0 };
				Screentracking.findOne( screenCriteria )
				.sort( "createdAt DESC" )
				.then( function( screendata ) {
					screendata.requestedLoanAmount = financedAmount;
					screendata.incomeamount = annualincome;
					screendata.filloutmanually = 1;
					screendata.save( function( err ) {
						const json = {
							status: 200,
							message: "User updated successfully",
							leveltype: 5
						};
						res.contentType( "application/json" );
						res.json( json );
					} );
				} )
				.catch( function( err ) {
					const json = {
						status: 200,
						message: "User updated successfully",
						leveltype: 4
					};
					res.contentType( "application/json" );
					res.json( json );
				} );
			} else if( "undefined" !== typeof req.session.clicktosave && req.session.clicktosave != "" && req.session.clicktosave != null ) {
				User.doTransunionProcess( res, req, userInfo ).then( function( transResponse ) {
					if( transResponse.code == 200 ) {
						// -- manualUserID set here
						req.session.manualUserID = userId;
						req.session.clicktosave = "";
						const screenCriteria = { user: userId, iscompleted: 0 };
						Screentracking.findOne( screenCriteria )
						.sort( "createdAt DESC" )
						.then( function( screendata ) {
							screendata.requestedLoanAmount = financedAmount;
							screendata.incomeamount = annualincome;
							screendata.filloutmanually = 1;
							screendata.save( function( err ) {
								User.findOne( { id: userId } ).then( function( user ) {
									user.clicktosave = 0;
									user.save( function( err ) {
										const json = {
											status: 200,
											message: "User created successfully",
											leveltype: 3
										};
										res.contentType( "application/json" );
										res.json( json );
									} );
								} );
							} );
						} )
						.catch( function( err ) {
							const json = {
								status: 200,
								message: "User registered successfully",
								leveltype: 2
							};
							res.contentType( "application/json" );
							res.json( json );
						} );
					} else {
						const json = {
							status: 500,
							message: "User registered successfully with application failure",
							leveltype: 1
						};
						res.contentType( "application/json" );
						res.json( json );
					}
				} );
			} else {
				User.sendRegistrationEmail( userInfo ).then( function( mailResponse ) {
					User.doTransunionProcess( res, req, userInfo ).then( function( transResponse ) {
						if( transResponse.code == 200 ) {
							// -- manualUserID set here
							req.session.manualUserID = userId;

							const screenCriteria = { user: userId, iscompleted: 0 };
							Screentracking.findOne( screenCriteria )
							.sort( "createdAt DESC" )
							.then( function( screendata ) {
								screendata.requestedLoanAmount = financedAmount;
								screendata.incomeamount = annualincome;
								screendata.filloutmanually = 1;
								screendata.save( function( err ) {
									const json = {
										status: 200,
										message: "User created successfully",
										leveltype: 3
									};
									res.contentType( "application/json" );
									res.json( json );
								} );
							} )
							.catch( function( err ) {
								const json = {
									status: 200,
									message: "User registered successfully",
									leveltype: 2
								};
								res.contentType( "application/json" );
								res.json( json );
							} );
						} else {
							const json = {
								status: 500,
								message: "User registered successfully with application failure",
								leveltype: 1
							};
							res.contentType( "application/json" );
							res.json( json );
						}
					} );
				} );
			}
		} else {
			const json = {
				status: 400,
				message: "Email already exist",
				leveltype: 0
			};
			res.contentType( "application/json" );
			res.json( json );
		}
	} )
	.catch( function( err ) {
		const json = {
			status: 400,
			message: "Unable to register user. Please try again later.",
			leveltype: 0
		};
		res.contentType( "application/json" );
		res.json( json );
	} );
}

function controlcenterAction( req, res ) {
	res.view( "frontend/home/controlcenter" );
}

function applyloginAction( req, res ) {
	User.findOne( { email: req.param( "email" ) } )
	.populate( "role" )
	.then( function( userinfo ) {
		const emailstatus = userinfo.isEmailVerified;

		if( !userinfo ) {
			req.session.errormsg = "";
			req.session.errormsg = "Invalid Username and Password";
			return res.redirect( "/logintfc" );
		}

		// userinfo.logintype ='frontend';

		passport.authenticate( "user-local", function( err, userinfo, info ) {
			if( err || !userinfo ) {
				const json = {
					status: 400,
					message: "INSUFFICIENT_DATA"
				};
				req.session.errormsg = "";
				req.session.errormsg = "Invalid Username and Password";
				return res.redirect( "/logintfc" );
			}

			// if(emailstatus == true){

			req.logIn( userinfo, function( err ) {
				if( err ) {
					res.handleError( err );
				}
				req.session.userId = userinfo.id;
				req.session.loginType = "frontend";
				req.session.levels = "1";

				const screenCriteria = { user: userinfo.id, iscompleted: [ 0, 2 ] };

				Screentracking.findOne( screenCriteria )
				.then( function( screendata ) {
					if( screendata ) {
						return res.redirect( "/dashboard" );
					} else {
						return res.redirect( "/createapplication" );
					}
				} )
				.catch( function( err ) {
					sails.log.error( "HomeController#loginAction :: err :", err );
					return res.handleError( err );
				} );
			} );

			// }
			/* else
		{

			req.session.errormsg='';
			req.session.errormsg = 'Please Verify Your Email.';
			//return res.redirect("/signin");
			return res.redirect("/");
		}*/
		} )( req, res );
	} )
	.catch( function( err ) {
		req.session.errormsg = "";
		req.session.errormsg = "Invalid Username and Password";
		return res.redirect( "/logintfc" );
	} );
}

function createUserAction( req, res ) {
	let errorval = "";
	let successval = "";
	if( req.session.errormsg != "" ) {
		errorval = req.session.errormsg;
		req.session.errormsg = "";
	}
	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}
	res.view( "frontend/home/apply", { error: errorval, successval: successval } );
}

function verifyUserAction( req, res, email ) {
	let errorval = "";
	let successval = "";

	sails.log.info( "---userinfo" );

	if( req.session.errormsg != "" ) {
		errorval = req.session.errormsg;
		req.session.errormsg = "";
	}
	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}

	res.view( "frontend/home/signin", { error: errorval, successval: successval } );
}


function addUser( req, res ) {
	let redirectUrl = "/apply";
	const reqParams = req.allParams();
	const userinfo = {
		userReference: "",
		practicemanagement: reqParams.practicemanagement,
		firstname: reqParams.firstname.trim(),
		middlename: reqParams.middlename.trim(),
		lastname: reqParams.lastname.trim(),
		isPhoneVerified: reqParams.isPhoneVerified,
		generationCode: "",
		email: reqParams.email.trim(),
		phoneNumber: reqParams.phone.trim(),
		street: null,
		unitapt: null,
		city: null,
		state: null,
		_state: null,//been
		zipCode: null,
		ssn_number: null,
		dateofBirth: null,
		consentChecked: null,
		role: reqParams.role,
		password: reqParams.password,
		salt: ""
	};
	let user = null;
	let userExists = false;
	let levelofapplication = 0;
	sails.log.info( "first screen:", userinfo );
	return new Promise((resolve) => {
		return User.userExists(userinfo.email).then((exists) => {
			userExists = exists;
			if (userExists) {
				return User.findOne({ email: userinfo.email })
					.then(userfound => {
						return Screentracking.findOne({ user: userfound.email })
							.then((screentrack) => {
								if (screentrack) {
									levelofapplication = screentrack.lastlevel;
								} else {
									levelofapplication = 1;
								}
								return resolve(true);
							});
					})
			}
			return resolve(true);
		});
	}).then(() => {
		if (userExists && levelofapplication != 1) {
			let alreadyExistsUrl = "/userAlreadyExists";
			return res.redirect(alreadyExistsUrl);
		} else {
			User.createNewUser( req, res, userinfo )
			.then( async( userInfo ) => {
				sails.log.info( "first screen:", userInfo, userInfo.code  );
				if( userInfo.code == 400 ) { // error creating user check for dupusererror or reapply error
					const practice = await PracticeManagement.findOne({ id: reqParams.practicemanagement });
					userInfo.urlproject = practice.UrlSlug;
					console.log('=============================>>>',userInfo)
					return res.view( "frontend/application/userinformation", userInfo );
				} else {
					user = userInfo.userdetails;
					if( typeof reqParams.practicemanagement != "string" ) {
						sails.log.error( "addUser; missing or invalid practicemanagement" );
						return res.redirect( redirectUrl );
					}
					return new Promise( ( resolve ) => {
						req.session.regenerate( resolve );
					} )
					.then( () => {
						return PracticeManagement.findOne( { id: reqParams.practicemanagement, isDeleted: false } )
						.then( ( practicemanagement ) => {
							if( !practicemanagement ) {
								sails.log.error( "addUser; practicemanagement not found:", reqParams.practicemanagement );
								redirectUrl = "/apply";
								return res.redirect( redirectUrl );
							}
							redirectUrl = `/${practicemanagement.UrlSlug}`;
						} )
						.then( () => {
							if( !req.form.isValid ) {
								const validationErrors = ValidationService.getValidationErrors( req.form.getErrors() );
								sails.log.error( "HomeController.addUser; validationErrors:", validationErrors );
								redirectUrl = "/apply";
								return res.redirect( redirectUrl );
							}
							Roles.findOne( { rolename: "User" } )
							.then( async( roleData ) => {
								const userId = req.session.userId;
								sails.log.info( "HomeController.addUser; userId ", userId );
								req.session.practiceId = userinfo.practicemanagement;
								req.session.loginType = "frontend";
								req.session.levels = 1;
								req.session.deferUser = reqParams;
								req.session.deferUser.role = roleData.id;
								req.session.deferUser.isPhoneVerified = true;
								req.session.deferUser.phoneNumber = reqParams.phone;
								delete req.session.deferUser.phone;
								Agreement.find( { practicemanagement: reqParams.practicemanagement } )
								.then( ( agreements ) => {
									sails.log.info( "agreements", agreements );
									// get the path for document keys 120(esign), 125(creditAuth), 126(sms)
									agreements.forEach( ( agreement ) => {
										if( agreement.documentKey == "120" ) {
											req.session.esignPath = agreement.documentPath + ".nunjucks";
										}
										if( agreement.documentKey == "125" ) {
											req.session.creditAuthPath = agreement.documentPath + ".nunjucks";
										}
										if( agreement.documentKey == "126" ) {
											req.session.smsPath = agreement.documentPath + ".nunjucks";
										}
									} );
									redirectUrl = "/createapplication";
									return res.redirect( redirectUrl );
								} );
								// return User.registerNewUser( req.form, roleId, userId )
								// .then( ( user ) => {
								// 	if( user.code == 200 ) {
								// 		const loginuserdetails = user.userdetails;
								// 		req.session.userId = loginuserdetails.id;
								// 		req.session.loginType = "frontend";
								// 		const emailId = user.userdetails.email;
								// 		return User.findOne( { email: emailId } )
								// 		.populate( "role" )
								// 		.then( ( userinfo ) => {
								// 			passport.authenticate( "user-local", ( err, userinfo, info ) => {
								// 				sails.log.verbose( "HomeController.addUser; userinfo:", userinfo );
								// 				if( err || ! userinfo ) {
								// 					sails.log.error( "HomeController.addUser; passport.authenticate() err:", err );
								// 					req.session.errormsg = "Invalid Username and Password";
								// 					return res.redirect( redirectUrl );
								// 				}
								// 				req.logIn( userinfo, ( err ) => {
								// 					if( err ) {
								// 						// res.handleError( err );
								// 						sails.log.error( "HomeController.addUser; req.logIn() err:", err );
								// 						return res.redirect( redirectUrl );
								// 					}
								// 					return UserController.sendTextInviteInternal( userinfo.id )
								// 					.then( ( results ) => {
								// 						req.session.userId = userinfo.id;
								// 						req.session.practiceId = userinfo.practicemanagement;
								// 						req.session.loginType = "frontend";
								// 						req.session.levels = 1;
								// 						redirectUrl = "/createapplication";
								// 						return res.redirect( redirectUrl );
								// 					} );
								// 				} );
								// 			} )( req, res );
								// 		} );
								// 	} else {
								// 		if( user.code == 401 ) {
								// 			req.session.reapplyerror = "Thank you for reapplying with " + sails.config.lender.shortName + ". At this time we could not offer you a loan, please reapply in " + user.days + " day(s).";
								// 			return res.redirect( redirectUrl );
								// 		} else {
								// 			req.session.existingerror = "You already have an account with " + sails.config.lender.shortName + ", please sign in with your existing account.";
								// 			return res.redirect( redirectUrl );
								// 		}
								// 	}
								// } )
								// .catch( ( err ) => {
								// 	sails.log.error( 'HomeController#addnewuserAction :: err :', err );
								// 	return res.handleError( err );
								// } );
								// " + sails.config.lender.shortName + "
							} );
						} );
					} )
					.catch( ( err ) => {
						sails.log.error( "HomeController#addnewuserAction :: err :", err );
						return res.handleError( err );
					} );
				}
				// req.logIn( userinfo, ( err ) => {
				// 	if( err ) {
				// 		// res.handleError( err );
				// 		sails.log.error( "createApplicationPost; req.logIn() err:", err );
				// 	}
				// })


				// delete req.session.deferUser;
				// return new Promise( ( resolve ) => {
				// 	req.session.regenerate( resolve );
				// } )
				// .then( () => {
				// 	user = userInfo.userdetails;
				// 	req.session.userId = user.id;
				// 	req.session.loginType = "frontend";
				// 	return new Promise( ( resolve, reject ) => {
				// 		const userinfo = {
				// 			email: user.email,
				// 			firstname: user.firstname,
				// 			lastname: user.lastname,
				// 			createdAt: user.createdAt,
				// 			role: user.role,
				// 			id: user.id,
				// 			practicemanagement: user.practicemanagement,
				// 			logintype: "user-local" // muy importante
				// 		};
				// 		req.logIn( userinfo, ( err ) => {
				// 			if( err ) {
				// 				// res.handleError( err );
				// 				sails.log.error( "createApplicationPost; req.logIn() err:", err );
				// 				return reject( err );
				// 			}
				// 			// return UserController.sendTextInviteInternal( userinfo.id )
				// 			// .then( ( results ) => {
				// 			req.session.userId = userinfo.id;
				// 			req.session.practiceId = userinfo.practicemanagement;
				// 			req.session.loginType = "frontend";
				// 			req.session.levels = 1;
				// 			return resolve();
				// 			// 	redirectUrl = "/createapplication";
				// 			// 	return res.redirect( redirectUrl );
				// 			// } );
				// 		} );
				// 	} );
				// } )
				} )
			.catch( ( err ) => {
				sails.log.error( " err:", err );
			} );
		}
	});
}


function willLogin( req, res ) {
	const verifyemail = req.param( "verifyemail" );
	if( verifyemail ) {
		req.session.shouldVerifyEmail = true;
	}
	let errorval = "";
	let successval = "";
	if( req.session.errormsg != "" ) {
		errorval = req.session.errormsg;
		req.session.errormsg = "";
	}
	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}
	const userid = req.session.userId;
	if( !userid ) {
		res.view( "frontend/home/login", { error: errorval, successval: successval } );
	} else {
		const redirectpath = "/dashboard";
		return res.redirect( redirectpath );
	}
}


function login( req, res ) {
	return HomeService.login( req, res, "/login" );
}


// function logout( req, res ) {
// 	req.session.userId = "";
// 	req.session.reapply = "";
// 	req.logout();
// 	// req.session.destroy();
// 	req.flash( "error", "" );
// 	req.session.logReferenceID = "";
// 	// res.redirect('/signin');
// 	// res.redirect('/');

// 	const appPracticeId = req.session.appPracticeId;
// 	const appPracticeSlug = req.session.appPracticeSlug;
// 	req.session.appPracticeId = "";
// 	req.session.appPracticeSlug = "";
// 	res.redirect( "/" + appPracticeSlug );
// }


function logout( req, res ) {
	return new Promise( ( resolve ) => {
		req.logout();
		req.session.destroy( resolve );
	} )
	.then( () => res.redirect( "/apply" ) );
}

function practicehome( req, res ) {
	let practiceHome = "/apply";
	const practiceId = req.session.practiceId;
	return PracticeManagement.findOne( { id: practiceId } )
	.then( ( practiceInfo ) => {
		if( practiceInfo.PracticeHome ) {
			practiceHome = practiceInfo.PracticeHome;
		} else if( practiceInfo.PracticeUrl ) {
			practiceHome = practiceInfo.PracticeUrl;
		}
		return new Promise( ( resolve ) => {
			req.logout();
			req.session.destroy( resolve );
		} );
	} )
	.then( () => res.redirect( practiceHome ) );
}

function forgotpasswordAction( req, res ) {
	let errorval = "";
	let successval = "";
	if( req.session.errormsg != "" ) {
		errorval = req.session.errormsg;
		req.session.errormsg = "";
	}
	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}
	if( req.session.passerror != "" ) {
		errorval = req.session.passerror;
		req.session.passerror = "";
	}
	// sails.log.info('req.session.appPracticeId',req.session.appPracticeId);

	res.view( "frontend/home/forgotpassword", {
		error: errorval,
		successval: successval
	} );

	// -- Blocked for new member login design
	/* if ("undefined" !== typeof req.session.appPracticeId && req.session.appPracticeId!='' && req.session.appPracticeId!=null && "undefined" !== typeof req.session.appPracticeSlug && req.session.appPracticeSlug!='' && req.session.appPracticeSlug!=null )
		{
			var appPracticeId   =  req.session.appPracticeId;
			var appPracticeSlug = req.session.appPracticeSlug;

			 res.view("frontend/home/forgotpassword", {
				error: errorval,successval: successval,appPracticeSlug:appPracticeSlug
			 });
		}
		else
		{
			res.view("practice/error/errorpage", {
				code: 404,
				data: 'Page not found',
				layout: 'layout'
			});
		}*/
}

function changepasswordAction( req, res ) {
	const email = req.param( "email" );
	const userObj = {
		email: email
	};

	User.forgotpassword( userObj )
	.then( function( user ) {
		if( user.code == 404 ) {
			req.session.errormsg = "";
			req.session.errormsg = "No account with that email address exists.";
			return res.redirect( "/forgotpassword" );
		}
		if( user.code == 400 ) {
			req.session.successval = "";
			req.session.successval = "Please Check Your Email.";
			return res.redirect( "/forgotpassword" );
		}
	} )
	.catch( function( err ) {
		sails.log.error( "HomeController#getpwdAction :: err", err );
		return res.handleError( err );
	} );
}

function setpasswordAction( req, res, id ) {
	let errorval = "";
	let successval = "";
	var id = req.param( "id" );

	if( req.session.passerror != "" ) {
		errorval = req.session.passerror;
		req.session.passerror = "";
	}
	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}

	User.findOne( { id: id } )
	.populate( "practicemanagement" )
	.then( function( userinfo ) {
		if( userinfo ) {
			if( userinfo.practicemanagement ) {
				const practiceData = userinfo.practicemanagement;
				var appPracticeId = practiceData.id;
				var appPracticeSlug = practiceData.UrlSlug;
			} else {
				var appPracticeId = "";
				var appPracticeSlug = "";
			}

			// sails.log.info("appPracticeId::",appPracticeId);
			// sails.log.info("appPracticeSlug::",appPracticeSlug);

			if( !userinfo.isEmailVerified ) {
				res.view( "frontend/home/setpassword", {
					error: errorval,
					successval: successval,
					id: id,
					appPracticeId: appPracticeId,
					appPracticeSlug: appPracticeSlug
				} );
			} else {
				// return res.redirect('signin');
				if( userinfo.practicemanagement ) {
					// return res.redirect('/'+appPracticeSlug);
					return res.redirect( "/login" );
				} else {
					return res.redirect( "/" );
				}
			}
		} else {
			// return res.redirect('signin');
			return res.redirect( "/" );
		}
	} )
	.catch( function( err ) {
		// return res.redirect('signin');
		return res.redirect( "/" );
	} );
}

function updatepasswordAction( req, res ) {
	const email = req.param( "email" );
	const newpassword = req.param( "password" );
	const confirmpass = req.param( "confirm_pwd" );
	const userid = req.param( "userid" );
	const userObj = { email: email };

	User.findOne( { email: req.param( "email" ) } )
	.then( function( userinfo ) {
		if( !userinfo ) {
			req.session.passerror = "";
			req.session.passerror = "Invalid email address!";
			return res.redirect( "/setpassword/" + userid );
		}

		const roleCriteria = {
			id: userinfo.role
		};
		Roles.findOne( roleCriteria )
		.then( function( roledata ) {
			userinfo.role = roledata;

			const emailstatus = userinfo.isEmailVerified;

			userinfo.password = newpassword;
			const salt = User.generateSalt();

			User.generateEncryptedPassword( userinfo, salt ).then( function( encryptedPassword ) {
				userinfo.password = encryptedPassword;
				userinfo.salt = salt;
				userinfo.emailreset = true;
				userinfo.isEmailVerified = true;
				userinfo.save( function( err ) {
					if( err ) {
						const json = {
							status: 500,
							message: "Unable to update Password!"
						};
						req.session.passerror = "";
						req.session.passerror = "Unable to update Password!!";
						return res.redirect( "/setpassword/" + userinfo.id );
					}

					passport.authenticate( "user-local", function( err, userinfo, info ) {
						if( err || !userinfo ) {
							const json = {
								status: 500,
								message: "Unable to update Password!"
							};
							req.session.passerror = "";
							req.session.passerror = "Unable to update Password!!";
							return res.redirect( "/setpassword/" + userinfo.id );
						}

						req.logIn( userinfo, function( err ) {
							req.session.userId = userinfo.id;
							req.session.loginType = "frontend";
							req.session.loginusername = userinfo.firstname;

							sails.log.info( "login info============", userinfo );

							if( userinfo ) {
								const usercriteria = {
									id: userinfo.id
								};

								sails.log.info( "practicecriteria::", usercriteria );

								User.findOne( usercriteria )
								.populate( "practicemanagement" )
								.then( function( userDetails ) {
									sails.log.info( "userDetails::", userDetails );

									if( userDetails.practicemanagement ) {
										const practicedata = userDetails.practicemanagement;
										req.session.appPracticeId = practicedata.id;
										req.session.appPracticeSlug = practicedata.UrlSlug;
										return res.redirect( "/dashboard" );
									} else {
										return res.redirect( "/" );
									}
								} )
								.catch( function( err ) {
									return res.redirect( "/" );
								} );
							} else {
								return res.redirect( "/" );
							}
						} );
					} )( req, res );
				} );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "HomeController#updatepasswordAction :: err", err );
			return res.handleError( err );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "HomeController#updatepasswordAction :: err", err );
		return res.handleError( err );
	} );
}

function emailverifyAction( req, res, id ) {
	const userid = req.param( "id" );
	User.findOne( { id: userid } )
	.then( function( user ) {
		user.isEmailVerified = true;
		user.save( function( err ) {
			Screentracking.checktodolistcount( userid )
			.then( function( achstatus ) {
				req.session.successval = "";
				req.session.successval = "Email has been verified successfully!";
				return res.redirect( "/apply" );
			} )
			.catch( function( err ) {
				sails.log.error( "HomeController#emailverifyAction :: err", err );
				return res.handleError( err );
			} );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "HomeController#emailverifyAction :: err", err );
		return res.handleError( err );
	} );
}

function myprofileAction( req, res ) {
	let errorval = "";
	let successval = "";
	if( req.session.errorval != "" ) {
		errorval = req.session.errorval;
		req.session.errorval = "";
	}
	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}
	const userid = req.session.userId;
	User.findOne( { id: userid } ).then( function( user ) {
		const user_id = user.id;
		const firstname = user.firstname;
		const lastname = user.lastname;
		const email = user.email;
		const phoneNumber = user.phoneNumber;
		const registerDate = user.createdAt.toString();
		const regisDt = registerDate.replace( "T", " " ).slice( 3, 16 );
		const updatedate = user.updatedAt.toString();
		const lastUpdateDt = updatedate.replace( "T", " " ).slice( 3, 16 );
		const dateofbirth = user.dateOfBirth;
		const street = user.street;
		const state = user.state;
		const unitappartment = user.unitappartment;
		const city = user.city;
		const zipCode = user.zipCode;
		res.view( "frontend/home/myprofile", { firstname: firstname, lastname: lastname, email: email, phoneNumber: phoneNumber, registerDate: regisDt, updatedate: lastUpdateDt, user_id: user_id, city: city, street: street, unitapp: unitappartment, zip: zipCode, state: state, dateofbirth: dateofbirth, user: user, errorval: errorval, successval: successval } );
	} );
}
function mydocumentsAction( req, res ) {
	let successval = "";
	let errorval = "";
	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}
	if( req.session.passerror != "" ) {
		errorval = req.session.passerror;
		req.session.passerror = "";
	}

	const userid = req.session.userId;
	Achdocuments.find( { user: userid } )
	.populate( "proofdocument" )
	.then( function( achdocument ) {
		if( achdocument ) {
			_.forEach( achdocument, function( documentvalue ) {
				if( documentvalue.proofdocument ) {
					if( documentvalue.proofdocument.standardResolution ) {
						documentvalue.proofdocument.standardResolution = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
					}
				}
			} );
		}
		UserConsent.find( { user: userid } ).then( function( pdfdocument ) {
			if( pdfdocument ) {
				_.each( pdfdocument, function( documemts ) {
					if( documemts.agreementpath ) {
						documemts.agreementpath = Utils.getS3Url( documemts.agreementpath );
					}
				} );
			}
			PaymentManagement.find( { user: userid } )
			.populate( "user" )
			.then( function( paymentmanagementdetails ) {
				Screentracking.find( { user: userid } )
				.populate( "user" )
				// .populate('transunion')
				.then( function( screentrackingdetails ) {
					if( screentrackingdetails[ 0 ] ) {
						var creditscore = screentrackingdetails[ 0 ].creditscore;
						// var creditscore = screentrackingdetails[0].transunion.response.product.subject.subjectRecord.addOnProduct.scoreModel.score.results;
					}
					res.view( "frontend/banktransaction/mydocuments", { achdocument: achdocument, pdfdocument: pdfdocument, paymentmanagementdetails: paymentmanagementdetails, screentrackingdetails: screentrackingdetails, creditscore: creditscore, success: successval, error: errorval } );
				} );
			} );
		} );
	} );
}

function updateemailAction( req, res ) {
	const emailAddress = req.param( "email_id" );
	const userid = req.session.userId;
	const checkcriteria = {
		email: emailAddress,
		isDeleted: false
	};

	sails.log.info( "checkcriteria", checkcriteria );

	User.findOne( checkcriteria ).then( function( userDetails ) {
		if( userDetails ) {
			const json = {
				status: 400,
				message: "Email Already Exists."
			};
			res.contentType( "application/json" );
			res.json( json );
		} else {
			User.findOne( userid ).then( function( data ) {
				data.email = emailAddress;
				data.save( function( err ) {
					const json = {
						status: 200,
						message: "Email Address Updated Successfully."
					};
					res.contentType( "application/json" );
					res.json( json );
				} );
			} );
		}
	} );
}

function UpdateuserphonenumberAction( req, res ) {
	const phonenumber = req.param( "phonenumber" );
	const userid = req.session.userId;
	console.log( "phone : ", phonenumber );
	const criteria = {
		phoneNumber: phonenumber,
		isDeleted: false
	};
	User.findOne( criteria ).then( function( userDetails ) {
		if( userDetails ) {
			console.log( "Already Exists." );
			const json = {
				status: 400,
				message: "Phonenumber Already Exists."
			};
			res.contentType( "application/json" );
			res.json( json );
		} else {
			User.findOne( userid ).then( function( userinformation ) {
				userinformation.phoneNumber = phonenumber;
				userinformation.save( function( err ) {
					const json = {
						status: 404,
						message: "Phonenumber Updated Successfully."
					};
					res.contentType( "application/json" );
					res.json( json );
				} );
			} );
		}
	} );
}
function esignatureAction( req, res ) {
	const userId = req.param( "id" );
	res.view( "customerService/esignature", { userid: userId } );
}

function editprofileAction( req, res ) {
	let errorval = "";
	let successval = "";
	if( req.session.errorval != "" ) {
		errorval = req.session.errorval;
		req.session.errorval = "";
	}
	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}
	const userid = req.session.userId;
	User.findOne( { id: userid } ).then( function( user ) {
		const firstname = user.firstname;
		const lastname = user.lastname;
		const email = user.email;
		const phoneNumber = user.phoneNumber;
		const street = user.street;
		const Appartment = user.unitappartment;
		const City = user.city;
		const state = user.state;
		const Zip = user.zipCode;
		const Notifiemail = user.notifiemail;
		const Notifimobile = user.notifimobile;
		const birth = user.dateOfBirth;
		const userprofile = user.userprofile;

		const isEmailVerified = user.isEmailVerified;
		const isBankAdded = user.isBankAdded;
		const isGovernmentIssued = user.isGovernmentIssued;
		const isPayroll = user.isPayroll;
		let totdocount = 0;
		if( !isEmailVerified ) {
			totdocount++;
		}

		if( !isBankAdded ) {
			totdocount++;
		}

		if( !isGovernmentIssued ) {
			totdocount++;
		}

		if( !isPayroll ) {
			totdocount++;
		}

		State.getExistingState().then( function( states ) {
			const loanCriteria = {
				user: userid,
				$or: [ { status: "OPENED" }, { status: "PAID OFF" }, { status: "CLOSED" }, { status: "DENIED" } ],
				achstatus: [ 0, 1, 2, 3, 4 ]
			};

			PaymentManagement.find( loanCriteria )
			.sort( "createdAt DESC" )
			.then( function( paymentmanagementdata ) {
				let loanCount = 0;
				let incompleteCount = 0;
				let loanData = [];
				const screenData = [];
				if( paymentmanagementdata ) {
					loanCount = paymentmanagementdata.length;
					loanData = paymentmanagementdata;
				}

				_.forEach( paymentmanagementdata, function( paydata ) {
					paydata.totdocount = totdocount;
				} );

				const screenCriteria = {
					user: userid,
					iscompleted: [ 0, 2 ]
				};

				Screentracking.find( screenCriteria )
				.sort( "createdAt DESC" )
				.then( function( screentrackingdetails ) {
					if( screentrackingdetails ) {
						incompleteCount = screentrackingdetails.length;

						/* _.forEach(screentrackingdetails, function(screenDetails) {
							  screenDetails.totdocount = totdocount;
							});*/

						var screenData = screentrackingdetails;
						let isBankAddedPending = 0;
						_.forEach( screenData, function( screenDetails ) {
							screenDetails.totdocount = totdocount;
							if( screenDetails.ispromissorycompleted == 0 ) {
								if( screenDetails.isoffercompleted == 0 ) {
									if( !screenDetails.isBankAdded ) {
										screenDetails.isBankAdded = 0;
									}

									if( screenDetails.isBankAdded == 0 ) {
										isBankAddedPending = parseInt( isBankAddedPending ) + 1;
									}
								}
							}
						} );
					}
					const responsedata = {
						loanData: loanData,
						screenData: screenData,
						loanCount: loanCount,
						incompleteCount: incompleteCount,
						firstname: firstname,
						lastname: lastname,
						email: email,
						phoneNumber: phoneNumber,
						states: states,
						street: street,
						Appartment: Appartment,
						City: City,
						Zip: Zip,
						birth: birth,
						state: state,
						errorval: errorval,
						successval: successval,
						Notifiemail: Notifiemail,
						Notifimobile: Notifimobile,
						userprofile: userprofile
					};
					sails.log.info( "Final responsedata:", responsedata );
					res.view( "frontend/home/editprofile", responsedata );
				} )
				.catch( function( err ) {
					return res.handleError( err );
				} );
			} )
			.catch( function( err ) {
				return res.handleError( err );
			} );
		} );
	} );
}

function edituserdetailsAction( req, res ) {
	const emailAddress = req.param( "email" );
	const firstName = req.param( "firstname" );
	const lastName = req.param( "lastname" );
	const phoneNumber = req.param( "phoneNumber" );
	const street = req.param( "street" );
	const unitapp = req.param( "unitappartment" );
	const city = req.param( "city" );
	const state = req.param( "state" );
	const zipcode = req.param( "zipCode" );
	const dateofbirth = req.param( "dob" );
	const userid = req.session.userId;
	let number;
	let email_id;
	User.findOne( userid ).then( function( userDetails ) {
		const number = userDetails.phoneNumber;
		const email_id = userDetails.email;
		if( number != phoneNumber ) {
			const phonecriteria = {
				phoneNumber: phoneNumber,
				isDeleted: false
			};
			User.findOne( phonecriteria ).then( function( data ) {
				if( data ) {
					req.session.errormsg != "";
					req.session.errorval = "phoneNumber Already exists";
					return res.redirect( "/editprofile" );
				}
			} );
		} else if( email_id != emailAddress ) {
			const emailcriteria = {
				email: emailAddress,
				isDeleted: false
			};
			User.findOne( emailcriteria ).then( function( data ) {
				if( data ) {
					req.session.errormsg != "";
					req.session.errorval = "email Already exists";
					return res.redirect( "/editprofile" );
				}
			} );
		} else {
			userDetails.firstname = firstName;
			userDetails.lastname = lastName;
			userDetails.street = street;
			userDetails.unitappartment = unitapp;
			userDetails.city = city;
			userDetails.state = state;
			userDetails.dateOfBirth = dateofbirth;
			userDetails.zipCode = zipcode;
			userDetails.phoneNumber = phoneNumber;
			userDetails.email = emailAddress;
			userDetails.save( function( err ) {
				if( userDetails ) {
					const responsedata = {
						user: userDetails
					};
					req.session.successval = "";
					req.session.successval = "Updated Successfuly.";
					return res.redirect( "/myprofile" );
				}
			} );
		}
	} );
}

function profileEmailVerificationAction( req, res ) {
	const user_id = req.session.userId;
	const user = { id: user_id };
	User.findOne( user ).then( function( userdetails ) {
		const email_id = userdetails.email;
		const email_status = userdetails.isEmailVerified;
		if( email_status == false ) {
			EmailService.profileEmailSend( userdetails );

			/* var modulename = 'Email verification';
			var modulemessage = 'Email verification for user';
			req.logdata= userdetails;
			Logactivity.registerLogActivity(req,modulename,modulemessage);*/

			const userreq = {};
			const usersubject = "Account Verification";
			const userdescription = "Account Verification for user!";
			userreq.userid = user_id;
			userreq.logdata = "Account Verification for user - " + email_id;
			Useractivity.createUserActivity( userreq, usersubject, userdescription );

			req.session.successval = "";
			req.session.successval = "Please check your email to verify your account.";
			res.redirect( "/dashboard" );
		} else {
			console.log( "email verified" );
		}
	} );
}

function profileEmailverify( req, res, id ) {
	const userid = req.param( "id" );

	sails.log.info( "userid:", userid );

	User.findOne( { id: userid } )
	.then( function( userinfo ) {
		if( userinfo ) {
			// if(userinfo.isEmailVerified==false)
			if( !userinfo.emailreset ) {
				const redirectUrl = "/setpassword/" + userinfo.id;
				return res.redirect( redirectUrl );
			} else {
				userinfo.isEmailVerified = true;
				userinfo.save( function( err ) {
					req.session.successval = "";
					req.session.successval = "Account has been verified successfully!";

					User.findOne( { id: userinfo.id } )
					.populate( "practicemanagement" )
					.then( function( userDetails ) {
						sails.log.info( "userDetails:", userDetails );

						if( userDetails.practicemanagement ) {
							const practiceData = userDetails.practicemanagement;

							const appPracticeId = practiceData.id;
							const appPracticeSlug = practiceData.UrlSlug;
							req.session.appPracticeId = appPracticeId;
							req.session.appPracticeSlug = appPracticeSlug;

							sails.log.info( "appPracticeSlug:", appPracticeSlug );

							return res.redirect( "/" + appPracticeSlug );
							// return res.redirect('/dashboard');
						} else {
							return res.redirect( "/" );
						}
					} )
					.catch( function( err ) {
						return res.redirect( "/" );
					} );
				} );
			}
		} else {
			return res.redirect( "/" );
		}
	} )
	.catch( function( err ) {
		sails.log.error( "HomeController#emailverifyAction :: err", err );
		return res.handleError( err );
	} );
}

function getproductRulesAction( req, res ) {
	const productRules_id = req.param( "productRules_id" );
	const criteria = { id: productRules_id };
	ProductRules.findOne( criteria )
	.then( function( data ) {
		const responsedata = {
			status: "Success",
			data: data
		};
		const json = {
			responsedata: responsedata
		};
		res.contentType( "application/json" );
		res.json( json );
	} )
	.catch( function( err ) {
		sails.log.error( "UserController#getloanstateregualtionfields#catch :: err :", err );
		return res.handleError( err );
	} );
}

function getapplicationfeeAction( req, res ) {
	const application_fee_id = req.param( "application_fee_id" );
	const criteria = { id: application_fee_id };
	Loanapplicationfee.findOne( criteria )
	.then( function( data ) {
		const responsedata = {
			status: "Success",
			data: data
		};
		const json = {
			responsedata: responsedata
		};
		res.contentType( "application/json" );
		res.json( json );
	} )
	.catch( function( err ) {
		sails.log.error( "UserController#getloanstateregualtionfields#catch :: err :", err );
		return res.handleError( err );
	} );
}

function createupdateproductrulesAction( req, res ) {
	const description = req.param( "description" );
	const declinedif = req.param( "declinedif" );
	const value = req.param( "value" );
	const product_id = req.param( "product_id" ); // 10
	const productRules_id = req.param( "productRules_id" );
	const action = req.param( "action" );
	if( action == "update" ) {
		const criteria = { id: productRules_id };
		ProductRules.findOne( criteria ).then( function( PRDetails ) {
			PRDetails.description = description;
			PRDetails.declinedif = declinedif;
			PRDetails.value = value;
			PRDetails.save( function( err ) {
				if( err ) {
					sails.log.info( "error occured : ", err );
				}
				const responsedata = {
					status: "Success",
					message: "Your Data Successfully Updated."
				};
				const json = {
					responsedata: responsedata
				};
				res.contentType( "application/json" );
				res.json( json );
			} );
		} );
	} else {
		const insert_criteria = { product: product_id };
		ProductRules.find( insert_criteria ).then( function( createPRDetails ) {
			let ruleid;
			_.each( createPRDetails, function( data ) {
				ruleid = data.ruleid;
			} );
			const rId = ruleid.slice( 1 );
			const ruid = parseInt( rId ) + 1;
			const rule_id = "r" + ruid;
			ProductRules.create( { product: product_id, ruleid: rule_id, description: description, declinedif: declinedif, value: value, isDeleted: 0 } ).exec( function( err ) {
				if( err ) {
					sails.log.info( "error occured : ", err );
				}
				const responsedata = {
					status: "Success",
					message: "Your Data Successfully Created."
				};
				const json = {
					responsedata: responsedata
				};

				res.contentType( "application/json" );
				res.json( json );
			} );
		} );
	}
}

function ajaxgetloanproductrulesAction( req, res ) {
	const product_id = req.param( "product_id" );

	ProductRules.find( {
		product: product_id
	} ).then( function( PRdetails ) {
		const responsedata = {
			status: "get success",
			PRdetails: PRdetails
		};
		const json = {
			responsedata: responsedata
		};
		res.contentType( "application/json" );
		res.json( json );
	} );
}

function createupdateapplicationfeeAction( req, res ) {
	const minimumcreditscore = req.param( "minimumcreditscore" );
	const maximumcreditscore = req.param( "maximumcreditscore" );
	const application_fee_product_id = req.param( "application_fee_product_id" );
	const action = req.param( "action" );
	const app_fee_id = req.param( "app_fee_id" );
	const product_type = req.param( "product_type" );
	const applicationfee_common_fields_whole = req.param( "applicationfee_common_fields_whole" );
	const applicationfee_fixed_common_fields_whole = req.param( "applicationfee_fixed_common_fields_whole" );

	if( action == "create" ) {
		var criteria = { product: application_fee_product_id };
	}
	if( action == "update" ) {
		var criteria = {
			product: application_fee_product_id,
			id: { "!": app_fee_id }
		};
	}
	/* Check range start*/
	Loanapplicationfee.find( criteria ).then( function( filter ) {
		let minimumcriteriaExist = 0;
		let maximumcriteriaExist = 0;
		_.each( filter, function( updatedata ) {
			const maxscore = updatedata.maxcreditscore;
			const minscore = updatedata.mincreditscore;
			if( minimumcreditscore >= minscore && minimumcreditscore <= maxscore ) {
				minimumcriteriaExist = 1;
			}
			if( maximumcreditscore >= minscore && maximumcreditscore <= maxscore ) {
				maximumcriteriaExist = 1;
			}
		} );
		if( maximumcriteriaExist == 1 && minimumcriteriaExist == 1 ) {
			var responsedata = {
				status: "fail",
				message: "Your Minimum And Maximum Creditscore Already In Existing Range. Tryout With Another Range."
			};

			var json = {
				responsedata: responsedata
			};

			res.contentType( "application/json" );
			res.json( json );
		}
		if( minimumcriteriaExist == 1 ) {
			var responsedata = {
				status: "fail",
				message: "Your Minimum Creditscore Already In Existing Range. Tryout With Another Range."
			};

			var json = {
				responsedata: responsedata
			};

			res.contentType( "application/json" );
			res.json( json );
		}
		if( maximumcriteriaExist == 1 ) {
			var responsedata = {
				status: "fail",
				message: "Your Maximum Creditscore Already In Existing Range. Tryout With Another Range."
			};

			var json = {
				responsedata: responsedata
			};

			res.contentType( "application/json" );
			res.json( json );
		}
		if( minimumcriteriaExist != 1 && maximumcriteriaExist != 1 ) {
			/* To check product type start*/
			if( product_type == "loanproductsettings" ) {
				var criteriamonth = { productid: application_fee_product_id };
				var applicationfeeobj = {};
				let no_month = {};
				Loanproductsettings.find( criteriamonth ).then( function( monthdata ) {
					monthdata.forEach( function( productdata, loopvalue ) {
						no_month = parseFloat( productdata.month );
						applicationfeeobj[ no_month ] = applicationfee_common_fields_whole[ loopvalue ];
					} );

					const criteria = { id: app_fee_id };

					if( action == "update" ) {
						Loanapplicationfee.update( criteria, { product: application_fee_product_id, mincreditscore: minimumcreditscore, maxcreditscore: maximumcreditscore, applicationfee: applicationfeeobj } ).exec( function afterwards( err, applicationfeeupdated ) {
							const responsedata = {
								status: "Success",
								message: "Your Data Successfully Updated."
							};

							const json = {
								responsedata: responsedata
							};

							res.contentType( "application/json" );
							res.json( json );
						} );
					}
					if( action == "create" ) {
						Loanapplicationfee.create( { product: application_fee_product_id, mincreditscore: minimumcreditscore, maxcreditscore: maximumcreditscore, applicationfee: applicationfeeobj } ).exec( function( err, applicationfeecreated ) {
							const responsedata = {
								status: "Success",
								message: "Your Data Successfully Created."
							};

							const json = {
								responsedata: responsedata
							};

							res.contentType( "application/json" );
							res.json( json );
						} );
					}
				} );
			}
			/* loan productincome start*/

			if( product_type == "loanproductincome" ) {
				var criteriamonth = { productid: application_fee_product_id };
				var applicationfeeobj = [];
				const applicationfeeobject = {};
				const incomerange = {};
				Loanproductincome.find( criteriamonth ).then( function( incomedata ) {
					// var intrestrateobj = [];
					incomedata.forEach( function( productdata, loopvalue ) {
						const minimumincome = productdata.minimumincome;
						const maximumincome = productdata.maximumincome;

						const amount = applicationfee_common_fields_whole[ loopvalue ];

						const fixedamount = applicationfee_fixed_common_fields_whole[ loopvalue ];

						const applicationfeeobjData = {
							minimumincome: minimumincome,
							maximumincome: maximumincome,
							amount: amount,
							fixedamount: fixedamount
						};
						applicationfeeobj.push( applicationfeeobjData );
					} );
					const criteria = { id: app_fee_id };
					/* update section start*/
					if( action == "update" ) {
						Loanapplicationfee.update( criteria, { product: application_fee_product_id, mincreditscore: minimumcreditscore, maxcreditscore: maximumcreditscore, applicationfee: applicationfeeobj } ).exec( function afterwards( err, applicationfeeupdated ) {
							const responsedata = {
								status: "Success",
								message: "Your Data Successfully Updated."
							};

							const json = {
								responsedata: responsedata
							};
							res.contentType( "application/json" );
							res.json( json );
						} );
					}
					/* update section end*/
					/* create section start*/
					if( action == "create" ) {
						Loanapplicationfee.create( { product: application_fee_product_id, mincreditscore: minimumcreditscore, maxcreditscore: maximumcreditscore, applicationfee: applicationfeeobj } ).exec( function( err, applicationfeecreated ) {
							const responsedata = {
								status: "Success",
								message: "Your Data Successfully Created."
							};

							const json = {
								responsedata: responsedata
							};

							res.contentType( "application/json" );
							res.json( json );
						} );
					}
					/* create section end*/
				} );
			}

			/* To check product type end*/
		}
	} );

	/* Check range end*/
}

function ajaxgetapplicationfeeACtion( req, res ) {
	const product_id = req.param( "product_id" );

	Loanapplicationfee.find( {
		product: product_id
	} ).then( function( applicationfeedetails ) {
		Productlist.findOne( {
			id: product_id
		} ).then( function( productdetails ) {
			Loanproductsettings.find( { productid: product_id } ).then( function( loanproductsettings ) {
				Loanproductincome.find( { productid: product_id } ).then( function( loanproductincome ) {
					const responsedata = {
						status: "get success",
						productdetails: productdetails,
						loanproductsettings: loanproductsettings,
						loanproductincome: loanproductincome,
						applicationfeedetails: applicationfeedetails
					};

					const json = {
						responsedata: responsedata
					};
					res.contentType( "application/json" );
					res.json( json );
				} );
			} );
		} );
	} );
}

function dashboard( req, res ) {
	const userId = req.session.userId;
	sails.log.info( "JH HomeController.js dashboardAction userId = ", userId );
	// profile vars
	let userName = "";
	let userAddress = "";
	let userPhone = "";
	let userEmail = "";
	// document vars
	let tcpaDownload = "";
	let creditAuthDownload = "";
	let esignDownload = "";
	let eftaDownload = "";
	let promNoteDownload = "";

	User.findOne( { id: userId } )
	.then( ( userData ) => {
		if( userData ) {
			userName = userData.firstname + " " + userData.lastname;
			userAddress = userData.street + " " + userData.unitapt + " " + userData.city + ", " + userData.state + " " + userData.zipCode;
			userPhone = userData.phoneNumber;
			userEmail = userData.email;
		}

		return Achdocuments.find( { user: userId } )
		.populate( "proofdocument" )
		.then( ( achDocs ) => {
			const documenttype8 = sails.config.loanDetails.doctype8;
			const documenttype = {
				documenttype1: sails.config.loanDetails.doctype1,
				documenttype2: sails.config.loanDetails.doctype2,
				documenttype3: sails.config.loanDetails.doctype3,
				documenttype4: sails.config.loanDetails.doctype4,
				documenttype5: sails.config.loanDetails.doctype5,
				documenttype6: sails.config.loanDetails.doctype6,
				documenttype7: sails.config.loanDetails.doctype7
			};
			const documentimage = {
				documentimage1: "",
				documentimage2: "",
				documentimage3: "",
				documentimage4: "",
				documentimage5: "",
				documentimage6: "",
				documentimage7: []
			};
			const otherdocuments = [];
			let prevDate1, prevDate2, prevDate3, prevDate4, prevDate5, prevDate6;

			achDocs.forEach( ( documentvalue ) => {
				if( documentvalue.proofdocument.isImageProcessed ) {
					sails.log.info( "documentvalue", documentvalue );
					if( documenttype.documenttype1 == documentvalue.docname ) { // doctype is govID
						if( documentimage.documentimage1 != "" ) { // already found one image
							if( prevDate1 < documentvalue.createdAt ) { // get the lastest upload to display
								documentimage.documentimage1 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
								prevDate1 = documentvalue.createdAt;
							}
						} else { // no previous image found
							documentimage.documentimage1 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
							prevDate1 = documentvalue.createdAt;
						}
					} else if( documenttype.documenttype2 == documentvalue.docname ) { // doctype is payroll1
						if( documentimage.documentimage2 != "" ) { // already found one image
							if( prevDate2 < documentvalue.createdAt ) { // get the lastest upload to display
								documentimage.documentimage2 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
								prevDate2 = documentvalue.createdAt;
							}
						} else { // haven't found image
							documentimage.documentimage2 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
							prevDate2 = documentvalue.createdAt;
						}
					} else if( documenttype.documenttype3 == documentvalue.docname ) { // doctype is payroll2
						if( documentimage.documentimage3 != "" ) { // already found one image
							if( prevDate3 < documentvalue.createdAt ) { // get the lastest upload to display
								documentimage.documentimage1 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
								prevDate3 = documentvalue.createdAt;
							}
						} else { // haven't found image
							documentimage.documentimage3 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
							prevDate3 = documentvalue.createdAt;
						}
					} else if( documenttype.documenttype4 == documentvalue.docname ) { // doctype is utility bill
						if( documentimage.documentimage4 != "" ) { // already found one image
							if( prevDate4 < documentvalue.createdAt ) { // get the lastest upload to display
								documentimage.documentimage4 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
								prevDate4 = documentvalue.createdAt;
							}
						} else { // haven't found image
							documentimage.documentimage4 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
							prevDate4 = documentvalue.createdAt;
						}
					} else if( documenttype.documenttype5 == documentvalue.docname ) { // doctype is debit card
						if( documentimage.documentimage5 != "" ) { // already found one image
							if( prevDate5 < documentvalue.createdAt ) { // get the lastest upload to display
								documentimage.documentimage5 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
								prevDate5 = documentvalue.createdAt;
							}
						} else { // haven't found image
							documentimage.documentimage5 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
							prevDate5 = documentvalue.createdAt;
						}
					} else if( documenttype.documenttype6 == documentvalue.docname ) { // doctype is void check
						if( documentimage.documentimage6 != "" ) { // already found one image
							if( prevDate6 < documentvalue.createdAt ) { // get the lastest upload to display
								documentimage.documentimage6 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
								prevDate6 = documentvalue.createdAt;
							}
						} else { // haven't found image
							documentimage.documentimage6 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
							prevDate6 = documentvalue.createdAt;
						}
					} else { // doctype others
						if( documenttype8 != documentvalue.docname ) { // if it is not underwriter checklist display for user.
							documentvalue.proofdocument.standardResolution = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
							otherdocuments.push( documentvalue );
						}
					}
					if (documentvalue.proofdocument.standardResolution) {
						documentvalue.proofdocument.standardResolution = Utils.getS3Url(documentvalue.proofdocument.standardResolution);
					}
				}
			} );

			return PaymentManagement.findOne( { user: userId, status: { $ne: "DENIED" } } )
			.populate( "screentracking" )
			.then( ( paymentmanagementdata ) => {
				return UserConsent.find( { user: userId } )
				.then( ( pdfdocument ) => {
					// user able to view Agreement Documents
					if( pdfdocument ) {
						_.forEach( pdfdocument, function( documents ) {
							if( documents.agreementpath && documents.documentKey == "126" ) {
								tcpaDownload = Utils.getS3Url( documents.agreementpath );
							} else if( documents.agreementpath && documents.documentKey == "125" ) {
								creditAuthDownload = Utils.getS3Url( documents.agreementpath );
							} else if( documents.agreementpath && documents.documentKey == "120" ) {
								esignDownload = Utils.getS3Url( documents.agreementpath );
							} else if( documents.agreementpath && documents.documentKey == "132" ) {
								eftaDownload = Utils.getS3Url( documents.agreementpath );
							} else if( documents.agreementpath && documents.documentKey == "131" ) {
								promNoteDownload = Utils.getS3Url( documents.agreementpath );
							}
						} );
					}
					let loanTerm = "";
					if( paymentmanagementdata ) {
						paymentmanagementdata.amount = parseFloat( paymentmanagementdata.amount ).toLocaleString( "en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 } );
						// loanTerm = LoanPro.getLoanTermInMonths( paymentmanagementdata.screentracking.offerdata.paymentFrequency, paymentmanagementdata.loantermcount );
						loanTerm = paymentmanagementdata.paymentSchedule.length;
						// formats dates in Payment Schedule
						if( paymentmanagementdata.paymentSchedule ) {
							for( let i = 0; i < paymentmanagementdata.paymentSchedule.length; i++ ) {
								paymentmanagementdata.paymentSchedule[ i ].date = moment( paymentmanagementdata.paymentSchedule[ i ].date ).format( "MM/DD/YYYY" );
							}
							paymentmanagementdata.maturityDate = moment( paymentmanagementdata.maturityDate ).format( "MM/DD/YYYY" );
							paymentmanagementdata.nextPaymentSchedule = moment( paymentmanagementdata.nextPaymentSchedule ).format( "MM/DD/YYYY" );
						}
					}
					let responseData = {
						userId: userId,
						achDocs: achDocs,
						achDocslength: achDocs.length,
						userName: userName,
						userAddress: userAddress,
						userPhone: userPhone,
						userEmail: userEmail,
						tcpaDownload: tcpaDownload,
						creditAuthDownload: creditAuthDownload,
						esignDownload: esignDownload,
						eftaDownload: eftaDownload,
						promNoteDownload: promNoteDownload,
						documenttype: documenttype,
						documentimage: documentimage,
						otherdocuments: otherdocuments,
						paymentmanagementdata: paymentmanagementdata,
						// fundingfee: sails.config.loan.originationFee,
						loanTerm: ( loanTerm ? loanTerm : "" ),
						activeTab: ( req.session.hasOwnProperty( "dashboardTab" ) ? req.session.dashboardTab : "tab1" )
					};
					return Promise.resolve()
					.then( () => {
						if( paymentmanagementdata && paymentmanagementdata.hasOwnProperty( "newpromnotestatus" ) && paymentmanagementdata.newpromnotestatus == 0 ) {
							req.session.dashboardTab = "tab2";
							return ApplicationService.getPromissoryNoteData( req, paymentmanagementdata.screentracking.id )
							.then( ( promnoteData ) => {
								if( promnoteData.code == 200 ) {
									sails.log.verbose( "promnoteData:", JSON.stringify( promnoteData, null, 4 ) );
									responseData = Object.assign( responseData, promnoteData.data );
									responseData.formAction = "/dashboard/createpromissorypdf";
									responseData.eftaCheckbox = "checked";
								}
							} );
						}
					} )
					.then( () => {
						responseData.activeTab = ( req.session.hasOwnProperty( "dashboardTab" ) ? req.session.dashboardTab : "tab1" );
						delete req.session.dashboardTab;
						// sails.log.verbose( "responseData:", JSON.stringify( responseData, null, 4 ) );
						res.view( "frontend/home/dashboard", responseData );
					} );
				} );
			} );
		} );
	} )
	.catch( ( err ) => {
		sails.log.error( "HomeController#dashboardAction UserCatch :: err", err );
		return res.handleError( err );
	} );
}

function viewloandetailsAction( req, res ) {
	const payId = req.param( "payid" );
	const userid = req.session.userId;
	User.findOne( { id: userid } )
	.then( function( user ) {
		const registerDate = user.createdAt.toString();
		const regisDt = registerDate.replace( "T", " " ).slice( 3, 16 );
		const updatedate = user.updatedAt.toString();
		const lastUpdateDt = updatedate.replace( "T", " " ).slice( 3, 16 );
		const documenttype1 = sails.config.loanDetails.doctype1;
		const documenttype2 = sails.config.loanDetails.doctype2;
		const documenttype3 = sails.config.loanDetails.doctype3;

		const documenttype = {
			documenttype1: documenttype1,
			documenttype2: documenttype2,
			documenttype3: documenttype3
		};

		PaymentManagement.findOne( { id: payId } )
		.populate( "story" )
		.then( function( paymentmanagementdata ) {
			UserConsent.find( { user: userid } )
			.then( function( pdfdocument ) {
				if( pdfdocument ) {
					_.each( pdfdocument, function( documemts ) {
						if( documemts.agreementpath ) {
							documemts.agreementpath = Utils.getS3Url( documemts.agreementpath );
						}
					} );
				}
				Achdocuments.find( { paymentManagement: payId } )
				.populate( "proofdocument" )
				// .sort("createdAt DESC")
				.then( function( achdocument ) {
					if( achdocument ) {
						_.forEach( achdocument, function( documentvalue ) {
							if( documentvalue.proofdocument ) {
								if( documentvalue.proofdocument.standardResolution ) {
									documentvalue.proofdocument.standardResolution = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
								}
							}
						} );
					}

					let governmentid = 0;
					let payroll = 0;
					let other = 0;

					// _.forEach(achdocument, function(documentname) {

					achdocument.forEach( function( productval, loopvalue ) {
						if( productval.docname === "Government Issue Id" ) {
							governmentid = 1;
						} else if( productval.docname === "Payroll" ) {
							payroll = 1;
						} else {
							other = 1;
						}
					} );

					Screentracking.findOne( { user: userid } )
					.then( function( screentrackingdetails ) {
						const todaysDate = moment()
						.startOf( "day" )
						.toDate()
						.getTime();
						let nextpaymentDate = "--";
						const pendingSchedule = [];
						const paidSchedule = [];
						let amount;
						let setcurrent = 0;
						const paydata = [];

						if( paymentmanagementdata ) {
							_.forEach( paymentmanagementdata.paymentSchedule, function( payDetails ) {
								amount = parseFloat( payDetails.amount ).toFixed( 2 );
								if( amount > 0 ) {
									payDetails.amount = amount.toString().replace( /(\d)(?=(\d\d\d)+(?!\d))/g, "$1," );
									payDetails.amount = "$" + payDetails.amount;
								}

								// var scheduleDate = moment(payDetails.date).startOf('day').toDate().getTime();
								const scheduleDate = moment( payDetails.date )
								.add( 15, "days" )
								.startOf( "day" )
								.toDate()
								.getTime();

								if( payDetails.status == "PAID OFF" ) {
									paidSchedule.push( payDetails );
								} else {
									pendingSchedule.push( payDetails );
								}

								if( payDetails.chargeoff == 1 ) {
									payDetails.status = "Charge Off";
								} else {
									if( scheduleDate < todaysDate && payDetails.status == "OPENED" ) {
										payDetails.status = "Late";
									} else if( payDetails.status == "OPENED" && setcurrent == 0 ) {
										payDetails.status = "Current";
										nextpaymentDate = moment( payDetails.date ).format( "LL" );
										setcurrent = setcurrent + 1;
									} else if( payDetails.status == "PAID OFF" ) {
										payDetails.status = "Paid Off";
									} else if( payDetails.status == "CLOSED" ) {
										payDetails.status = "Closed";
									} else {
										payDetails.status = "Schedule";
									}
								}

								payDetails.date = moment( payDetails.date ).format( "LL" );
								paydata.push( payDetails );
							} );
							paymentmanagementdata.paymentSchedule = paydata;
							paymentmanagementdata.maturityDate = moment( paymentmanagementdata.maturityDate ).format( "LL" );
							paymentmanagementdata.nextPaymentSchedule = moment( paymentmanagementdata.nextPaymentSchedule ).format( "LL" );

							/* new fields */
							if( paymentmanagementdata.productname == "State License" ) {
								var paytype = "RAMS";
							} else {
								var paytype = "LPP";
							}
							const loanPaymentType = paytype;

							if( paymentmanagementdata.productname == "State License" ) {
								var transactionStatus = paymentmanagementdata.transactionStatus;
							} else {
								var transactionStatus = "";
							}

							setcurrent = 0;
							_.forEach( paymentmanagementdata.paymentSchedule, function( payDetails ) {
								const todaysDate = moment()
								.startOf( "day" )
								.toDate()
								.getTime();
								const scheduleDate = moment( payDetails.date )
								.add( 15, "days" )
								.startOf( "day" )
								.toDate()
								.getTime();

								if( setcurrent == 0 ) {
									if( scheduleDate < todaysDate && payDetails.status == "OPENED" ) {
										paymentmanagementdata.status = "Late";
										setcurrent = 1;
									} else if( paymentmanagementdata.status == "OPENED" || paymentmanagementdata.status == "CURRENT" ) {
										paymentmanagementdata.status = "Current";
									}
								}
							} );

							if( paymentmanagementdata.achstatus == 0 ) {
								var statusicon = "Pending";
							}
							if( paymentmanagementdata.achstatus == 1 ) {
								var statusicon = "Funded";
							}
							var responsearray = {
								user_id: user.id,
								firstname: user.firstname,
								lastname: user.lastname,
								email: user.email,
								phoneNumber: user.phoneNumber,
								registerDate: regisDt,
								updatedate: lastUpdateDt,
								dateofbirth: user.dateOfBirth,
								street: user.street,
								state: user.state,
								unitappartment: user.unitappartment,
								city: user.city,
								zipCode: user.zipCode,
								paymentmanagementdata: paymentmanagementdata,
								loanPaymentType: loanPaymentType,
								statusicon: statusicon,
								transactionStatus: transactionStatus,
								PaymentScheduleStatus: paymentmanagementdata.status,
								nextpaymentDate: nextpaymentDate,
								// maturityDate: maturityDate,
								screentrackingdetails: screentrackingdetails,
								pdfdocument: pdfdocument,
								documenttype: documenttype,
								achdocument: achdocument,
								governmentid: governmentid,
								payroll: payroll,
								other: other
							};
						} else {
							var responsearray = {
								screentrackingdetails: screentrackingdetails,
								pdfdocument: pdfdocument,
								documenttype: documenttype,
								achdocument: achdocument,
								governmentid: governmentid,
								payroll: payroll,
								other: other
							};
						}

						res.view( "frontend/home/viewloandetails", responsearray );
					} )
					.catch( function( err ) {
						sails.log.error( "HomeController#dashboardAction :: err", err );
						return res.handleError( err );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "HomeController#dashboardAction :: err", err );
					return res.handleError( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "HomeController#dashboardAction :: err", err );
				return res.handleError( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "HomeController#dashboardAction :: err", err );
			return res.handleError( err );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "HomeController#dashboardAction :: err", err );
		return res.handleError( err );
	} );
}

function getthecashhomeAction( req, res ) {
	const roleCriteria = {
		rolename: "User"
	};
	Roles.findOne( roleCriteria )
	.then( function( roledata ) {
		const roleid = roledata.id;

		User.registerNewUsertfchome( req.form, roleid )
		.then( function( user ) {
			if( user.code == 200 ) {
				/* console.log("userdata : ",user);
							var loginuserdetails = user.userdetails;
							var emailstatus = loginuserdetails.isEmailVerified;
							console.log("email id : ",emailstatus);
							req.session.userId = loginuserdetails.id;
							req.session.loginType = 'frontend';
							if(emailstatus == false)
							{*/
				// req.session.errormsg = '';
				// req.session.errormsg = 'Please Check Your Email For Verification.';
				// }
				// return res.redirect("/createapplication");

				// var emailID = user.email;
				// User.findOne({ email: emailID})
				// .then(function (userinfo) {

				// passport.authenticate('user-local', function (err, userinfo, info) {

				/* if ((err) || (!userinfo)) {
										 var json = {
											status: 400,
											message:"INSUFFICIENT_DATA"
										 };
											req.session.errormsg='';
											req.session.errormsg = 'Invalid Username and Password';
											return res.redirect("/home");
										}*/

				// req.logIn(userinfo, function (err) {
				// if (err) {
				// res.handleError(err);
				// }
				req.session.userId = "";
				req.session.userId = user.userdetails.id;

				// req.session.loginType = 'frontend';
				// req.session.levels='1';

				return res.redirect( "/apply" );
				// });

				// })(req, res);
				// });
			} else {
				req.session.errormsg = "";
				req.session.errormsg = "Email already exist";
				return res.redirect( "/home" );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "HomeController#addnewuserAction :: err :", err );
			return res.handleError( err );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "HomeController#addnewuserAction :: err :", err );
		return res.handleError( err );
	} );
}

function clientloginAction( req, res ) {
	State.getExistingState().then( function( states ) {
		res.view( "frontend/home/clientlogin", { states: states } );
	} );
}
/* function profileEmailVerificationAction(req,res){
console.log("comoing inside");
var user_id = req.session.userId;
console.log("user_id",user_id);
	var user = {
		  id: user_id
		};
User.findOne(user).then(function(userdetails){
				var email_id = userdetails.email;
				var email_status = userdetails.isEmailVerified;
				console.log("email_status",email_status);
					  if(email_status == false){
						  EmailService.profileEmailSend(userdetails);
					       req.session.successval='';
			               req.session.successval = 'Please check your email to verify your account.';
						  res.redirect('/dashboard');
						  }else{
							  console.log("email verified");
							  }
					  })

}*/
function targetcashAction( req, res ) {
	const firstname = req.param( "FirstName" );
	const Address = req.param( "Address" );
	const phoneNumber = req.param( "phoneNumber" );
	const Email = req.param( "Email" );
	const questions = req.param( "questions" );
	EmailService.contactusEmail( { firstname: firstname, Address: Address, phoneNumber: phoneNumber, Email: Email, questions: questions } );
	req.session.successval = "";
	req.session.successval = "Email send to admin successfully";
	res.redirect( "/contactus" );
}

function resetpassword( req, res, id ) {
	let headerMsg = 0;
	let userFirstname = "xxxx";
	if( req.url.indexOf( "leadapiresetpassword" ) > -1 ) {
		headerMsg = 1;
	}
	const userid = req.param( "id" );

	User.findOne( {
		id: userid
	} )
	.then( function( userinfo ) {
		if( req.isAuthenticated() ) {
			if( userinfo.isBankAdded == false && userinfo.registeredtype == "Customer Service" ) {
				return res.redirect( "/banktransaction" );
			} else {
				return res.redirect( "/dashboard" );
			}
		} else {
			if( userinfo.emailreset == true ) {
				console.log( "--Already used this link!" );
				return res.redirect( "/apply" );
			}
		}

		userFirstname = userinfo.firstname;
		let errorval = "";
		let successval = "";
		const id = req.param( "id" );

		userinfo.isEmailVerified = true;
		userinfo.save();

		if( req.session.passerror != "" ) {
			errorval = req.session.passerror;
			req.session.passerror = "";
		}
		if( req.session.successval != "" ) {
			successval = req.session.successval;
			req.session.successval = "";
		}

		res.view( "frontend/home/resetpassword", {
			headerMsg: headerMsg,
			userFirstname: userFirstname,
			error: errorval,
			successval: successval,
			userinfo: userinfo
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "User#updateResetpassword :: err ::", err );
		return res.handleError( err );
	} );
}

function updateResetpassword( req, res ) {
	const newpassword = req.param( "new_pwd" );
	const confirmpass = req.param( "confirm_pwd" );
	const userid = req.param( "userid" );

	User.findOne( {
		id: userid
	} )
	.then( function( updatedUser ) {
		updatedUser.password = newpassword;
		const salt = User.generateSalt();

		User.generateEncryptedPassword( updatedUser, salt ).then( function( encryptedPassword ) {
			updatedUser.password = encryptedPassword;
			updatedUser.salt = salt;
			updatedUser.confirmpassword = confirmpass;

			updatedUser.save( function( err ) {
				if( err ) {
					sails.log.error( "Update error:", err );
				}

				// var usercriteria ={ email: updatedUser.email };
				const usercriteria = { id: userid };

				User.findOne( usercriteria )
				.populate( "role" )
				.then( function( userinfo ) {
					if( !userinfo ) {
						return res.redirect( "/apply" );
					}

					req.logIn( userinfo, function( err ) {
						if( err ) {
							res.handleError( err );
						}
						req.session.userId = userinfo.id;
						req.session.loginType = "frontend";
						req.session.levels = "1";

						const screenCriteria = { user: userinfo.id, iscompleted: [ 0, 2 ] };

						Screentracking.findOne( screenCriteria )
						.then( function( screendata ) {
							if( screendata ) {
								return res.redirect( "/apply" );
							} else {
								return res.redirect( "/createapplication" );
							}
						} )
						.catch( function( err ) {
							sails.log.error( "HomeController#loginAction :: err :", err );
							return res.handleError( err );
						} );
					} );
				} )
				.catch( function( err ) {
					return res.redirect( "/apply" );
				} );
			} );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "User#updateResetpassword :: err ::", err );
		return res.handleError( err );
	} );
}

// -- admin contorller starts here

function showHomeAction( req, res ) {
	let errorval = "";
	let successval = "";
	if( req.session.errormsg != "" ) {
		errorval = req.session.errormsg;
		req.session.errormsg = "";
	}

	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}

	// --for session destroy temporary
	/* req.session.destroy(function(err) {

     });*/

	const UrlSlug = req.param( "urlpath" );

	// sails.log.info("UrlSlug::",UrlSlug);

	if( UrlSlug ) {
		const criteria = {
			UrlSlug: UrlSlug
		};

		PracticeManagement.findOne( criteria )
		.then( function( reponseData ) {
			if( reponseData ) {
				const appPracticeId = reponseData.id;
				const appPracticeSlug = reponseData.UrlSlug;

				req.session.appPracticeId = appPracticeId;
				req.session.appPracticeSlug = appPracticeSlug;
				req.session.appPracticeName = reponseData.PracticeName;
				req.session.appPracticeStateCode = reponseData.StateCode;
				req.session.appPracticeColor = responseData.practiceColor;
				req.session.getStartedPage = 1;

				const statecriteria = { stateCode: reponseData.StateCode };

				State.findOne( statecriteria, { select: [ "name", "isActive" ] } )
				.then( function( stateDetails ) {
					if( stateDetails ) {
						req.session.appPracticeStateName = stateDetails.name;

						res.view( "frontend/homev3/getstarted" );
					} else {
						return res.redirect( "/apply" );
					}
				} )
				.catch( function( err ) {
					return res.redirect( "/apply" );
				} );

				/* State
				 .getExistingState()
				 .then(function (states) {
					res.view("frontend/home/landing", {error: errorval,states:states,appPracticeId:appPracticeId,appPracticeSlug:appPracticeSlug,homepage:1,successval:successval});
				 });*/
			} else {
				res.view( "practice/error/errorpage", {
					code: 404,
					data: "Page not found",
					layout: "layout"
				} );
			}
		} )
		.catch( function( err ) {
			res.view( "practice/error/errorpage", {
				code: 404,
				data: "Page not found",
				layout: "layout"
			} );
		} );
	} else {
		res.view( "practice/error/errorpage", {
			code: 404,
			data: "Page not found",
			layout: "layout"
		} );
	}
}

function signupStartAction( req, res ) {
	if( "undefined" !== typeof req.session.appPracticeSlug && req.session.appPracticeSlug != "" && req.session.appPracticeSlug != null ) {
		const appPracticeSlug = req.session.appPracticeSlug;
		const appPracticeId = req.session.appPracticeId;

		return new Promise( ( resolve, reject ) => {
			req.session.regenerate( resolve );
		} )
		.then( () => {
			req.session.appPracticeSlug = appPracticeSlug;
			req.session.appPracticeId = appPracticeId;

			const criteria = {
				id: appPracticeId
			};
			PracticeManagement.findOne( criteria ).then( function( reponseData ) {
				if( reponseData ) {
					const PracticeName = reponseData.PracticeName;
					res.view( "frontend/home/signupstart", { navtab: 1, appPracticeSlug: appPracticeSlug, PracticeName: PracticeName } );
				} else {
					res.view( "practice/error/errorpage", {
						code: 404,
						data: "Page not found",
						layout: "layout"
					} );
				}
			} );
		} )
		.catch( function( err ) {
			res.view( "practice/error/errorpage", {
				code: 404,
				data: "Page not found",
				layout: "layout"
			} );
		} );
	}
}

function registerAction( req, res ) {
	res.view( "frontend/home/register", { navtab: 1 } );
}

function financeinformationAction( req, res ) {
	let financeAmount = 0;
	const userId = req.session.userId ? req.session.userId : req.session.applicationuserId;
	if( "undefined" !== typeof userId ) {
		if( "undefined" !== typeof req.session.continueFinanceAmount && req.session.continueFinanceAmount != "" && req.session.continueFinanceAmount != null ) {
			financeAmount = req.session.continueFinanceAmount;
		}

		if( "undefined" !== typeof req.session.filloutmanually && req.session.filloutmanually != null && req.session.filloutmanually == "1" ) {
			const payRollArray = [];
			const userBankAccountArray = [];
			res.view( "frontend/home/financeinformation", { bankname: "", annualincome: 0, bankaccno: "", routingno: "", accountholder: "", userbankaccountid: "", minloanamount: sails.config.plaid.minrequestedamount, maxloanamount: sails.config.plaid.maxrequestedamount, navtab: 3, saveforlater: "yes", bankinfo: "no", userBankAccount: userBankAccountArray, payRollArray: payRollArray, filloutmanually: 1, financeAmount: financeAmount } );
		} else {
			UserBankAccount.findOne( { user: userId } )
			.sort( "createdAt DESC" )
			.then( function( userBankAccount ) {
				sails.log.info( "userBankAccount :::::::::::: ", userBankAccount );
				userBankAccount.checkingAccounts = UserBankAccount.filterCheckingAccounts( userBankAccount );
				const accountNoArray = [];
				var routingno;
				if( userBankAccount.checkingAccounts.length > 1 ) {
					_.forEach( userBankAccount.checkingAccounts, function( caccounts, loopvalue ) {
						// -- Ticket no 2830 (account number is null)
						const checkingAccountDetails = userBankAccount.checkingAccounts[ loopvalue ].numbers;
						if( checkingAccountDetails != "" && checkingAccountDetails != null && "undefined" !== typeof checkingAccountDetails ) {
							accountNoArray.push( userBankAccount.checkingAccounts[ loopvalue ].numbers.account );
							routingno = userBankAccount.checkingAccounts[ loopvalue ].numbers.routing;
						}
					} );
				} else {
					// -- Ticket no 2830 (account number is null)
					const checkingAccountDetails = userBankAccount.checkingAccounts[ 0 ].numbers;
					if( checkingAccountDetails != "" && checkingAccountDetails != null && "undefined" !== typeof checkingAccountDetails ) {
						accountNoArray.push( userBankAccount.checkingAccounts[ 0 ].numbers.account );
						var routingno = userBankAccount.checkingAccounts[ 0 ].numbers.routing;
					}
				}

				const startdate = moment()
				.subtract( 90, "days" )
				.format( "YYYY-MM-DD" );
				const enddate = moment().format( "YYYY-MM-DD" );
				let totalpayroll = 0;
				const subTypeArray = [];
				const payRollArray = [];
				let payrollname = "";
				let payrollamount = 0;
				let transdate = "";
				const banknamearray = [];

				if( userBankAccount.transactions ) {
					_.forEach( userBankAccount.transactions, function( transactions ) {
						_.forEach( transactions, function( payrolldata ) {
							payrollname = payrolldata.category;
							payrollamount = payrolldata.amount;
							if( payrollname != "" && payrollname != null && "undefined" !== typeof payrollname ) {
								payrollname = payrollname.toString();
								transdate = payrolldata.date;
								const ddkeyword = sails.config.plaid.ddKeyword;
								if( ddkeyword.indexOf( payrollname.toLowerCase() ) > -1 ) {
									if( startdate < transdate && enddate > transdate ) {
										payRollArray.push( payrolldata );
										payrollamount = parseFloat( payrollamount );
										totalpayroll = parseFloat( totalpayroll );
										totalpayroll = totalpayroll + payrollamount;
									}
								}
							}
						} );
					} );
				}
				if( totalpayroll > 0 ) {
					totalpayroll = ( totalpayroll / 3 ) * 12;
					totalpayroll = totalpayroll.toFixed( 2 );
				}
				totalpayroll = 0;

				sails.log.info( "Final userBankAccount :::::::::::: ", userBankAccount );

				const userBankAccountArray = [];
				userBankAccountArray.push( userBankAccount );

				PlaidUser.findOne( { userBankAccount: userBankAccount.id } )
				.sort( "createdAt DESC" )
				.then( function( plaidUserRes ) {
					res.view( "frontend/home/financeinformation", { bankname: userBankAccount.institutionName, annualincome: totalpayroll, bankaccno: accountNoArray, routingno: routingno, accountholder: plaidUserRes.names, userbankaccountid: userBankAccount.id, minloanamount: sails.config.plaid.minrequestedamount, maxloanamount: sails.config.plaid.maxrequestedamount, navtab: 3, saveforlater: "yes", bankinfo: "yes", userBankAccount: userBankAccountArray, payRollArray: payRollArray, filloutmanually: 0, financeAmount: financeAmount, minincomeamount: sails.config.plaid.minincomeamount } );
				} );
			} );
		}
	} else {
		const redirectpath = "/signupstart";
		return res.redirect( redirectpath );
	}
}


function financeinformationDataAction( req, res ) {
	// var userid				=	req.session.userId;
	const userid = req.session.userId ? req.session.userId : req.session.applicationuserId;
	let annualincome = req.param( "annualincome" );
	annualincome = annualincome.replace( "$ ", "" );
	// annualincome			= 	annualincome.replace(",","");
	annualincome = annualincome.replace( /,/g, "" );
	annualincome = annualincome.replace( " ", "" );

	const bankaccno = req.param( "bankaccno" );
	const institutionName = req.param( "bankname" );
	const institutionType = req.param( "banktype" );
	const routingno = req.param( "routingno" );
	const accountholder = req.param( "accountholder" );
	const userbankaccountid = req.param( "userbankaccountid" );
	let financedAmount = req.param( "financedAmount" );
	financedAmount = financedAmount.replace( "$ ", "" );
	// financedAmount 				= 	financedAmount.replace(",","");
	financedAmount = financedAmount.replace( /,/g, "" );
	financedAmount = financedAmount.replace( " ", "" );

	if( "undefined" !== typeof req.session.filloutmanually && req.session.filloutmanually != null && req.session.filloutmanually == "1" ) {
		const accountsData = [];
		const balanceData = {
			available: 0,
			current: 0,
			limit: ""
		};
		const metaData = {
			limit: null,
			name: "Plaid Checking",
			number: bankaccno.slice( -4 ),
			official_name: ""
		};
		const filteredAccountsDetailsJson = {
			account: bankaccno,
			account_id: "",
			routing: routingno,
			wire_routing: routingno
		};

		const objdata = {
			balance: balanceData,
			institution_type: institutionType,
			meta: metaData,
			numbers: filteredAccountsDetailsJson,
			subtype: "checking",
			type: "depository"
		};
		accountsData.push( objdata );
		const transactionGenerated = {};

		// -- Added to avoid fill out confusion
		const userBankAccount = {
			accounts: accountsData,
			accessToken: "",
			institutionName: institutionName,
			institutionType: institutionType,
			transactions: transactionGenerated,
			user: userid,
			item_id: "",
			access_token: "",
			transavail: 0,
			bankfilloutmanually: 1
		};
		if( process.env.NODE_ENV === "staging" ) {
			userBankAccount.accounts = userBankAccount.accounts.reverse();
		}

		UserBankAccount.create( userBankAccount )
		.then( function( userBankRes ) {
			sails.log.info( "userBankRes---------", userBankRes );
			User.findOne( { id: userid } ).then( function( user ) {
				const plaidNames = [];
				const plaidEmails = [];
				const plaidphoneNumbers = [];
				const plaidAddress = [];

				if( "undefined" !== typeof user.firstname && user.firstname != "" && user.firstname != null ) {
					const fullname = user.firstname + " " + user.lastname;
					plaidNames.push( fullname );
				}

				if( "undefined" !== typeof user.email && user.email != "" && user.email != null ) {
					const emailData = {
						primary: true,
						type: "e-mail",
						data: user.email
					};

					plaidEmails.push( emailData );
				}

				if( "undefined" !== typeof user.phoneNumber && user.phoneNumber != "" && user.phoneNumber != null ) {
					const phoneData = {
						primary: true,
						type: "mobile",
						data: user.phoneNumber
					};
					plaidphoneNumbers.push( phoneData );
				}

				var userAddress = "";
				var userCity = "";
				var userzipCode = "";
				var userState = "other";

				if( "undefined" !== typeof user.street && user.street != "" && user.street != null ) {
					var userAddress = user.street;
				}

				if( "undefined" !== typeof user.city && user.city != "" && user.city != null ) {
					var userCity = user.city;
				}

				if( "undefined" !== typeof user.zipCode && user.zipCode != "" && user.zipCode != null ) {
					var userzipCode = user.zipCode;
				}
				if( "undefined" !== typeof user.state && user.state != "" && user.state != null ) {
					var userState = user.state;
				}

				const plaidAddressData = {
					primary: true,
					data: {
						street: userAddress,
						city: userCity,
						state: userState,
						zip: userzipCode
					}
				};
				plaidAddress.push( plaidAddressData );

				// -- Added to avoid fill out confusion
				const newPlaidUser = {
					names: plaidNames,
					emails: plaidEmails,
					phoneNumbers: plaidphoneNumbers,
					addresses: plaidAddressData,
					user: userid,
					userBankAccount: userBankRes.id,
					isuserInput: 1,
					plaidfilloutmanually: 1
				};

				sails.log.info( "newPlaidUser---------", newPlaidUser );
				PlaidUser.create( newPlaidUser )
				.then( function( plaiddata ) {
					// const balanceData = {
					// 	available: 0,
					// 	current: 0,
					// 	limit: ""
					// };
					// const newAccountData = {
					// 	balance: balanceData,
					// 	institutionType: institutionType,
					// 	accountName: accountholder,
					// 	accountNumberLastFour: bankaccno.slice( -4 ),
					// 	routingNumber: routingno,
					// 	accountNumber: bankaccno,
					// 	accountName: "Plaid Checking",
					// 	accountType: "depository",
					// 	accountSubType: "checking",
					// 	user: userid,
					// 	userBankAccount: userBankRes.id
					// };
					const newAccountData = UserBankAccount.getCheckingAccount( userBankRes );
					sails.log.info( "Account---------", newAccountData );
					Account.create( newAccountData )
					.then( function( account ) {
						if( account ) {
							const checkcriteria = {
								user: userid
							};
							Screentracking.findOne( checkcriteria ).then( function( screenRes ) {
								screenRes.accounts = account.id;
								screenRes.requestedLoanAmount = financedAmount;
								screenRes.incomeamount = annualincome;

								// -- Added for multiple loans
								screenRes.isAccountLinked = 1;

								// --Added isBankAdded on 25/10/2018 to enable fill out manually option in borrower portal.
								screenRes.isBankAdded = 1;
								screenRes.lastlevel = 4;

								screenRes.save( function( err ) {
									sails.log.info( "userid----", userid );
									User.update( { id: userid }, { isBankAdded: true } ).exec( function afterwards( err, updated ) {
										sails.log.info( "updated user", updated );
									} );
									// var redirectpath	=	"/loansuccess";
									const redirectpath = "/applicationoffer";
									return res.redirect( redirectpath );
								} );
							} );
						}
					} );
				} );
			} );
		} );
	} else {
		let filteredAccountsDetails;
		UserBankAccount.findOne( { id: userbankaccountid } )
		.then( function( accountDetails ) {
			_.forEach( accountDetails.accounts, function( accountsval ) {
				if( accountsval.subtype == "checking" && accountsval.numbers.account == bankaccno ) {
					filteredAccountsDetails = accountsval;
				}
			} );
			const accountName = filteredAccountsDetails.meta.name;
			const institutionType = filteredAccountsDetails.institution_type;
			const accountType = filteredAccountsDetails.accountType;
			const subaccountType = filteredAccountsDetails.accountSubType;
			const balance = filteredAccountsDetails.balance;

			const newAccountData = {
				balance: balance,
				institutionType: institutionType,
				accountName: accountName,
				accountNumberLastFour: bankaccno.slice( -4 ),
				routingNumber: routingno,
				accountNumber: bankaccno,
				accountType: accountType,
				accountSubType: subaccountType,
				user: userid,
				userBankAccount: userbankaccountid
			};

			Account.create( newAccountData ).then( function( account ) {
				if( account ) {
					const checkcriteria = {
						user: userid
					};
					Screentracking.findOne( checkcriteria ).then( function( screenRes ) {
						screenRes.accounts = account.id;
						screenRes.requestedLoanAmount = financedAmount;
						screenRes.incomeamount = annualincome;

						// -- Added for multiple loans
						screenRes.isAccountLinked = 1;

						// --Added isBankAdded on 25/10/2018 to enable fill out manually option in borrower portal.
						screenRes.isBankAdded = 1;
						screenRes.lastlevel = 4;

						screenRes.save( function( err ) {
							sails.log.info( "userid----", userid );
							User.update( { id: userid }, { isBankAdded: true } ).exec( function afterwards( err, updated ) {
								sails.log.info( "updated user", updated );
							} );
							// var redirectpath	=	"/loansuccess";
							const redirectpath = "/applicationoffer";
							return res.redirect( redirectpath );
						} );
					} );
				}
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "Institution#autocompleteBankAction :: err :", err );
			const redirectpath = "/financeinformation";
			return res.redirect( redirectpath );
		} );
	}

	/* var userBankAccount = {
			  accounts: [],
 			  institutionName: institutionName,
			  institutionType: institutionType,
			  user: req.session.applicationid,
			  transactions: [],
			  transavail: 1,
 			};

	UserBankAccount.create(userBankAccount)
		.then(function (userBankRes) {
			User.findOne({ id: userid }).then(function(user) {

				if ("undefined" !== typeof user.firstname && user.firstname!='' && user.firstname!=null)
				{
					var fullname = user.firstname+" "+user.middlename+" "+user.lastname;
					plaidNames.push(fullname);
				}

				if ("undefined" !== typeof user.email && user.email!='' && user.email!=null)
				{
					  var emailData	= {
										"primary" : true,
										"type" : "e-mail",
										"data" : user.email
									 }

					plaidEmails.push(emailData);
				}

				if ("undefined" !== typeof user.phoneNumber && user.phoneNumber!='' && user.phoneNumber!=null)
				{
					var phoneData	=  {
												"primary" : true,
												"type" : "mobile",
												"data" : user.phoneNumber
										}
					plaidphoneNumbers.push(phoneData);
				}


				var userAddress='';
				var userCity='';
				var userzipCode='';
				var userState='other';

				if ("undefined" !== typeof user.street && user.street!='' && user.street!=null)
				{
					var userAddress = data.street;
				}

				if ("undefined" !== typeof user.city && user.city!='' && user.city!=null)
				{
					var userCity = user.city;
				}

				if ("undefined" !== typeof user.zipCode && user.zipCode!='' && user.zipCode!=null)
				{
					var userzipCode = user.zipCode;
				}
				if ("undefined" !== typeof user.state && user.state!='' && user.state!=null)
				{
					var userState = user.state;
				}

				var plaidAddressData = {
					"primary" : true,
					"data" : {
							"street" : userAddress,
							"city" : userCity,
							"state" : userState,
							"zip" : userzipCode
					}
				}

				var newPlaidUser	=	{
					names: plaidNames,
					emails: plaidEmails,
					phoneNumbers:plaidphoneNumbers,
					addresses: plaidAddressData,
					user: applicationid,
					userBankAccount: userBankRes.id,
					isuserInput: 1
				};
				PlaidUser.create(newPlaidUser).then(function (plaiddata) {
					var newAccountData	=	{
						institutionType:institutionType,
						accountName:accountholder,
						accountNumberLastFour:bankaccno.slice(-4),
						routingNumber:routingno,
						accountNumber:bankaccno,
						accountType: "depository",
						user:applicationid,
						userBankAccount:userBankRes.id
					};
				});
			});

		});

	res.view('frontend/home/financeinformation', {navtab: 3});*/
}

function applicationoffer( req, res ) {
	const userid = req.session.userId;
	const practiceId = req.session.practiceId || req.session.appPracticeId;
	sails.log.info( "applicationoffer; userid:", userid );
	// sails.log.verbose( "req.session:", JSON.stringify( req.session ) );

	if( !req.session.userId ) {
		req.session.loanErrorMsg = "Your session has timed out, please log in again.";
		return res.redirect( "/sessiontimeout" );
	}
	Screentracking.getSelectionOffer( userid, "", "" )
	.then( function( offerResult ) {
		sails.log.info( "HomeController#applicationoffer ::::", offerResult );
		if( offerResult.code == 200 ) {
			return PracticeManagement.findOne( { id: practiceId } )
			.then( ( practicemanagement ) => {
				Screentracking.findOne( { user: userid, iscompleted: 0 } )
				.then((screenDetails) => {
					const creditTierCriteria = { practicemanagement: screenDetails.practicemanagement };
					if( screenDetails.lockCreditTier ) {
						creditTierCriteria.creditTier = screenDetails.lockCreditTier;
					} else {
						creditTierCriteria.minCreditScore = { $lte: screenDetails.creditscore };
						creditTierCriteria.maxCreditScore = { $gte: screenDetails.creditscore };
					}
					LoanCreditTier.findOne( creditTierCriteria )
					.then((creditTier) => {
						User.findOne( { id: userid } )
						.then((user) => {
							const loaninterestcriteria = {
								practicemanagement: screenDetails.practicemanagement,
								creditTier: creditTier.creditTier
							}
							Loaninterestrate.findOne( loaninterestcriteria )
							.then((loaninterestrate) => {
								const templateData = {
									user: user,
									practiceName: practicemanagement.PracticeName,
									screenDetails: screenDetails,
									incomeamount: screenDetails.incomeamount,
									loanAmount: creditTier.loanAmount,
									creditTier: creditTier,
									interestRate: loaninterestrate.interestRate || 0.0
								};
								return res.view( "frontend/home/myoffers", templateData);
							});
						});
					});
				});
			} );
		}
		req.session.loanErrorMsg = "Unable to generate offer. Please contact administrator to process your loan.";
		return res.redirect( "/loanfailure" );
	} )
	.catch( function( err ) {
		sails.log.error( "HomeController#applicationofferAction :: err", err );
		return res.handleError( err );
	} );
}


function loanofferdetailsAction( req, res ) {
	const screenid = req.param( "screenid" );
	const offerid = req.param( "offerid" );
	const financedAmount = req.param( "totalcost" );
	const userid = req.session.userId ? req.session.userId : req.session.applicationuserId;
	sails.log.info( "loanofferdetailsAction; userid:", userid );
	// const userid = req.session.applicationuserId;
	const monthterm = req.param( "monthterm" );

	Screentracking.getSelectionOffer( userid, offerid, monthterm )
	.then( function( responseDetails ) {
		if( responseDetails.code == 200 ) {
			const loanDetails = responseDetails.loanDetails[ 0 ];
			res.view( "frontend/home/loanofferdetails", { loanDetails: loanDetails, screenid: screenid, offerid: offerid, navtab: 5 } );
		} else if( responseDetails.code == 500 ) {
			const loanstatus = "Declined";
			if( responseDetails.message ) {
				req.session.loanErrorMsg = responseDetails.message;
			} else {
				req.session.loanErrorMsg = "Unfortunately at this time, we are unable to approve your application as your income does not meet the minimum requirement.";
			}
			return res.redirect( "/loanfailure" );
		} else {
			const errorcode = 400;
			req.session.loanErrorMsg = "Unable to generate offer for your income. Please contact administrator to process your loan.";
			return res.redirect( "/loanfailure" );
		}
	} )
	.catch( function( err ) {
		sails.log.error( "HomeController#applicationofferAction :: err", err );
		return res.handleError( err );
	} );
}

function saveapplicationofferAction( req, res ) {
	const screenid = req.param( "screenid" );
	const offerid = req.param( "offerid" );
	const userid = req.session.userId ? req.session.userId : req.session.applicationuserId;
	// const userid = req.session.applicationuserId;

	Screentracking.saveLoanOfferData( userid, screenid, offerid, "" )
	.then( function( responseDetails ) {
		sails.log.info( "HomeController#saveloanofferAction ::::", responseDetails );
		if( responseDetails.code == 200 ) {
			req.session.loanpromissorynoteselected = 1;
			const redirectpath = "/loanpromissorynote";
			return res.redirect( redirectpath );
		} else {
			// -- Ticket no 2779	(check interest rate available)
			const screencriteria = { id: screenid };

			Screentracking.findOne( screencriteria )
			.populate( "plaiduser" )
			.populate( "user" )
			.populate( "practicemanagement" )
			.then( function( userAccountres ) {
				const loanstatus = "Declined";
				const lastScreenName = "Loan Offer Details";
				const lastlevel = 3;
				const product = userAccountres.product;

				const idobj = {
					transid: "",
					accountid: "",
					rulesDetails: userAccountres.rulesDetails,
					creditscore: userAccountres.creditscore
				};
				const dataObject = {
					addressarray: "",
					userArray: "",
					transactionControl: "",
					certificate: ""
				};

				Screentracking.updatedeclinedloan( lastScreenName, lastlevel, userAccountres.user, dataObject, product, idobj ).then( function( screenTracking ) {
					const declineMessage = "Unable to approve your application as your loan amount and credit score does not meet the requirement";
					PaymentManagement.update( { id: screenTracking.paymentid }, { declinereason: declineMessage } ).exec( function afterwards( err, updated ) {
						const errorcode = 400;
						req.session.loanErrorMsg = "Unable to approve your application as your loan amount and credit score does not meet the requirement.";
						return res.redirect( "/loanfailure" );
					} );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "HomeController#saveloanofferAction :: err", err );
				return res.handleError( err );
			} );
		}
	} )
	.catch( function( err ) {
		sails.log.error( "HomeController#saveloanofferAction :: err", err );
		return res.handleError( err );
	} );
}

function loanpromissorynoteAction( req, res ) {
	// var screenid	=	req.param('screenid');
	// var offerid	=	req.param('offerid');

	// var financedAmount= req.param('totalcost');

	// var scriteria = {user:userid,iscompleted: 0};
	// var userid 			=  	req.session.userId;
	const userid = req.session.userId ? req.session.userId : req.session.applicationuserId;
	const screencriteria = { user: userid, iscompleted: 0 };

	Screentracking.findOne( screencriteria )
	.sort( "createdAt DESC" )
	.then( function( screendata ) {
		// sails.log.info("screendata:",screendata);
		const scriteria = { id: screendata.id, iscompleted: 0 };
		Screentracking.findOne( scriteria )
		.populate( "accounts" )
		.populate( "plaiduser" )
		.populate( "user" )
		.populate( "practicemanagement" )
		.then( function( screentrackingdetails ) {
			if( screentrackingdetails ) {
				sails.log.info( "screentrackingdetails::::::::::", screentrackingdetails );
				// sails.log.info('screentrack', screentrackingdetails);
				const IPFromRequest = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;
				const indexOfColon = IPFromRequest.lastIndexOf( ":" );
				const ip = IPFromRequest.substring( indexOfColon + 1, IPFromRequest.length );
				const financedAmount = screentrackingdetails.offerdata[ 0 ].financedAmount;
				// financedAmount = financedAmount.replace('$','');
				const scheduleLoanAmount = screentrackingdetails.offerdata[ 0 ].monthlyPayment;
				// scheduleLoanAmount = scheduleLoanAmount.replace('$','');
				const loanTerm = screentrackingdetails.offerdata[ 0 ].loanTerm;
				let checktotalLoanAmount = parseFloat( scheduleLoanAmount ) * loanTerm;
				checktotalLoanAmount = parseFloat( checktotalLoanAmount.toFixed( 2 ) );
				let creditcost = checktotalLoanAmount - financedAmount;
				creditcost = parseFloat( creditcost.toFixed( 2 ) );
				const todaydate = moment().format( "MM/DD/YYYY" );

				var routingNumber = "";
				var laonusername = "";
				var accountNumberLastFour = "";
				if( screentrackingdetails.accounts ) {
					var routingNumber = screentrackingdetails.accounts.accountNumberLastFour;
					var laonusername = screentrackingdetails.user.firstname + " " + screentrackingdetails.user.lastname;
					var accountNumberLastFour = screentrackingdetails.accounts.accountNumberLastFour;
					var routingNumber = screentrackingdetails.accounts.routingNumber;
				}

				sails.log.info( "financedAmount::::::::::", financedAmount );
				sails.log.info( "scheduleLoanAmount::::::::::", scheduleLoanAmount );

				const userData = screentrackingdetails.user;
				const practiceData = screentrackingdetails.practicemanagement;
				const offerData = screentrackingdetails.offerdata[ 0 ];

				const pdfData = {
					ip: ip,
					userid: userid,
					screentrackingdetails: screentrackingdetails,
					todaydate: todaydate,
					financedAmount: financedAmount,
					loanTerm: loanTerm,
					scheduleLoanAmount: scheduleLoanAmount,
					laonusername: laonusername,
					accountNumberLastFour: accountNumberLastFour,
					routingNumber: routingNumber
				};

				let signatureExist = 0;
				const signatureId = "";
				const agreementsignpath = "";
				const signusercriteria = { user_id: userid, screentracking: screentrackingdetails.id, active: 1 };

				Esignature.findOne( signusercriteria ).then( function( signatureData ) {
					if( signatureData ) {
						signatureExist = 1;
						var signatureId = signatureData.id;
						var agreementsignpath = Utils.getS3Url( signatureData.standardResolution );
					}
					const responseData = {
						ip: ip,
						userid: userid,
						screentrackingdetails: screentrackingdetails,
						todaydate: todaydate,
						financedAmount: financedAmount,
						loanTerm: loanTerm,
						scheduleLoanAmount: scheduleLoanAmount,
						checktotalLoanAmount: checktotalLoanAmount,
						creditcost: creditcost,
						pdfData: pdfData,
						practiceData: practiceData,
						userData: userData,
						offerData: offerData,
						signatureData: signatureData,
						signatureExist: signatureExist,
						signatureId: signatureId,
						agreementsignpath: agreementsignpath
					};
					responseData.navtab = 6;
					res.view( "frontend/home/loanpromissorynote", responseData );
				} );
			} else {
				const errorcode = 400;
				req.session.loanErrorMsg = "Unable to generate offer. Please contact administrator to process your loan.";
				return res.redirect( "/loanfailure" );
			}
		} );
	} );
}

function createloanpromissorypdfAction( req, res ) {
	const userid = req.session.userId ? req.session.userId : req.session.applicationuserId;
	sails.log.info( "userid:", userid );
	let filloutmanually = 0;
	if( "undefined" !== typeof req.session.filloutmanually && req.session.filloutmanually != "" && req.session.filloutmanually != null && req.session.filloutmanually == 1 ) {
		filloutmanually = req.session.filloutmanually;
	}

	return Promise.resolve()
	.then( function( manualResults ) {
		// if(manualResults.code==400)
		// {
		// 	return res.redirect("/loanpromissorynote");
		// }
		// else
		// {
		return Screentracking.findOne( { user: userid, iscompleted: 0 } )
		.populate( "user" )
		.populate( "accounts" )
		.populate( "practicemanagement" )
		.then( function( screentrackingdetails ) {
			const screenID = screentrackingdetails.id;

			const applicationReference = screentrackingdetails.applicationReference;
			const userReference = screentrackingdetails.user.userReference;
			const userStatecode = screentrackingdetails.user.state;

			// -- Added for ticket no 2686
			const practiceStatecode = screentrackingdetails.practicemanagement.StateCode;

			req.session.applicationReference = applicationReference;
			req.session.userReference = userReference;

			// var IPFromRequest = req.ip;
			const IPFromRequest = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;
			const indexOfColon = IPFromRequest.lastIndexOf( ":" );
			const ip = IPFromRequest.substring( indexOfColon + 1, IPFromRequest.length );
			const screenid = screentrackingdetails.id;

			// {documentKey:'202',statecode:userStatecode}
			// -- Added for ticket no 2686
			const agreeCriteria = {
				documentKey: "202",
				statecode: practiceStatecode
			};

			Agreement.findOne( agreeCriteria )
			.then( function( agreement ) {
				UserConsent.createConsent( agreement, screentrackingdetails.user, ip, screenid )
				.then( function( userconsentdetails ) {
					const consentID = userconsentdetails.id;
					const userID = screentrackingdetails.user.id;

					sails.log.info( "userIDuserID:", userID );

					UserConsent.objectdataforpromissory( agreement, screentrackingdetails, userID, req, res )
					.then( function( objectdatas ) {
						// -- Update esignature with screen id
						Esignature.update( { user_id: userid, active: 1 }, { screentracking: screenID, consentID: consentID, active: 2 } ).exec( function afterwards( err, updated ) {
							UserConsent.createServicePromissoryAgreementPdf( consentID, userID, userconsentdetails, objectdatas, res, req, screentrackingdetails )
							.then( function( agreementpdf ) {
								// sails.log.info("agreementpdf:", agreementpdf);

								// -- Genreating shorter version of promissory pdf
								UserConsent.createLendingDisclosureAgreement( screentrackingdetails, res, req, ip )
								.then( function( lendingreponse ) {
									UserConsent.createEftAgreement( screentrackingdetails, userID, res, req, ip )
									.then( function( eftpdf ) {
										const redirectpath = "/createloanapplication";
										return res.redirect( redirectpath );
									} )
									.catch( function( err ) {
										sails.log.error( "HomeController#createpromissorypdfAction :: err", err );
										return res.handleError( err );
									} );
								} )
								.catch( function( err ) {
									sails.log.error( "HomeController#createpromissorypdfAction :: err", err );
									return res.handleError( err );
								} );
							} )
							.catch( function( err ) {
								sails.log.error( "HomeController#createpromissorypdfAction :: err", err );
								return res.handleError( err );
							} );
						} );
					} )
					.catch( function( err ) {
						sails.log.error( "HomeController#createpromissorypdfAction :: err", err );
						return res.handleError( err );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "HomeController#createpromissorypdfAction :: err", err );
					return res.handleError( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "HomeController#createpromissorypdfAction :: err", err );
				return res.handleError( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "createpromissorypdfAction :: err", err );
			return res.handleError( err );
		} );
		// }
	} )
	.catch( function( err ) {
		sails.log.error( "createpromissorypdfAction :: err", err );
		return res.handleError( err );
	} );
}
function createloanapplicationAction( req, res ) {
	const userid = req.session.userId ? req.session.userId : req.session.applicationuserId;
	const screencriteria = { user: userid, iscompleted: 0 };
	Screentracking.findOne( screencriteria )
	.populate( "user" )
	.sort( "createdAt DESC" )
	.then( function( userscreenres ) {
		const usercriteria = { id: userid };
		User.findOne( usercriteria )
		.then( function( userDetails ) {
			sails.log.info( "userDetails ", userDetails );
			Story.createUserstory( userDetails, userscreenres )
			.then( function( storyDet ) {
				sails.log.info( "storyDet ", storyDet );
				PaymentManagement.createLoanPaymentSchedule( userscreenres, storyDet )
				.then( function( paymentDetails ) {
					sails.log.info( "paymentDetails ", paymentDetails );

					if( paymentDetails != "" && paymentDetails != null && "undefined" !== typeof paymentDetails ) {
						Screentracking.update( { id: userscreenres.id }, { lastlevel: 5 } ).exec( function afterwards( err, updated ) {
							User.update( { id: userscreenres.user }, { isExistingLoan: true } ).exec( function afterwards( err, userupdated ) {
								const creditscore = userscreenres.creditscore;
								PaymentManagement.update( { id: paymentDetails.id }, { creditScore: creditscore } ).exec( function afterwards( err, userupdated ) {
									/* upload document from Incomplete and Denied application*/
									const criteriaDoc = { user: userscreenres.user };
									Achdocuments.find( criteriaDoc )
									.then( function( AchdocumentsDetails ) {
										if( "undefined" !== typeof AchdocumentsDetails && AchdocumentsDetails != "" && AchdocumentsDetails != null ) {
											_.forEach( AchdocumentsDetails, function( achDoc ) {
												// achDoc.paymentManagement = 123;
												Achdocuments.update( { user: userscreenres.user }, { paymentManagement: paymentDetails.id } ).exec( function afterwards( err, updated ) {} );
											} );
										} else {
											const criteriaDoc = { paymentManagement: userscreenres.id };
											Achdocuments.find( criteriaDoc )
											.then( function( AchdocumentsDetails ) {
												if( "undefined" !== typeof AchdocumentsDetails && AchdocumentsDetails != "" && AchdocumentsDetails != null ) {
													_.forEach( AchdocumentsDetails, function( achDoc ) {
														// achDoc.paymentManagement = 123;
														Achdocuments.update( { paymentManagement: userscreenres.id }, { paymentManagement: paymentDetails.id } ).exec( function afterwards( err, updated ) {} );
													} );
												} else {
													console.log( "----first time----" );
												}
											} )
											.catch( function( err ) {
												sails.log.error( "HomeController#addconsolidateActio1211212n :: err", err );
												return res.handleError( err );
											} );
										}

										Cronemails.getCronEmailData( paymentDetails.id );
										const redirectpath = "/loansuccess";
										return res.redirect( redirectpath );
									} )
									.catch( function( err ) {
										sails.log.error( "HomeController#addconsolidateActio1211212n :: err", err );
										return res.handleError( err );
									} );
								} );
							} );
						} );
						// var redirectpath ="/loansuccess";
						// return res.redirect(redirectpath);
					} else {
						// -- Need to work on this else part
						// var redirectpath =	"/loansuccess";
						// return res.redirect(redirectpath);
					}
				} )
				.catch( function( err ) {
					sails.log.error( "HomeController#addconsolidateAction :: err", err );
					return res.handleError( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "HomeController#addconsolidateAction :: err", err );
				return res.handleError( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "HomeController#addconsolidateAction :: err", err );
			return res.handleError( err );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "HomeController#addconsolidateAction :: err", err );
		return res.handleError( err );
	} );
}

function successAction( req, res ) {
	res.view( "frontend/home/success" );
}
function autocompleteBanknameAction( req, res ) {
	const bankSearch = req.param( "bankSearch" );
	let skipvalue = 0;
	const limitvalue = 50;
	if( req.param( "page" ) ) {
		const pagenum = req.param( "page" );

		sails.log.info( "pagenum : ", pagenum );

		if( parseInt( pagenum ) > 0 ) {
			skipvalue = parseInt( pagenum ) * parseInt( limitvalue );
		}
	}

	sails.log.info( "skipvalue : ", skipvalue );
	sails.log.info( "limitvalue : ", limitvalue );

	if( !bankSearch ) {
		var criteria = {
			isDeleted: false
		};
	} else {
		var criteria = {
			isDeleted: false,
			institutionName: { startsWith: bankSearch }
		};
	}

	Institution.find( criteria )
	// .limit(50)
	.skip( skipvalue )
	.limit( 50 )
	.sort( "institutionName ASC" )
	.then( function( banks ) {
		const data = [];
		const bankName = "";
		_.forEach( banks, function( bank ) {
			const bankName = bank.institutionName;
			const bankID = bank.id;
			const institutionType = bank.institutionType;
			data.push( {
				bankname: bankName,
				bankid: bankID,
				institutionType: institutionType
			} );
		} );
		// sails.log.info('University#autocompleteUniversityAction :: data :', data);
		return res.success( data );
	} )
	.catch( function( err ) {
		sails.log.error( "Institution#autocompleteBankAction :: err :", err );
		return res.handleError( err );
	} );
	// }
}

function cosignupstartAction( req, res ) {
	res.view( "frontend/coborrower/cosignupstart" );
}

function loansuccessAction( req, res ) {
	const appPracticeId = req.session.appPracticeId;
	const appPracticeSlug = req.session.appPracticeSlug;

	// req.session.userId					=	'';
	req.session.applicationuserId = "";
	req.session.userId;
	req.session.Electronicsign = "";
	req.session.isplaidEmpty = "";
	req.session.tempplaidID = "";
	req.session.tempuserBankAccountID = "";
	req.session.userEmail = "";
	req.session.loanpromissorynoteselected = "";
	req.session.applicationReference = "";
	req.session.userReference = "";
	req.session.filloutmanually = "";
	req.session.first_name = "";
	req.session.last_name = "";
	req.session.security_number = "";
	req.session.userfilloutmanually = "";
	req.session.appPracticeId = "";
	req.session.appPracticeSlug = "";

	req.session.continueUserEmail = "";
	req.session.continueUserFirstName = "";
	req.session.continueUserLastName = "";
	req.session.continueFinanceAmount = "";
	req.session.manualUserID = "";
	req.session.isplaidConnected = "";
	req.session.clicktosave = "";
	res.view( "frontend/home/success", { navtab: 7, appPracticeId: appPracticeId, appPracticeSlug: appPracticeSlug } );
}
function loanfailureAction( req, res ) {
	const appPracticeId = req.session.appPracticeId;
	const appPracticeSlug = req.session.appPracticeSlug;
	// req.session.userId					=	'';
	req.session.applicationuserId = "";
	req.session.Electronicsign = "";
	req.session.isplaidEmpty = "";
	req.session.tempplaidID = "";
	req.session.tempuserBankAccountID = "";
	req.session.userEmail = "";
	req.session.loanpromissorynoteselected = "";
	req.session.applicationReference = "";
	req.session.userReference = "";
	req.session.filloutmanually = "";
	req.session.first_name = "";
	req.session.last_name = "";
	req.session.security_number = "";
	req.session.userfilloutmanually = "";
	req.session.appPracticeId = "";
	req.session.appPracticeSlug = "";

	req.session.continueUserEmail = "";
	req.session.continueUserFirstName = "";
	req.session.continueUserLastName = "";
	req.session.continueFinanceAmount = "";
	req.session.manualUserID = "";
	req.session.isplaidConnected = "";
	req.session.clicktosave = "";

	if( req.session.loanErrorMsg ) {
		var errorMsg = req.session.loanErrorMsg;
		req.session.loanErrorMsg = "";
	} else {
		var errorMsg = "Your application has been rejected due to insufficient credit score.";
	}

	res.view( "frontend/home/loanfailure", { navtab: 7, errorMsg: errorMsg, appPracticeId: appPracticeId, appPracticeSlug: appPracticeSlug } );
}
/* function updateprofileAction(req,res) {
	res.view('frontend/home/profile');
}*/


function sessionTimeout( req, res ) {
	const appPracticeId = req.session.appPracticeId;
	const appPracticeSlug = req.session.appPracticeSlug;

	let errorMsg;
	if( req.session.loanErrorMsg ) {
		errorMsg = req.session.loanErrorMsg;
		req.session.loanErrorMsg = "";
	} else {
		errorMsg = "Your session has timed out. Please login again";
	}

	req.logout();

	res.view( "frontend/home/timeout", { navtab: 7, errorMsg: errorMsg, appPracticeId: appPracticeId, appPracticeSlug: appPracticeSlug } );
}

function downloadconsentpdfAction( req, res ) {
	const docKey = req.param( "docKey" );
	const IPFromRequest = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;
	UserConsent.downloadConsentPdf( docKey, IPFromRequest, req, res ).then( function( responseData ) {
		sails.log.info( "responseData:", responseData );

		if( responseData.status == 200 ) {
			const pdfFileName = responseData.filename;
			const filepath = sails.config.appPath + "/" + responseData.filename;

			// sails.log.info("pdfFileName::",pdfFileName);
			// sails.log.info("filepath::",filepath);

			res.setHeader( "Content-Type", "application/pdf" );
			// res.download(filepath, pdfFileName);
			// return res.send({code:200});

			res.download( filepath, function( err ) {
				if( err ) {
					// return res.serverError(err)
					sails.log.error( "Download error:: ", err );
				} else {
					// return res.ok()
					sails.log.info( "Download success:: " );
					fs.unlink( filepath, function( err ) {
						if( err ) {
							sails.log.error( "unlink error:: ", err );
						}
					} );
				}
			} );
		} else {
			return res.send( { code: 400 } );
		}
	} );
}

function chatsupportAction( req, res ) {
	res.view( "frontend/home/chatsupport" );
}
function termsconditionsAction( req, res ) {
	res.view( "frontend/home/termsconditions" );
}
function californiaConsumerPrivacyActNoticeAction(req, res) {
	res.view("frontend/home/californiaconsumerprivacyactnotice")
}
// function applicationmanagementloginAction(req,res) {
// 	res.view('frontend/home/applicationmanagementlogin')
// }

function userlogoutAction( req, res ) {
	sails.log.info( "HomeController.userlogoutAction" );
	req.session.userId = "";
	req.session.reapply = "";
	req.logout();
	// req.session.destroy();
	req.flash( "error", "" );
	req.session.logReferenceID = "";
	// res.redirect('/signin');
	// res.redirect('/');

	req.session.incompleteCount = "";
	req.session.incompleteredirectUrl = "";
	// req.session.todocount='';

	if( "undefined" !== typeof req.session.appPracticeId && req.session.appPracticeId != "" && req.session.appPracticeId != null && "undefined" !== typeof req.session.appPracticeSlug && req.session.appPracticeSlug != "" && req.session.appPracticeSlug != null ) {
		const appPracticeId = req.session.appPracticeId;
		const appPracticeSlug = req.session.appPracticeSlug;
		req.session.appPracticeId = "";
		req.session.appPracticeSlug = "";
		// res.redirect('/'+appPracticeSlug);

		// -- Blocked for  member login
		return res.redirect( "/login" );
	} else {
		req.session.appPracticeId = "";
		req.session.appPracticeSlug = "";
		// res.redirect('/');

		// -- Blocked for  member login
		return res.redirect( "/login" );
	}
}

function loanamountconfirmAction( req, res ) {
	const userid = "";
	const userId = req.session.userId ? req.session.userId : req.session.applicationuserId;
	let incomeamount = req.param( "incomeamount" );
	incomeamount = incomeamount.replace( "$ ", "" );
	incomeamount = incomeamount.replace( /,/g, "" );
	incomeamount = incomeamount.replace( " ", "" );
	let financedAmount = req.param( "financedAmount" );
	financedAmount = financedAmount.replace( "$ ", "" );
	financedAmount = financedAmount.replace( /,/g, "" );
	financedAmount = financedAmount.replace( " ", "" );

	if( userid == "" ) {
		const responseData = {
			status: 400,
			message: "Invalid user"
		};
		res.contentType( "application/json" );
		res.json( responseData );
	} else {
		Screentracking.checkQualifiedAmount( userid, incomeamount, financedAmount )
		.then( function( responseDetails ) {
			// sails.log.info('HomeController#loanamountconfirmAction ::::', responseDetails);
			let minmaxchangeTxt = "maximum";
			if( responseDetails.code == 200 ) {
				var responseData = {
					status: 200,
					message: responseDetails.message,
					prequalifiedAmount: responseDetails.prequalifiedAmount,
					maxprequalifiedAmount: responseDetails.maxprequalifiedAmount
				};
			} else if( responseDetails.code == 300 ) {
				if( parseFloat( financedAmount ) < parseFloat( responseDetails.prequalifiedAmount ) ) {
					minmaxchangeTxt = 1;
				}
				var responseData = {
					status: 300,
					message: responseDetails.message,
					prequalifiedAmount: responseDetails.prequalifiedAmount,
					minmaxchangeTxt: minmaxchangeTxt,
					maxprequalifiedAmount: responseDetails.maxprequalifiedAmount
				};
			} else if( responseDetails.code == 500 ) {
				var responseData = {
					status: 500,
					message: responseDetails.message
				};
			} else if( responseDetails.code == 600 ) {
				var responseData = {
					status: 600,
					message: responseDetails.message
				};
			} else {
				var responseData = {
					status: 400,
					message: responseDetails.message
				};
			}

			sails.log.info( "HomeController#loanamountconfirmAction ::Info::", responseData );

			res.contentType( "application/json" );
			res.json( responseData );
		} )
		.catch( function( err ) {
			const responseData = {
				status: 400,
				message: err
			};

			sails.log.error( "HomeController#loanamountconfirmAction ::Error::", responseData );

			res.contentType( "application/json" );
			res.json( responseData );
		} );
	}
}


function apply( req, res ) {
	const tplData = { practices: [], applicationerror: null };
	if( !!req.session.applicationerror ) {
		tplData.applicationerror = req.session.applicationerror;
		req.session.applicationerror = "";
	}
	delete req.session.practiceId;
	return PracticeManagement.find( { isDeleted: false } )
	.then( ( practiceList ) => {
		tplData.practices = practiceList;
		// sails.log.verbose( "apply; tplData:", tplData );
		return res.view( "frontend/homev3/apply", tplData );
	} );
}

function alreadyExists (req, res) {
	return new Promise((resolve) => {
		resolve(true);
	}).then(() => {
		return res.view( "frontend/home/userAlreadyExists");
	});
}


function applyPost( req, res ) {
	const reqParams = req.allParams();
	if( typeof reqParams.practiceId != "string" ) {
		sails.log.error( "applyPost; Missing required 'practiceId'" );
		req.session.applicationerror = "The practice is missing.";
		return res.redirect( "/apply" );
	}
	return PracticeManagement.findOne( { isDeleted: false, id: reqParams.practiceId } )
	.then( ( practicemanagement ) => {
		if( ! practicemanagement ) return Promise.reject( new Error( `Practice not found by id: ${reqParams.practiceId}` ) );
		req.session.practiceId = practicemanagement.id;
		return res.redirect( practicemanagement.UrlSlug );
	} );
}


function practiceApplication( req, res, next ) {
	const urlInfo = URL.parse( req.url );
	// sails.log.verbose( "urlInfo", urlInfo );
	const tplData = {applicationerror: null};
	if( !!req.session.applicationerror ) {
		tplData.applicationerror = req.session.applicationerror;
		req.session.applicationerror = "";
	}
	PracticeManagement.findOne( { UrlSlug: urlInfo.pathname.split( "/" )[ 1 ] } )
	.then( async ( practicemanagement ) => {
		if( practicemanagement == undefined ) {
			// sails.log.error( "practiceApplication; Practice not found by path:", req.url );
			return next();
		}
		req.session.practiceId = practicemanagement.id;
		tplData.practice = practicemanagement;
		tplData.states = await State.getExistingState();
		tplData.isTwilioEnabled = sails.config.twilioConfig.getTwilioConfig().isEnabled;
		return res.view( "frontend/application/userinformation", tplData );
	} );
}


function searchpracticeAction( req, res ) {
	let searchvalue = req.param( "searchvalue" );
	searchvalue = decodeURIComponent( searchvalue );

	let skiprecord = 0;
	const iDisplayLength = 500;
	let pagenum = 0;

	if( req.param( "pageIndex" ) ) {
		pagenum = req.param( "pageIndex" );
		if( parseInt( pagenum ) > 1 ) {
			pagenum = parseInt( pagenum ) - 1;
			skiprecord = parseInt( pagenum ) * parseInt( iDisplayLength );
		}
	}

	const patternvalue = new RegExp( "" + searchvalue + "" );
	const matchcriteria = {
		city: { $regex: patternvalue, $options: "mi" }
	};

	const practicematchcriteria = {
		PracticeName: { $regex: patternvalue, $options: "mi" }
	};

	/* var patternvalue = new RegExp(searchvalue);
	var matchcriteria={
		"city":  {'$regex': patternvalue ,$options:'i'}
	};

	var practicematchcriteria={
		"PracticeName":  {'$regex': patternvalue ,$options:'i'}
	};*/

	const sorttypevalue = { city: 1 };
	const practicesorttypevalue = { PracticeName: 1 };

	/* sails.log.info("pagenum::",pagenum);
	sails.log.info("patternvalue::",patternvalue);
	sails.log.info("searchvalue::",patternvalue);
	sails.log.info("matchcriteria::",matchcriteria);*/

	Cities.native( function( err, collection ) {
		collection.aggregate(
			[
				/* {
					$lookup: {
						from: "practicemanagement",
						localField: "_id",
						foreignField: "_id",
						as: "citydata"
					}
				},*/
				{
					$addFields: {
						type: "city"
					}
				},
				{
					$project: {
						city: 1,
						type: 2
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
					$limit: iDisplayLength
				}
			],
			function( err, result ) {
				if( err ) {
					return res.serverError( err );
				}

				PracticeManagement.native( function( err, collection ) {
					collection.aggregate(
						[
							{
								$addFields: {
									type: "practice"
								}
							},
							{
								$project: {
									PracticeName: 1,
									type: 2
								}
							},
							{
								$match: practicematchcriteria
							},
							{
								$sort: practicesorttypevalue
							},
							{
								$skip: skiprecord
							},
							{
								$limit: iDisplayLength
							}
						],
						function( err, practiceresult ) {
							if( err ) {
								return res.serverError( err );
							}

							let resultdata = [];
							if( result.length > 0 ) {
								resultdata = result;
							}

							if( practiceresult.length > 0 ) {
								_.forEach( practiceresult, function( practicedata ) {
									practicedata.city = practicedata.PracticeName;
									delete practicedata.PracticeName;
									resultdata.push( practicedata );
								} );
							}

							resultdata = _.orderBy( resultdata, [ "city" ], [ "asc" ] );

							const json = {
								status: 200,
								resultlength: resultdata.length,
								resultdata: resultdata
							};

							res.contentType( "application/json" );
							res.json( json );
						}
					);
				} );
			}
		);
	} );
}

function applysearchAction( req, res ) {
	// var searchinformation = req.allParams();
	// sails.log.info("searchinformation::",searchinformation);

	req.session.appPracticeId = "";
	req.session.appPracticeName = "";
	req.session.appPracticeSlug = "";
	req.session.appPracticeColor = "";
	req.session.appPracticeStateCode = "";
	req.session.appPracticeStateName = "";

	let searchpractice;
	let searchid;
	let searchtype;
	let pagename;
	const methodtype = req.method;
	if( "undefined" !== req.param( "searchpractice" ) && req.param( "searchpractice" ) != "" && req.param( "searchpractice" ) != null ) {
		searchpractice = req.param( "searchpractice" );
	}
	if( "undefined" !== req.param( "searchid" ) && req.param( "searchid" ) != "" && req.param( "searchid" ) != null ) {
		searchid = req.param( "searchid" );
	}
	if( "undefined" !== req.param( "searchtype" ) && req.param( "searchtype" ) != "" && req.param( "searchtype" ) != null ) {
		searchtype = req.param( "searchtype" );
	}
	if( "undefined" !== req.param( "pagename" ) && req.param( "pagename" ) != "" && req.param( "pagename" ) != null ) {
		pagename = req.param( "pagename" );
	}

	let type;
	if( "undefined" !== req.param( "type" ) && req.param( "type" ) != "" && req.param( "type" ) != null ) {
		type = req.param( "type" );
	}

	// sails.log.info("searchpractice::",searchpractice);
	// sails.log.info("searchid::",searchid);
	// sails.log.info("searchtype::",searchtype);
	// sails.log.info("methodtype::",methodtype);

	const searchData = [];
	const searchCount = 0;
	var blockviewmore = 0;
	let pagenumber = 0;
	let skipvalue = 0;
	const limitvalue = 25;
	if( req.method == "POST" ) {
		const criteria = {
			where: {
				or: [ { City: { contains: searchpractice } }, { PracticeName: { contains: searchpractice } } ]
			}
		};

		// sails.log.info("criteria::",criteria);
		PracticeManagement.count( criteria ).exec( function countCB( error, searchCount ) {
			if( "undefined" !== req.param( "pagenumber" ) && req.param( "pagenumber" ) != "" && req.param( "pagenumber" ) != null ) {
				pagenumber = req.param( "pagenumber" );
			}

			if( type == "applysearch" ) {
				if( parseInt( pagenumber ) > 0 ) {
					skipvalue = parseInt( pagenumber ) * limitvalue;
				}
			} else {
				skipvalue = 0;
				// limitvalue = searchCount;
			}

			sails.log.info( "pagenumber:: ", pagenumber );
			sails.log.info( "searchCount:: ", searchCount );
			sails.log.info( "skipvalue:: ", skipvalue );
			sails.log.info( "limitvalue:: ", limitvalue );

			const finalshowedCount = parseInt( skipvalue ) + parseInt( limitvalue );
			if( searchCount <= finalshowedCount ) {
				blockviewmore = 1;
			} else {
				pagenumber = parseInt( pagenumber ) + 1;
			}

			PracticeManagement.find( criteria, { select: [ "PracticeName", "PracticeUrl", "LocationName", "StreetAddress", "City", "StateCode", "UrlSlug" ] } )
			.skip( skipvalue )
			.limit( limitvalue )
			.then( function( searchData ) {
				const responseData = {
					status: 200,
					searchpractice: searchpractice,
					searchid: searchid,
					searchtype: searchtype,
					methodtype: methodtype,
					searchData: searchData,
					searchCount: searchCount,
					pagenumber: pagenumber,
					blockviewmore: blockviewmore
				};

				// sails.log.info("responseData::",responseData);

				if( type == "applysearch" ) {
					res.render( "frontend/homev3/applysearchinfo", responseData, function( err, listdata ) {
						const json = {
							code: 200,
							listdata: listdata,
							searchCount: searchCount,
							pagenumber: pagenumber,
							blockviewmore: blockviewmore
						};

						// sails.log.info("json::",json);
						res.contentType( "application/json" );
						res.json( json );
					} );
				} else {
					res.view( "frontend/homev3/applysearch", responseData );
				}
			} )
			.catch( function( err ) {
				const responseData = {
					status: 200,
					searchpractice: searchpractice,
					searchid: searchid,
					searchtype: searchtype,
					methodtype: methodtype,
					searchData: searchData,
					searchCount: searchCount,
					blockviewmore: blockviewmore,
					pagenumber: pagenumber
				};
				if( type == "applysearch" ) {
					res.render( "frontend/homev3/applysearchinfo", responseData, function( err, listdata ) {
						const json = {
							code: 200,
							listdata: listdata,
							searchCount: searchCount,
							blockviewmore: blockviewmore,
							pagenumber: pagenumber
						};
						res.contentType( "application/json" );
						res.json( json );
					} );
				} else {
					res.view( "frontend/homev3/applysearch", responseData );
				}
			} );
		} );
	} else {
		var blockviewmore = 1;
		const responseData = {
			status: 200,
			searchpractice: searchpractice,
			searchid: searchid,
			searchtype: searchtype,
			methodtype: methodtype,
			searchData: searchData,
			searchCount: searchCount,
			pagenumber: pagenumber,
			blockviewmore: blockviewmore
		};
		if( type == "applysearch" ) {
			res.render( "frontend/homev3/applysearchinfo", responseData, function( err, listdata ) {
				const json = {
					code: 200,
					listdata: listdata,
					searchCount: searchCount
				};
				res.contentType( "application/json" );
				res.json( json );
			} );
		} else {
			res.view( "frontend/homev3/applysearch", responseData );
		}
	}
}

function addproviderAction( req, res ) {
	let errorval = "";
	let successval = "";

	if( req.session.errormsg != "" ) {
		errorval = req.session.errormsg;
		req.session.errormsg = "";
	}
	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}

	State.getExistingState().then( function( states ) {
		res.view( "frontend/homev3/addprovider", { states: states, errorval: errorval, successval: successval } );
	} );
}

/* function getStartedAction(req,res){

	res.view("frontend/homev3/getstarted");
}*/

function addnewproviderAction( req, res ) {
	const providerRequest = req.allParams();

	const inputData = {
		providername: providerRequest.providername,
		city: providerRequest.city,
		state: providerRequest.state,
		firstname: providerRequest.firstname,
		lastname: providerRequest.lastname,
		email: providerRequest.email,
		phonenumber: providerRequest.phonenumber
	};

	Provider.createProvider( inputData ).then( function( providerDetails ) {
		if( providerDetails.code == 200 ) {
			req.session.successmsg = "";
			req.session.successmsg = "Provider has been created Successfully!";
			return res.redirect( "/providersuccess" );
		} else {
			req.session.errormsg = "";
			req.session.errormsg = "Provider name already exist";
			return res.redirect( "/addprovider" );
		}
	} );
}

function setSelectedPracticeAction( req, res ) {
	if( "undefined" !== req.param( "practiceID" ) && req.param( "practiceID" ) != "" && req.param( "practiceID" ) != null ) {
		const practiceID = req.param( "practiceID" );

		const criteria = {
			id: practiceID
		};
		PracticeManagement.findOne( criteria, { select: [ "PracticeName", "PracticeUrl", "LocationName", "StreetAddress", "City", "StateCode", "UrlSlug" ] } )
		.then( function( practiceData ) {
			if( practiceData ) {
				req.session.appPracticeId = practiceData.id;
				req.session.appPracticeSlug = practiceData.UrlSlug;
				req.session.appPracticeName = practiceData.PracticeName;
				req.session.appPracticeColor = practiceData.practiceColor;
				req.session.appPracticeStateCode = practiceData.StateCode;

				const statecriteria = { stateCode: practiceData.StateCode };

				State.findOne( statecriteria, { select: [ "name", "isActive" ] } )
				.then( function( stateDetails ) {
					if( stateDetails ) {
						req.session.appPracticeStateName = stateDetails.name;

						var json = {
							status: 200,
							message: "Practice id set"
						};
					} else {
						var json = {
							status: 400,
							message: "Invalid Practice state details"
						};
					}
					res.contentType( "application/json" );
					res.json( json );
				} )
				.catch( function( err ) {
					const json = {
						status: 400,
						message: "Invalid Practice state"
					};
					res.contentType( "application/json" );
					res.json( json );
				} );
			} else {
				const json = {
					status: 400,
					message: "Invalid Practice data"
				};
				res.contentType( "application/json" );
				res.json( json );
			}
		} )
		.catch( function( err ) {
			const json = {
				status: 400,
				message: "Invalid Practice details"
			};

			res.contentType( "application/json" );
			res.json( json );
		} );
	} else {
		const json = {
			status: 400,
			message: "Invalid practice"
		};

		res.contentType( "application/json" );
		res.json( json );
	}
}

function paymentcalculatorAction( req, res ) {
	res.view( "frontend/homev3/paymentcalculator" );
}
function providersuccessAction( req, res ) {
	res.view( "frontend/homev3/providersuccess" );
}

function estimatemonthlypayAction( req, res ) {
	// var allparams = req.allParams();
	// sails.log.info("allparams::",allparams);

	if( "undefined" !== typeof req.session.appPracticeId && req.session.appPracticeId != "" && req.session.appPracticeId != null && "undefined" !== typeof req.session.appPracticeSlug && req.session.appPracticeSlug != "" && req.session.appPracticeSlug != null ) {
		const practiceId = req.session.appPracticeId;
		const practiceSlug = req.session.appPracticeSlug;

		const firstname = req.param( "firstname" );
		const lastname = req.param( "lastname" );
		const email = req.param( "email" );
		const ficoscore = req.param( "ficoscore" );
		const financeamount = req.param( "financeamount" );

		const inputData = {
			practiceId: practiceId,
			ficoscore: ficoscore,
			financeamount: financeamount,
			firstname,
			lastname,
			email
		};

		Screentracking.getEstimateMonthlyPay( inputData )
		.then( function( responseDetails ) {
			sails.log.info( "HomeController#estimatemonthlypayAction ::::", responseDetails );
			if( responseDetails.code == 200 ) {
				const loanData = responseDetails.loanDetails;
				const loanDatalength = loanData.length;
				const responseData = {
					status: 200,
					loanDetails: loanData,
					loanDatalength: loanDatalength
				};

				res.render( "frontend/homev3/estimatemonthlypayinfo", responseData, function( err, listdata ) {
					const json = {
						status: 200,
						listdata: listdata
					};
					res.contentType( "application/json" );
					res.json( json );
				} );
			} else {
				if( responseDetails.code == 600 || responseDetails.code == 500 ) {
					var errorMessage = responseDetails.message;
				} else {
					var errorMessage = "Unable to estimate monthly payment for your requirement";
				}

				const json = {
					status: 400,
					message: errorMessage
				};

				res.contentType( "application/json" );
				res.json( json );
			}
		} )
		.catch( function( err ) {
			const json = {
				status: 400,
				message: "Unable to estimate monthly payment for your requirement"
			};
			res.contentType( "application/json" );
			res.json( json );
		} );
	} else {
		const json = {
			status: 400,
			message: "Unable to estimate monthly payment for your requirement"
		};
		res.contentType( "application/json" );
		res.json( json );
	}
}

function continueApplicationAction( req, res ) {
	if( "undefined" !== typeof req.session.appPracticeId && req.session.appPracticeId != "" && req.session.appPracticeId != null && "undefined" !== typeof req.session.appPracticeSlug && req.session.appPracticeSlug != "" && req.session.appPracticeSlug != null ) {
		const practiceId = req.session.appPracticeId;
		const practiceSlug = req.session.appPracticeSlug;

		const firstname = req.param( "firstname" );
		const lastname = req.param( "lastname" );
		const email = req.param( "email" );
		const ficoscore = req.param( "ficoscore" );
		const financeamount = req.param( "financeamount" );

		req.session.continueUserEmail = email;
		req.session.continueUserFirstName = firstname;
		req.session.continueUserLastName = lastname;
		req.session.continueFinanceAmount = financeamount;

		var json = {
			status: 200,
			message: "Continue application"
		};
		res.contentType( "application/json" );
		res.json( json );
	} else {
		var json = {
			status: 400,
			message: "Unable to continue application"
		};
		res.contentType( "application/json" );
		res.json( json );
	}
}

function updateuserAnticipatedAmountAction( req, res ) {
	const userId = req.session.userId ? req.session.userId : req.session.applicationuserId;
	if( "undefined" !== typeof userId && userId != "" && userId != null ) {
		let annualincome = req.param( "annualincome" );
		annualincome = annualincome.replace( "$ ", "" );
		annualincome = annualincome.replace( /,/g, "" );
		annualincome = annualincome.replace( " ", "" );

		let financedAmount = req.param( "financedAmount" );
		financedAmount = financedAmount.replace( "$ ", "" );
		financedAmount = financedAmount.replace( /,/g, "" );
		financedAmount = financedAmount.replace( " ", "" );

		const checkcriteria = {
			user: userId
		};
		Screentracking.findOne( checkcriteria )
		.then( function( screenRes ) {
			screenRes.requestedLoanAmount = financedAmount;
			screenRes.incomeamount = annualincome;

			// -- Added for multiple loans
			// screenRes.accounts		=	account.id;
			// screenRes.isAccountLinked = 1;

			// --Added isBankAdded on 25/10/2018 to enable fill out manually option in borrower portal.
			// screenRes.isBankAdded = 1;
			// screenRes.lastlevel = 4;

			screenRes.save( function( err ) {
				// User.update({id: userid}, {isBankAdded: true}).exec(function afterwards(err, updated){});

				const json = {
					status: 200,
					message: "Loan amount updated successfully"
				};
				res.contentType( "application/json" );
				res.json( json );
			} );
		} )
		.catch( function( err ) {
			const json = {
				status: 400,
				message: "Invalid screen id"
			};
			res.contentType( "application/json" );
			res.json( json );
		} );
	} else {
		const json = {
			status: 400,
			message: "Invalid user"
		};
		res.contentType( "application/json" );
		res.json( json );
	}
}
function clicktosaveAction( req, res ) {
	const userinformation = req.allParams();
	sails.log.info( "userData", userinformation );
	User.checkuseralreadyregistered( req, userinformation ).then( function( userDetails ) {
		if( userDetails.rescode == 200 ) {
			var json = {
				status: 200,
				message: "User registered successfully."
			};
			res.contentType( "application/json" );
			res.json( json );
		} else {
			var json = {
				status: 400,
				message: "Email Already exist"
			};
			res.contentType( "application/json" );
			res.json( json );
		}
	} );
}
function onclicktosaveAction( req, res ) {
	const userformdata = req.allParams();
	sails.log.info( "userData", userformdata );
	const userId = req.session.userId ? req.session.userId : req.session.applicationuserId;
	const userCriteria = { id: userId };
	let setupdate = 0;
	if( "undefined" !== typeof userId && userId != "" && userId != null ) {
		User.findOne( userCriteria ).then( function( userResult ) {
			if( "undefined" !== typeof userformdata.first_name && userformdata.first_name != "" && userformdata.first_name != null ) {
				userResult.firstname = userformdata.first_name;
				setupdate = 1;
			}
			if( "undefined" !== typeof userformdata.last_name && userformdata.last_name != "" && userformdata.last_name != null ) {
				userResult.lastname = userformdata.last_name;
				setupdate = 1;
			}
			if( "undefined" !== typeof userformdata.security_number && userformdata.security_number != "" && userformdata.security_number != null ) {
				userResult.ssnNumber = userformdata.security_number;
				userResult.ssn_number = userformdata.security_number;
				setupdate = 1;
			}

			if( "undefined" !== typeof userformdata.firstname && userformdata.firstname != "" && userformdata.firstname != null ) {
				userResult.firstname = userformdata.firstname;
				setupdate = 1;
			}
			if( "undefined" !== typeof userformdata.lastname && userformdata.lastname != "" && userformdata.lastname != null ) {
				userResult.lastname = userformdata.lastname;
				setupdate = 1;
			}
			if( "undefined" !== typeof userformdata.ssnNumber && userformdata.ssnNumber != "" && userformdata.ssnNumber != null ) {
				userResult.ssnNumber = userformdata.ssnNumber;
				setupdate = 1;
			}
			if( "undefined" !== typeof userformdata.dateofBirth && userformdata.dateofBirth != "" && userformdata.dateofBirth != null ) {
				userResult.dateofBirth = userformdata.dateofBirth;
				setupdate = 1;
			}
			if( "undefined" !== typeof userformdata.phoneNumber && userformdata.phoneNumber != "" && userformdata.phoneNumber != null ) {
				userResult.phoneNumber = userformdata.phoneNumber;
				setupdate = 1;
			}
			if( "undefined" !== typeof userformdata.workphone && userformdata.workphone != "" && userformdata.workphone != null ) {
				userResult.workphone = userformdata.workphone;
				setupdate = 1;
			}
			if( "undefined" !== typeof userformdata.street && userformdata.street != "" && userformdata.street != null ) {
				userResult.street = userformdata.street;
				setupdate = 1;
			}
			if( "undefined" !== typeof userformdata.zipCode && userformdata.zipCode != "" && userformdata.zipCode != null ) {
				userResult.zipCode = userformdata.zipCode;
				setupdate = 1;
			}
			if( "undefined" !== typeof userformdata.residencytype && userformdata.residencytype != "" && userformdata.residencytype != null ) {
				userResult.residencytype = userformdata.residencytype;
				setupdate = 1;
			}
			if( "undefined" !== typeof userformdata.city && userformdata.city != "" && userformdata.city != null ) {
				userResult.city = userformdata.city;
				setupdate = 1;
			}
			if( "undefined" !== typeof userformdata.state && userformdata.state != "" && userformdata.state != null ) {
				userResult.state = userformdata.state;
				setupdate = 1;
			}
			userResult.save( function( err ) {
				if( "undefined" !== typeof req.session.userfilloutmanually && req.session.userfilloutmanually != "" && req.session.userfilloutmanually != null ) {
					let annualincome = userformdata.annualincome;
					annualincome = annualincome.replace( "$ ", "" );
					annualincome = annualincome.replace( /,/g, "" );
					annualincome = annualincome.replace( " ", "" );
					let financedAmount = userformdata.financedAmount;
					financedAmount = financedAmount.replace( "$ ", "" );
					financedAmount = financedAmount.replace( /,/g, "" );
					financedAmount = financedAmount.replace( " ", "" );

					const screenCriteria = { user: userId, iscompleted: 0 };
					Screentracking.findOne( screenCriteria )
					.sort( "createdAt DESC" )
					.then( function( screendata ) {
						screendata.requestedLoanAmount = financedAmount;
						screendata.incomeamount = annualincome;
						screendata.save( function( err ) {
							const json = {
								status: 200,
								message: "User updated successfully",
								setupdate: setupdate
							};
							res.contentType( "application/json" );
							res.json( json );
						} );
					} );
				} else {
					const json = {
						status: 200,
						message: "User updated successfully",
						setupdate: setupdate
					};
					res.contentType( "application/json" );
					res.json( json );
				}
			} );
		} );
	} else {
		const json = {
			status: 400,
			message: "Please try again!",
			setupdate: setupdate
		};
		res.contentType( "application/json" );
		res.json( json );
	}
}

function updateUserEmailInternal( userId, emailAddress ) {
	const results = {};
	sails.log.info( "JH HomeController.js updateUserEmailInternal userId: ", userId );

	return User.findOne( { email: emailAddress } )
	.then( ( emailData ) => {
		if( emailData ) {
			if( emailData.id == userId ) {
				results.code = 200;
				results.body = {
					updated: false
				};
			} else {
				results.code = 409;
				results.err = new Error( "email already exists" );
				results.body = {
					updated: false,
					error: results.err.message
				};
			}
			return results;
		} else {
			return User.findOne( { id: userId } )
			.then( ( userData ) => {
				userData.email = emailAddress;
				userData.isEmailVerified = false;

				return new Promise( ( resolve, reject ) => {
					userData.save( ( err ) => {
						results.body = {};
						if( err ) {
							results.code = 500;
							results.err = err;
							results.body.error = err.message;
							results.body.updated = false;
						} else {
							results.code = 200;
							results.body.updated = true;
						}
						resolve( results );
					} );
				} );
			} );
		}
	} )
	.catch( ( err ) => {
		sails.log.error( 'HomeController#updateUserEmailInternal UserCatch :: err', err );
		results.code = 500;
		results.err = err;
		results.body = {
			updated: false,
			error: err.message
		};
		return results;
	} );
}

function updateUserEmail( req, res ) {
	var userId = req.session.userId;
	var emailAddress = req.param( "email" );
	return updateUserEmailInternal( userId, emailAddress )
	.then( ( results ) => {
		res.status( results.code ).json( results.body );
		return;
	} );
}

function sendverificationemailInternal( user_id ) {
	sails.log.info( "JH HomeController.js sendVerificationEmailInternal user_id ", user_id );
	const results = {};
	results.body = {};

	return User.findOne( { id: user_id } )
	.then( ( userdetails ) => {
		const email_status = userdetails.isEmailVerified;
		if( email_status == false ) {
			return EmailService.profileEmailSend( userdetails )
			.then( () => {
				results.code = 200;
				results.body.sent = true;
				return results;
			} );
		} else {
			results.code = 200;
			results.err = new Error( "E-mail already verified." );
			results.body.sent = false;
			results.body.error = results.err.message;
			return results;
		}
	} )
	.catch( ( err ) => {
		results.code = 500;
		results.err = err;
		results.body.sent = false;
		results.body.error = err.message;
		return results;
	} );
}

function sendverificationemail( req, res ) {
	var userId = req.session.userId;
	return sendverificationemailInternal( userId )
	.then( ( results ) => {
		res.status( results.code ).json( results.body );
		return;
	} );
}

async function skipBankLogin( req, res ) {
	sails.log.info( "HomeController.skipBankLogin req.session.userId", req.session.userId );
	sails.log.info( "HomeController.skipBankLogin req.session.screenId", req.session.screenId );
	const screenId = req.session.screentrackingId;
	const userId = req.session.userId;
	await User.update( { id: userId }, { isBankAdded: false } );
	await Screentracking.update(
		{ id: screenId },
		{
			isBankAdded: 0,
			filloutmanually: 1,
			lastlevel: 3,
			lastScreenName: "Offers Details"
		}
	);
	res.redirect( "/myoffers" );
}
