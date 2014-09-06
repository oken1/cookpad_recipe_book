<div class='item' id='{$item->id}' lang='{$item->lang}'>
	<div>
		<div class='image'><img src='{$item->image}'></div>
		<div>
			{if $item->lang=='ja'}
			<div class='name'><a href='http://cookpad.com/recipe/{$item->id}'>{$item->name}</a><span class='author'> by {$item->author}</span></div>
			{/if}
			{if $item->lang=='en'}
			<div class='name'><a href='http://en.cookpad.com/recipe/{$item->id}'>{$item->name}</a></div>
			{/if}
			<div class='description'>{$item->description}</div>
			<div class='date'>{$item->date}</div>
		</div>
		<div>
			<div class='favorite'><span class='icon-star {if $item->favorite}true{else}false{/if}'></span></div>
			<div class='list'><span class='icon-list'></span></div>
			<div class='trash'><span class='icon-remove {if $item->trash}true{else}false{/if}'></span></div>
		</div>
	</div>
</div>
