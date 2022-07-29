/**
 * Created by vishal on 5/10/16.
 */

var  moment = require('moment');

var in_array = require('in_array');

module.exports = function (req, res, next) {
  if (req.isAuthenticated()) {
	  req.user.createdAt = moment(req.user.createdAt).format('MMM, YYYY');
	  var userrole = req.user.role;

	  var urlpath = req.path;
	  var practiceAdminpageArray 			=	['managepracticeadmin','addPracticeAdmin','editpracticeadminuser','practiceCreditReportList'];
	  var blockpracticeAdminpageArray 		=	['practiceCreditReportList'];

	  if(userrole)
	  {
		    var roleCriteria = {
				id: userrole
			};

			Roles.findOne(roleCriteria)
			.then(function(roledata){

				  if (in_array(roledata.rolename, sails.config.allowedAdminRoles))
		 		  {
					  if (in_array(roledata.rolename, sails.config.allowedPracticeRoles))
					  {

						  var practicecriteria ={
							  id:req.user.practicemanagement,
							  isDeleted : false
						  };

						  PracticeManagement
						  .findOne(practicecriteria)
						  .then(function(practicedata){

						  	 req.user.rolename =roledata.rolename;

							 if(practicedata)
							 {
								 req.user.practicename =practicedata.PracticeName;
								 req.session.adminpracticeID = practicedata.id;
								 req.session.adminpracticeName = practicedata.PracticeName;
								 req.session.adminroleName = roledata.rolename;

								 //sails.log.info("session values:=================",req.session);

								 var urlpathArray= urlpath.split('/');

								 var pagename;
								 if(urlpathArray.length>1)
								 {
									pagename=urlpathArray[2];
								 }
								 else if(urlpathArray.length>0)
								 {
										pagename=urlpathArray[1];
								 }
								 else
								 {
									pagename = 	urlpath;
								 }

								 if(in_array(pagename,blockpracticeAdminpageArray))
								 {
									 return res.redirect('/admin/dashboard');
								 }
								 else
								 {
									 if(roledata.rolename=='PracticeAdmin' || roledata.rolename=='PracticeDoctor')
									 {
										return next();
									 }
									 else
									 {
										if(in_array(pagename,practiceAdminpageArray))
										{
											return res.redirect('/admin/dashboard');
										}
										else
										{
											return next();
										}
									 }
								 }
							 }
							 else
							 {
								req.session.errormsg = 'Invalid Username and Password';
								return res.redirect('/adminLogin');
							 }
						  })
						  .catch(function (err) {

								req.session.errormsg = 'Invalid Username and Password';
								return res.redirect('/adminLogin');
						  });
					  }
					  else
					  {
					  	req.user.rolename =roledata.rolename;
						req.session.adminroleName = roledata.rolename;

						//sails.log.info("session values:=================",req.session);

		 		 	  	return next();
					  }
				  }
				  else
				  {
					  req.session.errormsg = 'Invalid Username and Password';
					  return res.redirect('/adminLogin');
				  }
			})
			.catch(function (err) {
				req.session.errormsg = 'Invalid Username and Password';
				return res.redirect('/adminLogin');
			});
	  }
	  else
	  {
		 return res.redirect('/adminLogin');
	  }
  }
  else
  {
    return res.redirect('/adminLogin');
  }
};
