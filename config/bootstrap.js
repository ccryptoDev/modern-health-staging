/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function( cb ) {
	// It's very important to trigger this callback method when you are finished
	// with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
	process.env.TZ = "UTC";

	// polyfill Number.prototype.toFixed()
	( 1.005 ).toFixed( 2 ) == "1.01" || ( function( prototype ) {
		prototype.__toFixed = prototype.toFixed;
		prototype.toFixed = function( precision ) {
			return ( this + 0.0000001 ).__toFixed( precision );
		};
	} )( Number.prototype );

	cb();
};
