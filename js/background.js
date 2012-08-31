// Set default settings
if( typeof localStorage['torrent_list_auto_pager']		== 'undefined') localStorage['torrent_list_auto_pager'] = 'true';
if( typeof localStorage['screenshot_preview'] 			== 'undefined') localStorage['screenshot_preview'] 		= 'true';
if( typeof localStorage['saved_searches'] 				== 'undefined') localStorage['saved_searches'] 			= '[]';


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
			list.splice(event.message, 1);

			// Stringify new object
			localStorage['saved_searches'] = JSON.stringify(list);
		}
	});
});