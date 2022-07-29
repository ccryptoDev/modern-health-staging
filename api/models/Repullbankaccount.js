/* global sails, Repullbankaccount */
"use strict";

/**
 * Repullbankaccount.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const Q = require( "q" );
const moment = require( "moment" );
const in_array = require( "in_array" );
const _ = require( "lodash" );

module.exports = {
	attributes: {
		user: {
			model: "User"
		},
		userBankAccount: {
			model: "UserBankAccount"
		},
		identityData: {
			type: "array"
		},
		accountsData: {
			type: "array"
		},
		transactionData: {
			type: "json",
			defaultsTo: {}
		},
		itemID: {
			type: "string"
		},
		accessToken: {
			type: "string"
		},
		balance: {
			type: "json"
		},
		institutionType: {
			type: "String"
		},
		accountName: {
			type: "String"
		},
		accountNumberLastFour: {
			type: "String"
		},
		routingNumber: {
			type: "String"
		},
		accountNumber: {
			type: "String"
		},
		wireRoutingNumber: {
			type: "String"
		},
		accountType: {
			type: "String"
		},
		accountSubType: {
			type: "String"
		},
		plaidMeta: {
			type: "json"
		},
		achprocessType: {
			type: "string",
			defaultsTo: "bankaccount"
		},
		repullSource: {
			type: "String",
			defaultsTo: "admin"
		},
		repullType: {
			type: "String",
			defaultsTo: "admin repull"
		},
		allowPayment: {
			type: "integer"
		}
	},
	checkLatestPlaidRepull: checkLatestPlaidRepull,
	repullPlaidForPayment: repullPlaidForPayment,
	getMultiloanRepull: getMultiloanRepull,
	getBankdetailsFromApi: getBankdetailsFromApi,
	getRepullAccountList: getRepullAccountList,
	fetchCheckingAccounts: fetchCheckingAccounts,
	getBankdetailsFromDb: getBankdetailsFromDb,
	getUserBankdetailsFromDb: getUserBankdetailsFromDb
};


function checkLatestPlaidRepull(accountID,payAmount,repullType){

	return Q.promise(function(resolve, reject) {

		var processPayment=0;

		var accountcriteria= {
			id: accountID
		};

		Account.findOne(accountcriteria)
		.then(function(accountDetails){

			if(accountDetails)
			{
				var repullcriteria = {
					user: accountDetails.user,
					userBankAccount:  accountDetails.userBankAccount
				};

				Repullbankaccount
				.findOne(repullcriteria)
				.sort('createdAt DESC')
				.then(function(repulldata) {

					if(repulldata)
					{
						var todaysDate = moment(new Date());
						var oDate = moment(repulldata.createdAt);
						var diffHours = oDate.diff(todaysDate, 'hours');
						diffHours  = Math.abs(diffHours);

						if(diffHours>8)
						{
							Repullbankaccount.repullPlaidForPayment(accountID,payAmount,repullType)
							.then(function(repullresponse) {

								if(repullresponse.status==200)
								{
									return resolve({
										status: repullresponse.status,
										message:  repullresponse.message,
										allowPayment: repullresponse.allowPayment
									});
								}
								else
								{
									return resolve({
										status: repullresponse.status,
										message:  repullresponse.message,
										allowPayment: repullresponse.allowPayment
									});
								}

							}).catch(function(err) {
								return resolve({
									status: 400,
									message:  err.message,
									allowPayment: processPayment
								});
							});
						}
						else
						{
							/*processPayment=1;
							return resolve({
								status: 200,
								message:  'Repull exist',
								allowPayment: processPayment
							});	*/

							//--Check Available balance is greater than paymentAmount(payAmount)
							var availableAccountBalanceCheck =0;
							if(repulldata.balance)
							{
								if ("undefined" === typeof repulldata.balance.available || repulldata.balance.available=='' || repulldata.balance.available==null)
								{
									  availableAccountBalanceCheck=0;
								}
								else
								{
									availableAccountBalanceCheck = repulldata.balance.available;
								}
							}
							var requestedBalance = Math.round(payAmount * sails.config.feeManagement.paymentbalanceAvail);
							requestedBalance = parseFloat(requestedBalance.toFixed(2));
							if( parseFloat(availableAccountBalanceCheck) >= parseFloat(requestedBalance) )
							{
									processPayment =1;
							}

							if(processPayment==1)
							{
								return resolve({
									status: 200,
									message:  'Repull exist with sufficient available balance',
									allowPayment: processPayment
								});
							}
							else
							{
								var repullmessage ='Insufficient available balance. Available Balance: $'+parseFloat(availableAccountBalanceCheck)+' , Payment Amount: $'+parseFloat(payAmount)+'';
								return resolve({
									status: 300,
									message: repullmessage ,
									allowPayment: processPayment
								});
							}
						}
					}
					else
					{
						Repullbankaccount.repullPlaidForPayment(accountID,payAmount,repullType)
						.then(function(repullresponse) {

							if(repullresponse.status==200)
							{
								return resolve({
									status: repullresponse.status,
									message:  repullresponse.message,
									allowPayment: repullresponse.allowPayment
								});
							}
							else
							{
								return resolve({
									status: repullresponse.status,
									message:  repullresponse.message,
									allowPayment: repullresponse.allowPayment
								});
							}

						}).catch(function(err) {
							return resolve({
								status: 400,
								message:  err.message,
								allowPayment: processPayment
							});
						});
					}
				})
				.catch(function (err) {
					return resolve({
						status: 400,
						message:  err.message,
						allowPayment: processPayment
					});
				});
			}
			else
			{
				return resolve({
					status: 400,
					message: "Unable to fetch account information",
					allowPayment: processPayment
				});
			}
		})
		.catch(function (err) {
			return resolve({
				status: 400,
				message: err.message,
				allowPayment: processPayment
			});
		});
   });
}

function repullPlaidForPayment(accountID,payAmount,repullTypemanual){

	return Q.promise(function(resolve, reject) {

		var mainBalance={};
		var mainplaidMeta={};
		var availableAccountBalance =0;
		var currentAccountBalance =0;
		var allowPayment=0;

		if ("undefined" === typeof repullTypemanual || repullTypemanual=='' || repullTypemanual==null)
		{
			  repullTypemanual = 'admin repull';
		}

		var accountoptions = {
			id: accountID
		};

		Account.findOne(accountoptions)
		.then(function(accountData){

			var userbankaccountID = accountData.userBankAccount;
			var accountachprocessType = accountData.achprocessType;

			var criteria = {
					id: userbankaccountID
			};

			UserBankAccount.findOne(criteria)
			.then(function(userbankaccount){


				if(userbankaccount)
				{
					var token = userbankaccount.access_token;
					var institutionName= userbankaccount.institutionName;
					var institutionType= userbankaccount.institutionType;

					InstitutionService.accountDetail(token)
					.then(function (accountDetails) {


						if(accountDetails!='' && accountDetails!=null && "undefined" !== typeof accountDetails)
						{
							var item_id = accountDetails.item.item_id;

							InstitutionService.getAssetTransactionDetail(token,accountDetails,'partial')
							.then(function (transactionDetails) {

								/*InstitutionService
								.getUserDetail(token)
								.then(function (userInfo) {*/

									 var identityData = [];
									 var accountsData = [];
									 var transactionGenerated = {};

									 /*if(userInfo)
									 {
										identityData.push(userInfo);
									 }*/

									 if(transactionDetails.total_transactions>0)
									 {
										_.forEach(transactionDetails.transactions,function(transaction){

											if(!transactionGenerated.hasOwnProperty(transaction.account_id))
											{
												transactionGenerated[transaction.account_id]=[];
											}

											var transobj = {
											id: transaction.transaction_id,
											account_id: transaction.account_id,
											amount :transaction.amount,
											date : transaction.date,
											name :transaction.name,
											meta :transaction.payment_meta,
											pending :transaction.pending,
											type : transaction.transaction_type,
											category:  transaction.category,
											category_id :transaction.category_id,
											score :transaction.location
											};

											transactionGenerated[transaction.account_id].push(transobj) ;
										});
									 }

									 var forlength = accountDetails.accounts.length,
									 i = 0;

									 _.forEach(accountDetails.accounts,function(accountsval){

										var metaData ={
											limit : accountsval.balances.limit,
											name  : accountsval.name,
											number : accountsval.mask,
											official_name : accountsval.official_name
										}

										var filteredAccountsDetails = _.filter(accountDetails.numbers, { "account_id": accountsval.account_id });

										if (filteredAccountsDetails.length >0) {
											filteredAccountsDetailsJson = filteredAccountsDetails[0];
										}

										/*sails.log.info("accountData.accountNumber:",accountData.accountNumber);
										sails.log.info("filteredAccountsDetailsJson.account:",filteredAccountsDetailsJson.account);
										sails.log.info("--------------------------:");*/

										if(accountData.accountNumber == filteredAccountsDetailsJson.account)
										{
											//mainBalance = accountsval.balances;

											if(accountsval.subtype=='checking')
											{
												mainBalance = accountsval.balances;
											}
											mainplaidMeta={
												"id": accountsval.account_id,
												"item": accountsval.account_id,
												"user": accountsval.account_id
											};

											availableAccountBalance =accountsval.balances.available;
											currentAccountBalance =accountsval.balances.available;

											if ("undefined" === typeof currentAccountBalance || currentAccountBalance=='' || currentAccountBalance==null)
											{
												  currentAccountBalance=0;
											}

											if ("undefined" === typeof availableAccountBalance || availableAccountBalance=='' || availableAccountBalance==null)
											{
												 //availableAccountBalance = currentAccountBalance;
												 availableAccountBalance =0;
											}

											/*sails.log.info("mainBalance:",mainBalance);
											sails.log.info("mainplaidMeta:",mainplaidMeta);
											sails.log.info("loop availableAccountBalance:",availableAccountBalance);
											sails.log.info("loop currentAccountBalance:",currentAccountBalance);
											sails.log.info("================================================");*/
										}

										var objdata = {
												_id: accountsval.account_id,
												_item: accountsval.account_id,
												_user: accountsval.account_id,
												balance: accountsval.balances,
												institution_type : institutionType,
												meta :metaData,
												numbers: filteredAccountsDetailsJson,
												subtype : accountsval.subtype,
												type : accountsval.type
										 };
										 accountsData.push(objdata);

										 i++;
										 if (i == forlength) {

											 //sails.log.info("availableAccountBalance:",availableAccountBalance);
											 //sails.log.info("payAmount:",payAmount);

											 //--Check Available balance is greater than paymentAmount(payAmount)
											 var requestedBalance = Math.round(payAmount * sails.config.feeManagement.paymentbalanceAvail);
											 requestedBalance = parseFloat(requestedBalance.toFixed(2));
											 if( parseFloat(availableAccountBalance) >= parseFloat(requestedBalance) )
											 {
													allowPayment =1;
											 }

											/*sails.log.info("mainBalance:",mainBalance);
											sails.log.info("mainplaidMeta:",mainplaidMeta);
											sails.log.info("outer availableAccountBalance:",availableAccountBalance);
											sails.log.info("outer currentAccountBalance:",currentAccountBalance);*/

											 var repullData = {
												user: userbankaccount.user,
												userBankAccount: userbankaccount.id,
												identityData: identityData ,
												accountsData: accountsData,
												transactionData: transactionGenerated,
												itemID: item_id,
												accessToken: token,
												institutionType:accountData.institutionType,
												accountName:accountData.accountName,
												accountNumberLastFour: accountData.accountNumberLastFour,
												routingNumber: accountData.routingNumber,
												accountNumber: accountData.accountNumber,
												wireRoutingNumber: accountData.wireRoutingNumber,
												accountType: accountData.accountType,
												accountSubType: accountData.accountSubType,
												balance: mainBalance,
												plaidMeta: mainplaidMeta,
												achprocessType:"bankaccount",
												repullSource:"payment",
												repullType:repullTypemanual,
												allowPayment: allowPayment
											};
											//sails.log.info("outer repullData:",repullData);
											//sails.log.info("================================================");

											Repullbankaccount.create(repullData)
											.then(function (entity) {

												if(allowPayment==1)
												{
													return resolve({
														status: 200,
														message:  'Plaid repulled successfully',
														allowPayment: allowPayment
													});
												}
												else
												{
													var repullmessage ='Insufficient available balance. Available Balance: $'+parseFloat(availableAccountBalance)+' , Payment Amount: $'+parseFloat(payAmount)+'';
													return resolve({
														status: 300,
														message: repullmessage ,
														allowPayment: allowPayment
													});
												}
											})
											.catch(function (err) {
												return resolve({
													status: 400,
													message:  err.message,
													allowPayment: allowPayment
												});
											});
										 }
									});
								/*})
								.catch(function (err) {
									return resolve({
										status: 400,
										message:  err.message,
										allowPayment: allowPayment
									});
								});*/
							})
							.catch(function (err) {
								return resolve({
									status: 400,
									message:  err.message,
									allowPayment: allowPayment
								});
							});
						}
						else
						{
							return resolve({
								status: 400,
								message: "Unable to repull plaid information! No account details",
								allowPayment: allowPayment
							});
						}
					})
					.catch(function (err) {

						    if(err.error_message)
							{
								var statusCode =500;
								var errorMessage = err.error_code+' :: '+err.error_message;
							}
							else
							{
								var statusCode =400;
								var errorMessage = err.message;
							}

							return resolve({
								status: statusCode,
								message:  errorMessage,
								allowPayment: allowPayment
							});
					});
				}
				else
				{
					return resolve({
						status: 400,
						message: "Unable to repull plaid information",
						allowPayment: allowPayment
					});

				}
			})
			.catch(function (err) {
				return resolve({
					status: 400,
					message: err.message,
					allowPayment: allowPayment
				});
			});
		})
		.catch(function (err) {
			return resolve({
				status: 400,
				message: err.message,
				allowPayment: allowPayment
			});
		});
	});
}


function getMultiloanRepull( screenDetails, userId, userBankAccount ) {
	return Q.promise( ( resolve, reject ) => {
		var todaysDate = moment( new Date() );
		var bankforlength = userBankAccount.length;
		var bankdetailspush = [];

		// sails.log.info( "screenDetails", screenDetails );
		sails.log.info( "userId", userId );
		// sails.log.info( "userBankAccount", userBankAccount );
		sails.log.info( "bankforlength", bankforlength );

		if( userBankAccount.length > 0 ) {
			_.forEach(userBankAccount, ( userbankData ) => {
				var oDate = moment( userbankData.updatedAt );
				var diffHours = oDate.diff( todaysDate, "hours" );
				diffHours = Math.abs( diffHours );
				sails.log.info( "diffHours:", diffHours );
				sails.log.info( "userbankData.updatedAt:", userbankData.updatedAt );
				sails.log.info( "todaysDate:", todaysDate );
				if( diffHours > 8 ) {
					var token = userbankData.accessToken;
					var institutionName= userbankData.institutionName;
					var institutionType= userbankData.institutionType;
					bankdetailspush.push( Repullbankaccount.getBankdetailsFromApi( token, institutionName, institutionType, userId ) );
				} else {
					var userbankid;
					if( "undefined" !== typeof userbankData.userbankaccountID && userbankData.userbankaccountID != "" && userbankData.userbankaccountID != null ) {
						userbankid = userbankData.userbankaccountID;
					} else {
						userbankid = userbankData.id;
					}
					bankdetailspush.push( Repullbankaccount.getBankdetailsFromDb( userbankid ) );
				}
			} );
		}
		return Promise.all( bankdetailspush )
		.then( ( finalresults ) => {
			return resolve( { status: 200, message: "Plaid repulled successfully", userBankAccount: finalresults } );
		} )
		.catch( ( err ) => {
			return resolve = { status: 400, message: "No Bank account details."
			};
		} );
	} );
}


function getBankdetailsFromApi( token, institutionName, institutionType, userId ) {
	return Q.promise( ( resolve ) => {
		InstitutionService.accountDetail( token )
		.then( ( accountDetails ) => {
			var item_id = accountDetails.item.item_id;
			return InstitutionService.getAssetTransactionDetail( token, accountDetails, "all", userId )
			.then( ( transactionDetails ) => {
				var transavail = 0;
				if( transactionDetails.total_transactions > 0 ) {
					transavail = 1;
				}
				return InstitutionService.getUserDetail( token, userId )
				.then( ( userInfo ) => {
					var identityData = [];
					var accountsData = [];
					var transactionGenerated = {};

					if( userInfo ) {
						identityData.push( userInfo );
					}

					if( transactionDetails.total_transactions > 0 ) {
						_.forEach(transactionDetails.transactions, ( transaction ) => {
							if( ! transactionGenerated.hasOwnProperty( transaction.account_id ) ) {
								transactionGenerated[ transaction.account_id ] = [];
							}
							transactionGenerated[ transaction.account_id ].push( {
								id: transaction.transaction_id,
								account_id: transaction.account_id,
								amount: transaction.amount,
								date: transaction.date,
								name: transaction.name,
								meta: transaction.payment_meta,
								pending: transaction.pending,
								type: transaction.transaction_type,
								category: transaction.category,
								category_id: transaction.category_id,
								score: transaction.location
							} );
						} );
					}

					_.forEach( accountDetails.accounts, ( accountsval ) => {
						var metaData = {
							limit: accountsval.balances.limit,
							name: accountsval.name,
							number: accountsval.mask,
							official_name: accountsval.official_name
						};
						var filteredAccountsDetails = _.filter( accountDetails.numbers.ach, { "account_id": accountsval.account_id } );
						let filteredAccountsDetailsJson = null;
						if( filteredAccountsDetails.length > 0 ) {
							filteredAccountsDetailsJson = filteredAccountsDetails[ 0 ];
						}
						accountsData.push( {
							_id: accountsval.account_id,
							_item: accountsval.account_id,
							_user: accountsval.account_id,
							balance: accountsval.balances,
							institution_type: institutionType,
							meta: metaData,
							numbers: filteredAccountsDetailsJson,
							subtype: accountsval.subtype,
							type: accountsval.type
						} );
					} );

					return Screentracking.findLatestScreenTracking( userId )
					.then( ( userscreenres ) => {
						var userBankAccount = {
							accounts: accountsData,
							accessToken: token,
							institutionName: institutionName,
							institutionType: institutionType,
							user: userId,
							transactions: transactionGenerated,
							item_id: item_id,
							access_token: token,
							transavail: transavail,
							screentracking: userscreenres.id,
							repullstatus: 1
						};
						return UserBankAccount.findOne( { user: userId, accessToken: token } )
						.then( ( userbankaccount ) => {
							if( userbankaccount == undefined ) {
								if( process.env.NODE_ENV === "staging" ) {
									userBankAccount.accounts = userBankAccount.accounts.reverse();
								}
								return UserBankAccount.create( userBankAccount );
							}
							return UserBankAccount.update( { id: userbankaccount.id }, userBankAccount )
							.then( ( updates ) => updates[ 0 ] );
						} )
						.then( ( entity ) => {
							return resolve( entity );
						} );
					} )
					.catch( ( err ) => {
						sails.log.error( "getBankdetailsFromApi; catch:", err );
						return resolve( { status: 400, message: err.message } );
					} );
				} )
				.catch( ( err ) => {
					sails.log.error( "getBankdetailsFromApi; catch:", err );
					return resolve( { status: 400, message: err.message } );
				} );
			})
			.catch( ( err ) => {
				sails.log.error( "getBankdetailsFromApi; catch:", err );
				return resolve( { status: 400, message: err.message } );
			});
		} )
	  	.catch( ( err ) => {
			sails.log.error( "getBankdetailsFromApi; catch:", err );
			return resolve( { status: 400, message: err.message } );
		} );
	} );
}


function getRepullAccountList(screenDetails,userId){
	return Q.promise(function(resolve, reject) {

	    var subTypeArray = [];
		var chekingaccountArray = [];
	    var usercriteria = {
		  user:userId
		 // isDeleted: false
		};

		sails.log.info("usercriteria",usercriteria);

		UserBankAccount.find(usercriteria)
		  .sort("createdAt DESC")
		  .then(function (userBankAccount) {

			//sails.log.info("userBankAccount========",userBankAccount);

			var banklength = userBankAccount.length;
			var checkingaccountData;
			var checkingaccountArray = [];

			sails.log.info("banklength",banklength);

			_.forEach(userBankAccount, function (userbankData) {
				checkingaccountData = Repullbankaccount.fetchCheckingAccounts(userbankData);

				if(checkingaccountData.length > 0)
				{
				   	checkingaccountArray.push(checkingaccountData);
				}
			});

			var data = [];
	        var accountNumberArray = [];
			var userbankArray = [];
			if(checkingaccountArray.length > 0){

				// sails.log.info("checkingaccountArray",checkingaccountArray);

				_.forEach(checkingaccountArray, function (checkinginfo) {
				    var checkingdata=checkinginfo[0];
					var userbankId = checkingdata.userbankaccountID;
					var arraybankres = userbankArray.indexOf(userbankId);
					if(arraybankres=='-1')
					{
						var accountNumber =	checkingdata.userbankaccountNumber;
						var institutionType =	checkingdata.institution_type;
						var checkaccountNumber = accountNumber+'_'+institutionType;
						var arrayres = accountNumberArray.indexOf(checkaccountNumber);
						if(arrayres=='-1')
						{
							userbankArray.push(userbankId);
							accountNumberArray.push(checkaccountNumber);
							data.push(checkingdata);
						}
					}
				});
			}


		    if(data.length > 0)
			{
			    return resolve({
					status: 200,
					data:data
				});

			}
			else
			{
				if(userBankAccount.length > 0)
				{
					_.forEach(userBankAccount, function (checkinginfo) {
						data.push(checkinginfo);
					});
					return resolve({
						status: 200,
						data:data
				    });
				}
				else
				{
					return resolve({
						status: 400,
						data:data
					});
				}
			}
			//sails.log.info("data",data);
	       // process.exit(1);

	    })
	     .catch(function(err) {
			sails.log.error("catcherr:====",err);
			return resolve({
				status: 400,
				message: 'No Bank account details.'
			});
		});




	});
}



function fetchCheckingAccounts(userBankAccount) {
  var checkingAccounts = [];
  userBankAccount.accounts.map(function (account) {
    if (account.subtype === 'checking') {
		  account.userbankaccountID = userBankAccount.id;
		  account.userbankaccountNumber = account.numbers.account;
		  account.institutionName =userBankAccount.institutionName;
		  account.institutionType =userBankAccount.institutionType;
		  account.accessToken =userBankAccount.accessToken;
		  account.createdAt =userBankAccount.createdAt;
		  account.updatedAt =userBankAccount.updatedAt;
     	  checkingAccounts.push(account);
    }
  });

  return checkingAccounts;
}

function getBankdetailsFromDb(bankid){
	return Q.promise(function(resolve, reject) {

		sails.log.info("bankid",bankid);

	     var criteria = {
          id: bankid
         };

        sails.log.info("criteria",criteria);

		UserBankAccount.findOne(criteria)
		  .then(function (userbankaccount) {

		//   sails.log.info("userbankaccount99999999999999",userbankaccount);

			  return resolve(userbankaccount);

		}) .catch(function(err) {
			return resolve({
				status: 400,
				message: 'No Bank account details.'
			});
		});

	});
}

function getUserBankdetailsFromDb(accountDetail,userid,screentracking){
	return Q.promise(function(resolve, reject) {

		if(accountDetail[0])
		{
			var accountuserbank = accountDetail[0].userBankAccount.id;
			_.forEach(accountDetail, function(accountvalue) {
			   if(accountvalue.accountNumber)
			   {
				  var str = accountvalue.accountNumber;
				  accountvalue.accountNumber = str.replace(/\d(?=\d{4})/g, "X");
				  var otheraccounts = accountvalue.userBankAccount.accounts;
				  _.forEach(otheraccounts, function(otheraccountvalue) {
						if(otheraccountvalue.numbers)
						{
						   var str1 = otheraccountvalue.numbers.account;
						   if ("undefined" !== typeof str1 && str1!='' && str1!=null)
						   {
							 otheraccountvalue.numbers.account = str1.replace(/\d(?=\d{4})/g, "X");
						   }
						}
				  })

			   }
			});

		   return resolve({
				status: 200,
				detailsfrom:'account',
				accountres:accountDetail
			});

		}else{

			var userbankcriteria = {
			  user:userid,
			  isDeleted: false
			};

			//sails.log.info("userbankcriteria",userbankcriteria);


			UserBankAccount
			  .find(userbankcriteria)
			  .sort("createdAt ASC")
			  .then(function (BankAccountres) {

				//sails.log.info("BankAccountres",BankAccountres);

				return resolve({
					status: 200,
					detailsfrom:'userbank',
					accountres:BankAccountres
				});


			}) .catch(function(err) {
				return resolve({
					status: 400,
					message: 'No Bank account details.'
				});
			});


		  }


	});
}



