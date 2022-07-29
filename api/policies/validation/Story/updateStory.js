"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

  module.exports = form(
    field('requestedAmount'),
    field('backgroundImage'),
    field('caption'),
    field('categoryId'),
    validate('requestedAmount')
      .required("", "REQUESTEDAMOUNT_REQUIRED")
      .isDecimal("", "REQUESTEDAMOUNT_FLOAT"),
    validate('backgroundImage')
      .required("", "BACKGROUND_IMAGE_REQUIRED")
      .isUrl("BACKGROUND_IMAGE_URL_INVALID"),
    validate('caption')
      .required("", "CAPTION_REQUIRED"),
    validate('categoryId')
      .required("", "CATEGORYID_REQUIRED")
  );
