/* global module */
'use strict';
/**
* 405 (Method Not Allowed) Handler
*
* Usage:
* return res.methodNotAllowed();
* return res.methodNotAllowed(message);
*
* e.g.:
* ```
* return res.methodNotAllowed('Access denied.');
* ```
*/

module.exports = function(message) {

// Get access to `req`, `res`, & `sails`
var req = this.req,
res = this.res,
statusCode = 405,
sails = req._sails,
defaultMessage = 'This requested method is not allowed',
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
sails.log.error('@methodNotAllowed - Client Error - ', message);
}
else {
// add message to the envelope
envelope.error['message'] = defaultMessage;
sails.log.error('@methodNotAllowed - Client Error - No Message');
}

// If the user-agent wants JSON, always respond with JSON
if (req.wantsJSON) {
return res.jsonx(envelope);
} else {
return res.view('errorResponse', {message: message}, function (err, html) {
if (err) {
if (err.code === 'E_VIEW_FAILED') {
sails.log.error('@methodNotAllowed :: Could not locate view for error page');
}
// Otherwise, if this was a more serious error, log to the console with the details.
else {
sails.log.error('@methodNotAllowed :: When attempting to render error page view, an error occured (sending JSON instead).  Details: ', err);
}
return res.jsonx(envelope);
}
return res.send(html);
});
}

};
