$(document).ready(function() {
  fetchPendingAchList();
  fetchUniversityAchList();
  fetchIncompleteAchList();
  fetchdefaultUsersList();
  fetchAdminUserList();
  fetchManagelogs();
  fetchCompleteAchList();
  fetchBlockedAchList();
  fetchBadgesDetails();
  fetchReconciliationDetails();
  fetchDeniedAchList();
  fetchReferralDetails();

  $("#docutype").change(function() {
	//var end = this.value;
	if (docutype.value == "Others") {
		$("#docuNameCheck").show();
	}else{
		$("#docuNameCheck").hide();
	}
	});

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

   if(document.getElementById('manageuser_table'))
   {
     //$('#manageuser_table').dataTable();
	 fetchUserList();
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
			  }
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
				var paymentid = $("#paymentID").val();
				fetchAchCommentsList(paymentid);
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

function fetchPendingAchList()
{
    if(document.getElementById('pendingach_table'))
    {

       var uTable =$('#pendingach_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    //"stateSave": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxPendingAch",
                    "aaSorting": [ [9,'desc']],
                    "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "loanReference" },
						  { "mData": "name" },
                          { "mData": "email" },
                          { "mData": "phoneNumber" },
                          { "mData": "payOffAmount" },
						  { "mData": "creditScore","bSortable": false },
						  { "mData": "availableBalance","bSortable": false },
						  { "mData": "maturityDate" },
                          { "mData": "createdAt" },
                          { "mData": "status" },
						  { "mData": "paymenttype" },
						  { "mData": "apr" }
                     ]
         });

         $('#pendingach_table_filter input').unbind();
         $('#pendingach_table_filter input').bind('keyup', function(e) {
             if(e.keyCode == 13) {
               uTable.fnFilter(this.value);
             }
         });

         $('#pendingach_table').parent().addClass('table-responsive');
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


            if(res.status==200)
            {
              fetchAchCommentsList(paymentID);
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

function fetchAchCommentsList(payid){
    var cTable = $('#achcomments_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxAchComments/"+payid,
                    "aaSorting": [ [0,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "subject" },
                          { "mData": "comments" },
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

function fetchUserList()
{
   if(document.getElementById('manageuser_table'))
   {
	var sTable = $('#manageuser_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxmanageuserlist",
                    "aaSorting": [ [7,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
					"iDisplayLength": 100,
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

	 $('#manageuser_table_filter input').unbind();
	 $('#manageuser_table_filter input').bind('keyup', function(e) {
		 if(e.keyCode == 13) {
		   sTable.fnFilter(this.value);
		 }
	 });

	 $('#manageuser_table').parent().addClass('table-responsive');
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

	if(unival.length > 3){

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

function fetchIncompleteAchList(){

	   if(document.getElementById('incompleteapplication_table'))
	   {
		var mTable = $('#incompleteapplication_table').dataTable({
						"bProcessing": true,
						"bServerSide": true,
						"bDestroy": true,
						"oLanguage": {
									  "sLoadingRecords": "Please wait - loading...",
								  },
						"processing": true,
						"sPaginationType": "full_numbers",
						"sAjaxSource": "/admin/ajaxIncompleteList",
						"aaSorting": [ [6,'desc']],
						"lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
						"iDisplayLength": 100,
						"aoColumns": [
							  { "mData": "loopid" ,"bSortable": false},
							  { "mData": "applicationReference" ,"bSortable": false},
							  { "mData": "name" ,"bSortable": false},
							  /*{ "mData": "screenName" ,"bSortable": false},*/
							  { "mData": "email" },
							  { "mData": "phoneNumber" },
							  { "mData": "lastScreenName" },
							  { "mData": "createdAt" },
							  { "mData": "status","bSortable": false }
						 ]
			 });

		 $('#incompleteapplication_table_filter input').unbind();
		 $('#incompleteapplication_table_filter input').bind('keyup', function(e) {
			 if(e.keyCode == 13) {
			   mTable.fnFilter(this.value);
			 }
		 });

		 $('#incompleteapplication_table').parent().addClass('table-responsive');
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
						"aaSorting": [ [8,'desc']],
						"lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
						"iDisplayLength": 100,
						"aoColumns": [
							  { "mData": "loopid" ,"bSortable": false},
							  { "mData": "loanReference" },
							  { "mData": "name" },
							  { "mData": "screenName" },
							  { "mData": "email" },
							  { "mData": "phoneNumber" },
							  { "mData": "payOffAmount" },
							  { "mData": "maturityDate" },
							  { "mData": "createdAt" },
							  { "mData": "loanstatus" },
							  { "mData": "appstatus" },
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
                    "aaSorting": [ [5,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "name" },
						  { "mData": "email" },
                          { "mData": "phoneNumber" },
						  { "mData": "role" },
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

function fetchManagelogs()
{
   if(document.getElementById('managelogs_table'))
   {
	var mTable = $('#managelogs_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxmanageloglist",
                    "aaSorting": [ [6,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "logreference" },
						  { "mData": "email" },
                          { "mData": "modulename" },
						  { "mData": "logmessage" },
						  { "mData": "remoteaddr" },
                          { "mData": "createdAt" },
						  { "mData": "actiondata","bSortable": false }
                     ]
         });

	 $('#managelogs_table_filter input').unbind();
	 $('#managelogs_table_filter input').bind('keyup', function(e) {
		 if(e.keyCode == 13) {
		   mTable.fnFilter(this.value);
		 }
	 });

	 $('#managelogs_table').parent().addClass('table-responsive');
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

function fetchCompleteAchList(){

	if(document.getElementById('completeach_table'))
    {

       var uTable =$('#completeach_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    //"stateSave": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/completeapplication",
                    "aaSorting": [ [7,'desc']],
                    "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
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
                          { "mData": "status" },
						  { "mData": "paymentstatus" },
						  { "mData": "paymenttype" },
						  { "mData": "apr" }

                     ]
         });

         $('#completeach_table_filter input').unbind();
         $('#completeach_table_filter input').bind('keyup', function(e) {
             if(e.keyCode == 13) {
               uTable.fnFilter(this.value);
             }
         });

         $('#completeach_table').parent().addClass('table-responsive');
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
                    //"stateSave": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxBlockedAch",
                    "aaSorting": [ [8,'desc']],
                    "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "loanReference" },
						  { "mData": "name" },
                          { "mData": "screenName" },
                          { "mData": "email" },
                          { "mData": "phoneNumber" },
                          { "mData": "payOffAmount" },
                          { "mData": "maturityDate" },
                          { "mData": "createdAt" },
                          { "mData": "status" },
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

function fetchDeniedAchList(){

	if(document.getElementById('deniedeach_table'))
    {

       var dTable =$('#deniedeach_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    //"stateSave": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxDeniedApplication",
                    "aaSorting": [ [7,'desc']],
                    "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
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
                          { "mData": "status" },
						  { "mData": "paymentstatus" }
                     ]
         });

         $('#deniedeach_table_filter input').unbind();
         $('#deniedeach_tablee_filter input').bind('keyup', function(e) {
             if(e.keyCode == 13) {
               dTable.fnFilter(this.value);
             }
         });

         $('#deniedeach_table').parent().addClass('table-responsive');
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

function fetchScreentrackingCommentsList(screentrackingID){
    var cTable = $('#screencomments_table').dataTable({
                    "bProcessing": true,
                    "bServerSide": true,
                    "bDestroy": true,
                    "oLanguage": {
                                  "sLoadingRecords": "Please wait - loading...",
                              },
                    "processing": true,
                    "sPaginationType": "full_numbers",
                    "sAjaxSource": "/admin/ajaxScreentrackingComments/"+screentrackingID,
                    "aaSorting": [ [0,'desc']],
                    "lengthMenu": [[ 10, 25, 50, 100], [ 10, 25, 50, 100]],
					"iDisplayLength": 100,
                    "aoColumns": [
                          { "mData": "loopid" ,"bSortable": false},
                          { "mData": "subject" },
                          { "mData": "comments" },
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
						"aaSorting": [ [6,'desc']],
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

}

