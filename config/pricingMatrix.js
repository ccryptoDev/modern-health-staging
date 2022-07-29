"use strict";
module.exports.pricingMatrix = {
	loansettings: [
		{
			minimumamount: 0,
			maximumamount: 5000,
			termsloanamount: 0,
			loanterm: 12,
			creditTiers: [ "A", "B", "C", "D", "E", "F", "G" ],
			loanactivestatus: 1
		},
		{
			minimumamount: 0,
			maximumamount: 5000,
			termsloanamount: 0,
			loanterm: 18,
			creditTiers: [ "A", "B", "C", "D", "E" ],
			loanactivestatus: 1
		},
		{
			minimumamount: 0,
			maximumamount: 5000,
			termsloanamount: 0,
			loanterm: 24,
			creditTiers: [ "A", "B", "C" ],
			loanactivestatus: 1
		}
	],
	loancredittier: [
		{
			minCreditScore: 680,
			maxCreditScore: 850,
			creditTier: "A",
			loanAmount: 5000,
			downPayment: 1100,
			financedAmount: 3900,
			fundingRate: 85
		},
		{
			minCreditScore: 640,
			maxCreditScore: 679,
			creditTier: "B",
			loanAmount: 5000,
			downPayment: 1100,
			financedAmount: 3900,
			fundingRate: 80
		},
		{
			minCreditScore: 600,
			maxCreditScore: 639,
			creditTier: "C",
			loanAmount: 5000,
			downPayment: 1100,
			financedAmount: 3900,
			fundingRate: 70
		},
		{
			minCreditScore: 570,
			maxCreditScore: 599,
			creditTier: "D",
			loanAmount: 5000,
			downPayment: 1100,
			financedAmount: 3900,
			fundingRate: 50
		},
		{
			minCreditScore: 540,
			maxCreditScore: 569,
			creditTier: "E",
			loanAmount: 5000,
			downPayment: 1500,
			financedAmount: 3500,
			fundingRate: 40
		},
		{
			minCreditScore: 520,
			maxCreditScore: 539,
			creditTier: "F",
			loanAmount: 5000,
			downPayment: 2500,
			financedAmount: 2500,
			fundingRate: 25
		},
		{
			minCreditScore: 1,
			maxCreditScore: 519,
			creditTier: "G",
			loanAmount: 5000,
			downPayment: 2800,
			financedAmount: 2200,
			fundingRate: 20
		}
	],
	loaninterestrate: [
		{ "creditTier": "A", "minimumDTI": 0.0, "maximumDTI": 10.0, "interestRate": 18.9 },
		{ "creditTier": "A", "minimumDTI": 10.0, "maximumDTI": 20.0, "interestRate": 19.4 },
		{ "creditTier": "A", "minimumDTI": 20.0, "maximumDTI": 30.0, "interestRate": 19.9 },
		{ "creditTier": "A", "minimumDTI": 30.0, "maximumDTI": 40.0, "interestRate": 20.4 },
		{ "creditTier": "A", "minimumDTI": 40.0, "maximumDTI": 50.0, "interestRate": 20.9 },
		{ "creditTier": "B", "minimumDTI": 0.0, "maximumDTI": 10.0, "interestRate": 20.9 },
		{ "creditTier": "B", "minimumDTI": 10.0, "maximumDTI": 20.0, "interestRate": 21.4 },
		{ "creditTier": "B", "minimumDTI": 20.0, "maximumDTI": 30.0, "interestRate": 21.9 },
		{ "creditTier": "B", "minimumDTI": 30.0, "maximumDTI": 40.0, "interestRate": 22.4 },
		{ "creditTier": "B", "minimumDTI": 40.0, "maximumDTI": 50.0, "interestRate": 22.9 },
		{ "creditTier": "C", "minimumDTI": 0.0, "maximumDTI": 10.0, "interestRate": 21.9 },
		{ "creditTier": "C", "minimumDTI": 10.0, "maximumDTI": 20.0, "interestRate": 22.4 },
		{ "creditTier": "C", "minimumDTI": 20.0, "maximumDTI": 30.0, "interestRate": 22.9 },
		{ "creditTier": "C", "minimumDTI": 30.0, "maximumDTI": 40.0, "interestRate": 23.4 },
		{ "creditTier": "C", "minimumDTI": 40.0, "maximumDTI": 50.0, "interestRate": 23.9 },
		{ "creditTier": "D", "minimumDTI": 0.0, "maximumDTI": 10.0, "interestRate": 22.9 },
		{ "creditTier": "D", "minimumDTI": 10.0, "maximumDTI": 20.0, "interestRate": 23.4 },
		{ "creditTier": "D", "minimumDTI": 20.0, "maximumDTI": 30.0, "interestRate": 23.9 },
		{ "creditTier": "D", "minimumDTI": 30.0, "maximumDTI": 40.0, "interestRate": 24.4 },
		{ "creditTier": "D", "minimumDTI": 40.0, "maximumDTI": 50.0, "interestRate": 24.9 },
		{ "creditTier": "E", "minimumDTI": 0.0, "maximumDTI": 10.0, "interestRate": 23.9 },
		{ "creditTier": "E", "minimumDTI": 10.0, "maximumDTI": 20.0, "interestRate": 24.4 },
		{ "creditTier": "E", "minimumDTI": 20.0, "maximumDTI": 30.0, "interestRate": 24.9 },
		{ "creditTier": "E", "minimumDTI": 30.0, "maximumDTI": 40.0, "interestRate": 25.4 },
		{ "creditTier": "E", "minimumDTI": 40.0, "maximumDTI": 50.0, "interestRate": 25.9 },
		{ "creditTier": "F", "minimumDTI": 0.0, "maximumDTI": 10.0, "interestRate": 24.9 },
		{ "creditTier": "F", "minimumDTI": 10.0, "maximumDTI": 20.0, "interestRate": 25.4 },
		{ "creditTier": "F", "minimumDTI": 20.0, "maximumDTI": 30.0, "interestRate": 25.9 },
		{ "creditTier": "F", "minimumDTI": 30.0, "maximumDTI": 40.0, "interestRate": 26.4 },
		{ "creditTier": "F", "minimumDTI": 40.0, "maximumDTI": 50.0, "interestRate": 26.9 },
		{ "creditTier": "G", "minimumDTI": 0.0, "maximumDTI": 10.0, "interestRate": 25.9 },
		{ "creditTier": "G", "minimumDTI": 10.0, "maximumDTI": 20.0, "interestRate": 26.4 },
		{ "creditTier": "G", "minimumDTI": 20.0, "maximumDTI": 30.0, "interestRate": 26.9 },
		{ "creditTier": "G", "minimumDTI": 30.0, "maximumDTI": 40.0, "interestRate": 27.4 },
		{ "creditTier": "G", "minimumDTI": 40.0, "maximumDTI": 1000.0, "interestRate": 29.9 }
	]
};
