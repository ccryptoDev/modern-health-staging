'use strict';

var  allowedAdminRoles = ['Admin','Underwriter','Customer service','PracticeAdmin','PracticeStaff','PracticeDoctor'];
var  allowedPracticeRoles = ['PracticeAdmin','PracticeStaff','PracticeDoctor'];

module.exports = {
  //port:8100,
  rollbackEnabled: 0,
  allowedAdminRoles:allowedAdminRoles,
  allowedPracticeRoles:allowedPracticeRoles,
  useremailunique: 0,
  //--karthik
  //stripePublicKey:'pk_test_fm0ABdVj1Y9YrBuMtJDtDRXT',
  //stripeSecretKey:'sk_test_JE2NI92frzEP07QHlHjycVN2',
  //--Derrick
  stripePublicKey:'pk_test_NxtUWal5AA8m77ysJUp2RmNs',
  stripeSecretKey:'sk_test_QzOcEfy2rrjVQmrZNjPHySVC',
  stripeAmount:100,
  stripeSetupFee:159500,
  stripeSaasFee:29500,
  clientEmailId: 'rajrajan26@gmail.com',
  clientName: 'Derrick'
};
