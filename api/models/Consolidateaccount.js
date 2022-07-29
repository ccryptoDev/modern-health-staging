/**
 * Consolidateaccount.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q');
var moment = require('moment');
module.exports = {

  attributes: {
	user: {
      model: 'User'
    },
	trade:{
	   type: 'array',
	   defaultsTo: []
	},
	status: {
      type: 'integer',
      defaultsTo: 0
    },
  },
  addconsolidateaccount: addconsolidateaccount,
  createconsolidateaccount:createconsolidateaccount
};

function addconsolidateaccount(reqdata) {

  return Q.promise(function(resolve, reject) {

		var loginfodata = {
			user: reqdata.user,
			trade:reqdata.accountDetails,
		}

	   Consolidateaccount.create(loginfodata)
		.then(function(loginfodata) {
		  sails.log.info("Consolidateaccount#addconsolidateaccount :: ", loginfodata);
		  return resolve(loginfodata);
		})
		.catch(function(err) {
		  sails.log.error("Consolidateaccount#addconsolidateaccount :: Error :: ", err);
		  return reject(err);
		});


  });
}

function createconsolidateaccount(transuniondetails){

	return Q.promise(function(resolve, reject) {


		var subTypeArray = [];
		var userAccount = transuniondetails.response;

		//-- Added on aug 20th to fix the live issue
		var tradelength=0;

		if(userAccount.product.subject.subjectRecord.custom &&  userAccount.product.subject.subjectRecord.custom.credit && userAccount.product.subject.subjectRecord.custom.credit.trade)
		{
			sails.log.info("Enter tradelength loop:::::::::::::::::::");
			tradelength = userAccount.product.subject.subjectRecord.custom.credit.trade.length;
		}

		sails.log.info("tradelength:::::::::::::::::::",tradelength);


		//if(userAccount.product.subject.subjectRecord.custom.credit.trade[0])
		if(tradelength>0)
		{
			  var userAccountlist = userAccount.product.subject.subjectRecord.custom.credit.trade;
			  _.forEach(userAccountlist, function (account) {
					var industryCode = account.subscriber.industryCode;
					if ((industryCode !== 'M')) {
						subTypeArray.push(account);
					}
			  });

		}else{

			var todaydate = moment().format('YYYY-MM-DD');
			var accountres = {
						"subscriber": {
							"industryCode": "R",
							"memberCode": "",
							"name": {
								"unparsed": "REQUESTED AMOUNT"
							}
						 },
						"portfolioType": "requesting",
						"accountNumber": "",
						"ECOADesignator": "",
						"dateOpened": {
							"_": todaydate,
							"estimatedDay": "false",
							"estimatedMonth": "false",
							"estimatedCentury": "false",
							"estimatedYear": "false"
						},
						"dateEffective": {
							"_": todaydate,
							"estimatedDay": "false",
							"estimatedMonth": "false",
							"estimatedCentury": "false",
							"estimatedYear": "false"
						},
						"currentBalance": 0,
						"highCredit": 0,
						"creditLimit": 0,
						"accountRating": "01",
						"account": {
							"type": "RQ"
						},
						"pastDue": "000000000",
						"updateMethod": "requested"
					  };

			subTypeArray.push(accountres);

		}
		var responsedata = {
			message: 'success',
			user: transuniondetails.user,
			accountDetails:subTypeArray,
		};

		Consolidateaccount.addconsolidateaccount(responsedata)
		 .then(function (accdet) {
			if(accdet){
		        return resolve({
				   code: 200,
				   message: 'Consolidateaccount account added successfully!',
				   consolidateaccount:accdet
				});
			}else{
				return resolve({
				   code: 400,
				   message: 'Consolidateaccount account not added!',
				   consolidateaccount:''
				});
			}

		})
		.catch(function (err) {
			sails.log.error('Consolidateaccount#addconsolidateAction :: err :', err);
			return resolve({
			   code: 400,
			   message: 'Consolidateaccount account not added!',
			   consolidateaccount:''
			});
		});


	});

}

