/**
 * Asset.js
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q'),
  _ = require('lodash'),
  shortid = require('shortid'),
  imageUploadConfig = sails.config.imageUploadConfig;

var ASSET_TYPE_INSTITUTION = 1,
  ASSET_TYPE_UNIVERSITY = 2,
  ASSET_TYPE_PROFILE_PICTURE = 3,
  ASSET_TYPE_UNIVERSAL = 4;

var ASSET_MEDIA_TYPE_IMAGE = 5,
  ASSET_MEDIA_TYPE_VIDEO = 6,
  ASSET_MEDIA_TYPE_DOC = 7;

var ASSET_TYPE_BADGE = 8;

var ASSET_TYPE_USER_DOCUMENT = 9;
var ASSET_TYPE_ESIGNATURE = 10;
var ASSET_TYPE_AGREEMENT = 11;

var ASSET_TYPE_ESIGNATURE_PROMNOTE1 = 12; //highcost
var ASSET_TYPE_ESIGNATURE_PROMNOTE2 = 13; //promnote

module.exports = {

  ASSET_TYPE_INSTITUTION: ASSET_TYPE_INSTITUTION,
  ASSET_TYPE_UNIVERSITY: ASSET_TYPE_UNIVERSITY,
  ASSET_TYPE_PROFILE_PICTURE: ASSET_TYPE_PROFILE_PICTURE,
  ASSET_TYPE_UNIVERSAL: ASSET_TYPE_UNIVERSAL,

  ASSET_MEDIA_TYPE_IMAGE: ASSET_MEDIA_TYPE_IMAGE,
  ASSET_MEDIA_TYPE_VIDEO: ASSET_MEDIA_TYPE_VIDEO,
  ASSET_MEDIA_TYPE_DOC: ASSET_MEDIA_TYPE_DOC,
  ASSET_MEDIA_TYPE_DOC: ASSET_MEDIA_TYPE_DOC,
  ASSET_TYPE_BADGE: ASSET_TYPE_BADGE,
  ASSET_TYPE_USER_DOCUMENT: ASSET_TYPE_USER_DOCUMENT,
  ASSET_TYPE_ESIGNATURE: ASSET_TYPE_ESIGNATURE,
  ASSET_TYPE_AGREEMENT: ASSET_TYPE_AGREEMENT,

  attributes: {
    // stores standard resolution image
    standardResolution: {
      type: 'string',
      defaultsTo: ""
    },
    highResolution: {
      type: 'string',
      defaultsTo: ""
    },
    lowResolution: {
      type: 'string',
      defaultsTo: ""
    },
    thumbnail: {
      type: 'string',
      defaultsTo: ""
    },
    isDeleted: {
      type: 'boolean',
      defaultsTo: 'false'
    },
    localPath: {
      type: 'string',
      defaultsTo: ""
    },
    isImageProcessed: {
      type: "boolean",
      defaultsTo: false
    },
    type: {
      type: 'integer',
      defaultsTo: ASSET_TYPE_UNIVERSAL
    },
    mediaType: {
      type: 'integer',
      defaultsTo: ASSET_MEDIA_TYPE_IMAGE
    },
    referenceId: {
      type: 'string'
    },
    user: {
      model: 'User'
    },
   /* university: {
      model: 'University'
    },*/
    institution: {
      model: 'Institution'
    },
    toApi: toApi,
	/*badges: {
      model: 'Badges'
    },*/
  },
  createAssetForLocalPath: createAssetForLocalPath,
  getLocalUrlForAsset: getLocalUrlForAsset,
  getAssetForReferenceId: getAssetForReferenceId,
  createAssetForInstitution: createAssetForInstitution,
  getImageUrl: getImageUrl,
  createAssetForUniversity: createAssetForUniversity,
  createAssetForAchDocuments:createAssetForAchDocuments,
  createAssetForLoanDocuments:createAssetForLoanDocuments,
  createAssetForBadges: createAssetForBadges,
  createAssetEsignature: createAssetEsignature,
  createUserProfile:createUserProfile
};


function toApi() {
  var asset = this.toObject();

  var localUrl = Asset.getLocalUrlForAsset(asset);
  if (!asset.isImageProcessed) {
    return {
      standardResolution: localUrl,
      lowResolution: localUrl,
      highResolution: localUrl,
      thumbnail: localUrl,
      isImageProcessed: asset.isImageProcessed,
      localPath: localUrl,
      referenceId: asset.referenceId
    };
  } else {
    return {
      standardResolution: Utils.getS3Url(asset.standardResolution),
      lowResolution: Utils.getS3Url(asset.lowResolution),
      highResolution: Utils.getS3Url(asset.highResolution),
      thumbnail: Utils.getS3Url(asset.thumbnail),
      isImageProcessed: asset.isImageProcessed,
      localPath: localUrl,
      referenceId: asset.referenceId
    };
  }
}


function getImageUrl(id) {
  var deferred = Q.defer();
  var criteria = {
    user: id
  };
  Asset.findOne(criteria)
    .then(function (assetDet) {
      deferred.resolve(assetDet.toApi())
    })
    .catch(function (err) {
      deferred.reject(err)
    })
  return deferred.promise
}

function getLocalUrlForAsset(asset) {
  var domainName = sails.config.getBaseUrl;
  var fileName = Utils.getOriginalNameFromUrl(asset.localPath);

  return domainName + "/uploads/" + fileName;
}

function createAssetForLocalPath(user, localPath, type) {
  return Q.promise(function (resolve, reject) {
    if (!user || !localPath) {
      sails.log.error("Asset#createAssetForLocalPath :: insufficient data");

      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
    var entity = {
      user: user.id,
      localPath: localPath,
      referenceId: Utils.generateReferenceId(),
      type: type
    };

    Asset.create(entity)
      .then(function (asset) {

        S3Service.uploadAsset(asset);
        return resolve(asset);
      })
      .catch(function (err) {
        sails.log.error("Asset#createAssetForLocalPath :: Error :: ", err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function getAssetForReferenceId(referenceId) {
  return Q.promise(function (resolve, reject) {
    Asset
      .findOne({
        referenceId: referenceId
      })
      .then(function (asset) {
        if (!asset) {
          return reject({
            code: 404,
            message: 'ASSET_NOT_FOUND'
          });
        }
        return resolve(asset);
      })
      .catch(function (err) {
        sails.log.error("Asset#createToolAssetForType :: Error :: ", err);

        return reject(err);
      });
  });
}

function createAssetForInstitution(localPath, institutionId, type) {
  return Q.promise(function (resolve, reject) {
    if (!institutionId || !localPath) {
      sails.log.error("Asset#createAssetForInstitution :: insufficient data");

      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }

    var entity = {
      institution: institutionId,
      localPath: localPath,
      referenceId: Utils.generateReferenceId(),
      type: type
    };

    Asset.create(entity)
      .then(function (asset) {

        return resolve(asset);
      })
      .catch(function (err) {
        sails.log.error("Asset#createAssetForInstitution :: Error :: ", err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}


function getS3Url(path) {
  if (!path) {
    return "";
  }
  return 'https://s3.amazonaws.com/mobilendtek-assets/' + path;
}

function createAssetForUniversity(university, localPath, type) {
  return Q.promise(function (resolve, reject) {
    if (!university || !localPath) {
      sails.log.error("Asset#createAssetForLocalPath :: insufficient data");

      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
    var entity = {
      university: university.id,
      localPath: localPath,
      referenceId: Utils.generateReferenceId(),
      type: type
    };

    Asset.create(entity)
      .then(function (asset) {

        S3Service.uploadAsset(asset);
        return resolve(asset);
      })
      .catch(function (err) {
        sails.log.error("Asset#createAssetForLocalPath :: Error :: ", err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}


function createUserProfile(localPath,userReference,type,userid)
{
  return Q.promise(function (resolve, reject) {
    if (!localPath) {
      sails.log.error("Asset#createAssetForLocalPath :: insufficient data");

      return reject({
      code: 500,
      message: 'INTERNAL_SERVER_ERROR'
      });
    }
    sails.log.info('type', type);

    var entity = {
      localPath: localPath,
      referenceId: Utils.generateReferenceId(),
      type: type
    };

    Asset.create(entity)
      .then(function (asset) {

      S3Service.uploadUserprofile(asset,userReference,userid);
      return resolve(asset);
      })
      .catch(function (err) {
      sails.log.error("Asset#createAssetForLocalPath :: Error :: ", err);

      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
      });
    });
}

function createAssetForAchDocuments(achdocuments,localPath,userReference,applicationReference, type){

	 return Q.promise(function (resolve, reject) {
		if (!achdocuments || !localPath) {
		  sails.log.error("Asset#createAssetForLocalPath :: insufficient data");

		  return reject({
			code: 500,
			message: 'INTERNAL_SERVER_ERROR'
		  });
		}
		sails.log.info('type', type);

		var entity = {
		  achdocuments: achdocuments.id,
		  localPath: localPath,
		  referenceId: Utils.generateReferenceId(),
		  type: type
		};

		return Asset.create(entity)
		  .then(function (asset) {

      return S3Service.uploadAsset(asset,userReference,applicationReference)
      .then( () => {
        return resolve(asset);
      } );
		  })
		  .catch(function (err) {
			sails.log.error("Asset#createAssetForLocalPath :: Error :: ", err);

			return reject({
			  code: 500,
			  message: 'INTERNAL_SERVER_ERROR'
			});
		  });
	  });

}
//function createAssetEsignature(signatureDetails, userUploadedImagePath,userReference,applicationReference, type){
function createAssetEsignature(signatureDetails, userUploadedImagePath, type){

	 return Q.promise(function (resolve, reject) {
		if (!achdocuments || !localPath) {
		  sails.log.error("Asset#createAssetForLocalPath :: insufficient data");

		  return reject({
			code: 500,
			message: 'INTERNAL_SERVER_ERROR'
		  });
		}
		sails.log.info('type', type);

		var entity = {
		  achdocuments: signatureDetails.id,
		  localPath: localPath,
		  referenceId: Utils.generateReferenceId(),
		  type: type
		};

		Asset.create(entity)
		  .then(function (asset) {

			S3Service.uploadAsset(asset,userReference,applicationReference);
			return resolve(asset);
		  })
		  .catch(function (err) {
			sails.log.error("Asset#createAssetForLocalPath :: Error :: ", err);

			return reject({
			  code: 500,
			  message: 'INTERNAL_SERVER_ERROR'
			});
		  });
	  });

}
function createAssetForLoanDocuments(loandocuments, localPath, type){

	 return Q.promise(function (resolve, reject) {
		if (!achdocuments || !localPath) {
		  sails.log.error("Asset#createAssetForLocalPath :: insufficient data");

		  return reject({
			code: 500,
			message: 'INTERNAL_SERVER_ERROR'
		  });
		}
		var entity = {
		  loandocuments: loandocuments.id,
		  localPath: localPath,
		  //referenceId: Utils.generateReferenceId(),
		  type: type
		};

		LoanAsset.create(entity)
		  .then(function (asset) {

			S3Service.uploadAsset(asset);
			return resolve(asset);
		  })
		  .catch(function (err) {
			sails.log.error("Asset#createAssetForLocalPath :: Error :: ", err);

			return reject({
			  code: 500,
			  message: 'INTERNAL_SERVER_ERROR'
			});
		  });
	  });

}

function createAssetForBadges(badgeDetails, localPath, type) {
  return Q.promise(function (resolve, reject) {
    if (!badgeDetails || !localPath) {
      sails.log.error("Asset#createAssetForLocalPath :: insufficient data");

      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
    var entity = {
      badges: badgeDetails.id,
      localPath: localPath,
      referenceId: Utils.generateReferenceId(),
      type: type
    };

	 sails.log.info("Asset#createAssetForBadges :: entity data",entity);

    Asset.create(entity)
      .then(function (asset) {

         S3Service.uploadAsset(asset)
		 .then(function (assetDetails) {
			//sails.log.info("assetDetails: ",assetDetails);
        	//return resolve(assetDetails);
		 });

		 return resolve(asset);
      })
      .catch(function (err) {
        sails.log.error("Asset#createAssetForLocalPath :: Error :: ", err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

