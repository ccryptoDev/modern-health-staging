/**
 * Created by Sree on 05/08/18.
 */
 
var  moment = require('moment');
  
module.exports = function (req, res, next) {
	
	var Criteria = {
		maintenance: 1
	}; 
	
	Setting.findOne(Criteria)
	.then(function(data){
	
		if(data.isMaintenance==true) {
			//return next(); 	
			
				
			var Ips = data.whitelistIp;
			var Ips_array = Ips.split(',');
			
				var IPFromRequest = req.headers['x-forwarded-for'] || req.connection.remoteAddress; //::ffff:192.168.1.107		192.168.1.128
				var indexOfColon = IPFromRequest.lastIndexOf(':');
				var ip = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);	
				
				sails.log.info("ip------: ", ip);
				
				var allowIpset=0;
				for(var i = 0; i < Ips_array.length; i++) {					
					Ips_array[i] = Ips_array[i].replace(/^\s*/, "").replace(/\s*$/, "");
					//console.log("Ips_array[i]----",Ips_array[i]);
					/*if(Ips_array[i]=='111.93.237.186') {						
							
					}*/		
					
					sails.log.info("ipArray------: ", Ips_array[i]);
					
					if(Ips_array[i]==ip) {		
						allowIpset=1;
					}
				}
				
				if(allowIpset==1)
				{
					return res.redirect('/'); 	
				}
				else
				{
					return res.view("maintenance"); 
				}
		
		} else {
			return res.redirect('/'); 		
		}	
	})
	.catch(function (err) {
		return res.redirect('/'); 			 
	});
};