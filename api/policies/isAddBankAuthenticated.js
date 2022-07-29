/* global sails Screentracking */

const _ = require( "lodash" );

module.exports = async function( req, res, next ) {
	let userid;
	try {
		const path1 = "/addbank/login/";
		const path2 = "/addbank/authenticate";
		const path3 = "/addbank/banktransaction";
		const path4 = "/addbank/savebankdata";
		const path5 = "/addbank/consents";
		const path6 = "/addbank/saveconsent/";
		const path7 = "/addbank/thankyou";

		/* check authentication */
		const urlpath = req.path;
		switch( urlpath ) {
			case path2:
				/* let them through */
				return next();
			case path3:
			case path4:
			case path5:
			case path7:
				userid = req.session.userId;
				if( !req.isAuthenticated() || !userid ) {
					throw new Error( "Authentication Required" );
				}
				break;
			default:
				if( urlpath.startsWith( path1 ) ) {
					userid = _.get( req.allParams(), "id", null );
					if( !userid ) {
						throw new Error( "user id required" );
					}
					const screendata = await Screentracking.findOne( { user: userid, addbanklastlevel: { "!": null } } );
					if( !screendata ) {
						const screendataList = await Screentracking.find( { user: userid } ).sort( "createdAt DESC" );
						if( screendataList.length == 0 ) {
							/* This user has never applied.   They need to do the regulare LOS */
							return res.redirect( "/apply" );
						}
						/* Make sure there is a screentracking record that has addbanklastlevel set */
						await Screentracking.update( { id: screendataList[ 0 ].id }, { addbanklastlevel: 1 } );
					}
					/* let them through */
					return next();
				} else if( urlpath.startsWith( path6 ) ) {
					userid = req.session.userId;
					if( !req.isAuthenticated() || !userid ) {
						throw new Error( "Authentication Required" );
					}
				} else {
					throw new Error( "unknown add bank path" );
				}
		}

		sails.log.info( "JH isAddBankAuthenticated.js userid", userid );

		const screendata = await Screentracking.findOne( { user: userid, addbanklastlevel: { "!": null } } );
		if( !screendata ) {
			throw new Error( "addbank must be started with an addbank login" );
		}
		req.session.screentrackingId = screendata.id;
		req.session.programId = screendata.schoolprogram;
		const level = screendata.addbanklastlevel;
		sails.log.info( "isAddBankAuthenticated; level::: ", level );
		switch( level ) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 7:
				if( ( urlpath == path2 ) || ( urlpath == path3 ) || ( urlpath == path4 ) || ( urlpath == path7 ) ) {
					return next();
				}
				return res.redirect( path3 );
			case 5:
			case 6:
				if( ( urlpath == path5 ) || urlpath.startsWith( path6 ) ) {
					return next();
				}
				return res.redirect( path5 );

			default:
				throw new Error( "unexpected path" );
		}
	} catch ( err ) {
		return res.redirect( "/dashboard" );
	}
};
