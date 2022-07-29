var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('universityId'),
  validate('universityId')
    .required("", "UNIVERSITYID_REQUIRED")
);
