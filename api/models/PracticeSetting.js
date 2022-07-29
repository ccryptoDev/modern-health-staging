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
	SettingName: {
      type: 'String'
    },
  settings: {
      type: 'json',
      defaultsTo: {}
    },
  isDefault: {
      type: 'boolean',
      defaultsTo: false
  },
  isDeleted: {
    type: 'boolean',
    defaultsTo: false
  },
  denySpecificTiers: {
    type: 'boolean',
    defaultsTo: false
  },
  transunion: {
    type: 'boolean',
    defaultsTo: true
  },
  productRules: {
    type: 'json',
    defaultsTo: {}
  },
  btrs: {
    type: 'json',
    defaultsTo: {}
  },
  },
};

