/**
 * Transaction.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var Q = require('q'),
  _ = require('lodash');

var TRANSACTION_TYPE_BORROWED = 1,
  TRANSACTION_TYPE_PAID_BACK = 2;

var TRANSACTION_STATUS_INITIATED = 1,
  TRANSACTION_STATUS_RETURN = 2,
  TRANSACTION_STATUS_COMPLETE = 3,
  TRANSACTION_STATUS_CORRECTION = 4,
  TRANSACTION_STATUS_PENDING = 5;

var TRANSACTION_SOURCE_ACH = 1;

var CURRENCY_TYPE_USD = 1;

module.exports = {
  TRANSACTION_TYPE_BORROWED: TRANSACTION_TYPE_BORROWED,
  TRANSACTION_TYPE_PAID_BACK: TRANSACTION_TYPE_PAID_BACK,
  TRANSACTION_SOURCE_ACH: TRANSACTION_SOURCE_ACH,
  TRANSACTION_STATUS_INITIATED: TRANSACTION_STATUS_INITIATED,
  CURRENCY_TYPE_USD: CURRENCY_TYPE_USD,
  TRANSACTION_STATUS_RETURN: TRANSACTION_STATUS_RETURN,
  TRANSACTION_STATUS_COMPLETE: TRANSACTION_STATUS_COMPLETE,
  TRANSACTION_STATUS_CORRECTION: TRANSACTION_STATUS_CORRECTION,
  TRANSACTION_STATUS_PENDING: TRANSACTION_STATUS_PENDING,

  attributes: {
    transactionType: {
      type: 'integer',
      defaultsTo: TRANSACTION_TYPE_BORROWED
    },
    transactionId: {
      type: 'String'
    },
    transactionDate: {
      type: 'datetime',
      defaultsTo: new Date()
    },
    transactionSource: {
      type: 'integer',
      defaultsTo: TRANSACTION_SOURCE_ACH
    },
    transactionMeta: {
      type: 'json'
    },
    amount: {
      type: 'float'
    },
    currency: {
      type: 'integer',
      defaultsTo: CURRENCY_TYPE_USD
    },
    story: {
      model: 'Story'
    },
    user: {
      model: 'User'
    },
    /*university: {
      model: 'University'
    },*/
    status: {
      type: 'integer',
      defaultsTo: TRANSACTION_STATUS_INITIATED
    },
    logs: {
      type: 'array',
      defaultsTo: []
    },
    events: {
      type: 'array',
      defaultsTo: []
    }
  },
  createAchTransactionForStory: createAchTransactionForStory,
  getTransactionForId: getTransactionForId,
  createTransactionForPull: createTransactionForPull

};

function createAchTransactionForStory(story, transactionDetails) {
  return Q.promise(function(resolve, reject) {

    var university;
    if (story.university) {
      university = story.university.id;
    } else {
      university = "";
    }
    var amountTobeTransferred;
    if(story.amountTransferred){
     amountTobeTransferred = story.amountTransferred
    }
    else{
      amountTobeTransferred = story.approvedAmount
    }

    var newTransaction = {
      transactionId: transactionDetails.TransactionID,
      transactionDate: new Date(),
      transactionMeta: transactionDetails.Details,
      amount: amountTobeTransferred,
      story: story.id,
      user: story.user.id,
      university: university,
      logs: []
    };

    newTransaction.logs.push({
      message: 'Transfer has been intiated',
      date: new Date()
    });
    Transaction.create(newTransaction)
      .then(function(transactionEntity) {
        sails.log.info("Transaction#createAchTransactionForStory :: New transaction entry created :: ", newTransaction);
        PaymentManagement
          .createPaymentSchedule(story)
          .then(function(paymentDet) {
            Setting
              .updateCommunityBalance(story)
              .then(function(settingEntity) {
                return resolve(transactionEntity);
              })
              .catch(function(err){
                sails.log.info("Updating Setting Entity in Transaction::Error", err);
                return reject(err);
              })
          })
          .catch(function(err) {
            sails.log.error("PaymentSchedulerObject:: err", err);
            return reject(err);
          })

      })
      .catch(function(err) {
        sails.log.error("Transaction#createAchTransactionForStory :: ", err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}


function getTransactionForId(transactionId) {

  return Q.promise(function(resolve, reject) {
    if (!transactionId) {
      sails.log.error("Transaction#getTransactionForId :: TransctionId is null :: ", transactionId);

      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
 var criteria  = {
    transactionId : transactionId
 };

    // get the transaction
    Transaction
      .findOne(criteria)
      .then(function(transaction) {
        if (!transaction) {
          sails.log.error("Transaction#getTransactionForId :: Transaction not found for the Id :: ", transactionId);

          return reject({
            code: 404,
            message: 'TRANSACTION_NOT_FOUND'
          })
        }

        return resolve(transaction);
      })
      .catch(function(err) {
        sails.log.error("Transaction#getTransactionForId :: ", err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });

  });
}


function createTransactionForPull_old(story,transactionDetails,amountPull){

  var deferred = Q.defer();
var criteria = {
  id :story
};

Story
.findOne(criteria)
.then(function(storyDetail){

  var university;
  if (storyDetail.university) {
    university = storyDetail.university.id;
  } else {
    university = "";
  }
 /* var newTransaction = {
    transactionId: transactionDetails.TransactionID,
    transactionDate: new Date(),
    transactionMeta: transactionDetails.Details,
    amount: amountPull,
    story: storyDetail.id,
    user: storyDetail.user,
    university: university,
    logs: []
  };*/


  var newTransaction = {
    transactionId: transactionDetails.TransactionId,
    transactionDate: new Date(),
    transactionMeta: transactionDetails.AuthCode,
    amount: amountPull,
    story: storyDetail.id,
    user: storyDetail.user,
    university: university,
    logs: [],
	transactionType: TRANSACTION_TYPE_PAID_BACK
  };

  newTransaction.logs.push({
    message: 'Pull has been intiated',
    date: new Date()
  });

  Transaction.create(newTransaction)
    .then(function(transactionEntity) {

      deferred.resolve(transactionEntity)
    })
    .catch(function(err){
      sails.log.error("create TransanctionFor Emi error", err);
      deferred.reject(err)
    })
    })
    .catch(function(err){
      sails.log.error("get Story for Emi error", err);
      deferred.resolve(err)
    })
    return deferred.promise;

}

function createTransactionForPull(payid,transactionDetails,amountPull){

	var deferred = Q.defer();
	var criteria = {
		id :payid
	};

	PaymentManagement
	.findOne(criteria)
	.then(function(paymentDetail){

			var newTransaction = {
				//transactionId: parseInt(transactionDetails.responsedataDebit.achID),
				//transactionDate: new Date(),
				//transactionMeta: transactionDetails.responseData.authorizationToken,
				transactionDate: new Date(),
				transactionId:transactionDetails.jsonObj.order_id,
				transactionhistoryId:transactionDetails.jsonObj.history_id,
				transactionMeta: transactionDetails.jsonObj.authcode,
				amount: amountPull,
				transactionDetails: transactionDetails,
				paymentManagement: paymentDetail.id,
				user: paymentDetail.user,
				logs: [],
				transactionType: TRANSACTION_TYPE_PAID_BACK
			};

			newTransaction.logs.push({
				message: 'Pull has been intiated',
				date: new Date()
			});

			Transaction.create(newTransaction)
			.then(function(transactionEntity) {

				deferred.resolve(transactionEntity)
			})
			.catch(function(err){
				sails.log.error("create TransanctionFor Emi error", err);
				deferred.reject(err)
			})
	})
	.catch(function(err){
		sails.log.error("get Story for Emi error", err);
		deferred.resolve(err)
	})
	return deferred.promise;
}
