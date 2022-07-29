/**
 * BorrowerController
 *
 * @description :: Server-side logic for managing Borrowers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';

var passport = require('passport');
var bcrypt = require("bcrypt");
var moment =require('moment');
var  _ = require('lodash');
var in_array = require('in_array');  

module.exports = {
	dashboard: dashboardAction,
	createnewapplication: createnewapplicationAction,
	getApploanDetails: getApploanDetailsAction,
	updatenewapplication: updatenewapplicationAction,
	borrowerlogin:borrowerloginAction
};

function dashboardAction(req,res){
	
	var userid = req.session.userId;
	if(userid)
	{
		Screentracking
		.checktodolistcount(userid)
		.then(function(todocount) {	
				
			//sails.log.info("Dashboard todocount:",todocount);
			
			User.getBorrowerDashboardDetails(userid)
			.then(function(responseDetails) {
					
					//sails.log.info("Dashboard responseDetails:",responseDetails);
					
					if(responseDetails.status==200)
					{
					    req.session.incompleteCount = responseDetails.incompleteCount;
						//req.session.todocount = responseDetails.todocount;
						
						if ("undefined" !== typeof responseDetails.incompleteredirectUrl && responseDetails.incompleteredirectUrl!='' && responseDetails.incompleteredirectUrl!=null)
						{
							req.session.incompleteredirectUrl = responseDetails.incompleteredirectUrl;
						}

						res.view("frontend/home/dashboard",responseDetails);
					}
					else
					{
						return res.redirect("/userlogout");
					}
			})
			.catch(function (err) {
				 sails.log.error('BorrowerController#dashboardAction :: err', err);
				 return res.handleError(err);
			});
		})
		.catch(function (err) {
			sails.log.error('BorrowerController#dashboardAction :: err', err);
			return res.handleError(err);
		});
	}
	else
	{
		return res.redirect("/userlogout");
	}
}

function createnewapplicationAction(req,res){
	
	var userid = req.session.userId;
	if(userid)
	{
		var incompleteCount=0;
		if ("undefined" !== typeof req.session.incompleteCount && req.session.incompleteCount!='' && req.session.incompleteCount!=null)
		{
			incompleteCount = req.session.incompleteCount;
		}

		var usercriteria = {
            id:userid
		};
		
        User
        .findOne(usercriteria)
        .then(function (userData) {

			//clicktosave starts here
			var clicktoSave =0;
			var checkbox1=0;
			var checkbox3=0;
			var checkbox4=0;
			var checkbox5=0;
			var consentsChecked = userData.consentsChecked;

			if(userData.clicktosave){
				if (userData.clicktosave == 1) {
					clicktoSave = 1;

					if (in_array(120, consentsChecked)) {
						checkbox1 =1;
					}

					if (in_array(121, consentsChecked)) {
						checkbox3 =1;
					}

					if (in_array(122, consentsChecked)) {
						checkbox4 =1;
					}
					
					if (in_array(123, consentsChecked)) {
						checkbox5 =1;
					}
				}
			}

			

			sails.log.info('consentsChecked========',consentsChecked);
		
			if(parseInt(incompleteCount) >0 && clicktoSave==0 )
			{
				return res.redirect("/dashboard");
			}
			else
			{
				User.getBorrowerDashboardDetails(userid)
				.then(function(responseDetails) {
						
						if(responseDetails.status==200)
						{
							State
							.getExistingState()
							.then(function (states) {
								
								var appPracticeId= req.session.appPracticeId;
								
								PracticeManagement
								.findOne({ id: appPracticeId, isDeleted : false})
								.then(function (hospRes){
									var	errorMsg	=	'';
									if(req.session.applicationErrorMsg)
									{
										var	errorMsg					=	req.session.applicationErrorMsg;
										req.session.applicationErrorMsg	=	'';
									}

									var responeData ={
										states:states,
										userData:responseDetails.user,
										loanData: responseDetails.loanData,
										screenData: responseDetails.screenData,
										loanCount: responseDetails.loanCount,
										incompleteCount: responseDetails.incompleteCount,
										hospRes:hospRes,
										errorMsg:errorMsg,
										clicktoSave:clicktoSave,
										consentsChecked: consentsChecked,
										checkbox1:checkbox1,
										checkbox3:checkbox3,
										checkbox4:checkbox4,
										checkbox5:checkbox5
									}
									res.view("frontend/borrowerportal/createnewapplication",responeData);
								})
								.catch(function (err) {
									sails.log.error('BorrowerController#createnewapplicationAction :: err', err);
									return res.handleError(err);
								});
							})
							.catch(function (err) {
								sails.log.error('BorrowerController#createnewapplicationAction :: err', err);
								return res.handleError(err);
							});
						}
						else
						{
							return res.redirect("/userlogout");
						}
				})
				.catch(function (err) {
					sails.log.error('BorrowerController#createnewapplicationAction :: err', err);
					return res.handleError(err);
				});
			}
		});	
	}
	else
	{
		return res.redirect("/userlogout");
	}
}

function getApploanDetailsAction(req,res){

	var appmenuName = req.param('appmenuName');
	var appID = req.param('appID');
	var loopID = req.param('loopID');
	var appType = req.param('appType');
	var userid = req.session.userId;
	
	var divContentId = appID+'_'+loopID+'_'+appType;
	
	/*sails.log.info("appType:",appType);
	sails.log.info("userid:",userid);
	sails.log.info("divContentId:",divContentId);*/
	
	var errorjson = {
		status: 400,
		message:'Unable to fetch details'
	};
	
	if(userid)
	{
		if(appType=='loan')
		{
			var loanCriteria = { 
			  user: userid,
			  id:appID
			};
							
			PaymentManagement
			.findOne(loanCriteria)
			.populate('user')
			.populate('screentracking')
			.then(function(paymentmanagementdata) {
				 if(paymentmanagementdata)
				 {
					 if(appmenuName=='todolisttab')
					 {
						var user = paymentmanagementdata.user;
						var userloancount=0;
						
						var screentrackingdetails = paymentmanagementdata.screentracking;
						var isAccountLinked=0;
						
						if(user.isBankAdded == true)
						{
							isAccountLinked = 1;	
						}
						else if(screentrackingdetails.isAccountLinked)
						{
							isAccountLinked = screentrackingdetails.isAccountLinked;
						}
						else
						{
							if(screentrackingdetails.isoffercompleted==1 || screentrackingdetails.ispromissorycompleted==1)
							{
								isAccountLinked = 1;
							}	
						}
						
						
						
						var reapplyoptions = { 
						  user: userid,
						  $or : [ { status : 'OPENED' }, { status : 'PAID OFF' }, { status : 'CLOSED' } ],
						  achstatus : [0,1,3,4]
						  //achstatus : [0,1,2,3,4]
						};
						
						PaymentManagement.count(reapplyoptions).exec(function countCB(error, userloancount) {
						
							var responseData={
								user:user,
								screentrackingdetails: screentrackingdetails,
								userloancount:userloancount,
								isAccountLinked: isAccountLinked
							}
							var templateName = "frontend/borrowerportal/todolisttabDetails";
							
							res.render( templateName , responseData, function(err, listdata){
									var json = {
										status: 200,
										message:'Todolist details',
										listdata: listdata
									};
									res.contentType('application/json');
									res.json(json);
							});	
						});	
					 }
					 else if(appmenuName=='agreementstab')
					 {
						 if(paymentmanagementdata.achstatus==2)
						 {
							 var cosnentCriteria= {
								 paymentManagement: paymentmanagementdata.id,
								 //loanupdated:1
							 };
						 }
						 else
						 {
							  var cosnentCriteria= {
								 paymentManagement: paymentmanagementdata.id,
								 loanupdated:1
							 };
						 }
						 UserConsent
						.find(cosnentCriteria)
						 .then(function(pdfdocument){
									   
							if(pdfdocument){	
								_.each(pdfdocument,function(documemts){	
									if(documemts.agreementpath){
												documemts.agreementpath = Utils.getS3Url(documemts.agreementpath);
										}
								  })
							}						
							
							var responseData={
								pdfdocument:pdfdocument
							}
							var templateName = "frontend/borrowerportal/agreementtabDetails";
							res.render(templateName , responseData, function(err, listdata){
								
								var json = {
									status: 200,
									message:'Loan offer agreement details',
									listdata: listdata
								};
								res.contentType('application/json');
								res.json(json);
							});	
						})
						.catch(function (err) {
							sails.log.error('BorrowerController#getApploanDetailsAction :: err', err);
							res.contentType('application/json');
							res.json(errorjson);
						});
					}
					else if(appmenuName=='appDetailstab' || appmenuName=='paymentscheduletab')
					{
						
						var screentrackingdetails = paymentmanagementdata.screentracking;
						
						var lastactivelevel = 1;
						var creditscore = 0;
						if(screentrackingdetails) {
							creditscore = screentrackingdetails.creditscore;
							lastactivelevel = screentrackingdetails.lastlevel;
						}
													
						var todaysDate = moment().startOf('day').toDate().getTime();
						var nextpaymentDate='--';
						var amount;
						var setcurrent=0;					
						var payOffAmount;
						var approvedAmount;
						var pendingSchedule=[];
						var paidSchedule=[];
						var paydata = [];
									  
						_.forEach(paymentmanagementdata.paymentSchedule, function(payDetails) 
						{
							 amount = parseFloat(payDetails.amount).toFixed(2);
							  if(amount > 0){
								 payDetails.amount = amount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
								 payDetails.amount = '$'+payDetails.amount;
							  }
							  var scheduleDate = moment(payDetails.date).add(15, 'days').startOf('day').toDate().getTime();
							
							  if(payDetails.status == "PAID OFF" ) {
								  paidSchedule.push(payDetails);
							  }
							  else {
								  pendingSchedule.push(payDetails);
							  }
							  
							  if(payDetails.chargeoff==1) {
								 payDetails.status = "Charge Off"; 
							  }
							  else 
							  {
								  if( scheduleDate < todaysDate && payDetails.status=='OPENED') {
									  payDetails.status = "Late";
								  }
								  else if(payDetails.status == "OPENED" && setcurrent==0) {
									payDetails.status = "Current";
									nextpaymentDate=moment(payDetails.date).format('LL');
									setcurrent= setcurrent+1;
								  }
								  else if(payDetails.status == "PAID OFF" ) {
									payDetails.status = "Paid Off";  
								  }
								  else if(payDetails.status == "CLOSED" ) {
									  
									payDetails.status = "Closed";  
								  }
								  else {
									payDetails.status = "Schedule"; 
								  }  
							  }
										  
							  payDetails.date = moment(payDetails.date).format('LL');
							  paydata.push(payDetails);
						});
						
						if(paymentmanagementdata.productname=='State License') {
							 var transactionStatus = paymentmanagementdata.transactionStatus;
						} else {
							 var transactionStatus = '';	
						}
						
						paymentmanagementdata.maturityDate= moment(paymentmanagementdata.maturityDate).format('LL');
						paymentmanagementdata.nextPaymentSchedule= moment(paymentmanagementdata.nextPaymentSchedule).format('LL');
						
						Makepayment
						.getFullpayment(paymentmanagementdata.id)
						.then(function(makePaymentForStory) {

							PracticeManagement.findOne( { id: paymentmanagementdata.screentracking.practicemanagement } )
							.then( ( practiceData ) => {
								var practicePhone = "";
								let practiceName = "";
								if( practiceData ) {
									if( practiceData.PhoneNo ) {
										practicePhone = formatPhoneNumber( practiceData.PhoneNo );
									}
									if( practiceData.PracticeName ) {
										practiceName = practiceData.PracticeName;
									}
								}

								var responseData={
									paymentmanagementdata:paymentmanagementdata,
									todocount:0,
									nextpaymentDate: nextpaymentDate,
									transactionStatus:transactionStatus,
									PaymentScheduleStatus: paymentmanagementdata.status,
									creditscore:creditscore,
									makePaymentForStory:makePaymentForStory,
									appType:appType,
									divContentId:divContentId,
									appmenuName: appmenuName,
									practicePhone: practicePhone,
									practiceName: practiceName
								};
								//sails.log.info("responseData:",responseData);
							
								if(appmenuName=='appDetailstab')
								{
									var templateName = "frontend/borrowerportal/apploantabDetails";
								}
								
								if(appmenuName=='paymentscheduletab')
								{
									var templateName ="frontend/borrowerportal/paymentscheduletabDetails";
								}
								
								res.render( templateName , responseData, function(err, listdata){
										var json = {
											status: 200,
											message:'Loan offer agreement details',
											listdata: listdata
										};
										res.contentType('application/json');
										res.json(json);
								});	
							})
							.catch(function (err) {
								sails.log.error( "PracticeManagement", err );
								res.contentType('application/json');
								res.json(errorjson);
							});
						})
						.catch(function (err) {
							res.contentType('application/json');
							res.json(errorjson);
						});
					}
					else if(appmenuName=='makepaymenttab')
					{
						var templateName = "frontend/borrowerportal/makepaymenttabDetails";
						var responseData={};
						res.render( templateName , responseData, function(err, listdata){
								var json = {
									status: 200,
									message:'Make Payment details',
									listdata: listdata
								};
								res.contentType('application/json');
								res.json(json);
						});	
					}
					else
					{
						res.contentType('application/json');
						res.json(errorjson);
					}
				 }
				 else
				 {
					res.contentType('application/json');
					res.json(errorjson);
				 }
			})
			.catch(function (err) {
				res.contentType('application/json');
				res.json(errorjson);
			});
		}
		else if(appType=='incomplete')
		{
			//-- Incomplete application
			
			var screenCriteria = { 
			  user: userid,
			  iscompleted:0
			};
			
			Screentracking
			.findOne(screenCriteria)
			.populate('user')
			.sort("createdAt DESC")
			.then(function(screentrackingdetails) {
						   
				if(screentrackingdetails)
				{
					var user = screentrackingdetails.user;
					
					var isAccountLinked=0;
					if(screentrackingdetails.isAccountLinked)
					{
						isAccountLinked = screentrackingdetails.isAccountLinked;
					}
					else
					{
						if(screentrackingdetails.isoffercompleted==1 || screentrackingdetails.ispromissorycompleted==1)
						{
							isAccountLinked = 1;
						}	
					}
					
					/*if(user.isBankAdded == true)
					{
						isAccountLinked = 1;	
					}*/
					
					if(appmenuName=='todolisttab')
					{
						var userloancount=0;
						
						var reapplyoptions = { 
						  user: userid,
						  $or : [ { status : 'OPENED' }, { status : 'PAID OFF' }, { status : 'CLOSED' } ],
						  achstatus : [0,1,3,4]
						};
						
						PaymentManagement.count(reapplyoptions).exec(function countCB(error, userloancount) {
						
							var responseData={
								user:user,
								screentrackingdetails: screentrackingdetails,
								userloancount:userloancount,
								isAccountLinked: isAccountLinked
							}
							var templateName = "frontend/borrowerportal/todolisttabDetails";
							
							res.render( templateName , responseData, function(err, listdata){
									var json = {
										status: 200,
										message:'Todolist details',
										listdata: listdata
									};
									res.contentType('application/json');
									res.json(json);
							});	
						});	
					}
					else if(appmenuName=='agreementstab')
					{
						 var cosnentCriteria= {
							 user: userid,
							 loanupdated:1,
							 paymentManagement:{"$exists" : false}
						 };
						 
						 UserConsent
						.find(cosnentCriteria)
						 .then(function(pdfdocument){
									   
							if(pdfdocument){	
								_.each(pdfdocument,function(documemts){	
									if(documemts.agreementpath){
												documemts.agreementpath = Utils.getS3Url(documemts.agreementpath);
										}
								  })
							}						
							
							var responseData={
								pdfdocument:pdfdocument
							}
							var templateName = "frontend/borrowerportal/agreementtabDetails";
							res.render(templateName , responseData, function(err, listdata){
								
								var json = {
									status: 200,
									message:'Loan offer agreement details',
									listdata: listdata
								};
								res.contentType('application/json');
								res.json(json);
							});	
						})
						.catch(function (err) {
							sails.log.error('BorrowerController#getApploanDetailsAction :: err', err);
							res.contentType('application/json');
							res.json(errorjson);
						});
					}
					else if(appmenuName=='appDetailstab' || appmenuName=='paymentscheduletab')
					{
						var screentracking = [];
						var lastactivelevel = 1;
						var creditscore	 =0;			
						if(screentrackingdetails) {
							creditscore = screentrackingdetails.creditscore;
							lastactivelevel = screentrackingdetails.lastlevel;
						}
						
						Screentracking
						.checktodolistcount(userid)
						.then(function(todocount) {
									   							
							var routeCriteria = { level: lastactivelevel };
							Infotable
							.findOne(routeCriteria)
							.then(function(routeldata){
								PracticeManagement.findOne( { id: screentrackingdetails.paymentmanagement } )
								.then( ( practiceData ) => {
									let practicePhone = "";
									let practiceName = "";
									if( practiceData ) {
										if( practiceData.PhoneNo ) {
											practicePhone = formatPhoneNumber( practiceData.PhoneNo );
										}
										if( practiceData.PracticeName ) {
											practiceName =  practiceData.PracticeName;
										}
									}

									var currentroute = routeldata.routename;
									screentracking.push(screentrackingdetails);
																		
									var responseData={
										screentrackingdetails: screentracking,
										user:user,
										todocount:todocount,
										creditscore:creditscore,
										currentroute: currentroute,
										appType:appType,
										divContentId:divContentId,
										appmenuName: appmenuName,
										practicePhone: practicePhone,
										practiceName: practiceName
									};
																	
									if(appmenuName=='appDetailstab')
									{
										var templateName = "frontend/borrowerportal/apploantabDetails";
									}
									
									if(appmenuName=='paymentscheduletab')
									{
										var templateName ="frontend/borrowerportal/paymentscheduletabDetails";
									}
									
									res.render( templateName , responseData, function(err, listdata){
											var json = {
												status: 200,
												message:'Loan offer agreement details',
												listdata: listdata
											};
											res.contentType('application/json');
											res.json(json);
									});	
								});
							})
							.catch(function (err) {
								res.contentType('application/json');
								res.json(errorjson);
							});	
						})
						.catch(function (err) {
							res.contentType('application/json');
							res.json(errorjson);
						});	
					}
					else if(appmenuName=='makepaymenttab')
					{
						var templateName = "frontend/borrowerportal/makepaymenttabDetails";
						var responseData={};
						res.render( templateName , responseData, function(err, listdata){
								var json = {
									status: 200,
									message:'Make Payment details',
									listdata: listdata
								};
								res.contentType('application/json');
								res.json(json);
						});	
					}
					else
					{
						res.contentType('application/json');
						res.json(errorjson);
					}
				}
				else
				{
					res.contentType('application/json');
					res.json(errorjson);
				}
			})
			.catch(function (err) {
				res.contentType('application/json');
				res.json(errorjson);
			});
		}
		else if(appType=='pastloantab')
		{
			var templateName = "frontend/borrowerportal/pastloantabDetails";
			var responseData={};
			res.render( templateName , responseData, function(err, listdata){
					var json = {
						status: 200,
						message:'Past loan details',
						listdata: listdata
					};
					res.contentType('application/json');
					res.json(json);
			});	
		}
		else
		{
			res.contentType('application/json');
			res.json(errorjson);
		}
	}
	else
	{
		res.contentType('application/json');
		res.json(errorjson);
	}
}
function updatenewapplicationAction(req,res)
{
	var userinformation = req.allParams();
	var userid 			= req.session.userId;
	
	User.findOne({ id: userid })
    .then(function (userinfo) {
 		var userTransData				=	userinfo;
  		userTransData.ssnNumber			=	req.param('ssnNumber');
 		userTransData.street			=	req.param('street');
		userTransData.zipCode			=	req.param('zipCode');
		userTransData.city				=	req.param('city');
		userTransData.state				=	req.param('state');
		userTransData.consentsChecked	=	req.param('TermsConditions');
		userTransData.dateofBirth	    =	req.param('vendorDateofBirth');
		userTransData.practicemanagement=	req.param('practicemanagement');
		
		
		//clicktosave starts here
		var clicktoSave =0;
		if(userinfo.clicktosave){
			if(userinfo.clicktosave==1){
				clicktoSave =1;
				userTransData.firstname=req.param('firstname');
				userTransData.lastname=req.param('lastname');
				userTransData.phoneNumber=req.param('phoneNumber');
			}
		}
   		
 		Transunion
		.callTransUnionApi(userTransData)
		.then(function (transUnionData) {
			sails.log.info('BorrowerController#updatenewapplicationAction', transUnionData);		
			if(transUnionData.code=='200')
			{
				if(clicktoSave ==1){
					var updateUserData={
						clicktosave:0,
						firstname:userTransData.firstname,
						lastname:userTransData.lastname,
						ssnNumber: userTransData.ssnNumber,
						ssn_number: userTransData.ssnNumber,						
                        state : userTransData.state,
                        street: userTransData.street,
                        city : userTransData.city,
                        zipCode : userTransData.zipCode,
                        dateofBirth : userTransData.dateofBirth,
						practicemanagement : userTransData.practicemanagement,						
						phoneNumber : userTransData.phoneNumber
					};
				}
				else{
					var updateUserData={clicktosave:0};
				}	
				User.update({id: userid}, updateUserData)
				.exec(function afterwards(err, updated){

					var transResponse	=	transUnionData.applicationDetails.code
					if(transResponse=='200')
					{
						Screentracking
						.findOne({user: userid})
						.sort("createdAt DESC")
						.then(function(screendata){
									
							//-- Update last level and last screen name (for new application from borrower portal
							//-- Note: last level need to be 3 when application registered from application wizard	
							//   Added for ticket no 2756 to find out the application type.
							// Added borrowerapplication = 1
							var updateData = {
								lastScreenName:'Application',
								lastlevel : 2,
								applicationType:"Borrower portal",
								borrowerapplication:1

							};
							Screentracking.update({id: screendata.id}, updateData)
							.exec(function afterwards(err, updated){
																							
																	
								var	applicationReference	=	screendata.applicationReference;
								var	screenid				=	screendata.id;
								var	creditscore				=	screendata.creditscore;	
								
								var acceptconsent			=	userTransData.consentsChecked;
								var	adverseConsent	=	'0';
								if(transUnionData.code==200)
								{
									if(transUnionData.transunionStatus!=200)
									{
										//Adverse consent document generation
										var	adverseConsent	=	'1';
										acceptconsent.push('201');
									}
								}
								else
								{
									//Adverse consent document generation
									var	adverseConsent	=	'1';
									acceptconsent.push('201');
								}
							
								var IPFromRequest =  req.headers['x-forwarded-for'] || req.connection.remoteAddress;
								var indexOfColon = IPFromRequest.lastIndexOf(':');
								var ip = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);
                                
                                if(screendata.filloutmanually == 1){
                                    
                                    var redirectpath ="/emailmyoffer/"+userid;
									return res.redirect(redirectpath);
                                }
								UserConsent
								.createAgreementPdf(applicationReference,ip,res,req,screenid,userinfo,acceptconsent)
								.then(function (agreementpdf) {	
												
									sails.log.info("agreementpdf:",agreementpdf);
									if(agreementpdf.code == 200 && adverseConsent == '0')
									{			
										var redirectpath ="/addbankaccount/"+userid;
										return res.redirect(redirectpath);
									}
									else
									{
										var consentCriteria = {
										user:userid,
										loanupdated:1,
										paymentManagement:{"$exists" : false}
										};
										UserConsent
										.find(consentCriteria)
										.sort("createdAt DESC")
										.then(function(userConsentAgreement) {
											sails.log.info("userConsentAgreement",userConsentAgreement);
											if(userConsentAgreement.length>0)
											{
												PaymentManagement.find({user:userid}).sort("createdAt DESC").then(function(paymentmanagementdata){	
													_.forEach(userConsentAgreement, function(consentagreement) {
														UserConsent.updateUserConsentAgreement(consentagreement.id,userDetail.id,paymentmanagementdata.id);				   
													});
													//var redirectpath ="/addbankaccount/"+userid;
													//return res.redirect(redirectpath);
													req.session.applicationErrorMsg	=	transUnionData.applicationDetails.message;
													return res.redirect("/createnewapplication");
												});
											}
										})
										.catch(function(err) {
											sails.log.error("Screentracking::updatedeclinedloan UserConsent error::", err);
											req.session.applicationErrorMsg	=	transUnionData.applicationDetails.message;
											return res.redirect("/createnewapplication");
										});
									}
								})
							});
						})
						.catch(function(err) {
							req.session.applicationErrorMsg	=	'Unable to fetch credit score details.';
							return res.redirect("/createnewapplication");			
						});
					}
					else
					{
						req.session.applicationErrorMsg	=	transUnionData.applicationDetails.message;
						return res.redirect("/createnewapplication");
					}
				});
  			}
		})
		.catch(function(err) {
			req.session.applicationErrorMsg	=	'Unable to fetch credit score details.';
			return res.redirect("/createnewapplication");			
		});
	});
}

/*function borrowerloginAction(req,res){
	
	 req.session.appPracticeId = '';
	 req.session.appPracticeName = '';
	 req.session.appPracticeSlug = '';
	 req.session.appPracticeStateCode = '';
	 req.session.appPracticeStateName ='';
	 
	res.view('frontend/borrowerportal/login');
	
}*/

function borrowerloginAction(req,res){
	var errorval = '';
	var successval = '';

	return new Promise( ( resolve, reject ) => {
		return req.session.regenerate( resolve );
	})
	.then( () => {
		res.view( 'frontend/borrowerportal/login', { error: errorval, successval: successval } );
	} );
}

function formatPhoneNumber( phoneNumberString ) {
  var cleaned = ( '' + phoneNumberString ).replace( /\D/g, '' )
  var match = cleaned.match( /^(\d{3})(\d{3})(\d{4})$/ )
  if ( match ) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3]
  }
  return null
}