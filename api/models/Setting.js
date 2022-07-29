/**
 * Settings.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q'),
 config = sails.config,
 kuberAccount = config.kuberAccount;

module.exports = {

  attributes: {
    denomination: {
      type: "array"
    },
    isDeleted: {
      type: 'boolean',
      defaultsTo: false
    },
    communityBankBalance: {
      type: 'float'
      //defaultsTo: kuberAccount.kuberAmount
    },
    toApi: toApi,
    toDenominationApi: toDenominationApi
  },
  createSetting: createSetting,
  updateSetting: updateSetting,
  getAllForSetting: getAllForSetting,
  deleteSetting: deleteSetting,
  getDenominations: getDenominations,
  getCommunityBalance: getCommunityBalance,
  checkDenominationExists: checkDenominationExists,
  updateCommunityBalance: updateCommunityBalance,
  updateBalanceAfterInstallment: updateBalanceAfterInstallment
};

function toApi() {
  var setting = this.toObject();

  var apiObject = {
    denomination: setting.denomination
  };
  return apiObject;
}

function toDenominationApi() {
  var setting = this.toObject();

  return setting.denomination;
}


function createSetting(data) {
  return Q.promise(function (resolve, reject) {

    if (!data) {
      sails.log.error('Setting#createSetting :: data null ');

      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
    data['referenceId'] = Utils.generateReferenceId();
    Setting.create(data)
      .then(function (setting) {
        sails.log.info("Setting#createSetting :: created for Setting :: ", Setting);
        return resolve(setting);
      })

      .catch(function (err) {
        sails.log.error("Setting :: createSetting :: Error :: ", err);

        return reject(err);
      });
  });
}

function updateSetting(setting, data) {
  return Q.promise(function (resolve, reject) {
    var criteria = {
      id: setting.id
    };

    Setting
      .findOne(criteria)
      .then(function (setting) {

        setting.denomination = data.denomination;

        Setting
          .update(criteria, setting)
          .then(function (setting) {
            return resolve(setting);
          })
          .catch(function (err) {
            return reject({
              code: 500,
              message: 'INTERNAL_SERVER_ERROR'
            });
          });
      })
      .catch(function (err) {
        sails.log.error('Setting#updateSetting :: Updating Setting error :: ', err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  })
}

function getAllForSetting() {
  return Q.promise(function (resolve, reject) {
    Setting
      .find()
      .then(function (setting) {
        return resolve(setting);
      })
      .catch(function (err) {
        sails.log.error('Setting#getAllForSetting :: Error :: ', err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function deleteSetting(id) {
  return Q.promise(function (resolve, reject) {
    if (!id) {
      sails.log.error('Setting#getAllForSetting :: Setting null ');

      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
    var criteria = {
      id: id,
      isDeleted: false
    };
    Setting
      .findOne(criteria)
      .then(function (setting) {
        setting.isDeleted = true;
        setting.save(function (err) {
          if (err) {
            sails.log.error("Setting#deleteSetting :: Error :: ", err);

            return reject({
              code: 500,
              message: 'INTERNAL_SERVER_ERROR'
            });

          }
          return resolve(setting);
        })
      })
      .catch(function (err) {
        sails.log.error("Setting#deleteSetting :: Error :: ", err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });

      })
  })
}

function getDenominations() {
  return Q.promise(function (resolve, reject) {
    Setting
      .find()
      .then(function (settings) {
        if (settings.length == 0) {
          throw new Error('The user is not validated.');
        }

        var setting = settings[0];
        return resolve(setting);
      })
      .catch(function (err) {
        sails.log.error('Setting#getAllForSetting :: Error :: ', err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });

}

function getCommunityBalance() {
  return Q.promise(function (resolve, reject) {
    Setting
      .find()
      .sort({
        'createdAt': 'ASC'
      })
      .then(function (setting) {
        //TODO :: get updated community bank balance from ACH service
        return resolve(setting[0].communityBankBalance);
      })
      .catch(function (err) {
        sails.log.error('Setting#getCommunityBalance :: Error :: ', err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function checkDenominationExists(amount) {
  return Q.promise(function (resolve, reject) {
    Setting.find()
      .then(function (settings) {
        var setting = settings[0];

        var ind = _.findIndex(setting.denomination, function (denomination) {
          return denomination.value == amount
        });

        if (ind == -1) {
          return reject({
            code: 400,
            message: "Please select a different amount"
          })
        } else {
          resolve();
        }
      })
      .catch(function (error) {
        sails.log.error("Settings#checkDenominationExists :: Error :: ", error);

        return reject({
          code: 500,
          message: "INTERNAL_SERVER_ERROR"
        })
      });
  });
}

function updateCommunityBalance(story){
  var deferred = Q.defer();
var criteria ={
  id : story.id
};
Story
.findOne(criteria)
.then(function(story){
  var amount = story.requestedAmount;
  Setting
  .find()
  .then(function(settingEntity){
    var totalAmount = settingEntity[0].communityBankBalance;
     settingEntity[0].communityBankBalance = totalAmount - amount;
settingEntity[0].save(function(err){

});
       deferred.resolve(settingEntity);

  })
  .catch(function(err){
    sails.log.error("updateCommunityBalance ::Error", err);
    deferred.reject(err);
  })
})
.catch(function(err){
  sails.log.error("Settings#storyFindOne ::Error", err);
  deferred.reject(err);
})
return deferred.promise;
}

function updateBalanceAfterInstallment(paymentManagement,amountPaid){
  var deferred = Q.defer();
  var criteria = {
	  id: paymentManagement.id
	};
	PaymentManagement
	.findOne(criteria)
	.then(function(PaymentManagementDet){
		/*_.forEach(PaymentManagementDet.paymentSchedule,function(scheduler){
			  if(scheduler.status== 'PAID OFF'){
				var amountPaid = scheduler.amount;*/
				Setting
				.find()
				.then(function(settingEntity){
				 totalAmount = settingEntity[0].communityBankBalance;

				 settingEntity[0].communityBankBalance = amountPaid + totalAmount;

				 sails.log.info("Setting Balance earlier: ", totalAmount);
				 sails.log.info("New Setting Balance: ", settingEntity[0].communityBankBalance);

				 settingEntity[0].save(function (err) {
				   if (err) {
					 sails.log.error("Agreement#updateAgreementDetails :: Error :: ", err);

					  deferred.reject({
					   code: 500,
					   message: 'INTERNAL_SERVER_ERROR'
					 });
				   }
				 });
				 deferred.resolve(settingEntity);
				})
				.catch(function(err){
				  sails.log.error("Updating Setting Entity :: Error",err);
				  deferred.reject(err);
				})
			 /* }
		})*/

	})
	.catch(function(err){
	  sails.log.info("#update balance after installment:: Error", err);
	  deferred.reject(err);
	})
	return deferred.promise;
}
