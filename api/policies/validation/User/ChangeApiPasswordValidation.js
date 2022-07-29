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
  field('oldpassword'),
  field('newpassword'),
  field('confirmpassword'),
  validate('email')
  	.isEmail("", "INVALID_EMAIl")
    .required("", "CHANGE_PASSWORD_EMAIL_REQUIRED"),
  validate('oldpassword')
    .required("", "CURRENT_PASSWORD_REQUIRED"),
  validate('newpassword')
    .required("", "CHANGE_PASSWORD_REQUIRED"),
  validate('confirmpassword')
    .required("", "CHANGE_CONFIRM_PASSWORD_REQUIRED")
	.equals("field::newpassword", "PASSWORD_MISMATCH")
);
