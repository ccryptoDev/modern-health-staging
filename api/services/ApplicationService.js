/* global sails, Transunionhistory, User, Screentracking, Esignature, Agreement, UserBankAccount, Utils, ProductRules, MathExt, ApplicationService, Agreement, PracticeManagement, UserConsent, EmploymentHistory, PaymentManagement*/
"use strict";

const _ = require( "lodash" );
const request = require( "request" );
const Q = require( "q" );
const moment = require( "moment" );

require( "request-debug" )( request );
const fs = require( "fs" );
const xml2js = require( "xml2js" );
// const https = require( "https" );
const pdf = require( "html-pdf" );
const path = require( "path" );
// const to_json = require( "xmljson" ).to_json;
const in_array = require( "in_array" );
// var parseString = require('xml2js').parseString;
// var xmlbuilder = require('xmlbuilder');

module.exports = {
	createcertificate: createcertificate,
	getProductRule: getProductRule,
	getProductNameByscore: getProductNameByscore,
	getProductRulesValue: getProductRulesValue,
	updateApplicationDetails: updateApplicationDetails,
	checkRuleCondition: checkRuleConditionAction,
	reGeneratepromissorypdf: reGeneratepromissorypdfAction,
	getNewProductRule: getNewProductRule,
	getPromissoryNoteData: getPromissoryNoteData,
	getPaymentFrequency: getPaymentFrequency,
	getContractPaymentSchedule:getContractPaymentSchedule,
	getProductRuleBanking: getProductRuleBanking,
	createEFTA: createEFTA
};

async function getContractPaymentSchedule(screentracking,originalScheduleStartDate, offerData) {
	
	const today = moment().startOf("day");
	if(!screentracking || !offerData || offerData.length <= 0) {
		throw new Error("Unable to get contract payment schedule. Missing offer and application data.")
	}
		// paySchedule = await SmoothPaymentService.generatePaymentSchedule(
		// 		today,
		// 		scheduledStartDate,
		// 		screentracking.requestedLoanAmount,
		// 		SmoothPaymentService.paymentFrequencyEnum.BI_WEEKLY,
		// 		"daily based",
		// 		offerData.interestRate.toFixed(2) / 100,
		// 		offerData.term
		// );
	
		// if(screentracking.isAChangeSchedule) {
		// 	const paymentManagement = await PaymentManagement.findOne({screentracking: screentracking.id});
		// 	if(paymentManagement) {
		// 		let nextPaymentScheduleAfterChange = null;
		// 		let lastScheduleItemMade = null;
		// 		for(let scheduleItem of paymentManagement.paymentSchedule) {
		// 			if(["PAID", "WAIVED"].indexOf(scheduleItem.status) >= 0 && moment(scheduleItem.date).startOf("day").isSameOrBefore(today)) {
		// 				lastScheduleItemMade = scheduleItem;
		// 			}
		// 			if(["OPEN", "OPENED"].indexOf(scheduleItem.status) >= 0 && moment(scheduleItem.date).startOf("day").isSameOrAfter(today)) {
		// 				nextPaymentScheduleAfterChange = scheduleItem;
		// 			}
		// 		}
		// 		if(nextPaymentScheduleAfterChange && lastScheduleItemMade) {
		// 			const ledger = PlatformSpecificService.getPaymentLedger(paymentManagement, today);
		// 			if(ledger && ledger.principalPayoff) {
		// 				// SmoothPaymentService.generatePaymentSchedule(Orig_date, scheduled_date, beg_balance, pay_cycle, method, apr, numberOfPayments, placeDateAfterHoliday = false)
		// 				paymentScheduleObj = await SmoothPaymentService.generatePaymentSchedule(moment(lastScheduleItemMade).startOf("day").toDate(), moment(nextPaymentScheduleAfterChange).startOf("day").toDate(),
		// 						ledger.principalPayoff, SmoothPaymentService.paymentFrequencyEnum.BI_WEEKLY, "daily based", $ize($ize(offerData[0].apr) / 100), offerData[0].term);
		// 				if(paymentScheduleObj && paymentScheduleObj.paymentSchedule && paymentScheduleObj.paymentSchedule.length > 0) {
		// 					return paymentScheduleObj;
		// 					// screentracking["totalPaymentsFeeChargedAmount"] = paySchedule.total_fee_charge
		// 					// let totalPaymentAmount = 0
		// 					// for(let payment of paySchedule.paymentSchedule){
		// 					// 	totalPaymentAmount += payment.amount
		// 					// }
		// 				}
		// 			}
		// 		}
		// 	}
		// }
	
	let paymentScheduleObj = await SmoothPaymentService.generatePaymentSchedule(
			today,
			originalScheduleStartDate,
			screentracking.requestedLoanAmount,
		   screentracking.paymentFrequency ||	SmoothPaymentService.paymentFrequencyEnum.BI_WEEKLY,
			"daily based",
			((offerData[0].apr) / 100),
			offerData[0].term,
			1,
		screentracking.isAfterHoliday || 0
	);
	return paymentScheduleObj;
}


async function createcertificate( address, transactionControl, certificate, userArray, ssn_number, user, reqdata, leadLogTimeTrack = "" ) {
	const transunion = sails.config.transunion;
	const pAddress = Utils.parseStreetAddress( `${[ user.street, user.unitapt ].join( " " ).trim()}, ${user.city}, ${user.state} ${user.zipCode}` );
	let userScreentracking;
	if( user ) {
		await Screentracking.findOne({ user: user.id })
			.then((screentracking) => {
				userScreentracking = screentracking;
			});
		const subjectRecord = {
			indicative: {
				name: { person: { first: user.firstname, middle: user.middlename, last: user.lastname, generationalSuffix: user.generationCode } },
				address: {
					status: "current",
					street: { number: pAddress.number, preDirectional: pAddress.prefix, name: pAddress.street, type: pAddress.type, unit: { type: pAddress.sec_unit_type, number: pAddress.sec_unit_num } },
					location: { city: user.city, state: user.state, zipCode: user.zipCode }
				},
				socialSecurity: { number: user.ssn_number },
				dateOfBirth: user.dateofBirth
			},
			addOnProduct: transunion.addOnProduct
		};
		const productData = {
			code: transunion.productCode,
			subject: { number: "1", subjectRecord: subjectRecord },
			responseInstructions: { returnErrorText: "true", document: null, embeddedData: "pdf" },
			permissiblePurpose: { inquiryECOADesignator: "individual" }
		};
		const requestData = {
			document: "request",
			version: transunion.version,
			transactionControl: transactionControl,
			product: productData
		};
		const userData = {
			name: subjectRecord.indicative.name.person,
			email: user.email,
			street: subjectRecord.indicative.address.street,
			city: user.city,
			state: user.state,
			zipCode: user.zipCode,
			ssn_number: ssn_number,
			dob: user.dateofBirth
		};

		return Transunionhistory.create( { user: user.id, requestdata: { userData: userData, requestData: requestData }, status: 0 } )
		.then( function( transunionhistory ) {
			return new Promise( ( resolve ) => {
				request.debug = false;
				const builder = new xml2js.Builder();
				const xmldata = builder.buildObject( requestData )
				.replace( /\n|\r|\s/g, "" )
				.replace( '<?xmlversion="1.0"encoding="UTF-8"standalone="yes"?><root>', '<?xml version="1.0" encoding="UTF-8"?><creditBureau xmlns="http://www.transunion.com/namespace" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.transunion.com/namespace">' )
				.replace( "</root>", "</creditBureau>" );
				const reqOpts = {
					url: transunion.baseUrl,
					method: "POST",
					cert: fs.readFileSync( path.join( sails.config.appPath, certificate.crtPath ) ),
					key: fs.readFileSync( path.join( sails.config.appPath, certificate.keyPath ) ),
					passphrase: certificate.password,
					rejectUnauthorized: false,
					headers: { "Content-Type": "text/xml" },
					body: xmldata
				};
				fs.appendFileSync( `logs/transunion/${user.id}.txt`, `Request: ${transunion.baseUrl}\n${xmldata}\n` );
				request( reqOpts, ( err, response, body ) => {
					if( err ) {
						sails.log.error( "request.error:", err );
						fs.appendFileSync( `logs/transunion/${user.id}.txt`, `Error:\n${JSON.stringify( err )}\n\n` );
						transunionhistory.responsedata = err;
						transunionhistory.status = 2;
						return resolve( { code: 400, message: "Could not retrieve your credit details" } );
					}
					if( response.statusCode != 200 ) {
						sails.log.error( "request.response:", response.statusCode, response.statusMessage );
						fs.appendFileSync( `logs/transunion/${user.id}.txt`, `Error:${response.statusCode} ${response.statusMessage}\n${body}\n\n` );
						transunionhistory.responsedata = body;
						transunionhistory.status = 2;
						return resolve( { code: 400, message: "Could not retrieve your credit details" } );
					}
					fs.appendFileSync( `logs/transunion/${user.id}.txt`, `Response:\n${body}\n\n` );
					return resolve( { code: 200, body: body } );
				} );
			} )
			.then( ( response ) => {
				return Promise.resolve()
				.then( () => {
					if( response.code == 200 ) {
						return new Promise( ( resolve ) => {
							const parser = new xml2js.Parser( { charkey: "_val", explicitArray: false, mergeAttrs: true } );
							parser.parseString( response.body, async function( err, creditReport ) {
								if( err ) {
									transunionhistory.responsedata = err;
									transunionhistory.status = 3;
									return transunionhistory.save()
									.then( () => resolve( { code: 500, error: err } ) );
								}
								const error = _.get( creditReport, "creditBureau.product.error", null );
								if( error ) {
									transunionhistory.responsedata = error;
									transunionhistory.status = 3;
									return transunionhistory.save()
									.then( () => resolve( { code: 500, error: error } ) );
								}
								transunionhistory.responsedata = creditReport;
								transunionhistory.status = 1;

								const pdfFilePath = path.join( sails.config.appPath, "logs/transunion", `${user.id}.pdf` );
								await Promise.resolve()
								.then( async () => {
									const creditBureau = transunionhistory.responsedata.creditBureau;
									const pdfString = _.get( creditBureau, "product.embeddedData._" );
									if( pdfString ) {
										const pdfBytes = Buffer.from( pdfString, "base64" );
										fs.writeFileSync( pdfFilePath, pdfBytes );
										const pdfFileName = `TransUnion_CreditReport.pdf`;
										const s3Path = `Agreements/${user.userReference}/${userScreentracking.applicationReference}/${pdfFileName}`;
										await UserConsent.create( {
											documentName: 'TransUnion_CreditReport',
											documentKey: "07000",
											documentVersion: '1',
											phoneNumber: user.phoneNumber,
											user: user.id,
											screenid: screentracking.id,
											agreementpath: s3Path
										} );
										await S3Service.uploadFileToS3( { filePath: pdfFilePath, s3Path } );
									}
								} )
								.finally( () => {
									fs.unlink( pdfFilePath, () => {} );
								} );


								return transunionhistory.save()
								.then( () => resolve( { code: 200, creditReport: creditReport } ) );
							} );
						} );
					}
					return transunionhistory.save()
					.then( () => response );
				} )
				.then( ( result ) => {
					if( result.code !== 200 ) {
						return result;
					}
					sails.log.info( "creditReport:", JSON.stringify( result.creditReport ) );
					return Promise.resolve()
					.then( () => {
						const ssn_number = _.get( result, "creditReport.creditBureau.product.subject.subjectRecord.indicative.socialSecurity.number", user.ssn_number );
						if( user.ssn_number !== ssn_number ) {
							user.ssn_number = ssn_number;
							return User.update( { id: user.id }, { ssn_number: user.ssn_number } );
						}
					} )
					.then( () => {
						return { code: 200, message: "Transunion data for customer fetched successfully.", resultdata: result.creditReport, ssnNumberTrans: user.ssn_number };
					} );
				} );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "ApplicationService#createcertificate::Err ::", err );
			return { code: 400, message: "Could not retrieve your credit details" };
		} );
	} else {
		return Promise.resolve( { code: 400, message: "Invalid user details. Try again!" } );
	}
}

function getAccountRating( code ) {
	//const code = _.get( trade, "accountRating", "" );
	switch( code ) {
		case "01": // Paid as agreed
		case "02": // 30 days past due
		   return false

		case "03": // 60 days past due
		case "04": // 90 days past due
		case "05": // 120 days past due
		case "07": // Wage earner or similar plan
		case "08": //Reposession
		case "8A": // Voluntary surrender
		case "8P": //Payment after reposession
		case "09": // Charged off as bad debt
		case "9P": //Payment after charge-off
		case "UR":// Unrated or bankruptcy

			return true;
	}
	return false;

}

async function getProductRule( creditReport, transunion_score, practiceId, screentrackingId ) {
	if( !practiceId ) {
		throw new Error( "BRACKEN!!!, Tell Rod what you just did to get here." );
	}

	const applyRule = function( rule ) {
		switch( rule.declinedif ) {
			case "gt":
				if( rule.value == 0 ) {
					rule.requiredrelation = "=";
				} else {
					rule.requiredrelation = "<=";
				}
				if( rule.userValue > rule.value ) {
					rule.passed = false;
					rule.actualrelation = ">";
				} else {
					rule.passed = true;
					rule.actualrelation = "<=";
				}
				break;
			case "lt":
				rule.requiredrelation = ">=";
				if( rule.userValue < rule.value ) {
					rule.passed = false;
					rule.actualrelation = "<";
				} else {
					rule.passed = true;
					rule.actualrelation = ">=";
				}
				break;
			case "gte":
				rule.requiredrelation = "<";
				if( rule.userValue >= rule.value ) {
					rule.passed = false;
					rule.actualrelation = ">=";
				} else {
					rule.passed = true;
					rule.actualrelation = "<";
				}
				break;
			case "lte":
				rule.requiredrelation = ">";
				if( rule.userValue <= rule.value ) {
					rule.passed = false;
					rule.actualrelation = "<=";
				} else {
					rule.passed = true;
					rule.actualrelation = ">";
				}
				break;
			default:
				throw new Error( `${rule.declinedif} is not a supported rule operator` );
		}
		return rule.passed;
	};

	const getdatacountstring = function( rule ) {
		return `${ rule.ruleid.toUpperCase()}: ${ rule.description}: ${ rule.userValue}`;
	};

	const getrulesetstring = function( rule ) {
		const rule1valExactCond = ApplicationService.checkRuleCondition( rule.declinedif );
		return `${ rule.ruleid.toUpperCase()}: ${ rule.description} ${rule1valExactCond} ${rule.value} then decline`;
	};

	const executeRule = function( rule, userValue, definition, userdata, declined ) {
		rule.userValue = userValue;
		if( !Number.isInteger( userValue ) ) {
			rule.value = parseFloat( rule.value );
		}
		const rulemsg = getrulesetstring( rule );

		const rulestatus = applyRule( rule );
		if( !rulestatus ) {
			declined.push( rulemsg );
		}
		userdata.push( getdatacountstring( rule ) );
		definition.push( rulemsg );
		return rulestatus;
	};

	try {
		const ruledetails = await ApplicationService.getProductRulesValue( sails.config.product.productid, practiceId );
		const rules = ruledetails.rules;
		sails.log.info( "creditReport.rules", rules );
		let rule1status = true;
		let rule2status = true;
		let rule3status = true;
		let rule4status = true;
		let rule5status = true;
		let rule6status = true;
		let rule7status = true;
		let rule8status = true;
		let rule9status = true;
		let rule10status = true;
		let rule11status = true;
		let rule12status = true;
		let rule13status = true;
		let rule14status = true; // new rule
		let rule15status = true;



		const ruledatacount = [];
		const declinedrulemsg = [];
		const ruleset = [];

		if( rules.rule1 ) {
			// Rule === R1: Months of Credit History  (Month) < 12 then decline
			let userValue = 0;
			const inFileSinceDate = _.get( creditReport, "product.subject.subjectRecord.fileSummary.inFileSinceDate._val", null );
			if( inFileSinceDate ) {
				userValue = moment().startOf( "day" ).diff( moment( inFileSinceDate, "YYYY-MM-DD" ).startOf( "day" ), "months" );
				sails.log.verbose( "getProductRule; [R1] history:", inFileSinceDate, rules.rule1.userValue );
			}

			rule1status = executeRule( rules.rule1, userValue, ruleset, ruledatacount, declinedrulemsg );
		}

		const r2_trades = [];
		if( rules.rule2 ) {
			// Rule === R2: Total Number of active trade lines < 1 then decline
			let userValue = 0;
			// const r2_trades = [];

			let transunion_credit_trade = _.get( creditReport, "product.subject.subjectRecord.custom.credit.trade", [] );
			if( transunion_credit_trade && !Array.isArray( transunion_credit_trade ) ) {
				transunion_credit_trade = [ transunion_credit_trade ];
			}

			if( transunion_credit_trade ) {
				// const ecoaIgnore = [ "authorizeduser", "undesignated", "cosigner", "primary", "terminated", "deceased" ];
				const ecoaIgnore = [ "authorizeduser", "deceased" ];
				const industryIgnore = [ "M" ];
				const accountIgnore = [ "ST", "SC"];
				const goodRatings = [ "01" ];
				_.forEach( transunion_credit_trade, ( tradeline ) => {
					if( industryIgnore.indexOf( `${_.get( tradeline, "subscriber.industryCode", "-" )}`.toUpperCase().substr( 0, 1 ) ) >= 0 ) {
						return;
					}
					if( accountIgnore.indexOf( `${_.get( tradeline, "account.type", "-")}`.toUpperCase().substr( 0, 2) ) >= 0 ){
						return;
					}
					if( ecoaIgnore.indexOf( tradeline.ECOADesignator.toLowerCase() ) >= 0 ) {
						return;
					}
					const accountRating = _.get( tradeline, "accountRating", null );
					if( !( goodRatings.indexOf( accountRating ) >= 0 ) ) {
						return;
					}
					// closed date is within 6 months
					const closedDate = ( _.get( tradeline, "dateClosed.val", null ) != null )
					if (closedDate) {
						var months = Math.abs(moment( dateEffective, "YYYY-MM-DD" ).startOf( "day" ).diff( moment().startOf( "day" ), "months" ));
						if (months > 6) { // greater than 6? return
							return;
						}
					}
					// paidout date is within 6 months
					const PaidOutDate = ( _.get( tradeline, "datePaidOut.val", null ) != null )
					if( PaidOutDate ) {
						var months = Math.abs(moment( dateEffective, "YYYY-MM-DD" ).startOf( "day" ).diff( moment().startOf( "day" ), "months" ));
						if (months > 6) { // greater than 6? return
							return;
						};
					}
					// date is effective within 6 months?
					const dateEffective = _.get( tradeline, "dateEffective._val", null )
					if (dateEffective) {
						var months = Math.abs(moment( dateEffective, "YYYY-MM-DD" ).startOf( "day" ).diff( moment().startOf( "day" ), "months" ));
						if (months > 6) { // greater than 6? return
							return;
						}
					}

					r2_trades.push( tradeline );
				} );
				userValue = r2_trades.length;
			}
			sails.log.verbose( "getProductRule; [R2] trades:", JSON.stringify( r2_trades ) );

			rule2status = executeRule( rules.rule2, userValue, ruleset, ruledatacount, declinedrulemsg );
		}

		if( rules.rule3 ) {
			// Rule3=== Number of revolving trade lines

			// let transunion_credit_trade = _.get( creditReport, "product.subject.subjectRecord.custom.credit.trade", [] );
			// if( transunion_credit_trade && !Array.isArray( transunion_credit_trade ) ) {
			// 	transunion_credit_trade = [ transunion_credit_trade ];
			// }

			// if( transunion_credit_trade ) {
			// 	_.forEach( transunion_credit_trade, ( tradeline ) => {
			// 		r2_trades.push( tradeline );
			// 	} );
			// }

			const r3_trades = [];
			const accountIgnore = [ "ST", "SC"];

			_.forEach( r2_trades, ( tradeline ) => {
				// keep credit limit filter above 600
				if( `${_.get( tradeline, "portfolioType", null )}`.toLowerCase() == "revolving" ) {
					const creditLimit = parseInt( _.get( tradeline, "creditLimit", "0" ) );
					if( creditLimit < 600 ) {
						return;
					}
				}
				// filter Effective Date is within 6
				const dateEffective = _.get( tradeline, "dateEffective._val", null )
				if (dateEffective) {
					var months = Math.abs(moment( dateEffective, "YYYY-MM-DD" ).startOf( "day" ).diff( moment().startOf( "day" ), "months" ));
					if (months > 6) { // greater than 6? return
						return;
					}
				}
				if( accountIgnore.indexOf( `${_.get( tradeline, "account.type", "-")}`.toUpperCase().substr( 0, 2) ) >= 0 ){
					return;
				}
				r3_trades.push( tradeline );
			} );
			sails.log.verbose( "getProductRule; [R3] trades:", JSON.stringify( r3_trades ) );
			rule3status = executeRule( rules.rule3, r3_trades.length, ruleset, ruledatacount, declinedrulemsg );
		}

		if( rules.rule4 ) {
			// Rule4 === # Inquiries in last 6 months > 8 then decline
			let userValue = 0;
			const inquirystartdate = moment().subtract( 6, "months" ).format( "YYYY-MM-DD" );
			let rule4counter = 0;
			// -- Ticket 2731 (disable the Inquiry Rule (R4))
			let transunion_credit_inquiry = "";
			if( creditReport.product.subject.subjectRecord.custom ) {
				// if( creditReport.product.subject.subjectRecord.custom.credit.trade ) {
				// 	transunion_credit_trade = creditReport.product.subject.subjectRecord.custom.credit.trade;
				// }
				if( creditReport.product.subject.subjectRecord.custom.credit.inquiry ) {
					transunion_credit_inquiry = creditReport.product.subject.subjectRecord.custom.credit.inquiry;
				}
			}

			if( transunion_credit_inquiry ) {
				let inquiryRecord_data;
				const inquiryRecord = transunion_credit_inquiry;
				if( ! Array.isArray( inquiryRecord ) ) {
					inquiryRecord_data = [];
					inquiryRecord_data.push( inquiryRecord );
				} else {
					inquiryRecord_data =inquiryRecord;
				}
				let apiinquiryresstartdate = "";
				_.forEach( inquiryRecord_data, function( value, key ) {
					if( value.date ) {
						apiinquiryresstartdate = value.date._val;
						if( apiinquiryresstartdate >= inquirystartdate ) {
							rule4counter = parseInt( rule4counter ) + 1;
						}
					}
				} );
				userValue = parseInt( rule4counter );
			}
			rule4status = executeRule( rules.rule4, userValue, ruleset, ruledatacount, declinedrulemsg );
		}

		if( rules.rule5 ) {
			// Rule === R5: Bankruptcy in last 24 months > 0 then decline
			let userValue = 0;
			const bankruptcystartdate = moment().subtract( 24, "months" ).format( "YYYY-MM-DD" );
			let publicRecord = _.get( creditReport, "product.subject.subjectRecord.custom.credit.publicRecord", [] );
			if( publicRecord && ! Array.isArray( publicRecord ) ) {
				publicRecord = [ publicRecord ];
			}
			let collections = _.get( creditReport, "product.subject.subjectRecord.custom.credit.collection", [] );
			if( collections && ! Array.isArray( collections ) ) {
				collections = [ collections ];
			}
			if( publicRecord.length > 0 || collections.length > 0 ) {
				let rule5counter = 0;
				const bankruptcytype = sails.config.applicationConfig.bankruptcytype;

				_.forEach( publicRecord, function( value, key ) {
					if( value.type ) {
						let bankruptcy_date;
						const bankruptcy_type = value.type;
						if( value.dateFiled._val != "" && value.dateFiled._val != null && "undefined" !== typeof value.dateFiled._val ) {
							bankruptcy_date = value.dateFiled._val;
						} else {
							bankruptcy_date = value.dateFiled;
						}

						if( bankruptcy_date >= bankruptcystartdate && in_array( bankruptcy_type, bankruptcytype ) ) {
							rule5counter = parseInt( rule5counter ) + 1;
						}
					}
				} );

				userValue = parseInt( rule5counter );
			}
			rule5status = executeRule( rules.rule5, userValue, ruleset, ruledatacount, declinedrulemsg );
		}

		if( rules.rule6 ) {
			// R6: Foreclosure in last 12 months > 0 then decline
			let userValue = 0;
			const forclosurestartdate = moment().subtract( 12, "months" ).format( "YYYY-MM-DD" );
			let publicRecord = _.get( creditReport, "product.subject.subjectRecord.custom.credit.publicRecord", [] );
			if( publicRecord && ! Array.isArray( publicRecord ) ) {
				publicRecord = [ publicRecord ];
			}
			let collections = _.get( creditReport, "product.subject.subjectRecord.custom.credit.collection", [] );
			if( collections && ! Array.isArray( collections ) ) {
				collections = [ collections ];
			}
			if( publicRecord.length > 0 || collections.length > 0 ) {
				let rule6counter = 0;
				const forclosuretype = sails.config.applicationConfig.forclosuretype;
				_.forEach( publicRecord, function( value, key ) {
					if( value.type ) {
						let forclosure_date;
						const forclosure_type = value.type;
						if( value.dateFiled._val != "" && value.dateFiled._val != null && "undefined" !== typeof value.dateFiled._val ) {
							forclosure_date = value.dateFiled._val;
						} else {
							forclosure_date = value.dateFiled;
						}
						if( forclosure_date >= forclosurestartdate && in_array( forclosure_type, forclosuretype ) ) {
							rule6counter = parseInt( rule6counter ) + 1;
						}
					}
				} );
				userValue = parseInt( rule6counter );
			}
			rule6status = executeRule( rules.rule6, userValue, ruleset, ruledatacount, declinedrulemsg );
		}

		let rule7counter = 0;
		if( rules.rule7 ) {
			// R7: # public records in last 24 months > 2 then decline
			let userValue = 0;
			const publicrecordstartdate = moment().subtract( 24, "months" ).format( "YYYY-MM-DD" );
			let publicRecord = _.get( creditReport, "product.subject.subjectRecord.custom.credit.publicRecord", [] );
			if( publicRecord && ! Array.isArray( publicRecord ) ) {
				publicRecord = [ publicRecord ];
			}
			let collections = _.get( creditReport, "product.subject.subjectRecord.custom.credit.collection", [] );
			if( collections && ! Array.isArray( collections ) ) {
				collections = [ collections ];
			}
			if( publicRecord.length > 0 || collections.length > 0 ) {
				_.forEach( publicRecord, function( value, key ) {
					let publicrecord_date;
					// var publicrecord_date = value.dateFiled;
					if( value.dateFiled._val != "" && value.dateFiled._val != null && "undefined" !== typeof value.dateFiled._val ) {
						publicrecord_date = value.dateFiled._val;
					} else {
						publicrecord_date = value.dateFiled;
					}

					if( publicrecord_date >= publicrecordstartdate ) {
						rule7counter = parseInt( rule7counter ) + 1;
					}
				} );
				_.forEach( collections, ( collection ) => {
					const currentBalance = parseInt( _.get( collection, "currentBalance", 0 ) );
					// sails.log.verbose( "UW R7;", currentBalance, JSON.stringify( collection ) );
					if( currentBalance > 0 ) {
						++rule7counter;
					}
				} );
				userValue = parseInt( rule7counter );
			}
			rule7status = executeRule( rules.rule7, userValue, ruleset, ruledatacount, declinedrulemsg );
		}
		rule7counter = parseInt(rule7counter);

		if( rules.rule8 ) {
			// R8: # 30+ day past due occurrences w/in 24 months > 4 then decline
			let userValue = 0;
			const enddate = moment().format( "YYYY-MM-DD" );
			let transunion_credit_trade = _.get( creditReport, "product.subject.subjectRecord.custom.credit.trade", [] );
			if( transunion_credit_trade && !Array.isArray( transunion_credit_trade ) ) {
				transunion_credit_trade = [ transunion_credit_trade ];
			}

			if( transunion_credit_trade ) {
				let transunion_credit_trade_data;
				if( !Array.isArray( transunion_credit_trade ) ) {
					transunion_credit_trade_data = [];
					transunion_credit_trade_data.push( transunion_credit_trade );
				} else {
					transunion_credit_trade_data = transunion_credit_trade;
				}

				let rule8counter = 0;
				let paymentstartDate24 = "";
				let paymenttext24 = "";
				_.forEach( transunion_credit_trade_data, function( value, key ) {
					if( value.paymentHistory ) {
						if( value.paymentHistory.paymentPattern ) {
							paymentstartDate24 = value.paymentHistory.paymentPattern.startDate._val;
							paymenttext24 = value.paymentHistory.paymentPattern.text;
							let monthdiffer = moment( paymentstartDate24 ).diff( enddate, "months" );
							monthdiffer = Math.abs( monthdiffer );
							if( monthdiffer < 24 && monthdiffer >= 0 ) {
								const charcnt = 24 - parseInt( monthdiffer );
								if( charcnt > 0 ) {
									if( paymenttext24.indexOf( "2" ) > -1 || paymenttext24.indexOf( "K" ) > -1 || paymenttext24.indexOf( "G" ) > -1 || paymenttext24.indexOf( "L" ) > -1 ) {
										rule8counter = parseInt( rule8counter ) + 1;
									}
								}
							}
						}
					}
				} );

				sails.log.info( "rules.rule8.value", rules.rule8.value );
				sails.log.info( "rule8counter", rule8counter );

				userValue = parseInt( rule8counter );
			}
			rule8status = executeRule( rules.rule8, userValue, ruleset, ruledatacount, declinedrulemsg );
		}

		if( rules.rule9 ) {
			// R9: # 60+ days past due in past 6 months > 1 then decline
			let userValue = 0;
			const enddate = moment().format( "YYYY-MM-DD" );
			let transunion_credit_trade = _.get( creditReport, "product.subject.subjectRecord.custom.credit.trade", [] );
			if( transunion_credit_trade && !Array.isArray( transunion_credit_trade ) ) {
				transunion_credit_trade = [ transunion_credit_trade ];
			}

			if( transunion_credit_trade ) {
				let transunion_credit_trade_data;
				if( !Array.isArray( transunion_credit_trade ) ) {
					transunion_credit_trade_data = [];
					transunion_credit_trade_data.push( transunion_credit_trade );
				} else {
					transunion_credit_trade_data = transunion_credit_trade;
				}
				let rule9counter = 0;

				let paymentstartDate60 = "";
				let paymenttext60 = "";
				_.forEach( transunion_credit_trade_data, function( value, key ) {
					if( value.paymentHistory ) {
						if( value.paymentHistory.paymentPattern ) {
							paymentstartDate60 = value.paymentHistory.paymentPattern.startDate._val;
							paymenttext60 = value.paymentHistory.paymentPattern.text;
							let monthdiffer = moment( paymentstartDate60 ).diff( enddate, "months" );
							monthdiffer = Math.abs( monthdiffer );

							if( monthdiffer < 6 && monthdiffer >= 0 ) {
								const charcnt = 6 - parseInt( monthdiffer );
								if( charcnt > 0 ) {
									if( paymenttext60.indexOf( "3" ) > -1 || paymenttext60.indexOf( "K" ) > -1 || paymenttext60.indexOf( "G" ) > -1 || paymenttext60.indexOf( "L" ) > -1 ) {
										rule9counter = parseInt( rule9counter ) + 1;
									}
								}
							}
						}
					}
				} );
				/* sails.log.info('rules.rule9.value',rules.rule9.value);
									sails.log.info('rule9counter',rule9counter);*/
				userValue = parseInt( rule9counter );

			}
			rule9status = executeRule( rules.rule9, userValue, ruleset, ruledatacount, declinedrulemsg );
		}

		if( rules.rule10 ) {
			// rule 10
			let userValue = parseFloat( 0 );
			const utilizationstartdate = moment().subtract( 6, "months" ).format( "YYYY-MM-DD" );
			let transunion_credit_trade = _.get( creditReport, "product.subject.subjectRecord.custom.credit.trade", [] );
			if( transunion_credit_trade && !Array.isArray( transunion_credit_trade ) ) {
				transunion_credit_trade = [ transunion_credit_trade ];
			}

			if( transunion_credit_trade ) {
				let transunion_credit_trade_data;
				if( !Array.isArray( transunion_credit_trade ) ) {
					transunion_credit_trade_data = [];
					transunion_credit_trade_data.push( transunion_credit_trade );
				} else {
					transunion_credit_trade_data = transunion_credit_trade;
				}

				let portfolioType = "";
				let currentBalance = 0;
				let ECOADesignator = "";
				let dateEffective = "";
				let total_revolving_creditLimit = 0;
				let total_revolving_balance = 0;
				let creditLimit = "";

				_.forEach( transunion_credit_trade_data, function( value, key ) {
					if( value.portfolioType ) {
						portfolioType = value.portfolioType;
					}
					if( value.currentBalance ) {
						currentBalance = parseFloat( value.currentBalance );
					}
					if( value.hasOwnProperty( "dateClosed" ) ) {
						return;
					}
					if( value.ECOADesignator ) {
						ECOADesignator = value.ECOADesignator;
					}
					if( value.creditLimit ) {
						creditLimit = parseFloat( value.creditLimit );
					}
					if( value.dateEffective ) {
						dateEffective = value.dateEffective._val;
					}
					if( portfolioType == "revolving" && dateEffective > utilizationstartdate && ( ECOADesignator !== "jointContractLiability" && ECOADesignator !== "authorizedUser" && ECOADesignator !== "terminated" ) ) {
						if( creditLimit > 0 ) {
							total_revolving_creditLimit += creditLimit;
							if( currentBalance > 0 ) {
								total_revolving_balance += currentBalance;
							}
						}
					}
				} );
				userValue = parseFloat( total_revolving_creditLimit == 0 ? 0 : parseFloat( total_revolving_balance ) / parseFloat( total_revolving_creditLimit ) );
			}
			rule10status = executeRule( rules.rule10, userValue, ruleset, ruledatacount, declinedrulemsg );
		}

		if( rules.rule11 ) {
			let userValue = 0;
			if( transunion_score ) {
				userValue = transunion_score;
			}
			rule11status = executeRule( rules.rule11, userValue, ruleset, ruledatacount, declinedrulemsg );
		}

		if( rules.rule12 ) {
			// R12: ISA Income share > 20 then decline
			const userValue = await getExistingISAPercent( screentrackingId, rules.rule12.value );
			rule12status = executeRule( rules.rule12, userValue, ruleset, ruledatacount, declinedrulemsg );
		}

		if(rules.rule13){
			// R13: User specified income <= 1500 then decline
			let userValue = await getUserSpecifiedIncome(screentrackingId);
			rule13status = executeRule(rules.rule13, userValue, ruleset, ruledatacount, declinedrulemsg);
		}

		sails.log.info("=========================================== rule 14 =================================")
		
		let rule14counter = 0;
		if (rules.rule14) {
			// var rule9Num;
			// var rule7Num;

			// // R7: # public records in last 24 months > 2 then decline

			// const publicrecordstartdate = moment().subtract( 24, "months" ).format( "YYYY-MM-DD" );
			// let publicRecord = _.get( creditReport, "product.subject.subjectRecord.custom.credit.publicRecord", [] );
			// if( publicRecord && ! Array.isArray( publicRecord ) ) {
			// 	publicRecord = [ publicRecord ];
			// }
			// let collections = _.get( creditReport, "product.subject.subjectRecord.custom.credit.collection", [] );
			// if( collections && ! Array.isArray( collections ) ) {
			// 	collections = [ collections ];
			// }
			// if( publicRecord.length > 0 || collections.length > 0 ) {
			// 	let rule7counter = 0;
			// 	_.forEach( publicRecord, function( value, key ) {
			// 		let publicrecord_date;
			// 		// var publicrecord_date = value.dateFiled;
			// 		if( value.dateFiled._val != "" && value.dateFiled._val != null && "undefined" !== typeof value.dateFiled._val ) {
			// 			publicrecord_date = value.dateFiled._val;
			// 		} else {
			// 			publicrecord_date = value.dateFiled;
			// 		}

			// 		if( publicrecord_date >= publicrecordstartdate ) {
			// 			rule7counter = parseInt( rule7counter ) + 1;
			// 		}
			// 	} );
			// 	_.forEach( collections, ( collection ) => {
			// 		const currentBalance = parseInt( _.get( collection, "currentBalance", 0 ) );
			// 		// sails.log.verbose( "UW R7;", currentBalance, JSON.stringify( collection ) );
			// 		if( currentBalance > 0 ) {
			// 			++rule7counter;
			// 		}
			// 	} );
			// 	rule7Num = parseInt( rule7counter );
			// }

			// // R9: # 60+ days past due in past 6 months > 1 then decline

			// const enddate = moment().format( "YYYY-MM-DD" );
			// let transunion_credit_trade = _.get( creditReport, "product.subject.subjectRecord.custom.credit.trade", [] );
			// if( transunion_credit_trade && !Array.isArray( transunion_credit_trade ) ) {
			// 	transunion_credit_trade = [ transunion_credit_trade ];
			// }

			// if( transunion_credit_trade ) {
			// 	let transunion_credit_trade_data;
			// 	if( !Array.isArray( transunion_credit_trade ) ) {
			// 		transunion_credit_trade_data = [];
			// 		transunion_credit_trade_data.push( transunion_credit_trade );
			// 	} else {
			// 		transunion_credit_trade_data = transunion_credit_trade;
			// 	}
			// 	let rule9counter = 0;

			// 	let paymentstartDate60 = "";
			// 	let paymenttext60 = "";
			// 	_.forEach( transunion_credit_trade_data, function( value, key ) {
			// 		if( value.paymentHistory ) {
			// 			if( value.paymentHistory.paymentPattern ) {
			// 				paymentstartDate60 = value.paymentHistory.paymentPattern.startDate._val;
			// 				paymenttext60 = value.paymentHistory.paymentPattern.text;
			// 				let monthdiffer = moment( paymentstartDate60 ).diff( enddate, "months" );
			// 				monthdiffer = Math.abs( monthdiffer );

			// 				if( monthdiffer < 6 && monthdiffer >= 0 ) {
			// 					const charcnt = 6 - parseInt( monthdiffer );
			// 					if( charcnt > 0 ) {
			// 						if( paymenttext60.indexOf( "3" ) > -1 || paymenttext60.indexOf( "K" ) > -1 || paymenttext60.indexOf( "G" ) > -1 || paymenttext60.indexOf( "L" ) > -1 ) {
			// 							rule9counter = parseInt( rule9counter ) + 1;
			// 						}
			// 					}
			// 				}
			// 			}
			// 		}
			// 	} );
			// 	/* sails.log.info('rules.rule9.value',rules.rule9.value);
			// 						sails.log.info('rule9counter',rule9counter);*/
			// 	rule9Num = parseInt( rule9counter );
			// }



			// R14: Number of Derogatory Active Trades--> Changed to Count Active Trades Opened in 4 Years with acctRating >= 3
			let userValue = 0;
			const r14trade = [];
			let transunion_credit_trade = _.get( creditReport, "product.subject.subjectRecord.custom.credit.trade", [] );

			// let user_id =(await Screentracking.findOne({id: screentrackingId})).user; //Screentracking.findOne({id: screentrackingId})

			// let createdAt =(await Transunionhistory.findOne({user: user_id}).sort( { createdAt: -1 } )).createdAt;// use sort to get recent one

			if( transunion_credit_trade && !Array.isArray( transunion_credit_trade ) ) {
				transunion_credit_trade = [ transunion_credit_trade ];
			}

			if( transunion_credit_trade ) {
				let transunion_credit_trade_data;
				if( !Array.isArray( transunion_credit_trade ) ) {
					transunion_credit_trade_data = [];
					transunion_credit_trade_data.push( transunion_credit_trade );
				} else {
					transunion_credit_trade_data = transunion_credit_trade;
				}

				const ecoaIgnore = [ "authorizeduser", "deceased" ];
				const industryIgnore = [ "M" ];
				const accountIgnore = [ "ST" ];
				const ratingIgnore = [ "01", "UR" ];
				_.forEach( transunion_credit_trade_data, function( value, key ) {

					if( industryIgnore.indexOf( `${_.get( value, "subscriber.industryCode", "-" )}`.toUpperCase().substr( 0, 1 ) ) >= 0 ) {
						return;
					}
					if( accountIgnore.indexOf( `${_.get( value, "account.type", "-")}`.toUpperCase().substr( 0, 2) ) >= 0 ){
						return;
					}
					if( ecoaIgnore.indexOf( value.ECOADesignator.toLowerCase() ) >= 0 ) {
						return;
					}
					const accountRating = _.get( value, "accountRating", null );
					if( ( ratingIgnore.indexOf( accountRating ) >= 0 ) ) {
						return;
					}
					r14trade.push( value );

					// const dateOpened = _.get(value,"dateOpened._val",null);

					// const yearsOpened = moment(createdAt).diff(moment(dateOpened),'years',true)

					// const getActive = _.get( value, "dateClosed", null );

					//sails.log.info("=============== accountRating: ",value.accountRating,"createdAt",createdAt,"opened",dateOpened ," yearsOpened: ", yearsOpened," closed ",getActive);

					// if( getAccountRating(value.accountRating) && yearsOpened <=4 && getActive==null) {

					// 	r14counter += 1

					// 	}
				} );
				userValue = r14trade.length;
				rule14counter = r14trade.length;

			rule14status = executeRule(rules.rule14, userValue, ruleset, ruledatacount, declinedrulemsg);

			}
		}


			// 	if ((rule7Num != null) && (rule9Num != null)) {
			// 		var temp = [];
			// 		rule14status = executeRule(rules.rule14, rule7Num, ruleset, ruledatacount, temp) && executeRule(rules.rule14, rule9Num, ruleset, ruledatacount, temp);
			// 		if (temp.length > 0) {
			// 			declinedrulemsg.push(temp[0]);
			// 		}
			// 	}

			// }

		sails.log.info('=======================Rule 15==================');

		if (rules.rule15) {

			/*

			// R7: # public records in last 24 months > 2 then decline

			const publicrecordstartdate = moment().subtract( 24, "months" ).format( "YYYY-MM-DD" );
			let publicRecord = _.get( creditReport, "product.subject.subjectRecord.custom.credit.publicRecord", [] );
			if( publicRecord && ! Array.isArray( publicRecord ) ) {
				publicRecord = [ publicRecord ];
			}
			let collections = _.get( creditReport, "product.subject.subjectRecord.custom.credit.collection", [] );
			if( collections && ! Array.isArray( collections ) ) {
				collections = [ collections ];
			}


			if( publicRecord.length > 0 || collections.length > 0 ) {
				//let rule7counter = 0;
				_.forEach( publicRecord, function( value, key ) {
					let publicrecord_date;
					// var publicrecord_date = value.dateFiled;
					if( value.dateFiled._val != "" && value.dateFiled._val != null && "undefined" !== typeof value.dateFiled._val ) {
						publicrecord_date = value.dateFiled._val;
					} else {
						publicrecord_date = value.dateFiled;
					}

					if( publicrecord_date >= publicrecordstartdate ) {
						rule7counter = parseInt( rule7counter ) + 1;
					}
				} );
				_.forEach( collections, ( collection ) => {
					const currentBalance = parseInt( _.get( collection, "currentBalance", 0 ) );
					// sails.log.verbose( "UW R7;", currentBalance, JSON.stringify( collection ) );
					if( currentBalance > 0 ) {
						++rule7counter;
					}
				} );
			}

			// R14: Count Active Trades Opened in 4 Years with acctRating >= 3

			let transunion_credit_trade = _.get( creditReport, "product.subject.subjectRecord.custom.credit.trade", [] );

			let user_id =(await Screentracking.findOne({id: screentrackingId})).user; //Screentracking.findOne({id: screentrackingId})

			let createdAt =(await Transunionhistory.findOne({user: user_id})).createdAt;// use sort to get recent one


			if( transunion_credit_trade && !Array.isArray( transunion_credit_trade ) ) {
				transunion_credit_trade = [ transunion_credit_trade ];
			}

			if( transunion_credit_trade ) {
				let transunion_credit_trade_data;
				if( !Array.isArray( transunion_credit_trade ) ) {
					transunion_credit_trade_data = [];
					transunion_credit_trade_data.push( transunion_credit_trade );
				} else {
					transunion_credit_trade_data = transunion_credit_trade;
				}

				//let r14counter = 0;

				_.forEach( transunion_credit_trade_data, function( value, key ) {

					//sails.log.info("===========",value.accountRating);


					const dateOpened = _.get(value,"dateOpened._val",null);

					const yearsOpened = moment(createdAt).diff(moment(dateOpened),'years',true)

					const getActive = _.get( value, "dateClosed", null );

					if( getAccountRating(value.accountRating) && yearsOpened <=4 && getActive!=null) {

						rule14counter += 1

						}
				} );


			}

			// Rule 15: to add Rule 7 and Rule 14
			*/
			let r15counter = rule7counter + rule14counter;

			sails.log.info('=======',' rule7Num',rule7counter,' r14Num',rule14counter,' r15counter',r15counter);

		    rule15status = executeRule(rules.rule15, r15counter, ruleset, ruledatacount, declinedrulemsg);

		}


		let loanstatus;
		if( rule1status && rule2status && rule3status && rule4status && rule5status && rule6status && rule7status && rule8status && rule9status && rule10status && rule11status && rule12status && rule13status && rule14status ) {
			loanstatus = "Approved";
		} else {
			loanstatus = "Denied";
		}

		const rulesdata = {
			code: 200,
			r1: rule1status ? 0: 1,
			r2: rule2status ? 0: 1,
			r3: rule3status ? 0: 1,
			r4: rule4status ? 0: 1,
			r5: rule5status ? 0: 1,
			r6: rule6status ? 0: 1,
			r7: rule7status ? 0: 1,
			r8: rule8status ? 0: 1,
			r9: rule9status ? 0: 1,
			r10: rule10status ? 0: 1,
			r11: rule11status ? 0: 1,
			r12: rule12status ? 0: 1,
			r13: rule13status ? 0: 1,
			r14: rule14status ? 0: 1,
			r15: rule15status ? 0: 1,
			loanstatus: loanstatus,
			approvedrulemsg: ruleset,
			declinedrulemsg: declinedrulemsg,
			ruledata: rules,
			ruledatacount: ruledatacount,
			version: ruledetails.version
		};
		return rulesdata;
	} catch ( err ) {
		sails.log.error( "ApplicationService#getProductRule::Err ::", err );
		return null;
	}
}

async function getUserSpecifiedIncome(screentrackingId){
	return Screentracking.findOne({id: screentrackingId})
		.then(function(screenDetail){
			return screenDetail.incomeamount;
		});
}


function getProductNameByscore( creditscore ) {
	return Q.promise( function( resolve, reject ) {
		/* Productlist.find()
		 .then(function(productdata){

			var productselctid='';
			var forlength = productdata.length;
			var counter=0;
			var productname = '';

			//sails.log.info("forlength ", forlength);

			productdata.forEach(function(productval,loopvalue){

				var minscore = parseInt(productval.mincreditscore);
				var maxscore = parseInt(productval.maxcreditscore);

				if(creditscore >= minscore && creditscore <= maxscore)
				{
					productselctid = productval.id;
					productname = productval.productname;
				}else{
					if(creditscore >= sails.config.product.minCreditScore) {
						productselctid = sails.config.product.productid;
						productname = 'CA High Risk';
					} else {
						productselctid = '';
						productname = '';
					}
				}
				counter++;
				if(counter==forlength){

					  var productdatadetails = {
							productid: productselctid,
							productname:productname,
					  };
					  sails.log.info("productdatadetails ", productdatadetails);
					  return resolve(productdatadetails);

				}
			});


		})
		.catch(function (err) {
		  if(err){
			return resolve({
				  code: 403,
				  message: 'Unable to fetch transunion details. Try again!'
			});
		  }
		});	*/

		// return resolve(rulesdata);

		if( creditscore >= sails.config.product.minCreditScore ) {
			var productselctid = sails.config.product.productid;
			var productname = "CA High Risk";
		} else {
			var productselctid = "";
			var productname = "";
		}
		const productdatadetails = {
			productid: productselctid,
			productname: productname
		};
		sails.log.info( "productdatadetails ", productdatadetails );
		return resolve( productdatadetails );
	} );
}
async function getProductRulesValue( productid, practiceId ) {
	try {
		const rulecriteria = {
			product: productid,
			practicemanagement: practiceId,
			isDeleted: false
		};

		let ruledetails = await ProductRules.findOne( rulecriteria ).sort( { id: 1 } );
		if( !ruledetails ) {
			await PracticeManagement.createPartnerRules( practiceId, productid );
			ruledetails = await ProductRules.findOne( rulecriteria ).sort( { id: 1 } );
		} else {
			ruledetails = await PracticeManagement.updatePartnerRules( ruledetails );
		}

		const toDelete = [];
		_.forOwn( ruledetails.rules, ( rule, rulename ) => {
			if( rule.disabled ) {
				toDelete.push( rulename );
			}
		} );

		toDelete.forEach( ( rulename ) => {
			delete ruledetails.rules[ rulename ];
		} );
		return ruledetails;
	} catch ( err ) {
		return {
			code: 403,
			message: "Unable to fetch the rules details. Try again!"
		};
	}
}


function updateApplicationDetails( addressarray, transactionControl, certificate, userArray, ssn_number, userDetail, reqdata, creditReportData, leadLogTimeTrack = "", newScreenTrackingData = {} ) {
	return Q.promise( function( resolve, reject ) {
		Transunionhistory.findOne( { user: userDetail.id } )
		.sort( "createdAt DESC" )
		.then( function( transunionhistoryData ) {
			const creditReport = transunionhistoryData.responsedata.creditBureau;
			//const createdAt= transunionhistoryData.createdAt//
			const transError = transunionhistoryData.responsedata.error;
			if( transError ) {
				return Screentracking.findOne( { user: userDetail.id, iscompleted: 0 } )
				.then( ( screentracking ) => {
					return resolve(
						{
							code: 202,
							screenTracking: screentracking,
							deniedmessage: `Application assigned to tier G due to: ${screentracking.transError.errortext} (Error code: ${screentracking.transError.errorcode})`
						}
					);
				} );
			} else if( creditReport ) {
				if( creditReport.product.error ) {
					return Screentracking.findOne( { user: userDetail.id, iscompleted: 0 } )
					.then( ( screentracking ) => {
						return resolve(
							{
								code: 202,
								screenTracking: screentracking,
								deniedmessage: `Application assigned to tier G due to: ${creditReport.product.error.description}`
							}
						);
					} );
				} else {
					// sails.log.info("custom: ",creditReport.product.subject.subjectRecord.custom);

					var transunion_first_name = "";
					var transunion_middle_name = "";
					var transunion_last_name = "";
					var transunion_address = "";
					var transunion_socialSecurity_number = "";
					var transunion_employment = "";
					var transunion_credit_trade = "";
					var transunion_credit_collection = "";
					var transunion_credit_inquiry = "";
					var transunion_scrore = "";
					var transunion_addOnProduct = "";
					var transunion_employment_data = [];
					var transunion_address_data = []
					var transunion_credit_trade_data = [];
					var transunion_credit_inquiry_data = [];
					const fileHitIndicator = _.get( creditReport, "product.subject.subjectRecord.fileSummary.fileHitIndicator", "regularNoHit" );
					const ssnMatchIndicator = _.get( creditReport, "product.subject.subjectRecord.fileSummary.ssnMatchIndicator", "noHit" );
					if(ssnMatchIndicator == "noHit"){
						return Screentracking.findOne( { user: userDetail.id} )
							.then( ( screentracking ) =>  {
								return resolve( { code: 202, screenTracking: screentracking, ssnNoHit: true } );
							} );
					}

					var isNoHit = ( fileHitIndicator == "regularNoHit");


					if( ! isNoHit && creditReport.product.subject.subjectRecord.custom ) {
						if( creditReport.product.subject.subjectRecord.indicative ) {
							if( Array.isArray( creditReport.product.subject.subjectRecord.indicative.name ) ) {
								const creditUserName = creditReport.product.subject.subjectRecord.indicative.name[ 0 ];

								if( creditUserName.person.first ) {
									 transunion_first_name = creditUserName.person.first;
								}

								if( creditUserName.person.middle ) {
									 transunion_middle_name = creditUserName.person.middle;
								}

								if( creditUserName.person.last ) {
									 transunion_last_name = creditUserName.person.last;
								}
							} else {
								if( creditReport.product.subject.subjectRecord.indicative.name.person.first ) {
									 transunion_first_name = creditReport.product.subject.subjectRecord.indicative.name.person.first;
								}

								if( creditReport.product.subject.subjectRecord.indicative.name.person.middle ) {
									 transunion_middle_name = creditReport.product.subject.subjectRecord.indicative.name.person.middle;
								}

								if( creditReport.product.subject.subjectRecord.indicative.name.person.last ) {
									 transunion_last_name = creditReport.product.subject.subjectRecord.indicative.name.person.last;
								}
							}

							if( creditReport.product.subject.subjectRecord.indicative.address ) {
								 transunion_address = creditReport.product.subject.subjectRecord.indicative.address;
							}

							if( Array.isArray( creditReport.product.subject.subjectRecord.indicative.socialSecurity ) ) {
								 transunion_socialSecurity_number = creditReport.product.subject.subjectRecord.indicative.socialSecurity[ 0 ].number;
							} else {
								if( creditReport.product.subject.subjectRecord.indicative.socialSecurity.number ) {
									 transunion_socialSecurity_number = creditReport.product.subject.subjectRecord.indicative.socialSecurity.number;
								}
							}

							if( creditReport.product.subject.subjectRecord.indicative.employment ) {
								 transunion_employment = creditReport.product.subject.subjectRecord.indicative.employment;
							}
						}

							if( creditReport.product.subject.subjectRecord.custom.credit.trade ) {
								 transunion_credit_trade = creditReport.product.subject.subjectRecord.custom.credit.trade;
							}

							if( creditReport.product.subject.subjectRecord.custom.credit.collection ) {
								 transunion_credit_collection = creditReport.product.subject.subjectRecord.custom.credit.collection;
							}

							if( creditReport.product.subject.subjectRecord.custom.credit.inquiry ) {
								 transunion_credit_inquiry = creditReport.product.subject.subjectRecord.custom.credit.inquiry;
							}



						if( creditReport.product.subject.subjectRecord.addOnProduct ) {
							transunion_addOnProduct = creditReport.product.subject.subjectRecord.addOnProduct;

							// sails.log.info("transunion_addOnProduct: ",transunion_addOnProduct);

							if( creditReport.product.subject.subjectRecord.addOnProduct.scoreModel ) {
								if( creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.noScoreReason ) {
									// No Hit  <--- Not necessarily, could be inefficient score

									// return Screentracking.findOne( { user: userDetail.id, iscompleted: 0 } )
									// 	.then( ( screentracking ) =>  {
									// 		return resolve( { code: 202, screenTracking: screentracking } );
									// 	} );

									// return resolve( {
									// 	code: 500,
									// 	message: creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.noScoreReason
									// } );
								} else {
									if( creditReport.product.subject.subjectRecord.addOnProduct.scoreModel ) {
										 transunion_scrore = creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.results;
									} else {
										_.forEach( creditReport.product.subject.subjectRecord.addOnProduct, function( value, key ) {
											if( value.code == "00W18" && value.scoreModel ) {
												transunion_scrore = value.scoreModel.score.results;
											}
										} );
									}
								}
							} else {
								// sails.log.info("addOnProduct-111: ",creditReport.product.subject.subjectRecord.addOnProduct[0]);
								// sails.log.info("addOnProduct-2: ",creditReport.product.subject.subjectRecord.addOnProduct[1].scoreModel);

								if( Array.isArray( creditReport.product.subject.subjectRecord.addOnProduct ) ) {
									// sails.log.info("scoreModel-3: ",creditReport.product.subject.subjectRecord.addOnProduct[1].scoreModel);

									_.forEach( creditReport.product.subject.subjectRecord.addOnProduct, function( value, key ) {
										// sails.log.info("value: ",value.scoreModel);
										// sails.log.info("valuescore: ",value.scoreModel);
										if( value.code == "00W18" && value.scoreModel != "" && value.scoreModel != null && "undefined" !== typeof value.scoreModel ) {
											if( value.scoreModel.score.results != "" && value.scoreModel.score.results != null && "undefined" !== typeof value.scoreModel.score.results ) {
												transunion_scrore = value.scoreModel.score.results;
												// sails.log.info("transunion_scrore: ",transunion_scrore);
											}
										}
									} );
								}
							}
						}



						// sails.log.info("transunion_scrore00000: ",transunion_scrore);

						if( !Array.isArray( transunion_employment ) ) {
							transunion_employment_data.push( transunion_employment );
						} else {
							 transunion_employment_data = transunion_employment;
						}

						if( !Array.isArray( transunion_address ) ) {
							transunion_address_data.push( transunion_address );
						} else {
							 transunion_address_data = transunion_address;
						}

						if( !Array.isArray( transunion_credit_trade ) ) {
							transunion_credit_trade_data.push( transunion_credit_trade );
						} else {
							 transunion_credit_trade_data = transunion_credit_trade;
						}

						if( !Array.isArray( transunion_credit_inquiry ) ) {
							transunion_credit_inquiry_data.push( transunion_credit_inquiry );
						} else {
							transunion_credit_inquiry_data = transunion_credit_inquiry;
						}
					} else {

						transunion_first_name = userDetail.firstname;
						transunion_middle_name = userDetail.middlename;
						transunion_last_name = userDetail.lastname;
						transunion_address_data = userDetail.street;
						transunion_socialSecurity_number = userDetail.ssn_number;
						isNoHit = true;
						transunion_scrore = "0";
					}


					const translogdata = {
						user: userDetail.id,
						response: creditReport,
						first_name: transunion_first_name,
						middle_name: transunion_middle_name,
						last_name: transunion_last_name,
						house_number: transunion_address_data,
						socialSecurity: transunion_socialSecurity_number,
						employment: transunion_employment_data,
						trade: transunion_credit_trade_data,
						credit_collection: transunion_credit_collection,
						inquiry: transunion_credit_inquiry_data,
						addOnProduct: transunion_addOnProduct,
						score: transunion_scrore,
						isNoHit: isNoHit,
						status: 0
					};
						// sails.log.info("transunion_scrore22222: ",transunion_scrore);
						// sails.log.info("translogdata",translogdata);

					let creditscore = transunion_scrore;
					creditscore = parseInt( creditscore.replace( "+", "" ) );

					Transunions.create( translogdata )
					.then( function( transuniondetails ) {
						Consolidateaccount.createconsolidateaccount( transuniondetails )
						.then( function( accdet ) {
							const product = sails.config.product.productid;
							const lastScreenName = "Application";
							const lastlevel = 1;
							const idobj = {
								transid: transuniondetails.id,
								accountid: "",
								rulesDetails: "",
								creditscore: creditscore,
								isNoHit: isNoHit
							};
							const dataObject = {
								addressarray: addressarray,
								userArray: userArray,
								transactionControl: transactionControl,
								certificate: certificate,
								screenTrackingData: newScreenTrackingData
							};

							// sails.log.info("product: ",product);
							Screentracking.createLastScreenName( lastScreenName, lastlevel, userDetail, dataObject, product, idobj )
							.then( function( screenTracking ) {
								const screenTrackingId = screenTracking.id;

								sails.log.info( "screenTrackingId: ", screenTrackingId );
								//
								const updateData = { consolidateaccount: accdet.consolidateaccount.id, applicationType: "Admin create application" };

								sails.log.info( "updateData: ", updateData );

								Screentracking.update( { id: screenTrackingId }, updateData ).exec( function afterwards( err, updated ) {
									sails.log.info( "updated: ", updated );
								} );

								sails.log.info( "product: ", product );

								const productselctid = sails.config.product.productid;
								userDetail.social_number = transunion_socialSecurity_number;
								// Check user with directmail

								if( creditscore >= sails.config.product.minCreditScore ) {
									ApplicationService.getProductRule( creditReport, transunion_scrore, userDetail.practicemanagement, screenTrackingId )
									.then( function( rulesDetails ) {
										const updateData = {
											lastlevel: 2,
											product: productselctid,
											rulesDetails: rulesDetails,
											creditscore: creditscore,
											scoringengine: rulesDetails.scoringInfoid,
											userScore: rulesDetails.userScore,
											residenceType: newScreenTrackingData.residenceType,
											housingExpense: parseFloat( newScreenTrackingData.housingExpense || "0" ),
											incomeamount: parseFloat( newScreenTrackingData.incomeamount || "0" )
										};

										if( rulesDetails.loanstatus == "Denied" ) {
											updateData.lockCreditTier = "G";
										}

										// -- Application approved
										return Screentracking.update( { id: screenTracking.id }, updateData )
										.then( ( updated ) => {
											const responsedata = {
												code: 200,
												message: "Transunion data for customer fetched successfully.",
												transuniondetails: transuniondetails,
												rulesDetails: rulesDetails,
												screenTracking: screenTracking
											};
											return resolve( responsedata );
										} );
									} )
									.catch( function( err ) {
										sails.log.error( "catch:", err );
										// -- Application denied
										// sails.log.info("Enter catch loop:");
										return Screentracking.findOne( { user: userDetail.id, iscompleted: 0 } )
										.then( ( screentracking ) => {
											return resolve(
												{
													code: 202,
													screenTracking: screentracking,
													deniedmessage: `Application assigned to tier G due to: ${err.message}`
												}
											);
										} );
									} );
								} else {
									return Screentracking.findOne( { user: userDetail.id, iscompleted: 0 } )
									.then( ( screentracking ) => {
										if( !creditscore || ( creditscore < 300 ) ) {
											return resolve(
												{
													code: 202,
													screenTracking: screentracking,
													deniedmessage: "Application assigned to tier G due to: patient credit score is unavailable."
												}
											);
										} else {
											return resolve(
												{
													code: 202,
													screenTracking: screentracking,
													deniedmessage: `Application assigned to tier G due to: patient credit score of ${creditscore} is less then the configured minimum of ${sails.config.product.minCreditScore}`
												}
											);
										}
									} );
								}
							} )
							.catch( function( err ) {
								sails.log.error( "ApplicationService#createcertificate::Err ::", err );
								return reject( err );
							} );
						} )
						.catch( function( err ) {
							sails.log.error( "ApplicationService#createcertificate::Err ::", err );
							return reject( err );
						} );
					} )
					.catch( function( err ) {
						sails.log.error( "ApplicationService#createcertificate::Err ::", err );
						return reject( err );
					} );
				}
			} else {
				return Screentracking.findOne( { user: userDetail.id, iscompleted: 0 } )
				.then( ( screentracking ) =>  {
					return resolve( { code: 202, screenTracking: screentracking } );
				} );
				// return resolve( { code: 402, message: "Could not recieve your credit profile!" } );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "ApplicationService#createcertificate::Err ::", err );
			return resolve( {
				code: 402,
				message: "Could not recieve your credit details!"
			} );
		} );
	} );
}

function checkRuleConditionAction( conditionString ) {
	let condition = "";
	if( conditionString == "gt" ) {
		condition = ">";
	} else if( conditionString == "lt" ) {
		condition = "<";
	} else if( conditionString == "gte" ) {
		condition = ">=";
	} else if( conditionString == "lte" ) {
		condition = "<=";
	}
	return condition;
}

/* function reGeneratepromissorypdfAction(payId,userId,reqdata,resdata) {

	return Q.promise(function(resolve, reject) {

	var userid = userId;

		Screentracking
			.findOne({user:userid})
			.sort("createdAt DESC")
			.populate('user')
			.then(function(screentrackingdetails) {

				var applicationReference = screentrackingdetails.applicationReference;
				var userReference = screentrackingdetails.user.userReference;

				//sails.log.info("applicationReference:", applicationReference);
				//sails.log.info("userReference:", userReference);
					var userConsentDoc = {paymentManagement: payId,documentKey:'131'};
					UserConsent.update(userConsentDoc, {loanupdated: 2}).exec(function afterwards(err, updated){

					UserConsent
						.findOne({documentKey:'202',paymentManagement:payId})
						.then(function (userconsent) {

							//sails.log.info("userconsent11111111:", userconsent);

							UserConsent
								.createDuplicateConsent(userconsent,screentrackingdetails.user,userconsent.ip)
								.then(function (userconsentdetails) {

									var payid = userconsent.paymentManagement;
									//sails.log.info("userconsent:", userconsent);
									//sails.log.info("payid:", payid);
									userconsentdetails.paymentManagement = payid;
									userconsentdetails.save();

									var consentID = userconsentdetails.id;
									var userID = screentrackingdetails.user.id;

									UserConsent
									.objectdataRegenerate(userID,reqdata,resdata,payid,userconsent)
									.then(function (objectdatas) {

										   sails.log.info("objectdatas:::::::", objectdatas);
										   sails.log.info("userconsent.agreement:::::::", userconsent.agreement);

											//return false;
											Agreement
											.findOne({id: userconsent.agreement})
											.then(function(agreementDetail) {

														   sails.log.info("agreementDetail:::::::", agreementDetail);

												var replacedFilename = agreementDetail.documentName.split(' ').join('_');

												var pdfFileName ='./'+applicationReference+'_'+replacedFilename+'_'+Math.round(+new Date()/1000)+'.pdf';

												var IPFromRequest = userconsent.ip;
												var indexOfColon = IPFromRequest.lastIndexOf(':');
												var ipaddr = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);
												var signaturecriteria = {user_id: userID};

												//




												.findOne(signaturecriteria)
//													.then(function(signatureDetails) {

													//sails.log.info("signatureDetails:::::::", signatureDetails);

													var fname = objectdatas.fname;
													var lname = objectdatas.lname;
													var loanamaount = objectdatas.amount;
													var interestRateAmount = parseFloat(objectdatas.interestRate*12).toFixed(2);

													var agreementObject = {
													  user : fname,
													  date : moment.utc(new Date()).format(),
													  agreement:agreementDetail,
													};
													//var agreementsignpath = Utils.getS3Url(signatureDetails.standardResolution);

														Transunions
														.findOne({user:userID})
														.then(function(transunionsdetails) {

															var socialnumber = transunionsdetails.response.product.subject.subjectRecord.indicative.socialSecurity.number;
															var socialnumber = socialnumber.replace(/.(?=.{4})/g, 'X');

															sails.log.info("socialnumber:::::::", socialnumber);

															Screentracking
															.findOne({user:userID})
															.sort("createdAt DESC")
															.populate('accounts')
															.populate('plaiduser')
															.populate('transunion')
															.populate('user')
															.then(function(screentrackingdetails) {

																sails.log.info("screentrackingdetails:::::::", screentrackingdetails);
																var accountName = "Installment Loan";
																var accountNumberLastFour = screentrackingdetails.accounts.accountNumberLastFour;
																var loanholderstreetname = screentrackingdetails.user.street;
																var loanholderstreetnumber = screentrackingdetails.user.street;
																var loanholdercity = screentrackingdetails.user.city;
																var loanholderzipcode = screentrackingdetails.user.zipCode;
																var loanstate = screentrackingdetails.user.state;

																if (screentrackingdetails.user.unitapp){
																var unitapp = screentrackingdetails.user.unitapp;
																}else{
																	var unitapp = '';
																	}

																User
																	.findOne({id:userID})
																	.then(function(userdetails) {

																		var addressobj = {
																			accountName:accountName,
																			accountNumberLastFour:accountNumberLastFour,
																			loanholderstreetname:loanholderstreetname,
																			loanholdercity:loanholdercity,
																			loanholderzipcode:loanholderzipcode,
																			phonenumber:userdetails.phoneNumber,
																			loanstate:loanstate,
																			unitapp:unitapp
																		}


															//resdata.view(agreementObject.agreement.documentPath,{ obj:objectdatas, loanamaount:loanamaount,ip :ipaddr, fname:fname,lname:lname,socialnumber:socialnumber,addressobj:addressobj,type:'pdf',interestRateAmount:interestRateAmount});

															var repsonsePdfData= {
																ip:ipaddr,
																userid:userID,
																todaydate:todaydate,
																financedAmount:financedAmount,
																loanTerm:loanTerm,
																scheduleLoanAmount:scheduleLoanAmount,
																checktotalLoanAmount:checktotalLoanAmount,
																creditcost:creditcost,
																screentrackingdetails:screentrackingdetails,
																type:'pdf',
																practiceData:practiceData,
																userData:userData,
																offerData: offerData
														   }


															//resdata.render(agreementObject.agreement.documentPath, { obj:objectdatas, loanamaount:loanamaount,ip :ipaddr, fname:fname,lname:lname,socialnumber:socialnumber,addressobj:addressobj,type:'pdf',interestRateAmount:interestRateAmount}, function(err, list){

											resdata.render(agreementObject.agreement.documentPath, repsonsePdfData, function(err, list){
															var options = {
																			"format": "Letter",
																			"orientation": "portrait",
																			"zoomFactor": "1",
																			"type": "pdf",
																			"quality": "75",
																			"paginationOffset": 1,
																			"border": {
																						"top": "25px",
																						"right": "15px",
																						"bottom": "25px",
																						"left": "15px"
																					  }
																		  };


															pdf.create(list, options).toFile(pdfFileName, function(err, result) {
																  if (err)
																  {
																	  return reject(err);
																  }

																  var criteria = {
																   id: consentID
																  };


																  UserConsent
																  .findOne(criteria)
																  .then(function (userConsentData) {

																	  userConsentData.applicationReference = applicationReference;
																	  userConsentData.userReference = userReference;

															          S3Service.reuploadPromissoryAgreementAsset(pdfFileName,userConsentData,applicationReference,userReference,reqdata);

																	  return resolve(userConsentData);

																 })
																 .catch(function (err) {
																	return reject(err);
																 });
															  })
															//  .catch(function (err) {
//																return reject(err);
//															 });
														});
														});

													})
												})
											})
										//})
//										.catch(function (err) {
//											 sails.log.error('ApplicationController#Error :: err', err);
//											return reject(err);
//										});

										})
										.catch(function (err) {
											 sails.log.error('ApplicationController#createpromissorypdfAction :: err', err);
											 //return res.handleError(err);
											 return reject(err);
										});
									})
									.catch(function (err) {
										 sails.log.error('dfasdf vignesh :: err', err);
										 //return res.handleError(err);
										 return reject(err);
									});

							})
							.catch(function (err) {
								 sails.log.error('ApplicationController#createpromissorypdfAction :: err', err);
								 //return res.handleError(err);
								 return reject(err);
							});
						});

			})
			.catch(function (err) {
				 sails.log.error('ApplicationController#createpromissorypdfAction :: err', err);
				 //return res.handleError(err);
				 return reject(err);
			});

	});
}*/

function getNewProductRule( creditReport, transunion_scrore ) {
	return Q.promise( function( resolve, reject ) {
		const enddate = moment().format( "YYYY-MM-DD" );
		var transunion_credit_trade = "";
		const transunion_credit_collection = "";
		var transunion_credit_inquiry = "";
		if( creditReport.product.subject.subjectRecord.custom  && creditReport.product.subject.subjectRecord.custom.credit) {
			if( creditReport.product.subject.subjectRecord.custom.credit.trade ) {
				var transunion_credit_trade = creditReport.product.subject.subjectRecord.custom.credit.trade;
			}
			if( creditReport.product.subject.subjectRecord.custom.credit.inquiry ) {
				var transunion_credit_inquiry = creditReport.product.subject.subjectRecord.custom.credit.inquiry;
			}
		}

		// Reules 11 if the ratio of all bank trade balance reported in the past three months over the all bank trade credit limit is missing, then do knock-out.
		const rule11counter = 0;
		let rule11 = 0;
		let rule12 = 0;
		const rule11val = 0;
		const reportmonth = 0;
		let reportbalance = 0;
		let reportlimit = 0;
		let totalreportbalance = 0;
		let totalreportlimit = 0;
		let td_reported_3m_yn = 0;
		let totalreportmonth = 0;
		const ruledatacount = [];
		let chargeOffRepocnt = 0;
		let trackingdate = creditReport.transactionControl.tracking.transactionTimeStamp;
		trackingdate = moment( trackingdate ).format( "YYYY-MM-DD" );

		if( !Array.isArray( transunion_credit_trade ) ) {
			var transunion_credit_trade_data = [];
			transunion_credit_trade_data.push( transunion_credit_trade );
		} else {
			var transunion_credit_trade_data = transunion_credit_trade;
		}
		_.forEach( transunion_credit_trade_data, function( value, key ) {
			const td_balance = value.currentBalance;
			const td_creditlim = value.creditLimit;
			const dateeffective = value.dateEffective._val;
			const industryCode = value.subscriber.industryCode;
			const closedIndicator = value.closedIndicator;

			// sails.log.info('===============================');
			sails.log.info( "closedIndicator", closedIndicator );

			let monthdiffer = moment( dateeffective ).diff( trackingdate, "months" );
			monthdiffer = Math.abs( monthdiffer );

			sails.log.info( "monthdiffer", monthdiffer );

			if( monthdiffer <= 3 ) {
				td_reported_3m_yn = 1;
			} else {
				td_reported_3m_yn = 0;
			}
			sails.log.info( "td_reported_3m_yn", td_reported_3m_yn );
			if( industryCode == "B" ) {
				reportbalance = td_reported_3m_yn * td_balance;
				reportlimit = td_reported_3m_yn * td_creditlim;
				totalreportbalance = totalreportbalance + reportbalance;
				totalreportlimit = totalreportlimit + reportlimit;
			}
		} );

		sails.log.info( "totalreportbalance", totalreportbalance );
		sails.log.info( "totalreportlimit", totalreportlimit );
		sails.log.info( "=================================" );

		if( parseFloat( totalreportbalance ) > 0 && parseFloat( totalreportlimit ) > 0 ) {
			var bankr_td_r_3m_blim_pct = Math.abs( parseFloat( totalreportbalance / totalreportlimit ).toFixed( 2 ) );
		} else {
			var bankr_td_r_3m_blim_pct = 0;
		}
		if( bankr_td_r_3m_blim_pct == 0 ) {
			rule11 = 1;
		} else {
			rule11 = 0;
		}

		ruledatacount.push( "R10: If the ratio of all bank trade balance reported in the past three months over the all bank trade credit limit is missing, then do knock-out. " + bankr_td_r_3m_blim_pct );

		// Reules 12 if the trade closed indicator is being 'chargeOffRepo' and the number of trade reported in the past three months are equal or over two, then do knock-out.
		_.forEach( transunion_credit_trade_data, function( value, key ) {
			const dateeffective = value.dateEffective._val;
			const closedIndicator = value.closedIndicator;
			let monthdiffer = moment( dateeffective ).diff( trackingdate, "months" );
			monthdiffer = Math.abs( monthdiffer );
			// sails.log.info('monthdiffer',monthdiffer);
			if( monthdiffer <= 3 ) {
				td_reported_3m_yn = 1;
			} else {
				td_reported_3m_yn = 0;
			}
			totalreportmonth = parseInt( totalreportmonth ) + parseInt( td_reported_3m_yn );
			if( closedIndicator == "chargeOffRepo" && totalreportmonth >= 2 ) {
				rule12 = 1;
				chargeOffRepocnt = parseInt( chargeOffRepocnt ) + 1;
			}
		} );

		ruledatacount.push( "R11: If the trade closed indicator is being chargeOffRepo and the number of trade reported in the past three months are equal or over two, then do knock-out. : " + chargeOffRepocnt );
		sails.log.info( "rule12", rule12 );

		if( rule11 == 0 && rule12 == 0 ) {
			var loanstatus = "Approved";
		} else {
			var loanstatus = "Denied";
		}

		const rulesdata = {
			code: 200,
			r10: rule11,
			r11: rule12,
			loanstatus: loanstatus,
			bankr_td_r_3m_blim_pct: bankr_td_r_3m_blim_pct,
			totalreportmonth: totalreportmonth,
			ruledatacount: ruledatacount
		};

		return resolve( rulesdata );
	} );
}

function reGeneratepromissorypdfAction( payId, userId, reqdata, resdata ) {
	return Q.promise( function( resolve, reject ) {
		// config set
		const promissorydocumentkey = "131";
		PaymentManagement.findOne( { id: payId } )
		.populate( "user" )
		.populate( "screentracking" )
		.sort( "createdAt DESC" )
		.then( function( paymentDetails ) {
			// sails.log.info("screenTrackingdata:::::", paymentDetails.screentracking);
			// sails.log.info("userData:::::", paymentDetails.user);
			sails.log.info( "paymentDetails.user.practicemanagement", paymentDetails.user.practicemanagememt );
			PracticeManagement.findOne( { id: paymentDetails.user.practicemanagement } )
			.then( ( practicemanagementData ) => {
				const providerName = practicemanagementData.PracticeName;
				const providerAddress = practicemanagementData.StreetAddress;
				const providerCity = practicemanagementData.City;
				const providerState = practicemanagementData.StateCode;
				const providerZip = practicemanagementData.ZipCode;
				const providerPhone = practicemanagementData.PhoneNo;
				const providerEmail = practicemanagementData.PracticeEmail;
				const servicesDescription = practicemanagementData.servicesDescription;
				const providerLateFee = practicemanagementData.providerLateFee;
				const applicationFee = practicemanagementData.applicationFee;
				const applicationReference = paymentDetails.screentracking.applicationReference;
				const userReference = paymentDetails.user.userReference;

				const userConsentDoc = { paymentManagement: payId, documentKey: promissorydocumentkey };
				const appApprovedDate = moment().format( "MM/DD/YYYY" );
				UserConsent.update( userConsentDoc, { loanupdated: 2, appApprovedDate: appApprovedDate } ).exec( function afterwards( err, updated ) {

					UserConsent.findOne( { documentKey: promissorydocumentkey, paymentManagement: payId } )
					.sort( "createdAt DESC" )
					.then( function( userconsent ) {
						UserConsent.createDuplicateConsent(userconsent, userId, userconsent.ip)
						.then(function (userconsentdetails) {
							const consentID = userconsentdetails.id;
							const newconsentcriteria = {
								id: consentID
							};
							UserConsent.update(newconsentcriteria, {paymentManagement: payId}).exec(function afterwards(err, updated) {
								// temporary purpose
								userconsentdetails.paymentManagement = payId;

								UserConsent.objectdataRegenerate(userId, reqdata, resdata, payId, userconsentdetails)
								.then(function (objectdatas) {
									// sails.log.info("objectdatas:::::", objectdatas);
									Agreement.findOne({id: userconsentdetails.agreement})
									.then(function (agreementDetail) {
										const replacedFilename = agreementDetail.documentName.split(" ").join("_");

										const pdfFileName = "./" + applicationReference + "_" + replacedFilename + "_" + Math.round(+new Date() / 1000) + ".pdf";

										const IPFromRequest = userconsentdetails.ip;
										const indexOfColon = IPFromRequest.lastIndexOf(":");
										const ipaddr = IPFromRequest.substring(indexOfColon + 1, IPFromRequest.length);

										// var todaydate = moment().format('MM/DD/YYYY');
										const todaydate = moment(userconsent.signedAt).format("MM/DD/YYYY");
										const fname = objectdatas.fname;
										const lname = objectdatas.lname;
										const financedAmount = objectdatas.amount;
										const interestRateAmount = parseFloat(objectdatas.interestRate * 12).toFixed(2);
										const loanTerm = objectdatas.month;
										const scheduleLoanAmount = parseFloat(objectdatas.scheduleLoanAmount).toFixed(2);
										const checktotalLoanAmount = parseFloat(objectdatas.checktotalLoanAmount).toFixed(2);
										const creditcost = parseFloat(objectdatas.creditcost).toFixed(2);
										const screentrackingdetails = paymentDetails.screentracking;
										const userData = objectdatas.paymentmanagementdata.user;
										const practiceData = objectdatas.paymentmanagementdata.practicemanagement;
										const offerData = screentrackingdetails.offerdata[0];

										let offerdata = {};
										if( Array.isArray( screentrackingdetails.offerdata ) ) {
											offerdata = screentrackingdetails.offerdata[ 0 ];
										} else {
											offerdata = screentrackingdetails.offerdata;
										}

										const tmpfrequency = ApplicationService.getPaymentFrequency( offerdata.paymentFrequency, true );
										const tmp = {
											amountFinanced: offerdata.financedAmount,
											financeCharge: parseFloat( offerdata.financeCharge ),
											downpayment: offerdata.downPayment
										};

										const agreementObject = {
											user: fname,
											date: moment.utc(new Date()).format(),
											agreement: agreementDetail
										};

										const screenID = paymentDetails.screentracking.id;
										const signaturecriteria = { screentracking: screenID, active: 1 };

										Esignature.find( signaturecriteria )
										.sort( "createdAt DESC" )
										.then( function( signatureDetails ) {
											let signatureExistRIC = 0;
											let signatureExistArbitration = 0;
											let signatureIdRIC = "";
											let signatureIdArbitration = "";
											let agreementsignpathRIC = "";
											let agreementsignpathPromNote = "";

											if( signatureDetails.length > 0 ) {
												for( let i = 0; i < signatureDetails.length; i++ ) {
													if( signatureDetails[ i ].type == 12 ) {
														// HighCost signature exists
														signatureExistRIC = 1;
														signatureIdRIC = signatureDetails[ i ].id;
														agreementsignpathRIC = Utils.getS3Url( signatureDetails[ i ].standardResolution );
													}
													if( signatureDetails[ i ].type == 13 ) {
														// PromNote signature exists
														signatureExistArbitration = 1;
														signatureIdArbitration = signatureDetails[ i ].id;
														agreementsignpathPromNote = Utils.getS3Url( signatureDetails[ i ].standardResolution );
													}
												}
											}

											const firstPaymentDate = new Date( objectdatas.paymentmanagementdata.loanStartdate );
											firstPaymentDate.setDate( firstPaymentDate.getDate() + 30 );

											const finalresponseData = {

												interestRate: parseInt( offerdata.interestRate ),
												fundingDate: moment( Date.now() ).format( "MM/DD/YYYY" ),
												loanID: screentrackingdetails.applicationReference,
												loanTerm: offerdata.term,
												frequency: tmpfrequency,
												paymentAmount: parseFloat( offerdata.monthlyPayment ),
												firstPaymentDate: moment( firstPaymentDate ).format( "MM/DD/YYYY" ),
												downpayment: tmp.downpayment,
												apr: parseFloat( parseFloat( offerdata.apr ).toFixed( 2 ) ),
												financeCharge: tmp.financeCharge,
												amountFinanced: tmp.amountFinanced,
												totalOfPayments: tmp.amountFinanced + tmp.financeCharge,
												totalSalePrice: tmp.amountFinanced + tmp.financeCharge + tmp.downpayment,
												cashPrice: tmp.amountFinanced + tmp.downpayment,
												practiceRICPath: agreementObject.agreement.documentPath + "_pdf.nunjucks",
												isPdf: true,

												userName: paymentDetails.user.firstname + " " + paymentDetails.user.lastname,
												street: paymentDetails.user.street,
												city: paymentDetails.user.city,
												state: paymentDetails.user.state,
												zipCode: paymentDetails.user.zipCode,
												unitapt: paymentDetails.user.unitapt,

												signatureExistRIC: signatureExistRIC,
												signatureExistArbitration: signatureExistArbitration,
												signatureIdRIC: signatureIdRIC,
												signatureIdArbitration: signatureIdArbitration,
												agreementsignpathRIC: agreementsignpathRIC,
												agreementsignpathPromNote: agreementsignpathPromNote,

												ip: ipaddr,
												userid: userId,
												todaydate: todaydate,
												financedAmount: financedAmount,
												scheduleLoanAmount: scheduleLoanAmount,
												checktotalLoanAmount: checktotalLoanAmount,
												creditcost: creditcost,
												screentrackingdetails: screentrackingdetails,
												type: "pdf",
												practiceData: practiceData,
												userData: userData,
												offerData: offerData,
												appApprovedDate: appApprovedDate,

												providerName: providerName,
												providerAddress: providerAddress,
												providerCity: providerCity,
												providerState: providerState,
												providerZip: providerZip,
												providerPhone: providerPhone,
												providerEmail: providerEmail,
												servicesDescription: servicesDescription,
												providerLateFee: providerLateFee,
												applicationFee: applicationFee
											};
											resdata.render( "document/pdfwrapper.nunjucks", finalresponseData, function (err, list) {
												const options = {
													format: "Letter",
													orientation: "portrait",
													zoomFactor: "1",
													type: "pdf",
													quality: "75",
													paginationOffset: 1,
													border: {
														top: "25px",
														right: "15px",
														bottom: "25px",
														left: "15px"
													}
												};

												pdf.create(list, options).toFile(pdfFileName, function (err, result) {
													if (err) {
														return reject(err);
													}

													const criteria = {
														id: consentID
													};

													UserConsent.findOne(criteria)
													.then(function (userConsentData) {
														userConsentData.applicationReference = applicationReference;
														userConsentData.userReference = userReference;

														S3Service.reuploadPromissoryAgreementAsset(pdfFileName, userConsentData, applicationReference, userReference, reqdata);
														return resolve(userConsentData);
													})
													.catch(function (err) {
														return reject(err);
													});
												});
											});
										})
										.catch(function (err) {
											return reject(err);
										});
									})
									.catch(function (err) {
										return reject(err);
									});
								})
								.catch(function (err) {
									return reject(err);
								});
							});
						})
						.catch(function (err) {
							return reject(err);
						});
					} )
					.catch( function( err ) {
						return reject( err );
					} );
				} );
			} );
		} )
		.catch( function( err ) {
			return reject( err );
		} );
	} );
}

function getPromissoryNoteData( req, screentrackingId ) {
	const userId = req.session.userId;
	sails.log.info( "ApplicationService.getPromissoryNoteData; userId:", userId );

	const responseData = {
		formAction: "/createpromissorypdf",
		userName: "",
		street: "",
		city: "",
		state: "",
		zipCode: "",
		unitapt: "",
		phoneNumber: "",
		applicationReference: "",
		fundingDate: "",
		finalPaymentDate: "",
		apr: 0,
		interestRate: 0,
		financeCharge: 0,
		amountFinanced: 0,
		totalOfPayments: 0,
		numberOfPayments: 0,
		paymentAmount: 0,
		frequency: "",
		firstPaymentDate: "",
		finalPaymentAmount: 0,
		totalLoanAmount: 0,
		bankName: "",
		bankAccountType: "",
		bankRoutingNumber: "",
		bankAccountNumber: "",
		signatureExistRIC: 0,
		signatureExistEFT: 0,
		signatureExistArbitration: 0,
		signatureIdRIC: "",
		signatureIdEFT: "",
		signatureIdArbitration: "",
		agreementsignpathRIC: "",
		agreementsignpathEFT: "",
		agreementsignpathPromNote: "",
		todaydate: moment().format( "MM/DD/YYYY" ),
		type: "view",
		ip: ( req.headers[ "x-forwarded-for" ] || req.headers[ "x-real-ip" ] || req.connection.remoteAddress ).replace( "::ffff:", "" ).replace( /^::1$/, "127.0.0.1" ),
		isPdf: false,
		providerName: "",
		providerAddress: "",
		providerCity: "",
		providerState: "",
		providerZip: "",
		providerPhone: "",
		providerEmail: "",
		servicesDescription: "",
		manualModalPath: "",
		providerLateFee: 0,
		applicationFee: 0,
		stateDefaultRate: 0,
		eftaSignatureRequired: true
	};

	return User.findOne( { id: userId } )
	.then( ( user ) => {
		if( user ) {
			responseData.userName = `${user.firstname} ${user.lastname}`;
			responseData.street = user.street;
			responseData.unitapt = user.unitapt;
			responseData.city = user.city;
			responseData.state = user.state;
			responseData.zipCode = user.zipCode;
			responseData.phoneNumber = user.phoneNumber;
			responseData.practicemanagement = user.practicemanagement;
		}

		const screentrackingCriteria = ( screentrackingId ? { id: screentrackingId } : { user: userId, iscompleted: 0 } );
		return Screentracking.findOne( screentrackingCriteria )
		.populate( "accounts" )
		.then( ( screentracking ) => {
			if( !screentracking ) {
				sails.log.error( "ApplicationService.getPromissoryNoteData; not found! -- criteria:", screentrackingCriteria, "session:", JSON.stringify( req.session ), "params:", JSON.stringify( req.allParams() ) );
				return { code: 400 };
			}
			const salesPrice = 6000;
			responseData.interestRate = parseFloat( screentracking.offerdata[ 0 ].interestRate );
			responseData.fundingDate = moment( Date.now() ).format( "MM/DD/YYYY" );
			responseData.loanID = screentracking.applicationReference;
			responseData.loanTerm = screentracking.offerdata[ 0 ].term;
			responseData.frequency = getPaymentFrequency( screentracking.offerdata[ 0 ].paymentFrequency, true );
			responseData.paymentAmount = parseFloat( screentracking.offerdata[ 0 ].monthlyPayment );
			const preferredDate  = parseInt(screentracking.preferredDueDate) - 1;
			const preferredDateNextMonth = moment().add(1, 'M').startOf('month').add(preferredDate, 'days').format( "MM/DD/YYYY" );
			responseData.firstPaymentDate = preferredDateNextMonth;
			responseData.apr = parseFloat( parseFloat( screentracking.offerdata[ 0 ].apr ).toFixed( 2 ) );
			responseData.financeCharge = parseFloat( screentracking.offerdata[ 0 ].financeCharge );
			responseData.amountFinanced = screentracking.offerdata[ 0 ].financedAmount;
			responseData.downpayment = responseData.amountFinanced - salesPrice;
			if (responseData.downpayment < 0) {
				responseData.downpayment = responseData.downpayment * -1;
			}
			responseData.totalOfPayments = parseFloat( ( responseData.amountFinanced + responseData.financeCharge ).toFixed( 2 ) );
			responseData.totalSalePrice = parseFloat( ( responseData.amountFinanced + responseData.financeCharge + responseData.downpayment ).toFixed( 2 ) );
			responseData.cashPrice = responseData.amountFinanced + responseData.downpayment;

			return Esignature.find( { user_id: userId, screentracking: screentracking.id, $or: [ { isDeleted: { $exists: false } }, { isDeleted: { $exists: true, $eq: false } } ] } )
			.then( ( esignatures ) => {
				responseData.signatureExistRIC = 0;
				responseData.signatureExistArbitration = 0;
				responseData.signatureExistEFT = 0;
				if( esignatures.length > 0 ) {
					for( let i = 0; i < esignatures.length; ++i ) {
						if( esignatures[ i ].type == 12 ) {
							// HighCost signature exists
							responseData.signatureExistRIC = 1;
							responseData.signatureIdRIC = esignatures[ i ].id;
							responseData.agreementsignpathRIC = Utils.getS3Url( esignatures[ i ].standardResolution );
						}
						if( esignatures[ i ].type == 13 ) {
							// PromNote signature exists
							responseData.signatureExistArbitration = 1;
							responseData.signatureIdArbitration = esignatures[ i ].id;
							responseData.agreementsignpathPromNote = Utils.getS3Url( esignatures[ i ].standardResolution );
						}
						if( esignatures[ i ].type == 14 ) {
							// EFT signature exists
							responseData.signatureExistEFT = 1;
							responseData.signatureIdEFT = esignatures[ i ].id;
							responseData.agreementsignpathEFT = Utils.getS3Url( esignatures[ i ].standardResolution );
						}
					}
				}
				return Agreement.findOne( { practicemanagement: responseData.practicemanagement, documentKey: "131" } );
			} )
			.then( ( agreement ) => {
				responseData.promNotePath = `${agreement.documentPath}.nunjucks`;
				if( screentracking.accounts ) {
					return UserBankAccount.findOne( { user: userId, id: screentracking.accounts.userBankAccount } )
					.then( ( userbankaccount ) => {
						if( userbankaccount ) {
							responseData.bankName = userbankaccount.institutionName;
							responseData.bankAccountType = screentracking.accounts.accountSubType;
							responseData.bankAccountNumber = screentracking.accounts.accountNumber;
							responseData.bankRoutingNumber = screentracking.accounts.routingNumber;
						} else {
							responseData.manualModalPath ="frontend/home/manualbankmodal.nunjucks";
						}
						return;
					} );
				} else {
					responseData.manualModalPath ="frontend/home/manualbankmodal.nunjucks";
					return;
				}
			} )
			.then( () => {
				return PracticeManagement.findOne( { id: responseData.practicemanagement } );
			} )
			.then( ( practicemanagementData ) => {
				if( practicemanagementData ) {
					responseData.providerName = practicemanagementData.PracticeName;
					responseData.providerAddress = practicemanagementData.StreetAddress;
					responseData.providerCity = practicemanagementData.City;
					responseData.providerState = practicemanagementData.StateCode;
					responseData.providerZip = practicemanagementData.ZipCode;
					responseData.providerPhone = practicemanagementData.PhoneNo;
					responseData.providerEmail = practicemanagementData.PracticeEmail;
					responseData.servicesDescription = practicemanagementData.servicesDescription;
					responseData.providerLateFee = practicemanagementData.providerLateFee;
					responseData.applicationFee = practicemanagementData.applicationFee;
				}
				const result = { code: 200, data: responseData };
				sails.log.verbose( "ApplicationService.getPromissoryNoteData; result:", JSON.stringify( result ) );
				return result;
			} );
		} )
		.catch( ( err ) => {
			sails.log.error( "ApplicationService.getPromissoryNoteData; catch:", err, "session:", JSON.stringify( req.session ), "params:", JSON.stringify( req.allParams() ) );
			return { code: 500, data: null };
		} );
	} )
	.catch( ( err ) => {
		sails.log.error( "ApplicationService.getPromissoryNoteData; catch:", err, "session:", JSON.stringify( req.session ), "params:", JSON.stringify( req.allParams() ) );
		return { code: 500, data: null };
	} );
}

function getPaymentFrequency( freq, human ) {
	switch( freq.toLowerCase() ) {
		case "weekly":
		case "loan.frequency.weekly":
			return ( human ? "Weekly" : "weekly" );
		case "biweekly":
		case "bi-weekly":
		case "loan.frequency.biweekly":
			return ( human ? "Bi-Weekly" : "bi-weekly" );
		case "semimonthly":
		case "semi-monthly":
		case "loan.frequency.semimonthly":
			return ( human ? "Semi-Monthly" : "semi-monthly" );
		case "monthly":
		case "loan.frequency.monthly":
			return ( human ? "Monthly" : "monthly" );
	}
}


function getProductRuleBanking( screentracking ) {
	const userId = ( screentracking.user.id || screentracking.user );
	const rulesFn = { r11, r12, r13, r14 };
	const ruleStatus = {};
	const operatorMap = { "eq": "=", "gt": ">", "gte": ">=", "lt": "<", "lte": "<=", "ne": "!=" };
	const ruleCriteria = {
		product: sails.config.product.productid,
		isDeleted: false,
		$and: [ { $or: [ { ruleid: "r11" }, { ruleid: "r12" }, { ruleid: "r13" }, { ruleid: "r14" } ] } ]
	};
	let userBankAccounts;
	const checkingAccounts = [];
	let offers;
	return Screentracking.getOffers( screentracking, false, 0, 0 )
	.then( ( screentracking ) => {
		offers = screentracking.offers;
		// sails.log.verbose( "getProductRuleBanking; offers:", offers );
		return UserBankAccount.find( { user: userId, screentracking: screentracking.id } )
		.then( ( userbankaccounts ) => {
			userBankAccounts = userbankaccounts;
			_.forEach( userBankAccounts, ( userbankaccount ) => {
				_.forEach( userbankaccount.accounts, ( account ) => {
					if( account.type == "depository" && account.subtype == "checking" ) {
						checkingAccounts.push( account );
					}
				} );
			} );
		} );
	} )
	.then( () => {
		return ProductRules.find( ruleCriteria )
		.sort( "ruleid ASC" )
		.then( ( productrules ) => {
			sails.log.verbose( "getProductRuleBanking; productrules:", productrules );
			_.forEach( productrules, ( productrule ) => {
				ruleStatus[ productrule.ruleid ] = { status: -1 };
				if( rulesFn.hasOwnProperty( productrule.ruleid ) ) {
					return rulesFn[ productrule.ruleid ]( productrule );
				}
			} );
		} );
	} )
	.then( () => {
		sails.log.verbose( "getProductRuleBanking; ruleStatus:", JSON.stringify( ruleStatus, null, 4 ) );
		const rulesDetails = screentracking.rulesDetails;
		_.forEach( ruleStatus, ( rule, ruleid ) => {
			rulesDetails[ ruleid ] = ( rule.status ? 1 : 0 );
			rulesDetails.ruledatacount.push( rule.count );
			rulesDetails.approvedrulemsg.push( rule.description );
			if( rule.status ) {
				rulesDetails.code = 400;
				rulesDetails.loanstatus = "Denied";
				rulesDetails.declinedrulemsg.push( rule.description );
				screentracking.lockCreditTier = "G";
				return;
			}
		} );
		sails.log.info( "getProductRuleBanking; rulesDetails:", JSON.stringify( rulesDetails, null, 4 ) );
		return screentracking.save()
		.then( () => screentracking.rulesDetails );
	} );

	function r11( productrule ) {
		const payrolls = _.get( screentracking, "payrolldata", [] );
		let monthlyIncome = 0;
		_.forEach( payrolls, ( payroll ) => {
			monthlyIncome = MathExt.float( monthlyIncome + ( payroll.annualIncome / 12 ) );
		} );
		ruleStatus[ productrule.ruleid ].description = `R11: ${productrule.description} (${monthlyIncome}) ${operatorMap[ productrule.declinedif ]} ${productrule.value}`;
		ruleStatus[ productrule.ruleid ].count = `R11: ${productrule.description} : ${monthlyIncome}`;
		ruleStatus[ productrule.ruleid ].status = testCondition( monthlyIncome, productrule.declinedif, parseFloat( productrule.value ) );
	}

	function r12( productrule ) {
		let postDTI = 0;
		let anyValidOffers = false;
		let highestValidDTI = 0;
		let lowestInvalidDTI = 0;
		_.forEach( offers, ( offer ) => {
			if( offer.postDTIPercentValue <= 50 ) {
				anyValidOffers = true;
				highestValidDTI = Math.max( highestValidDTI, offer.postDTIPercentValue );
			} else {
				if( lowestInvalidDTI == 0 ) lowestInvalidDTI = offer.postDTIPercentValue;
				lowestInvalidDTI = Math.min( lowestInvalidDTI, offer.postDTIPercentValue );
			}
		} );
		postDTI = MathExt.float( ( ( anyValidOffers ? highestValidDTI : lowestInvalidDTI ) / 100 ), 2 );
		// sails.log.verbose( "getProductRuleBanking.r12;", anyValidOffers, highestValidDTI, lowestInvalidDTI, postDTI );
		ruleStatus[ productrule.ruleid ].description = `R12: ${productrule.description} (${postDTI}) ${operatorMap[ productrule.declinedif ]} ${productrule.value}`;
		ruleStatus[ productrule.ruleid ].count = `R12: ${productrule.description} : ${postDTI}`;
		ruleStatus[ productrule.ruleid ].status = testCondition( postDTI, productrule.declinedif, parseFloat( productrule.value ) );
	}

	function r13( productrule ) {
		let availableBalance = 0;
		_.forEach( checkingAccounts, ( account ) => {
			const bal = _.get( account, "balance.available", 0 );
			availableBalance = Math.max( availableBalance, bal );
		} );
		ruleStatus[ productrule.ruleid ].description = `R13: ${productrule.description} (${availableBalance}) ${operatorMap[ productrule.declinedif ]} ${productrule.value}`;
		ruleStatus[ productrule.ruleid ].count = `R13: ${productrule.description} : ${availableBalance}`;
		ruleStatus[ productrule.ruleid ].status = testCondition( availableBalance, productrule.declinedif, parseFloat( productrule.value ) );
	}

	function r14( productrule ) {
		let overdrafts = 0;
		const categories = [ "10001000", "10007000" ];
		const recentMonths = moment().startOf( "day" ).subtract( 3, "months" );
		_.forEach( userBankAccounts, ( userbankaccount ) => {
			_.forEach( userbankaccount.transactions, ( account ) => {
				_.forEach( account, ( transaction ) => {
					if( categories.indexOf( transaction.category_id ) >= 0 && moment( transaction.date ) >= recentMonths ) {
						++overdrafts;
					}
				} );
			} );
		} );
		ruleStatus[ productrule.ruleid ].description = `R14: ${productrule.description} (${overdrafts}) ${operatorMap[ productrule.declinedif ]} ${productrule.value}`;
		ruleStatus[ productrule.ruleid ].count = `R14: ${productrule.description} : ${overdrafts}`;
		ruleStatus[ productrule.ruleid ].status = testCondition( overdrafts, productrule.declinedif, parseFloat( productrule.value ) );
	}
}


function testCondition( value, operator, threshold ) {
	switch( operator.toLowerCase() ) {
		case "eq":
			return ( value == threshold );
		case "gt":
			return ( value > threshold );
		case "gte":
			return ( value >= threshold );
		case "lt":
			return ( value < threshold );
		case "lte":
			return ( value <= threshold );
		case "ne":
			return ( value != threshold );
	}
}

async function createEFTA( accountid, userdata, screendata, paydata, ip, reqdata, resdata ) {
	try {
		/* create the consent record */
		const agreement = await Agreement.findOne( { $and: [ { practicemanagement: screendata.practicemanagement }, { documentKey: "132" } ] } );

		/* Set create argument to true when calling createConsentfordocument to make sure it creates a new document instead of updating an existing one */
		const userconsent = await UserConsent.createConsentfordocuments( agreement, userdata, ip, screendata.id, true );

		/* create the pdf versions */
		await UserConsent.createStaticAgreementPdf( userconsent.id, userconsent, screendata.applicationReference, ip, accountid, screendata.practicemanagement, resdata, reqdata );

		let latestConsent = userconsent;
		if( paydata ) {
			/* there is a contract: update the consent object to be associated with the new account */
			latestConsent = await UserConsent.update( { id: userconsent.id }, { paymentManagement: paydata.id } )[ 0 ];

			const updateData = {};
			if( sails.config.feature && sails.config.feature.employmentHistory ) {
				/* update paymentmanagement */
				const employmentdata = await EmploymentHistory.findOne( { paymentmanagement: paydata.id } );
				let status;
				let active;

				if( employmentdata && employmentdata.verifiedIncome ) {
					updateData.achstatus = 1;
					if( employmentdata.verifiedIncome >= paydata.minimumIncome ) {
						status = sails.config.paymentManagementStatus.performing;
						active = true;
					} else {
						status = sails.config.paymentManagementStatus.deferred;
						active = false;
					}
					updateData.status = status;
					updateData.isPaymentActive = active;
				}
			}

			if( accountid ) {
				updateData.account = accountid;
			}

			await PaymentManagement.update( { id: paydata.id }, updateData );
		}
		return { code: 200, consent: latestConsent };
	} catch ( err ) {
		return { code: 400, error: err };
	}
}
