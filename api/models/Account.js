/**
 * Accounts.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var Q = require('q'),
  moment = require('moment');

module.exports = {

  attributes: {
    type: {
      type: 'String',
      defaultsTo: 'ACH'
    },
    balance: {
      type: 'json'
    },
    institutionType: {
      type: 'String'
    },
    accountName: {
      type: 'String'
    },
    accountNumberLastFour: {
      type: 'String'
    },
    routingNumber: {
      type: 'String'
    },
    accountNumber: {
      type: 'String'
    },
    wireRoutingNumber: {
      type: 'String'
    },
    accountType: {
      type: 'String'
    },
    accountSubType: {
      type: 'String'
    },
    user: {
      model: 'User'
    },
    plaidMeta: {
      type: 'json'
    },
    /*autoPay: {
      collection: 'AutoPay',
      via: 'paymentSource'
    },*/
    userBankAccount: {
      model: 'UserBankAccount'
    },
    story: {
      model: 'Story'
    },
    isDeleted: {
      type: 'boolean',
      defaultsTo: false
    },
    toApi: toApi,
    toListApi: toListApi,
    storyavail: {
      type: 'integer',
      defaultsTo: 0
    },
  },
  createAccountDetail: createAccountDetail,
  getAccountDetail: getAccountDetail,
  getAccountForUser: getAccountForUser,
  getAllAccountsForUserWithFluidCard: getAllAccountsForUserWithFluidCard,
  getAccessTokenForUserAccount: getAccessTokenForUserAccount,
  getAllForUser: getAllForUser
};

function toApi() {
  var account = this.toObject();

  return {
    name: account.accountName,
    number: account.accountNumberLastFour,
    institutionType: account.institutionType,
    accountType: account.accountType,
    accountSubType: account.accountSubType,
    userBankAccount: account.userBankAccount,
    routingNumber: account.routingNumber,
    accountNumber: account.accountNumber,
    userIsBankAdded: account.user.isBankAdded,
    days: '1-3days',
    fee: '0%',
    id: account.id
  };
}


function createAccountDetail(userBankAccountId, user, itemId, plaidAccountId, storyId, userincome, isChangeBank) {
	return Q.promise(function (resolve, reject) {

	  var criteria = {
		id: userBankAccountId,
		user: user.id
	  };

	  UserBankAccount.findOne(criteria)
	  .then(function (userBankAccount) {
		  // check if user bank account exists
		  if (!userBankAccount) {
			// throw error
			sails.log.info("Account#createAccountDetails :: No Userbank found for criteria :: ", criteria);

			return reject({
			  code: 404,
			  message: 'USER_BANK_ACCOUNT_NOT_FOUND'
			});
		  }

		  const newAccount = UserBankAccount.getCheckingAccount( userBankAccount );
		  if( newAccount == null ) {
			  return reject( { code: 400, message: "ACCOUNT_INVALID_ACCOUNT_DATA" } );
		  }

		  // // get account for the given id
		  // var filteredAccounts = _.filter(userBankAccount.accounts, {
		  //   "_item": itemId,
		  //   "_id": plaidAccountId
		  // });
		  // // check if filtered accounts exists
		  // if (filteredAccounts.length == 0) {
		  //   sails.log.error("Account#createAccountDetail :: No account found for :: ", itemId, " :: PlaidId :: ", plaidAccountId);
		  //   return reject({
		  //     code: 400,
		  //     message: 'ACCOUNT_INVALID_ACCOUNT_DATA'
		  //   });
		  // }
		  // var accountToCreate = filteredAccounts[0];
		  // // check if the linking account is of type checking
		  // // if (accountToCreate.subtype !== "checking") {
		  // if (accountToCreate.subtype === 'credit card') {
		  //   // cannot link this account
		  //   sails.log.error("Account#createAccountDetails :: Cannot link this account :: ", accountToCreate);
		  //   return reject({
		  //     code: 400,
		  //     message: 'ACCOUNT_INVALID_ACCOUNT_DATA'
		  //   });
		  // }

		  if ("undefined" === typeof storyId || storyId == '' || storyId == null) {
			storyId = '';
			var storyavail = 0;
			var criteria = {
			  user: user.id,
			  accountNumber: newAccount.accountNumber,
			  accountNumberLastFour: newAccount.accountNumberLastFour,
			  //-- Added to apply for second loan
			  //storyavail: { $eq: 2, $exists: true }
			  achprocessType: {
				$eq: 'bankaccount',
				$exists: true
			  }
			};
		  } else {
			var storyavail = 1;
			var criteria = {
			  user: user.id,
			  accountNumber: accountToCreate.numbers.account,
			  accountNumberLastFour: accountToCreate.meta.number,
			  storyavail: {
				$eq: 1,
				$exists: true
			  },
			  //achprocessType: { $eq: 'bankaccount', $exists: true }
			  //story: storyId
			};
		  }


		  if (userBankAccount.transactions) {
			var startdate = moment().subtract(90, 'days').format('YYYY-MM-DD');
			var enddate = moment().format('YYYY-MM-DD');
			var totalpayroll = 0;
			var subTypeArray = [];
			var payRollArray = [];
			var payrollname = '';
			var payrollamount = 0;
			var transdate = '';


			_.forEach(userBankAccount.transactions, function (transactions) {
			  _.forEach(transactions, function (payrolldata) {
				payrollname = payrolldata.category;
				payrollamount = payrolldata.amount;
				if (payrollname != '' && payrollname != null && "undefined" !== typeof payrollname) {
				  payrollname = payrollname.toString();
				  transdate = payrolldata.date;

				  var ddkeyword = sails.config.plaid.ddKeyword;
				  if (ddkeyword.indexOf(payrollname.toLowerCase()) > -1) {
					if (startdate < transdate && enddate > transdate) {
					  payRollArray.push(payrolldata);
					  payrollamount = parseFloat(payrollamount);
					  totalpayroll = parseFloat(totalpayroll);
					  totalpayroll = totalpayroll + payrollamount;
					}
				  }

				  /*if (payrollname === 'Payroll,Direct Deposit' && (startdate < transdate && enddate > transdate))
				  {
					  payrollamount = parseFloat(payrollamount);
					  totalpayroll = parseFloat(totalpayroll);
					  totalpayroll = totalpayroll+payrollamount;
				  }	*/
				}
			  });

			});

			if (totalpayroll > 0) {
			  totalpayroll = (totalpayroll / 3) * 12;
			  totalpayroll = totalpayroll.toFixed(2);
			  var payrolldetected = totalpayroll;
			  sails.log.info("payrolldetected", payrolldetected);
			}


			var minimumIncomePlaid = sails.config.plaid.minincomeamount;

			if (totalpayroll >= minimumIncomePlaid) {
			  User.update({
				id: user.id
			  }, {
				isPayroll: true
			  }).exec(function afterwards(err, updated) {});
			}

			if (parseFloat(totalpayroll) == parseFloat(userincome)) {
			  var incometype = 'Automatically';
			  //User.update({id: user.id}, {isPayroll: true}).exec(function afterwards(err, updated){});
			} else {
			  var incometype = 'Manually';
			}

			if (userincome > 0) {
			  totalpayroll = userincome;
			} else {
			  if (totalpayroll == 0 || totalpayroll == '') {
				totalpayroll = userincome;
			  } else {
				totalpayroll = (totalpayroll / 3) * 12;
				totalpayroll = totalpayroll.toFixed(2);
			  }
			}
			Screentracking.update({
				user: user.id,
				iscompleted: 0
			  }, {
				incomeamount: totalpayroll,
				incometype: incometype,
				detectedPayroll: payrolldetected
			  })
			  .exec(function afterwards(err, updated) {});

		  }

		  // var newAccount = {
		  //   balance: accountToCreate.balance,
		  //   institutionType: accountToCreate.institution_type,
		  //   accountName: accountToCreate.meta.name,
		  //   accountNumberLastFour: accountToCreate.meta.number,
		  //   routingNumber: accountToCreate.numbers.routing,
		  //   accountNumber: accountToCreate.numbers.account,
		  //   wireRoutingNumber: accountToCreate.numbers.wireRouting,
		  //   accountType: accountToCreate.type,
		  //   accountSubType: accountToCreate.subtype,
		  //   user: user.id,
		  //   userBankAccount: userBankAccount.id,
		  //   plaidMeta: {
		  //     id: accountToCreate._id,
		  //     item: accountToCreate._item,
		  //     user: accountToCreate._user
		  //   },
		  //   storyavail: storyavail,
		  //   story: storyId,
		  //   incomeamount: totalpayroll
		  // };
		  // const newAccount = UserBankAccount.getCheckingAccount( userBankAccount );
		  // create linked account for the user

		  sails.log.info('newAccount : ', newAccount);
		  sails.log.info('newAccount criteria : ', criteria);


		  Account.findOne( criteria )
		  .then( ( accountDetail ) => {

			  sails.log.info('newAccount accountDetail : ', accountDetail);

			  if (!accountDetail) {

				Account.create(newAccount)
				  .then(function (accountEntity) {
					var criteria = {
					  id: accountEntity.user
					};

					User.findOne(criteria)
					  .then(function (user) {

						user.isBankAdded = true;
						user.isGovernmentIssued = true;

						user.save(function (err) {
						  if (err) {
							sails.log.error("Account#createAccountDetail :: Error :: ", err);

							return reject({
							  code: 500,
							  message: 'INTERNAL_SERVER_ERROR'
							});
						  }
						  var criteria = {
							id: accountEntity.id
						  };

						  sails.log.info('criteria ', criteria);

						  Account.findOne(criteria)
							.populate('user')
							.then(function (accnt) {
							  //return resolve(accnt.toApi());
							  var accountres = accnt.toApi();
							  return resolve(accountres);
							})


						});

					  })

				  })
				  .catch(function (err) {
					sails.log.error("Account#createAccountDetail :: ", err);

					return reject({
					  code: 500,
					  message: 'INTERNAL_SERVER_ERROR'
					});
				  });
			  } else {

				sails.log.info('isChangeBank============= : ', isChangeBank);

				if (isChangeBank == 1) {

				  var payCriteria = {
					where: {
					  story: storyId,
					  user: user.id,
					  status: 'OPENED',
					  isPaymentActive: true,
					  //$or : [ { achstatus : 0 }, { achstatus : 1 }, { achstatus : 3 } ]
					},
					sort: 'createdAt DESC'
				  };

				  PaymentManagement.findOne(payCriteria)
					.populate('account')
					.then(function (paymentmanagementDetails) {


					  var accountNumber = paymentmanagementDetails.account.accountNumber;
					  var accountNumberLastFour = paymentmanagementDetails.account.accountNumberLastFour;

					  sails.log.info('accountNumber============= : ', accountNumber);
					  sails.log.info('accountNumberLastFour============= : ', accountNumberLastFour);

					  if (accountNumber == newAccount.accountNumber) {
						sails.log.error("Account#createAccountDetail :: Same Account ");
						return reject({
						  code: 400,
						  message: 'ACCOUNT_ALREADY_LINKED'
						})
					  } else {

						//Allow change previous bank
						paymentmanagementDetails.account.storyavail = 3;
						paymentmanagementDetails.save(function (err) {

						  if (err) {
							return reject({
							  code: 500,
							  message: 'INTERNAL_SERVER_ERROR'
							});
						  }

						  accountDetail.storyavail = 3;
						  accountDetail.save(function (err) {

							if (err) {
							  return reject({
								code: 500,
								message: 'INTERNAL_SERVER_ERROR'
							  });
							}

							Account.create(newAccount)
							  .then(function (accountEntity) {
								var criteria = {
								  id: accountEntity.user
								};
								User.findOne(criteria)
								  .then(function (user) {
									user.isBankAdded = true;
									user.save(function (err) {
									  if (err) {
										sails.log.error("Account#createAccountDetail :: Error :: ", err);
										return reject({
										  code: 500,
										  message: 'INTERNAL_SERVER_ERROR'
										});
									  }
									  var criteria = {
										id: accountEntity.id
									  };
									  Account.findOne(criteria)
										.populate('user')
										.then(function (accnt) {
										  //return resolve(accnt.toApi());
										  var accountres = accnt.toApi();
										  return resolve(accountres);
										})
									});

								  })

							  })
							  .catch(function (err) {
								sails.log.error("Account#createAccountDetail :: ", err);
								return reject({
								  code: 500,
								  message: 'INTERNAL_SERVER_ERROR'
								});
							  });

						  });
						});
					  }
					})
					.catch(function (err) {
					  sails.log.error("Account#createAccountDetail :: ", err);
					  return reject({
						code: 500,
						message: 'INTERNAL_SERVER_ERROR'
					  });
					});


				} else {
				  return reject({
					code: 400,
					message: 'ACCOUNT_ALREADY_LINKED'
				  })
				}
			  }

			})


		})
	});
  }

function getAccountDetail() {
  return Q.promise(function (resolve, reject) {
    Account.find()
      .then(function (accDet) {
        return resolve(accDet);
      })
      .catch(function (err) {
        sails.log.error('Account#getAccountDetail :: Error :: ', err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function getAccountForUser(accountId, userId) {
  return Q.promise(function (resolve, reject) {
    var criteria = {
      id: accountId,
      user: userId,
      isDeleted: false
    };

    Account
      .findOne(criteria)
      .then(function (account) {
        if (!account) {
          sails.log.error("Account#getAccountForUser :: Account not found");

          return reject({
            code: 404,
            message: 'ACCOUNT_NOT_FOUND'
          });
        }

        return resolve(account);
      })
      .catch(function (err) {
        sails.log.error('Account#getAccountForUser :: Error :: ', err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function getAllAccountsForUserWithFluidCard(user) {
  return Q.promise(function (resolve, reject) {
    var criteria = {
      user: user.id,
      isDeleted: false
    };
    console.log("fluid criteria", criteria);
    var data = [];
    Account
      //.find(criteria)
      .findOne(criteria)
      .sort({
        'createdAt': -1
      })
      .then(function (accounts) {

        data.push(accounts.toListApi());

        /*_.forEach(accounts, function(account) {
          data.push(account.toListApi());
        });*/

        console.log("fluid data", data);
        //return FluidCard.findOne(criteria)
        return resolve(data);
      })
      /*.then(function(fluidCard) {
		console.log("Entered fluid api list");
		console.log("fluidCard: ",fluidCard);
        data.push(fluidCard.toFluidListApi());
		console.log("fluidlist values",data);
        return resolve(data);
      })*/
      .catch(function (err) {
        sails.log.error('Account#getAllAccountsForUserWithFluidCard :: Error :: ', err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function getAllForUser(user) {
  return Q.promise(function (resolve, reject) {
    var criteria = {
      user: user.id,
      isDeleted: false
    };

    var data = [];
    Account
      .find(criteria)
      .then(function (accounts) {
        accounts.map(function (account) {
          data.push(account.toListApi());
        });

        return resolve(data);
      })
      .catch(function (err) {
        sails.log.error("Account#getAllForUser :: ", err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      })
  });
}

function toListApi() {
  var account = this.toObject();
  return {
    type: account.type,
    accountSubType: account.accountSubType,
    accountType: account.accountType,
    institutionType: account.institutionType,
    name: account.name,
    number: account.number,
    userBankAccount: account.userBankAccount,
    accountName: account.accountName,
    accountNumber: account.accountNumber,
    accountNumberLastFour: account.accountNumberLastFour,
    balance: account.balance,
    linkedAccountId: account.id,
    timeRequired: '1-3days',
    ProcessingFee: '0%'
  };
}

function getAccessTokenForUserAccount(user) {
  return Q.promise(function (resolve, reject) {
    var criteria = {
      user: story.user
    };
    UserBankAccount
      .findOne(criteria)
      .then(function (userBankAccount) {
        accessToken = userBankAccount.access_token;
        return resolve(accessToken);
      })
      .catch(function (err) {
        return reject(err);
      })
  });
}