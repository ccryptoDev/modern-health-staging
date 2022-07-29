var Q = require('q');
var  _ = require('lodash');
var moment = require('moment');
var momentBusiness = require('moment-business-days');

module.exports = {
  attributes: {
	 consumerName: {
      type: 'string'
    },
	 uniqueID: {
      type: 'string'
    },
	 routingNumber: {
      type: 'string'
    },
	 consumersBankAccount: {
      type: 'string'
    },
	 amount: {
      type: 'float'
    },
	 scheduleDate: {
      type: 'date'
    },
	 streetAddress: {
      type: 'string'
    },
	 city: {
      type: 'string'
    },
	 state: {
      type: 'string'
    },
	zip: {
      type: 'string'
    },
	SSN: {
      type: 'string'
    },
	userId: {
       model: 'User'
    },
	payment_id: {
       model: 'PaymentManagement'
    },
	uniqueScheduleId: {
      type: 'array'
    },
	status: {
      type: 'string'
    },
	processType: {
      type: 'integer'
    },
	uniqueScheduleId: {
      type: 'string'
    },
	lenderType: {
	  type: 'string'
	},
	entryType: {
	  type: 'string'
	},
	vikingFileName: {
	  type: 'string'
	},

  },
  createRequestData: createRequestDataAction,
  updateMakePayment: updateMakePaymentAction,
  defaultUserUpdate:defaultUserUpdateProcess,
  totalCsvCountLoop:totalCsvCountLoopAction,
  totalCsvGenerateLoop:totalCsvGenerateLoopAction,
  createchrageoffSchedule:createchrageoffSchedule,
  createRepullSchedule:createRepullSchedule,
  updateUserBalance:updateUserBalanceAction,
  updatePotentialdefault:updatePotentialdefaultAction

};

/*processType: 0 //Disable
processType: 1 //approved
processType: 2 //sent to viking
processType: 3 //paid off
processType: 4 //reject
processType: 5 //makepayment schedule cut off*/

function createRequestDataAction(requestData,status){
	return Q.promise(function(resolve, reject) {
		 //sails.log.info("requestDatarequestData :: ", requestData);
		  VikingRequest.create(requestData)
			.then(function(accountEntity) {
				sails.log.info("Added :: ", "Recorded Added");
        return resolve(accountEntity);
			})
			.catch(function(err) {
			  sails.log.error("Request data Adding error:: ", err);
			  return reject({
				code: 500,
				message: 'INTERNAL_SERVER_ERROR'
			  });
			});
		});
}
function defaultUserUpdateProcess(uniqueId,reasonCode){
	sails.log.info("start");
	return Q.promise(function(resolve, reject) {
		VikingRequest
		.findOne({uniqueID:uniqueId})
		.then(function (vikingData){
			vikingData.processType = 4;
			vikingData.status = "Rejected From Viking";
			vikingData.rejectCode = reasonCode;
			vikingData.save();
			if(vikingData.lenderType == 'credit'){
				VikingRequest.update({userId:vikingData.userId,payment_id:vikingData.payment_id,lenderType:'debit',processType:1}, {status:'credit Rejected',processType:6})
				.exec(function afterwards(err, updated){
					sails.log.info("err",err);
					sails.log.info("updated",updated);
				});
			}else{
				VikingRequest.update({userId:vikingData.userId,payment_id:vikingData.payment_id,lenderType:'debit',processType:1}, {status:'Due to Debit Rejected -'+vikingData.uniqueID+'',processType:8})
				.exec(function afterwards(err, updated){
					sails.log.info("err",err);
					sails.log.info("updated",updated);
					if(updated)
					{
					  PaymentManagement.update({id:vikingData.payment_id}, {defaultuserexist:1}).exec(function afterwards(err, updated){
							sails.log.info("err",err);
					        sails.log.info("Defaulrupdatedres",updated);

							PaymentManagement
							.findOne({id:vikingData.payment_id})
							.then(function (paymentData){
								paymentData.status = 'REJECT';
								var icount = 1;
								 _.forEach(paymentData.paymentSchedule, function(payDetails) {
										if(payDetails.status=='PAID OFF'){
											payDetails.status = 'OPENED';
										}
										if(icount == paymentData.paymentSchedule.length){
											paymentData.save();
										}
										icount++;
								 });
							 });


					  });
					}

				});
			}
			PaymentManagement
			.findOne({id:vikingData.payment_id,user:vikingData.userId,achstatus:1})
			.then(function (paymentData){
				if(paymentData){
					if(paymentData.usertransactions){
						var rejectBkpSchdedule = _.filter(paymentData.usertransactions, { "transactionId": uniqueId });
						if(rejectBkpSchdedule){
							if(rejectBkpSchdedule[0].transactionType == 'Automatic'){
								var filterdRejectSchedule = _.reject(paymentData.paymentSchedule, { "uniqueScheduleId": vikingData.uniqueScheduleId });
								rejectBkpSchdedule[0].initialschedule.status = 'OPENED';
								filterdRejectSchedule.push(rejectBkpSchdedule[0].initialschedule);
								paymentData.paymentSchedule = _.orderBy(filterdRejectSchedule, ['status'], ['asc']);
								rejectBkpSchdedule[0].status = 3;
								rejectBkpSchdedule[0].failurereason = reasonCode;
								var filterdUserTransaction = _.reject(paymentData.usertransactions, { "transactionId": uniqueId });
								filterdUserTransaction.push(rejectBkpSchdedule[0]);
								paymentData.usertransactions = filterdUserTransaction;
							}else if(rejectBkpSchdedule[0].transactionType == 'fullPayoff'){
								rejectBkpSchdedule[0].makepaymentstatus = 'REJECTED';
								paymentData.paymentSchedule = rejectBkpSchdedule[0].initialschedule;
							}else if(rejectBkpSchdedule[0].transactionType == 'partialPayoff'){
								rejectBkpSchdedule[0].makepaymentstatus = 'REJECTED';
								//paymentData.paymentSchedule = rejectBkpSchdedule[0].initialschedule;
							}else if(rejectBkpSchdedule[0].transactionType == 'Manual'){
								rejectBkpSchdedule[0].makepaymentstatus = 'REJECTED';
								paymentData.paymentSchedule = rejectBkpSchdedule[0].initialschedule;
							}
						}

						/*======================Make payment status updated ==========================*/
						var rejectManualSchdedule = _.filter(paymentData.manualPayment, { "transactionId": uniqueId });
						if(rejectManualSchdedule){
							if(rejectManualSchdedule[0].transactionType == 'fullPayoff'){
								rejectManualSchdedule[0].makepaymentstatus = 'REJECTED';
							}else if(rejectManualSchdedule[0].transactionType == 'partialPayoff'){
								rejectManualSchdedule[0].makepaymentstatus = 'REJECTED';
							}else if(rejectManualSchdedule[0].transactionType == 'Manual'){
								rejectManualSchdedule[0].makepaymentstatus = 'REJECTED';
							}
						}

						/*======================Make payment status updated ==========================*/
					}
					paymentData.finalpayoffAmount = parseInt(paymentData.finalpayoffAmount) + parseInt(vikingData.amount);
					paymentData.save();

					/*paymentData.save(function(err, doc){
						if(err){
							return resolve({updateStatus:0})
						}else{
							return resolve({updateStatus:1})
						}

					});*/

				}
			});
		});
	});
}
function updateMakePaymentAction(paymentDetails,makeamount,initialschedulelist,makepaymenttype){
	return Q.promise(function(resolve, reject) {

		if(paymentDetails)
		{
			var paymentid = paymentDetails.id;
			var userid = paymentDetails.user;

			_.forEach(paymentDetails.paymentSchedule, function(schedule) {
				var vikingScheduleId = schedule.uniqueScheduleId;
				var payamount = schedule.amount;

				if(schedule.status=='PAID OFF' && payamount==0 )
				{
					var updatevalues={
						//amount : payamount,
						status:'fullPayoff',
						processType : 5
					};
				}
				else
				{
					var updatevalues={
						amount : payamount
					};
				}
				VikingRequest.update({uniqueScheduleId: vikingScheduleId,payment_id:paymentid,userId:userid,lenderType:'debit'}, updatevalues)
				.exec(function afterwards(err, updated){

				});
			});


			var acccriteria = {user: userid,id: paymentDetails.account};
			sails.log.info("acccriteria",acccriteria);
			Account
			  .findOne(acccriteria)
			  .populate('user')
			  .then(function(accountDetail) {

							 sails.log.info("accountDetail",accountDetail);
							 sails.log.info("makeamount",makeamount);

					 var uniqueReferenceID ='VK_'+Math.random().toString(10).slice(10);
					  var consumerName = accountDetail.user.firstname+" "+accountDetail.user.lastname; //dynamic
					  var uniqueID =uniqueReferenceID; //dynamic
					  var routingNumber= accountDetail.routingNumber; //dynamic
					  var consumersBankAccount = accountDetail.accountNumber;//dynamic
					  var amount =  parseFloat(makeamount).toFixed(2); //dynamic //
					  var streetAddress = accountDetail.user.street; //dynamic
					  var city = accountDetail.user.city; //dynamic
					  var state = accountDetail.user.state; //dynamic
					  var zip = accountDetail.user.zipCode; //dynamic
					  var SSN = accountDetail.user.ssn_number; //dynamic
					   if (moment().tz("America/Los_Angeles").isBefore('13:45:00')) {
						 var currentScheduleDate = moment().tz("America/Los_Angeles").add(1, 'days');
					  }else{
						 var currentScheduleDate = moment().tz("America/Los_Angeles").add(2, 'days');
					  }
					  var randomToken = "VIKING_"+Math.random().toString(32).substr(6)+Math.random().toString(32).substr(6);

					  var feildDataWithLabel = ({consumerName:consumerName,uniqueID:uniqueID,routingNumber:routingNumber,consumersBankAccount:consumersBankAccount,amount:amount,scheduleDate:moment(currentScheduleDate).format(),streetAddress:streetAddress,city:city,state:state,zip:zip,SSN:SSN,userId:accountDetail.user.id,payment_id:paymentDetails.id,uniqueScheduleId:randomToken,status:'pending',processType:1,lenderType:'debit',entryType:'makepayment'});

					  VikingRequest.createRequestData(feildDataWithLabel)
					  .then(function(vikingDataResult) {

							if(makepaymenttype=='frontend'){
								makepaymentapply = 'ManualUser';
							}else{
								makepaymentapply = 'ManualAdmin';
							}

							var uniqueID = vikingDataResult.uniqueID;
							if (!paymentDetails.usertransactions)
							{
							  paymentDetails.usertransactions = [];
							}
							paymentDetails.usertransactions.push({
								  amount: amount,
								  loanID: paymentDetails.loanReference,
								  status:2,
								  transactionId: uniqueID,
								  transactionType:'Manual',
								  initialschedule:initialschedulelist,
								  makepaymentapply:makepaymentapply,
								  makepaymentstatus:'PENDING',
								  date: new Date()
							});
							if (!paymentDetails.manualPayment)
							{
							  paymentDetails.manualPayment = [];
							}
							paymentDetails.manualPayment.push({
								  amount: amount,
								  loanID: paymentDetails.loanReference,
								  status:2,
								  transactionId: uniqueID,
								  transactionType:'Manual',
								  makepaymentapply:makepaymentapply,
								  makepaymentstatus:'PENDING',
								  date: new Date()
							});

							paymentDetails.save();

							return resolve({
							  code: 200,
							  vikingDataResult: vikingDataResult
							});
							//return resolve(vikingDataResult);
					})
					.catch(function(err) {
					  sails.log.error("Request data Adding error:: ", err);
					  return reject({
						code: 500,
						message: 'Schedule amount not updated'
					  });
					});




			})
			.catch(function(err) {
			  sails.log.error("Request data Adding error:: ", err);
			  return reject({
				code: 500,
				message: 'Schedule amount not updated'
			  });
			});

		 }else{

			 return resolve({
			  code: 500,
			  message: 'Schedule amount not updated'
			});

		 }


	});
}
function totalCsvGenerateLoopAction(vikingPendingDatas,creditLenderCode,debitLenderCode,totalCreditRowVal,totalCreditDollorVal,totalDebitRowVal,totalDebitDollorVal){

	return Q.promise(function(resolve, reject) {
		var consumerMaxLength = 22;
		var streetMaxLength = 40;
		var cityMaxLength = 17;
		var stateMaxLength = 2;
		var zipMaxLength = 5;
		var csvCreditData = [];
		var csvDebitData = [];
		var creditUpdatedFileId = [];
		var debitUpdatedFileId = [];
		var descriptiveDate = moment().tz("America/New_York").format("YYMMDD");
		var todayNextWorkingDate = momentBusiness().tz('America/New_York').nextBusinessDay()._d;
		var effectiveDate = momentBusiness(todayNextWorkingDate).tz('America/New_York').format('YYMMDD');
		var i = 1;
		_.forEach(vikingPendingDatas, function(vikingPendingList) {
			if(vikingPendingList.lenderType == 'credit'){
				csvCreditData.push({
								 filetype:'CSV',
								 version:'001',
								 consumerName:(vikingPendingList.consumerName).substring(0, consumerMaxLength),
								 uniqueID:vikingPendingList.uniqueID,
								 lenderAccount:sails.config.vikingConfig.creditTrustAccount,
								 processorLenderCode:creditLenderCode,
								 routingNumber:vikingPendingList.routingNumber,
								 consumersBankAccount:vikingPendingList.consumersBankAccount,
								 amount:parseFloat(vikingPendingList.amount).toFixed(2),
								 transactionCode:sails.config.vikingConfig.creditTransactionCode,
								 companyName:sails.config.vikingConfig.creditLenderName,
								 tollfreeno:sails.config.vikingConfig.creditTollFree,
								 lenderIDBank:sails.config.vikingConfig.creditTrustAccount,
								 entryCode:sails.config.vikingConfig.entryCode,
								 descriptiveDate:descriptiveDate,
								 effectiveDate:effectiveDate,
								 streetAddress:(vikingPendingList.streetAddress).substring(0, streetMaxLength),
								 city:(vikingPendingList.city).substring(0, cityMaxLength),
								 state:(vikingPendingList.state).substring(0, stateMaxLength),
								 zip:(vikingPendingList.zip).substring(0, zipMaxLength),
								 SSN:vikingPendingList.SSN,
								 totaldebitRows:"0",
								 totalcreditRows:parseInt(totalCreditRowVal).toString(),
								 totalRowsFile:parseInt(totalCreditRowVal).toString(),
								 totalDebitDollars:"0.00",
								 totalCreditDollor:parseFloat(totalCreditDollorVal).toFixed(2)
							 });
				creditUpdatedFileId.push(vikingPendingList.id);
				VikingRequest.update({id: vikingPendingList.id}, {status:"File Processed from TFC",processType: 2}).exec(function afterwards(err, updated){});
			}
			if(vikingPendingList.lenderType == 'debit'){
				csvDebitData.push({
								 filetype:'CSV',
								 version:'001',
								 consumerName:(vikingPendingList.consumerName).substring(0, consumerMaxLength),
								 uniqueID:vikingPendingList.uniqueID,
								 lenderAccount:sails.config.vikingConfig.debitTrustAccount,
								 processorLenderCode:debitLenderCode,
								 routingNumber:vikingPendingList.routingNumber,
								 consumersBankAccount:vikingPendingList.consumersBankAccount,
								 amount:parseFloat(vikingPendingList.amount).toFixed(2),
								 transactionCode:sails.config.vikingConfig.debitTransactionCode,
								 companyName:sails.config.vikingConfig.creditLenderName,
								 tollfreeno:sails.config.vikingConfig.debitTollFree,
								 lenderIDBank:sails.config.vikingConfig.debitTrustAccount,
								 entryCode:sails.config.vikingConfig.entryCode,
								 descriptiveDate:descriptiveDate,
								 effectiveDate:effectiveDate,
								 streetAddress:(vikingPendingList.streetAddress).substring(0, streetMaxLength),
								 city:(vikingPendingList.city).substring(0, cityMaxLength),
								 state:(vikingPendingList.state).substring(0, stateMaxLength),
								 zip:(vikingPendingList.zip).substring(0, zipMaxLength),
								 SSN:vikingPendingList.SSN,
								 totaldebitRows:parseInt(totalDebitRowVal).toString(),
								 totalcreditRows:"0",
								 totalRowsFile:parseInt(totalDebitRowVal).toString(),
								 totalDebitDollars:parseFloat(totalDebitDollorVal).toFixed(2),
								 totalCreditDollor:"0.00"
							 });
					debitUpdatedFileId.push(vikingPendingList.id);
					VikingRequest.update({id: vikingPendingList.id}, {status:"File Processed from TFC",processType: 2}).exec(function afterwards(err, updated){});
			}
			if(i == vikingPendingDatas.length){
				return resolve({csvCreditData:csvCreditData,creditUpdatedFileId:creditUpdatedFileId,csvDebitData:csvDebitData,debitUpdatedFileId:debitUpdatedFileId,descriptiveDate:descriptiveDate,effectiveDate:effectiveDate});
			}
			i++;
		});
	});
}
function totalCsvCountLoopAction(vikingPendingDatas){

	return Q.promise(function(resolve, reject) {
		var totalCreditDollorVal = 0;
		var totalDebitDollorVal = 0;
		var totalDebitRowVal = 0;
		var totalCreditRowVal = 0;
		var i = 1;
		_.forEach(vikingPendingDatas, function(vikingPendingList) {
			if(vikingPendingList.lenderType == 'debit'){
				totalDebitDollorVal  = parseFloat(totalDebitDollorVal) + parseFloat(vikingPendingList.amount);
				totalDebitRowVal  = parseInt(totalDebitRowVal) + 1;
			}
			if(vikingPendingList.lenderType == 'credit'){
				totalCreditDollorVal  = parseFloat(totalCreditDollorVal) + parseFloat(vikingPendingList.amount);
				totalCreditRowVal  = parseInt(totalCreditRowVal) + 1;
			}
			if(i == vikingPendingDatas.length){
				return resolve({totalDebitDollorVal:totalDebitDollorVal,
							   totalDebitRowVal:totalDebitRowVal,
							   totalCreditDollorVal:totalCreditDollorVal,
							   totalCreditRowVal:totalCreditRowVal});
			}
			i++;
		 });


	});
}


function createchrageoffSchedule(userid,paymentDetails,scheduleamount,uniqueScheduleId,initialschedulelist){
	return Q.promise(function(resolve, reject) {

	    var acccriteria = {user: userid,id: paymentDetails.account};



			Account
			  .findOne(acccriteria)
			  .populate('user')
			  .then(function(accountDetail) {

							 //sails.log.info("scheduleamount",scheduleamount);

					  var uniqueReferenceID ='VK_'+Math.random().toString(10).slice(10);
					  var consumerName = accountDetail.user.firstname+" "+accountDetail.user.lastname; //dynamic
					  var uniqueID =uniqueReferenceID; //dynamic
					  var routingNumber= accountDetail.routingNumber; //dynamic
					  var consumersBankAccount = accountDetail.accountNumber;//dynamic
					  var amount =  parseFloat(scheduleamount).toFixed(2); //dynamic //
					  var streetAddress = accountDetail.user.street; //dynamic
					  var city = accountDetail.user.city; //dynamic
					  var state = accountDetail.user.state; //dynamic
					  var zip = accountDetail.user.zipCode; //dynamic
					  var SSN = accountDetail.user.ssn_number; //dynamic
					  var currentScheduleDate = moment().tz("America/Los_Angeles");
					  //var randomToken = "VIKING_"+Math.random().toString(32).substr(6)+Math.random().toString(32).substr(6);
					  var randomToken=uniqueScheduleId;

					  var feildDataWithLabel = ({consumerName:consumerName,uniqueID:uniqueID,routingNumber:routingNumber,consumersBankAccount:consumersBankAccount,amount:amount,scheduleDate:moment(currentScheduleDate).format(),streetAddress:streetAddress,city:city,state:state,zip:zip,SSN:SSN,userId:accountDetail.user.id,payment_id:paymentDetails.id,uniqueScheduleId:randomToken,status:'pending',processType:1,lenderType:'debit',entryType:'makepayment'});

					  VikingRequest.createRequestData(feildDataWithLabel)
					  .then(function(vikingDataResult) {


							var uniqueID = vikingDataResult.uniqueID;
							if (!paymentDetails.usertransactions)
							{
							  paymentDetails.usertransactions = [];
							}
							paymentDetails.usertransactions.push({
								  amount: amount,
								  loanID: paymentDetails.loanReference,
								  status:2,
								  transactionId: uniqueID,
								  transactionType:'Chargeoff',
								  initialschedule:initialschedulelist,
								  date: new Date()
							});


							if (!paymentDetails.manualPayment)
							{
							  paymentDetails.manualPayment = [];
							}
							paymentDetails.manualPayment.push({
								  amount: amount,
								  loanID: paymentDetails.loanReference,
								  status:2,
								  transactionId: uniqueID,
								  transactionType:'Chargeoff',
								  date: new Date()
							});


							PaymentManagement.update({id: paymentDetails.id}, {usertransactions:paymentDetails.usertransactions,manualPayment:paymentDetails.manualPayment})
							.exec(function afterwards(err, updated){
								sails.log.info("err",err);
								//sails.log.info("updated",updated);
								return resolve({
								  code: 200,
								  vikingDataResult: vikingDataResult
								});
							});


							//return resolve(vikingDataResult);
					})
					.catch(function(err) {
					  sails.log.error("Request data Adding error:: ", err);
					  return reject({
						code: 500,
						message: 'Schedule amount not updated'
					  });
					});



			})
			.catch(function(err) {
			  sails.log.error("Request data Adding error:: ", err);
			  return reject({
				code: 500,
				message: 'Schedule amount not updated'
			  });
			});



	});
}

function createRepullSchedule(userid,paymentDetails,scheduleamount,uniqueScheduleId){

	return Q.promise(function(resolve, reject) {

		var acccriteria = {user: userid,id: paymentDetails.account.id};

		sails.log.info("acccriteria:",acccriteria);

			Account
			  .findOne(acccriteria)
			  .populate('user')
			  .then(function(accountDetail) {

					sails.log.info("accountDetail:",accountDetail);

					  var uniqueReferenceID ='VK_'+Math.random().toString(10).slice(10);
					  var consumerName = accountDetail.user.firstname+" "+accountDetail.user.lastname; //dynamic
					  var uniqueID =uniqueReferenceID; //dynamic
					  var routingNumber= accountDetail.routingNumber; //dynamic
					  var consumersBankAccount = accountDetail.accountNumber;//dynamic
					  var amount =  parseFloat(scheduleamount).toFixed(2); //dynamic //
					  var streetAddress = accountDetail.user.street; //dynamic
					  var city = accountDetail.user.city; //dynamic
					  var state = accountDetail.user.state; //dynamic
					  var zip = accountDetail.user.zipCode; //dynamic
					  var SSN = accountDetail.user.ssn_number; //dynamic
					  var currentScheduleDate = moment().tz("America/Los_Angeles");
					  //var randomToken = "VIKING_"+Math.random().toString(32).substr(6)+Math.random().toString(32).substr(6);
					  var randomToken=uniqueScheduleId;


					  sails.log.info("accountDetail111111111111:",accountDetail);


					  var feildDataWithLabel = ({consumerName:consumerName,uniqueID:uniqueID,routingNumber:routingNumber,consumersBankAccount:consumersBankAccount,amount:amount,scheduleDate:moment(currentScheduleDate).format(),streetAddress:streetAddress,city:city,state:state,zip:zip,SSN:SSN,userId:accountDetail.user.id,payment_id:paymentDetails.id,uniqueScheduleId:randomToken,status:'pending',processType:1,lenderType:'debit',entryType:'makepayment'});

					  VikingRequest.createRequestData(feildDataWithLabel)
					  .then(function(vikingDataResult) {

					    sails.log.info("vikingDataResult:",vikingDataResult);

						sails.log.info("uniqueReferenceID:",uniqueReferenceID);

							return resolve({
							  code: 200,
							  vikingDataResult: vikingDataResult,
							  transactionid:uniqueReferenceID
							});

					  })
					   .catch(function(err) {
						  sails.log.error("Request data Adding error:: ", err);
						  return reject({
							code: 500,
							message: 'Schedule amount not updated'
						  });
						});



			})
			.catch(function(err) {
			  sails.log.error("Request data Adding error:: ", err);
			  return reject({
				code: 500,
				message: 'Schedule amount not updated'
			  });
			});

	});

}

function updateUserBalanceAction(vikingPendingDatas){

	return Q.promise(function(resolve, reject) {

		var i = 0;
		var forlength = vikingPendingDatas.length;
		_.forEach(vikingPendingDatas, function(vikingPendingList) {
			var paymentid = vikingPendingList.payment_id;

			//sails.log.info("vikingPendingList1111111: ", vikingPendingList);
			//sails.log.info("paymentid1111: ", paymentid);

			var criteria2 = {
					id: paymentid,
				};

			PaymentManagement
			 .findOne(criteria2)
		     .then(function (paymentManagementDetail){


				if ("undefined" !== typeof paymentManagementDetail && paymentManagementDetail!='' && paymentManagementDetail!=null)
				{

					var repullType ='Autodebit';
					var payAmount =vikingPendingList.amount;
					var accountID = paymentManagementDetail.account;
					var scheduleIDValue = vikingPendingList.uniqueScheduleId;
					var scheduleData = paymentManagementDetail.paymentSchedule;
					var vikingrowid = vikingPendingList.id;

					var processPayment=0;
					var accountcriteria= {
						id: accountID
					};

					Account.findOne(accountcriteria)
					.then(function(accountDetails){

						if(accountDetails)
						{

							var repullcriteria = {
								user: accountDetails.user,
								userBankAccount:  accountDetails.userBankAccount
							};

						  //  sails.log.info("repullcriteria: ", repullcriteria);

							Repullbankaccount
							.findOne(repullcriteria)
							.sort('createdAt DESC')
							.then(function(repulldata) {

								//sails.log.info("repulldata11111: ", repulldata);

								if(repulldata)
								{
									var todaysDate = moment(new Date());
									var oDate = moment(repulldata.createdAt);
									var diffHours = oDate.diff(todaysDate, 'hours');
									diffHours  = Math.abs(diffHours);

									//sails.log.info("todaysDate: ", todaysDate);
									//sails.log.info("diffHours: ", diffHours);

									if(diffHours>8)
									{

									   Repullbankaccount.repullPlaidForPayment(accountID,payAmount,repullType)
										.then(function(repullresponse) {

											//sails.log.info("repullresponse",repullresponse.status);
											//sails.log.info("repullresponse.message",repullresponse.message);

											if(repullresponse.status==200)
											{



											}
											else
											{

												if(repullresponse.status==300)
												{
													var errormessage = repullresponse.message;
												}
												else
												{
													 var errormessage ="Unable to repull plaid details for the loan!";
												}
												VikingRequest
												.updatePotentialdefault(paymentManagementDetail,scheduleData,scheduleIDValue,vikingrowid,payAmount,errormessage)
												.then(function(potentialresponse) {

												});

											}

										}).catch(function(err) {

											if(repullresponse.status==300)
											{
												var errormessage = repullresponse.message;
											}
											else
											{
												 var errormessage ="Unable to repull plaid details for the loan!";
											}
											VikingRequest
											.updatePotentialdefault(paymentManagementDetail,scheduleData,scheduleIDValue,vikingrowid,payAmount,errormessage)
											.then(function(potentialresponse) {

											});

										});

									}else{

										  //sails.log.info("diffHourselse========: ");
										   var availableAccountBalanceCheck =0;
											if(repulldata.balance)
											{
												if ("undefined" === typeof repulldata.balance.available || repulldata.balance.available=='' || repulldata.balance.available==null)
												{
													  availableAccountBalanceCheck=0;
												}
												else
												{
													availableAccountBalanceCheck = repulldata.balance.available;
												}
												//sails.log.info("repulldata.balance.available: ", repulldata.balance.available);
											}
											var requestedBalance = parseFloat(payAmount.toFixed(2));

											//sails.log.info("requestedBalance: ", requestedBalance);
											//sails.log.info("availableAccountBalanceCheck: ", availableAccountBalanceCheck);

											if( parseFloat(availableAccountBalanceCheck) >= parseFloat(requestedBalance) )
											{
													processPayment =1;
											}
											//sails.log.info("processPayment: ", processPayment);

											if(processPayment==1)
								            {
								               //message:  'Repull exist with sufficient available balance',
											}else{

												var errormessage ="Repull exist with insufficient Balance";
												VikingRequest
												.updatePotentialdefault(paymentManagementDetail,scheduleData,scheduleIDValue,vikingrowid,payAmount,errormessage)
												.then(function(potentialresponse) {
												//sails.log.info("potentialresponse1111111:",potentialresponse);
												});
											}
									}

								}
								else{

									Repullbankaccount.repullPlaidForPayment(accountID,payAmount,repullType)
										.then(function(repullresponse) {

											//sails.log.info("repullresponse",repullresponse.status);

											if(repullresponse.status==200)
											{



											}
											else
											{

												if(repullresponse.status==300)
												{
													var errormessage = repullresponse.message;
												}
												else
												{
													 var errormessage ="Unable to repull plaid details for the loan!";
												}
												VikingRequest
												.updatePotentialdefault(paymentManagementDetail,scheduleData,scheduleIDValue,vikingrowid,payAmount,errormessage)
												.then(function(potentialresponse) {

												});

											}

										}).catch(function(err) {

											if(repullresponse.status==300)
											{
												var errormessage = repullresponse.message;
											}
											else
											{
												 var errormessage ="Unable to repull plaid details for the loan!";
											}
											VikingRequest
											.updatePotentialdefault(paymentManagementDetail,scheduleData,scheduleIDValue,vikingrowid,payAmount,errormessage)
											.then(function(potentialresponse) {
												//sails.log.info("potentialresponse:",potentialresponse);
											});

										});

								}


							 });


					     }

					});
				}


			});

			i++;
			//sails.log.info("forlength",forlength);
			//sails.log.info("i===============",i);
			if(i==forlength)
			{

				sails.log.info("vikingPendingList",vikingPendingList);
				return resolve({
				  code: 200,
				  vikingPendingList: vikingPendingList,
				});
			}

		 });


	});
}

function updatePotentialdefaultAction(paymentManagementDetail,scheduleData,scheduleIDValue,vikingrowid,payAmount,errormessage){
	return Q.promise(function(resolve, reject) {

		VikingRequest.update({id: vikingrowid}, {processType : 7,status:'Potential Default'})
		.exec(function afterwards(err, updated){


		});
		//sails.log.info("paymentManagementDetail:",paymentManagementDetail);
		scheduleData = _.filter(scheduleData, { 'uniqueScheduleId': scheduleIDValue });

		if (!paymentManagementDetail.potentialdefaultlog)
		{
		  sails.log.info("Enter empty array:", paymentManagementDetail.id);
		  paymentManagementDetail.potentialdefaultlog = [];
		}
		paymentManagementDetail.potentialdefaultlog.push({
			 amount: payAmount,
			 scheduleID:scheduleIDValue,
			 scheduleData: scheduleData,
			 logmessage: errormessage,
			 logdate: new Date()
		});
		paymentManagementDetail.potentialdefaultexist =1;

		if (paymentManagementDetail.potentialdefaultcount)
		{
			paymentManagementDetail.potentialdefaultcount = paymentManagementDetail.potentialdefaultcount+1;
		}
		else
		{
			paymentManagementDetail.potentialdefaultcount =1;
		}

		paymentManagementDetail.save(function(err) {
			//sails.log.info("scheduleIDValue234234233:",err);
			 return resolve({
				  code: 200
			 });
		});


	});
}