"use strict";

var Q = require("q"),
    _ = require("lodash"),
    moment = require("moment");
const ObjectId = require("mongodb").ObjectID;
const csvWriter = require("csv-writer");
const fs = require('fs');
const path = require("path");
module.exports = {
    processAndUploadFirstAssociatesLoanDocument: processAndUploadFirstAssociatesLoanDocument,
    processAndUploadFirstAssociatesLoanDocument_FullSpec: processAndUploadFirstAssociatesLoanDocument_FullSpec
};

function processAndUploadFirstAssociatesLoanDocument(paymentId) {
    const firstAssociateConfig = sails.config.firstAssociatesConfig.getFirstAssociateConfig();
    if(!firstAssociateConfig || !firstAssociateConfig.enabled) {
        return Promise.resolve();
    }
    sails.log.info("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: Generating CSV");
    return new Promise((resolve,reject) => {
        const csvColumnMappings = {
            loanReference: "Loan",
            paymentId: "Pri Loan ID",
            practiceNameSecPortfolio: "Sec Portfolio",
            secSubPortfolio: "Sec Portfolio",
            debitOnFile: "DebitOnFile",
            eCheckOnFile: "ECheckOnFile",
            smsVerificationStatus: "SMS Verification Status",
            borrowerFirstName: "Borrower First Name",
            borrowerLastName: "Borrower Last Name",
            borrowerEmail: "Borrower Email",
            borrowerPrimaryPhone: "Borrower Pri Phone",
            borrowerSecondaryPhone: "Borrower Sec Phone",
            borrowerAddress: "Borrower Address",
            borrowerCity: "Borrower City",
            borrowerState: "Borrower State",
            borrowerZipCode: "Borrower Zipcode",
            borrowerSSN: "Borrower SSN",
            borrowerDOB: "Borrower DOB",
            hasBorrowerEmail: "Borrower Email",
            borrowerBankRoutingNumber: "Borrower Bank Routing Number",
            borrowerBankAccountNumber: "Borrower Bank Account Number",
            borrowerCreditScore: "Borrower Credit Score FICO 09",

            coBorrowerFirstName: "CoBorrower First Name",
            coBorrowerLastName: "CoBorrower Last Name",
            coBorrowerEmail: "CoBorrower Email",
            coBorrowerPrimaryPhone: "CoBorrower Pri Phone",
            coBorrowerSecondaryPhone: "CoBorrower Sec Phone",
            coBorrowerAddress: "CoBorrower Address",
            coBorrowerCity: "CoBorrower City",
            coBorrowerState: "CoBorrower State",
            coBorrowerZipCode: "CoBorrower Zipcode",
            coBorrowerSSN: "CoBorrower SSN",
            coBorrowerDOB: "CoBorrower DOB",
            coBorrowerSecondaryEmail: "CoBorrower Email",
            coBorrowerRoutingNumber: "Co-Borrower Bank Routing Number",
            coBorrowerAccountNumber: "Co-Borrower Bank Account Number",
            coBorrowerCreditScore: "Co-Borrower Credit Score FICO 09",
            borrowerEmployerPhone: "Employer Phone",
            practiceName: "Source Company",
            loanStatus: "Loan Status",
            loanSubStatus: "Loan SubStatus",
            financedAmount: "Loan Amount",
            interestRate: "Interest Rate",
            loanTerm: "Term",
            paymentFrequency: "Payment Freq",
            loanSetDate: "Contract Date",
            firstPaymentDate: "1st Payment Date",
            paymentAmount: "Payment Amount",
            loanStartDate: "Contract Date",
            nextPaymentScheduleAmount: "nextScheduledPaymentAmount",
            numberOfScheduledPayments: "numberOfScheduledPayments",
            maturityDate: "originalMaturityDate",
            purchasedPoolId: "PurchasedPoolID",
            fundingTier: "Funding Tier",
            isAchAutoPay: "If ACH Autopay (Y/N)",
            mla: "MLA",
            mapr: "MAPR",
            loanTypeFALS: "LoanType_FALS"
        };



        const csvHeaderObj = [];
        const csvRows = [];
        let fileName = "Flow";
        _.each(Object.keys(csvColumnMappings), (columnData) => {
            csvHeaderObj.push({id: columnData, title: csvColumnMappings[columnData]});
        });
        PaymentManagement.findOne({id: paymentId})
        // PaymentManagement.find({hasFirstAssociatesBeenUploaded: {$ne: 1}, loanSetdate: {$exists: true}, achstatus: 1, status: "OPENED", procedureWasConfirmed: 1})
            .populate('practicemanagement')
            .populate('screentracking')
            .populate('user')
            .populate('account')
            .then((paymentManagement) => {
                if(paymentManagement) {

                        const practiceManagement =  paymentManagement.practicemanagement || {};
                        const screenTracking = paymentManagement.screentracking || {};
                        const offerData = screenTracking.offerdata && screenTracking.offerdata.length > 0?screenTracking.offerdata[0]: {};
                        const userData = paymentManagement.user || {};
                        const paymentSchedules = paymentManagement.paymentSchedule;
                        const account = paymentManagement.account || {};
                        let firstPayment = {};
                        let nextPayment = {};
                        if(paymentSchedules && paymentSchedules.length > 0) {
                            _.each(paymentSchedules, (paymentSchedule) => {
                                if(paymentSchedule.monthcount === 1) {
                                    firstPayment = paymentSchedule;
                                }else if(paymentSchedule.monthcount === 2) {
                                    nextPayment = paymentSchedule;
                                }
                            });
                        }
                        const csvData = {};
                        let loanReference = paymentManagement.loanReference;
                        let fullLoanReference = loanReference;
                        if(!!paymentManagement.loanReference){
                            loanReference = loanReference.replace("_","-");
                            fullLoanReference = loanReference;

                            if( loanReference.toLowerCase().startsWith("pfi-")){
                                loanReference = loanReference.substr(4);
                            }else if(loanReference.toLowerCase().startsWith("ln-")){
                                loanReference = loanReference.substr(3);
                            }
                        }
                        csvData["loanReference"] = loanReference;
                        // csvData["paymentId"] = paymentManagement.id;
                        csvData["paymentId"] = fullLoanReference;
                        csvData["practiceNameSecPortfolio"] = practiceManagement.PracticeName + " - New IHF Purchased";
                        csvData["secSubPortfolio"] = "Pool_33";

                        csvData["debitOnFile"] = "FALSE";
                        csvData["eCheckOnFile"] = "FALSE";
                        csvData["smsVerificationStatus"] = "Primary Phone - verified";
                        csvData["borrowerFirstName"] = userData.firstname;
                        csvData["borrowerLastName"] = userData.lastname;
                        csvData["borrowerEmail"] = userData.email;
                        csvData["borrowerPrimaryPhone"] = userData.phoneNumber;
                        csvData["borrowerSecondaryPhone"] = "";
                        csvData["borrowerAddress"] = userData.street;
                        csvData["borrowerCity"] = userData.city;
                        csvData["borrowerState"] = userData.state;
                        csvData["borrowerZipCode"] = userData.zipCode;
                        csvData["borrowerSSN"] = userData.ssn_number;
                        csvData["borrowerDOB"] = userData.dateofBirth? moment(userData.dateofBirth).format("MM/DD/YYYY"): "";
                        csvData["hasBorrowerEmail"] = !!userData.email?"Yes":"No";

                        csvData["borrowerCreditScore"] = screenTracking.creditscore;

                        csvData["coBorrowerFirstName"] = "";
                        csvData["coBorrowerLastName"] = "";
                        csvData["coBorrowerEmail"] = "";
                        csvData["coBorrowerPrimaryPhone"] = "";
                        csvData["coBorrowerSecondaryPhone"] = "";
                        csvData["coBorrowerAddress"] = "";
                        csvData["coBorrowerCity"] = "";
                        csvData["coBorrowerState"] = "";
                        csvData["coBorrowerZipCode"] = "";
                        csvData["coBorrowerSSN"] = "";
                        csvData["coBorrowerDOB"] = "";
                        csvData["coBorrowerSecondaryEmail"] = "";
                        csvData["coBorrowerRoutingNumber"] = "";
                        csvData["coBorrowerAccountNumber"] = "";
                        csvData["coBorrowerCreditScore"] = "";

                        csvData["borrowerEmployerPhone"] = "";
                        csvData["practiceName"] = practiceManagement.PracticeName;
                        csvData["loanStatus"] = "Active";
                        csvData["loanSubStatus"] = "Current Loan";
                        csvData["financedAmount"] = paymentManagement.payOffAmount;
                        csvData["interestRate"] = offerData.interestRate;
                        csvData["loanTerm"] = offerData.term;
                        csvData["paymentFrequency"] = "Monthly";
                        csvData["loanSetDate"] = paymentManagement.loanSetdate?moment(paymentManagement.loanSetdate).format("MM/DD/YYYY"): "";
                        csvData["firstPaymentDate"] = firstPayment.date?moment(firstPayment.date).format("MM/DD/YYYY"): "";
                        csvData["paymentAmount"] = firstPayment.amount;
                        csvData["loanStartDate"] = paymentManagement.loanStartdate?moment(paymentManagement.loanStartdate).format("MM/DD/YYYY"): "";
                        // csvData["nextPaymentScheduleAmount"] = nextPayment.date?moment(nextPayment.date).format("MM/DD/YYYY"): "";
                        csvData["nextPaymentScheduleAmount"] = nextPayment.amount;

                        csvData["numberOfScheduledPayments"] = paymentSchedules?paymentSchedules.length: "";
                        csvData["maturityDate"] = paymentManagement.maturityDate? moment(paymentManagement.maturityDate).format("MM/DD/YYYY"):"";
                        csvData["purchasedPoolId"] = "Pool_33";
                        if(!!offerData.creditTier) {
                            csvData["fundingTier"] = `Tier ${offerData.creditTier}_${offerData.fundingRate}`;
                        }else {
                            csvData["fundingTier"] = "";
                        }
                        csvData["isAchAutoPay"] = "Y";
                        csvData["mla"] = "";
                        csvData["mapr"] = "";
                        csvData["loanTypeFALS"] = "Elective Surgery";
                        csvData["borrowerBankRoutingNumber"] = account.routingNumber;
                        csvData["borrowerBankAccountNumber"] = account.accountNumber.toString();


                        fileName += paymentManagement.loanReference+"_"+ moment(paymentManagement.loanSetdate).format("MMDDYYYY") + "_" + paymentManagement.id + ".csv";
                        csvRows.push(csvData);


                    if(firstAssociateConfig.enabled && csvHeaderObj.length > 0) {
                        mkdirp( firstAssociateConfig.csvPath);
                        const filePath = path.join(firstAssociateConfig.csvPath, fileName);
                        const createCsvWriter = csvWriter.createObjectCsvWriter({path: filePath,header:csvHeaderObj});
                        createCsvWriter.writeRecords(csvRows).then(() =>{

                            sails.log.info("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: Wrote CSV to " + filePath);
                            SftpService.uploadFile(filePath,path.join(firstAssociateConfig.sftpRemoteUploadFolder, fileName),sails.config.firstAssociatesConfig.getFirstAssociateSftpConfig()).then((response) => {
                                sails.log.info(`FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: Uploaded CSV to sftp to server '${firstAssociateConfig.sftpServer}' and folder '${path.join(firstAssociateConfig.sftpRemoteUploadFolder, fileName)}'`);
                                resolve({status: "success"});
                            } ).catch((errorObj) => {
                                sails.log.error("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: Sftp upload err", errorObj);
                                reject(errorObj);
                            });
                        }).catch((errorObj) => {
                            sails.log.error("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: create csv err", errorObj);
                            const errors = errorObj.message;
                            sails.log.error("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: create csv err", errors);
                            reject(errorObj);
                        });
                    }else {
                        sails.log.info("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: No CSV data to save");
                    }
                }

            }).catch((errorObj) => {
            sails.log.error("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: err", errorObj);
            const errors = errorObj.message;
            sails.log.error("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: err", errors);
            reject(errorObj);
        });
    });
}

// For the files to be uploaded to folder "MHF Full File Spec Export"
function processAndUploadFirstAssociatesLoanDocument_FullSpec(paymentId) {
    const firstAssociateConfig = sails.config.firstAssociatesConfig.getFirstAssociateConfig_FullSpec();
    if(!firstAssociateConfig || !firstAssociateConfig.enabled) {
        return Promise.resolve();
    }
    sails.log.info("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument_FullSpec :: Generating CSV");
    return new Promise((resolve,reject) => {
        const csvColumnMappings = {
            loanReference: "Loan",
            paymentId: "Pri Loan ID",
            practiceNameSecPortfolio: "Sec Portfolio",
            secSubPortfolio: "Sec Portfolio",
            debitOnFile: "DebitOnFile",
            eCheckOnFile: "ECheckOnFile",
            smsVerificationStatus: "SMS Verification Status",
            borrowerFirstName: "Borrower First Name",
            borrowerLastName: "Borrower Last Name",
            borrowerEmail: "Borrower Email",
            borrowerPrimaryPhone: "Borrower Pri Phone",
            borrowerSecondaryPhone: "Borrower Sec Phone",
            borrowerAddress: "Borrower Address",
            borrowerCity: "Borrower City",
            borrowerState: "Borrower State",
            borrowerZipCode: "Borrower Zipcode",
            borrowerSSN: "Borrower SSN",
            borrowerDOB: "Borrower DOB",
            hasBorrowerEmail: "Borrower Email",
            borrowerBankRoutingNumber: "Borrower Bank Routing Number",
            borrowerBankAccountNumber: "Borrower Bank Account Number",
            borrowerCreditScore: "Borrower Credit Score FICO 09",

            coBorrowerFirstName: "CoBorrower First Name",
            coBorrowerLastName: "CoBorrower Last Name",
            coBorrowerEmail: "CoBorrower Email",
            coBorrowerPrimaryPhone: "CoBorrower Pri Phone",
            coBorrowerSecondaryPhone: "CoBorrower Sec Phone",
            coBorrowerAddress: "CoBorrower Address",
            coBorrowerCity: "CoBorrower City",
            coBorrowerState: "CoBorrower State",
            coBorrowerZipCode: "CoBorrower Zipcode",
            coBorrowerSSN: "CoBorrower SSN",
            coBorrowerDOB: "CoBorrower DOB",
            coBorrowerSecondaryEmail: "CoBorrower Email",
            coBorrowerRoutingNumber: "Co-Borrower Bank Routing Number",
            coBorrowerAccountNumber: "Co-Borrower Bank Account Number",
            coBorrowerCreditScore: "Co-Borrower Credit Score FICO 09",
            borrowerEmployerPhone: "Employer Phone",
            practiceName: "Source Company",
            loanStatus: "Loan Status",
            loanSubStatus: "Loan SubStatus",
            financedAmount: "Loan Amount",
            interestRate: "Interest Rate",
            loanTerm: "Term",
            paymentFrequency: "Payment Freq",
            loanSetDate: "Contract Date",
            firstPaymentDate: "1st Payment Date",
            paymentAmount: "Payment Amount",
            loanStartDate: "Contract Date",
            nextPaymentScheduleAmount: "nextScheduledPaymentAmount",
            numberOfScheduledPayments: "numberOfScheduledPayments",
            maturityDate: "originalMaturityDate",
            purchasedPoolId: "PurchasedPoolID",
            fundingTier: "Funding Tier",
            isAchAutoPay: "If ACH Autopay (Y/N)",
            mla: "MLA",
            mapr: "MAPR",
            loanTypeFALS: "LoanType_FALS",
            // New fileds
            userReference: "User Reference",
            r1Values: "R1_Values",
            r2Values: "R2_Values",
            r3Values: "R3_Values",
            r4Values: "R4_Values",
            r5Values: "R5_Values",
            r6Values: "R6_Values",
            r7Values: "R7_Values",
            createdDate: "Created Date",
            lastScreenDetails: "LastScreen Details",
            annualIncome: "Annual Income",
            monthlyIncome: "Monthly Income",
            anticipatedFinancedAmount: "Anticipated Financed Amount",
            preDTIDebt: "PreDTI Debt",
            preDTIDebtPercentage: "PreDTI Debt(%)",
            payrollDetectedIncome: "Payroll Detected Income",
            housingExpense: "Housing Expense",
            housingType: "Housing Type (Application)",
            counterOffered: "Counter offered",
            incomeType: "Income Type",
            plaidCompleted: "Plaid Completed (Y/N?)",
            plaidCurrentBalance: "Plaid Current Balance"
        };



        const csvHeaderObj = [];
        const csvRows = [];
        let fileName = "Flow";
        _.each(Object.keys(csvColumnMappings), (columnData) => {
            csvHeaderObj.push({id: columnData, title: csvColumnMappings[columnData]});
        });
        PaymentManagement.findOne({id: paymentId})
        // PaymentManagement.find({hasFirstAssociatesBeenUploaded: {$ne: 1}, loanSetdate: {$exists: true}, achstatus: 1, status: "OPENED", procedureWasConfirmed: 1})
            .populate('practicemanagement')
            .populate('screentracking')
            .populate('user')
            .populate('account')
            .then((paymentManagement) => {
                if(paymentManagement) {

                        const practiceManagement =  paymentManagement.practicemanagement || {};
                        const screenTracking = paymentManagement.screentracking || {};
                        const offerData = screenTracking.offerdata && screenTracking.offerdata.length > 0?screenTracking.offerdata[0]: {};
                        const userData = paymentManagement.user || {};
                        const paymentSchedules = paymentManagement.paymentSchedule;
                        const account = paymentManagement.account || {};
                        let firstPayment = {};
                        let nextPayment = {};
                        if(paymentSchedules && paymentSchedules.length > 0) {
                            _.each(paymentSchedules, (paymentSchedule) => {
                                if(paymentSchedule.monthcount === 1) {
                                    firstPayment = paymentSchedule;
                                }else if(paymentSchedule.monthcount === 2) {
                                    nextPayment = paymentSchedule;
                                }
                            });
                        }
                        const csvData = {};
                        let loanReference = paymentManagement.loanReference;
                        let fullLoanReference = loanReference;
                        if(!!paymentManagement.loanReference){
                            loanReference = loanReference.replace("_","-");
                            fullLoanReference = loanReference;

                            if( loanReference.toLowerCase().startsWith("pfi-")){
                                loanReference = loanReference.substr(4);
                            }else if(loanReference.toLowerCase().startsWith("ln-")){
                                loanReference = loanReference.substr(3);
                            }
                        }
                        csvData["loanReference"] = loanReference;
                        // csvData["paymentId"] = paymentManagement.id;
                        csvData["paymentId"] = fullLoanReference;
                        csvData["practiceNameSecPortfolio"] = practiceManagement.PracticeName + " - New IHF Purchased";
                        csvData["secSubPortfolio"] = "Pool_33";

                        csvData["debitOnFile"] = "FALSE";
                        csvData["eCheckOnFile"] = "FALSE";
                        csvData["smsVerificationStatus"] = "Primary Phone - verified";
                        csvData["borrowerFirstName"] = userData.firstname;
                        csvData["borrowerLastName"] = userData.lastname;
                        csvData["borrowerEmail"] = userData.email;
                        csvData["borrowerPrimaryPhone"] = userData.phoneNumber;
                        csvData["borrowerSecondaryPhone"] = "";
                        csvData["borrowerAddress"] = userData.street;
                        csvData["borrowerCity"] = userData.city;
                        csvData["borrowerState"] = userData.state;
                        csvData["borrowerZipCode"] = userData.zipCode;
                        csvData["borrowerSSN"] = userData.ssn_number;
                        csvData["borrowerDOB"] = userData.dateofBirth? moment(userData.dateofBirth).format("MM/DD/YYYY"): "";
                        csvData["hasBorrowerEmail"] = !!userData.email?"Yes":"No";

                        csvData["borrowerCreditScore"] = screenTracking.creditscore;

                        csvData["coBorrowerFirstName"] = "";
                        csvData["coBorrowerLastName"] = "";
                        csvData["coBorrowerEmail"] = "";
                        csvData["coBorrowerPrimaryPhone"] = "";
                        csvData["coBorrowerSecondaryPhone"] = "";
                        csvData["coBorrowerAddress"] = "";
                        csvData["coBorrowerCity"] = "";
                        csvData["coBorrowerState"] = "";
                        csvData["coBorrowerZipCode"] = "";
                        csvData["coBorrowerSSN"] = "";
                        csvData["coBorrowerDOB"] = "";
                        csvData["coBorrowerSecondaryEmail"] = "";
                        csvData["coBorrowerRoutingNumber"] = "";
                        csvData["coBorrowerAccountNumber"] = "";
                        csvData["coBorrowerCreditScore"] = "";

                        csvData["borrowerEmployerPhone"] = "";
                        csvData["practiceName"] = practiceManagement.PracticeName;
                        csvData["loanStatus"] = "Active";
                        csvData["loanSubStatus"] = "Current Loan";
                        csvData["financedAmount"] = paymentManagement.payOffAmount;
                        csvData["interestRate"] = offerData.interestRate;
                        csvData["loanTerm"] = offerData.term;
                        csvData["paymentFrequency"] = "Monthly";
                        csvData["loanSetDate"] = paymentManagement.loanSetdate?moment(paymentManagement.loanSetdate).format("MM/DD/YYYY"): "";
                        csvData["firstPaymentDate"] = firstPayment.date?moment(firstPayment.date).format("MM/DD/YYYY"): "";
                        csvData["paymentAmount"] = firstPayment.amount;
                        csvData["loanStartDate"] = paymentManagement.loanStartdate?moment(paymentManagement.loanStartdate).format("MM/DD/YYYY"): "";
                        // csvData["nextPaymentScheduleAmount"] = nextPayment.date?moment(nextPayment.date).format("MM/DD/YYYY"): "";
                        csvData["nextPaymentScheduleAmount"] = nextPayment.amount;

                        csvData["numberOfScheduledPayments"] = paymentSchedules?paymentSchedules.length: "";
                        csvData["maturityDate"] = paymentManagement.maturityDate? moment(paymentManagement.maturityDate).format("MM/DD/YYYY"):"";
                        csvData["purchasedPoolId"] = "Pool_33";
                        if(!!offerData.creditTier) {
                            csvData["fundingTier"] = `Tier ${offerData.creditTier}_${offerData.fundingRate}`;
                        }else {
                            csvData["fundingTier"] = "";
                        }
                        csvData["isAchAutoPay"] = "Y";
                        csvData["mla"] = "";
                        csvData["mapr"] = "";
                        csvData["loanTypeFALS"] = "Elective Surgery";
                        csvData["borrowerBankRoutingNumber"] = account.routingNumber;
                        csvData["borrowerBankAccountNumber"] = account.accountNumber.toString();
                        // New fields
                        csvData['userReference'] = userData.userReference;
                        for(let i = 0; i < 7; i++){
                            let tmp = i + 1;
                            if(screenTracking && screenTracking.rulesDetails && screenTracking.rulesDetails.ruledatacount && screenTracking.rulesDetails.ruledatacount[i]){
                                csvData['r' + tmp + 'Values'] = screenTracking.rulesDetails.ruledatacount[i];
                            }else{
                                csvData['r' + tmp + 'Values'] = "";
                            }
                        }
                        csvData['createdDate'] = paymentManagement.createdAt ? moment(paymentManagement.createdAt).format("MM/DD/YYYY"):"";
                        csvData['lastScreenDetails'] = screenTracking.lastScreenName;
                        csvData['annualIncome'] = screenTracking.incomeamount * 12;
                        csvData['monthlyIncome'] = screenTracking.incomeamount;
                        csvData['anticipatedFinancedAmount'] = screenTracking.offerdata[0].financedAmount;
                        csvData['preDTIDebt'] = screenTracking.preDTIMonthlyAmount;   
                        csvData['preDTIDebtPercentage'] = screenTracking.preDTIPercentValue;
                        csvData['payrollDetectedIncome'] = screenTracking.detectedPayroll;
                        csvData['housingExpense'] = screenTracking.housingExpense;
                        csvData['housingType'] = screenTracking.residenceType;
                        csvData['counterOffered'] = (screenTracking.loanchangeManually || screenTracking.loanchanged) ? "Y" : "N";
                        if(screenTracking.incometype == "Manually"){
                            csvData['incomeType'] = "Entered Manually";
                        }else if(screenTracking.incometype == "Automatically"){
                            csvData['incomeType'] = "Detected from Payroll";
                        }else{
                            csvData['incomeType'] = "Modified by admin";
                        }
                        csvData['plaidCompleted'] = screenTracking.filloutmanually ? "N" : "Y";
                        csvData['plaidCurrentBalance'] = account.balance.current;


                        fileName += paymentManagement.loanReference+"_"+ moment(paymentManagement.loanSetdate).format("MMDDYYYY") + "_" + paymentManagement.id + "_FullFileSpecExport" + ".csv";
                        csvRows.push(csvData);


                    if(firstAssociateConfig.enabled && csvHeaderObj.length > 0) {
                        mkdirp( firstAssociateConfig.csvPath);
                        const filePath = path.join(firstAssociateConfig.csvPath, fileName);
                        const createCsvWriter = csvWriter.createObjectCsvWriter({path: filePath,header:csvHeaderObj});
                        createCsvWriter.writeRecords(csvRows).then(() =>{

                            sails.log.info("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: Wrote CSV to " + filePath);
                            SftpService.uploadFile(filePath,path.join(firstAssociateConfig.sftpRemoteUploadFolder, fileName),sails.config.firstAssociatesConfig.getFirstAssociateSftpConfig()).then((response) => {
                                sails.log.info(`FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: Uploaded CSV to sftp to server '${firstAssociateConfig.sftpServer}' and folder '${path.join(firstAssociateConfig.sftpRemoteUploadFolder, fileName)}'`);
                                resolve({status: "success"});
                            } ).catch((errorObj) => {
                                sails.log.error("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: Sftp upload err", errorObj);
                                reject(errorObj);
                            });
                        }).catch((errorObj) => {
                            sails.log.error("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: create csv err", errorObj);
                            const errors = errorObj.message;
                            sails.log.error("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: create csv err", errors);
                            reject(errorObj);
                        });
                    }else {
                        sails.log.info("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: No CSV data to save");
                    }
                }

            }).catch((errorObj) => {
            sails.log.error("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: err", errorObj);
            const errors = errorObj.message;
            sails.log.error("FirstAssociatesService#processAndUploadFirstAssociatesLoanDocument :: err", errors);
            reject(errorObj);
        });
    });
}

function uploadFileToSftp(uploadFileStream) {

}
function mkdirp(filepath) {
    var dirname = path.dirname(filepath);

    if (!fs.existsSync(filepath)) {
        mkdirp(dirname);
    }else {
        return;
    }

        fs.mkdirSync(filepath);
}
