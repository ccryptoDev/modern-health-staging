/* global sails, Useractivity */
/**
 * Useractivity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const Q = require( "q" );

module.exports = {

	attributes: {
		user: {
			model: "User"
		},
		subject: {
			type: "string"
		},
		description: {
			type: "string"
		},
		logdata: {
			type: "string"
		},
		status: {
			type: "integer",
			defaultsTo: 1
		},
		screentracking: {
			model: "Screentracking"
		},
		isDeleted: {
			type: "boolean",
			defaultsTo: false
		}
	},
	createUserActivity: createUserActivity,
	log: log
};

function createUserActivity( reqdata, usersubject, userdescription ) {
	return Q.promise( ( resolve, reject ) => {
		const loginfodata = {
			user_id: reqdata.userid,
			subject: usersubject,
			description: userdescription,
			logdata: reqdata.logdata
		};
		Useractivity.create( loginfodata )
		.then( ( logdetails ) => {
			sails.log.info( "Useractivity#createUserActivity :: ", logdetails );
			return resolve( logdetails );
		} )
		.catch( function( err ) {
			sails.log.error( "Useractivity#createUserActivity :: Error :: ", err );
			return reject( err );
		} );
	} );
}

function log( userid, screentrackingid, subject, description, payload ) {
	return new Promise( ( resolve, reject ) => {
		const logdata = {};

		if( userid ) {
			logdata.user_id = userid;
		}

		if( screentrackingid ) {
			logdata.screentracking = screentrackingid;
		}

		if( subject ) {
			logdata.subject = subject;
		}

		if( description ) {
			logdata.description = description;
		}

		if( payload ) {
			logdata.logdata = payload;
		}

		Useractivity.create( logdata )
		.then( function( logdetails ) {
			sails.log.info( "Useractivity#log :: ", logdetails );
			return resolve( logdetails );
		})
		.catch( function( err ) {
			sails.log.error( "Useractivity#log :: Error :: ", err );
			return reject( err );
		} );
	} );
}
