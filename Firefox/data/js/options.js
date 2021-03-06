var cp = {

	init : function(page) {

		// Create the settings button
		$('body').append( $('<div>',  { id : 'ncext_settings_button'} )
			.append( $('<img>', { src : 'resource://ncore-at-kreaturamedia-dot-com/ncore/data/img/settings/icon.png' }) )
		);


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

		// Inject the settings html code

		// Settings navigation bar
		$('body').append( $('<div>', { id : 'ncext_settings_wrapper'} )
			.append( $('<ul>', { id : 'ncext_settings_header' } )
				.append( $('<li>', { text : 'Névjegy' })
				.after( $('<li>', { text : 'Torrentek' })
				.after( $('<li>', { text : 'Fórum' })
				.after( $('<li>', { text : 'Egyéb' })
				.after( $('<li>', { text : 'Keresések' }) ))))))

			// Page: About
			.append( $('<div>', { class : 'ncext_settings_page' })
				.append( $('<h3>', { text : 'nCore' } ) )
				.append( $('<p>', { text : 'Verzió: 1.1.0' } ) )
				.append( $('<p>', { text : 'Kiadás dátuma: 2012. 09. 27.' }))
			)

			// Page: Torrents
			.append( $('<div>', { class : 'ncext_settings_page' })
				.append( $('<div>')
					.append( $('<h3>', { text : 'Következő oldal automatikus betöltése a lap aljára érve' } ))
					.append( $('<p>', { text : 'Ezzel az opcióval soha nem kell manuálisan lapoznod, ahogy a lap aljára érkezel, a bővítmény előtölti a következő oldal tartalmát és azonnal beilleszti azt elnavigálás nélkül' } ))
					.append( $('<div>', { class : 'button', id : 'torrent_list_auto_pager' } ))
				)
				.append( $('<div>')
					.append( $('<h3>', { text : 'Képernyőképek előnézetének mutatása' } ))
					.append( $('<p>', { text : 'Ha az egérkurzort a képernyőképek fölé viszed, a bővítmény azonnal megjeleníti a kép előnézetét kattintás nélkül.' } ))
					.append( $('<div>', { class : 'button', id : 'screenshot_preview' } ))
				)
				.append( $('<div>')
					.append( $('<h3>', { text : 'Keresőmező automatikus lenyitása' } ))
					.append( $('<p>', { text : 'Néhány téma - köztük az alapértelmezett - elrejti a keresőmezőt és külön kattinttással lehet azt lenyitni. Ezzel az opcióval a keresőmező mindig nyitva marad.' } ))
					.append( $('<div>', { class : 'button', id : 'show_search_bar' } ))
				)
				.append( $('<div>')
					.append( $('<h3>', { text : 'Borítóképek mutatása' } ))
					.append( $('<p>', { text : 'A kategóriaképek helyett a mű borítója fog megjelenni.' } ))
					.append( $('<div>', { class : 'button', id : 'show_covers' } ))
				)
			)

			// Page: Forums
			.append( $('<div>', { class : 'ncext_settings_page' } )
				.append( $('<p>', { text : 'HAMAROSAN!' } ))
			)

			// Page: Experiments
			.append( $('<div>', { class : 'ncext_settings_page' } )
				.append( $('<div>')
					.append( $('<h3>', { text : 'Becsúszó hirdetések blokkolása' } ))
					.append( $('<p>', { text : 'Ezzel a funkcióval blokkolhatod az oldal aljára érve becsúszó [origo] hirdetéseket.' } ))
					.append( $('<div>', { class : 'button', id : 'disable_card_ads' } ))
				)
			)

			// Page: Searches
			.append( $('<div>', { class : 'ncext_settings_page' } )
				.append( $('<h3>', { text : 'A figyelmeztetésekről' } )
				.after( $('<p>', { html : 'A mentett kereséseknél lehetőség van figyelmeztetéseket kérni, a bővítmény automatikusan ellenőrzi bizonyos időközönként a feltöltött torrenteket és desktop figyelmeztetést fog küldeni neked ha például a kedvenc sorozathoz feltöltöttek egy új részt! Ez a funkció akkor is működik, ha a böngésző el sincs indítva. <br><br><strong>FONTOS:</strong> ez a funkció csak akkor működik, ha belépésnél a csökkentett biztonságot választottad!' } )
				.after( $('<table>', { id : 'ncext_opt_saved_searches' } )
					.append( $('<tr>')
						.append( $('<th>', { text : 'Kulcsszavak' } ))
						.append( $('<th>', { text : 'Kategóriák' } ))
						.append( $('<th>', { text : 'Alkategóriák' } ))
						.append( $('<th>', { text : 'Figyelmeztetés' } ))
						.append( $('<th>', { text : 'Törlés' } ))
					)
				)))
			)
		);

		// Set header list backgrounds
		$('#ncext_settings_header li').css({ 'background-image' : 'url(resource://ncore-at-kreaturamedia-dot-com/ncore/data/img/settings/icons.png)' });

		// Create tabs event
		$('#ncext_settings_header li').click(function() {

			cp.tab( $(this).index() );
		});

		// Add buttons background image
		$('.ncext_settings_page .button').css({ 'background-image' : 'url(resource://ncore-at-kreaturamedia-dot-com/ncore/data/img/settings/button.png)' });

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

			if(dataStore[ $(this).attr('id') ] == true) {
				$(this).attr('class', 'button on');

			} else {
				$(this).attr('class', 'button off');
			}
		});

		// Restore settings for checkboxes
		$('.ncext_settings_page input:checkbox').each(function() {

			if(dataStore[ $(this).attr('id') ] == true) {
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
			self.postMessage({ name : "setSetting", key : $(ele).attr('id'), val : true });

			// Set new value to dataStore var
			dataStore[$(ele).attr('id')] = true;

			// Activate the feature in real-time
			window[$(ele).attr('id')].init();

		} else {

			// Save new settings ...
			self.postMessage({ name : "setSetting", key : $(ele).attr('id'), val : false });

			// Set new value to dataStore var
			dataStore[$(ele).attr('id')] = false;

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
		self.postMessage({ name : "setSetting", key : $(ele).attr('id'), val : val });
	}
};

var cp_saved_searches = {

	init : function() {

		// Remove event
		$('#ncext_opt_saved_searches a').live('click', function(e) {
			e.preventDefault();
			cp_saved_searches.remove(this);
		});

		// Watch toggle
		$('#ncext_opt_saved_searches :checkbox').live('click', function() {
			cp_saved_searches.watch(this);
		});

		$('#ncext_opt_notifications button').click(function() {

			var user = $(this).parent().find('input:eq(0)').val();
			var pass = $(this).parent().find('input:eq(1)').val();

			cp_saved_searches.login(user, pass, this);
		});

		// Generate the list
		cp_saved_searches.generateList();
	},

	generateList : function() {

		// Get the list
		var list = JSON.parse(dataStore['saved_searches']);

		// Do nothing when the list is empty
		if(list.length < 1) {
			$('#ncext_opt_saved_searches').append( $('<tr>')
				.append( $('<td>', { colspan : '5', text : 'Jelenleg még nem mentettél el egyetlen keresést sem!' } ))
			);
			return;
		}

		// Remove old entries
		$('#ncext_opt_saved_searches tr:gt(0)').remove();

		// Build the new list
		for(c = 0; c < list.length; c++) {

			// Generate the row
			var item = $('<tr>').appendTo('#ncext_opt_saved_searches');
			$('<td>').text( list[c]['keywords'] ).appendTo(item);
			$('<td>').text( list[c]['categories'].join(',') ).appendTo(item);
			$('<td>').text( list[c]['subcategories'].join(',') ).appendTo(item);
			$('<td>').html('<label><input type="checkbox"><span>Nem</span></label>').appendTo(item);

			if(list[c]['watch'] == true) {
				$(item).find(':checkbox').prop('checked', true);
				$(item).find('span').html('Igen');
			}

			$(item).append( $('<td>')
				.append( $('<a>', { href : '#', title : 'Törlés' } )
					.append( $('<img>', { src : 'resource://ncore-at-kreaturamedia-dot-com/ncore/data/img/settings/remove.png', alt : 'Törlés' }))
				)
			);
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
		self.postMessage({ name : "removeSavedSearch", message : index - 1 });

		// Update local dataStore object
		self.postMessage({ name : "getSettings" });

		// Check content
		if( $('#ncext_opt_saved_searches tr').length < 2) {
			$('#ncext_opt_saved_searches').append( $('<tr>')
				.append( $('<td>', { colspan : '5', text : 'Jelenleg még nem mentettél el egyetlen keresést sem!' }))
			);
		}
	},

	watch : function(el) {

		if($(el).prop('checked') == true) {
			$(el).next().text('Igen');
			self.postMessage({ name : 'setWatchStatus', message : { index : $(el).closest('tr').index() - 1, status : true } });
		} else {
			$(el).next().text('Nem');
			self.postMessage({ name : 'setWatchStatus', message : { index : $(el).closest('tr').index() - 1, status : false } });
		}
	}
};
