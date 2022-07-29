/* global sails, MathExt */
"use strict";

/**
 * TestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const request = require( "request" );
const Q = require( "q" );
const _ = require( "lodash" );
const moment = require( "moment" );

const fs = require( "fs" );
const ip = require( "ip" );
const path = require('path');
const csvWriter = require("csv-writer");

module.exports = {
	testTransunioun: testTransuniounAction,
	testActumDebit: testActumDebitAction,
	testCheckActumPayment: testCheckActumPaymentAction,
	testStripeRecurringPayment: testStripeRecurringPaymentAction,
	testActumRecurringPayment: testActumRecurringPaymentAction,
	testRegeneratePromissoryNote: testRegeneratePromissoryNoteAction,
	testcheckCreditStatus: testcheckCreditStatusAction,
	testShowInterestRate: testShowInterestRateAction,
	updateLoansetting: updateLoansetting,
	testFundPracticeCreditPayment: testFundPracticeCreditPaymentAction,
	testMakeAmortizationSchedule: testMakeAmortizationSchedule,
	archiveIncompleteApplications: archiveIncompleteApplications,
	expiredUsersDenied: expiredUsersDenied,
	procedureConfirmedMailer:procedureConfirmedMailer,
	testExportFundedContracts: testExportFundedContracts,
	procedureConfirmedEmail:procedureConfirmedEmail
};

// --Actum debit recurring
function testActumRecurringPaymentAction( req, res ) {
	CronService.getAllActumDebitPayment( req, res )
	.then( function( responseData ) {
		const json = {
			status: 200,
			message: "Actum debit recurring payment success",
			responseData: responseData
		};
		res.contentType( "application/json" );
		res.json( json );
	} )
	.catch( function( err ) {
		sails.log.error( "Error:", err );

		const json = {
			status: 400,
			message: "Unable to perform actum debit recurring payment"
		};
		res.contentType( "application/json" );
		res.json( json );
	} );
}

// --stripe recurring for practice
function testStripeRecurringPaymentAction( req, res ) {
	CronService.getAllStripeRecurringPayment( req, res )
	.then( function( responseData ) {
		const json = {
			status: 200,
			message: "Stripe recurring payment success",
			responseData: responseData
		};
		res.contentType( "application/json" );
		res.json( json );
	} )
	.catch( function( err ) {
		sails.log.error( "Error:", err );

		const json = {
			status: 400,
			message: "Unable to perform stripe recurring payment"
		};
		res.contentType( "application/json" );
		res.json( json );
	} );
}

// --Actum check payment
function testCheckActumPaymentAction( req, res ) {
	// var history_id='80574575';
	const order_id = 18585977;

	ActumService.checkActumPaymentStatus( order_id )
	.then( function( responseData ) {
		sails.log.info( "Enter Actum responseData::", responseData );

		if( responseData.status == 200 ) {
			var json = {
				responseData: responseData
			};
		} else {
			var json = {
				responseData: responseData
			};
		}
		res.contentType( "application/json" );
		res.json( json );
	} )
	.catch( function( err ) {
		sails.log.error( "Error:", err );

		const json = {
			status: 400,
			message: "Unable to check payment status"
		};
		res.contentType( "application/json" );
		res.json( json );
	} );
}

// --Actum test debit
function testActumDebitAction( req, res ) {
	const userData = [];
	const accountData = [];
	const amount = "1.00";
	const IPFromRequest = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;

	ActumService.processActumDebitPayment( userData, accountData, amount, IPFromRequest )
	.then( function( responseData ) {
		if( responseData.status == 200 ) {
			var json = {
				responseData: responseData
			};
		} else {
			var json = {
				responseData: responseData
			};
		}
		res.contentType( "application/json" );
		res.json( json );
	} )
	.catch( function( err ) {
		sails.log.error( "Error:", err );

		const json = {
			status: 400,
			message: "Unable to create debit transaction"
		};
		res.contentType( "application/json" );
		res.json( json );
	} );
}

function testTransuniounAction() {
	const apiindustryCode = sails.config.transunion.industryCode;
	const apimemberCode = sails.config.transunion.memberCode;
	const apiprefixCode = sails.config.transunion.prefixCode;
	const apiKeyPassword = sails.config.transunion.certificate.password;
	const apiEnv = sails.config.transunion.env;
	const apiPassword = sails.config.transunion.password;

	const addressarray = {
		untiapt: "",
		street_name: "Deeboyer",
		city: "Lakewood	",
		state: "CA",
		zip_code: "90712"
	};

	const userArray = {
		first: "Anita",
		middle: "",
		last: "Abdo"
	};

	const transactionControl = {
		userRefNumber: "12345",
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

	const userDetail = {
		id: "5b5efde2e7247064aa3bd5c1",
		email: "vigneshs002@gmail.com",
		dateofBirth: "04/22/1996"
	};

	Transunion.createcertificate( userArray, addressarray, "666429061", userDetail, transactionControl )
	.then( function( responseDetails ) {
		sails.log.info( "responseDetails", responseDetails );

		if( responseDetails.code == 200 ) {
			Screentracking.updateApplicationDetails( userDetail, addressarray )
			.then( function( applicationDetails ) {
				sails.log.info( "applicationDetails", applicationDetails );
			} )
			.catch( function( err ) {
				sails.log.error( "ApplicationService#createcertificate::Err ::", err );
				const responsedata = { code: 400, message: "Could not recieve your credit details" };
				return resolve( responsedata );
			} );
		}
	} )
	.catch( function( err ) {
		sails.log.error( "ApplicationService#createcertificate::Err ::", err );
		// return reject(err);
		const responsedata = {
			code: 400,
			message: "Could not recieve your credit details"
		};
		return resolve( responsedata );
	} );
}

// --Regenerate promissory note
function testRegeneratePromissoryNoteAction( req, res ) {
	let limitvalue = 1; // -- default
	if( "undefined" !== typeof req.param( "limitvalue" ) && req.param( "limitvalue" ) != "" && req.param( "limitvalue" ) != null ) {
		limitvalue = req.param( "limitvalue" );
	}

	const consentcriteria = {
		documentKey: "202",
		loanupdated: 1,
		paymentManagement: { $exists: true },
		regenerate: { $exists: false }
	};

	/* var criteriaID ='5c41e8f6cd3b1d763d6dec4d';
	var consentcriteria={
		id:criteriaID
	}*/

	UserConsent.find( consentcriteria )
	// .populate(user)
	// .populate(paymentManagement)
	.sort( "createdAt ASC" )
	.limit( limitvalue )
	.then( function( consentDetails ) {
		sails.log.info( "consentDetails.length:", consentDetails.length );

		if( consentDetails.length > 0 ) {
			const forlength = consentDetails.length;
			let loopcount = 0;
			let errorloopcount = 0;
			const lendingerrorloopcount = 0;
			_.forEach( consentDetails, function( consentData ) {
				const paymentDataId = consentData.paymentManagement;
				const userDataId = consentData.user;

				sails.log.info( "paymentId:", paymentDataId );
				sails.log.info( "userId:", userDataId );
				sails.log.info( "---------------------------:" );

				ApplicationService.reGeneratepromissorypdf( paymentDataId, userDataId, req, res )
				.then( function( generatedResponse ) {
					sails.log.info( "generatedResponse:", generatedResponse );

					if( generatedResponse ) {
						UserConsent.update( { id: consentData.id }, { regenerate: 1 } ).exec( function afterwards( err, updated ) {
							UserConsent.update( { id: generatedResponse.id }, { regenerate: 2 } ).exec( function afterwards( err, updated ) {
								loopcount++;

								if( loopcount == forlength ) {
									const json = {
										status: 200,
										message: "Consent count::" + forlength,
										loopcount: "Loop count::" + loopcount,
										errorloopcount: "Error Loop count::" + errorloopcount,
										lendingerrorloopcount: "Lending Error Loop count::" + lendingerrorloopcount
									};
									res.contentType( "application/json" );
									res.json( json );
								}

								/* UserConsent
							.reGenerateLendingDisclosureAgreement(paymentDataId,res,req)
							.then(function (lendingreponse) {

								sails.log.info("lendingreponse:",lendingreponse);

								if(lendingreponse.code==400)
								{
									errorloopcount++;
									lendingerrorloopcount++;
								}

								loopcount++;

								if(loopcount==forlength)
								{
									var json = {
										status:200,
										message:'Consent count::'+forlength,
										loopcount:'Loop count::'+loopcount,
										errorloopcount:'Error Loop count::'+errorloopcount,
										lendingerrorloopcount:'Lending Error Loop count::'+lendingerrorloopcount
									};
									res.contentType('application/json');
									res.json(json);
								}
							 })
							 .catch(function (err) {

									sails.log.info("Error:",err);

									loopcount++;
									errorloopcount++;
									lendingerrorloopcount++;

									if(loopcount==forlength)
									{
										var json = {
											status:200,
											message:'Consent count::'+forlength,
											loopcount:'Loop count::'+loopcount,
											errorloopcount:'Error Loop count::'+errorloopcount,
											lendingerrorloopcount:'Lending Error Loop count::'+lendingerrorloopcount
										};
										res.contentType('application/json');
										res.json(json);
									}
							 });*/
							} );
						} );
					} else {
						sails.log.info( "consent not generated:" );

						loopcount++;
						errorloopcount++;

						if( loopcount == forlength ) {
							const json = {
								status: 200,
								message: "Consent count::" + forlength,
								loopcount: "Loop count::" + loopcount,
								errorloopcount: "Error Loop count::" + errorloopcount,
								lendingerrorloopcount: "Lending Error Loop count::" + lendingerrorloopcount
							};
							res.contentType( "application/json" );
							res.json( json );
						}
					}
				} )
				.catch( function( err ) {
					sails.log.info( "Final Error:", err );

					loopcount++;
					errorloopcount++;

					if( loopcount == forlength ) {
						const json = {
							status: 200,
							message: "Consent count::" + forlength,
							loopcount: "Loop count::" + loopcount,
							errorloopcount: "Error Loop count::" + errorloopcount,
							lendingerrorloopcount: "Lending Error Loop count::" + lendingerrorloopcount
						};
						res.contentType( "application/json" );
						res.json( json );
					}
				} );
			} );
		} else {
			const json = {
				status: 400,
				message: "No consent found::" + consentDetails.length
			};
			res.contentType( "application/json" );
			res.json( json );
		}
	} )
	.catch( function( err ) {
		const json = {
			status: 500,
			message: err
		};
		res.contentType( "application/json" );
		res.json( json );
	} );
}

function testcheckCreditStatusAction( req, res ) {
	CronService.checkLenderCreditStatus( req, res )
	.then( function( responseData ) {
		const json = {
			status: 200,
			message: "Actum " + sails.config.lender.shortName + " Credit Status success",
			responseData: responseData
		};
		res.contentType( "application/json" );
		res.json( json );
	} )
	.catch( function( err ) {
		sails.log.error( "Error:", err );

		const json = {
			status: 400,
			message: "Unable to perform " + sails.config.lender.shortName + " Credit Status"
		};
		res.contentType( "application/json" );
		res.json( json );
	} );
}

function testShowInterestRateAction( req, res ) {
	const stateCode = req.param( "statecode" );
	const term = parseInt( req.param( "term" ) );
	const maxloanamount = parseInt( req.param( "amount" ) );

	const intcriteria = {
		stateCode: stateCode,
		term: term,
		maxloanamount: maxloanamount
	};

	// sails.log.info('testController#testShowInterestRateAction :: intcriteria::', intcriteria);

	Loaninterestrate.find( intcriteria )
	.then( function( interestData ) {
		const gradecriteria = {
			stateCode: stateCode,
			gradeterm: term,
			maxloanamount: maxloanamount
		};

		Loangradesettings.find( gradecriteria )
		.then( function( gradeData ) {
			interestData = _.orderBy( interestData, [ "maxcreditscore" ], [ "desc" ] );
			gradeData = _.orderBy( gradeData, [ "gradelevel" ], [ "asc" ] );

			const responseData = {
				interestData: interestData,
				gradeData: gradeData,
				interestlength: interestData.length,
				gradelength: gradeData.length,
				stateCode: stateCode,
				term: term,
				maxloanamount: maxloanamount
			};

			sails.log.info( "testController#testShowInterestRateAction :: responseData", responseData );

			res.view( "admin/showInterestRate", { responseData: responseData } );
		} )
		.catch( function( err ) {
			sails.log.error( "testController#testShowInterestRateAction :: err", err );
			const errors = err.message;
			res.view( "admin/error/404", {
				data: err.message,
				layout: "layout"
			} );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "testController#testShowInterestRateAction :: err", err );
		const errors = err.message;
		res.view( "admin/error/404", {
			data: err.message,
			layout: "layout"
		} );
	} );
}
function updateLoansetting( req, res ) {
	const loanOptions = {
		$or: [ { loansettingsupdated: { $eq: 0, $exists: true } }, { loansettingsupdated: { $exists: false } } ]
	};
	PracticeManagement.find( loanOptions ).then( function( practicedata ) {
		const practiceLength = practicedata.length;
		let loopCount = 0;
		_.forEach( practicedata, function( practice ) {
			const inputData = { practiceid: practice.id, enabledTerms: sails.config.plaid.interestTermsArr };
			LoanSettings.createPracticeLoansettings( inputData, function( loansetresponse ) {
				sails.log.info( "practice ID:", practice.id );
				PracticeManagement.update( { id: practice.id }, { loansettingsupdated: 1 } ).exec( function afterwards( err, updated ) {
					loopCount++;
					sails.log.info( "loop practice ID:", practice.id );
					sails.log.info( "loop counter value ", loopCount );
					sails.log.info( "=======================================" );
					if( loopCount == practiceLength ) {
						const json = {
							status: 200,
							message: "Updated",
							loopCount: loopCount,
							practiceLength: practiceLength
						};
						res.contentType( "application/json" );
						res.json( json );
					}
				} );
			} );
		} );
	} );
}

// --Actum Credit Payment
function testFundPracticeCreditPaymentAction( req, res ) {
	const IPFromRequest = ip.address();
	const practiceId = "5b803bf89db31e772cb06e14";

	// -- For testing
	const paybackAmount = "1.00";

	let creditStatus = 0;
	let failure_code = "";
	let failure_message = "";
	let message = "";

	PracticeManagement.findOne( { id: practiceId } )
	.then( function( practiceData ) {
		ActumService.processPracticeCreditPayment( practiceData, paybackAmount, IPFromRequest )
		.then( function( transactionDetail ) {
			sails.log.info( "transactionDetail::", transactionDetail );
			if( transactionDetail.status == 200 ) {
				const creditResponseData = transactionDetail.jsonObj;
				const creditStatusTxt = creditResponseData.status.toLowerCase();

				if( "undefined" !== typeof creditResponseData.authcode && creditResponseData.authcode != "" && creditResponseData.authcode != null ) {
					failure_code = creditResponseData.authcode;
				}

				if( "undefined" !== typeof creditResponseData.reason && creditResponseData.reason != "" && creditResponseData.reason != null ) {
					failure_message = creditResponseData.reason;
				}

				if( creditStatusTxt == "accepted" ) {
					creditStatus = 1;
					message = "Payment completed successfully";
				} else if( creditStatusTxt == "declined" ) {
					creditStatus = 2;
					message = "Unable to process credit payment: " + failure_message + " (" + failure_code + " )";
				} else if( creditStatusTxt == "verify" ) {
					creditStatus = 3;
					message = "Unable to process credit payment: " + creditStatusTxt;
				} else {
					creditStatus = 4;
					message = "Unable to process credit payment: " + failure_message + " (" + failure_code + " )";
				}

				var json = {
					status: 200,
					message: "Unable to perform actum credit payment",
					creditStatus: creditStatus,
					failure_code: failure_code,
					failure_message: failure_message,
					message: message
				};
				res.contentType( "application/json" );
				res.json( json );
			} else {
				var json = {
					status: 400,
					message: "Unable to perform actum credit payment"
				};
				res.contentType( "application/json" );
				res.json( json );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "Error:", err );
			const json = {
				status: 400,
				message: "Unable to perform actum credit payment"
			};
			res.contentType( "application/json" );
			res.json( json );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "Error:", err );
		const json = {
			status: 400,
			message: "Unable to fetch practice details"
		};
		res.contentType( "application/json" );
		res.json( json );
	} );
}

function testMakeAmortizationSchedule( req, res ) {
	const reqParams = req.allParams();
	const principal = parseFloat( reqParams.principal );
	const payment = parseFloat( reqParams.payment );
	const interestRate = parseFloat( reqParams.interestRate );
	const term = parseFloat( reqParams.term );
	res.json( MathExt.makeAmortizationSchedule( principal, payment, interestRate, term ) );
}

function archiveIncompleteApplications(req, res) {
	return CronService.archiveIncompleteApplications()
	.then(() => {
		return res.json({success:true})
	})
	.catch((err) => {
		res.json({error: err.message})
	})
}

function expiredUsersDenied(req, res) {
	return CronService.expiredUsersDenied()
	.then(() => {
		return res.json({success:true})
	})
	.catch((err) => {
		res.json({error: err.message})
	})
}

function mkdirp(filepath) {
    var dirname = path.dirname(filepath);

    if (!fs.existsSync(filepath)) {
        mkdirp(dirname);
    }else {
        return;
    }

        fs.mkdirSync(filepath);
}

function testExportFundedContracts(req, res){
	const Promise = require('bluebird');
	try {
		let paymentmanagement_criteria = {};	// Find all
		let promiseArr = [];
		let csvTable = [];
		let csvHeaderObj = null;

		return PaymentManagement.find(paymentmanagement_criteria)
		.then(function(paymentmanagementData){
			//Only keep the funded records
			paymentmanagementData = _.filter(paymentmanagementData,function(item){
				if(item.status == "FUNDED"){
					return true;
				}
			});

			paymentmanagementData.forEach(function(currentPaymentmanagement){
				promiseArr.push(() => {
					return processEachFundedContract_FullSpec(currentPaymentmanagement.id)
					.then(function(result){
						csvTable.push(result.csv);

						if (!csvHeaderObj) {
							csvHeaderObj = result.csvHeaderObj;
						}
					});
				});
			});
		})
		.then(function(){
			return Promise.each(promiseArr, (fn) => fn()).then(function(){
				if (csvHeaderObj.length > 0) {
					let csvPath = path.join(process.cwd(), '/firstAssociatesUpload/ExportedAllFundedContracts');
					mkdirp(csvPath);
					let fileName = moment().format() + "_" + "AllFundedContracts" + ".csv";
					const filePath = path.join(csvPath, fileName);
					const createCsvWriter = csvWriter.createObjectCsvWriter({path: filePath,header:csvHeaderObj});
					createCsvWriter.writeRecords(csvTable).then(function(){
						sails.log.info("testExportFundedContracts :: Wrote CSV to " + filePath);
						res.json({message: "CSV data saved successfully", csvTable: csvTable});
					}).catch((errorObj) => {
						sails.log.error("testExportFundedContracts :: create csv err", errorObj);
						const errors = errorObj.message;
						sails.log.error("testExportFundedContracts :: create csv err", errors);
						res.json({status: 500, message: err.message});
					});
				}else{
					sails.log.info("testExportFundedContracts :: No CSV data to save");
					res.json({message: "No CSV data to save"});
				}
				
			})
		})

	} catch (err) {
		res.json({status: 500, message: err.message});
	}

	// processEachFundedContract_FullSpec("5d84074919a7ce6555798a88")
	// .then(function(result){
	// 	return res.json({csv: result.csv});
	// });
}

// Generate report for each funded contract"
function processEachFundedContract_FullSpec(paymentId) {
    return new Promise((resolve,reject) => {
        const csvColumnMappings = {
            loanReference: "Loan",
            paymentId: "Pri Loan ID",
            practiceNameSecPortfolio: "Sec Portfolio",
            secSubPortfolio: "Sec Portfolio",
            debitOnFile: "DebitOnFile",
            eCheckOnFile: "ECheckOnFile",
            smsVerificationStatus: "SMS Verification Status",
            borrowerFirstName: "Borrower First Name",
            borrowerLastName: "Borrower Last Name",
            borrowerEmail: "Borrower Email",
            borrowerPrimaryPhone: "Borrower Pri Phone",
            borrowerSecondaryPhone: "Borrower Sec Phone",
            borrowerAddress: "Borrower Address",
            borrowerCity: "Borrower City",
            borrowerState: "Borrower State",
            borrowerZipCode: "Borrower Zipcode",
            borrowerSSN: "Borrower SSN",
            borrowerDOB: "Borrower DOB",
            hasBorrowerEmail: "Borrower Email",
            borrowerBankRoutingNumber: "Borrower Bank Routing Number",
            borrowerBankAccountNumber: "Borrower Bank Account Number",
            borrowerCreditScore: "Borrower Credit Score FICO 09",

            coBorrowerFirstName: "CoBorrower First Name",
            coBorrowerLastName: "CoBorrower Last Name",
            coBorrowerEmail: "CoBorrower Email",
            coBorrowerPrimaryPhone: "CoBorrower Pri Phone",
            coBorrowerSecondaryPhone: "CoBorrower Sec Phone",
            coBorrowerAddress: "CoBorrower Address",
            coBorrowerCity: "CoBorrower City",
            coBorrowerState: "CoBorrower State",
            coBorrowerZipCode: "CoBorrower Zipcode",
            coBorrowerSSN: "CoBorrower SSN",
            coBorrowerDOB: "CoBorrower DOB",
            coBorrowerSecondaryEmail: "CoBorrower Email",
            coBorrowerRoutingNumber: "Co-Borrower Bank Routing Number",
            coBorrowerAccountNumber: "Co-Borrower Bank Account Number",
            coBorrowerCreditScore: "Co-Borrower Credit Score FICO 09",
            borrowerEmployerPhone: "Employer Phone",
            practiceName: "Source Company",
            loanStatus: "Loan Status",
            loanSubStatus: "Loan SubStatus",
            financedAmount: "Loan Amount",
            interestRate: "Interest Rate",
            loanTerm: "Term",
            paymentFrequency: "Payment Freq",
            loanSetDate: "Contract Date",
            firstPaymentDate: "1st Payment Date",
            paymentAmount: "Payment Amount",
            loanStartDate: "Contract Date",
            nextPaymentScheduleAmount: "nextScheduledPaymentAmount",
            numberOfScheduledPayments: "numberOfScheduledPayments",
            maturityDate: "originalMaturityDate",
            purchasedPoolId: "PurchasedPoolID",
            fundingTier: "Funding Tier",
            isAchAutoPay: "If ACH Autopay (Y/N)",
            mla: "MLA",
            mapr: "MAPR",
            loanTypeFALS: "LoanType_FALS",
            // New fileds
            userReference: "User Reference",
            r1Values: "R1_Values",
            r2Values: "R2_Values",
            r3Values: "R3_Values",
            r4Values: "R4_Values",
            r5Values: "R5_Values",
            r6Values: "R6_Values",
            r7Values: "R7_Values",
            createdDate: "Created Date",
            lastScreenDetails: "LastScreen Details",
            annualIncome: "Annual Income",
            monthlyIncome: "Monthly Income",
            anticipatedFinancedAmount: "Anticipated Financed Amount",
            preDTIDebt: "PreDTI Debt",
            preDTIDebtPercentage: "PreDTI Debt(%)",
            payrollDetectedIncome: "Payroll Detected Income",
            housingExpense: "Housing Expense",
            housingType: "Housing Type (Application)",
            counterOffered: "Counter offered",
            incomeType: "Income Type",
            plaidCompleted: "Plaid Completed (Y/N?)",
            plaidCurrentBalance: "Plaid Current Balance"
        };



        const csvHeaderObj = [];
        const csvRows = [];
        let fileName = "Flow";
        _.each(Object.keys(csvColumnMappings), (columnData) => {
            csvHeaderObj.push({id: columnData, title: csvColumnMappings[columnData]});
        });
        PaymentManagement.findOne({id: paymentId})
        // PaymentManagement.find({hasFirstAssociatesBeenUploaded: {$ne: 1}, loanSetdate: {$exists: true}, achstatus: 1, status: "OPENED", procedureWasConfirmed: 1})
            .populate('practicemanagement')
            .populate('screentracking')
            .populate('user')
            .populate('account')
            .then((paymentManagement) => {
                if(paymentManagement) {

                        const practiceManagement =  paymentManagement.practicemanagement || {};
                        const screenTracking = paymentManagement.screentracking || {};
                        const offerData = screenTracking.offerdata && screenTracking.offerdata.length > 0?screenTracking.offerdata[0]: {};
                        const userData = paymentManagement.user || {};
                        const paymentSchedules = paymentManagement.paymentSchedule;
                        const account = paymentManagement.account || {};
                        let firstPayment = {};
                        let nextPayment = {};
                        if(paymentSchedules && paymentSchedules.length > 0) {
                            _.each(paymentSchedules, (paymentSchedule) => {
                                if(paymentSchedule.monthcount === 1) {
                                    firstPayment = paymentSchedule;
                                }else if(paymentSchedule.monthcount === 2) {
                                    nextPayment = paymentSchedule;
                                }
                            });
                        }
                        const csvData = {};
                        let loanReference = paymentManagement.loanReference;
                        let fullLoanReference = loanReference;
                        if(!!paymentManagement.loanReference){
                            loanReference = loanReference.replace("_","-");
                            fullLoanReference = loanReference;

                            if( loanReference.toLowerCase().startsWith("pfi-")){
                                loanReference = loanReference.substr(4);
                            }else if(loanReference.toLowerCase().startsWith("ln-")){
                                loanReference = loanReference.substr(3);
                            }
                        }
                        csvData["loanReference"] = loanReference;
                        // csvData["paymentId"] = paymentManagement.id;
                        csvData["paymentId"] = fullLoanReference;
                        csvData["practiceNameSecPortfolio"] = practiceManagement.PracticeName + " - New IHF Purchased";
                        csvData["secSubPortfolio"] = "Pool_33";

                        csvData["debitOnFile"] = "FALSE";
                        csvData["eCheckOnFile"] = "FALSE";
                        csvData["smsVerificationStatus"] = "Primary Phone - verified";
                        csvData["borrowerFirstName"] = userData.firstname;
                        csvData["borrowerLastName"] = userData.lastname;
                        csvData["borrowerEmail"] = userData.email;
                        csvData["borrowerPrimaryPhone"] = userData.phoneNumber;
                        csvData["borrowerSecondaryPhone"] = "";
                        csvData["borrowerAddress"] = userData.street;
                        csvData["borrowerCity"] = userData.city;
                        csvData["borrowerState"] = userData.state;
                        csvData["borrowerZipCode"] = userData.zipCode;
						csvData["borrowerSSN"] = userData.ssn_number;
						if(userData.dateofBirth && moment(userData.dateofBirth, moment.ISO_8601, true).isValid()){
							csvData["borrowerDOB"] = moment(userData.dateofBirth).format("MM/DD/YYYY");
						}else{
							csvData["borrowerDOB"] = "";
						}
                        
                        csvData["hasBorrowerEmail"] = !!userData.email?"Yes":"No";

                        csvData["borrowerCreditScore"] = screenTracking.creditscore;

                        csvData["coBorrowerFirstName"] = "";
                        csvData["coBorrowerLastName"] = "";
                        csvData["coBorrowerEmail"] = "";
                        csvData["coBorrowerPrimaryPhone"] = "";
                        csvData["coBorrowerSecondaryPhone"] = "";
                        csvData["coBorrowerAddress"] = "";
                        csvData["coBorrowerCity"] = "";
                        csvData["coBorrowerState"] = "";
                        csvData["coBorrowerZipCode"] = "";
                        csvData["coBorrowerSSN"] = "";
                        csvData["coBorrowerDOB"] = "";
                        csvData["coBorrowerSecondaryEmail"] = "";
                        csvData["coBorrowerRoutingNumber"] = "";
                        csvData["coBorrowerAccountNumber"] = "";
                        csvData["coBorrowerCreditScore"] = "";

                        csvData["borrowerEmployerPhone"] = "";
                        csvData["practiceName"] = practiceManagement.PracticeName;
                        csvData["loanStatus"] = "Active";
                        csvData["loanSubStatus"] = "Current Loan";
                        csvData["financedAmount"] = paymentManagement.payOffAmount;
                        csvData["interestRate"] = offerData.interestRate;
                        csvData["loanTerm"] = offerData.term;
                        csvData["paymentFrequency"] = "Monthly";
                        csvData["loanSetDate"] = paymentManagement.loanSetdate?moment(paymentManagement.loanSetdate).format("MM/DD/YYYY"): "";
                        csvData["firstPaymentDate"] = firstPayment.date?moment(firstPayment.date).format("MM/DD/YYYY"): "";
                        csvData["paymentAmount"] = firstPayment.amount;
                        csvData["loanStartDate"] = paymentManagement.loanStartdate?moment(paymentManagement.loanStartdate).format("MM/DD/YYYY"): "";
                        // csvData["nextPaymentScheduleAmount"] = nextPayment.date?moment(nextPayment.date).format("MM/DD/YYYY"): "";
                        csvData["nextPaymentScheduleAmount"] = nextPayment.amount;

                        csvData["numberOfScheduledPayments"] = paymentSchedules?paymentSchedules.length: "";
                        csvData["maturityDate"] = paymentManagement.maturityDate? moment(paymentManagement.maturityDate).format("MM/DD/YYYY"):"";
                        csvData["purchasedPoolId"] = "Pool_33";
                        if(!!offerData.creditTier) {
							if (offerData.fundingRate) {
								csvData["fundingTier"] = `Tier ${offerData.creditTier}_${offerData.fundingRate}`;
							}else{
								csvData["fundingTier"] = `Tier ${offerData.creditTier}`;
							}
                        }else {
                            csvData["fundingTier"] = "";
                        }
                        csvData["isAchAutoPay"] = "Y";
                        csvData["mla"] = "";
                        csvData["mapr"] = "";
                        csvData["loanTypeFALS"] = "Elective Surgery";
                        csvData["borrowerBankRoutingNumber"] = account.routingNumber;
                        csvData["borrowerBankAccountNumber"] = account.accountNumber ? account.accountNumber.toString() : "";
                        // New fields
                        csvData['userReference'] = userData.userReference;
                        for(let i = 0; i < 7; i++){
                            let tmp = i + 1;
                            if(screenTracking && screenTracking.rulesDetails && screenTracking.rulesDetails.ruledatacount && screenTracking.rulesDetails.ruledatacount[i]){
                                csvData['r' + tmp + 'Values'] = screenTracking.rulesDetails.ruledatacount[i];
                            }else{
                                csvData['r' + tmp + 'Values'] = "";
                            }
                        }
                        csvData['createdDate'] = paymentManagement.createdAt ? moment(paymentManagement.createdAt).format("MM/DD/YYYY"):"";
                        csvData['lastScreenDetails'] = screenTracking.lastScreenName;
                        csvData['annualIncome'] = screenTracking.incomeamount * 12;
                        csvData['monthlyIncome'] = screenTracking.incomeamount;
                        csvData['anticipatedFinancedAmount'] = screenTracking.offerdata[0] ? screenTracking.offerdata[0].financedAmount || "" : "";
                        csvData['preDTIDebt'] = screenTracking.preDTIMonthlyAmount;   
                        csvData['preDTIDebtPercentage'] = screenTracking.preDTIPercentValue;
                        csvData['payrollDetectedIncome'] = screenTracking.detectedPayroll;
                        csvData['housingExpense'] = screenTracking.housingExpense;
                        csvData['housingType'] = screenTracking.residenceType;
                        csvData['counterOffered'] = (screenTracking.loanchangeManually || screenTracking.loanchanged) ? "Y" : "N";
                        if(screenTracking.incometype == "Manually"){
                            csvData['incomeType'] = "Entered Manually";
                        }else if(screenTracking.incometype == "Automatically"){
                            csvData['incomeType'] = "Detected from Payroll";
                        }else{
                            csvData['incomeType'] = "Modified by admin";
                        }
                        csvData['plaidCompleted'] = screenTracking.filloutmanually ? "N" : "Y";
                        csvData['plaidCurrentBalance'] = account.balance ? account.balance.current : "";


                        resolve({status: "success", csv: csvData, csvHeaderObj: csvHeaderObj});
                }else{
					reject("PaymentID not found");
				}

            }).catch((errorObj) => {
            sails.log.error("processEachFundedContract_FullSpec :: err", errorObj);
            const errors = errorObj.message;
            sails.log.error("processEachFundedContract_FullSpec :: err", errors);
            reject(errorObj);
        });
    });
}

function procedureConfirmedMailer(req, res) {
	// let firstDay = new Date(2019, 8, 19, 0, 0, 0, 0);
	// let fifthDay = new Date(2019, 8, 28, 0, 0, 0, 0);
	return CronEmailService.sendProcedureConfirmedMailer().then(data => {
		return res.json({success:true, dates: data});
	}).catch((err) => {
		res.json({error: err.message})
	})
}

function  procedureConfirmedEmail(req, res) {
return res.view('emailTemplates/procedureConfirmed',
	  {
		layout:false,
		accountNum: "MHF-0000",
		practiceName: "Elective Surgery Medical",
		financedAmount: 8000,
		procedureDate: moment().tz('UTC').toDate(),
		monthlyPayment: 555.55,
		firstPaymentDate: moment().tz('UTC').toDate(),
		borrower: {
			firstName: "Test",
			lastName: "User",
			street: "123 E Fake Dr",
			city: "Big City",
			state: "OM",
			zipCode: "12345",
			phone: "(012)345-6789",
			ssn: "0987" 
		},
		bank: {
			autopay: "ACH",
			bankName: "Goliath National Bank",
			accountType: "checking",
			accountLast4: "3456"
		}
	});
}
