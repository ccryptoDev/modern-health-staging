/**
 * Roles.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

// const Q = require( "q" );

module.exports = {
	attributes: {
		rolename: {
			type: "string"
		},
		rolelevel: {
			type: "integer"
		},
		isDeleted: {
			type: "boolean",
			defaultsTo: false
		},
		backendEnabled: {
			type: "integer",
			defaultsTo: 0
		}
	}
};
