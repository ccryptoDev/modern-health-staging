/**
 * Schedulehistory.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q');
var shortid = require('shortid');

module.exports = {

  attributes: {
     user: {
      model: 'User'
    },
	paymentmanagement: {
      model: 'PaymentManagement'
    },
	screentracking: {
      model: 'Screentracking'
    },
	paymentSchedule: {
      type: 'array'
    },
	loanReference: {
      type: "string",
      defaultsTo: shortid.generate
    },
	status: {
      type: 'string',
      defaultsTo: 'OPENED'
    },
    amount: {
      type: 'float'
    },
	interestapplied: {
      type: 'integer',
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
      type: 'integer',
      defaultsTo: 0
    },
	payOffAmount: {
      type: 'float'
    },
	isPaymentActive: {
      type: 'boolean',
      defaultsTo: 'true'
    },

  },
  changePaymentSchedule:changePaymentSchedule
};


function changePaymentSchedule(paymentmanagement) {
	return Q.promise(function(resolve, reject) {

		var obj = {
			paymentmanagement: paymentmanagement.id,
			user: paymentmanagement.user.id,
			screentracking:paymentmanagement.screentracking,
			paymentSchedule: paymentmanagement.paymentSchedule,
			loanReference: paymentmanagement.loanReference,
			status:paymentmanagement.status,
			amount:paymentmanagement.amount,
			interestapplied:paymentmanagement.interestapplied,
			loantermcount:paymentmanagement.loantermcount,
			apr:paymentmanagement.apr,
			fundingfee:paymentmanagement.fundingfee,
			payOffAmount:paymentmanagement.payOffAmount,
			isPaymentActive:paymentmanagement.isPaymentActive,

		};

		Schedulehistory.create(obj)
		.then(function(paymentDet) {
			 return resolve(paymentDet);
		})
		.catch(function(err) {
			return reject(err);
		});
    });
}


