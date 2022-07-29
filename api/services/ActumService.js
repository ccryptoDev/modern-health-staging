"use strict";

var request = require('request'),
  Q = require('q'),
  _ = require('lodash'),
  moment = require('moment');

var fs = require('fs');
var json2csv = require('json2csv');
//var momentBusiness = require('moment-business-days');
var config = sails.config;
var in_array = require('in_array');
var asyncLoop = require('node-async-loop');

module.exports = {
  createActumCreditFile: createActumCreditFile,
  processActumCreditPayment:processActumCreditPayment,
  processActumDebitPayment:processActumDebitPayment,
  checkActumPaymentStatus:checkActumPaymentStatus,
  getActumJsonOutput: getActumJsonOutput,
  pullActumRecurringDebit: pullActumRecurringDebit,
  getLenderCreditStatus: getLenderCreditStatus,
  fundPracticeCreditPayment:fundPracticeCreditPayment,
  processPracticeCreditPayment: processPracticeCreditPayment,
  getDoctorCreditStatus:getDoctorCreditStatus,
  getBatchCreditDetails: getBatchCreditDetails,
  fundPracticeBatchCreditPayment:fundPracticeBatchCreditPayment,
  getPracticeBatchCreditStatus: getPracticeBatchCreditStatus,
};

function createActumCreditFile(customerDetails,reqdata,resdata){

	return Q.promise(function(resolve, reject) {

		  //-- Customer Information
		  var custname = customerDetails.user.firstname+" "+customerDetails.user.lastname;
		  var custemail = customerDetails.user.email;
		  var custaddress1 = customerDetails.user.street;
		  var custcity = customerDetails.user.city;
		  var custstate = customerDetails.user.state;
		  var custzip = customerDetails.user.zipCode;
		  var custphone = customerDetails.user.phoneNumber;
		  var custssnDetail = customerDetails.user.ssn_number;

		  var custssn='';
		  var custlastFourssn=''; //-- Last four digit
		  if(custssnDetail)
		  {
			  custssn = custssnDetail.replace(/[^a-zA-Z0-9]/g, '');
			  custlastFourssn = custssn.substr(custssn.length - 4);
		  }
		  var birth_date = (typeof(customerDetails.user.dateofBirth) != "undefined") ? moment(customerDetails.user.dateofBirth).format("MMDDYYYY") : moment().format('MMDDYYYY');

		  //--Payment Information
		  var acct_name = customerDetails.account.accountName;
		  var chk_acct = customerDetails.account.accountNumber;
		  var chk_aba = customerDetails.account.routingNumber;
		  var currency='US'; //--default
		  var bank_acct_type='Checking' //-- C

		  //--Billing Information
		  var trans_type='credit';
		  var initial_amount =  customerDetails.payOffAmount? parseFloat(customerDetails.payOffAmount).toFixed(2): 0;
		  var billing_cycle ='One-Time'; //-- -1

		  var loanReference = customerDetails.loanReference;
		  var userReference = customerDetails.user.userReference;
		  var creditLenderCode = loanReference+'__'+userReference;

		 // var newLine= "\r\n";

		  //Header fields
		  var fields = ['LoanReference','UserReference','CustomerName','CustomerEmail','CustomerAddress1','CustomerCity','CustomerState','CustomerZipCode','CustomerPhone','CustomerSSN','CustomerLastFourSSN','CustomerBirthDate','AccountName','AccountNumber','AccountRoutingNumber','TransactionType','InitialAmount','BillingCycle','Currency','AccountBankType'];


		  //--File path
		  var actumcsvPath = sails.config.appPath+sails.config.actumConfig.csvFilePath;
		  var creditFileNameOnly = creditLenderCode+"_Credit_"+ moment().tz("America/New_York").format("YYYYMMDD")+"_"+moment().tz("America/New_York").format("hh_mm")+".csv";
		  var creditFilename = actumcsvPath + creditFileNameOnly;

		  //Dynamic Data
		  var csvfieldsData={
			  	   LoanReference:loanReference,
				   UserReference:userReference,
				   CustomerName:custname,
				   CustomerEmail:custemail,
				   CustomerAddress1:custaddress1,
				   CustomerCity:custcity,
				   CustomerState:custstate,
				   CustomerZipCode:custzip,
				   CustomerPhone:custphone,
				   CustomerSSN:custssn,
				   CustomerLastFourSSN:custlastFourssn,
				   CustomerBirthDate:birth_date,
				   AccountName:acct_name,
				   AccountNumber: chk_acct,
				   AccountRoutingNumber: chk_aba,
				   TransactionType:trans_type,
				   InitialAmount:initial_amount,
				   BillingCycle:billing_cycle,
				   Currency:currency,
				   AccountBankType: bank_acct_type
		  }

		  //sails.log.info("fields:",fields);
		  //sails.log.info("csvfieldsData:",csvfieldsData);

		  var creditToCsv = {
				data: csvfieldsData,
				fields: fields,
				hasCSVColumnTitle: true
		 };

		  //var creditCsv = json2csv(creditToCsv)+newLine;
		  var creditCsv = json2csv(creditToCsv);

		  //sails.log.info("creditCsv",creditCsv);

		  var achlogDescp = 'Process Credit payment for $'+initial_amount+' for loan reference: '+customerDetails.loanReference;
		  var achlogData={
						'user':customerDetails.user.id,
						'account':customerDetails.account.id,
						'paymentManagement':customerDetails.id,
						'loanID':customerDetails.loanReference,
						'methodtype':1,
						'methodname':achlogDescp,
						'achAmount':initial_amount,
						'apirequest':csvfieldsData,
						'actumcreditfilename': creditFileNameOnly,
						'apistatus':0
		}

		Actumhistory.registerActumhistory(achlogData)
	    .then(function (achhistoryData) {

			fs.writeFile(creditFilename, creditCsv , function (err) {
				if (err)
				{
					var responseMsg = 'Error On Credit File Writing';
					achhistoryData.apiresponsestatus=2;
					achhistoryData.apistatus=1;
					//achhistoryData.apiresponse=responseMsg;

					achhistoryData.save(function(err) {
						return resolve({code:400,responseMsg:responseMsg,creditfilepath:creditFileNameOnly});
					});
				}
				else
				{
					var responseMsg = 'Credit File Completed';
					achhistoryData.apiresponsestatus=1;
					achhistoryData.apistatus=1;
					//achhistoryData.apiresponse=responseMsg;

					achhistoryData.save(function(err) {
						return resolve({code:200,responseMsg:responseMsg,creditfilepath:creditFileNameOnly});
					});
				}
			});
		})
	    .catch(function (err) {
			var responseMsg = 'Error On Credit File Writing with history';
			return resolve({code:400,responseMsg:responseMsg,creditfilepath:creditFileNameOnly});
		});
	});
}

function processActumCreditPayment(customerDetails,reqdata,resdata){

	return Q.promise(function(resolve, reject) {

		  //-- Customer Information
		  var custname = customerDetails.user.firstname+" "+customerDetails.user.lastname;
		  var custemail = customerDetails.user.email;
		  var custaddress1 = customerDetails.user.street;
		  var custcity = customerDetails.user.city;
		  var custstate = customerDetails.user.state;
		  var custzip = customerDetails.user.zipCode;
		  var custphone = customerDetails.user.phoneNumber;
		  var custssnDetail = customerDetails.user.ssn_number;

		  var custssn='';
		  var custlastFourssn=''; //-- Last four digit
		  if(custssnDetail)
		  {
			  custssn = custssnDetail.replace(/[^a-zA-Z0-9]/g, '');
			  custlastFourssn = custssn.substr(custssn.length - 4);
		  }
		  var birth_date =(typeof(customerDetails.user.dateofBirth) != "undefined") ? moment(customerDetails.user.dateofBirth).format("MM/DD/YYYY") : moment().format('MM/DD/YYYY');

		  //--Payment Information
		  var acct_name = customerDetails.account.accountName;
		  var chk_acct = customerDetails.account.accountNumber;
		  var chk_aba = customerDetails.account.routingNumber;
		  var currency='US'; //--default
		  var bank_acct_type='Checking' //-- C

		  //--Billing Information
		  var trans_type='credit';
		  var initial_amount =  parseFloat(customerDetails.payOffAmount).toFixed(2);
		  var billing_cycle ='-1'; //-- -1

		  var loanReference = customerDetails.loanReference;
		  var userReference = customerDetails.user.userReference;
		  var creditLenderCode = loanReference+'__'+userReference;

		  // var newLine= "\r\n";

		  //Header fields
		  var fields = ['parent_id','sub_id','pmt_type','chk_acct','chk_aba','custname','custemail','custaddress1','custcity','custstate','custzip','custphone','custssn','birth_date','initial_amount','billing_cycle','ip_forward','action_code','creditflag'];

		  //Actum configuration
		  var parentId = sails.config.actumConfig.parentId;
		  var subId = sails.config.actumConfig.creditsubId;
		  var actumUsername = sails.config.actumConfig.actumUsername;
	      var actumPasswrod = sails.config.actumConfig.actumPasswrod;
	      var syspass = sails.config.actumConfig.syspass;
		  var actumApiUrl = sails.config.actumConfig.actumApiUrl

		  var action_code='P';
	      var creditflag =1;
	      var pmt_type='chk'

		  //IP Address
		  var IPFromRequest = reqdata.headers['x-forwarded-for'] || reqdata.connection.remoteAddress;
		  var indexOfColon = IPFromRequest.lastIndexOf(':');

		  if(indexOfColon>-1 )
		  {
			var ipaddr = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);
		  }
		  else
		  {
			var ipaddr = IPFromRequest;
		  }

		  //Dynamic Data
		  var csvfieldsData={
			   parent_id:parentId,
			   sub_id:subId,
			   pmt_type:pmt_type,
			   chk_acct:chk_acct,
			   chk_aba:chk_aba,
			   custname:custname,
			   custemail: custemail,
			   custaddress1: custaddress1,
			   custcity:custcity,
			   custstate:custstate,
			   custzip:custzip,
			   custphone: custphone,
			   custssn: custlastFourssn,
			   birth_date:birth_date,
			   initial_amount:initial_amount,
			   billing_cycle:billing_cycle,
			   ip_forward:ipaddr,
			   action_code:action_code,
			   creditflag:creditflag
		  }

		  var queryString = Object.keys(csvfieldsData).map(key => key + '=' + csvfieldsData[key]).join('&');
	      sails.log.info("queryString:::",queryString);

		  //--File path
		  var actumcsvPath = sails.config.appPath+sails.config.actumConfig.csvFilePath;
		  var creditFileNameOnly = creditLenderCode+"_Credit_"+ moment().tz("America/New_York").format("YYYYMMDD")+"_"+moment().tz("America/New_York").format("hh_mm")+".csv";
		  var creditFilename = actumcsvPath + creditFileNameOnly;

		  var creditToCsv = {
				data: csvfieldsData,
				fields: fields,
				hasCSVColumnTitle: true
		 };

		 //var creditCsv = json2csv(creditToCsv)+newLine;
		 var creditCsv = json2csv(creditToCsv);


		  var achlogDescp = 'Process Credit payment for $'+initial_amount+' for loan reference: '+customerDetails.loanReference+' ('+userReference+')';
		  var achlogData={
						'user':customerDetails.user.id,
						'account':customerDetails.account.id,
						'paymentManagement':customerDetails.id,
						'loanID':customerDetails.loanReference,
						'methodtype':1,
						'methodname':achlogDescp,
						'achAmount':initial_amount,
						'apirequest':csvfieldsData,
						'actumcreditfilename': creditFileNameOnly,
						'apistatus':0
		}

		 Actumhistory.registerActumhistory(achlogData)
	     .then(function (achhistoryData) {

				fs.writeFile(creditFilename, creditCsv , function (err) {

					if (err)
					{
						var responseMsg = 'Error on creating credit file writing';
						var apiresponsestatus= 5;
						achhistoryData.apiresponsestatus=apiresponsestatus;
						achhistoryData.apistatus=1;

						achhistoryData.save(function(err) {
							return resolve({code:400,responseMsg:responseMsg,creditfilepath:creditFileNameOnly,apiresponsestatus:apiresponsestatus});
						});
					}
					else
					{
						 request({
							method: 'POST',
							uri:actumApiUrl,
							headers: {
							  'username':actumUsername,
							  'password':actumPasswrod,
							  'syspass':syspass,
							  'Content-Type': 'application/x-www-form-urlencoded'
							},
							//strictSSL: false,
							body: queryString,
							json: true
						  },
						  function(error, response, body) {
							if (error) {
							  sails.log.error("Actum service error :: ", error)
							    //return reject(error)

							    var responseMsg = 'Actum api error';
								var apiresponsestatus= 4;
								var actumResponseData =error;

							  	achhistoryData.apiresponsestatus=apiresponsestatus;
								achhistoryData.apistatus=1;
								achhistoryData.apiresponse=error;

								achhistoryData.save(function(err) {
									return resolve({code:400,responseMsg:responseMsg,creditfilepath:creditFileNameOnly,actumResponseData:actumResponseData,apiresponsestatus:apiresponsestatus});
								});
							}
							else
							{
							   var actumResponseData = body;
							   sails.log.info("Actum service Response :: ", actumResponseData);
							   sails.log.info("Actum service Response Status :: ", actumResponseData.status)
							   //return res.json(body);

							   var apiresponsestatus=0;
							   if(actumResponseData.status=='Accepted')
							   {
								   apiresponsestatus =1;
							   }
							   else if(actumResponseData.status=='verify')
							   {
								   apiresponsestatus =2;
							   }
							   else if(actumResponseData.status=='declined')
							   {
								   apiresponsestatus =3;
							   }
							   achhistoryData.apiresponsestatus=apiresponsestatus;
							   achhistoryData.apistatus=1;
							   achhistoryData.apiresponse=actumResponseData;

							   achhistoryData.save(function(err) {

									if(apiresponsestatus==1)
									{
										var responseMsg = 'Actum credit accepted';
										return resolve({code:200,responseMsg:responseMsg,creditfilepath:creditFileNameOnly,actumResponseData:actumResponseData,apiresponsestatus:apiresponsestatus});
									}
									else
									{
										if(apiresponsestatus>0)
										{
											var responseMsg = 'Actum credit '+actumResponseData.status;
										}
										else
										{
											var responseMsg = 'Actum credit failed';
										}
										return resolve({code:400,responseMsg:responseMsg,creditfilepath:creditFileNameOnly,actumResponseData:actumResponseData,apiresponsestatus:apiresponsestatus});
									}
								});
							}
						  })
					 }
				});
		})
	    .catch(function (err) {
			var responseMsg = 'Error on registering actum history record';
			return resolve({code:400,responseMsg:responseMsg,creditfilepath:creditFileNameOnly,apiresponsestatus:6});
		});
	});
}

function processActumDebitPayment(userData,accountData,amount,IPFromRequest){

	return Q.promise(function(resolve, reject) {

		  //Actum configuration
		  var parentId = sails.config.actumConfig.parentId;
		  var subId = sails.config.actumConfig.subId;
		  var actumUsername = sails.config.actumConfig.actumUsername;
	      var actumPasswrod = sails.config.actumConfig.actumPasswrod;
	      var syspass = sails.config.actumConfig.syspass;
		  var actumApiUrl = sails.config.actumConfig.actumApiUrl;
		  var actumMode = sails.config.actumConfig.actumMode;

		  //IP Address
		  //var IPFromRequest = reqdata.headers['x-forwarded-for'] || reqdata.connection.remoteAddress;
		  var indexOfColon = IPFromRequest.lastIndexOf(':');

		  if(indexOfColon>-1 )
		  {
			var ipaddr = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);
		  }
		  else
		  {
			var ipaddr = IPFromRequest;
		  }

		  if(actumMode=='live')
		  {
		  	  //-- Customer Information
			  var custname = userData.firstname+" "+userData.lastname;
			  var custemail = userData.email;
			  var custaddress1 = userData.street;
			  var custcity = userData.city;
			  var custstate = userData.state;
			  var custzip = userData.zipCode;
			  var custphone = userData.phoneNumber;
			  var custssnDetail = userData.ssn_number;

			  //--Account & Payment Information
			  var acct_name = accountData.accountName;
			  var chk_acct = accountData.accountNumber;
			  var chk_aba = accountData.routingNumber;
			  var initial_amount =  amount;
		  }
		  else
		  {
			  //-- Static User and Account Details and ip address
			  var custname = 'Bob Yakuza';
			  var custemail = 'byakuza@gmail.com';
			  var custaddress1 = '893 Ginza';
			  var custcity = 'Austin';
			  var custstate = 'TX';
			  var custzip = '00893';
			  var custphone = '893-555-0893';
			  var custssnDetail = '008-93-0893';
			  var birth_date = '12/07/1941';
			  //var chk_acct = '123123412345';
			  var chk_acct = '184225695';
			  var chk_aba = '999999999';
			  var ipaddr ='111.93.237.186';
			  var initial_amount =  '1.00';

			  /*var custname = 'VY Li';
			  var custemail = 'vy.li@maxdecision.com';
			  var custaddress1 = '278 N Buckskin Way';
			  var custcity = 'Orange';
			  var custstate = 'CA';
			  var custzip = '92869';
			  var custphone = '682-888-7698';
			  var custssnDetail = '620-29-8764';
			  var birth_date = '07/16/1978';
			  //var chk_acct = '123123412345';
			  var chk_acct = '336053688';
			  //var chk_aba = '311880980';
			  var chk_aba = '322271627';
			  var ipaddr ='111.93.237.186';
			  var initial_amount =  '1.00';*/
		  }

		  initial_amount = parseFloat(initial_amount);
		  initial_amount = initial_amount.toFixed(2);

		  var custssn='';
		  var custlastFourssn=''; //-- Last four digit
		  if(custssnDetail)
		  {
			  custssn = custssnDetail.replace(/[^a-zA-Z0-9]/g, '');
			  custlastFourssn = custssn.substr(custssn.length - 4);
		  }

		  //-- required
		  var billing_cycle ='-1';
		  var trans_modifier= 'S'; //-- Same Day
		  var action_code='D'; //-- not used
		  var pmt_type='chk'
		  var currency='US'; //--default

		  //Dynamic Debit Data
		  var debitData={
			  parent_id:parentId,
			  sub_id:subId,
			  pmt_type:pmt_type,
			  chk_acct:chk_acct,
			  chk_aba:chk_aba,
			  custname:custname,
			  custemail: custemail,
			  custaddress1: custaddress1,
			  custcity:custcity,
			  custstate:custstate,
			  custzip:custzip,
			  custphone: custphone,
			  custssn: custlastFourssn,
			  birth_date:birth_date,
			  initial_amount:initial_amount,
			  billing_cycle:billing_cycle,
			  ip_forward:ipaddr,
			  trans_modifier: trans_modifier
			  //action_code:action_code
		  }

		  var queryString = Object.keys(debitData).map(key => key + '=' + debitData[key]).join('&');
	      //sails.log.info("queryString:::",queryString);
		  // return resolve({debitData:debitData,queryString:queryString});

		  request({
			method: 'POST',
			uri:actumApiUrl,
			headers: {
			  'username':actumUsername,
			  'password':actumPasswrod,
			  'syspass':syspass,
			  'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: queryString,
			json: true
		  },
		  function(error, response, body) {
			if (error) {
			  sails.log.error("Actum Debit Error :: ", error);
			  return reject(error)
			}
			else
			{
			   //var actumResponseData = body;
			   //sails.log.info("Actum Debit service Response :: ", actumResponseData);
			   //sails.log.info("Actum Debit service Response Status :: ", actumResponseData.status);
			   //return resolve(actumResponseData);

			    var type='status';
			    ActumService.getActumJsonOutput(body,type)
				.then(function (finalresponseData) {
			  		 return resolve(finalresponseData);
				})
				.catch(function(err) {
					return reject(err)
				})
			}
		  })

	});
}

function checkActumPaymentStatus(order_id){

	return Q.promise(function(resolve, reject) {

		  //Actum configuration
		  var parentId = sails.config.actumConfig.parentId;
		  var subId = sails.config.actumConfig.subId;
		  var actumUsername = sails.config.actumConfig.actumUsername;
	      var actumPasswrod = sails.config.actumConfig.actumPasswrod;
	      var syspass = sails.config.actumConfig.syspass;
		  var actumApiUrl = sails.config.actumConfig.actumApiUrl;
		  var actumMode = sails.config.actumConfig.actumMode;

		  var action_code='A'; //-- not used
		  var pmt_type='chk'
		  var currency='US'; //--default
		  var type='Basic'; //--extended

		  //Dynamic Check  Data
		  var checkPaymentData={
			  username:actumUsername,
			  password:actumPasswrod,
			  action_code:action_code,
			  prev_history_id:'',
			  order_id:order_id,
			  Type:type
		  }

		  var queryString = Object.keys(checkPaymentData).map(key => key + '=' + checkPaymentData[key]).join('&');
		  sails.log.info("queryString:::",queryString);

		  request({
			method: 'POST',
			uri:actumApiUrl,
			headers: {
			  //'username':actumUsername,
			  //'password':actumPasswrod,
			  //'syspass':syspass,
			  'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: queryString,
			json: true
		  },
		  function(error, response, body) {
			if (error) {
			  sails.log.error("Actum Check payment Error :: ", error);
			  return reject(error)
			}
			else
			{
				//var type='origination_status';
				var type='curr_bill_status';
				ActumService.getActumJsonOutput(body,type)
				.then(function (finalresponseData) {

			  		 return resolve(finalresponseData);
				})
				.catch(function(err) {
					return reject(err)
				})
			}
		  })
	});
}

function getActumJsonOutput(inputData,type){

	return Q.promise(function(resolve, reject) {

		if ("undefined" !== typeof inputData && inputData!='' && inputData!=null)
		{
			var lines = inputData.split("\n");

			if(lines.length>0)
			{
				var jsonObj = {};
				var validJsonOutput=0;

				for (var i = 0; i < lines.length; i++) {

				   var linesData = lines[i];
				   if ("undefined" !== typeof linesData && linesData!='' && linesData!=null)
				   {
					   var linesArray = linesData.split("=");

					   if(linesArray.length>1)
					   {
						   if(linesArray[0]==type)
						   {
							   validJsonOutput=1;
						   }
						   jsonObj[linesArray[0]] = linesArray[1];
					   }
				   }
				}

				if(validJsonOutput==1)
				{
					var responseData={
						status: 200,
						jsonObj:jsonObj
					}
					return resolve(responseData);
				}
				else
				{
					//return resolve({status: 400,inputData:inputData});
					return resolve({status: 400});
				}
			}
			else
			{
				return resolve({status: 400});
			}
		}
		else
		{
			return resolve({status: 400});
		}
	});
}

function pullActumRecurringDebit(processData,callback){

	var payId = processData.payId;
	var amountPull = processData.amountPull;
	var scheduledDate = processData.scheduledDate;
	var IPFromRequest = processData.IPFromRequest;

	var paycriteria = {
		id: payId,
		status:['OPENED','CURRENT','LATE'],
		isPaymentActive: true,
		achstatus: { $eq: 1, $exists: true },
		//blockmakepayment:{ $eq: 0, $exists: true },
	};

	//var paycriteria = { id : "5bc041fa7faa5d1846f9a50d" };

	PaymentManagement
	.findOne(paycriteria)
	.populateAll()
	.then(function(paymentManagementDetail) {

		sails.log.info("paymentManagementDetail.achstatus : ",paymentManagementDetail.achstatus);

		if (paymentManagementDetail.account)
		{
		  var accountcriteria = { id: paymentManagementDetail.account.id };
		}
		else
		{
		  var accountcriteria = { user: paymentManagementDetail.screentracking.user };
		}


		//--Added for potential default log
		var scheduleloopcounter =1;
		var scheduleIDValue =1;
		var scheduleData;
		var  checkpaymentSchedule = _.orderBy(paymentManagementDetail.paymentSchedule, ['date'], ['asc']);
		_.forEach(checkpaymentSchedule, function(chkschedule) {

			 if(chkschedule.status != 'PAID OFF')
			 {
				if (moment().startOf('day').toDate().getTime() == moment(chkschedule.date).startOf('day').toDate().getTime())
				{
					scheduleIDValue = scheduleloopcounter;
					scheduleData = chkschedule;
				}
			 }
			 scheduleloopcounter++;
		})

		Account
	   .findOne(accountcriteria)
	   .then(function(accountDetail) {

			var acherrorlogDescp = 'Process Debit payment for $'+amountPull+' for loan reference: '+paymentManagementDetail.loanReference;
			var acherrorlogData={
				'user':paymentManagementDetail.user.id,
				'paymentManagement':paymentManagementDetail.id,
				'methodname':acherrorlogDescp,
				'methodtype':5,
				'loanID':paymentManagementDetail.loanReference,
				'achAmount':amountPull,
				'apiType': 'Actum'
			}

			//sails.log.info("accountDetail : ",accountDetail);

			if(accountDetail)
			{
			    var userData =  paymentManagementDetail.user;
			    var accountID = accountDetail.id;
				var repullType ='Autodebit';

				/*Repullbankaccount.checkLatestPlaidRepull(accountID,amountPull,repullType)
				.then(function(repullresponse) {

					//sails.log.info("repullresponse:",repullresponse);

					if(repullresponse.status==200)
					{*/
						//-- Ach history register
						User.getNextSequenceValue('achdebit')
						.then(function(debitRefernceData) {

							var loanID = paymentManagementDetail.loanReference+'_DR_'+debitRefernceData.sequence_value;

							var achlogDescp = 'Cron process Debit payment for $'+amountPull+' for loan reference: '+paymentManagementDetail.loanReference;
							var achlogData={
								'user':paymentManagementDetail.user.id,
								'account':accountDetail.id,
								'paymentManagement':paymentManagementDetail.id,
								'methodname':achlogDescp,
								'methodtype':4,
								'apistatus':0,
								'loanID':loanID,
								'achAmount':amountPull
							}

							Achhistory.registerAchhistory(achlogData)
							.then(function (achhistoryData) {

								ActumService.processActumDebitPayment(userData,accountDetail,amountPull,IPFromRequest)
								.then(function(transactionDetail) {

									//sails.log.info("transactionDetail : ",transactionDetail);

									var debitStatus=0;
									var failuremessage='';
									if(transactionDetail.status==200)
									{
										var debitResponseData = transactionDetail.jsonObj;

										var debitStatusTxt = debitResponseData.status.toLowerCase();

										if(debitStatusTxt=='accepted')
										{
											debitStatus=1;
										}
										else if(debitStatusTxt=='declined')
										{
											debitStatus=2;
											failuremessage= 'Unable to process debit payment: '+transactionDetail.jsonObj.authcode;
										}
										else if(debitStatusTxt=='verify')
										{
											debitStatus=3;
											failuremessage= 'Unable to process debit payment: '+debitStatusTxt;
										}
										else
										{
											failuremessage='Unable to process debit payment';
										}
									}

									if(debitStatus==1)
									{
										achhistoryData.apiresponsestatus=1;
									}
									else
									{
										achhistoryData.apiresponsestatus=2;
										achhistoryData.appfailure = 1;
										achhistoryData.appfailuremessage = "User debit repayment failed through cron!";
									}

									achhistoryData.apistatus=1;
									achhistoryData.apiresponse=transactionDetail;
									achhistoryData.save(function(err) {

										if (err) {
										 //sails.log.error("Achhistory :: Update Error :: ", err);
										}

										if(debitStatus==1)
										{
											//-- Debit success
											Transaction.createTransactionForPull(paymentManagementDetail.id, transactionDetail, amountPull);

											//update payment schedule
											PaymentManagement
											.updatePaymentSchedule(paymentManagementDetail,transactionDetail, amountPull, loanID, accountDetail)
											.then(function(paymentDet) {

												var criteria = {
												  id: paymentManagementDetail.user.id
												};
												User.findOne(criteria)
												.then(function(userdata) {
													//EmailService.sendLoanRepaymentEmail(userdata, amountPull ,emailType,type,paymentManagementDetail.story.id);


													var responseData={
														statusCode:200,
														message: 'Recurring debit completed successfully'
													}
													callback(responseData);
												})
											})
											.catch(function(err) {
											    sails.log.error("ActumService#pullActumRecurringDebit :: #PaymentUpdateError::Error", err);

											    var responseData={
													statusCode:401,
													message: 'Unable to update payment schedule information'
												}
												callback(responseData);
											})
										}
										else
										{
											//-- Debit declined
											var failure_authcode='';
											var failure_historyId='';
											if(debitStatus==2)
											{
												failure_historyId  = transactionDetail.jsonObj.history_id;
												failure_authcode   = transactionDetail.jsonObj.authcode;
											}

											if (paymentManagementDetail.failedtranscount)
											{
												paymentManagementDetail.failedtranscount = paymentManagementDetail.failedtranscount+1;
											}
											else
											{
												paymentManagementDetail.failedtranscount =1;
											}
											if (!paymentManagementDetail.failedtransactions)
											{
												paymentManagementDetail.failedtransactions = [];
											}
											paymentManagementDetail.failedtransactions.push({
												  amount: amountPull,
												  // scheduledloanDate:scheduledloanDate,
												  date: new Date()
											});

											if (!paymentManagementDetail.usertransactions)
											{
											  paymentManagementDetail.usertransactions = [];
											}

											paymentManagementDetail.usertransactions.push({
												  amount: amountPull,
												  loanID: loanID,
												  status:3,
												  transactionId: '',
												  transactionType:'Automatic',
												  apiType:apiType,
												  accountName: accountDetail.accountName,
												  accountNumberLastFour: accountDetail.accountNumberLastFour,
												  accountId: accountDetail.id,
												  initialschedule: paymentManagementDetail.paymentSchedule,
												  failure_authcode: failure_authcode,
												  failure_historyId: failure_historyId,
												  date: new Date()
											});

											_.forEach(paymentManagementDetail.paymentSchedule, function(schedule) {
												if (moment().startOf('day').toDate().getTime() == moment(schedule.date).startOf('day').toDate().getTime()) {
													schedule.date = moment().startOf('day').add(1, 'days').toDate();
												}
											})

											paymentManagementDetail.save(function (err) {

												if (err) {
												 //sails.log.error("Paymentmanagement :: Update Error :: ", err);
												}

												var emailType='failure';
												var type='autopay';
												var usercriteria = {
														  id: paymentManagementDetail.user.id
													   };
												User.findOne(usercriteria)
												.then(function(user) {
													 //-- Need to work on payment failure email to user
													//EmailService.sendLoanRepaymentEmail(user, amountPull ,emailType,type,paymentManagementDetail.story.id);
												})

												var responseData={
													statusCode:401,
													message: failuremessage
												}
												callback(responseData);

											});
										}
									});
								}).catch(function(err) {
									   sails.log.error('ActumService#pullActumRecurringDebit ::Error in getNextSequenceValue:: ', err);
									   var responseData={
											statusCode:400,
											message:'Unable to debit recurring amount'
										}
										callback(responseData);
								});
							}).catch(function(err) {
								   sails.log.error('ActumService#pullActumRecurringDebit ::Error in registerAchhistory :: ', err);
								   var responseData={
										statusCode:400,
										message:'Unable to debit recurring amount'
									}
									callback(responseData);
							});
						}).catch(function(err) {
								sails.log.error('ActumService#pullActumRecurringDebit ::Error in getNextSequenceValue:: ', err);
								var responseData={
									statusCode:400,
									message:'Unable to debit recurring amount'
								}
								callback(responseData);
						});
					/*}
					else
					{
						if(repullresponse.status==300 || repullresponse.status==500)
						{
							var errormessage = repullresponse.message;
						}
						else
						{
							 var errormessage ="Unable to repull plaid details for the loan!";
						}

						//-- Ach history register
						acherrorlogData.appfailure = 1;
						acherrorlogData.apistatus=0;
						acherrorlogData.appfailuremessage = "Unable to repull plaid data for the autodebit loan!";
						Achhistory.registerAchhistory(acherrorlogData);

						if (!paymentManagementDetail.potentialdefaultlog)
						{
						  paymentManagementDetail.potentialdefaultlog = [];
						}
						paymentManagementDetail.potentialdefaultlog.push({
							 amount: amountPull,
							 scheduleID:scheduleIDValue,
							 scheduleData: scheduleData,
							 logmessage: errormessage,
							 logdate: new Date()
						});
						paymentManagementDetail.potentialdefaultexist =1;
						paymentManagementDetail.save(function(err) {
								var responseData={
									statusCode:400,
									message:errormessage
								}
								callback(responseData);
						});
					}
				}).catch(function(err) {
					sails.log.error('ActumService#pullActumRecurringDebit :: Error :: Unable to repull plaid details for the autodebit :: ', err);

					//-- Ach history register
					acherrorlogData.appfailure = 1;
					acherrorlogData.apistatus=0;
					acherrorlogData.appfailuremessage = "Unable to repull plaid data for the autodebit loan!";
					Achhistory.registerAchhistory(acherrorlogData);

					if (!paymentManagementDetail.potentialdefaultlog)
					{
					  paymentManagementDetail.potentialdefaultlog = [];
					}
					paymentManagementDetail.potentialdefaultlog.push({
						 amount: amountPull,
						 scheduleID:scheduleIDValue,
						 scheduleData: scheduleData,
						 logmessage: 'Unable to repull plaid data for the autodebit loan',
						 logdate: new Date()
					});
					paymentManagementDetail.potentialdefaultexist =1;
					paymentManagementDetail.save(function(err) {
						var responseData={
							statusCode:400,
							message:'Unable to repull plaid details for the autodebit',
						}
						callback(responseData);
					});
				});*/
			}
			else
			{
				sails.log.error('ActumService#pullActumRecurringDebit :: Error :: Invalid account details :: ', err);
				var responseData={
					statusCode:400,
					message:'Invalid account details',
				}
				callback(responseData);
			}
		}).catch(function(err) {
			sails.log.error('ActumService#pullActumRecurringDebit :: Error :: Unable to fetch account details :: ', err);
			var responseData={
				statusCode:400,
				message:'Unable to fetch account details',
			}
			callback(responseData);
		});

	}).catch(function(err) {
		sails.log.error('ActumService#pullActumRecurringDebit :: Error :: Unable to fetch payment details :: ', err);

		var responseData={
			statusCode:400,
			message:'Unable to fetch payment details',
		}
		callback(responseData);
	});
}

function getLenderCreditStatus(comissionID,callback){

	return Q.promise(function(resolve, reject) {

		var checkcriteria = { id: comissionID };

		Paymentcomissionhistory
		.findOne(checkcriteria)
		.then(function(historyDetails) {

			if(historyDetails)
			{
				var orderId = historyDetails.orderId;
				var historyId = historyDetails.historyId;
				var payID = historyDetails.paymentmanagement;

				ActumService.checkActumPaymentStatus(orderId)
				.then(function (responseData) {

					sails.log.info("#responseData", responseData);

					var checkStatus=0;
					if(responseData.status==200)
					{
						//var checkResponseData = responseData.jsonObj;
						//var checkResponseDataTxt = debitResponseData.status.toLowerCase();
						//var checkResponseDataTxt = checkResponseData.origination_status.toLowerCase();

						var checkResponseJson = responseData.jsonObj;
						var checkResponseBillStatus = checkResponseJson.curr_bill_status.toLowerCase();
						var checkResponseBillArray = checkResponseBillStatus.split("-");
						var checkResponseDataTxt ='';
						if(checkResponseBillArray.length>0)
						{
							checkResponseDataTxt = checkResponseBillArray[0];
							checkResponseDataTxt = checkResponseDataTxt.replace(/\s/g,'');
						}
						sails.log.info('checkResponseDataTxt',checkResponseDataTxt);

						//-- Need to check with Actum about status
						//if(checkResponseDataTxt=='settled' || checkResponseDataTxt=='accepted' || checkResponseDataTxt=='success'  )
						if(checkResponseDataTxt=='settled')
						{
							checkStatus=1;
						}
						else if(checkResponseDataTxt=='pending')
						{
							checkStatus=2;
						}
						else if(checkResponseDataTxt=='declined' || checkResponseDataTxt=='failed' || checkResponseDataTxt=='returned')
						{
							checkStatus=3;
						}
						else
						{
							checkStatus=4;
						}

						var actumcheckpaymentLogData = {
							 paymentManagement:historyDetails.paymentmanagement,
							 user:historyDetails.user,
							 paymentcomissionhistory: comissionID,
							 historyData: historyId,
							 orderData: orderId,
							 responsedata: checkResponseJson,
							 checkStatus: checkStatus,
							 type:'debit'
						}

						Actumcheckpayment.create(actumcheckpaymentLogData)
						.then(function(checkpaymentLogInfo) {

							sails.log.info("#checkStatus::checkStatus", checkStatus);

							if(checkStatus==1)
							{
								var firstpaymentcriteria={
									paymentmanagement:payID,
									paymentstatus: { $ne :0 }
								}

								var isfirstpayment = historyDetails.isfirstpayment;
								var fixedfee =    historyDetails.fixedfee;
								var percentFeeValue =    historyDetails.percentfee;
								var pfiOriginationFee = sails.config.actumConfig.pfiOriginationFee;
								var orginiationfee =   parseFloat(pfiOriginationFee.toFixed(2));
								var paymentamount = parseFloat( parseFloat( historyDetails.paymentamount ).toFixed( 2 ) );


								Paymentcomissionhistory
								.find(firstpaymentcriteria)
								.then(function(historyinfo) {

					   				var previousPaymentCount = historyinfo.length;
					   				if(parseInt(previousPaymentCount) >0 )
									{
										if(isfirstpayment==1)
										{
											var orginiationfee=0;
											var deductAmount =  parseFloat(fixedfee) + parseFloat(percentFeeValue) + parseFloat(orginiationfee);
											var paybackAmount = parseFloat(paymentamount) -  parseFloat(deductAmount);

											if(paybackAmount<0)
											{
												paybackAmount =0;
											}
											paybackAmount =   parseFloat(paybackAmount.toFixed(2));
											deductAmount =   parseFloat(deductAmount.toFixed(2));

											var updateValues={
												paymentstatus: checkStatus,
												isfirstpayment:0,
												orginiationfee:orginiationfee,
												paybackAmount: paybackAmount,
												comissionamount:deductAmount,
												creditrunstatus:1
											}
										}
										else
										{
											var updateValues={
												paymentstatus: checkStatus,
												creditrunstatus:1
											}
										}
									}
									else
									{
										if(isfirstpayment==0)
										{
											var deductAmount =  parseFloat(fixedfee) + parseFloat(percentFeeValue)  + parseFloat(sails.config.actumConfig.pfiOriginationFee);
											var paybackAmount = parseFloat(paymentamount) -  parseFloat(deductAmount);

											if(paybackAmount<0)
											{
												paybackAmount =0;
											}
											paybackAmount =   parseFloat(paybackAmount.toFixed(2));
											deductAmount =   parseFloat(deductAmount.toFixed(2));

											var updateValues={
												paymentstatus: checkStatus,
												isfirstpayment:1,
												orginiationfee:sails.config.actumConfig.pfiOriginationFee,
												paybackAmount: paybackAmount,
												comissionamount:deductAmount,
												creditrunstatus:1
											}
										}
										else
										{
											var updateValues={
												paymentstatus: checkStatus,
												creditrunstatus:1
											}
										}
									}

									//sails.log.info("#updateValues::updateValues", updateValues);

									Paymentcomissionhistory.update({id: comissionID}, updateValues)
									.exec(function afterwards(err, updated){

										//-- Update usertransactions field in paymentmanagment table
										var transCriteria={transactionId:orderId};

										Transaction.update(transCriteria, {status: 3}).exec(function afterwards(err, updated){

											PaymentManagement.updateUserTransactionStatus(payID,orderId)
											.then(function(updatestatus) {

											});

											var responseData={
												statusCode:200,
												message:'Payment settled',
												responseData: responseData
											}
											callback(responseData);
										});
								  });
								}).catch(function(err) {
										sails.log.error("ActumService#getLenderCreditStatus :: Error : ",err);
										var responseData={
											statusCode:400,
											message:'Unable to check first payment criteria',
											responseData: responseData
										}
										callback(responseData);
								});
							}
							else if(checkStatus==2)
							{
								var responseData={
									statusCode:200,
									message:'Payment Pending',
									responseData: responseData
								}
								callback(responseData);
							}
							else if(checkStatus==3)
							{
								Paymentcomissionhistory.update({id: comissionID}, {paymentstatus: checkStatus})
								.exec(function afterwards(err, updated){

									var responseData={
										statusCode:200,
										message:'Payment failed',
										responseData: responseData
									}
									callback(responseData);
								});
							}
							else
							{
								var responseData={
									statusCode:200,
									message:'Payment status not known',
									responseData: responseData
								}
								callback(responseData);
							}
						}).catch(function(err) {
							sails.log.error('ActumService#getLenderCreditStatus :: Error :: Unable to register actum check payment :: ', err);
							var responseData={
								statusCode:400,
								message:'Unable to register actum check payment',
								responseData: responseData
							}
							callback(responseData);
						});
					}
					else
					{
						sails.log.error('ActumService#getLenderCreditStatus :: Error :: Unable to check actum payment status :: ', responseData);
						var responseData={
							statusCode:400,
							message:'Unable to check actum payment status',
							responseData: responseData
						}
						callback(responseData);
					}
				}).catch(function(err) {
					sails.log.error('ActumService#getLenderCreditStatus :: Error :: Unable to check actum payment status :: ', err);
					var responseData={
						statusCode:400,
						message:'Unable to check actum payment status'
					}
					callback(responseData);
				});
			}
			else
			{
				sails.log.error('ActumService#getLenderCreditStatus :: Error :: Invalid comission history details :: ', err);
				var responseData={
					statusCode:400,
					message:'Invalid history details'
				}
				callback(responseData);
			}
		}).catch(function(err) {
			sails.log.error('ActumService#getLenderCreditStatus :: Error :: Unable to fetch comission history details :: ', err);
			var responseData={
				statusCode:400,
				message:'Unable to fetch comission history details'
			}
			callback(responseData);
		});
	});
}

function fundPracticeCreditPayment(processData,callback){

	return Q.promise(function(resolve, reject) {

		var comissionID = processData.comissionId;
		var IPFromRequest = processData.IPFromRequest;

		var checkcriteria = { id: comissionID };

		Paymentcomissionhistory
		.findOne(checkcriteria)
		.populate('paymentmanagement')
		.populate('practicemanagement')
		.then(function(historyDetails) {

			if(historyDetails)
			{
				var orderId = historyDetails.orderId;
				var historyId = historyDetails.historyId;
				var payID = historyDetails.paymentmanagement;
				var paybackAmount = historyDetails.paybackAmount;
				var paymentstatus = historyDetails.paymentstatus;
				var creditrunstatus = historyDetails.creditrunstatus;

				if(paymentstatus==1 && creditrunstatus==1)
				{
					if (historyDetails.practicemanagement)
					{
						var practiceData  = historyDetails.practicemanagement;
						var paymentManagementDetail  = historyDetails.paymentmanagement;
						var payID  = paymentManagementDetail.id;

						//-- Ach history register
						User.getNextSequenceValue('achcredit')
						.then(function(creditRefernceData) {

							var loanCreditID = paymentManagementDetail.loanReference+'_CR_'+creditRefernceData.sequence_value;

							//-- Ach history register
							var achlogDescp = 'Cron process practice credit payment for $'+paybackAmount+' for loan reference: '+loanCreditID;
							var achlogData={
								'user':paymentManagementDetail.user,
								'account':paymentManagementDetail.account,
								'paymentManagement':paymentManagementDetail.id,
								'methodname':achlogDescp,
								'methodtype':3,
								'apistatus':0,
								'loanID':paymentManagementDetail.loanReference,
								'achAmount':paybackAmount
							}

							Achhistory.registerAchhistory(achlogData)
							.then(function (achhistoryData) {

								ActumService.processPracticeCreditPayment(practiceData,paybackAmount,IPFromRequest)
								.then(function(transactionDetail) {

									var creditStatus=0;
									var failure_code='';
									var failuremessage='';
									var failure_message='';
									if(transactionDetail.status==200)
									{
										var creditResponseData = transactionDetail.jsonObj;
										var creditStatusTxt = creditResponseData.status.toLowerCase();


										if("undefined" !== typeof creditResponseData.authcode && creditResponseData.authcode!='' && creditResponseData.authcode!=null)
										{
											failure_code =  creditResponseData.authcode;
										}

										if("undefined" !== typeof creditResponseData.reason && creditResponseData.reason!='' && creditResponseData.reason!=null)
										{
											failure_message =  creditResponseData.reason;
										}

										if(creditStatusTxt=='accepted')
										{
											creditStatus=1;
										}
										else if(creditStatusTxt=='declined')
										{
											creditStatus=2;
											failuremessage= 'Unable to process credit payment: '+failure_message+' ('+failure_code+' )';
										}
										else if(creditStatusTxt=='verify')
										{
											creditStatus=3;
											failuremessage= 'Unable to process credit payment: '+creditStatusTxt;
										}
										else
										{
											creditStatus=4;
											failuremessage='Unable to process credit payment: '+failure_message+' ('+failure_code+' )';
										}
									}

									if(creditStatus==1)
									{
										achhistoryData.apiresponsestatus=1;
									}
									else
									{
										achhistoryData.apiresponsestatus=2;
										achhistoryData.appfailure = 1;
										achhistoryData.appfailuremessage = "Practice credit payment failed through cron!";
									}

									achhistoryData.apistatus=1;
									achhistoryData.apiresponse=transactionDetail;
									achhistoryData.save(function(err) {

										if (err) {
										}

										if(creditStatus==1)
										{
											var updateValues={
												paymentstatus:2,
												creditrunstatus:2,
												creditorderID:creditResponseData.order_id,
												credithistoryID:creditResponseData.history_id,
												creditauthCode:creditResponseData.authcode,
												creditrunAmount:creditResponseData.initial_amount
											};
											Paymentcomissionhistory.update({ id: comissionID }, updateValues)
											.exec(function afterwards(err, updated){

											    //-- updated on oct 29, 2018
											    PaymentManagement
												.findOne({id: payID})
												.then(function(paymentManagement) {

					   								if(paymentManagement)
													{
														 if (!paymentManagement.doctorcredittransactions)
														 {
														  	paymentManagement.doctorcredittransactions = [];
														 }

														 paymentManagement.doctorcredittransactions.push({
															  amount: paybackAmount,
															  loanCreditID: loanCreditID,
															  status:1,
															  creditorderID:creditResponseData.order_id,
															  credithistoryID:creditResponseData.history_id,
															  creditauthCode:creditResponseData.authcode,
															  creditrunAmount:creditResponseData.initial_amount,
			  												  transactionType:'Automatic',
															  date: new Date()
														});

														 paymentManagement.save(function(err) {

															var responseData={
																statusCode:200,
																message:'Practice credit payment run successfully'
															}
															callback(responseData);
														});
													}
													else
													{
														var responseData={
															statusCode:200,
															message:'Practice credit payment run successfully'
														}
														callback(responseData);
													}
												}).catch(function(err) {

													var responseData={
														statusCode:200,
														message:'Practice credit payment run successfully'
													}
													callback(responseData);
												});
											});
										}
										else
										{
											//-- Practice credit declined
											var creditfailurecount=0;
											var creditfailuretransactions = [];
											if (!historyDetails.creditfailurecount)
											{
												  creditfailurecount = 1;
											}
											else
											{
												 creditfailurecount =parseInt(historyDetails.creditfailurecount)+1;
											}

											if (historyDetails.creditfailuretransactions)
										    {
												  creditfailuretransactions = historyDetails.creditfailuretransactions;
										    }

											creditfailuretransactions.push({
												  amount: paybackAmount,
												  loanCreditID: loanCreditID,
												  status:3,
									 			  failure_code:failure_code,
									              failure_message:failure_message,
												  date: new Date()
											});

											var updateValues={
												creditfailurecount: creditfailurecount,
												creditfailuretransactions: creditfailuretransactions
											}

											Paymentcomissionhistory.update({ id: comissionID }, updateValues)
											.exec(function afterwards(err, updated){

											    //-- updated on oct 29, 2018
											    PaymentManagement
												.findOne({id: payID})
												.then(function(paymentManagement) {

					   								if(paymentManagement)
													{
														 if (!paymentManagement.doctorfailedcreditcount)
														 {
															  paymentManagement.doctorfailedcreditcount = 1;
														 }
														 else
														 {
															 paymentManagement.doctorfailedcreditcount =parseInt(paymentManagement.doctorfailedcreditcount)+1;
														 }

														 if (!paymentManagement.doctorcredittransactions)
														 {
														  	paymentManagement.doctorcredittransactions = [];
														 }

														 paymentManagement.doctorcredittransactions.push({
															  amount: paybackAmount,
															  loanCreditID: loanCreditID,
															  status:2,
															  failure_code:failure_code,
															  failure_message:failure_message,
															  date: new Date()
														});

														 paymentManagement.save(function(err) {

															var responseData={
																statusCode:400,
																message:failuremessage
															}
															callback(responseData);
														});
													}
													else
													{
														var responseData={
															statusCode:400,
															message:failuremessage
														}
														callback(responseData);
													}
												}).catch(function(err) {

													var responseData={
														statusCode:400,
														message:failuremessage
													}
													callback(responseData);
												});
											});
										}
									});
								}).catch(function(err) {
								   sails.log.error('ActumService#fundPracticeCreditPayment ::Error in process practice credit amount:: ', err);
								   var responseData={
										statusCode:400,
										message:'Unable to process practice credit amount'
									}
									callback(responseData);
								});
							}).catch(function(err) {
							   sails.log.error('ActumService#fundPracticeCreditPayment ::Error in registerAchhistory:: ', err);
							   var responseData={
									statusCode:400,
									message:'Unable to process practice credit amount'
								}
								callback(responseData);
							});
						}).catch(function(err) {
						   sails.log.error('ActumService#fundPracticeCreditPayment ::Error in getNextSequenceValue:: ', err);
						   var responseData={
								statusCode:400,
								message:'Unable to process practice credit amount'
							}
							callback(responseData);
						});
					}
					else
					{
						sails.log.error('ActumService#fundPracticeCreditPayment :: Error :: Invalid practice details :: ', err);
						var responseData={
							statusCode:400,
							message:'Invalid practice details'
						}
						callback(responseData);
					}
				}
				else
				{
					var errormessage='';
					if(paymentstatus==0)
					{
						errormessage= errormessage+'Debit payment incomplete';
					}

					if(creditrunstatus==0)
					{
						errormessage= errormessage+'Practice credit payment run already';
					}

					sails.log.error('ActumService#fundPracticeCreditPayment :: Practice Payment Error :: ', errormessage);
					var responseData={
						statusCode:400,
						message:errormessage
					}
					callback(responseData);
				}
			}
			else
			{
				sails.log.error('ActumService#fundPracticeCreditPayment :: Error :: Invalid comission history details :: ', err);
				var responseData={
					statusCode:400,
					message:'Invalid history details'
				}
				callback(responseData);
			}
		}).catch(function(err) {
			sails.log.error('ActumService#fundPracticeCreditPayment :: Error :: Unable to fetch comission history details :: ', err);
			var responseData={
				statusCode:400,
				message:'Unable to fetch comission history details'
			}
			callback(responseData);
		});
	});
}

function processPracticeCreditPayment(practiceDetails,paybackAmount,IPFromRequest){
	return Q.promise(function(resolve, reject) {

		  //Actum configuration
		  var parentId = sails.config.actumConfig.parentId;
		  var subId = sails.config.actumConfig.creditsubId;
		  var actumUsername = sails.config.actumConfig.actumUsername;
	      var actumPasswrod = sails.config.actumConfig.actumPasswrod;
	      var syspass = sails.config.actumConfig.syspass;
		  var actumApiUrl = sails.config.actumConfig.actumApiUrl
		  var actumMode = sails.config.actumConfig.actumMode;


		  //IP Address
		  var indexOfColon = IPFromRequest.lastIndexOf(':');

		  if(indexOfColon>-1 )
		  {
			var ipaddr = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);
		  }
		  else
		  {
			var ipaddr = IPFromRequest;
		  }

		  if(actumMode=='live')
		  {
			  //-- Practice Information
			  var custname = practiceDetails.PracticeName.substr( 0, 64 );
			  var custemail = practiceDetails.PracticeEmail;
			  var custaddress1 = practiceDetails.StreetAddress;
			  var custcity = practiceDetails.City;
			  var custstate = practiceDetails.StateCode;
			  var custzip = practiceDetails.ZipCode;
			  var custphone = practiceDetails.PhoneNo;
			  //var custssnDetail = practiceDetails.ssnNumber;
			  //var birth_date =(typeof(practiceDetails.dateofBirth) != "undefined") ? moment(practiceDetails.dateofBirth).format("MM/DD/YYYY") : moment().format('MM/DD/YYYY');

			  //--Payment Information
		  	  var acct_name = practiceDetails.Accountholder;
		  	  var chk_acct  = practiceDetails.Accountnumber;
		      var chk_aba  = practiceDetails.Routingnumber;
			  var initial_amount =  parseFloat(paybackAmount).toFixed(2);
		  }
		  else
		  {
			  var custname = 'Bob Yakuza';
			  var custemail = 'byakuza@gmail.com';
			  var custaddress1 = '893 Ginza';
			  var custcity = 'Austin';
			  var custstate = 'TX';
			  var custzip = '00893';
			  var custphone = '893-555-0893';
			  //var custssnDetail = '008-93-0893';
			  //var birth_date = '12/07/1941';
			  var acct_name = 'Plaid Checking';
			  var chk_acct = '184225695';
			  var chk_aba = '999999999';
			  var ipaddr ='111.93.237.186';
			  var initial_amount =  '1.00';
		  }

		  /*var custssn='';
		  var custlastFourssn=''; //-- Last four digit
		  if(custssnDetail)
		  {
			  custssn = custssnDetail.replace(/[^a-zA-Z0-9]/g, '');
			  custlastFourssn = custssn.substr(custssn.length - 4);
		  }*/

		  //--Billing Information (other)
		  var trans_type='credit';
		  var currency='US'; //--default
		  var bank_acct_type='Checking' //-- C

		  //--Billing Information (required)
		  var action_code='P';
	      var creditflag =1;
	      var pmt_type='chk';
		  var billing_cycle ='-1'; //-- -1

		  //Dynamic Data
		  var creditfieldsData={
			   parent_id:parentId,
			   sub_id:subId,
			   pmt_type:pmt_type,
			   chk_acct:chk_acct,
			   chk_aba:chk_aba,
			   custname:custname,
			   custemail: custemail,
			   custaddress1: custaddress1,
			   custcity:custcity,
			   custstate:custstate,
			   custzip:custzip,
			   custphone: custphone,
			   //custssn: custlastFourssn,
			   //birth_date:birth_date,
			   initial_amount:initial_amount,
			   billing_cycle:billing_cycle,
			   ip_forward:ipaddr,
			   action_code:action_code,
			   creditflag:creditflag
		  }

		  var queryString = Object.keys(creditfieldsData).map(key => key + '=' + creditfieldsData[key]).join('&');
	      sails.log.info("queryString:::",queryString);

		  request({
			method: 'POST',
			uri:actumApiUrl,
			headers: {
			  'username':actumUsername,
			  'password':actumPasswrod,
			  'syspass':syspass,
			  'Content-Type': 'application/x-www-form-urlencoded'
			},
			//strictSSL: false,
			body: queryString,
			json: true
		  },
		  function(error, response, body) {
			if (error) {
			 	sails.log.error("Actum credit Error :: ", error);
			 	//return reject(error)
				var responseData={
					status: 500,
					apirequest:creditfieldsData,
					apiresponse:{apierror : error }
				}
				return resolve(responseData);
			}
			else
			{
				var type='status';
			    ActumService.getActumJsonOutput(body,type)
				.then(function (finalresponseData) {
			  		 //return resolve(finalresponseData);
					 if(finalresponseData.status=200)
					 {
						 var responseData={
							status: finalresponseData.status,
							apirequest:creditfieldsData,
							apiresponse:finalresponseData.jsonObj
						 }
					 }
					 else
					 {
						 var responseData={
							status: finalresponseData.status,
							apirequest:creditfieldsData,
							apiresponse:{apierror : body }
						 }
					 }
					 return resolve(responseData);
				})
				.catch(function(err) {
					//return reject(err)
					var responseData={
						status: 400,
						apirequest:creditfieldsData,
						apiresponse:{apierror : body }
					}
					return resolve(responseData);
				})
			}
		  });
	});
}

function getDoctorCreditStatus(comissionID,callback){

	return Q.promise(function(resolve, reject) {

		var checkcriteria = { id: comissionID };

		Paymentcomissionhistory
		.findOne(checkcriteria)
		.then(function(historyDetails) {

			if(historyDetails)
			{
				var creditorderID = historyDetails.creditorderID;
				var credithistoryID = historyDetails.credithistoryID;
				var payID = historyDetails.paymentmanagement;

				ActumService.checkActumPaymentStatus(creditorderID)
				.then(function (responseData) {

					sails.log.info("#responseData", responseData);

					var checkStatus=0;
					if(responseData.status==200)
					{
						var checkResponseJson = responseData.jsonObj;
						var checkResponseBillStatus = checkResponseJson.curr_bill_status.toLowerCase();
						var checkResponseBillArray = checkResponseBillStatus.split("-");
						var checkResponseDataTxt ='';
						if(checkResponseBillArray.length>0)
						{
							checkResponseDataTxt = checkResponseBillArray[0];
							checkResponseDataTxt = checkResponseDataTxt.replace(/\s/g,'');
						}
						sails.log.info('checkResponseDataTxt',checkResponseDataTxt);

						//-- Need to check with Actum about status
						//if(checkResponseDataTxt=='settled' || checkResponseDataTxt=='accepted' || checkResponseDataTxt=='success'  )
						if(checkResponseDataTxt=='settled')
						{
							checkStatus=1;
						}
						else if(checkResponseDataTxt=='pending')
						{
							checkStatus=2;
						}
						else if(checkResponseDataTxt=='declined' || checkResponseDataTxt=='failed')
						{
							checkStatus=3;
						}
						else
						{
							checkStatus=4;
						}

						var actumcheckpaymentLogData = {
							 paymentManagement:historyDetails.paymentmanagement,
							 user:historyDetails.user,
							 paymentcomissionhistory: comissionID,
							 historyData: credithistoryID,
							 orderData: creditorderID,
							 responsedata: checkResponseJson,
							 checkStatus: checkStatus,
							 type:'credit'
						}

						Actumcheckpayment.create(actumcheckpaymentLogData)
						.then(function(checkpaymentLogInfo) {

							if(checkStatus==1)
							{
								Paymentcomissionhistory.update({id: comissionID}, {creditrunstatus: 3,creditpaymentstatus:1})
								.exec(function afterwards(err, updated){

									var responseData={
										statusCode:200,
										message:'Credit Payment settled',
										responseData: responseData
									}
									callback(responseData);
								});
							}
							else if(checkStatus==2)
							{
								var responseData={
									statusCode:200,
									message:'Credit Payment Pending',
									responseData: responseData
								}
								callback(responseData);
							}
							else if(checkStatus==3)
							{
								Paymentcomissionhistory.update({id: comissionID}, {creditrunstatus: 4,creditpaymentstatus:2})
								.exec(function afterwards(err, updated){

									var responseData={
										statusCode:200,
										message:'Credit Payment failed',
										responseData: responseData
									}
									callback(responseData);
								});
							}
							else
							{
								var responseData={
									statusCode:200,
									message:'Credit Payment status not known',
									responseData: responseData
								}
								callback(responseData);
							}
						}).catch(function(err) {
							sails.log.error('ActumService#getDoctorCreditStatus :: Error :: Unable to register actum check payment :: ', err);
							var responseData={
								statusCode:400,
								message:'Unable to register actum check credit payment',
								responseData: responseData
							}
							callback(responseData);
						});
					}
					else
					{
						sails.log.error('ActumService#getDoctorCreditStatus :: Error :: Unable to check actum payment status :: ', responseData);
						var responseData={
							statusCode:400,
							message:'Unable to check actum credit payment status',
							responseData: responseData
						}
						callback(responseData);
					}

				}).catch(function(err) {
					sails.log.error('ActumService#getDoctorCreditStatus :: Error :: Unable to check actum payment status :: ', err);
					var responseData={
						statusCode:400,
						message:'Unable to check actum credit payment status'
					}
					callback(responseData);
				});
			}
			else
			{
				sails.log.error('ActumService#getDoctorCreditStatus :: Error :: Invalid comission history details :: ', err);
				var responseData={
					statusCode:400,
					message:'Invalid history details for credit payment'
				}
				callback(responseData);
			}
	   }).catch(function(err) {
	   		sails.log.error('ActumService#getDoctorCreditStatus :: Error :: Unable to fetch comission history details :: ', err);
			var responseData={
				statusCode:400,
				message:'Unable to fetch comission history details for credit payment'
			}
			callback(responseData);
	   });
   });
}

//-- Practice Batch credit schedule payment (ticket no 2878)
//-- Fetch practice batch credit details
function getBatchCreditDetails(comissionDetails,callback){

	return Q.promise(function(resolve, reject) {
		var loopcount=0;
		var forlength = comissionDetails.length;

		if(forlength>0)
		{
			var practiceArray=[];
			var practiceCreditArray = [];
			var totalPracticeCreditAmount = 0;
			_.forEach(comissionDetails, function(comissionData) {

				var practiceId = comissionData.practicemanagement;
				var paybackAmount = comissionData.paybackAmount;
				var comissionamount = comissionData.comissionamount;
				var loanpayID = comissionData.paymentmanagement;

				var objData = {
					comissionId :  comissionData.id,
					orderId: comissionData.orderId,
					paybackAmount: paybackAmount,
					comissionamount: comissionamount,
					loanpayID: loanpayID
				}

				if (!in_array(practiceId, practiceArray))
				{
					practiceArray.push(practiceId);
					practiceCreditArray[practiceId]=[];
					practiceCreditArray[practiceId]['practiceDetails'] = [];
					practiceCreditArray[practiceId]['practiceAmount'] = parseFloat(paybackAmount);
				}
				else
				{
					totalPracticeCreditAmount = parseFloat(practiceCreditArray[practiceId]['practiceAmount']) + parseFloat(paybackAmount);
					totalPracticeCreditAmount = totalPracticeCreditAmount.toFixed(2);
					practiceCreditArray[practiceId]['practiceAmount'] = totalPracticeCreditAmount;

				}
				practiceCreditArray[practiceId]['practiceDetails'].push(objData) ;

				loopcount++;
				if(loopcount==forlength)
				{
					var practiceCreditLength = practiceArray.length;
					//sails.log.info("practiceArray : ",practiceArray);
					//sails.log.info("practiceCreditArray : ",practiceCreditArray);
					//sails.log.info("practiceCreditLength : ",practiceCreditLength);

					if(practiceCreditLength >0)
					{
						var responseData={
							statusCode:200,
							message:'Fetched comission batch details',
							practiceCreditArray: practiceCreditArray,
							practiceArray:practiceArray,
							practiceCreditLength:practiceCreditLength
						}
						callback(responseData);
					}
					else
					{
						var responseData={
							statusCode:400,
							message:'Unable to fetch comission batch details'
						}
						callback(responseData);
					}
				}
			});
		}
		else
		{
			var responseData={
				statusCode:400,
				message:'Invalid comission details'
			}
			callback(responseData);
		}
	});
}

//-- Processing credit towardsr practice in batch
function fundPracticeBatchCreditPayment(processData,callback){

	return Q.promise(function(resolve, reject) {

		var practiceID       = processData.practiceID;
		var practiceAmount   = processData.practiceAmount;
		var practiceDetails  = processData.practiceDetails;
		var IPFromRequest    = processData.IPFromRequest;

		PracticeManagement.findOne({ id: practiceID })
	    .then(function (practiceData) {

			User.getNextSequenceValue('achcredit')
			.then(function(creditRefernceData) {

				var loanCreditID = 'CR_'+creditRefernceData.sequence_value;

				//-- Ach credit history register
				var achlogDescp = 'Cron process practice credit payment for $'+practiceAmount+' for credit reference: '+loanCreditID;
				var achlogData={
					'practicemanagement':practiceID,
					'methodname':achlogDescp,
					'methodtype':1,
					'creditAmount':practiceAmount,
					'loancreditID':loanCreditID,
					'apistatus':0,
					'practiceDetails':practiceDetails
				}
				Achcredithistory.registerAchCredithistory(achlogData)
				.then(function (achcredithistoryData) {

					var achhistoryID = achcredithistoryData.id;

					ActumService.processPracticeCreditPayment(practiceData,practiceAmount,IPFromRequest)
					.then(function(transactionDetail) {

						var creditStatus=0;
						var failure_code='';
						var failure_reason='';
						var authcode='';
						var failuremessage='';

						if(transactionDetail.status==200)
						{
							var creditResponseData = transactionDetail.apiresponse;
							var creditStatusTxt = creditResponseData.status.toLowerCase();

							if("undefined" !== typeof creditResponseData.authcode && creditResponseData.authcode!='' && creditResponseData.authcode!=null)
							{
								authcode =  creditResponseData.authcode;
							}

							if("undefined" !== typeof creditResponseData.reason && creditResponseData.reason!='' && creditResponseData.reason!=null)
							{
								failure_reason =  creditResponseData.reason;
							}

							if(creditStatusTxt=='accepted')
							{
								creditStatus=1;
							}
							else if(creditStatusTxt=='declined')
							{
								creditStatus=2;
								failuremessage= 'Unable to process credit payment: '+failure_reason+' ('+failure_code+' )';
							}
							else if(creditStatusTxt=='verify')
							{
								creditStatus=3;
								failuremessage= 'Unable to process practice credit payment: '+creditStatusTxt;
							}
							else
							{
								creditStatus=4;
								failuremessage='Unable to process practice credit payment: '+failure_reason+' ('+failure_code+' )';
							}
						}
						else if(transactionDetail.status==500)
						{
							creditStatus=4;
							failuremessage='Unable to process practice credit payment';
						}
						else
						{
							creditStatus=4;
							failuremessage='Unable to process practice credit payment';
						}

						achcredithistoryData.apirequest=transactionDetail.apirequest;
						achcredithistoryData.apiresponse=transactionDetail.apiresponse;

						if(creditStatus==1)
						{
							var creditorderID = creditResponseData.order_id;
							var credithistoryID = creditResponseData.history_id;
							var creditauthCode = creditResponseData.authcode;
							var achcreditrunAmount = creditResponseData.initial_amount

							achcredithistoryData.apistatus=transactionDetail.status;
							achcredithistoryData.apiresponsestatus=1;
							achcredithistoryData.achcreditpaymentstatus= 1;
							achcredithistoryData.appfailure = 0;
							achcredithistoryData.appfailuremessage = failuremessage;

							achcredithistoryData.achcredithistoryID= credithistoryID;
							achcredithistoryData.achcreditorderID= creditorderID;
							achcredithistoryData.achcreditauthCode= creditauthCode;
							achcredithistoryData.achcreditrunAmount= achcreditrunAmount;
						}
						else
						{
							achcredithistoryData.apistatus=transactionDetail.status;
							achcredithistoryData.apiresponsestatus=3;
							achcredithistoryData.achcreditpaymentstatus= 3;
							achcredithistoryData.appfailure = 1;
							achcredithistoryData.appfailuremessage = failuremessage;
						}

						achcredithistoryData.save(function(err) {

							if (err) {
								sails.log.error('ActumService#fundPracticeBatchCreditPayment ::Error in updating achcredit history details:: ', err);
								var responseData={
									statusCode:400,
									message:'Unable to process practice credit amount - Achcredithistory update error'
								}
								callback(responseData);
							}

							var updatesuccesscount=0;
							var updatefailurecount=0;
							var updatetotalcount=0;

							asyncLoop(practiceDetails, function (item2, next2){

								updatetotalcount++;

								var practicecomissionId = item2.comissionId;
								var loanpayID = item2.loanpayID;
								var practicepaybackAmount = item2.paybackAmount;

								if(creditStatus==1)
								{
									//--success payment
									var updateValues={
										paymentstatus:2,
										creditrunstatus:2,
										creditorderID:creditorderID,
										credithistoryID:credithistoryID,
										creditauthCode:creditauthCode,
										creditrunAmount:practicepaybackAmount,
										achhistoryID:achhistoryID
									}

									Paymentcomissionhistory.update({ id: practicecomissionId }, updateValues)
									.exec(function afterwards(err, updated){

										if(err){
										  updatefailurecount++;
										  next2();
										}

										PaymentManagement
										.findOne({id: loanpayID})
										.then(function(paymentManagement) {

											if(paymentManagement)
											{
												 if (!paymentManagement.doctorcredittransactions)
												 {
													paymentManagement.doctorcredittransactions = [];
												 }

												 paymentManagement.doctorcredittransactions.push({
													  amount: practicepaybackAmount,
													  loanCreditID: loanCreditID,
													  status:1,
													  creditorderID:creditorderID,
													  credithistoryID:credithistoryID,
													  creditauthCode:creditauthCode,
													  creditrunAmount:practicepaybackAmount,
													  achhistoryID:achhistoryID,
													  transactionType:'Automatic',
													  date: new Date()
												});

												 paymentManagement.save(function(err) {
													updatesuccesscount++;
													next2();
												});
											}
											else
											{
												updatefailurecount++;
												next2();
											}
										}).catch(function(err) {
											updatefailurecount++;
											next2();
										});
									});
								}
								else
								{
									//--failure payment
									var creditfailurecount=0;
									var creditfailuretransactions = [];
									var checkcriteria = { id: practicecomissionId };

									Paymentcomissionhistory
									.findOne(checkcriteria)
									.populate('paymentmanagement')
									.populate('practicemanagement')
									.then(function(historyDetails) {

										if (!historyDetails.creditfailurecount)
										{
											  creditfailurecount = 1;
										}
										else
										{
											 creditfailurecount =parseInt(historyDetails.creditfailurecount)+1;
										}

										if (historyDetails.creditfailuretransactions)
										{
											  creditfailuretransactions = historyDetails.creditfailuretransactions;
										}

										if (historyDetails.creditfailuretransactions)
										{
											  creditfailuretransactions = historyDetails.creditfailuretransactions;
										}

										creditfailuretransactions.push({
											  amount: practicepaybackAmount,
											  loanCreditID: loanCreditID,
											  status:3,
											  failure_code:failure_code,
											  failure_reason:failure_reason,
											  failuremessage:failuremessage,
											  date: new Date()
										});

										//--For failure update
										var updateValues={
											creditfailurecount: creditfailurecount,
											creditfailuretransactions: creditfailuretransactions,
											creditrunstatus:3,
											achhistoryID:achhistoryID
										}

										Paymentcomissionhistory.update({ id: practicecomissionId }, updateValues)
										.exec(function afterwards(err, updated){

											if(err){
											  updatefailurecount++;
											  next2();
											}

											PaymentManagement
											.findOne({id: loanpayID})
											.then(function(paymentManagement) {

												if(paymentManagement)
												{
													 if (!paymentManagement.doctorfailedcreditcount)
													 {
														  paymentManagement.doctorfailedcreditcount = 1;
													 }
													 else
													 {
														 paymentManagement.doctorfailedcreditcount =parseInt(paymentManagement.doctorfailedcreditcount)+1;
													 }

													 if (!paymentManagement.doctorcredittransactions)
													 {
														paymentManagement.doctorcredittransactions = [];
													 }

													 paymentManagement.doctorcredittransactions.push({
															  amount: practicepaybackAmount,
															  loanCreditID: loanCreditID,
															  status:2,
															  failure_code:failure_code,
															  failure_reason:failure_reason,
											  				  failuremessage:failuremessage,
															  date: new Date()
													 });

													 paymentManagement.save(function(err) {
		 												updatesuccesscount++;
														next2();
													 });
												}
												else
												{
													updatefailurecount++;
													next2();
												}
											}).catch(function(err) {
												updatefailurecount++;
												next2();
											});
										});
									}).catch(function(err) {
										updatefailurecount++;
										next2();
									});
								}
							}, function (err){

								var responseData={
									statusCode:200,
									message:'Practice credit payment run successfully',
									practiceID:practiceID,
									practiceAmount: practiceAmount,
									creditStatus:creditStatus,
									updatetotalcount:updatetotalcount,
									updatesuccesscount:updatesuccesscount,
									updatefailurecount:updatefailurecount
								}
								callback(responseData);

							});
						});

					}).catch(function(err) {
					    sails.log.error('ActumService#fundPracticeBatchCreditPayment ::Error in process practice credit amount:: ', err);
					    var responseData={
							statusCode:400,
							message:'Unable to process practice credit amount - Actum Error'
						}
						callback(responseData);
					});
				}).catch(function(err) {
				    sails.log.error('ActumService#fundPracticeBatchCreditPayment ::Error in registerAchCredithistory:: ', err);
				    var responseData={
						statusCode:400,
						message:'Unable to process practice credit amount - Invalid registerAchCredithistory'
					}
					callback(responseData);
				});
			}).catch(function(err) {
				sails.log.error('ActumService#fundPracticeBatchCreditPayment ::Error in getNextSequenceValue:: ', err);
				var responseData={
					statusCode:400,
					message:'Unable to process practice credit amount - Invalid getNextSequenceValue'
				}
				callback(responseData);
			});
		}).catch(function(err) {
			sails.log.error('ActumService#fundPracticeBatchCreditPayment ::Error in invalid practice details:: ', err);
			var responseData={
				statusCode:400,
				message:'Unable to process practice credit amount - Invalid practice details'
			}
			callback(responseData);
		});
	});
}

//-- Check practice batch credit status
function getPracticeBatchCreditStatus(processData,callback){

	return Q.promise(function(resolve, reject) {

		var achcreditID = processData.id;
		var achcreditorderID = processData.achcreditorderID;
		var achcredithistoryID = processData.achcredithistoryID;
		var practiceDetails = processData.practiceDetails;

		ActumService.checkActumPaymentStatus(achcreditorderID)
		.then(function (creditresponseData) {

			var checkStatus=0;
			if(creditresponseData.status==200)
			{
				var checkResponseJson = creditresponseData.jsonObj;
				var checkResponseBillStatus = checkResponseJson.curr_bill_status.toLowerCase();
				var checkResponseBillArray = checkResponseBillStatus.split("-");
				var checkResponseDataTxt ='';
				if(checkResponseBillArray.length>0)
				{
					checkResponseDataTxt = checkResponseBillArray[0];
					checkResponseDataTxt = checkResponseDataTxt.replace(/\s/g,'');
				}
				sails.log.info('checkResponseDataTxt',checkResponseDataTxt);

				if(checkResponseDataTxt=='pending')
				{
					//-- set to run checking credit cron again
					checkStatus=1;
				}
				else if(checkResponseDataTxt=='settled')
				{
					checkStatus=2;
				}
				else if(checkResponseDataTxt=='declined' || checkResponseDataTxt=='failed' || checkResponseDataTxt=='returned')
				{
					checkStatus=3;
				}
				else
				{
					//-- set to run checking credit cron again
					checkStatus=1;
				}

				var actumcheckpaymentLogData = {
					 achcredithistory: achcreditID,
					 historyData: achcredithistoryID,
					 orderData: achcreditorderID,
					 responsedata: checkResponseJson,
					 checkStatus: checkStatus,
					 type:'credit'
				}

				Actumcheckpayment.create(actumcheckpaymentLogData)
				.then(function(checkpaymentLogInfo) {

					var updateValues={achcreditpaymentstatus:checkStatus};

					Achcredithistory.update({id: achcreditID}, updateValues)
					.exec(function afterwards(err, updated){

						if(checkStatus==1)
						{
							var responseData={
								statusCode:400,
								message:'Credit Payment Pending',
								creditresponseData: creditresponseData
							}
						}
						else if(checkStatus==2)
						{
							var responseData={
								statusCode:200,
								message:'Credit Payment Settled',
								creditresponseData: creditresponseData
							}
						}
						else if(checkStatus==3)
						{
							var responseData={
								statusCode:500,
								message:'Credit Payment Failed',
								creditresponseData: creditresponseData
							}
						}
						else
						{
							var responseData={
								statusCode:400,
								message:'Invalid Credit Payment Status ',
								responseData: responseData
							}
						}

						var updatesuccesscount=0;
						var updatefailurecount=0;
						var updatetotalcount=0;

						if( checkStatus==2 || checkStatus==3 )
						{
							var updatecomissionValues ;
							if(checkStatus==2)
							{
								var updatecomissionValues = { creditpaymentstatus:1};
							}

							if(checkStatus==3)
							{
								var updatecomissionValues = { creditpaymentstatus:2};
							}

							asyncLoop(practiceDetails, function (item2, next2){

								updatetotalcount++;
								var practicecomissionId = item2.comissionId;

								Paymentcomissionhistory.update({ id: practicecomissionId }, updatecomissionValues)
								.exec(function afterwards(err, updated){

									if(err){
									  updatefailurecount++;
									  next2();
									}

									updatesuccesscount++;
									next2();
								});
							}, function (err){
								responseData.updatetotalcount=updatetotalcount;
								responseData.updatesuccesscount=updatesuccesscount;
								responseData.updatefailurecount=updatefailurecount;
								callback(responseData);
							});
						}
						else
						{
							responseData.updatetotalcount=updatetotalcount;
							responseData.updatesuccesscount=updatesuccesscount;
							responseData.updatefailurecount=updatefailurecount;
							callback(responseData);
						}
					});

				}).catch(function(err) {
					sails.log.error('ActumService#getPracticeBatchCreditStatus :: Error :: Unable to register actum check payment :: ', err);
					var responseData={
						statusCode:400,
						message:'Unable to register actum check credit payment',
						responseData: responseData
					}
					callback(responseData);
				});
			}
			else
			{
				sails.log.error('ActumService#getPracticeBatchCreditStatus :: Error :: Unable to check actum payment status :: ', responseData);
				var responseData={
					statusCode:400,
					message:'Unable to check actum credit payment status',
					creditresponseData: creditresponseData
				}
				callback(responseData);
			}
		}).catch(function(err) {
			sails.log.error('ActumService#getPracticeBatchCreditStatus :: Error :: Unable to check actum payment status :: ', err);
			var responseData={
				statusCode:400,
				message:'Unable to check actum credit payment status',
				creditresponseData:[]
			}
			callback(responseData);
		});
	});
}
