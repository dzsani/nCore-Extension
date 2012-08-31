var cp = {

	init : function(page) {

		// Create the settings button
		$('<div id="ncext_settings_button"><img src="'+chrome.extension.getURL('/img/settings/icon.png')+'" alt=""></div>').appendTo('body');

		// Create the hiding overlay
		$('<div id="ncext_settings_hide_overlay"></div>').appendTo('body');

		// Create click event for settings pane
		$('#ncext_settings_button').click(function() {

			if($('#ncext_settings_wrapper').hasClass('opened')) {
				cp.hide();
			} else {
				cp.show();
			}
		});

		// Inject the html code
		var html = '';

		html += '<div id="ncext_settings_wrapper">';
			html += '<ul id="ncext_settings_header">';
				html += '<li>Névjegy</li>';
				html += '<li>Torrentek</li>';
				html += '<li>Fórum</li>';
				html += '<li>Egyéb</li>';
				html += '<li>Keresések</li>';
				html += '<li class="clear"></li>';
			html += '</ul>';

			html += '<div class="ncext_settings_page">';
				html += '<h3>nCore</h3>';
				html += '<p>Verzió: 1.0.0<br></p>';
				html += '<p>Kiadás dátuma: 2012. 08. 30.</p>';
				html += '<p>Fejlesztő: Gera János "dzsani" <a href="http://kreaturamedia.com" target="_blank">http://kreaturamedia.com</a></p>';
			html += '</div>';

			html += '<div class="ncext_settings_page">';
				html += '<div>';
					html += '<h3>Következő oldal automatikus betöltése a lap aljára érve</h3>';
					html += '<p>Ezzel az opcióval soha nem kell manuálisan lapoznod, ahogy a lap aljára érkezel, a bővítmény előtölti a következő oldal tartalmát és azonnal beilleszti azt elnavigálás nélkül</p>';
					html += '<div class="button" id="torrent_list_auto_pager"></div>';
				html += '</div>';
				html += '<div>';
					html += '<h3>Képernyőképek előnézetének mutatása</h3>';
					html += '<p>Ha az egérkurzorral a képernyőképek fölé mész, a bővítmény azonnal megjeleníti a kép előnézetét kattintás nélkül.</p>';
					html += '<div class="button" id="screenshot_preview"></div>';
				html += '</div>';
			html += '</div>';

			html += '<div class="ncext_settings_page">';
				html += 'HAMAROSAN!';
			html += '</div>';
			html += '<div class="ncext_settings_page">';
				html += 'HAMAROSAN!';
			html += '</div>';
			html += '<div class="ncext_settings_page">';
				html += '<table id="ncext_opt_saved_searches">';
					html += '<tr>';
						html += '<th>Kulcsszavak</th>';
						html += '<th>Kategóriák</th>';
						html += '<th>Alkategóriák</th>';
						html += '<th>Törlés</th>';
					html += '</tr>';
				html += '</table>';
			html += '</div>';
		html += '</div>';


		// Append settings pane html to body
		$(html).appendTo('body');

		// Set header list backgrounds
		$('#ncext_settings_header li').css({ 'background-image' : 'url('+chrome.extension.getURL('/img/settings/icons.png')+')' });

		// Create tabs event
		$('#ncext_settings_header li').click(function() {

			cp.tab( $(this).index() );
		});

		// Add buttons background image
		$('.ncext_settings_page .button').css({ 'background-image' : 'url('+chrome.extension.getURL('/img/settings/button.png')+')' });

		// Get the requested page number
		var page  = typeof page == "undefined" ? 0 : page;

		// Select the right page
		cp.tab(page);

		// Close when clicking away
		$('#ncext_settings_hide_overlay').click(function() {
			cp.hide();
		});

		// Restore settings
		settings.restore();

		// Settings change event, saving
		$('.ncext_settings_page .button').click(function() {
			cp.button(this);
		});

		// Set checkboxes
		$('.ncext_settings_page input:checkbox').click(function() {
			settings.save(this);
		});


		// Set select boxes
		$('.ncext_settings_page select').change(function() {
			settings.select(this);
		});

		cp_saved_searches.init();
	},

	show : function() {

		// Set the overlay
		$('#ncext_settings_hide_overlay').css({ display : 'block', opacity : 0 });
		$('#ncext_settings_hide_overlay').animate({ opacity : 0.6 }, 200);

		// Get the viewport and panel dimensions
		var viewWidth	= $(window).width();
		var paneWidth	= $('#ncext_settings_wrapper').width();
		var paneHeight	= $('#ncext_settings_wrapper').height();
		var leftProp	= viewWidth / 2 - paneWidth / 2;

		// Apply calculated CSS settings to the panel
		$('#ncext_settings_wrapper').css({ left : leftProp, top : '-'+(paneHeight+10)+'px' });

		// Reveal the panel
		$('#ncext_settings_wrapper').delay(250).animate({ top : 10 }, 250);

		// Add 'opened' class
		$('#ncext_settings_wrapper').addClass('opened');

	},

	hide : function() {

		// Get the settings pane height
		var paneHeight = $('#ncext_settings_wrapper').height();

		// Hide the pane
		$('#ncext_settings_wrapper').animate({ top : '-'+(paneHeight+10)+'px'}, 200, function() {

			// Hide the settings pane
			$(this).css('top', -9000);

			// Restore the overlay
			$('#ncext_settings_hide_overlay').animate({ opacity : 0 }, 100, function() {
				$(this).css('display', 'none');
			});

			// Remove 'opened' class
			$('#ncext_settings_wrapper').removeClass('opened');
		});
	},

	tab : function(index) {

		// Set the current height to prevent resize
		$('#ncext_settings_wrapper').css({ height : $('#ncext_settings_wrapper').height() });

		// Hide all tab pages
		$('.ncext_settings_page').css('display', 'none');

		// Show the selected tab page
		$('.ncext_settings_page').eq(index).fadeIn(250);

		// Get new height of settings pane
		var newPaneHeight = $('#ncext_settings_header').height() + $('.ncext_settings_page').eq(index).outerHeight();

		// Animate the resize
		$('#ncext_settings_wrapper').stop().animate({ height : newPaneHeight }, 150, function() {

			// Set auto height
			$('#ncext_settings_wrapper').css({ height : 'auto' });
		});

		// Remove all selected background in the header
		$('#ncext_settings_header li').removeClass('on');

		// Add selected background to the selectad tab button
		$('#ncext_settings_header li').eq(index).addClass('on');
	},

	button : function(ele) {

		if( $(ele).hasClass('on') ) {
			$(ele).animate({ 'background-position-x' : 0 }, 300);
			$(ele).attr('class', 'button off');

			settings.save(ele);
		} else {

			$(ele).animate({ 'background-position-x' : -40 }, 300);
			$(ele).attr('class', 'button on');

			settings.save(ele);
		}
	}
};


var settings = {

	restore : function() {

		// Restore settings for buttons
		$('.ncext_settings_page .button').each(function() {

			if(dataStore[ $(this).attr('id') ] == 'true') {
				$(this).attr('class', 'button on');

			} else {
				$(this).attr('class', 'button off');
			}
		});

		// Restore settings for checkboxes
		$('.ncext_settings_page input:checkbox').each(function() {

			if(dataStore[ $(this).attr('id') ] == 'true') {
				$(this).attr('checked', true);
			} else {
				$(this).attr('checked', false);
			}
		});

		// Restore settings for select boxes
		$('.ncext_settings_page select').each(function() {

			$(this).find('option[value="'+dataStore[ $(this).attr('id') ]+'"]').attr('selected', true);
		});
	},

	save : function(ele) {

		if( $(ele).hasClass('on') || $(ele).attr('checked') == 'checked' || $(ele).attr('checked') == true) {

			// Save new settings ...
			port.postMessage({ name : "setSetting", key : $(ele).attr('id'), val : 'true' });

			// Set new value to dataStore var
			dataStore[$(ele).attr('id')] = 'true';

			// Activate the feature in real-time
			window[$(ele).attr('id')].init();

		} else {

			// Save new settings ...
			port.postMessage({ name : "setSetting", key : $(ele).attr('id'), val : 'false' });

			// Set new value to dataStore var
			dataStore[$(ele).attr('id')] = 'false';

			// Disable the feature in real-time
			window[$(ele).attr('id')].destroy();
		}
	},

	select : function(el) {

		// Get the settings value
		var val = $(el).find('option:selected').val();

		// Update in dataStore
		dataStore[ $(el).attr('id') ] = val;

		// Update in localStorage
		port.postMessage({ name : "setSetting", key : $(ele).attr('id'), val : val });
	}
};

var cp_saved_searches = {

	init : function() {

		// Remove event
		$('#ncext_opt_saved_searches a').live('click', function(e) {
			e.preventDefault();
			cp_saved_searches.remove(this);
		});

		// Generate the list
		cp_saved_searches.generateList();
	},

	generateList : function() {

		// Get the list
		var list = JSON.parse(dataStore['saved_searches']);

		// Do nothing when the list is empty
		if(list.length < 1) {
			$('<tr><td colspan="4">Jelenleg még nem mentettél el egyetlen keresést sem!</td></tr>').appendTo('#ncext_opt_saved_searches');
			return;
		}

		// Remove old entries
		$('#ncext_opt_saved_searches tr:gt(0)').remove();

		// Build the new list
		for(c = 0; c < list.length; c++) {

			// Generate the row
			var item = $('<tr>').appendTo('#ncext_opt_saved_searches');
			$('<td>').html( list[c]['keywords'] ).appendTo(item);
			$('<td>').html( list[c]['categories'].join(',') ).appendTo(item);
			$('<td>').html( list[c]['subcategories'].join(',') ).appendTo(item);
			$('<td><a href="#">Töröl</a></td>').appendTo(item);
		}
	},

	remove : function(el) {

		// Get the element index
		var index = $(el).closest('tr').index();

		// Remove the row in the admin panel
		$('#ncext_opt_saved_searches tr').eq( index ).remove();

		// Remove the row in the front-end panel
		save_this_search.removeRow( index );

		// Remove the entry from LocalStorage
		port.postMessage({ name : "removeSavedSearch", message : index - 1 });

		// Update local dataStore object
		port.postMessage({ name : "getSettings" });

		// Check content
		if( $('#ncext_opt_saved_searches tr').length < 2) {
			$('<tr><td colspan="4">Jelenleg még nem mentettél el egyetlen keresést sem!</td></tr>').appendTo('#ncext_opt_saved_searches');
		}
	}
};
