$(document).ready(function () {
	
	$('#regPractice').click(function() {
      checked = $("input[class=singlecheck]:checked").length;
      if(!checked) {
		//alertmsg("You must check Consent for Something.");        
		$("#practiceconsentError").css("display","block");
		//$('#regPractice').prop('disabled', true);
		$("#regPractice").removeClass("blueBtn").addClass("lightBlueBtn");
		return false;
      }
    });
	
	if(document.getElementById('lenderrowData'))
    {  
	 	fetchlenderrowData(1);
    } 
	
	if(document.getElementById('addStaffMemberData'))
    {  
	 	fetchstaffrowData(1);
    } 

	
	$("#patientForm").validate({
		  rules: {
			username: {
			  required: true,
			  minlength: 3
			},
			contactemail:{
				required: true	
			},
			password:{
				required: true	
			},
			confirmpassword:{
				required: true,
				equalTo : "#password"
			},
			firstname: {
			  required: true,
			  minlength: 3
			},
			lastname: {
			  required: true,
			  minlength: 2
			},
			role:{
			 required: true
			},
			PracticeName:{
				 required: true
			},
			PracticeEmail:{
				required: true
			},
			StreetAddress:{
				required: true
			},	
			PhoneNumber:{
				required: true
			},
			ZipCode:{
				required: true
			},
			StateCode:{
				required: true
			},
			City:{
				required: true
			}
		  },
		  messages: {
			username: {
			  required: "Please enter username",
			  minlength: "Please enter atleast three characters"
			},
			contactemail: {
			  required: "Please enter email address",
			  email:"Please enter valid email address"
			},
			password:{
				required:  "Please enter password"
			},
			confirmpassword:{
				required:  "Please enter confirm password",
				equalTo : "Password and confirm password does not match"
			},
			firstname: {
			  required: "Please enter firstname",
			  minlength: "Please enter atleast three characters"
			},
			lastname: {
			  required: "Please enter lastname",
			  minlength: "Please enter atleast two characters"
			},
			role: {
			  required: "Please select role",
			},
			PracticeName:{
			  required: "Please enter practice name"
			},
			PracticeEmail:{
			  required: "Please enter practice email"
			},
			StreetAddress:{
			  required: "Please enter practice address"
			},	
			PhoneNumber:{
			  required: "Please enter phone number"
			},
			ZipCode:{
			  required: "Please enter zip code"
			},
			StateCode:{
			  required: "Please select state"
			},
			City:{
			  required: "Please enter city"
			}
		  }
	 });
});

function checkConsentChecked()
{
  if (document.getElementById('checkbox1').checked) 
  {
    $("#practiceconsentError").css("display","none");
	//$('#regPractice').prop('disabled', false);
	$("#regPractice").removeClass("lightBlueBtn").addClass("blueBtn");
  } 
  else 
  {
    $("#practiceconsentError").css("display","block");
	//$('#regPractice').prop('disabled', true);
	$("#regPractice").removeClass("blueBtn").addClass("lightBlueBtn");
  }
}

function openDetailPriceDiv(val) {
	 $("#proceduredetailprice_"+val).toggle();
}



/*function alertmsg(msg){
	 $("#alertmsgbody").html(msg); 
	 $('#alertmsg').modal('show');
}*/



function addMoreRows(frm) {
	
	var currentprocedureCount= $("#procedureCount").val();
	procedureCount =parseInt(currentprocedureCount)+1;
	
	var currentavailprocedureCount= $("#availprocedureCount").val();
	availprocedureCount =parseInt(currentavailprocedureCount)+1;
	
	$("#procedureCount").val(procedureCount);
	$("#availprocedureCount").val(availprocedureCount);
	
	$("#procedurelistempty").hide();
	
	var recRow = '<div id="procedureinfo_'+procedureCount+'"><div class="row"><div class="col-xs-12 col-sm-4 col-md-4 col-lg-4 txtBoxSec"><div class="form-group"><input type="text" class="form-control" placeholder="Enter Procedure Name" name="procedurename[]" id="procedurename_'+procedureCount+'" /><i class="arrow-focus-img"></i></div></div><div class="col-xs-12 col-sm-8 col-md-8 col-lg-8"><div class="col-xs-12 col-sm-4 col-md-4 col-lg-4 txtBoxSec"><div class="form-group"><input type="text" class="form-control" placeholder="Enter Amount" name="procedureprice[]" id="procedureprice_'+procedureCount+'" /><i class="arrow-focus-img"></i></div></div><div class="col-xs-12 col-sm-4 col-md-4 col-lg-4 txtBoxSec"><div class="form-group"><input type="text" class="form-control" placeholder="Enter Amount" name="proceduredeposit[]" id="proceduredeposit_'+procedureCount+'" /><i class="arrow-focus-img"></i></div></div><div class="col-xs-12 col-sm-4 col-md-4 col-lg-4 txtBoxSec proceduredetail"><div class="checkbox float-left"><input  value="'+procedureCount+'" name="procedurecheckbox[]" id="procedurecheckbox_'+procedureCount+'" class="procedurescheckbox " type="checkbox" onclick="openDetailPriceDiv(this.value)"><label for="procedurecheckbox_'+procedureCount+'"><span><h5 class="stlbluetxt">Add Detailed Price</h5></span></label></div><span class="delete" onclick="removeProcdeurelist('+procedureCount+')" ><i class="fa fa-trash-o"  aria-hidden="true"></i></span></div></div></div><div class="page-header2" id="proceduredetailprice_'+procedureCount+'" style="display: none;"><div class="col-xs-12 col-sm-4 col-md-offset-4 col-md-5 col-lg-offset-4 col-lg-5 txtBoxSec"><div class="form-group"><label>PRACTICE FEE</label><input type="text" class="form-control" placeholder="Enter Practice Fee" name="practicefee[]" id="practicefee_'+procedureCount+'" /><i class="arrow-focus-img"></i></div></div><div class="col-xs-12 col-sm-4 col-md-offset-4 col-md-5 col-lg-offset-4 col-lg-5 txtBoxSec"><div class="form-group"><label>FACILITY FEE</label><input type="text" class="form-control" placeholder="Enter Fee" name="facilityfee[]" id="facilityfee_'+procedureCount+'" /><i class="arrow-focus-img"></i></div></div><div class="col-xs-12 col-sm-4 col-md-offset-4 col-md-5 col-lg-offset-4 col-lg-5 txtBoxSec"><div class="form-group"><label>ANESTHESIA FEE</label><input type="text" class="form-control" placeholder="Enter Fee" name="anesthesiafee[]" id="anesthesiafee_'+procedureCount+'" /><i class="arrow-focus-img"></i></div></div><div class="col-xs-12 col-sm-4 col-md-offset-4 col-md-5 col-lg-offset-4 col-lg-5 txtBoxSec"><div class="form-group"><label>OTHERS FEE</label><input type="text" class="form-control" placeholder="Enter Fee" name="otherfee[]" id="otherfee_'+procedureCount+'" /><i class="arrow-focus-img"></i></div></div></div></div>';
	$('#addedprocedure').append(recRow);
}

function removeProcdeurelist(removeNum) {
	
	var currentavailprocedureCount= $("#availprocedureCount").val();
	availprocedureCount =parseInt(currentavailprocedureCount)-1;
	
	if(parseInt(availprocedureCount)>0)
	{
		$("#availprocedureCount").val(availprocedureCount);
		$("#procedurelistempty").hide();
		$('#procedureinfo_'+removeNum).remove();
	}
	else
	{
		$("#procedurelistempty").show();
	}
}

function addlendermerchantDetails() {
	
	var currentlenderMerchantCount= $("#lenderMerchantCount").val();
	lenderMerchantCount =parseInt(currentlenderMerchantCount)+1;
	
	var currentavailLenderMerchantCount= $("#availLenderMerchantCount").val();
	availLenderMerchantCount =parseInt(currentavailLenderMerchantCount)+1;
	
	$("#lenderMerchantCount").val(lenderMerchantCount);
	$("#availLenderMerchantCount").val(availLenderMerchantCount);
	
	$("#lenderMerchantempty").hide();
	
	fetchlenderrowData(lenderMerchantCount);
}

function removeLenderMerchant(removeNum) {
	
	var currentavailLenderMerchantCount= $("#availLenderMerchantCount").val();
	availLenderMerchantCount =parseInt(currentavailLenderMerchantCount)-1;
	
	if(parseInt(availLenderMerchantCount)>0)
	{
		$("#availLenderMerchantCount").val(availLenderMerchantCount);
		$("#lenderMerchantempty").hide();
		$('#lenderinfo_'+removeNum).remove();
	}
	else
	{
		$("#lenderMerchantempty").show();
	}
}

function fetchlenderrowData(rowCount)
{
	rowCount =parseInt(rowCount);
	
	$.ajax({
	  url: '/practice/getmerchantfeetemplate',
	  data: {
			'rowCount': rowCount
			},
	  dataType: 'json',
	  type: 'POST',
	  success: function(res) {
		
		if(res.status==200)
		{
			 var listData = $.trim(res.listdata);
			 $('#lenderrowData').append(listData);
		}
	  }
	});
}

function getVendorInterestRate(rowCount,value)
{	
	if(value!='')
	{
		$.ajax({
		  url: '/practice/getvendorinterestrate',
		  data: {
				'rowCount': rowCount,
				'vendorID':value
				},
		  dataType: 'json',
		  type: 'POST',
		  success: function(res) {
			
			if(res.status==200)
			{
				$('#interestrate_'+rowCount).empty();
				var listData = $.trim(res.listdata);
				$('#interestrate_'+rowCount).html(listData);
			}
		  }
		});
	}
}

function fetchstaffrowData(rowCount)
{
	rowCount =parseInt(rowCount);
	
	$.ajax({
	  url: '/practice/getstaffmembers',
	  data: {
			'rowCount': rowCount
			},
	  dataType: 'json',
	  type: 'POST',
	  success: function(res) {
		
		if(res.status==200)
		{
			 var listData = $.trim(res.listdata);
			 $('#addStaffMemberData').append(listData);
		}
	  }
	});
}

function addStaffMemberDetails() {
	
	var currentStaffMemberCount= $("#addStaffMemberCount").val();
	staffMemberCount =parseInt(currentStaffMemberCount)+1;
	
	var currentavailAddStaffMemberCount= $("#availAddStaffMemberCount").val();
	availAddStaffMemberCount =parseInt(currentavailAddStaffMemberCount)+1;
	
	$("#addStaffMemberCount").val(staffMemberCount);
	$("#availAddStaffMemberCount").val(availAddStaffMemberCount);
	
	$("#addStaffMembertempty").hide();
	
	fetchstaffrowData(staffMemberCount);
}


function removeStaffMemberData(removeNum) {
	
	var currentavailAddStaffMemberCount= $("#availAddStaffMemberCount").val();
	availAddStaffMemberCount =parseInt(currentavailAddStaffMemberCount)-1;
	
	if(parseInt(availAddStaffMemberCount)>0)
	{
		$("#availAddStaffMemberCount").val(availAddStaffMemberCount);
		$("#addStaffMembertempty").hide();
		$('#addStaffinfo_'+removeNum).remove();
	}
	else
	{
		$("#addStaffMembertempty").show();
	}
}

