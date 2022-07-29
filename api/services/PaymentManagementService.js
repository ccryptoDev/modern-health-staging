"use strict";

var request = require('request'),
  moment = require('moment'),
  _ = require('lodash'),
  Q = require('q');
 
var fs = require('fs');

module.exports = {
  filterActumDebitPaymentData:filterActumDebitPaymentData
};


function filterActumDebitPaymentData(paymentManagementDetail,actumrecurringdebit){
	
	return Q.promise(function(resolve, reject) {
				
		var loopcount=0;
		var forlength = paymentManagementDetail.length;
		var todaysDate = moment().startOf('day').toDate().getTime();
		var nextMonthDate = moment().add(1, "months").startOf('day').toDate().getTime();
		
		var paymentArray=[];
		_.forEach(paymentManagementDetail, function(paymentDetail) {
													
													
			var paymentlogData ='Payment ID:  '+paymentDetail.id+' \n';
			paymentlogData +='Loan Reference: '+paymentDetail.loanReference+' \n';
		    paymentlogData +='Loan status: '+paymentDetail.status+' \n';
			paymentlogData +='Loan maturityDate: '+paymentDetail.maturityDate+' \n';
		    paymentlogData +='Loan payOffAmount: '+paymentDetail.payOffAmount+' \n';
			
			fs.appendFileSync( actumrecurringdebit, paymentlogData);
			
			var allowDebitPayment=0;
			if (paymentDetail.status == 'CURRENT' || paymentDetail.status == 'OPENED' || paymentDetail.status == 'LATE') 
			{
				  var maturityDate = moment(paymentDetail.maturityDate).startOf('day').toDate().getTime();	
				  
				  _.forEach(paymentDetail.paymentSchedule, function(schedule) {
						
						if(allowDebitPayment==0)
						{
							if(schedule.status != 'PAID OFF')
							{
								var scheduledDate = moment(schedule.date).startOf('day').toDate().getTime();
								
								/*sails.log.info("loanReference::",paymentDetail.loanReference);
								sails.log.info("todaysDate:",todaysDate);
								sails.log.info("scheduledDate::",scheduledDate);
								sails.log.info("maturityDate:",maturityDate);*/
							
								if (todaysDate == scheduledDate &&  todaysDate <= maturityDate)
								{
								  //sails.log.info("Enter allow loop::",todaysDate,scheduledDate,maturityDate);
								  allowDebitPayment=1;
								  paymentArray.push(paymentDetail);
								}	
								else
								{
									//fs.appendFileSync( actumrecurringdebit, 'not today date \n');
									//sails.log.info("Enter not today date::");
								}
							}
							else
							{
								//fs.appendFileSync( actumrecurringdebit, 'scheduled paid \n');
								//sails.log.info("Enter paid off loop::");
							}
						}
						
						//sails.log.info("----------------------------------");
				  });
			}
			
			//sails.log.info("Loan allowDebitPayment::",allowDebitPayment);
			//sails.log.info("======================================");
			
			var forlooplogData ='Loan allowDebitPayment: '+allowDebitPayment+' \n';
			forlooplogData += '-----------------------------------------------\n\n';
			fs.appendFileSync( actumrecurringdebit, forlooplogData);
			
			loopcount++;
			
			if(loopcount==forlength)
			{
				 return resolve(paymentArray);
			}
	   });
	});
}


