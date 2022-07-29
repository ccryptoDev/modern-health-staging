/**
 * AdminuserController
 *
 * @description :: Server-side logic for managing adminusers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var passport = require('passport'),
  moment = require('moment'),
  bcrypt = require('bcrypt'),
  _ = require('lodash');

var in_array = require('in_array');

module.exports = {
	changepassword: changepasswordAction,
	updatepassword: updatepasswordAction,
	adminuserlist: adminuserlistAction,
	ajaxadminuserlist: ajaxadminuserlistAction,
	createnewuser: createnewuserAction,
	addnewuser: addnewuserAction,
	edituser: edituserAction,
	updateuser: updateuserAction,
	updateAdminUserStatus: updateAdminUserStatusAction,
	resetPassword: resetPasswordAction,
	editCreditTiers: editCreditTiersAction,
	sendContinueAppEmail: sendContinueAppEmailAction
};
function editCreditTiersAction(req, res) {
	return res.json({message: "ur in bud"});
}
function changepasswordAction(req, res){

	var errorval = '';
	var successval = '';
	if(req.session.passerror!=''){
		errorval =req.session.passerror;
		req.session.passerror = '';
	}

	if(req.session.successval!=''){
		successval =req.session.successval;
		req.session.successval = '';
	}

	return res.view("admin/user/changepassword", {
			error: errorval, successval: successval
		});

}
function updatepasswordAction(req, res){

	var oldpassword = req.param("oldpassword");
    var newpassword = req.param("newpassword");
	var confirmpass = req.param("confirmpass");
	var userid = req.param("userid");

	  if(userid)
	  {

		  console.log("userid",userid);
		  Adminuser
			.getUserById(userid)
			.then(function (user) {


				 if(!user){
				   throw { code: 400, message: "User not found" };
				  }


				  return new Promise(function(res, rej){
					bcrypt.compare(oldpassword, user.password, function(err, result){
							console.log("ifloop");
					  if(err)
					  {
						  return rej(err);
					  }
					  if(!result)
					  {
						  return rej({ code: 403, message: "Invalid pass" });
					  }
					  res();
					});

				  }).then(function(){
					 //console.log("userdata",user);
					return user;
				  });

			}).then(function(updatedUser){

				updatedUser.password = newpassword;
				salt = User.generateSalt();

				User.generateEncryptedPassword(updatedUser, salt)
				.then(function(encryptedPassword) {

					   updatedUser.password = encryptedPassword;
					   updatedUser.salt = salt;


					   updatedUser.save(function(err) {
							if (err) {
							    var json = {
									status: 500,
									message:"Unable to update Password!"
								 };
								 req.session.passerror='';
						         req.session.passerror = 'Unable to update Password!!';
						         return res.redirect("/admin/changepassword");
							}

							EmailService.changePasswordEmail(updatedUser);

							//update practice user table for password
							if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID!='' && req.session.adminpracticeID!=null)
	  						{
								var checkcriteria = {
												email: updatedUser.email
												//isDeleted: false
								};

							    PracticeUser.findOne(checkcriteria)
							   .then(function(practicedetails){

									if(practicedetails)
									{
										var updatecriteria = {id: practicedetails.id};
										var updatevalues = {salt: updatedUser.salt,password: updatedUser.password}


										PracticeUser.update(updatecriteria, updatevalues ).exec(function afterwards(err, userupdated){ 																																																																	  												req.session.successval='';
												req.session.successval = 'Password changed successfully!';
												return res.redirect("/admin/changepassword");																																																																	  										});
									}
									else
									{
										req.session.successval='';
										req.session.successval = 'Password changed successfully!';
										return res.redirect("/admin/changepassword");
									}

								})
							    .catch(function(err) {
									req.session.successval='';
									req.session.successval = 'Password changed successfully!';
									return res.redirect("/admin/changepassword");
								});
							}
							else
							{
								req.session.successval='';
								req.session.successval = 'Password changed successfully!';
								return res.redirect("/admin/changepassword");
							}
					 });
				})
				.catch(function(err) {
						var errordata = {
								  "code": 403,
								  "message": "Please try again later"
						};
						req.session.passerror='';
						req.session.passerror = 'Please try again later';
						return res.redirect("/admin/changepassword");
				});
			})
			.catch(function (err) {

				var errordata = {
								  "code": 404,
								  "message": "Invalid Email or Current password"
							  };
				req.session.passerror='';
				req.session.passerror = 'Invalid Current password';
				return res.redirect("/admin/changepassword");
			});

	  }else
	  {
		  var json = {
			status: 400
		  };
		sails.log.error("json data", json);
		req.session.passerror='';
		req.session.passerror = 'Unable to update Password!';
		return res.redirect("/admin/changepassword");
	  }

}

function adminuserlistAction(req, res){

	return res.view("admin/user/adminUserList");
}

function ajaxadminuserlistAction(req, res){

	  //Sorting
	var colS = "";

	if(req.query.sSortDir_0=='desc')
	{
		sorttype=-1;
	}
	else
	{
		sorttype=1;
	}
	switch(req.query.iSortCol_0){
		case '0':  var sorttypevalue = { '_id': sorttype }; break;
		case '1':  var sorttypevalue = { 'name': sorttype }; break;
		case '2':  var sorttypevalue = { 'email': sorttype }; break;
		case '3':  var sorttypevalue = { 'phoneNumber': sorttype }; break;
		//case '4':  var sorttypevalue = { 'practicename': sorttype }; break;
		case '5':  var sorttypevalue = { 'role': sorttype }; break;
		case '6':  var sorttypevalue = { 'createdAt': sorttype }; break;
		default: break;
	};

	//Search
	if(req.query.sSearch)
	{
		sails.log.info("search value: ",req.query.sSearch);
		var criteria = {
		  or: [{name:  { 'contains': req.query.sSearch }}, {email:  { 'contains': req.query.sSearch }},{phoneNumber:  { 'contains': req.query.sSearch }}, {createdAt:  { 'contains': req.query.sSearch }}]
		};

	}
	else
	{
		var criteria = {
    	};
	}

	Adminuser
    .find(criteria)
	.populate('role')
	.populate('practicemanagement')
	.sort( sorttypevalue)
	.then(function(userDetails) {

		//Filter user details not available
		userDetails=_.filter(userDetails,function(item){
			if(item.email!='' && item.email!=null)
			{
				return true;
			}
		});

		totalrecords= userDetails.length;

		//Filter by limit records
		skiprecord =parseInt(req.query.iDisplayStart);
		checklimitrecords = skiprecord+parseInt(req.query.iDisplayLength);
		if(checklimitrecords>totalrecords)
		{
			iDisplayLengthvalue=parseInt(totalrecords);
		}
		else
		{
			iDisplayLengthvalue=parseInt(req.query.iDisplayLength)+parseInt(skiprecord);
		}

		userDetails= userDetails.slice(skiprecord, iDisplayLengthvalue);

		//sails.log.info("userDetails", userDetails);

		var userData = [];
		var userName='';
		var userEmail='';
		var userphoneNumber='';

		userDetails.forEach(function(userinfo,loopvalue){
			loopid = loopvalue+skiprecord+1;
			userinfo.createdAt = moment(userinfo.createdAt).format('MM-DD-YYYY hh:mm:ss');


			if ("undefined" === typeof userinfo.name || userinfo.name=='' || userinfo.name==null)
			{
				userinfo.name= '--';
			}

			if ("undefined" === typeof userinfo.email || userinfo.email=='' || userinfo.email==null)
			{
				userinfo.email= '--';
			}

			if ("undefined" === typeof userinfo.phoneNumber || userinfo.phoneNumber=='' || userinfo.phoneNumber==null)
			{
				userinfo.phoneNumber= '--';
			}
			if ("undefined" === typeof userinfo.role.rolename || userinfo.role.rolename=='' || userinfo.role.rolename==null)
			{
				userinfo.role= '--';
			}
			if(userinfo.isDeleted)
			{
				var actiondata ='<i class="fa fa-square-o icon-red" aria-hidden="true" style="cursor:pointer; color:red;" onclick="setAdminUserStatus(\''+userinfo.id+'\',\'inactive\');"></i>&nbsp;&nbsp; <a href="/admin/edituser/'+userinfo.id+'"><i class="fa fa-pencil-square-o" aria-hidden="true" style="cursor:pointer; color:#337ab7;"></i></a>';
			}
			else
			{
				var actiondata ='<i class="fa fa-check-square-o icon-green" aria-hidden="true" style="cursor:pointer; color:green;" onclick="setAdminUserStatus(\''+userinfo.id+'\',\'active\');"></i>&nbsp;&nbsp; <a href="/admin/edituser/'+userinfo.id+'"><i class="fa fa-pencil-square-o" aria-hidden="true" style="cursor:pointer; color:#337ab7;"></i></a>';
			}

			if(userinfo.email){
				var emillnk = '<a href="mailto:'+userinfo.email+'">'+userinfo.email+'</a>';
			}

			var practicename='All';
			if(userinfo.practicemanagement)
			{
				practicename = userinfo.practicemanagement.PracticeName;
			}

			userData.push({ loopid:loopid,name: userinfo.name, email: userinfo.email, phoneNumber: userinfo.phoneNumber, role: userinfo.role.rolename, practicename:practicename,createdAt:userinfo.createdAt, actiondata:actiondata });
		});
		 var json = {
				sEcho:req.query.sEcho,
				iTotalRecords: totalrecords,
				iTotalDisplayRecords: totalrecords,
				aaData: userData
			};
		//sails.log.info("json data", json);
		res.contentType('application/json');
		res.json(json);

	});
}

function createnewuserAction(req, res){


   var error = '';
   if(req.session.addnewusererror!=''){
		error =req.session.addnewusererror;
		req.session.addnewusererror = '';
	}

	var criteria={
		backendEnabled : 1
	}
	Roles.find(criteria)
	.then(function(roledetails){

		PracticeManagement
		.find({isDeleted : false})
		.sort("PracticeName DESC")
		.then(function(practiceDetails) {

			sails.log.info("practiceDetails",practiceDetails);

		 	return res.view("admin/user/createnewuser",{roledetails:roledetails,practiceDetails:practiceDetails,error:error});
		})
		.catch(function (err) {

			  sails.log.error('AdminuserController#createnewuserAction :: err :', err);
			  var errors = {
							  "code": 404,
							  "message": "Practice not found"
							};
			  res.view("admin/error/404", {
					data: errors.message,
					layout: 'layout'
			  });

		});
	})
	.catch(function (err) {
		  sails.log.error('AdminuserController#createnewuserAction :: err :', err);
		  var errors = {
						  "code": 404,
						  "message": "Roles not found"
						};
		  res.view("admin/error/404", {
				data: errors.message,
				layout: 'layout'
		  });
	});
}

function addnewuserAction(req, res){

	if (!req.form.isValid) {
		var validationErrors = ValidationService
		.getValidationErrors(req.form.getErrors());
		return res.failed(validationErrors);
	}


	  Adminuser
		.registerNewUser(req.form)
		.then(function (user) {


			  if(user.code==200)
			  {
				  console.log("userdata",user);
				 // return res.success(user.userdata,token);

				  var modulename = 'Create New Admin user';
			      var modulemessage = 'created new admin user successfully';
				  req.logdata=req.form;
				  Logactivity.registerLogActivity(req,modulename,modulemessage);


				 return res.redirect("/admin/adminuserlist");
			  }
			  else
			  {
					/*var errordata = {
						  "code": 400,
						  "message": "Email already exist"
					};

					return res.view("admin/user/createnewuser", {
						error: 'Email already exist'
					});*/

					req.session.addnewusererror='Email already exist';
					return res.redirect("/admin/createnewuser");


			  }

		})
		.catch(function (err) {
		  sails.log.error('AdminuserController#addnewuserAction :: err :', err);
		  return res.handleError(err);
		});


	//return res.view("admin/user/createnewuser");
}

function edituserAction(req, res){

	var criteria={
		backendEnabled : 1
	}
	var errorval = '';
	if(req.session.errormsg!=''){
		errorval =req.session.errormsg;
		req.session.errormsg = '';
	}

	var id = req.param('id');

	Roles.find(criteria)
	.then(function(roledetails){
		 //sails.log.info('roledata: ',roledetails);

		PracticeManagement
		.find({isDeleted : false})
		.sort("PracticeName DESC")
		.then(function(practiceDetails) {

			   Adminuser
				.findOne({
				  id: id
				})
				.populate('role')
				.populate('practicemanagement')
				.then(function (userdata) {
				  sails.log.info("userdata",userdata);
				  req.flash('error','');

				  var practiceset=0;
				  if(userdata.practicemanagement)
				  {
					  practiceset=1;
				  }
				  return res.view('admin/user/editUser', {
					userdata: userdata, roledetails:roledetails, practiceDetails:practiceDetails, practiceset:practiceset, error:errorval
				  });
				})
		})
		.catch(function (err) {
				var errors = { "code": 404, "message": "Practicelist not found" };
		 	    res.view("admin/error/404", {	data: errors.message, layout: 'layout' });
		});
	})
	.catch(function (err) {
		  sails.log.error('AdminuserController#createnewuserAction :: err :', err);
		  var errors = { "code": 404, "message": "Roles not found" };
		  res.view("admin/error/404", {	data: errors.message, layout: 'layout' });
	});



}

function updateuserAction(req, res){

	var userid = req.param("userid");
	var emailID = req.param("email");

      if(userid)
	  {
		  var uniid = {
				id: userid
		  };

		 Adminuser.findOne(uniid)
		 .then(function(userdata){

				var previousAdminemail = userdata.email;

				var checkcriteria = {
								email: emailID,
								isDeleted: false
							 };

				Adminuser.findOne(checkcriteria)
				.then(function(userdetails) {
					if (userdetails && emailID!=userdata.email)
					{
						req.session.errormsg='';
						req.session.errormsg = 'Email Already exist';
						return res.redirect("/admin/edituser/"+userid);
					}
					else
					{
						  var roleCriteria = {
							  id: req.param("role")
						   };

						   //sails.log.info("roleCriteria",roleCriteria);

					      Roles.findOne(roleCriteria)
						  .then(function(roledata){

							  //sails.log.info("roledata",roledata);

							  userdata.name =  req.param("name");
							  userdata.email =  req.param("email");
							  userdata.phoneNumber =  req.param("phoneNumber");
							  userdata.role =  req.param("role");


							  //sails.log.info("roledata.rolename:::::",roledata.rolename);
							  //sails.log.info("sails.config.allowedPracticeRoles",sails.config.allowedPracticeRoles);

							  var practiceIdexist =0;
							  var unsetpracticemanagement=0;
							  var previouspracticeID;
							  var currentpracticeID;

							  if(userdata.practicemanagement)
							  {
								previouspracticID = userdata.practicemanagement;
							  }

					 		  if (in_array(roledata.rolename, sails.config.allowedPracticeRoles))
							  {
							    userdata.practicemanagement = req.param("practiceId");
								currentpracticeID =  req.param("practiceId");
							    practiceIdexist =1;
							  }

							  if(practiceIdexist==0)
							  {
								  if(userdata.practicemanagement)
								  {
									 unsetpracticemanagement =1;
								  }
							  }

							  //sails.log.info("practiceIdexist::::::",practiceIdexist);
							  //sails.log.info("unsetpracticemanagement::::::",unsetpracticemanagement);

							  if(unsetpracticemanagement==1)
							  {
								  userdata.practicemanagement = "";
							  }


							  userdata.save(function (err) {
								if (err) {
									req.session.errormsg='';
									req.session.errormsg = 'Unable to update user';
									return res.redirect("/admin/edituser/"+userid);
								}
								else
								{
									var modulename = 'Edit new admin user';
									var modulemessage = 'update admin user data successfully';
									req.logdata=req.form;
									Logactivity.registerLogActivity(req,modulename,modulemessage);

									if(unsetpracticemanagement==1)
									{
										//unset practice user
										var updatecriteria = {email: previousAdminemail};

										sails.log.info("updatecriteria:::",updatecriteria);

										PracticeUser.update(updatecriteria, {isDeleted:true}).exec(function afterwards(err, userupdated){
											return res.redirect("/admin/adminuserlist");
										});
									}
									else if(practiceIdexist==1)
									{
										  var checkcriteria = {
												email: previousAdminemail
												//isDeleted: false
										  };

										  sails.log.info("checkcriteria:::",checkcriteria);

										 PracticeUser.findOne(checkcriteria)
										 .then(function(practicedetails){

												sails.log.info("practicedetails:::",practicedetails);

												var practicefiltercriteria = {id:currentpracticeID};

												sails.log.info("practicefiltercriteria:::",practicefiltercriteria);

												sails.log.info("-------------!!!!----------");
												PracticeManagement.findOne(practicefiltercriteria)
												.then(function(practicedata) {

													var practiceManagementName='';
													if(practicedata)
													{
														practiceManagementName = practicedata.PracticeName;
													}

													sails.log.info("-----------------------");
													if(practicedetails)
													{
														//sails.log.info("enter if loop");
														//update practice user details
														var updatecriteria = {id: practicedetails.id};
														var updatevalues = {username: userdata.name,firstname: practicedetails.firstname,lastname: practicedetails.lastname, email:userdata.email,phoneNumber:userdata.phoneNumber,isDeleted: false,registeredtype:roledata.rolename,role:roledata.rolename,roles:roledata.id,practicemanagement:userdata.practicemanagement,practiceManagementName:practiceManagementName}

														//sails.log.info("updatecriteria:",updatecriteria);
														sails.log.info("updatevalues:",updatevalues);

														PracticeUser.update(updatecriteria, updatevalues ).exec(function afterwards(err, userupdated){ 																																																																	  															return res.redirect("/admin/adminuserlist");																																																																	  														});
													}
													else
													{
														sails.log.info("enter else loop");

														return User.getNextSequenceValue('practiceuser')
														.then(function(userRefernceData) {

															var practiceuserReference ='PFUSR_'+userRefernceData.sequence_value;
															var practiceAdminData = {
																username:userdata.name,
																email:userdata.email,
																firstname:practicedetails.firstname,
																lastname:practicedetails.lastname,
																practicemanagement: userdata.practicemanagement,
																phoneNumber:userdata.phoneNumber,
																roles:userdata.role,
																registeredtype:roledata.rolename,
																role:roledata.rolename,
																password:userdata.password,
																salt:userdata.salt,
																passwordstatus:1,
																userReference:practiceuserReference,
																practiceManagementName:practiceManagementName
															}

															sails.log.info("practiceAdminData:",practiceAdminData);

															PracticeUser.create(practiceAdminData)
															.then(function(practiceuser) {
																return res.redirect("/admin/adminuserlist");

															})
															.catch(function (err) {
																	return res.redirect("/admin/adminuserlist");
															});
														})
														.catch(function(err) {
																return res.redirect("/admin/adminuserlist");
														});
													}
											 })
											 .catch(function (err) {
													return res.redirect("/admin/adminuserlist");
											 });
										 })
										 .catch(function (err) {
											return res.redirect("/admin/adminuserlist");
										 });
									}
									else
									{
										return res.redirect("/admin/adminuserlist");
									}
								}
					 	   });
					  })
					  .catch(function (err) {
							req.session.errormsg='';
							req.session.errormsg = 'Unable to update user';
							return res.redirect("/admin/edituser/"+userid);
					  });
					}
				})
				.catch(function (err) {
						req.session.errormsg='';
						req.session.errormsg = 'Unable to update user';
						return res.redirect("/admin/edituser/"+userid);
				});
		 })
		 .catch(function (err) {
				req.session.errormsg='';
		        req.session.errormsg = 'Unable to update user';
		        return res.redirect("/admin/edituser/"+userid);
		});

	  }
	  else
	  {
		  var json = {
			status: 400
		  };
		  req.session.errormsg='';
		  req.session.errormsg = 'Unable to update user';
		  return res.redirect("/admin/edituser/"+userid);
	  }

}

function updateAdminUserStatusAction(req, res){

	var userid = req.param('userid');
	var status = req.param('status');

	 if(userid)
	  {
		  var userCriteria = {
				id: userid
		  };

		Adminuser.findOne(userCriteria)
		.then(function(userdata){
			if(status=='inactive'){
			  userdata.isDeleted = false;
			}else{
			  userdata.isDeleted = true;
			}

			userdata.save(function (err) {
				if (err) {

					var useralldetails = userdata;
					useralldetails.status =status
					var modulename = 'Update user status';
					var modulemessage = 'User status updated successfully';
					req.logdata=useralldetails;
					Logactivity.registerLogActivity(req,modulename,modulemessage);

					var json = {
						status: 400,
						message:"Unable to update user status!"
					 };
					 sails.log.info("json data", json);
					 res.contentType('application/json');
					 res.json(json);

				}
				else
				{

					var useralldetails = userdata;
					useralldetails.status =status
					var modulename = 'Update user status';
					var modulemessage = 'User status updated successfully';
					req.logdata=useralldetails;
					Logactivity.registerLogActivity(req,modulename,modulemessage);

					var json = {
						status: 200,
						message:"User status updated successfully"
					 };
					 sails.log.info("json data", json);
					 res.contentType('application/json');
					 res.json(json);
				}
			 });
	  	})
		.catch(function (err) {
			  var json = {
					status: 400,
					message:err.message
				};
				sails.log.error("json data", json);
				res.contentType('application/json');
				res.json(json);
		});
	  }
	  else
	  {
		  var json = {
			status: 400
		  };
		  sails.log.error("json data", json);
		  res.contentType('application/json');
		  res.json(json);
	  }
}

function resetPasswordAction(req, res){

	if (!req.form.isValid) {
		var validationErrors = ValidationService
		  .getValidationErrors(req.form.getErrors());
		return res.failed(validationErrors);
	}

	Adminuser
	.findOne({email: req.form.email})
	.then(function (user) {

		if(!user){
       	 req.session.forgeterror='';
		 req.session.forgeterror = 'Invalid email address';
		 return res.redirect("/forgetPassword");
        }

        return user;

	}).then(function(userDetails){

		var emailId = userDetails.email;
		var name = userDetails.name;

		var randompwdstring = Math.random().toString(36).slice(-12);
		userDetails.password = randompwdstring;
		salt = User.generateSalt();

        return User.generateEncryptedPassword(userDetails, salt)
        .then(function(encryptedPassword) {


            userDetails.password = encryptedPassword;
            userDetails.salt = salt;

			userDetails.save(function(err) {
				if (err) {
					req.session.forgeterror='';
					req.session.forgeterror = 'Please try again later';
					return res.redirect("/forgetPassword");
				}
				var userObjectData = {
				  email: emailId,
				  name: name,
				  newtemppassword: randompwdstring
				};
				EmailService.sendAdminForgetPasswordEmail(userObjectData);
				req.session.forgetsuccess = 'Forget password mail sent';
				return res.redirect("/forgetPassword");
			});
		})
        .catch(function(err) {
				req.session.forgeterror='';
				req.session.forgeterror = 'Please try again later';
				return res.redirect("/forgetPassword");
        });
    })
	.catch(function (err) {
		req.session.forgeterror='';
		req.session.forgeterror = 'Invalid Email';
		return res.redirect("/admin/forgetPassword");
	});


}

function sendContinueAppEmailAction(req, res){
	var id = req.param('userID');
	var screentrackingID = req.param('screentrackingID');

	sails.log.info("In sendContinueAppEmailAction, id= ",id);

	const criteria = {
		id: id
	};

	sails.log.info( "criteria::::", criteria );

	User.findOne( criteria )
	.then(function(userdata){
		if(userdata){
			sails.log.info( "userdata::::", userdata );

			EmailService.sendContinueApplicationEmail( userdata );
			req.session.Practicesuccessmsg = "";
			req.session.Practicesuccessmsg = "Continue Application Email has been send successfully!";
			// return res.redirect( "/admin/viewIncomplete/" + id );
			return res.redirect( "/admin/getIncompleteApplicationDetails" );
		}else{
			req.session.Practiceerrormsg = "";
			req.session.Practiceerrormsg = "Continue Application Email not send!";
			return res.redirect( "/admin/getIncompleteApplicationDetails" );
		}
		
	})
	.then( () =>{
		// Log Activity
		var modulename = "Send Continue App Email";
		var modulemessage = "Continue App Email Sent";
		req.achlog = 0;

		return Promise.resolve().then( () => {
			sails.log.info( "ACHC ! req.session.hasOwnProperty( 'lastActivityId' )", ! req.session.hasOwnProperty( "lastActivityId" ) );
			sails.log.info( "ACHC req.session.lastActivityId", req.session.lastActivityId );
			sails.log.info( "ACHC screentrackingID", screentrackingID );
		
		  	return Logactivity.screenTrackingLogActivity( req, modulename, modulemessage, screentrackingID );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "Continue Application Email::", err );
		return reject( err );
	} );
	
}
