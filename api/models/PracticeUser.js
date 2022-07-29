/**
 * PracticeUser.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const Q = require( "q" );
const uuid = require( "node-uuid" );
const md5 = require( "md5" );
const shortid = require( "shortid" );
const moment = require( "moment" );
const bcrypt = require( "bcrypt" );

const in_array = require( "in_array" );

module.exports = {
	attributes: {
		isDeleted: {
			type: "boolean",
			defaultsTo: false
		},
		dateOfBirth: {
			type: "string"
		},
		phoneNumber: {
			type: "string"
		},
		name: {
			type: "string"
		},
		email: {
			type: "string"
		},
		address: {
			type: "string"
		},
		street: {
			type: "string"
		},
		city: {
			type: "string"
		},
		zipCode: {
			type: "string"
		},
		practicemanagement: {
			model: "PracticeManagement"
		},
		password: {
			type: "text"
		},
		salt: {
			type: "text"
		},
		state: {
			model: "State"
		},
		isValidEmail: {
			type: "boolean",
			defaultsTo: false
		},
		isValidState: {
			type: "boolean",
			defaultsTo: false
		},
		userReference: {
			type: "string"
		},
		registeredtype: {
			type: "string",
			defaultsTo: "signup"
		},
		firstname: {
			type: "string"
		},
		lastname: {
			type: "string"
		},
		middlename: {
			type: "string"
		},
		roles: { model: "Roles" },
		PhoneNumber: {
			type: "string"
		},
		passwordstatus: {
			type: "integer"
		}
	},

	registerNewSchoolAdmin: registerNewSchoolAdmin,
	generateSalt: generateSalt,
	generateEncryptedPassword: generateEncryptedPassword,
	getNextSequenceValue: getNextSequenceValue,
	getuserByemail: getuserByemailAction,
	getPracticeDetails: getPracticeDetailsAction
};

function toUserProfileApi() {
	const user = this.toObject();
	return {
		isUserCreatedStory: user.isUserCreatedStory,
		isPhoneVerified: user.isPhoneVerified,
		isScreenNameSet: user.isScreenNameSet,
		isExistingLoan: user.isExistingLoan,
		isBankAdded: user.isBankAdded,
		isUserProfileUpdated: user.isUserProfileUpdated
	};
}
function generateSalt() {
	return md5( uuid.v1() );
}
function generateEncryptedPassword( user, salt ) {
	return Q.promise( function( resolve, reject ) {
		bcrypt.genSalt( 10, function( err, salt ) {
			bcrypt.hash( user.password, salt, function( err, hash ) {
				if( err ) {
					sails.log.error( "User#generateEncryptedPassword :: err :", err );
					return reject( err );
				} else {
					user.password = hash;
					return resolve( hash.toString( "hex" ) );
				}
			} );
		} );
	} );
}

function getNextSequenceValue( sequenceName ) {
	// sails.log.info("sequenceName",sequenceName);

	return Q.promise( function( resolve, reject ) {
		const countercriteria = {
			apptype: sequenceName
		};
		// sails.log.info("countercriteria",countercriteria);
		Counters.findOne( countercriteria )
		.then( function( counterdata ) {
			counterdata.sequence_value = parseInt( counterdata.sequence_value ) + 1;
			counterdata.save();
			return resolve( counterdata );
		} )
		.catch( function( err ) {
			sails.log.error( "User #getNextSequenceValue::Error", err );
			return reject( err );
		} );
	} );
}

function registerNewSchoolAdmin( userDetails, roleid, userid ) {
	return Q.promise( function( resolve, reject ) {
		Adminuser.findOne( { email: userDetails.email } ).then( function( adminuserdata ) {
			if( adminuserdata ) {
				return resolve( { code: 400 } );
			} else {
				if( userid ) {
					var criteria = {
						email: userDetails.email,
						id: { "!": userid }
					};

					PracticeUser.findOne( criteria ).then( function( user ) {
						if( user ) {
							return resolve( { code: 400 } );
						} else {
							const salt = generateSalt();
							return generateEncryptedPassword( userDetails, salt ).then( function( encryptedPassword ) {
								const criteria = { id: userid };
								userDetails.confirmpassword = encryptedPassword;
								PracticeUser.update( criteria, { middlename: userDetails.middlename, phoneNumber: userDetails.phoneNumber, password: encryptedPassword, confirmpassword: userDetails.confirmpassword } ).exec( function afterwards( err, updated ) {
									return resolve( {
										code: 200,
										userdetails: updated
									} );
								} );
							} );
						}
					} );
				} else {
					var criteria = {
						email: userDetails.email
					};

					sails.log.info( "userinfo criteria: ", criteria );

					PracticeUser.findOne( criteria )
					.then( function( user ) {
						if( user ) {
							return resolve( { code: 400 } );
						}
						const salt = generateSalt();
						const randompwdstring = Math.random()
						.toString( 36 )
						.slice( -12 );
						userDetails.password = randompwdstring;

						return generateEncryptedPassword( userDetails, salt )
						.then( function( encryptedPassword ) {
							userDetails.password = encryptedPassword;
							userDetails.salt = salt;

							const roleCriteria = {
								rolename: roleid
							};

							// sails.log.info("userinfo roleCriteria: ",roleCriteria);

							Roles.findOne( roleCriteria )
							.then( function( roledata ) {
								userDetails.roles = roledata.id;
								return getNextSequenceValue( "practiceuser" )
								.then( function( userRefernceData ) {
									userDetails.userReference = "PFUSR_" + userRefernceData.sequence_value;

									PracticeUser.create( userDetails )
									.then( function( user ) {
										// insert record in admin table

										const AdminData = {
											name: user.username,
											email: user.email,
											phoneNumber: user.phoneNumber,
											role: user.roles,
											password: user.password,
											salt: user.salt,
											practicemanagement: user.practicemanagement,
											isDeleted: false,
											registeredfrom: "practiceadmin"
										};

										Adminuser.create( AdminData )
										.then( function( AdminuserData ) {
											/* var userObjectData = {
													email: userDetails.email,
													name: userDetails.firstname+" "+userDetails.lastname,
													rolename:roledata.rolename
												};*/
											// sails.log.info("userinfo userObjectData: ",userObjectData);
											// sails.log.info("userinfo data: ",user);
											// EmailService.sendSchooluserRegisterEmail(user);

											const userObjectData = {
												email: AdminuserData.email,
												name: AdminuserData.name,
												newtemppassword: randompwdstring,
												rolename: roledata.rolename
											};
											EmailService.sendAdminRegisterEmail( userObjectData );

											return resolve( {
												code: 200,
												userdetails: user
											} );
										} )
										.catch( function( err ) {
											sails.log.error( "PracticeUser#registerNewUser::", err );
											return reject( err );
										} );
									} )
									.catch( function( err ) {
										sails.log.error( "PracticeUser#registerNewUser::", err );
										return reject( err );
									} );
								} )
								.catch( function( err ) {
									sails.log.error( "PracticeUser#registerNewUser::", err );
									return reject( err );
								} );
							} )
							.catch( function( err ) {
								sails.log.error( "PracticeUser#registerNewUser::", err );
								return reject( err );
							} );
						} )
						.catch( function( err ) {
							sails.log.error( "PracticeUser#registerNewUser::", err );
							return reject( err );
						} );
					} )
					.catch( function( err ) {
						sails.log.error( "PracticeUser#registerNewUser::", err );
						return reject( err );
					} );
				}
			}
		} );
	} );
}

function getuserByemailAction( emailid ) {
	return Q.promise( function( resolve, reject ) {
		sails.log.info( "emailid: ", emailid );

		PracticeUser.findOne( {
			email: emailid
		} )
		.then( function( user ) {
			if( "undefined" == typeof user || user == "" || user == null ) {
				sails.log.info( "emailid: 11111", emailid );
				return resolve( { code: 404 } );
			} else {
				return resolve( user );
			}
		} )
		.catch( function( err ) {
			sails.log.info( "emailid: 22222", emailid );
			sails.log.error( "User#getuserbyemailAction :: err ::", err );
			return resolve( { code: 404 } );
		} );
	} );
}
function getPracticeDetailsAction( staff, doctor ) {
	return Q.promise( function( resolve, reject ) {
		// sails.log.info("staff.length:::",staff);
		// sails.log.info("doctor.length:::",doctor);

		const praticeIds = staff.concat( doctor );
		PracticeUser.find( praticeIds )
		.then( function( linkedpracticeRes ) {
			// sails.log.info("linkedpracticeRes:::",linkedpracticeRes);
			// return resolve({code: 200,result:linkedpracticeRes});

			const practiceData = [];
			const practiceArr = [];

			if( staff.length > 0 ) {
				staff.forEach( function( id ) {
					_.forEach( linkedpracticeRes, function( linkedpracticeData ) {
						if( linkedpracticeData.id == id ) {
							linkedpracticeData.type = "Staff";
							practiceData.push( linkedpracticeData );
							practiceArr.push( id );
						}
					} );
				} );
			}

			// sails.log.info("practiceData:::",practiceData);
			if( doctor.length > 0 ) {
				doctor.forEach( function( did ) {
					_.forEach( linkedpracticeRes, function( linkedpracticeData ) {
						if( linkedpracticeData.id == did ) {
							if( in_array( did, practiceArr ) ) {
								_.forEach( practiceData, function( practiceDetails ) {
									if( linkedpracticeData.id == practiceDetails.id ) {
										practiceDetails.type = "Staff / Doctor";
									}
								} );
							} else {
								linkedpracticeData.type = "Doctor";
								practiceData.push( linkedpracticeData );
								practiceArr.push( did );
							}
						}
					} );
				} );
			}
			// sails.log.info("practiceData:::",practiceData);
			return resolve( { code: 200, result: practiceData } );
		} )
		.catch( function( err ) {
			return resolve( { code: 400 } );
		} );
	} );
}
