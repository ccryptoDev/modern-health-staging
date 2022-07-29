/* global sails, User, PaymentManagement, Roles, Screentracking, Useractivity, State */
/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const Q = require( "q" );
const uuid = require( "node-uuid" );
const md5 = require( "md5" );
// const shortid = require( "shortid" );
const moment = require( "moment" );
const bcrypt = require( "bcrypt" );
const parseAddress = require( "parse-address" );
const _ = require("lodash");
module.exports = {
	attributes: {
		isDeleted: {
			type: "boolean",
			defaultsTo: false
		},
		dateOfBirth: {
			type: "string"
		},
		isEmailVerified: {
			type: "boolean",
			defaultsTo: false
		},
		phoneNumber: {
			type: "string"
		},
		workphone: {
			type: "string"
		},
		isPhoneVerified: {
			type: "boolean",
			defaultsTo: "false"
		},
		name: {
			type: "string"
		},
		email: {
			type: "string"
		},
		primaryaddress: {
			type: "string"
		},
		practicemanagement: { model: "PracticeManagement", required: true },
		role: { model: "Roles" },
		roles: { collection: "Roles" },
		password: {
			type: "text"
		},
		salt: {
			type: "text"
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
		firstname: { type: "string" },
		middlename: { type: "string" },
		lastname: { type: "string" },
		generationCode: { type: "string" },
		street: { type: "string" },
		unitapt: { type: "string" },
		city: { type: "string" },
		state: { type: "string" },
		_state: { model: "State" },
		zipCode: { type: "string" },
		ssn_number: { type: "string" },
		isExistingLoan: {
			type: "boolean",
			defaultsTo: false
		},
		isGovernmentIssued: {
			type: "boolean",
			defaultsTo: true
		},
		isPayroll: {
			type: "boolean",
			defaultsTo: true
		},
		isBankAdded: {
			type: "boolean",
			defaultsTo: false
		},
		oldemaildata: {
			type: "array",
			defaultsTo: []
		},
		underwriter: {
			type: "string",
			defaultsTo: "user"
		},
		consentforUers: {
			type: "boolean",
			defaultsTo: false
		},
		consentforAocr: {
			type: "boolean",
			defaultsTo: false
		},
		peconsentforNtct: {
			type: "boolean",
			defaultsTo: false
		},
		privacyPolicy: {
			type: "boolean",
			defaultsTo: false
		},
		preQualificationScd: {
			type: "boolean",
			defaultsTo: false
		},
		notifiemail: {
			type: "string"
		},
		appversion: {
			type: "string",
			defaultsTo: sails.config.appManagement.appVersion
		},
		clicktosave: {
			type: "integer",
			defaultsTo: 0
		},
		clickfilloutmanually: {
			type: "integer",
			defaultsTo: 0
		},
		clickplaidconnected: {
			type: "integer",
			defaultsTo: 0
		},
		clickpagename: {
			type: "string"
		}
	},
	createNewUser: createNewUser,
	registerOrLoadUser: registerOrLoadUser,
	updatePhoneNumber: updatePhoneNumber,
	getUserForId: getUserForId,
	updateAccessToken: updateAccessToken,
	updateUserDetail: updateUserDetail,
	uploadUserProfilePicture: uploadUserProfilePicture,
	getProfile: getProfile,
	createScreenName: createScreenName,
	getUserByScreenName: getUserByScreenName,
	getAllUsersForUniversity: getAllUsersForUniversity,
	updateNotificationStatus: updateNotificationStatus,
	getPopulatedUsers: getPopulatedUsers,
	updateProfileOfUser: updateProfileOfUser,
	sendVerificationMail: sendVerificationMail,
	getLoanConfirmedMessage: getLoanConfirmedMessage,
	getUserByEmailId: getUserByEmailId,
	generateSalt: generateSalt,
	generateEncryptedPassword: generateEncryptedPassword,
	activateUserWithKey: activateUserWithKey,
	updateisPhoneVerified: updateisPhoneVerified,
	getUserSettingDetail: getUserSettingDetail,
	updateVerifyEmailForKey: updateVerifyEmailForKey,
	getLoanStatus: getLoanStatus,
	getEmailVerified: getEmailVerified,
	updateUserStatus: updateUserStatus,
	deleteAllUserRelatedStuff: deleteAllUserRelatedStuff,
	retrieveUserByPhoneNumber: retrieveUserByPhoneNumber,
	deleteAllUserRelatedDetails: deleteAllUserRelatedDetails,
	getNextSequenceValue: getNextSequenceValue,
	updatepushNotificationStatus: updatepushNotificationStatus,
	checkPaymentmanagementStatus: checkPaymentmanagementStatus,
	changeemailAddress: changeemailAddress,
	changePhoneNumber: changePhoneNumber,
	socialregisterOrLoadUser: socialregisterOrLoadUser,
	registerSocialUser: registerSocialUser,
	updateSocialUser: updateSocialUser,
	getUserBySocialNetworkID: getUserBySocialNetworkID,
	createUser: createUser,
	// thirtyDayDenialRule: thirtyDayDenialRule,
	registerNewUser: registerNewUser,
	registerNewUserByCustomerService: registerNewUserByCustomerServiceAction,
	forgotpassword: forgotpassword,
	getuserByemail: getuserByemailAction,
	registerNewUsertfchome: registerNewUsertfchome,
	callDeclinedEmail: callDeclinedEmail,
	callFundedEmail: callFundedEmail,
	getuserById: getuserById,
	registerNewUserApi: registerNewUserApi,
	setPasswordlogin: setPasswordlogin,
	registerNewUserApplication: registerNewUserApplication,
	registerNewPlaidUserApplication: registerNewPlaidUserApplication,
	createNewUserProcess: createNewUserProcessAction,
	doTransunionProcess: doTransunionProcess,
	sendRegistrationEmail: sendRegistrationEmail,
	getBorrowerDashboardDetails: getBorrowerDashboardDetails,
	resetUserRelatedDetails: resetUserRelatedDetails,
	checkuseralreadyregistered: checkuseralreadyregistered,
	register: registerAction,
	parseLastName: parseLastName,
	parseStreetAddress: parseStreetAddress,
	changeMobileNumber: changeMobileNumber,
	userExists: userExists
};

function userExists (email) {
	return Q.promise((resolve) => {
		return User.find({ email: email }).then( async( userData ) => {
			return resolve(!!userData.length);
		});
	});
}

function createNewUser( req, res, userInfo ) {
	return Q.promise( ( resolve ) => {
		sails.log.info( "User.createNewUser userInfo[1]:", userInfo );
		const existingQuery = { email: userInfo.email };
		return User.find( existingQuery ).then( async( userData ) => {
			if( userData !== undefined && Array.isArray( userData ) && userData.length > 0 ) {
				const samePass = await bcrypt.compare(userInfo.password, userData[0].password)
				const reapply = await PaymentManagement.findOne({user: userData[0].id})
				if (reapply && reapply.eligiblereapply === 0) {
					const dupusererror = "You already have an account with " + sails.config.lender.shortName + ", please sign in with your existing account.";
					return resolve({code: 400, userdetails: userData[0], dupusererror: dupusererror});
				}
				if (samePass) {
					return resolve( { code: 200, userdetails: userData[0] } )
				} else {
					const dupusererror = "You already have an account with " + sails.config.lender.shortName + ", please sign in with your password.";
					return resolve({code: 400, userdetails: userData[0], dupusererror: dupusererror});
				}
				return thirtyDayDenialRule( existingQuery ).then( ( ssnData ) => {
					if( ssnData.days <= 30 && ssnData.days > 0 ) {
						const reapplyerror = "Thank you for reapplying with " + sails.config.lender.shortName + ". At this time we could not offer you a loan, please reapply in " + ssnData.days + " day(s).";
						return resolve( { code: 400, userdetails: userData[ 0 ], reapplyerror: reapplyerror } );
					} else if( ssnData.dupuser ) {
						if(req.session.deniedstatus === 1) {
								const existingUserData = userData[ 0 ];
								delete userInfo.userReference;
								delete userInfo.salt;
								delete userInfo.password;
								delete userInfo.id;

								_.assign(existingUserData, userInfo);
								existingUserData.save();
								return resolve( { code: 200, userdetails: existingUserData } );
						}else {
							const dupusererror = "You already have an account with " + sails.config.lender.shortName + ", please sign in with your existing account.";
							return resolve({code: 400, userdetails: userData[0], dupusererror: dupusererror});
						}
					} else {
						return setupUser();
					}	
				} );
			}
			return setupUser();
		} );
		function setupUser() {
			return User.getNextSequenceValue( "user" )
			.then( ( userReferenceData ) => {
				const userReference = "USR_" + userReferenceData.sequence_value;
				userInfo.userReference = userReference;
				return Roles.findOne( { rolename: "User" } ).then( ( roleData ) => {
					if( roleData ) { userInfo.role = roleData.id; }
				} );
			} )
			.then( () => {
				userInfo.salt = generateSalt();
				return generateEncryptedPassword( userInfo, userInfo.salt ).then( ( encryptedPassword ) => {
					userInfo.password = encryptedPassword;
				} );
			} )
			.then( () => {
				return State.findOne( { stateCode: userInfo.state } ).then( ( state ) => {
					if( state ) { userInfo._state = state.id; }
				} );
			} )
			.then( () => {
				parseLastName( userInfo );
				parseStreetAddress( userInfo );
				sails.log.info( "User.createNewUser userInfo[2]:", userInfo );
				userInfo.isPhoneVerified = true;
                User.create( userInfo )
                .then( ( userData ) => {
                    const userreq = {};
                    const usersubject = "Registration Success";
                    const userdescription = "User registration.";
                    userreq.userid = userData.id;
                    userreq.logdata = "User registration successful - " + userData.email;
                    Useractivity.createUserActivity( userreq, usersubject, userdescription );
                    return resolve( { code: 200, userdetails: userData } );
                } )
                .catch( ( err ) => {
                    sails.log.error( "User.createNewUser err: ", err );
                    return res.handleError( { code: 500, message: "INTERNAL_SERVER_ERROR" } );
                } );
            } );
        }
    } );

    function thirtyDayDenialRule( existingQuery ) {
        const ssnData = { dupuser: false, days: 0 };
        const priorDate = moment().subtract( 30, "days" );
        const testingDupSSN = [ "666482787", "666432195", "666188430", "666626259", "666429061", "111111111", "666484418", "666115919", "666079018", "666072838", "666740607", "666222725", "666449767", "666603693"];
        // const testingDupSSN = [ "666603693", "666333597", "666421863", "666386880", "666541587", "666402522", "666622827", "666323124", "666154329", "666295782", "666731031", "666193191", "666212163", "666631236", "666703725", "666089526", "666143472", "666136632", "666072063", "666452952", "666645519", "666642567", "666145512", "666185667", "666161871", "666474024", "666189825", "666384141", "666390426", "666314445", "666284418", "666220341", "666631317", "666146784", "666332298", "666456873", "666250134", "666229887", "666651447", "666392238", "666162762", "666376104", "666455730", "666197955", "666736233", "666202200", "666522450", "666707784", "666469662", "666223596", "666514917", "666300498", "666093375", "666184773", "666462273", "666019383", "666168048", "666416169", "666020511", "666249255", "666379488", "666279264", "666064338", "666633108", "666285003", "666154992", "666551898", "666462570", "666475953", "666536823", "666497745", "666307554", "666266307", "666424923", "666371364", "666540549", "666097479", "666180648", "666724857" ];
        // const testingDupSSN = [ "666333597", "666421863", "666541587", "666402522", "666622827", "666323124", "666154329", "666295782", "666731031", "666193191", "666212163", "666631236", "666703725", "666089526", "666143472", "666136632", "666386880", "666072063", "666452952", "666645519", "666642567", "666145512", "666185667", "666161871", "666474024", "666189825", "666384141", "666390426", "666314445", "666284418", "666220341", "666631317", "666146784", "666332298", "666456873", "666250134", "666229887", "666651447", "666392238", "666162762", "666376104", "666455730", "666197955", "666736233", "666202200", "666522450", "666707784", "666469662", "666223596", "666514917", "666300498", "666093375", "666184773", "666462273", "666019383", "666168048", "666416169", "666020511", "666249255", "666379488", "666279264", "666064338", "666633108", "666285003", "666154992", "666551898", "666462570", "666475953", "666536823", "666497745", "666307554", "666266307", "666424923", "666371364", "666540549", "666097479", "666180648", "666724857" ];
        return User.find( existingQuery )
        .then( ( userArray ) => {
            // check for dup email
            for( let i = 0; i < userArray.length; i++ ) {
                // check for dup email if found return true
                if( userArray[i].email == userInfo.email ) {
                    ssnData.dupuser = true;
                    return ssnData;
                }
            }
            // check for testing ssn and allow testing ssn dups to pass
            for( let i = 0; i < testingDupSSN.length; i++ ) {
                if( testingDupSSN[ i ] == userInfo.ssn_number ) {
                    return ssnData;
                }
            }
            // no user with SSN
            if( userArray === undefined || userArray.length == 0 ) {
                return ssnData;
            } else {
                ssnData.dupuser = true;
            }
            const promArray = [];
            userArray.forEach( ( userData ) => {
                promArray.push( PaymentManagement.findOne( { user: userData.id } ) );
            } );
            return Promise.all( promArray )
            .then( ( paymentList ) => {
                paymentList.forEach( ( paymentData ) => {
                    if( paymentData ) {
                        let timespan = paymentData.updatedAt - priorDate;
                        timespan = Math.round( timespan / ( 1000 * 60 * 60 * 24 ) );
                        if( timespan > ssnData.days && timespan <= 30 && paymentData.status == "DENIED" ) {
                            ssnData.days = timespan;
                        }
                    }
                } );
                return ssnData;
            } );
        } )
        .catch( ( err ) => {
            sails.log.error( "ApplicationController.thirtyDayDenialRule User.catch err: ", err );
        } );
    }
}

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

function retrieveUserByPhoneNumber( phoneNumber ) {
	return User.findOne( {
		phoneNumber: phoneNumber
	} );
}

function updateUserStatus( storyInformation ) {
	const deferred = Q.defer();
	User.findOne( {
		id: storyInformation.user
	} )
	.then( function( userDetail ) {
		userDetail.isUserCreatedStory = true;
		userDetail.save();
		deferred.resolve( userDetail );
	} )
	.catch( function( err ) {
		deferred.reject( err );
	} );
	return deferred.promise;
}

function registerOrLoadUser( userDetails ) {
	return Q.promise( function( resolve, reject ) {
		/* var criteria = {
          deviceId: userDetails.deviceId,
          isDeleted: false
        };*/

		// New registration method using email and deviceid
		const criteria = {
			email: userDetails.email,
			// deviceId: userDetails.deviceId,
			isDeleted: false
		};

		User.findOne( criteria )
		.then( function( user ) {
			if( user ) {
				console.log( "user exist" );
				// return resolve(user);
				return resolve( {
					code: 400
				} );
			}
			salt = generateSalt();
			// New registration method using email and deviceid
			console.log( "userDetails: ", userDetails );

			return generateEncryptedPassword( userDetails, salt )
			.then( function( encryptedPassword ) {
				// userDetails.password = encryptedPassword;
				//  userDetails.salt = salt;

				// userDetails.userReference ='USR_'+Utils.generateReferenceId();
				// userDetails.userReference ='USR_'+getNextSequenceValue('user');
				// var userRefernceData = getNextSequenceValue('user');
				// sails.log.info("userRefernceData",userRefernceData);
				// userDetails.userReference ='USR_'+userRefernceData;

				return getNextSequenceValue( "user" )
				.then( function( userRefernceData ) {
					sails.log.info( "userRefernceData", userRefernceData );
					userDetails.userReference = "USR_" + userRefernceData.sequence_value;

					if( userDetails.devicetoken == "" ) {
						userDetails.notify = 0;
					}
					userDetails.loggedin = 1;
					return User.create( userDetails )
					.then( function( user ) {
						// return resolve(user);

						const emailId = userDetails.email;
						const nameDetails = emailId.split( "@" );
						console.log( "nameDetails:", nameDetails );
						const registername = nameDetails[ 0 ];
						console.log( "name:", registername );

						User.sendVerificationMail( userDetails.email, registername, user )
						.then( function( user ) {
							// return res.success(response);
							// return resolve(user);
							return resolve( {
								code: 200,
								userdata: user
							} );
						} )
						.catch( function( err ) {
							sails.log.error( "User#registerDevice2::", err );
							return reject( err );
						} );
					} )
					.catch( function( err ) {
						sails.log.error( "User#registerDevice1::", err );
						return reject( err );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "User#registerDevice1::", err );
					return reject( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "User#registerDevice::", err );
				return reject( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "User#registerDevice4::", err );
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

function updatePhoneNumber( user, data, updatetype ) {
	return Q.promise( function( resolve, reject ) {
		// before update find the user by phone number
		// TODO: always include `isDeleted` or `isActive` if valid
		const criteria = {
			phoneNumber: data.phoneNumber
		};
		user.isPhoneNumberVerified = true;
		const olddata = user.phoneNumber;

		User.findOne( criteria )
		.then( function( existingUser ) {
			if( !existingUser ) {
				user.phoneNumber = data.phoneNumber;
				user.save( function( err ) {
					if( err ) {
						sails.log.error( "User#updatePhoneNumber :: Error :: ", err );
						return reject( {
							code: 500,
							message: "INTERNAL_SERVER_ERROR"
						} );
					}

					// Logactivity
					if( updatetype == "edit" ) {
						const userreq = {};
						const usersubject = "Phone number changed from app";
						const userdescription = "Phone number updated successfully!";
						userreq.userid = user.id;
						userreq.phoneNumber = data.phoneNumber;
						userreq.olddata = olddata;
						userreq.logdata = "Phone number changed from " + olddata + " to " + data.phoneNumber + "through app";
						Useractivity.createUserActivity( userreq, usersubject, userdescription );
					}

					return resolve( user );
				} );
			} else {
				// merge the two mobile device data
				// call in the merge service
				// merge the user to the existing user
				MergeUserService.mergeNewUserWithExistingUser( existingUser, user )
				.then( function( user ) {
					return resolve( user );
				} )
				.catch( function( err ) {
					sails.log.error( "User#updatephoneNumber :: Merge failed for users" );
					return reject( {
						code: 500,
						message: "INTERNAL_SERVER_ERROR"
					} );
				} );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "User#updatephoneNumber :: Error updating users :: err", err );
			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		} );
	} );
}

function getUserForId( userId ) {
	return Q.promise( function( resolve, reject ) {
		const criteria = {
			id: userId
		};

		User.findOne( criteria )
		.then( function( user ) {
			if( !user ) {
				return reject( {
					code: 404,
					message: "USER_NOT_FOUND"
				} );
			}
			// execute
			return resolve( user );
		} )
		// error block
		.catch( function( err ) {
			sails.log.error( "User#getUserForId :: Error :: ", err );

			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		} );
	} );
}

function updateAccessToken( user, access_token ) {
	return Q.promise( function( resolve, reject ) {
		user.accessToken = access_token;
		user.save( function( err ) {
			if( err ) {
				sails.log.error( "User#updateAccessToken :: Error :: ", err );

				return reject( {
					code: 500,
					message: "INTERNAL_SERVER_ERROR"
				} );
			}

			return resolve( user );
		} );
	} );
}

function updateUserDetail( user, token ) {
	return Q.promise( function( resolve, reject ) {
		InstitutionService.getUserDetail( token, user.id )
		.then( function( userDetail ) {
			const arr = [];
			_.forEach( userDetail.info.emails, function( user ) {
				arr.push( user[ "data" ] );
			} );
			user.names = userDetail.info.names;
			user.emails = arr[ 0 ];
			const add = [];
			_.forEach( userDetail.info.addresses, function( address ) {
				add.push( address[ "data" ] );
			} );
			user.addresses = add;
			user.street = add[ 0 ][ "street" ];
			user.city = add[ 0 ][ "city" ];
			user.state = add[ 0 ][ "state" ];
			user.zipCode = add[ 0 ][ "zip" ];
			const ph = [];
			_.forEach( userDetail.info.phone_numbers, function( phoneNumber ) {
				ph.push( phoneNumber[ "data" ] );
			} );
			user.phoneNumber = ph[ 0 ];
			user.save( function( err ) {
				if( err ) {
					sails.log.error( "User#updateAccessToken :: Error :: ", err );

					return reject( {
						code: 500,
						message: "INTERNAL_SERVER_ERROR"
					} );
				}
			} );
			return resolve( user );
		} );
	} );
}

// TODO: Change this
function toUserApi() {
	const user = this.toObject();
	return {
		names: user.names,
		emails: user.emails,
		phoneNumber: user.phoneNumber,
		addresses: user.addresses ? user.addresses[ 0 ] : {},
		street: user.street,
		city: user.city,
		state: user.state,
		zipCode: user.zipCode,
		screenName: user.screenName,
		isExistingUser: user.isExistingUser,
		profilePicture: user.profilePicture
	};
}

function informationUpdated( data ) {
	return Q.promise( function( resolve, reject ) {
		const criteria = {
			id: data.id
		};

		User.findOne( criteria )
		.then( function( detail ) {
			user.names = data.names;
			user.emails = data.emails;
			user.city = data.city;
			user.state = data.state;
			user.save( function( err ) {
				if( err ) {
					sails.log.error( "User#informationUpdated :: Error :: ", err );

					return reject( {
						code: 500,
						message: "INTERNAL_SERVER_ERROR"
					} );
				}
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "User#informationUpdated :: err : ", err );
			return reject( err );
		} );
	} );
}

function uploadUserProfilePicture( user, assetEntity ) {
	return Q.promise( function( resolve, reject ) {
		if( !user || !assetEntity ) {
			sails.log.error( "User#uploadUserProfilePicture :: Error :: insufficient data" );

			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		}

		const searchCriteria = {
			id: user.id,
			isDeleted: false
		};
		const updates = {
			profilePicture: assetEntity.id
		};

		User.update( searchCriteria, updates )
		.then( function() {
			return User.findOne( searchCriteria ).populate( "profilePicture" );
		} )
		.then( function( user ) {
			if( !user ) {
				sails.log.error( "User#uploadUserProfilePicture :: User Not Updated / Found" );

				return reject( {
					code: 500,
					message: "INTERNAL_SERVER_ERROR"
				} );
			}

			const data = user.toUserProfileApi();
			data.profilePicture = assetEntity.toApi();

			return resolve( data );
		} )
		.catch( function( err ) {
			sails.log.error( "User#uploadUserProfilePicture :: err : ", err );
			return reject( err );
		} );
	} );
}

function getProfile( id ) {
	return Q.promise( function( resolve, reject ) {
		const criteria = {
			id: id
		};
		User.findOne( criteria )
		// .populate('profilePicture')
		.then( function( user ) {
			if( !user ) {
				return reject( {
					code: 404,
					message: "USER_NOT_FOUND"
				} );
			}

			// -- Added to provide profilepicture
			/* if (user.profilePicture) {
                  user.userImage = user.profilePicture.toApi();
                } else {
                  user.userImage = "";
                }*/

			const userIds = [];
			userIds.push( user.id );
			Story.getProfileImagesForUsers( userIds )
			.then( function( userImagesMap ) {
				user.userImage = userImagesMap[ user.id ] || "";

				// sails.log.info("university.name: ", user.university);
				if( "undefined" === typeof user.university || user.university == "" || user.university == null ) {
					return resolve( user );
				} else {
					University.findOne( {
						id: user.university
					} ).then( function( university ) {
						if( university ) {
							// sails.log.info("university.name: ", university.name);
							user.universityname = university.name;
						}

						sails.log.info( "User#getProfile :: ", user );
						return resolve( user );
					} );
				}
				// return resolve(user);
			} )
			.catch( function( err ) {
				sails.log.error( "User#getProfilePicture :: err : ", err );
				return reject( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "User#getProfile :: err : ", err );
			return reject( err );
		} );
	} );
}

function getAllUsersForUniversity( universityId ) {
	return Q.promise( function( resolve, reject ) {
		const criteria = {
			university: universityId
		};
		University.find( criteria )
		.populate( "profilePicture" )
		.then( function( users ) {} )
		.catch( function( err ) {
			sails.log.error( "User#getAllUsersForUniversity :: err : ", err );
			return reject( err );
		} );
	} );
}

function createScreenName( userId, screenName ) {
	return Q.promise( function( resolve, reject ) {
		const criteria = {
			id: userId,
			isDeleted: false
		};

		User.findOne( criteria )
		.then( function( user ) {
			if( !user ) {
				return reject( {
					code: 404,
					message: "USER_NOT_FOUND"
				} );
			}

			User.update( criteria, {
				screenName: screenName,
				isScreenNameSet: true,
				isExistingUser: true
			} )
			.then( function( user ) {
				return resolve( user[ 0 ] );
			} )
			.catch( function( err ) {
				sails.log.error( "Error while updating" );
				return reject( {
					code: 500,
					message: "INTERNAL_SERVER_ERROR"
				} );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "User#createScreenName :: err ::", err );
			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		} );
	} );
}

function getUserByScreenName( screenName ) {
	return Q.promise( function( resolve, reject ) {
		const criteria = {
			screenName: screenName
		};
		User.findOne( criteria )
		.then( function( screenName ) {
			if( !screenName ) {
				return resolve( null );
			} else {
				return resolve( screenName );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "User#getUserByScreenName :: ::", err );
			return reject( err );
		} );
	} );
}

function getUserByEmailId( email ) {
	return Q.promise( function( resolve, reject ) {
		User.findOne( {
			email: email
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

function getUserByScreenName( screenName ) {
	return Q.promise( function( resolve, reject ) {
		const criteria = {
			screenName: screenName
		};
		User.findOne( criteria )
		.then( function( screenName ) {
			if( !screenName ) {
				return resolve( null );
			} else {
				return resolve( screenName );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "User#getUserByScreenName :: ::", err );
			return reject( err );
		} );
	} );
}

function updateNotificationStatus( userId, status ) {
	return Q.promise( function( resolve, reject ) {
		const criteria = {
			id: userId
		};

		User.findOne( criteria )
		.then( function( user ) {
			user.smsNotificationStatus = status;
			user.save();
			return resolve( user.smsNotificationStatus );
		} )
		.catch( function( err ) {
			sails.log.error( "User#updateNotificationStatus :: ::", err );
			return reject( err );
		} );
	} );
}

function updatepushNotificationStatus( userId, status ) {
	return Q.promise( function( resolve, reject ) {
		const criteria = {
			id: userId
		};

		User.findOne( criteria )
		.then( function( user ) {
			user.notify = status;
			user.save();
			return resolve( user.notify );
		} )
		.catch( function( err ) {
			sails.log.error( "User#updatepushNotificationStatus :: ::", err );
			return reject( err );
		} );
	} );
}

function getPopulatedUsers( userIds ) {
	return Q.promise( function( resolve, reject ) {
		User.find( {
			id: userIds
		} )
		.populate( "profilePicture" )
		.then( function( populatedUser ) {
			return resolve( populatedUser );
		} )
		.catch( function( err ) {
			sails.log.error( "User#getAllUsersForUniversity :: err : ", err );
			return reject( err );
		} );
	} );
}

function updateProfileOfUser( user, data ) {
	return Q.promise( function( resolve, reject ) {
		user.name = data.name;
		user.dateOfBirth = data.dob;
		user.addresses = data.address;
		user.street = data.street;
		user.city = data.city;
		user.zipCode = data.zipCode;
		user.email = data.email;
		// -- bug fixed on june 16 on updating the user profile after checking plaid account
		// user.systemUniqueKey = Utils.generateReferenceId();
		user.state = data.state !== "other" ? data.state : null;
		user.university = data.university !== "other" ? data.university : null;
		// check if email is valid
		user.isValidEmail = PlaidUser.checkIfEmailValid( data.email );
		// -- bug fixed on june 15 on updating the user profile after checking plaid account
		if( data.email != user.email ) {
			user.isEmailVerified = false;
		}
		user.isUserProfileUpdated = true;
		// check state is valid
		State.findOne( {
			id: data.state,
			isActive: true
		} )
		.then( function( state ) {
			if( state ) {
				user.isValidState = true;
			}
			// save user
			user.save( function( err ) {
				if( err ) {
					sails.log.error( "User#updateProfileOfUser :: error in saving user", err );

					return reject( {
						code: 500,
						message: "INTERNAL_SERVER_ERROR"
					} );
				}
				//  //check if email is valid; send a verification email
				// if (user.isValidEmail) {
				//   // send verification email
				//   User.sendVerificationMail(user);
				// }

				return resolve( user );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "User#updateProfileOfUser :: ", err );

			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		} );
	} );
}

function sendVerificationMail( emailId, name, user ) {
	return Q.promise( function( resolve, reject ) {
		// Added to check email validation during sending verification mail
		sails.log.info( "emailId: ", emailId );
		sails.log.info( "previous email: ", user.email );
		if( emailId != user.email ) {
			const usercriteria = {
				email: emailId,
				isDeleted: false
			};

			User.findOne( usercriteria )
			.then( function( userdata ) {
				if( userdata ) {
					return reject( {
						code: 400,
						message: "REGISTER_EMAIL_ALREADY"
					} );
				} else {
					const userObject = {
						email: emailId,
						name: name,
						systemUniqueKey: Utils.generateReferenceId()
					};
					EmailService.sendVerificationEmail( userObject );
					User.findOne( {
						id: user.id
					} ).then( function( userDetail ) {
						userDetail.email = userObject.email;
						userDetail.systemUniqueKey = userObject.systemUniqueKey;
						userDetail.isEmailVerified = false;
						userDetail.save();
						return resolve( userDetail );
					} );
				}
			} )
			.catch( function( err ) {
				sails.log.error( "User#sendVerificationMail:: err : ", err );
				return reject( {
					code: 500,
					message: "INTERNAL_SERVER_ERROR"
				} );
			} );
		} else {
			const userObject = {
				email: emailId,
				name: name,
				systemUniqueKey: Utils.generateReferenceId()
			};
			EmailService.sendVerificationEmail( userObject );
			User.findOne( {
				id: user.id
			} ).then( function( userDetail ) {
				userDetail.email = userObject.email;
				userDetail.systemUniqueKey = userObject.systemUniqueKey;
				userDetail.save();
				return resolve( userDetail );
			} );
		}
	} );
}

function activateUserWithKey( email, systemUniqueKey ) {
	return Q.promise( function( resolve, reject ) {
		// check for email and key
		if( !email || !systemUniqueKey ) {
			sails.log.error( "User#activateUserWithKey :: User activation failed, invalid parameters" );
			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		}
		// load user with key and email

		const criteria = {
			email: email,
			systemUniqueKey: systemUniqueKey,
			// isDeleted: false,
			isEmailVerified: true
		};
		User.findOne( criteria )
		.then( function( user ) {
			if( !user ) {
				// user not found for the given criteria
				sails.log.verbose( "User#activateUserWithKey :: User not found for the given criteria :: ", criteria );
				return reject( {
					code: 500,
					message: "INTERNAL_SERVER_ERROR"
				} );
			}
			// check if email token is expired
			// if(Utils.isTimeExpired) {
			//   // user not found for the given criteria
			//   sails.log.verbose('User#activateUserWithKey :: Token expired for the criteria:: ', criteria);
			//   return reject({
			//     code: 500,
			//     message: 'INTERNAL_SERVER_ERROR'
			//   });
			// }
			// activate the user and show a success message
			user.isEmailVerified = true;
			user.systemUniqueKey = null;
			user.save()
			.then( resolve )
			.catch( function( err ) {
				sails.log.error( "User#activateUserWithKey :: user activation failed :: ", err );
				return reject( {
					code: 500,
					message: "INTERNAL_SERVER_ERROR"
				} );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "User#activateUserWithKey :: Error :: ", err );
			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		} );
	} );
}

function updateisPhoneVerified( user, data ) {
	const deferred = Q.defer();
	// UserRegistrationService
	//   .verificationUser(user, data)
	//   .then(function() {
	console.log( user );
	user.isPhoneVerified = true;
	const token = AuthenticationService.authenticateDevice( user );
	user.token = token;
	user.save( function( err ) {
		if( err ) {
			sails.log.error( "User#updateisPhoneVerified :: Error :: ", err );

			return deferred.reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		}
		deferred.resolve( user );
	} );
	// })
	// .catch(function(err) {
	//   sails.log.error('User#updateisPhoneVerified::', err)
	//   deferred.reject(err);
	// })
	return deferred.promise;
}

// TODO: After verify user screen it can be changed
function getUserSettingDetail( user ) {
	const deferred = Q.defer();
	const criteria = {
		id: user.id
	};
	User.findOne( criteria )
	.populate( "profilePicture" )
	.then( function( user ) {
		let profileImage;

		if( user.profilePicture ) {
			profileImage = user.profilePicture.toApi();
		} else {
			profileImage = "";
		}

		const obj = {
			screenName: user.screenName,
			profileImage: profileImage,
			name: user.name,
			phoneNumber: user.phoneNumber,
			email: user.email,
			isSmsNotified: false,
			isEmailVerified: user.isEmailVerified,
			notify: user.notify
		};

		console.log( "user object: ", obj );
		deferred.resolve( obj );
	} )
	.catch( function( err ) {
		sails.log.error( "User#getUserSettingDetail:: error", err );
		deferred.reject( err );
	} );

	return deferred.promise;
}

function updateVerifyEmailForKey( email, systemUniqueKey ) {
	return Q.promise( function( resolve, reject ) {
		if( !email || !systemUniqueKey ) {
			sails.log.info( "User#updateVerifyEmailForKey :: email or systemUniqueKey is null" );
			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		}

		const criteria = {
			systemUniqueKey: systemUniqueKey,
			email: email
		};

		User.findOne( criteria )
		.then( function( user ) {
			if( !user ) {
				return resolve( false );
			} else {
				// update user with verified status
				user.isEmailVerified = true;
				user.systemUniqueKey = null;
				user.save( function( err ) {
					if( err ) {
						sails.log.error( "User#updateVerifyEmailForKey :: ", err );
					}
					const userid = user.id;
					Screentracking.checktodolistcount( userid )
					.then( function( achstatus ) {
						return resolve( true );
					} )
					.catch( function( err ) {
						sails.log.error( "User#updateVerifyEmailForKey :: ", err );
						return reject( {
							code: 500,
							message: "INTERNAL_SERVER_ERROR"
						} );
					} );
				} );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "User#updateVerifyEmailForKey :: ", err );
			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		} );
	} );
}

function getLoanConfirmedMessage( email ) {
	return Q.promise( function( resolve, reject ) {
		if( !email ) {
			sails.log.info( "User#getLoanConfirmedMessage :: email is null" );

			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		} else {
			return resolve( true );
		}
	} );
}

function getLoanStatus( user ) {
	const deferred = Q.defer();
	const criteria = {
		where: {
			user: user.id,
			isPaymentActive: true
		},
		sort: "updatedAt DESC"
	};
	User.findOne( {
		id: user.id
	} )
	.then( function( userDetail ) {
		PaymentManagement.findOne( criteria )
		.then( function( paymentDetail ) {
			if( !paymentDetail ) {
				return deferred.reject( {
					code: 404,
					message: "PAYMENT_ACTIVITY_NOTFOUND"
				} );
			}
			var amountDue = 0;
			let fullPayoffAmount = 0;
			let interestRate = 0;
			if( paymentDetail.interestapplied ) {
				interestRate = paymentDetail.interestapplied;
			}

			if( paymentDetail.status == "OPENED" || paymentDetail.status == "CURRENT" ) {
				var amountDue = 0;
				_.forEach( paymentDetail.paymentSchedule, function( schedule ) {
					if( schedule.status == "OPENED" ) {
						amountDue = amountDue + schedule.amount;

						if( fullPayoffAmount == 0 && schedule.amount > 0 && interestRate > 0 ) {
							fullPayoffAmount = schedule.startBalanceAmount;
						}
						if( interestRate == 0 ) {
							fullPayoffAmount = fullPayoffAmount + schedule.amount;
						}
					}
				} );
			}
			Story.findOne( {
				id: paymentDetail.story
			} ).then( function( storyDetail ) {
				const lastRequest = storyDetail.approvedAmount;

				const nextpaymentAmount = paymentDetail.paymentSchedule[ 0 ].amount;
				const nextpaymentDate = moment( paymentDetail.paymentSchedule[ 0 ].date ).format( "ll" );

				let paymentStatus = "";
				const LoanDetailStatus = Story.getStatusForClient( storyDetail.status );
				sails.log.info( "LoanDetailStatus:info", LoanDetailStatus );

				if( LoanDetailStatus == "transfer-initiated" ) {
					if( paymentDetail.status == "OPENED" ) {
						paymentStatus = "CURRENT";
					} else {
						paymentStatus = paymentDetail.status;
					}
				} else {
					paymentStatus = "PENDING";
				}

				fullPayoffAmount = parseFloat( fullPayoffAmount.toFixed( 2 ) );

				const userObject = {
					amountDue: amountDue,
					// paymentStatus: paymentDetail.status,
					paymentStatus: paymentStatus,
					screenName: userDetail.screenName,
					loanStatus: Story.getStatusForClient( storyDetail.status ),
					lastRequest: lastRequest,
					loanBalance: fullPayoffAmount,
					nextpaymentAmount: nextpaymentAmount,
					nextpaymentDate: nextpaymentDate
				};

				sails.log.info( "##findOne paymentActivity:info", userObject );

				deferred.resolve( userObject );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "##findOne paymentActivity:Error", err );
			deferred.reject( {
				code: 400,
				message: "PAYMENT_ACTIVITY_NOTFOUND"
			} );
		} );
	} )
	.catch( function( err ) {
		sails.log.error( "##findOne paymentActivity:Error", err );
		deferred.reject( err );
	} );

	return deferred.promise;
}

function getEmailVerified( user ) {
	const deferred = Q.defer();
	User.findOne( {
		id: user.id
	} )
	.then( function( userDetail ) {
		deferred.resolve( userDetail.isEmailVerified );
	} )
	.catch( function( err ) {
		sails.log.error( "#getEmailVerified::error", err );
		deferred.reject( err );
	} );
	return deferred.promise;
}

function deleteAllUserRelatedStuff( phone ) {
	return Q.promise( function( resolve, reject ) {
		sails.log.error( "phone :: ", phone );
		User.findOne( {
			phoneNumber: phone
		} )
		.then( function( user ) {
			sails.log.error( "user :: ", user );
			if( !user ) {
				return reject( {
					code: 404,
					message: "USER_NOT_FOUND"
				} );
			}

			sails.log.info( "User :: ", user );
			const promises = [];
			// delete Account
			promises.push(
				Account.destroy( {
					user: user.id
				} )
			);
			// delete all assets related to user
			promises.push(
				Asset.destroy( {
					user: user.id
				} )
			);
			// Delete Auto Pay
			promises.push(
				AutoPay.destroy( {
					user: user.id
				} )
			);
			// Delete Fluid Card
			promises.push(
				FluidCard.destroy( {
					user: user.id
				} )
			);
			// Delete Marqeta User
			promises.push(
				MarqetaUser.destroy( {
					user: user.id
				} )
			);
			// Delete Messages
			promises.push(
				Messages.destroy( {
					user: user.id
				} )
			);
			// Delete Payment Management
			promises.push(
				PaymentManagement.destroy( {
					user: user.id
				} )
			);
			// Delete Plaid User
			promises.push(
				PlaidUser.destroy( {
					user: user.id
				} )
			);
			// Delete Queued Story
			promises.push(
				QueuedStory.destroy( {
					user: user.id
				} )
			);
			// Delete Story
			promises.push(
				Story.destroy( {
					user: user.id
				} )
			);
			// Delete Story Queue
			promises.push(
				StoryQueue.destroy( {
					user: user.id
				} )
			);
			// Delete all Transactions
			promises.push(
				Transaction.destroy( {
					user: user.id
				} )
			);
			// Delete all Transactions
			promises.push(
				Transactions.destroy( {
					user: user.id
				} )
			);
			// Delete User Bank Account
			promises.push(
				UserBankAccount.destroy( {
					user: user.id
				} )
			);
			// Delete User Consent
			promises.push(
				UserConsent.destroy( {
					user: user.id
				} )
			);

			return [ user, Q.all( promises ) ];
		} )
		.spread( function( user, result ) {
			// NOW delete user
			User.destroy( {
				id: user.id
			} ).then( function() {
				return resolve();
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "Error :: ", err );

			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			} );
		} );
	} );
}

function deleteAllUserRelatedDetails( userid ) {
	return Q.promise( function( resolve, reject ) {
		sails.log.error( "userid :: ", userid );

		const usercriteria = {
			id: userid
		};

		User.findOne( usercriteria )
		.then( function( user ) {
			sails.log.error( "user :: ", user );
			if( !user ) {
				return reject( {
					code: 404,
					message: "USER_NOT_FOUND"
				} );
			}

			sails.log.info( "User :: ", user );
			const promises = [];
			// delete Account
			promises.push(
				Account.destroy( {
					user: user.id
				} )
			);
			// delete all assets related to user
			promises.push(
				Asset.destroy( {
					user: user.id
				} )
			);

			// Delete Messages
			promises.push(
				Messages.destroy( {
					user: user.id
				} )
			);
			// Delete Payment Management
			promises.push(
				PaymentManagement.destroy( {
					user: user.id
				} )
			);
			// Delete Plaid User
			promises.push(
				PlaidUser.destroy( {
					user: user.id
				} )
			);

			// Delete Story
			promises.push(
				Story.destroy( {
					user: user.id
				} )
			);

			// Delete all Transactions
			promises.push(
				Transaction.destroy( {
					user: user.id
				} )
			);

			// Delete User Bank Account
			promises.push(
				UserBankAccount.destroy( {
					user: user.id
				} )
			);
			// Delete User Consent
			promises.push(
				UserConsent.destroy( {
					user: user.id
				} )
			);

			// Delete achcomments
			promises.push(
				Achcomments.destroy( {
					user: user.id
				} )
			);
			// Delete achdocuments
			promises.push(
				Achdocuments.destroy( {
					user: user.id
				} )
			);
			// Delete messages
			promises.push(
				Messages.destroy( {
					user: user.id
				} )
			);
			// Delete screentracking
			promises.push(
				Screentracking.destroy( {
					user: user.id
				} )
			);

			// delete ach history
			promises.push(
				Achhistory.destroy( {
					user: user.id
				} )
			);

			// delete ach Transunion
			promises.push(
				Transunions.destroy( {
					user: user.id
				} )
			);

			// delete ach Transunionhistory
			promises.push(
				Transunionhistory.destroy( {
					user: user.id
				} )
			);

			return [ user, Q.all( promises ) ];
		} )
		.spread( function( user, result ) {
			// NOW delete user
			User.destroy( {
				id: user.id
			} ).then( function() {
				return resolve();
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "Error :: ", err );

			return reject( {
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
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

function checkPaymentmanagementStatus( userID, req ) {
	return Q.promise( function( resolve, reject ) {
		const deferred = Q.defer();

		// -- Blocked above code on oct 12, 2018 for phone delete option in admin
		/* var criteria = {
          user: userID,
          achstatus: { $ne: 2, $exists: true }
        };

        PaymentManagement
          .findOne(criteria)
          .then(function(paymentmanagementdata) {

             if(!paymentmanagementdata)
             {*/

		User.findOne( {
			id: userID
		} ).then( function( phonedetails ) {
			const olddata = phonedetails.phoneNumber;
			phonedetails.phoneNumber = "";
			phonedetails.isPhoneVerified = false;

			if( !phonedetails.oldphonedata ) {
				phonedetails.oldphonedata = [];
			}
			phonedetails.oldphonedata.push( olddata );

			phonedetails.save( function( err ) {
				if( err ) {
					return reject( err );
				} else {
					const useralldetails = phonedetails;
					const modulename = "User phone number deleted";
					const modulemessage = "User phone number deleted successfully";
					req.logdata = useralldetails;
					Logactivity.registerLogActivity( req, modulename, modulemessage );

					const userreq = {};
					const usersubject = "Phone number deleted";
					const userdescription = "User phone number deleted successfully!";
					userreq.userid = userID;
					userreq.olddata = olddata;
					userreq.logdata = "Phone number deleted from " + olddata;
					Useractivity.createUserActivity( userreq, usersubject, userdescription );

					return resolve( phonedetails );
				}
			} );
		} );

		/* }else{
             return reject({code: 400, message: 'Unable to delete phone number!'});
        }
   });*/
	} );
}

function changeemailAddress( userID, req, emailID, type, changeemailoption ) {
	return Q.promise( function( resolve, reject ) {
		const uniid = {
			id: userID
		};

		User.findOne( uniid )
		// .populate('role')
		.then( function( userdata ) {
			const olddata = userdata.email;
			const checkcriteria = {
				email: emailID,
				isDeleted: false
			};
				// var oldemaillist = userdata.oldemaildata;

			User.findOne( checkcriteria )
			.then( function( userdetails ) {
				if( userdetails && emailID != userdata.email ) {
					return reject( {
						code: 400,
						message: "Email Already exist"
					} );
				} else if( emailID == userdata.email ) {
					return reject( {
						code: 400,
						message: "Trying to update same email address"
					} );
				} else {
					if( userdata.name && userdata.name !== "" ) {
						var registername = userdata.name;
					} else {
						const nameDetails = emailID.split( "@" );
						var registername = nameDetails[ 0 ];
					}

					const userObjectData = {
						email: emailID,
						name: registername,
						firstname: userdata.firstname,
						lastname: userdata.lastname,
						systemUniqueKey: Utils.generateReferenceId(),
						id: userdata.id,
						rolename: userdata.role.rolename
					};
					if( !userdata.oldemaildata ) {
						userdata.oldemaildata = [];
					}
					// userdata.oldemaildata = []
					// userdata.oldemaildata.push(oldemaillist);
					userdata.email = emailID;
					userdata.isEmailVerified = false;
					userdata.isValidEmail = PlaidUser.checkIfEmailValid( emailID );
					userdata.systemUniqueKey = userObjectData.systemUniqueKey;
					userdata.oldemaildata.push( olddata );

					userdata.save( function( err ) {
						if( err ) {
							return reject( err );
						} else {
							// EmailService.sendVerificationEmail(userObjectData);
							if( changeemailoption == "resentinvite" ) {
								const userInviteData = {
									user_id: userID,
									email: emailID,
									name: userdata.firstname + " " + userdata.lastname,
									newtemppassword: "",
									rolename: ""
								};
								EmailService.sendUserResentInviteEmail( userInviteData );
							} else {
								EmailService.profileEmailSend( userObjectData );
							}
							sails.log.error( "Email update type : ", type );

							if( type == "backend" ) {
								const modulename = "Update user email address";
								const modulemessage = "Update user email address successfully";
								req.logdata = req.form;
								Logactivity.registerLogActivity( req, modulename, modulemessage );
								const messageObjData = {
									user: userID,
									message: "Your login email address for fluid updated sucessfully. \n\nThanks\nTeam TFC",
									subject: "Login email address updated"
								};

								// Push notification for front end indication
								// PusherService.pusherUserMessage(messageObjData);
							}

							const userreq = {};
							if( type == "backend" ) {
								var usersubject = "Email address changed from admin";
								var userdescription = "Email address updated successfully!";
								userreq.userid = userID;
								userreq.emailID = emailID;
								userreq.olddata = olddata;
								userreq.logdata = "Email address changed from " + olddata + " to " + emailID + " through admin";
							} else {
								var usersubject = "Email address changed from app";
								var userdescription = "Email address updated successfully!";
								userreq.userid = userID;
								userreq.emailID = emailID;
								userreq.olddata = olddata;
								userreq.logdata = "Email address changed from " + olddata + " to " + emailID + " through app";
							}
							Useractivity.createUserActivity( userreq, usersubject, userdescription );
							return resolve( userdata );
						}
					} );
				}
			} )
			.catch( function( err ) {
				sails.log.error( "User #changeemailAddress::Error1", err );
				return reject( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "User #changeemailAddress::Error2", err );
			return reject( err );
		} );
	} );
}

function changePhoneNumber( userID, req, phonenumber, isPhoneVerified = false ) {
	return Q.promise( function( resolve, reject ) {
		const uniid = {
			id: userID
		};

		User.findOne( uniid )
		.then( function( userdata ) {
			const olddata = userdata.phoneNumber;
			const checkcriteria = {
				phoneNumber: phonenumber,
				isDeleted: false
			};
			User.findOne( checkcriteria )
			.then( function( userdetails ) {
				if( userdetails && phonenumber != userdata.phoneNumber ) {
					return reject( {
						code: 400,
						message: "Phone number Already exist"
					} );
				} else if( phonenumber == userdata.phoneNumber ) {
					return reject( {
						code: 400,
						message: "Trying to update same phone number"
					} );
				} else {
					if( userdata.firstname && userdata.firstname !== "" ) {
						var registername = userdata.firstname + " " + userdata.lastname;
					} else {
						const useremail = userdata.email;
						const nameDetails = useremail.split( "@" );
						var registername = nameDetails[ 0 ];
					}

					// -- Enable after authy api is provided
					/* var smsdata={phoneNumber: phonenumber}
                            UserRegistrationService
                            .initTwoFactorAuth(userdata, smsdata)
                            .then(function () {*/

					userdata.phoneNumber = phonenumber;
					userdata.isPhoneVerified = isPhoneVerified;
					userdata.phoneverificationcode = 1;
					userdata.save( function( err ) {
						if( err ) {
							return reject( err );
						} else {
							const modulename = "Update user phone number";
							const modulemessage = "Update user phone number successfully";
							req.logdata = req.form;
							req.user.rolename = userdata.role;
							Logactivity.registerLogActivity( req, modulename, modulemessage );

							const userreq = {};
							const usersubject = "Phone number changed from admin";
							const userdescription = "Phone number updated successfully!";
							userreq.userid = userID;
							userreq.phoneNumber = phonenumber;
							userreq.olddata = olddata;
							userreq.logdata = "Phone number changed from " + olddata + " to " + phonenumber + "through admin";
							Useractivity.createUserActivity( userreq, usersubject, userdescription );

							const messageObjData = {
								user: userID,
								message: "Your phone number for fluid updated sucessfully. \n\nThanks\nTeam Fluid",
								subject: "Phone number updated"
							};

							// Push notification for front end indication
							// PusherService.pusherUserMessage(messageObjData);

							return resolve( userdata );
						}
						/* });*/
					} );
				}
			} )
			.catch( function( err ) {
				sails.log.error( "User #changePhoneNumber::Error1", err );
				return reject( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "User #changePhoneNumber::Error2", err );
			return reject( err );
		} );
	} );
}

function socialregisterOrLoadUser( userDetails ) {
	return Q.promise( function( resolve, reject ) {
		const usercriteria = {
			socialnetworkid: userDetails.socialnetworkid,
			socialnetworktype: userDetails.socialnetworktype,
			isDeleted: false
		};

		sails.log.info( "User #socialregisterOrLoadUser:: usercriteria:: ", usercriteria );

		User.findOne( usercriteria )
		.then( function( userdata ) {
			if( userdata ) {
				if( userdata.allowsocialnetwork == 1 ) {
					sails.log.error( "User #socialregisterOrLoadUser:: Social network already exist: ", userdata );
					return resolve( {
						code: 400
					} );
				} else {
					sails.log.error( "User #socialregisterOrLoadUser:: Social network not completed: ", userdata );
					return resolve( {
						code: 401,
						userdata: userdata
					} );
				}
			}

			if( "undefined" !== typeof userDetails.email && userDetails.email != "" && userDetails.email != null ) {
				userDetails.socialregisteredtype = "emailid";

				const emailcriteria = {
					email: userDetails.email,
					isDeleted: false
				};

				User.findOne( emailcriteria )
				.then( function( checkuserdata ) {
					if( checkuserdata ) {
						return resolve( {
							code: 400
						} );
					}

					User.registerSocialUser( userDetails )
					.then( function( user ) {
						return resolve( {
							code: 200,
							userdata: user
						} );
					} )
					.catch( function( err ) {
						sails.log.error( "User#socialregisterOrLoadUser :: err :", err );
						return res.handleError( err );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "User #socialregisterOrLoadUser:: Email Error: ", err );
					return reject( err );
				} );
			} else {
				userDetails.socialregisteredtype = "phonenumber";

				User.registerSocialUser( userDetails )
				.then( function( user ) {
					return resolve( {
						code: 200,
						userdata: user
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "User#socialregisterOrLoadUser :: err :", err );
					return res.handleError( err );
				} );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "User #socialregisterOrLoadUser:: Social check Error: ", err );
			return reject( err );
		} );
	} );
}

function registerSocialUser( userDetails ) {
	return Q.promise( function( resolve, reject ) {
		return getNextSequenceValue( "user" )
		.then( function( userRefernceData ) {
			sails.log.info( "userRefernceData", userRefernceData );
			userDetails.userReference = "USR_" + userRefernceData.sequence_value;

			if( userDetails.devicetoken == "" ) {
				userDetails.notify = 0;
			}
			userDetails.loggedin = 0;
			userDetails.registeredtype = "social";

			return User.create( userDetails )
			.then( function( userinfo ) {
				return resolve( userinfo );
			} )
			.catch( function( err ) {
				sails.log.error( "User#registerSocialUser::Error::", err );
				return reject( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "User#registerSocialUser::Error::", err );
			return reject( err );
		} );
	} );
}

function updateSocialUser( data ) {
	return Q.promise( function( resolve, reject ) {
		const usercriteria = {
			socialnetworkid: data.socialnetworkid,
			allowsocialnetwork: 0
		};

		sails.log.error( "User#updateSocialUser :: usercriteria :: ", usercriteria );

		User.findOne( usercriteria )
		.then( function( userinfo ) {
			const emailcriteria = {
				email: data.email,
				isDeleted: false
			};

			sails.log.error( "User#updateSocialUser :: emailcriteria :: ", emailcriteria );

			User.findOne( emailcriteria )
			.then( function( checkuserdata ) {
				if( checkuserdata ) {
					return resolve( {
						code: 400
					} );
				}

				userinfo.email = data.email;
				userinfo.loggedin = 1;
				userinfo.allowsocialnetwork = 1;
				userinfo.university = data.university;

				const randompwdstring = Math.random()
				.toString( 36 )
				.slice( -12 );
				userinfo.password = randompwdstring;
				salt = User.generateSalt();

				return User.generateEncryptedPassword( userinfo, salt )
				.then( function( encryptedPassword ) {
					userinfo.password = encryptedPassword;
					userinfo.salt = salt;

					userinfo.save( function( err ) {
						if( err ) {
							sails.log.error( "User#updateSocialUser :: Error :: ", err );
							return reject( err );
						}

						sails.log.info( "User#updateSocialUser::info::", userinfo );

						const emailId = userinfo.email;
						const nameDetails = emailId.split( "@" );
						const registername = nameDetails[ 0 ];

						User.sendVerificationMail( userinfo.email, registername, userinfo )
						.then( function( user ) {
							if( "undefined" === typeof userinfo.university || userinfo.university == "" || userinfo.university == null ) {
								return resolve( {
									code: 200,
									userdata: userinfo
								} );
							} else {
								University.findOne( {
									id: userinfo.university
								} ).then( function( university ) {
									if( university ) {
										userinfo.universityname = university.name;
										userinfo.userImage = "";
									}
									return resolve( {
										code: 200,
										userdata: userinfo
									} );
								} );
							}
						} )
						.catch( function( err ) {
							sails.log.error( "User#updateSocialUser::", err );
							return reject( err );
						} );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "User #updateSocialUser:: Email Error: ", err );
					return reject( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "User #updateSocialUser:: Email Error: ", err );
				return reject( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "User#updateSocialUser::Error::", err );
			return reject( err );
		} );
	} );
}

function getUserBySocialNetworkID( networkID ) {
	return Q.promise( function( resolve, reject ) {
		User.findOne( {
			socialnetworkid: networkID,
			allowsocialnetwork: 1
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
			sails.log.error( "User#getUserBySocialNetworkID :: err ::", err );
			return reject( err );
		} );
	} );
}

function createUser( messageObj ) {
	return Q.promise( function( resolve, reject ) {
		// console.log("Here is the messageObj",messageObj);
		const messageObject = {
			firstname: messageObj.firstname,
			lastname: messageObj.lastname,
			email: messageObj.email,
			password: messageObj.password
		};
		User.create( messageObject )
		.then( function( userdetails ) {
			return resolve( userdetails );
		} )
		.catch( function( err ) {
			sails.log.error( "User#createUSer :: err", err );
			return reject( err );
		} );
	} );
}

// function thirtyDayDenialRule( enteredEmail ) {
// 	let days = 0;
// 	const priorDate = moment().subtract( 30, "days" );
// 	return User.find( { email: enteredEmail } )
// 	.then( ( userArray ) => {
// 		// no user with email
// 		if( !userArray ) {
// 			return days;
// 		}
// 		const promArray = [];
// 		userArray.forEach( ( userData ) => {
// 			promArray.push( PaymentManagement.findOne( { user: userData.id } ) );
// 		} );
// 		return Promise.all( promArray ).then( ( paymentList ) => {
// 			paymentList.forEach( ( paymentData ) => {
// 				if( paymentData ) {
// 					let timespan = paymentData.updatedAt - priorDate;
// 					timespan = Math.round( timespan / ( 1000 * 60 * 60 * 24 ) );
// 					if( timespan > days && timespan <= 30 && paymentData.status == "DENIED" ) {
// 						days = timespan;
// 					}
// 				}
// 			} );
// 			return days;
// 		} );
// 	} )
// 	.catch( ( err ) => {
// 		sails.log.error( "ApplicationController.verifyNoDupSSN User.catch err: ", err );
// 	} );
// }

function registerNewUser( userDetails, roleId, userId ) {
	return Q.promise( ( resolve, reject ) => {
		userDetails.firstname = userDetails.firstname.trim();
		userDetails.middlename = userDetails.middlename.trim();
		userDetails.lastname = userDetails.lastname.trim();
		sails.log.debug( "User.registerNewUser; userDetails:", userDetails );
		if( userId ) {
			User.findOne( { email: userDetails.email, id: { "!": userId } } ).then( ( user ) => {
				if( user ) {
					return thirtyDayDenialRule( userDetails.email ).then( ( days ) => {
						if( days <= 30 && days > 0 ) {
							return resolve( { code: 401, userdetails: user, days: days } );
						} else {
							return resolve( { code: 400, userdetails: user } );
						}
					} );
				} else {
					const salt = generateSalt();
					return generateEncryptedPassword( userDetails, salt ).then( ( encryptedPassword ) => {
						// userDetails.confirmpassword = encryptedPassword;
						delete userDetails.confirmpassword;
						const cleanPhoneString = ( "" + userDetails.phoneNumber ).replace( /\D/g, "" );
						return User.update( { id: userId }, { middlename: userDetails.middlename, phoneNumber: cleanPhoneString, password: encryptedPassword } ).then( ( updated ) => {
							return resolve( { code: 200, userdetails: updated } );
						} );
					} );
				}
			} );
		} else {
			return User.findOne( { email: userDetails.email } )
			.then( ( user ) => {
				if( user ) {
					return thirtyDayDenialRule( userDetails.email ).then( ( days ) => {
						if( days <= 30 && days > 0 ) {
							return resolve( { code: 401, userdetails: user, days: days } );
						} else {
							// user exists but has not been denied in 30 days
							return resolve( { code: 400, userdetails: user } );
						}
					} );
				}
				const salt = generateSalt();
				return generateEncryptedPassword( userDetails, salt )
				.then( ( encryptedPassword ) => {
					userDetails.password = encryptedPassword;
					userDetails.salt = salt;
					// userDetails.confirmpassword = encryptedPassword;
					delete userDetails.confirmpassword;
					userDetails.phoneNumber = ( "" + userDetails.phoneNumber ).replace( /\D/g, "" );
					if( userDetails.lastname.includes( " " ) ) {
						sails.log.debug( "User.registerNewUser; checking lastname for generation code" );
						const nameParts = userDetails.lastname.split( " " );
						sails.log.debug( "User.registerNewUser; nameParts:", JSON.stringify( nameParts ) );
						if( nameParts.length > 1 ) {
							const suffix = nameParts[ 1 ].trim().toUpperCase();
							sails.log.debug( "User.registerNewUser; suffix:", suffix );
							const genCodes = [ "JR", "SR", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX" ];
							if( genCodes.indexOf( suffix ) >= 0 ) {
								userDetails.lastname = nameParts[ 0 ].trim();
								userDetails.generationCode = suffix.replace( "JR", "Jr" ).replace( "SR", "Sr" );
								sails.log.debug( "User.registerNewUser; generationCode:", userDetails.generationCode );
							}
						}
					}
					return Roles.findOne( { id: roleId } )
					.then( ( roledata ) => {
						userDetails.role = roledata.id;
						return getNextSequenceValue( "user" )
						.then( ( userRefernceData ) => {
							userDetails.userReference = "USR_" + userRefernceData.sequence_value;
							User.create( userDetails )
							.then( ( user ) => {
								const userreq = {};
								const usersubject = "Registration Success";
								const userdescription = "User registration.";
								userreq.userid = user.id;
								userreq.logdata = "User registration successful - " + userDetails.email;
								// sails.log.info( "userreq", userreq );
								Useractivity.createUserActivity( userreq, usersubject, userdescription );
								// EmailService.senduserRegisterEmail( user );
								return resolve( { code: 200, userdetails: user } );
							} )
							.catch( ( err ) => {
								sails.log.error( "User#registerNewUser::", err );
								return reject( err );
							} );
						} )
						.catch( ( err ) => {
							sails.log.error( "User#registerNewUser::", err );
							return reject( err );
						} );
					} )
					.catch( ( err ) => {
						sails.log.error( "User#registerNewUser::", err );
						return reject( err );
					} );
				} )
				.catch( ( err ) => {
					sails.log.error( "User#registerNewUser::", err );
					return reject( err );
				} );
			} )
			.catch( ( err ) => {
				sails.log.error( "User#registerNewUser::", err );
				return reject( err );
			} );
		}
	} );
}

function registerNewUserByCustomerServiceAction( userDetails, roleid ) {
	return Q.promise( function( resolve, reject ) {
		// New registration method using email and deviceid
		const criteria = {
			email: userDetails.email
		};
		console.log( "criteria: ", criteria );
		User.findOne( criteria )
		.then( function( user ) {
			if( user ) {
				console.log( "user exist" );
				return resolve( {
					code: 400,
					existingUser: user
				} );
			}
			salt = generateSalt();

			const randompwdstring = Utils.generateReferenceId();
			userDetails.password = randompwdstring;
			console.log( "wwwuserDetails: ", userDetails );

			return generateEncryptedPassword( userDetails, salt )
			.then( function( encryptedPassword ) {
				sails.log.info( "userDetails ", userDetails );

				userDetails.password = encryptedPassword;
				userDetails.registeredtype = "Customer Service";
				userDetails.salt = salt;
				// delete userDetails[userDetails.confirmpassword];

				const roleCriteria = {
					id: roleid
				};
				Roles.findOne( roleCriteria )
				.then( function( roledata ) {
					userDetails.role = roledata.id;

					return getNextSequenceValue( "user" )
					.then( function( userRefernceData ) {
						userDetails.userReference = "USR_" + userRefernceData.sequence_value;

						sails.log.info( "userDetails ", userDetails );

						User.create( userDetails )
						.then( function( user ) {
							const userObjectData = {
								user_id: user.id,
								email: userDetails.email,
								name: userDetails.firstname + " " + userDetails.lastname,
								firstname: userDetails.firstname,
								lastname: userDetails.lastname,
								newtemppassword: randompwdstring,
								rolename: roledata.rolename,
								practicemanagement: user.practicemanagement
							};

							const userreq = {};
							const usersubject = "User Registration By Customer Service";
							const userdescription = "User Registration By Customer Service  successfully!";
							userreq.userid = user.id;
							userreq.logdata = "User Registration By Customer Service  successfully - " + userDetails.email;
							sails.log.info( "userreq", userreq );

							Useractivity.createUserActivity( userreq, usersubject, userdescription );
							return resolve( {
								code: 200,
								userId: user.id
							} );
						} )
						.catch( function( err ) {
							sails.log.error( "User#registerNewUserByCustomerServiceAction::", err );
							return reject( err );
						} );
					} )
					.catch( function( err ) {
						sails.log.error( "User#registerNewUserByCustomerServiceAction::", err );
						return reject( err );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "User#registerNewUserByCustomerServiceAction::", err );
					return reject( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "User#registerNewUserByCustomerServiceAction::", err );
				return reject( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "User#registerNewUserByCustomerServiceAction::", err );
			return reject( err );
		} );
	} );
}

function forgotpassword( userObj ) {
	return Q.promise( function( resolve, reject ) {
		const userObject = {
			email: userObj.email
		};
		User.findOne( userObject )
		.then( function( user ) {
			if( !user ) {
				return resolve( {
					code: 404
				} );
			}
			if( user ) {
				console.log( "ID : ", user.id );
				const userdetails = {
					email: user.email,
					id: user.id,
					name: user.firstname + " " + user.lastname
				};
				EmailService.sendforgotpasswordEmail( userdetails );
				return resolve( {
					code: 400
				} );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "User#forgotpassword :: err", err );
			return reject( err );
		} );
	} );
}

function getuserByemailAction( user ) {
	return Q.promise( function( resolve, reject ) {
		User.findOne( {
			email: user.email
		} )
		.then( function( user ) {
			if( !user ) {
				return reject( {
					code: 404
				} );
			}
			if( user ) {
				return resolve( user );
			}
			return resolve( user );
		} )
		.catch( function( err ) {
			sails.log.error( "User#getuserbyemailAction :: err ::", err );
			return reject( err );
		} );
	} );
}

function registerNewUsertfchome( userDetails, roleid ) {
	return Q.promise( function( resolve, reject ) {
		const criteria = {
			email: userDetails.email
		};

		User.findOne( criteria )
		.then( function( user ) {
			if( user ) {
				console.log( "user exist" );
				return resolve( {
					code: 400
				} );
			}

			const roleCriteria = {
				id: roleid
			};

			Roles.findOne( roleCriteria )
			.then( function( roledata ) {
				userDetails.role = roledata.id;

				return getNextSequenceValue( "user" )
				.then( function( userRefernceData ) {
					userDetails.userReference = "USR_" + userRefernceData.sequence_value;

					User.create( userDetails )
					.then( function( user ) {
						const userObjectData = {
							email: userDetails.email,
							name: userDetails.firstname + " " + userDetails.lastname,
							rolename: roledata.rolename
						};
						console.log( "ranjani user", user );
						EmailService.senduserRegisterEmail( user );

						return resolve( {
							code: 200,
							userdetails: user
						} );
					} )
					.catch( function( err ) {
						sails.log.error( "User#registerNewUser::", err );
						return reject( err );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "User#registerNewUser::", err );
					return reject( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "User#registerNewUser::", err );
				return reject( err );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "User#registerNewUser::", err );
			return reject( err );
		} );
	} );
}

function callDeclinedEmail( id ) {
	sails.log.info( "Emaidfgldfsgsf-----------------", id );
	return Q.promise( function( resolve, reject ) {
		Screentracking.findOne( {
			id: id
		} )
		.populate( "user" )
		.then( function( screentrackingData ) {
			const paymentmanagementdata = {
				declinereason: screentrackingData.deniedmessage
			};
			const userObjectData = {
				email: screentrackingData.user.email,
				firstname: screentrackingData.user.firstname,
				lastname: screentrackingData.user.lastname,
				creditscore: screentrackingData.creditscore
			};
				// EmailService.sendDenyLoanMail(userObjectData,paymentmanagementdata);
			return resolve( userObjectData );
		} )
		.catch( function( err ) {
			sails.log.error( "Email#getProfile :: err : ", err );
			return reject( err );
		} );
	} );
}

function callFundedEmail( id ) {
	return Q.promise( function( resolve, reject ) {
		PaymentManagement.findOne( {
			id: id
		} )
		.populate( "user" )
		.populate( "practicemanagement" )
		.then( function( paymentDetail ) {
			// console.log("----paymentDetail---",paymentDetail);

			const loanData = {
				loanReference: paymentDetail.loanReference,
				email: paymentDetail.user.email,
				firstname: paymentDetail.user.firstname,
				lastname: paymentDetail.user.lastname,
				comprehensiveData: paymentDetail,
				practiceName: paymentDetail.practicemanagement ? paymentDetail.practicemanagement.PracticeName : ""
			};
			EmailService.sendFundedLoanMail( loanData );
			const userreq = {};
			const usersubject = "Funded Loan";
			const userdescription = "Funded Loan email";
			userreq.userid = paymentDetail.user.id;
			userreq.logdata = "Funded Loan to" + paymentDetail.user.email;
			Useractivity.createUserActivity( userreq, usersubject, userdescription );
			return resolve( loanData );
		} )
		.catch( function( err ) {
			sails.log.error( "Email#getProfile :: err : ", err );
			return reject( err );
		} );
	} );
}

function getuserById( id ) {
	return Q.promise( function( resolve, reject ) {
		User.findOne( {
			id: id
		} )
		.then( function( user ) {
			if( !user ) {
				return reject( {
					code: 404
				} );
			}
			if( user ) {
				return resolve( user );
			}
			console.log( "-------1st user----", user );
			return resolve( user );
		} )
		.catch( function( err ) {
			sails.log.error( "User#getuserbyIdAction :: err ::", err );
			return reject( err );
		} );
	} );
}

function setPasswordlogin( email, reqdata, resdata ) {
	return Q.promise( function( resolve, reject ) {
		User.findOne( {
			email: email
		} )
		.populate( "role" )
		.then( function( userinfo ) {
			sails.log.info( "userinfo: ", userinfo );

			const emailstatus = userinfo.isEmailVerified;

			if( !userinfo ) {
				reqdata.session.errormsg = "";
				reqdata.session.errormsg = "Invalid Username and Password";
				// return res.redirect("/apply");
				return resolve( {
					code: 400,
					userdata: "Invalid Username and Password"
				} );
			}

			sails.log.info( "Check passport: " );
			// userinfo.logintype ='frontend';

			passport.authenticate( "user-local", function( err, userinfo, info ) {
				sails.log.info( "userinfo", userinfo );
				sails.log.info( "Enter passport: ", err );

				if( err || !userinfo ) {
					const json = {
						status: 400,
						message: "INSUFFICIENT_DATA"
					};
					reqdata.session.errormsg = "";
					reqdata.session.errormsg = "Invalid Username and Password";
					// return res.redirect("/apply");
					return resolve( {
						code: 200,
						userdata: "apply"
					} );
				}

				sails.log.info( "userinfo data: ", userinfo );
				sails.log.info( "info data: ", info );

				console.log( "isemail", userinfo.isEmailVerified );

				reqdata.logIn( userinfo, function( err ) {
					if( err ) {
						// res.handleError(err);
						return reject( err );
					}
					reqdata.session.userId = userinfo.id;
					reqdata.session.loginType = "frontend";
					reqdata.session.levels = "1";

					const screenCriteria = {
						user: userinfo.id,
						iscompleted: 0
					};

					sails.log.info( "screenCriteria data: ", screenCriteria );

					Screentracking.findOne( screenCriteria )
					.then( function( screendata ) {
						if( screendata ) {
							// return res.redirect("/dashboard");
							return resolve( {
								code: 200,
								userdata: "/dashboard"
							} );
						} else {
							// return res.redirect("/createapplication");
							return resolve( {
								code: 200,
								userdata: "/createapplication"
							} );
						}
					} )
					.catch( function( err ) {
						sails.log.error( "HomeController#loginAction :: err :", err );
						// return res.handleError(err);
						return reject( err );
					} );
				} );
			} )( reqdata, resdata );
		} )
		.catch( function( err ) {
			// reqdata.session.errormsg='';
			// reqdata.session.errormsg = 'Invalid Username and Password';
			// return res.redirect("/apply");
			return resolve( {
				code: 400,
				userdata: "Invalid Username and Password12111"
			} );
		} );
	} );
}

function registerNewUserApi( userDetails, roleid, userid ) {
	return Q.promise( function( resolve, reject ) {
		if( userid ) {
			var criteria = {
				email: userDetails.email,
				id: {
					"!": userid
				}
			};
			User.findOne( criteria ).then( function( user ) {
				if( user ) {
					return resolve( {
						code: 400
					} );
				} else {
					const salt = generateSalt();
					return generateEncryptedPassword( userDetails, salt ).then( function( encryptedPassword ) {
						const criteria = {
							id: userid
						};
						userDetails.confirmpassword = encryptedPassword;
						User.update( criteria, {
							middlename: userDetails.middlename,
							phoneNumber: userDetails.phoneNumber,
							password: encryptedPassword,
							confirmpassword: userDetails.confirmpassword
						} ).exec( function afterwards( err, updated ) {
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

			User.findOne( criteria )
			.then( function( user ) {
				if( user ) {
					return resolve( {
						code: 400
					} );
				}
				const salt = generateSalt();

				return generateEncryptedPassword( userDetails, salt )
				.then( function( encryptedPassword ) {
					userDetails.password = encryptedPassword;
					userDetails.salt = salt;
					userDetails.confirmpassword = encryptedPassword;

					const roleCriteria = {
						id: roleid
					};
					Roles.findOne( roleCriteria )
					.then( function( roledata ) {
						userDetails.role = roledata.id;
						return getNextSequenceValue( "user" )
						.then( function( userRefernceData ) {
							userDetails.userReference = "USR_" + userRefernceData.sequence_value;
							User.create( userDetails )
							.then( function( user ) {
								const userObjectData = {
									email: userDetails.email,
									name: userDetails.firstname + " " + userDetails.lastname,
									rolename: roledata.rolename
								};
								// console.log("ranjani user",user);
								// EmailService.senduserRegisterEmail(user);
								return resolve( {
									code: 200,
									userdetails: user
								} );
							} )
							.catch( function( err ) {
								sails.log.error( "User#registerNewUser::", err );
								return reject( err );
							} );
						} )
						.catch( function( err ) {
							sails.log.error( "User#registerNewUser::", err );
							return reject( err );
						} );
					} )
					.catch( function( err ) {
						sails.log.error( "User#registerNewUser::", err );
						return reject( err );
					} );
				} )
				.catch( function( err ) {
					sails.log.error( "User#registerNewUser::", err );
					return reject( err );
				} );
			} )
			.catch( function( err ) {
				sails.log.error( "User#registerNewUser::", err );
				return reject( err );
			} );
		}
	} );
}

function registerNewUserApplication( userDetails, userid, userEmailExisting, req, res ) {
	sails.log.info( "userDetails:", userDetails );
	sails.log.info( "userid:", userid );
	sails.log.info( "userEmailExisting:", userEmailExisting );

	return Q.promise( function( resolve, reject ) {
		if( "undefined" !== typeof userid && userid != "" && userid != null ) {
			if( userEmailExisting == userDetails.email ) {
				var criteria = {
					id: userid
				};
				User.findOne( criteria ).then( function( userData ) {
					userData.firstname = userDetails.firstname;
					userData.lastname = userDetails.lastname;
					userData.ssnNumber = userDetails.ssnNumber;
					// -- Added to avoid ssn_number field missing in users table (ssnNumber is dummy)
					userData.ssn_number = userDetails.ssnNumber;
					userData.phoneNumber = userDetails.phoneNumber;
					userData.state = userDetails.state;
					userData.street = userDetails.street;
					userData.city = userDetails.city;
					userData.zipCode = userDetails.zipCode;
					userData.dateofBirth = userDetails.dateofBirth;
					userData.practicemanagement = userDetails.practicemanagement;

					sails.log.info( "userData All:::::::::::::::::::::::::::::::::::::::::::::", userData );

					userData.save( function( err ) {
						if( err ) {
							return resolve( {
								rescode: 400
							} );
						} else {
							return resolve( {
								rescode: 200,
								result: userData
							} );
						}
					} );
				} );
			} else {
				var criteria = {
					email: userDetails.email
				};
				User.findOne( criteria ).then( function( userData ) {
					if( userData ) {
						return resolve( {
							rescode: 400
						} );
					} else {
						const criteria = {
							id: userid
						};
						User.findOne( criteria ).then( function( userData1 ) {
							if( !userData1.oldemaildata ) {
								userData1.oldemaildata = [];
							}
							userData1.firstname = userDetails.firstname;
							userData1.lastname = userDetails.lastname;
							userData1.email = userDetails.email;
							userData1.ssnNumber = userDetails.ssnNumber;
							// -- Added to avoid ssn_number field missing in users table (ssnNumber is dummy)
							userData1.ssn_number = userDetails.ssnNumber;
							userData1.phoneNumber = userDetails.phoneNumber;
							userData1.state = userDetails.state;
							userData1.street = userDetails.street;
							userData1.city = userDetails.city;
							userData1.zipCode = userDetails.zipCode;
							userData1.dateofBirth = userDetails.dateofBirth;
							userData1.practicemanagement = userDetails.practicemanagement;
							userData1.oldemaildata.push( userEmailExisting );
							sails.log.info( "userData1:::::::::::::::::::::::::::::::::::::::::::::", userData1 );
							userData1.save( function( err ) {
								if( err ) {
									return resolve( {
										rescode: 400
									} );
								} else {
									return resolve( {
										rescode: 200,
										result: userData1
									} );
								}
							} );
						} );
					}
				} );
			}
		} else {
			var criteria = {
				email: userDetails.email
			};
			User.findOne( criteria ).then( function( userData ) {
				if( userData ) {
					return resolve( {
						rescode: 400
					} );
				} else {
					const roleCriteria = {
						rolename: "User"
					};
					Roles.findOne( roleCriteria ).then( function( roledata ) {
						User.getNextSequenceValue( "user" )
						.then( function( userRefernceData ) {
							const userData = {
								firstname: userDetails.firstname,
								lastname: userDetails.lastname,
								ssnNumber: userDetails.ssnNumber,
								ssn_number: userDetails.ssnNumber,
								dateofBirth: userDetails.dateofBirth,
								phoneNumber: userDetails.phoneNumber,
								workphone: userDetails.workphone,
								email: userDetails.email,
								street: userDetails.street,
								zipCode: userDetails.zipCode,
								residencytype: userDetails.residencytype,
								city: userDetails.city,
								state: userDetails.state,
								practicemanagement: userDetails.practicemanagement,
								userReference: "USR_" + userRefernceData.sequence_value,
								role: roledata.id,
								consentsChecked: req.session.Electronicsign
							};
							sails.log.info( "userData::", userData );
							User.create( userData )
							.then( function( userInfoDetails ) {
								req.session.applicationuserId = userInfoDetails.id;
								req.session.userEmail = userInfoDetails.email;
								req.session.filloutmanually = 1;
								return resolve( {
									rescode: 200,
									result: userInfoDetails
								} );
							} )
							.catch( function( err ) {
								sails.log.error( "registerNewUserApplication :: ", err );
								return resolve( {
									rescode: 400
								} );
							} );
						} )
						.catch( function( err ) {
							sails.log.error( "registerNewUserApplication :: ", err );
							return resolve( {
								rescode: 400
							} );
						} );
					} );
				}
			} );
		}
		// sails.log.info("data:::::::::::::::::::::::::::::::::::::::::::::", userDetails);

		/* if(userEmailExisting) {
          var criteria = {
            email: userEmailExisting
          };
        } else {
          var criteria = {
            email: userDetails.email
          };
        }
        User
          .findOne(criteria)
          .then(function(userData) {

            sails.log.info("userData",userData);

            if(userData)
            {
              if(userEmailExisting == userDetails.email) {

                 sails.log.info("fasdfsadfasf");
                 userData.firstname = userDetails.firstname;
                 userData.lastname = userDetails.lastname;
                 userData.ssnNumber = userDetails.ssnNumber;
                 userData.phoneNumber = userDetails.phoneNumber;
                 userData.state = userDetails.state;
                 userData.street = userDetails.street;
                 userData.city = userDetails.city;
                 userData.zipCode = userDetails.zipCode;
                 userData.dateofBirth = userDetails.dateofBirth;
                 userData.practicemanagement= userDetails.practicemanagement;

                 userData.save(function (err) {

                  if (err) {
                  sails.log.error("User#updateAccessToken :: Error :: ", err);

                  return reject({
                    code: 500,
                    message: 'INTERNAL_SERVER_ERROR'
                  });
                  }
                  return resolve(userData);
                })


              } else {

                if (!userData.oldemaildata)
                {
                  userData.oldemaildata = [];
                }

                 userData.firstname = userDetails.firstname;
                 userData.lastname = userDetails.lastname;
                 userData.email = userDetails.email;
                 userData.ssnNumber = userDetails.ssnNumber;
                 userData.phoneNumber = userDetails.phoneNumber;
                 userData.state = userDetails.state;
                 userData.street = userDetails.street;
                 userData.city = userDetails.city;
                 userData.zipCode = userDetails.zipCode;
                 userData.dateofBirth = userDetails.dateofBirth;
                 userData.oldemaildata.push(userEmailExisting);
                 userData.practicemanagement= userDetails.practicemanagement;
                 userData.save(function (err) {

                  if (err) {
                  sails.log.error("User#updateAccessToken :: Error :: ", err);

                  return reject({
                    code: 500,
                    message: 'INTERNAL_SERVER_ERROR'
                  });
                  }
                  return resolve(userData);
                })

              }
            }

            else
            {
              var roleCriteria = {
                rolename: "User"
              };

              Roles
              .findOne(roleCriteria)
              .then(function(roledata){

                 userDetails.role = roledata.id;

                  return getNextSequenceValue('user')
                   .then(function(userRefernceData) {

                    userDetails.userReference ='USR_'+userRefernceData.sequence_value;

                    User.create(userDetails)
                     .then(function(userData) {

                      var userObjectData = {
                        email: userDetails.email,
                        name: userDetails.firstname+" "+userDetails.lastname,
                        rolename:roledata.rolename
                      };
                      var userreq={};
                      var usersubject = 'Registration Success';
                      var userdescription = 'New user registration  successfully!';
                      userreq.userid = user.id;
                      userreq.logdata= 'New user registration  successfully - ' +userDetails.email;
                      sails.log.info('userreq',userreq);
                      Useractivity.createUserActivity(userreq,usersubject,userdescription);

                      EmailService.senduserRegisterEmail(user);

                      return resolve({
                        code: 200,
                        userdetails: userData
                      });

                      })
                      .catch(function(err) {
                        sails.log.error("User#registerNewUser::", err);
                        return reject(err);
                      });
                   })
                  .catch(function(err) {
                    sails.log.error("User#registerNewUser::", err);
                    return reject(err);
                  });

              })
              .catch(function(err) {
                sails.log.error("User#registerNewUser::", err);
                return reject(err);
              });


              }
         })
          .catch(function(err) {
            sails.log.error("User#registerNewUser::", err);
            return reject(err);
          });*/
	} );
}

function createNewUserProcessAction( req, res, userInput ) {
	return Q.promise( function( resolve, reject ) {
		const criteria = {
			email: userInput.email
		};

		User.findOne( criteria ).then( function( userData ) {
			if( userData ) {
				return resolve( {
					code: 400,
					userdetails: userData
				} );
			} else {
				User.getNextSequenceValue( "user" ).then( function( userRefernceData ) {
					const userReference = "USR_" + userRefernceData.sequence_value;
					userInput.userReference = userReference;
					userInput.consentsChecked = req.session.Electronicsign;
					// -- Added to avoid ssn_number field missing in users table (ssnNumber is dummy)
					userInput.ssn_number = userInput.ssnNumber;

					sails.log.info( "userInput=====================:", userInput );

					User.create( userInput ).then( function( userData ) {
						/* var userreq     = {};
                                var usersubject   =   'Registration Success';
                                var userdescription =   'New user registration  successfully!';
                                userreq.userid    =   userData.id;
                                userreq.logdata   =   'New user registration  successfully - ' + userData.email;
                                    Useractivity.createUserActivity(userreq,usersubject,userdescription);

                                    EmailService.senduserRegisterEmail(userData);*/

						return resolve( {
							code: 200,
							userdetails: userData
						} );
					} );
				} );
			}
		} );
	} );
}

function doTransunionProcess( res, req, userDetails ) {
	// sails.log.info("userDetailsssssssssss::", userDetails);
	return Q.promise( function( resolve, reject ) {
		Transunion.callTransUnionApi( userDetails )
		.then( function( transUnionData ) {
			// sails.log.info("transUnionData: ",transUnionData.code);
			const userId = userDetails.id;
			User.findOne( {
				id: userId
			} ).then( function( userDetail ) {
				const acceptconsent = userDetail.consentsChecked;

				Screentracking.findOne( {
					user: userId
				} ).then( function( screendata ) {
					const applicationReference = screendata.applicationReference;
					const screenid = screendata.id;
					const creditscore = screendata.creditscore;

					// --Update fillout manually in screentracking
					if( "undefined" !== typeof req.session.filloutmanually && req.session.filloutmanually != null && req.session.filloutmanually == "1" ) {
						screendata.filloutmanually = 1;
						// screendata.save();
					}

					screendata.applicationType = "Application wizard";
					screendata.save();

					var adverseConsent = "0";
					if( transUnionData.code == 200 ) {
						if( transUnionData.transunionStatus != 200 ) {
							// Adverse consent document generation
							var adverseConsent = "1";
							acceptconsent.push( "201" );
						}
					} else {
						// Adverse consent document generation
						var adverseConsent = "1";
						acceptconsent.push( "201" );
					}

					const IPFromRequest = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;
					const indexOfColon = IPFromRequest.lastIndexOf( ":" );
					const ip = IPFromRequest.substring( indexOfColon + 1, IPFromRequest.length );

					UserConsent.createAgreementPdf( applicationReference, ip, res, req, screenid, userDetail, acceptconsent )
					.then( function( agreementpdf ) {
						if( agreementpdf.code == 200 && adverseConsent == "0" ) {
							return resolve( {
								code: 200
							} );
						} else {
							const consentCriteria = {
								user: userDetail.id,
								loanupdated: 1,
								paymentManagement: {
									$exists: false
								}
							};
							UserConsent.find( consentCriteria )
							.sort( "createdAt DESC" )
							.then( function( userConsentAgreement ) {
								sails.log.info( "userConsentAgreement", userConsentAgreement );

								if( userConsentAgreement.length > 0 ) {
									PaymentManagement.find( {
										user: userDetail.id
									} ).then( function( paymentmanagementdata ) {
										_.forEach( userConsentAgreement, function( consentagreement ) {
											UserConsent.updateUserConsentAgreement( consentagreement.id, userDetail.id, paymentmanagementdata.id );
										} );
									} );
								}

								return resolve( {
									code: 400
								} );
							} )
							.catch( function( err ) {
								sails.log.error( "Screentracking::updatedeclinedloan UserConsent error::", err );
								return resolve( {
									code: 400
								} );
							} );
						}
					} )
					.catch( function( err ) {
						sails.log.error( "ApplicationController#createpromissorypdfAction :: err", err );
						return res.handleError( err );
					} );
				} );
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "UserAddAction :: err :", err );
			return res.handleError( err );
		} );
	} );
}

// --Insert user table from plaid information
function registerNewPlaidUserApplication( plaiduserData, practimeManagementID, clicktoSave, reqdata ) {
	return Q.promise( function( resolve, reject ) {
		const isuserInput = plaiduserData.isuserInput;
		let FirstName; let LastName; let email; let emailSecondary; let phoneNumber; let phoneNumberSecondory; let addressesData; let addressesDataSecondory; let city; let state; let street; let zipCode;

		// --user firstname and lastname
		if( "undefined" !== typeof plaiduserData.names[ 0 ] && plaiduserData.names[ 0 ] != "" && plaiduserData.names[ 0 ] != null ) {
			const fullname = plaiduserData.names[ 0 ].split( " " );
			const size = fullname.length;

			if( size == 1 ) {
				FirstName = fullname[ 0 ];
				LastName = fullname[ 0 ];
			} else if( size == 2 ) {
				FirstName = fullname[ 0 ];
				LastName = fullname[ 1 ];
			} else if( size == 3 ) {
				FirstName = fullname[ 0 ];
				LastName = fullname[ 1 ] + " " + fullname[ 2 ];
			}
		}

		// --user email
		if( "undefined" !== typeof plaiduserData.emails && plaiduserData.emails != "" && plaiduserData.emails != null ) {
			_.forEach( plaiduserData.emails, function( emailaddress ) {
				if( emailaddress.primary == true ) {
					email = emailaddress.data;
				} else {
					emailSecondary = emailaddress.data;
				}
			} );
			if( !email ) {
				email = emailSecondary;
			}
		}

		// --user phone number
		if( "undefined" !== typeof plaiduserData.phone_numbers && plaiduserData.phone_numbers != "" && plaiduserData.phone_numbers != null ) {
			_.forEach( plaiduserData.phone_numbers, function( phoneNumbers ) {
				if( phoneNumbers.primary == true ) {
					phoneNumber = phoneNumbers.data;
				} else {
					phoneNumberSecondory = phoneNumbers.data;
				}
			} );
			if( !phoneNumber ) {
				phoneNumber = phoneNumberSecondory;
			}
		}

		// -- user address
		if( "undefined" !== typeof plaiduserData.addresses && plaiduserData.addresses != "" && plaiduserData.addresses != null ) {
			_.forEach( plaiduserData.addresses, function( addresses ) {
				if( addresses.primary == true ) {
					addressesData = addresses.data;
				} else {
					addressesDataSecondory = addresses.data;
				}
			} );
			if( !addressesData ) {
				addressesData = addressesDataSecondory;
			}
			if( addressesData ) {
				city = addressesData.city;
				state = addressesData.state;
				street = addressesData.street;
				zipCode = addressesData.zip;
			}
		}

		const roleCriteria = {
			rolename: "User"
		};

		Roles.findOne( roleCriteria )
		.then( function( roledata ) {
			// clicktosave starts here
			if( clicktoSave == 1 ) {
				if( "undefined" !== typeof reqdata.session.applicationuserId && reqdata.session.applicationuserId != "" && reqdata.session.applicationuserId != null ) {
					const applicationuserId = reqdata.session.applicationuserId;
					const userEmail = reqdata.session.userEmail;

					var usercriteria = {
						id: applicationuserId
					};

					User.findOne( usercriteria )
					.then( function( userData ) {
						if( userData ) {
							if( isuserInput == 1 ) {
								return resolve( {
									code: 300,
									plaidData: plaiduserData
								} );
							} else {
								userData.firstname = FirstName;
								userData.lastname = LastName;
								userData.phoneNumber = phoneNumber;
								userData.state = state;
								userData.street = street;
								userData.city = city;
								userData.zipCode = zipCode;
								userData.practicemanagement = practimeManagementID;
								userData.role = roledata.id;
								// userData.ssnNumber = ssnNumber;
								// userData.ssn_number = ssnNumber;
								// userData.dateofBirth = userDetails.dateofBirth;
								userData.save( function( err ) {
									if( err ) {
										return resolve( {
											code: 400
										} );
									}
									return resolve( {
										code: 200,
										plaidData: plaiduserData,
										userData: userData
									} );
								} );
							}
						} else {
							return resolve( {
								code: 400
							} );
						}
					} )
					.catch( function( err ) {
						return resolve( {
							code: 400
						} );
					} );
				} else {
					return resolve( {
						code: 400
					} );
				}
			} else {
				if( isuserInput == 1 ) {
					sails.log.error( "registerNewPlaidUserApplication :: no plaid user info", isuserInput );
					return resolve( {
						code: 300,
						plaidData: plaiduserData
					} );
				} else {
					var usercriteria = {
						email: email,
						isDeleted: false
					};

					User.findOne( usercriteria )
					.then( function( userDetails ) {
						// Needs to remove before going to live.
						if( userDetails && sails.config.useremailunique == 1 ) {
							return resolve( {
								code: 500
							} );
						} else {
							User.getNextSequenceValue( "user" )
							.then( function( userRefernceData ) {
								const userData = {
									firstname: FirstName,
									lastname: LastName,
									email: email,
									phoneNumber: phoneNumber,
									state: state,
									street: street,
									city: city,
									zipCode: zipCode,
									userReference: "USR_" + userRefernceData.sequence_value,
									role: roledata.id,
									practicemanagement: practimeManagementID
								};

								sails.log.info( "userData::", userData );

								User.create( userData )
								.then( function( userInfoDetails ) {
									sails.log.info( "userInfoDetails::", userInfoDetails );
									return resolve( {
										code: 200,
										plaidData: plaiduserData,
										userData: userInfoDetails
									} );
								} )
								.catch( function( err ) {
									sails.log.error( "registerNewPlaidUserApplication :: ", err );
									return resolve( {
										code: 400
									} );
								} );
							} )
							.catch( function( err ) {
								sails.log.error( "registerNewPlaidUserApplication :: ", err );
								return resolve( {
									code: 400
								} );
							} );
						}
					} )
					.catch( function( err ) {
						sails.log.error( "registerNewPlaidUserApplication :: ", err );
						return resolve( {
							code: 400
						} );
					} );
				}
			}
		} )
		.catch( function( err ) {
			sails.log.error( "registerNewPlaidUserApplication :: ", err );
			return resolve( {
				code: 400
			} );
		} );
	} );
}

function sendRegistrationEmail( userData ) {
	return Q.promise( function( resolve, reject ) {
		const userreq = {};
		const usersubject = "Registration Success";
		const userdescription = "New user registration successfully!";
		userreq.userid = userData.id;
		userreq.logdata = "New user registration successfully - " + userData.email;
		Useractivity.createUserActivity( userreq, usersubject, userdescription );
		EmailService.senduserRegisterEmail( userData );
		return resolve( {
			code: 200
		} );
	} );
}

function getBorrowerDashboardDetails( userid ) {
	return Q.promise( function( resolve, reject ) {
		const userCriteria = {
			id: userid
		};

		User.findOne( userCriteria )
		.then( function( userDetails ) {
			if( userDetails ) {
				const registerDate = userDetails.createdAt.toString();
				const regisDt = registerDate.replace( "T", " " ).slice( 3, 16 );
				const updatedate = userDetails.updatedAt.toString();
				const lastUpdateDt = updatedate.replace( "T", " " ).slice( 3, 16 );

				const isEmailVerified = userDetails.isEmailVerified;
				const isBankAdded = userDetails.isBankAdded;
				const isGovernmentIssued = userDetails.isGovernmentIssued;
				const isPayroll = userDetails.isPayroll;
				let totdocount = 0;
				if( !isEmailVerified ) {
					totdocount++;
				}

				if( !isBankAdded ) {
					totdocount++;
				}

				if( !isGovernmentIssued ) {
					totdocount++;
				}

				if( !isPayroll ) {
					totdocount++;
				}

				const loanCriteria = {
					user: userid,
					$or: [
						{
							status: "OPENED"
						},
						{
							status: "PAID OFF"
						},
						{
							status: "CLOSED"
						},
						{
							status: "DENIED"
						}
					],
					achstatus: [ 0, 1, 2, 3, 4 ]
				};

				sails.log.info( "loanCriteria::", loanCriteria );

				PaymentManagement.find( loanCriteria )
				.sort( "createdAt DESC" )
				.then( function( paymentmanagementdata ) {
					sails.log.info( "paymentmanagementdata::", paymentmanagementdata );

					let loanCount = 0;
					let incompleteCount = 0;
					let loanData = [];
					const screenData = [];
					const isoffercompleted = 0;
					let incompleteredirectUrl = "";

					if( paymentmanagementdata ) {
						loanCount = paymentmanagementdata.length;
						loanData = paymentmanagementdata;
					}

					_.forEach( paymentmanagementdata, function( paydata ) {
						paydata.totdocount = totdocount;
					} );

					const screenCriteria = {
						user: userid,
						iscompleted: [ 0, 2 ]
					};

					// sails.log.info("Dashboard screenCriteria:",screenCriteria);

					Screentracking.find( screenCriteria )
					.sort( "createdAt DESC" )
					.then( function( screentrackingdetails ) {
						sails.log.info( "Dashboard screentrackingdetails:", screentrackingdetails );
						sails.log.info( "Dashboard screentrackingdetails.length:", screentrackingdetails.length );

						let isBankAddedPending = 0;
						if( screentrackingdetails.length > 0 ) {
							incompleteCount = screentrackingdetails.length;
							var fullscreenData = screentrackingdetails;

							_.forEach( fullscreenData, function( screenDetails ) {
								screenDetails.totdocount = totdocount;

								if( screenDetails.ispromissorycompleted == 0 ) {
									if( screenDetails.isoffercompleted == 0 ) {
										if( !screenDetails.isBankAdded ) {
											screenDetails.isBankAdded = 0;
										}

										if( screenDetails.isBankAdded == 0 ) {
											isBankAddedPending = parseInt( isBankAddedPending ) + 1;
										}
									}
								}
							} );

							// clicktosave starts here
							let clicktoSave = 0;
							if( userDetails.clicktosave ) {
								if( userDetails.clicktosave == 1 ) {
									clicktoSave = 1;
								}
							}

							if( clicktoSave == 1 ) {
								incompleteredirectUrl = "/createnewapplication";
							} else {
								// if(userDetails.isBankAdded==false)
								if( parseInt( isBankAddedPending ) > 0 ) {
									incompleteredirectUrl = "/addbankaccount/" + userid;
								} else {
									const screenData = screentrackingdetails[ 0 ];
									let isAccountLinked = 0;
									if( screenData.isAccountLinked ) {
										isAccountLinked = screenData.isAccountLinked;
									}
									if( screenData.isoffercompleted == 1 ) {
										incompleteredirectUrl = "/userpromissorynote/" + userid;
									} else {
										if( isAccountLinked == 0 ) {
											incompleteredirectUrl = "/addbankaccount/" + userid;
										} else {
											incompleteredirectUrl = "/emailmyoffer/" + screenData.id;
										}
									}
									sails.log.info( "incompleteredirectUrl::", incompleteredirectUrl );
								}
							}
						} else {
							var fullscreenData = [];
						}

						const responsedata = {
							status: 200,
							user: userDetails,
							loanData: loanData,
							screenData: fullscreenData,
							loanCount: loanCount,
							incompleteCount: incompleteCount,
							incompleteredirectUrl: incompleteredirectUrl,
							isBankAddedPending: isBankAddedPending
						};

						sails.log.info( "Final responsedata:", responsedata );
						return resolve( responsedata );
					} )
					.catch( function( err ) {
						if( loanCount > 0 ) {
							var responsedata = {
								status: 200,
								user: userDetails,
								loanData: loanData,
								screenData: fullscreenData,
								loanCount: loanCount,
								incompleteCount: incompleteCount,
								incompleteredirectUrl: incompleteredirectUrl,
								isBankAddedPending: isBankAddedPending
							};
						} else {
							var responsedata = {
								status: 400,
								message: "Unable to fetch screentracking details"
							};
						}
						sails.log.info( "Final responsedata:", responsedata );
						return resolve( responsedata );
					} );
				} )
				.catch( function( err ) {
					const responsedata = {
						status: 400,
						message: "Unable to fetch payment details"
					};
					return resolve( responsedata );
				} );
			} else {
				const responsedata = {
					status: 400,
					message: "Unable to fetch user details"
				};
				return resolve( responsedata );
			}
		} )
		.catch( function( err ) {
			const responsedata = {
				status: 400,
				message: "Invalid user ID"
			};
			return resolve( responsedata );
		} );
	} );
}

function resetUserRelatedDetails( userid ) {
	return Q.promise( function( resolve, reject ) {
		const usercriteria = {
			id: userid
		};

		User.findOne( usercriteria ).then( function( userDetails ) {
			if( !userDetails ) {
				return reject( {
					code: 404,
					message: "USER_NOT_FOUND"
				} );
			}

			PaymentManagement.find( {
				user: userDetails.id,
				achstatus: 1
			} )
			.then( function( loanInFunded ) {
				if( loanInFunded.length > 0 ) {
					return resolve( {
						code: 403,
						message: "Already Loan exist for this user in funded section"
					} );
				} else {
					Resetusers.create( userDetails )
					.then( function( resetuserData ) {
						User.destroy( {
							id: userDetails.id
						} ).then( function( destroyUser ) {} );
						return resolve( resetuserData );
					} )
					.catch( function( err ) {
						sails.log.error( "Error :: ", err );
						return reject( {
							code: 500,
							message: "INTERNAL_SERVER_ERROR"
						} );
					} );
				}
			} )
			.catch( function( err ) {
				return reject( {
					code: 500,
					message: "INTERNAL_SERVER_ERROR"
				} );
			} );
		} );
	} );
}



function checkuseralreadyregistered( reqdata, userDetails ) {
	return Q.promise( function( resolve, reject ) {
		const criteria = {
			email: userDetails.cemailAddress
		};
		User.findOne( criteria ).then( function( userData ) {
			if( userData ) {
				return resolve( {
					errorcode: 200
				} );
			} else {
				const roleCriteria = {
					rolename: "User"
				};
				Roles.findOne( roleCriteria ).then( function( roledata ) {
					User.getNextSequenceValue( "user" )
					.then( function( userRefernceData ) {
						let clickfilloutmanually = 0;
						if( "undefined" !== typeof reqdata.session.filloutmanually && reqdata.session.filloutmanually != null && reqdata.session.filloutmanually == "1" ) {
							clickfilloutmanually = 1;
						}
						let clickplaidconnected = 0;
						if( "undefined" !== typeof reqdata.session.isplaidEmpty && reqdata.session.isplaidEmpty != "" && reqdata.session.isplaidEmpty != null ) {
							clickplaidconnected = 1;
						}
						const userData = {
							email: userDetails.cemailAddress,
							practicemanagement: reqdata.session.appPracticeId,
							userReference: "USR_" + userRefernceData.sequence_value,
							role: roledata.id,
							consentsChecked: reqdata.session.Electronicsign,
							clicktosave: 1,
							clickfilloutmanually: clickfilloutmanually,
							clickplaidconnected: clickplaidconnected,
							clickpagename: userDetails.clickpagename
						};
						User.create( userData )
						.then( function( userInfoDetails ) {
							User.findOne( {
								id: userInfoDetails.id
							} ).then( function( userData ) {
								userData.password = userDetails.cpassword;
								const salt = User.generateSalt();
								User.generateEncryptedPassword( userData, salt ).then( function( encryptedPassword ) {
									userData.password = encryptedPassword;
									userData.salt = salt;
									userData.emailreset = true;
									userData.isEmailVerified = true;
									userData.save( function( err ) {
										Screentracking.createLastScreenName( "Userinfo", 1, userInfoDetails, "", "", "" ).then( function( screenObj ) {
											reqdata.session.applicationuserId = userInfoDetails.id;
											reqdata.session.userEmail = userInfoDetails.email;

											EmailService.clicktosaveuserRegisterEmail( userData );
											reqdata.session.clicktosave = 1;
											return resolve( {
												rescode: 200,
												result: userInfoDetails
											} );
										} );
									} );
								} );
							} );
						} )
						.catch( function( err ) {
							sails.log.error( "registerNewUserApplication :: ", err );
							return resolve( {
								rescode: 400
							} );
						} );
					} )
					.catch( function( err ) {
						sails.log.error( "registerNewUserApplication :: ", err );
						return resolve( {
							rescode: 400
						} );
					} );
				} );
			}
		} );
	} );
}

// fixes error: TypeError: sails.models.user.register is not a function
function registerAction() {}

function parseLastName( user ) {
	if( user.lastname.includes( " " ) ) {
		// ex: Mc Donald Sr
		const nameParts = user.lastname.split( " " );
		if( nameParts.length > 1 ) {
			const suffix = nameParts.pop().toUpperCase(); // ex: SR
			// sails.log.debug( "User.parseLastName; suffix:", suffix );
			const genCodes = [ "JR", "SR", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX" ];
			if( genCodes.indexOf( suffix ) >= 0 ) {
				user.lastname = nameParts.join( " " ).trim(); // ex: Mc Donald
				user.generationCode = suffix.replace( "JR", "Jr" ).replace( "SR", "Sr" );
				// sails.log.debug( "User.parseLastName; generationCode:", user.generationCode );
			}
		}
	}
}

function parseStreetAddress( user ) {
	const location = `${[ user.street, user.unitapt ].join( " " ).trim()}, ${user.city}, ${user.state} ${user.zipCode}`;
	const pAddress = parseAddress.parseLocation( location );
	if( pAddress == null ) {
		sails.log.error( "parseStreetAddress; failed to parse location:", location );
		return;
	}
	pAddress.number = pAddress.number || "";
	pAddress.prefix = pAddress.prefix || "";
	pAddress.street = pAddress.street || "";
	pAddress.type = pAddress.type || "";
	pAddress.sec_unit_type = pAddress.sec_unit_type || "";
	pAddress.sec_unit_num = pAddress.sec_unit_num || "";
	// sails.log.debug( "User.parseStreetAddress; pAddress:", pAddress );
	user.street = `${pAddress.number} ${pAddress.prefix} ${pAddress.street} ${pAddress.type}`.replace( /\s{2,}/g, " " ).trim();
	user.unitapt = `${pAddress.sec_unit_type} ${pAddress.sec_unit_num}`.replace( /\s{2,}/g, " " ).trim();
}

function changeMobileNumber( userID, phonenumber ) {
	const query = {
		id: userID,
		isDeleted: false
	};

	return User.update( query )
	.set( {
		phoneNumber: phonenumber,
		phoneIsMobile: true,
		isPhoneVerified: true,
		mobileOptedIn: false
	} )
	.then( function( userdata ) {
		return {
			changed: true
		};
	} )
	.catch( function( err ) {
		const res = {
			changed: false,
			error: err.message
		};
		return res;
	} );
}
