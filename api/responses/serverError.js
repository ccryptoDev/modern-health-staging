'use strict';
/**
* 500 (Server Error) Response
*
* Usage:
* return res.serverError();
* return res.serverError(err);
*
* NOTE:
* If something throws in a policy or controller, or an internal
* error is encountered, Sails will call `res.serverError()`
* automatically.
*/

module.exports = function(message) {

  // Get access to `req`, `res`, & `sails`
  var req = this.req,
  res = this.res,
  statusCode = 500,
  sails = req._sails,
  defaultMessage = 'Uncaught error, please try later',
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
    sails.log.error('@serverError - Server Error - ', message);
  }
  else {
    // add message to the envelope
    envelope.error['message'] = defaultMessage;
    sails.log.error('@serverError - Server Error - No Message');
  }

  // If the user-agent wants JSON, always respond with JSON
  if (req.wantsJSON) {
    return res.jsonx(envelope);
  } else {
    return res.view('errorResponse', {message: message}, function (err, html) {
      if (err) {
        if (err.code === 'E_VIEW_FAILED') {
          sails.log.error('@serverError :: Could not locate view for error page');
        }
        // Otherwise, if this was a more serious error, log to the console with the details.
        else {
          sails.log.error('@serverError :: When attempting to render error page view, an error occured (sending JSON instead).  Details: ', err);
        }
        return res.jsonx(envelope);
      }
      return res.send(html);
    });
  }
};
