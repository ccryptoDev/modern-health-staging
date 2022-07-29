/**
 * Created by vishal on 5/10/16.
 */
 
var  moment = require('moment');
  
module.exports = function (req, res, next) {
  if (req.isAuthenticated()) {
	  
	   return next(); 	
	  /*var userrole = req.user.role;
	  console.log("role:",req.user.role)
	  if(userrole){
		  
		    var roleCriteria = {
				id: userrole
			}; 
			
			Roles.findOne(roleCriteria)
			.then(function(roledata){
				 
				  req.user.rolename =roledata.rolename;
		 		  return next(); 			  
			})
			.catch(function (err) {
				return res.redirect('/apply'); 			 
			});
		   
		   
	  }else{
		 return res.redirect('/apply'); 
	  }*/
  }
  else {
    return res.redirect('/apply');
  }
};
