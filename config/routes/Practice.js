"use strict";

module.exports.routes = {
  /*'post /practice/startinformation': {
    controller: 'PracticeController',
    action: 'startinformation'
  },*/
  'post /practice/updatepracticeinfo': {
    controller: 'PracticeController',
    action: 'updatepracticeinfo'
  },
  'get /practice/practiceinformation': {
    controller: 'PracticeController',
    action: 'practiceinformation'
  },
  'get /practice/addprocedcures': {
    controller: 'PracticeController',
    action: 'addprocedcures'
  },
	"post /practice/procedures": {
		controller: "PracticeController",
		action: "createprocedure"
	},
	"delete /practice/procedures/:id": {
		controller: "PracticeController",
		action: "deleteprocedure"
	},
	"post /practice/procedures/:id": {
		controller: "PracticeController",
		action: "updateprocedure"
	},
  'get /practice/addlendermerchantfees': {
    controller: 'PracticeController',
    action: 'addlendermerchantfees'
  },
  'post /practice/getmerchantfeetemplate': {
    controller: 'PracticeController',
    action: 'getmerchantfeetemplate'
  },
  'post /practice/getvendorinterestrate': {
    controller: 'PracticeController',
    action: 'getvendorinterestrate'
  },
  'get /practice/addstaffmembers': {
    controller: 'PracticeController',
    action: 'addstaffmembers'
  },
  'post /practice/getstaffmembers': {
    controller: 'PracticeController',
    action: 'getstaffmembers'
  },
  'get /practice/addfinancialinformation': {
    controller: 'PracticeController',
    action: 'addfinancialinformation'
  },
  'get /practice/:urlpath': {
    controller: 'PracticeController',
    action: 'startPractice'
  },
};