/**
 * Created by Muthu on 5/12/17.
 */

const moment = require( "moment" );
const _ = require( "lodash" );

module.exports = function( req, res, next ) {
	if( req.isAuthenticated() ) {
		const userid = req.session.userId;
		const urlpath = req.path;
		const lstle = req.session.levels;
		const deniedstatus = req.session.deniedstatus;
		sails.log.info( "JH isLoginAuthenticated.js userid", userid );

		if( deniedstatus == 1 && deniedstatus != "" && deniedstatus != null && "undefined" !== typeof deniedstatus ) {
			// -- When loan denied in frontend ( redirect to show error message in create application page )
			return next();
		} else {
			const reapplyoptions = {
				user: userid
				// status : 'PAID OFF',
				// achstatus: 1
			};
			PaymentManagement.findOne( reapplyoptions )
			.sort( "createdAt DESC" )
			.then( ( loanDetails ) => {
				// sails.log.info("loanDetails::: ", loanDetails);
				if( loanDetails ) {
					if( loanDetails.status == "PAID OFF" && loanDetails.achstatus == 1 ) {
						req.session.reapply = "yes";
					} else {
						req.session.reapply = "no";
					}
				}
				// --First Screentracking checked ( whether any incomplete application exist )
				let screenCriteria = { user: userid };
				Screentracking.find( screenCriteria )
				.then( ( screendatalist ) => {
					let screendata = _.find( screendatalist, { iscompleted: 0	} );
					if( !screendata ) {
						screendata = _.find( screendatalist, { iscompleted: 1, lastlevel: 6 } ); // thank you page
						if( !screendata ) {
							if( urlpath == "/dashboard" ) {
								return next();
							}
							return res.redirect( "/dashboard" );
						}
					}
					level = screendata.lastlevel;
					req.session.reapply = "no";
					sails.log.info( "isLoginAuthenticated; level::: ", level );
					if( level ) {
						if( urlpath == "/dashboard" && level >= 7 ) {
							return next();
						} else {
							const routeCriteria = {
								routename: urlpath
							};
							// sails.log.info('routeCriteria', routeCriteria);
							Infotable.findOne( routeCriteria )
							.then( function( routeldata ) {
								// sails.log.info( "routeldata:", JSON.stringify(routeldata));
								if( !routeldata || routeldata.level == level ) {
									return next();
								}
								const levelCriteria = {
									level: level
								};
								sails.log.info( "levelCriteria:::", levelCriteria );

								Infotable.findOne( levelCriteria )
								.then( function( leveldetails ) {
									sails.log.info( "isLoginAuthenticated; leveldetails:::", leveldetails );
									if( leveldetails ) {
										if (leveldetails.routename == "/thankyou") {
											return next();
										}
										return res.redirect( leveldetails.routename );
									}
									return res.redirect( "/createapplication" );
								} )
								.catch( function( err ) {
									sails.log.error( "isAuthenticated#loandocumentsAction 1:: err", err );
									return res.redirect( "/login" );
								} );
							} )
							.catch( function( err ) {
								sails.log.error( "isAuthenticated#loandocumentsAction 2:: err", err );
								return res.redirect( "/login" );
							} );
						}
					} else {
						// -- Need to check paymentmanagement table for any funded ( paid off / Opened )or denied or pending or closed or blocked application
						const payoptions = {
							user: userid,
							$or: [ { status: "OPENED" }, { status: "PAID OFF" }, { status: "CLOSED" } ],
							achstatus: [ 0, 1, 2, 3 ]
						};

						PaymentManagement.findOne( payoptions )
						.sort( "createdAt DESC" )
						.then( function( payDetails ) {
							if( payDetails ) {
								return res.redirect( "/dashboard" );
							} else {
								return res.redirect( "/createapplication" );
							}
						} )
						.catch( function( err ) {
							return res.redirect( "/createapplication" );
						} );
					}
				} )
				.catch( function( err ) {
					sails.log.error( "isAuthenticated#Screentraking::Error", err );
					return res.redirect( "/apply" );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "isAuthenticated#Screentraking::Error", err );
				return res.handleError( err );
			} );
		}
	} else {
		return res.redirect( "/login" );
	}
};
