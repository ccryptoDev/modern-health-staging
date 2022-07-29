/**
 * Created by vishal on 28/9/16.
 */
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('name'),
  field('city'),
  validate('name')
    .required("", "UNIVERSITY_NAME_REQUIRED"),
  validate('city')
    .required("", "UNIVERSITY_CITY_REQUIRED")
);
