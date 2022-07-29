'use strict';
//Todo:Need to change
module.exports.authy = {
  apiKey: "U8dfAk52plhslCWt5gtlgXCgXW8x4Z7P",
  countryCode: 1,
  locale: "en",
  sandboxUrl: "http://sandbox-api.authy.com",
  productionUrl: "http://api.authy.com",
  via: "sms",
  accountSid:'AC6874f8893fef4712a24b4e82577aef8d',
  accountAuthtoken:'10581c7082b12961fffe9107746f050e',
  clientPhoneNumber:'+12132635843',
  getAuthyUrl: function() {
      //return "http://api.authy.com";
	  return "http://api.authy.com";
  }
};

//-- Sandbox Credentials
/*module.exports.authy = {
  apiKey: "U8dfAk52plhslCWt5gtlgXCgXW8x4Z7P",
  countryCode: 1,
  locale: "en",
  sandboxUrl: "http://sandbox-api.authy.com",
  productionUrl: "http://api.authy.com",
  via: "sms",
  accountSid:'ACbe518eea8eed3f03e2c1146952b970bd',
  accountAuthtoken:'ab0aab8587f04ce6126cd105bb177ff9',
  clientPhoneNumber:'+16105802193',
  getAuthyUrl: function() {
      return "http://sandbox-api.authy.com";
  }
};*/

//-- Live Credentials
/*module.exports.authy = {
  apiKey: "U8dfAk52plhslCWt5gtlgXCgXW8x4Z7P",
  countryCode: 1,
  locale: "en",
  sandboxUrl: "http://sandbox-api.authy.com",
  productionUrl: "http://api.authy.com",
  via: "sms",
  accountSid:'AC1be018517755f7857d826bd00990f3db',
  accountAuthtoken:'9d7a7275c253a8b7f273e4eac89239a1',
  clientPhoneNumber:'+16105802193',
  getAuthyUrl: function() {
      return "http://api.authy.com";
  }
};*/
