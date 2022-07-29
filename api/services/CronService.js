"use strict";

var request = require('request'),
  Q = require('q'),
  _ = require('lodash'),
  moment = require('moment');

var fs = require('fs');
var asyncLoop = require('node-async-loop');

module.exports = {
  getAllStripeRecurringPayment: getAllStripeRecurringPayment,
  getAllActumDebitPayment: getAllActumDebitPayment,
  checkLenderCreditStatus: checkLenderCreditStatus,
  getAllDoctorCreditPayment: getAllDoctorCreditPayment,
	checkDoctorCreditPaymentStatus:checkDoctorCreditPaymentStatus,
	archiveIncompleteApplications:archiveIncompleteApplications,
	expiredUsersDenied: expiredUsersDenied,
};

function getAllStripeRecurringPayment() {
  return Q.promise(function(resolve, reject) {

	var todaysDate = moment().startOf('day').format('MM-DD-YYYY');
	var striperecurringdebit = sails.config.appPath+'/striperecurringdebit/'+'striperecurringdebit_'+ moment().format('MM-DD-YYYY')+'.txt';

	var criteria={
		validityDate : { $eq : new Date(todaysDate), $exists: true },
		//validityDate : { $eq : new Date("2018-10-04T00:00:00Z"), $exists: true },
		isDeleted: false,
		failedattemptcount:{ $eq: 0, $exists: true }
	}

	//sails.log.info("criteria::",criteria);


	PracticeManagement
    .find(criteria)
	.sort("createdAt ASC")
    .then(function(practiceDetails) {

		//sails.log.info("practiceDetails.length::",practiceDetails.length);

		var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
		var initialData ='\n\nStripe Recurring debit cron called\n';
		initialData +='Cron time: '+currentDateTime+' \n';
		initialData +='Stripe Recurring debit count: '+practiceDetails.length+' \n';
		initialData += '************************************************\n\n';

		fs.appendFileSync( striperecurringdebit, initialData);

		if(practiceDetails.length>0)
		{
			 var loopcount=0;
			 var forlength = practiceDetails.length;
			_.forEach(practiceDetails, function(practicedata) {

				var appendData ='';
				appendData +='Practice ID: '+practicedata.id+' \n';
				appendData +='Practice Email: '+practicedata.PracticeEmail+' \n';
				appendData +='PracticeName: '+practicedata.PracticeName+' \n';
				appendData +='Stripe CustomerID: '+practicedata.customerID+' \n';
				appendData +='stripe SaasFee: '+practicedata.stripeSaasFee+' \n';

				fs.appendFileSync( striperecurringdebit, appendData);

				StripeService.monthlyRecurringProcess(practicedata, function(results){

					//sails.log.info("Stripe results:",results);
					//sails.log.info("Stripe statusCode:",results.statusCode);

					fs.appendFileSync(striperecurringdebit, 'Loopcount :'+loopcount+'\n');
					fs.appendFileSync(striperecurringdebit, 'Stripe Response :'+JSON.stringify(results)+'\n');

					var looplogData ='------------------------------------------------------------\n\n';
					fs.appendFileSync( striperecurringdebit, looplogData);

					if(results.statusCode==200)
					{
						//-- Email to practice for stripe charge success
						EmailService.sendPracticePaymentSuccess(practicedata);
					}
					else if(results.statusCode==300)
					{
						//-- Email to practice for stripe charge pending
						EmailService.sendPracticePaymentSuccess(practicedata);
					}
					else if(results.statusCode==400)
					{
						//-- Email to lender for stripe charge failed
						EmailService.sendPracticePaymentFailure(practicedata);
					}
					else
					{
						//-- Unable to fetch any information
					}

					loopcount++;

					if(loopcount==forlength)
					{
						var finalData ='==============================================================\n\n';
						fs.appendFileSync( striperecurringdebit, finalData);
						return resolve({statuscode:200,message:'Stripe Recurring debit found::'+practiceDetails.length});
					}
				});
			});
		}
		else
		{
			//No data to run
			var emptyfinalData ='No Stripe Recurring debit record found \n';
			emptyfinalData +='================================== \n';
			fs.appendFileSync( striperecurringdebit, emptyfinalData);

			return resolve({statuscode:200,message:'No Stripe Recurring debit record found'});
		}
	})
    .catch(function(err) {
      sails.log.error("#getAllStripeRecurringPayment::Error", err);
      return reject(err);
    })
  })
}

function getAllActumDebitPayment(IPFromRequest) {
  return Q.promise(function(resolve, reject) {

	var debittodaysDate = moment().startOf('day').format('MM-DD-YYYY');

	var payoptions = {
		status:['OPENED','CURRENT','LATE'],
		isPaymentActive: true,
		achstatus: { $eq: 1, $exists: true },
		failedtranscount:{ $eq: 0, $exists: true },
		transferstatus: { $eq: 1, $exists: true },
		loanSetdate : { $lte : new Date(debittodaysDate), $exists: true },
		loanStartdate: { $lte: new Date(debittodaysDate), $exists: true },
		$and: [ { $or: [ { moveToArchive: { $exists: false} }, { moveToArchive: { $eq: 0, $exists: true } } ] } ]
	};

	//var payoptions = { id : "5bc041fa7faa5d1846f9a50d" };

	//sails.log.info("debittodaysDate:",debittodaysDate);
	//sails.log.info("payoptions:",payoptions);

	PaymentManagement.find(payoptions)
	.then(function(paymentManagementDetail) {

		sails.log.info("getAllActumDebitPayment count value : ",paymentManagementDetail.length);

		var actumrecurringdebit = sails.config.appPath+'/actumrecurringdebit/'+'actumrecurringdebit_'+ moment().format('MM-DD-YYYY')+'.txt';

		var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
		var initialData ='Recurring debit cron called \n';
		initialData +='Cron time: '+currentDateTime+' \n';
		initialData +='Recurring debit count: '+paymentManagementDetail.length+' \n';
		initialData += '************************************************\n\n';

		fs.appendFileSync(actumrecurringdebit, initialData);

		if(paymentManagementDetail.length>0)
		{
			PaymentManagementService.filterActumDebitPaymentData(paymentManagementDetail,actumrecurringdebit)
			.then(function (responseData) {

				//sails.log.info("filterActumDebitPaymentData responseData : ",responseData);

				var filterlogData ='Filter Loan Debit Payment Count: '+responseData.length+' \n';
				fs.appendFileSync( actumrecurringdebit, filterlogData);
				fs.appendFileSync(actumrecurringdebit, 'filterlogData Response :'+JSON.stringify(responseData)+'\n');

				//sails.log.info("responseData----------- --: ",responseData);

				if(responseData.length>0)
				{
					var finalloopcount=0;
					var forlooplength = responseData.length;
					var currenttodaysDate = moment().startOf('day').toDate().getTime();
					_.forEach(responseData, function(paymentData) {

						 var allowPayment=0;
						 if (paymentData.status == 'CURRENT' || paymentData.status == 'OPENED' || paymentData.status == 'LATE')
						 {
							  var amountPull;
							  var finalmaturityDate = moment(paymentData.maturityDate).startOf('day').toDate().getTime();

							 _.forEach(paymentData.paymentSchedule, function(scheduleData) {

									//sails.log.info("allowPayment----------- --: ",allowPayment);

									if(allowPayment==0)
									{
										//sails.log.info("status----------- --: ",scheduleData.status);
										if(scheduleData.status != 'PAID OFF')
										{
											var scheduledDataDate = moment(scheduleData.date).startOf('day').toDate().getTime();

											//sails.log.info("currenttodaysDate----------- --: ",currenttodaysDate);
											//sails.log.info("scheduledDataDate----------- --: ",scheduledDataDate);
											//sails.log.info("finalmaturityDate----------- --: ",finalmaturityDate);

											if (currenttodaysDate == scheduledDataDate &&  currenttodaysDate <= finalmaturityDate)
											{
												amountPull = scheduleData.amount;
												//sails.log.info("amountPull----------- --: ",amountPull);

												//var IPFromRequest = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
												//var IPFromRequest = '111.93.237.186';

												 //var IPFromRequest =  req.headers['x-forwarded-for'] || req.connection.remoteAddress;
												 var indexOfColon = IPFromRequest.lastIndexOf(':');
												 var ip = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);

												var actumDebitDetails={
													payId:paymentData.id,
													amountPull:amountPull,
													scheduledDate:scheduledDataDate,
													IPFromRequest:ip
												}
												fs.appendFileSync( actumrecurringdebit, 'Payment loanReference ::'+paymentData.loanReference+'\n');
												fs.appendFileSync(actumrecurringdebit, 'ActumService Response :'+JSON.stringify(actumDebitDetails)+'\n');

												//sails.log.info("actumDebitDetails :::::::::::::: ",actumDebitDetails);

												ActumService.pullActumRecurringDebit( actumDebitDetails , function(results){

													fs.appendFileSync(actumrecurringdebit, 'Final Loopcount :'+finalloopcount+'\n');
													fs.appendFileSync(actumrecurringdebit, 'ActumService Response :'+JSON.stringify(results)+'\n');

													if(results.statusCode==200)
													{
														fs.appendFileSync(actumrecurringdebit, 'Debit Result::'+results.statusCode+'\n');
													}
													else
													{
														fs.appendFileSync(actumrecurringdebit, 'Debit Result::'+results.statusCode+'\n');
													}

													finalloopcount++;
													if(finalloopcount==forlooplength)
													{
														var finalData ='==============================================================\n\n';
														fs.appendFileSync( actumrecurringdebit, finalData);
														return resolve({statuscode:200,message:'Actum Recurring debit found::'+responseData.length});
													}
												});
											}
										}
									}
							 });
						 }
					});
				}
				else
				{
					//-- No data to run after filter
					return resolve({statuscode:200,message:'No Actum Recurring debit record found after filtering'});
				}
			})
			.catch(function(err) {
			  sails.log.error("#getAllActumDebitPayment::Error", err);
			  return reject(err);
			})
		}
		else
		{
			//-- No data to run for debit
			var emptyfinalData ='No actum recurring debit record found \n';
			emptyfinalData +='########################################################\n\n';
			fs.appendFileSync( actumrecurringdebit, emptyfinalData);

			return resolve({statuscode:200,message:'No Actum Recurring debit record found'});
		}
	})
	.catch(function(err) {
	  sails.log.error("#getAllActumDebitPayment::Error", err);
      return reject(err);
	})
  });
}

function checkLenderCreditStatus() {
  return Q.promise(function(resolve, reject) {

		var criteria = {
			paymentstatus:0
		}

		Paymentcomissionhistory
		.find(criteria)
		.sort("createdAt ASC")
		.then(function(comissionDetails) {

			sails.log.info("checkLenderCreditStatus count value : ",comissionDetails.length);
			var actumcheckpayment = sails.config.appPath+'/actumcheckpayment/'+'actumcheckpayment_'+ moment().format('MM-DD-YYYY')+'.txt';

			var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			var initialData ="Check " + sails.config.lender.shortName + " CreditStatus  cron called \n";
			initialData +='Cron time: '+currentDateTime+' \n';
			initialData +='Check count: '+comissionDetails.length+' \n';
			initialData += '************************************************\n\n';

			fs.appendFileSync(actumcheckpayment, initialData);

			if(comissionDetails.length>0)
			{
				var finalloopcount=0;
				var forlooplength = comissionDetails.length;

				_.forEach(comissionDetails, function(comissionData) {

					var appendData ='';
					appendData +='Comission  ID: '+comissionData.id+' \n';
					appendData +='PaymentID: '+comissionData.paymentmanagement+' \n';
					appendData +='orderId: '+comissionData.orderId+' \n';
					appendData +='historyId: '+comissionData.historyId+' \n';
					appendData +='comissionData: '+comissionData.paymentamount+' \n';

					fs.appendFileSync( actumcheckpayment, appendData);

					var comissionID = comissionData.id;
					ActumService.getLenderCreditStatus(comissionID, function(results){

						fs.appendFileSync(actumcheckpayment, sails.config.lender.shortName + ' Credit Result :'+JSON.stringify(results)+'\n');

						if(results.statusCode==200)
						{
							fs.appendFileSync(actumcheckpayment, sails.config.lender.shortName + ' Credit Status::'+results.statusCode+'\n');
						}
						else
						{
							fs.appendFileSync(actumcheckpayment, sails.config.lender.shortName + ' Credit Status::'+results.statusCode+'\n');
						}

						finalloopcount++;
						if(finalloopcount==forlooplength)
						{
							var finalData ='==============================================================\n\n';
							fs.appendFileSync( actumcheckpayment, finalData);
							return resolve({statuscode:200,message:'Actum check payment found::'+forlooplength});
						}
					});
				});
			}
			else
			{
				//-- No data to run for debit
				var emptyfinalData ='No record found for checking actum payment status \n';
				emptyfinalData +='########################################################\n\n';
				fs.appendFileSync( actumcheckpayment, emptyfinalData);

				return resolve({statuscode:200,message:'No record found'});
			}

		}).catch(function(err) {
			sails.log.error("#checkLenderCreditStatus::Error", err);
     		return reject(err);
		});
  });
}

function getAllDoctorCreditPayment(IPFromRequest) {
  return Q.promise(function(resolve, reject) {

		var monthendDate = moment().endOf('month').startOf('day').format('MM-DD-YYYY');
		var monthstartDate = moment().startOf('month').startOf('day').format('MM-DD-YYYY');

		var criteria = {
			paymentstatus:{ $eq: 1, $exists: true },
			creditrunstatus:{ $eq: 1, $exists: true },
			createdAt : { $lt : new Date(monthstartDate), $exists: true }
		}

		Paymentcomissionhistory
		.find(criteria)
		.sort("createdAt ASC")
		.then(function(comissionDetails) {

			sails.log.info("getAllDoctorCreditPayment count value : ",comissionDetails.length);
			var actumcreditpayment = sails.config.appPath+'/actumdoctorcredit/'+'actumdoctorcredit_'+ moment().format('MM-DD-YYYY')+'.txt';

			var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			var initialData ='Doctor credit payment cron called \n';
			initialData +='Cron time: '+currentDateTime+' \n';
			initialData +='Check count: '+comissionDetails.length+' \n';
			initialData += '************************************************\n\n';

			fs.appendFileSync(actumcreditpayment, initialData);

			if(comissionDetails.length>0)
			{
				ActumService.getBatchCreditDetails(comissionDetails, function(results){

					fs.appendFileSync(actumcreditpayment, 'Credit Batch statusCode:: '+results.statusCode+'\n');
					fs.appendFileSync(actumcreditpayment, 'Credit Batch Result:: '+JSON.stringify(results)+'\n');

					if(results.statusCode==200)
					{
						var practiceCreditLength= results.practiceCreditLength;
						var practiceCreditArray= results.practiceCreditArray;
						var practiceArray= results.practiceArray;

						fs.appendFileSync(actumcreditpayment, 'practiceCreditLength:: '+practiceCreditLength+'\n');

						if(practiceCreditLength>0)
						{
							fs.appendFileSync(actumcreditpayment, 'practiceArray:: '+JSON.stringify(practiceArray)+'\n');

							asyncLoop(practiceArray, function (item, next){

								var practiceIDValue = item;
								var practiceData = practiceCreditArray[item];
								var practiceAmount =  practiceData['practiceAmount'];
								var practiceDetails =  practiceData['practiceDetails'];

								var actumcreditDetails={
									practiceID:practiceIDValue,
									practiceAmount:practiceAmount,
									practiceDetails:practiceDetails,
									IPFromRequest:IPFromRequest
								}

								fs.appendFileSync(actumcreditpayment, 'practiceIDValue:: '+practiceIDValue+'\n');
								fs.appendFileSync(actumcreditpayment, 'practiceAmount:: '+practiceAmount+'\n');
								fs.appendFileSync(actumcreditpayment, 'IPFromRequest:: '+IPFromRequest+'\n');
								fs.appendFileSync(actumcreditpayment, 'practiceDetails:: '+JSON.stringify(practiceDetails)+'\n');
								fs.appendFileSync( actumcreditpayment, '----------------------------------------------\n');

								sails.log.info("practiceIDValue::: ",practiceIDValue);
								sails.log.info("practiceDetails::: ",practiceData);
								sails.log.info("actumcreditDetails::: ",actumcreditDetails);
								sails.log.info("============================================== ");


								//next();

								ActumService.fundPracticeBatchCreditPayment( actumcreditDetails , function(results){

									fs.appendFileSync(actumcreditpayment, 'BatchCreditPayment results status:: '+results.statusCode+'\n');
									fs.appendFileSync(actumcreditpayment, 'BatchCreditPayment results:: '+JSON.stringify(results)+'\n');

									if(results.statusCode==200 || results.statusCode==400 || results.statusCode==500)
									{
										next();
									}
								});

								//--For testing
								/*asyncLoop(practiceDetails, function (item2, next2){
									sails.log.info("item2::: ",item2);
									next2();
								}, function (err){
									sails.log.info("=======================next::: ");
									next();
								});*/

							}, function (err){

								if (err)
								{
									fs.appendFileSync(actumcreditpayment, 'Credit Batch Error:: '+err+'\n');
									var finalData ='==============================================================\n\n';
									fs.appendFileSync( actumcreditpayment, finalData);
									return resolve({statuscode:400,message:'Unable to complete all batch credit schedule::'+practiceCreditLength});
								}

								fs.appendFileSync(actumcreditpayment, 'All batch credit schedule completed successfully \n');
								var finalData ='==============================================================\n\n';
								fs.appendFileSync( actumcreditpayment, finalData);
								return resolve({statuscode:200,message:'All batch credit schedule completed successfully::'+practiceCreditLength});
							});
						}
						else
						{
							var finalData ='==============================================================\n\n';
							fs.appendFileSync( actumcreditpayment, finalData);
							return resolve({statuscode:400,message:'Invalid batch credit schedule details'});
						}
					}
					else
					{
						var finalData ='==============================================================\n\n';
						fs.appendFileSync( actumcreditpayment, finalData);
						return resolve({statuscode:400,message:results.message});
					}
				});

				/*var finalloopcount=0;
				var forlooplength = comissionDetails.length;

				_.forEach(comissionDetails, function(comissionData) {

					var appendData ='';
					appendData +='Comission  ID: '+comissionData.id+' \n';
					appendData +='PaymentID: '+comissionData.paymentmanagement+' \n';
					appendData +='orderId: '+comissionData.orderId+' \n';
					appendData +='historyId: '+comissionData.historyId+' \n';
					appendData +='paybackAmount: '+comissionData.paybackAmount+' \n';

					fs.appendFileSync( actumcreditpayment, appendData);

					var comissionID = comissionData.id;

					 //var IPFromRequest =  req.headers['x-forwarded-for'] || req.connection.remoteAddress;
					 var indexOfColon = IPFromRequest.lastIndexOf(':');
					 var ip = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);

					var actumCreditDetails={
						comissionId:comissionData.id,
						IPFromRequest:ip
					}

					fs.appendFileSync(actumcreditpayment, sails.config.lender.shortName + ' actumCreditDetails :'+JSON.stringify(actumCreditDetails)+'\n');

					ActumService.fundPracticeCreditPayment(actumCreditDetails, function(results){

						fs.appendFileSync(actumcreditpayment, 'Credit Result::'+JSON.stringify(results)+'\n');

						if(results.statusCode==200)
						{
							fs.appendFileSync(actumcreditpayment, 'Credit Result statusCode::'+results.statusCode+'\n');
						}
						else
						{
							fs.appendFileSync(actumcreditpayment, 'Credit Result statusCode::'+results.statusCode+'\n');
						}

						finalloopcount++;
						if(finalloopcount==forlooplength)
						{
							var finalData ='==============================================================\n\n';
							fs.appendFileSync( actumcreditpayment, finalData);
							return resolve({statuscode:200,message:'Actum dcotor credit payment found::'+forlooplength});
						}
					});
				});*/
			}
			else
			{
				//-- No data to run for debit
				var emptyfinalData ='No actum doctor credit payment record found \n';
				emptyfinalData +='########################################################\n\n';
				fs.appendFileSync( actumcreditpayment, emptyfinalData);

				return resolve({statuscode:200,message:'No record found'});
			}
		}).catch(function(err) {
			sails.log.error("#getAllDoctorCreditPayment::Error", err);
     		return reject(err);
		});
  });
}

function checkDoctorCreditPaymentStatus() {
  return Q.promise(function(resolve, reject) {

		var criteria = {
			achcreditpaymentstatus:{ $eq: 1, $exists: true },
			achcreditorderID:{ $exists: true }
		}

		Achcredithistory
		.find(criteria)
		.sort("createdAt ASC")
		.then(function(creditDetails) {

			sails.log.info("checkDoctorCreditPaymentStatus count value : ",creditDetails.length);
			var actumcheckcreditpayment = sails.config.appPath+'/actumdoctorcreditcheck/'+'actumdoctorcreditcheck_'+ moment().format('MM-DD-YYYY')+'.txt';

			var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			var initialData ='Check Doctor credit payment status cron called \n';
			initialData +='Cron time: '+currentDateTime+' \n';
			initialData +='Check count: '+creditDetails.length+' \n';
			initialData += '************************************************\n\n';

			fs.appendFileSync(actumcheckcreditpayment, initialData);

			var forlooplength = creditDetails.length;
			var completecount =0;
			var pendingcount =0;
			var declinecount =0;
			if(creditDetails.length>0)
			{
				asyncLoop(creditDetails, function (item, next){

					ActumService.getPracticeBatchCreditStatus( creditDetails , function(results){

						fs.appendFileSync(actumcheckcreditpayment, 'Check CreditPayment results status:: '+results.statusCode+'\n');
						fs.appendFileSync(actumcheckcreditpayment, 'Check CreditPayment results:: '+JSON.stringify(results)+'\n');

						if(results.statusCode==200)
						{
							completecount++;
							next();
						}
						else if(results.statusCode==500)
						{
							declinecount++;
							next();
						}
						else
						{
							pendingcount++;
							next();
						}
				  });
				}, function (err){

					var finalData ='Complete count: '+completecount+' \n';
					finalData +='Pending count: '+pendingcount+' \n';
					finalData +='Decline count: '+declinecount+' \n';
					finalData +='==============================================================\n\n';

					if (err)
					{
						fs.appendFileSync(actumcheckcreditpayment, 'Check doctor credit payment Error:: '+err+'\n');
						fs.appendFileSync( actumcheckcreditpayment, finalData);
						return resolve({statuscode:400,message:'Unable to complete checking all doctor credit payment:: '+forlooplength,completecount:completecount,pendingcount:pendingcount,declinecount:declinecount});
					}

					fs.appendFileSync(actumcheckcreditpayment, 'All actum check doctor credit completed successfully \n');
					fs.appendFileSync( actumcheckcreditpayment, finalData);
					return resolve({statuscode:200,message:'Actum check doctor credit payment found:: '+forlooplength,completecount:completecount,pendingcount:pendingcount,declinecount:declinecount});

			    });
			}
			else
			{
				//-- No data to run for debit
				var emptyfinalData ='No actum check doctor credit payment record found \n';
				emptyfinalData +='########################################################\n\n';
				fs.appendFileSync( actumcheckcreditpayment, emptyfinalData);

				return resolve({statuscode:200,message:'No actum check doctor credit payment record found'});
			}
		}).catch(function(err) {
			sails.log.error("#checkDoctorCreditPaymentStatus::Error", err);
     		return reject(err);
		});


	    /*var criteria = {
			paymentstatus:{ $eq: 2, $exists: true },
			creditrunstatus:{ $eq: 2, $exists: true },
			creditorderID:{ $exists: true }
		}

		Paymentcomissionhistory
		.find(criteria)
		.sort("createdAt ASC")
		.then(function(comissionDetails) {

			sails.log.info("checkDoctorCreditPaymentStatus count value : ",comissionDetails.length);
			var actumcheckcreditpayment = sails.config.appPath+'/actumdoctorcreditcheck/'+'actumdoctorcreditcheck_'+ moment().format('MM-DD-YYYY')+'.txt';

			var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			var initialData ='Check Doctor credit payment status cron called \n';
			initialData +='Cron time: '+currentDateTime+' \n';
			initialData +='Check count: '+comissionDetails.length+' \n';
			initialData += '************************************************\n\n';

			fs.appendFileSync(actumcheckcreditpayment, initialData);

			if(comissionDetails.length>0)
			{
				var finalloopcount=0;
				var forlooplength = comissionDetails.length;

				_.forEach(comissionDetails, function(comissionData) {
					var appendData ='';
					appendData +='Comission  ID: '+comissionData.id+' \n';
					appendData +='PaymentID: '+comissionData.paymentmanagement+' \n';
					appendData +='creditorderID: '+comissionData.creditorderID+' \n';
					appendData +='credithistoryID: '+comissionData.credithistoryID+' \n';
					appendData +='creditrunAmount: '+comissionData.creditrunAmount+' \n';

					fs.appendFileSync( actumcheckcreditpayment, appendData);

					var comissionID = comissionData.id;
					ActumService.getDoctorCreditStatus(comissionID, function(results){
						fs.appendFileSync(actumcheckcreditpayment, 'Doctor Credit Result :'+JSON.stringify(results)+'\n');

						if(results.statusCode==200)
						{
							fs.appendFileSync(actumcheckcreditpayment, 'Doctor Credit Status::'+results.statusCode+'\n');
						}
						else
						{
							fs.appendFileSync(actumcheckcreditpayment, 'Doctor Credit Status::'+results.statusCode+'\n');
						}

						finalloopcount++;
						if(finalloopcount==forlooplength)
						{
							var finalData ='==============================================================\n\n';
							fs.appendFileSync( actumcheckcreditpayment, finalData);
							return resolve({statuscode:200,message:'Actum check doctor credit payment found::'+forlooplength});
						}
					});
				});
			}
			else
			{
				//-- No data to run for debit
				var emptyfinalData ='No actum check doctor credit payment record found \n';
				emptyfinalData +='########################################################\n\n';
				fs.appendFileSync( actumcheckcreditpayment, emptyfinalData);

				return resolve({statuscode:200,message:'No record found'});
			}
		}).catch(function(err) {
			sails.log.error("#checkDoctorCreditPaymentStatus::Error", err);
     		return reject(err);
		});*/
  });
}
function archiveIncompleteApplications() {
	const Promise = require('bluebird');
	const days = moment().subtract(180,'days').startOf('day').toDate();
	sails.log.verbose('archiveIncompleteApplciations: ', days);
	return Screentracking.find({iscompleted:0, createdAt:{$lt:days}, moveToArchive:{$ne:1}}).then( applications => {
		sails.log.verbose('archiveIncompleteApplicatons:', applications.length)
		const promiseFns = [];
		_.forEach(applications, (screentracking) => {
			promiseFns.push(() => {
				sails.log.verbose('archiveIncompleteApplicatons:',screentracking.applicationReference,screentracking.id,screentracking.createdAt)
				return Screentracking.update({id:screentracking.id},{moveToArchive:1})
				// return Promise.resolve();
			});
		});
		return Promise.each(promiseFns,fn => fn())
	})

}


async function expiredUsersDenied() {
	const Promise = require('bluebird');
	const days = moment().subtract(180,'days').startOf('day').toDate();
	sails.log.verbose('180 days: ', days);
	const screenTrackings = await Screentracking.find({ iscompleted:0, createdAt:{ $lt:days } });
	sails.log.verbose('archiveIncompleteApplications=========================>>:', screenTrackings.length);

	const promiseFns = [];
	_.forEach(screenTrackings, (screenTracking) => {
		promiseFns.push(async () => {
			const screenTrackingRecord = await Screentracking.findOne( { id: screenTracking.id } )
				.populate( "plaiduser" )
				.populate( "user" )
				.populate( "practicemanagement" );
			if (!screenTrackingRecord) return;
			let paymentManagementRecord = await PaymentManagement.findOne({screentracking: screenTrackingRecord.id});
			let maturityDate = moment().startOf('day').toDate();
			if (paymentManagementRecord) {
				paymentManagementRecord.paymentSchedule = [];
				paymentManagementRecord.maturityDate = maturityDate;
				paymentManagementRecord.account = screenTrackingRecord.accounts ? screenTrackingRecord.accounts : '';
				paymentManagementRecord.nextPaymentSchedule = maturityDate;
				paymentManagementRecord.achstatus = 2;
				paymentManagementRecord.logs = [ ...paymentManagementRecord.logs, { message: "Expired Loan Denied", date: new Date() } ];
				paymentManagementRecord.deniedfromapp = 1;
				paymentManagementRecord.isPaymentActive = false;
				if (screenTrackingRecord.creditscore) paymentManagementRecord.creditScore = screenTrackingRecord.creditscore;
				paymentManagementRecord.status = 'DENIED';
				paymentManagementRecord.declinereason = 'Eligible to Reapply';
				await paymentManagementRecord.save();
			} else {
				const loanReferenceData = await User.getNextSequenceValue( 'loan' );
				const newPaymentManagement = {
					paymentSchedule: [],
					maturityDate: maturityDate,
					account: screenTrackingRecord.accounts ? screenTrackingRecord.accounts : '',
					nextPaymentSchedule: maturityDate,
					achstatus: 2,
					loanReference: `LN_${loanReferenceData.sequence_value}`,
					logs: [ { message: "Expired Loan Denied", date: new Date() } ],
					deniedfromapp: 1,
					screentracking: screenTrackingRecord.id,
					isPaymentActive: false,
					practicemanagement: screenTrackingRecord.practicemanagement,
					user: screenTrackingRecord.user ? screenTrackingRecord.user.id : '',
					status: "DENIED",
					declinereason: "Eligible to Reapply"
				}
				if (screenTrackingRecord.creditscore) newPaymentManagement.creditScore = screenTrackingRecord.creditscore;
				paymentManagementRecord = await PaymentManagement.create(newPaymentManagement);
			}

			if (screenTrackingRecord.user) {
				const userConsents = await UserConsent.find({
					user: screenTrackingRecord.user.id,
					loanupdated: 1,
					paymentManagement: { $exists: false }
				}).sort( "createdAt DESC" );
				if( userConsents && userConsents.length ) {
					_.forEach(userConsents, (userConsent) => {
						UserConsent.updateUserConsentAgreement( userConsent.id, screenTrackingRecord.user.id, paymentManagementRecord.id );
					});
				}
			}

			screenTrackingRecord.iscompleted = 1;
			if (screenTrackingRecord.creditscore === "") delete screenTrackingRecord.creditscore;
			await screenTrackingRecord.save();
		});
	});
	await Promise.each(promiseFns,fn => fn());
	sails.log.info("update expired loans to denied complete");
	return true;
}
