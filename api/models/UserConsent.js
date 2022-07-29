/* global sails, Agreement, User, Screentracking, Esignature, UserConsent, PlaidUser, State */
/**
 * UserConsent.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q'),
  _ = require('lodash');

var moment =require('moment');
var fs = require('fs');
var pdf = require('html-pdf');
//var contentDisposition = require('content-disposition')
var config = sails.config;
var feeManagement = config.feeManagement;
//var SkipperDisk = require('skipper-disk');
//var path = require('path');

var imageUploadConfig = sails.config.imageUploadConfig;

module.exports = {

  attributes: {
    documentKey: {
      type: 'string'
    },
    documentName: {
      type: 'string'
    },
    documentVersion: {
      type: 'string'
    },
    ip: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    phoneNumber: {
      type: 'string'
    },
    signedAt: {
      type: 'datetime'
    },
    deviceId: {
      type: 'string'
    },
    user: {
      model: 'User'
    },
    story: {
      model: 'Story'
    },
    agreement: {
      model: 'Agreement'
    },
	userconsent: {
      model: 'Userconsent'
    },
	paymentManagement: {
      model: 'paymentManagement'
    },
	loanupdated: {
      type: 'integer',
      defaultsTo: 1
    },
	agreemendocumentPath: {
      type: 'string'
    },
	standardResolution: {
	  type: 'string',
	},
	appApprovedDate: {
      type: 'datetime'
    }
  },
  createConsent: createConsent,
  createConsentfordocuments: createConsentfordocuments,
  createConsentForAgreements: createConsentForAgreements,
  getForAgreement: getForAgreement,
  getAgreementsOfUser: getAgreementsOfUser,
  getDocumentListForUser: getDocumentListForUser,
  updateUserConsentAgreement: updateUserConsentAgreement,
  createPromissoryAgreementPdf:createPromissoryAgreementPdf,
  updateAgreement: updateAgreement,
  objectdataforpdf: objectdataforpdfAction,
  objectdataforpromissory: objectdataforpromissoryAction,
  createLoanAgreementPdf: createLoanAgreementPdf,
  createServicePromissoryAgreementPdf:createServicePromissoryAgreementPdf,
  createStaticEftPdf: createStaticEftPdf,
  createCreditReportPdf: createCreditReportPdf,
  createPlaidReportPdf: createPlaidReportPdf,
  createStaticAgreementPdf:createStaticAgreementPdf,
  createConsentforPdf: createConsentforPdf,
  createDuplicateConsent:createDuplicateConsent,
  objectdataRegenerate:objectdataRegenerate,
  downloadConsentPdf: downloadConsentPdf,
  //reCreatePromissoryPdf: reCreatePromissoryPdf

  createAgreementPdf:createAgreementPdf,
  createEftAgreement:createEftAgreement,
  createLendingDisclosureAgreement:createLendingDisclosureAgreement,
  reGenerateLendingDisclosureAgreement: reGenerateLendingDisclosureAgreement,
  documentUploadProcess:documentUploadProcess
};

function createConsentForAgreements(keys, ip, user) {
  return Q.promise(function(resolve, reject) {

	//console.log("here are the details",keys,ip,user);
    Agreement
      .findAgreement(keys)
      .then(function(agreements) {
        if(!agreements.length){
          return reject("no agreements to sign");
        }

        _.forEach(agreements, function(agreement) {

          // check if user consent for the agreement is already there
          //console.log("one agreement",agreement,user);

          UserConsent
            .getForAgreement(agreement, user)
            .then(function(userConsent) {

				//sails.log.info("userConsent Details : ",userConsent);

              // if not, create it
              if (userConsent) {
				//sails.log.info("it should come if part here");
                userConsent.signedAt = new Date();
                userConsent.save(function(err) {
                  if (err) {
                    sails.log.error("UserConsent#createConsentForAgreements :: Error :: ", err);
                    return reject(err);
                  }
                  return resolve();
                });
              } else {
                //sails.log.info("it should come else part here");

                UserConsent
                .createConsent(agreement, user, ip)
                .then(function(userConsent){
                return resolve();
              })
              .catch(function(err){
                sails.log.error("Error::",err);
                return reject(err);
              })
              }

            })
            .catch(function(err) {

              // If error; probably creates a duplicate consent
              return UserConsent.createConsent(agreement, user, ip);
            });
        });
      })
      .catch(function(err) {
        sails.log.error("UserConsent :: createConsentForAgreement :: Error :: ", err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function getForAgreement(agreement, user) {
  return Q.promise(function(resolve, reject) {
    //console.log("here it is inside getForAgreement",agreement,user);
    var criteria = {
      documentKey: agreement.documentKey,
      deviceId: user.deviceId,
      documentVersion: agreement.documentVersion,
	  user:user.id,
	  loanupdated:1
    };

    UserConsent
      .findOne(criteria)
      .then(resolve)
      .catch(reject)
  });
}

function createConsent(agreement, user, ip, screentrackingId, paymentmanagementId ) {
	return Q.promise(function(resolve, reject) {
		//	sails.log.info("agreement:::::::", agreement);
		return Promise.resolve()
		.then( () => {
			if( screentrackingId && ! paymentmanagementId ) {
				return PaymentManagement.findOne( { user: user, screentracking: screentrackingId } )
				.then( ( paymentmanagement ) => {
					if( paymentmanagement ) {
						paymentmanagementId = paymentmanagement.id;
					}
				} );
			}
		} )
		.then( () => {
			var userConsent = {
				documentName: agreement.documentName,
				documentVersion: agreement.documentVersion,
				documentKey: agreement.documentKey,
				ip: ip,
				phoneNumber: user.phoneNumber,
				signedAt: new Date(),
				user: user,
				agreement: agreement,
				loanupdated: 1
			};
			if( paymentmanagementId ) {
				userConsent.paymentManagement = paymentmanagementId;
			}
			sails.log.info( "UserConsent.createConsent; screentrackingId:", screentrackingId );
			sails.log.info( "UserConsent.createConsent; paymentmanagementId:", paymentmanagementId );
			sails.log.info( "UserConsent.createConsent; userConsent:", JSON.stringify( userConsent ) );

			return UserConsent.create( userConsent )
			.then( function( consent ) {
				// console.log("it is getting created",consent);
				// sails.log.info("UserConsent#createConsent :: created for agreement :: ", userConsent);
				return resolve( consent );
			})
			.catch( function( err ) {
				// supress errors
				sails.log.error("UserConsent :: createConsent :: Error :: ", err );
				return reject( err );
			} );
		} );
	} );
}

function createConsentfordocuments( agreement, user, ip, screenid, create ) {
	return Q.promise( function( resolve, reject ) {
		//	sails.log.info("agreement:::::::", agreement);

		const consentcriteria = {
			user: user.id,
			screenid: screenid,
			documentKey: agreement.documentKey
		};
		UserConsent.findOne( consentcriteria ).then( function( consentData ) {
			if( consentData && !create ) {
				consentData.signedAt = new Date();
				consentData.save( function( err ) {
					if( err ) {
						// return reject(err);
					}
					return resolve( consentData );
				} );
			} else {
				const userConsent = {
					documentName: agreement.documentName,
					documentVersion: agreement.documentVersion,
					documentKey: agreement.documentKey,
					ip: ip,
					phoneNumber: user.phoneNumber,
					//  deviceId: user.deviceId,
					signedAt: new Date(),
					user: user,
					screenid: screenid,
					agreement: agreement,
					loanupdated: 1
				};

				UserConsent.create( userConsent )
				.then( function( consent ) {
					// console.log("it is getting created",consent);
					// sails.log.info("UserConsent#createConsent :: created for agreement :: ", userConsent);

					return resolve( consent );
				} )
				.catch( function( err ) {
					// supress errors
					sails.log.error( "UserConsent :: createConsent :: Error :: ", err );

					return reject( err );
				} );
			}
		} );
	} );
}


function getAgreementsOfUser(user) {
  return Q.promise(function(resolve, reject) {
    var criteria = {
      user: user
    };
    UserConsent
      .find(criteria)
      .then(function(userConsents) {
        return resolve(userConsents)
      })
      .catch(function(err) {
        sails.log.error("UserConsent#getAgreementsOfUser :: Error :: ", err);

        return reject(err);
      });
  });
}

function getDocumentListForUser(user,payID) {
  return Q.promise(function(resolve, reject) {
    var criteria = {
      user: user.id
    };
    UserConsent
      .find(criteria)
      .populate('agreement')
      .then(function (agreements) {

	//	sails.log.info("Agreement length ::", agreements.length);

		if(agreements.length>5)
		{
			var paidcriteria = {
			  user: user.id,
			  paymentManagement: payID
			};

			   UserConsent
			  .find(paidcriteria)
			  .populate('agreement')
			  .then(function (paidagreements) {
				  //sails.log.info("agreements: ",agreements);
       		 	  return resolve(paidagreements);
			  })
			  .catch(function (err) {
				sails.log.error("UserConsent#getDocumentListForUser :: Error", err);
				return reject({
				  code: 500,
				  message: 'INTERNAL_SERVER_ERROR'
				});
			 });
		}
		else
		{
			 sails.log.info("agreements: ",agreements);
       		 return resolve(agreements);
		}
      })
      .catch(function (err) {
        sails.log.error("UserConsent#getDocumentListForUser :: Error", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}


function updateUserConsentAgreement(agreementId, userId, payId) {
  return Q.promise(function(resolve, reject) {
	   var criteria = {
		  id: agreementId,
		  user:userId,
		  loanupdated:1
	   };

	  UserConsent
	  .findOne(criteria)
	  .then(function (userConsent) {

		 if (userConsent)
		 {
			userConsent.paymentManagement = payId;
			userConsent.loanupdated = 1;
			userConsent.save(function(err) {
			  if (err) {
				sails.log.error("UserConsent#createConsentForAgreements :: Error :: ", err);
			  }

			});
         }
		 else
		 {
		 	return resolve(userConsent);
		 }
	  })
      .catch(function (err) {
        sails.log.error("UserConsent#updateUserConsentAgreement :: Error", err);
        return;
      });
  });
}

function createPromissoryAgreementPdf( consentID, userID, userConsent, objectdatas, promCheckboxes, resdata, reqdata ) {
	return Q.promise(function(resolve, reject) {
			sails.log.info( "UserConsent.js createPromissoryAgreementPdf userID ", userID );

			var signatureExistRIC = 0;
			var signatureExistArbitration = 0;
			var signatureIdRIC = "";
			var signatureIdArbitration = "";
			var agreementsignpathRIC = "";
			var agreementsignpathPromNote = "";
			var todaydate = moment().format('MM/DD/YYYY');
			// var ip = ( req.headers[ "x-forwarded-for" ] || req.headers[ "x-real-ip" ] || req.connection.remoteAddress ).replace( "::ffff:", "" ).replace( /^::1$/, "127.0.0.1" );
			Agreement.findOne( { id: userConsent.agreement } )
			.then( ( agreementDetail ) => {
				var replacedFilename = agreementDetail.documentName.split(' ').join('_');
				var applicationReference = reqdata.session.applicationReference;
				var pdfFileName ='./'+applicationReference+'_'+replacedFilename+'_'+Math.round(+new Date()/1000)+'.pdf';
				var IPFromRequest = userConsent.ip;
				var indexOfColon = IPFromRequest.lastIndexOf(':');
				var ipaddr = IPFromRequest.substring( indexOfColon + 1, IPFromRequest.length );

				Esignature.find( { user_id: userID } )
				.then( ( signatureDetails ) => {
					if( signatureDetails.length > 0 ) {
						for(var i = 0; i < signatureDetails.length; i++) {
							if( signatureDetails[i].type == 12 ) {
								// RIC signature exists
								signatureExistRIC = 1;
								signatureIdRIC = signatureDetails[i].id;
								agreementsignpathRIC = Utils.getS3Url( signatureDetails[i].standardResolution );
							}
							if( signatureDetails[i].type == 13 ) {
								// Arbitration signature exists
								signatureExistArbitration = 1;
								signatureIdArbitration = signatureDetails[i].id;
								agreementsignpathPromNote = Utils.getS3Url( signatureDetails[i].standardResolution );
							}
						}
					}

					var fname = objectdatas.fname;
					var lname = objectdatas.lname;
					var loanamaount = objectdatas.amount;
					var interestRateAmount = parseFloat(objectdatas.interestRate*12).toFixed(2);
					var agreementObject = {
						user: fname,
						date: moment.utc(new Date()).format(),
						agreement: agreementDetail
					};

					Transunions.findOne( { user: userID } )
					.then( ( transunionsdetails ) => {
						//var socialnumber = transunionsdetails.response.product.subject.subjectRecord.indicative.socialSecurity.number;
						//var socialnumber = socialnumber.replace(/.(?=.{4})/g, 'X');

						Screentracking.findOne( { user: userID, iscompleted: 0 } )
						.populate('accounts')
						.populate('plaiduser')
						.populate('transunion')
						.populate('user')
						.then( ( screentrackingdetails ) => {
							var accountName = "Installment Loan";
							var accountNumberLastFour = screentrackingdetails.accounts.accountNumberLastFour;
							var loanholderstreetname = screentrackingdetails.user.street;
							var loanholdercity = screentrackingdetails.user.city;
							var loanholderzipcode = screentrackingdetails.user.zipCode;
							var loanstate = screentrackingdetails.user.state;
							var unitapt = screentrackingdetails.user.unitapt;
							var accountNumber = screentrackingdetails.accounts.accountNumber;
							var routingNumber = screentrackingdetails.accounts.routingNumber;
							var practicemanagementID = screentrackingdetails.user.practicemanagement;
							UserBankAccount.findOne( { user: userID } )
							.then( ( bankDetails ) => {
								var bankName = bankDetails.institutionName;

								User.findOne( { id: userID } )
								.then( (userdetails) => {
									var addressobj = {
										accountName:accountName,
										accountNumberLastFour:accountNumberLastFour,
										loanholderstreetname:loanholderstreetname,
										loanholdercity:loanholdercity,
										loanholderzipcode:loanholderzipcode,
										phonenumber:userdetails.phoneNumber,
										loanstate:loanstate,
										unitapt:unitapt,
									}
									sails.log.info( "agreementObject.agreement.documentPath:", agreementObject.agreement.documentPath );

									frequency = screentrackingdetails.offerdata.paymentFrequency;
									if( frequency == "loan.frequency.weekly") { frequency = "Weekly"; }
									else if( frequency == "loan.frequency.biWeekly") { frequency = "Bi-Weekly"; }
									else if( frequency == "loan.frequency.semiMonthly") { frequency = "Semi-Monthly"; }
									else { frequency = "Monthly"; }

									let offerdata = {};
									if( Array.isArray( screentrackingdetails.offerdata ) ) {
										offerdata = screentrackingdetails.offerdata[ 0 ];
									} else {
										offerdata = screentrackingdetails.offerdata;
									}

									const tmpfrequency = ApplicationService.getPaymentFrequency( offerdata.paymentFrequency, true );
									let tmp = {
										amountFinanced: offerdata.financedAmount,
										financeCharge: parseFloat( offerdata.financeCharge ),
										downpayment: offerdata.downPayment
									};

									PracticeManagement.findOne( { id: practicemanagementID } )
									.then( ( practicemanagementData ) => {
										var responseData = {
											obj: objectdatas,
											interestRate: parseInt( offerdata.interestRate ),
											fundingDate: moment( Date.now() ).format( "MM/DD/YYYY" ),
											loanID: screentrackingdetails.applicationReference,
											loanTerm: offerdata.term,
											frequency: tmpfrequency,
											paymentAmount: parseFloat( offerdata.monthlyPayment ),
											firstPaymentDate: moment().add( 30, "days" ).format( "MM/DD/YYYY" ),
											downpayment: tmp.downpayment,
											apr: parseFloat( parseFloat( offerdata.apr ).toFixed( 2 ) ),
											financeCharge: tmp.financeCharge,
											amountFinanced: tmp.amountFinanced,
											totalOfPayments: tmp.amountFinanced + tmp.financeCharge,
											totalSalePrice: tmp.amountFinanced + tmp.financeCharge + tmp.downpayment,
											cashPrice: tmp.amountFinanced + tmp.downpayment,
											loanamaount: loanamaount,
											fname: fname,
											lname: lname,
											addressobj: addressobj,
											type: "pdf",
											interestRateAmount: interestRateAmount,
											accountNumber: accountNumber,
											routingNumber: routingNumber,
											firstUserName: userdetails.promName1,
											secondUserName: userdetails.promName2,
											phoneNumber: userdetails.promNumber,
											userName: userdetails.firstname + " " + userdetails.lastname,
											street: userdetails.street,
											city: userdetails.city,
											state: userdetails.state,
											zipCode: userdetails.zipCode,
											unitapt: userdetails.unitapt,
											applicationReference: screentrackingdetails.applicationReference,
											totalLoanAmount: parseFloat( parseFloat( offerdata.financedAmount ).toFixed( 2 ) ).toLocaleString( "en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 } ),
											bankName: bankDetails.institutionName,
											bankAccountType: screentrackingdetails.accounts.accountSubType,
											bankRoutingNumber: routingNumber,
											bankAccountNumber: accountNumber,
											signatureExistRIC: signatureExistRIC,
											signatureExistArbitration: signatureExistArbitration,
											signatureIdRIC: signatureIdRIC,
											signatureIdArbitration: signatureIdArbitration,
											agreementsignpathRIC: agreementsignpathRIC,
											agreementsignpathPromNote: agreementsignpathPromNote,
											todaydate: todaydate,
											ip: ipaddr,
											isPdf: true,
											eftaCheckbox: promCheckboxes.eftaCheckbox,
											practiceRICPath: agreementObject.agreement.documentPath + "_pdf.nunjucks",
											providerName: practicemanagementData.PracticeName,
											providerAddress: practicemanagementData.StreetAddress,
											providerCity: practicemanagementData.City,
											providerState: practicemanagementData.StateCode,
											providerZip: practicemanagementData.ZipCode,
											providerPhone: practicemanagementData.PhoneNo.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3"),
											providerEmail: practicemanagementData.PracticeEmail,
											servicesDescription: practicemanagementData.servicesDescription,
											providerLateFee: practicemanagementData.providerLateFee,
											applicationFee: practicemanagementData.applicationFee
										};
										const pdfHeader = `<div style='text-align: center;'>${ responseData.providerName }</div><div style='text-align: center;'>${ responseData.providerAddress }&nbsp;${ responseData.providerCity },&nbsp;${ responseData.providerState }&nbsp;${ responseData.providerZip }</div>`;
										resdata.render( "document/pdfwrapper.nunjucks", responseData, function( err, list ) {
											var options = {
												"format": "Letter",
												"orientation": "portrait",
												"zoomFactor": "1",
												"type": "pdf",
												"quality": "75",
												"paginationOffset": 1,
												"border": {
													"top": "25px",
													"right": "15px",
													"bottom": "25px",
													"left": "15px"
												},
												"header": {
													"height": "28mm",
													"contents": pdfHeader
												}
											};
											// TODO remove before check in testing only
											// fs.writeFileSync( "test.html", list, "utf8" );
											pdf.create( list, options ).toFile( pdfFileName, function( err, result ) {
											if( err ) { return reject( err ); }

											UserConsent.findOne( { id: consentID } )
											.then(function (userConsentData) {
												S3Service.uploadPromissoryAgreementAsset( pdfFileName, userConsentData, reqdata )
												.then( () => {
													return resolve( userConsentData );
												} );
											})
											.catch(function (err) {
													return reject(err);
											});
										})
										});
									} );
								});
							} );
						} );
					} );
				} );
			} )
		.catch(function (err) {
				return reject(err);
			} );
	} );
}

function servicecreatePromissoryAgreementPdf( consentID, userID, userConsent, objectdatas, resdata, reqdata ) {
	return Q.promise(function(resolve, reject) {
		Agreement.findOne( {id: userConsent.agreement } )
		.then( function( agreementDetail ) {
			// sails.log.info("userConsent.agreement:", agreementDetail);
			var replacedFilename = agreementDetail.documentName.split(' ').join('_');
			var applicationReference = reqdata.session.applicationReference;
			var pdfFileName = './' + applicationReference + '_' + replacedFilename + '_' + Math.round(+new Date()/1000) + '.pdf';
			var IPFromRequest = userConsent.ip;
			var indexOfColon = IPFromRequest.lastIndexOf( ':' );
			var ipaddr = IPFromRequest.substring( indexOfColon + 1, IPFromRequest.length );
			var signaturecriteria = { user_id: userID };
			// var userReference = reqdata.session.userReference;
			// var pdfFileName ='./'+applicationReference+'_'+replacedFilename+'.pdf';
			// sails.log.info("replacedFilename:", replacedFilename);
			// sails.log.info("pdfFileName:",pdfFileName);
			//	sails.log.info("Userconsent:::objectdatas:",objectdatas);

			Esignature.findOne(signaturecriteria)
				.then(function(signatureDetails) {

			//	sails.log.info("signatureDetailssignatureDetails:",signatureDetails);

				/*var objectname = objectdatas.name;
				var username = objectname.toString();
				var fullname = username.split(' ');
				var fname = fullname[0];
				var lname = fullname[2];*/
				var fname = objectdatas.fname;
  				var lname = objectdatas.lname;

				var agreementObject = {
				  user : fname,
				  date : moment.utc(new Date()).format(),
				  agreement:agreementDetail,
				};
				var agreementsignpath = Utils.getS3Url(signatureDetails.standardResolution);
			//	sails.log.info("agreementsignpath:",agreementsignpath);

					Transunions
					.findOne({user:userID})
					.then(function(transunionsdetails) {

						var socialnumber = transunionsdetails.response.product.subject.subjectRecord.indicative.socialSecurity.number;
					//	sails.log.info("socialnumber:", socialnumber);
						var socialnumber = socialnumber.replace(/.(?=.{4})/g, 'X');

						Screentracking
						.findOne({user:userID,iscompleted : 0})
						.populate('accounts')
						.populate('plaiduser')
						.populate('transunion')
						.populate('user')
						.then(function(screentrackingdetails) {

						    //sails.log.info("screentrackingdetails:", screentrackingdetails);
							//sails.log.info("screentrackingdetails:**********&&&&&&&&", screentrackingdetails);
							var accountName = "Installment Loan";
							//var accountName = screentrackingdetails.accounts.accountName;
							var accountNumberLastFour ='';
							if(screentrackingdetails.accounts)
							{
								var accountNumberLastFour = screentrackingdetails.accounts.accountNumberLastFour;
							}
							/*var loanholderstreetname = screentrackingdetails.plaiduser.addresses[0].data.street;
							var loanholderstreetnumber = screentrackingdetails.plaiduser.addresses[0].data.street;
							var loanholdercity = screentrackingdetails.plaiduser.addresses[0].data.city;
							var loanholderzipcode = screentrackingdetails.plaiduser.addresses[0].data.state;*/
							//var loanholderzipcode = screentrackingdetails.offerdata[0].financedAmount;

							    var loanholderstreetname = screentrackingdetails.user.street;
								var loanholderstreetnumber = screentrackingdetails.user.street;
								var loanholdercity = screentrackingdetails.user.city;
								var loanholderzipcode = screentrackingdetails.user.zipCode;
								var loanstate = screentrackingdetails.user.state;
								var unitapp = screentrackingdetails.user.unitapp;

							User
								.findOne({id:userID})
								.then(function(userdetails) {

									var addressobj = {

										accountName:accountName,
										accountNumberLastFour:accountNumberLastFour,
										loanholderstreetname:loanholderstreetname,
										loanholdercity:loanholdercity,
										loanholderzipcode:loanholderzipcode,
										phonenumber:userdetails.phoneNumber,
										loanstate:loanstate,
										unitapp:unitapp,
									}

					resdata.render(agreementObject.agreement.documentPath, { obj:objectdatas, ip :ipaddr, agreementsignpath: agreementsignpath,fname:fname,lname:lname,socialnumber:socialnumber,addressobj:addressobj,type:'pdf'}, function(err, list){
						var options = {
										"format": "Letter",
										"orientation": "portrait",
										"zoomFactor": "1",
										"type": "pdf",
										"quality": "75",
										"paginationOffset": 1,
										"border": {
													"top": "25px",
													"right": "15px",
													"bottom": "25px",
													"left": "15px"
												  }
									  };
						pdf.create(list, options).toFile(pdfFileName, function(err, result) {
							  if (err)
							  {
								  return reject(err);
							  }

							  var criteria = {
							   id: consentID
							  };

							  sails.log.info("criteria:",criteria);

							  UserConsent
							  .findOne(criteria)
							  .then(function (userConsentData) {

								 // sails.log.info("userConsentData:",userConsentData);

								  S3Service.uploadPromissoryAgreementAsset(pdfFileName,userConsentData,reqdata);

								  sails.log.info("after s3:");

								  return resolve(userConsentData);

							 })
							 .catch(function (err) {
								return reject(err);
							 });
						  })
						 /* .catch(function (err) {
							return reject(err);
						 });*/
					});
					});

				})
			})
		})
	})
	    .catch(function (err) {
			return reject(err);
		});
   });
}

function createLoanAgreementPdf(consentID,userID,userConsent,objectdatas,resdata){
  return Q.promise(function(resolve, reject) {


	//	sails.log.info("userConsent:", userConsent);
		 Story
          .findOne({
            user: userID,
			storytype: 'userloan',
    		isDeleted: false,
          })
          .populateAll()
		  .sort("createdAt DESC")
          .then(function(storyDetail) {

		//	sails.log.info("storyDetail123:", storyDetail);
			if(storyDetail)
			{

				Agreement
         		.findOne({id: userConsent.agreement})
				.then(function(agreementDetail) {

				//	sails.log.info("userConsent.agreement:", agreementDetail);

					var replacedFilename = agreementDetail.documentName.split(' ').join('_');

					//var pdfFileName ='./'+storyDetail.storyReference+'_'+replacedFilename+'.pdf';

					var pdfFileName ='./'+storyDetail.storyReference+'_'+replacedFilename+'_'+Math.round(+new Date()/1000)+'.pdf';

				//	sails.log.info("replacedFilename:", replacedFilename);

				//	sails.log.info("pdfFileName:",pdfFileName);

					var IPFromRequest = userConsent.ip;
					var indexOfColon = IPFromRequest.lastIndexOf(':');
					var ipaddr = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);

					var userdata = storyDetail.user;


					//sails.log.info("Userconsent:::objectdatas:",objectdatas);

					var signaturecriteria = {user_id: storyDetail.user.id};


					Esignature.findOne(signaturecriteria)
	  				.then(function(signatureDetails) {

				//	sails.log.info("signatureDetailssignatureDetails:",signatureDetails);

					var agreementObject = {
					  user : userdata.firstname,
					  date : moment.utc(new Date()).format(),
					  agreement:agreementDetail,
					};
					var agreementsignpath = Utils.getS3Url(signatureDetails.standardResolution);
				//	sails.log.info("agreementsignpathagreementsignpath:",agreementsignpath);

					resdata.render(agreementObject.agreement.documentPath, { obj:objectdatas, ip :ipaddr, agreementsignpath: agreementsignpath ,type:'pdf'}, function(err, list){
						var options = {
										"format": "Letter",
										"orientation": "portrait",
										"zoomFactor": "1",
										"type": "pdf",
										"quality": "75",
										"paginationOffset": 1,
										"border": {
													"top": "50px",
													"right": "15px",
													"bottom": "50px",
													"left": "15px"
												  }
									  };
						pdf.create(list, options).toFile(pdfFileName, function(err, result) {
							  if (err)
							  {
								  return reject(err);
							  }

							  var criteria = {
							   id: consentID
							  };

							//  sails.log.info("criteria:",criteria);

							  UserConsent
							  .findOne(criteria)
							  .then(function (userConsentData) {

								//  sails.log.info("userConsentData:",userConsentData);

								  S3Service.uploadAgreementAsset(pdfFileName,userConsentData,storyDetail);

								//  sails.log.info("after s3:");

								  return resolve(userConsentData);

							 })
							 .catch(function (err) {
								return reject(err);
							 });
						  })
						 /* .catch(function (err) {
							return reject(err);
						 });*/
					});
					});
				})
				.catch(function (err) {
					return reject(err);
				});
			}
			else
			{
				 return reject({code:400});
			}

		})
	    .catch(function (err) {
			return reject(err);
		});
   });
}



function updateAgreement(achdocuments, assetEntity){

/*	 return Q.promise(function(resolve, reject) {
		if (!achdocuments || !assetEntity) {
		  sails.log.error("Achdocuments#updateDocumentProof :: Error :: insufficient data");

		  return reject({
			code: 500,
			message: 'INTERNAL_SERVER_ERROR'
		  });
		}

		var searchCriteria = {
			id: achdocuments.id
		  },
		  updates = {
			proofdocument: assetEntity.id
		  };

		Achdocuments
		  .update(searchCriteria, updates)
		  .then(function() {

			return resolve();
		  })
		  .catch(function(err) {
			sails.log.error("Achdocuments#updateDocumentProof :: err : ", err);
			return reject(err);
		  });
	  });
	*/

}

function objectdataforpdfAction( userID, reqdata, resdata ) {
	return Q.promise( ( resolve, reject ) => {
	var criteria = { documentKey: '120' };
	Agreement.find( criteria )
    .then( ( agreements ) => {
		var criteria = { user: userID };
		Screentracking.findOne( criteria )
		.populate( 'user' )
		.populate( 'accounts' )
		.then( ( userscreenres ) => {
			// sails.log.info('userscreenres***** : ', userscreenres);
			var userid = userscreenres.user.id;
			var palidcriteria = { user: userid };

			PlaidUser.findOne( palidcriteria )
			.then( ( userres ) => {
				var stateCode = userscreenres.user.state;
				var statecriteria = { stateCode: stateCode };

				State.findOne( statecriteria )
				.then(function (state) {
					// sails.log.info('state : ', state);
					if (!state) {
						state = {
							name: userscreenres.user.state,
							stateCode: ''
						}
					}

					var stateName = "";
					if( state.name ) {
						stateName = state.name;
					} else {
						stateName = userscreenres.user.state;
					}

					var state = state.stateCode;
					if( state.stateCode ) {
						var state = state.stateCode;
					} else {
						var state = userscreenres.user.state;
					}

					var fname = userscreenres.user.firstname;
					var lname = userscreenres.user.lastname;
					// sails.log.info('names : ', names);

					/* var street = userres.addresses[0].data.street;
					var city = userres.addresses[0].data.city;
					var state = userres.addresses[0].data.state;
					var zipCode = userres.addresses[0].data.zip; */
					var street = userscreenres.user.street;
					var city = userscreenres.user.city;
					var zipCode = userscreenres.user.zipCode;
					var unitapp = userscreenres.user.unitapp;
					if( userscreenres.user.unitapp ) {
						var unitapp	=  userscreenres.user.unitapp;
					} else {
						var unitapp	= '';
					}
					if( userscreenres.offerData ) {
						var financedAmount = userscreenres.offerdata[0].financedAmount;
						var interestRate = userscreenres.offerdata[0].interestRate;
						var appfeerate = 0;
						var loanTerm = userscreenres.offerdata[0].loanTerm;
					}

					PaymentManagement.getLoanPaymentSchedule(userscreenres)
					.then(function(paymentDetails) {

						/* sails.log.info('userDetails2 : ', "here"); */
						var docversion = agreements[0].documentVersion;
						var schedulecount = paymentDetails.length;
						//sails.log.info('schedulecount : ', schedulecount);
						//sails.log.info('paymentDetails : ', paymentDetails);

						var annualPercentageRate =interestRate;
						var maturityDate = moment().startOf('day').add(loanTerm, 'months');

						if( annualPercentageRate > 0 ) {
							/* var annualPercentageRate = interestRate;
							var  decimalRate = (annualPercentageRate / 100) / 12;
							var xpowervalue = decimalRate + 1;
							var ypowervalue = loanTerm;
							var powerrate_value= Math.pow(xpowervalue,ypowervalue) - 1;
							scheduleLoanAmount = ( decimalRate + ( decimalRate / powerrate_value ) ) * financedAmount;
							scheduleLoanAmount = scheduleLoanAmount.toFixed(2); */
							var scheduleLoanAmount = 0;
							PaymentManagement.biweeklyCalculate( financedAmount, interestRate, loanTerm )
							.then( function( scheduleLoanAmt ) {
								// sails.log.info("re scheduleLoanAmt: ",scheduleLoanAmt);
								scheduleLoanAmount = scheduleLoanAmt;
								sails.log.info("scheduleLoanAmount: ", scheduleLoanAmount);
								checktotalLoanAmount = scheduleLoanAmount*loanTerm;
								sails.log.info("checktotalLoanAmount: ",checktotalLoanAmount);
								creditcost = checktotalLoanAmount-financedAmount;
								creditcost =  parseFloat(creditcost.toFixed(2));
								checktotalLoanAmount =  parseFloat(checktotalLoanAmount.toFixed(2));

								var obj = {
									amount: financedAmount,
									address: street,
									fname: fname,
									lname: lname,
									date: moment().format('MM/DD/YYYY'),
									interestRate: interestRate,
									month: loanTerm,
									agreement: agreements,
									createdDate: moment().format(),
									endDate: moment().add(loanTerm, 'months').format(),
									signedDate: new Date(),
									paymentschedule: paymentDetails,
									schedulecount:paymentDetails.length,
									annualPercentageRate: interestRate,
									apr:userscreenres.offerdata[0].apr,
									loannumber:userscreenres.applicationReference,
									checktotalLoanAmount:checktotalLoanAmount,
									creditcost:creditcost,
									street: street,
									stateName:stateName,
									stateCode:state,
									city:city,
									zipCode:zipCode,
									accountDetail: userscreenres.accounts,
									unitapp:unitapp
								};

								return resolve(obj);
								//return resolve();
							});
						} else {
							var creditcost =  0;
							creditcost =  parseFloat(creditcost.toFixed(2));
							checktotalLoanAmount =  parseFloat(checktotalLoanAmount.toFixed(2));

							var obj = {
								amount: financedAmount,
								address: street,
								fname: fname,
								lname: lname,
								date: moment().format('MM/DD/YYYY'),
								interestRate: interestRate,
								month: loanTerm,
								agreement: agreements,
								createdDate: moment().format(),
								endDate: moment().add(loanTerm,'months').format(),
								signedDate: new Date(),
								paymentschedule:paymentDetails,
								schedulecount:paymentDetails.length,
								annualPercentageRate: interestRate,
								loannumber:userscreenres.applicationReference,
								checktotalLoanAmount:checktotalLoanAmount,
								creditcost:creditcost,
								street: street,
								stateName:stateName,
								stateCode:state,
								city:city,
								zipCode:zipCode,
								accountDetail: userscreenres.accounts,
								unitapp:unitapp
							};
							// sails.log.info("objdata :", obj);
							sails.log.info("checktotalLoanAmount :", scheduleLoanAmount);
							sails.log.info("checktotalLoanAmount :", loanTerm);
							return resolve(obj);
							// return resolve();
						}
					} )
					.catch(function(err) {
						 sails.log.error('Userconsent#objectdataforpdfAction :: err', err);
						 return reject(err);
					} );
				}) //state
			  	.catch(function (err) {
					sails.log.error('Userconsent#objectdataforpdfAction :: err', err);
					return reject(err);
				});
			})
			.catch(function (err) {
				 sails.log.error('Userconsent#objectdataforpdfAction :: err', err);
				 return reject(err);
			});
		})
		.catch(function (err) {
			 sails.log.error('Userconsent#objectdataforpdfAction :: err', err);
			 return reject(err);
		});
    })
    .catch(function (err) {
         sails.log.error('Userconsent#objectdataforpdfAction :: err', err);
		 return reject(err);
    });
});
}


function objectdataforpromissoryAction( userID, reqdata, resdata) {
	return Q.promise(function(resolve, reject) {
	var criteria = {
			  documentKey:'131',
	};
	Agreement.find(criteria)
    .then(function (agreements) {

		var criteria = { user: userID, iscompleted: 0 };
		sails.log.info('criteria userconsent: ', criteria);

		Screentracking.findOne( criteria )
		.populate( 'user' )
		.populate( 'accounts' )
		.then(function (userscreenres) {
			var userid = userscreenres.user.id;
			var palidcriteria = { user: userid };

			PlaidUser.findOne(palidcriteria)
			.then(function ( userres ) {

				var stateCode = userscreenres.user.state;
				var statecriteria = { stateCode: stateCode };
				State.findOne(statecriteria)
				  .then(function (state) {

		       // sails.log.info('state : ', state);

				var stateName = state.name;
					if( state.name ) {

					var stateName = state.name;
					} else {

						var stateName	= userscreenres.user.state;
					}

					var state = state.stateCode;
					if( state.stateCode ) {

					var state = state.stateCode;
					} else {

						var state = userscreenres.user.state;
					}

					var fname = userscreenres.user.firstname;
					var lname = userscreenres.user.lastname;
					var street = userscreenres.user.street;
					var city = userscreenres.user.city;
					var state = userscreenres.user.state;
					var zipCode = userscreenres.user.zipCode;
				//sails.log.info('paymentDetails:********** ',userscreenres.user.unitapt);
					if( userscreenres.user.unitapt ) {
					var unitapt	=  userscreenres.user.unitapt;
					}else{
						var unitapt	= '';
					}

				var financedAmount = userscreenres.offerdata[0].financedAmount;
				var interestRate = userscreenres.offerdata[0].interestRate;
				var appfeerate = 0;
				var loanTerm = userscreenres.offerdata[0].loanTerm;

					PaymentManagement.getLoanPaymentSchedule(userscreenres)
					  .then(function(paymentDetails) {

						sails.log.info('paymentDetails: ', paymentDetails);

						var docversion = agreements[0].documentVersion;
						var schedulecount = paymentDetails.length;

						var annualPercentageRate =interestRate;
						var maturityDate = moment().startOf('day').add(loanTerm, 'months');

						if(annualPercentageRate>0)
						{

							var scheduleLoanAmount = 0 ;
							PaymentManagement.biweeklyCalculate(financedAmount,interestRate,loanTerm)
							.then(function(scheduleLoanAmt) {
								scheduleLoanAmount = scheduleLoanAmt;

								checktotalLoanAmount = scheduleLoanAmount*loanTerm;
								creditcost = checktotalLoanAmount-financedAmount;
								creditcost =  parseFloat(creditcost.toFixed(2));
								checktotalLoanAmount =  parseFloat(checktotalLoanAmount.toFixed(2));

								var obj = {
									  amount: financedAmount,
									  address: street,
									  fname: fname,
									  lname: lname,
									  date: moment().format('MM/DD/YYYY'),
									  interestRate: interestRate,
									  month: loanTerm,
									  agreement: agreements,
									  createdDate: moment().format(),
									  endDate: moment().add(loanTerm,'months').format(),
									  signedDate: new Date(),
									  paymentschedule:paymentDetails,
									  schedulecount:paymentDetails.length,
									  annualPercentageRate: interestRate,
									  apr:userscreenres.offerdata[0].apr,
									  loannumber:userscreenres.applicationReference,
									  checktotalLoanAmount:checktotalLoanAmount,
									  creditcost:creditcost,
									  street: street,
									  stateName:stateName,
									  stateCode:state,
									  city:city,
									  zipCode:zipCode,
									  accountDetail: userscreenres.accounts,
									  unitapt:unitapt,
									};

								return resolve( obj );
							});
						}
						else
						{
							var creditcost =  0;
							creditcost =  parseFloat(creditcost.toFixed(2));
							checktotalLoanAmount =  parseFloat(checktotalLoanAmount.toFixed(2));

								var obj = {
									amount: financedAmount,
									address: street,
									fname: fname,
									lname: lname,
									date: moment().format('MM/DD/YYYY'),
									interestRate: interestRate,
									month: loanTerm,
									agreement: agreements,
									createdDate: moment().format(),
									endDate: moment().add(loanTerm,'months').format(),
									signedDate: new Date(),
									paymentschedule:paymentDetails,
									schedulecount:paymentDetails.length,
									annualPercentageRate: interestRate,
									loannumber:userscreenres.applicationReference,
									checktotalLoanAmount:checktotalLoanAmount,
									creditcost:creditcost,
									street: street,
									stateName:stateName,
									stateCode:state,
									city:city,
									zipCode:zipCode,
									accountDetail: userscreenres.accounts,
									unitapt:unitapt,
								};

							return resolve( obj );
						}

					})
					.catch(function (err) {
						 sails.log.error('Userconsent#objectdataforpdfAction :: err', err);
						 reject(err);
					});
				  })
			       .catch(function (err) {
				 sails.log.error('Userconsent#objectdataforpdfAction :: err', err);
				 return res.handleError(err);
		       });
			})
			.catch(function (err) {
				 sails.log.error('Userconsent#objectdataforpdfAction :: err', err);
				 return res.handleError(err);
			});

		})
		.catch(function (err) {
			 sails.log.error('Userconsent#objectdataforpdfAction :: err', err);
			 return res.handleError(err);
		});

			})
			.catch(function (err) {
				 sails.log.error('Userconsent#objectdataforpdfAction :: err', err);
				reject(err);
			});

    });
}

function createServicePromissoryAgreementPdf(consentID,userID,userConsent,objectdatas,resdata,reqdata){
	return Q.promise(function(resolve, reject) {

		  Agreement
		  .findOne({id: userConsent.agreement})
		  .then(function(agreementDetail) {

			  //sails.log.info("userConsent.agreement:", agreementDetail);

			  var replacedFilename = agreementDetail.documentName.split(' ').join('_');

			   var userReference = reqdata.session.userReference;
			   var applicationReference = reqdata.session.applicationReference;



			  var application_val = reqdata.session.applicationReference;

			  //var pdfFileName ='./'+application_val+'_'+replacedFilename+'.pdf';

			  var pdfFileName ='./'+application_val+'_'+replacedFilename+'_'+Math.round(+new Date()/1000)+'.pdf';

			  /*sails.log.info("userReference:",userReference);
			  sails.log.info("applicationReference:",applicationReference);
			  sails.log.info("replacedFilename:", replacedFilename);
			  sails.log.info("pdfFileName:",pdfFileName);*/

			  var IPFromRequest = userConsent.ip;
			  var indexOfColon = IPFromRequest.lastIndexOf(':');
			  var ipaddr = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);

			  var signaturecriteria = {user_id: userID};


				  Esignature.findOne(signaturecriteria)
				  .then(function(signatureDetails) {

			  //	sails.log.info("signatureDetailssignatureDetails  service::",signatureDetails);

				  /*var objectname = objectdatas.name;
				  var username = objectname.toString();
				  var fullname = username.split(' ');*/
				  var fname = objectdatas.fname;
				  var lname = objectdatas.lname;

				  var agreementObject = {
					user : fname,
					date : moment.utc(new Date()).format(),
					agreement:agreementDetail,
				  };
				  //var agreementsignpath = Utils.getS3Url(signatureDetails.standardResolution);
			  //	sails.log.info("agreementsignpath service:",agreementsignpath);

					  Transunions
					  .findOne({user:userID})
					  .then(function(transunionsdetails) {

						  var socialnumber = transunionsdetails.response.product.subject.subjectRecord.indicative.socialSecurity.number;
					  //	sails.log.info("socialnumber  service::", socialnumber);
						  var socialnumber = socialnumber.replace(/.(?=.{4})/g, 'X');

						  Screentracking
						  .findOne({user:userID,iscompleted : 0})
						  .populate('accounts')
						  .populate('plaiduser')
						  .populate('transunion')
						  .populate('user')
						  .then(function(screentrackingdetails) {

						  //	sails.log.info("screentrackingdetails  service::", screentrackingdetails);

							  var accountName = "Installment Loan";
							  //var accountName = screentrackingdetails.accounts.accountName;
							  var accountNumberLastFour = screentrackingdetails.accounts.accountNumberLastFour;
							  /*var loanholderstreetname = screentrackingdetails.plaiduser.addresses[0].data.street;
							  var loanholderstreetnumber = screentrackingdetails.plaiduser.addresses[0].data.street;
							  var loanholdercity = screentrackingdetails.plaiduser.addresses[0].data.city;
							  var loanholderzipcode = screentrackingdetails.plaiduser.addresses[0].data.state;*/
							  //var loanholderzipcode = offerdata[0].financedAmount;

								  var loanholderstreetname = screentrackingdetails.user.street;
								  var loanholderstreetnumber = screentrackingdetails.user.street;
								  var loanholdercity = screentrackingdetails.user.city;
								  var loanholderzipcode = screentrackingdetails.user.zipCode;
								  var loanstate = screentrackingdetails.user.state;
								  var unitapt = screentrackingdetails.user.unitapt;
								  var accountNumber = screentrackingdetails.accounts.accountNumber;
								  var routingNumber = screentrackingdetails.accounts.routingNumber;

								  UserBankAccount
								  .findOne({user:userID})
								  .then(function(bankDetails){

									  var bankName = bankDetails.institutionName;

							  User
								  .findOne({id:userID})
								  .then(function(userdetails) {

									  var addressobj = {

										  accountName:accountName,
										  accountNumberLastFour:accountNumberLastFour,
										  loanholderstreetname:loanholderstreetname,
										  loanholdercity:loanholdercity,
										  loanholderzipcode:loanholderzipcode,
										  phonenumber:userdetails.phoneNumber,
										  unitapt:unitapt,
									  }


					  resdata.render(agreementObject.agreement.documentPath, { obj:objectdatas, ip :ipaddr, fname:fname,lname:lname,socialnumber:socialnumber,addressobj:addressobj,type:'pdf',bankName:bankName,accountNumber:accountNumber,routingNumber:routingNumber,firstUserName:userdetails.promName1,secondUserName:userdetails.promName2,phoneNumber:userdetails.promNumber}, function(err, list){
						  var options = {
										  "format": "Letter",
										  "orientation": "portrait",
										  "zoomFactor": "1",
										  "type": "pdf",
										  "quality": "75",
										  "paginationOffset": 1,
										  "border": {
													  "top": "25px",
													  "right": "15px",
													  "bottom": "25px",
													  "left": "15px"
													}
										};
						  pdf.create(list, options).toFile(pdfFileName, function(err, result) {
								if (err)
								{
									return reject(err);
								}

								var criteria = {
								 id: consentID
								};

							  //  sails.log.info("criteria:",criteria);

								UserConsent
								.findOne(criteria)
								.then(function (userConsentData) {

								  //  sails.log.info("userConsentData:",userConsentData);

									S3Service.uploadPromissoryAgreementAsset(pdfFileName,userConsentData,reqdata);

								  //  sails.log.info("after s3:");

									return resolve(userConsentData);

							   })
							   .catch(function (err) {
								  return reject(err);
							   });
							})
						   /* .catch(function (err) {
							  return reject(err);
						   });*/
					  });
					  });
					})
				  })
			  })
		  })
	  })
		  .catch(function (err) {
			  return reject(err);
		  });
	 });
  }


function createStaticEftPdf( consentID, userConsent, applicationReference, ip, resdata, reqdata ) {
	return Q.promise(function( resolve, reject ) {
		var userid = reqdata.session.userId;
		let signatureExistEFT = 0;
		let signatureIdEFT;
		let agreementsignpathEFT;
		sails.log.info( "UserConsent.js createStaticEftPdf consentID", consentID );

		UserConsent.findOne( { id: consentID } )
		.populateAll()
		.then( function( userConsentdetails ) {
			if( !userConsent ) {
				return reject( { code:400 } );
			}
			var userReference = userConsentdetails.user.userReference;
			var replacedFilename = userConsentdetails.documentName.split(' ').join('_');
			var pdfFileName = './' + applicationReference + '_'+replacedFilename+'_'+Math.round(+new Date()/1000)+'.pdf';
			//var userdata = userConsentdetails.user;

			User.findOne( { id: userid } )
			.then( ( userdata ) => {
				//sails.log.info( "userdata ", userdata, " userConsent ", userConsent );
				var screencriteria = { user: userdata.id, iscompleted: 0 };

				Screentracking.findOne( screencriteria )
				.populate( 'accounts' )
				.populate( 'consolidateaccount' )
				.then( function ( screenDetails ) {
					var agreementObject = {
						user: userdata.firstname,
						date: moment().format('MM/DD/YYYY'),
						agreement: userConsentdetails.agreement,
						documentPath: userConsentdetails.documentPath,
						barrowername: userdata.firstname + " " + userdata.lastname
					};
					var username = userdata.firstname + " " + userdata.lastname;
					var screenDetails = screenDetails;
					//var accountToCreateres = userConsent.accountToCreate;
					if( screenDetails ) {
						let offerdata = {};
						if( Array.isArray( screenDetails.offerdata ) ) {
						offerdata = screenDetails.offerdata[ 0 ];
						} else {
						offerdata = screenDetails.offerdata;
						}
						var numberOfPayments = parseInt(offerdata.term);
						var paymentAmount = parseInt(offerdata.payment);
						var firstPaymentDate = moment().add(30, 'days').format( "MM/DD/YYYY" );
						var finalPaymentAmount = parseInt(offerdata.payment);
						var finalPaymentDate = moment().add(30, 'days').add( numberOfPayments, 'months' ).format( "MM/DD/YYYY" );
					}
					var bankName = "";
					var bankAccountType = "";
					var bankAccountNumber = "";
					var bankRoutingNumber = "";
					UserBankAccount.findOne( { user: userid } )
					.then( ( bankDetails ) => {
						if( bankDetails ) {
							bankName = bankDetails.institutionName;
							bankAccountType = screenDetails.accounts.accountSubType;
							bankAccountNumber = screenDetails.accounts.accountNumber;
							bankRoutingNumber = screenDetails.accounts.routingNumber;
						}
						PracticeManagement.findOne( { id: userdata.practicemanagement } )
						.then( ( practicemanagementData ) => {
							Esignature.find( { user_id: userid } )
							.then( ( signatureDetails ) => {
								if( signatureDetails.length > 0 ) {
									for(var i = 0; i < signatureDetails.length; i++) {
										if( signatureDetails[i].type == 14 ) {
											// EFT signature exists
											signatureExistEFT = 1;
											signatureIdEFT = signatureDetails[i].id;
											agreementsignpathEFT = Utils.getS3Url( signatureDetails[i].standardResolution );
										}
									}
								}
								var eftaData = {
									isPdf: true,
									eftaSignatureRequired: true,
									agreementsignpathEFT: agreementsignpathEFT,
									signatureIdEFT: signatureIdEFT,
									signatureExistEFT: signatureExistEFT,
									todaydate: moment().format( "MM/DD/YYYY" ),
									agreementObject: agreementObject,
									ip: ip,
									applicationReference: applicationReference,
									bankName: bankName,
									bankAccountType: bankAccountType,
									bankAccountNumber: bankAccountNumber,
									bankRoutingNumber: bankRoutingNumber,
									username: username,
									numberOfPayments: numberOfPayments,
									paymentAmount: paymentAmount,
									firstPaymentDate: firstPaymentDate,
									finalPaymentAmount: finalPaymentAmount,
									finalPaymentDate: finalPaymentDate,
									screenDetails: screenDetails,
									providerName: practicemanagementData.PracticeName,
									providerAddress: practicemanagementData.StreetAddress,
									providerCity: practicemanagementData.City,
									providerState: practicemanagementData.StateCode,
									providerZip: practicemanagementData.ZipCode,
									providerPhone: practicemanagementData.PhoneNo.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3"),
									providerEmail: practicemanagementData.PracticeEmail,
								};

								resdata.render( userConsentdetails.agreement.documentPath, eftaData, function( err, list ) {
									var options = {
										"format": "Letter",
										"orientation": "portrait",
										"zoomFactor": "1",
										"type": "pdf",
										"quality": "75",
										"paginationOffset": 1,
										"border": {
											"top": "50px",
											"right": "15px",
											"bottom": "50px",
											"left": "15px"
										}
									};
									pdf.create( list, options).toFile( pdfFileName, function( err, result ) {
										if (err) {
											return reject(err);
										}
										var criteria = { id: consentID };

										UserConsent.findOne( criteria )
										.then( function ( userConsentData ) {
											return S3Service.uploadTermsPdf( pdfFileName, userConsentData, applicationReference, userReference )
											.then( () => {
												return resolve( userConsentData );
											} );
										})
										.catch(function (err) {
											return reject(err);
										});
									} );
								} );
							} );
					  	});
				  	});
				});
			} );
		} )
		.catch(function (err) {
			return reject(err);
		} );
	} );
}

  function createCreditReportPdf( consentID, userConsent, applicationReference, ip, resdata, reqdata ) {
	return Q.promise( ( resolve, reject ) => {
		let userid = reqdata.session.userId;
		sails.log.info( "UserConsent.js createCreditReportPdf consentID", consentID );

		return UserConsent.findOne( { id: consentID } )
		.populateAll()
		.then( ( userConsentdetails ) => {
			if( ! userConsent ) {
				return reject( { code: 400 } );
			}
			let userReference = userConsentdetails.user.userReference;
			let replacedFilename = userConsentdetails.documentName.split(' ').join('_');
			let pdfFileName = './' + applicationReference + '_' + replacedFilename + '_' + Math.round(+new Date()/1000) + '.pdf';

			return Experian.findOne( { user: userid } )
			.then( ( experianReport ) => {
				let creditReport = JSON.stringify( experianReport, null, 2 );
				sails.log.info( "UserConsent.createCreditReportPdf creditReport stringified ", creditReport );
				let creditReportData = {
					creditReport: creditReport
				};

				resdata.render( userConsentdetails.agreement.documentPath, creditReportData, ( err, list ) => {
					let options = {
						"format": "Letter",
						"orientation": "portrait",
						"zoomFactor": "1",
						"type": "pdf",
						"quality": "75",
						"paginationOffset": 1,
						"border": {
							"top": "50px",
							"right": "15px",
							"bottom": "50px",
							"left": "15px"
						}
					};
					pdf.create( list, options ).toFile( pdfFileName, ( err, result ) => {
						if( err ) {
							return reject( err );
						}

						UserConsent.findOne( { id: consentID } )
						.then( ( userConsentData ) => {
							return S3Service.uploadTermsPdf( pdfFileName, userConsentData, applicationReference, userReference )
							.then( () => {
								return resolve( userConsentData );
							} );
						} )
						.catch( (err) => {
							return reject(err);
						} );
					} );
				} );
			} );
		} )
	  	.catch( ( err ) => {
			sails.log.error( "UserConsent.createCreditReport UserConsent err: ", err );
			return reject(err);
		} );
  	} );
}

function createPlaidReportPdf( consentID, userConsent, applicationReference, screentracking, resdata, reqdata ) {
	return Q.promise( ( resolve, reject ) => {
		let userid = reqdata.session.userId;
		sails.log.info( "UserConsent.js createCreditReportPdf consentID", consentID );

		return UserConsent.findOne( { id: consentID } )
		.populateAll()
		.then( ( userConsentdetails ) => {
			if( ! userConsent ) {
				return reject( { code: 400 } );
			}
			let userReference = userConsentdetails.user.userReference;
			let replacedFilename = userConsentdetails.documentName.split(' ').join('_');
			let pdfFileName = './' + applicationReference + '_' + replacedFilename + '_' + Math.round(+new Date()/1000) + '.pdf';

			return UserBankAccount.findOne( { screentracking: screentracking.id } )
			.then( ( userbankaccount) => {
				const accounts = userbankaccount.accounts;
				_.forEach( accounts, ( account, idx ) => {
					accounts[ idx ].transactions = userbankaccount.transactions[ account._id ];
				} );
				let plaidReportJson = JSON.stringify( accounts, null, 2 );
				sails.log.info( "UserConsent.createCreditReportPdf plaidReport stringified ", plaidReportJson );
				let plaidReportData = {
					plaidReport: plaidReportJson
				};
				resdata.render( userConsentdetails.agreement.documentPath, plaidReportData, ( err, list ) => {
					let options = {
						"format": "Letter",
						"orientation": "portrait",
						"zoomFactor": "1",
						"type": "pdf",
						"quality": "75",
						"paginationOffset": 1,
						"border": {
							"top": "50px",
							"right": "15px",
							"bottom": "50px",
							"left": "15px"
						}
					};
					pdf.create( list, options ).toFile( pdfFileName, ( err, result ) => {
						if( err ) {
							return reject( err );
						}

						UserConsent.findOne( { id: consentID } )
						.then( ( userConsentData ) => {
							return S3Service.uploadTermsPdf( pdfFileName, userConsentData, applicationReference, userReference )
							.then( () => {
								return resolve( userConsentData );
							} );
						} )
						.catch( (err) => {
							return reject(err);
						} );
					} );
				} );
			} );
		} )
	  	.catch( ( err ) => {
			sails.log.error( "UserConsent.createPlaidReport UserConsent err: ", err );
			return reject(err);
		} );
  	} );
}

function createStaticAgreementPdf( consentID, userConsent, applicationReference, ip, accountID, partnerid, resdata, reqdata ) {
	return Q.promise( function( resolve, reject ) {
		UserConsent.findOne( { id: consentID } )
		.populateAll()
		.then( function( userConsentdetails ) {
			/* sails.log.info("userConsentdetails:",userConsentdetails);
			sails.log.info("applicationReference:",applicationReference);*/

			if( userConsent ) {
				const userReference = userConsentdetails.user.userReference;

				const replacedFilename = userConsentdetails.agreement.documentName.split( " " ).join( "_" );
				// var pdfFileName ='./'+applicationReference+'_'+replacedFilename+'.pdf';
				const pdfFileName = "./" + applicationReference + "_" + replacedFilename + "_" + Math.round( +new Date() / 1000 ) + ".pdf";

				/* sails.log.info("userReference:",userReference);
				sails.log.info("applicationReference:",applicationReference);
				sails.log.info("replacedFilename:", replacedFilename);
				sails.log.info("pdfFileName:",pdfFileName);*/

				/* var IPFromRequest =  reqdata.headers['x-forwarded-for'] || reqdata.connection.remoteAddress;
				var indexOfColon = IPFromRequest.lastIndexOf(':');
				var ip = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);*/

				const userdata = userConsentdetails.user;
				// sails.log.info("userdata:",userdata);

				const screencriteria = { user: userdata.id, iscompleted: 0 };
				let screenDetails;
				let bankdata;

				return Screentracking.findOne( screencriteria )
				.populate( "consolidateaccount" )
				.then( function( screenDetails ) {
					if( screenDetails ) {
						return screenDetails;
					}
					return Screentracking.findOne( { user: userdata.id } )
					.populate( "consolidateaccount" );
				} )
				.then( ( screendetails ) => {
					screenDetails = screendetails;
					if( accountID ) {
						return Account.findOne( { id: accountID } ).populate( "userBankAccount" );
					} else {
						return Account.findOne( { user: screenDetails.user } ).populate( "userBankAccount" );
					}
				} )
				.then( ( bankData ) => {
					bankdata = bankData;
					if( !partnerid ) {
						return null;
					}
					return PracticeManagement.findOne( { id: partnerid } );
				} )
				.then( ( practicedata ) => {
					let bankName = "";
					let bankAccountNumber = "";
					let bankRoutingNumber = "";
					let bankAccountType = "";
					let todaydate = moment().format('MM/DD/YYYY');

					if( bankdata ) {
						bankName = bankdata.userBankAccount.institutionName;
						bankAccountNumber = bankdata.accountNumber;
						bankRoutingNumber = bankdata.routingNumber;
						bankAccountType = bankdata.institutionType;
					}

					const agreementObject = {
						user: userdata.firstname,
						date: moment().format( "MM/DD/YYYY" ),
						agreement: userConsentdetails.agreement,
						barrowername: userdata.firstname + " " + userdata.lastname
					};
					const username = userdata.firstname + " " + userdata.lastname;

					const accountToCreateres = userConsent.accountToCreate;

					const institutionName = userConsent.institutionName;

					templateData = {
						agreementObject: agreementObject,
						ip: ip,
						username: username,
						screenDetails: screenDetails,
						accountToCreateres: accountToCreateres,
						institutionName: institutionName,
						bankName: bankName,
						bankAccountNumber: bankAccountNumber,
						bankRoutingNumber: bankRoutingNumber,
						bankAccountType: bankAccountType,
						todaydate: todaydate
					};
					if( practicedata ) {
						templateData.providerName = practicedata.PracticeName;
						templateData.providerAddress = practicedata.StreetAddress;
						templateData.providerCity = practicedata.City;
						templateData.roviderState = practicedata.StateCode;
						templateData.providerZip = practicedata.ZipCode;
						templateData.providerPhone = practicedata.PhoneNo;
						templateData.providerEmail = practicedata.PracticeEmail;
					}
					resdata.render(
						agreementObject.agreement.documentPath,
						templateData,
						function( err, list ) {
							const options = {
								format: "Letter",
								orientation: "portrait",
								zoomFactor: "1",
								type: "pdf",
								quality: "75",
								paginationOffset: 1,
								border: {
									top: "50px",
									right: "15px",
									bottom: "50px",
									left: "15px"
								}
							};
							pdf.create( list, options ).toFile( pdfFileName, function( err, result ) {
								if( err ) {
									return reject( err );
								}

								const criteria = {
									id: consentID
								};

								// sails.log.info("criteria:",criteria);

								UserConsent.findOne( criteria )
								.then( function( userConsentData ) {
									// sails.log.info("userConsentData:",userConsentData);

									return S3Service.uploadTermsPdf( pdfFileName, userConsentData, applicationReference, userReference )
									.then( () => {
										return resolve( userConsentData );
									});
								} )
								.catch( function( err ) {
									return reject( err );
								} );
							} );
						}
					);
				} );
			} else {
				return reject( { code: 400 } );
			}
		} )
		.catch( function( err ) {
			return reject( err );
		} );
	} );
}


function createConsentforPdf(agreement,userDetail,ip) {

	/*sails.log.info("agreement:",agreement);
	sails.log.info("userDetail:",userDetail);
	sails.log.info("ip:",ip);*/



}

function createDuplicateConsent(userconsent, user, ip) {

  return Q.promise(function(resolve, reject) {

//	sails.log.info("agreement:::::::", agreement);

    var userConsent = {
      documentName: userconsent.documentName,
      documentVersion: userconsent.documentVersion,
      documentKey: userconsent.documentKey,
      ip: userconsent.ip,
      phoneNumber: userconsent.phoneNumber,
    //  deviceId: user.deviceId,
      signedAt: userconsent.signedAt,
      user: userconsent.user,
      agreement: userconsent.agreement,
	  loanupdated:1
    };

    UserConsent.create(userConsent)
      .then(function(consent) {
        //console.log("it is getting created",consent);
        //sails.log.info("UserConsent#createConsent :: created for agreement :: ", userConsent);

        return resolve(consent);
      })
      .catch(function(err) {
        // supress errors
        sails.log.error("UserConsent :: createConsent :: Error :: ", err);

        return reject(err);
      });
  });
}



function objectdataRegenerate(userID,reqdata, resdata,payid,userconsent) {

return Q.promise(function(resolve, reject) {
	//sails.log.info("payid:", payid);

	User
	.findOne({id:userID})
	.populate('practicemanagement')
	.then(function(userDetails) {

	    var userStatecode = userDetails.state;

		//-- Added for ticket no 2686
		var practiceStatecode = userDetails.practicemanagement.StateCode;

		var criteria = {
				  documentKey:'202',
				  statecode:practiceStatecode
		};
		Agreement
    	.find(criteria)
		.then(function (agreements) {

				var loanCriteria = {id: payid};

				PaymentManagement
				.findOne(loanCriteria)
				.populate('user')
				.populate('screentracking')
				.populate('account')
				.populate('practicemanagement')
				.then(function(paymentmanagementdata) {

					var stateCode = paymentmanagementdata.user.state;
					var statecriteria = { stateCode: stateCode };

					State
					  .findOne(statecriteria)
					  .then(function (state) {

				   // sails.log.info('state : ', state);

					var stateName = state.name;
								if(state.name){

						var stateName = state.name;
						}else{

							var stateName	= paymentmanagementdata.user.state;
							}

					var state = state.stateCode;
						if(state.stateCode){

						var state = state.stateCode;
						}else{

							var state = paymentmanagementdata.user.state;

						}


						var fname = paymentmanagementdata.user.firstname;
						var lname = paymentmanagementdata.user.lastname;
						var street = paymentmanagementdata.user.street;
						var city = paymentmanagementdata.user.city;
						var state = paymentmanagementdata.user.state;
						var zipCode = paymentmanagementdata.user.zipCode;
						var offerDetails	=	paymentmanagementdata.screentracking.offerdata[0];
						var financedAmount = offerDetails.financedAmount;
						var interestRate = offerDetails.interestRate;
						var appfeerate = 0;
						var loanTerm = offerDetails.loanTerm;


						sails.log.info("paymentmanagementdata.screentracking.offerdata::::",paymentmanagementdata.screentracking.offerdata[0].financedAmount);
						if (paymentmanagementdata.user.unitapp){
							var unitapp = paymentmanagementdata.user.unitapp;
							}else{
								var unitapp = '';
								}

						var scheduleLoanAmount = 0 ;

						//sails.log.info("schdeule",paymentmanagementdata.paymentSchedule);

						PaymentManagement.biweeklyCalculate(financedAmount,interestRate,loanTerm)
						.then(function(scheduleLoanAmt) {

							/*PaymentManagement.generateNewSchedule(paymentmanagementdata,scheduleLoanAmt)
							.then(function(newSchedule) {*/

							scheduleLoanAmount = scheduleLoanAmt;

							checktotalLoanAmount = scheduleLoanAmount*loanTerm;
							creditcost = checktotalLoanAmount-financedAmount;
							creditcost =  parseFloat(creditcost.toFixed(2));
							checktotalLoanAmount =  parseFloat(checktotalLoanAmount.toFixed(2));

							//sails.log.info("userconsent.signedAt:", userconsent.signedAt);
							var signed_date = userconsent.signedAt;
							//sails.log.info("signed_date:", signed_date);
							var signed =  moment(signed_date).format('MM-DD-YYYY');


							var obj = {
								  amount: financedAmount,
								  address: street,
								  fname: fname,
								  lname: lname,
								  //date: moment().format('MM/DD/YYYY'),
								  date: moment(userconsent.signedAt).format('MM-DD-YYYY'),
								  interestRate: interestRate,
								  month: loanTerm,
								  agreement: agreements,
								  createdDate: moment().format(),
								  endDate: moment().add(loanTerm,'months').format(),
								  //signedDate: new Date(),
								  signedDate: signed,
								  paymentschedule:paymentmanagementdata.paymentSchedule,
								  //paymentschedule:newSchedule.newSchedule,
								  schedulecount:paymentmanagementdata.paymentSchedule.length,
								  annualPercentageRate: interestRate,
								  apr:offerDetails.apr,
								  loannumber:paymentmanagementdata.screentracking.applicationReference,
								  checktotalLoanAmount:checktotalLoanAmount,
								  creditcost:creditcost,
								  street: street,
								  stateName:stateName,
								  stateCode:state,
								  city:city,
								  zipCode:zipCode,
								  accountDetail: paymentmanagementdata.account,
								  unitapp:unitapp,
								  scheduleLoanAmount:scheduleLoanAmount,
								  paymentmanagementdata:paymentmanagementdata
								};
							return resolve(obj);
						/*}).catch(function(err) {
								  sails.log.error("Screentracking::chageachstatus::Error", err);
								  return reject(err);
							})*/
						})
					 .catch(function(err) {
						  sails.log.error("Screentracking::chageachstatus::Error", err);
						  return reject(err);
					})
				  }) //state
				 .catch(function(err) {
						  sails.log.error("Screentracking::chageachstatus::Error", err);
						  return reject(err);
					})
				})
				 .catch(function(err) {
					  sails.log.error("Screentracking::chageachstatus::Error", err);
					  return reject(err);
				})

			})
			 .catch(function(err) {
				  sails.log.error("Screentracking::chageachstatus::Error", err);
				  return reject(err);
			})
		})
		 .catch(function(err) {
			  sails.log.error("Screentracking::chageachstatus::Error", err);
			  return reject(err);
		})
	});
}

function createAgreementPdf( applicationReference, ip, resdata, req, screenid, userDetail, acceptconsent, practicemanagement ) {
	return Q.promise( function( resolve, reject ) {
	   sails.log.info("req.form.acceptconsent:",acceptconsent);
		var constantlength = acceptconsent.length;
		if(constantlength > 0){
			var forncnt = 0;
			_.forEach(acceptconsent, function(value , key) {
				var userInputs	=	{
					applicationReference: applicationReference,
					ip: ip,
					resdata: resdata,
					req: req,
					screenid: screenid,
					userDetail: userDetail,
					acceptconsent: acceptconsent,
					value: value,
					practicemanagement: practicemanagement
 				};
				forncnt++;
 				UserConsent.documentUploadProcess(userInputs, function(results){
					/*sails.log.info("results::====:",results)
					sails.log.info("forncnt::====:",forncnt)
					sails.log.info("constantlength::====:",constantlength)*/
					if(forncnt==constantlength)
					{
						var responsedata = {
							code: 200,
							message:"All Document created successfully."
					   	};
						return resolve(responsedata);
					}
 				})
 			});
 		}
	});
}

function documentUploadProcess( inputData, callback ) {
	var userDetail = inputData.userDetail;
	var ip = inputData.ip;
	var screenid = inputData.screenid;
	var value = inputData.value;
	var applicationReference = inputData.applicationReference;
	var resdata = inputData.resdata
	var query = { documentKey: value };
	if( inputData.practicemanagement ) {
		query = { documentKey: value, practicemanagement: inputData.practicemanagement };
	}
	Agreement.findOne( query )
	.then(function ( agreement ) {
		sails.log.info( "agreement====:", agreement )

	   	UserConsent.createConsentfordocuments( agreement, userDetail, ip, screenid )
		.then(function (userConsentdetails) {

			sails.log.info("userConsentdetails====:",userConsentdetails)

			var consentID = userConsentdetails.id;
			var userID = userDetail.id;
		  	var userReference = userDetail.userReference;

			if(userConsentdetails) {
				var replacedFilename = agreement.documentName;
				var pdfFileName ='./'+applicationReference+'_'+replacedFilename+'_'+Math.round(+new Date()/1000)+'.pdf';
				var userdata = userConsentdetails.user;

				//sails.log.info("userdata===============:",userdata)

				//var screencriteria = { user: userdata.id,iscompleted : 0};
				var screencriteria = { user: userID,iscompleted : 0};

				 Screentracking.findOne(screencriteria)
				 .populate('practicemanagement')
				 .then(function (screenDetails) {

					//sails.log.info("screenDetails:::::::::::::::::::::::::",screenDetails);

					var agreementObject = {
						firstname : userDetail.firstname,
						lastname : userDetail.lastname,
						creditlowscore : sails.config.product.minCreditScore,
						credithighscore : sails.config.product.maxCreditScore,
						date : moment().format('MM/DD/YYYY'),
						agreement:agreement,
						barrowername:userDetail.firstname+" "+userDetail.lastname
					};
					var username = userDetail.firstname+" "+userDetail.lastname;
					var screenDetails = screenDetails;
					var usercriteria = { id: userDetail.id};
					User
					.findOne(usercriteria)
					.populate('practicemanagement')
					.then(function (userResult) {
						 //sails.log.info('userResult================ ',userResult);
						var PracticeName = '';
						if( userResult.practicemanagement ) {
							var PracticeName = userResult.practicemanagement.PracticeName;
							var practiceName = userResult.practicemanagement.PracticeName;
							var practiceAddress = userResult.practicemanagement.StreetAddress;
							var practiceCity = userResult.practicemanagement.City;
							var practiceState = userResult.practicemanagement.StateCode;
							var practiceZip = userResult.practicemanagement.ZipCode;
							var practicePhone = userResult.practicemanagement.PhoneNo.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
							var practiceEmail = userResult.practicemanagement.PracticeEmail;
						}

						resdata.render(agreementObject.agreement.documentPath, {  agreementObject:agreementObject,ip :ip,username:username,screenDetails:screenDetails,PracticeName:PracticeName, practiceName: practiceName, practiceAddress: practiceAddress, practiceCity: practiceCity, practiceState: practiceState, practiceZip: practiceZip, practicePhone: practicePhone, practiceEmail: practiceEmail }, function(err, list){
							var options = {
								"format": "Letter",
								"orientation": "portrait",
								"zoomFactor": "1",
								"type": "pdf",
								"quality": "75",
								"paginationOffset": 1,
								"border": {
									"top": "50px",
									"right": "15px",
									"bottom": "50px",
									"left": "15px"
								}
							};
							pdf.create(list, options).toFile(pdfFileName, function(err, result) {
								  if (err)
								  {
									  //return reject(err);
									   var responsedata = {
											code: 400,
											message:"Document not created"
								  	   };
									   callback(responsedata);
								  }

								  var criteria = {
								   id: consentID
								  };

								  //sails.log.info("criteria:",criteria);

								  UserConsent
								  .findOne(criteria)
								  .then(function (userConsentData) {

									  S3Service.uploadTermsPdf(pdfFileName,userConsentData,applicationReference,userReference)
									  .then(function (s3results) {
											//sails.log.info("s3results::::::::::====:",s3results)
											var responsedata = {
												code: 200,
												message:"All Document created successfully.",
										   };
										   callback(responsedata);
									  }).catch(function (err) {
										  sails.log.info("s3results:",err);
										  	var responsedata = {
												code: 400,
												message:err,
								   			};
 								   		callback(responsedata);
									  });
 								})
								.catch(function (err) {
									var responsedata = {
										code: 400,
										message:"Document not created",
								   };
 								   callback(responsedata);
								});
							});
					  });
					});
				});
			}
	   })
	   .catch(function(err) {
			  sails.log.error("Screentracking::chageachstatus::Error", err);
			  //return reject(err);
			  var responsedata = {
					code: 400,
					message:err,
			   };
			   callback(responsedata);
		});
	})
	.catch(function(err) {
		sails.log.error("Screentracking::chageachstatus::Error", err);
 		var responsedata = {
			code: 400,
			message:err,
		};
		callback(responsedata);
	})
}

function createEftAgreement(screentrackingdetails,userID,resdata,req,ip){
	return Q.promise(function(resolve, reject) {

		var IPFromRequest = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var indexOfColon = IPFromRequest.lastIndexOf(':');
		var ip = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);
		var screenid = screentrackingdetails.id;

		Agreement
		.findOne({documentKey:'203'})
		.then(function (agreement) {

			UserConsent
			.createConsent(agreement,screentrackingdetails.user,ip,screenid)
			.then(function (userconsentdetails) {

					var consentID = userconsentdetails.id;

					sails.log.info("userconsentdetails.agreement", userconsentdetails.agreement);

					Agreement
					.findOne({id: userconsentdetails.agreement})
					.then(function(agreementDetail) {

					    var replacedFilename = agreementDetail.documentName.split(' ').join('_');
						var userReference = req.session.userReference;
						var applicationReference = req.session.applicationReference;
						var application_val = req.session.applicationReference;
					    var pdfFileName ='./'+application_val+'_'+replacedFilename+'_'+Math.round(+new Date()/1000)+'.pdf';

						sails.log.info("pdfFileName", pdfFileName);

						var IPFromRequest = ip;
						var indexOfColon = IPFromRequest.lastIndexOf(':');
						var ipaddr = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);
						var accountName = "Installment Loan";

						var accountNumberLastFour='';
						var routingNumber = '';
						if(screentrackingdetails.accounts){
							var accountNumberLastFour = screentrackingdetails.accounts.accountNumberLastFour;
							var routingNumber = screentrackingdetails.accounts.routingNumber;
						}
						//var accountNumberLastFour = screentrackingdetails.accounts.accountNumberLastFour;
						//var routingNumber = screentrackingdetails.accounts.routingNumber;

						var laonusername = screentrackingdetails.user.firstname+" "+screentrackingdetails.user.lastname
						var loanholderstreetname = screentrackingdetails.user.street;
						var loanholderstreetnumber = screentrackingdetails.user.street;
						var loanholdercity = screentrackingdetails.user.city;
						var loanholderzipcode = screentrackingdetails.user.zipCode;
						var loanstate = screentrackingdetails.user.state;
						var unitapp = screentrackingdetails.user.unitapp;
						var socialnumber =screentrackingdetails.user.ssn_number;


						var financedAmount = screentrackingdetails.offerdata[0].financedAmount;
						//financedAmount = financedAmount.replace('$','');
						var scheduleLoanAmount=screentrackingdetails.offerdata[0].monthlyPayment;
						var loanTerm = screentrackingdetails.offerdata[0].loanTerm;
						var checktotalLoanAmount = parseFloat(scheduleLoanAmount)*loanTerm;
						checktotalLoanAmount = parseFloat(checktotalLoanAmount.toFixed(2));
						var creditcost = checktotalLoanAmount-financedAmount;
						creditcost =  parseFloat(creditcost.toFixed(2));
						var todaydate = moment().format('MM/DD/YYYY');

						var pdfData={
							ip:ipaddr,
							userid:userID,
							screentrackingdetails:screentrackingdetails,
							todaydate:todaydate,
							financedAmount:financedAmount,
							loanTerm:loanTerm,
							scheduleLoanAmount:scheduleLoanAmount,
							checktotalLoanAmount:checktotalLoanAmount,
							creditcost:creditcost,
							laonusername:laonusername,
							accountNumberLastFour:accountNumberLastFour,
							routingNumber:routingNumber,
							type:'pdf'

						}


						sails.log.info("agreementDetail.documentPath", agreementDetail.documentPath);

						resdata.render(agreementDetail.documentPath, { pdfData:pdfData}, function(err, list){
						var options = {
										"format": "Letter",
										"orientation": "portrait",
										"zoomFactor": "1",
										"type": "pdf",
										"quality": "75",
										"paginationOffset": 1,
										"border": {
													"top": "25px",
													"right": "15px",
													"bottom": "25px",
													"left": "15px"
												  }
						};
						pdf.create(list, options).toFile(pdfFileName, function(err, result) {
							  if (err)
							  {
								  return reject(err);
							  }

							  var criteria = {
							     id: consentID
							  };
							  UserConsent
							  .findOne(criteria)
							  .then(function (userConsentData) {

								  S3Service.uploadEftPdf(pdfFileName,userConsentData,applicationReference,userReference);
								  return resolve(userConsentData);

							 })
							 .catch(function (err) {
								return reject(err);
							 });
						  })


					    });




					})
					.catch(function (err) {
						return reject(err);
					});



			})
			.catch(function (err) {
				 sails.log.error('UserConsent#createpromissorypdfAction :: err', err);
				reject(err);
			});

		})
		.catch(function (err) {
			 sails.log.error('UserConsent#createpromissorypdfAction :: err', err);
			reject(err);
		});




    });
}


function downloadConsentPdf(docKey,IPFromRequest,reqdata,resdata){
  return Q.promise(function(resolve, reject) {

 		Agreement
		.findOne({documentKey:docKey})
		.then(function (agreement) {

			var agreementObject = {
 			  date : moment().format('MM/DD/YYYY'),
			  agreement:agreement
 			};

			var appPracticeId	=	reqdata.session.appPracticeId;
			var criteria	=	{
				id:appPracticeId
			}
			sails.log.info('appPracticeId :::::::::::: ', appPracticeId);
			PracticeManagement
			.findOne(criteria)
			.then(function(reponseData) {
 				var PracticeName 	= 	reponseData.PracticeName;
				var indexOfColon 	=	IPFromRequest.lastIndexOf(':');
				var ip 				=	IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);
				var	inputData		=	{  agreementObject:agreementObject,ip:ip, PracticeName:PracticeName};
 				resdata.render(agreementObject.agreement.documentPath, inputData, function(err, list){

					//sails.log.info("enter the loop");

					var pdfFileName =	agreement.documentName+'_'+Math.round(+new Date()/1000)+'.pdf';

					var options = {
						"format": "Letter",
						"orientation": "portrait",
						"zoomFactor": "1",
						"type": "pdf",
						"quality": "75",
						"paginationOffset": 1,
						"border": {
									"top": "50px",
									"right": "15px",
									"bottom": "50px",
									"left": "15px"
								  },
					   //"phantomPath": "./node_modules/phantomjs-prebuilt/bin/phantomjs"
					};


					pdf.create(list, options).toFile(pdfFileName, function(err, result) {
						if (err)
						{
						  return reject(err);
						}

						var outputData ={status:200,filename:pdfFileName};
						return resolve(outputData);
					});
			   });
		   	});
		})
	    .catch(function (err) {
			return reject(err);
		});
   });
}

//-- Genreating shorter version of promissory pdf
function createLendingDisclosureAgreement(screentrackingdetails,resdata,reqdata,ip){
  return Q.promise(function(resolve, reject) {

	var practiceStatecode = screentrackingdetails.practicemanagement.StateCode;
	var agreeCriteria={
			documentKey:'204',
			statecode:practiceStatecode
	}
 	Agreement
	.findOne(agreeCriteria)
	.then(function (agreement) {

		UserConsent
		.createConsent(agreement,screentrackingdetails.user,ip)
		.then(function (userConsent) {

			 //-- Added to fix the regenerate disclosure agreement
			 if ("undefined" !== typeof screentrackingdetails.regenerate && screentrackingdetails.regenerate!='' && screentrackingdetails.regenerate!=null){

				  if(screentrackingdetails.regenerate==1)
				  {
					 var todaydate = moment(screentrackingdetails.regeneratesignedAt).format('MM/DD/YYYY');

					 sails.log.info("regeneratesignedAt::::::::::::",screentrackingdetails.regeneratesignedAt);
					 sails.log.info("todaydate",todaydate);

					 UserConsent.update({id:userConsent.id}, {signedAt: screentrackingdetails.regeneratesignedAt}).exec(function afterwards(err, updated){

					 });
				  }
				  else
				  {
					var todaydate = moment(userConsent.signedAt).format('MM/DD/YYYY');
				  }
			 }
			 else
			 {
				var todaydate = moment(userConsent.signedAt).format('MM/DD/YYYY');
			 }

			var consentID = userConsent.id;
			//var todaydate = moment().format('MM/DD/YYYY');
			//var todaydate = moment(userConsent.signedAt).format('MM/DD/YYYY');
			var userData = screentrackingdetails.user;
			var practiceData = screentrackingdetails.practicemanagement;
			var offerData= screentrackingdetails.offerdata[0];

			var userID 		=	userData.id;
			var userReference = userData.userReference;
			var fname = userData.firstname;
			var lname = userData.lastname;

			var applicationReference = screentrackingdetails.applicationReference;
			var accountName = "Installment Loan";
			var accountNumberLastFour = '';
			if(screentrackingdetails.accounts){
				var accountNumberLastFour = screentrackingdetails.accounts.accountNumberLastFour;
			}
			//var accountNumberLastFour = screentrackingdetails.accounts.accountNumberLastFour;
			var loanholderstreetname = screentrackingdetails.user.street;
			var loanholderstreetnumber = screentrackingdetails.user.street;
			var loanholdercity = screentrackingdetails.user.city;
			var loanholderzipcode = screentrackingdetails.user.zipCode;
			var loanstate = screentrackingdetails.user.state;
			var unitapp = screentrackingdetails.user.unitapp;
			var socialnumber =screentrackingdetails.user.ssn_number;

			//-- offer Data
			var financedAmount = offerData.financedAmount;
			var scheduleLoanAmount=offerData.monthlyPayment;
			var loanTerm = offerData.loanTerm;
			var checktotalLoanAmount = parseFloat(scheduleLoanAmount)*loanTerm;
			checktotalLoanAmount = parseFloat(checktotalLoanAmount.toFixed(2));
			var creditcost = checktotalLoanAmount-financedAmount;
			creditcost =  parseFloat(creditcost.toFixed(2));


			var replacedFilename = agreement.documentName.split(' ').join('_');
			var pdfFileName ='./'+applicationReference+'_'+replacedFilename+'_'+Math.round(+new Date()/1000)+'.pdf';
			var IPFromRequest = userConsent.ip;
			var indexOfColon = IPFromRequest.lastIndexOf(':');
			var ipaddr = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);


			var agreementpromissoryObject = {
				  user : fname,
				  date : moment.utc(new Date()).format(),
				  agreement:agreement,
				  ip:ipaddr,
				  userid:userID,
				  todaydate:todaydate,
				  financedAmount:financedAmount,
				  loanTerm:loanTerm,
				  scheduleLoanAmount:scheduleLoanAmount,
				  checktotalLoanAmount:checktotalLoanAmount,
				  creditcost:creditcost,
				  screentrackingdetails:screentrackingdetails,
				  type:'shorterpdf',
				  practiceData:practiceData,
				  userData:userData,
				  offerData: offerData
			};

			resdata.render(agreement.documentPath, agreementpromissoryObject , function(err, list){
				var options = {
								"format": "Letter",
								"orientation": "portrait",
								"zoomFactor": "1",
								"type": "pdf",
								"quality": "75",
								"paginationOffset": 1,
								"border": {
											"top": "25px",
											"right": "15px",
											"bottom": "25px",
											"left": "15px"
										  }
							  };
				pdf.create(list, options).toFile(pdfFileName, function(err, result) {
					  if (err)
					  {
						  return reject(err);
					  }

					  var criteria = {
					   id: consentID
					  };

					  UserConsent
					  .findOne(criteria)
					  .then(function (userConsentData) {

						  //-- Added to fix the regenerate disclosure agreement
						  if ("undefined" !== typeof screentrackingdetails.regenerate && screentrackingdetails.regenerate!='' && screentrackingdetails.regenerate!=null){

							  if(screentrackingdetails.regenerate==1)
							  {
								  	 //sails.log.info("regenerate::::::::::::::::::::",screentrackingdetails.regenerate);

									 userConsentData.userReference = userReference;
									 userConsentData.applicationReference = applicationReference;

									 //sails.log.info("regenerate userConsentData ::::::::::::::::::::",userConsentData);

									  S3Service.uploadPromissoryAgreementAsset(pdfFileName,userConsentData,reqdata);
							  }
						  }
						  else
						  {
							 S3Service.uploadPromissoryAgreementAsset(pdfFileName,userConsentData,reqdata);
						  }
						  return resolve(userConsentData);
					 })
					 .catch(function (err) {
						return reject(err);
					 });
				  })
			 });
		})
		.catch(function (err) {
			 sails.log.error('UserConsent#createLendingDisclosureAgreement :: err', err);
			 return reject(err);
		});
	})
	.catch(function (err) {
		 sails.log.error('UserConsent#createLendingDisclosureAgreement :: err', err);
		 return reject(err);
	});
  });
}

//-- Regenreating shorter version of promissory pdf
function reGenerateLendingDisclosureAgreement(payId,resdata,reqdata) {
	return Q.promise(function(resolve, reject) {

		//config set
		var shorterpromissoryDocumentkey = '204';

		PaymentManagement
		.findOne({id:payId})
		.populate('user')
		.populate('screentracking')
		.populate('practicemanagement')
		.sort("createdAt DESC")
		.then(function(paymentDetails) {

			var userId = paymentDetails.user.id;

			UserConsent
			.findOne({documentKey:shorterpromissoryDocumentkey,paymentManagement:payId})
			.sort("createdAt DESC")
			.then(function (userconsent) {

				if(userconsent)
				{

					var screentrackingdetails = paymentDetails.screentracking;
					screentrackingdetails.practicemanagement	=	paymentDetails.practicemanagement;
					screentrackingdetails.user	=	paymentDetails.user;

					var ip = userconsent.ip;

					var userConsentDoc = {paymentManagement: payId,documentKey:shorterpromissoryDocumentkey};
					UserConsent.update(userConsentDoc, {loanupdated: 2}).exec(function afterwards(err, updated){

						//-- Genreating shorter version of promissory pdf
						//-- Added to fix the regenerate disclosure agreement
						screentrackingdetails.regenerate=1;
						screentrackingdetails.regeneratesignedAt=userconsent.signedAt;

						UserConsent
						.createLendingDisclosureAgreement(screentrackingdetails,resdata,reqdata,ip)
						.then(function (lendingreponse) {

							var consentID = lendingreponse.id;
							var newconsentcriteria ={
								id:	consentID
							}
							UserConsent.update(newconsentcriteria, {paymentManagement: payId}).exec(function afterwards(err, updated){
								return resolve(lendingreponse);
							});
						})
						.catch(function (err) {
							return reject(err);
						});
					});
				}
				else
				{
					return resolve({code:400});
				}
			}).catch(function (err) {
				 return reject(err);
			});
		}).catch(function (err) {
				 return reject(err);
		});
	});
}
