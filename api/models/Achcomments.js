/**
 * Achcomments.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var Q = require('q'),
   moment = require('moment');

module.exports = {

  attributes: {
	subject: {
      type: "string"
    },
	description: {
      type: "string"
    },
	paymentManagement: {
      model: 'PaymentManagement'
    },

/*	screentracking: {
      model: 'Screentracking'
    },*/
	user: {
      model: 'User'
    },
	status: {
      type: 'integer',
      defaultsTo: 1
    },
	achreference: {
      type: "string",
	   defaultsTo: ''
    },
	acherrorstatus: {
      type: "integer",
	   defaultsTo: 0
    },
  },
  createAchComments: createAchComments,
  createAchErrorComments:createAchErrorComments,
  createAchCommentsForAllusers:createAchCommentsForAllusers,
  createScreentrackingComments: createScreentrackingComments
};


function createAchComments(data,payID,email) {
  return Q.promise(function(resolve, reject) {
	PaymentManagement.findOne({id: payID})
	.then(function(paydata){
		//sails.log.info('adminemail',email);
		//sails.log.info('paydata',paydata);
		 data.user = paydata.user;
		 data.paymentManagement=payID;
		 data.adminemail = email;

		  Achcomments.create(data)
		  .then(function(university) {
			return resolve(university);
		  })
		  .catch(function(err) {
			sails.log.error('Achcomments#createAchComments :: err :', err);
			return reject(err);
		  });

	  });
  });
}
function createAchErrorComments(data) {
  return Q.promise(function(resolve, reject) {

	 Achcomments.create(data)
	  .then(function(achlogdata) {
		return resolve(achlogdata);
	  })
	  .catch(function(err) {
		sails.log.error('Achcomments#createAchErrorComments :: err :', err);
		return reject(err);
	  });

  });
}


function createAchCommentsForAllusers(data) {

  return Q.promise(function(resolve, reject) {

			var userId = data.userId;
			var subject = data.subject;
			var comments = data.comments;
			var adminemail = data.adminemail;
			var screen_id = data.screen_id;
		Achcomments.create({subject:subject,comments:comments,user:userId,adminemail:adminemail,/*screentracking:screen_id,*/paymentManagement:''})
		  .then(function(university) {
			return resolve(university);
		  })
		  .catch(function(err) {
			sails.log.error('Achcomments#createAchComments :: err :', err);
			return reject(err);
		  });

  });
}

function createScreentrackingComments(commentsdata,email) {
  return Q.promise(function(resolve, reject) {

		  //data.user = UserID;
		  sails.log.info('commentsdata',commentsdata);
     Screentracking.findOne({id: commentsdata.screentrackingID})
	 .then(function(screentrackData){

		  sails.log.info("data:",screentrackData.user);

		  commentsdata.user = screentrackData.user;
		  commentsdata.adminemail = email;

		  Achcomments.create(commentsdata)
		  .then(function(trackingcomments) {
			return resolve(trackingcomments);
		  })
		  .catch(function(err) {
			sails.log.error('ScreentrackingComments#createAchComments :: err :', err);
			return reject(err);
		  });
     });

  });
}