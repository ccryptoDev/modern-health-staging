/**
 * Created by raviteja on 16/08/16.
 */
'use strict';

var imageUploadConfig = sails.config.imageUploadConfig,
  _ = require('lodash');

module.exports = function (req, res, next) {

  req.file('institutionImage').upload(imageUploadConfig.tempConfig, function (err, uploadedFiles) {
    if (err) {
      sails.log.error('@UploadTempImage :: Image Uploading Error :: ', err);

      return res.serverError();
    }

    if (uploadedFiles.length == 0) {
      // throw an invalid request error
      return res.badRequest();
    }
    // get the fd for the first file
    var firstFile = uploadedFiles[0];

    if (_.has(firstFile, 'fd')) {
      req.localPath = firstFile.fd;

      return next();
    } else {
      return res.serverError();
    }
  });
};
