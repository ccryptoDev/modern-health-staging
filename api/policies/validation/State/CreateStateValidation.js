"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('name'),
  field('stateCode'),
  field('pinCode'),
  field('isActive'),
  validate('name')
  .required("", "NAME_REQUIRED"),
  validate('stateCode')
  .required("", "STATE_CODE_REQUIRED"),
  validate('pinCode')
  .required("", "PIN_CODE_REQUIRED"),
  validate('isActive')
  .required("", "isActive_REQUIRED")

);
