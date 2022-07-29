/**
 * Created by vishal on 5/10/16.
 */
"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('username'),
  field('contactemail'),
  field('password'),
  field('confirmpassword'),
  field('firstname'),
  field('lastname'),
  field('role'),
  field('PracticeName'),
  field('PracticeEmail'),
  field('StreetAddress'),
  field('PhoneNumber'),
  field('ZipCode'),
  field('StateCode'),
  field('City'),
  validate('username')
     .required("", "CONTACT_USERNAME_REQUIRED"),
  validate('contactemail')
	 .isEmail("", "INVALID_EMAIL_ID")
	 .required("", "EMAIL_REQUIRED"),
  validate('password')
    .required("", "PASSWORD_REQUIRED"),
  validate('confirmpassword')
    .required("", "CONFIRM_PASSWORD_REQUIRED"),
  validate('firstname')
    .required("", "FIRSTNAME_REQUIRED"),
  validate('lastname')
    .required("", "LASTNAME_REQUIRED"),
  validate('StreetAddress')
    .required("", "STREET_REQUIRED"),
  validate('PhoneNumber')
    .required("", "PHONENUMBER_REQUIRED"),
  validate('ZipCode')
    .required("", "ZIPCODE_REQUIRED"),
  validate('StateCode')
    .required("", "STATE_REQUIRED"),
  validate('City')
    .required("", "CITY_REQUIRED")
);

