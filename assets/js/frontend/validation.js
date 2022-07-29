$(document).ready(function () {
	$("#addProvider").validate({
		rules: {
			firstname:{
				required: true,
				minlength: 2
 			},
			lastname:{
				required: true,
				minlength: 2
			},
			phonenumber:{
				required: true
			},
			providername: {
				required: true,
			  	minlength: 2
			},
			city: {
			  	required: true,
			  	minlength: 1
			},
			state:{
				required: true
			},
 			email:{
				required: true,
				email: true
			},
		},
		messages: {
			firstname: {
			  	required: "Please enter first name",
			  	minlength: "Please enter atleast two characters"
			},
			lastname: {
			  	required: "Please enter last name",
			  	minlength: "Please enter atleast one character"
			},
 			phonenumber: {
			  	required: "Please enter primary phone",
			},
			providername: {
			  	required: "Please enter provider name",
			  	minlength: "Please enter atleast two characters"
			},
  			city:{
				required: "Please enter city",
				minlength: "Please enter atleast two characters"
			},
			state:{
				required: "Please select state"
			},
			email: {
				required: "Please enter email address",
				email: "Please enter valid email address"
			},
		}
	});

	$("#estimatePayment").validate({
		rules: {
			firstname:{
				required: true,
				minlength: 2
 			},
			lastname:{
				required: true,
				minlength: 2
			},
 			email:{
				required: true,
				email: true
			},
			ficoscore:{
				required: true,
				minlength: 2
			},
		},
		messages: {
			firstname: {
			  	required: "Please enter first name",
			  	minlength: "Please enter atleast two characters"
			},
			lastname: {
			  	required: "Please enter last name",
			  	minlength: "Please enter atleast one character"
			},
			email: {
				required: "Please enter email address",
				email: "Please enter valid email address"
			},
			ficoscore: {
				required: "Please enter FICO score",
				minlength: "Please enter FICO score"
			},
		},
		submitHandler: function (form, event) {
				 $.ajax( {
					url:'/estimatemonthlypay',
					type:'post',
					data:$('#estimatePayment').serialize(),
					dataType:'json',
					beforeSend: function() {
						$('#estimatePaymentDiv').html('<div class="text-center"><img src="/images/imgv3/ajax-loader.gif" class="img-responsive center-block" alt="Loader Image"></div>');
					}
					, complete:function() {

					}
					, success:function(res) {
						$('#continueapplydiv').hide();
						$('#estimatePaymentDiv').html('');
						if(res.status==200)
						{
							$('#estimatePaymentDiv').html(res.listdata);
							$('#continueapplydiv').show();
						    return false;
						}
						else
						{
							$('#estimatePaymentDiv').html('<div class="alert alert-danger pull-center">'+res.message+'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a></div>');
              				 $(".alert").fadeOut(5000);
							 return false;
						}
					}
		  });
		  return false;
		}
	});


	$('input[type="range"]').on("change keyup mouseup", function () {
		if ($("#estimatePayment").valid())
		{
		  $.ajax( {
			url:'/estimatemonthlypay',
			type:'post',
			data:$('#estimatePayment').serialize(),
			dataType:'json',
			beforeSend: function() {
				$('#estimatePaymentDiv').html('<div class="text-center"><img src="/images/imgv3/ajax-loader.gif" class="img-responsive center-block" alt="Loader Image"></div>');
			}
			, complete:function() {

			}
			, success:function(res) {
				$('#continueapplydiv').hide();
				$('#estimatePaymentDiv').html('');
				if(res.status==200)
				{
					$('#estimatePaymentDiv').html(res.listdata);
					$('#continueapplydiv').show();
					return false;
				}
				else
				{
					$('#estimatePaymentDiv').html('<div class="alert alert-danger pull-center">'+res.message+'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a></div>');
					 $(".alert").fadeOut(5000);
					 return false;
				}
			}
		  });
		  return false;
		}
	});

	$("#borrowerlogin").validate({
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
			  required: "Please enter email"
			},
			password: {
			  required: "Please enter password"
			}
		 }
	});
});