"use strict";

const plaid = require( "plaid" );
const config = sails.config;
const plaidConfig = config.plaid;
const moment = require( "moment" );
const Q = require( "q" );
const plaidClient = new plaid.Client( plaidConfig.clientId, plaidConfig.secretKey, plaidConfig.publicKey, plaidConfig.productionUrl );
const fs = require( "fs" );
const _ = require( "lodash" );

module.exports = {
	getInstitutionList: getInstitutionList,
	bankRegistration: bankRegistration,
	bankAuthentication: bankAuthentication,
	getAccountType: getAccountType,
	getUserDetail: getUserDetail,
	cacheInstitution: cacheInstitution,
	accountDetail: accountDetail,
	getTransactionDetail: getTransactionDetail,
	getAssetTransactionDetail: getAssetTransactionDetail,
	getBalanceDetail: getBalanceDetail,
	generateAccessToken: generateAccessToken,
	upgradePlaidUser: upgradePlaidUser,
	updatePlaidWebhook: updatePlaidWebhook,
	getPlaidItems: getPlaidItems,
	fetchtransactionDetail: fetchtransactionDetail,
	removePlaidItem: removePlaidItem,
	modifySandboxTransactions: modifySandboxTransactions
};

function getInstitutionList() {
	return Q.promise( function( resolve, reject ) {
		plaid.getInstitutions( plaidConfig.getPlaidUrl(), function( err, res ) {
			if( err ) {
				sails.log.error( "InstitutionService#getInstitutionList :: Error :: ", err );
				return reject( err );
			}

			sails.log.silly( "InstitutionService#getInstitutionList :: Plaid Response :: ", res );

			return resolve( res );
		} );
	} );
}

function bankRegistration( data, credentialsGenerated ) {
	return Q.promise( function( resolve, reject ) {
		plaidClient.addAuthUser(
			data,
			credentialsGenerated,
			{
				list: true
			},
			function( err, mfaResponse, res ) {
				if( err ) {
					sails.log.error( "InstitutionService#bankRegistration :: Error :: ", err );
					// FIX: Handle this error
					return reject( {
						code: 400,
						message: err.message
					} );
				}

				if( mfaResponse ) {
					mfaResponse.isMfa = true;
					sails.log.silly( "InstitutionService#bankAuthentication :: MfaResponse :: ", mfaResponse );
					// TODO: Do Some other stuff
					// have to check plaid link response from app side
					return resolve( mfaResponse );
				} else {
					res.isMfa = false;
					sails.log.silly( "InstitutionService#bankRegistration :: Plaid Response :: ", res );

					return resolve( res );
				}
			}
		);
	} );
}

function bankAuthentication( token, mfa ) {
	return Q.promise( function( resolve, reject ) {
		plaidClient.stepConnectUser( token, mfa, null, function( err, mfaResponse, res ) {
			if( err ) {
				sails.log.error( "InstitutionService#bankAuthentication :: Error :: ", err );
				return reject( err );
			} else if( mfaResponse ) {
				sails.log.info( "InstitutionService#bankAuthentication :: MfaResponse :: ", mfaResponse );
				return resolve( mfaResponse );
			} else {
				sails.log.info( "InstitutionService#bankAuthentication :: PlaidResponse :: ", res );
				return resolve( res );
			}
		} );
	} );
}

function getAccountType( token ) {
	return Q.promise( function( resolve, reject ) {
		plaidClient.getBalance( token, function( err, mfaResponse, res ) {
			if( err ) {
				sails.log.error( "InstitutionService#getAccountType :: Error :: ", err );
				return reject( err );
			} else if( mfaResponse ) {
				sails.log.info( "InstitutionService#bankAuthentication :: MfaResponse :: ", mfaResponse );
			}
			sails.log.info( "InstitutionService#getAccountType :: hdga :: ", res );
			return resolve( mfaResponse );
		} );
	} );
}


function getUserDetail( token, userId ) {
	// return Q.promise( function( resolve, reject ) {
	// 	sails.log.info( " getUserDetail token ", token );
	// 	plaidClient.getIdentity( token, {}, function( err, response ) {
	// 		if( err ) {
	// 			sails.log.error( "InstitutionService#getUserDetail :: Error :: ", err );
	// 			var responseData = { status: 400, userInfo: [] };
	// 			return resolve( responseData );
	// 		} else {
	// 			var responseData = { status: 200, userInfo: response };
	// 			return resolve( responseData );
	// 		}
	// 	} );
	// } );
	let selectedAccount = null;
	const identity = {};
	return PlaidAssetReport.findOne( { user: userId, accessToken: token } )
	.sort( "createdAt DESC" )
	.then( ( assetReport ) => {
		if( assetReport == undefined ) {
			return getAssetTransactionDetail( token, null, null, userId )
			.then( ( result ) => {
				if( result.status !== 200 ) {
					result.userInfo = [];
					return result;
				}
				return getUserDetail( token, userId );
			} );
		}
		_.forEach( assetReport.report.items, ( item ) => {
			_.forEach( item.accounts, ( bankaccount ) => {
				if( bankaccount.subtype != "checking" || bankaccount.type != "depository" ) return;
				const availBalance = parseFloat( bankaccount.balances.available );
				if( selectedAccount == null ) {
					selectedAccount = bankaccount;
				}
				if( availBalance > parseFloat( selectedAccount.balances.available ) ) {
					selectedAccount = bankaccount;
				}
			} );
		} );
		if( selectedAccount != null ) {
			identity.names = _.get( selectedAccount, "owners[0].names", [ "not available" ] );
			identity.emails = _.get( selectedAccount, "owners[0].emails", [ { data: "not available", primary: true } ] );
			identity.phoneNumbers = _.get( selectedAccount, "owners[0].phone_numbers", [ { data: "not available", primary: true, type: "home" } ] );
			identity.addresses = _.get( selectedAccount, "owners[0].addresses", [ { data: { city: "", state: "", street: "not available", zip: "" }, primary: true } ] );
			_.forEach( identity.addresses, ( address, idx ) => {
				address.accounts = [ `${selectedAccount.name} ${selectedAccount.mask}` ];
			} );
			return { status: 200, userInfo: { identity: identity } };
		}
		return { status: 400, userInfo: [] };
	} );
}


function cacheInstitution() {
	return Q.promise( function( resolve, reject ) {
		InstitutionService.getInstitutionList()
		.then( function( institutionList ) {
			Institution.createBankDetails( institutionList ).then( function( institution ) {
				return resolve( institution );
			} );
		} )
		.catch( function( err ) {
			return reject( err );
		} );
	} );
}

function accountDetail( token ) {
	return Q.promise( function( resolve, reject ) {
		plaidClient.getAuth( token, {}, function( err, res ) {
			if( err ) {
				sails.log.error( "InstitutionService#accountDetail :: Error :: ", err );
				return reject( err );
			}
			// sails.log.info("InstitutionService#accountDetail :: result :: ", res);
			return resolve( res );
		} );
	} );
}

function getTransactionDetail( token, accountDetails, allData ) {
	return Q.promise( function( resolve, reject ) {
		const itemID = accountDetails.item.item_id;

		// sails.log.info("item ID: ",itemID);

		if( "undefined" === typeof allData || allData == "" || allData == null ) {
			var alltransData = 1;
		} else {
			if( allData == "partial" ) {
				var alltransData = 0;
			} else {
				var alltransData = 1;
			}
		}

		// sails.log.info("alltransData: ",alltransData);

		InstitutionService.getPlaidItems( token )
		.then( function( plaiditemsData ) {
			const todaysDate = moment()
			.startOf( "day" )
			.format( "YYYY-MM-DD" );
			const previousDate = moment()
			.subtract( 1, "years" )
			.startOf( "day" )
			.format( "YYYY-MM-DD" );

			plaidClient.getTransactions( token, previousDate, todaysDate, { count: 500, offset: 0 }, function( err, res ) {
				if( err ) {
					sails.log.error( "InstitutionService#getTransactionDetail :: Error :: ", err );

					const errorResponse = {
						status: 200,
						transactions: []
					};

					return resolve( errorResponse );
					// return reject(err);
				} else {
					const initialOutput = res;

					if( alltransData == 0 ) {
						return resolve( initialOutput );
					} else {
						if( res.total_transactions > 500 ) {
							const transactionArray = [];
							let fetchedTransaction = 500;
							const totalTransaction = res.total_transactions;
							const promises = [];
							let exittransloop = 0;
							let countvalue = 500;
							const promisespush = [];
							let remainingcount = 0;
							let offsetcount = 0;

							_.forEach( initialOutput.transactions, function( transactionInfo ) {
								transactionArray.push( transactionInfo );
							} );

							while( exittransloop == 0 ) {
								if( parseInt( totalTransaction ) > parseInt( fetchedTransaction ) ) {
									offsetcount = parseInt( fetchedTransaction );
									remainingcount = parseInt( totalTransaction ) - parseInt( fetchedTransaction );
									if( parseInt( remainingcount ) < parseInt( countvalue ) ) {
										countvalue = parseInt( remainingcount );
									}

									promisespush.push( InstitutionService.fetchtransactionDetail( token, previousDate, todaysDate, parseInt( countvalue ), parseInt( offsetcount ) ) );
									fetchedTransaction = parseInt( fetchedTransaction ) + parseInt( countvalue );
								} else {
									exittransloop = 1;

									Promise.all( promisespush )
									.then( function( finalresults ) {
										/* _.forEach(finalresults[0].transactions,function(transactionData){
												transactionArray.push(transactionData);
											});	*/
										_.forEach( finalresults, function( transactionsInfo ) {
											_.forEach( transactionsInfo.transactions, function( transactionData ) {
												transactionArray.push( transactionData );
											} );
										} );

										initialOutput.transactions = transactionArray;
										return resolve( initialOutput );
									} )
									.catch( function( err ) {
										return resolve( initialOutput );
									} );
								}
							}
						} else {
							return resolve( initialOutput );
						}
					}
				}
			} );
		} )
		.catch( function( err ) {
			return reject( err );
		} );
	} );
}

function getAssetTransactionDetail( token, accountDetails, allData, userId ) {
	sails.log.info( "InstitutionService.getAssetTransactionDetail; userId:", userId );
	return new Promise( ( resolve, reject ) => {
		const isSandbox = token.indexOf( "access-sandbox-" ) === 0;
		let asset_report_token = null;
		let transactions = [];
		let assetReport = null;
		// const itemID = accountDetails.item.item_id;
		// sails.log.info( "item ID:", itemID );
		return PlaidAssetReport.findOne( { user: userId, accessToken: token, createdAt: { $gte: moment().subtract( 1, "days" ).toDate() } } )
		.then( ( asset_report ) => {
			if( asset_report ) {
				assetReport = asset_report;
				return;
			}
			/* we do not have a recent report - get a new one */

			const days = 180;
			fs.appendFileSync( `logs/plaid/${userId}.txt`, `Request: createAssetReport( ${token}, ${days} )\n` );
			return plaidClient.createAssetReport( [ token ], days, {} )
			.then( ( res ) => {
				// sails.log.info( "InstitutionService.getAssetTransactionDetail; plaidClient.createAssetReport res:", JSON.stringify( res ) );
				let attempts = 0;
				const maxAttempts = 24;
				asset_report_token = res.asset_report_token;
				return new Promise( ( _resolve, _reject ) => {
					getAssetReport();

					function getAssetReport() {
						++attempts;
						sails.log.info( `InstitutionService.getAssetTransactionDetail; plaidClient.getAssetReport() (re)trying: ${attempts} ...` );
						plaidClient.getAssetReport( asset_report_token, true )
						.then( ( asset_report ) => {
							assetReport = asset_report;
							sails.log.info( `InstitutionService.getAssetTransactionDetail; plaidClient.getAssetReport[ ${attempts} ]; success!` );
							fs.appendFileSync( `logs/plaid/${userId}.txt`, `Response[${attempts}]:\n${JSON.stringify( asset_report )}\n\n` );
							return _resolve();
						} )
						.catch( ( err ) => {
							// { display_message: null, error_code: 'PRODUCT_NOT_READY', error_message: 'the requested product is not yet ready. please provide a webhook or try the request again later', error_type: 'ASSET_REPORT_ERROR', request_id: 'egXpP8z4u52uRDa', status_code: 400 }
							if( err.error_code == "PRODUCT_NOT_READY" && attempts < maxAttempts ) {
								sails.log.info( `InstitutionService.getAssetTransactionDetail; plaidClient.getAssetReport[ ${attempts} ] ${err.error_code}` );
								setTimeout( getAssetReport, 5000 );
								return;
							}
							// { display_message: 'No valid accounts were found at the financial institution. Please visit your financial institution\'s website to confirm accounts are available.', error_code: 'NO_ACCOUNTS', error_message: 'no valid accounts were found for this item', error_type: 'ITEM_ERROR', request_id: 'WcRhYfGlkutCg0F', suggested_action: null } } }
							sails.log.error( `InstitutionService.getAssetTransactionDetail; plaidClient.getAssetReport[ ${attempts} ] err:`, JSON.stringify( err ) );
							fs.appendFileSync( `logs/plaid/${userId}.txt`, `Error:\n${JSON.stringify( err )}\n` );
							const reportErr = new Error( err.error_message );
							reportErr.code = err.error_code;
							return _reject( reportErr );
						} );
					}
				} );
			} );
		} )
		.then( () => {
			assetReport.report.items.forEach( ( plaidItem ) => {
				plaidItem.accounts.forEach( ( account ) => {
					account.transactions.forEach( ( transaction ) => {
						if( isSandbox ) {
							switch( transaction.name.toLowerCase() ) {
								case "ach electronic creditgusto pay 123456":
									transaction.amount = -Math.abs( transaction.amount ); // set to payroll credit
									transaction.category = [ "Transfer", "Payroll" ];
									transaction.category_id = "21009000";
									break;
								case "intrst pymnt":
									transaction.category_id = "15001000";
									transaction.category = [ "Interest", "Interest Earned" ];
									break;
									// case "united airlines":
									// case "united airlines **** refund ****":
									// 	transaction.amount = Math.abs( transaction.amount );
									// 	break;
							}
						}
						transactions.push( transaction );
					} );
				} );
			} );
			if( assetReport.id ) return;
			if( userId ) {
				return PlaidAssetReport.create( { user: userId, accessToken: token, assetReportToken: asset_report_token, report: assetReport.report } );
			}
		} )
		.then( () => {
			if( isSandbox && userId ) {
				return User.findOne( { id: userId } )
				.then( ( user ) => {
					const idx = parseInt( user.ssn_number.substr( 3, 1 ) );
					transactions = modifySandboxTransactions( transactions, idx );
				} );
			}
		} )
		.then( () => {
			return resolve( { status: 200, transactions: transactions, total_transactions: transactions.length } );
		} )
		.catch( ( err ) => {
			let status = 200;
			if( err.code ) {
				status = 400;
			}
			sails.log.error( "InstitutionService#getTransactionDetail :: plaid.createAssetReport Error :: ", err );
			return resolve( { status: status, code: err.code, transactions: [], total_transactions: 0, message: err.message } );
		} );
	} );
}


function getBalanceDetail( token ) {
	return Q.promise( function( resolve, reject ) {
		plaidClient.getBalance( token, function( err, res ) {
			if( err ) {
				sails.log.error( "InstitutionService#getBalanceDetail::Error::", err );
				return reject( err );
			}
			sails.log.info( "InstitutionService#getBalanceDetail::result::", res );

			return resolve( res );
		} );
	} );
}

function generateAccessToken( public_token ) {
	return Q.promise( function( resolve, reject ) {
		plaidClient.exchangePublicToken( public_token, function( err, res ) {
			if( err ) {
				sails.log.error( "Institution#generateAccessToken::Error", err );
				return reject( err );
			}
			// sails.log.info("Institution#generateAccessToken::result", res);

			return resolve( res );
		} );
	} );
}

function upgradePlaidUser( token, upgradetype ) {
	return Q.promise( function( resolve, reject ) {
		console.log( "upgradetype: ", upgradetype );
		plaidClient.upgradeUser( token, upgradetype, function( err, res ) {
			if( err ) {
				sails.log.error( "InstitutionService#upgradePlaidUser :: Error :: ", err );
				return reject( err );
			} else {
				sails.log.info( "InstitutionService#upgradePlaidUser :: result :: ", res );
				return resolve( res );
			}
		} );
	} );
}

function updatePlaidWebhook( token, itemID ) {
	return Q.promise( function( resolve, reject ) {
		/* var webhookData=	{
						 "webhook_type": "TRANSACTIONS",
						 "webhook_code": "INITIAL_UPDATE",
						 "item_id": itemID,
						 "error": null,
						 "new_transactions": 1
						}*/
		// https://plaid.com/updated/hook
		// HISTORICAL_UPDATE

		// var webhookURLData= 'https://sandbox.plaid.com/updated/hook';

		// var webhookURLData= 'https://plaid.com/updated/hook';
		const webhookURLData = "http://ec2-35-165-20-111.us-west-2.compute.amazonaws.com/api/v1/getPlaidTransactions";

		// var webhookURLData= 'https://sandbox.plaid.com/updated/hook?webhook_type=TRANSACTIONS&webhook_code=INITIAL_UPDATE&item_id='+itemID+'&error=null&new_transactions=19';
		// var webhookURLData= 'https://sandbox.plaid.com/updated/hook?webhook_type=TRANSACTIONS&webhook_code=INITIAL_UPDATE&item_id='+itemID;
		// var webhookURLData= 'webhook_type=TRANSACTIONS&webhook_code=INITIAL_UPDATE&item_id='+itemID+'&error=null&new_transactions=19';

		sails.log.info( "webhookURLData: ", webhookURLData );

		plaidClient.updateItemWebhook( token, webhookURLData, function( err, res ) {
			if( err ) {
				sails.log.error( "InstitutionService#updatePlaidWebhook :: Error :: ", err );
				return reject( err );
			} else {
				sails.log.info( "InstitutionService#updatePlaidWebhook :: result :: ", res );
				return resolve( res );
			}
		} );
	} );
}

function getPlaidItems( token ) {
	return Q.promise( function( resolve, reject ) {
		plaidClient.getItem( token, function( err, res ) {
			if( err ) {
				sails.log.error( "InstitutionService#getPlaidItems :: Error :: ", err );
				return reject( err );
			} else {
				// sails.log.info("InstitutionService#getPlaidItems :: result :: ", res);
				return resolve( res );
			}
		} );
	} );
}

function fetchtransactionDetail( token, previousDate, todaysDate, countvalue, offsetvalue ) {
	return Q.promise( function( resolve, reject ) {
		plaidClient.getTransactions( token, previousDate, todaysDate, { count: countvalue, offset: offsetvalue }, function( err, res ) {
			if( err ) {
				sails.log.error( "InstitutionService#transactionDetail :: Error :: ", err );
				const errorResponse = {
					status: 200,
					transactions: []
				};
				return resolve( errorResponse );
			} else {
				// sails.log.info("InstitutionService#transactionDetail :: result :: ", res);
				return resolve( res );
			}
		} );
	} );
}

function removePlaidItem( itemID ) {
	return Q.promise( function( resolve, reject ) {
		plaidClient.removeItem( itemID, function( err, res ) {
			if( err ) {
				sails.log.error( "InstitutionService#removePlaidItem :: Error :: ", err );
				return reject( err );
			}
			sails.log.info( "InstitutionService#removePlaidItem :: result :: ", res );
			return resolve( res );
		} );
	} );
}


function modifySandboxTransactions( transactions, idx ) {
	const isSandbox = _.get( sails, "config.isSandbox", false );
	sails.log.verbose( `modifySandboxTransactions[ ${idx} ]; isSandbox: ${isSandbox}, transactions.length: ${transactions.length}` );
	if( ! isSandbox ) {
		return transactions;
	}
	const sortedTrans = PayrollDetection.categorizeTransactions( transactions );
	switch( idx ) {
		case 0:
		case 1:
			return weeklyPayroll();
		case 2:
		case 3:
			return biweeklyPayroll();
		case 4:
		case 5:
			return semimonthlyPayroll();
		default:
			return monthlyPayroll();
	}

	function weeklyPayroll() {
		sortedTrans.payrolls.forEach( ( payrollGroup ) => {
			const numPeriods = payrollGroup.payrolls.length;
			const nextPeriod = moment( new Date() ).day( "Friday" ).subtract( 1, "weeks" ).subtract( numPeriods, "weeks" );
			payrollGroup.payrolls.forEach( ( payroll ) => {
				// sails.log.verbose( "payroll transaction:", payroll );
				payroll.date = nextPeriod.format( "YYYY-MM-DD" );
				payroll.amount = parseFloat( ( payroll.amount / 4 ).toFixed( 2 ) );
				transactions.some( ( transaction ) => {
					if( transaction.id === payroll.id ) {
						transaction.date = payroll.date;
						return true;
					}
				} );
				nextPeriod.add( 1, "weeks" );
			} );
		} );
		return transactions;
	}

	function biweeklyPayroll( payrolls ) {
		sortedTrans.payrolls.forEach( ( payrollGroup ) => {
			const numPeriods = payrollGroup.payrolls.length;
			const nextPeriod = moment( new Date() ).day( "Friday" ).subtract( numPeriods * 2, "weeks" );
			payrollGroup.payrolls.forEach( ( payroll ) => {
				// sails.log.verbose( "payroll transaction:", payroll );
				payroll.date = nextPeriod.format( "YYYY-MM-DD" );
				payroll.amount = parseFloat( ( payroll.amount / 2 ).toFixed( 2 ) );
				transactions.some( ( transaction ) => {
					if( transaction.id === payroll.id ) {
						transaction.date = payroll.date;
						transaction.amount = payroll.amount;
						return true;
					}
				} );
				nextPeriod.add( 2, "weeks" );
			} );
		} );
		return transactions;
	}

	function semimonthlyPayroll( payrolls ) {
		sortedTrans.payrolls.forEach( ( payrollGroup ) => {
			const numPeriods = payrollGroup.payrolls.length;
			const nextPeriod = moment( new Date() ).date( 1 ).subtract( Math.ceil( numPeriods / 2 ), "months" );
			payrollGroup.payrolls.forEach( ( payroll ) => {
				// sails.log.verbose( "payroll transaction:", payroll );
				payroll.date = nextPeriod.format( "YYYY-MM-DD" );
				// payroll.amount = parseFloat( ( payroll.amount / 2 ).toFixed( 2 ) );
				payroll.amount = parseFloat( ( -38888 / 24 ).toFixed( 2 ) ); // faking 48K income
				transactions.some( ( transaction ) => {
					if( transaction.id === payroll.id ) {
						transaction.date = payroll.date;
						transaction.amount = payroll.amount;
						// sails.log.verbose( "semimonthlyPayroll; transaction:", transaction );
						return true;
					}
				} );
				if( nextPeriod.format( "D" ) == "1" ) {
					nextPeriod.date( 16 );
				} else {
					nextPeriod.add( 1, "months" ).date( 1 );
				}
			} );
		} );
		return transactions;
	}

	function monthlyPayroll( payrolls ) {
		sortedTrans.payrolls.forEach( ( payrollGroup ) => {
			const numPeriods = payrollGroup.payrolls.length;
			const nextPeriod = moment( new Date() ).date( 1 ).subtract( numPeriods, "months" );
			payrollGroup.payrolls.forEach( ( payroll ) => {
				// sails.log.verbose( "payroll transaction:", payroll );
				payroll.date = nextPeriod.format( "YYYY-MM-DD" );
				transactions.some( ( transaction ) => {
					if( transaction.id === payroll.id ) {
						transaction.date = payroll.date;
						return true;
					}
				} );
				nextPeriod.add( 1, "months" );
			} );
		} );
		return transactions;
	}
}
