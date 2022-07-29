/**
 * Created by vishal on 5/10/16.
 */
"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;
  
  
module.exports = form(
  field('email'),
  field('password'),
  field('appversion'),
  field('devicetoken'),
  field('logintype'),
  field('socialnetworkid')
);
  
/*module.exports = form(
  field('email'),
  field('password'),
  field('appversion'),
  field('devicetoken'),
  validate('email')
  	.isEmail("", "INVALID_EMAIl")
    .required("", "LOGIN_EMAIL_REQUIRED"),
  validate('password')
    .required("", "LOGIN_PASSWORD_REQUIRED")
);*/
 