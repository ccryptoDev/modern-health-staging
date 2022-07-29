/**
 * Cities.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
	city: {
      type: "string"
    },
	city_ascii: {
      type: "string"
    },
	state_code: {
      type: "string"
    },
	state_name: {
      type: "string"
    },
	county_fips: {
      type: "integer"
    },
	county_name: {
      type: "string"
    },  
	latitude: {
      type: "Point"
    },  
	longitude: {
      type: "Point"
    },
	timezone: {
      type: "string"
    }
  },

};

