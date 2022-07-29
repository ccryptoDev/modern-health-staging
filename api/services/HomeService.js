/* global sails, User, passport, Screentracking, Infotable */
const passport = require( "passport" );


module.exports = {
	login: login
};

function login( req, res, failure_redirect, success_redirect ) {
	const shouldVerifyEmail = req.session.hasOwnProperty( "shouldVerifyEmail" ) && req.session.shouldVerifyEmail;
	let user;
	User.findOne( { email: req.param( "email" ) } )
	.populate( "role" )
	.then( function( userinfo ) {
		if( ! userinfo ) {
			req.session.errormsg = "Invalid Username and Password";
			return res.redirect( failure_redirect );
		}
		PaymentManagement.findOne( {user: userinfo.id} )
		.sort("updatedAt DESC")
		.then( function(paymentManagementStatus) {
			Screentracking.findOne( {user: userinfo.id} )
			.sort("updatedAt DESC")
			.then( function(screentrackingArchive) {
				if( ! paymentManagementStatus ){
					if(screentrackingArchive.moveToArchive == 1){
						req.session.errormsg = "Invalid Username and Password";
						return res.redirect( failure_redirect );
					}
				}else{
					if( paymentManagementStatus.status == "DENIED" && !screentrackingArchive.counterOfferIncomplete)
					{	
						req.session.errormsg = "Invalid Username and Password";
						return res.redirect( failure_redirect );
					}
					else if( paymentManagementStatus.moveToArchive == 1 || (screentrackingArchive.moveToArchive == 1 && !screentrackingArchive.counterOfferIncomplete)){
						req.session.errormsg = "Invalid Username and Password";
						return res.redirect( failure_redirect )
					}
				}
				user = userinfo;
				req.session.userId = userinfo.id;
				let redirectpage = "";
				sails.log.info( "HomeController.js LoginAction req.param( type )", req.param( "type" ) );
				if( "undefined" !== req.param( "type" ) && req.param( "type" ) != "" && req.param( "type" ) != null && req.param( "type" ) == "reset" ) {
					const newpassword = req.param( "password" );
					userinfo.password = newpassword;
					const salt = User.generateSalt();

					User.generateEncryptedPassword( userinfo, salt ).then( function( encryptedPassword ) {
						userinfo.mustChangePassword = false;
						userinfo.password = encryptedPassword;
						userinfo.salt = salt;
						userinfo.emailreset = true;
						userinfo.save( function( err ) {
							if( err ) {
								sails.log.error( "Update error:", err );
							}
							passport.authenticate( "user-local", function( err, userinfo, info ) {
								if( err || !userinfo ) {
									req.session.errormsg = "Invalid Username and Password";
									return res.redirect( failure_redirect );
								}
								req.logIn( userinfo, function( err ) {
									if( err ) {
										res.handleError( err );
									}
									req.session.userId = userinfo.id;
									req.session.loginType = "frontend";
									req.session.practiceId = userinfo.practicemanagement;

									if( success_redirect ) {
										return res.redirect( success_redirect );
									}

									Screentracking.findOne( { user: userinfo.id, iscomplete: 0 } )
									.then( ( screendata ) => {
										if( screendata ) {
											const level = screendata.lastlevel;

											Infotable.findOne( { level: level } )
											.then( ( leveldetails ) => {
												if( leveldetails ) {
													const currentroute = leveldetails.routename;
													return res.redirect( currentroute );
												} else {
													req.session.levels = 1;
													return res.redirect( "/createapplication" );
												}
											} )
											.catch( function( err ) {
												req.session.levels = 1;
												return res.redirect( "/createapplication" );
											} );
										} else {
											Screentracking.checkLoanexsits( req.session.userId )
											.then( function( loandetails ) {
												sails.log.info( "loandetails: ", loandetails );
												if( loandetails.code == 200 ) {
													redirectpage = loandetails.redirectpage;
													return res.redirect( redirectpage );
												} else {
													if( loandetails.redirectpage == "createapplication" ) {
														req.session.levels = 1;
													}
													redirectpage = loandetails.redirectpage;
													return res.redirect( redirectpage );
												}
											} )
											.catch( function( err ) {
												req.session.levels = 1;
												return res.redirect( "/createapplication" );
											} );
										}
									} )
									.catch( function( err ) {
										sails.log.error( "HomeController#loginAction :: err :", err );
										return res.handleError( err );
									} );
								} );
							} )( req, res );
						} );
					} );
				} else {
					passport.authenticate( "user-local", function( err, userinfo, info ) {
						if( err || !userinfo ) {
							req.session.errormsg = "Invalid Username and Password";
							req.session.userId = null;
							return res.redirect( failure_redirect );
						}
						req.logIn( userinfo, function( err ) {
							if( err ) {
								res.handleError( err );
							}
							req.session.userId = userinfo.id;

							req.session.loginType = "frontend";
							req.session.levels = 1;
							req.session.practiceId = user.practicemanagement;
							sails.log.verbose( "req.logIn(); userinfo:", userinfo );
							sails.log.verbose( "req.logIn(); req.session:", req.session );

							return Promise.resolve()
							.then( () => {
								if( !shouldVerifyEmail ) { return; }
								return User.update( { id: userinfo.id }, { isEmailVerified: true } );
							} )
							.then( () => {
								if( success_redirect ) {
									return res.redirect( success_redirect );
								}
								return Screentracking.findOne( { user: userinfo.id, iscompleted: 0 } )
								.then( function( screendata ) {
									if( screendata ) {
										req.session.screenId = screendata.id;
										const level = parseInt( screendata.lastlevel );
										const levelCriteria = { level: level };

										Infotable.findOne( levelCriteria )
										.then( function( leveldetails ) {
											sails.log.info( "HomeController.loginAction; leveldetails::: ", leveldetails, levelCriteria );
											if( leveldetails ) {
												const currentroute = leveldetails.routename;
												return res.redirect( currentroute );
											} else {
												req.session.levels = 1;
												return res.redirect( "/createapplication" );
											}
										} )
										.catch( function( err ) {
											req.session.levels = 1;
											return res.redirect( "/createapplication" );
										} );
									} else {
										Screentracking.checkLoanexsits( req.session.userId )
										.then( function( loandetails ) {
											sails.log.info( "loandetails: ", loandetails );
											if( loandetails.code == 200 ) {
												return res.redirect( loandetails.redirectpage );
											} else {
												if( loandetails.redirectpage == "createapplication" ) {
													req.session.levels = 1;
												}
												return res.redirect( loandetails.redirectpage );
											}
										} )
										.catch( function( err ) {
											req.session.levels = 1;
											return res.redirect( "/createapplication" );
										} );
									}
								} )
								.catch( function( err ) {
									sails.log.error( "HomeController#loginAction :: err :", err );
									return res.handleError( err );
								} );
							} );
						} );
					} )( req, res );
				}
			})
		})
	} )
	.catch( function( err ) {
		req.session.errormsg = "";
		req.session.errormsg = "Invalid Username and Password";
		return res.redirect( "/apply" );
	} );
}