/**
 * Created by muthaiah on 26/06/17.
 */
'use strict';

var imageUploadConfig = sails.config.imageUploadConfig,
  _ = require('lodash');
  
  var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;


module.exports = function (req, res, next) {

  req.file('documents').upload(imageUploadConfig.tempConfig, function (err, uploadedFiles) {
    if (err) {
      sails.log.error('@UploadTempDocument :: Document Uploading Error :: ', err);

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
