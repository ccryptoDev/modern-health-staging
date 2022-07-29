/* global module */
'use strict';
/**
 * Handle Error - Handle dynamic errors for the models
 *
 * Usage:
 * return res.handleError();
 * return res.serverError(err);
 *
 *
 * NOTE:
 * If something throws in a policy or controller, or an internal
 * error is encountered, Sails will call `res.serverError()`
 * automatically.
 */

var _ = require('lodash'),
  conf = sails.config,
  codeMappings = {
    200: 'success',
    422: 'failed',
    400: 'badRequest',
    403: 'forbidden',
    405: 'methodNotAllowed',
    404: 'notFound',
    500: 'serverError',
    401: 'unauthorized',
    415: 'unsupportedMedia'
  };

/**
 * Error Object (err)
 * {
 *  errorCode: xxx,
 *  message: ERROR_CODE
 * }
 */
module.exports = function(err) {

  // take the error code and get the handler name from mapping
  var req = this.req,
    res = this.res,
    sails = req._sails,
    code = err.code,
    message = err.message,
    handler = getHandlerForCode(code),
    payload = null;

  // sanitize the input
  if (!err && (!err.code || !err.message)) {
    //force send server error w/o res object
    // send server error
    return res[getServerErrorHandler()]();
  }

  // if validation error; get payload from validation service (422)
  //
  // No probable chances of 200 error; if 200 log as error and send internal
  switch (code) {
    case 422:
      payload = ValidationService.getValidationErrors(message);
      break;
    case 200:
      sails.log.error('@handleError :: Unexpected 200 error :: ', err);
      return res[getServerErrorHandler()]();
    default:
      payload = ErrorMessages.mappings[message] ? ErrorMessages.mappings[message] : 'Uncaught Error';
      break;
  }

  return res[handler](payload);
};

/**
 * Finds the correct handler for the status code
 * @param {integer} code
 * @returns
 */
function getHandlerForCode(code) {

  return codeMappings[code];
}

/**
 * Gets the server error handler
 *
 * @returns {codeMappings}
 */
function getServerErrorHandler() {
  return codeMappings[500];
}
