"use strict";

const request = require( "request" );
const Q = require( "q" );
const _ = require( "lodash" );
const moment = require( "moment" );

const fs = require( "fs" );

module.exports = {
	getNewIncompleteApplication: getNewIncompleteApplicationAction,
	getTodayProcedureLoan: getTodayProcedureLoanAction,
	sendEmailtoPracticeAdmin: sendEmailtoPracticeAdminAction,
	sendProcedureConfirmedMailer:sendProcedureConfirmedMailer,
};

function getNewIncompleteApplicationAction() {
	return Q.promise( function( resolve, reject ) {
		const getincompletecronPath =
			sails.config.appPath +
			"/cronemailservice/" +
			"newincompletecron_" +
			moment().format( "MM-DD-YYYY" ) +
			".txt";
		const checkCreatedDate = moment()
		.subtract( 1, "hour" )
		.toDate()
		.getTime();
		const criteria = {
			iscompleted: 0,
			incompleteEmailSent: { $eq: 0, $exists: true },
			createdAt: { $lte: new Date( checkCreatedDate ), $exists: true }
			// createdAt :  { $lte: new Date(ISODate().getTime() - 1000 * 60 * 60)}
		};
		Screentracking.find( criteria )
		.sort( "createdAt ASC" )
		.then( function( screentrackingdetails ) {
			const incompleteCount = screentrackingdetails.length;
			sails.log.info(
				"getNewIncompleteApplication count value : ",
				incompleteCount
			);

			const currentDateTime = moment().format( "MMMM Do YYYY, h:mm:ss a" );
			let initialData = "\n\nIncomplete cron called\n";
			initialData += "Cron time: " + currentDateTime + " \n";
			initialData += "Incomplete count: " + incompleteCount + " \n";
			initialData += "************************************************\n\n";
			fs.appendFileSync( getincompletecronPath, initialData );

			if( incompleteCount > 0 ) {
				let loopcount = 0;
				_.forEach( screentrackingdetails, function( screentrackingdata ) {
					let appendData = "";
					appendData += "Screentracking ID: " + screentrackingdata.id + " \n";
					appendData +=
							"Reference Number: " +
							screentrackingdata.applicationReference +
							" \n";
					fs.appendFileSync( getincompletecronPath, appendData );

					Cronemails.registerIncompleteApplication(
						screentrackingdata.id,
						function( results ) {
							fs.appendFileSync(
								getincompletecronPath,
								"Loopcount :" + loopcount + "\n"
							);
							fs.appendFileSync(
								getincompletecronPath,
								"Register Response :" + JSON.stringify( results ) + "\n"
							);

							const looplogData =
									"------------------------------------------------------------\n\n";
							fs.appendFileSync( getincompletecronPath, looplogData );

							loopcount++;
							if( loopcount == incompleteCount ) {
								const finalData =
										"==============================================================\n\n";
								fs.appendFileSync( getincompletecronPath, finalData );
								return resolve( {
									statuscode: 200,
									message: "Incomplete count::" + incompleteCount
								} );
							}
						}
					);
				} );
			} else {
				return resolve( {
					statuscode: 200,
					message: "No incomplete:: count::" + incompleteCount
				} );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "#getNewIncompleteApplication :: err", err );
			return resolve( { statuscode: 400, message: err } );
		} );
	} );
}

function getTodayProcedureLoanAction() {
	return Q.promise( function( resolve, reject ) {
		const todayprocedurecronPath =
			sails.config.appPath +
			"/cronemailservice/" +
			"todayprocedureloan_" +
			moment().format( "MM-DD-YYYY" ) +
			".txt";
		const checktodaysDate = moment()
		.tz( "America/Los_Angeles" )
		.startOf( "day" )
		.format( "MM-DD-YYYY" );

		const payoptions = {
			status: "OPENED",
			isPaymentActive: true,
			achstatus: { $eq: 0, $exists: true },
			loanSetdate: { $eq: new Date( checktodaysDate ), $exists: true }
		};

		PaymentManagement.find( payoptions )
		.then( function( paymentManagementDetail ) {
			const todayProcedureCount = paymentManagementDetail.length;
			sails.log.info(
				"getTodayProcedureLoan count value : ",
				todayProcedureCount
			);

			const currentDateTime = moment().format( "MMMM Do YYYY, h:mm:ss a" );
			let initialData = "\n\nIncomplete cron called\n";
			initialData += "Cron time: " + currentDateTime + " \n";
			initialData += "Today Procedure count: " + todayProcedureCount + " \n";
			initialData += "************************************************\n\n";
			fs.appendFileSync( todayprocedurecronPath, initialData );

			if( todayProcedureCount > 0 ) {
				let loopcount = 0;
				_.forEach( paymentManagementDetail, function( paymentdata ) {
					let appendData = "";
					appendData += "PayID: " + paymentdata.id + " \n";
					appendData +=
							"Loan Reference: " + paymentdata.loanReference + " \n";
					fs.appendFileSync( todayprocedurecronPath, appendData );

					Cronemails.registerProcedureApplication( paymentdata.id, function(
						results
					) {
						fs.appendFileSync(
							todayprocedurecronPath,
							"Loopcount :" + loopcount + "\n"
						);
						fs.appendFileSync(
							todayprocedurecronPath,
							"Register Response :" + JSON.stringify( results ) + "\n"
						);

						const looplogData =
								"------------------------------------------------------------\n\n";
						fs.appendFileSync( todayprocedurecronPath, looplogData );

						loopcount++;
						if( loopcount == todayProcedureCount ) {
							const finalData =
									"==============================================================\n\n";
							fs.appendFileSync( todayprocedurecronPath, finalData );
							return resolve( {
								statuscode: 200,
								message: "Today procedure count::" + todayProcedureCount
							} );
						}
					} );
				} );
			} else {
				return resolve( {
					statuscode: 200,
					message: "No today procedure:: count::" + todayProcedureCount
				} );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "#getTodayProcedureLoan :: err", err );
			return resolve( { statuscode: 400, message: err } );
		} );
	} );
}
function sendEmailtoPracticeAdminAction() {
	return Q.promise( function( resolve, reject ) {
		const practiceemailcronPath =
			sails.config.appPath +
			"/cronemailservice/" +
			"practiceemail_" +
			moment().format( "MM-DD-YYYY" ) +
			".txt";
		const currentDateTime = moment().format( "MMMM Do YYYY, h:mm:ss a" );
		const limit = 20;

		const cronoptions = {
			processstatus: 0
		};

		Cronemails.find( cronoptions )
		.sort( "createdAt DESC" )
		.limit( limit )
		.then( function( cronemailResults ) {
			const cronmailCount = cronemailResults.length;
			let initialData = "\nPractice email cron called\n";
			initialData += "Cron time: " + currentDateTime + " \n";
			initialData += "Today cron email count: " + cronmailCount + " \n";
			initialData += "************************************************\n\n";
			fs.appendFileSync( practiceemailcronPath, initialData );

			if( cronmailCount > 0 ) {
				let loopcount = 0;
				_.forEach( cronemailResults, function( crondata ) {
					Cronemails.sendPracticeCronEmail( crondata, function(
						cronemailResponse
					) {
						loopcount++;

						let appendData = "";
						appendData += "Cron loopcount: " + loopcount + " \n";
						appendData += "CronPracticeEmail ID: " + crondata.id + " \n";
						appendData +=
								"CronPracticeEmail Response Message: " +
								cronemailResponse.message +
								" \n";
						appendData +=
								"CronPracticeEmail Response: " +
								JSON.stringify( cronemailResponse ) +
								" \n";
						appendData +=
								"************************************************\n\n";
						fs.appendFileSync( practiceemailcronPath, appendData );

						if( loopcount == cronmailCount ) {
							const finalData =
									"==============================================================\n\n";
							fs.appendFileSync( practiceemailcronPath, finalData );
							return resolve( {
								statuscode: 200,
								message: "All email process are completed"
							} );
						}
					} );
				} );
			} else {
				return resolve( {
					statuscode: 200,
					message: "No mail count::" + cronmailCount
				} );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "#sendEmailtoPracticeAdmin :: err", err );
			return resolve( { statuscode: 400, message: err } );
		} );
	} );
}
function sendProcedureConfirmedMailer(firstDay = new Date(), fifthDay=new Date()) {
	const startDay1 = moment(firstDay).tz( "UTC" ).startOf( "day" ).subtract( 1, "days" ).toDate();
	const endDay1 = moment(firstDay).tz( "UTC" ).endOf( "day" ).subtract( 1, "days" ).toDate();
	const startDay5 = moment(fifthDay).tz( "UTC" ).startOf( "day" ).subtract( 5, "days" ).toDate();
	const endDay5 = moment(fifthDay).tz( "UTC" ).endOf( "day" ).subtract( 5, "days" ).toDate();
	sails.log.debug( "getProcedureConfirmMailingList-start_day_1:", startDay1 );
	sails.log.debug( "getProcedureConfirmMailingList-end_day_1:", endDay1 );
	sails.log.debug( "getProcedureConfirmMailingList-start_day_5:", startDay5 );
	sails.log.debug( "getProcedureConfirmMailingList-end_day_5:", endDay5 );
	const criteria = {
		$and: [
			{ procedureWasConfirmed: 1 },
			{ status: { $nin: [ "DENIED", "ARCHIVED" ] } },
			{ procedureConfirmedDate: { $ne: "", $exists: true } },
			{	$or: [
					{ procedureConfirmedDate: { $gte: startDay1, $lt: endDay1 } },
					{ procedureConfirmedDate: { $gte: startDay5, $lt: endDay5 } }
				]}
		]
	};
	return PaymentManagement.find( criteria )
	.populate( "user" )
	.populate( "practicemanagement")
	.populate( 'account' )
	.then( async ( contracts ) => {
		sails.log.debug( "procedureConfirmedMailer", contracts.length );
			for (const contract of contracts) {
				const paymentmanagement = _.cloneDeep(contract);
				const user = _.cloneDeep(paymentmanagement.user);
				const practicemanagement = _.cloneDeep(paymentmanagement.practicemanagement);
				const account = _.cloneDeep(paymentmanagement.account);
				sails.log.verbose("procedureConfirmedMailer",user.email,user.id)
				sails.log.debug("procedureConfirmedMailer",paymentmanagement.procedureConfirmedDate, paymentmanagement.status);
				await EmailService.sendProcedureConfirmedEmail({paymentmanagement, user, practicemanagement, account});
				cronEmailLogRegister( contract, startDay1, endDay1 );
			}
	} )
}
async function cronEmailLogRegister( contract, startday, endday ) {
	// Add system to adminuser list is not so:
	const adminUserName = "System";
	var adminUserSystem = await Adminuser.findOne( { name: adminUserName } );
	if( !adminUserSystem ) {
		var roleId = await Roles.findOne({
			where: { rolename: "Admin" },
			select: ['id']
		});
		const newAdminUserSystem = {
			name: "System",
			email: "",
			password: "",
			salt: "",
			phoneNumber: "",
			role: roleId,
			isDeleted: false,
		}
		Adminuser.create( newAdminUserSystem )
		.then( ( newAdmin )=> {
			adminUserSystem = { id: newAdmin.id };
			sails.log.info(adminUserSystem);
		}, ()=> {
			sails.log.info("Failed to log cron email: failed to add system to admin.");
		})
	}
	// Create logactivity data:
	const modulename = "Email sent";
	var modulemessage = "";
	if( contract.procedureConfirmedDate >= startday && contract.procedureConfirmedDate <= endday ) {
		modulemessage = "Procedure completion day +1 email sent to: " + contract.user.email;
	}
	else {
		modulemessage = "Procedure completion Day 5 email sent to: " + contract.user.email;
	}
	var logReferenceNumber = await User.getNextSequenceValue( "logs" );
	const logreference = "LOG_" + logReferenceNumber.sequence_value;
	const systemReqData = {
		user: {
			id: adminUserSystem.id,
			email: "",
			rolename: "",
		},
		url: "127.0.0.1",
		logdata: { user: "local machine", service: "System cron email service." },
		ip: "",
		session: { logReferenceID: logreference },
		payID: contract.id,
	}
	Logactivity.registerLogActivity( systemReqData, modulename, modulemessage )
	.then( (result)=> {
		sails.log.info(result);
	});
}
