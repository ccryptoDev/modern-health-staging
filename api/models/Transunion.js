/* global sails */

/**
 * Transunion.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

"use strict";

var request = require('request'),
  Q = require('q'),
  moment = require('moment');

require('request-debug')(request);
var fs = require('fs'),
    xml2js = require('xml2js');
const https = require( "https" );

var Curl = require( 'node-libcurl' ).Curl;
var curl = new Curl();
//close = curl.close.bind( curl );

const URL = require( "url" );

var path = require( 'path' );
var to_json = require('xmljson').to_json;
var fs = require('fs');
var in_array = require('in_array');


module.exports = {

  attributes: {
	user: {
      model: 'User'
    },
	response: {
        type:'json',
        defaultsTo: {}
    },
	first_name: {
	   type: 'string',
	   defaultsTo: ''
	},
	middle_name:{
	   type: 'string',
	   defaultsTo: ''
	},
	last_name:{
	   type: 'string',
	   defaultsTo: ''
	},
	house_number:{
	   type: 'array',
	   defaultsTo: []
	},
	socialSecurity:{
	   type: 'string',
	   defaultsTo: ''
	},
	employment:{
	   type: 'array',
	   defaultsTo: []
	},
	trade:{
	   type: 'array',
	   defaultsTo: []
	},
	credit_collection:{
	    type:'json',
        defaultsTo: {}
	},
	inquiry:{
	   type: 'array',
	   defaultsTo: []
	},
	addOnProduct:{
	    type:'json',
        defaultsTo: {}
	},
	score:{
		type: 'string',
		defaultsTo: ''
	},
	status: {
      type: 'integer',
      defaultsTo: 0
    },
  },

  callTransUnionApi: callTransUnionApi,
  createcertificate:createcertificate,
  getTransunionCredentials:getTransunionCredentials,

};

function getTransunionCredentials(userInfoData)
{
	return Q.promise(function(resolve, reject) {

			var apiMode= sails.config.transunion.mode;
			var practiceId = userInfoData.practicemanagement;

			//sails.log.info("apiMode::",apiMode);
			//sails.log.info("practiceId:",practiceId);

			if(apiMode=='production' || apiMode=='development')
			{
				if("undefined" !== typeof practiceId && practiceId!='' && practiceId!=null)
				{
					 var practiceCriteria ={
						  id:practiceId,
						  isDeleted: false
					 }

					 //sails.log.info("practiceCriteria:",practiceCriteria);

					 PracticeManagement
					 .findOne(practiceCriteria)
					 .then(function(practicedata) {

							//sails.log.info("practicedata:",practicedata);
							if (practicedata)
							{
								var apiUrl, apiEnv;
								var istransunionSet = practicedata.istransunionSet;
								var industryCode = practicedata.industryCode;
								var memberCode = practicedata.memberCode;
								var prefixCode = practicedata.prefixCode;
								var apiPassword = practicedata.apiPassword;

								if("undefined" !== typeof practicedata.apiPempath &&  practicedata.apiPempath!='' && practicedata.apiPempath!=null)
								{
									 var apiPempath = practicedata.apiPempath;
								}
								else
								{
									var apiPempath = sails.config.transunion.certificate.crtPath
								}

								if("undefined" !== typeof practicedata.apiPemkeypath &&  practicedata.apiPemkeypath!='' && practicedata.apiPemkeypath!=null)
								{
									var apiPemkeypath = practicedata.apiPemkeypath;
								}
								else
								{
									var apiPemkeypath = sails.config.transunion.certificate.keyPath
								}

								if("undefined" !== typeof practicedata.apiKeyPassword &&  practicedata.apiKeyPassword!='' && practicedata.apiKeyPassword!=null)
								{
									var apiKeyPassword = practicedata.apiKeyPassword;
								}
								else
								{
									var apiKeyPassword = sails.config.transunion.certificate.password
								}

								apiUrl = sails.config.transunion.baseUrl;
								apiEnv = sails.config.transunion.env;

								if(istransunionSet==1)
								{
									var returnData={
										status:200,
										apiUrl:apiUrl,
										apiEnv:apiEnv,
										apiindustryCode:industryCode,
										apimemberCode:memberCode,
										apiprefixCode:prefixCode,
										apiPassword: apiPassword,
										apiKeyPassword:apiKeyPassword,
										apiuserRefNumber:userInfoData.id,
										apiVersionr:sails.config.transunion.version,
										pempath:apiPempath,
										pemkeypath: apiPemkeypath
									}
									sails.log.info("returnData: if::",returnData);
									return resolve(returnData);
								}
								else
								{
									var returnData={
										status:200,
										apiUrl:apiUrl,
										apiEnv:apiEnv,
										apiindustryCode:sails.config.transunion.industryCode,
										apimemberCode:sails.config.transunion.memberCode,
										apiprefixCode:sails.config.transunion.prefixCode,
										apiPassword: sails.config.transunion.password,
										apiKeyPassword: sails.config.transunion.certificate.password,
										apiuserRefNumber: userInfoData.id,
										apiVersionr:sails.config.transunion.version,
										pempath:sails.config.transunion.certificate.crtPath,
										pemkeypath: sails.config.transunion.certificate.keyPath
									}

									sails.log.info("returnData: else::",returnData);
									return resolve(returnData);
								}
							}
							else
							{
								var returnData={
									status:400,
									message:'Invalid practice Data'
								}
								sails.log.info("returnData:",returnData);
								return resolve(returnData);
							}

					}).catch(function(err) {
						var returnData={
							status:400,
							message:'Invalid practice ID'
						}
						sails.log.info("returnData:",returnData);
						return resolve(returnData);
					});
				}
				else
				{
					var returnData={
						status:400,
						message:'Unknown practice ID'
					}
					sails.log.info("returnData:",returnData);
					return resolve(returnData);
				}
			}
			else
			{
				var returnData={
					status: 200,
					apiUrl: sails.config.transunion.baseUrl,
					apiEnv: sails.config.transunion.env,
					apiindustryCode:sails.config.transunion.industryCode,
					apimemberCode:sails.config.transunion.memberCode,
					apiprefixCode:sails.config.transunion.prefixCode,
					apiPassword: sails.config.transunion.password,
					apiKeyPassword: sails.config.transunion.certificate.password,
					apiuserRefNumber: userInfoData.id,
					apiVersionr: sails.config.transunion.version,
					pempath: sails.config.transunion.certificate.crtPath,
					pemkeypath: sails.config.transunion.certificate.keyPath
				}
				sails.log.info("returnData: sandbox::",returnData);
				return resolve(returnData);
			}
	});
}


function callTransUnionApi(userDetail) {
	return Q.promise(function(resolve, reject) {



		Transunion.getTransunionCredentials(userDetail)
		.then(function (transCredentials) {

			//sails.log.info("transCredentials:::::::::::::::::",transCredentials);

			if(transCredentials.status==200)
			{
				var apiindustryCode= transCredentials.apiindustryCode;
				var apimemberCode= transCredentials.apimemberCode;
				var apiprefixCode= transCredentials.apiprefixCode;
				var apiKeyPassword= transCredentials.apiKeyPassword;
				var apiEnv= transCredentials.apiEnv;
				var apiPassword = transCredentials.apiPassword;
				var apiVersionr = transCredentials.apiVersionr;
				var pempath = transCredentials.pempath;
				var pemkeypath = transCredentials.pemkeypath;
				var apiUrl = transCredentials.apiUrl;
			} else {
				//-- Added to avoid issue for temporarily
				var apiindustryCode= sails.config.transunion.industryCode;
				var apimemberCode= sails.config.transunion.memberCode;
				var apiprefixCode= sails.config.transunion.prefixCode;
				var apiKeyPassword= sails.config.transunion.certificate.password;
				var apiEnv= sails.config.transunion.env;
				var apiPassword = sails.config.transunion.password;
				var apiVersionr= sails.config.transunion.version;
				var pempath = sails.config.transunion.certificate.crtPath;
				var pemkeypath = sails.config.transunion.certificate.keyPath;
				var apiUrl = sails.config.transunion.baseUrl;
			}

			if(userDetail.unitapp) { var unitApp = userDetail.unitapp; } else { var unitApp = '';}
			if(userDetail.middlename) { var middleName = userDetail.middlename; } else { var middleName = '';}
			if(userDetail.ssnNumber) { var socialNumber = userDetail.ssnNumber.replace(/[^a-zA-Z0-9]/g, ''); } else { var socialNumber = '';}

			var addressarray = {
				'untiapt' :unitApp,
				'street_name' : userDetail.street,
				'city' : userDetail.city,
				'state' : userDetail.state,
				'zip_code' : userDetail.zipCode
			};

			var userArray = {
				'first' :userDetail.firstname,
				'middle' :middleName,
				'last' : userDetail.lastname
			};

			var transactionControl = {
				'userRefNumber': userDetail.id,
				'subscriber': {
					'industryCode' :apiindustryCode,
					'memberCode' :apimemberCode,
					'inquirySubscriberPrefixCode':apiprefixCode,
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

			/*var certificate = {
				'key' :'PATIENT1Key.pem',
				'crt' :'PATIENT1.pem',
				'password' :apiKeyPassword
			};*/

			var certificate = {
				'key' :pemkeypath,
				'crt' :pempath,
				'password' :apiKeyPassword,
				'apiUrl':apiUrl,
				'apiVersionr':apiVersionr
			};

			//sails.log.info("addressarray",addressarray);
			//sails.log.info("userArray",userArray);

			Transunion
			.createcertificate(userArray,addressarray,socialNumber,userDetail,transactionControl,certificate)
			.then(function (responseDetails) {

				sails.log.info("responseDetails___",responseDetails.code);

				if(responseDetails.code==200)
				{

					Screentracking
					.updateApplicationDetails(userDetail,userArray,addressarray,transactionControl,certificate)
					.then(function (applicationDetails) {

						var transunionStatus =applicationDetails.code;

						//sails.log.info("applicationDetails",applicationDetails);
						 var responsedata = {
							code: 200,
							message:"Transunion data for customer fetched successfully.",
							applicationDetails:applicationDetails,
							transunionStatus: transunionStatus
							//rulesDetails:rulesDetails,
							//screenTracking:screenTracking
						};
						return resolve(responsedata);


					})
					.catch(function(err) {
						sails.log.error("ApplicationService#createcertificate::Err ::", err);
						var responsedata = { code: 400, message: 'Could not recieve your credit details' };
						return resolve(responsedata);
					});
				}
			})
			.catch(function(err) {
				sails.log.error("ApplicationService#createcertificate::Err ::", err);
				var responsedata = { code: 400, message: 'Could not recieve your credit details' };
				return resolve(responsedata);
			});
		})
		.catch(function(err) {
			sails.log.error("ApplicationService#createcertificate::Err ::", err);
			var responsedata = { code: 400, message: 'Could not recieve your credit details' };
			return resolve(responsedata);
		});
	});
}

function createcertificate(userArray,addressarray,ssn_number,userDetail,transactionControl,transunionCredentials) {
	return Q.promise( function( resolve, reject ) {
		var apppath = sails.config.appPath+'/';

		sails.log.info("addressarray::::::",addressarray);
	    sails.log.info("userArray:::::",userArray);
		sails.log.info("ssn_number:::::",ssn_number);
		sails.log.info("transactionControl:::::",transactionControl);
		sails.log.info("transunionCredentials:::::",transunionCredentials);
		sails.log.info("userDetail",userDetail);

		var subjectRecord =  {
		  'indicative':{
				'name':{
					'person':userArray
				 },
				 'address':{
					 'status':'current',
					 'street':{
							'number':addressarray.untiapt,
							'name':addressarray.street_name
					 },
					 'location':{
							'city':  addressarray.city,
							'state':  addressarray.state,
							'zipCode':  addressarray.zip_code
					 },
					 'residence':{
					  }
				 },
				 'socialSecurity':{
					  'number':ssn_number //ssn_number //'666429061'
				  },
				 'dateOfBirth':(typeof(userDetail.dateofBirth) != "undefined") ? userDetail.dateofBirth : moment().format('YYYY-MM-DD')
			  },
			  // 'addOnProduct':{
				//  'code':'00W18',//00P02
				//  'scoreModelProduct':'true'
			  // }
		};

		var productData =  {
			'code':'07000',
			'subject':{
				'number':'1',
				'subjectRecord':subjectRecord

			},
			'responseInstructions':{
			  'returnErrorText':'true',
				"embeddedData": "pdf",
			  'document':null,
			},
			'permissiblePurpose':{
			   'inquiryECOADesignator':'individual'
			}
	   }

		//var apiVersionr= sails.config.transunion.version;
		//-- transunionCredentials
		var apiVersionr= transunionCredentials.apiVersionr;
		var url= transunionCredentials.apiUrl;
		var apiKeyPassword= transunionCredentials.password;
		var pempath = transunionCredentials.crt;
		var pemkeypath = transunionCredentials.key;
		var certfile = path.join( apppath, pempath );
		var keyfile= path.join( apppath, pemkeypath );


		var requestData =  {
			'document':'request',
			'version': apiVersionr,
			'transactionControl': transactionControl,
			'product':productData
		}

		var userData = {
			'first_name' : userArray.first,
			'middle_name' : userArray.middle,
			'email' : userDetail.email,
			'last_name' : userArray.last,
			'untiapt':addressarray.untiapt,
			'street_name' :addressarray.street_name,
			'city' : addressarray.city,
			'state' : addressarray.state,
			'zip_code' : addressarray.zip_code,
			'ssn_number':ssn_number,
			'dob':userDetail.dateofBirth,
		};

		sails.log.info("Final userData:::::",userData);
		sails.log.info("Final requestData:::::",requestData);
		sails.log.info("apiKeyPassword:::::",apiKeyPassword);


		var transrequestdata = {userData:userData,requestData:requestData};

		var transinfodata = {
				user: userDetail.id,
				requestdata:transrequestdata,
				status:0
		};

		return Transunionhistory.create( transinfodata )
		.then( async ( historydetails ) => {
			var historyID = historydetails.id;
			var builder = new xml2js.Builder();
			var reqdata = builder.buildObject(requestData);
			var reqdata = reqdata.replace(/\n|\r|\s/g, "");
			var xmldata = reqdata.replace('<?xmlversion="1.0"encoding="UTF-8"standalone="yes"?><root>', '<?xml version="1.0" encoding="UTF-8"?><creditBureau xmlns="http://www.transunion.com/namespace" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.transunion.com/namespace">');
			xmldata=xmldata.replace('</root>','</creditBureau>');
			fs.appendFileSync('logs/translog/transunionRequest.txt', 'RequestData_'+userDetail.id+'_'+moment().format('YYYY-MM-DD-hh-mm-ss')+'_::::'+xmldata+'--\n\n\n');
			await Transunionhistory.update( { id: historydetails.id }, { requestxml: xmldata } );

			var bodydata='';

			const apiURL = URL.parse( url );
			const reqOpts = {
				host: apiURL.hostname,
				port: 443,
				path: apiURL.pathname,
				method: "POST",
				headers: {
					"Accept": "text/xml",
					"Content-Length": Buffer.byteLength( xmldata ),
					"Content-Type": "text/xml"
				},
				key: fs.readFileSync( keyfile ),
				cert: fs.readFileSync( certfile ),
				rejectUnauthorized: false,
				passphrase: apiKeyPassword
			};
			// console.info( "TransUnion.reqOpts: %j", reqOpts );
			const chunks = [];
			const req = https.request( reqOpts, ( res ) => {
				res.setEncoding( "utf8" );
				console.log( `TransUnion.netaccess; statusCode: ${res.statusCode}` );
				const statusCode = res.statusCode;
				res.on( "data", ( chunk ) => {
					chunks.push( chunk );
				} );
				res.on( "error", ( err ) => {
					console.error( "TransUnion.netaccess; https.request -- err:", err );
					return reject( err );
				} );
				res.on( "end", () => {
					const bodydata = chunks.join( "" );
					// fs.appendFileSync( `translog/transunionResponse_${userDetail.id}.txt`, `${bodydata}\n\n` );
					fs.appendFileSync('logs/translog/transunionRsponse_'+userDetail.id+'_'+moment().format('YYYY-MM-DD-hh-mm-ss')+'.txt', bodydata);

					var parser = new xml2js.Parser( { charkey: "_val", explicitArray: false, mergeAttrs: true } );

					parser.parseString(bodydata, function(err,result) {
						//sails.log.info("result",JSON.stringify(result));

						var historystatus=0;
						if(statusCode==200)
						{
							historystatus=1;
						}
						else
						{
							historystatus=2;
						}

						var transhistorycriteria={
							user:userDetail.id,
							id: historyID
						};

						//sails.log.info("transhistorycriteria",transhistorycriteria);

						Transunionhistory.findOne(transhistorycriteria)
						.sort("createdAt DESC")
						.then(function(transunionhistoryInfo) {

								transunionhistoryInfo.responsedata = result;
								transunionhistoryInfo.status = 	historystatus;
								transunionhistoryInfo.save(function(err) {
								if (err)
								{
									sails.log.error("Transunioun#createcertificate :: Error :: ", err);
									return resolve({
									code: 500,
									message: 'Transunioun response not updated'
									});
								}


									var responsedata = {
										code: 200,
										message:"Transunion data for customer fetched successfully.",
										resultdata:result,
								};
								sails.log.info("responsedata",responsedata.code);
								return resolve(responsedata);
								});
						})
						.catch(function(err) {
							sails.log.error("ApplicationService#createcertificate::Err ::", err);
							var responsedata = { code: 400, message: 'Could not recieve your credit details'};
							return resolve(responsedata);
						});
					});
				} );
			} );
			req.on( "error", ( err ) => {
				console.error( "TransUnion.netaccess; https.request -- err:", err );
				return reject( err );
			} );
			req.write( xmldata );
			req.end();
		} )
		.catch(function(err) {
			sails.log.error("Transunion#createcertificate::Err ::", err);
			var responsedata = {
				code: 400,
				message: 'Could not recieve your credit details'
		   };
		   return resolve(responsedata);
		} );
	});
}

