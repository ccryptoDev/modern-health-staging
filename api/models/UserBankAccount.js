/* global UserBankAccount, Account, PlaidUser, Repullbankaccount, Screentracking */
/**
 * UserBankAccount.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const Q = require( "q" );
const in_array = require( "in_array" );
const _ = require( "lodash" );
const moment = require( "moment" );

module.exports = {
	//
	attributes: {
		accounts: {
			type: "array"
		},
		accessToken: {
			type: "string"
		},
		institutionName: {
			type: "string"
		},
		institutionType: {
			type: "string"
		},
		transaction: {
			type: "array"
		},
		isDeleted: {
			type: "boolean",
			defaultsTo: false
		},
		user: {
			model: "User"
		},
		item_id: {
			type: "string"
		},
		access_token: {
			type: "string"
		},
		transavail: {
			type: "integer",
			defaultsTo: 0
		},
		repullstatus: {
			type: "integer",
			defaultsTo: 0
		},
		bankfilloutmanually: {
			type: "integer",
			defaultsTo: 0
		},
		screentracking: { "model": "Screentracking" },
		toApi: toApi
	},

	createInstitutionDetail: createInstitutionDetail,
	updateAccessToken: updateAccessToken,
	filterCheckingAccounts: filterCheckingAccounts,
	findIfUserBankAccount: findIfUserBankAccount,
	createChangeBankDetail: createChangeBankDetail,
	createUserBankDetail: createUserBankDetail,
	getAllUserBankAccounts: getAllUserBankAccounts,
	getCheckingAccount: getCheckingAccount,
	createUserBankAccountObject: createUserBankAccountObject,
	getBankData: getBankData
};

function toApi() {
	const userBankAccount = this.toObject();

	// filter checking accounts
	userBankAccount.checkingAccounts = UserBankAccount.filterCheckingAccounts( userBankAccount );
	// remove transactions
	delete userBankAccount.transactions;
	delete userBankAccount.accessToken;

	return userBankAccount;
}

function createUserBankDetail( institutionName, institutionType, accountDetails, user, token ) {
	return Q.promise( function( resolve, reject ) {
		// sails.log.info("Enter institution details");

		InstitutionService.getAssetTransactionDetail( token, accountDetails, "all", user.id )
		.then( function( transactionDetails ) {
			const item_id = accountDetails.item.item_id;
			transavail = 0;
			if( transactionDetails.total_transactions > 0 ) {
				transavail = 1;
			}

			const transactionGenerated = {};

			if( transactionDetails.total_transactions > 0 ) {
				// sails.log.info("enter if loop for transactions:: ")

				_.forEach( transactionDetails.transactions, function( transaction ) {
					// sails.log.info("transaction.account_id :: ", transaction.account_id);

					if( !_.has( transaction.account_id, transactionGenerated ) ) {
						// transactionGenerated[transaction._account]=[];
						// sails.log.info('Enter if loop');
						// transactionGenerated[transaction.account_id]=[];
					} else {
						// sails.log.info('Enter else loop');
					}

					if( !transactionGenerated.hasOwnProperty( transaction.account_id ) ) {
						// sails.log.info('Enter property if loop');
						transactionGenerated[ transaction.account_id ] = [];
					} else {
						// sails.log.info('Enter property else loop');
					}

					const obj = {
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
						// pending_transaction_id: transaction.pending_transaction_id,
						// account_owner: transaction.account_owner
					};

					// sails.log.info("obj values :: ", obj);

					// transactionGenerated[transaction._account].push(obj) ;
					transactionGenerated[ transaction.account_id ].push( obj );
				} );
			}

			const accountsData = [];

			_.forEach( accountDetails.accounts, function( accountsval ) {
				const metaData = {
					limit: accountsval.balances.limit,
					name: accountsval.name,
					number: accountsval.mask,
					official_name: accountsval.official_name
				};

				const filteredAccountsDetails = _.filter( accountDetails.numbers, { account_id: accountsval.account_id } );

				let filteredAccountsDetailsJson = null;
				if( filteredAccountsDetails.length > 0 ) {
					filteredAccountsDetailsJson = filteredAccountsDetails[ 0 ];
				}

				const objdata = {
					_id: accountsval.account_id,
					_item: accountsval.account_id,
					_user: accountsval.account_id,
					balance: accountsval.balances,
					institution_type: institutionType,
					meta: metaData,
					numbers: filteredAccountsDetailsJson,
					subtype: accountsval.subtype,
					type: accountsval.type
				};

				accountsData.push( objdata );
			} );

			/* var objdata = {
                        "_id" : "DzRDJnLY3EhJjZ1791woc1aAvVqLzYtZB1v5z",
                        "_item" : "DzRDJnLY3EhJjZ1791woc1aAvVqLzYtZB1v5z",
                        "_user" : "DzRDJnLY3EhJjZ1791woc1aAvVqLzYtZB1v5z",
                        "balance" : {
                                "available" : -29.15,
                                "current" : -29.15,
                                "limit" : null
                        },
                        "institution_type" : "ins_1",
                        "meta" : {
                                "limit" : null,
                                "name" : "Regular Savings",
                                "number" : "9448",
                                "official_name" : "Regular Savings"
                        },
                        "numbers" : {
                                "account" : "229016369448",
                                "account_id" : "DzRDJnLY3EhJjZ1791woc1aAvVqLzYtZB1v5z",
                                "routing" : "063100277",
                                "wire_routing" : "026009593"
                        },
                        "subtype" : "savings",
                        "type" : "depository"
                };
			accountsData.push(objdata) ;*/

			const userBankAccount = {
				accounts: accountsData,
				accessToken: token,
				institutionName: institutionName,
				institutionType: institutionType,
				user: user.id,
				transactions: transactionGenerated,
				item_id: item_id,
				access_token: token,
				transavail: transavail
			};

			if( process.env.NODE_ENV === "staging" ) {
				userBankAccount.accounts = userBankAccount.accounts.reverse();
			}

			UserBankAccount.create( userBankAccount )
			.then( function( entity ) {
				// check if user has a marqeta card
				PlaidUser.createForUserBankAccount( entity ).then( function( plaidUserDet ) {
					const usercriteria = { id: plaidUserDet.user };

					User.findOne( usercriteria )
					.then( function( userDetails ) {
						_.forEach( plaidUserDet.emails, function( plaiduserDetails ) {
							sails.log.info( "plaidUserDet.emails::", plaidUserDet.emails );
							sails.log.info( "userDetails.email::", userDetails.email );

							const type = plaiduserDetails.type;

							if( type == "primary" ) {
								const emailId = userDetails.email;
								const plaidEmail = plaiduserDetails.data;

								if( emailId == plaidEmail ) {
									sails.log.info( "plaidUserDet.user::", plaidUserDet.user );

									userDetails.isEmailVerified = true;
								}
							}
						} ); // foreachend

						// sails.log.info("plaidUserDet.user::",userDetails.names);

						// var names = userDetails.names;
						const street = userDetails.street;
						const city = userDetails.city;
						const state = userDetails.state;
						const zipCode = userDetails.zip;

						userDetails.street = street;
						userDetails.city = city;
						userDetails.state = state;
						userDetails.zipCode = zipCode;
						userDetails
						.save( function( err ) {
							if( err ) {
								return reject( err );
							}

							const sccriteria = { user: user.id, iscompleted: 0 };
							Screentracking.findOne( sccriteria )
							.sort( "createdAt DESC" )
							.then( function( userscreenres ) {
								UserBankAccount.update( { id: entity.id }, { screentracking: userscreenres.id } ).exec( function afterwards( err, updated ) {} );
							} );

							const Apidata = entity.toApi();
							return resolve( Apidata );
						} )
						.catch( function( err ) {
							return reject( err );
						} );
					} )
					.catch( function( err ) {
						return reject( err );
					} );
				} );
				const Apidata = entity.toApi();
				return resolve( Apidata );
			} )
			.catch( function( err ) {
				return reject( err );
			} );
		} )
		.catch( function( err ) {
			return reject( err );
		} );
	} );
}

function createInstitutionDetail( institutionName, institutionType, accountDetails, user, token, screentrackingId ) {
	return Q.promise( function( resolve, reject ) {
		const isSandbox = _.get( sails, "config.isSandbox", false );
		sails.log.verbose( "createInstitutionDetail; accountDetails:", JSON.stringify( accountDetails ) );
		InstitutionService.getAssetTransactionDetail( token, accountDetails, "all", user.id )
		.then( function( transactionDetails ) {
			if( transactionDetails.status !== 200 ) {
				return resolve( transactionDetails );
			}
			const userBankAccount = createUserBankAccountObject( transactionDetails, institutionName, institutionType, accountDetails, user.id, token, screentrackingId );

			if( process.env.NODE_ENV === "staging" ) {
				userBankAccount.accounts = userBankAccount.accounts.reverse();
			}

			UserBankAccount.create( userBankAccount )
			.then( function( entity ) {
				sails.log.info( "entity created" );

				// check if user has a marqeta card
				return PlaidUser.createForUserBankAccount( entity )
				.then( function( plaidUserDet ) {
					/* copy bank info to repullbankaccount */
					userBankAccount.userBankAccount = entity.id;
					userBankAccount.version = "1";
					return Repullbankaccount.create( userBankAccount )
					.then( () => {
						return resolve( plaidUserDet );
					} );
				} )
				.catch( function( err ) {
					sails.log.info( "error", err );
					return reject( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.info( "error", err );
				return reject( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.info( "error", err );
			return reject( err );
		} );
	} );
}

function filterCheckingAccounts( userBankAccount ) {
	const checkingAccounts = [];
	userBankAccount.accounts.map( function( account ) {
		if( account.subtype === "checking" ) {
			checkingAccounts.push( account );
		}
	} );

	return checkingAccounts;
}

function updateAccessToken( user, accessToken ) {
	return Q.promise( function( resolve, reject ) {
		const criteria = {
			user: user.id
		};

		UserBankAccount.findOne( criteria ).then( function( userbankaccount ) {
			userbankaccount.access_token = accessToken;
			userbankaccount.save( function( err ) {
				if( err ) {
					sails.log.error( "User#updateAccessToken :: Error :: ", err );

					return reject( {
						code: 500,
						message: "INTERNAL_SERVER_ERROR"
					} );
				}
				return resolve( userbankaccount );
			} );
		} );
	} );
}

function findIfUserBankAccount( accountId, userId ) {
	return Q.promise( function( resolve, reject ) {
		const criteria = {
			user: userId,
			isDeleted: false
		};
		let isUserAccount = false;
		UserBankAccount.findOne( criteria )
		.then( function( userBankAccount ) {
			if( !userBankAccount ) {
				sails.log.error( "User#findIfUserBankAccount :: No accounts Found for User" );
				return reject( {
					code: 404,
					message: "USER_BANK_ACCOUNT_NOT_FOUND"
				} );
			}
			_.forEach( userBankAccount.accounts, function( bankAccount ) {
				if( bankAccount._id === accountId ) {
					isUserAccount = true;
					return resolve( userBankAccount );
				}
			} );
			if( isUserAccount === false ) {
				sails.log.warning( "UserBankAccount#findIfUserBankAccount :: Account Does not belomng to user" );
				return reject( {
					code: 404,
					message: "NO_LINKED_ACCOUNT_FOR_USER"
				} );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "UserBankAccount#findIfUserBankAccount :: Error" );
			return reject( {
				code: 404,
				message: "INTERNAL_SERVER_ERROR"
			} );
		} );
	} );
}

function createChangeBankDetail( institutionName, institutionType, accountDetails, user, token ) {
	return Q.promise( function( resolve, reject ) {
		// sails.log.info("Enter institution details");
		// sails.log.info("accountDetails: ",accountDetails);

		InstitutionService.getAssetTransactionDetail( token, accountDetails, "all", user.id )
		.then( function( transactionDetails ) {
			const item_id = accountDetails.item.item_id;

			// sails.log.info("accountDetails item_id: ",item_id);
			// sails.log.info("accountDetails transactionDetails: ",transactionDetails);

			let transavail = 0;
			if( transactionDetails.total_transactions > 0 ) {
				transavail = 1;
			}

			const transactionGenerated = {};

			if( transactionDetails.total_transactions > 0 ) {
				_.forEach( transactionDetails.transactions, function( transaction ) {
					// sails.log.info("transaction.account_id :: ", transaction.account_id);

					if( !_.has( transaction.account_id, transactionGenerated ) ) {
					} else {
					}

					if( !transactionGenerated.hasOwnProperty( transaction.account_id ) ) {
						// sails.log.info('Enter property if loop');
						transactionGenerated[ transaction.account_id ] = [];
					} else {
						// sails.log.info('Enter property else loop');
					}

					const obj = {
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
					};

					transactionGenerated[ transaction.account_id ].push( obj );
				} );
			}

			// sails.log.info("accountDetails transactionGenerated: ",transactionGenerated);
			// sails.log.info("accountDetails.accounts: ",accountDetails.accounts);

			const accountsData = [];

			_.forEach( accountDetails.accounts, function( accountsval ) {
				const metaData = {
					limit: accountsval.balances.limit,
					name: accountsval.name,
					number: accountsval.mask,
					official_name: accountsval.official_name
				};

				const filteredAccountsDetails = _.filter( accountDetails.numbers, { account_id: accountsval.account_id } );

				// sails.log.info("filteredAccountsDetails length: ",filteredAccountsDetails.length);
				// sails.log.info("filteredAccountsDetails: ",filteredAccountsDetails);

				let filteredAccountsDetailsJson = null;
				if( filteredAccountsDetails.length > 0 ) {
					filteredAccountsDetailsJson = filteredAccountsDetails[ 0 ];
				}

				// sails.log.info("filteredAccountsDetails::",filteredAccountsDetails);

				const objdata = {
					_id: accountsval.account_id,
					_item: accountsval.account_id,
					_user: accountsval.account_id,
					balance: accountsval.balances,
					institution_type: institutionType,
					meta: metaData,
					numbers: filteredAccountsDetailsJson,
					subtype: accountsval.subtype,
					type: accountsval.type
				};

				// sails.log.info("objdata: ",objdata);
				accountsData.push( objdata );
			} );

			/* sails.log.info("institutionName: ",institutionName);
			sails.log.info("institutionType: ",institutionType);
			sails.log.info("token: ",token);
			sails.log.info("userid: ",user.id);
			sails.log.info("item_id: ",item_id);
			sails.log.info("transavail: ",transavail);*/

			const userBankAccount = {
				accounts: accountsData,
				accessToken: token,
				institutionName: institutionName,
				institutionType: institutionType,
				user: user.id,
				transactions: transactionGenerated,
				item_id: item_id,
				access_token: token,
				transavail: transavail
			};

			if( process.env.NODE_ENV === "staging" ) {
				userBankAccount.accounts = userBankAccount.accounts.reverse();
			}

			// sails.log.info("userBankAccount: ",userBankAccount);

			UserBankAccount.create( userBankAccount )
			.then( function( entity ) {
				// check if user has a marqeta card
				PlaidUser.createForUserBankAccount( entity ).then( function( plaidUserDet ) {
					MarqetaService.checkOrCreateForUser( user, plaidUserDet ).then( function( fluidCard ) {
						sails.log.info( "UserBankAccount#createChangeBankDetail :: Fluid Card found for user :: ", fluidCard );
					} );

					const Apidata = entity.toApi();
					return resolve( Apidata );
				} );
			} )
			.catch( function( err ) {
				return reject( err );
			} );
		} )
		.catch( function( err ) {
			return reject( err );
		} );
	} );
}

function getAllUserBankAccounts( userBankAccountData ) {
	return Q.promise( function( resolve, reject ) {
		if( userBankAccountData ) {
			const data = [];
			const institutionArray = [];
			const checkingAccounts = [];

			_.forEach( userBankAccountData, function( userbankData ) {
				let blockUserBankAccount = 0;

				const institutionType = userbankData.institutionType;
				const arrayres = institutionArray.indexOf( institutionType );
				if( arrayres == "-1" ) {
					institutionArray.push( institutionType );
					data.push( userbankData );

					// -- checking only checking account
					userbankData.accounts.map( function( account ) {
						if( account.subtype === "checking" ) {
							checkingAccounts.push( account.numbers.account );
						}
					} );
				} else {
					// -- checking only checking account
					userbankData.accounts.map( function( account ) {
						if( account.subtype === "checking" ) {
							if( in_array( account.numbers.account, checkingAccounts ) ) {
								blockUserBankAccount = 1;
							} else {
								checkingAccounts.push( account.numbers.account );
							}
						}
					} );

					if( blockUserBankAccount == 0 ) {
						data.push( userbankData );
					}
				}
			} );

			// sails.log.info("Userbankaccount responseData::",responseData);

			var responseData = {
				code: 200,
				userBankAccountData: data,
				institutionArray: institutionArray,
				checkingAccounts: checkingAccounts
			};
			return resolve( responseData );
		} else {
			var responseData = {
				code: 400,
				userBankAccountData: userBankAccountData
			};
			return resolve( responseData );
		}
	} );
}


/**
 * get checking account
 * @param {UserBankAccount} userBankAccount
 * @return {Object}
 */
function getCheckingAccount( userBankAccount ) {
	let selectedAccount = null;
	_.forEach( userBankAccount.accounts, ( bankaccount ) => {
		if( bankaccount.subtype != "checking" || bankaccount.type != "depository" ) return;
		if( !bankaccount.numbers ) return;
		const availBalance = parseFloat( bankaccount.balance.available );
		if( selectedAccount == null ) {
			selectedAccount = bankaccount;
		}
		if( availBalance > parseFloat( selectedAccount.balance.available ) ) {
			selectedAccount = bankaccount;
		}
	} );
	if( selectedAccount == null ) {
		return null;
	}
	sails.log.verbose( "getCheckingAccount; selectedAccount:", JSON.stringify( selectedAccount ) );
	return {
		balance: selectedAccount.balance,
		institutionType: userBankAccount.institutionType,
		accountName: ( selectedAccount.meta.official_name || selectedAccount.meta.name ),
		accountNumberLastFour: selectedAccount.numbers.account.slice( -4 ),
		routingNumber: selectedAccount.numbers.routing,
		accountNumber: selectedAccount.numbers.account,
		accountType: selectedAccount.type,
		accountSubType: selectedAccount.subtype,
		user: userBankAccount.user,
		userBankAccount: userBankAccount.id,
		plaidMeta: {
			id: selectedAccount._id,
			item: selectedAccount._item,
			user: selectedAccount._user
		}
	};
}

function createUserBankAccountObject( transactionDetails, institutionName, institutionType, accountDetails, userid, token, screentrackingId ) {
	sails.log.verbose( "createUserBankAccountObject; getAssetTransactionDetail() total_transactions:", transactionDetails.total_transactions );
	const item_id = accountDetails.item.item_id;
	let transavail = 0;
	if( transactionDetails.total_transactions > 0 ) {
		transavail = 1;
	}

	const transactionGenerated = {};
	if( transactionDetails.total_transactions > 0 ) {
		sails.log.info( "enter if loop for transactions:: " );
		_.forEach( transactionDetails.transactions, function( transaction ) {
			if( !transactionGenerated.hasOwnProperty( transaction.account_id ) ) {
				// sails.log.info('Enter property if loop');
				transactionGenerated[ transaction.account_id ] = [];
			}

			const obj = {
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
				// pending_transaction_id: transaction.pending_transaction_id,
				// account_owner: transaction.account_owner
			};
			transactionGenerated[ transaction.account_id ].push( obj );
		} );
	}

	const accountsData = [];

	_.forEach( accountDetails.accounts, function( accountsval ) {
		const metaData = {
			limit: accountsval.balances.limit,
			name: accountsval.name,
			number: accountsval.mask,
			official_name: accountsval.official_name
		};

		let accountNumbers = _.filter( accountDetails.numbers.ach, { account_id: accountsval.account_id } );
		// sails.log.verbose( "accountNumbers:", accountNumbers );
		accountNumbers = accountNumbers.length > 0 ? accountNumbers[ 0 ] : null;

		const objdata = {
			_id: accountsval.account_id,
			_item: accountsval.account_id,
			_user: accountsval.account_id,
			balance: accountsval.balances,
			institution_type: institutionType,
			meta: metaData,
			numbers: accountNumbers,
			subtype: accountsval.subtype,
			type: accountsval.type
		};
		accountsData.push( objdata );
	} );

	sails.log.info( "userBankAccount array:: " );
	const userBankAccount = {
		accounts: accountsData,
		accessToken: token,
		institutionName: institutionName,
		institutionType: institutionType,
		user: userid,
		transactions: transactionGenerated,
		item_id: item_id,
		access_token: token,
		transavail: transavail
	};
	if( screentrackingId ) {
		userBankAccount.screentracking = screentrackingId;
	}
	return userBankAccount;
}

async function getBankData( screenid, userid, paydata ) {
	let linkedAccountId;
	let linkedAccountNumber;
	let accountdata;
	let screendata;
	if( paydata && paydata.account ) {
		accountdata = await Account.findOne( { id: paydata.account } );
	} else if( screenid ) {
		screendata = await Screentracking.findOne( { id: screenid } );

		if( screendata && screendata.accounts ) {
			accountdata = await Account.findOne( { id: screendata.accounts } );
		}
	}

	const banks = await UserBankAccount.find( { user: userid } ).sort( "createdAt DESC" );

	if( !accountdata && ( banks.length > 0 ) ) {
		accountdata = await Account.findOne( { userBankAccount: banks[ 0 ].id } );
	}

	if( accountdata ) {
		linkedAccountId = accountdata.userBankAccount;
		linkedAccountNumber = accountdata.accountNumber;
	}

	if( ! linkedAccountId && ( banks.length > 0 ) ) {
		/* default the linked account to the most recently added */

	}

	const repullArray = [];
	banks.forEach( ( bank ) => {
		if( "undefined" === typeof bank.item_id || bank.item_id == "" || bank.item_id == null ) {
			bank.userfilloutmanually = 1;
			repullArray.push( Promise.resolve( null ) );
		} else {
			repullArray.push( Repullbankaccount.find( { userBankAccount: bank.id, version: "1" } ).sort( "createdAt DESC" ) );
		}
	} );

	const repullResults = await Promise.all( repullArray );

	/* Use the userbank account record for manually added accounts and old accounts that do not have repull data */
	const fallbackArray = [];
	for( let idx = 0; idx < repullResults.length; idx++ ) {
		if( repullResults[ idx ] && repullResults[ idx ].length > 0 ) {
			banks[ idx ].snapshots = repullResults[ idx ];
			fallbackArray.push( Promise.resolve( null ) );
		} else {
			fallbackArray.push( UserBankAccount.find( { id: banks[ idx ].id } ) );
		}
	}

	const fallbackResults = await Promise.all( fallbackArray );
	for( let idx = 0; idx < fallbackResults.length; idx++ ) {
		if( ! banks[ idx ].snapshots ) {
			banks[ idx ].snapshots = fallbackResults[ idx ];
		}
	}

	const plaidPromises = [];

	_.forEach( banks, ( bank ) => {

		if( bank.id == linkedAccountId ) {
			bank.linkedAccount = true;
			bank.accountNumber = linkedAccountNumber.replace( /\d(?=\d{4})/g, "X" );
		}

		plaidPromises.push( PlaidUser.find( { userBankAccount: bank.id } ) );

		bank.snapshots.forEach( ( snapshot ) => {
			let availables;
			let currents;
			_.forEach( snapshot.accounts, function( account ) {
				availables = parseFloat( account.balance.available ).toFixed( 2 );
				if( availables > 0 ) {
					account.balance.available = availables.toString().replace( /(\d)(?=(\d\d\d)+(?!\d))/g, "$1," );
					account.balance.available = "$" + account.balance.available;
				}
				currents = parseFloat( account.balance.current ).toFixed( 2 );
				if( currents > 0 ) {
					account.balance.current = currents.toString().replace( /(\d)(?=(\d\d\d)+(?!\d))/g, "$1," );
					account.balance.current = "$" + account.balance.current;
				}
				if( account.numbers ) {
					if( account.numbers.account == linkedAccountNumber ) {
						account.linkedAccount = true;
					}
					const str1 = account.numbers.account;
					if( "undefined" !== typeof str1 && str1 != "" && str1 != null ) {
						account.numbers.account = str1.replace( /\d(?=\d{4})/g, "X" );
					}
				}
				if( account.meta ) {
					if( account.meta.name && account.meta.name.startsWith( "Plaid " ) ) {
						account.meta.name = account.meta.name.slice( "Plaid ".length );
					}
					if( account.meta.accountName && account.meta.accountName.startsWith( "Plaid " ) ) {
						account.meta.accountName = account.meta.accountName.slice( "Plaid ".length );
					}
				}
				if( account.numbers && account.numbers.account ) {
					account.number = account.numbers.account;
				} else {
					account.number = "";
				}
				snapshot.createdAt = moment( snapshot.createdAt ).format( "LL" );
			} );
		} );
		bank.currentSnapshot = bank.snapshots.slice( 0, 1 );
		bank.historicalSnapshots = bank.snapshots.slice( 1 );
		delete bank.snapshots;
	} );

	const plaidInfo = await Promise.all( plaidPromises );
	for( let idx = 0; idx < plaidInfo.length; idx++ ) {
		banks[ idx ].plaidDetails = plaidInfo[ idx ][ 0 ];
	}

	return banks;
}
