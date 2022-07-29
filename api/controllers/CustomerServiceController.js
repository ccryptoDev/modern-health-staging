/* global sails, PracticeManagement, State, Roles, UserConsent, ApplicationService, Transunion, User, ValidationService */
/**
 * CustomerServiceController
 *
 * @description :: Server-side logic for managing Customerservices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict';
var request = require('request'), moment = require('moment');
var in_array = require('in_array');
var ObjectId = require('mongodb').ObjectID;

var request = require('request'),
  moment = require('moment');

module.exports = {
	addApplicationByCustomerService: addApplicationByCustomerServiceAction,
	addNewUserByCustomerService: addNewUserByCustomerServiceAction,
	transUnionInfoByCustomerService: transUnionInfoByCustomerServiceAction,
	getbanktransaction: getbanktransactionAction,
	newclient:newClientAction,
	emailajaxselectedbank:emailajaxselectedbank,
	serviceinfosuccess:serviceinfosuccessAction,
	serviceselectaccountinfo:serviceselectaccountinfoaction,
	serviceaddconsolidate:serviceaddconsolidateAction,
	checkStatusUsingPaymentID: checkStatusUsingPaymentIDAction,
	csmyoffer:csmyofferAction,
	savecsloanoffer:savecsloanofferAction,
	addbankaccount:addbankaccountAction,
	saveincomedetails:saveincomedetailsAction,
	servicetransaction: servicetransaction,
	emailselectedAccount:emailselectedAccount,
	emailmyoffer:emailmyofferAction,
	userpromissorynote: userpromissorynoteAction,
	createpromissorypdf: createpromissorypdfAction,
	myoffers: myoffersAction,
	filloutfinancedata:filloutfinancedataAction,
	borrowerloanamountconfirm:borrowerloanamountconfirmAction,
	// Function to check for duplicate email
	checkEmail: checkEmailAction
};

function userpromissorynoteAction(req, res){

	 var userid = req.param('id');
	 var scriteria = {user:userid,iscompleted: 0};

	Screentracking
	.findOne(scriteria)
	.populate('accounts')
	.populate('plaiduser')
	.populate('user')
	.populate('practicemanagement')
	.sort("createdAt DESC")
	.then(function(screentrackingdetails) {

		sails.log.info('screentrack', screentrackingdetails);

		var IPFromRequest =  req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var indexOfColon = IPFromRequest.lastIndexOf(':');
		var ip = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);
		var financedAmount = screentrackingdetails.offerdata[0].financedAmount;
		//financedAmount = financedAmount.replace('$','');
		var scheduleLoanAmount=screentrackingdetails.offerdata[0].monthlyPayment;
		//scheduleLoanAmount = scheduleLoanAmount.replace('$','');
		var loanTerm = screentrackingdetails.offerdata[0].loanTerm;
		var checktotalLoanAmount = parseFloat(scheduleLoanAmount)*loanTerm;
		checktotalLoanAmount = parseFloat(checktotalLoanAmount.toFixed(2));
		var creditcost = checktotalLoanAmount-financedAmount;
		creditcost =  parseFloat(creditcost.toFixed(2));
		var todaydate = moment().format('MM/DD/YYYY');
		var routingNumber	=	'';
		var laonusername	=	'';
		var accountNumberLastFour	=	'';
		if(screentrackingdetails.accounts){
			//var routingNumber = screentrackingdetails.accounts.accountNumberLastFour;
			var laonusername = screentrackingdetails.user.firstname+" "+screentrackingdetails.user.lastname
			var accountNumberLastFour = screentrackingdetails.accounts.accountNumberLastFour;
			var routingNumber = screentrackingdetails.accounts.routingNumber;
		}


		var userData = screentrackingdetails.user;
		var practiceData = screentrackingdetails.practicemanagement;
		var offerData= screentrackingdetails.offerdata[0];

		var pdfData={
			ip:ip,
			userid:userid,
			screentrackingdetails:screentrackingdetails,
			todaydate:todaydate,
			financedAmount:financedAmount,
			loanTerm:loanTerm,
			scheduleLoanAmount:scheduleLoanAmount,
			laonusername:laonusername,
			accountNumberLastFour:accountNumberLastFour,
			routingNumber:routingNumber,
		}
		var signatureExist=0;
					var signatureId="";
					var agreementsignpath="";
					var signusercriteria = {user_id:userid,screentracking: screentrackingdetails.id ,active: 1};

					Esignature
					.findOne(signusercriteria)
					.then(function (signatureData){

						if(signatureData)
						{
							signatureExist =1;
							var signatureId=signatureData.id;
							var agreementsignpath = Utils.getS3Url(signatureData.standardResolution);
						}
					var responseData={
						ip:ip,
						userid:userid,
						screentrackingdetails:screentrackingdetails,
						todaydate:todaydate,
						financedAmount:financedAmount,
						loanTerm:loanTerm,
						scheduleLoanAmount:scheduleLoanAmount,
						checktotalLoanAmount:checktotalLoanAmount,
						creditcost:creditcost,
						pdfData:pdfData,
						practiceData:practiceData,
						userData:userData,
						offerData: offerData,
						signatureData:signatureData,
						signatureExist:signatureExist,
						signatureId:signatureId,
						agreementsignpath:agreementsignpath
					}

					res.view("customerService/userpromissorynote" , responseData);

   				});


	}).catch(function (err) {
		 sails.log.error('CustomerServiceController#addconsolidateAction :: err', err);
		 return res.handleError(err);
	});


}


function addbankaccountAction(req, res) {

	var userId = req.param("id");

	if(userId)
	{
		/*var criteria = {id:  userId};
		User
		.findOne(criteria)
		.then(function (userDetails) {*/

			 var totalapplicationcount=0;
			 User.getBorrowerDashboardDetails(userId)
			 .then(function(responseDetails) {

				  if(responseDetails.status==200)
				  {
					  var incompleteCount = responseDetails.incompleteCount;
					  var loanCount       = responseDetails.loanCount;
					  var userDetails     = responseDetails.user;
					  var isBankAddedPending     = responseDetails.isBankAddedPending;
					  var incompleteredirectUrl     = responseDetails.incompleteredirectUrl;

					  totalapplicationcount = parseInt(incompleteCount)+parseInt(loanCount);

					  sails.log.info("incompleteCount:",incompleteCount);
					  sails.log.info("loanCount:",loanCount);
					  sails.log.info("isBankAddedPending:",isBankAddedPending);
					  sails.log.info("totalapplicationcount:",totalapplicationcount);
					  sails.log.info("incompleteredirectUrl:",incompleteredirectUrl);

					  if(parseInt(totalapplicationcount)<=1)
					  {
						 //-- For Fist application from front end (application wizard) or create application from admin panel
						 var usercriteria = { user:userId};

						  UserBankAccount
						  .find(usercriteria)
						  .sort("createdAt DESC")
						  .then(function (userBankAccount) {
								var banklength = userBankAccount.length;

								if(banklength > 0)
								{
									var checkcriteria = {
										user: userId,
										iscompleted:0
									}
									Screentracking
									.findOne(checkcriteria)
									.sort("createdAt desc")
									.then(function(screenRes){
										if(screenRes)
										{
											var screenlevel = screenRes.lastlevel;

											if(screenlevel<3)
											{
												//--to avoid redirect looping
												//-- scenario: application wizard + plaid connected
												var updateData={
													lastScreenName : "Select Account",
       												lastlevel : 3
												}
												Screentracking.update({id: screenRes.id}, updateData)
												.exec(function afterwards(err, updated){
													var redirectpath ="/servicetransaction/"+userId;
													return res.redirect(redirectpath);
												});
											}
											else{
												sails.log.error("1st redirect-----------------");
												var redirectpath ="/servicetransaction/"+userId;
												return res.redirect(redirectpath);
											}
										}
										else
										{
											var redirectpath ="/dashboard";
											return res.redirect(redirectpath);
										}
									}).catch(function (err) {
										var redirectpath ="/dashboard";
										return res.redirect(redirectpath);
									});
								}
								else
								{
									 res.view("customerService/addbankaccount", {userDetails:userDetails});
								}
						 })
						 .catch(function (err) {
						     sails.log.error("CustomerServiceController#addbankaccountAction :: err", err);
							 //return res.handleError(err);

							 sails.log.error("2nd redirect-----------------");
							 var redirectpath ="/dashboard";
					 		 return res.redirect(redirectpath);
						 });
					  }
					  else
					  {
						  //-- For Multiple Application (second application from borrower portal)
						  if( parseInt(incompleteCount)>0 && parseInt(isBankAddedPending)==0  )
						  {
							  sails.log.error("3rd redirect-----------------");
							  var redirectpath ="/servicetransaction/"+userId;
					 		  return res.redirect(redirectpath);
						  }
						  else
						  {
							  res.view("customerService/addbankaccount", {userDetails:userDetails});
						  }
					  }
				  }
				  else
				  {
					  sails.log.error("4th redirect-----------------");
					  var redirectpath ="/dashboard";
					  return res.redirect(redirectpath);
				  }
			})
			.catch(function (err) {
				sails.log.error("CustomerServiceController#addbankaccountAction :: err", err);
				sails.log.error("5th redirect-----------------");
			    var redirectpath ="/dashboard";
				return res.redirect(redirectpath);
			});
		/*})
		  .catch(function (err) {
		  	sails.log.error("CustomerServiceController#addbankaccountAction :: err", err);
		 	 return res.handleError(err);
		 });*/
	}
	else
	{
		sails.log.error("6th redirect-----------------");
		var redirectpath ="/dashboard";
		return res.redirect(redirectpath);
	}
}

function addApplicationByCustomerServiceAction( req, res ) {
	const tplData = {};
	if( req.session.errormsg != '' ) {
		tplData.errorval = req.session.errormsg;
		req.session.errormsg = '';
	}
	if( req.session.applicationerror != '' ) {
		tplData.errorval1 = req.session.applicationerror;
		req.session.applicationerror = '';
	}

	State.getExistingState()
	.then(function (states) {
		tplData.practiceid = req.session.adminpracticeID;
		sails.log.info( 'practiceid ', tplData.practiceid );
		tplData.stateData = states;

		PracticeManagement.find( { isDeleted: false } )
		.then( function ( hospRes ) {
			if( ! hospRes ) {
				hospRes = [];
			}
			var IPFromRequest = req.headers['x-real-ip'] || req.connection.remoteAddress;
			var indexOfColon = IPFromRequest.lastIndexOf(':');
			tplData.ip = IPFromRequest.substring(indexOfColon+1, IPFromRequest.length);
			var todaydate = moment().format('MM/DD/YYYY');
			sails.log.info('todaydate: ', todaydate);
			tplData.agreementObject = { date: todaydate };
			tplData.hospRes = hospRes;
			tplData.isTwilioEnabled = sails.config.twilioConfig.getTwilioConfig().isEnabled || false;
			res.view("admin/user/addApplication", tplData );
		} );
	} )
	.catch( function( err ) {
		sails.log.error("CustomerServiceController#getAllStatesAction :: err", err);
		return res.handleError({
			code: 500,
			message: 'INTERNAL_SERVER_ERROR'
		} );
	} );
}

function addNewUserByCustomerServiceAction(req, res) {
	if( !req.form.isValid ) {
		var validationErrors = ValidationService.getValidationErrors( req.form.getErrors() );
		return res.failed( validationErrors );
	}

	let isPhoneVerified;
	if( sails.config.twilioConfig.getTwilioConfig().isEnabled ) {
		isPhoneVerified = req.param( "isPhoneVerified" );
	} else {
		isPhoneVerified = true;
	}

	var roleCriteria = { rolename: "User" };
	Roles.findOne(roleCriteria)
	.then(function(roledata) {
		sails.log.info( 'req.form: ', req.form );
		sails.log.info( 'acceptconsent1====: ', req.form.acceptconsent1 );
		var acceptconsent =[ "126", "125", "120" ];
		var practicemanagement = req.form.practicemanagement;
		var roleid = roledata.id;
		var underwriter = req.user.name;
		const newScreenTrackingData = {
			residenceType: req.param("residenceType"),
			housingExpense: req.param("housingExpense"),
			incomeamount: req.param("incomeamount")
		};
		var newUserData = {
			'firstname': req.form.firstname,
			'middlename': req.form.middlename,
			'lastname': req.form.lastname,
			'email': req.form.email,
			'phoneNumber': req.form.phone,
			'underwriter': underwriter,
			'consentsChecked': acceptconsent,
			'practicemanagement': req.form.practicemanagement,
			'isPhoneVerified': isPhoneVerified
		};
		sails.log.info('newUserData: ', newUserData);

		User.registerNewUserByCustomerService( newUserData, roleid )
		.then(function (user) {
			sails.log.info('user: ', user);
			if( user.code != 200) {
				if(!user.existingUser) {
					req.session.errormsg = 'Email already exist';
					return res.redirect("/admin/addApplication");
				}else {
					user = {userId: !!user.existingUser.userId?user.existingUser.userId:user.existingUser.id, code: 200};
				}
			}
			console.log( "userdata", user );
			/* Pull TransUnion information and insert data into database starts here */
			var userID = user.userId;
			if( ! userID ) {
				req.session.applicationerror ='Invalid user data!';
				return res.redirect("/admin/addApplication");
			}
			var usercriteria = { id: userID };

			User.findOne( usercriteria )
			.then(function (userDetail) {
				_.assign(userDetail, newUserData);

				var middlename = "";
				if( userDetail.middlename ) {
					middlename = userDetail.middlename;
				}
				var first_name = userDetail.firstname;
				var middle_name = middlename;
				var last_name = userDetail.lastname;
				var email = userDetail.email;
				var dob = req.form.dob;
				var dateofBirth = moment(dob).format('MM/DD/YYYY');
				var street_name = req.form.street_name;
				var city = req.form.city;
				var state = req.form.state;
				var zip_code = req.form.zip_code;
				zip_code = zip_code.slice(0, 5);
				var ssn_number = req.form.ssn_number;
				var untiapt = req.param('unitApp');


				/* var apiindustryCode= sails.config.transunion.industryCode;
				var apimemberCode= sails.config.transunion.memberCode;
				var apiprefixCode= sails.config.transunion.prefixCode;
				var apiKeyPassword= sails.config.transunion.certificate.password;
				var apiEnv= sails.config.transunion.env;
				var apiuserRefNumber= userID;
				var apiPassword= sails.config.transunion.password; */

				userDetail.ssn_number = ssn_number;
				userDetail.street = street_name;
				userDetail.city = city;
				userDetail.state = state;
				userDetail.zipCode = zip_code;
				userDetail.dateofBirth = dateofBirth; // 08/06/2000
				userDetail.untiapt = '';
				if(untiapt) {
					userDetail.untiapt = untiapt;
				}
				var addressarray = {
					'untiapt': untiapt,
					'street_name': street_name,
					'city': city,
					'state': state,
					'zip_code': zip_code
				};
				var userArray = {
					'first': first_name,
					'middle': middle_name,
					'last': last_name
				};
				/* var transactionControl = {
					'userRefNumber' :userDetail.id,
					'subscriber' :{
						'industryCode' :apiindustryCode,
						'memberCode' :apimemberCode,
						'inquirySubscriberPrefixCode' :apiprefixCode,
						'password' :apiPassword
					},
					'options' :{
						'processingEnvironment' :apiEnv,
						'country' :"us",
						'language' :"en",
						'contractualRelationship' :"individual",
						'pointOfSaleIndicator' :"none"
					}
				};
				var certificate = {
					'key' :'PATIENT1Key.pem',
					'crt' :'PATIENT1.pem',
					'password' :apiKeyPassword
				};   */

				Transunion.getTransunionCredentials(userDetail)
				.then(function (transCredentials) {
					if( transCredentials.status==200 ) {
						var apiindustryCode = transCredentials.apiindustryCode;
						var apimemberCode = transCredentials.apimemberCode;
						var apiprefixCode = transCredentials.apiprefixCode;
						var apiKeyPassword = transCredentials.apiKeyPassword;
						var apiEnv = transCredentials.apiEnv;
						var apiPassword = transCredentials.apiPassword;
						var apiVersionr = transCredentials.apiVersionr;
						var pempath = transCredentials.pempath;
						var pemkeypath = transCredentials.pemkeypath;
						var apiUrl = transCredentials.apiUrl;
					} else {
						// -- Added to avoid issue for temporarily
						var apiindustryCode = sails.config.transunion.industryCode;
						var apimemberCode = sails.config.transunion.memberCode;
						var apiprefixCode = sails.config.transunion.prefixCode;
						var apiKeyPassword = sails.config.transunion.certificate.password;
						var apiEnv = sails.config.transunion.env;
						var apiPassword = sails.config.transunion.password;
						var apiVersionr = sails.config.transunion.version;
						var pempath = sails.config.transunion.certificate.crtPath;
						var pemkeypath = sails.config.transunion.certificate.keyPath;
						var apiUrl = sails.config.transunion.baseUrl;
					}
					var transactionControl = {
						'userRefNumber': userID,
						'subscriber': {
							'industryCode': apiindustryCode,
							'memberCode': apimemberCode,
							'inquirySubscriberPrefixCode': apiprefixCode,
							'password': apiPassword
						},
						'options': {
							'processingEnvironment': apiEnv,
							'country': "us",
							'language': "en",
							'contractualRelationship': "individual",
							'pointOfSaleIndicator': "none"
						}
					};
					var certificate = {
						'keyPath': pemkeypath,
						'crtPath': pempath,
						'password': apiKeyPassword,
						'apiUrl': apiUrl,
						'apiVersionr': apiVersionr
					};
					let screentracking = null;
					User.update(usercriteria,_.assign({
						dateofBirth: dateofBirth,
						ssn_number: ssn_number,
						state: state,
						street: street_name,
						city: city,
						zipCode: zip_code,
						unitapp: untiapt,
					}, newUserData)).exec(function afterwards(err, updated) {
						if (err) {
							req.session.applicationerror = "There was an error trying to create this user.";
							sails.log.error("CustomerServiceController#addNewUserByCustomerServiceAction", err);
							return res.redirect("/admin/addApplication");
						}
						return Screentracking.find({user: userDetail.id}).populate("user").then((screenTrackingList) => {
							if (screenTrackingList && screenTrackingList.length > 0) {
								const screenTrackingFound = screenTrackingList[0];
								const residenceType = `${req.param( "residenceType" )}`.toLowerCase();
								const existingScreenTracking = {
									lastlevel: 1,
									lastScreenName: "Application",
									iscompleted: 0,
									incomeamount: parseFloat(`${req.param("incomeamount")}`.replace(/[^0-9]/g, "")),
									residenceType: (["own", "rent", "other"].indexOf(residenceType) >= 0 ? residenceType : "other"),
									housingExpense: parseFloat(`${req.param("housingExpense")}`.replace(/[^0-9.]/g, ""))
								};

								sails.log.info("screentrackingDocExisting", existingScreenTracking);
								return Screentracking.update({id: screenTrackingFound.id}, existingScreenTracking).then((screenTrackingUpdate) => {
									if (screenTrackingUpdate && screenTrackingUpdate.length > 0) {
										screentracking = screenTrackingUpdate[0];
										return Promise.resolve(screentracking)
									} else {
										sails.log.error("CustomerServiceController#addNewUserByCustomerServiceAction - Unable to update screentracking");
										return Promise.reject({message: "Unable to update screentracking"})
									}
								});
							} else {
								return User.getNextSequenceValue( "application" )
									.then( ( applicationRefernceData ) => {
										const residenceType = `${req.param( "residenceType" )}`.toLowerCase();
										const screentrackingDoc = {
											user: userDetail.id,
											applicationReference: `APL_${applicationRefernceData.sequence_value}`,
											lastlevel: 1,
											lastScreenName: "Application",
											practicemanagement: user.practicemanagement,
											iscompleted: 0,
											incomeamount: parseFloat(`${req.param("incomeamount")}`.replace(/[^0-9]/g, "")),
											residenceType: (["own", "rent", "other"].indexOf(residenceType) >= 0 ? residenceType : "other"),
											housingExpense: parseFloat(`${req.param("housingExpense")}`.replace(/[^0-9.]/g, "")),
											requestedLoanAmount: 0
										};
										sails.log.info("screentrackingDoc", screentrackingDoc);
										return Screentracking.create(screentrackingDoc)
											.then((screenTracking) => {
												screentracking = screenTracking;
												return Promise.resolve(screentracking)
											});
									} )
							}
						}).then((screenTracking) => {
							ApplicationService.createcertificate(addressarray, transactionControl, certificate, userArray, ssn_number, userDetail, req.param)
								.then(function (responseDetails) {
									if (responseDetails.code !== 200) {
										req.session.applicationerror = 'Could not receive credit details';
										return res.redirect("/admin/addApplication");
									}
									var resultdataInput = responseDetails.resultdata;

									ApplicationService.updateApplicationDetails(addressarray, transactionControl, certificate, userArray, ssn_number, userDetail, req.param, resultdataInput, "", newScreenTrackingData)
										.then(function (certificateDetails) {
											if (certificateDetails.code !== 200) {
												if (certificateDetails.ssnNoHit === true) {
													req.session.applicationerror = "Could not retrieve credit details. SSN was not found.";
													req.session.deniedstatus = 1;
													req.session.deferUser = userDetail;
													req.session.deferScreenTracking = certificateDetails.screenTracking;
													return Promise.resolve(null);
												} else {
													sails.log.info("certificateDetails.screenTracking.rulesDetails ", certificateDetails.screenTracking.rulesDetails);
													return Screentracking.update(
														{
															id: certificateDetails.screenTracking.id
														},
														{
															lockCreditTier: "G",
															lastlevel: 2,
															deniedmessage: certificateDetails.deniedmessage
														}
													).then((screenTrackingUpdate) => {
														return Promise.resolve(certificateDetails);
													});
												}
											} else {
												req.session.levels = 2;
												return Screentracking.update({id: certificateDetails.screenTracking.id}, {lastlevel: 2}).then((screenTrackingUpdate) => {
													return Promise.resolve(certificateDetails);
												});
											}
										}).then((certificateDetails) => {
										if (certificateDetails) {
											var userObjectData = {
												id: userID,
												name: first_name + " " + last_name,
												email: email
											};
											var applicationReference = certificateDetails.screenTracking.applicationReference;
											var IPFromRequest = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
											var indexOfColon = IPFromRequest.lastIndexOf(':');
											var ip = IPFromRequest.substring(indexOfColon + 1, IPFromRequest.length);
											var screenid = certificateDetails.screenTracking.id;

											UserConsent.createAgreementPdf(applicationReference, ip, res, req, screenid, userDetail, acceptconsent, practicemanagement)
												.then(function (agreementstatus) {
													if (agreementstatus.code == 200) {
														const userObjectData = {
															user_id: userDetail.id,
															email: userDetail.email,
															name: userDetail.firstname + " " + userDetail.lastname,
															firstname: userDetail.firstname,
															lastname: userDetail.lastname,
															rolename: roledata.rolename,
															practicemanagement: userDetail.practicemanagement
														};
														EmailService.sendUserRegisterByCustomerServiceEmail( userObjectData );
														return res.redirect("/admin/transunionInfoByCustomerService");
													} else {
														req.session.applicationerror = 'Could not create this loan document';
														return res.redirect("/admin/addApplication");
													}
												})
												.catch(function (err) {
													req.session.applicationerror = '';
													req.session.applicationerror = 'Could not create this loan document';
													return res.redirect("/admin/addApplication");
												});
										} else {
											return res.redirect("/admin/addApplication");
										}
									})
										.catch(function (err) {
											if (err.code == 400) {
												req.session.applicationerror = '';
												req.session.applicationerror = 'This application has been declined, due to low credit score!';
												return res.redirect("/admin/addApplication");
											} else {
												sails.log.error('ApplicationController#transunionAddFormAction :: err :', err);
												if(!req.session.applicationerror ) {
													req.session.applicationerror = '';
													req.session.applicationerror = 'Could not receive credit details';
												}
												return res.redirect("/admin/addApplication");
											}
										});
								})
								.catch(function (err) {

									if (err.code == 400) {
										req.session.applicationerror = '';
										req.session.applicationerror = 'This application has been declined, due to low credit score!';
										return res.redirect("/admin/addApplication");

									} else {
										req.session.applicationerror = '';
										req.session.applicationerror = 'Could not receive credit details';
										return res.redirect("/admin/addApplication");
									}


								});
						})
					});
				}).catch(function (err) {

					req.session.applicationerror='';
					req.session.applicationerror ='Could not receive credit details';
					return res.redirect("/admin/addApplication");
				});
			})
				.catch(function (err) {
					sails.log.error('CustomerServiceController#addApplicationAction :: err :', err);
					req.session.applicationerror='';
					req.session.applicationerror ='Invalid user data!';
					return res.redirect("/admin/addApplication");
				} );

			} )	.catch(function (err) {
			sails.log.error('CustomerServiceController#addNewUserByCustomerServiceAction :: err :', err);
			return res.handleError(err);
			});

		} )	.catch(function (err) {
		sails.log.error('CustomerServiceController#addNewUserByCustomerServiceAction :: err :', err);
		return res.handleError(err);
	});
}

function transUnionInfoByCustomerServiceAction(req, res) {
	res.view("admin/user/transunionInfoByCustomerService");
}

function getbanktransactionAction(req, res) {
	sails.log.info("getbanktransactionAction");

	var userId = req.param('id');

	Screentracking
			.findOne({
			  user :userId,
			  iscompleted : 0
			})
			.then(function(screenTrackingData){

				sails.log.info("screenTrackingData updatedAt:", screenTrackingData.updatedAt);

				var currentTime = moment();
				var postDate = moment(screenTrackingData.updatedAt);

				var updatedAt = moment(screenTrackingData.updatedAt).format();
				sails.log.info("updatedAt:", updatedAt);

				var totalTimeAgo = currentTime.diff(postDate);

				var totalDaysAgo = currentTime.diff(postDate, 'days');

				var totalHoursAgo = currentTime.diff(postDate, 'hours');

				var totalMinutesAgo = currentTime.diff(postDate, 'minutes');

				var totalSecondsAgo = currentTime.diff(postDate, 'seconds');

				sails.log.info("totalSecondsAgo:", totalSecondsAgo);
				sails.log.info("totalMinutesAgo:", totalMinutesAgo);
				sails.log.info("totalHoursAgo:", totalHoursAgo);
				sails.log.info("totalDaysAgo:", totalDaysAgo);
				sails.log.info("totalTimeAgo:", totalTimeAgo);

				if(totalDaysAgo > 2) {
					var linkExpired = 1;
				} else {
					var linkExpired = 0;
				}

				res.view("customerService/getbankdetails", {checkExpiration: linkExpired, userId: userId});
	});

}


function saveincomedetailsAction(req, res){
	sails.log.info("saveincomedetailsAction");

	var userId = req.param("userId");

	sails.log.info("user id:",userId);

		var criteria = {
			  id:  userId,
			};

		User
		.findOne(criteria)
		.then(function (userDetails) {

		    var public_token = req.param('public_token');
			var account_id = req.param('account_id');
			var institutionName = account_id.institution.name;
			var institutionType = account_id.institution.institution_id;
			var user = req.user;

			sails.log.info('public_token : ', public_token);

			InstitutionService.generateAccessToken(public_token)
			 .then(function (access_token) {
				var token = access_token.access_token;

				sails.log.info('access_token : ', token);

				 InstitutionService.accountDetail(token)
				   .then(function (accountDetails) {

						UserBankAccount.createUserBankDetail(institutionName, institutionType, accountDetails, userDetails, token)
						 .then(function (userBankAccntDet) {


							  Screentracking
							  .findOne({user: userId})
							  .sort("createdAt DESC")
							  .then(function (screenData) {

									 screenData.lastlevel=3;
									 //--Ticket no 2804
									 screenData.lastScreenName= "Plaid";
									 // Added borrowerapplication = 1
									 screenData.borrowerapplication =1;

									 screenData.save(function(err) {
											sails.log.info("Plaid userBankAccntDet: ",userBankAccntDet);

											var json = {
												status: 200,
												message: 'success'
											};
											res.contentType('application/json');
											res.json(json);
									 });
							 });
						});

				 })
				.catch(function (err) {
				    var json = {
						status: 400,
						message: 'Your bank account details not saved.'
					};
					res.contentType('application/json');
					res.json(json);
				})
			})


		})
		.catch(function (err) {
			var json = {
				status: 400,
				message: 'Your bank account details not saved.'
			};
			res.contentType('application/json');
			res.json(json);
		});
}
function loandocumentsAction(req, res) {

	var criteria = {
			  documentKey:'130',
	};
	Agreement
    .find(criteria)
    .then(function (agreements) {

		var criteria = { user: req.session.userId,iscompleted : 0};
		Screentracking
		.findOne(criteria)
		.then(function (userscreenres) {
			//sail.log.info("userscreenres****",userscreenres);

			var tranunionid = userscreenres.transunion;
			var transcriteria = { id: tranunionid};

			Transunions
			  .findOne(transcriteria)
			  .then(function (userres) {
		       // sails.log.info('userDetails : ', userres);

				var firstname = userres.first_name;
				var middle_name = userres.middle_name;
				var last_name = userres.last_name;
				/*var unitnumber = userres.house_number[0].street.number;
				var apptname = userres.house_number[0].street.name;
				var city = userres.house_number[0].location.city;
				var state = userres.house_number[0].location.state;
				var zipCode = userres.house_number[0].location.zipCode;*/

				var unitnumber = userres.house_number[0].street.number;
				var apptname = userres.house_number[0].street.name;
				var city = userres.house_number[0].location.city;
				var state = userres.house_number[0].location.state;
				var zipCode = userres.house_number[0].location.zipCode;

				var financedAmount = userscreenres.offerdata[0].financedAmount;

				var responsedata = {
					firstname:firstname,
					middle_name:middle_name,
					last_name:last_name,
					unitnumber:unitnumber,
					apptname:apptname,
					city:city,
					state:state,
					zipCode:zipCode,
					datesign:moment().format('MM/DD/YYYY'),
					financedAmount:financedAmount
				};

				var sigcriteria = { user_id: req.session.userId};
				Esignature.find(sigcriteria)
				  .then(function(signatureDetails) {
					sails.log.info('signatureDetails : ', signatureDetails);
					var docversion = agreements[0].documentVersion;
				    res.view("frontend/banktransaction/loandocuments", {userres:responsedata,docversion:docversion,signatureDetails:signatureDetails});

				})
				.catch(function (err) {
				  sails.log.error('EsignatureController#getUserSignaturesAction :: err :', err);
				  return res.handleError(err);
				});




		        //res.view("document/loanAgreementAndPromissoryNote_v"+agreements[0].documentVersion, {userres:responsedata});

			})
			.catch(function (err) {
				 sails.log.error('CustomerServiceController#loandocumentsAction :: err', err);
				 return res.handleError(err);
			});

		})
		.catch(function (err) {
			 sails.log.error('CustomerServiceController#loandocumentsAction :: err', err);
			 return res.handleError(err);
		});

    })
    .catch(function (err) {
         sails.log.error('CustomerServiceController#loandocumentsAction :: err', err);
		 return res.handleError(err);
    });
}



function newClientAction(req,res){

	var request = require('request'),
	Q = require('q'),
	moment = require('moment');

	require('request-debug')(request);
	var fs = require('fs'),
	xml2js = require('xml2js');
	var https = require('https');

	var Curl = require( 'node-libcurl' ).Curl;
	var curl = new Curl();

	var path = require( 'path' );
	var to_json = require('xmljson').to_json;
	var fs = require('fs');

	var clientKey = '4BAF9F92-C232-49E8-979F-9402B3F2CBCA';

	var soapDomain = 'http://www.ramservicing.com';

	var startSessionXMLRequest = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><StartSession xmlns="http://www.ramservicing.com/"><ClientKey>'+clientKey+'</ClientKey></StartSession></soap:Body></soap:Envelope>';

	var startSessionSOAPAction = soapDomain+'/StartSession';

	/*----session calls here----*/

	var postOptions = {
	  hostname: 'staging.ramservicing.com',
	  port: 443,
	  path: '/services/RAMSGatewayVer2.asmx',
	  method: 'POST',
	  headers: {
		'Content-Type':'text/xml;charset=utf-8',
		'Content-Length': Buffer.byteLength(startSessionXMLRequest),
		'SOAPAction':startSessionSOAPAction,
	  }
	};


	var sessionId = '';
	var req = https.request(postOptions, function(res) {
		 //sails.log.info("STATUS: ",res);
		res.setEncoding('utf8');

		res.on('data', function (chunk) {

		var parser = new xml2js.Parser( { charkey: "_val", explicitArray: false, mergeAttrs: true } );

			parser.parseString(chunk, function(err,result){
			   var test = JSON.stringify(result);
			   sessionId = result['soap:Envelope']['soap:Body']['StartSessionResponse']['StartSessionResult'];

			});

			console.log("sessionId: ",sessionId);

			var clientId = '12345678';

				/*second API call payScheduleAddSingle*/
				var payScheduleAddSingleXML = '<?xml version="1.0" encoding="utf-8"?>'+
						'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'+
						  '<soap:Body>'+
							'<PayScheduleAddSingle xmlns="http://www.ramservicing.com/">'+
							  '<Sessid>'+sessionId+'</Sessid>'+
							  '<clientID>'+clientId+'</clientID>'+
							  '<extendedID>0</extendedID>'+
							  '<fee1>1.11</fee1>'+
							  '<TotalPaymentAmount>2.11</TotalPaymentAmount>'+
							  '<savings>1.00</savings>'+
							  '<paymentdate>2017-12-02+01:00</paymentdate>'+
							'</PayScheduleAddSingle>'+
						  '</soap:Body>'+
						'</soap:Envelope>';

				var payScheduleAddSingleAction = soapDomain+'/PayScheduleAddSingle';

				var getClientPaymentScheduleApiCall = 'PayScheduleAddSingle';

				callRamsApi(payScheduleAddSingleXML, payScheduleAddSingleAction, getClientPaymentScheduleApiCall, function(results){
					var PaymentScheduleID = results;
					console.log('PaymentScheduleID:',PaymentScheduleID);

					/*third API call getPaymentStatus*/
					var getPaymentStatusXML = '<?xml version="1.0" encoding="utf-8"?>'+
							'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'+
							  '<soap:Body>'+
								'<GetPaymentStatus xmlns="http://www.ramservicing.com/">'+
								  '<sessid>'+sessionId+'</sessid>'+
								  '<PaymentScheduleID>'+PaymentScheduleID+'</PaymentScheduleID>'+
								  '<clientID>'+clientId+'</clientID>'+
								'</GetPaymentStatus>'+
							  '</soap:Body>'+
							'</soap:Envelope>';

					var getPaymentStatusAction = soapDomain+'/GetPaymentStatus';

					var getClientPaymentScheduleApiCall = 'GetPaymentStatus';

					callRamsApi(getPaymentStatusXML, getPaymentStatusAction, getClientPaymentScheduleApiCall, function(results){
						var PaymentScheduleID = results;
						console.log('PaymentStatus:',results);
					});
					/*third API call getPaymentStatus ends*/

					/*add settlement payment for the client which runs from CRON*/
					var addSinglePaymentXML  = '<?xml version="1.0" encoding="utf-8"?>'+
						'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'+
						  '<soap:Body>'+
							'<SettlementAddSinglePayment xmlns="http://www.ramservicing.com/">'+
							  '<sessid>'+sessionId+'</sessid>'+
							  '<clientID>'+clientId+'</clientID>'+
							  '<PaymentAmount>1.06</PaymentAmount>'+
							  '<PaymentDate>2017-12-01+03:00</PaymentDate>'+
							  '<PaymentType>EFT_ACH</PaymentType>'+
							  '<PayeeName>Alberta Bobbeth Charleson</PayeeName>'+
							  '<PayeeAddress>2992 Cameron Road,</PayeeAddress>'+
							  '<PayeeAddress2></PayeeAddress2>'+
							  '<PayeeCity>Malakoff</PayeeCity>'+
							  '<PayeeStateAbbrev>NY</PayeeStateAbbrev>'+
							  '<PayeeZIP>14236</PayeeZIP>'+
							  '<PayeePhone>1112223333</PayeePhone>'+
							  '<PayeeMailTo>accountholder0@example.com</PayeeMailTo>'+
							  '<PayeeClientAccountNumber>1111222233331111</PayeeClientAccountNumber>'+
							  '<PaymentNotes>""</PaymentNotes>'+
							  '<PayeebankAccountNumber>""</PayeebankAccountNumber>'+
							  '<PayeeBankAccountRouting>""</PayeeBankAccountRouting>'+
							  '<PayeeBankAccountName>""</PayeeBankAccountName>'+
							  '<PayeeBankName>""</PayeeBankName>'+
							  '<PayeeBankAddress>""</PayeeBankAddress>'+
							  '<PayeeBankCity>""</PayeeBankCity>'+
							  '<PayeeBankStateAbbrev>""</PayeeBankStateAbbrev>'+
							  '<PayeeBankZIP>""</PayeeBankZIP>'+
							  '<taxidlast4>""</taxidlast4>'+
							  '<PayByPhoneNumber>""</PayByPhoneNumber>'+
							  '<PayByPhoneContact>""</PayByPhoneContact>'+
							  '<CreditorName>Alberta Bobbeth Charleson</CreditorName>'+
							  '<ReferenceNumber>0</ReferenceNumber>'+
							  '<ExtendedID>""</ExtendedID>'+
							  '<ExtendedCreditorID>""</ExtendedCreditorID>'+
							'</SettlementAddSinglePayment>'+
						  '</soap:Body>'+
						'</soap:Envelope>';

				var addSinglePaymentAction = soapDomain+'/SettlementAddSinglePayment';

				var singlePaymentApiCall = 'singlePayment';
					/*add settlement payment for the client which runs from CRON*/

				});
				/*second API call payScheduleAddSingle ends*/
		});
	});

	req.write(startSessionXMLRequest);
	/*----session ends here----*/

	res.view("customerService/newsession");
}

function callRamsApi(xmlRequest, soapAction, apiCall, callback) {


	var request = require('request'),
	Q = require('q'),
	moment = require('moment');

	require('request-debug')(request);
	var fs = require('fs'),
	xml2js = require('xml2js');
	var https = require('https');

	var Curl = require( 'node-libcurl' ).Curl;
	var curl = new Curl();

	var path = require( 'path' );
	var to_json = require('xmljson').to_json;
	var fs = require('fs');

	/*POST request*/

	var postOptions = {
	  hostname: 'staging.ramservicing.com',
	  port: 443,
	  path: '/services/RAMSGatewayVer2.asmx',
	  method: 'POST',
	  headers: {
		'Content-Type':'text/xml;charset=utf-8',
		'Content-Length': Buffer.byteLength(xmlRequest),
		'SOAPAction':soapAction,
	  }
	};


	var PaymentScheduleID = '';
	var PaymentStatus = '';
	var statusCode = '';
	var paymentMSg = '';

	var https = require('https');
	var req = https.request(postOptions, function(res) {
		//sails.log.info("STATUS_RES: ",res.statusCode);
		var statusCode = res.statusCode;

		res.setEncoding('utf8');
		var data="";
		res.on('data', function (chunk) {
			//console.log('BODY RESULT: ' + chunk);

				//console.log('inside statusCode: ' + statusCode);
				//var statuscode = '200';

				if(apiCall=='singlePayment') {
					console.log('BODY RESULT 1st: ' + chunk);
				} else if (apiCall== 'PayScheduleAddSingle') {
					console.log('BODY RESULT second: ' + chunk);

					var parser = new xml2js.Parser( { charkey: "_val", explicitArray: false, mergeAttrs: true } );
					parser.parseString(chunk, function(err,result){
					   var test = JSON.stringify(result);
					   PaymentScheduleID = result['soap:Envelope']['soap:Body']['PayScheduleAddSingleResponse']['PayScheduleAddSingleResult']['string'][1];
					});

					res.on('end', function(){
						callback(PaymentScheduleID);
					});

				} else if (apiCall== 'GetPaymentStatus') {
					//console.log('BODY RESULT third: ' + chunk);

					var parser = new xml2js.Parser( { charkey: "_val", explicitArray: false, mergeAttrs: true } );
					parser.parseString(chunk, function(err,result){
					   var test = JSON.stringify(result);
					  // console.log('BODY RESULT third: ' + result);
					  // console.log('BODY RESULT third1: ' + test);

					  var statusCode ='';

						if(result['soap:Envelope']['soap:Body']['soap:Fault']) {
							PaymentStatus = result['soap:Envelope']['soap:Body']['soap:Fault']['faultstring'];
							statusCode = 500;
							paymentMSg = 'API response code has error!';
						} else {
							PaymentStatus = result['soap:Envelope']['soap:Body']['GetPaymentStatusResponse']['GetPaymentStatusResult']['string'][0];
							statusCode = 200;
							paymentMSg = 'Success';
						}
					});

					var Finalresponse = {
						'PaymentStatus' : PaymentStatus,
						'statusCode' : statusCode,
						'paymentMSg' : paymentMSg
					};

					res.on('end', function(){
						callback(Finalresponse);
					});

				} else if (apiCall== 'GetClientPaymentSchedule') {
					console.log('BODY RESULT fifth: ' + chunk);
				} else if (apiCall== 'GetReturns') {
					console.log('BODY RESULT sixth: ' + chunk);
				}



		});


	});


	req.on('error', function(e) {
	  sails.log.info("problem with request:",e.message);
	});

	req.write(xmlRequest);

}

function checkStatusUsingPaymentIDAction(req, res) {

 	var criteria = { overAllStatus: 0};

	   RamsResponse
		.find(criteria)
		.then(function (userDetails) {
						 //console.log(userDetails);


			/*call session function*/
			RamsResponse.callRamsCredentials().then(function (results) {
				var sessionId = results;

				var clientId = '12345678';
				var PaymentScheduleID ='';
				var userId = '';
				var soapDomain = 'http://www.ramservicing.com';

				for (var i = 0; i < userDetails.length; i++) {

					var paymentScheduleID = userDetails[i]['PaymentScheduleID'];

					userId = userDetails[i]['id'];

					/*console.log("payId:" ,paymentScheduleID);
					console.log("sessId:" ,sessionId);
					console.log("clientid:" ,clientId);	*/

					var getPaymentStatusXML = '<?xml version="1.0" encoding="utf-8"?>'+
					'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'+
					  '<soap:Body>'+
						'<GetPaymentStatus xmlns="http://www.ramservicing.com/">'+
						  '<sessid>'+sessionId+'</sessid>'+
						  '<PaymentScheduleID>'+paymentScheduleID+'</PaymentScheduleID>'+
						  '<clientID>'+clientId+'</clientID>'+
						'</GetPaymentStatus>'+
					  '</soap:Body>'+
					'</soap:Envelope>';

					var getPaymentStatusAction = soapDomain+'/GetPaymentStatus';

					var getClientPaymentScheduleApiCall = 'GetPaymentStatus';


					console.log("userId:" ,userId);

					callRamsApi(getPaymentStatusXML, getPaymentStatusAction, getClientPaymentScheduleApiCall, function(results){

						//console.log('API Result:',results);
						//console.log('Code:', results.statuscode);
						var statusCode = results.statusCode;

						if(statusCode=='200') {		/*update the status of the payment*/
							console.log('Code:', results.statusCode);

							console.log('userId123:', userDetails);

							var criteria = {
								id: userId
							};

							/*update starts here*/
							/*RamsResponse
							 .findOne(criteria)
							 .then(function(RamsResponse) {

								if(results.PaymentStatus=='POSTED') {
									console.log('posted: Yes');
									RamsResponse.overAllStatus = 1;
									RamsResponse.status = results.PaymentStatus;
								} else {
									console.log('posted: No');
									RamsResponse.overAllStatus = 0;
									RamsResponse.status = results.PaymentStatus;
								}

								RamsResponse.save();

							});*/

							/*update ends here*/
						}
					});



				  /*API call fot status check ends here*/
			}

			});
			/*call session function ends*/

		});


	//return res.view('customerService/emailbanktransaction', responsedata);
	return res.view("customerService/newsession");
}




function servicetransaction(req,res){

	var errorval = '';
	if(req.session.errormsg!='')
	{
			errorval =req.session.errormsg;
			req.session.errormsg = '';
	}

	var resstatusvalue='';
	var message='';
	var resstatusvalue = req.flash('resstatus');
	var message = req.flash('resmessage');
	var user_id = req.param('id');
	var criteria = { id: user_id};

	   User
		.findOne(criteria)
		.then(function (userDetails) {


			  var screencriteria = { user: userDetails.id};

			  Screentracking
			  .findOne(screencriteria)
			  .then(function (screenDetails) {



				var bankusercriteria = {
			       user:userDetails.id,
			       isDeleted: false
			    };

				sails.log.info('bankusercriteria : ', bankusercriteria);

				  UserBankAccount
				  .find(bankusercriteria)
				  .sort("createdAt DESC")
				  .then(function (fulluserBankAccount) {

							//sails.log.info('fulluserBankAccount : ', fulluserBankAccount);

							//-- Filter duplicate accounts
							UserBankAccount
							.getAllUserBankAccounts(fulluserBankAccount)
							.then(function (userBankAccountResponse) {

								//sails.log.info('userBankAccountResponse : ', userBankAccountResponse);

								if(userBankAccountResponse.code==200)
								{
									  var userBankAccount = userBankAccountResponse.userBankAccountData;

									  //var userBankAccount = fulluserBankAccount;

									  var startdate = moment().subtract(90, 'days').format('YYYY-MM-DD');
									  var enddate = moment().format('YYYY-MM-DD');

									  //sails.log.info("startdate",startdate);
									  //sails.log.info("enddate",enddate);
									  var totalpayroll = 0;
									  var subTypeArray = [];
									  var payRollArray = [];
									  var payrollname = '';
									  var available;
									  var current;
									  var transdate = '';
									  var payrollamount = 0;

									  _.forEach(userBankAccount, function (userbankData) {

										 _.forEach(userbankData.accounts, function (account) {
											if (account.subtype !== 'credit card') {
												account.institutionName = userbankData.institutionName;
												account.bankid = userbankData.id;
												available = parseFloat(account.balance.available).toFixed(2);
												if(available > 0)
												{
													account.balance.available = available.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
													account.balance.available = '$'+account.balance.available;
												}
												current = parseFloat(account.balance.current).toFixed(2);
											   if(current > 0)
											   {
													account.balance.current = current.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
													account.balance.current = '$'+account.balance.current;
											   }
												subTypeArray.push(account);
											}
										  });
										  //sails.log.info("subTypeArray******************",subTypeArray);

										  _.forEach(userbankData.transactions, function (transactions) {
												 _.forEach(transactions, function (payrolldata) {
													payrollname = payrolldata.category;
													payrollamount = payrolldata.amount;
													if(payrollname!='' && payrollname!=null && "undefined" !== typeof payrollname){
														payrollname = payrollname.toString();
														transdate = payrolldata.date;
														var ddkeyword = sails.config.plaid.ddKeyword;
														if(ddkeyword.indexOf(payrollname.toLowerCase())> -1)
														{
															 if(startdate < transdate && enddate > transdate)
															 {
																 payRollArray.push(payrolldata);
																 payrollamount = parseFloat(payrollamount);
																 totalpayroll = parseFloat(totalpayroll);
																 totalpayroll = totalpayroll+payrollamount;
															 }
														}
													}
												});

											});
										});

										if(totalpayroll > 0){
										 totalpayroll = (totalpayroll/3)*12;
										 totalpayroll = totalpayroll.toFixed(2);
										}

								 	    Screentracking.update({user: user_id}, {totalpayroll: totalpayroll})
									    .exec(function afterwards(err, updated){
											if(err)
											{
											  //sails.log.info("err",err);
											}
											//sails.log.info("updated",updated);


											sails.log.info("payRollArray",payRollArray);

											var IPFromRequest =  req.headers['x-forwarded-for'] || req.connection.remoteAddress;
											var indexOfColon = IPFromRequest.lastIndexOf(':');
											var ip = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);

											var todaydate = moment().format('MM/DD/YYYY');
											var agreementObject={date:todaydate};


											Screentracking
											.find({user: userDetails.id})
											.then(function(screenResults) {
												var responsedata = {
													message: 'success',
													user: userDetails,
													accountDetails:subTypeArray,
													payRollArray:payRollArray,
													userBankAccount:userBankAccount,
													ip: ip,
													agreementObject: agreementObject,
													status: resstatusvalue,
													message:message,
													username:userDetails.firstname+" "+userDetails.lastname,
													screenDetails:screenDetails,
													status: 404,
													errorval:errorval,
													totalpayroll:totalpayroll,
													screencount:screenResults.length,
													minloanamount:sails.config.plaid.minrequestedamount,
													maxloanamount:sails.config.plaid.maxrequestedamount
												};
												//sails.log.info('responsedata : ', responsedata);
 												return res.view('customerService/servicetransaction', responsedata);
											});
 									   });
								 }
								 else
								 {
									var responsedata = {
										status: 400,
										message: 'Your are not allowed to change new bank account.'
									};
									return res.view('customerService/servicetransaction', responsedata);
								 }
							 }).catch(function (err) {

								    //sails.log.info("Error::============",err);
							 		var responsedata = {
										status: 400,
										message: 'Your are not allowed to change new bank account.'
									};
									return res.view('customerService/servicetransaction', responsedata);
						     });
					   }).catch(function (err) {
						   	var responsedata = {
								status: 400,
								message: 'Your are not allowed to change new bank account.'
							};
							return res.view('customerService/servicetransaction', responsedata);
					   });
				    })
					.catch(function (err) {

						 var responsedata = {
							status: 400,
							message: 'Your are not allowed to change new bank account.'
						};
						return res.view('customerService/servicetransaction', responsedata);
					});

		})
		.catch(function (err) {

			 var responsedata = {
				status: 400,
				message: 'Your are not allowed to change new bank account.'
			};
			return res.view('customerService/servicetransaction', responsedata);
		});
}


function emailajaxselectedbank(req,res){

	var user_id = req.param('user_id');

	var bankid = req.param("bank_id");
	var criteria = { id: user_id};

	console.log("user_id ranjani: ",user_id);

		User
		.findOne(criteria)
		.then(function (userDetails) {

				var usercriteria = {
				  user:userDetails.id,
				  id:bankid,
				  isDeleted: false
				};

				UserBankAccount
				  .findOne(usercriteria)
				  .sort("createdAt DESC")
				  .then(function (userBankAccount) {

						  var subTypeArray = [];
						  _.forEach(userBankAccount.accounts, function (account) {
							if (account.subtype !== 'credit card') {
							  //account.currentBalance = parseFloat(account.currentBalance);
							  subTypeArray.push(account);
							}
						  });

						sails.log.info('subTypeArray : ', subTypeArray);

						  var responsedata = {
							message: 'success',
							user: userDetails,
							accountDetails:subTypeArray,
						 };
						  var linkedaccid ='';
						  var consoldateid = '';
						  var myofferdata = '';
						  var lastlevel = 3;

						  Screentracking
						  .updateLastScreenName(userDetails,'Select Bank',lastlevel,subTypeArray,linkedaccid,consoldateid,[])
						  .then(function(screenTracking) {

									var json = {
									responsedata: responsedata,
									};
									sails.log.info("json data", json);
									res.contentType('application/json');
									res.json(json);

						      //return res.view('frontend/banktransaction/bankaccountlist', responsedata);

						  })
						    .catch(function (err) {

										var responsedata = {
							status: 400,
							message: 'Your are not allowed to change new bank account.'
						};

						var json = {
									responsedata: responsedata,
									};
									sails.log.info("json data", json);
									res.contentType('application/json');
									res.json(json);

								sails.log.error("createlast screen name::Error",err);
						        return res.handleError(err);
						  });

					 })
					  .catch(function (err) {
						 var responsedata = {
							status: 400,
							message: 'Your are not allowed to change new bank account.'
						};

						var json = {
						   responsedata: responsedata,
						};
						sails.log.info("json data", json);
						res.contentType('application/json');
						res.json(json);

						//return res.view('frontend/banktransaction/bankaccountlist', responsedata);
					  });


	    })
		.catch(function (err) {
			 var responsedata = {
				status: 400,
				message: 'Your are not allowed to change new bank account.'
			};

			var json = {
			   responsedata: responsedata,
			};
			sails.log.info("json data", json);
			res.contentType('application/json');
			res.json(json);

			//return res.view('frontend/banktransaction/bankaccountlist', responsedata);
		});

}

function emailselectedAccount(req,res){


	var itemId = req.param("bankaccount");
	var bankId = req.param("bankid");
	var userid = req.param("emailuserid");

	sails.log.info('itemId', itemId);
	sails.log.info('bankId', bankId);

	var user_income = req.param("user_income");
	user_income = user_income.replace("$", "");
	user_income = user_income.replace(",", "");
	user_income = user_income.replace(",", "");
	user_income = user_income.replace(",", "");
	user_income = user_income.replace(",", "");
	user_income = user_income.replace(" ", "");


	var minimumIncomePlaid = sails.config.plaid.minincomeamount;
	var maximumDti = sails.config.plaid.minincomeamount;

	//loan Amount
	var financedAmount = req.param("loan_amount");
	financedAmount = financedAmount.replace("$", "");
	financedAmount = financedAmount.replace(",", "");
	financedAmount = financedAmount.replace(",", "");
	financedAmount = financedAmount.replace(",", "");
	financedAmount = financedAmount.replace(",", "");
	financedAmount = financedAmount.replace(" ", "");


	sails.log.info('financedAmount', financedAmount);

	if(financedAmount > 0)
	{
		var	minloanamount	=	sails.config.plaid.minrequestedamount;
		var	maxloanamount	=	sails.config.plaid.maxrequestedamount;
		if(financedAmount<minloanamount)
		{
			var redirectpath ="/servicetransaction/"+userid;
			req.session.errormsg	=	'';
			//req.session.errormsg 	= 	"You can apply minimum loan amount of $"+minloanamount+" and maximum loan amount of $"+maxloanamount+" in " + sails.config.lender.shortName;
			// req.session.errormsg 	= 	"You can apply minimum loan amount of $"+minloanamount+" in " + sails.config.lender.shortName;
			req.session.errormsg 	= 	"Sorry, that financed amount does not meet the minimum threshold.";
			return res.redirect(redirectpath);
		}
		/*else if(maxloanamount<financedAmount)
		{
			var redirectpath 		=	"/servicetransaction/"+userid;
			req.session.errormsg	=	'';
			req.session.errormsg 	= 	"You can apply minimum loan amount of $"+minloanamount+" and maximum loan amount of $"+maxloanamount+" in " + sails.config.lender.shortName;
			return res.redirect(redirectpath);
		}*/
		else
		{
				var storyId = '';
				var plaidAccountId = '';

				var criteria = { id: userid};

				User
				.findOne(criteria)
				.then(function (userDetails) {

					var usercriteria = {
					  user: userDetails.id,
					  id:bankId,
					  isDeleted: false
					};

					 UserBankAccount
					 .findOne(usercriteria)
					 .sort("createdAt DESC")
					 .then(function (userBankAccount) {

						  var checkbank=0;
						  var errorflag='';
						  var forlength = userBankAccount.accounts.length;
						  var i = 0;

						  //sails.log.info('forlength : ', forlength);

						  _.forEach(userBankAccount.accounts, function (account) {

								//console.log("account",account);
								//sails.log.info('itemId : ', itemId);
								//sails.log.info('accountid : ', account._id);

							if (account._id === itemId && checkbank==0 ) {

								checkbank =1;
								errorflag=0;
								//sails.log.info('matchaccountid : ', account._id);

								//user.id = userid;
								var plaidAccountId = itemId;
								var storyId = '';

								Account
								.createAccountDetail(userBankAccount.id, userDetails, itemId, plaidAccountId, storyId, user_income)
								.then(function (accDet) {

								  //sails.log.info('accDet', accDet);
								  if (accDet) {
										 //sails.log.info('enter success part ');
										 var linkedaccid = accDet.id;
										 var consoldateid = '';
										 var myofferdata = '';
										 var lastlevel = 4;

										 Screentracking
										  .updateLastScreenName(userDetails,'Select Account',lastlevel,accDet,linkedaccid,consoldateid,[])
										  .then(function(screenTracking) {

												var IPFromRequest =  req.headers['x-forwarded-for'] || req.connection.remoteAddress;
												var indexOfColon = IPFromRequest.lastIndexOf(':');
												var ip = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);
												var screenid = screenTracking.id;

												//--Update loan amount in screentracking table
												// Added borrowerapplication = 1
												var  UpdateData={
													requestedLoanAmount : financedAmount,
													borrowerapplication:1
												}
												Screentracking.update({id:screenid},UpdateData).exec(function afterwards(err, updated){

													 var redirectpath ="/emailmyoffer/"+screenid;
													 req.session.banksuccessval='';
													 req.session.banksuccessval = 'Your bank account has been added successfully.';
													 return res.redirect(redirectpath);

												});

										})
										.catch(function (err) {

											sails.log.error("createlast screen name::Error",err);
											return res.handleError(err);
										 });


								   }
								   else
								   {
												var redirectpath ="/servicetransaction/"+userid;
												req.session.errormsg='';
												req.session.errormsg = "Your bank account information is not added.";
												return res.redirect(redirectpath);
									}
								})
								.catch(function (err) {

									sails.log.info('error part2 catch: ',err);

									if(err.message)
									{
										var errormessage =err.message;
										if(errormessage=='ACCOUNT_ALREADY_LINKED')
										{
											var errormessage='Account has been linked already';
											console.log("ranjani error:",errormessage);
										}
										if(errormessage=='ACCOUNT_INVALID_ACCOUNT_DATA')
										{
											var errormessage='Invalid account data. Your are not allowed to change new bank account.';
										}
										if(errormessage=='INTERNAL_SERVER_ERROR')
										{
											var errormessage='Internal Server Error. Please try again later!.';
										}
									}
									else
									{
										var errormessage = 'Your bank account information is not added.';
									}

									sails.log.info('errorflag ',errorflag);

									errorflag =1;

									sails.log.info('checkbank ',checkbank);
									sails.log.info('errorflag ',errorflag);

									if(checkbank==1 && errorflag==1)
									  {
										var redirectpath ="/servicetransaction/"+userid;
										req.session.errormsg='';
										req.session.errormsg = errormessage;
										return res.redirect(redirectpath);
									  }

								});
							}

							i++;
							//sails.log.info('i ',i);
							//sails.log.info('forlength',forlength);

							if (i == forlength) {
								  //sails.log.info('checkbank : ', checkbank);
								  if(checkbank==0)
								  {
									var redirectpath ="/servicetransaction/"+userid;
									req.session.errormsg='';
									req.session.errormsg = "Your bank account information is not added.";
									return res.redirect(redirectpath);
								  }

								  if(checkbank==1 && errorflag==1)
								  {
									var redirectpath ="/servicetransaction/"+userid;
									req.session.errormsg='';
									req.session.errormsg = "Your bank account information is not added.";
									return res.redirect(redirectpath);
								  }
							 }
					   });
				   });
				});
		}
	}else{

		var redirectpath ="/servicetransaction/"+userid;
		req.session.errormsg='';
		req.session.errormsg = "Enter loan amount";
		return res.redirect(redirectpath);
	}



}

function serviceinfosuccessAction(req,res) {
		res.view("customerService/serviceinfosuccess");
}

function serviceselectaccountinfoaction(req,res){

	var successval = '';

	if(req.session.successval!=''){
		successval =req.session.successval;
		req.session.successval = '';
	  }


		var userid = req.param('id');

		console.log("userid ranjani : ",userid);

	    var criteria = { user: userid,iscompleted : 0};

		Screentracking
		.findOne(criteria)
		.sort("createdAt DESC")
		.then(function (userscreenres) {

				sails.log.info('tranunionid : ', userscreenres.transunion);

				var tranunionid = userscreenres.transunion;
			    var transcriteria = { id: tranunionid};

				Transunions
				  .findOne(transcriteria)
				  .then(function (userAccountres) {

					//	sails.log.info('userAccountres : ', userAccountres);

						    var subTypeArray = [];
							var userAccount = userAccountres.response;

							// sails.log.info('userAccount.product : ', userAccount.product.subject.subjectRecord.custom.credit.trade);

						    if(userAccount.product.subject.subjectRecord && userAccount.product.subject.subjectRecord.custom && userAccount.product.subject.subjectRecord.custom.credit
								&& userAccount.product.subject.subjectRecord.custom.credit.trade
								&& userAccount.product.subject.subjectRecord.custom.credit.trade.length > 0
								&& userAccount.product.subject.subjectRecord.custom.credit.trade[0])
							{
								  var userAccountlist = userAccount.product.subject.subjectRecord.custom.credit.trade;
								  var currentBalance ='';
								  var totalbalance = 0;
								  var numformt = 0;
								  _.forEach(userAccountlist, function (account) {
									var industryCode = account.subscriber.industryCode;
									if ((industryCode === 'B' || industryCode === 'R' || industryCode === 'F') && account.currentBalance > 0 && account.currentBalance < 75000) {

										currentBalance = parseFloat(account.currentBalance);
									    account.currentBalance = currentBalance.toFixed(2);
										totalbalance = totalbalance+currentBalance;

										numformt = account.currentBalance;
										account.currentBalance = numformt.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

									    subTypeArray.push(account);
									}
								  });
						    }
							 sails.log.info('subTypeArray : ', subTypeArray);



						//sails.log.info("screenTrackingData updatedAt:", userscreenres.updatedAt);

						var currentTime = moment();
						var postDate = moment(userscreenres.updatedAt);
						var updatedAt = moment(userscreenres.updatedAt).format();
						sails.log.info("updatedAt:", updatedAt);

						var totalTimeAgo = currentTime.diff(postDate);
						var totalDaysAgo = currentTime.diff(postDate, 'days');
						var totalHoursAgo = currentTime.diff(postDate, 'hours');
						var totalMinutesAgo = currentTime.diff(postDate, 'minutes');
						var totalSecondsAgo = currentTime.diff(postDate, 'seconds');

						sails.log.info("totalSecondsAgo:", totalSecondsAgo);
						sails.log.info("totalMinutesAgo:", totalMinutesAgo);
						sails.log.info("totalHoursAgo:", totalHoursAgo);
						sails.log.info("totalDaysAgo:", totalDaysAgo);
						sails.log.info("totalTimeAgo:", totalTimeAgo);

						if(totalDaysAgo > 2) {
						//if(totalMinutesAgo > 1) {
							var linkExpired = 1;
						} else {
							var linkExpired = 0;
						}
						var totalbalance = totalbalance.toFixed(2);
						totalbalance = totalbalance.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

						var responsedata = {
							message: 'success',
							user: userid,
							accountDetails:subTypeArray,
							successval:successval,
							totalbalance:totalbalance,
							linkExpired:linkExpired
						};
						//sails.log.info('responsedata : ', responsedata);

						sails.log.info("linkExpired:", linkExpired);

						return res.view('customerService/serviceselectaccountinfo', responsedata);

					 })
					  .catch(function (err) {
						 var responsedata = {
							status: 400,
							message: 'No Bank account found.'
						};
						return res.view('customerService/serviceselectaccountinfo', responsedata);
					  });


	    })
		.catch(function (err) {
			 var responsedata = {
				status: 400,
				message: 'No Bank account found.'
			};
			return res.view('customerService/serviceselectaccountinfo', responsedata);
		});
}

function serviceaddconsolidateAction(req, res){

//	var criteria = { id: req.session.userId};
	var accArray = req.param('selectrpf');

		sails.log.info('accArray ',accArray);

	    var criteria = { user: req.param('userid'),iscompleted : 0};

			var userid = req.param('userid');

		Screentracking
		.findOne(criteria)
		.sort("createdAt DESC")
		.then(function (userscreenres) {

			var tranunionid = userscreenres.transunion;
			var transcriteria = { id: tranunionid};

			Transunions
			  .findOne(transcriteria)
			  .then(function (userAccountres) {

						var subTypeArray = [];
						var userAccount = userAccountres.response;

						if(userAccount.product.subject.subjectRecord
							&& userAccount.product.subject.subjectRecord.custom
							&& userAccount.product.subject.subjectRecord.custom.credit
							&& userAccount.product.subject.subjectRecord.custom.credit.trade
							&& userAccount.product.subject.subjectRecord.custom.credit.trade.length > 0 && userAccount.product.subject.subjectRecord.custom.credit.trade[0])
						{
							  var userAccountlist = userAccount.product.subject.subjectRecord.custom.credit.trade;

							  _.forEach(userAccountlist, function (account) {
								var accountNumber = account.accountNumber;
								if (in_array(accountNumber, accArray)) {
									subTypeArray.push(account);
								}
							  });
						}

						sails.log.info('subTypeArray : ', subTypeArray);

						var responsedata = {
							message: 'success',
							user: req.session.userId,
							accountDetails:subTypeArray,
						};
					    sails.log.info('responsedata : ', responsedata);

						Consolidateaccount.addconsolidateaccount(responsedata)
						.then(function (accdet) {

						   var linkedaccid ='';
						   var consoldateid = accdet.id;
						   var myofferdata = '';
						   var userDetails = {id:req.param('userid')};
						   var lastlevel = 5;

						   Screentracking
						  .updateLastScreenName(userDetails,'Accounts to consolidate',lastlevel,responsedata,linkedaccid,consoldateid,[])
						  .then(function(screenTracking) {

								var redirectpath ="/servicetransaction/"+userid;
								return res.redirect(redirectpath);

							})
							.catch(function (err) {
							  sails.log.error('CustomerServiceController#addconsolidateAction :: err :', err);
							  return res.handleError(err);
							});

						})
						.catch(function (err) {
						  sails.log.error('CustomerServiceController#addconsolidateAction :: err :', err);
						  return res.handleError(err);
						});

				 })
				  .catch(function (err) {
					  sails.log.error('CustomerServiceController#addconsolidateAction :: err', err);
					  return res.handleError(err);
				  });

		}).catch(function (err) {
			 sails.log.error('CustomerServiceController#addconsolidateAction :: err', err);
             return res.handleError(err);
		});

}


function emailmyofferAction(req, res) {

	var screenid = req.param('screenid');
	sails.log.info("screenid",screenid);

	Screentracking
    .findOne({id :screenid})
    .then(function(screenTracking){

		var responsedata = {fullData: screenTracking.offerdata,screenid:screenid};
		sails.log.info("responsedata",responsedata);

		res.view("customerService/emailmyoffer", responsedata);

	}).catch(function (err) {
		 sails.log.error('CustomerServiceController#addconsolidateAction :: err', err);
		 return res.handleError(err);
	});
}


function csmyofferAction(req, res)
{
	var screenid = req.param('screenid');
	sails.log.info("screenid",screenid);
	var criteria = { id: screenid,iscompleted : 0};
	Screentracking
    .findOne(criteria)
	.populate('plaiduser')
	.populate('user')
	.then(function (userAccountres) {


		var creditScore = parseFloat(userAccountres.creditscore);

		//var state = 'CA';
		var state = userAccountres.user.state;
		var minimumIncomePlaid = sails.config.plaid.minincomeamount;
		var incomeamount = parseFloat(userAccountres.incomeamount/12).toFixed(2);

		if(userAccountres.accounts!='' && userAccountres.accounts!=null && "undefined" !== typeof userAccountres.accounts)
		{

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
					Loanamountcap
					.find()
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


						//var baseLoanAmountCal = parseFloat(incomeamount * baseltiInterest/100);
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

							var ir= (interestRate/100).toFixed(2);
							var loanPaymentCycle = Math.abs(PaymentManagementService.calculatePMT(parseFloat(ir), parseFloat(loanTerm), parseFloat(financedAmount)));


							var monthlyPayment = Math.abs((loanPaymentCycle*26/12).toFixed(2));
							var perTotMonthlyPayment = monthlySchedulePayment;
							var postTotMonthlyPayment = parseFloat(monthlyPayment) + parseFloat(perTotMonthlyPayment);
							/*var preDTI = ((perTotMonthlyPayment / incomeamount)* 100).toFixed(2);
							var postDTI = (((parseFloat(perTotMonthlyPayment) + parseFloat(monthlyPayment))/incomeamount)* 100).toFixed(2);*/
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


							var csmyofferdata = {incomeamount:incomeamount,state:state,loanTerm:loanTerm,paymentFeq:paymentFeq,interestRate:interestRate,financedAmount:financedAmount,apr:APR,loanPaymentCycle:loanPaymentCycle,monthlyPayment:monthlyPayment,perTotMonthlyPayment:perTotMonthlyPayment,postTotMonthlyPayment:postTotMonthlyPayment,preDTI:preDTI,postDTI:postDTI,postDTIThreshold:postDTIThreshold,loanstatus:loanstatus,firstname:firstname,userid:userid,productid:productid,userAccountres:userAccountres};



							var newResponseValue = {fullData:csmyofferdata,fullDataString:JSON.stringify(csmyofferdata)}
							sails.log.info("csmyofferdata",newResponseValue);
							res.view("customerService/csloanmyoffer", newResponseValue);

							})

						})

							})
							.catch(function (err) {
								 sails.log.error('ScreentrackingController#loanofferinfoAction :: err', err);
								 return res.handleError(err);
							});

						})
						.catch(function (err) {
							 sails.log.error('ScreentrackingController#loanofferinfoAction :: err', err);
							 return res.handleError(err);
						});



			 })
			 .catch(function (err) {
				 sails.log.error('ScreentrackingController#myoffersAction :: err', err);
				 return res.handleError(err);
			 });


		}else{

		    res.view("admin/screentracking/loanofferinfo", {errorcode:'401'});
		}
	})
	.catch(function (err) {
		 sails.log.error('ScreentrackingController#loanofferinfoAction :: err', err);
		 //return res.handleError(err);
		 req.session.successmsg='';
		 req.session.successmsg = 'Offer has been submitted already!';
		 var redirectpath ="/admin/incompleteApplication";
		 return res.redirect(redirectpath);
	});
}

function savecsloanofferAction(req, res)
{
	res.contentType('application/json');
	var fullOffer= JSON.parse(req.param('fullOffer'));
	var userid= req.param('userid');
	var userDetails = {id:userid};
	sails.log.info("userDetails",userDetails);

	var offerdata = {
		incomeamount:fullOffer.incomeamount,
		state:fullOffer.state,
		loanTerm:fullOffer.loanTerm,
		paymentFeq:fullOffer.paymentFeq,
		interestRate:fullOffer.interestRate,
		financedAmount:fullOffer.financedAmount,
		apr:fullOffer.apr,
		loanPaymentCycle:fullOffer.loanPaymentCycle,
		monthlyPayment:fullOffer.monthlyPayment,
		perTotMonthlyPayment:fullOffer.perTotMonthlyPayment,
		postTotMonthlyPayment:fullOffer.postTotMonthlyPayment,
		preDTI:fullOffer.preDTI,
		postDTI:fullOffer.postDTI,
		postDTIThreshold:fullOffer.postDTIThreshold,
		loanstatus:fullOffer.loanstatus,
		firstname:fullOffer.firstname
	};

	Screentracking
	  .updateLastScreenName(userDetails,'Loan Offer Details',4,'','','',[offerdata])
	  .then(function(screenTracking) {

			var userID = screenTracking.user;
			 sails.log.info("screenTrackingscreenTrackingscreenTracking",screenTracking);
			//return 1;
			var redirectpath ="/contract/"+userID;
			return res.redirect(redirectpath);

		})
		.catch(function (err) {
		  sails.log.error('CustomerServiceController#saveloanofferAction :: err :', err);
		  return res.handleError(err);
		});
}

function createpromissorypdfAction(req, res){

	var userid = req.session.userId;
	sails.log.info("userid:", userid);

	Screentracking
	.findOne({user:userid, iscompleted:0})
	.then(function(screentrackingdata) {

		//--for fillout manually option
		var filloutmanually = screentrackingdata.filloutmanually;

		sails.log.info('filloutmanually======>',filloutmanually);

		return BankService.updatefilloutmanualdetails(req,userid,filloutmanually)
		.then( (manualResults) => {
			if( manualResults.account ) {
				/* an account was added manually and we need to make sure it gets linked to the loan */
				return Screentracking.findOne( { user: userid, iscompleted: 0 } )
				.then(function( screentrackingdetails ) {
					screentrackingdetails.accounts = manualResults.account;
					return screentrackingdetails.save()
					.then( () => {
						return manualResults;
					} );
				})
			} else {
				return manualResults;
			}
		} )
		.then( ( manualResults ) => {
            sails.log.info('manualResults======>',manualResults);
			if(manualResults.code==400)
			{
				return res.redirect("/userpromissorynote/"+userid);
			}
			else
			{
				return Screentracking
				.findOne({user:userid, iscompleted:0})
				.populate('user')
				.populate('accounts')
				.populate('practicemanagement')
				.then(function(screentrackingdetails) {
					var applicationReference = screentrackingdetails.applicationReference;
					var userReference = screentrackingdetails.user.userReference;
					var userStatecode = screentrackingdetails.user.state;

					//-- Added for ticket no 2686
					var practiceStatecode = screentrackingdetails.practicemanagement.StateCode;

					req.session.applicationReference = applicationReference;
					req.session.userReference = userReference;

					//var IPFromRequest = req.ip;
					var IPFromRequest = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
					var indexOfColon = IPFromRequest.lastIndexOf(':');
					var ip = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);
					var screenid = screentrackingdetails.id;

					//{documentKey:'202',statecode:userStatecode}
					//-- Added for ticket no 2686
					var agreeCriteria={
						documentKey:'202',
						statecode:practiceStatecode
					}

					Agreement
					.findOne(agreeCriteria)
					.then(function (agreement) {

						UserConsent
						.createConsent(agreement,screentrackingdetails.user,ip,screenid)
						.then(function (userconsentdetails) {

							var consentID = userconsentdetails.id;
							var userID = screentrackingdetails.user.id;

							//sails.log.info("userIDuserID:", userID);

							UserConsent
							.objectdataforpromissory(agreement,screentrackingdetails,userID,req,res)
							.then(function (objectdatas) {

								//-- Update esignature with screen id
								Esignature.update({user_id: userid,active:1}, {screentracking: screenid,consentID:consentID,active:2})
								.exec(function afterwards(err, updated){


									UserConsent
									.createServicePromissoryAgreementPdf(consentID,userID,userconsentdetails,objectdatas,res,req,screentrackingdetails)
									.then(function (agreementpdf) {

										//sails.log.info("agreementpdf:", agreementpdf);

										//-- Genreating shorter version of promissory pdf
										UserConsent
										.createLendingDisclosureAgreement(screentrackingdetails,res,req,ip)
										.then(function (lendingreponse) {

											UserConsent
											.createEftAgreement(screentrackingdetails,userID,res,req,ip)
											.then(function (eftpdf) {

												var redirectpath ="/createloandetails";
												return res.redirect(redirectpath);

											})
											.catch(function (err) {
												sails.log.error('CustomerServiceController#createpromissorypdfAction :: err', err);
												return res.handleError(err);
											});
										})
										.catch(function (err) {
											sails.log.error('CustomerServiceController#createpromissorypdfAction :: err', err);
											return res.handleError(err);
										});
									})
									.catch(function (err) {
										sails.log.error('CustomerServiceController#createpromissorypdfAction :: err', err);
										return res.handleError(err);
									});
								});
							})
							.catch(function (err) {
								sails.log.error('CustomerServiceController#createpromissorypdfAction :: err', err);
								return res.handleError(err);
							});
						})
						.catch(function (err) {
							sails.log.error('CustomerServiceController#createpromissorypdfAction :: err', err);
							return res.handleError(err);
						});
					})
					.catch(function (err) {
						sails.log.error('CustomerServiceController#createpromissorypdfAction :: err', err);
						return res.handleError(err);
					});
				})
				.catch(function (err) {
					sails.log.error('CustomerServiceController#createpromissorypdfAction :: err', err);
					return res.handleError(err);
				});

			}
		})
		.catch(function (err) {
			sails.log.error('createpromissorypdfAction :: err', err);
			return res.handleError(err);
		});
	})
	.catch(function (err) {
		sails.log.error('createpromissorypdfAction :: err', err);
		return res.handleError(err);
	});
}


function myoffersAction(req, res) {

	var	sessionerrorMsg= '';
	if ("undefined" !== typeof req.session.promissoryErrorMsg && req.session.promissoryErrorMsg!='' && req.session.promissoryErrorMsg!=null )
	{
		var	sessionerrorMsg				=	req.session.promissoryErrorMsg;
		req.session.promissoryErrorMsg='';
	}

	//sails.log.info("start::");

	var userid = req.session.userId;
	Screentracking.getApplicationOffer(userid)
	.then(function(responseDetails) {
			sails.log.info('CustomerServiceController#myoffersAction ::::', responseDetails);
			if(responseDetails.code==200)
			{
				if ("undefined" !== typeof sessionerrorMsg && sessionerrorMsg!='' && sessionerrorMsg!=null )
				{
					responseDetails.sessionerrorMsg = sessionerrorMsg;
				}
				res.view("customerService/emailmyoffer", responseDetails);
			}
			else if(responseDetails.code==401)
			{
				//-- Ticket no 2779	(check interest rate available)
				var loanstatus='Declined';
				var declineMessage= "Unable to approve your application as your loan amount and credit score does not meet the requirement"
				req.session.promissoryErrorMsg	=	declineMessage;
				res.view("customerService/emailmyoffer", {loanstatus:responseDetails.loanstatus,sessionerrorMsg:declineMessage});
			}
			else if(responseDetails.code==500)
			{
				var loanstatus='Declined';
				res.view("customerService/emailmyoffer", {loanstatus:responseDetails.loanstatus,sessionerrorMsg:sessionerrorMsg});
			}
			else
			{
				var errorcode= 400;
				var loanstatus = "Declined";
				var errormsg='Unable to generate offer for your income. Please contact administrator to process your loan';
				var screencriteria = { user: userid,iscompleted : 0};
				Screentracking
				.findOne(screencriteria)
				.populate('practicemanagement')
				.populate('user')
				.then(function (userAccountres){

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
								res.view("customerService/emailmyoffer", {errorcode:errorcode,errormsg:errormsg,sessionerrorMsg:sessionerrorMsg,loanstatus:loanstatus});
							});
					 });
				}).catch(function (err) {
					res.view("customerService/emailmyoffer", {errorcode:errorcode,errormsg:errormsg,sessionerrorMsg:sessionerrorMsg,loanstatus:loanstatus});
				});
			}
	}).catch(function (err) {
		 sails.log.error('CustomerServiceController#myoffersAction :: err', err);
		 return res.handleError(err);
	});
}
function filloutfinancedataAction(req, res)
{
	var	userid				=	req.session.userId;
 	var	annualincome		=	req.param('annualincome');
	annualincome			= 	annualincome.replace("$ ","");
 	annualincome			=   annualincome.replace(/,/g , "");
	annualincome 			= 	annualincome.replace(" ","");
 	var	financedAmount			=	req.param('financedAmount');
  	financedAmount 				= 	financedAmount.replace("$ ","");
 	financedAmount			    =   financedAmount.replace(/,/g , "");
	financedAmount 				= 	financedAmount.replace(" ","");
	if(financedAmount > 0)
	{
		var checkcriteria = {
			user: userid,
			iscompleted:0
		}
		Screentracking
		.findOne(checkcriteria)
		.sort("createdAt desc")
		.then(function(screenRes){
			if(screenRes)
			{
				var screenlevel = screenRes.lastlevel;

				var	minloanamount	=	sails.config.plaid.minrequestedamount;
				var	maxloanamount	=	sails.config.plaid.maxrequestedamount;
				if(financedAmount<minloanamount)
				{
					if(screenlevel==3)
					{
						var redirectpath ="/servicetransaction/"+userid;
					}
					else
					{
						var redirectpath ="/addbankaccount/"+userid;
					}
					req.session.errormsg	=	'';
					// req.session.errormsg 	= 	"You can apply minimum loan amount of $"+minloanamount+" in " + sails.config.lender.shortName;
					req.session.errormsg 	= 	"Sorry, that financed amount does not meet the minimum threshold.";
					return res.redirect(redirectpath);
				}
				else
				{
					screenRes.lastlevel				=	4;
					screenRes.filloutmanually 		=	1;
					screenRes.requestedLoanAmount	=	financedAmount;
					screenRes.incomeamount 			=	annualincome;
					// Added borrowerapplication = 1
					screenRes.borrowerapplication   = 	1;
					screenRes.save(function(err){
						var redirectpath 	=	"/emailmyoffer/"+screenRes.id;
						return res.redirect(redirectpath);
					});
				}
			}
			else
			{
				var redirectpath ="/dashboard";
 				return res.redirect(redirectpath);
			}
		}).catch(function (err) {
			var redirectpath ="/dashboard";
 			return res.redirect(redirectpath);
		});

	}
}


function borrowerloanamountconfirmAction(req,res){

	var userid 				=	req.session.userId;
	var incomeamount        =   req.param('incomeamount');
	incomeamount 			= 	incomeamount.replace("$ ","");
	incomeamount			=   incomeamount.replace(/,/g , "");
	incomeamount 		    = 	incomeamount.replace(" ","");
	var financedAmount          =   req.param('financedAmount');
	financedAmount 				= 	financedAmount.replace("$ ","");
	financedAmount			    =   financedAmount.replace(/,/g , "");
	financedAmount 				= 	financedAmount.replace(" ","");

	Screentracking.checkQualifiedAmount(userid,incomeamount,financedAmount)
	.then(function(responseDetails) {

		//sails.log.info('HomeController#loanamountconfirmAction ::::', responseDetails);
		var minmaxchangeTxt='maximum';
		if(responseDetails.code==200)
		{
			var responseData = {
				status: 200,
				message:responseDetails.message,
				prequalifiedAmount:responseDetails.prequalifiedAmount
			};
		}
		else if(responseDetails.code==300)
		{
			if(parseFloat(financedAmount) < parseFloat(responseDetails.prequalifiedAmount))
			{
				minmaxchangeTxt=1;
			}
			var responseData = {
				status: 300,
				message:responseDetails.message,
				prequalifiedAmount:responseDetails.prequalifiedAmount,
				minmaxchangeTxt: minmaxchangeTxt
			};
		}
		else if(responseDetails.code==500)
		{
			var responseData = {
				status: 500,
				message:responseDetails.message
			};
		}
		else if(responseDetails.code==600)
		{
			var responseData = {
				status: 600,
				message:responseDetails.message
			};
		}
		else
		{
			var responseData = {
				status: 400,
				message:responseDetails.message
			};
		}

		sails.log.info('CustomerServiceController#loanamountconfirmAction ::Info::', responseData);

		res.contentType('application/json');
		res.json(responseData);
	}).catch(function (err) {

		 var responseData = {
			status: 400,
			message:err
		};

		sails.log.error('CustomerServiceController#loanamountconfirmAction ::Error::', responseData);

		res.contentType('application/json');
		res.json(responseData);
	});
}

function checkEmailAction(req, res) {

	User.findOne(req.query, function(err, userDup) {
		if(userDup) {
			sails.log("User exists.");
			res.status(409);
			res.json({status: "User exists."});
		}else {
			sails.log("User doesn't exist.");
			res.json({status: "User doesn't exist."});
		}
	})
}
