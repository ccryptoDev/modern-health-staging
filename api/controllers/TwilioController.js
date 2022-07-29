/**
 * Twilio Controller
 *
 * @description :: Server-side logic for managing Ach details
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/


module.exports = {
	startverification: startverification,
	validate: validate
};


function startverification( req, res ) {
	if( ! req.isSocket ) {
		return res.badRequest();
	}

	var socketId = sails.sockets.getId( req );
	sails.log.verbose( "startVerification socketId:", socketId );
	const phoneString = req.body? req.body.phoneNumber: "";


	 TwilioService.startPhoneVerification( phoneString )
	.then( ( results ) => {
		sails.sockets.broadcast(socketId,"startVerification", results);

	} ).catch((errorObj) => {

		 if(errorObj) {
			 errorObj["errorMessage"] = errorObj.message;
		 }
		 sails.sockets.broadcast(socketId,"startVerification", errorObj);
		});

	 res.json( { success: true, socketId: socketId } );
}


function validate( req, res ) {
	if( ! req.isSocket ) {
		return res.badRequest();
	}
	var socketId = sails.sockets.getId( req );
	sails.log.verbose( "validate socketId:", socketId );

	const body = req.body;
	if(!body || !body.phoneNumber || !body.verificationCode) {
		sails.sockets.broadcast(socketId,"verifyPhoneCode", { errorMessage: "Missing verification code or phone number" , code: 400});
	}else {

		TwilioService.verifyCode( body.verificationCode, body.phoneNumber )
			.then( ( results ) => {
				sails.sockets.broadcast(socketId,"verifyPhoneCode", results);
			} ).catch((errorObj) => {
				if(errorObj) {
					errorObj["errorMessage"] = errorObj.message;
				}
			sails.sockets.broadcast(socketId,"verifyPhoneCode", errorObj);
		});
	}
	return res.json( { success: true, socketId: socketId } );
}
