/* global sails, User, Utils, Screentracking, Esignature, S3Service */
/**
 * EsignatureController
 *
 * @description :: Server-side logic for managing Esignatures
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 
'use strict';

var request = require('request'),
  moment = require('moment'),
  uuid = require('node-uuid'),
  md5 = require('md5');

var crypto   = require('crypto');
 
module.exports = {
	saveSignature: saveSignature,
};

function decodeBase64Image(dataString) 
{
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  var response = {};

  if (matches.length !== 3) 
  {
	return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

function saveSignature( req, res ) {
	const userid = req.session.userId;
	sails.log.info( "JH EsignatureController.js saveSignatureAction userid: ", userid );

	const remoteAddress = ( req.headers[ "x-forwarded-for" ] || req.headers[ "x-real-ip" ] || req.connection.remoteAddress ).replace( "::ffff:", "" ).replace( /^::1$/, "127.0.0.1" );
	const userAgent = req.headers[ "user-agent" ];
	const hiddensignatureid = req.param( "hiddensignatureid" );
	sails.log.info( "hiddensignatureid", hiddensignatureid );
	const tplData = {};

	User.findOne( { id: userid } )
	.then( function( userData ) {
		if( ! userData ) {
			const responseData = {
				status: 400,
				message: "Error:: Invalid screentracking details"
			};
			res.contentType( "application/json" );
			res.json( responseData );
		}
		tplData.userReference = userData.userReference;
		tplData.firstname = userData.firstname;
		tplData.lastname = userData.lastname;

		return Screentracking.findOne( { user: userid, iscompleted: 0 } );
	} )
	.then( ( screentrackingData ) => {
		if( screentrackingData ) {
			return screentrackingData;
		}
		return Screentracking.find( { user: userid } ).sort( "createdAt DESC" )
		.then( ( screenList ) => {
			if( screenList.length > 0 ) {
				return screenList[ 0 ];
			}
			return null;
		} );
	} )
	.then( function( screentrackingData ) {
		if( ! screentrackingData ) {
			const responseData = {
				status: 400,
				message: "Error:: Invalid screentracking details"
			};
			res.contentType( "application/json" );
			res.json( responseData );
		}
		tplData.screenID = screentrackingData.id;
		tplData.applicationReference = screentrackingData.applicationReference;

		let account;
		try {
			const imageTypeRegularExpression = /\/(.*?)$/;
			const crypto = require( "crypto" );
			const seed = crypto.randomBytes( 20 );
			const uniqueSHA1String = crypto.createHash( "sha1" ).update( seed ).digest( "hex" );
			const base64Data = req.param( "imgBase64" );
			const imageBuffer = decodeBase64Image( base64Data );
			let esignatureType = "";
			if( req.param( "esignatureType" ) == 2 ) {
				esignatureType = 13;
			} else if( req.param( "esignatureType" ) == 1 ) {
				esignatureType = 12;
			} else if( req.param( "esignatureType" ) == 3 ) {
				esignatureType = 14;
				account = req.param( "accountID" );

			} else {
				esignatureType = 10;
			}

			const userUploadedFeedMessagesLocation = sails.config.appPath + "/assets/images/signatures/";
			const uniqueRandomImageName = "image-" + uniqueSHA1String;
			const imageTypeDetected = imageBuffer.type.match( imageTypeRegularExpression );
			const userUploadedImagePath = userUploadedFeedMessagesLocation + uniqueRandomImageName + "." + imageTypeDetected[ 1 ];

			try {
				if( "undefined" === typeof hiddensignatureid || hiddensignatureid == "" || hiddensignatureid == null ) {
					require( "fs" ).writeFileSync( userUploadedImagePath, imageBuffer.data );
				}
				const signatureArray = {
					"user_id": userid,
					"full_name": tplData.firstname + tplData.lastname,
					"ip_address": remoteAddress,
					"device": userAgent,
					"localPath": userUploadedImagePath,
					"signature": uniqueRandomImageName + "." + imageTypeDetected[ 1 ],
					"active": 1,
					"type": esignatureType,
					"screentracking": tplData.screenID
				};
				if( account ) {
					/* An EFTA signature may have an account number associated with it if there can be more than one bank */
					signatureArray.account = account;
				}
				// sails.log.info( "signatureArray: ", signatureArray );
				if( hiddensignatureid != "" ) {
					const updateParams = {
						active: 1,
						full_name: tplData.firstname,
						initial: tplData.lastname,
						ip_address: remoteAddress,
						device: userAgent
					};
					Esignature.update( { id: hiddensignatureid }, updateParams )
					.exec( function afterwards( err, updated ) {
						if( err ) {
							const responseData = {
								status: 400,
								message: "Error:: Unable to update signature details"
							};
							res.contentType( "application/json" );
							res.json( responseData );
						}
						const responseData = {
							status: 200,
							message: "Signature updated successfully",
							signatureid: hiddensignatureid
						};
						res.contentType( "application/json" );
						res.json( responseData );
					} );
				} else {
					Esignature.saveSignature( signatureArray )
					.then( function( signatureData ) {
						if( ! signatureData ) {
							const responseData = {
								status: 400,
								message: "Error:: Invalid singaturedetails"
							};
							res.contentType( "application/json" );
							res.json( responseData );
						}
						const signatureid = signatureData.id;
						// Move the file to s3 bucket
						S3Service.uploadAsset( signatureData, tplData.userReference, tplData.applicationReference )
						.then( function( uploadData ) {
							Screentracking.update( { id: tplData.screenID }, { esignature: signatureid } )
							.exec( function afterwards( err, updated ) {
								const signCriteria = { screentracking: tplData.screenID, active: 1 };
								Esignature.findOne( signCriteria )
								.sort( "createdAt DESC" )
								.then( function( signatureData ) {
									let agreementsignpath = "";

									if( "undefined" !== typeof signatureData && signatureData != "" && signatureData != null ) {
										agreementsignpath = Utils.getS3Url( signatureData.standardResolution );
									}

									const responseData = {
										status: 200,
										message: "Signature created successfully",
										signatureid: signatureid,
										agreementsignpath: agreementsignpath
									};
									res.contentType( "application/json" );
									res.json( responseData );
								} );
							} );
						} );
					} ).catch( function( err ) {
						const responseData = {
							status: 400,
							message: "Unable to save singature: Error:: " + err
						};
						res.contentType( "application/json" );
						res.json( responseData );
					} );
				}
			} catch ( error ) {
				const responseData = {
					status: 400,
					message: "Unable to create singature: Error:: " + error
				};
				res.contentType( "application/json" );
				res.json( responseData );
			}
		} catch ( error ) {
			const responseData = {
				status: 400,
				message: "Unable to create singature: Error:: " + error
			};
			res.contentType( "application/json" );
			res.json( responseData );
		}
	} ).catch( function( err ) {
		const responseData = {
			status: 400,
			message: "Unable to fetch user details"
		};
		res.contentType( "application/json" );
		res.json( responseData );
	} );
}
