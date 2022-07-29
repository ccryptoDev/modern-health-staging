"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('name'),
  field('dob'),
  field('email'),
  field('address'),
  field('street'),
  field('city'),
  field('state'),
  field('university'),
  field('zipCode'),
  validate('email')
    .isEmail("", "INVALID_EMAIl")
    .required("", "EMAIL_REQUIRED")
);
