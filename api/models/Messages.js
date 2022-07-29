/**
 * Messages.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q');
var moment = require('moment');

var ObjectId = require('mongodb').ObjectID;

module.exports = {

  attributes: {
    user: {
      model: 'User'
    },
    message: {
      type: 'String'
    },
	category: {
      type: 'String',
	  defaultsTo: 'user'
    },
	/* university: {
      model: 'University'
    },*/
	viewtype: {
      type: 'String',
	  defaultsTo: 'user'
    },
    referenceId: {
      type: 'String'
    },
    subject: {
      type: 'String'
    },
    isDeleted: {
      type: 'boolean',
      defaultsTo: false
    },
    isRead: {
      type: 'boolean',
      defaultsTo: false
    },
	isMultiRead: {
      type: 'array',
      defaultsTo: []
    },
	/*partnerproduct: {
      model: 'Partnerproduct'
    },*/
	referralstatus: {
      type: 'integer',
      defaultsTo: 0
    },
	isMultiDeleted: {
      type: 'array',
      defaultsTo: []
    },
    toMessageListApi: toMessageListApi,
	toMessageDetailApi: toMessageDetailApi
  },
  getUnreadMessages: getUnreadMessages,
  getMessagesWithUserId: getMessagesWithUserId,
  createMessageWithUser: createMessageWithUser,
  getMessageDetails: getMessageDetails,
  deleteMessageDetail: deleteMessageDetail,
  sendNewsMessage: sendNewsMessage

};


function toMessageListApi() {
  var message = this.toObject();
  return {
    message: message.message,
    isRead: message.isRead,
    messageId: message.id,
    subject: message.subject,
	viewtype: message.viewtype,
	category: message.category,
	referralstatus: message.referralstatus,
    createdAt: moment(message.createdAt).fromNow()
  };

}

function toMessageDetailApi() {
  var message = this.toObject();

  //sails.log.info("toMessageListApi",message);
  if(message.partnerproduct)
  {
	  //sails.log.info("message.partnerproduct: ",message.partnerproduct);
	   return {
		message: message.message,
		isRead: message.isRead,
		messageId: message.id,
		subject: message.subject,
		viewtype: message.viewtype,
		category: message.category,
		referralstatus: message.referralstatus,
		refferalproduct: message.partnerproduct,
		createdAt: moment(message.createdAt).fromNow()
	  };
  }
  else
  {
	  return {
		message: message.message,
		isRead: message.isRead,
		messageId: message.id,
		subject: message.subject,
		viewtype: message.viewtype,
		category: message.category,
		referralstatus: message.referralstatus,
		createdAt: moment(message.createdAt).fromNow()
	  };
  }
}

function getUnreadMessages(id) {
  return Q.promise(function(resolve, reject) {

     User
      .findOne({
        id: id
      })
      .then(function(user) {

			var universityId = 	user.university;
			var userCreatedDate =user.createdAt;

			var criteria = {
			  //user: id,
			  //$or : [ { category : 'inbox' }, { category : 'user' ,user:id} ],
			  $or : [ { category : 'inbox', viewtype:'all' },{ category : 'inbox', viewtype:'user',user:id }, { category : 'user', user:id}, {category : 'inbox',viewtype:'university'} ],
			  isRead: false,
			  isDeleted: false,
			  createdAt: {'>=': userCreatedDate }
			};

    		Messages.find(criteria)
			  .then(function(number) {
				//sails.log.info('result data->',number);
				//sails.log.info('First initial->',number.length);

				var number = _.filter(number, function(msgObj) {
				  //sails.log.info('id value:',msgObj.id);

				  if( (msgObj.category=='user') || (msgObj.category=='inbox' && msgObj.viewtype=='all') || (msgObj.category=='inbox' && msgObj.viewtype=='user')  || (msgObj.category=='inbox' && msgObj.viewtype=='university' && universityId==msgObj.university ) )
				  {

					  if(!msgObj.isMultiRead)
					  {
						  //sails.log.info('invalid true loop');
						 return true;
					  }
					  else
					  {
							if(msgObj.isMultiRead.length==0)
							{
								//sails.log.info('true length loop');
								return true;
							}
							else
							{
								 if (msgObj.isMultiRead) {

									 userExist = 0;
									 _.forEach(msgObj.isMultiRead, function(userdata) {
										//sails.log.info('id vlaue->',id);
										//sails.log.info('userdata.userId vlaue->',userdata.userId);
										if (userdata.userId === id) {
											userExist=1;
										}
									 })
									 //sails.log.info('userExist value: ',userExist);
									 if(userExist==0)
									 {
										return true;
									 }
								  /*msgObj.isMultiRead.map(function(userdata) {
										sails.log.info('id vlaue->',id);
										sails.log.info('userdata.userId vlaue->',userdata.userId);
										if (userdata.userId === id) {
											sails.log.info('false loop');
											return false;
										}
										else
										{
											sails.log.info('true loop');
											return true;
										}
								  })*/
								}
							}
					  }
				   }
				   else
				   {
						return false;
				   }
				});
				//sails.log.info('final->',number.length);
				//sails.log.info('final->',number);
				return resolve(number.length);
			  })
			  .catch(function(err) {
				sails.log.error('Messages#getUnreadMessages :: err', err);
				return reject(err);
			  });
		});
  });
}

function getMessagesWithUserId(user, messageId) {
  return Q.promise(function(resolve, reject) {
    var criteria = {
      //user: user.id,
      id: messageId,
      isDeleted: false
    };

    Messages
      .findOne(criteria)
	  .populateAll()
      .then(function(message) {

		if(message.category=='inbox')
		{
			if (!message.isMultiRead) {
			  message.isMultiRead = [];
			}
			else
			{
				var filteredUsers = _.filter(message.isMultiRead, function(userObj) {
				  return userObj.userId === user.id;
				});

				if (filteredUsers.length == 0) {
					var readMessageData = {
									userId: user.id,
									timeStamp: new Date().getTime()
								  }
					message.isMultiRead.push(readMessageData)
				}
			}
		}
		else
		{
       	 	message.isRead = true
		}
          message.save(function(err) {
            if (err) {
              sails.log.error("Message#getMessageDetails :: Error :: ", err);
              return reject({
                code: 500,
                message: 'INTERNAL_SERVER_ERROR'
              });
            }
          });
        //return resolve(message.toMessageListApi());
		return resolve(message.toMessageDetailApi());
      })
      .catch(function(err) {
        sails.log.error('Messages#getMessagesWithUserId :: err', err);
        return reject(err);
      });
  });
}

function createMessageWithUser(messageObj) {
  return Q.promise(function(resolve, reject) {
    //console.log("Here is the messageObj",messageObj);
    var messageObject = {
      user: messageObj.user,
      message: messageObj.message,
      subject: messageObj.subject,
      referenceId: Utils.generateReferenceId()
    };

    Messages.create(messageObject)
      .then(function(message) {

			if(messageObj.messagetype=='approved')
			{
				//TODO: NEED TO UNCOMMENT BELOW CODE TO MAKE ACH LIVE
            	EmailService.sendLoanConfirmationEmail(messageObj.user);
			}

			if(messageObj.messagetype=='underprocess' || messageObj.messagetype=='queueprocess' )
			{
				//ADDED TO BYPASS LOAN WITHOUT ACH (NEED TO BLOCK ONCE ACH IS LIVE)
				EmailService.sendLoanProcessEmail(messageObj.user);
			}
            return resolve(message);


      })
      .catch(function(err) {
        sails.log.error('Messages#createMessageWIthUser :: err', err);
        return reject(err);
      });
  });
}

function getMessageDetails(messageObj) {
  return Q.promise(function(resolve, reject) {

     var userId = messageObj.user;
     User
      .findOne({
        id: userId
      })
      .then(function(user) {

			var userCreatedDate =user.createdAt;

			var universityid = 	user.university;
    	     /*sails.log.info('messageObj->',messageObj);
			 sails.log.info('universityid->',universityid);
			 sails.log.info('userCreatedDate->',userCreatedDate)*/

			var criteria = {
				$or : [ { category : 'inbox', viewtype:'all' }, { category : 'inbox', viewtype:'user',user:messageObj.user },  { category : 'user', user:messageObj.user}, {category : 'inbox',viewtype:'university'} ],
				isDeleted: false,
				createdAt: {'>=': userCreatedDate }
				//$gte: [createdAt : userCreatedDate]
			};
			Messages
			  .find(criteria)
			  .sort( { 'createdAt': -1 })
			  .then(function(messages) {
				if (!messages) {
				  return reject({
					code: 404,
					message: 'MESSAGE_NOT_FOUND'
				  });
				}
				var messageData = [];
				_.forEach(messages, function(message) {


				  var categorytype = 	message.category;
				  var viewtype = 	message.viewtype;
				  var msguniversityid = message.university;
				  if(categorytype=='inbox' && viewtype=='all'){

					  if (!message.isMultiDeleted) {
					  	messageData.push(message.toMessageListApi());
					  }
					  else
					  {
						    var filteredUsers = _.filter(message.isMultiDeleted, function(userObj) {
							  return userObj.userId === user.id;
							});

							if (filteredUsers.length == 0) {
								messageData.push(message.toMessageListApi());
							}
					  }
				  }else if(categorytype=='inbox' && viewtype=='user'){
					   messageData.push(message.toMessageListApi());
				  }else if(categorytype=='user'){
					  messageData.push(message.toMessageListApi());
				  }else if(categorytype=='inbox' && viewtype=='university'){
					  if(universityid==msguniversityid){

						  if (!message.isMultiDeleted) {
							messageData.push(message.toMessageListApi());
						  }
						  else
						  {
								var filteredUsers = _.filter(message.isMultiDeleted, function(userObj) {
								  return userObj.userId === user.id;
								});

								if (filteredUsers.length == 0) {
									messageData.push(message.toMessageListApi());
								}
						  }
						  //messageData.push(message.toMessageListApi());
					  }
				  }
				})

				return resolve(messageData);
			  })
			  .catch(function(err) {
				sails.log.error('Messages#getMessageDetails :: err', err);
				return reject(err);
			  });

		  });

	 })


}


function deleteMessageDetail(user,messageId){
  return Q.promise(function(resolve,reject){

	sails.log.info("delete inbox message: ",messageId);
	sails.log.info("userid: ",user.id);

    Messages
    .findOne({
      //user: user.id,
      id :messageId,
      //isDeleted : false
    })
    .then(function(messageData){
		if(messageData)
		{
			sails.log.info("category: ",messageData.category);
			sails.log.info("viewtype: ",messageData.viewtype);

			if(  (messageData.category=='inbox' && messageData.viewtype=='all')  || (messageData.category=='inbox' && messageData.viewtype=='university' ) )
			{
				sails.log.info("Enter if loop");
				var deleteMessageData = {
										userId: user.id,
										timeStamp: new Date().getTime()
									  }

				sails.log.info("deleteMessageData",deleteMessageData);
				if (!messageData.isMultiDeleted) {
				  messageData.isMultiDeleted = [];
				  messageData.isMultiDeleted.push(deleteMessageData);
				}
				else
				{
					var filteredUsers = _.filter(messageData.isMultiDeleted, function(userObj) {
					  return userObj.userId === user.id;
					});

					if (filteredUsers.length == 0) {
						messageData.isMultiDeleted.push(deleteMessageData);
					}
				}
			}
			else
			{
			  sails.log.info("Enter else loop");
		 	  messageData.isDeleted = true;
			}
		  messageData.save();
		}
      return resolve(messageData);
    })
    .catch(function(err){
      sails.log.error("#deleteMessageDetail::Error",err);
      return reject(err)
    })
  })
}

function sendNewsMessage(data){

	return Q.promise(function(resolve, reject) {

	   //sails.log.info("message data:",data);
	   if(data.referralstatus==1){

		    Partnerproduct
			  .findOne({id: data.partnerproduct})
			  .then(function(product) {

				var domainName = sails.config.getBaseUrl;
				//var referralLink = domainName + '/managereferral/' + data.userId + '/'+product.referralToken;
				//var mesgtxt = data.message+' Click below link to access the product. <br/><a href="'+referralLink+'" id="referrallink">'+product.redirecturl+'</a>';

				  var messageObject = {
					  user: data.userId,
					  message: data.message,
					  subject: data.subject,
					  category: data.category,
					  university: data.university,
					  viewtype: data.viewtype,
					  referenceId: Utils.generateReferenceId(),
					  referralstatus: data.referralstatus,
					  partnerproduct:data.partnerproduct
				  };
				  Messages.create(messageObject)
				  .then(function(message) {
					return resolve(message);
				  })
				  .catch(function(err) {
					sails.log.error('Messages#sendNewsMessage :: err :', err);
					return reject(err);
				  });

		   })
		  .catch(function(err) {
			sails.log.error('Messages#sendNewsMessage :: err :', err);
			return reject(err);
		  });


		}else{

			  var messageObject = {
				  user: data.userId,
				  message: data.message,
				  subject: data.subject,
				  category: data.category,
				  university: data.university,
				  viewtype: data.viewtype,
				  referenceId: Utils.generateReferenceId(),
				  referralstatus: data.referralstatus,
				  partnerproduct:data.partnerproduct
			  };
			  Messages.create(messageObject)
			  .then(function(message) {
				return resolve(message);
			  })
			  .catch(function(err) {
				sails.log.error('Messages#sendNewsMessage :: err :', err);
				return reject(err);
			  });

		}

  });

}

