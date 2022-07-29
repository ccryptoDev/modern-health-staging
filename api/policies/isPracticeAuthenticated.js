/**
 * Created by Sree on 24/07/18.
 */
 
var  moment = require('moment');
var in_array = require('in_array');
  
module.exports = function (req, res, next) {
	  
	 var urlpath = req.path;	 
	 var urlpathArray = urlpath.split("/");	
	 	
	 if(urlpathArray.length>0)
	 {
		 if (in_array('practice', urlpathArray))
		 { 
			 if((req.session.practiceId != '') && (typeof(req.session.practiceId) != 'undefined') && (req.session.practiceId !=null) )
			 {
				 var activeTab=1;
				 if((req.session.activeTab != '') && (typeof(req.session.activeTab) != 'undefined') && (req.session.activeTab !=null) )
				 {
					activeTab = req.session.activeTab;
				 }
				 
				 return next(); 
			 }
			 else
			 {
				 var UrlSlug = urlpathArray[urlpathArray.length - 1];
				 
			 	 PracticeManagement 
				 .findOne({ UrlSlug: UrlSlug})
				 .then(function(finalreponseData) {
								
					  if(finalreponseData)
					  {
						 if(finalreponseData.Status== "Pending")
						 {
							 req.session.practiceId = finalreponseData.id;
							 req.session.activeTab =1;
							 return next();
						 }
						 else
						 {
							res.view("practice/error/errorpage", {
								code: 404,
								data: 'Requested page not found',
								layout: 'layout'
							});  
						 }
					  }
					  else
					  {
						  req.session.practiceId ='';
						  res.view("practice/error/errorpage", {
							code: 404,
							data: 'Requested page not found',
							layout: 'layout'
						 }); 
					  }				 
				 })
				 .catch(function(err) {
						
						req.session.practiceId ='';
						res.view("practice/error/errorpage", {
							code: 404,
							data: 'Requested page not found',
							layout: 'layout'
						}); 
				 });
			 }
		 }
		 else
		 {
			req.session.practiceId ='';
			res.view("practice/error/errorpage", {
				code: 404,
				data: 'Requested page not found',
				layout: 'layout'
			});  
		 }
	 }
	 else
	 {
		req.session.practiceId ='';
		res.view("practice/error/errorpage", {
			code: 404,
			data: 'Requested page not found',
			layout: 'layout'
		}); 
	 }  
};