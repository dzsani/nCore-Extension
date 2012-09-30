var dataStore;
var pageInit = false;
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

		var bottomHeight = $(document).height() - $('body').scrollTop() - $(window).height();

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
			$('<div>').appendTo('.box_torrent_all').addClass('ncext_page_marker').text( torrent_list_auto_pager.currPage+1 +'. oldal');

			// Parse response
			var tmp = $(data);

			// Find the list items
			tmp.find('.box_torrent_all').children().each(function() {
				$(this).appendTo('.box_torrent_all');
			});

			torrent_list_auto_pager.progress = false;
			torrent_list_auto_pager.currPage++;
			torrent_list_auto_pager.counter++;

			// Re-init
			if(dataStore['show_covers'] == 'true') {
				show_covers.init();
			}
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

var save_this_search = {

	init : function() {

		// Create the save button
		$('#keresoresz tr:eq(2) td:eq(4)').append( $('<a>', { href : '#', id : 'ncext_save_this_search', text : '[keresés mentése]' }) );

		// Add click event to the save button
		$('#ncext_save_this_search').click(function(e) {
			e.preventDefault();
			save_this_search.save();
		});

		// Generate the list
		save_this_search.generateList();
	},

	save : function() {

		var categories = [];
		var subcategories = [];

		// Get categories
		$('#table_torrcat input:checked').each(function() {
			categories.push( $(this).parent().next().find('a').html() );
		});

		// Get subcategories
		$('#kereses_mezo > div input:checked').each(function() {
			subcategories.push( $(this).parent().next().find('a').html() );
		});

		// Build the search object
		var search = {
			keywords : $('#mire').val(),
			categories: categories,
			subcategories : subcategories,
			data : $('#kategoriak form:first').serialize(),
			added : Math.round(new Date().getTime() / 1000),
			lastCheck : Math.round(new Date().getTime() / 1000),
			lastId : 0,
			counter : 0,
			watch : false
		};

		// Save to localStorage
		port.postMessage({ name : "addSavedSearch", message : search });

		// Update local dataStore object
		port.postMessage({ name : "getSettings" });

		// Update the list
		setTimeout(function() {
			save_this_search.generateList();
		}, 500);

		// Update the control panel
		setTimeout(function() {
			cp_saved_searches.generateList();
		}, 500);

		// Indicate the save success
		$('#keresoresz tr:eq(2) td:eq(4)').html('<span style="color: #4db02f;">Elmentve!</span>');
	},

	generateList : function() {

		// Get the list
		var list = JSON.parse(dataStore['saved_searches']);

		// Do nothing when the list is empty
		if(list.length < 1) {
			return false;
		}

		// Remove the old list if any
		$('#ncext_saved_searches').remove();

		// Create the list
		$('body').append( $('<div>', { id : 'ncext_saved_searches' } )
			.append( $('<h5>', { text : 'Keresések' } )
				.after( $('<div>', { id : 'ncext_saved_searches_list' } )
					.append( $('<table>')
						.append( $('<tr>')
							.append( $('<th>', { text : 'Kulcsszavak' } )
							.after( $('<th>', { text : 'Kategoriak' } )
							.after( $('<th>', { text : 'Alkategóriák' } ))))
						)
					)
				)
			)
		);

		// Add hover event
		$('#ncext_saved_searches').hover(
			function() {
				$(this).stop().animate({ opacity : 1, right : 0 }, 300);
				$('body').append( $('<div>', { id : 'ncext_saved_searches_overlay' }) );
			},

			function() {
				$(this).stop().animate({ opacity: 0.5, right : -530 }, 300);
				$('#ncext_saved_searches_overlay').remove();
			}
		);


		// Build the new list
		for(c = 0; c < list.length; c++) {

			// Generate the row
			var item = $('<tr>').appendTo('#ncext_saved_searches table');
			$('<td>').text( list[c]['keywords'] ).appendTo(item);
			$('<td>').text( list[c]['categories'].join(',') ).appendTo(item);
			$('<td>').text( list[c]['subcategories'].join(',') ).appendTo(item);

			// Add click event
			$(item).click(function() {
				document.location.href = 'torrents.php?' + list[ $(this).index() - 1 ]['data'];
			});
		}
	},

	removeRow : function(index) {

		$('#ncext_saved_searches table tr').eq( index ).remove();

		if($('#ncext_saved_searches table tr').length < 2) {
			$('#ncext_saved_searches').remove();
		}

	},

	destroy : function() {

	}
};

var show_search_bar = {

	init : function() {
		$('#kategoriak').slideDown();
		$('#panel_stuff').attr('class', 'panel_open');
	}
};


var disable_card_ads = {

	init : function() {
		$('div[id*="card_box_main"]:first').css('display', 'none');
	},

	destroy : function() {
		$('div[id*="card_box_main"]:first').css('display', 'block');
	}
};

var show_covers = {

	init : function() {

		$('.box_torrent:not(.cover_check)').each(function() {

			// Exclude from re-searches
			$(this).addClass('cover_check');

			// Set sizes
			$(this).children().css('height', 51);

			// Set children style
			$(this).find('.box_nagy, .box_nagy2').children().each(function() {
				$(this).css('margin-top', parseInt($(this).css('margin-top')) + 10);
			});

			$(this).find('.box_alap_img img').css('margin-top', 10);

			// Find cover
			if($(this).find('.infobar').length > 0) {

				// Find category icon
				var icon = $(this).find('.box_alap_img img');

				// Hide category icon
				icon.hide();

				// Create replacement
				var cover = $('<div>').insertAfter(icon).addClass('ncext_cover');

				// Get cover URL
				var url = $(this).find('.infobar img').attr('onmouseover').match(/'(.*?)'/);
					url = url[1];

				// Create image
				var img = $('<img>').load(function() {
					show_covers.load(this);
				}).attr('src', url).appendTo(cover);

			}

		});
	},

	load : function(el) {

		// Calc position
		var top = $(el).height() / 2 - $(el).parent().height() / 2;

		// Position the image
		$(el).css('margin-top', -top);
	},

	destroy : function() {

		// Show the original icon and remove cover
		$('.ncext_cover').prev().show().next().remove();

		// Remove style settings
		$('.box_torrent .box_nagy, .box_torrent .box_nagy2').children().each(function() {
			$(this).css('margin-top', parseInt($(this).css('margin-top')) - 10);
		});

		$('.box_torrent .box_alap_img img').css('margin-top', 0);

		$('.box_torrent').children().css('height', 32);

		// Remove checked class
		$('.cover_check').removeClass('cover_check');
	}
};


var find_subtitles = {

	init : function() {

		// Place find text when the use click on a torreent
		$('.box_torrent:not(.ncext_subtitle_check)').find('.torrent_txt a, .box_torrent .torrent_txt2 a').live('click', function() {
			$(this).closest('.box_torrent').addClass('ncext_subtitle_check');
			find_subtitles.appendText(this);
		});

		// Find subtitle
		$('.ncext_subtitle_link').die('click').live('click', function(e) {
			e.preventDefault();
			find_subtitles.search(this);
		});

		// Close overlay
		$('#ncext_subtitle_overlay').die('click').live('click', function() {
			$('#ncext_subtitle_results').animate({ left: '110%', marginLeft : 0 }, 300, function() {
				$(this).remove();
				$('#ncext_subtitle_overlay').animate({ opacity : 0 }, 100, function() {
					$(this).remove();
				});

			})
		});

	},

	appendText : function(el) {

		// Match torrent name
		var matches = $(el).attr('title').match(/(.*?)(\s|\.)S(\d{1,2})E(\d{2})(.*)/);

		// Return when no matches found
		if(matches == null) {
			// Try matching for a whole season
			matches = $(el).attr('title').match(/(.*?)(\s|\.)S(\d{1,2})(.*)/);

			// Break when no matches found
			if(matches == null) {
				return false;
			}
		}

		// Observer target
		var target = $(el).closest('.box_torrent').next().next()[0];

		// Callback
		var observer = new WebKitMutationObserver(function(mutations) {

			// Append new elements
			$(target).find('.torrent_lenyilo_lehetoseg').append(
				$('<div>', { class : 'download_separ' } )
					.after( $('<div>', { class : 'ncext_subtitle_link fajlok_txt', html : '<a href="#">Felirat keresése a feliratok.info-n</a>' } ) )
			);

			// Stop observing
			observer.disconnect();
		});

		// Start
		observer.observe(target, { childList: true });
	},

	search : function(el) {

		// Get torrent name
		var name = $(el).closest('.torrent_lenyilo, .torrent_lenyilo2').prev().prev().find('.torrent_txt a, .torrent_txt2 a').attr('title');

		// Get matches
		var matches = name.match(/(.*?)(\s|\.)S(\d{1,2})E(\d{2})(.*)/);

		// Build search
		if(matches != null) {
			var keywords = matches[1].replace(/\./g, ' ') + ' ' + matches[3].substr(1,1) + 'x' + matches[4];
			var season = 0;
		} else {
			matches = name.match(/(.*?)(\s|\.)S(\d{1,2})(.*)/);
			var keywords = matches[1].replace(/\./g, ' ') + ' Season ' + matches[3].substr(1,1);
				keywords = keywords.replace(/(\-|COMPLETE|complete)/, '');
			var season = 1;
		}

		// Build results GUI
		find_subtitles.buildResultsGUI(keywords);

		// Load subtitles via ajax
		setTimeout(function() {
			$.get('http://www.feliratok.info/?search='+keywords+'', function(data) {

				// Build search
				var results = find_subtitles.buildResults(data);

				// If no one found search again with
				// different keywords
				if(results == 0 && season == 0) {

					// Get new keywords
					var keywords = matches[1].replace(/\./g, ' ') + ' Season ' + matches[3].substr(1,1);
						keywords = keywords.replace(/(\-|COMPLETE|complete)/, '');

					// Rewrite search indicator
					$('#ncext_subtitle_results p').text('A bővítmény nem talált ehhez a részhez feliratot, keresés az egész évadra ...')

					// Search again
					$.get('http://www.feliratok.info/?search='+keywords+'', function(data) {

						// Results
						var results = find_subtitles.buildResults(data);

						// If not found
						if(results == 0) {
							$('#ncext_subtitle_results table tr td:first').text('Nincs találat!').css('color', 'red');
						}
					});
				} else if(results == 0) {
					$('#ncext_subtitle_results table tr td:first').text('Nincs találat!').css('color', 'red');
				}

			});
		}, 250);

	},

	buildResultsGUI : function(keywords) {

		// Create HTML markup
		$('body').append( $('<div>', { id : 'ncext_subtitle_overlay' } ) );
		$('body').append( $('<div>', { id : 'ncext_subtitle_results' })
			.append( $('<h1>', { text : 'Keresés a következőre: '+keywords+'' })
			.after( $('<p>')
			.after( $('<table>')
				.append( $('<tr>')
					.append( $('<td>', { colspan : '2', text : '... betöltés ...' } ))
				)
			)))
		);

		// Animate in
		$('#ncext_subtitle_results').animate({
			top : '50%', marginTop : $('#ncext_subtitle_results').height() / 2
		}, 300);
	},

	buildResults : function(data) {

		// Parse data
		var tmp = $(data);

		// Counter for results
		var counter = 0;

		// Populate the results list
		tmp.find('.result tbody > tr').each(function(index) {

			// Skip empty TRs
			if( $(this).find('.eredeti:first').length == 0) {
				return true;
			}

			// Increase the counter
			counter++;

			// Get lang flags
			if( $(this).find('.lang small').html() == 'Magyar') {
				var langImg = 'http://feliratok.info/img/flags/hungary.gif';
			} else {
				var langImg = 'http://feliratok.info/img/flags/uk.gif';
			}

			// Get DL link
			var dlLink = 'http://feliratok.info' + $(this).find('td:last a').attr('href');

			// Append result
			$('#ncext_subtitle_results table').append(
				$( $('<tr>')
					.append( $('<td>', { html : '<img src="'+langImg+'">' })
					.after( $('<td>', { html : '<a href="'+dlLink+'">'+$(this).find('.eredeti:first').text()+'</a>' } ))
					)
				)
			);
		});

		if(counter > 0) {
			$('#ncext_subtitle_results table tr:first').remove();
			find_subtitles.posOverlay();
		}

		return counter;
	},

	posOverlay : function() {
		$('#ncext_subtitle_results').animate({ 'margin-top' : -$('#ncext_subtitle_results').height() / 2 }, 300);
	}
};

function extInit() {

	// TORRENTS
	if(document.location.href.indexOf('torrents.php') != -1) {

		// Settings
		cp.init(1);

		if(dataStore['torrent_list_auto_pager'] == 'true') {
			torrent_list_auto_pager.init();
		}

		if(dataStore['screenshot_preview'] == 'true') {
			screenshot_preview.init();
		}

		if(dataStore['show_search_bar'] == 'true') {
			show_search_bar.init();
		}

		if(dataStore['show_covers'] == 'true') {
			show_covers.init();
		}

		find_subtitles.init();

	// FORUMS
	} else if(document.location.href.indexOf('forum.php') != -1) {
		cp.init(2);

	// Not found, show the settings button anyway
	} else {
		cp.init(0);
	}

	// Shared
	save_this_search.init();

	// Disable card ads
	if(dataStore['disable_card_ads'] == 'true') {
		disable_card_ads.init();
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
		if(pageInit == false) {
			$(document).ready(function() {
				pageInit = true;
				extInit();
			});
		}

	// Show alert
	} else if(event.name == 'showAlert') {
		alert(event.message);
	}
});
