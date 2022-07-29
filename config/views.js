/* global sails */
/**
 * View Engine Configuration
 * (sails.config.views)
 *
 * Server-sent views are a classic and effective way to get your app up
 * and running. Views are normally served from controllers.  Below, you can
 * configure your templating language/framework of choice and configure
 * Sails' layout support.
 *
 * For more information on views and layouts, check out:
 * http://sailsjs.org/#!/documentation/concepts/Views
 */

const moment = require( "moment" );
const nunjucks = require( "nunjucks" );

module.exports.views = {

  /****************************************************************************
  *                                                                           *
  * View engine (aka template language) to use for your app's *server-side*   *
  * views                                                                     *
  *                                                                           *
  * Sails+Express supports all view engines which implement TJ Holowaychuk's  *
  * `consolidate.js`, including, but not limited to:                          *
  *                                                                           *
  * ejs, jade, handlebars, mustache underscore, hogan, haml, haml-coffee,     *
  * dust atpl, eco, ect, jazz, jqtpl, JUST, liquor, QEJS, swig, templayed,    *
  * toffee, walrus, & whiskers                                                *
  *                                                                           *
  * For more options, check out the docs:                                     *
  * https://github.com/balderdashy/sails-wiki/blob/0.9/config.views.md#engine *
  *                                                                           *
  ****************************************************************************/

//   engine: 'nunjucks',
	engine: {
		ext: "nunjucks",
		fn: function( str, options, fn ) {
			const env = nunjucks.configure( "views", {
				autoescape: false,
				// throwOnUndefined: false,
				// trimBlocks: true,
				// lstripBlocks: true,
				express: sails.hooks.http.app,
				// watch: false,
				noCache: true,
				// web: {
				// 	useCache: false,
				// 	async: false
				// }
			} );
			env.addGlobal( "moment", moment );
			env.addGlobal( "isArray", Array.isArray );
			env.addGlobal( "LenderShortName", sails.config.lender.shortName );
			env.addGlobal( "LenderLongName", sails.config.lender.longName );
			env.addGlobal( "LenderEmailAddress", sails.config.lender.emailAddress );
			env.addGlobal( "LenderPhone", sails.config.lender.phone );
			env.addGlobal( "LenderIcon4", sails.config.lender.icon4 );
			env.addGlobal( "LenderIcon3", sails.config.lender.icon3 );
			env.addGlobal( "LenderLogo", sails.config.lender.logo );
			env.addGlobal( "LenderWebAddress", sails.config.lender.webAddress );
			env.addGlobal( "LenderMailingAddress", sails.config.lender.mailingAddress );
			env.addGlobal( "LmsPhone", sails.config.lms.phone );
			env.addGlobal( "LmsMailingAddress", sails.config.lms.mailingAddress );
			env.addGlobal( "LmsShortName", sails.config.lms.shortName );
			env.addGlobal( "LmsWebAddress", sails.config.lms.webAddress );
			env.addGlobal( "BureauLongName", sails.config.bureau.longName );
			env.addGlobal( "BureauShortName", sails.config.bureau.shortName );
			env.addGlobal( "BureauPhone", sails.config.bureau.phone );
			env.addGlobal( "BureauWebAddress", sails.config.bureau.webAddress );
			env.addGlobal( "BureauMailingAddress", sails.config.bureau.mailingAddress );
			env.addFilter( "$format", Utils.$format );
			env.addFilter( "$formatNL", Utils.$formatNL );
			env.addFilter( "date", ( date, strFormat ) => moment( date ).format( strFormat ) );
			env.addFilter( "float", ( str ) => parseFloat( `${str}`.replace( /[^0-9.]/g, "" ) ) );
			env.addFilter( "int", ( str ) => parseInt( `${str}`.replace( /[^0-9]/g, "" ) ) );
			env.addFilter( "stringify", ( str ) => JSON.stringify( str ) );
			env.addFilter( "phoneformat", Utils.phoneformat );
			env.render( str, options, fn );
		}
	},


  /****************************************************************************
  *                                                                           *
  * Layouts are simply top-level HTML templates you can use as wrappers for   *
  * your server-side views. If you're using ejs or jade, you can take         *
  * advantage of Sails' built-in `layout` support.                            *
  *                                                                           *
  * When using a layout, when one of your views is served, it is injected     *
  * into the `body` partial defined in the layout. This lets you reuse header *
  * and footer logic between views.                                           *
  *                                                                           *
  * NOTE: Layout support is only implemented for the `ejs` view engine!       *
  *       For most other engines, it is not necessary, since they implement   *
  *       partials/layouts themselves. In those cases, this config will be    *
  *       silently ignored.                                                   *
  *                                                                           *
  * The `layout` setting may be set to one of the following:                  *
  *                                                                           *
  * If `false`, layouts will be disabled. Otherwise, if a string is           *
  * specified, it will be interpreted as the relative path to your layout     *
  * file from `views/` folder. (the file extension, ".ejs", should be         *
  * omitted)                                                                  *
  *                                                                           *
  ****************************************************************************/

  /****************************************************************************
  *                                                                           *
  * Using Multiple Layouts                                                    *
  *                                                                           *
  * If you're using the default `ejs` or `handlebars` Sails supports the use  *
  * of multiple `layout` files. To take advantage of this, before rendering a *
  * view, override the `layout` local in your controller by setting           *
  * `res.locals.layout`. (this is handy if you parts of your app's UI look    *
  * completely different from each other)                                     *
  *                                                                           *
  * e.g. your default might be                                                *
  * layout: 'layouts/public'                                                  *
  *                                                                           *
  * But you might override that in some of your controllers with:             *
  * layout: 'layouts/internal'                                                *
  *                                                                           *
  ****************************************************************************/

  layout: 'layout',

  /****************************************************************************
  *                                                                           *
  * Partials are simply top-level snippets you can leverage to reuse template *
  * for your server-side views. If you're using handlebars, you can take      *
  * advantage of Sails' built-in `partials` support.                          *
  *                                                                           *
  * If `false` or empty partials will be located in the same folder as views. *
  * Otherwise, if a string is specified, it will be interpreted as the        *
  * relative path to your partial files from `views/` folder.                 *
  *                                                                           *
  ****************************************************************************/

  partials: false


};
