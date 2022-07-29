$(document).ready(function (e) {
 	$("#user_income").maskMoney({prefix:'$ ', allowNegative: true, thousands:',',allowZero: true, decimal:'.'}).trigger('mask.maskMoney');
	$("#loan_amount").maskMoney({prefix:'$ ', allowNegative: true, thousands:',',allowZero: true, decimal:'.'}).trigger('mask.maskMoney');

	$("#annualincome").maskMoney({prefix:'$ ', allowNegative: true, thousands:',',allowZero: true, decimal:'.'}).trigger('mask.maskMoney');
	$("#financedAmount").maskMoney({prefix:'$ ', allowNegative: true, thousands:',',allowZero: true, decimal:'.'}).trigger('mask.maskMoney');

	/*$("#payrollAmount").validate({
		  rules: {
			user_income: {
			  required: true,
			  requiredcheck : true
			  //number: true
			},
 			loan_amount:{
				required: true,
			  	requiredcheck : true
				//number: true
			}
		  },
		  messages: {
 			user_income: {
			  required: "Please enter annual income",
			  requiredcheck: "Please enter annual income"
			},
 			loan_amount:{
				required: "Please enter loan amount",
				requiredcheck: "Please enter loan amount"
			}
		  },
		  submitHandler: function () {
			var minloanamount	=	parseInt($("#minloanamount").val());
			var maxloanamount	=	parseInt($("#maxloanamount").val());
			var financedAmount		=	$("#financedAmount").val();
 			financedAmount			=	parseFloat(financedAmount.replace(/,/g, "").replace("$", ""));
   			if(financedAmount>=minloanamount)
			{
				if(maxloanamount<financedAmount)
				{
					$('#apllicationloanmodel').modal('show');
					return false;
 				}
				else
				{
 					return true;
				}
			}
			else
			{
				$('#apllicationloanmodel').modal('show');
				return false;
			}
			return false;
		  }
	 });

	$.validator.addMethod(
		"requiredcheck",
		function(value, element) {
			var	inputValue	=	parseFloat(value.replace(/,/g, "").replace("$", ""));
  			if(inputValue>0)
			{
				return true;
 			}
			else
			{
				return false;
			}
		},
		"Account no does not match"
	);*/


	$("#notificationsForm").validate({
		  rules: {
			notifiemail: {
			  required: true,
			  email: true
 			},
			notifimobile: {
			  required: true
 			}
		  },
		  messages: {
 			notifiemail: {
			  required: "Please enter email",
			  email: "Please eneter valid email address"
			},
			notifimobile: {
			  required: "Please enter mobile no"
 		  	}
		  }
	 });
	$("#savepasswordDataForm").validate({
		  rules: {
			currentPassword: {
			  required: true
 			},
			newPassword: {
			  required: true
 			},
 			confirmPassword:{
				required: true,
				passwordmatch : true
			}
		  },
		  messages: {
 			currentPassword: {
			  required: "Please enter current password"
			},
			newPassword: {
			  required: "Please enter new password"
			},
			confirmPassword: {
			  required: "Please enter confirm new password",
			  passwordmatch: "Password and confirm password does not match"
 		  	}
		  }
	 });
	$.validator.addMethod(
		"passwordmatch",
		function(value, element) {
			 // The two password inputs
			var newPassword = $("#newPassword").val();
			var confirmPassword= $("#confirmPassword").val();

			// Check for equality with the password inputs
			if (newPassword != confirmPassword ) {
				return false;
			} else {
				return true;
			}
		},
		"Password and confirm password does not match"
	);


    $('#avatarprofile').on('submit',(function(e) {
        e.preventDefault();
        var formData = new FormData(this);

        $.ajax({
	        type: "POST",
	        url: '/uploadAvatar',
	        data: formData,
	        contentType: false,
	        processData: false,
	        cache: false,
	        success: function (data) {

               setTimeout(function(){// wait for 5 secs(2)
			      location.reload(); // then reload the page.(3)
			      }, 4000);

               setTimeout(function(){// wait for 5 secs(2)
			     $("#loading-image").show(); // then reload the page.(3)
			      }, 3000);

                $("#loading-image").hide();
	        }
	    });

    }));

    $("#userprofileBrowse").on("change", function() {

		var fi = document.getElementById('userprofileBrowse'); // GET THE FILE INPUT.

        // VALIDATE OR CHECK IF ANY FILE IS SELECTED.
        if (fi.files.length > 0) {
            // RUN A LOOP TO CHECK EACH SELECTED FILE.
            for (var i = 0; i <= fi.files.length - 1; i++) {
                var fsize = fi.files.item(i).size;      // THE SIZE OF THE FILE.
            }
        }

		if(fsize>2)
		{
			$("#uploadError").html("Max uploaded image size should be less than 2MB.");
			$("#uploadError").css("display","block");
		}
		else
		{
			$("#avatarprofile").submit();
		}
    });

	$.validator.addMethod(
		"dateFormat",
		function(value, element) {
			// put your own logic here, this is just a (crappy) example
			return value.match(/^\d\d?\/\d\d?\/\d\d\d\d$/);
		},
		"Please enter a date in the format mm/dd/yyyy."
	);

    /*Change apllication start*/
    $("#createApplicateValidate").validate({
    	  ignore: ":not(:visible)",
		  rules: {
			firstname: {
			  required: true,
			  minlength: 2
			},
			lastname: {
			  required: true,
			  minlength: 1
			},
 			ssnNumber:{
				required: true,
				minlength: 9
			},
			vendorDateofBirth:{
				required: true,
				dateFormat: true
			},
			email:{
				required: true,
				email: true
			},
			street:{
				required: true
			},
			city:{
				required: true
			},
			state:{
				required: true
			},
			zipCode:{
				required: true,
				number: true
			},
			phoneNumber:{
				required: true
			},

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
					required: "Please enter your social security number.",
				},
				vendorDateofBirth: {
					required: "Please select your date of birth.",
				},
				email: {
					required: "Please enter your email address.",
					email: "Please enter a valid email address."
				},
				street:{
					required: "Please enter your primary address."
				},
				city:{
					required: "Please enter your city."
				},
				state:{
					required: "Please select your state."
				},
				zipCode:{
					required: "Please enter your zip code."
				},
				phoneNumber: {
					required: "Please enter your phone number."
				},
		  },
		  submitHandler: function () {
  			var checked = $( "input[class=singlecheck]:checked" ).length;
				var error	=	"0";

 		 		if( $( "#checkbox1" ).prop( 'checked' ) == true ) {
 					$( "#consentError" ).css( "display", "none" );
				} else {
					error	=	"1";
		 			$( "#consentError" ).css( "display", "block" );
				}

				if( checked == 3 ) {
 					$( "#checkError" ).css( "display", "none" );
				} else {
					error	=	"1";
		 			$( "#checkError" ).css( "display", "block" );
				}

 				if( error == '1' ) {
					return false;
				}

				$('.createapplication').prop('disabled', true);
				return true;
 		  }
	 });

	if(document.getElementById('vendorDateofBirth'))
	{

		var start = new Date();
		var startmonth = start.getMonth() + 1;
	    var startdate = start.getDate();
	    var startyear = start.getFullYear()- 100;
	    var startDate = startmonth + '/' + startdate + '/' + startyear;

		var end = new Date();
		var endmonth = end.getMonth() + 1;
	    var enddate = end.getDate();
	    var endyear = end.getFullYear()- 18;
	    var endDate = endmonth + '/' + enddate + '/' + endyear;

	    $( "#vendorDateofBirth" ).datepicker({
			changeMonth: true,
			changeYear: true,
			format: 'mm/dd/yyyy',
			todayHighlight: true,
			minDate: startDate,
	     	maxDate: endDate,
			yearRange: '-100:-18'
		});

		$("#vendorDateofBirth").keydown(function(event) {
			if(event.keyCode != 8){
				event.preventDefault();
			}
		});
	}
	if(document.getElementById('signpadDiv'))
	{
	   $('head').append("<script language='javascript' src='/js/js/signaturepad.js'></script>");
	}

	if(document.getElementById('stamp'))
	{
		var checkCanvasEmpty = $('#checkCanvasEmpty').val();
		var hiddensignatureid = $('#hiddensignatureid').val();

		if(checkCanvasEmpty ==1 && hiddensignatureid!='')
		{
			$('#stamp').css("border-bottom","solid 1px");
		}
	}

	if(document.getElementById('stampimg')){

		var imgSource = document.getElementById('stampimg').src;
		var hiddensignatureid = document.getElementById("hiddensignatureid").value;
		if(imgSource != ''){
			signatureImage(imgSource,hiddensignatureid)
		}
	}

	$("#financedata").validate({
 		rules: {
			financedAmount: {
				required: true,
				requiredcheck:true
 			},
			annualincome: {
				required: true,
				requiredcheck:true
 			}
		},
		message: {
			financedAmount: {
				required: "Please enter loan amount",
				requiredcheck: "Please enter loan amount"
 			},
			annualincome: {
				required: "Please enter Annual income",
				requiredcheck1: "Please enter Annual income"
			}
		},
		submitHandler: function () {
 			var minloanamount	=	parseFloat($("#minloanamount").val());
			var maxloanamount	=	parseFloat($("#maxloanamount").val());
			var minincomeamount	=	parseFloat($("#minincomeamount").val());
			var financedAmount		=	$("#financedAmount").val();
			financedAmount			=	parseFloat(financedAmount.replace(/,/g, "").replace("$", ""));
			var incomeamount    =   $("#annualincome").val();
			incomeamount		=	parseFloat(incomeamount.replace(/,/g, "").replace("$", ""));

			var popupsubmit	=	$("#popupsubmit").val();
			if(popupsubmit==1)
			{
				return true;
			}

			if(parseFloat(incomeamount) < minincomeamount)
			{
				$('#denyreasonlowincomemodel').modal('show');
				return false;
			}
			else
			{

	   			if(financedAmount>=minloanamount)
				{
					$.ajax({
						url: '/loanamountconfirm',
						data: {
							'incomeamount':incomeamount,
							'financedAmount':financedAmount
						},
						dataType: 'json',
						type: 'POST',
						success: function(res) {

	 						if(res.status==300)
							{
								$("#temploanamount").val("0");

								$('#denyreasonmodel').modal('show');
								//$("#financedAmount").val(res.prequalifiedAmount).maskMoney({prefix:'$ ', allowNegative: true, thousands:',',allowZero: true, decimal:'.'}).trigger('mask.maskMoney');
								$("#temploanamount").val(res.prequalifiedAmount).maskMoney({prefix:'$ ', allowNegative: true, thousands:',',allowZero: true, decimal:'.'}).trigger('mask.maskMoney')
								$("#maxloantxt").hide();
								$("#minloantxt").hide();
								if(res.minmaxchangeTxt==1)
								{
	 								$("#minloantxt").show();
	 							}
								else
								{
									$("#maxloantxt").show();
								}

	 							$("#qualifiedAmount").html(res.prequalifiedAmount);
								return false;
							}
							else if(res.status==600)
							{
								$('#denyreasonlowincomemodel').modal('show');
	 							return false;
							}
							else if(res.status==200 || res.status==400 || res.status==500)
							{
	  							$("#popupsubmit").val("1");
								document.getElementById("financedata").submit();
							}
							else
							{
								return true;
							}
						 }
					});
				}
				else
				{
					$('#apllicationloanmodel').modal('show');
					return false;
				}
			}
			return false;
		}
	});

	$("#manualpromissoryform").validate({
		  rules: {
			bankname: {
			  required: true
			},
 			bankaccno:{
				required: true,
 				number: true
			},
			cbankaccno:{
				required: true,
				number: true,
			  	accnomatch : true
			},
			routingno:{
				required:true
			},
 			accountholder:{
				required: true
			},
			ElectronicFundsConditions: {
				required: true
			}
		  },
		  messages: {
			bankname: {
			  required: "Please select bank name"
 			},
			bankaccno: {
			  required: "Please enter account number",
			},
			cbankaccno: {
			  required: "Please enter confirm account number",
			  accnomatch: "Account number does not match"
			},
			routingno: {
			  required: "Please enter routing number",
			},
			accountholder:{
				required: "Please enter primary account holder"
			},
			ElectronicFundsConditions: {
			  required: "Please accept the electronic funds transfer authorization.",
			}
 		  },
 		  errorPlacement: function(error, element) {
			  if(element.attr("name") == "ElectronicFundsConditions") {
			    error.appendTo('#eftconsentsign');
			    $("#promissory-modal").animate({
					scrollTop:$("#promissory-modal")[0].scrollHeight - $("#promissory-modal").height()
				},1000,function(){

				})
			  } else {
			    error.insertAfter(element);
			  }
		  },
		  submitHandler: function () {
			var checked = $("input[name=ElectronicFundsConditions]:checked").length;

			if(checked > 0)
			{
 				$("#manualagree").removeClass("ActivefillBtn").addClass("ActivefillGreenBtn");

					var checkCanvasEmpty = $('#checkCanvasEmpty').val();
					var hiddensignatureid = $('#hiddensignatureid').val();
					//alert(checkCanvasEmpty)
					//alert(hiddensignatureid)
					//return false;
					if(checkCanvasEmpty ==1 && hiddensignatureid!='')
					{
						return true;
					}
  			}
			else
			{

				$("#eftconsentsign").html("<label class='error'>Please accept the electronic funds transfer authorization.</label>");
				$("#promissory-modal").animate({
					scrollTop:$("#promissory-modal")[0].scrollHeight - $("#promissory-modal").height()
				},1000,function(){

				})
  				$("#manualagree").removeClass("ActivefillGreenBtn").addClass("ActivefillBtn");
 				// document.getElementById('signpadDiv').style.display = "none";
			}
			return false;
		  }
	 });

});

$(document).ready(function() {
	/*update phone number section start*/
	$('#updateuserphonenumber_dashboard').on('click', function() {

		var user_phonenumber = $('#userphonenumber_dashboard').val();

		$(".phone-success-notification,.phone-required-notification,.phone-error-notification").html('');
		$(".phone-success-notification,.phone-required-notification,.phone-error-notification").show();
		if(user_phonenumber){

		$.ajax({
						url: '/Updateuserphonenumber',
						data: {
							'phonenumber': user_phonenumber
						},
						dataType: 'json',
		        type: 'POST',

                        success: function(res) {

														var status = res.status;
														var message = res.message;

														//alert(status);

													if(status == 404){
														$('.phone-success-notification').html(message);

													}
													else{

														$('.phone-error-notification').html(message);
													}

                        }
                    });
		}
		else
		{
			$('.phone-required-notification').html("Please Enter Phonenumber.");
		}
	});
	/*update phone number section end*/

	/*email bank transaction ajax start*/

	$('.bankarrayselectemail').on('change', function() {

										//alert("hello welcome");

			$('#banksuccessmeg').html('<div class="pull-center"><img src="/images/img/ajaxloader.gif" class="img-responsive center-block" alt="User Image"></div>');

				var bank_id = $(this).val();

				var user_id = $('#bankarrayselectuserid').val();

					$.ajax({
						url: '/emailajaxselectedbank',
						data: {
							'bank_id': bank_id,
							'user_id': user_id
						},
						dataType: 'json',
		        type: 'POST',

                        success: function(res) {

													var respond_user=res.responsedata.user;

													var respond_accountdetails=res.responsedata.accountDetails;

													//alert(JSON.stringify(respond_accountdetails[0]._id));

													//alert(JSON.stringify(respond_accountdetails));

													if(res.responsedata.message == 'success'){
														var C = '';
                             C = C+'<div class="tables"><form name="emailchangebank1" method="post" action="/emailselectedAccount"><input type="hidden" name="emailuserid" value="'+user_id+'"><input type="hidden" name="bankid" value="'+bank_id+'"><table class=" text-center acctable" style="width:100%;"><thead class="text-center hacctable"><tr><th>#</th><th align="left">Account Name</th><th align="left">Account Type</th><th align="left">Account Subtype</th><th align="left">Account Number (Last 4 Digit)</th><th align="left">Balance available</th><th align="left">Balance current</th></tr></thead><tbody>';

														$.each(respond_accountdetails,function(index,value){

						   C = C +'<tr><td class="tname"><label class="checkboxlabel"><input name="bankaccount" id="bankaccount" value="'+value._id+'" type="radio"><span class="checkmark fbox1"></span></label></td><td>'+value.meta.name+'</td><td>'+value.type+'</td><td>'+value.subtype+'</td><td>'+value.meta.number+'</td><td>'+value.balance.available+'</td><td>'+value.balance.current+'</td></tr>';
			                                              })

														 C = C+'</tbody></table></form></div><div class="done row text-center" id="am-done" style="margin-right:10%;margin-bottom:20px;" ><button class="btn btn-grey" type="button" onclick="emailselectaccount();">I am done.</button></div>';
														$('#banksuccessmeg').html(C);
														$('#am-done').addClass('custom-am-done');
													}
													else if(res.responsedata.status == 400){
														$('#banksuccessmeg').html(res.responsedata.message);
													}
													else{
														$('#banksuccessmeg').html(res.responsedata.message);
													}

                        }
                    });

	});







	/*email bank transaction ajax end*/

	/*upload document type start*/
	$('#doc_type_select').on('change', function() {
		var doc_type = $(this).val();
		var paymentId = $("#payId").val();

		//alert(doc_type);

			if(doc_type == "Others") {
				$('.document-type-input').css("display","block");
				$('.dragfileSec').css("display","block");
				$('.fileinput').css("display","block");

			}
			else
			{
				if(doc_type) {
					//alert("hi");
				$.ajax({
					url: '/getuploadeddocuments',
					data: {
					'doc_type': doc_type,
					'payId': paymentId
					},
					dataType: 'json',
					type: 'POST',
					success: function(res) {

						//alert(res);
						var exist = res.responsedata;
						//alert(exist);
						if(exist == '1') {

							$(".fail-notification-document").empty();
							//$(".fail-notification-document").fadeIn(5000);
							$('#errorupload').css("display","block");
							$(".fail-notification-document").fadeIn(1000);
							$(".fail-notification-document").html("You have already uploaded selected doucment type!!!");
							$(".fail-notification-document").fadeOut(5000);
							$('.dragfileSec').css("display","none");
							$('.fileinput').css("display","none");
							$('.document-type-input').css("display","none");

						}
						else {
							$('.dragfileSec').css("display","block");
							$('.fileinput').css("display","block");
							$('.document-type-input').css("display","none");
						}
					}
				});
				}
				else {

					$(".fail-notification-document").empty();
					$('.document-type-input').css("display","none");
					//$(".fail-notification-document").empty();
					$('#errorupload').css("display","block");
					$(".fail-notification-document").fadeIn(1000);
					$(".fail-notification-document").html("Please select document type");
					$(".fail-notification-document").fadeOut(5000);
					$('.dragfileSec').css("display","none");
					$('.fileinput').css("display","none");
				}
			}
			/*if(doc_type) {
				$('.dragfileSec').css("display","block");
				$('.fileinput').css("display","block");
			}
			else
			{
				$('.dragfileSec').css("display","none");
				$('.fileinput').css("display","none");
			}*/
		$('.get_documenttype').val(doc_type);
	});

	$('#other-type-doc').on('change', function() {

			var doctype = $("#other-type-doc").val();

			var other_doctype = $(".other_doctype").val(doctype);


			//alert(other_doctype);

			if(doctype) {
				$('.dragfileSec').css("display","block");
				$('.fileinput').css("display","block");
			}
			else {
				alert('Please Enter Document Type');
			}
		});
	/*upload document type end*/


	/*validation for upload document type start*/
	/*$('#documentfile').on('click', function(event) {
			//return false;
		alert('hello');
		var doc_type = $('.get_documenttype').val();
		//alert('doc='+doc_type);
		if(doc_type == '')
		{
		e.preventDefault();
		alert('Please Select Document Type');

		}
	});*/
	/*validation for upload document type end*/

	    $( ".changeNumberFormatComma" ).each(function( index ) {
	var existingText =  $( this ).text();
	var newText = existingText.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	$(this).html('$'+newText);

});

$("#promissoryform").validate({
	rules: {
		ElectronicFundsConditions: {
			required: true
		}
	},
	messages: {
		ElectronicFundsConditions: {
		  required: "Please accept the electronic funds transfer authorization.",
		}
	},
	errorPlacement: function(error, element) {

	  if(element.attr("name") == "ElectronicFundsConditions") {
		error.appendTo('#eftconsentsign');

		$("#promissory-modal").animate({
			scrollTop:$("#promissory-modal")[0].scrollHeight - $("#promissory-modal").height()
		},1000,function(){

		})

	  } else {
		error.insertAfter(element);
	  }
	},
	submitHandler: function () {
			var checked = $("input[class=singlecheck]:checked").length;
			if(checked > 0)
			{
				var checkCanvasEmpty = $('#checkCanvasEmpty').val();
				var hiddensignatureid = $('#hiddensignatureid').val();
				if(checkCanvasEmpty ==1 && hiddensignatureid!='')
				{
					return true;
				}
			}
			else{

				//$("#eftconsentsign").html("<label class='error'>Please select electronic funds</label>");
				$("#promissory-modal").animate({
					scrollTop:$("#promissory-modal")[0].scrollHeight - $("#promissory-modal").height()
				},1000,function(){

				})
			}
			return false;
	}
});

});
function updateuserphone(){
	document.getElementById('update_userphone_section_dashboard').style.display='block';
}
function EmailVerify(){
	window.location.href = "/profileEmailverification";
	}
function updateEmail(){
	document.getElementById('updateemail-dashboard').style.display='block';
}

function emailselectaccount(){
	var inc = 0;
    $('[name="bankaccount"]').each(function () {
        if ($(this).is(':checked')) inc++;
    });
 	var minloanamount	=	parseInt($("#minloanamount").val());
	var popupsubmit	=	$("#popupsubmit").val();
	if(popupsubmit==1)
	{
		return true;
 		document.getElementById("payrollAmount").submit();
	}

	 var payroll_exist 	=	$("#payroll_exist").val();
	 var userIncome		=	$("#user_income").val();
 	 userIncome			=	parseFloat(userIncome.replace(/,/g, "").replace("$", ""));
	 var financedAmount		=	$("#loan_amount").val();
 	 financedAmount			=	parseFloat(financedAmount.replace(/,/g, "").replace("$", ""));

 	 if(payroll_exist == "no") {
		 $("html, body").animate({ scrollTop: 100 }, "slow");
 		 if( userIncome == "" || userIncome == 0 ) {
			$("#user_income_error").show();
			$("#user_loanamountpayroll_error").hide();
			$("#eft_consent_check_error").hide();
			return false;
		 }
		 else if( user_loanamountpayroll_error == "" || user_loanamountpayroll_error == 0 ) {
			$("#user_loanamountpayroll_error").show();
			$("#user_income_error").hide();
			$("#eft_consent_check_error").hide();
			return false;
		 }
		 else if (!$("#eft_consent").is(":checked")) {
			$("#eft_consent_check_error").show();
			$("#user_income_error").hide();
			$("#user_loanamountpayroll_error").hide();
			return false;
		 } else if (inc == 0) {

			$("#user_income_error").hide();
			$("#user_loanamountpayroll_error").hide();
			$("#eft_consent_check_error").hide();
 			$('#demoModal').modal('show');
			return false;
		 }else{
			$("#user_income_error").hide();
			$("#user_loanamountpayroll_error").hide();
			$("#eft_consent_check_error").hide();
			$("#user_income_error").hide();
 		 }
	 } else {
		$("html, body").animate({ scrollTop: 10 }, "slow");
		if( userIncome == "" || userIncome == 0 ) {
			$("#user_income_error").show();
			$("#user_loanamountpayroll_error").hide();
			$("#eft_consent_check_error").hide();
			return false;
		 }
		 else if( financedAmount == "" || financedAmount == 0 ) {
			$("#user_loanamountpayroll_error").show();
			$("#user_income_error").hide();
			$("#eft_consent_check_error").hide();
			return false;
		 }
		 else if (!$("#eft_consent").is(":checked")) {
			$("#eft_consent_check_error").show();
			$("#user_income_error").hide();
			$("#user_loanamountpayroll_error").hide();
			return false;
		 } else if (inc == 0) {
			$("#user_income_error").hide();
			$("#user_loanamountpayroll_error").hide();
			$("#eft_consent_check_error").hide();
			$('#demoModal').modal('show');
			return false;
		 }else{
			$("#eft_consent_check_error").hide();
			$("#user_income_error").hide();
			$("#user_loanamountpayroll_error").hide();
  		 }
	 }
	if(financedAmount>=minloanamount)
	{

 		$.ajax({
			url: '/borrowerloanamountconfirm',
			data: {
				'incomeamount':userIncome,
				'financedAmount':financedAmount
			},
			dataType: 'json',
			type: 'POST',
			success: function(res) {
  				if(res.status==300)
				{
					$("#temploanamount").val("0");

					$('#denyreasonmodel').modal('show');
					//$("#financedAmount").val(res.prequalifiedAmount).maskMoney({prefix:'$ ', allowNegative: true, thousands:',',allowZero: true, decimal:'.'}).trigger('mask.maskMoney');
					$("#temploanamount").val(res.prequalifiedAmount).maskMoney({prefix:'$ ', allowNegative: true, thousands:',',allowZero: true, decimal:'.'}).trigger('mask.maskMoney')
					$("#maxloantxt").hide();
					$("#minloantxt").hide();
					if(res.minmaxchangeTxt==1)
					{
						$("#minloantxt").show();
					}
					else
					{
						$("#maxloantxt").show();
					}

					$("#qualifiedAmount").html(res.prequalifiedAmount);
					return false;
				}
				else if(res.status==600)
				{
					$('#denyreasonlowincomemodel').modal('show');
					return false;
				}
				else if(res.status==200 || res.status==400 || res.status==500)
				{
					$("#popupsubmit").val("1");
 					document.getElementById("payrollAmount").submit();
				}
				else
				{
					return true;
				}
			 }
		});
	}
	else
	{
		$('#apllicationloanmodel').modal('show');
		return false;
	}
		return false;


	/*var inc = 0;
     $('[name="bankaccount"]').each(function () {
        if ($(this).is(':checked')) inc++;
     });
     if (inc == 0) {
     	$('#demoModal').modal('show');
        return false;
     }else{
	   document.emailchangebank1.submit();
		 return true;
	 }*/
}

function selectnext(){

	var inc1 = 0;
     $('[name="selectrpf"]').each(function () {
        if ($(this).is(':checked')) inc1++;
     });

     if (inc1 == 0) {
         //alert('Please check atleast one account');
	   	 $('#demoModal').modal('show');
        return false;
     }else{
	   document.addconsolidate.submit();
	 }
}

/*function fileupload(file1)
{

	$("form#avatarprofile").submit(function(e) {
		e.preventDefault();
		var file_data = $('#userprofile').prop('files')[0];
		alert(file_data);
	    var formData = new FormData();
	    formData.append(formData, file_data);
	    alert(formData);



	      $.ajax({
	        type: "POST",
	        url: '/uploadAvatar',
	        data: FormData,
	        contentType: false,
	        processData: false,
	        cache: false,
	        success: function (data) {
	           $('.profile-pic').attr('src',''+data);
	        }
	    });
	  });
  }*/

	function goBackToPlaid () {
		window.history.back();
	}



  function saveoffer(){
	 document.myofferform.submit();
}

function openuploaddocument(type){

  if(type == 'governmentid')
  {
   $('.document-type-input').css('display', 'none');
   $(".get_documenttype").val("Government Issued ID");
   $('select option[value="Payroll"]').attr("selected",false);
   $('select option[value="Others"]').attr("selected",false);
   $('select option[value="Government Issued ID"]').attr("selected",true);
  }
  else if(type == 'payroll')
  {
   $('.document-type-input').css('display', 'none');
   $(".get_documenttype").val("Payroll");
   $('select option[value="Government Issued ID"]').attr("selected",false);
   $('select option[value="Others"]').attr("selected",false);
   $('select option[value="Payroll"]').attr("selected",true);
  }
  else
  {
  $(".get_documenttype").val("Others");
  $('select option[value="Others"]').attr("selected",true);
  $('.document-type-input').css('display', 'block');
  }

  document.getElementById("documentfile").reset();
  document.getElementById("loanform").reset();
  document.getElementById("uploaddocform").reset();
   $('#uploadModal').modal('show');
   $('#filesizeerror').html('');
   $('#filesizeerror').hide();

}

function exitingBtn() {
  $("#proflieSetting").css("display","none");
  $("#exitingContact").css("display","block");
}

function profileBtn() {
  $("#exitingContact").css("display","none");
  $("#proflieSetting").css("display","block");
}
$(document).ready(function () {
  if(document.getElementById('avatarprofile'))
    {
    //avatarprofiledata();
    }
  });



  /* Proflie Editer */
function avatarprofiledata() {

  $("#avatarprofile").validate({
    rules:{
      currentPassword:{
        required: true
      },
      newPassword:{
        required: true
      },
      confirmPassword:{
        required: true
      },
      avataremail:{
        avataremail: true,
        email: true
      },
      avatarMobile:{
        required: true,
        minlength:9

      }
    },
    messages:{
      currentPassword:{
        required: "Please enter currentPassword"
      },
      newPassword:{
        required: "Please enter newPassword"
      },
      confirmPassword:{
        required: "Please enter confirmPassword"
      },
      avataremail:{
        required: "Please enter email"
      },
      avatarMobile:{
        required: "Please enter mobile number"
      }
    }
  });
}



/*function removeElectronicFunds() {

	var checked = $("input[class=singlecheck]:checked").length;
    	if(checked > 0)
    	{
    		$("#save").removeClass("lightBlueBtn").addClass("greenBtn");
	    }else{
			$("#save").removeClass("greenBtn").addClass("lightBlueBtn");
		}
}*/

//-- tab_content click
$(".tab_content").hide();
//$("#tab1").show();
$("#myprofiletab").show();
$("ul.tabs li").click(function() {
  $(".tab_content").hide();
  var activeTab = $(this).attr("rel");
  $("#"+activeTab).fadeIn();
  $("ul.tabs li").removeClass("active");
  $(this).addClass("active");
  $(".tab_drawer_heading").removeClass("d_active");
  $(".tab_drawer_heading[rel^='"+activeTab+"']").addClass("d_active");
});


$(".tab_drawer_heading").click(function() {
  $(".tab_content").hide();
  var d_activeTab = $(this).attr("rel");
  $("#"+d_activeTab).fadeIn();
  $(".tab_drawer_heading").removeClass("d_active");
  $(this).addClass("d_active");
  $("ul.tabs li").removeClass("active");
  $("ul.tabs li[rel^='"+d_activeTab+"']").addClass("active");
});


//-- dashboardmenus click
$("ul#dashboardmenus li").click(function() {

	 //$(".tab_content").hide();
	 var activeTab = $(this).attr("rel");

	  if(!document.getElementById(activeTab))
	  {
		if (typeof activeTab !== "undefined")
		{
			$(".tab_content").hide();
			$("#dashbaorddivcontent").append("<div id='" + activeTab + "' class='tab_content'><div class='box'><div class='box-body table-responsive' id='content_"+ activeTab + "'><img src='/images/img/pageajaxloader.gif' class='center-block'></div></div></div>");
			//setTimeout(function(){ $("#" + activeTab + "").fadeIn(); }, 10)

			$("ul.tabs li").removeClass("active");
			getDashbardTabContent(activeTab);
		}
	  }
	  else
	  {
		$("#" + activeTab + "").fadeIn();
		$("ul.tabs li").removeClass("active");
		$(this).addClass("active");

		$(".tab_drawer_heading").removeClass("d_active");
		$(".tab_drawer_heading[rel^='"+activeTab+"']").addClass("d_active");
	  }
});

function getDashbardTabContent(activeTab){

	if(activeTab=='pastloantab')
	{
		$.ajax({
		  url: '/getApploanDetails',
		  data: {
					'appmenuName': activeTab,
					'appType': activeTab
				},
		  dataType: 'json',
		  type: 'POST',
		  success: function(res) {

			  $("#myprofiletabmenu").removeClass("active");
			  $("#pastloantabmenu").addClass("active");
			  if(res.status==200)
			  {
				  $("#content_" + activeTab + "").empty();
				  var listData = $.trim(res.listdata);
				  $("#content_" + activeTab + "").html(listData);
				  $("html, body").animate({ scrollTop: 10 }, "slow");
			  }
			  else
			  {
				  var errorMessage = 'Unable to display '+appmenuName+ 'details';
				  $("#content_" + activeTab + "").html(errorMessage);
			  }
		 }
		});
	}
	else
	{
		var loopDetails  = activeTab.split("_");
		var appmenuName      = loopDetails[0];
		if(loopDetails.length>=4)
		{
			var loanID       = loopDetails[1];
			var loopID       = loopDetails[2];
			var appType      = loopDetails[3];

			$.ajax({
			  url: '/getApploanDetails',
			  data: {
					'appmenuName': appmenuName,
					'appID':loanID,
					'loopID':loopID,
					'appType':appType
					},
			  dataType: 'json',
			  type: 'POST',
			  success: function(res) {
				  $("#pastloantabmenu").removeClass("active");
	    		  $("#myprofiletabmenu").removeClass("active");

				  if(res.status==200)
				  {
					  //$("#"+activeTab).addClass("active");
					  //alert(activeTab);
					  $( 'ul li[rel^="'+activeTab+'"]' ).addClass("active");

					  $("#content_" + activeTab + "").empty();
					  var listData = $.trim(res.listdata);
					  $("#content_" + activeTab + "").html(listData);
					  $("html, body").animate({ scrollTop: 10 }, "slow");
				  }
				  else
				  {
					  var errorMessage = 'Unable to display '+appmenuName+ 'details';
					  $("#content_" + activeTab + "").html(errorMessage);
				  }
			 }
		  });
		}
		else
		{
			var errorMessage = 'Unable to display '+appmenuName+ 'details';
			$("#content_" + activeTab + "").html(errorMessage);
		}
	}
}

//-- dashboardmenus click
$("ul#redirectdashboardmenus li").click(function() {

   var activeTab = $(this).attr("rel");
   if (typeof activeTab !== "undefined")
   {
	   if(activeTab=='pastloantab')
	   {
		    localStorage.setItem("dashboardredirectSet", 1);
			localStorage.setItem("appType", activeTab);
			localStorage.setItem("appmenuName", activeTab);

			window.location.href = "/dashboard";
	   }
	   else
	   {
			var loopDetails  = activeTab.split("_");
			var appmenuName      = loopDetails[0];
			if(loopDetails.length>=4)
			{
				var loanID       = loopDetails[1];
				var loopID       = loopDetails[2];
				var appType      = loopDetails[3];
				var appmenuName  = loopDetails[0];

				localStorage.setItem("dashboardredirectSet", 1);
				localStorage.setItem("loanID", loanID);
				localStorage.setItem("loopID",loopID);
				localStorage.setItem("appType", appType);
				localStorage.setItem("appmenuName", appmenuName);

				window.location.href = "/dashboard";
				//$("#mainlist_"+loanID+"_"+loopID+"_"+appType).trigger('click');
			}
	   }
   }
});

function selectAll( groupclass, valueclass ){
	if ( $( "." + groupclass ).prop( 'checked' ) == true ) {
		$( "." + valueclass ).prop( 'checked', true );
		$( "#regSubmit" ).removeClass( "lightBlueBtn" ).addClass( "blueBtn" );
	} else {
		$( "." + valueclass ).prop( 'checked', false );
		$( "#regSubmit" ).removeClass( "blueBtn" ).addClass( "lightBlueBtn" );
	}

	var elechecked = $( "input[class=doublecheck]:checked" ).length;
	var checked = $( "input[class=singlecheck]:checked" ).length;
	if( !checked ) {
		$( "#checkError" ).css( "display", "block" );
		$( "#regSubmit" ).removeClass( "blueBtn" ).addClass( "lightBlueBtn" );
		return false;
	} else {
		$("#checkError").css("display","none");
		$("#regSubmit").removeClass("lightBlueBtn").addClass("blueBtn");
	} 
	
	if( !elechecked ) {
		$("#regSubmit").removeClass("lightBlueBtn").addClass("lightBlueBtn");
	}
}

function removeConsentErrorMsg( obj ) {
	var checked = $( "input[class=singlecheck]:checked" ).length;
	if ($(obj).is(':checked')) {
		$("#consentError").css("display","none");
		if(checked > 0) {
			$("#regSubmit").removeClass("lightBlueBtn").addClass("blueBtn");
		}
	} else {
		$( "#consentError" ).css( "display", "block" );
		$( "#regSubmit" ).removeClass( "blueBtn" ).addClass( "lightBlueBtn" );
	}

}
function removeSelectallErrorMsg(obj) {
	
	var elechecked = $("input[class=doublecheck]:checked").length;
	var checked = $("input[class=singlecheck]:checked").length;

	//checks checkbox2 if 3, 4, and 5 are checked
	if( checked == $( '.singlecheck' ).length ) {
 		$( '#checkbox2' ).prop( 'checked', true );

	} else if( checked < $( '.singlecheck' ).length ) {
		$( '#checkbox2' ).prop( 'checked', false );

	} else {
		$( '#checkbox2' ).prop( 'checked', false );
	}

	if( checked != 3 ) {
		$( "#checkError" ).css( "display", "block" );
 		return false;
	} else {
		$( "#checkError" ).css( "display", "none" );
 	}
	 
}
function openelectronic() {
	$( '#electronicDocument' ).modal( 'show' );
}

function opencreditreport() {
	$('#creditReportDocument').modal('show');
}

function opentelemarketing() {
	$('#telemarketingDocument').modal('show');
}

function openpolicy() {
	$('#policyDocument').modal('show');
}

function printDocument(div){
	$("#cssforPrint").show();
	var divToPrint	=	$("#policyDocument .modal-body").html();
	var newWin		=	window.open('','Print-Window');
	newWin.document.open();
	newWin.document.write('<html><body onload="window.print()">'+divToPrint+'</body></html>');
	newWin.document.close();
	setTimeout(function(){newWin.close();},10);
}
function printDocument1(div){
	var divToPrint	=	$("#"+div+" .modal-body").html();
	var newWin		=	window.open('','Print-Window');
	newWin.document.open();
	newWin.document.write('<html><body onload="window.print()">'+divToPrint+'</body></html>');
	newWin.document.close();
	setTimeout(function(){newWin.close();},10);
}
function downloadDocument(dockey)
{
	var openUrl = "downloadconsentpdf?docKey="+dockey;
	window.open(openUrl);
}

//Redirect dashboard trigger
setTimeout(function(){
  if (localStorage.getItem("dashboardredirectSet") !== null)
  {
		var appmenuName = localStorage.getItem("appmenuName");

		if(appmenuName=='pastloantab')
		{
			localStorage.removeItem("dashboardredirectSet");
			localStorage.removeItem("loanID");
			localStorage.removeItem("loopID");
			localStorage.removeItem("appType");
			localStorage.removeItem("appmenuName");

			setTimeout(function(){
			  triggerDashboardLink(appmenuName);
			}, 50);
		}
		else
		{
			var dashboardredirectSet = localStorage.getItem("dashboardredirectSet");
			var loanID = localStorage.getItem("loanID");
			var loopID = localStorage.getItem("loopID");
			var appType = localStorage.getItem("appType");


			var checklistID="mainlist_"+loanID+"_"+loopID+"_"+appType;

			localStorage.removeItem("dashboardredirectSet");
			localStorage.removeItem("loanID");
			localStorage.removeItem("loopID");
			localStorage.removeItem("appType");
			localStorage.removeItem("appmenuName");

			$("#mainlist_"+loanID+"_"+loopID+"_"+appType).addClass("active");
			$("#mainlisttreeview_"+loanID+"_"+loopID+"_"+appType).addClass("menu-open");
			$("#mainlisttreeview_"+loanID+"_"+loopID+"_"+appType).show();

			setTimeout(function(){
			  var triggerMenulink = appmenuName+"_"+loanID+"_"+loopID+"_"+appType;
			  triggerDashboardLink(triggerMenulink);
			}, 50);
		}
  }
  else
  {
		localStorage.removeItem("dashboardredirectSet");
		localStorage.removeItem("loanID");
		localStorage.removeItem("loopID");
		localStorage.removeItem("appType");
		localStorage.removeItem("appmenuName");
  }
}, 100);


function triggerDashboardLink(activeTab)
{
	//alert("triggerMenulink::"+activeTab)

	if(!document.getElementById(activeTab))
	{
		if (typeof activeTab !== "undefined")
		{
			$(".tab_content").hide();
			$("#dashbaorddivcontent").append("<div id='" + activeTab + "' class='tab_content'><div class='box'><div class='box-body table-responsive' id='content_"+ activeTab + "'><img src='/images/img/pageajaxloader.gif' class='center-block'></div></div></div>");
			getDashbardTabContent(activeTab);
		}
	}
	else
	{
		$("#" + activeTab + "").fadeIn();
		$("ul.tabs li").removeClass("active");
		//$(this).addClass("active");

		$(".tab_drawer_heading").removeClass("d_active");
		$(".tab_drawer_heading[rel^='"+activeTab+"']").addClass("d_active");
	}
}

$("ul#dashboardmenus li.treeview").click(function() {
		$("#myprofiletabmenu").removeClass("active");
		$("#pastloantabmenu").removeClass("active");
});


$("#pastloantabmenu").click(function()
{
	 $(".tab_content").hide();
	 $("#pastloantab").fadeIn();
});

function triggerTodoList(linkData,prevmenuName)
{
	$("#mainlist_"+linkData).addClass("active");
	$("#mainlisttreeview_"+linkData).addClass("menu-open");
	$("#mainlisttreeview_"+linkData).show();

	setTimeout(function(){
	  var appmenuName='todolisttab';
	  var activeTab = appmenuName+"_"+linkData;
	  var prevactiveTab = prevmenuName+"_"+linkData;

	  $(".tab_content").hide();
	  $( 'ul li[rel^="'+prevactiveTab+'"]' ).removeClass("active");
	  $( 'ul li[rel^="'+activeTab+'"]' ).addClass("active");
	  triggerDashboardLink(activeTab);
	}, 50);
}
function displayAccountForm()
{
	$("#financeformsection").fadeIn();
}
function searchbank(bank){
	if(bank.length > 3){

	 $.ajax({
          url: '/searchbank',
          data: {
                'bankSearch': bank
                },
          dataType: 'json',
          type: 'POST',
          success: function(res) {

            if(res.status=='success')
            {
				var respond=res.data;
				var reslen = respond.length;
				if(reslen > 0)
				{
					var c ='';
					$.each(respond, function(k, v) {
						c += '<div class="tt-suggestion tt-selectable" onclick="selectbank(\''+v.bankname+'\',\''+v.bankid+'\',\''+v.institutionType+'\');">'+v.bankname+'</div>';
					});

				}else{
					c = '<div class="tt-suggestion tt-selectable">No Result Found</div>';
				}
				 $(".tt-dataset-bank").html(c);
			     $(".tt-menu").show();
              return false;
            }
            else
            {
               return false;
            }
          }
      });

	}else{
		$(".tt-menu").hide();
	}

}

function selectbank(bankname,bankid,banktype){

	$("#bankid").val(bankid);
	$("#bankname").val(bankname);
	$("#banktype").val(banktype);
	$(".tt-dataset-banks").html();
	$(".tt-menu").hide();

}

$.validator.addMethod(
		"requiredcheck",
		function(value, element) {
			var errorMessage	=	'';
			var	inputValue	=	parseFloat(value.replace(/,/g, "").replace("$", ""));
			if(element.id=='annualincome')
			{
				var errorMessage	=	'Please enter annualincome amount'
			}
			else if(element.id=='financedAmount')
			{
				var errorMessage	=	'Please enter finance amount'
			}
			else
			{
				var errorMessage	=	'Please provide valid amount'
			}

  			if(inputValue>0)
			{
				return true;
 			}
			else
			{
				return false;
			}
		},
		'Please enter valid amount'
	);
$.validator.addMethod(
		"accnomatch",
		function(value, element) {
			 // The two password inputs
			var bankaccno = $("#bankaccno").val();
			var cbankaccno= $("#cbankaccno").val();

			// Check for equality with the password inputs
			if (bankaccno != cbankaccno ) {
				return false;
			} else {
				return true;
			}
		},
		"Account no does not match"
	);
	$("#denyReasonModal").validate({
		  rules: {
			annualincome: {
			  required: true,
			  requiredcheck : true
			  //number: true
			},
			bankname: {
			  required: true
			},
 			bankaccno:{
				required: true,
 				number: true
			},
			cbankaccno:{
				required: true,
				number: true,
			  	accnomatch : true
			},
			routingno:{
				required:true
			},
 			accountholder:{
				required: true
			},
			financedAmount:{
				required: true,
			  	requiredcheck : true
				//number: true
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
			  required: "Please enter bank account number",
			},
			cbankaccno: {
			  required: "Please enter confirm bank account number",
			  accnomatch: "Account no does not match"
			},
			routingno: {
			  required: "Please enter bank routing information",
			},
			email: {
				required: "Please enter email address",
			   	email: "Please enter valid email address"
			},
			accountholder:{
				required: "Please enter bank account holder"
			},
			financedAmount:{
				required: "Please enter financed amount",
				requiredcheck: "Please enter financed amount"
			}
		  	},
			submitHandler: function () {
				var minloanamount	=	parseInt($("#minloanamount").val());
				// var maxloanamount	=	parseInt($("#maxloanamount").val());
				var financedAmount		=	$("#financedAmount").val();
				financedAmount			=	parseFloat(financedAmount.replace(/,/g, "").replace("$", ""));
				if(financedAmount>=minloanamount)
				{
					if(maxloanamount<financedAmount)
					{
						$('#apllicationloanmodel').modal('show');
						return false;
					}
					else
					{
						return true;
					}
				}
				else
				{
					$('#apllicationloanmodel').modal('show');
					return false;
				}
				return false;
		  }
	});

function serviceproceessnextpage()
{
	$("#popupsubmit").val("1");
	$("#loan_amount").val($("#temploanamount").val());
	document.getElementById("payrollAmount").submit();
}
function serviceproceesloanfailure()
{
	$('#denyreasonmodel').modal('hide');
}

function removeElectronicFunds(obj) {

	var checked = $("input[name=ElectronicFundsConditions]:checked").length;
	var checkCanvasEmpty = $('#checkCanvasEmpty').val();
	var hiddensignatureid = $('#hiddensignatureid').val();

	//alert("testing"+checked)

	if(checked > 0)
	{
		//signpad();
		$("#eftconsentsign").html("");
		if(checkCanvasEmpty ==0 && hiddensignatureid=='')
		{
			// document.getElementById('signpadDiv').style.display = "block";
			$("#agree").removeClass("lightBlueBtn").addClass("greenBtn");
			$("#save").removeClass("lightBlueBtn").addClass("greenBtn");
		}
		else{
			$("#agree").removeClass("lightBlueBtn").addClass("greenBtn");
			$("#save").removeClass("lightBlueBtn").addClass("greenBtn");
			// document.getElementById('signpadDiv').style.display = "none";
		}
	}else{
		//$("#eftconsentsign").html("<label class='error'>Please select electronic funds</label>");
		$("#agree").removeClass("lightBlueBtn").addClass("greenBtn");
		$("#save").removeClass("lightBlueBtn").addClass("greenBtn");
		// document.getElementById('signpadDiv').style.display = "none";
	}
}

function proceessnextpage()
{
	$("#popupsubmit").val("1");
	$("#financedAmount").val($("#temploanamount").val());
	document.getElementById("financedata").submit();
}
function proceesloanfailure()
{
	$('#denyreasonmodel').modal('hide');
}

