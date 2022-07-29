/* global sails */
"use strict";

const _ = require('lodash');
const shortid = require('shortid');
const Q = require('q');
const parseAddress = require( "parse-address" );

module.exports = {

  generateReferenceId: generateReferenceId,
  verifyReferenceId: verifyReferenceId,
  getOriginalNameFromUrl: getOriginalNameFromUrl,
  isTimeExpired: isTimeExpired,
  getS3Url: getS3Url,
  strSimilarity: strSimilarity,
  editDistance: editDistance,
  $format: $format,
  $formatNL: $formatNL,
  parseStreetAddress: parseStreetAddress,
  phoneformat: phoneformat
};

/**
 *
 * @returns {String} - Reference ID
 */
function getS3Url(path) {
  if (!path) {
    return "";
  }
  // TODO: Add production config
  //return 'https://s3.amazonaws.com/fluid-assets-staging-processed/' + path;
  //return 'https://s3.amazonaws.com/fluidfitek/' + path;
  //return 'https://s3-us-west-2.amazonaws.com/fluidfitek/' + path;
  return sails.config.s3BaseUrl + path;
}

function generateReferenceId() {
  return shortid.generate();
}

/**
 * Verified whether the short id is valid
 *
 * @param id
 * @returns {Boolean}
 */
function verifyReferenceId(id) {
  return shortid.isValid(id);
}

function getOriginalNameFromUrl(url) {
  if (!url) {
    return "";
  }

  var urlArray = url.split('/');

  return urlArray[urlArray.length - 1];
}

function isTimeExpired(dateString) {
  var emailTokenExpiresOn = moment(dateString);

  if (!emailTokenExpiresOn) {
    return true;
  }
  // get the current time
  var currentTime = moment();

  return emailTokenExpiresOn.diff(currentTime) <= 0;

}


/**
 * similarity using Levenshtein distance
 * @param {string} s1
 * @param {string} s2
 * @return {number} percent similar
 */
function strSimilarity( s1, s2 ) {
	let longer = s1;
	let shorter = s2;
	if( s1.length < s2.length ) {
		longer = s2;
		shorter = s1;
	}
	const longerLength = longer.length;
	if( longerLength == 0 ) {
		return 1.0;
	}
	return ( longerLength - editDistance( longer, shorter ) ) / parseFloat( longerLength );
}


/**
 * Levenshtein distance
 * @param {string} s1
 * @param {string} s2
 * @return {number}
 */
function editDistance( s1, s2 ) {
	s1 = s1.toLowerCase();
	s2 = s2.toLowerCase();
	const costs = [];
	for( let i = 0; i <= s1.length; i++ ) {
		let lastValue = i;
		for( let j = 0; j <= s2.length; j++ ) {
			if( i == 0 ) {
				costs[ j ] = j;
			} else if( j > 0 ) {
				let newValue = costs[ ( j - 1 ) ];
				if( s1.charAt( i - 1 ) != s2.charAt( j - 1 ) ) {
					newValue = ( Math.min( Math.min( newValue, lastValue ), costs[ j ] ) + 1 );
				}
				costs[ ( j - 1 ) ] = lastValue;
				lastValue = newValue;
			}
		}
		if( i > 0 ) {
			costs[ s2.length ] = lastValue;
		}
	}
	return costs[ s2.length ];
}


function _$format( number, currency, decimals, label ) {
	decimals = ( typeof decimals == "number" ? decimals : 2 );
	currency = ( typeof currency == "undefined" || currency );
	if( typeof number == "string" ) {
		number = parseFloat( number.replace( /[^0-9.]/g, "" ) );
	}
	if( typeof number !== "number" ) number = 0;
	const value = number.toLocaleString( "en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals } );
	return ( currency ? label ? `$${value}`: value: value );
}

function $format( number, currency, decimals ) {
	return _$format( number, currency, decimals, true );
}

function $formatNL( number, currency, decimals ) {
	return _$format( number, currency, decimals, false );
}


function parseStreetAddress( address ) {
	const pAddress = parseAddress.parseLocation( address );
	pAddress.number = ( pAddress.number || "" );
	pAddress.prefix = ( pAddress.prefix || "" );
	pAddress.street = ( pAddress.street || "" );
	pAddress.type = ( pAddress.type || "" );
	pAddress.sec_unit_type = ( pAddress.sec_unit_type || "" );
	pAddress.sec_unit_num = ( pAddress.sec_unit_num || "" );
	sails.log.debug( "parseStreetAddress;", pAddress );
	return pAddress;
}

function phoneformat( rawNumber ) {
	const cleaned = ( "" + rawNumber ).replace( /\D/g, "" );
	const match = cleaned.match( /^(\d{3})(\d{3})(\d{4})$/ );
	if( match ) {
		return "(" + match[ 1 ] + ") " + match[ 2 ] + "-" + match[ 3 ];
	}
	return null;
}
