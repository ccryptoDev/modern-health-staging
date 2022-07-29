/**
 * State.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
"use strict";

module.exports = {
	attributes: {
		product: { model: "Productlist" },
		practicemanagement: { model: "PracticeManagement" },
		isDeleted: { type: "boolean" },
		version: { type: "integer" },
		rules: { type: "json" }
	}
};
