/* global sails, Procedures */
/**
 * Procedures.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

/*
	const moment = require( "moment");
	var in_array = require('in_array');
*/
module.exports = {
	attributes: {
		practicemanagement: {
			model: "PracticeManagement"
		},
		procedure: {
			type: "string"
		},
		practice_fee: {
			type: "float"
		},
		facility_fee: {
			type: "float"
		},
		anesthesia_fee: {
			type: "float"
		},
		other_fee: {
			type: "float"
		},
		custom: {
			type: "json"
		},
		total_price: {
			type: "float"
		},
		deposit: {
			type: "float"
		},
		hasDetail: {
			type: "boolean"
		}
	},

	deleteProcedure: deleteProcedure,
	createProcedure: createProcedure,
	updateProcedure: updateProcedure,

	getPracticeProceduresList: getPracticeProceduresList
};

function deleteProcedure( procedureId ) {
	return new Promise( ( resolve, reject ) => {
		const criteria = {
			id: procedureId
		};
		sails.log.info( "procdure id ", procedureId );
		Procedures.destroy( criteria )
		.then( ( result ) => {
			if( !result || result.length == 0 ) {
				return resolve( {
					code: 404,
					message: "PROCEDURE_NOT_FOUND"
				} );
			}
			return resolve();
		} )
		.catch( ( err ) => {
			sails.log.error( "Procedure#delete :: err :", err );
			return reject( err );
		} );
	} );
}

function createDBJson( procedureDetails, practiceId ) {

	const dbProcedure = {};

	let hasDetail = false;
	dbProcedure.practicemanagement = practiceId;
	for( const property in procedureDetails ) {
		if( procedureDetails.hasOwnProperty( property ) ) {
			const value = procedureDetails[ property ];
			if( !value ) {
				continue;
			}
			let typedValue;
			switch( property ) {
				case "id":
				case "practicemanagement":
				case "procedure":
					typedValue = value;
					break;
				case "custom":
					typedValue = JSON.parse( value );
					if( Object.keys( typedValue ).length == 0 ) {
						continue;
					}
					break;
				default:
					typedValue = parseFloat( value.replace( /[^0-9]/g, "" ) );
					if( typedValue == 0 ) {
						continue;
					}
					break;
			}

			switch( property ) {
				case "practice_fee":
				case "facility_fee":
				case "anesthesia_fee":
				case "other_fee":
				case "custom":
					hasDetail = true;
					break;
			}

			dbProcedure[ property ] = typedValue;

			sails.log.info( "key value for rowid: ", property );
			sails.log.info( "procedureinfo: ", typedValue );
		}
	}
	dbProcedure[ "hasDetail" ] = hasDetail;
	return dbProcedure;
}

function createProcedure( procedureDetails, practiceId ) {
	return Procedures.create( createDBJson( procedureDetails, practiceId ) )
	.catch( ( err ) => {
		sails.log.error( "PracticeController#createprocedure::", err );
		throw err;
	} );
}

function updateProcedure( procedureDetails, practiceId, procedureId ) {
	return Procedures.update( { id: procedureId } ).set( createDBJson( procedureDetails, practiceId ) )
	.catch( ( err ) => {
		sails.log.error( "PracticeController#createprocedure::", err );
		throw err;
	} );
}

function getPracticeProceduresList( practiceId ) {
	return Procedures.find( { practicemanagement: practiceId } )
	.then( ( practicelist ) => {
		if( practicelist.length > 0 ) {
			return practicelist;
		}
		return Procedures.find( { practicemanagement: { $exists: false } } )
		.then( ( globallist ) => {
			const promisearray = [];
			globallist.forEach( ( defaultObject ) => {
				const practiceProcedure = {};
				Object.assign( practiceProcedure, defaultObject );
				delete practiceProcedure.id;
				practiceProcedure[ "practicemanagement" ] = practiceId;
				promisearray.push( Procedures.create( practiceProcedure ) );
			} );
			return Promise.all( promisearray )
			.then( () => {
				return Procedures.find( { practicemanagement: practiceId } );
			} );
		} );
	} );
}
