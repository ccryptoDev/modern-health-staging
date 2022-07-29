/**
 * PracticereportController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
 
var request = require('request'),
  Q = require('q'),
  _ = require('lodash'),
  moment = require('moment');

var fs = require('fs');
var ObjectId = require('mongodb').ObjectID;

module.exports = {
  
  showPracticeReportList:showPracticeReportListAction,
  ajaxCreditReportList:ajaxCreditReportListAction
  
};

function showPracticeReportListAction(req,res){
	
	var errorval = '';
	var successval = '';
	var newLoanupdateSuccessMsg = '';
	var newLoanupdateMsg='';
	if(req.session.approveerror!=''){
		errorval =req.session.approveerror;
		req.session.approveerror = '';
	}
	if(req.session.successmsg!=''){
		successval =req.session.successmsg;
		req.session.successmsg = '';
	}
	
	
	
	PracticeManagement.find()
	.sort( { 'PracticeName': 1 })
 	.then(function (practiceData){
		sails.log.info("practiceData:",practiceData);
		var responsedata = {
			practiceData:practiceData,
		  	approveerror:errorval,
		  	approvesuccess:successval
		}					
		res.view("admin/practice/practiceReportList", responsedata);
	});
		
	
}

function ajaxCreditReportListAction(req,res){
	
	
 	var startDate = moment().tz("America/los_angeles").format('YYYY-MM-DD');
	var colS = "";
	var totalrecords =0;
	var creditReportData = [];
	var matchcriteria={};
	var whereConditionAnd =new Array();
	var whereConditionOr = new Array();
	
	if(req.query.sSortDir_0=='desc')
	{
		sorttype=-1;
	}
	else
	{
		sorttype=1;
	}
	
 	
	if((req.param('start_date') != '') && (typeof(req.param('start_date')) != 'undefined'))
	{
		var scheduleStartDate = moment(req.param('start_date')).startOf('day')
	}
	if((req.param('end_date') != '') && (typeof(req.param('end_date')) != 'undefined'))
	{
		var scheduleEndDate = moment(req.param('end_date')).endOf('day')
	}
 	
	if(((req.param('start_date') != '') && (typeof(req.param('start_date')) != 'undefined')) && ((req.param('end_date') != '') && (typeof(req.param('end_date')) != 'undefined')) )
	{
		whereConditionAnd.push({ createdAt: {"$gte": new Date(scheduleStartDate)} });
		whereConditionAnd.push({ createdAt: {"$lte": new Date(scheduleEndDate)} });
	}
	else if((req.param('start_date') != '') && (typeof(req.param('start_date')) != 'undefined'))
	{
		whereConditionAnd.push({ createdAt: {"$gte": new Date(scheduleStartDate)} });
	}
	else if((req.param('end_date') != '') && (typeof(req.param('end_date')) != 'undefined'))
	{
		whereConditionAnd.push({ createdAt: {"$lte": new Date(scheduleEndDate)} });
	}
	
	//sails.log.info("whereConditionAnd::",whereConditionAnd);
	//sails.log.info("whereConditionAnd Length::",whereConditionAnd.length);
	
	
	switch(req.query.iSortCol_0){
		case '0':  var sorttypevalue = { '_id': sorttype }; break;
		case '1':  var sorttypevalue = { 'paymentdata.loanReference': sorttype }; break;
		case '2':  var sorttypevalue = { 'userdata.userReference': sorttype }; break;
		case '4':  var sorttypevalue = { 'orderId': sorttype }; break;
		case '5':  var sorttypevalue = { 'paymentamount': sorttype }; break;
		case '6':  var sorttypevalue = { 'creditrunstatus': sorttype }; break;
		case '7':  var sorttypevalue = { 'outstandingprincipal': sorttype }; break;
		case '8':  var sorttypevalue = { 'comissionamount': sorttype }; break;
		case '9':  var sorttypevalue = { 'paybackAmount': sorttype }; break;
		case '10':  var sorttypevalue = { 'creditorderID': sorttype }; break;
		case '11':  var sorttypevalue = { 'creditrunAmount': sorttype }; break;
		case '12':  var sorttypevalue = { 'creditpaymentstatus': sorttype }; break;
		case '13':  var sorttypevalue = { 'createdAt': sorttype }; break;
		default: break;
	};
	
	if(req.query.sSearch)
	{
		whereConditionOr.push({"paymentdata.loanReference":  {'$regex': req.query.sSearch ,$options:'i'}});
		whereConditionOr.push({"userdata.userReference":  {'$regex': req.query.sSearch ,$options:'i'}});
		whereConditionOr.push({"orderId":  {'$regex': req.query.sSearch ,$options:'i'}});
		whereConditionOr.push({"paymentamount":  {'$regex': req.query.sSearch ,$options:'i'}});
		whereConditionOr.push({"creditrunstatus":  {'$regex': req.query.sSearch ,$options:'i'}});
		whereConditionOr.push({"comissionamount":  {'$regex': req.query.sSearch ,$options:'i'}});
		whereConditionOr.push({"paybackAmount":  {'$regex': req.query.sSearch ,$options:'i'}});
		whereConditionOr.push({"creditorderID":  {'$regex': req.query.sSearch ,$options:'i'}});
		whereConditionOr.push({"creditrunAmount":  {'$regex': req.query.sSearch ,$options:'i'}});
		whereConditionOr.push({"creditpaymentstatus":  {'$regex': req.query.sSearch ,$options:'i'}});
		
		if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID!='' && req.session.adminpracticeID!=null)
		{
			matchcriteria = {
				practicemanagement: new ObjectId(req.session.adminpracticeID),
				$or: whereConditionOr
			}
		}
		else
		{
			if ("undefined" !== typeof req.param('practiceID') && req.param('practiceID')!='' && req.param('practiceID')!=null)
			{
 				if(whereConditionAnd.length>0)
				{
					matchcriteria = {
						practicemanagement: new ObjectId(req.param('practiceID')),
						$and: whereConditionAnd,
						$or: whereConditionOr
					}
				}
				else
				{
					matchcriteria = {
						practicemanagement: new ObjectId(req.param('practiceID')),
						$or: whereConditionOr
					}
				}
			}
			else
			{
				matchcriteria = {
					$or: whereConditionOr
				}
			}
		}
	}
	else
	{		
		if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID!='' && req.session.adminpracticeID!=null)
		{
			if(whereConditionAnd.length>0)
			{
				matchcriteria = {
					practicemanagement: new ObjectId(req.session.adminpracticeID),
					$and: whereConditionAnd
				}
			}
			else
			{
				matchcriteria = {
					practicemanagement: new ObjectId(req.session.adminpracticeID)
				}
			}
		}
		else
		{
			if ("undefined" !== typeof req.param('practiceID') && req.param('practiceID')!='' && req.param('practiceID')!=null )
			{
				if(whereConditionAnd.length>0)
				{
					matchcriteria = {
						practicemanagement: new ObjectId(req.param('practiceID')),
						$and: whereConditionAnd
					}
				}
				else
				{
					matchcriteria = {
						practicemanagement: new ObjectId(req.param('practiceID'))
					}
				}
			}
			else if(whereConditionAnd.length>0)
			{
				matchcriteria = {
 					$and: whereConditionAnd
				}
			}
			else
			{
				matchcriteria = {
					apiType : "Actum"
				}
			}
		}
	}
	//sails.log.info("whereConditionAnd", whereConditionAnd);
	//sails.log.info("matchcriteria", matchcriteria);
	Paymentcomissionhistory.native(function(err, collection) {
		  collection.aggregate( 
		  [
			{
				$lookup: {
					from: "user",
					localField: "user",
					foreignField: "_id",
					as: "userdata"
				}
			},
			{
				$unwind: "$userdata" 
			},
			{
				$lookup: {
					from: "paymentmanagement",
					localField: "paymentmanagement",
					foreignField: "_id",
					as: "paymentdata"
				}
			},
			{
				$match: matchcriteria
			}, 
			{
				$count: "paymentcomissioncount"
			}
		  ],												  
		  function(err,result) {
			  			
				if (err) 
				{ 
					return res.serverError(err);
				}	
				
				iDisplayLengthvalue = parseInt(req.query.iDisplayLength);
				skiprecord = parseInt(req.query.iDisplayStart);
								
				if (typeof result !== 'undefined' && result.length > 0) 
				{
					totalrecords = result[0].paymentcomissioncount;
					
					Paymentcomissionhistory.native(function(err, collection) {
						  collection.aggregate( 
						  [
							{
								$lookup: {
									from: "user",
									localField: "user",
									foreignField: "_id",
									as: "userdata"
								}
							},
							{
								$unwind: "$userdata" 
							},
							{
								$lookup: {
									from: "paymentmanagement",
									localField: "paymentmanagement",
									foreignField: "_id",
									as: "paymentdata"
								}
							},
							{
								$match: matchcriteria
							}, 
							{ 
								$sort : sorttypevalue
							},							 
							{ 
								$skip : skiprecord 
							},
							{ 
								$limit : iDisplayLengthvalue
							},
						  ],												  
						  function(err,commisionDetails) {
										
							  if (err) 
							  { 
									return res.serverError(err);
							  }
								
							  if(commisionDetails.length>0)
							  {
									  
									 PracticeManagement.find()
									 .then(function (practiceData){
										
											var loopid;
											commisionDetails.forEach(function(commisionData,loopvalue){
																			  
												var systemUniqueKeyURL;
												var systemUserUniqueKeyURL;
												var practiceID;
												var practicename='--';
												var payloanReference='--';
												var userReference='--';
												var debitStatus='--';
												var creditStatus='--';
												var creditorderID='--';
												var creditAmount=0;
										
												loopid = loopvalue+skiprecord+1;
												var userinfo = commisionData.userdata; 
										        var paymentdetails = commisionData.paymentdata;
												//commisionData.createdAt = moment(commisionData.createdAt).tz("america/los_angeles").format('MM-DD-YYYY hh:mm:ss');
												//commisionData.createdAt = moment(commisionData.createdAt).tz("america/los_angeles").format('LLL');
												commisionData.createdAt = moment(commisionData.createdAt).format('MM-DD-YYYY hh:mm:ss a');
												
												if ("undefined" !== typeof req.session.adminpracticeName && req.session.adminpracticeName!='' && req.session.adminpracticeName!=null)
												{
													practicename=req.session.adminpracticeName;
												}
												else
												{
													if ("undefined" !== typeof commisionData.practicemanagement && commisionData.practicemanagement!='' && commisionData.practicemanagement!=null)
													{
														practiceID=commisionData.practicemanagement;
														var filteredPractice = _.filter(practiceData, function(practiceObj) {
														  if(practiceObj.id == practiceID)
														  {
															  return practiceObj;
														  }
														});
														
														if (filteredPractice.length > 0){
															practicename = filteredPractice[0].PracticeName;
														}
													}
												}
												
												if ("undefined" !== typeof userinfo.userReference && userinfo.userReference!='' && userinfo.userReference!=null)
												{
													userReference= userinfo.userReference;
													systemUserUniqueKeyURL = 'viewUserDetails/'+userinfo._id;	
													payuserLink ='<a href=\''+systemUserUniqueKeyURL+'\'>'+userinfo.userReference+'</a>';
												}
												
												if(paymentdetails.length>0)
												{
													var paydata = paymentdetails[0];
													if(paydata.loanReference!='' && paydata.loanReference!=null && "undefined" !== typeof paydata.loanReference)
													{
														systemUniqueKeyURL = 'getAchUserDetails/'+paydata._id;
														payloanReference='<a href=\''+systemUniqueKeyURL+'\'>'+paydata.loanReference+'</a>';
													}
												}
												
												if ("undefined" === typeof commisionData.orderId || commisionData.orderId=='' || commisionData.orderId==null)
												{
													commisionData.orderId ='--';
												}
												
												if ("undefined" === typeof commisionData.paymentamount || commisionData.paymentamount=='' || commisionData.paymentamount==null)
												{
													commisionData.paymentamount ='--';
												}
												else
												{
													commisionData.paymentamount = parseFloat(commisionData.paymentamount).toFixed(2);	
												}
												
												if ("undefined"=== typeof commisionData.comissionamount || commisionData.comissionamount=='' || commisionData.comissionamount==null)
												{
													commisionData.comissionamount ='--';
												}
												else
												{
													commisionData.comissionamount = parseFloat(commisionData.comissionamount).toFixed(2);	
												}
												
												if ("undefined"=== typeof commisionData.outstandingprincipal || commisionData.outstandingprincipal=='' || commisionData.outstandingprincipal==null)
												{
													commisionData.outstandingprincipal ='--';
												}
												else
												{
													commisionData.outstandingprincipal = parseFloat(commisionData.outstandingprincipal).toFixed(2);	
												}
												
												if ("undefined"=== typeof commisionData.paybackAmount || commisionData.paybackAmount=='' || commisionData.paybackAmount==null)
												{
													commisionData.paybackAmount ='--';
												}
												else
												{
													commisionData.paybackAmount = parseFloat(commisionData.paybackAmount).toFixed(2);	
												}										
												
												
												if(commisionData.paymentstatus==1 || commisionData.paymentstatus==2)
												{
													debitStatus='Settled';
												}
												else if(commisionData.paymentstatus==3)
												{
													debitStatus='Failed';
												}
												else
												{
													debitStatus='Pending';
												}
												
												if(commisionData.creditorderID)
												{
													if ("undefined" !== typeof commisionData.creditorderID && commisionData.creditorderID!='' && commisionData.creditorderID!=null)
													{
														creditorderID =commisionData.creditorderID;
													}
													
													/*if ("undefined" !== typeof commisionData.creditpaymentstatus && commisionData.creditpaymentstatus!='' && commisionData.creditpaymentstatus!=null)
													{*/
														if(commisionData.creditpaymentstatus==1)
														{
															creditStatus ='Settled';
														}
														else if(commisionData.creditpaymentstatus==2)
														{
															creditStatus='Failed';
														}
														//else if(commisionData.paymentstatus==2)
														else
														{
															creditStatus='Pending';
														}
													/*}*/
												}
												
												if(commisionData.creditrunAmount)
												{
													if ("undefined" !== typeof commisionData.creditrunAmount && commisionData.creditrunAmount!='' && commisionData.creditrunAmount!=null)
													{
														creditAmount =commisionData.creditrunAmount;
													}
												}
												
												
												creditReportData.push({ 
													  loopid:loopid, 
													  loanReference:payloanReference,
													  userReference: payuserLink,
													  PracticeName: practicename,													  											  
													  debitTransactionId:commisionData.orderId,
													  debitAmount:commisionData.paymentamount,
													  debitStatus:debitStatus,
													  commissionAmount:commisionData.comissionamount,
													  outstandingprincipal:commisionData.outstandingprincipal,
													  payBackAmount:commisionData.paybackAmount,
													  creditTransactionId:creditorderID,
													  creditAmount:creditAmount,
													  creditStatus:creditStatus,
													  createdAt: commisionData.createdAt
												});		
											});
											
											var json = {
												sEcho:req.query.sEcho,
												iTotalRecords: totalrecords,
												iTotalDisplayRecords: totalrecords,
												aaData: creditReportData
											};
											res.contentType('application/json');
											res.json(json);
									 });
							  }
							  else
							  {
								   var json = {
										sEcho:req.query.sEcho,
										iTotalRecords: totalrecords,
										iTotalDisplayRecords: totalrecords,
										aaData: creditReportData
									};
									res.contentType('application/json');
									res.json(json); 
							  }	
						 });
					});		
				}
				else
				{
					var json = {
					sEcho:req.query.sEcho,
						iTotalRecords: totalrecords,
						iTotalDisplayRecords: totalrecords,
						aaData: creditReportData
					};
					res.contentType('application/json');
					res.json(json); 
				}
		 });
	});	
}