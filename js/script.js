"use strict";
var g_cmn;

////////////////////////////////////////////////////////////////////////////////
// 初期化処理
////////////////////////////////////////////////////////////////////////////////
$( document ).ready( function() {
	g_cmn = chrome.extension.getBackgroundPage().g_cmn;

	// 画面作成
	$( '#tabtitles' ).html( OutputTPL( 'tabtitles', {} ) );
	$( '#tabmain' ).html( OutputTPL( 'tab', { type: 'home' } ) );

	// タブタイトルクリック処理
	$( '#tabtitles' ).find( 'div.tabtitle' ).on( 'mousedown', function( e ) {
		TabTitleClick( $( this ) );
	} );

	// 最後に開いたタブを開く
	// ※setTimeoutを使わないと変なスクロールバーが出ることがある
	setTimeout( function() {$( '#tabtitles' ).find( 'div.tabtitle.' + g_cmn.cmn_param['current_tab'] ).trigger( 'mousedown' );}, 0 );
} );

////////////////////////////////////////////////////////////////////////////////
// テンプレート出力
////////////////////////////////////////////////////////////////////////////////
var tpl_c = {};

function OutputTPL( name, assign )
{
	if ( tpl_c[name] == null || tpl_c[name] == undefined )
	{
		$.ajax( {
			type: 'GET',
			url: 'template/' + name + '.tpl',
			data: {},
			dataType: 'html',
			success: function( data, status ) {
				// 国際化対応
				data = data.replace( /\t/g, '' );

				var i18ns = data.match( /\(i18n_.+?\)/g );

				if ( i18ns )
				{
					for ( var i = 0, _len = i18ns.length ; i < _len ; i++ )
					{
						data = data.replace( i18ns[i], chrome.i18n.getMessage( i18ns[i].replace( /\W/g, "" ) ) );
					}
				}

				tpl_c[name] = new jSmart( data );
			},
			async: false,
		} );
	}
	return tpl_c[name].fetch( assign );
}

////////////////////////////////////////////////////////////////////////////////
// データ保存要求
////////////////////////////////////////////////////////////////////////////////
function SaveData()
{
	chrome.extension.sendMessage(
		{
			action: 'save_data',
		},
		function( res )
		{
		}
	);
}

////////////////////////////////////////////////////////////////////////////////
// タブタイトルクリック処理
////////////////////////////////////////////////////////////////////////////////
function TabTitleClick( tabtitle )
{
	var type = tabtitle.attr( 'class' ).split( ' ' )[1];

	$( '#tabtitles' ).find( 'div.tabtitle' ).css( { 'opacity': 0.5 } );
	tabtitle.css( { 'opacity': 1.0 } );

	g_cmn.cmn_param['current_tab'] = type;
	SaveData();

	$( '#tabmain' ).html( OutputTPL( 'tab', { type: type } ) );

	var items = new Array();

	// ホームタブ
	if ( type == 'home' )
	{
		for ( var i = 0, _len = g_cmn.recipes.length ; i < _len ; i++ )
		{
			// ゴミ箱は除外
			if ( g_cmn.recipes[i].trash )
			{
				continue;
			}

			// それ以外はすべて
			items.push( g_cmn.recipes[i] );
		}

		$( '#tabmain' ).find( '> div.tab' ).find( '> div' ).html( '' );
	}
	// リストタブ
	else if ( type == 'list' )
	{
		// リスト一覧を表示

		$( '#tabmain' ).find( '> div.tab' ).find( '> div' ).html( OutputTPL( 'lists', {} ) );
	}
	// お気に入りタブ
	else if ( type == 'favorite' )
	{
		for ( var i = 0, _len = g_cmn.recipes.length ; i < _len ; i++ )
		{
			// ゴミ箱は除外
			if ( g_cmn.recipes[i].trash )
			{
				continue;
			}

			// お気に入りのみ
			if ( g_cmn.recipes[i].favorite )
			{
				items.push( g_cmn.recipes[i] );
			}
		}

		$( '#tabmain' ).find( '> div.tab' ).find( '> div' ).html( '' );
	}
	// ゴミ箱タブ
	else if ( type == 'trash' )
	{
		for ( var i = 0, _len = g_cmn.recipes.length ; i < _len ; i++ )
		{
			// ゴミ箱のみ
			if ( g_cmn.recipes[i].trash )
			{
				items.push( g_cmn.recipes[i] );
			}
		}

		$( '#tabmain' ).find( '> div.tab' ).find( '> div' ).html( OutputTPL( 'trash', {} ) );

		if ( items.length == 0 )
		{
			$( '#del_hist' ).hide();
		}
	}

	// リストタブ以外
	if ( type != 'list' )
	{
		var s = '';

		for ( var i = 0, _len = items.length ; i < _len ; i++ )
		{
			s += OutputTPL( 'item', { item: items[i] } );
		}

		$( '#tabmain' ).find( '> div.tab' ).find( '> div' ).append( s );
	}
	// リストタブ（リストの一覧表示）
	else
	{
		var s = '';

		for ( var i = 0, _len = g_cmn.lists.length ; i < _len ; i++ )
		{
			s += OutputTPL( 'list', { list: g_cmn.lists[i] } );
		}

		$( '#tabmain' ).find( '> div.tab' ).find( '> div' ).append( s );
		$( '#list_name' ).focus();
	}

	// 各種イベント処理
	EventBinding();
}

////////////////////////////////////////////////////////////////////////////////
// 各種イベント処理
////////////////////////////////////////////////////////////////////////////////
function EventBinding()
{
	console.time( 'EventBinding' );

	$( '#tabmain' ).find( '> div.tab' ).find( '> div' ).find( '> div.item' ).each( function() {
		var item = $( this );
		var _div = item.find( '> div' ).find( '> div' );
		var name = _div.find( '> div.name' ).find( '> a' );
		var fav = _div.find( '> div.favorite' ).find( '> span' );
		var list = _div.find( '> div.list' ).find( '> span' );
		var trash = _div.find( '> div.trash' ).find( '> span' );
		var id = item.attr( 'id' );
		var lang = item.attr( 'lang' );

		// 料理名クリック
		name.on( 'click', function() {
			chrome.tabs.update( { url: name.attr( 'href' ) } );
		} );

		// リスト選択
		list.on( 'mousedown', function() {
			if ( $( '#list_select' ).length > 0 )
			{
				$( '#list_select' ).remove();
			}

			var _on = list.hasClass( 'on' );

			$( '#tabmain' ).find( '> div.tab' ).find( '> div' ).find( '> div.item' )
				.find( '> div' ).find( '> div' ).find( '> div.list' ).find( '> span' ).removeClass( 'on' );

			if ( !_on )
			{
				list.addClass( 'on' );
				$( '#tabmain' ).append( OutputTPL( 'list_select', { name: name.text() } ) );

				var index = GetIndex( id, lang );

				if ( index == -1 )
				{
					$( '#list_select' ).remove();
					return;
				}

				var s = '';

				// リスト一覧作成
				for ( var i = 0, _len = g_cmn.lists.length ; i < _len ; i++ )
				{
					s += OutputTPL( 'list_select_item',
						{
							item: g_cmn.lists[i],
							select: ( g_cmn.recipes[index].list[g_cmn.lists[i].id] ) ? true : false
						} );
				}

				$( '#list_select' ).append( s );

				// リストチェック処理
				$( '#list_select' ).find( '> div.list_select_item' ).each( function() {
					var select_item = $( this );
					var listid = select_item.attr( 'id' );
					var listindex = GetListIndex( listid );
					var check = select_item.find( '> div.check' );

					if ( listindex == -1 )
					{
						return;
					}

					check.find( 'span' ).on( 'mousedown', function() {
						var span = $( this );

						// チェック->解除
						if ( span.attr( 'select' ) == 'true' )
						{
							span.attr( 'select', 'false' )
								.removeClass( 'icon-checkbox-checked' )
								.addClass( 'icon-checkbox-unchecked' );

							// リスト配列から削除
							delete g_cmn.recipes[index].list[listid];

							// リストの件数を-1
							g_cmn.lists[listindex].count--;
						}
						// 解除->チェック
						else
						{
							span.attr( 'select', 'true' )
								.removeClass( 'icon-checkbox-unchecked' )
								.addClass( 'icon-checkbox-checked' );

							// リスト配列に追加
							g_cmn.recipes[index].list[listid] = true;

							// リストの件数を+1;
							g_cmn.lists[listindex].count++;
						}

						SaveData();
					} );
				} );
			}
		} );

		// お気に入りON<->OFF
		fav.on( 'mousedown', function() {
			var i = GetIndex( id, lang );

			if ( i == -1 )
			{
				return;
			}

			// ON->OFF
			if ( g_cmn.recipes[i].favorite )
			{
				g_cmn.recipes[i].favorite = false;
				fav.removeClass( 'true' ).addClass( 'false' );

				// お気に入りタブの場合は消す
				if ( g_cmn.cmn_param['current_tab'] == 'favorite' )
				{
					item.remove();
				}
			}
			// OFF->ON
			else
			{
				g_cmn.recipes[i].favorite = true;
				fav.removeClass( 'false' ).addClass( 'true' );
			}

			SaveData();
		} );

		// ゴミ箱ON<->OFF
		trash.on( 'mousedown', function() {;
			var i = GetIndex( id, lang );

			if ( i == -1 )
			{
				return;
			}

			// ON->OFF
			if ( g_cmn.recipes[i].trash )
			{
				g_cmn.recipes[i].trash = false;
				trash.removeClass( 'true' ).addClass( 'false' );

				// ゴミ箱の場合は消す
				if ( g_cmn.cmn_param['current_tab'] == 'trash' )
				{
					item.remove();

					// ゴミが1件もなくなったら履歴から削除ボタンを消す
					if ( $( '#tabmain' ).find( '> div.tab' ).find( '> div' ).find( '> div.item' ).length == 0 )
					{
						$( '#del_hist' ).hide();
					}
				}
			}
			// OFF->ON
			else
			{
				g_cmn.recipes[i].trash = true;
				trash.removeClass( 'false' ).addClass( 'true' );

				// ゴミ箱以外の場合は消す
				if ( g_cmn.cmn_param['current_tab'] != 'trash' )
				{
					item.remove();
				}
			}

			SaveData();
		} );
	} );

	// 履歴から削除
	$( '#del_hist' ).on( 'click', function() {
		for ( var i = 0, _len = g_cmn.recipes.length ; i < _len ; i++ )
		{
			// ゴミ箱の中身を全部削除
			if ( g_cmn.recipes[i].trash )
			{
				// 登録しているリストの件数を減らす
				for ( var id in g_cmn.recipes[i].list )
				{
					var listindex = GetListIndex( id );

					if ( listindex != -1 )
					{
						g_cmn.lists[listindex].count--;
					}
				}

				g_cmn.recipes.splice( i, 1 );
				i--;
				_len--;
			}
		}

		SaveData();

		$( '#tabmain' ).find( '> div.tab' ).find( '> div' ).find( '> div.item' ).remove();

		// リスト選択が開いている場合は閉じる
		$( '#list_select' ).remove();

		// ボタンを消す
		$( '#del_hist' ).hide();
	} );

	// リストを作る
	$( '#create_list' ).on( 'click', function() {
		var list = {
			id: GetUniqueID(),
			name: escapeHTML( $( '#list_name' ).val() ),
			count: 0,
		};

		if ( list.name.length > 0 && list.name.length <= 32 )
		{
			g_cmn.lists.push( list );
			SaveData();

			// リスト一覧を開き直す
			$( '#tabtitles' ).find( 'div.tabtitle.list' ).trigger( 'mousedown' );
		}
	} );

	// テキストボックスでEnterを押したときに「リストを作る」を実行
	$( '#list_name' ).keydown( function( e ) {
		if ( e.keyCode == 13 )
		{
			$( '#create_list' ).trigger( 'click' );
			return false;
		}
	} );

	$( '#tabmain' ).find( '> div.tab' ).find( '> div' ).find( '> div.list' ).each( function() {
		var list = $( this );
		var del = list.find( '> div' ).find( '> div.delete' ).find( '> span' );
		var name = list.find( '> div' ).find( '> div.name' ).find( '> a' );
		var id = list.attr( 'id' );

		// リスト削除
		del.on( 'mousedown', function() {
			var listindex = GetListIndex( id );

			if ( listindex != -1 )
			{
				g_cmn.lists.splice( listindex, 1 );
				list.remove();

				for ( var i = 0, _len = g_cmn.recipes.length ; i < _len ; i++ )
				{
					if ( g_cmn.recipes[i].list[id] )
					{
						delete g_cmn.recipes[i].list[id];
					}
				}
			}

			SaveData();
		} );

		// リスト名クリック
		name.on( 'click', function() {
			var items = new Array();

			$( '#tabmain' ).find( '> div.tab' ).find( '> div' ).html( '' );

			for ( var i = 0, _len = g_cmn.recipes.length ; i < _len ; i++ )
			{
				// ゴミ箱は除外
				if ( g_cmn.recipes[i].trash )
				{
					continue;
				}

				if ( g_cmn.recipes[i].list[id] )
				{
					items.push( g_cmn.recipes[i] );
				}
			}

			var s = '';

			for ( var i = 0, _len = items.length ; i < _len ; i++ )
			{
				s += OutputTPL( 'item', { item: items[i] } );
			}

			$( '#tabmain' ).find( '> div.tab' ).find( '> div' ).append( s );

			// 各種イベント処理
			EventBinding();
		} );
	} );

	console.timeEnd( 'EventBinding' );
}

////////////////////////////////////////////////////////////////////////////////
// ID＋langからレシピのインデックスを求める
////////////////////////////////////////////////////////////////////////////////
function GetIndex( id, lang )
{
	for ( var i = 0, _len = g_cmn.recipes.length ; i < _len ; i++ )
	{
		if ( g_cmn.recipes[i].id == id && g_cmn.recipes[i].lang == lang )
		{
			return i;
		}
	}

	return -1;
}

////////////////////////////////////////////////////////////////////////////////
// IDからリストのインデックスを求める
////////////////////////////////////////////////////////////////////////////////
function GetListIndex( id )
{
	for ( var i = 0, _len = g_cmn.lists.length ; i < _len ; i++ )
	{
		if ( g_cmn.lists[i].id == id )
		{
			return i;
		}
	}

	return -1;
}
