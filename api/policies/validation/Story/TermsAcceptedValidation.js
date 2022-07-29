"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('keys'),
  field('StoryId'),
  validate('keys')
    .required("", "KEYS_REQUIRED"),
  validate('StoryId')
    .required("", "STORYID_REQUIRED")
);
