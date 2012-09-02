/******************************************************/
/*                   I M P O R T S                    */
/******************************************************/

// Import the self API to reference extension files
var self = require("self");

// Import simple-storage API for extension preferences
var ss = require("simple-storage");

// Import the page-mod API for content scripts
var pageMod = require("page-mod");

// Import notifications API for torrent watchlist
var notifications = require("notifications");

/******************************************************/
/*                  D E F A U L T S                   */
/******************************************************/

if(typeof ss.storage.torrent_list_auto_pager == "undefined")
	ss.storage.torrent_list_auto_pager = true;

if(typeof ss.storage.screenshot_preview == "undefined")
	ss.storage.screenshot_preview = true;

if(typeof ss.storage.saved_searches == "undefined")
	ss.storage.saved_searches = '[]';

if(typeof ss.storage.show_search_bar == "undefined")
	ss.storage.show_search_bar = true;

/******************************************************/
/*                    E V E N T S                     */
/******************************************************/
function handleEvents(worker) {
	worker.on('message', function(event) {

		if(event.name == 'getSettings') {
			worker.postMessage({ name : "setSettings", message : ss.storage });
		}
	});
}

/******************************************************/
/*                      I N I T                       */
/******************************************************/
pageMod.PageMod({

	// Match pattern for domain
	include: "*.ncore.cc",

	// CSS injection
	contentStyleFile : [
		self.data.url('css/options.css'),
		self.data.url('css/content.css')
	],

	// JS injection
	contentScriptWhen : "ready",
	contentScriptFile: [
		self.data.url("js/jquery.js"),
		self.data.url("js/options.js"),
		self.data.url("js/content.js")
	],

	// Event handling
	onAttach : handleEvents
});