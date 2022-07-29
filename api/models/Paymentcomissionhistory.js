/**
 * Paymentcomissionhistory.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

var Q = require('q');

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
	practicemanagement: {
      model: 'PracticeManagement'
    },
	schedulehistory: {
      model: 'Schedulehistory'
    },
	historyId: {
	  type: 'string'
	},
	orderId: {
	  type: 'string'
	},
	transactionType: {
      type: 'string'
    },
	apiType: {
	  type: 'string'
	},
	paymentamount: {
      type: 'float'
    },
	paymentstatus: {
      type: 'integer',
      defaultsTo: 0
    },
	isfirstpayment: {
      type: 'integer',
      defaultsTo: 0
    },
	comissionamount: {
      type: 'float'
    },
	orginiationfee: {
      type: 'float'
    },
	fixedfee: {
      type: 'float'
    },
	percentfee: {
      type: 'float'
    },
	paybackAmount: {
      type: 'float'
    },
	creditrunstatus: {
      type: 'integer',
      defaultsTo: 0
    },
	credithistoryID: {
	  type: 'string'
	},
	creditorderID: {
	  type: 'string'
	},
	creditauthCode: {
	  type: 'string'
	},
	creditrunAmount: {
      type: 'float'
    },
	creditfailurecount: {
      type: 'integer',
      defaultsTo: 0
    },
	creditfailuretransactions: {
      type: 'array',
      defaultsTo: []
    },
	creditpaymentstatus: {
      type: 'integer',
      defaultsTo: 0
    },
	outstandingprincipal:{
      type: 'float'
    },
  },
  registerPaymentComissionHistory: registerPaymentComissionHistory
};

function registerPaymentComissionHistory(paymentmanagement,comissionData) {
	return Q.promise(function(resolve, reject) {

		var isfirstpayment =0
		var comissionamount=0;
		var orginiationfee=0;
		var fixedfee=0;
		var percentfee=0;
		var percentFeeValue = 0;
		var paybackAmount=0;
		var deductAmount =0;
		var paymentamount = comissionData.amountPull;
		var outstandingprincipal = comissionData.comissionPayoffAmount;
		//outstandingprincipal =   parseFloat(outstandingprincipal.toFixed(2));

		if (!paymentmanagement.usertransactions)
		{
		  isfirstpayment =1;
		}
		else
		{
			var usertransactions = paymentmanagement.usertransactions;
			var userpaymentcount = usertransactions.length;

			if(userpaymentcount<=1)
			{
				isfirstpayment =1;
			}
		}

		var fixedfee = sails.config.actumConfig.pfiFixedFee;
		var pfiPercentFee = sails.config.actumConfig.pfiPercentFee;
		var pfiOriginationFee = sails.config.actumConfig.pfiOriginationFee;

		if(isfirstpayment==1)
		{
			orginiationfee =   parseFloat(pfiOriginationFee.toFixed(2));
		}

		if(parseFloat(pfiPercentFee)>0)
		{
			//percentFeeValue = (pfiPercentFee/ 100) *  paymentamount;
			pfiPercentFee = parseFloat(pfiPercentFee);
			percentFeeValue = (pfiPercentFee/ 100) *  outstandingprincipal;
			percentFeeValue =   parseFloat(percentFeeValue.toFixed(2));
		}

		deductAmount =  parseFloat(fixedfee) + parseFloat(percentFeeValue)  + parseFloat(orginiationfee);
		deductAmount =   parseFloat(deductAmount.toFixed(2));
		paybackAmount = parseFloat(paymentamount) -  parseFloat(deductAmount);

		if(paybackAmount<0)
		{
			paybackAmount =0;
		}
		paybackAmount =   parseFloat(paybackAmount.toFixed(2));

		var objData = {
			user: paymentmanagement.user,
			paymentmanagement: paymentmanagement.id,
			screentracking:paymentmanagement.screentracking,
			practicemanagement: paymentmanagement.practicemanagement,
			schedulehistory:comissionData.schedulehistoryId,
			orderId:comissionData.orderId,
			historyId:comissionData.historyId,
			transactionType: comissionData.transactionType,
			apiType:comissionData.apiType,
			paymentamount:paymentamount,
			paymentstatus:0,
			isfirstpayment:isfirstpayment,
			comissionamount:deductAmount,
			orginiationfee:orginiationfee,
			fixedfee: fixedfee,
			percentfee: percentFeeValue,
			paybackAmount: paybackAmount,
			outstandingprincipal: outstandingprincipal
		};

		Paymentcomissionhistory.create(objData)
		.then(function(comissionDet) {
			 return resolve(comissionDet);
		})
		.catch(function(err) {
			return reject(err);
		});
   });
}

