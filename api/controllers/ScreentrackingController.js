/**
 * ScreentrackingController
 *
 * @description :: Server-side logic for managing Screentrackings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('request'),
  moment = require('moment'),
  _ = require('lodash'),
  csv = require('csv-parser'),
  fs = require('fs'),
  ObjectId = require('mongodb').ObjectID;
  Q = require('q');
var in_array = require('in_array');

module.exports = {
  createLastScreenName: createLastScreenNameAction,
  updateLastScreenName: updateLastScreenNameAction,
  getLastScreenName: getLastScreenNameAction,
  getIncompleteApplication:getIncompleteApplicationAction,
  ajaxIncompleteList:ajaxIncompleteListAction,
  viewIncomplete:viewIncompleteAction,
  deleteScreenDetails:deleteScreenDetailsAction,
  deleteMultipleScreen:deleteMultipleScreenAction,
  addScreentrackingComments:addScreentrackingCommentsAction,
  ajaxScreentrackingComments:ajaxScreentrackingCommentsAction,
  loanofferinfo:loanofferinfoAction,
  saveserviceloanoffer:saveserviceloanofferAction,
  contract:contractAction,
  resendplaidlink:resendplaidlinkAction,
  changeincome:changeincome,
  senduseroffer:senduserofferAction,
  ajaxAllusersComments:ajaxAllusersCommentsAction,
  addAlluserComments:addAlluserCommentsAction,
  changeincomeFromOffer: changeincomeFromOffer,
  changescheduledate:changescheduledateAction,
  changescheduleamount:changescheduleamountAction,
  incompleteDenyUserLoan:incompleteDenyUserLoanAction,
  saveServiceLoanOfferFromDTI: saveServiceLoanOfferFromDTI,
  changeincomeDenied: changeincomeDenied,
  viewBlocked: viewBlocked,
  unBlockLoan: unBlockLoan,
  incompletegetrepullPlaidDetails:incompletegetrepullPlaidDetails,
  getChangeLoanOfferDetails: getChangeLoanOfferDetails,
  updateNewloanincomedetails:updateNewloanincomedetails,
  manualLoanOfferDetails:manualLoanOfferDetailsAction,
  savemanualLoanOfferDetails:savemanualLoanOfferDetailsAction,
  ArchivedIncompleteApplication:ArchivedIncompleteApplicationAction,
  movetoincompleteupdate:movetoincompleteupdateAction,
  ToDoItemIncompleteApplication:ToDoItemIncompleteApplicationAction,
  markToIncompleteApp:markToIncompleteAppAction,
  movetoarchive:movetoarchiveAction,
  unarchive:unarchiveAction,
};

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

	pdl_list = ['RISE DE II DB',
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
	sails.log.warn("BankTransactionRules: ", rules);
	return rules;
}


function createLastScreenNameAction(req, res) {
	var lastScreenName = req.param("lastScreenName");
	var user = req.user;
	var data = req.param("data");

	if(!req.param("appversion"))
	{
		var screenappversion = sails.config.appManagement.appVersion;
	}
	else
	{
		var screenappversion = req.param("appversion");
	}

	if(req.param("systemVersion"))
	{
		var screeniosversion = req.param("systemVersion");
	}
	else
	{
		var screeniosversion='';
	}



	 Screentracking
		.createLastScreenName(lastScreenName,user,data,screenappversion,screeniosversion)
		.then(function(screenTracking) {
		  return res.success(screenTracking);
		})
		.catch(function (err) {
				sails.log.error("createlast screen name::Error",err);
		  return res.handleError(err);
		});
}

function updateLastScreenNameAction(req,res){
	var user = req.user;
	var lastScreenName = req.param("lastScreenName");
	var data = req.param("data");
	if(!req.param("appversion"))
	{
		var screenappversion = sails.config.appManagement.appVersion;
	}
	else
	{
		var screenappversion = req.param("appversion");
	}

	if(req.param("systemVersion"))
	{
		var screeniosversion = req.param("systemVersion");
	}
	else
	{
		var screeniosversion='';
	}

	var lastlevel = 5;

	Screentracking
	.updateLastScreenName(user,lastScreenName,lastlevel,data,screenappversion,[])
	.then(function(screenTracking){
		return res.success(screenTracking);
	})
	.catch(function(err){
		sails.log.error("updateLastScreenName#::Error",err);
		return res.handleError(err)
	})

}

function getLastScreenNameAction(req,res){
	var user =req.user;
	Screentracking
	.getLastScreenName(user)
	.then(function(screenTracking){
		return res.success(screenTracking);

	})
	.catch(function(err){
		sails.log.error("getLastScreenName::Error",err);
		return res.handleError(err);
	})
}

function getIncompleteApplicationAction(req, res) {

	  //-- Added for redirect to new open application url
	  var redirectpath ="/admin/getOpenApplicationDetails";
	  return res.status(200).redirect(redirectpath);

      var errorval = '';
	  var successval = '';
	   if(req.session.approveerror!=''){
			errorval =req.session.approveerror;
			req.session.approveerror = '';
		}

		if(req.session.successmsg!=''){
			successval =req.session.successmsg;
			req.session.successmsg = '';
		}

		var newLoanupdateSuccessMsg = '';
		var newLoanupdateMsg='';
		if ("undefined" !== typeof req.session.newLoanupdateSuccessMsg && req.session.newLoanupdateSuccessMsg!='' && req.session.newLoanupdateSuccessMsg!=null){
			newLoanupdateSuccessMsg =req.session.newLoanupdateSuccessMsg;
			req.session.newLoanupdateSuccessMsg = '';
		}
		if ("undefined" !== typeof req.session.newLoanupdateMsg && req.session.newLoanupdateMsg!='' && req.session.newLoanupdateMsg!=null){
			newLoanupdateMsg =req.session.newLoanupdateMsg;
			req.session.newLoanupdateMsg = '';
		}


		var responsedata = {
		  approveerror:errorval,
		  approvesuccess:successval,
		  newLoanupdateSuccessMsg: newLoanupdateSuccessMsg,
		  newLoanupdateMsg: newLoanupdateMsg
	    };


	res.view("admin/screentracking/incompleteApplicationList", responsedata);
}

function ArchivedIncompleteApplicationAction(req, res) {

      var errorval = '';
	  var successval = '';
	   if(req.session.approveerror!=''){
			errorval =req.session.approveerror;
			req.session.approveerror = '';
		}

		if(req.session.successmsg!=''){
			successval =req.session.successmsg;
			req.session.successmsg = '';
		}

		var newLoanupdateSuccessMsg = '';
		var newLoanupdateMsg='';
		if ("undefined" !== typeof req.session.newLoanupdateSuccessMsg && req.session.newLoanupdateSuccessMsg!='' && req.session.newLoanupdateSuccessMsg!=null){
			newLoanupdateSuccessMsg =req.session.newLoanupdateSuccessMsg;
			req.session.newLoanupdateSuccessMsg = '';
		}
		if ("undefined" !== typeof req.session.newLoanupdateMsg && req.session.newLoanupdateMsg!='' && req.session.newLoanupdateMsg!=null){
			newLoanupdateMsg =req.session.newLoanupdateMsg;
			req.session.newLoanupdateMsg = '';
		}


		var responsedata = {
		  approveerror:errorval,
		  approvesuccess:successval,
		  newLoanupdateSuccessMsg: newLoanupdateSuccessMsg,
		  newLoanupdateMsg: newLoanupdateMsg
	    };


	res.view("admin/screentracking/incompleteArchivedApplicationList", responsedata);
}

function ToDoItemIncompleteApplicationAction(req, res) {

      var errorval = '';
	  var successval = '';
	   if(req.session.approveerror!=''){
			errorval =req.session.approveerror;
			req.session.approveerror = '';
		}

		if(req.session.successmsg!=''){
			successval =req.session.successmsg;
			req.session.successmsg = '';
		}

		var newLoanupdateSuccessMsg = '';
		var newLoanupdateMsg='';
		if ("undefined" !== typeof req.session.newLoanupdateSuccessMsg && req.session.newLoanupdateSuccessMsg!='' && req.session.newLoanupdateSuccessMsg!=null){
			newLoanupdateSuccessMsg =req.session.newLoanupdateSuccessMsg;
			req.session.newLoanupdateSuccessMsg = '';
		}
		if ("undefined" !== typeof req.session.newLoanupdateMsg && req.session.newLoanupdateMsg!='' && req.session.newLoanupdateMsg!=null){
			newLoanupdateMsg =req.session.newLoanupdateMsg;
			req.session.newLoanupdateMsg = '';
		}


		var responsedata = {
		  approveerror:errorval,
		  approvesuccess:successval,
		  newLoanupdateSuccessMsg: newLoanupdateSuccessMsg,
		  newLoanupdateMsg: newLoanupdateMsg
	    };


	res.view("admin/screentracking/incompleteToDoItemApplicationList", responsedata);
}


function ajaxIncompleteListAction(req, res){

	var checkCreatedDate = moment().startOf('day').subtract(60, "days").format('MM-DD-YYYY');
	checkCreatedDate 	 =	moment(checkCreatedDate).tz("America/Los_Angeles").startOf('day').format('MM-DD-YYYY');
	if("undefined" !== req.param("viewtype") && req.param("viewtype")!='' && req.param("viewtype")!=null)
    {
		 var viewtype = req.param("viewtype");
    }
    else
    {
	 	var viewtype = 'incomplete';
    }
	sails.log.info("viewtype:",viewtype);

    var colS = "";

	sails.log.info("adminpracticeID::",req.session.adminpracticeID);

	if(req.query.sSortDir_0=='desc')
	{
		sorttype=-1;
	}
	else
	{
		sorttype=1;
	}

	switch(req.query.iSortCol_0){
		case '0':  var sorttypevalue = { '_id': sorttype }; break;
		case '1':  var sorttypevalue = { 'applicationReference': sorttype }; break;
		case '2':  var sorttypevalue = { 'userdata.firstname': sorttype }; break;
		case '3':  var sorttypevalue = { 'userdata.email': sorttype }; break;
		case '4':  var sorttypevalue = { 'userdata.phoneNumber': sorttype }; break;
		case '5':  var sorttypevalue = { 'userdata.registeredtype': sorttype }; break;
		case '6':  var sorttypevalue = { 'createdAt': sorttype }; break;
		case '8':  var sorttypevalue = { 'createdAt': sorttype }; break;
		case '9':  var sorttypevalue = { 'iscompleted': sorttype }; break;
		case '10':  var sorttypevalue = { 'userdata.isBankAdded': sorttype }; break;
		//case '10':  var sorttypevalue = { 'toDolist': sorttype }; break;
		case '11':  var sorttypevalue = { 'lastScreenName': sorttype }; break;
		case '12':  var sorttypevalue = { 'userdata.underwriter': sorttype }; break;
		//case '14':  var sorttypevalue = { 'userdata.lastname': sorttype }; break;
		default: break;
	};


	var matchcriteria;
	var whereConditionAnd =new Array();
	var whereConditionOr = new Array();

	//-- Add filter for ticket 2754
	if(viewtype=='incomplete')
	{
		var mainfilterData= [ { moveToIncomplete:{ $eq: 1, $exists: true } },
							  { $and: [
										 { moveToIncomplete:{ $exists: false }},
										 { createdAt:{ $gte : new Date(checkCreatedDate), $exists: true } }
									  ]
							  }
						  ]

		var todoFilterData =[ { incompleteverified: { $eq: 1, $exists: true } }, { incompleteverified:{ $exists: false }}  ];
	}
	else if(viewtype=='archived')
	{
		var mainfilterData= [ { moveToIncomplete:{ $eq: 0, $exists: true } },
							  { $and: [
										 { moveToIncomplete:{ $exists: false }},
										 { createdAt:{ $lt : new Date(checkCreatedDate), $exists: true } }
									  ]
							  }
						  ]
		var todoFilterData =[ { incompleteverified: { $eq: 1, $exists: true } }, { incompleteverified:{ $exists: false }}  ];
	}
	else if(viewtype=='toDoItems')
	{
		var mainfilterData= [ { moveToIncomplete:{ $eq: 0, $exists: true } },
							  { moveToIncomplete:{ $exists: false } }
						    ]
		var todoFilterData =[ { incompleteverified: { $eq: 0, $exists: true } }  ];
	}
	else
	{
		var mainfilterData= [ { moveToIncomplete:{ $eq: 1, $exists: true } },
							  { $and: [
										 { moveToIncomplete:{ $exists: false }},
										 { createdAt:{ $gte : new Date(checkCreatedDate), $exists: true } }
									  ]
							  }
						  ]
		var todoFilterData =[ { incompleteverified: { $eq: 1, $exists: true } }, { incompleteverified:{ $exists: false }}  ];
	}

	if(req.query.sSearch)
	{
	   whereConditionOr.push({"applicationReference":  {'$regex': req.query.sSearch ,$options:'i'}});
	   whereConditionOr.push({"userdata.firstname":  {'$regex': req.query.sSearch ,$options:'i'}});
	   whereConditionOr.push({"userdata.lastname":  {'$regex': req.query.sSearch ,$options:'i'}});
	   whereConditionOr.push({"userdata.email":  {'$regex': req.query.sSearch ,$options:'i'}});
	   whereConditionOr.push({"userdata.phoneNumber":  {'$regex': req.query.sSearch ,$options:'i'}});
	   whereConditionOr.push({"userdata.registeredtype":  {'$regex': req.query.sSearch ,$options:'i'}});
	   whereConditionOr.push({"userdata.isBankAdded":  {'$regex': req.query.sSearch ,$options:'i'}});
	   whereConditionOr.push({"userdata.underwriter":  {'$regex': req.query.sSearch ,$options:'i'}});
	   whereConditionOr.push({"iscompleted":  {'$regex': req.query.sSearch ,$options:'i'}});
	   whereConditionOr.push({"lastScreenName":  {'$regex': req.query.sSearch ,$options:'i'}});
	   //whereConditionOr.push({"toDolist":  {'$regex': req.query.sSearch ,$options:'i'}});


		if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID!='' && req.session.adminpracticeID!=null)
		{
			matchcriteria = {
				practicemanagement: new ObjectId(req.session.adminpracticeID),
				"userdata": { $ne: [] },
				 $and : [
							//{ $or : [ { iscompleted : 0 }, { iscompleted : 2 } ] },
							{ iscompleted : 0 },
							{ $or : [ { blockedList : { $eq: false, $exists: true } }, { blockedList : { $exists: false } } ] },
							{ $or: todoFilterData}
				 ],
				 $or:whereConditionOr,
				 $or:mainfilterData
			};
		}
		else
		{
			matchcriteria = {
				"userdata": { $ne: [] },
				 $and : [
							//{ $or : [ { iscompleted : 0 }, { iscompleted : 2 } ] },
							{ iscompleted : 0 },
							{ $or : [ { blockedList : { $eq: false, $exists: true } }, { blockedList : { $exists: false } } ] },
							{ $or: todoFilterData}
				 ],
				 $or:whereConditionOr,
				 $or:mainfilterData
			};
		}
	}
	else
	{
		if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID!='' && req.session.adminpracticeID!=null)
		{
			matchcriteria = {
				practicemanagement: new ObjectId(req.session.adminpracticeID),
				"userdata": { $ne: [] },
				$and : [
							//{ $or : [ { iscompleted : 0 }, { iscompleted : 2 } ] },
							{ iscompleted : 0 },
							{ $or : [ { blockedList : { $eq: false, $exists: true } }, { blockedList : { $exists: false } } ] },
							{ $or: todoFilterData}
						],
				$or:mainfilterData
			};
		}
		else
		{
			matchcriteria = {
				"userdata": { $ne: [] },
				$and : [
							//{ $or : [ { iscompleted : 0 }, { iscompleted : 2 } ] },
							{ iscompleted : 0 },
							{ $or : [ { blockedList : { $eq: false, $exists: true } }, { blockedList : { $exists: false } } ] },
							{ $or: todoFilterData}
						],
				$or:mainfilterData
			};
		}
	}


	sails.log.info("Match criteria",JSON.stringify(matchcriteria));

	//-- screentracking starts here
	var totalrecords =0;
	Screentracking.native(function(err, collection) {

		collection.aggregate(
		  [
			{
				$lookup: {
					from: "user",
					localField: "user",
					foreignField: "_id",
					as: "userdata"
				}
			},
			{
				$match: matchcriteria
			},
			{
				$count: "screentrackingcount"
			}
		  ],
		  function(err,result) {

			  sails.log.info("screen tracking result: ",result);

			  if (err)
			  {
				return res.serverError(err);
			  }

			  var screenResdata = [];
			  iDisplayLengthvalue = parseInt(req.query.iDisplayLength);
			  skiprecord = parseInt(req.query.iDisplayStart);

		  	 if (typeof result !== 'undefined' && result.length > 0) {
			  totalrecords = result[0].screentrackingcount;

			  Screentracking.native(function(err, collection) {
				collection.aggregate(
				  [
					{
						$lookup: {
							from: "user",
							localField: "user",
							foreignField: "_id",
							as: "userdata"
						}
					},
					{
					  $unwind: '$userdata'
					},
					{
					  "$addFields": {
					  				   toDoEmailList:
									   {
										 $cond: { if: { $eq: [ "$userdata.isEmailVerified", true] }, then: 1, else: 0 }
									   },
									   toDoBankList:
									   {
										 $cond: { if: { $eq: [ "$userdata.isBankAdded", true] }, then: 1, else: 0 }
									   },
									   toDoGovernList:
									   {
										 $cond: { if: { $eq: [ "$userdata.isGovernmentIssued", true] }, then: 1, else: 0 }
									   },
									   toDoPayrollList:
									   {
										 $cond: { if: { $eq: [ "$userdata.isPayroll", true] }, then: 1, else: 0 }
									   },
									   toDolist:
									   {
										  $add: [
												  	{$cond: { if: { $eq: [ "$userdata.isEmailVerified", true] }, then: 1, else: 0 }},
													{$cond: { if: { $eq: [ "$userdata.isBankAdded", true] }, then: 1, else: 0 }},
													{$cond: { if: { $eq: [ "$userdata.isGovernmentIssued", true] }, then: 1, else: 0 }},
													{$cond: { if: { $eq: [ "$userdata.isPayroll", true] }, then: 1, else: 0 }}
												 ]
									   },
					 			 }
					},
					{
						$match:matchcriteria
					},
					{
						$sort : sorttypevalue
					},
					{
					   $skip : skiprecord
					},
					{
					   $limit : iDisplayLengthvalue
					},
				  ],
				  function(err,screenDetails) {

					  if (err)
					  {
						return res.serverError(err);
					  }

				  	  sails.log.info('screenDetails.length: ', screenDetails.length);

					  if(screenDetails.length>0)
					  {
						  PracticeManagement.find()
						  .then(function (practiceData){

					  		   //sails.log.info("practiceData::",practiceData);
							  screenDetails = Screentracking.getFundingTierFromScreenTrackingList(screenDetails);
							   screenDetails.forEach(function(screentrackingdata,loopvalue){

								/*sails.log.info('toDoEmailList: ', screentrackingdata.toDoEmailList);
								sails.log.info('toDoBankList: ', screentrackingdata.toDoBankList);
								sails.log.info('toDoGovernList: ', screentrackingdata.toDoGovernList);
								sails.log.info('toDoPayrollList: ', screentrackingdata.toDoPayrollList);
								sails.log.info('toDolist: ', screentrackingdata.toDolist);
								sails.log.info('-----------------------------------------');*/

								//sails.log.info("screentrackingdata::::",screentrackingdata);

								var practicename='--';
								var practiceID;

								if ("undefined" !== typeof req.session.adminpracticeName && req.session.adminpracticeName!='' && req.session.adminpracticeName!=null)
								{
									practicename=req.session.adminpracticeName;
								}
								else
								{
									if ("undefined" !== typeof screentrackingdata.practicemanagement && screentrackingdata.practicemanagement!='' && screentrackingdata.practicemanagement!=null)
									{
										practiceID=screentrackingdata.practicemanagement;
										//practicename=practiceID;
										var filteredPractice = _.filter(practiceData, function(practiceObj) {
										  //return practiceObj.id === practiceID;
										  if(practiceObj.id == practiceID)
										  {
											  return practiceObj;
										  }
										});

										if (filteredPractice.length > 0){
											practicename = filteredPractice[0].PracticeName;
										}
									}
								}

								loopid = loopvalue+skiprecord+1;
								var userunderwriter= '--';
								var userinfo = screentrackingdata.userdata;
								screentrackingdata.createdAt = moment(screentrackingdata.createdAt).tz("america/los_angeles").format('MM-DD-YYYY hh:mm:ss');

								if ("undefined" === typeof screentrackingdata.applicationReference || screentrackingdata.applicationReference=='' || screentrackingdata.applicationReference==null)
								{
									screentrackingdata.applicationReference= '--';
								}

								if ("undefined" === typeof userinfo.firstname || userinfo.firstname=='' || userinfo.firstname==null)
								{
									var fullname= '--';
								}
								else
								{
									var fullname = 	userinfo.firstname+' '+userinfo.lastname;
								}

								if ("undefined" === typeof userinfo.email || userinfo.email=='' || userinfo.email==null)
								{
									var useremail= '--';
								}else{

									var useremail= userinfo.email;
								}

								if ("undefined" === typeof userinfo.phoneNumber || userinfo.phoneNumber=='' || userinfo.phoneNumber==null)
								{
									var userphoneNumber= '--';
								}else{
									var userphoneNumber= userinfo.phoneNumber;
								}

								if(userinfo.email){
									var emillnk = '<a href="mailto:'+userinfo.email+'">'+userinfo.email+'</a>';
								}

								if(screentrackingdata.applicationReference){
									var appReference = ' <a href="/admin/viewIncomplete/'+screentrackingdata._id+'">'+screentrackingdata.applicationReference+'</a>';
								}

								if ("undefined" !== typeof userinfo.underwriter && userinfo.underwriter!='' && userinfo.underwriter!=null)
								{
									var userunderwriter= userinfo.underwriter;
								}

								/*if(userinfo.registeredtype!='signup'){
								  statusicon =' <a href="/admin/loanofferinfo/'+screentrackingdata._id+'"><i class="fa fa-money" aria-hidden="true" style="cursor:pointer;color:#337ab7;"></i></a> &nbsp;&nbsp;<input type="checkbox" id="screenlist" name="screenlist[]" value="'+screentrackingdata._id+'">';
								}else{
								  statusicon ='<input type="checkbox" id="screenlist" name="screenlist[]" value="'+screentrackingdata._id+'">';
								}*/

								if(userinfo.registeredtype!='signup'){
								  statusicon =' <a href="/admin/loanofferinfo/'+screentrackingdata._id+'"><i class="fa fa-money" aria-hidden="true" style="cursor:pointer;color:#337ab7;"></i></a>';
								}else{
								  statusicon ='--';
								}

								var userregisteredtype = userinfo.registeredtype;

								//plaidLink
								/*if(userinfo.isBankAdded == true){
									var plaidLink = 'Yes';
								}
								else
								{
									var plaidLink = 'No';
								}*/

								if(screentrackingdata.filloutmanually == 0){
									var plaidLink = 'Yes';
								}
								else
								{
									var plaidLink = 'No';
								}


								//promissoryNoteSign
								if(screentrackingdata.iscompleted == 2)
								{
									var promissoryNoteSign = 'Yes';
								}
								else
								{
									var promissoryNoteSign = 'No';
								}

								   var fundingTier = "--";
								   if(!!screentrackingdata.fundingTier) {
									   fundingTier = screentrackingdata.fundingTier;
								   }else {
									   screentrackingdata["fundingTier"] = "";
								   }
								  /*var isEmailVerified = userinfo.isEmailVerified;
								  var isBankAdded = userinfo.isBankAdded;
								  var isGovernmentIssued = userinfo.isGovernmentIssued;
								  var isPayroll = userinfo.isPayroll;
								  var totdocount = 0;
								   if(!isEmailVerified)
									{
										totdocount++;
									}

									if(!isBankAdded)
									{

										totdocount++;
									}

									if(!isGovernmentIssued)
									{
										totdocount++;
									}

									if(!isPayroll)
									{
										totdocount++;
									}*/

									var totdocount= screentrackingdata.toDolist;

									screenResdata.push({
											  loopid:loopid,
											  applicationReference:appReference,
											  name: fullname,
											  email: useremail,
											  phoneNumber: userphoneNumber,
											  registeredtype: userregisteredtype,
											  practicename:practicename,
											  createdAt:screentrackingdata.createdAt,
											  promissoryNoteSign:promissoryNoteSign,
											  plaidLink:plaidLink,
											  //toDoList:totdocount,
											  lastScreenName: screentrackingdata.lastScreenName,
											  underwriter: userunderwriter,
										fundingTier: fundingTier
											  //,status:statusicon
									  });
							 });

							 var json = {
									sEcho:req.query.sEcho,
									iTotalRecords: totalrecords,
									iTotalDisplayRecords: totalrecords,
									aaData: screenResdata
								};
							res.contentType('application/json');
							res.json(json);
						});
					  }
					  else
					  {
						  var json = {
								sEcho:req.query.sEcho,
								iTotalRecords: totalrecords,
								iTotalDisplayRecords: totalrecords,
								aaData: screenResdata
							};
							res.contentType('application/json');
							res.json(json);
					  }
				   });
			   });
			}
			else
			{
				 var json = {
					sEcho:req.query.sEcho,
					iTotalRecords: totalrecords,
					iTotalDisplayRecords: totalrecords,
					aaData: screenResdata
				};
				res.contentType('application/json');
				res.json(json);
			}
		});
	});
}
function ajaxIncompleteListOldAction(req, res){

	//Sorting
	var colS = "";

	if(req.query.sSortDir_0=='desc')
	{
		sorttype=-1;
	}
	else
	{
		sorttype=0;
	}
	if(req.query.sSearch)
	{
		var criteria = {
		  iscompleted: [0,2],
		  $or : [ { blockedList: { $eq: false, $exists: true } }, { blockedList:{ $exists: false }}  ]
		};

	}
	else
	{
		var criteria = {
      		iscompleted: [0,2],
			$or : [ { blockedList: { $eq: false, $exists: true } }, { blockedList:{ $exists: false }}  ]
			//$or: [ { blockedList : false, $exists: true }, { $exists: false }]
    	};
	}


	Screentracking
    .find(criteria)
	.populate('user')
	.then(function(screentracking) {


		if(req.query.sSortDir_0 =='desc')
		{
			switch(req.query.iSortCol_0){
					case '0': screentracking = _.sortBy(screentracking, '_id').reverse(); break;
					case '1': screentracking = _.sortBy(screentracking, 'applicationReference').reverse(); break;
					case '2': screentracking = _.sortBy(screentracking, 'user.firstname').reverse(); break;
					case '3': screentracking = _.sortBy(screentracking, 'user.directMail').reverse(); break;
					case '4': screentracking = _.sortBy(screentracking, 'user.badList').reverse(); break;
					case '5': screentracking = _.sortBy(screentracking, 'user.email').reverse(); break;
					case '6': screentracking = _.sortBy(screentracking, 'user.phoneNumber').reverse(); break;
					case '7': screentracking = _.sortBy(screentracking, 'user.registeredtype').reverse(); break;
					case '8': screentracking = _.sortBy(screentracking, 'createdAt').reverse(); break;
					case '9': screentracking = _.sortBy(screentracking, 'iscompleted').reverse(); break;
					case '10': screentracking = _.sortBy(screentracking, 'user.isBankAdded').reverse(); break;
					case '11': screentracking = _.sortBy(screentracking, 'toDoList').reverse(); break;
					case '12': screentracking = _.sortBy(screentracking, 'lastScreenName').reverse(); break;
					case '13': screentracking = _.sortBy(screentracking, 'user.underwriter').reverse(); break;
					case '14': screentracking = _.sortBy(screentracking, 'user.lastname').reverse(); break;
					default: break;
    		};
		}
		else
		{
			switch(req.query.iSortCol_0){
					case '0': screentracking = _.sortBy(screentracking, '_id'); break;
					case '1': screentracking = _.sortBy(screentracking, 'applicationReference'); break;
					case '2': screentracking = _.sortBy(screentracking, 'user.firstname'); break;
					case '3': screentracking = _.sortBy(screentracking, 'user.directMail'); break;
					case '4': screentracking = _.sortBy(screentracking, 'user.badList'); break;
					case '5': screentracking = _.sortBy(screentracking, 'user.email'); break;
					case '6': screentracking = _.sortBy(screentracking, 'user.phoneNumber'); break;
					case '7': screentracking = _.sortBy(screentracking, 'user.registeredtype'); break;
					case '8': screentracking = _.sortBy(screentracking, 'createdAt'); break;
					case '9': screentracking = _.sortBy(screentracking, 'iscompleted'); break;
					case '10': screentracking = _.sortBy(screentracking, 'user.isBankAdded'); break;
					case '11': screentracking = _.sortBy(screentracking, 'toDoList'); break;
				    case '12': screentracking = _.sortBy(screentracking, 'lastScreenName'); break;
					case '13': screentracking = _.sortBy(screentracking, 'user.underwriter'); break;
					case '14': screentracking = _.sortBy(screentracking, 'user.lastname'); break;

					//screentrackingdata.user.isBankAdded

					default: break;
    		};
		}

		//Filter user details not available
		screentracking=_.filter(screentracking,function(item){
			if(item.user)
			{
				return true;
			}
		});

		screentracking=_.filter(screentracking,function(item){
			if(item.user.email!='' && item.user.email!=null )
			{
				return true;
			}
		});

		//Filter using search data
		if(req.query.sSearch)
		{
			var search=req.query.sSearch.toLowerCase();
			screentracking=_.filter(screentracking,function(item){
				 if(item.applicationReference!=null)
				 {
					 if(item.applicationReference.toLowerCase().indexOf(search)>-1 )
					 {
						 return true;
					 }
				 }

				 if(item.user.firstname!=null)
				 {
					 if(item.user.firstname.toLowerCase().indexOf(search)>-1 )
					 {
						 return true;
					 }
				 }

				 if(item.user.lastname!=null)
				 {
					 if(item.user.lastname.toLowerCase().indexOf(search)>-1 )
					 {
						 return true;
					 }
				 }

				  if(item.user.underwriter!=null)
				 {
					 if(item.user.underwriter.toLowerCase().indexOf(search)>-1 )
					 {
						 return true;
					 }
				 }

				 /*if(item.user.screenName!=null)
				 {
					 if(item.user.screenName.toLowerCase().indexOf(search)>-1 )
					 {
						 return true;
					 }
				 }*/

				 if(item.user.email!=null)
				 {
					 if(item.user.email.toLowerCase().indexOf(search)>-1 )
					 {
						 return true;
					 }
				 }

				 if(item.user.phoneNumber!=null)
				 {
					 if(item.user.phoneNumber.indexOf(search)>-1 )
					 {
						 return true;
					 }
				 }

				 if(item.lastScreenName!=null)
				 {
					 if(item.lastScreenName.toLowerCase().indexOf(search)>-1 )
					 {
						 return true;
					 }
				 }

				 if(item.createdAt!=null)
				 {
					 if(moment(item.createdAt).format('MM-DD-YYYY')==search)
					 {
						 return true;
					 }
				 }


			});
		}


		totalrecords= screentracking.length;


		//Filter by limit records
		skiprecord =parseInt(req.query.iDisplayStart);
		checklimitrecords = skiprecord+parseInt(req.query.iDisplayLength);
		if(checklimitrecords>totalrecords)
		{
			iDisplayLengthvalue=parseInt(totalrecords);
		}
		else
		{
			iDisplayLengthvalue=parseInt(req.query.iDisplayLength)+parseInt(skiprecord);
		}



		screentracking= screentracking.slice(skiprecord, iDisplayLengthvalue);

		var screentrackingDetails = [];

		screentracking.forEach(function(screentrackingdata,loopvalue){
			loopid = loopvalue+skiprecord+1;

			screentrackingdata.createdAt = moment(screentrackingdata.createdAt).tz("america/los_angeles").format('MM-DD-YYYY hh:mm:ss');
			if ("undefined" === typeof screentrackingdata.applicationReference || screentrackingdata.applicationReference=='' || screentrackingdata.applicationReference==null)
			{
				screentrackingdata.applicationReference= '--';
			}
			if ("undefined" === typeof screentrackingdata.user.firstname || screentrackingdata.user.firstname=='' || screentrackingdata.user.firstname==null)
			{
				screentrackingdata.user.firstname= '--';
			}
			else {

				var fullname = 	screentrackingdata.user.firstname+' '+screentrackingdata.user.lastname;
			}

			if ("undefined" === typeof screentrackingdata.user.email || screentrackingdata.user.email=='' || screentrackingdata.user.email==null)
			{
				screentrackingdata.user.email= '--';
			}

			if ("undefined" === typeof screentrackingdata.user.phoneNumber || screentrackingdata.user.phoneNumber=='' || screentrackingdata.user.phoneNumber==null)
			{
				screentrackingdata.user.phoneNumber= '--';
			}
			if(screentrackingdata.user.email){
				var emillnk = '<a href="mailto:'+screentrackingdata.user.email+'">'+screentrackingdata.user.email+'</a>';
			}
			if(screentrackingdata.applicationReference){
				var appReference = ' <a href="/admin/viewIncomplete/'+screentrackingdata.id+'">'+screentrackingdata.applicationReference+'</a>';
			}


			if ("undefined" === typeof screentrackingdata.user.underwriter || screentrackingdata.user.underwriter=='' || screentrackingdata.user.underwriter==null)
			{
				screentrackingdata.user.underwriter= '--';
			}

			/*&nbsp;&nbsp; <a href="/admin/deleteScreenDetails/'+screentrackingdata.id+'" onclick="return confirm(\'Are you sure?\')"><i class="fa fa-trash" aria-hidden="true" style="cursor:pointer;color:#FF0000;"></i></a> */


		    if(screentrackingdata.user.registeredtype!='signup'){
		      statusicon =' <a href="/admin/loanofferinfo/'+screentrackingdata.id+'"><i class="fa fa-money" aria-hidden="true" style="cursor:pointer;color:#337ab7;"></i></a> &nbsp;&nbsp;<input type="checkbox" id="screenlist" name="screenlist[]" value="'+screentrackingdata.id+'">';
			}else{
			  statusicon ='<input type="checkbox" id="screenlist" name="screenlist[]" value="'+screentrackingdata.id+'">';
			}



			if(screentrackingdata.user.isBankAdded == true){
				var plaidLink = 'Yes';
			}
			else
			{
				var plaidLink = 'No';
			}



			if(screentrackingdata.user.directMail == 1)
			{
				var directMailUser= 'Yes';
			}
			else if(screentrackingdata.user.directMail == 2)
			{
				var directMailUser= 'No';
			}
			else {
				var directMailUser= '--';
			}

			//badList
			if(screentrackingdata.user.badList == 1)
			{
				var badListUser= 'Yes';
			}
			else if(screentrackingdata.user.badList == 2)
			{
				var badListUser= 'No';
			}
			else {
				var badListUser= '--';
			}



			if(screentrackingdata.iscompleted == 2)
			{
				var promissoryNoteSign = 'Yes';
			}
			else {
				var promissoryNoteSign = 'No';
			}


			  var isEmailVerified = screentrackingdata.user.isEmailVerified;
			  var isBankAdded = screentrackingdata.user.isBankAdded;
			  var isGovernmentIssued = screentrackingdata.user.isGovernmentIssued;
			  var isPayroll = screentrackingdata.user.isPayroll;
			  var totdocount = 0;
			   if(!isEmailVerified)
				{
				  	totdocount++;
				}

				if(!isBankAdded)
				{

				 	totdocount++;
				}

				if(!isGovernmentIssued)
				{
					totdocount++;
				}

				if(!isPayroll)
				{
				 	totdocount++;
				}

			   screentrackingDetails.push({
					  loopid:loopid,
					  applicationReference:appReference,
					  name: fullname,
					  directMail: directMailUser,
					  badList: badListUser,
					  email: screentrackingdata.user.email,
					  phoneNumber: screentrackingdata.user.phoneNumber,
					  registeredtype: screentrackingdata.user.registeredtype,
					  createdAt:screentrackingdata.createdAt,
					  promissoryNoteSign:promissoryNoteSign,
					  plaidLink:plaidLink,
					  toDoList:totdocount,
					  lastScreenName: screentrackingdata.lastScreenName,
					  underwriter: screentrackingdata.user.underwriter,
					  status:statusicon
			  });




		});


		/*if(req.query.sSortDir_0 =='desc')
		{
			switch(req.query.iSortCol_0){
					case '0': screentrackingDetails = _.sortBy(screentrackingDetails, 'loopid').reverse(); break;
					case '1': screentrackingDetails = _.sortBy(screentrackingDetails, 'applicationReference').reverse(); break;
					case '2': screentrackingDetails = _.sortBy(screentrackingDetails, 'name').reverse(); break;
					case '3': screentrackingDetails = _.sortBy(screentrackingDetails, 'directMail').reverse(); break;
					case '4': screentrackingDetails = _.sortBy(screentrackingDetails, 'badList').reverse(); break;
					case '5': screentrackingDetails = _.sortBy(screentrackingDetails, 'email').reverse(); break;
					case '6': screentrackingDetails = _.sortBy(screentrackingDetails, 'phoneNumber').reverse(); break;
					case '7': screentrackingDetails = _.sortBy(screentrackingDetails, 'registeredtype').reverse(); break;
					case '8': screentrackingDetails = _.sortBy(screentrackingDetails, 'createdAt').reverse(); break;
					case '9': screentrackingDetails = _.sortBy(screentrackingDetails, 'promissoryNoteSign').reverse(); break;
					case '10': screentrackingDetails = _.sortBy(screentrackingDetails, 'plaidLink').reverse(); break;
					case '11': screentrackingDetails = _.sortBy(screentrackingDetails, 'toDoList').reverse(); break;
					case '12': screentrackingDetails = _.sortBy(screentrackingDetails, 'lastScreenName').reverse(); break;
					case '13': screentrackingDetails = _.sortBy(screentrackingDetails, 'underwriter').reverse(); break;
					default: break;
    		};
		}
		else
		{
			switch(req.query.iSortCol_0){
					case '0': screentrackingDetails = _.sortBy(screentrackingDetails, 'loopid'); break;
					case '1': screentrackingDetails = _.sortBy(screentrackingDetails, 'applicationReference'); break;
					case '2': screentrackingDetails = _.sortBy(screentrackingDetails, 'name'); break;
					case '3': screentrackingDetails = _.sortBy(screentrackingDetails, 'directMail'); break;
					case '4': screentrackingDetails = _.sortBy(screentrackingDetails, 'badList'); break;
					case '5': screentrackingDetails = _.sortBy(screentrackingDetails, 'email'); break;
					case '6': screentrackingDetails = _.sortBy(screentrackingDetails, 'phoneNumber'); break;
					case '7': screentrackingDetails = _.sortBy(screentrackingDetails, 'registeredtype'); break;
					case '8': screentrackingDetails = _.sortBy(screentrackingDetails, 'createdAt'); break;
					case '9': screentrackingDetails = _.sortBy(screentrackingDetails, 'promissoryNoteSign'); break;
					case '10': screentrackingDetails = _.sortBy(screentrackingDetails, 'plaidLink'); break;
					case '11': screentrackingDetails = _.sortBy(screentrackingDetails, 'toDoList'); break;
					case '12': screentrackingDetails = _.sortBy(screentrackingDetails, 'lastScreenName'); break;
					case '13': screentrackingDetails = _.sortBy(screentrackingDetails, 'underwriter'); break;
					default: break;
    		};
		}*/


		 var json = {
				sEcho:req.query.sEcho,
				iTotalRecords: totalrecords,
				iTotalDisplayRecords: totalrecords,
				aaData: screentrackingDetails
			};

		res.contentType('application/json');
		res.json(json);
	});
}

function viewIncompleteAction( req, res ) {
	const id = req.param( "id" );

	let successval = "";
	let uploaddocmsg = "";
	let errorval = "";

	if( req.session.approveerror != "" ) {
		errorval = req.session.approveerror;
		req.session.approveerror = "";
	}

	let bankerror = "";
	let banksuccessmsg = "";

	if( req.session.bankerror != "" ) {
		errorval = req.session.bankerror;
		bankerror = req.session.bankerror;
		req.session.bankerror = "";
	}

	if( req.session.banksuccessmsg != "" ) {
		banksuccessmsg = req.session.banksuccessmsg;
		req.session.banksuccessmsg = "";
	}

	// sails.log.info('req.session.uploaddocmsg: ', req.session.uploaddocmsg);

	if( "undefined" !== typeof req.session.successmsg && req.session.successmsg != "" && req.session.successmsg != null ) {
		successval = req.session.successmsg;
		req.session.successmsg = "";
	}
	if( "undefined" !== typeof req.session.uploaddocmsg && req.session.uploaddocmsg != "" && req.session.uploaddocmsg != null ) {
		uploaddocmsg = req.session.uploaddocmsg;
		req.session.uploaddocmsg = "";
	}
	// sails.log.info('req.session.uploaddocmsg: ', req.session.uploaddocmsg);
	// sails.log.info('uploaddocmsg: ', uploaddocmsg);

	// Log Activity
	const modulename = "Viewing Loan";
	const modulemessage = "Viewing Loan Details";
	req.achlog = 0;

	return Promise.resolve()
	.then( () => {
		sails.log.info( "ACHC ! req.session.hasOwnProperty( 'lastActivityId' )", !req.session.hasOwnProperty( "lastActivityId" ) );
		sails.log.info( "ACHC req.session.lastActivityId", req.session.lastActivityId );
		sails.log.info( "ACHC screenTrackID", id );
		if( req.session.lastActivityId != id ) {
			return Logactivity.screenTrackingLogActivity( req, modulename, modulemessage, id );
		}
	} )
	.then( () => {
		req.session.lastActivityId = id;
	} )
	.then( () => {
		Screentracking.findOne( {
			id: id,
			iscompleted: 0
		} )
		.populate( "user" )
		// .populate('consolidateaccount')
		.then( function( screentracking ) {
			// For move to open
			const currentDate = moment()
			.tz( "America/Los_Angeles" )
			.startOf( "day" );
			const paymentDate = moment( screentracking.createdAt ).startOf( "day" );
			const incompleteDatediff = currentDate.diff( paymentDate, "days" );

			// if its incomplete, get R16
			/*
			if (!screentracking.iscompleted && screentracking.rulesDetails.approvedrulemsg.length) {
				const stateCode = screentracking.practicemanagement.StateCode;
				const checkLAState = sails.config.plaid.checkLAState;
				const loanAmntarr = [];
				let lockedToG;
				if( screentracking.lockCreditTier && screentracking.lockCreditTier == "G" ) {
					lockedToG = "true";
				} else {
					lockedToG = "";
				}
				loanAmntarr.push( sails.config.plaid.basicLoanamount );
				if( stateCode == checkLAState ) {
					loanAmntarr.push( sails.config.plaid.LAminLoanamount );
				}
				Screentracking.getGradeLoanamount( screentracking, loanAmntarr ).then( function( gradeResults ) {
					sails.log.info( "gradeResults", gradeResults );
					const loansettingcriteria = {
						loanactivestatus: 1,
						practicemanagement: screentracking.practicemanagement.id
					};
					LoanSettings.find( loansettingcriteria ).then( function( loansettingData ) {
						Paymentcomissionhistory.find( { paymentmanagement: payID } ).then( function( comissionDetails ) {
							PaymentManagement.find( {
								where: { id: payID },
								select: ['user']
							} )
							.then( function( uid ) {
								EmploymentHistory.queryEmploymentHistory( uid[0].user )
								.then( function( employmentInfo ) {

									//set up fxi score
									let ficoScore = 0;
									let incomeEstimator = 0;

									_.forEach(transData.addOnProduct, (element) => {
										if(element.code == "00W18")
										{
											ficoScore = element.scoreModel.score.results;
											if(ficoScore[0] == "+" || ficoScore[0] == "-")
												ficoScore = ficoScore.substring(1);
										}
										if(element.code == "00N03" && !element.scoreModel.score.noScoreReason)
										{
											incomeEstimator = element.scoreModel.score.results;

											if(incomeEstimator[0] == "+" || incomeEstimator == "-")
												incomeEstimator = incomeEstimator.substring(1);
										}
									})

									ficoScore = Number(ficoScore);
									incomeEstimator = Number(incomeEstimator);

									let fxiScore = ficoScore * incomeEstimator / 1000;
									fxiScore = fxiScore.toFixed(2);
									let rule16 = 'R16: FXI Score: ' + fxiScore;
									if (!paymentmanagementdata.screentracking.rulesDetails) {
										paymentmanagementdata.screentracking.rulesDetails = { ruledatacount: [] };
									}
									paymentmanagementdata.screentracking.rulesDetails.ruledatacount.push(rule16);
								});
						});
					});
				});
				
				
			});
			*/
			if (!screentracking.iscompleted && screentracking.rulesDetails && screentracking.rulesDetails.ruledatacount.length) {
				screentracking.rulesDetails.ruledatacount.push("R16: FXI Score: 0.0");
			}
			// -- Added for back button redirect from detail page starts here
			let checkCreatedDate = moment()
			.startOf( "day" )
			.subtract( 60, "days" )
			.format( "MM-DD-YYYY" );
			checkCreatedDate = moment( checkCreatedDate )
			.tz( "America/Los_Angeles" )
			.startOf( "day" )
			.toDate()
			.getTime();
			const loanCreartedDate = moment( screentracking.createdAt )
			.tz( "America/Los_Angeles" )
			.startOf( "day" )
			.toDate()
			.getTime();
			let redirectArchive = 0;
			let backviewType;
			backviewType = "/admin/getOpenApplicationDetails";

			if( screentracking.moveToArchive ) {
				if( screentracking.moveToArchive == 1 ) {
					redirectArchive = 1;
				}
			} else {
				if( loanCreartedDate < checkCreatedDate ) {
					redirectArchive = 1;
				}
			}

			if( redirectArchive == 1 ) {
				backviewType = "/admin/getArchivedOpenDetails";
			}
			// -- Added for back button redirect from detail page ends here

			const incompleteCrieteria = { user: screentracking.user.id, iscompleted: 0 };
			Screentracking.find( incompleteCrieteria )
			.then( function( incompleteloanRes ) {
				let incompleteloanCount = 0;
				incompleteloanCount = incompleteloanRes.length;

				const transcriteria = { id: screentracking.transunion };

				sails.log.info( "transcriteria::", transcriteria );

				Transunions.findOne( transcriteria )
				.sort( "createdAt DESC" )
				.then( function( transData ) {
					sails.log.info( "transcriteria transData::", transData );

					if( "undefined" === typeof transData || transData == "" || transData == null ) {
						var showtransData = 0;
					} else {
						var showtransData = 1;

						if( transData.credit_collection.subscriber ) {
							const transcreditArray = transData.credit_collection;
							transData.credit_collection = [];
							transData.credit_collection.push( transcreditArray );
						}

						if( transData.inquiry.subscriber ) {
							const transinquiryArray = transData.inquiry;
							transData.inquiry = [];
							transData.inquiry.push( transinquiryArray );
						}

						if( transData.addOnProduct.status ) {
							const transproductArray = transData.addOnProduct;
							transData.addOnProduct = [];
							transData.addOnProduct.push( transproductArray );
						}

						if( transData.house_number.status ) {
							const transhouseArray = transData.house_number;
							transData.house_number = [];
							transData.house_number.push( transhouseArray );
						}

						if( transData.trade.subscriber ) {
							const transtradeArray = transData.trade;
							transData.trade = [];
							transData.trade.push( transtradeArray );
						}
						if( transData.response.product.subject.subjectRecord && transData.response.product.subject.subjectRecord.custom && transData.response.product.subject.subjectRecord.custom.credit ) {
							if( !Array.isArray( transData.response.product.subject.subjectRecord.custom.credit.publicRecord ) ) {
								const transpublicrecordArray = transData.response.product.subject.subjectRecord.custom.credit.publicRecord;
								transData.publicrecord = [];
								transData.publicrecord.push( transpublicrecordArray );
							} else {
								transData.publicrecord = transData.response.product.subject.subjectRecord.custom.credit.publicRecord;
							}
						}
					}

					UserBankAccount.getBankData( incompleteloanRes[ 0 ].id, screentracking.user.id ).then( ( accountDetail ) => {
						// sails.log.info("userbankaccountArray",userbankaccountArray);

						let screenData = "";
						if( screentracking.data ) {
							screenData = JSON.stringify( screentracking.data, null, 4 );
						}
						req.flash( "error", "" );

						const subTypeArray = [];

						if( showtransData == 1 ) {
							var userAccount = transData.response;
						} else {
							var userAccount = "";
						}
						var totalbalance = 0;
						const sum = 0;
						if( screentracking.offerdata && screentracking.offerdata.length > 0 && screentracking.offerdata[ 0 ].financedAmount ) {
							var totalbalance = parseFloat( screentracking.offerdata[ 0 ].financedAmount ? screentracking.offerdata[ 0 ].financedAmount : "0" );
							totalbalance = totalbalance.toString().replace( /(\d)(?=(\d\d\d)+(?!\d))/g, "$1," );
						}

						/* Screentracking
								.getloanOfferdetails(screentracking)
								.then(function(loanofferdata) {*/

						// sails.log.info("loanofferdataloanofferdataloanofferdataloanofferdata",loanofferdata);
						// return 1;

						/* Screentracking
										.getDTIoffers(userAccount,screentracking)
										.then(function(dtiandoffers) {*/

						if( screenData ) {
							screenData = JSON.parse( screenData );
							delete screenData[ "transactionControl" ];
							delete screenData[ "certificate" ];
							screenData = JSON.stringify( screenData, null, 2 );
						}

						const documenttype1 = sails.config.loanDetails.doctype1;
						const documenttype2 = sails.config.loanDetails.doctype2;
						const documenttype3 = sails.config.loanDetails.doctype3;

						const documenttype = {
							documenttype1: documenttype1,
							documenttype2: documenttype2,
							documenttype3: documenttype3
						};

						// annual income *** start//
						var income_amt = screentracking.incomeamount;
						if( income_amt === undefined ) {
							var income_amt = "-----";
						}

						var payroll_detected = screentracking.detectedPayroll;
						if( payroll_detected == undefined || payroll_detected == "" || payroll_detected == null ) {
							var payroll_detected = "--";
						}

						var counterOfferincomplete = screentracking.counterOfferIncomplete;
						if( counterOfferincomplete == undefined || counterOfferincomplete == "" || counterOfferincomplete == null ) {
							var counterOfferincomplete = "--";
						} else {
							var counterOfferincomplete =
												screentracking.counterOfferIncomplete +
												" At " +
												moment( screentracking.createdAt )
												.tz( "America/los_angeles" )
												.format( "MM-DD-YYYY hh:mm:ss" );
						}
						// annual income *** start//

						const paycriteria = { screentracking: screentracking.id };

						PaymentManagement.findOne( paycriteria )
						.then( function( PaymentManagementdata ) {
							const pendingSchedule = [];
							const paidSchedule = [];
							if( PaymentManagementdata != "" && PaymentManagementdata != null && "undefined" !== typeof PaymentManagementdata ) {
								var paymentManagementId = PaymentManagementdata.id;
								var doccriteria = {
									paymentManagement: PaymentManagementdata.id
								};
								_.forEach( PaymentManagementdata.paymentSchedule, function( payDetails ) {
									if( payDetails.status == "PAID OFF" ) {
										paidSchedule.push( payDetails );
									} else {
										pendingSchedule.push( payDetails );
									}
								} );
							} else {
								var paymentManagementId = "Empty";
								var doccriteria = {
									// paymentManagement: screentracking.id
									user: screentracking.user.id
								};
							}

							Achdocuments.find( doccriteria )
							.populate( "proofdocument" )
							.then( function( documentdata ) {
								_.forEach( documentdata, function( documentvalue ) {
									if( documentvalue.proofdocument.isImageProcessed ) {
										if( documentvalue.proofdocument.standardResolution ) {
											documentvalue.proofdocument.standardResolution = Utils.getS3Url( documentvalue.proofdocument.standardResolution );
										}
									}
								} );
								const userid = screentracking.user.id;
								const screenId = screentracking.id;
								UserConsent.objectdataforpdf( userid, req, res )
								.then( function( objectdatas ) {
									const practiceDocResults = [];
									const practiceAllResults = [];
									const practiceids = [];

									let linkedstaffArr = [];
									let linkedDoctorArr = [];

									PaymentManagement.find( { user: userid } )
									.sort( "createdAt DESC" )
									.then( function( paymentData ) {
										const criteria = { id: req.param( "id" ) };
										Screentracking.findOne( criteria )
										.populate( "plaiduser" )
										.populate( "user" )
										.populate( "practicemanagement" )
										.then( function( userAccountres ) {
											if( userAccountres.accounts != "" && userAccountres.accounts != null && "undefined" !== typeof userAccountres.accounts ) {
												const stateCode = userAccountres.practicemanagement.StateCode;
												const checkLAState = sails.config.plaid.checkLAState;
												const loanAmntarr = [];
												loanAmntarr.push( sails.config.plaid.basicLoanamount );
												if( stateCode == checkLAState ) {
													loanAmntarr.push( sails.config.plaid.LAminLoanamount );
												}
												Screentracking.getGradeLoanamount( userAccountres, loanAmntarr ).then( function( gradeResults ) {
													const loansettingcriteria = {
														loanactivestatus: 1,
														practicemanagement: userAccountres.practicemanagement.id
													};
													LoanSettings.find( loansettingcriteria ).then( function( loansettingData ) {
														if( PaymentManagementdata != "" && PaymentManagementdata != null && "undefined" !== typeof PaymentManagementdata ) {
															var incomeEntered = 2;
														} else {
															var incomeEntered = 1;
														}

														if( PaymentManagementdata != "" && PaymentManagementdata != null && "undefined" !== typeof PaymentManagementdata ) {
															const practcriteria = {
																practicemanagement: PaymentManagementdata.practicemanagement
															};
															PracticeUser.find( practcriteria ).then( function( practiceResults ) {
																if( practiceResults ) {
																	if( PaymentManagementdata.linkedstaff ) {
																		linkedstaffArr = PaymentManagementdata.linkedstaff;
																	}

																	if( PaymentManagementdata.linkeddoctor ) {
																		linkedDoctorArr = PaymentManagementdata.linkeddoctor;
																	}
																	_.forEach( practiceResults, function( practice ) {
																		let staffexist = 0;
																		let doctorexist = 0;

																		if( linkedstaffArr.length > 0 ) {
																			if( in_array( practice.id, linkedstaffArr ) ) {
																				staffexist = 1;
																			}
																		}

																		if( linkedDoctorArr.length > 0 ) {
																			if( in_array( practice.id, linkedDoctorArr ) ) {
																				doctorexist = 1;
																			}
																		}

																		const practiceinfo = {
																			id: practice.id,
																			fullname: practice.firstname + " " + practice.lastname,
																			staffexist: staffexist,
																			doctorexist: doctorexist
																		};

																		if( practice.role == "PracticeDoctor" ) {
																			practiceDocResults.push( practiceinfo );
																		}
																		practiceAllResults.push( practiceinfo );
																	} );
																}

																Logactivity.find( { $or: [ { paymentManagement: paymentData[ 0 ].id }, { screenTracking: id } ] } )
																.sort( { createdAt: -1 } )
																.then( function( logDetails ) {
																	const logArrayDetails = [];
																	_.forEach( logDetails, function( logdata ) {
																		logdata.createdAt = moment( logdata.createdAt, "HH:mm:ss" )
																		.tz( "America/los_angeles" )
																		.format( "MM-DD-YYYY HH:mm:ss" );
																		logArrayDetails.push( logdata );
																	} );

																	PracticeUser.getPracticeDetails( linkedstaffArr, linkedDoctorArr ).then( function( linkedpracticeRes ) {
																		var linkedpractices = [];
																		if( linkedpracticeRes.code == 200 ) {
																			var linkedpractices = linkedpracticeRes.result;
																		}
																		sails.log.warn("accountDetail", accountDetail[accountDetail.length - 1]);
																		PlaidAssetReport.find({ user: PaymentManagementdata.user }).limit(1).then((assetReport) => {
																			sails.log.warn("assetReport ", assetReport)
																			const bankrules = (assetReport[0] && screentracking.rulesDetails) ? executeBTRs(assetReport[0]) : [];
																			const btrHasLength = !!assetReport[0];
																			
																			if (screentracking.rulesDetails) {
																				screentracking.rulesDetails.banktransactionrules = { ...bankrules };
																				const btrs = {
																					rulesDetails: {
																						...screentracking.rulesDetails,
																						banktransactionrules: { ...bankrules }
																					}
																				};
																				Screentracking.update({ id: screentracking.id }, btrs).then((response) => {});
																			}

																			let getRuleEntry;
																			let ruleDataHasLength;
																			if (screentracking.rulesDetails) {
																				ruleDataHasLength = Object.keys(screentracking.rulesDetails.ruledata).length;
																				getRuleEntry = (ruleIndex) => { 
																					if (Object.values(screentracking.rulesDetails.ruledata)[ruleIndex]) {
																						return Object.values(screentracking.rulesDetails.ruledata)[ruleIndex].passed;
																					}
																					return null;
																				}
																			}

																			const creditTierCriteria = { practicemanagement: screentracking.user.practicemanagement };
																			if( screentracking.lockCreditTier ) {
																				creditTierCriteria.creditTier = screentracking.lockCreditTier;
																			} else {
																				creditTierCriteria.minCreditScore = { $lte: screentracking.creditscore };
																				creditTierCriteria.maxCreditScore = { $gte: screentracking.creditscore };
																			}
																			sails.log.warn("credit criteria screntracking", creditTierCriteria)
																			return LoanCreditTier.findOne( creditTierCriteria )
																				.then((creditTier) => {
																					const loaninterestcriteria = {
																						practicemanagement: userAccountres.practicemanagement.id,
																						creditTier: creditTier.creditTier
																					}
																					return Loaninterestrate.findOne(loaninterestcriteria)
																					.then((loaninterestrate) => {
																						return res.view( "admin/screentracking/viewTracking", {
																							creditTier: creditTier,
																							btrHasLength: btrHasLength,
																							getRuleEntry: getRuleEntry,
																							interestRate: loaninterestrate.interestRate || 0.0,
																							ruleDataHasLength: ruleDataHasLength,
																							banksuccessmsg: banksuccessmsg,
																							bankerror: bankerror,
																							practicedata: userAccountres.practicemanagement,
																							logDetails: logArrayDetails,
																							screentracking: screentracking,
																							achdocumentDetails: documentdata,
																							documenttype: documenttype,
																							screenData: screenData,
																							transData: transData,
																							accountDetail: accountDetail,
																							accountDetails: subTypeArray,
																							totalbalance: totalbalance,
																							selecttotal: sum,
																							loanofferdata: "",
																							dtiandoffers: "",
																							income_amt: income_amt,
																							obj: objectdatas,
																							paymentManagementId: paymentManagementId,
																							paymentmanagementdata: PaymentManagementdata,
																							screenId: screenId,
																							changeincomestatus: "incomplete",
																							incomeEntered: incomeEntered,
																							successval: successval,
																							errorval: errorval,
																							uploaddocmsg: uploaddocmsg,
																							pendingSchedule: pendingSchedule,
																							momentDate: moment,
																							payroll_detected: payroll_detected,
																							counterOfferincomplete: counterOfferincomplete,
																							minloanamount: sails.config.plaid.minrequestedamount,
																							maxloanamount: sails.config.plaid.maxrequestedamount,
																							minincomeamount: sails.config.plaid.minincomeamount,
																							maxaprrate: sails.config.plaid.maxApr,
																							linkedpractices: linkedpractices,
																							practiceAllResults: practiceAllResults,
																							practiceDocResults: practiceDocResults,
																							incompleteloanCount: incompleteloanCount,
																							loantermdetails: gradeResults,
																							loansettingData: loansettingData,
																							incompleteDatediff: incompleteDatediff,
																							backviewType: backviewType,
																							achstatus: PaymentManagementdata ? PaymentManagementdata.achstatus : null // used for counter offer
																						} )
																					}).catch(() => {
																						return res.view( "admin/screentracking/viewTracking", {
																							creditTier: creditTier,
																							btrHasLength: btrHasLength,
																							getRuleEntry: getRuleEntry,
																							interestRate: 16.9,
																							ruleDataHasLength: ruleDataHasLength,
																							banksuccessmsg: banksuccessmsg,
																							bankerror: bankerror,
																							practicedata: userAccountres.practicemanagement,
																							logDetails: logArrayDetails,
																							screentracking: screentracking,
																							achdocumentDetails: documentdata,
																							documenttype: documenttype,
																							screenData: screenData,
																							transData: transData,
																							accountDetail: accountDetail,
																							accountDetails: subTypeArray,
																							totalbalance: totalbalance,
																							selecttotal: sum,
																							loanofferdata: "",
																							dtiandoffers: "",
																							income_amt: income_amt,
																							obj: objectdatas,
																							paymentManagementId: paymentManagementId,
																							paymentmanagementdata: PaymentManagementdata,
																							screenId: screenId,
																							changeincomestatus: "incomplete",
																							incomeEntered: incomeEntered,
																							successval: successval,
																							errorval: errorval,
																							uploaddocmsg: uploaddocmsg,
																							pendingSchedule: pendingSchedule,
																							momentDate: moment,
																							payroll_detected: payroll_detected,
																							counterOfferincomplete: counterOfferincomplete,
																							minloanamount: sails.config.plaid.minrequestedamount,
																							maxloanamount: sails.config.plaid.maxrequestedamount,
																							minincomeamount: sails.config.plaid.minincomeamount,
																							maxaprrate: sails.config.plaid.maxApr,
																							linkedpractices: linkedpractices,
																							practiceAllResults: practiceAllResults,
																							practiceDocResults: practiceDocResults,
																							incompleteloanCount: incompleteloanCount,
																							loantermdetails: gradeResults,
																							loansettingData: loansettingData,
																							incompleteDatediff: incompleteDatediff,
																							backviewType: backviewType,
																							achstatus: PaymentManagementdata ? PaymentManagementdata.achstatus : null // used for counter offer
																						} )
																					});
																				});
	
																			
																		});
																	} );
																} );
															} );
														} else {
															Logactivity.find( paymentData[ 0 ] != null ? { $or: [ { paymentManagement: paymentData[ 0 ].id }, { screenTracking: id } ] } : { screenTracking: screentracking.id } )
															.sort( { createdAt: -1 } )
															.then( function( logDetails ) {
																const logArrayDetails = [];
																_.forEach( logDetails, function( logdata ) {
																	logdata.createdAt = moment( logdata.createdAt, "HH:mm:ss" )
																	.tz( "America/los_angeles" )
																	.format( "MM-DD-YYYY HH:mm:ss" );
																	logArrayDetails.push( logdata );
																} );
																sails.log.warn("accountDetail", accountDetail[accountDetail.length - 1]);
																PlaidAssetReport.find({ user: screentracking.user.id }).limit(1).then((assetReport) => {
																	sails.log.warn("assetReport ", assetReport)
																	const bankrules = (assetReport[0] && screentracking.rulesDetails) ? executeBTRs(assetReport[0]) : [];
																	const btrHasLength = !!assetReport[0];
																	
																	if (screentracking.rulesDetails) {
																		screentracking.rulesDetails.banktransactionrules = { ...bankrules };
																		const btrs = {
																			rulesDetails: {
																				...screentracking.rulesDetails,
																				banktransactionrules: { ...bankrules }
																			}
																		};
																		Screentracking.update({ id: screentracking.id }, btrs).then((response) => {});
																	}
																	
																	let getRuleEntry;
																	let ruleDataHasLength;
																	if (screentracking.rulesDetails) {
																		ruleDataHasLength = Object.keys(screentracking.rulesDetails.ruledata).length;
																		getRuleEntry = (ruleIndex) => {
																			if (Object.values(screentracking.rulesDetails.ruledata)[ruleIndex]) {
																				return Object.values(screentracking.rulesDetails.ruledata)[ruleIndex].passed;
																			}
																			return null;
																		}	
																	}

																	const creditTierCriteria = { practicemanagement: userAccountres.practicemanagement.id };
																	if( screentracking.lockCreditTier ) {
																		creditTierCriteria.creditTier = screentracking.lockCreditTier;
																	} else {
																		creditTierCriteria.minCreditScore = { $lte: screentracking.creditscore };
																		creditTierCriteria.maxCreditScore = { $gte: screentracking.creditscore };
																	}

																	return LoanCreditTier.findOne( creditTierCriteria )
																	.then((creditTier) => {
																		sails.log.warn("credit tier", creditTier)
																		const loaninterestcriteria = {
																			practicemanagement: userAccountres.practicemanagement.id,
																			creditTier: creditTier.creditTier
																		}
																		return Loaninterestrate.findOne(loaninterestcriteria)
																			.then((loaninterestrate) => {
																				return res.view( "admin/screentracking/viewTracking", {
																					creditTier: creditTier,
																					interestRate: loaninterestrate.interestRate || 16.9,
																					btrHasLength: btrHasLength,
																					getRuleEntry: getRuleEntry,
																					ruleDataHasLength: ruleDataHasLength,
																					banksuccessmsg: banksuccessmsg,
																					bankerror: bankerror,
																					logDetails: logArrayDetails,
																					practicedata: userAccountres.practicemanagement,
																					screentracking: screentracking,
																					achdocumentDetails: documentdata,
																					documenttype: documenttype,
																					screenData: screenData,
																					transData: transData,
																					accountDetail: accountDetail,
																					accountDetails: subTypeArray,
																					totalbalance: totalbalance,
																					selecttotal: sum,
																					loanofferdata: "",
																					dtiandoffers: "",
																					income_amt: income_amt,
																					obj: objectdatas,
																					paymentManagementId: paymentManagementId,
																					paymentmanagementdata: PaymentManagementdata,
																					screenId: screenId,
																					changeincomestatus: "incomplete",
																					incomeEntered: incomeEntered,
																					successval: successval,
																					errorval: errorval,
																					uploaddocmsg: uploaddocmsg,
																					pendingSchedule: pendingSchedule,
																					momentDate: moment,
																					payroll_detected: payroll_detected,
																					counterOfferincomplete: counterOfferincomplete,
																					minloanamount: sails.config.plaid.minrequestedamount,
																					maxloanamount: sails.config.plaid.maxrequestedamount,
																					minincomeamount: sails.config.plaid.minincomeamount,
																					maxaprrate: sails.config.plaid.maxApr,
																					incompleteloanCount: incompleteloanCount,
																					loantermdetails: gradeResults,
																					loansettingData: loansettingData,
																					incompleteDatediff: incompleteDatediff,
																					backviewType: backviewType,
																					achstatus: PaymentManagementdata ? PaymentManagementdata.achstatus : null // used for counter offer
																				} );
																			}).catch(() => {
																				return res.view( "admin/screentracking/viewTracking", {
																					creditTier: creditTier,
																					interestRate: 16.9,
																					btrHasLength: btrHasLength,
																					getRuleEntry: getRuleEntry,
																					ruleDataHasLength: ruleDataHasLength,
																					banksuccessmsg: banksuccessmsg,
																					bankerror: bankerror,
																					logDetails: logArrayDetails,
																					practicedata: userAccountres.practicemanagement,
																					screentracking: screentracking,
																					achdocumentDetails: documentdata,
																					documenttype: documenttype,
																					screenData: screenData,
																					transData: transData,
																					accountDetail: accountDetail,
																					accountDetails: subTypeArray,
																					totalbalance: totalbalance,
																					selecttotal: sum,
																					loanofferdata: "",
																					dtiandoffers: "",
																					income_amt: income_amt,
																					obj: objectdatas,
																					paymentManagementId: paymentManagementId,
																					paymentmanagementdata: PaymentManagementdata,
																					screenId: screenId,
																					changeincomestatus: "incomplete",
																					incomeEntered: incomeEntered,
																					successval: successval,
																					errorval: errorval,
																					uploaddocmsg: uploaddocmsg,
																					pendingSchedule: pendingSchedule,
																					momentDate: moment,
																					payroll_detected: payroll_detected,
																					counterOfferincomplete: counterOfferincomplete,
																					minloanamount: sails.config.plaid.minrequestedamount,
																					maxloanamount: sails.config.plaid.maxrequestedamount,
																					minincomeamount: sails.config.plaid.minincomeamount,
																					maxaprrate: sails.config.plaid.maxApr,
																					incompleteloanCount: incompleteloanCount,
																					loantermdetails: gradeResults,
																					loansettingData: loansettingData,
																					incompleteDatediff: incompleteDatediff,
																					backviewType: backviewType,
																					achstatus: PaymentManagementdata ? PaymentManagementdata.achstatus : null // used for counter offer
																				} );
																			});
																			});
																	});

																
															} );
														}
													} );
												} );
											} else {
												Logactivity.find( paymentData[ 0 ] != null ? { $or: [ { paymentManagement: paymentData[ 0 ].id }, { screenTracking: id } ] } : { screenTracking: screentracking.id } )
												.sort( { createdAt: -1 } )
												.then( function( logDetails ) {
													const logArrayDetails = [];
													_.forEach( logDetails, function( logdata ) {
														logdata.createdAt = moment( logdata.createdAt, "HH:mm:ss" )
														.tz( "America/los_angeles" )
														.format( "MM-DD-YYYY HH:mm:ss" );
														logArrayDetails.push( logdata );
													} );

													sails.log.info( "---transData--- else", transData );
													sails.log.info( "---transData--- else", logArrayDetails );
													const incomeEntered = 0;
													PlaidAssetReport.find({ user: screentracking.user }).limit(1).then((assetReport) => {
														sails.log.warn("assetReport ", assetReport)
														const bankrules = (assetReport[0] && screentracking.rulesDetails) ? executeBTRs(assetReport[0]) : [];
														
														if (screentracking.rulesDetails) {
															screentracking.rulesDetails.banktransactionrules = { ...bankrules };
															const btrs = {
																rulesDetails: {
																	...screentracking.rulesDetails,
																	banktransactionrules: { ...bankrules }
																}
															};
															Screentracking.update({ id: screentracking.id }, btrs).then((response) => {});
														}

														const btrHasLength = !!assetReport[0];
														
														let getRuleEntry;
														let ruleDataHasLength;
														if (screentracking.rulesDetails) {
															ruleDataHasLength = screentracking.rulesDetails ? Object.keys(screentracking.rulesDetails.ruledata).length : false;
															getRuleEntry = (ruleIndex) => { 
																if (Object.values(screentracking.rulesDetails.ruledata)[ruleIndex]) {
																	return Object.values(screentracking.rulesDetails.ruledata)[ruleIndex].passed;
																}
																return null;
															}
														}
	
														return res.view( "admin/screentracking/viewTracking", {
															btrHasLength: btrHasLength,
															getRuleEntry: getRuleEntry,
															ruleDataHasLength: ruleDataHasLength,
															banksuccessmsg: banksuccessmsg,
															bankerror: bankerror,
															practicedata: userAccountres.practicemanagement,
															logDetails: logArrayDetails,
															screentracking: screentracking,
															achdocumentDetails: documentdata,
															documenttype: documenttype,
															screenData: screenData,
															transData: transData,
															accountDetail: accountDetail,
															accountDetails: subTypeArray,
															totalbalance: totalbalance,
															selecttotal: sum,
															loanofferdata: "",
															dtiandoffers: "",
															income_amt: income_amt,
															obj: objectdatas,
															paymentManagementId: paymentManagementId,
															paymentmanagementdata: PaymentManagementdata,
															screenId: screenId,
															changeincomestatus: "incomplete",
															incomeEntered: incomeEntered,
															pendingSchedule: pendingSchedule,
															momentDate: moment,
															payroll_detected: payroll_detected,
															counterOfferincomplete: counterOfferincomplete,
															minloanamount: sails.config.plaid.minrequestedamount,
															maxloanamount: sails.config.plaid.maxrequestedamount,
															minincomeamount: sails.config.plaid.minincomeamount,
															maxaprrate: sails.config.plaid.maxApr,
															incompleteloanCount: incompleteloanCount,
															loantermdetails: [],
															loansettingData: [],
															incompleteDatediff: incompleteDatediff,
															backviewType: backviewType,
															successval: successval,
															errorval: errorval,
															achstatus: PaymentManagementdata ? PaymentManagementdata.achstatus : null // used for counter offer
														} );
													});

													
												} );
											}
										} );
									} )
									.catch( function( err ) {
										sails.log.error( "AchController#ChekingAccountLinkedOrNot :: err :", err );
										return res.handleError( err );
									} );
								} )
								.catch( function( err ) {
									sails.log.error( "AchController#objectdataforpdf :: err :", err );
									return res.handleError( err );
								} );
							} );
						} )
						.catch( function( err ) {
							sails.log.error( "AchController#createAchDocuments :: err :", err );
							return res.handleError( err );
						} );
					} );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "getDTIoffers::Error", err );
				// req.session.successmsg='';
				// req.session.successmsg = 'Offer has been submitted already!';
				const redirectpath = "/admin/incompleteApplication";
				return res.status( 200 ).redirect( redirectpath );
			} );

			// });
		} )
		.catch( function( err ) {
			sails.log.error( "getDTIoffers::Error", err );
			// req.session.successmsg='';
			// req.session.successmsg = 'Offer has been submitted already!';
			const redirectpath = "/admin/incompleteApplication";
			return res.status( 200 ).redirect( redirectpath );
		} );
	} );
}

function deleteScreenDetailsAction(req, res){

	var id = req.param('id');
	 // delete user related stuff
	  Screentracking
		.deleteAllScreenRelatedDetails(id)
		.then(function () {
			var json = {
			  status: 200,
			  message:"Successfully Deleted Screen"
			};
			var redirectpath ="/admin/incompleteApplication";
			return res.status(200).redirect(redirectpath);
		})
		.catch(function (err) {
		  sails.log.error("Error Controller :: ", err);
		  return res.handleError(err);
		})

}

function deleteMultipleScreenAction(req, res){

	var ids = req.param('ids');
	 // delete user related stuff
	  Screentracking
		.deleteMultipleScreenDetails(ids)
		.then(function () {
			var json = {
			  status: 200,
			  message:"Successfully Deleted Screen"
			};
			 res.contentType('application/json');
			 res.json(json);
		})
		.catch(function (err) {
		  sails.log.error("Error Controller :: ", err);
		  return res.handleError(err);
		})

}


function addScreentrackingCommentsAction(req, res){

	//var screentrackingID = req.param('screentrackingID');

	 if (!req.form.isValid) {
       var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
       return res.failed(validationErrors);
     }

	var adminemail = req.user.email;
	  Achcomments
		.createScreentrackingComments(req.form,adminemail)
		.then(function (screencomments) {

			var modulename = 'Add Screentracking Comment';
			var modulemessage = 'Screentracking comment added successfully';
			req.achlog = 1;
			req.logdata=req.form;
			Logactivity.registerLogActivity(req,modulename,modulemessage);

		  var json = {
			status: 200,
			message:"Commente Added successfully"
		 };
		 res.contentType('application/json');
		 res.json(json);

		})
		.catch(function (err) {
		  sails.log.error('ScreentrackingController#createComments :: err :', err);
		  return res.handleError(err);
		});

}

function ajaxScreentrackingCommentsAction(req, res){

	 var userId = req.param('id');


	//Sorting
	var colS = "";

	if(req.query.sSortDir_0=='desc')
	{
		sorttype=-1;
	}
	else
	{
		sorttype=1;
	}
	switch(req.query.iSortCol_0){
		case '0':  var sorttypevalue = { '_id': sorttype }; break;
		case '1':  var sorttypevalue = { 'subject': sorttype }; break;
		case '2':  var sorttypevalue = { 'comments': sorttype }; break;
		case '3':  var sorttypevalue = { 'adminemail': sorttype }; break;
		case '4':  var sorttypevalue = { 'createdAt': sorttype }; break;
		default: break;
	};

	//Search
	if(req.query.sSearch)
	{
		var criteria = {
		  //isDeleted: false,
		  user: userId,
		  or: [{subject:  { 'contains': req.query.sSearch }}, {comments:  { 'contains': req.query.sSearch } }]
		};

	}
	else
	{
		var criteria = {
      		user: userId,
			//isDeleted: false,
    	};
	}


	Achcomments
    .find(criteria)
	.sort( sorttypevalue)
	.then(function(screencomments) {
		totalrecords= screencomments.length;
		//Filter by limit records
		skiprecord =parseInt(req.query.iDisplayStart);
		checklimitrecords = skiprecord+parseInt(req.query.iDisplayLength);
		if(checklimitrecords>totalrecords)
		{
			iDisplayLengthvalue=parseInt(totalrecords);
		}
		else
		{
			iDisplayLengthvalue=parseInt(req.query.iDisplayLength)+parseInt(skiprecord);
		}


		screencomments= screencomments.slice(skiprecord, iDisplayLengthvalue);

		var screencommentsDetails = [];
		screencomments.forEach(function(screencommentsdata,loopvalue){
			loopid = loopvalue+skiprecord+1;
			screencommentsdata.createdAt = moment(screencommentsdata.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');
			screencommentsDetails.push({ loopid:loopid,subject: screencommentsdata.subject, comments: screencommentsdata.comments,adminemail: screencommentsdata.adminemail,createdAt:screencommentsdata.createdAt });
		});
		 var json = {
				sEcho:req.query.sEcho,
				iTotalRecords: totalrecords,
				iTotalDisplayRecords: totalrecords,
				aaData: screencommentsDetails
			};
		res.contentType('application/json');
		res.json(json);
	});

}

function loanofferinfoAction(req, res){

	var criteria = { id: req.param('id'),iscompleted : 0};
    Screentracking
    .findOne(criteria)
	.populate('plaiduser')
	.populate('user')
	 .then(function (userAccountres) {
		var creditScore = parseFloat(userAccountres.creditscore);

		//var state = 'CA';
		var state = userAccountres.user.state;
		var minimumIncomePlaid = sails.config.plaid.minincomeamount;
		var incomeamount = parseFloat(userAccountres.incomeamount/12).toFixed(2);

		if(userAccountres.accounts!='' && userAccountres.accounts!=null && "undefined" !== typeof userAccountres.accounts)
		{

			var productcriteria = { id: userAccountres.product };
			Productlist.findOne(productcriteria)
			 .then(function(productdata){

				var productname = productdata.productname;
				var productid = userAccountres.product;
				var procriteria = { productid: productid };
				var userid = userAccountres.user.id;
					var loanstatus = 'Incomplete';
					Screentracking.update({id: userAccountres.id,iscompleted : 0}, {loanstatus: loanstatus, loandescription:'Approved Income'})
					.exec(function afterwards(err, updated){

					});
					Loanproductsettings
					.find(procriteria)
					.then(function (loandetails) {
					Loanamountcap
					.find()
					.then(function(loanDetCap){

						var baseltiInterest = 0;
						_.forEach(loanDetCap, function (loanDetCapValue) {
								if((creditScore >= loanDetCapValue.mincreditscore) && (creditScore <= loanDetCapValue.maxcreditscore)){
									baseltiInterest = parseFloat(loanDetCapValue.cap);
								}
							});

						var midValueNewIncome = "";
						var annualIncomeRange = sails.config.loan.annualIncomeRange;
						var annualUserIncome = parseFloat(userAccountres.incomeamount);

						_.forEach(annualIncomeRange, function(incomerange) {
								if((incomerange.minIncome < annualUserIncome) && ((parseInt(incomerange.maxIncome) + parseInt(1000)) >= annualUserIncome)){
									if(incomerange.maxIncome == '999999'){
										midValueNewIncome = (((parseInt(74000) + parseInt(incomerange.minIncome)) / 2) / 12).toFixed(2);
									}else{
										midValueNewIncome = (((parseInt(incomerange.maxIncome) + parseInt(incomerange.minIncome)) / 2) / 12).toFixed(2);
									}
								}
							});

						if(midValueNewIncome == ""){
							midValueNewIncome = (((parseInt(annualIncomeRange[0].minIncome) + parseInt(annualIncomeRange[0].maxIncome)) / 2) / 12).toFixed(2);
						}


						//var baseLoanAmountCal = parseFloat(incomeamount * baseltiInterest/100);
						var baseLoanAmountCal = parseFloat(midValueNewIncome * baseltiInterest/100);

						var baseLoanAmountCon = 0;
						if(baseLoanAmountCal > 1200){
							baseLoanAmountCon = 1200;
						}else{
							baseLoanAmountCon = baseLoanAmountCal;
						}
						var baseLoanAmount = 50 * (Math.floor(baseLoanAmountCon/50));
							var financedAmount = baseLoanAmount;
								var loanTerm = sails.config.loan.loanTerm;
						var paymentFeq = sails.config.loan.paymentFeq;
						stateratepaymentcycle.findStateByAbbr(state).then(function(result){
							  if(result.rate){
									var interestRate = result.rate;
								}else{
									var interestRate = 0;
								}
								var APR = (interestRate * sails.config.loan.APR );
								var transcriteria = { id: userAccountres.transunion};

							Transunions.findOne(transcriteria).then(function(accdetails){

							var transacc = accdetails.trade;

									var monthlySchedulePayment = 0;

							 _.forEach(transacc, function (account) {
								if(account.terms){
									if(account.terms.paymentScheduleMonthCount){
										if(account.terms.paymentScheduleMonthCount == 'MIN'){
											if(account.terms.scheduledMonthlyPayment){
												monthlySchedulePayment = parseFloat(monthlySchedulePayment)+parseFloat(account.terms.scheduledMonthlyPayment);
											}
										}
									}
								}
							  });

							var ir= (interestRate/100).toFixed(2);
							var loanPaymentCycle = Math.abs(PaymentManagementService.calculatePMT(parseFloat(ir), parseFloat(loanTerm), parseFloat(financedAmount)));


							var monthlyPayment = Math.abs((loanPaymentCycle*26/12).toFixed(2));
							var perTotMonthlyPayment = monthlySchedulePayment;
							var postTotMonthlyPayment = parseFloat(monthlyPayment) + parseFloat(perTotMonthlyPayment);
							/*var preDTI = ((perTotMonthlyPayment / incomeamount)* 100).toFixed(2);
							var postDTI = (((parseFloat(perTotMonthlyPayment) + parseFloat(monthlyPayment))/incomeamount)* 100).toFixed(2);*/
							var preDTI = ((perTotMonthlyPayment / midValueNewIncome)* 100).toFixed(2);
							var postDTI = (((parseFloat(perTotMonthlyPayment) + parseFloat(monthlyPayment))/midValueNewIncome)* 100).toFixed(2);

							var postDTIThreshold = 60;
							if(postDTI < postDTIThreshold){
								var loanstatus = "Approved";
								Screentracking.update({id: userAccountres.id,iscompleted : 0}, {loanstatus: loanstatus, loandescription:'Approved Income'})
								.exec(function afterwards(err, updated){
								});
							}else{
								var loanstatus = "Denied";
								Screentracking.update({id: userAccountres.id,iscompleted : 0}, {loanstatus: loanstatus, loandescription:'Less Incom'})
								.exec(function afterwards(err, updated){

								});
							}
							 var firstname = userAccountres.user.firstname;


							var responseValue = {incomeamount:incomeamount,state:state,loanTerm:loanTerm,paymentFeq:paymentFeq,interestRate:interestRate,financedAmount:financedAmount,apr:APR,loanPaymentCycle:loanPaymentCycle,monthlyPayment:monthlyPayment,perTotMonthlyPayment:perTotMonthlyPayment,postTotMonthlyPayment:postTotMonthlyPayment,preDTI:preDTI,postDTI:postDTI,postDTIThreshold:postDTIThreshold,loanstatus:loanstatus,firstname:firstname,userid:userid,productid:productid,userAccountres:userAccountres};

							//responseValue.push({"fulldata":responseValue});

							var newResponseValue = {fullData:responseValue,fullDataString:JSON.stringify(responseValue)}

							res.view("admin/screentracking/loanofferinfonew",newResponseValue);
							})

						})

							})
							.catch(function (err) {
								 sails.log.error('ScreentrackingController#loanofferinfoAction :: err', err);
								 return res.handleError(err);
							});

						})
						.catch(function (err) {
							 sails.log.error('ScreentrackingController#loanofferinfoAction :: err', err);
							 return res.handleError(err);
						});



			 })
			 .catch(function (err) {
				 sails.log.error('ScreentrackingController#myoffersAction :: err', err);
				 return res.handleError(err);
			 });


		}else{

		    res.view("admin/screentracking/loanofferinfo", {errorcode:'401'});
		}


	})
	.catch(function (err) {
		 sails.log.error('ScreentrackingController#loanofferinfoAction :: err', err);
		 //return res.handleError(err);
		 req.session.successmsg='';
		 req.session.successmsg = 'Offer has been submitted already!';
		 var redirectpath ="/admin/incompleteApplication";
		 return res.redirect(redirectpath);
	});


}

function saveserviceloanofferAction(req, res){

	res.contentType('application/json');
	var fullOffer= JSON.parse(req.param('fullOffer'));
	var userid= req.param('userid');
	var userDetails = {id:userid};



	var offerdata = {
		incomeamount:fullOffer.incomeamount,
		state:fullOffer.state,
		loanTerm:fullOffer.loanTerm,
		paymentFeq:fullOffer.paymentFeq,
		interestRate:fullOffer.interestRate,
		financedAmount:fullOffer.financedAmount,
		apr:fullOffer.apr,
		loanPaymentCycle:fullOffer.loanPaymentCycle,
		monthlyPayment:fullOffer.monthlyPayment,
		perTotMonthlyPayment:fullOffer.perTotMonthlyPayment,
		postTotMonthlyPayment:fullOffer.postTotMonthlyPayment,
		preDTI:fullOffer.preDTI,
		postDTI:fullOffer.postDTI,
		postDTIThreshold:fullOffer.postDTIThreshold,
		loanstatus:fullOffer.loanstatus,
		firstname:fullOffer.firstname
	};

	 Screentracking
	  .updateLastScreenName(userDetails,'Loan Offer Details',4,'','','',[offerdata])
	  .then(function(screenTracking) {

			User.findOne(userid)
			.then(function (user) {
				var userreq={};
				var usersubject = 'Promissory Note Document Sign';
				var userdescription = 'Promissory note document sign  successfully!';
				userreq.user_id = userid;
				userreq.logdata= 'Promissory note document sign  successfully - ' +user.email;
				Useractivity.createUserActivity(userreq,usersubject,userdescription);

				EmailService.loanDocumentsByCustomerServiceEmail(screenTracking);
				req.session.successmsg='';
				req.session.successmsg = 'Loan Offer has been updated successfully';
				var redirectpath ="/admin/incompleteApplication";
				return res.redirect(redirectpath);
			})
			.catch(function (err) {
				  sails.log.error('CustomerServiceController#loanDocumentsByCustomerServiceEmailAction :: err :', err);
				  return res.handleError(err);
			});

		})
		.catch(function (err) {
		  sails.log.error('ScreentrackingController#saveloanofferAction :: err :', err);
		  return res.handleError(err);
		});
}

function contractAction(req, res) {

	var userid = req.param('id');
	sails.log.info('userid',userid);

	UserConsent.objectdataforpdf(userid,req,res)
	.then(function (objectdatas) {

		//sails.log.info('objectdatas*****',objectdatas);

		var fname = objectdatas.fname;
		var lname = objectdatas.lname;
		var stateName = objectdatas.stateName;
		//sails.log.info('stateName',stateName);
		Transunions
		.findOne({user:userid})
		.then(function(transunionsdetails) {

			var socialnumber = transunionsdetails.response.product.subject.subjectRecord.indicative.socialSecurity.number;
			var socialnumber = socialnumber.replace(/.(?=.{4})/g, 'X');

			Screentracking
			.findOne({user:userid,iscompleted : 0})
			.populate('accounts')
			.populate('plaiduser')
			.populate('transunion')
			.populate('user')
			.then(function(screentrackingdetails) {

						   sails.log.info('screentrackingdetails',screentrackingdetails.user);

				var accountName = "Installment Loan";
				//var accountName = screentrackingdetails.accounts.accountName;
				var accountNumberLastFour = screentrackingdetails.accounts.accountNumberLastFour;
/*				var loanholderstreetname = screentrackingdetails.plaiduser.addresses[0].data.street;
				var loanholderstreetnumber = screentrackingdetails.plaiduser.addresses[0].data.street;
				var loanholdercity = screentrackingdetails.plaiduser.addresses[0].data.city;
				var loanholderzipcode = screentrackingdetails.plaiduser.addresses[0].data.state;*/
				//var loanholderzipcode = screentrackingdetails.offerdata[0].financedAmount;
				var loanholderstreetname = screentrackingdetails.user.street;
                var loanholderstreetnumber = screentrackingdetails.user.street;
				var loanholdercity = screentrackingdetails.user.city;
				var loanholderzipcode = screentrackingdetails.user.zipCode;
				var loanstate = screentrackingdetails.user.state;
				var unitapp = screentrackingdetails.user.unitapp;
				if (screentrackingdetails.user.unitapp){
					var unitapp = screentrackingdetails.user.unitapp;
					}else{
						var unitapp = '';
						}


				User
					.findOne({id:userid})
					.then(function(userdetails) {

						var addressobj = {

							accountName:accountName,
							accountNumberLastFour:accountNumberLastFour,
							loanholderstreetname:loanholderstreetname,
							loanholderstreetnumber:loanholderstreetnumber,
							loanholdercity:loanholdercity,
							unitapp:unitapp,
							loanholderzipcode:loanholderzipcode,
							phonenumber:userdetails.phoneNumber,
							loanstate:loanstate
						}


						var currentTime = moment();
						var postDate = moment(screentrackingdetails.updatedAt);

						var updatedAt = moment(screentrackingdetails.updatedAt).format();

						var totalTimeAgo = currentTime.diff(postDate);
						var totalDaysAgo = currentTime.diff(postDate, 'days');
						var totalHoursAgo = currentTime.diff(postDate, 'hours');
						var totalMinutesAgo = currentTime.diff(postDate, 'minutes');
						var totalSecondsAgo = currentTime.diff(postDate, 'seconds');

						if(totalDaysAgo > 2) {

							var linkExpired = 1;
						} else {
							var linkExpired = 0;
						}

						sails.log.info('linkExpired',linkExpired);

						var paymentid = objectdatas.paymentschedule.id;
						sails.log.info('paymentid',paymentid);

						var userconsentcriteria = {user:userid,documentKey:'131',paymentManagement: paymentid};
						sails.log.info('userconsentcriteria',userconsentcriteria);

						UserConsent
						.findOne({userconsentcriteria})
						.then(function(userconsentdetails) {

							sails.log.info('userconsentdetails',userconsentdetails);

							if(userconsentdetails) {
								var alreadysigned = 1;
							}
							else {
								var alreadysigned = 0;
							}
							 var criteria = {
									  documentKey:'131',
							};

							sails.log.info('alreadysigned',alreadysigned);

							Agreement
							.find(criteria)
							.then(function (agreements) {
								var docversion = agreements[0].documentVersion;
								var IPFromRequest =  req.headers['x-forwarded-for'] || req.connection.remoteAddress;

								var indexOfColon = IPFromRequest.lastIndexOf(':');
								var ip = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);

								res.view("customerService/servicepromissorynote" , {obj:objectdatas,fname:fname,lname:lname,socialnumber:socialnumber,addressobj:addressobj,docversion:docversion,type:'view',userid:userid,checkExpiration: linkExpired,alreadysigned: alreadysigned,ip:ip});
							})
						})
					})
			})
			.catch(function (err) {
				sails.log.error('ApplicationController#promissorynoteAction :: err', err);
				return res.handleError(err);
			});
		})
	})
}



function resendplaidlinkAction(req, res){

	var screentrackid = req.param('id');
	var cretiriea = { id:screentrackid };
	Screentracking
	.findOne(cretiriea)
	.populate('user')
	.then(function(screentrackingdetails) {

	   var userID = screentrackingdetails.user.id;
	   var first_name = screentrackingdetails.user.firstname;
	   var last_name = screentrackingdetails.user.lastname;
	   var email = screentrackingdetails.user.email;

	   var userObjectData = {
			id: userID,
			name: first_name+" "+last_name,
			email: email
		};
		var criteria = {id: userID}
		var plaidresend = req.user.name;
		User.update(criteria,{plaidresend:plaidresend}).exec(function afterwards(err, updated){
		});

		EmailService.plaidInviteByCustomerServiceEmail(userObjectData);

		var userreq={};
		var usersubject = 'Income Verification - plaid invite';
		var userdescription = 'Income Verification send  successfully!';
		userreq.userid = userID;
		userreq.logdata= 'Income Verification send  successfully - ' +email;
		Useractivity.createUserActivity(userreq,usersubject,userdescription);


		screentrackingdetails.updatedAt = moment(screentrackingdetails.updatedAt).format('LL');;
		screentrackingdetails.save();

		req.session.successmsg='';
		req.session.successmsg = 'Email has been sent successfully';
		var redirectpath ="/admin/incompleteApplication";
		return res.redirect(redirectpath);

	})
	.catch(function (err) {
		sails.log.error('ScreentrackingController#resendplaidlinkAction :: err', err);
		return res.handleError(err);
	});

}
function changeincome(req, res){

	 var paymentid = req.param('id');
	 var incomeamount = req.param('incomeamount');
	 var cretiriea = { id:paymentid };
	 var balanceamount = 0;

	 var minimumIncomePlaid = sails.config.plaid.minincomeamount;

	 if((incomeamount < minimumIncomePlaid) && (sails.config.plaid.minimumIncomePlaidStatus == true)) {
		req.session.successmsg='';
		req.session.successmsg = 'Income amount is less than 25K!';
		var redirectpath ="/admin/getAchUserDetails/"+paymentid;
		return res.redirect(redirectpath);
	} else {


			PaymentManagement
			.findOne(cretiriea)
			.populate('screentracking')
			.populate('user')
			.then(function(loandetails) {

				var screenid = 	loandetails.screentracking.id
				PaymentManagement.update({id: paymentid}, {achstatus: 2})
				  .exec(function afterwards(err, updated){

					loandetails.screentracking.changeIncomePage = "Pending";

					Screentracking
					  .changeincomecreate(loandetails.screentracking,incomeamount,balanceamount,paymentid,loandetails.user)
					  .then(function(screenTracking) {

							//EmailService.loanDocumentsByCustomerServiceEmail(screenTracking);
							req.session.successmsg='';
							req.session.changeincomemsg='';
							req.session.changeincometab='yes';
							req.session.successmsg = 'Income has been changed successfully';

							var redirectpath ="/admin/getAchDetails";
							return res.redirect(redirectpath);

						})
						.catch(function (err) {
						  sails.log.error('ScreentrackingController#changeincome :: err :', err);
						  return res.handleError(err);
						});

				});

			})
			.catch(function (err) {
				sails.log.error('ScreentrackingController#changeincome :: err', err);
				return res.handleError(err);
			});

	}

}


function senduserofferAction(req,res) {

	res.contentType('application/json');
	var fullOffer= JSON.parse(req.param('fullOffer'));
	var userid= req.param('userid');
	var userID = {id:userid};


	var offerdata = {
		incomeamount:fullOffer.incomeamount,
		state:fullOffer.state,
		loanTerm:fullOffer.loanTerm,
		paymentFeq:fullOffer.paymentFeq,
		interestRate:fullOffer.interestRate,
		financedAmount:fullOffer.financedAmount,
		apr:fullOffer.apr,
		loanPaymentCycle:fullOffer.loanPaymentCycle,
		monthlyPayment:fullOffer.monthlyPayment,
		perTotMonthlyPayment:fullOffer.perTotMonthlyPayment,
		postTotMonthlyPayment:fullOffer.postTotMonthlyPayment,
		preDTI:fullOffer.preDTI,
		postDTI:fullOffer.postDTI,
		postDTIThreshold:fullOffer.postDTIThreshold,
		loanstatus:fullOffer.loanstatus,
		firstname:fullOffer.firstname
	};

   //fullOffer.userAccountres = {};

	Screentracking.update({id: fullOffer.userAccountres.id}, {offerdata: offerdata})
							 .exec(function afterwards(err, updated){});

	var criteria = {id: userid}
		var offerlinksend = req.user.name;
		User.update(criteria,{offerlinksend:offerlinksend}).exec(function afterwards(err, updated){
	});

	User.findOne(userid)
	.then(function (user) {
		var userreq={};
		var usersubject = 'Modified user offer';
		var userdescription = 'Send user modified offer  successfully!';
		userreq.userid = userid.id;
		userreq.logdata= 'Send user modified offer  successfully - ' +user.email;
		Useractivity.createUserActivity(userreq,usersubject,userdescription);




		EmailService.sendUserOfferEmail(fullOffer);

		req.session.successmsg='';
		req.session.successmsg = 'Offer has been sent to User';
		var redirectpath ="/admin/incompleteApplication";
		return res.redirect(redirectpath);

	})
	.catch(function (err) {
		  sails.log.error('CustomerServiceController#loanDocumentsByCustomerServiceEmailAction :: err :', err);
		  return res.handleError(err);
	});



}

function ajaxAllusersCommentsAction(req, res){

	 var userId = req.param('id');


	//Sorting
	var colS = "";

	if(req.query.sSortDir_0=='desc')
	{
		sorttype=-1;
	}
	else
	{
		sorttype=1;
	}
	switch(req.query.iSortCol_0){
		case '0':  var sorttypevalue = { '_id': sorttype }; break;
		case '1':  var sorttypevalue = { 'subject': sorttype }; break;
		case '2':  var sorttypevalue = { 'comments': sorttype }; break;
		case '3':  var sorttypevalue = { 'adminemail': sorttype }; break;
		case '4':  var sorttypevalue = { 'createdAt': sorttype }; break;
		default: break;
	};

	//Search
	if(req.query.sSearch)
	{
		var criteria = {
		  //isDeleted: false,
		  user: userId,
		  or: [{subject:  { 'contains': req.query.sSearch }}, {comments:  { 'contains': req.query.sSearch } }]
		};

	}
	else
	{
		var criteria = {
      		user: userId
    	};
	}


	Achcomments
    .find(criteria)
	.sort( sorttypevalue)
	.then(function(achcomments) {
		totalrecords= achcomments.length;
		//Filter by limit records
		skiprecord =parseInt(req.query.iDisplayStart);
		checklimitrecords = skiprecord+parseInt(req.query.iDisplayLength);
		if(checklimitrecords>totalrecords)
		{
			iDisplayLengthvalue=parseInt(totalrecords);
		}
		else
		{
			iDisplayLengthvalue=parseInt(req.query.iDisplayLength)+parseInt(skiprecord);
		}


		achcomments= achcomments.slice(skiprecord, iDisplayLengthvalue);

		var achcommentsDetails = [];
		achcomments.forEach(function(achcommentsdata,loopvalue){
			loopid = loopvalue+skiprecord+1;
			achcommentsdata.createdAt = moment(achcommentsdata.createdAt).format('MM-DD-YYYY');
			achcommentsDetails.push({ loopid:loopid,subject: achcommentsdata.subject, comments: achcommentsdata.comments,adminemail: achcommentsdata.adminemail,createdAt:achcommentsdata.createdAt });
		});
		 var json = {
				sEcho:req.query.sEcho,
				iTotalRecords: totalrecords,
				iTotalDisplayRecords: totalrecords,
				aaData: achcommentsDetails
			};
		res.contentType('application/json');
		res.json(json);
	});

}
function addAlluserCommentsAction(req, res){

	var userId = req.param('user_Id');
	var subject = req.param('subject');
	var comments = req.param('comments');
    var adminemail = req.user.email;
	var screenId = req.param('screenId');
    var screen_id;

	 if(screenId){
		   var screen_id = req.param('screenId');
		 }
	 else{
		  var screen_id = '';
		 }
		 var data = {
			      userId:userId,
				  subject:subject,
				  comments:comments,
				  adminemail:adminemail,
				  screen_id:screen_id,
			 }

  Achcomments
    .createAchCommentsForAllusers(data)
    .then(function (achcomments) {

		var modulename = 'Add pending applications Comment';
		var modulemessage = 'Pending applications comment added successfully';
		req.achlog = 1;
		req.logdata=req.form;
		req.userId= userId;
		Logactivity.registerLogActivity(req,modulename,modulemessage);

	  var json = {
		status: 200,
		message:"Commente Added successfully"
	 };
	 res.contentType('application/json');
	 res.json(json);

    })
    .catch(function (err) {
      sails.log.error('UniversityController#createUniversity :: err :', err);
      return res.handleError(err);
    });

}

function changeincomeFromOffer(req, res){

	 var paymentid = req.param('id');
	 var screenid = req.param('screenid');
	 var incomeamount = req.param('incomeamount');
	 var balanceamount = 0;

	 var minimumIncomePlaid = sails.config.plaid.minincomeamount;

	if((incomeamount < minimumIncomePlaid) && (sails.config.plaid.minimumIncomePlaidStatus == true)) {
		req.session.successmsg='';
		req.session.successmsg = 'Income amount is less than 25K!';
		var redirectpath ="/admin/viewIncomplete/"+screenid;
		return res.redirect(redirectpath);
	} else {

		if(screenid!='' && screenid!=null && "undefined" !== typeof screenid) {
			 var criteria = { id:screenid };

			 Screentracking
			 .findOne(criteria)
			 .populate('user')
			 .then(function (userAccountres) {

					 var lastScreenName= userAccountres.lastScreenName;
					 var lastlevel = userAccountres.lastlevel;
					 var idobj ={
						 transid : userAccountres.transunion,
						 accountid:'',
						 rulesDetails: userAccountres.rulesDetails,
						 creditscore: userAccountres.creditscore
					}

					 var dataObject 	= 	{adminofferchange:1};

					 var product = {product : userAccountres.product};
					 var userDetail = {id:userAccountres.user.id}

					 Screentracking
					.updatedeclinedloan(lastScreenName,lastlevel,userDetail,dataObject,product,idobj)
					.then(function(screenTracking) {
							var criteria = { screentracking: screenTracking.screenId };

							PaymentManagement
							.findOne(criteria)
							.populate('screentracking')
							.populate('user')
							.then(function(loandetails) {

								var paymentid = loandetails.id;
								loandetails.screentracking.changeIncomePage = "Incomplete";
								Screentracking
								  .changeincomecreate(loandetails.screentracking,incomeamount,balanceamount,paymentid,loandetails.user)
								  .then(function(screenTrackingdetailsnew) {

										if(screenTrackingdetailsnew.code=200) {
											var counterOfferIncomplete = {counterOfferIncomplete:'Counter-Offered Incomplete'};
											Screentracking.update({id: screenTrackingdetailsnew.id}, counterOfferIncomplete).exec(function afterwards(err, updated){});

											var counterOfferDecline = {counterOfferDecline:'Counter-Offered Decline'};
											PaymentManagement.update({id: paymentid}, counterOfferDecline).exec(function afterwards(err, updated){});

											req.session.successmsg='';
											req.session.successmsg = 'Income has been changed successfully';
											var redirectpath ="/admin/incompleteApplication";
											return res.redirect(redirectpath);

										} else {
											req.session.successmsg='';
											req.session.successmsg = 'Income has been changed successfully';
											var redirectpath ="/admin/incompleteApplication";
											return res.redirect(redirectpath);

										}
									})
									.catch(function (err) {
									  sails.log.error('ScreentrackingController#changeincome :: err :', err);
									  return res.handleError(err);
									});

							})
							.catch(function (err) {
								sails.log.error('ScreentrackingController#changeincomeDeclineReason :: err', err);
								return res.handleError(err);
							});
							/*var updateDatares = {deniedmessage:'This application has been denied due to change in Income from Admin!'};
							Screentracking.update({id: screenTracking.screenId}, updateDatares)
							 .exec(function afterwards(err, updated){
								req.session.successmsg='';
								req.session.successmsg = 'Income has been changed successfully!';
								var redirectpath ="/admin/getAchDetails";
								return res.redirect(redirectpath);
							 });*/
					});

			})
			.catch(function (err) {
				 sails.log.error('ScreentrackingController#loanofferinfoAction :: err', err);
				 return res.handleError(err);
			});

		} else {
			var criteria = { id:paymentid };
			console.log("Payment id not found!!");
		}
	}
}

function changescheduledateAction(req, res){

	 var paymentid = req.param('paymentID');
	 var transaction = req.param('transaction');
	 var scheduledate = req.param('scheduledate');
	 var standardreason = req.param('standardreason');
	 var reasoncomment = req.param('reasoncomment');

	 Screentracking
	 .changepaymentschudle(paymentid,transaction,req)
	 .then(function(schudledetails) {

		if(schudledetails.code==200){
			req.session.schudlesmsg='';
			req.session.schudlesmsg = 'Schedule date has been updated successfully';
			var redirectpath ="/admin/getAchUserDetails/"+paymentid;
			return res.redirect(redirectpath);
		}else{
			req.session.schudlesmsg='';
			req.session.schudlesmsg = 'Schedule date not updated try again!';
			var redirectpath ="/admin/getAchUserDetails/"+paymentid;
			return res.redirect(redirectpath);
		}


	 })
	 .catch(function (err) {
			 sails.log.error('ScreentrackingController#changescheduledateAction :: err', err);
			 return res.handleError(err);
	 });


}

function changescheduleamountAction(req, res){

	 var paymentid = req.param('paymentID');
	 var amounttransaction = req.param('amounttransaction');
	 var scheduleamount = req.param('scheduleamount');
	 var standardreason = req.param('standardreason');
	 var reasoncomment = req.param('reasoncomment');


	 Screentracking
	 .changepaymentamount(paymentid,amounttransaction,req)
	 .then(function(schudledetails) {

		if(schudledetails.code==200){
			req.session.schudlesmsg='';
			req.session.schudlesmsg = 'Schedule amount has been updated successfully';
			var redirectpath ="/admin/getAchUserDetails/"+paymentid;
			return res.redirect(redirectpath);
		}else{
			req.session.schudlesmsg='';
			req.session.schudlesmsg = 'Schedule amount not updated try again!';
			var redirectpath ="/admin/getAchUserDetails/"+paymentid;
			return res.redirect(redirectpath);
		}


	 })
	 .catch(function (err) {
			 sails.log.error('ScreentrackingController#changescheduledateAction :: err', err);
			 return res.handleError(err);
	 });




}

function incompleteDenyUserLoanAction(req, res) {

    var payID = req.param('paymentID');
	var screenId = req.param('screenId');
	var eligireply = req.param('eligiblereapply');
	var decline = req.param('decline');
	var declinereason = req.param('declinereason');


		if(payID != 'Empty'){
			var options = {
				id: payID
			};
			PaymentManagement.findOne(options)
			 .populate('user')
		     .populate('story')
		     .then(function(paymentmanagementdata){
			    var userObjectData =  paymentmanagementdata.user;
				paymentmanagementdata.achstatus = 2;
				paymentmanagementdata.isPaymentActive = false;
				paymentmanagementdata.eligiblereapply = eligireply;
				paymentmanagementdata.declineemail = decline;
				paymentmanagementdata.declinereason = declinereason;
				paymentmanagementdata.appverified = 1;

				//paymentmanagementdata.practicemanagement = practicemanagement;
				paymentmanagementdata.save(function (err) {

				if (err) {
						var json = {
						status: 400,
						message:"Unable to decline loan. Try again!"
					};
					res.contentType('application/json');
					res.json(json);
				}
				else
				{

					 //-- Added for back button redirect from detail page starts here
						 var checkCreatedDate = moment().startOf('day').subtract(60, "days").format('MM-DD-YYYY');
						 checkCreatedDate 	 =	moment(checkCreatedDate).tz("America/Los_Angeles").startOf('day').toDate().getTime();
						 var loanCreartedDate = moment(paymentmanagementdata.createdAt).tz("America/Los_Angeles").startOf('day').toDate().getTime();

						 var backviewType='';

							 if(paymentmanagementdata.achstatus == 2)
							 {
								 backviewType ='/admin/showAllArchivedDenied';

								 if(loanCreartedDate > checkCreatedDate)
								 {
										backviewType ='/admin/showAllDenied';
								 }
								 else
								 {
									 if(paymentmanagementdata.screentracking.moveToIncomplete)
									 {
										 if(paymentmanagementdata.screentracking.moveToIncomplete==1)
										 {
											backviewType ='/admin/showAllDenied';
										 }
									 }
								 }
							 }
				  //-- Added for back button redirect from detail page ends here
					var criteria = {
						id: paymentmanagementdata.story
					};

					Story
					.findOne(criteria)
					.then(function(storydata){

						storydata.status = Story.STATUS_DECLINED;
						storydata.save(function(err) {

						if (err) {
							var json = {
							status: 400,
							message:"Unable to decline loan. Try again!"
						};
						res.contentType('application/json');
						res.json(json);
						}

						var usercriteria = {
							id: paymentmanagementdata.user
						};

							User
							.findOne(usercriteria)
							.then(function(userdata){

								userdata.isUserProfileUpdated = false;
								userdata.save(function(err) {

								if (err) {

									var json = {
										status: 400,
										message:"Unable to decline loan. Try again!"
									};
									res.contentType('application/json');
									res.json(json);
								}

								var screencriteria = {
									id: paymentmanagementdata.screentracking
								}

									Screentracking
									.findOne(screencriteria)
									.then(function(screendata){

										screendata.iscompleted = 1;
										screendata.incompleteverified = 1;
										screendata.save(function(err){

										if (err) {
											var json = {
											status: 400,
											message:"Unable to decline loan. Try again!"
											};
											res.contentType('application/json');
											res.json(json);
										}

										//Log Activity
										var modulename = 'Loan denied';
										var modulemessage = 'Loan denied successfully';
										req.achlog = 1;
										req.payID= payID;
										req.logdata=paymentmanagementdata;


										Logactivity.registerLogActivity(req,modulename,modulemessage);

										//EmailService.sendDenyLoanMail(userObjectData,paymentmanagementdata);
										var userreq={};
										var usersubject = 'Deny Loan';
										var userdescription = 'Deny Loan email';
										userreq.userid = userdata.id;
										userreq.logdata= 'Deny Loan to'+userdata.email;
										Useractivity.createUserActivity(userreq,usersubject,userdescription);

										var json = {
										status: 200,
										backviewType:backviewType,
										message:"Loan denied successfully"
										};
										 res.contentType('application/json');
										 res.json(json);
										})
									});
								});
							});
						});
					});
				}
			})
		});
	}else{
		 		var screenoptions = {
				       id: screenId
			};
		           Screentracking
		                  .findOne(screenoptions)
		                  .populate('user')
		                  .then(function(screendata){

				 var lastScreenName= screendata.lastScreenName;
				 var lastlevel = screendata.lastlevel;


				  //-- Added for back button redirect from detail page starts here
						 var checkCreatedDate = moment().startOf('day').subtract(60, "days").format('MM-DD-YYYY');
						 checkCreatedDate 	 =	moment(checkCreatedDate).tz("America/Los_Angeles").startOf('day').toDate().getTime();
						 var loanCreartedDate = moment(screendata.createdAt).tz("America/Los_Angeles").startOf('day').toDate().getTime();

						 var backviewType='';


								 backviewType ='/admin/showAllArchivedDenied';

								 if(loanCreartedDate > checkCreatedDate)
								 {
										backviewType ='/admin/showAllDenied';
								 }
								 else
								 {
									 if(screendata.moveToIncomplete)
									 {
										 if(screendata.moveToIncomplete==1)
										 {
											backviewType ='/admin/showAllDenied';
										 }
									 }
								 }
				  //-- Added for back button redirect from detail page ends here

				 var idobj ={

					 transid : screendata.transunion,
					 accountid:'',
					 rulesDetails: screendata.rulesDetails,
					 creditscore: screendata.rulesDetails
				}


				 var dataObject = {};
				 var product = {product : screendata.product};
				 var userDetail = {id:screendata.user.id};

						 screendata.offerdata=[{financedAmount:0}];
				         Story
			               .createUserstory(userDetail,screendata)
				           .then(function(story) {
			                 return User.getNextSequenceValue('loan')
						   .then(function(loanRefernceData) {
								   var loanRefernceDataValue ='LN_'+loanRefernceData.sequence_value;
								   var logdata =[{
									message:"",
									date: new Date()
								   }];

								   var maturityDate = moment().startOf('day').toDate();
								   var paymentSchedule = [];

								   var payobj = {
										paymentSchedule: paymentSchedule,
										maturityDate: maturityDate,
										story: story.id,
										user: story.user.id,
										payOffAmount: parseFloat(story.requestedAmount?story.requestedAmount.toString():"0"),
										account: '',
										nextPaymentSchedule:maturityDate,
										achstatus:2,
										declineemail:decline,
										declinereason:declinereason,
										loanReference: loanRefernceDataValue,
										logs:logdata,
										deniedfromapp: 0,
										isPaymentActive : false,
										eligiblereapply: eligireply,
										screentracking:screendata.id,
										creditScore:screendata.creditscore,
										practicemanagement:screendata.practicemanagement,
										appverified:1,
									   	status: "DENIED"
									  };

							PaymentManagement.create(payobj)
								.then(function(paymentDet) {
									var usercriteria = {
										user:story.user.id,
									};
									 User
										.findOne(userDetail)
										.then(function(userdetails) {
										   userdetails.isExistingLoan = false;
										   userdetails.isUserProfileUpdated = false;
										   userdetails.save();

										var consentCriteria = {
											 user:userDetail,
											 loanupdated:1
										};

										UserConsent
											.find(consentCriteria)
											.sort("createdAt DESC")
											.then(function(userConsentAgreement) {

											_.forEach(userConsentAgreement, function(consentagreement) {

												UserConsent.updateUserConsentAgreement(consentagreement.id,userDetail,paymentDet.id);

												});
											})
											.catch(function(err) {
											   sails.log.error("Screentracking::updatedeclinedloan UserConsent error::", err);
											});
										 Screentracking
											.findOne({user: userDetail.id,iscompleted : [0,2]})
											.then(function(screenTracking){

											   if(screenTracking)

												{
													screenTracking.iscompleted = 1;
													screenTracking.rulesDetails = idobj.rulesDetails;
													screenTracking.product = product;
													screenTracking.incompleteverified = 1;
													screenTracking.save();


													//Log Activity
													var modulename = 'Loan denied';
													var modulemessage = 'Loan denied successfully';
													req.achlog = 1;
													req.payID= paymentDet.id;
													req.logdata=paymentDet;

													Logactivity.registerLogActivity(req,modulename,modulemessage);
													//EmailService.sendDenyLoanMail(userdetails,paymentDet);
													var userreq={};
													var usersubject = 'Deny Loan';
													var userdescription = 'Deny Loan email';
													userreq.userid = userdetails.id;
													userreq.logdata= 'Deny Loan to'+userdetails.email;
													Useractivity.createUserActivity(userreq,usersubject,userdescription);

													var json = {
														status: 200,
														message:"Loan denied successfully",
														backviewType:backviewType
													 };
													 res.contentType('application/json');
													 res.json(json);
												}
											});


							})
					    })
					})
				})
		 })
	  }
  }

function saveServiceLoanOfferFromDTI(req, res){

	var screenId = req.param('id');
	console.log("--screenId--",screenId);


	Screentracking
	  .loanofferinfo(screenId)
	  .then(function(fullOffer) {
			console.log("--resscreenId--",fullOffer);

			res.contentType('application/json');
			//var fullOffer= JSON.parse(req.param('fullOffer'));
			var userid= fullOffer.userAccountres.user.id;
			var userDetails = {id:userid};

			var offerdata = {
				incomeamount:fullOffer.incomeamount,
				state:fullOffer.state,
				loanTerm:fullOffer.loanTerm,
				paymentFeq:fullOffer.paymentFeq,
				interestRate:fullOffer.interestRate,
				financedAmount:fullOffer.financedAmount,
				apr:fullOffer.apr,
				loanPaymentCycle:fullOffer.loanPaymentCycle,
				monthlyPayment:fullOffer.monthlyPayment,
				perTotMonthlyPayment:fullOffer.perTotMonthlyPayment,
				postTotMonthlyPayment:fullOffer.postTotMonthlyPayment,
				preDTI:fullOffer.preDTI,
				postDTI:fullOffer.postDTI,
				postDTIThreshold:fullOffer.postDTIThreshold,
				loanstatus:fullOffer.loanstatus,
				firstname:fullOffer.firstname
			};

			 Screentracking
			  .updateLastScreenName(userDetails,'Loan Offer Details',4,'','','',[offerdata])
			  .then(function(screenTracking) {

					User.findOne(userid)
					.then(function (user) {
						var userreq={};
						var usersubject = 'Promissory Note Document Sign';
						var userdescription = 'Promissory note document sign  successfully!';
						userreq.user_id = userid;
						userreq.logdata= 'Promissory note document sign  successfully - ' +user.email;
						Useractivity.createUserActivity(userreq,usersubject,userdescription);

						EmailService.loanDocumentsByCustomerServiceEmail(screenTracking);
						req.session.successmsg='';
						req.session.successmsg = 'Loan Offer has been updated successfully';
						var redirectpath ="/admin/incompleteApplication";
						return res.redirect(redirectpath);
					})
					.catch(function (err) {
						  sails.log.error('CustomerServiceController#loanDocumentsByCustomerServiceEmailAction :: err :', err);
						  return res.handleError(err);
					});

				})
				.catch(function (err) {
				  sails.log.error('ScreentrackingController#saveloanofferAction :: err :', err);
				  return res.handleError(err);
				});
	})
	 .catch(function(err) {
		sails.log.error("Screentracking::saveServiceLoanOfferFromDTI error::", err);
	 });

	/**/
}

function changeincomeDenied(req, res){

	 var paymentid = req.param('id');
	 var incomeamount = req.param('incomeamount');
	 var cretiriea = { id:paymentid };
	 var balanceamount = 0;

	 var minimumIncomePlaid = sails.config.plaid.minincomeamount;

	if((incomeamount < minimumIncomePlaid) && (sails.config.plaid.minimumIncomePlaidStatus == true)) {
		req.session.successmsg='';
		req.session.successmsg = 'Income amount is less than 25K!';
		//var redirectpath ="/admin/viewIncomplete/"+paymentid;
		var redirectpath ="/admin/getAchUserDetails/"+paymentid;
		return res.redirect(redirectpath);
	} else {

			PaymentManagement
			.findOne(cretiriea)
			.populate('screentracking')
			.populate('user')
			.then(function(loandetails) {

				var screenid = 	loandetails.screentracking.id
				PaymentManagement.update({id: paymentid}, {achstatus: 2})
				  .exec(function afterwards(err, updated){

					loandetails.screentracking.changeIncomePage = "Denied";

						//var criteria = { user:loandetails.user.id };
						PlaidUser
						.findOne({ user:loandetails.user.id })
						.then(function(plaidDetails) {

							loandetails.screentracking.plaiduser = plaidDetails.id;

							Screentracking
							  .changeincomecreate(loandetails.screentracking,incomeamount,balanceamount,paymentid,loandetails.user)
							  .then(function(screenTracking) {

									EmailService.sendNotifyFromDenied(screenTracking);
									req.session.successmsg='';
									req.session.successmsg = 'Income has been changed successfully!';
									req.session.changeincomemsg='';
							        req.session.changeincometab='yes';
									var redirectpath ="/admin/incompleteApplication";
									return res.redirect(redirectpath);
								})
								.catch(function (err) {
								  sails.log.error('ScreentrackingController#changeincomeDenied :: err :', err);
								  return res.handleError(err);
								});
					})
					.catch(function (err) {
						sails.log.error('ScreentrackingController#changeincomeDeniedPlaiduser :: err', err);
						return res.handleError(err);
					});
				});

			})
			.catch(function (err) {
				sails.log.error('ScreentrackingController#changeincomeDenied :: err', err);
				return res.handleError(err);
			});
	}
}

function viewBlocked(req, res){

	var id = req.param('id');

	var successval = '';
	var uploaddocmsg='';
	 sails.log.info('req.session.uploaddocmsg: ', req.session.uploaddocmsg);

	if ("undefined" !== typeof req.session.successmsg && req.session.successmsg!='' && req.session.successmsg!=null){
		successval =req.session.successmsg;
		req.session.successmsg = '';
	}
	if ("undefined" !== typeof req.session.uploaddocmsg && req.session.uploaddocmsg!='' && req.session.uploaddocmsg!=null){
		uploaddocmsg =req.session.uploaddocmsg;
		req.session.uploaddocmsg = '';
	}
	sails.log.info('req.session.uploaddocmsg--: ', req.session.uploaddocmsg);
	sails.log.info('uploaddocmsg--: ', uploaddocmsg);

	sails.log.info('screenid--: ', id);

    Screentracking
    .findOne({
		 id: id,
		 iscompleted : [0,1,2]
	})
	.populate('user')
    .then(function (screentracking) {

	sails.log.info('screentracking--: ', screentracking);
	sails.log.info('screentrackingtransunion--: ', screentracking.transunion);

		  var transcriteria = { id: screentracking.transunion};
		  sails.log.info('transcriteria--: ', transcriteria);


		  Transunions
		   .findOne(transcriteria)
		   .sort("createdAt DESC")
		   .then(function (transData) {

			  if ("undefined" === typeof transData || transData=='' || transData==null)
			  {
				 var showtransData=0;
			  }
			  else
			  {
				 var showtransData=1;

				 if(transData.credit_collection.subscriber)
				 {
					var transcreditArray =transData.credit_collection;
					transData.credit_collection=[];
					transData.credit_collection.push(transcreditArray);
				 }

				 if(transData.inquiry.subscriber)
				 {
					var transinquiryArray =transData.inquiry;
					transData.inquiry=[];
					transData.inquiry.push(transinquiryArray);
				 }

				 if(transData.addOnProduct.status)
				 {
					var transproductArray =transData.addOnProduct;
					transData.addOnProduct=[];
					transData.addOnProduct.push(transproductArray);
				 }

				 if(transData.house_number.status)
				 {
					var transhouseArray =transData.house_number;
					transData.house_number=[];
					transData.house_number.push(transhouseArray);
				 }

				 if(transData.trade.subscriber)
				 {
					var transtradeArray =transData.trade;
					transData.trade=[];
					transData.trade.push(transtradeArray);
				 }
				 if(transData.response.product.subject.subjectRecord && transData.response.product.subject.subjectRecord.custom && transData.response.product.subject.subjectRecord.custom.credit) {
					 if (!Array.isArray(transData.response.product.subject.subjectRecord.custom.credit.publicRecord)) {
						 var transpublicrecordArray = transData.response.product.subject.subjectRecord.custom.credit.publicRecord;
						 transData.publicrecord = [];
						 transData.publicrecord.push(transpublicrecordArray);
					 } else {
						 transData.publicrecord = transData.response.product.subject.subjectRecord.custom.credit.publicRecord;
					 }
				 }
			  }

			if ("undefined" === typeof screentracking.accounts || screentracking.accounts=='' || screentracking.accounts==null)
			{
				var acccriteria = {
					user: screentracking.user.id,
					id: '0',
				};
			}else{
				var acccriteria = {
					user: screentracking.user.id,
					id: screentracking.accounts,
				};
			}


			Account
			  .find(acccriteria)
			  .populate('userBankAccount')
			  .then(function(accountDetail) {





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
								if(otheraccountvalue.numbers)	{
								   var str1 = otheraccountvalue.numbers.account;
								   if ("undefined" !== typeof str1 && str1!='' && str1!=null){
									 otheraccountvalue.numbers.account = str1.replace(/\d(?=\d{4})/g, "X");
								   }
							  }
						  })

					   }
					})
				  }
				  var screenData ='';
				  if(screentracking.data)
				  {
					screenData =JSON.stringify(screentracking.data, null, 4);
				  }
				  req.flash('error','');

				   var subTypeArray = [];

				   var userAccount = transData.response;

					var totalbalance = 0;
					var sum =0;
					 if(screentracking.offerdata[0].financedAmount){
					  var totalbalance = (screentracking.offerdata[0].financedAmount).toFixed(2);
					  totalbalance = totalbalance.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
					 }

					 Screentracking
						.getloanOfferdetails(screentracking)
						.then(function(loanofferdata) {
							//sails.log.info("loanofferdataloanofferdataloanofferdataloanofferdata",loanofferdata);
							//return 1;

							  Screentracking
								.getDTIoffers(userAccount,screentracking)
								.then(function(dtiandoffers) {

									if(screenData) {
										screenData = JSON.parse(screenData);
										delete screenData['transactionControl'];
										delete screenData['certificate'];
										screenData = JSON.stringify(screenData, null, 2);
									}


									var documenttype1 = sails.config.loanDetails.doctype1;
									var documenttype2 = sails.config.loanDetails.doctype2;
									var documenttype3 = sails.config.loanDetails.doctype3;

									var documenttype = {
										documenttype1 :documenttype1,
										documenttype2 :documenttype2,
										documenttype3 :documenttype3,
									};


									  //****Bank account start******//
									  if(accountDetail.length > 0){
										 var separateArray = accountDetail[0];
										 var bankname = separateArray.userBankAccount.institutionName;
									  } else {
										  var bankname = "";
									  }

										//****Bank account end******//
										//annual income *** start//
										var income_amt = screentracking.incomeamount;
										if(income_amt === undefined){
											var income_amt = '-----';
										}
											//annual income *** start//

										var paycriteria = {screentracking: screentracking.id};

										console.log("paycriteria----",paycriteria);
										PaymentManagement
										.findOne(paycriteria)
										.then(function(PaymentManagementdata) {

												var pendingSchedule	=[];
												var paidSchedule = [];
												if(PaymentManagementdata!='' && PaymentManagementdata!=null && "undefined" !== typeof PaymentManagementdata) {
													var paymentManagementId = PaymentManagementdata.id;
													var doccriteria = {
														paymentManagement: PaymentManagementdata.id
													};
													_.forEach(PaymentManagementdata.paymentSchedule, function(payDetails) {

														 if(payDetails.status == "PAID OFF" )
														  {
															  paidSchedule.push(payDetails);
														  }
														  else
														  {
															 pendingSchedule.push(payDetails);
														  }
													});

												} else {
													var paymentManagementId = 'Empty';
													var doccriteria = {
														//paymentManagement: screentracking.id
														user: screentracking.user.id
													};
												}

													//console.log("PaymentManagementdata----",PaymentManagementdata);


												Achdocuments
												.find(doccriteria)
												.populate('proofdocument')
												.then(function(documentdata) {

													_.forEach(documentdata, function(documentvalue) {
													   if(documentvalue.proofdocument.isImageProcessed)
													   {
														   if(documentvalue.proofdocument.standardResolution)
														  {
															 documentvalue.proofdocument.standardResolution = Utils.getS3Url(documentvalue.proofdocument.standardResolution);
														  }
													   }
													})

													//console.log("---paymentManagementId---",paymentManagementId);


															var userid = screentracking.user.id;
															var screenId = screentracking.id;

															/*UserConsent
															.objectdataforpdf(userid,req,res)
															.then(function (objectdatas) {*/

																var criteria = { id: req.param('id')};
																Screentracking
																.findOne(criteria)
																.populate('plaiduser')
																.populate('user')
																 .then(function (userAccountres) {


																		if(userAccountres.accounts!='' && userAccountres.accounts!=null && "undefined" !== typeof userAccountres.accounts) {

																					/*var payCriteria = {screentracking:req.param('id')};
																					PaymentManagement
																					.findOne(payCriteria)
																					.then(function(paymentData) {*/

																						if(PaymentManagementdata!='' && PaymentManagementdata!=null && "undefined" !== typeof PaymentManagementdata)
																						{
																							var incomeEntered = 2;
																						} else {
																							var incomeEntered = 1;
																						}

																						 return res.view('admin/screentracking/viewBlocked', {
																							screentracking: screentracking,
																							achdocumentDetails: documentdata,
																							documenttype: documenttype,
																							screenData: screenData,
																							transData:transData,
																							bankname:bankname,
																							accountDetail: accountDetail,
																							accountDetails:subTypeArray,
																							totalbalance:totalbalance,
																							selecttotal:sum,
																							loanofferdata:loanofferdata,
																							dtiandoffers:dtiandoffers,
																							income_amt:income_amt,
																							//obj:objectdatas,
																							paymentManagementId: paymentManagementId,
																							paymentmanagementdata:PaymentManagementdata,
																							screenId: screenId,
																							changeincomestatus:'incomplete',
																							incomeEntered: incomeEntered,
																							successval:successval,
																							uploaddocmsg:uploaddocmsg,
																							pendingSchedule:pendingSchedule,
																							momentDate:moment
																						  });

																					/*})
																					.catch(function (err) {
																						sails.log.error('AchController#PaymentRecordOrNot :: err :', err);
																						return res.handleError(err);
																					});*/

																		} else {
																			var incomeEntered = 0;

																				   return res.view('admin/screentracking/viewBlocked', {
																					screentracking: screentracking,
																					achdocumentDetails: documentdata,
																					documenttype: documenttype,
																					screenData: screenData,
																					transData:transData,
																					bankname:bankname,
																					accountDetail: accountDetail,
																					accountDetails:subTypeArray,
																					totalbalance:totalbalance,
																					selecttotal:sum,
																					loanofferdata:loanofferdata,
																					dtiandoffers:dtiandoffers,
																					income_amt:income_amt,
																					//obj:objectdatas,
																					paymentManagementId: paymentManagementId,
																					paymentmanagementdata:PaymentManagementdata,
																					screenId: screenId,
																					changeincomestatus:'incomplete',
																					incomeEntered: incomeEntered,
																					pendingSchedule:pendingSchedule,
																					momentDate:moment
																				  });
																		}




																})
																.catch(function (err) {
																	sails.log.error('AchController#ChekingAccountLinkedOrNot :: err :', err);
																	return res.handleError(err);
																});
															/*})
															.catch(function (err) {
																sails.log.error('AchController#objectdataforpdf :: err :', err);
																return res.handleError(err);
															});	*/

													})
													.catch(function (err) {
														sails.log.error('AchController#createAchDocuments :: err :', err);
														return res.handleError(err);
													});

										})
										.catch(function (err) {
											sails.log.error('AchController#paymentdata :: err :', err);
											return res.handleError(err);
										});
							   })
							   .catch(function(err){
									sails.log.error("getDTIoffers::Error",err);
									return res.handleError(err);
							   })

						   })
				   .catch(function(err){
						sails.log.error("getDTIoffers::Error",err);
						return res.handleError(err);
				   })


			   });


	     }).catch(function(err){
		sails.log.error("getDTIoffers::Error",err);
		//req.session.successmsg='';
		//req.session.successmsg = 'Offer has been submitted already!';
		var redirectpath ="/admin/incompleteApplication";
		return res.status(200).redirect(redirectpath);
     })

    })
	.catch(function(err){
		sails.log.error("getDTIoffers::Error",err);
		//req.session.successmsg='';
		//req.session.successmsg = 'Offer has been submitted already!';
		var redirectpath ="/admin/incompleteApplication";
		return res.status(200).redirect(redirectpath);
   })

}

function unBlockLoan(req, res){

	var screenTrackingId = req.param('id');
	//console.log("screenTrackingId---",screenTrackingId);

	var paycriteria = {screentracking: screenTrackingId};

	console.log("paycriteria----",paycriteria);
	PaymentManagement
	.findOne(paycriteria)
	.then(function(PaymentManagementdata) {

		if ("undefined" === typeof PaymentManagementdata || PaymentManagementdata=='' || PaymentManagementdata==null) {

			var updateBlockedList = {blockedList:false};
			Screentracking.update({id: screenTrackingId}, updateBlockedList)
			.exec(function afterwards(err, updated){
				sails.log.info("updated in screen---",updated);
				var redirectpath ="/admin/showAllBlocked";
				return res.redirect(redirectpath);
			});
		} else {
			var updateBlockedList = {blockedList:false};
			Screentracking.update({id: screenTrackingId}, updateBlockedList)
			.exec(function afterwards(err, updated){

				var updateBlockedList = {blockedList:false};

				PaymentManagement.update({id: PaymentManagementdata.id}, updateBlockedList)
				.exec(function afterwards(err, updated){
					console.log("updated in payment and screen---",updated);
				});

				var redirectpath ="/admin/showAllBlocked";
				return res.redirect(redirectpath);
			});
		}

	})
	.catch(function (err) {
		sails.log.error('AchController#paymentdata :: err :', err);
		return res.handleError(err);
	});
}

function incompletegetrepullPlaidDetails(req, res){

	var repullID = req.param('repullID');
	var repullpage = req.param('repullpage');

	sails.log.info("repullpage::", repullpage);


		if(repullID)
		{
			var repullcriteria = {
					id: repullID
			};
			sails.log.info("repullcriteria::", repullcriteria);

			UserBankAccount
			.findOne(repullcriteria)
			.then(function(repulldata) {

				if(repulldata)
				{
					sails.log.info("repulldata::", repulldata);

					res.render("admin/screentracking/incompleterepullplaidDetails" , {repulldata:repulldata}, function(err, listdata){



						var json = {
							status: 200,
							message:'Credit history details found',
							listdata: listdata
						};
						res.contentType('application/json');
						res.json(json);
					});
				}
				else
				{
					 var json = {
							status: 400,
							message:'No repull details found.'
					  };
					  sails.log.error("json data", json);
					  res.contentType('application/json');
					  res.json(json);
				}
			})
			.catch(function (err) {
				  var json = {
						status: 400,
						message:'No repull details found.'
				  };
				  sails.log.error("json data", json);
				  res.contentType('application/json');
				  res.json(json);
			});
		}
		else
		{
			var json = {
				status: 400,
				message:'No repull details found.'
		   };
		   sails.log.error("json data", json);
		   res.contentType('application/json');
		   res.json(json);
		}

}


function getChangeLoanOfferDetails( req, res ) {
	const reqParams = req.allParams();
	const loanamount = parseFloat( _.get( reqParams, "loanamount", "0" ).replace( /[^0-9.]/g, "" ) );
	const downpayment = parseFloat( _.get( reqParams, "downpayment", "0" ).replace( /[^0-9.]/g, "" ) );
	const userincome = parseFloat( _.get( reqParams, "userincome", "0" ).replace( /[^0-9.]/g, "" ) );
	const housingexpense = parseFloat( _.get( reqParams, "housingexpense", "0" ).replace( /[^0-9.]/g, "" ) );
	let apr = null;
	let term = null;
	let tier = null;
	if( reqParams.apr ) {
		apr = parseFloat( _.get( reqParams, "apr", "999999" ).replace( /[^0-9.]/g, "" ) );
		term = parseFloat( _.get( reqParams, "term", "999999" ).replace( /[^0-9.]/g, "" ) );
		tier = _.get( reqParams, "tier", "" );
	}
	sails.log.info( "ScreentrackingController.getChangeLoanOfferDetails; screenid:", reqParams.screenid );
	sails.log.info( "ScreentrackingController.getChangeLoanOfferDetails; loanamount:", loanamount, "downpayment:", downpayment, "userincome:", userincome );
	Screentracking.findOne( { id: reqParams.screenid } )
	.then( ( screentracking ) => {
		screentracking.incomeamount = userincome;
		screentracking.housingExpense = housingexpense;
		if( apr ) {
			return Screentracking.createOffer( screentracking, true, downpayment, loanamount, apr, term, tier );
		} else {
			return Screentracking.getOffers( screentracking, true, downpayment, loanamount );
		}
	})
	.then( ( offers ) => {
		const responseData = { code : 200, screenid: reqParams.screenid, offers: offers };
		res.render( "admin/screentracking/newloanamountoffer", { data: responseData }, function( err, listdata ) {
			// sails.log.info( "listdata:", listdata );
			res.json( { status: 200, message: "Change loan offer details available", listdata: listdata } );
		} );
	} );
}


function updateNewloanincomedetails( req, res ) {
	const reqParams = req.allParams();
	const loanamount = parseFloat( _.get( reqParams, "loanamount", "0" ).replace( /[^0-9.]/g, "" ) );
	const downpayment = parseFloat( _.get( reqParams, "downpayment", "0" ).replace( /[^0-9.]/g, "" ) );
	const userincome = parseFloat( _.get( reqParams, "userincome", "0" ).replace( /[^0-9.]/g, "" ) );
	var	pagename = req.param( "pagename" );
	var	offerid	= req.param( "offerid" ); // array location of offer selected
	var	offers = req.param( "offers" ); // array of offers displayed
	var	paymentid = req.param( "paymentid" );
	var	screenid = req.param( "screenid" );
	var balanceamount =	0;

	let apr = null;
	let term = null;
	let tier = null;
	if( reqParams.apr ) {
		apr = parseFloat( _.get( reqParams, "apr", "999999" ).replace( /[^0-9.]/g, "" ) );
		term = parseFloat( _.get( reqParams, "term", "999999" ).replace( /[^0-9.]/g, "" ) );
		tier = _.get( reqParams, "tier", "" );
	}

	Screentracking.findOne( { id: screenid } )
	.populate( "user" )
	.then( ( screentracking ) => {
		var dataObject = { adminofferchange: 1 };
		var product = { product: screentracking.product };
		var	userId = screentracking.user.id;
		var userDetail = screentracking.user;
		var loanstatus = screentracking.iscompleted;
		var lastlevel = screentracking.lastlevel;
 		if( loanstatus == '0' && lastlevel != 5 ) { // Incomplete Path
			sails.log.info("Incomplete application.");
			//Incomplete application.
			var lastScreenName = screentracking.lastScreenName;
			var lastlevel = screentracking.lastlevel;
			var idobj =	{
				transid: screentracking.transunion,
				accountid: "",
				rulesDetails: screentracking.rulesDetails,
				creditscore: screentracking.creditscore
			};
 			return Screentracking.updatedeclinedloan( lastScreenName, lastlevel, userDetail, dataObject, product, idobj )
			.then( function( screentracking ) {
				return PaymentManagement.findOne( { id: screentracking.paymentid } )
				.populate( "screentracking" )
				.populate( "user" )
				.then( function( loandetails ) {
					var paymentid = loandetails.id;
					loandetails.screentracking.changeIncomePage = "Incomplete";
					return Screentracking.changenewloanincomecreate( loandetails.screentracking, userincome, downpayment, balanceamount, paymentid, loandetails.user, true )
					.then( function( screenTrackingdetailsnew ) {
 						var	newscreenid	= screenTrackingdetailsnew.newscreenTracking.id;
						if( screenTrackingdetailsnew.code == 200 ) {
 							var counterOfferIncomplete = { counterOfferIncomplete: "Counter-Offered Incomplete" };
							Screentracking.update( { id: newscreenid }, counterOfferIncomplete ).exec( function afterwards( err, updated ) {} );
 						}
						Screentracking.findOne( { id: newscreenid } )
						.then( ( screentracking ) => {
							// Screentracking.saveLoanOfferData( userId,newscreenid,offerid, "" )
							// .then(function(responseDetails) {
							if( apr ) {
								return Screentracking.createOffer( screentracking, false, downpayment, loanamount, apr, term, tier );
							} else {
								return Screentracking.getOffers( screentracking, false, downpayment, loanamount );
							}
						} )
						.then( ( screentracking ) => {
							const screenupdate = { offerdata: [ screentracking.offers[ offerid ] ] };
							return Screentracking.update( { id: newscreenid }, screenupdate )
							.then( () => {
								EmailService.sendNewOfferDetails( newscreenid );
								req.session.newLoanupdateSuccessMsg	= "New loan details has been updated.";
								//Log Activity
								if(apr){
									//Custom counter offer
									var oldLoanAmount = loandetails.screentracking.offerdata[0].financedAmount + loandetails.screentracking.offerdata[0].downPayment;
									var modulename = 'Custom counter offer made from incomplete application';
									var modulemessage = 'Application offer has been changed (with old loan amount of $' + oldLoanAmount + ' and down payment of $' 
										+ loandetails.screentracking.offerdata[0].downPayment + ', and new loan amount of $' + loanamount + ', down payment of $' + downpayment 
										+ ', APR of ' + apr + '%, ' + term + ' terms, and tier ' + tier + ')';
								}else{
									var oldLoanAmount = loandetails.screentracking.offerdata[0].financedAmount + loandetails.screentracking.offerdata[0].downPayment;
									var modulename = 'Counter offer made from incomplete application';
									var modulemessage = 'Application offer has been changed (with old loan amount of $' + oldLoanAmount + ' and down payment of $' 
										+ loandetails.screentracking.offerdata[0].downPayment + ', and new loan amount of $' + loanamount + ' and down payment of $' + downpayment + ')';
								}

								req.achlog = 1;
								req.payID= paymentid;
								req.logdata=loandetails;
								Logactivity.registerLogActivity( req, modulename, modulemessage );
								var json = {
									status: 200,
									message: 'New loan details has been updated.',
									pagename: "getIncompleteApplicationDetails"
								};
								res.contentType('application/json');
								res.json(json);
							} );
						} ).catch( function ( err ) {
							req.session.newLoanupdateMsg = "Something went wrong. please try again.";
							var json = {
								status: 400,
								message: 'Something went wrong. please try again.',
								pagename: pagename
							};
							res.contentType('application/json');
							res.json(json);
						} );
					} ).catch( function ( err ) {
						req.session.newLoanupdateMsg = "Unable to change new loan amount.";
						var json = {
							status: 400,
							message:'Unable to change new loan amount.',
							pagename:pagename
						};
						res.contentType('application/json');
						res.json(json);
					} );
				} ).catch( function ( err ) {
					req.session.newLoanupdateMsg	=	"Unable to fetch paymentmanagement details.";
					var json = {
						status: 400,
						message:'Unable to fetch paymentmanagement details.',
						pagename: pagename
					};
					res.contentType('application/json');
					res.json(json);
				});
		   	}).catch(function (err) {
				req.session.newLoanupdateMsg	=	"Something went wrong. please try again.";
				var json = {
					status: 400,
					message:'Something went wrong. please try again.',
					pagename:pagename
				};
				res.contentType('application/json');
				res.json(json);
			});
		} else if( loanstatus == '1' || ( loanstatus == "0" && lastlevel == 5 ) ) { // pending path
			var paycriteria	= { screentracking: screenid };
			return PaymentManagement.findOne( paycriteria )
			.then( function( PaymentManagementdata ) {
  				var paymentdebitCount	=	PaymentManagementdata.usertransactions.length;
				var oldachstatus		=	PaymentManagementdata.achstatus;
 				if( paymentdebitCount > 0 ) {
					req.session.newLoanupdateMsg	=	"Loan already funded.";
					var json = {
						status: 400,
						message:'Loan already funded.',
						pagename:pagename
					};
					res.contentType('application/json');
					res.json(json);
				}
				PaymentManagementdata.achstatus			=	2;
				PaymentManagementdata.isPaymentActive 	=	false;
				PaymentManagementdata.status = "DENIED";
				PaymentManagementdata.declinereason		=	"This application has been declined, due to loan amount change!";
				delete PaymentManagementdata.screentracking;

				return PaymentManagementdata.save(function (err) {
					PaymentManagement.findOne( { screentracking: screenid } )
					.populate( "screentracking" )
					.populate( "user" )
					.then( function( loandetails ) {
						var paymentid = loandetails.id;
						loandetails.screentracking.changeIncomePage = "Incomplete";
						//creates new screentracking
						return Screentracking.changenewloanincomecreate( loandetails.screentracking, userincome, loanamount, balanceamount, paymentid, loandetails.user, true )
						.then( function( screenTrackingdetailsnew ) {
							var	newscreenid	=	screenTrackingdetailsnew.newscreenTracking.id;
							if( screenTrackingdetailsnew.code == 200 ) {
								var counterOfferIncomplete = {counterOfferIncomplete:'Counter-Offered Incomplete'};
								Screentracking.update( { id: newscreenid }, counterOfferIncomplete ).exec(function afterwards(err, updated){});
							}
							return Screentracking.findOne( { id: newscreenid } )
							.then( ( screentracking ) => {
								if( apr ) {
									return Screentracking.createOffer( screentracking, false, downpayment, loanamount, apr, term, tier );
								} else {
									return Screentracking.getOffers( screentracking, false, downpayment, loanamount );
								}
							} )
							.then( ( screentracking ) => {
								const screenupdate = { offerdata: [ screentracking.offers[ offerid ] ] };
								return Screentracking.update( { id: newscreenid }, screenupdate )
								.then( () => {
									EmailService.sendNewOfferDetails( newscreenid );
									req.session.newLoanupdateSuccessMsg	=	"New loan details has been updated.";						
									//Log Activity
									if(apr){
										//Custom counter offer
										var oldLoanAmount = loandetails.screentracking.offerdata[0].financedAmount + loandetails.screentracking.offerdata[0].downPayment;
										var modulename = 'Custom counter offer made from funded application';
										var modulemessage = 'Application offer has been changed (with old loan amount of $' + oldLoanAmount + ' and down payment of $' 
											+ loandetails.screentracking.offerdata[0].downPayment + ', and new loan amount of $' + loanamount + ', down payment of $' + downpayment 
											+ ', APR of ' + apr + '%, ' + term + ' terms, and tier ' + tier + ')';
									}else{
										var oldLoanAmount = loandetails.screentracking.offerdata[0].financedAmount + loandetails.screentracking.offerdata[0].downPayment;
										var modulename = 'Counter offer made from funded application';
										var modulemessage = 'Application offer has been changed (with old loan amount of $' + oldLoanAmount + ' and down payment of $' 
											+ loandetails.screentracking.offerdata[0].downPayment + ', and new loan amount of $' + loanamount + ' and down payment of $' + downpayment + ')';
									}

									req.achlog = 1;
									req.payID= paymentid;
									req.logdata=loandetails;
									Logactivity.registerLogActivity( req, modulename, modulemessage );
									var json = {
										status: 200,
										message: 'New loan details has been updated.',
										pagename: "getIncompleteApplicationDetails"
									};
									res.contentType('application/json');
									res.json(json);
								} );
							}).catch(function (err) {
								req.session.newLoanupdateMsg	=	"Something went wrong. please try again.";
								var json = {
									status: 400,
									message:'Something went wrong. please try again.',
									pagename:pagename
								};
								res.contentType('application/json');
								res.json(json);
							});
						}).catch(function (err) {
							req.session.newLoanupdateMsg	=	"Unable to fetch paymentmanagement details.";
							var json = {
								status: 400,
								message:'Unable to fetch paymentmanagement details.',
								pagename:pagename
							};
							res.contentType('application/json');
							res.json(json);
						});
					}).catch(function (err) {
						req.session.newLoanupdateMsg	=	"Unable to fetch paymentmanagement details.";
						var json = {
							status: 400,
							message:'Unable to fetch paymentmanagement details.',
							pagename:pagename
						};
						res.contentType('application/json');
						res.json(json);
					});
				});
			}).catch(function (err) {
				req.session.newLoanupdateMsg	=	"Unable to fetch paymentmanagement details.";
				var json = {
					status: 400,
					message:'Unable to fetch paymentmanagement details.',
					pagename:pagename
				};
				res.contentType('application/json');
				res.json(json);
			});
  		} else {
			req.session.newLoanupdateMsg = "Invalid incomplete option.";
			var json = {
				status: 400,
				message:'Invalid incomplete option.',
				pagename:pagename
			};
			res.contentType('application/json');
			res.json(json);
		}
	} ).catch( function ( err ) {
		req.session.newLoanupdateMsg = "Invalid incomplete details.";
		var json = {
			status: 400,
			message: 'Invalid incomplete details.',
			pagename: pagename
		};
		res.contentType( 'application/json' );
		res.json( json );
	} );
}

function manualLoanOfferDetailsAction(req,res)
{
	var	manualincome			=	req.param('manualincome');
	var	looprequestedloanamount	=	req.param('manualloanAmount');
	var	interestrate			=	req.param('manualApr');
	var	loanmonth				=	req.param('manualTerm');
	var	screenid				=	req.param('screenId');
	var	rtype					=	req.param('requesttype');
	var	pagename				=	req.param('pagename');
	var	oldamount				=	req.param('oldamount');

	if(rtype=='view')
	{
		var incomeamount 	= 	req.param('manualincome');
		var	loan_amount		=	req.param('manualloanAmount');

 		incomeamount 		= 	incomeamount.replace("$", "");
		incomeamount 		= 	incomeamount.replace(/,/g, "");
		incomeamount 		= 	incomeamount.replace(" ", "");

		loan_amount 		= 	loan_amount.replace("$", "");
		loan_amount 		= 	loan_amount.replace(/,/g, "");
		loan_amount 		= 	loan_amount.replace(" ", "");

 		var minimumIncomePlaid = sails.config.plaid.minincomeamount;
		var minrequestedamount =  sails.config.plaid.minrequestedamount;

		if((incomeamount < minimumIncomePlaid) && (sails.config.plaid.minimumIncomePlaidStatus == true))
		{
			var json = {
				status  : 400,
				listdata : 'Income amount should be greater than $'+sails.config.plaid.minincomeamount
			};
			res.contentType('application/json');
			return res.json(json);
		}
		else if(loan_amount < minrequestedamount)
		{
			var json = {
				status  : 400,
				listdata : 'Loan amount should be greater than $'+minrequestedamount
			};
			res.contentType('application/json');
			return res.json(json);
		}
		else if(loan_amount > oldamount && req.user.rolename != 'Admin' && req.user.rolename != 'PracticeAdmin' )
		{
			var json = {
				status  : 400,
				message : 'Loan amount should not be greater than old loan amount'
			};
			res.contentType('application/json');
			return res.json(json);
		}

		//-- Added for preDTI calclation starts here
		Screentracking
	    .findOne({id:screenid})
	    .then(function (userAccountres){

			//--Added for ticket no 2872
			var formData = {manualincome:manualincome,looprequestedloanamount:looprequestedloanamount,interestrate:interestrate,loanmonth:loanmonth,screenid:screenid,rtype:rtype,pagename:pagename,consolidateaccount:userAccountres.consolidateaccount,practiceId:userAccountres.practicemanagement};
			Screentracking.calculateMonthlyPayment(formData,res,rtype).then(function (response) {

				if(response.code==200)
				{
					res.render("admin/screentracking/manualLoanOfferDetails" , {offerData:response.offerData}, function(err, listdata){
						var json = {
							status: 200,
							message:'Change loan offer details available',
							listdata: listdata
						};
						res.contentType('application/json');
						return res.json(json);
					});
				}
				else
				{
					var maxPreDTI = sails.config.plaid.maxPreDTI;
					var json = {
						status  : 400,
						message : 'Your preDTI value should be less than '+maxPreDTI
					};
					res.contentType('application/json');
					return res.json(json);
				}
			});
		}).catch(function (err) {

			var json = {
				status  : 400,
				message : 'Invalid details'
			};
			res.contentType('application/json');
			return res.json(json);
		});
		//-- Added for preDTI calclation ends here
	}
	else
	{
		var json = {
			status  : 400,
			message : 'Invalid request'
		};
		res.contentType('application/json');
		return res.json(json);
	}
}

function savemanualLoanOfferDetailsAction(req,res)
{
	var	manualincome			=	req.param('manualincome');
	var	looprequestedloanamount	=	req.param('manualloanAmount');
	var	interestrate			=	req.param('manualApr');
	var	loanmonth				=	req.param('manualTerm');
	var	screenid				=	req.param('screenId');
	var	rtype					=	req.param('requesttype');
	var	pagename				=	req.param('pagename');
	var	incomeamount			=	manualincome;
	var	requestedLoanAmount		=	looprequestedloanamount;

	var criteria 				= 	{ id:screenid };
	var balanceamount 			=	0;
	Screentracking
	.findOne(criteria)
	.populate('user')
	.then(function (userAccountres) {
		var dataObject 	= 	{adminofferchange:1};
		var product 	= 	{product : userAccountres.product};
		var	userId		=	userAccountres.user.id;
		var userDetail 	= 	userAccountres.user;
		var loanstatus	=	userAccountres.iscompleted;

		if(loanstatus=='0')
		{
			//Incomplete with offer has n't selected.
			var lastScreenName	=	userAccountres.lastScreenName;
			var lastlevel 		=	userAccountres.lastlevel;
			var idobj =	{
				transid : userAccountres.transunion,
				accountid:'',
				rulesDetails: userAccountres.rulesDetails,
				creditscore: userAccountres.creditscore
			}
			Screentracking
			.updatedeclinedloan(lastScreenName,lastlevel,userDetail,dataObject,product,idobj)
			.then(function(screenTracking) {
				var criteria	=	{ screentracking: screenTracking.screenId };
				PaymentManagement
				.findOne(criteria)
				.populate('screentracking')
				.populate('user')
				.then(function(loandetails) {
					var paymentid = loandetails.id;
					loandetails.screentracking.changeIncomePage 	=	"Incomplete";
					loandetails.screentracking.loanchangeManually	=	"1";
					Screentracking
					.changenewloanincomecreate(loandetails.screentracking,incomeamount,requestedLoanAmount,balanceamount,paymentid,loandetails.user, false )
					.then(function(screenTrackingdetailsnew) {
						var	newscreenid	=	screenTrackingdetailsnew.newscreenTracking.id;
						if(screenTrackingdetailsnew.code==200) {
 							var counterOfferIncomplete = {counterOfferIncomplete:'Counter-Offered Incomplete'};
							Screentracking.update({id: newscreenid}, counterOfferIncomplete).exec(function afterwards(err, updated){});

							//--Added for ticket no 2872
							var formData = {manualincome:manualincome,looprequestedloanamount:looprequestedloanamount,interestrate:interestrate,loanmonth:loanmonth,screenid:screenid,rtype:rtype,pagename:pagename,userid:userId,consolidateaccount:userAccountres.consolidateaccount,practiceId:userAccountres.practicemanagement};
							Screentracking.calculateMonthlyPayment(formData,res,rtype).then(function (response) {
								if(response.code==200)
								{
									EmailService.sendNewOfferDetails(newscreenid);
									req.session.newLoanupdateSuccessMsg	=	"New loan details has been updated.";

									//Log Activity
									var modulename = 'Application offer changed from incomplete';
									var modulemessage = 'Application offer changed from incomplete  & loan denied';
									req.achlog = 1;
									req.payID= paymentid;
									req.logdata=loandetails;

									Logactivity.registerLogActivity(req,modulename,modulemessage);

									var json = {
										status: 200,
										message:'New loan details has been updated.',
										pagename:pagename
									};
									res.contentType('application/json');
									res.json(json);
								}
								else
								{
									sails.log.error("savemanualLoanOfferDetailsAction###calculateMonthlyPayment::", err);
									req.session.newLoanupdateMsg	=	"Something went wrong. please try again.";
									var json = {
										status: 400,
										message:'Something went wrong. please try again.',
										pagename:pagename
									};
									res.contentType('application/json');
									res.json(json);
								}
							}).catch(function (err) {
								sails.log.error("savemanualLoanOfferDetailsAction###calculateMonthlyPayment code section::", err);
								req.session.newLoanupdateMsg	=	"Something went wrong. please try again.";
								var json = {
									status: 400,
									message:'Something went wrong. please try again.',
									pagename:pagename
								};
								res.contentType('application/json');
								res.json(json);
							});
 						}

					}).catch(function (err) {
						req.session.newLoanupdateMsg	=	"Unable to change new loan amount.";
						var json = {
							status: 400,
							message:'Unable to change new loan amount.',
							pagename:pagename
						};
						res.contentType('application/json');
						res.json(json);
					});
				}).catch(function (err) {
					req.session.newLoanupdateMsg	=	"Unable to fetch paymentmanagement details.";
					var json = {
						status: 400,
						message:'Unable to fetch paymentmanagement details.',
						pagename:pagename
					};
					res.contentType('application/json');
					res.json(json);
				});
			}).catch(function (err) {
				req.session.newLoanupdateMsg	=	"Something went wrong. please try again.";
				var json = {
					status: 400,
					message:'Something went wrong. please try again.',
					pagename:pagename
				};
				res.contentType('application/json');
				res.json(json);
			});
		}
		else if(loanstatus=='1' && pagename == 'showAllDenied')
		{
			sails.log.info("Inside denied application");
			//Denied Application
			var criteria	=	{ screentracking: screenid };
			PaymentManagement
			.findOne(criteria)
			.populate('screentracking')
			.populate('user')
			.then(function(loandetails) {
				var paymentid = loandetails.id;
				loandetails.screentracking.changeIncomePage = "Incomplete";
				loandetails.screentracking.loanchangeManually	=	"1";
				Screentracking
				.changenewloanincomecreate(loandetails.screentracking,incomeamount,requestedLoanAmount,balanceamount,paymentid,loandetails.user, false)
				.then(function(screenTrackingdetailsnew) {
					var	newscreenid	=	screenTrackingdetailsnew.newscreenTracking.id;
					if(screenTrackingdetailsnew.code==200) {
						var counterOfferIncomplete = {counterOfferIncomplete:'Counter-Offered Incomplete'};
						Screentracking.update({id: newscreenid}, counterOfferIncomplete).exec(function afterwards(err, updated){});

						//--Added for ticket no 2872
						var formData = {manualincome:manualincome,looprequestedloanamount:looprequestedloanamount,interestrate:interestrate,loanmonth:loanmonth,screenid:screenid,rtype:rtype,pagename:pagename,userid:userId,consolidateaccount:userAccountres.consolidateaccount,practiceId:userAccountres.practicemanagement};
						Screentracking.calculateMonthlyPayment(formData,res,rtype).then(function (response) {
							sails.log.info('newscreenid:::::::', newscreenid);
							sails.log.info('screenTrackingdetailsnew:::::::', screenTrackingdetailsnew);
							EmailService.sendNewOfferDetails(newscreenid);
							req.session.newLoanupdateSuccessMsg	=	"New loan details has been updated.";

							//Log Activity
							var modulename = 'Application offer changed from denied application';
							var modulemessage = 'Application offer changed from denied application';
							req.achlog = 1;
							req.payID= paymentid;
							req.logdata=loandetails;

							Logactivity.registerLogActivity(req,modulename,modulemessage);

							var json = {
								status: 200,
								message:'New loan details has been updated.',
								pagename:pagename
							};
							res.contentType('application/json');
							res.json(json);
						}).catch(function (err) {
							sails.log.error("savemanualLoanOfferDetailsAction###calculateMonthlyPayment code section::", err);
							req.session.newLoanupdateMsg	=	"Something went wrong. please try again.";
							var json = {
								status: 400,
								message:'Something went wrong. please try again.',
								pagename:pagename
							};
							res.contentType('application/json');
							res.json(json);
						});
					}
 				}).catch(function (err) {
					req.session.newLoanupdateMsg	=	"Unable to fetch paymentmanagement details.";
					var json = {
						status: 400,
						message:'Unable to fetch paymentmanagement details.',
						pagename:pagename
					};
					res.contentType('application/json');
					res.json(json);
				});
			}).catch(function (err) {
				req.session.newLoanupdateMsg	=	"Unable to fetch paymentmanagement details.";
				var json = {
					status: 400,
					message:'Unable to fetch paymentmanagement details.',
					pagename:pagename
				};
				res.contentType('application/json');
				res.json(json);
			});
 		}
		/*else if(loanstatus=='1' && pagename == 'showAllComplete')
		{
			//Funded Application
			req.session.newLoanupdateMsg	=	"Loan already funded.";
			var json = {
				status: 400,
				message:'Loan already funded.',
				pagename:pagename
			};
			res.contentType('application/json');
			res.json(json);
		}*/
		else if(loanstatus == '1' || loanstatus=='2')
		{
			sails.log.info("Inside incomplete email not verify scenario or pending");
			// 1 -- Pending application
			// 2 -- Email not verified (Incomplete)
			//Incomplete email not verify scenario and pending application.
			var paycriteria	=	{screentracking: screenid};
			PaymentManagement
			.findOne(paycriteria)
			.then(function(PaymentManagementdata) {

				var paymentdebitCount	=	PaymentManagementdata.usertransactions.length;
				var oldachstatus		=	PaymentManagementdata.achstatus;
 				if(paymentdebitCount>0)
				{
					req.session.newLoanupdateMsg	=	"Loan already funded.";
					var json = {
						status: 400,
						message:'Loan already funded.',
						pagename:pagename
					};
					res.contentType('application/json');
					res.json(json);
				}
				else
				{
					PaymentManagementdata.achstatus			=	2;
					PaymentManagementdata.isPaymentActive 	=	false;
					PaymentManagementdata.declinereason		=	"This application has been declined, due to loan amount change manually!";
					PaymentManagementdata.save(function (err) {
						Story
						.findOne({ id: PaymentManagementdata.story	})
						.then(function(storydata){
							storydata.status = Story.STATUS_DECLINED;
							storydata.save(function(err) {
								//EmailService.sendDenyLoanMail(userAccountres.user,PaymentManagementdata);
								var criteria	=	{ screentracking: screenid };
								PaymentManagement
								.findOne(criteria)
								.populate('screentracking')
								.populate('user')
								.then(function(loandetails) {
									var paymentid = loandetails.id;
									loandetails.screentracking.changeIncomePage = "Incomplete";
									loandetails.screentracking.loanchangeManually	=	"1";
									Screentracking
									.changenewloanincomecreate(loandetails.screentracking,incomeamount,requestedLoanAmount,balanceamount,paymentid,loandetails.user, false)
									.then(function(screenTrackingdetailsnew) {
										var	newscreenid	=	screenTrackingdetailsnew.newscreenTracking.id;
										if(screenTrackingdetailsnew.code==200) {
											var counterOfferIncomplete = {counterOfferIncomplete:'Counter-Offered Incomplete'};
											Screentracking.update({id: newscreenid}, counterOfferIncomplete).exec(function afterwards(err, updated){});

											//--Added for ticket no 2872
											var formData = {manualincome:manualincome,looprequestedloanamount:looprequestedloanamount,interestrate:interestrate,loanmonth:loanmonth,screenid:screenid,rtype:rtype,pagename:pagename,userid:userId,consolidateaccount:userAccountres.consolidateaccount,practiceId:userAccountres.practicemanagement};
											Screentracking.calculateMonthlyPayment(formData,res,rtype).then(function (response) {

												sails.log.info('newscreenid:::::::', newscreenid);
												sails.log.info('screenTrackingdetailsnew:::::::', screenTrackingdetailsnew);
												EmailService.sendNewOfferDetails(newscreenid);
												req.session.newLoanupdateSuccessMsg	=	"New loan details has been updated.";

												if(loanstatus=='2')
												{
													//Screentracking.update({id: newscreenid}, {iscompleted: 2}).exec(function afterwards(err, updated){});
												}

												//Log Activity
												if(loanstatus == '2' )
												{
													var modulename = 'Application offer changed from incomplete application';
													var modulemessage = 'Application offer changed from incomplete application(Email unverified) and loan denied';
												}
												else if(loanstatus == '1' && oldachstatus == 1 )
												{
													var modulename = 'Application offer changed from funded application';
													var modulemessage = 'Application offer changed from funded application and loan denied';
												}
												else
												{
													var modulename = 'Application offer changed from pending application';
													var modulemessage = 'Application offer changed from pending application';
												}
												req.achlog = 1;
												req.payID= paymentid;
												req.logdata=loandetails;

												Logactivity.registerLogActivity(req,modulename,modulemessage);

												var json = {
													status: 200,
													message:'New loan details has been updated.',
													pagename:pagename
												};
												res.contentType('application/json');
												res.json(json);
											});
										}
									}).catch(function (err) {
										sails.log.error("savemanualLoanOfferDetailsAction###changenewloanincomecreate1 ::", err);
										req.session.newLoanupdateMsg	=	"Unable to fetch paymentmanagement details.";
										var json = {
											status: 400,
											message:'Unable to fetch paymentmanagement details.',
											pagename:pagename
										};
										res.contentType('application/json');
										res.json(json);
									});
								}).catch(function (err) {
									sails.log.error("savemanualLoanOfferDetailsAction###changenewloanincomecreate2 ::", err);
									req.session.newLoanupdateMsg	=	"Unable to fetch paymentmanagement details.";
									var json = {
										status: 400,
										message:'Unable to fetch paymentmanagement details.',
										pagename:pagename
									};
									res.contentType('application/json');
									res.json(json);
								});
							});
						}).catch(function (err) {
							req.session.newLoanupdateMsg	=	"Unable to fetch story details.";
							var json = {
								status: 400,
								message:'Unable to fetch story details.',
								pagename:pagename
							};
							res.contentType('application/json');
							res.json(json);
						});
					});
				}
			}).catch(function (err) {
				sails.log.error("savemanualLoanOfferDetailsAction###changenewloanincomecreate3 ::", err);
				req.session.newLoanupdateMsg	=	"Unable to fetch paymentmanagement details.";
				var json = {
					status: 400,
					message:'Unable to fetch paymentmanagement details.',
					pagename:pagename
				};
				res.contentType('application/json');
				res.json(json);
			});
  		}

		else
		{
			req.session.newLoanupdateMsg	=	"Invalid incomplete option.";
			var json = {

				status: 400,
				message:'Invalid incomplete option.',
				pagename:pagename
			};
			res.contentType('application/json');
			res.json(json);
		}
	});
}

function movetoincompleteupdateAction(req,res)
{
	var screenID		= 	req.param('screenID');
	var screenCriteria	=	{id: screenID};

    Screentracking.findOne(screenCriteria)
	.then(function(ScreentrackingData){

		ScreentrackingData.moveToIncomplete = 1;
		ScreentrackingData.save(function (err) {
			if (err) {
				var json = {
					status: 400,
					message:"Unable to Update Incomplete loan. Try again!"
				};
				res.contentType('application/json');
				res.json(json);
			}
			else{
				var modulename = 'Application moved from archive to open';
				var modulemessage = 'Application moved from archive to open.';
				req.achlog = 1;
				//req.payID= screenID;
				req.logdata=ScreentrackingData;
				Logactivity.registerLogActivity(req,modulename,modulemessage);
				var json = {
					status:200,
					message:'Application moved to successfully.'
				};
				res.contentType('application/json');
				res.json(json);
			}
		})
	})
}

function markToIncompleteAppAction(req,res)
{
	var screenID		= 	req.param('screenID');
	var screenCriteria	=	{id: screenID};

	Screentracking.findOne(screenCriteria)
	.then(function(ScreentrackingData){

		ScreentrackingData.incompleteverified = 1;
		ScreentrackingData.save(function (err) {
			if (err) {
				var json = {
					status: 400,
					message:"Unable to Update Incomplete loan. Try again!"
				};
				res.contentType('application/json');
				res.json(json);
			}
			else{
				var modulename = 'Incomplete Application reviewed';
				var modulemessage = 'Incomplete Application reviewed.';
				req.achlog = 1;
				//req.payID= screenID;
				req.logdata=ScreentrackingData;
				Logactivity.registerLogActivity(req,modulename,modulemessage);
				var json = {
					status:200,
					message:'Application marked as complete successfully.'
				};
				res.contentType('application/json');
				res.json(json);
			}
		})
	})
}

function movetoarchiveAction( req, res ) {
	const screenId = req.param( "screenId" );

	Screentracking.findOne( { id: screenId } )
	.then( ( screenData ) => {
		screenData.moveToArchive = 1;
		screenData.save( (err) => {
			if( err ) {
				req.session.approveerror = 'Unable to archive the application. Try again!';
				var json = {
					status: 400,
					message: "Unable to unarchive the application. Try again!"
				};
				res.contentType( "application/json" );
				res.json( json );
			} else {
				PaymentManagement.findOne( { screentracking: screenId } )
				.populate('user')
				.then( ( payData ) => {
					if( payData ) {
						payData.moveToArchive = 1;
						payData.status = "ARCHIVED";
						payData.save( ( err ) => {
							var type;
							if( payData.achstatus == 2 ) {
								type = "Denied";
							} else if( payData.achstatus == 1 ) {
								type = "Approved";
							} else {
								type = "Open";
							}
							req.session.successmsg = "Application archived successfully";
							var modulename = "Application moved to archive from " + type + " application";
							var modulemessage =	"Application moved to archive from " + type + " application";
							req.achlog = 1;
							req.payID =	payData.id;
							req.logdata = screenData;
							Logactivity.screenTrackingLogActivity( req, modulename, modulemessage, screenId );
							var json = {
								status: 200,
								message: "Application archived successfully."
							};
							res.contentType( "application/json" );
							res.json( json );
					   });
					} else {
						req.session.successmsg = "Application archived successfully";
						var modulename = "Application moved to archive from Open application";
						var modulemessage =	"Application moved to archive from Open application";
						req.achlog = 1;
						req.logdata = screenData;
						Logactivity.screenTrackingLogActivity( req, modulename, modulemessage, screenId );
						var json = {
							status: 200,
							message: "Application archived successfully."
						};
						res.contentType( "application/json" );
						res.json( json );
					}
				});
			}
		})
	})
}

function unarchiveAction(req,res)
{
	var screenId	= 	req.param('screenID');
	var Criteria	=	{id: screenId};
	Screentracking.findOne(Criteria)
	.then(function(screenData){
		screenData.moveToArchive = 0;
		screenData.save(function (err) {
			if (err) {
				req.session.approveerror	=	'Unable to unarchive the application. Try again!';
				var json = {
					status: 400,
					message:"Unable to unarchive the application. Try again!"
				};
				res.contentType('application/json');
				res.json(json);
			}
			else
			{
				var paycriteria={screentracking: screenId};
				PaymentManagement.findOne(paycriteria)
				.then(function(payData){

					if(payData)
					{
						payData.moveToArchive = 0;
						payData.status = "OPENED";
						payData.save(function (err) {

							var type;
							if(payData.achstatus==2)
							{
								type='Denied';
							}
							else if(payData.achstatus==1)
							{
								type='Approved';
							}
							else
							{
								type='Open';
							}
							req.session.successmsg	='Application unarchived successfully';
							var modulename		=	'Application moved to '+type+' application from archive';
							var modulemessage 	=	'Application moved to '+type+' application from archive';
							req.achlog 			=	1;
							req.payID			=	payData.id;
							req.logdata=screenData;
							Logactivity.registerLogActivity(req,modulename,modulemessage);
							var json = {
								status:200,
								message:'Application unarchived successfully.'
							};
							res.contentType('application/json');
							res.json(json);
					   });
					}
					else
					{
						    req.session.successmsg	='Application unarchived successfully';
							var modulename		=	'Application moved to open application from archive';
							var modulemessage 	=	'Application moved to open application from archive';
							req.achlog 			=	1;
							req.logdata=screenData;
							Logactivity.registerLogActivity(req,modulename,modulemessage);
							var json = {
								status:200,
								message:'Application unarchived successfully.'
							};
							res.contentType('application/json');
							res.json(json);
					}
				});
			}
		})
	})
}
