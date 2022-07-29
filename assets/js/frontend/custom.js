$(document).ready(function() {

	if(document.getElementById('applypage'))
	{
		$("#searchpractice").val('');
	}

	if(document.getElementById('anticipatefinanceamount'))
	{
		var slider = document.getElementById("anticipateranage");
		var output = document.getElementById("anticipatefinanceamount");
		output.innerHTML = '$'+slider.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		$("#financeamount").val(slider.value);

		var val = ($("#anticipateranage").val() - $("#anticipateranage").attr('min')) / ($("#anticipateranage").attr('max') - $("#anticipateranage").attr('min'));

		$("#anticipateranage").css('background-image',
					'-webkit-gradient(linear, left top, right top, '
					+ 'color-stop(' + val + ', rgba(105,234,197,1)), '
					+ 'color-stop(' + val + ', #d3d3db)'
					+ ')'
					);
	}
});

$( "#searchpractice" ).autocomplete( {
	minLength: 3,
	open: function() { $( this ).removeClass( "loading" ); },
	scroll: true,
	type: "post",
	source: function( request, response ) {
		$.ajax( {
			url: "/searchpractice",
			dataType: "json",
			type: "get",
			data: {
				searchvalue: $( "#searchpractice" ).val(),
				pageIndex: 1
			},
			success: function( data ) {
				console.log( "data", data );
				response( data.resultdata );
			}
		} );
	},
	messages: {
		noResults: "",
		results: function() {}
	},
	 select: function( event, ui ) {
		console.log( "item:", ui.item );
		$( "#searchpractice" ).val( ui.item.city );
		$( "#searchid" ).val( ui.item._id );
		$( "#searchtype" ).val( ui.item.type );

		var pagename = $( "#pagename" ).val();
		if( pagename == "apply" ) {
			document.getElementById( "practicesearch" ).submit();
			return false;
		} else {
			var pagenumber = 0;
			fetchPracticeDetails( ui.item._id, ui.item.city, ui.item.type, pagenumber );
			return false;
		}
	},
	appendTo: "#searchresults",
	create: function() {
		$( this ).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
			return $( "<li>" ).append( item.city ).appendTo( ul );
		};
	}
} );

$("#bankname").autocomplete({
	minLength: 3,
	open: function () { $(this).removeClass('loading'); },
	scroll:true,
	type:"post",
	source: function (request, response) {
		$.ajax({
			url: "/searchbank",
			dataType: "json",
			type:'POST',
			data: {
				bankSearch: $("#bankname").val(),
				pageIndex: 1
			},
			success: function (results) {
 				response(results.data);
			}
		});
	},
	messages: {
		noResults: '',
		results: function() {}
	},
	select: function (event, ui) {
		$("#bankid").val(ui.item.bankid);
		$("#bankname").val(ui.item.bankname);
 		$("#banktype").val(ui.item.institutionType);
		return false;
	},
	appendTo: "#bankresults",
	create: function () {
		$(this).data('ui-autocomplete')._renderItem = function (ul, item) {
 			return $('<li>').
				append(item.bankname).appendTo(ul);
		};
	}
});

function selectProvider(practiceID){
	$.ajax({
	  url: '/setSelectedPractice',
	  data: {
			'practiceID': practiceID
			},
	  dataType: 'json',
	  type: 'POST',
	  success: function(res) {

		if(res.status==200)
		{
			window.location = "/getstarted";
		}
		else
		{
			//Invalid prctice
		}
	  }
  });
}

function fetchPracticeDetails(searchid,searchpractice,searchtype,pagenumber)
{
	var pagename          =     $("#pagename").val();

	$.ajax({
	  url: '/applysearch',
	  data: {
			'searchpractice': searchpractice,
			'searchid': searchid,
			'searchtype': searchtype,
			'pagename': pagename,
			'pagenumber':pagenumber,
			'type': 'applysearch'
	  },
	  dataType: 'json',
	  type: 'POST',
	  success: function(res) {

		if(pagenumber==0)
		{
			$('#searchListing').html('');
		}

		if(res.code==200)
		{
			 var listData = $.trim(res.listdata);
			 $('#searchListing').append(listData);
			 if(res.blockviewmore==1)
			 {
				 $("#viewmoreBtn").css("display","none");
			 }
			 else
			 {
				 $("#viewmoreBtn").css("display","block");
			 }
		}
		return false;
	  }
  });
}


/*function paymentCal()
{
var slider = document.getElementById("anticipateranage");
var output = document.getElementById("anticipatefinanceamount");
output.innerHTML = slider.value;
}
$(document).ready(function () {
	var slider = document.getElementById("anticipateranage");
	var output = document.getElementById("anticipatefinanceamount");
	output.innerHTML = slider.value;
})*/

$('input[type="range"]').on("change mousemove", function () {
    var val = ($(this).val() - $(this).attr('min')) / ($(this).attr('max') - $(this).attr('min'));
	var slider = document.getElementById("anticipateranage");
	var output = document.getElementById("anticipatefinanceamount");
	output.innerHTML = '$'+slider.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	$("#financeamount").val(slider.value);
    $(this).css('background-image',
                '-webkit-gradient(linear, left top, right top, '
                + 'color-stop(' + val + ', rgba(105,234,197,1)), '
                + 'color-stop(' + val + ', #d3d3db)'
                + ')'
                );
});

function submituserinfoform()
{

	$("#userinfoBtn").attr("disabled", true);
	$("#proceedsubmit").attr("disabled", true);
	//$("#submitconfirmation").modal('hide');
 	$("#userinfofulldata").validate().cancelSubmit = true;
	document.getElementById("userinfofulldata").submit();
}
/*function submitmanualuserinfoform()
{
	$("#userinfoBtn").attr("disabled", false);
	$("#submitconfirmation").attr("disabled", true);
 	$("#userinfofullmanualData").validate().cancelSubmit = true;
	document.getElementById("userinfofullmanualData").submit();
}*/
function closepopup()
{
	$("#userinfoBtn").attr("disabled", false);
}
function showdeposit()
{
	$("#depositaccordion").toggle();
 	if($("#showdeposit").html()=="Show")
	{
		$("#depositaccountcontainer").css("display","block");
 		$('html, body').animate({
			'scrollTop' : $("#depositaccordion").position().top
		});
		$("#showdeposit").html('Hide');
	}
	else
	{
		if($("#showaccount").html()=="Show")
		{
			$("#depositaccountcontainer").css("display","none");
		}
		$("#showdeposit").html('Show');
	}

	return false;
}
function showaccount()
{
	$("#bankaccordion").toggle();
	if($("#showaccount").html()=="Show")
	{
		$("#depositaccountcontainer").css("display","block");
 		$('html, body').animate({
			'scrollTop' : $("#bankaccordion").position().top
		});
		$("#showaccount").html('Hide');
	}
	else
	{

		if($("#showdeposit").html()=="Show")
		{
			$("#depositaccountcontainer").css("display","none");
		}
		$("#showaccount").html('Show');
	}
 	return false;
}

function triggerSingupStart()
{
	$.ajax({
	  url: '/continueApplication',
	  data:$('#estimatePayment').serialize(),
	  dataType: 'json',
	  type: 'POST',
	  success: function(res) {

		if(res.status==200)
		{
			window.location = "/signupstart";
		}
		return false;
	  }
  });
}
function setemailinclicktosave(email)
{
 	$('#cemailAddress').val(email);
}
function showclicktosaveform(urlpath)
{
	var dispClicktosave	=	$("#optedclicktosave").val();
	if(dispClicktosave==0)
	{
		$('#clicktosave').modal('show');
	}
	else
	{
		$('#clicktosave').modal('hide');
		var pagename = $("#pagename").val();
		if(pagename=='userinformation')
		{
			var serializeForm	=	"#userinfofrom";
		}
		else
		{
			var userfilloutmanually	=	$("#userfilloutmanually").val();
			if(userfilloutmanually=='1')
			{
				var serializeForm	=	"#userinfofullmanualData";
			}
			else
			{
				var serializeForm	=	"#userinfofulldata";
			}

		}
		$.ajax({
			url : '/onclicktosave',
			data: $(serializeForm).serialize(),
			dataType: 'json',
			type: 'POST',
			success: function(res) {
				if(res.status==200)
				{
					if(res.setupdate==1)
					{
						$('#clicktosavesuccess').modal('show');
					}
 				}
			}
		});

	}
	return false;
}
