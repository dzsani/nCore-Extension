// ADD
if(document.location.href.indexOf('notifications_add') != -1) {

	// Check the element, get the last ID
	if(#('.box_torrent:first').find('.torrent_txt a:first, .torrent_txt2 a:first').length < 1) {
		var id = 0;
	} else {
		var id = $('.box_torrent:first').find('.torrent_txt a:first, .torrent_txt2 a:first').attr('onclick').match(/\d+/g)[0];
	}

	self.postMessage({ lastId : id });

// FETCH
} else if(document.location.href.indexOf('notifications_fetch') != -1) {

	// Break when the user isn't logged in
	if( $('title').text == 'nCore') {
		return;
	}

	// Results
	var results = [];

	// Find the old element
	var start = #('#'+obj['lastId']+'').prev().prev().index('.box_torrent');

	// If the old element not found, get the first one
	if(wrapper.find('#'+obj['lastId']+'').length < 1) {
		start = 1;
	}

	// Get all new elements and show notification
	$('.box_torrent:lt('+start+')').each(function() {

		results.push( $(this).find('.torrent_txt a:first, .torrent_txt2 a:first').attr('title') );

	});

	// Get lat torrent ID
	var id = wrapper.find('.box_torrent:first').find('.torrent_txt a:first, .torrent_txt2 a:first').attr('onclick').match(/\d+/g)[0];

	// Send data
	self.postMessage({ lastId : id, results : results });
}