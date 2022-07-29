/**
 * PaymentManagement.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var config = sails.config,
  Q = require('q'),
  moment = require('moment'),
  _ = require('lodash'),
  shortid = require('shortid'),
  feeManagement = config.feeManagement;
var momentBusiness = require('moment-business-days');


module.exports = {

  attributes: {
	practicemanagement: {
      model: 'PracticeManagement'
    },
    story: {
      model: 'Story'
    },
    account: {
      model: 'Account'
    },
    user: {
      model: 'User'
    },
    fundingSourceType: {
      type: 'string'
    },
    balance: {
      type: 'float'
    },
    /*transaction: {
      model: 'Transaction'
    },*/
    paymentSchedule: {
      type: 'array'
    },
    nextPaymentSchedule: {
      type: 'date'
    },
    maturityDate: {
      type: 'date'
    },
    status: {
      type: 'string',
      defaultsTo: 'OPENED'
    },
    amount: {
      type: 'float'
    },
    interestapplied: {
      type: 'float',
      defaultsTo: 0
    },
	loantermcount: {
      type: 'integer',
      defaultsTo: 0
    },
	apr: {
      type: 'float',
      defaultsTo: 0
    },
	fundingfee: {
      type: 'float',
      defaultsTo: 0
    },
	balanceavailcheck: {
      type: 'integer',
      defaultsTo: 0
    },
    logs: {
      type: 'array',
      defaultsTo: []
    },
    date: {
      type: 'date'
    },
    payOffAmount: {
      type: 'float'
    },
    manualPayment: {
      type: 'array',
      defaultsTo: []
    },
    isPaymentActive: {
      type: 'boolean',
      defaultsTo: 'true'
    },
	achstatus: {
      type: 'integer',
      defaultsTo: 1
    },
	loanReference: {
      type: "string",
      defaultsTo: shortid.generate
    },
	deniedfromapp: {
      type: 'integer',
      defaultsTo: 0
    },
	changebankToken: {
      type: 'string'
    },
	changebankinfo: {
      type: 'array',
      defaultsTo: []
    },
	transferstatus: {
      type: 'integer',
      defaultsTo: 0
    },
	transfertransactionid: {
      type: 'string'
    },
	usertransferstatus: {
      type: 'integer',
      defaultsTo: 0
    },
	usertransactions: {
      type: 'array',
      defaultsTo: []
    },
	failedtranscount: {
      type: 'integer',
      defaultsTo: 0
    },
	failedtransactions: {
      type: 'array',
      defaultsTo: []
    },
	blockmakepayment: {
      type: 'integer',
      defaultsTo: 0
    },
	loanappversion:{
	  type: 'string',
      defaultsTo: sails.config.appManagement.appVersion
	},
	loaniosversion:{
	  type: 'string',
      defaultsTo: sails.config.appManagement.appVersion
	},
	blockachcredit: {
      type: 'integer',
      defaultsTo: 0
    },
	eligiblereapply: {
      type: 'integer',
      defaultsTo: 0
    },
	declineemail: {
      type: 'string',
      defaultsTo: ''
    },
	declinereason: {
      type: 'string',
      defaultsTo: ''
    },
	failedcreditcount: {
      type: 'integer',
      defaultsTo: 0
    },
	failedcredittransactions: {
      type: 'array',
      defaultsTo: []
    },
	creditScore: {
      type: 'string',
      defaultsTo: ''
    },
	/*product: {
      model: 'Productlist'
    },*/
	screentracking: {
      model: 'Screentracking'
    },
    localcreditfilepath: {
      type: 'string'
    },
	potentialdefaultexist: {
      type: 'integer',
      defaultsTo: 0
    },
	defaultuserexist: {
      type: 'integer',
      defaultsTo: 0
    },
	actumcreditSettledStatus: {
      type: 'integer',
      defaultsTo: 0
    },
    loanStartdate: {
      type: 'date'
    },
	loanSettledDate: {
      type: 'date'
    },
	loanApprovedDate: {
      type: 'date'
    },
	loanSetdate: {
      type: 'date'
    },
	linkedstaff: {
      type: 'array',
      defaultsTo: []
    },
	linkeddoctor: {
      type: 'array',
      defaultsTo: []
    },
	doctorfailedcreditcount: {
      type: 'integer',
      defaultsTo: 0
    },
	doctorcredittransactions: {
      type: 'array',
      defaultsTo: []
    },
	moveToOpen:{
      type: 'integer'
    },
	appverified: {
      type: 'integer',
      defaultsTo: 0
    },
	moveToArchive: {
      type: 'integer'
    },
	firstpaymentcompleted: {
      type: 'integer',
      defaultsTo: 0
    },
	  procedureWasConfirmed: {
		  type: "integer",
		  enum: [0,1],
		  defaultsTo: 0
	  },
	  procedureConfirmedDate: {
		  type: "date"
	  },
	  hasFirstAssociatesBeenUploaded: {
		  type: "integer",
		  enum: [0,1],
		  defaultsTo: 0
	  }
	/*consolidateaccount: {
      model: 'Consolidateaccount'
    },*/
  },
  createPaymentSchedule: createPaymentSchedule,
  updatePaymentSchedule: updatePaymentSchedule,
  updateForMakePaymentDetail: updateForMakePaymentDetail,
  // updateBalance: updateBalance
  updateStatus: updateStatus,
  updateUserStatus: updateUserStatus,
  getAllLateFeeManagement: getAllLateFeeManagement,
  getPaymentActivityDetail: getPaymentActivityDetail,
  getAllPendingAchList: getAllPendingAchList,
  updateUserTransactionStatus: updateUserTransactionStatus,
  updatefailureTransactionStatus: updatefailureTransactionStatus,
  updateForMakeFullPaymentDetail: updateForMakeFullPaymentDetail,
  updateForMakeUserPaymentDetail: updateForMakeUserPaymentDetail,
    // getAllLatePayment: getAllLatePayment
    // updatePaymentAmount: updatePaymentAmount

  createLoanPaymentSchedule: createLoanPaymentSchedule,
  getLoanPaymentSchedule:getLoanPaymentSchedule,
  biweeklyCalculate: biweeklyCalculate,
  biweeklyScheduleValues: biweeklyScheduleValues,
  generateNewSchedule:generateNewScheduleAction,
  userAccountInfoDetail: userAccountInfoDetail,
  adminrepullpayment: adminrepullpayment,
  monthlyScheduleCalculate:monthlyScheduleCalculate,
  loopPaidoffSchedule:loopPaidoffScheduleAction,
  loopFinalPayNextSchedule:loopFinalPayNextSchedule,
};

function createPaymentSchedule(story,loanappversion,loaniosversion) {
  var deferred = Q.defer();
  var criteria = {
    story: story.id
  };
  Story
    .findOne({
      id: story.id
    })
    .then(function(story) {

	  //TODO: NEED TO UNCOMMENT BELOW CODE TO MAKE ACH LIVE
      /*Transaction
        .findOne(criteria)
        .then(function(transactionDetail) {*/

			/*interestRate =0;
			if(story.approvedAmount>500)
			{
				feeManagement.loanTerm = feeManagement.sixmonthTerm;
				interestRate = feeManagement.sixmonthinterestRate;
			}*/

			var paymentSchedule = [];
			var counter = 1;
			var datecounter = 0;
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
			startBalanceAmount = story.approvedAmount;

			var totalprincipalAmount = 0
			var diffLoanAmount = 0;

			var loancriteria = {
						loanactivestatus: 1,
	 		};

			LoanSettings
			.find(loancriteria)
			.then(function(loansettigDetails) {

					//sails.log.info("loansettigDetails length:",loansettigDetails.length);
					//sails.log.info("loansettigDetails:",loansettigDetails);

					if(loansettigDetails.length>0)
					{
						_.forEach(loansettigDetails, function(loansettigData) {

							//sails.log.info("loop setloanTerm: ",setloanTerm);

							if(setloanTerm==0)
							{
								/*sails.log.info("startBalanceAmount: ",startBalanceAmount);
								sails.log.info("loansettigData.minimumamount: ",loansettigData.minimumamount);
								sails.log.info("loansettigData.maximumamount: ",loansettigData.maximumamount);
								sails.log.info("loansettigData.setallowedstates: ",loansettigData.setallowedstates);*/

								if(startBalanceAmount>loansettigData.minimumamount && startBalanceAmount<= loansettigData.maximumamount )
								{
									 //sails.log.info("Enter loop: ");

									 if(loansettigData.setallowedstates==1)
									 {
											//sails.log.info("Enter if loop: ");

											loanTerm = loansettigData.loanterm;
											loanApr = loansettigData.loanapr;
											loanFundingFee = loansettigData.loanfundingfee;
											loanInterestRate = loansettigData.loaninterestrate;
											loanBalanceAvail = loansettigData.loanbalanceavail;
											setloanTerm =1;
									 }
									 else
									 {
											//sails.log.info("Enter else loop: ");
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

					//sails.log.info("final setloanTerm: ",setloanTerm);
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
							scheduleLoanAmount = ( decimalRate + ( decimalRate / powerrate_value ) ) * story.approvedAmount;
							//scheduleLoanAmount = Math.round(scheduleLoanAmount);
							scheduleLoanAmount = scheduleLoanAmount.toFixed(2);
							scheduleLoanAmount = parseFloat(scheduleLoanAmount)

							if(checktotalLoanAmount==0)
							{
								//checktotalLoanAmount = story.approvedAmount +(scheduleLoanAmount*loanTerm);
								checktotalLoanAmount =scheduleLoanAmount*loanTerm;
							}

							//Calculate interest
							interestAmount = startBalanceAmount * decimalRate;
							//interestAmount  = interestAmount.toFixed(2);

							//Calculate prinicpal amount
							principalAmount = scheduleLoanAmount - interestAmount;
							//principalAmount  = principalAmount.toFixed(2);

							//Calculate new start balance amount
							showstartBalanceAmount = startBalanceAmount;
							startBalanceAmount = startBalanceAmount - principalAmount;
							//startBalanceAmount  = startBalanceAmount.toFixed(2);

							/*sails.log.info("startBalanceAmount: ",startBalanceAmount);
							sails.log.info("principalAmount: ",principalAmount);

							totalprincipalAmount = totalprincipalAmount+principalAmount;
							totalprincipalAmount = parseFloat(totalprincipalAmount.toFixed(4));

							sails.log.info("totalprincipalAmount: ",totalprincipalAmount);
							sails.log.info("=============================================== ");

							if(i==loanTerm)
							{
								sails.log.info("story approvedAmount: ",story.approvedAmount);
								sails.log.info("last totalprincipalAmount: ",totalprincipalAmount);

								if(totalprincipalAmount>story.approvedAmount)
								{
									sails.log.info("Enter first loop");
									diffLoanAmount = totalprincipalAmount - story.approvedAmount;
									diffLoanAmount = Math.ceil(diffLoanAmount * 100)/100;
									diffLoanAmount = parseFloat(diffLoanAmount.toFixed(2));

									sails.log.info("diffLoanAmount: ",diffLoanAmount);

									principalAmount = principalAmount - diffLoanAmount;
									principalAmount = parseFloat(principalAmount.toFixed(2));

									interestAmount = startBalanceAmount * decimalRate;

									sails.log.info("final principalAmount: ",principalAmount);
								}

								if(story.approvedAmount>totalprincipalAmount)
								{
									sails.log.info("Enter else loop");
									diffLoanAmount = story.approvedAmount - totalprincipalAmount;
									diffLoanAmount = Math.ceil(diffLoanAmount * 100)/100;
									diffLoanAmount = parseFloat(diffLoanAmount.toFixed(2));

									sails.log.info("diffLoanAmount: ",diffLoanAmount);

									principalAmount = principalAmount + diffLoanAmount;
									principalAmount = parseFloat(principalAmount.toFixed(2));

									sails.log.info("final principalAmount: ",principalAmount);
								}
							}*/
						}
						else
						{
							scheduleLoanAmount = Math.round((story.approvedAmount / loanTerm) * 100) / 100;
							if(checktotalLoanAmount==0)
							{
								checktotalLoanAmount = story.approvedAmount;
							}

							//Calculate interest
							interestAmount   = 0;

							//Calculate prinicpal amount
							principalAmount = scheduleLoanAmount - interestAmount;
							//principalAmount  = principalAmount.toFixed(2);

							//Calculate new start balance amount
							showstartBalanceAmount = startBalanceAmount;
							startBalanceAmount = startBalanceAmount - principalAmount;
							//startBalanceAmount  = startBalanceAmount.toFixed(2);
						}

						//sails.log.info("scheduleLoanAmount: ",scheduleLoanAmount);

						totalLoanAmount=totalLoanAmount+scheduleLoanAmount;
						if(i==loanTerm)
						{
							//sails.log.info("story.approvedAmount: ",story.approvedAmount);
							//sails.log.info("totalLoanAmount: ",totalLoanAmount);
							if(checktotalLoanAmount<totalLoanAmount)
							{
								//deductLoanAmount = totalLoanAmount-story.approvedAmount;
								//scheduleLoanAmount = Math.round(scheduleLoanAmount - deductLoanAmount);

								deductLoanAmount = totalLoanAmount-checktotalLoanAmount;
								scheduleLoanAmount = scheduleLoanAmount - deductLoanAmount;
								scheduleLoanAmount = parseFloat(scheduleLoanAmount.toFixed(2));
							}

							if(checktotalLoanAmount>totalLoanAmount)
							{
								//addLoanAmount = story.approvedAmount - totalLoanAmount;

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
										paidprincipalAmount:0,
										paidinterestAmount:0,
										lastpaidprincipalAmount:0,
										lastpaidinterestAmount:0,
										lastpaidcount:0,
										date: moment().startOf('day').add(counter, 'months').toDate(),
										lastpaiddate: moment().startOf('day').add(datecounter, 'months').toDate(),
										//TODO: Need to search nested object
										//TODO: NEED TO UNCOMMENT BELOW CODE TO MAKE ACH LIVE
										//transaction: transactionDetail.id,
										//ADDED TO BYPASS LOAN WITHOUT ACH (NEED TO BLOCK ONCE ACH IS LIVE)
										transaction:story.user,
										status: 'OPENED'
								});
								datecounter++;
								counter++;
							}

							//TODO: Need to see whether the transaction  are paid or not
							var maturityDate = moment().startOf('day').add(loanTerm, 'months');
							var account;
							if (story.account) {
								account = story.account;

							} else {
								account = story.fluidCard;
							}

		 					return User.getNextSequenceValue('loan')
							.then(function(loanRefernceData) {

							 sails.log.info("loanRefernceData",loanRefernceData);
							 var loanRefernceDataValue ='LN_'+loanRefernceData.sequence_value;

								var obj = {
								paymentSchedule: paymentSchedule,
								maturityDate: maturityDate.toDate(),
								story: story.id,
								user: story.user,
								payOffAmount: parseFloat(story.requestedAmount?story.requestedAmount.toString():"0"),
								account: account,
								nextPaymentSchedule: moment().add(1, 'months').toDate(),
								//TODO: NEED TO UNCOMMENT BELOW CODE TO MAKE ACH LIVE OR SET ACHSTATUS=1
								achstatus:0,
								loanReference: loanRefernceDataValue,
								loanappversion: loanappversion,
								loaniosversion: loaniosversion,
								interestapplied: loanInterestRate,
								amount: parseFloat(checktotalLoanAmount?checktotalLoanAmount.toString():"0"),
								loantermcount: loanTerm,
								apr: loanApr,
								fundingfee: loanFundingFee,
								balanceavailcheck: loanBalanceAvail
								//loanReference:'LN_'+Utils.generateReferenceId()
								};

								PaymentManagement.create(obj)
								.then(function(paymentDet) {

									    // Need to update payment reference in userconsent table
									    var consentCriteria = {
														  user:story.user,
														  loanupdated:1
														};

										UserConsent
										.find(consentCriteria)
										.sort("createdAt DESC")
										.then(function(userConsentAgreement) {

											_.forEach(userConsentAgreement, function(consentagreement) {

												UserConsent.updateUserConsentAgreement(consentagreement.id,story.user,paymentDet.id);
											});
										 })
										 .catch(function(err) {
											sails.log.error("paymentFeeManagement UserConsent error::", err);
										 });



									    //Need to check blocked application (bank account duplicate) starts here
										//sails.log.info("accountId: ",account);
										Account
										.findOne({id: account})
										.then(function(accountDetail) {
											sails.log.info("accountDetail: ",accountDetail);

											 if(accountDetail)
											 {
												 var routingNumber = accountDetail.routingNumber;
												 var accountNumber = accountDetail.accountNumber
												 //var accountNumber = story.account.accountNumber;

												var criteria = {
													user: { $ne:story.user },
													accountNumber: accountNumber,
													routingNumber: routingNumber,
												};

												Account
													.find(criteria)
													.then(function(accountDatas) {
														if (accountDatas.length>0) {

														 paymentDet.achstatus=3; //--Blocked application for duplicate bank account
														 paymentDet.save(function(err) {
																if (err) {
																sails.log.error("paymentFeeManagement :: Error :: ", err);
																}

															 //Added to ach comments
															 var payID = paymentDet.id;
															 var modulename    = 'Duplicate bank accoount';
															 var modulemessage = 'Application block for duplicate bank accoount ';
															 var allParams={
																 subject : modulename,
																 comments : modulemessage
																}
															 Achcomments
															 .createAchComments(allParams,payID)
															 .then(function (achcomments) {
																	sails.log.info("paymentFeeManagement createAchComments success::");
															 }).catch(function (err) {
																 sails.log.error("paymentFeeManagement createAchComments error::", err);
															 });

														 });
														}
												})
												.catch(function(err) {
														sails.log.error("paymentFeeManagement Account error::", err);
												});
											 }
										})
										.catch(function(err) {
										sails.log.error("paymentFeeManagement Account error::", err);
										});
										//Need to check blocked application (bank account duplicate) ends here



										deferred.resolve(paymentDet);
								 })
							})
							.catch(function(err) {
									sails.log.error("paymentFeeManagement::", err);
									return reject(err);
							});
				})
				.catch(function(err) {
					sails.log.error("#paymentFeeManagement ::Error", err);
					deferred.reject(err);
				})


				//TODO: NEED TO UNCOMMENT BELOW CODE TO MAKE ACH LIVE
        //})
    })
    .catch(function(err) {
      sails.log.error("#paymentFeeManagement ::Error", err);
      deferred.reject(err);
    })
  return deferred.promise;
}


function getPaymentActivityDetail(paymentManagementDetail) {
  var deferred = Q.defer();
  var accountName;
  var data = [];
  var accountNumberLastFour;
  var amount = 0;
  var date;
  var key = 'UnmanualPayment';
  var paymentStatus;
  Account
    .findOne({
      user: paymentManagementDetail.user
    })
    .then(function(accountDetail) {
      accountName = accountDetail.accountName;
      accountNumberLastFour = accountDetail.accountNumberLastFour;
      PaymentManagement
        .findOne({
          id: paymentManagementDetail.id
        })
        .then(function(paymentManagement) {
          var manualAmount;
		  var checkDetails=0;
          if (paymentManagement.status == 'CURRENT' || paymentManagement.status == 'OPENED') {
            _.forEach(paymentManagement.paymentSchedule, function(schedule) {
			  if(checkDetails==0)
			  {
				  if (schedule.status == 'OPENED') {
					amount = schedule.amount;
					paymentStatus = "Scheduled";
					date = schedule.date;
					checkDetails =1;
				  }
			  }
            })

          } else if (paymentManagement.status == 'LATE') {
            _.forEach(paymentManagement.paymentSchedule, function(schedule) {

			  if(checkDetails==0)
			  {
				  if (schedule.status == 'LATE') {
					paymentStatus = "Late";
					amount = schedule.amount;
					date = schedule.date;
					checkDetails =1;
				  }
			  }
            })
          } else if (paymentManagement.status == 'PAID OFF') {
            date = new Date();;
            paymentStatus = 'Settled';
            //console.log("here is the paymentManagement", paymentManagement.story);
            Story
              .findOne({
                id: paymentManagement.story
              })
              .then(function(storyDetail) {

                amount = storyDetail.requestedAmount;
                console.log("amount", amount);
              })
          }

          var paymentObject = {
            date: date,
            key: key,
            paymentStatus: paymentStatus,
            amount: amount,
            accountNumberLastFour: accountNumberLastFour,
            accountName: accountName

          };
          //console.log("here is the object", paymentObject);
          data.push(paymentObject)
          deferred.resolve(data);
        })

    })
    .catch(function(err) {
      sails.log.error("#no payment object found:: Error", err);
      deferred.reject(err);

    })
  return deferred.promise;
}

function updatePaymentSchedule(paymentDetail,transactionDetail, amountPull, loanID, accountDetail) {

  return Q.promise(function(resolve, reject) {
	  var criteria = {
		id: paymentDetail.id
	  };
      PaymentManagement
      .findOne(criteria)
      .then(function(paymentManagement) {

			Schedulehistory
			.changePaymentSchedule(paymentManagement)
			.then(function(scheduleData) {

				  var schedulehistoryId = scheduleData.id;

				  sails.log.info("paymentManagement.status : ",paymentManagement.status);

				  if(paymentManagement.finalpayoffAmount=='' || paymentManagement.finalpayoffAmount==null || "undefined" == typeof paymentManagement.finalpayoffAmount)
				  {
					 paymentManagement.finalpayoffAmount = paymentManagement.payOffAmount;
					 paymentManagement.save();
				  }

				  //--Ticket no 2600
				  var comissionPayoffAmount = paymentManagement.finalpayoffAmount;

				  if (paymentManagement.status == 'CURRENT' || paymentManagement.status == 'OPENED' || paymentDetail.status == 'LATE')
				  {
						//-- Added user has paid back amount
						if (!paymentManagement.usertransactions)
						{
						  paymentManagement.usertransactions = [];
						}
						paymentManagement.status = 'OPENED';
						paymentManagement.failedtransactions =0;
						paymentManagement.blockmakepayment =0;
						paymentManagement.usertransferstatus =1;
						paymentManagement.usertransactions.push({
							  amount: amountPull,
							  loanID: loanID,
							  status:1,
							  transactionId: transactionDetail.jsonObj.order_id,
							  transactionType:'Automatic',
							  apiType:'Actum',
							  accountName: accountDetail.accountName,
							  accountNumberLastFour: accountDetail.accountNumberLastFour,
							  accountId: accountDetail.id,
							  schedulehistoryId: schedulehistoryId,
							  //initialschedule: paymentManagement.paymentSchedule,
							  date: new Date()
						});

						paymentManagement.save(function(err) {

							if(err)
							{
							  return resolve({code:400,message:'Unable to update payment details'});
							}
							PaymentManagement
							.loopPaidoffSchedule(paymentManagement)
							.then(function(paymentScheduleData) {

								  paymentManagement = paymentScheduleData.paymentFullData;
								  var statusPaidLength = paymentScheduleData.statusPaidLength;
								  paymentManagement.paymentSchedule = _.orderBy(paymentManagement.paymentSchedule, ['status'], ['asc']);

								   PaymentManagement
								   .loopFinalPayNextSchedule(paymentManagement)
								   .then(function(fullPayOffNextScheduleData) {

										paymentManagement.nextPaymentSchedule = fullPayOffNextScheduleData.nextPaymentSchedule;
										paymentManagement.finalpayoffAmount = fullPayOffNextScheduleData.finalpayoffAmount;
										paymentManagement.paymentSchedule = _.orderBy(paymentManagement.paymentSchedule, ['status'], ['asc']);

										paymentManagement.save(function(err) {

											if (err) {
												return resolve({code:400,message:'Unable to update final payoff payment details'});
											}

											//-- Register payment comission history
											var comissionData={
												schedulehistoryId:schedulehistoryId,
												orderId:transactionDetail.jsonObj.order_id,
												historyId:transactionDetail.jsonObj.history_id,
												transactionType: 'Automatic',
												apiType:'Actum',
												amountPull:amountPull,
												comissionPayoffAmount: comissionPayoffAmount
											}

											Paymentcomissionhistory
								 		    .registerPaymentComissionHistory(paymentManagement,comissionData)
								 		    .then(function(comissionData) {


												if (statusPaidLength === paymentManagement.paymentSchedule.length)
												{
													paymentManagement.status = 'PAID OFF';

													if (paymentManagement.finalpayOffAmount <= 0)
													{
														paymentManagement.finalpayOffAmount = 0;
														paymentManagement.save();

														Story
														.findOne({
															id: paymentManagement.story
														})
														.then(function(storyDetail) {

															storyDetail.status = 9;
															storyDetail.save(function(err) {

																if (err) {
																}

																//-- Need to check
																/*PaymentManagement
																.updateUserStatus(paymentManagement)
																.then(function(fullPayOffNextScheduleData) {
																	return resolve({code:200,message:'Updated successfully',paymentManagement:paymentManagement});
																}).catch(function(err) {
																	return resolve({code:200,message:'Updated successfully',paymentManagement:paymentManagement});
																});*/

																return resolve({code:200,message:'Updated successfully',paymentManagement:paymentManagement});

															});
														}).catch(function(err) {
															sails.log.error("Error:",err);
															return resolve({code:200,message:'Updated successfully',paymentManagement:paymentManagement});
														});
													}
													else
													{
														paymentManagement.save();
														return resolve({code:200,message:'Updated successfully',paymentManagement:paymentManagement});
													}
												}
												else
												{
													return resolve({code:200,message:'Updated successfully',paymentManagement:paymentManagement});
												}
											}).catch(function(err) {
												sails.log.error("Error:",err);
												return resolve({code:400,message:'Unable to register payment comission details'});
										   });
										});
								   }).catch(function(err) {
								    	sails.log.error("Error:",err);
										return resolve({code:400,message:'Unable to update next payment schedule details'});
							 	   });
							 }).catch(function(err) {
								 sails.log.error("Error:",err);
								 return resolve({code:400,message:'Unable to update payment schedule details'});
							 });
						});
				  }
			}).catch(function(err) {
				sails.log.error("Error:",err);
				return resolve({code:400,message:'Unable to save schedule history'});
			});
	   })
	   .catch(function(err) {
		  sails.log.error("Error:",err);
		  return resolve({code:400,message:'Invalid payment details'});
	   })
   });
}


//TODO:Need to clean after validating all plausible cases and need to update the status for story.paid amount
function updateForMakePaymentDetailOld(user, body, amount) {
  var deferred = Q.defer();
  var criteria = {
    user: user.id,
    isPaymentActive: true
  };
  PaymentManagement
    .findOne(criteria)
    .then(function(paymentManagementDetail) {
      paymentManagementDetail.manualPayDate = new Date();
      paymentManagementDetail.status = "CURRENT";
      paymentManagementDetail.payOffAmount = Math.round((paymentManagementDetail.payOffAmount - amount) * 100) / 100;
      paymentManagementDetail.save(function(err) {
        sails.log.error("", err);
      })

      // _.forEach(paymentManagementDetail.paymentSchedule, function(schedule)
      // for (i = 0; i < paymentManagementDetail.paymentSchedule.length - 2; i++) {
      if (amount < paymentManagementDetail.paymentSchedule[0].amount && paymentManagementDetail.payOffAmount != 0) {

        if (paymentManagementDetail.paymentSchedule[2].amount != 0) {

          paymentManagementDetail.paymentSchedule[2].amount = paymentManagementDetail.paymentSchedule[2].amount - amount;

          paymentManagementDetail.save(function(err) {
            if (err) {
              sails.log.error("make payment::Error", err);

            }
          })

          deferred.resolve(paymentManagementDetail);
        } else if (paymentManagementDetail.paymentSchedule[2].amount == 0 && paymentManagementDetail.paymentSchedule[1].amount != 0) {
          paymentManagementDetail.paymentSchedule[1].amount = paymentManagementDetail.paymentSchedule[1].amount - amount;

          paymentManagementDetail.save(function(err) {
            if (err) {
              sails.log.error("make payment::Error", err);

            }
          })

          if (paymentManagementDetail.paymentSchedule[1].amount < 0) {

            paymentManagementDetail.paymentSchedule[0].amount = paymentManagementDetail.paymentSchedule[0].amount + amount;

            paymentManagementDetail.save(function(err) {
              if (err) {
                sails.log.error("make payment::Error", err);

              }
            })
            deferred.resolve(paymentManagementDetail);
          }


          deferred.resolve(paymentManagementDetail);


        } else if (paymentManagementDetail.paymentSchedule[1].amount == 0) {


          paymentManagementDetail.paymentSchedule[0].amount = paymentManagementDetail.paymentSchedule[0].amount - amount;

          paymentManagementDetail.save(function(err) {
            if (err) {
              sails.log.error("make payment::Error", err);

            }
          })
          deferred.resolve(paymentManagementDetail);
        }
        // break;
      } else if (paymentManagementDetail.payOffAmount == 0 && amount <= paymentManagementDetail.paymentSchedule[0].amount) {

        if (paymentManagementDetail.paymentSchedule[0].amount <= 0) {
          paymentManagementDetail.paymentSchedule[0].amount == 0;
          paymentManagementDetail.paymentSchedule[0].status = 'PAID OFF';

          paymentManagementDetail.save();

          deferred.resolve(paymentManagementDetail);

        }

      } else if (amount > paymentManagementDetail.paymentSchedule[0].amount) {


        //TODO:  Need to handle other cases

        if (paymentManagementDetail.payOffAmount == 0 && paymentManagementDetail.paymentSchedule[0].amount == 0) {
          var status = 'PAID OFF';
          PaymentManagement
            .updateStatus(status, paymentManagementDetail, amount)
            .then(function(paymentManagement) {

              deferred.resolve(paymentManagement);
            })
            //TODO: It is an async operation

        } else if (paymentManagementDetail.payOffAmount != 0 && paymentManagementDetail.paymentSchedule[2].amount != 0) {
          paymentManagementDetail.paymentSchedule[2].amount = paymentManagementDetail.paymentSchedule[2].amount - amount;
          paymentManagementDetail.save(function(err) {
            sails.log.error("", err);
          })

          if (paymentManagementDetail.paymentSchedule[2].amount < 0) {


            paymentManagementDetail.paymentSchedule[1].amount = paymentManagementDetail.paymentSchedule[1].amount + paymentManagementDetail.paymentSchedule[2].amount;

            paymentManagementDetail.paymentSchedule[2].amount = 0;
            paymentManagementDetail.paymentSchedule[2].status = 'PAID OFF';
            paymentManagementDetail.save();

            if (paymentManagementDetail.paymentSchedule[1].amount < 0) {
              paymentManagementDetail.paymentSchedule[0].amount = paymentManagementDetail.paymentSchedule[0].amount + paymentManagementDetail.paymentSchedule[1].amount;

              paymentManagementDetail.paymentSchedule[1].amount = 0;
              paymentManagementDetail.paymentSchedule[1].status = 'PAID OFF';
              paymentManagementDetail.payOffAmount = 0;
              paymentManagementDetail.save();
            }
            deferred.resolve(paymentManagementDetail);

          }



        } else if (paymentManagementDetail.payOffAmount != 0 && paymentManagementDetail.paymentSchedule[2].amount == 0) {
          paymentManagementDetail.paymentSchedule[1].amount = paymentManagementDetail.paymentSchedule[1].amount - amount;
          paymentManagementDetail.save(function(err) {
            sails.log.error("", err);
          })

          if (paymentManagementDetail.paymentSchedule[1].amount < 0) {



            paymentManagementDetail.paymentSchedule[0].amount = paymentManagementDetail.paymentSchedule[0].amount + paymentManagementDetail.paymentSchedule[1].amount;

            paymentManagementDetail.paymentSchedule[1].amount = 0;
            paymentManagementDetail.paymentSchedule[1].status = 'PAID OFF';
            paymentManagementDetail.save();
            deferred.resolve(paymentManagementDetail);

          }
        }

        // break;
      } else if (amount == paymentManagementDetail.paymentSchedule[0].amount) {
        paymentManagementDetail.paymentSchedule[2].amount = paymentManagementDetail.paymentSchedule[2].amount - amount;
        if (paymentManagementDetail.payOffAmount == 0) {
          paymentManagementDetail.paymentSchedule[2].status = 'PAID OFF';
          paymentManagementDetail.paymentSchedule[2].amount = 0;
          paymentManagementDetail.save();

          deferred.resolve(paymentManagementDetail);

        }

      } else if (amount < paymentManagementDetail.paymentSchedule[0].amount && paymentManagementDetail.payOffAmount == 0) {
        paymentManagementDetail.paymentSchedule[1].amount = 0;
        paymentManagementDetail.save();
        deferred.resolve(paymentManagementDetail);
      }

      var story = paymentManagementDetail.story;
      Transaction.createTransactionForPull(story, body, amount)
        //

      deferred.resolve(paymentManagementDetail);


    })
    .catch(function(err) {
      sails.log.error("#updateForMakePaymentDetail::Error", err);
      deferred.reject(err);
    })


  return deferred.promise;

}

function updateStatus(status, paymentManagementDetail, amount) {

  var deferred = Q.defer();
  var criteria = {
    id: paymentManagementDetail.id
  };

  PaymentManagement
    .findOne(criteria)
    .then(function(paymentManagement) {

      _.forEach(paymentManagement.paymentSchedule, function(schedule) {
        schedule.amount = 0;
        schedule.status = 'PAID OFF';
        paymentManagement.status = 'PAID OFF';
        // paymentManagement.isPaymentActive = false;
        paymentManagement.save(function(error) {
          if (error) {
            sails.log.error("update status")
          }
        })
      })
      paymentManagement.payOffAmount = Math.round((paymentManagement.payOffAmount - amount) * 100) / 100;
      paymentManagement.save(function(error) {
        if (error) {
          sails.log.error("update status")
        }
      })

      deferred.resolve(paymentManagement)

    })
    .catch(function(err) {
      sails.log.error("UpdateStatus for PaymentManagement::Error", err);
      deferred.reject(err)
    })
  return deferred.promise;
}


//
// function getAllLatePayment(transaction){
//   var deferred = Q.defer();
//
// PaymentManagement
// .find()
// .then(function(paymentManagement){
//
// })
// }



function updateForMakePaymentDetail(user, body, amount,loanID) {
  var deferred = Q.defer();

  var criteria = {
    user: user.id,
    isPaymentActive: true
  };
  PaymentManagement
    .findOne(criteria)
    .then(function(paymentManagementDetail) {

      paymentManagementDetail.manualPayment.push({
        amount: amount,
		loanID: loanID,
        date: new Date()
      });

	 //-- Added user has paid back amount to kuber
	 paymentManagementDetail.blockmakepayment =0;
	 paymentManagementDetail.usertransferstatus =1;

	 if (!paymentManagementDetail.usertransactions)
	 {
	  paymentManagementDetail.usertransactions = [];
	 }

	 paymentManagementDetail.usertransactions.push({
	  amount: amount,
	  loanID: loanID,
	  status:1,
	  transactionId: body.TransactionId,
	  transactionType:'Manual',
	  date: new Date()
	 });

	  initialPayoffAmount = paymentManagementDetail.payOffAmount;
      paymentManagementDetail.payOffAmount = Math.round((paymentManagementDetail.payOffAmount - amount) * 100) / 100;
      console.log("here is the payOffAmount");

      /*paymentManagementDetail.paymentSchedule = _.orderBy(paymentManagementDetail.paymentSchedule, ['date'], ['desc']);*/
      paymentManagementDetail.save(function(err) {
        sails.log.error("updating payoff amount", err);
      })

	  console.log("amount: ",amount);
	  console.log("initialPayoffAmount: ",initialPayoffAmount);
	  console.log("payOffAmount: ",paymentManagementDetail.payOffAmount);
	  console.log("First schedule amount: ",paymentManagementDetail.paymentSchedule[0].amount);

	  //amount <paymentManagementDetail.payOffAmount

      if (amount > paymentManagementDetail.paymentSchedule[0].amount && paymentManagementDetail.payOffAmount != 0 && paymentManagementDetail.payOffAmount > 0 && amount <initialPayoffAmount ) {

		//When amount greater than first schedule amount and payoffamount not zero
		console.log("First if condition");

        var remaingAmount = Math.round((amount - paymentManagementDetail.paymentSchedule[0].amount) * 100) / 100;
        paymentManagementDetail.paymentSchedule[0].amount = 0;
        paymentManagementDetail.paymentSchedule[0].status = 'PAID OFF';
        paymentManagementDetail.save();

		console.log("remaingAmount: ",remaingAmount);

        if (remaingAmount < paymentManagementDetail.paymentSchedule[1].amount) {

			console.log("First loop if condition");

          paymentManagementDetail.paymentSchedule[1].amount = Math.round((paymentManagementDetail.paymentSchedule[1].amount - remaingAmount) * 100) / 100;
          paymentManagementDetail.save();
          deferred.resolve(paymentManagementDetail);
        } else if (remaingAmount > paymentManagementDetail.paymentSchedule[1].amount) {

			console.log("second loop if condition");

          var secondAmountRemaing = Math.round((remaingAmount - paymentManagementDetail.paymentSchedule[1].amount) * 100) / 100;
          paymentManagementDetail.paymentSchedule[1].amount = 0;
          paymentManagementDetail.paymentSchedule[1].status = 'PAID OFF';
          paymentManagementDetail.save();

		  console.log("secondAmountRemaing: ",secondAmountRemaing);

          if (secondAmountRemaing < paymentManagementDetail.paymentSchedule[2].amount) {

			console.log("second payment schedule amount: ",paymentManagementDetail.paymentSchedule[2].amount);

            paymentManagementDetail.paymentSchedule[2].amount = Math.round((paymentManagementDetail.paymentSchedule[2].amount - secondAmountRemaing) * 100) / 100;
            paymentManagementDetail.save();
            if (paymentManagementDetail.paymentSchedule[2].amount < 0) {

				console.log("second payment schedule amount is  less than zero ",paymentManagementDetail.paymentSchedule[2].amount);

              paymentManagementDetail.paymentSchedule[2].amount = 0;
              paymentManagementDetail.paymentSchedule[2].status = 'PAID OFF';
              paymentManagementDetail.save();
            }

            deferred.resolve(paymentManagementDetail);
          } else if (secondAmountRemaing == paymentManagementDetail.paymentSchedule[2].amount) {

			    console.log("secondAmountRemaing equal ",secondAmountRemaing,paymentManagementDetail.paymentSchedule[2].amount);

            paymentManagementDetail.paymentSchedule[2].amount = 0;
            paymentManagementDetail.paymentSchedule[2].status = 'PAID OFF';
            paymentManagementDetail.save();
            deferred.resolve(paymentManagementDetail);
          }

        } else if (remaingAmount == paymentManagementDetail.paymentSchedule[1].amount) {

			console.log("Third loop if condition");

          paymentManagementDetail.paymentSchedule[1].amount = 0;
          paymentManagementDetail.paymentSchedule[1].status = 'PAID OFF';
          paymentManagementDetail.save();
          deferred.resolve(paymentManagementDetail);

        }
      } else if (paymentManagementDetail.payOffAmount == 0 || paymentManagementDetail.payOffAmount < 0) {
		//When total payoffamount is zero or less
		console.log("Second condition");

        paymentManagementDetail.payOffAmount = 0;
        paymentManagementDetail.paymentSchedule[2].amount = 0;
        paymentManagementDetail.paymentSchedule[2].status = 'PAID OFF';
        paymentManagementDetail.paymentSchedule[1].amount = 0;
        paymentManagementDetail.paymentSchedule[1].status = 'PAID OFF';
        paymentManagementDetail.paymentSchedule[0].amount = 0;
        paymentManagementDetail.paymentSchedule[0].status = 'PAID OFF';
        paymentManagementDetail.payOffAmount = 0;
        paymentManagementDetail.status = 'PAID OFF';
        // paymentManagementDetail.isPaymentActive = false;

        paymentManagementDetail.save();
        deferred.resolve(paymentManagementDetail);
        PaymentManagement.updateUserStatus(paymentManagementDetail)

		 Story
		  .findOne({
			id: paymentManagementDetail.story
		  })
		  .then(function(storyDetail) {
			storyDetail.status = 9;
			storyDetail.save(function(err) {

			});
		  })

      } else if (amount < paymentManagementDetail.paymentSchedule[0].amount) {
        //When amount is less than schedule payment
		console.log("third condition");

        paymentManagementDetail.paymentSchedule[0].amount = Math.round((paymentManagementDetail.paymentSchedule[0].amount - amount) * 100) / 100;
        paymentManagementDetail.save();

      } else if (amount == paymentManagementDetail.paymentSchedule[0].amount) {
        //When amount is equal to schedule payment and check schedule status is late or not
		console.log("fourth condition");
		console.log("paymentManagementDetail status: ",paymentManagementDetail.status);

        if (paymentManagementDetail.status == 'LATE') {
          paymentManagementDetail.paymentSchedule[0].amount = 0;
          paymentManagementDetail.paymentSchedule[0].status = 'PAID OFF';
          paymentManagementDetail.paymentSchedule[0].date = moment(paymentManagementDetail.paymentSchedule[0].date).subtract(1, 'month').toDate();
          paymentManagementDetail.status = 'CURRENT';
          paymentManagementDetail.maturityDate = moment(paymentManagementDetail.maturityDate).subtract(1, 'month').toDate();
          paymentManagementDetail.save();
        } else {
          paymentManagementDetail.paymentSchedule[0].amount = 0;
          paymentManagementDetail.paymentSchedule[0].status = 'PAID OFF';
          paymentManagementDetail.save();
        }
      } else if (amount > initialPayoffAmount) {
		 //paymentManagementDetail.payOffAmount
		//When amount is greater than Initial payoffAmount
        console.log("it should have come in this block");
        deferred.reject({
          errorCode: "400",
          message: "Please enter the valid amount"
        });
      }
      var story = paymentManagementDetail.story;

	  console.log("Story id:", story);

	  //Added to make payment schdule as earlier
	  paymentManagementDetail.paymentSchedule = _.orderBy(paymentManagementDetail.paymentSchedule, ['status'], ['asc']);
      paymentManagementDetail.save(function(err) {
        sails.log.error("updating payoff amount", err);
      })
	  console.log("Story paymentManagementDetail:", paymentManagementDetail);


      Transaction.createTransactionForPull(story, body, amount)
        //

      deferred.resolve(paymentManagementDetail);


    })
    .catch(function(err) {
      sails.log.error("#updateForMakePaymentDetail::Error", err);
      deferred.reject(err);
    })


  return deferred.promise;

}

function getAllLateFeeManagement(transaction) {

  var deferred = Q.defer();
  if (transaction.status == 2) {

    var criteria = {
      user: transaction.user,
      isPaymentActive: true
    };
    PaymentManagement
      .findOne(criteria)
      .then(function(paymentManagementDetail) {

        _.forEach(paymentManagementDetail.paymentSchedule, function(schedule) {
          //TODO:Need to adjust the date after debugging

          if (moment().add(1, "months").startOf('day').toDate().getTime() >= moment(schedule.date).toDate().getTime() && moment().startOf('day').toDate().getTime() <= paymentManagementDetail.maturityDate) {

            var removedArray = _.remove(paymentManagementDetail.paymentSchedule, function(schedule) {
              return moment().add(1, "months").startOf('day').toDate().getTime() >= moment(schedule.date).toDate().getTime();
            })
            paymentManagementDetail.payOffAmount = paymentManagementDetail.payOffAmount + transaction.amount;
            paymentManagementDetail.maturityDate = moment(paymentManagementDetail.maturityDate).add(1, 'months').startOf('day').toDate();
            schedule.amount = transaction.amount;
            schedule.date = paymentManagementDetail.maturityDate;
            schedule.transaction = transaction.id;
            schedule.status = 'LATE';
            paymentManagementDetail.save()

            deferred.resolve(paymentManagementDetail)
          }

        })

      })
      .catch(function(err) {
        sails.log.error("getting All Late Fee detail", err);
        deferred.reject(err);
      })
  }
  return deferred.promise;
}



function updateUserStatus(paymentManagementDetail) {
  var deferred = Q.defer();
  var criteria = {
    id: paymentManagementDetail.user
  };

  //Check all user transaction payment are completed
  if(paymentManagementDetail.usertransactions)
  {
	  var transstatus=0;
	  _.forEach(paymentManagementDetail.usertransactions, function(transData) {
			if(transData.status!=2){
				 transstatus = 1;
			}
	  });
  }
  else
  {
	var transstatus=0;
  }

  User
    .findOne(criteria)
    .then(function(userDetail) {

      if (paymentManagementDetail.status == 'PAID OFF' && transstatus==0) {
        //userDetail.isExistingLoan = true;
		userDetail.isExistingLoan = false;
		//-- Added to choose new bank in front end
		userDetail.isBankAdded = false;
		userDetail.isUserProfileUpdated = false;
        userDetail.save();
      }
      deferred.resolve(userDetail)
    })
    .catch(function(err) {
      sails.log.error("User.updateUserStatus::Error", err);
      deferred.reject(err)
    })
  return deferred.promise;

}


function getAllPendingAchList(req, res) {

	return Q.promise(function (resolve, reject) {
		PaymentManagement
		.find({
			//achstatus: { $ne: 0, $exists: true },
			status:'OPENED',
			isPaymentActive: true,
		})
		//.sort({$natural:-1})
		.sort( { createdAt: -1 } )
		.populate('user')
		.populate('story')
		.populate('account')
		.then(function (paymentmanagementdata) {
			console.log("here is the pending list",paymentmanagementdata);
			return resolve(paymentmanagementdata);
		})
		.catch(function (err) {
			return reject(err);
		});
  });
}

function updateUserTransactionStatus(payID,transID)
{
	return Q.promise(function (resolve, reject) {

		//sails.log.info('payID: ',payID);
		//sails.log.info('transID: ',transID);

		PaymentManagement
		.findOne({
			id: payID,
		})
		.then(function (paydetails) {

			 //sails.log.info('paydetails: ',paydetails);
			/* sails.log.info('usertransferstatus: ',paydetails.id);
			 sails.log.info('userTransactionDetails: ',paydetails);
			 sails.log.info('usertransferstatus: ',paydetails.usertransferstatus);*/

			 transstatus = 0;
			 firstpaymentcompleted =0;

			 _.forEach(paydetails.usertransactions, function(transData) {

					//sails.log.info('transactionId 1 : ',transData.transactionId );
					//sails.log.info('transactionId 2: ',transID);

					if(transData.transactionId == transID)
					{
						//sails.log.info('enter if loop ');
						transData.status =2;
					}

					if(transData.status!=2){
						 transstatus = 1;
					}

					if(transData.status==2){
						 firstpaymentcompleted = 1;
					}
			 });

			 //sails.log.info('transstatus: ', transstatus);

			 if(transstatus==0){
				 paydetails.usertransferstatus = 2;

				 //sails.log.info('paydetails: ', paydetails.status, transstatus);

				 //check whether loan is completely paid off (Need to check)
				/* if (paydetails.status == 'PAID OFF' && transstatus==0)
				 {
					//sails.log.info('enter user update');

					var usercriteria = {
									  id: paydetails.user
								   };

					 User
					.findOne(usercriteria)
					.then(function(userDetail) {

						userDetail.isExistingLoan = false;
						//-- Added to choose new bank in front end
						userDetail.isBankAdded = false;
						userDetail.isUserProfileUpdated = false;
						userDetail.save();

					})
					.catch(function(err) {
					  sails.log.error("updateUserTransactionStatus userupdate::Error", err);
					  return reject(err);
					})
			   }*/
			 }

			 if(firstpaymentcompleted==1){
				 paydetails.firstpaymentcompleted=1;
			 }
			 paydetails.save(function (err) {
				  if (err) {
					return reject(err);
				  }
				  return resolve(paydetails);
			});
		})
		.catch(function (err) {
			return reject(err);
		});
   });
}


function updatefailureTransactionStatus(payID,transID,transactionDetails)
{
	return Q.promise(function (resolve, reject) {

		if(transactionDetails.Message)
		{
			var failurereason = transactionDetails.Message;
		}
		else
		{
			var failurereason = 'Transaction failed';
		}
		if(transactionDetails.ResponseCode)
		{
			var failurereasoncode = transactionDetails.ResponseCode;
		}
		else
		{
			var failurereasoncode = '';
		}

		PaymentManagement
		.findOne({
			id: payID,
		})
		.then(function (paydetails) {

			  //transstatus = 0;
			 _.forEach(paydetails.usertransactions, function(transData) {

					if(transData.transactionId ==transID)
					{
						transData.status =3;
						transData.failurereasoncode =failurereasoncode;
						transData.failurereason =failurereason;
					}
			 });

			 paydetails.save(function (err) {
				  if (err) {
					return reject(err);
				  }
				  return resolve(paydetails);
			});
		})
		.catch(function (err) {
			return reject(err);
		});
   });
}


//---Added for full payment starts here
function updateForMakeFullPaymentDetail(user, transactionData, amount, fullPayoffAmount, finalinterestAmount, payID, loanID) {

   var deferred = Q.defer();
   var criteria = {
		id: payID,
    	user: user.id,
    	isPaymentActive: true
   };

   sails.log.info("Full Psayment called:", payID);
   sails.log.info("loanID:", loanID);
   sails.log.info("amount:", amount);
   sails.log.info("userid:", user.id);
   sails.log.info("fullPayoffAmount: ", fullPayoffAmount);
   sails.log.info("finalinterestAmount: ", finalinterestAmount);

   PaymentManagement
   .findOne(criteria)
   .then(function(paymentManagementDetail) {

		//sails.log.info("paymentManagementDetail: ", paymentManagementDetail);

		var initialschedulelist = paymentManagementDetail.paymentSchedule;

		  if (!paymentManagementDetail.manualPayment)
		 {
		   paymentManagementDetail.manualPayment = [];
		 }

		/* paymentManagementDetail.manualPayment.push({
			amount: amount,
			loanID: loanID,
			date: new Date()
		  });*/

		 paymentManagementDetail.blockmakepayment =0;
		 paymentManagementDetail.usertransferstatus =1;
		 paymentManagementDetail.payOffAmount = 0;
		 if (!paymentManagementDetail.usertransactions)
		 {
		  paymentManagementDetail.usertransactions = [];
		 }

		 var paidprincipalAmount = fullPayoffAmount - finalinterestAmount;
		 paidprincipalAmount =  parseFloat(paidprincipalAmount.toFixed(2));

		/* paymentManagementDetail.usertransactions.push({
		  amount: amount,
		  loanID: loanID,
		  status:1,
		  transactionId: transactionData.TransactionId,
		  transactionType:'Manual',
		  paymentType:'fullamount',
		  paidprincipal: paidprincipalAmount,
		  paidinterest: finalinterestAmount,
		  initialschedule: paymentManagementDetail.paymentSchedule,
		  date: new Date()
		 });*/

		 paymentManagementDetail.save(function(err) {

			var deductpayOffAmount=0;
			var remainingScheduleAmount=0;
			var startBalanceAmount =0;
			var principalAmount =0;
			var interestAmount=0;
			var totalinterestDays =0;
			var dayinterestAmount=0;
			var chargeinterestDays=0;
			var totalinterestDaysAmount=0;
			var remainingInterest=0;
			var paidprincipalAmount=0;
			var remainingprincipalAmount=0;
			var remainingstartBalanceAmount=0;
			var updatedschedulerAmount =0;
			var deductpayOffAmount =0;
			var lastpaidprincipalAmount =0;
			var lastpaidinterestAmount =0;

			 var todaysDate = moment(new Date());
			 var todaysDateValue = moment().startOf('day').toDate().getTime();
			 var loanMaturityDate = moment(paymentManagementDetail.maturityDate).startOf('day').toDate().getTime();

		 	 if (paymentManagementDetail.payOffAmount == 0 || paymentManagementDetail.payOffAmount < 0)
			 {
				_.forEach(paymentManagementDetail.paymentSchedule, function(schedule) {
					  if (schedule.status == 'OPENED' | schedule.status == 'CURRENT' || schedule.status == 'LATE')
					  {

							lastpaidprincipalAmount    = schedule.paidprincipalAmount;
							lastpaidinterestAmount    = schedule.paidinterestAmount;

							startBalanceAmount = schedule.startBalanceAmount;
							principalAmount    = schedule.principalAmount;
							interestAmount     = schedule.interestAmount;
							schedulerAmount    = schedule.amount;

							var schedulerDate  = moment(schedule.date).startOf('day').toDate();
							var schedulerDateValue = moment(schedulerDate).startOf('day').toDate().getTime();

							var lastpaidDate  = moment(schedule.lastpaiddate).startOf('day').toDate();
							var lastpaidDateValue = moment(schedule.lastpaiddate).startOf('day').toDate().getTime();

							sails.log.info("startBalanceAmount: ", startBalanceAmount);
							sails.log.info("principalAmount: ", principalAmount);
							sails.log.info("interestAmount: ", interestAmount);
							sails.log.info("schedulerAmount: ", schedulerAmount);
							sails.log.info("----------------------------------");

							if( todaysDateValue <= schedulerDateValue && todaysDateValue<=loanMaturityDate )
							{
								    sails.log.info("Enter Schedule date less than or equal to current date -- if part");

									//calulate interest
									//oDate = moment(schedulerDate);
									var oDate = moment(lastpaidDate);
									var diffDays = oDate.diff(todaysDate, 'days');
									var totalinterestDays  = Math.abs(diffDays);

									var sDate = moment(schedulerDate);
									var sdiffDays = sDate.diff(lastpaidDate, 'days');
									sdiffDays  = Math.abs(sdiffDays);

									if(sdiffDays>14)
									{
										sdiffDays =14;
									}
									sdiffDays =14;
									//dayinterestAmount = interestAmount / 30;
									//chargeinterestDays = 30 - totalinterestDays;

									var dayinterestAmount = interestAmount / sdiffDays;
									var chargeinterestDays = totalinterestDays;

									if(todaysDateValue<lastpaidDateValue)
									{
										chargeinterestDays =0;
									}
									else
									{
										if(chargeinterestDays<=0)
										{
											if(schedule.lastpaidcount==1 && todaysDateValue==lastpaidDateValue )
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
											if(schedule.lastpaidcount==1)
											{
												chargeinterestDays =parseInt(chargeinterestDays);
											}
											else
											{
											 chargeinterestDays =parseInt(chargeinterestDays)+1;
											}
										}
									}

									var totalinterestDaysAmount = dayinterestAmount * chargeinterestDays;
									totalinterestDaysAmount  = parseFloat(totalinterestDaysAmount).toFixed(2);

									var remainingInterest = interestAmount - totalinterestDaysAmount;
									remainingInterest  = parseFloat(remainingInterest).toFixed(2);

									sails.log.info("chargeinterestDays: ", chargeinterestDays);
									sails.log.info("remainingInterest: ", remainingInterest);
									sails.log.info("totalinterestDaysAmount: ", totalinterestDaysAmount);

									schedule.interestAmount = remainingInterest;
									schedule.paidinterestAmount = totalinterestDaysAmount;
							}
							else
							{
								sails.log.info("Enter Schedule date greater than current date -- else part");

								schedule.interestAmount = parseFloat(interestAmount).toFixed(2);
								schedule.paidinterestAmount = parseFloat(interestAmount).toFixed(2);
							}

							schedule.lastpaidprincipalAmount = parseFloat(lastpaidprincipalAmount).toFixed(2);
							schedule.lastpaidinterestAmount =  parseFloat(lastpaidinterestAmount).toFixed(2);

							schedule.principalAmount = parseFloat(principalAmount).toFixed(2);
							schedule.paidprincipalAmount = parseFloat(principalAmount).toFixed(2);

							schedule.lastpaiddate = moment().startOf('day').toDate();
							schedule.lastpaidcount = 1;

							schedule.amount =0;
							schedule.status = 'PAID OFF';
					  }
			    })

				var finalpayoffAmount =0;
				_.forEach(paymentManagementDetail.paymentSchedule, function(finalscheduler) {
					if (finalscheduler.status == "OPENED" || finalscheduler.status == 'CURRENT' || finalscheduler.status == 'LATE' )
					{
					  if( finalscheduler.amount>0 && finalpayoffAmount==0 )
					  {
						  finalpayoffAmount = parseFloat(finalscheduler.startBalanceAmount).toFixed(2);
					  }
					}
				});
				paymentManagementDetail.finalpayoffAmount = finalpayoffAmount;
				paymentManagementDetail.status = 'PAID OFF';
				paymentManagementDetail.save(function(err) {

					  Story
					  .findOne({
						id: paymentManagementDetail.story
					  })
					  .then(function(storyDetail) {
						storyDetail.status = 9;
						storyDetail.save(function(err) {

						});
					  })

					  var story = paymentManagementDetail.story;
					  Transaction.createTransactionForPull(story, transactionData , amount);
					  PaymentManagement.updateUserStatus(paymentManagementDetail);

					  deferred.resolve({paymentManagementDetail:paymentManagementDetail,initialschedulelist:initialschedulelist});
				});
			 }
		});
   })
   .catch(function(err) {
      sails.log.error("#updateForMakeFullPaymentDetail::Error", err);
      deferred.reject(err);
   })
   return deferred.promise;
}


//---Added for userloan repayment for 24% interest loan starts here
function updateForMakeUserPaymentDetail(user, transactionData, amount, fullPayoffAmount, finalinterestAmount,  payID, loanID) {

   var deferred = Q.defer();
   var criteria = {
		id: payID,
   		user: user.id,
   	    isPaymentActive: true
   };

   sails.log.info("userpayment called:", payID);
   sails.log.info("loanID:", loanID);
   sails.log.info("amount:", amount);
   sails.log.info("userid:", user.id);
   sails.log.info("fullPayoffAmount: ", fullPayoffAmount);
   sails.log.info("finalinterestAmount: ", finalinterestAmount);

   PaymentManagement
   .findOne(criteria)
   .then(function(paymentManagementDetail) {

		 if (!paymentManagementDetail.manualPayment)
		 {
		   paymentManagementDetail.manualPayment = [];
		 }
		 /*paymentManagementDetail.manualPayment.push({
			amount: amount,
			loanID: loanID,
			date: new Date()
		 });*/

		 totalpaidprincipalAmount = fullPayoffAmount - finalinterestAmount;
		 totalpaidprincipalAmount =  parseFloat(totalpaidprincipalAmount.toFixed(2));

		 var  initialpaymentSchedule = paymentManagementDetail.paymentSchedule;

		 paymentManagementDetail.oldprincipalstatus =0;
		 paymentManagementDetail.blockmakepayment =0;
		 paymentManagementDetail.usertransferstatus =1;
		 /*paymentManagementDetail.usertransactions.push({
			  amount: amount,
			  loanID: loanID,
			  status:1,
			  transactionId: transactionData.TransactionId,
			  transactionType:'Manual',
			  paymentType:'useramount',
			  paidprincipal: totalpaidprincipalAmount,
			  paidinterest: finalinterestAmount,
			  initialschedule: initialpaymentSchedule,
			  date: new Date()
		  });*/

		var deductpayOffAmount=0;
		var remainingScheduleAmount=0;
		var startBalanceAmount =0;
		var principalAmount =0;
		var interestAmount=0;
		var totalinterestDays =0;
		var dayinterestAmount=0;
		var chargeinterestDays=0;
		var totalinterestDaysAmount=0;
		var remainingInterest=0;
		var paidprincipalAmount=0;
		var remainingprincipalAmount=0;
		var remainingstartBalanceAmount=0;
		var updatedschedulerAmount =0;
		var deductpayOffAmount =0;
		var lastpaidprincipalAmount =0;
		var lastpaidinterestAmount =0;
		var checkSchedulerAmount =0;

		var loopPayAmount = parseFloat(amount);



		//--calculate biweekly amount for the loan
		var payOffAmount = parseFloat(paymentManagementDetail.payOffAmount);

		/*if(paymentManagementDetail.oldprincipalstatus==0)
		{
			 _.forEach(paymentManagementDetail.paymentSchedule, function(principaldata) {
				principaldata.oldprincipalAmount = principaldata.principalAmount;
			});
			 paymentManagementDetail.oldprincipalstatus==1
		}*/

		_.forEach(paymentManagementDetail.paymentSchedule, function(principaldata) {
				if(paymentManagementDetail.oldprincipalstatus==0)
				{
					principaldata.oldprincipalAmount = principaldata.principalAmount;
				}
				principaldata.orgprincipalAmount = 0;
		});

		if(paymentManagementDetail.oldprincipalstatus==0)
		{
			paymentManagementDetail.oldprincipalstatus==1;
		}


		/*sails.log.info("payOffAmount: ",payOffAmount);
		sails.log.info("paymentManagementDetail.interestapplied: ",paymentManagementDetail.interestapplied);
		sails.log.info("paymentManagementDetail.loantermcount: ",paymentManagementDetail.loantermcount);*/

	    PaymentManagement.biweeklyCalculate(payOffAmount,paymentManagementDetail.interestapplied,paymentManagementDetail.loantermcount)
	    .then(function(biweeklyscheduleLoanAmount) {

			 sails.log.info("biweeklyscheduleLoanAmount: ",biweeklyscheduleLoanAmount);

			 biweeklyscheduleLoanAmount = parseFloat(biweeklyscheduleLoanAmount);
			 biweeklyscheduleLoanAmount = biweeklyscheduleLoanAmount.toFixed(2);

			  paymentManagementDetail.save(function(err) {


				  //Calculate interest to deduct first and then reduce prinicpal amount (payOffAmount)
				  paymentManagementDetail.paymentSchedule = _.orderBy(paymentManagementDetail.paymentSchedule, ['date'], ['asc']);

				  var loanMaturityDate = moment(paymentManagementDetail.maturityDate).startOf('day').toDate().getTime();

				  var todaysDate = moment(new Date());
				  var todaysDateValue = moment().startOf('day').toDate().getTime();

				 sails.log.info("first loopPayAmount: ", loopPayAmount);
				 sails.log.info("first amount: ", amount);
				 sails.log.info("first remainingScheduleAmount: ", remainingScheduleAmount);

				  _.forEach(paymentManagementDetail.paymentSchedule, function(scheduler) {

							if (scheduler.status == "OPENED" || scheduler.status == 'CURRENT' || scheduler.status == 'LATE' )
							{
									/*sails.log.info("scheduler.amount: ", scheduler.amount);
									sails.log.info("loopPayAmount: ", loopPayAmount);
									sails.log.info("remainingScheduleAmount: ", remainingScheduleAmount);
									sails.log.info("----------------------------------");*/
									//scheduler.oldprincipalAmount = principalAmount;
									if(scheduler.amount>0 && loopPayAmount>0 && remainingScheduleAmount==0 )
									{
										sails.log.info("Enter amount checking if loop condition ");

										lastpaidprincipalAmount    = scheduler.paidprincipalAmount;
										lastpaidinterestAmount    = scheduler.paidinterestAmount;
										/*if(startBalanceAmount==0){
											startBalanceAmount = parseFloat(scheduler.startBalanceAmount)+parseFloat(scheduler.principalAmount);
										}else{
											startBalanceAmount = scheduler.startBalanceAmount;
										}*/
										//startBalanceAmount = parseFloat(scheduler.startBalanceAmount)+parseFloat(scheduler.principalAmount);
										startBalanceAmount = scheduler.startBalanceAmount;
										sails.log.info("startBalanceAmount00000000: ", startBalanceAmount);

										principalAmount    = parseFloat(scheduler.principalAmount);
										interestAmount     = parseFloat(scheduler.interestAmount);
										schedulerAmount    = parseFloat(scheduler.amount);
										var schedulerDate  = moment(scheduler.date).startOf('day').toDate();
										var lastpaidDate  = moment(scheduler.lastpaiddate).startOf('day').toDate();
										var schedulerDateValue = moment(schedulerDate).startOf('day').toDate().getTime();
										var lastpaidDateValue = moment(scheduler.lastpaiddate).startOf('day').toDate().getTime();

										//-- Schedule date less than or equal to current date
										if( todaysDateValue <= schedulerDateValue && todaysDateValue<=loanMaturityDate )
										{
											sails.log.info("Enter Schedule date less than or equal to current date");

											//calulate interest
											//oDate = moment(schedulerDate);
											var oDate = moment(lastpaidDate);
											var diffDays = oDate.diff(todaysDate, 'days');
											totalinterestDays  = Math.abs(diffDays);

											var sDate = moment(schedulerDate);
											var sdiffDays = sDate.diff(lastpaidDate, 'days');
											sdiffDays  = Math.abs(sdiffDays);

											if(sdiffDays>14)
											{
												sdiffDays =14;
											}
											sdiffDays =14;
											//dayinterestAmount = interestAmount / 30;
											//chargeinterestDays = 30 - totalinterestDays;
											dayinterestAmount = interestAmount / sdiffDays;
											chargeinterestDays = totalinterestDays;

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
													//var chargeinterestDays =parseInt(chargeinterestDays)+1;
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

											if(chargeinterestDays>0)
											{
												totalinterestDaysAmount = parseFloat(dayinterestAmount) * parseFloat(chargeinterestDays);
												totalinterestDaysAmount  = parseFloat(totalinterestDaysAmount.toFixed(2));
											}
											else
											{
												totalinterestDaysAmount  = 0;
											}

											sails.log.info("chargeinterestDays: ", chargeinterestDays);
											sails.log.info("totalinterestDaysAmount: ", totalinterestDaysAmount);

											checkSchedulerAmount = parseFloat(principalAmount) + parseFloat(totalinterestDaysAmount);

											sails.log.info("loopPayAmount: ", loopPayAmount);
											sails.log.info("checkSchedulerAmount: ", checkSchedulerAmount);

											//if (loopPayAmount >= schedulerAmount )

											//-- changed on oct 13
											if (loopPayAmount >= checkSchedulerAmount)
											{
												sails.log.info("Enter "+ loopPayAmount +"  >= "+ checkSchedulerAmount +" first if condiion");

												//-- 200 > 107.12 (scheduleamount)
												//-- Added to avoid negative interest calculation
												sails.log.info("interestAmount: ", interestAmount);
												if(totalinterestDaysAmount > interestAmount)
												{
													remainingInterest = interestAmount;
													totalinterestDaysAmount = interestAmount;
												}
												else
												{
													remainingInterest = parseFloat(interestAmount) - parseFloat(totalinterestDaysAmount);
												}
												remainingInterest  = parseFloat(remainingInterest.toFixed(2));


												sails.log.info("remainingInterest: ", remainingInterest);
												sails.log.info("loopPayAmount111: ", loopPayAmount);
												sails.log.info("totalinterestDaysAmount111: ", totalinterestDaysAmount);
												sails.log.info("scheduler.paidprincipalAmount: ", scheduler.paidprincipalAmount);
												sails.log.info("paidprincipalAmount new111111 ", paidprincipalAmount);

												paidprincipalAmount = parseFloat(paidprincipalAmount) + (parseFloat(loopPayAmount) - parseFloat(totalinterestDaysAmount));

												sails.log.info("paidprincipalAmount55555555 ", paidprincipalAmount);

												//-- added for calcuating full paid principal
												paidprincipalAmount = parseFloat(scheduler.paidprincipalAmount)+parseFloat(paidprincipalAmount);
												paidprincipalAmount  = parseFloat(paidprincipalAmount.toFixed(2));


												sails.log.info("paidprincipalAmount22222: ", paidprincipalAmount);

												totalinterestDaysAmount = parseFloat(scheduler.paidinterestAmount)+parseFloat(totalinterestDaysAmount);
												totalinterestDaysAmount  = parseFloat(totalinterestDaysAmount.toFixed(2));

												scheduler.lastpaidprincipalAmount = parseFloat(lastpaidprincipalAmount).toFixed(2);
												scheduler.lastpaidinterestAmount =  parseFloat(lastpaidinterestAmount).toFixed(2);

												sails.log.info("lastpaidprincipalAmount: ", lastpaidprincipalAmount);
												sails.log.info("lastpaidinterestAmount: ", lastpaidinterestAmount);
												sails.log.info("oldprincipalAmount: ", principalAmount);

												scheduler.orgprincipalAmount = scheduler.principalAmount;

												scheduler.principalAmount = paidprincipalAmount;
												scheduler.interestAmount = remainingInterest;
												scheduler.paidprincipalAmount = paidprincipalAmount;
												scheduler.paidinterestAmount = totalinterestDaysAmount;
												scheduler.lastpaiddate = moment().startOf('day').toDate();
												scheduler.amount = 0;
												scheduler.lastpaidcount = 1;
												scheduler.status = 'PAID OFF';



												sails.log.info("scheduler: ", scheduler);

												//-- need to rearrange
												remainingScheduleAmount =1;
											}
											else
											{
												sails.log.info("Enter "+ loopPayAmount +"  < "+ schedulerAmount +" first else  condiion");

												if(loopPayAmount>interestAmount)
												{
													sails.log.info("Enter "+ loopPayAmount +"  > "+ interestAmount +" second if condiion");

													//-- 200 > 12 (interest)
													remainingInterest = parseFloat(interestAmount) - parseFloat(totalinterestDaysAmount);
													remainingInterest  = parseFloat(remainingInterest.toFixed(2));

													sails.log.info("remainingInterest: ", remainingInterest);

													paidprincipalAmount = parseFloat(loopPayAmount)- parseFloat(totalinterestDaysAmount);
													paidprincipalAmount  = parseFloat(paidprincipalAmount.toFixed(2));

													sails.log.info("paidprincipalAmount: ", paidprincipalAmount);

													remainingprincipalAmount = parseFloat(principalAmount) - parseFloat(paidprincipalAmount);
													remainingprincipalAmount  = parseFloat(remainingprincipalAmount.toFixed(2));

													sails.log.info("remainingprincipalAmount: ", remainingprincipalAmount);

													remainingstartBalanceAmount = parseFloat(startBalanceAmount) - parseFloat(paidprincipalAmount);
													remainingstartBalanceAmount  = parseFloat(remainingstartBalanceAmount.toFixed(2));

													sails.log.info("remainingstartBalanceAmount: ", remainingstartBalanceAmount);

													totalinterestDaysAmount = parseFloat(scheduler.paidinterestAmount)+parseFloat(totalinterestDaysAmount);
													totalinterestDaysAmount  = parseFloat(totalinterestDaysAmount.toFixed(2));

													sails.log.info("totalinterestDaysAmount: ", totalinterestDaysAmount);

													paidprincipalAmount = parseFloat(scheduler.paidprincipalAmount)+parseFloat(paidprincipalAmount);
													paidprincipalAmount  = parseFloat(paidprincipalAmount.toFixed(2));

													sails.log.info("paidprincipalAmount: ", paidprincipalAmount);


													scheduler.lastpaidprincipalAmount = parseFloat(lastpaidprincipalAmount.toFixed(2));
													scheduler.lastpaidinterestAmount =  parseFloat(lastpaidinterestAmount.toFixed(2));

													scheduler.startBalanceAmount = remainingstartBalanceAmount;
													scheduler.principalAmount = remainingprincipalAmount;
													scheduler.interestAmount = remainingInterest;
													scheduler.paidprincipalAmount = paidprincipalAmount;
													scheduler.paidinterestAmount = totalinterestDaysAmount;
													scheduler.lastpaiddate = moment().startOf('day').toDate();

													if(remainingprincipalAmount==0)
													{
														scheduler.amount = 0;
														scheduler.status = 'PAID OFF';
													}
													else
													{
														updatedschedulerAmount = parseFloat(remainingprincipalAmount)+parseFloat(remainingInterest);
														scheduler.amount = parseFloat(updatedschedulerAmount.toFixed(2));
													}

													scheduler.lastpaidcount = 1;

													//-- no need to rearrange
													remainingScheduleAmount =2;
												}
												else
												{
													sails.log.info("Enter "+ loopPayAmount +"  < "+ interestAmount +" second else  condiion");

													if(loopPayAmount<totalinterestDaysAmount)
													{
														sails.log.info("Enter "+ loopPayAmount +"  < "+ totalinterestDaysAmount +" third if  condiion");

														//-- 200 < 10 ( 25 days interest)
														remainingInterest = parseFloat(interestAmount) - parseFloat(loopPayAmount);
														remainingInterest  = parseFloat(remainingInterest.toFixed(2));
														paidprincipalAmount =0;

														totalinterestDaysAmount = parseFloat(scheduler.paidinterestAmount)+parseFloat(loopPayAmount);
														totalinterestDaysAmount  = parseFloat(totalinterestDaysAmount.toFixed(2));


														scheduler.lastpaidprincipalAmount = parseFloat(lastpaidprincipalAmount.toFixed(2));
														scheduler.lastpaidinterestAmount =  parseFloat(lastpaidinterestAmount.toFixed(2));

														scheduler.interestAmount = remainingInterest;
														scheduler.paidprincipalAmount = paidprincipalAmount;
														//scheduler.paidinterestAmount = parseFloat(loopPayAmount.toFixed(2));
														scheduler.paidinterestAmount = totalinterestDaysAmount;
														scheduler.lastpaiddate = moment().startOf('day').toDate();
														updatedschedulerAmount = parseFloat(principalAmount)+parseFloat(remainingInterest);
														scheduler.amount = parseFloat(updatedschedulerAmount.toFixed(2));

														scheduler.lastpaidcount = 1;

														//-- no need to rearrange
														remainingScheduleAmount =2;
													}
													else
													{
														//-- 200 > 10 ( 25 days interest)

														sails.log.info("Enter "+ loopPayAmount +"  > "+ totalinterestDaysAmount +" third else  condiion");

														remainingInterest = parseFloat(interestAmount) - parseFloat(totalinterestDaysAmount);
														remainingInterest  = parseFloat(remainingInterest).toFixed(2);
														//paidprincipalAmount =0;

														paidprincipalAmount = parseFloat(loopPayAmount) - parseFloat(totalinterestDaysAmount);
														paidprincipalAmount  = parseFloat(paidprincipalAmount).toFixed(2);

														remainingprincipalAmount = parseFloat(principalAmount)- parseFloat(paidprincipalAmount);
														remainingprincipalAmount  = parseFloat(remainingprincipalAmount).toFixed(2);

														remainingstartBalanceAmount = startBalanceAmount - paidprincipalAmount;
														remainingstartBalanceAmount  = parseFloat(remainingstartBalanceAmount).toFixed(2);

														totalinterestDaysAmount = parseFloat(scheduler.paidinterestAmount)+parseFloat(totalinterestDaysAmount);
														totalinterestDaysAmount  = parseFloat(totalinterestDaysAmount).toFixed(2);

														paidprincipalAmount = parseFloat(scheduler.paidprincipalAmount)+parseFloat(paidprincipalAmount);
														paidprincipalAmount  = parseFloat(paidprincipalAmount.toFixed(2));

														scheduler.lastpaidprincipalAmount = parseFloat(lastpaidprincipalAmount).toFixed(2);
														scheduler.lastpaidinterestAmount =  parseFloat(lastpaidinterestAmount).toFixed(2);

														scheduler.startBalanceAmount = remainingstartBalanceAmount;
														scheduler.principalAmount = remainingprincipalAmount;
														scheduler.interestAmount = remainingInterest;
														scheduler.paidprincipalAmount = paidprincipalAmount;
														scheduler.paidinterestAmount =  parseFloat(totalinterestDaysAmount).toFixed(2);
														scheduler.lastpaiddate = moment().startOf('day').toDate();
														updatedschedulerAmount = parseFloat(remainingprincipalAmount)+parseFloat(remainingInterest);
														scheduler.amount = parseFloat(updatedschedulerAmount).toFixed(2);

														scheduler.lastpaidcount = 1;

														remainingScheduleAmount =2;
													}
												}
											}
										}
										else
										{
											sails.log.info("Enter Schedule date date greater than current date");

											//-- Schedule date greater than current date
											if (loopPayAmount >= schedulerAmount )
											{
												sails.log.info("Enter  date greater than current date -- "+ loopPayAmount +"  >= "+ schedulerAmount +" first if  condiion");

												 //-- 200 > 107.12 (scheduleamount)
												deductpayOffAmount = parseFloat(deductpayOffAmount) + parseFloat(principalAmount);
												loopPayAmount = parseFloat(loopPayAmount) - parseFloat(schedulerAmount);
												loopPayAmount = parseFloat(loopPayAmount);

												finalinterestAmount = parseFloat(finalinterestAmount) - parseFloat(interestAmount);


												scheduler.lastpaidprincipalAmount = parseFloat(lastpaidprincipalAmount).toFixed(2);
												scheduler.lastpaidinterestAmount =  parseFloat(lastpaidinterestAmount).toFixed(2);

												scheduler.paidprincipalAmount = principalAmount;
												scheduler.paidinterestAmount = interestAmount;
												scheduler.lastpaiddate = moment().startOf('day').toDate();
												scheduler.amount = 0;
												scheduler.status = 'PAID OFF';

												//scheduler.lastpaidcount = 1;
											}
											else
											{
												sails.log.info("Enter  date greater than current date -- "+ loopPayAmount +"  < "+ schedulerAmount +" first else  condiion");

												if(loopPayAmount>interestAmount)
												{
													   sails.log.info("Enter  date greater than current date -- "+ loopPayAmount +"  > "+ interestAmount +" second if  condiion");

													   //-- 200 > 12 (full interest)
														remainingInterest = 0
														paidprincipalAmount = parseFloat(loopPayAmount) - parseFloat(interestAmount);
														paidprincipalAmount  = parseFloat(paidprincipalAmount.toFixed(2));

														remainingprincipalAmount = parseFloat(principalAmount) - parseFloat(paidprincipalAmount);
														remainingprincipalAmount  = parseFloat(remainingprincipalAmount).toFixed(2);

														paidprincipalAmount = parseFloat(scheduler.paidprincipalAmount)+parseFloat(paidprincipalAmount);
														paidprincipalAmount  = parseFloat(paidprincipalAmount.toFixed(2));

														totalinterestDaysAmount = parseFloat(scheduler.paidinterestAmount)+parseFloat(interestAmount);
														totalinterestDaysAmount  = parseFloat(totalinterestDaysAmount).toFixed(2);


														scheduler.lastpaidprincipalAmount = parseFloat(lastpaidprincipalAmount).toFixed(2);
														scheduler.lastpaidinterestAmount =  parseFloat(lastpaidinterestAmount).toFixed(2);

														scheduler.principalAmount = remainingprincipalAmount;
														scheduler.interestAmount = remainingInterest;
														scheduler.paidprincipalAmount = paidprincipalAmount;
														scheduler.lastpaiddate = moment().startOf('day').toDate();
														scheduler.paidinterestAmount = parseFloat(totalinterestDaysAmount).toFixed(2);

														scheduler.amount = parseFloat(remainingprincipalAmount).toFixed(2);

														//scheduler.lastpaidcount = 1;
												}
												else
												{
														//-- 200 < 12 (full interest)
														sails.log.info("Enter  date greater than current date -- "+ loopPayAmount +"  < "+ interestAmount +" second else  condiion");

														remainingInterest = parseFloat(interestAmount) - parseFloat(loopPayAmount);
														remainingInterest  = parseFloat(remainingInterest.toFixed(2));
														paidprincipalAmount =0;

														totalinterestDaysAmount = parseFloat(scheduler.paidinterestAmount)+parseFloat(loopPayAmount);
														totalinterestDaysAmount  = parseFloat(totalinterestDaysAmount).toFixed(2);

														scheduler.lastpaidprincipalAmount = parseFloat(lastpaidprincipalAmount).toFixed(2);
														scheduler.lastpaidinterestAmount =  parseFloat(lastpaidinterestAmount).toFixed(2);

														scheduler.interestAmount = remainingInterest;
														scheduler.paidprincipalAmount = paidprincipalAmount;
														scheduler.lastpaiddate = moment().startOf('day').toDate();
														//scheduler.paidinterestAmount =  parseFloat(loopPayAmount.toFixed(2));
														scheduler.paidinterestAmount =  parseFloat(totalinterestDaysAmount).toFixed(2);

														updatedschedulerAmount =  parseFloat(principalAmount)+parseFloat(remainingInterest);
														scheduler.amount = parseFloat(updatedschedulerAmount).toFixed(2);

														//scheduler.lastpaidcount = 1;
												}
												//-- no need to rearrange
												remainingScheduleAmount =3;
											}
										}
									}
									else
									{
											//--no need
											//sails.log.info("Enter amount checking else loop condition ");
									}
							}
			   })

			   paymentManagementDetail.save(function(err) {

				//sails.log.info("paymentManagementDetail scheduler:", paymentManagementDetail.paymentSchedule);

				   //-- need to rearrange
				   if(remainingScheduleAmount==1)
				   {
					  sails.log.info("rearranagement called");

					  var newloopPayAmount=0;
					  var loanInterestRate = paymentManagementDetail.interestapplied;
					  var loanApr = paymentManagementDetail.apr;
					  var newloanTerm =1;
					  var startBalanceAmount =0;
					  var principalAmount =0;
					  var newscheduleLoanAmount=0;
					  var newinterestAmount=0;
					  var newprincipalAmount=0;
					  var newschedulerAmount=0;
					  var newpaidprincipalAmount =0;
					  var newlastpaidprincipalAmount =0;
					  var newlastpaidinterestAmount =0;
					  var checktotalcheduleAmount = 0;

					 _.forEach(paymentManagementDetail.paymentSchedule, function(newscheduler) {

							if(newscheduler.status == "PAID OFF" && parseFloat(newscheduler.orgprincipalAmount) >0 )
							{

								startBalanceAmount = parseFloat(newscheduler.startBalanceAmount)+parseFloat(newscheduler.orgprincipalAmount);

								/*if(startBalanceAmount==0)
								{
								  startBalanceAmount = parseFloat(newscheduler.startBalanceAmount)+parseFloat(newscheduler.oldprincipalAmount);
							    }else{
								  startBalanceAmount =parseFloat(newscheduler.calstartBalanceAmount);
								}*/
								//startBalanceAmount = parseFloat(newscheduler.startBalanceAmount);

								principalAmount = parseFloat(newscheduler.principalAmount);
								newpaidprincipalAmount = parseFloat(newscheduler.paidprincipalAmount);

								newlastpaidprincipalAmount = parseFloat(newscheduler.lastpaidprincipalAmount);
								newlastpaidinterestAmount = parseFloat(newscheduler.lastpaidinterestAmount);


								sails.log.info("new startBalanceAmount: ", startBalanceAmount);
								sails.log.info("new principalAmount: ", principalAmount);
								sails.log.info("new paidprincipalAmount: ", newpaidprincipalAmount);
								sails.log.info("new lastpaidprincipalAmount: ", newlastpaidprincipalAmount);
								sails.log.info("new lastpaidinterestAmount: ", newlastpaidinterestAmount);

								if(newpaidprincipalAmount>0)
								{
									//106.72 > 34.6
									if(principalAmount>=newpaidprincipalAmount)
									{
										//-- need to check
										newloopPayAmount =  parseFloat(startBalanceAmount) -  ( parseFloat(principalAmount) - parseFloat(newlastpaidprincipalAmount) );
									}
									else
									{
										newloopPayAmount =  parseFloat(startBalanceAmount) -  parseFloat(principalAmount);
									}
								}
								else
								{
									newloopPayAmount =  parseFloat(startBalanceAmount) -  parseFloat(principalAmount);
								}
								newloopPayAmount  = parseFloat(newloopPayAmount.toFixed(2));
							}

							sails.log.info("newloopPayAmount: ", newloopPayAmount);
							//sails.log.info("principalAmount: ", principalAmount);

							//newscheduler.oldprincipalAmount = principalAmount;
							//sails.log.info("newloopPayAmount: ", newloopPayAmount);
							sails.log.info("biweeklyscheduleLoanAmount: ", biweeklyscheduleLoanAmount);
							sails.log.info("------------------------------------------------------");

							if(newloopPayAmount>0)
							{
								if (newscheduler.status == "OPENED" || newscheduler.status == 'CURRENT' || newscheduler.status == 'LATE' )
								{
									if(newscheduler.amount>0 && newloopPayAmount>0  )
									{
										orgscheduleAmount= newscheduler.amount;
										/*if(startBalanceAmount==0)
										{
										  startBalanceAmount = parseFloat(newscheduler.startBalanceAmount);
										}else{
										  startBalanceAmount =parseFloat(newscheduler.calstartBalanceAmount);
										}*/
										//startBalanceAmount = parseFloat(newscheduler.startBalanceAmount);
										newscheduleLoanAmount = parseFloat(biweeklyscheduleLoanAmount);
										newinterestAmount =  parseFloat(newloopPayAmount) * ( parseFloat(paymentManagementDetail.interestapplied) /100 );
										newinterestAmount  = parseFloat(newinterestAmount).toFixed(2);

										//sails.log.info("newscheduleLoanAmount: ", newscheduleLoanAmount);
										//sails.log.info("newloopPayAmount: ", newloopPayAmount);
										//sails.log.info("newinterestAmount: ", newinterestAmount);
										//sails.log.info("startBalanceAmount: ", startBalanceAmount);
										//sails.log.info("principalAmount: ", principalAmount);
										//sails.log.info("newscheduler.startBalanceAmount: ", newloopPayAmount);
										//sails.log.info("==============================================");

										//newscheduler.startBalanceAmount = parseFloat(newloopPayAmount).toFixed(2);

										newscheduler.calstartBalanceAmount = parseFloat(newloopPayAmount).toFixed(2);
										//sails.log.info("new calstartBalanceAmount: ", newscheduler.calstartBalanceAmount);


										//sails.log.info("newscheduler.startBalanceAmount11111: ", newscheduler.startBalanceAmount);
										//sails.log.info("==============================================");


										//298.45 > 284.59
										//if(newscheduler.amount > newloopPayAmount)

										var checktotalcheduleAmount = parseFloat(newloopPayAmount) +  parseFloat(newinterestAmount);
										if(newscheduler.amount > parseFloat(checktotalcheduleAmount))
										{
											//newprincipalAmount  = parseFloat(startBalanceAmount.toFixed(2));

											newprincipalAmount  = parseFloat(newloopPayAmount).toFixed(2);
											newscheduler.principalAmount = parseFloat(newprincipalAmount).toFixed(2);
											newscheduler.interestAmount = parseFloat(newinterestAmount).toFixed(2);

											newschedulerAmount	= parseFloat(newloopPayAmount) +  parseFloat(newinterestAmount);
											newscheduler.amount	= parseFloat(newschedulerAmount).toFixed(2);

											newloopPayAmount = 0;
										}
										else
										{
											newprincipalAmount = parseFloat(orgscheduleAmount) - parseFloat(newinterestAmount);
											newprincipalAmount  = parseFloat(newprincipalAmount).toFixed(2);

											newscheduler.principalAmount = parseFloat(newprincipalAmount).toFixed(2);
											newscheduler.interestAmount = parseFloat(newinterestAmount).toFixed(2);

											newloopPayAmount = parseFloat(newloopPayAmount) - parseFloat(newprincipalAmount);
											newloopPayAmount  = parseFloat(newloopPayAmount).toFixed(2);
										}

										//sails.log.info("principalAmount: ", newprincipalAmount);
										newscheduler.startBalanceAmount	= parseFloat(newloopPayAmount).toFixed(2);


									}
								}
							}
							else
							{
								if (newscheduler.status == "OPENED" || newscheduler.status == 'CURRENT' || newscheduler.status == 'LATE' )
								{
									 newscheduler.startBalanceAmount = 0;
									 newscheduler.principalAmount = 0;
									 newscheduler.interestAmount = 0;
									 newscheduler.paidprincipalAmount = 0;
									 newscheduler.paidinterestAmount = 0;
									 newscheduler.amount = 0;
									 newscheduler.status = 'PAID OFF';
								}
							}
					 });
				   }
				   else
				   {
					  paymentManagementDetail.paymentSchedule = paymentManagementDetail.paymentSchedule;
				   }

				   paymentManagementDetail.save(function(err) {

					   paymentManagementDetail.paymentSchedule = _.orderBy(paymentManagementDetail.paymentSchedule, ['status'], ['asc']);
						//-- to update payoffamount
						var finalpayoffAmount =0;
						var nextPaymentSchedule ='';
						_.forEach(paymentManagementDetail.paymentSchedule, function(finalscheduler) {
							if (finalscheduler.status == "OPENED" || finalscheduler.status == 'CURRENT' || finalscheduler.status == 'LATE' )
							{

							  if( finalscheduler.amount>0 && finalpayoffAmount==0 )
							  {
								  finalpayoffAmount = parseFloat(finalscheduler.startBalanceAmount)+parseFloat(finalscheduler.principalAmount);
								  finalpayoffAmount = parseFloat(finalpayoffAmount).toFixed(2);
								  nextPaymentSchedule = moment(finalscheduler.date).startOf('day').toDate();
							  }
							}
						});

					  sails.log.info("finalpayoffAmount:", finalpayoffAmount);

						 paymentManagementDetail.nextPaymentSchedule = nextPaymentSchedule;
						 //paymentManagementDetail.payOffAmount = finalpayoffAmount;

						 //-- Blocked above code and added new filed finalpayoffAmount to get remaining balance
						 paymentManagementDetail.finalpayoffAmount = finalpayoffAmount;
						 paymentManagementDetail.save(function(err) {

						  //sails.log.info("paymentManagementDetail full details:", paymentManagementDetail);

						   var story = paymentManagementDetail.story;
						   Transaction
						   .createTransactionForPull(story, transactionData, amount);

						   //Update only when payoffamount is zero
						   if(paymentManagementDetail.payOffAmount==0)
						   {
							  Story
							  .findOne({
								id: paymentManagementDetail.story
							  })
							  .then(function(storyDetail) {
								storyDetail.status = 9;
								storyDetail.save(function(err) {

								});
							  })
							  PaymentManagement.updateUserStatus(paymentManagementDetail);
						   }
						   deferred.resolve({paymentManagementDetail:paymentManagementDetail,initialschedulelist:initialpaymentSchedule});
					  });
				  });

			  });
		  });
	   });
   })
   .catch(function(err) {
      sails.log.error("#updateForMakeUserPaymentDetail::Error", err);
      deferred.reject(err);
   })
   return deferred.promise;
}


function createLoanPaymentSchedule( userscreenres ) {
	return Q.promise( function( resolve, reject ) {

		sails.log.info( "userscreenres : ", userscreenres );
		if( ! userscreenres.offerdata ){
			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		}

		const account = userscreenres.accounts;
		const principal = parseFloat( userscreenres.offerdata[ 0 ].financedAmount );
		const payment = parseFloat( userscreenres.offerdata[ 0 ].monthlyPayment );
		const interestRate = parseFloat( userscreenres.offerdata[ 0 ].interestRate );
		const term = parseInt( userscreenres.offerdata[ 0 ].term );
		const prevStart = 0;
		const maturityDate = moment().startOf( "day" ).add( term, "months" );
		const amortizationSchedule = MathExt.makeAmortizationSchedule( principal, payment, interestRate, term );
		const paymentSchedule = [];
		let totalInterest = 0;
		amortizationSchedule.schedule.forEach( ( item ) => {
			sails.log.info( "item", item );
			paymentSchedule.push( {
				monthcount: item.id,
				startBalanceAmount: item.startBalance,
				principalAmount: item.principal,
				interestAmount: item.interest,
				amount: item.payment,
				paidprincipalAmount: 0,
				paidinterestAmount: 0,
				lastpaidprincipalAmount: 0,
				lastpaidinterestAmount: 0,
				lastpaidcount: 0,
				date: moment().startOf( "day" ).add( item.id, "months" ).toDate(),
				lastpaiddate: moment().startOf( "day" ).add( ( item.id - 1 ), "months" ).toDate(),
				transaction: item.id,
				status: "OPENED"
			} );
			totalInterest += item.interest;
			sails.log.info( "totalInterest", totalInterest );
			sails.log.info( "paymentSchedule [ item.id ]", paymentSchedule [ item.id ] );
		} );
		sails.log.info( "totalInterest outside forloop ", totalInterest );
		return User.getNextSequenceValue( "loan" )
		.then( function( loanRefernceData ) {
			const loanRefernceDataValue = "LN_" + loanRefernceData.sequence_value;
			let usrid = "";
			if( (typeof userscreenres.user === 'string' || userscreenres.user instanceof String ) ) {
				usrid = userscreenres.user;
			} else {
				usrid = userscreenres.user.id;
			}
			Screentracking.onlyTodocount( usrid )
			.then( function( todoData ) {
				console.log( "todoData---", todoData );
				const obj = {
					user: userscreenres.user,
					maturityDate: maturityDate.toDate(),
					payOffAmount: principal,
					account: account,
					nextPaymentSchedule: moment().add( 1, "months" ).toDate(),
					achstatus: 4,
					loanReference: loanRefernceDataValue,
					interestapplied: interestRate,
					amount: principal + totalInterest,
					loantermcount: term,
					apr: loanApr,
					fundingfee: loanFundingFee,
					paymentSchedule: paymentSchedule,
					screentracking: userscreenres.id,
					consolidateaccount: userscreenres.consolidateaccount,
					practicemanagement: userscreenres.practicemanagement,
					oldprincipalstatus: 1,
					finalpayoffAmount: principal
				};

				PaymentManagement.create( obj )
				.then( function( paymentDet ) {
					// Need to update payment reference in userconsent table

					PaymentScheduleHistory.create( obj )
					.then( function( originalpaymentscedule ) {
						const consentCriteria = {
							user: userscreenres.user,
							paymentManagement: { $exists: false }
						};

						UserConsent.find( consentCriteria )
						.sort( "createdAt DESC" )
						.then( function( userConsentAgreement ) {
							_.forEach( userConsentAgreement, function(
								consentagreement
							) {
								UserConsent.updateUserConsentAgreement(
									consentagreement.id,
									userscreenres.user,
									paymentDet.id
								);

								/* userConsentAgreement.paymentManagement = paymentDet.id;
												userConsentAgreement.save(function(err) {
													if (err) {
													sails.log.error("UserConsent#createConsentForAgreements :: Error :: ", err);
													}
												});*/
							} );
							sails.log.info( "paymentDet data : ", paymentDet );
							return resolve( paymentDet );
						} )
						.catch( function( err ) {
							sails.log.error(
								"paymentFeeManagement UserConsent error::",
								err
							);
						} );
					} )
					.catch( function( err ) {
						sails.log.error( "paymentFeeManagement::", err );
						return reject( err );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "paymentFeeManagement::", err );
					return reject( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "paymentFeeManagement::", err );
				return reject( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "paymentFeeManagement::", err );
			return reject( err );
		} );
	} );
}
// function createLoanPaymentSchedule( userscreenres, stroydet ) {
// 	return Q.promise( function( resolve, reject ) {
// 		const productcriteria = { id: userscreenres.product };

// 		sails.log.info( "userscreenres : ", userscreenres );
// 		sails.log.info( "userscreenres.product : ", userscreenres.product );

// 		Productlist.findOne( productcriteria )
// 		.then( function( productdata ) {
// 			sails.log.info( "productdata : ", productdata );

// 			const productname = productdata.productname;

// 			let paymentSchedule = [];
// 			let counter = 1;
// 			let datecounter = 0;
// 			totalLoanAmount = 0;
// 			checktotalLoanAmount = 0;
// 			interestAmount = 0;
// 			principalAmount = 0;
// 			interestRate = 0;

// 			setloanTerm = 0;
// 			loanTerm = 0;
// 			loanApr = 0;
// 			loanFundingFee = 0;
// 			loanInterestRate = 0;
// 			loanBalanceAvail = 0;
// 			let startBalanceAmount = userscreenres.offerdata[ 0 ].financedAmount;

// 			const totalprincipalAmount = 0;
// 			const diffLoanAmount = 0;

// 			scheduleLoanAmount = 0;

// 			if( userscreenres.offerdata ) {
// 				const account = userscreenres.accounts;
// 				// var offerdata = userscreenres.offerdata;
// 				const offerdata = userscreenres.offerdata[ 0 ];

// 				sails.log.info( "offerdata=================== : ", offerdata );

// 				approvedAmount = offerdata.financedAmount;
// 				loanTerm = offerdata.paymentCycle;
// 				loanApr = offerdata.APR;
// 				loanFundingFee = 0;
// 				loanInterestRate = offerdata.ratePerCycle;

// 				const maturityDate = moment().startOf( "day" ).add( loanTerm, "months" );
// 				// const maturityDate = moment().startOf( "day" ).add( monthcount, "months" );

// 				// sails.log.info("productname: ",productname);

// 				// -- Need to change in future
// 				// if(productname!='State License')
// 				if( productname != "CA High Risk" ) {
// 					// sails.log.info("if: ");
// 					const loanYears = loanTerm / 12;

// 					/* sails.log.info("approvedAmount: ",approvedAmount);
// 					sails.log.info("loanInterestRate: ",loanInterestRate);
// 					sails.log.info("loanTerm: ",loanTerm);
// 					sails.log.info("loanYears: ",loanYears);*/

// 					PaymentManagement.biweeklyCalculate(
// 						approvedAmount,
// 						loanInterestRate,
// 						loanTerm
// 					).then( function( scheduleLoanAmount ) {
// 						// sails.log.info("scheduleLoanAmount: ",scheduleLoanAmount);
// 						scheduleLoanAmount = scheduleLoanAmount.toFixed( 2 );
// 						scheduleLoanAmount = parseFloat( scheduleLoanAmount );

// 						/* sails.log.info("-------------------------------------");
// 						 sails.log.info("approvedAmount: ",approvedAmount);
// 						 sails.log.info("loanInterestRate: ",loanInterestRate);*/
// 						// sails.log.info("scheduleLoanAmount: ",scheduleLoanAmount);

// 						PaymentManagement.biweeklyScheduleValues(
// 							approvedAmount,
// 							loanInterestRate,
// 							scheduleLoanAmount,
// 							loanTerm
// 						).then( function( paymentScheduleList ) {
// 							paymentSchedule = paymentScheduleList;
// 							// sails.log.info("paymentScheduleList: ",paymentScheduleList);
// 							// process.exit(1);
// 						} );
// 					} );
// 				} else {
// 					sails.log.info( "else: " );
// 					sails.log.info( "loanTerm : ", loanTerm );
// 					sails.log.info( "loanInterestRate : ", loanInterestRate );

// 					// process.exit(1);

// 					// var loanInterestRate= 16.99;
// 					// var loanTerm= 12;

// 					for( let i = 1; i <= loanTerm; i++ ) {
// 						// sails.log.info('i : ', i);

// 						// Monthly payment = [ r + r / ( (1+r) ^ months -1) ] x principal loan amount
// 						const decimalRate = loanInterestRate / 100 / 12;
// 						const xpowervalue = decimalRate + 1;
// 						const ypowervalue = loanTerm;
// 						const powerrate_value = Math.pow( xpowervalue, ypowervalue ) - 1;

// 						/* sails.log.info('decimalRate : ', decimalRate);
// 						sails.log.info('powerrate_value : ', powerrate_value);
// 						sails.log.info('approvedAmount : ', approvedAmount);*/

// 						scheduleLoanAmount =
// 							( decimalRate + decimalRate / powerrate_value ) * approvedAmount;
// 						scheduleLoanAmount = scheduleLoanAmount.toFixed( 2 );
// 						scheduleLoanAmount = parseFloat( scheduleLoanAmount );

// 						if( checktotalLoanAmount == 0 ) {
// 							checktotalLoanAmount = scheduleLoanAmount * loanTerm;
// 						}

// 						// Calculate interest
// 						interestAmount = startBalanceAmount * decimalRate;

// 						// Calculate prinicpal amount
// 						principalAmount = scheduleLoanAmount - interestAmount;

// 						// sails.log.info('principalAmount:::::: ', principalAmount);
// 						// sails.log.info('interestAmount:::::: ', interestAmount);

// 						// Calculate new start balance amount
// 						showstartBalanceAmount = startBalanceAmount;
// 						startBalanceAmount = startBalanceAmount - principalAmount;

// 						// financedAmount sum
// 						totalLoanAmount = totalLoanAmount + scheduleLoanAmount;

// 						if( i == loanTerm ) {
// 							if( checktotalLoanAmount < totalLoanAmount ) {
// 								deductLoanAmount = totalLoanAmount - checktotalLoanAmount;
// 								scheduleLoanAmount = scheduleLoanAmount - deductLoanAmount;
// 								scheduleLoanAmount = parseFloat( scheduleLoanAmount.toFixed( 2 ) );
// 							}

// 							if( checktotalLoanAmount > totalLoanAmount ) {
// 								addLoanAmount = checktotalLoanAmount - totalLoanAmount;
// 								scheduleLoanAmount = scheduleLoanAmount + addLoanAmount;
// 								scheduleLoanAmount = parseFloat( scheduleLoanAmount.toFixed( 2 ) );
// 							}

// 							if( principalAmount > showstartBalanceAmount ) {
// 								showstartBalanceAmount = principalAmount;
// 							}

// 							if( principalAmount < showstartBalanceAmount ) {
// 								principalAmount = showstartBalanceAmount;
// 							}
// 						}

// 						showstartBalanceAmount = parseFloat( showstartBalanceAmount );
// 						principalAmount = parseFloat( principalAmount );
// 						interestAmount = parseFloat( interestAmount );

// 						showstartBalanceAmount = showstartBalanceAmount.toFixed( 2 );
// 						principalAmount = principalAmount.toFixed( 2 );
// 						interestAmount = interestAmount.toFixed( 2 );

// 						paymentSchedule.push( {
// 							monthcount: i,
// 							startBalanceAmount: showstartBalanceAmount,
// 							principalAmount: principalAmount,
// 							interestAmount: interestAmount,
// 							amount: scheduleLoanAmount,
// 							paidprincipalAmount: 0,
// 							paidinterestAmount: 0,
// 							lastpaidprincipalAmount: 0,
// 							lastpaidinterestAmount: 0,
// 							lastpaidcount: 0,
// 							date: moment()
// 							.startOf( "day" ).add( counter, "months" ).toDate(),
// 							lastpaiddate: moment()
// 							.startOf( "day" )
// 							.add( datecounter, "months" )
// 							.toDate(),
// 							transaction: i,
// 							status: "OPENED"
// 						} );
// 						datecounter++;
// 						counter++;
// 					}
// 				}

// 				sails.log.info( "paymentSchedule : ", paymentSchedule );

// 				return User.getNextSequenceValue( "loan" )
// 				.then( function( loanRefernceData ) {
// 					const loanRefernceDataValue = "LN_" + loanRefernceData.sequence_value;
// 					let usrid = "";
// 					if( (typeof userscreenres.user === 'string' || userscreenres.user instanceof String ) ) {
// 						usrid = userscreenres.user;
// 					} else {
// 						usrid = userscreenres.user.id;
// 					}

// 					Screentracking.onlyTodocount( usrid )
// 					.then( function( todoData ) {
// 						console.log( "todoData---", todoData );
// 						const obj = {
// 							user: userscreenres.user,
// 							maturityDate: maturityDate.toDate(),
// 							payOffAmount: approvedAmount,
// 							account: account,
// 							nextPaymentSchedule: moment()
// 							.add( 1, "months" )
// 							.toDate(),
// 							achstatus: 0,
// 							loanReference: loanRefernceDataValue,
// 							interestapplied: loanInterestRate,
// 							amount: checktotalLoanAmount,
// 							loantermcount: loanTerm,
// 							apr: loanApr,
// 							fundingfee: loanFundingFee,
// 							paymentSchedule: paymentSchedule,
// 							productname: productname,
// 							product: userscreenres.product,
// 							screentracking: userscreenres.id,
// 							consolidateaccount: userscreenres.consolidateaccount,
// 							practicemanagement: userscreenres.practicemanagement,
// 							oldprincipalstatus: 1,
// 							finalpayoffAmount: approvedAmount
// 						};

// 						PaymentManagement.create( obj )
// 						.then( function( paymentDet ) {
// 							// Need to update payment reference in userconsent table

// 							PaymentScheduleHistory.create( obj )
// 							.then( function( originalpaymentscedule ) {
// 								const consentCriteria = {
// 									user: userscreenres.user.id,
// 									loanupdated: 1,
// 									paymentManagement: { $exists: false }
// 								};

// 								UserConsent.find( consentCriteria )
// 								.sort( "createdAt DESC" )
// 								.then( function( userConsentAgreement ) {
// 									_.forEach( userConsentAgreement, function(
// 										consentagreement
// 									) {
// 										UserConsent.updateUserConsentAgreement(
// 											consentagreement.id,
// 											userscreenres.user,
// 											paymentDet.id
// 										);

// 										/* userConsentAgreement.paymentManagement = paymentDet.id;
// 														userConsentAgreement.save(function(err) {
// 														  if (err) {
// 															sails.log.error("UserConsent#createConsentForAgreements :: Error :: ", err);
// 														  }
// 														});*/
// 									} );
// 									sails.log.info( "paymentDet data : ", paymentDet );
// 									return resolve( paymentDet );
// 								} )
// 								.catch( function( err ) {
// 									sails.log.error(
// 										"paymentFeeManagement UserConsent error::",
// 										err
// 									);
// 								} );
// 							} )
// 							.catch( function( err ) {
// 								sails.log.error( "paymentFeeManagement::", err );
// 								return reject( err );
// 							} );
// 						} )
// 						.catch( function( err ) {
// 							sails.log.error( "paymentFeeManagement::", err );
// 							return reject( err );
// 						} );
// 					} )
// 					.catch( function( err ) {
// 						sails.log.error( "paymentFeeManagement::", err );
// 						return reject( err );
// 					} );
// 				} )
// 				.catch( function( err ) {
// 					sails.log.error( "paymentFeeManagement::", err );
// 					return reject( err );
// 				} );
// 			} else {
// 				return reject( {
// 					code: 500,
// 					message: "INTERNAL_SERVER_ERROR"
// 				} );
// 			}
// 		} );
// 	} );
// }

function getLoanPaymentSchedule(userscreenres){

 return Q.promise(function(resolve, reject) {

			//sails.log.info("userscreenres.offerdata: ",userscreenres.offerdata);


			var paymentSchedule = [];
			var counter = 1;
			var datecounter = 0;
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
			//var startBalanceAmount = userscreenres.offerdata[0].financedAmount;

			var totalprincipalAmount = 0
			var diffLoanAmount = 0;


			//-- Added to block the view incomplete detail page error in admin
			if(userscreenres.offerdata)
			{
				if(userscreenres.offerdata.length>0)
				{
					var account = userscreenres.accounts;
					var offerdata = userscreenres.offerdata[0];
					var startBalanceAmount = userscreenres.offerdata[0].financedAmount;

					/*sails.log.info("offerdata: ",offerdata);
					return 1;*/

					approvedAmount = offerdata.financedAmount;
					loanTerm = offerdata.loanTerm;
					loanApr = offerdata.apr;
					loanFundingFee = 0;
					loanInterestRate = offerdata.interestRate;

					var maturityDate = moment().startOf('day').add(loanTerm, 'months');

					var  loanYears = loanTerm;

					sails.log.info("approvedAmount: ",approvedAmount);
					sails.log.info("loanInterestRate: ",loanInterestRate);
					sails.log.info("loanTerm: ",loanTerm);
					sails.log.info("loanYears: ",loanYears);

					PaymentManagement.biweeklyCalculate(approvedAmount,loanInterestRate,loanYears)
					.then(function(scheduleLoanAmount) {

						//sails.log.info("scheduleLoanAmount: ",scheduleLoanAmount);

						scheduleLoanAmount = scheduleLoanAmount.toFixed(2);
						scheduleLoanAmount = parseFloat(scheduleLoanAmount);

						/* sails.log.info("-------------------------------------");
						 sails.log.info("approvedAmount: ",approvedAmount);
						 sails.log.info("loanInterestRate: ",loanInterestRate);
						 sails.log.info("scheduleLoanAmount: ",scheduleLoanAmount);*/

						 PaymentManagement.biweeklyScheduleValues(approvedAmount,loanInterestRate,scheduleLoanAmount,loanYears)
						 .then(function(paymentScheduleList) {
							//sails.log.info("paymentScheduleList: ",paymentScheduleList);
							return resolve(paymentScheduleList);
						});
					});
				}
				else
				{
					var paymentScheduleList=[];
					return resolve(paymentScheduleList);
				}
			}
			else
			{
				return reject({
				  code: 500,
				  message: 'INTERNAL_SERVER_ERROR'
				});
			}
  });
}

function biweeklyCalculate(amount,interestRate,loanYears){
  return Q.promise(function(resolve, reject) {
	//var f_npr = loanYears * 26;
	/*var f_npr = loanYears ;
	var f_pmt_amt = 0;
	var f_i = interestRate;
	var powvalue = 1;

	if(f_i == 0)
	{
  		 f_pmt_amt = prin / f_npr;
	}
	else
	{
	   f_i = f_i / 100;
	  // f_i /= 26;
	   for (var j = 0; j < f_npr; j++) {
		  powvalue = powvalue * (1 + f_i);
	   }
   		f_pmt_amt = (amount * powvalue * f_i) / (eval(powvalue) - eval(1));
	}
	//sails.log.info("f_pmt_amt: ",f_pmt_amt);
	return resolve(f_pmt_amt)*/

	//-- Blocked above code to monthly concept on Oct 11, 2018 for patientfi
	var loanmonth               = loanYears;
	var decimalRate 			= 	(interestRate/ 100) / 12;
	var xpowervalue				=	decimalRate + 1;
	var ypowervalue 			=	loanmonth;
	var powerrate_value			=	Math.pow(xpowervalue,ypowervalue) - 1;
	var monthlyPayment 			=	( decimalRate + ( decimalRate / powerrate_value ) ) * amount;
	monthlyPayment 				=	parseFloat(monthlyPayment.toFixed(2));
	return resolve(monthlyPayment)
  });
}

function biweeklyScheduleValues(amount,interestRate,scheduleamount,loanYears){
	return Q.promise(function(resolve, reject) {

	  var prin = amount;
      var cnt = 0;
      var int_port = 0;
      var prin_port = 0;
      var accum_int = 0;
      var accum_prin = 0;
      var dec_rate = interestRate / 100;
	  //var dec_rate = interestRate / 100 *  loanYears;
      var pmt = scheduleamount;
	  var v_biwk_pmt = scheduleamount;
	  var pmt_sched = [];
	  var totalMonths = loanYears ;

	  var totaltopay = pmt * totalMonths;

	  while(cnt < totalMonths)
	  {
		  cnt += 1;

		  if(v_biwk_pmt < (scheduleamount * loanYears))
		  {
            int_port = Math.round(prin * dec_rate * 100) / 100;
            prin_port = parseFloat(v_biwk_pmt) - parseFloat(int_port);
            prin = parseFloat(prin) - parseFloat(prin_port);
			//sails.log.info("if prin: ",prin);

         }
		 else
		 {
            int_port = Math.round(prin * dec_rate * 100) / 100;
            prin_port = prin;
            pmt = parseFloat(prin) + parseFloat(int_port);
            prin = 0;
			//sails.log.info("else prin: ",prin);
         }

		 accum_int += int_port;
         accum_prin += prin_port;

		 if(cnt > 1){
			 var startdate = moment(previousstartdate).startOf('day').add(14, 'days').toDate();
			 var formatedate = moment(previousstartdate).startOf('day').add(14, 'days').format('ddd, MMM Do YYYY');
			 var lastpaiddate = moment(previouslastpaiddate).startOf('day').toDate();
		 }else{
			 var startdate = moment().startOf('day').add(14, 'days').toDate();
			 var formatedate = moment().startOf('day').add(14, 'days').format('ddd, MMM Do YYYY');
			 var lastpaiddate = moment().startOf('day').toDate();
		 }
		 var previousstartdate = startdate;
		 var previouslastpaiddate = lastpaiddate;


		if(cnt==totalMonths){
			if(prin>0)
			{
				/*sails.log.info("ener final loop: ",cnt);
				sails.log.info("prin: ",prin);
	  			sails.log.info("prin_port: ",prin_port);
	 		    sails.log.info("int_port: ",int_port);
				sails.log.info("pmt: ",pmt);*/

				prin_port = parseFloat(prin_port) + parseFloat(prin);
				pmt = parseFloat(prin_port) + parseFloat(int_port);
				prin=0;
			}

			if(prin<0)
			{
				prin=0;
			}

			if(prin_port<prin)
			{
				prin_port =  prin;
			}

		}

		 pmt_sched.push({
			monthcount: cnt,
			startBalanceAmount: prin.toFixed(2),
			principalAmount:prin_port.toFixed(2),
			interestAmount: int_port.toFixed(2),
			amount: pmt.toFixed(2),
			paidprincipalAmount:0,
			paidinterestAmount:0,
			lastpaidprincipalAmount:0,
			lastpaidinterestAmount:0,
			interestapplied: loanInterestRate,
			lastpaidcount:0,
			date: startdate,
			formatedate: formatedate,
			lastpaiddate: lastpaiddate,
			transaction:cnt,
			status: 'OPENED'
		});

		/* sched_ms += two_wks;
         sched_date.setTime(sched_ms);*/


	  }

	 // sails.log.info("pmt_sched : ",pmt_sched);
	 // process.exit(1);

	  return resolve(pmt_sched)

	});
}
function generateNewScheduleAction(paymentmanagementdata,scheduleAmount){
	return Q.promise(function(resolve, reject) {
		/*var vikingRequestCriteria = {userId:paymentmanagementdata.user.id,payment_id:paymentmanagementdata.id,lenderType:'credit'};
		sails.log.info(vikingRequestCriteria);
		VikingRequest
		.findOne(vikingRequestCriteria)
		.then(function(vikingRequestResult){*/

			//sails.log.info("vikingRequestResult",vikingRequestResult);
			/*if(vikingRequestResult){
				 var now = moment(new Date(vikingRequestResult.createdAt)).tz("America/Los_Angeles").format('HH:mm');
				 var end = "13:45";


				if (now.toString() <= end.toString()) {
					var currentScheduleDate = moment(vikingRequestResult.createdAt).tz("America/Los_Angeles").add(1, 'days');
				}else{
					var currentScheduleDate = moment(vikingRequestResult.createdAt).tz("America/Los_Angeles").add(2, 'days');
				}
				var scheduleDateAdd14 = currentScheduleDate;
			}else{
				sails.log.info("InvalidData------------",vikingRequestCriteria);
			}*/

			if (moment().tz("America/Los_Angeles").isBefore('13:45:00')) {
				var currentScheduleDate = moment().tz("America/Los_Angeles").add(1, 'days');
			}else{
				var currentScheduleDate = moment().tz("America/Los_Angeles").add(2, 'days');
			}


			var scheduleDateAdd14 = currentScheduleDate;

			//sails.log.info("paymentmanagementdata.paymentSchedule",paymentmanagementdata.paymentSchedule);

			paymentmanagementdata.paymentSchedule = _.orderBy(paymentmanagementdata.paymentSchedule, ['monthcount'], ['asc']);
			var i = 1;
			_.forEach(paymentmanagementdata.paymentSchedule, function(paymentSchedule) {

					scheduleDateAdd14 = moment(scheduleDateAdd14).tz("America/Los_Angeles").add(14, 'days');
					paymentSchedule.date = moment(scheduleDateAdd14).format();
					paymentSchedule.formatedate = moment(scheduleDateAdd14).format('ddd, MMM Do YYYY');


				paymentSchedule.status = 'OPENED';
				/*if(paymentSchedule.amount == 0){
					paymentSchedule.amount = scheduleAmount.toFixed(2);
				}*/
				if(i == paymentmanagementdata.paymentSchedule.length){
					return resolve({newSchedule:paymentmanagementdata.paymentSchedule});
				}
				i++;

			});
		/*});*/
	});
}

//-- Account Detail Array
function userAccountInfoDetail(accountDataArray){
	return Q.promise(function(resolve, reject) {

	  var loopcounterlength = accountDataArray.length,
	  accountloopcounter = 0;

	  _.forEach(accountDataArray, function(accountInfoData) {

			if ("undefined" !== typeof accountInfoData.institutionType && accountInfoData.institutionType!='' && accountInfoData.institutionType!=null)
			{
				 var optionscriteria ={
					institutionType: accountInfoData.institutionType
				  };

				  Institution
				  .findOne(optionscriteria)
				  .then(function (institution) {

					 if(!institution)
					 {
						 accountInfoData.institutionName = 'Other Bank';
					 }
					 else
					 {
						 accountInfoData.institutionName = institution.institutionName;
					 }
					 accountloopcounter++;

					 if (accountloopcounter == loopcounterlength) {
						return resolve(accountDataArray);
					 }
				  });
			}
			else
			{
				accountInfoData.institutionName = 'Other Bank';
				accountloopcounter++;
				if (accountloopcounter == loopcounterlength) {
					return resolve(accountDataArray);
				}
			}
	  });
	});
}


//-- Repull payent from admin
function adminrepullpayment(paymentID,rowID,reqdata,selectScheduleId){

	return Q.promise(function(resolve, reject) {


		if( paymentID && ("undefined" !== typeof selectScheduleId && selectScheduleId!='' && selectScheduleId!=null ))
		{

			//sails.log.info("uniqueScheduleId1111111111:",selectScheduleId);

			var criteria = {
				id: paymentID
		  	};

		  	PaymentManagement
			.findOne(criteria)
			.populate('user')
			.populate('account')
			.then(function(paymentmanagementdata) {

				if(paymentmanagementdata)
				{
					//if(paymentmanagementdata.achstatus==1 && paymentmanagementdata.transferstatus==2)
					if(paymentmanagementdata.achstatus==1)
		            {
						if(paymentmanagementdata.blockmakepayment==0)
						{
							var storyID = paymentmanagementdata.story;
							var userID = paymentmanagementdata.user.id;
							var accountID  = paymentmanagementdata.account.id;

							var accountcriteria = {
								user: userID,
								id:accountID
							};

							Account
							.findOne(accountcriteria)
							.sort("createdAt DESC")
							.then(function(accountDetailsData) {

								if(accountDetailsData)
								{
										var amountPull =0;
										var logreqdata={};
										_.forEach(paymentmanagementdata.paymentSchedule, function(schedule , key) {

											if(rowID==key)
											{
												amountPull = parseFloat(schedule.amount);
											}
										});

										if(parseFloat(amountPull)>0)
										{
											//--pull plaid before payment
											Repullbankaccount.checkLatestPlaidRepull(accountID,amountPull,'Adminrepullpayment')
											.then(function(repullresponse) {

												sails.log.info("repullresponse:",repullresponse);

												if(repullresponse.status==200)
												{

													//sails.log.info("uniqueScheduleId2222222222:",selectScheduleId);

													VikingRequest
													.createRepullSchedule(userID,paymentmanagementdata,amountPull,selectScheduleId)
													.then(function(chargeoffres){


														if(chargeoffres.code==200)
														{

															   //sails.log.info("chargeoffres:",chargeoffres);
															    var loanID = paymentmanagementdata.loanReference;
																var apiType='bankaccount';
																var ScheduleData = [];
																var paymentSchedule = paymentmanagementdata.paymentSchedule;
																//sails.log.info("paymentSchedule:",paymentSchedule);

																 scheduleData = _.filter(paymentSchedule, { 'uniqueScheduleId': selectScheduleId });

																sails.log.info("ScheduleData:",scheduleData);

																if (!paymentmanagementdata.usertransactions)
																{
																  paymentmanagementdata.usertransactions = [];
																}
																paymentmanagementdata.status = 'OPENED';
																paymentmanagementdata.blockmakepayment =0;
																paymentmanagementdata.usertransferstatus =1;
																paymentmanagementdata.usertransactions.push({
																	  amount: amountPull,
																	  loanID: selectScheduleId,
																	  status:1,
																	  transactionId: chargeoffres.transactionid,
																	  transactionType:'Manual Repull',
																	  apiType:apiType,
																	  accountName: accountDetailsData.accountName,
																	  accountNumberLastFour: accountDetailsData.accountNumberLastFour,
																	  accountId: accountID,
																	  initialschedule: scheduleData,
																	  date: new Date()
																});

																//sails.log.info("paymentmanagementdata.usertransactions:",paymentmanagementdata.usertransactions);

																paymentmanagementdata.save(function(err) {

																	//sails.log.info("1111111111111111111111:");

																	var statusPaidLength = 0;
																	var loanInterestRate=0;
																	if(paymentmanagementdata.interestapplied)
																	{
																		loanInterestRate = paymentmanagementdata.interestapplied;
																	}

																	//sails.log.info("22222222222222222222:");
																	_.forEach(paymentmanagementdata.paymentSchedule, function(scheduler,keyvalue) {

																		if(rowID==keyvalue)
																		{
																			if(scheduler.amount>0)
																			{
																				scheduler.paidprincipalAmount = parseFloat(scheduler.paidprincipalAmount)+parseFloat(scheduler.principalAmount);
																				scheduler.paidprincipalAmount = parseFloat(scheduler.paidprincipalAmount.toFixed(2));

																				scheduler.paidinterestAmount = parseFloat(scheduler.paidinterestAmount)+parseFloat(scheduler.interestAmount);
																				scheduler.paidinterestAmount = parseFloat(scheduler.paidinterestAmount.toFixed(2));

																				scheduler.lastpaiddate = moment().startOf('day').toDate();
																				scheduler.lastpaidcount = 1;

																				paymentmanagementdata.finalpayoffAmount = parseFloat(paymentmanagementdata.finalpayoffAmount )- parseFloat(scheduler.principalAmount);

																				if(paymentmanagementdata.finalpayoffAmount<0)
																				{
																					paymentmanagementdata.finalpayoffAmount = 0;
																				}

																				scheduler.status = 'PAID OFF';
																				scheduler.amount = 0;

																				paymentmanagementdata.logs.push({
																				 message: 'Repull Payment has been intiated',
																				 date: new Date()
																				});
																			}
																		 }

																		 if (scheduler.status == 'PAID OFF') {
																			statusPaidLength = statusPaidLength + 1
																		 }
																	 });

																	//sails.log.info("333333333333333333333333333333:");

																	 if (statusPaidLength === paymentmanagementdata.paymentSchedule.length)
																	 {
																		 paymentmanagementdata.status = 'PAID OFF';
																		 if (paymentmanagementdata.finalpayoffAmount < 0)
																		 {
																			paymentmanagementdata.finalpayoffAmount = 0;
																		 }

																		 paymentmanagementdata.paymentSchedule = _.orderBy(paymentmanagementdata.paymentSchedule, ['status'], ['asc']);
																		 paymentmanagementdata.save();

																		 Story
																		 .findOne({
																			id: paymentmanagementdata.story
																		  })
																		  .then(function(storyDetail) {
																			storyDetail.status = 9;
																			storyDetail.save(function(err) {
																			  if (err) {
																				sails.log.error("Story#updateStatus :: Error :: ", err);
																			  }
																			});
																		  })
																	 }
																	 else
																	 {
																		 paymentmanagementdata.paymentSchedule = _.orderBy(paymentmanagementdata.paymentSchedule, ['status'], ['asc']);
																		 paymentmanagementdata.save();
																	 }

																	 var messageObjData = {
																		user: userID,
																		message: 'Thanks for your loan repayment for' + ' ' + '$' + amountPull + ' from target fast cash. ' + '\n\nThanks\nTeam Target Fast Cash',
																		subject: 'Loan repayment for $'+amountPull,
																		referenceId: Utils.generateReferenceId()
																	};

																	sails.log.info("messageObjData", messageObjData);

																	//Log Activity
																	var modulename = 'Loan repull payment from admin';
																	var modulemessage = 'Loan repull payment success from admin for loan reference: '+paymentmanagementdata.loanReference+' ($'+amountPull+')';
																	logreqdata.achlog = 1;
																	logreqdata.payID= paymentID;
																	logreqdata.logdata=paymentmanagementdata;

																	//--Ach comments
																	var adminemail = reqdata.user.email;
																	var todaydate= moment().startOf('day').format('LLL');
																	var achmodulename = 'Loan repull payment from admin';
																	var achmodulemessage = 'Successful loan repull payment from admin by '+adminemail+' for loan reference: '+paymentmanagementdata.loanReference+' ($'+amountPull+') <br>Date: '+todaydate;

																	var allParams={
																		 subject : achmodulename,
																		 comments : achmodulemessage,
																		 achviewtype:'admin'
																	};

																	Messages.create(messageObjData)
																	.then(function(message) {
																		//Email service for loan repayment success
																		var emailType='success';
																		var type='makeRepayment';

																		var criteria = {id: userID};
																		User.findOne(criteria)
																		.then(function(userdata) {

																			EmailService.sendLoanRepaymentEmail(userdata, amountPull, emailType, type, paymentmanagementdata.story);
																			//-- Insert log details
																			Logactivity.registerLogActivity(logreqdata,modulename,modulemessage);
																			Achcomments.createAchComments(allParams,paymentID);

																			return resolve({
																				status: 200,
																				message: "Successfully repull payment from admin"
																			});
																		})
																	})
																	.catch(function(err) {

																		//-- Insert log details
																		Logactivity.registerLogActivity(logreqdata,modulename,modulemessage);
																		Achcomments.createAchComments(allParams,paymentID);

																		return resolve({
																			status: 200,
																			message: "Successfully repull payment from admin"
																		});
																	});
																});

														}
														else
														{
															if (!paymentmanagementdata.usertransactions)
															{
															  paymentmanagementdata.usertransactions = [];
															}

															//-- Added for ticket no 920
															paymentmanagementdata.usertransactions.push({
															  amount: amountPull,
															  loanID: loanID,
															  status:3,
															  transactionId: '',
															  transactionType:'Manual Repull',
															  apiType:apiType,
															  accountName: accountDetailsData.accountName,
															  accountNumberLastFour: accountDetailsData.accountNumberLastFour,
															  accountId: accountID,
															  initialschedule: paymentmanagementdata.paymentSchedule,
															  date: new Date()
															});
															paymentmanagementdata.blockmakepayment =0;
															paymentmanagementdata.save(function(err) {

															});

															//Log Activity
															var modulename = 'Loan repull payment from admin';
															var modulemessage = 'Loan repull repayment failure from admin for loan reference: '+paymentmanagementdata.loanReference+' ($'+amountPull+').';
															logreqdata.achlog = 1;
															logreqdata.payID= paymentID;
															logreqdata.logdata=paymentmanagementdata;
															Logactivity.registerLogActivity(logreqdata,modulename,modulemessage);

															return resolve({
																status: 401,
																message: "Loan repull payment failed!"
															});
														}



													});

												}
												else
												{
													 sails.log.error("adminrepullpayment:: Insufficient Balance.");

													 if(repullresponse.status==300)
													 {
														   var apperrormessage = repullresponse.message;
													 }
													 else
													 {
														  var apperrormessage ="Unable to repull plaid details for the loan!";
													 }

													 return resolve({
														status: 402,
														message: "Insufficient Balance"
													 });
												}
											 }).catch(function(err) {

													return resolve({
														status: 402,
														message: "Insufficient Balance"
													});
											 });
										}
										else
										{
											sails.log.error("adminrepullpayment:: Invalid schedule amount.");
											return resolve({
												status: 400,
												message: "Invalid schedule amount."
											});
										}


								}
								else
								{
									sails.log.error("adminrepullpayment:: Unable to fetch account details.");
									return resolve({
										status: 400,
										message: "Invalid Account. You can repay loan amount later!"
									});
								}
							})
							.catch(function(err) {
								sails.log.error("adminrepullpayment:: Unable to fetch account details:: ", err);
								return resolve({
									status: 400,
									message: "Invalid Account. You can repay loan amount later!"
								});
							 });
						}
						else
						{
							sails.log.error("adminrepullpayment:: Loan blocked for repayments:: ");
							return resolve({
									status: 400,
									message: "You can repull loan amount later due to technical reason!"
							});
						}
					}
					else
				    {
					  sails.log.error("adminrepullpayment:: Your loan is not funded yet.");
					  return resolve({
						status: 400,
						message: "Loan is not funded yet. You can repull loan amount later!"
					  });
				    }
				}
				else
				{
					sails.log.error("adminrepullpayment:: Invalid loan details.");
					return resolve({
						status: 400,
						message: "Invalid loan details."
					});
				}
			})
			.catch(function(err) {
				sails.log.error("adminrepullpayment:: ", err);
				return resolve({
					status: 400,
					message: "Invalid loan details."
				});
			});
		}
		else
		{
			sails.log.error("adminrepullpayment:: Invalid loan details");
			return resolve({
				status: 400,
				message: "Invalid loan details."
			});
		}
	});
}

function monthlyScheduleCalculate(financedAmount,interestRate,loanTerm){

	return Q.promise(function(resolve, reject) {

			//var loanTerm = parseInt(loanTerm);
			//var interestRate = parseFloat(interestRate);
			//var financedAmount = parseFloat(financedAmount);

			sails.log.info("loanTerm",loanTerm);
			sails.log.info("interestRate",interestRate);
			sails.log.info("financedAmount",financedAmount);

			if(financedAmount>0)
			{
				var decimalRate = (interestRate/ 100) / 12;
				var xpowervalue = decimalRate + 1;
				var ypowervalue = loanTerm;
				var powerrate_value= Math.pow(xpowervalue,ypowervalue) - 1;
				var monthlyPayment = ( decimalRate + ( decimalRate / powerrate_value ) ) * financedAmount;
				monthlyPayment = parseFloat(monthlyPayment.toFixed(2));

				sails.log.info("monthlyPayment",monthlyPayment);

				//Apr calculation
				var effectiveRate = 0;
				var effective_powerrate_value= Math.pow(xpowervalue,12) - 1;
				var effectiveRate = effective_powerrate_value *100;
				effectiveRate = parseFloat(effectiveRate.toFixed(2));

				/*Screentracking.aprRateCalculator(loanTerm,monthlyPayment,financedAmount)
				.then(function (effectiveRateValue) {

					var effectiveRate = 12*effectiveRateValue*100;
					effectiveRate = parseFloat(effectiveRate.toFixed(2));

					var responseData={
						code:200,
						monthlyPayment:monthlyPayment,
						aprRate:effectiveRate
					}
					sails.log.info("responseData111",responseData);

					return resolve(responseData);
				})
				.catch(function (err) {

					sails.log.error("monthlyScheduleCalculate err",err);

					var responseData={
						code:400,
						monthlyPayment:monthlyPayment,
						aprRate:0
					}
					return resolve(responseData);
				})*/

				var responseData={
						code:200,
						monthlyPayment:monthlyPayment,
						aprRate: effectiveRate
						//aprRate:35
				}
				sails.log.info("responseData111",responseData);

				return resolve(responseData);
			}
			else
			{

				var responseData={
					code:400,
					monthlyPayment:0,
					aprRate:0
				}
				return resolve(responseData);
			}
	});
}

function loopFinalPayNextSchedule(paymentManagement){
	return Q.promise(function(resolve, reject) {
		var finalpayoffAmount =0;
		var nextPaymentSchedule ='';
		var j = 1;
		_.forEach(paymentManagement.paymentSchedule, function(finalscheduler) {
			if (finalscheduler.status == "OPENED" || finalscheduler.status == 'CURRENT' || finalscheduler.status == 'LATE' )
			{
			  if( finalscheduler.amount>0 && finalpayoffAmount==0 )
			  {
				  //finalpayoffAmount = parseFloat(finalscheduler.startBalanceAmount)+parseFloat(finalscheduler.principalAmount);
				  finalpayoffAmount = parseFloat(finalscheduler.startBalanceAmount);
				  finalpayoffAmount = parseFloat(finalpayoffAmount).toFixed(2);
				  nextPaymentSchedule = moment(finalscheduler.date).startOf('day').toDate();
			  }
			}
			if(j == paymentManagement.paymentSchedule.length){
				return resolve({finalpayoffAmount:finalpayoffAmount,nextPaymentSchedule:nextPaymentSchedule});
			}
			j++;
		});
	});

}

function loopPaidoffScheduleAction(paymentManagement){
	return Q.promise(function(resolve, reject) {
		var lastpaidprincipalAmount =0;
		var lastpaidinterestAmount =0;
		var statusPaidLength = 0;
		var i = 1;

		_.forEach(paymentManagement.paymentSchedule, function(schedule) {

			if (moment().startOf('day').toDate().getTime() == moment(schedule.date).startOf('day').toDate().getTime())
			{
				if(schedule.amount>0)
				{
					lastpaidprincipalAmount    = schedule.paidprincipalAmount;
					lastpaidinterestAmount    = schedule.paidinterestAmount;

					schedule.status = 'PAID OFF';
					schedule.amount = 0;

					schedule.paidprincipalAmount = parseFloat(schedule.paidprincipalAmount)+parseFloat(schedule.principalAmount);
					schedule.paidprincipalAmount = parseFloat(schedule.paidprincipalAmount.toFixed(2));

					schedule.paidinterestAmount = parseFloat(schedule.paidinterestAmount)+parseFloat(schedule.interestAmount);
					schedule.paidinterestAmount = parseFloat(schedule.paidinterestAmount.toFixed(2));

					schedule.lastpaidprincipalAmount = parseFloat(lastpaidprincipalAmount.toFixed(2));
					schedule.lastpaidinterestAmount =  parseFloat(lastpaidinterestAmount.toFixed(2));

					schedule.lastpaiddate = moment().startOf('day').toDate();
					schedule.lastpaidcount = 1;

					paymentManagement.logs.push({
					 message: 'Transfer has been intiated',
					 date: new Date()
				   });
				}
			 }

			 if (schedule.status == 'PAID OFF') {
			  statusPaidLength = statusPaidLength + 1
			 }

			 if(i == paymentManagement.paymentSchedule.length){
				return resolve({paymentFullData:paymentManagement,statusPaidLength:statusPaidLength});
			 }
			 i++;
		 });
	});
}
