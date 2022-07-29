"use strict";

module.exports.routes = {
  'get /staffportal/setpassword': {
    controller: 'StaffportalController',
    action: 'setpassword'
  },
   'get /staffportal/updatepassword': {
    controller: 'StaffportalController',
    action: 'updatepassword'
  },
  'get /staffportal/login': {
    controller: 'StaffportalController',
    action: 'login'
  },  
  'get /staffportal/logout': {
    controller: 'StaffportalController',
    action: 'logout'
  },  
  'post /staffportal/signin': {
    controller: 'StaffportalController',
    action: 'signin'
  },
};