/******************************************************/
/*                   I M P O R T S                    */
/******************************************************/

// Import the self API to reference extension files
var self = require("self");

// Import simple-storage API for extension preferences
var ss = require("simple-storage");

// Import the page-mod API for content scripts
var pageMod = require("page-mod");

// Import page-workers
var pageWorker = require("page-worker");

// Import timers for the interval checks of the
// notification system
var timer = require("timers");

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


		// Send back the settings object
		if(event.name == 'getSettings') {

			worker.postMessage({ name : "setSettings", message : ss.storage });

		// Save posted settings
		} else if(event.name == 'setSetting') {

			// Setting name
			var key = event.key;

			// Setting value
			var val = event.val;

			ss.storage[key] = val;

		// Add saved search
		} else if(event.name == 'addSavedSearch') {

			// Parse JSON
			var list = JSON.parse(ss.storage.saved_searches);

			// Att new item to the list
			list.push(event.message);

			// Stringify new object
			ss.storage.saved_searches = JSON.stringify(list);

		// Remove saved search
		} else if(event.name == 'removeSavedSearch') {

			// Parse JSON
			var list = JSON.parse(ss.storage.saved_searches);

			// Att new item to the list
			var item = list.splice(event.message, 1);

			// Stringify new object
			ss.storage.saved_searches = JSON.stringify(list);

			// Restart notifications if any
			if(item[0]['watch'] == true) {
				notifications.restart();
			}

		} else if(event.name == 'setWatchStatus') {

			// Parse JSON
			var list = JSON.parse(ss.storage.saved_searches);

			// Set
			list[event.message.index]['watch'] = event.message.status;

			// Stringify new object
			ss.storage.saved_searches = JSON.stringify(list);

			// Restart notifications
			if(event.message.status == true) {
				notifications.add(event.message.index);
			} else {
				notifications.restart();
			}

		// Update notifications
		} else if(event.name == 'updateNotifications') {
			notifications.restart();
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

/******************************************************/
/*              N O T I F I C A T I O N S             */
/******************************************************/

var notifications = {

	intervals : [],

	init : function() {

		// Get watchlist
		var watchlist = JSON.parse(ss.storage.saved_searches);

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

		// Stop active invervals if any
		if(notifications.intervals.length > 0) {
			for(c = 0; c < notifications.intervals.length; c++) {
				timer.clearInterval(notifications.intervals[c]);
			}

			notifications.intervals = [];
		}

		// Get the most recent watchlist
		var watchlist = JSON.parse(ss.storage.saved_searches);

		// Iterate over them
		for(c = 0; c < watchlist.length; c++) {

			if(watchlist[c]['watch'] == true) {
				notifications.start(c);
			}
		}
	},

	start : function(index) {


		notifications.intervals.push(
			timer.setInterval(function() {
				notifications.fetch(index)
			}, 600000)
		);
	},

	add : function(index) {

		// Get the object
		var watchlist = JSON.parse(ss.storage.saved_searches);
		var obj = watchlist[index];

		// Create page worker to query the data
		pageWorker.Page({
			contentURL: "http://ncore.cc?notifications_add=1&"+obj['data']+"#ignore",
			contentScriptFile: [self.data.url('js/jquery.js'), self.data.url('js/worker.js')],
			contentScriptWhen: "ready",
			onMessage: function(message) {
				console.log(message);
			}
		});
	},

	remove : function(index) {
		timer.clearInterval(notifications.intervals[index]);
	},

	fetch : function(index) {

		// Get the object
		var watchlist = JSON.parse(ss.storage.saved_searches);
		var obj = watchlist[index];

		// Create page worker to query the data
		pageWorker.Page({
			contentURL: "http://ncore.cc?notifications_fetch=1&"+obj['data']+"#ignore",
			contentScriptFile: [self.data.url('js/jquery.js'), self.data.url('js/worker.js')],
			contentScriptWhen: "ready",
			onMessage: function(message) {
				console.log(message);
			}
		});
	}
};

notifications.init();