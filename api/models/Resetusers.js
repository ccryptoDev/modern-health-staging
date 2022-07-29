/**
 * Resetusers.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    deviceId: {
      type: "string"
    },
    timeZone: {
      type: "string"
    },
    isDeleted: {
      type: 'boolean',
      defaultsTo: false
    },
    smsNotificationStatus: {
      type: 'boolean',
      defaultsTo: true
    },
    dateOfBirth: {
      type: 'string'
    },
    systemUniqueKey: {
      type: "string",
      defaultsTo: ""
    },
    deviceData: {
      type: 'json',
      defaultsTo: {}
    },
    isEmailVerified: {
      type: 'boolean',
      defaultsTo: false
    },
    phoneNumber: {
      type: "string"
    },
    screenName: {
      type: "string"
    },
    isExistingUser: {
      type: "boolean",
      defaultsTo: false
    },
    isUserCreatedStory: {
      type: 'boolean',
      defaultsTo: 'false'
    },
    isPhoneVerified: {
      type: 'boolean',
      defaultsTo: 'false'
    },
    isScreenNameSet: {
      type: 'boolean',
      defaultsTo: 'false'
    },
    isExistingLoan: {
      type: 'boolean',
      defaultsTo: 'false'
    },
    isUserProfileUpdated: {
      type: 'boolean',
      defaultsTo: 'false'
    },
    isBankAdded: {
      type: 'boolean',
      defaultsTo: 'false'
    },
    name: {
      type: 'string'
    },
    email: {
      type: 'string'
    },
    address: {
      type: 'string'
    },
    street: {
      type: 'string'
    },
    city: {
      type: 'string'
    },
    zipCode: {
      type: 'string'
    },
    profilePicture: {
      model: 'Asset'
    },
   /* messages: {
      collection: 'Messages',
      via: 'user'
    },
    userConsent: {
      collection: 'UserConsent',
      via: 'user'
    },*/
   /* university: {
      model: 'University'
    },*/
    password: {
      type: 'text'
    },
    salt: {
      type: 'text'
    },
    state: {
      model: 'State'
    },
    isValidEmail: {
      type: 'boolean',
      defaultsTo: false
    },
    isValidState: {
      type: 'boolean',
      defaultsTo: false
    },
    //toUserApi: toUserApi,
    //toUserProfileApi: toUserProfileApi,
	latitude: {
      type: 'string'
    },
	longitude: {
      type: 'string'
    },
	userReference: {
      type: "string"
    },
	devicetoken: {
      type: 'string'
    },
	notify: {
      type: 'integer',
      defaultsTo: 1
    },
	loggedin: {
      type: 'integer',
      defaultsTo: 1
    },
	registeredtype:{
	  type: 'string',
      defaultsTo: 'signup'
	},
	appversion:{
	  type: 'string',
      defaultsTo: ''
	},
	socialnetworktype:{
	  type: 'string',
      defaultsTo: ''	
	},
	socialnetworkid:{
	  type: 'string',
      defaultsTo: ''
	},
	socialregisteredtype:{
	  type: 'string',
      defaultsTo: ''
	},
	allowsocialnetwork:{
	  type: 'integer',
      defaultsTo: 0
	},
	systemVersion:{
	  type: 'string',
      defaultsTo: ''
	},
	refferalCompleted:{
	  type: 'integer',
      defaultsTo: 0
	},
	makeloanBlocked:{
	  type: 'integer',
      defaultsTo: 0
	},
	loanBlockedData: {
     	type:'json',
		defaultsTo: {}
    },
  practicemanagement: {
      model: 'PracticeManagement'
    },
  }
};

