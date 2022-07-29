/**
 * LoanSettings.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var Q = require('q');
var moment = require('moment');
var in_array = require('in_array');

module.exports = {

  attributes: {
	providername: {
      type: 'string'
  	},
	city: {
      type: 'string'
  	},
	statecode: {
      type: 'string'
  	},
  	state: {
      model: 'State'
    },
	firstname: {
      type: 'string'
    },
	lastname: {
      type: 'string'
    },
	 email: {
      type: 'string'
    },
	 phonenumber: {
      type: 'string'
    },
  },
  createProvider:createProvider
};


function createProvider(inputData)
{
  return Q.promise(function(resolve, reject) {

	Provider.findOne({providername: inputData.providername})
		.then(function(data) {

			if (data)
			{
			  return resolve({code: 400});
			}

		Provider.create(inputData)
		.then(function (createData){
			sails.log.info("createDatacreateData:",createData);
			return resolve({
				code: 200,
				providerDetails:createData
			});
		})
		.catch(function(err) {
			sails.log.error("New Provider#registerNewUser::", err);
			return reject(err);
		});
  	})
  })
}