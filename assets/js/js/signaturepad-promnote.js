document.addEventListener( "DOMContentLoaded", function() {
	var $ = window.$ = jQuery.noConflict();

	// initSigPads();
	$( "#esignature" ).on( "submit", function( event ) {
		// if( $( "#issignedArbitration" ).val() != "1" || ( document.getElementById( "eft_consent" ) && document.getElementById( "eft_consent" ).checked == false ) || $( "#issignedRIC" ).val() != "1" ) {
		if( $( "#issignedArbitration" ).val() != "1" || $( "#issignedRIC" ).val() != "1" || $( "#issignedEFT" ).val() != "1" ) {
			if( $( "#issignedRIC" ).val() == "0" ) {
				$( "#signerrorRIC" ).show();
				$( "#sigpad1" )[ 0 ].scrollIntoView();
			}
			if( $( "#issignedEFT" ).val() == "0" ) {
				$( "#signerrorEFT" ).show();
				$( "#sigpad3" )[ 0 ].scrollIntoView();
			}
			if( $( "#issignedArbitration" ).val() == "0" ) {
				$( "#signerror" ).show();
			}
			event.preventDefault ? event.preventDefault() : event.returnValue = false;
			return false;
		}
		$( "#loaderidpromissorynote" ).show();
		return true;
	} );

	$( "body" ).on( "hidden.bs.modal", function() {
		if( $( ".modal.show" ).length > 0 ) {
			$( "body" ).addClass( "modal-open" );
		}
	} );
} );

function validatePrereqs() {
	var satisfied = true;

	if( $( "#issignedArbitration" ).val() != "1" ) {
		satisfied = false;
		console.log( "lacking arbitration signature" );
	}

	if( $( "#issignedRIC" ).val() != "1" ) {
		satisfied = false;
		console.log( "lacking RIC signature" );
	}

	if( $( "#issignedEFT" ).val() != "1" ) {
		satisfied = false;
		console.log( "lacking EFT signature" );
	}

	return satisfied;
}

function enableFinalizeButton() {
	$( "#save" ).removeClass( "disabledFinalizeBtn" );
	$( "#save" ).addClass( "finalizeBtn" );
}

function disableFinalizeButton() {
	$( "#save" ).removeClass( "finalizeBtn" );
	$( "#save" ).addClass( "disabledFinalizeBtn" );
}

function initSigPads() {
	function getCanvas( canvasId ) {
		var wrapper = document.getElementById( canvasId );
		if( wrapper == null ) { return null; }
		return wrapper.querySelector( "canvas" );
	}

	window.onresize = function onResize() {
		resizeCanvas1();
		resizeCanvas2();
		resizeCanvas3();
	};

	var wrapper = document.getElementById( "signature-pad-arbitration" ) || document.getElementById( "signature-pad-RIC" ) || document.getElementById( "signature-pad-EFT" );
	if( wrapper == null ) {
		return null;
	}
	/************* Arbitration Signature Start **************/
	// var acceptSignature = document.getElementById( "acceptSignature" );
	// var clearSignature = document.getElementById( "clearSignature" );
	var canvas = wrapper.querySelector( "canvas" );
	var signaturePad = new SignaturePad( canvas, {
		// needed for jpeg
		// backgroundColor: 'rgb(255, 255, 255)'
	});

	// Adjust canvas coordinate space taking into account pixel ratio,
	// to make it look crisp on mobile devices.
	function resizeCanvas1() {
		// When zoomed out to less than 100%, for some very strange reason,
		// some browsers report devicePixelRatio as less than 1
		// and only part of the canvas is cleared then.
		var ratio =  Math.max(window.devicePixelRatio || 1, 1);

		// This part causes the canvas to be cleared
		var canvas = getCanvas( "signature-pad-arbitration" );
		console.log( "canvas", canvas );
		if( canvas ) {
			canvas.width = canvas.offsetWidth * ratio;
			canvas.height = canvas.offsetHeight * ratio;
			canvas.getContext("2d").scale(ratio, ratio);
		}

		signaturePad.clear();
	}

	// On mobile devices it might make more sense to listen to orientation change,
	// rather than window resize events.
	// window.onresize = resizeCanvas1;
	resizeCanvas1();

	$( "#acceptSignatureArbitration" ).off().on( "click", function( event ) {
		var data = signaturePad.toDataURL( "image/png" );
		var checkCanvasEmpty = $( "#checkCanvasEmpty" ).val();
		var hiddensignatureid = $( "#hiddensignatureid" ).val();

		if( signaturePad.isEmpty() && checkCanvasEmpty != 1 ) {
			$( "#nosignError" ).show();
			//$('#drawmodal').modal('show');
			return false;
		}
		$( "#acceptSignatureArbitration" ).attr("disabled", true);
		$( "#clearSignature" ).attr("disabled", true);
		$.ajax({
			type: "POST",
			url: "/saveSignature?hiddensignatureid="+hiddensignatureid,
			data: { imgBase64: data, esignatureType: 2 },
			dataType:'json',
			beforeSend: function() {
				$( "#save_signature_loading" ).css( "display", "block" );
			}
			,complete:function() { }
			,success:function(res) {
				$( "#save_signature_loading" ).css( "display", "none" );
				$( "#signInstructions" ).css( "display", "none" );
				// $('#save_signature_loading').html('');
				$( "#acceptSignatureArbitration" ).attr( "disabled", false );
				$( "#clearSignature" ).attr( "disabled", false );
				// console.log( "res.status", res.status, res.agreementsignpath );
				if( res.status==200 ) {
					var signatureid = res.signatureid
					// $("#issigned").val(1);
					$( "#signerror" ).hide();
					$( "#issignedArbitration" ).val( 1 );
					$( '#hiddensignatureid' ).val( signatureid );
					$( '#signature-pad-arbitration' ).hide();
					$( '#stamp-arbitration' ).html( '<img class="img-responsive" style="width: 100%;" src="'+res.agreementsignpath+'">' );
					// $('#stamp').css( "padding","0 18px" );
					// $('#stamp').css( "border-bottom","1px solid black" );
					$( "#stamp-arbitration-date" ).html( moment().format( "MM/DD/YYYY" ) );
					// $('#stamp-date').css( "padding", "0 18px" );
					// $('#stamp-date').css( "border-bottom", "1px solid black" );
					// location.reload();
					if( validatePrereqs() ) {
						enableFinalizeButton();
					}
				} else {
					$( "#signatureError" ).html( "Error: Please draw signature again." );
					// $('#drawmodal').modal('show');
				}
			}
		});
		return false;
	});

	$( "#clearSignature" ).off().on( "click", function( event ) {
		signaturePad.clear();
		$( "#nosignError" ).hide();
		$( "#checkCanvasEmpty" ).val( 0 );
	});
	/************* Arbitration Signature End **************/
	var wrapper = document.getElementById( "signature-pad-RIC" ) || document.getElementById( "signature-pad-EFT" );
	if( wrapper == null ) { return; }
	/************* RIC Signature Start **************/
	var canvas = wrapper.querySelector( "canvas" );
	var signaturePadRIC = new SignaturePad( canvas, {
		//needed for jpeg
		//backgroundColor: 'rgb(255, 255, 255)'
	});

	// Adjust canvas coordinate space taking into account pixel ratio,
	// to make it look crisp on mobile devices.
	function resizeCanvas2() {
		// When zoomed out to less than 100%, for some very strange reason,
		// some browsers report devicePixelRatio as less than 1
		// and only part of the canvas is cleared then.
		var ratio =  Math.max(window.devicePixelRatio || 1, 1);

		// This part causes the canvas to be cleared
		var canvas = getCanvas( "signature-pad-RIC" );
		if( canvas ) {
			canvas.width = canvas.offsetWidth * ratio;
			canvas.height = canvas.offsetHeight * ratio;
			canvas.getContext("2d").scale(ratio, ratio);
		}

		signaturePadRIC.clear();
	}

	// On mobile devices it might make more sense to listen to orientation change,
	// rather than window resize events.
	resizeCanvas2();

	$( "#acceptSignatureRIC" ).off().on( "click", function( event ) {
		var data = signaturePadRIC.toDataURL( 'image/png' );
		var checkCanvasEmptyRIC = $( "#checkCanvasEmptyRIC" ).val();
		var hiddensignatureidRIC = $( "#hiddensignatureidRIC" ).val();
		console.log( "signaturePadRIC.isEmpty()", signaturePadRIC.isEmpty() );
		console.log( "checkCanvasEmptyRIC", checkCanvasEmptyRIC );
		if( signaturePadRIC.isEmpty() && checkCanvasEmptyRIC != 1 ) {
			$( "#nosignErrorRICText" ).html( "" );
			$( "#nosignErrorRICText" ).html( "Please sign the signature pad." );
			$( "#nosignErrorRIC" ).show();
			return false;
		}
		$( "#acceptSignatureRIC" ).attr( "disabled", true );
		$( "#clearSignatureRIC" ).attr( "disabled", true );
		$.ajax({
			type: "POST",
			url: "/saveSignature?hiddensignatureid="+hiddensignatureidRIC,
			data: { imgBase64: data, esignatureType: 1 },
			dataType: "json",
			beforeSend: function() {
				$ ("#save_signature_loading" ).css( "display", "block" );
			}
			,complete:function() { }
			,success:function( res ) {
				$("#save_signature_loading").css("display","none");
				$("#signInstructionsRIC").css("display","none");
				$("#acceptSignatureRIC").attr("disabled", false);
				$("#clearSignatureRIC").attr("disabled", false);
				if( res.status==200 ) {
					var signatureIdRIC = res.signatureid;
					$("#signerrorRIC").hide();
					$("#issignedRIC").val( 1 );
					$('#hiddensignatureidRIC').val( signatureIdRIC );
					$('#signature-pad-RIC').hide();
					$('#stamp-hc').html( '<img class="img-responsive" style="width: 100%;" src="'+res.agreementsignpath+'">' );
					$("#stamp-hc-date").html( moment().format( "MM/DD/YYYY" ) );

					if( validatePrereqs() ) {
						enableFinalizeButton();
					}
				} else {
					$( "#nosignErrorRIC" ).html( "Please sign the signature pad." );
					$( "#nosignErrorRIC" ).show();
				}
			}
		});
		return false;
	});

	$( "#clearSignatureRIC" ).off().on( "click", function( event ) {
		signaturePadRIC.clear();
		console.log( "clearing canvas: high cost" );
		$( "#nosignErrorRIC" ).hide();
		$( "#checkCanvasEmptyRIC" ).val( 0 );
	} );
	/************* RIC Signature End **************/

	var wrapper = document.getElementById( "signature-pad-EFT" );
	if( wrapper == null ) { return; }
	/************* EFT Signature Start **************/
	var canvas = wrapper.querySelector( "canvas" );
	var signaturePadEFT = new SignaturePad( canvas, {
		//needed for jpeg
		//backgroundColor: 'rgb(255, 255, 255)'
	});

	// Adjust canvas coordinate space taking into account pixel ratio,
	// to make it look crisp on mobile devices.
	function resizeCanvas3() {
		// When zoomed out to less than 100%, for some very strange reason,
		// some browsers report devicePixelRatio as less than 1
		// and only part of the canvas is cleared then.
		var ratio =  Math.max(window.devicePixelRatio || 1, 1);

		// This part causes the canvas to be cleared
		var canvas = getCanvas( "signature-pad-EFT" );
		if( canvas ) {
			canvas.width = canvas.offsetWidth * ratio;
			canvas.height = canvas.offsetHeight * ratio;
			canvas.getContext("2d").scale(ratio, ratio);
		}

		signaturePadEFT.clear();
	}
	resizeCanvas3();

	$( "#acceptSignatureEFT" ).off().on( "click", function( event ) {
		var data = signaturePadEFT.toDataURL( 'image/png' );
		var checkCanvasEmptyEFT = $( "#checkCanvasEmptyEFT" ).val();
		var hiddensignatureidEFT = $( "#hiddensignatureidEFT" ).val();
		console.log( "signaturePadEFT.isEmpty()", signaturePadEFT.isEmpty() );
		console.log( "checkCanvasEmptyEFT", checkCanvasEmptyEFT );
		if( signaturePadEFT.isEmpty() && checkCanvasEmptyEFT != 1 ) {
			$( "#nosignErrorEFTText" ).html( "" );
			$( "#nosignErrorEFTText" ).html( "Please sign the signature pad." );
			$( "#nosignErrorEFT" ).show();
			return false;
		}
		$( "#acceptSignatureEFT" ).attr( "disabled", true );
		$( "#clearSignatureEFT" ).attr( "disabled", true );
		$.ajax({
			type: "POST",
			url: "/saveSignature?hiddensignatureid=" + hiddensignatureidEFT,
			data: { imgBase64: data, esignatureType: 3 },
			dataType: "json",
			beforeSend: function() {
				$ ("#save_signature_loading" ).css( "display", "block" );
			}
			,complete:function() { }
			,success:function( res ) {
				$("#save_signature_loading").css("display","none");
				$("#signInstructionsEFT").css("display","none");
				$("#acceptSignatureEFT").attr("disabled", false);
				$("#clearSignatureEFT").attr("disabled", false);
				// console.log( "res.status", res.status, res.agreementsignpath );
				if( res.status==200 ) {
					var signatureIdEFT = res.signatureid;
					$("#signerrorEFT").hide();
					$("#issignedEFT").val( 1 );
					$('#hiddensignatureidEFT').val( signatureIdEFT );
					$('#signature-pad-EFT').hide();
					$('#stamp-eft').html( '<img class="img-responsive" style="width: 100%;" src="' + res.agreementsignpath + '">' );
					$("#stamp-eft-date").html( moment().format( "MM/DD/YYYY" ) );

					if( validatePrereqs() ) {
						enableFinalizeButton();
					}
				} else {
					$( "#nosignErrorEFT" ).html( "Please sign the signature pad." );
					$( "#nosignErrorEFT" ).show();
				}
			}
		});
		return false;
	});

	$( "#clearSignatureEFT" ).off().on( "click", function( event ) {
		signaturePadEFT.clear();
		console.log( "clearing canvas: eft" );
		$( "#nosignErrorEFT" ).hide();
		$( "#checkCanvasEmptyEFT" ).val( 0 );
	} );
	/************* EFT Signature End **************/
}

function initJustEFTAPad() {
	function getCanvas( canvasId ) {
		var wrapper = document.getElementById( canvasId );
		if( wrapper == null ) { return null; }
		return wrapper.querySelector( "canvas" );
	}

	window.onresize = function onResize() {
		resizeEFTCanvas();
	};

	var wrapper =  document.getElementById( "signature-pad-EFT" );
	if( wrapper == null ) {
		return null;
	}
	/* ************ Arbitration Signature Start **************/
	// var acceptSignature = document.getElementById( "acceptSignature" );
	// var clearSignature = document.getElementById( "clearSignature" );
	var canvas = wrapper.querySelector( "canvas" );

	var signaturePadEFT = new SignaturePad( canvas, {
		//needed for jpeg
		//backgroundColor: 'rgb(255, 255, 255)'
	});


	// Adjust canvas coordinate space taking into account pixel ratio,
	// to make it look crisp on mobile devices.
	function resizeEFTCanvas() {
		// When zoomed out to less than 100%, for some very strange reason,
		// some browsers report devicePixelRatio as less than 1
		// and only part of the canvas is cleared then.
		var ratio =  Math.max(window.devicePixelRatio || 1, 1);

		// This part causes the canvas to be cleared
		var canvas = getCanvas( "signature-pad-EFT" );
		if( canvas ) {
			canvas.width = canvas.offsetWidth * ratio;
			canvas.height = canvas.offsetHeight * ratio;
			canvas.getContext("2d").scale(ratio, ratio);
		}

		signaturePadEFT.clear();
	}
	resizeEFTCanvas();

	$( "#acceptSignatureEFT" ).off().on( "click", function( event ) {
		var data = signaturePadEFT.toDataURL( 'image/png' );
		var checkCanvasEmptyEFT = $( "#checkCanvasEmptyEFT" ).val();
		var hiddensignatureidEFT = $( "#hiddensignatureidEFT" ).val();
		var hiddenAccountID = $( "#bankaccountid" ).html();
		console.log( "signaturePadEFT.isEmpty()", signaturePadEFT.isEmpty() );
		console.log( "checkCanvasEmptyEFT", checkCanvasEmptyEFT );
		if( signaturePadEFT.isEmpty() && checkCanvasEmptyEFT != 1 ) {
			$( "#nosignErrorEFTText" ).html( "" );
			$( "#nosignErrorEFTText" ).html( "Please sign the signature pad." );
			$( "#nosignErrorEFT" ).show();
			return false;
		}
		$( "#acceptSignatureEFT" ).attr( "disabled", true );
		$( "#clearSignatureEFT" ).attr( "disabled", true );
		$.ajax({
			type: "POST",
			url: "/saveSignature?hiddensignatureid=" + hiddensignatureidEFT,
			data: {
				imgBase64: data,
				esignatureType: 3,
				accountID: hiddenAccountID
			 },
			dataType: "json",
			beforeSend: function() {
				$ ("#save_signature_loading" ).css( "display", "block" );
			}
			,complete:function() { }
			,success:function( res ) {

				$("#save_signature_loading").css("display","none");
				$("#signInstructionsEFT").css("display","none");
				$("#acceptSignatureEFT").attr("disabled", false);
				$("#clearSignatureEFT").attr("disabled", false);
				// console.log( "res.status", res.status, res.agreementsignpath );
				if( res.status==200 ) {
					var signatureIdEFT = res.signatureid;
					$("#signerrorEFT").hide();
					$("#issignedEFT").val( 1 );
					$('#hiddensignatureidEFT').val( signatureIdEFT );
					$('#signature-pad-EFT').hide();
					$('#stamp-eft').html( '<img class="img-responsive" style="width: 100%;" src="' + res.agreementsignpath + '">' );
					$("#stamp-eft-date").html( moment().format( "MM/DD/YYYY" ) );

					checkStatus();
				} else {
					$( "#nosignErrorEFT" ).html( "Please sign the signature pad." );
					$( "#nosignErrorEFT" ).show();
				}
			}
		});
		return false;
	});

	$( "#clearSignatureEFT" ).off().on( "click", function( event ) {
		signaturePadEFT.clear();
		console.log( "clearing canvas: eft" );
		$( "#nosignErrorEFT" ).hide();
		$( "#checkCanvasEmptyEFT" ).val( 0 );
	} );
	/************* EFT Signature End **************/
}