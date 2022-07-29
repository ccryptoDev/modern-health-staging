"use strict";

var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;
//to do add unique validation
module.exports = form(
  field('screenName'),
  validate('screenName')
    .required("", "SCREEN_NAME_REQUIRED")
);
