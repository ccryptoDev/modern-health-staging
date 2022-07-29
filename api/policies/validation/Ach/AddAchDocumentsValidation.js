/**
 * Created by vishal on 5/10/16.
 */
"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('documentname'),
  field('proofdocument'),
  validate('documentname')
    .required("", "DOCUMENT_NAME_REQUIRED")
);
