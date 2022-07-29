/**
 * LoanCreditTier.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	attributes: {
		practicemanagement: { model: "PracticeManagement" },
		practicesetting: { model: "PracticeSetting" },
		minCreditScore: { type: "integer" },
		maxCreditScore: { type: "integer" },
		creditTier: { type: "string" },
		financedAmount: { type: "integer" },
		downPayment: { type: "integer" },
		maxLoanAmount: { type: "integer" }
	}
};
