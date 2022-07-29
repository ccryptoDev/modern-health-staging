"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('state'),
  field('stateCode'),
  field('minloanamount'),
  field('maxloanamount'),
  field('maxapr'),
  field('applicationfee'),
  field('originationfeecap'),
  validate('state')
  .required("", "STATE_REQUIRED"),
  validate('stateCode')
  .required("", "STATE_CODE_REQUIRED"),
  validate('minloanamount')
  .required("", "MINIMUM_LOAN_AMMOUT_REQUIRED"),
  validate('maxloanamount')
  .required("", "MAXIMUM_LOAN_AMMOUT_REQUIRED"),
  validate('maxapr')
  .required("", "MAXIMUM_APR_REQUIRED"),
  validate('applicationfee')
  .required("", "APPLICATION_FEE_REQUIRED"),
  validate('originationfeecap')
  .required("", "ORIGINATION_FEE__REQUIRED")

);
