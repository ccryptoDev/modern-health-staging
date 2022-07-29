"use strict";

module.exports.product = {
	productid: "5d31fdaca346c509f4fd3c14",
	minCreditScore: 0,
	maxCreditScore: 900,
	newPartnerRuleSet: {
		isDeleted: false,
		version: 1,
		rules: {
			rule1: {
				ruleid: "r1",
				description: "Months of Credit History (Month)",
				declinedif: "lt",
				value: 12,
				disabled: false
			},
			rule2: {
				ruleid: "r2",
				description: "Number of active trade lines",
				declinedif: "lt",
				value: 1,
				disabled: false
			},
			rule3: {
				ruleid: "r3",
				description: "Number of revolving trade lines",
				declinedif: "lt",
				value: 0,
				disabled: false
			},
			rule4: {
				ruleid: "r4",
				description: "# Inquiries in last 6 mos",
				declinedif: "gt",
				value: 8,
				disabled: false
			},
			rule5: {
				ruleid: "r5",
				description: "BK in last 24 mos?",
				declinedif: "gt",
				value: 0,
				disabled: false
			},
			rule6: {
				ruleid: "r6",
				description: "Foreclosure in last 24 mos?",
				declinedif: "gt",
				value: 0,
				disabled: false
			},
			rule7: {
				ruleid: "r7",
				description: "# public records in last 24 months",
				declinedif: "gt",
				value: 5,
				disabled: false
			},
			rule8: {
				ruleid: "r8",
				description: "#Of trades with #60+DPD in past 24 months",
				declinedif: "gt",
				value: 4,
				disabled: true
			},
			rule9: {
				ruleid: "r9",
				description: "#Of trades with #60+DPD in past 6 months",
				declinedif: "gt",
				value: 2,
				disabled: true
			},
			rule10: {
				ruleid: "r10",
				description: "Utilization of Revolving trades",
				declinedif: "gt",
				value: 0.9,
				disabled: true
			},
			rule11: {
				ruleid: "r11",
				description: "Minimum Credit Score",
				declinedif: "lt",
				value: 450,
				disabled: true
			},
			rule12: {
				ruleid: "r12",
				description: "ISA Shares income exeeds percent",
				declinedif: "gt",
				value: 20,
				disabled: true
			},
			rule13: {
				ruleid: "r13",
				description: "Minimum Specified Monthly Income",
				declinedif: "lte",
				value: 1500,
				disabled: false
			}
		}
	}
};
