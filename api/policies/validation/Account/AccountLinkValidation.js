/**
 * Created by raviteja on 03/11/16.
 */

'use strict';

var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;


module.exports = form(
  field('plaidAccountId'),
  field('itemId'),
  field('userBankAccount'),
  validate('plaidAccountId')
    .required('', 'PLAID_ACCOUNT_ID_REQUIRED'),
  validate('itemId')
    .required('', 'PLAID_ITEM_ID_REQUIRED'),
  validate('userBankAccount')
    .required('', 'USER_BANK_ACCOUNT_ID_REQUIRED')
);
