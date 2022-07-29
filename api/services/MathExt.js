/* global sails, MathExt */
"use strict";

module.exports = {
	mode,
	mean,
	range,
	pmt,
	makeAmortizationSchedule,
	float
};


/**
 * return most repeated number
 * https://jonlabelle.com/snippets/view/javascript/calculate-mean-median-mode-and-range-in-javascript
 * @param {Array} numbers
 * @return {number}
 */
function mode( numbers ) {
	const modes = [];
	const count = [];
	let i;
	let number;
	let maxIndex = 0;

	for( i = 0; i < numbers.length; ++i ) {
		number = numbers[ i ];
		count[ number ] = ( count[ number ] || 0 ) + 1;
		if( count[ number ] > maxIndex ) {
			maxIndex = count[ number ];
		}
	}

	for( i in count ) {
		if( count.hasOwnProperty( i ) ) {
			if( count[ i ] === maxIndex ) {
				modes.push( Number( i ) );
			}
		}
	}
	return parseInt( modes.shift() );
}


/**
 * mean (average) of an array of numbers
 * https://jonlabelle.com/snippets/view/javascript/calculate-mean-median-mode-and-range-in-javascript
 * @param {Array} numbers
 * @return {number}
 */
function mean( numbers ) {
	// return ( numbers.reduce( ( p, c ) => ( p + c ) ) / numbers.length );
	let total = 0;
	let i;
	for( i = 0; i < numbers.length; ++i ) {
		total += numbers[ i ];
	}
	return ( total / numbers.length );
}


/**
 * The "range" of a list a numbers is the difference between the largest and smallest values.
 * https://jonlabelle.com/snippets/view/javascript/calculate-mean-median-mode-and-range-in-javascript
 * @param {Array} numbers an array of numbers.
 * @return {Array} the range of the specified numbers.
 */
function range( numbers ) {
	numbers.sort( sortAsc );
	return [ numbers[ 0 ], numbers[ ( numbers.length - 1 ) ] ].sort( sortAsc );

	function sortAsc( a, b ) {
		return a - b;
	}
}


/**
 * Excel PMT
 * const payment = MathExt.PMT( ( interestRate / 100 ) / 12, term, principal );
 * @param {number} ir interest rate per month
 * @param {number} np number of periods (months)
 * @param {number} pv present value
 * @return {number}
 */
function pmt( ir, np, pv ) {
	return ir * pv * Math.pow( ( 1 + ir ), np ) / ( 1 - Math.pow( ( 1 + ir ), np ) );
}


/**
 * make amortization schedule
 * @param {number} _principal
 * @param {number} _payment
 * @param {number} _interestRate
 * @param {number} _term
 * @return {Object}
 */
function makeAmortizationSchedule( _principal, _payment, _interestRate, _term ) {
	// sails.log.verbose( "makeAmortizationSchedule; _principal:", _principal, "_payment:", _payment, "_interestRate:", _interestRate, "_term:", _term );
	const maxAttempts = 100;
	let attempt = 0;

	return amortize( _principal, _payment, _interestRate, _term );

	function amortize( principal, payment, interestRate, term ) {
		++attempt;
		let principalBalance = ( 0 + principal );
		let financeCharge = 0;
		let principalPaid = 0;
		const rate = float( ( ( interestRate / 12 ) / 100 ), 7 );
		// sails.log( `makeAmortizationSchedule; rate: ${rate}` );
		const schedule = [];
		for( let m = 1; m <= term; ++m ) {
			const interestPmt = MathExt.float( principalBalance * rate );
			const principalPmt = MathExt.float( ( principalBalance > payment ? ( payment - interestPmt ) : principalBalance ) );
			let balance = ( principalBalance - principalPmt );
			balance = MathExt.float( balance );
			financeCharge = MathExt.float( financeCharge + interestPmt );
			principalPaid = MathExt.float( principalPaid + principalPmt );
			const pmt = {
				id: m,
				payment: MathExt.float( principalPmt + interestPmt ),
				interest: interestPmt,
				principal: principalPmt,
				startBalance: principalBalance,
				endBalance: balance
			};
			// sails.log.verbose( "pmt:", JSON.stringify( pmt ) );
			schedule.push( pmt );
			// if( pmt.payment > payment ) {
			// 	sails.log.verbose( `makeAmortizationSchedule; ${pmt.payment} > ${payment}` );
			// 	break; // reattempt with adjusted payment
			// }
			principalBalance = balance;
		}
		// sails.log.verbose( "makeAmortizationSchedule; principalBalance:", principalBalance );
		if( principalBalance !== 0 && attempt <= maxAttempts ) {
			const adjustedPayment = MathExt.float( payment + 0.01 );
			sails.log.verbose( `makeAmortizationSchedule; balance: ${principalBalance}  adjustedPayment: ${adjustedPayment}` );
			return amortize( principal, adjustedPayment, interestRate, term );
		}
		// sails.log.verbose( "makeAmortizationSchedule; principalPaid:", principalPaid );
		// sails.log.verbose( "makeAmortizationSchedule; financeCharge:", financeCharge );
		// sails.log.verbose( `makeAmortizationSchedule; attempts: ${attempt}  payment: ${payment}` );
		return { payment: payment, financeCharge: financeCharge, schedule: schedule };
	}
}


/**
 * float
 * @param {number} number
 * @param {number} precision default to 2 decimal places
 * @return {number}
 */
function float( number, precision ) {
	if( typeof precision !== "number" ) precision = 2;
	return parseFloat( parseFloat( number ).toFixed( precision ) );
}
