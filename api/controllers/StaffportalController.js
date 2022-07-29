/**
 * StaffportalController
 *
 * @description :: Server-side logic for managing States
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';

var passport = require('passport');
var bcrypt = require("bcrypt");
var in_array = require('in_array');
var moment =require('moment');

module.exports = {
	setpassword:setpasswordAction,
	updatepassword:updatepasswordAction,
	login: loginAction,
	logout:logoutAction,
	signin:signinAction
	
};

function setpasswordAction(req, res){
	
	    var errorval = '';
		var successval = '';
		var id = req.param("id");

		if(req.session.passerror!=''){
			errorval = req.session.passerror;
			req.session.passerror = '';
		}
		if(req.session.successval!=''){
			successval =req.session.successval;
			req.session.successval = '';
	    }
		
		res.view("staffportal/setpassword",{
			error: errorval,successval: successval, id: id		 
		});
	
}

function updatepasswordAction(req, res){
	
	var email = req.param("email");
	var newpassword = req.param("new_pwd");
	var confirmpass = req.param("confirm_pwd");
	var userid = req.param("userid");
	
	var userObj = {
	   email: email,
	};
		
	PracticeUser
	.getuserByemail(email)
	.then(function(updatedUser){
		
		updatedUser.password = newpassword;
		var salt = PracticeUser.generateSalt();
		
		PracticeUser.generateEncryptedPassword(updatedUser, salt)
		.then(function(encryptedPassword) {
						 
			   updatedUser.password = encryptedPassword;
			   updatedUser.passwordstatus = 1;
			   updatedUser.salt = salt;
				 
				 var useridemail = updatedUser.id;
				 
				 if(userid == useridemail)
				 {
				 
				    updatedUser.save(function(err) {
						if (err) {
							var json = {
								status: 500,
								message:"Unable to update Password!"
							 };
							 req.session.passerror='';
							 req.session.passerror = 'Unable to update Password!!';
							 return res.redirect('/staffportal/setpassword/' +userid);
						}
			
						req.session.successval='';
						req.session.successval = 'Password changed successfully!';
						return res.redirect('/staffportal/setpassword/' +updatedUser.id);
			       });
				 
			 }else{
					req.session.passerror='';
					req.session.passerror = 'Invalid Email Address';
					return res.redirect('/staffportal/setpassword/' +userid);
			 }
				 
		});
				
	}).catch(function (err) {
		req.session.passerror='';
		req.session.passerror = 'Invalid Email Address';
		return res.redirect('/staffportal/setpassword/' +userid);
	});	

}

function loginAction(req,res){
   
	    var errorval = '';
		
		if(req.session.errormsg!=''){
			errorval = req.session.errormsg;
			req.session.errormsg = '';
		}
		
        res.view("staffportal/login",{
			error: errorval		 
		});
}

function signinAction(req, res){
	
	sails.log.info("Enter function");
	
	PracticeUser.findOne({ username: req.param('username') })
    .populate('roles')
    .then(function (userinfo) {
		
		//sails.log.info("Enter userinfo", userinfo);
					
		 var emailstatus = userinfo.isEmailVerified;
		 if(!userinfo)
		 {
			req.session.errormsg='';
			req.session.errormsg = 'Invalid Username and Password';
			return res.redirect("/staffportal/login");
			
		 }else{
		     
			 sails.log.info("Enter else function", userinfo);
			 userinfo.logintype='staff-local';
			 
		     passport.authenticate('staff-local', function (err, userinfo, info) {
														   
					if ((err) || (!userinfo)) {
						 var json = {
							status: 400,
							message:"INSUFFICIENT_DATA"
						 }; 
						req.session.errormsg='';
						req.session.errormsg = 'Invalid Username and Password';
						return res.redirect("/staffportal/login");
					}
					
					sails.log.info("userinfo======",userinfo);
					req.logIn(userinfo, function (err) {
							sails.log.info("Enter Loop");					  
						  if (err) {
							res.handleError(err);
						  }
						  req.session.userId = userinfo.id;
						  
						  return res.redirect("/staffportal/createapplication");
						 
					});
				
			  })(req, res); 
			 
			 
		 }
    })
    .catch(function (err) {
		    req.session.errormsg='';
			req.session.errormsg = 'Invalid Username and Password';
			return res.redirect("/staffportal/login");
    });
	
	
}

function logoutAction(req, res) {
	
	  req.session.userId = '';
	  req.logout();
	  req.flash('error','');
	  res.redirect('/staffportal/login');
}

