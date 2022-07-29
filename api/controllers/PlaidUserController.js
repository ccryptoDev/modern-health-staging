/**
 * PlaidUserController
 *
 * @description :: Server-side logic for managing Plaidusers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 
var Q = require('q');

module.exports = {
  getLatestData: getLatestDataAction,
  getForUserBankAccount: getForUserBankAccountAction,
  verifyEmailId: verifyEmailIdAction,
  getEmailVerified: getEmailVerifiedAction,
  savebankdetails:savebankdetailsAction,
  selectNewbank:selectNewbankAction,
  selectedNewBank:selectedNewBankAction,
  changeBankresponse:changeBankresponseAction
};

function getLatestDataAction(req, res) {
  // get the latest plaid user data from db
  var user = req.user;

  PlaidUser
    .getLatestDataForUser(user)
    .then(function (plaidUserData) {
      return res.success(plaidUserData);
    })
    .catch(function (err) {
      sails.log.error("PlaidUserController#getLatestDataAction :: ", err);

      return res.handleError(err);
    })
}

function getForUserBankAccountAction(req, res) {
  // get the latest plaid user data from db
  var user = req.user,
    userBankAccountId = req.param('userBankAccountId');

  PlaidUser
    .getForUserBankAccountAndUser(user, userBankAccountId)
    .then(function (plaidUserData) {
      return res.success(plaidUserData);
    })
    .catch(function (err) {
      sails.log.error("PlaidUserController#getLatestDataAction :: ", err);

      return res.handleError(err);
    })
}

function verifyEmailIdAction(req, res) {
  var user = req.user;
  var emailId = req.param("emailId");
  var name = req.param("name");

  PlaidUser
    .checkEmailGetUniversity(emailId, user)
    .then(function (response) {
      if(response.isEmailValid == true){
        User
        .sendVerificationMail(emailId,name,user)
        .then(function(user){
            return res.success(response);
        })
        .catch(function(err){
          sails.log.error("PLaidUser## sendverificationlink",err)

        })
      }

    })
    .catch(function (err) {
      sails.log.error("PLaidUser##verifyEmailIdAction::", err);
      return res.handleError(err);
    })
}

function getEmailVerifiedAction(req,res){
  var user = req.user;
  User
  .getEmailVerified(user)
  .then(function(user){
  return res.success(user);
  })
  .catch(function(err){
    sails.log.error("Pliaduser##getEmailVerified::",err);
    return res.handleError(err)
  })
}

function savebankdetailsAction(req, res){
	
	var payID = req.param("payid");
	var bankToken = req.param("bankToken");
	
	var options = {id: payID,changebankToken:bankToken};	
	PaymentManagement.findOne(options)
	.then(function(paymentmanagementdata){
	
	//sails.log.info('bankToken : ', bankToken);
	//sails.log.info('payID : ', payID);
	//sails.log.info('paymentmanagementdata : ', paymentmanagementdata);		
	
		var criteria = {
			  id: paymentmanagementdata.user,
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
					  UserBankAccount.createChangeBankDetail(institutionName, institutionType, accountDetails, userDetails, token)
						.then(function (userBankAccntDet) {
						   sails.log.info("Plaid userBankAccntDet: ",userBankAccntDet);
						  //return res.success(userBankAccntDet);
						    var json = {
								status: 200,
								message: 'success'
							};
							res.contentType('application/json');
							res.json(json);
			
						});			   
						
				 })
				.catch(function (err) {
				    var json = {
						status: 400,
						message: 'Your are not allowed to change new bank account.'
					};
					res.contentType('application/json');
					res.json(json);
				})				   
			})			
						
						
		})
		.catch(function (err) {
			var json = {
				status: 400,
				message: 'Your are not allowed to change new bank account.'
			};
			res.contentType('application/json');
			res.json(json);
		});  
	}).catch(function (err) {
			
			var json = {
				status: 400,
				message: 'Your are not allowed to change new bank account.'
			};
			res.contentType('application/json');
			res.json(json);
	});					
						
	
}

function selectNewbankAction(req, res){
	
	var payID = req.param("id");
	var bankToken = req.param("banktoken");
	
	var options = {id: payID,changebankToken:bankToken};	
	PaymentManagement.findOne(options)
	.then(function(paymentmanagementdata){
				   
	   sails.log.info('paymentmanagementdata : ', paymentmanagementdata);		
	
		var criteria = { id: paymentmanagementdata.user};
		
		User
		.findOne(criteria)
		.then(function (userDetails) {
				
				var usercriteria = {
				  //user: '58d6e7467524ac8910e752a8',
				  user:userDetails.id,
				  isDeleted: false
				};
				
				UserBankAccount
				  .findOne(usercriteria)
				  .sort("createdAt DESC")
				  .then(function (userBankAccount) {
								  
						  var subTypeArray = [];
						  _.forEach(userBankAccount.accounts, function (account) {
							if (account.subtype === 'checking') {
							  //delete account["_id"]
							 // delete account["numbers"]
							 // delete account["_user"]
							  subTypeArray.push(account);
							}
						  });		  
						
						//sails.log.info('subTypeArray : ', subTypeArray);		
						
						  var responsedata = {
							//status: 200,
							message: 'success',
							paymentmanagementdata:paymentmanagementdata,
							user: userDetails,
							accountDetails:subTypeArray,
							payID:payID,
							bankToken:bankToken
							
						 };
						
						return res.view('admin/selectNewbank', responsedata);
						
					 })
					  .catch(function (err) {
						 var responsedata = {
							status: 400,
							message: 'Your are not allowed to change new bank account.'
						};
						return res.view('admin/selectNewbank', responsedata);
					  });			  
							
	
	  })
		.catch(function (err) {
			 var responsedata = {
				status: 400,
				message: 'Your are not allowed to change new bank account.'
			};
			return res.view('admin/selectNewbank', responsedata);
		});  
	}).catch(function (err) {
			
			 var responsedata = {
				status: 400,
				message: 'Your are not allowed to change new bank account.'
			};
			return res.view('admin/selectNewbank', responsedata);
	});	
	
	
	
}

function selectedNewBankAction(req, res){
	
	var payID = req.param("payID");
	var bankToken = req.param("bankToken");
	var userid = req.param("userid");
	var itemId = req.param("bankaccount");
	var storyId = '';
	var plaidAccountId = '';
	
	var options = {id: payID};	
	PaymentManagement.findOne(options)
	.then(function(paymentmanagementdata){
		
		sails.log.info('paymentmanagementdata : ', paymentmanagementdata);
		sails.log.info('userid : ', userid);
		
		var criteria = { id: paymentmanagementdata.user};
		
		User
		.findOne(criteria)
		.then(function (userDetails) {		   
				   
		
				var usercriteria = {
				  user: userDetails.id,
				  isDeleted: false
				};
				
				UserBankAccount
				  .findOne(usercriteria)
				  .sort("createdAt DESC")
				  .then(function (userBankAccount) {
								  
						
					  var checkbank=0;	
					  var forlength = userBankAccount.accounts.length,
       				  i = 0;
					  _.forEach(userBankAccount.accounts, function (account) {
																	
							sails.log.info('itemId : ', itemId);
							sails.log.info('accountid : ', account._id);
							
						if (account._id === itemId && checkbank==0 ) {
							
							checkbank =1;
							errorflag=0;
							sails.log.info('matchaccountid : ', account._id);
							
							//user.id = userid;
							var plaidAccountId = itemId;
							var storyId = paymentmanagementdata.story;
							var userincome = '';
							var isChangeBank = 1;
							Account.createAccountDetail(userBankAccount.id, userDetails, itemId, plaidAccountId, storyId, userincome,isChangeBank)
								.then(function (accDet) {
												
								if(paymentmanagementdata.achstatus == 0){
									VikingRequest.update({payment_id: paymentmanagementdata.id,userId:userDetails.id}, {routingNumber:accDet.routingNumber,consumersBankAccount: accDet.accountNumber}).exec(function afterwards(err, updated){});			
								}
								 
								  sails.log.info('accDet : ', accDet);
								  //sails.log.info('accDetID : ', accDet.id);	
								  
								   //var accountID = paymentmanagementdata.account;
								   if(!paymentmanagementdata.changebankinfo )
								   {
									   paymentmanagementdata.changebankinfo =[];
								   }
								   paymentmanagementdata.changebankinfo.push({
										  accountID: paymentmanagementdata.account,
										  date: new Date()
									});
								   
							       paymentmanagementdata.account =accDet.id;
								   paymentmanagementdata.changebankToken ='';
								   
								   sails.log.info('saving details : ');	
								   
							       paymentmanagementdata.save(function(err) {
									   if (err) {
										    sails.log.info('enter error part ');	
											var redirectpath ="/changeBankresponse";
											req.flash('resmessage', 'Your are not allowed to change new bank account.');
											req.flash('resstatus', '400');
											return res.redirect(redirectpath);
									   }
									   
									   sails.log.info('enter success part ');	
									   var redirectpath ="/changeBankresponse";
									   req.flash('resmessage', 'Your bank has been changed successfully');
									   req.flash('resstatus', '200');
									   
									   sails.log.info('redirectpath : ', redirectpath);	
									   
									   return res.redirect(redirectpath);									   
									});								   						  
								})
								.catch(function (err) {
											
											sails.log.info('error part2 catch: ',err);	
											
											paymentmanagementdata.changebankToken ='';
							                paymentmanagementdata.save();
											
											if(err.code)
											{
												var errormessageCode =err.code;
											}
											else
											{
												var errormessageCode = 400;
											}
											
											if(err.message)
											{
												var errormessage =err.message;
												
												if(errormessage=='ACCOUNT_ALREADY_LINKED')
												{
													var errormessage='Account has been linked already';
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
												var errormessage = 'Your are not allowed to change new bank account.';
											}
											errorflag =1;
											
											var redirectpath ="/changeBankresponse";
											//req.flash('resmessage', 'Your are not allowed to change new bank account.');											
											//req.flash('resstatus', '400');
											req.flash('resmessage', errormessage);
											req.flash('resstatus', errormessageCode);
											return res.redirect(redirectpath);
								});
						}
						
						 i++;
					
						 if (i == forlength) {
							      sails.log.info('checkbank : ', checkbank);		
							  	  if(checkbank==0)
								  {
									var redirectpath ="/changeBankresponse";
									req.flash('resmessage', 'Your are not allowed to change new bank account for the user.');											
									req.flash('resstatus', '400');						
									return res.redirect(redirectpath);  
								  }
								  
								  if(checkbank==1 && errorflag==1)
								  {
									var redirectpath ="/changeBankresponse";
									req.flash('resmessage', 'Your are not allowed to change new bank account.');											
									req.flash('resstatus', '400');						
									return res.redirect(redirectpath);  
								  }
						 }
						
					  });	
					 
			   });
				   
		});
		
	});				   
	
}

function changeBankresponseAction(req, res){
	
	sails.log.info("Enter change bank response");
	var resstatusvalue='';
	var message='';
	/*if(req.flash('resstatus'))
	{
		var status = req.flash('resstatus');
	}
	
	if(req.flash('resmessage'))
	{
		var message = req.flash('resmessage');
	}*/
	
	var resstatusvalue = req.flash('resstatus');
	var message = req.flash('resmessage');
	
	var responsedata = {
		status: resstatusvalue,
		message:message
	};
	sails.log.info("responsedata: ",responsedata);
	return res.view('admin/changeBankresponse', responsedata);
	
}

