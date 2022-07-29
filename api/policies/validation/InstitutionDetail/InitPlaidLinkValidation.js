/**
 * Created by raviteja on 31/10/16.
 */
'use strict';

"use strict";
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('institutionType'),
  validate('institutionType')
    .required('', 'INSTITUTION_TYPE_REQUIRED')
);
