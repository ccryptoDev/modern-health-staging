"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('accountId'),
  // field('StoryId'),
  validate('accountId')
    .required("", "ACCOUNTID_REQUIRED")

);
