// Set default settings
if( typeof localStorage['torrent_list_auto_pager']		== 'undefined') localStorage['torrent_list_auto_pager'] = 'true';
if( typeof localStorage['screenshot_preview'] 			== 'undefined') localStorage['screenshot_preview'] 		= 'true';
if( typeof localStorage['saved_searches'] 				== 'undefined') localStorage['saved_searches'] 			= '[]';
if( typeof localStorage['notification_username'] 		== 'undefined') localStorage['notification_username'] 	= '';
if( typeof localStorage['notification_password'] 		== 'undefined') localStorage['notification_password'] 	= '';

chrome.extension.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(event) {


		// Send back the settings object
		if(event.name == 'getSettings') {

			port.postMessage({ name : "setSettings", message : localStorage });

		// Save posted settings
		} else if(event.name == 'setSetting') {

			// Setting name
			var key = event.key;

			// Setting value
			var val = event.val;

			localStorage[key] = val;

		// Add saved search
		} else if(event.name == 'addSavedSearch') {

			// Parse JSON
			var list = JSON.parse(localStorage['saved_searches']);

			// Att new item to the list
			list.push(event.message);

			// Stringify new object
			localStorage['saved_searches'] = JSON.stringify(list);

		// Remove saved search
		} else if(event.name == 'removeSavedSearch') {

			// Parse JSON
			var list = JSON.parse(localStorage['saved_searches']);

			// Att new item to the list
			var item = list.splice(event.message, 1);

			// Stringify new object
			localStorage['saved_searches'] = JSON.stringify(list);

			// Restart notifications if any
			if(item[0]['watch'] == true) {
				notifications.restart();
			}

		// Store user&pass
		} else if(event.name == 'storeLoginCredentials') {
			localStorage['notification_username'] = event.message.user;
			localStorage['notification_password'] = event.message.pass;

			notifications.restart();

		} else if(event.name == 'setWatchStatus') {

			// Parse JSON
			var list = JSON.parse(localStorage['saved_searches']);

			// Set
			list[event.message.index]['watch'] = event.message.status;

			// Stringify new object
			localStorage['saved_searches'] = JSON.stringify(list);

			// Restart notifications
			if(event.message.status == true) {
				notifications.add(event.message.index);
			} else {
				notifications.restart();
			}

		// Update notifications
		} else if(event.name = 'updateNotifications') {
			notifications.restart();
		}
	});
});

var notifications = {

	intervals : [],

	init : function() {

		// Get watchlist
		var watchlist = JSON.parse(localStorage['saved_searches']);

		// Search on launch
		for(c = 0; c < watchlist.length; c++) {

			if(watchlist[c]['watch'] == true) {
				notifications.fetch(c);
			}
		}

		// Start intervals
		notifications.restart();
	},

	restart : function() {

		// Check login
		if(localStorage['notification_username'] == '') {
			return;
		}

		// Stop active invervals if any
		if(notifications.intervals.length > 0) {
			for(c = 0; c < notifications.intervals.length; c++) {
				clearInterval(notifications.intervals[c]);
			}

			notifications.intervals = [];
		}

		// Get the most recent watchlist
		var watchlist = JSON.parse(localStorage['saved_searches']);

		// Iterate over them
		for(c = 0; c < watchlist.length; c++) {

			if(watchlist[c]['watch'] == true) {
				notifications.start(c);
			}
		}
	},

	start : function(index) {


		notifications.intervals.push(
			setInterval(function() {
				notifications.fetch(index)
			}, 600000)
		);
	},

	add : function(index) {

		// Check login
		if(localStorage['notification_username'] == '') {
			return;
		}

		// Get the object
		var watchlist = JSON.parse(localStorage['saved_searches']);
		var obj = watchlist[index];

		// Query data
		$.post('http://ncore.cc/login.php?honnan=/torrents.php?'+obj['data']+'', { set_lang : 'hu', submitted : '1', nev : localStorage['notification_username'], pass : localStorage['notification_password'] }, function(data) {

			// Parse the response
			var tmp = $(data);

			// Get ID
			var id = tmp.find('.box_torrent:first').find('.torrent_txt a:first, .torrent_txt2 a:first').attr('onclick').match(/\d+/g);

			// Update the obj
			watchlist[index]['lastCheck'] = Math.round(new Date().getTime() / 1000);
			watchlist[index]['lastId'] = id;

			// Save the obj
			localStorage['saved_searches'] = JSON.stringify(watchlist);

			// Start watching
			notifications.intervals.push(
				setInterval(function() {
					notifications.fetch(index);
				}, 600000)
			);
		});
	},

	remove : function(index) {
		clearInterval(notifications.intervals[index]);
	},

	fetch : function(index) {

		// Get the object
		var watchlist = JSON.parse(localStorage['saved_searches']);
		var obj = watchlist[index];

		$.post('http://ncore.cc/login.php?honnan=/torrents.php?'+obj['data']+'', { set_lang : 'hu', submitted : '1', nev : localStorage['notification_username'], pass : localStorage['notification_password'] }, function(data) {


			// Login check
			var matches = data.match(/<title>(.*?)<\/title>/);

			if(matches[1] == 'nCore') {
				localStorage['notification_username'] = '';
				localStorage['notification_password'] = '';
			}

			// Parse the response
			var tmp = $(data);

			// Create new temp wrapper
			var wrapper = $('<div>').appendTo('#temp');

			// Insert temporary to the backhround page
			tmp.find('.box_torrent_all:first').children().each(function() {
				$(this).appendTo(wrapper);
			});

			// Find the old element
			var start = wrapper.find('#'+obj['lastId']+'').prev().prev().index('.box_torrent');

			// If the old element not found, get the first one
			if(wrapper.find('#'+obj['lastId']+'').length < 1) {
				start = 1;
			}

			// Get all new elements and show notification
			wrapper.find('.box_torrent:lt('+start+')').each(function() {

				// Get torrent name
				var name = $(this).find('.torrent_txt a:first, .torrent_txt2 a:first').attr('title');

				// Build notification
				var notification = webkitNotifications.createNotification(
					'/img/icons/icon48.png',  // icon
					'Új torrent!',  // title
					name  // text
				);

				// Show the notification
				notification.show();
			});

			// Get lat torrent ID
			var id = wrapper.find('.box_torrent:first').find('.torrent_txt a:first, .torrent_txt2 a:first').attr('onclick').match(/\d+/g);

			// Update the obj
			watchlist[index]['lastCheck'] = Math.round(new Date().getTime() / 1000);
			watchlist[index]['lastId'] = id;

			// Save the obj
			localStorage['saved_searches'] = JSON.stringify(watchlist);

			// Remove temporary element
			wrapper.remove();

		});
	}
};

notifications.init();
