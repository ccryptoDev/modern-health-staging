/**
 * Created by vishal on 6/10/16.
 */
"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('id'),
  field('institutionImage'),
  field('institutionColor'),
  validate('id')
    .required("", "ID_REQUIRED")
);
