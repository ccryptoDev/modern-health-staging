/* global  sails UserBankAccount Account PlaidUser User Screentracking PaymentManagement */

const srcFile = __filename.slice(__dirname.length + 1, -3);
module.exports = {
	updatefilloutmanualdetails: updatefilloutmanualdetails
};

function updatefilloutmanualdetails( reqdata, userid, filloutmanually ) {
	return Q.promise( function( resolve, reject ) {
		if( filloutmanually == 0 ) {
			sails.log.info( `${srcFile}: updatefilloutmanualdetails filloutmanually 0` );
			return resolve( {
				code: 200
			} );
		} else {
			sails.log.info( `${srcFile}:updatefilloutmanualdetails begin` );
			const bankaccno = reqdata.param( "bankaccno" );
			const institutionName = reqdata.param( "bankname" );
			const institutionType = reqdata.param( "banktype" );
			const routingno = reqdata.param( "routingno" );
			const payid = reqdata.param( "payid" );

			const accountsData = [];
			const balanceData = {
				available: 0,
				current: 0,
				limit: ""
			};
			const metaData = {
				limit: null,
				name: "Checking",
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
			// UserBankAccount.findOne( { user: userid } )
			// .sort( "createdAt DESC" )
			.then( function( userBankRes ) {
				User.findOne( {
					id: userid
				} )
				.then( function( user ) {
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

					let userAddress = "";
					let userCity = "";
					let userzipCode = "";
					let userState = "other";

					if( "undefined" !== typeof user.street && user.street != "" && user.street != null ) {
						userAddress = user.street;
					}

					if( "undefined" !== typeof user.city && user.city != "" && user.city != null ) {
						userCity = user.city;
					}

					if( "undefined" !== typeof user.zipCode && user.zipCode != "" && user.zipCode != null ) {
						userzipCode = user.zipCode;
					}
					if( "undefined" !== typeof user.state && user.state != "" && user.state != null ) {
						userState = user.state;
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

					PlaidUser.create( newPlaidUser ).then( function( plaiddata ) {
						const balanceData = {
							available: 0,
							current: 0,
							limit: ""
						};
						const newAccountData = {
							balance: balanceData,
							institutionType: institutionType,
							accountNumberLastFour: bankaccno.slice( -4 ),
							routingNumber: routingno,
							accountNumber: bankaccno,
							accountName: "Checking",
							accountType: "depository",
							accountSubType: "checking",
							user: userid,
							userBankAccount: userBankRes.id
						};
						Account.create( newAccountData )
						// Account.findOne( { userBankAccount: userBankRes.id } )
						.then( function( account ) {
							if( !account ) {
								return account;
							}
							if( !payid ) {
								return account;
							} else {
								return PaymentManagement.update( { id: payid }, { account: account.id } )
								.then( ( paydata ) => {
									return account;
								} );
							}
						} )
						.then( ( account ) => {
							if( account ) {
								const checkcriteria = {
									user: userid,
									iscompleted: 0
								};
								Screentracking.findOne( checkcriteria )
								.then( ( screenRes ) => {
									if( screenRes ) {
										return screenRes;
									}
									return Screentracking.findOne( { user: userid } ).sort( "createdAt DESC" );
								} )
								.then( ( screenRes ) => {
									screenRes.accounts = account.id;
									// screenRes.requestedLoanAmount = financedAmount;
									// screenRes.incomeamount      = annualincome;

									// -- Added for multiple loans
									screenRes.isAccountLinked = 1;

									// --Added isBankAdded on 25/10/2018 to enable fill out manually option in borrower portal.
									screenRes.isBankAdded = 1;
									// screenRes.lastlevel = 4;

									screenRes.save( function( err ) {
										User.update(
											{
												id: userid
											},
											{
												isBankAdded: true
											}
										).exec( function afterwards( err, updated ) {
											sails.log.info( "updated user", updated );
										} );
										// var redirectpath  = "/loansuccess";
										sails.log.info( `${srcFile}: updatefilloutmanualdetails success` );
										return resolve( {
											code: 200,
											account: account.id
										} );
									} );
								} )
								.catch( function( err ) {
									sails.log.error( `${srcFile}: updatefilloutmanualdetails error`, err );
									return reject( {
										code: 400
									} );
								} );
							}
						} );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( `${srcFile}: updatefilloutmanualdetails error`, err );
					return reject( {
						code: 400
					} );
				} );
			} );
		}
	} );
}
