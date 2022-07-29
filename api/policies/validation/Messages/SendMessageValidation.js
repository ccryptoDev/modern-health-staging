/**
 * Created by vishal on 28/9/16.
 */
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('subject'),
  field('message'),
  field('category'),
  validate('subject')
    .required("", "MESSAGE_TITLE_REQUIRED"),
  validate('message')
    .required("", "MESSAGE_MESSAGE_REQUIRED"),
  validate('category')
    .required("", "MESSAGE_CATEGORY_REQUIRED")	
);
