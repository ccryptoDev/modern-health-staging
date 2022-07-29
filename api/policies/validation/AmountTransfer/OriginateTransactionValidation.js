"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('description'),
  field('amount'),
  field('toRouting'),
  field('toAccountType'),
  field('description'),
  field('toName'),
  field('toIdentification'),
  field('toDescription')
);
