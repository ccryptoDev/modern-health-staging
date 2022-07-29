/**
 * Loangradesettings.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
	gradelevel: {
      type: 'string'
  	},
	gradeterm:{
	  type: 'integer'
	},
	minimumamount: {
      type: 'string'
  	},
	maximumamount: {
      type: 'string'
  	},
	minimuminterest: {
      type: 'string'
  	},
	maximuminterest: {
       type: 'string'
    },
	maxloanamount:{
		type: 'string'
	}
  },

};

