/* global sails, Logactivity */
/**
 * LogactivityController
 *
 * @description :: Server-side logic for managing logactivities
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var request = require('request'),
  moment = require('moment'),
  Q = require('q');

module.exports = {
	manageLogActivity: manageLogActivityAction,
	ajaxManageLogList: ajaxManageLogListAction,
	viewlogDetails: viewlogDetailsAction,
	communicationlog:communicationlogAction,
	ajaxcommunicationlog:ajaxcommunicationlogAction
};

function manageLogActivityAction(req, res) {
 res.view("admin/logs/managelogactivity");
}


/**
 * GET /admin/ajaxmanageloglist
 * @param {Request} req
 * @param {Response} res
 */
function ajaxManageLogListAction( req, res ) {
	let iDisplayLengthvalue = 0;
	let skiprecord = 0;
	let totalrecords = 0;
	const screenResdata = [];
	const whereConditionOr = [];
	let matchcriteria = {};
	const andCriteria = [
		{ isDeleted: false }
	];
	if( req.query.sSearch ) {
		whereConditionOr.push( { "userdata.userReference": { "$regex": req.query.sSearch, $options: "i" } } );
		whereConditionOr.push( { "logreference": { "$regex": req.query.sSearch, $options: "i" } } );
		whereConditionOr.push( { "email": { "$regex": req.query.sSearch, $options: "i" } } );
		whereConditionOr.push( { "modulename": { "$regex": req.query.sSearch, $options: "i" } } );
		whereConditionOr.push( { "logmessage": { "$regex": req.query.sSearch, $options: "i" } } );
		whereConditionOr.push( { "remoteaddr": { "$regex": req.query.sSearch, $options: "i" } } );
		whereConditionOr.push( { "createdAt": { "$regex": req.query.sSearch, $options: "i" } } );
		// -- for search filter for application type
		andCriteria.push( { $or: whereConditionOr } );
	}
	matchcriteria = { $and: andCriteria };
	Logactivity.native( function( err, collection ) {
		collection.aggregate( [
			{
				$lookup: {
					from: "paymentmanagement",
					localField: "paymentManagement",
					foreignField: "_id",
					as: "paymentdata"
				}
			},
			{
				$unwind: { path: "$paymentdata", preserveNullAndEmptyArrays: true }
			},
			{
				$lookup: {
					from: "user",
					localField: "paymentdata.user",
					foreignField: "_id",
					as: "userdata"
				}
			},
			{
				$unwind: { path: "$userdata", preserveNullAndEmptyArrays: true }
			},
			{
				$match: matchcriteria
			},
			{
				$count: "logactivitycount"
			}
		], function( err, result ) {
			if( err ) {
				return res.serverError( err );
			}
			iDisplayLengthvalue = parseInt( req.query.iDisplayLength );
			skiprecord = parseInt( req.query.iDisplayStart );
			if( typeof result === "undefined" || result.length == 0 ) {
				const json = {
					sEcho: req.query.sEcho,
					iTotalRecords: totalrecords,
					iTotalDisplayRecords: totalrecords,
					aaData: screenResdata
				};
				res.contentType( "application/json" );
				return res.json( json );
			}
			totalrecords = result[ 0 ].logactivitycount;
			const sortDir = ( req.query.sSortDir_0 == "desc" ? -1 : 1 );
			let sorttypevalue = { createdAt: sortDir };
			switch( req.query.iSortCol_0 ) {
				case "1": sorttypevalue = { "userdata.userReference": sortDir }; break;
				case "2": sorttypevalue = { "logReference": sortDir }; break;
				case "3": sorttypevalue = { "email": sortDir }; break;
				case "4": sorttypevalue = { "modulename": sortDir }; break;
				case "5": sorttypevalue = { "logmessage": sortDir }; break;
				case "6": sorttypevalue = { "remoteaddr": sortDir }; break;
				case "7": sorttypevalue = { "createdAt": sortDir }; break;
				default: break;
			}
			Logactivity.native( function( err, collection ) {
				collection.aggregate( [
					{
						$lookup: {
							from: "paymentmanagement",
							localField: "paymentManagement",
							foreignField: "_id",
							as: "paymentdata"
						}
					},
					{
						$unwind: { path: "$paymentdata", preserveNullAndEmptyArrays: true }
					},
					{
						$lookup: {
							from: "user",
							localField: "paymentdata.user",
							foreignField: "_id",
							as: "userdata"
						}
					},
					{
						$unwind: { path: "$userdata", preserveNullAndEmptyArrays: true }
					},
					{
						$match: matchcriteria
					},
					{ $sort: sorttypevalue },
					{ $skip: skiprecord },
					{ $limit: iDisplayLengthvalue }
				], function( err, logDetails ) {
					if( err ) {
						return res.serverError( err );
					}
					if( logDetails.length == 0 ) {
						const json = {
							sEcho: req.query.sEcho,
							iTotalRecords: totalrecords,
							iTotalDisplayRecords: totalrecords,
							aaData: screenResdata
						};
						res.contentType( "application/json" );
						return res.json( json );
					}
					// const arraylength = iDisplayLengthvalue + skiprecord;
					const arraylength = logDetails.length;
					// logDetails = logDetails.slice( skiprecord, arraylength );
					logDetails.forEach( function( logdata, loopvalue ) {
						const loopid = loopvalue + skiprecord + 1;
						let userreference = "--";
						let logreference = "--";
						let email = "--";
						let modulename = "--";
						let logmessage = "--";
						let remoteaddr = "--";
						let createdAt = "--";
						if( logdata.userdata ) {
							userreference = '<a href=\'viewUserDetails/' + logdata.userdata._id + '\'>' + logdata.userdata.userReference + '</a>';
						}
						if( logdata.logreference ) {
							logreference = logdata.logreference;
						}
						if( logdata.email ) {
							email = logdata.email;
						}
						if( logdata.modulename ) {
							modulename = logdata.modulename;
						}
						if( logdata.logmessage ) {
							logmessage = logdata.logmessage;
						}
						if( logdata.remoteaddr ) {
							remoteaddr = logdata.remoteaddr;
						}
						if( logdata.createdAt ) {
							createdAt = moment( logdata.createdAt ).tz( "america/los_angeles" ).format( "MM-DD-YYYY hh:mm:ss" );
						}
						const actiondata = '<a href="/admin/viewlogDetails/' + logdata.id + '"><i class="fa fa-eye" aria-hidden="true" style="cursor:pointer;color:#337ab7;"></i></a>';

						screenResdata.push( {
							loopid: loopid,
							userreference: userreference,
							logreference: logreference,
							email: email,
							modulename: modulename,
							logmessage: logmessage,
							remoteaddr: remoteaddr,
							createdAt: createdAt,
							actiondata: actiondata
						} );
					} );
					const json = {
						sEcho: req.query.sEcho,
						iTotalRecords: totalrecords,
						iTotalDisplayRecords: totalrecords,
						aaData: screenResdata
					};
					res.contentType( "application/json" );
					res.json( json );
				} );
			} );
		} );
	} );
}


// function ajaxManageLogListAction( req, res ) {
// 	// Sorting
// 	const colS = "";
// 	let sorttype = 1;
// 	let sorttypevalue = {};
// 	let criteria = { isDeleted: false };
// 	if( req.query.sSortDir_0 == "desc" ) {
// 		sorttype = -1;
// 	}
// 	switch( req.query.iSortCol_0 ) {
// 		case "1": sorttypevalue = { "userreference": sorttype }; break;
// 		case "2": sorttypevalue = { "logreference": sorttype }; break;
// 		case "3": sorttypevalue = { "email": sorttype }; break;
// 		case "4": sorttypevalue = { "modulename": sorttype }; break;
// 		case "5": sorttypevalue = { "logmessage": sorttype }; break;
// 		case "6": sorttypevalue = { "remoteaddr": sorttype }; break;
// 		case "7": sorttypevalue = { "createdAt": sorttype }; break;
// 		default: break;
// 	}

// 	// Search
// 	if( req.query.sSearch ) {
// 		criteria = {
// 			isDeleted: false,
// 			or: [ { userreference: { 'contains': req.query.sSearch } }, { logreference: { 'contains': req.query.sSearch }}, {email:  { 'contains': req.query.sSearch }}, {modulename:  { 'contains': req.query.sSearch }},{logmessage:  { 'contains': req.query.sSearch }},{remoteaddr:  { 'contains': req.query.sSearch }},{createdAt:  { 'contains': req.query.sSearch }} ]
// 		};
// 	}
// 	Logactivity.find( criteria )
// 	.sort( sorttypevalue )
// 	.populate( "paymentManagement" )
// 	.then( async function( logDetails ) {
// 		// Filter user details not available
// 		logDetails = _.filter( logDetails, function( item ) {
// 			if( item.email != "" && item.email != null ) {
// 				return true;
// 			}
// 		} );
// 		const totalrecords = logDetails.length;

// 		// Filter by limit records
// 		const skiprecord = parseInt( req.query.iDisplayStart );
// 		const checklimitrecords = skiprecord + parseInt( req.query.iDisplayLength );
// 		let iDisplayLengthvalue = parseInt( req.query.iDisplayLength ) + parseInt( skiprecord );
// 		if( checklimitrecords > totalrecords ) {
// 			iDisplayLengthvalue = parseInt( totalrecords );
// 		}

// 		logDetails = logDetails.slice( skiprecord, iDisplayLengthvalue );

// 		const logData = [];
// 		let loopvalue = 0;
// 		for( const loginfo of logDetails ) {
// 			const loopid = loopvalue + skiprecord + 1;
// 			loginfo.createdAt = moment( loginfo.createdAt ).tz( "america/los_angeles" ).format( 'MM-DD-YYYY hh:mm:ss' );
// 			let remoteaddr = '--';
// 			if( loginfo.remoteaddr != '' && loginfo.remoteaddr!=null ) {
// 				remoteaddr = loginfo.remoteaddr;
// 			}
// 			const actiondata = '<a href="/admin/viewlogDetails/' + loginfo.id + '"><i class="fa fa-eye" aria-hidden="true" style="cursor:pointer;color:#337ab7;"></i></a>';
// 			let userreference = '--';
// 			if( loginfo.paymentManagement != 'Empty' && loginfo.paymentManagement != '' && loginfo.paymentManagement != null && "undefined" !== typeof loginfo.paymentManagement ) {
// 				// const paymentmanagementDetails = await PaymentManagement.findOne( loginfo.paymentManagement ).populate( 'user' );
// 				// // userreference = paymentmanagementDetails.user.userReference;
// 				// userreference = '<a href=\'viewUserDetails/' + paymentmanagementDetails.user.id + '\'>' + paymentmanagementDetails.user.userReference + '</a>';
// 				// logData.push( { loopid: loopid, userreference: userreference, logreference: loginfo.logreference, email: loginfo.email, modulename: loginfo.modulename, logmessage: loginfo.logmessage, remoteaddr: remoteaddr, createdAt: loginfo.createdAt, actiondata: actiondata } );
// 				// sails.log.info( "userreference", userreference );
// 			} else {
// 				logData.push( { loopid: loopid, userreference: userreference, logreference: loginfo.logreference, email: loginfo.email, modulename: loginfo.modulename, logmessage: loginfo.logmessage, remoteaddr: remoteaddr, createdAt: loginfo.createdAt, actiondata: actiondata } );
// 				// sails.log.info( "loopid", loopid );
// 			}
// 			loopvalue++;
// 		}
// 		const json = {
// 			sEcho: req.query.sEcho,
// 			iTotalRecords: totalrecords,
// 			iTotalDisplayRecords: totalrecords,
// 			aaData: logData
// 		};
// 		// sails.log.info("json data", json);
// 		res.contentType( 'application/json' );
// 		res.json( json );
// 	} );
// }

function viewlogDetailsAction(req, res){

	var logId = req.param('id');

	var criteria = {
					  id: logId
					};

	Logactivity
    .findOne(criteria)
	.populate('adminuser')
	.then(function (logdata) {
		if(logdata.logdata)
		{
			logDetails =JSON.stringify(logdata.logdata, null, 4);
		}
		var rs = {
				  logdata: logdata,
				  logDetails:logDetails
			     };
		sails.log.info("logdata",rs)
		res.view("admin/logs/viewloginfo", rs);
	})
	.catch(function (err) {
	  sails.log.error('LogactivityController#viewlogDetailsAction :: err :', err);
      return res.handleError(err);
	});
}

function communicationlogAction(req, res) {
	res.view("admin/logs/communicationlog");
}

function ajaxcommunicationlogAction(req, res)
{
	sails.log.info("ajaxcommunicationlogAction");
	//Sorting
	var colS = "";

	if(req.query.sSortDir_0=='desc')
	{
		sorttype=-1;
	}
	else
	{
		sorttype=1;
	}
	switch(req.query.iSortCol_0){
		case '0':  var sorttypevalue = { '_id': sorttype }; break;
		case '1':  var sorttypevalue = { 'subject': sorttype }; break;
		case '2':  var sorttypevalue = { 'description': sorttype }; break;
		case '3':  var sorttypevalue = { 'logdata': sorttype }; break;
		case '4':  var sorttypevalue = { 'createdAt': sorttype }; break;
		default: break;
	};


	//Search
	if(req.query.sSearch)
	{
		var criteria = {
		  isDeleted: false,
		  or: [{subject:  { 'contains': req.query.sSearch }}, {description:  { 'contains': req.query.sSearch }}, {logdata:  { 'contains': req.query.sSearch }},{createdAt:  { 'contains': req.query.sSearch }}]
		};

	}
	else
	{
		var criteria = {
			isDeleted: false
    	};
	}


	Useractivity
    .find(criteria)
	.sort( sorttypevalue)
	.then(function(logDetails) {

		//Filter user details not available

		sails.log.info("logDetails",logDetails);


		totalrecords= logDetails.length;

		//Filter by limit records
		skiprecord =parseInt(req.query.iDisplayStart);
		checklimitrecords = skiprecord+parseInt(req.query.iDisplayLength);
		if(checklimitrecords>totalrecords)
		{
			iDisplayLengthvalue=parseInt(totalrecords);
		}
		else
		{
			iDisplayLengthvalue=parseInt(req.query.iDisplayLength)+parseInt(skiprecord);
		}

		logDetails= logDetails.slice(skiprecord, iDisplayLengthvalue);


		var logData = [];

		logDetails.forEach(function(loginfo,loopvalue){
			loopid = loopvalue+skiprecord+1;
			loginfo.createdAt = moment(loginfo.createdAt).tz("america/los_angeles").format('MM-DD-YYYY hh:mm:ss');

			logData.push({ loopid:loopid,subject:loginfo.subject,description: loginfo.description, logdata: loginfo.logdata,createdAt:loginfo.createdAt});


		});

		 sails.log.info("logData",logData);
		 var json = {
				sEcho:req.query.sEcho,
				iTotalRecords: totalrecords,
				iTotalDisplayRecords: totalrecords,
				aaData: logData
			};
		sails.log.info("json data", json);
		res.contentType('application/json');
		res.json(json);
	});

}