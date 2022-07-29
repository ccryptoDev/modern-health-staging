/**
 * InstitutionController
 *
 * @description :: Server-side logic for managing Institutions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


var _ = require('lodash');
var fs = require('fs');

var Q = require('q');


var sys = require ('sys'),
url = require('url'),
http = require('http'),
qs = require('querystring');

var request = require('request');


module.exports = {
  /*getInstitutionDetails: getInstitutionDetailsAction,
  createInstitutionList: createInstitutionListAction,
  institutionAuthentication: institutionAuthenticationAction,
  institutionBalanceDetail: institutionBalanceDetailAction,
  userDetail: userDetailAction,
  uploadImage: uploadImageAction,
  updatedInformation: updatedInformationAction,
  getTransaction: getTransactionAction,
  getAllInstitution: getAllInstitutionAction,
  UploadInstitutionImageView: UploadInstitutionImageView,
  getOneInstitutionDetails: getOneInstitutionDetailsAction,
  initPlaidLink: initPlaidLinkAction,*/
  getPlaidTransactions: getPlaidTransactionsAction,
  checkplaidTransaction: checkplaidTransactionAction
};


function createInstitutionListAction(req, res) {
  InstitutionService
    .getInstitutionList()
    .then(function (institutionList) {

      return Institution.createBankDetails(institutionList);
    })
    .then(function (institutionList) {

      return res.success(institutionList);

    })
    .catch(function (err) {
      sails.log.error('InstitutionController#getInstitutionDetailsAction :: err :', err);

      return res.handleError(err);
    });
}

function getInstitutionDetailsAction(req, res) {
  Institution
    .getAllInstitutions()
    .then(function (institutionList) {
      var data = [];
      _.forEach(institutionList, function (institution) {
        var institutionContext = institution.toInstitutionApi();
        data.push(institutionContext);
      });
	  //EmailService.sendSampleEmail();
      return res.success(data);

    })
    .catch(function (err) {
      sails.log.error('InstitutionController#getInstitutionDetailsAction :: err :', err);

      return res.handleError(err);

    });
}

function institutionAuthenticationAction(req, res) {
  if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }
  var user = req.user;

  var token = user.accessToken;

  var mfa = req.param('mfa');

  InstitutionService.bankAuthentication(token, mfa)
    .then(function (accnts) {
      return res.success(accnts);
    })
    .catch(function (err) {
      return res.handleError(err);
    })
}

function institutionBalanceDetailAction(req, res) {

  var user = req.user;
  var token = user.accessToken;

  InstitutionService.getAccountType(token)
    .then(function (account) {
      return res.success(account);
    })
    .catch(function (err) {
      return res.handleError(err);
    })
}


function userDetailAction(req, res) {
  var user = req.user;
  var token = user.accessToken;

  User.updateUserDetail(user, token)
    .then(function (user) {
      return res.success(user.toUserApi());
    })
    .catch(function (err) {
      return res.handleError(err);
    });
}

function uploadImageAction(req, res) {

	 sails.log.info("localPath1111 :: ", req.localPath)

 if(!req.localPath){

	 return res.redirect("admin/getAllInstitution");

 }else{
	 sails.log.info("localPath :: ", localPath)

  var localPath = req.localPath,
    id = req.param('id'),
    institutionColor = req.param('institutionColor');

  if (!localPath || !id) {
    sails.log.error("InstitutionController#UploadImageAction :: Insufficient Data");
    return res.serverError();
  }

  Asset
    .createAssetForInstitution(localPath, id, Asset.ASSET_MEDIA_TYPE_IMAGE)
    .then(function (asset) {
      Institution
        .addImageToInstitution(asset, id, institutionColor)
        .then(function () {

			var logdataall = asset;
			logdataall.institutionColor = institutionColor;
            var modulename = 'Upload Institution Image';
			var modulemessage = 'Institution Image updated successfully';
			req.logdata=logdataall;
			Logactivity.registerLogActivity(req,modulename,modulemessage);

          return res.redirect("admin/getAllInstitution");
        })
        .catch(function (err) {
          sails.log.error("ToolController#addImageAction :: Error :: ", err);
          return res.handleError(err);
        });
    })
    .catch(function (err) {
      sails.log.error("ToolController#addImageAction :: Error :: ", err);
      return res.handleError(err);
    });

  }
}

function getAllInstitutionAction(req, res) {
  Institution
    .find()
    .then(function (institutions) {
      return res.view("admin/institution/institutionList", {
        institutions: institutions
      });
    })
    .catch(function (err) {
      sails.log.error("InstitutionController#getAllInstitutionAction ::  err ", err);
      return res.handleError(err);
    });
}

function UploadInstitutionImageView(req, res) {
  var id = req.param('id');
  Institution
    .findOne({
      id: id
    })
    .then(function (institution) {
      return res.view('admin/institution/addInstitutionImage', {
        institution: institution
      });
    })
    .catch(function (err) {
      sails.log.error("InstitutionController#UploadInstitutionImageView ::  err ", err);
      return res.handleError(err);
    });
}

function getOneInstitutionDetailsAction(req, res) {
  var id = req.param('id');
  Institution
    .findOne({
      id: id
    })
    .populate('image')
    .then(function (institution) {
	  //sails.log.info("institution", institution);
	  if(institution.image)
	  {
      	institution.image = Institution.getLocalUrlForAsset(institution.image.localPath);
	  }
      return res.view('admin/institution/institutionDetail', {
        institution: institution
      });
    })
}
//how do we update it
function updatedInformationAction(req, res) {
  var user = req.user.id;
  var name = req.param("names");
  var emails = req.param("emails");
  var address = req.param("address");
  var city = req.param("city");
  var state = req.param("state");
  var birthdte = req.param("birthDate");

  User.informationUpdated(data)
    .then(function (userDet) {
      return res.success(userDet);
    })
    .catch(function (err) {
      return res.handleError(err);
    })
}

function getTransactionAction(req, res) {
  var user = req.user;
  var token = user.accessToken;

  InstitutionService.getAssetTransactionDetail(user, token)
    .then(function (transactionDet) {

      delete transactionDet["access_token"]
      delete transactionDet["statusCode"]
      var length = transactionDet.transactions.length;
      var trans = [];
      _.forEach(transactionDet.transactions, function (transaction) {

        AccountTransaction.createTransaction(transaction)
          .then(function (transac) {
            sails.log.info("Created :: ", transaction)
          })
      })

      return res.success(transactionDet.transactions);
    })
    .catch(function (err) {
      return res.handleError(err);
    })
}


function initPlaidLinkAction(req, res) {
  // get the view generated for given institution type
  if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }

  var institutionType = req.form.institutionType;

  return res.view('institution/institutionPlaidLink', {
    institutionType: institutionType
  });
}

function getPlaidTransactionsAction(req, res) {
	//sails.log.info("method:",req.method);
	//sails.log.info("req data:",req);
	 if(req.method=='POST') {
		 	//sails.log.info("enter if loop:");
            /*var bodydata='';
            req.on('data', function (data) {
                bodydata +=data;
            });

			sails.log.info("bodydata:",bodydata);
            req.on('end',function(){
                var postData =  qs.parse(bodydata);
                sails.log.info("postdata:",postData);

				var appendData = req.method+' Method called \n';
				appendData +='Post Values are: \n';
				appendData +=JSON.stringify(postData);
				appendData += '\n-------------------------------\n';

				sails.log.info("appendData:",appendData);

				fs.appendFile('plaidlog.txt', appendData, function (err) {
				  if (err) throw err;
				  sails.log.info('Post Data Saved!');
				});
            });*/



			/*var body = '';
			req.on('data', function(chunk) {
			  sails.log.info("chunkdata:",chunk);
			  body += chunk;
			});
			req.on('end', function() {
			  sails.log.info("bodydata:",body);
			  var data = qs.parse(body);
			  sails.log.info("data:",data);
			  res.writeHead(200);
			  res.end(JSON.stringify(data));
			});*/

			var allParams = req.allParams();
			//sails.log.info('allParams: ',allParams);

			var item_id = req.param("item_id");
			var webhook_code = req.param("webhook_code");
			var new_transactions = req.param("new_transactions");

			//sails.log.info('webhook_code: ', webhook_code);
			//sails.log.info('new_transactions: ', new_transactions);

			if(item_id!='')
			{

				var appendData = req.method+' Method called \n';
					appendData +='Post Values are: \n';
					appendData +='item_id: '+item_id+' \n';
					appendData +=JSON.stringify(allParams);
					appendData += '\n-------------------------------\n';

				fs.appendFile('plaidlog.txt', appendData , function (err) {
					  if (err) throw err;
					  //sails.log.info('Get Data Saved!');
				});

				 return Q.promise(function (resolve, reject) {

					//sails.log.info('item_id: ',item_id);
					//sails.log.info('req.method: ',req.method);
					//sails.log.info('allParams: ',JSON.stringify(allParams));

					var WebhookValues = {
					  item_id: item_id,
					  methodtype: req.method,
					  data: allParams
					};

					//sails.log.info('WebhookValues: ',WebhookValues);

					Webhookhistory.create(WebhookValues)
			    	.then(function (Webhookdetails) {

						//sails.log.info('Webhookdetails: ', Webhookdetails);

						if(webhook_code=='HISTORICAL_UPDATE')
						{
							var criteria = {
									  item_id: item_id,
									  $or : [ { transavail : 0 }, { transavail : 1 } ],
									  isDeleted: false
									};
						}
						else
						{
							var criteria = {
									  item_id: item_id,
									  transavail: 0,
									  isDeleted: false
									};
						}

				 	 	//sails.log.info('webhook_code: ', webhook_code);
						//sails.log.info('criteria: ', criteria);

				 		 UserBankAccount.findOne(criteria)
						  .then(function (userbankaccount) {

								//sails.log.info('userbankaccount: ', userbankaccount);

								if(userbankaccount)
								{

									if(userbankaccount.access_token)
									{
										var token = userbankaccount.access_token;
										var accountDetails={
															item:{
																	item_id: item_id
																 }
														   }
										//sails.log.info('token value: ', token);
										//sails.log.info('accountDetails: ', accountDetails);

										InstitutionService.getAssetTransactionDetail(token,accountDetails)
										.then(function (transactionDetails) {

											//sails.log.info('transactionDetails2: ', transactionDetails);

											var transactionGenerated = {};
											if(transactionDetails.total_transactions>0)
											{
												_.forEach(transactionDetails.transactions,function(transaction){

												  //sails.log.info('transaction.account_id: ', transaction.account_id);
												  if(!_.has(transaction.account_id,transactionGenerated)) {
													 //sails.log.info('Enter if loop2');
													//transactionGenerated[transaction.account_id]=[];
												  }
												  else
												  {
													 //sails.log.info('Enter else loop2');
												  }

												  if(!transactionGenerated.hasOwnProperty(transaction.account_id))
												  {
													  //sails.log.info('Enter property if loop2');
													  transactionGenerated[transaction.account_id]=[];
												  }
												  else
												  {
													  //sails.log.info('Enter property else loop2');
												  }


												  var obj = {
													id: transaction.transaction_id,
													account_id: transaction.account_id,
													amount :transaction.amount,
													date : transaction.date,
													name :transaction.name,
													meta :transaction.payment_meta,
													pending :transaction.pending,
													type : transaction.transaction_type,
													category:  transaction.category,
													category_id :transaction.category_id,
													score :transaction.location
												  };
												  transactionGenerated[transaction.account_id].push(obj) ;
												})
											}

											//sails.log.info('transactionGenerated: ', transactionGenerated);

											if(webhook_code=='HISTORICAL_UPDATE')
											{
												userbankaccount.transavail = 2;
											}
											else
											{
												userbankaccount.transavail = 1;
											}
											userbankaccount.transactions =  transactionGenerated;
											userbankaccount.save(function (err) {
											  if (err) {
												//sails.log.error("userbankaccount#updatetransavial :: Update Error :: ", err);

												/*return reject({
												  code: 500,
												  message: 'INTERNAL_SERVER_ERROR'
												});*/
											  }
											  //return resolve(userbankaccount);
											  //res.success({ success: true, method: req.method ,userbankaccount: userbankaccount});
											  return res.success();
											})
										})
										.catch(function (err) {
											//sails.log.error("userbankaccount#updatetransavial :: unable to fetch transactin details ");
											//return reject(err);
											return res.success();
										});
									}
									else
									{
										//sails.log.error("userbankaccount#updatetransavial else 1:: Invalid acces token ");
										//return resolve({code:200});
										/*return reject({
												  code: 500,
												  message: 'INTERNAL_SERVER_ERROR'
												});*/
										return res.success();
									}

								}
								else
								{
									sails.log.error("userbankaccount#updatetransavial else 2:: Invalid acces token ");
									return res.success();
									//return resolve({code:200});
									/*return reject({
											  code: 500,
											  message: 'INTERNAL_SERVER_ERROR'
											});*/
								}
						  })
						  .catch(function (err) {
								sails.log.error("userbankaccount#updatetransavial :: Unable to fetch userbank account details ");
								//return reject(err);
								return res.success();
						  });
					  })
					  .catch(function (err) {
						sails.log.error("userbankaccount#updatetransavial :: Unable to insert webhook history details ");
						//return reject(err);
						return res.success();
					  });
			   });
			}
			//res.success({ success: true, method: req.method });
    }
    else if(req.method=='GET') {
		sails.log.info("enter else loop:");
        var url_parts = url.parse(req.url,true);

		var appendData = req.method+' Method called \n';
		appendData +='Get Values are: \n';
		appendData +=JSON.stringify(url_parts.query);
		appendData += '\n-------------------------------\n';

		fs.appendFile('plaidlog.txt', appendData, function (err) {
		  if (err) throw err;
		  sails.log.info('Get Data Saved!');
		});
		return res.success({ success: true, method: req.method });
    }

	/*fs.appendFile('plaidlog.txt', 'Webhook Called by user' , function (err) {
		  if (err) throw err;
		  sails.log.info('Get Data Saved!');
	});*/

	/*var url ='https://requestb.in/16ftu6t1'
	request(url, function (error, response, body) {
	  if (!error) {
		sails.log.info("body data",body);
	  }
	});*/
}


function checkplaidTransactionAction(req, res) {
	var token = req.param('token');
	var type = req.param('type');
	sails.log.info("method:",req.method);
	sails.log.info("token:",token);
	sails.log.info("type:",type);

	if(token!='' && type!='')
	{
		if(type=='getplaid')
		{
			InstitutionService
			.getPlaidItems(token)
			.then(function (plaiditemsData) {
				sails.log.info("plaiditemsData: ",plaiditemsData);
				return res.success(plaiditemsData);
			})
			.catch(function (err) {
			  sails.log.error("#checkplaidTransactionAction:: getplaid Error", err);
			  return res.handleError(err);
			})
		}
		else if(type=='getaccount')
		{
			InstitutionService.accountDetail(token)
    		.then(function (accounts) {
				var length = accounts.accounts.length;
				sails.log.info("accountsData: ",accounts);
				sails.log.info("accountsData length: ",length);
				return res.success(accounts);
			})
			.catch(function (err) {
			  sails.log.error("#checkplaidTransactionAction:: getaccount Error", err);
			  return res.handleError(err);
			})
		}
		else if(type=='getuserinfo')
		{
			InstitutionService.getUserDetail(token)
			.then(function (userDetail) {
				sails.log.info("userDetailData: ",userDetail);
				return res.success(userDetail);
			})
			.catch(function (err) {
			  sails.log.error("#checkplaidTransactionAction:: getuserinfo Error", err);
			  return res.handleError(err);
			})
		}
		else if(type=='gettrans')
		{
			InstitutionService.accountDetail(token)
    		.then(function (accountDetails) {
				//sails.log.info("accountsData: ",accountDetails);

				InstitutionService.getAssetTransactionDetail(token,accountDetails)
				.then(function (transactionDetails) {

					return res.success(transactionDetails);
				})
				.catch(function (err) {
				  sails.log.error("#checkplaidTransactionAction::Error", err);
				  return res.handleError(err);
				})
			})
			.catch(function (err) {
			  sails.log.error("#checkplaidTransactionAction:: getaccount trans Error", err);
			  return res.handleError(err);
			})
		}
		else
		{
			return res.handleError({
				code: 500,
				message: 'Invalid request parameters'
			});
		}

	}
	else
	{
		return res.handleError({
			code: 500,
			message: 'Invalid parameters'
		});
	}
}
