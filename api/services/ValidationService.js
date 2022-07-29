/* global ErrorMessages */
"use strict";

const _ = require( "lodash" );

module.exports = {
	getValidationErrors: getValidationErrors,
	getFormFlashMessages: getFormFlashMessages
};

function getValidationErrors( errors ) {
	const formattedErrors = {};
	// read the express form errors and get messages and error code for the error
	_.forEach( errors, function( fieldErrors, fieldName ) {
		formattedErrors[ fieldName ] = [];
		// loop on each error and get the messages
		_.forEach( fieldErrors, function( error ) {
			const errorBlock = {
				errorCode: error,
				message: ErrorMessages.mappings[ error ] ? ErrorMessages.mappings[ error ] : "Error"
			};
			formattedErrors[ fieldName ].push( errorBlock );
		} );
	} );

	return formattedErrors;
}

function getFormFlashMessages( errors ) {
	// push errors to messages array
	const messages = [];
	// get all the errors as array and return
	_.forEach( errors, function( fieldErrors ) {
		_.forEach( fieldErrors, function( error ) {
			const errorMessage = ErrorMessages.mappings[ error ] ? ErrorMessages.mappings[ error ] : "Error";
			// push
			messages.push( errorMessage );
		} );
	} );

	return messages;
}
