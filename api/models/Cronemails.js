/**
 * Cronemails.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
var moment = require('moment');
var in_array = require('in_array');

module.exports = {
	attributes: {
		user: {
			model: 'User'
		},
		practicemanagement: {
		  	model: 'PracticeManagement'
		},
		paymentmanagement: {
		  	model: 'PaymentManagement'
		},
		screentracking: {
		  	model: 'Screentracking'
		},
		sourceType: {
		  	type: "string"
 		},
		mailType: {
		  	type: "string"
 		},
		reason: {
			type: "string"
 		},
		applicationCreated: {
			type: 'date'
 		},
		failurecount: {
			type: 'integer',
      		defaultsTo: 0
 		},
		totalmailcount: {
			type: 'integer',
      		defaultsTo: 0
 		},
		processstatus: {
			type: 'integer',
      		defaultsTo: 0
 		},
  	},

	createCronEmail:createCronEmailProcess,
	getCronEmailData:getCronEmailDataProcess,
	registerIncompleteApplication:registerIncompleteApplication,
	registerProcedureApplication:registerProcedureApplication,
	sendPracticeCronEmail:sendPracticeCronEmailProcess
};

function createCronEmailProcess(cronEmailData) {
    return Q.promise(function (resolve, reject) {
        //sails.log.info("cronEmailData:",cronEmailData);
        Cronemails.create(cronEmailData)
		.then(function (loansettingsRes) {
           return resolve({statuscode:200,message: 'cronemail created'});
		})
		.catch(function (err) {
			sails.log.error('#createCronEmailProcess :: err', err);
			return resolve({statuscode:400,message: err});
		});
    });
}

function registerIncompleteApplication(screenid)
{
	 return Q.promise(function(resolve, reject) {

		    Screentracking
			.findOne({id:screenid})
			.populate('practicemanagement')
			.populate('user')
			.then(function(screenResult) {

				var userDetails = screenResult.user;
				var practicemanagement = screenResult.practicemanagement;

				var sourceType	=	'';
				if("undefined" !== typeof screenResult.applicationType && screenResult.applicationType!='' && screenResult.applicationType!=null )
				{
					sourceType	=	screenResult.applicationType;
				}
				else
				{
					sourceType	=	"No data";
				}

				var cronEmailData	=	{
					user:userDetails.id,
					practicemanagement: practicemanagement.id,
					screentracking:screenResult.id,
					sourceType:sourceType,
					mailType:'Incomplete',
					reason:screenResult.lastScreenName,
					applicationCreated:screenResult.createdAt
				};

				Cronemails.createCronEmail(cronEmailData)
				.then(function(insertDetails) {

					Screentracking.update({id:screenid}, {incompleteEmailSent: 1}).exec(function afterwards(err, updated){
						return resolve({statuscode:200,message: 'cronemail created'});
					})
				})
				.catch(function (err) {
					sails.log.error('#registerIncompleteApplication :: err', err);
					return resolve({statuscode:400,message: err});
				});
			})
			.catch(function (err) {
				sails.log.error('#registerIncompleteApplication :: err', err);
				return resolve({statuscode:400,message: err});
			});
	 });
}

function getCronEmailDataProcess(payid)
{
	var payCriteria	=	{id:payid};
	PaymentManagement
	.findOne(payCriteria)
	.populate('user')
	.populate('practicemanagement')
	.populate('screentracking')
 	.then(function(payResults) {

		var userid				=	payResults.user.id;
		var practicemanagement	=	payResults.practicemanagement.id;
 		var screenid			=	payResults.screentracking.id;

		var sourceType			=	'';
		if("undefined" !== typeof payResults.screentracking.applicationType && payResults.screentracking.applicationType!='' && payResults.screentracking.applicationType!=null )
		{
			sourceType	=	payResults.screentracking.applicationType;
		}
		else
		{
			sourceType	=	"No data";
		}

		var applicationCreated	=	payResults.createdAt;

		var cronEmailData	=	{
			user:userid,
			practicemanagement:practicemanagement,
			paymentmanagement:payid,
			screentracking:screenid,
			sourceType:sourceType,
			mailType:'Pending',
			reason:'Pending application',
			applicationCreated:applicationCreated
		};
		Cronemails.createCronEmail(cronEmailData);
   	});
}

function registerProcedureApplication(payid)
{
	 return Q.promise(function(resolve, reject) {

		var payCriteria	=	{id:payid};
		PaymentManagement
		.findOne(payCriteria)
		.populate('user')
		.populate('practicemanagement')
		.populate('screentracking')
		.then(function(payResults) {

			var userid				=	payResults.user.id;
			var practicemanagement	=	payResults.practicemanagement.id;
			var screenid			=	payResults.screentracking.id;

			var sourceType			=	'';
			if("undefined" !== typeof payResults.screentracking.applicationType && payResults.screentracking.applicationType!='' && payResults.screentracking.applicationType!=null )
			{
				sourceType	=	payResults.screentracking.applicationType;
			}
			else
			{
				sourceType	=	"No data";
			}

			var applicationCreated	=	payResults.createdAt;

			var cronEmailData	=	{
				user:userid,
				practicemanagement:practicemanagement,
				paymentmanagement:payid,
				screentracking:screenid,
				sourceType:sourceType,
				mailType:'ProcedureDate',
				reason:'Pending Procedure Date',
				applicationCreated:applicationCreated
			};

			Cronemails.createCronEmail(cronEmailData)
			.then(function(insertDetails) {

				return resolve({statuscode:200,message: 'cronemail created'});
			})
			.catch(function (err) {
				sails.log.error('#registerProcedureApplication :: err', err);
				return resolve({statuscode:400,message: err});
			});
		})
		.catch(function (err) {
			sails.log.error('#registerProcedureApplication :: err', err);
			return resolve({statuscode:400,message: err});
		});
	 });
}
function sendPracticeCronEmailProcess(cronemailData,callback)
{
	return Q.promise(function(resolve, reject) {
		var cronemailid			=	cronemailData.id
		var practiceID			=	cronemailData.practicemanagement;
		PracticeManagement
		.findOne({id:practiceID})
		.then(function(practiceMntdetails) {
			var pmemail				=	practiceMntdetails.PracticeEmail;
			var pmcontactname		=	practiceMntdetails.ContactName;

			var	totalPracticeAdmin	=	0;
			var practiceoptions	=	{
				practicemanagement: practiceID
			};
			PracticeUser
			.find(practiceoptions)
			.then(function(practiceuserResults) {
				sails.log.info('practiceuserResults:: ', practiceuserResults);
				if(practiceuserResults.length>0)
				{
					var totalPracticeAdmin	=	practiceuserResults.length
					// var practiceEmails 		=	[];
					// _.forEach(practiceuserResults, function(practiceuser) {
					// 	var practiceAdminemail	=	practiceuser.email;
					// 	if( (!in_array(practiceAdminemail, practiceEmails)) && (!in_array(pmemail, practiceEmails)) )
					// 	{
					// 		practiceEmails.push(practiceAdminemail);
					// 	}
					// });


					// var bccEmails	=	practiceEmails.join();
					var bccEmails = [ "pfi.practice@trustalchemy.com" ].join();
					var emailData	=	{
						bccEmails:bccEmails,
						toEmail:pmemail,
						contactName:pmcontactname,
						cronemailData:cronemailData
					}
					if(cronemailData.mailType == 'Incomplete')
					{
						var	criteria	=	{id:cronemailData.screentracking};
 						Screentracking.findOne(criteria)
						.populate('user')
						.then(function(applicationData) {
							emailData.applicationData	=	applicationData;
							EmailService.emailNotificationtoPracticeUsers(emailData);
						});
					}
					else if(cronemailData.mailType == 'Pending' || cronemailData.mailType == 'Declined' ||  cronemailData.mailType == 'ProcedureDate' )
					{
						var	criteria	=	{id:cronemailData.paymentmanagement};

						PaymentManagement.findOne(criteria)
						.populate('user')
						.populate('screentracking')
						.then(function(applicationData) {
							emailData.applicationData	=	applicationData;
							EmailService.emailNotificationtoPracticeUsers(emailData);
						});
					}
					Cronemails.update({id: cronemailid}, {processstatus: 1,totalmailcount:totalPracticeAdmin})
					.exec(function afterwards(err, userupdated){
						return resolve({statuscode:200,message: 'Practice email sent.'});
					});
				}
				else
				{
					Cronemails.update({id: cronemailid}, {processstatus: 1,totalmailcount:0})
					.exec(function afterwards(err, userupdated){
						return resolve({statuscode:200,message: 'Practice email sent.'});
					});
				}
			}).catch(function (err) {
				err	+=	" Cronemail id: "+cronemailid;
				err	+=	" Practice id: "+practiceID;
				sails.log.error('#sendPracticeCronEmailProcess :: err', err);
				return resolve({statuscode:400,message: err});
			});
		})
		.catch(function (err) {
			err	+=	" Cronemail id: "+cronemailid;
			err	+=	" Practice id: "+practiceID;
			sails.log.error('#sendPracticeCronEmailProcess :: err', err);
			return resolve({statuscode:400,message: err});
		});
	});
}