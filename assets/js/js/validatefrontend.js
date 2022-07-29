$(document).ready(function () {
	
	/* Input and label style like Docitt website starts here (If we enter into the field, the lable will move up) */
	(function ($) {
		$.fn.floatLabels = function (options) {
	
			// Settings
			var self = this;
			var settings = $.extend({}, options);
	
	
			// Event Handlers
			function registerEventHandlers() {
				self.on('input keyup change focus', 'input, textarea', function () {
					actions.swapLabels(this);
				});
			}
	
	
			// Actions
			var actions = {
				initialize: function() {
					self.each(function () {
						var $this = $(this);
						var $label = $this.children('label');
						var $field = $this.find('input,textarea').first();
	
						if ($this.children().first().is('label')) {
							$this.children().first().remove();
							$this.append($label);
						}
	
						var placeholderText = ($field.attr('placeholder') && $field.attr('placeholder') != $label.text()) ? $field.attr('placeholder') : $label.text();
	
						$label.data('placeholder-text', placeholderText);
						$label.data('original-text', $label.text());
	
						if ($field.val() == '') {
							$field.addClass('empty')
						}
					});
				},
				swapLabels: function (field) {
					var $field = $(field);
					var $label = $(field).siblings('label').first();
					var isEmpty = Boolean($field.val());
	
					if (isEmpty) {
						$field.removeClass('empty');
						$label.text($label.data('original-text'));
					}
					else {
						$field.addClass('empty');
						$label.text($label.data('placeholder-text'));
					}
				}
			}
	
	
			// Initialization
			function init() {
				registerEventHandlers();
	
				actions.initialize();
				self.each(function () {
					actions.swapLabels($(this).find('input,textarea').first());
				});
			}
			init();
	
	
			return this;
		};
	
		$(function () {
			$('.float-label-control').floatLabels();
		});
	})(jQuery);
	/* Input and label style like Docitt website ends here (If we enter into the field, the lable will move up) */
							
	/* Validation for signin form starts here */
	$("#signinForm").validate({
		rules: {
			email: {
				required: true,
				email:true
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
	/* Validation for signin form ends here */
	
	/* Validation for forgot password form starts here */
	$("#forgotPasswordForm").validate({
		rules: {
			email: {
				required: true,
				email:true
			}
		},
		messages: {
			email: {
				required: "Please enter email address",
				email: "Please enter valid email address"
			}
		}
	});
	/* Validation for forgot password form ends here */
	
	/* Validation for change password form starts here */
	$("#forgotpwd-fm").validate({
	rules: {
			email: {
				required: true,
				email:true
			},
			new_pwd: {
				required: true
			},
			confirm_pwd:{
				required: true,
				equalTo : "#new_pwd"
			}
		},
		messages: {
			email: {
				required: "Please enter email address",
				email: "Please enter valid email address"
			},
			new_pwd: {
				required: "Please enter password"
			},
			confirm_pwd:{
				required: "Please enter confirm password"
			}
		}
	});
	/* Validation for change password form starts here */
	

	/* Validation for signup form starts here */
	$("#signupForm").validate({
		rules: {
			firstname:{
				required: true	
			},
			lastname:{
				required: true	
			},
			email: {
				required: true,
				email:true
			},
			phoneNumber: {
				required: true,
				minlength: 10,
				maxlength:10,
				digits: true
			},
			password: {
				required: true,
				pwdcheck: true,
				minlength: 8				
				//hasUpperCase: true
				//regex: true
			},
			confirmpassword:{
				required: true,
				equalTo : "#inputPassword"
			}
		},
		messages: {
			firstname:{
				required: "Please enter firstname"
			},
			lastname:{
				required: "Please enter lastname"
			},
			email: {
				required: "Please enter email address",
				email: "Please enter valid email address"
			},
			phoneNumber: {
					required: "Please enter your phone number",
					phoneUS: "Enter only Numbers"
			},
			password: {
				required: "Please enter password",
				pwdcheck: "Password must contain at least 8 characters, one letter, one number and one special character!",
                minlength: "Password must contain at least 8 characters!"
			},
			confirmpassword:{
				required: "Please enter confirm password"
			}
		},
		
	});
	
	$.validator.addMethod("pwdcheck", function(value) {
   		//return /[A-Z]+[a-z]+[\d\W=!\-@._*]*$/.test(value)
		//var regex = /^(?=.*[0-9])(?=.*[!@#_$%^&*+-])[a-zA-Z0-9!@#_$%^&*+-]{8,}$/;
		var regex = /^(?=.*[0-9])(?=.*[!@#_$%^&+\-*])[a-zA-Z0-9!@#$_%^&+\-*]{8,}$/;
		return regex.test(value)
	});
	/* Validation for signup form ends here */
	
	$('#clickbutton').on('click', function() {
		if(	$("#tfc_home_fm").valid()){
			
			}		
	     })
	
		$("#tfc_home_fm").validate({
		rules: {
			firstname: {
				required: true
			},
			lastname: {
				required: true
			},
			email: {
				required: true,
				email:true
			},
			state: {
				required: true
			}
		},
		messages: {
			firstname: {
				required: "This Field is required"
			},
			lastname: {
				required: "This Field is required"
			},
			email: {
				required: "This Field is required",
				email: "Please enter valid email address"
			},
				state: {
				required: "This Field is required"
			}
		}
	});
	
		$('#click_button').on('click', function() {
		if(	$("#contact").valid()){
			
			}		
	     })
	
		$("#contact").validate({
		rules: {
			FirstName: {
				required: true
			},
			phoneNumber: {
				required: true
			},
			Email: {
				required: true
			}
		},
		messages: {
			FirstName: {
				required: "This Field is required"
			},
			phoneNumber: {
				required: "This Field is required"
			},
			Email: {
				required: "This Field is required"
			}
		}
	});
	
	
	/*select bank details ajax start*/
	$('.bankarrayselect').on('change', function() {
																							
			$('#banksuccessmeg').html('<div class="pull-center"><img src="/images/img/ajaxloader.gif" class="img-responsive center-block" alt="User Image"></div>');
																							
				var bank_id = $(this).val();
			
					$.ajax({
						url: '/ajaxselectedbank',	
						data: {
							'bank_id': bank_id
						},
						dataType: 'json',
		        type: 'POST',
             					
                        success: function(res) {
																										
													var respond_user=res.responsedata.user;
													
													var respond_accountdetails=res.responsedata.accountDetails;
													
													
																										
													if(res.responsedata.message == 'success'){
														var C = '';
C = C+'<div class="tables"><form name="changebank1" method="post" action="/selectedAccount"><input type="hidden" name="bankid" value="'+bank_id+'"><table class=" text-center acctable" style="width:100%;"><thead class="text-center hacctable"><tr><th>#</th><th align="left">Account Name</th><th align="left">Account Type</th><th align="left">Account Subtype</th><th align="left">Account Number (Last 4 Digit)</th><th align="left">Balance available</th><th align="left">Balance current</th></tr></thead><tbody>';
							$.each(respond_accountdetails,function(index,value){ 
																   
						   C = C +'<tr><td class="tname"><label class="checkboxlabel"><input name="bankaccount" id="bankaccount" value="'+value._id+'" type="radio"><span class="checkmark fbox1"></span></label></td><td>'+value.meta.name+'</td><td>'+value.type+'</td><td>'+value.subtype+'</td><td>'+value.meta.number+'</td><td>'+value.balance.available+'</td><td>'+value.balance.current+'</td></tr>';																																																																																																		
			                                              })
														C = C+'</tbody></table></form></div><div class="done row text-center" id="am-done" style="margin-right:0;margin-bottom:20px;" ><div style="float:right;"><button id="buttonselectaccount" class="btn btn-default" type="button" onclick="selectaccount();" disabled="true">I am done.</button></div></div>';
														C = C+'<h2 style="color:#FE772B;">Payroll<button class="btn btn-grey pull-right" type="button" onclick="payrollConfirm();">Confirm</button></h2><div class="table-responsive"><table width="100%" border="0" cellspacing="5" cellpadding="5" align="center" class="table table-responsive"><tr class="accountlisthead"><th>Date</th><th>Account</th><th>Description</th><th>Amount</th></tr><tr class="listtxt"><td>9/15/2017</td><td>Checking</td><td>IBM DIRECT DEP</td><td>$2,408</td></tr><tr class="listtxt"><td>9/01/2017</td><td>Checking</td><td>IBM DIRECT DEP</td><td>$2,408</td></tr><tr class="listtxt"><td>8/15/2017</td><td>Checking</td><td>IBM DIRECT DEP</td><td>$2,408</td></tr></table></div>';
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
	/*select bank details ajax end*/
	
	/*Update email section start*/

	$('#changeemail-dashboard').on('click',function(){
		var emailaddress = $('#user_emailaddress-dashboard').val();
		$(".email-success-notification,.email-required-notifications,.email-error-notification").html('');
		$(".email-success-notification,.email-required-notifications,.email-error-notification").show();
		if(emailaddress){
			$.ajax({
						url: '/changeemail',	
						data: {
							'email_id': emailaddress
						},
						dataType: 'json',
		        type: 'POST',
                   success: function(res) {
								var status = res.status;
								var message = res.message;
								if(status == 200 ){
									$('.email-success-notification').html(message);
									}
								else{
								$('.email-error-notification').html(message);
							}
                        }
                    });
		}
		else{
			$('.email-required-notifications').html("Please Enter Email Address.");
			}
				});
	/*Update email section end*/
	
	/*$('.user-prof-btn').on('click', function() {
		$('.dropdown-menu').css("display","block");																 
	});*/
							
});

function selectbank(){
	
	var inc = 0;
     $('[name="bankarray"]').each(function () {
        if ($(this).is(':checked')) inc++;
     });
     if (inc == 0) {
        //alert('Please check atleast one bank');
		 $('#demoModal').modal('show');
        return false;
     }else{
	   document.changebank.submit();
	 }
}

function selectaccount(){
	
	var inc = 0;
     $('[name="bankaccount"]').each(function () {
        if ($(this).is(':checked')) inc++;
     });
	 
	 var payroll_exist = $("#payroll_exist").val();
	 
	 if(payroll_exist == "no") {
		 var userIncome = $("#user_income").val();
		 if(userIncome.trim() == "") {
			$("#user_income_error").show();
			$("#eft_consent_check_error").hide();
			return false;
		 } else if (!$("#eft_consent").is(":checked")) {
			$("#eft_consent_check_error").show();
			$("#user_income_error").hide();
			return false;
		 } else if (inc == 0) {
			$("#user_income_error").hide();
			$("#eft_consent_check_error").hide();
			$('#demoModal').modal('show');
			return false;
		 }else{
			$("#eft_consent_check_error").hide();
			$("#user_income_error").hide();
			document.changebank1.submit();
			return true;
		 }
	 } else {
		 var userIncome = $("#user_income").val();
		 if(userIncome.trim() == "") {
			$("#user_income_error").show();
			$("#eft_consent_check_error").hide();
			return false;
		 } else if (!$("#eft_consent").is(":checked")) {
			$("#eft_consent_check_error").show();
			$("#user_income_error").hide();
			return false;
		 }else if (!$("#eft_consent").is(":checked")) {
			$("#eft_consent_check_error").show();
			return false;
		 } else if (inc == 0) {
			$("#eft_consent_check_error").hide();
			$('#demoModal').modal('show');
			return false;
		 }else{
			$("#eft_consent_check_error").hide();
			document.changebank1.submit();
			return true;
		 }
	 }

}
function selectnext(){
	alert("coming")
	var inc1 = 0;
     $('[name="selectrpf"]').each(function () {
        if ($(this).is(':checked')) inc1++;
     });
	 
     if (inc1 == 0) {
        //alert('Please check atleast one account');
			 $('#accountModal').modal('show');
        return false;
     }else{
	   document.addconsolidate.submit(); 
	 }
}

function getbankarrayvalue(){
	//$('[name="bankarray"]').each(function () {
	 //});	
}



function saveoffer(){
	 document.myofferform.submit(); 
}

function checkaccount(rowbankid,bankid){
 
 var rowid= $("#rowbankid_"+bankid+"_"+rowbankid).val();
 $("#bankid").val(rowid);
 $("#defaultbankid").val(rowid);
 var selitemid= $("#checkboxOne_"+bankid+"_"+rowbankid).val();
 $("#selectitemid").val(selitemid); 
}
function addamount(amount,accnumber){
	$('#totalamount').show();
	var sum = 0;
	
    $(":checkbox:checked").each(function() {
	  var attval = $(this).attr("data-amount");									 
      sum += ~~attval.replace(',','');
    });
	if(sum > 0){
		sum = parseFloat(sum);
	   var totalamt = sum.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");	
	   $('#totalamount').html('$'+totalamt);
	}else{
	  $('#totalamount').hide();
	}
}

$(document).ready(function() {
						  
 $('.validatepass').keyup(function() {
								    
    var pswd = $(this).val();
	// var regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
	// var regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;
	//var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
	
	//var regex = /^(?=.*[0-9])(?=.*[!@#_$%^&+-*])[a-zA-Z0-9!@#$_%^&+-*]{8,}$/;
	var regex = /^(?=.*[0-9])(?=.*[!@#_$%^&+\-*])[a-zA-Z0-9!@#$_%^&+\-*]{8,}$/;
	/*console.log(pswd);
	console.log( regex.test(pswd));*/
	if ( regex.test(pswd) ) {
		$('.passworderror').css('display', 'none');
	}
   else {
		$('.passworderror').css('display', 'block');
		$('.passworderror').html("Password must contain at least 8 characters, one letter, one number and one special character");
	}
      
  });
 

 });

function checkdocstatus(){
	
	$('#tcpadocument').modal('hide');
	$('#creditpulldocument').modal('hide');
	$('#eftconsent').modal('hide');
	$('#creditpullconfirm').prop('checked', true);
	$('#eft_consent').prop('checked', true);
}
/* Number divider and prefix dollar symbol starts here */
jQuery(function($){
	$(".money").maskMoney({prefix:'$ ',precision:0});
});

/* Number divider and prefix dollar symbol ends here */

/* Validation for set password form starts here */
	$("#rforgotpwd-fm").validate({
	rules: {
			password: {
				required: true,
				pwcheck: true,
				minlength: 8
			},
			confirm_pwd:{
				required: true,
				equalTo : "#password"
			}
		},
		messages: {			
			password: {
				required: "Please enter password!",
				pwcheck: "Password must contain at least 8 characters, one letter, one number and one special character!",
                minlength: "Password must contain at least 8 characters!"
			},
			confirm_pwd:{
				required: "Please enter confirm password"
			}
		}
	});
	
	$.validator.addMethod("pwcheck", function(value) {
   		//return /[A-Z]+[a-z]+[\d\W=!\-@._*]*$/.test(value)
		//var regex = /^(?=.*[0-9])(?=.*[!@#_$%^&*+-])[a-zA-Z0-9!@#_$%^&*+-]{8,}$/;
		var regex = /^(?=.*[0-9])(?=.*[!@#_$%^&+\-*])[a-zA-Z0-9!@#$_%^&+\-*]{8,}$/;
		return regex.test(value)
	});
/* Validation for set password form starts here */

/*clears the email value from homepeage when newly typed*/
$( "#inputEmail" ).keyup(function() {
   $('#inputEmail').attr("value", "");
});
/*clears the email value from homepeage when newly typed*/


