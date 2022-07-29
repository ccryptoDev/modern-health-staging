		$(document).ready(function() {
		
		/*get edit fields start*/
		$('.applicationfee-edit').on('click', function() {	
			var application_fee_id = $(this).attr("value");
			$("#loan_application_fee_action").val("update");
			$("body").scrollTop(0);
			var product_type = $(this).attr("product_type");
				if(application_fee_id){
					$.ajax({
						url: "/getapplicationfee",
						data:{
						'application_fee_id':application_fee_id
						},
						dataType: 'json',
						type: 'POST',
						success: function(res) {
							var status = res.responsedata.status;
							
							if( status == "Success" )
							{
								$('#maximumcreditscore-app').val(res.responsedata.data.maxcreditscore);
								$('#minimumcreditscore-app').val(res.responsedata.data.mincreditscore);
								$('#application_fee_id').val(res.responsedata.data.id);
								var iterate = res.responsedata.data.applicationfee;
									if(product_type == "loanproductsettings"){
										$.each(iterate,function(index,value){
											$("#applicationfee_"+index+"").val(value);		
										})
									}
									if(product_type == "loanproductincome"){
										$.each(iterate,function(index,value){ 
										$("#applicationfee_amount_"+value.minimumincome+"").val(value.amount);
											$("#applicationfee_fixedamount_"+value.minimumincome+"").val(value.fixedamount);
										});
									}
							}
						}
					})
				}
		})
		/*get edit fields end*/
		
		/*clear fields start*/
		$('#clearapplicationfee').on('click', function() {
			$('#minimumcreditscore-app').val("");
			$('#maximumcreditscore-app').val("");
			$('.applicationfee_common_fields').val("");
			$('.applicationfee_fixed_common_fields').val("");
			$('#application_fee_id').val("");
			$("#loan_application_fee_action").val("create");
			$("#appFeeId input").css("border","1px solid #D2D6DE");
		});
		/*clear fields end*/
		
		/*create update applicationfee start*/
		$('#createupdateapplicationfee').on('click', function() {
		var applicationfee_error_count = 0;
		
		var minscoreinterestrate = $('#minimumcreditscore-app').val();
		if(!minscoreinterestrate){
		$(".minscoreapplicationfee-error").css("display","block");
		applicationfee_error_count = 1;
		}
		else{
		$(".minscoreapplicationfee-error").css("display","none");
		}
		var maxscoreinterestrate = $('#maximumcreditscore-app').val();
		
		if(!maxscoreinterestrate){
		$(".maxscoreapplicationfee-error").css("display","block");
		applicationfee_error_count = 1;
		}
		else{
		$(".maxscoreapplicationfee-error").css("display","none");
		}
		var applicationfee_common_fields_whole = [];
			i = 0;
		$(".applicationfee_common_fields").each(function(){
		applicationfee_common_fields = $(this).val();
		applicationfee_common_fields_whole[i++] = $(this).val();
		if(!applicationfee_common_fields){
		applicationfee_error_count = 1;
		$(this).next('.applicationfee_common_fields_error').css("display","block");
		}else{
		$(this).next('.applicationfee_common_fields_error').css("display","none");
		}
		});
		
		var applicationfee_fixed_common_fields_whole = [];
			j = 0;
		$(".applicationfee_fixed_common_fields").each(function(){
		applicationfee_fixed_common_fields = $(this).val();
		applicationfee_fixed_common_fields_whole[j++] = $(this).val();
		if(!applicationfee_fixed_common_fields){
		applicationfee_error_count = 1;
		$(this).next('.applicationfee_common_fields_error').css("display","block");
		}else{
		$(this).next('.applicationfee_common_fields_error').css("display","none");
		}
		});
		
			if(applicationfee_error_count == 0){
			var minimumcreditscore = $('#minimumcreditscore-app').val();
			var maximumcreditscore = $('#maximumcreditscore-app').val();
			var application_fee_product_id = $('#application_fee_product_id').val();
			var application_fee_id = $('#application_fee_id').val();
			var loan_application_fee_action = $('#loan_application_fee_action').val();
			var applicationfee_product_type = $('#applicationfee_product_type').val();
	
			//alert(interestrate_product_type);
					/*ajax start*/
					$.ajax({
					url: '/admin/createupdateapplicationfee',	
					data: {
					'minimumcreditscore': minimumcreditscore,
					'maximumcreditscore': maximumcreditscore,
					'applicationfee_common_fields_whole': applicationfee_common_fields_whole,
					'applicationfee_fixed_common_fields_whole':applicationfee_fixed_common_fields_whole,
					'application_fee_product_id': application_fee_product_id,
					'app_fee_id': application_fee_id,
					'action': loan_application_fee_action,
					'product_type':applicationfee_product_type
					},
					dataType: 'json',
					type: 'POST',
					
					success: function(res) {
						var status = res.responsedata.status;
						var message = res.responsedata.message;
						if(status == "Success"){
							$(".succ-notification-applicationfee").empty();
							$("body").scrollTop(0);
							$(".succ-notification-applicationfee").fadeIn(5000);
							$(".succ-notification-applicationfee").html(message);
							$(".succ-notification-applicationfee").fadeOut(10000);
							/*get ajax section start*/
							$.ajax({
											url: '/admin/ajaxgetapplicationfee',	
											data: {
											'product_id': application_fee_product_id,
											},
											dataType: 'json',
											type: 'POST',
											success: function(res) {
												var applicationfee_details = res.responsedata.applicationfeedetails;
												var productdetails = res.responsedata.productdetails;
												var product_settings = res.responsedata.loanproductsettings;
												var loanproductincome = res.responsedata.loanproductincome;
												var response = res.responsedata.status;
													if((response == "get success")&&(productdetails.producttype == "loanproductsettings"))
													{
														var C = '';
														C = C+'<table class="table table-bordered" style="margin-top: 25px;margin-bottom: 25px;"><thead><tr><th rowspan="2" scope="rowgroup" class="attributes"> # </th><th rowspan="2" scope="rowgroup" class="attributes"> Product Name </th><th rowspan="2" scope="rowgroup" class="attributes"> Minimum Maximum Creditscore </th><th colspan="5" scope="colgroup"> Application Fee </th><th rowspan="2" scope="rowgroup" style="border:1px solid #F4F4F4"> Action </th></tr><tr>';
														$.each(product_settings,function(index,value){ 
															C = C+'<th scope="col">'+value.month+'</th>';
														});
														
														C = C+'</tr></thead><tbody>';
														
															$.each(applicationfee_details,function(index,value){
																var order = parseInt(index)+parseInt(1);
																C = C+'<tr><td>'+order+'</td><td>'+productdetails.productname+'</td><td>'+value.mincreditscore+' - '+value.maxcreditscore+'</td>';
																$.each(value.applicationfee,function(index1,value1){
																	C = C+'<td>'+value1+'% </td>';
																});
																C = C+'<td><a href="javascript:void(0)" value="'+value.id+'" product_type="'+productdetails.producttype+'" class="applicationfee-edit"><i class="fa fa-pencil" aria-hidden="true"></i></a></td></tr>';
															});
															
															C = C+'</tbody></table>';
															
															$('.inner-cont-table-applicationfee').empty().html(C);
															
													}
													if((response == "get success")&&(productdetails.producttype == "loanproductincome"))
													{
														var C = '';
														C = C+'<table class="table table-bordered" style="margin-top: 25px;margin-bottom: 25px;"><thead><tr><th rowspan="3" scope="rowgroup" class="attributes"> # </th><th rowspan="3" scope="rowgroup" class="attributes"> Product Name </th><th rowspan="3" scope="rowgroup" class="attributes"> Minimum - Maximum Creditscore </th><th colspan="10" scope="colgroup"> Application Fee Income </th><th rowspan="3" scope="rowgroup" style="border:1px solid #F4F4F4"> Action </th></tr><tr>';
														$.each(loanproductincome,function(index,value){ 
																C = C+'<th scope="col" colspan="2">'+value.minimumincome+' - '+value.maximumincome+'</th>';
														})
														  C = C+'</tr><tr>';
														$.each(loanproductincome,function(index,value){
														C = C+'<th scope="col">Amount</th><th scope="col">Fixed Amount</th>';
														})
														C = C+'</tr></thead><tbody>';
														$.each(applicationfee_details,function(index,value){
																var order = parseInt(index)+parseInt(1);
																C = C+'<tr><td>'+order+'</td><td>'+productdetails.productname+'</td><td>'+value.mincreditscore+' - '+value.maxcreditscore+'</td>';
																$.each(value.applicationfee,function(index1,value1){
																	C = C+'<td>'+value1.amount+'%</td><td>'+value1.fixedamount+'%</td>';
																});
																C = C+'<td><a href="javascript:void(0)" value="'+value.id+'" product_type="'+productdetails.producttype+'" class="applicationfee-edit"><i class="fa fa-pencil" aria-hidden="true"></i></a></td></tr>';	
														})
														C = C+'</tbody></table>';
														$('.inner-cont-table-applicationfee').empty().html(C);
													}
											}
											})
							/*ajax end*/
						}
						if(status == "fail"){
							$(".fail-notification-applicationfee").empty();
							$("body").scrollTop(0);
							$(".fail-notification-applicationfee").fadeIn(5000);
							$(".fail-notification-applicationfee").html(message);
							$(".fail-notification-applicationfee").fadeOut(10000);
						}
					}
					});
					
			}
		});
		/*create update applicationfee end*/
		
		})