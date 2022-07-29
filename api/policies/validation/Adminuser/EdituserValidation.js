/**
 * Created by vishal on 28/9/16.
 */
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('name'),
  field('email'),
  field('phoneNumber'),
  field('role'),
  field('practiceId'),
  validate('name')
    .required("", "ADMINUSER_NAME_REQUIRED"),
  validate('email')
    .required("", "ADMINUSER_EMAIL_REQUIRED"),
  validate('phoneNumber')
    .required("", "ADMINUSER_PHONE_NUMBER_REQUIRED"),
  validate('role')
    .required("", "ADMINUSER_ROLE_REQUIRED")
);
