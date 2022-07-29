/**
 * Created by nineleaps on 19/11/16.
 */
"use strict";

module.exports.routes = {

 /*'get /api/v1/updateFluidTransactions' : {
   controller : 'FluidCardController',
   action: 'updateFluidTransactions'
 },*/
 'post /api/v1/getPlaidTransactions' : {
   controller : 'InstitutionController',
   action: 'getPlaidTransactions'
 },
 'get /api/v1/getPlaidTransactions' : {
   controller : 'InstitutionController',
   action: 'getPlaidTransactions'
 },
 //******************************* Plaid transaction testing *************************************//
 'get /api/v1/checkplaidTransaction/:token/:type': {
	controller: 'InstitutionController',
	action: 'checkplaidTransaction'
 },
 
};
