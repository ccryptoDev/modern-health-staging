"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('amount'),
  validate('amount')
    .required("", "AMOUNT_IS_REQUIRED")
  // .isBoolean("isTermsAccepted")
);
