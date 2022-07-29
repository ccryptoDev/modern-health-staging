/* global module */
'use strict';
/**
 * 404 (Not Found) Handler
 *
 * Usage:
 * return res.notFound();
 * return res.notFound(message);
 *
 * e.g.:
 * ```
 * return res.notFound();
 * ```
 *
 * NOTE:
 * If a request doesn't match any explicit routes (i.e. `config/routes.js`)
 * or route blueprints (i.e. "shadow routes", Sails will call `res.notFound()`
 * automatically.
 */

module.exports = function(message) {

  // Get access to `req`, `res`, & `sails`
  var req = this.req,
    res = this.res,
    statusCode = 404,
    sails = req._sails,
    defaultMessage = 'The requested URI not found',
    envelope = {
      status: 'error',
      error: {
        errorCode: statusCode
      }
    };

  // Set status code
  res.status(statusCode);

  // Log error to console
  if (message !== undefined) {
    // add message to the envelope
    envelope.error['message'] = message;
    // log to the console
    sails.log.error('@notFound :: Client Error - ', message);
  }
  else {
    // add message to the envelope
    envelope.error['message'] = defaultMessage;
    sails.log.error('@notFound :: Client Error - No Message');
  }

  // If the user-agent wants JSON, always respond with JSON
  if (req.wantsJSON) {	
    return res.jsonx(envelope);
  } else {
    return res.view('errorResponse', {message: defaultMessage}, function (err, html) {
      if (err) {
        if (err.code === 'E_VIEW_FAILED') {
          sails.log.error('@notFound :: Could not locate view for error page');
        }
        // Otherwise, if this was a more serious error, log to the console with the details.
        else {
          sails.log.error('@notFound :: When attempting to render error page view, an error occured (sending JSON instead).  Details: ', err);
        }
        return res.jsonx(envelope);
      }
      return res.send(html);
    });
  }
};
