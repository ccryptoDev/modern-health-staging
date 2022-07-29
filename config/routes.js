module.exports.routes = {
	"/": {
		view: "user/new/login",
		locals: { layout: "layouts/loginLayout" }
	},
	"get /admin/index": {
		view: "admin/index"
	},

	"get /admin/dashboard": {
		controller: "CategoryController",
		action: "getDashboardView"
	},
	/* ************************** For User ********************************************** */
	"get /adminLogin": {
		controller: "UserController",
		action: "adminLoginView"
	},
	"post /api/v1/loginAdmin": {
		controller: "UserController",
		action: "login"
	},
	"get /forgetPassword": {
		controller: "UserController",
		action: "forgetPassword"
	},
	"get /changeNewbank/:id/:banktoken": {
		controller: "UserController",
		action: "changeNewbank"
	},
	"get /saveinviteuser/:id/:invitetoken": {
		controller: "UserController",
		action: "saveInviteUser"
	},
	"get /admin/logout": {
		controller: "UserController",
		action: "logout"
	},
	/* ****************************** Application Process ***************************** */
	"get /userinformation": {
		controller: "ApplicationController",
		action: "userInformation"
	},
	"get /application": {
		controller: "ApplicationController",
		action: "application"
	},
	"get /emailverifylanding/:id": {
		controller: "ApplicationController",
		action: "emailverifylanding"
	},
	"GET /createapplication": {
		controller: "ApplicationController",
		action: "createApplication"
	},
	"POST /createapplication": {
		controller: "ApplicationController",
		action: "createApplicationPost"
	},
	"post /generateNewOffers": {
		controller: "ApplicationController",
		action: "generateNewOffers"
	},
	/* ****************************** Log Activity ************************************ */
	"get /admin/managelogactivity": {
		controller: "LogactivityController",
		action: "manageLogActivity"
	},
	"get /admin/ajaxmanageloglist": {
		controller: "LogactivityController",
		action: "ajaxManageLogList"
	},
	"get /admin/viewlogDetails/:id": {
		controller: "LogactivityController",
		action: "viewlogDetails"
	},
	"get /admin/communicationlog": {
		controller: "LogactivityController",
		action: "communicationlog"
	},
	"get /admin/ajaxcommunicationlog": {
		controller: "LogactivityController",
		action: "ajaxcommunicationlog"
	},
	/* ****************************** For Pending Ach ************************************ */
	"get /admin/getAchDetails": {
		controller: "AchController",
		action: "showAllPendingAch"
	},
	"get /admin/getOpenApplicationDetails": {
		controller: "AchController",
		action: "showAllOpenApplicationAch"
	},
	"get /admin/getIncompleteApplicationDetails": {
		controller: "AchController",
		action: "showInCompleteApplicationAch"
	},
	"get /admin/getArchivedPendingDetails": {
		controller: "AchController",
		action: "showAllArchivedPendingAch"
	},
	"get /admin/getArchivedOpenDetails": {
		controller: "AchController",
		action: "showAllArchivedOpenAch"
	},
	"get /admin/getToDoItemsPendingDetails": {
		controller: "AchController",
		action: "showAllToDoItemsPendingAch"
	},
	"get /admin/getToDoItemsOpenApplicationDetails": {
		controller: "AchController",
		action: "showAllToDoItemsOpenApplication"
	},
	"get /admin/ajaxOpenApplicationAch/:viewtype": {
		controller: "AchController",
		action: "ajaxOpenApplicationAch"
	},
	"get /admin/ajaxPendingAch/:viewtype": {
		controller: "AchController",
		action: "ajaxPendingAch"
	},
	"get /admin/ajaxPaymentHistory": {
		controller: "AchController",
		action: "ajaxPaymentHistory"
	},
	"get /admin/getAchUserDetails/:id": {
		controller: "AchController",
		action: "getAchUserDetails"
	},
	'post /admin/confirmProcedure/:id': {
		controller: 'AchController',
		action: 'confirmProcedure'
	},
	"get /admin/getAchResetUserDetails/:id": {
		controller: "AchController",
		action: "getAchResetUserDetails"
	},
	"post /admin/denyloan": {
		controller: "AchController",
		action: "denyUserLoan"
	},
	"post /admin/addAchComments": {
		controller: "AchController",
		action: "addAchComments"
	},
	"get /admin/ajaxAchComments/:id": {
		controller: "AchController",
		action: "ajaxAchComments"
	},
	"post /admin/uploadDocumentProof": {
		controller: "AchController",
		action: "uploadDocumentProof"
	},
	"get /admin/defaultUsers": {
		controller: "AchController",
		action: "defaultUsers"
	},
	"get /admin/ajaxDefaultUsersList": {
		controller: "AchController",
		action: "ajaxDefaultUsersList"
	},
	"get /admin/viewDefaultUser/:id": {
		controller: "AchController",
		action: "viewDefaultUser"
	},
	"get /admin/showAllComplete": {
		controller: "AchController",
		action: "showAllComplete"
	},
	"get /admin/showAllInprogress": {
		controller: "AchController",
		action: "showAllInprogress"
	},
	"get /admin/showFundedContracts": {
		controller: "AchController",
		action: "showFundedContracts"
	},
	"get /admin/showProcedureDateSet": {
		controller: "AchController",
		action: "showProcedureDateSet"
	},
	"get /admin/completeapplication/:viewtype": {
		controller: "AchController",
		action: "completeApplication"
	},
	"get /admin/addchargeoff/:id/:rowid": {
		controller: "AchController",
		action: "addchargeoff"
	},
	"get /admin/showAllBlocked": {
		controller: "AchController",
		action: "showAllBlocked"
	},
	"get /admin/ajaxBlockedAch": {
		controller: "AchController",
		action: "ajaxBlockedAch"
	},
	"post /admin/releaseApp": {
		controller: "AchController",
		action: "releaseApp"
	},
	"post /admin/approveloan": {
		controller: "AchController",
		action: "approveUserLoan"
	},
	"get /admin/sendaddbankinvite/:id": {
		controller: "AchController",
		action: "sendAddBankInvite"
	},
	"get /admin/showAllDenied": {
		controller: "AchController",
		action: "showAllDenied"
	},
	"get /admin/showAllArchivedDenied": {
		controller: "AchController",
		action: "showAllArchivedDenied"
	},
	"get /admin/showAllToDoItemsDenied": {
		controller: "AchController",
		action: "showAllToDoItemsDenied"
	},
	"get /admin/ajaxDeniedApplication/:viewtype": {
		controller: "AchController",
		action: "ajaxDeniedApplication"
	},
	"post /admin/storyuserviewinfo": {
		controller: "AchController",
		action: "storyUserviewinfo"
	},
	"post /admin/changescheduledate": {
		controller: "ScreentrackingController",
		action: "changescheduledate"
	},
	"post /admin/changescheduleamount": {
		controller: "ScreentrackingController",
		action: "changescheduleamount"
	},
	"get /admin/userPaymentHistory": {
		controller: "AchController",
		action: "userPaymentHistory"
	},
	"post /admin/cancelACH": {
		controller: "AchController",
		action: "cancelAch"
	},
	"get /admin/potentialdefaultusers": {
		controller: "AchController",
		action: "showPotentialDefaultusers"
	},
	"get /admin/ajaxpotentialdefaultusers": {
		controller: "AchController",
		action: "ajaxPotentialDefaultusers"
	},
	"post /admin/updateSetDate": {
		controller: "AchController",
		action: "updateSetDate"
	},
	"post /admin/updatePreferredDate": {
		controller: "AchController",
		action: "updatePreferredDate"
	},
	"post /admin/linkdoctorstaff": {
		controller: "AchController",
		action: "linkdoctorstaff"
	},
	"post /admin/movetoopenupdate": {
		controller: "AchController",
		action: "movetoopenupdate"
	},
	"post /admin/markAsReviewed": {
		controller: "AchController",
		action: "markAsReviewed"
	},
	"post /admin/movetounarchive": {
		controller: "AchController",
		action: "movetoUnarchive"
	},
	"post /admin/resetToPendingState":{
		controller: "AchController",
		action: "resetToPendingState"
	},
	/* ****************************** Manage user module ************************************ */
	"get /admin/manageusers": {
		controller: "UserController",
		action: "getallUserDetails"
	},
	"get /admin/ajaxmanageuserlist": {
		controller: "UserController",
		action: "ajaxManageUserlist"
	},
	"get /admin/resetusers": {
		controller: "UserController",
		action: "getallResetUsers"
	},
	"get /admin/ajaxmanageresetuserlist": {
		controller: "UserController",
		action: "ajaxManageResetUserlist"
	},
	"post /admin/updateUserStatus": {
		controller: "UserController",
		action: "updateUserStatus"
	},
	"get /admin/viewUserDetails/:id": {
		controller: "UserController",
		action: "viewUserDetails"
	},
	"get /admin/viewResetUserDetails/:id": {
		controller: "UserController",
		action: "viewResetUserDetails"
	},
	"get /admin/deleteUserDetails/:id": {
		controller: "UserController",
		action: "deleteUserDetails"
	},
	"get /admin/resetUserDetails/:id": {
		controller: "UserController",
		action: "resetUserDetails"
	},
	"post /admin/sendverficationlink": {
		controller: "UserController",
		action: "sendverficationlink"
	},
	"post /admin/sendverficationcode": {
		controller: "UserController",
		action: "sendverficationcode"
	},
	"post /admin/changephoneverifystatus": {
		controller: "UserController",
		action: "changephoneverifystatus"
	},
	"get /admin/changeverifystatus/:id": {
		controller: "UserController",
		action: "changeverifystatus"
	},
	"post /admin/removephone": {
		controller: "UserController",
		action: "removephone"
	},
	"post /admin/changeemail": {
		controller: "UserController",
		action: "changeemail"
	},
	"post /admin/changephone": {
		controller: "UserController",
		action: "changephone"
	},
	"get /admin/ajaxUserTrackingList/:id": {
		controller: "UserController",
		action: "ajaxUserTrackingList"
	},
	"post /admin/showUserTrackingMap": {
		controller: "UserController",
		action: "showUserTrackingMap"
	},
	"get /admin/ajaxUserContactsList/:id": {
		controller: "UserController",
		action: "ajaxUserContactsList"
	},
	"get /admin/manageproducts": {
		controller: "UserController",
		action: "manageproducts"
	},
	"get /admin/viewproduct/:id": {
		controller: "UserController",
		action: "viewproductdetails"
	},
	"post /admin/createstateregulation": {
		controller: "ApplicationController",
		action: "createstateregulation"
	},
	"post /getloanamountcapfields": {
		controller: "UserController",
		action: "getloanamountcapfields"
	},
	"post /admin/createupdateamountcap": {
		controller: "UserController",
		action: "createupdateamountcap"
	},
	"post /admin/createupdateapplicationfee": {
		controller: "HomeController",
		action: "createupdateapplicationfee"
	},
	"post /getloanstateregualtionfields": {
		controller: "UserController",
		action: "getloanstateregualtionfields"
	},
	"post /getinterestratefields": {
		controller: "ApplicationController",
		action: "getinterestratefields"
	},
	"post /admin/createupdateinterestrate": {
		controller: "ApplicationController",
		action: "createupdateinterestrate"
	},
	"post /getproductRules": {
		controller: "HomeController",
		action: "getproductRules"
	},
	"post /getapplicationfee": {
		controller: "HomeController",
		action: "getapplicationfee"
	},
	"post /admin/createupdateproductrules": {
		controller: "HomeController",
		action: "createupdateproductrules"
	},
	"post /admin/ajaxgetloanamountcaps": {
		controller: "UserController",
		action: "ajaxgetloanamountcap"
	},
	"post /admin/ajaxgetinterestrates": {
		controller: "UserController",
		action: "ajaxgetinterestrates"
	},
	"post /admin/ajaxgetstateregulation": {
		controller: "ApplicationController",
		action: "ajaxgetstateregulations"
	},
	"post /admin/ajaxgetloanproductrules": {
		controller: "HomeController",
		action: "ajaxgetloanproductrules"
	},
	"post /admin/ajaxgetapplicationfee": {
		controller: "HomeController",
		action: "ajaxgetapplicationfee"
	},
	"get /admin/resentinviteemail/:id": {
		controller: "UserController",
		action: "resentinviteemail"
	},
	"get /admin/registeruser": {
		controller: "UserController",
		action: "registeruser"
	},
	"get /admin/ajaxregisteruserlist": {
		controller: "UserController",
		action: "ajaxregisteruserlist"
	},
	"post /admin/newresentinviteemail": {
		controller: "UserController",
		action: "newresentinviteemail"
	},
	/* ****************************** Loan pro payment testing ************************************ */
	"get /admin/addnewCustomer": {
		controller: "AchController",
		action: "addnewCustomer"
	},
	"get /admin/addnewBankaccount": {
		controller: "AchController",
		action: "addnewBankaccount"
	},
	"get /admin/loanproCreditPayment": {
		controller: "AchController",
		action: "loanproCreditPayment"
	},
	"get /admin/checkAchTransactionDetails": {
		controller: "AchController",
		action: "checkAchTransactionDetails"
	},
	/* ****************************** ScreenTracking ************************************ */
	"get /admin/incompleteApplication": {
		controller: "ScreentrackingController",
		action: "getIncompleteApplication"
	},
	"get /admin/ArchivedIncompleteApplication": {
		controller: "ScreentrackingController",
		action: "ArchivedIncompleteApplication"
	},
	"get /admin/ToDoItemIncompleteApplication": {
		controller: "ScreentrackingController",
		action: "ToDoItemIncompleteApplication"
	},
	"get /admin/ajaxIncompleteList/:viewtype": {
		controller: "ScreentrackingController",
		action: "ajaxIncompleteList"
	},
	"get /admin/viewIncomplete/:id": {
		controller: "ScreentrackingController",
		action: "viewIncomplete"
	},
	"post /admin/getChangeLoanOfferDetails": {
		controller: "ScreentrackingController",
		action: "getChangeLoanOfferDetails"
	},
	"post /admin/updateNewloanincomedetails": {
		controller: "ScreentrackingController",
		action: "updateNewloanincomedetails"
	},
	"post /admin/manualloanOfferdetails": {
		controller: "ScreentrackingController",
		action: "manualLoanOfferDetails"
	},
	"post /admin/savemanualLoanOfferDetails": {
		controller: "ScreentrackingController",
		action: "savemanualLoanOfferDetails"
	},
	"get /admin/loanofferinfo/:id": {
		controller: "ScreentrackingController",
		action: "loanofferinfo"
	},
	"post /admin/saveserviceloanoffer": {
		controller: "ScreentrackingController",
		action: "saveserviceloanoffer"
	},
	"get /admin/saveServiceLoanOfferFromDTI/:id": {
		controller: "ScreentrackingController",
		action: "saveServiceLoanOfferFromDTI"
	},
	"post /admin/senduseroffer": {
		controller: "ScreentrackingController",
		action: "senduseroffer"
	},
	"post /admin/deleteMultipleScreen": {
		controller: "ScreentrackingController",
		action: "deleteMultipleScreen"
	},
	/* not used in LOS */
	"get /contract/:id": {
		controller: "ScreentrackingController",
		action: "contract"
	},
	"get /admin/resendplaidlink/:id": {
		controller: "ScreentrackingController",
		action: "resendplaidlink"
	},
	"post /admin/changeincome/:id": {
		controller: "ScreentrackingController",
		action: "changeincome"
	},
	"post /admin/changeincomeincomplete/:screenid": {
		controller: "ScreentrackingController",
		action: "changeincome"
	},
	"post /admin/changeincomeDenied/:id": {
		controller: "ScreentrackingController",
		action: "changeincomeDenied"
	},
	"post /admin/addScreentrackingComments": {
		controller: "ScreentrackingController",
		action: "addScreentrackingComments"
	},
	"get /admin/ajaxScreentrackingComments/:id": {
		controller: "ScreentrackingController",
		action: "ajaxScreentrackingComments"
	},
	"post /admin/incompletegetrepullPlaidDetails": {
		controller: "ScreentrackingController",
		action: "incompletegetrepullPlaidDetails"
	},
	"post /admin/movetoincompleteupdate": {
		controller: "ScreentrackingController",
		action: "movetoincompleteupdate"
	},
	"post /admin/markToIncompleteApp": {
		controller: "ScreentrackingController",
		action: "markToIncompleteApp"
	},
	"post /admin/movetoarchive": {
		controller: "ScreentrackingController",
		action: "movetoarchive"
	},
	"post /admin/unarchive": {
		controller: "ScreentrackingController",
		action: "unarchive"
	},
	/* ****************************** Admin User ************************************ */
	"get /admin/changepassword": {
		controller: "AdminuserController",
		action: "changepassword"
	},
	"post /admin/updatepassword": {
		controller: "AdminuserController",
		action: "updatepassword"
	},
	"get /admin/adminuserlist": {
		controller: "AdminuserController",
		action: "adminuserlist"
	},
	"get /admin/ajaxadminuserlist": {
		controller: "AdminuserController",
		action: "ajaxadminuserlist"
	},
	"get /admin/createnewuser": {
		controller: "AdminuserController",
		action: "createnewuser"
	},
	"post /admin/addnewuser": {
		controller: "AdminuserController",
		action: "addnewuser"
	},
	"get /admin/edituser/:id": {
		controller: "AdminuserController",
		action: "edituser"
	},
	"post /admin/updateuser": {
		controller: "AdminuserController",
		action: "updateuser"
	},
	"post /admin/updateAdminUserStatus": {
		controller: "AdminuserController",
		action: "updateAdminUserStatus"
	},
	"post /resetPassword": {
		controller: "AdminuserController",
		action: "resetPassword"
	},
	"get /admin/sendContinueAppEmail/:userID/:screentrackingID": {
		controller: "AdminuserController",
		action: "sendContinueAppEmail"
	},
	/* ************************** Edit Loan Credit Tiers ******************************** */
	"post /admin/editCreditTiers": {
		controller: "AdminuserController",
		action: "editCreditTiers"
	},
	
	/* ****************************** Plaid User ************************************ */
	"post /savebankdetails": {
		controller: "PlaidUserController",
		action: "savebankdetails"
	},
	"get /selectNewbank/:id/:banktoken": {
		controller: "PlaidUserController",
		action: "selectNewbank"
	},
	"post /selectedNewBank": {
		controller: "PlaidUserController",
		action: "selectedNewBank"
	},
	"get /changeBankresponse": {
		controller: "PlaidUserController",
		action: "changeBankresponse"
	},
	"post /servicegetuploadeddocuments": {
		controller: "ApplicationController",
		action: "servicegetuploadeddocuments"
	},
	"get /contract": {
		controller: "ApplicationController",
		action: "contract"
	},
	/* ***************** TestController ******************** */
	"get /testTransunioun": {
		controller: "TestController",
		action: "testTransunioun"
	},
	"get /testActumDebit": {
		controller: "TestController",
		action: "testActumDebit"
	},
	"get /testStripeRecurringPayment": {
		controller: "TestController",
		action: "testStripeRecurringPayment"
	},
	"get /testActumRecurringPayment": {
		controller: "TestController",
		action: "testActumRecurringPayment"
	},
	"get /testCheckActumPayment": {
		controller: "TestController",
		action: "testCheckActumPayment"
	},
	"get /testRegeneratePromissoryNote/:limitvalue": {
		controller: "TestController",
		action: "testRegeneratePromissoryNote"
	},
	"get /testcheckCreditStatus": {
		controller: "TestController",
		action: "testcheckCreditStatus"
	},
	"get /testShowInterestRate/:statecode/:term/:amount": {
		controller: "TestController",
		action: "testShowInterestRate"
	},
	"get /admin/updateLoansetting": {
		controller: "TestController",
		action: "updateLoansetting"
	},
	"get /testFundPracticeCreditPayment": {
		controller: "TestController",
		action: "testFundPracticeCreditPayment"
	},
	"GET /test-makeAmortizationSchedule": { controller: "TestController", action: "testMakeAmortizationSchedule" },
	"get /testExportFundedContracts": {
		controller: "TestController",
		action: "testExportFundedContracts"
	},
	"GET /test/archiveIncompleteApplications": { controller: "TestController", action: "archiveIncompleteApplications" },
	"GET /test/expiredUsersDenied": { controller: "TestController", action: "expiredUsersDenied" },
	"GET /test/procedureConfirmedMailer": {controller:"TestController",actions:"procedureConfirmedMailer"},
	"GET /test/procerdureConfirmedEmail": {controller: "TestController", actions: "procedureConfirmedEmail"},


	/* ******************************* Practice Report **************************************** */
	"get /admin/practiceCreditReportList": {
		controller: "PracticereportController",
		action: "showPracticeReportList"
	},
	"get /admin/ajaxCreditReportList": {
		controller: "PracticereportController",
		action: "ajaxCreditReportList"
	},
	/* ****************************** Default User Update ************************************ */
	"post /admin/repullPayment": {
		controller: "AchController",
		action: "repullPayment"
	},
	/* ****************************** My Profile ************************************ */
	"get /post/rulesdecision": {
		controller: "ApplicationController",
		action: "viewRuleDecisionMaker"
	},
	"post /post/rulesdecision": {
		controller: "ApplicationController",
		action: "postRuleDecisionMaker"
	},
	"post /post/newrulesdecision": {
		controller: "ApplicationController",
		action: "postNewRuleDecision"
	},
	"get /gettransuniondetails/:id": {
		controller: "ApplicationController",
		action: "getTransunionDetails"
	},
	"get /getUserBankDetails/:id": {
		controller: "ApplicationController",
		action: "getUserBankDetails"
	},
	"get /getPaymentmanagementDetails/:id": {
		controller: "ApplicationController",
		action: "getPaymentmanagementDetails"
	},
	"post /admin/updateUserNameDetails": {
		controller: "UserController",
		action: "updateUserNameDetails"
	},
	"post /admin/updateAddressDetails": {
		controller: "UserController",
		action: "updateAddressDetails"
	},
	/* ****************************** Manage Doctors Module ************************************ */
	"post /admin/addProductRule": {
		controller: "PracticeController",
		action: "addProductRule"
	},
	"post /admin/editProductRule": {
		controller: "PracticeController",
		action: "editProductRule"
	},
	"post /admin/editCreditTier": {
		controller: "PracticeController",
		action: "editCreditTier"
	},
	"post /admin/editCreditTierSettings": {
		controller: "PracticeController",
		action: "editCreditTierSettings"
	},
	"post /admin/editCreditRange": {
		controller: "PracticeController",
		action: "editCreditRange"
	},
	"post /admin/editCreditRangePracticeSettings": {
		controller: "PracticeController",
		action: "editCreditRangePracticeSettings"
	},
	"post /admin/addRule": {
		controller: "PracticeController",
		action: "addRule"
	},
	"post /admin/addBtrSetting": {
		controller: "PracticeController",
		action: "addBtrSetting"
	},
	"get /admin/managepractice": {
		controller: "PracticeController",
		action: "practiceList"
	},
	"get /admin/practicesettings": {
		controller: "PracticeController",
		action: "practiceSettings"
	},
	"get /admin/createpractice": {
		controller: "PracticeController",
		action: "createpractice"
	},
	"get /admin/createsettings": {
		controller: "PracticeController",
		action: "createsettings"
	},
	"post /admin/addnewpractice": {
		controller: "PracticeController",
		action: "addnewpractice"
	},
	"post /admin/editpracticesetting": {
		controller: "PracticeController",
		action: "editpracticesetting"
	},
	"post /admin/addnewsetting": {
		controller: "PracticeController",
		action: "addnewsetting"
	},
	"get /admin/deletesetting/:id": {
		controller: "PracticeController",
		action: "deletesetting"
	},
	"get /admin/ajaxpracticeList": {
		controller: "PracticeController",
		action: "ajaxpracticeList"
	},
	"get /admin/ajaxpracticeSettingsList": {
		controller: "PracticeController",
		action: "ajaxpracticeSettingsList"
	},
	"get /admin/editpractice/:id": {
		controller: "PracticeController",
		action: "editpractice"
	},
	"get /admin/editsettings/:id": {
		controller: "PracticeController",
		action: "editsetting"
	},
	"post /admin/updatepractice/:id": {
		controller: "PracticeController",
		action: "updatepractice"
	},
	"get /admin/managepracticeadmin": {
		controller: "PracticeController",
		action: "practiceAdminList"
	},
	"get /admin/ajaxpracticeAdminUserList": {
		controller: "PracticeController",
		action: "ajaxpracticeAdminUserList"
	},
	"get /admin/addPracticeAdmin/:id": {
		controller: "PracticeController",
		action: "addPracticeAdmin"
	},
	"get /admin/addPracticeAdmin": {
		controller: "PracticeController",
		action: "addPracticeAdmin"
	},
	"post /admin/addnewpracticeAdminUser": {
		controller: "PracticeController",
		action: "addnewpracticeAdminUser"
	},
	"get /admin/editpracticeadminuser/:id": {
		controller: "PracticeController",
		action: "editpracticeadminuser"
	},
	"post /admin/updatepracticeAdminUser/:id": {
		controller: "PracticeController",
		action: "updatepracticeAdminUser"
	},
	"post /admin/autoFillingUniversity": {
		controller: "PracticeController",
		action: "autoFillingUniversity"
	},
	"post /admin/getschoolBranch": {
		controller: "PracticeController",
		action: "getschoolBranch"
	},
	"get /admin/resendinvite/:id": {
		controller: "PracticeController",
		action: "resendinvite"
	},
	"get /admin/checkpracticeurl": {
		controller: "PracticeController",
		action: "checkpracticeurl"
	},
	"get /admin/viewpracticedetails/:id": {
		controller: "PracticeController",
		action: "viewpracticedetails"
	},
	"post /admin/addBtr": {
		controller: "PracticeController",
		action: "addBankTransactionRule"
	},
	"get /admin/practicesetting/:id": {
		controller: "PracticeController",
		action: "practicesettingEdit"
	},
	"post /admin/pfiArchiveReport": {
		controller: "PracticeContoller",
		action: "pfiArchiveReport"
	},
	"get /ajaxGetCurrentLoggedInPractice": {
		controller: "PracticeController",
		action: "ajaxGetCurrentLoggedInPractice"
	},
	/* ****************************** apple-app-site-association ************************************ */
	"get /apple-app-site-association": function( req, res ) {
		const remoteIP = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;
		return res.json( remoteIP );
	},
	"post /admin/incompleteUploadDocumentProof": {
		controller: "AchController",
		action: "incompleteUploadDocumentProof"
	},
	"get /admin/ajaxAllusersComments/:id": {
		controller: "ScreentrackingController",
		action: "ajaxAllusersComments"
	},
	"post /admin/addAlluserComments": {
		controller: "ScreentrackingController",
		action: "addAlluserComments"
	},
	"post /admin/changeincomefromincomplete/:screenid": {
		controller: "ScreentrackingController",
		action: "changeincomeFromOffer"
	},
	"post /admin/incompleteDenyloan": {
		controller: "ScreentrackingController",
		action: "incompleteDenyUserLoan"
	},
	"get /maintenance": {
		controller: "UserController",
		action: "maintenanceView"
	},
	"get /admin/viewBlocked/:id": {
		controller: "ScreentrackingController",
		action: "viewBlocked"
	},
	"post /admin/unBlockLoan/:id": {
		controller: "ScreentrackingController",
		action: "unBlockLoan"
	},
	/* ****************************** CustomerService Controller ************************************ */
	"get /admin/addApplication": {
		controller: "CustomerServiceController",
		action: "addApplicationByCustomerService"
	},
	"post /admin/addNewUserByCustomerService": {
		controller: "CustomerServiceController",
		action: "addNewUserByCustomerService"
	},
	"get /admin/transUnionInfoByCustomerService": {
		controller: "CustomerServiceController",
		action: "transUnionInfoByCustomerService"
	},
	/* ****************************** Approve patient loan ************************************ */
	"post /admin/approvepatientloan": {
		controller: "AchController",
		action: "approvePatientloan"
	},
	"post /admin/updatepatientloanstartdate": {
		controller: "AchController",
		action: "updatePatientloanstartdate"
	},
	"get /actumCreditTesting": function( req, res ) {
		const remoteIP = req.headers[ "x-forwarded-for" ] || req.connection.remoteAddress;
		return res.json( remoteIP );
	},
	/* ******* Provider list ******* */
	"get /admin/providerlist": {
		controller: "AchController",
		action: "providerlist"
	},
	"get /admin/ajaxProvider": {
		controller: "AchController",
		action: "ajaxProvider"
	},
	"get /admin/createpractice/:providerid": {
		controller: "PracticeController",
		action: "createpractice"
	},
	"get /createloandetails": {
		controller: "ApplicationController",
		action: "createloandetails"
	},
	"get /finalize": {
		controller: "ApplicationController",
		action: "finalize"
	},
	"get /thankyou": {
		controller: "ApplicationController",
		action: "thankyou"
	},
	"get /finalize/validate": {
		controller: "ApplicationController",
		action: "finalizeValidate"
	},
	"post /twilio/startverification": {
		controller: "TwilioController",
		action: "startverification"
	},
	"post /twilio/validateCode": {
		controller: "TwilioController",
		action: "validate"
	},
	"post /joinRoom": {
		controller: "UserController",
		action: "joinRoom"
	},
	"post /changemobile": {
		controller: "UserController",
		action: "changemobile"
	},
	"post /saveloanoffer": {
		controller: "ApplicationController",
		action: "saveloanoffer"
	},
	"post /createpromissorypdf":{
		controller: "ApplicationController",
		action: "createpromissorypdf"
	},

	"get /checkemail": {
		controller: "CustomerServiceController",
		action: "checkEmail"
	},

	// -- Unique practice url
	"GET /:urlpath": {
		controller: "HomeController",
		action: "practiceApplication"
	},

	"GET /admin/import/applications": { controller: "ApplicationController", action: "importApplications" },
	"POST /admin/import/applications": { controller: "ApplicationController", action: "importApplicationsPost" },
	"POST /admin/application/continue/:id": { controller: "ApplicationController", action: "continueApplicationPost" },
	"post /submitApplicationButton": {
		controller: "ApplicationController",
		action: "submitApplicationButton"
	},

};
