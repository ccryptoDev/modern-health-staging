/**
 * Created by vishal on 5/10/16.
 */
 
var  moment = require('moment');
  
module.exports = function (req, res, next) {
	
	var Criteria = {
		maintenance: 1
	}; 
	
	//return next(); 	
	
	Setting.findOne(Criteria)
	.then(function(data){
		//sails.log.info("data------: ", data);	
	
		if(data.isMaintenance==true) {	
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
					
					if(Ips_array[i]==ip && allowIpset==0 ) 
					{		
						allowIpset=1;
					}
				}
				
				if(allowIpset==1)
				{
					return next();
				}
				else
				{
					return res.redirect('/maintenance'); 
				}
		} else {
			return next(); 				
		}	
	})
	.catch(function (err) {
		return res.redirect('/'); 			 
	});
			
};			
 

