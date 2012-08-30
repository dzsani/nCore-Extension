var dataStore;
var port = chrome.extension.connect();

var torrent_list_auto_pager = {

	progress : false,
	currPage : null,
	maxPage : null,
	counter : 0,

	init : function() {

		$(document).scroll(function() {
			torrent_list_auto_pager.scroll();
		});

		if(torrent_list_auto_pager.currPage == null) {
			if($('#pager_bottom').children().length == 1) {
				torrent_list_auto_pager.currPage = 1;
				torrent_list_auto_pager.maxPage = 1;
			} else {
				torrent_list_auto_pager.currPage = parseInt($('#pager_bottom .active_link').next().attr('href').match(/\d+/g)) - 1;
				torrent_list_auto_pager.maxPage = parseInt($('#pager_bottom a:last').attr('href').match(/\d+/g));
			}
		}
	},

	scroll : function() {

		var bottomHeight = $('body').height() - $('body').scrollTop() - $(window).height();

		if(
			bottomHeight < 300 &&
			!torrent_list_auto_pager.progress &&
			torrent_list_auto_pager.currPage < torrent_list_auto_pager.maxPage
		) {
			torrent_list_auto_pager.progress = true;
			torrent_list_auto_pager.load();
		}

	},

	load : function() {

		// Get the URL to load
		var url = $('#pager_bottom .active_link').next().attr('href').replace(/oldal=\d/, 'oldal='+(torrent_list_auto_pager.currPage+1)+'');

		// Make the call
		$.get(url, function(data) {

			// Insert page marker
			$('<div>').appendTo('.box_torrent_all').addClass('ncext_page_marker').html( torrent_list_auto_pager.currPage+1 +'. oldal');

			// Parse response
			var tmp = $(data);

			// Find the list items
			tmp.find('.box_torrent_all').children().each(function() {
				$(this).appendTo('.box_torrent_all');
			});

			torrent_list_auto_pager.progress = false;
			torrent_list_auto_pager.currPage++;
			torrent_list_auto_pager.counter++;
		});
	},

	destroy : function() {
		$(document).unbind('scroll');
	}
};

var screenshot_preview = {

	lastY : 0, lastX : 0,

	init : function() {

		$('.fancy_groups, .torrent_lenyilo_tartalom table a').live('mouseenter', function(e) {
			screenshot_preview.create(this);
		});

		$('.fancy_groups, .torrent_lenyilo_tartalom table a').live('mousemove', function(e) {
			screenshot_preview.move(e);
		});

		$('.fancy_groups, .torrent_lenyilo_tartalom table a').live('mouseleave', function() {
			screenshot_preview.destroyPreview();
		});
	},

	create : function(el) {

		// Create the preview element
		$('<div>').prependTo('body').addClass('ncext_preview');

		// Append loading text
		$('<span>').html('Betöltés ...').appendTo('.ncext_preview');

		// Preload the image to show
		screenshot_preview.preload(el);
	},

	preload : function(el) {
		$('<img>').load(function() {
			screenshot_preview.show(el );
		}).attr('src', $(el).attr('href'));
	},

	show : function(el) {

		// Remove loading text
		$('.ncext_preview span').remove();

		// Remove predefined dimension settings from the wrapper
		$('.ncext_preview').css({ width : 'auto', height : 'auto' });

		// Append the image
		$('<img>').attr('src', $(el).attr('href')).appendTo('.ncext_preview');

		screenshot_preview.move();

	},

	move : function(e) {

		// Return false when the preview element hasn't created yet
		if($('.ncext_preview').length == 0) {
			return false;
		}

		if($('.ncext_preview img').length == 0) {
			screenshot_preview.lastY = e.clientY;
			screenshot_preview.lastX = e.clientX;
		}

		// Get dimensions of mouse cursor
		var top = typeof e == "undefined" ? screenshot_preview.lastY : e.clientY;
		var left = typeof e == "undefined" ? screenshot_preview.lastX : e.clientX;

		// Get viewport dimensions
		var w_width = $(window).width();
		var w_height = $(window).height();


		// Horizontal position
		if(left > w_width / 2) {
			$('.ncext_preview').css({ left : 'auto', right : w_width - left + 10 });
		} else {
			$('.ncext_preview').css({ right : 'auto', left : w_width - (w_width - left - 10) });
		}

		// Set images sizes
		$('.ncext_preview img').width('100%');

		// Get image dimensions
		var width = $('.ncext_preview').outerWidth();
		var height = $('.ncext_preview').outerHeight();
		var ratio = width / height;


		// Calc preview positions
		var p_v = (top - height / 2 < 0) ? 0 : top - height / 2;
		var p_v = (p_v + height > w_height) ? w_height - height : p_v;
		var p_v = (p_v < 0) ? 0 : p_v;

		// Vertical position
		$('.ncext_preview').css({ bottom : 'auto', top : p_v })

		// Check image height
		if(height > w_height) {
			$('.ncext_preview img').height(w_height - 16).width('auto');
		}
	},

	destroyPreview : function() {
		$('.ncext_preview').remove();
	},

	destroy : function() {
		$('.fancy_groups, .torrent_lenyilo_tartalom table a').die('mouseenter').die('mousemove').die('mouseleave');
	}
};

function extInit() {

	// HOME PAGE
	if(document.location.href == 'http://ncore.cc/' || document.location.href.indexOf('index.php') != -1) {

		// Settings
		cp.init(1);

	// TORRENT LIST
	} else if(document.location.href.indexOf('torrents.php') != -1) {

		// Settings
		cp.init(2);

		if(dataStore['torrent_list_auto_pager'] == 'true') {
			torrent_list_auto_pager.init();
		}

		if(dataStore['screenshot_preview'] == 'true') {
			screenshot_preview.init();
		}

	// Not found, show the settings button anyway
	} else {
		cp.init(0);
	}
}

// Filter out iframes
// Request settings object
if (window.top === window) {
	port.postMessage({ name : "getSettings" });
}

port.onMessage.addListener(function(event) {

	if(event.name == 'setSettings') {

		// Save localStorage data
		dataStore = event.message;

		// Add domready event
		$(document).ready(function() {
			extInit();
		});

	}
});
