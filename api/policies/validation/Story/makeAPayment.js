"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('amount'),
  field('accountName'),
  field('accountNumberLastFour'),
  validate('amount')
    .required("", "AMOUNT_IS_REQUIRED"),
  validate('accountName')
   .required("","ACCOUNT_NAME_REQUIRED"),
  validate('accountNumberLastFour')
  .required('ACCOUNT_NUMBER_LAST_FOUR_REQUIRED')
);
