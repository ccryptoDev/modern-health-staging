/**
 * Created by vishal on 28/9/16.
 */
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  /*field('name_title'),*/
  field('firstname'),
  field('middlename'),
  field('lastname'),
  field('email'),
  field('ssn_number'),
  field('street_name'),
  field('city'),
  field('state'),
  field('zip_code'),
  field('phone'),
  field('dob'), 
  field('practicemanagement'),
  field('acceptconsent1'),
  field('acceptconsent2'),
  field('acceptconsent3'),
  field('acceptconsent4'),
  field('acceptconsent5'),
  /*validate('name_title')
    .required("", "NAME_TITLE_REQUIRED"),*/
  validate('firstname')
    .required("", "FIRST_NAME_REQUIRED"),
  validate('lastname')
    .required("", "LAST_NAME_REQUIRED"),	
  validate('email')
    .required("", "EMAIL_REQUIRED"),
  validate('ssn_number')
    .required("", "SSN_NUMBER_REQUIRED"),
  validate('street_name')
    .required("", "STREET_NAME_REQUIRED"),
  validate('city')
    .required("", "CITY_REQUIRED"),
  validate('state')
    .required("", "STATE_REQUIRED"),
  validate('zip_code')
    .required("", "ZIPCODE_REQUIRED")
  //validate('phone')
    //.required("", "PHONE_REQUIRED")
);
