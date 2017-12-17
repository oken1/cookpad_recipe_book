"use strict";

( function() {
	var item = {
		id: '',
		lang: '',
		author: '',
		name: '',
		description: '',
		image: '',
		favorite: false,
		list: {},
		trash: false,
		memo: '',
		date: CurrentDate(),
	};

	// error page
	if ( !$( 'meta[property="og:title"]' ).attr( 'content' ) )
	{
		return;
	}

	// Japanese
	if ( document.URL.match( /https?:\/\/cookpad\.com\/recipe\/(\d+)/ ) )
	{
		item.id = RegExp.$1;
		item.lang = 'ja';
	}
	// English
	else if ( document.URL.match( /https?:\/\/en\.cookpad\.com\/recipe\/(\d+)/ ) )
	{
		item.id = RegExp.$1;
		item.lang = 'en';

	}

	if ( $( 'meta[property="og:title"]' ).attr( 'content' ).match( /^(.+)$/ ) )
	{
		var name = RegExp.$1;

		// Author
		if ( name.match( /^(.+) by (.+)$/ ) )
		{
			item.author = RegExp.$2;
			item.name = RegExp.$1;
		}
		else
		{
			item.name = RegExp.$1;
		}
	}

	if ( $( 'meta[property="og:description"]' ).attr( 'content' ).replace( /\n/g, '<br>' ).match( /^(.+)$/ ) )
	{
		item.description = RegExp.$1;
	}

	if ( $( 'meta[property="og:image"]' ).attr( 'content' ).match( /^(.+)$/ ) )
	{
		item.image = RegExp.$1;
	}

	if ( item.id != '' && item.name != '' )
	{
		chrome.extension.sendMessage(
			{
				action: 'get_contents',
				item: item,
			},
			function( res )
			{
			}
		);
	}
} )();
