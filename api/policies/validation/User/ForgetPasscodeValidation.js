/**
 * Created by sree on 9/6/17.
 */
"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('email'),
  validate('email')
  	.isEmail("", "USER_INVALID_AUTH")
    .required("", "USER_INVALID_AUTH")
);
