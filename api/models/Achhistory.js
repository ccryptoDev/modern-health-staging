/**
 * Achhistory.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q'),
   moment = require('moment');

module.exports = {

 attributes: {
	user: {
      model: 'User'
    },
	story: {
      model: 'Story'
    },
	account: {
      model: 'Account'
    },
	paymentManagement: {
      model: 'PaymentManagement'
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
	loanID: {
      type: "string",
	  defaultsTo: ""
    },
	methodtype: {
      type: 'integer',
      defaultsTo: 0
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
	status: {
      type: 'integer',
      defaultsTo: 1
    },
	achType: {
      type: "string",
      defaultsTo: "loan"
    },
  },
  registerAchhistory: registerAchhistory
};

function registerAchhistory(reqdata) {

  return Q.promise(function(resolve, reject) {

		//sails.log.info("Achhistory#registerAchhistory :: reqdata: ", reqdata);

		if (!reqdata ) {
		  sails.log.error('Achhistory#registerAchhistory :: data null');

		  return reject({
			code: 500,
			message: 'INTERNAL_SERVER_ERROR'
		  });
		}else{


			/*var loginfodata = {
				user: reqdata.user.id,
				story:reqdata.story.id,
				account:reqdata.account.id,
				paymentManagement:reqdata.paymentManagement.id,
				methodname: reqdata.methodname,
				apirequest:reqdata.apirequest,
				apiresponse:reqdata.apiresponse
			}*/

			/*var loginfodata = {
				user: reqdata.user,
				story:reqdata.story,
				account:reqdata.account,
				paymentManagement:reqdata.paymentManagement,
				methodname: reqdata.methodname,
				apirequest:reqdata.apirequest,
				apiresponse:reqdata.apiresponse,
				methodtype:reqdata.methodtype,
				apistatus:reqdata.apistatus,
				apiresponsestatus:reqdata.apiresponsestatus,
				loanID:reqdata.loanID,
			}*/

			var loginfodata =reqdata;

		    //sails.log.info("Achhistory#registerAchhistory :: loginfodata: ", loginfodata);

			Achhistory.create(loginfodata)
			.then(function(logdetails) {
			  sails.log.info("Achhistory#registerAchhistory :: ", logdetails);
			  return resolve(logdetails);
			})
			.catch(function(err) {
			  sails.log.error("Achhistory#registerAchhistory :: Error :: ", err);
			  return reject(err);
			});

		}

  });
}

