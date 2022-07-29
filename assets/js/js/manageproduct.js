$(document).ready(function() {

	/*loan amount cap edit get value start*/
	$(".inner-cont-table").on( "click", ".loanamountcap-edit", function() {
		var loanamountcap_id = $(this).attr("value");
		//alert(loanamountcap_id);
		//alert(loanamountcap_id);
		$("#amountcap_action").val("update");
		$("body").scrollTop(0);
		$("#loan_amount_cap input").css("border","1px solid #00C0EF");
		if(loanamountcap_id)
		{
			//alert("hello djfdsklj");
			$.ajax({
			url: '/getloanamountcapfields',
			data: {
			'loanamountcap_id': loanamountcap_id
			},
			dataType: 'json',
			type: 'POST',

			success: function(res) {
				var status = res.responsedata.status;
				//alert(status);
					if( status == "Success" )
					{
						//alert("enter");
						//alert(res.responsedata.capdetails.mincreditscore);
						$('#minimumcreditscore').val(res.responsedata.capdetails.mincreditscore);
						$('#maximumcreditscore').val(res.responsedata.capdetails.maxcreditscore);
						$('#cap').val(res.responsedata.capdetails.cap);
						$('#loanamountcap_id').val(res.responsedata.capdetails.id);
					}
				}
			});
		}
	});
	/*loan amount cap edit get value end*/

	/*loan amount cap create/update start*/
	$('#createupdateamountcaps').on('click', function() {
		if(	$("#loan_amount_cap").valid()){
		var minimumcreditscore = $("#minimumcreditscore").val();
		var maximumcreditscore = $("#maximumcreditscore").val();
		var cap = $("#cap").val();
		var product_id = $("#amountcap_product_id").val();
		var loanamountcap_id = $("#loanamountcap_id").val();
		var action = $("#amountcap_action").val();

		//alert(JSON.stringify(loanamountcap_form_datas));

			$.ajax({
			url: '/admin/createupdateamountcap',
			data: {
			'minimumcreditscore': minimumcreditscore,
			'maximumcreditscore': maximumcreditscore,
			'cap': cap,
			'product_id': product_id,
			'loanamountcap_id': loanamountcap_id,
			'action': action
			},
			dataType: 'json',
			type: 'POST',

			success: function(res) {
				var status = res.responsedata.status;
				var message = res.responsedata.message;
				//alert(JSON.stringify(responsedatas));
					if( status == "Success" )
					{
						$(".succ-notification").empty();
						$(".succ-notification").fadeIn(5000);
						$(".succ-notification").html(message);
						$(".succ-notification").fadeOut(10000);
						/*get ajax loanamountcap start*/
						$.ajax({
							url: '/admin/ajaxgetloanamountcaps',
							data: {
							'product_id': product_id,
							},
							dataType: 'json',
							type: 'POST',
							success: function(res) {
								var updateamountcapdetails = res.responsedata.capdetails;
								var response = res.responsedata.status;
								var productname = res.responsedata.productname;
								//alert(JSON.stringify(updateamountcapdetails));
								if(response == "get success")
								{
									var C = '';
									C = C+'<table class="table table-bordered" style="margin-top: 25px;margin-bottom: 25px;"><thead><tr><th>#</th><th>Product Name</th><th>Minimum Maximum Creditscore</th><th>Cap</th><th>Action</th><tr><thead><tbody>';
									$.each(updateamountcapdetails,function(index,value){
									var order = parseInt(index)+parseInt(1);
									C = C+'<tr><td>'+order+'</td><td>'+productname+'</td><td>'+value.mincreditscore+' - '+value.maxcreditscore+'</td><td>'+value.cap+'</td><td><a href="javascript:void(0)" value='+value.id+' class="loanamountcap-edit"><i class="fa fa-pencil" aria-hidden="true"></i></a></td></tr>';
									})
									C = C+'</tbody></table>';
									$('.inner-cont-table').empty().html(C);
								}
							}
						});
						/*get ajax loanamountcap start*/
					}
					if( status == "fail" )
					{
						$(".fail-notification").empty();
						$(".fail-notification").fadeIn(5000);
						$(".fail-notification").html(message);
						$(".fail-notification").fadeOut(10000);
					}
				}
			});
		}
	});
	/*loan amount cap create/update end*/

	/* Validation for financedAmount form starts here */
	$("#loan_amount_cap").validate({
		rules: {
			minimumcreditscore: {
				required: true,
			},
			maximumcreditscore: {
				required: true
			},
			cap: {
				required: true
			}
		},
		messages: {
			minimumcreditscore: {
				required: "Please Enter Minimum Credit Score"
			},
			maximumcreditscore: {
				required: "Please Enter Maximum Credit Score"
			},
			cap: {
				required: "Please Enter Cap"
			}
		}
	});
	/* Validation for financedAmount form ends here */

	/*loan amount cap clear start*/
	$('#clearamountcap').on('click', function() {
		$('#minimumcreditscore').val("");
		$('#maximumcreditscore').val("");
		$('#cap').val("");
		$('#loanamountcap_id').val("");
		$("#amountcap_action").val("create");
		$("#loan_amount_cap input").css("border","1px solid #D2D6DE");
	});
	/*loan amount cap clear end*/

});



/*********Loanstate regulation************/
$(document).ready(function() {

	/*loanstateregulation start*/
	$(".inner-cont-table-state").on( "click", ".loanstateregualtion-edit", function() {

		var loanstateregualtion_id = $(this).attr("value");
		$("#loanstateregualtion_id").val(loanstateregualtion_id);
		$("#loanstate_action").val("update");
		$("body").scrollTop(0);
		$("#loan_state_regulation input").css("border","1px solid #00C0EF");
		//alert(loanstateregualtion_id);

		var selectedState = $(this).parent().parent().find(".stateName").val();
		var selectedAbbr = $(this).parent().parent().find(".abbvName").val();
		var selectedRate = $(this).parent().parent().find(".rateName").val();


		$("#state").val(selectedState);
		$("#stateCode").val(selectedAbbr);
		$("#rate_per_cycle").val(selectedRate);

		//$("#loanstateregualtion_id").val(res.responsedata.statedetails.id);

		/*if(loanstateregualtion_id)
		{
			$.ajax({
			url: '/getloanstateregualtionfields',
			data: {
			'loanstateregualtion_id': loanstateregualtion_id
			},
			dataType: 'json',
			type: 'POST',

			success: function(res) {
				var status = res.responsedata.status;
				//alert(JSON.stringify(responsedatas));
					if( status == "Success" )
					{
						$("#state").val(res.responsedata.statedetails.state);
						$("#stateCode").val(res.responsedata.statedetails.stateCode);
						$("#minloanamount").val(res.responsedata.statedetails.minloanamount);
						$("#maxloanamount").val(res.responsedata.statedetails.maxloanamount);
						$("#maxapr").val(res.responsedata.statedetails.maxapr);
						$("#applicationfee_custom").val(res.responsedata.statedetails.applicationfee);
						$("#originationfeecap").val(res.responsedata.statedetails.originationfeecap);
						$("#loanstateregualtion_id").val(res.responsedata.statedetails.id);
					}
				}
			});
		}*/
	});
	/*loanstateregulation end*/

	/*loanstateregulation create/update start*/
	$('#createupdateloanstate').on('click', function() {
		if(	$("#loan_state_regulation").valid()){

		var state = $("#state").val();
		var stateCode = $("#stateCode").val();
		var rate_per_cycle = $("#rate_per_cycle").val();
		var loanstateregualtion_id = $("#loanstateregualtion_id").val();
		var action = $("#loanstate_action").val();
		//alert(product_id);

		//alert(JSON.stringify(loan_state_regulation));

			$.ajax({
			url: '/admin/createstateregulation',
			data: {
			'state': state,
			'stateCode': stateCode,
			'ratepercycle': rate_per_cycle,
			'action': action,
			'loanstateregualtion_id' : loanstateregualtion_id
			},
			dataType: 'json',
			type: 'POST',

			success: function(res) {
				var status = res.responsedata.status;
				var message = res.responsedata.message;

				//alert(status);
				//alert(message);
				//alert(JSON.stringify(responsedatas));
					if( status == "Success" )
					{
						//alert("hello");
						$(".succ-notification-loanstate").empty();
						$(".succ-notification-loanstate").fadeIn(5000);
						$(".succ-notification-loanstate").html(message);
						$(".succ-notification-loanstate").fadeOut(5000);
							/*get ajax loanstateregulation start*/
						$.ajax({
							url: '/admin/ajaxgetstateregulation',
							data: {
							'product_id': product_id,
							},
							dataType: 'json',
							type: 'POST',
							success: function(res) {
								var stateregulation = res.responsedata.stateregulation;
								var response = res.responsedata.status;
								var productname = res.responsedata.productname;
								//alert(JSON.stringify(stateregulation));
								if(response == "get success")
								{
									var C = '';
									C = C+'<table class="table table-bordered" style="margin-top: 25px;margin-bottom: 25px;"><thead><tr><th>#</th><th>Product Name</th><th>State</th><th>State Code</th><th>Minimum - Maximum Loanamount</th><th>Maxmimum APR</th><th>Application Fee</th><th>Origination Fee Cap</th><th>Action</th><tr><thead><tbody>';
									$.each(stateregulation,function(index,value){
									var order = parseInt(index)+parseInt(1);
									C = C+'<tr><td>'+order+'</td><td>'+productname+'</td><td>'+value.state+'</td><td>'+value.stateCode+'</td><td>'+value.minloanamount+' - '+value.maxloanamount+'</td><td>'+value.maxapr+'</td><td>'+value.applicationfee+'</td><td>'+value.originationfeecap+'</td><td><a href="javascript:void(0)" value="'+value.id+'" class="loanstateregualtion-edit"><i class="fa fa-pencil" aria-hidden="true"></i></a></td></tr>';
									})
									C = C+'</tbody></table>';
									$('.inner-cont-table-state').empty().html(C);
								}
							}
						});
						/*get ajax loanamountcap start*/
					}
					if( status == "fail" )
					{
						$(".fail-notification-loanstate").empty();
						$(".fail-notification-loanstate").fadeIn(5000);
						$(".fail-notification-loanstate").html(message);
						$(".fail-notification-loanstate").fadeOut(10000);
					}
				}
			});
		}
	});
	/*loan amount cap create/update end*/

	/* Validation for loanstateregulation form starts here */
	$("#loan_state_regulation").validate({
		rules: {
			state: {
				required: true,
			},
			stateCode: {
				required: true
			},
			minloanamount: {
				required: true,
			},
			maxloanamount: {
				required: true
			},
			maxapr: {
				required: true
			},
			applicationfee: {
				required: true
			},
			originationfeecap: {
				required: true
			}
		},
		messages: {
			state: {
				required: "Please Enter State"
			},
			stateCode: {
				required: "Please Enter State Code"
			},
			minloanamount: {
				required: "Please Enter Minimum loanamount"
			},
			maxloanamount: {
				required: "Please Enter Maximum loanamount"
			},
			maxapr: {
				required: "Please Enter Maximum APR"
			},
			applicationfee: {
				required: "Please Enter Application Fee"
			},
			originationfeecap: {
				required: "Please Enter Origination Fee Cap"
			}
		}
	});
	/* Validation for loanstateregulation form ends here */

	/*loan amount cap clear start*/
	$('#clearloanstate').on('click', function() {
		$("#state").val("");
		$("#stateCode").val("");
		$("#minloanamount").val("");
		$("#maxloanamount").val("");
		$("#maxapr").val("");
		$("#applicationfee_custom").val("");
		$("#originationfeecap").val("");
		$("#loanstate_action").val("create");
		$("#loan_state_regulation input").css("border","1px solid #D2D6DE");
	});
	/*loanstateregulation clear end*/

});

/* Product Rules strat*/

$(document).ready(function() {

	/*loanstateregulation start*/
	$(".inner-cont-table-productrules").on( "click", ".productRules-edit", function() {
		var productRules_id = $(this).attr("value");
		$("#productRules_id").val(productRules_id);
		$("body").scrollTop(0);
		$("#productrules_action").val("update");
		if(productRules_id)
		{
			$.ajax({
			url: '/getproductRules',
			data: {
			'productRules_id': productRules_id
			},
			dataType: 'json',
			type: 'POST',

			success: function(res) {
				var status = res.responsedata.status;
					if( status == "Success" )
					{
						$("#description").val(res.responsedata.data.description);
						$("#declinedif").val(res.responsedata.data.declinedif);
						$("#value").val(res.responsedata.data.value);
					}
				}
			});
		}
 });
		$('#clearproductrules').on('click', function() {
		$('#description').val("");
		$('#declinedif').val("");
		$('#value').val("");
		$("#productrules_action").val("create");
	});
		$('#createupdateproductrules').on('click', function() {
		if(	$("#loan_product_rules").valid()){
		var description = $("#description").val();
		var declinedif = $("#declinedif").val();
		var value = $("#value").val();
		var product_id = $("#product_rule_id").val();
		var productRules_id = $("#productRules_id").val();
		var action = $("#productrules_action").val();

		//alert(JSON.stringify(loanamountcap_form_datas));

			$.ajax({
			url: '/admin/createupdateproductrules',
			data: {
			'description': description,
			'declinedif': declinedif,
			'value': value,
			'product_id': product_id,
			'productRules_id': productRules_id,
			'action': action
			},
			dataType: 'json',
			type: 'POST',

			success: function(res) {
				var status = res.responsedata.status;
				var message = res.responsedata.message;
				//alert(JSON.stringify(responsedatas));
					if( status == "Success" )
					{
						//alert("hello");
						$(".succ-notification-productrules").empty();
						$(".succ-notification-productrules").fadeIn(5000);
						$(".succ-notification-productrules").html(message);
						$(".succ-notification-productrules").fadeOut(5000);
										$.ajax({
							url: '/admin/ajaxgetloanproductrules',
							data: {
							'product_id': product_id,
							},
							dataType: 'json',
							type: 'POST',
							success: function(res) {
								var updateproductrules = res.responsedata.PRdetails;
								var response = res.responsedata.status;
								if(response == "get success")
								{
									var C = '';
									C = C+'<table class="table table-bordered" style="margin-top: 25px;margin-bottom: 25px;"><thead><tr><th>#</th><th>Description</th><th>Declined if</th><th>value</th><th>Action</th><tr><thead><tbody>';
									$.each(updateproductrules,function(index,value){
									var order = parseInt(index)+parseInt(1);
									C = C+'<tr><td>'+order+'</td><td>'+value.description+'</td><td>'+value.declinedif+'</td><td>'+value.value+'</td><td><a href="javascript:void(0)" value='+value.id+' class="loanamountcap-edit"><i class="fa fa-pencil" aria-hidden="true"></i></a></td></tr>';
									})
									C = C+'</tbody></table>';
									$('.inner-cont-table-productrules').empty().html(C);
								}
							}
						});
					}
						if( status == "fail" )
					{
						$(".fail-notification-productrules").empty();
						$(".fail-notification-productrules").fadeIn(5000);
						$(".fail-notification-productrules").html(message);
						$(".fail-notification-productrules").fadeOut(10000);
					}
				}
			});
		}
	});
			$("#loan_product_rules").validate({
		rules: {
			descp: {
				required: true
			},
			declinedif: {
				required: true
			},
			value: {
				required: true
			}
		},
		messages: {
			descp: {
				required: "Please Enter Description"
			},
			declinedif: {
				required: "Please Enter Declinedif"
			},
			value: {
				required: "Please Enter Value"
			}
		}
	});
});


/*********LoanInterest Rate************/
$(document).ready(function() {

	/*LoanIntrest start*/
	/*LoanIntrest get edit fields start*/
	$(".inner-cont-table-interestrate").on( "click", ".interetrate-1-edit", function() {
		var intrestrate_id = $(this).attr("value");
		var product_type = $(this).attr("product_type");
		//alert(intrestrate_id);
		$("#loan_intrestrate_action").val("update");
		$("body").scrollTop(0);
		$("#loan_intrestrate input").css("border","1px solid #00C0EF");

		if(intrestrate_id)
		{

			$.ajax({
			url: '/getinterestratefields',
			data: {
			'intrestrate_id': intrestrate_id
			},
			dataType: 'json',
			type: 'POST',

			success: function(res) {
				var status = res.responsedata.status;
				var full_interestrate_details = res.responsedata.loaninterestratedetails.intrestrate;
				//var full_interestrate_income_detail = res.responsedata.loaninterestratedetails.intrestrate[0];
				//if(full_interestrate_details)

				//alert(JSON.stringify(full_interestrate_details));

				//alert(status);
					if( status == "Success" )
					{
						$('#intrestrate_id').val(res.responsedata.loaninterestratedetails.id);
						$('#minscoreinterestrate').val(res.responsedata.loaninterestratedetails.mincreditscore);
						$('#maxscoreinterestrate').val(res.responsedata.loaninterestratedetails.maxcreditscore);


						if(product_type == "loanproductsettings"){
						$.each(full_interestrate_details,function(index,value){
							$("#interestrate_"+index+"").val(value);
						});
						}
						if(product_type == "loanproductincome"){
						$.each(full_interestrate_details,function(index,value){
							$("#interestrate_"+value.minimumincome+"").val(value.amount);
						});
						}

					}
				}
			});

		}

	});
	/*LoanIntrest get edit fields end*/

	/*loan interestrate clear start*/
	$('#clearintrestrate').on('click', function() {
		$('#minscoreinterestrate').val("");
		$('#maxscoreinterestrate').val("");
		$('.interestrate_common_fields').val("");
		$('#intrestrate_id').val("");
		$("#loan_intrestrate_action").val("create");
		$("#loan_intrestrate input").css("border","1px solid #D2D6DE");
	});
	/*loan interestrate clear end*/

	/*loan interestrate validation start*/
	$('#createupdateintrestrate').on('click', function() {
		var interestrate_error_count = 0;

		var minscoreinterestrate = $('#minscoreinterestrate').val();
			if(!minscoreinterestrate){
				$(".minscoreinterestrate-error").css("display","block");
				interestrate_error_count = 1;
			}
			else{
				$(".minscoreinterestrate-error").css("display","none");
			}
		 var maxscoreinterestrate = $('#maxscoreinterestrate').val();

			if(!maxscoreinterestrate){
				$(".maxscoreinterestrate-error").css("display","block");
				interestrate_error_count = 1;
			}
			else{
				$(".maxscoreinterestrate-error").css("display","none");
			}
			var interestrate_common_fields_whole = [];
			i = 0;
		 $(".interestrate_common_fields").each(function(){
        interestrate_common_fields = $(this).val();
				interestrate_common_fields_whole[i++] = $(this).val();
				if(!interestrate_common_fields){
				interestrate_error_count = 1;
 				$(this).next('.interestrate_common_fields_error').css("display","block");
			}else{
			$(this).next('.interestrate_common_fields_error').css("display","none");
			}
    });
			/*Create or Update Start*/
			if(interestrate_error_count == 0){
				//alert("adsfdsa");
				var minscoreinterestrate = $('#minscoreinterestrate').val();
				var maxscoreinterestrate = $('#maxscoreinterestrate').val();
				var intrestrate_product_id = $('#intrestrate_product_id').val();
				var intrestrate_id = $('#intrestrate_id').val();
				var loan_intrestrate_action = $('#loan_intrestrate_action').val();
				var interestrate_product_type = $('#interestrate_product_type').val();
				//alert(interestrate_product_type);

						$.ajax({
						url: '/admin/createupdateinterestrate',
						data: {
						'minscoreinterestrate': minscoreinterestrate,
						'maxscoreinterestrate': maxscoreinterestrate,
						'interestrate_fields_whole': interestrate_common_fields_whole,
						'intrestrate_product_id': intrestrate_product_id,
						'intrestrate_id': intrestrate_id,
						'loan_intrestrate_action': loan_intrestrate_action,
						'interestrate_product_type':interestrate_product_type
						},
						dataType: 'json',
						type: 'POST',

						success: function(res) {
								var status = res.responsedata.status;
								var message = res.responsedata.message;
								if(status == "Success"){
									$(".succ-notification-interestrate").empty();
									$("body").scrollTop(0);
									$(".succ-notification-interestrate").fadeIn(5000);
									$(".succ-notification-interestrate").html(message);
									$(".succ-notification-interestrate").fadeOut(10000);
									/*get ajax interestrate start*/
											$.ajax({
											url: '/admin/ajaxgetinterestrates',
											data: {
											'product_id': intrestrate_product_id,
											},
											dataType: 'json',
											type: 'POST',
											success: function(res) {
												var interestrate_details = res.responsedata.interestdetails;
												var product_details = res.responsedata.productdetails;
												var product_settings = res.responsedata.loanproductsettings;
												var loanproductincome = res.responsedata.loanproductincome;
												var response = res.responsedata.status;
												//alert(JSON.stringify(product_settings));
													if((response == "get success")&&(product_details.producttype == "loanproductsettings"))
													{
														var C = '';
														C = C+'<table class="table table-bordered" style="margin-top: 25px;margin-bottom: 25px;"><thead><tr><th rowspan="2" scope="rowgroup" class="attributes"> # </th><th rowspan="2" scope="rowgroup" class="attributes"> Product Name </th><th rowspan="2" scope="rowgroup" class="attributes"> Minimum Maximum Creditscore </th><th colspan="5" scope="colgroup"> Interest Rates </th><th rowspan="2" scope="rowgroup" style="border:1px solid #F4F4F4"> Action </th></tr><tr>';
														$.each(product_settings,function(index,value){
															C = C+'<th scope="col">'+value.month+'</th>';
														})
															C = C+'</tr></thead><tbody>';
														$.each(interestrate_details,function(index,value){
															var order = parseInt(index)+parseInt(1);
															C = C+'<tr><td>'+order+'</td><td>'+product_details.productname+'</td><td>'+value.mincreditscore+' - '+value.maxcreditscore+'</td>';
																$.each(value.intrestrate,function(index1,value1){
																	C = C+'<td>'+value1+'% </td>';
																});
															C = C+'<td><a href="javascript:void(0)" value="'+value.id+'" product_type="'+product_details.producttype+'" class="interetrate-1-edit"><i class="fa fa-pencil" aria-hidden="true"></i></a></td></tr>';
														});
														C = C+'</tbody></table>';
														$('.inner-cont-table-interestrate').empty().html(C);
													}
													if((response == "get success")&&(product_details.producttype == "loanproductincome"))
													{
															var C = '';
															C = C+'<table class="table table-bordered" style="margin-top: 25px;margin-bottom: 25px;"><thead><tr><th rowspan="2" scope="rowgroup" class="attributes"> # </th><th rowspan="2" scope="rowgroup" class="attributes"> Product Name </th><th rowspan="2" scope="rowgroup" class="attributes"> Minimum Maximum Creditscore </th><th colspan="5" scope="colgroup"> Interest Rates Income </th><th rowspan="2" scope="rowgroup" style="border:1px solid #F4F4F4"> Action </th></tr><tr>';
															$.each(loanproductincome,function(index,value){
																C = C+'<th scope="col">'+value.minimumincome+'-'+value.maximumincome+'</th>';
															})
															C = C+'</tr></thead><tbody>';
															$.each(interestrate_details,function(index,value){
																var order = parseInt(index)+parseInt(1);
																C = C+'<tr><td>'+order+'</td><td>'+product_details.productname+'</td><td>'+value.mincreditscore+' - '+value.maxcreditscore+'</td>';
																$.each(value.intrestrate,function(index1,value1){
																	C = C+'<td>'+value1.amount+'%</td>';
																});

																C = C+'<td><a href="javascript:void(0)" value="'+value.id+'" product_type="'+product_details.producttype+'" class="interetrate-1-edit"><i class="fa fa-pencil" aria-hidden="true"></i></a></td></tr>';
															});
															C = C+'</tbody></table>';
																$('.inner-cont-table-interestrate').empty().html(C);
													}
											}
											});
									/*get ajax interestrate end*/
								}
								if(status == "fail"){
									$(".fail-notification-interestrate").empty();
									$("body").scrollTop(0);
									$(".fail-notification-interestrate").fadeIn(5000);
									$(".fail-notification-interestrate").html(message);
									$(".fail-notification-interestrate").fadeOut(10000);
								}
						}
						});
			}
			/*Create or Update end*/
	});
	/*loan interestrate validation end*/

});
/*********LoanInterest Rate End************/
