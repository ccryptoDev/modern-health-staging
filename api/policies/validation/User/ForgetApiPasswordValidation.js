/**
 * Created by vishal on 5/10/16.
 */
"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('email'),
  validate('email')
  	.isEmail("", "INVALID_EMAIl")
    .required("", "LOGIN_EMAIL_REQUIRED")
);
