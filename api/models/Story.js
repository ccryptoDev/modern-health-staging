/**
 * Story.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var Q = require('q'),
  _ = require('lodash'),
  config = sails.config,
  feeManagement = config.feeManagement,
  moment = require('moment'),
  ObjectId = require('mongodb').ObjectID,

  STATUS_CREATED = 1,
  STATUS_QUEUED = 2,
  STATUS_REQUESTED = 3,
  STATUS_DECLINED = 4,
  STATUS_TRANSFERRED = 5,
  STATUS_TRANSFERRETURNED = 6,
  STATUS_TRANSFERFAILED = 7,
  STATUS_LOANINITIATED = 8,
  STATUS_PAIDBACK = 9,
  STATUS_DELINQUENT = 10,
  STATUS_NOTAPPLICABLE = 11,
  STATUS_TERMSNOTACCEPTED = 12,
  STATUS_APPROVED = 14,
  STATUS_TRANSFERINITIATED = 15;
  STATUS_NEWSINITIATED = 16;
  STATUS_USERNEWSINITIATED =17;

module.exports = {

  STATUS_CREATED: STATUS_CREATED,
  STATUS_QUEUED: STATUS_QUEUED,
  STATUS_APPROVED: STATUS_APPROVED,
  STATUS_REQUESTED: STATUS_REQUESTED,
  STATUS_DECLINED: STATUS_DECLINED,
  STATUS_TRANSFERRED: STATUS_TRANSFERRED,
  STATUS_TRANSFERRETURNED: STATUS_TRANSFERRETURNED,
  STATUS_TRANSFERFAILED: STATUS_TRANSFERFAILED,
  STATUS_LOANINITIATED: STATUS_LOANINITIATED,
  STATUS_PAIDBACK: STATUS_PAIDBACK,
  STATUS_DELINQUENT: STATUS_DELINQUENT,
  STATUS_NOTAPPLICABLE: STATUS_NOTAPPLICABLE,
  STATUS_TERMSNOTACCEPTED: STATUS_TERMSNOTACCEPTED,
  STATUS_TRANSFERINITIATED: STATUS_TRANSFERINITIATED,
  STATUS_NEWSINITIATED: STATUS_NEWSINITIATED,
  STATUS_USERNEWSINITIATED: STATUS_USERNEWSINITIATED,


  attributes: {
    requestedAmount: {
      type: "float"
    },
    amountTransferred: {
      type: "float"
    },
    approvedAmount: {
      type: "float",
      defaultsTo: 0
    },
    isStoryApproved: {
      type: "boolean",
      defaultsTo: false
    },
    isTermsAccepted: {
      type: "boolean",
      defaultsTo: false
    },
    backgroundImage: {
      type: "string"
    },
    description: {
      type: "string"
    },
    borrowedAmount: {
      type: "string"
    },
    title: {
      type: "string"
    },
    transferInitiatedTime: {
      type: "string"
    },
    caption: {
      type: "string"
    },
    likers: {
      type: 'array',
      defaultsTo: []
    },
    dislikers: {
      type: 'array',
      defaultsTo: []
    },
    category: {
      model: 'category'
    },
    user: {
      model: 'User'
    },
    account: {
      model: 'Account'
    },
    /*fluidCard: {
      model: 'FluidCard'
    },*/
    /*transaction: {
      collection: 'Transactions',
      via: 'story'
    },*/
    /*university: {
      model: 'University'
    },*/
    loanNumber: {
      type: 'string'
    },
    status: {
      type: 'integer',
      defaultsTo: STATUS_CREATED
    },
    isDeleted: {
      type: 'boolean',
      defaultsTo: false
    },
    isStoryActive: {
      defaultsTo: true
    },
    /*storyQueue: {
      model: 'QueuedStory'
    },*/
    storytype: {
      type: 'string',
	  defaultsTo: 'userloan'
    },
	/*messages: {
      model: 'Messages'
    },*/
    toStoryApi: toStoryApi,
    toAppApi: toAppApi,
    toSuccessApi: toSuccessApi,
    toConfirmationApi: toConfirmationApi,
    toTimelineApi: toTimelineApi,
    toTimelineApiWithImage: toTimelineApiWithImage,
    toLoanApi: toLoanApi,
    toNewApi: toNewApi
  },
  createStory: createStory,
  updateStory: updateStory,
  findAllStory: findAllStory,
  getAllUpdatedStories: getAllUpdatedStories,
  getAllLikedStory: getAllLikedStory,
  getAllDislikedStory: getAllDislikedStory,
  acceptTermsAndConditions: acceptTermsAndConditions,
  getStoryApprovalStatus: getStoryApprovalStatus,
  initFundTransfer: initFundTransfer,
  updateStoryStatus: updateStoryStatus,
  updateTermsAccepted: updateTermsAccepted,
  updateAccountId: updateAccountId,
  updateFluidCardAsFundingSource: updateFluidCardAsFundingSource,
  getStoryStatusWithStory: getStoryStatusWithStory,
  updateFundDetail: updateFundDetail,
  confirmUserStory: confirmUserStory,
  getActiveLoansForUser: getActiveLoansForUser,
  getStatusForClient: getStatusForClient,
  getStoryDetail: getStoryDetail,
  getUserStory: getUserStory,
  insertStoryInQueue: insertStoryInQueue,
  getTimelineForCommunity: getTimelineForCommunity,
  getTimelineForUser: getTimelineForUser,
  getUserActiveLoanDetails: getUserActiveLoanDetails,
  getAllUserActionStories: getAllUserActionStories,
  migrateActionsToOldUser: migrateActionsToOldUser,
  updateUserOwnership: updateUserOwnership,
  getAllStoriesForUniversityTimeline: getAllStoriesForUniversityTimeline,
  getTransferedAmount: getTransferedAmount,
  getPaymentActivity: getPaymentActivity,
  getAccountHistory: getAccountHistory,
  getPayment: getPayment,
  getProfileImage: getProfileImage,
  getProfileImagesForUsers: getProfileImagesForUsers,
  getStoryOnClick: getStoryOnClick,
  updateRequestedAmount: updateRequestedAmount,
  createLoanPayment: createLoanPayment,
  insertMessage: insertMessage,
  getStoryMessageDetails: getStoryMessageDetails,
  getnewsriverTimelineForCommunity: getnewsriverTimelineForCommunity,
  gettransactionTimelineForCommunity: gettransactionTimelineForCommunity,
  getNewsriverForUser: getNewsriverForUser,
  gettransactionTimelineForUser: gettransactionTimelineForUser,
  newsriverUniversityStories: newsriverUniversityStories,
  transactionUniversityStories: transactionUniversityStories,
  getTimelineAmountForCommunity: getTimelineAmountForCommunity,
  getTimelineAmountForUser: getTimelineAmountForUser,
  getTimelineAmountForUniversity: getTimelineAmountForUniversity,
  findAllUnsedStory: findAllUnsedStory,
  acceptTermsStoryInformation: acceptTermsStoryInformation,
  createUserstory:createUserstory
    // getTimeLineStory: getTimeLineStory
};


function toStoryApi() {
  var story = this.toObject();
  return {
    caption: story.caption,
    category: story.category,
    status: getStatusForClient(story.status),
    statusNumber: story.status,
    backgroundImage: story.backgroundImage,
    requestedAmount: story.requestedAmount,
    approvedAmount: story.approvedAmount,
    user: story.user
  };
}

//TODO: Need to uncomment the commented object
function toAppApi() {
  var story = this.toObject();
  var userImage;
  var universityImage;
  var userId;
  var screenName;
  if (story.user) {
    if (story.user.profilePicture) {
      userImage = story.user.profileImage
    }
  } else {
    userImage = ""
  }
  if (story.user) {
    userId = story.user.id
  } else {
    userId = ""
  }
  if (story.user) {
    screenName = story.user.screenName
  } else {
    screenName = ""
  }
  return {
    userId: userId,
    screenName: screenName,
    category: story.categoryId,
    status: getStatusForClient(story.status),
    statusNumber: story.status,
    backgroundImage: story.backgroundImage,
    requestedAmount: story.requestedAmount,
    approvedAmount: story.approvedAmount,
    isStoryApproved: story.isStoryApproved,
    isTermsAccepted: story.isTermsAccepted,
    caption: story.caption,
    id: story.id,
    likersCount: story.likers.length,
    dislikersCount: story.dislikers.length,
    universityImage: story.university ? story.university.image : "",
    userImage: userImage
  };
}


function toNewApi() {
  var story = this.toObject();
  return {
    user: story.user,
    screenName: story.user.screenName || "",
    category: story.categoryId,
    status: getStatusForClient(story.status),
    statusNumber: story.status,
    backgroundImage: story.backgroundImage,
    requestedAmount: story.requestedAmount,
    approvedAmount: story.approvedAmount,
    isStoryApproved: story.isStoryApproved,
    isTermsAccepted: story.isTermsAccepted,
    caption: story.caption,
    id: story.id,
    likersCount: story.likers.length,
    dislikersCount: story.dislikers.length,
    universityImage: story.university ? story.university.image : "",
    userImage: story.user ? story.user.profilePicture : ""
  };
}

function toSuccessApi() {
  var story = this.toObject();
  var fluidcard;
  var accountId;
  if (story.fluidCard) {
    fluidcard = story.fluidCard;
  } else {
    fluidcard = "";
  }
  if (story.account) {
    accountId = story.account;
  } else {
    accountId = ""
  }

  return {
    userId: story.user.id,
    screenName: story.user.screenName,
    category: story.categoryId,
    status: getStatusForClient(story.status),
    statusNumber: story.status,
    backgroundImage: story.backgroundImage,
    requestedAmount: story.requestedAmount,
    approvedAmount: story.approvedAmount,
    isStoryApproved: story.isStoryApproved,
    isTermsAccepted: story.isTermsAccepted,
    caption: story.caption,
    id: story.id,
    likersCount: story.likers.lengh,
    dislikersCount: story.dislikers.length,
    accountId: accountId,
    fluidcard: fluidcard
  };
}

function toConfirmationApi() {
  var story = this.toObject();
  return {
    user: story.user,
    account: story.account,
    university: story.university,
    requestedAmount: story.amountTransferred,
    backgroundImage: story.backgroundImage,
    categoryId: story.categoryId,
    approvedAmount: story.approvedAmount,
    isStoryApproved: story.isStoryApproved,
    isTermsAccepted: story.isTermsAccepted,
    likersCount: story.likers.length,
    dislikersCount: story.dislikers.length,
    likers: story.likers,
    dislikers: story.dislikers,
    status: getStatusForClient(story.status),
    statusNumber: story.status,
    isDeleted: story.isDeleted,
    createdAt: story.createdAt,
    updatedAt: story.updatedAt,
    id: story.id,
    transferInitiatedTime: moment(story.updatedAt)
  };
}

function toTimelineApi() {
  var story = this.toObject();
  // var userImage;
  //
  // if (story.user.profilePicture) {
  //   userImage = story.user.profilePicture.toApi();
  // } else {
  //   userImage = "";
  // }
  var universityImage;
  var universityId;
  if (story.university) {
    universityImage = story.university.image;
    universityId = story.university.id;
  } else {
    universityImage = "";
    universityId = "";
  }
  Story
    .getProfileImage(story)
    .then(function(userImage) {

      return {

        user: story.user.id,
        caption: story.caption,
        screenName: story.user.screenName || "-",
        requestedAmount: "$" + story.requestedAmount,
        backgroundImage: story.backgroundImage,
        likersCount: story.likers.length,
        dislikersCount: story.dislikers.length,
        status: getStatusForClient(story.status),
        statusNumber: story.status,
        createdAt: moment(story.createdAt).format('LLL').local(),
        updatedAt: story.updatedAt,
        id: story.id,
        userImage: userImage,
        universityId: universityId,
        universityImage: universityImage
      };
    })
}

function toTimelineApiWithImage(userImage) {
  var story = this.toObject();

  var universityImage;
  var universityId;
  if (story.university) {
    universityImage = story.university.image;
    universityId = story.university.id;
  } else {
    universityImage = "";
    universityId = "";
  }

  return {
    user: story.user.id,
    caption: story.caption,
    screenName: story.user.screenName || "-",
    requestedAmount: "$" + story.requestedAmount,
    backgroundImage: story.backgroundImage,
    likersCount: story.likers.length,
    dislikersCount: story.dislikers.length,
    status: getStatusForClient(story.status),
    statusNumber: story.status,
    createdAt: moment(story.createdAt).format('LLLL'),
    updatedAt: story.updatedAt,
    id: story.id,
    userImage: userImage,
    universityId: universityId,
    universityImage: universityImage,
	storytype:story.storytype
  };
}

function toLoanApi() {
  var story = this.toObject();

  return {
    loanId: story.id,
    financedAmount: story.approvedAmount,
    loanNumber: '1234',
    loanDate: moment(story.createdAt).format('L'),
    loanTerm: "3 months",
    //TODO: Maturity date check and remove hard coded settings
    maturityDate: moment(moment(story.createdAt).add(3, 'months')).format('L'),
    interestRate: "0%",
    fundingFee: "0%",
    apr: "30%"
  };

}

// TODO: complete all the cases
function getStatusForClient(status) {
  switch (status) {
    case STATUS_LOANINITIATED:
      return 'loan-initiated';
    case STATUS_NOTAPPLICABLE:
      return 'not-applicable';
    case STATUS_CREATED:
      return 'created';
    case STATUS_APPROVED:
      return 'approved';
    case STATUS_REQUESTED:
      return 'requested';
    case STATUS_DECLINED:
      return 'declined';
    case STATUS_DELINQUENT:
      return 'delinquent';
    case STATUS_PAIDBACK:
      return 'paid-back';
    case STATUS_QUEUED:
      return 'queued';
    case STATUS_TERMSNOTACCEPTED:
      return 'terms-not-accepted';
    case STATUS_TRANSFERFAILED:
      return 'transfer_failed';
    case STATUS_TRANSFERINITIATED:
      return 'transfer-initiated';
    case STATUS_TRANSFERRED:
      return 'transferred';
    case STATUS_TRANSFERRETURNED:
      return 'transfer_returned';
	case STATUS_NEWSINITIATED:
      return 'newsriver';
	case STATUS_USERNEWSINITIATED:
      return 'user_newsriver';
  }
}

function createStory(user, data) {
  console.log("here im sending", data);
  var deferred = Q.defer();
  var storyDetail = {
    user: user.id,
    requestedAmount: data.requestedAmount,
    backgroundImage: data.backgroundImage,
    caption: data.caption,
    categoryId: data.categoryId
  };
  Setting
    .checkDenominationExists(data.requestedAmount)
    .then(function() {
      Category
        .getOneCategory(data.categoryId)
        .then(function() {
          Story
            .findOne({
              user: user.id,
              status: 1
            })
            .populate('user')
            .then(function(story) {
              if (story) {
                story.requestedAmount = storyDetail.requestedAmount;
                story.backgroundImage = storyDetail.backgroundImage;
                story.caption = storyDetail.caption;
                story.categoryId = storyDetail.categoryId;
                story.save();
                console.log("story", story);
                deferred.resolve(story);
              } else {
                //console.log("here should be the storyDEtail", storyDetail);
                Story.create(storyDetail)
                  .then(function(storyInformation) {
                    console.log("here it is getting created", storyInformation.user);
                    User
                      .updateUserStatus(storyInformation)
                      .then(function(userDetail) {
                        console.log("here is the storyInformation", storyInformation);
                        Story
                          .findOne({
                            user: userDetail.id,
                            id: storyInformation.id
                          })
                          .populate('user')
                          .then(function(storyInformation) {
                            deferred.resolve(storyInformation)
                          })
                          .catch(function(err) {
                            sails.log.error("::ERROR", err);
                            deferred.reject(err);
                          })

                      })
                      .catch(function(err) {
                        sails.log.error("::ERROR", err);
                        deferred.reject(err);
                      })
                  })
                  .catch(function(err) {
                    sails.log.error("::ERROR", err);
                    deferred.reject(err);
                  })
              }
            })
            .catch(function(err) {
              sails.log.error("::ERROR", err);
              deferred.reject(err);
            })

        })
    })
    .catch(function(err) {
      sails.log.error("::ERROR", err);
      deferred.reject(err);
    })
  return deferred.promise;

}


//TODO:Need to set the key

function updateStory(user, data) {
  return Q.promise(function(resolve, reject) {
    console.log("here is the data", data.requestedAmount);
    var criteria = {
      user: user.id,
	  storytype: 'userloan'
    };
    console.log("here is the user", user);
    Story
      .findOne(criteria)
	  .sort("createdAt DESC")
      .then(function(storyDetail) {
        console.log("here is the storydetail", storyDetail);
        storyDetail.requestedAmount = data.requestedAmount;
        storyDetail.backgroundImage = data.backgroundImage;
        storyDetail.caption = data.caption;
        storyDetail.categoryId = data.categoryId;
        storyDetail.save();
        console.log("here is new the storyDetail", storyDetail);
        return resolve(storyDetail);
      })
      .catch(function(err) {
        sails.log.error("updateStory::Error ", err);
        return reject(err);
      });
  })
}

//Todo to get details of all the stories
function findAllStory(userId) {
  return Q.promise(function(resolve, reject) {
    var criteria = {
      user: {
        '!': userId
      }
    };

    var data = [];
    Story.find(criteria)
      .sort("createdAt DESC")
      .populate('user')
      .then(function(storyDetails) {
        _.forEach(storyDetails, function(storyDetail) {
          var story = storyDetail.toAppApi();
          if(story.screenName !== ""){
            data.push(story);
          }
        })

        return resolve(data);
      })
      .catch(function(err) {
        sails.log.error("Story#findAllStory :: error :: ", err);
        return reject(err);
      })
  })
}

function getAllUpdatedStories(id, limit, skip) {
  var criteriaOne = {
    '$and': [{
      'dislikers': {
        '$not': {
          '$elemMatch': {
            'userId': new ObjectId(id)
          }
        }
      }
    }, {
      'likers': {
        '$not': {
          '$elemMatch': {
            'userId': new ObjectId(id)
          }
        }
      }
    }, {
      'user': {
        '$ne': new ObjectId(id)
      }
    }],
    isStoryApproved: false,
    isDeleted: false,
	storytype: 'userloan'
  };
  return new Promise(function(resolve, reject){
    Story.native(function(err, collection) {
      if (err) {
        sails.log.error('Story#getAllUpdatedStories :: Native error :: ', err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      }
      console.log("here is the mongo objectId", new ObjectId(id));

      //TODO:Sort on created at date
      console.log(criteriaOne);
      collection.find(
        criteriaOne,
        {
          "_id": true,
          "user": true,
        },
        {
          "limit": limit,
          skip: skip,
          sort: [["updatedAt", "descending"]],
        },
        function(err, cursor){
          if(err){
            return reject(err);
          }
          cursor.toArray(function(err, docs){
            if(err){
              return reject(err);
            }
            resolve(docs);
          })
        }
      );
    })
  }).then(function(stories){
    var userIds = stories.map(function(story){
      return story.user;
    });
    return User.find({ id: userIds }).then(function(users){
      return stories.map(function(story){
        var foundUser = false;
        users.some(function(user){
          if(user._id === story.user){
            story.user = user;
            return true;
          }
        });
        return story;
      });
    });
  }).then(function(storyDetails){

    console.log("ids :: ", storyDetails);
    var data = [];
    _.forEach(storyDetails, function(storyDetail) {
	  sails.log.info("storyDetail: ",storyDetail);
	  if(storyDetail.user)
	  {
		  if(storyDetail.user.screenName !== ""){
			data.push(storyDetail._id);
		  }
	  }
    });

    var criteria = {
      id: data
    };

    //TODO: Need to remove logs
	sails.log.info("getStoryDetail criteria: ", criteria);

    return Story.getStoryDetail(criteria);
  }).then(function(stories) {
    var storyData = [];
    _.forEach(stories, function(story) {
      // console.log("here is the list of stories", story);
      // console.log("storyDetails :: ", story.user);
      storyData.push(story.toAppApi());
    })
    return storyData;
  })
  .catch(function(err) {
    sails.log.error("#getStoryDetail::Error", err)
    throw err;
  })
}


function getStoryDetail(criteria) {
  var deferred = Q.defer();
  Story
    .find(criteria)
    .then(function(stories) {
      // get all user Ids
      // get all university Ids
      //console.log("here is the stories with user ids", stories);
      var userIds = [];
      var universityIds = [];

      stories.map(function(story) {
		 var userStory= story.user;
		if ("undefined" === typeof userStory || userStory=='' || userStory==null)
		{
		}
		else
		{
        	userIds.push(story.user);
		}
        universityIds.push(story.university);
      });

      // find all users with populating profile pictures
      // find all universities by populating image
      //console.log("here are the UserIds", userIds);
      User
        .find({
          id: userIds,
          isDeleted: false
        })
        .populate('profilePicture')
        .then(function(users) {
          //console.log("here are the list of users", users.length);
		  //console.log("here are the list of users details : ", users);
          // loop on stories and add user
          stories.map(function(story) {
            //console.log("here are the story of users", story.user);
            // find the user for story
            var filteredUsers = _.filter(users, function(userObj) {
              return userObj.id === story.user;
            });
            // check if user is found
            if (filteredUsers.length > 0) {
              var actualUser = filteredUsers[0];

              if (actualUser.profilePicture) {
                //TODO: need to remove log kept for testing purpose

                actualUser.profileImage = actualUser.profilePicture.toApi();
              }

              story.user = actualUser;
            } else {
              story.user = null;
            }
          })

          // find all universities
          University
            .find({
              id: universityIds,
              isDeleted: false
            })
            .populate('image')
            .then(function(universities) {
              stories.map(function(story) {
                var filteredUniversities = _.filter(universities, function(universityObj) {
                  return universityObj.id === story.university;
                });
                // check if user is found
                if (filteredUniversities.length > 0) {
                  var actualUniversity = filteredUniversities[0];
                  if (actualUniversity.image) {
                    actualUniversity.image = actualUniversity.image.toApi();
                  }

                  story.university = actualUniversity;
                } else {
                  story.university = null;
                }
              })

              deferred.resolve(stories)
            })
        })
    })
    .catch(function(err) {
      deferred.reject(err);
    })
  return deferred.promise;
}


function getAllLikedStory(storyId, likers) {
  return Q.promise(function(resolve, reject) {
    Story
      .findOne(storyId)
      .sort("createdAt DESC")
      .then(function(story) {

		if(story.user==likers.userId)
		{
			return resolve(story);
		}
		else
		{
		   	if (!story.likers) {
			  story.likers = [];
			}
			story.likers.push(likers)
			story.save(function(err) {
			  if (err) {
				sails.log.error("Story#getAllLikedStory :: Error :: ", err);

				return reject({
				  code: 500,
				  message: 'INTERNAL_SERVER_ERROR'
				});
			  }

			  //Push notification for Badges for like
			  //sails.log.info("story userid :",story.user)
			  PusherService.pushBadgeNotification(story.user,'like');

			  return resolve(story);
			});
		}
      })
      .catch(function(err) {
        sails.log.error("Story#getAllLikedStory :: Error :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}


function getAllDislikedStory(storyId, dislikers) {
  return Q.promise(function(resolve, reject) {
    Story
      .findOne(storyId)
      .sort("createdAt DESC")
      .then(function(story) {

		if(story.user==dislikers.userId)
		{
			return resolve(story);
		}
		else
		{
			if (!story.dislikers) {
			  story.dislikers = [];
			}

			story.dislikers.push(dislikers)
			story.save(function(err) {
			  if (err) {
				sails.log.error("Story#getAllDislikedStory :: Error :: ", err);

				return reject({
				  code: 500,
				  message: 'INTERNAL_SERVER_ERROR'
				});
			  }

			  return resolve(story);
			});
		}
      })
      .catch(function(err) {
        sails.log.error("Story#getAllDislikedStory :: Error :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}


function acceptTermsAndConditions(keys, userId, storyId, ip) {
  return Q.promise(function(resolve, reject) {
    var criteria = {
      user: userId,
      id: storyId,
      isDeleted: false
    };

    Story
      .findOne(criteria)
      .then(function(story) {
        if (!story) {
          sails.log.error("Story#acceptTermsAndConditions :: Story not present ::");
          return reject({
            code: 404,
            message: 'STORY_NOT_FOUND'
          });
        } else {

          // ASYNC
          // _.forEach(keys, function(key) {
          //   UserConsent
          //     .createConsentForAgreements(key, ip, userId)
          // })
          story.isStoryApproved = true;
          story.isTermsAccepted = true;
          story.approvedAmount = story.requestedAmount;

          story.save();
          return resolve(story);


        }
      })
      .catch(function(err) {
        sails.log.error("Story#acceptTermsAndConditions :: User :: Error :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}


function getStoryApprovalStatus(storyId, userId) {
  return Q.promise(function(resolve, reject) {
    var criteria = {
      id: storyId,
      user: userId
    };
    Story
      .findOne(criteria)
      .then(function(story) {
        if (story.isStoryApproved === true) {
          return resolve(story.isStoryApproved);
          // var messageObj = {
          //   user: userId,
          //   message: 'Congrats your Loan has been approved',
          //   subject: 'LOAN_APPROVAL'
          // };
          // // create a message with user object
          // Messages.createMessageWithUser(messageObj,userId);
        } else {
          // todo:need to move messageObj.message in an service file
          return resolve(story.isStoryApproved);


        }
      })
      .catch(function(err) {
        sails.log.error("Story#acceptTermsAndConditions :: User :: Error :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });

      });

  });
}


function initFundTransfer(userId, storyId, amount) {
  return Q.promise(function(resolve, reject) {
    var criteria = {
      id: storyId
    };

    Story
      .findOne(criteria)
      .then(function(story) {
        if (story.approvedAmount >= amount) {
          return resolve();
        } else {
          return reject({
            code: 500,
            message: 'INSUFFICIENT_FUNDS'
          });
        }
      })
      .catch(function(err) {
        sails.log.error("Story#initFundTransfer :: Story :: Error :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}


function updateStoryStatus(story, status) {
  return Q.promise(function(resolve, reject) {
    // update story, approve it
    if (!story || status != STATUS_CREATED) {
      sails.log.error("Story#updateStoryStatus :: Error :: Story or Status is invalid");
      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }


    // check the status of story
    switch (story.status) {
      case Story.STATUS_APPROVED:
        // cannot change the status
        return reject({
          code: 400,
          message: 'STORY_STATUS_CANNOT_UPDATE'
        });
        break;
      case Story.STATUS_CREATED:
        // can change to any status
        approveStory(story)
          .then(resolve)
          .catch(reject);
        break;
      case Story.STATUS_QUEUED:
        approveStory(story)
          .then(resolve)
          .catch(reject);
        break;
    }

  });
}


function approveStory(story) {
  return Q.promise(function(resolve, reject) {
    Story
      .update(story.id, {
        status: Story.STATUS_APPROVED
      })
      .then(function(stories) {
        if (stories.length === 0) {
          sails.log.error("Story#updateStoryStatus :: Cannot update story for given criteria");
          return reject({
            code: 500,
            message: 'INTERNAL_SERVER_ERROR'
          });
        } else {
          return resolve(stories[0]);
        }
      })
      .catch(function(err) {
        sails.log.error("Story#updateStoryStatus :: Error :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });


  });

}


function updateFundDetail(data) {
  return Q.promise(function(resolve, reject) {
    var criteria = {
      id: story.user
    };
    Story.findOne(criteria)
      .then(function(story) {

        if (story.status == STATUS_CREATED) {

        }
        story.account = data.account;
        story.save();

      })
  })

}


function getStoryStatusWithStory(storyId, userId) {
  return Q.promise(function(resolve, reject) {
    var criteria = {
      id: storyId,
      user: userId,
      isDeleted: false
    };

    Story
      .findOne(criteria)
      .populate('category')
      .populate('user')
      .then(function(story) {
        if (!story) {
          sails.log.error("Story#getStoryStatusWithStory :: Story not present ::");

          return reject({
            code: 404,
            message: 'STORY_NOT_FOUND'
          });
        }

        return resolve(story.toStoryApi());
      })
      .catch(function(err) {
        sails.log.error("Story#getStoryStatusWithStory :: Error :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function getUserStory(storyId, userId) {
  return Q.promise(function(resolve, reject) {
    var criteria = {
      id: storyId,
      user: userId,
      isDeleted: false
    };
    Story
      .findOne(criteria)
      .then(function(story) {
        if (!story) {
          sails.log.error("Story#getStoryStatusWithStory :: Story not present ::");

          return reject({
            code: 404,
            message: 'STORY_NOT_FOUND'
          });
        }
        return resolve(story);
      })
      .catch(function(err) {
        sails.log.error("Story#getStoryStatusWithStory :: Error :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function updateAccountId(user, story, account) {
  return Q.promise(function(resolve, reject) {
    //TODO: Need to add .edu verify info here
    var criteria = {
      id: story.id,
      isDeleted: false
    };
    story.university = user.university;
    story.account = account.id;
    story.approvedAmount = story.requestedAmount;
    story.status = STATUS_APPROVED;
    Story
      .update(criteria, story)
      .then(function(story) {

        return resolve(story[0]);
      })
      .catch(function(err) {
        sails.log.error("Story#updateAccountId :: Error in updating accountId :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function updateFluidCardAsFundingSource(user, story, fluidCard) {
  return Q.promise(function(resolve, reject) {
    var criteria = {
      id: story.id,
      isDeleted: false
    };
    Story
      .findOne(criteria)
      .populateAll()
      .then(function(story) {
        story.university = user.university;
        story.fluidCard = fluidCard.id;
        story.approvedAmount = story.requestedAmount;
        story.status = STATUS_APPROVED;
        story.save(function(err) {
          if (err) {
            sails.log.error("Story#updatedfunding source as fluidcard :: Error :: ", err);

            return reject({
              code: 500,
              message: 'INTERNAL_SERVER_ERROR'
            });
          }
        });

        return resolve(story.toSuccessApi());
      })
      .catch(function(err) {
        sails.log.error("Story#updateFluidCardAsFundingSource :: Error in updating fluidCard :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}


function updateTermsAccepted(storyId) {
  return Q.promise(function(resolve, reject) {
    if (!storyId) {
      return reject({
        code: 400,
        message: 'Kindly provide a valid id'
      });
    }
    var criteria = {
      id: storyId,
      isTermsAccepted: false
    };

    Story.findOne(criteria)
      .then(function(story) {
        story.isTermsAccepted = true;
        story.save(function(err) {
          if (err) {
            sails.log.error("Story#updateTermsAccepted :: Error in accepting terms :: ", err);

            return reject({
              code: 500,
              message: 'INTERNAL_SERVER_ERROR'
            });

          }
          return resolve(story);
        });

      })
      .catch(function(err) {
        sails.log.error('Story#updateTermsAccepted :: story null ');

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}


function confirmUserStory(story, setting, type, loanappversion,loaniosversion) {
  return Q.promise(function(resolve, reject) {
    countOfQueuedStory = 0;
    if ((story.account || story.fluidCard) && story.approvedAmount > 0 && story.isTermsAccepted === true) {
      QueuedStory
        .find()
        .then(function(queuedStories) {


          _.forEach(queuedStories, function(queuedStory) {
            if (queuedStory.queueStatus === QueuedStory.QUEUE_STATUS_QUEUED) {
              countOfQueuedStory++;
            }
          });

          if (countOfQueuedStory > 0 || setting.communityBankBalance < story.approvedAmount ||
            (!queuedStories && setting.communityBankBalance < story.approvedAmount)) {

            Story
              .insertStoryInQueue(story, queuedStories, setting)
              .then(function(story) {
                var messageObj = {
                  user: story.user,
                  message: 'Your Loan has been added to queue',
                  subject: 'LOAN_QUEUED',
				  messagetype:'queueprocess'
                };
                var user = story.user;
                User
                  .findOne({
                    id: user
                  })
                  .then(function(user) {
                    Messages.createMessageWithUser(messageObj, user);
                    return resolve(story.toConfirmationApi());
                  })

              })
              .catch(function(err) {
                sails.log.error("Story#confirmUserStory#insertStoryInQueue :: err", err);
                return reject(err);
              });
          } else {
            var criteria = {
              id: story.user
            };

            User
              .findOne(criteria)
              .then(function(user) {
                user.isExistingLoan = true;
                user.save(function(err) {
                  if (err) {
                    sails.log.error("user#isExistingLoan :: Error :: ", err);
                    return reject({
                      code: 500,
                      message: 'INTERNAL_SERVER_ERROR'
                    });
                  }
                  Story
                    .getTransferedAmount(story)
                    .then(function(amountTransferred) {

					  console.log("Story Status", story.status);

                      if (story.status === 14) {

                        story.status = STATUS_TRANSFERINITIATED;
                        story.amountTransferred = amountTransferred.amountTransferred;

						console.log("New Story Status: ", story.status);
						console.log("New Story amountTransferred: ", story.amountTransferred);

                        story.save(function(err) {
                          if (err) {
                            sails.log.error("Story#confirmUserStory :: Error :: ", err);
                          } else {
                            var criteria = {
                              where: {
                                user: user.id,
                                isPaymentActive: true
                              },
                              sort: 'updatedAt DESC'
                            };

							console.log("PaymentManagement criteria: ", criteria);

                            PaymentManagement
                              .findOne(criteria)
                              .then(function(paymentManagementDetail) {

								console.log("paymentManagementDetail", paymentManagementDetail);

                                if (paymentManagementDetail) {
								  console.log("Entered if loop");
                                  paymentManagementDetail.isPaymentActive = false;
                                  paymentManagementDetail.save();

								  //TODO: NEED TO UNCOMMENT BELOW CODE TO MAKE ACH LIVE
                                  //AchService.originateTransactionForStory(story, type);

								  //ADDED TO BYPASS LOAN WITHOUT ACH (NEED TO BLOCK ONCE ACH IS LIVE)
								  Story.createLoanPayment(story,loanappversion,loaniosversion);

                                } else {
								  console.log("Entered else loop");

								  //TODO: NEED TO UNCOMMENT BELOW CODE TO MAKE ACH LIVE
                                  //AchService.originateTransactionForStory(story, type);

								  //ADDED TO BYPASS LOAN WITHOUT ACH (NEED TO BLOCK ONCE ACH IS LIVE)
								  Story.createLoanPayment(story,loanappversion,loaniosversion);
                                }

                              })

                          }

						 	//Update screentracking
							Screentracking
							.findOne({
							  user :story.user,
							  iscompleted : 0
							})
							.then(function(screenTracking){
							  if(screenTracking)
							  {
							 	 screenTracking.iscompleted = 1;
							 	 screenTracking.save();
							  }
							})

                          //TODO:Need to remove do query the user entity on top and populate it
                          var criteria = {
                            user: story.user
                          };
                          Story.findOne(criteria)
                            .populate('user')
                            .then(function(story) {
                              var messageObj = {
                                user: story.user,
								//TODO: NEED TO UNCOMMENT BELOW CODE TO MAKE ACH LIVE
                                //message: 'Congratulations, your loan has been approved. Your money is on its way. Check your bank account often!\n\nThanks\nTeam Fluid',
                                //subject: 'Your' + ' ' + '$' + story.requestedAmount + ' ' + 'Loan has been Approved'
								//ADDED TO BYPASS LOAN WITHOUT ACH (NEED TO BLOCK ONCE ACH IS LIVE)
								message: 'Congratulations, your loan has been under process stage. You will receive you loan status soon. Check your registered email and bank account often!\n\nThanks\nTeam Fluid',
								subject: 'Your' + ' ' + '$' + story.requestedAmount + ' ' + 'Loan under process',
								messagetype:'underprocess'
                              };
                              var user = story.user;
                              Messages.createMessageWithUser(messageObj);
                              console.log("here is the story", story.toConfirmationApi());
                              return resolve(story.toConfirmationApi());


                            })
                        });
                      } else {
                        sails.log.error("Story#confirmUserStory :: Story is not approved for transfer :: ", err);
                        return reject({
                          code: 403,
                          message: 'CANNOT_APPROVE_STORY'
                        });
                      }
                    });
                })
              })
          }

        })
        .catch(function(err) {
          sails.log.error('Story#confirmUserStory :: Failed to find Queued Stories  ::', err);
          return reject({
            code: 500,
            message: 'INTERNAL_SERVER_ERROR'
          });
        });
    } else {
      sails.log.error('Story#confirmUserStory :: Story is not linked to an account and Terms not accepted :');
      return reject({
        code: 401,
        message: 'UNAUTHORIZED_USER'
      });
    }
  });
}

//TODO: Need to check with the account type of the user is linked which and calculate amount transfer

function getTransferedAmount(story) {
  var deferred = Q.defer();

  var criteria = {
    id: story.account
  };

  Account
    .findOne(criteria)
    .then(function(accountDet) {
      var amountTransferred;
      if (accountDet) {
        amountTransferred = story.requestedAmount - (story.requestedAmount * (feeManagement.fundingFeePercentage));
      } else {
        FluidCard
          .findOne(criteria)
          .then(function(fluidCardDetail) {
            amountTransferred = story.requestedAmount;
          })
      }
      deferred.resolve({
        amountTransferred: amountTransferred
      });
    })
    .catch(function(err) {
      sails.log.error("#getTransferedAmount :: error", err)
      deferred.reject(err);
    })
  return deferred.promise;
}


function insertStoryInQueue(story, queuedStories, setting) {
  return Q.promise(function(resolve, reject) {
    var nextNumberInQueue;
    if (!queuedStories) {
      nextNumberInQueue = 1;
    } else {
      nextNumberInQueue = queuedStories.length + 1;
    }
    var queueObject = {
      story: story.id,
      user: story.user,
      logs: [{
        description: "Piggy Bank does not have enough funds",
        piggyBankBalance: setting.communityBankBalance,
        isApproved: story.isStoryApproved,
        triggerDate: new Date()
      }],
      queueStatus: QueuedStory.QUEUE_STATUS_QUEUED,
      queueNumber: nextNumberInQueue
        //requested and queued states are same
        // queueNumber: Story.findNextQueueNumberInQueue(queuedStories)
    };
    QueuedStory.create(queueObject)
      .then(function(queueObject) {
        story.status = story.STATUS_QUEUED;
        story.save(function(err) {
          if (err) {
            sails.log.error("Story#insertStoryInQueue :: error :: ", err);
          }
          return resolve(story);
        });
      })
      .catch(function(err) {
        sails.log.error('Story#insertStoryInQueue :: Failed to Add story to queue :');
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}


function getActiveLoansForUser(userId) {

  return Q.promise(function(resolve, reject) {
    var criteria = {
      userId: userId,
      status: STATUS_LOANINITIATED
    };

    Story
      .find(criteria)
      .then(function(stories) {
        // log for debugging purpose
        if (stories.length == 0) {
          sails.log.info("Story#getActiveLoansForUser :: No active loans found for user :: ", userId);
        }

        return resolve(stories);
      })
      .catch(function(err) {
        sails.log.error("Story#getActiveLoansForUser :: Error :: ", err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function getProfileImagesForUsers(userIds) {
  var deferred = Q.defer();
  var criteria = {
    id: userIds
  };

  var usersMap = {};
  userIds.forEach(function(id) {
    usersMap[id] = "";
  });

  User
    .find(criteria)
    .populate('profilePicture')
    .then(function(users) {
      _.forEach(users, function(user) {
        if (user.profilePicture) {
          usersMap[user.id] = user.profilePicture.toApi();
        } else {
          usersMap[user.id] = "";
        }
      });
      //console.log("here is the userMaps", usersMap);
      deferred.resolve(usersMap);
    })
    .catch(function(err) {
      sails.log.error("getAll profilePicture##", err);
      deferred.reject(err);
    })
  return deferred.promise;
}

function getTimelineForCommunity(skipvalue,limitvalue) {
  return Q.promise(function(resolve, reject) {
    /*var criteria = {
      status: [STATUS_QUEUED, STATUS_REQUESTED, STATUS_TRANSFERRED,
        STATUS_TRANSFERRETURNED, STATUS_TRANSFERFAILED,
        STATUS_LOANINITIATED, STATUS_PAIDBACK, STATUS_APPROVED,
        STATUS_TRANSFERINITIATED,STATUS_NEWSINITIATED
      ]
    };*/


	var criteria = {
      status: [STATUS_QUEUED, STATUS_REQUESTED, STATUS_TRANSFERRED,
        STATUS_TRANSFERRETURNED, STATUS_TRANSFERFAILED,
        STATUS_LOANINITIATED, STATUS_PAIDBACK, STATUS_APPROVED,
        STATUS_TRANSFERINITIATED,STATUS_NEWSINITIATED
      ],
	  $or : [ { storytype: "userloan"  }, { storytype: "payback"  },
		{ $and: [ { storytype: "newsriver"  },
				{ $or : [ { university: { $eq: '', $exists: true } }, { university:{ $exists: false }}  ] },
		 	  ]
		}
	  ]
    };

    /*var borrowedAmount = parseInt(0.0);
    var paidAmount = parseInt(0.0);
    var requestedAmount = parseInt(0.0);*/
    var data = [];

    //Story.find(criteria).skip(skipvalue).limit(limitvalue).sort('createdAt DESC').populateAll(),

    Promise.all([
      Story.find(criteria).skip(skipvalue).limit(limitvalue).sort('createdAt DESC').populateAll(),
    ]).then(function(results) {
        var stories = results[0];
        //sails.log.info("here are the list of all stories",stories.length);
        var userIds = [];
        _.forEach(stories, function(story) {
          /*if (story.status == 8 ||
            story.status == 11 ||
            story.status == 14 ||
            story.status == 15) {
            borrowedAmount = borrowedAmount + story.requestedAmount;
          } else if (story.status == 9) {
            paidAmount = paidAmount + story.requestedAmount;
          } else if (story.status == 2 || story.status == 3) {
            requestedAmount = requestedAmount + story.requestedAmount;
          }*/
          // console.log("here are the story user Id's", story.user.id);

		  if(story.user)
		  {
          	userIds.push(story.user.id);
		  }
        });

       /* var amount = {
          borrowedAmount: borrowedAmount,
          paidAmount: paidAmount,
          requestedAmount: requestedAmount
        };*/

		//sails.log.info("stories userIds: ",userIds);
        //sails.log.info("stories length",stories.length);
        // Get user profile images


          Story
          .getProfileImagesForUsers(userIds)
			  .then(function(userImagesMap) {

				//sails.log.info("stories pass loop",stories.length);

				var timelineObject,
				  userId,
				  userImage;

				var messagelineObject;

				_.forEach(stories, function(story) {

					//sails.log.info("story data: ---", story.id, story.storytype);

					//-- Blocked for version 2.1
					if(story.storytype=='newsriver')
					{
						story.storytype='newsriver';
						//sails.log.info("story data", story.id, story.storytype);
						//sails.log.info("story message", story);
						//data.push(story);

						//if(story.messages.viewtype!='university')
						//{
							var newsriverObject= {
													id: story.id,
													messages: story.messages,
													likersCount: story.likers.length,
													dislikersCount: story.dislikers.length,
													status: getStatusForClient(story.status),
													statusNumber: story.status,
													storytype:story.storytype,
													createdAt: moment(story.createdAt).format('LLLL'),
													updatedAt: story.updatedAt
												};
							data.push(newsriverObject);
						//}
					}

					if(story.user)
					{
						//sails.log.info("story user pass: *****", story.id);
						if(story.storytype=='payback' )
						{
							//story.storytype='newsriver'; //--temporary purpose
							userId = story.user.id;
							userImage = userImagesMap[userId] || "";
							var newsriverObject= {
													id: story.id,
													messages: story.messages,
													likersCount: story.likers.length,
													dislikersCount: story.dislikers.length,
													status: getStatusForClient(story.status),
													statusNumber: story.status,
													storytype:story.storytype,
													userImage: userImage,
													user: story.user.id,
													screenName: story.user.screenName || "-",
													createdAt: moment(story.createdAt).format('LLLL'),
													updatedAt: story.updatedAt
												};
							data.push(newsriverObject);
						}
						else
						{
							  userId = story.user.id;
							  /*if(userImagesMap.length>0)
							  {
							  	userImage = userImagesMap[userId] || "";
							  }
							  else
							  {
								userImage ="";
							  }*/
							  userImage = userImagesMap[userId] || "";
							  timelineObject = story.toTimelineApiWithImage(userImage);
							  data.push(timelineObject);
						}
					}

				});
				//sails.log.info("here is the story data", data);

				/*return resolve({
				  data: data,
				  amount: amount
				});*/

				return resolve(data)
			  })
			  .catch(function(err) {
				// TODO: handle error - no image for any user
				//sails.log.info("no image for any user ");
			  });

      })
      .catch(function(err) {
        sails.log.error("Story#getTimelineForCommunity :: Error :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });

      });
  })
}


//,skipvalue,limitvalue
function getTimelineForUser(user,skipvalue,limitvalue) {

  return Q.promise(function(resolve, reject) {
    //console.log("here is the user", user);

	//STATUS_DECLINED,
    var criteria = {
      user: user.id,

      status: [STATUS_QUEUED, STATUS_REQUESTED,  STATUS_TRANSFERRED,
        STATUS_TRANSFERRETURNED, STATUS_TRANSFERFAILED,
        STATUS_LOANINITIATED, STATUS_PAIDBACK, STATUS_DELINQUENT, STATUS_APPROVED,
        STATUS_TRANSFERINITIATED,STATUS_NEWSINITIATED,STATUS_USERNEWSINITIATED
      ]
    };

    var data = [];
    Story
      .find(criteria)
	  .populateAll()
	  .skip(skipvalue)
	  .limit(limitvalue)
      .then(function(stories) {
        //TODO: Add profile picture to the response
        //console.log("here are the stories", stories);
        if (!stories) {
          return reject({
            code: 204,
            message: 'NO_STORIES_IN_DB'
          })
        }
        /*var borrowedAmount = parseInt(0.0);
        var paidAmount = parseInt(0.0);
        var requestedAmount = parseInt(0.0);*/
        var userIds = [];

        _.forEach(stories, function(story) {
          /*if (story.status == 8 ||
            story.status == 11 ||
            story.status == 14 ||
            story.status == 15) {

            borrowedAmount = borrowedAmount + story.requestedAmount;

          }
          if (story.status == 9) {

            paidAmount = paidAmount + story.requestedAmount;

          }
          if (story.status == 2 ||
            story.status == 3) {

            requestedAmount = requestedAmount + story.requestedAmount;

          }*/

          userIds.push(story.user.id);

        });

        /*var amount = {
          borrowedAmount: borrowedAmount,
          paidAmount: paidAmount,
          requestedAmount: getTimelineForUser
        };*/


        //console.log("here is the amount", amount);
		//sails.log.info("stories userIds: ",userIds);

        Story
          .getProfileImagesForUsers(userIds)
          .then(function(userImagesMap) {
            var timelineObject,
              userId,
              userImage;

            _.forEach(stories, function(story) {

				//sails.log.info("stories ID: ",story.id);
				//sails.log.info("stories type: ",story.storytype);

				//Added for newsriver in usertimeline
				if(story.storytype=='payback')
				{
					userId = story.user.id;
					userImage = userImagesMap[userId] || "";
					var paybackObjectData= {
											id: story.id,
											messages: story.messages,
											likersCount: story.likers.length,
											dislikersCount: story.dislikers.length,
											status: getStatusForClient(story.status),
											statusNumber: story.status,
											storytype:story.storytype,
											userImage: userImage,
											user: story.user.id,
											screenName: story.user.screenName || "-",
											createdAt: moment(story.createdAt).format('LLLL'),
											updatedAt: story.updatedAt
										};
					 data.push(paybackObjectData);
				}
				else if(story.storytype=='usernewsriver')
				{
					userId = story.user.id;
					userImage = userImagesMap[userId] || "";
					var usernewsriverObjectData= {
											id: story.id,
											messages: story.messages,
											likersCount: story.likers.length,
											dislikersCount: story.dislikers.length,
											status: getStatusForClient(story.status),
											statusNumber: story.status,
											storytype:story.storytype,
											userImage: userImage,
											user: story.user.id,
											screenName: story.user.screenName || "-",
											createdAt: moment(story.createdAt).format('LLLL'),
											updatedAt: story.updatedAt
										};
					 data.push(usernewsriverObjectData);
				}
				else
				{
				  userId = story.user.id;
				  userImage = userImagesMap[userId] || "";
				  timelineObject = story.toTimelineApiWithImage(userImage);
				  //console.log("here is the timelineObject", timelineObject);
				  data.push(timelineObject);
				}
            });

            /*return resolve({
              data: data,
              amount: amount
            });*/

			return resolve(data)
          })
          .catch(function(err) {
            // TODO: handle error - no image for  user
          })

      })
      .catch(function(err) {
        sails.log.error("Story#getTimelineForUser :: Error :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  })
}

function getUserActiveLoanDetails(user) {
  var deferred = Q.defer();


  /*var criteria = {
    user: user.id
  };*/

  var criteria = {
    user: user.id,
	storytype:'userloan',
	status:[STATUS_LOANINITIATED, STATUS_DELINQUENT, STATUS_TRANSFERINITIATED,STATUS_PAIDBACK]
  };

  //TODO:
  Story
    .findOne(criteria)
	.sort("createdAt DESC")
    .then(function(story) {

	  sails.log.info("getUserActiveLoanDetails ::info", story);

      if (story.status == 8 || story.status == 10 || story.status == 15 || story.status == 9) {

        var criteria = {
          user: story.user,
          isPaymentActive: true
        };
        //TODO: Need to put in different logic
        PaymentManagement
          .findOne(criteria)
          .then(function(paymentManagementDetail) {
            var fundingFee;
            if (story.fluidCard) {
              fundingFee = 0 + "%"
            } else {
              fundingFee = 0 + "%"
            }

			if(paymentManagementDetail.interestapplied)
			{
				interestRate = paymentManagementDetail.interestapplied;

				if(paymentManagementDetail.loantermcount)
				{
					loanTerm = paymentManagementDetail.loantermcount;
				}
				else
				{
					loanTerm = feeManagement.sixmonthTerm;
				}
				if(paymentManagementDetail.apr)
				{
					loanApr = paymentManagementDetail.apr;
				}
				else
				{
					loanApr = feeManagement.apr;
				}
			}
			else
			{
				interestRate = feeManagement.interestRate;
				loanTerm = feeManagement.loanTerm;
				loanApr = feeManagement.apr;
			}
            var obj = {
              //loanNumber: story.id,
							loanNumber: paymentManagementDetail.loanReference,
							financedAmount: story.approvedAmount,
							maturityDate: paymentManagementDetail.maturityDate,
							//interestRate: feeManagement.interestRate + "%",
							//apr: feeManagement.apr + "%",
							interestRate: interestRate + "%",
							apr: interestRate + "%",
							//loanTerm: feeManagement.loanTerm + ' Months',
							loanTerm: loanTerm + ' Months',
							loanDate: story.updatedAt,
							fundingFee: fundingFee
            };

            deferred.resolve(obj)
          })
          .catch(function(err) {
            sails.log.error("getPaymentManagementDetail ::Error", err);
            deferred.reject(err)
          })
      }
    })

  .catch(function(err) {
    sails.log.error("Story#getUserActiveLoanDetails :: Error finding story", err);

    deferred.reject({
      code: 500,
      message: 'INTERNAL_SERVER_ERROR'
    });
  });
  return deferred.promise;

}

/**
 *
 * @param user
 * @returns {*}
 */
function getAllUserActionStories(user) {
  return Q.promise(function(resolve, reject) {

    Story.native(function(err, collection) {
      if (err) {
        sails.log.error('Story#getAllUpdatedStories :: Native error :: ', err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      }

      // select id from story where dislikers($0.userId == user.id) AND likers($0.userId == user.id);

      var criteria = {
        '$or': [{
          'dislikers': {
            '$elemMatch': {
              'userId': user.id
            }
          }
        }, {
          'likers': {
            '$elemMatch': {
              'userId': user.id
            }
          }
        }]
      };

      collection.find(criteria, {
          "_id": 1
        })
        .toArray(function(err, userActionStories) {
          /// TODO: update
          if (err) {
            sails.log.error('Story#getAllUpdatedStories :: Native error :: ', err);

            return reject({
              code: 500,
              message: 'INTERNAL_SERVER_ERROR'
            });
          }

          var data = [];
          _.forEach(userActionStories, function(story) {
            data.push(story._id);
          });

          var criteria = {
            id: data
          };

          Story
            .find(criteria)
            .then(function(stories) {

              return resolve(stories);
            })
        })
    });

    return resolve();
  })
}

function migrateActionsToOldUser(story, newUser, existingUser) {
  return Q.promise(function(resolve, reject) {
    // loop on likers and change the ownership
    if (story.likers) {
      story.likers.map(function(liker) {
        // check if this like is by new user
        if (liker.userId === newUser.id) {
          // change the ownership
          liker.userId = existingUser.id;
        }
      })
    }

    if (story.dislikers) {
      story.dislikers.map(function(disliker) {
        // check if this like is by new user
        if (disliker.userId === newUser.id) {
          // change the ownership
          disliker.userId = existingUser.id;
        }
      })
    }

    // save the story
    story.save(function(err) {
      // TODO: reject and log error
      if (err) {

      }

      return resolve(story);
    });
    return resolve();
  })
}

function updateUserOwnership(newUser, existingUser) {
  return Q.promise(function(resolve, reject) {
    // get all the stories of a new user
    var criteria = {
      user: newUser.id
    };

    Story
      .find(criteria)
      .then(function(stories) {
        // loop and update
        stories.map(function(story) {
          story.user = existingUser.id;
          // update user
          story.save(function(err) {
            //TODO: log the error
          })
        });
      });
    return resolve();
  })
}

function getAllStoriesForUniversityTimeline(universityId,skipvalue,limitvalue) {
  return Q.promise(function(resolve, reject) {

    //need to add (,STATUS_NEWSINITIATED) in criteria
    var criteria = {
      university: universityId,
      status: [STATUS_QUEUED, STATUS_REQUESTED, STATUS_TRANSFERRED,
        STATUS_TRANSFERRETURNED, STATUS_TRANSFERFAILED,
        STATUS_LOANINITIATED, STATUS_PAIDBACK, STATUS_APPROVED,
        STATUS_TRANSFERINITIATED,STATUS_NEWSINITIATED
      ],
      isDeleted: false
    };

    Story
      .find(criteria)
      .sort("createdAt DESC")
      .populateAll()
	  .skip(skipvalue)
	  .limit(limitvalue)
      .then(function(values){

		//sails.log.info("university timeline values: ",values);
       /* var result = [];
        _.forEach(values, function(storyDetail) {
          var story = storyDetail.toAppApi();
          if(story.screenName !== ""){
            result.push(story);
          }
        });
        resolve(result);*/
		resolve(values);
      })
      .catch(function(err) {
        sails.log.error('Story#getAllStoriesForUniversityTimeline :: Error :: ', err);


        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}


function getPaymentActivity(user) {

  var deferred = Q.defer();
  var criteria = {
    user: user.id,
    isDeleted: false,
	storytype: 'userloan'
  };

  Story
    .findOne(criteria)
	.sort('createdAt DESC')
    .then(function(story) {

	  //sails.log.info("story Data: ", story);

      var criteria = {
        user: user.id,
        isPaymentActive: true,
		//status:['OPENED','CURRENT','LATE'],
		$or : [ { achstatus : 0 }, { achstatus : 1 }, { achstatus : 3 } ]
      };

      PaymentManagement
        .findOne(criteria)
        .then(function(paymentManagementDetail) {
          PaymentManagement
            .getPaymentActivityDetail(paymentManagementDetail)
            .then(function(data) {

              var accountName;
              var key = 'manualPayment';
              var accountNumberLastFour;
              Account
                .findOne({
                  user: paymentManagementDetail.user,
				  id:paymentManagementDetail.account
                })
                .then(function(accountDetail) {
                  accountName = accountDetail.accountName;
                  accountNumberLastFour = accountDetail.accountNumberLastFour;

                   /*var manualObject = {
                    key: key,
                    manualPayment: paymentManagementDetail.manualPayment,
                    paymentStatus: 'Settled',
                    accountName: accountName,
                    accountNumberLastFour: accountNumberLastFour
                  }
                  data.push(manualObject);*/


				  _.forEach(paymentManagementDetail.usertransactions, function(transactions) {

					  if(transactions.transactionType)
					  {
						 var transactionType = transactions.transactionType;
					  }
					  else
					  {
						 var transactionType ="Manual";
					  }

					  if(transactions.status==1)
					  {
						 var paymentStatus = "Pending";
					  }
					  if(transactions.status==2)
					  {
						 var paymentStatus ="Settled";
					  }

					  var paymentObject = {
						date: transactions.date,
						key: transactionType,
						paymentStatus: paymentStatus,
						amount: parseFloat(transactions.amount),
						accountNumberLastFour: accountNumberLastFour,
						accountName: accountName
					  };
					  data.push(paymentObject);
          		  })
				  sails.log.info("payment activity Data: ", data);
                  deferred.resolve(data);
                })
            })
        })
        .catch(function(err) {
          sails.log.error("#no payment object found:: Error", err);
          deferred.reject(err);
        })
    })
    .catch(function(err) {
      sails.log.error("#no story found ::Error", err);
      deferred.reject(err);

    })
  return deferred.promise;
}
//TODO: NEED TO COMPLETE MAke  PAYMENT
function getAccountHistory(user) {
  var deferred = Q.defer();
  var criteria = {
    user: user.id
  };
  Story
    .findOne(criteria)
    .then(function(storyDetail) {
      var criteria = {
        story: storyDetail.id
      };
      PaymentManagement
        .findOne(criteria)
        .then(function(paymentManagementDetail) {
          _.forEach(paymentManagementDetail.paymentSchedule, function(schedule) {

          })
        })
    })
}

function getPayment(user) {
  var deferred = Q.defer();
  var criteria = {
    user: user.id,
	isDeleted: false,
	storytype: 'userloan'
  };

  //console.log("story criteria: ",criteria);

  Story
    .findOne(criteria)
	.sort('createdAt DESC')
    .then(function(storyDetail) {
      var criteria = {
        user: user.id,
        isPaymentActive: true
      };

	  //console.log("storyDetail Data: ",storyDetail);
	  //console.log("PaymentManagement criteria: ",criteria);

      PaymentManagement
        .findOne(criteria)
        .then(function(paymentManagementDetail) {
          var criteria = {
            user: paymentManagementDetail.user,
			id: paymentManagementDetail.account
          };

		  //console.log("paymentManagementDetail Data: ",paymentManagementDetail);
		  //console.log("Account criteria: ",criteria);

          Account
            .find(criteria)
            .then(function(accountDetail) {

              var accountData = [];
              _.forEach(accountDetail, function(account) {
                var accountObject = {
                  accountName: account.accountName,
                  accountNumberLastFour: account.accountNumberLastFour
                };
                accountData.push(accountObject);
              })

			  //sails.log.info("accountData: ",accountData);

              var payOffAmount = 0;
              var totalAmountDue = 0;
              _.forEach(paymentManagementDetail.paymentSchedule, function(scheduler) {

                if (scheduler.status == "OPENED" || scheduler.status == 'CURRENT') {
                  totalAmountDue = paymentManagementDetail.paymentSchedule[0].amount;

				  //Fixed to show current schedule amount
				 /* if(totalAmountDue<scheduler.amount)
				  {
				  	totalAmountDue = scheduler.amount;
				  }*/
                  payOffAmount = parseFloat(payOffAmount) + parseFloat(scheduler.amount);
                }

              })

			  if(paymentManagementDetail.amount)
			  {
				var financedAmount =  paymentManagementDetail.amount;
			  }
			  else
			  {
				 var financedAmount =  paymentManagementDetail.payOffAmount;
			  }

			  if(paymentManagementDetail.interestapplied)
			  {
				var interestRate =  paymentManagementDetail.interestapplied;
			  }
			  else
			  {
				 var interestRate =  0;
			  }

			  var todaysDateFormat = moment().startOf('day').format('MM-DD-YYYY');
			  //var todaysDate = moment().startOf('day').toDate();
			  var todaysMonth = moment().startOf('day').format('M');
			  var currentDay = moment().startOf('day').format('D');
			  fullPayoffAmount =  0;
			  fullPayoffMonth =  0;
			  finalinterestAmount =  0;
			  totalinterestDays =0;
			  paidterms =0;
			  interestApplied =0;
			  chargeinterestDays =0;
			  minimumAmount=0;

			  var maturityDate = moment(paymentManagementDetail.maturityDate).startOf('day').toDate().getTime();

			  if(interestRate>0)
			  {
				   paymentManagementDetail.paymentSchedule = _.orderBy(paymentManagementDetail.paymentSchedule, ['date'], ['asc']);

				   //minimumAmount = paymentManagementDetail.paymentSchedule[0].interestAmount;

				   _.forEach(paymentManagementDetail.paymentSchedule, function(scheduler) {

							if(minimumAmount==0)
							{
								minimumAmount = scheduler.interestAmount;
							}
							if (scheduler.status == "OPENED" || scheduler.status == 'CURRENT' || scheduler.status == 'LATE' ) {
									if(scheduler.amount>0)
									{
										interestAmount = scheduler.interestAmount;
										startBalanceAmount = scheduler.startBalanceAmount;
										if(fullPayoffAmount==0)
										{
											fullPayoffAmount = startBalanceAmount;
										}

										//var nextMonthDate = moment(scheduler.date).add(1, "months").startOf('day').toDate();
										var nextMonthDate = moment(scheduler.date).startOf('day').toDate();
										var nextMonthDateValue = moment(nextMonthDate).startOf('day').toDate().getTime();
										var todaysDate = moment(new Date());
										var todaysDateValue = moment().startOf('day').toDate().getTime();
										var schedulerDate  = moment(scheduler.date).startOf('day').toDate();

										var lastpaidDate  = moment(scheduler.lastpaiddate).startOf('day').toDate();
										var lastpaidDateValue = moment(scheduler.lastpaiddate).startOf('day').toDate().getTime();

										if( todaysDateValue >= nextMonthDateValue && todaysDateValue<=maturityDate )
										{
											sails.log.info("enter if part: ");
											finalinterestAmount = parseFloat(finalinterestAmount)+parseFloat(interestAmount);
										}
										else
										{
											if( nextMonthDateValue > todaysDateValue && todaysDateValue<=maturityDate)
											{
												if(interestApplied==0)
												{
													//oDate = moment(nextMonthDate);
													oDate = moment(lastpaidDate);
													diffDays = oDate.diff(todaysDate, 'days');
													totalinterestDays  = Math.abs(diffDays);

													sDate = moment(schedulerDate);
													sdiffDays = sDate.diff(lastpaidDate, 'days');
													sdiffDays  = Math.abs(sdiffDays);

													sails.log.info("sdiffDays: ",sdiffDays);
													sails.log.info("totalinterestDays: ",totalinterestDays);

													if(sdiffDays>30)
													{
														sdiffDays =30;
													}

													//dayinterestAmount = interestAmount / 30;
													//chargeinterestDays = 30 - totalinterestDays;

													dayinterestAmount = interestAmount / sdiffDays;
													chargeinterestDays = totalinterestDays;

													if(todaysDateValue<lastpaidDateValue)
													{
														chargeinterestDays =0;
													}
													else
													{
														if(chargeinterestDays<=0)
														{
															if(scheduler.lastpaidcount==1 && todaysDateValue==lastpaidDateValue )
															{
																chargeinterestDays =0;
															}
															else
															{
																chargeinterestDays =1;
															}
														}
														else
														{
															if(scheduler.lastpaidcount==1)
															{
																chargeinterestDays =parseInt(chargeinterestDays);
															}
															else
															{
															 chargeinterestDays =parseInt(chargeinterestDays)+1;
															}
														}
													}

													totalinterestDaysAmount = dayinterestAmount * chargeinterestDays;

													sails.log.info("enter else part: ");
													sails.log.info("diffDays: ",totalinterestDays);
													sails.log.info("chargeinterestDays: ",chargeinterestDays);
													sails.log.info("dayinterestAmount: ",dayinterestAmount);

													finalinterestAmount = parseFloat(finalinterestAmount)+parseFloat(totalinterestDaysAmount);

													interestApplied =1;
												}
											}
										}

										//schedulerMonth = moment(scheduler.date).startOf('day').format('M');
										//schedulerDate = moment(scheduler.date).startOf('day').format('D');

										/*if(schedulerMonth==todaysMonth)
										{
											var daysInMonth = moment(scheduler.date).daysInMonth();

											if(daysInMonth >currentDay)
											{
												totalinterestDays = currentDay;
											}

											if(daysInMonth <= currentDay)
											{
												totalinterestDays = daysInMonth;
											}

											dayinterestAmount = interestAmount / totalinterestDays;
											finalinterestAmount = parseFloat(finalinterestAmount)+parseFloat(dayinterestAmount);
										}

										if(schedulerMonth<todaysMonth)
										{
											finalinterestAmount = parseFloat(finalinterestAmount)+parseFloat(interestAmount);
										}

										if(schedulerMonth>todaysMonth)
										{
											//No interest calculation
										}*/

									}
							}

							if (scheduler.status == "PAID OFF" )
							{
								paidterms = parseInt(paidterms)+1;
							}
				    })

				   if(parseFloat(fullPayoffAmount) >0)
				   {
					  fullPayoffAmount =  parseFloat(fullPayoffAmount);

					  if(parseFloat(finalinterestAmount) >0)
					  {
						  fullPayoffAmount = parseFloat(fullPayoffAmount) + parseFloat(finalinterestAmount);
					  }
				   }

				   fullPayoffAmount = parseFloat(fullPayoffAmount.toFixed(2));

			  }
			  else
			  {
				  fullPayoffAmount =  payOffAmount;
			  }

			  sails.log.info("finalinterestAmount: ",finalinterestAmount);
			  sails.log.info("fullPayoffAmount: ",fullPayoffAmount);

              var makePaymentObject = {
									//payOffAmount: paymentManagementDetail.payOffAmount,
									payOffAmount: fullPayoffAmount,
									totalAmountDue: totalAmountDue,
									accountData: accountData,
									financedAmount: financedAmount,
									interestRate: interestRate,
									fullPayoffAmount: fullPayoffAmount,
									minimumAmount:minimumAmount
              };

			  //console.log("makePaymentObject: ",makePaymentObject);

              deferred.resolve(makePaymentObject);

            })
        })
        .catch(function(err) {
          sails.log.error("# make payment Object::Error", err);
          deferred.reject(err);
        })
        .catch(function(err) {
          sails.log.error("# make payment Object::Error", err);
          deferred.reject(err);
        })

    })
  return deferred.promise;
}






function getProfileImage(story) {

  var deferred = Q.defer();
  var criteria = {
    id: story.user.id
  };
  User
    .find(criteria)
    .populate('profilePicture')
    .then(function(users) {
      var data = [];
      _.forEach(users, function(user) {
        if (user.profilePicture) {
          data.push(user.profilePicture.toApi())
        }
        deferred.resolve(data);

      });

    })
    .catch(function(err) {
      sails.log.error("getAll profilePicture##", err);
      deferred.reject(err);
    })
  return deferred.promise;
}

//TODO:Need to implement logic
function getStoryOnClick(storyId, id) {
  return Q.promise(function(resolve, reject) {
    console.log("here is the log",storyId);
    Story.native(function(err, collection) {
      if (err) {
        sails.log.error('Story#getAllUpdatedStories :: Native error :: ', err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      }

      /*var criteria = {
        '$and': [{
          'dislikers': {
            '$not': {
              '$elemMatch': {
                'userId': id
              }
            }
          }
        }, {
          'likers': {
            '$not': {
              '$elemMatch': {
                'userId': id
              }
            }
          }
        }, {
            _id: ObjectId(storyId)
        }]
      };*/

	  var criteria = { _id: ObjectId(storyId) }
      //console.log("here is the criteria",criteria);

      collection.find(criteria, {
          "_id": 1
        })
        .toArray(function(err, storyDetails) {
          console.log("here is the storyDetails",storyDetails);
          if (err) {
            sails.log.error('Story#getAllUpdatedStories :: Native error :: ', err);

            return resolve(null);
          }
          // check the array count
          if (storyDetails.length == 0) {
            //console.log("it should be greater than 1",storyDetails.length);
            return resolve(null);
          }

          var storyCriteria = {
              id: storyId
            }
            // create a waterline query for story
          Story
            .getStoryDetail(storyCriteria)
            .then(function(stories) {
              //console.log("Here should be the story",stories);
              if (stories.length == 0) {
                return resolve(null);
              }

			  var storyAppApi=stories[0].toAppApi();

			  if(storyAppApi.likersCount>0)
			  {
			  	var filteredLikedUsers = _.filter(stories[0].likers, { "userId": id });

				sails.log.info("filteredLikedUsers: ",filteredLikedUsers);

				if (filteredLikedUsers.length >0) {
				   storyAppApi.userLiked =true;
				}
				else
				{
				  storyAppApi.userLiked =false;
				}
			  }
			  else
			  {
				 storyAppApi.userLiked =false;
			  }

			  if(storyAppApi.likersCount>0)
			  {
			  	 var filteredDisLikedUsers = _.filter(stories[0].dislikers, { "userId": id });

				if (filteredDisLikedUsers.length >0) {
				   storyAppApi.userDisLiked =true;
				}
				else
				{
				  storyAppApi.userDisLiked =false;
				}
			  }
			  else
			  {
				 storyAppApi.userDisLiked =false;
			  }

			  return resolve(storyAppApi);

              //return resolve(stories[0].toAppApi());
            })
            .catch(function(err) {
              sails.log.error("Story#getStoryOnClick :: Error :: ", err);

              return resolve(null);
            });

        })

    })
  })
}


function updateRequestedAmount(user, storyId, amount) {
  var deferred = Q.defer();
  var criteria = {
    user: user.id,
    id: storyId
  };
  Story
    .findOne(criteria)
    .then(function(storyDetail) {
      storyDetail.requestedAmount = amount;
      storyDetail.save();
      deferred.resolve(storyDetail)
    })
    .catch(function(err) {
      sails.log.error("update requestedAmount::Error", err);
      deferred.reject(err);
    })
  return deferred.promise;

}

//ADDED THIS FUNCTION TO BYPASS ACH PROCESS
function createLoanPayment(story,loanappversion,loaniosversion){
	return Q.promise(function(resolve, reject) {
		PaymentManagement
          .createPaymentSchedule(story,loanappversion,loaniosversion)
          .then(function(paymentDet) {

			//Need to update achcomments for plaid error starts here
			var criteria = {
      			user: story.user,
				acherrorstatus: { $eq: 1, $exists: true },
    		};
			Achcomments
			.findOne(criteria)
			.then(function(achcomments) {
				if(achcomments)
				{
					achcomments.paymentManagement=paymentDet.id;
					achcomments.save();
				}
			});
			//Need to update achcomments for plaid error starts here

            Setting
              .updateCommunityBalance(story)
              .then(function(settingEntity) {
                //return resolve(transactionEntity);
				return resolve(settingEntity);
              })
              .catch(function(err){
                sails.log.info("Updating Setting Entity in Transaction::Error", err);
                return reject(err);
              })
          })
          .catch(function(err) {
            sails.log.error("PaymentSchedulerObject:: err", err);
            return reject(err);
          })
	});
}

function insertMessage(storyDetail){
	return Q.promise(function(resolve, reject) {

	if(storyDetail.storytype=='usernewsriver')
	{
		storyDetail.status = STATUS_USERNEWSINITIATED;
	}
	else
	{
		storyDetail.status = STATUS_NEWSINITIATED;
	}
	Story.create(storyDetail)
	.then(function(storyInformation) {
	   console.log("here it is getting created", storyInformation);
	   return resolve(storyInformation)
	 })
	  .catch(function(err) {
		sails.log.error("::ERROR", err);
		return reject(err);
	  })
	});
}


function getStoryMessageDetails(messageID) {
	return Q.promise(function(resolve, reject) {

		Messages
		  .find({
			id:messageID,
			category : 'newsriver',
			isDeleted: false
		  })
		  .then(function(messages) {
			if (!messages) {
			  return reject({
				code: 404,
				message: 'MESSAGE_NOT_FOUND'
			  });
			}
			var messageData = [];
			_.forEach(messages, function(message) {
			  messageData.push(message.toMessageListApi());

			})

			return resolve(messageData);
		  })
		  .catch(function(err) {
			sails.log.error('Messages#getMessageDetails :: err', err);
			return reject(err);
		  });
  });
}


function getnewsriverTimelineForCommunity(skipvalue,limitvalue) {
  return Q.promise(function(resolve, reject) {
    var criteria = {
      status: [STATUS_QUEUED, STATUS_REQUESTED, STATUS_TRANSFERRED,
        STATUS_TRANSFERRETURNED, STATUS_TRANSFERFAILED,
        STATUS_LOANINITIATED, STATUS_PAIDBACK, STATUS_APPROVED,
        STATUS_TRANSFERINITIATED,STATUS_NEWSINITIATED
      ],
	  //storytype:"newsriver"
	  $and: [ { storytype: "newsriver"  },
		{ $or : [ { university: { $eq: '', $exists: true } }, { university:{ $exists: false }}  ] },
	  ]
    };

    Promise.all([
      Story.find(criteria).skip(skipvalue).limit(limitvalue).sort('createdAt DESC').populateAll(),
    ]).then(function(results) {
	    sails.log.info("newsriver results: " ,results.length);
        var stories = results[0];
		var data = [];
		_.forEach(stories, function(story) {

			//if(story.messages.viewtype!='university')
			//{
				var newsriverObject= {
										id: story.id,
										messages: story.messages,
										likersCount: story.likers.length,
										dislikersCount: story.dislikers.length,
										status: getStatusForClient(story.status),
										statusNumber: story.status,
										storytype:story.storytype,
										createdAt: moment(story.createdAt).format('LLLL'),
										updatedAt: story.updatedAt
									};
				data.push(newsriverObject);
			//}
		})
		//sails.log.info("here are the list of newsriver community stories",data);
		return resolve(data);
      })
      .catch(function(err) {
        sails.log.error("Story#getnewsriverTimelineForCommunity :: Error :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });

      });
  })
}

function gettransactionTimelineForCommunity(skipvalue, limitvalue) {
  return Q.promise(function(resolve, reject) {
    var criteria = {
      status: [STATUS_QUEUED, STATUS_REQUESTED, STATUS_TRANSFERRED,
        STATUS_TRANSFERRETURNED, STATUS_TRANSFERFAILED,
        STATUS_LOANINITIATED, STATUS_PAIDBACK, STATUS_APPROVED,
        STATUS_TRANSFERINITIATED,STATUS_NEWSINITIATED
      ],
	  $or : [ { storytype : 'userloan' }, { storytype : 'payback' } ],
    };

    var borrowedAmount = parseInt(0.0);
    var paidAmount = parseInt(0.0);
    var requestedAmount = parseInt(0.0);
    var data = [];

    Promise.all([
      Story.find(criteria).skip(skipvalue).limit(limitvalue).sort('createdAt DESC').populateAll(),
    ]).then(function(results) {
        var stories = results[0];
        var userIds = [];
        _.forEach(stories, function(story) {
          if (story.status == 8 ||
            story.status == 11 ||
            story.status == 14 ||
            story.status == 15) {
            borrowedAmount = borrowedAmount + story.requestedAmount;
          } else if (story.status == 9) {
            paidAmount = paidAmount + story.requestedAmount;
          } else if (story.status == 2 || story.status == 3) {
            requestedAmount = requestedAmount + story.requestedAmount;
          }

		  if(story.user)
		  {
          	userIds.push(story.user.id);
		  }
        });

        var amount = {
          borrowedAmount: borrowedAmount,
          paidAmount: paidAmount,
          requestedAmount: requestedAmount
        };

        // Get user profile images
        Story
          .getProfileImagesForUsers(userIds)
          .then(function(userImagesMap) {

            var timelineObject,
              userId,
              userImage;

			var messagelineObject;

            _.forEach(stories, function(story) {

				if(story.user)
		 		{
					if(story.storytype=='payback' )
					{
						//story.storytype='newsriver'; //--temporary purpose
						userId = story.user.id;
					    userImage = userImagesMap[userId] || "";
						var newsriverObject= {
												id: story.id,
												messages: story.messages,
												likersCount: story.likers.length,
												dislikersCount: story.dislikers.length,
												status: getStatusForClient(story.status),
												statusNumber: story.status,
												storytype:story.storytype,
												userImage: userImage,
												user: story.user.id,
												screenName: story.user.screenName || "-",
												createdAt: moment(story.createdAt).format('LLLL'),
												updatedAt: story.updatedAt
											};
						data.push(newsriverObject);
					}
					else
					{
					  userId = story.user.id;
					  userImage = userImagesMap[userId] || "";
					  timelineObject = story.toTimelineApiWithImage(userImage);
					  data.push(timelineObject);
					}
				}
            });
            //sails.log.info("here is the story data", data);

            return resolve({
              data: data
              //,amount: amount
            });
          })
          .catch(function(err) {

          });
      })
      .catch(function(err) {
        sails.log.error("Story#getTimelineForCommunity :: Error :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });

      });
  })
}

//,skipvalue,limitvalue
function getNewsriverForUser(user,skipvalue,limitvalue) {

  return Q.promise(function(resolve, reject) {

    var criteria = {
      user: user.id,
      status: [STATUS_USERNEWSINITIATED],
	  storytype: 'usernewsriver'
    };

    var data = [];
    Story
      .find(criteria)
	  .sort("createdAt DESC")
	  .skip(skipvalue)
	  .limit(limitvalue)
	  .populateAll()
      .then(function(stories) {

        //sails.log.info("here are the user newsriver stories: ", stories);
        if (!stories) {
          return reject({
            code: 204,
            message: 'NO_STORIES_IN_DB'
          })
        }

		var usercriteria = {
			id: user.id
		  };

		User
		.find(usercriteria)
		.populate('profilePicture')
		.then(function(usersdetails) {

			  //sails.log.info("usersdetails: ",usersdetails);
			  var userImage='';

			   _.forEach(usersdetails, function(user) {
				if (user.profilePicture) {
				  userImage = user.profilePicture.toApi();
				} else {
				  userImage = "";
				}
			  });
			  //sails.log.info("userImage: ",userImage);

		 	_.forEach(stories, function(story) {

				//sails.log.info("stories ID: ",story.id);
				//sails.log.info("stories type: ",story.storytype);

				userId = story.user.id;
				var usernewsriverObjectData= {
									id: story.id,
									messages: story.messages,
									likersCount: story.likers.length,
									dislikersCount: story.dislikers.length,
									status: getStatusForClient(story.status),
									statusNumber: story.status,
									storytype:story.storytype,
									userImage: userImage,
									user: story.user.id,
									screenName: story.user.screenName || "-",
									createdAt: moment(story.createdAt).format('LLLL'),
									updatedAt: story.updatedAt
								};
			 	data.push(usernewsriverObjectData);
			});

			/*return resolve({
				data: data
			});*/
			return resolve(data);
		})
		.catch(function(err) {
		    sails.log.error("Story#getNewsriverForUser :: profilePicture Error :: ", err);
			return reject({
			  code: 500,
			  message: 'INTERNAL_SERVER_ERROR'
			});
		})
  	})
	.catch(function(err) {
		sails.log.error("Story#getNewsriverForUser :: Error :: ", err);
		return reject({
		  code: 500,
		  message: 'INTERNAL_SERVER_ERROR'
		});
	})
  });
}

//,skipvalue,limitvalue
function gettransactionTimelineForUser(user,skipvalue,limitvalue) {

  return Q.promise(function(resolve, reject) {

    var criteria = {
      user: user.id,
      status: [STATUS_QUEUED, STATUS_REQUESTED,  STATUS_TRANSFERRED,
        STATUS_TRANSFERRETURNED, STATUS_TRANSFERFAILED,
        STATUS_LOANINITIATED, STATUS_PAIDBACK, STATUS_DELINQUENT, STATUS_APPROVED,
        STATUS_TRANSFERINITIATED,STATUS_NEWSINITIATED
      ]
    };

    var data = [];
    Story
      .find(criteria)
	  .sort("createdAt DESC")
	  .skip(skipvalue)
	  .limit(limitvalue)
	  .populateAll()
      .then(function(stories) {
        //console.log("here are the stories", stories);
        if (!stories) {
          return reject({
            code: 204,
            message: 'NO_STORIES_IN_DB'
          })
        }

		var usercriteria = {
			id: user.id
		  };

		User
		.find(usercriteria)
		.populate('profilePicture')
		.then(function(usersdetails) {

			/*var userImage='';
			if (usersdetails.profilePicture) {
				userImage = usersdetails.profilePicture.toApi();
			}*/

			 var userImage='';

			_.forEach(usersdetails, function(user) {
				if (user.profilePicture) {
				  userImage = user.profilePicture.toApi();
				} else {
				  userImage = "";
				}
			});

			_.forEach(stories, function(story) {

				//sails.log.info("stories ID: ",story.id);
				//sails.log.info("stories type: ",story.storytype);

				//Added for newsriver in usertimeline
				if(story.storytype=='payback')
				{
					userId = story.user.id;
					//userImage = userImagesMap[userId] || "";
					var paybackObjectData= {
											id: story.id,
											messages: story.messages,
											likersCount: story.likers.length,
											dislikersCount: story.dislikers.length,
											status: getStatusForClient(story.status),
											statusNumber: story.status,
											storytype:story.storytype,
											userImage: userImage,
											user: story.user.id,
											screenName: story.user.screenName || "-",
											createdAt: moment(story.createdAt).format('LLLL'),
											updatedAt: story.updatedAt
										};
					 data.push(paybackObjectData);
				}
				else
				{
				  timelineObject = story.toTimelineApiWithImage(userImage);
				  data.push(timelineObject);
				}
			});

			return resolve({
			  data: data
			});
		})
		.catch(function(err) {
		    sails.log.error("Story#gettransactionTimelineForUser :: profilePicture Error :: ", err);
			return reject({
			  code: 500,
			  message: 'INTERNAL_SERVER_ERROR'
			});
		})

      })
      .catch(function(err) {
        sails.log.error("Story#gettransactionTimelineForUser :: Error :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  })
}


function newsriverUniversityStories(universityId,skipvalue,limitvalue) {
  return Q.promise(function(resolve, reject) {

    var criteria = {
      university: universityId,
      status: [STATUS_QUEUED, STATUS_REQUESTED, STATUS_TRANSFERRED,
        STATUS_TRANSFERRETURNED, STATUS_TRANSFERFAILED,
        STATUS_LOANINITIATED, STATUS_PAIDBACK, STATUS_APPROVED,
        STATUS_TRANSFERINITIATED,STATUS_NEWSINITIATED
      ],
	  storytype: 'newsriver',
      isDeleted: false
    };

    Story
      .find(criteria)
      .sort("createdAt DESC")
	  .skip(skipvalue)
	  .limit(limitvalue)
      .populateAll()
      .then(function(values){
		resolve(values);
      })
      .catch(function(err) {
        sails.log.error('Story#newsriverUniversityStories :: Error :: ', err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function transactionUniversityStories(universityId,skipvalue,limitvalue) {
  return Q.promise(function(resolve, reject) {

    var criteria = {
      university: universityId,
      status: [STATUS_QUEUED, STATUS_REQUESTED, STATUS_TRANSFERRED,
        STATUS_TRANSFERRETURNED, STATUS_TRANSFERFAILED,
        STATUS_LOANINITIATED, STATUS_PAIDBACK, STATUS_APPROVED,
        STATUS_TRANSFERINITIATED,STATUS_NEWSINITIATED
      ],
	  $or : [ { storytype : 'userloan' }, { storytype : 'payback' } ],
    };

    Story
      .find(criteria)
      .sort("createdAt DESC")
	  .skip(skipvalue)
	  .limit(limitvalue)
      .populateAll()
      .then(function(values){
		resolve(values);
      })
      .catch(function(err) {
        sails.log.error('Story#transactionUniversityStories :: Error :: ', err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function getTimelineAmountForCommunity()
{
  return Q.promise(function(resolve, reject) {

	var criteria = {
      status: [STATUS_QUEUED, STATUS_REQUESTED, STATUS_TRANSFERRED,
        STATUS_TRANSFERRETURNED, STATUS_TRANSFERFAILED,
        STATUS_LOANINITIATED, STATUS_PAIDBACK, STATUS_APPROVED,
        STATUS_TRANSFERINITIATED,STATUS_NEWSINITIATED
      ],
	  $or : [ { storytype: "userloan"  }, { storytype: "payback"  },
		{ $and: [ { storytype: "newsriver"  },
				{ $or : [ { university: { $eq: '', $exists: true } }, { university:{ $exists: false }}  ] },
		 	  ]
		}
	  ]
    };

    var borrowedAmount = parseInt(0.0);
    var paidAmount = parseInt(0.0);
    var requestedAmount = parseInt(0.0);

    Promise.all([
      Story.find(criteria).sort('createdAt DESC').populateAll(),
    ]).then(function(results) {
        var stories = results[0];
        var userIds = [];
        _.forEach(stories, function(story) {

			if(story.user)
			{
			  if (story.status == 8 ||
				story.status == 11 ||
				story.status == 14 ||
				story.status == 15) {
				borrowedAmount = borrowedAmount + story.requestedAmount;
			  } else if (story.status == 9) {
				paidAmount = paidAmount + story.requestedAmount;
			  } else if (story.status == 2 || story.status == 3) {
				requestedAmount = requestedAmount + story.requestedAmount;
			  }
			}
        });

        var amount = {
          borrowedAmount: borrowedAmount,
          paidAmount: paidAmount,
          requestedAmount: requestedAmount
        };

		return resolve(amount)

      })
      .catch(function(err) {
        sails.log.error("Story#getTimelineAmountForCommunity :: Error :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });

      });
  })
}


function getTimelineAmountForUser(user)
{
  return Q.promise(function(resolve, reject) {

    var criteria = {
      user: user.id,
      status: [STATUS_QUEUED, STATUS_REQUESTED,  STATUS_TRANSFERRED,
        STATUS_TRANSFERRETURNED, STATUS_TRANSFERFAILED,
        STATUS_LOANINITIATED, STATUS_PAIDBACK, STATUS_DELINQUENT, STATUS_APPROVED,
        STATUS_TRANSFERINITIATED,STATUS_NEWSINITIATED,STATUS_USERNEWSINITIATED
      ]
    };

    var data = [];
    Story
      .find(criteria)
	  .sort("createdAt DESC")
	  .populateAll()
      .then(function(stories) {
        if (!stories) {
          return reject({
            code: 204,
            message: 'NO_STORIES_IN_DB'
          })
        }
        var borrowedAmount = parseInt(0.0);
        var paidAmount = parseInt(0.0);
        var requestedAmount = parseInt(0.0);

        _.forEach(stories, function(story) {
          if (story.status == 8 ||
            story.status == 11 ||
            story.status == 14 ||
            story.status == 15) {
            borrowedAmount = borrowedAmount + story.requestedAmount;
          }
          if (story.status == 9) {
            paidAmount = paidAmount + story.requestedAmount;
          }
          if (story.status == 2 ||
            story.status == 3) {
            requestedAmount = requestedAmount + story.requestedAmount;
          }
        });

        var amount = {
          borrowedAmount: borrowedAmount,
          paidAmount: paidAmount,
          requestedAmount: requestedAmount
        };

		return resolve(amount)
      })
      .catch(function(err) {
        sails.log.error("Story#getTimelineAmountForUser :: Error :: ", err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  })
}

function getTimelineAmountForUniversity(universityId){
  return Q.promise(function(resolve, reject) {

    var criteria = {
      university: universityId,
      status: [STATUS_QUEUED, STATUS_REQUESTED, STATUS_TRANSFERRED,
        STATUS_TRANSFERRETURNED, STATUS_TRANSFERFAILED,
        STATUS_LOANINITIATED, STATUS_PAIDBACK, STATUS_APPROVED,
        STATUS_TRANSFERINITIATED,STATUS_NEWSINITIATED
      ],
      isDeleted: false
    };

    Story
      .find(criteria)
      .sort("createdAt DESC")
      .populateAll()
      .then(function(stories){

			var borrowedAmount = 0;
            var paidAmount = 0;
            var chillingAmount = 0;

			_.forEach(stories, function(story) {
				if(story.user)
				{
				  if (story.status == 15
					|| story.status == 8
					|| story.status == 11
					|| story.status == 14) {
					borrowedAmount = borrowedAmount + story.requestedAmount;
				  }
				  if (story.status == 9) {
					paidAmount = paidAmount + story.requestedAmount;
				  }
				  if (story.status == 2
					|| story.status == 3) {
					chillingAmount = chillingAmount + story.requestedAmount;
				  }
				}
            })

            var amount = {
              borrowedAmount: borrowedAmount,
              paidAmount: paidAmount,
              chillingAmount: chillingAmount
            };
			return resolve(amount);
      })
      .catch(function(err) {
        sails.log.error('Story#getTimelineAmountForUniversity :: Error :: ', err);
        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}


function findAllUnsedStory(userId) {
  return Q.promise(function(resolve, reject) {

	var criteria = {
	  storytype: 'userloan'
    };

	//var criteria = { };

    var data = [];
    Story.find(criteria)
      .sort("createdAt DESC")
      .populate('user')
      .then(function(storyDetails) {
		  var storycount = storyDetails.length;
		  var userExist=0;
		  var userFail=0;

        _.forEach(storyDetails, function(storyDetail) {
          if (!storyDetail.user) {
			 sails.log.info("user does not exist: ",storyDetail.id , storyDetail.createdAt, storyDetail.storytype);
			 userFail++;

			  Story
			  .destroy({
				id: storyDetail.id
			  })
			  .then(function () {
				sails.log.info("story deleted ");
			  });

		  }
		  if (storyDetail.user) {
			 userExist++;
		  }
        })

		var responsedata ={
			totalstories: storycount,
			userExist: userExist,
			userFail: userFail
		};
		return resolve(responsedata);
		//return resolve(data);
      })
      .catch(function(err) {
        sails.log.error("Story#findAllUnsedStory :: error :: ", err);
        return reject(err);
      })
  })
}

function acceptTermsStoryInformation(user,storyid) {
  return Q.promise(function(resolve, reject) {
	  var criteria = {
		id: storyid,
		user: user.id,
		//isStoryApproved: false,
		//isDeleted: false,
		storytype: 'userloan'
	  };

	  sails.log.info("story criteria: ",criteria);

	  Story
		.findOne(criteria)
		.then(function(storyDetail) {

		 /* var criteria = {
			story: storyDetail.id,
			user: user.id
		  };*/

		  /*PaymentManagement
		  .findOne(criteria)
		  .then(function(paymentManagementDetail) {

			   interestRate =0;
				if(paymentManagementDetail.interestapplied)
				{
					interestRate = paymentManagementDetail.interestapplied;
				}
			    var responsedata ={
					fluidfundingfee: 0 + "%",
					fluidapr: interestRate+ "%",
					fluidfinancecharage: "$" + 0,
					fluidtotalpayment: "$" + 0,
					otherfundingfee: 120+ "%",
					otherapr: 120+ "%",
					otherfinancecharage: "$" + 120,
					othertotalpayment: "$" + 120
				};
				sails.log.info("story responsedata: ",responsedata);
				return resolve(responsedata);
		   })
		  .catch(function(err) {
			sails.log.error("Story#acceptTermsStoryInformation :: error :: ", err);
			return reject(err);
		  })*/

		  sails.log.info("storyDetail: ",storyDetail);

		  var loancriteria = { loanactivestatus: 1};

		  LoanSettings
		  .find(loancriteria)
	  	  .then(function(loansettigDetails) {

			if(loansettigDetails.length>0)
			{
					var counter = 1;
					totalLoanAmount = 0;
					checktotalLoanAmount = 0;
					interestAmount =0;
					principalAmount =0;
					interestRate =0;
					setloanTerm =0;
					loanTerm =0;
					loanApr =0;
					loanFundingFee =0;
					loanInterestRate =0;
					loanBalanceAvail =0;
					fluidfinancecharage=0;
					startBalanceAmount = storyDetail.requestedAmount;
					var financedAmount = storyDetail.requestedAmount;

					_.forEach(loansettigDetails, function(loansettigData) {

						if(setloanTerm==0)
						{
							if(financedAmount>loansettigData.minimumamount && financedAmount<= loansettigData.maximumamount )
							{

								 if(loansettigData.setallowedstates==1)
								 {
										loanTerm = loansettigData.loanterm;
										loanApr = loansettigData.loanapr;
										loanFundingFee = loansettigData.loanfundingfee;
										loanInterestRate = loansettigData.loaninterestrate;
										loanBalanceAvail = loansettigData.loanbalanceavail;
										setloanTerm =1;
								 }
								 else
								 {
										loanTerm = loansettigData.loanterm;
										loanApr = loansettigData.loanapr;
										loanFundingFee = loansettigData.loanfundingfee;
										loanInterestRate = loansettigData.loaninterestrate;
										loanBalanceAvail = loansettigData.loanbalanceavail;
										setloanTerm =1;
								 }
							}
						}
					});
				}

				if(setloanTerm==0)
				{
					loanTerm = feeManagement.loanTerm;
					loanApr = feeManagement.apr;
					loanFundingFee = feeManagement.fundingFeePercentage;
					loanInterestRate = feeManagement.interestRate;
					loanBalanceAvail = feeManagement.balanceAvail;
				}

				//-- 24% calculation
				if(loanInterestRate>0)
				{
					//Monthly payment = [ r + r / ( (1+r) ^ months -1) ] x principal loan amount
					var  decimalRate = (loanInterestRate/ 100) / loanApr;
					var xpowervalue = decimalRate + 1;
					var ypowervalue = loanTerm;
					var powerrate_value= Math.pow(xpowervalue,ypowervalue) - 1;
					scheduleLoanAmount = ( decimalRate + ( decimalRate / powerrate_value ) ) * financedAmount;
					scheduleLoanAmount = scheduleLoanAmount.toFixed(2);

					if(checktotalLoanAmount==0)
					{
						checktotalLoanAmount = scheduleLoanAmount*loanTerm;
						checktotalLoanAmount = checktotalLoanAmount.toFixed(2);
					}

					fluidfinancecharage = checktotalLoanAmount - storyDetail.requestedAmount;
					fluidfinancecharage = fluidfinancecharage.toFixed(2);
				}
				else
				{
					checktotalLoanAmount = storyDetail.requestedAmount;
				}

				//-- 120% calculation
				otherloanInterestRate = 120;
				if(otherloanInterestRate>0)
				{
					//Monthly payment = [ r + r / ( (1+r) ^ months -1) ] x principal loan amount
					if(loanApr==0)
					{
						loanApr =12; //-- to avoid NAN in decimal rate
					}
					var  decimalRate = (otherloanInterestRate/ 100) / loanApr;
					var xpowervalue = decimalRate + 1;
					var ypowervalue = loanTerm;
					var powerrate_value= Math.pow(xpowervalue,ypowervalue) - 1;

					/*sails.log.info("story decimalRate: ",decimalRate);
					sails.log.info("story xpowervalue: ",xpowervalue);
					sails.log.info("story ypowervalue: ",ypowervalue);
					sails.log.info("story powerrate_value: ",powerrate_value);*/

					otherscheduleLoanAmount = ( decimalRate + ( decimalRate / powerrate_value ) ) * financedAmount;
					otherscheduleLoanAmount = otherscheduleLoanAmount.toFixed(2);

					otherchecktotalLoanAmount = otherscheduleLoanAmount*loanTerm;
					otherchecktotalLoanAmount = otherchecktotalLoanAmount.toFixed(2);

					otherfluidfinancecharage = otherchecktotalLoanAmount - storyDetail.requestedAmount;
					otherfluidfinancecharage = otherfluidfinancecharage.toFixed(2);
				}

				 var responsedata ={
					fluidfundingfee: 0 + "%",
					fluidapr: loanInterestRate+ "%",
					fluidfinancecharage: "$" + fluidfinancecharage,
					fluidtotalpayment: "$" + checktotalLoanAmount,
					otherfundingfee: 0+ "%",
					otherapr: 120+ "%",
					otherfinancecharage: "$" + otherfluidfinancecharage,
					othertotalpayment: "$" + otherchecktotalLoanAmount,
					amount: "$" + storyDetail.requestedAmount
				};
				sails.log.info("story responsedata: ",responsedata);
				return resolve(responsedata);
		 })
		 .catch(function(err) {
			sails.log.error("Story#acceptTermsStoryInformation :: error :: ", err);
			return reject(err);
		 })
	  })
	  .catch(function(err) {
		sails.log.error("Story#acceptTermsStoryInformation :: error :: ", err);
		return reject(err);
	  })
  })
}

function createUserstory(user, data) {
  var deferred = Q.defer();

  		if(user.id=='' || user.id==null || "undefined" == typeof user.id) {
			var userId = user;
		} else {
			var userId = user.id;
		}



		  var storyDetail = {
			user: userId,
			requestedAmount: data.offerdata[0].financedAmount,
			approvedAmount: data.offerdata[0].financedAmount,
			storytype: "userloan",
            storyReference: data.applicationReference
		  };


          Story.findOne({
              user: userId,
              status: 1
            })
            .populate('user')
            .then(function(story) {
              if (story) {
                story.requestedAmount = data.offerdata[0].financedAmount;
                story.save();
                deferred.resolve(story);
              } else {
                //console.log("here should be the storyDEtail", storyDetail);
                Story.create(storyDetail)
                  .then(function(storyInformation) {

                    User
                      .updateUserStatus(storyInformation)
                      .then(function(userDetail) {
                        console.log("here is the storyInformation", storyInformation);
                        Story
                          .findOne({
                            user: userDetail.id,
                            id: storyInformation.id
                          })
                          .populate('user')
                          .then(function(storyInformation) {
                            deferred.resolve(storyInformation)
                          })
                          .catch(function(err) {
                            sails.log.error("::ERROR", err);
                            deferred.reject(err);
                          })

                      })
                      .catch(function(err) {
                        sails.log.error("::ERROR", err);
                        deferred.reject(err);
                      })
                  })
                  .catch(function(err) {
                    sails.log.error("::ERROR", err);
                    deferred.reject(err);
                  })
              }
            })
            .catch(function(err) {
              sails.log.error("::ERROR", err);
              deferred.reject(err);
            })


  return deferred.promise;

}
