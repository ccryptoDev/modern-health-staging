/**
 * Logactivity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const Q = require( "q" );

module.exports = {

	attributes: {
		adminuser: {
			model: "Adminuser"
		},
		email: {
			type: "string"
		},
		modulename: {
			type: "string"
		},
		requesturi: {
			type: "string"
		},
		logmessage: {
			type: "text"
		},
		logdata: {
			type: "json",
			defaultsTo: {}
		},
		remoteaddr: {
			type: "string"
		},
		logreference: {
			type: "text"
			// defaultsTo: shortid.generate
		},
		paymentManagement: {
			model: "PaymentManagement"
		},
		achlog: {
			type: "integer",
			defaultsTo: 0
		},
		isDeleted: {
			type: "boolean",
			defaultsTo: false
		}
	},
	registerLogActivity: registerLogActivity,
	screenTrackingLogActivity: screenTrackingLogActivity,
	/* enduserLogActivity:enduserLogActivity */
	practiceLogActivity: practiceLogActivity
};

function registerLogActivity( reqdata, modulename, modulemessage ) {
	return Q.promise( function( resolve, reject ) {
		sails.log.info( "reqdata.user", reqdata.user );

		if( !modulename || !reqdata || !modulemessage ) {
			// sails.log.error("Logactivity#registerLogActivity :: data null ");
			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		}

		if( modulename == "Admin login" ) {
			return User.getNextSequenceValue( "logs" )
			.then( function( logRefernceData ) {
				// sails.log.info("logRefernceData",logRefernceData);
				const logreference = "LOG_" + logRefernceData.sequence_value;

				const loginfodata = {
					adminuser: reqdata.user.id,
					email: reqdata.user.email,
					modulename: modulename,
					requesturi: reqdata.url,
					logmessage: reqdata.user.email+" - "+reqdata.user.rolename+"  "+modulemessage,
					logdata: reqdata.logdata,
					logreference: logreference,
					remoteaddr: reqdata.ip
				};

				Logactivity.create( loginfodata )
				.then( function( logdetails ) {
					// sails.log.info("Logactivity#registerLogActivity :: ", logdetails);
					return resolve( logdetails );
				} )
				.catch(function(err) {
					sails.log.error( "Logactivity#registerLogActivity :: Error :: ", err );
					return reject( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "Logactivity#registerLogActivity:: Error ::", err );
				return reject( err );
			} );
		} else {
			if( reqdata.session.logReferenceID && reqdata.session.logReferenceID != "" ) {
				// sails.log.info("345345345345343453453 :: ");
				let achlogvalue = 0;
				if( reqdata.achlog == 1 ) {
					achlogvalue = 1;
				}
				const logreference = reqdata.session.logReferenceID;
				let loginfodata;
				if( reqdata.payID && reqdata.payID != "" ) {
					const logmesage = modulename == "Email sent" ? reqdata.user.email+""+reqdata.user.rolename+"  "+modulemessage : reqdata.user.email+" - "+reqdata.user.rolename+"  "+modulemessage;
					loginfodata = {
						adminuser: reqdata.user.id,
						email: reqdata.user.email,
						modulename: modulename,
						requesturi: reqdata.url,
						logmessage: logmesage,
						logdata: reqdata.logdata,
						logreference: logreference,
						remoteaddr: reqdata.ip,
						achlog: achlogvalue,
						paymentManagement: reqdata.payID
					};
				} else {
					loginfodata = {
						adminuser: reqdata.user.id,
						email: reqdata.user.email,
						modulename: modulename,
						requesturi: reqdata.url,
						logmessage: reqdata.user.email+" - "+reqdata.user.rolename+"  "+modulemessage,
						logdata: reqdata.logdata,
						logreference: logreference,
						remoteaddr: reqdata.ip,
						achlog: achlogvalue
					};
				}

				// sails.log.info("loginfodata :: ", loginfodata);

				Logactivity.create( loginfodata )
				.then( function( logdetails ) {
				// sails.log.info("Logactivity#registerLogActivity :: ", logdetails);
					return resolve( logdetails );
				} )
				.catch( function( err ) {
					sails.log.error( "Logactivity#registerLogActivity :: Error :: ", err );
					return reject(err);
				} );
			}
		}
	} );
}


function screenTrackingLogActivity( reqdata, modulename, modulemessage, screenTrackingID ) {
	return Q.promise( function( resolve, reject ) {
		sails.log.info( "reqdata.user", reqdata.user );

		if( !modulename || !reqdata || !modulemessage ) {
			// sails.log.error("Logactivity#registerLogActivity :: data null ");
			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		}

		if( modulename == "Admin login" ) {
			return User.getNextSequenceValue( "logs" )
			.then( function( logRefernceData ) {
				// sails.log.info("logRefernceData",logRefernceData);
				const logreference = "LOG_" + logRefernceData.sequence_value;

				const loginfodata = {
					adminuser: reqdata.user.id,
					email: reqdata.user.email,
					modulename: modulename,
					requesturi: reqdata.url,
					logmessage: reqdata.user.email+" - "+reqdata.user.rolename+"  "+modulemessage,
					logdata: reqdata.logdata,
					logreference: logreference,
					remoteaddr: reqdata.ip
				};

				Logactivity.create( loginfodata )
				.then( function( logdetails ) {
					// sails.log.info("Logactivity#registerLogActivity :: ", logdetails);
					return resolve( logdetails );
				} )
				.catch(function(err) {
					sails.log.error( "Logactivity#registerLogActivity :: Error :: ", err );
					return reject( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "Logactivity#registerLogActivity:: Error ::", err );
				return reject( err );
			} );
		} else {
			if( reqdata.session.logReferenceID && reqdata.session.logReferenceID != "" ) {
				// sails.log.info("345345345345343453453 :: ");
				let achlogvalue = 0;
				if( reqdata.achlog == 1 ) {
					achlogvalue = 1;
				}
				const logreference = reqdata.session.logReferenceID;
				let loginfodata;
				if( reqdata.payID && reqdata.payID != "" ) {
					loginfodata = {
						adminuser: reqdata.user.id,
						email: reqdata.user.email,
						modulename: modulename,
						requesturi: reqdata.url,
						logmessage: reqdata.user.email+" - "+reqdata.user.rolename+"  "+modulemessage,
						logdata: reqdata.logdata,
						logreference: logreference,
						remoteaddr: reqdata.ip,
						achlog: achlogvalue,
						paymentManagement: reqdata.payID
					};
				} else {
					loginfodata = {
						adminuser: reqdata.user.id,
						email: reqdata.user.email,
						modulename: modulename,
						requesturi: reqdata.url,
						logmessage: reqdata.user.email+" - "+reqdata.user.rolename+"  "+modulemessage,
						logdata: reqdata.logdata,
						logreference: logreference,
						remoteaddr: reqdata.ip,
						achlog: achlogvalue,
						screenTracking: screenTrackingID
					};
				}

				// sails.log.info("loginfodata :: ", loginfodata);

				Logactivity.create( loginfodata )
				.then( function( logdetails ) {
				// sails.log.info("Logactivity#registerLogActivity :: ", logdetails);
					return resolve( logdetails );
				} )
				.catch( function( err ) {
					sails.log.error( "Logactivity#registerLogActivity :: Error :: ", err );
					return reject(err);
				} );
			}
		}
	} );
}


/*function enduserLogActivity(reqdata,modulename,modulemessage)
{
	return Q.promise(function(resolve, reject) {

	sails.log.info("reqdata123",reqdata.name);

	if (!modulename || !reqdata || !modulemessage ) {
	  sails.log.error('Logactivity#registerLogActivity :: data null ');

	  return reject({
		code: 500,
		message: 'INTERNAL_SERVER_ERROR'
	  });
	}
	sails.log.info("modulemessage123",modulemessage);


	return User.getNextSequenceValue('logs')
	.then(function(logRefernceData) {

	var logreference ='LOG_'+logRefernceData.sequence_value;

		 var loginfodata = {
				user: reqdata.id,
				email:reqdata.email,
				role:reqdata.role,
				modulename: modulename,
				logmessage:reqdata.email+' - '+modulemessage,
				logdata:reqdata,
				logreference : logreference,
			}
			 Logactivity.create(loginfodata)
				.then(function(logdetails) {
				  sails.log.info("Logactivity#registerLogActivity :: ", logdetails);
				  return resolve(logdetails);
				})
				.catch(function(err) {
				  sails.log.error("Logactivity#registerLogActivity :: Error :: ", err);
				  return reject(err);
				});
	})
			.catch(function(err) {
			  sails.log.error("Logactivity#registerLogActivity:: Error ::", err);
			  return reject(err);
		   });
	});

}*/


function practiceLogActivity(reqdata,modulename,modulemessage) {
  return Q.promise(function(resolve, reject) {

		sails.log.info("reqdata.user",reqdata.user);

		if (!modulename || !reqdata || !modulemessage ) {
		  //sails.log.error('Logactivity#registerLogActivity :: data null ');

		  return reject({
			code: 500,
			message: 'INTERNAL_SERVER_ERROR'
		  });
		}

		if(modulename=='Admin login')
		{
		 	return User.getNextSequenceValue('logs')
			 .then(function(logRefernceData) {

				 sails.log.info("logRefernceData",logRefernceData);
				 var logreference ='LOG_'+logRefernceData.sequence_value;

				 var loginfodata = {
										adminuser: reqdata.user.id,
										email:reqdata.user.email,
										modulename: modulename,
										requesturi: reqdata.url,
										logmessage:reqdata.user.email+' - '+reqdata.user.rolename+'  '+modulemessage,
										logdata:reqdata.logdata,
										logreference : logreference,
										remoteaddr:reqdata.ip
									}

				Logactivity.create(loginfodata)
				.then(function(logdetails) {

				  //sails.log.info("Logactivity#registerLogActivity :: ", logdetails);
				  return resolve(logdetails);
				})
				.catch(function(err) {
				  sails.log.error("Logactivity#registerLogActivity :: Error :: ", err);
				  return reject(err);
				});

			})
			.catch(function(err) {
			  sails.log.error("Logactivity#registerLogActivity:: Error ::", err);
			  return reject(err);
		   });
		}
		else
		{
			if(reqdata.session.logReferenceID && reqdata.session.logReferenceID!='')
			{

		   	  achlogvalue=0;
			  if(reqdata.achlog==1)
			  {
			    achlogvalue=1;
			  }
			  var logreference = reqdata.session.logReferenceID;

			  if(reqdata.payID && reqdata.payID!='')
			  {
				  var loginfodata = {
											adminuser: reqdata.user.id,
											email:reqdata.user.email,
											modulename: modulename,
											requesturi: reqdata.url,
											logmessage:reqdata.user.email+' - '+reqdata.user.rolename+'  '+modulemessage,
											logdata:reqdata.logdata,
											logreference : logreference,
											remoteaddr:reqdata.ip,
											achlog:achlogvalue,
											paymentManagement:reqdata.payID
										}
			  }
			  else
			  {

				 var loginfodata = {
											adminuser: reqdata.user.id,
											email:reqdata.user.email,
											modulename: modulename,
											requesturi: reqdata.url,
											logmessage:reqdata.user.email+' - '+reqdata.user.rolename+'  '+modulemessage,
											logdata:reqdata.logdata,
											logreference : logreference,
											remoteaddr:reqdata.ip,
											achlog:achlogvalue
										}
			  }

				//sails.log.info("loginfodata :: ", loginfodata);

				Logactivity.create(loginfodata)
				.then(function(logdetails) {
				 // sails.log.info("Logactivity#registerLogActivity :: ", logdetails);
				  return resolve(logdetails);
				})
				.catch(function(err) {
				  sails.log.error("Logactivity#registerLogActivity :: Error :: ", err);
				  return reject(err);
				});
			}
		}
  });
}
