var _ = require('lodash'),
  conf = sails.config,
  pagination = conf.pagination;

// policies/setCreatorPagination.js
module.exports = function setCreatorPagination(req, res, next) {
  // check if the request has nextrecord param.
  // if next record - validate and convert it to pagination config
  // else set to 0
  var nextRecord,
    skip,
    limit;
  // === Is of value and type  IS NOT A number
  // nextRecord = req.param('nextRecord');
  nextRecord = parseInt(req.param('nextRecord'), 10);

  console.log("here is the nextRecord", nextRecord);
  if (isNaN(nextRecord) || nextRecord === 0) {
    console.log("it shouldnot come here by any cause here");
    nextRecord = 0;
  }
  //TODO:need to remove
  skip = nextRecord;


  limit = pagination.PAGINATION_LIMIT;
  if (isNaN(pagination.PAGINATION_LIMIT)) {
    limit = 10;
  }

  req.paginationConfig = {
    limit: limit,
    skip: skip
  };

  next();
};
