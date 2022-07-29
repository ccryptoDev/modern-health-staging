/**
 * Created by vishal on 28/9/16.
 */
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('email'),
  validate('email')
    .required("", "ADMINUSER_EMAIL_REQUIRED")
);
