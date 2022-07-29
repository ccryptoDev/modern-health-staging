/**
 * Actumhistory.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

var Q = require('q');
var  _ = require('lodash');
var moment = require('moment');

module.exports = {

  attributes: {
	paymentManagement: {
      model: 'PaymentManagement'
    },
	user: {
      model: 'User'
    },
	account: {
      model: 'Account'
    },
	loanID: {
      type: "string",
	  defaultsTo: ""
    },
	methodtype: {
      type: 'integer',
      defaultsTo: 0
    },
	methodname: {
      type: "string"
    },
	achAmount: {
      type: 'float',
	  defaultsTo: 0
    },
	apirequest: {
       type:'json',
       defaultsTo: {}
    },
	apiresponse: {
       type:'json',
       defaultsTo: {}
    },
	apistatus: {
      type: 'integer',
      defaultsTo: 0
    },
	apiresponsestatus: {
      type: 'integer',
      defaultsTo: 0
    },
	appfailure: {
      type: 'integer',
      defaultsTo: 0
    },
	appfailuremessage: {
      type: "string",
      defaultsTo: ""
    },
	actumcreditfilename: {
      type: 'string'
    },
  },
   registerActumhistory: registerActumhistory
};

function registerActumhistory(reqdata) {

  return Q.promise(function(resolve, reject) {


		if (!reqdata )
		{
			  return reject({
				code: 500,
				message: 'INTERNAL_SERVER_ERROR'
			  });
		}
		else
		{
			var loginfodata =reqdata;

			Actumhistory.create(loginfodata)
			.then(function(logdetails) {
			  return resolve(logdetails);
			})
			.catch(function(err) {
			  return reject(err);
			});

		}
  });
}
