/**
 * Makepayment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q')
var shortid = require('shortid');
var  _ = require('lodash');
var moment = require('moment');
var fs = require('fs');

module.exports = {

  attributes: {

  },
  manualpayment:manualpayment,
  addmanualpayment:addmanualpayment,
  getFullpayment:getFullpayment,
  checkbalancewithRepull:checkbalancewithRepull

};
function addmanualpayment(paymentid,reqdata){
   return Q.promise(function(resolve, reject) {

	    var paymentID = paymentid;
		var makeamount = reqdata.param('makeamount');
		var fullmakeamount = reqdata.param('fullmakeamount');
		var reasoncomment = reqdata.param('reasoncomment');
		var paymentType = reqdata.param('paymentType');
		var paymentOption = reqdata.param('paymentOption');
		var fullintrestamount = reqdata.param('fullintrestamount');
		var hiddenintrestamount = reqdata.param('hiddenintrestamount');
		var makepaymenttype = reqdata.param('makeredirectpath');

		var totalprincipalamount = 0;
		fullmakeamount = parseFloat(fullmakeamount).toFixed(2);
		fullintrestamount = parseFloat(fullintrestamount).toFixed(2);
		hiddenintrestamount = parseFloat(hiddenintrestamount).toFixed(2);
		var makpaymenttotal = parseFloat(fullmakeamount)+parseFloat(fullintrestamount);
		makpaymenttotal = parseFloat(makpaymenttotal).toFixed(2);

		/* sails.log.info("paymentID : ",paymentID);
		 sails.log.info("paymentOption : ",paymentOption);
		 sails.log.info("fullmakeamount : ",fullmakeamount);
		 sails.log.info("fullintrestamount : ",fullintrestamount);*/

		if(paymentID){

			  var criteria = {
				id: paymentID
			  };
			  PaymentManagement
				.findOne(criteria)
				.populate('user')
				.populate('account')
				.then(function(paymentmanagementdata) {


					if(paymentOption=='fullpayment')
					{
					  _.forEach(paymentmanagementdata.paymentSchedule, function(scheduler) {
						if (scheduler.status == "OPENED" || scheduler.status == 'CURRENT') {
						  totalprincipalamount+= parseFloat(scheduler.principalAmount);
						}
					  })

					  totalprincipalamount = parseFloat(totalprincipalamount).toFixed(2);
					 // sails.log.info("totalprincipalamount : ",totalprincipalamount);

					  if(fullmakeamount > 0){
						  //1000 > 800
						  var differentamount = Math.abs(parseFloat(totalprincipalamount) - parseFloat(fullmakeamount));
						  differentamount = parseFloat(differentamount).toFixed(2);
						  //if(parseFloat(totalprincipalamount) > parseFloat(makpaymenttotal))
						  if(parseFloat(differentamount) > 1)
						  {
							  //sails.log.info("makpaymenttotal111111 : ",makpaymenttotal);
							  return resolve({
								code: 402,
								message: "Unable to update loan payment details! Loan amount less than payOff amount"
							 });

						  }else{
							  fullintrestamount = parseFloat(fullintrestamount);
							  makeamount = parseFloat(fullmakeamount)+parseFloat(fullintrestamount)
							  makeamount = parseFloat(makeamount).toFixed(2);
						  }
					  }

					}else{
						makeamount = parseFloat(makeamount).toFixed(2);
					}

					if(makepaymenttype=='frontend'){
					  var repullType ='Manualdebit-FrontEnd';
					}else{
					  var repullType ='Manualdebit';
					}
					var payAmount = makeamount;
					var accountID = paymentmanagementdata.account.id;

					sails.log.info("accountID : ",accountID);

					Makepayment
					.checkbalancewithRepull(accountID,payAmount,repullType,paymentID)
					.then(function(balanceresponse){

						sails.log.info("balanceresponse.code : ",balanceresponse.code);
						fs.appendFileSync('makepaymentlog/makepaymentResponse_'+paymentID+'.txt', '\n\n balanceresponse: '+JSON.stringify(balanceresponse));

						 if(balanceresponse.code==200)
						 {

								if(paymentmanagementdata)
								{
									//sails.log.info("paymentOption11111111111 : ",paymentOption);
									Schedulehistory
									.changePaymentSchedule(paymentmanagementdata)
									.then(function(paymentdata) {

											//sails.log.info("paymentmanagementdata.achstatus : ",paymentmanagementdata.achstatus);
											//sails.log.info("paymentmanagementdata.transferstatus : ",paymentmanagementdata.transferstatus);

									   if(paymentmanagementdata.achstatus==1 && paymentmanagementdata.transferstatus==1)
									   {

									   //sails.log.info("paymentOption222222222222 : ",paymentOption);
									   //sails.log.info("paymentManagement : ",'22222222222222');
											var checkallowPayment =0;
											var interestRate =  0;
											var fullPayoffAmount =  0;
											var finalinterestAmount =  0;
											var totalinterestDays =0;
											var paidterms =0;
											var interestApplied =0;
											var chargeinterestDays =0;
											var interestAmount=0;
											var startBalanceAmount=0;
											var totalinterestDaysAmount=0;
											var dayinterestAmount=0;
											var chargeinterestDays=0;


											if(paymentmanagementdata.interestapplied)
											{
												var loanInterestRate =  paymentmanagementdata.interestapplied;
											}
											else
											{
												var loanInterestRate = 0;
											}

											//sails.log.info("paymentOption33333333333 : ",paymentOption);
											//sails.log.info("paymentManagement : ",'3333333333333');

											//User repay loan amount for no interest
											if(paymentOption=='useramount' && loanInterestRate==0)
											{
												if (makeamount <= paymentmanagementdata.payOffAmount) {
													checkallowPayment=1;
												}
											}

											//sails.log.info("paymentOption4444444444 : ",paymentOption);

											if( (paymentOption=='fullpayment') || (paymentOption=='useramount' && loanInterestRate>0) )
											{

												//sails.log.info("paymentManagement : ",'555555555555555');

												  if(paymentmanagementdata.interestapplied)
												  {
													var interestRate =  paymentmanagementdata.interestapplied;
												  }

												  if(interestRate>0)
												  {
													   //sails.log.info("paymentManagement : ",'55555555555555');

														  var paymentSchedulData = _.orderBy(paymentmanagementdata.paymentSchedule, ['date'], ['asc']);
														  var checkMaturityDate = moment(paymentmanagementdata.maturityDate).startOf('day').toDate().getTime();

														  _.forEach(paymentSchedulData, function(scheduler) {

																if (scheduler.status == "OPENED" || scheduler.status == 'CURRENT' || scheduler.status == 'LATE' ) {

																	if(scheduler.amount>0)
																	{
																		interestAmount = scheduler.interestAmount;
																		startBalanceAmount = scheduler.startBalanceAmount;
																		startprincipalAmount = scheduler.principalAmount;

																		if(fullPayoffAmount==0)
																		{
																			fullPayoffAmount = parseFloat(startBalanceAmount)+parseFloat(startprincipalAmount);
																		}

																		var nextMonthDate = moment(scheduler.date).startOf('day').toDate();
																		var nextMonthDateValue = moment(nextMonthDate).startOf('day').toDate().getTime();
																		var todaysDate = moment(new Date());
																		var todaysDateValue = moment().startOf('day').toDate().getTime();
																		var lastpaidDate  = moment(scheduler.lastpaiddate).startOf('day').toDate();
																		var lastpaidDateValue = moment(scheduler.lastpaiddate).startOf('day').toDate().getTime();

																		var schedulerDate  = moment(scheduler.date).startOf('day').toDate();

																		if( todaysDateValue >= nextMonthDateValue && todaysDateValue<=checkMaturityDate )
																		{
																			finalinterestAmount = parseFloat(finalinterestAmount)+parseFloat(interestAmount);
																		}
																		else
																		{
																			if( nextMonthDateValue > todaysDateValue && todaysDateValue<=checkMaturityDate)
																			{
																				if(interestApplied==0)
																				{
																					//oDate = moment(nextMonthDate);
																					var oDate = moment(lastpaidDate);
																					var diffDays = oDate.diff(todaysDate, 'days');
																					var totalinterestDays  = Math.abs(diffDays);

																					var sDate = moment(schedulerDate);
																					var sdiffDays = sDate.diff(lastpaidDate, 'days');
																					var sdiffDays  = Math.abs(sdiffDays);

																					if(sdiffDays>14)
																					{
																						sdiffDays =14;
																					}

																					sails.log.info("sdiffDays : ",sdiffDays);

																					//dayinterestAmount = interestAmount / 30;
																					//chargeinterestDays = 30 - totalinterestDays;
																					sdiffDays =14;
																					dayinterestAmount = interestAmount / sdiffDays;
																					chargeinterestDays = totalinterestDays;

																					sails.log.info("dayinterestAmount : ",dayinterestAmount);

																					if(todaysDateValue<lastpaidDateValue)
																					{
																						chargeinterestDays =0;
																					}
																					else
																					{
																						if(chargeinterestDays<=0)
																						{
																							if(scheduler.lastpaidcount==1 && todaysDateValue==lastpaidDateValue )
																							{
																								chargeinterestDays =0;
																							}
																							else
																							{
																								chargeinterestDays =1;
																							}
																						}
																						else
																						{
																							if(scheduler.lastpaidcount==1)
																							{
																								chargeinterestDays =parseInt(chargeinterestDays);
																							}
																							else
																							{
																							 chargeinterestDays =parseInt(chargeinterestDays)+1;
																							}
																						}
																					}

																					totalinterestDaysAmount = dayinterestAmount * chargeinterestDays;
																					finalinterestAmount = parseFloat(finalinterestAmount)+parseFloat(totalinterestDaysAmount);
																					interestApplied =1;
																				}
																			}
																		}
																	}
																}

																if (scheduler.status == "PAID OFF" )
																{
																	paidterms = parseInt(paidterms)+1;
																}
														  })


														  if(parseFloat(fullPayoffAmount) >0)
														   {
															  fullPayoffAmount =  parseFloat(fullPayoffAmount);

															  if(parseFloat(finalinterestAmount) >0)
															  {
																  fullPayoffAmount = parseFloat(fullPayoffAmount) + parseFloat(finalinterestAmount);
															  }
														   }

														   fullPayoffAmount = parseFloat(fullPayoffAmount.toFixed(2));
														   if(makeamount == fullPayoffAmount)
														   {
															   //Considered as full payment when user entered amount equal to amount to be paid till that date
															   paymentOption ='fullpayment';
														   }

														   if (makeamount <= fullPayoffAmount)
														   {
																checkallowPayment=1;
														   }


												  }
												  else
												  {
													 if (makeamount <= paymentmanagementdata.payOffAmount) {
														 checkallowPayment=1;
													 }
												  }

											}

											/*sails.log.info("makeamount : ",makeamount);
											sails.log.info("fullPayoffAmount : ",fullPayoffAmount);
											sails.log.info("checkallowPayment : ",checkallowPayment);	*/

											if(checkallowPayment==1)
											{
												var accountID = paymentmanagementdata.account.id;
												var accountDetail = paymentmanagementdata.account;
												var loanID = paymentmanagementdata.loanReference;
												var transactionDetail = '';
												var user = paymentmanagementdata.user;

											   if(paymentOption=='fullpayment' && loanInterestRate>0 )
											   {

													var paymentID = paymentmanagementdata.id;

													PaymentManagement
													  .updateForMakeFullPaymentDetail(user, transactionDetail, makeamount, fullPayoffAmount, finalinterestAmount, paymentID, loanID, accountID, accountDetail)
													  .then(function(paymentDetails) {

															//sails.log.info("paymentDetails1111111111 : ",paymentDetails.paymentManagementDetail);

															VikingRequest
															.updateMakePayment(paymentDetails.paymentManagementDetail,makeamount,paymentDetails.initialschedulelist,makepaymenttype)
															.then(function(vikingdata) {

																		var todaysDate = moment().format("YYYY-MM-DD");

																		//--Ach comments
																		var adminemail = reqdata.session.email;
																		var todaydate= moment().startOf('day').format('LLL');
																		var achmodulename = 'Loan manual repayment from admin';
																		var achmodulemessage = 'Successful loan manual repayment from admin by '+adminemail+' for loan reference: '+loanID+' ($'+makeamount+') <br>Comment: '+reasoncomment+' <br>Date: '+todaydate;

																		var allParams={
																			 subject : achmodulename,
																			 comments : achmodulemessage,
																			 achviewtype:'admin'
																		};

																		Achcomments
																		.createAchComments(allParams,paymentID)
																		.then(function (achcomments) {
																				sails.log.info("paymentFeeManagement createAchComments success::");
																		}).catch(function (err) {
																			 sails.log.error("paymentFeeManagement createAchComments error::", err);
																		});

																		return resolve({
																			code: 200,
																			message: "Manual payment processed successfully from admin"
																		 });


															}).catch(function(err) {
																 sails.log.error('makePaymentForAchStoryAction::Error : err', err);
																 return resolve({
																	code: 402,
																	message: "Unable to update loan payment details!"
																 });
															})

													   }).catch(function(err) {
															 sails.log.error('makePaymentForAchStoryAction::Error : err', err);
															 return resolve({
																code: 402,
																message: "Unable to update loan payment details!"
															 });
													   })
													   //---Added for full payment ends here


											   }
											  else if(paymentOption=='useramount' && loanInterestRate>0 )
											  {

												  //process.exit(1);

													var paymentID = paymentmanagementdata.id;
													PaymentManagement
													.updateForMakeUserPaymentDetail(user, transactionDetail, makeamount, fullPayoffAmount, finalinterestAmount, paymentID, loanID, accountID, accountDetail)
													.then(function(paymentDetails) {


														VikingRequest
														.updateMakePayment(paymentDetails.paymentManagementDetail,makeamount,paymentDetails.initialschedulelist,makepaymenttype)
														.then(function(vikingdata) {

																var todaysDate = moment().format("YYYY-MM-DD");

																 //--Ach comments
																var adminemail = user.email;
																var todaydate= moment().startOf('day').format('LLL');
																var achmodulename = 'Loan manual repayment from admin';

																var achmodulemessage = 'Successful loan manual repayment from admin by '+adminemail+' for loan reference: '+loanID+' ($'+makeamount+') <br>Comment: '+reasoncomment+' <br>Date: '+todaydate;

																var allParams={
																	 subject : achmodulename,
																	 comments : achmodulemessage,
																	 achviewtype:'admin'
																};

																Achcomments
																.createAchComments(allParams,paymentID)
																.then(function (achcomments) {
																		sails.log.info("paymentFeeManagement createAchComments success::");
																}).catch(function (err) {
																	 sails.log.error("paymentFeeManagement createAchComments error::", err);
																});

																return resolve({
																	code: 200,
																	message: "Manual payment processed successfully from admin"
																 });


															}).catch(function(err) {
																 sails.log.error('makePaymentForAchStoryAction::Error : err', err);
																 return resolve({
																	code: 402,
																	message: "Unable to update loan payment details!"
																 });
															})


													}).catch(function(err) {
														 sails.log.error('makePaymentForAchStoryAction::Error : err', err);
														 //-- Ach history update
														 achhistoryData.appfailure = 1;
														 achhistoryData.appfailuremessage = "Unable to update loan payment details!";
														 achhistoryData.save();

														 return reject({
															code: 402,
															message: "Unable to update loan payment details!"
														 });
													})


											  }
											  else
											  {

													var paymentID = paymentmanagementdata.id;
													if (!paymentmanagementdata.usertransactions)
													{
													  paymentmanagementdata.usertransactions = [];
													}

													//-- Added for ticket no 920
													paymentmanagementdata.usertransactions.push({
													  amount: makeamount,
													  loanID: loanID,
													  status:3,
													  transactionId: '',
													  transactionType:'Manual',
													  apiType:apiType,
													  accountName: paymentmanagementdata.account.accountName,
													  accountNumberLastFour: paymentmanagementdata.account.accountNumberLastFour,
													  accountId: accountID,
													  date: new Date()
													});
													//paymentmanagementdata.blockmakepayment =0;
													paymentmanagementdata.save(function(err) {

													});

													return reject({
														code: 402,
														message: "Loan repayment failed!"
													});

											  }

											}
											else
											{
											   return resolve({
													code: 400,
													message: "Your loan repay amount is greater than loan amount!"
											   });
											}

									   }
									   else
									   {
										 return resolve({
											code: 400,
											message: "Your loan is not processed yet. You can repay loan amount later!"
										  });
									   }

									}).catch(function(err) {
										 return resolve({
											code: 402,
											message: "Unable to update loan payment details!"
										  });
									});


								}else{
									return resolve({
										code: 402,
										message: "Unable to update loan payment details!"
									});
								}


							 }else{

								 return resolve({
									code: balanceresponse.code,
									message: balanceresponse.message
								});

							 }


						 });





				})
			    .catch(function(err) {
					return resolve({
						code: 402,
						message: "Unable to update loan payment details!"
					});
			    });

		}else{
			sails.log.error("Screentracking#changeincomecreate::", err);
			return resolve({
				code: 402,
				message: "Payment not updated. You can repay loan amount later!"
			});
		}


   });
}


function manualpayment(paymentid,reqdata){
	return Q.promise(function(resolve, reject) {

		var paymentID = reqdata.param('paymentID');
		var makeamount = reqdata.param('makeamount');
		var reasoncomment = reqdata.param('reasoncomment');
		var paymentType = reqdata.param('paymentType');
		var paymentOption = reqdata.param('paymentOption');


		if(paymentid){

			  var criteria = {
				id: paymentID
			  };
			  PaymentManagement
				.findOne(criteria)
				.populate('user')
				.populate('account')
				.then(function(paymentManagement) {

				    if(paymentManagement)
					{

						Schedulehistory
						.changePaymentSchedule(paymentManagement)
						.then(function(paymentdata) {


							var principalAmount = 0;
							var interestAmount = 0;
							var amount =0;
							var totalscheduleamount = 0;
							var remainingamount = 0;
							var paidprincipalAmount =0;
							var paidinterestAmount = 0;
							var paidprincipalAmount =0;
							var paidinterestAmount = 0;
							var paidstatus = '';
							var balnceamount = 0;

							_.forEach(paymentManagement.paymentSchedule, function(schedule) {

								   principalAmount = schedule.principalAmount;
							       interestAmount = schedule.interestAmount;
								   amount = schedule.amount;
								   totalscheduleamount = parseFloat(principalAmount)+parseFloat(interestAmount);
								   remainingamount = parseFloat(makeamount)-parseFloat(totalscheduleamount);
								   remainingamount = parseFloat(remainingamount).toFixed(2);

								   //sails.log.info('remainingamount : ', remainingamount);
								 //  sails.log.info('makeamount : ', makeamount);

								  if(paymentOption=='fullpayment')
								  {
										remainingintrest = parseFloat(makeamount)-parseFloat(interestAmount);
										remainingprincipal = parseFloat(remainingintrest)-parseFloat(principalAmount);
										paidprincipalAmount = parseFloat(principalAmount).toFixed(2);
										paidinterestAmount = parseFloat(interestAmount).toFixed(2);
										makeamount = parseFloat(remainingprincipal).toFixed(2);
										paidstatus = 'PAID OFF';
										balnceamount = 0;
								  }
								  else
								  {
									  if(remainingamount<=0)
									  {
										  //sails.log.info('remainingamount less : ', remainingamount);

											if(makeamount <= interestAmount)
											{

												//sails.log.info('interestAmounthigh : ', interestAmount);
												if(makeamount < 0 ){
													remainingintrest = parseFloat(interestAmount);
													paidinterestAmount = 0
												}else{
													remainingintrest = parseFloat(interestAmount)-parseFloat(makeamount);
													paidinterestAmount = parseFloat(makeamount).toFixed(2);
												}
												remainingprincipal = principalAmount;

												principalAmount = parseFloat(principalAmount).toFixed(2);
												interestAmount = parseFloat(remainingintrest).toFixed(2);
												//balnceamount = parseFloat(amount)-parseFloat(makeamount);

												//sails.log.info('balnceamount : ', balnceamount);
												//sails.log.info('principalAmount : ', principalAmount);
												//sails.log.info('interestAmount : ', interestAmount);

												paidprincipalAmount = 0;
												//paidinterestAmount = parseFloat(interestAmount).toFixed(2);

												//sails.log.info('paidinterestAmount : ', paidinterestAmount);

												//balnceamount = parseFloat(balnceamount).toFixed(2);

											}else if(makeamount >= interestAmount)
											{
												remainingintrest = parseFloat(makeamount)-parseFloat(interestAmount);
												if(remainingintrest >= principalAmount)
												{
												  remainingprincipal = parseFloat(remainingintrest)-parseFloat(principalAmount);
												}else{
												  remainingprincipal = parseFloat(principalAmount)-parseFloat(remainingintrest);
												}

												principalAmount = parseFloat(principalAmount)-parseFloat(remainingprincipal);
												interestAmount = parseFloat(interestAmount)-parseFloat(remainingintrest);
												//balnceamount = parseFloat(amount)-parseFloat(makeamount);

												paidprincipalAmount = parseFloat(remainingintrest).toFixed(2);
												paidinterestAmount = parseFloat(makeamount).toFixed(2);

												//balnceamount = parseFloat(balnceamount).toFixed(2);

											}

											makeamount = parseFloat(remainingamount).toFixed(2);
											paidstatus = 'PARTIAL PAID OFF';

									  }
									  else
									  {

											 //sails.log.info('remainingamount high : ', interestAmount);
											// sails.log.info('principalAmount high : ', principalAmount);

											remainingintrest = parseFloat(makeamount)-parseFloat(interestAmount);
											remainingprincipal = parseFloat(remainingintrest)-parseFloat(principalAmount);

											// sails.log.info('remainingintrest : ', remainingintrest);
											// sails.log.info('remainingprincipal : ', remainingprincipal);

											paidprincipalAmount = parseFloat(principalAmount).toFixed(2);
											paidinterestAmount = parseFloat(interestAmount).toFixed(2);

											//sails.log.info('paidprincipalAmount : ', paidprincipalAmount);
										//	 sails.log.info('paidinterestAmount : ', paidinterestAmount);

											makeamount = parseFloat(remainingprincipal).toFixed(2);

											//sails.log.info('makeamount : ', makeamount);

											paidstatus = 'PAID OFF';
											balnceamount = 0;



									  }

								  }
									schedule.principalAmount = principalAmount;
									schedule.interestAmount = interestAmount;
									//schedule.amount = balnceamount;
									schedule.paidprincipalAmount = paidprincipalAmount;
									schedule.paidinterestAmount = paidinterestAmount;
									schedule.lastpaidprincipalAmount = paidprincipalAmount;
									schedule.lastpaidinterestAmount = paidinterestAmount;
									schedule.reasoncomment = reasoncomment;
									schedule.status = paidstatus;

									//sails.log.info('schedule : ', schedule);


							});

							 paymentManagement.paymentSchedule = _.orderBy(paymentManagement.paymentSchedule, ['status'], ['asc']);
							 paymentManagement.save(function(err) {
								  if (err)
								  {
									sails.log.error("Screentracking#changepaymentschudle :: Error :: ", err);
									return reject({
									  code: 500,
									  message: 'INTERNAL_SERVER_ERROR'
									});

								  }
								 var adminemail = reqdata.user.email;
								 var payID = paymentManagement.id
								 var todaydate= moment().startOf('day').format('LLL'); // February 23rd 2018, 3:53:52 pm;
								 var modulename = 'Changed payment schedule amount';
								 var modulemessage = 'Schedule amount changed by '+adminemail+' <br>Comment: '+reasoncomment+' <br>Date: '+todaydate;
								 var allParams={
									 subject : modulename,
									 comments : modulemessage
								 }
								 Achcomments
								 .createAchComments(allParams,payID,adminemail)
								 .then(function (achcomments) {
									   return resolve({
										  code: 200,
										  message: 'Schedule date has been updated successfully'
									   });
								 }).catch(function (err) {
									 sails.log.error("Screentracking#changeincomecreate::", err);
									 return reject(err);
								 });

							});



						}).catch(function(err) {
							return resolve({
								code: 500,
								message: 'INTERNAL_SERVER_ERROR'
							});
						});


					}else{
						return reject({
							code: 500,
							message: 'INTERNAL_SERVER_ERROR'
						});
					}


				})
			    .catch(function(err) {
					return reject({
						code: 500,
						message: 'INTERNAL_SERVER_ERROR'
					});
			    });

		}else{
			sails.log.error("Screentracking#changeincomecreate::", err);
			return reject({
				code: 500,
				message: 'INTERNAL_SERVER_ERROR'
			});
		}


	});

}


function getFullpayment(paymentid){

	return Q.promise(function(resolve, reject) {

	  var paymentID = paymentid;
      var criteria = {
        id: paymentID,
        isPaymentActive: true
      };

      PaymentManagement
        .findOne(criteria)
		.populate('account')
        .then(function(paymentManagementDetail) {

              var payOffAmount = 0;
              var totalAmountDue = 0;

			// sails.log.info('paymentManagementDetail : ', paymentManagementDetail);

			   if(paymentManagementDetail!='' && paymentManagementDetail!=null && "undefined" !== typeof paymentManagementDetail)
			 {

					  if(paymentManagementDetail.paymentSchedule!='' && paymentManagementDetail.paymentSchedule!=null && "undefined" !== typeof paymentManagementDetail.paymentSchedule)
					  {
						  _.forEach(paymentManagementDetail.paymentSchedule, function(scheduler) {
							if (scheduler.status == "OPENED" || scheduler.status == 'CURRENT') {
							  totalAmountDue = paymentManagementDetail.paymentSchedule[0].amount;
							  payOffAmount = parseFloat(payOffAmount) + parseFloat(scheduler.amount);
							}

						  })

					  	   //-- for Tfc only
						  /*if(paymentManagementDetail.amount)
						  {
							var financedAmount =  paymentManagementDetail.amount;
						  }
						  else
						  {
							 var financedAmount =  paymentManagementDetail.payOffAmount;
						  }*/


						  if(paymentManagementDetail.payOffAmount)
						  {
							var financedAmount =  paymentManagementDetail.payOffAmount;
						  }
						  else
						  {
							 var financedAmount =  paymentManagementDetail.finalpayoffAmount;
						  }

						  if(paymentManagementDetail.interestapplied)
						  {
							var interestRate =  paymentManagementDetail.interestapplied;
						  }
						  else
						  {
							 var interestRate =  0;
						  }

						  var todaysDateFormat = moment().startOf('day').format('MM-DD-YYYY');
						  //var todaysDate = moment().startOf('day').toDate();
						  var todaysMonth = moment().startOf('day').format('M');
						  var currentDay = moment().startOf('day').format('D');
						  fullPayoffAmount =  0;
						  fullPayoffMonth =  0;
						  finalinterestAmount =  0;
						  totalinterestDays =0;
						  paidterms =0;
						  interestApplied =0;
						  chargeinterestDays =0;
						  minimumAmount=0;
						  fullprincipalamount=0;
						  actualStartBalanceAmount =0;
						  latePrincipalAmount =0;

						  var maturityDate = moment(paymentManagementDetail.maturityDate).startOf('day').toDate().getTime();

						  //-- Six Months 0% Pay Off Balance
						  var loanStartDate;
						  var sixmonthLoanDate;
						  var loaninsideSixMonth=0;
						  var loanpaidInterest =0;
						  var currenttodaysDate = moment().startOf('day').toDate().getTime();
						  if(paymentManagementDetail.loanSettledDate)
						  {
							  loanStartDate = moment(paymentManagementDetail.loanSettledDate).startOf('day').toDate().getTime();
						  }
						  else if(paymentManagementDetail.loanApprovedDate)
						  {
							  loanStartDate = moment(paymentManagementDetail.loanApprovedDate).startOf('day').toDate().getTime();
						  }
						  else
						  {
							 loanStartDate = moment(paymentManagementDetail.createdAt).startOf('day').toDate().getTime();
						  }

						  sixmonthLoanDate = moment(loanStartDate).startOf('day').add(6, 'months').toDate().getTime();

						  if (currenttodaysDate < sixmonthLoanDate)
						  {
							 loaninsideSixMonth=1;
						  }

						  if(interestRate>0)
						  {
							   paymentManagementDetail.paymentSchedule = _.orderBy(paymentManagementDetail.paymentSchedule, ['date'], ['asc']);

							   //minimumAmount = paymentManagementDetail.paymentSchedule[0].interestAmount;

							   _.forEach(paymentManagementDetail.paymentSchedule, function(scheduler) {

										//-- Six Months 0% Pay Off Balance
									    loanpaidInterest = parseFloat(loanpaidInterest)+parseFloat(scheduler.paidinterestAmount);

										if(minimumAmount==0)
										{
											minimumAmount = scheduler.interestAmount;
										}
										if (scheduler.status == "OPENED" || scheduler.status == 'CURRENT' || scheduler.status == 'LATE' ) {
												if(scheduler.amount>0)
												{
													interestAmount = scheduler.interestAmount;
													startBalanceAmount = scheduler.startBalanceAmount;
													/*if(fullPayoffAmount==0)
													{
														fullPayoffAmount = parseFloat(startBalanceAmount)+parseFloat(scheduler.principalAmount);
													}*/

													//var nextMonthDate = moment(scheduler.date).add(1, "months").startOf('day').toDate();
													var nextMonthDate = moment(scheduler.date).startOf('day').toDate();
													var nextMonthDateValue = moment(nextMonthDate).startOf('day').toDate().getTime();
													var todaysDate = moment(new Date());
													var todaysDateValue = moment().startOf('day').toDate().getTime();
													var schedulerDate  = moment(scheduler.date).startOf('day').toDate();

													var lastpaidDate  = moment(scheduler.lastpaiddate).startOf('day').toDate();
													var lastpaidDateValue = moment(scheduler.lastpaiddate).startOf('day').toDate().getTime();

													//sails.log.info("lastpaidDate: ",lastpaidDate);
													//sails.log.info("todaysDate: ",todaysDate);



													if( todaysDateValue >= nextMonthDateValue && todaysDateValue<=maturityDate )
													{
														finalinterestAmount = parseFloat(finalinterestAmount)+parseFloat(interestAmount);
														latePrincipalAmount = parseFloat(latePrincipalAmount)+parseFloat(scheduler.principalAmount);

														//sails.log.info("latePrincipalAmount: ",latePrincipalAmount);
														//sails.log.info("finalinterestAmount: ",finalinterestAmount);
													}
													else
													{
														if( nextMonthDateValue > todaysDateValue && todaysDateValue<=maturityDate)
														{
															if(interestApplied==0)
															{
																//actualStartBalanceAmount = parseFloat(startBalanceAmount)+parseFloat(scheduler.principalAmount);

																//oDate = moment(nextMonthDate);
																oDate = moment(lastpaidDate);
																diffDays = oDate.diff(todaysDate, 'days');
																totalinterestDays  = Math.abs(diffDays);

																sDate = moment(schedulerDate);
																sdiffDays = sDate.diff(lastpaidDate, 'days');
																sdiffDays  = Math.abs(sdiffDays);

																//sails.log.info("sdiffDays: ",sdiffDays);
																//sails.log.info("totalinterestDays: ",totalinterestDays);

																/*if(sdiffDays>14)
																{
																	sdiffDays =14;
																}
																sdiffDays =14;*/

																sdiffDays =30;


																dayinterestAmount = interestAmount / sdiffDays;
																chargeinterestDays = totalinterestDays;

																/*sails.log.info("todaysDateValue: ",todaysDateValue);
																sails.log.info("lastpaidDateValue: ",lastpaidDateValue);*/

																if(todaysDateValue<lastpaidDateValue)
																{
																	chargeinterestDays =0;
																}
																else
																{
																	if(chargeinterestDays<=0)
																	{
																		if(scheduler.lastpaidcount==1 && todaysDateValue==lastpaidDateValue )
																		{
																			chargeinterestDays =0;
																		}
																		else
																		{
																			chargeinterestDays =1;
																		}
																	}
																	else
																	{
																		if(scheduler.lastpaidcount==1)
																		{
																			chargeinterestDays =parseInt(chargeinterestDays);
																		}
																		else
																		{
																		 chargeinterestDays =parseInt(chargeinterestDays)+1;
																		}
																	}
																}

																totalinterestDaysAmount = dayinterestAmount * chargeinterestDays;


																/*sails.log.info("scheduler.lastpaidcount: ",scheduler.lastpaidcount);
																sails.log.info("enter else part: ");
																sails.log.info("diffDays: ",totalinterestDays);
																sails.log.info("chargeinterestDays: ",chargeinterestDays);
																sails.log.info("dayinterestAmount: ",dayinterestAmount);
																sails.log.info("totalinterestDaysAmount: ",totalinterestDaysAmount);*/

																finalinterestAmount = parseFloat(finalinterestAmount)+parseFloat(totalinterestDaysAmount);

																interestApplied =1;
																//sails.log.info("finalinterestAmount1111: ",finalinterestAmount);
															}
														}
													}

													actualStartBalanceAmount = parseFloat(actualStartBalanceAmount)+parseFloat(scheduler.principalAmount);
													actualStartBalanceAmount = parseFloat(actualStartBalanceAmount).toFixed(2);
												    //sails.log.info("actualStartBalanceAmount===: ",actualStartBalanceAmount);
												}
										}

										if (scheduler.status == "PAID OFF" )
										{
											paidterms = parseInt(paidterms)+1;
										}
								})

							   /*sails.log.info("actualStartBalanceAmount: ",actualStartBalanceAmount);
							   sails.log.info("latePrincipalAmount: ",latePrincipalAmount);
							   sails.log.info("loanpaidInterest: ",loanpaidInterest);
							   sails.log.info("loaninsideSixMonth: ",loaninsideSixMonth);
							   sails.log.info("paidterms: ",paidterms);*/


							   //-- Sum interest amount and late prinicpal
							   if(parseFloat(fullPayoffAmount)>=0)
							   {
									//fullPayoffAmount = parseFloat(actualStartBalanceAmount)+parseFloat(latePrincipalAmount);
									fullPayoffAmount = parseFloat(actualStartBalanceAmount);

									if(fullPayoffAmount > financedAmount){
									    fullPayoffAmount = financedAmount
									}
							   }

							   //sails.log.info("fullPayoffAmount222222222: ",fullPayoffAmount);

							   if(parseFloat(fullPayoffAmount) >0)
							   {
								  fullPayoffAmount =  parseFloat(fullPayoffAmount);
								  fullprincipalamount =parseFloat(fullPayoffAmount);

								  //-- Six Months 0% Pay Off Balance (start)
								  if(loaninsideSixMonth==1)
								  {
									   if( parseFloat(fullPayoffAmount)<parseFloat(loanpaidInterest))
									   {
										   fullPayoffAmount =0;
									   }
									   else
									   {
									   		fullPayoffAmount = parseFloat(fullPayoffAmount) -  parseFloat(loanpaidInterest);
									   }
								  }
								  else
								  {
									  if(parseFloat(finalinterestAmount) >0)
									  {
										  fullPayoffAmount = parseFloat(fullPayoffAmount) + parseFloat(finalinterestAmount);
									  }
								  }

								  if(fullPayoffAmount > financedAmount){
									    fullPayoffAmount = financedAmount
								  }
								  //-- Six Months 0% Pay Off Balance (ends)
							   }

							   if(paidterms==0)
							   {
								  if(fullPayoffAmount < financedAmount){
									    fullPayoffAmount = financedAmount
								  }
							   }

							   fullPayoffAmount = parseFloat(fullPayoffAmount).toFixed(2);
							   finalinterestAmount = parseFloat(finalinterestAmount).toFixed(2);
							   fullprincipalamount = parseFloat(fullprincipalamount).toFixed(2);

							   //sails.log.info("finalinterestAmount: ",finalinterestAmount);

						  }
						  else
						  {
							  fullPayoffAmount =  payOffAmount;
							  fullprincipalamount =fullPayoffAmount;
							  finalinterestAmount = 0;
						  }

						 //sails.log.info("finalinterestAmount: ",finalinterestAmount);
						 //sails.log.info("final fullPayoffAmount: ",fullPayoffAmount);

						  //-- Six Months 0% Pay Off Balance
						  var makePaymentObject = {
							payOffAmount: fullPayoffAmount,
							totalAmountDue: totalAmountDue,
							financedAmount: financedAmount,
							interestRate: interestRate,
							fullPayoffAmount: fullPayoffAmount,
							minimumAmount:minimumAmount,
							finalinterestAmount:finalinterestAmount,
							fullprincipalamount:fullprincipalamount,
							loaninsideSixMonth:loaninsideSixMonth,
							loanpaidInterest: loanpaidInterest
						};
						return resolve({
						  code: 200,
						  makePaymentObject:makePaymentObject
						});

					  }else{

						   return resolve({
							  code: 500,
							  message:"No payment details available",
							  makePaymentObject:''
							});


					  }


			   }else{

						   return resolve({
							  code: 500,
							  message:'No Payment Schedule ',
							  makePaymentObject:''
							});


					  }
        })
        .catch(function(err) {
           sails.log.error("# make payment Object::Error", err);
           return resolve({
			  code: 500,
			  message:err,
			  makePaymentObject:''
		    });
        })



  });

}


function checkbalancewithRepull(accountID,payAmount,repullType,paymentID){

 return Q.promise(function(resolve, reject) {


	sails.log.info("payAmount: ", payAmount);
	sails.log.info("repullType111111111: ", repullType);

	fs.appendFileSync('makepaymentlog/makepaymentResponse_'+paymentID+'.txt', 'accountID: '+accountID);

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

			Repullbankaccount
			.findOne(repullcriteria)
			.sort('createdAt DESC')
			.then(function(repulldata) {

				if(repulldata)
				{
					var todaysDate = moment(new Date());
					var oDate = moment(repulldata.createdAt);
					var diffHours = oDate.diff(todaysDate, 'hours');
					diffHours  = Math.abs(diffHours);

					fs.appendFileSync('makepaymentlog/makepaymentResponse_'+paymentID+'.txt', '\n\n diffHours: '+diffHours);
					sails.log.info("diffHours: ", diffHours);


					if(diffHours>8)
					{

					   Repullbankaccount.repullPlaidForPayment(accountID,payAmount,repullType)
						.then(function(repullresponse) {

						    if(repullresponse.status==200)
							{
								return resolve({
									code: 200,
									message:'success'
								  });
							}else{
								return resolve({
									code: repullresponse.status,
									message:  repullresponse.message,
									//message:'Unable to repull plaid details for the loan!'
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

							return resolve({
								code: 300,
								message:errormessage
							});
						});

					}
					else
					{

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
							sails.log.info("repulldata.balance.available: ", repulldata.balance.available);
						}
						var requestedBalance = parseFloat(payAmount).toFixed(2);

						fs.appendFileSync('makepaymentlog/makepaymentResponse_'+paymentID+'.txt', '\n\n requestedBalance: '+requestedBalance);
						fs.appendFileSync('makepaymentlog/makepaymentResponse_'+paymentID+'.txt', '\n\n availableAccountBalanceCheck: '+availableAccountBalanceCheck);

						if( parseFloat(availableAccountBalanceCheck) >= parseFloat(requestedBalance) )
						{
								processPayment =1;
						}
						//sails.log.info("processPayment: ", processPayment);
						fs.appendFileSync('makepaymentlog/makepaymentResponse_'+paymentID+'.txt', '\n\n processPayment: '+processPayment);

						if(processPayment==1)
						{
							  return resolve({
								code: 200,
								message:'success'
							  });
						}else{

							var errormessage ="Repull exist with insufficient Balance";
							return resolve({
								code: 300,
								message:errormessage
							});
						}

					}


			}
			else
			{

			    fs.appendFileSync('makepaymentlog/makepaymentResponse_'+paymentID+'.txt', '\n NewRepull Else condition: '+repullType);

			    Repullbankaccount.repullPlaidForPayment(accountID,payAmount,repullType)
				.then(function(repullresponse) {

					if(repullresponse.status==200)
					{
						return resolve({
							code: 200,
							message:'success'
						  });
					}else{
						return resolve({
							code: repullresponse.status,
							message:  repullresponse.message,
							//message:'Unable to repull plaid details for the loan!'
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

					return resolve({
						code: 300,
						message:errormessage
					});

				});


			}


		  });


		}

	  });


	});

}
