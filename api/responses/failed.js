/* global module */
'use strict';
/**
 * 200 (Success, failed case) Handler
 *
 * Usage:
 * return res.failed();
 * return res.failed(data);
 * e.g.:
 * ```
 * return res.failed({
 name: [{
 errorCode: "USER_NAME_REQUIRED",
 message: "Name is required"
 }]
 * });
 * ```
 */

module.exports = function(data) {

  // Get access to `req`, `res`, & `sails`
  var req = this.req,
    res = this.res,
    sails = req._sails,
    defaultData = {
      validationError: [{
          errorCode: 'VALIDATION_ERROR',
          message: 'Invalid data'
        }]
    },
  statusCode = 422,
    envelope = {
      status: 'fail',
      data: defaultData
    };

  // Set status code
  res.status(statusCode);

  // Log error to console
  if (data !== undefined) {
    // add data to the envelope
    envelope.data = data;
    sails.log.verbose('@failed - Request processed successfully but validation error, data sent :: ', data);
  }
  else {
    // log to the console
    sails.log.verbose('@failed - Request processed successfully but validation error, but no data sent');
  }


  // If the user-agent wants JSON, always respond with JSON
  if (req.wantsJSON) {
    return res.jsonx(envelope);
  } else {
    return res.view('errorResponse', {message: 'Invalid Request'}, function (err, html) {
      if (err) {
        if (err.code === 'E_VIEW_FAILED') {
          sails.log.error('@failed :: Could not locate view for error page');
        }
        // Otherwise, if this was a more serious error, log to the console with the details.
        else {
          sails.log.error('@failed :: When attempting to render error page view, an error occured (sending JSON instead).  Details: ', err);
        }
        return res.jsonx(envelope);
      }
      return res.send(html);
    });
  }
};
