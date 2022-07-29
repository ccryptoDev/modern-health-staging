"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('email'),
  field('university'),
  field('appversion'),
  field('socialnetworkid'),
  validate('email')
    .isEmail("", "INVALID_EMAIl")
    .required("", "EMAIL_REQUIRED"),
  validate('university')
    .required("", "UNIVERSITY_NAME_REQUIRED"),
  validate('socialnetworkid')
    .required("", "SOCIAL_NETWORK_ID_REQUIRED")
);
