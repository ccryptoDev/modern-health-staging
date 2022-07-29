"use strict";

module.exports.routes = {
	
   'get /addbankaccount/:id':{
	  controller: 'CustomerServiceController',
	  action: 'addbankaccount'
   },
   'post /servicesaveincomedetails': {
    controller: 'CustomerServiceController',
    action: 'saveincomedetails'
  },
  'get /servicetransaction/:id':{
	  controller: 'CustomerServiceController',
	  action: 'servicetransaction'
  },
  'post /emailselectedAccount':{
	  controller: 'CustomerServiceController',
	  action: 'emailselectedAccount'
  },
   'get /emailmyoffer/:screenid':{
	  controller: 'CustomerServiceController',
	  action: 'myoffers'
  },
  'get /userpromissorynote/:id':{
	  controller: 'CustomerServiceController',
	  action: 'userpromissorynote'
  },
//   'post /createpromissorypdf':{
// 	  controller: 'CustomerServiceController',
// 	  action: 'createpromissorypdf'
//   },
  'post /filloutfinancedata':{
	  controller: 'CustomerServiceController',
	  action: 'filloutfinancedata'
  },
  'post /borrowerloanamountconfirm':{
	  controller: 'CustomerServiceController',
	  action: 'borrowerloanamountconfirm'
  },
  
  
  /*'get /servicebanktransaction/:id': {
    controller: 'CustomerServiceController',
    action: 'getbanktransaction'
  },
  'get /serviceesignature/:id':{
	 controller: 'HomeController',
	 action: 'esignature'
  },
  'get /serviceloandocuments/:id':{
	 controller: 'ApplicationController',
	 action: 'serviceloandocuments'
  },
  'get /servicecreateloandetails/:id':{
    controller: 'ApplicationController',
    action: 'servicecreateloandetails'
  },
  'get /servicesuccessmessage':{
    controller: 'ApplicationController',
    action: 'servicesuccessmessage'
  },
   'post /saveSignaturebycustomerservice': {
    controller: 'EsignatureController',
    action: 'saveSignaturebycustomerservice'
  },
  'post /servicesaveincomedetails': {
    controller: 'CustomerServiceController',
    action: 'saveincomedetails'
  },
      'get /createnewsession' : {
    controller : 'CustomerServiceController',
    action : 'newclient'
  },
  'get /getRamsList': {
    controller: 'CustomerServiceController',
    action: 'checkStatusUsingPaymentID'
  },
   'get /RamsCronService': {
    controller: 'RamsCronServices',
    action: 'checkUserTransferStatus'
  },
   'get /getRamsTestResult' : {
    controller : 'RamsApiTest',
    action : 'newclient'
  },
  'post /Fedchextest' : {
    controller : 'FedchexController',
    action : 'newFedchex'
  },
	'get /servicetransaction/:id':{
	  controller: 'CustomerServiceController',
	  action: 'servicetransaction'
  },
	'post /emailajaxselectedbank':{
	  controller: 'CustomerServiceController',
	  action: 'emailajaxselectedbank'
  },
	'post /emailselectedAccount':{
	  controller: 'CustomerServiceController',
	  action: 'emailselectedAccount'
  },
	 'get /serviceinfosuccess':{
	  controller: 'CustomerServiceController',
	  action: 'serviceinfosuccess'
  },
  'get /serviceselectaccountinfo/:id':{
	  controller: 'CustomerServiceController',
	  action: 'serviceselectaccountinfo'
  },
	'post /serviceaddconsolidate':{
	  controller: 'CustomerServiceController',
	  action: 'serviceaddconsolidate'
  },
    'get /servicecreatepromissorypdf/:id':{
	  controller: 'ApplicationController',
	  action: 'servicecreatepromissorypdf'
  },*/
};