/* global $ */

function selectAll( groupclass, valueclass ) {
	if( $( "." + groupclass ).prop( "checked" ) == true ) {
		$( "." + valueclass ).prop( "checked", true );
		$( "#regSubmit" )
		.removeClass( "lightBlueBtn" )
		.addClass( "blueBtn" );
	} else {
		$( "." + valueclass ).prop( "checked", false );
		$( "#regSubmit" )
		.removeClass( "blueBtn" )
		.addClass( "lightBlueBtn" );
	}

	const elechecked = $( "input[class=doublecheck]:checked" ).length;
	const checked = $( "input[class=singlecheck]:checked" ).length;
	if( !checked ) {
		$( "#checkError" ).css( "display", "block" );
		$( "#regSubmit" )
		.removeClass( "blueBtn" )
		.addClass( "lightBlueBtn" );
		return false;
	} else {
		$( "#checkError" ).css( "display", "none" );
		$( "#regSubmit" )
		.removeClass( "lightBlueBtn" )
		.addClass( "blueBtn" );
	}
	if( !elechecked ) {
		$( "#regSubmit" )
		.removeClass( "blueBtn" )
		.addClass( "lightBlueBtn" );
	}
}

function alertmsg( msg ) {
	$( "#alertmsgbody" ).html( msg );
	$( "#alertmsg" ).modal( "show" );
}
function removeConsentErrorMsg( obj ) {
	const checked = $( "input[class=singlecheck]:checked" ).length;
	if( $( obj ).is( ":checked" ) ) {
		$( "#consentError" ).css( "display", "none" );
		if( checked > 0 ) {
			$( "#regSubmit" )
			.removeClass( "lightBlueBtn" )
			.addClass( "blueBtn" );
		}
	} else {
		$( "#consentError" ).css( "display", "block" );
		$( "#regSubmit" )
		.removeClass( "blueBtn" )
		.addClass( "lightBlueBtn" );
	}
}

function removeSelectallErrorMsg( obj ) {
	const elechecked = $( "input[class=doublecheck]:checked" ).length;
	const checked = $( "input[class=singlecheck]:checked" ).length;
	if( !checked ) {
		$( "#checkError" ).css( "display", "block" );
		$( "#regSubmit" )
		.removeClass( "blueBtn" )
		.addClass( "lightBlueBtn" );
		return false;
	} else {
		$( "#checkError" ).css( "display", "none" );
		$( "#regSubmit" )
		.removeClass( "lightBlueBtn" )
		.addClass( "blueBtn" );
	}
	if( checked == $( ".singlecheck" ).length ) {
		$( "#checkbox2" ).prop( "checked", true );
		$( "#regSubmit" )
		.removeClass( "lightBlueBtn" )
		.addClass( "blueBtn" );
	} else if( checked < $( ".singlecheck" ).length ) {
		$( "#checkbox2" ).prop( "checked", false );
		$( "#regSubmit" )
		.removeClass( "blueBtn" )
		.addClass( "lightBlueBtn" );
	} else {
		$( "#checkbox2" ).prop( "checked", false );
		$( "#regSubmit" )
		.removeClass( "blueBtn" )
		.addClass( "lightBlueBtn" );
	}
	if( !elechecked ) {
		$( "#regSubmit" )
		.removeClass( "blueBtn" )
		.addClass( "lightBlueBtn" );
	}
}

function removeElectronicFunds( obj ) {
	const checked = $( "input[name=ElectronicFundsConditions]:checked" ).length;
	const checkCanvasEmpty = $( "#checkCanvasEmpty" ).val();
	const hiddensignatureid = $( "#hiddensignatureid" ).val();
	if( checked > 0 ) {
		// signpad();
		$( "#eftconsentsign" ).html( "" );
		if( checkCanvasEmpty == 0 && hiddensignatureid == "" ) {
			// document.getElementById('signpadDiv').style.display = "block";
			$( "#agree" )
			.removeClass( "ActivefillBtn" )
			.addClass( "ActivefillGreenBtn" );
			$( "#save" )
			.removeClass( "lightBlueBtn" )
			.addClass( "greenBtn" );
		} else {
			$( "#agree" )
			.removeClass( "ActivefillBtn" )
			.addClass( "ActivefillGreenBtn" );
			$( "#save" )
			.removeClass( "lightBlueBtn" )
			.addClass( "greenBtn" );
			// document.getElementById('signpadDiv').style.display = "none";
		}
	} else {
		// $("#eftconsentsign").html("<label class='error'>Please select electronic funds</label>");
		$( "#agree" )
		.removeClass( "ActivefillGreenBtn" )
		.addClass( "ActivefillBtn" );
		$( "#save" )
		.removeClass( "greenBtn" )
		.addClass( "lightBlueBtn" );
		// document.getElementById('signpadDiv').style.display = "none";
	}
}
function callPlaidApiProcess() {
	return false;
}
/* $('#annualincome').blur(function() {
	$(this).maskMoney('mask');
});
$('#financedAmount').blur(function() {
		$(this).maskMoney('mask');
	});*/
$( document ).ready( function() {
	$( "#annualincome" )
	.maskMoney( { prefix: "$ ", allowNegative: true, thousands: ",", allowZero: true, decimal: "." } )
	.trigger( "mask.maskMoney" );
	$( "#financedAmount" )
	.maskMoney( { prefix: "$ ", allowNegative: true, thousands: ",", allowZero: true, decimal: "." } )
	.trigger( "mask.maskMoney" );

	var start = new Date();
	const mm = start.getMonth() + 1;
	const dd = start.getDate();
	const yyyy = start.getFullYear() - 80;
	const Startdate = mm + "/" + dd + "/" + yyyy;

	var start = new Date();
	const startmonth = start.getMonth() + 1;
	const startdate = start.getDate();
	const startyear = start.getFullYear() - 100;
	const startDate = startmonth + "/" + startdate + "/" + startyear;

	const end = new Date();
	const endmonth = end.getMonth() + 1;
	const enddate = end.getDate();
	const endyear = end.getFullYear() - 18;
	const endDate = endmonth + "/" + enddate + "/" + endyear;

	$( "#dateofBirth" ).datepicker( {
		changeMonth: true,
		changeYear: true,
		format: "mm/dd/yyyy",
		todayHighlight: true,
		// maxDate: '0',
		// endDate: '-18d'	,
		minDate: startDate,
		maxDate: endDate,
		yearRange: "-100:-18"
	} );

	$( "#dateofBirth" ).keydown( function( event ) {
		if( event.keyCode != 8 ) {
			event.preventDefault();
		}
	} );

	$( "#regSubmit" ).click( function() {
		consentchecked = $( "input[class=singlecheck]:checked" ).length;
		if( $( "#checkbox1" ).prop( "checked" ) == true ) {
			$( "#consentError" ).css( "display", "none" );
			// $("#regSubmit").removeClass("lightBlueBtn").addClass("blueBtn");
		} else {
			$( "#consentError" ).css( "display", "block" );
			// $("#regSubmit").removeClass("blueBtn").addClass("lightBlueBtn");
		}

		checked = $( "input[class=singlecheck]:checked" ).length;
		if( !checked ) {
			$( "#checkError" ).css( "display", "block" );
			// $("#regSubmit").removeClass("blueBtn").addClass("lightBlueBtn");
			return false;
		} else {
			$( "#checkError" ).css( "display", "none" );
			// $("#regSubmit").removeClass("lightBlueBtn").addClass("blueBtn");
		}
	} );

	$( "#regPractice" ).click( function() {
		checked = $( "input[class=singlecheck]:checked" ).length;

		if( !checked ) {
			alertmsg( "You must check Consent for Something." );
			return false;
		}
	} );

	$.validator.addMethod("verifyPhoneNumber", function(value, element) {
		if(!value) {
			return false;
		}
		const modifiedNumber = value.replace(/[^\d]/g,"");
		return new RegExp(/^[0-9]{10}$/).test(modifiedNumber);
	});

	$( "#userinfoform" ).validate( {
		rules: {
			employername: "required",
			employercity: "required",
			phone: {
				required: true,
				verifyPhoneNumber: true
			},
			email: {
				required: true,
				email: true
			},
			employerstatus: "required",
			supervisorfirstname: {
				required: true,
				minlength: 2
			},
			supervisorlastname: {
				required: true,
				minlength: 1
			},
			jobtitle: {
				required: true
			},
			employmentstatus: {
				required: true
			},
			employerstate: {
				required: true
			},
			jobstartday: {
				required: true
			},
			jobstartmonth: {
				required: true
			},
			jobstartyear: {
				required: true
			},
			"confirmpassword": { required: true, equalTo: "#password" }
		},
		messages: {
			employername: {
				required: "Please enter your employer name."
			},
			"confirmpassword": { required: "Please repeat password.", equalTo: "Please enter the same value." },
			employercity: {
				required: "Please enter your employer city."
			},
			phone: {
				required: "Please enter your phone number.",
				verifyPhoneNumber: "Please enter a valid phone number."
			},
			email: {
				required: "Please enter email address.",
				email: "Please enter valid email address."
			},
			samepassword: {
				required: "Please enter the same value."
			},
			employerstatus: {
				required: "Please specify your employer status."
			},
			supervisorfirstname: {
				required: "Please enter your supervisor's first name.",
				minlength: "First name cannot be shorter than two characters."
			},
			supervisorlastname: {
				required: "Please enter your supervisor's first name.",
				minlength: "First name cannot be shorter than one characters."
			},
			jobtitle: {
				required: "Please enter your job title."
			},
			employmentstatus: {
				required: "Please choose your employment status."
			},
			employerstate: {
				required: "Please choose your employer's state."
			},
			jobstartday: {
				required: "Please choose job start day."
			},
			jobstartmonth: {
				required: "Please choose job start month."
			},
			jobstartyear: {
				required: "Please choose job start year."
			}
		},
		submitHandler: function( form ) {
			form.submit();
		}
	} );

	if( document.getElementById( "forgotpwd-fm" ) ) {
		setnewpassword();
	}

	if( document.getElementById( "signinForm" ) ) {
		signinFormValidate();
	}

	if( document.getElementById( "forgotForm" ) ) {
		forgotFormValidate();
	}

	if( document.getElementById( "forgotsetpwd" ) ) {
		forgotsetpassword();
	}

	if( document.getElementById( "savepasswordDataForm" ) ) {
		changepassword();
	}

	$( "#forgotpwd-fm" ).on( "blur keyup change", "input", function( event ) {
		if( $( "#forgotpwd-fm" ).valid() ) {
			$( "#setpasswordBtn" )
			.removeClass( "lightBlueBtn" )
			.addClass( "blueBtn" );
		} else {
			$( "#setpasswordBtn" )
			.removeClass( "blueBtn" )
			.addClass( "lightBlueBtn" );
		}
	} );

	// blur keyup change ::::::  Signin form
	$( "#signinForm" ).on( "blur keyup change", "input", function( event ) {
		// signinFormValidate();
		if( $( "#signinForm" ).valid() ) {
			$( "#signinBtn" )
			.removeClass( "lightBlueBtn" )
			.addClass( "blueBtn" );
		} else {
			$( "#signinBtn" )
			.removeClass( "blueBtn" )
			.addClass( "lightBlueBtn" );
		}
	} );
	// Application Signin form Validation
	$( "#applicationSignin" ).on( "blur keyup change", "input", function( event ) {
		if( $( "#applicationSignin" ).valid() ) {
			$( "#signinBtn" )
			.removeClass( "lightBlueBtn" )
			.addClass( "blueBtn" );
		} else {
			$( "#signinBtn" )
			.removeClass( "blueBtn" )
			.addClass( "lightBlueBtn" );
		}
	} );

	/* Forgot password*/
	$( "#forgotForm" ).on( "blur keyup change", "input", function( event ) {
		// signinFormValidate();
		if( $( "#forgotForm" ).valid() ) {
			$( "#forgotBtn" )
			.removeClass( "lightBlueBtn" )
			.addClass( "blueBtn" );
		} else {
			$( "#forgotBtn" )
			.removeClass( "blueBtn" )
			.addClass( "lightBlueBtn" );
		}
	} );

	$( "#forgotsetpwd" ).on( "blur keyup change", "input", function( event ) {
		// signinFormValidate();
		if( $( "#forgotsetpwd" ).valid() ) {
			$( "#setpassword" )
			.removeClass( "lightBlueBtn" )
			.addClass( "blueBtn" );
		} else {
			$( "#setpassword" )
			.removeClass( "blueBtn" )
			.addClass( "lightBlueBtn" );
		}
	} );

	$.validator.addMethod( "pwdcheck", function( value ) {
		const regex = /^(?=.*[0-9])(?=.*[!@#_$%^&+\-*])[a-zA-Z0-9!@#$_%^&+\-*]{8,}$/;
		return regex.test( value );
	} );

	$( "#clicktosaveform" ).validate( {
		rules: {
			cemailAddress: {
				email: true
			},
			cpassword: {
				required: true
			},
			conpassword: {
				required: true,
				equalTo: "#cpassword"
			}
		},
		messages: {
			cemailAddress: {
				required: "Please enter email address"
			},
			cpassword: {
				required: "Please enter password"
			},
			conpassword: {
				required: "Please enter confirm password",
				equalTo: "Confirm password does not match"
			}
		},
		submitHandler: function() {
			$( "#errormsg" ).html( "" );
			$.ajax( {
				url: "/clicktosave",
				data: $( "#clicktosaveform" ).serialize(),
				dataType: "json",
				type: "POST",
				success: function( res ) {
					if( res.status == 200 ) {
						$( "#optedclicktosave" ).val( "1" );
						// $(".clicktosavetooltip").hide();
						$( "#successmsg" ).html( res.message );
						$( "#errormsg" ).html( "" );
						$( "#alertclick2save" ).show();

						const emailEle = document.getElementById( "email" );
						if( emailEle ) {
							// alert('if loop');
							// alert($("#cemailAddress").val());
							$( "#email" ).val( $( "#cemailAddress" ).val() );
						}

						setTimeout( function() {
							$( "#clicktosave" ).modal( "hide" );
						}, 2000 );
					} else {
						$( "#errormsg" ).html( res.message );
						$( "#successmsg" ).html( "" );
					}
				}
			} );
		}
	} );

	$( "#userinfofullmanualData" ).validate( {
		rules: {
			firstname: {
				required: true,
				minlength: 2
			},
			lastname: {
				required: true,
				minlength: 1
			},
			ssnNumber: {
				required: true,
				minlength: 9
			},
			dateofBirth: {
				required: true,
				dateFormat: true
			},
			phoneNumber: {
				required: true
			},
			email: {
				required: true,
				email: true
			},
			street: {
				required: true
			},
			residencytype: {
				required: true
			},
			zipCode: {
				required: true,
				number: true
			},
			city: {
				required: true
			},
			state: {
				required: true
			},
			annualincome: {
				required: true,
				requiredcheck: true
			},
			financedAmount: {
				required: true,
				requiredcheck: true
			}
		},
		messages: {
			firstname: {
				required: "Please enter your first name.",
				minlength: "Please enter your first name."
			},
			lastname: {
				required: "Please enter your last name.",
				minlength: "Please enter your last name."
			},
			ssnNumber: {
				required: "Please enter your social security number."
			},
			dateofBirth: {
				required: "Please select your date of birth."
			},
			phoneNumber: {
				required: "Please enter your primary phone."
			},
			email: {
				required: "Please enter your email address.",
				email: "Please enter a valid email address."
			},
			street: {
				required: "Please enter your primary address."
			},
			residencytype: {
				required: "Please select your type of residence."
			},
			zipCode: {
				required: "Please enter your zip code."
			},
			city: {
				required: "Please enter your city."
			},
			state: {
				required: "Please select your state."
			},
			financedAmount: {
				required: "Please enter an anticipated amount financed.",
				requiredcheck: "Please enter an anticipated amount financed."
			},
			annualincome: {
				required: "Please enter your annual income.",
				requiredcheck: "Please enter your annual income."
			}
		},
		submitHandler: function() {
			$( "#ajaxLoader" ).html( "" );

			const minloanamount = parseInt( $( "#minloanamount" ).val() );
			const maxloanamount = parseInt( $( "#maxloanamount" ).val() );
			const minincomeamount = parseInt( $( "#minincomeamount" ).val() );

			let financedAmount = $( "#financedAmount" ).val();
			financedAmount = parseFloat( financedAmount.replace( /,/g, "" ).replace( "$", "" ) );

			let incomeamount = $( "#annualincome" ).val();
			incomeamount = parseFloat( incomeamount.replace( /,/g, "" ).replace( "$", "" ) );

			if( parseFloat( incomeamount ) < minincomeamount ) {
				$( "#denyreasonlowincomemodel" ).modal( "show" );
				return false;
			} else {
				$( "#submitconfirmation" ).modal( "show" );
				return false;
			}
		}
	} );

	$( "#userinfofulldata" ).validate( {
		rules: {
			firstname: {
				required: true,
				minlength: 2
			},
			lastname: {
				required: true,
				minlength: 1
			},
			ssnNumber: {
				required: true,
				minlength: 9
			},
			dateofBirth: {
				required: true,
				dateFormat: true
			},
			phoneNumber: {
				required: true
			},
			email: {
				required: true,
				email: true
			},
			street: {
				required: true
			},
			residencytype: {
				required: true
			},
			zipCode: {
				required: true,
				number: true
			},
			city: {
				required: true
			},
			state: {
				required: true
			}
		},
		messages: {
			firstname: {
				required: "Please enter your first name",
				minlength: "Please enter your first name."
			},
			lastname: {
				required: "Please enter your last name.",
				minlength: "Please enter your last name."
			},
			ssnNumber: {
				required: "Please enter your social security number."
			},
			dateofBirth: {
				required: "Please select your date of birth."
			},
			phoneNumber: {
				required: "Please enter your primary phone."
			},
			email: {
				required: "Please enter your email address.",
				email: "Please enter a valid email address."
			},
			street: {
				required: "Please enter your primary address."
			},
			residencytype: {
				required: "Please select your type of residence."
			},
			zipCode: {
				required: "Please enter your zip code."
			},
			city: {
				required: "Please enter your city."
			},
			state: {
				required: "Please select your state."
			}
		},
		submitHandler: function() {
			$( "#userinfoBtn" ).attr( "disabled", true );
			$( "#submitconfirmation" ).modal( "show" );
			return false;
		}
	} );

	$.validator.addMethod(
		"dateFormat",
		function( value, element ) {
			// put your own logic here, this is just a (crappy) example
			return value.match( /^\d\d?\/\d\d?\/\d\d\d\d$/ );
		},
		"Please enter a date in the format mm/dd/yyyy."
	);
	$.validator.addMethod(
		"accnomatch",
		function( value, element ) {
			// The two password inputs
			const bankaccno = $( "#bankaccno" ).val();
			const cbankaccno = $( "#cbankaccno" ).val();

			// Check for equality with the password inputs
			if( bankaccno != cbankaccno ) {
				return false;
			} else {
				return true;
			}
		},
		"Account no does not match"
	);
	$.validator.addMethod(
		"requiredcheck",
		function( value, element ) {
			const inputValue = parseFloat( value.replace( /,/g, "" ).replace( "$", "" ) );
			if( inputValue > 0 ) {
				return true;
			} else {
				return false;
			}
		},
		"Account no does not match"
	);

	$( "#financedata" ).validate( {
		rules: {
			annualincome: {
				required: true,
				requiredcheck: true
				// number: true
			},
			bankname: {
				required: true
			},
			bankaccno: {
				required: true,
				number: true
			},
			cbankaccno: {
				required: true,
				number: true,
				accnomatch: true
			},
			routingno: {
				required: true
			},
			accountholder: {
				required: true
			},
			financedAmount: {
				required: true,
				requiredcheck: true
				// number: true
			}
		},
		messages: {
			annualincome: {
				required: "Please enter annual income",
				requiredcheck: "Please enter annual income"
			},
			bankname: {
				required: "Please select bank name"
			},
			bankaccno: {
				required: "Please enter account number"
			},
			cbankaccno: {
				required: "Please enter confirm account number",
				accnomatch: "Account number does not match"
			},
			routingno: {
				required: "Please enter routing number"
			},
			accountholder: {
				required: "Please enter primary account holder"
			},
			financedAmount: {
				required: "Please enter anticipated amount financed",
				requiredcheck: "Please enter anticipated amount financed"
			}
		},
		submitHandler: function() {
			const minloanamount = parseFloat( $( "#minloanamount" ).val() );
			const maxloanamount = parseFloat( $( "#maxloanamount" ).val() );
			const minincomeamount = parseFloat( $( "#minincomeamount" ).val() );

			let financedAmount = $( "#financedAmount" ).val();
			let incomeamount = $( "#annualincome" ).val();
			incomeamount = parseFloat( incomeamount.replace( /,/g, "" ).replace( "$", "" ) );
			financedAmount = parseFloat( financedAmount.replace( /,/g, "" ).replace( "$", "" ) );

			const popupsubmit = $( "#popupsubmit" ).val();
			if( popupsubmit == 1 ) {
				return true;
			}

			if( parseFloat( incomeamount ) < minincomeamount ) {
				$( "#denyreasonlowincomemodel" ).modal( "show" );
				return false;
			} else {
				if( financedAmount >= minloanamount ) {
					$.ajax( {
						url: "/loanamountconfirm",
						data: {
							incomeamount: incomeamount,
							financedAmount: financedAmount
						},
						dataType: "json",
						type: "POST",
						success: function( res ) {
							if( res.status == 300 ) {
								$( "#temploanamount" ).val( "0" );

								$( "#denyreasonmodel" ).modal( "show" );
								// $("#financedAmount").val(res.prequalifiedAmount).maskMoney({prefix:'$ ', allowNegative: true, thousands:',',allowZero: true, decimal:'.'}).trigger('mask.maskMoney');
								$( "#temploanamount" )
								.val( res.prequalifiedAmount )
								.maskMoney( { prefix: "$ ", allowNegative: true, thousands: ",", allowZero: true, decimal: "." } )
								.trigger( "mask.maskMoney" );
								$( "#maxloantxt" ).hide();
								$( "#minloantxt" ).hide();
								if( res.minmaxchangeTxt == 1 ) {
									$( "#minloantxt" ).show();
								} else {
									$( "#maxloantxt" ).show();
								}

								$( "#qualifiedAmount" ).html( res.prequalifiedAmount );
								return false;
							} else if( res.status == 600 ) {
								$( "#denyreasonlowincomemodel" ).modal( "show" );
								return false;
							} else if( res.status == 200 || res.status == 400 || res.status == 500 ) {
								$( "#popupsubmit" ).val( "1" );
								document.getElementById( "financedata" ).submit();
							} else {
								return true;
							}
						}
					} );

					/* if(maxloanamount<financedAmount)
					{
						$('#apllicationloanmodel').modal('show');
						return false;
	 				}
					else
					{
	 					return true;
					}*/
				} else {
					$( "#apllicationloanmodel" ).modal( "show" );
					return false;
				}
			}
			return false;
		}
	} );

	$( "#promissoryform" ).validate( {
		rules: {
			ElectronicFundsConditions: {
				required: true
			}
		},
		messages: {
			ElectronicFundsConditions: {
				required: "Please accept the electronic funds transfer authorization."
			}
		},
		errorPlacement: function( error, element ) {
			if( element.attr( "name" ) == "ElectronicFundsConditions" ) {
				error.appendTo( "#eftconsentsign" );
				$( "#promissory-modal" ).animate(
					{
						scrollTop: $( "#promissory-modal" )[ 0 ].scrollHeight - $( "#promissory-modal" ).height()
					},
					1000,
					function() {}
				);
			} else {
				error.insertAfter( element );
			}
		},
		submitHandler: function() {
			const checked = $( "input[name=ElectronicFundsConditions]:checked" ).length;
			if( checked > 0 ) {
				// $("#manualagree").removeClass("ActivefillBtn").addClass("ActivefillGreenBtn");

				const checkCanvasEmpty = $( "#checkCanvasEmpty" ).val();
				const hiddensignatureid = $( "#hiddensignatureid" ).val();
				if( checkCanvasEmpty == 1 && hiddensignatureid != "" ) {
					return true;
				} else {
					// document.getElementById('signpadDiv').style.display = "block";
				}
			} else {
				// $("#manualagree").removeClass("ActivefillGreenBtn").addClass("ActivefillBtn");
				// document.getElementById('signpadDiv').style.display = "none";
			}
			return false;
		}
	} );
	if( document.getElementById( "applicationSignin" ) ) {
		managmentFormValidate();
	}

	$( "#manualpromissoryform" ).validate( {
		rules: {
			bankname: {
				required: true
			},
			bankaccno: {
				required: true,
				number: true
			},
			cbankaccno: {
				required: true,
				number: true,
				accnomatch: true
			},
			routingno: {
				required: true
			},
			accountholder: {
				required: true
			},
			ElectronicFundsConditions: {
				required: true
			}
		},
		messages: {
			bankname: {
				required: "Please enter the name of your bank."
			},
			bankaccno: {
				required: "Please enter your account number."
			},
			cbankaccno: {
				required: "Please confirm your account number.",
				accnomatch: "Account numbers do not match."
			},
			routingno: {
				required: "Please enter your routing number."
			},
			accountholder: {
				required: "Please enter the name of the primary account holder."
			},
			ElectronicFundsConditions: {
				required: "Please accept the electronic funds transfer authorization."
			}
		},
		errorPlacement: function( error, element ) {
			if( element.attr( "name" ) == "ElectronicFundsConditions" ) {
				error.appendTo( "#eftconsentsign" );
				$( "#promissory-modal" ).animate(
					{
						scrollTop: $( "#promissory-modal" )[ 0 ].scrollHeight - $( "#promissory-modal" ).height()
					},
					1000,
					function() {}
				);
			} else {
				error.insertAfter( element );
			}
		},
		submitHandler: function() {
			const checked = $( "input[name=ElectronicFundsConditions]:checked" ).length;
			if( checked > 0 ) {
				$( "#manualagree" )
				.removeClass( "ActivefillBtn" )
				.addClass( "ActivefillGreenBtn" );

				const checkCanvasEmpty = $( "#checkCanvasEmpty" ).val();
				const hiddensignatureid = $( "#hiddensignatureid" ).val();
				if( checkCanvasEmpty == 1 && hiddensignatureid != "" ) {
					return true;
				}
			} else {
				$( "#eftconsentsign" ).html( "<label class='error'>Please accept the electronic funds transfer authorization.</label>" );
				$( "#promissory-modal" ).animate(
					{
						scrollTop: $( "#promissory-modal" )[ 0 ].scrollHeight - $( "#promissory-modal" ).height()
					},
					1000,
					function() {}
				);
				$( "#manualagree" )
				.removeClass( "ActivefillGreenBtn" )
				.addClass( "ActivefillBtn" );
				// document.getElementById('signpadDiv').style.display = "none";
			}
			return false;
		}
	} );

	if( document.getElementById( "signpadDiv" ) ) {
		$( "head" ).append( "<script language='javascript' src='/js/js/signaturepad.js'></script>" );
	}

/*
	if( document.getElementById( "stampimg" ) ) {
		const imgSource = document.getElementById( "stampimg" ).src;
		var hiddensignatureid = document.getElementById( "hiddensignatureid" ).value;
		if( imgSource != "" ) {
			signatureImage( imgSource, hiddensignatureid );
		}
	}
*/

	if( document.getElementById( "stamp" ) ) {
		const checkCanvasEmpty = $( "#checkCanvasEmpty" ).val();
		var hiddensignatureid = $( "#hiddensignatureid" ).val();

		if( checkCanvasEmpty == 1 && hiddensignatureid != "" ) {
			$( "#stamp" ).css( "border-bottom", "solid 1px" );
		}
	}
} );

function searchbank( bank ) {
	if( bank.length > 3 ) {
		$.ajax( {
			url: "/searchbank",
			data: {
				bankSearch: bank
			},
			dataType: "json",
			type: "POST",
			success: function( res ) {
				if( res.status == "success" ) {
					const respond = res.data;
					const reslen = respond.length;
					if( reslen > 0 ) {
						var c = "";
						$.each( respond, function( k, v ) {
							c += '<div class="tt-suggestion tt-selectable" onclick="selectbank(\'' + v.bankname + "','" + v.bankid + "','" + v.institutionType + "');\">" + v.bankname + "</div>";
						} );
					} else {
						c = '<div class="tt-suggestion tt-selectable">No Result Found</div>';
					}
					$( ".tt-dataset-bank" ).html( c );
					$( ".tt-menu" ).show();
					return false;
				} else {
					return false;
				}
			}
		} );
	} else {
		$( ".tt-menu" ).hide();
	}
}

function selectbank( bankname, bankid, banktype ) {
	$( "#bankid" ).val( bankid );
	$( "#bankname" ).val( bankname );
	$( "#banktype" ).val( banktype );
	$( ".tt-dataset-banks" ).html();
	$( ".tt-menu" ).hide();
}

/* signstart */

function openelectronic() {
	$( "#electronicDocument" ).modal( "show" );
}

function opencreditreport() {
	$( "#creditReportDocument" ).modal( "show" );
}

function opentelemarketing() {
	$( "#telemarketingDocument" ).modal( "show" );
}

function openpolicy() {
	$( "#policyDocument" ).modal( "show" );
}

function openqualification() {
	$( "#qualificationDocument" ).modal( "show" );
}
function setConfirmAccno( accno ) {
	$( "#cbankaccno" ).val( accno );
}

/* $(function() {
    $('.singlecheck').click(function() {
        if ($(this).is(':checked')) {

              $("#regSubmit").removeClass("lightBlueBtn").addClass("blueBtn");

        } else {
            $("#regSubmit").removeClass("blueBtn").addClass("lightBlueBtn");
        }
    });
});*/
/* User signin*/

function signinFormValidate() {
	$( "#signinForm" ).validate( {
		rules: {
			email: {
				required: true,
				email: true
			},
			password: {
				required: true
			}
		},
		messages: {
			email: {
				required: "Please enter your email address."
			},
			password: {
				required: "Please enter your password."
			}
		}
	} );
}

function managmentFormValidate() {
	$( "#applicationSignin" ).validate( {
		rules: {
			email: {
				required: true,
				email: true
			},
			password: {
				required: true
			}
		},
		messages: {
			email: {
				required: "Please enter your email address."
			},
			password: {
				required: "Please enter your password."
			}
		}
	} );
}
function forgotFormValidate() {
	$( "#forgotForm" ).validate( {
		rules: {
			forgotemail: {
				required: true,
				email: true
			}
		},
		messages: {
			forgotemail: {
				required: "Please enter your email address."
			}
		}
	} );
}

/* forgotset password*/
function forgotsetpassword() {
	$( "#forgotsetpwd" ).validate( {
		rules: {
			new_pwd: {
				required: true
			},
			confirm_pwd: {
				required: true,
				equalTo: "#new_pwd"
			}
		},
		messages: {
			new_pwd: {
				required: "Please enter your new password."
			},
			confirm_pwd: {
				required: "Please confirm your password.",
				equalTo: "Passwords must match."
			}
		}
	} );
}

/* Change password*/

function changepassword() {
	$( "#savepasswordDataForm" ).validate( {
		rules: {
			newPassword: {
				required: true
			},
			confirmPassword: {
				required: true,
				equalTo: "#newPassword"
			}
		},
		messages: {
			newPassword: {
				required: "Please enter your new password."
			},
			confirmPassword: {
				required: "Please confirm your password.",
				equalTo: "Passwords must match."
			}
		}
	} );
}

/* Validation for change password form starts here */

function setnewpassword() {
	$( "#forgotpwd-fm" ).validate( {
		rules: {
			email: {
				required: true,
				email: true
			},
			password: {
				required: true
			},
			confirm_pwd: {
				required: true,
				equalTo: "#new_pwd"
			}
		},
		messages: {
			email: {
				required: "Please enter your email address.",
				email: "Please enter a valid email address."
			},
			password: {
				required: "Please enter your password."
			},
			confirm_pwd: {
				required: "Please confirm your password."
			}
		}
	} );
	return false;
}
/* Validation for change password form starts here */

/* --- Slect your monthly payment ---- */

function processOffer( loanid, monthterm ) {
	$( "#offerid" ).val( loanid );
	$( "#monthterm" ).val( monthterm );
	document.getElementById( "selectofferform" ).submit();
}

function showDetailpage( idValue ) {
	// $("#showDetail_"+idValue).show();
	// $("#backDetail_"+idValue).hide();
	$( "#backDetail_" + idValue ).slideToggle( "slow" );
	$( "#showDetail_" + idValue ).slideToggle( "slow" );
}

function showOfferpage( idValue ) {
	// $("#backDetail_"+idValue).show();
	// $("#showDetail_"+idValue).hide();
	$( "#showDetail_" + idValue ).slideToggle( "slow" );
	$( "#backDetail_" + idValue ).slideToggle( "slow" );
}

function openachpayment() {
	$( "#achPaymentDocument" ).modal( "show" );
}

function applicationBtn() {
	$( "#memberLogin" ).css( "display", "none" );
	$( "#applicationLogin" ).css( "display", "block" );
	$( "#app" )
	.removeClass( "borderNone" )
	.addClass( "borderBlock" );
	$( "#member" )
	.removeClass( "borderBlock" )
	.addClass( "borderNone" );
}

function memberBtn() {
	$( "#applicationLogin" ).css( "display", "none" );
	$( "#memberLogin" ).css( "display", "block" );
	$( "#member" )
	.removeClass( "borderNone" )
	.addClass( "borderBlock" );
	$( "#app" )
	.removeClass( "borderBlock" )
	.addClass( "borderNone" );
	$( "#applicationSignin" ).trigger( "reset" );
	$( "#applicationSignin" )
	.validate()
	.resetForm();
	$( "#signinBtn" )
	.removeClass( "blueBtn" )
	.addClass( "lightBlueBtn" );

	$( "#applicationSigninerror" ).hide();
	$( "#applicationSigninsuccess" ).hide();
}
function printDocument( div ) {
	$( "#cssforPrint" ).show();
	const divToPrint = $( "#policyDocument .modal-body" ).html();
	const newWin = window.open( "", "Print-Window" );
	newWin.document.open();
	newWin.document.write( '<html><body onload="window.print()">' + divToPrint + "</body></html>" );
	newWin.document.close();
	setTimeout( function() {
		newWin.close();
	}, 10 );
}
function printDocument1( div ) {
	const divToPrint = $( "#" + div + " .modal-body" ).html();
	const newWin = window.open( "", "Print-Window" );
	newWin.document.open();
	newWin.document.write( '<html><body onload="window.print()">' + divToPrint + "</body></html>" );
	newWin.document.close();
	setTimeout( function() {
		newWin.close();
	}, 10 );
}
function downloadDocument( dockey ) {
	const openUrl = "downloadconsentpdf?docKey=" + dockey;
	window.open( openUrl );

	/* $.ajax({
		url: '/downloadconsentpdf',
		data: {
			'docKey': dockey
		},
		dataType: 'json',
		type: 'get',
		success: function(res) {
			//window.location =	res.filename;
			alert("res:"+res);
		}
	});*/
}
function proceessnextpage() {
	$( "#popupsubmit" ).val( "1" );
	$( "#financedAmount" ).val( $( "#temploanamount" ).val() );
	document.getElementById( "financedata" ).submit();
}
function proceesloanfailure() {
	$( "#denyreasonmodel" ).modal( "hide" );
}

function proceessusernextpage() {
	$( "#popupsubmit" ).val( "1" );
	$( "#financedAmount" ).val( $( "#temploanamount" ).val() );

	let financedAmount = $( "#financedAmount" ).val();
	financedAmount = parseFloat( financedAmount.replace( /,/g, "" ).replace( "$", "" ) );

	let annualincome = $( "#annualincome" ).val();
	annualincome = parseFloat( annualincome.replace( /,/g, "" ).replace( "$", "" ) );

	$.ajax( {
		url: "/updateuserAnticipatedAmount",
		data: {
			annualincome: annualincome,
			financedAmount: financedAmount
		},
		dataType: "json",
		type: "POST",
		beforeSend: function() {},
		complete: function() {},
		success: function( res ) {
			if( res.status == 200 ) {
				window.location.href = "/applicationoffer";
			} else {
				$( "#denyreasonmodel" ).modal( "hide" );
			}
		}
	} );
}
function proceesuserloanfailure() {
	$( "#denyreasonmodel" ).modal( "hide" );
}

function submitmanualuserinfoform() {
	$( "#submitconfirmation" ).modal( "hide" );

	setTimeout( function() {
		$( "#userinfoError" ).html( "" );
		$( "#userinfoBtn" ).attr( "disabled", true );
		// $("#submitconfirmation").attr("disabled", true);
		$( "#userinfofullmanualData" ).validate().cancelSubmit = true;

		anim = lottie.loadAnimation( params );
		$( "#ajaxLoaderPlaid" ).modal( "show" );

		$.ajax( {
			url: "/userinfofullmanualdata",
			type: "post",
			data: $( "#userinfofullmanualData" ).serialize(),
			dataType: "json",
			beforeSend: function() {},
			complete: function() {},
			success: function( res ) {
				if( res.status == 200 ) {
					const minloanamount = parseInt( $( "#minloanamount" ).val() );
					const maxloanamount = parseInt( $( "#maxloanamount" ).val() );
					const minincomeamount = parseInt( $( "#minincomeamount" ).val() );

					let financedAmount = $( "#financedAmount" ).val();
					financedAmount = parseFloat( financedAmount.replace( /,/g, "" ).replace( "$", "" ) );

					let incomeamount = $( "#annualincome" ).val();
					incomeamount = parseFloat( incomeamount.replace( /,/g, "" ).replace( "$", "" ) );

					// To block click to save option
					$( ".clicktosavetooltip" ).hide();

					if( parseFloat( incomeamount ) < minincomeamount ) {
						$( "#ajaxLoaderPlaid" ).modal( "hide" );
						setTimeout( function() {
							$( "#denyreasonlowincomemodel" ).modal( "show" );
						}, 500 );
					} else {
						$.ajax( {
							url: "/loanamountconfirm",
							data: {
								incomeamount: incomeamount,
								financedAmount: financedAmount
							},
							dataType: "json",
							type: "POST",
							success: function( res ) {
								$( "#ajaxLoaderPlaid" ).modal( "hide" );
								$( "#userinfoBtn" ).attr( "disabled", false );

								if( res.status == 300 ) {
									$( "#temploanamount" ).val( "0" );
									$( "#denyreasonmodel" ).modal( "show" );
									$( "#temploanamount" )
									.val( res.prequalifiedAmount )
									.maskMoney( { prefix: "$ ", allowNegative: true, thousands: ",", allowZero: true, decimal: "." } )
									.trigger( "mask.maskMoney" );
									$( "#maxloantxt" ).hide();
									$( "#minloantxt" ).hide();
									if( res.minmaxchangeTxt == 1 ) {
										$( "#minloantxt" ).show();
									} else {
										$( "#maxloantxt" ).show();
									}

									$( "#qualifiedAmount" ).html( res.maxprequalifiedAmount );
									// return false;
								} else if( res.status == 600 ) {
									$( "#denyreasonlowincomemodel" ).modal( "show" );
									// return false;
								} else if( res.status == 200 || res.status == 400 || res.status == 500 ) {
									$( "#popupsubmit" ).val( "1" );
									window.location.href = "/applicationoffer";
								} else {
									// return false;
									// $('#userinfoError').html('Unable to register user');
									// $("#submitconfirmation").attr("disabled", true);
									// $("#userinfofullmanualData").validate().cancelSubmit = true;
									// return false;
								}
							}
						} );
					}
				} else if( res.status == 500 ) {
					window.location.href = "/loanfailure";
				} else {
					$( "#ajaxLoaderPlaid" ).modal( "hide" );
					$( "#userinfoBtn" ).attr( "disabled", false );
					$( "#userinfoError" ).html( res.message );
					$( "#submitconfirmation" ).attr( "disabled", true );
					$( "#userinfofullmanualData" ).validate().cancelSubmit = true;
				}
			}
		} );
	}, 500 );
}

function formatUSPhoneNumber(value) {
	let returnVal = value;

	if(!!returnVal){
		returnVal = returnVal.replace(/[^\d]/g,"");
	}
	const length = returnVal.length;

	if (length > 3) {
		returnVal = [returnVal.slice(0, 3),"-", returnVal.slice(3)].join('');
	}

	if (length > 6) {
		returnVal = [returnVal.slice(0, 7), "-", returnVal.slice(7)].join('');
	}

	return returnVal;
}
