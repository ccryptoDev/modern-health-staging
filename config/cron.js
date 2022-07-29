'use strict';
var momentBusiness = require('moment-business-days');
var moment = require('moment');
var request = require('request');
var ip = require("ip");

module.exports.cron = {
    getAllStripeRecurringPayment:{
	   schedule: '00 00 06 * * *',
	   //schedule: '00 */20 * * * *',
	   //schedule: '5 * * * * *',
       onTick: function(){
         sails.log.info("getAllStripeRecurringPayment scheduler");
         //CronService.getAllStripeRecurringPayment()
       }
    },
	getAllActumDebitPayment:{
	   schedule: '00 00 07 * * *',
	   //schedule: '00 */5 * * * *',
	   //schedule: '5 * * * * *',
       onTick: function(){
		 var serveripAddress = ip.address();
		 sails.log.info("getAllActumDebitPayment scheduler",serveripAddress);
         //CronService.getAllActumDebitPayment(serveripAddress)
       }
    },
	checkLenderCreditStatus:{
	   schedule: '0 0 */8 * * *',
	   //schedule: '5 * * * * *',
       onTick: function(){
         sails.log.info("checkLenderCreditStatus scheduler");
         //CronService.checkLenderCreditStatus()
       }
    },
	getAllDoctorCreditPayment:{
		 schedule: '00 00 09 10 * *',
	   //schedule: '00 10 12 * * *',
	   //schedule: '00 25 14 * * *',
	   //schedule: '00 */5 * * * *',
	   //schedule: '5 * * * * *',
       onTick: function(){
		 var ipAddress = ip.address();
         sails.log.info("getAllDoctorCreditPayment scheduler",ipAddress);
         //CronService.getAllDoctorCreditPayment(ipAddress)
       }
    },
	checkDoctorCreditPaymentStatus:{
	   schedule: '0 0 */8 * * *',
	   //schedule: '5 * * * * *',
       onTick: function(){
         sails.log.info("checkDoctorCreditPaymentStatus scheduler");
         //CronService.checkDoctorCreditPaymentStatus()
       }
    },
	getNewIncompleteApplication:{
	   schedule: '00 */30 * * * *',
       onTick: function(){
         sails.log.info("getNewIncompleteApplication scheduler");
         //CronEmailService.getNewIncompleteApplication()
       }
    },
	getTodayProcedureLoanAction:{
	   schedule: '00 00 10 * * *',
       onTick: function(){
         sails.log.info("getTodayProcedureLoanAction scheduler");
         //CronEmailService.getTodayProcedureLoan()
       }
    },
	sendEmailtoPracticeAdmin:{
	  schedule: '00 00 */20 * * *',
       onTick: function(){
         sails.log.info("sendEmailtoPracticeAdmin scheduler");
         //CronEmailService.sendEmailtoPracticeAdmin()
       }
		},
		archiveIncompleteApplications:{
			schedule: '00 00 07 * * *',
				onTick: function(){
					sails.log.info("Archived Incomplete Applications older than 180 Days");
					CronService.archiveIncompleteApplications();
				}
			},
			expiredUsersDenied:{
				schedule: '00 00 07 * * *',
					onTick: function(){
						sails.log.info("expiredUsersDenied");
						CronService.expiredUsersDenied();
					}
				},
			sendProcedureConfirmedEmail:{
				schedule: '00 00 08 * * *',
					onTick: function(){
					sails.log.info("sendProcedureConfirmedMailer");
					CronEmailService.sendProcedureConfirmedMailer();
					}
				},
};
