"use strict";

var request = require('request'),
  Q = require('q'),
  _ = require('lodash'),
  moment = require('moment');

var fs = require('fs');
var config = sails.config;
var stripe = require("stripe")(sails.config.stripeSecretKey);

module.exports = {
  monthlyRecurringProcess: monthlyRecurringProcess
};

function monthlyRecurringProcess(practicedata,callback){

	var stripeSaasFee = practicedata.stripeSaasFee;
	var customerID = practicedata.customerID;

	var stripechargeRequest={
		amount: stripeSaasFee,
		currency: "usd",
		customer: customerID,
		description: sails.config.lender.shortName + " - Monthly Service Fee"
	}

	//--For testing
	/*var responseData={
		statusCode:200,
		message:'success',
		stripechargeRequest:stripechargeRequest,
	}
	callback(responseData);*/


	stripe.charges.create(stripechargeRequest, function(err, stripechargeResponse) {

		var stripestatus=0;
		var statusCode='';
		var statusMessage='';
		var failure_code='';
		var failure_message='';
		if(err)
		{
			stripestatus=4;
			statusCode=400;
			statusMessage='Payment failed';

			var stripechargeResponse	=	err;
			if(err.error)
			{
				var errorData				=	err.error;
				failure_code				=	errorData.code+" ("+errorData.decline_code+")";
				failure_message				=	errorData.message
			}

			var responseData={
				statusCode:statusCode,
				message:statusMessage,
				stripechargeRequest:stripechargeRequest
			}
		}
		else
		{

			if("undefined" !== typeof stripechargeResponse.failure_code && stripechargeResponse.failure_code!='' && stripechargeResponse.failure_code!=null)
			{
				failure_code =  stripechargeResponse.failure_code;
			}

			if("undefined" !== typeof stripechargeResponse.failure_message && stripechargeResponse.failure_message!='' && stripechargeResponse.failure_message!=null)
			{
				failure_message =  stripechargeResponse.failure_message;
			}

			if(stripechargeResponse.status=='succeeded')
			{
				stripestatus=1;
				statusCode=200;
			}

			if(stripechargeResponse.status=='pending')
			{
				stripestatus=2;
				statusCode=300;
			}

			if(stripechargeResponse.status=='failed')
			{
				stripestatus=3;
				statusCode=400;
			}
			statusMessage='Payment '+stripechargeResponse.status;

			var responseData={
				statusCode:statusCode,
				message:statusMessage,
				stripechargeRequest:stripechargeRequest,
				stripechargeResponse:stripechargeResponse
			}
		}

		//-- For Stripe history
		var stripelogData={
			practicemanagement: practicedata.id,
			stripeAmount:stripeSaasFee,
			stripeToken:practicedata.stripe_token,
			stripecustomerId:practicedata.customerID,
			stripechargeId:practicedata.chargeID,
			stripecardId:practicedata.stripecardID,
			chargeRequest:stripechargeRequest,
			chargeResponse:stripechargeResponse,
			chargetype:'recurring',
			stripestatus:stripestatus
		}

		Stripehistory.registerStripehistory(stripelogData)
	    .then(function (stripehistoryData) {

			var practicecriteria={
				id: practicedata.id
				//isDeleted: false
			}

			PracticeManagement
   		    .findOne(practicecriteria)
		    .then(function(practiceInfo) {

				if(practiceInfo)
				{
					if (!practiceInfo.payments)
					{
					  practiceInfo.payments = [];
					}

					//--Stripe charage success
					if(stripestatus==1)
					{
						//var validityDate = moment(practiceInfo.validityDate).startOf('day').add(1, 'months').toDate();
						//var validityDate = moment().startOf('day').add(1, 'months').toDate();

						//--Ticket no 2891 starts here
						var nextmonthStartDate = moment().add(1,'months').startOf('month').format('MM-DD-YYYY');
						var nextmonthnoofdays	=	moment(nextmonthStartDate).daysInMonth();
						var practicedate	=	moment(practiceInfo.createdAt).date();

						if(practicedate=='1')
						{
							var paymentDays = 0;
						}
						else
						{
							var paymentDays = moment(practiceInfo.createdAt).subtract(1, 'days').date();
							if(paymentDays > nextmonthnoofdays)
							{
								paymentDays	=	nextmonthnoofdays;
							}
						}

						if(paymentDays==0)
						{
							var validityDate = moment(nextmonthStartDate).startOf('day').toDate();
						}
						else
						{
							var validityDate = moment(nextmonthStartDate).startOf('day').add(paymentDays, 'days').toDate();
						}
						//--Ticket no 2891 ends here

						practiceInfo.failedattemptcount=0;
						practiceInfo.validityDate = validityDate;
						practiceInfo.payments.push({
							  amount: stripechargeResponse.amount,
							  paymentstatus:stripestatus,
							  chargeId:stripechargeResponse.id,
							  historyId:stripehistoryData.id,
							  previousValidityDate:practiceInfo.validityDate,
							  newvalidityDate:validityDate,
							  transactionType:'Recurring',
							  date: new Date()
						});
					}
					else
					{
						//--Stripe charge pending
						if(stripestatus==2)
						{
							if (!practiceInfo.pendingcount)
							{
								practiceInfo.pendingcount = parseInt(practiceInfo.pendingcount)+1;
							}
							else
							{
								practiceInfo.pendingcount=1;
							}
						}

						//-- Stripe charge failed
						if(stripestatus==3 || stripestatus==4 )
						{
							if (!practiceInfo.failedattemptcount)
							{
								practiceInfo.failedattemptcount = parseInt(practiceInfo.failedattemptcount)+1;
							}
							else
							{
								practiceInfo.failedattemptcount=1;
							}
						}

						practiceInfo.payments.push({
							  amount: stripeSaasFee,
							  paymentstatus:stripestatus,
							  historyId:stripehistoryData.id,
							  failure_code:failure_code,
							  failure_message:failure_message,
							  previousValidityDate:practiceInfo.validityDate,
							  transactionType:'Recurring',
							  date: new Date()
						});
					}
					practiceInfo.save(function(err) {
						if (err) {
							 responseData.statusCode=500;
			  				 responseData.message='Unable to save payment details';
						}
						callback(responseData);
					});
				}
				else
				{
				   responseData.statusCode=500;
				   responseData.message='Invalid practice details';
				   callback(responseData);
				}
			})
			.catch(function(err) {
			   responseData.statusCode=500;
			   responseData.message='Unable to update practice payments';
			   callback(responseData);
			})
		})
		.catch(function (err) {
			   responseData.statusCode=500;
			   responseData.message='Unable to create stripe history';
			   callback(responseData);
		})
	});
}