/* global sails */
"use strict";

/**
 * LoanSettings.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const Q = require( "q" );
const moment = require( "moment" );
const in_array = require( "in_array" );

module.exports = {
	attributes: {
		minimumamount: { type: "float" },
		maximumamount: { type: "float" },
		loanterm: { type: "integer" },
		loanactivestatus: { type: "integer", defaultsTo: 1 },
		practicemanagement: { model: "PracticeManagement" },
		termsloanamount: { type: "float", defaultsTo: 0 },
		creditTiers: { type: "Array" }
	},
	createPracticeLoansettings: createPracticeLoansettings
};

function createPracticeLoansettings( inputData, callback ) {
	const practiceid = inputData.practiceid;
	const enabledTerms = inputData.enabledTerms;
	let loopCount = 0;
	const forLength = sails.config.plaid.interestTermsArr.length;
	const loanTermAmt = inputData.loanTermAmt;

	let loanTermAmtValue;
	let termloop = 0;
	const loanTermAmtArray = [];

	_.forEach( sails.config.plaid.interestTermsArr, function( termvalue ) {
		// -- Need to change when term 48 is enabled
		/* if(termvalue=='48')
			{
				var  loanTermAmtValue  ='0.00';
			}
			else
			{
				var  loanTermAmtValue           = loanTermAmt[termloop];
			}*/
		let loanTermAmtValue = loanTermAmt[ termloop ];
		loanTermAmtValue = loanTermAmtValue.replace( "$ ", "" );
		loanTermAmtValue = loanTermAmtValue.replace( /,/g, "" );
		loanTermAmtValue = loanTermAmtValue.replace( " ", "" );
		loanTermAmtArray[ termvalue ] = loanTermAmtValue;
		termloop++;
	} );
	_.forEach( sails.config.plaid.interestTermsArr, function( term ) {
		let loanactivestatus = 1;

		// -- Need to change when term 48 is enabled
		/* if(term=='48')
		{
			loanactivestatus	=	0;
		}
		else
		{
			if(in_array(term, enabledTerms))
			{
				loanactivestatus	=	1;
			}
		}*/

		if( in_array( term, enabledTerms ) ) {
			loanactivestatus = 1;
		}

		loanTermAmtValue = parseFloat( loanTermAmtArray[ term ] );

		const loansettingsData = {
			minimumamount: sails.config.plaid.minrequestedamount,
			maximumamount: sails.config.plaid.maxrequestedamount,
			loanterm: term,
			loanactivestatus: loanactivestatus,
			practicemanagement: practiceid,
			termsloanamount: loanTermAmtValue
		};
		LoanSettings.create( loansettingsData ).then( function( loansettingsRes ) {
			loopCount++;
			if( loopCount == forLength ) {
				const responseData = {
					statusCode: 200,
					message: "Loan settings updated successfully."
				};
				callback( responseData );
			}
		} );
	} );
}
