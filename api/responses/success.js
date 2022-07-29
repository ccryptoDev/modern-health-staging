/* global module */
'use strict';
/**
 * 200 (Success) Handler
 *
 * Usage:
 * return res.success();
 * return res.success(data);
 * e.g.:
 * ```
 * return res.success({
 *   id: 1,
 *   name: "John"
 * });
 * ```
 */

module.exports = function(data) {

  // Get access to `req`, `res`, & `sails`
  var req = this.req,
    res = this.res,
    sails = req._sails,
    defaultData = 'Ok',
    statusCode = 200,
    envelope = {
      status: 'success',
      data: defaultData
    };

  // Set status code
  res.status(statusCode);

  // Log error to console
  if (data !== undefined) {
    // add data to the envelope
    envelope.data = data;
    // log to the console
    // sails.log.verbose('@success - Request processed successfully, data sent :: ', data);
  }
  else {
    // sails.log.verbose('@success - Request processed successfully, but no data sent');
  }


  // If the user-agent wants JSON, always respond with JSON
  if (req.wantsJSON) {
    return res.jsonx(envelope);
  } else {
    return res.view('errorResponse', {message: 'Invalid Request'}, function (err, html) {
      if (err) {
        if (err.code === 'E_VIEW_FAILED') {
          sails.log.error('@success :: Could not locate view for error page');
        }
        // Otherwise, if this was a more serious error, log to the console with the details.
        else {
          sails.log.error('@success :: When attempting to render error page view, an error occured (sending JSON instead).  Details: ', err);
        }
        return res.jsonx(envelope);
      }
      return res.send(html);
    });
  }
};
