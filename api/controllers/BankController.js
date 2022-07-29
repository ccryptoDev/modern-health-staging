/* global sails User Screentracking Repullbankaccount PayrollDetection ApplicationService InstitutionService UserBankAccount Account PlaidUser BankService PaymentManagement Agreement Esignature PracticeManagement */
/**
 * BankController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

'use strict';
const moment = require( "moment" );
const _ = require( "lodash" );
const fs = require( "fs" );
// const srcFile = __filename.slice(__dirname.length + 1, -3 );

module.exports = {
	getbanktransaction: getbanktransaction,
	addBankTransaction: addBankTransaction,
	saveplaiddetails: saveplaiddetails,
	updateUserdataPlaid: updateUserdataPlaidAction,
	saveplaidresponse: saveplaidresponse,
	savePlaidResponseError: savePlaidResponseError,
	savebankinfo: savebankinfo,
	addbanklogin: addbanklogin,
	addbankloginpost: addbankloginpost,
	addbankGetConsent: addbankGetConsent,
	addbankSaveConsent: addbankSaveConsent,
	addbankThankyou: addbankThankyou,
	changeBank: changeBank,
	repullPlaidInfo: repullPlaidInfo,
	getrepullPlaidDetails: getrepullPlaidDetails
};

function getbanktransaction( req, res ) {
	const resstatusvalue = req.flash( "resstatus" );
	const message = req.flash( "resmessage" );
	const linkbankid = "";
	const linkaccountid = "";
	let userBankAccountres;
	req.session.applicationerror = "";
	const criteria = { id: req.session.userId };
	const ip = ( req.headers[ "x-forwarded-for" ] || req.headers[ "x-real-ip" ] || req.connection.remoteAddress ).replace( "::ffff:", "" ).replace( /^::1$/, "127.0.0.1" );
	User.findOne( criteria )
	.then( function( userDetails ) {
		let applicationIncomplete = false;
		return Screentracking.findOne( { user: userDetails.id, iscompleted: 0 } )
		.sort( "createdAt DESC" )
		.then( function( screenDetails ) {
			if( screenDetails ) {
				applicationIncomplete = true;
				return screenDetails;
			}
			if( !req.options.addbankWorkflowStep ) {
				throw new Error( "No application found" );
			}
			return Screentracking.findOne( { user: userDetails.id } )
			.sort( "createdAt DESC" );
		} )
		.then( ( screenDetails ) => {
			req.session.screentrackingId = screenDetails.id;
			sails.log.info( "screenDetails",screenDetails );
			const startdate = moment().subtract( 180, "days" ).format( "YYYY-MM-DD" );
			const enddate = moment().format( "YYYY-MM-DD" );
			let totalpayroll = 0;
			const subTypeArray = [];
			const payRollArray = [];

			return Repullbankaccount.getRepullAccountList( screenDetails, userDetails.id )
			.then( function( bankAccountList ) {
				// sails.log.info( "bankAccountList", bankAccountList );
				sails.log.info( "bankAccountList.status", bankAccountList.status );
				const addBankRequest = req.options && req.options.addbankWorkflowStep && ( req.options.addbankWorkflowStep == 3 );
				if( bankAccountList.status == 200 && !addBankRequest ) {
					userBankAccountres = bankAccountList.data;

					// sails.log.info( "userBankAccountres==========",userBankAccountres );

					return Repullbankaccount.getMultiloanRepull( screenDetails, userDetails.id, userBankAccountres )
					.then( function( bankAccount ) {
						// console.log( "bankAccount: %j", bankAccount );
						const userBankAccount = bankAccount.userBankAccount;
						let accountTransactions = [];
						_.forEach( userBankAccount, function( userbankData ) {

							_.forEach( userbankData.accounts, ( account ) => {
								if( account.subtype !== "credit card" ) {
									account.institutionName = userbankData.institutionName;
									account.bankid = userbankData.id;
									subTypeArray.push( account );
								}
							} );

							/* ==============PAY DATE Ticket Update ========================== */
							// console.log( "userbankData: %j", userbankData );

							_.forEach( userbankData.transactions, function( transactions ) {
								accountTransactions = accountTransactions.concat( transactions );
							} );
							/* ==============PAY DATE Ticket Update ========================== */
						} );

						const payrollDetected = PayrollDetection.getInfo( accountTransactions, userDetails.id );
						// sails.log.info( "BankController.getbanktransactionAction; payrollDetected:", JSON.stringify( payrollDetected ) );
						const payrolldata = payrollDetected.payrolls;
						payrollDetected.transactions.forEach( ( transaction ) => {
							if( transaction.date < startdate || transaction.date > enddate ) {
								return;
							}
							const payRollItem = _.clone( transaction );
							payRollItem.amount = Math.abs( parseFloat( payRollItem.amount ) ).toLocaleString( "en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 } );
							payRollItem.category = payRollItem.category.join( ", " );
							payRollArray.push( payRollItem );
							// sails.log.info( "BankController.getbanktransactionAction; payRollItem: %j", payRollItem );
						} );

						totalpayroll = payrollDetected.annualIncome;
						sails.log.info( "BankController.getbanktransactionAction; totalpayroll:", totalpayroll );

						// if( totalpayroll > 0 ) {
						// 	totalpayroll = parseFloat( ( totalpayroll / sails.config.plaid.grossIncomeRate ).toFixed( 2 ) );
						// 	sails.log.info( "BankController.getbanktransactionAction; totalpayroll w/ grossIncomeRate:", totalpayroll );
						// }

						let screenQuery;
						let screenUpdate;
						if( req.options.addbankWorkflowStep ) {
							screenQuery = { user: userDetails.id, addbanklastlevel: { "!": null } };
							screenUpdate = { totalpayroll: totalpayroll, payrolldata: payrolldata, addbanklastlevel: 5, lastScreenName: "Bank Info" };
						} else {
							screenQuery = { id: screenDetails.id };
							screenUpdate = { totalpayroll: totalpayroll, payrolldata: payrolldata, lastlevel: 3, lastScreenName: "Bank Info" };
							req.session.levels = 3;
						}
						return Screentracking.update( screenQuery, screenUpdate )
						.then( ( updated ) => {
							if( req.options.addbankWorkflowStep ) {
								return res.redirect( "/addbank/consents" );
							}
							const screentracking = updated[ 0 ];
							return ApplicationService.getProductRuleBanking( screentracking )
							.catch( ( err ) => {
								sails.log.error( "getbanktransaction; catch:", err );
							} )
							.then( () => {
								req.session.levels = 3;
								return res.redirect( "/banktransaction" );
							} );
						} );
					} );
				} else {
					const creditTierCriteria = { practicemanagement: userDetails.practicemanagement };
					if( screenDetails.lockCreditTier ) {
						creditTierCriteria.creditTier = screenDetails.lockCreditTier;
					} else {
						creditTierCriteria.minCreditScore = { $lte: screenDetails.creditscore };
						creditTierCriteria.maxCreditScore = { $gte: screenDetails.creditscore };
					}
					LoanCreditTier.findOne( creditTierCriteria )
					.then((creditTier) => {
						PracticeManagement.findOne({ id: screenDetails.practicemanagement })
						.then(( practicemanagementdata ) => {
							const loaninterestcriteria = {
								practicemanagement: practicemanagementdata.id,
								creditTier: creditTier.creditTier
							}
							Loaninterestrate.findOne(loaninterestcriteria)
							.then((loaninterestrate) => {
								const userBankAccount = [];
								const templateData = {
									user: userDetails,
									accountDetails: subTypeArray,
									payRollArray: payRollArray,
									userBankAccount: userBankAccount,
									status: resstatusvalue,
									message: message,
									practiceName: practicemanagementdata.PracticeName,
									ip: ip,
									agreementObject: { date: moment().format( "MM/DD/YYYY" ) },
									username: `${userDetails.firstname} ${userDetails.lastname}`,
									screenDetails: screenDetails,
									totalpayroll: totalpayroll,
									incomeamount: screenDetails.incomeamount,
									linkaccountid: linkaccountid,
									linkbankid: linkbankid,
									applicationIncomplete: applicationIncomplete,
									loanAmount: creditTier.loanAmount,
									creditTier: creditTier,
									interestRate: loaninterestrate.interestRate || 0.0
								};
								return res.view( "frontend/banktransaction/getbankdetails", templateData );
							})
						});
					});
					// return res.view( "frontend/banktransaction/getbankdetails", templateData );
				}
			} )
			.catch( function( err ) {
				sails.log.error( "BankController.getbanktransactionAction; catch:", err );
				const responsedata = { status: 400, message: "You are not allowed to change bank accounts." };
				return res.view( "frontend/banktransaction/getbankdetails", responsedata );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "BankController.getbanktransactionAction; catch:", err );
			const responsedata = { status: 400, message: "You are not allowed to change bank accounts." };
			return res.view( "frontend/banktransaction/getbankdetails", responsedata );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "BankController.getbanktransactionAction; catch:", err );
		const responsedata = { status: 400, message: "You are not allowed to change bank accounts." };
		return res.view( "frontend/banktransaction/getbankdetails", responsedata );
	} );
}

function addBankTransaction( req, res ) {
	return getbanktransaction( req, res );
}

function saveplaidresponse( req, res ) {
	// var payID = req.param( "payid" );
	// var bankToken = req.param( "bankToken" );
	const public_token = req.param( "public_token" );
	const account_id = req.param( "account_id" );
	let addBankRequest = req.param( "addBankRequest" );
	if( addBankRequest && addBankRequest == "true" ) {
		addBankRequest = true;
	} else {
		addBankRequest = false;
	}
	const institutionName = account_id.institution.name;
	const institutionType = account_id.institution.institution_id;
	const user = req.user;

	const plaiddata = {
		public_token: public_token,
		account_id: account_id,
		institutionName: institutionName,
		institutionType: institutionType,
		userid: req.session.userId,
		useremail: user.email
	};
	const plaiddatares = JSON.stringify( plaiddata );
	fs.appendFileSync( "logs/plaidResponse" + req.session.userId + "_" + moment().format( "YYYY-MM-DD-hh-mm-ss") + ".txt", plaiddatares );
	User.findOne( { id: req.session.userId } )
	.then( function( userDetails ) {
		return Screentracking.findOne( { user: userDetails.id, iscompleted: 0 } )
		.sort( "createdAt DESC" )
		.then( function( screenDetails ) {
			if( screenDetails ) {
				return screenDetails;
			}
			return Screentracking.findOne( { user: userDetails.id } ).sort( "createdAt DESC" );
		} )
		.then( function( screenDetails ) {
			if( ! screenDetails ) {
				return Promise.reject( new Error( "missing screen details" ) );
			}
			return InstitutionService.generateAccessToken( public_token )
			.then( function( access_token ) {
				const token = access_token.access_token;
				return InstitutionService.accountDetail( token )
				.then( function( accountDetails ) {
					sails.log.info( "accountDetails1111111:", accountDetails );
					sails.log.info( "session:", req.session );
					return UserBankAccount.createInstitutionDetail( institutionName, institutionType, accountDetails, userDetails, token, screenDetails.id )
					.then( function( userBankAccntDet ) {
						sails.log.info( "userBankAccntDet:", userBankAccntDet );
						if( ! userBankAccntDet ) {
							res.contentType( "application/json" );
							return res.json( { status: 400, message: "Your bank account details not saved." } );
						}
						if( userBankAccntDet.status && userBankAccntDet.status != 200 ) {
							return res.json( userBankAccntDet );
						}
						return Repullbankaccount.getRepullAccountList( screenDetails, userDetails.id )
						.then( function( bankAccountlist ) {
							sails.log.info( "bankAccountlist", bankAccountlist );
							let userAccntDet;
							if ( bankAccountlist.status != 200 ) {
								return Promise.reject( new Error( "missing bank details" ) );
							}
							const userBankAccountres = bankAccountlist.data;
							return Repullbankaccount.getMultiloanRepull( screenDetails, userDetails.id, userBankAccountres )
							.then( function( bankAccount ) {
								const userBankAccount = bankAccount.userBankAccount;
								let accountTransactions = [];
								_.forEach( userBankAccount, function( userbankData ) {
									_.forEach( userbankData.transactions, function( transactions ) {
										accountTransactions = accountTransactions.concat( transactions );
									} );
								} );

								// sails.log.verbose( "BankController.saveplaidresponse; accountTransactions:", JSON.stringify( accountTransactions ) );
								const payrollDetected = PayrollDetection.getInfo( accountTransactions, userDetails.id );
								sails.log.info( "BankController.saveplaidresponse; payrollDetected:", JSON.stringify( payrollDetected ) );
								const payrolldata = payrollDetected.payrolls;

								const totalpayroll = payrollDetected.annualIncome;
								sails.log.info( "BankController.saveplaidresponse; totalpayroll:", totalpayroll );

								// if ( totalpayroll > 0 ) {
								// 	totalpayroll = parseFloat( ( totalpayroll / sails.config.plaid.grossIncomeRate ).toFixed( 2 ) );
								// 	sails.log.info( "BankController.saveplaidresponse; totalpayroll w/ grossIncomeRate:", totalpayroll );
								// }

								let bankId;
								let itemId;
								return Screentracking.update( { id: screenDetails.id }, { totalpayroll: totalpayroll, payrolldata: payrolldata } )
								.then( () => {
									userBankAccount.some( ( bankdetails ) => {
										bankdetails.accounts.some( ( accountDetail ) => {
											if( accountDetail.subtype !== "credit card" ) {
												bankId = bankdetails.id;
												itemId = accountDetail._id;
												return true;
											}
										} );
										if( bankId && itemId ) { return true; }
									} );
									fs.appendFileSync( "logs/plaidResponse" + req.session.userId + "_" + moment().format( "YYYY-MM-DD-hh-mm-ss" ) + ".txt", "itemId = " + itemId + "\n\n\n" );
									fs.appendFileSync( "logs/plaidResponse" + req.session.userId + "_" + moment().format( "YYYY-MM-DD-hh-mm-ss" ) + ".txt", "bankId = " + bankId + "\n\n\n" );
									return Account.createAccountDetail( userBankAccntDet.userBankAccount, userDetails, itemId, itemId, "", screenDetails.incomeamount )
									.then( function( accDet ) {
										if( accDet ) {
											userAccntDet = accDet;
											return Account.update( { id: accDet.id }, { totalpayroll: screenDetails.totalpayroll, payrolldatearray: screenDetails.payrolldatearray } );
										}
										return Promise.reject( new Error( "missing account detail" ) );
									} );
								} )
								.then( () => {
									if( addBankRequest ) {
										const changes = {
											data: userAccntDet,
											accounts: userAccntDet.id,
											// -- Added for multiple loans
											isAccountLinked: 1
										};
										return Screentracking.update( { id: screenDetails.id }, changes );
									}
									const lastlevel = 3;
									return Screentracking.updateLastScreenName( userDetails, "Offers Details", lastlevel, userAccntDet, userAccntDet.id, "", [] )
								} )
								.then( function( screenTracking ) {
									res.contentType( "application/json" );
									return res.json( { status: 200, message: "success", bankid: bankId, bankaccount: itemId } );
								} );
							} );
						} );
					} );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "BankController.saveplaidresponse; catch:", err );
				res.contentType( "application/json" );
				res.json( { status: 400, message: "Your bank account details not saved." } );
			} );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "BankController.saveplaidresponse; catch:", err );
		res.contentType( "application/json" );
		res.json( { status: 400, message: "Your bank account details not saved." } );
	} );
}

function saveplaiddetails( req, res ) {
	// sails.log.info("Plaid called");

	const public_token = req.param( "public_token" );
	const account_id = req.param( "account_id" );
	req.session.first_name = req.param( "firstName" );
	req.session.last_name = req.param( "lastName" );
	req.session.security_number = req.param( "ssn" );
	const institutionName = account_id.institution.name;
	const institutionType = account_id.institution.institution_id;
	const practimeManagementID = req.session.appPracticeId;

	const plaiddata = {
		public_token: public_token,
		account_id: account_id,
		institutionName: institutionName,
		institutionType: institutionType
		// userid:  user.id,
		// useremail:  user.email
	};

	const plaiddatares = JSON.stringify( plaiddata );

	fs.appendFileSync( "logs/plaidResponse_" + moment().format( "YYYY-MM-DD-hh-mm-ss" ) + ".txt", plaiddatares );

	InstitutionService.generateAccessToken( public_token ).then( function( access_token ) {
		const token = access_token.access_token;

		// sails.log.info("token: ",token);

		InstitutionService.accountDetail( token )
		.then( function( accountDetails ) {
			// sails.log.info("accountDetails11111asdff11: ");

			UserBankAccount.createInstitutionDetail( institutionName, institutionType, accountDetails, "", token ).then( function( userBankAccntDet ) {
				// sails.log.info("userBankAccntDet::::::::::::::",userBankAccntDet)
				if( userBankAccntDet ) {
					if( userBankAccntDet.status != 200 ) {
						res.contentType( "application/json" );
						res.json( userBankAccntDet );
					}
					// clicktosave starts here
					req.session.isplaidConnected = 1;
					let clicktoSave = 0;
					if( "undefined" !== typeof req.session.clicktosave && req.session.clicktosave != "" && req.session.clicktosave != null && req.session.clicktosave == "1" ) {
						clicktoSave = 1;
					}
					// -- Register user details in user table
					User.registerNewPlaidUserApplication( userBankAccntDet, practimeManagementID, clicktoSave, req )
					.then( function( responseData ) {
						if( responseData.code == 200 ) {
							const userData = responseData.userData;
							const userID = responseData.userData.id;
							const userBankAccountID = responseData.plaidData.userBankAccount;
							const plaidID = responseData.plaidData.id;

							const bankcriteria = { id: userBankAccountID };
							const updatecriteria = { user: userID };

							const plaidcriteria = { id: plaidID };

							UserBankAccount.update( bankcriteria, updatecriteria ).exec( function afterwards( err, updated ) {
								PlaidUser.update( plaidcriteria, updatecriteria ).exec( function afterwards( err, updated ) {
									Screentracking.createLastScreenName( "Plaid", 2, responseData.userData, "", "", "" ).then( function( screenObj ) {
										// Added for ticket no 2756 to find out the application type.
										const screenCriteria = { id: screenObj.id };
										Screentracking.update( screenCriteria, { applicationType: "Application wizard" } ).exec( function afterwards( err, screentrackingupdated ) {} );

										// req.session.userId = userID;
										req.session.applicationuserId = userID;
										req.session.userEmail = userData.email;
										if( !req.session.Electronicsign ) {
											req.session.Electronicsign = "";
										}

										// var userCriteria = {id:req.session.userId}
										const userCriteria = { id: req.session.applicationuserId };
										User.update( userCriteria, { consentsChecked: req.session.Electronicsign } ).exec( function afterwards( err, applicationfeeupdated ) {} );

										const json = {
											status: 200,
											message: "success"
										};
										res.contentType( "application/json" );
										res.json( json );
									} );
								} );
							} );
						} else if( responseData.code == 300 ) {
							const plaiduserDetails = responseData.plaidData;
							const isuserInput = plaiduserDetails.isuserInput;

							const userBankAccountID = plaiduserDetails.userBankAccount;
							const plaidID = plaiduserDetails.id;

							req.session.isplaidEmpty = isuserInput;
							req.session.tempplaidID = plaidID;
							req.session.tempuserBankAccountID = userBankAccountID;

							const json = {
								status: 200,
								message: "Empty plaid user data"
							};
							res.contentType( "application/json" );
							res.json( json );
						} else if( responseData.code == 500 ) {
							const json = {
								status: 400,
								message: "Your email address already exist in system."
							};
							res.contentType( "application/json" );
							res.json( json );
						} else {
							const json = {
								status: 400,
								message: "Unable to register. Try again"
							};
							res.contentType( "application/json" );
							res.json( json );
						}
					} )
					.catch( function( err ) {
						const json = {
							status: 400,
							message: "Unable to register. Try again"
						};
						res.contentType( "application/json" );
						res.json( json );
					} );
				} else {
					const json = {
						status: 400,
						message: "Your bank account details not saved."
					};
					res.contentType( "application/json" );
					res.json( json );
				}

				// sails.log.info("userBankAccntDet: ",userBankAccntDet);

				// req.session.userId = userBankAccntDet.userData.id;
				// req.session.userEmail = userBankAccntDet.userData.email;
				// if(!req.session.Electronicsign){ req.session.Electronicsign = ''; }

				// var userCriteria = {id:req.session.userId}
				// User.update(userCriteria, {consentsChecked: req.session.Electronicsign}).exec(function afterwards(err, applicationfeeupdated){});

				/* if(userBankAccntDet)
						   {
								var json = {
									status: 200,
									message: 'success'
								};
								res.contentType('application/json');
								res.json(json);
						   }
						   else
						   {
								var json = {
									status: 400,
									message: 'Your bank account details not saved.'
								};
								res.contentType('application/json');
								res.json(json);
						   }*/
			} );
		} )
		.catch( function( err ) {
			const json = {
				status: 400,
				message: "Your bank account details not saved."
			};
			res.contentType( "application/json" );
			res.json( json );
		} );
	} );
}

function savePlaidResponseError( req, res) {
	sails.log.error(
		"saveplaidresponse: headers:",
		JSON.stringify( req.headers, null, 4 )
	);
	sails.log.error(
		"saveplaidresponse: body:",
		JSON.stringify( req.allParams(), null, 4 )
	);
	res.json( { success: true } );
}
function updateUserdataPlaidAction( req, res ) {
	// sails.log.info("Update fun");

	const ssnNumber = req.param( "ssnNumber" );
	// var userId = req.session.userId;
	const userId = req.session.applicationuserId;
	const userCriteria = { id: userId };

	sails.log.info( "userCriteria ", userCriteria );
	sails.log.info( "ssnNumber ", ssnNumber );

	User.update( userCriteria, { ssnNumber: ssnNumber } ).exec( function afterwards( err, userUpdated ) {
		const json = {
			status: 200,
			message: "success"
		};
		res.contentType( "application/json" );
		res.json( json );
	} );
}

async function savebankinfo( req, res ) {
	let userid = req.param( "userid" );
	if( !userid ) {
		/*
			userid coming from the body instead of the session indicates that this is a bank account
			being created by an admin for a user
		*/
		userid = req.session.userId ? req.session.userId : req.session.applicationuserId;
	}
	const result = await BankService.updatefilloutmanualdetails( req, userid, 1 );
	if( result.code == 200 ) {
		const screenid = req.param( "screenid" );
		if( screenid ) {
			/*
				If the body contain screenid this is a bank account being created by an admin for a user.
				We need to create an EFTA for the user.
			*/
			const screendata = await Screentracking.findOne( { id: screenid } );
			const userdata = await User.findOne( { id: userid } );
			const payid = req.param( "payid" );
			let paydata = null;
			if( payid ) {
				paydata = await PaymentManagement.findOne( { id: payid } );
			}
			const ip = ( req.headers[ "x-forwarded-for" ] || req.headers[ "x-real-ip" ] || req.connection.remoteAddress ).replace( "::ffff:", "" ).replace( /^::1$/, "127.0.0.1" );

			await ApplicationService.createEFTA( result.account, userdata, screendata, paydata, ip, req, res );

			req.session.savedbankinfo = true;
			const successMsg = req.param( "successMsg" );
			if( successMsg ) {
				req.session.banksuccessmsg = successMsg;
			}
		}
		res.json( { status: 200 } );
	} else {
		const failureMsg = req.param( "failureMsg" );
		if( failureMsg ) {
			req.session.bankerror = failureMsg;
		}
		res.json( { status: 400 } );
	}
}

async function addbanklogin( req, res ) {
	const reqParams = req.allParams();
	const userId = _.get( reqParams, "id", null );
	if( ! userId ) {
		return res.redirect( "/login" );
	}
	const screendata = await Screentracking.findOne( { user: userId, iscompleted: 0 } );
	const templateData = {
		userid: userId,
		applicationIncomplete: screendata ? true: false
	};

	if( req.session.errormsg ) {
		templateData.error = req.session.errormsg;
		delete req.session.errormsg;
	}
	return res.view( "frontend/home/addbanklogin.nunjucks", templateData );
}

async function addbankloginpost( req, res ) {
	const userid = req.param( "userid" );
	return HomeService.login( req, res, `/addbank/login/${userid}`, "/addbank/banktransaction" );
}

async function addbankGetConsent( req, res ) {
	const userId = req.session.userId;
	const practiceId = req.session.practiceId;
	const screendata = await Screentracking.findOne( { user: userId, iscompleted: 0 } );
	const templateData = {
		applicationIncomplete: screendata ? true: false
	};

	if( !practiceId ) {
		throw new Error( "An EFTA can not be created with out identifying a partner or practice." );
	}

	const practicedata = await PracticeManagement.findOne( { id: practiceId } );
	templateData.providerName = practicedata.PracticeName;
	templateData.providerAddress = practicedata.StreetAddress;
	templateData.providerCity = practicedata.City;
	templateData.roviderState = practicedata.StateCode;
	templateData.providerZip = practicedata.ZipCode;
	templateData.providerPhone = practicedata.PhoneNo;
	templateData.providerEmail = practicedata.PracticeEmail;
	const doc = await Agreement.findOne( { practicemanagement: practiceId, documentKey: "132" } );
	if( !doc ) {
		throw new Error( `An EFTA template has not been created yet for practice ${practiceId}` );
	}

	templateData.eftaPath = doc.documentPath + ".nunjucks";


	const accounts = await Account.find( { user: userId } ).sort( "createdAt DESC" );
	if( accounts.length == 0 ) {
		throw new Error( `No bank accounts exist for user ${userId}` );
	}

	const bankdata = accounts[ 0 ];

	const userbankdata = await UserBankAccount.findOne( { id: bankdata.userBankAccount } );
	if( doc.signatureRequired ) {
		templateData.eftaSignatureRequired = true;
		const signature = await Esignature.findOne( { account: bankdata.id, user_id: userId, type: 14 } );

		if( signature ) {
			templateData.signatureExistEFT = 1;
			templateData.agreementsignpathEFT = Utils.getS3Url( signature.standardResolution );
		} else {
			templateData.signatureExistEFT = 0;
		}
	} else {
		templateData.eftaSignatureRequired = false;
	}
	templateData.bankName = userbankdata.institutionName;
	templateData.bankAccountType = bankdata.institutionType;
	templateData.bankRoutingNumber = bankdata.routingNumber;
	templateData.bankAccountNumber = bankdata.accountNumber;
	templateData.accountID = bankdata.id;
	templateData.todaydate = moment().format( "MM/DD/YYYY" );
	templateData.ip = ( req.headers[ "x-forwarded-for" ] || req.headers[ "x-real-ip" ] || req.connection.remoteAddress ).replace( "::ffff:", "" ).replace( /^::1$/, "127.0.0.1" );
	templateData.agreementObject = {
		date: templateData.todaydate
	};

	return res.view( "frontend/home/addbankconsent.nunjucks", templateData );
}

async function addbankSaveConsent( req, res ) {
	const userId = req.session.userId;
	const accountid = req.param( "accountid" );
	const screenId = req.session.screentrackingId;
	const ip = ( req.headers[ "x-forwarded-for" ] || req.headers[ "x-real-ip" ] || req.connection.remoteAddress ).replace( "::ffff:", "" ).replace( /^::1$/, "127.0.0.1" );
	const screendata = await Screentracking.findOne( { id: screenId } );

	if( !userId || !screenId ) {
		return res.redirect( "/login" );
	}

	const userdata = await User.findOne( { id: userId } );
	const paydata = await PaymentManagement.findOne( { screentracking: screenId } );
	const account = await Account.findOne( { id: accountid } );
	if( !account ) {
		throw new Error( `The account id passed to addbankSaveConsent (${accountid}) was not found in the database.` );
	}

	await ApplicationService.createEFTA( accountid, userdata, screendata, paydata, ip, req, res );

	const modulename = "User Added Another Bank";
	const modulemessage = "User Added Another Bank Successfully";
	Logactivity.registerLogActivity( req, modulename, modulemessage );

	if( screendata.iscompleted == 0 ) {
		await Screentracking.update(
			{ user: userId, addbanklastlevel: { "!": null } },
			{
				addbanklastlevel: 1
			}
		);
		return res.redirect( "/addbank/thankyou" );
	}

	await Screentracking.update(
		{ user: userId, addbanklastlevel: { "!": null } },
		{
			iscompleted: 1,
			addbanklastlevel: 1
		}
	);

	return res.redirect( "/addbank/thankyou" );
}

async function addbankThankyou( req, res ) {
	const userId = req.session.userId;
	if( ! userId ) {
		return res.redirect( "/login" );
	}
	const userdata = await User.findOne( { id: userId } );
	const screendata = await Screentracking.findOne( { user: userId, iscompleted: 0 } );
	const templateData = {
		email: userdata.email,
		login: sails.config.getBaseUrl + "/login",
		applicationIncomplete: screendata ? true: false
	};
	return res.view( "frontend/home/addbankthankyou", templateData );
}

async function changeBank( req, res ) {
	const userbankaccountID = req.param( "userbankaccountID" );
	const subaccountID = req.param( "subaccountID" );

	const payID = req.param( "id" );
	try {
		if( !payID ) {
			throw new Error( "Contract ID is a required parameter." );
		}
		if( !userbankaccountID ) {
			throw new Error( "User Bank Account ID is a required parameter." );
		}

		const userbankaccountdata = await UserBankAccount.findOne( { id: userbankaccountID } ).populate( "user" );
		if( !userbankaccountdata ) {
			throw new Error( `User Bank Account ${userbankaccountID} is not found.` );
		}

		const subaccount = userbankaccountdata.accounts.find( ( account ) => {
			return account.numbers && account.numbers.account_id == subaccountID;
		} );

		if( !subaccount ) {
			throw new Error( `User Bank Account ${userbankaccountID} has not accounts with the account_id of ${subaccountID}.` );
		}

		let accountdata = await Account.findOne( {
			userBankAccount: userbankaccountdata.id,
			accountNumber: subaccount.numbers.account,
			routingNumber: subaccount.numbers.routing
		} );
		if( !accountdata ) {
			/* we have not used this account before: we need to create an account object */
			accountdata = {};
			if( userbankaccountdata.balance ) {
				accountdata.balance = userbankaccountdata.balance;
			}
			if( userbankaccountdata.institutionType ) {
				accountdata.institutionType = userbankaccountdata.institutionType;
			}
			if( subaccount.meta && subaccount.meta.name ) {
				accountdata.accountName = subaccount.meta.name;
			}
			if( subaccount.meta && subaccount.meta.number ) {
				accountdata.accountNumberLastFour = subaccount.meta.number;
			}
			if( subaccount.numbers && subaccount.numbers.routing ) {
				accountdata.routingNumber = subaccount.numbers.routing;
			}
			if( subaccount.numbers && subaccount.numbers.account ) {
				accountdata.accountNumber = subaccount.numbers.account;
			}
			if( subaccount.numbers && subaccount.numbers.wire_routing ) {
				accountdata.wireRoutingNumber = subaccount.numbers.wire_routing;
			}
			if( subaccount.type ) {
				accountdata.accountType = subaccount.type;
			}
			if( subaccount.subtype ) {
				accountdata.accountSubType = subaccount.subtype;
			}
			accountdata.plaidMeta = {};
			if( subaccount._id ) {
				accountdata.plaidMeta.id = subaccount._id;
			}
			if( subaccount._item ) {
				accountdata.plaidMeta.item = subaccount._item;
			}
			if( subaccount._user ) {
				accountdata.plaidMeta.user = subaccount._user;
			}
			accountdata.type = "ACH";
			accountdata.isDeleted = false;
			accountdata.user = userbankaccountdata.user.id;
			accountdata.userBankAccount = userbankaccountdata.id;
			await Account.create( accountdata );
		}

		if( payID == "init" ) {
			/* we do not have paymentmanagement yet */
			const screenID = req.param( "screenid" );
			if( !screenID ) {
				throw new Error( "Screen ID is a required parameter when Paymentmanagement ID is 'init'." );
			}

			const screendata = await Screentracking.findOne( { id: screenID } );
			if( !screendata ) {
				throw new Error( `Application ${screenID} is not found.` );
			}

			screendata.accounts = accountdata.id;
			await new Promise( ( resolve, reject ) => {
				screendata.save( ( err ) => {
					if( err ) {
						reject( err );
					} else {
						resolve();
					}
				} );
			} );
		} else {
			const paydata = await PaymentManagement.findOne( { id: payID } );
			if( !paydata ) {
				throw new Error( `Contract ${payID} is not found.` );
			}
			paydata.account = accountdata.id;

			await new Promise( ( resolve, reject ) => {
				paydata.save( ( err ) => {
					if( err ) {
						reject( err );
					} else {
						resolve();
					}
				} );
			} );
		}

		const json = {
			status: 200,
			message: "Account Changed Successfully"
		};
		res.contentType( "application/json" );
		return res.json( json );
	} catch ( err ) {
		const json = {
			status: 400,
			message: err.message
		};
		res.contentType( "application/json" );
		return res.json( json );
	}
}

function repullPlaidInfo( req, res ) {
	const userbankaccountID = req.param( "userbankaccountID" );
	sails.log.info( "AchController.repullPlaidInfo userbankaccountID ", userbankaccountID );

	if( !userbankaccountID ) {
		const json = {
			status: 400,
			message: "No information found"
		};
		res.contentType( "application/json" );
		res.json( json );
	}
	const mainBalance = {};
	const mainplaidMeta = {};

	const options = { id: userbankaccountID };

	UserBankAccount.findOne( options )
	.then( ( userbankaccount ) => {
		if( !userbankaccount ) {
			const json = {
				status: 400,
				message: err.message
			};
			res.contentType( "application/json" );
			res.json( json );
		}
		const token = userbankaccount.access_token;
		const institutionName = userbankaccount.institutionName;
		const institutionType = userbankaccount.institutionType;

		InstitutionService.accountDetail( token )
		.then( function( accountDetails ) {
			const item_id = accountDetails.item.item_id;

			InstitutionService.getAssetTransactionDetail( token, accountDetails, "all", userbankaccount.user )
			.then( function( transactionDetails ) {
				const repullData = UserBankAccount.createUserBankAccountObject( transactionDetails, institutionName, institutionType, accountDetails, userbankaccount.user, token, null );

				repullData.userBankAccount = userbankaccountID;
				repullData.version = "1";

				Repullbankaccount.create( repullData )
				.then( function( entity ) {
					// sails.log.info("entity::",entity);
					req.session.banksuccessmsg = "Repull Successful";
					const json = {
						status: 200,
						message: "Credit history details found"
					};
					// sails.log.info("json data", json);
					res.contentType( "application/json" );
					return res.json( json );
				} )
				.catch( function( err ) {
					sails.log.error( "Create Error::", err );
					const json = {
						status: 400,
						message: "Unable to save plaid information"
					};
					res.contentType( "application/json" );
					res.json( json );
				} );
			} )
			.catch( function( err ) {
				const json = {
					status: 400,
					message: "Unable to fetch transaction information"
				};
				res.contentType( "application/json" );
				res.json( json );
			} );
		} )
		.catch( function( err ) {
			const errormessage = err.error_code + " :: " + err.error_message;
			const json = {
				status: 500,
				message: errormessage
			};
			res.contentType( "application/json" );
			res.json( json );
		} );
	} )
	.catch( function( err ) {
		const json = {
			status: 400,
			message: err.message
		};
		res.contentType( "application/json" );
		res.json( json );
	} );
}

function getrepullPlaidDetails( req, res ) {
	const repullID = req.param( "repullID" );

	if( repullID ) {
		const repullcriteria = {
			id: repullID
		};

		Repullbankaccount.findOne( repullcriteria )
		.populate( "userBankAccount" )
		.then( function( repulldata ) {
			if( repulldata ) {
				// sails.log.info("repullData accountName::", repulldata.accountName);

				res.render( "admin/pendingach/repullplaidDetails", { repulldata: repulldata }, function( err, listdata ) {
					const json = {
						status: 200,
						message: "Credit history details found",
						listdata: listdata
					};
					res.contentType( "application/json" );
					res.json( json );
				} );
			} else {
				const json = {
					status: 400,
					message: "No repull details found."
				};
				sails.log.error( "json data", json );
				res.contentType( "application/json" );
				res.json( json );
			}
		} )
		.catch( function( err ) {
			const json = {
				status: 400,
				message: "No repull details found."
			};
			sails.log.error( "json data", json );
			res.contentType( "application/json" );
			res.json( json );
		} );
	} else {
		const json = {
			status: 400,
			message: "No repull details found."
		};
		sails.log.error( "json data", json );
		res.contentType( "application/json" );
		res.json( json );
	}
}
