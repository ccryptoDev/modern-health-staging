/* global sails, State */
/**
 * State.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
"use strict";

const Q = require( "q" );
const _ = require( "lodash" );

module.exports = {
	attributes: {
		name: {
			type: "String",
			unique: true
		},
		stateCode: {
			type: "String",
			unique: true,
			required: true
		},
		pinCode: {
			type: "integer"
		},
		isActive: {
			type: "boolean",
			defaultsTo: true
		},
		isPracticeActive: {
			type: "boolean",
			defaultsTo: false
		}
	},
	createNewState: createNewState,
	updateExistingState: updateExistingState,
	removeState: removeState,
	getExistingState: getExistingState,
	findStateById: findStateById,
	getExistingPracticeState: getExistingPracticeState
};

function createNewState( data ) {
	return Q.promise( function( resolve, reject ) {
		State.create( data )
		.then( function( state ) {
			return resolve( state );
		} )
		.catch( function( err ) {
			sails.log.error( "State#createNewState :: Error creating new state" );
			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		} );
	} );
}
function findStateById( stateCode ) {
	return Q.promise( function( resolve, reject ) {
		State.findOne( stateCode )
		.then( function( state ) {
			if( !state ) {
				return reject( {
					code: 404,
					message: "STATE_NOT_FOUND"
				} );
			}
			return resolve( state );
		} )
		.catch( function( err ) {
			sails.log.error( "State#findStateById :: Failed to find state", err );
			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		} );
	} );
}

function updateExistingState( stateCode, data ) {
	return Q.promise( function( resolve, reject ) {
		State.findOne( { stateCode: stateCode } )
		.then( function( state ) {
			if( state ) {
				const criteria = {
					stateCode: stateCode
				};
				State.update( criteria, {
					name: data.name ? data.name : state.name,
					stateCode: data.stateCode ? data.stateCode : state.stateCode,
					pinCode: data.pinCode ? data.pinCode : state.pinCode,
					isActive: data.isActive ? data.isActive : state.isActive
				} )
				.then( function( updatedState ) {
					return resolve( updatedState );
				} )
				.catch( function( err ) {
					sails.log.error( "State#updateExistingState :: Error creating new state", err );
					return reject( {
						code: 500,
						message: "INTERNAL_SERVER_ERROR"
					} );
				} );
			} else {
				sails.log.error( "State#updateExistingState :: Failed to find state" );
				return reject( {
					code: 404,
					message: "STATE_NOT_FOUND"
				} );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "State#updateExistingState :: Failed to find state", err );
			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		} );
	} );
}

function removeState( stateCode ) {
	return Q.promise( function( resolve, reject ) {
		State.findOne( { stateCode: stateCode } )
		.then( function( state ) {
			if( state ) {
				const criteria = {
					id: state.id
				};
				State.destroy( criteria )
				.then( function( deletedState ) {
					return resolve( deletedState );
				} )
				.catch( function( err ) {
					sails.log.error( "State#removeState :: Error deleting state", err );
					return reject( {
						code: 500,
						message: "INTERNAL_SERVER_ERROR"
					} );
				} );
			} else {
				return reject( {
					code: 404,
					message: "STATE_NOT_FOUND"
				} );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "State#removeState :: Error finding state", err );
			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		} );
	} );
}

function getExistingState() {
	return new Promise( ( resolve, reject ) => {
		State.find( { isActive: true } )
		.sort( "name ASC" )
		.then( ( states ) => {
			const data = [];
			_.forEach( states, ( state ) => {
				data.push( { stateId: state.id, stateName: state.name, stateCode: state.stateCode } );
			} );
			return resolve( data );
		} )
		.catch( ( err ) => {
			sails.log.error( "State#getExistingState :: catch:", err );
			return reject( { code: 500, message: "INTERNAL_SERVER_ERROR" } );
		} );
	} );
}

function getExistingPracticeState() {
	return new Promise( ( resolve, reject ) => {
		State.find( { isPracticeActive: true } )
		.sort( "name ASC" )
		.then( ( states ) => {
			const data = [];
			_.forEach( states, ( state ) => {
				data.push( { stateId: state.id, stateName: state.name, stateCode: state.stateCode } );
			} );
			return resolve( data );
		} )
		.catch( ( err ) => {
			sails.log.error( "State#getExistingPracticeState :: catch:", err );
			return reject( { code: 500, message: "INTERNAL_SERVER_ERROR" } );
		} );
	} );
}
