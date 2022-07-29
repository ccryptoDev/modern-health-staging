/**
 * Productlist.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q'),
  uuid = require('node-uuid'),
  md5 = require('md5'),
  shortid = require('shortid'),
  bcrypt = require('bcrypt');
  
module.exports = {
  attributes: {
	    productname: {
		  type: 'string'
		},
		isDeleted: {
		  type: 'boolean',
		  defaultsTo: false
		},
		mincreditscore: {
		  type: 'string'
		},
		maxcreditscore: {
		  type: 'string'
		},
   }
};

