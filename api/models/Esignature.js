/**
 * Esignature.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var Q = require('q'),
	moment = require('moment'),
	bcrypt = require('bcrypt');

module.exports = {

	attributes: {
		user_id: {
			model: 'User'
		},
		full_name: {
			type: 'string'
		},
		initial: {
			type: 'string'
		},
		email: {
			type: 'string'
		},
		ip_address: {
			type: 'string'
		},
		device: {
			type: 'string'
		},
		signature: {
			type: 'string'
		},
		password: {
			type: 'text'
		},
		active: {
			type: 'integer',
			defaultsTo: 0
		},
		screentracking: {
			model: 'Screentracking'
		},
		consentID:{
			model: 'UserConsent'
		},
		account: {
			model: 'Account'
		}
	},
  saveSignature: saveSignature,
  generateEncryptedPassword: generateEncryptedPassword,
};

function saveSignature(data) {
  return Q.promise(function(resolve, reject) {

	User.findOne({id:data.user_id})
	.then(function(userinfo){
		 data.email = userinfo.email;
		  Esignature.create(data)
		  .then(function(esignature) {
			return resolve(esignature);
		  })
		  .catch(function(err) {
			return reject(err);
		  });
	  });
  });
}

function generateEncryptedPassword(password, salt) {
  return Q.promise(function(resolve, reject) {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
        if (err) {
          return reject(err);
        } else {
		  return resolve(hash.toString('hex'));
        }
      });
    });
  });
}