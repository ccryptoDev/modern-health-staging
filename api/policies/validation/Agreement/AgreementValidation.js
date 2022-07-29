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
 /* field( 'documentPath'),*/
  field('active'),
  validate('documentKey')
    .required("", "DOCUMENTKEY_REQUIRED")
    .isAlphanumeric("DOCUMENTKEY_MUST_BE_ALPHANUMERIC_ONLY"),
  validate('documentName')
    .required("", "DOCUMENTNAME_REQUIRED"),
  validate('documentVersion')
    .required("", "DOCUMENTVERSION_REQUIRED"),
  validate('documentBody')
    .required("", "DOCUMENTBODY_REQUIRED"),
  /*validate('documentPath')
    .required("","DOCUMENTPATH_REQUIRED"), */
  validate('active')
    .required("", "ACTIVE_REQUIRED")
);
