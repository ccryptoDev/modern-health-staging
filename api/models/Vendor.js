/**
 * Vendor.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
	vendorName: {
      type: 'string'
    },
	paymentType:{
		type: 'string'
    },
	APRMonthly:{
		type: 'json',
      	defaultsTo: {}
    },
	isDeleted: {
	  type: 'boolean',
	  defaultsTo: false
	}
  },

};

