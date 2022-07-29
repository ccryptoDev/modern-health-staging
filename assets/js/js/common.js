$(document).ready(function() {	
	fetchPendingList('OpenApplication_table', 'pending');
	fetchIncompleteList('IncompleteOpenAch_table', 'openIncomplete');
	fetchArchivedList('ArchivedOpenAch_table', 'archived');
	fetchCompleteAchList('ApprovedContracts_table', 'approved');
	fetchCompleteAchList('FundedContracts_table', 'funded');
	fetchDeniedAchList('deniedeach_table', 'denied');
	fetchUserList('manageuser_table');
	// fetchIncompleteAchList('incompleteapplication_table', 'incomplete');
	// fetchIncompleteAchList('ArchivedIncompleteapplication_table', 'archived');
  // fetchPendingAchList();
  // fetchPendingAchList('pendingach_table','pending');
  // fetchPendingAchList('Archivedpendingach_table','archived');
  // fetchPendingAchList('ToDoItemspendingach_table','toDoItems');
  // fetchPendingAchList('ProcedureDateSet_table','proceduredate');
  // fetchUniversityAchList();
  // fetchIncompleteAchList();
  // fetchIncompleteAchList('ToDoItemsIncompleteapplication_table','toDoItems');
  fetchdefaultUsersList();
  fetchAdminUserList();
  fetchManagelogs();
  // fetchCompleteAchList();
  // fetchCompleteAchList('InProgressContracts_table','progress');
  // fetchBlockedAchList();
  // fetchBadgesDetails();
  // fetchReconciliationDetails();
  // fetchDeniedAchList();
  // fetchDeniedAchList('archive_deniedeach_table','archived');
  // fetchDeniedAchList('ToDoItemsdeniedeach_table','toDoItems');
  fetchReferralDetails();
  getCommunicationLog();
  fetchPaymentHistoryList();
  fetchPracticeList()
  fetchPracticeSettingsList();
  fetchSchoolAdminUserList();
  fetchPracticePaymentList();
  linkstaffdoctorList();
  
  // fetchOpenApplicationList('ToDoItemsOpenApplication_table','toDoItems');
	fetchProviderList();
	fetchProcedureList();
	fetchEditProcedureList();
	fetchPFIArchiveList();

	if(document.getElementById('practiceCreditReport_table'))
	{
		var date = new Date(), y = date.getFullYear(), m = date.getMonth();
		var firstDay = new Date(y, m, 1);

		$('#credit_start_date').datepicker('setDate',firstDay);
		$('#credit_end_date').datepicker('setDate', new Date());

		 //fetchPracticeCreditReport(new Date(),new Date());
		 fetchPracticeCreditReport(firstDay,new Date());
	}

// 	if(document.getElementById('manageuser_table'))
//    {
//      //$('#manageuser_table').dataTable();
// 	 fetchUserList();
//    }

  	var url = window.location;
 	$('ul.sidebar-menu a').filter(function() {
		return this.href == url;
	}).parent().siblings().removeClass('active').end().addClass('active');
 	$('ul.treeview-menu a').filter(function() {
		return this.href == url;
	}).parentsUntil(".sidebar-menu > .treeview-menu").siblings().removeClass('active').end().addClass('active');

  $("#docutype").change(function() {
	if (docutype.value == "Others") {
		$("#docuNameCheck").show();
	}else{
		$("#docuNameCheck").hide();
	}
	});

/* $(".img_rotate").click(function() {
	var href = $('#rotated').attr('href');
	});*/


  if(document.getElementById('potentialdefaultuser_table'))
  {
	 fetchPotentialDefaultUserList();
  }


  if(document.getElementById('report_start_date') && document.getElementById('report_end_date' ) )
  {
	  $('#report_start_date').datepicker('setDate', new Date());
	  $('#report_end_date').datepicker('setDate', new Date());
	  filterReferralSearchTable(new Date(),new Date(),'searchbydate');
  }


  $('.input-daterange input').each(function() {
	  //$(this).datepicker('clearDates');
	 $(this).datepicker();
  });

	if(document.getElementById('expirydatepicker'))
	{
		$('#expirydatepicker').datepicker();
	}
	var end = new Date();
	var endmonth = end.getMonth();
    var enddate = end.getDate();
    var endyear = end.getFullYear();
    var endDate = endmonth + '/' + enddate + '/' + endyear;
	if(document.getElementById('credit_start_date'))
	{
		$( "#credit_start_date" ).datepicker({
			changeMonth: true,
			changeYear: true,
			format: 'mm/dd/yyyy',
			todayHighlight: true,
			maxDate: '0'
 		}).on('changeDate', function(ev){
		 $('#credit_start_date').datepicker('hide');
	   });
	}
	if(document.getElementById('credit_end_date'))
	{
		$( "#credit_end_date" ).datepicker({
			changeMonth: true,
			changeYear: true,
			format: 'mm/dd/yyyy',
			todayHighlight: true,
			maxDate: '0'
		}).on('changeDate', function(ev){
			$('#credit_end_date').datepicker('hide');
		});
	}


  if(document.getElementById('reconciliation_table'))
  {
     //$('#reconciliation_table').dataTable( { "order": [[ 1, "desc" ]] });
  }

  if(document.getElementById('account1'))
  {
     $("#account1").addClass("in");
     //$('a[href="#account1"] .panel-title span').html('<i class="glyphicon glyphicon-minus"></i>');

     $('.account').on('show.bs.collapse', function() {
          var id = $(this).attr('id');
          $('a[href="#' + id + '"]').closest('.panel-heading').addClass('active-faq');
          //$('a[href="#' + id + '"] .panel-title span').html('<i class="glyphicon glyphicon-minus"></i>');
      });
      $('.account').on('hide.bs.collapse', function() {
          var id = $(this).attr('id');
          $('a[href="#' + id + '"]').closest('.panel-heading').removeClass('active-faq');
          //$('a[href="#' + id + '"] .panel-title span').html('<i class="glyphicon glyphicon-plus"></i>');
      });


      $('.subaccount').on('show.bs.collapse', function() {
          var id = $(this).attr('id');
          $('a[href="#' + id + '"]').closest('.panel-heading').addClass('active-faq');
          $('a[href="#' + id + '"] .panel-title span').html('<i class="glyphicon glyphicon-minus"></i>');
      });
      $('.subaccount').on('hide.bs.collapse', function() {
          var id = $(this).attr('id');
          $('a[href="#' + id + '"]').closest('.panel-heading').removeClass('active-faq');
          $('a[href="#' + id + '"] .panel-title span').html('<i class="glyphicon glyphicon-plus"></i>');
      });
   }

   if(document.getElementById('incompleteapplication_table'))
   {
     $('#incompleteapplication_table').dataTable();
	 $('#incompleteapplication_table').parent().addClass('table-responsive');
   }

   if(document.getElementById('messaging_table'))
   {
     //$('#messaging_table').dataTable();
	 //fetchMessagingDetails('messaging',);
	 $('#messaging_start_date').datepicker('setDate', new Date());
	 $('#messaging_end_date').datepicker('setDate', new Date());


	 $('#universityid').val('');
	 $('#university').val('');
	 filterMessagingTable('messaging',new Date(),new Date());
   }

   if(document.getElementById('manageResetUser_table'))
   {
     //$('#manageuser_table').dataTable();
	 fetchResetUserList();
   }

   if(document.getElementById('loaninfo_table'))
   {
     $('#loaninfo_table').dataTable();
	 $('#loaninfo_table').parent().addClass('table-responsive');
   }

   if(document.getElementById('useractivity_table'))
   {
     $('#useractivity_table').dataTable();
	 $('#useractivity_table').parent().addClass('table-responsive');
   }


   if ($(".transactiontable")[0])
   {
      $('.transactiontable table').each(function(){
         var tableId = this.id;
		 //alert("tableId: "+tableId);
         $('#'+tableId).dataTable();
         $('#'+tableId).parent().addClass('table-responsive');
      });
   }

   if(document.getElementById('achlogactivity_table'))
   {
     $('#achlogactivity_table').dataTable( { "order": [[ 4, "desc" ]] });
   }

   $('#denyconfirm').click(function(ev) {
      paymentID = $('#paymentID').val();
	  var eligiblereapply = $('input[name=eligiblereapply]:checked').val();
	  var decline = $('#decline').val();

	  var declinereason = document.getElementById("declinereason");
	  if ($.trim(declinereason.value) == '')
	  {
		$('#declineerromessage').text('Please enter decline reason');
		return false;
	  }
	  else
	  {
		    var declinereasonvalue = $.trim(declinereason.value);
			$.ajax({
			  url: '/admin/denyloan',
			  data: {
					'paymentID': paymentID,'eligiblereapply': eligiblereapply,'decline': decline,'declinereason': declinereasonvalue
					},
			  dataType: 'json',
			  type: 'POST',
			  success: function(res) {
				$('#denyModal').modal('toggle');

				if(res.status==200)
				{
				  $('#responsemessage').html('<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Success!</strong> Loan denied Successfully</div>');
				  $(".alert").fadeOut(5000);

				  $("#underwritersection").hide();
				  $("#denyloan").css("display","none");
					$("#approveloan").css("display","none");
					$("#linkstaff").css("display","none");

				  return false;
				}
				else
				{
				   $('#responsemessage').html('<div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Danger!</strong> Unable to deny loan</div>');
				   $(".alert").fadeOut(5000);
				   return false;
				}
				 return false;
			  }
			 // return false;
		  });
     	 return false;
	  }
   });

   $('#approveconfirm').click(function(ev) {
    //alert("approved");
    return false;
   });


   $('#changebankconfirm').click(function(ev) {
		$('#changebankModal').modal('toggle');
		paymentID = $('#paymentID').val();
		//alert("paymentid : "+paymentID);
		location.href = "/admin/changeBank/"+paymentID;
		return false;
   });

   $('#chargeoffconfirm').click(function(ev) {
		$('#chargeoffModal').modal('toggle');
		var paymentid = $('#paymentid').val();
		var pid = $('#pid').val();
		var redirectUrl = "/admin/addchargeoff/"+paymentid+'/'+pid;
		//alert("redirectUrl : "+redirectUrl);
		location.href = redirectUrl;
		return false;
   });

	$("#tabs").tabs({
        activate: function (event, ui) {
            var selectedTab = $("#tabs .ui-tabs-panel:visible").attr("id");

			if(selectedTab=='commentsection')
			{
				var userid = $("#userId").val();
				fetchAchCommentsList(userid);
			}

			if(selectedTab=='usertracking')
			{
				//$('#usertracking_table').dataTable( { "order": [[ 1, "desc" ]] });
				var userid = $("#trackingUserID").val();
				fetchUserTrackingList(userid);
				showUserTrackingMap(userid);;
			}

			if(selectedTab=='usercontacts')
			{
				var userid = $("#contactUserID").val();
				fetchUserContactsList(userid);
			}
			if(selectedTab=='incompletecommentsection')
			{
				var userId = $("#userId").val();
				fetchScreentrackingCommentsList(userId);
			}
			if(selectedTab=='Alluserscommentsection')
			{
				var userId = $("#user_Id").val();

				fetchAllusersCommentsList(userId);
			}

			/*if(document.getElementById('transuserinfo'))
    		{
				alert(selectedTab);
				$("#transcurrentTab").val(selectedTab);
			}*/

			if(selectedTab=='messaging' || selectedTab=='systemmessages' || selectedTab=='universitymessages' )
			{
				if(selectedTab=='messaging')
				{
					$('#messaging_start_date').datepicker('setDate', new Date());
					$('#messaging_end_date').datepicker('setDate', new Date());
				}
				if(selectedTab=='systemmessages')
				{
					$('#systemmessaging_start_date').datepicker('setDate', new Date());
					$('#systemmessaging_end_date').datepicker('setDate', new Date());
				}
				if(selectedTab=='universitymessages')
				{
					$('#universitymessaging_start_date').datepicker('setDate', new Date());
					$('#universitymessaging_end_date').datepicker('setDate', new Date());
				}

				 $('#universityid').val('');
	 			 $('#university').val('');

				//fetchMessagingDetails(selectedTab);
				filterMessagingTable(selectedTab,new Date(),new Date());
			}

        }
	});

    /*if(document.getElementById('transuserinfo'))
    {
	  if(document.getElementById('transcurrentTab'))
   	  {
		  alert("selectedTab: "+selectedTab);
		  var transcurrentTab = $("#transcurrentTab").val();
  	      $("#tabs").tabs({active: transcurrentTab});
	  }
	}*/

   if(document.getElementById('creditmanageuser_table'))
   {
	 fetchCreditManagerUserList();
   }

   if(document.getElementById('credithistory_table'))
   {
     $('#credithistory_table').dataTable();
	 $('#credithistory_table').parent().addClass('table-responsive');
   }

   if(document.getElementById('creditpaymenthistory_table'))
   {
     $('#creditpaymenthistory_table').dataTable();
	 $('#creditpaymenthistory_table').parent().addClass('table-responsive');
   }

 	$( ".changeNumberFormatComma" ).each(function( index ) {
	var existingText =  $( this ).text();
	var newText = existingText.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	$(this).html('$'+newText);

	});


	//-- Repull payment
   $('#repullpaymentconfirm').click(function(ev) {
		$("#repullpaymentconfirm").attr("disabled", true);
		$("#repullpayment_loading").css("display","inline-block");
		var paymentId = $('#paymentId').val();
		var scheduleId = $('#scheduleId').val();
		var uniqueScheduleId = $('#uniqueScheduleId').val();

	   	$.ajax({
			  url: '/admin/repullPayment',
			  data: {
					'paymentId': paymentId,
					'scheduleId': scheduleId,
					'uniqueScheduleId':uniqueScheduleId
					},
			  dataType: 'json',
			  type: 'POST',
			  success: function(res) {
					$('#repullpaymentModal').modal('toggle');
					if(res.status==200)
					{
						location.reload(true);
					}
					else
					{
						location.reload(true);
					}
					return false;
			  }
		});
		return false;
   });


});

function sendverficationlink(){
	 bootbox.confirm({
        title: "Send verification code confrimation?",
        message: "Do you want to send verification code by email to user?",
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
            //alert('This was logged in the callback: ' + result);
			if(result)
			{
				document.getElementById("verifyform").submit();
			}
        }
    });
	return false;
}

function verifyemailcode(){
	 bootbox.confirm({
        title: "Verifiy Email",
        message: "Do you want to verify the user email address?",
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
			if(result)
			{
				var userid = $('#userid').val();
				var redirectUrl = "/admin/changeverifystatus/"+userid;
				//alert("redirectUrl : "+redirectUrl);
				location.href = redirectUrl;
				return false;
			}
        }
    });
	return false;
}

function sendverficationcode(){
	 bootbox.confirm({
        title: "Send verification code confrimation by sms?",
        message: "Do you want to send verification code by sms to user?",
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
			if(result)
			{
				document.getElementById("verifysmsform").submit();
			}
        }
    });
	return false;
}

function verifyphonesms(){
	 bootbox.confirm({
        title: "Verify phone number?",
        message: "Do you want to verify the user phone number?",
        buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancel'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirm'
            }
        },
        callback: function (result) {
			if(result)
			{
				document.getElementById("phoneverifyform").submit();
			}
        }
    });
	return false;
}

function chargeoffamount(paymentid,pid)
{
	//alert("charge off" + paymentid);
	//alert("charge off" + pid);
	$('#chargeoffModal').modal('toggle');
	$("#paymentid").val( paymentid );
	$("#pid").val( pid );
	return false;
}
function restrictDateFrom(obj){
	var selectedDate = obj.value;
	$("#sch_end_date").datepicker('remove');
	$("#sch_end_date").datepicker({startDate: new Date(selectedDate)});
}
function restrictDateTo(obj){
	var selectedDate = obj.value;
	$("#sch_start_date").datepicker('remove');
	$("#sch_start_date").datepicker({endDate: new Date(selectedDate)});
}
function fetchPaymentHistoryList(){

	if(document.getElementById('paymentHistory_table'))
    {

		$('#sch_end_date,#sch_start_date').datepicker();



		var urlPath = '/admin/ajaxPaymentHistory?';
		urlPath = urlPath.trim();

		var scheduleStartDate = document.getElementById("sch_start_date").value;
		var scheduleEndDate = document.getElementById("sch_end_date").value;
		var lenderType = document.getElementById("lenderType").value;
		var processType = document.getElementById("processType").value;

		if (lenderType != ""){
			urlPath += 'lenderTypeVal='+lenderType+"&";
		}
		if (processType != ""){
			urlPath += 'processTypeVal='+processType+"&";
		}
		if (scheduleStartDate != ""){
			urlPath += 'scheduleStartDate='+scheduleStartDate+"&";
		}
		if (scheduleEndDate != ""){
			urlPath += 'scheduleEndDate='+scheduleEndDate+"&";
		}
       var dTable =$('#paymentHistory_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    //"stateSave": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": urlPath,
                    "aaSorting": [ [4,'desc']],
                    "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "uniqueID","bSortable": false },
						  { "mData": "consumerName" },
						  { "mData": "amount" },
                          { "mData": "scheduleDate" },
                          { "mData": "lenderType" },
                          { "mData": "status" ,"bSortable": false },
						  { "mData": "rejectReason"},

                     ]
         });

         $('#deniedeach_table_filter input').unbind();
         $('#deniedeach_table_filter input').bind('keyup', function(e) {
             if(e.keyCode == 13) {
               dTable.fnFilter(this.value);
             }
         });

         $('#paymentHistory_table').parent().addClass('table-responsive');
     }
}
function fetchPendingAchList(divID,type)
{
    if(document.getElementById(divID))
    {

       var uTable =$('#'+divID).dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    //"stateSave": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxPendingAch/"+type,
                    "aaSorting": [ [11,'desc']],
                    "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "loanReference" },
						  { "mData": "name" },
						  //{ "mData": "directMail" },
						  //{ "mData": "badList" },
                          { "mData": "email" },
                          { "mData": "phoneNumber" },
						  { "mData": "practicename" },
							{ "mData": "fundingTier" },
                          { "mData": "payOffAmount" },
						  { "mData": "creditScore","bSortable": false },
						  { "mData": "availableBalance","bSortable": false },
						  { "mData": "maturityDate" },
                          { "mData": "createdAt" },
                          { "mData": "status" },
						  { "mData": "paymenttype" },
						  { "mData": "registeredType","bSortable": false  },
						  { "mData": "apr" }
                     ]
         });

         $('#'+divID+'_filter input').unbind();
         $('#'+divID+'_filter input').bind('keyup', function(e) {
             if(e.keyCode == 13) {
               uTable.fnFilter(this.value);
             }
         });

         $('#'+divID).parent().addClass('table-responsive');
     }
}

function fetchUniversityAchList(){

    if(document.getElementById('university_table'))
    {

	     //$('#university_table').dataTable();

       var uTable =$('#university_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxUniversity",
                    "aaSorting": [ [3,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "name" },
                          { "mData": "city" },
                          { "mData": "createdAt" },
                          { "mData": "status" }
                     ]
         });

         $('#university_table_filter input').unbind();
         $('#university_table_filter input').bind('keyup', function(e) {
             if(e.keyCode == 13) {
               uTable.fnFilter(this.value);
             }
         });

         $('#university_table').parent().addClass('table-responsive');
     }


}

function statuscheck(id, stats){

   $.ajax({
          url: '/admin/updateStatus',
          data: {
                'universityid': id,
                'status':stats
                },
          dataType: 'json',
          type: 'POST',
          success: function(res) {


            if(res.status==200)
            {
              fetchUniversityAchList();
              return false;
            }
            else
            {

               return false;
            }
          }
      });

}



function addachcommnet(){

  var subject = $("#subject").val();
  var comments = $("#comments").val();
  var paymentID = $("#paymentID").val();
  var userid = $("#userId").val();

    if(subject == ''){
		$("#subject").addClass("BorderError");
	}else{
		$("#subject").removeClass("BorderError");
	}
	if(comments == ''){
		$("#comments").addClass("BorderError");
	}else{
		$("#comments").removeClass("BorderError");
	}
	if(subject == '' || comments == ''){
		return false;
	}else{
		$("#achcomment").attr("disabled", true);
	}

   $.ajax({
          url: '/admin/addAchComments',
          data: {
		        'subject': subject,
				'comments': comments,
                'paymentID': paymentID,
                'status':'1'
                },
          dataType: 'json',
          type: 'POST',
          success: function(res) {
            $("#achcomment").attr("disabled", false);

            if(res.status==200)
            {
              fetchAchCommentsList(userid);
			   $("#subject").val('');
               $("#comments").val('');
              return false;
            }
            else
            {

               return false;
            }
          }
      });

}





function fetchAchCommentsList(userid){
    var cTable = $('#achcomments_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxAchComments/"+userid,
                    "aaSorting": [ [0,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "subject" },
                          { "mData": "comments" },
                          { "mData": "adminemail" },
                          { "mData": "createdAt" }
                     ]
         });

	 $('#achcomments_table_filter input').unbind();
	 $('#achcomments_table_filter input').bind('keyup', function(e) {
		 if(e.keyCode == 13) {
		   cTable.fnFilter(this.value);
		 }
	 });

	 $('#achcomments_table').parent().addClass('table-responsive');
}

function fetchUserList( divID ) {
	const currentPage = $("#currentPage");
	if ($('#' + divID + '_filter input').val()) {
		currentPage.val("1");
	}
	if( document.getElementById( divID ) ) {
		var sTable = $( '#' + divID ).dataTable( {
			"bProcessing": true,
			"bServerSide": true,
			"bDestroy": true,
			"bPaginate": false,
			"oLanguage": { "sLoadingRecords": "Please wait - loading..." },
			"processing": true,
			"sAjaxSource": "/admin/ajaxmanageuserlist?currentPage=" + currentPage.val(),
			"aaSorting": [ [7,'desc']],
			"lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
			"iDisplayLength": 50,
			"aoColumns": [
				{ "mData": "loopid", "bSortable": false },
				{ "mData": "userReference" },
				{ "mData": "name" },
				{ "mData": "email" },
				{ "mData": "phoneNumber" },
				{ "mData": "allowsocialnetwork", "bSortable": false },
				{ "mData": "practicename" },
				{ "mData": "createdAt" }
			]
		} );

		$( '#' + divID  + '_filter input' ).unbind();
		$( '#' + divID + '_filter input' ).bind( 'keyup', function( e ) {
			if( e.keyCode == 13 ) {
				if (!$('#' + divID + '_filter input').val()) {
					$("#new-pagination").css('display', 'flex');
				} else {
					$("#new-pagination").css('display', 'none');
				}
				sTable.fnFilter( this.value );
			}
		});
		$( '#' + divID ).parent().addClass('table-responsive');
	}
}
function setUserStatus(id, statusval){

   $.ajax({
          url: '/admin/updateUserStatus',
          data: {
                'userid': id,
                'status':statusval
                },
          dataType: 'json',
          type: 'POST',
          success: function(res) {


            if(res.status==200)
            {
              fetchUserList();
              return false;
            }
            else
            {
               return false;
            }
          }
      });

}

function showuniversity(cateval){

	if(cateval=='newsriver'){
		 $("#universityoption").show();
		 $(".tt-dataset-countries").html();
	     $(".tt-menu").hide();
	}else{
		 $("#universityoption").hide();
	}
}

function fetchMessagingDetails(selectedMessageTab)
{
   //alert(tableID);
   var tableID = selectedMessageTab+'_table';
   if(document.getElementById(tableID))
   {
	   	//$.datepicker.regional[""].dateFormat = 'dd-mm-yy';
		//$.datepicker.setDefaults($.datepicker.regional['']);

	    if(selectedMessageTab=='universitymessages')
		{
			var mTable = $('#'+tableID).dataTable({
							"bProcessing": true,
							"bServerSide": true,
							"bDestroy": true,
							"oLanguage": {
										  "sLoadingRecords": "Please wait - loading...",
									  },
							"processing": true,
							"sPaginationType": "full_numbers",
							"sAjaxSource": "/admin/ajaxMessagingList/"+selectedMessageTab,
							"aaSorting": [ [6,'desc']],
							"lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
							"iDisplayLength": 100,
							"aoColumns": [
								  { "mData": "loopid" ,"bSortable": false},
								  { "mData": "subject" ,"bSortable": false},
								  { "mData": "message" ,"bSortable": false},
								  { "mData": "university" },
								  { "mData": "category" },
								  { "mData": "viewtype" },
								  { "mData": "createdAt"},
								  { "mData": "actiondata","bSortable": false }
							 ],
							 /*"aoColumnDefs": [{
								"aTargets": [6] ,
								"sType": "uk_date",
								"bSortable": false
					 		}]*/
				 });
				 /*.columnFilter({
			        sPlaceHolder: "head:before",
					aoColumns: [
								 null,
								 null,
								 null,
								 null,
								 null,
								 null,
								 {type: "date-range","sType": "uk_date"},
								 null
							  ]
				 });*/
		}
		else
		{
			var mTable = $('#'+tableID).dataTable({
							"bProcessing": true,
							"bServerSide": true,
							"bDestroy": true,
							"oLanguage": {
										  "sLoadingRecords": "Please wait - loading...",
									  },
							"processing": true,
							"sPaginationType": "full_numbers",
							"sAjaxSource": "/admin/ajaxMessagingList/"+selectedMessageTab,
							"aaSorting": [ [6,'desc']],
							"lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
							"iDisplayLength": 100,
							"aoColumns": [
								  { "mData": "loopid" ,"bSortable": false},
								  { "mData": "subject" ,"bSortable": false},
								  { "mData": "message" ,"bSortable": false},
								  { "mData": "name" },
								  { "mData": "category" },
								  { "mData": "viewtype" },
								  { "mData": "createdAt"},
								  { "mData": "actiondata","bSortable": false }
							 ],
							/*"aoColumnDefs": [{
								"aTargets": [6] ,
								"sType": "uk_date",
								"bSortable": false
					 		}]*/
				 });
				 /*.columnFilter({
					sPlaceHolder: "head:before",
					aoColumns: [
								 null,
								 null,
								 null,
								 null,
								 null,
								 null,
								 {type: "date-range","sType": "uk_date"},
								 null
							  ]
				 });*/
		}

	 $('#'+tableID+'_filter input').unbind();
	 $('#'+tableID+'_filter input').bind('keyup', function(e) {
		 if(e.keyCode == 13) {
		   mTable.fnFilter(this.value);
		 }
	 });

	 $('#'+tableID).parent().addClass('table-responsive');
   }
}

function searchuniversity(unival){

	if(unival.length >= 3){

	 $.ajax({
          url: '/admin/autoFillingUniversity',
          data: {
                'universitySearch': unival
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
						c += '<div class="tt-suggestion tt-selectable" onclick="selectuinversity(\''+v.universityName+'\',\''+v.universityId+'\');">'+v.universityName+'</div>';
					});

				}else{
					c = '<div class="tt-suggestion tt-selectable">No Result Found</div>';
				}
				 $(".tt-dataset-countries").html(c);
			     $(".tt-menu").show();
              return false;
            }
            else
            {
               return false;
            }
          }
      });

	}

}
function selectuinversity(universityname,uniid){


	$("#universityid").val(uniid);
	$("#university").val(universityname);
	$(".tt-dataset-countries").html();
	$(".tt-menu").hide();

	/*if(schooldoe)
	{
		 $.ajax({
          url: '/admin/getschoolBranch',
          data: {
                'schoolBranch': schooldoe
                },
          dataType: 'json',
          type: 'POST',
          success: function(res) {
          	if(res.status=='success')
            {
            	if(res.status=='success')
            	{
            		var respond=res.data;
            		var reslen = respond.length;
	            	if(reslen > 0)
					{
		          		var c ='';
							$.each(respond, function(k, v) {
								c += '<option value="'+v.schoolBranchName+'">'+v.schoolBranchName+'</option>';
					   });

					}
					else
					{
						c = '<option value="">No Result Found</option>'
					}
					$('#BranchName').html(c);
					$('tr').removeClass("schoolbranch");
				}
				else
				{
					return false;
				}
          	}
          }
      });
	}*/
}
/*$(document).ready(function(){
    var countries = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        prefetch: 'http://snsdev7:1337/js/js/countries.json'
    });
    $('.typeahead').typeahead(null, {
        name: 'countries',
        source: countries,
        limit: 10
    });
});  */


function messagesUpdate(id, statusval, messagetype){

   $.ajax({
          url: '/admin/updateMessageStatus',
          data: {
                'id': id,
                'status':statusval,
				'messagetype':messagetype
                },
          dataType: 'json',
          type: 'POST',
          success: function(res) {


            if(res.status==200)
            {
              //fetchMessagingDetails(messagetype);

			  if(messagetype=='messaging')
			  {
				 var messaging_start_date = $('#messaging_start_date').val();
			 	 var messaging_end_date = $('#messaging_end_date').val();
			  }

			  if(messagetype=='systemmessages')
			  {
				 var messaging_start_date = $('#systemmessaging_start_date').val();
			 	 var messaging_end_date = $('#systemmessaging_end_date').val();
			  }

			  if(messagetype=='universitymessages')
			  {
				 var messaging_start_date = $('#universitymessaging_start_date').val();
			 	 var messaging_end_date = $('#universitymessaging_end_date').val();
			  }

			  filterMessagingTable(messagetype,messaging_start_date,messaging_end_date);
              return false;
            }
            else
            {
               return false;
            }
          }
      });

}




function fetchIncompleteAchList(divID,type){

	   if(document.getElementById(divID))
	   {
		var mTable = $('#'+divID).dataTable({
						"bProcessing": true,
						"bServerSide": true,
						"bDestroy": true,
						"oLanguage": {
									  "sLoadingRecords": "Please wait - loading...",
								  },
						"processing": true,
						"sPaginationType": "full_numbers",
						"sAjaxSource": "/admin/ajaxIncompleteList/"+type,
						"aaSorting": [ [8,'desc']],
						"lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
						"iDisplayLength": 50,
						"aoColumns": [
							  { "mData": "loopid" ,"bSortable": false},
							  { "mData": "applicationReference" },
							  { "mData": "name" ,"bSortable": false},
							  { "mData": "email" },
							  { "mData": "phoneNumber" },
							  { "mData": "registeredtype","bSortable": false },
							  { "mData": "practicename" },
							{ "mData": "fundingTier" },
							  { "mData": "createdAt" },
							  { "mData": "promissoryNoteSign"},
							  { "mData": "plaidLink"},
							  //{ "mData": "toDoList"},
							  { "mData": "lastScreenName" },
							  { "mData": "underwriter" }
							  //,{ "mData": "status","bSortable": false }
						 ]
			 });

		 $('#'+divID+'_filter input').unbind();
		 $('#'+divID+'_filter input').bind('keyup', function(e) {
			 if(e.keyCode == 13) {
			   mTable.fnFilter(this.value);
			 }
		 });

		 $('#'+divID).parent().addClass('table-responsive');
	   }

}

function fetchPracticePaymentList(){

	   if(document.getElementById('practicepayment_table'))
	   {
 			var mTable = $('#practicepayment_table').dataTable();
 	 		$('#practicepayment_table').parent().addClass('table-responsive');
  	   }
 }

 function linkstaffdoctorList(){

	   if(document.getElementById('linkstaff_table'))
	   {
 			var mTable = $('#linkstaff_table').dataTable();
 	 		$('#linkstaff_table').parent().addClass('table-responsive');
  	   }
 }

function fetchdefaultUsersList(){

	   if(document.getElementById('defaultusers_table'))
	   {
		var mTable = $('#defaultusers_table').dataTable({
						"bProcessing": true,
						"bServerSide": true,
						"bDestroy": true,
						"oLanguage": {
									  "sLoadingRecords": "Please wait - loading...",
								  },
						"processing": true,
						"sPaginationType": "full_numbers",
						"sAjaxSource": "/admin/ajaxDefaultUsersList",
						"aaSorting": [ [7,'desc']],
						"lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
						"iDisplayLength": 100,
						"aoColumns": [
							  { "mData": "loopid" ,"bSortable": false},
							  { "mData": "loanReference" },
							  { "mData": "name" },
							  { "mData": "email" },
							  { "mData": "phoneNumber" },
							  { "mData": "payOffAmount" },
							  { "mData": "maturityDate" },
							  { "mData": "createdAt" },
							  { "mData": "loanstatus" },
							  { "mData": "appstatus" },
							  { "mData": "remainderbtn" },
							  { "mData": "status" }


						 ]
			 });

		 $('#defaultusers_table_filter input').unbind();
		 $('#defaultusers_table_filter input').bind('keyup', function(e) {
			 if(e.keyCode == 13) {
			   mTable.fnFilter(this.value);
			 }
		 });

		 $('#defaultusers_table').parent().addClass('table-responsive');
	   }

}

function deleteselectscreen(){

	    var chks = document.getElementsByName('screenlist[]');
		var hasChecked = false;
		var checkedValues = [];
		for (var i = 0; i < chks.length; i++)
		{
			if (chks[i].checked)
			{
			  checkedValues.push(chks[i].value);
			  hasChecked = true;
			}
		}

		if (hasChecked == false)
		{
			alert("Please select at least one.");
			return false;
		}
		if (hasChecked == true)
		{

			var result = confirm("Are you sure want to delete?");
			if (result) {
				 $.ajax({
					  url: '/admin/deleteMultipleScreen',
					  data: {
							'ids': JSON.stringify(checkedValues),
							},
					  dataType: 'json',
					  type: 'POST',
					  success: function(res) {
						if(res.status==200)
						{
						  fetchIncompleteAchList();
						  return false;
						}
						else
						{
						   return false;
						}
					  }
				  });
			}

		}
		return true;
}

function fetchAdminUserList()
{
   if(document.getElementById('adminuser_table'))
   {
	var sTable = $('#adminuser_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxadminuserlist",
                    "aaSorting": [ [6,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "name" },
						  { "mData": "email" },
                          { "mData": "phoneNumber" },
						  { "mData": "role" },
						  { "mData": "practicename" ,"bSortable": false},
                          { "mData": "createdAt" },
                          { "mData": "actiondata","bSortable": false }
                     ]
         });

	 $('#adminuser_table_filter input').unbind();
	 $('#adminuser_table_filter input').bind('keyup', function(e) {
		 if(e.keyCode == 13) {
		   sTable.fnFilter(this.value);
		 }
	 });

	 $('#adminuser_table').parent().addClass('table-responsive');
   }
}


function getCommunicationLog()
{

  if(document.getElementById('endusercommunication_table'))
   {

      var clTable = $('#endusercommunication_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxcommunicationlog",
                    "aaSorting": [ [4,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
                    "iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "subject" },
                          { "mData": "description" },
                          { "mData": "logdata" },
                          { "mData": "createdAt" }
                     ]
         });

   $('#endusercommunication_table_filter input').unbind();
   $('#endusercommunication_table_filter input').bind('keyup', function(e) {
     if(e.keyCode == 13) {
       clTable.fnFilter(this.value);
     }
   });

   $('#endusercommunication_table').parent().addClass('table-responsive');

   }

}



function fetchManagelogs() {
   	if( document.getElementById( "managelogs_table" ) ) {
		var mTable = $( "#managelogs_table" ).dataTable( {
			"bProcessing": true,
			"bServerSide": true,
			"bDestroy": true,
			"oLanguage": { "sLoadingRecords": "Please wait - loading..." },
			"processing": true,
			"sPaginationType": "full_numbers",
			"sAjaxSource": "/admin/ajaxmanageloglist",
			"aaSorting": [[7,'desc']],
			"lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
			"iDisplayLength": 100,
			"aoColumns": [
				{ "mData": "loopid" ,"bSortable": false},
				{ "mData": "userreference" },
				{ "mData": "logreference" },
				{ "mData": "email" },
				{ "mData": "modulename" },
				{ "mData": "logmessage" },
				{ "mData": "remoteaddr" },
				{ "mData": "createdAt" },
				{ "mData": "actiondata","bSortable": false }
			]
         } );

		$( "#managelogs_table_filter input" ).unbind();
		$( "#managelogs_table_filter input" ).bind( "keyup", function( e ) {
			if( e.keyCode == 13 ) {
				mTable.fnFilter( this.value );
			}
		} );
		$( "#managelogs_table" ).parent().addClass( "table-responsive" );
   	}
}

function setAdminUserStatus(id, statusval){

   $.ajax({
          url: '/admin/updateAdminUserStatus',
          data: {
                'userid': id,
                'status':statusval
                },
          dataType: 'json',
          type: 'POST',
          success: function(res) {


            if(res.status==200)
            {
              fetchAdminUserList();
              return false;
            }
            else
            {
               return false;
            }
          }
      });

}

function fetchCompleteAchList( divID, type ) {
	if( document.getElementById( divID ) ) {
       	var uTable = $("#" + divID ).dataTable( {
			"bProcessing": true,
			"bServerSide": true,
			"bDestroy": true,
			"oLanguage": { "sLoadingRecords": "Please wait - loading..." },
			"processing": true,
			"sPaginationType": "full_numbers",
			"sAjaxSource": "/admin/completeapplication/" + type,
			"aaSorting": [[11,'desc']],
			"lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
			"iDisplayLength": 100,
			"aoColumns": [
				{ "mData": "loopid", "bSortable": false },
				{ "mData": "appReference" },
				{ "mData": "loanReference" },
				{ "mData": "name" },
				{ "mData": "email" },
				{ "mData": "phoneNumber" },
				{ "mData": "practicename" },
				{ "mData": "fundingtier" },
				{ "mData": "procedureDate" },
				{ "mData": "payOffAmount" },
				{ "mData": "apr" },
				{ "mData": "createdAt" },
				{ "mData": "updatedAt" }
			]
        } );
		$( "#" + divID + "_filter input" ).unbind();
		$( "#" + divID + "_filter input" ).bind( "keyup", function( e ) {
			if( e.keyCode == 13 ) {
				uTable.fnFilter( this.value );
			}
		});
		$( "#" + divID ).parent().addClass( "table-responsive" );
	}

}

function fetchBlockedAchList()
{
    if(document.getElementById('blocked_table'))
    {

		var uTable =$('#blocked_table').dataTable({
						"bProcessing": true,
						"bServerSide": true,
						"bDestroy": true,
						"oLanguage": {
									  "sLoadingRecords": "Please wait - loading...",
								  },
						"processing": true,
						"sPaginationType": "full_numbers",
						"sAjaxSource": "/admin/ajaxBlockedAch",
						"aaSorting": [ [7,'desc']],
						"lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
						"iDisplayLength": 50,
						"aoColumns": [
							  { "mData": "loopid" ,"bSortable": false},
							  { "mData": "applicationReference" ,"bSortable": false},
							  { "mData": "name" ,"bSortable": false},
							  //{ "mData": "directMail" },
							  //{ "mData": "badList" },
							  { "mData": "email" },
							  { "mData": "phoneNumber" },
							  { "mData": "practicename" },
							  { "mData": "registeredtype","bSortable": false },
							  { "mData": "createdAt" },
							  { "mData": "promissoryNoteSign" ,"bSortable": false },
							  { "mData": "plaidLink" ,"bSortable": false },
							  { "mData": "toDoList" ,"bSortable": false },
							  { "mData": "lastScreenName" },
							  { "mData": "underwriter" },
							  { "mData": "status","bSortable": false }
						 ]
			 });


         $('#blocked_table_filter input').unbind();
         $('#blocked_table_filter input').bind('keyup', function(e) {
             if(e.keyCode == 13) {
               uTable.fnFilter(this.value);
             }
         });

         $('#blocked_table').parent().addClass('table-responsive');
     }
}

function editemail(){

	document.getElementById('changeemaildiv').style.display='block';

}
function editphone(){

	document.getElementById('changephonediv').style.display='block';

}

function searchindividual(unival){

	if(unival.length > 3){

	 $.ajax({
          url: '/admin/autoFillingUserdetails',
          data: {
                'userSearch': unival
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
						c += '<div class="tt-suggestion tt-selectable" onclick="selectusername(\''+v.userName+'\',\''+v.userId+'\',\''+v.userEmail+'\');">'+v.userName+' - '+v.userEmail+' - '+v.userPhone+'</div>';
					});

				}else{
					c = '<div class="tt-suggestion tt-selectable" onclick="selectnoresult()">No Result Found</div>';
				}
				 $(".tt-dataset-countries").html(c);
			     $(".tt-menu1").show();
              return false;
            }
            else
            {
               return false;
            }
          }
      });

	}

}

function selectusername(username,uniid,useremail){

	$("#individualid").val(uniid);
	$("#username").val(username);
	$("#useremailphone").val(useremail);
	//$("#useremailphone").attr('readonly','readonly');
	$(".tt-dataset-countries").html();
	$(".tt-menu1").hide();

}
function selectnoresult(){

	$(".tt-menu1").hide();
}

function searchemailphone(unival){

	if(unival.length > 3){

	 $.ajax({
          url: '/admin/autoFillingUseremail',
          data: {
                'userSearch': unival
                },
          dataType: 'json',
          type: 'POST',
          success: function(res) {

            if(res.status=='success')
            {
				if(/^\d+$/.test(unival)) {
					var searchval ='phone';
			   }else{
					var searchval ='email';
			   }
				var respond=res.data;
				var reslen = respond.length;
				if(reslen > 0)
				{
					var c ='';
					$.each(respond, function(k, v) {
						if(searchval=='phone'){
							selectres = v.userPhone;
						}else{
							selectres = v.userEmail;
						}
						c += '<div class="tt-suggestion tt-selectable" onclick="selectuseremail(\''+v.userName+'\',\''+v.userId+'\',\''+selectres+'\');">'+v.userName+' - '+v.userEmail+' - '+v.userPhone+'</div>';
					});

				}else{
					c = '<div class="tt-suggestion tt-selectable" onclick="selectnoresult()">No Result Found</div>';
				}
				 $(".tt-dataset-countries").html(c);
			     $(".tt-menu2").show();
              return false;
            }
            else
            {
               return false;
            }
          }
      });

	}

}

function selectuseremail(username,uniid,useremail){

	//$("#emailphoneid").val(uniid);
	$("#individualid").val(uniid);
	$("#useremailphone").val(useremail);
	$("#username").val(username);
	//$("#username").attr('readonly','readonly');
	$(".tt-dataset-countries").html();
	$(".tt-menu2").hide();

}
$(document).click(function(){
    $(".tt-menu2").hide();
	$(".tt-menu1").hide();
});


function changephonenumber(){

	document.getElementById('editphonediv').style.display='block';

}

function fetchBadgesDetails()
{
   if(document.getElementById('badges_table'))
   {
	var mTable = $('#badges_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxBadgesList",
                    "aaSorting": [ [9,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "title"},
                          { "mData": "subtitle"},
						  { "mData": "note" ,"bSortable": false},
                          { "mData": "image" ,"bSortable": false},
                          { "mData": "conditionlabel","bSortable": false },
						  { "mData": "conditionlogic","bSortable": false },
						  { "mData": "conditiontype","bSortable": false },
						  { "mData": "conditionvalue","bSortable": false },
						  { "mData": "createdAt" },
						  { "mData": "actiondata","bSortable": false }
                     ]
         });

	 $('#badges_table_filter input').unbind();
	 $('#badges_table_filter input').bind('keyup', function(e) {
		 if(e.keyCode == 13) {
		   mTable.fnFilter(this.value);
		 }
	 });

	 $('#badges_table').parent().addClass('table-responsive');
   }
}

function setBadgeStatus(id, statusval){

   $.ajax({
          url: '/admin/updateBadgeStatus',
          data: {
                'badgeid': id,
                'status':statusval
                },
          dataType: 'json',
          type: 'POST',
          success: function(res) {


            if(res.status==200)
            {
              fetchBadgesDetails();
              return false;
            }
            else
            {
               return false;
            }
          }
      });

}

function checknewlabel(val)
{
	if(val=='new')
	{
		 $("#newconditionlabeldiv").show();
		 $('#newconditionlabel').attr('required', 'required');
	}
	else
	{
		 $("#newconditionlabeldiv").hide();
		 $('#newconditionlabel').removeAttr('required');
	}
}

function fetchReconciliationDetails()
{
    if(document.getElementById('reconciliation_table'))
	{
		var rTable = $('#reconciliation_table').dataTable({
						"bProcessing": true,
						"bServerSide": true,
						"bDestroy": true,
						"oLanguage": {
									  "sLoadingRecords": "Please wait - loading...",
								  },
						"processing": true,
						"sPaginationType": "full_numbers",
						"sAjaxSource": "/admin/ajaxReconciliationList",
						"aaSorting": [ [12,'desc']],
						"lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
						"iDisplayLength": 100,
						"aoColumns": [
							   	  { "mData": "loopid" ,"bSortable": false},
								  { "mData": "loanID" },
								  { "mData": "name" },
								  { "mData": "screenName" },
								  { "mData": "email" },
								  { "mData": "phoneNumber" },
								  { "mData": "achAmount" },
								  { "mData": "methodtype" },
								  { "mData": "apiresponsestatus","bSortable": false },
								  { "mData": "apitransactiontatus","bSortable": false },
								  { "mData": "appfailure","bSortable": false },
								  { "mData": "appfailuremessage" ,"bSortable": false},
								  { "mData": "createdAt","bSortable": false },
								  { "mData": "actiondata","bSortable": false }
						 ]
			 });

		 $('#reconciliation_table_filter input').unbind();
		 $('#reconciliation_table_filter input').bind('keyup', function(e) {
			 if(e.keyCode == 13) {
			   rTable.fnFilter(this.value);
			 }
		 });

		 $('#reconciliation_table').parent().addClass('table-responsive');
	}
}


function fetchUserTrackingList(userid)
{
    if(document.getElementById('usertracking_table'))
	{
		var tTable = $('#usertracking_table').dataTable({
						"bProcessing": true,
						"bServerSide": true,
						"bDestroy": true,
						"oLanguage": {
									  "sLoadingRecords": "Please wait - loading...",
								  },
						"processing": true,
						"sPaginationType": "full_numbers",
						"sAjaxSource": "/admin/ajaxUserTrackingList/"+userid,
						"aaSorting": [ [8,'desc']],
						"lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
						"iDisplayLength": 100,
						"aoColumns": [
							   	  { "mData": "loopid" ,"bSortable": false},
								  { "mData": "latitudedata" },
								  { "mData": "longitudedata" },
								  { "mData": "locality" },
								  { "mData": "city" },
								  { "mData": "state" },
								  { "mData": "country" },
								  { "mData": "postalcode" },
								  { "mData": "createdAt" }
						 ]
			 });

		 $('#usertracking_table_filter input').unbind();
		 $('#usertracking_table_filter input').bind('keyup', function(e) {
			 if(e.keyCode == 13) {
			   tTable.fnFilter(this.value);
			 }
		 });

		 $('#usertracking_table').parent().addClass('table-responsive');
	}
}

function fetchDeniedAchList( divID, type ) {
	if( document.getElementById( divID ) ) {
       	var dTable = $( '#' + divID ).dataTable( {
			"bProcessing": true,
			"bServerSide": true,
			"bDestroy": true,
			"oLanguage": { "sLoadingRecords": "Please wait - loading..." },
			"processing": true,
			"sPaginationType": "full_numbers",
			"sAjaxSource": "/admin/completeapplication/" + type,
			"aaSorting": [[8,'desc']],
			"lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
			"iDisplayLength": 100,
			"aoColumns": [
				{ "mData": "loopid" ,"bSortable": false },
				{ "mData": "appReference" },
				{ "mData": "loanReference" },
				{ "mData": "name" },
				{ "mData": "email" },
				{ "mData": "phoneNumber" },
				{ "mData": "practicename" },
				{ "mData": "fundingtier" },
				{ "mData": "createdAt" },
				{ "mData": "updatedAt" },
				{ "mData": "status" },
				{ "mData": "registeredtype" }
			]
		} );
		$( '#' + divID + '_filter input' ).unbind();
		$( '#' + divID + '_filter input' ).bind( 'keyup', function( e ) {
			if( e.keyCode == 13 ) {
			dTable.fnFilter( this.value );
			}
		} );
        $( '#' + divID ).parent().addClass( 'table-responsive' );
    }
}


function showUserTrackingMap(userid)
{
	if(document.getElementById('map_usertracking'))
	{
		$.ajax({
          url: "/admin/showUserTrackingMap/",
          data: {
                'userID': userid
                },
          dataType: 'json',
          type: 'POST',
          success: function(res) {

			//alert("status: "+res.status);
            if(res.status==200)
            {
				var obj = res.data;
				var latitude = parseFloat(res.latitude);
				var longitude = parseFloat(res.longitude);
				if(obj.length>0)
				{
					$("#map_usertracking").show();
					initMap(obj,latitude,longitude);
				}
				else
				{
					$("#map_usertracking").hide();
				}
            }
            else
			{
				$("#map_usertracking").hide();
			}
          }
      });
	}
}

function initMap(obj,latitude,longitude) {

	var myLatLng = {lat: latitude, lng: longitude};

	var map;
	var mapOptions = {
		mapTypeId: 'roadmap',
		zoom: 8,
		center: myLatLng
	};
	map = new google.maps.Map(document.getElementById("map_usertracking"), mapOptions);

	for(var i = 0; i < obj.length; i++) {

		var objdata = obj[i];
		var latitudedata  = parseFloat(objdata.latitudedata);
		var longitudedata = parseFloat(objdata.longitudedata);

		//alert("lat: "+latitudedata);
		//alert("long: "+longitudedata);

		var userLatLng = {lat: latitudedata, lng: longitudedata};

		var marker = new google.maps.Marker({
          position: userLatLng,
          map: map
    	});
	}
}

function fetchUserContactsList(userid)
{
  if(document.getElementById('usercontacts_table'))
  {
  	   //alert("userid:"+userid);
	   var ucTable = $('#usercontacts_table').dataTable({
						"bProcessing": true,
						"bServerSide": true,
						"bDestroy": true,
						"oLanguage": {
									  "sLoadingRecords": "Please wait - loading...",
								  },
						"processing": true,
						"sPaginationType": "full_numbers",
						"sAjaxSource": "/admin/ajaxUserContactsList/"+userid,
						"aaSorting": [ [1,'desc']],
						"lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
						"iDisplayLength": 100,
						"aoColumns": [
							   	  { "mData": "loopid" ,"bSortable": false},
								  { "mData": "email" },
								  { "mData": "phoneno" },
								  { "mData": "status" },
								  { "mData": "referred" }
						 ]
			 });

		 $('#usercontacts_table_filter input').unbind();
		 $('#usercontacts_table_filter input').bind('keyup', function(e) {
			 if(e.keyCode == 13) {
			   ucTable.fnFilter(this.value);
			 }
		 });

		 $('#usercontacts_table').parent().addClass('table-responsive');
  }
}

function showaddtransunionform()
{
	$("#showaddtransunionform").toggle();
}

function addincompleteachcommnet(){

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
          success: function(res) {


            if(res.status==200)
            {
              fetchScreentrackingCommentsList(userId);
			   $("#subject").val('');
               $("#comments").val('');
              return false;
            }
            else
            {

               return false;
            }
          }
      });

}

function fetchScreentrackingCommentsList(userId){

    var cTable = $('#screencomments_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxScreentrackingComments/"+userId,
                    "aaSorting": [ [0,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "subject" },
                          { "mData": "comments" },
						  { "mData": "adminemail" },
                          { "mData": "createdAt" }
                     ]
         });

	 $('#screencomments_table_filter input').unbind();
	 $('#screencomments_table_filter input').bind('keyup', function(e) {
		 if(e.keyCode == 13) {
		   cTable.fnFilter(this.value);
		 }
	 });

	 $('#screencomments_table').parent().addClass('table-responsive');
}


/*$('#daterange-btn').daterangepicker(
      {
        ranges   : {
          'Today'       : [moment(), moment()],
          'Yesterday'   : [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          'Last 7 Days' : [moment().subtract(6, 'days'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days'), moment()],
          'This Month'  : [moment().startOf('month'), moment().endOf('month')],
          'Last Month'  : [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        startDate: moment().subtract(29, 'days'),
        endDate  : moment()
      },
      function (start, end) {
        $('#daterange-btn span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'))
      }
 )*/
//$('#reservation').daterangepicker()

/*$('#filterusermessagedate').daterangepicker({},
function(start, end, label) {
    //alert("A new date range was chosen: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));

	$('#messaging_table_range_from_6').val(start.format('MM/DD/YYYY'));
	$('#messaging_table_range_to_6').val(end.format('MM/DD/YYYY'));
	fetchMessagingDetails('messaging');
});*/


$(document).on("click", "#messaging_table_filterdate", function(){
	var messaging_start_date = $('#messaging_start_date').val();
	var messaging_end_date = $('#messaging_end_date').val();

	if(messaging_start_date!= '' &&  messaging_end_date!= '' )
	{
		var eDate = new Date(messaging_end_date);
    	var sDate = new Date(messaging_start_date);

		if (sDate> eDate)
		{
			//alert("Please ensure that the End Date is greater than or equal to the Start Date.");
			 $('#displaymessage_error').text("Ensure end date is greater than or equal to start date.").fadeIn().delay(3000).fadeOut();
		}
		else
		{
			filterMessagingTable('messaging',messaging_start_date,messaging_end_date);
		}
    }
	else
	{
		//alert("Please enter valid Date.");
		 $('#displaymessage_error').text("Please enter valid date.").fadeIn().delay(3000).fadeOut();
	}
	return false;
});

$(document).on("click", "#systemmessaging_table_filterdate", function(){
	var systemmessaging_start_date = $('#systemmessaging_start_date').val();
	var systemmessaging_end_date = $('#systemmessaging_end_date').val();

	if(systemmessaging_start_date!= '' &&  systemmessaging_end_date!= '' )
	{
		var eDate = new Date(systemmessaging_end_date);
    	var sDate = new Date(systemmessaging_start_date);

		if (sDate> eDate)
		{
			 $('#displaysystemmessage_error').text("Ensure end date is greater than or equal to start date.").fadeIn().delay(3000).fadeOut();
		}
		else
		{
			filterMessagingTable('systemmessages',systemmessaging_start_date,systemmessaging_end_date);
		}
    }
	else
	{
		 $('#displaysystemmessage_error').text("Please enter valid date.").fadeIn().delay(3000).fadeOut();
	}
	return false;
});

$(document).on("click", "#universitymessaging_table_filterdate", function(){
	var universitymessaging_start_date = $('#universitymessaging_start_date').val();
	var universitymessaging_end_date = $('#universitymessaging_end_date').val();

	if(universitymessaging_start_date!= '' &&  universitymessaging_end_date!= '' )
	{
		var eDate = new Date(universitymessaging_end_date);
    	var sDate = new Date(universitymessaging_start_date);

		if (sDate> eDate)
		{
			 $('#displayuniversitymessage_error').text("Ensure end date is greater than or equal to start date.").fadeIn().delay(3000).fadeOut();
		}
		else
		{
			filterMessagingTable('universitymessages',universitymessaging_start_date,universitymessaging_end_date);
		}
    }
	else
	{
		 $('#displayuniversitymessage_error').text("Please enter valid date.").fadeIn().delay(3000).fadeOut();
	}
	return false;
});



$(document).on("click", "#universitymessaging_filter", function(){

	var universitymessaging_start_date = $('#universitymessaging_start_date').val();
	var universitymessaging_end_date = $('#universitymessaging_end_date').val();

	if(universitymessaging_start_date!= '' &&  universitymessaging_end_date!= '' )
	{
		var eDate = new Date(universitymessaging_end_date);
    	var sDate = new Date(universitymessaging_start_date);

		if (sDate> eDate)
		{
			 $('#displayuniversitymessage_error').text("Ensure end date is greater than or equal to start date.").fadeIn().delay(3000).fadeOut();
		}
		else
		{
			var university = $('#university').val();

			if ("undefined" === typeof university || university=='' || university==null)
			{
				 $('#displayuniversitymissing_error').text("Please enter university name.").fadeIn().delay(3000).fadeOut();
			}
			else
			{
				filterMessagingTable('universitymessages',universitymessaging_start_date,universitymessaging_end_date);
			}
		}
    }
	else
	{
		 $('#displayuniversitymessage_error').text("Please enter valid date.").fadeIn().delay(3000).fadeOut();
	}
	return false;
});



function filterMessagingTable(selectedMessageTab,messaging_start_date,messaging_end_date)
{
	var tableID = selectedMessageTab+'_table';

	if(selectedMessageTab=='universitymessages')
	{
			var messaging_table = $('#'+tableID).dataTable({
							"bProcessing": true,
							"bServerSide": true,
							"bDestroy": true,
							"oLanguage": {
										  "sLoadingRecords": "Please wait - loading...",
									  },
							"processing": true,
							"sPaginationType": "full_numbers",
							"sAjaxSource": "/admin/ajaxMessagingList/"+selectedMessageTab,
							"fnServerParams": function ( aoData ) {
												aoData.push( { "name": "start_date", "value": messaging_start_date } );
												aoData.push( { "name": "end_date", "value": messaging_end_date } );

												var university = $('#university').val();
												if ("undefined" !== typeof university && university!='' && university!=null)
												{
												 	var universityid = $('#universityid').val();
													if ("undefined" !== typeof universityid && universityid!='' && universityid!=null)
													{
														aoData.push( { "name": "universityID", "value": universityid } );
													}
												}

							},
							"aaSorting": [ [6,'desc']],
							"lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
							"iDisplayLength": 100,
							"aoColumns": [
								  { "mData": "loopid" ,"bSortable": false},
								  { "mData": "subject" ,"bSortable": false},
								  { "mData": "message" ,"bSortable": false},
								  { "mData": "university" },
								  { "mData": "category" },
								  { "mData": "viewtype" },
								  { "mData": "createdAt"},
								  { "mData": "actiondata","bSortable": false }
							 ]
				 });

		}
		else
		{
			var  messaging_table = $('#'+tableID).dataTable({
										"bProcessing": true,
										"bServerSide": true,
										"bDestroy": true,
										"oLanguage": {
													  "sLoadingRecords": "Please wait - loading...",
												  },
										"processing": true,
										"sPaginationType": "full_numbers",
										"sAjaxSource": "/admin/ajaxMessagingList/"+selectedMessageTab,
										"fnServerParams": function ( aoData ) {
												aoData.push( { "name": "start_date", "value": messaging_start_date } );
												aoData.push( { "name": "end_date", "value": messaging_end_date } );
										},
										"aaSorting": [ [6,'desc']],
										"lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
										"iDisplayLength": 100,
										"aoColumns": [
										  { "mData": "loopid" ,"bSortable": false},
										  { "mData": "subject" ,"bSortable": false},
										  { "mData": "message" ,"bSortable": false},
										  { "mData": "name" },
										  { "mData": "category" },
										  { "mData": "viewtype" },
										  { "mData": "createdAt"},
										  { "mData": "actiondata","bSortable": false }
										]
								});
		}

	 $('#'+tableID+'_filter input').unbind();
	 $('#'+tableID+'_filter input').bind('keyup', function(e) {
		 if(e.keyCode == 13) {
		   messaging_table.fnFilter(this.value);
		 }
	 });

	 $('#'+tableID).parent().addClass('table-responsive');
}


function fetchReferralDetails()
{
   if(document.getElementById('referrals_table'))
   {


	var mTable = $('#referrals_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxReferralList",
                    "aaSorting": [ [7,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "partner"},
                          { "mData": "product"},
						 						  { "mData": "baserurl" ,"bSortable": false},
                          { "mData": "redirecturl" ,"bSortable": false},
													{ "mData": "expirySet" },
													{ "mData": "expiryDate" },
						 							{ "mData": "createdAt" },
						  						{ "mData": "actiondata","bSortable": false }
                     ]
         });

	 $('#referrals_table_filter input').unbind();
	 $('#referrals_table_filter input').bind('keyup', function(e) {
		 if(e.keyCode == 13) {
		   mTable.fnFilter(this.value);
		 }
	 });

	 $('#referrals_table').parent().addClass('table-responsive');
   }
}
function checknewpartner(val)
{
	if(val=='new')
	{
		 $("#newpartnername").show();
		 $('#partnername').attr('required', 'required');
	}
	else
	{
		 $("#newpartnername").hide();
		 $('#partnername').removeAttr('required');


         var partnername = $("#partner option:selected").text();
		 $('#selpartnername').val(partnername);

		 $('#product').html('');
		 $.ajax({
			  url: '/admin/getproductlist',
			  data: {
					'partnerID': val
					},
			  dataType: 'json',
			  type: 'POST',
			  success: function(res) {
				    $('#product').append('<option value=""> --- Select --- </option>');
				    $.each(res.productlist, function(i, value) {
						$('#product').append($('<option>').text(value.product).attr('value', value.product));
					});
					$('#product').append('<option disabled>----------------</option>');
					$('#product').append('<option value="new"> --- Add New Product --- </option>');
			  }
		 });

	}
}
function checknewproduct(val)
{
	if(val=='new')
	{
		 $("#newproductname").show();
		 $('#productname').attr('required', 'required');
	}
	else
	{
		 $("#newproductname").hide();
		 $('#productname').removeAttr('required');
	}
}

function setReferralStatus(id, statusval){

   $.ajax({
          url: '/admin/updateReferralStatus',
          data: {
                'productid': id,
                'status':statusval
                },
          dataType: 'json',
          type: 'POST',
          success: function(res) {


            if(res.status==200)
            {
              fetchReferralDetails();
              return false;
            }
            else
            {
               return false;
            }
          }
      });

}
 function selectreferral(selshow){

	    if(selshow=='referral'){
			$("#universityoption").hide();
			$("#referralpartner").show();
			$("#referralproduct").show();
			 $('#product').attr('required', 'required');
			 $('#partner').attr('required', 'required');
		}else{
			$("#universityoption").show();
			$("#referralpartner").hide();
			$("#referralproduct").hide();
			$('#product').removeAttr('required', 'required');
			$('#partner').removeAttr('required', 'required');
		}

}
$(document).ready(function(){
	$("#referralpartner").hide();
	$("#referralproduct").hide();
});

function showpartner(val)
{

	 var partnername = $("#partner option:selected").text();
	 $('#selpartnername').val(partnername);

	 $('#product').html('');
	 $.ajax({
		  url: '/admin/getproductlist',
		  data: {
				'partnerID': val
				},
		  dataType: 'json',
		  type: 'POST',
		  success: function(res) {
				$('#product').append('<option value=""> --- Select --- </option>');
				$.each(res.productlist, function(i, value) {
					$('#product').append($('<option>').text(value.product).attr('value', value.id));
				});
		  }
	 });

}

$(document).on("click", "#productserach_filter", function(){

	var partnerval = $('#partner').val();
	var productval = $('#product').val();



	if(partnerval!= '' &&  productval!= '' )
	{
		filterReferralSearchTable(partnerval,productval,'searchbyproduct');
    }
	else
	{
		if(partnerval== ''){
		  $('#displaysearch_error').css('margin-left','20px');
		  $('#displaysearch_error').text("Please select partner").fadeIn().delay(3000).fadeOut();
		}
		else if(productval== ''){
		  $('#displaysearch_error').css('margin-left','225px');
		  $('#displaysearch_error').text("Please select product").fadeIn().delay(3000).fadeOut();
		}
	}
	return false;
});

$(document).on("click", "#referralreport_filterdate", function(){

	var report_start_date = $('#report_start_date').val();
	var report_end_date = $('#report_end_date').val();

	if(report_start_date!= '' &&  report_end_date!= '' )
	{
		var eDate = new Date(report_end_date);
    	var sDate = new Date(report_start_date);

		if (sDate> eDate)
		{
			 $('#displaydatesearch_error').text("Ensure end date is greater than or equal to start date.").fadeIn().delay(3000).fadeOut();
		}
		else
		{
			filterReferralSearchTable(report_start_date,report_end_date,'searchbydate');
		}
    }
	else
	{
		 $('#displaydatesearch_error').text("Please enter valid date.").fadeIn().delay(3000).fadeOut();
	}
	return false;
});


function filterReferralSearchTable(partnerval,productval,searchtype){


    var cTable = $('#rederralreport_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxReferralReport",
					"fnServerParams": function ( aoData ) {
						if(searchtype=='searchbyproduct'){
							aoData.push( { "name": "partnerval", "value": partnerval } );
							aoData.push( { "name": "productval", "value": productval } );
						}else{
							aoData.push( { "name": "start_date", "value": partnerval } );
							aoData.push( { "name": "end_date", "value": productval } );
						}
					},
                    "aaSorting": [ [7,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "name" },
                          { "mData": "email" },
						  { "mData": "phoneNumber" },
						  { "mData": "product" },
						  { "mData": "partner" },
						  { "mData": "referraltype" },
                          { "mData": "createdAt" }
                     ]
         });

	 $('#rederralreport_table_filter input').unbind();
	 $('#rederralreport_table_filter input').bind('keyup', function(e) {
		 if(e.keyCode == 13) {
		   cTable.fnFilter(this.value);
		 }
	 });

	 $('#rederralreport_table').parent().addClass('table-responsive');
}


function storyinfopopup(type,typecount)
{
	if(type=='dislike')
	{
		$('#storyinfopopupheader').html('<b>Story Dislike Information</b>');
	}
	else
	{
		$('#storyinfopopupheader').html('<b>Story Like Information</b>');
	}

	if(typecount>=0)
	{
		var paymentID = $('#paymentID').val();
		$.ajax({
		  url: '/admin/storyuserviewinfo',
		  data: {
				'type': type,'typecount': typecount,'paymentID': paymentID
				},
		  dataType: 'json',
		  type: 'POST',
		  success: function(res) {
			if(res.status==200)
			{
			  var len = res.data.length;
			  if(len>0)
			  {
				  var bodyContent='';
				  bodyContent= bodyContent+'<table class="table table-bordered"><tbody><tr><th>SNO</th><th>User Reference</th><th>Email address</th></tr>' ;
				  for (var i = 0; i < len; i++) {
					/*bodyContent= bodyContent+'<tr><td>'+i+'</td><td>'+res.data[i].userReference+'</td><td>'+res.data[i].name+'</td><td>'+res.data[i].screenName+'</td><td>'+res.data[i].email+'</td><td>'+res.data[i].phoneNumber+'</td></tr>' ; */

					var loopcount =parseInt(i)+1
					bodyContent= bodyContent+'<tr><td>'+loopcount+'</td><td>'+res.data[i].userReference+'</td><td>'+res.data[i].email+'</td></tr>' ;
				  }
				  bodyContent= bodyContent+'</tbody></table>';
				  $('#storyinfopopupcontent').html(bodyContent);
				  $('#storyinfopopup').modal('toggle');
				  return false;
			  }
			  else
			  {
				$('#storyinfopopupcontent').html('No information found');
			    $('#storyinfopopup').modal('toggle');
			    return false;
			  }
			}
			else
			{
			   $('#storyinfopopupcontent').html('No information found');
			   $('#storyinfopopup').modal('toggle');
			   return false;
			}
		  }
	  });
	  return false;
	}
	else
	{
	   $('#storyinfopopupcontent').html('No information found');
	   $('#storyinfopopup').modal('toggle');
	   return false;
	}
	return false;
}

function fetchCreditManagerUserList()
{
   if(document.getElementById('creditmanageuser_table'))
   {
		var cuTable = $('#creditmanageuser_table').dataTable({
						"bProcessing": true,
						"bServerSide": true,
						"bDestroy": true,
						"oLanguage": {
									  "sLoadingRecords": "Please wait - loading...",
								  },
						"processing": true,
						"sPaginationType": "full_numbers",
						"sAjaxSource": "/admin/ajaxcreditmonitoringuserlist",
						"aaSorting": [ [7,'desc']],
						"lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
						"iDisplayLength": 100,
						"aoColumns": [
							  { "mData": "loopid" ,"bSortable": false},
							  { "mData": "first_name" },
							  { "mData": "last_name" },
							  { "mData": "credit_email" },
							  { "mData": "validityDate" },
							  { "mData": "active"},
							  { "mData": "createdAt" },
							  { "mData": "actiondata","bSortable": false }
						 ]
			 });

		 $('#creditmanageuser_table_filter input').unbind();
		 $('#creditmanageuser_table_filter input').bind('keyup', function(e) {
			 if(e.keyCode == 13) {
			   cuTable.fnFilter(this.value);
			 }
		 });

		 $('#creditmanageuserr_table').parent().addClass('table-responsive');
	}
}

function checkdocstatus(){

	$('#tcpadocument').modal('hide');
	$('#creditpulldocument').modal('hide');
	$('#eftconsentservice').modal('hide');
	$('#kuber').prop('checked', true);
	$('#eft_consent').prop('checked', true);
	$('#privacy-policy-document').modal('hide');
	$('#privacyconfirm').prop('checked', true);
}

$('#docutype').on('change', function() {
		var doc_type = $(this).val();
		var userId = $("#userId").val();
				if(doc_type) {
				$.ajax({
					url: '/servicegetuploadeddocuments',
					data: {
					'doc_type': doc_type,
					'userId': userId
					},
					dataType: 'json',
					type: 'POST',
					success: function(res) {
						var exist = res.responsedata;
						if(exist == '1') {
							$(".existsdoc").show();
							$("#proofdocument").attr('disabled',true);
							$("#updocs").attr('disabled',true);
						}else{
							$(".existsdoc").hide();
							$("#proofdocument").attr('disabled',false);
							$("#updocs").attr('disabled',false);
							}
					}
				});
				}
	});






if(document.getElementById('registeruser_table'))
{
 fetchRegisterUserList();
}

 function fetchRegisterUserList()
{
   if(document.getElementById('registeruser_table'))
   {
	var sTable = $('#registeruser_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxregisteruserlist",
                    "aaSorting": [ [7,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
					"iDisplayLength": 50,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
						  { "mData": "userReference" },
                          { "mData": "name" },
						  { "mData": "email" },
                          { "mData": "phoneNumber" },
						  { "mData": "registeredtype" ,"bSortable": false },
						  { "mData": "allowsocialnetwork" ,"bSortable": false },
                          { "mData": "createdAt" },
                     ]
         });

	 $('#registeruser_table_filter input').unbind();
	 $('#registeruser_table_filter input').bind('keyup', function(e) {
		 if(e.keyCode == 13) {
		   sTable.fnFilter(this.value);
		 }
	 });

	 $('#registeruser_table').parent().addClass('table-responsive');
   }
}

   function fetchAllusersCommentsList(user_Id){
	       var cTable = $('#Allusers_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxAllusersComments/"+user_Id,
                    "aaSorting": [ [0,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "subject" },
                          { "mData": "comments" },
						  { "mData": "adminemail" },
                          { "mData": "createdAt" }
                     ]
         });

	 $('#Allusers_table_filter input').unbind();
	 $('#Allusers_table_filter input').bind('keyup', function(e) {
		 if(e.keyCode == 13) {
		   cTable.fnFilter(this.value);
		 }
	 });

	 $('#Allusers_table').parent().addClass('table-responsive');
}

function addachcommnetalluser(){

  var subject = $("#subject").val();
  var comments = $("#comments").val();
  var userId = $("#user_Id").val();
  var screenId = $("#screen_Id").val();

  if(subject == ''){
		$("#subject").addClass("BorderError");
	}else{
		$("#subject").removeClass("BorderError");
	}
	if(comments == ''){
		$("#comments").addClass("BorderError");
	}else{
		$("#comments").removeClass("BorderError");
	}
	if(subject == '' || comments == ''){
		return false;
	}else{
		$("#commentUser").attr("disabled", true);
	}

   $.ajax({
          url: '/admin/addAlluserComments',
          data: {
		        'subject': subject,
				'comments': comments,
                'user_Id': userId,
				'status':'1',
				'screenId':screenId
                },
          dataType: 'json',
          type: 'POST',
          success: function(res) {
              $("#commentUser").attr("disabled", false);

            if(res.status==200)
            {
              fetchAllusersCommentsList(userId);
			   $("#subject").val('');
               $("#comments").val('');
              return false;
            }
            else
            {

               return false;
            }
          }
      });

}

function editNameDetails(){
	document.getElementById("nameerror").innerHTML = "";
	var x = document.getElementById("changenamediv");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function editAddressDetails(type,data){
	$("#changetype").val(type);
	$("#addressdata").val(data);
	var addresslabel = 	type.charAt(0).toUpperCase() + type.slice(1)+' :';
	$('#addresslabel').html(addresslabel);
	document.getElementById("addressrror").innerHTML = "";
	document.getElementById("addressmessage").innerHTML = "";
	var x = document.getElementById("changeaddressdiv");
	x.style.display = "block";

}

function canceladdressbtn(){
	document.getElementById("addressmessage").innerHTML = "";
	document.getElementById("addressrror").innerHTML = "";
	var x = document.getElementById("changeaddressdiv");
	x.style.display = "none";
	return false;
}

function Validate() {
	var docutype = document.getElementById("docutype");
	if (docutype.value == "Others") {
		$("#documentname").show();

		if(document.getElementById("documentname").value == ""){
			$('#documentname').addClass('error');
			$("#updocs").attr("disabled", false);
			return false;
		}else{

			if(document.getElementById("proofdocument").value == "") {
				$('#documentname').removeClass('error');
				$("#updocs").attr("disabled", false);
			}
			else {
			    $('#desc').submit();
				$('#documentname').removeClass('error');
				$("#updocs").attr("disabled", true);
			}
		}
	}else{

		if(document.getElementById("proofdocument").value == "") {
			$("#updocs").attr("disabled", false);
		}
		else {
		    $('#desc').submit();
			$("#docuNameCheck").hide();
			$("#updocs").attr("disabled", true);
		}
	}
}

function editScheduleDate(seltransaction,modalstatus){

  if(modalstatus=='open' && seltransaction!=''){
   $('#transaction').val(seltransaction);
   $('#ScheduleModal').modal('show');
  }else{
   $('#transaction').val('');
   $('#ScheduleModal').modal('hide');
  }

}
function editScheduleAmount(seltransaction,modalstatus,scheduleamount){

  if(modalstatus=='open' && seltransaction!=''){
    $('#amounttransaction').val(seltransaction);
    $('#ScheduleAmountModal').modal('show');
    $('#oldscheduleamount').val(scheduleamount);
  }else{
    $('#amounttransaction').val('');
    $('#ScheduleAmountModal').modal('hide');
    $('#oldscheduleamount').val('');
  }

}

function amountvalidate(){
    var oldamount = $('#oldscheduleamount').val();
	oldamount =oldamount.replace('$','');
	var newamount =$('#scheduleamount').val();
	if (parseFloat(newamount)>=1 && parseFloat(newamount)<=parseFloat(oldamount)) {
		return true
	}else{
		alert("Must be between 1 and "+oldamount)
		return false
	}
}

function addmanualschedule(modalstatus){

  if(modalstatus=='open'){
   $('#ManualScheduleModal').modal('show');
  }else{
   $('#ManualScheduleModal').modal('hide');
  }


}

function changepaymentoption(){

  var payoption = $('input[name="paymentOption"]:checked').val();
  if(payoption=='useramount')
  {
   $('#fullpaymentrow').hide();
   $('#paymentrow').show();
  }else{
   $('#fullpaymentrow').show();
   $('#paymentrow').hide();
   $('#makeamount').val('');
  }

}
function makefullpayment(payoption){

  var payoption = $('input[name="paymentOption"]:checked').val();
  if(payoption=='fullpayment')
  {
  	var commentBox = $("#reasoncommentMake").val();
	var fullintrestamount = $("#fullintrestamount").val();
	//alert(fullintrestamount);
	if(fullintrestamount == ''){
	    $('#Interesterromessage').show();
	}else if(commentBox == ''){
		//alert('Please enter Comment');
		 $('#Interesterromessage').hide();
		 $('#commenterromessage').show();
	}else{
	     $('#commenterromessage').hide();
		  $('#Interesterromessage').hide();
		var r = confirm('Are you sure you want to make full payment for this loan?');
		if (r) {
			document.makepayment.submit();
		}
	}
  }else{
    var makeamount = $('#makeamount').val();
    if(makeamount > 0){
	  var commentBox = $("#reasoncommentMake").val();
	  if(commentBox == '')
	  {
		//alert('Please enter Comment');
		$('#amounterromessage').hide();
		$('#commenterromessage').show();
		//return false;
	 }else{
	  $('#amounterromessage').hide();
	  $('#commenterromessage').hide();
        var r = confirm('Are you sure you want to make a partial payment for this loan?');
		if (r) {
			document.makepayment.submit();
		}
	 }
	}else{
	  $('#amounterromessage').show();
	  //return false;
	}
  }

}
function makeCancelViking(){

  	var commentBox = $("#reasoncommentMakeViking").val();
	if(commentBox == ''){
		 $('#commenterromessageViking').show();
	}else{
	     $('#commenterromessageViking').hide();
		var r = confirm('Are you sure to Close the schedule for this loan?');
		if (r) {
			document.achCancelForm.submit();
		}
	}

}

function editVikingScheduleDate(vikingId,openType,scheduleDate){

	$("#vikingId").val(vikingId);
	$("#schedule_cur_date").html(scheduleDate);
	if(openType == 'open'){
 		$('#VikingScheduleModal').modal('show');
	}else if(openType == 'close'){
		$('#VikingScheduleModal').modal('hide');
	}
}


function sync()
{
  var n1 = document.getElementById('fullintrestamount');
  var n2 = document.getElementById('hiddenintrestamount');
  n2.value = n1.value;
}


function repullpaymentamount(paymentid,pid,uniqueScheduleId)
{
	$('#repullpaymentModal').modal('toggle');
	$("#paymentId").val( paymentid );
	$("#scheduleId").val( pid );
	$("#uniqueScheduleId").val( uniqueScheduleId );
	return false;
}

if(document.getElementById('repullplaidinfopanel'))
{
	   	triggerRepullDiv();
}

function triggerRepullDiv()
{
  $('.repullplaidinfodiv').on('show.bs.collapse', function() {
	 var repullIDValue = $(this).attr('id');
	 var repullDetails  = repullIDValue.split("_");
	 var repullID  = repullDetails[1];
	 var repullpanelstatus = $('#repullpanelstatus'+repullID).val();
	 var repullpage = $('#repullpage').val();
	 if($('#repullpage').val())
	 {
		var repullpage = $('#repullpage').val();
	 }else{
		var repullpage = '';
	 }

	 //alert("repullID:"+repullID);
	 //alert("repullpanelstatus:"+repullpanelstatus);

	 if(repullpanelstatus==0)
	 {
		 $('#repullpanelstatus'+repullID).val(1);
		 $('#content_'+repullIDValue).html('<div class="pull-center"><img src="/images/img/ajaxloader.gif" class="img-responsive center-block" alt="Loader Image"></div>');

		 if ("undefined" !== typeof repullID && repullID!='' && repullID!=null)
		 {
			 var repullID = $.trim(repullID);

			 $.ajax({
				  url: '/admin/getrepullPlaidDetails',
				  data: {
						'repullID': repullID,
						'repullpage':repullpage
						},
				  dataType: 'json',
				  type: 'POST',
				  success: function(res) {

					if(res.status==200)
					{
						var listData = $.trim(res.listdata);
						$('#content_'+repullIDValue).html(listData);


						setTimeout(function(){
							  //alert("trigger");
							  $('.transactiontable_'+repullID+' table').each(function(){
									 var stableId = this.id;
									 if ( ! $.fn.DataTable.isDataTable( '#'+stableId ) ) {
									  $('#'+stableId).dataTable({ "order": [[ 5, "desc" ]] });
									  $('#'+stableId).parent().addClass('table-responsive');
									}
							  });
						}, 500);
					}
					else
					{
						$('#content_'+repullIDValue).html('<div class="pull-center"><strong>'+res.message+'</strong></div>');
					}
				  }
			  });
		 }
		 else
		 {
			 $('#content_'+repullIDValue).html('<div class="pull-center">No credit history details found</div>');
		 }
	 }
  });
}


if(document.getElementById('incompleterepullplaidinfopanel'))
{
	   	incompletetriggerRepullDiv();
}

function incompletetriggerRepullDiv()
{
  $('.incompleterepullplaidinfodiv').on('show.bs.collapse', function() {
	 var repullIDValue = $(this).attr('id');
	 var repullDetails  = repullIDValue.split("_");
	 var repullID  = repullDetails[1];
	 var repullpanelstatus = $('#repullpanelstatus'+repullID).val();
	 var repullpage = $('#repullpage').val();
	 if($('#repullpage').val())
	 {
		var repullpage = $('#repullpage').val();
	 }else{
		var repullpage = '';
	 }

	 //alert("repullID:"+repullID);
	 //alert("repullpanelstatus:"+repullpanelstatus);

	 if(repullpanelstatus==0)
	 {
		 $('#repullpanelstatus'+repullID).val(1);
		 $('#content_'+repullIDValue).html('<div class="pull-center"><img src="/images/img/ajaxloader.gif" class="img-responsive center-block" alt="Loader Image"></div>');

		 if ("undefined" !== typeof repullID && repullID!='' && repullID!=null)
		 {
			 var repullID = $.trim(repullID);

			 $.ajax({
				  url: '/admin/incompletegetrepullPlaidDetails',
				  data: {
						'repullID': repullID,
						'repullpage':repullpage
						},
				  dataType: 'json',
				  type: 'POST',
				  success: function(res) {

					if(res.status==200)
					{
						var listData = $.trim(res.listdata);
						$('#content_'+repullIDValue).html(listData);


						setTimeout(function(){
							  //alert("trigger");
							  $('.transactiontable_'+repullID+' table').each(function(){
									 var stableId = this.id;
									 if ( ! $.fn.DataTable.isDataTable( '#'+stableId ) ) {
									  $('#'+stableId).dataTable({ "order": [[ 5, "desc" ]] });
									  $('#'+stableId).parent().addClass('table-responsive');
									}
							  });
						}, 500);
					}
					else
					{
						$('#content_'+repullIDValue).html('<div class="pull-center"><strong>'+res.message+'</strong></div>');
					}
				  }
			  });
		 }
		 else
		 {
			 $('#content_'+repullIDValue).html('<div class="pull-center">No credit history details found</div>');
		 }
	 }
  });
}

function fetchPotentialDefaultUserList()
{
   if(document.getElementById('potentialdefaultuser_table'))
   {
       //$('#potentialdefaultuser_table').dataTable({ "order": [[ 12, "asc" ]] });
	   //$('#potentialdefaultuser_table').parent().addClass('table-responsive');

       var pdTable =$('#potentialdefaultuser_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxPotentialDefaultusers",
                    "aaSorting": [ [12,'desc']],
                    "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "loanReference" },
						  { "mData": "storyReference" },
						  { "mData": "userReference" },
						  { "mData": "name" },
                          { "mData": "email" },
                          { "mData": "phoneNumber" },
                          { "mData": "payOffAmount" },
						  { "mData": "availableBalance","bSortable": false },
                          { "mData": "maturityDate" },
                          { "mData": "createdAt" },
                          { "mData": "status","bSortable": false },
						  { "mData": "paymentstatus","bSortable": false },
                     ]
         });

         $('#potentialdefaultuser_table_filter input').unbind();
         $('#potentialdefaultuser_table_filter input').bind('keyup', function(e) {
             if(e.keyCode == 13) {
               pdTable.fnFilter(this.value);
             }
         });

         $('#potentialdefaultuser_table').parent().addClass('table-responsive');

   }
}

function fetchPracticeList(){
	if(document.getElementById('adminschoollist'))
    {

		var urlPath = '/admin/ajaxpracticeList?';
		urlPath = urlPath.trim();

       var prTable = $('#adminschoollist').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    //"stateSave": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": urlPath,
                    "aaSorting": [ [7,'desc']],
                    "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "PracticeName","bSortable": false },
						  { "mData": "ContactName" },
						  { "mData": "PracticeEmail" },
						  { "mData": "LocationName" },
                          { "mData": "City" },
						  { "mData": "StateCode" },
						  { "mData": "InvitedDate" },
						  { "mData": "PracticeUrl","bSortable": false },
						  { "mData": "PracticeRule","bSortable": false },
						  { "mData": "Status","bSortable": false },
						  { "mData": "actiondata","bSortable": false }

                     ]
         });

	     $('#adminschoollist_filter input').unbind();
         $('#adminschoollist_filter input').bind('keyup', function(e) {
             if(e.keyCode == 13) {
               prTable.fnFilter(this.value);
             }
         });
         $('#adminschoollist').parent().addClass('table-responsive');
     }
}

function fetchPracticeSettingsList(){
	if(document.getElementById('practiceSettingsList'))
    {

		var urlPath = '/admin/ajaxpracticeSettingsList?';
		urlPath = urlPath.trim();
       var prTable = $('#practiceSettingsList').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    //"stateSave": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": urlPath,
                    "aaSorting": [ [1,'desc']],
                    "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "name","bSortable": true },
						  { "mData": "isDefault" },
						  { "mData": "actiondata","bSortable": false }

                     ]
         });

         $('#practiceSettingsList').parent().addClass('table-responsive');
     }
}

function fetchSchoolAdminUserList(){
	if(document.getElementById('adminschoolAdminUserList'))
    {

		var urlPath = '/admin/ajaxpracticeAdminUserList?';
		urlPath = urlPath.trim();

       var practiceTable = $('#adminschoolAdminUserList').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    //"stateSave": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": urlPath,
                    "aaSorting": [ [8,'desc']],
                    "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "username",},
						  { "mData": "firstname",},
						  { "mData": "lastname",},
						  { "mData": "email" },
						  { "mData": "phoneNumber" },
                          { "mData": "schoolname" },
						  { "mData": "rolename" },
						  { "mData": "createdAt" },
						  { "mData": "actiondata","bSortable": false }

                     ]
         });

	     $('#adminschoolAdminUserList_filter input').unbind();
         $('#adminschoolAdminUserList_filter input').bind('keyup', function(e) {
             if(e.keyCode == 13) {
               practiceTable.fnFilter(this.value);
             }
         });

         $('#adminschoolAdminUserList').parent().addClass('table-responsive');
     }
}


function fetchResetUserList()
{
   if(document.getElementById('manageResetUser_table'))
   {
	var sTable = $('#manageResetUser_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxmanageresetuserlist",
                    "aaSorting": [ [8,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
					"iDisplayLength": 50,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
						  { "mData": "userReference" },
                          { "mData": "name" },
						  { "mData": "email" },
                          { "mData": "phoneNumber" },
						  { "mData": "registeredtype" ,"bSortable": false },
						  { "mData": "allowsocialnetwork" ,"bSortable": false },
						  { "mData": "practicename"  },
						  { "mData": "createdAt" },
						  { "mData": "underwriter" ,"bSortable": false },
                     ]
         });

	 $('#manageResetUser_table_filter input').unbind();
	 $('#manageResetUser_table_filter input').bind('keyup', function(e) {
		 if(e.keyCode == 13) {
		   sTable.fnFilter(this.value);
		 }
	 });

	 $('#manageResetUser_table').parent().addClass('table-responsive');
   }
}

function moveToOpenApplication(){
	var r = confirm('Are you sure you want to move this into open application?');
	if(r)
	{
		var paymentID = $('#paymentID').val();
		$.ajax({
        	url  :	'/admin/movetoopenupdate',
          	data :	{
		    	'paymentID': paymentID
            },
          	dataType: 'json',
          	type: 'POST',
          	success: function(res) {
				$("#movetoopen").hide();
				window.location.reload(true);
			}
		 });
	}
}

function moveToIncompleteApplication()
{
	var r = confirm('Are you sure you want to move this into open application?');
	if(r)
	{
 	  	var screenID = $("#screentrackingID").val();
		$.ajax({
        	url  :	'/admin/movetoincompleteupdate',
          	data :	{
		    	'screenID': screenID
            },
          	dataType: 'json',
          	type: 'POST',
          	success: function(res) {
				$("#movetoincomplete").hide();
				window.location.reload(true);
			}
		 });
	}
}

function markAsReviewApp()
{
	var r = confirm('Are you sure you want to move this into denied application?');
	if(r)
	{
 	  	var paymentID = $('#paymentID').val();
		$.ajax({
        	url  :	'/admin/markAsReviewed',
          	data :	{
		    	'paymentID': paymentID
            },
          	dataType: 'json',
          	type: 'POST',
          	success: function(res) {
				$("#moveToreview").hide();
				window.location.reload(true);
			}
		 });
	}
}

function markAsComplete()
{
	var r = confirm('Are you sure you want to move this into incomplete application?');
	if(r)
	{
 	  	var screenID = $("#screentrackingID").val();
		$.ajax({
        	url  :	'/admin/markToIncompleteApp',
          	data :	{
		    	'screenID': screenID
            },
          	dataType: 'json',
          	type: 'POST',
          	success: function(res) {
				$("#moveToComplete").hide();
				window.location.reload(true);
			}
		 });
	}
}

function fetchPendingList( divID, type ) {
	const currentPage = $("#currentPage");
	if( document.getElementById( divID ) ) {
			 var uTable = $( '#' + divID ).dataTable( {
		"bProcessing": true,
		"bServerSide": true,
		"bDestroy": true,
		"oLanguage": { "sLoadingRecords": "Please wait - loading..." },
		"processing": true,
		"sPaginationType": "full_numbers",
		"sAjaxSource": "/admin/completeapplication/" + type + "?currentPage=" + currentPage.val(),
		"aaSorting": [ [11,'desc']],
		"lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
		"iDisplayLength": 100,
		"aoColumns": [
			{ "mData": "loopid", "bSortable": false},
			{ "mData": "appReference" },
			{ "mData": "loanReference" },
			{ "mData": "name" },
			{ "mData": "email" },
			{ "mData": "phoneNumber" },
			{ "mData": "practicename" },
			{ "mData": "fundingtier" },
			{ "mData": "payOffAmount" },
			{ "mData": "apr" },
			{ "mData": "creditScore" },
			{ "mData": "createdAt" },
			{ "mData": "updatedAt" },
			{ "mData": "registeredtype"}
		]
			} );
	$( '#' + divID + '_filter input' ).unbind();
	$( '#' + divID + '_filter input' ).bind( 'keyup', function( e ) {
		if( e.keyCode == 13 ) {
			uTable.fnFilter( this.value );
		}
	} );

	$( '#' + divID ).parent().addClass( 'table-responsive' );
}
}
function fetchArchivedList( divID, type ) {
    if( document.getElementById( divID ) ) {
       	var uTable = $( '#' + divID ).dataTable( {
			"bProcessing": true,
			"bServerSide": true,
			"bDestroy": true,
			"oLanguage": { "sLoadingRecords": "Please wait - loading..." },
			"processing": true,
			"sPaginationType": "full_numbers",
			"sAjaxSource": "/admin/ajaxOpenApplicationAch/" + type,
			"aaSorting": [ [11,'desc']],
			"lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
			"iDisplayLength": 100,
			"aoColumns": [
				{ "mData": "loopid" ,"bSortable": false},
				{ "mData": "applicationReference" },
				{ "mData": "loanReference" },
				{ "mData": "name" },
				{ "mData": "email" },
				{ "mData": "phoneNumber" },
				{ "mData": "practicename" },
				{ "mData": "fundingtier" },
				{ "mData": "payOffAmount" },
				{ "mData": "apr" },
				{ "mData": "creditScore" },
				{ "mData": "createdAt" },
				{ "mData": "updatedAt" },
				{ "mData": "lastScreenName" },
				{ "mData": "registeredtype" },
				{ "mData": "applicationType" }
			]
        } );
		$( '#' + divID + '_filter input' ).unbind();
		$( '#' + divID + '_filter input' ).bind( 'keyup', function( e ) {
			if( e.keyCode == 13 ) {
				uTable.fnFilter( this.value );
			}
		} );

		$( '#' + divID ).parent().addClass( 'table-responsive' );
	}
}
function fetchIncompleteList( divID, type ) {
    if( document.getElementById( divID ) ) {
       	var uTable = $( '#' + divID ).dataTable( {
			"bProcessing": true,
			"bServerSide": true,
			"bDestroy": true,
			"oLanguage": { "sLoadingRecords": "Please wait - loading..." },
			"processing": true,
			"sPaginationType": "full_numbers",
			"sAjaxSource": "/admin/ajaxOpenApplicationAch/" + type,
			"aaSorting": [ [9,'desc']],
			"lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
			"iDisplayLength": 100,
			"aoColumns": [
				{ "mData": "loopid" ,"bSortable": false},
				{ "mData": "applicationReference" },
				{ "mData": "loanReference" },
				{ "mData": "name" },
				{ "mData": "email" },
				{ "mData": "phoneNumber" },
				{ "mData": "practicename" },
				{ "mData": "fundingtier" },
				{ "mData": "creditScore" },
				{ "mData": "createdAt" },
				{ "mData": "updatedAt" },
				{ "mData": "lastScreenName"},
				{ "mData": "registeredtype"},
			]
        } );
		$( '#' + divID + '_filter input' ).unbind();
		$( '#' + divID + '_filter input' ).bind( 'keyup', function( e ) {
			if( e.keyCode == 13 ) {
				uTable.fnFilter( this.value );
			}
		} );

		$( '#' + divID ).parent().addClass( 'table-responsive' );
	}
}
function fetchOpenApplicationList( divID, type ) {
    if( document.getElementById( divID ) ) {
       	var uTable = $( '#' + divID ).dataTable( {
			"bProcessing": true,
			"bServerSide": true,
			"bDestroy": true,
			"oLanguage": { "sLoadingRecords": "Please wait - loading..." },
			"processing": true,
			"sPaginationType": "full_numbers",
			"sAjaxSource": "/admin/ajaxOpenApplicationAch/" + type,
			"aaSorting": [ [11,'desc']],
			"lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
			"iDisplayLength": 100,
			"aoColumns": [
				{ "mData": "loopid" ,"bSortable": false},
				{ "mData": "applicationReference" },
				{ "mData": "loanReference" },
				{ "mData": "name" },
				{ "mData": "email" },
				{ "mData": "phoneNumber" },
				{ "mData": "payOffAmount" ,"bSortable": false},
				{ "mData": "apr" ,"bSortable": false},
				{ "mData": "creditScore" },
				{ "mData": "practicename","bSortable": false },
				{ "mData": "createdAt" },
				{ "mData": "updatedAt" },
				{ "mData": "lastScreenName"},
				{ "mData": "registeredtype"},
				{ "mData": "applicationType"}
			]
        } );
		$( '#' + divID + '_filter input' ).unbind();
		$( '#' + divID + '_filter input' ).bind( 'keyup', function( e ) {
			if( e.keyCode == 13 ) {
				uTable.fnFilter( this.value );
			}
		} );

		$( '#' + divID ).parent().addClass( 'table-responsive' );
	}
}


function fetchPracticeCreditReport(start_date,end_date){

	if(document.getElementById('practiceCreditReport_table'))
    {

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
                    "aaSorting": [ [13,'desc']],
                    "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false },
						  { "mData": "loanReference" },
						  { "mData": "userReference" },
						  { "mData": "PracticeName","bSortable": false },
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
					 "fnServerParams": function ( aoData ) {
						aoData.push( { "name": "start_date", "value": start_date } );
						aoData.push( { "name": "end_date", "value": end_date } );

						var practice = $('#practicelist').val();
						if ("undefined" !== typeof practice && practice!='' && practice!=null)
						{
							var practiceid = $('#practicelist').val();
							if ("undefined" !== typeof practiceid && practiceid!='' && practiceid!=null)
							{

								aoData.push( { "name": "practiceID", "value": practiceid } );
							}
						}

					},
         });

	     $('#practiceCreditReport_table_filter input').unbind();
         $('#practiceCreditReport_table_filter input').bind('keyup', function(e) {
             if(e.keyCode == 13) {
               prTable.fnFilter(this.value);
             }
         });
         $('#practiceCreditReport_table').parent().addClass('table-responsive');
     }
}


function fetchProviderList(){

	if(document.getElementById('provider_table'))
    {

		var urlPath = '/admin/ajaxProvider?';
		urlPath = urlPath.trim();
        var dTable =$('#provider_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    //"stateSave": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": urlPath,
                    "aaSorting": [ [8,'desc']],
                    "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "providerName"},
						  { "mData": "firstName" },
						  { "mData": "lastName" },
                          { "mData": "emailAddress" },
                          { "mData": "phoneNumber" },
                          { "mData": "city"},
						  { "mData": "state"},
						  { "mData": "createdAt"},
						  { "mData": "actiondata","bSortable": false }
                     ]
         });

         $('#provider_table_filter input').unbind();
         $('#provider_table_filter input').bind('keyup', function(e) {
             if(e.keyCode == 13) {
               dTable.fnFilter(this.value);
             }
         });

         $('#provider_table').parent().addClass('table-responsive');
     }
}


function fetchProcedureList(){
	console.log("fetchProcedureList");
	var lProcedures = {};
	if( document.getElementById( "procedurelist_table" ) ) {
		var fplTable = $( "#procedurelist_table" ).dataTable( {
			"bProcessing": true,
			"bServerSide": true,
			"bDestroy": true,
			"oLanguage": { "sLoadingRecords": "Please wait - loading..." },
			"processing": true,
			"sPaginationType": "full_numbers",
			"sAjaxSource": "/admin/ajaxProcedureList",
			"aaSorting": [ [ 0, 'asc' ] ],
			"lengthMenu": [ [ 10, 25, 50, 100], [ 10, 25, 50, 100] ],
			"iDisplayLength": 10,
			// "scrollX": false,
			// "scrollY": false,
			"dom": '<f><t><"row tfoot"<"col-lg-6 col-md-6 col-sm-6 col-xs-6"i><"col-lg-6 col-md-6 col-sm-6 col-xs-6"p>>',
			"aoColumns": [
				{ "mData": "procedure" },
				{ "mData": "total_price" },
				{ "mData": "deposit" },
				{ "mData": "financed_amount", "bSortable": false },
				{ "mData": "procedureBtn", "bSortable": false }
			],
			"drawCallback": function() {
				//console.log( "totalDeposit", lProcedures.totalDeposit, " totalFinAmount ", lProcedures.totalFinAmount );
				var api = this.api();
				var data = api.data();
				for( var p in data ) {
					if( isNaN( parseInt( p ) ) ) break;
					var proc = data[ p ].proceduresData;
					if( ! lProcedures.hasOwnProperty( proc.id ) ) {
						proc.selected = false;
						lProcedures[ proc.id ] = proc;
					} else {
						Object.assign( lProcedures[ proc.id ], proc );
					}
					var procBtn = $( "#" + proc.btnId );
					procBtn.off().on( "click", { proc: proc }, function( e ) {
						return handleProcedure( e.data.proc );
					} );
					if( lProcedures[ proc.id ].selected ) {
						procBtn.removeClass("add").addClass("delete").html( "Deselect" );
					} else {
						procBtn.removeClass("delete").addClass("add").html( "Add Procedure" );
					}
				}
			}
		});
		$( '#procedurelist_table_filter input' ).unbind();
		$( '#procedurelist_table_filter input' ).bind( 'keyup', function(e) {
			if( e.keyCode == 13 ) {
				fplTable.fnFilter( this.value );
			}
		});
		$( '#procedurelist_table' ).parent().addClass( 'table-responsive' );
		$( "#procedurelist_table_filter>label>input" ).attr( "data-dismiss", "static" );
		$( "#procedurelist_table_filter>label>input" ).attr( "data-backdrop", "static" );
		$( "#procedurelist_table_filter>label>input" ).attr( "data-keyboard", "false" );
		$( "#procedureModal form").on( "submit", function(e) { e.preventDefault(); } );
	}

	function handleProcedure( proc ) {
		//console.log( "proc:", proc );
		var $procBtn = $( "#" + proc.btnId );
		if( lProcedures[ proc.id ].selected ) {
			// remove procedure, change to add
			$procBtn.removeClass( "delete" ).addClass( "add" ).html( "Add Procedure" );
		} else {
			// add procedure, change to delete
			$procBtn.removeClass( "add" ).addClass( "delete" ).html( "Deselect" );
		}

		lProcedures[ proc.id ].selected = ( ! lProcedures[ proc.id ].selected );
		var totalFinAmount = 0;
		var totalDeposit = 0;
		for( var p in lProcedures ) {
			var procItem = lProcedures[ p ];
			if( procItem.selected ) {
				console.log( "selected:", procItem );
				totalFinAmount += (procItem.total_price - procItem.deposit);
				totalDeposit +=  procItem.deposit;
			}
		}
		function clearProcedures( cancel ) {
			// clear
			console.log( "clearProcedures()" );
			$( "#deposit" ).val( "" );
			for( var i in lProcedures ) {
				lProcedures[ i ].selected = false;
			}
			// hit the cancel button to clear procedures needs to clear amount
			if( cancel ) {
				$( "#reqFinancedAmount" ).val( "" );
			}
			fetchProcedureList();
		}
		window.clearProcedures = clearProcedures;
		console.log( "totalDeposit", totalDeposit, " totalFinAmount ", totalFinAmount );
		$( "#reqFinancedAmount" ).val( "$" + totalFinAmount.toLocaleString( "en-US", { maximumFractionDigits: 0, minimumFractionDigits: 0 } ) );
		$( "#deposit" ).val( totalDeposit );
	}
}

function fetchEditProcedureList(){

	if( document.getElementById( "editprocedurelist_table" ) ) {
		console.log("fetchEditProcedureList");
		var lProcedures = {};
		var uTable = $( "#editprocedurelist_table" ).dataTable( {
			"bProcessing": true,
			"bServerSide": true,
			"bDestroy": true,
			"oLanguage": { "sLoadingRecords": "Please wait - loading..." },
			"processing": true,
			"sPaginationType": "full_numbers",
			"sAjaxSource": "/admin/ajaxEditProcedureList",
			"aaSorting": [ [ 0, 'asc' ] ],
			"lengthMenu": [ [ 10, 25, 50, 100], [ 10, 25, 50, 100] ],
			"iDisplayLength": 25,
			"scrollX": false,
			"scrollY": false,
			"dom": '<f><t><"row tfoot"<"col-lg-6 col-md-6 col-sm-6 col-xs-6"i><"col-lg-6 col-md-6 col-sm-6 col-xs-6"p>>',
			"aoColumns": [
				{ "mData": "procedure" },
				{ "mData": "total_price" },
				{ "mData": "deposit" },
				{ "mData": "financed_amount", "bSortable": false },
				{ "mData": "editProcedureBtn", "bSortable": false }
			],
			"drawCallback": function() {
				//console.log( "totalDeposit", lProcedures.totalDeposit, " totalFinAmount ", lProcedures.totalFinAmount );
				var api = this.api();
				var data = api.data();
				for( var p in data ) {
					if( isNaN( parseInt( p ) ) ) break;
					var proc = data[ p ].proceduresData;
					if( ! lProcedures.hasOwnProperty( proc.id ) ) {
						lProcedures[ proc.id ] = proc;
					} else {
						Object.assign( lProcedures[ proc.id ], proc );
					}
				}
				console.log( "lProcedures:", lProcedures );
			}
		});
		$( '#editprocedurelist_table_filter input' ).unbind();
		$( '#editprocedurelist_table_filter input' ).bind( 'keyup', function(e) {
			if( e.keyCode == 13 ) {
				uTable.fnFilter( this.value );
			}
		});
		$( '#editprocedurelist_table' ).parent().addClass( 'table-responsive' );

		function populateEditModal( procedureId ) {
			var procedure = lProcedures[ procedureId ];
			console.log( "procedure", procedure );
			var total = 0;
			var actionVal = "/practice/procedures/" + procedure.practicemanagement;
			$( "#editForm" ).attr( "action", actionVal );
			$( "#editId" ).val( procedure.id );
			$( "#editProcedureName" ).val( procedure.procedure );
			// populate the edit procedure detail tab
			var hasDetail = ( procedure.hasOwnProperty( "hasDetail" ) && procedure.hasDetail );
			if( hasDetail ) {
				console.log("hasDetail", hasDetail );
				// toggles tab from simple to detailed
				$("#editNewSimple").hide();
				$("#simpleTabBtn").removeClass("active");
				$("#detailedTabBtn").addClass("active");
				$("#editNewDetailed").show();
				// remove name attr from simple add name attr to detailed
				$( "#editTotalPrice" ).removeAttr( "name" );
				$( "#editDeposit" ).removeAttr( "name" );
				$( "#editTotalPriceDetailed" ).attr( "name", "total_price" );
				$( "#editDepositDetailed" ).attr( "name", "deposit" );

				if( procedure.hasOwnProperty( "practice_fee" ) && procedure.practice_fee ) {
					$( "#editPracticeFee" ).val( $format( procedure.practice_fee ) );
					total += procedure.practice_fee;
				} else {
					$( "#editPracticeFee" ).val( "" );
				}
				if( procedure.hasOwnProperty( "facility_fee" ) && procedure.facility_fee ) {
					$( "#editFacilityFee" ).val( $format( procedure.facility_fee ) );
					total += procedure.facility_fee;
				} else {
					$( "#editFacilityFee" ).val( "" );
				}
				if( procedure.hasOwnProperty( "anesthesia_fee" ) && procedure.anesthesia_fee ) {
					$( "#editAnesthesiaFee" ).val( $format( procedure.anesthesia_fee ) );
					total += procedure.anesthesia_fee;
				} else {
					$( "#editAnesthesiaFee" ).val( "" );
				}
				if( procedure.hasOwnProperty( "other_fee" ) && procedure.other_fee ) {
					$( "#editOtherFee" ).val( $format( procedure.other_fee ) );
					total += procedure.other_fee;
				} else {
					$( "#editOtherFee" ).val( "" );
				}
				//console.log("procedure.custom.Fee1.amount", procedure.custom.Fee1.amount );
				if( procedure.custom.hasOwnProperty( "Fee1" ) && procedure.custom.Fee1 ) {
					$( "#editFee1" ).val( $format( procedure.custom.Fee1.amount ) );
					$( "#innerSpan1Edit" ).html( procedure.custom.Fee1.name );
					$( "#editFeeDisplay1" ).show();
					addFeeDetailedEdit.n = 2;
					total += parseInt( procedure.custom.Fee1.amount );
				}
				if( procedure.custom.hasOwnProperty( "Fee2" ) && procedure.custom.Fee2 ) {
					$( "#editFee2" ).val( $format( procedure.custom.Fee2.amount ) );
					$( "#innerSpan2Edit" ).html( procedure.custom.Fee2.name );
					$( "#editFeeDisplay2" ).show();
					addFeeDetailedEdit.n = 3;
					total += parseInt( procedure.custom.Fee2.amount );
				}
				if( procedure.custom.hasOwnProperty( "Fee3" ) && procedure.custom.Fee3 ) {
					$( "#editFee3" ).val( $format( procedure.custom.Fee3.amount ) );
					$( "#innerSpan3Edit" ).html( procedure.custom.Fee3.name );
					$( "#editFeeDisplay3" ).show();
					addFeeDetailedEdit.n = 4;
					total += parseInt( procedure.custom.Fee3.amount );
				}
				if( procedure.hasOwnProperty( "deposit" ) && procedure.deposit ) {
					$( "#editDepositDetailed" ).val( $format( procedure.deposit ) );
				} else {
					$( "#editDepositDetailed" ).val( "" );
				}
				$( "#totalPriceDisplayEdit" ).html( $format( total ) );
				$( "#editTotalPriceDetailed" ).val( total );
			}
			else {
				if( procedure.hasOwnProperty( "deposit" ) && procedure.deposit ) {
					$( "#editDeposit" ).val( $format( procedure.deposit ) );
				} else {
					$( "#editDeposit" ).val( "" );
				}
				if( procedure.hasOwnProperty( "total_price" ) && procedure.total_price ) {
					$( "#editTotalPrice" ).val( $format( procedure.total_price ) );
				} else {
					$( "#editTotalPrice" ).val( "" );
				}
				// toggles tab from detailed to simple
				$("#editNewSimple").show();
				$("#simpleTabBtn").addClass("active");
				$("#detailedTabBtn").removeClass("active");
				$("#editNewDetailed").hide();
				// remove name attr from detailed add name attr to simple
				$( "#editTotalPriceDetailed" ).removeAttr( "name" );
				$( "#editDepositDetailed" ).removeAttr( "name" );
				$( "#editTotalPrice" ).attr( "name", "total_price" );
				$( "#editDeposit" ).attr( "name", "deposit" );
			}
		}
		window.populateEditModal = populateEditModal;
	}
}

function fetchPFIArchiveList() {
	console.log("fetchPFIArchiveList");
	if( document.getElementById( "pfiarchivelist_table" ) ) {
		let uTable = $( "#pfiarchivelist_table" ).dataTable( {
			"bProcessing": true,
			"bServerSide": true,
			"bDestroy": true,
			"oLanguage": { "sLoadingRecords": "Please wait - loading..." },
			"processing": true,
			"sPaginationType": "full_numbers",
			"sAjaxSource": "/admin/ajaxPfiArchiveList",
			"aaSorting": [ [ 3, 'desc' ] ],
			"lengthMenu": [ [ 10, 25, 50, 100], [ 10, 25, 50, 100] ],
			"iDisplayLength": 25,
			"scrollX": false,
			"scrollY": false,
			"dom": '<f><t><"row tfoot"<"col-lg-6 col-md-6 col-sm-6 col-xs-6"i><"col-lg-6 col-md-6 col-sm-6 col-xs-6"p>>',
			"aoColumns": [
				{ "mData": "name" },
				{ "mData": "amount" },
				{ "mData": "rating" },
				{ "mData": "date" },
				{ "mData": "phone" },
				{ "mData": "email" },
				{ "mData": "patientContacted" },
				{ "mData": "viewReport", "bSortable": false }
			]
		});
		$( '#pfiarchivelist_table_filter input' ).unbind();
		$( '#pfiarchivelist_table_filter input' ).bind( 'keyup', function(e) {
			if( e.keyCode == 13 ) {
				uTable.fnFilter( this.value );
			}
		});
		$( '#pfiarchivelist_table' ).parent().addClass( 'table-responsive' );
	}
}

function $format( val, digits ) {
	digits = ( typeof digits == "number" ? digits : 0 );
	if( typeof val !== "string" ) {
		val = val.toFixed( 5 );
	}
	val = val.toFloat();
	return "$" + val.toLocaleString( "en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits } );
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


String.prototype.toFloat = function() {
	return parseFloat( this.valueOf().replace( /[^0-9.]/g, "" ) ) || 0;
};
Number.prototype.toFloat = function() {
	return parseFloat( this.valueOf() );
}
