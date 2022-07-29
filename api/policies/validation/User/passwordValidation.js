/**
 * Created by vishal on 5/10/16.
 */
"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('password'),
  validate('password')
    .required("", "LOGIN_PASSWORD_REQUIRED")
);

