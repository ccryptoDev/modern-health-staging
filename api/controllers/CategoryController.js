/**
 * CategoryController
 *
 * @description :: Server-side logic for managing Categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var moment = require('moment');

var Q = require('q'),
ObjectId = require('mongodb').ObjectID,
_ = require('lodash');

//ObjectId = require('mongodb').ObjectID;

module.exports = {
  createCategoryList: createCategoryListAction,
  updateCategory: updateCategoryAction,
  getAllCategory: getAllCategoryAction,
  deleteCategoryList: deleteCategoryListAction,
  getCategory: getCategoryAction,
  showAll: showAllAction,
  createCategoryView: createCategoryViewAction,
  showOneCategory: showOneCategoryAction,
  UpdateCategoryView: UpdateCategoryViewAction,
  getDashboardView: getDashboardViewAction
};

function showAllAction(req, res) {
  Category
    .getAll()
    .then(function (categories) {
      console.log("here is the list of the categories",categories);
      var rs = {
        categories: categories
      };
      res.view("admin/category/categoryList", rs);
    })
    .catch(function (err) {
      var errors = err.message;
      req.flash("errors", errors);
      res.view("admin/category/categoryList", {
        errors: req.flash("errors")
      });
    });
}

function createCategoryListAction(req, res) {
  if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }

  Category
    .createCategory(req.form)
    .then(function (category) {
      return res.redirect("admin/category-list");
    })
    .catch(function (err) {
      return res.handleError(err);
    });
}

function updateCategoryAction(req, res) {
  Category
    .updateCategory(req.form)
    .then(function (category) {
      res.redirect("admin/category-list");
    })
    .catch(function (err) {
      return res.handleError(err);
    });
}


function getAllCategoryAction(req, res) {
  Category
    .getAllForCategory(req.form)
    .then(function (category) {
      return res.success(category);
    })
    .catch(function (err) {
      return res.handleError(err);
    });
}

function deleteCategoryListAction(req, res) {
  var id = req.param('id');
  Category
    .deleteCategory(id)
    .then(function () {
      res.redirect("admin/category-list");
    })
    .catch(function (err) {
      return res.handleError(err);
    });
}

function getCategoryAction(req, res) {
  var data = [];
  Category
    .getAllCategoryList()
    .then(function (categories) {
      _.forEach(categories, function (category) {
        data.push(category.toCategoryApi());
      });
      return res.success(data);
    })
    .catch(function (err) {
      return res.handleError(err);
    });
}

function createCategoryViewAction(req, res) {
  return res.view('admin/category/createCategory');
}

function showOneCategoryAction(req, res) {
  var id = req.param('id');
  console.log("id value: ", id);
  Category
    .getOneCategory(id)
    .then(function (category) {
      var rs = {
        category: category
      };
      res.view("admin/category/categoryDetail", rs);
    })
    .catch(function (err) {
      var errors = err.message;
      req.flash("errors", errors);
      res.view("admin/detail", {
        errors: req.flash("errors"),
        layout: 'layout'
      });
    });
}

function UpdateCategoryViewAction(req, res) {
  id = req.param('id');
  Category
    .findOne({
      id: id
    })
    .then(function (category) {
      return res.view('admin/category/updateCategory', {
        category: category
      });
    })
    .catch(function (err) {
      var errors = err.message;
      req.flash("errors", errors);
      res.view("admin/detail", {
        errors: req.flash("errors"),
        layout: 'layout'
      });
    });
}

function getDashboardViewAction(req, res) {

	var usercount=0;
	var pendingCount=0;
	var incompleteCount = 0;
	var completecount =0;
	var deniedcount=0;

	var usercriteria={};
	var pendingCriteria={};
	var incompleteScreenTrackingCriteria={};
	var fundedcriteria={};
	var deniedcriteria={};


	usercriteria = {
		$and: [ { email: { $ne: '' }  },
			{ email: { $ne: null }  },
			{ email: { $exists: true }  },
		],
		practicemanagement: req.session.adminpracticeID
	};

	pendingCriteria = {
		userdata : { $ne: [] } ,
		screenTrackingData: {$ne: []},
		"screenTrackingData.iscompleted": 1,
		achstatus: 0,
		status : 'PENDING' ,

		// isPaymentActive: true ,
		// $and :[
		// 	//{ $or : [ { loanSetdate : { $exists: false} } ,{ loanSetdate : { $gt : new Date(checktodaysDate), $exists: true } } ] },
		// 	{ $or : [ { firstpaymentcompleted : { $exists: false} } ,{ firstpaymentcompleted : { $eq : 0, $exists: true } } ] },
		// 	{ $or : [ { moveToArchive : { $exists: false} }, { moveToArchive:{ $eq: 0, $exists: true } }  ] }
		// ],
		practicemanagement: new ObjectId(req.session.adminpracticeID),
	};


	incompleteScreenTrackingCriteria = {
		moveToArchive:{$ne:1},
		$and : [
			{ $or: [{ paymentdata: { $eq: [] }, iscompleted: 0 }, { paymentdata: { $ne: [] }, "paymentdata.achstatus": 4 }] },
			{ $or: [{ blockedList: { $eq: false, $exists: true } }, { blockedList: { $exists: false } }] },
			{ moveToArchive: { $ne: 1 } }
		],
		practicemanagement: new ObjectId(req.session.adminpracticeID),
	};

	fundedcriteria= {
		userdata : { $ne: [] } ,
		achstatus: { $eq: 1, $exists: true } ,
		status : 'OPENED' ,
		isPaymentActive: true ,
		practicemanagement: new ObjectId(req.session.adminpracticeID),
		$and :[
			//{ $or : [ { loanSetdate : { $exists: false} } ,{ loanSetdate : { $gt : new Date(checktodaysDate), $exists: true } } ] },
			{ $or : [ { firstpaymentcompleted : { $exists: false} } ,{ firstpaymentcompleted : { $eq : 0, $exists: true } } ] },
			{ $or : [ { moveToArchive : { $exists: false} }, { moveToArchive:{ $eq: 0, $exists: true } }  ] }
		]
	}

	deniedcriteria = {
		$and: [
			{ userdata : { $ne: [] } },
			{ achstatus: { $eq: 2, $exists: true } },
			{ $or : [ { status : 'OPENED' }, { status : 'DENIED' } ] },
		],
		practicemanagement: new ObjectId(req.session.adminpracticeID),
	};


	if(!req.session.adminpracticeID) {
		delete usercriteria.practicemanagement;
		delete pendingCriteria.practicemanagement;
		delete incompleteScreenTrackingCriteria.practicemanagement;
		delete fundedcriteria.practicemanagement;
		delete deniedcriteria.practicemanagement;
	}

	User.count(usercriteria).exec(function countCB(error, usercount) {


		PaymentManagement.native(function(err, collection) {

		  collection.aggregate(
		  [
			{
				$lookup: {
					from: "user",
					localField: "user",
					foreignField: "_id",
					as: "userdata"
				}
			},
			{
				$unwind: "$userdata"
			},
			  {
				  $lookup: {
					  from: "screentracking",
					  localField: "screentracking",
					  foreignField: "_id",
					  as: "screenTrackingData"
				  }
			  },
			{
				$match: pendingCriteria
			},
			{
				$count: "pendingResultCount"
			}
		  ],
		  function(err,pendingResultCount) {


			if (err)
			{
				return res.serverError(err);
			}

			 if (typeof pendingResultCount !== 'undefined' && pendingResultCount.length > 0)
			 {
			   pendingCount = pendingResultCount[0].pendingResultCount;
			 }

			PaymentManagement.native(function(err, collection) {

				collection.aggregate(
					[
						{
							$lookup: {
								from: "user",
								localField: "user",
								foreignField: "_id",
								as: "userdata"
							}
						},

						{
							$match: deniedcriteria
						},
						{
							$count: "deniedcount"
						}
					],
					function(err,deniedresult) {
						 if (err)
						 {
							return res.serverError(err);
						 }

						 if (typeof deniedresult !== 'undefined' && deniedresult.length > 0)
						 {
						   deniedcount = deniedresult[0].deniedcount;
						 }

						 PaymentManagement.native(function(err, collection) {

							collection.aggregate(
								[
									{
										$lookup: {
											from: "user",
											localField: "user",
											foreignField: "_id",
											as: "userdata"
										}
									},
									{
										$match: fundedcriteria
									},
									{
										$count: "fundedcount"
									}
								],
								function(err,fundedresult) {
									 if (err)
									 {
										return res.serverError(err);
									 }

									 if (typeof fundedresult !== 'undefined' && fundedresult.length > 0)
									 {
									   completecount = fundedresult[0].fundedcount;
									 }

									Screentracking.native(function(err, collection) {

										collection.aggregate(
											[
												{
													$lookup: {
														from: "user",
														localField: "user",
														foreignField: "_id",
														as: "userdata"
													}
												},
												{
													$unwind: "$userdata"
												},
												{
													$lookup: {
														from: "paymentmanagement",
														localField: "_id",
														foreignField: "screentracking",
														as: "paymentdata"
													}
												},
												{
													$match: incompleteScreenTrackingCriteria
												},
												{
													$count: "screentrackingcount"
												}
											],
											function (err, screenTrackingResults) {

												sails.log.info("screen tracking result: ", screenTrackingResults);

												if (err) {
													return res.serverError(err);
												}
												if (typeof screenTrackingResults !== 'undefined' && screenTrackingResults.length > 0) {
													incompleteCount = screenTrackingResults[0].screentrackingcount;
												}

												var responsedata = {
													usercount: usercount,
													pendingCount: pendingCount,
													incompleteCount: incompleteCount,
													completecount:completecount,
													deniedcount: deniedcount
												}

												return res.view('admin/dashboard',responsedata);

											});
									});

							  });
						 });
					});
				});
		    });
		 });
	});
}
