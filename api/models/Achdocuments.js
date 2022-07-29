/**
 * Achdocuments.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var Q = require('q'),
   moment = require('moment');

module.exports = {

  attributes: {
	documentname: {
      type: "string"
    },
    proofdocument: {
      model: 'Asset'
    },
	paymentManagement: {
      model: 'PaymentManagement'
    },
	user: {
      model: 'User'
    },
	status: {
      type: 'integer',
      defaultsTo: 1
    }
  },
  createAchDocuments: createAchDocuments,
  updateDocumentProof: updateDocumentProof,
};


function createAchDocuments(data,payID,userid) {
  return Q.promise(function(resolve, reject) {
		  Achdocuments.create(data)
		  .then(function(achdocuments) {
			return resolve(achdocuments);
		  })
		  .catch(function(err) {
			sails.log.error('AchDocuments#createAchDocuments :: err :', err);
			return reject(err);
		  });



  });
}

function updateDocumentProof(achdocuments, assetEntity){

	 return Q.promise(function(resolve, reject) {
		if (!achdocuments || !assetEntity) {
		  sails.log.error("Achdocuments#updateDocumentProof :: Error :: insufficient data");

		  return reject({
			code: 500,
			message: 'INTERNAL_SERVER_ERROR'
		  });
		}
		var searchCriteria = {
			id: achdocuments.id
		  },
		  updates = {
			proofdocument: assetEntity.id
		  };
		Achdocuments
		  .update(searchCriteria, updates)
		  .then(function(data) {

			return resolve(data);
		  })
		  .catch(function(err) {
			sails.log.error("Achdocuments#updateDocumentProof :: err : ", err);
			return reject(err);
		  });
	  });


}