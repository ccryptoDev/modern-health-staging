/**
 * Screentracking.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q');
var moment = require('moment');
var shortid = require('shortid');
var  _ = require('lodash');

var in_array = require('in_array');

module.exports = {

  attributes: {
	practicemanagement: { model: "PracticeManagement" },
    lastScreenName: {
      type: "string"
    },
    user: { model: "User" },
    data:{
      type:'json',
      defaultsTo: {}
    },
	applicationReference: {
      type: "string"
      //defaultsTo: shortid.generate
    },
	iscompleted: {
      type: 'integer',
      defaultsTo: 0
    },
	screenappversion:{
	  type: 'string',
      defaultsTo: sails.config.appManagement.appVersion
	},
	screeniosversion:{
	  type: 'string',
      defaultsTo: sails.config.appManagement.appVersion
	},
	product: { model: "Productlist" },
	transunion: { model: "Transunions" },
	accounts: { model: "Account" },
	consolidateaccount: { model: "Consolidateaccount" },
	offerdata:{
      type: "array",
      defaultsTo: []
	},
	offers: {
		type: "json",
		defaultsTo: {}
	},
	esignature: { model: "Esignature" },
	plaiduser:{ model: "PlaidUser" },
	screenlevel: {
      type: 'integer',
      defaultsTo: 1
    },
	incomeChanged: {
      type: 'boolean',
      defaultsTo: 'false'
    },
	isoffercompleted: {
      type: 'integer',
      defaultsTo: 0
    },
	ispromissorycompleted: {
      type: 'integer',
      defaultsTo: 0
    },
	blockedList: {
		type: 'boolean',
        defaultsTo: 'false'
	},
	/*incomeChanged:{
		type: 'boolean',
        defaultsTo: 'false'
	},*/
	filloutmanually: {
      type: 'integer',
      defaultsTo: 0
    },
	isAccountLinked: {
      type: 'integer',
      defaultsTo: 0
    },
	isBankAdded: {
      type: 'integer',
      defaultsTo: 0
    },
	loanchangeManually: {
      type: 'integer',
      defaultsTo: 0
    },
	loanchanged: {
      type: 'integer',
      defaultsTo: 0
    },
	moveToIncomplete: {
      type: 'integer'
    },
	applicationType: {
		type: 'string'
	},
	incompleteverified: {
      type: 'integer',
      defaultsTo: 0
    },
	incompleteEmailSent: {
      type: 'integer',
      defaultsTo: 0
    },
	moveToArchive: {
	  type: 'integer'
	},
	requestedLoanAmount: { type: "float", defaultsTo: 0.0 },
	preDTIMonthlyAmount: {
      type: 'float'
    },
	preDTIPercentValue: {
      type: 'float'
    },
	monthlyIncomeamount: {
      type: 'float'
    },
    borrowerapplication: {
      type: 'integer',
      defaultsTo: 0
	},
	  incomeamount: {
			type: 'float'
	  },
	residenceType: {
		type: "string"
	},
	housingExpense: {
		type: "float"
	},
	  creditscore: {
		type: "integer"
	  },
	lockCreditTier: { type: "string" },
	  detectedPayroll:{
		type: "string"
	  },
	  isNoHit: {
		type: "boolean",
		  defaultsTo: false
	  },
	  deniedByCounterOffer: {
		type: "boolean",
		defaultsTo: false
	  },
	lastlevel: {
		type: "integer"
	},
	addbanklastlevel: {
		type: "integer"
	}
  },
  createLastScreenName: createLastScreenName,
  updateLastScreenName: updateLastScreenName,
  getLastScreenName: getLastScreenName,
  deleteAllScreenRelatedDetails: deleteAllScreenRelatedDetails,
  deleteMultipleScreenDetails: deleteMultipleScreenDetails,
  getDTIoffers:getDTIoffers,
  changeincomecreate:changeincomecreate,
  updatedeclinedloan: updatedeclinedloan,
  checkscreentrackingdetails:checkscreentrackingdetails,
  checktodolistcount:checktodolistcount,
  generateMyoffer: generateMyoffer,
  createloanmodified:createloanmodified,
  generateModifiedLoanOffer:generateModifiedLoanOffer,
  chageachstatus:chageachstatus,
  changepaymentschudle:changepaymentschudle,
  onlyTodocount: onlyTodocount,
  changepaymentamount:changepaymentamount,
  getloanOfferdetails:getloanOfferdetails,
  loanofferinfo: loanofferinfoAction,
  updateBadListLoan: updateBadListLoan,
  checkLoanexsits:checkLoanexsitsAction,
  updateApplicationDetails: updateApplicationDetails,
  createcertificate:createcertificate,
  aprRateCalculator: aprRateCalculator,
  calculateApr: calculateApr,
  getApplicationOffer:getApplicationOffer,
  saveLoanOfferData: saveLoanOfferData,
  getSelectionOffer: getSelectionOffer,
  getChangeLoanOffer:getChangeLoanOffer,
  changenewloanincomecreate: changenewloanincomecreate,
  calculateMonthlyPayment:calculateMonthlyPayment,
  getGradeLoanamount:getGradeLoanamount,
  getGradeOfferDetails:getGradeOfferDetails,
  checkQualifiedAmount:checkQualifiedAmount,
  getEstimateMonthlyPay:getEstimateMonthlyPay,
  getOffers: getOffers,
  createOffer: createOffer,
	getFundingTierFromScreenTrackingList:getFundingTierFromScreenTrackingList,
	getFundingTierFromPaymentManagementList:getFundingTierFromPaymentManagementList,
	findLatestScreenTracking: findLatestScreenTracking
};

function createLastScreenName(lastScreenName,lastlevel,user,data,product,idobj) {
  return Q.promise(function(resolve, reject) {

    if (!lastScreenName) {
      sails.log.error('Screentracking#createLastScreenName :: data null ');

      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }

    if (user.id) {

      User.findOne({ id: user.id })
        .then(function(userDetail) {

			// sails.log.info("createLastScreenName::::", userDetail);


			var screenCriteria = {
			  user :userDetail.id,
			  iscompleted : 0
			};

			var monthlyIncomeamount =  parseFloat(data.screenTrackingData.incomeamount || "0");
			var housingExpense =  parseFloat(data.screenTrackingData.housingExpense || "0");

		  	Screentracking.findOne(screenCriteria)
			.then(function(screenTrackingData){

				if (screenTrackingData)
				{

					screenTrackingData.lastScreenName = lastScreenName;
					screenTrackingData.lastlevel = lastlevel;
					screenTrackingData.practicemanagement = userDetail.practicemanagement;
					screenTrackingData.residenceType = data.screenTrackingData.residenceType;
					screenTrackingData.housingExpense = housingExpense;
					screenTrackingData.incomeamount = monthlyIncomeamount;
					screenTrackingData.creditscore = idobj.creditscore;
					screenTrackingData.isNoHit = idobj.isNoHit;
					//screenTrackingData.data = data;
					//screenTrackingData.product=product;
					//screenTrackingData.transunion=idobj.transid;
					//screenTrackingData.rulesDetails=idobj.rulesDetails;

					if ("undefined" !== typeof idobj.transid && idobj.transid!='' && idobj.transid!=null)
				    {
					  screenTrackingData.transunion = idobj.transid;
				    }

					screenTrackingData.save();
					return resolve(screenTrackingData);
				}
				else
				{

				   	  return User.getNextSequenceValue('application')
          		   	  .then(function(applicationRefernceData) {

						  var applicationReferenceValue ='APL_'+applicationRefernceData.sequence_value;

						  var screenTrackingObject = {
							lastScreenName : lastScreenName,
							lastlevel : lastlevel,
							user:userDetail.id,
							//data: data,
							applicationReference:applicationReferenceValue,
 							//product:product,
							//transunion:idobj.transid,
							//rulesDetails:idobj.rulesDetails,
							creditscore:idobj.creditscore,
							practicemanagement:userDetail.practicemanagement,
							  residenceType: data.screenTrackingData.residenceType,
							  housingExpense: housingExpense,
							  incomeamount: monthlyIncomeamount,
							  isNoHit: idobj.isNoHit
						  };

						//   sails.log.info("screenTrackingObjectdata::::", screenTrackingObject);

						  if ("undefined" !== typeof product && product!='' && product!=null)
						  {
							  screenTrackingObject.product = product;
						  }

						  if(idobj)
						  {
							  if ("undefined" !== typeof idobj.transid && idobj.transid!='' && idobj.transid!=null)
							  {
								  screenTrackingObject.transunion = idobj.transid;
							  }

							  if (idobj.rulesDetails)
							  {
								  screenTrackingObject.rulesDetails = idobj.rulesDetails;
							  }

							  if ("undefined" !== typeof idobj.creditscore && idobj.creditscore!='' && idobj.creditscore!=null)
							  {
								  screenTrackingObject.creditscore = idobj.creditscore;
							  }
						  }

						//   sails.log.info("screenTrackingObject",screenTrackingObject);

						  Screentracking.create(screenTrackingObject)
							.then(function(screenTracking) {
							//   sails.log.info("Screentracking#screenTracking :: created for Screentracking :: ", screenTracking);
							  return resolve(screenTracking);
							})
							.catch(function(err) {
							  sails.log.error("Screentracking :: createLastScreenName :: Error :: ", err);
							  return reject(err);
							});
					  })
					  .catch(function(err) {
						  sails.log.error("User#registerDevice1::", err);
						  return reject(err);
					  });
				}
			})
			.catch(function(err){
			sails.log.error("Screentracking #createLastScreenName::Error",err);
			return reject(err);
			})
        })
      .catch(function(err) {
        sails.log.error("Screentracking :: createLastScreenName :: Error :: ", err);

        return reject(err);
      });
    }
    else {
      return resolve ({
        code : 400,
        message: "User not found"
      });
    }
  });
}
//
function updateLastScreenName(user,lastScreenName,lastlevel,data,linkedaccid,consoldateid,myofferdata) {


	sails.log.info("lastScreenName",lastScreenName);
	sails.log.info("user",user.id);

	//process.exit(1);

  return Q.promise(function(resolve, reject) {
    Screentracking
    .findOne({
      user :user.id,
	  iscompleted : 0
	  //$or : [ { iscompleted : 0 }, { iscompleted : {$exists: false} } ],
	})
	.populate( "user" )
	.sort("createdAt DESC")
    .then(function(screenTracking){

	 if(linkedaccid){
		  screenTracking.lastScreenName = lastScreenName;
		  screenTracking.lastlevel = lastlevel;
          screenTracking.data = data;
		  screenTracking.accounts = linkedaccid;

		  //-- Added for multiple loans
		  screenTracking.isAccountLinked = 1;

          //screenTracking.save();
		  screenTracking.save(function(err) {
				return resolve(screenTracking);
		  });

	 }else{
		 sails.log.info("screenTracking",screenTracking);
		  if(consoldateid){
			  screenTracking.lastScreenName = lastScreenName;
			  screenTracking.lastlevel = lastlevel;
			  screenTracking.data = data;
			  screenTracking.consolidateaccount = consoldateid;
			  //screenTracking.save();
		  }else if(myofferdata){
		      screenTracking.lastScreenName = lastScreenName;
			   screenTracking.lastlevel = lastlevel;
			  screenTracking.data = data;
			  screenTracking.offerdata = myofferdata;
			  screenTracking.isoffercompleted= 1;
			  //screenTracking.save();
		  }else{
			  screenTracking.lastScreenName = lastScreenName;
			  screenTracking.lastlevel = lastlevel;
			  screenTracking.data = data;
			  //screenTracking.save();
		  }

		   screenTracking.save(function(err) {
				return resolve(screenTracking);
		  });
	 }


})
.catch(function(err){
sails.log.error("Screentracking #updateLastScreenName::Error",err);
return reject(err);
})


  })
}

function getLastScreenName(user){
  return Q.promise(function(resolve,reject){
    Screentracking
    .findOne({
      user:user.id,
	  iscompleted : 0
	  //$or : [ { iscompleted : 0 }, { iscompleted : {$exists: false} } ],
    })
    .then(function(screenTracking){
      return resolve(screenTracking);
    })
    .catch(function(err){
      sails.log.error("getLastScreenName::Error",err);
      return reject(err);
    })
  })
}

function deleteAllScreenRelatedDetails(screenid){

	return Q.promise(function(resolve, reject) {
		var criteria = {
		  id: screenid
		};
		sails.log.info("screenid ", screenid);
		Screentracking
		  .destroy(criteria)
		  .then(function(screenlist) {
			if (!screenlist) {
			  return reject({
				code: 404,
				message: 'UNIVERSITY_NOT_FOUND'
			  });
			}
			return resolve();
		  })
		  .catch(function(err) {
			sails.log.error('Screentracking#deleteAllScreenRelatedDetails :: err :', err);
			return reject(err);
		  });
  });

}
function deleteMultipleScreenDetails(screenids){

	return Q.promise(function(resolve, reject) {
		var criteria = {
		  id: eval(screenids)
		};
		sails.log.info("screenid ", screenids);
		sails.log.info("criteria ", criteria);

		Screentracking
		  .destroy(criteria)
		  .then(function(screenlist) {
			if (!screenlist) {
			  return reject({
				code: 404,
				message: 'SCREEN NOT FOUND'
			  });
			}
			return resolve({code: 200});
		  })
		  .catch(function(err) {
			sails.log.error('Screentracking#deleteMultipleScreenDetails :: err :', err);
			return reject(err);
		  });

  });

}
function getDTIoffers(userAccount,screentracking){
	return Q.promise(function(resolve, reject) {

			var transunion_scrore = screentracking.creditscore;

			ApplicationService.getProductNameByscore(transunion_scrore)
			   .then(function (productdatares) {

				var productname = productdatares.productname;
				var alltotalbalance = 0;
				var monthlyamount = 0;
				var totalmonthlyamount = 0;
				var currentBalance ='';
				var BRFbalance = 0;
				var NonBRFbalance =0;
				var nondebitamount = 0;
				var nondebitmonthlyamount = 0;
				var balance='';
				var brftotal ='';
				if(userAccount.product){
				if(userAccount.product.subject.subjectRecord && userAccount.product.subject.subjectRecord.custom && userAccount.product.subject.subjectRecord.custom.credit && userAccount.product.subject.subjectRecord.custom.credit.trade)
				{
					 var userAccountlist = userAccount.product.subject.subjectRecord.custom.credit.trade;
					  _.forEach(userAccountlist, function (account)
					  {
						    var balance = account.currentBalance;
							//sails.log.info("balance ", balance);
							if(balance!='' && balance!=null && "undefined" !== typeof balance){
								account.currentBalance = balance.replace(',','');
								currentBalance = parseFloat(account.currentBalance);
								alltotalbalance = alltotalbalance+currentBalance;
							}
							if(account.subscriber){
								var industryCode = account.subscriber.industryCode;
							}else{
								var industryCode = "";
							}
							//sails.log.info("industryCode ", industryCode);
							//sails.log.info("account.currentBalance ", account.currentBalance);
							if ((industryCode === 'B' || industryCode === 'R' || industryCode === 'F') && account.currentBalance > 0 && account.currentBalance < 75000) {
								//sails.log.info("BRFbalance ", account.currentBalance);
								brftotal = parseFloat(account.currentBalance);
							    BRFbalance = BRFbalance+brftotal;
							}else{
								if(account.terms)
								{
								  nondebitamount = parseFloat(account.terms.scheduledMonthlyPayment);
								  if(nondebitamount > 0){
									nondebitmonthlyamount = nondebitmonthlyamount+nondebitamount;
								  }
								   nondebitamount = nondebitamount.toFixed(2);
								}
							}


							if(account.terms)
							{
							  monthlyamount = parseFloat(account.terms.scheduledMonthlyPayment);
							  if(monthlyamount > 0){
							  	totalmonthlyamount = totalmonthlyamount+monthlyamount;
							  }
							   monthlyamount = monthlyamount.toFixed(2);
							}
					   });

				}
				sails.log.info("nondebitmonthlyamount ", nondebitmonthlyamount);
				//totalmonthlyamount =1204.00;

				    sails.log.info("screentracking.consolidateaccount ", screentracking.consolidateaccount);

					var NonBRFbalance =0;
					if(screentracking.consolidateaccount)
				    {
					    var selectAccountlist = screentracking.consolidateaccount.trade;
					    _.forEach(selectAccountlist, function (selaccount)
					    {
							selectBalance = parseFloat(selaccount.currentBalance);
							NonBRFbalance = NonBRFbalance+selectBalance;
						 });
					}
				    sails.log.info("NonBRFbalance ", NonBRFbalance);

					if ("undefined" !== typeof screentracking.incomeamount && screentracking.incomeamount!='' && screentracking.incomeamount!=null)
					 {
					   var yearincome = screentracking.incomeamount;
					   monthincome = yearincome/12;
					   monthincome = parseFloat(monthincome);
					   monthincome = monthincome.toFixed(2);
					 }
					// sails.log.info("yearincome", yearincome);
					var payroll_detected = screentracking.detectedPayroll;
					// if ("undefined" !== typeof screentracking.offerdata[0] && screentracking.offerdata[0]!='' && screentracking.offerdata[0]!=null)
					 if (screentracking.offerdata && screentracking.offerdata.length > 0 && "undefined" !== typeof screentracking.offerdata[0].financedAmount && screentracking.offerdata[0].financedAmount !='' && screentracking.offerdata[0].financedAmount !=null)
					 {

							 /*var approvedAmount = screentracking.offerdata[0].financedAmount
							 var loanInterestRate = screentracking.offerdata[0].interestRate
							 var loanYears = screentracking.offerdata[0].month;*/

							 var approvedAmount = screentracking.offerdata[0].financedAmount;
							 var loanInterestRate = screentracking.offerdata[0].interestRate;
							 var loanYears = screentracking.offerdata[0].month;
							var fundingTier = screentracking.offerdata[0].creditTier;
							var fundingRate = screentracking.offerdata[0].fundingRate;

							if(productname=='State License')
							{

								var  decimalRate = (loanInterestRate/ 100) / 12;
								var xpowervalue = decimalRate + 1;
								var ypowervalue = loanYears;
								var powerrate_value= Math.pow(xpowervalue,ypowervalue) - 1;
								scheduleLoanAmount = ( decimalRate + ( decimalRate / powerrate_value ) ) * approvedAmount;
								scheduleLoanAmount = scheduleLoanAmount.toFixed(2);
								scheduleLoanAmount = parseFloat(scheduleLoanAmount);

								//sails.log.info("scheduleLoanAmount ", scheduleLoanAmount);

								var divideamt =26/12;
								divideamt = parseFloat(divideamt);

								var addamount = scheduleLoanAmount*divideamt;
								addamount = parseFloat(addamount);

								//sails.log.info("totalmonthlyamount ", totalmonthlyamount);
								//sails.log.info("addamount ", addamount);

								var posttotal = nondebitmonthlyamount+scheduleLoanAmount;
								var PaymentDiff = totalmonthlyamount-posttotal;
								var preDTI = totalmonthlyamount/monthincome;
								preDTI = parseFloat(preDTI)*100;
								preDTI = preDTI.toFixed(2);
								var PostDTI = posttotal/monthincome;
								PostDTI = parseFloat(PostDTI)*100;
								PostDTI = PostDTI.toFixed(2);
								posttotal = parseFloat(posttotal);
								posttotal = posttotal.toFixed(2);
								PaymentDiff = parseFloat(PaymentDiff);
								PaymentDiff = PaymentDiff.toFixed(2);

								 if(totalmonthlyamount > 0){
									 numformt = totalmonthlyamount.toFixed(2);
									 totalmonthlyamount = numformt.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
							     }
								 if(alltotalbalance > 0){
									 alltotalbalance = alltotalbalance.toFixed(2);
									 alltotalbalance = alltotalbalance.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
								 }
								 if(BRFbalance > 0){
									 BRFbalance = BRFbalance.toFixed(2);
									 BRFbalance = BRFbalance.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
								 }
								 if(NonBRFbalance > 0){
									 NonBRFbalance = NonBRFbalance.toFixed(2);
									 NonBRFbalance = NonBRFbalance.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
								 }
								 if(nondebitmonthlyamount > 0){
									 nondebitmonthlyamount = nondebitmonthlyamount.toFixed(2);
									 nondebitmonthlyamount = nondebitmonthlyamount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
								 }
								// alltotalbalance = '41167.67';

								 var DTIandoffers = {
								   monthincome:monthincome,
								   payroll_detected:payroll_detected,
								   alltotalbalance:alltotalbalance,
								   pretotalmonthlyamount:totalmonthlyamount,
								   PaymentDiff:PaymentDiff,
								   posttotal:posttotal,
								   preDTI:preDTI,
								   PostDTI:PostDTI,
								   productname:productname,
								   BRFbalance:BRFbalance,
								   NonBRFbalance:NonBRFbalance,
								   nondebitmonthlyamount:nondebitmonthlyamount,
									 fundingTier: fundingTier,
									 fundingRate: fundingRate,
								   code:200
								 }

								 //sails.log.info("DTIandoffers ", DTIandoffers);

								 return resolve(DTIandoffers);

							}
							else if(productname=='CA High Risk')
							{
							 var incomeamount = screentracking.offerdata[0].incomeamount;
							 var state = screentracking.offerdata[0].state;
							 var loanTerm = screentracking.offerdata[0].term;
							 var paymentFeq = screentracking.offerdata[0].paymentFeq;
							 var interestRate = screentracking.offerdata[0].interestRate
							 var financedAmount = screentracking.offerdata[0].financedAmount;
							 var APR = screentracking.offerdata[0].apr;
							 var loanPaymentCycle = screentracking.offerdata[0].loanPaymentCycle
							 var monthlyPayment = screentracking.offerdata[0].monthlyPayment;
							 var perTotMonthlyPayment = screentracking.offerdata[0].perTotMonthlyPayment
							 var postTotMonthlyPayment = screentracking.offerdata[0].postTotMonthlyPayment;
							 var preDTI = screentracking.offerdata[0].preDTI;
							 var postDTI = screentracking.offerdata[0].postDTI;
							 var postDTIThreshold = screentracking.offerdata[0].postDTIThreshold;
							 var loanstatus = "Incomplete";

							  var DTIandoffers = {
								   incomeamount:incomeamount,
								   state:state,
								   loanTerm:loanTerm,
								   paymentFeq:paymentFeq,
								   interestRate:interestRate,
								   financedAmount:financedAmount,
								   apr:APR,
								   loanPaymentCycle:loanPaymentCycle,
								   monthlyPayment:monthlyPayment,
								   perTotMonthlyPayment:perTotMonthlyPayment,
								   postTotMonthlyPayment:postTotMonthlyPayment,
								   preDTI:preDTI,
								   postDTI:postDTI,
								   postDTIThreshold:postDTIThreshold,
								   loanstatus:loanstatus,
								  fundingTier: fundingTier,
								  fundingRate: fundingRate,
								   code:200,
								   payroll_detected:payroll_detected
								 }

								 return resolve(DTIandoffers);

							 }

						 }else{

						   var DTIandoffers = {
							   payroll_detected:payroll_detected,
							   monthincome:'--',
							   alltotalbalance:alltotalbalance,
							   pretotalmonthlyamount:'--',
							   posttotal:'--',
							   preDTI:'--',
							   PostDTI:'--',
							   fundingTier: '--',
							   fundingRate: '--',
							   code:201
							 }

							 return resolve(DTIandoffers);

						 }
				}else{
					var DTIandoffers = {
					   payroll_detected:payroll_detected,
					   monthincome:'--',
					   alltotalbalance:alltotalbalance,
					   pretotalmonthlyamount:'--',
					   posttotal:'--',
					   preDTI:'--',
					   PostDTI:'--',
						fundingTier: '--',
						fundingRate: '--',
					   code:201
					 }

					 //sails.log.info("DTIandoffers ", DTIandoffers);

					 return resolve(DTIandoffers);
				}



			})
			.catch(function (err) {
				sails.log.error("Screentracking#getDTIoffers::Err ::", err);
				return reject(err);
			});

    });
}

function checktodolistcount( userid ) {
	return Q.promise( function( resolve, reject ) {
		var usercriteria = { id: userid };
		sails.log.info( "usercriteria", usercriteria );

		User.findOne( usercriteria )
		.then( function( userDetail ) {
			var isEmailVerified = userDetail.isEmailVerified;
			var isBankAdded = userDetail.isBankAdded;
			var isGovernmentIssued = userDetail.isGovernmentIssued;
			var isPayroll = userDetail.isPayroll;
			var totdocount = 0;
			if( !isEmailVerified ) {
				totdocount++;
			}
			if( !isBankAdded ) {
				totdocount++;
			}
			if( !isGovernmentIssued ) {
				totdocount++;
			}
			if( !isPayroll ) {
				totdocount++;
			}
			if( totdocount == 0 ) {

				Screentracking.findOne( { user:userid, iscompleted: [ 0, 2 ] } )
				.then( function( ScreentrackingDetail ) {
					//sails.log.info("ScreentrackingDetail---", ScreentrackingDetail);
					if( ScreentrackingDetail ) {
						if( ScreentrackingDetail.incomeChanged == true ) {
							//sails.log.info("ifreached---");

							if((ScreentrackingDetail.changeIncomePage=='Incomplete') || (ScreentrackingDetail.changeIncomePage=='Denied')) {
								//sails.log.info("incomplete--or Denied----");
								Screentracking.chageachstatus(userid)
								.then(function(achstatus) {
									return resolve(totdocount);
								})
								.catch(function(err) {
									//sails.log.error("Screentracking::checktodolistcount::Error", err);
									return reject(err);
								})
							} else {
								//sails.log.info("pending---");
								return resolve(totdocount);
							}
						} else {
							//sails.log.info("elsereached---");
							Screentracking.chageachstatus( userid )
							.then( function( achstatus ) {
								return resolve( totdocount );
							})
							.catch( function( err ) {
								sails.log.error("Screentracking::checktodolistcount::Error", err);
								return reject(err);
							} );
						}
					} else {
						//sails.log.info("final elsereached---");
						Screentracking.chageachstatus( userid )
						.then( function( achstatus ) {
							return resolve( totdocount );
						} )
						.catch( function( err ) {
							sails.log.error("Screentracking::checktodolistcount::Error", err);
							return reject(err);
						} );
					}
				} )
				.catch( function( err ) {
					sails.log.error( "Screentracking::checktodolistcount::Error", err );
					//return reject(err);
					return resolve( totdocount );
				} )
			} else {
				return resolve(totdocount);
			}
		} )
		.catch( function( err ) {
			sails.log.error( "Screentracking::checktodolistcount::Error", err );
			return reject( err );
		} );
	} );
}

function onlyTodocount(userid){
	 return Q.promise(function(resolve, reject) {

		  var usercriteria = {
			id: userid
		  };

			sails.log.error("usercriteria", usercriteria);

		  User
		  .findOne(usercriteria)
		  .then(function(userDetail) {

			  var isEmailVerified = userDetail.isEmailVerified;
			  var isBankAdded = userDetail.isBankAdded;
			  var isGovernmentIssued = userDetail.isGovernmentIssued;
			  var isPayroll = userDetail.isPayroll;
			  var totdocount = 0;
			   if(!isEmailVerified)
				{
				  	totdocount++;
				}

				if(!isBankAdded)
				{

				 	totdocount++;
				}

				if(!isGovernmentIssued)
				{
					totdocount++;
				}

				if(!isPayroll)
				{
				 	totdocount++;
				}

				return resolve(totdocount);
		  })
		  .catch(function(err) {
			  sails.log.error("Screentracking::checktodolistcount::Error", err);
			  return reject(err);
		  })

	});
}

function chageachstatus(userid){

	return Q.promise(function(resolve, reject) {

			var loanCriteria = {
			  user: userid,
			  status:'OPENED',
			  achstatus:[0,4]
			};
			PaymentManagement
			.findOne(loanCriteria)
			.populate('user')
			.populate('screentracking')
			.populate('story')
			.sort("createdAt DESC")
			.then(function(paymentmanagementdata) {

				sails.log.info("paymentmanagementdata:", paymentmanagementdata);
				if(paymentmanagementdata!='' && paymentmanagementdata!=null && "undefined" !== typeof paymentmanagementdata)
				{
					if(paymentmanagementdata.achstatus==4)
					{
						var screenid = paymentmanagementdata.screentracking.id;
						sails.log.error("screenid", screenid);
						Screentracking.update( { id: screenid }, { iscompleted: 1 })
						.exec(function afterwards(err, updated){
						   paymentmanagementdata.achstatus = 0;
						   paymentmanagementdata.status = "PENDING";
						   paymentmanagementdata.save(function(err) {
								if (err) {
									sails.log.error("paymentFeeManagement :: Error :: ", err);
								}
								return resolve(paymentmanagementdata);
						   });
						});
					}else{
						return resolve(paymentmanagementdata);
					}

				}else{
					return resolve('');
				}

			})
			 .catch(function(err) {
				  sails.log.error("Screentracking::chageachstatus::Error", err);
				  return reject(err);
			})


	});
}

function updatedeclinedloan( lastScreenName, lastlevel, user, data, product, idobj, transError ) {
	// const err = new Error( "attempt to decline loan" );
	// sails.log.error( "Screentracking.updatedeclinedloan;", err );
	// return Promise.reject( err );
	// check user
	sails.log.info( "Screentracking.updatedeclinedloan user", user );
	return Q.promise( function( resolve, reject ) {

		Screentracking.checkscreentrackingdetails( lastScreenName, lastlevel, user, data,product, idobj )
		.then( function( screendetails ) {
			screendetails.offerdata = [ { financedAmount: 0 } ];
			sails.log.info( "screendetails:::", screendetails );

			return User.getNextSequenceValue( 'loan' )
			.then( function( loanRefernceData ) {
				sails.log.info("loanRefernceDataloanRefernceData",loanRefernceData);
				var loanRefernceDataValue = 'LN_'+loanRefernceData.sequence_value;
				var logdata = [ { message: "Loan Denied", date: new Date() } ];
				var maturityDate = moment().startOf('day').toDate();
				var paymentSchedule = [];
				var payobj = {
					paymentSchedule: paymentSchedule,
					maturityDate: maturityDate,
					account: screendetails.accounts ? screendetails.accounts: '',
					nextPaymentSchedule: maturityDate,
					achstatus: 2,
					loanReference: loanRefernceDataValue,
					logs: logdata,
					deniedfromapp: 1,
					screentracking: screendetails.id,
					isPaymentActive: false,
					creditScore: screendetails.creditscore,
					practicemanagement: user.practicemanagement,
					user: user.id,
					status: "DENIED",
					declinereason: "Denied, loan was changed in counter offer."
				};
				sails.log.info( "payobj", payobj );

				PaymentManagement.create( payobj )
				.then( function( paymentDet ) {
					var usercriteria = { id: user.id };
					sails.log.info( "usercriteria", usercriteria );

					User.findOne( usercriteria )
					.then( function( userDetail ) {
						var UserID = userDetail.id;
						var consentCriteria = {
							user: user.id,
							loanupdated: 1,
							paymentManagement: { "$exists": false }
						};
						sails.log.info( "consentCriteria", consentCriteria );

						UserConsent.find( consentCriteria )
						.sort( "createdAt DESC" )
						.then( function( userConsentAgreement ) {
							sails.log.info( "userConsentAgreement", userConsentAgreement.length );
							if( userConsentAgreement.length > 0 ) {
								_.forEach( userConsentAgreement, function( consentagreement ) {
									UserConsent.updateUserConsentAgreement( consentagreement.id, user.id, paymentDet.id );
								} );
							}
							var screencriteria = {
								user: UserID,
								iscompleted: 0
							}
							sails.log.info( "screencriteria::", screencriteria );

							//Update screentracking
							Screentracking.findOne( screencriteria )
							.then( function( screenTracking ) {
								sails.log.info("screenTracking::",screenTracking);

								if( screenTracking ) {
									paymentDet.creditScore = screenTracking.creditscore;
								} else {
									paymentDet.creditScore	= 0;
								}

								//-- Ticket no 2760 (block loan deny email)
								var blockDenyLoanMail = 0;
								if( data.adminofferchange ) {
									if( "undefined" !== typeof data.adminofferchange && data.adminofferchange != '' && data.adminofferchange != null && data.adminofferchange == 1 ) {
										blockDenyLoanMail=1;
									}
								}
								/*if( blockDenyLoanMail == 0 ) {
									EmailService.sendDenyLoanMail( user, paymentDet );
								}*/
								if( screenTracking ) {
									var responseData = {
										screenId: screenTracking.id,
										paymentid: paymentDet.id,
										errorCode: 400,
										transError: transError ? transError: '',
										message: "This account could not be approved due to insufficient transaction"
									}
									return resolve( responseData );
								} else {
									sails.log.info("enter elsse loop::");
								}
							})
							.catch(function(err) {
									sails.log.error("Screentracking::updatedeclinedloan::Error", err);
									return reject(err);
							});
						})
						.catch(function(err) {
							sails.log.error("Screentracking::updatedeclinedloan UserConsent error::", err);
						});
					})
					.catch(function(err) {
						sails.log.error("Screentracking::updatedeclinedloan::Error", err);
						return reject(err);
					})
				})
				.catch(function(err) {
					sails.log.error("Screentracking::updatedeclinedloan-", err);
					return reject(err);
				});
			} )
			.catch(function(err) {
				sails.log.error("Screentracking::updatedeclinedloan--", err);
				return reject(err);
			} );
		} )
	    .catch( function( err ) {
		    sails.log.error( "Screentracking::updatedeclinedloan---", err );
			return reject( err );
	    } );
    } );
}

function checkscreentrackingdetails( lastScreenName, lastlevel, user, data, product, idobj ) {
	return Q.promise( function( resolve, reject ) {
		var criteria = { user: user.id, iscompleted : 0};

		return Screentracking.findOne( criteria )
		.sort("createdAt DESC")
		.then( function( userscreenres ) {
			//sails.log.info("userscreenres",idobj.rulesDetails);
			var rulesdetails = idobj.rulesDetails;
			if( userscreenres == '' || userscreenres == null || "undefined" == typeof userscreenres ) {
				return User.getNextSequenceValue('application')
				.then(function(applicationRefernceData) {
					var applicationReferenceValue = 'APL_' + applicationRefernceData.sequence_value;
					sails.log.info( "applicationReferenceValue", applicationReferenceValue );
					var screenTrackingObject = {
						lastScreenName: lastScreenName,
						lastlevel: lastlevel,
						user: user.id,
						data: data,
						applicationReference: applicationReferenceValue,
						product: sails.config.product.productid,
						transunion: idobj.transid,
						rulesDetails: rulesdetails,
						creditscore: idobj.creditscore,
						practicemanagement: user.practicemanagement
					};
					sails.log.info("screenTrackingObject",screenTrackingObject);

					Screentracking.create( screenTrackingObject )
					.then( function( screenTracking ) {
						sails.log.info( "screenTracking", screenTracking );
						return resolve( screenTracking );
					});
				});

			} else {
				return resolve( userscreenres );
			}

		 })
	     .catch(function(err) {
		    sails.log.error("Screentracking::checkscreentrackingdetails", err);
			return reject(err);
	    });
	});
}

function changeincomecreate(screendetails,incomeamount,balanceamount,paymentid,userdetails){



	return Q.promise(function(resolve, reject) {

		  return User.getNextSequenceValue('application')
					 .then(function(applicationRefernceData) {

					 var applicationReferenceValue ='APL_'+applicationRefernceData.sequence_value;

					screendetails.newincomeamount = incomeamount;

							var updateDatares = {deniedmessage:'This application has been declined, due to changed income!'};
							Screentracking.update({id: screendetails.id}, updateDatares).exec(function afterwards(err, updated){});


							 Screentracking
							 .generateMyoffer(screendetails,incomeamount,userdetails)
							 .then(function(screenTrackingoffer) {

									sails.log.info("here-new-peace",screenTrackingoffer);

									//sails.log.info("screenTrackingoffer",screenTrackingoffer.fullData);
									//process.exit(1);

									  var screenTrackingObject = {
										lastScreenName : screendetails.lastScreenName,
										lastlevel : 3,
										user:screendetails.user,
										data: screendetails.data,
										applicationReference:applicationReferenceValue,
										product:screendetails.product,
										transunion:screendetails.transunion,
										rulesDetails:screendetails.rulesDetails,
										practicemanagement: screendetails.practicemanagement,
										iscompleted:0,
										screenappversion:'',
										screeniosversion:'',
										offerdata:screenTrackingoffer.fullData,
										screenlevel: 1,
										creditscore:screendetails.creditscore,
										//consolidateaccount:screendetails.consolidateaccount,
										plaiduser:screendetails.plaiduser,
										incomeamount: incomeamount,
										accounts:screendetails.accounts,
										loanstatus: "Approved",
										loandescription: "Approved Income",
										changeIncomePage: screendetails.changeIncomePage
									  };

									  //sails.log.info("screenTrackingObject",screenTrackingObject);
									  //process.exit(1);

									  Screentracking.create(screenTrackingObject)
										.then(function(screenTracking) {

												Screentracking.update({id: screenTracking.id}, {incomeChanged: true})
																	 .exec(function afterwards(err, updated){});

												var consentCriteria = {
												  paymentManagement:paymentid,
												};
												//sails.log.info("consentCriteria",consentCriteria);

												UserConsent.update(consentCriteria, {loanupdated: 2})
																	 .exec(function afterwards(err, updated){});

												UserConsent
												.find(consentCriteria)
												.then(function(userConsentAgreement) {

														PaymentManagement.update({user: userdetails.id}, {status: "DENIED"})
																	 .exec(function afterwards(err, updated){});

														Story.update({user: userdetails.id}, {status: 2})
																	 .exec(function afterwards(err, updated){});

														Achdocuments.update({user: userdetails.id}, {status: 2})
																	 .exec(function afterwards(err, updated){});



														User.update({id: userdetails.id}, {registeredtype: "Customer Service"})
																	 .exec(function afterwards(err, updated){});

												   _.forEach(userConsentAgreement, function(consentagreement) {

														//sails.log.info("userConsentAgreement",userConsentAgreement);

														if(consentagreement.documentKey!='131')
														{
															userconsentObject={
																documentName: consentagreement.documentName,
																documentVersion:consentagreement.documentVersion,
																documentKey: consentagreement.documentKey,
																ip: consentagreement.ip,
																phoneNumber: consentagreement.phoneNumber,
																user: consentagreement.user,
																agreement: consentagreement.agreement,
																loanupdated: 1,
																agreementpath: consentagreement.agreementpath
															};

															UserConsent.create(userconsentObject)
															.then(function(userconsent) {

																		var response = {
																   newscreenTracking: screenTracking,
																   code:200
																 }

																 //sails.log.info("DTIandoffers ", DTIandoffers);

																 return resolve(response);

															})
															.catch(function(err) {
															sails.log.error("Screentracking UserConsent error::", err);
															});
														}

												   });
												})
												.catch(function(err) {
												sails.log.error("Screentracking UserConsent error::", err);
												});


										  sails.log.info("Screentracking#changeincomecreate :: created for Screentracking :: ", screenTracking);
										  return resolve(screenTracking);
										})
										.catch(function(err) {
										  sails.log.error("Screentracking :: changeincomecreate :: Error :: ", err);
										  return reject(err);
										});
								})
								.catch(function(err) {
								  sails.log.error("Screentracking :: changeincomecreate :: Error :: ", err);
								  return reject(err);
								});

				})
			  .catch(function(err) {
				  sails.log.error("Screentracking#changeincomecreate::", err);
				  return reject(err);
			  });

	 });
}


function generateMyoffer(userAccountres,incomeamount,userdetails) {

	return Q.promise(function(resolve, reject) {

		var creditScore = parseInt(userAccountres.creditscore);

		var incomeamount = userAccountres.newincomeamount;
		var state = userdetails.state;
		//var state = userAccountres.transunion.response.product.subject.subjectRecord.indicative.address[0].location.state;
		var minimumIncomePlaid = sails.config.plaid.minincomeamount;
		incomeamount = parseFloat(incomeamount/12).toFixed(2);

			Loanamountcap
			.find()
			.then(function(loanDetCap){

				  var baseltiInterest = 0;
				_.forEach(loanDetCap, function (loanDetCapValue) {
					/*sails.log.info('creditScore : ', creditScore);
					sails.log.info('mincreditscore : ', loanDetCapValue.mincreditscore);
					sails.log.info('maxcreditscore : ', loanDetCapValue.maxcreditscore);*/
						if((creditScore >= loanDetCapValue.mincreditscore) && (creditScore <= loanDetCapValue.maxcreditscore)){
							baseltiInterest = parseFloat(loanDetCapValue.cap);
						}
					});
					var midValueNewIncome = "";
					var annualIncomeRange = sails.config.loan.annualIncomeRange;
					var annualUserIncome = parseFloat(userAccountres.newincomeamount);
					_.forEach(annualIncomeRange, function(incomerange) {
						/*sails.log.info("new-mini",incomerange.minIncome);
						sails.log.info("new-mini",(parseInt(incomerange.maxIncome) + parseInt(1000)));
						sails.log.info("new-annualUserIncome",annualUserIncome);*/
						if((incomerange.minIncome < annualUserIncome) && ((parseInt(incomerange.maxIncome) + parseInt(1000)) >= annualUserIncome)){
							if(incomerange.maxIncome == '999999'){
								midValueNewIncome = (((parseInt(74000) + parseInt(incomerange.minIncome)) / 2) / 12).toFixed(2);
							}else{
								midValueNewIncome = (((parseInt(incomerange.maxIncome) + parseInt(incomerange.minIncome)) / 2) / 12).toFixed(2);
							}
						}
					});

					if(midValueNewIncome == ""){
						midValueNewIncome = (((parseInt(annualIncomeRange[0].minIncome) + parseInt(annualIncomeRange[0].maxIncome)) / 2) / 12).toFixed(2);
					}

						sails.log.info("Model-incomeamount",incomeamount);
						sails.log.info("Model-baseltiInterest",baseltiInterest);
						sails.log.info("Model-midValueNewIncome",midValueNewIncome);
						//return 1;

					//var baseLoanAmountCal = parseFloat(incomeamount * baseltiInterest/100);
					var baseLoanAmountCal = parseFloat(midValueNewIncome * baseltiInterest/100);

					var baseLoanAmountCon = 0;
					if(baseLoanAmountCal > 1200){
						baseLoanAmountCon = 1200;
					}else{
						baseLoanAmountCon = baseLoanAmountCal;
					}
					var baseLoanAmount = 50 * (Math.floor(baseLoanAmountCon/50));
					sails.log.info("Model-baseLoanAmount",baseLoanAmount);

					var loanTerm = sails.config.loan.loanTerm;
					var paymentFeq = sails.config.loan.paymentFeq;

					stateratepaymentcycle
					.findStateByAbbr(state)
					.then(function(result){

							if(result.rate){
								var interestRate = result.rate;
							}else{
								var interestRate = 0;
							}
							var APR = (interestRate * sails.config.loan.APR);

							var transcriteria = { id: userAccountres.transunion};

							Transunions
							.findOne(transcriteria)
							.then(function(accdetails){
									sails.log.info('accdetails : ', accdetails);

									var transacc = accdetails.trade;

									var monthlySchedulePayment = 0;

									 _.forEach(transacc, function (account) {
										if(account.terms){
											if(account.terms.paymentScheduleMonthCount){
												if(account.terms.paymentScheduleMonthCount == 'MIN'){
													if(account.terms.scheduledMonthlyPayment){
														monthlySchedulePayment = parseFloat(monthlySchedulePayment)+parseFloat(account.terms.scheduledMonthlyPayment);
													}
												}
											}
										}
									  });
									var financedAmount = baseLoanAmount;

									var ir= (interestRate/100).toFixed(2);
									var loanPaymentCycle = Math.abs(PaymentManagementService.calculatePMT(parseFloat(ir), parseFloat(loanTerm), parseFloat(financedAmount)));

									var monthlyPayment = Math.abs((loanPaymentCycle*26/12).toFixed(2));
									var perTotMonthlyPayment = Math.round(monthlySchedulePayment);
									var postTotMonthlyPayment = Math.round(parseFloat(monthlyPayment) + parseFloat(perTotMonthlyPayment));

									/*var preDTI = ((perTotMonthlyPayment / incomeamount) * 100).toFixed(2);
									var postDTI = (((parseFloat(perTotMonthlyPayment) + parseFloat(monthlyPayment))/incomeamount) * 100).toFixed(2);*/

									var preDTI = ((perTotMonthlyPayment / midValueNewIncome)* 100).toFixed(2);
									var postDTI = (((parseFloat(perTotMonthlyPayment) + parseFloat(monthlyPayment))/midValueNewIncome)* 100).toFixed(2);

									var postDTIThreshold = 60;
									if(postDTI < postDTIThreshold){
										var loanstatus = "Approved";
										Screentracking.update({id: userAccountres.id,iscompleted : 0}, {loanstatus: loanstatus, loandescription:'Approved Income'})
										.exec(function afterwards(err, updated){
										});
									}else{
										var loanstatus = "Denied";
										Screentracking.update({id: userAccountres.id,iscompleted : 0}, {loanstatus: loanstatus, loandescription:'postDTIThreshold Greater than 60'})
										.exec(function afterwards(err, updated){

										});
									}
									 var firstname = userdetails.firstname;

									var responseValue = {incomeamount:incomeamount,state:state,loanTerm:loanTerm,paymentFeq:paymentFeq,interestRate:interestRate,financedAmount:financedAmount,apr:APR,loanPaymentCycle:loanPaymentCycle,monthlyPayment:monthlyPayment,perTotMonthlyPayment:perTotMonthlyPayment,postTotMonthlyPayment:postTotMonthlyPayment,preDTI:preDTI,postDTI:postDTI,postDTIThreshold:postDTIThreshold,loanstatus:loanstatus,firstname:firstname};

									var newResponseValue = {fullData:responseValue,fullDataString:JSON.stringify(responseValue)}

									return resolve(newResponseValue);

							})
						  .catch(function(err) {
							  sails.log.error("Screentracking#changeincomecreate::", err);
							  return reject(err);
						  });

					})
				  .catch(function(err) {
					  sails.log.error("Screentracking#changeincomecreate::", err);
					  return reject(err);
				  });


				})
			  .catch(function(err) {
				  sails.log.error("Screentracking#changeincomecreate::", err);
				  return reject(err);
			  });

	});
}

// Change loan modified

function createloanmodified(loandetails,financedAmount,changeterm,changerate,paymentid,userdetails)
{
	return Q.promise(function(resolve, reject) {

	  var screendetails = loandetails.screentracking;

	  return User.getNextSequenceValue('application')
	  .then(function(applicationRefernceData) {

		var applicationReferenceValue ='APL_'+applicationRefernceData.sequence_value;
		var incomeamount =  screendetails.offerdata[0].incomeamount;

	  Agreement
	  .generateModifiedLoanOffer(loandetails,financedAmount,changeterm,changerate,userdetails)
	  .then(function(screenTrackingoffer) {
		sails.log.info("screenTrackingoffer",screenTrackingoffer.fullData);

		  var screenTrackingObject = {
			lastScreenName : screendetails.lastScreenName,
			lastlevel : 4,
			user:screendetails.user,
			data: screendetails.data,
			applicationReference:applicationReferenceValue,
			product:screendetails.product,
			transunion:screendetails.transunion,
			rulesDetails:screendetails.rulesDetails,
			iscompleted:0,
			screenappversion:'',
			screeniosversion:'',
			offerdata:screenTrackingoffer.fullData,
			screenlevel: 1,
			creditscore:screendetails.creditscore,
			//consolidateaccount:screendetails.consolidateaccount,
			plaiduser:screendetails.plaiduser,
			incomeamount: incomeamount,
			accounts:screendetails.accounts,
			loanstatus: "Approved",
			loandescription: "Approved Income",
			  practicemanagement:screendetails.practicemanagement,
		  };

	  //sails.log.info("screenTrackingObject",screenTrackingObject);
	  //process.exit(1);

		  Screentracking.create(screenTrackingObject)
		  .then(function(screenTracking) {

			var consentCriteria = {
				paymentManagement:paymentid,
			};
				//sails.log.info("consentCriteria",consentCriteria);

			UserConsent
			.find(consentCriteria)
			.then(function(userConsentAgreement) {

				PaymentManagement.update({user: userdetails.id}, {status: "DENIED"})
							 .exec(function afterwards(err, updated){});

				Story.update({user: userdetails.id}, {status: 2})
							 .exec(function afterwards(err, updated){});

				Achdocuments.update({user: userdetails.id}, {status: 2})
							 .exec(function afterwards(err, updated){});

				UserConsent.update({user: userdetails.id,documentKey:'131'}, {loanupdated: 2})
							 .exec(function afterwards(err, updated){});

				sails.log.info("userdetails.id",userdetails.id);

				User.update({id: userdetails.id}, {registeredtype: "Customer Service"})
							 .exec(function afterwards(err, updated){});

				_.forEach(userConsentAgreement, function(consentagreement) {

					//sails.log.info("userConsentAgreement",userConsentAgreement);

				if(consentagreement.documentKey!='131')
				{
					userconsentObject={
						documentName: consentagreement.documentName,
						documentVersion:consentagreement.documentVersion,
						documentKey: consentagreement.documentKey,
						ip: consentagreement.ip,
						phoneNumber: consentagreement.phoneNumber,
						user: consentagreement.user,
						agreement: consentagreement.agreement,
						loanupdated: 1,
						agreementpath: consentagreement.agreementpath
					};

					UserConsent.create(userconsentObject)
					.then(function(userconsent) {


					})
					.catch(function(err) {
					sails.log.error("Screentracking UserConsent error::", err);
					});
				}

		   });
		})
		.catch(function(err) {
		sails.log.error("Screentracking UserConsent error::", err);
		});

		  sails.log.info("Screentracking#changeincomecreate :: created for Screentracking :: ", screenTracking);
		  return resolve(screenTracking);
		})
		.catch(function(err) {
		  sails.log.error("Screentracking :: changeincomecreate :: Error :: ", err);
		  return reject(err);
		});
		})
		.catch(function(err) {
		  sails.log.error("Screentracking :: changeincomecreate :: Error :: ", err);
		  return reject(err);
		});


		})
	  .catch(function(err) {
		  sails.log.error("Screentracking#changeincomecreate::", err);
		  return reject(err);
	  });
    });
}

function generateModifiedLoanOffer(userAccountres,financedAmount,changeterm,changerate,userdetails){
	//let me know once it done by sathish
	return Q.promise(function(resolve, reject) {

			var screendetails = loandetails.screentracking;

			var baseltiInterest = changerate;
			var baseLoanAmountCal = financedAmount;
			var financedAmount = financedAmount;
			var loanTerm = changeterm;
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
				Screentracking.update({id: userAccountres.id,iscompleted : 0}, {loanstatus: loanstatus, loandescription:'Approved Income'})
				.exec(function afterwards(err, updated){
				});
			}else{
				var loanstatus = "Denied";
				Screentracking.update({id: userAccountres.id,iscompleted : 0}, {loanstatus: loanstatus, loandescription:'postDTIThreshold Greater than 60'})
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


function getloanOfferdetails(screentracking){
	return Q.promise(function(resolve, reject) {

	var screenid = screentracking.id;
	//var criteria = { id: screenid,iscompleted : 0};
	var criteria = { id: screenid};

	//sails.log.info("criteria11111111111",criteria);

    Screentracking
    .findOne(criteria)
	.populate('plaiduser')
	.populate('user')
	.then(function (userAccountres) {

		//sails.log.info("userAccountres",userAccountres);

		var creditScore = parseFloat(userAccountres.creditscore);
		var state = userAccountres.user.state;
		var minimumIncomePlaid = sails.config.plaid.minincomeamount;
		var incomeamount = parseFloat(userAccountres.incomeamount/12).toFixed(2);

		Loanamountcap.find().then(function(loanDetCap){

			  var baseltiInterest = 0;
			  _.forEach(loanDetCap, function (loanDetCapValue) {
					if((creditScore >= loanDetCapValue.mincreditscore) && (creditScore <= loanDetCapValue.maxcreditscore)){
						baseltiInterest = parseFloat(loanDetCapValue.cap);
					}
			  	});
				//sails.log.info("baseltiInterest",baseltiInterest);
				var midValueNewIncome = "";
				var annualIncomeRange = sails.config.loan.annualIncomeRange;
				var annualUserIncome = parseFloat(userAccountres.incomeamount);
				//sails.log.info("annualUserIncome",annualUserIncome);
				_.forEach(annualIncomeRange, function(incomerange) {
						if((incomerange.minIncome < annualUserIncome) && ((parseInt(incomerange.maxIncome) + parseInt(1000)) >= annualUserIncome)){
						/*if((incomerange.minIncome <= annualUserIncome) && (incomerange.maxIncome > annualUserIncome)){*/
							if(incomerange.maxIncome == '999999'){
								midValueNewIncome = (((parseInt(74000) + parseInt(incomerange.minIncome)) / 2) / 12).toFixed(2);
							}else{
								midValueNewIncome = (((parseInt(incomerange.maxIncome) + parseInt(incomerange.minIncome)) / 2) / 12).toFixed(2);
							}
						}
					});


				if(midValueNewIncome == ""){
					midValueNewIncome = (((parseInt(annualIncomeRange[0].minIncome) + parseInt(annualIncomeRange[0].maxIncome)) / 2) / 12).toFixed(2);
				}
				var baseLoanAmountCal = parseFloat(midValueNewIncome * baseltiInterest/100);
				//sails.log.info("midValueNewIncome",midValueNewIncome);
				//sails.log.info("baseLoanAmountCal",baseLoanAmountCal);
				var baseLoanAmountCon = 0;
				if(baseLoanAmountCal > 1200){
					baseLoanAmountCon = 1200;
				}else{
					baseLoanAmountCon = baseLoanAmountCal;
				}
				var baseLoanAmount = 50 * (Math.floor(baseLoanAmountCon/50));

				//sails.log.info("baseLoanAmount",baseLoanAmount);
				var loanTerm = sails.config.loan.loanTerm;
				var paymentFeq = sails.config.loan.paymentFeq;

				stateratepaymentcycle.findStateByAbbr(state).then(function(result){

					//sails.log.info('result : ', result);

					if(result.rate){
						var interestRate = result.rate;
					}else{
						var interestRate = 0;
					}
					var APR = (interestRate * sails.config.loan.APR);

					var transcriteria = { id: userAccountres.transunion};
					Transunions
					.findOne(transcriteria).then(function(accdetails){

						var transacc = accdetails.trade;
						var monthlySchedulePayment = 0;
						 _.forEach(transacc, function (account) {
							if(account.terms){
								if(account.terms.paymentScheduleMonthCount){
									if(account.terms.paymentScheduleMonthCount == 'MIN'){
										if(account.terms.scheduledMonthlyPayment){
											monthlySchedulePayment = parseFloat(monthlySchedulePayment)+parseFloat(account.terms.scheduledMonthlyPayment);
										}
									}
								}
							}
						  });

						 //sails.log.info('monthlySchedulePayment : ', monthlySchedulePayment);

						var financedAmount = baseLoanAmount;
						var ir= (interestRate/100).toFixed(2);

						sails.log.info('ir : ', ir);

						var loanPaymentCycle = Math.abs(PaymentManagementService.calculatePMT(parseFloat(ir), parseFloat(loanTerm), parseFloat(financedAmount)));
						var monthlyPayment = Math.abs((loanPaymentCycle*26/12).toFixed(2));

						//sails.log.info('monthlyPayment : ', monthlyPayment);

						var perTotMonthlyPayment = Math.round(monthlySchedulePayment);
						var postTotMonthlyPayment = Math.round(parseFloat(monthlyPayment) + parseFloat(perTotMonthlyPayment));
						var preDTI = ((perTotMonthlyPayment / midValueNewIncome) * 100).toFixed(2);
						var postDTI = (((parseFloat(perTotMonthlyPayment) + parseFloat(monthlyPayment))/midValueNewIncome) * 100).toFixed(2);
						var postDTIThreshold = 60;

						//sails.log.info('postTotMonthlyPayment : ', postTotMonthlyPayment);

						var firstname = userAccountres.user.firstname;
						var loanstatus = userAccountres.loanstatus;


						var responseValue = {incomeamount:incomeamount,state:state,loanTerm:loanTerm,paymentFeq:paymentFeq,interestRate:interestRate,financedAmount:financedAmount,apr:APR,loanPaymentCycle:loanPaymentCycle,monthlyPayment:monthlyPayment,perTotMonthlyPayment:perTotMonthlyPayment,postTotMonthlyPayment:postTotMonthlyPayment,preDTI:preDTI,postDTI:postDTI,postDTIThreshold:postDTIThreshold,loanstatus:loanstatus,firstname:firstname};

						//sails.log.info('incomeamount : ', incomeamount);

						var newResponseValue = {fullData:responseValue,fullDataString:JSON.stringify(responseValue)}


						//sails.log.info('newResponseValue-dti-model-offer : ', newResponseValue);

						return resolve({
							code: 200,
							message: 'OFFER SUCCESS',
							offerresponse:newResponseValue
						});


					}).catch(function (err) {
						sails.log.info('err.code : ', err.code);
						return resolve({
							code: 500,
							message: 'NO OFFER'
						});
					});

				}).catch(function (err) {
				 sails.log.info('err.code : ', err.code);
				   return resolve({
						code: 500,
						message: 'NO OFFER'
					});
			   });


			}).catch(function (err) {

				return resolve({

					code: 500,
					message: 'NO OFFER'
				});
		    });

		})
		.catch(function (err) {
			 sails.log.error('Screentracking#getloanOfferdetails :: err', err);
			return resolve({
				code: 500,
				message: 'NO OFFER'
			});
		});


	});
}

function changepaymentschudle(paymentid,selecttransaction,reqdata){
	return Q.promise(function(resolve, reject) {

		var scheduledate = reqdata.param('scheduledate');
		var standardreason = reqdata.param('standardreason');
		var reasoncomment = reqdata.param('reasoncomment');

		if(paymentid){

			  var criteria = {
				id: paymentid
			  };
			  PaymentManagement
				.findOne(criteria)
				.populate('user')
				.then(function(paymentManagement) {

					Schedulehistory
					.changePaymentSchedule(paymentManagement)
					.then(function(paymentdata) {

					   var previousstartdate,formatedate,schldate;
					   var originalScheduleDate,newScheduleDate ;
					   var nextPaymentSchedule ='';
				       var maturityDate ='';

					  _.forEach(paymentManagement.paymentSchedule, function(schedule) {

						  var looptransaction = schedule.transaction;
						  var uniqueScheduleId = schedule.uniqueScheduleId;

						  if(selecttransaction<=looptransaction && schedule.status!='PAID OFF')
						  {

							if(uniqueScheduleId!='' && uniqueScheduleId!=null && "undefined" !== typeof uniqueScheduleId)
				            {
							    if(selecttransaction==looptransaction){
										schldate= moment(scheduledate).startOf('day').format();
										formatedate= moment(scheduledate).startOf('day').format('ddd, MMM Do YYYY');
										originalScheduleDate = moment(schedule.date).startOf('day').format('LLL');
					                	newScheduleDate = moment(schldate).startOf('day').format('LLL');

										schedule.date = schldate;
										schedule.formatedate = formatedate;
										schedule.standardreason = standardreason;
										schedule.reasoncomment = reasoncomment;
										nextPaymentSchedule =schldate;
						                maturityDate = schldate;
										//schedule.lastpaiddate = schldate;

								}else{
									  schldate = moment(previousstartdate).startOf('day').add(14, 'days').format();
									  formatedate = moment(previousstartdate).startOf('day').add(14, 'days').format('ddd, MMM Do YYYY');

									  schedule.date = schldate;
									  schedule.formatedate = formatedate;
									  maturityDate = schldate;
									  schedule.lastpaiddate = previousstartdate;
								}
								previousstartdate = schldate;


								// ------ Viking table date update -------------
								var vikingCriteria = {payment_id:paymentManagement.id,userId:paymentManagement.user.id,uniqueScheduleId:uniqueScheduleId};
								VikingRequest.find(vikingCriteria).then(function (vikingData){
									var vikingScheduleId = vikingData[0].uniqueScheduleId;
									sails.log.info('schldate : ', schldate);
									sails.log.info('vikingScheduleId : ', vikingScheduleId);
									VikingRequest.update({uniqueScheduleId: vikingScheduleId,payment_id:paymentManagement.id,userId:paymentManagement.user.id}, {scheduleDate : schedule.date})
									.exec(function afterwards(err, updated){
									});
								});

							}


						  }
					 });

					 paymentManagement.nextPaymentSchedule =nextPaymentSchedule;
				     paymentManagement.maturityDate = maturityDate;
					 paymentManagement.save(function(err) {
						  if (err)
						  {
							sails.log.error("Screentracking#changepaymentschudle :: Error :: ", err);
							return resolve({
							  code: 500,
							  message: 'Schedule date not updated'
						    });
						  }
						 var adminemail = reqdata.user.email;
						 var payID = paymentManagement.id
						 var todaydate= moment().startOf('day').format('LLL'); // February 23rd 2018, 3:53:52 pm;
						 var modulename = 'Changed payment schedule date';
						 var modulemessage = 'Schedule date changed by '+adminemail+' <br> Date changed from '+originalScheduleDate+' to '+newScheduleDate+'. <br>Reason: '+standardreason+' <br>Comment: '+reasoncomment+' <br>Date: '+todaydate;
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
							   return resolve({
								  code: 500,
								  message: 'Schedule date not updated'
							   });
						 });

					});
				})
			    .catch(function(err) {
					  return resolve({
						  code: 500,
						  message: 'Schedule date not updated'
					   });
			    });

			})
			.catch(function(err) {
				  return resolve({
					  code: 500,
					  message: 'Schedule date not updated'
				   });
			});

		}else{
			sails.log.error("Screentracking#changeincomecreate::", err);
			  return resolve({
				  code: 500,
				  message: 'Schedule date not updated'
			   });
		}


	});
}

function changepaymentamount(paymentid,selecttransaction,reqdata){
	return Q.promise(function(resolve, reject) {

	    var scheduleamount = reqdata.param('scheduleamount');
	    var standardreason = reqdata.param('standardreason');
	    var reasoncomment = reqdata.param('reasoncomment');
		var pushpayment = reqdata.param('pushpayment');
		var amounttransaction = reqdata.param('amounttransaction');

		var selectnexttransaction= parseInt(selecttransaction)+1;

		sails.log.info('pushpayment : ', pushpayment);

		  if(paymentid)
		  {

			  var criteria = {id: paymentid};
			  PaymentManagement
				.findOne(criteria)
				.populate('user')
				.then(function(paymentManagement) {

					Schedulehistory
					.changePaymentSchedule(paymentManagement)
					.then(function(paymentdata) {

						    sails.log.info('pushpayment : ', pushpayment);

							var remaininginterest = 0;
							var remainingprincipal =0;
							var balnceamount=0;
							var lastscheduledate;
							var nextscheduledate;
							var addnextupdate=0;

						   _.forEach(paymentManagement.paymentSchedule, function(schedule) {

							var looptransaction = schedule.transaction;
							lastscheduledate = schedule.date;
							var principalAmount = schedule.principalAmount;
							var interestAmount = schedule.interestAmount;
							var oldinterestAmount = schedule.interestAmount;
							var amount = schedule.amount;
							var date = schedule.date;
							nextscheduledate=schedule.date;

							  if(selecttransaction==looptransaction)
							  {

									if(scheduleamount > 0)
									{
										var paidprincipalAmount =0;
										var paidinterestAmount = 0;

										sails.log.info('scheduleamount : ', scheduleamount);
										sails.log.info('principalAmount : ', principalAmount);
										sails.log.info('interestAmount : ', interestAmount);

										if(scheduleamount >= interestAmount){
											remaininginterest = parseFloat(scheduleamount)-parseFloat(interestAmount);
											remainingprincipal = parseFloat(principalAmount)-parseFloat(remaininginterest);

											principalAmount = parseFloat(principalAmount)-parseFloat(remainingprincipal);
											interestAmount = parseFloat(interestAmount)-parseFloat(remaininginterest);
											balnceamount = parseFloat(amount)-parseFloat(scheduleamount);

											paidprincipalAmount = parseFloat(remaininginterest).toFixed(2);
											paidinterestAmount = parseFloat(scheduleamount).toFixed(2);
											addnextupdate =1;
										}
										if(scheduleamount <= interestAmount){
											remaininginterest = parseFloat(interestAmount)-parseFloat(scheduleamount);
											remainingprincipal = principalAmount;

											principalAmount = parseFloat(principalAmount).toFixed(2);
											interestAmount = parseFloat(scheduleamount).toFixed(2);
											balnceamount = parseFloat(amount)-parseFloat(scheduleamount);

											paidprincipalAmount = 0;
											paidinterestAmount = parseFloat(interestAmount).toFixed(2);
											addnextupdate =1;
										}

										sails.log.info('remaininginterest : ', remaininginterest);
										sails.log.info('remainingprincipal : ', remainingprincipal);
										sails.log.info('principalAmount : ', principalAmount);
										sails.log.info('interestAmount : ', interestAmount);
										sails.log.info('balnceamount : ', balnceamount);
										sails.log.info('paidprincipalAmount : ', paidprincipalAmount);
										sails.log.info('paidinterestAmount : ', paidinterestAmount);

									}

									schedule.principalAmount = principalAmount;
									schedule.interestAmount = oldinterestAmount;
									schedule.amount = parseFloat(scheduleamount).toFixed(2);
									/*schedule.paidprincipalAmount = paidprincipalAmount;
									schedule.paidinterestAmount = paidinterestAmount;
									schedule.lastpaidprincipalAmount = paidprincipalAmount;
									schedule.lastpaidinterestAmount = paidinterestAmount;*/
									schedule.standardreason = standardreason;
									schedule.reasoncomment = reasoncomment;
									//schedule.status = "PAID OFF";

									sails.log.info('schedule : ', schedule);

							  }

							  if(pushpayment=="nextpayment" && addnextupdate==1 && selectnexttransaction==looptransaction)
							  {
								    var totalprincipalAmount = parseFloat(principalAmount)+parseFloat(remainingprincipal);
									var totalinterestAmount = parseFloat(interestAmount)+parseFloat(remaininginterest);
									var totalschdule = parseFloat(totalprincipalAmount)+parseFloat(totalinterestAmount);
									var balancetotal=parseFloat(remaininginterest)+parseFloat(remainingprincipal);
									var startBalanceamt = schedule.startBalanceAmount;
									//var startBalancetotal = parseFloat(startBalanceamt)+parseFloat(balancetotal);
									var startBalancetotal = parseFloat(startBalanceamt);

									sails.log.info('startBalancetotal : ', startBalancetotal);

									schedule.principalAmount = parseFloat(totalprincipalAmount).toFixed(2);
									schedule.interestAmount = parseFloat(totalinterestAmount).toFixed(2);
									schedule.amount = parseFloat(totalschdule).toFixed(2);
									schedule.startBalanceAmount =parseFloat(startBalancetotal).toFixed(2);
							  }


						 });



					 if(pushpayment=="nextpayment" && addnextupdate==1)
					 {
						     //paymentManagement.paymentSchedule.push(scheduledata);
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
								 var modulemessage = 'Schedule amount changed by '+adminemail+' <br>Reason: '+standardreason+' <br>Comment: '+reasoncomment+' <br>Date: '+todaydate;
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
					 }

					 if(pushpayment=="addend")
					 {

						 paymentManagement.paymentSchedule = _.orderBy(paymentManagement.paymentSchedule, ['dates'], ['asc']);
						 var schedulecount = paymentManagement.paymentSchedule.length;
						 var schedulemonthcount = parseInt(schedulecount)+1;

						 sails.log.info('schedulemonthcount : ', schedulemonthcount);
						 sails.log.info('remainingprincipal : ', remainingprincipal);
						 sails.log.info('remaininginterest : ', remaininginterest);
						 sails.log.info('balnceamount : ', balnceamount);
						 sails.log.info('lastscheduledate222222 : ', lastscheduledate);

						  var startdate = moment(lastscheduledate).startOf('day').add(14, 'days').toDate();
			              var formatedate = moment(lastscheduledate).startOf('day').add(14, 'days').format('ddd, MMM Do YYYY');

						  sails.log.info('startdate : ', startdate);
						  sails.log.info('formatedate : ', formatedate);

						  var scheduledata = {
								monthcount:schedulemonthcount ,
								startBalanceAmount: parseFloat(remainingprincipal).toFixed(2),
								principalAmount:parseFloat(remainingprincipal).toFixed(2),
								interestAmount: parseFloat(remaininginterest).toFixed(2),
								amount: balnceamount,
								paidprincipalAmount:0,
								paidinterestAmount:0,
								lastpaidprincipalAmount:0,
								lastpaidinterestAmount:0,
								lastpaidcount:0,
								date: startdate,
								lastpaiddate: formatedate,
								transaction:schedulemonthcount,
								status: 'OPENED'
						 }

						 paymentManagement.paymentSchedule.push(scheduledata);
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
							 var modulemessage = 'Schedule amount changed by '+adminemail+' <br>Reason: '+standardreason+' <br>Comment: '+reasoncomment+' <br>Date: '+todaydate;
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


					}

				  }).catch(function(err) {
						return resolve({
							code: 500,
							message: 'INTERNAL_SERVER_ERROR'
						});
				 });


			}).catch(function(err) {
				return resolve({
					code: 500,
					message: 'INTERNAL_SERVER_ERROR'
				});
		   });


		}else{
			sails.log.error("Screentracking#changeincomecreate::", err);
			return resolve({
				code: 500,
				message: 'INTERNAL_SERVER_ERROR'
			});
		}



	});

}


function loanofferinfoAction(screenId){

	return Q.promise(function(resolve, reject) {

			var criteria = { id: screenId,iscompleted : 0};
			Screentracking
			.findOne(criteria)
			.populate('plaiduser')
			.populate('user')
			 .then(function (userAccountres) {

				var creditScore = parseFloat(userAccountres.creditscore);
				var state = userAccountres.user.state;
				var minimumIncomePlaid = sails.config.plaid.minincomeamount;
				var incomeamount = parseFloat(userAccountres.incomeamount/12).toFixed(2);

				if(userAccountres.accounts!='' && userAccountres.accounts!=null && "undefined" !== typeof userAccountres.accounts)
				{
					//sails.log.info('userAccountres : ', userAccountres);

					var productcriteria = { id: userAccountres.product };
					Productlist.findOne(productcriteria)
					 .then(function(productdata){

						var productname = productdata.productname;
						var productid = userAccountres.product;
						var procriteria = { productid: productid };
						var userid = userAccountres.user.id;
						var loanstatus = 'Incomplete';
							Screentracking.update({id: userAccountres.id,iscompleted : 0}, {loanstatus: loanstatus, loandescription:'Approved Income'})
							.exec(function afterwards(err, updated){

							});
							Loanproductsettings
							.find(procriteria)
							.then(function (loandetails) {
								sails.log.info('loandetails : ', loandetails);

								sails.log.info('userAccountres.user : ', userAccountres.user);

							Loanamountcap.
							find()
							.then(function(loanDetCap){

								var baseltiInterest = 0;
								_.forEach(loanDetCap, function (loanDetCapValue) {
										if((creditScore >= loanDetCapValue.mincreditscore) && (creditScore <= loanDetCapValue.maxcreditscore)){
											baseltiInterest = parseFloat(loanDetCapValue.cap);
										}
									});

								var midValueNewIncome = "";
								var annualIncomeRange = sails.config.loan.annualIncomeRange;
								var annualUserIncome = parseFloat(userAccountres.incomeamount);

								_.forEach(annualIncomeRange, function(incomerange) {
										if((incomerange.minIncome < annualUserIncome) && ((parseInt(incomerange.maxIncome) + parseInt(1000)) >= annualUserIncome)){
											if(incomerange.maxIncome == '999999'){
												midValueNewIncome = (((parseInt(74000) + parseInt(incomerange.minIncome)) / 2) / 12).toFixed(2);
											}else{
												midValueNewIncome = (((parseInt(incomerange.maxIncome) + parseInt(incomerange.minIncome)) / 2) / 12).toFixed(2);
											}
										}
									});

								if(midValueNewIncome == ""){
									midValueNewIncome = (((parseInt(annualIncomeRange[0].minIncome) + parseInt(annualIncomeRange[0].maxIncome)) / 2) / 12).toFixed(2);
								}

								var baseLoanAmountCal = parseFloat(midValueNewIncome * baseltiInterest/100);

								var baseLoanAmountCon = 0;
								if(baseLoanAmountCal > 1200){
									baseLoanAmountCon = 1200;
								}else{
									baseLoanAmountCon = baseLoanAmountCal;
								}
								var baseLoanAmount = 50 * (Math.floor(baseLoanAmountCon/50));
									var financedAmount = baseLoanAmount;
										var loanTerm = sails.config.loan.loanTerm;
								var paymentFeq = sails.config.loan.paymentFeq;
								stateratepaymentcycle.findStateByAbbr(state).then(function(result){
									  if(result.rate){
											var interestRate = result.rate;
										}else{
											var interestRate = 0;
										}
										var APR = (interestRate * sails.config.loan.APR );
										var transcriteria = { id: userAccountres.transunion};

									Transunions.findOne(transcriteria).then(function(accdetails){

									var transacc = accdetails.trade;

											var monthlySchedulePayment = 0;

									 _.forEach(transacc, function (account) {
										if(account.terms){
											if(account.terms.paymentScheduleMonthCount){
												if(account.terms.paymentScheduleMonthCount == 'MIN'){
													if(account.terms.scheduledMonthlyPayment){
														monthlySchedulePayment = parseFloat(monthlySchedulePayment)+parseFloat(account.terms.scheduledMonthlyPayment);
													}
												}
											}
										}
									  });
									 sails.log.info('monthlySchedulePayment : ', monthlySchedulePayment);

									var ir= (interestRate/100).toFixed(2);
									var loanPaymentCycle = Math.abs(PaymentManagementService.calculatePMT(parseFloat(ir), parseFloat(loanTerm), parseFloat(financedAmount)));

									sails.log.info("loanPaymentCycle: ",loanPaymentCycle);

									var monthlyPayment = Math.abs((loanPaymentCycle*26/12).toFixed(2));
									var perTotMonthlyPayment = monthlySchedulePayment;
									var postTotMonthlyPayment = parseFloat(monthlyPayment) + parseFloat(perTotMonthlyPayment);
									var preDTI = ((perTotMonthlyPayment / midValueNewIncome)* 100).toFixed(2);
									var postDTI = (((parseFloat(perTotMonthlyPayment) + parseFloat(monthlyPayment))/midValueNewIncome)* 100).toFixed(2);

									var postDTIThreshold = 60;
									if(postDTI < postDTIThreshold){
										var loanstatus = "Approved";
										Screentracking.update({id: userAccountres.id,iscompleted : 0}, {loanstatus: loanstatus, loandescription:'Approved Income'})
										.exec(function afterwards(err, updated){
										});
									}else{
										var loanstatus = "Denied";
										Screentracking.update({id: userAccountres.id,iscompleted : 0}, {loanstatus: loanstatus, loandescription:'Less Incom'})
										.exec(function afterwards(err, updated){

										});
									}
									 var firstname = userAccountres.user.firstname;

									var responseValue = {incomeamount:incomeamount,state:state,loanTerm:loanTerm,paymentFeq:paymentFeq,interestRate:interestRate,financedAmount:financedAmount,apr:APR,loanPaymentCycle:loanPaymentCycle,monthlyPayment:monthlyPayment,perTotMonthlyPayment:perTotMonthlyPayment,postTotMonthlyPayment:postTotMonthlyPayment,preDTI:preDTI,postDTI:postDTI,postDTIThreshold:postDTIThreshold,loanstatus:loanstatus,firstname:firstname,userid:userid,productid:productid,userAccountres:userAccountres};


										return resolve(responseValue);
								   	})

									})

								})
								.catch(function (err) {
									 sails.log.error('ScreentrackingController#loanofferinfoAction :: err', err);
									  return reject(err);
								});

							})
							.catch(function (err) {
								 sails.log.error('ScreentrackingController#loanofferinfoAction :: err', err);
								  return reject(err);
							});
					 })
					 .catch(function (err) {
						 sails.log.error('ScreentrackingController#myoffersAction :: err', err);
						  return reject(err);
					 });
				} else {
					return resolve({
						code: 500,
						message: 'INTERNAL_SERVER_ERROR'
					});
				}
			})
			.catch(function (err) {
				 sails.log.error('ScreentrackingController#loanofferinfoAction :: err', err);
				 /*req.session.successmsg='';
				 req.session.successmsg = 'Offer has been submitted already!';
				 var redirectpath ="/admin/incompleteApplication";
				 return res.redirect(redirectpath);*/
				 return reject(err);
			});


	});
}

function updateBadListLoan(lastScreenName,lastlevel,user,data,product,idobj){

	return Q.promise(function(resolve, reject) {

		Screentracking
		  .checkscreentrackingdetails(lastScreenName,lastlevel,user,data,product,idobj)
		  .then(function(screendetails) {

				screendetails.offerdata=[{financedAmount:0}];
				Story
			     .createUserstory(user,screendetails)
				 .then(function(story) {

						sails.log.info("story::", story);

						return User.getNextSequenceValue('loan')
						  .then(function(loanRefernceData) {

									//sails.log.info("loanRefernceDataloanRefernceData",loanRefernceData);
								   var loanRefernceDataValue ='LN_'+loanRefernceData.sequence_value;
								   var logdata =[ {
									message:"",
									date: new Date()
								   }];
								   var maturityDate = moment().startOf('day').toDate();
								   var paymentSchedule = [];
								   var payobj = {
										paymentSchedule: paymentSchedule,
										maturityDate: maturityDate,
										story: story.id,
										user: story.user.id,
										payOffAmount: parseFloat(story.requestedAmount?story.requestedAmount.toString():"0"),
										account: screendetails.accounts ? screendetails.accounts: '',
										nextPaymentSchedule:maturityDate,
										achstatus:2,
										loanReference: loanRefernceDataValue,
										logs:logdata,
										isPaymentActive : true,
										screentracking:screendetails.id,
										creditScore:screendetails.creditscore
									  };


								  PaymentManagement.create(payobj)
								  .then(function(paymentDet) {

									return resolve(paymentDet);

									/*var usercriteria = {
										id: story.user.id
									  };
									  User
									  .findOne(usercriteria)
									  .then(function(userDetail) {

											userDetail.isExistingLoan = false;
											//userDetail.isBankAdded = false;
											userDetail.isUserProfileUpdated = false;
											userDetail.save();

											var consentCriteria = {
											  user:story.user.id,
											  loanupdated:1
											};
											UserConsent
											.find(consentCriteria)
											.sort("createdAt DESC")
											.then(function(userConsentAgreement) {

												_.forEach(userConsentAgreement, function(consentagreement) {
													UserConsent.updateUserConsentAgreement(consentagreement.id,story.user.id,paymentDet.id);
												});
											 })
											 .catch(function(err) {
												sails.log.error("Screentracking::updatedeclinedloan UserConsent error::", err);
											 });
											 //Update screentracking
											Screentracking
											  .findOne({
												  user :story.user.id,
												  iscompleted : 0
												})
												.then(function(screenTracking){
												  if(screenTracking)
												  {
													 screenTracking.iscompleted = 1;
													 screenTracking.rulesDetails = idobj.rulesDetails;
													 screenTracking.product = product;
													 screenTracking.save();

												  }
												  return resolve({
													   screenId : 	screenTracking.id,
													   errorCode : 400,
													   message: "This account could not  be approved due to insufficient transaction"
													});
											});

												 return resolve({
													   screenId : 	screenTracking.id,
													   errorCode : 205,
													   message: "This user is in BadList"
													});



									  })
									  .catch(function(err) {
										  sails.log.error("Screentracking::updatedeclinedloan::Error", err);
										  return reject(err);
									  })*/

								  })
								   .catch(function(err) {
									  sails.log.error("Screentracking::updatedeclinedloan-", err);
									  return reject(err);
								  });

					   });

			 })
			 .catch(function(err) {
				sails.log.error("Screentracking::updatedeclinedloan--", err);
				return reject(err);
			});


		})
	     .catch(function(err) {
		    sails.log.error("Screentracking::updatedeclinedloan---", err);
			return reject(err);
	    });

    });
}

function checkLoanexsitsAction(userid){

	return Q.promise(function(resolve, reject) {

	            var payoptions = {
					user: userid,
					//$or : [ { status : 'OPENED' }, { status : 'PAID OFF' }, { status : 'CLOSED' }, {status: "PENDING" } ],
					achstatus: [0,1,2,3]
				};

				PaymentManagement
				.findOne(payoptions)
				.sort("createdAt DESC")
				.then(function(payDetails){
					//return resolve(payDetails);
					if(payDetails)
					{
						return resolve({
						   code : 200,
						   redirectpage: "/dashboard"
						});
					}
					else
					{
						return resolve({
						   code : 200,
						   redirectpage: "/createapplication"
						});
					}
				})
				.catch(function (err) {
					    return resolve({
						   code : 400,
						   redirectpage: "/createapplication"
						});
			    });

	});
}

function updateApplicationDetails(userDetail,userArray,addressarray,transactionControl,certificate) {
  return Q.promise(function(resolve, reject) {

	var transcriteria={
		user:userDetail.id
	};

	sails.log.info("transcriteria",transcriteria);

	Transunionhistory
	.findOne(transcriteria)
	.sort("createdAt DESC")
	.then(function(transunionhistoryData) {

		 var creditReport = transunionhistoryData.responsedata.creditBureau;
		 var transError = transunionhistoryData.responsedata.error;

		 if(transError){

			    /*var errormessage ='Your application has been declined, due to record '+screenTracking.transError.errortext+')';
			    var responsedata = {
					code: 400,
					message: errormessage
			    };
			    return resolve(responsedata); */

			 	//-- Update decline in screentracking
				var idobj ={
					 transid : '',
					 accountid:'',
					 rulesDetails:'',
					 creditscore:''
				 }
				 var dataObject = {
					addressarray : addressarray,
					userArray:userArray,
					transactionControl:transactionControl,
					certificate:certificate
				 };

				 var product = sails.config.product.productid;

				     Screentracking
					 .updatedeclinedloan('Application',1,userDetail,dataObject,product,idobj,transError)
					 .then(function(screenTracking) {

							if(transError.errortext)
							{
								var tranunsionerrorMessage = transError.errortext;
								var updateDatares = {deniedmessage:'Your application has been declined, due to ('+tranunsionerrorMessage+')'};
							}
							else
							{
								var updateDatares = {deniedmessage:'Unable to fetch credit score and your application has been declined'};
							}

							Screentracking.update({id: screenTracking.screenId}, updateDatares)
							 .exec(function afterwards(err, updated){
								  var responsedata = {
									code: 400,
									message: transError,
									screenTracking:screenTracking
								 };
								 return resolve(responsedata);
							 });

					});

		 } else if(creditReport)
		 {
			   if(creditReport.product.error)
			   {
				    //-- Update decline in screentracking
				var idobj ={
					 transid : '',
					 accountid:'',
					 rulesDetails:'',
					 creditscore:''
				 }
				 var dataObject = {
					addressarray : addressarray,
					userArray:userArray,
					transactionControl:transactionControl,
					certificate:certificate
				 };

				 var product = sails.config.product.productid;

				    Screentracking
					 .updatedeclinedloan('Application',1,userDetail,dataObject,product,idobj,creditReport.product.error)
					 .then(function(screenTracking) {

							var producterror= creditReport.product.error.description;
							var updateDatares = {deniedmessage:'Your application has been declined, due to record ('+producterror+')'};
							Screentracking.update({id: screenTracking.screenId}, updateDatares)
							 .exec(function afterwards(err, updated){
								  var responsedata = {
									code: 400,
									message: producterror,
									screenTracking:screenTracking
								 };
								 return resolve(responsedata);
							 });

					});
			   }
			   else if(creditReport.product.subject.subjectRecord.custom)
			   {

				    sails.log.info("test else ");
			 		var transunion_first_name='';
					var transunion_middle_name='';
					var transunion_last_name ='';
					var transunion_address ='';
					var transunion_socialSecurity_number='';
					var transunion_employment ='';

					if(creditReport.product.subject.subjectRecord.indicative)
					{
						if(Array.isArray(creditReport.product.subject.subjectRecord.indicative.name))
						{
							var  creditUserName = creditReport.product.subject.subjectRecord.indicative.name[0];

							if(creditUserName.person.first)
							{
								var transunion_first_name = creditUserName.person.first;
							}

							if(creditUserName.person.middle)
							{
								var transunion_middle_name = creditUserName.person.middle;
							}

							if(creditUserName.person.last)
							{
								var transunion_last_name = creditUserName.person.last;
							}
						}
						else
						{
							if(creditReport.product.subject.subjectRecord.indicative.name.person.first)
							{
								var transunion_first_name = creditReport.product.subject.subjectRecord.indicative.name.person.first;
							}

							if(creditReport.product.subject.subjectRecord.indicative.name.person.middle)
							{
								var transunion_middle_name = creditReport.product.subject.subjectRecord.indicative.name.person.middle;
							}

							if(creditReport.product.subject.subjectRecord.indicative.name.person.last)
							{
								var transunion_last_name = creditReport.product.subject.subjectRecord.indicative.name.person.last;
							}
						}

						if(creditReport.product.subject.subjectRecord.indicative.address)
						{
							var transunion_address = creditReport.product.subject.subjectRecord.indicative.address;
						}

						if(Array.isArray(creditReport.product.subject.subjectRecord.indicative.socialSecurity))
						{
							var transunion_socialSecurity_number= creditReport.product.subject.subjectRecord.indicative.socialSecurity[0].number;
						}
						else
						{
							if(creditReport.product.subject.subjectRecord.indicative.socialSecurity)
							{
								if(creditReport.product.subject.subjectRecord.indicative.socialSecurity.number) {
									var transunion_socialSecurity_number= creditReport.product.subject.subjectRecord.indicative.socialSecurity.number;
								}
							}
						}

						if(creditReport.product.subject.subjectRecord.indicative.employment)
						{
							var transunion_employment = creditReport.product.subject.subjectRecord.indicative.employment;
						}
					}

					var transunion_credit_trade ='';
					var transunion_credit_collection = '';
					var transunion_credit_inquiry = '';
					if(creditReport.product.subject.subjectRecord.custom)
					{
						if(creditReport.product.subject.subjectRecord.custom.credit.trade)
						{
							var transunion_credit_trade = creditReport.product.subject.subjectRecord.custom.credit.trade;
						}

						if(creditReport.product.subject.subjectRecord.custom.credit.collection)
						{
							var transunion_credit_collection = creditReport.product.subject.subjectRecord.custom.credit.collection;
						}

						if(creditReport.product.subject.subjectRecord.custom.credit.inquiry)
						{
							var transunion_credit_inquiry = creditReport.product.subject.subjectRecord.custom.credit.inquiry;
						}
					}

					var transunion_scrore = '';
					var transunion_addOnProduct = '';
					if(creditReport.product.subject.subjectRecord.addOnProduct)
					{
						var transunion_addOnProduct = creditReport.product.subject.subjectRecord.addOnProduct;

						if(creditReport.product.subject.subjectRecord.addOnProduct.scoreModel)
						{
						   if(creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.noScoreReason)
						   {
							   		//-- Update decline in screentracking
								//No Hit
								var noscoreError = creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.noScoreReason;
								 var idobj ={
									 transid : '',
									 accountid:'',
									 rulesDetails:'',
									 creditscore:''
								 }
								 var dataObject = {
									addressarray : addressarray,
									userArray:userArray,
									transactionControl:transactionControl,
									certificate:certificate
								 };

								 var product = sails.config.product.productid;

									Screentracking
									 .updatedeclinedloan('Application',1,userDetail,dataObject,product,idobj,noscoreError)
									 .then(function(screenTracking) {

										var updateDatares = {deniedmessage:'Your application has been declined, due to record '+noscoreError+')'};
										Screentracking.update({id: screenTracking.screenId}, updateDatares)
										 .exec(function afterwards(err, updated){
											  var responsedata = {
												code: 500,
												message: noscoreError,
												screenTracking:screenTracking
											 };
											 return resolve(responsedata);
										 });
									});

						   }
						   else
						   {

								if(creditReport.product.subject.subjectRecord.addOnProduct.scoreModel)
								{
									var transunion_scrore = creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.results;
								}
								else
								{
									_.forEach(creditReport.product.subject.subjectRecord.addOnProduct, function(value , key) {
										if(value.code == "00W18" && value.scoreModel)
										{
											transunion_scrore = value.scoreModel.score.results;
										}
									});
								}
						   }
						}
						else
						{

							if(Array.isArray(creditReport.product.subject.subjectRecord.addOnProduct))
							{
								_.forEach(creditReport.product.subject.subjectRecord.addOnProduct, function(value , key) {

									   if(value.code == "00W18" && value.scoreModel!='' && value.scoreModel!=null && "undefined" !== typeof value.scoreModel)
										{
											if(value.scoreModel.score.results!='' && value.scoreModel.score.results!=null && "undefined" !== typeof value.scoreModel.score.results){
												transunion_scrore = value.scoreModel.score.results;
											}

										}
								});
							}
						}
					}

					//sails.log.info("transunion_scrore00000: ",transunion_scrore);

					if(!Array.isArray(transunion_employment))
					{
						var transunion_employment_data =[];
						transunion_employment_data.push(transunion_employment);
					}
					else
					{
						var transunion_employment_data =transunion_employment;
					}

					if(!Array.isArray(transunion_address))
					{
						var transunion_address_data =[];
						transunion_address_data.push(transunion_address);
					}
					else
					{
						var transunion_address_data =transunion_address;
					}

					if(!Array.isArray(transunion_credit_trade))
					{
						var transunion_credit_trade_data =[];
						transunion_credit_trade_data.push(transunion_credit_trade);
					}
					else
					{
						var transunion_credit_trade_data =transunion_credit_trade;
					}

					if(!Array.isArray(transunion_credit_inquiry))
					{
						var transunion_credit_inquiry_data =[];
						transunion_credit_inquiry_data.push(transunion_credit_inquiry);
					}
					else
					{
						var transunion_credit_inquiry_data =transunion_credit_inquiry;
					}

					//sails.log.info("test else next ");

						var translogdata = {
							user: userDetail.id,
							response:creditReport,
							first_name: transunion_first_name,
							middle_name: transunion_middle_name,
							last_name: transunion_last_name,
							house_number: transunion_address_data,
							socialSecurity: transunion_socialSecurity_number,
							employment: transunion_employment_data,
							trade: transunion_credit_trade_data,
							credit_collection: transunion_credit_collection,
							inquiry: transunion_credit_inquiry_data,
							addOnProduct: transunion_addOnProduct,
							score:transunion_scrore,
							status:0,
						}

						//sails.log.info("translogdata",translogdata);

						var creditscore = transunion_scrore;
						creditscore = parseInt(creditscore.replace('+',''));

						Transunions.create(translogdata)
						.then(function(transuniondetails) {

								Consolidateaccount
								.createconsolidateaccount(transuniondetails)
					 			.then(function (accdet) {

									var product=sails.config.product.productid;
									var lastScreenName='Transunion';
									var lastlevel = 3;
									var idobj ={
										 transid : transuniondetails.id,
										 accountid:'',
										 rulesDetails:'',
										 creditscore:creditscore
									 }
									 var dataObject = {
										addressarray : addressarray,
										userArray:userArray,
										transactionControl:transactionControl,
										certificate:certificate
									 };

									Screentracking
									 .createLastScreenName(lastScreenName,lastlevel,userDetail,dataObject,product,idobj)
									 .then(function(screenTracking) {

										var updateData = {consolidateaccount: accdet.consolidateaccount.id};
										 Screentracking.update({id: screenTracking.id}, updateData)
										 .exec(function afterwards(err, updated){

										 });
										    //--For testing purpose
											//var	creditscore	=	100;

											if(creditscore >= sails.config.product.minCreditScore)
											{

												ApplicationService.getProductRule(creditReport,transunion_scrore, userDetail.practicemanagement, screenTracking.id )
												   .then(function (rulesDetails) {


													  if(rulesDetails.loanstatus=='Denied')
													  {
															var lastScreenName='Application';
															var lastlevel = 1;
															var idobj ={
																 transid : transuniondetails.id,
																 accountid:'',
																 rulesDetails:rulesDetails,
																 creditscore:rulesDetails
															 }
															 var dataObject = {
																addressarray : addressarray,
																userArray:userArray,
																transactionControl:transactionControl,
																certificate:certificate
															 };

															Screentracking
															.updatedeclinedloan(lastScreenName,lastlevel,userDetail,dataObject,product,idobj)
															.then(function(screenTracking) {

																var updateDatares = {deniedmessage:'Your application has been denied due to Rules not matched!'};
																var screenTrackingId	=	screenTracking.screenId
																Screentracking.update({id: screenTrackingId}, updateDatares)
																 .exec(function afterwards(err, updated){


																	 return resolve({
																	  code: 402,
																	   message: 'Your application has been denied due to Rules not matched!',
																	   screenTracking:screenTracking
																	});

																 });

																});
														}
														else
														{
														   var productselctid = sails.config.product.productid;
														   var updateData = {lastlevel: 3,product:productselctid,rulesDetails:rulesDetails,creditscore:creditscore};
														   Screentracking.update({id: screenTracking.id}, updateData)
														   .exec(function afterwards(err, updated){
																   var responsedata = {
																		code: 200,
																		message:"Transunion data for customer fetched successfully.",
																		transuniondetails:transuniondetails,
																		rulesDetails:rulesDetails,
																		screenTracking:screenTracking
																   };
																   return resolve(responsedata);

															});
														}

												})
												.catch(function (err) {

													if(transunion_scrore!='' && transunion_scrore!=null && "undefined" !== typeof transunion_scrore)
													{
															//sails.log.info("Enter catch if loop:");
															Screentracking
															 .updatedeclinedloan(lastScreenName,lastlevel,userDetail,dataObject,product,idobj)
															 .then(function(screenTracking) {

																   var errorMessage='Your application has been declined, failed to match rules';
																   var updateDatares = {deniedmessage:errorMessage};
																	Screentracking.update({id: screenTracking.screenId}, updateDatares)
																	 .exec(function afterwards(err, updated){
																		  var responsedata = {
																			code: 400,
																			message: errorMessage,
																			screenTracking:screenTracking
																		 };
																		 return resolve(responsedata);
																	 });

																   //return reject(err);
															});
													}
													else
													{
															//sails.log.error("ApplicationService#createcertificate::Err ::", err);
															return reject(err);
													}
												});
										}
										else
										{

											Screentracking
											 .updatedeclinedloan(lastScreenName,lastlevel,userDetail,dataObject,product,idobj)
											 .then(function(screenTracking) {
													//sails.log.info("I am heree:",screenTracking);
													var screenTrackingId	=	screenTracking.screenId
													var updateDatares = {deniedmessage:'Your application has been declined, due to low credit score!'};
													Screentracking.update({id: screenTrackingId}, updateDatares)
													 .exec(function afterwards(err, updated){

 														/*User.callDeclinedEmail(screenTrackingId)
														 .then(function (userObjectData) {
														})
														.catch(function (err) {
														  sails.log.error('#AppService:updateApplicationDetails:callDeclinedEmail :: err :', err);
														  return res.handleError(err);
														});*/

														var responsedata = {
															code: 300,
															message:"Your application has been declined, due to low credit score!",
															screenTracking:screenTracking
													   };
													   return resolve(responsedata);
													 });

											});

										}
									})
									.catch(function (err) {
										sails.log.error("ApplicationService#createcertificate::Err ::", err);
										return reject(err);
									});

								})
								.catch(function (err) {
									sails.log.error("ApplicationService#createcertificate::Err ::", err);
									return reject(err);
								});
						})
						.catch(function (err) {
							sails.log.error("ApplicationService#createcertificate::Err ::", err);
							return reject(err);
						});

				}
				else
		   		{

					 var idobj ={
						 transid : '',
						 accountid:'',
						 rulesDetails:'',
						 creditscore:''
					 }
					 var dataObject = {
						addressarray : addressarray,
						userArray:userArray,
						transactionControl:transactionControl,
						certificate:certificate
					 };

					 var product = sails.config.product.productid;

					 Screentracking
					 .updatedeclinedloan('Application',3,userDetail,dataObject,product,idobj,creditReport.product.error)
					 .then(function(screenTracking) {
							 const isCreditReportFreeze = (creditReport.product.subject.subjectRecord.fileSummary.creditDataStatus.freeze.indicator == "true")
							 if(creditReport.product.subject.subjectRecord.fileSummary.ssnMatchIndicator == 'noHit')
							 {
								 var errormessage ='Your application has been declined, due to noHit';
							 }
							 else if (isCreditReportFreeze) {
								 var errormessage ='We are unable to retrieve your credit report please contact us at contact@mondernhealtnfinance.com';
							 } else
							 {
							     var errormessage ='Could not recieve your credit details';
							 }

							 var updateDatares = {deniedmessage:errormessage};

							 Screentracking.update({id: screenTracking.screenId}, updateDatares)
							 .exec(function afterwards(err, updated){

								 var responsedata = {
									code: 400,
									message: errormessage,
									screenTracking: screenTracking
								 };

								 return resolve(responsedata);
							 });
					 });
				}
		 }

	})
	 .catch(function (err) {
		sails.log.error("ApplicationService#createcertificate::Err ::", err);
		return resolve({
		  code: 402,
		   message: 'Could not recieve your credit details!'
		});
	 });

  });
}

function createcertificate(userArray,addressarray,ssn_number,userDetail,transactionControl){
	return Q.promise(function(resolve, reject) {

		var apppath = sails.config.appPath+'/';

		sails.log.info("userArray",userArray);
		sails.log.info("addressarray",addressarray);
		sails.log.info("userDetail",userDetail);

		var subjectRecord =  {
		  'indicative':{
				'name':{
					'person':userArray
				 },
				 'address':{
					 'status':'current',
					 'street':{
							'number':addressarray.untiapt,
							'name':addressarray.street_name
					 },
					 'location':{
							'city':  addressarray.city,
							'state':  addressarray.state,
							'zipCode':  addressarray.zip_code
					 },
					 'residence':{
					  }
				 },
				 'socialSecurity':{
					  'number':ssn_number //ssn_number //'666429061'
				  },
				 'dateOfBirth':(typeof(userDetail.dateofBirth) != "undefined") ? userDetail.dateofBirth : moment().format('YYYY-MM-DD')
			  },
			  // 'addOnProduct':{
				//  'code':'00W18',//00P02
				//  'scoreModelProduct':'true'
			  // }
		};

		var productData =  {
			'code':'07000',
			'subject':{
				'number':'1',
				'subjectRecord':subjectRecord

			},
			'responseInstructions':{
			  'returnErrorText':'true',
				"embeddedData": "pdf",
			  'document':null,
			},
			'permissiblePurpose':{
			   'inquiryECOADesignator':'individual'
			}
	   }

		var apiVersionr= sails.config.transunion.version;
		var requestData =  {
			'document':'request',
			'version': apiVersionr,
			'transactionControl': transactionControl,
			'product':productData
		}

		var userData = {
			'first_name' : userArray.first,
			'middle_name' : userArray.middle,
			'email' : userDetail.email,
			'last_name' : userArray.last,
			'untiapt':addressarray.untiapt,
			'street_name' :addressarray.street_name,
			'city' : addressarray.city,
			'state' : addressarray.state,
			'zip_code' : addressarray.zip_code,
			'ssn_number':ssn_number,
			'dob':userDetail.dateofBirth,
		};

		sails.log.info("userData",userData);

		var transrequestdata = {userData:userData,requestData:requestData};

		var transinfodata = {
				user: userDetail.id,
				requestdata:transrequestdata,
				status:0
		};

		Transunionhistory.create(transinfodata)
		.then(function(historydetails) {

				var historyID = historydetails.id;

				var builder = new xml2js.Builder();
				var reqdata = builder.buildObject(requestData);
				var reqdata = reqdata.replace(/\n|\r|\s/g, "");
				var xmldata = reqdata.replace('<?xmlversion="1.0"encoding="UTF-8"standalone="yes"?><root>', '<?xml version="1.0" encoding="UTF-8"?><creditBureau xmlns="http://www.transunion.com/namespace" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.transunion.com/namespace">');
				xmldata=xmldata.replace('</root>','</creditBureau>');

				var apiBaseUrl= sails.config.transunion.baseUrl;
				var url = apiBaseUrl;
				var pempath = sails.config.transunion.certificate.crtPath;
				var pemkeypath = sails.config.transunion.certificate.keyPath;
				var certfile = path.join( apppath, pempath );
				var keyfile= path.join( apppath, pemkeypath );

				fs.appendFileSync('logs/translog/transunionRequest.txt', 'RequestData_'+userDetail.id+'_'+moment().format('YYYY-MM-DD-hh-mm-ss')+'_::::'+xmldata+'--\n\n\n');

				var bodydata='';
			    var curl = new Curl();
				curl.setOpt('URL', url);
				curl.setOpt('FOLLOWLOCATION', true );
				curl.setOpt('AUTOREFERER', true );
				curl.setOpt('POST', true );
				curl.setOpt('SSL_VERIFYHOST', 0);
				curl.setOpt('SSL_VERIFYPEER', 0);
				curl.setOpt('POSTFIELDS', xmldata);
				curl.setOpt(
					Curl.option.HTTPHEADER,
					['User-Agent: node-libcurl/1.0', 'Content-Type: text/xml']
				);
				curl.setOpt('SSLCERT', certfile);
				curl.setOpt('SSLKEY', keyfile);
				curl.setOpt('KEYPASSWD', sails.config.transunion.certificate.password );
				curl.on('end', function (statusCode, bodydata, headers) {

					fs.appendFileSync('logs/translog/transunionRsponse_'+userDetail.id+'_'+moment().format('YYYY-MM-DD-hh-mm-ss')+'.txt', bodydata);

					var parser = new xml2js.Parser( { charkey: "_val", explicitArray: false, mergeAttrs: true } );

					parser.parseString(bodydata, function(err,result){

						sails.log.info("result",JSON.stringify(result));

						var historystatus=0;
						if(statusCode==200)
						{
							historystatus=1;
						}
						else
						{
							historystatus=2;
						}

						var transhistorycriteria={
							user:userDetail.id,
							id: historyID
						};

						sails.log.info("transhistorycriteria",transhistorycriteria);

						Transunionhistory
						.findOne(transhistorycriteria)
						.sort("createdAt DESC")
						.then(function(transunionhistoryInfo) {

								transunionhistoryInfo.responsedata = result;
								transunionhistoryInfo.status = 	historystatus;
								transunionhistoryInfo.save(function(err) {
								  if (err)
								  {
									sails.log.error("Transunioun#createcertificate :: Error :: ", err);
									return resolve({
									  code: 500,
									  message: 'Transunioun response not updated'
									});
								  }

								    sails.log.info("responsedata",responsedata.code);
								    var responsedata = {
										code: 200,
										message:"Transunion data for customer fetched successfully."
										//resultdata:result,
								    };
									return resolve(responsedata);
								});

						})
						.catch(function(err) {
							sails.log.error("ApplicationService#createcertificate::Err ::", err);
							var responsedata = { code: 400, message: 'Could not recieve your credit details'};
						    return resolve(responsedata);
						});
					});
				});
				curl.on('error', function (error) {
					sails.log.error("error: ",error);
					var responsedata = { code: 400, message: 'Could not recieve your credit details' };
				    return resolve(responsedata);
				});
				curl.perform();

		})
		.catch(function(err) {
			sails.log.error("Transunion#createcertificate::Err ::", err);
			var responsedata = {
				code: 400,
				message: 'Could not recieve your credit details'
		   };
		   return resolve(responsedata);
		});



	});
}

function aprRateCalculator(nper, pmt, pv, fv, type, guess) {

  return Q.promise(function(resolve, reject) {

		fv = typeof fv !== 'undefined' ? fv : 0;
		type = typeof type !== 'undefined' ? type : 0;
		guess = typeof guess !== 'undefined' ? guess : 0.1;

		var lowLimit = 0;
		var highLimit = 1;

	   var tolerance = Math.abs(0.00000005 * pmt);

	   for (var i = 0; i < 40; i++) {
		   var balance = pv;
		   for (var j = 0; j < nper; j++ ) {
			   if (type == 0) {
				   balance = balance * (1 + guess) + pmt;
			   } else {
				   balance = (balance + pmt) * (1 + guess);
			   }
		   }

		   if (Math.abs(balance + fv) < tolerance) {
			   //return guess;
			   return resolve(guess);
		   } else if (balance + fv > 0) {
			   highLimit = guess;
		   } else  {
			   lowLimit = guess;
		   }
		   guess = (highLimit + lowLimit) / 2;
	   }
	   //return null;
    });
}

// And here starts comedy central
function calculateApr( nper, pmt, pv, fv, type, guess ) {
	fv = ( fv !== undefined ? fv : 0 );
	type = ( type !== undefined ? type : 0 );
	guess = ( guess !== undefined ? guess : 0.1 );
	let lowLimit = 0;
	let highLimit = 1;
	const tolerance = Math.abs( 0.0000000005 * pmt );
	for( let i = 0; i < 10000; ++i ) {
		let balance = pv;
		for( let j = 0; j < nper; ++j ) {
			if( type == 0 ) {
				balance = ( balance * ( 1 + guess ) + pmt );
			} else {
				balance = ( ( balance + pmt ) * ( 1 + guess ) );
			}
		}
		if( Math.abs( balance + fv ) < tolerance ) {
			return guess;
		} else if( balance + fv > 0 ) {
			highLimit = guess;
		} else  {
			lowLimit = guess;
		}
		guess = ( ( highLimit + lowLimit) / 2 );
	}
	return null;
}



function getApplicationOffer(userId) {
  return Q.promise(function(resolve, reject) {

		var criteria = { user: userId,iscompleted : 0};

		Screentracking
		.findOne(criteria)
		.populate('plaiduser')
		.populate('practicemanagement')
		.populate('user')
		.then(function (userAccountres) {

			var screenId = userAccountres.id;
			var consolidateId = userAccountres.consolidateaccount;
			var creditScore = parseInt(userAccountres.creditscore);
			var minimumIncomePlaid = sails.config.plaid.minincomeamount;
			var incomeamount = parseFloat(userAccountres.incomeamount/12).toFixed(2);
			var requestedLoanAmount = parseFloat(userAccountres.requestedLoanAmount).toFixed(2);
			//var stateCode = userAccountres.user.state;
			var maximumDti 	= sails.config.plaid.minincomeamount;
			var configmaxiDti = sails.config.plaid.maximumDti;

			//var stateCode = userAccountres.practicemanagement.StateCode;

			//-- Added for preDTI calclation starts here
			var monthlyIncomeamount = parseFloat(userAccountres.incomeamount);
			var maxPreDTI = sails.config.plaid.maxPreDTI;
			//-- Added for preDTI calclation ends here

			sails.log.info("creditScore::",creditScore);
			sails.log.info("requestedLoanAmount::",requestedLoanAmount);
			sails.log.info("minimumIncomePlaid::",minimumIncomePlaid);
			sails.log.info("incomeamount::",incomeamount);

			//-- Ticket no 2779	(check interest rate available)
			var practiceId = userAccountres.practicemanagement.id;
			sails.log.info('practiceId',practiceId);
			var stateCode = userAccountres.practicemanagement.StateCode;
			var LAminLoanamount = sails.config.plaid.LAminLoanamount;
			var LAmaxLoanamount = sails.config.plaid.LAmaxLoanamount;
			var basicLoanamount = sails.config.plaid.basicLoanamount;
			var checkLAState = sails.config.plaid.checkLAState;

			var queryMaxLoanamount = basicLoanamount;
			if(stateCode==checkLAState)
			{
				if(parseFloat(requestedLoanAmount)<= parseFloat(LAminLoanamount))
				{
					queryMaxLoanamount = LAminLoanamount;
				}
			}
			/*sails.log.info('stateCode:', stateCode);
			sails.log.info('queryMaxLoanamount:', queryMaxLoanamount);
			sails.log.info('minimumIncomePlaid:', minimumIncomePlaid);
			sails.log.info('userAccountres.incomeamount:', userAccountres.incomeamount);*/
			if(( parseFloat(userAccountres.incomeamount) < minimumIncomePlaid) && (sails.config.plaid.minimumIncomePlaidStatus == true))
			{
				var loanstatus = "Declined";
				var lastScreenName='Select Bank';
				var lastlevel = 3;
				var product = userAccountres.product;

				var idobj ={
					 transid : '',
					 accountid:'',
					 rulesDetails:userAccountres.rulesDetails,
					 creditscore:userAccountres.creditscore
				 }
				 var dataObject = {
					addressarray : '',
					userArray:'',
					transactionControl:'',
					certificate:''
				 };

				Screentracking
				.updatedeclinedloan(lastScreenName,lastlevel,userAccountres.user,dataObject,product,idobj)
				.then(function(screenTracking) {

					var declineMessage= 'Your application has been denied due to low income';
					PaymentManagement.update({id: screenTracking.paymentid}, {declinereason: declineMessage})
					.exec(function afterwards(err, updated){
							 return resolve ({
								code : 500,
								message: declineMessage,
								loanstatus:loanstatus
							 });
					});
				});
			}
			else
			{
				var consolidatecriteria = { id: consolidateId};

				Consolidateaccount
				.findOne(consolidatecriteria)
				.sort("createdAt DESC")
				.then(function (accdetails) {

					var totalbalance =0;
					if(accdetails){
						var consolacc = accdetails.trade;

						var currenttotalbalance=0;
						_.forEach(consolacc, function (account) {
							//var industryCode = account.currentBalance;
							//totalbalance=parseFloat(totalbalance)+parseFloat(account.currentBalance);

							var industryCode = account.subscriber.industryCode;
							if( industryCode !== 'M' ) {
								if( account.hasOwnProperty( "dateClosed" ) || account.hasOwnProperty( "datePaidOut" ) || parseInt( account.currentBalance ) == 0 ) {
									return;
								}
								currenttotalbalance=parseFloat(currenttotalbalance)+parseFloat(account.currentBalance);
								if(account.terms)
								{
									monthlyamount = parseFloat(account.terms.scheduledMonthlyPayment);
									if(monthlyamount > 0){
										totalbalance = totalbalance+monthlyamount;
									}
									//monthlyamount = monthlyamount.toFixed(2);
								}
							}
						});
					}

					//-- Added for preDTI calclation starts here
					var preDTIMonthlyAmount = 0;
					var preDTIPercentValue  = 0;

					if(totalbalance>0 && monthlyIncomeamount>0)
					{
						preDTIMonthlyAmount = parseFloat(totalbalance);
						preDTIPercentValue =  ( parseFloat(preDTIMonthlyAmount)/parseFloat(monthlyIncomeamount) )  * 100;
						preDTIPercentValue =  parseFloat(preDTIPercentValue).toFixed(2);
					}

					var preDTIupdateDatares = {preDTIMonthlyAmount:preDTIMonthlyAmount,preDTIPercentValue:preDTIPercentValue,monthlyIncomeamount:monthlyIncomeamount};
					Screentracking.update({id: screenId}, preDTIupdateDatares)
				    .exec(function afterwards(err, updated){
						//-- Checking wheher preDTI is more than 49.99 then decline
						if(preDTIPercentValue>=maxPreDTI)
						{
							var loanstatus = "Declined";
							var lastScreenName='Select Bank';
							var lastlevel = 3;
							var product = userAccountres.product;

							var idobj ={
								 transid : '',
								 accountid:'',
								 rulesDetails:userAccountres.rulesDetails,
								 creditscore:userAccountres.creditscore
							 }
							 var dataObject = {
								addressarray : '',
								userArray:'',
								transactionControl:'',
								certificate:''
							 };

							Screentracking
							.updatedeclinedloan(lastScreenName,lastlevel,userAccountres.user,dataObject,product,idobj)
							.then(function(screenTracking) {

								var declineMessage= 'Your application has been denied due to high preDTI value: '+ preDTIPercentValue;
								PaymentManagement.update({id: screenTracking.paymentid}, {declinereason: declineMessage})
								.exec(function afterwards(err, updated){
										 return resolve ({
											code : 500,
											message: declineMessage,
											loanstatus:loanstatus
										 });
								});
							});
						}
						else
						{
							//for testing purpose(782 / 165560)
							//creditScore = 712
							var loansettingcriteria={
								loanactivestatus: 1,
								practicemanagement:practiceId
							};
							LoanSettings.find(loansettingcriteria)
							.then(function(loansettingData){

								var loantermsArray=[];
								if(loansettingData)
								{
									//Added to restrict for checking requestedLoanAmount not more than 30000
									var checkrequestedloanamount = requestedLoanAmount;
									if(requestedLoanAmount > sails.config.plaid.maxrequestedamount)
									{
									   var checkrequestedloanamount = parseFloat(sails.config.plaid.maxrequestedamount).toFixed(2);
									}

									_.forEach(loansettingData, function (loansettingInfo) {

										/*if((checkrequestedloanamount > loansettingInfo.minimumamount) && (checkrequestedloanamount <= loansettingInfo.maximumamount)){
											loantermsArray.push(loansettingInfo.loanterm);
										}*/

										//--Added for ticket no 2872
										if(parseFloat(requestedLoanAmount)>= parseFloat(loansettingInfo.termsloanamount))
										{
											loantermsArray.push(loansettingInfo.loanterm);
										}
									});
									//sails.log.info("loantermsArray:",loantermsArray);

									if(loantermsArray.length>0)
									{
										var loanterminterestArray=[];
										var iloop=0;
										var loopcount= loantermsArray.length;

										//sails.log.info("loantermsArray count::",loopcount);

										_.forEach(loantermsArray, function (loanterm) {

											//-- Ticket no 2779	(check interest rate available)
											var loaninterestCriteria= {
												term:loanterm,
												stateCode:stateCode,
												mincreditscore:{ $lte: creditScore },
												maxcreditscore:{ $gte: creditScore },
												maxloanamount: queryMaxLoanamount
											};

											sails.log.info("loaninterestCriteria::::::::",loaninterestCriteria);

											Loaninterestrate
											.findOne(loaninterestCriteria)
											.then(function(interestrateData){

												var interestRate =0;
												var minimumdti,maximumdti,rate,grade,loanGrade;

												//-- Ticket no 2779	(check interest rate available)
												if(interestrateData)
												{
													//-- Loaninterestrate (interest and grade) details gathering starts
													_.forEach(interestrateData.intrestrate, function (interestratevalues) {

															/*minimumdti = parseInt(interestratevalues.minimumdti) *1000;
															maximumdti = parseInt(interestratevalues.maximumdti) *1000;
															rate = parseFloat(interestratevalues.rate);
															grade = interestratevalues.grade;

															//Added to restrict the totalbalance to be more than maxDTI
															if(totalbalance > configmaxiDti) {
																totalbalance = configmaxiDti;
															}
															if(  (totalbalance==0 || totalbalance>minimumdti) && totalbalance<=maximumdti && interestRate==0 )
															{
																interestRate = rate;
																loanGrade = grade;
															}*/

															//-- Added for preDTI calclation starts here
															minimumdti = parseFloat(interestratevalues.minimumdti);
															maximumdti = parseFloat(interestratevalues.maximumdti);
															rate = parseFloat(interestratevalues.rate);
															grade = interestratevalues.grade;

															if(  (preDTIPercentValue==0 || preDTIPercentValue>=minimumdti) && preDTIPercentValue<maximumdti && interestRate==0 )
															{
																interestRate = rate;
																loanGrade = grade;
															}
															//-- Added for preDTI calclation ends here
													});
												}

												if(parseFloat(interestRate) > 0)
												{
													var loaninfo ={
													  loanID: interestrateData.id,
													  loanTerm:	loanterm,
													  interestRate:interestRate,
													  loanGrade: loanGrade,
													  stateCode:stateCode
													}
													loanterminterestArray.push(loaninfo);
												}
												iloop =iloop+1;

												if(iloop == loopcount)
												{
													   sails.log.info("loanterminterestArray",loanterminterestArray);
													   sails.log.info("iloop",loopcount);

													   var i=0;
													   var forlength = loanterminterestArray.length;
													   var loangradeterminterestArray=[];

													   //--max prequalified amount
													   var maxprequalifiedAmount =0;

													   //-- Ticket no 2779	(check interest rate available)
														if(loanterminterestArray.length>0)
														{

														  //-- Loangradesetting details (min & max) gathering starts
														   _.forEach(loanterminterestArray, function(loantermDetails) {

																//-- Ticket no 2779	(check interest rate available)
																var gradecriteria={
																	gradelevel: loantermDetails.loanGrade,
																	gradeterm: loantermDetails.loanTerm,
																	maxloanamount: queryMaxLoanamount,
																	stateCode:stateCode,
																};

																Loangradesettings
																.findOne(gradecriteria)
																.then(function(gradesettingData){

																	var finalrequestedloanamount = parseFloat(requestedLoanAmount);
																	var disableloanTerm=0;


																	//-- Ticket no 2779	(check interest rate available)
																	if(gradesettingData)
																	{
																		var grademininterest= gradesettingData.minimuminterest;
																		var grademaxinterest= gradesettingData.maximuminterest;

																		if( parseFloat(grademininterest)>0 && parseFloat(grademaxinterest)>0 )
																		{

																			//-- check grade max interest setting criteria
																			if(parseFloat(loantermDetails.interestRate)> parseFloat(gradesettingData.maximuminterest))
																			{
																				loantermDetails.interestRate =  gradesettingData.maximuminterest;
																			}

																			//-- check grade min interest setting criteria
																			if(parseFloat(loantermDetails.interestRate)< parseFloat(gradesettingData.minimuminterest))
																			{
																				loantermDetails.interestRate =  gradesettingData.minimuminterest;
																			}

																			//-- check grade max loan amount cap setting criteria(Not possible controlled in beginning)
																			if(parseFloat(finalrequestedloanamount)> parseFloat(gradesettingData.maximumamount))
																			{
																				finalrequestedloanamount = parseFloat(gradesettingData.maximumamount);
																				//-- To bypass loan amount greater than 30000
																				//finalrequestedloanamount = parseFloat(requestedLoanAmount);
																			}

																			//-- check grade min loan amount cap setting criteria
																			if(parseFloat(finalrequestedloanamount)< parseFloat(gradesettingData.minimumamount))
																			{
																				finalrequestedloanamount =parseFloat(gradesettingData.minimumamount);
																				disableloanTerm =1;
																			}

																			//--max prequalified amount
																			if(parseFloat(maxprequalifiedAmount)< parseFloat(gradesettingData.maximumamount))
																			{
																				maxprequalifiedAmount = parseFloat(gradesettingData.maximumamount);
																			}

																			if(disableloanTerm==1)
																			{
																				loantermDetails.settingenableTerm =0;
																			}
																			else
																			{
																				loantermDetails.settingenableTerm =1;
																			}



																			//-- Added to avoid settingenableTerm
																			if(disableloanTerm==0)
																			{
																				var loangradeinfo ={
																				  loanID: loantermDetails.loanID,
																				  loanTerm:	loantermDetails.loanTerm,
																				  interestRate:loantermDetails.interestRate,
																				  loanGrade: loantermDetails.loanGrade,
																				  settingenableTerm:loantermDetails.settingenableTerm,
																				  minimumamount: gradesettingData.minimumamount,
																				  maximumamount: gradesettingData.maximumamount,
																				  minimuminterest: gradesettingData.minimuminterest,
																				  maximuminterest: gradesettingData.maximuminterest,
																				  finalrequestedloanamount: finalrequestedloanamount
																				}
																				loangradeterminterestArray.push(loangradeinfo);
																			}
																		}
																	}
																	i++;

																	if(i == forlength)
																	{
																		sails.log.info("loangradeterminterestArray:",loangradeterminterestArray);

																		var finalloop=0;
																		var finallooplength = loangradeterminterestArray.length;

																		var resarray = {};
																		var outputarray = [];
																		//resarray["attribute"] = attributarray;
																		resarray["month"] = [];
																		resarray["financedAmount"] = [];
																		resarray["monthpayment"] = [];
																		resarray["appfeerate"] = [];
																		resarray["appfeefixedrate"] = [];
																		resarray["apr"] = [];
																		resarray["loansetid"] = [];
																		resarray["interestrate"] = [];
																		resarray["paymentfreq"] = [];
																		resarray["totalpayments"] = [];

																		//-- Ticket no 2779	(check interest rate available)
																		if(loangradeterminterestArray.length>0)
																		{
																			loangradeterminterestArray = _.orderBy(loangradeterminterestArray, ['loanTerm'], ['asc']);

																			const promiseAll = [];

																			_.forEach(loangradeterminterestArray, function(loanDetails) {
																				if(finalloop==0)
																				{
																						resarray["month"].push('Months');
																						resarray["financedAmount"].push('Loan Amount');
																						resarray["monthpayment"].push('Monthly payment');
																						resarray["appfeerate"].push('Application Fee rate');
																						resarray["appfeefixedrate"].push('Application Fee');
																						resarray["apr"].push('APR');
																						resarray["interestrate"].push('Interest Rates');
																						resarray["paymentfreq"].push('Payment Frequency');
																						resarray["totalpayments"].push('Total # of payments');
																				}
																				finalloop++;


																				var rowid= loanDetails.loanID;
																				var loanmonth= loanDetails.loanTerm;
																				var interestrate= loanDetails.interestRate;
																				var looprequestedloanamount = loanDetails.finalrequestedloanamount;
																				looprequestedloanamount = parseFloat(looprequestedloanamount);


																				var decimalRate = (interestrate/ 100) / 12;
																				var xpowervalue = decimalRate + 1;
																				var ypowervalue = loanmonth;
																				var powerrate_value= Math.pow(xpowervalue,ypowervalue) - 1;
																				var monthlyPayment = ( decimalRate + ( decimalRate / powerrate_value ) ) * looprequestedloanamount;
																				monthlyPayment = parseFloat(monthlyPayment.toFixed(2));

																				//Apr calculation
																				var effectiveRate = 0;

																				var finalmonthlyPayment = monthlyPayment*-1;
																				promiseAll.push(
																					Screentracking.aprRateCalculator(loanmonth,finalmonthlyPayment,looprequestedloanamount)
																					.then(function (effectiveRateValue) {

																						var effectiveRate = 12*effectiveRateValue*100;
																						effectiveRate = parseFloat(effectiveRate.toFixed(2));
																						var maxApr = sails.config.plaid.maxApr;

																						if(effectiveRate > parseFloat(maxApr)){
																							effectiveRate = maxApr;
																						}
																						resarray["month"].push(loanmonth);
																						resarray["financedAmount"].push('$'+looprequestedloanamount);
																						resarray["monthpayment"].push('$'+monthlyPayment);
																						resarray["appfeerate"].push(0+'%');
																						resarray["appfeefixedrate"].push('$'+0);
																						resarray["apr"].push(effectiveRate+'%');
																						resarray["loansetid"].push(rowid);
																						resarray["interestrate"].push(interestrate+'%');
																						resarray["paymentfreq"] .push('monthly');
																						//resarray["totalpayments"].push(loanmonth+' month');
																						resarray["totalpayments"].push(loanmonth);
																					})
																				);
																			});
																			return Promise.all( promiseAll )
																			.then( () => {
																				//outputArray = _.orderBy(outputarray, ['month'], ['asc']);
																				outputarray.push(resarray);

																				var loanstatus = "Approved";
																				var responseData ={
																					code : 200,
																					financedAmount:finalrequestedloanamount,
																					incomeamount:incomeamount,
																					loanstatus:loanstatus,
																					outputarray:outputarray,
																					screenid:screenId,
																					preDTIPercentValue: preDTIPercentValue,
																					maxprequalifiedAmount:maxprequalifiedAmount
																				}

																				return resolve(responseData);
																			} );
																		}
																		else
																		{
																			//-- No loan offer grade found for this credit score in loangradesetting table
																			var loanstatus = "Declined";
																			var lastScreenName='Select Bank';
																			var lastlevel = 3;
																			var product = userAccountres.product;

																			var idobj ={
																				 transid : '',
																				 accountid:'',
																				 rulesDetails:userAccountres.rulesDetails,
																				 creditscore:userAccountres.creditscore
																			 }
																			 var dataObject = {
																				addressarray : '',
																				userArray:'',
																				transactionControl:'',
																				certificate:''
																			 };

																			Screentracking
																			.updatedeclinedloan(lastScreenName,lastlevel,userAccountres.user,dataObject,product,idobj)
																			.then(function(screenTracking) {

																				var declineMessage= "Unable to approve your application as your loan amount and credit score does not meet the  requirement"
																				PaymentManagement.update({id: screenTracking.paymentid}, {declinereason: declineMessage})
																				.exec(function afterwards(err, updated){
																						 return resolve ({
																							code : 401,
																							message: declineMessage,
																							loanstatus:loanstatus
																						 });
																				});
																			});

																		}
																	}
																})
																.catch(function (err) {
																	sails.log.error('Loangradesettings not found:',err );
																	return resolve ({
																		code : 400,
																		message: "Loangradesettings not found"
																	});
																});
														   });
													 }
													 else
													 {
														   //-- No loan offer found for this credit score in loaninterestate table
														   var loanstatus = "Declined";
															var lastScreenName='Select Bank';
															var lastlevel = 3;
															var product = userAccountres.product;

															var idobj ={
																 transid : '',
																 accountid:'',
																 rulesDetails:userAccountres.rulesDetails,
																 creditscore:userAccountres.creditscore
															 }
															 var dataObject = {
																addressarray : '',
																userArray:'',
																transactionControl:'',
																certificate:''
															 };

															Screentracking
															.updatedeclinedloan(lastScreenName,lastlevel,userAccountres.user,dataObject,product,idobj)
															.then(function(screenTracking) {

																var declineMessage= "Unable to approve your application as your loan amount and credit score does not meet the  requirement"
																PaymentManagement.update({id: screenTracking.paymentid}, {declinereason: declineMessage})
																.exec(function afterwards(err, updated){
																		 return resolve ({
																			code : 401,
																			message: declineMessage,
																			loanstatus:loanstatus
																		 });
																});
															});
													 }
												}
											})
											.catch(function (err) {
												return resolve ({
													code : 400,
													message: "Loaninterestrate not found"
												});
											});
										});
									}
									else
									{
										//-- If loan term is empty (Need to handle)
										return resolve ({
											code : 400,
											message: "Loan term not found"
										});
									}
								}
								else
								{
									//-- If loan setting is empty (Need to handle)
									return resolve ({
										code : 400,
										message: "Loansettings not found"
									});
								}
							})
							.catch(function (err) {
								return resolve ({
									code : 400,
									message: "Loansettings not found"
								});
							});
						}
					});
					//-- Added for preDTI calclation ends here
				})
				.catch(function (err) {
					  return resolve ({
						code : 400,
						message: "Consolidateaccount not found"
					  });
				});
			}
		})
		.catch(function (err) {
			 return resolve ({
				code : 400,
				message: "Screentracking not found"
			 });
		});
  });
}

function saveLoanOfferData( userid, screenid, offerid, financedAmount ) {

	return Q.promise( function( resolve, reject ) {
		var screencriteria = { id: screenid };
		//sails.log.info("screencriteria:",screencriteria);
		var maximumDti = sails.config.plaid.minincomeamount;
		var configmaxiDti = sails.config.plaid.maximumDti;
 		Screentracking.findOne( screencriteria )
		.populate('plaiduser')
		.populate('user')
		.populate('practicemanagement')
		.then(function(userAccountres){

			sails.log.info("userAccountres:",userAccountres);


 			var screenId = userAccountres.id;
			var consolidateId = userAccountres.consolidateaccount;
			//var creditScore = parseInt(userAccountres.creditscore);
			//var minimumIncomePlaid = sails.config.plaid.minincomeamount;
			//var incomeamount = parseFloat(userAccountres.incomeamount/12).toFixed(2);
			//var stateCode = userAccountres.user.state;
			var requestedLoanAmount = parseFloat(userAccountres.requestedLoanAmount).toFixed(2);

			//-- Added for preDTI calclation starts here
			var monthlyIncomeamount = parseFloat(userAccountres.incomeamount);
			var maxPreDTI = sails.config.plaid.maxPreDTI;
			//-- Added for preDTI calclation ends here

			//-- Ticket no 2779	(check interest rate available)
			var stateCode = userAccountres.practicemanagement.StateCode;
			var LAminLoanamount = sails.config.plaid.LAminLoanamount;
			var LAmaxLoanamount = sails.config.plaid.LAmaxLoanamount;
			var basicLoanamount = sails.config.plaid.basicLoanamount;
			var checkLAState = sails.config.plaid.checkLAState;

			var queryMaxLoanamount = basicLoanamount;
			if(stateCode==checkLAState)
			{
				if(parseFloat(requestedLoanAmount)<= parseFloat(LAminLoanamount))
				{
					queryMaxLoanamount = LAminLoanamount;
				}
			}
			sails.log.info('stateCode:', stateCode);
			sails.log.info('queryMaxLoanamount:', queryMaxLoanamount);

			var consolidatecriteria = { id: consolidateId};

			Consolidateaccount
			.findOne(consolidatecriteria)
			.sort("createdAt DESC")
			.then(function (accdetails) {

				var totalbalance =0;
				if(accdetails){
					var consolacc = accdetails.trade;

					var currenttotalbalance=0;
					_.forEach(consolacc, function (account) {
						//var industryCode = account.currentBalance;
						//totalbalance=parseFloat(totalbalance)+parseFloat(account.currentBalance);

						var industryCode = account.subscriber.industryCode;
						if( industryCode !== 'M' ) {
							if( account.hasOwnProperty( "dateClosed" ) || account.hasOwnProperty( "datePaidOut" ) || parseInt( account.currentBalance ) == 0 ) {
								return;
							}
							currenttotalbalance=parseFloat(currenttotalbalance)+parseFloat(account.currentBalance);
							if(account.terms)
							{
								monthlyamount = parseFloat(account.terms.scheduledMonthlyPayment);
								if(monthlyamount > 0){
									totalbalance = totalbalance+monthlyamount;
								}
								//monthlyamount = monthlyamount.toFixed(2);
							}
						}
					});
				}

				//-- Added for preDTI calclation starts here
				var preDTIMonthlyAmount = 0;
				var preDTIPercentValue  = 0;

				if(totalbalance>0 && monthlyIncomeamount>0)
				{
					preDTIMonthlyAmount = parseFloat(totalbalance);
					preDTIPercentValue =  ( parseFloat(preDTIMonthlyAmount)/parseFloat(monthlyIncomeamount) )  * 100;
					preDTIPercentValue =  parseFloat(preDTIPercentValue).toFixed(2);
				}

				var preDTIupdateDatares = {preDTIMonthlyAmount:preDTIMonthlyAmount,preDTIPercentValue:preDTIPercentValue,monthlyIncomeamount:monthlyIncomeamount};
				Screentracking.update({id: screenId}, preDTIupdateDatares)
				.exec(function afterwards(err, updated){

					//-- Checking wheher preDTI is more than 49.99 then decline
					if(preDTIPercentValue>=maxPreDTI)
					{
						var loanstatus = "Declined";
						var lastScreenName='Select Bank';
						var lastlevel = 3;
						var product = userAccountres.product;

						var idobj ={
							 transid : '',
							 accountid:'',
							 rulesDetails:userAccountres.rulesDetails,
							 creditscore:userAccountres.creditscore
						 }
						 var dataObject = {
							addressarray : '',
							userArray:'',
							transactionControl:'',
							certificate:''
						 };

						Screentracking
						.updatedeclinedloan(lastScreenName,lastlevel,userAccountres.user,dataObject,product,idobj)
						.then(function(screenTracking) {

							var declineMessage= 'Your application has been denied due to high preDTI value: '+ preDTIPercentValue;
							PaymentManagement.update({id: screenTracking.paymentid}, {declinereason: declineMessage})
							.exec(function afterwards(err, updated){
									 return resolve ({
										code : 500,
										message: declineMessage,
										loanstatus:loanstatus
									 });
							});
						});
					}
					else
					{
						var offercriteria = { id: offerid };
						//sails.log.info("offercriteria:",offercriteria);

						Loaninterestrate
						.findOne(offercriteria)
						.then(function(interestrateData){

							//-- Ticket no 2779	(check interest rate available)
							if(interestrateData)
							{
								var loanmonth= interestrateData.term;

								var interestrate =0;
								var effectiveRate = 0;
								var minimumdti,maximumdti,rate,loanGrade;
								_.forEach(interestrateData.intrestrate, function (interestratevalues) {

										/*minimumdti = parseInt(interestratevalues.minimumdti) *1000;
										maximumdti = parseInt(interestratevalues.maximumdti) *1000;
										rate = parseFloat(interestratevalues.rate);
										grade = interestratevalues.grade;

										sails.log.info("minimumdti",minimumdti);
										sails.log.info("maximumdti",maximumdti);
										sails.log.info("totalbalance",totalbalance);
										sails.log.info("configmaxiDti",configmaxiDti);
										//Added to restrict the totalbalance to be more than maxDTI
										if(totalbalance > configmaxiDti) {
											sails.log.info("inside if loop",totalbalance,configmaxiDti);
											totalbalance = configmaxiDti;
										}
										sails.log.info("finaltotalbalance",totalbalance);
										sails.log.info("========================================================");
										if( (totalbalance==0 || totalbalance>minimumdti) && totalbalance<=maximumdti && interestrate==0 )
										{
											interestrate = rate;
											loanGrade = grade;
										}*/

										//-- Added for preDTI calclation starts here
										minimumdti = parseFloat(interestratevalues.minimumdti);
										maximumdti = parseFloat(interestratevalues.maximumdti);
										rate = parseFloat(interestratevalues.rate);
										grade = interestratevalues.grade;

										if(  (preDTIPercentValue==0 || preDTIPercentValue>=minimumdti) && preDTIPercentValue<maximumdti && interestrate==0 )
										{
											interestrate = rate;
											loanGrade = grade;
										}
										//-- Added for preDTI calclation ends here
								});

								if(parseFloat(interestrate) > 0)
								{
									//-- Ticket no 2779	(check interest rate available)
									var gradecriteria={
										gradelevel: loanGrade,
										gradeterm: loanmonth,
										maxloanamount: queryMaxLoanamount,
										stateCode:stateCode
									};

									sails.log.info("gradecriteria:",gradecriteria);

									Loangradesettings
									.findOne(gradecriteria)
									.then(function(gradesettingData){

										//-- Ticket no 2779	(check interest rate available)
										if(gradesettingData)
										{

											var grademininterest= gradesettingData.minimuminterest;
											var grademaxinterest= gradesettingData.maximuminterest;

											if( parseFloat(grademininterest)>0 && parseFloat(grademaxinterest)>0 )
											{

												//-- check grade max interest setting criteria
												if(parseFloat(interestrate)> parseFloat(gradesettingData.maximuminterest))
												{
													interestrate =  gradesettingData.maximuminterest;
												}

												//-- check grade min interest setting criteria
												if(parseFloat(interestrate)< parseFloat(gradesettingData.minimuminterest))
												{
													interestrate=  gradesettingData.minimuminterest;
												}

												//-- check grade max loan amount cap setting criteria(Not possible controlled in beginning)
												if(parseFloat(requestedLoanAmount)> parseFloat(gradesettingData.maximumamount))
												{
													requestedLoanAmount = parseFloat(gradesettingData.maximumamount);
													//-- To bypass loan amount greater than 30000
													//requestedLoanAmount = parseFloat(requestedLoanAmount);
												}

												//-- check grade min loan amount cap setting criteria
												if(parseFloat(requestedLoanAmount)< parseFloat(gradesettingData.minimumamount))
												{
													requestedLoanAmount =parseFloat(gradesettingData.minimumamount);
												}
												var decimalRate = (interestrate/ 100) / 12;
												var xpowervalue = decimalRate + 1;
												var ypowervalue = loanmonth;
												var powerrate_value= Math.pow(xpowervalue,ypowervalue) - 1;
												var monthlyPayment = ( decimalRate + ( decimalRate / powerrate_value ) ) * requestedLoanAmount;
												monthlyPayment = parseFloat(monthlyPayment.toFixed(2));

												var finalmonthlyPayment = monthlyPayment*-1;

												Screentracking.aprRateCalculator(loanmonth,finalmonthlyPayment,requestedLoanAmount)
												.then(function (effectiveRateValue) {

													var effectiveRate = 12*effectiveRateValue*100;
													effectiveRate = parseFloat(effectiveRate.toFixed(2));
													var maxApr = sails.config.plaid.maxApr;
													if(effectiveRate > parseFloat(maxApr)){
														effectiveRate = maxApr;
													}

													var lastlevel = 5;
													var linkedaccid ='';
													var consoldateid = '';
													var userDetails = {id:userid};
													var productid = sails.config.product.productid;

													var newloandetails =[];
													var newloanData = {
															"productid": productid,
															"month": loanmonth,
															"financedAmount": requestedLoanAmount,
															"loanTerm":loanmonth,
															"APR":effectiveRate,
															"interestRate":interestrate,
															"monthlyPayment": monthlyPayment,
															"interestRate": interestrate,
															"offerid": offerid,
															"appfeerate": "0.00",
															"loanapplicationfixed": "0.00",
															"loanFundingFee": "0.00",
															"totalloanamount": requestedLoanAmount,
															"preDTIAmount":totalbalance,
															"loanGrade": loanGrade,
															"preBalance":currenttotalbalance,
															"preDTIPercentValue": preDTIPercentValue
													};
													newloandetails.push(newloanData);

													var responsedata = {
														message: 'success',
														user: userid,
														accountDetails:newloandetails,
														preDTIPercentValue: preDTIPercentValue
													 };

													Screentracking
													.updateLastScreenName(userDetails,'Loan Offer Details',lastlevel,responsedata,linkedaccid,consoldateid,[newloandetails])
													.then(function(screenTracking) {

														//var redirectpath ="/userpromissorynote/"+userid;
														//return res.redirect(redirectpath);

														return resolve ({
															code : 200,
															message: "updated successfully"
														});

													})
													.catch(function (err) {
														sails.log.error('saveLoanOfferData :: err :', err);
														return resolve ({
															code : 400,
															message: "Unable to update screentracking"
														});
													});
												})
												.catch(function (err) {
													 sails.log.error('saveLoanOfferData :: err :', err);
													 return resolve ({
														code : 400,
														message: "Unable to fetch apr rate"
													});
												});
											}
											else
											{
												 sails.log.error('saveLoanOfferData :: err :', err);
												 return resolve ({
													code : 400,
													message: "Unable to fetch loan grade setting"
												});
											}
										}
										else
										{
											 sails.log.error('saveLoanOfferData :: err :', err);
											 return resolve ({
												code : 400,
												message: "Unable to fetch loan grade setting"
											});
										}
									})
									.catch(function (err) {
										 sails.log.error('saveLoanOfferData :: err :', err);
										 return resolve ({
											code : 400,
											message: "Unable to fetch loan grade setting"
										});
									});
								}
								else
								{
									 sails.log.error('saveLoanOfferData :: no interest rate :');
									 return resolve ({
										code : 400,
										message: "No interest rate not found"
									});
								}
							}
							else
							{
								//-- Ticket no 2779	(check interest rate available)
								sails.log.error('saveLoanOfferData :: err :', err);
								return resolve ({
									code : 400,
									message: "Loaninterestrate not found"
								});
							}
						})
						.catch(function (err) {
							sails.log.error('saveLoanOfferData :: err :', err);
							return resolve ({
								code : 400,
								message: "Loaninterestrate not found"
							});
						});
					}
				});
				//-- Added for preDTI calclation ends here
			})
			.catch(function (err) {
			   sails.log.error('saveLoanOfferData :: err :', err);
			   return resolve ({
					code : 400,
					message: "Consolidateaccount not found"
				});
			});
		}).catch(function (err) {
		 	sails.log.error('saveLoanOfferData :: err', err);
		 	return resolve ({
				code : 400,
				message: "Screentracking not found"
			});
		});
  });
}


function getSelectionOffer( userId, offerid, monthterm ) {
	return Q.promise( ( resolve, reject ) => {
		let loanTermsTiers = [];
		let practiceId;
		let practicemanagement;
		let screentracking;
		let transunion;
		let requestedLoanAmount = 0;
		let preDTI = 0;
		let tradeDebt;
		let offers = [];
		User.findOne( { id: userId } )
		.populate( "practicemanagement" )
		.then( ( user ) => {
			practicemanagement = user.practicemanagement;
			practiceId = practicemanagement.id;
			return Screentracking.findOne( { user: userId, iscompleted: 0 } )
			.populate( "plaiduser" )
			.populate( "transunion" )
			.then( ( _screentracking ) => {
				if( _screentracking.offers .length > 0 ) {
					return resolve( { code: 200, screentracking: _screentracking, user: user } );
				}
				if( ! _screentracking ) return resolve( { code: 400, message: "Screentracking not found" } );
				if( ! _screentracking.transunion ) return resolve( { code: 400, message: "Transunions not found" } );
				screentracking = _screentracking;
				transunion = screentracking.transunion;
				// sails.log.info( "screentracking:", screentracking );
				var screenId = screentracking.id;
				var consolidateId = screentracking.consolidateaccount;
				var creditScore = parseInt( screentracking.creditscore );
				var minimumIncomePlaid = sails.config.plaid.minincomeamount;
				var maximumDti = sails.config.plaid.minincomeamount;
				var configmaxiDti = sails.config.plaid.maximumDti;
				var incomeamount = parseFloat( screentracking.incomeamount );
				return Screentracking.getOffers( screentracking, false, 0, 0 )
				.then( ( screentracking ) => {
					return resolve( { code: 200, screentracking: screentracking, user: user } );
				} );

				// return Repullbankaccount.getRepullAccountList( screentracking, user.id )
				// .then( function( bankAccountList ) {
				// 	// sails.log.info( "bankAccountList", bankAccountList );
				// 	if( bankAccountList.status != 200 ) {
				// 		return Promise.reject( new Error( "missing bank details" ) );
				// 	}
				// 	return Repullbankaccount.getMultiloanRepull( screentracking, user.id, bankAccountList.data )
				// 	.then( function( bankAccount ) {
				// 		const userBankAccount = bankAccount.userBankAccount;
				// 		let accountTransactions = [];
				// 		_.forEach( userBankAccount, function( userbankData ) {
				// 			userBankAccountId = userbankData.id;
				// 			_.forEach( userbankData.transactions, function( transactions ) {
				// 				accountTransactions = accountTransactions.concat( transactions );
				// 			} );
				// 		} );
				// 		// sails.log.verbose( "getSelectionOffer; accountTransactions:", JSON.stringify( accountTransactions ) );
				// 		sails.log.verbose( "getSelectionOffer; accountTransactions:", accountTransactions.length );
				// 		const payrollDetected = PayrollDetection.getInfo( accountTransactions, user.id );
				// 		sails.log.info( "getSelectionOffer; payrollDetected:", JSON.stringify( payrollDetected ) );
				// 		const payrolldata = payrollDetected.payrolls;
				// 		let totalpayroll = payrollDetected.annualIncome;
				// 		sails.log.info( "getSelectionOffer; totalpayroll:", totalpayroll );
				// 		// if( totalpayroll > 0 ) {
				// 		// 	totalpayroll = parseFloat( ( totalpayroll / sails.config.plaid.grossIncomeRate ).toFixed( 2 ) );
				// 		// 	sails.log.info( "getSelectionOffer; totalpayroll w/ grossIncomeRate:", totalpayroll );
				// 		// }
				// 		tradeDebt = transunion.getTradeDebt( screentracking.residenceType, screentracking.housingExpense );
				// 		sails.log.verbose( "getSelectionOffer; preDTI tradeDebt.monthlyPayments:", tradeDebt.monthlyPayments );
				// 		sails.log.verbose( "getSelectionOffer; preDTI screentracking.incomeamount:", screentracking.incomeamount );
				// 		const updateScreen = {
				// 			totalpayroll: totalpayroll,
				// 			payrolldata: payrolldata,
				// 			preDTIMonthlyAmount: tradeDebt.monthlyPayments,
				// 			preDTIPercentValue: parseFloat( ( ( tradeDebt.monthlyPayments / parseFloat( screentracking.incomeamount ) ) * 100 ).toFixed( 1 ) )
				// 		};
				// 		// sails.log.verbose( "updateScreen:", screentracking.id, updateScreen );
				// 		preDTI = updateScreen.preDTIPercentValue;
				// 		return Screentracking.update( { id: screentracking.id }, updateScreen );
				// 	} );
				// } )
				// .then( () => {
					// return Promise.all( promiseArray )
					// .then( () => {
					// 	var i=0;
					// 	var forlength = loanterminterestArray.length;
					// 	var loangradeterminterestArray=[];

					// 	//--max prequalified amount
					// 	var maxprequalifiedAmount=0;

					// 	//sails.log.info("loanterminterestArray:",loanterminterestArray);

					// 	//-- Ticket no 2779	(check interest rate available)
					// 	if(loanterminterestArray.length>0)
					// 	{
					// 		//-- Loangradesetting details (min & max) gathering starts
					// 		_.forEach(loanterminterestArray, function(loantermDetails) {

					// 			//-- Ticket no 2779	(check interest rate available)
					// 			var gradecriteria={
					// 				gradelevel: loantermDetails.loanGrade,
					// 				gradeterm: loantermDetails.loanTerm,
					// 				maxloanamount: queryMaxLoanamount,
					// 				stateCode:stateCode
					// 			};

					// 			sails.log.info("gradecriteria:",gradecriteria);

					// 			Loangradesettings
					// 			.findOne(gradecriteria)
					// 			.then(function(gradesettingData){

					// 				//sails.log.info("gradesettingData:",gradesettingData);

					// 				var finalrequestedloanamount = parseFloat(requestedLoanAmount);
					// 				var disableloanTerm=0;

					// 				//-- Ticket no 2779	(check interest rate available)
					// 				if(gradesettingData)
					// 				{
					// 					var grademininterest= gradesettingData.minimuminterest;
					// 					var grademaxinterest= gradesettingData.maximuminterest;

					// 					if( parseFloat(grademininterest)>0 && parseFloat(grademaxinterest)>0 )
					// 					{
					// 						//-- check grade max interest setting criteria
					// 						if(parseFloat(loantermDetails.interestRate)> parseFloat(gradesettingData.maximuminterest))
					// 						{
					// 							loantermDetails.interestRate =  gradesettingData.maximuminterest;
					// 						}

					// 						//-- check grade min interest setting criteria
					// 						if(parseFloat(loantermDetails.interestRate)< parseFloat(gradesettingData.minimuminterest))
					// 						{
					// 							loantermDetails.interestRate =  gradesettingData.minimuminterest;
					// 						}

					// 						//-- check grade max loan amount cap setting criteria(Not possible controlled in beginning)
					// 						if(parseFloat(finalrequestedloanamount)> parseFloat(gradesettingData.maximumamount))
					// 						{
					// 							finalrequestedloanamount = parseFloat(gradesettingData.maximumamount);
					// 							//-- To bypass loan amount greater than 30000
					// 							//finalrequestedloanamount = parseFloat(requestedLoanAmount);
					// 						}

					// 						//-- check grade min loan amount cap setting criteria
					// 						if(parseFloat(finalrequestedloanamount)< parseFloat(gradesettingData.minimumamount))
					// 						{
					// 							finalrequestedloanamount =parseFloat(gradesettingData.minimumamount);
					// 							disableloanTerm =1;
					// 						}

					// 						//--max prequalified amount
					// 						if(parseFloat(maxprequalifiedAmount)< parseFloat(gradesettingData.maximumamount))
					// 						{
					// 							maxprequalifiedAmount = parseFloat(gradesettingData.maximumamount);
					// 						}

					// 						if(disableloanTerm==1)
					// 						{
					// 							loantermDetails.settingenableTerm =0;
					// 						}

					// 						//-- Added to avoid settingenableTerm
					// 						if(disableloanTerm==0)
					// 						{
					// 							var loangradeinfo ={
					// 							loanID: loantermDetails.loanID,
					// 							loanTerm:	loantermDetails.loanTerm,
					// 							interestRate:loantermDetails.interestRate,
					// 							loanGrade: loantermDetails.loanGrade,
					// 							settingenableTerm:loantermDetails.settingenableTerm,
					// 							minimumamount: gradesettingData.minimumamount,
					// 							maximumamount: gradesettingData.maximumamount,
					// 							minimuminterest: gradesettingData.minimuminterest,
					// 							maximuminterest: gradesettingData.maximuminterest,
					// 							finalrequestedloanamount: finalrequestedloanamount
					// 							}
					// 							loangradeterminterestArray.push(loangradeinfo);
					// 						}
					// 					}
					// 				}

					// 				i++;

					// 				if(i == forlength)
					// 				{
					// 					var outputArray=[];
					// 					var finalloop=0;
					// 					var finallooplength = loangradeterminterestArray.length;

					// 					sails.log.info("loangradeterminterestArray:",loangradeterminterestArray);

					// 					//-- Ticket no 2779	(check interest rate available)
					// 					if(loangradeterminterestArray.length>0)
					// 					{
					// 						_.forEach(loangradeterminterestArray, function(loanDetails) {

					// 							var rowid= loanDetails.loanID;
					// 							var loanmonth= loanDetails.loanTerm;
					// 							var interestrate= loanDetails.interestRate;
					// 							var looprequestedloanamount = loanDetails.finalrequestedloanamount;
					// 							looprequestedloanamount = parseFloat(looprequestedloanamount);


					// 							var decimalRate = (interestrate/ 100) / 12;
					// 							var xpowervalue = decimalRate + 1;
					// 							var ypowervalue = loanmonth;
					// 							var powerrate_value= Math.pow(xpowervalue,ypowervalue) - 1;
					// 							var monthlyPayment = ( decimalRate + ( decimalRate / powerrate_value ) ) * looprequestedloanamount ;
					// 							monthlyPayment = parseFloat(monthlyPayment.toFixed(2));

					// 							var totalloanamount = monthlyPayment*loanmonth;
					// 							totalloanamount = parseFloat(totalloanamount.toFixed(2));

					// 							var interestfeeamount=0;
					// 							if(totalloanamount>looprequestedloanamount)
					// 							{
					// 								interestfeeamount = totalloanamount - looprequestedloanamount;
					// 								interestfeeamount = parseFloat(interestfeeamount.toFixed(2));
					// 							}

					// 							var fullnumberamount = Math.floor(monthlyPayment);
					// 							var decimalamount = monthlyPayment - Math.floor(monthlyPayment);
					// 							decimalamount = parseFloat(decimalamount.toFixed(2));
					// 							decimalamount = decimalamount.toString();
					// 							var decPartAmount = decimalamount.split(".");

					// 							if(decPartAmount.length>1)
					// 							{
					// 								var decPartAmountValue = '.'+decPartAmount[1];
					// 							}
					// 							else
					// 							{
					// 								var decPartAmountValue = '.00';
					// 							}

					// 							/*sails.log.info("decimalamount:",decimalamount);
					// 							sails.log.info("decPartAmount:",decPartAmount);
					// 							sails.log.info("decPartAmountValue:",decPartAmountValue);
					// 							sails.log.info("decPartAmount length:",decPartAmount.length);*/

					// 							if(decPartAmountValue.length<3)
					// 							{
					// 								decPartAmountValue =decPartAmountValue+'0';
					// 							}

					// 							//loanDetails.financedAmount= requestedLoanAmount;
					// 							loanDetails.financedAmount= looprequestedloanamount.toLocaleString( "en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 } );
					// 							loanDetails.monthpayment= monthlyPayment.toLocaleString( "en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 } );
					// 							loanDetails.fullnumberamount= fullnumberamount;
					// 							loanDetails.decimalamount= decPartAmountValue;
					// 							loanDetails.appfeerate= 0;
					// 							loanDetails.appfeefixedrate= 0;
					// 							loanDetails.paymentfreq= 'monthly';
					// 							loanDetails.totalloanamount= totalloanamount.toLocaleString( "en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 } );
					// 							loanDetails.interestfeeamount= interestfeeamount.toLocaleString( "en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 } );

					// 							var finalmonthlyPayment = monthlyPayment*-1;
					// 							Screentracking.aprRateCalculator(loanmonth,finalmonthlyPayment,looprequestedloanamount)
					// 							.then(function (effectiveRateValue) {

					// 								var effectiveRate = 12*effectiveRateValue*100;
					// 								effectiveRate = parseFloat(effectiveRate.toFixed(2));
					// 								var maxApr = sails.config.plaid.maxApr;

					// 								if(effectiveRate > parseFloat(maxApr)){
					// 									effectiveRate = maxApr;
					// 								}

					// 								loanDetails.apr= effectiveRate;

					// 								outputArray.push(loanDetails);

					// 								finalloop++;

					// 								if(finalloop == finallooplength)
					// 								{
					// 									outputArray = _.orderBy(outputArray, ['loanTerm'], ['asc']);

					// 									var loanstatus = "Approved";
					// 									var responseData ={
					// 										code : 200,
					// 										financedAmount:looprequestedloanamount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
					// 										incomeamount:incomeamount,
					// 										loanstatus:loanstatus,
					// 										loanDetails:outputArray,
					// 										screenid:screenId,
					// 										preDTIPercentValue: preDTIPercentValue,
					// 										maxprequalifiedAmount: maxprequalifiedAmount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
					// 									}

					// 									sails.log.info('final responsedata:',responseData );
					// 									return resolve(responseData);
					// 								}
					// 							});
					// 						});
					// 					} else {
					// 						//-- No loan offer grade found for this credit score in loangradesetting table

					// 						var loanstatus = "Declined";
					// 						var lastScreenName='Select Bank';
					// 						var lastlevel = 3;
					// 						var product = screentracking.product;

					// 						var idobj ={
					// 							transid : '',
					// 							accountid:'',
					// 							rulesDetails:screentracking.rulesDetails,
					// 							creditscore:screentracking.creditscore
					// 						}
					// 						var dataObject = {
					// 							addressarray : '',
					// 							userArray:'',
					// 							transactionControl:'',
					// 							certificate:''
					// 						};

					// 						Screentracking
					// 						.updatedeclinedloan(lastScreenName,lastlevel,screentracking.user,dataObject,product,idobj)
					// 						.then( ( screenTracking ) => {
					// 							screenTrackingCopy = screenTracking;
					// 							let declineMessages = getDeclineMessages( 4, userId, stateCode, creditScore, neededCreditScore, preDTIPercentValue, neededDTI, screentracking.incomeamount, minimumIncomePlaid );
					// 							PaymentManagement.update( { id: screenTrackingCopy.paymentid }, { declinereason: declineMessages.reason } )
					// 							.exec( ( err, updated ) => {
					// 								return resolve ({
					// 									code : 500,
					// 									message: declineMessages.ui,
					// 									loanstatus: loanstatus
					// 								} );
					// 							} );
					// 						} );
					// 					}
					// 				}
					// 			})
					// 			.catch(function (err) {
					// 				sails.log.error('Loangradesettings not found:',err );
					// 				return resolve ({
					// 					code : 400,
					// 					message: "Loangradesettings not found"
					// 				});
					// 			});
					// 		});
					// 	} else {
					// 		//-- No loan offer found for this credit score in loaninterestate table
					// 		var loanstatus = "Declined";
					// 		var lastScreenName='Select Bank';
					// 		var lastlevel = 3;
					// 		var product = screentracking.product;

					// 		var idobj ={
					// 			transid : '',
					// 			accountid:'',
					// 			rulesDetails:screentracking.rulesDetails,
					// 			creditscore:screentracking.creditscore
					// 		}
					// 		var dataObject = {
					// 			addressarray : '',
					// 			userArray:'',
					// 			transactionControl:'',
					// 			certificate:''
					// 		};

					// 		Screentracking.updatedeclinedloan(lastScreenName,lastlevel,screentracking.user,dataObject,product,idobj)
					// 		.then(function(screenTracking) {
					// 			screenTrackingCopy = screenTracking;
					// 			let declineMessages = getDeclineMessages( 3, userId, stateCode, creditScore, neededCreditScore, preDTIPercentValue, neededDTI, screentracking.incomeamount, minimumIncomePlaid );
					// 			PaymentManagement.update( { id: screenTrackingCopy.paymentid }, { declinereason: declineMessages.reason } )
					// 			.exec( ( err, updated ) => {
					// 				return resolve ( {
					// 					code : 500,
					// 					message: declineMessages.ui,
					// 					loanstatus:loanstatus
					// 				} );
					// 			});
					// 		});

					// 	}
					// } );
				// } )
				// .then( () => {
				// 	// screentracking.offers = offers;
				// 	// sails.log.verbose( "getSelectionOffer; offers:", screentracking.id, offers );
				// 	return resolve( { code: 200, screentracking: screentracking, user: user } );
				// } )
				// .catch( ( err ) => reject( err ) );
			} )
			.catch( ( err ) => {
				sails.log.error( "Screentracking not found:", err );
				return resolve ({ code : 400, message: "Screentracking not found" } );
			} );
		} );
	} );
}


function getDeclineMessages( denyid, userid, stateCode, creditScore, neededCreditScore, dti, neededDTI, income, neededIncome ) {
	let prefix = "[" + denyid + "]";
	let msg;

	switch( denyid ) {
		case 1:
			// low income
			reason = `${prefix} The patient's income of ${income} is less than the required ${neededIncome}.`;
			msg = "Unable to approve your application because your income does not meet " + sails.config.lender.shortName + "'s minimum requirement.";
		break;

		case 2:
			// max dti exceeded
			// low income
			reason = `${prefix} The patient's DTI of ${dti} is greater than the maximum DTI of ${neededDTI}.`;
			msg = "Unable to approve your application because your debt to income ratio does not meet " + sails.config.lender.shortName + "'s minimum requirement.";
		break;

		default:
			if( creditScore < neededCreditScore ) {
				reason = `${prefix} The patient's credit score of ${creditScore} is less than the required ${neededCreditScore} for the state of ${stateCode}.`;
				msg = "Unable to approve your application because your credit score does not meet " + sails.config.lender.shortName + "'s minimum requirement.";
			} else if( dti > neededDTI ) {
				reason = `${prefix} The patient's DTI of ${dti} is greater than the ${neededDTI} required for a credit score of ${creditScore} in the state of ${stateCode}.`;
				msg = "Unable to approve your application because your debt to income ratio does not meet " + sails.config.lender.shortName + "'s minimum requirement.";
			} else {
				reason = `${prefix} Reason unkown.`;
				msg = "Unable to approve your application at this time, please contact your provider.";
			}
		break;
	}

	return {
		reason: reason,
		ui: msg
	};
}


function getChangeLoanOffer(screenID,incomeAmount,financedAmount,type) {
  return Q.promise(function(resolve, reject) {

		if(type=='incomplete')
		{
			var criteria = { id: screenID,iscompleted : 0};
		}
		else
		{
			var criteria = { id: screenID};
		}

		sails.log.info("criteria:",criteria);


		Screentracking
		.findOne(criteria)
		.populate('plaiduser')
		.populate('user')
		.populate('practicemanagement')
		.then(function (userAccountres) {

			//sails.log.info("userAccountres:",userAccountres);

			var screenId = userAccountres.id;
			var consolidateId = userAccountres.consolidateaccount;
			var creditScore = parseInt(userAccountres.creditscore);
			var minimumIncomePlaid = sails.config.plaid.minincomeamount;
			//var incomeamount = parseFloat(userAccountres.incomeamount/12).toFixed(2);
			//var requestedLoanAmount = parseFloat(userAccountres.requestedLoanAmount).toFixed(2);
			//var stateCode = userAccountres.user.state;
			var maximumDti = sails.config.plaid.minincomeamount;
			var configmaxiDti = sails.config.plaid.maximumDti;

			//var stateCode = userAccountres.practicemanagement.StateCode;

			var incomeamount = parseFloat(incomeAmount/12).toFixed(2);
		    var requestedLoanAmount = parseFloat(financedAmount).toFixed(2);

			//-- Added for preDTI calclation starts here
			var monthlyIncomeamount = parseFloat(incomeAmount);
			var maxPreDTI = sails.config.plaid.maxPreDTI;
			//-- Added for preDTI calclation ends here

			//-- Ticket no 2779	(check interest rate available)
			var practiceId = userAccountres.practicemanagement.id;
			var stateCode = userAccountres.practicemanagement.StateCode;
			var LAminLoanamount = sails.config.plaid.LAminLoanamount;
			var LAmaxLoanamount = sails.config.plaid.LAmaxLoanamount;
			var basicLoanamount = sails.config.plaid.basicLoanamount;
			var checkLAState = sails.config.plaid.checkLAState;

			var queryMaxLoanamount = basicLoanamount;
			if(stateCode==checkLAState)
			{
				if(parseFloat(requestedLoanAmount)<= parseFloat(LAminLoanamount))
				{
					queryMaxLoanamount = LAminLoanamount;
				}
			}
			sails.log.info('stateCode:', stateCode);
			sails.log.info('queryMaxLoanamount:', queryMaxLoanamount);


			if(( parseFloat(incomeAmount) < parseFloat(minimumIncomePlaid)) && (sails.config.plaid.minimumIncomePlaidStatus == true))
			{

				return resolve ({
					code : 500,
					message: 'Income amount should be greater than $'+sails.config.plaid.minincomeamount
				});
			}
			else
			{
				sails.log.info('Else loop');
 				var consolidatecriteria = { id: consolidateId};

				Consolidateaccount
				.findOne(consolidatecriteria)
				.sort("createdAt DESC")
				.then(function (accdetails) {

					var totalbalance =0;
					if(accdetails){

						var consolacc = accdetails.trade;

						var currenttotalbalance=0;
						_.forEach(consolacc, function (account) {

							var industryCode = account.subscriber.industryCode;
							if( industryCode !== 'M' ) {
								if( account.hasOwnProperty( "dateClosed" ) || account.hasOwnProperty( "datePaidOut" ) || parseInt( account.currentBalance ) == 0 ) {
									return;
								}
								currenttotalbalance=parseFloat(currenttotalbalance)+parseFloat(account.currentBalance);
								if(account.terms)
								{
									monthlyamount = parseFloat(account.terms.scheduledMonthlyPayment);
									if(monthlyamount > 0){
										totalbalance = totalbalance+monthlyamount;
									}
								}
							}
						});
					}

					//-- Added for preDTI calclation starts here
					var preDTIMonthlyAmount = 0;
					var preDTIPercentValue  = 0;

					if(totalbalance>0 && monthlyIncomeamount>0)
					{
						preDTIMonthlyAmount = parseFloat(totalbalance);
						preDTIPercentValue =  ( parseFloat(preDTIMonthlyAmount)/parseFloat(monthlyIncomeamount) )  * 100;
						preDTIPercentValue =  parseFloat(preDTIPercentValue).toFixed(2);
					}

					//-- Checking wheher preDTI is more than 49.99 then decline
					if(preDTIPercentValue>=maxPreDTI)
					{
						return resolve ({
							code : 500,
							message: 'Your preDTI value should be less than '+maxPreDTI
						});
					}
					else
					{
						//--For testing purpose
						//creditScore	=	770;

						var loansettingcriteria={
							loanactivestatus: 1,
							practicemanagement:practiceId
						};

						LoanSettings.find(loansettingcriteria)
						.then(function(loansettingData){

							var loantermsArray=[];
							if(loansettingData)
							{
								//Added to restrict for checking requestedLoanAmount not more than 30000
								var checkrequestedloanamount = requestedLoanAmount;
								if(requestedLoanAmount > sails.config.plaid.maxrequestedamount)
								{
								   var checkrequestedloanamount = parseFloat(sails.config.plaid.maxrequestedamount).toFixed(2);
								}

								_.forEach(loansettingData, function (loansettingInfo) {

									/*if((checkrequestedloanamount > loansettingInfo.minimumamount) && (checkrequestedloanamount <= loansettingInfo.maximumamount)){
										loantermsArray.push(loansettingInfo.loanterm);
									}*/

									//--Added for ticket no 2872
									if(parseFloat(requestedLoanAmount)>= parseFloat(loansettingInfo.termsloanamount))
									{
										loantermsArray.push(loansettingInfo.loanterm);
									}
								});

								if(loantermsArray.length>0)
								{
									var loanterminterestArray=[];
									var iloop=0;
									var loopcount= loantermsArray.length;

									//sails.log.info("loantermsArray:",loantermsArray);
									_.forEach(loantermsArray, function (loanterm) {

										//-- Ticket no 2779	(check interest rate available)
										var loaninterestCriteria= {
											term:loanterm,
											stateCode:stateCode,
											mincreditscore:{ $lte: creditScore },
											maxcreditscore:{ $gte: creditScore },
											maxloanamount: queryMaxLoanamount
										};

										//sails.log.info("loaninterestCriteria:",loaninterestCriteria);

										Loaninterestrate
										.findOne(loaninterestCriteria)
										.then(function(interestrateData){

											//sails.log.info("interestrateData:",interestrateData);

											var interestRate =0;
											var minimumdti,maximumdti,rate,grade,loanGrade;

											//-- Ticket no 2779	(check interest rate available)
											 if(interestrateData)
											 {
												//-- Loaninterestrate (interest and grade) details gathering starts
												_.forEach(interestrateData.intrestrate, function (interestratevalues) {

														/*minimumdti = parseInt(interestratevalues.minimumdti) *1000;
														maximumdti = parseInt(interestratevalues.maximumdti) *1000;
														rate = parseFloat(interestratevalues.rate);
														grade = interestratevalues.grade;

														//sails.log.info("minimumdti",minimumdti);
														//sails.log.info("maximumdti",maximumdti);
														//sails.log.info("totalbalance",totalbalance);
														//sails.log.info("configmaxiDti",configmaxiDti);

														//Added to restrict the totalbalance to be more than maxDTI
														if(totalbalance > configmaxiDti) {
															//sails.log.info("inside if loop",totalbalance,configmaxiDti);
															totalbalance = configmaxiDti;
														}

														//sails.log.info("finaltotalbalance",totalbalance);
														//sails.log.info("========================================================");


														if( (totalbalance==0 || totalbalance>minimumdti) && totalbalance<=maximumdti && interestRate==0 )
														{
															interestRate = rate;
															loanGrade = grade;
														}*/

														//-- Added for preDTI calclation starts here
														minimumdti = parseFloat(interestratevalues.minimumdti);
														maximumdti = parseFloat(interestratevalues.maximumdti);
														rate = parseFloat(interestratevalues.rate);
														grade = interestratevalues.grade;

														if(  (preDTIPercentValue==0 || preDTIPercentValue>=minimumdti) && preDTIPercentValue<maximumdti && interestRate==0 )
														{
															interestRate = rate;
															loanGrade = grade;
														}
														//-- Added for preDTI calclation ends here
												});
											}

											if(parseFloat(interestRate) > 0)
											{
												var loaninfo ={
												  loanID: interestrateData.id,
												  loanTerm:	loanterm,
												  interestRate:interestRate,
												  loanGrade: loanGrade,
												  stateCode: stateCode
												}
												loanterminterestArray.push(loaninfo);
											}
											iloop =iloop+1;

											if(iloop == loopcount)
											{
												   sails.log.info("loanterminterestArray",loanterminterestArray);
												   sails.log.info("iloop",loopcount);

												   var i=0;
												   var forlength = loanterminterestArray.length;
												   var loangradeterminterestArray=[];

												   //-- Ticket no 2779	(check interest rate available)
												   if(loanterminterestArray.length>0)
												   {

											  	  	   //-- Loangradesetting details (min & max) gathering starts
													   _.forEach(loanterminterestArray, function(loantermDetails) {

															//-- Ticket no 2779	(check interest rate available)
															var gradecriteria={
																gradelevel: loantermDetails.loanGrade,
																gradeterm: loantermDetails.loanTerm,
																maxloanamount: queryMaxLoanamount,
																stateCode:stateCode
															};

															Loangradesettings
															.findOne(gradecriteria)
															.then(function(gradesettingData){

																var finalrequestedloanamount = parseFloat(requestedLoanAmount);
																var disableloanTerm=0;

																//-- Ticket no 2779	(check interest rate available)
																if(gradesettingData)
																{
																	var grademininterest= gradesettingData.minimuminterest;
																	var grademaxinterest= gradesettingData.maximuminterest;

																	if( parseFloat(grademininterest)>0 && parseFloat(grademaxinterest)>0 )
																	{
																		//-- check grade max interest setting criteria
																		if(parseFloat(loantermDetails.interestRate)> parseFloat(gradesettingData.maximuminterest))
																		{
																			loantermDetails.interestRate =  gradesettingData.maximuminterest;
																		}

																		//-- check grade min interest setting criteria
																		if(parseFloat(loantermDetails.interestRate)< parseFloat(gradesettingData.minimuminterest))
																		{
																			loantermDetails.interestRate =  gradesettingData.minimuminterest;
																		}

																		//-- check grade max loan amount cap setting criteria(Not possible controlled in beginning)
																		if(parseFloat(finalrequestedloanamount)> parseFloat(gradesettingData.maximumamount))
																		{
																			finalrequestedloanamount = parseFloat(gradesettingData.maximumamount);
																			//-- To bypass loan amount greater than 30000
																			//finalrequestedloanamount = parseFloat(requestedLoanAmount);
																		}

																		//-- check grade min loan amount cap setting criteria
																		if(parseFloat(finalrequestedloanamount)< parseFloat(gradesettingData.minimumamount))
																		{
																			finalrequestedloanamount =parseFloat(gradesettingData.minimumamount);
																			disableloanTerm =1;
																		}


																		if(disableloanTerm==1)
																		{
																			loantermDetails.settingenableTerm =0;
																		}
																		else
																		{
																			loantermDetails.settingenableTerm =1;
																		}

																		//-- Added to avoid settingenableTerm
																		if(disableloanTerm==0)
																		{
																			var loangradeinfo ={
																			  loanID: loantermDetails.loanID,
																			  loanTerm:	loantermDetails.loanTerm,
																			  interestRate:loantermDetails.interestRate,
																			  loanGrade: loantermDetails.loanGrade,
																			  settingenableTerm:loantermDetails.settingenableTerm,
																			  minimumamount: gradesettingData.minimumamount,
																			  maximumamount: gradesettingData.maximumamount,
																			  minimuminterest: gradesettingData.minimuminterest,
																			  maximuminterest: gradesettingData.maximuminterest,
																			  finalrequestedloanamount: finalrequestedloanamount
																			}
																			loangradeterminterestArray.push(loangradeinfo);
																		}
																	}
																}
																i++;

																if(i == forlength)
																{
																	sails.log.info("loangradeterminterestArray:",loangradeterminterestArray);

																	var finalloop=0;
																	var finallooplength = loangradeterminterestArray.length;

																	var resarray = {};
																	var outputarray = [];
																	//resarray["attribute"] = attributarray;
																	resarray["month"] = [];
																	resarray["financedAmount"] = [];
																	resarray["monthpayment"] = [];
																	resarray["appfeerate"] = [];
																	resarray["appfeefixedrate"] = [];
																	resarray["apr"] = [];
																	resarray["loansetid"] = [];
																	resarray["interestrate"] = [];
																	resarray["paymentfreq"] = [];
																	resarray["totalpayments"] = [];

																	//-- Ticket no 2779	(check interest rate available)
																	if(loangradeterminterestArray.length>0)
																	{
																		loangradeterminterestArray = _.orderBy(loangradeterminterestArray, ['loanTerm'], ['asc']);

																		const promiseAll = [];

																		_.forEach(loangradeterminterestArray, function(loanDetails) {

																				if(finalloop==0)
																				{
																					  resarray["month"].push('Months');
																					  resarray["financedAmount"].push('Loan Amount');
																					  resarray["monthpayment"].push('Monthly payment');
																					  resarray["appfeerate"].push('Application Fee rate');
																					  resarray["appfeefixedrate"].push('Application Fee');
																					  resarray["apr"].push('APR');
																					  resarray["interestrate"].push('Interest Rates');
																					  resarray["paymentfreq"].push('Payment Frequency');
																					  resarray["totalpayments"].push('Total # of payments');
																				}
																				finalloop++;


																				var rowid= loanDetails.loanID;
																				var loanmonth= loanDetails.loanTerm;
																				var interestrate= loanDetails.interestRate;
																				var looprequestedloanamount = loanDetails.finalrequestedloanamount;
																				looprequestedloanamount = parseFloat(looprequestedloanamount);


																				var decimalRate = (interestrate/ 100) / 12;
																				var xpowervalue = decimalRate + 1;
																				var ypowervalue = loanmonth;
																				var powerrate_value= Math.pow(xpowervalue,ypowervalue) - 1;
																				var monthlyPayment = ( decimalRate + ( decimalRate / powerrate_value ) ) * looprequestedloanamount;
																				monthlyPayment = parseFloat(monthlyPayment.toFixed(2));

																				//Apr calculation
																				var effectiveRate = 0;

																				var finalmonthlyPayment = monthlyPayment*-1;
																				promiseAll.push(
																					Screentracking.aprRateCalculator(loanmonth,finalmonthlyPayment,looprequestedloanamount)
																					.then(function (effectiveRateValue) {
																						var effectiveRate = 12*effectiveRateValue*100;
																						effectiveRate = parseFloat(effectiveRate.toFixed(2));
																						var maxApr = sails.config.plaid.maxApr;

																						if(effectiveRate > parseFloat(maxApr)){
																							effectiveRate = maxApr;
																						}
																						resarray["month"].push(loanmonth);
																						resarray["financedAmount"].push('$'+looprequestedloanamount);
																						resarray["monthpayment"].push('$'+monthlyPayment);
																						resarray["appfeerate"].push(0+'%');
																						resarray["appfeefixedrate"].push('$'+0);
																						resarray["apr"].push(effectiveRate+'%');
																						resarray["loansetid"].push(rowid);
																						resarray["interestrate"].push(interestrate+'%');
																						resarray["paymentfreq"] .push('monthly');
																						//resarray["totalpayments"].push(loanmonth+' month');
																						resarray["totalpayments"].push(loanmonth);
																						sails.log.verbose( "Screentracking.getChangeLoanOffer; resarray[1]:", JSON.stringify( resarray, null, 4 ) );
																					} )
																				);
																		});

																		return Promise.all( promiseAll )
																		.then( () => {
																			sails.log.verbose( "Screentracking.getChangeLoanOffer; resarray[2]:", JSON.stringify( resarray, null, 4 ) );
																			outputarray.push(resarray);

																			//outputArray = _.orderBy(outputarray, ['month'], ['asc']);

																			var loanstatus = "Approved";
																			var responseData ={
																				code : 200,
																				financedAmount:finalrequestedloanamount,
																				incomeamount:incomeamount,
																				loanstatus:loanstatus,
																				outputarray:outputarray,
																				screenid:screenId,
																				preDTIPercentValue: preDTIPercentValue
																			}

																			return resolve(responseData);
																		} );
																	}
																	else
																	{
																		//-- Ticket no 2779	(check interest rate available)
																		return resolve ({
																			code : 600,
																			message: "Unable to approve your application as your loan amount and credit score does not meet the requirement"
																		});
																	}
																}
															})
															.catch(function (err) {
																sails.log.error('Loangradesettings not found:',err );
																return resolve ({
																	code : 400,
																	message: "Loangradesettings not found"
																});
															});
													   });
												   }
												   else
												   {
													   //-- Ticket no 2779	(check interest rate available)
														return resolve ({
															code : 600,
															message: "Unable to approve your application as your loan amount and credit score does not meet the requirement"
														});
												  }
											}
										})
										.catch(function (err) {
											return resolve ({
												code : 400,
												message: "Loaninterestrate not found"
											});
										});
									});
								}
								else
								{
									//-- If loan term is empty (Need to handle)
									return resolve ({
										code : 400,
										message: "Loan term not found"
									});
								}
							}
							else
							{
								//-- If loan setting is empty (Need to handle)
								return resolve ({
									code : 400,
									message: "Loansettings not found"
								});
							}
						})
						.catch(function (err) {
							return resolve ({
								code : 400,
								message: "Loansettings not found"
							});
						});
					}
					//-- Added for preDTI calclation ends here
				})
				.catch(function (err) {
					  return resolve ({
						code : 400,
						message: "Consolidateaccount not found"
					  });
				});
			}
		})
		.catch(function (err) {
			 return resolve ({
				code : 400,
				message: "Screentracking not found"
			 });
		});
  });
}
async function changenewloanincomecreate( screendetails, incomeamount, requestedLoanAmount, balanceamount, paymentid, userdetails, counteroffer ) {
	try {
		const applicationRefernceData = await User.getNextSequenceValue( 'application' );
		var applicationReferenceValue =	'APL_' + applicationRefernceData.sequence_value;
		screendetails.oldincomeamount = screendetails.incomeamount;
		screendetails.incomeamount	=	incomeamount;
		if ("undefined" !== typeof screendetails.loanchangeManually && screendetails.loanchangeManually !='' && screendetails.loanchangeManually !=null) {
			var updateDatares	=	{deniedmessage:'This application has been declined, due to loan amount changed manually!',newincomeamount:incomeamount,newloanamount:requestedLoanAmount,iscompleted:2,loanchangeManually:1,loanchanged:1};
			delete screendetails.loanchangeManually;
		} else {
			var updateDatares	=	{deniedmessage:'This application has been declined, due to loan amount change!',newincomeamount:incomeamount,newloanamount:requestedLoanAmount,iscompleted:2,loanchanged:1};
		}

		if( counteroffer ) {
			updateDatares.deniedByCounterOffer = true;
		}
		await Screentracking.update({id: screendetails.id}, updateDatares);

		var iscomplatedVal	=	'0';
		const screenTrackingObject = Object.assign( {}, screendetails );
		screenTrackingObject.applicationReference = applicationReferenceValue;
		screenTrackingObject.lastScreenName = 'Contract';
		screenTrackingObject.lastlevel = 4;
		screenTrackingObject.iscompleted = 0;
		screenTrackingObject.applicationType = "Change Loan";
		delete screenTrackingObject.id;

		const screenTracking = await Screentracking.create(screenTrackingObject);

		var consentCriteria = {	paymentManagement: paymentid };
		await UserConsent.update( consentCriteria, { loanupdated: 2 } );
		const userConsentAgreement = await UserConsent.find( consentCriteria );

		await PaymentManagement.update({user: userdetails.id}, {status: "DENIED"});
		await Achdocuments.update({user: userdetails.id}, {status: 2});

		const consentArray = [];
		_.forEach(userConsentAgreement, function(consentagreement) {
			if(consentagreement.documentKey != "131" && consentagreement.documentKey != "132" ) {
				userconsentObject={
					documentName: consentagreement.documentName,
					documentVersion:consentagreement.documentVersion,
					documentKey: consentagreement.documentKey,
					ip: consentagreement.ip,
					phoneNumber: consentagreement.phoneNumber,
					user: consentagreement.user,
					agreement: consentagreement.agreement,
					loanupdated: 1,
					agreementpath: consentagreement.agreementpath
				};
				consentArray.push( UserConsent.create(userconsentObject) );
			}
		});

		await Promise.all( consentArray );

		var response = {
			newscreenTracking: screenTracking,
			code:200
		}
		return response;
	} catch( err) {
		sails.log.error("Screentracking UserConsent error::", err);
	};
};

function calculateMonthlyPayment(formData,res,type)
{
	return Q.promise(function(resolve, reject) {
		var	manualincome			=	formData.manualincome;
		var	looprequestedloanamount	=	formData.looprequestedloanamount;
		var	interestrate			=	formData.interestrate;
		var	loanmonth				=	formData.loanmonth;
		var	rtype					=	formData.rtype;
		var	userid					=	formData.userid;
		var	consolidateaccountid	=	formData.consolidateaccount;
		var	practiceId	            =	formData.practiceId;

		//--Added for ticket no 2872
		var loansettingcriteria={
			loanactivestatus: 1,
			practicemanagement:practiceId,
			loanterm:loanmonth
		};

		LoanSettings.findOne(loansettingcriteria)
		.then(function(loansettingData){

			if(!loansettingData)
			{
				return resolve ({
					code : 400,
					message: 'Your requested loan amount not available for this '+loanmonth+' month term.'
				});
			}
			else
			{
				if(parseFloat(looprequestedloanamount)< parseFloat(loansettingData.termsloanamount))
				{
					return resolve ({
						code : 400,
						message: 'Your requested loan amount not available for your '+loanmonth+' month term.'
					});
				}
				else
				{
					var consolidateId 		= consolidateaccountid;
					var consolidatecriteria = { id: consolidateId};

					Consolidateaccount
					.findOne(consolidatecriteria)
					.sort("createdAt DESC")
					.then(function (accdetails) {

						var totalbalance =0;
						if(accdetails)
						{
							var consolacc = accdetails.trade;

							var currenttotalbalance=0;
							_.forEach(consolacc, function (account) {
								var industryCode = account.subscriber.industryCode;
								if( industryCode !== 'M' ) {
									if( account.hasOwnProperty( "dateClosed" ) || account.hasOwnProperty( "datePaidOut" ) || parseInt( account.currentBalance ) == 0 ) {
										return;
									}
									currenttotalbalance=parseFloat(currenttotalbalance)+parseFloat(account.currentBalance);
									if(account.terms)
									{
										monthlyamount = parseFloat(account.terms.scheduledMonthlyPayment);
										if(monthlyamount > 0){
											totalbalance = totalbalance+monthlyamount;
										}
									}
								}
							});
						}

						//-- Added for preDTI calclation starts here
						var monthlyIncomeamount = manualincome;
						var preDTIMonthlyAmount = 0;
						var preDTIPercentValue  = 0;
						var maxPreDTI = sails.config.plaid.maxPreDTI;

						if(totalbalance>0 && monthlyIncomeamount>0)
						{
							preDTIMonthlyAmount = parseFloat(totalbalance);
							preDTIPercentValue =  ( parseFloat(preDTIMonthlyAmount)/parseFloat(monthlyIncomeamount) )  * 100;
							preDTIPercentValue =  parseFloat(preDTIPercentValue).toFixed(2);
						}

						//-- Checking wheher preDTI is more than 49.99 then decline
						if(preDTIPercentValue>=maxPreDTI)
						{
							return resolve ({
								code : 400,
								message: 'Your preDTI value should be less than '+maxPreDTI
							});
						}
						else
						{
							var decimalRate 			= 	(interestrate/ 100) / 12;
							var xpowervalue				=	decimalRate + 1;
							var ypowervalue 			=	loanmonth;
							var powerrate_value			=	Math.pow(xpowervalue,ypowervalue) - 1;
							var monthlyPayment 			=	( decimalRate + ( decimalRate / powerrate_value ) ) * looprequestedloanamount;
							monthlyPayment 				=	parseFloat(monthlyPayment.toFixed(2));

							var totalloanamount 		= 	monthlyPayment*loanmonth;
							totalloanamount 			= 	parseFloat(totalloanamount.toFixed(2));

							var interestfeeamount=0;
							if(totalloanamount>looprequestedloanamount)
							{
								interestfeeamount = totalloanamount - looprequestedloanamount;
								interestfeeamount = parseFloat(interestfeeamount.toFixed(2));
							}

							var fullnumberamount = Math.floor(monthlyPayment);
							var decimalamount = monthlyPayment - Math.floor(monthlyPayment);
							decimalamount = parseFloat(decimalamount.toFixed(2));
							decimalamount = decimalamount.toString();
							var decPartAmount = decimalamount.split(".");
							var decPartAmountValue = '.'+decPartAmount[1];

							if(decPartAmountValue.length<3)
							{
								decPartAmountValue =decPartAmountValue+'0';
							}

							var offerData={};
							offerData.financedAmount			=	looprequestedloanamount;
							offerData.monthpayment			=	monthlyPayment;
							offerData.fullnumberamount		= 	fullnumberamount;
							offerData.decimalamount			=	decPartAmountValue;
							offerData.appfeerate			=	0;
							offerData.appfeefixedrate		=	0;
							offerData.paymentfreq			=	'monthly';
							offerData.totalloanamount		=	totalloanamount;
							offerData.interestfeeamount		=	interestfeeamount;
							offerData.interestrate			=	interestrate;
							offerData.loanmonth				=	loanmonth;
							var finalmonthlyPayment 		=	monthlyPayment * -1;


							Screentracking.aprRateCalculator(loanmonth,finalmonthlyPayment,looprequestedloanamount)
							.then(function (effectiveRateValue) {
								var effectiveRate = 12*effectiveRateValue*100;
								effectiveRate = parseFloat(effectiveRate.toFixed(2));
								var maxApr = sails.config.plaid.maxApr;

								if(effectiveRate > parseFloat(maxApr)){
									effectiveRate = maxApr;
								}
								offerData.apr	=	effectiveRate;
								if(rtype=='view')
								{
									offerData.manualincome			=	formData.manualincome;
									offerData.manualloanamount		=	formData.looprequestedloanamount;
									offerData.manualinterestrate	=	formData.interestrate;
									offerData.manualloanmonth		=	formData.loanmonth;
									offerData.screenid				=	formData.screenid;
									offerData.pagename				=	formData.pagename;
											sails.log.info('offerData:::::::', offerData);

									var response = {
										offerData: offerData,
										code:200
									}
									return resolve(response);
								}
								else if(rtype=='manualLoansave')
								{
									var userDetails		=	{id:userid};
									var lastlevel 		=	5;
									var linkedaccid		=	'';
									var consoldateid	= 	'';
									var productid 		=	sails.config.product.productid;

									var newloandetails =[];
									var newloanData = {
										"productid": productid,
										"month": loanmonth,
										"financedAmount": looprequestedloanamount,
										"loanTerm":loanmonth,
										"APR":effectiveRate,
										"interestRate":interestrate,
										"monthlyPayment": monthlyPayment,
										"interestRate": interestrate,
										"appfeerate": "0.00",
										"loanapplicationfixed": "0.00",
										"loanFundingFee": "0.00",
										"totalloanamount": looprequestedloanamount,
										"preDTIAmount":totalbalance,
										//"loanGrade": loanGrade,
										"preBalance":currenttotalbalance,
										"preDTIPercentValue":preDTIPercentValue
									};
									newloandetails.push(newloanData);

									var responsedata = {
										message: 'success',
										user: userid,
										accountDetails:newloandetails
									};

									Screentracking
									.updateLastScreenName(userDetails,'Loan Offer Details',lastlevel,responsedata,linkedaccid,consoldateid,[newloandetails])
									.then(function(screenTracking) {

										var preDTIupdateDatares = {preDTIMonthlyAmount:preDTIMonthlyAmount,preDTIPercentValue:preDTIPercentValue,monthlyIncomeamount:monthlyIncomeamount};
										Screentracking.update({id: screenTracking.id}, preDTIupdateDatares)
										.exec(function afterwards(err, updated){
											return resolve ({
												code : 200,
												message: "updated successfully"
											});
										});
									})
									.catch(function (err) {
										sails.log.error('calculateMonthlyPayment###updateLastScreenName', err);
										return resolve ({
											code : 400,
											message: "Unable to update screentracking"
										});
									});
								}
							}).catch(function (err) {
								sails.log.error("calculateMonthlyPayment###aprRateCalculator::", err);
								return resolve ({
									code : 400,
									message: "Something went wrong. please try again."
								});
							});
						}
						//-- Added for preDTI calclation ends here
					}).catch(function (err) {
						sails.log.error("calculateMonthlyPayment###ConsolidateaccountFind::", err);
						return resolve ({
							code : 400,
							message: "Something went wrong. please try again."
						});
					});
				}
			}
		}).catch(function (err) {
			sails.log.error("calculateMonthlyPayment###ConsolidateaccountFind::", err);
			return resolve ({
				code : 400,
				message: "Something went wrong. please try again."
			});
		});
	});
}

function calculateMonthlyPayment_dec05(formData,res,type)
{
	return Q.promise(function(resolve, reject) {
		var	manualincome			=	formData.manualincome;
		var	looprequestedloanamount	=	formData.looprequestedloanamount;
		var	interestrate			=	formData.interestrate;
		var	loanmonth				=	formData.loanmonth;
		var	rtype					=	formData.rtype;
		var	userid					=	formData.userid;
		var	consolidateaccountid	=	formData.consolidateaccount;

		var decimalRate 			= 	(interestrate/ 100) / 12;
		var xpowervalue				=	decimalRate + 1;
		var ypowervalue 			=	loanmonth;
		var powerrate_value			=	Math.pow(xpowervalue,ypowervalue) - 1;
		var monthlyPayment 			=	( decimalRate + ( decimalRate / powerrate_value ) ) * looprequestedloanamount;
		monthlyPayment 				=	parseFloat(monthlyPayment.toFixed(2));

		var totalloanamount 		= 	monthlyPayment*loanmonth;
		totalloanamount 			= 	parseFloat(totalloanamount.toFixed(2));

		var interestfeeamount=0;
		if(totalloanamount>looprequestedloanamount)
		{
			interestfeeamount = totalloanamount - looprequestedloanamount;
			interestfeeamount = parseFloat(interestfeeamount.toFixed(2));
		}

		var fullnumberamount = Math.floor(monthlyPayment);
		var decimalamount = monthlyPayment - Math.floor(monthlyPayment);
		decimalamount = parseFloat(decimalamount.toFixed(2));
		decimalamount = decimalamount.toString();
		var decPartAmount = decimalamount.split(".");
		var decPartAmountValue = '.'+decPartAmount[1];

		if(decPartAmountValue.length<3)
		{
			decPartAmountValue =decPartAmountValue+'0';
		}

		var offerData={};
 		offerData.financedAmount			=	looprequestedloanamount;
		offerData.monthpayment			=	monthlyPayment;
		offerData.fullnumberamount		= 	fullnumberamount;
		offerData.decimalamount			=	decPartAmountValue;
		offerData.appfeerate			=	0;
		offerData.appfeefixedrate		=	0;
		offerData.paymentfreq			=	'monthly';
		offerData.totalloanamount		=	totalloanamount;
		offerData.interestfeeamount		=	interestfeeamount;
		offerData.interestrate			=	interestrate;
		offerData.loanmonth				=	loanmonth;
		var finalmonthlyPayment 		=	monthlyPayment * -1;
 		Screentracking.aprRateCalculator(loanmonth,finalmonthlyPayment,looprequestedloanamount)
		.then(function (effectiveRateValue) {
			var effectiveRate = 12*effectiveRateValue*100;
			effectiveRate = parseFloat(effectiveRate.toFixed(2));
			var maxApr = sails.config.plaid.maxApr;

			if(effectiveRate > parseFloat(maxApr)){
				effectiveRate = maxApr;
			}
			offerData.apr	=	effectiveRate;
			if(rtype=='view')
			{
				offerData.manualincome			=	formData.manualincome;
				offerData.manualloanamount		=	formData.looprequestedloanamount;
				offerData.manualinterestrate	=	formData.interestrate;
				offerData.manualloanmonth		=	formData.loanmonth;
				offerData.screenid				=	formData.screenid;
				offerData.pagename				=	formData.pagename;
 						sails.log.info('offerData:::::::', offerData);

				var response = {
					offerData: offerData,
					code:200
				}
				return resolve(response);
			}
			else if(rtype=='manualLoansave')
			{
				var userDetails		=	{id:userid};
				var lastlevel 		=	5;
				var linkedaccid		=	'';
				var consoldateid	= 	'';
				var productid 		=	sails.config.product.productid;

				var consolidateId 		= consolidateaccountid;
				var consolidatecriteria = { id: consolidateId};

				Consolidateaccount
				.findOne(consolidatecriteria)
				.sort("createdAt DESC")
				.then(function (accdetails) {

					var totalbalance =0;
					if(accdetails){
						var consolacc = accdetails.trade;

						var currenttotalbalance=0;
						_.forEach(consolacc, function (account) {
							var industryCode = account.subscriber.industryCode;
							if ((industryCode !== 'M')) {
								currenttotalbalance=parseFloat(currenttotalbalance)+parseFloat(account.currentBalance);
								if(account.terms)
								{
									monthlyamount = parseFloat(account.terms.scheduledMonthlyPayment);
									if(monthlyamount > 0){
										totalbalance = totalbalance+monthlyamount;
									}
								}
							}
						})
					}

					var newloandetails =[];
					var newloanData = {
						"productid": productid,
						"month": loanmonth,
						"financedAmount": looprequestedloanamount,
						"loanTerm":loanmonth,
						"APR":effectiveRate,
						"interestRate":interestrate,
						"monthlyPayment": monthlyPayment,
						"interestRate": interestrate,
						"appfeerate": "0.00",
						"loanapplicationfixed": "0.00",
						"loanFundingFee": "0.00",
						"totalloanamount": looprequestedloanamount,
						"preDTIAmount":totalbalance,
						//"loanGrade": loanGrade,
						"preBalance":currenttotalbalance
					};
					newloandetails.push(newloanData);

					var responsedata = {
						message: 'success',
						user: userid,
						accountDetails:newloandetails
					};

					Screentracking
					.updateLastScreenName(userDetails,'Loan Offer Details',lastlevel,responsedata,linkedaccid,consoldateid,[newloandetails])
					.then(function(screenTracking) {
  						return resolve ({
							code : 200,
							message: "updated successfully"
						});
 					})
					.catch(function (err) {
						sails.log.error('calculateMonthlyPayment###updateLastScreenName', err);
						return resolve ({
							code : 400,
							message: "Unable to update screentracking"
						});
					});
				}).catch(function (err) {
					sails.log.error("calculateMonthlyPayment###ConsolidateaccountFind::", err);
					return resolve ({
						code : 400,
						message: "Something went wrong. please try again."
					});
				});
			}
		}).catch(function (err) {
			sails.log.error("calculateMonthlyPayment###aprRateCalculator::", err);
			return resolve ({
				code : 400,
				message: "Something went wrong. please try again."
			});
		});
	});
}

function getGradeLoanamount(screenData,loanAmntarr)
{
	return Q.promise(function(resolve, reject) {

		var screenId 			= screenData.id;
		var consolidateId 		= screenData.consolidateaccount;
		var creditScore 		= parseInt(screenData.creditscore);
		var minimumIncomePlaid 	= sails.config.plaid.minincomeamount;
		var maximumDti 			= sails.config.plaid.minincomeamount;
		var incomeamount 		= parseFloat(screenData.incomeamount/12).toFixed(2);
		var practiceId 		=	screenData.practicemanagement.id;
		var stateCode		=	screenData.practicemanagement.StateCode;
		var LAminLoanamount =	sails.config.plaid.LAminLoanamount;
		var LAmaxLoanamount =	sails.config.plaid.LAmaxLoanamount;
		var basicLoanamount = 	sails.config.plaid.basicLoanamount;

		//-- Added for preDTI calclation starts here
		var monthlyIncomeamount = parseFloat(screenData.incomeamount);
		var maxPreDTI = sails.config.plaid.maxPreDTI;
		//-- Added for preDTI calclation ends here

		if(( parseFloat(screenData.incomeamount) < minimumIncomePlaid) && (sails.config.plaid.minimumIncomePlaidStatus == true))
		{
			return resolve ({
				code : 500,
				message: 'Income amount should be greater than $'+sails.config.plaid.minincomeamount
			});
		}
		else
		{
			var consolidatecriteria = { id: consolidateId};
			Consolidateaccount
			.findOne(consolidatecriteria)
			.sort("createdAt DESC")
			.then(function (accdetails) {
				//-- Updated on Nov 03, 2018 to block trade error
				var totalbalance =0;
				if("undefined" !== typeof accdetails && accdetails!='' && accdetails!=null)
				{
					var consolacc = accdetails.trade;
					_.forEach(consolacc, function (account) {
						var industryCode = account.subscriber.industryCode;
						var currenttotalbalance=0;
						if( industryCode !== 'M' ) {
							if( account.hasOwnProperty( "dateClosed" ) || account.hasOwnProperty( "datePaidOut" ) || parseInt( account.currentBalance ) == 0 ) {
								return;
							}
							currenttotalbalance=parseFloat(currenttotalbalance)+parseFloat(account.currentBalance);
							if(account.terms)
							{
								monthlyamount = parseFloat(account.terms.scheduledMonthlyPayment);
								if(monthlyamount > 0){
									totalbalance = totalbalance+monthlyamount;
								}
							}
						}
					});
				}

				//-- Added for preDTI calclation starts here
				var preDTIMonthlyAmount = 0;
				var preDTIPercentValue  = 0;

				if(totalbalance>0 && monthlyIncomeamount>0)
				{
					preDTIMonthlyAmount = parseFloat(totalbalance);
					preDTIPercentValue =  ( parseFloat(preDTIMonthlyAmount)/parseFloat(monthlyIncomeamount) )  * 100;
					preDTIPercentValue =  parseFloat(preDTIPercentValue).toFixed(2);
				}

				//-- Checking wheher preDTI is more than 49.99 then decline
				if(preDTIPercentValue>=maxPreDTI)
				{
					return resolve ({
						code : 500,
						message: 'Your preDTI value should be less than '+maxPreDTI
					});
				}
				else
				{
					var loansettingcriteria={
						loanactivestatus: 1,
						practicemanagement:practiceId
					};

					LoanSettings.find(loansettingcriteria)
					.then(function(loansettingData){
						var loantermsArray=[];
						if(loansettingData.length>0)
						{
							_.forEach(loansettingData, function (loansettingInfo) {
								var enableTerm=1;
								var loansettingInfoData ={
								  loanterm: loansettingInfo.loanterm,
								  enableTerm:enableTerm,
								  stateCode:stateCode,
								  creditScore:creditScore,
								  totalbalance:totalbalance
								}
								loantermsArray.push(loansettingInfoData);
							});
							//sails.log.info("loantermsArray::::",loantermsArray);

							if(loantermsArray.length>0)
							{
								var firstloopcounter=0;
								var loanAmntarrLength = loanAmntarr.length;
								var loangradeAmntArray=[];
								_.forEach(loanAmntarr, function (financedAmount) {

									Screentracking
									.getGradeOfferDetails(loantermsArray,financedAmount)
									.then(function(gradeOfferRes) {
										if(gradeOfferRes.status==200)
										{
											var gradeOffervalue	=	{ stateCode:stateCode,financedAmount:financedAmount,gradeofferdata:gradeOfferRes.data};
											//loangradeAmntArray.push(gradeOfferRes.data);
											loangradeAmntArray[firstloopcounter]	=	gradeOffervalue;
										}
										firstloopcounter++;
										if(firstloopcounter==loanAmntarrLength)
										{
											var responseData ={
											   code : 200,
											   loangradeAmntArray : loangradeAmntArray
											}
											return resolve(responseData);
										}
									})
									.catch(function (err) {
										firstloopcounter++;
										if(firstloopcounter==loanAmntarrLength)
										{
											var responseData ={
											   code : 200,
											   loangradeAmntArray : loangradeAmntArray
											}
											return resolve(responseData);
										}
									});
								});
							}
							else
							{
								sails.log.error('Loan term not found:' );
								return resolve ({
									code : 400,
									message: "Loan term not found"
								});
							}
						}
						else
						{
							sails.log.error('Loansettings not found:' );
							return resolve ({
								code : 400,
								message: "Loansettings not found"
							});
						}
					}).catch(function (err) {
						sails.log.error('Loansettings Invalid:', err);
						return resolve ({
							code : 400,
							message: "Loansettings Invalid"
						});
					});
				}
			}).catch(function (err) {
				sails.log.error('Consolidateaccount not found:', err);
				return resolve ({
					code : 400,
					message: "Consolidateaccount not found"
				});
			});
		}
		//-- Added for preDTI calclation ends here
	});
}

function getGradeOfferDetails(loantermsData,queryMaxLoanamount)
{
	return Q.promise(function(resolve, reject) {

		//var queryMaxLoanamount		 =	parseFloat(queryMaxLoanamount).toFixed(2);
		var configmaxiDti 		= sails.config.plaid.maximumDti;

		var loanterminterestArray=[];
		var loangradeterminterestArray=[];
		var iloop=0;
		var loopcount= loantermsData.length;

		_.forEach(loantermsData, function (loanDetails) {

			var loanterm =loanDetails.loanterm;
			var settingenableTerm =loanDetails.enableTerm;
			var creditScore =loanDetails.creditScore;
			var stateCode =loanDetails.stateCode;
			var totalbalance =loanDetails.totalbalance;

			//for testing purpose
			//creditScore	=	750

			var loaninterestCriteria= {
				term:loanterm,
				stateCode:stateCode,
				mincreditscore:{ $lte: creditScore },
				maxcreditscore:{ $gte: creditScore },
				maxloanamount: queryMaxLoanamount
			};

			Loaninterestrate
			.findOne(loaninterestCriteria)
			.then(function(interestrateData){
				 var interestRate =0;
				 var minimumdti,maximumdti,rate,grade,loanGrade;

				 if(interestrateData)
				 {
					 _.forEach(interestrateData.intrestrate, function (interestratevalues) {

						minimumdti = parseInt(interestratevalues.minimumdti) *1000;
						maximumdti = parseInt(interestratevalues.maximumdti) *1000;
						rate = parseFloat(interestratevalues.rate);
						grade = interestratevalues.grade;

						//Added to restrict the totalbalance to be more than maxDTI
						if(totalbalance > configmaxiDti) {
							totalbalance = configmaxiDti;
						}

						if( (totalbalance==0 || totalbalance>minimumdti) && totalbalance<=maximumdti && interestRate==0 )
						{
							interestRate = rate;
							loanGrade = grade;
						}

					});
				}

				if(parseFloat(interestRate) > 0)
				{
					var loaninfo ={
					  loanID: interestrateData.id,
					  loanTerm:	loanterm,
					  interestRate:interestRate,
					  loanGrade: loanGrade,
					  settingenableTerm:settingenableTerm,
					  stateCode:stateCode
					}
					loanterminterestArray.push(loaninfo);
				}
				iloop =iloop+1;

				if(iloop == loopcount)
				{
					var i=0;
					var forlength = loanterminterestArray.length;

					if(loanterminterestArray.length>0)
					{
						_.forEach(loanterminterestArray, function(loantermDetails) {
							var gradecriteria={
								gradelevel: loantermDetails.loanGrade,
								gradeterm: loantermDetails.loanTerm,
								maxloanamount: queryMaxLoanamount,
								stateCode:stateCode
							};

							Loangradesettings
							.findOne(gradecriteria)
							.then(function(gradesettingData){

								var finalrequestedloanamount = parseFloat(queryMaxLoanamount);
								var disableloanTerm=0;
								if(gradesettingData)
								{

									var grademininterest= gradesettingData.minimuminterest;
									var grademaxinterest= gradesettingData.maximuminterest;

									if( parseFloat(grademininterest)>0 && parseFloat(grademaxinterest)>0 )
									{

										//-- check grade max interest setting criteria
										if(parseFloat(loantermDetails.interestRate)> parseFloat(gradesettingData.maximuminterest))
										{
											loantermDetails.interestRate =  gradesettingData.maximuminterest;
										}

										//-- check grade min interest setting criteria
										if(parseFloat(loantermDetails.interestRate)< parseFloat(gradesettingData.minimuminterest))
										{
											loantermDetails.interestRate =  gradesettingData.minimuminterest;
										}

										//-- check grade max loan amount cap setting criteria(Not possible controlled in beginning)
										if(parseFloat(finalrequestedloanamount)> parseFloat(gradesettingData.maximumamount))
										{
											finalrequestedloanamount = parseFloat(gradesettingData.maximumamount);
											//-- To bypass loan amount greater than 30000
											//finalrequestedloanamount = parseFloat(requestedLoanAmount);
										}

										//-- check grade min loan amount cap setting criteria
										if(parseFloat(finalrequestedloanamount)< parseFloat(gradesettingData.minimumamount))
										{
											finalrequestedloanamount =parseFloat(gradesettingData.minimumamount);
											disableloanTerm =1;
										}


										if(disableloanTerm==1)
										{
											loantermDetails.settingenableTerm =0;
										}


										//-- Added to avoid settingenableTerm
										if(disableloanTerm==0)
										{
											var loangradeinfo ={
											  loanID: loantermDetails.loanID,
											  loanTerm:	loantermDetails.loanTerm,
											  interestRate:loantermDetails.interestRate,
											  loanGrade: loantermDetails.loanGrade,
											  settingenableTerm:loantermDetails.settingenableTerm,
											  minimumamount: gradesettingData.minimumamount,
											  maximumamount: gradesettingData.maximumamount,
											  minimuminterest: gradesettingData.minimuminterest,
											  maximuminterest: gradesettingData.maximuminterest,
											  finalrequestedloanamount: finalrequestedloanamount
											}
											loangradeterminterestArray.push(loangradeinfo);
										}
									}
								}
								i++;

								if(i == forlength)
								{
									if(loangradeterminterestArray.length>0)
									{
										loangradeterminterestArray = _.orderBy(loangradeterminterestArray, ['loanTerm'], ['asc']);
										return resolve ({
											status : 200,
											data: loangradeterminterestArray
										});
									}
									else
									{
										return resolve ({
											status : 400,
											data: "Loangradesettngs not found"
										});
									}
								}
							}).catch(function (err) {
								i++;
 								if(i == forlength)
								{
									if(loangradeterminterestArray.length>0)
									{
										loangradeterminterestArray = _.orderBy(loangradeterminterestArray, ['loanTerm'], ['asc']);
										return resolve ({
											status : 200,
											data: loangradeterminterestArray
										});
									}
									else
									{
										return resolve ({
											status : 400,
											data: "Loangradesettngs not found"
										});
									}
								}
							});
						});
					}
					else
					{
						return resolve ({
							status : 400,
							message: "Loaninterestrate not found"
						});
					}
				}
			}).catch(function (err) {
				iloop =iloop+1;

				if(iloop == loopcount)
				{
					if(loangradeterminterestArray.length>0)
					{
						loangradeterminterestArray = _.orderBy(loangradeterminterestArray, ['loanTerm'], ['asc']);
						return resolve ({
							status : 200,
							data: loangradeterminterestArray
						});
					}
					else
					{
						return resolve ({
							status : 400,
							data: "Loangradesettngs not found"
						});
					}
				}
			});
		});
	});
}

function checkQualifiedAmount( userId, incomeAmount, financedAmount ) {
	return Q.promise( function( resolve, reject ) {
		const criteria = { user: userId, iscompleted: 0 };

		Screentracking
		.findOne( criteria )
		// .populate("plaiduser")
		// .populate("user")
		.populate( "practicemanagement", { select: [ "id", "StateCode" ] } )
		.sort( "createdAt DESC" )
		.then( function( userAccountres ) {
			const screenId = userAccountres.id;
			const consolidateId = userAccountres.consolidateaccount;
			const creditScore = parseInt(userAccountres.creditscore);
			const practiceId = userAccountres.practicemanagement.id;
			const stateCode = userAccountres.practicemanagement.StateCode;

			const minimumIncomePlaid = sails.config.plaid.minincomeamount;
			const maxPreDTI = sails.config.plaid.maxPreDTI;
			const LAminLoanamount = sails.config.plaid.LAminLoanamount;
			const basicLoanamount = sails.config.plaid.basicLoanamount;
			const checkLAState = sails.config.plaid.checkLAState;

			let requestedLoanAmount = parseFloat(financedAmount);
			const annualIncomeAmount = parseFloat(incomeAmount) * 12;

			let queryMaxLoanamount = basicLoanamount;
			if( stateCode == checkLAState ) {
				if( parseFloat( requestedLoanAmount ) <= parseFloat( LAminLoanamount ) ) {
					queryMaxLoanamount = LAminLoanamount;
				}
			}

			if( ( parseFloat( annualIncomeAmount ) < minimumIncomePlaid ) && ( sails.config.plaid.minimumIncomePlaidStatus == true ) ) {
				return resolve( {
					code: 600,
					message: "Your annual income needs to be more than "+minimumIncomePlaid
				} );
			} else {
				const consolidatecriteria = { id: consolidateId };

				Consolidateaccount
				.findOne( consolidatecriteria )
				.sort( "createdAt DESC" )
				.then( function( accdetails ) {
					let totalbalance =0;
					if( accdetails ) {
						const consolacc = accdetails.trade;
						_.forEach( consolacc, function( account ) {
							const industryCode = account.subscriber.industryCode;
							let currenttotalbalance = 0; /* FIXME - nothing uses this */
							if( industryCode !== "M" ) {
								if( account.hasOwnProperty( "dateClosed" ) || account.hasOwnProperty( "datePaidOut" ) || parseInt( account.currentBalance ) == 0 ) {
									return;
								}
								currenttotalbalance=parseFloat( currenttotalbalance )+parseFloat( account.currentBalance );
								if( account.terms ) {
									const monthlyamount = parseFloat( account.terms.scheduledMonthlyPayment );
									if( monthlyamount > 0) {
										totalbalance = totalbalance+monthlyamount;
									}
								}
							}
						});
					}

					let preDTIMonthlyAmount = 0;
					let preDTIPercentValue = 0;

					if( totalbalance>0 && monthlyIncomeamount > 0 ) {
						preDTIMonthlyAmount = parseFloat( totalbalance );
						preDTIPercentValue = ( parseFloat( preDTIMonthlyAmount ) / parseFloat( monthlyIncomeamount ) ) * 100;
						preDTIPercentValue = parseFloat( preDTIPercentValue ).toFixed( 2 );
					}

					const preDTIupdateDatares = { preDTIMonthlyAmount: preDTIMonthlyAmount, preDTIPercentValue: preDTIPercentValue, monthlyIncomeamount: monthlyIncomeamount };
					Screentracking.update( { id: screenId }, preDTIupdateDatares )
					.exec( function afterwards( err, updated ) {
						if( preDTIPercentValue >= maxPreDTI ) {
							return resolve( {
								code: 500,
								message: "You have high preDTI value: "+ preDTIPercentValue
							} );
						} else {
							const loansettingcriteria = {
								loanactivestatus: 1,
								practicemanagement: practiceId
							};

							LoanSettings.find( loansettingcriteria )
							.then( function( loansettingData ) {
								let loantermsArray=[];
								const preloantermsArray=[];

								if( loansettingData ) {
									const enableTerm = 1;
									let minprequalifiedAmount = 0;

									_.forEach( loansettingData, function( loansettingInfo ) {
										if( parseFloat( requestedLoanAmount ) >= parseFloat( loansettingInfo.termsloanamount ) ) {
											const loansettingInfoData = {
												loanterm: loansettingInfo.loanterm,
												enableTerm: enableTerm
											};
											loantermsArray.push( loansettingInfoData );
										} else {
											// -- Added to get prequalifiedAmount
											if( loantermsArray.length==0 ) {
												const loansettingInfoData = {
													loanterm: loansettingInfo.loanterm,
													enableTerm: enableTerm
												};

												if( parseFloat( minprequalifiedAmount ) > 0 ) {
													if( parseFloat( minprequalifiedAmount )> parseFloat( loansettingInfo.termsloanamount ) ) {
														minprequalifiedAmount = parseFloat( loansettingInfo.termsloanamount );
														preloantermsArray.push( loansettingInfoData );
													}
												} else {
													minprequalifiedAmount = parseFloat( loansettingInfo.termsloanamount );
													preloantermsArray.push( loansettingInfoData );
												}
											}
										}
									} );

									sails.log.info( "loantermsArray.length::", loantermsArray.length );
									sails.log.info( "minprequalifiedAmount::", minprequalifiedAmount );

									// -- Added to get prequalifiedAmount
									if( loantermsArray.length == 0 && parseFloat( minprequalifiedAmount ) > 0 ) {
										newAmountFound = 1;
										loantermsArray = preloantermsArray;
										requestedLoanAmount = parseFloat( minprequalifiedAmount );
									}

									if( loantermsArray.length > 0 ) {
										const loanterminterestArray=[];
										const promiseArray = [];

										_.forEach( loantermsArray, function( loanDetails ) {
											const loanterm =loanDetails.loanterm;
											const settingenableTerm =loanDetails.enableTerm;

											const loaninterestCriteria = {
												term: loanterm,
												stateCode: stateCode,
												mincreditscore: { $lte: creditScore },
												maxcreditscore: { $gte: creditScore },
												maxloanamount: queryMaxLoanamount
											};

											const interestPromise = Loaninterestrate
											.findOne( loaninterestCriteria )
											.then( function( interestrateData ) {
												let interestRate = 0;
												let minimumdti;
												let maximumdti;
												let rate;
												let grade;
												let loanGrade;

												if( interestrateData ) {
													_.forEach( interestrateData.intrestrate, function( interestratevalues ) {
														minimumdti = parseFloat( interestratevalues.minimumdti );
														maximumdti = parseFloat( interestratevalues.maximumdti );
														rate = parseFloat( interestratevalues.rate );
														grade = interestratevalues.grade;

														if( ( preDTIPercentValue==0 || preDTIPercentValue >= minimumdti ) && preDTIPercentValue < maximumdti && interestRate == 0 ) {
															interestRate = rate;
															loanGrade = grade;
														}
													} );
												}

												if( parseFloat( interestRate ) > 0 ) {
													const loaninfo = {
														loanID: interestrateData.id,
														loanTerm:	loanterm,
														interestRate: interestRate,
														loanGrade: loanGrade,
														settingenableTerm: settingenableTerm,
														stateCode: stateCode
													};
													loanterminterestArray.push( loaninfo );
												}
											} ).catch( function( err ) {
												// --collection fetch error
												return resolve( {
													code: 400,
													message: "Loaninterestrate not found"
												} );
											} );
											promiseArray.push( interestPromise );
										} );

										return Promise.all( promiseArray )
										.then( () => {
											const loangradeterminterestArray=[];

											// --max prequalified amount
											let maxprequalifiedAmount =0;

											if( loanterminterestArray.length > 0 ) {
												const promiseArray = [];

												_.forEach( loanterminterestArray, function( loantermDetails ) {
													const gradecriteria = {
														gradelevel: loantermDetails.loanGrade,
														gradeterm: loantermDetails.loanTerm,
														maxloanamount: queryMaxLoanamount,
														stateCode: stateCode
													};

													const loangradePromise = Loangradesettings
													.findOne( gradecriteria )
													.then( function( gradesettingData ) {
														let finalrequestedloanamount = parseFloat( requestedLoanAmount );
														const disableloanTerm = 0;

														if( gradesettingData ) {
															const grademininterest = gradesettingData.minimuminterest;
															const grademaxinterest = gradesettingData.maximuminterest;

															sails.log.info( "finalrequestedloanamount::", finalrequestedloanamount );

															if( parseFloat( grademininterest ) > 0 && parseFloat( grademaxinterest ) > 0 ) {
																// -- check grade max interest setting criteria
																if( parseFloat( loantermDetails.interestRate ) > parseFloat( gradesettingData.maximuminterest ) ) {
																	loantermDetails.interestRate = gradesettingData.maximuminterest;
																}

																// -- check grade min interest setting criteria
																if( parseFloat( loantermDetails.interestRate ) < parseFloat( gradesettingData.minimuminterest ) ) {
																	loantermDetails.interestRate = gradesettingData.minimuminterest;
																}

																// -- check grade max loan amount cap setting criteria(Not possible controlled in beginning)
																if( parseFloat( finalrequestedloanamount )> parseFloat( gradesettingData.maximumamount ) ) {
																	sails.log.info( "newAmountFound:maximumamount::", finalrequestedloanamount, gradesettingData.maximumamount );

																		newAmountFound = 1;
																		finalrequestedloanamount = parseFloat( gradesettingData.maximumamount );
																	// -- To bypass loan amount greater than 30000
																	// finalrequestedloanamount = parseFloat(requestedLoanAmount);
																}

																// -- check grade min loan amount cap setting criteria
																if( parseFloat( finalrequestedloanamount ) < parseFloat( gradesettingData.minimumamount ) ) {
																	sails.log.info( "newAmountFound:minimumamount::", finalrequestedloanamount, gradesettingData.minimumamount );

																		newAmountFound =1;
																		finalrequestedloanamount = parseFloat( gradesettingData.minimumamount );
																		// disableloanTerm =1;
																	}


																// --max prequalified amount
																if( parseFloat( maxprequalifiedAmount ) < parseFloat( gradesettingData.maximumamount ) ) {
																	maxprequalifiedAmount = parseFloat( gradesettingData.maximumamount );
																}

																if( disableloanTerm==1 ) {
																	loantermDetails.settingenableTerm =0;
																}

																// -- Added to avoid settingenableTerm (check)
																if( disableloanTerm == 0 ) {
																	const loangradeinfo = {
																		loanID: loantermDetails.loanID,
																		loanTerm:	loantermDetails.loanTerm,
																		interestRate: loantermDetails.interestRate,
																		loanGrade: loantermDetails.loanGrade,
																		settingenableTerm: loantermDetails.settingenableTerm,
																		minimumamount: gradesettingData.minimumamount,
																		maximumamount: gradesettingData.maximumamount,
																		minimuminterest: gradesettingData.minimuminterest,
																		maximuminterest: gradesettingData.maximuminterest,
																		finalrequestedloanamount: finalrequestedloanamount
																	};
																	loangradeterminterestArray.push(loangradeinfo);
																}
															}
														}
													} ).catch( function( err ) {
														// --collection fetch error
														return resolve( {
															code: 400,
															message: "Loangradesettings not found"
														} );
													} );

													promiseArray.push( loangradePromise );
												} );

												return Promise.all(promiseArray)
													.then(() => {
														if (loangradeterminterestArray.length > 0) {
															let maxLoanRequest = 0;
															let minLoanRequest = 1000000;

															loangradeterminterestArray.forEach((loanGradeTermInterest) => {
																if (loanGradeTermInterest.finalrequestedloanamount > maxLoanRequest ) {
																	maxLoanRequest = loanGradeTermInterest.finalrequestedloanamount;
																}
																if (loanGradeTermInterest.finalrequestedloanamount < minLoanRequest) {
																	minLoanRequest = loanGradeTermInterest.finalrequestedloanamount;
																}
															});

															if (requestedLoanAmount > maxLoanRequest ) {
																return resolve({
																	code: 300,
																	message: "Application offer avialable",
																	prequalifiedAmount: maxLoanRequest,
																	financedAmount: "decreased",
																	maxprequalifiedAmount: maxprequalifiedAmount
																});
															} else if (requestedLoanAmount < minLoanRequest ) {
																return resolve({
																	code: 300,
																	message: "Application offer avialable",
																	prequalifiedAmount: minLoanRequest,
																	financedAmount: "increased",
																	maxprequalifiedAmount: maxprequalifiedAmount
																});
															} else {
																return resolve({
																	code: 200,
																	message: "Application offer avialable",
																	prequalifiedAmount: requestedLoanAmount,
																	newAmountFound: 0
																});
															}
														} else {
															// -- Need to check scenarios (to avoid issue)
															// -- declined loan
															return resolve({
																code: 400,
																message: "Loangradesettings not found for the term"
															});
														}
													});
											} else {
												// -- Need to check scenarios (to avoid issue)
												// -- declined loan
												return resolve( {
													code: 400,
													message: "Loaninterestrate not found for the term"
												} );
											}
										} );
									} else {
										// -- Need to check scenarios (to avoid issue)
										// -- declined loan
										return resolve( {
											code: 400,
											message: "Loan term not found"
										} );
									}
								} else {
									// sails.log.error("Invalid Error ::");
									// --collection fetch error
									return resolve( {
										code: 400,
										message: "Invalid Loansettings not found"
									} );
								}
							} ).catch( function( err ) {
								// sails.log.error("Error ::",err);
								// --collection fetch error
								return resolve( {
									code: 400,
									message: "Loansettings not found"
								} );
							} );
						}
					} );
				} ).catch( function( err ) {
					// --collection fetch error
					return resolve( {
						code: 400,
						message: "Consolidateaccount not found"
					} );
				} );
			}
		} )
		.catch( function( err ) {
			// --collection fetch error
			return resolve( {
				code: 400,
				message: "Screentracking not found"
			} );
		} );
	} );
}


//--Estimate montly payment
function getEstimateMonthlyPay( estimateData ) {
	sails.log.info( "getEstimateMonthlyPay:", estimateData );
	var practiceId = estimateData.practiceId;
	var creditScore = Math.min( 850, Math.max( 580, parseInt( estimateData.ficoscore ) ) );
	var requestedLoanAmount = parseFloat( estimateData.financeamount );
	var basicLoanamount = sails.config.plaid.basicLoanamount;
	var estimateAnnualIncome = sails.config.plaid.estimateAnnualIncome;
	var estimatePreDebt = sails.config.plaid.estimatePreDebt;
	var preDTIMonthlyAmount = 0;
	var preDTIPercentValue  = 0;
	var stateCode;
	var monthlyIncomeamount = parseFloat( estimateAnnualIncome );
	var totalbalance = parseFloat( estimatePreDebt );
	var queryMaxLoanamount = basicLoanamount;
	var loanterminterestArray = [];

	if( totalbalance > 0 && monthlyIncomeamount > 0 ) {
		preDTIMonthlyAmount = parseFloat( totalbalance );
		preDTIPercentValue = ( ( preDTIMonthlyAmount / parseFloat( monthlyIncomeamount ) ) * 100 ).toFixed( 2 );
		// sails.log.info( "preDTIPercentValue:", preDTIPercentValue );
	}

	return Q.promise( function( resolve ) {

		var reqRes = {};

		return findPractice()
		.then( saveApplicant )
		.then( findLoanInterestRates )
		.then( calcPayments )
		.then( () => {
			return resolve( reqRes );
		} );


		function findPractice() {
			var criteria = { id: practiceId };
			return PracticeManagement.findOne( criteria, { select: [ 'PracticeName','PracticeUrl','LocationName','StreetAddress','City','StateCode','UrlSlug' ] } )
			.then( ( practiceData ) => {
				if( ! practiceData ) {
					sails.log.error( "Invalid Practice:", estimateData.practiceId );
					return resolve( { code : 400, message: "Invalid Practice" } );
				}
				stateCode = practiceData.StateCode;
				// sails.log.info( "Practice.stateCode:", estimateData.practiceId, stateCode );
			} );
		}

		function saveApplicant() {
			return InterestedApplicant.findOne( { practicemanagement: practiceId, firstname: estimateData.firstname, lastname: estimateData.lastname, email: estimateData.email, stateCode: stateCode } )
			.then( ( applicant ) => {
				sails.log.info( "applicant:", applicant );
				var calcPayment = { ficoscore: estimateData.ficoscore, financeamount: estimateData.financeamount, createdAt: new Date() };
				if( ! applicant ) {
					return InterestedApplicant.create( {
						practicemanagement: practiceId,
						firstname: estimateData.firstname,
						lastname: estimateData.lastname,
						email: estimateData.email,
						stateCode: stateCode,
						calcPayments: [ calcPayment ]
					} ); //save
				}
				applicant.calcPayments.unshift( calcPayment );
				return InterestedApplicant.update( { id: applicant.id }, { calcPayments: applicant.calcPayments } ); // update
			} );
		}

		function findLoanInterestRates() {
			return LoanSettings.find( { practicemanagement: practiceId, loanactivestatus: 1 } )
			.then( ( loansettings ) => {
				var terms = [];
				loansettings.forEach( ( loansetting ) => {
					if( requestedLoanAmount >= loansetting.termsloanamount ) {
						terms.push( loansetting.loanterm );
					}
				} )
				var loaninterestCriteria = { stateCode: stateCode, term: { $in: terms  } };
				// sails.log.info( "loaninterestCriteria:", loaninterestCriteria );
				return Loaninterestrate.find( loaninterestCriteria )
				.then( ( interestrateData ) => {
					/*
						We need to know the worst possible credit score somebody can have and still get a loan
						in this state.  Modern Health Finance never wants the calculator to produce no results.
					*/
					let lowestCreditScore = 1000;
					interestrateData.forEach( ( details ) => {
						if( details.mincreditscore < lowestCreditScore ) {
							lowestCreditScore = details.mincreditscore;
						}
					} );
					if( creditScore < lowestCreditScore ) {
						creditScore = lowestCreditScore;
					}

					let newInterestList = [];
					for( let idx = 0; idx < interestrateData.length; idx++ ) {
						if( creditScore < interestrateData[ idx ].mincreditscore ) {
							continue;
						}
						if( creditScore > interestrateData[ idx ].maxcreditscore ) {
							continue;
						}
						newInterestList.push( interestrateData[ idx ] );
					}
					return newInterestList;
				} )
				.then( ( interestrateData ) => {
					/*
						There are states that have more than one table for the same loan term based on the loan amount.
						Consequently we need an upper and lower bound on loan amounts.  This block of code, ensures
						that each object has a minimum and a maximum.
					*/
					for( let wIdx = 0; wIdx < interestrateData.length; wIdx++ ) {
						if( !interestrateData[ wIdx ].maxloanamount ) {
							interestrateData[ wIdx ].maxloanamount = 1000000;
						}
						for( let rIdx = 0; rIdx < interestrateData.length; rIdx++ ) {
							if( rIdx == wIdx ) {
								/* ignores itself */
								continue;
							}
							if( interestrateData[ rIdx ].term != interestrateData[ wIdx ].term ) {
								/* ignore records that have different terms */
								continue;
							}
							if( interestrateData[ rIdx ].maxloanamount < interestrateData[ wIdx ].maxloanamount ) {
								/* the observed has a lower maxloanamount than the one we are trying to fix */
								if( ( !interestrateData[ wIdx ].minloanamount ) || ( interestrateData[ rIdx ].maxloanamount > interestrateData[ wIdx ].minloanamount ) ) {
									/* set the lower boundary of the one were fixing with the high boundary of the one were observing */
									interestrateData[ wIdx ].minloanamount = interestrateData[ rIdx ].maxloanamount;
								}
							}
						}
						if( !interestrateData[ wIdx ].minloanamount ) {
							interestrateData[ wIdx ].minloanamount = 0;
						}
					}

					/*
						Now we need to make any amount up to (sails.config.plaid.maxrequestedamount) work without messing up the cases
						where there is more than one range.
					*/
					console.log( interestrateData );

					for( let wIdx = 0; wIdx < interestrateData.length; wIdx++ ) {
						let highestIdx = -1;
						let highestLoanAmount = 0;
						for( let rIdx = 0; rIdx < interestrateData.length; rIdx++ ) {
							if( interestrateData[ rIdx ].term != interestrateData[ wIdx ].term ) {
								/* ignore records that have different terms */
								continue;
							}

							if( interestrateData[ rIdx ].maxloanamount > highestLoanAmount ) {
								highestLoanAmount = interestrateData[ rIdx ].maxloanamount;
								highestIdx = rIdx;
							}
						}
						if( interestrateData[ highestIdx ].maxloanamount < sails.config.plaid.maxrequestedamount ) {
							interestrateData[ highestIdx ].maxloanamount = sails.config.plaid.maxrequestedamount;
						}
					}
					return interestrateData;
				} )
				.then( ( interestrateData ) => {
					var lastItem;
					interestrateData.forEach( ( interestrateDetail ) => {
						var rates = _.sortBy( interestrateDetail.intrestrate, ["minimumdti"] );
						// sails.log.info( "interestrateDetail:", interestrateDetail );
						if( ( requestedLoanAmount <= interestrateDetail.maxloanamount ) ) {
							if( ( requestedLoanAmount > interestrateDetail.minloanamount ) ) {
								var interestRate = 0;
								var minimumdti, maximumdti, rate, grade, loanGrade;
								rates.forEach( ( interestrate ) => {
									if( parseFloat( interestrate.rate ) == 0 ) return;
									lastItem = interestrate;
									minimumdti = parseFloat( interestrate.minimumdti );
									maximumdti = parseFloat( interestrate.maximumdti );
									if( preDTIPercentValue >= minimumdti && preDTIPercentValue <= maximumdti ) {
										sails.log.info( "interestrate:", interestrate );
										interestRate = parseFloat( interestrate.rate );
										loanGrade = interestrate.grade;
									}
								} );
								if( interestRate == 0 ) {
									sails.log.info( "lastItem:", lastItem );
									interestRate = parseFloat( lastItem.rate );
									loanGrade = lastItem.grade;
								}
								sails.log.info( "Term Interest Rates:", { term: interestrateDetail.term, interestRate, loanGrade } );
								loanterminterestArray.push( {
									loanID: interestrateDetail.id,
									loanTerm: interestrateDetail.term,
									interestRate: interestRate,
									loanGrade: loanGrade,
									stateCode: stateCode
								} );
							}
						}
					} );
				} );
			} );
		}

		function calcPayments() {
			var outputArray = [];
			loanterminterestArray.forEach( ( loantermItem ) => {
				var decimalRate = ( loantermItem.interestRate / 100 ) / 12;
				var xpowervalue = decimalRate + 1;
				var ypowervalue = loantermItem.loanTerm;
				var powerrate_value = Math.pow( xpowervalue, ypowervalue ) - 1;
				var monthlyPayment = ( decimalRate + ( decimalRate / powerrate_value ) ) * requestedLoanAmount;
				monthlyPayment = Math.round( parseFloat( monthlyPayment.toFixed( 2 ) ) );
				loantermItem.monthpayment = monthlyPayment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				outputArray.push( loantermItem );
			} );
			outputArray = _.sortBy( outputArray, ['loanTerm'] );
			reqRes.code = 200;
			reqRes.loanDetails = outputArray;
		}
	} );
}

function getOffers( screentracking, offersOnly = false, forceDownPayment = 0, forceProcedureCost = 0 ) {
	const Promise = require( "bluebird" );
	const practiceId = screentracking.practicemanagement;
	const periodsPerYear = 12;
	const offers = [];
	let tradeDebt;
	let preDTI;

	const userId = ( screentracking.user.id || screentracking.user );
	const transunionId = screentracking.transunion ? ( screentracking.transunion.id || screentracking.transunion ) : null;

	return Transunions.findOne( { id: transunionId } )
	.then( ( transunion ) => {
		if( transunion ) {
			return transunion.getTradeDebt( screentracking.residenceType, screentracking.housingExpense );
		} else {
			/*
				We have no credit report!  We can't determine DTI without it. This code forces
				them into the worst Tier G by guaranteeing that their DTI is 50 or above.
			*/
			let payments = screentracking.housingExpense;
			if( payments < ( screentracking.incomeamount / 2 ) ) {
				payments = screentracking.incomeamount / 2;
			}
			const debt = {
				trades: [],
				monthlyPayments: payments
			 };

			return Screentracking.update(
				{ id: screentracking.id },
				{
					lockCreditTier: "G",
					lastlevel: 2,
					deniedmessage: "Forced to tier G and > 50% DTI because no credit report is available"
				}
			)
			.then( () => {
				return debt;
			} );
		}
	} )
	.then( (tradeDebt) => {
		sails.log.verbose( "getOffers; preDTI tradeDebt.monthlyPayments:", tradeDebt.monthlyPayments );
		sails.log.verbose( "getOffers; preDTI screentracking.incomeamount:", screentracking.incomeamount );
		const updateScreen = {
			preDTIMonthlyAmount: tradeDebt.monthlyPayments,
			preDTIPercentValue: parseFloat( ( ( tradeDebt.monthlyPayments / parseFloat( screentracking.incomeamount ) ) * 100 ).toFixed( 1 ) )
		};
		// sails.log.verbose( "updateScreen:", screentracking.id, updateScreen );
		preDTI = updateScreen.preDTIPercentValue;
		return Screentracking.update( { id: screentracking.id }, updateScreen )
		.then( ( updated ) => {
			screentracking = updated[ 0 ];
			return tradeDebt;
		} );
	} )
	.then( ( tradeDebt ) => {
		return LoanSettings.find( { practicemanagement: practiceId, loanactivestatus: 1 } )
		.then( ( loanSettings ) => {
			// sails.log.verbose( "Loansettings:", loansettings );
			if( loanSettings.length == 0 ) {
				sails.log.error( "getOffers; LoanSettings not found for practiceId:", practiceId );
				return { code: 400, message: "LoanSettings not found" };
			}

			const offerTerms = [];
			_.forEach( loanSettings, ( loanSetting ) => {
				offerTerms.push( { term: loanSetting.loanterm, validOffer: true, creditTiers: loanSetting.creditTiers } );
			} );
			// sails.log.verbose( "offerTerms:", offerTerms );

			const creditTierCriteria = { practicemanagement: practiceId };
			if( screentracking.lockCreditTier ) {
				creditTierCriteria.creditTier = screentracking.lockCreditTier;
			} else {
				creditTierCriteria.minCreditScore = { $lte: screentracking.creditscore };
				creditTierCriteria.maxCreditScore = { $gte: screentracking.creditscore };
			}
			return LoanCreditTier.findOne( creditTierCriteria )
			.then( ( loanCreditTier ) => {
				if( loanCreditTier == undefined ) {
					sails.log.error( "getOffers; LoanCreditTier not found by:", creditTierCriteria );
					return { code : 400, message: "Loan credit tier not found" };
				};
				if( forceDownPayment !== 0 ) {
					loanCreditTier.downPayment = MathExt.float( forceDownPayment );
					loanCreditTier.financedAmount = MathExt.float( loanCreditTier.loanAmount - loanCreditTier.downPayment );
					sails.log.verbose( "getOffers; forceDownPayment:", loanCreditTier.downPayment, "financedAmount:", loanCreditTier.financedAmount );
				}
				if( forceProcedureCost !== 0 ) {
					loanCreditTier.loanAmount = MathExt.float( forceProcedureCost );
					loanCreditTier.financedAmount = MathExt.float( loanCreditTier.loanAmount - loanCreditTier.downPayment );
					sails.log.verbose( "getOffers; forceProcedureCost:", loanCreditTier.downPayment, "financedAmount:", loanCreditTier.financedAmount );
				}
				if( loanCreditTier.financedAmount <= 1 ) {
					sails.log.error( "getOffers; Invalid loan parameters" );
					return { code : 400, message: "Invalid loan parameters" };
				}

				const ratePromises = [];
				_.forEach( offerTerms, ( offerTerm ) => {
					offerTerm.creditTier = loanCreditTier.creditTier;
					offerTerm.downPayment = loanCreditTier.downPayment;
					offerTerm.loanAmount = loanCreditTier.loanAmount;
					offerTerm.financedAmount = loanCreditTier.financedAmount;
					offerTerm.fundingRate = loanCreditTier.fundingRate;
					ratePromises.push(
						getTermOfferInfo( practiceId, offerTerm, preDTI, forceDownPayment, forceProcedureCost )
						.then( ( offerInfo ) => {
							// sails.log.verbose( "getOffers.getTermOfferInfo[1]; offerInfo:", offerInfo );
							if( ! offerInfo.validOffer ) return;
							offerInfo.payment = parseFloat( Math.abs( parseFloat( MathExt.pmt( ( offerInfo.interestRate / 100 ) / periodsPerYear, offerInfo.term, offerInfo.financedAmount ) ) ).toFixed( 2 ) );
							sails.log.verbose( `getOffers.getTermOfferInfo[1]; ${offerInfo.term} @ ${offerInfo.interestRate}%  payment: ${offerInfo.payment}` );
							offerInfo.postDTIMonthlyPayments = parseFloat( ( tradeDebt.monthlyPayments + offerInfo.payment ).toFixed( 2 ) );
							sails.log.verbose( `getOffers.getTermOfferInfo[1]; postDTIMonthlyPayments (${offerInfo.term}): ${offerInfo.postDTIMonthlyPayments}` );
							offerInfo.postDTI = parseFloat( ( ( offerInfo.postDTIMonthlyPayments / parseFloat( screentracking.incomeamount ) ) * 100 ).toFixed( 1 ) );
							sails.log.verbose( `getOffers.getTermOfferInfo[1]; postDTI (${offerInfo.term}): ${offerInfo.postDTI} / ${offerInfo.maximumDTI}` );
							if( offerInfo.postDTI > offerInfo.maximumDTI ) {
								return getTermOfferInfo( practiceId, offerTerm, offerInfo.postDTI, forceDownPayment, forceProcedureCost )
								.then( ( offerInfo ) => {
									// sails.log.verbose( "getOffers.getTermOfferInfo[2]; offerInfo:", offerInfo );
									if( ! offerInfo.validOffer ) return;
									offerInfo.payment = parseFloat( Math.abs( parseFloat( MathExt.pmt( ( offerInfo.interestRate / 100 ) / periodsPerYear, offerInfo.term, offerInfo.financedAmount ) ) ).toFixed( 2 ) );
									sails.log.verbose( `getOffers.getTermOfferInfo[2]; ${offerInfo.term} @ ${offerInfo.interestRate}%  payment: ${offerInfo.payment}` );
									offerInfo.postDTIMonthlyPayments = parseFloat( ( tradeDebt.monthlyPayments + offerInfo.payment ).toFixed( 2 ) );
									sails.log.verbose( `getOffers.getTermOfferInfo[2]; postDTIMonthlyPayments (${offerInfo.term}): ${offerInfo.postDTIMonthlyPayments}` );
									offerInfo.postDTI = parseFloat( ( ( offerInfo.postDTIMonthlyPayments / parseFloat( screentracking.incomeamount ) ) * 100 ).toFixed( 1 ) );
									sails.log.verbose( `getOffers.getTermOfferInfo[2]; postDTI (${offerInfo.term}): ${offerInfo.postDTI} / ${offerInfo.maximumDTI}` );
									return offerInfo;
								} );
							}
							return offerInfo;
						} )
					);
				} );
				return Promise.all( ratePromises );
			} );
		} );
	} )
	.then( ( offersInfo ) => {
		if( ! Array.isArray( offersInfo ) ) {
			sails.log.error( "getOffers; offersInfo:", offersInfo );
			return;
		}
		_.forEach( offersInfo, ( offerInfo ) => {
			if( offerInfo == undefined ) return;
			const effectiveAPR = Screentracking.calculateApr( offerInfo.term, ( offerInfo.payment * -1 ), offerInfo.financedAmount, 0, 0, offerInfo.interestRate );
			const pmtSchedule = MathExt.makeAmortizationSchedule( offerInfo.financedAmount, offerInfo.payment, offerInfo.interestRate, offerInfo.term );
			offers.push( {
				term: offerInfo.term,
				validOffer: offerInfo.validOffer,
				paymentFrequency: "monthly",
				creditTier: offerInfo.creditTier,
				interestRate: offerInfo.interestRate,
				apr: parseFloat( ( MathExt.float( effectiveAPR, 5 ) * periodsPerYear * 100 ).toFixed( 1 ) ),
				requestedLoanAmount: offerInfo.loanAmount,
				financedAmount: offerInfo.financedAmount,
				financeCharge: pmtSchedule.financeCharge,
				downPayment: offerInfo.downPayment,
				fundingRate: offerInfo.fundingRate,
				monthlyPayment: pmtSchedule.payment,
				postDTIMonthlyAmount: offerInfo.postDTIMonthlyPayments,
				postDTIPercentValue: offerInfo.postDTI
			} );
		} );
		offers.sort( ( a, b ) => {
			if( a.term < b.term ) return -1;
			if( a.term == b.term ) return 0;
			return 1;
		} );
		if( ! offersOnly ) {
			return Screentracking.update( { id: screentracking.id }, { offers: offers } )
			.then( ( updated ) => {
				screentracking = updated[ 0 ];
			} );
		}
	} )
	.then( () => {
		sails.log.verbose( "getOffers; offers:", screentracking.id, offers );
		if( offersOnly ) {
			return offers;
		}
		return screentracking;
	} )
	.catch( ( err ) => {
		sails.log.error( "getOffers; catch:", err );
	} );

	function getTermOfferInfo( practiceId, offerTerm, mDTI, forceDownPayment, forceProcedureCost ) {
		const criteria = {
			practicemanagement: practiceId,
			creditTier: offerTerm.creditTier,
			minimumDTI: { $lte: mDTI },
			maximumDTI: { $gte: mDTI }
		};
		// sails.log.verbose( "getTermOfferInfo; Loaninterestrate.findOne[1] criteria:", criteria );
		return Loaninterestrate.findOne( criteria )
		.sort( "minimumDTI ASC" )
		.then( ( loanInterestRate ) => {
			// sails.log.verbose( "getTermOfferInfo; loanInterestRate:", loanInterestRate );
			if( loanInterestRate == undefined ) {
				criteria.creditTier = "G";
				return LoanCreditTier.findOne( { practicemanagement: practiceId, creditTier: criteria.creditTier } )
				.then( ( loanCreditTier ) => {
					offerTerm.creditTier = loanCreditTier.creditTier;
					offerTerm.validOffer = ( offerTerm.creditTiers.indexOf( loanCreditTier.creditTier ) >= 0 );
					if( ! offerTerm.validOffer ) return;
					if( forceDownPayment !== 0 ) {
						loanCreditTier.downPayment = MathExt.float( forceDownPayment );
						loanCreditTier.financedAmount = MathExt.float( loanCreditTier.loanAmount - loanCreditTier.downPayment );
						sails.log.verbose( "getTermOfferInfo; forceDownPayment:", loanCreditTier );
					}
					if( forceProcedureCost !== 0 ) {
						loanCreditTier.loanAmount = MathExt.float( forceProcedureCost );
						loanCreditTier.financedAmount = MathExt.float( loanCreditTier.loanAmount - loanCreditTier.downPayment );
						sails.log.verbose( "getTermOfferInfo; forceProcedureCost:", loanCreditTier.downPayment, "financedAmount:", loanCreditTier.financedAmount );
					}
					if( loanCreditTier.financedAmount <= 1 ) {
						sails.log.error( "getOffers.getTermOfferInfo; Invalid loan parameters" );
						offerTerm.validOffer = false;
						return;
					}
					// sails.log.verbose( "getTermOfferInfo; Loaninterestrate.findOne[2] criteria:", criteria );
					return Loaninterestrate.findOne( criteria )
					.then( ( loanInterestRate ) => {
						if( loanInterestRate == undefined ) {
							offerTerm.validOffer = false;
							return;
						}
						offerTerm.interestRate = loanInterestRate.interestRate;
						offerTerm.minimumDTI = loanInterestRate.minimumDTI;
						offerTerm.maximumDTI = loanInterestRate.maximumDTI;
						offerTerm.downPayment = loanCreditTier.downPayment;
						offerTerm.loanAmount = loanCreditTier.loanAmount;
						offerTerm.financedAmount = loanCreditTier.financedAmount;
						offerTerm.fundingRate = loanCreditTier.fundingRate;
					} );
				} );
			}
			offerTerm.validOffer = ( offerTerm.creditTiers.indexOf( offerTerm.creditTier ) >= 0 );
			offerTerm.interestRate = loanInterestRate.interestRate;
			offerTerm.minimumDTI = loanInterestRate.minimumDTI;
			offerTerm.maximumDTI = loanInterestRate.maximumDTI;
		} )
		.then( () => {
			return offerTerm;
		} );
	}
}

async function createOffer( screentracking, offersOnly = false, forceDownPayment = 0, forceProcedureCost = 0, forceApr, forceTerm, forceTier ) {

	const offers = [];
	const periodsPerYear = 12;
	const financedAmount = forceProcedureCost - forceDownPayment;

	const payment = parseFloat( Math.abs( parseFloat( MathExt.pmt( ( forceApr / 100 ) / periodsPerYear, forceTerm, financedAmount ) ) ).toFixed( 2 ) );
	const pmtSchedule = MathExt.makeAmortizationSchedule( financedAmount, payment, forceApr, forceTerm );
	offers.push( {
		term: forceTerm,
		validOffer: true,
		paymentFrequency: "monthly",
		creditTier: forceTier,
		interestRate: forceApr,
		apr: forceApr,
		requestedLoanAmount: forceProcedureCost,
		financedAmount: financedAmount,
		financeCharge: pmtSchedule.financeCharge,
		monthlyPayment: payment,
		downPayment: forceDownPayment
	} );

	if( offersOnly ) {
		return offers;
	}

	const updated = await Screentracking.update( { id: screentracking.id }, { offers: offers } );
	return updated[ 0 ];
}

function discoverPayroll() {
	return Repullbankaccount.getRepullAccountList( screentracking, userId )
	.then( function( bankAccountList ) {
		// sails.log.info( "bankAccountList", bankAccountList );
		if( bankAccountList.status != 200 ) {
			return Promise.reject( new Error( "missing bank details" ) );
		}
		return Repullbankaccount.getMultiloanRepull( screentracking, userId, bankAccountList.data )
		.then( function( bankAccount ) {
			const userBankAccount = bankAccount.userBankAccount;
			let accountTransactions = [];
			_.forEach( userBankAccount, function( userbankData ) {
				userBankAccountId = userbankData.id;
				_.forEach( userbankData.transactions, function( transactions ) {
					accountTransactions = accountTransactions.concat( transactions );
				} );
			} );
			const payrollDetected = PayrollDetection.getInfo( accountTransactions, userId );
			const payrolldata = payrollDetected.payrolls;
			let totalpayroll = payrollDetected.annualIncome;
			sails.log.info( "discoverPayroll; totalpayroll:", totalpayroll );
			const updateScreen = {
				totalpayroll: totalpayroll,
				payrolldata: payrolldata,
			};
			return Screentracking.update( { id: screentracking.id }, updateScreen );
		} );
	} );
}


function getFundingTierFromPaymentManagementList(paymentManagementList) {
	const results = [];
	if(paymentManagementList && paymentManagementList.length > 0) {
		_.each(paymentManagementList,  (paymentManagement) => {
			paymentManagement["fundingTier"] = getFundingTierFromScreenTrackingObject(paymentManagement.screentracking);
			results.push(paymentManagement);
		});
	}
	return results;
}


function getFundingTierFromScreenTrackingList(screenTrackingList) {
	const results = [];
	if(screenTrackingList && screenTrackingList.length > 0) {
		_.each(screenTrackingList,  (screenTracking) => {
			screenTracking["fundingTier"] = getFundingTierFromScreenTrackingObject(screenTracking);
			results.push(screenTracking);
		});
	}
	return results;
}


function getFundingTierFromScreenTrackingObject( screenTrackingData) {
	let results = "";
	if(screenTrackingData) {
		if(screenTrackingData.offerdata && screenTrackingData.offerdata.length > 0 && screenTrackingData.offerdata[0]){
			const creditTier = screenTrackingData.offerdata[0].creditTier;
			const fundingRate = screenTrackingData.offerdata[0].fundingRate;

			if(!!creditTier){
				results = creditTier;
				if(fundingRate && parseInt(fundingRate) >=0){
					results += `_${fundingRate}`;
				}
			}
		}else{
			// For the display of funding tier as soon as it's calculated (before selecting an offer)
			if(screenTrackingData.offers && screenTrackingData.offers.length > 0){
				let indexWithLowestCreditTier = 0;
				let offerArray = screenTrackingData.offers;
				for(let i = 0; i < offerArray.length; i++){
					if(offerArray[i].creditTier > offerArray[indexWithLowestCreditTier].creditTier){	// If the current offer has a lower credit tier ('B' is greater than 'A' in string comparison)
						indexWithLowestCreditTier = i;
					}
				}

				const creditTier = screenTrackingData.offers[indexWithLowestCreditTier].creditTier;
				const fundingRate = screenTrackingData.offers[indexWithLowestCreditTier].fundingRate;

				if(!!creditTier){
					results = creditTier;
					if(fundingRate && parseInt(fundingRate) >=0){
						results += `_${fundingRate}`;
					}
				}
			}
		}

	}
	return results;
}

async function findLatestScreenTracking( userid ) {
	let screendata = await Screentracking.findOne( { user: userid, isincompleted: 0 } ).sort( "createdAt DESC" );
	if( !screendata ) {
		const answers = await Screentracking.find( { user: userid } ).sort( "createdAt DESC" );
		if( answers.length > 0 ) {
			screendata = answers[ 0 ];
		}
	}
	return screendata;
}
