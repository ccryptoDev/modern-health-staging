$(document).ready(function () {

	if (document.getElementById('adduser')) {
		$("#practiceoption").hide();
	}

	/*if(document.getElementById('approvePatientLoanbtn'))
		{
		$("#approvePatientLoanbtn").hide();
	}*/
	// staging comment
	$.validator.addMethod("check_date_of_birth", function (value, element) {

		/*var day = $("#dob_day").val();
		var month = $("#dob_month").val();
		var year = $("#dob_year").val();*/

		var pieces = value.split("/");
		var month = pieces[0];
		var day = pieces[1];
		var year = pieces[2];
		var age = 18;

		var mydate = new Date();
		mydate.setFullYear(year, month - 1, day);

		var currdate = new Date();
		currdate.setFullYear(currdate.getFullYear() - age);

		return currdate > mydate;

	}, "You must be at least 18 years of age.");

	//$('#PhoneNumber,.PhoneNumber').mask('(000) 000-0000');

	$("#adduser").validate({
		rules: {
			name: {
				required: true,
				minlength: 3
			},
			email: {
				required: true,
				email: true
			},
			phoneNumber: {
				required: true,
				//minlength:10,
				//maxlength:10,
				//digits: true
			},
			role: {
				required: true
			}
		},
		messages: {
			name: {
				required: "Please enter username",
				minlength: "Enter atleast three characters"
			},
			email: {
				required: "Please enter email address",
				email: "Please enter valid email address"
			},
			phoneNumber: {
				required: "Please enter phone number"
			},
			role: {
				required: "Please select role"
			},
			practiceId: {
				required: "Please select practice name"
			}
		},
		errorPlacement: function (error, element) {
			if (element.attr("name") == "role") {
				error.appendTo('#error_role');
				return;
			}
			else if (element.attr("name") == "practiceId") {
				error.appendTo('#error_practice');
				return;
			}
			else {
				error.insertAfter(element);
			}
		}
	});


	$("#edituser").validate({
		rules: {
			name: {
				required: true,
				minlength: 3
			},
			email: {
				required: true,
				email: true
			},
			phoneNumber: {
				required: true,
				//minlength:10,
				//maxlength:10,
				//digits: true
			},
			role: {
				required: true
			}
		},
		messages: {
			name: {
				required: "Please enter username",
				minlength: "Enter atleast three characters"
			},
			email: {
				required: "Please enter email address",
				email: "Please enter valid email address"
			},
			phoneNumber: {
				required: "Please enter phone number"
			},
			role: {
				required: "Please select role"
			}
		},
		errorPlacement: function (error, element) {
			if (element.attr("name") == "role") {
				error.appendTo('#error_editrole');
				return;
			}
			else {
				error.insertAfter(element);
			}
		}
	});

	$("#loanapproveform").validate({
		rules: {
			loanstartdate: {
				required: true
			}
		},
		messages: {
			loanstartdate: {
				required: "Please select Loan start date",
			}
		},
		errorPlacement: function (error, element) {
			if (element.attr("name") == "loanstartdate") {
				error.insertAfter("#loanstartdiv");
				return;
			}
		}
	});

	$("#updatepatientloanstartdateform").validate({
		rules: {
			updateloanstartdate: {
				required: true
			}
		},
		messages: {
			updateloanstartdate: {
				required: "Please select Loan start date",
			}
		},
		errorPlacement: function (error, element) {
			if (element.attr("name") == "updateloanstartdate") {
				error.insertAfter("#loanstartdiv1");
				return;
			}
		}
	});

	//-- button for loan set date
	$('#setDatebtn').click(function () {

		if ($("#loanapproveform").valid()) {
			updateSetDate();
		}
	});

	$('#setPreferredButton').click(function () {
		updatePreferredDate();
	});

	$('#approvePatientLoanbtn').click(function () {

		if ($("#loanapproveform").valid()) {
			document.getElementById("loanapproveform").submit();
		}
	});
	$('#updatePatientLoanbtn').click(function () {

		if ($("#updatepatientloanstartdateform").valid()) {
			document.getElementById("updatepatientloanstartdateform").submit();
		}
	});


	$("#loginForm").validate({
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
				required: "Please enter email address",
				email: "Please enter valid email address"
			},
			password: {
				required: "Please enter password"
			}
		}
	});
	$.validator.addMethod("verifyPhoneNumber", function (value, element) {
		if (!value) {
			return false;
		}
		const modifiedNumber = value.replace(/[^\d]/g, "");
		return new RegExp(/^[0-9]{10}$/).test(modifiedNumber);
	});
	$("#addNewUserByCustomerService").validate({
		ignore: [],
		rules: {
			firstname: {
				required: true
			},
			lastname: {
				required: true
			},
			email: {
				required: true,
				email: true
			},
			ssn_number: {
				required: true
			},
			dob: {
				required: true
			},
			street_name: {
				required: true
			},
			city: {
				required: true
			},
			state: {
				required: true
			},
			zip_code: {
				required: true
			},
			phone: {
				verifyPhoneNumber: true,
				required: true
			},
			practicemanagement: {
				required: true
			},
			residenceType: {
				required: true
			},
			incomeamount: {
				required: true
			},
			housingExpense: {
				required: true
			},
			creditpullconfirm: {
				required: true
			}
			// acceptconsent1: {
			// 	required: true
			// },
			// acceptconsent2: {
			// 	required: true
			// },
			// acceptconsent3: {
			// 	required: true
			// },
			// acceptconsent4: {
			// 	required: true
			// }
			/* kuber:{
				required: true
			}
			 "acceptconsent[]": {
				required: true,
				minlength: 1
			} */
		},
		messages: {
			firstname: {
				required: "Please enter your first name."
			},
			lastname: {
				required: "Please enter your last name."
			},
			email: {
				required: "Please enter your email address.",
				email: "Please enter a valid email address."
			},
			ssn_number: {
				required: "Please enter your social security number."
			},
			dob: {
				required: "Please enter date of birth."
			},
			street_name: {
				required: "Please enter your street name."
			},
			city: {
				required: "Please enter your city."
			},
			state: {
				required: "Please enter your state."
			},
			zip_code: {
				required: "Please enter your zip code."
			},
			phone: {
				verifyPhoneNumber: "Please enter a valid telephone number.",
				required: "Please enter your telephone number."
			},
			practicemanagement: {
				required: "Please select a practice."
			},
			residenceType: {
				required: "Please select a type of residence."
			},
			incomeamount: {
				required: "Please enter a monthly income."
			},
			housingExpense: {
				required: "Please enter a housing expense."
			},
			creditpullconfirm: {
				required: "Please select the consent checkbox."
			}
		},
		errorPlacement: function (error, element) {
			if (element.attr("name") === "acceptConsentHidden") {
				$("#ConsentErrorres").append(error);
				$("#ConsentErrorres").show();
			} else {
				error.insertAfter(element);
			}
		}
	});


	$("#changepass").validate({
		rules: {
			oldpassword: {
				required: true
			},
			newpassword: {
				required: true
			},
			confirmpassword: {
				required: true,
				equalTo: "#newpassword"
			}
		},
		messages: {
			oldpassword: {
				required: "Please enter old password"
			},
			newpassword: {
				required: "Please enter new password"
			},
			confirmpassword: {
				required: "Please enter confirm password"
			}
		}

	});


	$("#adduser").validate({
		rules: {
			username: {
				required: true
			},
			useremail: {
				required: true
			},
			userphone: {
				required: true,
			},
			userrole: {
				required: true,
			}
		},
		messages: {
			username: {
				required: "Please enter name"
			},
			useremail: {
				required: "Please enter email"
			},
			userphone: {
				required: "Please enter phone number"
			},
			userrole: {
				required: "Please enter role"
			}
		}

	});


	$("#forgot").validate({
		rules: {
			email: {
				required: true,
				email: true
			}

		},
		messages: {

			email: {
				required: "Please enter email",
				email: "Please enter valid email address"
			}

		}

	});

	$("#createapp").validate({
		rules: {
			street_name: {
				required: true,
			},
			/*untiapt: {
			  required: true
			},*/
			city: {
				required: true
			},
			state: {
				required: true
			},
			zip_code: {
				required: true,
			},
			dob: {
				required: true,
			},
			/*ssn_number: {
			  required: true
			},*/

		},
		messages: {

			street_name: {
				required: "Please enter your street name."
			},
			/*untiapt:{
				required:  "Please enter unit/appartment"
			},*/
			city: {
				required: "Please enter your city."
			},
			state: {
				required: "Please choose your state."
			},
			dob: {
				required: "Please enter a valid date of birth.",
			},
			zip_code: {
				required: "Please enter your zip code."
			},
			/*ssn_number:{
				required:  "Please enter social security number"
			},*/


		}

	});

	$("#transunionaddform").validate({
		rules: {
			first_name: {
				required: true
			},
			street_name: {
				required: true
			},
			city: {
				required: true
			},
			last_name: {
				required: true
			},
			state: {
				required: true
			},
			zip_code: {
				required: true
			},
			email: {
				required: true,
				email: true
			},
			dob: {
				required: true,
				check_date_of_birth: true
			},
		},
		messages: {

			first_name: {
				required: "Please enter first name"
			},
			street_name: {
				required: "Please enter street name"
			},
			city: {
				required: "Please enter city"
			},
			last_name: {
				required: "Please enter last name"
			},
			state: {
				required: "Please select state"
			},
			zip_code: {
				required: "Please enter zip code"
			},
			email: {
				required: "Please enter email address",
				email: "Please enter valid email address"
			},
			dob: {
				required: "Please enter valid date of birth",
			},
			agree: {
				required: "Please agree terms and condition"
			}
		},
		errorPlacement: function (error, element) {
			if (element.attr("name") == "agree") {
				error.appendTo('#error_agree');
				return;
			}
			else if (element.attr("name") == "dob") {
				error.appendTo('#error_dob');
				return;
			}
			else {
				error.insertAfter(element);
			}
		},
		submitHandler: function () {

			$.ajax({
				url: '/admin/transunionaddform',
				type: 'post',
				//data:$('#transunionaddform :input'),
				data: $('#transunionaddform').serialize(),
				dataType: 'json',
				beforeSend: function () {
					$('#transunionmessage').html('<div class="pull-center"><img src="/images/img/ajaxloader.gif" class="img-responsive center-block" alt="User Image"></div>');
				}
				, complete: function () {

				}
				, success: function (res) {
					//alert("status:"+res.status);
					//alert("message:"+res.message);
					if (res.status == 200) {
						$('#transunionmessage').html('<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Success!</strong>' + res.message + '</div>');
						//$(".alert").fadeOut(5000);
						/*setTimeout(function(){
							location.reload();
						}, 6000);*/

						$('.alert').fadeOut(3000, function () {
							location.reload();
						});

						return false;
					}
					else {
						$('#transunionmessage').html('<div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Danger!</strong>' + res.message + '</div>');
						$(".alert").fadeOut(5000);
						return false;
					}
				}
			});
			return false;
		}
	});

	$("#screentrackcomments").validate({
		rules: {
			subject: {
				required: true
			},
			comments: {
				required: true
			}
		},
		messages: {
			subject: {
				required: "Please enter subject"
			},
			comments: {
				required: "Please enter comments"
			}
		},
		submitHandler: function () {
			$("#commentIncomplete").attr("disabled", true);
			var subject = $("#subject").val();
			var comments = $("#comments").val();
			var screentrackingID = $("#screentrackingID").val();
			var userId = $("#userId").val();
			$.ajax({
				url: '/admin/addScreentrackingComments',
				data: {
					'subject': subject,
					'comments': comments,
					'screentrackingID': screentrackingID
				},
				dataType: 'json',
				type: 'POST',
				success: function (res) {
					$("#commentIncomplete").attr("disabled", false);

					if (res.status == 200) {
						fetchScreentrackingCommentsList(userId);
						$("#subject").val('');
						$("#comments").val('');
						return false;
					}
					else {

						return false;
					}
				}
			});
		}
	});

	/*update phonenumber start*/
	/*update phonenumber end*/


	$("#changenameform").validate({
		rules: {
			name: {
				required: true
			}
		},
		messages: {
			name: {
				required: "Please enter user full name"
			}
		},
		errorPlacement: function (error, element) {
			error.appendTo('#nameerror');
			return;
		},
		submitHandler: function () {

			$.ajax({
				url: '/admin/updateUserNameDetails',
				type: 'post',
				data: $('#changenameform').serialize(),
				dataType: 'json',
				beforeSend: function () {
					$('#namemessage').html('<div class="pull-center"><img src="/images/img/ajaxloadersmall.gif" class="img-responsive center-block" alt="Loader Image"></div>');
				}
				, complete: function () {

				}
				, success: function (res) {
					if (res.status == 200) {
						$('#usernameData').html(res.name);
						$('#namemessage').html('<div style="color:green" class="alertdiv"><strong>Success! </strong>' + res.message + '</div>');
						$(".alertdiv").fadeOut(5000, function () {
							editNameDetails();
							location.reload();
						});
						return false;
					}
					else {
						$('#namemessage').html('<div style="color:red" class="alertdiv"><strong>Danger! </strong>' + res.message + '</div>');
						$(".alertdiv").fadeOut(5000);
						return false;
					}
				}
			});
			return false;
		}
	});



	$("#changeaddressform").validate({
		rules: {
			addressdata: {
				required: true
			}
		},
		messages: {
			addressdata: {
				required: "Please enter valid address details"
			}
		},
		errorPlacement: function (error, element) {
			error.appendTo('#addressrror');
			return;
		},
		submitHandler: function () {
			$.ajax({
				url: '/admin/updateAddressDetails',
				type: 'post',
				data: $('#changeaddressform').serialize(),
				dataType: 'json',
				beforeSend: function () {
					$('#addressmessage').html('<div class="pull-center"><img src="/images/img/ajaxloadersmall.gif" class="img-responsive center-block" alt="Loader Image"></div>');
				}
				, complete: function () {

				}
				, success: function (res) {
					if (res.status == 200) {
						$('#addressdata').html(res.data);
						$('#addressmessage').html('<div style="color:green" class="alertaddressdiv"><strong>Success! </strong>' + res.message + '</div>');
						$(".alertaddressdiv").fadeOut(5000, function () {
							document.getElementById("changeaddressdiv").style.display = "none";
							location.reload();
						});
						return false;
					}
					else {
						$('#addressmessage').html('<div style="color:red" class="alertdiv"><strong>Danger! </strong>' + res.message + '</div>');
						$(".alertaddressdiv").fadeOut(5000);
						return false;
					}
				}
			});
			return false;
		}
	});


	/*$("#addPractice").validate({
			rules: {
				ContactNames:{required: true}
				},
			messages: {
				ContactNames:{required: "Please Enter Contact Name"},
			}
		});*/


	$("#addPractice").validate({
		rules: {
			ContactName: {
				required: true
			},
			PracticeEmail: {
				required: true,
				email: true
			},
			PracticeName: {
				required: true
			},
			PracticeUrl: {
				required: true
			},
			LocationName: {
				required: true
			},
			StreetAddress: {
				required: true
			},
			City: {
				required: true
			},
			StateCode: {
				required: true
			},
			ZipCode: {
				required: true
			},
			PhoneNo: {
				minlength: 10,
				maxlength: 10,
				digits: true,
				required: true
			}
		},
		messages: {
			ContactName: {
				required: "Please enter a contact name."
			},
			PracticeEmail: {
				required: "Please enter your email address.",
				email: "Please enter a valid email address."
			},
			PracticeName: {
				required: "Please enter the name of the Practice."
			},
			PracticeUrl: {
				required: "Please enter the url for the Practice."
			},
			LocationName: {
				required: "Please enter the name of the location."
			},
			StreetAddress: {
				required: "Please enter the street address."
			},
			City: {
				required: "Please enter the city name."
			},
			StateCode: {
				required: "Please enter the state."
			},
			ZipCode: {
				required: "Please enter the zip code."
			},
			PhoneNo: {
				required: "Please enter the telephone number."
			}
		},
		errorPlacement: function (error, element) {
			if (element.attr("name") == "PracticeUrl") {
				error.insertAfter($(".input-group"));
			} else {
				error.insertAfter(element);
			}
		},
		submitHandler: function () {
			var $form = $("#addPractice");
			$form.get(0).submit();
			// var validator =	$( "#addPractice" ).validate();
			// var urlSlug	= $("#practiceUrl").val();
			// $("#addnewpractice").attr("disabled", true);
			// $.ajax({
			// 	url: '/admin/checkpracticeurl',
			// 	data: {
			// 		'urlSlug': urlSlug
			// 	},
			// 	dataType: 'json',
			// 	type: 'get',
			// 	success: function(res) {
			// 		$("#addnewpractice").attr("disabled", false);
			// 		if( res.status=='200' ) {
			// 			checkcreditcard();
			// 		} else {
			// 			validator.showErrors( {
			// 				"PracticeUrl": "Practice url already exists in the system."
			// 			} );
			// 			$('html,body').scrollTop(0);
			// 			return false;
			// 		}
			// 		return false;
			// 	}
			// });
		}
	});


	$("#editpractice").validate({
		ignore: ":not(:visible)",
		rules: {
			ContactName: {
				required: true
			},
			PracticeEmail: {
				required: true,
				email: true
			},
			PracticeName: {
				required: true
			},
			LocationName: {
				required: true
			},
			StreetAddress: {
				required: true
			},
			City: {
				required: true
			},
			StateCode: {
				required: true
			},
			ZipCode: {
				required: true
			},
			PhoneNo: {
				minlength: 10,
				maxlength: 10,
				digits: true,
				required: true
			}
		},
		messages: {
			ContactName: {
				required: "Please enter the name of the contact."
			},
			PracticeEmail: {
				required: "Please enter an email address.",
				email: "Please enter a valid email address."
			},
			PracticeName: {
				required: "Please enter the name of the Practice."
			},
			PracticeUrl: {
				required: "Please enter the url for the Practice."
			},
			LocationName: {
				required: "Please enter the name of location."
			},
			StreetAddress: {
				required: "Please enter the street address."
			},
			City: {
				required: "Please enter the name of the city."
			},
			StateCode: {
				required: "Please enter the state."
			},
			ZipCode: {
				required: "Please enter the zip code."
			},
			PhoneNo: {
				required: "Please enter the telephone number."
			}
		},
		submitHandler: function () {
			var $form = $('#editpractice');
			$form.get(0).submit();
			// checkcreditcard1();
			// return false;
		}
	});

	$("#practiceAdminAddUser").validate({
		rules: {
			schoolName: {
				required: true
			},
			BranchName: {
				required: true
			},
			roleId: {
				required: true
			},
			Username: {
				required: true,
			},
			firstname: {
				required: true
			},
			lastname: {
				required: true
			},
			email: {
				required: true,
				email: true
			},
			phoneNumber: {
				required: true
			},
			status: {
				required: true
			}
		},
		messages: {
			schoolName: {
				required: "Please enter contact name"
			},
			BranchName: {
				required: "Please enter location"
			},
			roleId: {
				required: "Please select the role"
			},
			Username: {
				required: "Please enter username"
			},
			firstname: {
				required: "Please enter first name"
			},
			lastname: {
				required: "Please enter last name"
			},
			email: {
				required: "Please enter email address",
				email: "Please enter valid email address"
			},
			phoneNumber: {
				required: "Please enter phone number"
			},
			status: {
				required: "Please select status"
			}
		}
	});
	// Mask Money
	$("#loan_amount").maskMoney({ prefix: '$ ', allowNegative: true, thousands: ',', allowZero: true, decimal: '.' }).trigger('mask.maskMoney');
	$("#user_income").maskMoney({ prefix: '$ ', allowNegative: true, thousands: ',', allowZero: true, decimal: '.' }).trigger('mask.maskMoney');

	$("#manualincome").maskMoney({ prefix: '$ ', allowNegative: true, thousands: ',', allowZero: true, decimal: '.' }).trigger('mask.maskMoney');
	$("#manualloanAmount").maskMoney({ prefix: '$ ', allowNegative: true, thousands: ',', allowZero: true, decimal: '.' }).trigger('mask.maskMoney');
	$(".loanTermAmt").maskMoney({ prefix: '', allowNegative: false, thousands: ',', allowZero: true, decimal: '.' }).trigger('mask.maskMoney');

	$.validator.addMethod(
		"newloanamountcheck",
		function (value, element, params) {
			var validator = this;
			var inputValue = parseFloat(value.replace(/,/g, "").replace("$", ""));
			var minloanamount = parseInt($("#minloanamount").val());
			var oldamount = parseInt($("#oldloanamount").val());
			if (inputValue > 0) {
				if (oldamount > inputValue) {
					if (minloanamount > inputValue) {
						validator.showErrors({
							"loan_amount": "Sorry, that financed amount does not meet the minimum threshold."
						});
						$("#offerlisting").html("");
						return false;
					}
					else {
						console.log("111");
					}
					return true;
				}
				else {
					return false;
				}
			}
			else {
				return false;
			}
		}, "New requested loan should not be greater than old loan amount."
	);

	$.validator.addMethod("dollarAmount", dollarAmount, "Please enter the amount");
	function dollarAmount(value, element) {
		var inputValue = parseFloat(value.replace(/[^0-9.]/g, ""));
		return (inputValue > 0);
	}
	$.validator.addMethod("userincomeValid", userincomeValid, "Please enter the amount");
	function userincomeValid(value, element) {
		var inputValue = parseFloat(value.replace(/[^0-9.]/g, ""));
		if (inputValue >= 1 && inputValue <= 10000) {
			return true
		}
	}
	$.validator.addMethod("paymentCountValid", paymentCountValid, "Please enter the amount");
	function paymentCountValid(value, element) {
		var inputValue = parseFloat(value.replace(/[^0-9.]/g, ""));
		if (inputValue >= 1 && inputValue <= 72) {
			return true
		}
	}
	$.validator.addMethod("dollarAmountInclude0", dollarAmountInclude0, "Please enter the amount");
	function dollarAmountInclude0(value, element) {
		var inputValue = parseFloat(value.replace(/[^0-9.]/g, ""));
		return (inputValue > 0);
	}
	$.validator.addMethod("downpaymentValid", downpaymentValid, "Please enter the amount");
	function downpaymentValid(value, element) {
		var inputValue = parseFloat(value.replace(/[^0-9.]/g, ""));
		if (inputValue >= 1 && inputValue <= 10000) {
			return true
		}
	}
	$.validator.addMethod("downpaymentValid", downpaymentValid, "Please enter the amount");
	function downpaymentValid(value, element) {
		var inputValue = parseFloat(value.replace(/[^0-9.]/g, ""));
		if (inputValue >= 1 && inputValue <= 10000) {
			return true
		}
	}
	$.validator.addMethod("greaterThan", greaterThan, "Invalid value");
	function greaterThan(value, element, param) {
		var a = parseFloat(value.replace(/[^0-9.]/g, ""), 10);
		var b = parseFloat($(param).val().replace(/[^0-9.]/g, ""), 10);
		if (a > b && a >= 1 && a <= 10000) {
			return true
		}
	}

	$.validator.addMethod("apr", apr, "APR is required");
	function apr(value, element, param) {
		if ($("#counterMode").val() == "manual") {
			var a = parseFloat(value.replace(/[^0-9.]/g, ""), 10);
			console.log('apr...', a);
			if (isNaN(a) || (a == undefined) || (a < 0) || (a < 1) || (a > 50)) {
				return false;
			}
		}
		return true;
	}


	window.changeLoanFormValidator = $("#changeLoanFormValidate").validate({
		rules: {
			loanamount: { required: true, dollarAmount: true, greaterThan: "#downpayment" },
			downpayment: { required: true, dollarAmountInclude0: true, downpaymentValid: true },
			userincome: { required: true, dollarAmount: true, userincomeValid: true },
			apr: { apr: true },
			paymentCount: { required: true, digits: true, paymentCountValid: true }
		},
		messages: {
			loanamount: {
				required: "Please enter a procedure cost",
				dollarAmount: "Please enter the procedure cost",
				greaterThan: "Please enter a valid amount. Should be more than 1, less than maximum loan amount and more than down payment",
			},
			downpayment: {
				required: "Please enter a down payment amount",
				dollarAmountInclude0: "Please enter the down payment amount",
				downpaymentValid: "Should be more than 1 and less than 10000"
			},
			userincome: {
				required: "Please enter a monthly income",
				dollarAmount: "Please enter the monthly income",
				userincomeValid: "Should be more than 1 and less than 10000"
			},
			apr: {
				apr: "APR is required. Should be more than 1 and less than maximum APR"
			},
			paymentCount: {
				required: "Please enter the number of monthly payments",
				digits: "Term must be a whole number",
				paymentCountValid: "Should be more than 1 and less than maximum term"
			}
		}
	});

	$("#changeLoanmanually").validate({

		rules: {
			manualincome: {
				required: true,
				requiredcheck1: true
			},
			manualloanAmount: {
				required: true,
				requiredcheck: true
			},
			manualApr: {
				required: true,
				number: true
			},
			manualTerm: {
				required: true
			}
		},
		messages: {
			manualloanAmount: {
				required: "Please enter loan amount"
			},
			manualApr: {
				required: "Please Enter APR value"
			},
			manualTerm: {
				required: "Please select month term"
			}
		},
		submitHandler: function () {
			var minloanamount = parseInt($("#minloanamount").val());
			var maxloanamount = parseInt($("#maxloanamount").val());
			var minincomeamount = parseInt($("#minincomeamount").val());
			var maxaprrate = parseFloat($("#maxaprrate").val());
			var loan_amount = parseFloat($("#manualloanAmount").val().replace(/,/g, "").replace("$", ""));
			var user_income = parseFloat($("#manualincome").val().replace(/,/g, "").replace("$", ""));
			var apr = parseFloat($("#manualApr").val());
			var term = parseInt($("#manualTerm").val());
			loan_amount = parseFloat(loan_amount);
			user_income = parseFloat(user_income);
			var oldamount = parseInt($("#oldloanamount").val());
			var screenId = $("#screenid").val();
			var pagename = $("#pagename").val();
			var userrole = $("#userrole").val();

			$('#manualofferlisting').html('<div class="pull-center"><img src="/images/img/ajax-loader.gif" class="img-responsive center-block" alt="User Image"></div>');
			if (loan_amount > oldamount && (userrole != 'Admin' && userrole != 'PracticeAdmin')) {
				$("#manualofferlisting").html("New requested loan should not be greater than old loan amount");
				$("#manualofferlisting").addClass('error');
				return false;
			}
			else if (loan_amount < minloanamount) {
				$("#manualofferlisting").html("Sorry, that financed amount does not meet the minimum threshold.");
				$("#manualofferlisting").addClass('error');
				return false;
			}
			else if (loan_amount > maxloanamount) {
				$("#manualofferlisting").html("Sorry, that financed amount does not meet the maximum threshold.");
				$("#manualofferlisting").addClass('error');
				return false;
			}
			else if (user_income < minincomeamount) {
				$("#manualofferlisting").html("Income amount should be greater than $" + minincomeamount);
				$("#manualofferlisting").addClass('error');
				return false;
			}
			else if (apr == 0) {
				$("#manualofferlisting").html("APR should be atleast 1");
				$("#manualofferlisting").addClass('error');
				return false;
			}
			else if (apr > maxaprrate) {
				$("#manualofferlisting").html("APR should not be greater than " + maxaprrate);
				$("#manualofferlisting").addClass('error');
				return false;
			}
			else {
				$.ajax({
					url: '/admin/manualLoanOfferDetails',
					data: {
						'manualincome': user_income,
						'manualloanAmount': loan_amount,
						'manualApr': apr,
						'manualTerm': term,
						'screenId': screenId,
						'pagename': pagename,
						'requesttype': 'view',
						'oldamount': oldamount
					},
					dataType: 'json',
					type: 'post',
					success: function (res) {
						if (res.status == '200') {
							$("#manualofferlisting").removeClass('error');
							$("#manualofferlisting").html(res.listdata);
						}
						else {
							//alert(message);
							$("#manualofferlisting").html(res.message);
							$("#manualofferlisting").addClass('error');
						}
						return false;
					}
				});
			}
			return false;

		}
	});



	/*
		$("#changeLoanDom").click(function(){
			$.ajax({
				url: "/admin/viewIncomplete", success: function(res){
				$("#loanAmountDetails").html(res);
			}});
		});*/

});

function manualLoanUpdateForm(btn) {
	if (confirm('Are you sure you want to update this loan manually?')) {
		document.getElementById(btn).disabled = true;
		document.getElementById("changeLoanDom").disabled = true;
		$('.' + btn).html('<div class="pull-center"><img src="/images/img/ajax-loader.gif" class="img-responsive center-block" alt="User Image"></div>');
		$.ajax({
			url: '/admin/savemanualLoanOfferDetails',
			data: $('#manualLoanupdateform').serialize(),
			dataType: 'json',
			type: 'post',
			success: function (res) {
				window.location.href = "/admin/" + res.pagename;
			}
		});
	}
	else {

	}
}

function savenewloanamount() {
	$('#loaderid').show();
	var pagename = $("#pagename").val();
	var loanamount = $("#loanamount").val();
	var downpayment = $("#downpayment").val();
	var userincome = $("#userincome").val();
	var screenId = $("#screenid").val();
	var offers = $("#offers").val();
	var paymentid = $("#paymentid").val();
	var offerid = $('input[name=offerarray]:checked').val(); //array index choosen
	var apr = $("#apr").val();
	var term = $("#paymentCount").val();
	var tier = $("#tier").val();
	document.getElementById("changeloanformbtn").disabled = true;
	$('#changeLoanLoader').html('<div class="pull-center"><img src="/images/img/ajax-loader.gif" class="img-responsive center-block" alt="User Image"></div>');
	$.ajax({
		url: '/admin/updateNewloanincomedetails',
		data: {
			'pagename': pagename,
			'userincome': userincome,
			'loanamount': loanamount,
			'downpayment': downpayment,
			'paymentid': paymentid,
			'screenid': screenId,
			'offerid': offerid,
			"offers": offers,
			"apr": apr,
			"term": term,
			"tier": tier
		},
		dataType: 'json',
		type: 'post',
		success: function (res) {
			$('#changeLoanLoader').html('');
			window.location.href = "/admin/" + res.pagename;
		}
	});
	return false;
}





if (document.getElementById('birthdatepicker')) {
	var start = new Date();
	start.setFullYear(start.getFullYear() - 100);
	var end = new Date();
	end.setFullYear(end.getFullYear() - 18);
	$('#birthdatepicker').datepicker({
		weekStart: 2,
		startDate: start,
		endDate: end
	}).on('changeDate', function (ev) {
		$('#birthdatepicker').datepicker('hide');
	});


}
$(function () {
	$("#datepicker2").datepicker({ startDate: new Date() });
	$(".datepickerClass").datepicker();

	var start = new Date();
	start.setFullYear(start.getFullYear() - 100);
	var end = new Date();
	end.setFullYear(end.getFullYear() - 18);

	var opts = {
		weekStart: 2,
		startDate: start,
		endDate: end
	};
	$("#datepicker").datepicker(opts).on('changeDate', function (ev) {
		$('#datepicker').datepicker('hide');
	});
	let nextPay = $("#nextPayDateVal").val();
	let newDate;
	if (nextPay) {
		let parts = nextPay.split('-');
		newDate = new Date(parts[0], parts[1] - 1, parts[2]);
	} else {
		newDate = new Date();
	}
	const preferredDate = $("#preferredDateHidden").val();

	$("#preferredDueDate").val(preferredDate);

	$('#loanstartdate').datepicker({ startDate: new Date(), minDate: new Date() }).on('changeDate', function (ev) {
		$(this).valid();
		$('#loanstartdate').datepicker('hide');
	});
	$('#updateloanstartdate').datepicker({ startDate: new Date(), minDate: 0 }).on('changeDate', function (ev) {
		$(this).valid();
		$('#updateloanstartdate').datepicker('hide');
	});

	$('#scheduledate').datepicker({ startDate: new Date() }).on('changeDate', function (ev) {
		$('#scheduledate').datepicker('hide');
	});

	$('#manualscheduledate').datepicker({ startDate: new Date() }).on('changeDate', function (ev) {
		$('#manualscheduledate').datepicker('hide');
	});

	$("#dateofBirth").datepicker({
		weekStart: 2,
		startDate: start,
		endDate: end
	}).on('changeDate', function (ev) {
		$('#dateofBirth').datepicker('hide');
	});


	/* $('#CardExpiryDate').datepicker({startDate: new Date()}).on('changeDate', function(ev){
	 $('#CardExpiryDate').datepicker('hide');
   });*/

	$('#CardExpiryDate').datepicker({
		format: "mm-yyyy",
		startView: "months",
		minViewMode: 1,
		startDate: '0m',
		format: "mm/yyyy"
	}).on('changeDate', function (selected) {
		$('#CardExpiryDate').datepicker('hide');
	});
	$('#editCardExpiryDate1').datepicker({
		format: "mm-yyyy",
		startView: "months",
		minViewMode: 1,
		startDate: '0m',
		format: "mm/yyyy"
	}).on('changeDate', function (selected) {
		$('#editCardExpiryDate1').datepicker('hide');
	});

	$('#messaging_start_date').datepicker();
});

$('#createagreementid').on('click', function () {
	if ($("#createagreement").valid()) {

	}
})

$("#createagreement").validate({
	rules: {
		documentName: {
			required: true
		},
		documentKey: {
			required: true
		},
		documentVersion: {
			required: true
		},
		documentBody: {
			required: true
		},
		active: {
			required: true
		}
	},
	messages: {
		documentName: {
			required: "This filed is required"
		},
		documentKey: {
			required: "This filed is required"
		},
		documentVersion: {
			required: "This filed is required"
		},
		documentBody: {
			required: "This filed is required"
		},
		active: {
			required: "This filed is required"
		}
	}
})



function changeincome() {

	$('#changeincome').modal('show');
}

function changeIncomeFromIncomplete() {

	$('#changeIncomeFromIncomplete').modal('show');
}

function changeincomeMsg() {

	$('#changeincomeMsg').modal('show');
}

function changeincomeDenied() {

	$('#changeincomeDenied').modal('show');
}

function changeloanamount() {

	$('#changeloan').modal('show');
}

function changeloanrate() {
	$('#changerate').modal('show');
}

function changeloanterm() {
	$('#changeterm').modal('show');
}

function unblockLoans() {
	$('#unblockLoans').modal('show');
}

/* Number divider and prefix dollar symbol starts here */
/*jQuery(function($){
	$(".loanmoney").maskMoney({prefix:'$ ',precision:0});
});*/



function chgAction(action) {
	//alert(action);

	if (action == "save") {
		$("#saveform").attr("disabled", true);
		document.myofferform.action = "/admin/senduseroffer";
	}
	else {
		$("#submitform").attr("disabled", true);
		document.myofferform.action = "/admin/saveserviceloanoffer";
	}

}



function checkdm(action) {

	var userid = $("#trackingUserID").val();


	$.ajax({
		url: '/admin/checkdmlist',
		data: {
			'userid': userid
		},
		dataType: 'json',
		type: 'POST',

		success: function (res) {

			if (status == 200) {
				alert('success');
			}
			else {
				alert('fail');
			}
		}
	});

}

function incompleteDenyconfirm() {
	$("#incompleteconfirm").attr("disabled", true);
	$("#confirm_loading").css("display", "inline-block");
	var paymentID = $('#paymentID').val();
	var screenId = $('#incompleteScreenId').val();
	var eligiblereapply = $('input[name=incompleteEligiblereapply]:checked').val();
	var decline = $('#incompleteDecline').val();
	var declinereason = document.getElementById("incompleteDeclinereason");

	if ($.trim(declinereason.value) == '') {
		$('#incompleteconfirm').attr('disabled', false);
		$("#confirm_loading").css("display", "none");
		$('#incompleteDeclineerromessage').text('Please enter decline reason');
		return false;
	}
	else {

		var declinereasonvalue = $.trim(declinereason.value);

		$.ajax({
			url: '/admin/incompleteDenyloan',
			data: {
				'paymentID': paymentID,
				'screenId': screenId,
				'eligiblereapply': eligiblereapply,
				'decline': decline,
				'declinereason': declinereasonvalue
			},
			dataType: 'json',
			type: 'POST',
			success: function (res) {
				$('#incompleteDenyModal').modal('toggle');
				$('#incompleteconfirm').attr('disabled', false);
				$("#confirm_loading").css("display", "none");
				if (res.status == 200) {

					$('#responsemessage').html('<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Success!</strong> Loan denied Successfully</div>');

					$(".alert").fadeOut(5000);

					$("#underwritersection").hide();
					$('html,body').scrollTop(0);
					setTimeout(function () {
						//window.location.href="/admin/incompleteApplication";
						window.location.href = res.backviewType;
					}, 3000);
				}
				else {
					$('#responsemessage').html('<div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Danger!</strong> Unable to deny loan</div>');
					$(".alert").fadeOut(5000);
				}
			}
		});
	}
};


function senddefaultuserremainder(paymentID, userID) {


	// alert(paymentID);

	if (paymentID == '' && userID == '') {
		return false;
	}
	else {
		//alert('else');
		$('#RemainderModal').modal('show');
		$.ajax({
			url: '/admin/remainderemaildefault',
			data: {
				'paymentID': paymentID,
				'userID': userID,
			},
			dataType: 'json',
			type: 'POST',
			success: function (res) {

				/*$('#incompleteDenyModal').modal('toggle');*/
				$('#RemainderModal').modal('hide');
				//alert(res.status);
				if (res.status == 200) {
					//alert('hi');

					$('#responsemessagedefaulted').html('<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Remainder Email Sent Successfully</div>');
					//$(".alert").fadeOut(5000);

					//$("#underwritersection").hide();
					setTimeout(function () {
						window.location.href = "/admin/defaultusers";
					}, 1500);

				}
				else {
					//alert(res.status);
					$('#responsemessagedefaulted').html('<div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Danger!</strong> ' + res.message + '</div>');
					$(".alert").fadeOut(5000);
				}
			}
		});
	}
};

function showPracticeOption() {
	var userrole = $("#userrole option:selected").text();
	var allowedPracticeRoles = $("#allowedPracticeRoles").val();

	var allowedPracticeRolesArray = allowedPracticeRoles.split(",");

	//var practicedata = document.getElementById('practiceoption');


	if (allowedPracticeRolesArray.length > 0) {
		if (allowedPracticeRolesArray.lastIndexOf(userrole) > -1) {
			$("#practiceoption").show();
		}
		else {
			$("#practiceoption").hide();
		}
	}
	else {
		$("#practiceoption").hide();
	}
}
function maskInputvalue(obj) {
	$(obj).toggleClass("fa-eye fa-eye-slash");
	var input = $($(obj).attr("toggle"));
	if (input.attr("type") == "password") {
		input.attr("type", "text");
	} else {
		input.attr("type", "password");
	}
}

function updateSetDate() {
	var paymentID = $("#paymentID").val();
	var loanSetdate = $("#loanstartdate").val();

	$("#setDatebtn").attr("disabled", true);

	$.ajax({
		url: '/admin/updateSetDate',
		data: {
			'paymentID': paymentID,
			'loanSetdate': loanSetdate
		},
		dataType: 'json',
		type: 'POST',
		success: function (res) {

			$("#setDatebtn").attr("disabled", false);
			$("#approvePatientLoanbtn").hide();
			if (res.status == 200) {
				document.getElementById("setDatebtn").value = "Edit Date";

				$("#showApproveButton").val(res.showApproveButton);
				$("#loanSetDateExist").val(res.loanSetDateExist);

				/*if(res.showApproveButton==1)
					{*/
				$("#approvePatientLoanbtn").show();
				/*}*/

				$('#updatemessageDiv').html(res.message).css("color", "green").fadeIn(1000).fadeOut(2000);
			}
			else {
				$('#updatemessageDiv').html(res.message).css("color", "red").fadeIn(1000).fadeOut(2000);
			}
		}
	});
	return false;
}

function updatePreferredDate() {
	var screentrackingId = $("#screenId").val();
	var preferredDueDate = $("#preferredDueDate").val();

	$("#setPreferredButton").attr("disabled", true);

	$.ajax({
		url: '/admin/updatePreferredDate',
		data: {
			'screentrackingId': screentrackingId,
			'preferredDueDate': preferredDueDate
		},
		dataType: 'json',
		type: 'POST',
		success: function (res) {

			$("#setPreferredButton").attr("disabled", false);
			if (res.status == 200) {
				$('#updatepreferredmessageDiv').html("Updated successfully").css("color", "green").fadeIn(1000).fadeOut(2000);
			}
			else {
				$('#updatepreferredmessageDiv').html("An error ocurred, please try again later").css("color", "red").fadeIn(1000).fadeOut(2000);
			}
		}
	});
	return false;
}

function setApproveLoan() {

	//$("#approvePatientLoanbtn").hide();
	var showApproveButton = $("#showApproveButton").val();
	var loanSetDateExist = $("#loanSetDateExist").val();
	//$("#loanstartdate").val('');
	//document.getElementById("loanapproveform").reset();
	//$('#loanstartdate').datepicker({startDate: new Date(), minDate: 0});

	if (loanSetDateExist == 0) {
		$("#loanstartdate").val('');
	}

	if (showApproveButton == 1) {
		$("#approvePatientLoanbtn").show();
	}
	$('#approveModal').modal('show');
}

function updateApproveLoan() {

	$("#approvePatientLoanbtn").hide();
	var showApproveButton = $("#showApproveButton").val();
	var loanSetDateExist = $("#loanSetDateExist").val();
	//$("#loanstartdate").val('');
	//document.getElementById("loanapproveform").reset();
	//$('#loanstartdate').datepicker({startDate: new Date(), minDate: 0});

	if (loanSetDateExist == 0) {
		$("#loanstartdate").val('');
	}

	if (showApproveButton == 1) {
		$("#approvePatientLoanbtn").show();
	}
	$('#updateapproveModal').modal('show');
}
function openChangeLoanManaually() {

	$("#manualApr").val('');
	$("#manualTerm").val('');
	$("#manualofferlisting").removeClass('error');
	$("#manualofferlisting").empty();
	$('#loanModal').modal('show');
}
function doctorsList() {

	$('#doctorListModal').modal('show');
}

$.validator.addMethod(
	"selectrequiredcheck",
	function (value, element) {
		if ($('#practicedoctor > option').length == 0) {
			return true;
		}
		else {
			if ($("#practicedoctor :selected").length > 0) {
				return true;
			}
			else {
				return false;
			}
		}
	},
	"Please select practice doctor"
);
$.validator.addMethod(
	"selectrequiredcheck1",
	function (value, element) {
		if ($('#practicestaff > option').length == 0) {
			return true;
		}
		else {
			if ($("#practicestaff :selected").length > 0) {
				return true;
			}
			else {
				return false;
			}
		}
	},
	"Please select practice staff"
);


$("#linkdoctorstaffform").validate({
	rules: {
		practicestaff: {
			selectrequiredcheck1: true
		},
		practicedoctor: {
			selectrequiredcheck: true
		}
	},
	messages: {
		practicestaff: {
			required: "Please select practice staff"
		},
		practicedoctor: {
			required: "Please select practice doctor"
		}
	},

	submitHandler: function () {
		$("#linkdoctorstaffbtn").attr("disabled", true);
		$.ajax({
			url: '/admin/linkdoctorstaff',
			data: $('#linkdoctorstaffform').serialize(),
			dataType: 'json',
			beforeSend: function () {
				$('#responseMsg').html('<img src="/images/img/ajax-loader.gif" class="img-responsive center-block" alt="User Image">');
			},
			type: 'POST',
			success: function (res) {
				$('#responseMsg').html("");
				$("#linkdoctorstaffbtn").attr("disabled", false);
				if (res.status == '200') {
					$("#responseMsg").addClass('success');
					$("#responseMsg").html(res.message);
					$("#doctorsList").html(res.listdata);
				}
				else {
					$("#responseMsg").html(res.message);
					$("#responseMsg").addClass('error');
				}
				return false;
			}
		});

	}
});
function openLoanTermOption() {
	$('#loanTermModal').modal('show');
}
function movetoUnarchive() {
	var screenID = $("#incompleteScreenId").val();
	$.ajax({
		url: '/admin/unarchive',
		data: {
			'screenID': screenID
		},
		dataType: 'json',
		type: 'POST',
		success: function (res) {
			window.location.reload(true);
		}
	});
}

function movetoarchive() {
	var screenId = $("#incompleteScreenId").val();
	$.ajax({
		url: '/admin/movetoarchive',
		data: {
			'screenId': screenId
		},
		dataType: 'json',
		type: 'POST',
		success: function (res) {
			window.location.reload(true);
		}
	});

}

function displayPracticeResults(type) {
	var credit_start_date = $('#credit_start_date').val();
	var credit_end_date = $('#credit_end_date').val();
	$('#displaymessage_error').text("");

	if (credit_start_date == "" && credit_end_date == '' && type == 'date') {
		$('#displaymessage_error').text("Please select start date and end date").fadeIn().delay(3000).fadeOut();

	}
	else {
		var eDate = new Date(credit_end_date);
		var sDate = new Date(credit_start_date);

		if (credit_start_date == '' && type == 'date') {
			$('#displaymessage_error').text("Please select start date.").fadeIn().delay(3000).fadeOut();
			return false;
		}
		if (credit_end_date == '' && type == 'date') {
			$('#displaymessage_error').text("Please select end date.").fadeIn().delay(3000).fadeOut();
			return false;
		}

		if (sDate > eDate) {
			$('#displaymessage_error').text("Ensure end date is greater than or equal to start date.").fadeIn().delay(3000).fadeOut();
			return false;
		}
	}


	var prTable = $('#practiceCreditReport_table').dataTable({

		"bProcessing": true,
		"bServerSide": true,
		"bDestroy": true,
		"oLanguage": {
			"sLoadingRecords": "Please wait - loading...",
		},
		"processing": true,
		//"stateSave": true,
		"sPaginationType": "full_numbers",
		"sAjaxSource": "/admin/ajaxCreditReportList",
		"aaSorting": [[13, 'desc']],
		"lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
		"iDisplayLength": 100,
		"aoColumns": [
			{ "mData": "loopid", "bSortable": false },
			{ "mData": "loanReference" },
			{ "mData": "userReference" },
			{ "mData": "PracticeName", "bSortable": false },
			{ "mData": "debitTransactionId" },
			{ "mData": "debitAmount" },
			{ "mData": "debitStatus" },
			{ "mData": "outstandingprincipal" },
			{ "mData": "commissionAmount" },
			{ "mData": "payBackAmount" },
			{ "mData": "creditTransactionId" },
			{ "mData": "creditAmount" },
			{ "mData": "creditStatus" },
			{ "mData": "createdAt" }
		],
		"fnServerParams": function (aoData) {
			aoData.push({ "name": "start_date", "value": credit_start_date });
			aoData.push({ "name": "end_date", "value": credit_end_date });

			var practice = $('#practicelist').val();
			if ("undefined" !== typeof practice && practice != '' && practice != null) {
				var practiceid = $('#practicelist').val();
				if ("undefined" !== typeof practiceid && practiceid != '' && practiceid != null) {

					aoData.push({ "name": "practiceID", "value": practiceid });
				}
			}

		},
	});

	$('#practiceCreditReport_table_filter input').unbind();
	$('#practiceCreditReport_table_filter input').bind('keyup', function (e) {
		if (e.keyCode == 13) {
			prTable.fnFilter(this.value);
		}
	});
	$('#practiceCreditReport_table').parent().addClass('table-responsive');
}
