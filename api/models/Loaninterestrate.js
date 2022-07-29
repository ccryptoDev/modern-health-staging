/**
 * Loaninterestrate.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	attributes: {
		practicemanagement: { model: "PracticeManagement" },
		creditTier: { type: "string" },
		minimumDTI: { type: "float" },
		maximumDTI: { type: "float" },
		intrestRate: { type: "float" }
	}
};
