/**
 * Counters.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q'),
moment = require('moment');

module.exports = {

 attributes: {
	apptype: {
      type: 'String'
    },
    sequence_value: {
      type: 'String'
    },
  },
};

