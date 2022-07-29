/**
 * Adminuser.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const Q = require( "q" );
const uuid = require( "node-uuid" );
const md5 = require( "md5" );
const shortid = require( "shortid" );
const bcrypt = require( "bcrypt" );

const in_array = require( "in_array" );

module.exports = {
	attributes: {
		practicemanagement: {
			model: "PracticeManagement"
		},
		role: {
			model: "Roles"
		},
		name: {
			type: "string"
		},
		email: {
			type: "string"
		},
		password: {
			type: "text",
			defaultsTo: shortid.generate
		},
		salt: {
			type: "text"
		},
		phoneNumber: {
			type: "string"
		},
		// role: { model: "Roles" },
		isDeleted: {
			type: "boolean",
			defaultsTo: false
		},
		registeredfrom: {
			type: "string",
			defaultsTo: "adminuser"
		}
	},
	getUserById: getUserById,
	registerNewUser: registerNewUser
};

function getUserById( id ) {
	return Q.promise( function( resolve, reject ) {
		Adminuser.findOne( {
			id: id
		} )
		.then( function( user ) {
			if( !user ) {
				return reject( {
					code: 404,
					message: "USER_NOT_FOUND"
				} );
			}

			return resolve( user );
		} )
		.catch( function( err ) {
			sails.log.error( "User#createScreenName :: err ::", err );
			return reject( err );
		} );
	} );
}

function registerNewUser( userDetails ) {
	return Q.promise( function( resolve, reject ) {
		// New registration method using email and deviceid
		const criteria = {
			email: userDetails.email
		};
		console.log( "criteria: ", criteria );
		Adminuser.findOne( criteria )
		.then( function( user ) {
			if( user ) {
				console.log( "user exist" );
				return resolve( { code: 400 } );
			}
			salt = generateSalt();
			const randompwdstring = Utils.generateReferenceId();
			userDetails.password = randompwdstring;
			console.log( "userDetails: ", userDetails );

			return generateEncryptedPassword( userDetails, salt )
			.then( function( encryptedPassword ) {
				userDetails.password = encryptedPassword;
				userDetails.salt = salt;

				const roleCriteria = {
					id: userDetails.role
				};
				Roles.findOne( roleCriteria )
				.then( function( roledata ) {
					userDetails.role = roledata.id;

					if( in_array( roledata.rolename, sails.config.allowedPracticeRoles ) ) {
						userDetails.practicemanagement = userDetails.practiceId;
					}

					delete userDetails.practiceId;

					Adminuser.create( userDetails )
					.then( function( user ) {
						// --Practice admin and Practice staff
						if( in_array( roledata.rolename, sails.config.allowedPracticeRoles ) ) {
							PracticeManagement.findOne( { id: userDetails.practicemanagement } )
							.then( function( practicedata ) {
								return User.getNextSequenceValue( "practiceuser" )
								.then( function( userRefernceData ) {
									let practiceManagementName = "";
									if( practicedata ) {
										practiceManagementName = practicedata.PracticeName;
									}
									const practiceuserReference = "PFUSR_" + userRefernceData.sequence_value;
									const practiceAdminData = {
										username: user.name,
										email: user.email,
										firstname: user.name,
										lastname: user.name,
										roles: user.role,
										practicemanagement: user.practicemanagement,
										phoneNumber: user.phoneNumber,
										registeredtype: roledata.rolename,
										role: roledata.rolename,
										password: user.password,
										salt: user.salt,
										passwordstatus: 1,
										userReference: practiceuserReference,
										practiceManagementName: practiceManagementName
									};

									sails.log.info( "practiceAdminData::::", practiceAdminData );

									PracticeUser.create( practiceAdminData )
									.then( function( practiceuser ) {
										sails.log.info( "Adminuser#practiceuser::", practiceuser );

										const userObjectData = {
											email: userDetails.email,
											name: userDetails.name,
											newtemppassword: randompwdstring,
											rolename: roledata.rolename
										};
										EmailService.sendAdminRegisterEmail( userObjectData );
										return resolve( { code: 200 } );
									} )
									.catch( function( err ) {
										sails.log.error( "Adminuser#registerNewUser::", err );
										return reject( err );
									} );
								} )
								.catch( function( err ) {
									sails.log.error( "Adminuser#registerNewUser::", err );
									return reject( err );
								} );
							} )
							.catch( function( err ) {
								sails.log.error( "Adminuser#registerNewUser::", err );
								return reject( err );
							} );
						} else {
							const userObjectData = {
								email: userDetails.email,
								name: userDetails.name,
								newtemppassword: randompwdstring,
								rolename: roledata.rolename
							};
							EmailService.sendAdminRegisterEmail( userObjectData );
							return resolve( { code: 200 } );
						}
					} )
					.catch( function( err ) {
						sails.log.error( "Adminuser#registerNewUser::", err );
						return reject( err );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "Adminuser#registerNewUser::", err );
					return reject( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "Adminuser#registerNewUser::", err );
				return reject( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "Adminuser#registerNewUser::", err );
			return reject( err );
		} );
	} );
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

function generateSalt() {
	return md5( uuid.v1() );
}
