/**
 * PlaidUser.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var Q = require('q'),
  _ = require('lodash');

module.exports = {

  attributes: {
    names: {
      type: 'json'
    },
    emails: {
      type: 'json'
    },
    phoneNumbers: {
      type: 'json'
    },
    addresses: {
      type: 'json'
    },
    user: {
      model: 'User'
    },
    userBankAccount: {
      model: 'UserBankAccount'
    },
    isDeleted: {
      type: 'boolean',
      defaultsTo: false
    },
    isEmailValid: {
      type: 'boolean',
      defaultsTo: 'false'
    },
    /*university: {
      model: 'University'
    },*/
    state: {
      model: 'State'
    },
	plaidfilloutmanually: {
      type: 'integer',
      defaultsTo: 0
    },
  },

  createForUserBankAccount: createForUserBankAccount,
  getLatestDataForUser: getLatestDataForUser,
  getForUserBankAccountAndUser: getForUserBankAccountAndUser,
  transformToUserProfile: transformToUserProfile,
  getPrimaryName: getPrimaryName,
  getPrimaryEmail: getPrimaryEmail,
  getPrimaryPhone: getPrimaryPhone,
  getPrimaryAddress: getPrimaryAddress,
  getUserEmailVerified: getUserEmailVerified,
  getUserStateVerified: getUserStateVerified,
  getEmailValid: getEmailValid,
  checkIfEmailValid: checkIfEmailValid,
  getExtensionForDomain: getExtensionForDomain,
  getDomainFromEmail: getDomainFromEmail,
  getUniversityForEmail: getUniversityForEmail,
  getStateForAddress: getStateForAddress,
  checkEmailGetUniversity: checkEmailGetUniversity,
  getUniversityDetails: getUniversityDetails,
  checkUserPlaidDetails:checkUserPlaidDetails,
};

function createForUserBankAccount(userBankAccount) {
  return Q.promise(function (resolve, reject) {

	//sails.log.info("userBankAccount 111::",userBankAccount);
	sails.log.info("userBankAccount 111::",userBankAccount.accessToken);

    // get user info
    InstitutionService.getUserDetail( userBankAccount.accessToken, userBankAccount.user )
      .then(function (userInfoData) {


		if(userInfoData.status == 400)
		{
			var newPlaidUser = {
			  names: [],
			  emails: [],
			  phoneNumbers:[],
			  addresses: [],
			  //user: userBankAccount.user,
			  userBankAccount: userBankAccount.id,
			  isuserInput:1
			};

			//return PlaidUser.create(newPlaidUser);

		}
		else
		{
			var userInfo =  userInfoData.userInfo;
			var newPlaidUser = {
			  names: userInfo.identity.names,
			  emails: userInfo.identity.emails,
			  phoneNumbers: userInfo.identity.phone_numbers,
			  addresses: userInfo.identity.addresses,
			  //user: userBankAccount.user,
			  userBankAccount: userBankAccount.id,
			  isuserInput:0
			};
			//return PlaidUser.create(newPlaidUser);
		}



		PlaidUser.create(newPlaidUser)
		.then(function (plaiduserInfoData) {
			//sails.log.info("plaiduserInfoData----",plaiduserInfoData);
			return resolve(plaiduserInfoData)
		})
		.catch(function (err) {
			sails.log.error("PlaidUser#createForUserBankAccount :: ", err);
			return reject({
				code: 500,
				message: 'INTERNAL_SERVER_ERROR'
			});
		});


			/*PlaidUser.create(newPlaidUser)
			.then(function (plaiduserInfoData) {


				var FirstName,LastName, email,emailSecondary,phoneNumber,phoneNumberSecondory,addressesData,addressesDataSecondory,city,state,street,zipCode;

				if ("undefined" !== typeof userInfo.identity.names[0] && userInfo.identity.names[0] !='' && userInfo.identity.names[0] !=null)
				 {
					var fullname  = userInfo.identity.names[0].split(" ");
					var size = fullname.length;

					if(size==1){
						 FirstName = fullname[0];
						 LastName = fullname[0];
					}else if(size == 2){
						 FirstName = fullname[0];
						 LastName = fullname[1];
					}
					else if(size == 3){
						 FirstName = fullname[0];
						 LastName = fullname[1]+" "+fullname[2];
					}
				 }

				 if ("undefined" !== typeof userInfo.identity.emails && userInfo.identity.emails !='' && userInfo.identity.emails!=null)
				 {
					 _.forEach(userInfo.identity.emails, function(emailaddress) {

						if(emailaddress.primary == true) {
							 email = emailaddress.data;
						} else {
							 emailSecondary = emailaddress.data;
						}
					});

					 if(!email) {
						 email = emailSecondary;
					 }

				 }

				 if ("undefined" !== typeof userInfo.identity.phone_numbers && userInfo.identity.phone_numbers !='' && userInfo.identity.phone_numbers !=null)
				 {
					  _.forEach(userInfo.identity.phone_numbers, function(phoneNumbers) {
						if(phoneNumbers.primary == true) {
							 phoneNumber = phoneNumbers.data;
						} else {
							 phoneNumberSecondory = phoneNumbers.data;
						}
					});
					  if(!phoneNumber) {
						 phoneNumber = phoneNumberSecondory;
					 }
				 }

				 if ("undefined" !== typeof userInfo.identity.addresses && userInfo.identity.addresses !='' && userInfo.identity.addresses !=null)
				 {
					  _.forEach(userInfo.identity.addresses, function(addresses) {
						if(addresses.primary == true) {
							 addressesData = addresses.data;
						} else {
							 addressesDataSecondory = addresses.data;
						}
					});
					  if(!addressesData) {
						 addressesData = addressesDataSecondory;
					 }

					 if(addressesData) {
						 city = addressesData.city;
						 state = addressesData.state;
						 street = addressesData.street;
						 zipCode = addressesData.zip;
					 }

				 }

				 var roleCriteria = { rolename: "User" };

					Roles
					.findOne(roleCriteria)
					.then(function(roledata){

						 User
						 .getNextSequenceValue('user')
						 .then(function(userRefernceData) {

							var userData = {
								firstname: FirstName,
								lastname: LastName,
								email: email,
								phoneNumber: phoneNumber,
								state:state,
								street:street,
								city: city,
								zipCode: zipCode,
								userReference :'USR_'+userRefernceData.sequence_value,
								role: roledata.id
							};

							sails.log.info("userData::",userData);

							User.create(userData)
							.then(function (userInfoDetails){

								sails.log.info("userInfoDetails::",userInfoDetails);
								return resolve({plaidData:plaiduserInfoData,userData: userInfoDetails});

							})
							.catch(function (err) {
								sails.log.error("PlaidUser#createForUserBankAccount :: ", err);
								return reject({
									code: 500,
									message: 'INTERNAL_SERVER_ERROR'
								});
							});
						})
						.catch(function (err) {
							sails.log.error("PlaidUser#createForUserBankAccount :: ", err);
							return reject({
								code: 500,
								message: 'INTERNAL_SERVER_ERROR'
							});
						});
					})
					.catch(function (err) {
						sails.log.error("PlaidUser#createForUserBankAccount :: ", err);
						return reject({
							code: 500,
							message: 'INTERNAL_SERVER_ERROR'
						});
					});


			})
			.catch(function (err) {
				sails.log.error("PlaidUser#createForUserBankAccount :: ", err);
				return reject({
					code: 500,
					message: 'INTERNAL_SERVER_ERROR'
				});
			});
		}*/
      })
      .catch(function (err) {
        sails.log.error("PlaidUser#createForUserBankAccount :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
		//return resolve();
      });
  });
}

function getLatestDataForUser(user) {
  return Q.promise(function (resolve, reject) {
    // create a criteria to get the latest for the user
    var criteria = {
      where: {
        user: user.id,
        isDeleted: false
      },
      sort: 'updatedAt DESC'
    };

    PlaidUser
      .find(criteria)
      .then(function (plaidUsers) {
        // get the first plaid user
        if (plaidUsers.length == 0) {
          // return error response
          sails.log.error("PlaidUser#getLatestDataForUser :: No plaid users found for the user :: ", user.id);

          return reject({
            code: 404,
            message: 'PLAID_USER_NOT_FOUND'
          });
        }
        // get the modified data for the plaid user
        var plaidUser = plaidUsers[0];
        return resolve(transformToUserProfile(plaidUser));
      })
      .catch(function (err) {
        sails.log.error("PlaidUser#getLatestDataForUser :: ", err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function getForUserBankAccountAndUser(user, userBankAccountId) {
  return Q.promise(function (resolve, reject) {
    // create a criteria to get the latest for the user
    var criteria = {
      where: {
        user: user.id,
        userBankAccount: userBankAccountId,
        isDeleted: false
      },
      sort: 'updatedAt DESC'
    };

    PlaidUser
      .find(criteria)
      .then(function (plaidUsers) {
        // get the first plaid user
        if (plaidUsers.length == 0) {
          // return error response
          sails.log.error("PlaidUser#getLatestDataForUser :: No plaid users found for the user :: ", user.id);

          return reject({
            code: 404,
            message: 'PLAID_USER_NOT_FOUND'
          });
        }
        // get the modified data for the plaid user
        var plaidUser = plaidUsers[0];

        return resolve(transformToUserProfile(plaidUser));
      })
      .catch(function (err) {
        sails.log.error("PlaidUser#getLatestDataForUser :: ", err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function transformToUserProfile(plaidUser) {
  return Q.promise(function (resolve, reject) {
    var promises = [];
    if (!plaidUser) {
      sails.log.error("PlaidUser#transformToUserProfile :: plaid user data is null");

      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }

	//for testing purpose
	//plaidUser.names = ["LESLYE CHAMPAN", "TRAVIS A CHAPMAN" ];

    var addressObject = PlaidUser.getPrimaryAddress(plaidUser);

    // get if email is verified
    var transformedObject = {
      name: PlaidUser.getPrimaryName(plaidUser),
      email: PlaidUser.getPrimaryEmail(plaidUser),
      phoneNumber: PlaidUser.getPrimaryPhone(plaidUser),
      zip: addressObject.zip,
      city: addressObject.city,
      street: addressObject.street,
      isEmailValid: false
    };

    // get if email is valid or not
    transformedObject.isEmailValid = PlaidUser.checkIfEmailValid(transformedObject.email);

	//-- Added to get all plaid names
	var multipleNameExist=0;
	if (_.has(plaidUser, 'names') && plaidUser.names.length > 1) {
    	var multipleNameExist=1;
    }
	transformedObject.multipleNameExist = multipleNameExist;
	transformedObject.plaidUserNames = plaidUser.names;

	//--BLOCKED TO GET UNIVERSITY FROM USER COLLECTION
    //PlaidUser
     // .getUniversityForEmail(transformedObject.email, transformedObject.isEmailValid)

	  console.log("PlaidUser userID",plaidUser.user);

	  User
      .findOne({
        id: plaidUser.user
      })
      .then(function (userDetails) {
        //transformedObject.university = universityId;
		console.log("userDetails",userDetails);
		transformedObject.universityID = userDetails.university;
        return PlaidUser.getUniversityDetails(userDetails.university);
      })
	  .then(function (universitydetails) {
		 console.log("universitydetails",universitydetails);
		 transformedObject.university = universitydetails.name+'-'+universitydetails.city;
         return PlaidUser.getStateForAddress(addressObject);
      })
      .then(function (stateId) {
        transformedObject.state = stateId;

        return resolve(transformedObject);
      })
      .catch(function (err) {
        sails.log.error("PlaidUser#transformToUserProfile :: Error :: ", err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });

  });
}

function getUniversityDetails(universityID)
{
 return Q.promise(function(resolve, reject) {
    var criteria = {
      id: universityID
    };
    University
      .findOne(criteria)
      .then(function(university) {
        if (!university) {
          return reject({
            code: 404,
            message: 'UNIVERSITY_NOT_FOUND'
          });
        }
        return resolve(university);
      })
      .catch(function(err) {
        sails.log.error('PlaidUser#getUniversityName :: err :', err);
        return reject(err);
      });
  });
}

function getUniversityForEmail(email, isEmailValid) {
  return Q.promise(function (resolve, reject) {
    var universityId = 'other';
    if (!isEmailValid || !email || email === '') {
      return resolve(universityId);
    }

    var domain = PlaidUser.getDomainFromEmail(email, false);

    // query database for the university
    var criteria = {
      "name": {
        "contains": domain
      }
    };

    University
      .find(criteria)
      .then(function (universities) {
        // check the length
        if (universities.length === 0) {
          return resolve(universityId);
        }
        // get the first name
        return resolve(universities[0].id);
      })
      .catch(function (err) {
        sails.log.error("PlaidUser#getUniversityForEmail :: Error finding university", err);

        return resolve(universityId);
      });
  });
}
//TODO: Adding .com to mail extension for debugging
function checkIfEmailValid(email) {
  var isValid = false;
  // check if email has string
  if (!email) {
    return isValid;
  }
  console.log("email id: ",email);
  // try to get the domain name out from the string
  var domainName = PlaidUser.getDomainFromEmail(email, true);
  // get the extension from the domain Name
  console.log("domainName: ",domainName);
  var extension = PlaidUser.getExtensionForDomain(domainName);
  // check if the .edu
  console.log("here is the extension : ",extension);
  if (extension === 'edu' || extension === 'com' || extension === 'in' || extension === 'net' ) {
    isValid = true;
  }

  return isValid;
}

function getExtensionForDomain(domain) {
  var extension = '';

  if (!domain || domain === '') {
    return extension;
  }

  // try to get the extension
  var splitExtension = domain.split('.');
  // check
  if (splitExtension.length > 0) {
    extension = splitExtension[splitExtension.length - 1];
  }

  return extension;
}
function getDomainFromEmail(email, withExtension) {
  var domainName = '';

  if (!email || email === '') {
    return domainName;
  }
  // try to find character
  var splitEmail = email.split('@');
  // check
  if (splitEmail.length > 0) {
    domainName = splitEmail[splitEmail.length - 1];
  }
  // remove extension if not requried
  if (domainName !== '' & !withExtension) {
    var splitExtensions = domainName.split('.');
    // take the first name
    domainName = splitExtensions.length > 0 ? splitExtensions[0] : domainName;
  }

  return domainName;
}

function getPrimaryName(plaidUser) {
  var primaryName = '';
  if (_.has(plaidUser, 'names') && plaidUser.names.length > 0) {
    primaryName = plaidUser.names[0];
  }

  return primaryName;
}

function getPrimaryEmail(plaidUser) {
  var primaryEmail = '';
  if (_.has(plaidUser, 'emails') && plaidUser.emails.length > 0) {
    var emailObjects = _.filter(plaidUser.emails, {
      'primary': true
    });

    if (emailObjects.length == 0) {
      primaryEmail = plaidUser.emails[0].data;
    } else {
      primaryEmail = emailObjects[0].data;
    }

  }

  return primaryEmail;
}

function getPrimaryPhone(plaidUser) {
  var primaryPhone = '';
  if (_.has(plaidUser, 'phoneNumbers') && plaidUser.phoneNumbers.length > 0) {

    var phoneObjects = _.filter(plaidUser.phoneNumbers, {
      'primary': true
    });
    if (phoneObjects.length == 0) {
      primaryPhone = plaidUser.phoneNumbers[0].data;
    } else {
      primaryPhone = phoneObjects[0].data;
    }

  }

  return primaryPhone;
}

function getPrimaryAddress(plaidUser) {
  var primaryAddress = {
    zip: '',
    state: '',
    city: '',
    street: ''
  };

  if (_.has(plaidUser, 'addresses') && plaidUser.addresses.length > 0) {

    var addressObjects = _.filter(plaidUser.addresses, {
      'primary': true
    });

    if (addressObjects.length == 0) {
      primaryAddress = plaidUser.addresses[0].data;
    } else {
      primaryAddress = addressObjects[0].data;
    }

  }

  return primaryAddress;
}

function getUserEmailVerified(plaidUser) {

  var deferred = Q.defer();
  var email = PlaidUser.getPrimaryEmail(plaidUser);

  //to give an list back
  var domainList = email.split('@');
  var domain = domainList[1];
  var tokens = domain.split('.');
  var name = tokens[0];
  var emailId = tokens[tokens.length - 1];
  //need to do a text search
  var criteria = {
    user: plaidUser.user
  };
  PlaidUser
    .findOne(criteria)
    .then(function (plaiduser) {
      var criteria = {
        "name": {
          "contains": name
        }
      };
      University
        .findOne(criteria)
        .then(function (university) {
          plaiduser.university = university.id;
          if (emailId === 'edu' || emailId === 'com') {
            plaiduser.isEmailValid = true;
          } else {
            plaiduser.isEmailValid = false;
            plaiduser.university = "";
          }
          plaiduser.save(function (err) {
            if (err) {
              sails.log.error("University#getUserEmailVerified :: Error :: ", err);

              deferred.reject({
                code: 500,
                message: 'INTERNAL_SERVER_ERROR'
              });
            }
            deferred.resolve(plaiduser);
          })

        })
    })
    .catch(function (err) {
      sails.log.error("PlaidUser#getUniversityDetail::,Error", err);
      deferred.reject(err);
    })


  return deferred.promise;
}

function getUserStateVerified(plaiduser) {
  var deferred = Q.defer();
  var primaryAddress = PlaidUser.getPrimaryAddress(plaiduser)

  var criteria = {
    stateCode: primaryAddress.state
  };
  State
    .findOne(criteria)
    .then(function (state) {
      plaiduser.state = state.id;
      plaiduser.save(function (err) {
        if (err) {
          sails.log.error("University#getUserStateVerified :: Error :: ", err);

          deferred.reject({
            code: 500,
            message: 'INTERNAL_SERVER_ERROR'
          });
        }
        deferred.resolve(plaiduser)
      })
    })
    .catch(function (err) {
      sails.log.error("PlaidUser#getUserStateVerified::Error", err)
      deferred.reject(err);
    })
  return deferred.promise;
}


function getEmailValid(emailId, user) {
  var deferred = Q.defer();
  var domainList = emailId.split('@');
  var domain = domainList[1];
  var tokens = domain.split('.');
  var name = tokens[0];
  var emailIdtoken = tokens[tokens.length - 1];

  var criteria = {
    user: user.id
  };
  PlaidUser
    .findOne(criteria)
    .then(function (plaiduser) {
      if (emailIdtoken === 'edu') {
        var criteria = {
          "name": {
            "contains": name
          }
        };
        University
          .findOne(criteria)
          .then(function (university) {
            if (university) {
              plaiduser.isEmailValid = true;
              plaiduser.university = university.id;
            }
            else {
              plaiduser.isEmailValid = true;
              plaiduser.university = "";
            }
            plaiduser.save(function (err) {
              if (err) {
                sails.log.error("University.getEmailValid::Error", err);
                deferred.reject({
                  code: 400,
                  message: "INVALID_INPUT"

                })
              }
              var plaidObj = {
                isEmailValid: plaiduser.isEmailValid,
                university: plaiduser.university
              };
              deferred.resolve(plaidObj)
            })

          })
      } else {
        var obj = {
          isEmailValid: false,
          university: ""
        };

        deferred.resolve(obj);
      }
    })
    .catch(function (err) {
      sails.log.error("#getEmailValid::Error", err);
      deferred.reject(err);
    });

  return deferred.promise;
}

function getStateForAddress(address) {
  return Q.promise(function (resolve, reject) {
    var stateId = 'other';
    // check if state code is present
    if (!address || !_.has(address, 'state') || address.state === '') {
      return resolve(stateId);
    }

    // find state for statecode
    State
      .findOne({
        stateCode: address.state,
        isActive: true
      })
      .then(function (state) {
        if (!state) {
          return resolve(stateId);
        }

        return resolve(state.id);
      })
      .catch(function (err) {
        sails.log.error("PlaidUser#getStateForAddress :: Error :: ", err);
      });
  });
}

function checkEmailGetUniversity(email) {
  return Q.promise(function (resolve, reject) {
    var response = {
      isEmailValid: false,
      university: 'other'
    };

    // find if email is valid
    response.isEmailValid = PlaidUser.checkIfEmailValid(email);
    // get university for the email
    PlaidUser
      .getUniversityForEmail(email, response.isEmailValid)
      .then(function (universityId) {
        response.university = universityId;

        return resolve(response);
      })
      .catch(function (err) {
        sails.log.error("PlaidUser#checkEmailGetUniversity :: ", err);

        return resolve(response);
      })

  });
}


function checkUserPlaidDetails(userdata,data) {
  return Q.promise(function (resolve, reject) {

	 var plaidcriteria = {
						  user:userdata.id
					    };

	 PlaidUser
	 .findOne(plaidcriteria)
	 .populate('user')
	 .sort("updatedAt DESC")
	 .then(function(plaidDetails) {

			if(plaidDetails)
			{
				var isuserInput = plaidDetails.isuserInput;

				if(isuserInput==1)
				{
					 var plaidNames =[];
					 var plaidEmails =[];
					 var plaidphoneNumbers =[];
					 var plaidAddress =[];
					 if ("undefined" !== typeof data.name && data.name!='' && data.name!=null)
					 {
					 	plaidNames.push(data.name);
					 }

					 if ("undefined" !== typeof data.email && data.email!='' && data.email!=null)
					 {
						  var emailData	= {
											"primary" : true,
											"type" : "e-mail",
											"data" : data.email
										 }

					 	plaidEmails.push(emailData);
					 }

					 if ("undefined" !== typeof userdata.phoneNumber && userdata.phoneNumber!='' && userdata.phoneNumber!=null)
					 {
						  var phoneData	=  {
													"primary" : true,
													"type" : "mobile",
													"data" : userdata.phoneNumber
											}
					 	plaidphoneNumbers.push(phoneData);
					 }

					 var userAddress='';
					 var userCity='';
					 var userzipCode='';
					 var userState='other';
					 if ("undefined" !== typeof data.address && data.address!='' && data.address!=null)
					 {
						  var userAddress = data.address;
					 }

					 if ("undefined" !== typeof data.street && data.street!='' && data.street!=null)
					 {
						 var userAddress = data.street;
					 }

					 if ("undefined" !== typeof data.city && data.city!='' && data.city!=null)
					 {
						  var userCity = data.city;
					 }

					 if ("undefined" !== typeof data.zipCode && data.zipCode!='' && data.zipCode!=null)
					 {
						  var userzipCode = data.zipCode;
					 }

					  State
			 		 .findOne({id: data.state})
			 		 .then(function (stateData) {

						  if(stateData)
						  {
							  if(stateData.id)
		 					  {
						 	 	var userState = stateData.stateCode;
							  }
						  }
						  var plaidAddressData = {
													"primary" : true,
													"data" : {
															"street" : userAddress,
															"city" : userCity,
															"state" : userState,
															"zip" : userzipCode
													}
											}
						 plaidAddress.push(plaidAddressData);

						 plaidDetails.names = plaidNames;
						 plaidDetails.emails = plaidEmails;
						 plaidDetails.phoneNumbers = plaidphoneNumbers;
						 plaidDetails.addresses = plaidAddress;
						 plaidDetails.isuserInput = 2;

						 plaidDetails.save(function (err) {
							if (err) {
							  sails.log.error("PlaidUser#checkUserPlaidDetails:: err : ", err);

							  return reject({
								code: 500,
								message: 'INTERNAL_SERVER_ERROR'
							  });
							}
							return resolve(plaidDetails);
					    });
					});
				}
				else
				{
					return resolve(plaidDetails);
				}
			}
			else
			{
				 sails.log.error("PlaidUser#checkUserPlaidDetails:: err :: Invalid plaid details");
				 return reject({
				  code: 400,
				  message: 'Invalid plaid details'
				});
			}
	 })
	 .catch(function(err) {
		sails.log.error("PlaidUser#checkUserPlaidDetails:: err : ", err);
		return reject({
            code: 500,
            message: 'INTERNAL_SERVER_ERROR'
        });
	});
  });
}