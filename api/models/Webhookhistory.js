/**
 * Webhookhistory.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
 
var Q = require('q'),
  moment = require('moment'),
  shortid = require('shortid');

module.exports = {

  attributes: {
	 item_id:{
		type: 'string'
	 },
	 methodtype:{
		type: 'string'
	 },
	 data:{
		type:'json',
      	defaultsTo: {}
	 },
	 webhookstatus:{
		 type: 'integer',
      	 defaultsTo: 0
	 },
	 isDeleted: {
	  type: 'boolean',
	  defaultsTo: false
	 }
  }
};

