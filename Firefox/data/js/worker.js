// ADD
if(document.location.href.indexOf('notifications_add') != -1) {

	// Get the last id
	var id = $('.box_torrent:first').next().next().attr('id');


	self.postMessage({ lastId : id });

// FETCH
} else if(document.location.href.indexOf('notifications_fetch') != -1) {

	// Break when the user isn't logged in
	if( $('title').text() != 'nCore') {

		// Get last Id
		var fragments = document.location.href.split('?')[1].split('&');

		for(c = 0; c < fragments.length; c++) {
			if(fragments[c].indexOf('lastId') != -1) {
				var lastId = fragments[c].split('=')[1];
			}
		}

		// Results
		var results = [];

		// Find the old element
		var start = $('#'+lastId+'').prev().prev().index('.box_torrent');

		// If the old element not found, get the first one
		if($('#'+lastId+'').length < 1) {
			start = 1;
		}

		// Get all new elements and show notification
		$('.box_torrent:lt('+start+')').each(function() {

			results.push( $(this).find('.torrent_txt a:first, .torrent_txt2 a:first').attr('title') );

		});

		// Get lat torrent ID
		var id = $('.box_torrent:first').next().next().attr('id');

		// Send data
		self.postMessage({ lastId : id, results : results });

	}
}