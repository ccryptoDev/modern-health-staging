/**
 * InterestedApplicant.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

	attributes: {
		practicemanagement: {
			model: "PracticeManagement"
		},
		firstNname: {
			type: "string"
		},
		lastname: {
			type: "string"
		},
		email: {
			type: "string"
		},
		stateCode: {
			type: "string"
		},
		calcPayments: {
			type: "array"
		}
	}

};
