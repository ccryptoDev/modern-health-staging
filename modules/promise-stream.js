"use strict";

const crypto = require( "crypto" );
const stream = require( "stream" );

module.exports = {
	createWriteStream
};


/**
 * create write stream
 * @param {Object} options
 * @param {number} options.concurrency
 * @param {function} promiseFn function that returns a promise (invoked per chunk)
 * @return {Object}
 * @example const PromiseStream = require( "promise-stream" );
 * @example const pStream = PromiseStream.createWriteStream( { "concurrency": 200 }, promiseFn );
 * @example readStream.pipe( pStream )
 * @example return pStream.promise()
 */
function createWriteStream( options, promiseFn ) {
	const Promise = require( "bluebird" );
	if( typeof promiseFn !== "function" ) {
		promiseFn = () => {
			return Promise.resolve();
		};
	}
	const concurrency = Math.max( ( parseInt( options.concurrency ) || 5 ), 1 );
	const buffer = {};
	const waiting = [];
	let counter = 0;
	let isFinished = false;
	let resolve;
	let reject;
	const promise = new Promise( ( _resolve, _reject ) => {
		resolve = _resolve;
		reject = _reject;
	} );
	// console.log( `PromiseStream; concurrency: ${concurrency}` );
	const writeStream = new stream.Transform( { objectMode: true, highWaterMark: concurrency } );
	writeStream.promise = function _promise() {
		return promise.finally( () => {
			// console.log( "counter:", counter );
			writeStream.removeListener( "error", onError );
			writeStream.removeListener( "finish", didFinish );
		} );
	};
	writeStream._write = function _write( chunk, encoding, callback ) {
		if( Object.keys( buffer ).length < concurrency ) {
			next( chunk, callback );
			return true;
		}
		waiting.push( { chunk, callback } );
		return false;
	};
	writeStream.on( "error", onError );
	writeStream.on( "finish", didFinish );
	return writeStream;

	function next( chunk, callback ) {
		++counter;
		const pid = crypto.randomBytes( 6 ).toString( "hex" );
		buffer[ pid ] = Promise.resolve()
		.then( () => {
			return promiseFn( chunk );
		} )
		.then( () => {
			callback( null );
		} )
		.catch( ( err ) => {
			console.error( "catch:", err );
			callback( err, null );
		} )
		.finally( () => {
			delete buffer[ pid ];
			if( promise.isFulfilled() ) {
				return;
			}
			if( waiting.length > 0 ) {
				const item = waiting.shift();
				next( item.chunk, item.callback );
				return;
			}
			// console.log( "waiting.length:", waiting.length );
			// console.log( "buffer.length:", Object.keys( buffer ).length );
			if( isFinished && Object.keys( buffer ).length === 0 ) {
				return resolve();
			}
		} );
	}


	function onError( err ) {
		// console.log( "writeStream.error;", err );
		isFinished = true;
		return reject( err );
	}


	function didFinish() {
		// console.log( "writeStream.finish;" );
		isFinished = true;
		if( waiting.length === 0 && Object.keys( buffer ).length === 0 && ! promise.isFulfilled() ) {
			return resolve();
		}
	}
}
