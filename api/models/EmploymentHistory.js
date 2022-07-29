/**
 * EmploymentHistory.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const ObjectId = require("mongodb").ObjectID;
const _ = require("lodash");
const moment = require("moment");

// const decisionCloudTypeOfPayroll = {
// 	DIRECT_DEPOSIT: "D",
// 	PAPER_CHECK: "P",
// };
// const decisionCloudPeriodicity = {
// 	BI_WEEKLY: "B",
// 	MONTHLY: "M",
// 	SEMI_MONTHLY: "S",
// 	WEEKLY: "W"
// };

// const decisionCloudFrequency = {
// 	WEEKLY: "W",
// 	WEEKLY_AS_BI_WEEKLY: "X",
// 	BI_WEEKLY: "B",
// 	TWO_SPECIFIC_DAYS: "F",
// 	SPECIFIC_WEEK_AND_DAYS: "T",
// 	SPECIFIC_DAY: "E",
// 	SPECIFIC_WEEK_AND_DAY: "O",
// 	NUM_BIZ_DAYS_AFTER: "C",
// 	SPECIFIC_WEEK_AND_DAY_AFTER_SPECIFIC_DAY: "D",
// 	EVERY_TWENTY_EIGHT_DAYS: "G",
// 	UNKNOWN: null
// };
const decisionCloudIsAfterHoliday = {
    BEFORE_HOLIDAY: 0,
    AFTER_HOLIDAY: 1,
    UNKNOWN: -1
};
// const decisionCloudIncomeType = {
// 	NOT_REQUIRED: "A",
// 	DISABILITY: "D",
// 	SOCIAL_SECURITY: "G",
// 	OTHER: "O",
// 	EMPLOYED: "P",
// 	PENSION: "S",
// 	UNEMPLOYED: "U",
// 	WELFARE: "W"
// };

const employmentStatusType = {
    Employed: "E",
    SelfEmployed: "S",
    Military: "M",
    Homemaker: "H",
    Retired: "R",
    Unemployed: "U"
}

const employerStatusType = {
    Active: "A",
    Inactive: "I"
}

const states = {
    AL: "Alabama",
    AK: "Alaska",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
}

module.exports = {
    attributes: {
        user: {
            model: 'User',
            index: true,
        },
        phone: {
            type: 'string',
        },
        employerName: {
            type: 'string',
        },
        employerCity: {
            type: 'string',
        },
        employerStatus: {
            type: 'string',
        },
        employerState: {
            type: 'string',
        },
        supervisorFirstname: {
            type: 'string',
        },
        supervisorMiddlename: {
            type: 'string'
        },
        supervisorLastname: {
            type: 'string',
        },
        jobTitle: {
            type: 'string',
        },
        employmentStatus: {
            type: 'string',
        },
        jobStartDate: {
            type: 'date',
        },
    },
    createOrUpdateEmploymentHistory: (employinfo) => {
        return new Promise((resolve, reject) => {
            employinfo.employmentStatus = employmentStatusType[employinfo.employmentStatus];
            employinfo.employerStatus = employerStatusType[employinfo.employerStatus];
            if (employinfo.user) {
                EmploymentHistory.findOne({ user: employinfo.user })
                    .then((result) => {
                        if (!result) {
                            EmploymentHistory.create(employinfo)
                                .then((result) => {
                                    resolve(result);
                                }, () => {
                                    reject({ message: "INTERNAL_SERVER_ERROR: Cannot create employment history record. EmploymentHistory.js / createOrUpdateEmploymentHistory()", code: 500 });
                                })
                        }
                        else {
                            EmploymentHistory.update({ user: employinfo.user })
                                .set(employinfo)
                                .then((result) => {
                                    resolve(result);
                                }, () => {
                                    reject({ message: "INTERNAL_SERVER_ERROR: Cannot update employment history record. EmploymentHistory.js / createOrUpdateEmploymentHistory()", code: 500 });
                                })
                        }
                    });
            }
            else {
                reject({ message: "Missing user id", code: 400 });
            }
        });
    },

    queryEmploymentHistory: (userid) => {
        return new Promise((resolve, reject) => {
            if (!userid) {
                return reject({ message: "Missing user id", code: 400 });
            }
            EmploymentHistory.findOne({ user: userid })
                .then((data) => {
                    if (!data) {
                        return resolve({});           // Return {} instaed of throw err because employment is almost empty and too many errs whill occur.
                    }
                    console.log('job Start Date...', data);
                    data.jobStartDate = data.jobStartDate ? data.jobStartDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
                    var es = data.employmentStatus;     // es: employment status
                    if (es === "E") {
                        data.employmentStatus = "Employed";
                    }
                    else if (es === "S") {
                        data.employmentStatus = "Self Employed";
                    }
                    else if (es === "M") {
                        data.employmentStatus = "Military";
                    }
                    else if (es === "H") {
                        data.employmentStatus = "Homemaker";
                    }
                    else if (es === "R") {
                        data.employmentStatus = "Retired";
                    }
                    else if (es === "U") {
                        data.employmentStatus = "Unemployed";
                    }
                    var ess = data.employerStatus;      // es: employer status
                    if (ess === "A") {
                        data.employerStatus = "Active";
                    }
                    else if (ess === "I") {
                        data.employerStatus = "Inactive";
                    }
                    // data.employerStateFullName = states[data.employerState];
                    return resolve(data);
                });
        });
    },
    // decisionCloudFrequency: decisionCloudFrequency,
    // decisionCloudPeriodicity: decisionCloudPeriodicity,
    decisionCloudIsAfterHoliday: decisionCloudIsAfterHoliday,
    // decisionCloudIncomeType: decisionCloudIncomeType,
    // decisionCloudTypeOfPayroll: decisionCloudTypeOfPayroll,
    getPayrollDatesFromEmploymentHistory: async (userId) => {
        const latestEmployment = await EmploymentHistory.getLatestEmploymentHistoryForUser(userId);
        if (latestEmployment) {
            // const payFrequency = latestEmployment.payFrequency || latestEmployment.periodicity || decisionCloudFrequency.BI_WEEKLY;
            let frequencies = SmoothPaymentService.getIncomePayFrequencies(latestEmployment.lastPayDate, latestEmployment.nextPayDate, latestEmployment.secondPayDate, null);
            if (frequencies && frequencies.length > 0) {
                const todayMoment = moment().startOf("day").startOf("month");
                const secondNextMonth = moment().add(2, "months").startOf("day").startOf("month");
                const nextMonth = moment().add(1, "months").startOf("day").startOf("month");
                return _.filter(frequencies, (freq) => {
                    const freqDate = moment(freq, "YYYY-MM-DD").startOf("day").startOf("month");
                    return freqDate.diff(todayMoment) === 0 || freqDate.diff(secondNextMonth) === 0 || freqDate.diff(nextMonth) === 0;
                });
            }
        }
        return [];
    },
    getLatestEmploymentHistoryForUser: (userId) => {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject({ message: "Missing user id", code: 400 });
            } else {
                EmploymentHistory.native((err, collection) => {
                    collection.aggregate(
                        [
                            {
                                $match: {
                                    "user": new ObjectId(userId)
                                }
                            },
                            {
                                $sort: { createdAt: 1 }
                            },
                            {
                                $group: {
                                    _id: "$_id",
                                    data: { $last: "$$ROOT" }
                                }
                            }
                        ],
                        function (err, result) {
                            if (err) {
                                sails.log.error("EmploymentHistory#getLatestEmploymentHistoryForUser :: err", err);
                                reject(err);
                            } else {
                                let employmentHistory = null;
                                if (result && result.length > 0 && result[0].data) {
                                    employmentHistory = result[0].data;
                                }
                                resolve(employmentHistory);
                            }
                        });
                });
            }
        });
    },
    // 	getCurrentEmployment: ( paymentID ) => {
    // 		return new Promise( ( resolve, reject ) => {
    // 			if(!paymentID) {
    // 				reject( { message: "Missing paymentI management id", code: 400 } );
    // 			} else {
    // 				EmploymentHistory.find( { paymentmanagement: paymentID } ).sort( "createdAt DESC" ).limit( 1 ).then( ( result ) => {
    // 					let employmentHistory = null;
    // 					if(result && result.length > 0 && result[0]) {
    // 						employmentHistory = result[0];
    // 					}
    // 					resolve( employmentHistory );
    // 				} ).catch( ( errorObj ) => {
    // 					sails.log.error( "EmploymentHistory#getCurrentEmployment :: err", errorObj );
    // 					reject( errorObj );
    // 				} );
    // 			}
    // 		} );
    // 	},
    // 	createNewEmployeeHistoryIfNotChanged: (employmentHistoryObj) => {
    // 		return new Promise((resolve,reject)=> {
    // 			if(!employmentHistoryObj){
    // 				sails.log.error( "EmploymentHistory#createNewEmployeeHistoryIfNotChanged :: Missing employment history data" );
    // 				reject({message: "Missing employment history data"});
    // 			}else {
    // 				const previousEmploymentId = employmentHistoryObj.employmentHistoryId;
    // 				if(!!previousEmploymentId) {
    // 					EmploymentHistory.findOne({id: new ObjectId(previousEmploymentId)}).then((employmentHistory) => {
    // 						if(!employmentHistory || !EmploymentHistory.isEmploymentHistoryEqual(employmentHistoryObj, employmentHistory)){
    // 							EmploymentHistory.create(_.assign({},employmentHistoryObj)).then((updateResponse) => {
    // 								resolve(updateResponse);
    // 							}).catch((errorObj) => {
    // 								sails.log.error( "EmploymentHistory#createNewEmployeeHistoryIfNotChanged :: err", errorObj );
    // 								reject(errorObj);
    // 							});
    // 						}else {
    // 							resolve(employmentHistory);
    // 						}
    // 					}).catch((errorObj) => {
    // 						sails.log.error( "EmploymentHistory#createNewEmployeeHistoryIfNotChanged :: err", errorObj );
    // 						reject(errorObj);
    // 					});
    // 				}else {
    // 					EmploymentHistory.create(_.assign({},employmentHistoryObj)).then((updateResponse) => {
    // 						resolve(updateResponse);
    // 					}).catch((errorObj) => {
    // 						sails.log.error( "EmploymentHistory#createNewEmployeeHistoryIfNotChanged :: err", errorObj );
    // 						reject(errorObj);
    // 					});
    // 				}
    // 			}
    // 		})
    // 	},
    // 	isEmploymentHistoryEqual: (oldHistory, newHistory) => {
    // 		// ----------------------- Took out ACH documents -----------------------
    // 		if(newHistory.achDocuments && newHistory.achDocuments.length > 0){
    // 			if(!oldHistory.achDocuments || oldHistory.achDocuments.length === 0){
    // 				return false;
    // 			}else if(!_.some(newHistory.documents, (doc) => { return oldHistory.achDocuments.indexOf(doc) >= 0; })) {
    // 					return false;
    // 			}
    // 		}
    // 		return oldHistory.employerName === newHistory.employerName
    // 			&& oldHistory.employerAddress === oldHistory.employerAddress
    // 			&& oldHistory.employerCity === oldHistory.employerCity
    // 			&& oldHistory.employerState === oldHistory.employerState
    // 			&& oldHistory.employerZip === oldHistory.employerZip
    // 			&& oldHistory.employerPhone === oldHistory.employerPhone
    // 			&& oldHistory.currentIncome === oldHistory.currentIncome
    // 			&& oldHistory.typeOfIncome === oldHistory.typeOfIncome
    // 			&& oldHistory.typeOfPayroll === oldHistory.typeOfPayroll
    // 			&& oldHistory.periodicity === oldHistory.periodicity
    // 			&& oldHistory.lastPayDate === oldHistory.lastPayDate
    // 			&& oldHistory.nextPayDate== oldHistory.nextPayDate
    // 			&& oldHistory.secondPayDate === oldHistory.secondPayDate
    // 			&& oldHistory.payFrequency === oldHistory.payFrequency
    // 			&& oldHistory.isAfterHoliday== oldHistory.isAfterHoliday
    // 			&& oldHistory.semiMonthlyFirstPayday === oldHistory.semiMonthlyFirstPayday
    // 			&& oldHistory.semiMonthlySecondPayDay === oldHistory.semiMonthlySecondPayDay

    // 	},
    // 	mapEmploymentHistoryFromResponse: (responseBody) => {
    // 		if(!responseBody){
    // 			return null;
    // 		}
    // 		return {
    // 			paymentmanagement: responseBody.paymentmanagement,
    // 			user: responseBody.userId,
    // 			employmentHistoryId: responseBody.employmentHistoryId,
    // 			//achDocuments:  !!responseBody.achDocuments? _.filter(JSON.parse(responseBody.achDocuments),(doc)=>{return !!doc}):[],
    // 			typeOfIncome: responseBody.typeOfIncome,
    // 			employerName: responseBody.employerName,
    // 			employerAddress: responseBody.employerAddress,
    // 			employerCity: responseBody.employerCity,
    // 			employerState: responseBody.employerState,
    // 			employerZip: responseBody.employerZip,
    // 			employerPhone: responseBody.employerPhone,
    // 			currentIncome: convertCurrency(responseBody.currentIncome),
    // 			typeOfPayroll: responseBody.typeOfPayroll,
    // 			periodicity: responseBody.periodicity,
    // 			lastPayDate: convertDates(responseBody.lastPayDate),
    // 			nextPayDate: convertDates(responseBody.nextPayDate),
    // 			secondPayDate: convertDates(responseBody.secondPayDate),
    // 			payFrequency: responseBody.payFrequency,
    // 			isAfterHoliday: responseBody.isAfterHoliday
    // 			//semiMonthlyFirstPayday: convertDates(responseBody.semimonthly_1st_payday),
    // 			//semiMonthlySecondPayDay: convertDates(responseBody.semimonthly_2nd_payday)
    // 		}
    // 	},
    // 	addEmploymentHistoryUserActivity: (userMakingTheChange, paymentId, subject, message) => {
    // 		PaymentManagement.findOne({id: paymentId}).then((paymentmanagementdata) => {
    // 			const loggingData = {
    // 				user: userMakingTheChange,
    // 				logdata: paymentmanagementdata,
    // 				payID: paymentmanagementdata? paymentmanagementdata.id: null
    // 			};
    // 			Logactivity.registerLogActivity( loggingData, subject, message );
    // 		});
    // 	}
    // }

    // function convertCurrency(incomingCurrencyValue) {
    // 	if(incomingCurrencyValue !== undefined && incomingCurrencyValue !== null) {
    // 		const currencyValue = incomingCurrencyValue.toString().replace(/[^0-9.]/g,"");
    // 		return parseFloat(parseFloat(currencyValue).toFixed(2));
    // 	}
    // 	return null;
    // }
    // function convertDates(rawDateString, formatString = "", hasTime = false) {
    // 	if(!!rawDateString) {
    // 		let convertedDate = moment( rawDateString );
    // 		if(!hasTime) {
    // 			convertedDate = convertedDate.startOf( "day" )
    // 		}
    // 		if(!!formatString) {
    // 			return convertedDate.format( formatString );
    // 		} else {
    // 			return convertedDate.toDate();
    // 		}
    // 	}
    // 	return null;
}
