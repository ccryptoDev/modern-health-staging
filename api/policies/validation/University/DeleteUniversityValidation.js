
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('universityReferenceId'),
  validate('universityReferenceId')
    .required("", "UNIVERSITY_REFERENCEID_REQUIRED")
);
