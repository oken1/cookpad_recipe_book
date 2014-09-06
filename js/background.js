"use strict";

var g_cmn = {
	cmn_param: {
		current_tab: 'home',
	},
	recipes: null,
	lists: null,
};

g_cmn.recipes = new Array();
g_cmn.lists = new Array();

////////////////////////////////////////////////////////////
// 保存データを読み込む
////////////////////////////////////////////////////////////
var text = getUserInfo( 'g_cmn_V1' );

if ( text != '' )
{
	text = decodeURIComponent( text );
	var _g_cmn = JSON.parse( text );

	// 共通パラメータの復元
	for ( var p in _g_cmn.cmn_param )
	{
		// 削除されたパラメータは無視
		if ( g_cmn.cmn_param[p] == undefined )
		{
			continue;
		}

		g_cmn.cmn_param[p] = _g_cmn.cmn_param[p];
	}

	if ( _g_cmn.recipes != undefined )
	{
		g_cmn.recipes = _g_cmn.recipes;
	}

	if ( _g_cmn.lists != undefined )
	{
		g_cmn.lists = _g_cmn.lists;
	}
}

////////////////////////////////////////////////////////////////////////////////
// セーブデータをテキスト化する
////////////////////////////////////////////////////////////////////////////////
function SaveDataText()
{
	var _g_cmn = {};

	for ( var i in g_cmn )
	{
		if ( i == 'notsave' )
		{
			continue;
		}
		else
		{
			_g_cmn[i] = g_cmn[i];
		}
	}

	// 共通データをJSON形式でlocalStorageに保存
	var text = JSON.stringify( _g_cmn );
	text = encodeURIComponent( text );

	return text;
}

////////////////////////////////////////////////////////////////////////////////
// メッセージ処理
////////////////////////////////////////////////////////////////////////////////
chrome.extension.onMessage.addListener(
	function( req, sender, sendres )
	{
		switch( req.action )
		{
			// データ保存
			case 'save_data':
				setUserInfo( 'g_cmn_V1', SaveDataText() );
				break;

			// レシピ登録
			case 'get_contents':
				var chk = false;

				for ( var i = 0, _len = g_cmn.recipes.length ; i < _len ; i++ )
				{
					// すでに登録済み
					if ( g_cmn.recipes[i].id == req.item.id && g_cmn.recipes[i].lang == req.item.lang )
					{
						var item = g_cmn.recipes[i];
						g_cmn.recipes.splice( i, 1 );

						// Author、料理名、説明、イメージ、日付を最新のものに更新
						item.author = ( req.item.author ) ? req.item.author : item.author;
						item.name = ( req.item.name ) ? req.item.name : item.name;
						item.description = ( req.item.description ) ? req.item.description : item.description;
						item.image = ( req.item.image ) ? req.item.image : item.image;
						item.date = req.item.date;

						g_cmn.recipes.unshift( item );
						chk = true;
						break;
					}
				}

				// 新規レシピ
				if ( chk == false )
				{
					g_cmn.recipes.unshift( req.item );
				}

				setUserInfo( 'g_cmn_V1', SaveDataText() );

				break;
		}
	}
);
