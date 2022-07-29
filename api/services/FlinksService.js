"use strict";

var request = require('request'),
	Q = require('q'),
	_ = require('lodash'),
	moment = require('moment');

var fs = require('fs');
var config = sails.config;
const { userInfo } = require('os');
const axios = require("axios");

const FLINKS_INSTANCE = "sandbox";
const FLINKS_VERSION = "v3";
const CUSTOMER_ID = "6571a9fd-da1b-454d-97fc-7b6c6586ae2b";
const FLINKS_URL = `https://${FLINKS_INSTANCE}-api.private.fin.ag/${FLINKS_VERSION}/${CUSTOMER_ID}/attributes/upload`;

module.exports = {
	getUserCreditRiskAttributes: getUserCreditRiskAttributes,
	executeBTRsForAllUsers: executeBTRsForAllUsers,
	getUserAttributes: getUserAttributes
};

async function executeBTRsForAllUsers() {
	let promises = [];
	PlaidAssetReport.find().limit(100).then((assetReports) => {
		sails.log.warn("reports length", assetReports.length);
		assetReports.forEach((assetReport, index) => {
			let percentage = 0;
			promises.push(
				Screentracking.findOne({ user: assetReport.user })
					.then((screentracking) => {
						if (screentracking && assetReport && screentracking.rulesDetails) {
							let total = assetReports.length;
							let current_progress = 0;
							current_progress = index / total;
							percentage = (current_progress * 100).toFixed(2);
							sails.log.warn("Reading users. Progress: " + percentage + "%");
							sails.log.warn("screen id", screentracking.id);
							const btrules = executeBTRs(assetReport);
							screentracking.rulesDetails.banktransactionrules = { ...btrules };
							const btrs = {
								rulesDetails: {
									...screentracking.rulesDetails,
									banktransactionrules: { ...btrules }
								}
							};
							sails.log.warn("Updating . . .")
							Screentracking.update({ id: screentracking.id }, btrs).then((response) => {
								sails.log.warn("user updated: ", screentracking.user)
							});
						}
					})
			);
		});

		Promise.all(promises).then(() => {
			sails.log.warn("BTRs completed")
		}).catch((err) => {
			sails.log.error(err);
		})
	});
}


async function executeBTRsForAllUsers() {
	let promises = [];
	sails.log.warn("executing ALL BTRS")
	Screentracking.find({ rulesDetails: { $exists: true }, "rulesDetails.banktrasactionrules": { $exists: false } })
		.limit(400)
		.then(screentrackings => {
			sails.log.warn("users length", screentrackings.length)
			screentrackings.forEach((screentracking, index) => {
				let percentage = 0;
				promises.push(
					PlaidAssetReport.find({ user: screentracking.user })
						.limit(1)
						.then(assetReport => {
							if (assetReport[0] && screentracking.rulesDetails) {
								let total = screentrackings.length;
								let current_progress = 0;
								current_progress = index / total;
								percentage = (current_progress * 100).toFixed(2);
								sails.log.warn("Reading users. Progress: " + percentage + "%");
								const btrules = executeBTRs(assetReport[0]);
								screentracking.rulesDetails.banktransactionrules = { ...btrules };
								const btrs = {
									rulesDetails: {
										...screentracking.rulesDetails,
										banktransactionrules: { ...btrules }
									}
								};
								Screentracking.update({ id: screentracking.id }, btrs).then((response) => {
									sails.log.warn("user updated: ", screentracking.user)
								});
							}
						})
				)
			});

			Promise.all(promises).then(() => {
				sails.log.warn("BTRs completed")
			})
		})
}

async function authorize() {
	const DEFAULT_CREDENTIALS = {
		"Institution": "FlinksCapital",
		"username": "Greatday",
		"Password": "Everyday",
		"MostRecentCached": true,
		"Save": true
	};
	return axios.post(FLINKS_URL + '/BankingServices/Authorize', DEFAULT_CREDENTIALS).then(response => {
		return response.body;
	})
}

async function getUserAttributes(userid) {
	authorize().then(() => {
		let jsonObject = { "Transactions": [], "Options": {} };
		PlaidAssetReport.findOne({ user: userid }).then(report => {
			sails.log.warn("asset report found", report[0])
			let currentBalance = 0;
			_.forEach(report.report.items, (item) => {
				_.forEach(item.accounts, (bankaccount) => {
					currentBalance = bankaccount.balances.current;
					jsonObject.Options = { "MostRecentBalance": currentBalance };
					_.forEach(bankaccount.transactions, (transaction) => {
						const isCreditType = transaction.category.includes("Credit");
						const formattedTransaction = {
							"TransactionDate": transaction.date,
							"Description": transaction.original_description,
							"Debit": null,
							"Credit": null
						};

						if (isCreditType) {
							formattedTransaction.Credit = transaction.amount;
						} else {
							formattedTransaction.Debit = transaction.amount;
						}
						jsonObject.Transactions.push(formattedTransaction);
					})
				})
			});
			return axios.post(FLINKS_URL, jsonObject).then((response) => {
				return response.data;
			}).catch(err => {
				sails.log.error(err);
			});
		});
	})
}

async function getUserCreditRiskAttributes(assetReport) {
	let jsonObject = { "Transactions": [], "Options": {} };
	let currentBalance = 0;
	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {
			currentBalance = bankaccount.balances.current;
			jsonObject.Options = { "MostRecentBalance": currentBalance };
			_.forEach(bankaccount.transactions, (transaction) => {
				const isCreditType = transaction.category.includes("Credit");
				const formattedTransaction = {
					"TransactionDate": transaction.date,
					"Description": transaction.original_description,
					"Debit": null,
					"Credit": null
				};

				if (isCreditType) {
					formattedTransaction.Credit = transaction.amount;
				} else {
					formattedTransaction.Debit = transaction.amount;
				}
				/*
				const creditRiskResponse = await axios.post(FLINKS_URL + "/CreditRisk");
				return Screentracking.findOne({ user: assetReport.user }).then(( screentracking ) => {
				  screentracking.flinks_attributes = { CreditRisk: creditRiskResponse };
				});*/
			})
		})
	});
}

// Run this function once, it will loop through all the users to fill the remaining data
async function setUserAttributesForAllUsers() {

}

function executeBTRs(assetReport) {
	let rules = {};
	//rule e_r_1  
	let income_list = ['PAYROLL',
		'ANNUITY',
		'DIRECT DEP',
		'DIRECT DEPOSIT',
		'DIRECT DEP',
		'DIRDEP',
		'DIR� DEP',
		'DIR DEP',
		'DIRECT DEP',
		'SALARY',
		'PAYCHECK',
		'BRANCH DEPOSIT INCOME',
		'ATM DEPOSIT INCOME',
		'MOBILE DEPOSIT INCOME',
		'BRANCH DEPOSIT WITH HOLD INCOME',
		'INCOME - PAYCHECK',
		'PROMOTION BONUS',
		'ALLOWANCE',
		'DIVIDEND'
	];

	let exclude_list = ['BANKING PAYMENT',
		'ONLINE PAYMENT',
		'CREDIT CARD PAYMENT'
	];

	let category_list = ['Tax|Refund', 'Transfer|Payroll', 'Transfer|Payroll|Benefits'];

	let income_6mon_amount = 0;
	let income_6mon_avg;
	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {
			_.forEach(bankaccount.transactions, (transaction) => {
				let trans_since_app = moment().diff(moment(transaction.date), 'months', true);
				let trans_name = transaction.name.toUpperCase();
				let trans_description = transaction.original_description.toUpperCase();
				let trans_category = transaction.category.join('|');

				if (transaction.amount < -5 && trans_since_app <= 6 &&
					((category_list.includes(trans_category) == true && exclude_list.includes(trans_name) == false)
						|| (income_list.includes(trans_name) || income_list.includes(trans_description)))) {

					income_6mon_amount += parseFloat(transaction.amount);

				}
			})

		})
	});

	income_6mon_avg = income_6mon_amount / 6;
	income_6mon_avg = income_6mon_avg * -1;
	rules.btr1 = { passed: income_6mon_avg < 2000 ? false : true, value: income_6mon_avg.toFixed(2) };
	// rule e_r_1: if income_6mon_avg < 2000  then e_r_1 = 1 else e_r_1  = 0;

	let NSF_list = ['OVERDRAFT', 'INSUFFICIENT', ' OD FEE', ' NSF'];
	let overdraft_list = ['Bank Fees, Insufficient Funds', 'Bank Fees, Overdraft', "Bank Fees"];

	// rule e_r_2

	let nsf_in_1m_cnt = 0;
	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {
			_.forEach(bankaccount.transactions, (transaction) => {

				let trans_since_app = moment().diff(moment(transaction.date), 'months', true);
				let trans_name = transaction.name.toUpperCase();
				let trans_description = transaction.original_description.toUpperCase();
				let trans_category = transaction.category.join('|');

				if (trans_since_app <= 1 &&
					(NSF_list.includes(trans_name) == true || NSF_list.includes(trans_description) == true || overdraft_list.indexOf(trans_category) > -1)) {
					nsf_in_1m_cnt += 1;
				}
			})

		})
	});    // e_r_2: if nsf_in_1m_cnt > 0  then e_r_2 = 1 else e_r_2 = 0;
	rules.btr2 = { passed: nsf_in_1m_cnt > 0 ? false : true, value: nsf_in_1m_cnt.toFixed(2) };

	//rule e_r_3
	let nsf_in_3m_cnt = 0;
	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {
			_.forEach(bankaccount.transactions, (transaction) => {

				let trans_since_app = moment().diff(moment(transaction.date), 'months', true);
				let trans_name = transaction.name.toUpperCase();
				let trans_description = transaction.original_description.toUpperCase();
				let trans_category = transaction.category.join('|');

				if (trans_since_app <= 3 &&
					(NSF_list.includes(trans_name) == true || NSF_list.includes(trans_description) == true || overdraft_list.indexOf(trans_category) > -1)) {
					nsf_in_3m_cnt += 1;

				}
			})

		})
	});    // e_r_3: if nsf_in_3m_cnt > 2  then e_r_3 = 1 else e_r_3 = 0;
	rules.btr3 = { passed: nsf_in_3m_cnt > 2 ? false : true, value: nsf_in_3m_cnt.toFixed(2) };

	// rule e_r_4
	let avg_depository_6mon = 0;
	let depository_6mon_cnt = 0;
	let depository_6mon_amt = 0;

	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {

			if (bankaccount.type == 'depository') {

				_.forEach(bankaccount.historical_balances, (balance) => {

					let bal_since_app = moment().diff(moment(balance.date), 'months', true);

					if (bal_since_app <= 6) {

						depository_6mon_amt += parseFloat(balance.current);
						depository_6mon_cnt += 1;
					}
				})
			}
		})
	});

	avg_depository_6mon = depository_6mon_amt / depository_6mon_cnt;
	rules.btr4 = { passed: avg_depository_6mon <= 400 ? false : true, value: (!Number.isNaN(avg_depository_6mon) ? avg_depository_6mon.toFixed(2) : 0.00) };
	// e_r_4: if avg_depository_6mon <= 400 then e_r_4 = 1 else e_r_4 = 0;

	// rule e_r_5
	let bal_avail_depository = 0;
	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {
			if (bankaccount.type == "depository") {

				bal_avail_depository += parseFloat(bankaccount.balances.available);

			}

		});
	}); // e_r_5: if e_r_5 <= 200 then e_r_5 = 1 else e_r_5 = 0;
	rules.btr5 = { passed: bal_avail_depository <= 200 ? false : true, value: (!Number.isNaN(bal_avail_depository) ? bal_avail_depository.toFixed(2) : 0.00) };

	//rule mh_r_1

	let positive_days_depository_1mon = 0;
	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {

			if (bankaccount.type == 'depository') {

				_.forEach(bankaccount.historical_balances, (balance) => {

					let bal_since_app = moment().diff(moment(balance.date), 'months', true);

					if (bal_since_app <= 1 && balance.current > 0) {

						positive_days_depository_1mon += 1;

					}
				})
			}
		})
	}); //mh_r_1: if bal_avail_depository < 50 && bal_avail_depository is not missing && positive_days_depository_1mon < 20 && 
	// positive_days_depository_1mon is not missing then mh_r_1 = 1 else mh_r_1 = 0;
	rules.btr6 = { passed: (bal_avail_depository < 50 && bal_avail_depository && positive_days_depository_1mon < 20 && positive_days_depository_1mon) ? false : true, value: (!Number.isNaN(bal_avail_depository) ? bal_avail_depository.toFixed(2) : 0.00) };

	// rule mh_r_2

	let avg_depository_3mon = 0;
	let depository_3mon_cnt = 0;
	let depository_3mon_amt = 0;

	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {

			if (bankaccount.type == 'depository') {

				_.forEach(bankaccount.historical_balances, (balance) => {

					let bal_since_app = moment().diff(moment(balance.date), 'months', true);

					if (bal_since_app <= 3) {

						depository_3mon_amt += parseFloat(balance.current);
						depository_3mon_cnt += 1;
					}
				})
			}
		})
	});

	avg_depository_3mon = depository_3mon_amt / depository_3mon_cnt;

	let avg_credit_3mon = 0;
	let credit_3mon_cnt = 0;
	let credit_3mon_amt = 0;

	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {

			if (bankaccount.type == 'credit') {

				_.forEach(bankaccount.historical_balances, (balance) => {

					let bal_since_app = moment().diff(moment(balance.date), 'months', true);

					if (bal_since_app <= 3) {

						credit_3mon_amt += parseFloat(balance.current);
						credit_3mon_cnt += 1;
					}
				})
			}
		})
	});

	avg_credit_3mon = credit_3mon_amt / credit_3mon_cnt;

	//mh_r_2: if avg_depository_3mon < 200 && avg_depository_3mon is not missing && avg_credit_3mon > 500 &&
	// avg_credit_3mon is not missing then mh_r_2 = 1 else mh_r_2 = 0;

	rules.btr7 = { passed: (avg_depository_3mon < 200 && avg_depository_3mon && avg_credit_3mon > 500 && avg_credit_3mon) ? false : true, value: (!Number.isNaN(avg_depository_3mon) ? avg_depository_3mon.toFixed(2) : 0.00) };

	// rule mh_r_3
	// if income_6mon_amount < 1000 && income_6mon_amount is not missing then mh_r_3 = 1 else mh_r_3 = 0;
	if (income_6mon_amount < 0) {
		income_6mon_amount = income_6mon_amount * -1;
	}
	rules.btr8 = { passed: (income_6mon_amount < 1000 && income_6mon_amount) ? false : true, value: income_6mon_amount.toFixed(2) };

	// rule mh_r_4
	var trans_dates = [];
	var days_since_old_trans;

	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {
			_.forEach(bankaccount.transactions, (transaction) => {

				trans_dates.push(transaction.date);

			})

		})
	});

	try {
		let max_trans_date = trans_dates.reduce(function (a, b) { return a < b ? a : b; }); // find the oldest date
		days_since_old_trans = moment().diff(moment(max_trans_date), 'days', true);
	} catch (e) {
		days_since_old_trans = 0;
	}

	let pdl_list = ['RISE DE II DB',
		'ONE MAIN FINANCIAL',
		'ONE MAIN PAY',
		'CREDITBOX',
		'RSVP LOANS',
		'ELASTIC',
		'PLAIN GREEN',
		'AMPLIFY',
		'CASHNETUSA',
		'SPEEDY',
		'AUTOSAVE PAYDAY',
		'SC CAROLINA PAYDAY',
		'CASHBACK PAYDAY',
		'USA PAYDAY',
		'REAL PAYDAY LOAN',
		'GULF PAYDAY',
		'PAYDAY MONEY CENTERS',
		'FAST PAYDAY LOAN',
		'SOUTHERN PAYDAY',
		'PAYDAYHAWAII',
		'PAYDAY24NOW',
		'PAYDAY MONEY STORE',
		'PAYDAY ONE',
		'PAYDAY LOAN STORE',
		'PAYDAY EXP',
		'CASH ADVANCE',
		'MONEYKEY',
		'BLUE TRUST',
		'ACE CASH EXPRESS',
		'CHECK INTO CASH',
		'CHECK CITY',
		'MONEYLION',
		'CASH CENTRAL',
		'CHECK N GO',
		'MONEY TREE',
		'LENDUP',
		'ADVANCE AMERICA',
		'MOBILOANS',
		'LOANME',
		'OPPORTUNITY FINA',
		'CREDITNINJA',
		'FIG LOAN',
		'BIG PICTURE LOAN',
		'500FASTCASH',
		'WALLACE',
		'CHECK ADVANCE USA',
		'CASH FACTORY',
		'POWER FINANCE',
		'ARROWHEAD'
	];

	let deposit_1mon_amt = 0;
	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {
			_.forEach(bankaccount.transactions, (transaction) => {

				let trans_since_app = moment().diff(moment(transaction.date), 'months', true);
				let trans_name = transaction.name.toUpperCase();
				let trans_description = transaction.original_description.toUpperCase();

				if (transaction.amount < -5 && trans_since_app <= 1 && pdl_list.includes(trans_name) && pdl_list.includes(trans_description)) {

					deposit_1mon_amt += parseFloat(transaction.amount);
				}
			})

		})
	});
	//mh_r_4: if days_since_old_trans < 180 && days_since_old_trans is not missing && deposit_1mon_amt < -500 && deposit_1mon_amt is not missing then mh_r_4 = 1 else mh_r_4 = 0;
	sails.log.warn('btr9', (days_since_old_trans < 179 && days_since_old_trans && deposit_1mon_amt < -500 && deposit_1mon_amt))
	rules.btr9 = { passed: (days_since_old_trans < 179) ? false : true, value: days_since_old_trans.toFixed(2) };

	// rule g_r_1
	let ck_acc_bal_avg = 0;
	let ck_acc_bal_sum;
	let ck_acc_bal_cnt;


	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {
			ck_acc_bal_sum += parseFloat(bankaccount.balances.available);
			ck_acc_bal_cnt += 1;
		});
	});

	ck_acc_bal_avg = ck_acc_bal_sum / ck_acc_bal_cnt;
	//g_r_1: if ck_acc_bal_avg is missing or ck_acc_bal_avg <-1000 then g_r_1 =1 else g_r_1 = 0;
	rules.btr10 = { passed: (ck_acc_bal_avg < -1000) ? false : true, value: (!Number.isNaN(ck_acc_bal_avg) ? ck_acc_bal_avg.toFixed(2) : 0.00) };

	// rule g_r_3

	let payment_amt_90d = 0;

	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {
			_.forEach(bankaccount.transactions, (transaction) => {

				let category = Math.floor(parseFloat((transaction.category_id) / 1000000)); // eg: cast 17018000 into 17
				let trans_since_app = moment().diff(moment(transaction.date), 'days', true);

				if (category == 16 && trans_since_app <= 90) {
					payment_amt_90d += transaction.amount;

				}
			})

		})
	});    //g_r_3: if payment_amt_90d <50 and payment_amt_90d is not missing then g_r_3 = 1 else g_r_3 = 0;
	rules.btr11 = { passed: (payment_amt_90d > 0 && (payment_amt_90d.toFixed(2) / 90)) > 10.0 ? false : true, value: payment_amt_90d > 0 ? "" + (payment_amt_90d.toFixed(2) / 90) + "%" : "0.00%" };

	// rule g_r_4

	let spd_pos_cnt_30d = 0;
	let spending_amount_in_30d = 0;
	let spd_list = [12, 13, 14, 17, 18, 19, 22];

	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {
			_.forEach(bankaccount.transactions, (transaction) => {

				let category = Math.floor(parseFloat((transaction.category_id) / 1000000)); // eg: cast 17018000 into 17
				let trans_since_app = moment().diff(moment(transaction.date), 'days', true);

				if (spd_list.includes(category) == true && trans_since_app <= 30 && transaction.amount > 0) {
					spd_pos_cnt_30d += 1;
					spending_amount_in_30d += transaction.amount;
				}
			})

		})
	});  //spd_pos_cnt_30d: if spd_pos_cnt_30d <3 or spd_pos_cnt_30d is missing then rule g_r_4 = 1 else rule g_r_4 = 0;
	rules.btr12 = { passed: (spending_amount_in_30d < 500 || !spd_pos_cnt_30d) ? false : true, value: spending_amount_in_30d.toFixed(2) };

	// rule g_r_5

	let bkf_cnt_90d = 0;
	let bkf_amt_90d = 0;

	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {
			_.forEach(bankaccount.transactions, (transaction) => {

				let category = Math.floor(parseFloat((transaction.category_id) / 1000000)); // eg: cast 17018000 into 17
				let trans_since_app = moment().diff(moment(transaction.date), 'days', true);

				if (category == 10 && trans_since_app <= 90) {
					bkf_cnt_90d += 1;
					bkf_amt_90d += transaction.amount;

				}
			})

		})
	});  //g_r_5: if bkf_cnt_90d <20 or bkf_amt_90d > 1000 then rule g_r_5 = 1 else rule g_r_5 = 0;
	rules.btr13 = { passed: (bkf_cnt_90d < 50) ? false : true, value: bkf_cnt_90d.toFixed(2) };

	// rule g_r_6

	let total_atm_fees_amt = 0;

	_.forEach(assetReport.report.items, (item) => {
		_.forEach(item.accounts, (bankaccount) => {
			_.forEach(bankaccount.transactions, (transaction) => {

				let category = Math.floor(parseFloat((transaction.category_id) / 1000000)); // eg: cast 17018000 into 17
				let trans_since_app = moment().diff(moment(transaction.date), 'days', true);

				if (transaction.name == "WITHDRAWAL FEE" && trans_since_app <= 90) {
					total_atm_fees_amt += transaction.amount;
				}
			})

		})
	});
	rules.btr14 = { passed: (total_atm_fees_amt > 1000) ? false : true, value: total_atm_fees_amt.toFixed(2) };

	//g_r_6: if checking1_gap_max_pct > 0.1 then g_r_6 = 1 else g_r_6 = 0;
	return rules;
}