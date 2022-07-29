/**
 * Stripehistory.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
	practicemanagement: {
      model: 'PracticeManagement'
    },
	stripeAmount: {
      type: 'float'
  	},
	stripeToken:{
		type: 'string'
	},
	stripecustomerId:{
		type: 'string'
	},
	stripecardId:{
		type: 'string'
	},
	stripechargeId:{
		type: 'string'
	},
	customerRequest:{
		type: 'json'
	},
	customerResponse:{
		type: 'json'
	},
	chargeRequest:{
		type: 'json'
	},
	chargeResponse:{
		type: 'json'
	},
	chargetype:{
		type: 'string'
	},
	stripestatus:{
	  type: 'integer',
      defaultsTo: 0
	}
  },
   registerStripehistory: registerStripehistory
};

function registerStripehistory(reqdata) {

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

			Stripehistory.create(loginfodata)
			.then(function(logdetails) {
			  return resolve(logdetails);
			})
			.catch(function(err) {
			  return reject(err);
			});

		}
  });
}