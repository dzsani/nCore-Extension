var torrent_list_auto_pager = {

	progress : false,
	currPage : null,
	maxPage : null,
	counter : 0,

	init : function() {

		$(document).scroll(function() {
			torrent_list_auto_pager.scroll();
		});

		if($('#pager_bottom').children().length == 1) {
			torrent_list_auto_pager.currPage = 1;
			torrent_list_auto_pager.maxPage = 1;
		} else {
			torrent_list_auto_pager.currPage = parseInt($('#pager_bottom .active_link').next().attr('href').match(/\d+/g)) - 1;
			torrent_list_auto_pager.maxPage = parseInt($('#pager_bottom a:last').attr('href').match(/\d+/g));
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

	}
};

var screenshot_preview = {

	init : function() {

		$('.fancy_groups, .torrent_lenyilo_tartalom table a').live('mouseenter', function() {
			screenshot_preview.create(this);
		});

		$('.fancy_groups, .torrent_lenyilo_tartalom table a').live('mousemove', function(e) {
			screenshot_preview.move(e);
		});

		$('.fancy_groups, .torrent_lenyilo_tartalom table a').live('mouseleave', function() {
			screenshot_preview.destroy();
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
			screenshot_preview.show( el, $(this).width(), $(this).height() );
		}).attr('src', $(el).attr('href'));
	},

	show : function(el, w, h) {

		// Remove loading text
		$('.ncext_preview span').remove();

		// Append the image
		$('<img>').attr('src', $(el).attr('href')).width(w).appendTo('.ncext_preview');
	},

	move : function(e) {

		// Return false when the preview element hasn't created yet
		if($('.ncext_preview').length == 0) {
			return false;
		}

		// Get dimensions of mouse cursor
		var top = e.clientY;
		var left = e.clientX

		// Get viewport dimensions
		var w_width = $(window).width();
		var w_height = $(window).height();

		// Remove predefined dimension settings from the wrapper
		$('.ncext_preview').css({ width : 'auto', height : 'auto' });;

		// Horizontal position
		if(left > w_width / 2) {
			$('.ncext_preview').css({ left : 'auto', right : w_width - left + 10 });
		} else {
			$('.ncext_preview').css({ right : 'auto', left : w_width - (w_width - left - 10) });
		}

		// Set images sizes
		$('.ncext_preview img').css('width', '100%');

		// Get image dimensions
		var width = $('.ncext_preview').outerWidth();
		var height = $('.ncext_preview').outerHeight();
		var ratio = width / height;


		// Calc preview positions
		var p_v = (top - height / 2 < 0) ? 0 : top - height / 2;
		var p_v = (p_v + height > w_height) ? w_height - height : p_v;

		// Vertical position
		$('.ncext_preview').css({ bottom : 'auto', top : p_v })
	},

	destroy : function() {
		$('.ncext_preview').remove();
	}
};

$(document).ready(function() {

	// TORRENT LIST
	if(document.location.href.indexOf('torrents.php') != -1) {

		torrent_list_auto_pager.init();
		screenshot_preview.init();
	}

});