/* globals sails, MathExt, Utils */

"use strict";

const moment = require( "moment" );

module.exports = {
	getInfo: getInfo,
	categorizeTransactions: categorizeTransactions
};


/**
 * categorize (payroll) transactions
 * @param {Array} transactions
 * @return {Object}
 */
function categorizeTransactions( transactions ) {
	const payrolls = [];
	const deposits = [];
	const credits = [];
	transactions.sort( transactionSort );
	transactions.forEach( ( transaction ) => {
		if( transaction.amount >= 0 ) {
			return;
		}
		// PAYROLL (DIRECT DEPOSIT)
		if( [ "21009000", "21009001" ].indexOf( transaction.category_id ) >= 0 ) {
			// sails.log.info( "payroll: %j", { date: moment( new Date( transaction.date ) ).format( "ddd MMM Do YYYY" ), name: transaction.name, amount: transaction.amount } );
			let nameIdx = null;
			payrolls.some( ( payrollName, idx ) => {
				if( payrollName.name.includes( transaction.name ) || transaction.name.includes( payrollName.name ) ) {
					nameIdx = idx;
					return true;
				}
				const similarPct = Utils.strSimilarity( payrollName.name, transaction.name );
				// console.log( "similarPct:", similarPct );
				if( similarPct >= 0.8 ) {
					nameIdx = idx;
					return true;
				}
			} );
			if( nameIdx === null ) {
				payrolls.push( { name: transaction.name, payrolls: [ transaction ] } );
			} else {
				let sameDay = false;
				let sameDayIdx = false;
				const transactionDate = moment( transaction.date ).format( "YYYY-MM-DD" );
				payrolls[ nameIdx ].payrolls.some( ( payroll, idx ) => {
					if( moment( payroll.date ).format( "YYYY-MM-DD" ) == transactionDate ) {
						sameDay = true;
						sameDayIdx = idx;
						return true;
					}
				} );
				if( sameDay ) {
					payrolls[ nameIdx ].payrolls[ sameDayIdx ].amount += transaction.amount;
					payrolls[ nameIdx ].payrolls[ sameDayIdx ].amount = parseFloat( payrolls[ nameIdx ].payrolls[ sameDayIdx ].amount.toFixed( 2 ) );
					// sails.log.info( `adding same-day payrolls: ${payrolls[ nameIdx ].payrolls[ sameDayIdx ].amount}` );
				} else {
					payrolls[ nameIdx ].payrolls.push( transaction );
				}
			}
			return;
		}
		// DEPOSITS / TRANSFERS
		if( transaction.amount < 0 && ( ( transaction.category_id && transaction.category_id.startsWith( "210" ) ) ) ) {
			// deposits.push( transaction );
			// sails.log.info( "deposit: %j", { date: moment( new Date( transaction.date ) ).format( "ddd MMM Do YYYY" ), name: transaction.name, amount: transaction.amount } );
			return;
		}
		// CREDIT
		if( transaction.amount < 0 ) {
			// credits.push( transaction );
			// sails.log.info( "credit:", { date: moment( new Date( transaction.date ) ).format( "ddd MMM Do YYYY" ), name: transaction.name, amount: transaction.amount, category_id: transaction.category_id, category: transaction.category } );
		}
	} );
	return { payrolls: payrolls, deposits: deposits, credits: credits };
}


/**
 * Payroll Detection class
 * @param {Array} transactions
 * @param {string} userId
 * @return {Object}
 */
function getInfo( transactions, userId ) {
	const result = { annualIncome: 0, payrolls: [], transactions: [] };
	const now = new Date();
	const verbose = 1;
	// const nextPayDateFormat = "ddd YYYY-MM-DDTHH:mm:ssZ";
	const nextPayDateFormat = "YYYY-MM-DDTHH:mm:ssZ";

	const sortedTrans = categorizeTransactions( transactions );
	const payrolls = sortedTrans.payrolls;

	payrolls.forEach( ( payrollGroup ) => {
		// sails.log.verbose( "payrollGroup:", JSON.stringify( payrollGroup, null, 4 ) );
		const payrollDiff = [];
		const mostRecentPayroll = moment( payrollGroup.payrolls[ ( payrollGroup.payrolls.length - 1 ) ].date );
		const mostRecentTransaction = moment( transactions[ ( transactions.length - 1 ) ].date );
		const daysSincePayroll = mostRecentTransaction.diff( mostRecentPayroll, "days" );
		// sails.log.info( `"${payrollGroup.name}" daysSincePayroll:`, daysSincePayroll, mostRecentPayroll.format() );
		if( sails.config.isSandbox !== true && daysSincePayroll > 45 ) {
			return;
		}

		payrollGroup.payrolls.forEach( ( payroll, idx ) => {
			// sails.log.info( "payroll: %j", { date: moment( new Date( payroll.date ) ).format( "ddd MMM Do YYYY" ), name: payroll.name, amount: payroll.amount } );
			if( idx === 0 ) {
				return;
			}
			const prev = payrollGroup.payrolls[ ( idx - 1 ) ];
			const firstDate = new Date( prev.date );
			const nextDate = new Date( payroll.date );
			firstDate.setHours( 0, 0, 0, 0 );
			nextDate.setHours( 0, 0, 0, 0 );
			const payDate = moment( nextDate );
			const diffDays = payDate.diff( moment( firstDate ), "days" );
			// sails.log.info( `"${payrollGroup.name}" ${moment( firstDate ).format()} - ${payDate.format()} = ${diffDays}` );
			if( diffDays >= 32 ) {
				return;
			}
			payrollDiff.push( diffDays );
		} );
		if( payrollDiff.length == 0 ) {
			sails.log.info( `${( userId || "" )} "${payrollGroup.name}" unable to determine payroll(s) ${payrollGroup.payrolls.length}` );
			return;
		}
		const freqRangeDays = MathExt.range( payrollDiff );
		const freqRange = Math.abs( freqRangeDays[ 1 ] - freqRangeDays[ 0 ] );
		const freqMode = MathExt.mode( payrollDiff );
		const freqMean = MathExt.mean( payrollDiff );
		let payFreqDays = freqMode;
		if( freqRange > 7 ) {
			const modes = [];
			payrollDiff.forEach( ( diffDays ) => {
				if( diffDays == freqMode || ( diffDays - 1 ) == freqMode || ( diffDays + 1 ) == freqMode ) {
					modes.push( true );
				}
			} );
			const modeProb = ( ( modes.length / payrollDiff.length ) * 100 );
			if( verbose >= 2 ) sails.log.info( `"${payrollGroup.name}" modeProb: ${modeProb}` );
			payFreqDays = ( modeProb >= 50 ? freqMode : -1 );
			if( payFreqDays == -1 && freqMean > freqMode && ( freqMean - freqMode ) > 7 ) {
				const modePct = occurencePct( payrollDiff, freqMode );
				// sails.log.info( `"${payrollGroup.name}" freqMode(day) modePct: ${modePct}` );
				for( let day = ( freqMode + 1 ); day <= freqRangeDays[ 1 ]; ++day ) {
					const occPct = occurencePct( payrollDiff, day );
					// sails.log.info( `"${payrollGroup.name}" freqMode(day): ${day} = ${occPct}` );
					if( occPct >= modePct ) {
						payFreqDays = day;
					}
				}
			}
		} else if( freqMean > freqMode && occurencePct( payrollDiff, freqMode ) == 50 ) {
			// bi-weekly and semi-monthly contest
			if( freqMode >= 14 ) {
				for( let day = ( freqMode + 1 ); day <= freqRangeDays[ 1 ]; ++day ) {
					const occPct = occurencePct( payrollDiff, day );
					// sails.log.info( `"${payrollGroup.name}" freqMode(day): ${day} = ${occPct}` );
					if( occPct >= 50 ) {
						payFreqDays = day;
					}
				}
			}
		}
		if( verbose >= 2 ) sails.log.info( `"${payrollGroup.name}" freqRangeDays: ${JSON.stringify( freqRangeDays )} => ${( freqRangeDays[ 1 ] - freqRangeDays[ 0 ] )}` );
		if( verbose >= 2 ) sails.log.info( `"${payrollGroup.name}" freqMode: ${JSON.stringify( freqMode )}` );
		if( verbose >= 2 ) sails.log.info( `"${payrollGroup.name}" freqMean: ${JSON.stringify( freqMean )}` );
		if( verbose >= 2 ) sails.log.info( `"${payrollGroup.name}" payrollDiff: ${JSON.stringify( payrollDiff )} => ${payFreqDays}` );
		if( verbose >= 2 ) sails.log.info( ` "${payrollGroup.name}" payFreqDays: ${payFreqDays} (${payrollGroup.payrolls.length})` );
		const payrollResult = { payFreq: null, annualIncome: 0, shift: "before", nextPayDates: [] };
		let payrollData = null;
		switch( payFreqDays ) {
			case 6:
			case 7:
			case 8:
				payrollResult.payFreq = "weekly";
				payrollData = getWeeklyPayrollData( payrollGroup.payrolls );
				break;
			case 12:
			case 13:
			case 14:
				payrollResult.payFreq = "bi-weekly";
				payrollData = getBiWeeklyPayrollData( payrollGroup.payrolls );
				break;
			case 15:
			case 16:
			case 17:
			case 18:
				payrollResult.payFreq = "semi-monthly";
				payrollData = getSemiMonthlyPayrollData( payrollGroup.payrolls );
				break;
			case 28:
			case 29:
			case 30:
			case 31:
				payrollResult.payFreq = "monthly";
				payrollData = getMonthlyPayrollData( payrollGroup.payrolls );
				break;
			default:
				sails.log.info( `${( userId || "" )}; "${payrollGroup.name}" payFreqDays: ${payFreqDays} (${payrollGroup.payrolls.length})` );
				break;
		}
		if( payrollData !== null ) {
			Object.assign( payrollResult, payrollData );
			// sails.log.info( `${(userId || "")}; "${payrollGroup.name}"\n`, payrollResult, "\n\n" );
		}
		// sails.log.info( `${payrollGroup.name}\n`, payrollResult );
		result.transactions = result.transactions.concat( payrollGroup.payrolls );
		result.annualIncome += payrollResult.annualIncome;
		result.annualIncome = parseFloat( result.annualIncome.toFixed( 2 ) ); // shave any extra decimal places
		result.payrolls.push( payrollResult );
	} );
	result.transactions.sort( transactionSort );
	result.payrolls.sort( ( a, b ) => a.annualIncome = b.annualIncome );
	return result;


	/**
	 * weekly payroll
	 * @param {Array} payrolls
	 * @return {Object}
	 */
	function getWeeklyPayrollData( payrolls ) {
		const result = { shift: "before", nextPayDates: [] };
		const criteria = { period1: {}, exceptions: {} };
		const period1 = [];
		const p1Days = [];
		let annualIncome = 0;
		payrolls.forEach( ( payroll ) => {
			// sails.log.info( "payroll: %j", { date: moment( new Date( payroll.date ) ).format( "ddd MMM Do YYYY" ), name: payroll.name, amount: payroll.amount } );
			annualIncome += Math.abs( payroll.amount );
			annualIncome = parseFloat( annualIncome.toFixed( 2 ) ); // shave any extra decimal places
			const payDate = moment( new Date( payroll.date ) );
			const dateInfo = { "ddd": payDate.format( "ddd" ), "d": parseInt( payDate.format( "d" ) ), "day": parseInt( payDate.format( "D" ) ), "date": payDate.format(), "unix": parseInt( payDate.format( "X" ) ) };
			period1.push( dateInfo );
			p1Days.push( dateInfo.d );
		} );
		result.annualIncome = parseFloat( ( ( annualIncome / payrolls.length ) * 52 ).toFixed( 2 ) );
		result.name = payrolls[ ( payrolls.length - 1 ) ].name;
		const p1Day = MathExt.mode( p1Days );
		// sails.log.info( `p1Days: ${JSON.stringify( p1Days )} => ${p1Day}` );
		const p1DateExceptions = [];
		const shifts = [];
		period1.forEach( ( dateInfo ) => {
			if( dateInfo.d != p1Day ) {
				const expectedDate = moment( dateInfo.date ).day( p1Day );
				const expected = { "ddd": expectedDate.format( "ddd" ), "d": parseInt( expectedDate.format( "d" ) ), "day": parseInt( expectedDate.format( "D" ) ), "date": expectedDate.format(), "unix": parseInt( expectedDate.format( "X" ) ) };
				if( verbose >= 2 ) sails.log.info( "[P1] dow exception:", JSON.stringify( dateInfo ), JSON.stringify( expected ) );
				shifts.push( ( parseInt( expected.unix ) > dateInfo.unix ? 0 : 1 ) );
				p1DateExceptions.push( { expected: expected, actual: dateInfo } );
			}
		} );
		result.shift = ( MathExt.mode( shifts ) == 1 ? "after" : "before" );
		if( verbose >= 2 ) sails.log.info( "shifts:", JSON.stringify( shifts ), result.shift );
		const p1DayProb = ( 100 - ( ( p1DateExceptions.length / period1.length ) * 100 ) );
		if( verbose >= 2 ) sails.log.info( "p1 day probability: %d%", p1DayProb.toFixed( 1 ) );
		if( p1DayProb >= 50 ) {
			criteria.period1.dayOfWeek = p1Day;
		} else {
			if (verbose >= 1 ) sails.log.warn( `${( userId || "" )}; Unable to determine weekly period(1) criteria!` );
		}
		if( verbose >= 1 ) sails.log.info( "criteria:", JSON.stringify( criteria ) );
		const nextDate = moment( now ).add( 7, "days" ).day( criteria.period1.dayOfWeek ).startOf( "day" );
		for( let i = 1; i <= 13; ++i ) {
			if( parseInt( nextDate.format( "d" ) ) !== criteria.period1.dayOfWeek ) {
				nextDate.day( criteria.period1.dayOfWeek );
			}
			// sails.log.info( "[P1] nextDate:", nextDate.format( "ddd, MMM D YYYY" ) );
			result.nextPayDates.push( nextDate.format( nextPayDateFormat ) );
			nextDate.add( 1, "weeks" );
		}
		return result;
	}


	/**
	 * bi-weekly payroll
	 * @param {Array} payrolls
	 * @return {Object}
	 */
	function getBiWeeklyPayrollData( payrolls ) {
		const result = { shift: "before", nextPayDates: [] };
		const criteria = { period1: {}, exceptions: {} };
		const period1 = [];
		const p1Days = [];
		let annualIncome = 0;
		payrolls.forEach( ( payroll ) => {
			// sails.log.info( "payroll: %j", { date: moment( new Date( payroll.date ) ).format( "ddd MMM Do YYYY" ), name: payroll.name, amount: payroll.amount } );
			annualIncome += Math.abs( payroll.amount );
			annualIncome = parseFloat( annualIncome.toFixed( 2 ) ); // shave any extra decimal places
			const payDate = moment( new Date( payroll.date ) );
			const dateInfo = { "ddd": payDate.format( "ddd" ), "d": parseInt( payDate.format( "d" ) ), "day": parseInt( payDate.format( "D" ) ), "date": payDate.format(), "unix": parseInt( payDate.format( "X" ) ) };
			period1.push( dateInfo );
			p1Days.push( dateInfo.d );
		} );
		result.annualIncome = parseFloat( ( ( annualIncome / payrolls.length ) * 26 ).toFixed( 2 ) );
		result.name = payrolls[ ( payrolls.length - 1 ) ].name;
		const p1Day = MathExt.mode( p1Days );
		if( verbose >= 2 ) sails.log.info( `p1Days: ${JSON.stringify( p1Days )} => ${p1Day}` );
		const p1DateExceptions = [];
		const shifts = [];
		period1.forEach( ( dateInfo ) => {
			if( dateInfo.d != p1Day ) {
				const expectedDate = moment( dateInfo.date ).day( p1Day );
				const expected = { "ddd": expectedDate.format( "ddd" ), "d": parseInt( expectedDate.format( "d" ) ), "day": parseInt( expectedDate.format( "D" ) ), "date": expectedDate.format(), "unix": parseInt( expectedDate.format( "X" ) ) };
				if( verbose >= 2 ) sails.log.info( "[P1] dow exception: ", JSON.stringify( dateInfo ), JSON.stringify( expected ) );
				shifts.push( ( parseInt( expectedDate.format( "X" ) ) > dateInfo.unix ? 0 : 1 ) );
				p1DateExceptions.push( { expected: expected, actual: dateInfo } );
			}
		} );
		result.shift = ( MathExt.mode( shifts ) == 1 ? "after" : "before" );
		const p1DayProb = ( 100 - ( ( p1DateExceptions.length / period1.length ) * 100 ) );
		if( verbose >= 2 ) sails.log.info( "p1 day probability: %d%", p1DayProb.toFixed( 1 ) );
		if( p1DayProb >= 50 ) {
			criteria.period1.dayOfWeek = p1Day;
		} else {
			if( verbose >= 1 ) sails.log.warn( `${( userId || "" )}; Unable to determine bi-weekly period(1) criteria!` );
		}
		if( verbose >= 1 ) sails.log.info( "criteria:", JSON.stringify( criteria ) );
		if( ! criteria.period1.hasOwnProperty( "dayOfWeek" ) ) {
			return result;
		}
		const lastPayDate = moment( new Date( payrolls.slice( -1 )[ 0 ].date ) );
		const diffWeeks = Math.ceil( moment( now ).add( 1, "days" ).diff( lastPayDate, "days" ) / 14 ) * 2;
		const nextDate = moment( lastPayDate ).startOf( "day" );
		nextDate.add( diffWeeks, "weeks" );
		nextDate.day( criteria.period1.dayOfWeek );
		for( let i = 1; i <= 7; ++i ) {
			if( parseInt( nextDate.format( "d" ) ) !== criteria.period1.dayOfWeek ) {
				nextDate.day( criteria.period1.dayOfWeek );
			}
			// sails.log.info( "[P1] nextDate:", nextDate.format( "ddd, MMM D YYYY" ) );
			result.nextPayDates.push( nextDate.format( nextPayDateFormat ) );
			nextDate.add( 2, "weeks" );
		}
		return result;
	}

	/**
	 * semi-monthly payroll
	 * @param {Array} payrolls
	 * @return {Object}
	 */
	function getSemiMonthlyPayrollData( payrolls ) {
		const result = { nextPayDates: [], shift: "before", annualIncome: 0 };
		const criteria = { period1: {}, period2: {}, exceptions: {} };
		const period1 = [];
		const period2 = [];
		const p1Days = [];
		const p2Days = [];
		let annualIncome = 0;
		payrolls.forEach( ( payroll ) => {
			// sails.log.info( "payroll: %j", { date: moment( new Date( payroll.date ) ).format( "ddd MMM Do YYYY" ), name: payroll.name, amount: payroll.amount } );
			annualIncome += Math.abs( payroll.amount );
			annualIncome = parseFloat( annualIncome.toFixed( 2 ) ); // shave any extra decimal places
			const payDate = moment( new Date( payroll.date ) );
			const dateInfo = { "ddd": payDate.format( "ddd" ), "d": parseInt( payDate.format( "d" ) ), "day": parseInt( payDate.format( "D" ) ), "date": payDate.format(), "unix": parseInt( payDate.format( "X" ) ) };
			if( dateInfo.day <= 15 ) {
				period1.push( dateInfo );
				p1Days.push( dateInfo.day );
			} else {
				period2.push( dateInfo );
				p2Days.push( dateInfo.day );
			}
		} );
		result.annualIncome = parseFloat( ( ( annualIncome / payrolls.length ) * 2 * 12 ).toFixed( 2 ) );
		result.name = payrolls[ ( payrolls.length - 1 ) ].name;
		// if( verbose > 1 ) sails.log.info( `annualIncome: ${annualIncome} => ${result.annualIncome}` );
		const p1Day = MathExt.mode( p1Days );
		const p2Day = MathExt.mode( p2Days );
		if( verbose > 1 ) sails.log.info( `p1Days: ${JSON.stringify( p1Days )} => ${p1Day}` );
		if( verbose > 1 ) sails.log.info( `p2Days: ${JSON.stringify( p2Days )} => ${p2Day}` );
		const p1DateExceptions = [];
		const p2DateExceptions = [];
		const p2LastDayExceptions = [];
		const weekendExceptions = [];
		const p1DayShifts = [];
		const p2DayShifts = [];
		const lastDayShifts = [];
		period1.forEach( ( dateInfo ) => {
			if( dateInfo.day != p1Day ) {
				// sails.log.info( "[P1] day exception:     ", dateInfo );
				const expectedDate = moment( dateInfo.date ).date( p1Day );
				const expected = { "ddd": expectedDate.format( "ddd" ), "d": parseInt( expectedDate.format( "d" ) ), "day": parseInt( expectedDate.format( "D" ) ), "date": expectedDate.format(), "unix": parseInt( expectedDate.format( "X" ) ) };
				p1DayShifts.push( ( parseInt( expectedDate.format( "X" ) ) > dateInfo.unix ? 0 : 1 ) );
				if( expected.d == 0 || expected.d == 6 ) {
					weekendExceptions.push( true );
				} else {
					if( verbose >= 2 ) sails.log.info( "[P1] non-weekend exception:", JSON.stringify( dateInfo ), JSON.stringify( expected ) );
					p1DateExceptions.push( { expected: expected, actual: dateInfo } );
				}
			}
		} );
		period2.forEach( ( dateInfo ) => {
			if( dateInfo.day != p2Day ) {
				// sails.log.info( "[P2] day exception:     ", dateInfo );
				const expectedDate = moment( dateInfo.date ).date( p2Day );
				const expected = { "ddd": expectedDate.format( "ddd" ), "d": parseInt( expectedDate.format( "d" ) ), "day": parseInt( expectedDate.format( "D" ) ), "date": expectedDate.format(), "unix": parseInt( expectedDate.format( "X" ) ) };
				p2DayShifts.push( ( parseInt( expectedDate.format( "X" ) ) > dateInfo.unix ? 0 : 1 ) );
				if( expected.d == 0 || expected.d == 6 ) {
					weekendExceptions.push( true );
				} else {
					if( verbose >= 2 ) sails.log.info( "[P2] non-weekend exception:", JSON.stringify( dateInfo ), JSON.stringify( expected ) );
					p2DateExceptions.push( { expected: expected, actual: dateInfo } );
				}
			}
			const lastDayOfMonth = moment( dateInfo.date ).endOf( "month" );
			if( parseInt( lastDayOfMonth.format( "D" ) ) != dateInfo.day ) {
				// sails.log.info( "[P2] last day exception:", dateInfo );
				const expected = { "ddd": lastDayOfMonth.format( "ddd" ), "d": parseInt( lastDayOfMonth.format( "d" ) ), "day": parseInt( lastDayOfMonth.format( "D" ) ), "date": lastDayOfMonth.format(), "unix": parseInt( lastDayOfMonth.format( "X" ) ) };
				lastDayShifts.push( ( parseInt( lastDayOfMonth.format( "X" ) ) > dateInfo.unix ? 0 : 1 ) );
				if( expected.d == 0 || expected.d == 6 ) {
					weekendExceptions.push( true );
				} else {
					if( verbose >= 2 ) sails.log.info( "[P2] last day exception:", JSON.stringify( dateInfo ), JSON.stringify( expected ) );
					p2LastDayExceptions.push( { expected: expected, actual: dateInfo } );
				}
			}
		} );
		const p1DayProb = ( 100 - ( ( p1DateExceptions.length / period1.length ) * 100 ) );
		const p2DayProb = ( 100 - ( ( p2DateExceptions.length / period2.length ) * 100 ) );
		const p2LastDayProb = ( 100 - ( ( p2LastDayExceptions.length / period2.length ) * 100 ) );
		if( verbose >= 2 ) sails.log.info( "p1 day probability: %d%", p1DayProb.toFixed( 1 ) );
		if( verbose >= 2 ) sails.log.info( "p2 day probability: %d%", p2DayProb.toFixed( 1 ) );
		if( verbose >= 2 ) sails.log.info( "p2 last day probability: %d%", p2LastDayProb.toFixed( 1 ) );
		if( p1DayProb >= 50 ) {
			criteria.period1.dayOfMonth = p1Day;
		} else {
			if( verbose >= 1 ) sails.log.warn( `${( userId || "" )} Unable to determine semi-monthly period(1) criteria!` );
		}
		if( p2Day >= 28 && p2LastDayProb >= 50 ) {
			criteria.period2.endOfMonth = true;
		} else if( p2DayProb >= 50 ) {
			criteria.period2.dayOfMonth = p2Day;
			// adjust period2 dayOfMonth -- best guess
			const checkDateWeekend = isWeekend( moment( period2[ 0 ].date ).date( 20 ) );
			if( period2.length == 1 && p2Day < 20 && result.shift == "before" && checkDateWeekend ) {
				criteria.period2.dayOfMonth = 20;
			}
		} else {
			if( verbose >= 1 ) sails.log.warn( "Unable to determine period(2) criteria!" );
		}
		const shifts = [];
		if( p1DayShifts.length ) {
			shifts.push( ( MathExt.mode( p1DayShifts ) == 1 ? 1 : 0 ) );
			if( verbose >= 2 ) sails.log.info( "p1DayShifts:", p1DayShifts, `=> ${result.shift}` );
		}
		if( p2DayShifts.length ) {
			shifts.push( ( MathExt.mode( p2DayShifts ) == 1 ? 1 : 0 ) );
			if( verbose >= 2 ) sails.log.info( "p2DayShifts:", p2DayShifts, `=> ${result.shift}` );
		}
		if( lastDayShifts.length ) {
			shifts.push( ( MathExt.mode( lastDayShifts ) == 1 ? 1 : 0 ) );
			if( verbose >= 2 ) sails.log.info( "lastDayShifts:", lastDayShifts, `=> ${result.shift}` );
		}
		if( shifts.length > 2 ) {
			result.shift = ( MathExt.mode( shifts ) == 1 ? "after" : "before" );
		} else if( criteria.period2.hasOwnProperty( "dayOfMonth" ) ) {
			result.shift = ( MathExt.mode( p2DayShifts ) == 1 ? "after" : "before" );
		} else if( criteria.period2.hasOwnProperty( "endOfMonth" ) ) {
			result.shift = ( MathExt.mode( lastDayShifts ) == 1 ? "after" : "before" );
		}
		if( verbose >= 1 ) sails.log.info( "criteria:", JSON.stringify( criteria ) );
		const nextDate = moment( now ).startOf( "day" );
		for( let i = 1; i <= 7; ++i ) {
			const nextPeriod = ( parseInt( nextDate.format( "D" ) ) >= 16 ? 2 : 1 );
			if( nextPeriod == 1 ) {
				if( criteria.period1.hasOwnProperty( "dayOfMonth" ) ) {
					nextDate.date( criteria.period1.dayOfMonth );
					adjustWeekendDates( nextDate, result.shift );
					result.nextPayDates.push( nextDate.format( nextPayDateFormat ) );
				} else {
					sails.log.info( "[P1] MISSING CRITERIA!" );
				}
				// sails.log.info( "[P1] pay date:", nextDate.format( "ddd, MMM D YYYY" ) );
				nextDate.add( 20, "days" );
				// sails.log.info( "[P1] nextDate:", nextDate.format( "ddd, MMM D YYYY" ) );
			} else {
				if( criteria.period2.hasOwnProperty( "dayOfMonth" ) ) {
					nextDate.date( criteria.period2.dayOfMonth );
					adjustWeekendDates( nextDate, result.shift );
					result.nextPayDates.push( nextDate.format( nextPayDateFormat ) );
				} else if( criteria.period2.hasOwnProperty( "endOfMonth" ) && criteria.period2.endOfMonth ) {
					nextDate.endOf( "month" );
					adjustWeekendDates( nextDate, result.shift );
					result.nextPayDates.push( nextDate.format( nextPayDateFormat ) );
				} else {
					sails.log.info( "[P2] MISSING CRITERIA!" );
				}
				// sails.log.info( "[P2] pay date:", nextDate.format( "ddd, MMM D YYYY" ) );
				nextDate.add( 1, "months" ).date( 1 );
				// sails.log.info( "[P2] nextDate:", nextDate.format( "ddd, MMM D YYYY" ) );
			}
			// sails.log.info( "nextDate:", nextDate.format( "ddd, MMM D YYYY" ) );
		}
		return result;
	}


	/**
	 * monthly payroll
	 * @param {Array} payrolls
	 * @return {Object}
	 */
	function getMonthlyPayrollData( payrolls ) {
		const result = { shift: "before", nextPayDates: [] };
		const criteria = { period1: {}, exceptions: {} };
		const period1 = [];
		const p1Days = [];
		const p1DoWs = [];
		let annualIncome = 0;
		payrolls.forEach( ( payroll ) => {
			// sails.log.info( "payroll: %j", { date: moment( new Date( payroll.date ) ).format( "ddd MMM Do YYYY" ), name: payroll.name, amount: payroll.amount } );
			annualIncome += Math.abs( payroll.amount );
			annualIncome = parseFloat( annualIncome.toFixed( 2 ) ); // shave any extra decimal places
			const payDate = moment( new Date( payroll.date ) );
			const dateInfo = { "ddd": payDate.format( "ddd" ), "d": parseInt( payDate.format( "d" ) ), "day": parseInt( payDate.format( "D" ) ), "date": payDate.format(), "unix": parseInt( payDate.format( "X" ) ) };
			period1.push( dateInfo );
			p1Days.push( dateInfo.day );
			p1DoWs.push( dateInfo.d );
		} );
		result.annualIncome = parseFloat( ( ( annualIncome / payrolls.length ) * 12 ).toFixed( 2 ) );
		result.name = payrolls[ ( payrolls.length - 1 ) ].name;
		const p1Day = MathExt.mode( p1Days );
		if( verbose >= 2 ) sails.log.info( `p1Days: ${JSON.stringify( p1Days )} => ${p1Day}` );
		const p1DoW = MathExt.mode( p1DoWs );
		if( verbose >= 2 ) sails.log.info( `p1DoWs: ${JSON.stringify( p1DoWs )} => ${p1DoW}` );
		const p1DateExceptions = [];
		const p1LastDayExceptions = [];
		const p1FirstDoWExceptions = [];
		const weekendExceptions = [];
		const shifts = [];
		period1.forEach( ( dateInfo ) => {
			if( dateInfo.day != p1Day ) {
				// if( verbose >= 2 ) sails.log.info( "[P1] day exception:     ", JSON.stringify( dateInfo ) );
				const expectedDate = moment( dateInfo.date ).date( p1Day );
				const expected = { "ddd": expectedDate.format( "ddd" ), "d": parseInt( expectedDate.format( "d" ) ), "day": parseInt( expectedDate.format( "D" ) ), "date": expectedDate.format() };
				shifts.push( ( parseInt( expectedDate.format( "X" ) ) > dateInfo.unix ? 0 : 1 ) );
				if( expected.d == 0 || expected.d == 6 ) {
					weekendExceptions.push( true );
				} else {
					// if( verbose ) sails.log.info( "[P1] non-weekend exception:     ", JSON.stringify( dateInfo ), JSON.stringify( expected ) );
					p1DateExceptions.push( { expected: expected, actual: dateInfo } );
				}
			}
			const lastDayOfMonth = moment( dateInfo.date ).endOf( "month" );
			if( parseInt( lastDayOfMonth.format( "D" ) ) != dateInfo.day ) {
				const expected = { "ddd": lastDayOfMonth.format( "ddd" ), "d": parseInt( lastDayOfMonth.format( "d" ) ), "day": parseInt( lastDayOfMonth.format( "D" ) ), "date": lastDayOfMonth.format() };
				if( expected.d == 0 || expected.d == 6 ) {
					weekendExceptions.push( true );
				} else {
					// if( verbose >= 2 ) sails.log.info( "[P1] last day exception:", JSON.stringify( dateInfo ), JSON.stringify( expected ) );
					p1LastDayExceptions.push( { expected: expected, actual: dateInfo } );
				}
			}
			const firstDoW = moment( dateInfo.date ).date( 1 ).day( p1DoW );
			// sails.log.info( "firstDoW:", firstDoW.format( "dddd, MMMM Do YYYY" ) );
			if( parseInt( firstDoW.format( "D" ) ) != dateInfo.day ) {
				const expected = { "ddd": firstDoW.format( "ddd" ), "d": parseInt( firstDoW.format( "d" ) ), "day": parseInt( firstDoW.format( "D" ) ), "date": firstDoW.format() };
				if( verbose >= 2 ) sails.log.info( "[P1] first dow exception:", JSON.stringify( dateInfo ), JSON.stringify( expected ) );
				p1FirstDoWExceptions.push( { expected: expected, actual: dateInfo } );
			}
		} );
		const p1DayProb = ( 100 - ( ( p1DateExceptions.length / period1.length ) * 100 ) );
		const p1LastDayProb = ( 100 - ( ( p1LastDayExceptions.length / period1.length ) * 100 ) );
		const p1FirstDoWProb = ( 100 - ( ( p1FirstDoWExceptions.length / period1.length ) * 100 ) );
		if( verbose >= 2 ) sails.log.info( "p1 day probability: %d%", p1DayProb.toFixed( 1 ) );
		if( verbose >= 2 ) sails.log.info( "p1 last day probability: %d%", p1LastDayProb.toFixed( 1 ) );
		if( verbose >= 2 ) sails.log.info( "p1 first dow probability: %d%", p1FirstDoWProb.toFixed( 1 ) );
		if( p1DayProb >= 50 && p1DayProb > p1LastDayProb && p1DayProb > p1FirstDoWProb ) {
			criteria.period1.day = p1Day;
		} else if( p1LastDayProb >= 50 && p1LastDayProb > p1FirstDoWProb ) {
			criteria.period1.endOfMonth = true;
		} else if( p1FirstDoWProb >= 50 ) {
			criteria.period1.firstOfMonthDoW = p1DoW;
			result.shift = "after";
		} else {
			sails.log.warn( `${( userId || "" )}; Unable to determine monthly period(1) criteria!` );
		}
		if( shifts.length ) {
			if( verbose >= 2 ) sails.log.info( "shifts:", shifts );
		}
		if( verbose >= 1 ) sails.log.info( `criteria:`, JSON.stringify( criteria ) );
		// const lastPayDate = moment( new Date( payrolls.slice( -1 )[ 0 ].date ) );
		// const diffMonths = moment( now ).add( 1, "days" ).diff( lastPayDate, "months" );
		// const nextDate = moment( lastPayDate ).startOf( "day" );
		const nextDate = moment( now ).date( 1 );
		// nextDate.add( diffMonths, "months" );
		// if( parseInt( nextDate.format( "x" ) ) < now.getTime() ) {
		// 	nextDate.add( 31, "days" ).date( 1 );
		// }
		// sails.log.info( `nextDate:`, nextDate.format( nextPayDateFormat ) );
		for( let i = 1; i <= 4; ++i ) {
			if( criteria.period1.hasOwnProperty( "day" ) ) {
				nextDate.date( criteria.period1.day );
				adjustWeekendDates( nextDate, result.shift );
				result.nextPayDates.push( nextDate.format( nextPayDateFormat ) );
			} else if( criteria.period1.hasOwnProperty( "endOfMonth" ) ) {
				nextDate.endOf( "month" );
				adjustWeekendDates( nextDate, result.shift );
				result.nextPayDates.push( nextDate.format( nextPayDateFormat ) );
			} else if( criteria.period1.hasOwnProperty( "firstOfMonthDoW" ) ) {
				if( parseInt( nextDate.format( "d" ) ) > criteria.period1.firstOfMonthDoW ) {
					nextDate.add( 1, "weeks" );
				}
				nextDate.day( criteria.period1.firstOfMonthDoW );
				result.nextPayDates.push( nextDate.format( nextPayDateFormat ) );
			}
			nextDate.add( 31, "days" ).date( 1 );
			// sails.log.info( "nextDate:", nextDate.format( "dddd, MMMM Do YYYY" ) );
		}
		return result;
	}
}


/**
 * moment is weekend
 * @param {Moment} date
 * @return {boolean}
 */
function isWeekend( date ) {
	const dayOfWeek = parseInt( date.format( "d" ) )
	return ( dayOfWeek == 0 || dayOfWeek == 6 );
}


/**
 * adjust date to before || after weekend
 * @param {Moment} date
 * @param {string} shift "before" || "after"
 * @return {Moment}
 */
function adjustWeekendDates( date, shift ) {
	while( isWeekend( date ) ) {
		if( shift == "before" ) {
			date.subtract( 1, "days" );
		} else {
			date.add( 1, "days" );
		}
	}
	return date;
}


/**
 * percentage of occurences
 * @param {Array} array
 * @param {number} value
 * @return {number}
 */
function occurencePct( array, value ) {
	const counts = [];
	if( ! Array.isArray( array ) ) {
		return 0;
	}
	array.forEach( ( item ) => {
		if( item == value ) {
			counts.push( item );
		}
	} );
	return ( ( counts.length / array.length ) * 100 );
}

/*
 * sort transactions
 * @param {Object} a
 * @param {string} a.date
 * @param {Object} b
 * @param {string} b.date
 */
function transactionSort( a, b ) {
	const ad = new Date( a.date );
	const bd = new Date( b.date );
	return ( ad.getTime() - bd.getTime() );
}
