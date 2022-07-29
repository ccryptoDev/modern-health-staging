/**
 * Agreement.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q'),
moment =require('moment'),
  config = sails.config,
  feeManagement = config.feeManagement;
module.exports = {

  attributes: {
	practicemanagement: {
		model: "PracticeManagement"
	},
    documentKey: {
      type: 'string'
    },
    documentName: {
      type: 'string'
    },
    documentVersion: {
      type: 'string'
    },
    documentBody: {
      type: 'string'
    },
    documentPath: {
      type: 'string'
    },
    active: {
      type: 'boolean'
	},
	signatureRequired: {
		type: 'boolean'
	},
    toApi: toApi
  },
  createAgreement: createAgreement,
  findAgreement: findAgreement,

  findOneAgreement: findOneAgreement,
  getAgreement: getAgreement,
  updateAgreementDetails: updateAgreementDetails,
  deleteAgreement: deleteAgreement,
  getLoanAgreementDetail: getLoanAgreementDetail,
  getTilaAgreementDetail: getTilaAgreementDetail,
  getAdverseAgreement: getAdverseAgreement,
  generateModifiedLoanOffer:generateModifiedLoanOffer
};

function createAgreement(userAgreementDetails) {
  return Q.promise(function(resolve, reject) {

    sails.log.info("userAgreementDetails",userAgreementDetails);
	var version = userAgreementDetails.documentVersion;
	var documentName = userAgreementDetails.documentName.split(' ').join('');

	sails.log.info("documentName",documentName);

	userAgreementDetails.documentPath = 'document/'+documentName+'_v'+version;

    Agreement.create(userAgreementDetails)
      .then(function(userAgreement) {
        return resolve(userAgreement);
      })
      .catch(function(err) {
        return reject(err);
      });
  });
}

function findAgreement(key) {
  return Q.promise(function(resolve, reject) {
    Agreement
      .find({
        documentKey: key
      })
      .then(function(userAgreement) {
        return resolve(userAgreement);
      })
      .catch(function(err) {
        return reject(err);
      });
  });
}

function toApi() {
  var agreement = this.toObject();
  return {
    documentKey: agreement.documentKey,
    documentVersion: agreement.documentVersion,
    documentName: agreement.documentName,
    documentBody: agreement.documentBody
  };
}

function findOneAgreement(key) {
  return Q.promise(function(resolve, reject) {
    Agreement
      .findOne({
        documentKey: key
      })
      .then(function(agreement) {
        return resolve(agreement);
      })
      .catch(function(err) {
        return reject(err);
      });
  });
}

function getAgreement(key,user) {
  return Q.promise(function(resolve, reject) {
    Agreement
      .findOne({
        documentKey: key
      })
      .then(function(agreement) {
        // Story
        // .findOne({
        // user :user.id
        // })
        // .populateAll()
        // .then(function(storyDetail){

        var agreementObject = {
          deviceId : user.deviceId,
          user : user.name,
          date : moment.utc(new Date()).format(),
          agreement:agreement
        };
		console.log("documentKey: ",key);
        console.log("here is the date",agreementObject);
        return resolve(agreementObject);

      // })
      })
      .catch(function(err) {
        sails.log.error('Agreement#getAgreement :: err', err);
        return reject(err);
      });
  });
}


function getLoanAgreementDetail(key, user, pagename) {
  return Q.promise(function(resolve, reject) {

    Agreement
      .findOne({
        documentKey: key
      })
      .then(function(agreement) {
        // get the active loan for user
        Story
          .findOne({
            user: user.id,
			storytype: 'userloan',
			//isStoryApproved: true,
    		isDeleted: false,
          })
          .populateAll()
		  .sort("createdAt DESC")
          .then(function(storyDetail) {

			 var usercriteria = {
				  id: user.id,
				};

			 User
			.findOne(usercriteria)
			.populate('university')
			.populate('state')
			.populate('profilePicture')
			.then(function (userdata) {

				  var accountcriteria = {
							user: user.id,
							isDeleted: false
						};

				  Account
				  .findOne(accountcriteria)
				  .sort( { 'createdAt': -1 })
				  .then(function(accountDetail) {

						if(pagename=='acceptterms')
						{
							var financedAmount = storyDetail.requestedAmount;
							var loancriteria = { loanactivestatus: 1};
							var paymentSchedule=[];
							LoanSettings
							.find(loancriteria)
							.then(function(loansettigDetails) {

								if(loansettigDetails.length>0)
								{
										var counter = 1;
										totalLoanAmount = 0;
										checktotalLoanAmount = 0;
										interestAmount =0;
										principalAmount =0;
										interestRate =0;
										setloanTerm =0;
										loanTerm =0;
										loanApr =0;
										loanFundingFee =0;
										loanInterestRate =0;
										loanBalanceAvail =0;
										startBalanceAmount = storyDetail.requestedAmount;

										_.forEach(loansettigDetails, function(loansettigData) {

											if(setloanTerm==0)
											{
												if(financedAmount>loansettigData.minimumamount && financedAmount<= loansettigData.maximumamount )
												{

													 if(loansettigData.setallowedstates==1)
													 {
															loanTerm = loansettigData.loanterm;
															loanApr = loansettigData.loanapr;
															loanFundingFee = loansettigData.loanfundingfee;
															loanInterestRate = loansettigData.loaninterestrate;
															loanBalanceAvail = loansettigData.loanbalanceavail;
															setloanTerm =1;
													 }
													 else
													 {
															loanTerm = loansettigData.loanterm;
															loanApr = loansettigData.loanapr;
															loanFundingFee = loansettigData.loanfundingfee;
															loanInterestRate = loansettigData.loaninterestrate;
															loanBalanceAvail = loansettigData.loanbalanceavail;
															setloanTerm =1;
													 }
												}
											}
										});
									}

									if(setloanTerm==0)
									{
										loanTerm = feeManagement.loanTerm;
										loanApr = feeManagement.apr;
										loanFundingFee = feeManagement.fundingFeePercentage;
										loanInterestRate = feeManagement.interestRate;
										loanBalanceAvail = feeManagement.balanceAvail;
									}

									for (var i = 1; i <= loanTerm; i++) {

										//Added for checking exact loan amount
										if(loanInterestRate>0)
										{
											//Monthly payment = [ r + r / ( (1+r) ^ months -1) ] x principal loan amount
											var  decimalRate = (loanInterestRate/ 100) / loanApr;
											var xpowervalue = decimalRate + 1;
											var ypowervalue = loanTerm;
											var powerrate_value= Math.pow(xpowervalue,ypowervalue) - 1;
											scheduleLoanAmount = ( decimalRate + ( decimalRate / powerrate_value ) ) * financedAmount;
											scheduleLoanAmount = scheduleLoanAmount.toFixed(2);

											if(checktotalLoanAmount==0)
											{
												checktotalLoanAmount = storyDetail.approvedAmount +(scheduleLoanAmount*loanTerm);
											}

											//Calculate interest
											interestAmount = startBalanceAmount * decimalRate;

											//Calculate prinicpal amount
											principalAmount = scheduleLoanAmount - interestAmount;

											//Calculate new start balance amount
											showstartBalanceAmount = startBalanceAmount;
											startBalanceAmount = startBalanceAmount - principalAmount;
										}
										else
										{
											scheduleLoanAmount = Math.round((financedAmount / loanTerm) * 100) / 100;

											if(checktotalLoanAmount==0)
											{
												checktotalLoanAmount = financedAmount;
											}

											interestAmount   = 0;
											principalAmount = scheduleLoanAmount - interestAmount;
											showstartBalanceAmount = startBalanceAmount;
											startBalanceAmount = startBalanceAmount - principalAmount;
										}

										totalLoanAmount=totalLoanAmount+scheduleLoanAmount;
										if(i==loanTerm)
										{
											if(checktotalLoanAmount<totalLoanAmount)
											{
												deductLoanAmount = totalLoanAmount-checktotalLoanAmount;
												scheduleLoanAmount = scheduleLoanAmount - deductLoanAmount;
												scheduleLoanAmount = parseFloat(scheduleLoanAmount.toFixed(2));
											}

											if(checktotalLoanAmount>totalLoanAmount)
											{
												addLoanAmount = checktotalLoanAmount - totalLoanAmount;
												scheduleLoanAmount = scheduleLoanAmount + addLoanAmount;
												scheduleLoanAmount = parseFloat(scheduleLoanAmount.toFixed(2));
											}

											if(loanInterestRate>0)
											{
												if(principalAmount>showstartBalanceAmount)
												{
													showstartBalanceAmount =  principalAmount;
												}

												if(principalAmount<showstartBalanceAmount)
												{
													principalAmount =  showstartBalanceAmount;
												}
											}
											else
											{
													showstartBalanceAmount =  scheduleLoanAmount;
													principalAmount =  scheduleLoanAmount;
											}
										}

										showstartBalanceAmount  = parseFloat(showstartBalanceAmount.toFixed(2));
										principalAmount  = parseFloat(principalAmount.toFixed(2));
										interestAmount  = parseFloat(interestAmount.toFixed(2));

										paymentSchedule.push({
												startBalanceAmount: showstartBalanceAmount,
												principalAmount:principalAmount,
												interestAmount: interestAmount,
												amount: scheduleLoanAmount,
												//amount: checktotalLoanAmount,
												paidprincipalAmount:0,
												paidinterestAmount:0,
												//date: moment().startOf('day').add(counter, 'months').toDate(),
												date: moment().startOf('day').add(counter, 'months').format('LL'),
												transaction:storyDetail.user,
												status: 'OPENED'
										});

										counter++;
									}

									var amountProcessed;
									if(storyDetail.fluidCard){
									  amountProcessed = storyDetail.requestedAmount;
									}
									else{
									  //amountProcessed = storyDetail.requestedAmount - (storyDetail.requestedAmount * (feeManagement.fundingFeePercentage));
									  amountProcessed = storyDetail.requestedAmount - (storyDetail.requestedAmount * (loanFundingFee));
									}

									var annualPercentageRate =loanInterestRate;
									var maturityDate = moment().startOf('day').add(loanTerm, 'months');

									if(annualPercentageRate>0)
									{
										var annualPercentageRate = loanInterestRate;
										var  decimalRate = (annualPercentageRate / 100) / loanApr;
										var xpowervalue = decimalRate + 1;
										var ypowervalue = loanTerm;
										var powerrate_value= Math.pow(xpowervalue,ypowervalue) - 1;
										scheduleLoanAmount = ( decimalRate + ( decimalRate / powerrate_value ) ) * storyDetail.requestedAmount;
										scheduleLoanAmount = scheduleLoanAmount.toFixed(2);
										checktotalLoanAmount = scheduleLoanAmount*loanTerm;
										creditcost = checktotalLoanAmount-storyDetail.requestedAmount;
										creditcost =  parseFloat(creditcost.toFixed(2));
									}
									else
									{
										var creditcost =  0;
										creditcost =  parseFloat(creditcost.toFixed(2));
									}
									checktotalLoanAmount =  parseFloat(checktotalLoanAmount.toFixed(2));

									var obj = {
									  amount: storyDetail.requestedAmount,
									  address: storyDetail.user.addresses,
									  name: storyDetail.user.name,
									  date: storyDetail.updatedAt,
									  interestRate: feeManagement.interestRate,
									  month: loanTerm,
									  agreement: agreement,
									  createdDate: moment(storyDetail.createdAt).format(),
									  endDate: moment(storyDetail.createdAt).add(loanTerm,'months').format(),
									  signedDate: new Date(),
									  paymentschedule:paymentSchedule,
									  schedulecount:paymentSchedule.length,
									  annualPercentageRate: annualPercentageRate,
									  loannumber:'--',
									  checktotalLoanAmount:checktotalLoanAmount,
									  creditcost:creditcost,
									  street: storyDetail.user.street,
									  stateName:userdata.state.name,
									  stateCode:userdata.state.stateCode,
									  city:storyDetail.user.city,
									  zipCode:storyDetail.user.zipCode,
									  accountDetail: accountDetail
									};
									sails.log.info("loan objdata",obj);
									return resolve(obj);

							})
							.catch(function (err) {
								 sails.log.error("getTilaAgreementDetail::error", err);
								 return reject(err);
							});


						}
						else
						{
							var options = {	story: storyDetail.id };
							PaymentManagement.findOne(options)
							.then(function(paymentmanagementdata){

									var amountProcessed;
									if(storyDetail.fluidCard){
									  amountProcessed = storyDetail.requestedAmount;
									}
									else{

									  if(paymentmanagementdata.fundingfee)
									  {
										amountProcessed = storyDetail.requestedAmount - (storyDetail.requestedAmount * (paymentmanagementdata.fundingfee));
									  }
									  else
									  {
										  amountProcessed = storyDetail.requestedAmount - (storyDetail.requestedAmount * (feeManagement.fundingFeePercentage));
									  }
									}

									var annualPercentageRate =0;
									var checktotalLoanAmount = 0;
									var creditcost = 0;

									if(paymentmanagementdata.apr)
									{
										loanApr = paymentmanagementdata.apr;
									}
									else
									{
										loanApr = feeManagement.sixmonthapr
									}

									if(paymentmanagementdata.loantermcount)
									{
										loantermcount = paymentmanagementdata.loantermcount;
									}
									else
									{
										loantermcount = feeManagement.sixmonthTerm
									}

									if ("undefined" !== typeof paymentmanagementdata.interestapplied && paymentmanagementdata.interestapplied!='' && paymentmanagementdata.interestapplied!=null)
									{
										var annualPercentageRate = paymentmanagementdata.interestapplied;
										var  loanTerm = loantermcount;

										if(annualPercentageRate>0)
										{
											var  decimalRate = (annualPercentageRate / 100) / loanApr;
											var xpowervalue = decimalRate + 1;
											var ypowervalue = loantermcount;
											var powerrate_value= Math.pow(xpowervalue,ypowervalue) - 1;
											scheduleLoanAmount = ( decimalRate + ( decimalRate / powerrate_value ) ) * storyDetail.requestedAmount;
											scheduleLoanAmount = scheduleLoanAmount.toFixed(2);
											checktotalLoanAmount = scheduleLoanAmount*loanTerm;
											creditcost = checktotalLoanAmount-storyDetail.requestedAmount;
											creditcost =  parseFloat(creditcost.toFixed(2));
										}
										else
										{
											checktotalLoanAmount = storyDetail.requestedAmount;
										}
									}
									else
									{
										var  loanTerm = feeManagement.loanTerm;
										checktotalLoanAmount = storyDetail.requestedAmount;
									}

									if(annualPercentageRate>0)
									{
										var  financedAmount = paymentmanagementdata.amount;
										var  scheduleLoanAmount = Math.round((financedAmount / loanTerm) * 100) / 100;
										var  scheduleLoanAmount = parseFloat(scheduleLoanAmount.toFixed(2));

										 _.forEach(paymentmanagementdata.paymentSchedule, function(scheduler) {
											  scheduler.amount = 	scheduleLoanAmount;
											  scheduler.date = moment(scheduler.date).startOf('day').format('LL');
										 });
									}
									else
									{
										var  financedAmount = storyDetail.requestedAmount;

										var  scheduleLoanAmount = Math.round((financedAmount / loanTerm) * 100) / 100;
										var  scheduleLoanAmount = parseFloat(scheduleLoanAmount.toFixed(2));

										var addLoanAmount =0;
										var deductLoanAmount=0;
										var totalLoanAmount= 0
										var loopcounter =1;
										var paymentScheduleTerm =paymentmanagementdata.paymentSchedule.length;
										_.forEach(paymentmanagementdata.paymentSchedule, function(scheduler) {
											  totalLoanAmount=totalLoanAmount+scheduleLoanAmount;

											  if(paymentScheduleTerm==loopcounter)
											  {
													if(totalLoanAmount>financedAmount)
													{
														deductLoanAmount = totalLoanAmount-checktotalLoanAmount;
														scheduleLoanAmount = scheduleLoanAmount - deductLoanAmount;
														scheduleLoanAmount = parseFloat(scheduleLoanAmount.toFixed(2));
													}

													if(totalLoanAmount<financedAmount)
													{
														addLoanAmount = financedAmount - totalLoanAmount;
														scheduleLoanAmount = scheduleLoanAmount + addLoanAmount;
														scheduleLoanAmount = parseFloat(scheduleLoanAmount.toFixed(2));
													}

													scheduler.amount = 	scheduleLoanAmount;
											  }
											  else
											  {
												 scheduler.amount = 	scheduleLoanAmount;
											  }
											  scheduler.date = moment(scheduler.date).startOf('day').format('LL');
											  loopcounter++;
										 });
									}

									checktotalLoanAmount =  parseFloat(checktotalLoanAmount.toFixed(2));

									var obj = {
									  amount: storyDetail.requestedAmount,
									  address: storyDetail.user.addresses,
									  name: storyDetail.user.name,
									  date: storyDetail.updatedAt,
									  interestRate: feeManagement.interestRate,
									  month: loanTerm,
									  agreement: agreement,
									  createdDate: moment(storyDetail.createdAt).format(),
									  endDate: moment(storyDetail.createdAt).add(loanTerm,'months').format(),
									  signedDate: new Date(),
									  paymentschedule:paymentmanagementdata.paymentSchedule,
									  schedulecount:paymentmanagementdata.paymentSchedule.length,
									  annualPercentageRate: annualPercentageRate,
									  loannumber:paymentmanagementdata.loanReference,
									  checktotalLoanAmount:checktotalLoanAmount,
									  creditcost:creditcost,
									  street: storyDetail.user.street,
									  stateName:userdata.state.name,
									  stateCode:userdata.state.stateCode,
									  city:storyDetail.user.city,
									  zipCode:storyDetail.user.zipCode,
									  accountDetail: accountDetail
									};
									return resolve(obj);

							   })
								.catch(function (err) {
									 sails.log.error("getTilaAgreementDetail::error", err);
									 return reject(err);
								});
						   }
					})
				})
          })
      })
      .catch(function(err) {
        sails.log.error('Agreement#getAgreement :: err', err);
        return reject(err);
      });
  })
}


function getTilaAgreementDetail(key, user, pagename) {
  return Q.promise(function(resolve, reject) {
    Agreement
      .findOne({
        documentKey: key
      })
      .then(function(agreement) {
        Story
          .findOne({
            user: user.id,
			storytype: 'userloan',
			//isStoryApproved: true,
    		isDeleted: false,
          })
          .populateAll()
		  .sort("createdAt DESC")
          .then(function(storyDetail) {

				var usercriteria = {
				  id: user.id,
				};

				User
				.findOne(usercriteria)
				.populate('university')
				.populate('state')
				.populate('profilePicture')
				.then(function (userdata) {

					if(pagename=='acceptterms')
					{
						var financedAmount = storyDetail.requestedAmount;
						var loancriteria = { loanactivestatus: 1};
						var paymentSchedule=[];
						LoanSettings
						.find(loancriteria)
						.then(function(loansettigDetails) {

							 if(loansettigDetails.length>0)
							{
									var counter = 1;
									totalLoanAmount = 0;
									checktotalLoanAmount = 0;
									interestAmount =0;
									principalAmount =0;
									interestRate =0;
									setloanTerm =0;
									loanTerm =0;
									loanApr =0;
									loanFundingFee =0;
									loanInterestRate =0;
									loanBalanceAvail =0;
									startBalanceAmount = storyDetail.requestedAmount;

									_.forEach(loansettigDetails, function(loansettigData) {

										if(setloanTerm==0)
										{
											if(financedAmount>loansettigData.minimumamount && financedAmount<= loansettigData.maximumamount )
											{

												 if(loansettigData.setallowedstates==1)
												 {
														loanTerm = loansettigData.loanterm;
														loanApr = loansettigData.loanapr;
														loanFundingFee = loansettigData.loanfundingfee;
														loanInterestRate = loansettigData.loaninterestrate;
														loanBalanceAvail = loansettigData.loanbalanceavail;
														setloanTerm =1;
												 }
												 else
												 {
														loanTerm = loansettigData.loanterm;
														loanApr = loansettigData.loanapr;
														loanFundingFee = loansettigData.loanfundingfee;
														loanInterestRate = loansettigData.loaninterestrate;
														loanBalanceAvail = loansettigData.loanbalanceavail;
														setloanTerm =1;
												 }
											}
										}
									});
								}

								if(setloanTerm==0)
								{
									loanTerm = feeManagement.loanTerm;
									loanApr = feeManagement.apr;
									loanFundingFee = feeManagement.fundingFeePercentage;
									loanInterestRate = feeManagement.interestRate;
									loanBalanceAvail = feeManagement.balanceAvail;
								}

								for (var i = 1; i <= loanTerm; i++) {

									//Added for checking exact loan amount
									if(loanInterestRate>0)
									{
										//Monthly payment = [ r + r / ( (1+r) ^ months -1) ] x principal loan amount
										var  decimalRate = (loanInterestRate/ 100) / loanApr;
										var xpowervalue = decimalRate + 1;
										var ypowervalue = loanTerm;
										var powerrate_value= Math.pow(xpowervalue,ypowervalue) - 1;
										scheduleLoanAmount = ( decimalRate + ( decimalRate / powerrate_value ) ) * financedAmount;
										scheduleLoanAmount = scheduleLoanAmount.toFixed(2);

										if(checktotalLoanAmount==0)
										{
											checktotalLoanAmount = storyDetail.approvedAmount +(scheduleLoanAmount*loanTerm);
										}

										//Calculate interest
										interestAmount = startBalanceAmount * decimalRate;

										//Calculate prinicpal amount
										principalAmount = scheduleLoanAmount - interestAmount;

										//Calculate new start balance amount
										showstartBalanceAmount = startBalanceAmount;
										startBalanceAmount = startBalanceAmount - principalAmount;
									}
									else
									{
										scheduleLoanAmount = Math.round((financedAmount / loanTerm) * 100) / 100;

										if(checktotalLoanAmount==0)
										{
											checktotalLoanAmount = financedAmount;
										}

										interestAmount   = 0;
										principalAmount = scheduleLoanAmount - interestAmount;
										showstartBalanceAmount = startBalanceAmount;
										startBalanceAmount = startBalanceAmount - principalAmount;
									}

									totalLoanAmount=totalLoanAmount+scheduleLoanAmount;
									if(i==loanTerm)
									{
										if(checktotalLoanAmount<totalLoanAmount)
										{
											deductLoanAmount = totalLoanAmount-checktotalLoanAmount;
											scheduleLoanAmount = scheduleLoanAmount - deductLoanAmount;
											scheduleLoanAmount = parseFloat(scheduleLoanAmount.toFixed(2));
										}

										if(checktotalLoanAmount>totalLoanAmount)
										{
											addLoanAmount = checktotalLoanAmount - totalLoanAmount;
											scheduleLoanAmount = scheduleLoanAmount + addLoanAmount;
											scheduleLoanAmount = parseFloat(scheduleLoanAmount.toFixed(2));
										}

										if(loanInterestRate>0)
										{
											if(principalAmount>showstartBalanceAmount)
											{
												showstartBalanceAmount =  principalAmount;
											}

											if(principalAmount<showstartBalanceAmount)
											{
												principalAmount =  showstartBalanceAmount;
											}
										}
										else
										{
												showstartBalanceAmount =  scheduleLoanAmount;
												principalAmount =  scheduleLoanAmount;
										}
									}

										showstartBalanceAmount  = parseFloat(showstartBalanceAmount.toFixed(2));
										principalAmount  = parseFloat(principalAmount.toFixed(2));
										interestAmount  = parseFloat(interestAmount.toFixed(2));

											paymentSchedule.push({
													startBalanceAmount: showstartBalanceAmount,
													principalAmount:principalAmount,
													interestAmount: interestAmount,
													amount: scheduleLoanAmount,
													//amount: checktotalLoanAmount,
													paidprincipalAmount:0,
													paidinterestAmount:0,
													//date: moment().startOf('day').add(counter, 'months').toDate(),
													date: moment().startOf('day').add(counter, 'months').format('LL'),
													transaction:storyDetail.user,
													status: 'OPENED'
											});

											counter++;
								}

								var amountProcessed;
								if(storyDetail.fluidCard){
								  amountProcessed = storyDetail.requestedAmount;
								}
								else{
								  amountProcessed = storyDetail.requestedAmount - (storyDetail.requestedAmount * (feeManagement.fundingFeePercentage));
								}

								var annualPercentageRate =loanInterestRate;
								var maturityDate = moment().startOf('day').add(loanTerm, 'months');

								if(annualPercentageRate>0)
								{
									var  decimalRate = (annualPercentageRate / 100) / loanApr;
									var xpowervalue = decimalRate + 1;
									var ypowervalue = loanTerm;
									var powerrate_value= Math.pow(xpowervalue,ypowervalue) - 1;
									scheduleLoanAmount = ( decimalRate + ( decimalRate / powerrate_value ) ) * storyDetail.requestedAmount;
									scheduleLoanAmount = scheduleLoanAmount.toFixed(2);
									checktotalLoanAmount = scheduleLoanAmount*loanTerm;
									checktotalLoanAmount =  parseFloat(checktotalLoanAmount.toFixed(2));
									creditcost = checktotalLoanAmount-storyDetail.requestedAmount;
									creditcost =  parseFloat(creditcost.toFixed(2));
								}
								else
								{
									var  creditcost =0;
									creditcost =  parseFloat(creditcost.toFixed(2));
									checktotalLoanAmount =  parseFloat(checktotalLoanAmount.toFixed(2));
								}

								var obj = {
								  annualPercentageRate: annualPercentageRate,
								  amount: storyDetail.requestedAmount,
								  financeCharged: feeManagement.fundingFeePercentage,
								  agreement: agreement,
								  address: storyDetail.user.addresses,
								  name: storyDetail.user.name,
								  maturityDate:moment(storyDetail.createdAt).add(loanTerm,'months').format('LLL'),
								  amountProcessed:amountProcessed,
								  EmiAmount :Math.round((storyDetail.requestedAmount)/(loanTerm)* 100) / 100,
								  firstEmiDate: moment(storyDetail.createdAt).add(1,'months').format('LLL'),
								  secondEmiDate: moment(storyDetail.createdAt).add(2,'months').format('LLL'),
								  date: new Date(),
								  paymentschedule:paymentSchedule,
								  schedulecount:paymentSchedule.length,
								  checktotalLoanAmount:checktotalLoanAmount,
								  creditcost:creditcost,
								  street: storyDetail.user.street,
								  stateName:userdata.state.name,
								  stateCode:userdata.state.stateCode,
								  city:storyDetail.user.city,
								  zipCode:storyDetail.user.zipCode
								};
								sails.log.info("tila objdata :", obj);
								return resolve(obj);

						})
						.catch(function (err) {
							 sails.log.error("getTilaAgreementDetail::error", err);
							 return reject(err);
						});


					 }
					 else
					 {

						var options = {	story: storyDetail.id };

						PaymentManagement.findOne(options)
						.then(function(paymentmanagementdata){

								var amountProcessed;
								if(storyDetail.fluidCard){
								  amountProcessed = storyDetail.requestedAmount;
								}
								else{
								  //amountProcessed = storyDetail.requestedAmount - (storyDetail.requestedAmount * (feeManagement.fundingFeePercentage));
								  if(paymentmanagementdata.fundingfee)
								  {
									amountProcessed = storyDetail.requestedAmount - (storyDetail.requestedAmount * (paymentmanagementdata.fundingfee));
								  }
								  else
								  {
									  amountProcessed = storyDetail.requestedAmount - (storyDetail.requestedAmount * (feeManagement.fundingFeePercentage));
								  }
								}

								if(paymentmanagementdata.fundingfee)
								{
									 var financeCharged = paymentmanagementdata.fundingfee;
								}
								else
								{
									var financeCharged = feeManagement.fundingFeePercentage;
								}

								var annualPercentageRate =0;
								if ("undefined" !== typeof paymentmanagementdata.interestapplied && paymentmanagementdata.interestapplied!='' && paymentmanagementdata.interestapplied!=null)
								{
									var annualPercentageRate = paymentmanagementdata.interestapplied;
									//var  loanTerm = feeManagement.sixmonthTerm;
									if(paymentmanagementdata.loantermcount)
									{
										loanTerm = paymentmanagementdata.loantermcount;
									}
									else
									{
										loanTerm = feeManagement.sixmonthTerm
									}
								}
								else
								{
									var  loanTerm = feeManagement.loanTerm;
								}


								if(annualPercentageRate>0)
								{
									var  financedAmount = paymentmanagementdata.amount;
									var checktotalLoanAmount =  paymentmanagementdata.amount;

									creditcost = checktotalLoanAmount-storyDetail.requestedAmount;
									creditcost =  parseFloat(creditcost.toFixed(2));

									var  scheduleLoanAmount = Math.round((financedAmount / loanTerm) * 100) / 100;
									var  scheduleLoanAmount = parseFloat(scheduleLoanAmount.toFixed(2));

									 _.forEach(paymentmanagementdata.paymentSchedule, function(scheduler) {
										  scheduler.amount = 	scheduleLoanAmount;
										  scheduler.date = moment(scheduler.date).startOf('day').format('LL');
									 });
								}
								else
								{
									var creditcost =0;
									var addLoanAmount =0;
									var deductLoanAmount=0;
									var checktotalLoanAmount =  storyDetail.requestedAmount;
									var  financedAmount = storyDetail.requestedAmount;

									var  scheduleLoanAmount = Math.round((financedAmount / loanTerm) * 100) / 100;
									var  scheduleLoanAmount = parseFloat(scheduleLoanAmount.toFixed(2));

									var totalLoanAmount= 0
									var loopcounter =1;
									var paymentScheduleTerm =paymentmanagementdata.paymentSchedule.length;
									_.forEach(paymentmanagementdata.paymentSchedule, function(scheduler) {
										  totalLoanAmount=totalLoanAmount+scheduleLoanAmount;

										  if(paymentScheduleTerm==loopcounter)
										  {
												if(totalLoanAmount>financedAmount)
												{
													deductLoanAmount = totalLoanAmount-checktotalLoanAmount;
													scheduleLoanAmount = scheduleLoanAmount - deductLoanAmount;
													scheduleLoanAmount = parseFloat(scheduleLoanAmount.toFixed(2));
												}

												if(totalLoanAmount<financedAmount)
												{
													addLoanAmount = financedAmount - totalLoanAmount;
													scheduleLoanAmount = scheduleLoanAmount + addLoanAmount;
													scheduleLoanAmount = parseFloat(scheduleLoanAmount.toFixed(2));
												}

												scheduler.amount = 	scheduleLoanAmount;
										  }
										  else
										  {
											 scheduler.amount = 	scheduleLoanAmount;
										  }
										  scheduler.date = moment(scheduler.date).startOf('day').format('LL');
										  loopcounter++;
									 });
								}

								checktotalLoanAmount =  parseFloat(checktotalLoanAmount.toFixed(2));

								var obj = {
								  annualPercentageRate: annualPercentageRate,
								  amount: storyDetail.requestedAmount,
								  //financeCharged: feeManagement.fundingFeePercentage,
								  financeCharged: financeCharged,
								  agreement: agreement,
								  address: storyDetail.user.addresses,
								  name: storyDetail.user.name,
								  maturityDate:moment(paymentmanagementdata.maturityDate).format('LLL'),
								  amountProcessed:amountProcessed,
								  EmiAmount :Math.round((storyDetail.requestedAmount)/(loanTerm)* 100) / 100,
								  firstEmiDate: moment(storyDetail.createdAt).add(1,'months').format('LLL'),
								  secondEmiDate: moment(storyDetail.createdAt).add(2,'months').format('LLL'),
								  date: new Date(),
								  paymentschedule:paymentmanagementdata.paymentSchedule,
								  schedulecount:paymentmanagementdata.paymentSchedule.length,
								  checktotalLoanAmount:checktotalLoanAmount,
								  creditcost:creditcost,
								  street: storyDetail.user.street,
								  stateName:userdata.state.name,
								  stateCode:userdata.state.stateCode,
								  city:storyDetail.user.city,
								  zipCode:storyDetail.user.zipCode
								};
								sails.log.info("objdata :", obj);
								return resolve(obj);

							})
							.catch(function (err) {
								 sails.log.error("getTilaAgreementDetail::error", err);
								 return reject(err);
							});

						}
				})

		   })

      })
      .catch(function(err) {
        sails.log.error("getTilaAgreementDetail::error", err);
        return reject(err);
      })
  })
}

function updateAgreementDetails(data) {
  return Q.promise(function(resolve, reject) {
    var criteria = {
      id: data.id
    };
	sails.log.info("criteria",criteria);
    Agreement
      .findOne(criteria)
      .then(function(agreement) {

		sails.log.info("agreement",agreement);
        agreement.documentName = data.documentName;
        agreement.documentKey = data.documentKey;
        agreement.documentVersion = data.documentVersion;
        agreement.documentBody = data.documentBody;
        var version = data.documentVersion;
        agreement.documentPath = 'document/'+data.documentName+'_v'+version;
        agreement.save(function(err) {

		  sails.log.info("agreement updated",agreement);
          if (err) {
            sails.log.error("Agreement#updateAgreementDetails :: Error :: ", err);

            return reject({
              code: 500,
              message: 'INTERNAL_SERVER_ERROR'
            });
          }
        });
        return resolve(agreement);
      })
      .catch(function(err) {
        sails.log.error("Agreement#updateAgreementDetails :: Updating agreement error :: ", err);

        return reject(err);
      });
  });
}

function deleteAgreement(id) {
  return Q.promise(function(resolve, reject) {
    if (!id) {
      sails.log.error('Agreement#deleteAgreement :: Agreement id null ');

      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
    var criteria = {
      id: id,
      active: true
    };
    Agreement
      .findOne(criteria)
      .then(function(agreement) {
        agreement.active = false;
        agreement.save(function(err) {
          if (err) {
            sails.log.error("Agreement#deleteAgreement :: Error in saving agreement :: ", err);

            return reject({
              code: 500,
              message: 'INTERNAL_SERVER_ERROR'
            });
          }
          return resolve(agreement);
        })
      })
      .catch(function(err) {
        sails.log.error("Agreement#deleteAgreement :: Error :: ", err);

        return reject(err);
      });
  });
}


function getAdverseAgreement(user, key, message,getBaseUrl) {
  return Q.promise(function(resolve, reject) {
    Agreement
      .findOne({
        documentKey: key
      })
      .then(function(agreement) {
        Story
          .findOne({
            user: user.id
          })
          .populateAll()
          .then(function(storyDetail) {
            var obj = {
              name: storyDetail.user.name,
              address: storyDetail.user.addresses,
              message: message,
              agreement: agreement
            }
            return resolve(obj)
          })


      })
      .catch(function(err) {
        sails.log.error("Agreement#deleteAgreement :: Error :: ", err);

        return reject(err);
      });

  })
}



function generateModifiedLoanOffer(loandetails,financedAmount,changeterm,changerate,userdetails){

	return Q.promise(function(resolve, reject) {

			var screendetails = loandetails.screentracking;

			var incomeamount = loandetails.screentracking.incomeamount;

			var baseltiInterest = changerate;
			var baseLoanAmountCal = financedAmount;
			var financedAmount = financedAmount;
			var loanTerm = changeterm;
			var interestRate = changerate;
			var paymentFeq = sails.config.loan.paymentFeq;
			var APR = (interestRate * sails.config.loan.APR);
			var monthlySchedulePayment = 0;
			var baseLoanAmountCon = 0;

			if(baseLoanAmountCal > 1200){
					baseLoanAmountCon = 1200;
			}else{
				baseLoanAmountCon = baseLoanAmountCal;
			}

			var baseLoanAmount = 50 * (Math.floor(baseLoanAmountCon/50));
			var ir= (interestRate/100).toFixed(2);
			var loanPaymentCycle = Math.abs(PaymentManagementService.calculatePMT(parseFloat(ir), parseFloat(loanTerm), parseFloat(financedAmount)));

			var monthlyPayment = Math.abs((loanPaymentCycle*26/12).toFixed(2));
			var perTotMonthlyPayment = Math.round(monthlySchedulePayment); //get from paymentmangement
			var postTotMonthlyPayment = Math.round(parseFloat(monthlyPayment) + parseFloat(perTotMonthlyPayment));

			var preDTI = ((perTotMonthlyPayment / incomeamount) * 100).toFixed(2);
			var postDTI = (((parseFloat(perTotMonthlyPayment) + parseFloat(monthlyPayment))/incomeamount) * 100).toFixed(2);

			var postDTIThreshold = 60;

			if(postDTI < postDTIThreshold){
				var loanstatus = "Approved";
				Screentracking.update({id: loandetails.screentracking.id,iscompleted : 0}, {loanstatus: loanstatus, loandescription:'Approved Income'})
				.exec(function afterwards(err, updated){
				});
			}else{
				var loanstatus = "Denied";
				Screentracking.update({id: loandetails.screentracking.id,iscompleted : 0}, {loanstatus: loanstatus, loandescription:'postDTIThreshold Greater than 60'})
				.exec(function afterwards(err, updated){

				});
			}

			 var firstname = userdetails.firstname;

			var responseValue = {incomeamount:incomeamount,state:state,loanTerm:loanTerm,paymentFeq:paymentFeq,interestRate:interestRate,financedAmount:financedAmount,apr:APR,loanPaymentCycle:loanPaymentCycle,monthlyPayment:monthlyPayment,perTotMonthlyPayment:perTotMonthlyPayment,postTotMonthlyPayment:postTotMonthlyPayment,preDTI:preDTI,postDTI:postDTI,postDTIThreshold:postDTIThreshold,loanstatus:loanstatus,firstname:firstname};

			var newResponseValue = {fullData:responseValue,fullDataString:JSON.stringify(responseValue)};

			sails.log.info('responseValue : ', responseValue);
			sails.log.info('formatedate : ', formatedate);

			return resolve(newResponseValue);

	});
}






