/**
 * Transunionhistory.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
	user: {
      model: 'User'
    },
	requestdata:{
		type:'json',
		defaultsTo: {}
	},
	responsedata:{
		type:'json',
		defaultsTo: {}
	},
	status: {
      type: 'integer',
      defaultsTo: 0
    }
  }
};

