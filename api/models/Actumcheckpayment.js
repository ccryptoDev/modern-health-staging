/**
 * Actumcheckpayment.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

var Q = require('q');

module.exports = {

  attributes: {
	paymentManagement: {
      model: 'PaymentManagement'
    },
    user: {
      model: 'User'
    },
	paymentcomissionhistory: {
      model: 'Paymentcomissionhistory'
    },
	// achcredithistory: {
    //   model: 'Achcredithistory'
    // },
	historyData: {
	  type: 'string'
	},
	orderData: {
	  type: 'string'
	},
	responsedata:{
		type:'json',
		defaultsTo: {}
	},
	checkStatus: {
      type: 'integer',
      defaultsTo: 0
    },
  },

};

