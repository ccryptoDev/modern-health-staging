/* global module, sails, User, PracticeManagement, Screentracking */

'use strict';

var moment = require('moment');
var Q = require('q');

var mailerConfig = sails.config.mailer;

module.exports = {
    /* sent to customer */
    senduserRegisterEmail: senduserRegisterEmail,
    profileEmailSend: profileEmailSend,
    sendforgotpasswordEmail: sendforgotpasswordEmail,
    sendFundedLoanMail: sendFundedLoanMail,
    sendNewOfferDetails: sendNewOfferDetails,
    sendUserRegisterByCustomerServiceEmail: sendUserRegisterByCustomerServiceEmail,
    continueApplicationEmail: continueApplicationEmail,
    sendAdminRegisterEmail: sendAdminRegisterEmail,
    sendProcedureConfirmedEmail: sendProcedureConfirmedEmail,
    /* sent to admins and customer service */
    sendAdminForgetPasswordEmail: sendAdminForgetPasswordEmail,
    changePasswordEmail: changePasswordEmail,
    sendNewPracticeEmail: sendNewPracticeEmail,
    resendInviteUrl: resendInviteUrl,
    userAdminVerification: userAdminVerification,
    sendContinueApplicationEmail: sendContinueApplicationEmail,
    sendAddBankInvitation: sendAddBankInvitation
};

/* sent to customer start */
function senduserRegisterEmail(user) {
    const hostName = mailerConfig.hostName;
    // let hostName = "http://localhost:8300";
    const Link = hostName + "/emailverifylanding/" + user.id;
    const email = user.email;
    const name = user.firstname;
    const rolename = user.rolename;

    User.findOne({ email: user.email })
        .then((registermailforuser) => {
            PracticeManagement.findOne({ id: registermailforuser.practicemanagement })
                .then((practicemanagement) => {
                    sails.renderView('emailTemplates/userregisteremail', {
                        layout: false,
                        Link: Link,
                        practiceName: practicemanagement.PracticeName,
                        email: email,
                        name: name,
                        rolename: rolename,
                        registermailforuser: registermailforuser,
                        hostName: hostName
                    }, (err, view) => {
                        if (err) {
                            sails.log.error('Email template for Forgot password error', err);
                        } else {
                            const mailer = mailerConfig.contactAccount;
                            const mailOptions = {
                                from: mailerConfig.sender,
                                to: user.email,
                                subject: 'Registration Success',
                                html: view
                            };
                            mailer.sendMail(mailOptions, function(error, info) {
                                if (error) {
                                    sails.log.error('Mailer error', error);
                                    console.log('Mailer error', error);
                                }
                                sails.log.info('Message sent: ', info);
                            });
                        }
                    });
                });
        });
    return;
}

function profileEmailSend(userdetails) {
    sails.log.info("EmailService.profileEmailSend userdetails:", userdetails);
    const hostName = mailerConfig.hostName;
    // const hostName = "http://localhost:8300";
    const Link = hostName + "/emailverifylanding/" + userdetails.id;
    const email = userdetails.email;
    const name = userdetails.firstname;
    const rolename = userdetails.rolename;

    return User.findOne({ email: userdetails.email })
        .then((registermailforuser) => {
            return PracticeManagement.findOne({ id: registermailforuser.practicemanagement })
                .then((practicemanagement) => {
                    return new Promise((resolve, reject) => {
                        sails.renderView("emailTemplates/profileEmail", {
                            layout: false,
                            Link: Link,
                            email: email,
                            name: name,
                            practiceName: practicemanagement.PracticeName,
                            rolename: rolename,
                            registermailforuser: registermailforuser,
                            hostName: hostName
                        }, function(err, view) {
                            if (err) {
                                sails.log.error('Email template for Forgot password error', err);
                                return reject(err);
                            } else {
                                const mailer = mailerConfig.contactAccount;
                                const mailOptions = {
                                    from: mailerConfig.sender,
                                    to: userdetails.email,
                                    subject: 'Account Verification',
                                    html: view
                                };
                                mailer.sendMail(mailOptions, function(error, info) {
                                    if (error) {
                                        sails.log.error('Mailer error', error);
                                        console.log('Mailer error', error);
                                        return reject(error);
                                    }
                                    sails.log.info('Message sent: ', info);
                                    // console.log('Message %s sent: %s', info.messageId, info.response);
                                    return resolve();
                                });
                            }
                        });
                    });
                });
        });
}

function sendforgotpasswordEmail(user) {
    const hostName = mailerConfig.hostName;
    // const hostName = "http://localhost:8300";
    const Link = hostName + '/usersetpassword/' + user.id;

    User.findOne({ email: user.email })
        .then(function(forgotpassworddetail) {
            PracticeManagement.findOne({ id: forgotpassworddetail.practicemanagement })
                .then((practicemanagement) => {
                    sails.renderView('emailTemplates/userforgetpassword', {
                        layout: false,
                        Link: Link,
                        practiceName: practicemanagement.PracticeName,
                        user: user,
                        name: forgotpassworddetail.firstname,
                        forgotpassworddetail: forgotpassworddetail,
                        hostName: hostName
                    }, function(err, view) {
                        if (err) {
                            sails.log.error('Email template for Forgot password error', err);
                        } else {
                            const mailer = mailerConfig.contactAccount;
                            const mailOptions = {
                                from: mailerConfig.sender,
                                to: user.email,
                                subject: 'Forgot Password',
                                html: view
                            };
                            mailer.sendMail(mailOptions, function(error, info) {
                                if (error) {
                                    sails.log.error('Mailer error', error);
                                    console.log('Mailer error', error);
                                }
                                sails.log.info('Message sent: ', info);
                            });
                        }
                    });
                });
        });
    return;
}

function sendFundedLoanMail(loanData) {
    const currentDate = moment().format('MM-DD-YYYY');
    const hostName = mailerConfig.hostName;
    // const hostName = "http://localhost:8300";
    const loanReference = loanData.loanReference;
    const firstname = loanData.firstname;
    // var userLoginurl = hostName + '/signin';
    const Link = hostName + '/';

    const firstDueDate = moment(loanData.comprehensiveData.loanSetdate).add(30, 'days').toDate();
    sails.renderView('emailTemplates/loanFunded', {
        layout: false,
        currentDate: currentDate,
        practiceName: loanData.practiceName,
        hostName: hostName,
        loanReference: loanReference,
        name: firstname,
        link: Link,
        comprehensiveData: loanData.comprehensiveData,
        firstDueDate: firstDueDate
    }, function(err, view) {
        if (err) {
            sails.log.error('Email template rendering error', err);
        } else {
            const mailer = mailerConfig.contactAccount;
            const mailOptions = {
                from: mailerConfig.sender,
                to: loanData.email,
                subject: 'Agreement Approved',
                html: view
            };
            mailer.sendMail(mailOptions, function(error, info) {
                if (error) {
                    sails.log.error('Mailer error', error);
                    console.log('Mailer error', error);
                }
                sails.log.info('Message sent: ', info);
            });
        }
    });
    return;
}

function sendNewOfferDetails(screenID) {
    const hostName = mailerConfig.hostName;
    //const hostName = "http://localhost:8300";
    sails.log.info("EmailService.sendNewOfferDetails screenID:", screenID);

    Screentracking.findOne({ id: screenID })
        .populate('user')
        .populate('practicemanagement')
        .then(function(screenDetails) {
            var offerData = screenDetails.offerdata[0];
            console.log(offerData);
            var userDetails = screenDetails.user;
            var Link = hostName + "/login";

            sails.renderView('emailTemplates/changeloanoffer', {
                layout: false,
                Link: Link,
                practiceName: screenDetails.practicemanagement.PracticeName,
                email: userDetails.email,
                name: userDetails.firstname,
                userDetails: userDetails,
                hostName: hostName,
                offerData: offerData
            }, function(err, view) {
                if (err) {
                    sails.log.error('Email template for Notify from Denied error', err);
                } else {
                    const mailer = mailerConfig.contactAccount;
                    console.log(userDetails.email)
                    const mailOptions = {
                        from: mailerConfig.sender,
                        to: userDetails.email,
                        subject: 'New Offer Available',
                        html: view
                    };
                    mailer.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            sails.log.error('Mailer error', error);
                        }
                        sails.log.info('Message sent: ', info);
                    });
                }
            });
        });
    return;
}

function sendUserRegisterByCustomerServiceEmail(user, leadAPI) {
    // const hostName = "http://localhost:8300";
    const hostName = mailerConfig.hostName;
    const userLoginurl = hostName + '/setpassword/' + user.user_id;
    PracticeManagement.findOne({ id: user.practicemanagement })
        .then((practicemanagement) => {
            sails.renderView('emailTemplates/registerNewUserByCustomerService', {
                layout: false,
                user: user,
                practiceName: practicemanagement.PracticeName,
                name: user.firstname,
                Link: userLoginurl
            }, function(err, view) {
                if (err) {
                    sails.log.error('Email template rendering error', err);
                } else {
                    const mailer = mailerConfig.contactAccount;
                    const mailOptions = {
                        from: mailerConfig.sender,
                        to: user.email,
                        subject: 'User Registration By Customer Service',
                        html: view
                    };
                    mailer.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            sails.log.error('Mailer error', error);
                            console.log('Mailer error', error);
                        }
                        sails.log.info('Message sent: ', info);
                        // console.log('Message %s sent: %s', info.messageId, info.response);
                    });
                }
            });
        });
    return;
}

function continueApplicationEmail(emailData) {
    // const hostName = "http://localhost:8300";
    const hostName = mailerConfig.hostName;
    const email = emailData.userId;
    emailData.Link = hostName + "/user/confirm/set-password/" + email;
    // emailData.Link = `http://localhost:8300/user/confirm/set-password/${emailData.userId}`;
    // emailData.Link = `${mailerConfig.hostName}/user/confirm/set-password/${emailData.userId}`;
    PracticeManagement.findOne({ id: emailData.practicemanagement })
        .then((practicemanagement) => {
            emailData.practiceName = practicemanagement.PracticeName;
            const data = {
                user: emailData.user,
                practicedetail: practicemanagement,
                hostName,
            }
            sails.renderView("emailTemplates/continueApplicationEmail", data, (err, view) => {
                if (err) {
                    sails.log.error("continueApplicationEmail; err:", err);
                    return;
                }
                const mailer = mailerConfig.contactAccount;
                const mailOptions = {
                    from: mailerConfig.sender,
                    to: emailData.toEmail,
                    bcc: emailData.bccEmails,
                    subject: "Please continue your application",
                    html: view
                };
                mailer.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        sails.log.error("continueApplicationEmail; mailer err:", err);
                        return;
                    }
                    sails.log.info("continueApplicationEmail; sent:", info);
                });
            });
        });
}

function sendProcedureConfirmedEmail(data) {
    const { paymentmanagement, user, practicemanagement, account } = data;

    return UserBankAccount.findOne({ id: account.userBankAccount })
        .then((userbankaccount) => {
            const ssnLast4 = user.ssn_number.substring(user.ssn_number.length - 4)
            const bankAccountLast4 = account.accountNumber.substring(account.accountNumber.length - 4);
            const phone = user.phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
            const emailData = {
                hostName: mailerConfig.hostName,
                toEmail: user.email,
                accountNum: paymentmanagement.loanReference.replace("LN_", "MHF-"),
                practiceName: practicemanagement.PracticeName,
                financialStartDate: paymentmanagement.loanStartdate,
                financedAmount: paymentmanagement.finalpayoffAmount,
                procedureDate: paymentmanagement.procedureConfirmedDate,
                monthlyPayment: paymentmanagement.paymentSchedule[0].amount,
                firstPaymentDate: paymentmanagement.paymentSchedule[0].date,
                borrower: {
                    firstName: user.firstname,
                    lastName: user.lastname,
                    street: user.street,
                    city: user.city,
                    state: user.state,
                    zipCode: user.zipCode,
                    phone: phone,
                    ssn: ssnLast4
                },
                bank: {
                    autopay: account.type,
                    bankName: userbankaccount.institutionName,
                    accountType: account.accountSubType,
                    accountLast4: bankAccountLast4
                }
            }
            sails.log.error("MOhamed MOhideen", emailData.toEmail);
            sails.renderView("emailTemplates/procedureConfirmed", emailData, (err, view) => {
                if (err) {
                    sails.log.error("procedureConfirmedEmail; err:", err);
                    return;
                }
                const mailer = mailerConfig.contactAccount;
                const mailOptions = {
                    from: mailerConfig.sender,
                    to: emailData.toEmail,
                    bcc: emailData.bccEmails,
                    subject: "Welcome to Modern Health Finance",
                    html: view
                };
                mailer.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        sails.log.error("procedureConfirmedEmail; mailer err:", err);
                        return;
                    }
                    sails.log.info("procedureConfirmedEmail; sent:", info);
                });
            })

        }).catch((err) => {
            sails.log.error('procedureConfirme')
        })

    return Promise.resolve();

}
/* sent to customer end */
/* sent to admins and customer service start */
function sendAdminForgetPasswordEmail(user) {
    const adminLoginurl = mailerConfig.hostName + '/AdminLogin';
    sails.renderView('emailTemplates/adminforgetpassword', {
        layout: false,
        user: user,
        name: user.name,
        Link: adminLoginurl
    }, function(err, view) {
        if (err) {
            sails.log.error('Email template rendering error', err);
        } else {
            const mailer = mailerConfig.contactAccount;
            const mailOptions = {
                from: mailerConfig.sender,
                to: user.email,
                subject: 'Admin Forget Password Request',
                html: view
            };
            mailer.sendMail(mailOptions, function(error, info) {
                if (error) {
                    sails.log.error('Mailer error', error);
                    console.log('Mailer error', error);
                }
                sails.log.info('Message sent: ', info);
                // console.log('Message %s sent: %s', info.messageId, info.response);
            });
        }
    });
    return;
}

function changePasswordEmail(user) {
    const adminLoginurl = mailerConfig.hostName + '/AdminLogin';
    sails.renderView('emailTemplates/changepasswordemail', {
        layout: false,
        user: user,
        name: user.name,
        Link: adminLoginurl
    }, function(err, view) {
        if (err) {
            sails.log.error('Email template rendering error', err);
        } else {
            const mailer = mailerConfig.contactAccount;
            const mailOptions = {
                from: mailerConfig.sender,
                to: user.email,
                subject: sails.config.lender.shortName + ' Admin password change notification',
                html: view
            };

            mailer.sendMail(mailOptions, function(error, info) {
                if (error) {
                    sails.log.error('Mailer error', error);
                    console.log('Mailer error', error);
                }
                sails.log.info('Message sent: ', info);
                // console.log('Message %s sent: %s', info.messageId, info.response);
            });
        }
    });
    return;
}

function sendAdminRegisterEmail(user) {
    const adminLoginurl = mailerConfig.hostName + '/AdminLogin';
    sails.renderView('emailTemplates/adminregisteremail', {
        layout: false,
        user: user,
        name: user.name,
        Link: adminLoginurl
    }, function(err, view) {
        if (err) {
            sails.log.error('Email template rendering error', err);
        } else {
            const mailer = mailerConfig.contactAccount;
            const mailOptions = {
                from: mailerConfig.sender,
                to: user.email,
                subject: sails.config.lender.shortName + ' Admin login Access',
                html: view
            };
            mailer.sendMail(mailOptions, function(error, info) {
                if (error) {
                    sails.log.error('Mailer error', error);
                    console.log('Mailer error', error);
                }
                sails.log.info('Message sent: ', info);
                // console.log('Message %s sent: %s', info.messageId, info.response);
            });
        }
    });
    return;
}

function sendNewPracticeEmail(practiceData) {
    const hostName = mailerConfig.hostName;
    const Link = practiceData.PracticeUrl;
    const emailId = practiceData.PracticeEmail;
    const name = practiceData.PracticeName;

    PracticeManagement.findOne({ PracticeEmail: emailId }).then(function(practicedetail) {
        sails.renderView(
            "emailTemplates/practiceinvite", {
                layout: false,
                Link: Link,
                practiceData: practiceData,
                name: name,
                hostName: hostName
            },
            function(err, view) {
                if (err) {
                    sails.log.error("Email template for Partner Invite error", err);
                } else {
                    const mailer = mailerConfig.contactAccount;
                    const mailOptions = {
                        from: mailerConfig.sender,
                        to: emailId,
                        subject: `Create ${sails.config.partner ? sails.config.partner.title : '[Missing partner title]'}`,
                        html: view
                    };
                    mailer.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            sails.log.error("Mailer error", error);
                            console.log("Mailer error", error);
                        }
                        sails.log.info("Message sent: ", info);
                    });
                }
            }
        );
    });
    return;
}

function resendInviteUrl(practiceData) {
    // const hostName = mailerConfig.hostName;
    const hostName = "http://localhost:8300";
    const Link = practiceData.PracticeUrl;
    const emailId = practiceData.PracticeEmail;
    const name = practiceData.PracticeName;
    PracticeManagement.findOne({ PracticeEmail: emailId })
        .then(function(practicedetail) {
            sails.renderView('emailTemplates/resendinvite', {
                layout: false,
                Link: Link,
                // practiceName: practiceData.PracticeName,
                practiceData: practiceData,
                name: name,
                hostName: hostName
            }, function(err, view) {
                if (err) {
                    sails.log.error('Email template for Practice Invite error', err);
                } else {
                    const mailer = mailerConfig.contactAccount;
                    const mailOptions = {
                        from: mailerConfig.sender,
                        to: emailId,
                        subject: 'Invite Url',
                        html: view
                    };
                    mailer.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            sails.log.error('Mailer error', error);
                            console.log('Mailer error', error);
                        }
                        sails.log.info('Message sent: ', info);
                    });
                }
            });
        });
    return;
}
/* sent to admins and customer service end */

function userAdminVerification(user) {
    // let hostName = mailerConfig.hostName;
    const activationCode = user.verificationcode;

    sails.renderView("emailTemplates/userAdminVerification", {
        layout: false,
        user: user,
        activationCode: activationCode
    }, function(err, view) {
        if (err) {
            sails.log.error("Email template rendering error", err);
        } else {
            // Change all the values to configurable options
            // Log messages
            const mailer = mailerConfig.contactAccount;
            const mailOptions = {
                from: mailerConfig.sender,
                to: user.email,
                subject: "User email verification code",
                html: view
            };
            // send email
            mailer.sendMail(mailOptions, function(error, info) {
                if (error) {
                    sails.log.error("Mailer error", error);
                    console.log("Mailer error", error);
                }
                sails.log.info("Message sent: ", info);
                // console.log('Message %s sent: %s', info.messageId, info.response);
            });
        }
    });
    return;
}

function sendContinueApplicationEmail(user) {
    var hostName = mailerConfig.hostName;
    //var Link = user.PracticeUrl;
    var emailId = user.email;

    PracticeManagement
        .findOne(user.practicemanagement)
        .then(function(practicedetail) {
            sails.log.info("Found practicedetail: ", practicedetail);

            sails.renderView('emailTemplates/continueApplicationEmail', {
                layout: false,
                // Link: Link,
                user: user,
                practicedetail: practicedetail,
                isResend: true,
                hostName: hostName
            }, function(err, view) {
                if (err) {
                    sails.log.error('Email template for send continue application email error', err);
                } else {
                    var mailer = mailerConfig.contactAccount,
                        mailOptions = {
                            from: mailerConfig.sender,
                            to: emailId,
                            subject: 'Continue Your Application',
                            html: view
                        };
                    mailer.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            sails.log.error('Mailer error', error);
                            console.log('Mailer error', error);
                        }
                        sails.log.info('Message sent: ', info);
                        //console.log('Message %s sent: %s', info.messageId, info.response);
                    });

                }
            });
        });
    return;
}

function sendAddBankInvitation(user) {
    // construct route
    // TODO:encodeURIComponent()
    const hostName = mailerConfig.hostName;
    const activationLink = hostName + "/addbank/login/" + user.id;

    return new Promise((resolve, reject) => {
        // get the template for the email
        sails.renderView(
            "emailTemplates/sendAddBankInvitation", {
                layout: false,
                link: activationLink,
                user: user
            },
            function(err, view) {
                if (err) {
                    sails.log.error("Email template rendering error", err);
                    return reject(err);
                } else {
                    // Change all the values to configurable options
                    // Log messages
                    const mailer = mailerConfig.contactAccount;
                    const mailOptions = {
                        from: mailerConfig.sender,
                        to: user.email,
                        subject: "Add Bank Account",
                        html: view
                    };

                    // send email
                    mailer.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            sails.log.error("Mailer error", error);
                            console.log("Mailer error", error);
                            return reject(error);
                        }
                        sails.log.info("Message sent: ", info);
                        // console.log('Message %s sent: %s', info.messageId, info.response);
                        resolve();
                    });
                }
            }
        );
    });

    return;
}