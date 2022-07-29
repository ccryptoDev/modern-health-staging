"use strict";

module.exports.routes = {
  'get /createnewapplication': {
    controller: 'BorrowerController',
    action: 'createnewapplication'
  },
  'post /createnewapplication': {
    controller: 'BorrowerController',
    action: 'updatenewapplication'
  },
  'post /getApploanDetails': {
    controller: 'BorrowerController',
    action: 'getApploanDetails'
  },
  
  //******************Borrower login*****************//
  
  'get /borrowerlogin': {
    controller: 'BorrowerController',
    action: 'borrowerlogin'
  },
};