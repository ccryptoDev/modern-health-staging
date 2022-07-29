/**
 * Achcredithistory.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

 attributes: {
	practicemanagement: {
      model: 'PracticeManagement'
    },
	methodname: {
      type: "string"
    },
	methodtype: {
      type: 'integer',
      defaultsTo: 0
    },
	creditAmount: {
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
	loancreditID: {
      type: "string",
	  defaultsTo: ""
    },
	apistatus: {
      type: 'integer',
      defaultsTo: 0
    },
	apiresponsestatus: {
      type: 'integer',
      defaultsTo: 0
    },
	appfailuremessage: {
      type: "string",
      defaultsTo: ""
    },
	practiceDetails: {
      type: 'array',
      defaultsTo: []
    },
	achcredithistoryID: {
	  type: 'string'
	},
	achcreditorderID: {
	  type: 'string'
	},
	achcreditauthCode: {
	  type: 'string'
	},
	achcreditrunAmount: {
      type: 'float'
    },
	achcreditpaymentstatus: {
      type: 'integer',
      defaultsTo: 0
    },
  },
  registerAchCredithistory: registerAchCredithistory
};

function registerAchCredithistory(loginfodata) {

  return Q.promise(function(resolve, reject) {

		if (!loginfodata ) {
			  sails.log.error('Achcredithistory#registerAchCredithistory :: data null');

			  return reject({
				code: 500,
				message: 'INTERNAL_SERVER_ERROR'
			  });
		}
		else
		{
			Achcredithistory.create(loginfodata)
			.then(function(logdetails) {
			  sails.log.info("Achcredithistory#registerAchCredithistory :: ", logdetails);
			  return resolve(logdetails);
			})
			.catch(function(err) {
			  sails.log.error("Achcredithistory#registerAchCredithistory :: Error :: ", err);
			  return reject(err);
			});

		}
  });
}



