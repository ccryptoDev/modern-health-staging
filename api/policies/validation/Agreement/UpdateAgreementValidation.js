/**
 * Created by vishal on 16/9/16.
 */
"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('documentKey'),
  field('documentName'),
  field('documentVersion'),
  field('documentBody'),
  field('id')
);
