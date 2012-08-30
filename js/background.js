// Set default settings
if( typeof localStorage['torrent_list_auto_pager']		== 'undefined') localStorage['torrent_list_auto_pager'] = 'true';
if( typeof localStorage['screenshot_preview'] 			== 'undefined') localStorage['screenshot_preview'] 		= 'true';


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
		}
	});
});