"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('key'),
  validate('key')
    .required("", "KEY_REQUIRED")
);
