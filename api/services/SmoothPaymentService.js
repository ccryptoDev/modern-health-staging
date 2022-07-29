"use strict";

process.env.tz = "UTC";

const z = require("zebras");
const moment = require("moment");
const _ = require("lodash");

const MathExt = require("./MathExt");
const Holidays = require("date-holidays");
const hd = new Holidays();
hd.init("US");
Number.prototype.__toFixed = Number.prototype.toFixed;
Number.prototype.toFixed = function (precision) {
	return (this + 0.0000001).__toFixed(precision);
};
const decisionCloudPeriodicity = {
	BI_WEEKLY: "B",
	MONTHLY: "M",
	SEMI_MONTHLY: "S",
	WEEKLY: "W"
};

const np = {
	pmt: (ir, np, pv) => {
		return ir * pv * Math.pow((1 + ir), np) / (1 - Math.pow((1 + ir), np));
	}
};

const pd = {
	DataFrame: (b, columns) => {
		const df = [];
		b.forEach((item, rowIdx) => {
			const dfRow = {};
			item.forEach((val, colIdx) => {
				dfRow[columns[colIdx]] = val;
			});
			df.push(dfRow);
		});
		df.columns = columns;
		return df;
	}
};

const datetime = {
	datetime: {
		strptime: (dt, format) => {
			// format = format.replace( "%Y", "YYYY" ).replace( "%m", "MM" ).replace( "%d", "DD" ); // %Y-%m-%d
			return moment(dt).toDate();
		}
	}
};

String.prototype.format = function (val) {
	val = parseFloat(val).toFixed(3);
	return `${val}%`;
};

function round(val, precision) {
	const pow = Math.pow(10, precision);
	return (Math.round(val * pow) / pow);
	// var s = Math.pow(10, precision || 0);
	// sails.log.error("rounding: " +Math.trunc(s * val) / s);
	// return Math.trunc(s * val) / s;
	// return parseInt( (val * 100).toFixed(0)) / 100;
}

module.exports = {
	generatePaymentSchedule: equal_payment_total_apr,
	reExtendPaymentSchedule: equal_payment_extend_loan,
	generatePaymentScheduleAdjustedPayment: generatePaymentScheduleAdjustedPayment,
	getBusinessDateBasedOnBankDays: getBusinessDateBasedOnBankDays,
	getIncomePayFrequency: getIncomePayFrequency,
	getIncomePayFrequencies: getIncomePayFrequencies,
	getHolidayDates: getHolidayDates,
	getNextPaymentDateScheduleByMonths: getNextPaymentDateScheduleByMonths,
	generatePastDuePaymentSchedule: generatePastDuePaymentSchedule,

	determinePaymentAmount: determinePaymentAmount,
	getCycleDaysInFrequency: getCycleDaysInFrequency,
	determineFirstPaymentScheduleFromEmploymentPayDates: determineFirstPaymentScheduleFromEmploymentPayDates,
	paymentFrequencyEnum: decisionCloudPeriodicity
};
function getCycleDaysInFrequency(frequency) {
	switch (frequency) {
		case decisionCloudPeriodicity.WEEKLY:
			return 7;
		case decisionCloudPeriodicity.SEMI_MONTHLY:
			return 15;
		case decisionCloudPeriodicity.MONTHLY:
			return 30;
		case decisionCloudPeriodicity.BI_WEEKLY:
		default:
			return 14;
	}
}
function determinePaymentAmount(frequency, apr, numberOfPayments, amount) {
	let cycleDays = 14;

	switch (frequency) {
		case decisionCloudPeriodicity.WEEKLY:
			cycleDays = 7;
			break;
		case decisionCloudPeriodicity.SEMI_MONTHLY:
			cycleDays = 15;
			break;
		case decisionCloudPeriodicity.MONTHLY:
			cycleDays = 30;
			break;
		case decisionCloudPeriodicity.BI_WEEKLY:
		default:
			cycleDays = 14;
			break;
	}
	const dailyRate = (apr / 100) / 365;
	//
	// return  Math.abs( np.pmt( dailyRate * cycleDays, numberOfPayments, amount ) );
	const monthlyRate = apr / 1200;
	let monthlyPayment = Math.round((monthlyRate * amount) / (1 - Math.pow((1 + monthlyRate), (-numberOfPayments))) * 100) / 100;
	if (monthlyRate === 0) {
		monthlyPayment = amount / loanTerm;
	}
	sails.log.error("=====================rate: " + (monthlyPayment) + " our way: " + Math.abs(np.pmt(dailyRate * cycleDays, numberOfPayments, amount)))
	return Math.abs(np.pmt(dailyRate * cycleDays, numberOfPayments, amount));// (monthlyPayment/(365/12)) * cycleDays;
}
function equal_payment_total_apr(Orig_date, scheduled_date, beg_balance, pay_cycle, method, apr, numberOfPayments, scheduleIdSequenceCounter = 1, placeDateAfterHoliday = false, interestBalance = 0) {
	return new Promise((resolve, reject) => {
		try {
			let days_cycle;
			let pmt_num = numberOfPayments;
			let sche_pmt;
			let b;
			let column;
			let column_order;
			let index_end_bal;
			if (pay_cycle === decisionCloudPeriodicity.MONTHLY) {
				days_cycle = 30;
			} else if (pay_cycle === decisionCloudPeriodicity.SEMI_MONTHLY) {
				days_cycle = 15;
			} else if (pay_cycle === decisionCloudPeriodicity.BI_WEEKLY) {
				days_cycle = 14;
			} else if (pay_cycle === decisionCloudPeriodicity.WEEKLY) {
				days_cycle = 7;
			}


			console.log("apr: " + apr);
			sche_pmt = Math.abs(np.pmt((apr / 365) * days_cycle, numberOfPayments, beg_balance));
			console.log("projected sche_pmt: " + sche_pmt);

			// ##### give minimum scheduled payment
			column = ['Pay_id', 'Scheduled_date', 'Scheduled_paid', 'Interest_pmt', 'Principal_pmt', 'Beg_balance', 'End_balance', 'startAccruedDate',
				'endAccruedDate', 'Scheduled_days_cycle', 'Rate_in_cycle', 'accruedPrincipal', 'periodAccruedInterest',
				'forgivableInterest', 'remainingInterest', 'remainingPrincipal', 'chargedAccruedInterest', 'forgivenInterest', 'appliedAccruedInterest', 'appliedRemainingInterest', 'appliedRemainingPrincipal', 'appliedScheduledPrincipal', 'appliedForgivenInterest', 'appliedDeferredAmount', 'deferredAmount', 'scheduleIdSequenceCounter'];
			column_order = ['Pay_id', 'Scheduled_date', 'Scheduled_paid', 'Interest_pmt', 'Principal_pmt', 'Beg_balance', 'End_balance', 'startAccruedDate',
				'endAccruedDate', 'Scheduled_days_cycle', 'Rate_in_cycle', 'accruedPrincipal', 'periodAccruedInterest',
				'forgivableInterest', 'remainingInterest', 'remainingPrincipal', 'chargedAccruedInterest', 'forgivenInterest', 'appliedAccruedInterest', 'appliedRemainingInterest', 'appliedRemainingPrincipal', 'appliedScheduledPrincipal', 'appliedForgivenInterest', 'appliedDeferredAmount', 'deferredAmount', 'scheduleIdSequenceCounter'];
			index_end_bal = column.indexOf('End_balance');


			let endBalance = equal_payment_daily_based(Orig_date, scheduled_date, beg_balance, sche_pmt, pay_cycle, pmt_num, apr, scheduleIdSequenceCounter, placeDateAfterHoliday, interestBalance)[pmt_num - 1][index_end_bal];
			let oldSchedPmt = sche_pmt;
			let isSatisifed = false;
			while (!isSatisifed) {
				if (endBalance < 0) {
					sche_pmt -= 1;
				} else {
					sche_pmt += 1;
				}

				const newEndBalance = equal_payment_daily_based(Orig_date, scheduled_date, beg_balance, sche_pmt, pay_cycle, pmt_num, apr, scheduleIdSequenceCounter, placeDateAfterHoliday, interestBalance)[pmt_num - 1][index_end_bal];
				console.log("$1 - sche_pmt: " + sche_pmt + " | end balance: " + endBalance + " | new end balance: " + newEndBalance);
				if (newEndBalance > 0) {
					//take endBalance
					sche_pmt = oldSchedPmt;
					isSatisifed = true;
				} else if (newEndBalance < 0 && endBalance > 0) {
					isSatisifed = true;
				} else {
					oldSchedPmt = sche_pmt;
					endBalance = newEndBalance;
				}
				isSatisifed = true;
			}

			while (equal_payment_daily_based(Orig_date, scheduled_date, beg_balance, sche_pmt, pay_cycle, pmt_num, apr, scheduleIdSequenceCounter, placeDateAfterHoliday, interestBalance)[pmt_num - 1][index_end_bal] < -1) {
				sche_pmt -= 0.1;
			}
			while (equal_payment_daily_based(Orig_date, scheduled_date, beg_balance, sche_pmt, pay_cycle, pmt_num, apr, scheduleIdSequenceCounter, placeDateAfterHoliday, interestBalance)[pmt_num - 1][index_end_bal] > 0) {
				sche_pmt += 0.01;
			}
			while (equal_payment_daily_based(Orig_date, scheduled_date, beg_balance, sche_pmt, pay_cycle, pmt_num, apr, scheduleIdSequenceCounter, placeDateAfterHoliday, interestBalance)[pmt_num - 1][index_end_bal] < 0) {
				sche_pmt -= 0.001;
			}
			while (equal_payment_daily_based(Orig_date, scheduled_date, beg_balance, sche_pmt, pay_cycle, pmt_num, apr, scheduleIdSequenceCounter, placeDateAfterHoliday, interestBalance)[pmt_num - 1][index_end_bal] > 0) {
				sche_pmt += 0.0001;
			}

			b = equal_payment_daily_based(Orig_date, scheduled_date, beg_balance, sche_pmt, pay_cycle, pmt_num, apr, scheduleIdSequenceCounter, placeDateAfterHoliday, interestBalance);

			b[pmt_num - 1][column.indexOf("Scheduled_paid")] = round(sche_pmt + b[pmt_num - 1][index_end_bal], 2);
			b[pmt_num - 1][column.indexOf("Principal_pmt")] = b[pmt_num - 1][column.indexOf("Beg_balance")];
			b[pmt_num - 1][index_end_bal] = 0;

			let df = pd.DataFrame(b, column);

			df = z.addCol("Cumulative_interest_paid", z.cumulative(z.sum, z.getCol("Interest_pmt", df)), df);
			column_order.push("Cumulative_interest_paid");
			df = z.addCol("Cumulative_principle_paid", z.cumulative(z.sum, z.getCol("Principal_pmt", df)), df);
			column_order.push("Cumulative_principle_paid");
			df = z.addCol("Cumulative_total_paid", z.cumulative(z.sum, z.getCol("Scheduled_paid", df)), df);
			column_order.push("Cumulative_total_paid");
			let total_fee_charge = round(z.sum(z.getCol("Interest_pmt", df)), 2);
			let total_principal_pay = round(z.sum(z.getCol("Principal_pmt", df)), 2);
			let total_finance_pay = round(z.sum(z.getCol("Scheduled_paid", df)), 2);
			let newScheduleIdSequenceCounter = b[pmt_num - 1][column.indexOf("scheduleIdSequenceCounter")] + 1;
			let roundCols = ['Scheduled_paid', 'Interest_pmt', 'Principal_pmt', 'Beg_balance', 'End_balance', 'Rate_in_cycle', 'accruedPrincipal', 'periodAccruedInterest',
				'forgivableInterest', 'remainingInterest', 'remainingPrincipal', 'chargedAccruedInterest', 'forgivenInterest', 'appliedAccruedInterest', 'appliedRemainingInterest', 'appliedRemainingPrincipal', 'appliedScheduledPrincipal', 'appliedForgivenInterest', 'appliedDeferredAmount', 'deferredAmount', 'Cumulative_interest_paid', 'Cumulative_principle_paid', 'Cumulative_total_paid'];
			_.forEach(df, (row) => {
				_.forEach(roundCols, (col) => {
					if (row[col]) {
						row[col] = round(row[col], 2);
					}
				})
			});

			df.columns = column_order;

			resolve({
				originalDate: Orig_date,
				firstScheduledDate: scheduled_date,
				startBalance: beg_balance,
				payCycle: pay_cycle,
				APR: apr,
				paymentAmount: sche_pmt,
				total_fee_charge: total_fee_charge,
				total_finance_pay: total_finance_pay,
				total_principal_pay: total_principal_pay,
				total_paid_amount: 0,
				scheduleIdSequenceCounter: newScheduleIdSequenceCounter,
				paymentSchedule: convertPandaToJson(df)
			});
		} catch (exc) {
			reject(exc);
		}
	})
}
function equal_payment_extend_loan(Orig_date, scheduled_date, beg_balance, pay_cycle, method, apr, paymentAmount, scheduleIdSequenceCounter, placeDateAfterHoliday = false, interestBalance = 0) {
	return new Promise((resolve, reject) => {
		try {
			let days_cycle;
			let b;
			let column;
			let column_order;
			let index_end_bal;
			if (pay_cycle === decisionCloudPeriodicity.MONTHLY) {
				days_cycle = 30;
			} else if (pay_cycle === decisionCloudPeriodicity.SEMI_MONTHLY) {
				days_cycle = 15;
			} else if (pay_cycle === decisionCloudPeriodicity.BI_WEEKLY) {
				days_cycle = 14;
			} else if (pay_cycle === decisionCloudPeriodicity.WEEKLY) {
				days_cycle = 7;
			}


			// ##### give minimum scheduled payment
			column = ['Pay_id', 'Scheduled_date', 'Scheduled_paid', 'Interest_pmt', 'Principal_pmt', 'Beg_balance', 'End_balance', 'startAccruedDate',
				'endAccruedDate', 'Scheduled_days_cycle', 'Rate_in_cycle', 'accruedPrincipal', 'periodAccruedInterest',
				'forgivableInterest', 'remainingInterest', 'remainingPrincipal', 'chargedAccruedInterest', 'forgivenInterest', 'appliedAccruedInterest', 'appliedRemainingInterest', 'appliedRemainingPrincipal', 'appliedScheduledPrincipal', 'appliedForgivenInterest', 'appliedDeferredAmount', 'deferredAmount', 'scheduleIdSequenceCounter'];
			column_order = ['Pay_id', 'Scheduled_date', 'Scheduled_paid', 'Interest_pmt', 'Principal_pmt', 'Beg_balance', 'End_balance', 'startAccruedDate',
				'endAccruedDate', 'Scheduled_days_cycle', 'Rate_in_cycle', 'accruedPrincipal', 'periodAccruedInterest',
				'forgivableInterest', 'remainingInterest', 'remainingPrincipal', 'chargedAccruedInterest', 'forgivenInterest', 'appliedAccruedInterest', 'appliedRemainingInterest', 'appliedRemainingPrincipal', 'appliedScheduledPrincipal', 'appliedForgivenInterest', 'appliedDeferredAmount', 'deferredAmount', 'scheduleIdSequenceCounter'];
			index_end_bal = column.indexOf('End_balance');
			const sche_pmt = $ize(paymentAmount);


			b = extend_daily_based(Orig_date, scheduled_date, beg_balance, sche_pmt, pay_cycle, apr, scheduleIdSequenceCounter, placeDateAfterHoliday, interestBalance);

			// b[pmt_num - 1][column.indexOf( "Scheduled_paid" )] = round( sche_pmt + b[pmt_num - 1][index_end_bal], 2 );
			// b[pmt_num - 1][column.indexOf( "Principal_pmt" )] = b[pmt_num - 1][column.indexOf( "Beg_balance" )];
			// b[pmt_num - 1][index_end_bal] = 0;

			let df = pd.DataFrame(b, column);

			df = z.addCol("Cumulative_interest_paid", z.cumulative(z.sum, z.getCol("Interest_pmt", df)), df);
			column_order.push("Cumulative_interest_paid");
			df = z.addCol("Cumulative_principle_paid", z.cumulative(z.sum, z.getCol("Principal_pmt", df)), df);
			column_order.push("Cumulative_principle_paid");
			df = z.addCol("Cumulative_total_paid", z.cumulative(z.sum, z.getCol("Scheduled_paid", df)), df);
			column_order.push("Cumulative_total_paid");
			let total_fee_charge = round(z.sum(z.getCol("Interest_pmt", df)), 2);
			let total_principal_pay = round(z.sum(z.getCol("Principal_pmt", df)), 2);
			let total_finance_pay = round(z.sum(z.getCol("Scheduled_paid", df)), 2);
			let newScheduleIdSequenceCounter = b[b.length - 1][column.indexOf("scheduleIdSequenceCounter")] + 1;

			let roundCols = ['Scheduled_paid', 'Interest_pmt', 'Principal_pmt', 'Beg_balance', 'End_balance', 'Rate_in_cycle', 'accruedPrincipal', 'periodAccruedInterest',
				'forgivableInterest', 'remainingInterest', 'remainingPrincipal', 'chargedAccruedInterest', 'forgivenInterest', 'appliedAccruedInterest', 'appliedRemainingInterest', 'appliedRemainingPrincipal', 'appliedScheduledPrincipal', 'appliedForgivenInterest', 'appliedDeferredAmount', 'deferredAmount', 'Cumulative_interest_paid', 'Cumulative_principle_paid', 'Cumulative_total_paid'];
			_.forEach(df, (row) => {
				_.forEach(roundCols, (col) => {
					if (row[col]) {
						row[col] = round(row[col], 2);
					}
				})
			});

			df.columns = column_order;

			resolve({
				originalDate: Orig_date,
				firstScheduledDate: scheduled_date,
				startBalance: beg_balance,
				payCycle: pay_cycle,
				APR: apr,
				paymentAmount: sche_pmt,
				total_fee_charge: total_fee_charge,
				total_finance_pay: total_finance_pay,
				total_principal_pay: total_principal_pay,
				total_paid_amount: 0,
				scheduleIdSequenceCounter: newScheduleIdSequenceCounter,
				paymentSchedule: convertPandaToJson(df)
			});
		} catch (exc) {
			reject(exc);
		}
	})
}
function generatePastDuePaymentSchedule(Orig_date, scheduled_dt, beg_balance, pay_cycle, unpaidInterest, apr, monthlyPayment, pastDuePrincipalAmount, remainingForgivenInterest, remainingDeferredAmount, regularNumberOfPayments, oldPaymentScheduleCount = 0, placeDateAfterHoliday = false) {
	let sche_pmt;
	let column;
	let column_order;
	let index_end_bal;

	sche_pmt = parseFloat(monthlyPayment.toFixed(2));
	console.error("Set sche_pmt: " + sche_pmt);

	// ##### give minimum scheduled payment
	column = ['Pay_id', 'Scheduled_date', 'Scheduled_paid', 'Interest_pmt', 'Principal_pmt', 'Beg_balance', 'End_balance', 'startAccruedDate',
		'endAccruedDate', 'Scheduled_days_cycle', 'Rate_in_cycle', 'accruedPrincipal', 'periodAccruedInterest',
		'forgivableInterest', 'remainingInterest', 'remainingPrincipal', 'chargedAccruedInterest', 'forgivenInterest', 'appliedAccruedInterest', 'appliedRemainingInterest', 'appliedRemainingPrincipal', 'appliedScheduledPrincipal', 'appliedForgivenInterest', 'appliedDeferredAmount', 'deferredAmount'];
	column_order = ['Pay_id', 'Scheduled_date', 'Scheduled_paid', 'Interest_pmt', 'Principal_pmt', 'Beg_balance', 'End_balance', 'startAccruedDate',
		'endAccruedDate', 'Scheduled_days_cycle', 'Rate_in_cycle', 'accruedPrincipal', 'periodAccruedInterest',
		'forgivableInterest', 'remainingInterest', 'remainingPrincipal', 'chargedAccruedInterest', 'forgivenInterest', 'appliedAccruedInterest', 'appliedRemainingInterest', 'appliedRemainingPrincipal', 'appliedScheduledPrincipal', 'appliedForgivenInterest', 'appliedDeferredAmount', 'deferredAmount'];
	index_end_bal = column.indexOf('End_balance');

	// ################ adding dollars to  minimum payment ########################
	// Orig_date, scheduled_dt, beg_balance, pay_cycle,unpaidInterest,apr, monthlyPayment, oldPaymentScheduleCount = 0, placeDateAfterHoliday = false
	let b = equal_payment_past_due(Orig_date, scheduled_dt, beg_balance, pay_cycle, unpaidInterest, apr, sche_pmt, pastDuePrincipalAmount, remainingForgivenInterest, remainingDeferredAmount, regularNumberOfPayments, oldPaymentScheduleCount, placeDateAfterHoliday);

	const beggingBalance = b[0][column.indexOf("Beg_balance")];

	// b[pmt_num - 1][column.indexOf( "Scheduled_paid" )] = round( sche_pmt + b[pmt_num - 1][index_end_bal], 2 );
	// b[pmt_num - 1][column.indexOf( "Principal_pmt" )] = b[pmt_num - 1][column.indexOf( "Beg_balance" )];
	// b[pmt_num - 1][index_end_bal] = 0;

	let df = pd.DataFrame(b, column);

	df = z.addCol("Cumulative_interest_paid", z.cumulative(z.sum, z.getCol("Interest_pmt", df)), df);
	column_order.push("Cumulative_interest_paid");
	df = z.addCol("Cumulative_principle_paid", z.cumulative(z.sum, z.getCol("Principal_pmt", df)), df);
	column_order.push("Cumulative_principle_paid");
	df = z.addCol("Cumulative_total_paid", z.cumulative(z.sum, z.getCol("Scheduled_paid", df)), df);
	column_order.push("Cumulative_total_paid");
	let total_fee_charge = round(z.sum(z.getCol("Interest_pmt", df)), 2);
	let total_principal_pay = round(z.sum(z.getCol("Principal_pmt", df)), 2);
	let total_finance_pay = round(z.sum(z.getCol("Scheduled_paid", df)), 2);
	df.columns = column_order;
	let roundCols = ['Scheduled_paid', 'Interest_pmt', 'Principal_pmt', 'Beg_balance', 'End_balance', 'Rate_in_cycle', 'accruedPrincipal', 'periodAccruedInterest',
		'forgivableInterest', 'remainingInterest', 'remainingPrincipal', 'chargedAccruedInterest', 'forgivenInterest', 'appliedAccruedInterest', 'appliedRemainingInterest', 'appliedRemainingPrincipal', 'appliedScheduledPrincipal', 'appliedForgivenInterest', 'appliedDeferredAmount', 'deferredAmount', 'Cumulative_interest_paid', 'Cumulative_principle_paid', 'Cumulative_total_paid'];
	_.forEach(df, (row) => {
		_.forEach(roundCols, (col) => {
			if (row[col]) {
				row[col] = round(row[col], 2);
			}
		})
	});
	return {
		originalDate: Orig_date,
		firstScheduledDate: scheduled_dt,
		startBalance: beggingBalance,
		isAfterHoliday: placeDateAfterHoliday ? 1 : 0,
		adjustedPayment: sche_pmt,
		payCycle: pay_cycle,
		APR: parseFloat(apr) / 100,
		total_fee_charge: total_fee_charge,
		total_finance_pay: total_finance_pay,
		total_principal_pay: total_principal_pay,
		paymentSchedule: convertPandaToJson(df)
	};
}
function generatePaymentScheduleAdjustedPayment(Orig_date, scheduled_date, pay_cycle, interestAmount, principalAmount, adjustedMonthlyPayment, placeDateAfterHoliday = false, oldPaymentScheduleCount = 0) {
	let sche_pmt;
	let column;
	let column_order;
	let index_end_bal;

	// Orig_date = moment(Orig_date).add((14*3)*-1,"days").toDate();
	// scheduled_date = moment(scheduled_date).add((14*3)*-1,"days").toDate();
	sche_pmt = parseFloat(adjustedMonthlyPayment.toFixed(2));
	console.error("Set sche_pmt: " + sche_pmt);

	// ##### give minimum scheduled payment
	column = ['Pay_id', 'Scheduled_date', 'Scheduled_paid', 'Interest_pmt', 'Principal_pmt', 'Beg_balance', 'End_balance', 'startAccruedDate',
		'endAccruedDate', 'Scheduled_days_cycle', 'Rate_in_cycle', 'accruedPrincipal', 'periodAccruedInterest',
		'forgivableInterest', 'remainingInterest', 'remainingPrincipal', 'chargedAccruedInterest', 'forgivenInterest', 'appliedAccruedInterest', 'appliedRemainingInterest', 'appliedRemainingPrincipal', 'appliedScheduledPrincipal', 'appliedForgivenInterest', 'appliedDeferredAmount', 'deferredAmount'];
	column_order = ['Pay_id', 'Scheduled_date', 'Scheduled_paid', 'Interest_pmt', 'Principal_pmt', 'Beg_balance', 'End_balance', 'startAccruedDate',
		'endAccruedDate', 'Scheduled_days_cycle', 'Rate_in_cycle', 'accruedPrincipal', 'periodAccruedInterest',
		'forgivableInterest', 'remainingInterest', 'remainingPrincipal', 'chargedAccruedInterest', 'forgivenInterest', 'appliedAccruedInterest', 'appliedRemainingInterest', 'appliedRemainingPrincipal', 'appliedScheduledPrincipal', 'appliedForgivenInterest', 'appliedDeferredAmount', 'deferredAmount'];
	index_end_bal = column.indexOf('End_balance');

	// ################ adding dollars to  minimum payment ########################

	//Orig_date, scheduled_dt, pay_cycle, interestAmount, principalAmount, adjustedMonthlyPayment, accruedInterest = 0, placeDateAfterHoliday = false
	let b = equal_payment_loan_modification(Orig_date, scheduled_date, pay_cycle, interestAmount, principalAmount, sche_pmt, placeDateAfterHoliday, oldPaymentScheduleCount);
	let pmt_num = b.length;

	const beggingBalance = b[0][column.indexOf("Beg_balance")];
	const apr = parseFloat(b[0][column.indexOf("Rate_in_cycle")].toFixed(2));


	let df = pd.DataFrame(b, column);

	df = z.addCol("Cumulative_interest_paid", z.cumulative(z.sum, z.getCol("Interest_pmt", df)), df);
	column_order.push("Cumulative_interest_paid");
	df = z.addCol("Cumulative_principle_paid", z.cumulative(z.sum, z.getCol("Principal_pmt", df)), df);
	column_order.push("Cumulative_principle_paid");
	df = z.addCol("Cumulative_total_paid", z.cumulative(z.sum, z.getCol("Scheduled_paid", df)), df);
	column_order.push("Cumulative_total_paid");
	let total_fee_charge = round(z.sum(z.getCol("Interest_pmt", df)), 2);
	let total_principal_pay = round(z.sum(z.getCol("Principal_pmt", df)), 2);
	let total_finance_pay = round(z.sum(z.getCol("Scheduled_paid", df)), 2);

	df.columns = column_order;
	let roundCols = ['Scheduled_paid', 'Interest_pmt', 'Principal_pmt', 'Beg_balance', 'End_balance', 'Rate_in_cycle', 'accruedPrincipal', 'periodAccruedInterest',
		'forgivableInterest', 'remainingInterest', 'remainingPrincipal', 'chargedAccruedInterest', 'forgivenInterest', 'appliedAccruedInterest', 'appliedRemainingInterest', 'appliedRemainingPrincipal', 'appliedScheduledPrincipal', 'appliedForgivenInterest', 'appliedDeferredAmount', 'deferredAmount', 'Cumulative_interest_paid', 'Cumulative_principle_paid', 'Cumulative_total_paid'];
	_.forEach(df, (row) => {
		_.forEach(roundCols, (col) => {
			if (row[col]) {
				row[col] = round(row[col], 2);
			}
		})
	});
	return {
		originalDate: Orig_date,
		firstScheduledDate: scheduled_date,
		startBalance: beggingBalance,
		principalAmount: principalAmount,
		interestAmount: interestAmount,
		isAfterHoliday: placeDateAfterHoliday ? 1 : 0,
		adjustedPayment: sche_pmt,
		payCycle: pay_cycle,
		APR: parseFloat(apr) / 100,
		total_fee_charge: total_fee_charge,
		total_finance_pay: total_finance_pay,
		total_principal_pay: total_principal_pay,
		paymentSchedule: convertPandaToJson(df)
	};
}

function equal_payment_daily_based(Orig_date, scheduled_dt, beg_balance, sche_pmt, pay_cycle, numberOfPayments, apr, scheduleIdSequenceCounter = 1, placeDateAfterHoliday = false, interestBalance = 0) {
	let a = [];
	let interest_due = 0;
	let interest_pmt = 0;
	Orig_date = datetime.datetime.strptime(Orig_date, "%Y-%m-%d");
	let scheduled_date = datetime.datetime.strptime(scheduled_dt, "%Y-%m-%d");
	let daily_interest_rate = apr / 365;

	let const_scheduled_date = datetime.datetime.strptime(scheduled_dt, "%Y-%m-%d");
	let dateNeverChanging = datetime.datetime.strptime(scheduled_dt, "%Y-%m-%d");
	let remainingInterestTally = 0;
	let remainingAccruedInterestTally = 0;

	if (pay_cycle === decisionCloudPeriodicity.MONTHLY) {
		//const monthlyPmtNum=12*2;
		for (let i = 1; i <= numberOfPayments; i++) {
			const days = Math.abs(moment(scheduled_date).diff(Orig_date, "days"));

			let interest_rate = days * daily_interest_rate;
			const rateInCycle = interest_rate * 100;
			const periodAccruedInterest = beg_balance * interest_rate;
			// if(interestBalance > 0) {
			// 	interest_rate = 1
			// }
			interest_due = beg_balance * interest_rate - interest_pmt + interest_due;
			interest_pmt = Math.min(interest_due, sche_pmt);
			let princ_pmt = sche_pmt - interest_pmt;
			let end_balance = beg_balance - princ_pmt;

			const beginningBalance = beg_balance;

			const appliedToRemainingInterest = Math.min(remainingInterestTally, interest_pmt);
			const appliedToAccruedInterest = interest_pmt - appliedToRemainingInterest;

			const unpaidAccruedToAdd = periodAccruedInterest - appliedToAccruedInterest;
			remainingAccruedInterestTally = unpaidAccruedToAdd + remainingAccruedInterestTally;

			remainingInterestTally = (remainingInterestTally + periodAccruedInterest) - interest_pmt;
			// a.push([i,moment(scheduled_date).format("YYYY-MM-DD"),days, "{0:.3f}%".format(interest_rate*100),beg_balance,end_balance,interest_due,sche_pmt,interest_pmt,princ_pmt])
			a.push([i, moment(scheduled_date).format("YYYY-MM-DD"), sche_pmt, interest_pmt, princ_pmt, beg_balance, end_balance, moment(Orig_date).format("YYYY-MM-DD"),
				moment(scheduled_date).format("YYYY-MM-DD"), days, rateInCycle, beginningBalance, periodAccruedInterest, 0, remainingInterestTally, 0, periodAccruedInterest,
				0, appliedToAccruedInterest, appliedToRemainingInterest, 0, princ_pmt, 0, 0, 0, scheduleIdSequenceCounter]);
			beg_balance = end_balance;
			Orig_date = scheduled_date;
			const_scheduled_date = moment(const_scheduled_date).add(1, "months").toDate();
			scheduled_date = getBusinessDateBasedOnBankDays(moment(const_scheduled_date).toDate(), placeDateAfterHoliday);
			scheduleIdSequenceCounter = scheduleIdSequenceCounter + 1;
		}
	} else if (pay_cycle === decisionCloudPeriodicity.SEMI_MONTHLY) {
		let temp1 = 0;
		let temp2 = 0;
		// const twicePerMonthPmtNum = 12 * 2 * 2;
		for (let i = 1; i <= numberOfPayments; i++) {
			const days = Math.abs(moment(scheduled_date).diff(Orig_date, "days"));
			let interest_rate = days * daily_interest_rate;
			interest_due = beg_balance * interest_rate - interest_pmt + interest_due;
			interest_pmt = Math.min(interest_due, sche_pmt);
			let princ_pmt = sche_pmt - interest_pmt;
			let end_balance = beg_balance - princ_pmt;
			const beginningBalance = beg_balance;
			const rateInCycle = interest_rate * 100;
			const periodAccruedInterest = beg_balance * interest_rate;
			const appliedToRemainingInterest = Math.min(remainingInterestTally, interest_pmt);
			const appliedToAccruedInterest = interest_pmt - appliedToRemainingInterest;

			const unpaidAccruedToAdd = periodAccruedInterest - appliedToAccruedInterest;
			remainingAccruedInterestTally = unpaidAccruedToAdd + remainingAccruedInterestTally;

			remainingInterestTally = (remainingInterestTally + periodAccruedInterest) - interest_pmt;
			// a.push([i,moment(scheduled_date).format("YYYY-MM-DD"),days, "{0:.3f}%".format(interest_rate*100),beg_balance,end_balance,interest_due,sche_pmt,interest_pmt,princ_pmt])
			a.push([i, moment(scheduled_date).format("YYYY-MM-DD"), sche_pmt, interest_pmt, princ_pmt, beg_balance, end_balance, moment(Orig_date).format("YYYY-MM-DD"),
				moment(scheduled_date).format("YYYY-MM-DD"), days, rateInCycle, beginningBalance, periodAccruedInterest, 0, remainingInterestTally, 0, periodAccruedInterest,
				0, appliedToAccruedInterest, appliedToRemainingInterest, 0, princ_pmt, 0, 0, 0, scheduleIdSequenceCounter]);
			beg_balance = end_balance;
			Orig_date = scheduled_date;

			if (i % 2 === 1) {
				temp1 += 1;
				const_scheduled_date = moment(dateNeverChanging).add(15, "days").add(temp1 - 1, "months").toDate();
			} else {
				temp2 += 1;
				const_scheduled_date = moment(dateNeverChanging).add(temp2, "months").toDate();
			}

			scheduled_date = getBusinessDateBasedOnBankDays(moment(const_scheduled_date).toDate(), placeDateAfterHoliday);

			scheduleIdSequenceCounter = scheduleIdSequenceCounter + 1;

			// scheduled_date = getBusinessDateBasedOnBankDays(moment( const_scheduled_date ).toDate(), placeDateAfterHoliday);

		}
	} else if (pay_cycle === decisionCloudPeriodicity.BI_WEEKLY || pay_cycle === decisionCloudPeriodicity.WEEKLY) {
		let payCycleNumber = 0;
		if (pay_cycle === decisionCloudPeriodicity.BI_WEEKLY) {
			payCycleNumber = 14;
		} else {
			payCycleNumber = 7;
		}
		for (let i = 1; i <= numberOfPayments; i++) {
			beg_balance = round(beg_balance, 2);
			const days = Math.abs(moment(scheduled_date).diff(Orig_date, "days"));
			let interest_rate = days * daily_interest_rate;
			interest_due = round(beg_balance * interest_rate - interest_pmt + interest_due, 2);
			interest_pmt = Math.min(interest_due, sche_pmt);
			let princ_pmt = round(sche_pmt - interest_pmt, 2);
			let end_balance = round(beg_balance - princ_pmt, 2);

			const beginningBalance = beg_balance;
			const rateInCycle = interest_rate * 100;
			const periodAccruedInterest = round(beg_balance * interest_rate, 2);
			const appliedToRemainingInterest = Math.min(remainingInterestTally, interest_pmt);
			const appliedToAccruedInterest = round(interest_pmt - appliedToRemainingInterest, 2);

			const unpaidAccruedToAdd = round(periodAccruedInterest - appliedToAccruedInterest, 2);
			remainingAccruedInterestTally = round(unpaidAccruedToAdd + remainingAccruedInterestTally, 2);

			remainingInterestTally = round((remainingInterestTally + periodAccruedInterest) - interest_pmt, 2);
			// a.push([i,moment(scheduled_date).format("YYYY-MM-DD"),days, "{0:.3f}%".format(interest_rate*100),beg_balance,end_balance,interest_due,sche_pmt,interest_pmt,princ_pmt])
			a.push([i, moment(scheduled_date).format("YYYY-MM-DD"), sche_pmt, interest_pmt, princ_pmt, beg_balance, end_balance, moment(Orig_date).format("YYYY-MM-DD"),
				moment(scheduled_date).format("YYYY-MM-DD"), days, rateInCycle, beginningBalance, periodAccruedInterest, 0, remainingInterestTally, 0, periodAccruedInterest,
				0, appliedToAccruedInterest, appliedToRemainingInterest, 0, princ_pmt, 0, 0, 0, scheduleIdSequenceCounter]);
			beg_balance = end_balance;
			Orig_date = scheduled_date;
			scheduled_date = moment(scheduled_date).add(payCycleNumber, "days");
			scheduled_date = getBusinessDateBasedOnBankDays(moment(scheduled_date).toDate(), placeDateAfterHoliday);
			scheduleIdSequenceCounter = scheduleIdSequenceCounter + 1;
		}
	}
	return a;
}
function extend_daily_based(Orig_date, scheduled_dt, beg_balance, sche_pmt, pay_cycle, apr, scheduleIdSequenceCounter = 1, placeDateAfterHoliday = false, interestBalance = 0) {
	let a = [];
	let interest_due = 0;
	let interest_pmt = 0;
	Orig_date = datetime.datetime.strptime(Orig_date, "%Y-%m-%d");
	let scheduled_date = datetime.datetime.strptime(scheduled_dt, "%Y-%m-%d");
	let daily_interest_rate = apr / 365;

	let const_scheduled_date = datetime.datetime.strptime(scheduled_dt, "%Y-%m-%d");
	let dateNeverChanging = datetime.datetime.strptime(scheduled_dt, "%Y-%m-%d");
	let remainingInterestTally = 0;
	let remainingAccruedInterestTally = 0;

	let i = 0;
	if (pay_cycle === decisionCloudPeriodicity.MONTHLY) {
		//const monthlyPmtNum=12*2;

		while (beg_balance > 0) {
			i++;
			const days = Math.abs(moment(scheduled_date).diff(Orig_date, "days"));

			let interest_rate = days * daily_interest_rate;
			const rateInCycle = interest_rate * 100;
			const periodAccruedInterest = beg_balance * interest_rate;
			// if(interestBalance > 0) {
			// 	interest_rate = 1
			// }
			interest_due = beg_balance * interest_rate - interest_pmt + interest_due;
			interest_pmt = Math.min(interest_due, sche_pmt);
			let princ_pmt = sche_pmt - interest_pmt;
			princ_pmt = Math.min(princ_pmt, beg_balance);
			if ($ize(princ_pmt + interest_pmt) !== $ize(sche_pmt)) {
				sche_pmt = interest_pmt + princ_pmt;
			}
			let end_balance = beg_balance - princ_pmt;

			const beginningBalance = beg_balance;

			const appliedToRemainingInterest = Math.min(remainingInterestTally, interest_pmt);
			const appliedToAccruedInterest = interest_pmt - appliedToRemainingInterest;

			const unpaidAccruedToAdd = periodAccruedInterest - appliedToAccruedInterest;
			remainingAccruedInterestTally = unpaidAccruedToAdd + remainingAccruedInterestTally;

			remainingInterestTally = (remainingInterestTally + periodAccruedInterest) - interest_pmt;
			// a.push([i,moment(scheduled_date).format("YYYY-MM-DD"),days, "{0:.3f}%".format(interest_rate*100),beg_balance,end_balance,interest_due,sche_pmt,interest_pmt,princ_pmt])
			a.push([i, moment(scheduled_date).format("YYYY-MM-DD"), sche_pmt, interest_pmt, princ_pmt, beg_balance, end_balance, moment(Orig_date).format("YYYY-MM-DD"),
				moment(scheduled_date).format("YYYY-MM-DD"), days, rateInCycle, beginningBalance, periodAccruedInterest, 0, remainingInterestTally, 0, periodAccruedInterest,
				0, appliedToAccruedInterest, appliedToRemainingInterest, 0, princ_pmt, 0, 0, 0, scheduleIdSequenceCounter]);
			beg_balance = end_balance;
			Orig_date = scheduled_date;
			const_scheduled_date = moment(const_scheduled_date).add(1, "months").toDate();
			scheduled_date = getBusinessDateBasedOnBankDays(moment(const_scheduled_date).toDate(), placeDateAfterHoliday);
			scheduleIdSequenceCounter = scheduleIdSequenceCounter + 1
		}
	} else if (pay_cycle === decisionCloudPeriodicity.SEMI_MONTHLY) {
		let temp1 = 0;
		let temp2 = 0;
		// const twicePerMonthPmtNum = 12 * 2 * 2;
		while (beg_balance > 0) {
			i++;
			const days = Math.abs(moment(scheduled_date).diff(Orig_date, "days"));
			let interest_rate = days * daily_interest_rate;
			interest_due = beg_balance * interest_rate - interest_pmt + interest_due;
			interest_pmt = Math.min(interest_due, sche_pmt);
			let princ_pmt = sche_pmt - interest_pmt;
			princ_pmt = Math.min(princ_pmt, beg_balance);
			if ($ize(princ_pmt + interest_pmt) !== $ize(sche_pmt)) {
				sche_pmt = interest_pmt + princ_pmt;
			}
			let end_balance = beg_balance - princ_pmt;
			const beginningBalance = beg_balance;
			const rateInCycle = interest_rate * 100;
			const periodAccruedInterest = beg_balance * interest_rate;
			const appliedToRemainingInterest = Math.min(remainingInterestTally, interest_pmt);
			const appliedToAccruedInterest = interest_pmt - appliedToRemainingInterest;

			const unpaidAccruedToAdd = periodAccruedInterest - appliedToAccruedInterest;
			remainingAccruedInterestTally = unpaidAccruedToAdd + remainingAccruedInterestTally;

			remainingInterestTally = (remainingInterestTally + periodAccruedInterest) - interest_pmt;
			// a.push([i,moment(scheduled_date).format("YYYY-MM-DD"),days, "{0:.3f}%".format(interest_rate*100),beg_balance,end_balance,interest_due,sche_pmt,interest_pmt,princ_pmt])
			a.push([i, moment(scheduled_date).format("YYYY-MM-DD"), sche_pmt, interest_pmt, princ_pmt, beg_balance, end_balance, moment(Orig_date).format("YYYY-MM-DD"),
				moment(scheduled_date).format("YYYY-MM-DD"), days, rateInCycle, beginningBalance, periodAccruedInterest, 0, remainingInterestTally, 0, periodAccruedInterest,
				0, appliedToAccruedInterest, appliedToRemainingInterest, 0, princ_pmt, 0, 0, 0, scheduleIdSequenceCounter]);
			beg_balance = end_balance;
			Orig_date = scheduled_date;

			if (i % 2 === 1) {
				temp1 += 1;
				const_scheduled_date = moment(dateNeverChanging).add(15, "days").add(temp1 - 1, "months").toDate();
			} else {
				temp2 += 1;
				const_scheduled_date = moment(dateNeverChanging).add(temp2, "months").toDate();
			}

			scheduled_date = getBusinessDateBasedOnBankDays(moment(const_scheduled_date).toDate(), placeDateAfterHoliday);

			scheduleIdSequenceCounter = scheduleIdSequenceCounter + 1

			// scheduled_date = getBusinessDateBasedOnBankDays(moment( const_scheduled_date ).toDate(), placeDateAfterHoliday);

		}
	} else if (pay_cycle === decisionCloudPeriodicity.BI_WEEKLY || pay_cycle === decisionCloudPeriodicity.WEEKLY) {
		let payCycleNumber = 0;
		if (pay_cycle === decisionCloudPeriodicity.BI_WEEKLY) {
			payCycleNumber = 14;
		} else {
			payCycleNumber = 7;
		}
		while (beg_balance > 0) {
			i++;
			beg_balance = round(beg_balance, 2);
			const days = Math.abs(moment(scheduled_date).diff(Orig_date, "days"));
			let interest_rate = days * daily_interest_rate;
			interest_due = round(beg_balance * interest_rate - interest_pmt + interest_due, 2);
			interest_pmt = Math.min(interest_due, sche_pmt);
			let princ_pmt = sche_pmt - interest_pmt;
			princ_pmt = Math.min(princ_pmt, beg_balance);
			if ($ize(princ_pmt + interest_pmt) !== $ize(sche_pmt)) {
				sche_pmt = interest_pmt + princ_pmt;
			}
			let end_balance = round(beg_balance - princ_pmt, 2);

			const beginningBalance = beg_balance;
			const rateInCycle = interest_rate * 100;
			const periodAccruedInterest = round(beg_balance * interest_rate, 2);
			const appliedToRemainingInterest = Math.min(remainingInterestTally, interest_pmt);
			const appliedToAccruedInterest = round(interest_pmt - appliedToRemainingInterest, 2);

			const unpaidAccruedToAdd = round(periodAccruedInterest - appliedToAccruedInterest, 2);
			remainingAccruedInterestTally = round(unpaidAccruedToAdd + remainingAccruedInterestTally, 2);

			remainingInterestTally = round((remainingInterestTally + periodAccruedInterest) - interest_pmt, 2);
			// a.push([i,moment(scheduled_date).format("YYYY-MM-DD"),days, "{0:.3f}%".format(interest_rate*100),beg_balance,end_balance,interest_due,sche_pmt,interest_pmt,princ_pmt])
			a.push([i, moment(scheduled_date).format("YYYY-MM-DD"), sche_pmt, interest_pmt, princ_pmt, beg_balance, end_balance, moment(Orig_date).format("YYYY-MM-DD"),
				moment(scheduled_date).format("YYYY-MM-DD"), days, rateInCycle, beginningBalance, periodAccruedInterest, 0, remainingInterestTally, 0, periodAccruedInterest,
				0, appliedToAccruedInterest, appliedToRemainingInterest, 0, princ_pmt, 0, 0, 0, scheduleIdSequenceCounter]);
			beg_balance = end_balance;
			Orig_date = scheduled_date;
			scheduled_date = moment(scheduled_date).add(payCycleNumber, "days");
			scheduled_date = getBusinessDateBasedOnBankDays(moment(scheduled_date).toDate(), placeDateAfterHoliday);
			scheduleIdSequenceCounter = scheduleIdSequenceCounter + 1
		}
	}
	return a;
}

function equal_payment_loan_modification(Orig_date, scheduled_dt, pay_cycle, interestAmount, principalAmount, adjustedMonthlyPayment, placeDateAfterHoliday = false, oldPaymentScheduleCount = 0) {
	let a = [];
	Orig_date = datetime.datetime.strptime(Orig_date, "%Y-%m-%d");
	let scheduled_date = datetime.datetime.strptime(scheduled_dt, "%Y-%m-%d");
	let const_scheduled_date = datetime.datetime.strptime(scheduled_dt, "%Y-%m-%d");
	let dateNeverChanging = datetime.datetime.strptime(scheduled_dt, "%Y-%m-%d");

	let interest_due = interestAmount;
	let principalBalance = principalAmount;
	let remainingBalance = principalAmount + interest_due;
	let numberOfPayments = remainingBalance / adjustedMonthlyPayment;
	const interest_rate = interest_due / principalAmount;
	let interest_pmt = interest_due / numberOfPayments;
	let princ_pmt = adjustedMonthlyPayment - interest_pmt;
	let temp1 = 0;
	let temp2 = 0;
	let payCycleNumber = 0;
	let loopIndex = oldPaymentScheduleCount;
	let remainingInterestTally = 0;
	let remainingAccruedInterestTally = 0;
	while (remainingBalance > 0) {
		loopIndex++;
		const days = Math.abs(moment(scheduled_date).diff(Orig_date, "days"));
		let payment = adjustedMonthlyPayment;

		if (interest_due >= payment) {
			interest_pmt = payment;
			princ_pmt = 0;
		} else if (interest_due <= 0) {
			interest_pmt = 0;
			princ_pmt = payment
		} else {
			interest_pmt = interest_due
			princ_pmt = payment - interest_pmt
		}

		if (remainingBalance < payment) {
			payment = remainingBalance;
			interest_pmt = interest_due;
			princ_pmt = payment - interest_pmt;
		}
		let end_balance = principalBalance - princ_pmt;

		const beginningBalance = principalBalance;
		const appliedToRemainingInterest = Math.min(interest_due, interest_pmt);
		const appliedToAccruedInterest = interest_pmt - appliedToRemainingInterest;
		a.push([loopIndex, moment(scheduled_date).format("YYYY-MM-DD"), payment, interest_pmt, princ_pmt, principalBalance, end_balance, moment(Orig_date).format("YYYY-MM-DD"),
			moment(scheduled_date).format("YYYY-MM-DD"), days, 0, beginningBalance, 0, 0, interest_due, 0, 0, 0, appliedToAccruedInterest, appliedToRemainingInterest, 0, princ_pmt, 0, 0, 0]);
		// [ 'Pay_id', 'Scheduled_date', 'Scheduled_paid','Interest_pmt', 'Principal_pmt', 'Beg_balance', 'End_balance', 'startAccruedDate',
		// 	'endAccruedDate', 'Scheduled_days_cycle', 'Rate_in_cycle','accruedPrincipal', 'periodAccruedInterest',
		// 	'forgivableInterest','remainingInterest','remainingPrincipal', 'chargedAccruedInterest', 'forgivenInterest', 'appliedAccruedInterest', 'appliedRemainingInterest','appliedRemainingPrincipal','appliedScheduledPrincipal','appliedForgivenInterest','appliedDeferredAmount', 'deferredAmount']
		if (interest_due >= interest_pmt) {
			interest_due = interest_due - interest_pmt;
		} else {
			interest_due = 0;
		}

		principalBalance = principalBalance - princ_pmt;
		remainingBalance = end_balance;

		Orig_date = scheduled_date;
		if (pay_cycle === decisionCloudPeriodicity.MONTHLY) {
			const_scheduled_date = moment(const_scheduled_date).add(1, "months").toDate();
		} else if (pay_cycle === decisionCloudPeriodicity.SEMI_MONTHLY) {
			if (loopIndex % 2 === 1) {
				temp1 += 1;
				const_scheduled_date = moment(dateNeverChanging).add(15, "days").add(temp1 - 1, "months").toDate();
			} else {
				temp2 += 1;
				const_scheduled_date = moment(dateNeverChanging).add(temp2, "months").toDate();
			}
		} else if (pay_cycle === decisionCloudPeriodicity.BI_WEEKLY || pay_cycle === decisionCloudPeriodicity.WEEKLY) {
			if (pay_cycle === decisionCloudPeriodicity.BI_WEEKLY) {
				payCycleNumber = 14;
			} else {
				payCycleNumber = 7;
			}
			const_scheduled_date = moment(const_scheduled_date).add(payCycleNumber, "days").toDate();
		}

		scheduled_date = getBusinessDateBasedOnBankDays(moment(const_scheduled_date).toDate(), placeDateAfterHoliday);
	}

	return a;
}
function equal_payment_past_due(OrigDate, scheduled_dt, beg_balance, pay_cycle, unpaidInterest, apr, monthlyPayment, pastDuePrincipalAmount, remainingForgivenInterest, remainingDeferredAmount, regularNumberOfPayments, oldPaymentScheduleCount = 0, placeDateAfterHoliday = false) {

	let a = [];
	let interest_due = unpaidInterest;
	let interest_pmt = 0;
	let Orig_date = datetime.datetime.strptime(OrigDate, "%Y-%m-%d");
	let scheduled_date = datetime.datetime.strptime(scheduled_dt, "%Y-%m-%d");
	let daily_interest_rate = apr / 365;
	let const_scheduled_date = datetime.datetime.strptime(scheduled_dt, "%Y-%m-%d");
	let dateNeverChanging = datetime.datetime.strptime(scheduled_dt, "%Y-%m-%d");
	let loopIndex = oldPaymentScheduleCount;
	let temp1 = 0;
	let temp2 = 0;
	let payCycleNumber = 0;
	let sche_pmt = monthlyPayment;
	let remainingInterestTally = unpaidInterest;
	let remainingUnpaidPrincipalTally = pastDuePrincipalAmount;
	let remainingAccruedInterestTally = 0;
	let remainingForgivenTally = remainingForgivenInterest;
	let remainingDeferredTally = remainingDeferredAmount;
	let canReasonablyPayOff = true;
	while (beg_balance > 0) {
		loopIndex++;
		const days = Math.abs(moment(scheduled_date).diff(Orig_date, "days"));
		let interest_rate = days * daily_interest_rate;
		let periodAccruedInterest = round(beg_balance * interest_rate, 2);
		let chargedAccruedInterest = periodAccruedInterest;
		// remainingAccruedInterestTally = round(remainingAccruedInterestTally + periodAccruedInterest,2);
		const currentInterestAmount = round(periodAccruedInterest + remainingInterestTally + remainingDeferredTally + remainingForgivenTally, 2);
		interest_pmt = Math.min(currentInterestAmount, sche_pmt);
		let princ_pmt = round(sche_pmt - interest_pmt, 2);
		if (princ_pmt > beg_balance) {
			princ_pmt = beg_balance;
			sche_pmt = round(princ_pmt + interest_pmt, 2);
		}
		let end_balance = beg_balance - princ_pmt;

		const beginningBalance = beg_balance;
		const rateInCycle = round(interest_rate * 100, 2);

		let leftOverRemainingForgivenInterest = Math.min(remainingForgivenTally, interest_pmt);
		remainingForgivenTally = round(remainingForgivenTally - leftOverRemainingForgivenInterest, 2);
		let appliedForgivenInterest = leftOverRemainingForgivenInterest;
		let unpaidDifference = round(interest_pmt - leftOverRemainingForgivenInterest, 2);

		let leftOverRemainingDeferred = Math.min(remainingDeferredTally, unpaidDifference);
		remainingDeferredTally = round(remainingDeferredTally - leftOverRemainingDeferred, 2);
		let appliedDeferredAmount = leftOverRemainingDeferred;
		unpaidDifference = round(unpaidDifference - leftOverRemainingDeferred, 2);


		let leftOverRemainingInterest = Math.min(remainingInterestTally, unpaidDifference);
		remainingInterestTally = round(remainingInterestTally - leftOverRemainingInterest, 2);
		let appliedToRemainingInterest = leftOverRemainingInterest;
		unpaidDifference = round(unpaidDifference - leftOverRemainingInterest, 2);

		let remainingAccruedInterest = Math.min(chargedAccruedInterest, unpaidDifference);
		chargedAccruedInterest = round(chargedAccruedInterest - remainingAccruedInterest, 2);
		let appliedToAccruedInterest = remainingAccruedInterest;
		remainingInterestTally = parseFloat((remainingInterestTally + chargedAccruedInterest).toFixed(2));


		let leftOverPastDuePrincipal = Math.min(remainingUnpaidPrincipalTally, princ_pmt);
		remainingUnpaidPrincipalTally = round(remainingUnpaidPrincipalTally - leftOverPastDuePrincipal, 2);
		let appliedPastDuePrincipal = leftOverPastDuePrincipal;
		let appliedSchedulePrincipal = round(princ_pmt - leftOverPastDuePrincipal, 2);

		if (loopIndex === regularNumberOfPayments + 1) {

			interest_pmt = remainingInterestTally + remainingForgivenTally + remainingDeferredTally;
			princ_pmt = beg_balance;

			appliedDeferredAmount = remainingDeferredTally;
			appliedForgivenInterest = remainingForgivenTally;
			appliedPastDuePrincipal = remainingUnpaidPrincipalTally;
			appliedSchedulePrincipal = round(beginningBalance - appliedPastDuePrincipal, 2);
			appliedToRemainingInterest = remainingInterestTally;

			remainingInterestTally = 0;
			remainingUnpaidPrincipalTally = 0;
			remainingForgivenTally = 0;
			remainingDeferredTally = 0;
			sche_pmt = round(interest_pmt + princ_pmt, 2);
			end_balance = beg_balance - princ_pmt;
		}

		// [ 'Pay_id', 'Scheduled_date', 'Scheduled_paid','Interest_pmt', 'Principal_pmt', 'Beg_balance', 'End_balance', 'startAccruedDate',
		// 	'endAccruedDate', 'Scheduled_days_cycle', 'Rate_in_cycle','accruedPrincipal', 'periodAccruedInterest','forgivableInterest','remainingInterest','remainingPrincipal', 'chargedAccruedInterest',
		// 	'forgivenInterest', 'appliedAccruedInterest', 'appliedRemainingInterest','appliedRemainingPrincipal','appliedScheduledPrincipal','appliedForgivenInterest','appliedDeferredAmount', 'deferredAmount']

		a.push([loopIndex, moment(scheduled_date).format("YYYY-MM-DD"), sche_pmt, interest_pmt, princ_pmt, beg_balance, end_balance, moment(Orig_date).format("YYYY-MM-DD"),
			moment(scheduled_date).format("YYYY-MM-DD"), days, rateInCycle, beginningBalance, periodAccruedInterest, 0, remainingInterestTally, remainingUnpaidPrincipalTally, periodAccruedInterest,
			0, appliedToAccruedInterest, appliedToRemainingInterest, appliedPastDuePrincipal, appliedSchedulePrincipal, appliedForgivenInterest, appliedDeferredAmount, 0]);
		// a.push([loopIndex,moment(scheduled_date).format("YYYY-MM-DD"),days, "{0:.3f}%".format(interest_rate*100),beg_balance,end_balance,interest_due,sche_pmt,interest_pmt,princ_pmt])
		beg_balance = end_balance;
		Orig_date = scheduled_date;

		if (pay_cycle === decisionCloudPeriodicity.MONTHLY) {
			const_scheduled_date = moment(const_scheduled_date).add(1, "months").toDate();
		} else if (pay_cycle === decisionCloudPeriodicity.SEMI_MONTHLY) {
			if (loopIndex % 2 === 1) {
				temp1 += 1;
				const_scheduled_date = moment(dateNeverChanging).add(15, "days").add(temp1 - 1, "months").toDate();
			} else {
				temp2 += 1;
				const_scheduled_date = moment(dateNeverChanging).add(temp2, "months").toDate();
			}
		} else if (pay_cycle === decisionCloudPeriodicity.BI_WEEKLY || pay_cycle === decisionCloudPeriodicity.WEEKLY) {
			if (pay_cycle === decisionCloudPeriodicity.BI_WEEKLY) {
				payCycleNumber = 14;
			} else {
				payCycleNumber = 7;
			}
			const_scheduled_date = moment(const_scheduled_date).add(payCycleNumber, "days").toDate();
		}

		scheduled_date = getBusinessDateBasedOnBankDays(moment(const_scheduled_date).toDate(), placeDateAfterHoliday);

	}

	return a;
}


function getBusinessDateBasedOnBankDays(scheduleDate, placeDateAfterHolidayOrWeekend = false, forceForwardDirection = false) {
	let previousDateMoment = moment(scheduleDate);
	const isOnHoliday = isDateOnAHoliday(scheduleDate);
	const isOnBusinessDay = isDateOnABusinessDay(scheduleDate);

	if (isOnBusinessDay && !isOnHoliday) {
		// console.log("found the day: " + previousDateMoment.format("YYYY-MM-DD"));
		return previousDateMoment.toDate();
	} else {
		let dayIncrement = ((isOnHoliday && placeDateAfterHolidayOrWeekend) || forceForwardDirection) ? 1 : -1;
		// console.log("get next day iteration: " + previousDateMoment.format("YYYY-MM-DD"));
		return getBusinessDateBasedOnBankDays(previousDateMoment.add(dayIncrement, "day").toDate(), placeDateAfterHolidayOrWeekend, dayIncrement === 1);
	}
}

function convertPandaToJson(df) {

	const paymentSchedule = [];

	let monthIndex = 0;
	let currentMonth = 0;

	let previousPaymentDate = null;
	_.forEach(df, (row) => {
		if (row) {
			// _.forEach(roundCols, (roundCol) => {
			// 	row[roundCol] = round( row[roundCol], 2 );
			// });
			const scheduleDate = moment(row.Scheduled_date, "YYYY-MM-DD").startOf("day");
			const scheduledDateMonth = scheduleDate.month();
			if (currentMonth !== scheduledDateMonth) {
				monthIndex += 1;
				currentMonth = scheduledDateMonth;
			}
			paymentSchedule.push({
				month: monthIndex,
				startBalanceAmount: row.Beg_balance,
				endBalanceAfterPayment: row.End_balance,
				daysInCycle: row.Scheduled_days_cycle,
				interestRate: row.Rate_in_cycle,
				principalAmount: row.Principal_pmt,
				interestAmount: row.Interest_pmt,
				cumulativeInterestPaid: row.Cumulative_interest_paid,
				cumulativePrincipalPaid: row.Cumulative_principle_paid,
				cumulativeTotalPaid: row.Cumulative_total_paid,
				amount: row.Scheduled_paid,
				paidprincipalAmount: 0,
				paidinterestAmount: 0,
				lastpaidprincipalAmount: 0,
				lastpaidinterestAmount: 0,
				lastpaidcount: 0,
				date: scheduleDate.toDate(),
				lastpaidDate: (!previousPaymentDate) ? null : previousPaymentDate,
				transaction: row.Pay_id,
				initiator: "automatic",
				status: "OPENED",
				startAccruedDate: moment(row.startAccruedDate, "YYYY-MM-DD").toDate(),
				endAccruedDate: moment(row.endAccruedDate, "YYYY-MM-DD").toDate(),
				accruedPrincipal: row.accruedPrincipal,
				periodAccruedInterest: row.periodAccruedInterest,
				forgivableInterest: row.forgivableInterest,
				remainingInterest: row.remainingInterest,
				remainingPrincipal: row.remainingPrincipal,
				chargedAccruedInterest: row.chargedAccruedInterest,
				forgivenInterest: row.forgivenInterest,
				appliedAccruedInterest: row.appliedAccruedInterest,
				appliedRemainingInterest: row.appliedRemainingInterest,
				appliedRemainingPrincipal: row.appliedRemainingPrincipal,
				appliedScheduledPrincipal: row.appliedScheduledPrincipal,
				appliedForgivenInterest: row.appliedForgivenInterest,
				appliedDeferredAmount: row.appliedDeferredAmount,
				deferredAmount: row.deferredAmount,
				scheduleId: row.scheduleIdSequenceCounter
			});
			previousPaymentDate = scheduleDate.toDate();
		}
	});

	let correctStartOfBalance = paymentSchedule[0].startBalanceAmount;
	_.forEach(paymentSchedule, (item) => {

		const correctPrincipal = round(item.amount - item.interestAmount, 2);
		const correctEndBalance = round(item.startBalanceAmount - correctPrincipal, 2);

		if (correctPrincipal !== item.principalAmount) {
			sails.log.error("Principal on item " + correctPrincipal + " does not equal correct principal " + item.principalAmount);
		}

		if (item.startBalanceAmount !== correctStartOfBalance) {
			sails.log.error("StartBalance " + item.startBalanceAmount + " does not equal correct StartBalance " + correctStartOfBalance);
		}
		if (item.endBalanceAfterPayment !== correctEndBalance) {
			sails.log.error("EndBalance " + item.endBalanceAfterPayment + " does not equal correct EndBalance " + correctEndBalance);
		}
		correctStartOfBalance = correctEndBalance;
	});
	return paymentSchedule;
}
const verbose = 3;

function determineFirstPaymentScheduleFromEmploymentPayDates(latestEmployment, originDate, frequency = decisionCloudPeriodicity.BI_WEEKLY, minimumDaysFromOrigin = 8) {
	const today = moment().startOf("day");
	if (latestEmployment) {
		let frequencies = getIncomePayFrequencies(latestEmployment.lastPayDate, latestEmployment.nextPayDate, latestEmployment.secondPayDate, frequency);
		if (frequencies && frequencies.length > 0) {
			const todayMoment = moment().startOf("day").startOf("month");
			const secondNextMonth = moment().add(2, "months").startOf("day").startOf("month");
			const nextMonth = moment().add(1, "months").startOf("day").startOf("month");
			const freqArray = _.filter(frequencies, (freq) => {
				const freqDate = moment(freq, "YYYY-MM-DD").startOf("day").startOf("month");
				return freqDate.diff(todayMoment) === 0 || freqDate.diff(secondNextMonth) === 0 || freqDate.diff(nextMonth) === 0;
			});
			if (freqArray && freqArray.length > 0) {
				const originMoment = moment(originDate).startOf("day");
				let minimumDate = moment(originMoment).add(minimumDaysFromOrigin, "days");
				if (minimumDate.isSameOrBefore(today)) {
					minimumDate = moment(today).add(minimumDaysFromOrigin, "days");
				}
				const firstDateFound = _.find(freqArray, (payDate) => {
					const payDateMoment = getBusinessDateBasedOnBankDays(moment(payDate, "YYYY-MM-DD").startOf("day").toDate());
					if (moment(payDateMoment).startOf("day").isSameOrAfter(minimumDate)) {
						return true;
					} else {
						return false;
					}
				})
				if (firstDateFound) {

					return firstDateFound
				}
			}
		}
	}
	return getBusinessDateBasedOnBankDays(moment(originDate).startOf("day").add(getCycleDaysInFrequency(frequency), "day").toDate());
}

function getNextDateForACHCutoff(dateToUse) {
	let achCutOffHour = sails.config.paymentService.achCutOffHour || 15;
	let today = moment();
	const isOnHoliday = isDateOnAHoliday(dateToUse);
	const isOnBusinessDay = isDateOnABusinessDay(dateToUse);

	if (today.isSameOrAfter(moment(today).hour(achCutOffHour))) {
		return getBusinessDateBasedOnBankDays()
	}
}
function getIncomePayFrequency(loanSetDate, lastPayDate, nextPayDate, secondNextPayDate, frequency) {
	const incomePayFrequencies = SmoothPaymentService.getIncomePayFrequencies(lastPayDate, nextPayDate, secondNextPayDate, frequency);
	let actualNextPayDate = nextPayDate;

	let today = moment().startOf("day");

	let paymentStartDate = moment(loanSetDate).startOf("day").add(7, "days");

	_.forEach(incomePayFrequencies, (actualNextPay) => {
		const actualNextPayMoment = moment(actualNextPay).startOf("day");
		if (actualNextPayMoment.diff(paymentStartDate, "days") > 0 && actualNextPayMoment.diff(today, "days") > 0) {
			actualNextPayDate = actualNextPayMoment.toDate();
			return false;
		}
	});
	console.log("actual next payment date: " + moment(actualNextPayDate).format("YYYY-MM-DD"));
	return actualNextPayDate;


}
function getIncomePayFrequencies(lastPayDate, nextPayDate, secondNextPayDate, frequency) {
	const prevDateMoment = moment(lastPayDate).startOf("day");
	const firstDateMoment = moment(prevDateMoment);
	const nextDateMoment = moment(nextPayDate).startOf("day");
	const secondNextDateMoment = secondNextPayDate ? moment(secondNextPayDate).startOf("day") : null;
	const now = moment().startOf("day");
	const payrollDiff = [];

	const payDateMoment = moment(nextDateMoment.toDate());
	const diffDays = payDateMoment.diff(firstDateMoment, "days");
	const diffDays2 = secondNextDateMoment ? secondNextDateMoment.diff(payDateMoment, "days") : 0;
	// console.log( `"${payrollGroup.name}" ${moment( firstDate ).format()} - ${payDate.format()} = ${diffDays}` );
	if (diffDays < 32) {
		payrollDiff.push(diffDays)
	}
	if (secondNextDateMoment && diffDays2 < 32) {
		payrollDiff.push(diffDays2);
	}


	if (payrollDiff.length === 0) {
		console.error("unable to determine payroll");
		return null;
	}

	const freqRangeDays = MathExt.range(payrollDiff);
	const freqRange = Math.abs(freqRangeDays[1] - freqRangeDays[0]);
	const freqMode = MathExt.mode(payrollDiff);
	const freqMean = MathExt.mean(payrollDiff);
	let payFreqDays = freqMode;

	if (freqRange > 7) {
		const modes = [];
		payrollDiff.forEach((diffDays) => {
			if (diffDays === freqMode || (diffDays - 1) === freqMode || (diffDays + 1) === freqMode) {
				modes.push(true);
			}
		});
		const modeProb = ((modes.length / payrollDiff.length) * 100);
		if (verbose >= 2) console.log(`"modeProb: ${modeProb}`);
		payFreqDays = (modeProb >= 50 ? freqMode : -1);
		if (payFreqDays === -1 && freqMean > freqMode && (freqMean - freqMode) > 7) {
			const modePct = occurencePct(payrollDiff, freqMode);
			// console.log( `"${payrollGroup.name}" freqMode(day) modePct: ${modePct}` );
			for (let day = (freqMode + 1); day <= freqRangeDays[1]; ++day) {
				const occPct = occurencePct(payrollDiff, day);
				// console.log( `"${payrollGroup.name}" freqMode(day): ${day} = ${occPct}` );
				if (occPct >= modePct) {
					payFreqDays = day;
				}
			}
		}
	} else if (freqMean > freqMode && occurencePct(payrollDiff, freqMode) === 50) {
		// bi-weekly and semi-monthly contest
		if (freqMode >= 14) {
			for (let day = (freqMode + 1); day <= freqRangeDays[1]; ++day) {
				const occPct = occurencePct(payrollDiff, day);
				// console.log( `"${payrollGroup.name}" freqMode(day): ${day} = ${occPct}` );
				if (occPct >= 50) {
					payFreqDays = day;
				}
			}
		}
	}
	if (verbose >= 2) console.log(`freqRangeDays: ${JSON.stringify(freqRangeDays)} => ${(freqRangeDays[1] - freqRangeDays[0])}`);
	if (verbose >= 2) console.log(`freqMode: ${JSON.stringify(freqMode)}`);
	if (verbose >= 2) console.log(`freqMean: ${JSON.stringify(freqMean)}`);
	if (verbose >= 2) console.log(`payrollDiff: ${JSON.stringify(payrollDiff)} => ${payFreqDays}`);
	if (verbose >= 2) console.log(`payFreqDays: ${payFreqDays}`);
	const payrollResult = { payFreq: null, annualIncome: 0, shift: "before", nextPayDates: [] };
	let payrollData = null;
	const paymentRequestData = [{ amount: 0, date: firstDateMoment.toDate() }, { amount: 0, date: payDateMoment.toDate() }];
	if (secondNextDateMoment) {
		paymentRequestData.push({ amount: 0, date: secondNextDateMoment.toDate() })
	}
	switch (payFreqDays) {
		case 6:
		case 7:
		case 8:
			payrollResult.payFreq = decisionCloudPeriodicity.WEEKLY;
			payrollData = getWeeklyPayrollData(paymentRequestData, now);
			break;
		case 12:
		case 13:
		case 14:
			payrollResult.payFreq = decisionCloudPeriodicity.BI_WEEKLY;
			payrollData = getBiWeeklyPayrollData(paymentRequestData, now);
			break;
		case 15:
		case 16:
		case 17:
		case 18:
			payrollResult.payFreq = decisionCloudPeriodicity.SEMI_MONTHLY;
			payrollData = getSemiMonthlyPayrollData(paymentRequestData, now);
			break;
		case 28:
		case 29:
		case 30:
		case 31:
			payrollResult.payFreq = decisionCloudPeriodicity.MONTHLY;
			payrollData = getMonthlyPayrollData(paymentRequestData, now);
			break;
		default:
			if (verbose >= 2) console.log(`payFreqDays: ${payFreqDays} '(pay freq not determined)'`);
			break;
	}
	if (!payrollData) {

		switch (frequency) {
			case decisionCloudPeriodicity.BI_WEEKLY:
				payrollResult.payFreq = decisionCloudPeriodicity.BI_WEEKLY;
				payrollData = getBiWeeklyPayrollData(paymentRequestData, now);
				break;
			case decisionCloudPeriodicity.MONTHLY:
				payrollResult.payFreq = decisionCloudPeriodicity.MONTHLY;
				payrollData = getMonthlyPayrollData(paymentRequestData, now);
				break;
			case decisionCloudPeriodicity.SEMI_MONTHLY:
				payrollResult.payFreq = decisionCloudPeriodicity.SEMI_MONTHLY;
				payrollData = getSemiMonthlyPayrollData(paymentRequestData, now);
				break;
			case decisionCloudPeriodicity.WEEKLY:
				payrollResult.payFreq = decisionCloudPeriodicity.WEEKLY;
				payrollData = getWeeklyPayrollData(paymentRequestData, now);
				break;
			default:
				if (verbose >= 2) console.log(`payFreqDays: ${payFreqDays} '(pay freq not determined)'`);
				break;
		}
	}

	//
	//

	if (payrollData !== null) {
		Object.assign(payrollResult, payrollData);
		// console.log( `${(userId || "")}; "${payrollGroup.name}"\n`, payrollResult, "\n\n" );
	}
	// console.log(JSON.stringify(payrollResult));

	return payrollResult.nextPayDates;


}


/**
 * weekly payroll
 * @param {Array} payrolls
 * @return {Object}
 */
function getWeeklyPayrollData(payrolls, now) {
	const nextPayDateFormat = "YYYY-MM-DD";
	const result = { shift: "before", nextPayDates: [] };
	const criteria = { period1: {}, exceptions: {} };
	const period1 = [];
	const p1Days = [];
	let annualIncome = 0;

	payrolls.forEach((payroll) => {
		// console.log( "payroll: %j", { date: moment( new Date( payroll.date ) ).format( "ddd MMM Do YYYY" ), name: payroll.name, amount: payroll.amount } );
		annualIncome += Math.abs(payroll.amount);
		annualIncome = parseFloat(annualIncome.toFixed(2)); // shave any extra decimal places
		const payDate = moment(new Date(payroll.date));
		const dateInfo = {
			"ddd": payDate.format("ddd"),
			"d": parseInt(payDate.format("d")),
			"day": parseInt(payDate.format("D")),
			"date": payDate.format(),
			"unix": parseInt(payDate.format("X"))
		};
		period1.push(dateInfo);
		p1Days.push(dateInfo.d);
	});
	result.annualIncome = parseFloat(((annualIncome / payrolls.length) * 52).toFixed(2));
	result.name = payrolls[(payrolls.length - 1)].name;
	const p1Day = MathExt.mode(p1Days);
	// console.log( `p1Days: ${JSON.stringify( p1Days )} => ${p1Day}` );
	const p1DateExceptions = [];
	const shifts = [];
	period1.forEach((dateInfo) => {
		if (dateInfo.d != p1Day) {
			const expectedDate = moment(dateInfo.date).day(p1Day);
			const expected = {
				"ddd": expectedDate.format("ddd"),
				"d": parseInt(expectedDate.format("d")),
				"day": parseInt(expectedDate.format("D")),
				"date": expectedDate.format(),
				"unix": parseInt(expectedDate.format("X"))
			};
			if (verbose >= 2) {
				console.log("[P1] dow exception:", JSON.stringify(dateInfo), JSON.stringify(expected));
			}
			shifts.push((parseInt(expected.unix) > dateInfo.unix ? 0 : 1));
			p1DateExceptions.push({ expected: expected, actual: dateInfo });
		}
	});
	result.shift = (MathExt.mode(shifts) == 1 ? "after" : "before");
	if (verbose >= 2) {
		console.log("shifts:", JSON.stringify(shifts), result.shift);
	}
	const p1DayProb = (100 - ((p1DateExceptions.length / period1.length) * 100));
	if (verbose >= 2) {
		console.log("p1 day probability: %d%", p1DayProb.toFixed(1));
	}
	if (p1DayProb >= 50) {
		criteria.period1.dayOfWeek = p1Day;
	} else {
		if (verbose >= 1) {
			console.log("Unable to determine weekly period(1) criteria!");
		}
	}
	if (verbose >= 1) {
		console.log("criteria:", JSON.stringify(criteria));
	}
	try {

		const nextDate = moment(now).add(7, "days").day(criteria.period1.dayOfWeek).startOf("day");
		nextDate.add(-20, "weeks");
		for (let i = 1; i <= 40; ++i) {
			if (parseInt(nextDate.format("d")) !== criteria.period1.dayOfWeek) {
				nextDate.day(criteria.period1.dayOfWeek);
			}
			// console.log( "[P1] nextDate:", nextDate.format( "ddd, MMM D YYYY" ) );
			result.nextPayDates.push(nextDate.format(nextPayDateFormat));
			nextDate.add(1, "weeks");
		}
	} catch (err) {

	}
	return result;
}



/**
 * bi-weekly payroll
 * @param {Array} payrolls
 * @return {Object}
 */
function getBiWeeklyPayrollData(payrolls, now) {
	const nextPayDateFormat = "YYYY-MM-DD";
	const result = { shift: "before", nextPayDates: [] };
	const criteria = { period1: {}, exceptions: {} };
	const period1 = [];
	const p1Days = [];
	let annualIncome = 0;
	payrolls.forEach((payroll) => {
		// console.log( "payroll: %j", { date: moment( new Date( payroll.date ) ).format( "ddd MMM Do YYYY" ), name: payroll.name, amount: payroll.amount } );
		annualIncome += Math.abs(payroll.amount);
		annualIncome = parseFloat(annualIncome.toFixed(2)); // shave any extra decimal places
		const payDate = moment(new Date(payroll.date));
		const dateInfo = {
			"ddd": payDate.format("ddd"),
			"d": parseInt(payDate.format("d")),
			"day": parseInt(payDate.format("D")),
			"date": payDate.format(),
			"unix": parseInt(payDate.format("X"))
		};
		period1.push(dateInfo);
		p1Days.push(dateInfo.d);
	});
	result.annualIncome = parseFloat(((annualIncome / payrolls.length) * 26).toFixed(2));
	result.name = payrolls[(payrolls.length - 1)].name;
	const p1Day = MathExt.mode(p1Days);
	if (verbose >= 2) {
		console.log(`p1Days: ${JSON.stringify(p1Days)} => ${p1Day}`);
	}
	const p1DateExceptions = [];
	const shifts = [];
	period1.forEach((dateInfo) => {
		if (dateInfo.d != p1Day) {
			const expectedDate = moment(dateInfo.date).day(p1Day);
			const expected = {
				"ddd": expectedDate.format("ddd"),
				"d": parseInt(expectedDate.format("d")),
				"day": parseInt(expectedDate.format("D")),
				"date": expectedDate.format(),
				"unix": parseInt(expectedDate.format("X"))
			};
			if (verbose >= 2) {
				console.log("[P1] dow exception: ", JSON.stringify(dateInfo), JSON.stringify(expected));
			}
			shifts.push((parseInt(expectedDate.format("X")) > dateInfo.unix ? 0 : 1));
			p1DateExceptions.push({ expected: expected, actual: dateInfo });
		}
	});
	result.shift = (MathExt.mode(shifts) == 1 ? "after" : "before");
	const p1DayProb = (100 - ((p1DateExceptions.length / period1.length) * 100));
	if (verbose >= 2) {
		console.log("p1 day probability: %d%", p1DayProb.toFixed(1));
	}
	if (p1DayProb >= 50) {
		criteria.period1.dayOfWeek = p1Day;
	} else {
		if (verbose >= 1) {
			console.log(`Unable to determine bi-weekly period(1) criteria!`);
		}
	}
	if (verbose >= 1) {
		console.log("criteria:", JSON.stringify(criteria));
	}
	if (!criteria.period1.hasOwnProperty("dayOfWeek")) {
		return result;
	}
	const lastPayDate = moment(new Date(payrolls.slice(-1)[0].date));
	const diffWeeks = Math.ceil(moment(now).add(1, "days").diff(lastPayDate, "days") / 14) * 2;
	const nextDate = moment(lastPayDate).startOf("day");
	nextDate.add(diffWeeks, "weeks");
	nextDate.day(criteria.period1.dayOfWeek);
	nextDate.add(-14, "weeks");
	for (let i = 1; i <= 14; ++i) {
		if (parseInt(nextDate.format("d")) !== criteria.period1.dayOfWeek) {
			nextDate.day(criteria.period1.dayOfWeek);
		}
		// console.log( "[P1] nextDate:", nextDate.format( "ddd, MMM D YYYY" ) );
		result.nextPayDates.push(nextDate.format(nextPayDateFormat));
		nextDate.add(2, "weeks");
	}
	return result;
}
/**
 * semi-monthly payroll
 * @param {Array} payrolls
 * @return {Object}
 */
function getSemiMonthlyPayrollData(payrolls, now) {
	const nextPayDateFormat = "YYYY-MM-DD";
	const result = { nextPayDates: [], shift: "before", annualIncome: 0 };
	const criteria = { period1: {}, period2: {}, exceptions: {} };
	const period1 = [];
	const period2 = [];
	const p1Days = [];
	const p2Days = [];
	let annualIncome = 0;
	payrolls.forEach((payroll) => {
		// console.log( "payroll: %j", { date: moment( new Date( payroll.date ) ).format( "ddd MMM Do YYYY" ), name: payroll.name, amount: payroll.amount } );
		annualIncome += Math.abs(payroll.amount);
		annualIncome = parseFloat(annualIncome.toFixed(2)); // shave any extra decimal places
		const payDate = moment(new Date(payroll.date));
		const dateInfo = {
			"ddd": payDate.format("ddd"),
			"d": parseInt(payDate.format("d")),
			"day": parseInt(payDate.format("D")),
			"date": payDate.format(),
			"unix": parseInt(payDate.format("X"))
		};
		if (dateInfo.day <= 15) {
			period1.push(dateInfo);
			p1Days.push(dateInfo.day);
		} else {
			period2.push(dateInfo);
			p2Days.push(dateInfo.day);
		}
	});
	result.annualIncome = parseFloat(((annualIncome / payrolls.length) * 2 * 12).toFixed(2));
	result.name = payrolls[(payrolls.length - 1)].name;
	// if( verbose > 1 ) console.log( `annualIncome: ${annualIncome} => ${result.annualIncome}` );
	const p1Day = MathExt.mode(p1Days);
	const p2Day = MathExt.mode(p2Days);
	if (verbose > 1) {
		console.log(`p1Days: ${JSON.stringify(p1Days)} => ${p1Day}`);
	}
	if (verbose > 1) {
		console.log(`p2Days: ${JSON.stringify(p2Days)} => ${p2Day}`);
	}
	const p1DateExceptions = [];
	const p2DateExceptions = [];
	const p2LastDayExceptions = [];
	const weekendExceptions = [];
	const p1DayShifts = [];
	const p2DayShifts = [];
	const lastDayShifts = [];
	period1.forEach((dateInfo) => {
		if (dateInfo.day != p1Day) {
			// console.log( "[P1] day exception:     ", dateInfo );
			const expectedDate = moment(dateInfo.date).date(p1Day);
			const expected = {
				"ddd": expectedDate.format("ddd"),
				"d": parseInt(expectedDate.format("d")),
				"day": parseInt(expectedDate.format("D")),
				"date": expectedDate.format(),
				"unix": parseInt(expectedDate.format("X"))
			};
			p1DayShifts.push((parseInt(expectedDate.format("X")) > dateInfo.unix ? 0 : 1));
			if (expected.d == 0 || expected.d == 6) {
				weekendExceptions.push(true);
			} else {
				if (verbose >= 2) {
					console.log("[P1] non-weekend exception:", JSON.stringify(dateInfo), JSON.stringify(expected));
				}
				p1DateExceptions.push({ expected: expected, actual: dateInfo });
			}
		}
	});
	period2.forEach((dateInfo) => {
		if (dateInfo.day != p2Day) {
			// console.log( "[P2] day exception:     ", dateInfo );
			const expectedDate = moment(dateInfo.date).date(p2Day);
			const expected = {
				"ddd": expectedDate.format("ddd"),
				"d": parseInt(expectedDate.format("d")),
				"day": parseInt(expectedDate.format("D")),
				"date": expectedDate.format(),
				"unix": parseInt(expectedDate.format("X"))
			};
			p2DayShifts.push((parseInt(expectedDate.format("X")) > dateInfo.unix ? 0 : 1));
			if (expected.d == 0 || expected.d == 6) {
				weekendExceptions.push(true);
			} else {
				if (verbose >= 2) {
					console.log("[P2] non-weekend exception:", JSON.stringify(dateInfo), JSON.stringify(expected));
				}
				p2DateExceptions.push({ expected: expected, actual: dateInfo });
			}
		}
		const lastDayOfMonth = moment(dateInfo.date).endOf("month");
		if (parseInt(lastDayOfMonth.format("D")) != dateInfo.day) {
			// console.log( "[P2] last day exception:", dateInfo );
			const expected = {
				"ddd": lastDayOfMonth.format("ddd"),
				"d": parseInt(lastDayOfMonth.format("d")),
				"day": parseInt(lastDayOfMonth.format("D")),
				"date": lastDayOfMonth.format(),
				"unix": parseInt(lastDayOfMonth.format("X"))
			};
			lastDayShifts.push((parseInt(lastDayOfMonth.format("X")) > dateInfo.unix ? 0 : 1));
			if (expected.d == 0 || expected.d == 6) {
				weekendExceptions.push(true);
			} else {
				if (verbose >= 2) {
					console.log("[P2] last day exception:", JSON.stringify(dateInfo), JSON.stringify(expected));
				}
				p2LastDayExceptions.push({ expected: expected, actual: dateInfo });
			}
		}
	});
	const p1DayProb = (100 - ((p1DateExceptions.length / period1.length) * 100));
	const p2DayProb = (100 - ((p2DateExceptions.length / period2.length) * 100));
	const p2LastDayProb = (100 - ((p2LastDayExceptions.length / period2.length) * 100));
	if (verbose >= 2) {
		console.log("p1 day probability: %d%", p1DayProb.toFixed(1));
	}
	if (verbose >= 2) {
		console.log("p2 day probability: %d%", p2DayProb.toFixed(1));
	}
	if (verbose >= 2) {
		console.log("p2 last day probability: %d%", p2LastDayProb.toFixed(1));
	}
	if (p1DayProb >= 50) {
		criteria.period1.dayOfMonth = p1Day;
	} else {
		if (verbose >= 1) {
			console.log(`Unable to determine semi-monthly period(1) criteria!`);
		}
	}
	if (p2Day >= 28 && p2LastDayProb >= 50) {
		criteria.period2.endOfMonth = true;
	} else if (p2DayProb >= 50) {
		criteria.period2.dayOfMonth = p2Day;
		// adjust period2 dayOfMonth -- best guess
		const checkDateWeekend = isWeekend(moment(period2[0].date).date(20));
		if (period2.length == 1 && p2Day < 20 && result.shift == "before" && checkDateWeekend) {
			criteria.period2.dayOfMonth = 20;
		}
	} else {
		if (verbose >= 1) {
			console.log("Unable to determine period(2) criteria!");
		}
	}
	const shifts = [];
	if (p1DayShifts.length) {
		shifts.push((MathExt.mode(p1DayShifts) == 1 ? 1 : 0));
		if (verbose >= 2) {
			console.log("p1DayShifts:", p1DayShifts, `=> ${result.shift}`);
		}
	}
	if (p2DayShifts.length) {
		shifts.push((MathExt.mode(p2DayShifts) == 1 ? 1 : 0));
		if (verbose >= 2) {
			console.log("p2DayShifts:", p2DayShifts, `=> ${result.shift}`);
		}
	}
	if (lastDayShifts.length) {
		shifts.push((MathExt.mode(lastDayShifts) == 1 ? 1 : 0));
		if (verbose >= 2) {
			console.log("lastDayShifts:", lastDayShifts, `=> ${result.shift}`);
		}
	}
	if (shifts.length > 2) {
		result.shift = (MathExt.mode(shifts) == 1 ? "after" : "before");
	} else if (criteria.period2.hasOwnProperty("dayOfMonth")) {
		result.shift = (MathExt.mode(p2DayShifts) == 1 ? "after" : "before");
	} else if (criteria.period2.hasOwnProperty("endOfMonth")) {
		result.shift = (MathExt.mode(lastDayShifts) == 1 ? "after" : "before");
	}
	if (verbose >= 1) {
		console.log("criteria:", JSON.stringify(criteria));
	}
	const nextDate = moment(now).startOf("day");
	nextDate.add(-150, "days");
	for (let i = 1; i <= 20; ++i) {
		const nextPeriod = (parseInt(nextDate.format("D")) >= 16 ? 2 : 1);
		if (nextPeriod == 1) {
			if (criteria.period1.hasOwnProperty("dayOfMonth")) {
				nextDate.date(criteria.period1.dayOfMonth);
				adjustWeekendDates(nextDate, result.shift);
				result.nextPayDates.push(nextDate.format(nextPayDateFormat));
			} else {
				console.log("[P1] MISSING CRITERIA!");
			}
			// console.log( "[P1] pay date:", nextDate.format( "ddd, MMM D YYYY" ) );
			nextDate.add(20, "days");
			// console.log( "[P1] nextDate:", nextDate.format( "ddd, MMM D YYYY" ) );
		} else {
			if (criteria.period2.hasOwnProperty("dayOfMonth")) {
				nextDate.date(criteria.period2.dayOfMonth);
				adjustWeekendDates(nextDate, result.shift);
				result.nextPayDates.push(nextDate.format(nextPayDateFormat));
			} else if (criteria.period2.hasOwnProperty("endOfMonth") && criteria.period2.endOfMonth) {
				nextDate.endOf("month");
				adjustWeekendDates(nextDate, result.shift);
				result.nextPayDates.push(nextDate.format(nextPayDateFormat));
			} else {
				console.log("[P2] MISSING CRITERIA!");
			}
			// console.log( "[P2] pay date:", nextDate.format( "ddd, MMM D YYYY" ) );
			nextDate.add(1, "months").date(1);
			// console.log( "[P2] nextDate:", nextDate.format( "ddd, MMM D YYYY" ) );
		}
		// console.log( "nextDate:", nextDate.format( "ddd, MMM D YYYY" ) );
	}
	return result;
}


/**
 * monthly payroll
 * @param {Array} payrolls
 * @return {Object}
 */
function getMonthlyPayrollData(payrolls, now) {
	const nextPayDateFormat = "YYYY-MM-DD";
	const result = { shift: "before", nextPayDates: [] };
	const criteria = { period1: {}, exceptions: {} };
	const period1 = [];
	const p1Days = [];
	const p1DoWs = [];
	let annualIncome = 0;
	payrolls.forEach((payroll) => {
		// console.log( "payroll: %j", { date: moment( new Date( payroll.date ) ).format( "ddd MMM Do YYYY" ), name: payroll.name, amount: payroll.amount } );
		annualIncome += Math.abs(payroll.amount);
		annualIncome = parseFloat(annualIncome.toFixed(2)); // shave any extra decimal places
		const payDate = moment(new Date(payroll.date));
		const dateInfo = {
			"ddd": payDate.format("ddd"),
			"d": parseInt(payDate.format("d")),
			"day": parseInt(payDate.format("D")),
			"date": payDate.format(),
			"unix": parseInt(payDate.format("X"))
		};
		period1.push(dateInfo);
		p1Days.push(dateInfo.day);
		p1DoWs.push(dateInfo.d);
	});
	result.annualIncome = parseFloat(((annualIncome / payrolls.length) * 12).toFixed(2));
	result.name = payrolls[(payrolls.length - 1)].name;
	const p1Day = MathExt.mode(p1Days);
	if (verbose >= 2) {
		console.log(`p1Days: ${JSON.stringify(p1Days)} => ${p1Day}`);
	}
	const p1DoW = MathExt.mode(p1DoWs);
	if (verbose >= 2) {
		console.log(`p1DoWs: ${JSON.stringify(p1DoWs)} => ${p1DoW}`);
	}
	const p1DateExceptions = [];
	const p1LastDayExceptions = [];
	const p1FirstDoWExceptions = [];
	const weekendExceptions = [];
	const shifts = [];
	period1.forEach((dateInfo) => {
		if (dateInfo.day != p1Day) {
			// if( verbose >= 2 ) console.log( "[P1] day exception:     ", JSON.stringify( dateInfo ) );
			const expectedDate = moment(dateInfo.date).date(p1Day);
			const expected = {
				"ddd": expectedDate.format("ddd"),
				"d": parseInt(expectedDate.format("d")),
				"day": parseInt(expectedDate.format("D")),
				"date": expectedDate.format()
			};
			shifts.push((parseInt(expectedDate.format("X")) > dateInfo.unix ? 0 : 1));
			if (expected.d == 0 || expected.d == 6) {
				weekendExceptions.push(true);
			} else {
				// if( verbose ) console.log( "[P1] non-weekend exception:     ", JSON.stringify( dateInfo ), JSON.stringify( expected ) );
				p1DateExceptions.push({ expected: expected, actual: dateInfo });
			}
		}
		const lastDayOfMonth = moment(dateInfo.date).endOf("month");
		if (parseInt(lastDayOfMonth.format("D")) != dateInfo.day) {
			const expected = {
				"ddd": lastDayOfMonth.format("ddd"),
				"d": parseInt(lastDayOfMonth.format("d")),
				"day": parseInt(lastDayOfMonth.format("D")),
				"date": lastDayOfMonth.format()
			};
			if (expected.d == 0 || expected.d == 6) {
				weekendExceptions.push(true);
			} else {
				// if( verbose >= 2 ) console.log( "[P1] last day exception:", JSON.stringify( dateInfo ), JSON.stringify( expected ) );
				p1LastDayExceptions.push({ expected: expected, actual: dateInfo });
			}
		}
		const firstDoW = moment(dateInfo.date).date(1).day(p1DoW);
		// console.log( "firstDoW:", firstDoW.format( "dddd, MMMM Do YYYY" ) );
		if (parseInt(firstDoW.format("D")) != dateInfo.day) {
			const expected = {
				"ddd": firstDoW.format("ddd"),
				"d": parseInt(firstDoW.format("d")),
				"day": parseInt(firstDoW.format("D")),
				"date": firstDoW.format()
			};
			if (verbose >= 2) {
				console.log("[P1] first dow exception:", JSON.stringify(dateInfo), JSON.stringify(expected));
			}
			p1FirstDoWExceptions.push({ expected: expected, actual: dateInfo });
		}
	});
	const p1DayProb = (100 - ((p1DateExceptions.length / period1.length) * 100));
	const p1LastDayProb = (100 - ((p1LastDayExceptions.length / period1.length) * 100));
	const p1FirstDoWProb = (100 - ((p1FirstDoWExceptions.length / period1.length) * 100));
	if (verbose >= 2) {
		console.log("p1 day probability: %d%", p1DayProb.toFixed(1));
	}
	if (verbose >= 2) {
		console.log("p1 last day probability: %d%", p1LastDayProb.toFixed(1));
	}
	if (verbose >= 2) {
		console.log("p1 first dow probability: %d%", p1FirstDoWProb.toFixed(1));
	}
	if (p1DayProb >= 50 && p1DayProb > p1LastDayProb && p1DayProb > p1FirstDoWProb) {
		criteria.period1.day = p1Day;
	} else if (p1LastDayProb >= 50 && p1LastDayProb > p1FirstDoWProb) {
		criteria.period1.endOfMonth = true;
	} else if (p1FirstDoWProb >= 50) {
		criteria.period1.firstOfMonthDoW = p1DoW;
		result.shift = "after";
	} else {
		console.log("Unable to determine monthly period(1) criteria!");
	}
	if (shifts.length) {
		if (verbose >= 2) {
			console.log("shifts:", shifts);
		}
	}
	if (verbose >= 1) {
		console.log(`criteria:`, JSON.stringify(criteria));
	}
	// const lastPayDate = moment( new Date( payrolls.slice( -1 )[ 0 ].date ) );
	// const diffMonths = moment( now ).add( 1, "days" ).diff( lastPayDate, "months" );
	// const nextDate = moment( lastPayDate ).startOf( "day" );
	const nextDate = moment(now).date(1);
	// nextDate.add( diffMonths, "months" );
	// if( parseInt( nextDate.format( "x" ) ) < now.getTime() ) {
	// 	nextDate.add( 31, "days" ).date( 1 );
	// }
	// console.log( `nextDate:`, nextDate.format( nextPayDateFormat ) );
	for (let i = 1; i <= 4; ++i) {
		if (criteria.period1.hasOwnProperty("day")) {
			nextDate.date(criteria.period1.day);
			adjustWeekendDates(nextDate, result.shift);
			result.nextPayDates.push(nextDate.format(nextPayDateFormat));
		} else if (criteria.period1.hasOwnProperty("endOfMonth")) {
			nextDate.endOf("month");
			adjustWeekendDates(nextDate, result.shift);
			result.nextPayDates.push(nextDate.format(nextPayDateFormat));
		} else if (criteria.period1.hasOwnProperty("firstOfMonthDoW")) {
			if (parseInt(nextDate.format("d")) > criteria.period1.firstOfMonthDoW) {
				nextDate.add(1, "weeks");
			}
			nextDate.day(criteria.period1.firstOfMonthDoW);
			result.nextPayDates.push(nextDate.format(nextPayDateFormat));
		}
		nextDate.add(31, "days").date(1);
		// console.log( "nextDate:", nextDate.format( "dddd, MMMM Do YYYY" ) );
	}
	return result;
}


/**
 * moment is weekend
 * @param {Moment} date
 * @return {boolean}
 */
function isWeekend(date) {
	const dayOfWeek = parseInt(date.format("d"));
	return (dayOfWeek == 0 || dayOfWeek == 6);
}

/**
 * adjust date to before || after weekend
 * @param {Moment} date
 * @param {string} shift "before" || "after"
 * @return {Moment}
 */
function adjustWeekendDates(date, shift) {
	while (isWeekend(date)) {
		if (shift == "before") {
			date.subtract(1, "days");
		} else {
			date.add(1, "days");
		}
	}
	return date;
}

function occurencePct(array, value) {
	const counts = [];
	if (!Array.isArray(array)) {
		return 0;
	}
	array.forEach((item) => {
		if (item == value) {
			counts.push(item);
		}
	});
	return ((counts.length / array.length) * 100);
}

function isDateOnAHoliday(dateToCheck) {
	if (dateToCheck) {
		const momentDate = moment(dateToCheck).startOf("day").add(10, "hour");
		const publicHolidays = hd.isHoliday(momentDate.toDate());
		// console.log( momentDate.format("YYYY-MM-DD") + " is holiday: " + (publicHolidays && publicHolidays.type === "public"));
		return publicHolidays && publicHolidays.type === "public";
	}
	// console.log("is holiday: false (no date passed in)");
	return false;
}

function isDateOnABusinessDay(dateToCheck) {
	if (dateToCheck) {
		const momentDate = moment(dateToCheck).startOf("day").add(10, "hour");
		const weekDay = momentDate.weekday();
		// console.log(momentDate.format("YYYY-MM-DD") + " is business day: " + (weekDay > 0 && weekDay < 6));
		return weekDay > 0 && weekDay < 6;
	}
	return true;
}

function getHolidayDates(year = moment().year()) {
	const holidayDates = [];
	let currentYearGetHolidays = hd.getHolidays(year);

	const today = moment().startOf("day");
	if (today.month() > 9) {
		currentYearGetHolidays = [].concat(currentYearGetHolidays).concat(hd.getHolidays(year + 1));
	}

	_.forEach(currentYearGetHolidays, (holiday) => {
		if (holiday && holiday.type === "public") {
			holidayDates.push(holiday.date.substr(0, 10));
		}
	});
	return holidayDates;
}
function getNextPaymentDateScheduleByMonths(scheduleDate, frequency, numberOfMonths = 3, placeDateAfterHoliday = false) {
	if (numberOfMonths < 3) {
		numberOfMonths = 3;
	}
	const payScheduleArray = [];
	let schedulePaymentDateMoment = moment(scheduleDate);
	let currentMonth = moment(schedulePaymentDateMoment).startOf("month").startOf("day");
	let dateNeverChanging = moment(schedulePaymentDateMoment);
	let temp1 = 0;
	let temp2 = 0;
	for (let i = 1; i <= numberOfMonths + 1; i++) {
		while (currentMonth.month() === schedulePaymentDateMoment.month() && currentMonth.year() === schedulePaymentDateMoment.year()) {
			const payFrequency = frequency || decisionCloudPeriodicity.BI_WEEKLY;
			switch (payFrequency) {
				case decisionCloudPeriodicity.BI_WEEKLY:
					schedulePaymentDateMoment = schedulePaymentDateMoment.add(14, "days");
					break;
				case decisionCloudPeriodicity.MONTHLY:
					schedulePaymentDateMoment = schedulePaymentDateMoment.add(1, "month");
					break;
				case decisionCloudPeriodicity.SEMI_MONTHLY:
					if (i % 2 === 1) {
						temp1 += 1;
						schedulePaymentDateMoment = moment(dateNeverChanging).add(15, "days").add(temp1 - 1, "months");
					} else {
						temp2 += 1;
						schedulePaymentDateMoment = moment(dateNeverChanging).add(temp2, "months");
					}
					break;
				case decisionCloudPeriodicity.WEEKLY:
					schedulePaymentDateMoment = schedulePaymentDateMoment.add(7, "days");
					break;
			}
			const newSchedulePaymentDate = moment(getBusinessDateBasedOnBankDays(schedulePaymentDateMoment.toDate(), placeDateAfterHoliday));
			if (newSchedulePaymentDate.startOf("day").diff(schedulePaymentDateMoment.startOf("day")) !== 0) {
				payScheduleArray.push(newSchedulePaymentDate.format("YYYY-MM-DD"));
			} else {
				payScheduleArray.push(schedulePaymentDateMoment.format("YYYY-MM-DD"));
			}
			//schedulePaymentDateMoment = moment(getBusinessDateBasedOnBankDays(schedulePaymentDateMoment.toDate(), payFrequency, placeDateAfterHoliday));
			//payScheduleArray.push(schedulePaymentDateMoment.format("YYYY-MM-DD"))
		}
		currentMonth = moment(currentMonth).add(1, "month");
	}
	return payScheduleArray;
}

