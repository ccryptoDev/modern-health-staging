"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('deviceId'),
  field('timeZone'),
  field('deviceData'),
  field('latitude'),
  field('longitude'),
  field('appversion'),
  field('systemVersion'),
  field('devicetoken'),
  field('socialnetworktype'),
  field('socialnetworkid'),
  validate('deviceId')
    .required("", "DEVICE_REQUIRED"),
  validate('socialnetworktype')
    .required("", "SOCIAL_NETWORK_TYPE_REQUIRED"),
  validate('socialnetworkid')
    .required("", "SOCIAL_NETWORK_ID_REQUIRED")
);
