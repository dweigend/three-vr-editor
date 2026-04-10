<script lang="ts">
	import type { Snippet } from 'svelte';
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	import { joinClassNames } from '$lib/utils/class-names';

	import { dropdownMenuItemClass } from '../dropdown-menu.svelte';
	import type { DropdownMenuItemProps } from '../types';

	type Props = DropdownMenuItemProps & {
		children?: Snippet;
	};

	let { ref = $bindable(null), class: className = '', children, textValue, ...restProps }: Props =
		$props();
</script>

<DropdownMenuPrimitive.Item
	bind:ref
	{...restProps}
	{textValue}
	class={joinClassNames(dropdownMenuItemClass, className)}
>
	{#if children}
		{@render children()}
	{:else if textValue}
		<span>{textValue}</span>
	{/if}
</DropdownMenuPrimitive.Item>
