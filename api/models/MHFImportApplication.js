"use strict";

module.exports = {
	tableName: "mhf-import-application",
	attributes: {
		practicemanagement: { model: "PracticeManagement", defaultsTo: null },
		user: { model: "User", defaultsTo: null },
		screentracking: { model: "Screentracking", defaultsTo: null },
		userbankaccount: { model: "UserBankAccount", defaultsTo: null },
		account: { model: "Account", defaultsTo: null },
	}
};
