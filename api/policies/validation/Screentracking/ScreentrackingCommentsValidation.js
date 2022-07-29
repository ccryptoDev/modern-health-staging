/**
 * Created by vishal on 5/10/16.
 */
"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('subject'),
  field('comments'),
  field('screentrackingID'),
  validate('subject')
    .required("", "SUBJECT_REQUIRED"),
  validate('comments')
    .required("", "COMMENTS_REQUIRED")
);
