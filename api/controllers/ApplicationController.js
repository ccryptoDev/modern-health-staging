/* global sails, State, User, ApplicationService, Screentracking, EmailService, Agreement, UserConsent, MHFImportApplication, PracticeManagement, Utils, Roles, MathExt, UserBankAccount, Account */

/**
 * ApplicationController
 *
 * @description :: Server-side logic for managing States
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
"use strict";

// const request = require('request');
const passport = require( "passport" );
const _ = require( "lodash" );
const moment = require( "moment" );
const bcrypt = require( "bcrypt" );
const fs = require( "fs" );
const path = require( "path" );
const csv = require( "fast-csv" );

const testSSN = ['666-60-3693'];

const defaultInterestRates = {
	"A": {
		"10": 16.9,
		"15": 18.9,
		"18": 19.9,
		"24": 21.9
	},
	"B": {
		"10": 17.9,
		"15": 19.9,
		"18": 20.9,
		"24": 22.9
	},
	"C": {
		"10": 18.9,
		"15": 20.9,
		"18": 21.9,
		"24": 23.9
	},
	"D": {
		"10": 19.9,
		"15": 21.9,
		"18": 22.9,
		"24": 24.9
	},
	"E": {
		"10": 20.9,
		"15": 22.9,
		"18": 23.9,
		"24": 25.9
	},
	"F": {
		"10": 21.9,
		"15": 23.9,
		"18": 24.9,
		"24": 26.9
	},
	"G": {
		"10": 22.9,
		"15": 24.9,
		"18": 25.9,
		"24": 27.9
	}
}

module.exports = {
	/* new for MH start */
	userInformation: userInformation,
	application: application,
	emailverifylanding: emailverifylanding,
	createApplication: createApplication,
	createApplicationPost: createApplicationPost,
	/* new for MH end */
	addApplication: addApplicationAction,
	testapplication: testapplicationAction,
	uploaddocuments: uploaddocumentsAction,
	adddocument: adddocumentAction,
	uploaddropfiles: uploaddropfilesAction,
	serviceloandocuments: serviceloandocumentsAction,
	serviceconfirmsignature: serviceconfirmsignatureAction,
	servicecreateloandetails: servicecreateloandetailsAction,
	servicesuccessmessage: servicesuccessmessageAction,
	promissorynote: promissorynoteAction,
	createpromissorypdf: createpromissorypdfAction,
	servicecreatepromissorypdf: servicecreatepromissorypdfAction,
	createstateregulation: createstateregulationAction,
	ajaxgetstateregulations: ajaxgetstateregulationsAction,
	getinterestratefields: getinterestratefieldsAction,
	createupdateinterestrate: createupdateinterestrateAction,
	getuploadeddocuments: getuploadeddocumentsAction,
	viewRuleDecisionMaker: viewRuleDecisionMaker,
	postRuleDecisionMaker: postRuleDecisionMaker,
	servicegetuploadeddocuments: servicegetuploadeddocuments,
	updatetranshistorydata: updatetranshistorydata,
	getTransunionDetails: getTransunionDetailsAction,
	getUserBankDetails: getUserBankDetailsAction,
	getPaymentmanagementDetails: getPaymentmanagementDetailsAction,
	postNewRuleDecision: postNewRuleDecisionAction,
	checkuserdocuments: checkuserdocumentsAction,
	couserinformation: couserinformationAction,
	couserinformationfull: couserinformationfullAction,
	cofinancialinfomation: cofinancialinfomationAction,
	sendforgotpassword: sendforgotpasswordAction,
	usersetpassword: usersetpasswordAction,
	updateuserpassword: updateuserpasswordAction,
	savechangepassword: savechangepasswordAction,
	receivenotifi: receivenotifiAction,
	uploadAvatar: uploadAvatarAction,
	contract: contract,
	importApplications: importApplications,
	importApplicationsPost: importApplicationsPost,
	confirmUserSetPassword: confirmUserSetPassword,
	confirmUserSetPasswordPost: confirmUserSetPasswordPost,
	continueApplicationPost: continueApplicationPost,
	saveloanoffer: saveloanoffer,
	createloandetails: createloandetails,
	finalize: finalize,
	finalizeValidate: finalizeValidate,
	submitApplicationButton: submitApplicationButton,
	thankyou: thankyou,
	generateNewOffers: generateNewOffers
};

function getInterestRate(term, tier) {
	const defaultInterestByTier = defaultInterestRates[tier] || defaultInterestRates['G'];
	return defaultInterestByTier[`${term}`];
}

function generateNewOffers ( req, res ) {
	const applicationValues = { ...req.body };
	const interestRates = {
		"10": Number(applicationValues.interestRate10),
		"15": Number(applicationValues.interestRate15),
		"18": Number(applicationValues.interestRate18),
		"24": Number(applicationValues.interestRate24)
	};
	const offers = [];
	const offersTerms = [10, 15, 18, 24];

	// generates 4 offers
	for(let i = 0; i < offersTerms.length; i++) {
		const offer = {
			term: offersTerms[i],
			validOffer: true,
			paymentFrequency: "monthly",
			creditTier: applicationValues.tier,
			interestRate: applicationValues.interest_rate,
			apr: applicationValues.interest_rate,
			requestedLoanAmount: applicationValues.requestedAmount,
			financedAmount: applicationValues.requestedAmount,
			financeCharge: 0.0,
			downPayment: applicationValues.downPayment,
			fundingRate: applicationValues.fundingRate,
			monthlyPayment: 0,
			postDTIMonthlyAmount: 0.0,
			postDTIPercentValue: 0.0
		};

		if (interestRates[`${offer.term}`]) {
			offer.interestRate = interestRates[`${offer.term}`];
		} else {
			offer.interestRate = getInterestRate(offer.term, offer.creditTier);
		}
		offer.monthlyPayment = parseFloat( Math.abs( parseFloat( MathExt.pmt( ( offer.interestRate / 100 ) / 12, offer.term, offer.financedAmount ) ) ).toFixed( 2 ) );
		const effectiveAPR = Screentracking.calculateApr( offer.term, ( offer.monthlyPayment * -1 ), offer.financedAmount, 0, 0, offer.interestRate );
		const pmtSchedule = MathExt.makeAmortizationSchedule( offer.financedAmount, offer.monthlyPayment, offer.interestRate, offer.term );
		offer.apr = parseFloat( ( MathExt.float( effectiveAPR, 5 ) * 12 * 100 ).toFixed( 1 ) );
		offer.financeCharge = pmtSchedule.financeCharge;
		offer.monthlyPayment = pmtSchedule.payment;
		
		offers.push(offer);
	}
	
	const screenUpdate = {
		offers: offers
	};
	return Screentracking.update( { id: applicationValues.screentrackingid }, screenUpdate )
	.then( () => {
		return res.status(200).json({ offers: offers });
	} )
	.catch( ( err ) => {
		sails.log.error( "importApplication; Screentracking.update.catch:", err, JSON.stringify( applicationValues ) );
	} );
}

function userInformation( req, res ) {
	sails.log.info( "ApplicationController.userinformation" );
	// TODO need to change this when we put in correct workflow for picking Practice
	req.session.appPracticeName = "SRM Practice";
	res.view( "frontend/application/userinformation", { navtab: 2 } );
}
function application( req, res ) {
	return Promise.resolve();
	// wipe out session and start a new session
	return new Promise( ( resolve ) => {
		req.session.regenerate( resolve );
	} )
	.then( () => {
		const ip = ( req.headers[ "x-forwarded-for" ] || req.headers[ "x-real-ip" ] || req.connection.remoteAddress ).replace( "::ffff:", "" ).replace( /^::1$/, "127.0.0.1" );
		const todaydate = moment().format( "MM/DD/YYYY" );
		const firstname = req.param( "firstname" );
		sails.log.info( "ApplicationController.createApplication firstname", firstname );
		req.session.userinfo = {
			firstname: req.param( "firstname" ).trim(),
			middlename: req.param( "middlename" ).trim(),
			lastname: req.param( "lastname" ).trim(),
			email: req.param( "email" ),
			phoneNumber: req.param( "phone" ).replace( /[^0-9]/g, "" ),
			password: req.param( "password" ),
			confirmpassword: req.param( "confirmpassword" )
		};
		checkForSuffix( req.session.userinfo.lastname );
		return State.getExistingState()
		.then( ( states ) => {
			return res.view( "frontend/application/application", { stateData: states, ip: ip, todaydate: todaydate } );
		} )
		.catch( ( err ) => {
			sails.log.error( "ApplicationController.createApplicationAction.getExistingState; :: err:", err );
			return res.handleError( { code: 500, message: "INTERNAL_SERVER_ERROR" } );
		} );
	} );
	function checkForSuffix( lastname ) {
		if( lastname.includes( " " ) ) {
			const nameParts = lastname.split( " " );
			if( nameParts.length > 1 ) {
				const suffix = nameParts[ 1 ].trim().toUpperCase();
				const genCodes = [ "JR", "SR", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX" ];
				if( genCodes.indexOf( suffix ) >= 0 ) {
					req.session.userinfo.lastname = nameParts[ 0 ].trim();
					req.session.userinfo.generationCode = suffix;
				}
			}
		}
	}
}

function emailverifylanding( req, res ) {
	const userid = req.param( "id" );
	sails.log.info( "ApplicationController.emailverifylanding userid", userid );

	User.findOne( { id: userid } )
	.then( ( user ) => {
		sails.log.info( "ApplicationController.js profileemailanding user: ", user );
		if( user ) {
			if( user.isEmailVerified ) {
				sails.sockets.broadcast( userid, "emailverified", { msg: "emailverified" } );
				return res.view( "frontend/application/emailverifylanding", {} );
			} else {
				user.isEmailVerified = true;
				user.save( () => {
					sails.sockets.broadcast( userid, "emailverified", { msg: "emailverified" } );
					return res.view( "frontend/application/emailverifylanding", {} );
				} );
			}
		}
	} ).catch( ( err ) => {
		sails.log.error( "HomeController#emailverifylanding :: err", err );
		return res.handleError( err );
	} );
}


async function createApplication( req, res ) {
	const userinfo = req.session.deferUser;
	if( typeof userinfo !== "object" || userinfo == null ) {
		sails.log.error( "createApplication; missing req.session.deferUser" );
		return res.redirect( "/apply" );
	}
	const tplData = {
		error: "",
		reapplyerror: "",
		dupssnerror: "",
		userinfo: userinfo || {},
		screenTracking: req.session.deferScreenTracking || {}
	};
	if( req.session.reapplyerror !== "" ) {
		tplData.reapplyerror = req.session.reapplyerror;
		req.session.reapplyerror = "";
	}
	if( req.session.dupssnerror !== "" ) {
		tplData.dupssnerror = req.session.dupssnerror;
		req.session.dupssnerror = "";
	}
	if( req.session.applicationerror !== "" ) {
		tplData.applicationerror = req.session.applicationerror;
		req.session.applicationerror = "";
	}
	if( req.session.esignPath !== "" ) {
		tplData.esignPath = req.session.esignPath;
	}
	if( req.session.creditAuthPath !== "" ) {
		tplData.creditAuthPath = req.session.creditAuthPath;
	}
	if( req.session.smsPath !== "" ) {
		tplData.smsPath = req.session.smsPath;
	}
	// if( req.session.deniedstatus !== "" && req.session.deniedstatus !== null && "undefined" !== typeof req.session.deniedstatus ) {
	// 	req.session.deniedstatus = "";
	// }

	const yearRange = [];
	const currentYear = moment().year();
	const firstYear = currentYear - 100;

	let year = currentYear - 18;
	while( year >= firstYear ) {
		yearRange.push( year );
		year--;
	}

	tplData.stateData = await State.getExistingState();
	tplData.pagename = "application";
	tplData.ip = ( req.headers[ "x-forwarded-for" ] || req.headers[ "x-real-ip" ] || req.connection.remoteAddress ).replace( "::ffff:", "" ).replace( /^::1$/, "127.0.0.1" );
	const barrowername = [ userinfo.firstname, userinfo.lastname ].join( " " );
	const todaydate = moment().format( "MM/DD/YYYY" );
	sails.log.info( "todaydate", todaydate );
	tplData.agreementObject = { date: todaydate, barrowername: barrowername };
	tplData.dateofBirth = ( userinfo.dateofBirth ? moment( new Date( userinfo.dateofBirth ) ).format( "MM/DD/YYYY" ) : "" );
	PracticeManagement.findOne( { id: userinfo.practicemanagement } )
	.then( ( practicemanagement ) => {
		tplData.practiceName = practicemanagement.PracticeName;
		tplData.practiceAddress = practicemanagement.StreetAddress;
		tplData.practiceCity = practicemanagement.City;
		tplData.practiceState = practicemanagement.StateCode;
		tplData.practiceZip = practicemanagement.ZipCode;
		tplData.practicePhone = practicemanagement.PhoneNo.replace( /(\d{3})(\d{3})(\d{4})/, "$1-$2-$3" );
		tplData.practiceEmail = practicemanagement.PracticeEmail;
		tplData.practice = { practiceLogo: practicemanagement.practiceLogo, poweredLogo: practicemanagement.poweredLogo };
		tplData.birthYears = yearRange;
		sails.log.info( "tplData ", tplData );
		return res.view( "frontend/application/application", tplData );
	} );
}


function createApplicationPost( req, res ) {
	const userinfo = {
		street: `${req.param( "street" )}`.trim(),
		unitapt: `${req.param( "unitapt" )}`.trim(),
		city: `${req.param( "city" )}`.trim(),
		state: `${req.param( "state" )}`.substr( 0, 2 ),
		zipCode: `${req.param( "zip" )}`.substr( 0, 5 ),
		ssn_number: `${req.param( "ssn_number" )}`.replace( /[^0-9]/g, "" ).substr( 0, 9 ),
		dateofBirth: `${req.param( "birthyear" )}-${req.param( "birthmonth" )}-${req.param( "birthday" )}`,
		consentChecked: ( req.param( "consent" ) == "true" )
	};
	let user = null;
	let screentracking = null;

	sails.log.info( "ApplicationController.createApplication userinfo:", userinfo );
	let practiceId = userinfo.practicemanagement;
	let redirectUrl = "/createapplication";

	 User.update( { email: req.session.deferUser.email },
		{
			"street": userinfo.street,
			"unitapt": userinfo.unitapt,
			"city": userinfo.city,
			"state": userinfo.state,
			"zipCode": userinfo.zipCode,
			"ssn_number": userinfo.ssn_number,
			"dateofBirth": userinfo.dateofBirth,
			"consentChecked": userinfo.consentChecked
		})
	.then( ( userInfo ) => {
		sails.log.info( "ApplicationController.createApplication userInfo------------------: ", userInfo );
		if( userInfo.code == 400 ) { // error creating user check for dupusererror or reapply error
			sails.log.info( "ApplicationController.createApplication userinfo: ", userInfo );
			return res.view( "frontend/application/application", userInfo );
		}
		// delete req.session.deferUser;
		return new Promise( ( resolve ) => {
			req.session.regenerate( resolve );
		} )
		.then( () => {
			user = userInfo[0];
			console.log('user in createApplicationPost',user)
			req.session.loginType = "frontend";
			return new Promise( ( resolve, reject ) => {
				const userinfo = {
					email: user.email,
					firstname: user.firstname,
					lastname: user.lastname,
					createdAt: user.createdAt,
					role: user.role,
					id: user.id,
					practicemanagement: user.practicemanagement,
					logintype: "user-local" // muy importante
				};
				req.logIn( userinfo, ( err ) => {
					if( err ) {
						// res.handleError( err );
						sails.log.error( "createApplicationPost; req.logIn() err:", err );
						return reject( err );
					}
					// return UserController.sendTextInviteInternal( userinfo.id )
					// .then( ( results ) => {
					req.session.practiceId = userinfo.practicemanagement;
					req.session.loginType = "frontend";
					req.session.levels = 1;
					return resolve();
					// 	redirectUrl = "/createapplication";
					// 	return res.redirect( redirectUrl );
					// } );
				} );
			} );
		} )
		.then( () => {
			const employinfo = {
				user: user.id,
				employerName: req.param( "employername" ),
				payFrequency: req.param("payFrequency"),
				jobTitle: req.param( "jobtitle" ),
				employmentStatus: req.param( "employmentstatus" ),
				jobStartDate: req.param( "jobstartdate" ),
				phone: req.param( "phoneemployer" ),
				isAfterHoliday: req.body.paymentBeforeAfterHolidayWeekend === "1"?EmploymentHistory.decisionCloudIsAfterHoliday.AFTER_HOLIDAY:EmploymentHistory.decisionCloudIsAfterHoliday.BEFORE_HOLIDAY,
			};
			EmploymentHistory.createOrUpdateEmploymentHistory( employinfo )
			.then( ( msg ) => {
				req.session.userId = user.id;
				EmailService.senduserRegisterEmail( user );
				return User.getNextSequenceValue( "application" )
				.then( ( applicationRefernceData ) => {

					const residenceType = `${req.param( "residenceType" )}`.toLowerCase();
					return Screentracking.find({user: user.id}).then( (screenTrackingList) => {
						if(screenTrackingList && screenTrackingList.length > 0) {
							const existingScreenTracking = screenTrackingList[0];
							existingScreenTracking.lastlevel = 1;
							existingScreenTracking.lastScreenName = "Application";
							existingScreenTracking.iscompleted = 0;
							existingScreenTracking.preferredDueDate = req.param( "preferredDueDate" );
							existingScreenTracking.incomeamount = Math.trunc( parseFloat( `${req.param( "incomeamount" )}`.replace( /[^0-9.]/g, "" ) ));
							existingScreenTracking.residenceType = ( [ "own", "rent", "other" ].indexOf( residenceType ) >= 0 ? residenceType : "other" );
							existingScreenTracking.housingExpense = Math.trunc( parseFloat( `${req.param( "housingExpense" )}`.replace( /[^0-9.]/g, "" ) ));
							sails.log.info( "screentrackingDocExisting", existingScreenTracking );
							return existingScreenTracking.save().then(() => {
								screentracking = existingScreenTracking;
								return creditBureauInquiry(screentracking);
							});
						}else {
							const screentrackingDoc = {
								user: user.id,
								applicationReference: `APL_${applicationRefernceData.sequence_value}`,
								lastlevel: 1,
								lastScreenName: "Application",
								preferredDueDate: req.param( "preferredDueDate" ),
								practicemanagement: user.practicemanagement,
								iscompleted: 0,
								incomeamount: Math.trunc( parseFloat( `${req.param( "incomeamount" )}`.replace( /[^0-9.]/g, "" ) )),
								residenceType: ( [ "own", "rent", "other" ].indexOf( residenceType ) >= 0 ? residenceType : "other" ),
								housingExpense: Math.trunc( parseFloat( `${req.param( "housingExpense" )}`.replace( /[^0-9.]/g, "" ) )),
								requestedLoanAmount: 0
							};
							sails.log.info( "screentrackingDoc", screentrackingDoc );
							return Screentracking.create( screentrackingDoc )
								.then( ( screenTracking ) => {
									// sails.log.info( "screenTracking", screenTracking );
									screentracking = screenTracking;
									return creditBureauInquiry(screentracking);
								} );
						}
					})
				} );
			});
		} );

		function creditBureauInquiry(screentracking) {
			const transunion = sails.config.transunion;
			const ip = ( req.headers[ "x-forwarded-for" ] || req.headers[ "x-real-ip" ] || req.connection.remoteAddress ).replace( "::ffff:", "" ).replace( /^::1$/, "127.0.0.1" );
			const userArray = {};
			const addressarray = {};
			const transactionControl = {
				"userRefNumber": user.id,
				"subscriber": {
					"industryCode": transunion.industryCode,
					"memberCode": transunion.memberCode,
					"inquirySubscriberPrefixCode": transunion.prefixCode,
					"password": transunion.password
				},
				"options": {
					"processingEnvironment": transunion.env,
					"country": "us",
					"language": "en",
					"contractualRelationship": "individual",
					"pointOfSaleIndicator": "none"
				}
			};
			return ApplicationService.createcertificate( addressarray, transactionControl, transunion.certificate, userArray, user.ssn_number, user, req.param )
			.then( ( responseDetails ) => {
				// sails.log.info( "ApplicationController.addApplication; responseDetails:", JSON.stringify( responseDetails, null, 4 ) );
				sails.log.info( "ApplicationController.createApplication; ApplicationService.createcertificate(): responseDetails.code:", responseDetails.code );
				if( responseDetails.code !== 200 ) {
					// TODO messaging to ui
					req.session.deferUser = user;
					req.session.applicationerror = responseDetails.message;
					req.session.deniedstatus = 1;
					req.session.deferScreenTracking = screentracking;
					return res.redirect( redirectUrl );
				}


				return ApplicationService.updateApplicationDetails( addressarray, transactionControl, transunion.certificate, userArray, user.ssn_number, user, req.param, responseDetails.resultdata, "", screentracking )
				.then( ( cbAppResponse ) => {
					// sails.log.info( "ApplicationController.addApplication; cbAppResponse:", JSON.stringify( cbAppResponse, null, 4 ) );
					req.session.applicationReferenceValue = cbAppResponse.screenTracking.applicationReference;
					req.session.screentrackingId = cbAppResponse.screenTracking.id;
					const applicationReference = cbAppResponse.screenTracking.applicationReference;
					const screenId = cbAppResponse.screenTracking.id;
					return Promise.resolve()
					.then( () => {
						const consents = [];
						consents.push(
							Agreement.findOne( { documentKey: "126", practicemanagement: practiceId } )
							.then( ( agreement ) => {
								sails.log.info( "ApplicationController.addApplication; agreement:", agreement );
								return UserConsent.createConsentfordocuments( agreement, user, ip, screenId )
								.then( ( userconsentdetails ) => {
									sails.log.info( "ApplicationController.addApplication; userconsentdetails:", userconsentdetails );
									const consentID = userconsentdetails.id;
									return UserConsent.createStaticAgreementPdf( consentID, userconsentdetails, applicationReference, ip, null, null, res, req );
								} );
							} )
							.catch( ( err ) => {
								sails.log.error( "ApplicationController.addApplication; catch:", err );
							} )
						);
						consents.push(
							Agreement.findOne( { documentKey: "125", practicemanagement: practiceId } )
							.then( ( agreementdetails ) => {
								sails.log.info( "ApplicationController.addApplication; agreementdetails:", agreementdetails );
								return UserConsent.createConsentfordocuments( agreementdetails, user, ip, screenId )
								.then( ( userconsentdetail ) => {
									sails.log.info( "ApplicationController.addApplication; userconsentdetail:", userconsentdetail );
									const consentID = userconsentdetail.id;
									return UserConsent.createStaticAgreementPdf( consentID, userconsentdetail, applicationReference, ip, null, null, res, req );
								} );
							} )
							.catch( ( err ) => {
								sails.log.error( "ApplicationController.addApplication; catch:", err );
							} )
						);
						consents.push(
							Agreement.findOne( { documentKey: "120", practicemanagement: practiceId } )
							.then( ( agreementdetails ) => {
								sails.log.info( "ApplicationController.addApplication; agreementdetails:", agreementdetails );
								return UserConsent.createConsentfordocuments( agreementdetails, user, ip, screenId )
								.then( ( userconsentdetail ) => {
									sails.log.info( "ApplicationController.addApplication; userconsentdetail:", userconsentdetail );
									const consentID = userconsentdetail.id;
									return UserConsent.createStaticAgreementPdf( consentID, userconsentdetail, applicationReference, ip, null, null, res, req );
								} );
							} )
							.catch( ( err ) => {
								sails.log.error( "ApplicationController.addApplication; catch:", err );
							} )
						);
						return Promise.all( consents )
						.then( () => {
							if( cbAppResponse.code !== 200 ) {
								if( cbAppResponse.ssnNoHit === true && !testSSN.includes(user.ssn_number) ) {
									req.session.applicationerror = "Could not retrieve your credit information.";
									req.session.deniedstatus = 1;
									req.session.deferUser = user;
									req.session.deferScreenTracking = screentracking;
									return res.redirect( redirectUrl );
								} else {
									sails.log.info( "cbAppResponse.screenTracking.rulesDetails ", cbAppResponse.screenTracking.rulesDetails );
									const updateObj = {
										lockCreditTier: "G",
										lastlevel: 2
									};
									if( cbAppResponse.code === 202 ) {
										updateObj.deniedmessage = cbAppResponse.deniedmessage;
									}
									return Screentracking.update( { id: cbAppResponse.screenTracking.id }, updateObj );
								}
							} else {
								req.session.levels = 2;
								return Screentracking.update( { id: cbAppResponse.screenTracking.id }, { lastlevel: 2 } );
							}
						} )
						.then(function(){
							Screentracking.getSelectionOffer( user.id, "", "" );
						})
						.then( () => {
							delete req.session.deniedstatus;
							redirectUrl = "/banktransaction";
							return res.redirect( redirectUrl );
						} )
						.catch( ( err ) => {
							sails.log.error( "ApplicationController#addApplication :: err:", err );
							req.session.applicationerror = "Could not recieve your credit details";
							req.session.deniedstatus = 1;
							req.session.deferUser = user;
							req.session.deferScreenTracking = screentracking;
							return res.redirect( redirectUrl );
						} );
					} );
				} )
				.catch( ( err ) => {
					sails.log.error( "ApplicationController#addApplication :: err:", err );
					req.session.applicationerror = "Could not recieve your credit details";
					req.session.deniedstatus = 1;
					req.session.deferUser = user;
					req.session.deferScreenTracking = screentracking;
					return res.redirect( redirectUrl );
				} );
			} )
			.catch( ( err ) => {
				sails.log.error( "ApplicationController#addApplication :: err:", err );
				req.session.applicationerror = "Could not recieve your credit details";
				req.session.deniedstatus = 1;
				req.session.deferUser = user;
				req.session.deferScreenTracking = screentracking;
				return res.redirect( redirectUrl );
			} );
		}
	} )
	.catch( ( err ) => {
		sails.log.error( "ApplicationController#createApplication :: err:", err );
		req.session.applicationerror = "Could not recieve your credit details";
		req.session.deniedstatus = 1;
		req.session.deferUser = user;
		req.session.deferScreenTracking = screentracking;
		return res.redirect( redirectUrl );
	} );
}


function uploaddocumentsAction( req, res ) {
	const payId = req.param( "id" );
	let successval = "";
	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}
	res.view( "frontend/banktransaction/uploaddocuments", { payId: payId, success: successval } );
}

function testapplicationAction( req, res ) {
	const userID = "59f99af6739601a616b89da2";
	const usercriteria = { id: userID };
	User.findOne( usercriteria )
	.then( function( userDetail ) {
		sails.log.info( "userDetail:", userDetail );

		ApplicationService.testcurl( userDetail )
		.then( function( certificateDetails ) {
			// return res.redirect("/banktransaction");
		} )
		.catch( function( err ) {
			sails.log.error( "ApplicationController#transunionAddFormAction :: err :", err );
			const json = {
				status: 400,
				message: err.message
			};
			res.contentType( "application/json" );
			res.json( json );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "ApplicationController#testapplicationAction :: err :", err );
		const errors = {
			code: 404,
			message: "Invalid user data!"
		};
		res.view( "admin/error/404", {
			data: errors.message,
			layout: "layout"
		} );
	} );
}

function addApplicationAction( req, res ) {
	const userID = req.session.userId;

	if( userID ) {
		const usercriteria = { id: userID };
		sails.log.info( "userID:", userID );
		// sails.log.info("usercriteria:", usercriteria);

		User.findOne( usercriteria )
		.then( function( userDetail ) {
			if( userDetail.isExistingLoan == true ) {
				req.session.applicationerror = "";
				req.session.applicationerror = "Already you have loan in your account";
				return res.redirect( "/createapplication" );
			} else {
				if( !userDetail.middlename ) {
					var middlename = "";
				} else {
					var middlename = userDetail.middlename;
				}

				const first_name = userDetail.firstname;
				const middle_name = middlename;
				const last_name = userDetail.lastname;
				const email = userDetail.email;
				const dob = req.param( "dob" );
				const dateofBirth = moment( dob ).format( "YYYY-MM-DD" );
				const street_name = req.param( "street_name" );
				const city = req.param( "city" );
				const state = req.param( "state" );
				var zip_code = req.param( "zip_code" );
				// var phone = userDetail.phoneNumber;
				var zip_code = zip_code.slice( 0, 5 );
				const ssn_number = req.param( "ssn_number" );
				const untiapt = req.param( "untiapt" );

				sails.log.info( "untiapt", untiapt );

				const apiindustryCode = sails.config.transunion.industryCode;
				const apimemberCode = sails.config.transunion.memberCode;
				const apiprefixCode = sails.config.transunion.prefixCode;
				const apiKeyPassword = sails.config.transunion.certificate.password;
				const apiEnv = sails.config.transunion.env;
				const apiPassword = sails.config.transunion.password;

				User.update( usercriteria, { dateofBirth: dateofBirth, ssn_number: ssn_number, state: state, street: street_name, city: city, zipCode: zip_code, unitapp: untiapt } ).exec( function afterwards( err, updated ) {} );

				userDetail.street = street_name;
				// userDetail.ssn_number = ssn_number;
				userDetail.city = city;
				userDetail.state = state;
				userDetail.zipCode = zip_code;

				const addressarray = {
					untiapt: untiapt,
					street_name: street_name,
					city: city,
					state: state,
					zip_code: zip_code
				};

				const userArray = {
					first: first_name,
					middle: middle_name,
					last: last_name
				};

				const transactionControl = {
					userRefNumber: userID,
					subscriber: {
						industryCode: apiindustryCode,
						memberCode: apimemberCode,
						inquirySubscriberPrefixCode: apiprefixCode,
						password: apiPassword
					},
					options: {
						processingEnvironment: apiEnv,
						country: "us",
						language: "en",
						contractualRelationship: "individual",
						pointOfSaleIndicator: "none"
					}
				};

				const certificate = {
					key: "WAKPAMNIKEY.pem",
					crt: "WAKPAMNI.pem",
					password: apiKeyPassword
				};
				userDetail.dateofBirth = dateofBirth;

				ApplicationService.createcertificate( addressarray, transactionControl, certificate, userArray, ssn_number, userDetail, req.param )
				.then( function( responseDetails ) {
					// sails.log.info("responseDetails code:",responseDetails.code);
					// sails.log.info("===================================================");

					if( responseDetails.code == 200 ) {
						const resultdataInput = responseDetails.resultdata;

						// sails.log.info("resultdataInput:",resultdataInput);

						ApplicationService.updateApplicationDetails( addressarray, transactionControl, certificate, userArray, ssn_number, userDetail, req.param, resultdataInput )
						.then( function( certificateDetails ) {
							sails.log.info( "certificateDetails", certificateDetails );

							/* sails.log.info("after service function:");
								sails.log.info("certificateDetails.code:", certificateDetails.code);*/
							if( certificateDetails.code == 202 ) {
								return Screentracking.update(
									{
										id: certificateDetails.screenTracking.id
									},
									{
										lockCreditTier: "G",
										lastlevel: 2,
										deniedmessage: certificateDetails.deniedmessage
									}
								).then( ( screenTrackingUpdate ) => {
									certificateDetails.code = 200;
									return certificateDetails;
								} );
							} else {
								return certificateDetails;
							}
						} )
						.then( ( certificateDetails ) => {
							if( certificateDetails.code == 200 ) {
								req.session.applicationReferenceValue = certificateDetails.screenTracking.applicationReference;
								var applicationReference = certificateDetails.screenTracking.applicationReference;
								var IPFromRequest = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;
								var indexOfColon = IPFromRequest.lastIndexOf( ":" );
								var ip = IPFromRequest.substring( indexOfColon + 1, IPFromRequest.length );
								var screenid = certificateDetails.screenTracking.id;

								Agreement.findOne( { documentKey: "126" } )
								.then( function( agreement ) {
									UserConsent.createConsentfordocuments( agreement, userDetail, ip, screenid )
									.then( function( userconsentdetails ) {
										const consentID = userconsentdetails.id;
										const userID = userDetail.id;

										UserConsent.createStaticAgreementPdf( consentID, userconsentdetails, applicationReference, ip, null, null, res, req )
										.then( function( agreementpdf ) {
											Agreement.findOne( { documentKey: "125" } )
											.then( function( agreementdetails ) {
												UserConsent.createConsentfordocuments( agreementdetails, userDetail, ip, screenid )
												.then( function( userconsentdetail ) {
													const consentID = userconsentdetail.id;
													const userID = userDetail.id;

													UserConsent.createStaticAgreementPdf( consentID, userconsentdetail, applicationReference, ip, null, null, res, req )
													.then( function( agreementpdf ) {
														req.session.levels = "2";
														return res.redirect( "/banktransaction" );
													} )
													.catch( function( err ) {
														sails.log.error( "ApplicationController#addApplicationAction :: err :", err );
														return res.handleError( err );
													} );
												} )
												.catch( function( err ) {
													sails.log.error( "ApplicationController#addApplicationAction :: err :", err );
													return res.handleError( err );
												} );
											} )
											.catch( function( err ) {
												// sails.log.info("33333333333:", "33333333333333");
												sails.log.error( "ApplicationController#addApplicationAction :: err :", err );
												return res.handleError( err );
											} );
										} )
										.catch( function( err ) {
											// sails.log.info("4444444444:", "44444444444444");
											sails.log.error( "ApplicationController#addApplicationAction :: err :", err );
											return res.handleError( err );
										} );
									} )
									.catch( function( err ) {
										// sails.log.info("5555555555:", "555555555555");
										sails.log.error( "ApplicationController#addApplicationAction :: err :", err );
										return res.handleError( err );
									} );
								} )
								.catch( function( err ) {
									// sails.log.info("66666666666:", "66666666666666");
									sails.log.error( "ApplicationController#addApplicationAction :: err :", err );
									return res.handleError( err );
								} );

								/* }else if(certificateDetails.code==402 || certificateDetails.code==403){
											req.session.applicationerror='';
											req.session.applicationerror = certificateDetails.message;
											req.session.deniedstatus = 1;
											return res.redirect("/createapplication");
										}else if(certificateDetails.code==400){
											req.session.applicationerror='';
											req.session.applicationerror = certificateDetails.message;
											req.session.deniedstatus = 1;
											return res.redirect("/createapplication");
										}else if(certificateDetails.code==500){
											req.session.applicationerror='';
											req.session.applicationerror = certificateDetails.message;
											req.session.deniedstatus = 1;
											return res.redirect("/createapplication");
										}else if(certificateDetails.code==200 && rulestatus=='Denied'){
											req.session.applicationerror='';
											req.session.applicationerror = 'Your application has been denied ';
											req.session.deniedstatus = 1;
											return res.redirect("/createapplication");*/
							} else {
								req.session.applicationReferenceValue = certificateDetails.screenTracking.applicationReference;
								var applicationReference = certificateDetails.screenTracking.applicationReference;
								var IPFromRequest = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;
								var indexOfColon = IPFromRequest.lastIndexOf( ":" );
								var ip = IPFromRequest.substring( indexOfColon + 1, IPFromRequest.length );
								var screenid = certificateDetails.screenTracking.screenId;
								const screenDetails = certificateDetails.screenTracking;
								const createdate = moment().format( "MM/DD/YYYY" );
								const payid = certificateDetails.screenTracking.paymentid;

								Directmail.createDmDocuments( userDetail, screenid, payid, ip, applicationReference, screenDetails, req, res, createdate )
								.then( function( directmailDoc ) {
									const consentCriteria = {
										user: userDetail.id,
										loanupdated: 1,
										paymentManagement: { $exists: false }
									};
									UserConsent.find( consentCriteria ).then( function( userConsentAgreement ) {
										_.forEach( userConsentAgreement, function( consentagreement ) {
											UserConsent.updateUserConsentAgreement( consentagreement.id, userDetail.id, payid );
										} );
									} );

									if( certificateDetails.code == 402 || certificateDetails.code == 403 || certificateDetails.code == 400 || certificateDetails.code == 500 ) {
										req.session.applicationerror = "";
										req.session.applicationerror = certificateDetails.message;
										req.session.deniedstatus = 1;
										return res.redirect( "/createapplication" );
									} else if( certificateDetails.code == 200 && rulestatus == "Denied" ) {
										req.session.applicationerror = "";
										req.session.applicationerror = "Your application has been denied ";
										req.session.deniedstatus = 1;
										return res.redirect( "/createapplication" );
									}
								} )
								.catch( function( err ) {
									sails.log.error( "ApplicationController#addApplicationAction :: err :", err );
									return res.handleError( err );
								} );
							}
						} )
						.catch( function( err ) {
							if( err.code == 400 ) {
								req.session.applicationerror = "";
								req.session.applicationerror = "Your application has been declined, due to low credit score!";
								req.session.deniedstatus = 1;
								return res.redirect( "/createapplication" );
							} else {
								sails.log.error( "ApplicationController#transunionAddFormAction!400 :: err :", err );
								req.session.applicationerror = "";
								req.session.applicationerror = "Could not recieve your credit details";
								req.session.deniedstatus = 1;
								return res.redirect( "/createapplication" );
							}
						} );
					} else {
						req.session.applicationerror = "";
						req.session.applicationerror = "Could not recieve your credit details";
						req.session.deniedstatus = 1;
						return res.redirect( "/createapplication" );
					}
				} )
				.catch( function( err ) {
					sails.log.error( "ApplicationController#transunionAddFormAction :: err :", err );
					req.session.applicationerror = "";
					req.session.applicationerror = "Could not recieve your credit details";
					req.session.deniedstatus = 1;
					return res.redirect( "/createapplication" );
				} );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "ApplicationController#addApplicationAction :: err :", err );
			req.session.applicationerror = "";
			req.session.applicationerror = "Invalid user data!";
			req.session.deniedstatus = 1;
			return res.redirect( "/createapplication" );
		} );
	} else {
		req.session.applicationerror = "";
		req.session.applicationerror = "Invalid user data!";
		req.session.deniedstatus = 1;
		return res.redirect( "/createapplication" );
	}
}

function adddocumentAction( req, res ) {
	const localPath = req.localPath;
	sails.log.info( "localPath:::", localPath );
	const paymentID = req.param( "payId" );
	const screenid = req.param( "screenId" );
	const path = require( "path" );
	const user_id = req.session.userId;
	const doctype = req.param( "doctype" );
	const otherdoctype = req.param( "other_doctype" );

	if( doctype == "Others" ) {
		var whole_doctype = otherdoctype;
	} else {
		var whole_doctype = doctype;
	}

	sails.log.info( "screenid", screenid );

	/* if (!req.form.isValid) {
       var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
       return res.failed(validationErrors);
     }*/

	const filename = path.basename( localPath );

	if( paymentID ) {
		const formdatas = {
			user: req.session.userId,
			docname: whole_doctype,
			paymentManagement: paymentID,
			filename: filename
		};

		/** ****************for-s3 userdoucments > Userreference > Application reference************************/
		const criteria = { id: user_id };
		sails.log.info( "criteria", criteria );
		User.findOne( criteria )
		.then( function( userDetails ) {
			const userReference = userDetails.userReference;

			const screentrackingcriteria = { user: user_id };
			sails.log.info( "screentrackingcriteria", screentrackingcriteria );
			Screentracking.findOne( screentrackingcriteria )
			.then( function( screentrackingcriteriaDetails ) {
				const applicationReference = screentrackingcriteriaDetails.applicationReference;

				/*  *****************************************/

				Achdocuments.createAchDocuments( formdatas, paymentID )
				.then( function( achdocuments ) {
					sails.log.info( "Achdocuments", achdocuments );

					Asset.createAssetForAchDocuments( achdocuments, localPath, userReference, applicationReference, Asset.ASSET_TYPE_USER_DOCUMENT )
					.then( function( asset ) {
						console.log( "asset data", asset );

						if( achdocuments.docname == sails.config.loanDetails.doctype1 ) {
							User.update( { id: user_id }, { isGovernmentIssued: true } ).exec( function afterwards( err, updated ) {
								// sails.log.info("updated if",updated);
							} );
						} else if( achdocuments.docname == sails.config.loanDetails.doctype2 ) {
							User.update( { id: user_id }, { isPayroll: true } ).exec( function afterwards( err, updated ) {
								// sails.log.info("updated else",updated);
							} );
						} else {
							sails.log.info( "else" );
						}

						return Achdocuments.updateDocumentProof( achdocuments, asset );
					} )
					.then( function() {
						const json = {
							status: 200,
							message: "Documents updated successfully"
						};
						sails.log.info( "json data", json );

						// var redirectpath ="/finalize";
						// return res.redirect(redirectpath);

						req.session.successval = "";
						req.session.uploaddocument = "";
						req.session.successval = "Your Documents Uploaded Successfully.";
						req.session.uploaddocument = "yes";

						sails.log.info( "req.session.uploaddocument", req.session.uploaddocument );

						// var redirectpath ="/uploaddocuments/"+paymentID;
						// var redirectpath ="/viewloandetails/"+paymentID;
						const redirectpath = "/dashboard";
						// req.session.levels = '5';

						/* if(paymentID) {
										 var redirectpath ="/viewloandetails/"+paymentID;
									}
									else {
										var redirectpath ="/viewloandetails/"+screenid;
									}*/
						return res.redirect( redirectpath );
					} )
					.catch( function( err ) {
						sails.log.error( "ApplicationController#adddocumentAction  :: Error :: ", err );
						return reject( {
							code: 500,
							message: "INTERNAL_SERVER_ERROR"
						} );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "ApplicationController#adddocumentAction :: err :", err );
					return res.handleError( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "ApplicationController#adddocumentAction :: err :", err );
				return res.handleError( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "ApplicationController#adddocumentAction :: err :", err );
			return res.handleError( err );
		} );
	}

	/* var path = require('path');
	 var localPath = sails.config.appPath+'/assets/uploads/';
	 var paymentID = req.param('payId');
	 var userid = req.session.userId;
	 var uploadFile = req.file('documents');
	 var uploadFiledrop = req.file('file');
	 sails.log.info("Uploaded Document dropzone", uploadFiledrop);

	 if(paymentID)
	  {
			uploadFile.upload({
			dirname:localPath },function onUploadComplete(err, files) {

			var filedata={};
			   filedata.userid = req.session.userId;
			   filedata.filename = files[0].filename;
			   filedata.filepath = files[0].fd;
			   filedata.type = files[0].type;

			   var docname = path.basename(filedata.filepath);

			 var formdatas = {
				userid: req.session.userId,
				filename: filedata.filename,
				path: localPath,
				fullpath: filedata.filepath,
				type: filedata.type,
				docname:docname,
				paymentManagement:paymentID,
		  };

		  Achdocuments
			.createAchDocuments(formdatas,userid)
			.then(function (achdocuments) {
			  sails.log.info("Achdocuments", achdocuments);

			   Asset
				  .createAssetForAchDocuments(achdocuments, localPath, Asset.ASSET_MEDIA_TYPE_DOC)
				  .then(function(asset) {
					console.log("asset ", asset);

					return Achdocuments.updateDocumentProof(achdocuments, asset);
				  })
				  .then(function() {

					 var json = {
						status: 200,
						message:"Documents Uploaded successfully"
					 };
					// sails.log.info("json data", json);
					 var redirectpath ="/finalize";
					 return res.redirect(redirectpath);

				  })
				  .catch(function(err) {
					sails.log.error("Ach#uploadAchDocuments  :: Error :: ", err);
					return reject({
					  code: 500,
					  message: 'INTERNAL_SERVER_ERROR'
					});
				  });

			})
			.catch(function (err) {
			 sails.log.error('ApplicationController#createAchDocuments :: err :', err);
			  return res.handleError(err);
			});
	});
  }*/
}

function uploaddropfilesAction( req, res ) {
	const localPath = sails.config.appPath + "/assets/uploads/";
	sails.log.info( "localPath:::", localPath );
	const path = require( "path" );
	const paymentID = req.param( "payId" );
	const userid = req.session.userId;
	const doctype = req.param( "doctype" );
	const otherdoctype = req.param( "other_doctype" );

	if( doctype == "Others" ) {
		var whole_doctype = otherdoctype;
	} else {
		var whole_doctype = doctype;
	}

	req.session.uploaddocument = "";
	req.session.uploaddocument = "yes";

	sails.log.info( "doctype", doctype );
	sails.log.info( "otherdoctype", otherdoctype );

	req.file( "file" ).upload( { dirname: localPath }, function( err, files ) {
		//	sails.log.debug('file is :: ', +files);

		if( err ) { return res.serverError( err ); }

		const filedata = {};
		filedata.userid = req.session.userId;
		filedata.filepath = files[ 0 ].fd;
		const filename = path.basename( filedata.filepath );

		const localPath = filedata.filepath;
		sails.log.info( "filedata.filepath", localPath );

		const formdatas = {
			user: req.session.userId,
			docname: whole_doctype,
			paymentManagement: paymentID,
			filename: filename
		};
		/** ****************fors3************************/
		const criteria = { id: userid };
		sails.log.info( "criteria", criteria );
		User.findOne( criteria )
		.then( function( userDetails ) {
			const userReference = userDetails.userReference;

			const screentrackingcriteria = { user: userid };
			sails.log.info( "screentrackingcriteria", screentrackingcriteria );
			Screentracking.findOne( screentrackingcriteria )
			.then( function( screentrackingcriteriaDetails ) {
				const applicationReference = screentrackingcriteriaDetails.applicationReference;

				/*  *****************************************/

				Achdocuments.createAchDocuments( formdatas, paymentID )
				.then( function( achdocuments ) {
					sails.log.info( "Achdocuments", achdocuments );

					Asset.createAssetForAchDocuments( achdocuments, localPath, userReference, applicationReference, Asset.ASSET_TYPE_USER_DOCUMENT )
					.then( function( asset ) {
						console.log( "asset ", asset );

						Achdocuments.updateDocumentProof( achdocuments, asset ).then( function( asset ) {
							if( achdocuments.docname == sails.config.loanDetails.doctype1 ) {
								User.update( { id: userid }, { isGovernmentIssued: true } ).exec( function afterwards( err, updated ) {
									// sails.log.info("updated if",updated);
								} );
							} else if( achdocuments.docname == sails.config.loanDetails.doctype2 ) {
								User.update( { id: userid }, { isPayroll: true } ).exec( function afterwards( err, updated ) {
									// sails.log.info("updated else",updated);
								} );
							} else {
								sails.log.info( "else" );
							}

							const json = {
								status: 200,
								message: "Documents Uploaded successfully"
							};
							sails.log.info( "json data", json );
						} );
						/* .catch(function (err) {
										sails.log.error('ApplicationController#createAchDocuments :: err :', err);
										//return res.handleError(err);
										});*/
					} )
					.then( function() {
						const json = {
							status: 200,
							message: "success"
						};
						res.contentType( "application/json" );
						res.json( json );
					} )
					.catch( function( err ) {
						sails.log.error( "Ach#uploadAchDocuments  :: Error :: ", err );
						const json = {
							status: 500,
							message: "INTERNAL_SERVER_ERROR"
						};
						res.contentType( "application/json" );
						res.json( json );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "ApplicationController#adddocumentAction :: err :", err );
					return res.handleError( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "ApplicationController#adddocumentAction :: err :", err );
				return res.handleError( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "ApplicationController#createAchDocuments :: err :", err );
			return res.handleError( err );
		} );
	} );
}

function serviceloandocumentsAction( req, res ) {
	const user_id = req.param( "id" );

	console.log( "user_id:::", user_id );

	const criteria = {
		documentKey: "131"
	};
	Agreement.find( criteria )
	.then( function( agreements ) {
		const criteria = { user: user_id, iscompleted: 0 };

		// var criteria = { user: req.session.userId};
		Screentracking.findOne( criteria )
		.populate( "user" )
		.populate( "accounts" )
		.then( function( userscreenres ) {
			sails.log.info( "userscreenres : ", userscreenres );
			const userid = userscreenres.user.id;
			const palidcriteria = { user: userid };

			PlaidUser.findOne( palidcriteria )
			.then( function( userres ) {
				sails.log.info( "userDetails ranjani : ", userres );

				const names = userres.names;
				const street = userres.addresses[ 0 ].data.street;
				const city = userres.addresses[ 0 ].data.city;
				const state = userres.addresses[ 0 ].data.state;
				const zipCode = userres.addresses[ 0 ].data.zip;
				const financedAmount = parseFloat( userscreenres.offerdata[ 0 ].financedAmount );
				const interestRate = userscreenres.offerdata[ 0 ].interestRate;
				const appfeerate = userscreenres.offerdata[ 0 ].appfeerate;
				const loanTerm = userscreenres.offerdata[ 0 ].month;

				PaymentManagement.getLoanPaymentSchedule( userscreenres )
				.then( function( paymentDetails ) {
					const docversion = agreements[ 0 ].documentVersion;
					const schedulecount = paymentDetails.length;

					sails.log.info( "schedulecount : ", schedulecount );
					sails.log.info( "paymentDetails : ", paymentDetails );

					var annualPercentageRate = interestRate;
					const maturityDate = moment()
					.startOf( "day" )
					.add( loanTerm, "months" );

					if( annualPercentageRate > 0 ) {
						var annualPercentageRate = interestRate;
						const decimalRate = annualPercentageRate / 100 / 12;
						const xpowervalue = decimalRate + 1;
						const ypowervalue = loanTerm;
						const powerrate_value = Math.pow( xpowervalue, ypowervalue ) - 1;
						scheduleLoanAmount = ( decimalRate + decimalRate / powerrate_value ) * financedAmount;
						scheduleLoanAmount = scheduleLoanAmount.toFixed( 2 );
						checktotalLoanAmount = scheduleLoanAmount * loanTerm;
						creditcost = checktotalLoanAmount - financedAmount;
						creditcost = parseFloat( creditcost.toFixed( 2 ) );
					} else {
						var creditcost = 0;
						creditcost = parseFloat( creditcost.toFixed( 2 ) );
					}

					let checktotalLoanAmount = parseFloat( checktotalLoanAmount.toFixed( 2 ) );

					const obj = {
						amount: financedAmount,
						address: street,
						name: names,
						date: moment().format( "MM/DD/YYYY" ),
						interestRate: interestRate,
						month: loanTerm,
						agreement: agreements,
						createdDate: moment().format(),
						endDate: moment().add( loanTerm, "months" ).format(),
						signedDate: new Date(),
						paymentschedule: paymentDetails,
						schedulecount: paymentDetails.length,
						annualPercentageRate: interestRate,
						loannumber: userscreenres.applicationReference,
						checktotalLoanAmount: checktotalLoanAmount,
						creditcost: creditcost,
						street: street,
						stateName: state,
						stateCode: state,
						city: city,
						zipCode: zipCode,
						accountDetail: userscreenres.accounts
					};
					sails.log.info( "objdata :", obj );

					Esignature.findOne( { user_id: userid } ).then( function( esignatureimagedetails ) {
						sails.log.info( "esignatureimagedetails:", esignatureimagedetails );

						const signautepath = Utils.getS3Url( esignatureimagedetails.standardResolution );

						sails.log.info( "esignatureimagedetails signautepath:", signautepath );
						var IPFromRequest = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;
						sails.log.info( "IPFromRequest**********:", IPFromRequest );
						var IPFromRequest = req.connection.remoteAddress;
						const indexOfColon = IPFromRequest.lastIndexOf( ":" );
						const ip = IPFromRequest.substring( indexOfColon + 1, IPFromRequest.length );

						UserConsent.findOne( { user: user_id, documentKey: "131" } ).then( function( userconsentdetails ) {
							sails.log.info( "userconsentdetails:", userconsentdetails );
							// sails.log.info("userconsentdetails documentName:", userconsentdetails[0].documentKey);

							var alreadysigned = 0;

							if( userconsentdetails ) {
								// if(userconsentdetails) {
								sails.log.info( "ifloop:" );
								var alreadysigned = 1;
							} else {
								var alreadysigned = 0;
							}

							sails.log.info( "alreadysigned:", alreadysigned );

							res.view( "customerService/serviceloandocuments", { obj: obj, docversion: docversion, ip: ip, user_id: user_id, signautepath: signautepath, alreadysigned: alreadysigned } );
							// res.view("document/loanAgreementAndPromissoryNote_v2", {obj:obj,docversion:docversion,ip:ip});
						} );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "ApplicationController#loandocumentsAction :: err", err );
					return res.handleError( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "ApplicationController#loandocumentsAction :: err", err );
				return res.handleError( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "ApplicationController#loandocumentsAction :: err", err );
			return res.handleError( err );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "ApplicationController#loandocumentsAction :: err", err );
		return res.handleError( err );
	} );
}

function serviceconfirmsignatureAction( req, res ) {
	const signatureid = req.param( "signatureid" );
	const user_id = req.param( "user_id" );
	const criteria = { user: user_id, iscompleted: 0 };

	sails.log.info( "user_id data:::", user_id );

	Screentracking.findOne( criteria )
	.sort( "createdAt DESC" )
	.then( function( userscreenres ) {
		Screentracking.update( { id: userscreenres.id }, { esignature: signatureid } )
		.exec( function afterwards( err, updated ) {
			const json = {
				updated: updated
			};
			sails.log.info( "json data", json );
			res.contentType( "application/json" );
			res.json( json );
		} )
		.catch( function( err ) {
			const responsedata = {
				status: 400,
				message: "Signature Error"
			};
			const json = {
				responsedata: responsedata
			};
			sails.log.info( "json data", json );
			res.contentType( "application/json" );
			res.json( json );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "ApplicationController#addconsolidateAction :: err", err );
		return res.handleError( err );
	} );
}
function servicecreateloandetailsAction( req, res ) {
	const user_id = req.param( "id" );
	sails.log.info( "user_id : ", user_id );

	const criteria = { user: user_id, iscompleted: 0 };
	// var criteria = { id: '5a9fb9cb7ef82e7641aceae2'};
	// sails.log.info('criteria : ', criteria);

	Screentracking.findOne( criteria )
	.sort( "createdAt DESC" )
	.then( function( userscreenres ) {
		sails.log.info( "userscreenres : ", userscreenres );

		const criteria = { id: user_id };

		User.findOne( criteria )
		.then( function( userDetails ) {
			Story.createUserstory( userDetails, userscreenres )
			.then( function( storyDet ) {
				// sails.log.info('storyDet ',storyDet);

				PaymentManagement.createLoanPaymentSchedule( userscreenres, storyDet )
				.then( function( paymentDetails ) {
					// sails.log.info('paymentDetails ',paymentDetails);

					if( paymentDetails != "" && paymentDetails != null && "undefined" !== typeof paymentDetails ) {
						Screentracking.update( { id: userscreenres.id }, { lastlevel: 5 } ).exec( function afterwards( err, updated ) {
							User.update( { id: userscreenres.user }, { isExistingLoan: true } ).exec( function afterwards( err, userupdated ) {
								const tranunionid = userscreenres.transunion;
								const transcriteria = { id: tranunionid };

								Transunions.findOne( transcriteria )
								.then( function( userres ) {
									const creditscore = userres.score;

									// var creditscore = 637;

									PaymentManagement.update( { id: paymentDetails.id }, { creditScore: creditscore } ).exec( function afterwards( err, userupdated ) {} );
								} )
								.catch( function( err ) {
									sails.log.error( "ApplicationController#servicecreateloandetailsAction :: err", err );
									return res.handleError( err );
								} );
							} );
						} );

						const redirectpath = "/servicesuccessmessage";
						return res.redirect( redirectpath );
					}
				} )
				.catch( function( err ) {
					sails.log.error( "ApplicationController#servicecreateloandetailsAction :: err", err );
					return res.handleError( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "ApplicationController#servicecreateloandetailsAction :: err", err );
				return res.handleError( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "ApplicationController#servicecreateloandetailsAction :: err", err );
			return res.handleError( err );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "ApplicationController#servicecreateloandetailsAction :: err", err );
		return res.handleError( err );
	} );
}

function servicesuccessmessageAction( req, res ) {
	res.view( "customerService/servicesuccessmessage" );
}

function promissorynoteAction( req, res ) {
	const userid = req.session.userId;

	UserConsent.objectdataforpdf( userid, req, res )
	.then( function( objectdatas ) {
		// sails.log.info("objectdataspdf:", objectdatas);
		const amount = parseFloat( objectdatas.amount );
		objectdatas.amount = amount.toLocaleString();

		const fname = objectdatas.fname;
		const lname = objectdatas.lname;

		Transunions.findOne( { user: userid } )
		.then( function( transunionsdetails ) {
			var socialnumber = transunionsdetails.response.product.subject.subjectRecord.indicative.socialSecurity.number;
			var socialnumber = socialnumber.replace( /.(?=.{4})/g, "X" );

			const scriteria = { user: userid, iscompleted: 0 };

			Screentracking.findOne( scriteria )
			.populate( "accounts" )
			.populate( "plaiduser" )
			.populate( "transunion" )
			.populate( "user" )
			.then( function( screentrackingdetails ) {
				sails.log.info( "screentrack", screentrackingdetails );

				// var accountName = screentrackingdetails.accounts.accountName;
				const accountName = "Installment Loan";
				const accountNumberLastFour = screentrackingdetails.accounts.accountNumberLastFour;
				/* var loanholderstreetname = screentrackingdetails.plaiduser.addresses[0].data.street;
				var loanholderstreetnumber = screentrackingdetails.plaiduser.addresses[0].data.street;
				var loanholdercity = screentrackingdetails.plaiduser.addresses[0].data.city;
				var loanholderzipcode = screentrackingdetails.plaiduser.addresses[0].data.state;*/
				// var loanholderzipcode = screentrackingdetails.offerdata[0].financedAmount;
				const loanholderstreetname = screentrackingdetails.user.street;
				const loanholderstreetnumber = screentrackingdetails.user.street;
				const loanholdercity = screentrackingdetails.user.city;
				const loanholderzipcode = screentrackingdetails.user.zipCode;
				const loanstate = screentrackingdetails.user.state;
				if( screentrackingdetails.user.unitapp ) {
					var unitapp = screentrackingdetails.user.unitapp;
				} else {
					var unitapp = "";
				}

				User.findOne( { id: userid } )
				.then( function( userdetails ) {
					const addressobj = {
						accountName: accountName,
						accountNumberLastFour: accountNumberLastFour,
						loanholderstreetname: loanholderstreetname,
						loanholderstreetnumber: loanholderstreetnumber,
						loanholdercity: loanholdercity,
						loanholderzipcode: loanholderzipcode,
						phonenumber: userdetails.phoneNumber,
						loanstate: loanstate,
						unitapp: unitapp
					};
					// sails.log.info("lname:", addressobj.street);
					const criteria = {
						documentKey: "130"
					};

					Agreement.find( criteria )
					.then( function( agreements ) {
						const docversion = agreements[ 0 ].documentVersion;
						const IPFromRequest = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;

						const indexOfColon = IPFromRequest.lastIndexOf( ":" );
						const ip = IPFromRequest.substring( indexOfColon + 1, IPFromRequest.length );

						res.view( "frontend/banktransaction/promissorynote", { obj: objectdatas, fname: fname, lname: lname, socialnumber: socialnumber, addressobj: addressobj, docversion: docversion, type: "view", ip: ip } );
					} )
					.catch( function( err ) {
						sails.log.error( "ApplicationController#promissorynoteAction :: err", err );
						return res.handleError( err );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "ApplicationController#promissorynoteAction :: err", err );
					return res.handleError( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "ApplicationController#promissorynoteAction :: err", err );
				return res.handleError( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "ApplicationController#promissorynoteAction :: err", err );
			return res.handleError( err );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "ApplicationController#promissorynoteAction :: err", err );
		return res.handleError( err );
	} );
}

// function createpromissorypdfAction( req, res ) {
// 	const ip = ( req.headers[ "x-forwarded-for" ] || req.headers[ "x-real-ip" ] || req.connection.remoteAddress ).replace( "::ffff:", "" ).replace( /^::1$/, "127.0.0.1" );
// 	const userId = req.session.userId;
// 	// const anotherUserEnteredName = req.param( "anotherUserEnteredName" );
// 	// const userEnteredName = req.param( "UserEnteredName1" );
// 	const firstUserName = req.param( "anotherUserEnteredName" );
// 	const secondUserName = req.param( "userEnteredName" );
// 	const phoneNumber = req.param( "mobileno" );
// 	let businessPurposesCheckbox = "";
// 	let brokerParticipatedCheckbox = "";
// 	let eftaCheckbox = "";
// 	if( req.param( "businessPurposesCheckbox" ) == "checked" || req.param( "businessCheckboxServer" ) == "checked" ) {
// 		businessPurposesCheckbox = "checked";
// 	}
// 	if( req.param( "brokerParticipatedCheckbox" ) == "checked" || req.param( "brokerCheckboxServer" ) == "checked" ) {
// 		brokerParticipatedCheckbox = "checked";
// 	}
// 	if( req.param( "eftaCheckbox" ) == "checked" || req.param( "eftaCheckboxServer" ) == "checked" ) {
// 		eftaCheckbox = "checked";
// 	}
// 	let promCheckboxes = {
// 		businessPurposesCheckbox: businessPurposesCheckbox,
// 		brokerParticipatedCheckbox: brokerParticipatedCheckbox,
// 		eftaCheckbox: eftaCheckbox
// 	};

// 	sails.log.info( "JH ApplicationController.js createpromissorypdfAction userId", userId );

// 	return Screentracking.findOne( { user: userId } )
// 	.populate( "user" )
// 	.then( ( screentrackingdetails ) => {
// 		const applicationReference = screentrackingdetails.applicationReference;
// 		const userReference = screentrackingdetails.user.userReference;
// 		req.session.applicationReference = applicationReference;
// 		req.session.userReference = userReference;

// 		return PaymentManagement.createLoanPaymentSchedule( screentrackingdetails )
// 		.then( function( paymentDetails ) {
// 			// sails.log.info('paymentDetails ',paymentDetails);

// 			if( paymentDetails == "" || paymentDetails == null || "undefined" == typeof paymentDetails ) {
// 				throw new Error( "Failed to create loan payment schedule." );
// 			}
// 			return Screentracking.update( { id: screentrackingdetails.id }, { lastlevel: 5 } ).toPromise()
// 			.then( ( updated ) => {
// 				return User.update( { id: screentrackingdetails.user.id }, { isExistingLoan: true } ).toPromise()
// 				.then( ( userupdated ) => {
// 					const tranunionid = screentrackingdetails.transunion;
// 					const transcriteria = { id: tranunionid };

// 					return Transunions.findOne( transcriteria )
// 					.then( function( userres ) {
// 						const creditscore = userres.score;

// 						// var creditscore = 637;

// 						return PaymentManagement.update( { id: paymentDetails.id }, { creditScore: creditscore } ).exec( function afterwards( err, userupdated ) {} );
// 					} );
// 				} );
// 			} );
// 		} )
// 		.then( () => {
// 			/*============== Promissory Note save ==========================*/
// 			return Agreement.findOne( { documentKey: "131" } )
// 		} )
// 		.then( ( agreement ) => {
// 			const screenId = screentrackingdetails.id;
// 			sails.log.info("agreement:", agreement);

// 			return UserConsent.createConsent( agreement, screentrackingdetails.user.id, ip, screenId )
// 			.then( ( userconsentdetails ) => {
// 				const consentId = userconsentdetails.id;
// 				sails.log.info("userconsentdetails----------:", userconsentdetails);

// 				return UserConsent.objectdataforpromissory( userId, req, res )
// 				.then( ( objectdatas ) => {
// 					sails.log.info("objectdataspdf----------:", objectdatas);
// 					userconsentdetails.applicationReference = applicationReference;
// 					userconsentdetails.userReference = userReference;

// 					return User.update( { id: userId }, { promName1: firstUserName, promName2: secondUserName, promNumber: phoneNumber } )
// 					.then( ( updateduser ) => {
// 						if( Array.isArray( updateduser ) ) {
// 							updateduser = updateduser.shift();
// 						}
// 						return UserConsent.createPromissoryAgreementPdf( consentId, userId, userconsentdetails, objectdatas, promCheckboxes, res, req )
// 						.then( ( agreementpdf ) => {

// 							/*============== EFT save ==========================*/
// 							return Agreement.findOne( { documentKey: '126' } )
// 							.then( function ( eftAgreement ) {
// 								return UserConsent.createConsentfordocuments( eftAgreement, updateduser, ip, screenId )
// 								.then(function ( userconsentdetails ) {
// 									var consentID = userconsentdetails.id;
// 									var applicationReference = screentrackingdetails.applicationReference;
// 									return UserConsent.createStaticEftPdf( consentID, userconsentdetails, applicationReference, ip, res, req)
// 									.then( () => {
// 										return res.redirect( "/createloandetails" );
// 									} );
// 								} );
// 							} );
// 						} );
// 					} );
// 				} );
// 			} );
// 		} );
// 	} )
// 	.catch( ( err ) => {
// 		sails.log.error( "ApplicationController#createpromissorypdfAction :: err:", err );
// 		return res.handleError( err );
// 	} );
// }

function createpromissorypdfAction( req, res ) {
	const ip = ( req.headers[ "x-forwarded-for" ] || req.headers[ "x-real-ip" ] || req.connection.remoteAddress ).replace( "::ffff:", "" ).replace( /^::1$/, "127.0.0.1" );
	const userId = req.session.userId;
	// if( !req.session.practiceId && req.session.appPracticeId ) {
	// 	req.session.practiceId = req.session.appPracticeId;
	// }
	// const practiceId = req.session.practiceId;
	const firstUserName = req.param( "anotherUserEnteredName" );
	const secondUserName = req.param( "userEnteredName" );
	const phoneNumber = req.param( "mobileno" );
	let businessPurposesCheckbox = "";
	let brokerParticipatedCheckbox = "";
	let eftaCheckbox = "";
	if( req.param( "businessPurposesCheckbox" ) == "checked" || req.param( "businessCheckboxServer" ) == "checked" ) {
		businessPurposesCheckbox = "checked";
	}
	if( req.param( "brokerParticipatedCheckbox" ) == "checked" || req.param( "brokerCheckboxServer" ) == "checked" ) {
		brokerParticipatedCheckbox = "checked";
	}
	if( req.param( "eftaCheckbox" ) == "checked" || req.param( "eftaCheckboxServer" ) == "checked" ) {
		eftaCheckbox = "checked";
	}
	const promCheckboxes = {
		businessPurposesCheckbox: businessPurposesCheckbox,
		brokerParticipatedCheckbox: brokerParticipatedCheckbox,
		eftaCheckbox: eftaCheckbox
	};

	sails.log.info( "JH ApplicationController.js createpromissorypdfAction userId", userId );

	Screentracking.findOne( { user: userId, iscompleted: 0 } )
	.populate( "user" )
	.then( ( screentrackingdetails ) => {
		const applicationReference = screentrackingdetails.applicationReference;
		const userReference = screentrackingdetails.user.userReference;
		const practiceId = screentrackingdetails.practicemanagement;
		req.session.applicationReference = applicationReference;
		req.session.userReference = userReference;


		const screenId = screentrackingdetails.id;
		/* ============== Promissory Note save ========================== */
		return Agreement.findOne( { documentKey: "131", practicemanagement: practiceId } )
		.then( ( agreement ) => {
			sails.log.info( "agreement:", agreement );

			return UserConsent.createConsent( agreement, screentrackingdetails.user, ip, screenId )
			.then( ( userconsentdetails ) => {
				const consentId = userconsentdetails.id;
				sails.log.info( "userconsentdetails----------:", userconsentdetails );

				return UserConsent.objectdataforpromissory( userId, req, res )
				.then( ( objectdatas ) => {
					sails.log.info( "objectdataspdf----------:", objectdatas );
					userconsentdetails.applicationReference = applicationReference;
					req.session.applicationReference = applicationReference;
					userconsentdetails.userReference = userReference;

					return User.update( { id: userId }, { promName1: firstUserName, promName2: secondUserName, promNumber: phoneNumber } )
					.then( ( updateduser ) => {
						if( Array.isArray( updateduser ) ) {
							updateduser = updateduser.shift();
						}
						return UserConsent.createPromissoryAgreementPdf( consentId, userId, userconsentdetails, objectdatas, promCheckboxes, res, req )
						.then( ( agreementpdf ) => {
							sails.log.info( "ApplicationContreller.createpromissoryPdfAction agreementpdf", agreementpdf );
							/* ============== EFTA save ========================== */
							return Agreement.findOne( { documentKey: "132", practicemanagement: practiceId } )
							.then( ( eftAgreement ) => {
								return UserConsent.createConsentfordocuments( eftAgreement, updateduser, ip, screenId )
								.then( ( userconsentdetails ) => {
									const consentID = userconsentdetails.id;
									const applicationReference = screentrackingdetails.applicationReference;
									return UserConsent.createStaticEftPdf( consentID, userconsentdetails, applicationReference, ip, res, req )
									.then( () => {
										// return res.redirect( "/contract" );
										return res.redirect( "/createloandetails" );
									} );
								} );
							} );
						} );
					} );
				} );
			} );
		} );
	} )
	.catch( ( err ) => {
		sails.log.error( "ApplicationController#createpromissorypdfAction :: err:", err );
		return res.handleError( err );
	} );
}


function servicecreatepromissorypdfAction( req, res ) {
	const userid = req.param( "id" );
	sails.log.info( "userid:", userid );

	Screentracking.findOne( { user: userid } )
	.populate( "user" )
	.then( function( screentrackingdetails ) {
		// sails.log.info("screentrackingdetails:", screentrackingdetails);
		const applicationReference = screentrackingdetails.applicationReference;
		const userReference = screentrackingdetails.user.userReference;

		req.session.applicationReference = applicationReference;
		req.session.userReference = userReference;

		// var IPFromRequest = req.ip;
		const IPFromRequest = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;
		const indexOfColon = IPFromRequest.lastIndexOf( ":" );
		const ip = IPFromRequest.substring( indexOfColon + 1, IPFromRequest.length );
		const screenid = screentrackingdetails.id;

		const criteria = {
			documentKey: "131"
		};

		Agreement.findOne( { documentKey: "131" } )
		.then( function( agreement ) {
			//	sails.log.info("agreement:", agreement);

			UserConsent.createConsent( agreement, screentrackingdetails.user, ip, screenid )
			.then( function( userconsentdetails ) {
				const consentID = userconsentdetails.id;
				const userID = screentrackingdetails.user.id;
				sails.log.info( "userIDuserID:", userID );

				UserConsent.objectdataforpromissory( userID, req, res )
				.then( function( objectdatas ) {
					sails.log.info( "objectdataspdf:", objectdatas );

					UserConsent.createServicePromissoryAgreementPdf( consentID, userID, userconsentdetails, objectdatas, res, req )
					.then( function( agreementpdf ) {
						sails.log.info( "agreementpdf:", agreementpdf );

						// var redirectpath ="/serviceloandocuments/"+userID;
						const redirectpath = "/servicecreateloandetails/" + userID;
						return res.redirect( redirectpath );
					} )
					.catch( function( err ) {
						sails.log.error( "ApplicationController#createpromissorypdfAction :: err", err );
						return res.handleError( err );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "ApplicationController#createpromissorypdfAction :: err", err );
					return res.handleError( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "ApplicationController#createpromissorypdfAction :: err", err );
				return res.handleError( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "ApplicationController#createpromissorypdfAction :: err", err );
			return res.handleError( err );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "ApplicationController#createpromissorypdfAction :: err", err );
		return res.handleError( err );
	} );
}

function createstateregulationAction( req, res ) {
	const product_id = req.param( "product_id" );
	const newstate = req.param( "state" );
	const newstateCode = req.param( "stateCode" );
	const newminloanamount = req.param( "ratepercycle" );
	const action = req.param( "action" );

	if( action == "update" ) {
		const loanstateregualtion_id = req.param( "loanstateregualtion_id" );
		const updatecriteria = { product: product_id, state: newstate, id: { "!": loanstateregualtion_id } };

		Loanstateregulation.find( updatecriteria )
		.then( function( stateregulationupdatedetails ) {
			let minimumcriteriaExistrange = 0;
			let maximumcriteriaExistrange = 0;

			_.forEach( stateregulationupdatedetails, function( stateregulationupdatedetails ) {
				const minloanamount_range = parseFloat( stateregulationupdatedetails.minloanamount );
				const maxloanamount_range = parseFloat( stateregulationupdatedetails.maxloanamount );

				if( parseFloat( newminloanamount ) >= minloanamount_range && parseFloat( newminloanamount ) <= maxloanamount_range ) {
					minimumcriteriaExistrange = 1;
				}

				if( parseFloat( newmaxloanamount ) >= minloanamount_range && parseFloat( newmaxloanamount ) <= maxloanamount_range ) {
					maximumcriteriaExistrange = 1;
				}
			} );
			/* To check ranges end*/
			if( maximumcriteriaExistrange == 1 && minimumcriteriaExistrange == 1 ) {
				var responsedata = {
					status: "fail",
					message: "Your Minimum And Maximum Loanamount Already In Existing Range. Tryout With Another Range."
				};

				var json = {
					responsedata: responsedata
				};

				sails.log.info( "json data", json );
				res.contentType( "application/json" );
				res.json( json );
			}
			if( minimumcriteriaExistrange == 1 ) {
				var responsedata = {
					status: "fail",
					message: "Your Minimum Loanamount Already In Existing Range. Tryout With Another Range."
				};

				var json = {
					responsedata: responsedata
				};

				sails.log.info( "json data", json );
				res.contentType( "application/json" );
				res.json( json );
			}
			if( maximumcriteriaExistrange == 1 ) {
				var responsedata = {
					status: "fail",
					message: "Your Maximum Loanamount Already In Existing Range. Tryout With Another Range."
				};

				var json = {
					responsedata: responsedata
				};

				sails.log.info( "json data", json );
				res.contentType( "application/json" );
				res.json( json );
			}

			if( minimumcriteriaExistrange != 1 && maximumcriteriaExistrange != 1 ) {
				const criteria = { id: loanstateregualtion_id };

				Loanstateregulation.update( criteria, { state: newstate, stateCode: newstateCode, minloanamount: newminloanamount, maxloanamount: newmaxloanamount, maxapr: newmaxapr, applicationfee: newapplicationfee, originationfeecap: neworiginationfeecap } ).exec( function afterwards( err, updateddetails ) {
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

					sails.log.info( "json data", json );
					res.contentType( "application/json" );
					res.json( json );
				} );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "UserController#createstateregulationAction ::  err ", err );
			return res.handleError( err );
		} );
	}
	if( action == "create" ) {
		const createcriteria = { product: product_id, state: newstate };

		sails.log.info( "create" );
		Loanstateregulation.find( createcriteria )
		.then( function( stateregulationdetails ) {
			let minimumcriteriaExistrange = 0;
			let maximumcriteriaExistrange = 0;

			if( stateregulationdetails[ 0 ] ) {
				_.forEach( stateregulationdetails, function( stateregulationdetails ) {
					const minloanamount_range = parseFloat( stateregulationdetails.minloanamount );
					const maxloanamount_range = parseFloat( stateregulationdetails.maxloanamount );

					if( parseFloat( newminloanamount ) >= minloanamount_range && parseFloat( newminloanamount ) <= maxloanamount_range ) {
						minimumcriteriaExistrange = 1;
					}

					if( parseFloat( newmaxloanamount ) >= minloanamount_range && parseFloat( newmaxloanamount ) <= maxloanamount_range ) {
						maximumcriteriaExistrange = 1;
					}
				} );

				/* To check ranges end*/
				if( maximumcriteriaExistrange == 1 && minimumcriteriaExistrange == 1 ) {
					var responsedata = {
						status: "fail",
						message: "Your Minimum And Maximum Loanamount Already In Existing Range. Tryout With Another Range."
					};

					var json = {
						responsedata: responsedata
					};

					sails.log.info( "json data", json );
					res.contentType( "application/json" );
					res.json( json );
				}
				if( minimumcriteriaExistrange == 1 ) {
					var responsedata = {
						status: "fail",
						message: "Your Minimum Loanamount Already In Existing Range. Tryout With Another Range."
					};

					var json = {
						responsedata: responsedata
					};

					sails.log.info( "json data", json );
					res.contentType( "application/json" );
					res.json( json );
				}
				if( maximumcriteriaExistrange == 1 ) {
					var responsedata = {
						status: "fail",
						message: "Your Maximum Loanamount Already In Existing Range. Tryout With Another Range."
					};

					var json = {
						responsedata: responsedata
					};

					sails.log.info( "json data", json );
					res.contentType( "application/json" );
					res.json( json );
				}

				if( minimumcriteriaExistrange != 1 && maximumcriteriaExistrange != 1 ) {
					Loanstateregulation.create( { product: product_id, state: newstate, stateCode: newstateCode, minloanamount: newminloanamount, maxloanamount: newmaxloanamount, maxapr: newmaxapr, applicationfee: newapplicationfee, originationfeecap: neworiginationfeecap } ).exec( function( err, loandetails ) {
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

						sails.log.info( "json data", json );
						res.contentType( "application/json" );
						res.json( json );
					} );
				}
			}
		} )
		.catch( function( err ) {
			sails.log.error( "UserController#viewproductdetailsAction ::  err ", err );
			return res.handleError( err );
		} );
	}
}

function ajaxgetstateregulationsAction( req, res ) {
	const product_id = req.param( "product_id" );

	Loanstateregulation.find( { product: product_id } )
	.then( function( stateregulation ) {
		Productlist.findOne( { id: product_id } )
		.then( function( productdetails ) {
			const responsedata = {
				status: "get success",
				stateregulation: stateregulation,
				productname: productdetails.productname
			};

			const json = {
				responsedata: responsedata
			};

			sails.log.info( "json data", json );
			res.contentType( "application/json" );
			res.json( json );
		} )
		.catch( function( err ) {
			sails.log.error( "UserController#viewproductdetailsAction ::  err ", err );
			return res.handleError( err );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "UserController#viewproductdetailsAction ::  err ", err );
		return res.handleError( err );
	} );
}

function getinterestratefieldsAction( req, res ) {
	const intrestrate_id = req.param( "intrestrate_id" );
	const criteria = { id: intrestrate_id };

	Loaninterestrate.findOne( criteria )
	.then( function( loaninterestratedetails ) {
		const responsedata = {
			status: "Success",
			loaninterestratedetails: loaninterestratedetails
		};

		const json = {
			responsedata: responsedata
		};
		sails.log.info( "json data", json );
		res.contentType( "application/json" );
		res.json( json );
	} )
	.catch( function( err ) {
		sails.log.error( "UserController#getinterestratefieldsAction#catch :: err :", err );
		return res.handleError( err );
	} );
}

function createupdateinterestrateAction( req, res ) {
	const minimumcreditscore = req.param( "minscoreinterestrate" );
	const maximumcreditscore = req.param( "maxscoreinterestrate" );
	const interestrate_fields_whole = req.param( "interestrate_fields_whole" );
	const intrestrate_product_id = req.param( "intrestrate_product_id" );
	const intrestrate_id = req.param( "intrestrate_id" );
	const loan_intrestrate_action = req.param( "loan_intrestrate_action" );
	const interestrate_product_type = req.param( "interestrate_product_type" );

	if( loan_intrestrate_action == "create" ) {
		var criteria = { product: intrestrate_product_id };
	}

	if( loan_intrestrate_action == "update" ) {
		var criteria = {
			product: intrestrate_product_id,
			id: { "!": intrestrate_id }
		};
	}

	Loaninterestrate.find( criteria )
	.then( function( filtercapdetails ) {
		/* To check ranges start*/
		let minimumcriteriaExist = 0;
		let maximumcriteriaExist = 0;
		_.forEach( filtercapdetails, function( filtercapdetails ) {
			const mincreditscore = filtercapdetails.mincreditscore;
			const maxcreditscore = filtercapdetails.maxcreditscore;

			if( minimumcreditscore >= mincreditscore && minimumcreditscore <= maxcreditscore ) {
				minimumcriteriaExist = 1;
			}
			if( maximumcreditscore >= mincreditscore && maximumcreditscore <= maxcreditscore ) {
				maximumcriteriaExist = 1;
			}
		} );
		/* To check ranges end*/

		if( maximumcriteriaExist == 1 && minimumcriteriaExist == 1 ) {
			var responsedata = {
				status: "fail",
				message: "Your Minimum And Maximum Creditscore Already In Existing Range. Tryout With Another Range."
			};

			var json = {
				responsedata: responsedata
			};

			sails.log.info( "json data", json );
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

			sails.log.info( "json data", json );
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

			sails.log.info( "json data", json );
			res.contentType( "application/json" );
			res.json( json );
		}
		if( minimumcriteriaExist != 1 && maximumcriteriaExist != 1 ) {
			const criteriamonth = { productid: intrestrate_product_id };

			if( interestrate_product_type == "loanproductsettings" ) {
				var intrestrateobj = {};
				let no_month = {};
				Loanproductsettings.find( criteriamonth ).then( function( monthdata ) {
					monthdata.forEach( function( productdata, loopvalue ) {
						no_month = parseFloat( productdata.month );
						intrestrateobj[ no_month ] = interestrate_fields_whole[ loopvalue ];
					} );
					sails.log.info( " intrestrateobj", intrestrateobj );

					const criteria = { id: intrestrate_id };
					if( loan_intrestrate_action == "update" ) {
						Loaninterestrate.update( criteria, { product: intrestrate_product_id, mincreditscore: minimumcreditscore, maxcreditscore: maximumcreditscore, intrestrate: intrestrateobj } ).exec( function afterwards( err, interestrateupdated ) {
							sails.log.info( " interestrateupdated", interestrateupdated );
							const responsedata = {
								status: "Success",
								message: "Your Data Successfully Updated."
							};

							const json = {
								responsedata: responsedata
							};

							sails.log.info( "json data", json );
							res.contentType( "application/json" );
							res.json( json );
						} );
					}
					if( loan_intrestrate_action == "create" ) {
						Loaninterestrate.create( { product: intrestrate_product_id, mincreditscore: minimumcreditscore, maxcreditscore: maximumcreditscore, intrestrate: intrestrateobj } ).exec( function( err, interestratecreated ) {
							sails.log.info( " interestratecreated", interestratecreated );
							const responsedata = {
								status: "Success",
								message: "Your Data Successfully Created."
							};

							const json = {
								responsedata: responsedata
							};

							sails.log.info( "json data", json );
							res.contentType( "application/json" );
							res.json( json );
						} );
					}
				} );
			}
			if( interestrate_product_type == "loanproductincome" ) {
				var intrestrateobj = [];
				const intrestrateobject = {};
				const incomerange = {};
				Loanproductincome.find( criteriamonth ).then( function( incomedata ) {
					sails.log.info( "incomedata data", incomedata );
					sails.log.info( "interestrate_fields_whole ", interestrate_fields_whole );
					const intrestrateobj = [];
					incomedata.forEach( function( productdata, loopvalue ) {
						// sails.log.info("productdata ", productdata);
						const minimumincome = productdata.minimumincome;
						const maximumincome = productdata.maximumincome;

						// intrestrateobject['minimumincome'] = minimumincome;
						// intrestrateobject['maximumincome'] = maximumincome;
						// intrestrateobject['amount'] = interestrate_fields_whole[loopvalue];

						const amount = interestrate_fields_whole[ loopvalue ];
						const intrestrateobjData = {
							minimumincome: minimumincome,
							maximumincome: maximumincome,
							amount: amount
						};
						sails.log.info( "intrestrateobjData: ", intrestrateobjData );
						intrestrateobj.push( intrestrateobjData );
						sails.log.info( "intrestrateobject1", intrestrateobj );
					} );
					sails.log.info( "intrestrateobject2", intrestrateobj );
					const criteria = { id: intrestrate_id };
					sails.log.info( "criteria", criteria );
					/* update section start*/
					if( loan_intrestrate_action == "update" ) {
						Loaninterestrate.update( criteria, { product: intrestrate_product_id, mincreditscore: minimumcreditscore, maxcreditscore: maximumcreditscore, intrestrate: intrestrateobj } ).exec( function afterwards( err, interestrateupdated ) {
							sails.log.info( "interestrateupdated", interestrateupdated );
							const responsedata = {
								status: "Success",
								message: "Your Data Successfully Updated."
							};

							const json = {
								responsedata: responsedata
							};

							sails.log.info( "json data", json );
							res.contentType( "application/json" );
							res.json( json );
						} );
					}
					/* update section end*/
					/* create section start*/
					if( loan_intrestrate_action == "create" ) {
						Loaninterestrate.create( { product: intrestrate_product_id, mincreditscore: minimumcreditscore, maxcreditscore: maximumcreditscore, intrestrate: intrestrateobj } ).exec( function( err, interestratecreated ) {
							sails.log.info( " interestratecreated", interestratecreated );
							const responsedata = {
								status: "Success",
								message: "Your Data Successfully Created."
							};

							const json = {
								responsedata: responsedata
							};

							sails.log.info( "json data", json );
							res.contentType( "application/json" );
							res.json( json );
						} );
					}
					/* create section end*/
				} );
			}
		}
	} )
	.catch( function( err ) {
		sails.log.error( "ApplicationController#createupdateinterestrateAction#catch :: err :", err );
		return res.handleError( err );
	} );
}

function getuploadeddocumentsAction( req, res ) {
	const userid = req.session.userId;
	const documentname = req.param( "doc_type" );
	const payId = req.param( "payId" );

	sails.log.info( "documentname: ", documentname );
	sails.log.info( "userid: ", userid );
	sails.log.info( "payId: ", payId );

	Achdocuments.findOne( { docname: documentname, paymentManagement: payId, status: 1 } )
	.then( function( achdocument ) {
		sails.log.info( "achdocument: ", achdocument );

		let alredyuploaded = 0;
		if( achdocument ) {
			alredyuploaded = 1;
		}
		// return alredyuploaded;
		const json = {
			responsedata: alredyuploaded
		};

		sails.log.info( "json data", json );
		res.contentType( "application/json" );
		res.json( json );
	} )
	.catch( function( err ) {
		sails.log.error( "HomeController#dashboardAction :: err", err );
		return res.handleError( err );
	} );
}

function postNewRuleDecisionAction( req, res ) {
	const transdata = req.param( "transdata" );

	// sails.log.info("transdata: ",transdata);

	const creditReportjson = JSON.parse( transdata );
	const creditReport = creditReportjson.creditBureau;
	// var creditReport = JSON.stringify(transdata);
	// sails.log.info("Initial screditReport: ",creditReport);

	if( creditReport ) {
		var transunion_scrore = "";
		if( creditReport.product.subject.subjectRecord.addOnProduct ) {
			if( creditReport.product.subject.subjectRecord.addOnProduct.scoreModel ) {
				if( creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.noScoreReason ) {
					// No Hit
					var jsondata = {
						code: 500,
						message: creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.noScoreReason
					};
					res.contentType( "application/json" );
					res.json( jsondata );
				} else {
					if( creditReport.product.subject.subjectRecord.addOnProduct.scoreModel ) {
						var transunion_scrore = creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.results;
					} else {
						_.forEach( creditReport.product.subject.subjectRecord.addOnProduct, function( value, key ) {
							if( value.code == "00W18" && value.scoreModel ) {
								transunion_scrore = value.scoreModel.score.results;
							}
						} );
					}
				}
			} else {
				if( Array.isArray( creditReport.product.subject.subjectRecord.addOnProduct ) ) {
					_.forEach( creditReport.product.subject.subjectRecord.addOnProduct, function( value, key ) {
						if( value.code == "00W18" && value.scoreModel != "" && value.scoreModel != null && "undefined" !== typeof value.scoreModel ) {
							if( value.scoreModel.score.results != "" && value.scoreModel.score.results != null && "undefined" !== typeof value.scoreModel.score.results ) {
								transunion_scrore = value.scoreModel.score.results;
							}
						}
					} );
				}
			}
		}

		transunion_scrore = parseInt( transunion_scrore.replace( "+", "" ) );

		sails.log.info( "transunion_scrore: ", transunion_scrore );

		ApplicationService.getNewProductRule( creditReport, transunion_scrore )
		.then( function( rulesDetails ) {
			sails.log.info( "rulesDetails:", rulesDetails );
			sails.log.info( "Loanstatus:", rulesDetails.loanstatus );

			const jsondata = {
				code: 200,
				message: rulesDetails
			};
			res.contentType( "application/json" );
			res.json( jsondata );
		} )
		.catch( function( err ) {
			var errormessage = "";
			if( err.code == 400 ) {
				var errormessage = "Your application has been declined, due to low credit score!";
			} else {
				var errormessage = "Could not recieve your credit details";
			}
			const jsondata = {
				code: err.code,
				message: errormessage
			};
			res.contentType( "application/json" );
			res.json( jsondata );
		} );
	} else {
		var jsondata = {
			code: 400,
			message: "Invalid Data"
		};
		res.contentType( "application/json" );
		res.json( jsondata );
	}
}

function viewRuleDecisionMaker( req, res ) {
	return res.view( "frontend/home/postrulesdecision" );
}

function postRuleDecisionMaker( req, res ) {
	const transdata = req.param( "transdata" );

	sails.log.info( "transdata: ", transdata );

	const creditReportjson = JSON.parse( transdata );
	const creditReport = creditReportjson.creditBureau;
	// var creditReport = JSON.stringify(transdata);
	// sails.log.info("Initial screditReport: ",creditReport);

	if( creditReport ) {
		var transunion_scrore = "";
		if( creditReport.product.subject.subjectRecord.addOnProduct ) {
			if( creditReport.product.subject.subjectRecord.addOnProduct.scoreModel ) {
				if( creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.noScoreReason ) {
					// No Hit
					var jsondata = {
						code: 500,
						message: creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.noScoreReason
					};
					res.contentType( "application/json" );
					res.json( jsondata );
				} else {
					if( creditReport.product.subject.subjectRecord.addOnProduct.scoreModel ) {
						var transunion_scrore = creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.results;
					} else {
						_.forEach( creditReport.product.subject.subjectRecord.addOnProduct, function( value, key ) {
							if( value.scoreModel ) {
								transunion_scrore = value.scoreModel.score.results;
							}
						} );
					}
				}
			} else {
				if( Array.isArray( creditReport.product.subject.subjectRecord.addOnProduct ) ) {
					_.forEach( creditReport.product.subject.subjectRecord.addOnProduct, function( value, key ) {
						if( value.scoreModel != "" && value.scoreModel != null && "undefined" !== typeof value.scoreModel ) {
							if( value.scoreModel.score.results != "" && value.scoreModel.score.results != null && "undefined" !== typeof value.scoreModel.score.results ) {
								transunion_scrore = value.scoreModel.score.results;
							}
						}
					} );
				}
			}
		}

		transunion_scrore = parseInt( transunion_scrore.replace( "+", "" ) );

		sails.log.info( "transunion_scrore: ", transunion_scrore );

		ApplicationService.getProductRule( creditReport, transunion_scrore ) // this function needs another argument if this code ever needs to be exercised
		.then( function( rulesDetails ) {
			sails.log.info( "rulesDetails:", rulesDetails );
			sails.log.info( "Loanstatus:", rulesDetails.loanstatus );

			const jsondata = {
				code: 200,
				message: rulesDetails
			};
			res.contentType( "application/json" );
			res.json( jsondata );
		} )
		.catch( function( err ) {
			var errormessage = "";
			if( err.code == 400 ) {
				var errormessage = "Your application has been declined, due to low credit score!";
			} else {
				var errormessage = "Could not recieve your credit details";
			}
			const jsondata = {
				code: err.code,
				message: errormessage
			};
			res.contentType( "application/json" );
			res.json( jsondata );
		} );
	} else {
		var jsondata = {
			code: 400,
			message: "Invalid Data"
		};
		res.contentType( "application/json" );
		res.json( jsondata );
	}
}

function servicegetuploadeddocuments( req, res ) {
	const documentname = req.param( "doc_type" );
	const userId = req.param( "userId" );

	Achdocuments.findOne( { docname: documentname, user: userId, status: 1 } )
	.then( function( achdocument ) {
		let alredyuploaded = 0;

		if( achdocument != "" && achdocument != null && "undefined" !== typeof achdocument ) {
			alredyuploaded = 1;
		}
		// return alredyuploaded;
		const json = {
			responsedata: alredyuploaded
		};

		res.contentType( "application/json" );
		res.json( json );
	} )
	.catch( function( err ) {
		sails.log.error( "HomeController#dashboardAction :: err", err );
		return res.handleError( err );
	} );
}

function updatetranshistorydata( req, res ) {
	const transunionid = req.param( "transid" );
	const transhistoryid = req.param( "historyid" );

	const transcriteria = { id: transunionid };

	Transunions.findOne( transcriteria )
	.then( function( transunionInfo ) {
		const transresponse = transunionInfo.response;
		const transuserid = transunionInfo.user;
		const updatedAt = transunionInfo.updatedAt;

		const transchistoryriteria = { id: transhistoryid };

		Transunionhistory.findOne( transchistoryriteria )
		.then( function( transunionhistoryInfo ) {
			const transhistoryuserid = transunionhistoryInfo.user;
			if( transuserid == transhistoryuserid ) {
				sails.log.info( "updatedAt: ", updatedAt );
				// var creditBureau = '"creditBureau": {'+transresponse+'}';
				// sails.log.info("creditBureau: ",creditBureau);
				const creditBureau = { creditBureau: transresponse };
				Transunionhistory.update( { id: transhistoryid }, { responsedata: creditBureau, updatedAt: updatedAt } ).exec( function afterwards( err, updated ) {
					sails.log.info( "updatedstatus: ", "Updated Successfullys" );
					const updatehistory = "Updated Successfullys=======" + transhistoryid;
					return res.view( "frontend/application/updatehistory", { updatehistory: updatehistory } );
				} );
			}
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

function getTransunionDetailsAction( req, res ) {
	const transunionid = req.param( "id" );

	const transcriteria = { user: transunionid };

	sails.log.info( "transcriteria: ", transcriteria );
	sails.log.info( "transunionid: ", transunionid );

	Transunions.findOne( transcriteria )
	.then( function( transunionInfo ) {
		if( transunionInfo.response != "" && transunionInfo.response != null && "undefined" !== typeof transunionInfo.response ) {
			const transresponse = { creditBureau: transunionInfo.response };
			var jsondata = {
				code: 200,
				message: transresponse
			};
			res.contentType( "application/json" );
			res.json( jsondata );
		} else {
			var jsondata = {
				code: 400,
				message: "Transunion record not found"
			};
			res.contentType( "application/json" );
			res.json( jsondata );
		}
	} )
	.catch( function( err ) {
		const jsondata = {
			code: 400,
			message: "Transunion record not found"
		};
		res.contentType( "application/json" );
		res.json( jsondata );
	} );
}

function getUserBankDetailsAction( req, res ) {
	const userbankid = req.param( "id" );

	const bankcriteria = {
		$or: [
			{
				id: userbankid
			},
			{
				user: userbankid
			}
		]
	};
	sails.log.info( "bankcriteria: ", bankcriteria );
	sails.log.info( "userbankid: ", userbankid );

	UserBankAccount.findOne( bankcriteria )
	.then( function( userbankidInfo ) {
		sails.log.info( "userbankidInfo: ", userbankidInfo );

		if( userbankidInfo != "" && userbankidInfo != null && "undefined" !== typeof userbankidInfo ) {
			var jsondata = {
				code: 200,
				message: userbankidInfo
			};
			res.contentType( "application/json" );
			res.json( jsondata );
		} else {
			var jsondata = {
				code: 400,
				message: "Userbank Account record not found"
			};
			res.contentType( "application/json" );
			res.json( jsondata );
		}
	} )
	.catch( function( err ) {
		const jsondata = {
			code: 400,
			message: "Transunion record not found"
		};
		res.contentType( "application/json" );
		res.json( jsondata );
	} );
}

function getPaymentmanagementDetailsAction( req, res ) {
	const userbankid = req.param( "id" );

	const paymentcriteria = {
		$or: [
			{
				id: userbankid
			},
			{
				user: userbankid
			}
		]
	};

	PaymentManagement.findOne( paymentcriteria )
	.then( function( paymentInfo ) {
		sails.log.info( "paymentInfo: ", paymentInfo );

		if( paymentInfo != "" && paymentInfo != null && "undefined" !== typeof paymentInfo ) {
			var jsondata = {
				code: 200,
				message: paymentInfo
			};
			res.contentType( "application/json" );
			res.json( jsondata );
		} else {
			var jsondata = {
				code: 400,
				message: "Payment record not found"
			};
			res.contentType( "application/json" );
			res.json( jsondata );
		}
	} )
	.catch( function( err ) {
		const jsondata = {
			code: 400,
			message: "Payment record not found"
		};
		res.contentType( "application/json" );
		res.json( jsondata );
	} );
}

function checkuserdocumentsAction( req, res ) {
	const userbankid = req.param( "id" );

	const paymentcriteria = {
		$or: [
			{
				paymentManagement: userbankid
			},
			{
				user: userbankid
			}
		]
	};

	sails.log.info( "paymentcriteria: ", paymentcriteria );

	UserConsent.find( paymentcriteria )
	.then( function( agreementInfo ) {
		sails.log.info( "agreementInfo: ", agreementInfo );

		if( agreementInfo != "" && agreementInfo != null && "undefined" !== typeof agreementInfo ) {
			var jsondata = {
				code: 200,
				message: agreementInfo
			};
			res.contentType( "application/json" );
			res.json( jsondata );
		} else {
			var jsondata = {
				code: 400,
				message: "Agreement record not found"
			};
			res.contentType( "application/json" );
			res.json( jsondata );
		}
	} )
	.catch( function( err ) {
		const jsondata = {
			code: 400,
			message: "Agreement record not found"
		};
		res.contentType( "application/json" );
		res.json( jsondata );
	} );
}

function couserinformationAction( req, res ) {
	let successval = "";

	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}

	res.view( "frontend/coborrower/couserinformation", { success: successval } );
}

function couserinformationfullAction( req, res ) {
	let successval = "";

	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}

	State.getExistingState().then( function( states ) {
		res.view( "frontend/coborrower/couserinformationfull", { states: states, success: successval } );
	} );
}

function cofinancialinfomationAction( req, res ) {
	let successval = "";

	if( req.session.successval != "" ) {
		successval = req.session.successval;
		req.session.successval = "";
	}

	res.view( "frontend/coborrower/cofinancialinfomation", { success: successval } );
}

function sendforgotpasswordAction( req, res ) {
	const email = req.param( "forgotemail" );
	const userCriteria = { email: email };

	User.findOne( userCriteria ).then( function( userdetail ) {
		sails.log.info( "userdetail::::::", userdetail );
		if( userdetail != "" && userdetail != null && "undefined" !== typeof userdetail ) {
			const userdetails = {
				id: userdetail.id,
				email: userdetail.email,
				name: userdetail.firstname + " " + userdetail.lastname
			};

			req.session.errormsg = "";
			req.session.successval = `We've sent an email to ${email} with password reset instructions.`;
			EmailService.sendforgotpasswordEmail( userdetails );

			var redirectpath = "/forgotpassword";
			return res.redirect( redirectpath );
		} else {
			req.session.errormsg = "Sorry, we couldn't find an account with this email address. Try again or contact us.";
			req.session.successval = "";
			var redirectpath = "/forgotpassword";
			return res.redirect( redirectpath );
		}
	} );
}

function usersetpasswordAction( req, res, id ) {
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

			res.view( "frontend/home/usersetpassword", {
				error: errorval,
				successval: successval,
				id: id,
				appPracticeId: appPracticeId,
				appPracticeSlug: appPracticeSlug
			} );
		} else {
			return res.redirect( "/" );
		}
	} )
	.catch( function( err ) {
		return res.redirect( "/" );
	} );
}

function updateuserpasswordAction( req, res ) {
	const errorval = "";
	const newpassword = req.param( "new_pwd" );
	const confirmpass = req.param( "confirm_pwd" );
	const userid = req.param( "userid" );

	User.findOne( { id: userid } )
	.then( function( updatedUser ) {
		updatedUser.password = newpassword;
		const salt = PracticeUser.generateSalt();

		User.generateEncryptedPassword( updatedUser, salt ).then( function( encryptedPassword ) {
			updatedUser.password = encryptedPassword;
			updatedUser.passwordstatus = 1;
			updatedUser.salt = salt;

			const useridemail = updatedUser.id;

			if( userid == useridemail ) {
				updatedUser.save( function( err ) {
					if( err ) {
						const json = {
							status: 500,
							message: "Unable to update Password!"
						};
						req.session.passerror = "";
						req.session.passerror = "Unable to update Password!!";
						return res.redirect( "/usersetpassword/" + userid );
					}

					req.session.successval = "";
					req.session.successval = "Password changed successfully!";
					return res.redirect( "/usersetpassword/" + updatedUser.id );
				} );
			} else {
				req.session.passerror = "";
				req.session.passerror = "Invalid Email Address";
				return res.redirect( "/usersetpassword/" + userid );
			}
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "ApplicatioController#updateuserpasswordAction :: err", err );
		return res.handleError( err );
	} );
}

function savechangepasswordAction( req, res ) {
	const errorval = "";
	const currentpassword = req.param( "currentPassword" );
	const newpassword = req.param( "newPassword" );
	const confirmpass = req.param( "confirmPassword" );
	const userid = req.session.userId;

	User.findOne( { id: userid } )
	.then( function( updatedUser ) {
		return bcrypt
		.compare( currentpassword, updatedUser.password, function( err, userres ) {
			if( userres ) {
				updatedUser.password = newpassword;
				const salt = User.generateSalt();

				User.generateEncryptedPassword( updatedUser, salt ).then( function( encryptedPassword ) {
					updatedUser.password = encryptedPassword;
					updatedUser.passwordstatus = 1;
					updatedUser.salt = salt;

					const useridemail = updatedUser.id;

					if( userid == useridemail ) {
						updatedUser.save( function( err ) {
							if( err ) {
								const json = {
									status: 500,
									message: "Unable to update Password!"
								};
								req.session.errorval = "";
								req.session.errorval = "Unable to update Password!!";
								return res.redirect( "/editprofile" );
							}

							req.session.successval = "";
							req.session.successval = "Password changed successfully!";
							return res.redirect( "/editprofile" );
						} );
					} else {
						req.session.errorval = "";
						req.session.errorval = "Invalid User";
						return res.redirect( "/editprofile" );
					}
				} );
			} else {
				req.session.errorval = "";
				req.session.errorval = "Your current password don't match!";
				return res.redirect( "/editprofile" );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "ApplicatioController#updateuserpasswordAction :: err", err );
			return res.handleError( err );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "ApplicatioController#updateuserpasswordAction :: err", err );
		return res.handleError( err );
	} );
}

function receivenotifiAction( req, res ) {
	sails.log.info( "allParams+++++", req.allParams() );

	const notifiemail = req.param( "notifiemail" );
	const notifimobile = req.param( "notifimobile" );

	const userid = req.session.userId;
	User.findOne( { id: userid } )
	.then( function( updatedUser ) {
		const useridemail = updatedUser.id;

		/* updatedUser.password = encryptedPassword;
		updatedUser.passwordstatus = 1;*/

		if( userid == useridemail ) {
			User.update( { id: userid }, { notifiemail: notifiemail, notifimobile: notifimobile } ).exec( function afterwards( err, notifidata ) {
				if( err ) {
					req.session.errorval = "";
					req.session.errorval = "Unable to update notification details!";
					return res.redirect( "/editprofile" );
				}
				req.session.successval = "";
				req.session.successval = "Notification details changed successfully!";
				return res.redirect( "/editprofile" );
			} );
		} else {
			req.session.errorval = "";
			req.session.errorval = "Invalid User";
			return res.redirect( "/editprofile" );
		}
	} )
	.catch( function( err ) {
		sails.log.error( "ApplicatioController#receivenotifiAction :: err", err );
		return res.handleError( err );
	} );
}

function uploadAvatarAction( req, res ) {
	const localPath = sails.config.appPath + "/assets/uploads/userprofile/";
	const path = require( "path" );
	const userid = req.session.userId;

	req.file( "userprofile" ).upload( { dirname: localPath }, function( err, uploadedFiles ) {
		sails.log.info( "uploadedFileslength", uploadedFiles.length );
		if( err ) {
			sails.log.error( "@userprofile ::  Uploading Error :: ", err );
		} else {
			if( uploadedFiles.length > 0 ) {
				if( _.has( uploadedFiles[ 0 ], "fd" ) ) {
					const localPath = uploadedFiles[ 0 ].fd;
					sails.log.info( "localPath****", localPath );
					const criteria = { id: userid };
					User.findOne( criteria )
					.then( function( userDetails ) {
						const userReference = userDetails.userReference;
						Asset.createUserProfile( localPath, userReference, Asset.ASSET_TYPE_PROFILE_PICTURE, userid )
						.then( function( asset ) {
							sails.log.info( "assetasset******", asset );
							return res.redirect( "/editprofile" );

							/* var json = {
							status: 200,
							message:"Documents Uploaded successfully"
						 };
						  sails.log.info("json data", json);*/
						} )
						.catch( function( err ) {
							sails.log.error( "ApplicationController#createAchDocuments :: err :", err );
							return res.handleError( err );
						} );
					} )
					.catch( function( err ) {
						sails.log.error( "ApplicationController#createAchDocuments :: err :", err );
						return res.handleError( err );
					} );
				}
			}
		}
	} );
}

function contract( req, res ) {
	const userid = req.session.userId;
	sails.log.info( "ApplicationController.promissorynoteAction userid:", userid );

	return ApplicationService.getPromissoryNoteData( req )
	.then( ( result ) => {
		if( result.code !== 200 ) {
			sails.log.error( "ApplicationController.promissorynoteAction; result.code:", result.code );
			return res.view( "frontend/banktransaction/contract" );
		}
		return res.view( "frontend/banktransaction/contract", result.data );
	} );
}

function importApplications( req, res ) {
	const templateData = {};
	res.view( "admin/import/applications", templateData );
}


function importApplicationsPost( req, res ) {
	const Promise = require( "bluebird" );
	const PromiseStream = require( path.resolve( sails.config.appPath, "modules", "promise-stream" ) );
	const dirname = path.resolve( sails.config.appPath, ".tmp/uploads" );
	let fileupload;
	let filePath;
	const practices = [];

	const transformPassthru = {
		write: function _write( chunk, encoding, callback ) {
			callback( null, chunk );
			return true;
		},
		end: function _end( callback ) {
			callback( null );
		}
	};

	new Promise( ( resolve, reject ) => {
		req.file( "fileupload" ).upload( { maxBytes: 1000000, dirname: dirname }, ( err, uploadedFiles ) => {
			if( err ) {
				sails.log.error( "importApplicationsPost; upload.err:", err );
				return reject( err );
			}
			if( uploadedFiles.length === 0 ) {
				return reject( new Error( "No file was uploaded" ) );
			}
			fileupload = uploadedFiles[ 0 ];
			sails.log.verbose( "importApplicationsPost; fileupload:", JSON.stringify( fileupload ) );
			filePath = path.resolve( dirname, fileupload.fd );
			return resolve( fileupload );
		} );
	} )
	.then( () => {
		return PracticeManagement.find( { isDeleted: false } )
		.then( ( practicemanagements ) => {
			_.forEach( practicemanagements, ( practicemanagement ) => {
				practices.push( { id: practicemanagement.id, name: practicemanagement.PracticeName.toLowerCase() } );
			} );
		} );
	} )
	.then( () => {
		// mhf-import-application
		const readStream = fs.createReadStream( filePath ).pipe( csv.parse( { headers: true } ) );
		const pStream = PromiseStream.createWriteStream( { "concurrency": 200 }, importApplication );
		readStream.pipe( pStream );
		return pStream.promise();
	} )
	.then( () => {
		// user
		const pStream = PromiseStream.createWriteStream( { "concurrency": 200 }, createUsers );
		MHFImportApplication.stream( {}, transformPassthru )
		.pipe( pStream );
		return pStream.promise();
	} )
	.then( () => {
		// screentracking
		const pStream = PromiseStream.createWriteStream( { "concurrency": 200 }, createScreentacking );
		MHFImportApplication.stream( {}, transformPassthru )
		.pipe( pStream );
		return pStream.promise();
	} )
	.then( () => {
		// userbankaccount
		const pStream = PromiseStream.createWriteStream( { "concurrency": 200 }, createUserBankAccount );
		MHFImportApplication.stream( { ACH_Account_Number: { $ne: "" }, ACH_Routing_number: { $ne: "" } }, transformPassthru )
		.pipe( pStream );
		return pStream.promise();
	} )
	.then( () => {
		return res.json( { success: true } );
	} )
	.catch( ( err ) => {
		sails.log.error( "importApplicationsPost; catch:", err );
		return res.badRequest( err.message );
	} )
	.finally( () => {
		if( filePath ) {
			sails.log.verbose( "importApplicationsPost; removing:", filePath );
			fs.unlink( filePath, () => {} );
		}
	} );

	function importApplication( csvdata ) {
		let mhfApplication;
		// sails.log.verbose( "importApplication; csvdata[1]:", csvdata );
		csvdata.AppID = parseInt( csvdata.AppID );
		csvdata.patient_id = parseInt( csvdata.patient_id );
		csvdata.demographic_id = parseInt( csvdata.demographic_id );
		csvdata.financed_amt_requested = parseInt( csvdata.financed_amt_requested );
		csvdata.interest_rate = parseFloat( csvdata.interest_rate );
		csvdata.buy_rate = parseInt( csvdata.buy_rate || 0 );
		csvdata.term = parseInt( csvdata.term );
		csvdata.created = moment( csvdata.created, "M/D/YYYY HH:mm" ).toDate();
		csvdata.lastupdated = moment( csvdata.lastupdated, "M/D/YYYY HH:mm" ).toDate();
		csvdata.Prefbillingdate = parseInt( csvdata.Prefbillingdate );
		csvdata.down_payment_amount = parseInt( csvdata.down_payment_amount );
		csvdata.procedure_amount = parseFloat( _.get( csvdata, " procedure_amount ", "" ).replace( /[^0-9.]/g, "" ) );
		delete csvdata[ " procedure_amount " ];
		csvdata.FICO = parseInt( csvdata.FICO );
		csvdata.rule_id = ( parseInt( csvdata.rule_id ) || csvdata.rule_id );
		csvdata.enabled = parseInt( csvdata.enabled );
		csvdata.dob = moment( csvdata.dob, "M/D/YYYY" ).toDate();
		csvdata.state_id = parseInt( csvdata.state_id );
		csvdata.business_state_id = parseInt( csvdata.business_state_id );
		csvdata.years = parseInt( csvdata.years );
		csvdata.housing_payment = parseInt( csvdata.housing_payment );
		csvdata.employer_start_date = moment( csvdata.employer_start_date, "M/D/YYYY" ).toDate();
		csvdata.monthlyincome = parseInt( _.get( csvdata, "monthlyincome", 0 ) );
		csvdata.TU_estimated_grossincome = parseInt( csvdata.TU_estimated_grossincome.replace( /[^0-9.]/g, "" ) );
		csvdata[ "TU_DTI_estimate_%" ] = parseInt( _.get( csvdata, "TU_DTI_estimate_%", 0 ) || 0 );
		csvdata.TU_data_date = moment( csvdata.TU_data_date, "M/D/YYYY HH:mm" ).toDate();
		// sails.log.verbose( "importApplication; csvdata[2]:", csvdata );

		return MHFImportApplication.findOne( { AppID: csvdata.AppID, patient_id: csvdata.patient_id } )
		.then( ( application ) => {
			mhfApplication = application;
			if( mhfApplication == undefined ) {
				const baseApp = {
					practicemanagement: null,
					user: null,
					screentracking: null,
					userbankaccount: null,
					account: null
				};
				mhfApplication = Object.assign( baseApp, csvdata );
				// sails.log.verbose( "importApplication; create:", JSON.stringify( mhfApplication ) );
				return MHFImportApplication.create( mhfApplication )
				.then( ( created ) => {
					mhfApplication = created;
				} );
			}
			// sails.log.verbose( "importApplication; update:", JSON.stringify( csvdata ) );
			return MHFImportApplication.update( { id: mhfApplication.id }, csvdata )
			.then( ( updated ) => {
				mhfApplication = updated[ 0 ];
			} );
		} )
		.then( () => {
			if( mhfApplication.practicemanagement != null ) return;
			// sails.log.verbose( "importApplication; mhfApplication:", mhfApplication );
			let selectedPractice = null;
			const referral = mhfApplication.referral_company_id.toLowerCase();
			_.some( practices, ( practice ) => {
				// sails.log.verbose( `${practice.name} <> ${referral}` );
				if( practice.name.includes( referral ) || referral.includes( practice.name ) ) {
					selectedPractice = practice;
					return true;
				}
				const matchPct = Utils.strSimilarity( practice.name, referral );
				if( matchPct > 0.75 ) {
					selectedPractice = practice;
					return true;
				}
			} );
			if( selectedPractice == null ) {
				const err = new Error( "Unable to find matching Practice" );
				sails.log.error( "importApplication;", err );
				return Promise.reject( err );
			}
			// sails.log.verbose( "importApplication; practice:", selectedPractice );
			return MHFImportApplication.update( { id: mhfApplication.id }, { practicemanagement: selectedPractice.id } )
			.then( ( updated ) => {
				mhfApplication = updated[ 0 ];
			} );
		} );
	}

	function createUsers( mhfApplication ) {
		if( mhfApplication == undefined ) return Promise.resolve();
		// sails.log.verbose( "mhfApplication:", typeof mhfApplication, mhfApplication );
		let userRoleId;
		let user = {};
		return Roles.findOne( { rolename: "User" } )
		.then( ( roleData ) => {
			if( roleData ) {
				userRoleId = roleData.id;
			}
		} )
		.then( () => {
			if( mhfApplication.user != null ) {
				return User.findOne( { id: mhfApplication.user } )
				.then( ( _user ) => {
					user = _user;
					const userUpdate = {
						firstname: mhfApplication.first_name,
						middlename: mhfApplication.middle_name,
						lastname: mhfApplication.last_name,
						email: mhfApplication.email,
						phoneNumber: ( mhfApplication.phone || mhfApplication.cell ),
						isPhoneVerified: true,
						street: mhfApplication.address1,
						unitapt: mhfApplication.address2,
						city: mhfApplication.city.trim(),
						state: mhfApplication.abbr,
						zipCode: mhfApplication.zip,
						ssn_number: mhfApplication.ssn,
						dateofBirth: moment( mhfApplication.dob ).format( "YYYY-MM-DD" )
					};
					User.parseLastName( userUpdate );
					User.parseStreetAddress( userUpdate );
					return Promise.resolve()
					.then( () => {
						if( user.state != userUpdate.state ) {
							return State.findOne( { stateCode: userUpdate.state } )
							.then( ( state ) => {
								if( state ) {
									userUpdate._state = state.id;
								}
							} );
						}
					} )
					.then( () => {
						return User.update( { id: user.id }, userUpdate )
						.then( ( updated ) => {
							user = updated[ 0 ];
						} );
					} );
				} );
			}
			user = {
				userReference: null,
				practicemanagement: mhfApplication.practicemanagement,
				firstname: mhfApplication.first_name,
				middlename: mhfApplication.middle_name,
				lastname: mhfApplication.last_name,
				generationCode: "",
				email: mhfApplication.email,
				phoneNumber: ( mhfApplication.phone || mhfApplication.cell ),
				street: mhfApplication.address1,
				unitapt: mhfApplication.address2,
				city: mhfApplication.city.trim(),
				state: mhfApplication.abbr,
				zipCode: mhfApplication.zip,
				ssn_number: mhfApplication.ssn,
				dateofBirth: moment( mhfApplication.dob ).format( "YYYY-MM-DD" ),
				consentChecked: true,
				role: userRoleId,
				salt: null,
				password: null,
				isDeleted: false,
				isEmailVerified: false,
				isPhoneVerified: true,
				isValidEmail: false,
				registeredtype: "mhf-import"
			};
			return User.getNextSequenceValue( "user" )
			.then( ( userRef ) => {
				user.userReference = `USR_${userRef.sequence_value}`;
			} )
			.then( () => {
				return State.findOne( { stateCode: user.state } )
				.then( ( state ) => {
					if( state ) {
						user._state = state.id;
					}
				} );
			} )
			.then( () => {
				User.parseLastName( user );
				User.parseStreetAddress( user );
				// sails.log.verbose( "importApplication; user:", user );
				return User.create( user )
				.then( ( created ) => {
					user = created;
					return MHFImportApplication.update( { id: mhfApplication.id }, { user: user.id } )
					.then( ( updated ) => {
						mhfApplication = updated[ 0 ];
					} );
				} )
				.catch( ( err ) => {
					sails.log.error( "importApplication; User.create.catch:", err, JSON.stringify( mhfApplication ), JSON.stringify( user ) );
				} );
			} );
		} );
	}

	function createScreentacking( mhfApplication ) {
		if( mhfApplication == undefined ) return Promise.resolve();
		// sails.log.verbose( "mhfApplication:", typeof mhfApplication, mhfApplication.user );
		let user;
		let screentracking;
		return User.findOne( { id: mhfApplication.user } )
		.then( ( _user ) => {
			user = _user;
		} )
		.then( () => {
			if( mhfApplication.screentracking != null ) {
				return Screentracking.findOne( { id: mhfApplication.screentracking } )
				.then( ( _screentracking ) => {
					screentracking = _screentracking;
				} );
			}
			const screenData = {
				screenTrackingData: {
					incomeamount: mhfApplication.monthlyincome,
					housingExpense: mhfApplication.housing_payment,
					residenceType: ( [ "own", "rent", "other" ].indexOf( mhfApplication.own_rent.toLowerCase() ) >= 0 ? mhfApplication.own_rent.toLowerCase() : "other" )
				}
			};
			const idobj = {
				creditscore: ( mhfApplication.FICO > 0 ? mhfApplication.FICO : 0 ),
				isNoHit: false,
				transid: null,
				rulesDetails: null
			};
			return Screentracking.createLastScreenName( "Imported", 2, user, screenData, null, idobj )
			.then( ( _screentracking ) => {
				// sails.log.verbose( "importApplication; screentracking:", JSON.stringify( _screentracking ) );
				screentracking = _screentracking;
				return MHFImportApplication.update( { id: mhfApplication.id }, { screentracking: screentracking.id } )
				.then( ( updated ) => {
					mhfApplication = updated[ 0 ];
				} );
			} )
			.catch( ( err ) => {
				sails.log.error( "importApplication; Screentracking.createLastScreenName.catch:", err );
			} );
		} )
		.then( () => {
			const offer = {
				term: mhfApplication.term,
				validOffer: true,
				paymentFrequency: "monthly",
				creditTier: mhfApplication.Tier,
				interestRate: mhfApplication.interest_rate,
				apr: mhfApplication.interest_rate,
				requestedLoanAmount: mhfApplication.procedure_amount,
				financedAmount: parseFloat( ( mhfApplication.procedure_amount - mhfApplication.down_payment_amount ).toFixed( 2 ) ),
				financeCharge: 0.0,
				downPayment: mhfApplication.down_payment_amount,
				fundingRate: mhfApplication.buy_rate,
				monthlyPayment: 0,
				postDTIMonthlyAmount: 0.0,
				postDTIPercentValue: 0.0
			};
			offer.monthlyPayment = parseFloat( Math.abs( parseFloat( MathExt.pmt( ( offer.interestRate / 100 ) / 12, offer.term, offer.financedAmount ) ) ).toFixed( 2 ) );
			const effectiveAPR = Screentracking.calculateApr( offer.term, ( offer.monthlyPayment * -1 ), offer.financedAmount, 0, 0, offer.interestRate );
			const pmtSchedule = MathExt.makeAmortizationSchedule( offer.financedAmount, offer.monthlyPayment, offer.interestRate, offer.term );
			offer.apr = parseFloat( ( MathExt.float( effectiveAPR, 5 ) * 12 * 100 ).toFixed( 1 ) );
			offer.financeCharge = pmtSchedule.financeCharge;
			offer.monthlyPayment = pmtSchedule.payment;

			const screenUpdate = {
				applicationType: "Import",
				preDTIMonthlyAmount: 0,
				preDTIPercentValue: mhfApplication[ "TU_DTI_estimate_%" ],
				creditscore: ( mhfApplication.FICO > 0 ? mhfApplication.FICO : 0 ),
				incomeamount: mhfApplication.monthlyincome,
				housingExpense: mhfApplication.housing_payment,
				residenceType: ( [ "own", "rent", "other" ].indexOf( mhfApplication.own_rent.toLowerCase() ) >= 0 ? mhfApplication.own_rent.toLowerCase() : "other" ),
				offers: [ offer ]
			};
			return Screentracking.update( { id: screentracking.id }, screenUpdate )
			.then( ( updated ) => {
				screentracking = updated[ 0 ];
			} )
			.catch( ( err ) => {
				sails.log.error( "importApplication; Screentracking.update.catch:", err, JSON.stringify( mhfApplication ) );
			} );
		} );
	}

	function createUserBankAccount( mhfApplication ) {
		if( mhfApplication == undefined ) return Promise.resolve();
		// sails.log.verbose( "mhfApplication:", typeof mhfApplication, mhfApplication.user );
		let userbankaccount;
		let account;
		return Promise.resolve()
		.then( () => {
			if( mhfApplication.userbankaccount != null ) {
				return UserBankAccount.findOne( { id: mhfApplication.userbankaccount } )
				.then( ( _userbankaccount ) => {
					userbankaccount = _userbankaccount;
					const bankUpdate = { accounts: userbankaccount.accounts };
					bankUpdate.accounts[ 0 ].meta.number = mhfApplication.ACH_Account_Number.substr( -4 );
					bankUpdate.accounts[ 0 ].numbers.account = mhfApplication.ACH_Account_Number;
					bankUpdate.accounts[ 0 ].numbers.routing = mhfApplication.ACH_Routing_number;
					bankUpdate.accounts[ 0 ].numbers.wire_routing = mhfApplication.ACH_Routing_number;
					return UserBankAccount.update( { id: userbankaccount.id }, bankUpdate )
					.then( ( updated ) => {
						userbankaccount = updated[ 0 ];
					} );
				} );
			}
			userbankaccount = {
				accounts: [ {
					balance: 0,
					institution_type: null,
					meta: { limit: null, name: "Plaid Checking", number: mhfApplication.ACH_Account_Number.substr( -4 ), official_name: "" },
					numbers: { account: mhfApplication.ACH_Account_Number, account_id: "", routing: mhfApplication.ACH_Routing_number, wire_routing: mhfApplication.ACH_Routing_number },
					subtype: "checking",
					type: "depository"
				} ],
				accessToken: "",
				institutionName: "",
				institutionType: null,
				user: mhfApplication.user,
				screentracking: mhfApplication.screentracking,
				item_id: "",
				transactions: {},
				access_token: "",
				transavail: 0,
				bankfilloutmanually: 1,
				repullstatus: 0,
				isDeleted: false
			};
			return UserBankAccount.create( userbankaccount )
			.then( ( created ) => {
				userbankaccount = created;
				return MHFImportApplication.update( { id: mhfApplication.id }, { userbankaccount: userbankaccount.id } )
				.then( ( updated ) => {
					mhfApplication = updated[ 0 ];
				} );
			} );
		} )
		.then( () => {
			return Promise.resolve()
			.then( () => {
				if( mhfApplication.account != null ) {
					return Account.findOne( { id: mhfApplication.account } )
					.then( ( _account ) => {
						account = _account;
						const accountUpdate = {
							accountNumberLastFour: userbankaccount.accounts[ 0 ].meta.number,
							routingNumber: userbankaccount.accounts[ 0 ].numbers.routing,
							accountNumber: userbankaccount.accounts[ 0 ].numbers.account,
							accountType: userbankaccount.accounts[ 0 ].type,
							accountSubType: userbankaccount.accounts[ 0 ].subtype,
							user: mhfApplication.user,
							userBankAccount: userbankaccount.id
						};
						return Account.update( { id: account.id }, accountUpdate )
						.then( ( updated ) => {
							account = updated[ 0 ];
						} );
					} );
				}
				account = {
					balance: { available: 0, current: 0, limit: "" },
					institutionType: null,
					accountName: "Plaid Checking",
					accountNumberLastFour: userbankaccount.accounts[ 0 ].meta.number,
					routingNumber: userbankaccount.accounts[ 0 ].numbers.routing,
					accountNumber: userbankaccount.accounts[ 0 ].numbers.account,
					accountType: userbankaccount.accounts[ 0 ].type,
					accountSubType: userbankaccount.accounts[ 0 ].subtype,
					user: mhfApplication.user,
					userBankAccount: userbankaccount.id,
					type: "ACH",
					isDeleted: false,
					storyavail: 0
				};
				return Account.create( account )
				.then( ( created ) => {
					account = created;
					return MHFImportApplication.update( { id: mhfApplication.id }, { account: account.id } )
					.then( ( updated ) => {
						mhfApplication = updated[ 0 ];
					} );
				} )
				.then( () => {
					return Screentracking.update( { id: mhfApplication.screentracking }, { accounts: account.id, lastlevel: 3 } );
				} );
			} );
		} )
		.catch( ( err ) => {
			sails.log.error( "createUserBankAccount; catch:", err );
		} );
	}
}


function confirmUserSetPassword( req, res ) {
	const reqParams = req.allParams();
	const userId = _.get( reqParams, "id", null );
	if( ! userId ) {
		return res.redirect( "/login" );
	}
	const templateData = {
		user: null
	};
	User.findOne( { id: userId, salt: null, password: null } )
	.then( ( user ) => {
		if( user == undefined ) {
			return res.redirect( "/login" );
		}
		templateData.user = user;
		templateData.email = user.email;
		return res.view( "frontend/home/confirmsetpassword", templateData );
	} );
}


function confirmUserSetPasswordPost( req, res ) {
	const Promise = require( "bluebird" );
	const reqParams = req.allParams();
	const userId = _.get( reqParams, "id", null );
	const last4 = req.param( "ssn" );

	if( ! userId ) {
		return res.badRequest( { code: 400, message: "Bad Request" } );
	}
	User.findOne( { id: userId, salt: null, password: null } )
	.then( ( user ) => {
		if( ( user.ssn_number.length != 9 ) || ( user.ssn_number.slice( 5 ) != last4 ) ) {
			throw new Error( "The social security number is not recognized" );
		}
		return user;
	} )
	.then( ( user ) => {
		if( user == undefined ) {
			return res.badRequest( { code: 400, message: "Bad Request" } );
		}
		user.salt = User.generateSalt();
		user.password = _.get( reqParams, "password", null );
		return User.generateEncryptedPassword( user, user.salt )
		.then( ( encryptedPassword ) => {
			const userUpdate = {
				salt: user.salt,
				password: encryptedPassword,
				isEmailVerified: true
			};
			return User.update( { id: user.id }, userUpdate )
			.then( ( updated ) => {
				req.session.userId = updated[ 0 ].id;
				req.session.practiceId = updated[ 0 ].practicemanagement;
				user = updated[ 0 ];
				return;
			} );
		} )
		.then( () => {
			return Screentracking.findOne( { user: user.id, iscompleted: 0 } )
			.then( ( screentracking ) => {
				return Infotable.findOne( { level: screentracking.lastlevel } )
				.then( ( infotable ) => {
					passport.authenticate( "user-local", function( err, userinfo, info ) {
						if( err || ! userinfo ) {
							req.session.errormsg = "Invalid Username and Password";
							return res.badRequest( { code: 400, message: req.session.errormsg } );
						}
						req.logIn( userinfo, function( err ) {
							if( err ) {
								return res.badRequest( { code: 400, message: err.message } );
							}
							return res.json( { code: 200, redirect: infotable.routename } );
						} );
					} )( req, res );
				} );
			} );
		} );
	} )
	.catch( ( err ) => {
		return res.json( { code: 400, message: err.message } );
	});
}

function continueApplicationPost( req, res ) {
	const reqParams = req.allParams();
	const userId = _.get( reqParams, "id", null );
	if( ! userId ) {
		sails.log.error( "continueApplicationPost; missing id:", reqParams );
		return res.badRequest( { code: 400, message: "Bad Request" } );
	}
	User.findOne( { id: userId, salt: null, password: null } )
	.then( ( user ) => {
		if( user == undefined ) {
			sails.log.error( "continueApplicationPost; user not found:", userId );
			return res.badRequest( { code: 400, message: "Bad Request" } );
		}
		return EmailService.continueApplicationEmail( { toEmail: user.email, bccEmails: [], userId: user.id, name: user.firstname, practicemanagement: user.practicemanagement, user: user } );
	} )
	.then( () => {
		return res.json( { success: true } );
	} );
}


function saveloanoffer( req, res ) {
	res.contentType( "application/json" );
	// var fullOffer= JSON.parse(req.param('fullOffer'));

	const screenid = req.param( "screenid" );
	const loanId = req.param( "loanId" );

	const userDetails = { id: req.session.userId };
	const lastlevel = 4;

	Screentracking.findOne( { id: screenid } )
	.populate( "user" )
	.then( ( screentracking ) => {
		if( ! screentracking ) {
			const err = new Error( `Screentracking: document not found by id: ${screenid}` );
			// sails.log.error( "ApplicationController.saveloanofferAction; Screentracking.findOne() error:", err );
			return Promise.reject( err );
		}
		// const offers = screentracking.offers;
		const loanIdx = ( parseInt( loanId ) );
		const selectedOffer = screentracking.offers[ loanIdx ];
		// const selectedOffer = {};
		// for( let idx = 0; idx < offers.length; idx++ ) {
		// 	if( offers[ idx ].loanID == loanid ) {
		// 		offer = offers[ idx ];
		// 		break;
		// 	}
		// }

		// offer.downpayment = 1500; // FIXME: Downpayment will be calculated when the offers are generated.
		/* this is weird stuff.  We are translating a patientfi offer into loantopia offerdata object */
		// selectedOffer.downpayment = offer.downpayment;
		// selectedOffer.loanId = offer.loanID;
		// selectedOffer.apr = offer.apr.toString();
		// selectedOffer.payment = offer.monthpayment;
		// selectedOffer.financedAmount = offer.financedAmount;
		// selectedOffer.financedAmount = offer.finalrequestedloanamount;
		// selectedOffer.interestRate = offer.interestRate.toString();
		// selectedOffer.loanTerm = offer.loanTerm.toString();
		// // selectedOffer.contractDate = new Date( parseInt( offer.LoanSetup.contractDate.replace( /[^\d]/g, "" ) ) * 1000 );
		// // selectedOffer.firstPaymentDate = new Date( parseInt( offer.LoanSetup.firstPaymentDate.replace( /[^\d]/g, "" ) ) * 1000 );
		// selectedOffer.paymentFrequency = "loan.frequency." + offer.paymentfreq;
		// selectedOffer.financeCharge = offer.interestfeeamount;
		// selectedOffer.totalOfPayments = ( selectedOffer.financedAmount + parseInt( offer.interestfeeamount ) ).toString();
		// selectedOffer.state = screentracking.user.state;
		return Screentracking.updateLastScreenName( userDetails, "Contract", lastlevel, "", "", "", [ selectedOffer ] );
	} )
	.then( ( screenTracking ) => {
		req.session.levels = lastlevel;
		return res.json( { "success": true } );
	} )
	.catch( ( err ) => {
		sails.log.error( "ApplicationController#saveloanofferAction :: err :", err );
		return res.handleError( err );
	} );
}

function createloandetails( req, res ) {
	var userId = req.session.userId;
	// sails.log.info( "JH ApplicationController.js createloandetails userId", userId );

	Screentracking.findOne( { user: userId, iscompleted: 0 } )
	.sort( "createdAt DESC" )
	.then( ( screentracking ) => {
		var creditscore = screentracking.creditscore;
		//sails.log.info('screentracking---- : ', screentracking);
		return User.findOne( { id: userId } )
		.then( ( userDetails ) => {
			//sails.log.info('userDetails ',userDetails);
			return PaymentManagement.createLoanPaymentSchedule( screentracking )
			.then( ( paymentDetails ) => {
				if( paymentDetails == "" || paymentDetails == null || "undefined" == typeof paymentDetails ) {
					return;
				}
				req.session.levels = 5;
				screentracking.lastlevel = 5;
				screentracking.lastScreenName = "Finalize";
				return screentracking.save()
				.then( ( updated ) => {
					return User.update( { id: screentracking.user }, { isExistingLoan: true } )
					.then( ( userupdated ) => {
						//badlist update in payment
						if( userupdated[ 0 ].badList == 1 ) {
							PaymentManagement.update( { id: paymentDetails.id }, { blockedList: ( screentracking.blockedList == true ? true : false ) } ).exec( ( err, updated ) => {} );
						} else {
							PaymentManagement.update( { id: paymentDetails.id }, { blockedList: false } ).exec( ( err, updated ) => {} );
						}
						// return Transunions.findOne( { id: screentracking.transunion } )
						// .then( ( userres ) => {
						return PaymentManagement.update( { id: paymentDetails.id }, { creditScore: creditscore } )
						.then( ( userupdated ) => {
							return Achdocuments.find( { user: screentracking.user } )
							.then( ( AchdocumentsDetails ) => {
								if ( "undefined" !== typeof AchdocumentsDetails && AchdocumentsDetails != "" && AchdocumentsDetails != null ) {
									const promiseAll = [];
									AchdocumentsDetails.forEach( ( achDoc ) => {
										promiseAll.push( Achdocuments.update( { user: screentracking.user }, { paymentManagement: paymentDetails.id } ) );
									} );
									return Promise.all( promiseAll );
								}
								return Achdocuments.find( { paymentManagement: screentracking.id } )
								.then( ( AchdocumentsDetails ) => {
									if ( "undefined" == typeof AchdocumentsDetails || AchdocumentsDetails == "" || AchdocumentsDetails == null ) {
										return;
									}
									const promiseAll = [];
									AchdocumentsDetails.forEach( ( achDoc ) => {
										promiseAll.push( Achdocuments.update( { paymentManagement: screentracking.id }, { paymentManagement: paymentDetails.id } ) );
									} );
									return Promise.all( promiseAll );
								} );
							} );
						} );
					// } );
					} );
				} );
			} );
		} )
		.then( () => {
			req.session.levels = 5;
			screentracking.lastlevel = 5;
			return screentracking.save()
			.then( () => {
				return res.redirect( "/finalize" );
			} );
		} )
	} )
	.catch( ( err ) => {
		sails.log.error( "ApplicationController#addconsolidateAction :: err", err );
		return res.handleError( err );
	} );
}

function finalize( req, res ) {
	const userId = req.session.userId;
	let errorval = "";
	let successval = "";
	let emailSent = "";
	let emailerr = "";

	if( ! userId ) {
		return res.view( "frontend/banktransaction/finalize" );
	}

	errorval = ( req.session.errorval != "" ? req.session.errorval : "" );
	successval = ( req.session.successval != "" ? req.session.successval : "" );
	emailSent = ( req.session.emailSent != "" ? req.session.emailSent : "" );
	req.session.errorval = "";
	req.session.successval = "";
	req.session.emailSent = "";

	if( req.session.emailerr != "" ) {
		emailerr = req.session.emailerr;
		req.session.emailerr = "";
	}

	User.findOne( { id: userId } )
	.then( ( userData ) => {
		return Achdocuments.find( { user: userId } )
		.populate( "proofdocument" )
		.then( function( achDocs ) {
			var emailAddress = userData.email;

			const docuploaded = {
				emailVer: userData.isEmailVerified,
				govIDDoc: false,
				payrollDoc: false,
				payroll2Doc: false,
				utilityDoc: false,
				debitCardDoc: false,
				voidCheckDoc: false,
				isBankAdded: userData.isBankAdded
			};

			var documenttype = {
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

			let prevDate1;
			let prevDate2;
			let prevDate3;
			let prevDate4;
			let prevDate5;
			let prevDate6;

			achDocs.forEach( ( documentvalue ) => {
				if( documentvalue.proofdocument.isImageProcessed ) {
					sails.log.info( "documentvalue", documentvalue );
					if( documenttype.documenttype1 == documentvalue.docname ) { // doctype is govID
						if( documentimage.documentimage1 != "") { // already found one image
							if( prevDate1 < documentvalue.createdAt ) { // get the lastest upload to display
								documentimage.documentimage1 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
								prevDate1 = documentvalue.createdAt;
							}
						} else { // no previous image found
							documentimage.documentimage1 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
							prevDate1 = documentvalue.createdAt;
							docuploaded.govIDDoc = true;
							sails.log.info("docuploaded.govIdDoc", docuploaded.govIdDoc);
						}
					} else if( documenttype.documenttype2 == documentvalue.docname ) { // doctype is payroll1
						if( documentimage.documentimage2 != "") { // already found one image
							if( prevDate2 < documentvalue.createdAt ) { // get the lastest upload to display
								documentimage.documentimage2 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
								prevDate2 = documentvalue.createdAt;
							}
						} else{ // haven't found image
							documentimage.documentimage2 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
							prevDate2 = documentvalue.createdAt;
							docuploaded.payrollDoc = true;
						}
					} else if( documenttype.documenttype3 == documentvalue.docname ) { // doctype is payroll2
						if( documentimage.documentimage3 != "") { // already found one image
							if( prevDate3 < documentvalue.createdAt ) { // get the lastest upload to display
								documentimage.documentimage3 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
								prevDate3 = documentvalue.createdAt;
							}
						} else{ // haven't found image
							documentimage.documentimage3 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
							prevDate3 = documentvalue.createdAt;
							docuploaded.payroll2Doc = true;
						}
					} else if( documenttype.documenttype4 == documentvalue.docname ) { // doctype is utility bill
						if( documentimage.documentimage4 != "") { // already found one image
							if( prevDate4 < documentvalue.createdAt ) { // get the lastest upload to display
								documentimage.documentimage4 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
								prevDate4 = documentvalue.createdAt;
							}
						} else { // haven't found image
							documentimage.documentimage4 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
							prevDate4 = documentvalue.createdAt;
							docuploaded.utilityDoc = true;
						}
					} else if( documenttype.documenttype5 == documentvalue.docname ) { // doctype is debit card
						if( documentimage.documentimage5 != "") { // already found one image
							if( prevDate5 < documentvalue.createdAt ) { // get the lastest upload to display
								documentimage.documentimage5 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
								prevDate5 = documentvalue.createdAt;
							}
						} else { // haven't found image
							documentimage.documentimage5 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
							prevDate5 = documentvalue.createdAt;
							docuploaded.debitCardDoc = true;
						}
					} else if( documenttype.documenttype6 == documentvalue.docname ) { // doctype is void check
						if( documentimage.documentimage6 != "") { // already found one image
							if( prevDate6 < documentvalue.createdAt ) { // get the lastest upload to display
								documentimage.documentimage6 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
								prevDate6 = documentvalue.createdAt;
							}
						} else{ // haven't found image
							documentimage.documentimage6 = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
							prevDate6 = documentvalue.createdAt;
							docuploaded.voidCheckDoc = true;
						}
					} else { // doctype others
						documentvalue.proofdocument.standardResolution = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
						otherdocuments.push( documentvalue );
						sails.log.info( "otherdocuments ", otherdocuments );
					}
				}
			} );

			let todocount = 0;
			if( ! docuploaded.emailVer ) ++todocount;
			if( ! docuploaded.isBankAdded ) ++todocount;
			if( ! docuploaded.govIDDoc ) ++todocount;
			if( ! docuploaded.payrollDoc ) ++todocount;
			if( ! docuploaded.payroll2Doc ) ++todocount;
			if( ! docuploaded.utilityDoc ) ++todocount;
			if( ! docuploaded.debitCardDoc ) ++todocount;
			if( ! docuploaded.voidCheckDoc ) ++todocount;

			return PaymentManagement.findOne( { user: userId } )
			.then( function( paymentData ) {
				return Screentracking.findOne( { user: userId } )
				.sort( { createdAt: -1 } )
				.then( function( screendata ) {
					let oboToken = "";
					return finalizeValidateInternal( userId )
					.then( ( validationError ) => {
						const tplData = {
							emailAddress: emailAddress,
							docuploaded: docuploaded,
							todocount: todocount,
							user: userData,
							paymentmanagementdata: paymentData,
							screentrackingdetails: screendata,
							achDocs: achDocs,
							errorval: errorval,
							successval: successval,
							documenttype: documenttype,
							documentimage: documentimage,
							otherdocuments: otherdocuments,
							emailSent: emailSent,
							emailerr: emailerr,
							pciwalletToken: ( userData.hasOwnProperty( "pciwalletToken" ) ? userData.pciwalletToken : null ),
							oboToken: oboToken,
							mobileOptedIn: ( userData.hasOwnProperty( "mobileOptedIn" ) ? userData.mobileOptedIn : false ),
							numberIsMobile: ( userData.hasOwnProperty( "phoneIsMobile" ) ? userData.phoneIsMobile : false ),
							mobileNumber: ( userData.hasOwnProperty( "phoneNumber" ) ? userData.phoneNumber : "" ),
							validated: ( validationError == null ),
							screentrackingid: screendata.id,
							iscompleted: screendata.iscompleted
						};
						return res.view( "frontend/banktransaction/finalize", tplData );
					} );
				} );
			} );
		} );
	} )
	.catch( ( err ) => {
		sails.log.error( "ApplicationController#finalizeAction err:", err );
		return res.handleError( err );
	} );
}

function finalizeValidateInternal( userId ) {
	return User.findOne( { id: userId } )
	.then( ( userData ) => {
		/* check for email address */
		if( !userData.email || userData.email.length == 0 ) {
			return "Email Address is required.";
		}

		/* check that email has been validated */
		if( !userData.isEmailVerified ) {
			return "Email has not been verified.";
		}

		/* check for phone  */
		if( !userData.phoneNumber || userData.phoneNumber.length == 0 ) {
			return "Mobile phone is required.";
		}

		/* check that phone is validated */
		if( !userData.isPhoneVerified ) {
			return "Mobile phone has not been verified.";
		}

		return null;
	} )
	.catch( () => {
		return "Failed to find user.";
	} );
}

function finalizeValidate( req, res ) {
	const userId = req.session.userId;
	return finalizeValidateInternal( userId )
	.then( ( err ) => {
		const json = {};
		if( err ) {
			json.status = 400;
			json.error = err;
		} else {
			json.status = 200;
		}
		res.contentType( "application/json" );
		return res.status( json.status ).json( json );
	} );
}

function submitApplicationButton( req, res ) {
	const userid = req.param( "userid" );

	// then change status in paymentmanagement from INCOMPLETE -> PENDING && lastlevel in screentracking from 6 -> 7
	User.findOne( { id: userid } )
	.then( function( userData ) {
		return Screentracking.findOne( { $and: [ { user: userid }, { iscompleted: { $ne: 2 } } ] } )
		.then( function( screentrackingData ) {
			screentrackingData.lastlevel = 6;
			screentrackingData.iscompleted = 1;
			screentrackingData.save( function( err ) {
				if( err ) {
					sails.log.info( "JH UserController.js submitApplicationButtonAction screentrackingData.save err: ", err );
					return res.redirect( "/admin/error/500.nunjucks" );
				}
				screentrackingData.iscompleted = 1;
				return res.redirect( "/thankyou" );
			} );
			return PaymentManagement.findOne( { screentracking: screentrackingData.id } )
			.then( function( paymentmanagementData ) {
				paymentmanagementData.status = "PENDING";
				paymentmanagementData.achstatus = 0;
				paymentmanagementData.save( function( err ) {
					if( err ) {
						sails.log.info( "JH UserController.js submitApplicationButtonAction paymentmanagementdata.save err: ", err );
						return res.redirect( "/finalize" );
					}
				} );
			} );
		} );
	} );
}

async function thankyou( req, res ) {
	const userId = req.session.userId;
	const practiceId = req.session.practiceId;

	const practiceInfo = await PracticeManagement.findOne( { id: practiceId } );
	sails.log.info( req.session );

	return res.view( "frontend/banktransaction/thankyou", practiceInfo );
}
