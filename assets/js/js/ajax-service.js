function ajaxPost( url, postData, contentType = "json" ) {
	showLoadingSpinner();
	const deferred = $.Deferred();
	$.post( {
		url: url,
		data: postData,
		dataType: contentType,
		success: function( data ) {
			deferred.resolve( data );
		},
		error: function( xhr, status, text ) {
			deferred.reject( xhr );
		},
		complete: function( xhr, textStatus ) {
			hideLoadingSpinner();
		}
	} );
	return deferred;
}
function ajaxGet(url, queryParametersObjectOrString = "", contentType="json"){
	showLoadingSpinner();
	const deferred = $.Deferred();
	$.get({
		url: url,
		dataType: contentType,
		data: queryParametersObjectOrString,
		success: function (data) {
			deferred.resolve(data);
		},
		error: function( xhr, status, text ) {
			deferred.reject(xhr);
		},
		complete: function( xhr, textStatus ) {
			hideLoadingSpinner();
		}
	});
	return deferred;
}
function showLoadingSpinner() {
	var spinnerIndex;
	var spinnerElement = $( "div.spinner-container" );
	var showSpinnerClass = "show-loading-spinner";

	if( !spinnerIndex || spinnerIndex < 0 ) {
		spinnerIndex = 1;
	} else {
		spinnerIndex++;
	}
	if( !spinnerElement.hasClass( showSpinnerClass ) ) {
		spinnerElement.addClass( showSpinnerClass );
	}
}

function hideLoadingSpinner() {
	var spinnerIndex;
	var spinnerElement = $( "div.spinner-container" );
	var showSpinnerClass = "show-loading-spinner";

	if( !spinnerIndex || spinnerIndex < 0 ) {
		spinnerIndex = 0;
	} else {
		spinnerIndex--;
	}
	if( spinnerIndex === 0 ) {
		spinnerElement.removeClass( showSpinnerClass );
	}
}
