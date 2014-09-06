"use strict";

////////////////////////////////////////////////////////////////////////////////
// ユニークID発行
////////////////////////////////////////////////////////////////////////////////
function GetUniqueID()
{
	var rnd = Math.floor( Math.random() * 10000 );
	var cur = new Date();
	var p = Date.parse( cur );
	p += cur.getMilliseconds();

	return rnd + p.toString();
}

////////////////////////////////////////////////////////////////////////////////
// 日時をyyyy/mm/dd hh:mm:ss形式で返す
////////////////////////////////////////////////////////////////////////////////
function CurrentDate( date )
{
	if ( !date )
	{
		date = new Date();
	}

	return ( "0000" + date.getFullYear() ).slice( -4 ) + "/" +
			( "00" + ( date.getMonth() + 1 ) ).slice( -2 ) + "/" +
			( "00" + date.getDate() ).slice( -2 ) + " " +
			( "00" + date.getHours() ).slice( -2 ) + ":" +
			( "00" + date.getMinutes() ).slice( -2 ) + ":" +
			( "00" + date.getSeconds() ).slice( -2 );
}

////////////////////////////////////////////////////////////////////////////////
// localStorage取得
////////////////////////////////////////////////////////////////////////////////
function getUserInfo( key )
{
	if ( localStorage[key] )
	{
		return localStorage[key];
	}
	else
	{
		return "";
	}
}

////////////////////////////////////////////////////////////////////////////////
// localStorage設定
////////////////////////////////////////////////////////////////////////////////
function setUserInfo( key, val )
{
	localStorage[key] = val;
}

////////////////////////////////////////////////////////////////////////////////
// localStorage消去
////////////////////////////////////////////////////////////////////////////////
function clearUserInfo( key )
{
	localStorage.removeItem( key );
}

////////////////////////////////////////////////////////////////////////////////
// htmlエスケープ
////////////////////////////////////////////////////////////////////////////////
function escapeHTML( _strTarget )
{
	var div = document.createElement('div');
	var text =  document.createTextNode('');
	div.appendChild(text);
	text.data = _strTarget;

	var ret = div.innerHTML;
	ret = ret.replace( /\"/g, '&quot;' );	// "
	ret = ret.replace( /\'/g, '&#39;' );	// '

	return ret;
}