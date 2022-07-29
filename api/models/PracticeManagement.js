/* global sails, PracticeManagement, ProductRules */

/**
 * PracticeManagement.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const Q = require( "q" );
// const uuid = require("node-uuid");
// const md5 = require("md5");
// const shortid = require("shortid");
const moment = require( "moment" );
const { resolve } = require("q");
// const bcrypt = require("bcrypt");
// const mailerConfig = sails.config.mailer;
const stripe = require( "stripe" )( sails.config.stripeSecretKey );
_ = require( "lodash" );

module.exports = {
	attributes: {
		ContactName: {
			type: "string"
		},
		PracticeName: {
			type: "string"
		},
		PracticeEmail: {
			type: "string"
		},
		PracticeHome: {
			type: "string"
		},
		LinkForm: {
			type: "string"
		},
		LocationName: {
			type: "string"
		},
		StreetAddress: {
			type: "string"
		},
		City: {
			type: "string"
		},
		StateCode: {
			type: "string"
		},
		ZipCode: {
			type: "string"
		},
		InvitedDate: {
			type: "string"
		},
		Status: {
			type: "string",
			defaultsTo: "Active"
		},
		isDeleted: {
			type: "boolean",
			defaultsTo: false
		},
		levelcompleted: {
			type: "integer",
			defaultsTo: 0
		},
		serviceDescription: {
			type: "string",
			defaultsTo: "Elective Surgery"
		},
		providerLateFee: {
			type: "integer",
			defaultsTo: 15
		},
		applicationFee: {
			type: "integer",
			defaultsTo: 0
		},
		practiceSetting: {
			model: 'PracticeSetting'
		},
		// stripe_token: {
		// 	type: "string"
		// },
		// customerID: {
		// 	type: "string"
		// },
		// chargeID: {
		// 	type: "string"
		// },
		// industryCode: {
		// 	type: "string"
		// },
		// memberCode: {
		// 	type: "string"
		// },
		// prefixCode: {
		// 	type: "string"
		// },
		// apiPassword: {
		// 	type: "string"
		// },
		// apiKeyPassword: {
		// 	type: "string",
		// 	defaultsTo: sails.config.transunion.certificate.password
		// },
		// apiPempath: {
		// 	type: "string",
		// 	defaultsTo: sails.config.transunion.certificate.crtPath
		// },
		// apiPemkeypath: {
		// 	type: "string",
		// 	defaultsTo: sails.config.transunion.certificate.keyPath
		// },
		// istransunionSet: {
		// 	type: "integer",
		// 	defaultsTo: 1
		// },
		// stripecardID: {
		// 	type: "string"
		// },
		// oldstripeDetails: {
		// 	type: "array",
		// 	defaultsTo: []
		// },
		// stripeSetupFee: {
		// 	type: "float"
		// },
		// stripeSaasFee: {
		// 	type: "float"
		// },
		// failedattemptcount: {
		// 	type: "integer",
		// 	defaultsTo: 0
		// },
		// pendingcount: {
		// 	type: "integer",
		// 	defaultsTo: 0
		// },
		// validityDate: {
		// 	type: "date"
		// },
		// payments: {
		// 	type: "array",
		// 	defaultsTo: []
		// },
		// loansettingsupdated: {
		// 	type: "integer",
		// 	defaultsTo: 0
		// }
	},
	updateCreditTier: updateCreditTier,
	registerNewPractice: registerNewPractice,
	stripePaymentChargeProcess: stripePaymentChargeProcessAction,
	getPracticeId: getPracticeId,
	updatePartnerRules: updatePartnerRules,
	createPartnerRules: createPartnerRules
};
function updateCreditTier(tier) {
	return Q.promise(function(resolve, reject) {
		return resolve({code: 400});
	});
}
function registerNewPractice(schoolDetails){

	 return Q.promise(function(resolve, reject) {

	var criteria = {
      PracticeEmail: schoolDetails.PracticeEmail,
	  PracticeName:schoolDetails.PracticeName,
      isDeleted: false
    };

    PracticeManagement
	.findOne(criteria)
      .then(function(practicedata) {
        if (practicedata) {
		  return resolve({
            code: 400
		  });
        }
		else
		{
			schoolDetails.InvitedDate=moment().format("YYYY-MM-DD");
			var PracticeName = schoolDetails.PracticeName;
			var urlString = schoolDetails.PracticeUrl.replace(/[^A-Z0-9]/ig, "-");
			urlString = urlString.toLowerCase();
 			var UrlLink = sails.config.getBaseUrl + "" + urlString;
			schoolDetails.PracticeUrl = UrlLink;
			schoolDetails.UrlSlug = urlString;
			schoolDetails.LinkForm = LinkForm;

			PracticeManagement.create(schoolDetails)
			 .then(function (createData){
				sails.log.info("createDatacreateData:",createData);
				EmailService.sendNewPracticeEmail(createData);
				return resolve(createData);
			}).catch(function(err) {
				sails.log.error("New School#registerNewUser::", err);
				return reject(err);
			});

	  }

	}).catch(function(err) {
		sails.log.error("New School#registerNewUser::", err);
		return reject(err);
	});


  });
}


function stripePaymentChargeProcessAction(customer, stripeDetails,stripecustomerRequest, stripechargeRequest)
{
	return Q.promise(function(resolve, reject) {
		stripe.charges.create(stripechargeRequest, function(err, charge) {
			sails.log.info("stripeDetails::::::::",stripeDetails);
			if(err)
			{
				var responseData={
					code:400
				}
				return resolve(responseData);
			}
			else
			{
				var failure_code="";
				var failure_message="";

				if("undefined" !== typeof charge.failure_code && charge.failure_code!="" && charge.failure_code!=null)
				{
					failure_code =  charge.failure_code;
				}

				if("undefined" !== typeof charge.failure_message && charge.failure_message!="" && charge.failure_message!=null)
				{
					failure_message =  charge.failure_message;
				}

				if(charge.status=="succeeded" || charge.status=="pending" )
				{

					stripeDetails.customerID = customer.id;
					stripeDetails.chargeID = charge.id;
					stripeDetails.stripecardID = customer.default_source;

					var cardno	=	stripeDetails.CreditCardNumber;
					var cdate	=	stripeDetails.CardExpiryDate;
					var cvv		=	stripeDetails.CvvCode;

					stripeDetails.CreditCardNumber	=	cardno.replace(/\d(?=\d{4})/g, "X");
					stripeDetails.CardExpiryDate	=	cdate.replace(/[0-9 \/]/g, "X");
					stripeDetails.CvvCode			=	cvv.replace(/[0-9]/g, "X");
					stripeDetails.stripeSetupFee	=	sails.config.stripeSetupFee;
					stripeDetails.stripeSaasFee		=	sails.config.stripeSaasFee;

					var validityDate = moment().startOf("day").add(1, "months").toDate();
					stripeDetails.validityDate		=	validityDate;

					if(charge.id)
					{
						var stripelogData	=	{
							stripeToken:stripeDetails.stripe_token,
							stripeAmount:stripechargeRequest.amount,
							stripecustomerId:customer.id,
							stripechargeId:charge.id,
							stripecardId:customer.default_source,
							customerRequest:stripecustomerRequest,
							chargeRequest:stripechargeRequest,
							customerResponse:customer,
							chargeResponse:charge,
							chargetype:stripechargeRequest.description
						}

						Stripehistory.registerStripehistory(stripelogData)
						.then(function (stripehistoryData) {
							if(charge.status=="succeeded")
							{
								stripestatus=1;
							}
							if(charge.status=="pending")
							{
								stripestatus=2;
							}
							if(charge.status=="failed")
							{
								stripestatus=3;
							}

							if (!stripeDetails.payments)
							{
								stripeDetails.payments = [];
							}
							stripeDetails.payments.push({
								amount: stripechargeRequest.amount,
								paymentstatus:stripestatus,
								chargeId:charge.id,
								historyId:stripehistoryData.id,
								newvalidityDate:validityDate,
								transactionType:stripechargeRequest.description,
								date: new Date()
							});
							var responseData={
								code:200,
								stripeDetails:stripeDetails,
								stripehistoryId:stripehistoryData.id
							}
							return resolve(responseData);
						});
					}
					else
					{
						var responseData={
							code:400,
							stripeDetails:stripeDetails,
							stripehistoryId:""
						}
						return resolve(responseData);
					}
				}
				else
				{
					var responseData={
						code:400,
						stripeDetails:stripeDetails,
						stripehistoryId:""
					}
					return resolve(responseData);
				}
			}
 		});
	});
}


/**
 * get practice id -- wherever it may be
 * @param {Object} session Express {req.session}
 * @return {string|null}
 */
function getPracticeId( session ) {
	if( session.hasOwnProperty( "practiceId" ) ) {
		return session.practiceId;
	} else if( session.hasOwnProperty( "practiceID" ) ) {
		return session.practiceID;
	} else if( session.hasOwnProperty( "adminpracticeID" ) ) {
		return session.adminpracticeID;
	}
	return null;
}

async function updatePartnerRules( currentRules ) {
	const availableRules = sails.config.product.newPartnerRuleSet.rules;

	let addCount = 0;
	_.forOwn( availableRules, ( value, key ) => {
		if( !currentRules.rules[ key ] ) {
			currentRules.rules[ key ] = value;
			currentRules.rules[ key ].disabled = true;
			addCount++;
		}
	} );
	if( addCount > 0 ) {
		await currentRules.save();
	}
	return currentRules;
}

async function createPartnerRules( practiceId, productId ) {
	const partnerRules = sails.config.product.newPartnerRuleSet;

	partnerRules.practicemanagement = practiceId;
	partnerRules.product = productId ? productId : sails.config.product.productid;
	await ProductRules.create( partnerRules );
	return;
}
