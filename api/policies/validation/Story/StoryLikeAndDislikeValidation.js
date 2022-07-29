"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('storyId'),
  field('id'),
  validate('storyId')
    .required("", "STORYID_REQUIRED")
);
