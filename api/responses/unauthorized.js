/* global module */
'use strict';
/**
 * 401 (Unauthorized) Handler
 *
 * Usage:
 * return res.unauthorized();
 * return res.unauthorized(message);
 *
 * e.g.:
 * ```
 * return res.unauthorized(
 *   'Not allowed'
 * );
 * ```
 */

module.exports = function(message) {

  // Get access to `req`, `res`, & `sails`
  var req = this.req,
    res = this.res,
    sails = req._sails,
    defaultMessage = 'Unauthorized Request',
    envelope = {
      status: 'error',
      error: {
        errorCode: 401
      }
    };

  // Set status code
  res.status(401);

  // Log error to console
  if (message !== undefined) {
    // add message to the envelope
    envelope.error['message'] = message;
    // log to the console
    sails.log.error('@unauthorized - Client Error - ', message);
  }
  else {
    // add message to the envelope
    envelope.error['message'] = defaultMessage;
    sails.log.error('@unauthorized - Client Error - No Message');
  }


  // If the user-agent wants JSON, always respond with JSON
  if (req.wantsJSON) {
    return res.jsonx(envelope);
  } else {
    return res.view('errorResponse', {message: message}, function (err, html) {
      if (err) {
        if (err.code === 'E_VIEW_FAILED') {
          sails.log.error('@unauthorized :: Could not locate view for error page');
        }
        // Otherwise, if this was a more serious error, log to the console with the details.
        else {
          sails.log.error('@unauthorized :: When attempting to render error page view, an error occured (sending JSON instead).  Details: ', err);
        }
        return res.jsonx(envelope);
      }
      return res.send(html);
    });
  }

};
