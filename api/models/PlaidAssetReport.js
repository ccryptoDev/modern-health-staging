"use strict";

module.exports = {
	attributes: {
		user: { model: "User", required: true },
		accessToken: { type: "string", required: true },
		assetReportToken: { type: "string" },
		report: { type: "json" }
	}
};
