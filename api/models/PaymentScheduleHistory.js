/**
 * PaymentScheduleHistory.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var config = sails.config,
  Q = require('q'),
  moment = require('moment'),
  _ = require('lodash'),
  shortid = require('shortid'),
  feeManagement = config.feeManagement;


module.exports = {

  attributes: {
    story: {
      model: 'Story'
    },
    account: {
      model: 'Account'
    },
    user: {
      model: 'User'
    },
    fundingSourceType: {
      type: 'string'
    },
    balance: {
      type: 'float'
    },
    transaction: {
      model: 'Transaction'
    },
    paymentSchedule: {
      type: 'array'
    },
    nextPaymentSchedule: {
      type: 'date'
    },
    maturityDate: {
      type: 'date'
    },
    status: {
      type: 'string',
      defaultsTo: 'OPENED'
    },
    amount: {
      type: 'float'
    },
    interestapplied: {
      type: 'float',
      defaultsTo: 0
    },
	loantermcount: {
      type: 'integer',
      defaultsTo: 0
    },
	apr: {
      type: 'integer',
      defaultsTo: 0
    },
	fundingfee: {
      type: 'float',
      defaultsTo: 0
    },
	/*percentfee: {
      type: 'float',
      defaultsTo: 0
    },
	fixedfee: {
      type: 'float',
      defaultsTo: 0
    },*/
	apr: {
      type: 'float',
      defaultsTo: 0
    },
	balanceavailcheck: {
      type: 'integer',
      defaultsTo: 0
    },
    logs: {
      type: 'array',
      defaultsTo: []
    },
    date: {
      type: 'date'
    },
    payOffAmount: {
      type: 'float'
    },
    manualPayment: {
      type: 'array',
      defaultsTo: []
    },
    isPaymentActive: {
      type: 'boolean',
      defaultsTo: 'true'
    },
	achstatus: {
      type: 'integer',
      defaultsTo: 1
    },
	loanReference: {
      type: "string",
      defaultsTo: shortid.generate
    },
	deniedfromapp: {
      type: 'integer',
      defaultsTo: 0
    },
	changebankToken: {
      type: 'string'
    },
	changebankinfo: {
      type: 'array',
      defaultsTo: []
    },
	transferstatus: {
      type: 'integer',
      defaultsTo: 0
    },
	transfertransactionid: {
      type: 'string'
    },
	usertransferstatus: {
      type: 'integer',
      defaultsTo: 0
    },
	usertransactions: {
      type: 'array',
      defaultsTo: []
    },
	failedtranscount: {
      type: 'integer',
      defaultsTo: 0
    },
	failedtransactions: {
      type: 'array',
      defaultsTo: []
    },
	blockmakepayment: {
      type: 'integer',
      defaultsTo: 0
    },
	loanappversion:{
	  type: 'string',
      defaultsTo: ''
	},
	loaniosversion:{
	  type: 'string',
      defaultsTo: ''
	},
	blockachcredit: {
      type: 'integer',
      defaultsTo: 0
    },
	eligiblereapply: {
      type: 'integer',
      defaultsTo: 0
    },
	declineemail: {
      type: 'string',
      defaultsTo: ''
    },
	declinereason: {
      type: 'string',
      defaultsTo: ''
    },
	failedcreditcount: {
      type: 'integer',
      defaultsTo: 0
    },
	failedcredittransactions: {
      type: 'array',
      defaultsTo: []
    },
	creditScore: {
      type: 'string',
      defaultsTo: ''
    },
	product: {
      model: 'Productlist'
    },
	screentracking: {
      model: 'Screentracking'
    },
	consolidateaccount: {
      model: 'Consolidateaccount'
    },
  },


};

