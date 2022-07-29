"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('token'),
  validate('token')
    .required("", "TOKEN_REQUIRED")
);
