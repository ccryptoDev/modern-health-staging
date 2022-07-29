"use strict";

// var ddKeyword = ['payroll,direct deposit','payroll','direct deposit','direct dep','dir dep'];

const ddKeyword = [ "transfer,deposit", "payroll,direct deposit", "payroll", "direct deposit", "direct dep", "dir dep" ];

const plaid = {
	productionUrl: "https://sandbox.plaid.com",
	envType: "sandbox",
	clientId: "5cdca64db83f380013e2b1c0",
	secretKey: "49271e1ec64d12ced6d049d40e238a",
	publicKey: "cc7ab37fa59d3213303fde29b687f8",
	clientName: "Modern Health Finance",
	minincomeamount: 39000,
	minrequestedamount: 1000,
	maxrequestedamount: 40000,
	maximumDti: 50000,
	maxApr: 35,
	minimumIncomePlaidStatus: true,
	ddKeyword: ddKeyword,
	basicLoanamount: 0,
	interestTermsArr: [ "12", "24", "30", "36", "48" ],
	maxPreDTI: 50,
	estimateAnnualIncome: 120000,
	estimatePreDebt: 2500
};

if( process.env.NODE_ENV == "production" ) {
	plaid.productionUrl = "https://production.plaid.com";
	plaid.envType = "production";
	plaid.secretKey = "46add7d9ae06e2bcf0574b9c89634d";
}

module.exports.plaid = plaid;
