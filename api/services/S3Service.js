/* global sails, Utils */
'use strict';

var request = require('request'),
  _ = require('lodash'),
  conf = sails.config,
  Q = require('q'),
  fs = require('fs'),
  s3Client = conf.s3Client,
  s3ClientUploader = conf.s3ClientUploader;

const AWS = require( "aws-sdk" );
AWS.config.update( {
	accessKeyId: conf.s3Config.key,
	secretAccessKey: conf.s3Config.secret,
	region: conf.s3Config.region,
	bucket: conf.s3Config.bucket
} );
const s3 = new AWS.S3();

module.exports = {
  createGuideResources: createGuideResources,
  putScreenshot: putScreenshot,
  syncProfilePicture: syncProfilePicture,
  uploadLocalToolImage: uploadLocalToolImage,
  uploadAsset: uploadAsset,
  uploadAgreementAsset:uploadAgreementAsset,
  uploadPromissoryAgreementAsset:uploadPromissoryAgreementAsset,
  reuploadPromissoryAgreementAsset:reuploadPromissoryAgreementAsset,
  uploadTermsPdf: uploadTermsPdf,
  uploadViking:uploadVikingAction,
  uploadUserprofile:uploadUserprofileAction,
  uploadEftPdf:uploadEftPdf,
  uploadFileToS3: uploadFileToS3
};

/**
 * upload's a local image to S3
 * Returns S3 path for the image
 * @param localPath
 */
function uploadLocalToolImage() {

  // get the local path
  // upload the resource to S3
  // log the status
  // update the entity with s3 url (probably boolean)
}

function createGuideResources(mediaType, mediaId, mediaObject, assetId, uploadedType) {
  var promises = [];
  // check if uploaded type is disk
  if (uploadedType && uploadedType === 'disk') {
    promises.push(uploadDiskImage(mediaType, mediaId, mediaObject, assetId));
  } else {
    // convert the mediaobject to valid object
    var media = JSON.parse(mediaObject);
    // loop on each mediaObject and upload to s3
    _.forEach(media, function (url, resourceType) {
      promises.push(createAsset(mediaId, mediaType, resourceType, url, assetId));
    });
  }

  return Q.all(promises);
}
function uploadDiskImage(mediaType, mediaId, mediaObject, assetId) {
  return Q.promise(function (resolve, reject) {
    // generate buffer from the data uri
    var imageBuffer = new Buffer(mediaObject.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    var mediaExtension = '.jpg',
      timestamp = new Date().getUTCMilliseconds(),
      fileName,
      s3Directory,
      mediaFolder = 'images/uploaded',
      s3Path;


    s3Directory = mediaFolder + '/';
    fileName = timestamp + '_' + mediaId + mediaExtension;
    s3Path = s3Directory + fileName;

    var req = s3ClientUploader.put(s3Path, {
      'Content-Length': imageBuffer.length,
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'max-age=604800',
      'x-amz-acl': 'public-read'
    });
    req.on('response', function (res) {
      if (200 === res.statusCode) {
        var updatedAsset = {
          // update the asset with guessed urls
          lowResolution: 'images/lowResolution/' + fileName,
          standardResolution: 'images/standardResolution/' + fileName,
          thumbnail: 'images/thumbnail/' + fileName
        };
        Asset.update({'id': assetId}, updatedAsset)
          .then(function (asset) {
            sails.log.info('s3Service#createAsset : Successfully Updated Asset - Asset - ', asset);

            resolve(asset);
          }, function (err) {
            sails.log.error('s3Service#createAsset : Error in creating Asset entity - Error - ', err);
            sails.log.error('s3Service#createAsset : - updatedAsset - ', updatedAsset);
            sails.log.error('s3Service#createAsset : - assetId - ', assetId);

            reject(err);
          });
      }
    });

    req.on('error', function (err) {
      reject(err);
    });
    req.end(imageBuffer);
  });
}

function createAsset(mediaId, mediaType, resourceType, url, assetId) {

  return Q.promise(function (resolve, reject) {
    var mediaExtension = getExensionFromUrl(url),
      timestamp = new Date().getUTCMilliseconds(),
      fileName,
      s3Directory,
      mediaFolder,
      s3Path;

    // create a file name
    if (mediaType === 'image') {
      mediaFolder = 'images';
    } else if (mediaType === 'video') {
      mediaFolder = 'videos';
    }

    s3Directory = mediaFolder + '/' + resourceType + '/';
    fileName = timestamp + '_' + mediaId + mediaExtension;
    s3Path = s3Directory + fileName;

    streamFileToS3(url, s3Path).then(updateAsset, throwError);

    function updateAsset() {
      var updatedAsset = {};
      updatedAsset[resourceType] = s3Path;
      // update asset entity
      Asset.update({'id': assetId}, updatedAsset)
        .then(function (asset) {
          sails.log.info('s3Service#createAsset : Successfully Updated Asset - Asset - ', asset);

          resolve(asset);
        }, function (err) {
          sails.log.error('s3Service#createAsset : Error in creating Asset entity - Error - ', err);
          sails.log.error('s3Service#createAsset : - updatedAsset - ', updatedAsset);
          sails.log.error('s3Service#createAsset : - assetId - ', assetId);

          reject(err);
        });
    }

    function throwError(err) {
      sails.log.info('s3Service#createAsset : File not uploaded to S3 - Error- ', err);

      reject(err);
    }
  });
}
function getExensionFromUrl(url) {
  return (url = url.substr(1 + url.lastIndexOf("/")).split('?')[0]).substr(url.lastIndexOf("."));
}

function streamFileToS3(fileResource, s3Path) {
  return Q.promise(function (resolve, reject) {
    request
      .get(fileResource)
      .on('error', onError)
      .on('response', onResponse);

    function onError(err) {
      sails.log.error('s3Service#streamFileToS3 : Error in getting instagram media:', fileResource, '  - Error - ', err);
      reject(err);
    }

    function onResponse(response) {
      var headers = {
        'Content-Length': response.headers['content-length'],
        'Content-Type': response.headers['content-type'],
        'Cache-Control': 'max-age=604800',
        'x-amz-acl': 'public-read'
      };
      var s3Request = s3Client.putStream(response, s3Path, headers, s3Response);

      function s3Response(err, res) {
        if (err) {
          sails.log.error('s3Service#streamFileToS3 : Error in putStream:  - Error - ', err);
          reject(err);
        }
        res.resume();
        resolve(res);
      }

      s3Request.on('error', function (err) {
        reject(err);
        sails.log.error('s3Service#streamFileToS3 : Error in putStream:  - Error - ', err);
      });

      s3Request.on('response', function () {
        sails.log.info('s3Service#streamFileToS3 : Uploaded resource to s3:  - Response - ');
        sails.log.info('s3Service#streamFileToS3 : - URL - ', s3Request.url);
      });
    }
  });
}

function putScreenshot(fileName, filePath, guide) {
  // check if guide has already a screenshot
  if (guide.screenshot) {
    // delete the screenshot and perform put operation
    s3Client
      .del(guide.screenshot)
      .on('response', function (res) {
        sails.log.info('s3Service#putScreenshot : Deleting old screenshot from S3 done:  - Response - ');
        sails.log.info('statusCode', res.statusCode);
        sails.log.info('headers', res.headers);
      })
      .end();
  }
  // or just perform put operation
  var headers = {
    'Content-Type': 'image/png',
    'Cache-Control': 'max-age=604800',
    'x-amz-acl': 'public-read'
  };

  s3Client
    .putFile(filePath, filePath, headers, function (err, res) {
      if (err) {
        sails.log.error('s3Service#putScreenshot - Error - ', err);
      }
      sails.log.info('s3Service#putScreenshot : Uploading resource to s3 done:  - Response - ');
      // on succesfull upload remove file from filesystem
      // fs.unlink(filePath, function (err) {
      //   if (err) {
      //     sails.log.error('s3Service#putScreenshot - Error deleting screenshot - ', err);
      //   }
      // });
      res.resume();
    });

  return;
}

function syncProfilePicture(resource, instagramId) {
  var timestamp = new Date().getUTCMilliseconds(),
    randomString = HelperService.generateRandomString(),
    mediaExtension = getExensionFromUrl(resource),
    fileName = instagramId + '-' + randomString + '-' + timestamp + mediaExtension;
  var s3Path = 'profilePictures/' + fileName;
  request
    .get(resource)
    .on('error', onError)
    .on('response', onResponse);

  function onError(err) {
    sails.log.error('s3Service#syncProfilePicture: Error in getting instagram profile picture:', resource, '  - Error - ', err);
  }

  function onResponse(response) {
    var headers = {
      'Content-Length': response.headers['content-length'],
      'Content-Type': response.headers['content-type'],
      'Cache-Control': 'max-age=604800',
      'x-amz-acl': 'public-read'
    };
    var s3Request = s3Client.putStream(response, s3Path, headers, s3Response);

    function s3Response(err, res) {
      if (err) {
        sails.log.error('s3Service#syncProfilePicture : Error in putStream:  - Error - ', err);
      } else {
        res.resume();
      }
    }

    s3Request.on('error', function (err) {
      sails.log.error('s3Service#syncProfilePicture : Error in putStream:  - Error - ', err);
    });

    s3Request.on('response', function () {
      sails.log.info('s3Service#syncProfilePicture : Uploaded resource to s3:  - Response - ');
      sails.log.info('s3Service#syncProfilePicture : - URL - ', s3Request.url);
    });
  }

  return s3Path;
}



function uploadUserprofileAction(asset,userReference,userid) 
{
   return Q.promise(function (resolve, reject) {

      //var user_id = req.session.userId;
     // sails.log.info('user_id',user_id);
      var fileName = Utils.getOriginalNameFromUrl(asset.localPath);
      // upload to s3
      var s3Folder = getS3MediaFolderForAsset(asset);


      var s3Path = s3Folder + "/" + userReference + "/" + fileName;
      // sails.log.info('s3Path:::', s3Path);

      var imagePaths = s3Folder + "/" + userReference + "/" + fileName;

      var fileNameArray =fileName.split('.');
      var fileExtension =fileNameArray.pop();

      if(fileExtension=='pdf' || fileExtension=='PDF')
      {
        var headers = {
          'Content-Type': 'application/pdf',
          'Cache-Control': 'max-age=604800',
          'x-amz-acl': 'public-read'
        };
      }
      else
      { 
        // or just perform put operation
        var headers = {
          'Content-Type': 'image/png',
          'Cache-Control': 'max-age=604800',
          'x-amz-acl': 'public-read'
        };
      }

      s3Client
      .putFile(asset.localPath, s3Path, headers, function (err, res) {
        if (err) {
          sails.log.error('s3Service#uploadAsset - Error - ', err);
        }
        sails.log.info('s3Service#uploadAsset : Uploading resource to s3 done:  - Response - ',s3Path);
    

      sails.log.info('imagePaths:::', imagePaths);
    
        asset.standardResolution = imagePaths;
        asset.isImageProcessed = true;
        User.update({id: userid}, {userprofile: Utils.getS3Url(imagePaths)})
        .exec(function afterwards(err, updated){
        });

        // save asset
        asset.save(function (err) {
          if (err) {
            sails.log.error("S3Service#uploadAsset :: Error :: ", err);
          } else {
            // on successfull upload remove file from filesystem
            fs.unlink(asset.localPath, function (err) {
              if (err) {
                sails.log.error('s3Service#putScreenshot - Error deleting screenshot - ', err);
              }
            });
          }
        });

        res.resume();
      });


   });  
}


/**
 * This function need to be changed to support different type of assets
 *
 * @param asset Asset
 */
function uploadAsset(asset,userReference,applicationReference) {
  return Q.promise(function (resolve, reject) {
    // get filename
    var fileName = Utils.getOriginalNameFromUrl(asset.localPath);
    // upload to s3
    var s3Folder = getS3MediaFolderForAsset(asset);
	/*sails.log.info('fileName:::', fileName);
	sails.log.info('s3Folder:::', s3Folder);
	sails.log.info('userReference:::', userReference);
	sails.log.info('applicationReference:::', applicationReference);*/
	
   var s3Path = s3Folder + "/" + userReference +  "/" + applicationReference + "/" + fileName;
  // sails.log.info('s3Path:::', s3Path);
 
	var imagePaths = s3Folder + "/" + userReference +  "/" + applicationReference + "/" + fileName;
	
    // or just perform put operation
  var fileNameArray =fileName.split('.');
	var fileExtension =fileNameArray.pop();
	
	sails.log.info("fileExtension:",fileExtension);
	if(fileExtension=='pdf' || fileExtension=='PDF')
	{
		var headers = {
		  'Content-Type': 'application/pdf',
		  'Cache-Control': 'max-age=604800',
		  'x-amz-acl': 'public-read'
		};
	}
	else
	{	
		// or just perform put operation
		var headers = {
		  'Content-Type': 'image/png',
		  'Cache-Control': 'max-age=604800',
		  'x-amz-acl': 'public-read'
		};
	}
	
	//sails.log.info("imagePaths data: ",imagePaths);

    s3Client
      .putFile(asset.localPath, s3Path, headers, function (err, res) {
        if (err) {
          sails.log.error('s3Service#uploadAsset - Error - ', err);
		  return reject(err);
        }
        sails.log.info('s3Service#uploadAsset : Uploading resource to s3 done:  - Response - ',s3Path);
		

		sails.log.info('imagePaths:::', imagePaths);
		
		asset.standardResolution = imagePaths;
        asset.isImageProcessed = true;
        // save asset
        asset.save(function (err) {
          if (err) {
            sails.log.error("S3Service#uploadAsset :: Error :: ", err);
          } else {
            // on successfull upload remove file from filesystem
            fs.unlink(asset.localPath, function (err) {
              if (err) {
                sails.log.error('s3Service#putScreenshot - Error deleting screenshot - ', err);
              }
            });
			return resolve({code:200});
          }
        });
		 //return resolve({code:200});
        //res.resume();
      });
  });
}

/**
 * Get S3Uploader media folder
 * @param asset
 */
function getS3MediaFolderForAsset(asset) {
  switch (asset.type) {
    case Asset.ASSET_TYPE_INSTITUTION:
      return "institution";
    case Asset.ASSET_TYPE_UNIVERSITY:
      return "university";
    case Asset.ASSET_TYPE_PROFILE_PICTURE:
      return "profilePictures";
    case Asset.ASSET_TYPE_UNIVERSAL:
      return "general";
	case Asset.ASSET_MEDIA_TYPE_DOC:
      return "documents";
	case Asset.ASSET_TYPE_BADGE:
      return "badges";
	case Asset.ASSET_TYPE_USER_DOCUMENT:
      return "userdocuments";
	case Asset.ASSET_TYPE_ESIGNATURE:
      return "Esignature";
	case Asset.ASSET_TYPE_AGREEMENT:
      return "Agreement";
    default:
      return "general";
  }
}

function getImagePathsForS3Asset(fileName, s3Folder) {
 /* return {
    standardResolution: s3Folder + "/standardResolution/" + fileName,
    lowResolution: s3Folder + "/lowResolution/" + fileName,
    highResolution: s3Folder + "/highResolution/" + fileName,
    thumbnail: s3Folder + "/thumbnail/" + fileName
  };*/
  
   return {
    standardResolution: s3Folder + "/" + fileName,
    lowResolution: s3Folder + "/" + fileName,
    highResolution: s3Folder + "/" + fileName,
    thumbnail: s3Folder + "/" + fileName
  };
}

function uploadAgreementAsset(pdfFileLocalPath,userConsentData,storyDetail) {
  return Q.promise(function (resolve, reject) {
							 
	 var fileName = Utils.getOriginalNameFromUrl(pdfFileLocalPath);	
	 var s3Folder = "Agreements";
	 //var s3Folder = getS3MediaFolderForAsset(asset);
	 var s3SubFolder = storyDetail.user.userReference + "/" + storyDetail.storyReference;
	 var s3Path = s3Folder + "/" + s3SubFolder + "/" +fileName;
	 
	// sails.log.info("fileName:",fileName);
	// sails.log.info("s3SubFolder:",s3SubFolder);
	 
	  var headers = {
		  'Content-Type': 'application/pdf',
		  'Cache-Control': 'max-age=604800',
		  'x-amz-acl': 'public-read'
	 };
	 
	// sails.log.info("pdfFileLocalPath:",pdfFileLocalPath);
	// sails.log.info("s3Path:",s3Path);	 
	 
	s3Client	
      .putFile(pdfFileLocalPath, s3Path, headers, function (err, res) {
        if (err) {
          sails.log.error('s3Service#uploadAsset - Error - ', err);
		  return reject(err);
        }
        sails.log.info('s3Service#uploadAsset : Uploading resource to s3 done:  - Response - ',s3Path);
		
		if(userConsentData)
		{
			userConsentData.agreementpath = s3Path; 
			userConsentData.save(function (err) {
			  if (err) {
				sails.log.error("S3Service#uploadAsset :: Error :: ", err);
			  } else {
				fs.unlink(pdfFileLocalPath, function (err) {
				  if (err) {
					sails.log.error('s3Service#putScreenshot - Error deleting screenshot - ', err);
				  }
				});
			  }
			});
		}
		return resolve({code:200});
        //res.resume();
      });
  });
}


function uploadPromissoryAgreementAsset(pdfFileLocalPath,userConsentData,reqdata) {
  return Q.promise(function (resolve, reject) {
							 
	 var fileName = Utils.getOriginalNameFromUrl(pdfFileLocalPath);	
	 var s3Folder = "Agreements";
	 //
	 if ("undefined" !== typeof userConsentData.userReference  && userConsentData.userReference !='' && userConsentData.userReference !=null){
		 var application_val = userConsentData.applicationReference;
		 var user_val = userConsentData.userReference;
		 var s3SubFolder = user_val + "/" + application_val;
	 }
	 else
	 {
		 var application_val = reqdata.session.applicationReference;
		 var user_val = reqdata.session.userReference;
		 var s3SubFolder = user_val + "/" + application_val;
	 }
	
	 var s3Path = s3Folder + "/" + s3SubFolder + "/" +fileName;
	 
//sails.log.info("fileName:",fileName);
//sails.log.info("s3SubFolder:",s3SubFolder);
	 
	  var headers = {
		  'Content-Type': 'application/pdf',
		  'Cache-Control': 'max-age=604800',
		  'x-amz-acl': 'public-read'
	 };
	 
//sails.log.info("pdfFileLocalPath:",pdfFileLocalPath);
//sails.log.info("userConsentData:",userConsentData);
	 
	s3Client	
      .putFile(pdfFileLocalPath, s3Path, headers, function (err, res) {
        if (err) {
          sails.log.error('s3Service#uploadAsset - Error - ', err);
		  return reject(err);
        }
        sails.log.info('s3Service#uploadAsset : Uploading resource to s3 done:  - Response - ',s3Path);
		
		if(userConsentData)
		{
			
			sails.log.info("userConsentData:",userConsentData);
			sails.log.info("s3Path:",s3Path);
			
			userConsentData.agreementpath = s3Path; 
			userConsentData.save(function (err) {
			  if (err) {
				sails.log.error("S3Service#uploadAsset :: Error :: ", err);
			  } else {
				fs.unlink(pdfFileLocalPath, function (err) {
				  if (err) {
					sails.log.error('s3Service#putScreenshot - Error deleting screenshot - ', err);
				  }
				});
			  }
			});
		}
		return resolve({code:200});
        //res.resume();
      });
  });
}
function reuploadPromissoryAgreementAsset(pdfFileLocalPath,userConsentData,applicationReference,userReference,reqdata) {
  return Q.promise(function (resolve, reject) {
							 
	 var fileName = Utils.getOriginalNameFromUrl(pdfFileLocalPath);	
	 var s3Folder = "Agreements";
	//  
	 var application_val = userConsentData.applicationReference;
	 var user_val = userConsentData.userReference;
	 var s3SubFolder = user_val + "/" + application_val;
	
	 var s3Path = s3Folder + "/" + s3SubFolder + "/" +fileName;
	 
	 //sails.log.info("fileName:",fileName);
	 //sails.log.info("s3SubFolder:",s3SubFolder);
	 
	  var headers = {
		  'Content-Type': 'application/pdf',
		  'Cache-Control': 'max-age=604800',
		  'x-amz-acl': 'public-read'
	 };
	 
	// sails.log.info("pdfFileLocalPath:",pdfFileLocalPath);
	// sails.log.info("userConsentData:",userConsentData);
	 
	s3Client	
      .putFile(pdfFileLocalPath, s3Path, headers, function (err, res) {
        if (err) {
          sails.log.error('s3Service#uploadAsset - Error - ', err);
		  return reject(err);
        }
        sails.log.info('s3Service#uploadAsset : Uploading resource to s3 done:  - Response - ',s3Path);
		
		if(userConsentData)
		{
			
			userConsentData.agreementpath = s3Path; 
			userConsentData.save(function (err) {
			  if (err) {
				sails.log.error("S3Service#uploadAsset :: Error :: ", err);
			  } else {
				fs.unlink(pdfFileLocalPath, function (err) {
				  if (err) {
					sails.log.error('s3Service#putScreenshot - Error deleting screenshot - ', err);
				  }
				});
			  }
			});
		}
		return resolve({code:200});
     	//res.resume();
      });
  });
}

function uploadTermsPdf( pdfFileLocalPath, userConsentData, applicationReference, userReference ) {
	return Q.promise( function( resolve, reject ) {
		const fileName = Utils.getOriginalNameFromUrl( pdfFileLocalPath );
		const s3Folder = "Agreements";
		const s3SubFolder = userReference + "/" + applicationReference;
		const s3Path = s3Folder + "/" + s3SubFolder + "/" + fileName;

		const headers = {
			"Content-Type": "application/pdf",
			"Cache-Control": "max-age=604800",
			"x-amz-acl": "public-read"
		};

		// sails.log.info("pdfFileLocalPath:",pdfFileLocalPath);
		// sails.log.info("s3Path:",s3Path);

		s3Client.putFile( pdfFileLocalPath, s3Path, headers, function( err, res ) {
			// var err = 'S3 Sockets Hangup';
			if( err ) {
				sails.log.error( "s3Service#uploadAsset - Error - ", err );
				return reject( err );
			}
			sails.log.info( "s3Service#uploadAsset : Uploading resource to s3 done:  - Response - ", s3Path );

			if( userConsentData ) {
				userConsentData.agreementpath = s3Path;
				userConsentData.save( function( err ) {
					if( err ) {
						const err = new Error( "Failed to update UserConsent" );
						sails.log.error( "s3Service#uploadTermsPdf - Error - ", err );
						return reject( err );
					} else {
						fs.unlink( pdfFileLocalPath, function( err ) {
							if( err ) {
								const err = new Error( "Failed to delete staged pdf" );
								sails.log.error( "s3Service#uploadTermsPdf - Error - ", err );
							}
						} );
						return resolve( { code: 200 } );
					}
				} );
			} else {
				const err = new Error( "User Consent arg was not provided" );
				sails.log.error( "s3Service#uploadTermsPdf - Error - ", err );
				return reject( err );
			}
		} );
	} );
}

function uploadVikingAction(csvPath,vikingData){
	
  return Q.promise(function (resolve, reject) {
							 
	 var fileName = Utils.getOriginalNameFromUrl(csvPath);	
	 var s3Folder = "viking";
	//  
	 
	
	 var s3Path = s3Folder + "/" +fileName;
	 
	// sails.log.info("fileName:",fileName);
	// sails.log.info("s3SubFolder:",s3SubFolder);
	 
	  var headers = {
		  'Content-Type': 'application/pdf',
		  'Cache-Control': 'max-age=604800',
		  'x-amz-acl': 'public-read'
	 };
	 
	 
	// sails.log.info("s3Path:",s3Path);
	 
	s3Client	
      .putFile(csvPath, s3Path, headers, function (err, res) {
        if (err) {
          sails.log.error('s3Service#uploadAsset - Error - ', err);
        }
        sails.log.info('s3Service#uploadAsset : Uploading resource to s3 done:  - Response - ',s3Path);
		
		if(vikingData)
		{
			sails.log.info("s3Path222:",s3Path);
			VikingRequest.createRequestData(vikingData,s3Path)
			  .then(function(vikingDataResult) {
				//insert
				 sails.log.info("userId:",vikingData.userData.id);
				 sails.log.info("vikingData:",vikingData);
				 sails.log.info("s3Path:",s3Path);
			 });
		}
		
        res.resume();
      });
  });

}


function uploadEftPdf(pdfFileLocalPath,userConsentData,applicationReference,userReference) {
  return Q.promise(function (resolve, reject) {
							 
	 var fileName = Utils.getOriginalNameFromUrl(pdfFileLocalPath);	
	 var s3Folder = "Agreements";
	 var s3SubFolder = userReference + "/" + applicationReference;
	 var s3Path = s3Folder + "/" + s3SubFolder + "/" +fileName;
	 
	  var headers = {
		  'Content-Type': 'application/pdf',
		  'Cache-Control': 'max-age=604800',
		  'x-amz-acl': 'public-read'
	 };
	 
	 //sails.log.info("pdfFileLocalPath:",pdfFileLocalPath);
	 //sails.log.info("s3Path:",s3Path);
	 
	 s3Client
      .putFile(pdfFileLocalPath, s3Path, headers, function (err, res) {
        if (err) {
        	sails.log.error('s3Service#uploadAsset - Error - ', err);
			return reject(err);
        }
        sails.log.info('s3Service#uploadAsset : Uploading resource to s3 done:  - Response - ',s3Path);
		
		if(userConsentData)
		{
			userConsentData.agreementpath = s3Path; 
			userConsentData.save(function (err) {
			  if (err) {
				sails.log.error("S3Service#uploadAsset :: Error :: ", err);
			  } else {
				fs.unlink(pdfFileLocalPath, function (err) {
				  if (err) {
					sails.log.error('s3Service#putScreenshot - Error deleting screenshot - ', err);
				  }
				});
			  }
			});
		}
		
		
        //res.resume();
		return resolve({code:200});
      });
  });
}

async function uploadFileToS3( { filePath, s3Path, contentType } ) {
	if( ! filePath || ! s3Path ) throw new Error( "filePath and s3Path are required to uploadFileToS3" );
	const toReturn = {
		data: null,
		error: null,
		filePath,
		s3Path,
		success: false
	};
	try {
		toReturn.data = await s3.putObject( {
			Bucket: conf.s3Config.bucket,
			ACL: "public-read",
			Key: s3Path,
			Body: await fs.promises.readFile( filePath ),
			ContentType: contentType || "application/pdf",
			ServerSideEncryption: "AES256",
			// SSEKMSKeyId: conf.s3config.kmsKeyId,
			// BucketKeyEnabled: true
		} ).promise();
		// await fs.promises.unlink( filePath );
		toReturn.success = true;
		sails.log.info( "s3Service#uploadFileToS3 : Uploading resource to s3 done:", s3Path, toReturn );
	} catch( err ) {
		sails.log.error( "s3Service#uploadFileToS3; catch:", err );
		toReturn.error = err;
	}
	return toReturn;
}
