/**
 * Created by vishal on 5/10/16.
 */
"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('screenName'),
  field('phoneNumber'),
  field('pass'),
  validate('screenName')
    .required("", "SCREEN_NAME_REQUIRED"),
  validate('phoneNumber')
    .required("", "PHONE_NUMBER_REQUIRED"),
  validate('pass')
    .required("", "PASS_REQUIRED")
    
);
