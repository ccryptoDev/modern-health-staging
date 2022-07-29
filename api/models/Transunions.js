/**
 * Transunions.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const _ = require( "lodash" );

module.exports = {
	attributes: {
		user: {
			model: "User"
		},
		response: {
			type: "json",
			defaultsTo: {}
		},
		first_name: {
			type: "string",
			defaultsTo: ""
		},
		middle_name: {
			type: "string",
			defaultsTo: ""
		},
		last_name: {
			type: "string",
			defaultsTo: ""
		},
		house_number: {
			type: "array",
			defaultsTo: []
		},
		socialSecurity: {
			type: "string",
			defaultsTo: ""
		},
		employment: {
			type: "array",
			defaultsTo: []
		},
		trade: {
			type: "array",
			defaultsTo: []
		},
		credit_collection: {
			type: "json",
			defaultsTo: {}
		},
		inquiry: {
			type: "array",
			defaultsTo: []
		},
		addOnProduct: {
			type: "json",
			defaultsTo: {}
		},
		score: {
			type: "string",
			defaultsTo: ""
		},
		status: {
			type: "integer",
			defaultsTo: 0
		},
		isNoHit: {
			type: "boolean",
			defaultsTo: false
		},
		getTradeDebt: getTradeDebt
	}
};


function getTradeDebt( residenceType, housingExpense ) {
	const self = this;
	const tradeDebt = { monthlyPayments: 0, trades: [] };
	const ecoaIgnore = [ "authorizeduser" ];
	let hasMortgage = false;
	_.forEach( self.trade, ( trade ) => {
		if(!trade) return;
		if( trade.subscriber.industryCode.substr( 0, 1 ).toUpperCase() == "M" ) return; // ignore Medical
		if( ecoaIgnore.indexOf( trade.ECOADesignator.toLowerCase() ) >= 0 ) return; // ignore authorized users
		if( trade.hasOwnProperty( "dateClosed" ) || trade.hasOwnProperty( "datePaidOut" ) ) return; // ignore closed/paid
		let payment = _.get( trade, "terms.scheduledMonthlyPayment", null );
		if( payment != null ) payment = parseFloat( payment );
		if( isNaN( payment ) ) payment = null; // handle unknown
		if( trade.portfolioType.toLowerCase() == "mortgage" ) {
			if( residenceType != "own" ) return; // ignore mortgages
			if( payment != null ) {
				hasMortgage = true;
			}
		}
		if( payment != null ) {
			tradeDebt.trades.push( trade );
			// sails.log.verbose( `getTradeDebt; adding ${payment} to monthly payments for ${trade.subscriber.name.unparsed} ${trade.portfolioType}` );
			tradeDebt.monthlyPayments += payment;
		}
	} );
	if( ( residenceType == "own" && ! hasMortgage ) || residenceType != "own" ) {
		sails.log.verbose( `getTradeDebt; adding ${housingExpense} to monthly payments for housing expense` );
		tradeDebt.monthlyPayments += housingExpense;
	}
	tradeDebt.monthlyPayments = parseFloat( tradeDebt.monthlyPayments.toFixed( 2 ) );
	//tradeDebt.trades = parseFloat( )
	return tradeDebt;
}
