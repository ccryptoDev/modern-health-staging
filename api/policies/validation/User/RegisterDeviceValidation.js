"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('deviceId'),
  field('timeZone'),
  field('deviceData'),
  field('password'),
  field('email'),
  field('university'),
  field('latitude'),
  field('longitude'),
  field('appversion'),
  field('systemVersion'),
  field('devicetoken'),
  validate('email')
    .isEmail("", "INVALID_EMAIl")
    .required("", "EMAIL_REQUIRED"),
  validate('deviceId')
    .required("", "DEVICE_REQUIRED"),
  validate('password')
    .required("", "REGISTER_PASSWORD_REQUIRED"),
  validate('university')
    .required("", "UNIVERSITY_NAME_REQUIRED")
);
